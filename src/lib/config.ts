// The engine the extension uses (truthscore-chrome-ext-v2 background/config.js).
// Supabase config lives in src/lib/supabase.ts. VITE_API_BASE overrides for local dev stacks.

export const API_BASE = (
  import.meta.env.VITE_API_BASE || "https://truthscore.taggmedia.cloud/api/v1"
).replace(/\/$/, "");

export const SUPPORT_EMAIL = "hello@truthscore.ai";

// The Chrome Web Store listing (store item id from truthscore-chrome-ext-v2
// docs/web-store-permissions.md). Every "Add to Chrome" button links here.
export const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/kihgkihiipdehkmgabojgflmkoijcmog";

/**
 * Sign-out scopes (decided 2026-11-20). Every "Sign out" on this site ends only this browser's
 * session and leaves the extension and the mobile app signed in. "Sign out everywhere" on
 * /account/plan ends every session of the account.
 */
export const SIGN_OUT_SCOPE = "local" as const;
export const SIGN_OUT_EVERYWHERE_SCOPE = "global" as const;
export const SIGN_OUT_EVERYWHERE_CONFIRM = "Signs you out of TruthScore on every device and browser.";
export const SIGN_OUT_EVERYWHERE_FAILED = "We couldn't sign you out on other devices. Sign in again and retry.";

