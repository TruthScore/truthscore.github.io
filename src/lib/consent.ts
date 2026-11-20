// Analytics consent for Google Analytics. gtag.js is only added to the page once the visitor
// has accepted (src/lib/analytics.ts); a returning visitor's stored choice is applied on start.

import { disableAnalytics, enableAnalytics, trackPageView } from "./analytics";

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
  if (value === "granted") {
    enableAnalytics();
    trackPageView();
  } else {
    disableAnalytics();
    clearAnalyticsCookies();
  }
}

/** On start-up: load analytics only for a visitor who accepted earlier. */
export function applyStoredConsent(): void {
  if (getConsent() === "granted") enableAnalytics();
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
