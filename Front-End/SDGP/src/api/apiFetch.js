import { supabase } from "../supabaseClient";

/**
 * Centralized fetch wrapper that automatically attaches the Supabase
 * JWT access token as an Authorization: Bearer header.
 *
 * Usage:
 *   const res = await apiFetch("/api/dashboard");
 *   const data = await res.json();
 *
 * For POST/PUT requests:
 *   const res = await apiFetch("/api/alerts/1", {
 *     method: "PUT",
 *     body: JSON.stringify({ status: "Resolved" }),
 *   });
 *
 * @param {string} url        - Absolute URL or path to request.
 * @param {RequestInit} [options] - Standard fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>}
 */
export async function apiFetch(url, options = {}) {
  // Retrieve the active Supabase session (works for both OAuth and email/password flows)
  const { data: { session } } = await supabase.auth.getSession();

  // Fall back to localStorage token for email/password logins (legacy until session is unified)
  const token = session?.access_token ?? localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  return fetch(url, { ...options, headers });
}
