import { getSupabase, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase";
import { SIGN_OUT_EVERYWHERE_SCOPE, SIGN_OUT_SCOPE } from "@/lib/config";

/**
 * "Sign out everywhere": true only after the server confirmed it ended every session of the
 * account; then this browser's copy is dropped too. With no usable session, or if the call
 * fails, it returns false and leaves this browser signed in, so the user can retry and is never
 * told other devices are signed out when they aren't.
 */
export async function signOutEverywhere(): Promise<boolean> {
  const sb = getSupabase();
  let token: string | undefined;
  try {
    token = (await sb.auth.getSession()).data.session?.access_token; // refreshes an expiring token
  } catch {
    token = undefined;
  }
  if (!token) return false;
  let ok = false;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/logout?scope=${SIGN_OUT_EVERYWHERE_SCOPE}`, {
      method: "POST",
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` },
    });
    ok = res.ok;
  } catch {
    ok = false;
  }
  if (!ok) return false;
  // Every session is already ended; this only clears the local copy.
  await sb.auth.signOut({ scope: SIGN_OUT_SCOPE }).catch(() => undefined);
  return true;
}
