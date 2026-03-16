import { supabase } from "../supabaseClient";

const API_BASE = "http://localhost:8000";

export async function apiFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();

  const token = session?.access_token ?? localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(`${API_BASE}${url}`, { ...options, headers });
}