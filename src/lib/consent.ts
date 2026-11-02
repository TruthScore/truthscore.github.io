// Analytics consent for Google Analytics (gtag.js, loaded in index.html with Consent Mode v2).
// The inline snippet in index.html reads the same storage key so a returning visitor's choice
// applies before the first page_view — keep CONSENT_KEY in sync with it.

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type Consent = "granted" | "denied";

export const CONSENT_KEY = "ts-analytics-consent";
export const OPEN_CONSENT_EVENT = "ts:open-cookie-settings";

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Consent): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage blocked: the choice applies to this page view only.
  }
  window.gtag?.("consent", "update", { analytics_storage: value });
  if (value === "denied") clearAnalyticsCookies();
}

// Withdrawing consent stops new cookies, but _ga cookies already set would linger — remove them.
function clearAnalyticsCookies(): void {
  const host = location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
