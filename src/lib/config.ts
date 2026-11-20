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
 * What "Sign out" on this site ends. "global" (current behaviour) ends every session of the
 * account, including the browser extension and the mobile app; "local" ends only this browser's
 * session and leaves the user signed in elsewhere. A product decision: flip it here.
 */
export const SIGN_OUT_SCOPE: "global" | "local" = "global";

