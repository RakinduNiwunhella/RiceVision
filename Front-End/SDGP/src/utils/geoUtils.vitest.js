import { describe, it, expect, vi } from 'vitest';
import { getDSDivision } from './geoUtils';

describe('geoUtils Utilities', () => {
  describe('getDSDivision', () => {
    it('should return division properties if point is inside a polygon', async () => {
      const mockGeoJSON = {
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]
            },
            properties: { name: 'Test Division' }
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockGeoJSON
      });

      const result = await getDSDivision(5, 5);
      expect(result).toEqual({ name: 'Test Division' });
    });

    it('should return null if point is outside all polygons', async () => {
      const mockGeoJSON = {
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]
            },
            properties: { name: 'Small Box' }
          }
        ]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockGeoJSON
      });

      const result = await getDSDivision(5, 5);
      expect(result).toBeNull();
    });

    it('should handle fetch errors gracefully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false
      });

      const result = await getDSDivision(5, 5);
      expect(result).toBeNull();
    });
  });
});
