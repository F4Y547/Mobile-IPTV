const SUPABASE_URL = window.__ENV__?.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.__ENV__?.SUPABASE_ANON_KEY || '';

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

async function adminFetch(endpoint, options = {}) {
  const session = (await supabase.auth.getSession()).data.session;
  if (!session) throw new Error('Not authenticated');

  const url = `${SUPABASE_URL}/functions/v1/${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  return response.json();
}

async function adminQuery(table, options = {}) {
  const session = (await supabase.auth.getSession()).data.session;
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from(table)
    .select(options.select || '*', options.count ? { count: 'exact' } : undefined)
    .maybeSingle(options.single || false)
    .order(options.orderBy || 'created_at', { ascending: false });

  if (error) throw error;
  return data;
}
