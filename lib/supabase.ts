import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client (uses anon key) — lazy initialized
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase environment variables are not set');
    _client = createClient(url, key);
  }
  return _client;
}

// Server-side Supabase client (uses service role key — server only)
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server environment variables are not set');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
