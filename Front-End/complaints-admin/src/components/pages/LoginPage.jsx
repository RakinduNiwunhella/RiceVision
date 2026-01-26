import React, { useState, useEffect } from "react";
import { supabase } from "@/services/client";

import { useNavigate, Link } from "react-router-dom";
import { FaSun, FaMoon, FaLock, FaExclamationTriangle } from "react-icons/fa";

export default function LoginPage() {
  // 1. Changed initial state to 'light'
  const [theme, setTheme] = useState("light");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // Theme Logic
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen transition-colors duration-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-sans">
      {/* Theme Toggle */}
      <button
        type="button"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:rotate-12 transition-all shadow-md z-50"
      >
        {theme === "dark" ? (
          <FaSun className="text-yellow-400 text-xl" />
        ) : (
          <FaMoon className="text-indigo-600 text-xl" />
        )}
      </button>

      {/* Left Side: Form Container */}
      <div className="flex flex-col justify-center w-full px-8 py-12 lg:w-1/2 md:px-24 lg:px-32 z-10">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center mb-10 space-x-3">
            <div className="items-center group">
              <img
                src="/images/logoSDGP.webp"
                alt="SDGP Logo"
                className="h-18 w-auto"
              />
            </div>
          </div>

          <h2 className="text-4xl font-extrabold mb-3 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10">
            Please enter your details to access admin dashboard.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold">Password</label>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="flex items-center gap-3 rounded-xl border border-red-300/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300 animate-in fade-in slide-in-from-top-1">
                <FaExclamationTriangle className="flex-shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center space-x-2 pb-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 accent-indigo-600 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                Keep me logged in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In to Account"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side: Visuals */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/images/paddy_signin.png"
          alt="Rice Field"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>
    </div>
  );
}
