import { vi } from "vitest";

export type FakeSession = { access_token: string; refresh_token: string; expires_at: number };

/** Stand-in for the shared supabase-js client (src/lib/supabase.ts). Tests drive `state`. */
export const state: {
  session: FakeSession | null;
  refreshed: FakeSession | null; // what refreshSession() hands back (null = refresh fails)
} = { session: null, refreshed: null };

export const auth = {
  getSession: vi.fn(async () => ({ data: { session: state.session }, error: null })),
  refreshSession: vi.fn(async () => {
    if (!state.refreshed) {
      state.session = null;
      return { data: { session: null }, error: { message: "refresh failed" } };
    }
    state.session = state.refreshed;
    return { data: { session: state.session }, error: null };
  }),
  signInWithOAuth: vi.fn(async () => ({ data: {}, error: null })),
  signOut: vi.fn(async () => {
    state.session = null;
    return { error: null };
  }),
  onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
};

export const fakeClient = { auth };

export function resetFakeSupabase() {
  state.session = null;
  state.refreshed = null;
  Object.values(auth).forEach((f) => f.mockClear());
}

export const signIn = (token = "at") => {
  state.session = { access_token: token, refresh_token: "rt", expires_at: Math.floor(Date.now() / 1000) + 3600 };
};
