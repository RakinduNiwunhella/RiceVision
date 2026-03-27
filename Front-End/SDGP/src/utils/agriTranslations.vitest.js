import { describe, it, expect } from 'vitest';
import { 
  normalizeHealthCategory, 
  translateHealthCategory, 
  translateStageCategory, 
  translatePestRisk, 
  translateDisasterRisk, 
  translateDisasterType,
  getHealthColor
} from './agriTranslations';

describe('agriTranslations Utilities', () => {
  const t = (key) => key; // Mock translation function

  describe('normalizeHealthCategory', () => {
    it('should normalize various health status strings', () => {
      expect(normalizeHealthCategory('healthy')).toBe('Normal');
      expect(normalizeHealthCategory('normal')).toBe('Normal');
      expect(normalizeHealthCategory('mild stress')).toBe('Mild Stress');
      expect(normalizeHealthCategory('moderate stress')).toBe('Mild Stress');
      expect(normalizeHealthCategory('severe')).toBe('Severe Stress');
      expect(normalizeHealthCategory('critical')).toBe('Severe Stress');
      expect(normalizeHealthCategory('n/a')).toBe('Not Applicable');
    });

    it('should return null for unknown values', () => {
      expect(normalizeHealthCategory('unknown')).toBeNull();
      expect(normalizeHealthCategory('')).toBeNull();
      expect(normalizeHealthCategory(null)).toBeNull();
    });
  });

  describe('translateHealthCategory', () => {
    it('should translate valid health categories', () => {
      expect(translateHealthCategory('healthy', t)).toBe('healthNormal');
      expect(translateHealthCategory('mild', t)).toBe('healthMildStress');
      expect(translateHealthCategory('severe', t)).toBe('healthSevereStress');
    });

    it('should return original value or fallback if unknown', () => {
      expect(translateHealthCategory('Random', t)).toBe('Random');
      expect(translateHealthCategory(null, t)).toBe('mapNotAvailable');
    });
  });

  describe('translateStageCategory', () => {
    it('should translate growth stages', () => {
      expect(translateStageCategory('vegetative', t)).toBe('stageVegetative');
      expect(translateStageCategory('harvest', t)).toBe('stageHarvest');
    });

    it('should handle missing or unknown stages', () => {
      expect(translateStageCategory(null, t)).toBe('mapNotAvailable');
      expect(translateStageCategory('Flowering', t)).toBe('Flowering');
    });
  });

  describe('translatePestRisk', () => {
    it('should translate numeric pest risk levels', () => {
      expect(translatePestRisk(0, t)).toBe('pestRiskNone');
      expect(translatePestRisk(1, t)).toBe('pestRiskLow');
      expect(translatePestRisk(2, t)).toBe('pestRiskMedium');
      expect(translatePestRisk(3, t)).toBe('pestRiskHigh');
      expect(translatePestRisk(5, t)).toBe('pestRiskHigh');
    });

    it('should handle non-numeric or missing values', () => {
      expect(translatePestRisk(null, t)).toBe('mapNotAvailable');
      expect(translatePestRisk('low', t)).toBe('low');
    });
  });

  describe('translateDisasterType', () => {
    it('should translate common disaster types', () => {
      expect(translateDisasterType('flood', t)).toBe('disasterTypeFlood');
      expect(translateDisasterType('heavy_rain', t)).toBe('disasterTypeHeavyRain');
      expect(translateDisasterType('drought', t)).toBe('disasterTypeDrought');
    });

    it('should title case unknown types', () => {
      expect(translateDisasterType('alien_invasion', t)).toBe('Alien Invasion');
    });

    it('should handle missing values', () => {
      expect(translateDisasterType(null, t)).toBe('mapNotAvailable');
    });
  });

  describe('getHealthColor', () => {
    it('should return correct hex colors for health categories', () => {
      expect(getHealthColor('healthy')).toBe('#22c55e');
      expect(getHealthColor('mild stress')).toBe('#facc15');
      expect(getHealthColor('severe')).toBe('#dc2626');
      expect(getHealthColor('n/a')).toBe('#696969');
    });

    it('should return default blue for unknown categories', () => {
      expect(getHealthColor('unknown')).toBe('#2563eb');
    });
  });
});
