// Handling the return from Stripe Checkout (?checkout=success|cancel, set by the engine's
// BILLING_SUCCESS_URL / BILLING_CANCEL_URL). Stripe redirects before its webhook has
// necessarily reached the engine, so on success the plan can still read "free" for a few
// seconds. We poll the profile briefly and say plainly if it hasn't caught up yet.

import type { EngineResult, Profile } from "./engine";

export type CheckoutReturn = "success" | "cancel" | null;

export function readCheckoutReturn(search: string): CheckoutReturn {
  const v = new URLSearchParams(search).get("checkout");
  return v === "success" || v === "cancel" ? v : null;
}

export const POLL_ATTEMPTS = 10;
export const POLL_INTERVAL_MS = 2000;

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Re-fetch the profile until the plan is paid or the attempts run out.
 * Resolves with the last profile seen (null if every fetch failed) and whether it is paid.
 * `isCancelled` lets the page stop polling when it unmounts.
 */
export async function pollForPaidPlan(
  fetchProfile: () => Promise<EngineResult<Profile>>,
  opts: {
    attempts?: number;
    intervalMs?: number;
    sleep?: (ms: number) => Promise<void>;
    isCancelled?: () => boolean;
  } = {},
): Promise<{ profile: Profile | null; paid: boolean }> {
  const attempts = opts.attempts ?? POLL_ATTEMPTS;
  const sleep = opts.sleep ?? defaultSleep;
  let last: Profile | null = null;
  for (let i = 0; i < attempts; i++) {
    if (i > 0) await sleep(opts.intervalMs ?? POLL_INTERVAL_MS);
    if (opts.isCancelled?.()) break;
    const r = await fetchProfile();
    if (r.ok) {
      last = r.data;
      if (r.data.plan !== "free") return { profile: last, paid: true };
    }
  }
  return { profile: last, paid: false };
}
