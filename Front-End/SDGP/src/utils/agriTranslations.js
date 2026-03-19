/**
 * Agricultural Category Translation Utilities
 * Maps backend values to localized translations
 */

// Normalize health status to canonical form
export function normalizeHealthCategory(value) {
  if (!value) return null;
  const normalized = String(value).toLowerCase().trim();
  
  // Map variations to canonical values
  if (normalized === 'healthy' || normalized === 'normal' || normalized === 'good') return 'Normal';
  if (normalized === 'mild' || normalized === 'mild stress' || normalized === 'moderate stress') return 'Mild Stress';
  if (normalized === 'severe' || normalized === 'severe stress' || normalized === 'poor' || normalized === 'critical') return 'Severe Stress';
  if (normalized === 'n/a' || normalized === 'not applicable' || normalized === 'na') return 'Not Applicable';
  
  // Default: try to return canonical form if recognized
  return null;
}

// Translate health category
export function translateHealthCategory(value, t) {
  const canonical = normalizeHealthCategory(value);
  if (!canonical) return value || t("mapNotAvailable");
  
  const keyMap = {
    'Normal': 'healthNormal',
    'Mild Stress': 'healthMildStress',
    'Severe Stress': 'healthSevereStress',
    'Not Applicable': 'healthNotApplicable'
  };
  
  const key = keyMap[canonical];
  return key ? t(key) : canonical;
}

// Translate growth stage
export function translateStageCategory(value, t) {
  if (!value) return t("mapNotAvailable");
  const normalized = String(value).toLowerCase().trim();
  
  const stageKeyMap = {
    
    'vegetative': 'stageVegetative',
    'transplant': 'stageTransplant',
    'reproductive': 'stageReproductive',
    'ripening': 'stageRipening',
    'harvest': 'stageHarvest'
  };
  
  const key = stageKeyMap[normalized];
  return key ? t(key) : value;
}

// Translate pest risk level
export function translatePestRisk(value, t) {
  if (value === null || value === undefined) return t("mapNotAvailable");
  
  const numValue = Number(value);
  if (isNaN(numValue)) return value;
  
  if (numValue === 0) return t("pestRiskNone");
  if (numValue === 1) return t("pestRiskLow");
  if (numValue === 2) return t("pestRiskMedium");
  if (numValue >= 3) return t("pestRiskHigh");
  
  return t("mapNotAvailable");
}

// Translate disaster/weather risk
export function translateDisasterRisk(value, t) {
  if (!value) return t("mapNotAvailable");
  const normalized = String(value).toLowerCase().trim();
  
  if (normalized === 'low' || normalized === 'none') return t("disasterRiskLow");
  if (normalized === 'medium' || normalized === 'moderate') return t("disasterRiskModerate");
  if (normalized === 'high') return t("disasterRiskHigh");
  if (normalized === 'severe') return t("disasterRiskSevere");
  
  return value;
}

const DISASTER_TYPE_KEY_MAP = {
  wind: "disasterTypeWind",
  cyclone: "disasterTypeCyclone",
  storm: "disasterTypeStorm",
  thunderstorm: "disasterTypeThunderstorm",
  flood: "disasterTypeFlood",
  drought: "disasterTypeDrought",
  landslide: "disasterTypeLandslide",
  heatwave: "disasterTypeHeatWave",
  wildfire: "disasterTypeFire",
  fire: "disasterTypeFire",
  heavyrain: "disasterTypeHeavyRain",
  rain: "disasterTypeHeavyRain",
  pest: "disasterTypePest",
  disease: "disasterTypeDisease",
  tsunami: "disasterTypeTsunami",
};

function toTitleCase(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeDisasterType(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function resolveDisasterTypeKey(value) {
  const normalized = normalizeDisasterType(value);
  const compact = normalized.replace(/\s+/g, "");

  if (DISASTER_TYPE_KEY_MAP[compact]) return DISASTER_TYPE_KEY_MAP[compact];
  if (DISASTER_TYPE_KEY_MAP[normalized]) return DISASTER_TYPE_KEY_MAP[normalized];

  if (normalized.includes("wind")) return "disasterTypeWind";
  if (normalized.includes("cyclone")) return "disasterTypeCyclone";
  if (normalized.includes("thunder")) return "disasterTypeThunderstorm";
  if (normalized.includes("storm")) return "disasterTypeStorm";
  if (normalized.includes("flood")) return "disasterTypeFlood";
  if (normalized.includes("drought")) return "disasterTypeDrought";
  if (normalized.includes("landslide")) return "disasterTypeLandslide";
  if (normalized.includes("heat")) return "disasterTypeHeatWave";
  if (normalized.includes("fire")) return "disasterTypeFire";
  if (normalized.includes("heavy rain")) return "disasterTypeHeavyRain";
  if (normalized.includes("rain")) return "disasterTypeHeavyRain";
  if (normalized.includes("pest")) return "disasterTypePest";
  if (normalized.includes("disease")) return "disasterTypeDisease";
  if (normalized.includes("tsunami")) return "disasterTypeTsunami";

  return null;
}

export function translateDisasterType(value, t) {
  if (!value) return t("mapNotAvailable");

  const key = resolveDisasterTypeKey(value);
  if (key) return t(key);

  return toTitleCase(value);
}

// Export canonical health filter values
export const HEALTH_FILTER_VALUES = [
  'Normal',
  'Mild Stress',
  'Severe Stress',
  'Not Applicable'
];

// Helper to get health color consistently
export function getHealthColor(health) {
  const canonical = normalizeHealthCategory(health);
  
  if (canonical === 'Normal' || canonical === 'Healthy') return '#22c55e';
  if (canonical === 'Mild Stress') return '#facc15';
  if (canonical === 'Severe Stress') return '#dc2626';
  if (canonical === 'Not Applicable') return '#696969';
  
  return '#2563eb';
}
