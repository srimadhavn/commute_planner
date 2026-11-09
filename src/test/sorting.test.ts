import { describe, it, expect } from 'vitest';
import { sortTripOptions, calculateMetricExtremes } from '../utils/sorting';
import { SAMPLE_PLAN_RESPONSE } from '../services/sampleData';

describe('Sorting Utility', () => {
  const options = SAMPLE_PLAN_RESPONSE.options;

  it('sorts by best (composite_score ascending)', () => {
    const sorted = sortTripOptions(options, 'best');
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].composite_score).toBeLessThanOrEqual(sorted[i + 1].composite_score);
    }
  });

  it('sorts by fastest (total_time_min ascending)', () => {
    const sorted = sortTripOptions(options, 'fastest');
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].total_time_min).toBeLessThanOrEqual(sorted[i + 1].total_time_min);
    }
    // Fastest option should be Citi Bike (9 min)
    expect(sorted[0].total_time_min).toBe(9);
  });

  it('sorts by cheapest (total_cost ascending)', () => {
    const sorted = sortTripOptions(options, 'cheapest');
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].total_cost).toBeLessThanOrEqual(sorted[i + 1].total_cost);
    }
    // Cheapest option should be Walking ($0.00)
    expect(sorted[0].total_cost).toBe(0);
  });

  it('sorts by greenest (total_co2_g ascending)', () => {
    const sorted = sortTripOptions(options, 'greenest');
    for (let i = 0; i < sorted.length - 1; i++) {
      expect(sorted[i].total_co2_g).toBeLessThanOrEqual(sorted[i + 1].total_co2_g);
    }
    // Greenest options should be Citi Bike or Walking (0 g)
    expect(sorted[0].total_co2_g).toBe(0);
  });

  it('calculates extremes for comparative bars', () => {
    const extremes = calculateMetricExtremes(options);
    expect(extremes.maxTime).toBeGreaterThanOrEqual(18); // Walking is 18m
    expect(extremes.maxCost).toBeGreaterThanOrEqual(11.08); // Drive is $11.08
    expect(extremes.maxCo2).toBeGreaterThanOrEqual(2010); // Drive is 2010g
  });
});
