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
