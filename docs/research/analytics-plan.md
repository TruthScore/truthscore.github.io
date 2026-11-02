# Analytics plan (2026-10-07)

One GA4 property (`G-KT7CMQHFFL`), one stream per surface, one privacy-policy section.

## 1. Website — shipped
- gtag.js static in `index.html` `<head>` (Search Console verifies via this snippet).
- Consent Mode v2: `analytics_storage` denied by default; `CookieConsent` banner grants/denies; choice in
  localStorage `ts-analytics-consent`; footer "Cookie settings" reopens it; decline clears `_ga*` cookies.
- SPA page views come from GA4 enhanced measurement (history changes) — keep it enabled on the stream.
- GA admin: data retention 14 months (privacy policy states this), Google Signals off.

## 2. Chrome extension — after Web Store review (X#29) clears
- MV3 forbids remote code → no gtag.js. Use GA4 Measurement Protocol from the service worker
  (`fetch` to `https://www.google-analytics.com/mp/collect` with a stream API secret).
- Anonymous `client_id` in `chrome.storage.local`; add the GA host to CSP `connect-src`.
- Events only: install/update, analysis_started/completed, upgrade_click. Never URLs or article text.
- Update Web Store data-usage disclosures + privacy policy section 8 in the same release.

## 3. Mobile — 1.0.1, not 1.0
- `@capacitor-firebase/analytics`, Firebase project linked to the same GA4 property (iOS + Android streams).
- Same event set as the extension; no ad IDs → no ATT prompt.
- Update App Store privacy label and Play Data Safety form.
