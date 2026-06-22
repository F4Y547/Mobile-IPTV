import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { parseM3U, extractCategories } from './m3u-parser.ts';
import { XtreamClient } from './xtream-client.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const ENCRYPTION_SECRET = Deno.env.get('ENCRYPTION_SECRET') || '';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const REQUEST_TIMEOUT = 30000; // 30 seconds

function isPrivateIP(hostname: string): boolean {
  const privatePatterns = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^0\./,
    /^localhost$/i,
    /^::$/,
    /^::1$/,
    /^fc00:/,
    /^fe80:/,
  ];
  return privatePatterns.some((p) => p.test(hostname));
}

function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }
    if (isPrivateIP(parsed.hostname)) {
      return { valid: false, error: 'Local/private network URLs are not allowed' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

function sanitizeMetadata(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[<>"'&]/g, '')
    .replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]/g, '')
    .trim();
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

    const { playlistId, type, m3uUrl, epgUrl, serverUrl, username, password } = await req.json();

    if (!playlistId || !type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Rate limit check: max 5 imports per hour per user
    const { count: recentCount } = await supabase
      .from('playlists')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('last_synced_at', new Date(Date.now() - 3600000).toISOString());

    if (recentCount && recentCount >= 5) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Max 5 imports per hour.' }),
        { status: 429 },
      );
    }

    await supabase.from('playlists').update({
      status: 'active',
      last_synced_at: new Date().toISOString(),
    }).eq('id', playlistId);

    let channels: any[] = [];
    let movies: any[] = [];
    let series: any[] = [];
    let episodes: any[] = [];

    if (type === 'm3u') {
      if (!m3uUrl) {
        return new Response(JSON.stringify({ error: 'M3U URL required' }), { status: 400 });
      }

      const urlValidation = validateUrl(m3uUrl);
      if (!urlValidation.valid) {
        return new Response(JSON.stringify({ error: urlValidation.error }), { status: 400 });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      let response: Response;
      try {
        response = await fetch(m3uUrl, {
          signal: controller.signal,
          headers: { 'User-Agent': 'SYNTV-Online/2.0' },
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch playlist`);
      }

      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
        throw new Error('Playlist file too large. Maximum size is 50MB.');
      }

      const text = await response.text();
      if (!text.includes('#EXTM3U')) {
        throw new Error('Invalid M3U file: missing #EXTM3U header');
      }

      const parsedChannels = parseM3U(text);
      channels = parsedChannels.map((ch: any, i: number) => ({
        user_id: user.id,
        playlist_id: playlistId,
        name: sanitizeMetadata(ch.name),
        logo_url: ch.tvgLogo || null,
        stream_url: ch.streamUrl,
        category: sanitizeMetadata(ch.category || 'Uncategorized'),
        tvg_id: ch.tvgId || null,
        tvg_name: ch.tvgName || null,
        country: ch.country || null,
        language: ch.language || null,
        is_active: true,
      }));
    } else if (type === 'xtream') {
      if (!serverUrl || !username || !password) {
        return new Response(JSON.stringify({ error: 'Xtream credentials required' }), { status: 400 });
      }

      const urlValidation = validateUrl(serverUrl);
      if (!urlValidation.valid) {
        return new Response(JSON.stringify({ error: urlValidation.error }), { status: 400 });
      }

      const xtream = new XtreamClient(serverUrl, username, password);

      const [liveStreams, movieStreams, seriesStreams] = await Promise.all([
        xtream.getLiveStreams(),
        xtream.getVodStreams(),
        xtream.getSeries(),
      ]);

      channels = (liveStreams || []).map((s: any) => ({
        user_id: user.id,
        playlist_id: playlistId,
        name: sanitizeMetadata(s.name || 'Unknown'),
        logo_url: s.stream_icon || null,
        stream_url: `${serverUrl.replace(/\/+$/, '')}/live/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${s.stream_id}.m3u8`,
        category: sanitizeMetadata(s.category || 'Live TV'),
        tvg_id: s.epg_channel_id || null,
        tvg_name: s.name || null,
        is_active: true,
      }));

      movies = (movieStreams || []).map((s: any) => ({
        user_id: user.id,
        playlist_id: playlistId,
        title: sanitizeMetadata(s.name || 'Unknown'),
        poster_url: s.stream_icon || null,
        stream_url: `${serverUrl.replace(/\/+$/, '')}/movie/${encodeURIComponent(username)}/${encodeURIComponent(password)}/${s.stream_id}.${s.container_extension || 'mp4'}`,
        category: sanitizeMetadata(s.category || 'Movie'),
        year: s.year || null,
        rating: s.rating || null,
        description: sanitizeMetadata(s.plot || ''),
      }));

      series = (seriesStreams || []).map((s: any) => ({
        user_id: user.id,
        playlist_id: playlistId,
        title: sanitizeMetadata(s.name || 'Unknown'),
        poster_url: s.cover || null,
        category: sanitizeMetadata(s.genre || 'Series'),
        description: sanitizeMetadata(s.plot || ''),
      }));
    }

    // Batch insert with proper cleanup
    if (channels.length > 0) {
      await supabase.from('channels').delete().eq('playlist_id', playlistId);
      for (let i = 0; i < channels.length; i += 500) {
        const batch = channels.slice(i, i + 500);
        const { error: insertError } = await supabase.from('channels').insert(batch);
        if (insertError) {
          console.error('Channel insert error:', insertError);
        }
      }
    }

    if (movies.length > 0) {
      await supabase.from('movies').delete().eq('playlist_id', playlistId);
      for (let i = 0; i < movies.length; i += 500) {
        const batch = movies.slice(i, i + 500);
        await supabase.from('movies').insert(batch);
      }
    }

    if (series.length > 0) {
      await supabase.from('series').delete().eq('playlist_id', playlistId);
      for (let i = 0; i < series.length; i += 500) {
        const batch = series.slice(i, i + 500);
        await supabase.from('series').insert(batch);
      }
    }

    // Update playlist counts
    await supabase.from('playlists').update({
      total_channels: channels.length,
      total_movies: movies.length,
      total_series: series.length,
      last_synced_at: new Date().toISOString(),
      status: 'active',
    }).eq('id', playlistId);

    return new Response(
      JSON.stringify({
        success: true,
        channels: channels.length,
        movies: movies.length,
        series: series.length,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('process-playlist error:', err);

    // Update playlist status on error
    try {
      const body = await req.json().catch(() => ({}));
      if (body.playlistId) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: { persistSession: false },
        });
        await supabase.from('playlists').update({
          status: 'error',
          error_message: err.message?.substring(0, 500),
        }).eq('id', body.playlistId);
      }
    } catch {}

    return new Response(
      JSON.stringify({ error: err.message || 'Failed to process playlist' }),
      { status: 500 },
    );
  }
});
