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
import { useLanguage } from "../../context/LanguageContext";
import { translateDistrictName } from "../../utils/locationTranslations";
import { fetchUserField, saveUserField, removeUserField } from "../../api/api";
import PayHereCheckout from "../FieldSetup/PayHereCheckout";

export default function MyFieldTab() {
  const { t, language } = useLanguage();
  const [user,          setUser]          = useState(null);
  const [existing,      setExisting]      = useState(null);   // row from user_fields
  const [loading,       setLoading]       = useState(true);
  const [editMode,      setEditMode]      = useState(false);
  const [drawnFeature,  setDrawnFeature]  = useState(null);
  const [acres,         setAcres]         = useState(0);
  const [district,      setDistrict]      = useState("");
  const [fieldName,     setFieldName]     = useState("");
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
      try {
        // Fetch Supabase user
        const { data: { user: supaUser } } = await supabase.auth.getUser();
        setUser(supaUser || null);

        // Fetch user field
        const result = await fetchUserField();
        const data = result?.data || null;
        if (data) {
          setExisting(data);
          if (data.field_name) setFieldName(data.field_name);
        }
        // If data is null, it means user has no saved field yet — that's okay
      } catch (error) {
        console.error("Error fetching field:", error);
        // Only show error if it's not a "no field" case
        setStatus({ type: "error", message: `Unable to load field data. Please refresh the page.` });
      }
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
    if (!drawnFeature || !district) {
      setStatus({ type: "error", message: "Please select a district and draw your field." });
      return;
    }
    setSaving(true);

    const price_lkr = Math.ceil(acres * PRICE_PER_ACRE_LKR);
    try {
      const result = await saveUserField({
        field_name: fieldName || null,
        geojson: drawnFeature,
        area_acres: acres,
        price_lkr,
        district: district || null,
      });

      setSaving(false);
      setExisting(result?.data || null);
      setEditMode(false);
      setDrawnFeature(null);
      setStatus({ type: "success", message: "Field boundary saved to registry." });
      // Reload user field after save to ensure UI is up to date
      try {
        const reload = await fetchUserField();
        setExisting(reload?.data || null);
      } catch {}
    } catch (error) {
      setSaving(false);
      setStatus({ type: "error", message: `Save failed: ${error.message}` });
      return;
    }
  };

  const deleteField = async () => {
    if (!existing) return;
    if (!window.confirm("Are you sure you want to remove your field registration? This cannot be undone.")) return;

    try {
      await removeUserField();
    } catch (error) {
      setStatus({ type: "error", message: `Delete failed: ${error.message}` });
      return;
    }

    setExisting(null);
    setEditMode(false);
    setDrawnFeature(null);
    setFieldName("");
    setStatus({ type: "success", message: t('fieldRegistrationRemoved') });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-white/85 text-xs font-black uppercase tracking-widest animate-pulse">
          {t('loadingFieldData')}
        </p>
      </div>
    );
  }

  // When drawing a new polygon, calculate price dynamically. Otherwise use existing price.
  const price = drawnFeature
    ? Math.ceil(acres * PRICE_PER_ACRE_LKR)
    : (existing?.price_lkr || 0);

  const localizedExistingDistrict = existing?.district
    ? translateDistrictName(existing.district, language)
    : "—";
  const localizedSelectedDistrict = district
    ? translateDistrictName(district, language)
    : "";

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
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/85 mb-1">
            {t('fieldRegistry')}
          </h3>
          <p className="text-white/85 text-xs max-w-xl leading-relaxed">
            {existing
              ? t('fieldRegistryExisting')
              : t('fieldRegistryNew')}
          </p>
        </div>

        {existing && !editMode && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              {t('editBtn')}
            </button>
            <button
              onClick={deleteField}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-xs font-black uppercase tracking-widest transition-all hover:scale-105"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              {t('removeBtn')}
            </button>
          </div>
        )}
      </div>

      {/* ── READ-ONLY view of existing field ── */}
      {/* Debug output for troubleshooting payment panel visibility */}
      <div style={{ background: '#222', color: '#fff', padding: '8px', borderRadius: '8px', marginBottom: '12px', fontSize: '12px' }}>
        <strong>DEBUG:</strong> user: {user ? JSON.stringify(user) : 'null'}<br />
        existing: {existing ? JSON.stringify(existing) : 'null'}<br />
        editMode: {String(editMode)}
      </div>

      {existing && !editMode && (
        <div className="space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: "badge",        label: t('fieldNameStat'),  value: existing.field_name || "—"                                },
              { icon: "location_on",  label: t('districtStat'),   value: localizedExistingDistrict                                   },
              { icon: "straighten",   label: t('areaStat'),       value: `${parseFloat(existing.area_acres).toFixed(3)} ${t('unitAcres')}` },
              { icon: "crop_square",  label: t('areaSqmLabel'),   value: `${(existing.area_acres * 4046.86).toFixed(0)} m²`        },
              { icon: "paid",         label: t('annualFeeStat'),  value: `Rs. ${existing.price_lkr.toLocaleString()}`              },
            ].map(({ icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col gap-1 p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-1.5 text-white/85">
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
              initialDistrict={existing?.district}
              readOnly
              height="600px"
            />
          </div>

          {/* Payment option */}
          {user && (
            <PayHereCheckout
              price={existing.price_lkr}
              acres={existing.area_acres}
              district={existing.district}
              fieldName={existing.field_name}
              drawnFeature={existing.geojson}
              user={user}
              onPaymentSuccess={async () => {
                // Optionally refresh field or show a message
                const reload = await fetchUserField();
                setExisting(reload?.data || null);
                setStatus({ type: "success", message: "Payment successful!" });
              }}
            />
          )}
        </div>
      )}

      {/* ── EDIT / NEW draw mode ── */}
      {(editMode || !existing) && (
        <div className="space-y-4">
          {editMode && existing && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs">
              <span className="material-symbols-outlined text-sm">info</span>
              {t('editModeInfo')}
            </div>
          )}

          <FieldDrawMap
            onDraw={handleDraw}
            onClear={handleClear}
            fieldName={fieldName}
            onFieldNameChange={setFieldName}
            initialFeature={editMode ? existing?.geojson : null}
            initialDistrict={editMode ? existing?.district : null}
            height="600px"
          />

          {/* Summary + price */}
          {drawnFeature && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/85">{t('selectionSummary')}</p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {fieldName && (
                    <div className="col-span-2">
                      <span className="text-white/85 block text-xs mb-0.5">{t('fieldNameLabel')}</span>
                      <span className="font-bold text-white">{fieldName}</span>
                    </div>
                  )}
                  {district && (
                    <div>
                      <span className="text-white/85 block text-xs mb-0.5">{t('district')}</span>
                      <span className="font-bold text-white">{localizedSelectedDistrict}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-white/85 block text-xs mb-0.5">{t('areaStat')}</span>
                    <span className="font-bold text-white">{acres.toFixed(4)} {t('unitAcres')}</span>
                  </div>
                  <div>
                    <span className="text-white/85 block text-xs mb-0.5">{t('areaSqmLabel')}</span>
                    <span className="font-bold text-white">{(acres * 4046.86).toFixed(0)} m²</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300">{t('annualCostLabel')}</span>
                <span className="text-3xl font-black text-emerald-400">Rs. {price.toLocaleString()}</span>
                <span className="text-[10px] text-white/85">Rs. {PRICE_PER_ACRE_LKR.toLocaleString()} {t('mapPerAcreSuffix')}</span>
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
                  setFieldName(existing?.field_name || "");
                }}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold transition-all text-sm"
              >
                {t('cancelBtn')}
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
                  {t('savingField')}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  {t('saveFieldBtn')}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
