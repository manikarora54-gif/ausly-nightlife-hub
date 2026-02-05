// Backend client (safe fallback for env injection issues)
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Primary: injected at build time
const ENV_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const ENV_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Fallback: public values (URL + publishable key) to avoid blank screens when env injection fails.
// NOTE: This key is safe to ship to the browser (publishable/anon).
const FALLBACK_URL = "https://dpbsxrqjendnoraasafs.supabase.co";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYnN4cnFqZW5kbm9yYWFzYWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzAyMDksImV4cCI6MjA4MzgwNjIwOX0.785F_72arcwxdfZr2IvfBuxUGPUNFz0dd4cTzZBeXZg";

const SUPABASE_URL = ENV_URL || FALLBACK_URL;
const SUPABASE_PUBLISHABLE_KEY = ENV_KEY || FALLBACK_KEY;

// Only log booleans (never log secrets)
if (typeof window !== "undefined") {
  // eslint-disable-next-line no-console
  console.log("Backend URL available:", !!ENV_URL);
  // eslint-disable-next-line no-console
  console.log("Backend publishable key available:", !!ENV_KEY);
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
