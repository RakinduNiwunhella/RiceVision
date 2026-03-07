// supabaseClient.js
// Place this file in your /lib or /utils folder


import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;   // 🔁 Settings → API → Project URL
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY; // 🔁 Settings → API → service_role (secret

// Service role key bypasses Row Level Security — keep this out of public repos
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);