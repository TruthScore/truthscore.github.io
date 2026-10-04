import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Plan from "./Plan";
import { SESSION_KEY, saveSession } from "@/lib/auth";
import { future, mockFetch, type Reply } from "@/test/fetch-mock";

const h = vi.hoisted(() => ({ opened: false, redirect: vi.fn() }));

vi.mock("@/lib/redirect", () => ({ redirectTo: h.redirect }));
vi.mock("@/lib/plans", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/plans")>()),
  dedicatedHasOpened: () => h.opened,
}));
// Poll without real 2 s waits.
vi.mock("@/lib/checkout-return", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/checkout-return")>();
  return {
    ...mod,
    pollForPaidPlan: (f: Parameters<typeof mod.pollForPaidPlan>[0], o: Parameters<typeof mod.pollForPaidPlan>[1] = {}) =>
      mod.pollForPaidPlan(f, { ...o, attempts: 3, sleep: () => Promise.resolve() }),
  };
});

const profile = (plan: string) => ({ status: 200, body: { id: "u1", plan, email: "reader@example.com", display_name: null } });
const disabled: Reply = {
  status: 503,
  body: { status: "error", code: "BILLING_DISABLED", message: "Billing is not available yet." },
};

function renderAt(url: string) {
  window.history.replaceState(null, "", url);
  return render(
    <MemoryRouter>
      <Plan />
    </MemoryRouter>,
  );
}
const signIn = () => saveSession({ access_token: "at", refresh_token: "rt", expires_at: future() });

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  h.opened = false;
  h.redirect.mockReset();
});
afterEach(cleanup);

