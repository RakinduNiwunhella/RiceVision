import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.detail || t('failedToSendResetEmail'));
      } else {
        setMessage(t('resetEmailSent'));
      }
    } catch (err) {
      setMessage(t('networkErrorTryAgain'));
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
      <form
        onSubmit={handleReset}
        className="w-full max-w-md space-y-6 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl font-bold">{t('resetPassword')}</h2>

        <input
          type="email"
          required
          placeholder={t('emailAddress')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl"
        >
          {loading ? t('sending') : t('sendResetLink')}
        </button>

        {message && (
          <p className="text-sm text-center text-slate-500">{message}</p>
        )}
      </form>
    </div>
  );
}
