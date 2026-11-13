# CLAUDE.md

## Commands

Use **bun**, not npm (`bun.lockb` is the lockfile): `bun install`, then `bun run <script>` from
`package.json` (`dev`, `build`, `lint`, `test`, `preview`).

## Architecture

The TruthScore.ai marketing site plus the signed-in account pages (Vite + React SPA).

### Routing

- `src/App.tsx` — Root component. Sets up `react-router-dom` routes, wraps with `QueryClientProvider` and `TooltipProvider`. New routes go here, above the `*` catch-all, **and in `scripts/static-routes.mjs`** (post-build route shells + sitemap).
- `src/pages/{Changelog,Privacy,Terms,Methodology}.tsx` — content pages; `src/pages/Plan.tsx` — `/account/plan`.
- `src/pages/Support.tsx` — `/support`, **lazy-loaded**: with `/account/delete`, the only routes that load Supabase auth
  (`src/lib/supabase.ts`, PKCE) and posts to the engine's `POST /support`. `src/lib/support.ts` is
  the TypeScript twin of the extension's `shared/support.js` — keep categories, limits and copy identical.
- `src/pages/DeleteAccount.tsx` — `/account/delete`, lazy-loaded like `/support` (same Supabase sign-in):
  the Google Play "Delete account URL". Calls the engine's `DELETE /user/account`
  (`src/lib/account.ts`), which needs a sign-in under 10 minutes old — the page asks for a fresh
  sign-in itself when the stored session is older.
- `src/pages/Plan.tsx` — `/account/plan` (and `/account` redirects there): Supabase sign-in, current plan, Stripe Checkout / customer portal via the engine's `/billing/*` (engine E#37). Lazy route. Auth is the shared `getSupabase()` client in `src/lib/supabase.ts` (PKCE, same session as /support); engine calls are `src/lib/engine.ts`.

### Components

- `src/components/CookieConsent.tsx` + `src/lib/consent.ts` — GA4 consent banner; the gtag snippet is in `index.html` `<head>` and reads the same storage key.
- `src/components/ui/` — shadcn/ui primitives (do not edit manually; use the shadcn CLI to add/update components).

### Styling

- CSS custom properties (HSL) are defined in `src/index.css` under `@layer base`. This is the single source of truth for the design token system — modify colors/radius here, not in `tailwind.config.ts`.
