import { supabase } from "../supabaseClient";
import { API_BASE } from "../config/apiBase";

export async function apiFetch(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();

  const token = session?.access_token ?? localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include', // Allow cookies and auth headers for CORS requests
  });
}