import { beforeEach, describe, expect, it } from "vitest";
import { saveSession } from "./auth";
import { fetchProfile, openPortal, startCheckout } from "./engine";
import { future, mockFetch } from "@/test/fetch-mock";

const signIn = () => saveSession({ access_token: "at", refresh_token: "rt", expires_at: future() });

beforeEach(() => localStorage.clear());

describe("engine client", () => {
  it("is signed-out without a session and never calls the engine", async () => {
    const { fn } = mockFetch({});
    const r = await startCheckout();
    expect(r).toMatchObject({ ok: false, error: { status: 401 } });
    expect(fn).not.toHaveBeenCalled();
  });

  it("reads the bare /user/profile object and sends the Bearer token", async () => {
    signIn();
    const { calls } = mockFetch({
      "GET /api/v1/user/profile": { status: 200, body: { id: "u1", plan: "dedicated", email: "a@b.c", display_name: null } },
    });
    const r = await fetchProfile();
    expect(r).toEqual({ ok: true, data: { id: "u1", plan: "dedicated", email: "a@b.c", display_name: null } });
    expect(calls[0].init.headers).toMatchObject({ Authorization: "Bearer at" });
  });

  it("treats an unknown plan value as free", async () => {
    signIn();
    mockFetch({ "GET /user/profile": { status: 200, body: { id: "u1", plan: "platinum" } } });
    const r = await fetchProfile();
    expect(r.ok && r.data.plan).toBe("free");
  });

  it("POSTs /billing/checkout for Dedicated and returns the Stripe URL", async () => {
    signIn();
    const { calls } = mockFetch({
      "POST /api/v1/billing/checkout": {
        status: 200,
        body: { status: "success", data: { url: "https://checkout.stripe.com/c/pay/cs_1", session_id: "cs_1" } },
      },
    });
    expect(await startCheckout()).toEqual({ ok: true, data: { url: "https://checkout.stripe.com/c/pay/cs_1" } });
    expect(JSON.parse(calls[0].init.body as string)).toEqual({ plan: "dedicated" });
  });

  it("passes the engine's error code through (503 BILLING_DISABLED)", async () => {
    signIn();
    mockFetch({
      "POST /billing/checkout": {
        status: 503,
        body: { status: "error", code: "BILLING_DISABLED", message: "Billing is not available yet." },
      },
    });
    expect(await startCheckout()).toEqual({
      ok: false,
      error: { status: 503, code: "BILLING_DISABLED", message: "Billing is not available yet." },
    });
  });

  it("refuses a non-https redirect", async () => {
    signIn();
    mockFetch({ "POST /billing/portal": { status: 200, body: { status: "success", data: { url: "javascript:alert(1)" } } } });
    const r = await openPortal();
    expect(r).toMatchObject({ ok: false, error: { code: "BAD_RESPONSE" } });
  });

  it("retries once with a refreshed token after a 401", async () => {
    signIn();
    const { calls } = mockFetch({
      "GET /user/profile": [
        { status: 401, body: { status: "error", code: "INVALID_TOKEN", message: "expired" } },
        { status: 200, body: { id: "u1", plan: "free" } },
      ],
      "POST /auth/v1/token": { status: 200, body: { access_token: "at2", refresh_token: "rt2", expires_in: 3600 } },
    });
    const r = await fetchProfile();
    expect(r.ok).toBe(true);
    expect(calls.map((c) => c.method + " " + new URL(c.url).pathname)).toEqual([
      "GET /api/v1/user/profile",
      "POST /auth/v1/token",
      "GET /api/v1/user/profile",
    ]);
    expect(calls[2].init.headers).toMatchObject({ Authorization: "Bearer at2" });
  });

  it("reports a network failure without throwing", async () => {
    signIn();
    mockFetch({ "GET /user/profile": new TypeError("offline") });
    expect(await fetchProfile()).toMatchObject({ ok: false, error: { code: "NETWORK_ERROR" } });
  });
});
