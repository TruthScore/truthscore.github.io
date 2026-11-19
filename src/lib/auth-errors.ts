// Supabase reports a failed OAuth return as error/error_code in the query or fragment. Only the
// code is read, and it picks one of our own messages: text from the address bar is never shown.
const AUTH_ERROR_COPY: Record<string, string> = {
  access_denied: "Sign-in was cancelled. You can try again below.",
  flow_state_expired: "That sign-in link expired. Please try again.",
  flow_state_not_found: "That sign-in link expired. Please try again.",
  bad_oauth_state: "Sign-in didn't complete. Please try again.",
  bad_oauth_callback: "Sign-in didn't complete. Please try again.",
  server_error: "Sign-in didn't complete because of a problem on our side. Please try again.",
  temporarily_unavailable: "Sign-in is temporarily unavailable. Please try again in a few minutes.",
};
const has = (k: string) => Object.prototype.hasOwnProperty.call(AUTH_ERROR_COPY, k);
export const AUTH_ERROR_FALLBACK = "Sign-in didn't complete. Please try again.";

export function readAuthError(search: string, hash: string): string | null {
  const q = new URLSearchParams(search.replace(/^\?/, ""));
  const h = new URLSearchParams(hash.replace(/^#/, ""));
  const error = h.get("error") || q.get("error");
  if (!error) return null;
  const code = h.get("error_code") || q.get("error_code");
  return (
    (code && has(code) ? AUTH_ERROR_COPY[code] : null) ??
    (has(error) ? AUTH_ERROR_COPY[error] : AUTH_ERROR_FALLBACK)
  );
}
