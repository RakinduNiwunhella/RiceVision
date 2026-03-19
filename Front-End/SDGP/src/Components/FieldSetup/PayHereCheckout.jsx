/**
 * PayHereCheckout.jsx
 * -------------------
 * Real PayHere payment panel for the FieldSetupPage Step 3.
 *
 * Uses window.payhere (loaded via <script> in index.html) instead of the
 * payhere-embed-sdk npm package which crashes Vite at module-load time due
 * to browser DOM globals (Element) being referenced during pre-bundling.
 *
 * PayHere flow:
 *   1. User clicks "Pay with PayHere"
 *   2. We call our backend POST /payment/hash to get a secure MD5 hash
 *   3. We call window.payhere.startPayment(paymentDetails)
 *   4. On success → save the field to DB → navigate to /dashboard
 */

import React, { useState, useCallback } from "react";
import { fetchPaymentHash } from "../../api/api";

const PAYHERE_ENV = import.meta.env.VITE_PAYHERE_ENV || "SANDBOX";
const MERCHANT_ID = import.meta.env.VITE_PAYHERE_MERCHANT_ID || "1220042";

export default function PayHereCheckout({
  price,            // number  – LKR amount
  acres,            // number
  district,         // string
  fieldName,        // string
  drawnFeature,     // GeoJSON feature (used to check readiness)
  user,             // supabase user object { id, email, user_metadata }
  onPaymentSuccess, // async fn() – called when PayHere signals success → save field
}) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | failed | dismissed
  const [errorMessage, setErrorMessage] = useState("");

  const handlePayment = useCallback(async () => {
    setErrorMessage("");
    if (!drawnFeature || !user) return;

    // Guard: payhere must be loaded via <script> in index.html
    if (typeof window === "undefined" || !window.payhere) {
      alert("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    setStatus("loading");

    try {
      const orderId = `rv-${user.id}`;
      const amount = price.toFixed(2);
      const currency = "LKR";

      /* Fetch MD5 hash securely from our backend */
      const hashData = await fetchPaymentHash(orderId, amount, currency);

      /* Attach event handlers on window.payhere */
      window.payhere.onCompleted = async (ordId) => {
        setStatus("success");
        if (onPaymentSuccess) {
          await onPaymentSuccess();
        }
      };

      window.payhere.onDismissed = () => {
        setStatus("dismissed");
      };

      window.payhere.onError = (error) => {
        console.error("PayHere error:", error);
        setErrorMessage(typeof error === "string" ? error : "Payment failed. Please try again.");
        setStatus("failed");
      };

      /* Build payment object per PayHere spec */
      const paymentDetails = {
        sandbox: PAYHERE_ENV === "SANDBOX",
        merchant_id: MERCHANT_ID,
        return_url: `${window.location.origin}/dashboard`,
        cancel_url: `${window.location.origin}/field-setup`,
        notify_url: `${import.meta.env.VITE_API_BASE_URL}/payment/notify`,
        order_id: orderId,
        items: fieldName
          ? `RiceVision Field Monitoring – ${fieldName}`
          : "RiceVision Field Monitoring",
        amount: amount,
        currency: currency,
        hash: hashData.hash,
        first_name:
          user.user_metadata?.full_name?.split(" ")[0] || "User",
        last_name:
          user.user_metadata?.full_name?.split(" ").slice(1).join(" ") || "Doe",
        email: user.email || "user@example.com",
        phone: user.user_metadata?.phone || "0700000000",
        address: district || "Sri Lanka",
        city: district || "Colombo",
        country: "Sri Lanka",
        custom_1: district || "",
        custom_2: acres.toFixed(4),
      };

      window.payhere.startPayment(paymentDetails);
    } catch (err) {
      console.error("Payment init error:", err);
      setErrorMessage(err.message || "Failed to initialize payment gateway.");
      setStatus("failed");
    }
  }, [drawnFeature, user, price, acres, district, fieldName, onPaymentSuccess]);

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-black uppercase tracking-[0.35em] text-white/70">
          Secure Payment
        </h3>
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
          PayHere · LKR
        </span>
      </div>

      {/* Order summary */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
        <div>
          <p className="text-xs font-bold text-white/90">
            {fieldName ? `"${fieldName}" – Field Monitoring` : "Field Monitoring Plan"}
          </p>
          <p className="text-[10px] text-white/60 mt-0.5">
            {district || "Sri Lanka"} · {acres.toFixed(3)} acres · Monthly
          </p>
        </div>
        <span className="font-black text-emerald-400 text-sm">
          Rs.&nbsp;{price.toLocaleString()}
        </span>
      </div>

      {/* Feature list */}
      <ul className="space-y-2">
        {[
          "Satellite NDVI & EVI monitoring",
          "Real-time weather alerts",
          "Disease & pest outbreak alerts",
          "Monthly yield reports",
        ].map((item) => (
          <li key={item} className="flex items-center gap-2 text-[11px] text-white/70">
            <span className="material-symbols-outlined text-emerald-400 text-[14px]">
              check_circle
            </span>
            {item}
          </li>
        ))}
      </ul>

      <div className="border-t border-white/10" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/60">Monthly total</span>
        <span className="text-xl font-black text-emerald-400">
          Rs.&nbsp;{price.toLocaleString()}
        </span>
      </div>

      {/* Status feedback */}
      {status === "dismissed" && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs">
          <span className="material-symbols-outlined text-base">info</span>
          Payment cancelled. You can try again below.
        </div>
      )}
      {status === "failed" && (
        <div className="flex items-start gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left">
          <span className="material-symbols-outlined text-base mt-0.5 shrink-0">error</span>
          <span>{errorMessage || "Payment failed. Please try again or use a different card."}</span>
        </div>
      )}
      {status === "success" && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <span className="material-symbols-outlined text-base">check_circle</span>
          Payment successful! Saving your field…
        </div>
      )}

      {/* Pay button */}
      <button
        onClick={handlePayment}
        disabled={!drawnFeature || status === "loading" || status === "success"}
        className="w-full py-4 rounded-xl font-black text-sm tracking-wide transition-all
          bg-[#f28c28] hover:bg-[#e07a18] active:scale-95 text-white
          shadow-lg shadow-[#f28c28]/20 hover:shadow-[#f28c28]/30
          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#f28c28]
          flex items-center justify-center gap-3"
      >
        {status === "loading" ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Connecting to PayHere…
          </>
        ) : (
          <>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-[#f28c28] font-black text-[10px]">
              P
            </span>
            Pay Rs.&nbsp;{price.toLocaleString()} with PayHere
          </>
        )}
      </button>

      {/* Supported methods */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {["Visa", "Mastercard", "Amex", "Bank Transfer", "eZ Cash", "mCash"].map((m) => (
          <span
            key={m}
            className="text-[9px] font-semibold px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/10"
          >
            {m}
          </span>
        ))}
      </div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-white/40 text-[10px]">
        <span className="material-symbols-outlined text-sm">lock</span>
        Secured by PayHere · 256-bit SSL Encrypted
      </div>
    </div>
  );
}
