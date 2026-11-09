/**
 * Utility functions for formatting commute metrics: currency, time, distance, and CO2.
 */

export function formatCurrency(amount: number, symbol = '$'): string {
  if (isNaN(amount)) return `${symbol}0.00`;
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatTime(minutes: number): string {
  if (isNaN(minutes) || minutes <= 0) return '0 min';
  const rounded = Math.round(minutes);
  if (rounded < 60) {
    return `${rounded} min`;
  }
  const hours = Math.floor(rounded / 60);
  const remainingMins = rounded % 60;
  if (remainingMins === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hr ${remainingMins} min`;
}

export function formatTimeDiff(minutes: number): string {
  if (isNaN(minutes)) return '0 min';
  const rounded = Math.round(minutes);
  if (rounded === 0) return 'same time';
  if (rounded > 0) return `+${rounded} min`;
  return `${rounded} min`; // already has negative sign
}

export function formatCo2(grams: number): string {
  if (isNaN(grams) || grams <= 0) return '0 g CO₂';
  if (grams >= 1000) {
    const kg = grams / 1000;
    // Format to 1 decimal place, e.g., 1.9 kg CO2
    return `${kg.toFixed(1)} kg CO₂`;
  }
  return `${Math.round(grams)} g CO₂`;
}

export function formatDistance(km: number): string {
  if (isNaN(km) || km <= 0) return '0 km';
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatSavingsHeadline(
  optionName: string,
  vsCar?: {
    time_diff_min: number;
    cost_savings: number;
    co2_savings_g: number;
  }
): string {
  if (!vsCar) {
    return `Recommended: ${optionName}`;
  }

  const costStr = formatCurrency(Math.max(0, vsCar.cost_savings));
  const co2Str = formatCo2(Math.max(0, vsCar.co2_savings_g));
  const timeDiffStr = formatTimeDiff(vsCar.time_diff_min);

  if (vsCar.cost_savings > 0 && vsCar.co2_savings_g > 0) {
    return `Best for you: ${optionName}. Saves ${costStr} and ${co2Str} vs driving (${timeDiffStr})`;
  } else if (vsCar.cost_savings > 0) {
    return `Best for you: ${optionName}. Saves ${costStr} vs driving (${timeDiffStr})`;
  } else if (vsCar.co2_savings_g > 0) {
    return `Best for you: ${optionName}. Saves ${co2Str} vs driving (${timeDiffStr})`;
  }
  return `Best for you: ${optionName} (${timeDiffStr} vs driving)`;
}

export function getStationAvailabilityLabel(bikesAvailable: number, docksAvailable: number): {
  label: string;
  badgeClass: string;
  status: 'empty' | 'low' | 'good' | 'full';
} {
  if (bikesAvailable === 0) {
    return {
      label: '0 bikes (empty)',
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300',
      status: 'empty',
    };
  }
  if (bikesAvailable <= 3) {
    return {
      label: `${bikesAvailable} bikes (low)`,
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300',
      status: 'low',
    };
  }
  if (docksAvailable === 0) {
    return {
      label: `${bikesAvailable} bikes (no open docks)`,
      badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200 border-orange-300',
      status: 'full',
    };
  }
  return {
    label: `${bikesAvailable} bikes available`,
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300',
    status: 'good',
  };
}
