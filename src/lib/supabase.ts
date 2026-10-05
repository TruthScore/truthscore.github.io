import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Public by design: the same project URL + publishable key the extension and mobile app ship.
const SUPABASE_URL = 'https://zriwnsyztsxleersftux.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_8CSMM8dJ2F92dqlT8bGHoA_4VvErcdY';

let client: SupabaseClient | null = null;
/** Created on first use, so only the /support route ever loads auth. */
export function getSupabase(): SupabaseClient {
  client ??= createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true },
  });
  return client;
}
