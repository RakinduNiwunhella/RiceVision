import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { updateAlertStatus } from "../../api/api";
import { apiFetch } from "../../api/apiFetch";
import { useLanguage } from "../../context/LanguageContext";
import {
  translateDisasterType,
  translateHealthCategory,
  translateStageCategory,
} from "../../utils/agriTranslations";
import { translateDistrictName } from "../../utils/locationTranslations";
import TutorialTooltip from "../../Components/TutorialTooltip";
import { usePageTutorial } from "../../hooks/usePageTutorial";

const TAB_KEYS = ["Pest Risks", "Disasters", "Past Alerts"];

// Renders a pest title like "Kurunegala • 32 RISKS" with the number in red.
// Returns a plain string for disaster titles.
const renderTitle = (title, isPest, isPast) => {
  if (!isPest) return title;
  // Match: "District : NUMBER <suffix>"
  const match = title.match(/^(.+?:\s*)(\d+)(\s*.+)$/);
  if (!match) return title;
  return (
    <span>
      {match[1]}
      <span className={`risk-count ${isPast ? "!text-white/85" : ""}`}>
        {match[2]}
        {match[3]}
      </span>
    </span>
  );
};

// Groups pest alert rows by district, returns one card per district.
// Used for both active Pest Risks tab and Past Alerts rendering.
const groupPestAlertsByDistrict = (rows) => {
  const groups = {};
  rows.forEach((a) => {
    const key = `${a.field}-${a.status}`;
    if (!groups[key]) {
      groups[key] = { ...a, count: a.count || 1 };
    } else {
      groups[key].count += a.count || 1;
      if (!groups[key].note && a.note) groups[key].note = a.note;
    }
  });
  return Object.values(groups);
};

