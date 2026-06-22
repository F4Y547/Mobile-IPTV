import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { XMLParser } from 'https://esm.sh/fast-xml-parser@4.5.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

interface EPGProgram {
  user_id: string;
  playlist_id: string;
  channel_id: string | null;
  tvg_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  category: string;
}

function parseXmltvDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  const cleaned = dateStr.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6');
  if (cleaned.endsWith('Z') || cleaned.includes('+')) {
    return cleaned;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(cleaned)) {
    return cleaned + 'Z';
  }
  return new Date().toISOString();
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { playlistId, epgUrl } = await req.json();

    if (!playlistId || !epgUrl) {
      return new Response(JSON.stringify({ error: 'playlistId and epgUrl required' }), { status: 400 });
    }

    // Validate URL
    try {
      const parsed = new URL(epgUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid EPG URL' }), { status: 400 });
    }

    // Verify playlist ownership
    const { data: playlist } = await supabase
      .from('playlists')
      .select('id, user_id')
      .eq('id', playlistId)
      .single();

    if (!playlist) {
      return new Response(JSON.stringify({ error: 'Playlist not found' }), { status: 404 });
    }

    // Fetch EPG XML
    const response = await fetch(epgUrl, {
      signal: AbortSignal.timeout(30000),
      headers: { 'User-Agent': 'SYNTV-Online/2.0' },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch EPG`);
    }

    const xml = await response.text();

    // Parse XMLTV
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      isArray: (name) => ['programme', 'channel'].includes(name),
    });

    const result = parser.parse(xml);
    const programmes = result?.tv?.programme || [];

    if (programmes.length === 0) {
      return new Response(JSON.stringify({ error: 'No programmes found in EPG' }), { status: 400 });
    }

    // Get user's channels to match tvg_id
    const { data: channels } = await supabase
      .from('channels')
      .select('id, tvg_id')
      .eq('playlist_id', playlistId);

    const channelMap = new Map<string, string>();
    (channels || []).forEach((ch) => {
      if (ch.tvg_id) channelMap.set(ch.tvg_id, ch.id);
    });

    // Delete old EPG data for this playlist
    await supabase.from('epg_programs').delete().eq('playlist_id', playlistId);

    // Insert new EPG data
    const programs: EPGProgram[] = [];
    for (const prog of programmes) {
      try {
        const tvgId = prog['@_channel'] || '';
        const channelId = channelMap.get(tvgId) || null;
        const startTime = parseXmltvDate(prog['@_start'] || '');
        const endTime = parseXmltvDate(prog['@_stop'] || '');

        programs.push({
          user_id: playlist.user_id,
          playlist_id: playlistId,
          channel_id: channelId,
          tvg_id: tvgId,
          title: (prog.title?.['#text'] || prog.title || 'Unknown').toString().substring(0, 500),
          description: (prog.desc?.['#text'] || prog.desc || '').toString().substring(0, 2000),
          start_time: startTime,
          end_time: endTime,
          category: (prog.category?.['#text'] || prog.category || '').toString().substring(0, 100),
        });
      } catch {
        // Skip malformed programmes
      }
    }

    // Batch insert
    let insertedCount = 0;
    for (let i = 0; i < programs.length; i += 500) {
      const batch = programs.slice(i, i + 500);
      const { error: insertError } = await supabase.from('epg_programs').insert(batch);
      if (!insertError) {
        insertedCount += batch.length;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        programmes: insertedCount,
        total: programs.length,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('process-epg error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to process EPG' }),
      { status: 500 },
    );
  }
});
