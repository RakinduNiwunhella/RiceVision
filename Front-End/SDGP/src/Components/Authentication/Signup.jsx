import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { API_BASE } from "../../config/apiBase";

export default function SignupPage() {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLengthError, setPasswordLengthError] = useState("");

  const navigate = useNavigate();

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !regex.test(value)) {
      setEmailError(t('validEmailAddressError'));
    } else {
      setEmailError("");
    }
  };

  const validatePasswords = (pass, confirm) => {
    if (pass.length > 0 && pass.length < 6) {
      setPasswordLengthError(t('passwordMinLengthError'));
    } else {
      setPasswordLengthError("");
    }

    if (confirm && pass !== confirm) {
      setPasswordError(t('passwordsNoMatchError'));
    } else {
      setPasswordError("");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (emailError || passwordError || passwordLengthError) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || t('signupFailed'));
      } else {
        // Reset tutorials on signup - set to empty object instead of removing
        localStorage.setItem('ricevision_tutorial_pages', JSON.stringify({}));
        navigate("/field-setup", { state: { fromSignup: true } });
      }
    } catch (err) {
      alert(t('networkErrorTryAgain'));
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    // Reset tutorials on signup - set to empty object instead of removing
    localStorage.setItem('ricevision_tutorial_pages', JSON.stringify({}));

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // https://app.ricevisionlanka.com/dashboard for production
        // http://localhost:5173/dashboard for development
        redirectTo: "https://app.ricevisionlanka.com/dashboard",
      },
    });

    if (error) {
      alert(error.message);
    }
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
            {t('createAccount')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {t('createAccountSubtitle')}
          </p>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t('fullName')}
              </label>
              <input
                type="text"
                required
                placeholder="John Doe"
                className="w-full rounded-xl px-4 py-3 transition-all duration-200 bg-gray-100 text-gray-900 border border-gray-300 placeholder-gray-500 dark:bg-neutral-800/80 dark:text-white dark:border-neutral-600 dark:placeholder-gray-400 hover:border-gray-400 dark:hover:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 backdrop-blur-sm"
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t('emailAddress')}
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                className={`w-full rounded-xl px-4 py-3 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border outline-none backdrop-blur-sm focus:ring-2 ${emailError
                  ? "border-red-500 focus:ring-red-500/20"
                  : "bg-gray-100 dark:bg-neutral-800/80 border-gray-300 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-500 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  }`}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
              />
              {emailError && (
                <p className="text-xs text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t('password')}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className={`w-full rounded-xl px-4 py-3 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border outline-none backdrop-blur-sm focus:ring-2 ${passwordLengthError
                    ? "border-red-500 focus:ring-red-500/20"
                    : "bg-gray-100 dark:bg-neutral-800/80 border-gray-300 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-500 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    }`}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePasswords(e.target.value, confirmPassword);
                  }}
                />
                {passwordLengthError && (
                  <p className="text-xs text-red-500 mt-1">
                    {passwordLengthError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  {t('confirmPassword')}
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className={`w-full rounded-xl px-4 py-3 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border outline-none backdrop-blur-sm focus:ring-2 ${passwordError
                    ? "border-red-500 focus:ring-red-500/20"
                    : "bg-gray-100 dark:bg-neutral-800/80 border-gray-300 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-500 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                    }`}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    validatePasswords(password, e.target.value);
                  }}
                />
                {passwordError && (
                  <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? t('signingUp') : t('signUpBtn')}
            </button>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-grow h-px bg-slate-300 dark:bg-slate-700"></div>
              <span className="px-4 text-sm text-slate-500">{t('orDivider')}</span>
              <div className="flex-grow h-px bg-slate-300 dark:bg-slate-700"></div>
            </div>

            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
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
            {t('alreadyAccount')}{" "}
            <Link
              to="/"
              className="text-indigo-500 hover:text-indigo-400 font-bold underline-offset-4 hover:underline"
            >
              {t('signInLink')}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full h-[40vh] md:h-auto md:w-1/2 relative bg-neutral-900 order-1 md:order-2">
        {/* Day */}
        <img
          src="/images/rice-day-2.webp"
          alt="Rice Field Day"
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-100 dark:opacity-0"
        />
        
        {/* Night */}
        <img
          src="/images/dark image 2.jpeg"
          alt="Rice Field Night"
          fetchPriority="high"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-0 dark:opacity-100"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-transparent dark:bg-black/30 transition-colors duration-700 pointer-events-none"></div>
      </div>
    </div>
  );
}
