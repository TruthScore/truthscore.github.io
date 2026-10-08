// The engine the extension uses (truthscore-chrome-ext-v2 background/config.js).
// Supabase config lives in src/lib/supabase.ts. VITE_API_BASE overrides for local dev stacks.

export const API_BASE = (
  import.meta.env.VITE_API_BASE || "https://truthscore.taggmedia.cloud/api/v1"
).replace(/\/$/, "");

export const SUPPORT_EMAIL = "hello@truthscore.ai";
