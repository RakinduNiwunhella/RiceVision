import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../supabaseClient";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import TutorialTooltip from "../../components/TutorialTooltip";
import { usePageTutorial } from "../../hooks/usePageTutorial";

const healthColor = (health) => {
  switch (health) {
    case "Healthy":
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "Moderate":
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "Critical":
      return "text-red-400 bg-red-500/10 border-red-500/20";
    default:
      return "text-white/40 bg-white/5 border-white/10";
  }
};

const FieldData = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [stats, setStats] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tutorial setup
  const tutorialSteps = [
    {
      title: "Field Data Overview",
      action: "This page shows a summary of all your field statistics",
      outcome: "You'll see total fields, healthy count, stressed crops, and critical alerts",
    },
    {
      title: "Summary Statistics",
      action: "Check the stat cards for quick field health metrics",
      outcome: "Green = Healthy fields, Yellow = Stressed fields, Red = Critical alerts. Total count helps track overall land area",
    },
    {
      title: "District Comparison Table",
      action: "Scroll through the table to see field data for each district",
      outcome: "Compare health percentages, total yield, and average stress levels across districts. Sort by clicking column headers",
    },
    {
      title: "View on Map",
      action: "Click 'View Map' button next to any district to navigate to Field Map",
      outcome: "Satellite visualization zooms to that district for detailed location-based analysis",
    },
  ];

  const { currentStep, showTutorial, currentTutorialStep, hasMoreSteps, nextStep, prevStep, closeTutorial } =
    usePageTutorial("field-data", tutorialSteps);

  // Refs for tutorial
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const tableRef = useRef(null);
  const mapButtonRef = useRef(null);

  const handleViewMap = (district) => {
    // navigate to map page and filter/zoom to the selected district
    navigate("/field-map", { state: { district } });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: summary, error: summaryError } = await supabase
        .from("field_summary_view")
        .select("*")
        .single();

      if (summaryError) {
        console.error("Summary error:", summaryError);
        setLoading(false);
        return;
      }

      setStats([
        { label: t('colTotalFields'), value: summary.total_fields, icon: "analytics" },
        { label: t('colHealthy'), value: summary.healthy_fields, icon: "check_circle", color: "text-emerald-400" },
        { label: t('colStressed'), value: summary.stressed_fields, icon: "potted_plant", color: "text-amber-400" },
        { label: t('colCritical'), value: summary.critical_alerts, icon: "warning", color: "text-red-400" },
      ]);

      const { data: districts, error: districtError } = await supabase
        .from("district_health_summary")
        .select("*")
        .order("total_yield_kg", { ascending: false });

      if (districtError) {
        console.error("District error:", districtError);
        setLoading(false);
        return;
      }

      setDistrictData(districts);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-white/40 font-black uppercase tracking-widest text-xs animate-pulse">{t('decryptingIntel')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-10 text-white font-sans transition-all duration-500">
      <div className="max-w-7xl mx-auto space-y-10 pb-20">

        {/* Page Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              Field Data
            </h1>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-sm mt-2 font-bold uppercase tracking-[0.2em]">
              {t('liveStream')}
            </p>
          </div>
                  </div>

        {/* Stats Cards */}
        <div ref={currentStep === 1 ? statsRef : undefined} className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item) => (
            <div
              key={item.label}
              className="glass glass-hover p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/10 shadow-xl group transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`material-symbols-outlined ${item.color || 'text-white/40'} text-3xl group-hover:scale-110 transition-transform duration-500`}>
                  {item.icon}
                </span>
              </div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">
                {item.label}
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tighter">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div ref={currentStep === 2 ? tableRef : undefined} className="glass p-1 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden group">
          <div className="p-4 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-emerald-400">dataset</span>
              {t('districtPerformance')}
            </h2>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-white/30 uppercase text-[10px] font-black tracking-widest border-b border-white/5 whitespace-nowrap">
                  <th className="px-3 sm:px-6 md:px-8 py-3 sm:py-5 text-left font-black whitespace-nowrap">District</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-5 text-left font-black whitespace-nowrap">Total Fields</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-5 text-left font-black whitespace-nowrap">Healthy</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-5 text-left font-black whitespace-nowrap">Stressed</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-5 text-left font-black whitespace-nowrap">Critical</th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-5 text-left font-black whitespace-nowrap">Avg Yield</th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 md:px-8 py-3 sm:py-5 text-right font-black whitespace-nowrap">Total Yield</th>
                  <th className="px-3 sm:px-6 py-3 sm:py-5 text-center font-black whitespace-nowrap">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 font-medium">
                {districtData.map((d) => (
                  <tr
                    key={d.district}
                    className="hover:bg-white/5 transition-all duration-300 group/row whitespace-nowrap"
                  >
                    <td className="px-3 sm:px-6 md:px-8 py-3 sm:py-5">
                      <div className="text-center flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 group-hover/row:bg-emerald-400 transition-colors" />
                        <span className="font-black text-white group-hover/row:translate-x-1 transition-transform inline-block">
                          {d.district}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-center text-white/60 font-bold">{d.total_fields}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-center">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-black uppercase">
                        {d.healthy_fields}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-center">
                      <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-black uppercase">
                        {d.stressed_fields}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-center">
                      <span className="px-3 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-[11px] font-black uppercase">
                        {d.critical_fields}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 sm:py-5 text-center">
                      <div className="flex flex-col">
                        <span className="text-white/80">{d.avg_yield_kg_ha}</span>
                        <span className="text-[10px] text-white/20 uppercase font-black tracking-tighter">kg/Ha</span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 md:px-8 py-3 sm:py-5 text-center">
                      <span className="font-black text-center text-white">{Number(d.total_yield_kg).toLocaleString()}</span>
                      <span className="ml-1 text-[10px] text-white/40 uppercase font-black">kg</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-5 text-center">
                      <div ref={mapButtonRef} className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewMap(d.district)}
                          className="glass-btn text-[10px] px-3 py-1 tracking-widest bg-white/10 hover:bg-white/20"
                        >
                          View Map
                        </button>

                        <button
                          onClick={() => navigate("/reports", { state: { district: d.district } })}
                          className="glass-btn text-[10px] px-3 py-1 tracking-widest bg-white/10 hover:bg-white/20"
                        >
                          View Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                elementRef={headerRef}
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
                position="bottom"
                title={currentTutorialStep.title}
                action={currentTutorialStep.action}
                outcome={currentTutorialStep.outcome}
                elementRef={statsRef}
                step={currentStep}
                totalSteps={tutorialSteps.length}
                onNext={nextStep}
                onPrevious={prevStep}
                onDismiss={closeTutorial}
              />
            )}
            {currentStep === 2 && (
              <TutorialTooltip
                visible={true}
                position="bottom"
                title={currentTutorialStep.title}
                action={currentTutorialStep.action}
                outcome={currentTutorialStep.outcome}
                elementRef={tableRef}
                step={currentStep}
                totalSteps={tutorialSteps.length}
                onNext={nextStep}
                onPrevious={prevStep}
                onDismiss={closeTutorial}
              />
            )}
            {currentStep === 3 && (
              <TutorialTooltip
                visible={true}
                position="top"
                title={currentTutorialStep.title}
                action={currentTutorialStep.action}
                outcome={currentTutorialStep.outcome}
                elementRef={mapButtonRef}
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

export default FieldData;
