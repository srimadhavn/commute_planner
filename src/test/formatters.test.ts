import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatTime,
  formatTimeDiff,
  formatCo2,
  formatDistance,
  formatSavingsHeadline,
  getStationAvailabilityLabel,
} from '../utils/formatters';

describe('Formatters Utility', () => {
  describe('formatCurrency', () => {
    it('formats dollar amounts correctly', () => {
      expect(formatCurrency(8.18)).toBe('$8.18');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(12.5)).toBe('$12.50');
      expect(formatCurrency(NaN)).toBe('$0.00');
    });
  });

  describe('formatTime', () => {
    it('formats minutes under an hour', () => {
      expect(formatTime(25)).toBe('25 min');
      expect(formatTime(9)).toBe('9 min');
    });

    it('formats hours and remaining minutes', () => {
      expect(formatTime(60)).toBe('1 hr');
      expect(formatTime(75)).toBe('1 hr 15 min');
      expect(formatTime(120)).toBe('2 hrs');
    });

    it('handles zero or negative', () => {
      expect(formatTime(0)).toBe('0 min');
      expect(formatTime(-5)).toBe('0 min');
    });
  });

  describe('formatTimeDiff', () => {
    it('adds plus sign for positive time differences', () => {
      expect(formatTimeDiff(13)).toBe('+13 min');
    });

    it('preserves minus sign for negative time differences (faster than car)', () => {
      expect(formatTimeDiff(-5)).toBe('-5 min');
    });

    it('returns same time for 0 difference', () => {
      expect(formatTimeDiff(0)).toBe('same time');
    });
  });

  describe('formatCo2', () => {
    it('formats grams when under 1000g', () => {
      expect(formatCo2(110)).toBe('110 g CO₂');
      expect(formatCo2(850)).toBe('850 g CO₂');
    });

    it('formats kilograms when 1000g or above', () => {
      expect(formatCo2(1900)).toBe('1.9 kg CO₂');
      expect(formatCo2(34200)).toBe('34.2 kg CO₂');
    });

    it('handles zero gracefully', () => {
      expect(formatCo2(0)).toBe('0 g CO₂');
    });
  });

  describe('formatDistance', () => {
    it('formats meters when under 1km', () => {
      expect(formatDistance(0.4)).toBe('400 m');
      expect(formatDistance(0.15)).toBe('150 m');
    });

    it('formats kilometers when 1km or above', () => {
      expect(formatDistance(5.4)).toBe('5.4 km');
      expect(formatDistance(1.8)).toBe('1.8 km');
    });
  });

  describe('formatSavingsHeadline', () => {
    it('formats combined cost and CO2 savings vs driving', () => {
      const headline = formatSavingsHeadline('Subway', {
        time_diff_min: 13,
        cost_savings: 8.18,
        co2_savings_g: 1900,
      });
      expect(headline).toBe('Best for you: Subway. Saves $8.18 and 1.9 kg CO₂ vs driving (+13 min)');
    });

    it('handles fallback when no vs_car is provided', () => {
      expect(formatSavingsHeadline('Walking')).toBe('Recommended: Walking');
    });
  });

  describe('getStationAvailabilityLabel', () => {
    it('marks empty station when 0 bikes available', () => {
      const res = getStationAvailabilityLabel(0, 15);
      expect(res.status).toBe('empty');
      expect(res.label).toContain('empty');
    });

    it('marks low station when 3 or fewer bikes available', () => {
      const res = getStationAvailabilityLabel(2, 10);
      expect(res.status).toBe('low');
      expect(res.label).toContain('low');
    });

    it('marks good station when bikes are plentiful', () => {
      const res = getStationAvailabilityLabel(15, 10);
      expect(res.status).toBe('good');
      expect(res.label).toContain('15 bikes available');
    });
  });
});
