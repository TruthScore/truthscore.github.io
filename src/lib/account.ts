import { API_BASE, SUPPORT_EMAIL } from './support';

/** The word the user types, and the engine's DELETE /user/account `confirm` value. */
export const CONFIRM_WORD = 'DELETE';

/** Matches the engine's REAUTH_MAX_AGE_S: a deletion needs a sign-in this recent. */
export const REAUTH_MAX_AGE_S = 10 * 60;

/**
 * Seconds since this access token's session signed in (newest `amr` timestamp), or null if it has
 * none. Only decides whether to show the form or ask for a fresh sign-in; the engine re-checks.
 */
export function signInAgeSeconds(token: string, nowMs: number = Date.now()): number | null {
  try {
    const b64 = (token.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64));
    const times: number[] = Array.isArray(payload?.amr)
      ? payload.amr.map((a: { timestamp?: unknown }) => a?.timestamp).filter((t: unknown) => typeof t === 'number')
      : [];
    if (times.length === 0) return null;
    return Math.floor(nowMs / 1000) - Math.max(...times);
  } catch {
    return null;
  }
}

export const needsFreshSignIn = (token: string, nowMs: number = Date.now()) => {
  const age = signInAgeSeconds(token, nowMs);
  return age === null || age > REAUTH_MAX_AGE_S;
};

/** Codes after which the page signs out and asks the user to sign in again. */
export const SIGN_IN_AGAIN = new Set(['REAUTH_REQUIRED', 'MISSING_AUTH', 'INVALID_TOKEN', 'EXPIRED_TOKEN']);

const COPY: Record<string, string> = {
  REAUTH_REQUIRED: 'For your security, please sign in again to delete your account.',
  MISSING_AUTH: 'Please sign in again to delete your account.',
  INVALID_TOKEN: 'Please sign in again to delete your account.',
  EXPIRED_TOKEN: 'Please sign in again to delete your account.',
  SUBSCRIPTION_ACTIVE: `You have an active subscription. Cancel it from your plan page first, or email ${SUPPORT_EMAIL} and we'll do it for you.`,
  RATE_LIMITED: 'Too many attempts. Wait a minute and try again.',
};
export const deleteErrorCopy = (code?: string) =>
  (code && COPY[code]) || `We couldn't delete your account just now. Please email ${SUPPORT_EMAIL} and we'll do it for you.`;

/**
 * The engine couldn't reach the payment provider to cancel a subscription. The page then offers
 * "Try again later" or "Delete anyway", which re-sends the DELETE with `confirmBillingUnreachable`.
 */
export const BILLING_UNREACHABLE = 'BILLING_UNREACHABLE';

export const BILLING_UNREACHABLE_COPY = {
  intro: "We can't reach our payment provider to cancel your subscription. Your options:",
  waitTitle: "Don't delete yet.",
  wait: 'Try again later, once the connection to Stripe is restored. Cleaner, but not immediate.',
  anywayTitle: 'Delete your account anyway.',
  anyway: "Our support team will then cancel any remaining subscription for you and email you to confirm. " +
    "Immediate, and you don't need to do anything else.",
  later: 'Try again later',
  deleteAnyway: 'Delete anyway',
  /** After "Delete anyway", when the engine opened a support ticket to finish the cancellation. */
  ticketOpened: (id: string) =>
    `We've opened support ticket ${id}. We'll cancel any remaining subscription for you and email you to confirm. ` +
    "You don't need to do anything.",
  /** After "Delete anyway", when no ticket could be opened. */
  noTicket: `Please email ${SUPPORT_EMAIL} so we can cancel your subscription for you.`,
};

/** The engine's support channel for tickets opened from this site. */
export const SUPPORT_CHANNEL = 'Website';

export class DeleteAccountError extends Error {
  constructor(public readonly code: string) { super(code); this.name = 'DeleteAccountError'; }
}

export type DeleteAccountResult = {
  email_sent: boolean;
  billing_unverified: boolean;
  /** Set when the engine opened a support ticket to cancel the subscription by hand (e.g. "TCK-1042"). */
  support_ticket_id?: string;
};

export async function deleteAccount(
  token: string,
  fetchImpl: typeof fetch = fetch,
  opts: { confirmBillingUnreachable?: boolean } = {},
): Promise<DeleteAccountResult> {
  const payload: Record<string, unknown> = { confirm: CONFIRM_WORD };
  if (opts.confirmBillingUnreachable) {
    payload.confirm_billing_unreachable = true;
    payload.channel = SUPPORT_CHANNEL;
  }
  let res: Response;
  try {
    res = await fetchImpl(`${API_BASE}/user/account`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new DeleteAccountError('NETWORK');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.data?.deleted !== true) throw new DeleteAccountError(body?.code || `HTTP_${res.status}`);
  const result: DeleteAccountResult = {
    email_sent: body.data.email_sent !== false,
    billing_unverified: body.data.billing_unverified === true,
  };
  const ticket = body.data.support_ticket_id;
  if (typeof ticket === 'string' && ticket.trim()) result.support_ticket_id = ticket.trim();
  return result;
}
