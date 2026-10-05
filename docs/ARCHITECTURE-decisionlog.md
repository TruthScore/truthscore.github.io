# Architecture — decision log

_Why the website is shaped the way it is. Sibling logs: `truthscore-engine`,
`truthscore-chrome-ext-v2` and `truthscore-mobile` each keep their own `docs/ARCHITECTURE-decisionlog.md`._

**Appending a new entry:** add it at the top, take the next `D-nn`, and date it. Record the
decision, the reasoning, and — where there was one — the failure that forced it. **Never rewrite or
delete an entry when a decision is reversed**; add a new one that supersedes it and cross-link both.

Entries are newest-first. Dates are when the decision shipped, not when it was discussed.

---

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
