import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  SESSION_KEY,
  authorizeUrl,
  consumeAuthRedirect,
  getAccessToken,
  hasSession,
  loadSession,
  markSignInStarted,
  saveSession,
  signOut,
} from "./auth";
import { future, mockFetch } from "@/test/fetch-mock";

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

describe("authorizeUrl", () => {
  it("points at Supabase /authorize with the provider and an encoded redirect", () => {
    const u = new URL(authorizeUrl("github", "https://truthscore.ai/account/plan"));
    expect(u.pathname).toBe("/auth/v1/authorize");
    expect(u.searchParams.get("provider")).toBe("github");
    expect(u.searchParams.get("redirect_to")).toBe("https://truthscore.ai/account/plan");
  });
});

describe("consumeAuthRedirect", () => {
  beforeEach(() => {
    sessionStorage.clear();
    markSignInStarted();
  });

  it("ignores tokens when this tab didn't start a sign-in (login CSRF)", () => {
    sessionStorage.clear();
    const r = consumeAuthRedirect("#access_token=evil&refresh_token=evil&expires_in=3600");
    expect(r).toMatchObject({ kind: "error" });
    expect(hasSession()).toBe(false);
  });

  it("accepts the mark only once", () => {
    consumeAuthRedirect("#access_token=at&refresh_token=rt&expires_in=3600");
    localStorage.clear();
    expect(consumeAuthRedirect("#access_token=x&refresh_token=y&expires_in=3600")).toMatchObject({ kind: "error" });
    expect(hasSession()).toBe(false);
  });

  it("stores the session from an implicit-flow fragment", () => {
    const r = consumeAuthRedirect("#access_token=at&refresh_token=rt&expires_at=2000000000&token_type=bearer");
    expect(r).toEqual({ kind: "signed-in" });
    expect(loadSession()).toEqual({ access_token: "at", refresh_token: "rt", expires_at: 2000000000 });
  });

  it("derives expires_at from expires_in when absent", () => {
    consumeAuthRedirect("#access_token=at&refresh_token=rt&expires_in=3600");
    const s = loadSession()!;
    expect(s.expires_at).toBeGreaterThan(Date.now() / 1000 + 3500);
  });

  it("reports an OAuth error from the fragment or the query", () => {
    expect(consumeAuthRedirect("#error=access_denied&error_description=User+denied")).toEqual({
      kind: "error",
      message: "User denied",
    });
    markSignInStarted();
    expect(consumeAuthRedirect("", "?error=server_error")).toEqual({ kind: "error", message: "server error" });
    expect(hasSession()).toBe(false);
  });

  it("returns null for an ordinary URL", () => {
    expect(consumeAuthRedirect("", "?checkout=success")).toBeNull();
  });
});

describe("getAccessToken", () => {
  it("returns the stored token while it is fresh, without calling Supabase", async () => {
    const { fn } = mockFetch({});
    saveSession({ access_token: "at", refresh_token: "rt", expires_at: future() });
    expect(await getAccessToken()).toBe("at");
    expect(fn).not.toHaveBeenCalled();
  });

  it("refreshes an expiring token and stores the new pair", async () => {
    const { calls } = mockFetch({
      "POST /auth/v1/token": { status: 200, body: { access_token: "at2", refresh_token: "rt2", expires_in: 3600 } },
    });
    saveSession({ access_token: "at", refresh_token: "rt", expires_at: 1 });
    expect(await getAccessToken()).toBe("at2");
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ refresh_token: "rt" });
    expect(loadSession()?.refresh_token).toBe("rt2");
  });

  it("signs the user out when Supabase rejects the refresh token", async () => {
    mockFetch({ "POST /auth/v1/token": { status: 400, body: { error: "invalid_grant" } } });
    saveSession({ access_token: "at", refresh_token: "rt", expires_at: 1 });
    expect(await getAccessToken()).toBeNull();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("keeps the session on a network failure", async () => {
    mockFetch({ "POST /auth/v1/token": new TypeError("offline") });
    saveSession({ access_token: "at", refresh_token: "rt", expires_at: 1 });
    expect(await getAccessToken()).toBeNull();
    expect(hasSession()).toBe(true);
  });
});

describe("signOut", () => {
  it("revokes at Supabase and clears locally, even if the revoke fails", async () => {
    const { calls } = mockFetch({ "POST /auth/v1/logout": new TypeError("offline") });
    saveSession({ access_token: "at", refresh_token: "rt", expires_at: future() });
    await signOut();
    expect(calls[0].init.headers).toMatchObject({ Authorization: "Bearer at" });
    expect(hasSession()).toBe(false);
  });
});
