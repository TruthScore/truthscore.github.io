// Google Analytics 4 in Consent Mode "basic": gtag.js is not on the page at all until the
// visitor accepts in the cookie banner, so nothing is sent before Accept or after Decline.
// Page views are sent by hand (send_page_view: false) with the origin and path only: query
// strings and fragments (sign-in returns, checkout flags) never reach analytics.

export const GA_MEASUREMENT_ID = "G-KT7CMQHFFL";
const SCRIPT_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
const DISABLE_FLAG = `ga-disable-${GA_MEASUREMENT_ID}`;

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  [DISABLE_FLAG]?: boolean;
};

let loaded = false;
let enabled = false;

const w = () => window as AnalyticsWindow;

/** Origin + path, with no query string or fragment. */
export function cleanPageLocation(loc: Pick<Location, "origin" | "pathname"> = window.location): string {
  return `${loc.origin}${loc.pathname}`;
}

/** Add gtag.js (once) and turn measurement on. Call only after the visitor has accepted. */
export function enableAnalytics(): void {
  const win = w();
  enabled = true;
  win[DISABLE_FLAG] = false;
  if (loaded) {
    win.gtag?.("consent", "update", { analytics_storage: "granted" });
    return;
  }
  loaded = true;
  win.dataLayer = win.dataLayer || [];
  // gtag.js reads the `arguments` object pushed by this exact function shape.
  win.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    win.dataLayer!.push(arguments);
  };
  win.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "granted",
  });
  win.gtag("js", new Date());
  win.gtag("config", GA_MEASUREMENT_ID, {
    send_page_view: false,
    page_location: cleanPageLocation(),
  });
  const s = document.createElement("script");
  s.async = true;
  s.src = SCRIPT_SRC;
  document.head.appendChild(s);
}

/** Stop measurement after a Decline. A loaded gtag.js cannot be unloaded, so it is switched off. */
export function disableAnalytics(): void {
  const win = w();
  enabled = false;
  if (!loaded) return;
  win[DISABLE_FLAG] = true;
  win.gtag?.("consent", "update", { analytics_storage: "denied" });
}

/** Record a page view for the current route. Does nothing unless the visitor has accepted. */
export function trackPageView(): void {
  if (!enabled || !loaded) return;
  const page_location = cleanPageLocation();
  const win = w();
  win.gtag?.("set", { page_location });
  win.gtag?.("event", "page_view", {
    page_location,
    page_path: window.location.pathname,
    page_title: document.title,
  });
}

export function isAnalyticsLoaded(): boolean {
  return loaded;
}

/** Test-only: forget the module state. */
export function __resetAnalyticsForTests(): void {
  loaded = false;
  enabled = false;
}
