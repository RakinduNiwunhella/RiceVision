/**
 * MyFieldTab.jsx
 *
 * Profile tab that lets signed-in users view, draw, or edit their paddy field.
 * Reads/writes to the Supabase `user_fields` table (see schema in FieldDrawMap.jsx).
 */

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient";
import FieldDrawMap from "../FieldSetup/FieldDrawMap";
import { PRICE_PER_ACRE_LKR } from "../FieldSetup/fieldConstants";

export default function MyFieldTab() {
  const [user,          setUser]          = useState(null);
  const [existing,      setExisting]      = useState(null);   // row from user_fields
  const [loading,       setLoading]       = useState(true);
  const [editMode,      setEditMode]      = useState(false);
  const [drawnFeature,  setDrawnFeature]  = useState(null);
  const [acres,         setAcres]         = useState(0);
  const [district,      setDistrict]      = useState("");
  const [saving,        setSaving]        = useState(false);
  const [status,        setStatus]        = useState(null);    // { type, message }

  /* auto-clear status banner */
  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 6000);
    return () => clearTimeout(t);
  }, [status]);

  /* load user + existing field on mount */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (!user) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("user_fields")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) setExisting(data);
      setLoading(false);
    })();
  }, []);

  const handleDraw = useCallback((feature, calcAcres, districtName) => {
    setDrawnFeature(feature);
    setAcres(calcAcres);
    setDistrict(districtName);
  }, []);

  const handleClear = useCallback(() => {
    setDrawnFeature(null);
    setAcres(0);
    setDistrict("");
  }, []);

  const saveField = async () => {
    if (!drawnFeature || !user) return;
    setSaving(true);

    const price_lkr = Math.ceil(acres * PRICE_PER_ACRE_LKR);
    const { data, error } = await supabase
      .from("user_fields")
      .upsert(
        {
          user_id:    user.id,
          geojson:    drawnFeature,
          area_acres: acres,
          price_lkr,
          district:   district || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .maybeSingle();

    setSaving(false);

    if (error) {
      setStatus({ type: "error", message: `Save failed: ${error.message}` });
      return;
    }

    setExisting(data);
    setEditMode(false);
    setDrawnFeature(null);
    setStatus({ type: "success", message: "Field boundary saved to registry." });
  };

  const deleteField = async () => {
    if (!existing || !user) return;
    if (!window.confirm("Are you sure you want to remove your field registration? This cannot be undone.")) return;

    const { error } = await supabase
      .from("user_fields")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      setStatus({ type: "error", message: `Delete failed: ${error.message}` });
      return;
    }
    setExisting(null);
    setEditMode(false);
    setDrawnFeature(null);
    setStatus({ type: "success", message: "Field registration removed." });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-white/30 text-xs font-black uppercase tracking-widest animate-pulse">
          Loading Field Data
        </p>
      </div>
    );
  }

  const price = existing
    ? existing.price_lkr
    : Math.ceil(acres * PRICE_PER_ACRE_LKR);

  return (
    <div className="space-y-6 relative">
      {/* Status banner */}
      {status && (
        <div
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-60 px-6 py-3 rounded-2xl border glass flex items-center gap-3 animate-in slide-in-from-top-4 duration-500 ${
            status.type === "success"
              ? "border-emerald-500/50 text-emerald-400"
              : "border-red-500/50 text-red-400"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {status.type === "success" ? "check_circle" : "error"}
          </span>
          <span className="text-[11px] font-black uppercase tracking-widest">
            {status.message}
          </span>
        </div>
      )}

      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50 mb-1">
            Field Registry
          </h3>
          <p className="text-white/40 text-xs max-w-xl leading-relaxed">
            {existing
              ? "Your registered paddy field. Use Edit to update the boundary, or draw a new polygon to replace it."
              : "You have not registered a paddy field yet. Draw your field boundary below."}
          </p>
        </div>

        {existing && !editMode && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit
            </button>
            <button
              onClick={deleteField}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-xs font-black uppercase tracking-widest transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Remove
            </button>
          </div>
        )}
      </div>

      {/* ── READ-ONLY view of existing field ── */}
      {existing && !editMode && (
        <div className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: "location_on",  label: "District",   value: existing.district || "—"                                 },
              { icon: "straighten",   label: "Area",       value: `${parseFloat(existing.area_acres).toFixed(3)} ac`        },
              { icon: "crop_square",  label: "Area (m²)",  value: `${(existing.area_acres * 4046.86).toFixed(0)} m²`        },
              { icon: "paid",         label: "Annual Fee", value: `Rs. ${existing.price_lkr.toLocaleString()}`              },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-1 p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-1.5 text-white/40">
                  <span className="material-symbols-outlined text-base">{icon}</span>
                  <span className="text-[10px] uppercase tracking-[0.25em] font-black">{label}</span>
                </div>
                <span className="text-base font-black text-white">{value}</span>
              </div>
            ))}
          </div>

          {/* Map preview */}
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <FieldDrawMap
              initialFeature={existing.geojson}
              readOnly
              height="400px"
            />
          </div>
        </div>
      )}

      {/* ── EDIT / NEW draw mode ── */}
      {(editMode || !existing) && (
        <div className="space-y-4">
          {editMode && existing && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs">
              <span className="material-symbols-outlined text-sm">info</span>
              Draw a new polygon to replace your existing boundary. The dashed blue outline shows your current field.
            </div>
          )}

          <FieldDrawMap
            onDraw={handleDraw}
            onClear={handleClear}
            initialFeature={editMode ? existing?.geojson : null}
            height="440px"
          />

          {/* Summary + price */}
          {drawnFeature && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Selection Summary</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {district && (
                    <div>
                      <span className="text-white/40 block text-xs mb-0.5">District</span>
                      <span className="font-bold text-white">{district}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/40 block text-xs mb-0.5">Area</span>
                    <span className="font-bold text-white">{acres.toFixed(4)} acres</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-xs mb-0.5">Area (m²)</span>
                    <span className="font-bold text-white">{(acres * 4046.86).toFixed(0)} m²</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/70">Annual Cost</span>
                <span className="text-3xl font-black text-emerald-400">Rs. {price.toLocaleString()}</span>
                <span className="text-[10px] text-white/30">Rs. {PRICE_PER_ACRE_LKR.toLocaleString()} / acre</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between gap-3 pt-2">
            {editMode && (
              <button
                onClick={() => {
                  setEditMode(false);
                  setDrawnFeature(null);
                }}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-all text-sm"
              >
                Cancel
              </button>
            )}
            <button
              disabled={saving || !drawnFeature}
              onClick={saveField}
              className="ml-auto flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Field
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
