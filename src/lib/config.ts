// Same Supabase project and engine the extension uses (truthscore-chrome-ext-v2
// background/config.js). The Supabase key is the publishable (anon) key, safe in
// a public bundle. VITE_* overrides exist for local testing against a dev stack.

export const SUPABASE_URL = (
  import.meta.env.VITE_SUPABASE_URL || "https://zriwnsyztsxleersftux.supabase.co"
).replace(/\/$/, "");

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_8CSMM8dJ2F92dqlT8bGHoA_4VvErcdY";

export const API_BASE = (
  import.meta.env.VITE_API_BASE || "https://truthscore.taggmedia.cloud/api/v1"
).replace(/\/$/, "");

export const SUPPORT_EMAIL = "hello@truthscore.ai";
