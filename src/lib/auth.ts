// Website sign-in against the same Supabase project as the extension and the engine.
// Talks to the Supabase Auth REST API directly (no SDK), mirroring the extension's
// background/auth.js: OAuth via /auth/v1/authorize (implicit flow, tokens come back in
// the URL fragment), refresh via /auth/v1/token, sign-out via /auth/v1/logout.
//
// The session lives in localStorage on truthscore.ai only. It is never sent anywhere
// except Supabase (refresh/logout) and the engine (as the Bearer token).

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

export type Provider = "google" | "github";

export type Session = {
  access_token: string;
  refresh_token: string;
  /** Unix seconds. */
  expires_at: number;
};

export const SESSION_KEY = "truthscore_web_session";
const REFRESH_BUFFER_SECONDS = 60;

const nowSeconds = () => Math.floor(Date.now() / 1000);

// Set just before we send the browser to Supabase and checked when it comes back, so tokens in a
// fragment we didn't ask for (a crafted link signing the visitor into someone else's account) are
// ignored. sessionStorage survives the same-tab round trip through the OAuth provider.
const PENDING_KEY = "truthscore_web_auth_pending";

export function markSignInStarted(): void {
  try {
    window.sessionStorage.setItem(PENDING_KEY, "1");
  } catch {
    // Storage blocked: consumeAuthRedirect can't check, and falls back to accepting.
  }
}

/** True when this tab started a sign-in (or storage is unavailable to tell). Clears the mark. */
function takeSignInMark(): boolean {
  try {
    const pending = window.sessionStorage.getItem(PENDING_KEY) === "1";
    window.sessionStorage.removeItem(PENDING_KEY);
    return pending;
  } catch {
    return true;
  }
}

export function authorizeUrl(provider: Provider, redirectTo: string): string {
  return (
    `${SUPABASE_URL}/auth/v1/authorize` +
    `?provider=${encodeURIComponent(provider)}` +
    `&redirect_to=${encodeURIComponent(redirectTo)}`
  );
}

export function loadSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (typeof s?.access_token !== "string" || typeof s?.refresh_token !== "string") return null;
    return { access_token: s.access_token, refresh_token: s.refresh_token, expires_at: Number(s.expires_at) || 0 };
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    memorySession = null;
  } catch {
    // Storage blocked (private mode, site data off): the session lasts for this page only.
    memorySession = session;
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
  memorySession = null;
}

// Fallback for browsers where localStorage throws.
let memorySession: Session | null = null;
const currentSession = () => loadSession() ?? memorySession;

export type RedirectResult = { kind: "signed-in" } | { kind: "error"; message: string } | null;

/**
 * Read the OAuth return from the URL fragment (or query, where Supabase puts some errors).
 * Stores the session on success. Returns null when the URL carries no auth result.
 * The caller removes the fragment from the address bar.
 */
export function consumeAuthRedirect(hash: string, search = ""): RedirectResult {
  const h = new URLSearchParams(hash.replace(/^#/, ""));
  const q = new URLSearchParams(search.replace(/^\?/, ""));
  const accessToken = h.get("access_token");
  const refreshToken = h.get("refresh_token");
  if (accessToken || refreshToken || h.get("error") || q.get("error")) {
    if (!takeSignInMark()) return { kind: "error", message: "this sign-in link didn't start here. Use the buttons below to sign in." };
  }
  if (accessToken && refreshToken) {
    const expiresAt =
      Number(h.get("expires_at")) || nowSeconds() + (Number(h.get("expires_in")) || 3600);
    saveSession({ access_token: accessToken, refresh_token: refreshToken, expires_at: expiresAt });
    return { kind: "signed-in" };
  }
  const error = h.get("error") || q.get("error");
  if (error) {
    const description = h.get("error_description") || q.get("error_description");
    return { kind: "error", message: description || error.replace(/_/g, " ") };
  }
  return null;
}

/** Exchange the refresh token. Clears the session on an auth failure (4xx); keeps it on a network blip. */
export async function refreshSession(): Promise<Session | null> {
  const session = currentSession();
  if (!session) return null;
  let res: Response;
  try {
    res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
  } catch {
    return null;
  }
  if (!res.ok) {
    if (res.status >= 400 && res.status < 500) clearSession();
    return null;
  }
  const data = await res.json().catch(() => null);
  if (!data?.access_token || !data?.refresh_token) return null;
  const next: Session = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Number(data.expires_at) || nowSeconds() + (Number(data.expires_in) || 3600),
  };
  saveSession(next);
  return next;
}

/** A usable access token, refreshed first when it is expired or about to be. Null when signed out. */
export async function getAccessToken(opts: { forceRefresh?: boolean } = {}): Promise<string | null> {
  const session = currentSession();
  if (!session) return null;
  if (opts.forceRefresh || session.expires_at - nowSeconds() <= REFRESH_BUFFER_SECONDS) {
    const refreshed = await refreshSession();
    return refreshed?.access_token ?? null;
  }
  return session.access_token;
}

export function hasSession(): boolean {
  return currentSession() !== null;
}

/** Revoke the session at Supabase (best effort) and forget it locally either way. */
export async function signOut(): Promise<void> {
  const session = currentSession();
  clearSession();
  if (!session) return;
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` },
    });
  } catch {
    // The local session is already gone; the token expires on its own.
  }
}
