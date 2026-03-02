import React, { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccess(true);

      // Optional: redirect after 3 seconds
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-md space-y-6 p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-lg"
      >
        <h2 className="text-2xl font-bold">Set New Password</h2>

        <input
          type="password"
          required
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl disabled:opacity-70"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {/* Error Message */}
        {errorMessage && (
          <p className="text-sm text-red-500 text-center">{errorMessage}</p>
        )}

        {/* Success Message */}
        {success && (
          <p className="text-sm text-green-600 text-center">
            ✅ Password updated successfully! Redirecting to login...
          </p>
        )}
      </form>
    </div>
  );
}
