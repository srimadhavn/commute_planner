import { TripOption } from '../types/api';

export type SortPreset = 'best' | 'fastest' | 'cheapest' | 'greenest';

/**
 * Client-side re-sorting from returned option numbers.
 */
export function sortTripOptions(options: TripOption[], sortBy: SortPreset): TripOption[] {
  const shallowCopy = [...options];

  switch (sortBy) {
    case 'fastest':
      return shallowCopy.sort((a, b) => a.total_time_min - b.total_time_min);
    case 'cheapest':
      return shallowCopy.sort((a, b) => a.total_cost - b.total_cost);
    case 'greenest':
      return shallowCopy.sort((a, b) => a.total_co2_g - b.total_co2_g);
    case 'best':
    default:
      return shallowCopy.sort((a, b) => a.composite_score - b.composite_score);
  }
}

/**
 * Calculates max metrics across options for relative comparative visual bars.
 */
export function calculateMetricExtremes(options: TripOption[]) {
  if (options.length === 0) {
    return { maxTime: 1, maxCost: 1, maxCo2: 1 };
  }

  const maxTime = Math.max(...options.map((o) => o.total_time_min), 1);
  const maxCost = Math.max(...options.map((o) => o.total_cost), 1);
  const maxCo2 = Math.max(...options.map((o) => o.total_co2_g), 1);

  return { maxTime, maxCost, maxCo2 };
}
