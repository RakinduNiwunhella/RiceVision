import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FiltersPanel from "../Map/FiltersPanel";
import MapLayersPanel from "../Map/MapLayersPanel";
import RiceMap from "../Map/RiceMap";
import { useSearchParams } from "react-router-dom";
import TutorialTooltip from "../../components/TutorialTooltip";
import { usePageTutorial } from "../../hooks/usePageTutorial";

/* Normalize health values so they match checkbox labels exactly */
function normalizeHealth(value) {
  if (!value) return null;

  const v = value.trim().toLowerCase();

  if (v === "healthy") return "Healthy";
  if (v === "normal") return "Normal";
  if (v === "mild stress") return "Mild Stress";
  if (v === "severe stress") return "Severe Stress";
  if (v === "not applicable") return "Not Applicable";

  return null;
}

export default function FieldMap() {
  const location = useLocation();
  const state = location.state || {};
  const [searchParams] = useSearchParams();
  const districtFromURL = searchParams.get("district");
  const navigate = useNavigate();

  /* Tutorial setup */
  const tutorialSteps = [
    {
      title: "Field Map: Satellite View",
      action: "This interactive satellite map shows your field locations and conditions",
      outcome: "You'll see field boundaries, vegetation health, satellite imagery, and can apply filters",
    },
    {
      title: "Filters Panel",
      action: "Click the left panel to filter by district, season, and health status",
      outcome: "Map updates to show only fields matching your filter criteria. Use to focus on specific areas",
    },
    {
      title: "Layers Panel",
      action: "Click the right panel to toggle different satellite layers and overlays",
      outcome: "Choose between satellite imagery, vegetation indices (NDVI/EVI), radar data (VV/VH), and road overlays",
    },
    {
      title: "Health Indicators",
      action: "View different colors on the map showing field health status",
      outcome: "Green = Healthy, Yellow = Mild Stress, Orange/Red = Severe Stress. Color coding helps spot problem areas",
    },
    {
      title: "Interactive Features",
      action: "Click on field markers, zoom with mouse wheel, pan by dragging",
      outcome: "Explore detailed field information, get precise location coordinates, and measure distances",
    },
  ];

  const { currentStep, showTutorial, currentTutorialStep, hasMoreSteps, nextStep, prevStep, closeTutorial } =
    usePageTutorial("field-map", tutorialSteps);

  /* Refs for tutorial */
  const mapContainerRef = useRef(null);
  const filtersPanelRef = useRef(null);
  const layersPanelRef = useRef(null);

  /* Used to zoom map to alert location */
  const flyTo = state?.type ? state : null;

  /* Filters state */
  const [filters, setFilters] = useState({
    districts: [],
    season: "all",
    health: [],
  });

  /* Map layers state */
  const [layers, setLayers] = useState({
    paddyExtent: false,
    showCircles: false,
    showSatellite: false,
    showRoadOverlay: false,
    roadOpacity: 0.6,
    ndvi: false,
    evi: false,
    vv: false,
    vh: false,
    overlayOpacity: 0.75,
  });

  /* Sync filters when arriving from Alerts page */
  /* Sync filters when arriving from Alerts page */
  useEffect(() => {
    if (!state) return;

    const normalizedHealth = normalizeHealth(state.health);

    setFilters((prev) => ({
      ...prev,
      districts: state.district ? [state.district] : prev.districts,
      health: normalizedHealth ? [normalizedHealth] : prev.health,
    }));
  }, [state?.district, state?.health]);

  /* Sync filters when arriving from Search */
  useEffect(() => {
    if (!districtFromURL) return;

    const formattedDistrict = districtFromURL
      .replace(/[-_]/g, " ")
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    console.log("District from URL:", districtFromURL);
    console.log("Formatted district:", formattedDistrict);

    setFilters((prev) => ({
      ...prev,
      districts: [formattedDistrict],
    }));

    // clear query param after applying filter
    navigate("/field-map", { replace: true });
  }, [districtFromURL, navigate]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-[calc(100vh-4rem)] p-3 sm:p-6">
      {/* Filters Panel */}
      <div ref={currentStep === 1 ? filtersPanelRef : undefined} className="flex flex-col gap-4 sm:gap-6 w-full lg:w-auto">
        <FiltersPanel filters={filters} setFilters={setFilters} />
      </div>

      {/* Map */}
      <div ref={currentStep === 0 ? mapContainerRef : undefined} className="flex-1 rounded-2xl sm:rounded-3xl overflow-hidden glass border-white/20 shadow-2xl h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[80vh]">
        <RiceMap filters={filters} layers={layers} flyTo={flyTo} />
      </div>

      {/* Map Layers */}
      <div ref={currentStep === 2 ? layersPanelRef : undefined} className="flex flex-col gap-4 sm:gap-6 w-full lg:w-auto">
        <MapLayersPanel
          layers={layers}
          setLayers={setLayers}
          districtSelected={filters.districts.length > 0}
        />
      </div>

      {/* Tutorial Tooltips */}
      {showTutorial && currentTutorialStep && (
        <>
          {currentStep === 0 && mapContainerRef.current && (
            <TutorialTooltip
              visible={true}
              position="bottom"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              elementRef={mapContainerRef}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={() => {
                if (hasMoreSteps) nextStep();
                else closeTutorial();
              }}
            />
          )}
          {currentStep === 1 && filtersPanelRef.current && (
            <TutorialTooltip
              visible={true}
              position="right"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              elementRef={filtersPanelRef}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={() => {
                if (hasMoreSteps) nextStep();
                else closeTutorial();
              }}
            />
          )}
          {currentStep === 2 && layersPanelRef.current && (
            <TutorialTooltip
              visible={true}
              position="left"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              elementRef={layersPanelRef}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={() => {
                if (hasMoreSteps) nextStep();
                else closeTutorial();
              }}
            />
          )}
          {currentStep === 3 && (
            <TutorialTooltip
              visible={true}
              position="top"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={() => {
                if (hasMoreSteps) nextStep();
                else closeTutorial();
              }}
            />
          )}
          {currentStep === 4 && (
            <TutorialTooltip
              visible={true}
              position="top"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={() => {
                if (hasMoreSteps) nextStep();
                else closeTutorial();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
