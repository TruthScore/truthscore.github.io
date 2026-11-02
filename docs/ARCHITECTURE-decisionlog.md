# Architecture — decision log

_Why the website is shaped the way it is. Sibling logs: `truthscore-engine`,
`truthscore-chrome-ext-v2` and `truthscore-mobile` each keep their own `docs/ARCHITECTURE-decisionlog.md`._

**Appending a new entry:** add it at the top, take the next `D-nn`, and date it. Record the
decision, the reasoning, and — where there was one — the failure that forced it. **Never rewrite or
delete an entry when a decision is reversed**; add a new one that supersedes it and cross-link both.

Entries are newest-first. Dates are when the decision shipped, not when it was discussed.

---

### D-003 · 2026-10-07 · Every public route gets a real HTML file at build time; the sitemap comes from the same list

GitHub Pages only serves files, so `/privacy`, `/methodology` etc. were answered by `404.html` with
**HTTP 404** and redirected client-side. Browsers coped; Google treated every subpage as not found
(found while adding the sitemap, #13). `scripts/static-routes.mjs` runs after `vite build`, copies
`index.html` to `<route>.html` (Pages serves `/privacy` from `privacy.html` with 200) and writes
`sitemap.xml` from the same `ROUTES` list. Prerendering (SSG) was not adopted: the shells are
identical SPA bootstraps, which is enough for status codes and indexing. A new route must be added to
both `src/App.tsx` and `ROUTES`; `404.html` still catches unknown paths.

### D-002 · 2026-10-07 · Google Analytics 4 loads from the static `<head>` with Consent Mode v2 denied by default

Search Console verification (Google Analytics method) and visitor analytics both needed the gtag
snippet; it sits in `index.html` `<head>`, not React, because verification reads the raw HTML.
The privacy policy had promised no cookies or analytics under PECR, so (Neil's choice) analytics
cookies are **off until the visitor clicks Accept**: `analytics_storage` defaults to denied (GA gets
cookieless pings only), all ad signals are denied permanently, the choice is stored in
`localStorage['ts-analytics-consent']` and read by the inline snippet so returning visitors are
consistent from the first hit, and "Cookie settings" in the footer reopens the banner; Decline also
deletes existing `_ga*` cookies. Privacy policy updated in the same PR (#12). Extension and app
analytics go to the same property by other means (X#94 Measurement Protocol, M#24 Firebase) because
MV3 forbids remote code and gtag.js is web-only.

### D-001 · 2026-10-05 · `/support` is the only page that loads Supabase auth, as a lazy chunk; its form logic is a TypeScript twin of the extension's

The site is a static GitHub Pages SPA with no auth. Support tickets must be signed-in (engine
D-030), so `/support` (#10, PR #9) signs users in with `@supabase/supabase-js` (PKCE, the same
project and providers as the extension and app; `https://truthscore.ai/support` is an allowed
redirect). The client is created on first use in `src/lib/supabase.ts` and the route is
`lazy()`-loaded, so the landing page and every other route ship no auth code and set no session.
`src/lib/support.ts` is a TypeScript copy of the extension's `shared/support.js` (categories,
limits, copy); changes follow the engine schema first. **Open at the time of writing:** PR #7
(`/account/plan`) added a second sign-in implementation (direct REST, implicit flow); it is being
reworked onto `getSupabase()` so the site keeps one.
