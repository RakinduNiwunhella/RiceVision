import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import {
  FaSun,
  FaMoon,
  FaLock,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { API_BASE } from "../../config/apiBase";

export default function LoginPage() {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || t('loginFailed'));
      }

      console.log("Login success:", data);

      // store token
      localStorage.setItem("access_token", data.access_token);

      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      setErrorMessage(err.message);
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    // Reset tutorials on login - set to empty object instead of removing
    localStorage.setItem('ricevision_tutorial_pages', JSON.stringify({}));

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // https://app.ricevisionlanka.com/dashboard for production
        // http://localhost:5173/dashboard for development
        redirectTo: import.meta.env.DEV
          ? "http://localhost:5173/dashboard"
          : "https://app.ricevisionlanka.com/dashboard",
      },
    });

    if (error) {
      setErrorMessage(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      setResetError(t('pleaseEnterEmail'));
      return;
    }

    setResetLoading(true);
    setResetError("");

    try {
      const res = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResetError(data.detail || t('failedToSendResetEmail'));
      } else {
        setResetSuccess(true);
      }
    } catch (err) {
      setResetError(t('networkErrorTryAgain'));
    }

    setResetLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-500 bg-white dark:bg-neutral-900 text-black dark:text-white">
      {/* Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:rotate-12 transition-all shadow-md z-50"
      >
        {isDark ? (
          <FaSun className="text-yellow-400 text-xl" />
        ) : (
          <FaMoon className="text-indigo-600 text-xl" />
        )}
      </button>

      {/* Left Side: Form Container */}
      <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 py-8 md:py-12 md:w-1/2 lg:px-20 z-10 w-full mx-auto md:mx-0 order-2 md:order-1">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center mb-0 space-x-3">
            <div className="items-center group">
              <img
                src="/logoSDGP.webp"
                alt="SDGP Logo"
                className="h-12 sm:h-16 md:h-18 w-auto"
              />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight">
            {t('welcomeBack')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('signInDetails')}
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t('emailAddress')}
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                className="w-full rounded-xl px-4 py-3 transition-all duration-200 bg-gray-100 text-gray-900 border border-gray-300 placeholder-gray-500 dark:bg-neutral-800/80 dark:text-white dark:border-neutral-600 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 backdrop-blur-sm"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t('password')}
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  className="w-full rounded-xl px-4 py-3 transition-all duration-200 bg-gray-100 text-gray-900 border border-gray-300 placeholder-gray-500 dark:bg-neutral-800/80 dark:text-white dark:border-neutral-600 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 backdrop-blur-sm"
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                />

                {/* Eye Icon */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-500 dark:text-gray-400 hover:text-indigo-500 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Forgot Password - now below input */}
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm text-indigo-500 hover:text-indigo-400"
                >
                  {t('forgotPassword')}
                </button>
              </div>
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
                className="w-4 h-4 rounded bg-gray-100 border-gray-300 dark:bg-neutral-800 dark:border-neutral-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 accent-indigo-600 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer"
              >
                {t('keepLoggedIn')}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
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
                  {t('signingIn')}
                </span>
              ) : (
                t('signInBtn')
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-grow h-px bg-slate-300 dark:bg-slate-700"></div>
              <span className="px-4 text-sm text-slate-500">{t('orDivider')}</span>
              <div className="flex-grow h-px bg-slate-300 dark:bg-slate-700"></div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3 border border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="h-5 w-5"
              />
              {t('continueGoogle')}
            </button>
          </form>

          <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('noAccount')}{" "}
            <Link
              to="/signup"
              className="text-indigo-500 hover:text-indigo-400 font-bold underline-offset-4 hover:underline"
            >
              {t('signUpLink')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side: Visuals */}
      <div className="w-full h-[40vh] md:h-auto md:w-1/2 relative bg-neutral-900 order-1 md:order-2">
        {/* Day */}
        <img
          src="/images/rice-day-1.webp"
          alt="Rice Field Day"
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-100 dark:opacity-0"
        />
        
        {/* Night */}
        <img
          src="/images/dark image 1.jpeg"
          alt="Rice Field Night"
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 dark:opacity-100"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-transparent dark:bg-black/30 transition-colors duration-700 pointer-events-none"></div>
      </div>

      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Background Blur */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowForgot(false)}
          ></div>

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md p-8 bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">{t('resetPassword')}</h2>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="email"
                required
                placeholder={t('emailAddress')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 transition-all duration-200 bg-gray-100 text-gray-900 border border-gray-300 placeholder-gray-500 dark:bg-neutral-800/80 dark:text-white dark:border-neutral-600 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 backdrop-blur-sm"
              />
              <button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {resetLoading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
                      />
                    </svg>
                    <span>{t('sending')}</span>
                  </>
                ) : (
                  t('sendResetLink')
                )}
              </button>

              {resetError && (
                <p className="text-sm text-red-500 text-center">{resetError}</p>
              )}

              {resetSuccess && (
                <p className="text-sm text-green-600 text-center">
                  {t('resetEmailSent')}
                </p>
              )}
            </form>

            <button
              onClick={() => setShowForgot(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