describe("/account/plan — signed out", () => {
  it("before 7 October keeps today's copy and offers sign-in, without calling the engine", async () => {
    const { fn } = mockFetch({});
    renderAt("/account/plan");
    expect(await screen.findByRole("heading", { level: 1 })).toHaveProperty("textContent", "Dedicated opens 7 October");
    expect(screen.getByText("Opens 7 October.")).toBeTruthy();
    expect(screen.getByText("Email me when it opens")).toBeTruthy();
    expect(screen.queryByText("Upgrade to Dedicated")).toBeNull();
    fireEvent.click(screen.getByText("Continue with Google"));
    const url = new URL(h.redirect.mock.calls[0][0]);
    expect(url.pathname).toBe("/auth/v1/authorize");
    expect(url.searchParams.get("provider")).toBe("google");
    expect(url.searchParams.get("redirect_to")).toBe(`${window.location.origin}/account/plan`);
    expect(fn).not.toHaveBeenCalled();
  });

  it("after the opening day asks the visitor to sign in to upgrade", async () => {
    h.opened = true;
    mockFetch({});
    renderAt("/account/plan");
    expect(await screen.findByText("Sign in above to upgrade.")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Plans");
  });

  it("stores the session from the OAuth return and strips the tokens from the URL", async () => {
    mockFetch({ "GET /user/profile": profile("free") });
    renderAt("/account/plan#access_token=at&refresh_token=rt&expires_in=3600&token_type=bearer");
    expect(await screen.findByText("Your plan: Free")).toBeTruthy();
    expect(window.location.hash).toBe("");
    expect(JSON.parse(localStorage.getItem(SESSION_KEY)!).access_token).toBe("at");
  });
});

describe("/account/plan — free user", () => {
  it("shows the current plan and sends Upgrade to Stripe Checkout", async () => {
    signIn();
    const { calls } = mockFetch({
      "GET /user/profile": profile("free"),
      "POST /billing/checkout": {
        status: 200,
        body: { status: "success", data: { url: "https://checkout.stripe.com/c/pay/cs_1", session_id: "cs_1" } },
      },
    });
    renderAt("/account/plan");
    expect(await screen.findByText("Your plan: Free")).toBeTruthy();
    expect(screen.getByText("reader@example.com")).toBeTruthy();
    expect(screen.queryByText("Manage subscription")).toBeNull();
    fireEvent.click(screen.getByText("Upgrade to Dedicated"));
    await waitFor(() => expect(h.redirect).toHaveBeenCalledWith("https://checkout.stripe.com/c/pay/cs_1"));
    const checkout = calls.find((c) => c.url.endsWith("/billing/checkout"))!;
    expect(checkout.init.headers).toMatchObject({ Authorization: "Bearer at" });
  });

  it("on 503 BILLING_DISABLED falls back to the 'opens 7 October' copy", async () => {
    signIn();
    mockFetch({ "GET /user/profile": profile("free"), "POST /billing/checkout": disabled });
    renderAt("/account/plan");
    fireEvent.click(await screen.findByText("Upgrade to Dedicated"));
    expect(await screen.findByText("Dedicated isn't on sale yet. It opens 7 October.")).toBeTruthy();
    expect(screen.getByText("Opens 7 October.")).toBeTruthy();
    expect(screen.getByText("Email me when it opens")).toBeTruthy();
    expect(screen.queryByText("Upgrade to Dedicated")).toBeNull();
    expect(h.redirect).not.toHaveBeenCalled();
  });

  it("remembers billing is closed for the rest of the browser session", async () => {
    signIn();
    sessionStorage.setItem("truthscore_billing_closed", "1");
    mockFetch({ "GET /user/profile": profile("free") });
    renderAt("/account/plan");
    expect(await screen.findByText("Your plan: Free")).toBeTruthy();
    expect(screen.getByText("Opens 7 October.")).toBeTruthy();
    expect(screen.queryByText("Upgrade to Dedicated")).toBeNull();
  });

  it("shows the provider error when checkout fails", async () => {
    signIn();
    mockFetch({
      "GET /user/profile": profile("free"),
      "POST /billing/checkout": {
        status: 502,
        body: { status: "error", code: "BILLING_PROVIDER_ERROR", message: "The payment provider could not be reached. Try again shortly." },
      },
    });
    renderAt("/account/plan");
    fireEvent.click(await screen.findByText("Upgrade to Dedicated"));
    expect(
      await screen.findByText("Couldn't start checkout. The payment provider could not be reached. Try again shortly."),
    ).toBeTruthy();
    expect(screen.getByText("Upgrade to Dedicated")).toBeTruthy();
  });

  it("an expired session that can't be refreshed returns to sign-in", async () => {
    signIn();
    mockFetch({
      "GET /user/profile": { status: 401, body: { status: "error", code: "INVALID_TOKEN", message: "bad" } },
      "POST /auth/v1/token": { status: 400, body: {} },
    });
    renderAt("/account/plan");
    expect(await screen.findByText("Your session has ended. Sign in again to see your plan.")).toBeTruthy();
    expect(screen.getByText("Continue with GitHub")).toBeTruthy();
  });
});

describe("/account/plan — paid user", () => {
  it("offers Manage subscription, which opens the Stripe portal", async () => {
    signIn();
    mockFetch({
      "GET /user/profile": profile("dedicated"),
      "POST /billing/portal": { status: 200, body: { status: "success", data: { url: "https://billing.stripe.com/p/session/x" } } },
    });
    renderAt("/account/plan");
    expect(await screen.findByText("Your plan: Dedicated")).toBeTruthy();
    expect(screen.queryByText("Upgrade to Dedicated")).toBeNull();
    expect(screen.getByText("Your plan")).toBeTruthy(); // badge on the Dedicated card
    fireEvent.click(screen.getByText("Manage subscription"));
    await waitFor(() => expect(h.redirect).toHaveBeenCalledWith("https://billing.stripe.com/p/session/x"));
  });

  it("explains a plan with no Stripe subscription behind it", async () => {
    signIn();
    mockFetch({
      "GET /user/profile": profile("dedicated"),
      "POST /billing/portal": {
        status: 404,
        body: { status: "error", code: "NO_BILLING_ACCOUNT", message: "This account has no subscription to manage." },
      },
    });
    renderAt("/account/plan");
    fireEvent.click(await screen.findByText("Manage subscription"));
    expect(await screen.findByText(/isn't billed through Stripe/)).toBeTruthy();
  });

  it("explains when billing is switched off", async () => {
    signIn();
    mockFetch({ "GET /user/profile": profile("dedicated"), "POST /billing/portal": disabled });
    renderAt("/account/plan");
    fireEvent.click(await screen.findByText("Manage subscription"));
    expect(await screen.findByText(/Subscription management isn't available yet/)).toBeTruthy();
  });
});

describe("/account/plan — Stripe returns", () => {
  it("?checkout=success polls until the webhook lands, then confirms", async () => {
    signIn();
    const { calls } = mockFetch({
      "GET /user/profile": [profile("free"), profile("free"), profile("dedicated")],
    });
    renderAt("/account/plan?checkout=success");
    expect(await screen.findByText(/Waiting for Stripe to confirm/)).toBeTruthy();
    expect(await screen.findByText("Dedicated is active on your account. Thank you for subscribing.")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Your plan: Dedicated");
    expect(calls.filter((c) => c.url.endsWith("/user/profile")).length).toBe(3);
    expect(window.location.search).toBe("");
  });

  it("?checkout=success says so plainly when the plan hasn't updated yet", async () => {
    signIn();
    mockFetch({ "GET /user/profile": [profile("free"), profile("free"), profile("free"), profile("free"), profile("dedicated")] });
    renderAt("/account/plan?checkout=success");
    expect(await screen.findByText(/your plan hasn't updated yet/)).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Your plan: Free");
    fireEvent.click(screen.getByText("Check again"));
    expect(await screen.findByText("Dedicated is active on your account. Thank you for subscribing.")).toBeTruthy();
  });

  it("?checkout=cancel says nothing was charged", async () => {
    signIn();
    mockFetch({ "GET /user/profile": profile("free") });
    renderAt("/account/plan?checkout=cancel");
    expect(await screen.findByText("Checkout cancelled. You haven't been charged.")).toBeTruthy();
    expect(screen.getByText("Your plan: Free")).toBeTruthy();
  });

  it("?checkout=success while signed out asks for the paying account", async () => {
    mockFetch({});
    renderAt("/account/plan?checkout=success");
    expect(await screen.findByText(/Sign in with the account you paid with/)).toBeTruthy();
  });
});
