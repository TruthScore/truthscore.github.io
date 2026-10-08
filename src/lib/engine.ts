// Calls to the TruthScore engine with the signed-in user's Bearer token.
// All billing logic stays in the engine (E#37); the site only asks it for a Stripe URL.
//
// Contracts (engine PR #129, src/controllers/billing.controller.ts):
//   GET  /user/profile     -> 200 { id, plan, email, display_name, ... }  (bare object)
//   POST /billing/checkout -> 200 { status: "success", data: { url, session_id } }
//   POST /billing/portal   -> 200 { status: "success", data: { url } }
//   errors                 -> { status: "error", code, message }
//     503 BILLING_DISABLED (billing switched off), 409 ALREADY_SUBSCRIBED,
//     404 NO_BILLING_ACCOUNT (portal, no Stripe customer), 502 BILLING_PROVIDER_ERROR, 401 auth.

import { API_BASE } from "./config";
import { getSupabase } from "./supabase";

export type PlanId = "free" | "dedicated" | "expert";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  plan: PlanId;
};

export type EngineError = { status: number; code: string; message: string };
export type EngineResult<T> = { ok: true; data: T } | { ok: false; error: EngineError };

const NETWORK_ERROR: EngineError = {
  status: 0,
  code: "NETWORK_ERROR",
  message: "Couldn't reach TruthScore. Check your connection and try again.",
};
const SIGNED_OUT: EngineError = { status: 401, code: "MISSING_AUTH", message: "Sign in to continue." };

/**
 * The shared session's access token (same client and session as /support). getSession() refreshes an
 * expired token itself; forceRefresh asks Supabase for a new one after the engine rejected the old one.
 */
async function getAccessToken(opts: { forceRefresh?: boolean } = {}): Promise<string | null> {
  try {
    const { auth } = getSupabase();
    const { data } = opts.forceRefresh ? await auth.refreshSession() : await auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

async function call(path: string, init: RequestInit, retried = false): Promise<EngineResult<unknown>> {
  const token = await getAccessToken({ forceRefresh: retried });
  if (!token) return { ok: false, error: SIGNED_OUT };
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
    });
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
  // A token the engine rejects may just be stale: refresh once and retry.
  if (res.status === 401 && !retried) return call(path, init, true);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return {
      ok: false,
      error: {
        status: res.status,
        code: typeof body?.code === "string" ? body.code : `HTTP_${res.status}`,
        message: typeof body?.message === "string" ? body.message : "Something went wrong. Try again.",
      },
    };
  }
  return { ok: true, data: body };
}

function asPlan(v: unknown): PlanId {
  return v === "dedicated" || v === "expert" ? v : "free";
}

export async function fetchProfile(): Promise<EngineResult<Profile>> {
  const r = await call("/user/profile", { method: "GET" });
  if (r.ok === false) return { ok: false, error: r.error };
  const p = (r.data ?? {}) as Record<string, unknown>;
  return {
    ok: true,
    data: {
      id: String(p.id ?? ""),
      email: typeof p.email === "string" ? p.email : null,
      display_name: typeof p.display_name === "string" ? p.display_name : null,
      plan: asPlan(p.plan),
    },
  };
}

const STRIPE_HOSTS = new Set(["checkout.stripe.com", "billing.stripe.com"]);

export function isStripeUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" && STRIPE_HOSTS.has(u.hostname) && !u.username && !u.password && (u.port === "" || u.port === "443");
  } catch {
    return false;
  }
}

async function postForUrl(path: string, body: unknown): Promise<EngineResult<{ url: string }>> {
  const r = await call(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (r.ok === false) return { ok: false, error: r.error };
  const url = (r.data as { data?: { url?: unknown } } | null)?.data?.url;
  // Only ever leave the site for Stripe's own hosted pages.
  if (!isStripeUrl(url)) {
    return { ok: false, error: { status: 502, code: "BAD_RESPONSE", message: "Billing returned no link. Try again." } };
  }
  return { ok: true, data: { url } };
}

export const startCheckout = (plan: Exclude<PlanId, "free"> = "dedicated") =>
  postForUrl("/billing/checkout", { plan });

export const openPortal = () => postForUrl("/billing/portal", {});

export const isPaid = (plan: PlanId) => plan !== "free";
