import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GA_MEASUREMENT_ID, __resetAnalyticsForTests, cleanPageLocation, trackPageView } from "./analytics";
import { CONSENT_KEY, applyStoredConsent, setConsent } from "./consent";

type W = Window & { dataLayer?: IArguments[]; gtag?: unknown; [k: string]: unknown };
const win = window as unknown as W;
const gaScripts = () => document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
const calls = () => (win.dataLayer ?? []).map((a) => Array.from(a));
const pageViews = () => calls().filter((c) => c[0] === "event" && c[1] === "page_view");

beforeEach(() => {
  __resetAnalyticsForTests();
  delete win.dataLayer;
  delete win.gtag;
  delete win[`ga-disable-${GA_MEASUREMENT_ID}`];
  gaScripts().forEach((s) => s.remove());
  localStorage.clear();
  window.history.replaceState(null, "", "/");
});
afterEach(() => localStorage.clear());

describe("analytics loads only after consent", () => {
  it("adds nothing for a first-time visitor", () => {
    applyStoredConsent();
    trackPageView();
    expect(gaScripts().length).toBe(0);
    expect(win.dataLayer).toBeUndefined();
  });

  it("adds nothing after Decline", () => {
    setConsent("denied");
    applyStoredConsent();
    trackPageView();
    expect(gaScripts().length).toBe(0);
    expect(win.dataLayer).toBeUndefined();
  });

  it("loads gtag.js once on Accept, with automatic page views off", () => {
    setConsent("granted");
    setConsent("granted");
    expect(gaScripts().length).toBe(1);
    const config = calls().find((c) => c[0] === "config");
    expect(config?.[1]).toBe(GA_MEASUREMENT_ID);
    expect(config?.[2]).toMatchObject({ send_page_view: false });
  });

  it("loads on start for a returning visitor who accepted", () => {
    localStorage.setItem(CONSENT_KEY, "granted");
    applyStoredConsent();
    expect(gaScripts().length).toBe(1);
  });

  it("stops page views after a later Decline", () => {
    setConsent("granted");
    const before = pageViews().length;
    setConsent("denied");
    trackPageView();
    expect(pageViews().length).toBe(before);
    expect(win[`ga-disable-${GA_MEASUREMENT_ID}`]).toBe(true);
  });
});

describe("page views carry origin + path only", () => {
  it("drops the query string and fragment", () => {
    window.history.replaceState(null, "", "/account/plan?code=abc&checkout=success#access_token=x");
    setConsent("granted");
    const pv = pageViews();
    expect(pv.length).toBe(1);
    const params = pv[0][2] as Record<string, string>;
    expect(params.page_location).toBe(`${window.location.origin}/account/plan`);
    expect(JSON.stringify(calls())).not.toMatch(/code=abc|access_token|checkout=/);
  });

  it("cleanPageLocation ignores search and hash", () => {
    expect(cleanPageLocation({ origin: "https://truthscore.ai", pathname: "/support" })).toBe("https://truthscore.ai/support");
  });
});
