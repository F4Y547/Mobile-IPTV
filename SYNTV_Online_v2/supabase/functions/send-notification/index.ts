import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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

    // Check admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const { type, targetUserId, title, body } = await req.json();

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'Title and body required' }), { status: 400 });
    }

    // Currently supported: in-app notification via announcements table
    // For push notifications, integrate with Expo Push API or Firebase Cloud Messaging
    if (type === 'announcement') {
      const { error: insertError } = await supabase.from('announcements').insert({
        title,
        message: body,
        type: 'info',
        is_active: true,
      });

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({ success: true, type: 'announcement' }),
        { headers: { 'Content-Type': 'application/json' } },
      );
    }

    // For push notifications, you would send via Expo Push API:
    // const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: pushToken,
    //     sound: 'default',
    //     title,
    //     body,
    //     data: { type },
    //   }),
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification processed',
        note: 'Push notifications require Expo Push Token integration in the mobile app',
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err: any) {
    console.error('send-notification error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      { status: 500 },
    );
  }
});