/* ─────────────────────────────────────────
   RESOLVE MODAL
───────────────────────────────────────── */
const ResolveModal = ({ onConfirm, onCancel, t }) => {
  const [note, setNote] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="glass rounded-3xl border border-white/20 p-8 w-full max-w-md mx-4 flex flex-col gap-5">
        <h3 className="text-lg font-black text-white">
          {t("resolveAlertTitle")}
        </h3>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase text-white/85">
            {t("resolutionNoteOptional")}
          </label>
          <textarea
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("resolutionNotePlaceholder")}
            rows={4}
            className="bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white placeholder:text-white/85 resize-none focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="glass-btn text-[10px] px-4 py-2 tracking-widest bg-white/10 hover:bg-white/20"
          >
            {t("cancelBtn")}
          </button>
          <button
            onClick={() => onConfirm(note.trim() || null)}
            className="px-6 py-2 bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold hover:bg-emerald-500/50 transition-colors"
          >
            {t("confirmBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
const Alerts = () => {
  const { t, language } = useLanguage();
  const tabLabels = [t("pestRisks"), t("disasters"), t("pastAlerts")];

  // Tutorial setup - create once and memoize
  const tutorialSteps = useMemo(
    () => [
      {
        title: t("alertsTutorialTabsTitle"),
        action: t("alertsTutorialTabsAction"),
        outcome: t("alertsTutorialTabsOutcome"),
      },
      {
        title: t("alertsTutorialSearchTitle"),
        action: t("alertsTutorialSearchAction"),
        outcome: t("alertsTutorialSearchOutcome"),
      },
      {
        title: t("alertsTutorialResolveTitle"),
        action: t("alertsTutorialResolveAction"),
        outcome: t("alertsTutorialResolveOutcome"),
      },
      {
        title: t("alertsTutorialIgnoreTitle"),
        action: t("alertsTutorialIgnoreAction"),
        outcome: t("alertsTutorialIgnoreOutcome"),
      },
      {
        title: t("alertsTutorialMapTitle"),
        action: t("alertsTutorialMapAction"),
        outcome: t("alertsTutorialMapOutcome"),
      },
    ],
    [t],
  );

  const {
    currentStep,
    showTutorial,
    currentTutorialStep,
    hasMoreSteps,
    nextStep,
    prevStep,
    closeTutorial,
  } = usePageTutorial("alerts", tutorialSteps);

  const [alerts, setAlerts] = useState([]);
  const [globalAlerts, setGlobalAlerts] = useState({ Open: 0, Resolved: 0 });
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("alerts_tab") || "Disasters",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [resolveModal, setResolveModal] = useState({
    open: false,
    alertId: null,
    alertType: null,
  });
  const [exitingId, setExitingId] = useState(null);

  // Refs for tutorial tooltips
  const tabsRef = useRef(null);
  const searchRef = useRef(null);
  const resolveRef = useRef(null);
  const ignoreRef = useRef(null);
  const mapRef = useRef(null);

  const navigate = useNavigate();

  /* ---------------- FILTERED ALERTS ---------------- */

  const filteredAlerts = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();

    return alerts.filter((alert) => {
      const title = (alert.title ?? "").toLowerCase();
      const description = (alert.description ?? "").toLowerCase();

      const matchesSearch =
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch);

      if (activeTab === "Past Alerts") {
        return (
          matchesSearch &&
          (alert.status === "Resolved" || alert.status === "Ignored")
        );
      }

      // Hide resolved/ignored alerts from active tabs
      return (
        matchesSearch &&
        alert.status !== "Resolved" &&
        alert.status !== "Ignored"
      );
    });
  }, [alerts, searchTerm, activeTab]);

  /* ---------------- LOAD TAB ALERTS ---------------- */

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        let endpoint = "";

        if (activeTab === "Disasters") {
          endpoint = "/api/alerts/disasters";
        } else if (activeTab === "Pest Risks") {
          endpoint = "/api/alerts/pest-risk";
        } else if (activeTab === "Past Alerts") {
          endpoint = "/api/alerts/past";
        }

        const response = await apiFetch(endpoint);

        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }

        const data = await response.json();

        /* ---------------- DISASTER ALERTS ---------------- */

        if (activeTab === "Disasters") {
          const mappedAlerts = (Array.isArray(data) ? data : []).map((a) => ({
            id: a.id,
            title: `${translateDisasterType(a.disaster_type, t)} ${t("alertRiskLabel")}`,
            description: `${t("alertStage")}: ${translateStageCategory(a.stage, t)} | ${t("alertHealth")}: ${translateHealthCategory(a.health, t)}`,
            status: a.status || "Open",
            priority: "High",
            field: a.district,
            health: a.health,
            timestamp: a.timestamp,
            lat: a.lat,
            lon: a.lon,
          }));

          setAlerts(mappedAlerts);
        } else if (activeTab === "Pest Risks") {
          /* ---------------- PEST ALERTS ---------------- */
          const mappedAlerts = (Array.isArray(data) ? data : [])
            .filter((a) => a.risky_pixels > 0)
            .map((a) => ({
              id: a.district,
              title: `${translateDistrictName(a.district, language)} : ${a.risky_pixels} ${t("alertRisksSuffix")}`,
              description: t("alertMultiplePestRisks"),
              status: a.status || "Open",
              priority: "High",
              field: a.district,
              health: a.health || "Not Applicable",
              count: a.risky_pixels,
              locations: a.risky_pixel_locations || [],
              timestamp: new Date().toISOString(),
            }));

          setAlerts(mappedAlerts);
        } else if (activeTab === "Past Alerts") {
          /* ---------------- PAST ALERTS ---------------- */
          // Backend already groups pest rows by district and returns
          // { is_pest, district, risk_count, disaster_type, status, note, timestamp, ... }
          const mappedAlerts = (Array.isArray(data) ? data : []).map((a) => ({
            id: a.id,
            title: a.is_pest
              ? `${translateDistrictName(a.district, language)} : ${a.risk_count} ${t("alertRisksSuffix")}`
              : `${translateDisasterType(a.disaster_type, t)} ${t("alertRiskLabel")}`,
            description: `${t("alertStage")}: ${translateStageCategory(a.stage_name, t)} | ${t("alertHealth")}: ${translateHealthCategory(a.paddy_health, t)}`,
            status: a.status,
            field: a.district,
            health: a.paddy_health,
            timestamp: a.timestamp,
            note: a.note || null,
            isPest: a.is_pest,
            lat: a.lat,
            lon: a.lon,
          }));

          setAlerts(mappedAlerts);
        }
      } catch (err) {
        console.error("Error fetching alerts:", err);
      }
    };

    loadAlerts();
  }, [activeTab, language, t]);

  /* ---------------- LOAD GLOBAL ALERT COUNTS ---------------- */

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const res = await apiFetch("/api/alerts/status-counts");
        const data = await res.json();

        setGlobalAlerts({
          Open: data.Open || 0,
          Resolved: data.Resolved || 0,
        });
      } catch (err) {
        console.error("Failed to load alert counters", err);
      }
    };

    loadCounts();
  }, []);

  /* ---------------- COUNTERS ---------------- */

  const counts = useMemo(() => {
    return {
      Open: globalAlerts.Open,
      Resolved: globalAlerts.Resolved,
    };
  }, [globalAlerts]);

  /* ---------------- STATUS UPDATE (optimistic) ---------------- */

  const updateStatus = async (id, newStatus, note = null) => {
    const snapshot = alerts.find((a) => a.id === id);
    if (!snapshot) return;

    const isPest = activeTab === "Pest Risks";

    // Kick off exit animation, then remove after it completes
    setExitingId(id);
    setTimeout(() => {
      setExitingId(null);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 260);

    try {
      await updateAlertStatus(id, newStatus, isPest ? "pest" : "normal", note);
    } catch (err) {
      console.error("Error updating alert:", err);
      setAlerts((prev) => [snapshot, ...prev]);
    }
  };

  /* ---------------- MODAL HANDLERS ---------------- */

  const handleResolve = (id) => {
    setResolveModal({
      open: true,
      alertId: id,
      alertType: activeTab === "Pest Risks" ? "pest" : "normal",
    });
  };

  const handleModalConfirm = (note) => {
    const { alertId } = resolveModal;
    setResolveModal({ open: false, alertId: null, alertType: null });
    updateStatus(alertId, "Resolved", note);
  };

  const handleModalCancel = () => {
    setResolveModal({ open: false, alertId: null, alertType: null });
  };

  const handleIgnore = (id) => updateStatus(id, "Ignored");

  /* ---------------- MAP NAVIGATION ---------------- */

  const handleViewInMap = (alert) => {
    if (activeTab === "Pest Risks" && alert.locations?.length > 0) {
      navigate("/field-map", {
        state: {
          type: "pest",
          district: alert.field,
          locations: alert.locations,
          health: alert.health,
        },
      });
    } else if (alert.lat != null && alert.lon != null) {
      navigate("/field-map", {
        state: {
          type: "disaster",
          district: alert.field,
          disasterType: alert.title,
          health: alert.health,
          lat: alert.lat,
          lon: alert.lon,
        },
      });
    }
  };

  const formatTimestamp = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="min-h-full p-6 lg:p-10 text-white font-sans">
      {resolveModal.open && (
        <ResolveModal
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
          t={t}
        />
      )}

      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white">
              {t("fieldRiskAlerts")}
            </h1>
            <p className="text-white/85 text-xs mt-1 font-bold uppercase tracking-[0.2em]">
              {t("alertsRealtimeSubtitle")}
            </p>
          </div>

          <div className="flex gap-3">
            <div className="glass px-4 py-2 rounded-xl border-white/10">
              <span className="text-[10px] font-black uppercase text-white/85 block">
                {t("active")}
              </span>
              <span className="text-lg font-black text-red-400">
                {counts.Open}
              </span>
            </div>

            <div className="glass px-4 py-2 rounded-xl border-white/10">
              <span className="text-[10px] font-black uppercase text-white/85 block">
                {t("resolved")}
              </span>
              <span className="text-lg font-black text-emerald-400">
                {counts.Resolved}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass p-6 rounded-[2rem] border-white/20">
          <div className="flex flex-col lg:flex-row gap-6 justify-between">
            <div
              className="flex p-1 rounded-2xl bg-white/5 border border-white/10 w-full sm:w-fit overflow-x-auto no-scrollbar"
              ref={tabsRef}
            >
              {TAB_KEYS.map((key, idx) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    localStorage.setItem("alerts_tab", key);
                  }}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === key
                      ? "bg-white/15 text-white"
                      : "text-white/85 hover:text-white/90"
                  }`}
                >
                  {tabLabels[idx]}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder={t("findAnomaly")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              ref={searchRef}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white placeholder:text-white/85"
            />
          </div>
        </div>

        {/* Alerts List */}

        <div className="space-y-6">
          {filteredAlerts.length === 0 && (
            <div className="glass p-8 sm:p-12 md:p-20 rounded-2xl sm:rounded-[2rem] text-center">
              <p className="text-white/85 font-bold uppercase">
                {t("noPastThreats")}
              </p>
            </div>
          )}

          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`glass p-6 rounded-3xl border border-white/10${exitingId === alert.id ? " alert-exit" : ""}`}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2
                    className={`text-xl font-black ${activeTab === "Past Alerts" ? "text-white/85" : "text-emerald-400"}`}
                  >
                    {renderTitle(
                      alert.title,
                      alert.isPest || activeTab === "Pest Risks",
                      activeTab === "Past Alerts",
                    )}
                  </h2>

                  <p className="text-white/85 text-sm mt-1">
                    {alert.description}
                  </p>

                  <span className="text-xs text-white/85">
                    {formatTimestamp(alert.timestamp)}
                  </span>

                  {activeTab === "Past Alerts" && alert.note && (
                    <p className="text-white/85 text-xs mt-1">
                      {t("noteLabel")}: {alert.note}
                    </p>
                  )}
                </div>

                {alert.status === "Open" && activeTab !== "Past Alerts" && (
                  <div className="flex gap-3">
                    <button
                      ref={(currentStep === 2 && resolveRef) || undefined}
                      onClick={() => handleResolve(alert.id)}
                      className="px-4 sm:px-6 py-2 bg-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold"
                    >
                      {t("resolveBtn")}
                    </button>

                    <button
                      ref={(currentStep === 3 && ignoreRef) || undefined}
                      onClick={() => handleIgnore(alert.id)}
                      className="btn-ignore glass-btn text-[10px] px-3 py-1 tracking-widest bg-white/10 hover:bg-white/20"
                    >
                      {t("ignoreBtn")}
                    </button>

                    <button
                      ref={(currentStep === 4 && mapRef) || undefined}
                      onClick={() => handleViewInMap(alert)}
                      className="glass-btn text-[10px] px-3 py-1 tracking-widest bg-white/10 hover:bg-white/20"
                    >
                      {t("viewInMap")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tutorial Tooltips */}
        {showTutorial && currentTutorialStep && (
          <>
            {currentStep === 0 && (
              <TutorialTooltip
                visible={true}
                position="bottom"
                title={currentTutorialStep.title}
                action={currentTutorialStep.action}
                outcome={currentTutorialStep.outcome}
                elementRef={tabsRef}
                step={currentStep}
                totalSteps={tutorialSteps.length}
                onNext={nextStep}
                onPrevious={prevStep}
                onDismiss={closeTutorial}
              />
            )}
            {currentStep === 1 && (
              <TutorialTooltip
                visible={true}
                position="top"
                title={currentTutorialStep.title}
                action={currentTutorialStep.action}
                outcome={currentTutorialStep.outcome}
                elementRef={searchRef}
                step={currentStep}
                totalSteps={tutorialSteps.length}
                onNext={nextStep}
                onPrevious={prevStep}
                onDismiss={closeTutorial}
              />
            )}
            {currentStep === 2 && resolveRef.current && (
              <TutorialTooltip
                visible={true}
                position="top"
                title={currentTutorialStep.title}
                action={currentTutorialStep.action}
                outcome={currentTutorialStep.outcome}
                elementRef={resolveRef}
                step={currentStep}
                totalSteps={tutorialSteps.length}
                onNext={nextStep}
                onPrevious={prevStep}
                onDismiss={closeTutorial}
              />
            )}
            {currentStep === 3 && ignoreRef.current && (
              <TutorialTooltip
                visible={true}
                position="top"
                title={currentTutorialStep.title}
                action={currentTutorialStep.action}
                outcome={currentTutorialStep.outcome}
                elementRef={ignoreRef}
                step={currentStep}
                totalSteps={tutorialSteps.length}
                onNext={nextStep}
                onPrevious={prevStep}
                onDismiss={closeTutorial}
              />
            )}
            {currentStep === 4 && mapRef.current && (
              <TutorialTooltip
                visible={true}
                position="top"
                title={currentTutorialStep.title}
                action={currentTutorialStep.action}
                outcome={currentTutorialStep.outcome}
                elementRef={mapRef}
                step={currentStep}
                totalSteps={tutorialSteps.length}
                onNext={nextStep}
                onPrevious={prevStep}
                onDismiss={closeTutorial}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Alerts;
