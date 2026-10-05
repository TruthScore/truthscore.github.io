/**
 * Website twin of the extension's shared/support.js (support spec §3.2). Keep CATEGORIES,
 * limits and copy identical to it and to the engine schema.
 */
export const SUPPORT_EMAIL = 'support@truthscore.ai';
export const API_BASE = 'https://truthscore.taggmedia.cloud/api/v1';
export const CATEGORIES = ['Bug Report', 'UI Glitch', 'Account Access', 'Billing', 'Performance', 'Feature Request', 'Score Accuracy', 'Other'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface SupportForm { category: string; subject: string; description: string }
export type Validation =
  | { ok: true; value: { category: Category; subject: string; description: string } }
  | { ok: false; errors: Partial<Record<keyof SupportForm, string>> };

export function validateSupportForm(form: SupportForm): Validation {
  const subject = form.subject.trim();
  const description = form.description.trim();
  const errors: Partial<Record<keyof SupportForm, string>> = {};
  if (!(CATEGORIES as readonly string[]).includes(form.category)) errors.category = 'Choose a category.';
  if (/[\r\n]/.test(subject)) errors.subject = 'Keep the subject to one line.';
  else if (subject.length < 3 || subject.length > 150) errors.subject = 'Subject must be 3–150 characters.';
  if (description.length < 10 || description.length > 5000) errors.description = 'Description must be 10–5000 characters.';
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value: { category: form.category as Category, subject, description } };
}

/** First matching rule wins; returns `${label}${captured version}` or null. */
function firstMatch(ua: string, rules: Array<[RegExp, string]>): string | null {
  for (const [re, label] of rules) {
    const m = ua.match(re);
    if (m) return label.replace('$1', m[1] ?? '');
  }
  return null;
}

export function deviceLabel(ua: string): string {
  const os = firstMatch(ua, [
    [/(?:iPhone|iPod).*? OS (\d+)/, 'iOS $1'],
    [/iPad.*? OS (\d+)/, 'iPadOS $1'],
    [/Android (\d+)/, 'Android $1'],
    [/CrOS/, 'ChromeOS'],
    [/Windows NT/, 'Windows'],
    [/Mac OS X/, 'macOS'],
    [/Linux/, 'Linux'],
  ]);
  const browser = firstMatch(ua, [
    [/Edg(?:A|iOS)?\/(\d+)/, 'Edge $1'],
    [/OPR\/(\d+)/, 'Opera $1'],
    [/(?:Firefox|FxiOS)\/(\d+)/, 'Firefox $1'],
    [/(?:Chrome|CriOS)\/(\d+)/, 'Chrome $1'],
    [/Version\/(\d+)[\d.]* (?:Mobile\/\S+ )?Safari/, 'Safari $1'],
  ]);
  return ([os, browser].filter(Boolean).join(' / ') || 'Unknown device').slice(0, 120);
}

const COPY: Record<string, string> = {
  VALIDATION_ERROR: 'Please check the form and try again.',
  SUPPORT_DAILY_LIMIT_REACHED: `You've reached today's limit for support requests. Email ${SUPPORT_EMAIL} instead.`,
  RATE_LIMITED: 'Too many requests. Wait a minute and try again.',
  MISSING_AUTH: 'Please sign in again to contact support.',
  INVALID_TOKEN: 'Please sign in again to contact support.',
  EXPIRED_TOKEN: 'Please sign in again to contact support.',
  SUPPORT_EMAIL_MISSING: `Your account has no email we can reply to. Email ${SUPPORT_EMAIL} instead.`,
};
export const supportErrorCopy = (code?: string) =>
  (code && COPY[code]) || `We couldn't send your request right now. Please email ${SUPPORT_EMAIL}.`;

export class SupportError extends Error {
  constructor(public readonly code: string) { super(code); this.name = 'SupportError'; }
}

export interface SupportPayload {
  channel: 'Website'; category: Category; subject: string; description: string; client_version: string; device: string;
}

export async function submitSupport(
  token: string, payload: SupportPayload, fetchImpl: typeof fetch = fetch,
): Promise<{ ticket_id: string; email_sent: boolean }> {
  let res: Response;
  try {
    res = await fetchImpl(`${API_BASE}/support`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new SupportError('NETWORK');
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.data?.ticket_id) throw new SupportError(body?.code || `HTTP_${res.status}`);
  return { ticket_id: body.data.ticket_id, email_sent: body.data.email_sent !== false };
}
