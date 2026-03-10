import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../supabaseClient";
import FieldDrawMap from "./FieldDrawMap";
import { PRICE_PER_ACRE_LKR } from "./fieldConstants";

/* ────────────────────────────────────────────────────────────────────────────
 * FieldSetupPage  —  3-step onboarding after signup
 *
 * Step 1 : Introduction / features overview
 * Step 2 : Draw paddy field on the map
 * Step 3 : Review area, mock payment, and save
 * ────────────────────────────────────────────────────────────────────────────
 */
export default function FieldSetupPage() {
  const { isDark, toggleTheme } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const fromSignup = location.state?.fromSignup ?? false;

  const [step,           setStep]           = useState(1);
  const [user,           setUser]           = useState(null);
  const [drawnFeature,   setDrawnFeature]   = useState(null);
  const [acres,          setAcres]          = useState(0);
  const [district,       setDistrict]       = useState("");
  const [saving,         setSaving]         = useState(false);
  const [payClicked,     setPayClicked]     = useState(false);

  /* fetch current auth user */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleDraw = (feature, calcAcres, districtName) => {
    setDrawnFeature(feature);
    setAcres(calcAcres);
    setDistrict(districtName);
  };

  const handleClear = () => {
    setDrawnFeature(null);
    setAcres(0);
    setDistrict("");
  };

  const saveAndFinish = async () => {
    if (!drawnFeature) return;

    if (!user) {
      alert("Please confirm your email and log in before saving your field.");
      navigate("/signin");
      return;
    }

    setSaving(true);
    const price_lkr = Math.ceil(acres * PRICE_PER_ACRE_LKR);
    const { error } = await supabase.from("user_fields").upsert(
      {
        user_id:    user.id,
        geojson:    drawnFeature,
        area_acres: acres,
        price_lkr,
        district:   district || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    setSaving(false);

    if (error) {
      alert(`Could not save field: ${error.message}`);
      return;
    }
    navigate("/dashboard");
  };

  const price = Math.ceil(acres * PRICE_PER_ACRE_LKR);

  /* ── shared button variants ── */
  const btnPrimary =
    "px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2";
  const btnSecondary =
    "px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-all";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950/30 text-white">

      {/* ── Theme toggle ── */}
      <button
        onClick={toggleTheme}
        className="fixed top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all z-50 shadow-lg"
      >
        {isDark
          ? <FaSun className="text-yellow-400 text-base" />
          : <FaMoon className="text-indigo-400 text-base" />
        }
      </button>

      {/* ── Sticky header with progress ── */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img src="/logoSDGP.webp" alt="RiceVision" className="h-8 w-auto" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 hidden sm:block">
              Field Registration
            </span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center gap-2 flex-1 sm:justify-end">
            {[
              { n: 1, label: "Introduction" },
              { n: 2, label: "Draw Field"   },
              { n: 3, label: "Payment"      },
            ].map(({ n, label }, i) => (
              <React.Fragment key={n}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      step === n
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                        : step > n
                        ? "bg-emerald-500/30 text-emerald-400"
                        : "bg-white/10 text-white/30"
                    }`}
                  >
                    {step > n
                      ? <span className="material-symbols-outlined text-[14px]">check</span>
                      : n
                    }
                  </div>
                  <span
                    className={`text-xs font-semibold hidden md:block transition-colors ${
                      step === n ? "text-emerald-400" : "text-white/30"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-px max-w-15 transition-all ${
                      step > n ? "bg-emerald-500/50" : "bg-white/10"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Email banner (shown when navigated from signup) ── */}
      {fromSignup && (
        <div className="max-w-5xl mx-auto px-6 mt-6">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm">
            <span className="material-symbols-outlined text-base">mark_email_unread</span>
            <span>
              A confirmation email has been sent. Please verify before completing payment — you can still preview the map now.
            </span>
          </div>
        </div>
      )}

      {/* ── Page content ── */}
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ═══ STEP 1 — Introduction ═══ */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center gap-10 py-10">
            <div className="w-24 h-24 rounded-4xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-500/10">
              <span className="material-symbols-outlined text-5xl text-emerald-400">landscape</span>
            </div>

            <div className="max-w-2xl">
              <h1 className="text-5xl font-black tracking-tight mb-5 leading-tight">
                Register Your<br />
                <span className="text-emerald-400">Paddy Field</span>
              </h1>
              <p className="text-white/55 text-lg leading-relaxed">
                Draw your paddy field boundary on the map to unlock satellite‑powered
                health monitoring, disease alerts, yield predictions, and disaster
                reports — all personalised to your exact location.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl text-left">
              {[
                {
                  icon: "draw",
                  title: "Draw Freely",
                  desc:  "Use the polygon or rectangle tool to outline the exact boundary of your paddy area on a live satellite map.",
                  accent: "text-emerald-400",
                },
                {
                  icon: "satellite_alt",
                  title: "Satellite Insights",
                  desc:  "Receive NDVI, EVI, VV / VH SAR overlays and health classifications updated from Sentinel imagery.",
                  accent: "text-cyan-400",
                },
                {
                  icon: "paid",
                  title: "Rs. 1,000 / acre",
                  desc:  "Simple transparent pricing — you only pay for the area you actually register. Billed annually.",
                  accent: "text-amber-400",
                },
              ].map(({ icon, title, desc, accent }) => (
                <div
                  key={icon}
                  className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <span className={`material-symbols-outlined text-2xl mt-0.5 ${accent}`}>{icon}</span>
                  <div>
                    <h3 className="font-bold text-sm mb-1.5">{title}</h3>
                    <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <button onClick={() => setStep(2)} className={btnPrimary}>
                <span className="material-symbols-outlined text-[18px]">map</span>
                Get Started — Draw My Field
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-white/35 hover:text-white/60 text-sm transition-colors"
              >
                Skip for now — set up later in Profile →
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 2 — Draw Field ═══ */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-3xl font-black mb-2">Draw Your Paddy Field</h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-2xl">
                Select your <strong className="text-white/80">district</strong> to load paddy zone boundaries (amber),
                then pick a base map and use the <strong className="text-white/80">draw tools (top‑right of map)</strong> to
                outline your field. Search by place name to navigate quickly.
              </p>
            </div>

            <FieldDrawMap
              onDraw={handleDraw}
              onClear={handleClear}
              height="calc(100vh - 380px)"
            />

            <div className="flex justify-between gap-3 pt-1">
              <button onClick={() => setStep(1)} className={btnSecondary}>
                ← Back
              </button>
              <button
                disabled={!drawnFeature}
                onClick={() => setStep(3)}
                className={btnPrimary}
              >
                Review Selection →
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 3 — Payment & Confirm ═══ */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-3xl font-black mb-2">Review & Payment</h2>
              <p className="text-white/50 text-sm">Confirm your field details and complete registration.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* ── Field summary card ── */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
                <h3 className="text-[11px] font-black uppercase tracking-[0.35em] text-white/50">
                  Field Summary
                </h3>

                <div className="space-y-3">
                  {district && (
                    <SummaryRow label="District"     value={district} />
                  )}
                  <SummaryRow
                    label="Total Area"
                    value={`${acres.toFixed(4)} acres`}
                  />
                  <SummaryRow
                    label="Area (m²)"
                    value={`${(acres * 4046.86).toFixed(0)} m²`}
                  />
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <SummaryRow label="Rate"       value={`Rs. ${PRICE_PER_ACRE_LKR.toLocaleString()} / acre / year`} />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
                      Annual Cost
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      Rs. {price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Mini map preview */}
                {drawnFeature && (
                  <div className="rounded-xl overflow-hidden border border-white/10">
                    <FieldDrawMap
                      initialFeature={drawnFeature}
                      readOnly
                      height="220px"
                    />
                  </div>
                )}
              </div>

              {/* ── Payment gateway mock ── */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.35em] text-white/50">
                    Secure Payment
                  </h3>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                    Preview Only
                  </span>
                </div>

                {/* Order line */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-xs font-bold text-white/80">RiceVision Field Monitoring</p>
                    <p className="text-[10px] text-white/40">{district || "Sri Lanka"} · {acres.toFixed(3)} acres</p>
                  </div>
                  <span className="font-black text-emerald-400">Rs. {price.toLocaleString()}</span>
                </div>

                {/* Mock card fields */}
                <div className="space-y-3 opacity-50 pointer-events-none select-none">
                  <div>
                    <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1.5">
                      Card Number
                    </label>
                    <input
                      disabled
                      value="•••• •••• •••• ••••"
                      className="w-full px-4 py-3 text-sm rounded-xl bg-white/5 border border-white/10 text-white font-mono cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1.5">Expiry</label>
                      <input disabled value="MM / YY" className="w-full px-4 py-3 text-sm rounded-xl bg-white/5 border border-white/10 text-white cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[10px] text-white/50 uppercase tracking-wider mb-1.5">CVV</label>
                      <input disabled value="•••" className="w-full px-4 py-3 text-sm rounded-xl bg-white/5 border border-white/10 text-white font-mono cursor-not-allowed" />
                    </div>
                  </div>
                </div>

                {/* Pay button (mock) */}
                <button
                  onClick={() => setPayClicked(true)}
                  className="w-full py-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 font-black text-sm hover:bg-amber-500/25 transition-all tracking-wide"
                >
                  Pay Rs. {price.toLocaleString()} / year
                </button>

                {payClicked && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                    <span className="material-symbols-outlined text-base">construction</span>
                    <span>Payment gateway integration coming soon. Save your field now to reserve your slot.</span>
                  </div>
                )}

                {/* Security note */}
                <div className="flex items-center gap-2 text-white/25 text-[10px]">
                  <span className="material-symbols-outlined text-base">lock</span>
                  <span>Secured by SSL · Powered by PayHere · Your card data is never stored</span>
                </div>
              </div>
            </div>

            {/* Action row */}
            <div className="flex justify-between gap-3 pt-1">
              <button onClick={() => setStep(2)} className={btnSecondary}>
                ← Back to Map
              </button>
              <button
                onClick={saveAndFinish}
                disabled={saving || !drawnFeature}
                className={btnPrimary}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Complete Registration
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Small helper: summary row ───────────────────────────────────────────── */
function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-white/45">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
