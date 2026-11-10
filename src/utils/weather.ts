import { TripOption } from '../types/api';
import {
  ForecastHourPoint,
  LocationWeather,
  ModeWeatherGuidance,
  OpenMeteoForecastResponse,
  RainSeverity,
  TripWeatherSummary,
  WeatherCategory,
  WeatherConditionSource,
} from '../types/weather';

const SEVERITY_RANK: Record<RainSeverity, number> = {
  none: 0,
  light: 1,
  moderate: 2,
  heavy: 3,
};

export function maxRainSeverity(a: RainSeverity, b: RainSeverity): RainSeverity {
  return SEVERITY_RANK[a] >= SEVERITY_RANK[b] ? a : b;
}

const WMO_MAP: Record<number, { label: string; category: WeatherCategory }> = {
  0: { label: 'Clear sky', category: 'sunny' },
  1: { label: 'Mainly clear', category: 'sunny' },
  2: { label: 'Partly cloudy', category: 'cloudy' },
  3: { label: 'Overcast', category: 'cloudy' },
  45: { label: 'Fog', category: 'cloudy' },
  48: { label: 'Rime fog', category: 'cloudy' },
  51: { label: 'Light drizzle', category: 'rainy' },
  53: { label: 'Moderate drizzle', category: 'rainy' },
  55: { label: 'Dense drizzle', category: 'rainy' },
  56: { label: 'Light freezing drizzle', category: 'rainy' },
  57: { label: 'Dense freezing drizzle', category: 'rainy' },
  61: { label: 'Light rain', category: 'rainy' },
  63: { label: 'Moderate rain', category: 'rainy' },
  65: { label: 'Heavy rain', category: 'rainy' },
  66: { label: 'Light freezing rain', category: 'rainy' },
  67: { label: 'Heavy freezing rain', category: 'rainy' },
  71: { label: 'Light snow', category: 'snowy' },
  73: { label: 'Moderate snow', category: 'snowy' },
  75: { label: 'Heavy snow', category: 'snowy' },
  77: { label: 'Snow grains', category: 'snowy' },
  80: { label: 'Light rain showers', category: 'rainy' },
  81: { label: 'Moderate rain showers', category: 'rainy' },
  82: { label: 'Violent rain showers', category: 'rainy' },
  85: { label: 'Light snow showers', category: 'snowy' },
  86: { label: 'Heavy snow showers', category: 'snowy' },
  95: { label: 'Thunderstorm', category: 'stormy' },
  96: { label: 'Thunderstorm with hail', category: 'stormy' },
  99: { label: 'Severe thunderstorm', category: 'stormy' },
};

const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const LIGHT_RAIN_CODES = new Set([51, 53, 61, 80]);
const MODERATE_RAIN_CODES = new Set([55, 56, 57, 63, 66, 81]);
const HEAVY_RAIN_CODES = new Set([65, 67, 82, 95, 96, 99]);

export function getWmoWeatherInfo(code: number): { label: string; category: WeatherCategory } {
  if (Number.isFinite(code) && WMO_MAP[code]) {
    return WMO_MAP[code];
  }
  return { label: 'Cloudy', category: 'cloudy' };
}

export function classifyRainSeverity(
  weatherCode: number,
  precipitationMm: number,
  rainMm?: number
): RainSeverity {
  let codeSeverity: RainSeverity = 'none';
  if (HEAVY_RAIN_CODES.has(weatherCode)) {
    codeSeverity = 'heavy';
  } else if (MODERATE_RAIN_CODES.has(weatherCode)) {
    codeSeverity = 'moderate';
  } else if (LIGHT_RAIN_CODES.has(weatherCode)) {
    codeSeverity = 'light';
  }

  // Avoid flagging pure snowfall water-equivalent precipitation as liquid rain unless rain > 0
  const isPureSnow = SNOW_CODES.has(weatherCode);
  const safePrecip = Number.isFinite(precipitationMm) ? Math.max(0, precipitationMm) : 0;
  const safeRain = typeof rainMm === 'number' && Number.isFinite(rainMm) ? Math.max(0, rainMm) : 0;
  const effectiveRainMm = isPureSnow ? safeRain : Math.max(safePrecip, safeRain);

  let amountSeverity: RainSeverity = 'none';
  if (effectiveRainMm >= 7.5) {
    amountSeverity = 'heavy';
  } else if (effectiveRainMm >= 2.5) {
    amountSeverity = 'moderate';
  } else if (effectiveRainMm > 0) {
    amountSeverity = 'light';
  }

  return maxRainSeverity(codeSeverity, amountSeverity);
}

function extractHourLabel(isoTime: string): string {
  const tIndex = isoTime.indexOf('T');
  if (tIndex >= 0 && isoTime.length >= tIndex + 6) {
    return isoTime.slice(tIndex + 1, tIndex + 6);
  }
  return isoTime;
}

export function parseOpenMeteoResponse(data: OpenMeteoForecastResponse): LocationWeather {
  const current = data.current;
  const currentInfo = getWmoWeatherInfo(current.weather_code);
  const currentRainSeverity = classifyRainSeverity(
    current.weather_code,
    current.precipitation,
    current.rain
  );

  const currentHourPrefix = typeof current.time === 'string' && current.time.length >= 13
    ? current.time.slice(0, 13)
    : '';

  let currentHourProbability: number | null = null;
  const nextHours: ForecastHourPoint[] = [];

  if (data.hourly && Array.isArray(data.hourly.time)) {
    const times = data.hourly.time;
    const precips = data.hourly.precipitation || [];
    const probs = data.hourly.precipitation_probability || [];
    const codes = data.hourly.weather_code || [];

    for (let i = 0; i < times.length; i++) {
      const timeStr = times[i];
      if (!timeStr) continue;

      const hourPrefix = timeStr.slice(0, 13);
      const prob = typeof probs[i] === 'number' && Number.isFinite(probs[i]) ? probs[i] : null;
      const precip = typeof precips[i] === 'number' && Number.isFinite(precips[i]) ? precips[i] : 0;
      const code = typeof codes[i] === 'number' && Number.isFinite(codes[i]) ? codes[i] : 0;

      if (currentHourPrefix && hourPrefix === currentHourPrefix) {
        currentHourProbability = prob;
        continue;
      }

      if (!currentHourPrefix || hourPrefix > currentHourPrefix) {
        if (nextHours.length < 3) {
          const info = getWmoWeatherInfo(code);
          nextHours.push({
            time: timeStr,
            hourLabel: extractHourLabel(timeStr),
            weatherCode: code,
            conditionLabel: info.label,
            category: info.category,
            precipitationMm: precip,
            precipitationProbability: prob,
            rainSeverity: classifyRainSeverity(code, precip),
          });
        }
      }
    }
  }

  let peakRainSeverity: RainSeverity = 'none';
  let peakRainHour: ForecastHourPoint | null = null;

  for (const hr of nextHours) {
    if (SEVERITY_RANK[hr.rainSeverity] > SEVERITY_RANK[peakRainSeverity]) {
      peakRainSeverity = hr.rainSeverity;
      peakRainHour = hr;
    } else if (
      hr.rainSeverity !== 'none' &&
      hr.rainSeverity === peakRainSeverity &&
      peakRainHour &&
      hr.precipitationMm > peakRainHour.precipitationMm
    ) {
      peakRainHour = hr;
    }
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
    timezone: data.timezone || 'UTC',
    timezoneAbbreviation: data.timezone_abbreviation || '',
    current: {
      time: current.time,
      temperatureC: current.temperature_2m,
      apparentTemperatureC: current.apparent_temperature,
      humidityPercent: current.relative_humidity_2m,
      precipitationMm: current.precipitation,
      rainMm: current.rain,
      windSpeedKmh: current.wind_speed_10m,
      weatherCode: current.weather_code,
      conditionLabel: currentInfo.label,
      category: currentInfo.category,
      rainSeverity: currentRainSeverity,
      precipitationProbability: currentHourProbability,
    },
    forecast: {
      available: nextHours.length > 0,
      nextHours,
      peakRainSeverity,
      peakRainHour,
    },
  };
}

export type TripOptionModeGroup =
  | 'cycling'
  | 'walking'
  | 'public_transit'
  | 'driving'
  | 'other';

export function classifyTripOptionMode(option: TripOption): TripOptionModeGroup {
  const legs = option.legs || [];
  const legModes = legs.map((l) => l.mode.toLowerCase());
  const lowerName = option.name.toLowerCase();

  if (
    legModes.some((m) => m === 'bike_share' || m === 'bike' || m === 'bicycle' || m === 'cycling') ||
    lowerName.includes('bike') ||
    lowerName.includes('cycl')
  ) {
    return 'cycling';
  }

  if (
    legModes.some((m) =>
      ['subway', 'bus', 'commuter_rail', 'rail', 'train', 'ferry', 'tram', 'transit'].includes(m)
    ) ||
    lowerName.includes('subway') ||
    lowerName.includes('bus') ||
    lowerName.includes('train') ||
    lowerName.includes('rail') ||
    lowerName.includes('ferry')
  ) {
    return 'public_transit';
  }

  if (
    legModes.some((m) => m === 'drive' || m === 'car') ||
    lowerName.includes('drive') ||
    lowerName.includes('car')
  ) {
    return 'driving';
  }

  if (
    (legs.length > 0 && legModes.every((m) => m === 'walk' || m === 'walking')) ||
    lowerName.includes('walk')
  ) {
    return 'walking';
  }

  return 'other';
}

interface EndpointRainFinding {
  roleLabel: string;
  locationLabel: string;
  severity: RainSeverity;
  source: 'current' | 'forecast';
  description: string;
}

function getShortLocationLabel(locationLabel: string, roleLabel: string): string {
  const trimmed = locationLabel.trim();
  if (!trimmed) return roleLabel;
  if (/^current location/i.test(trimmed)) return 'Current Location';
  return trimmed.split(',')[0].trim() || roleLabel;
}

function describeEndpointFindings(
  roleLabel: string,
  locationLabel: string,
  weather?: LocationWeather
): {
  currentFinding: EndpointRainFinding | null;
  forecastFinding: EndpointRainFinding | null;
  combinedSeverity: RainSeverity;
} {
  if (!weather) {
    return { currentFinding: null, forecastFinding: null, combinedSeverity: 'none' };
  }

  const shortLocation = getShortLocationLabel(locationLabel, roleLabel);
  let currentFinding: EndpointRainFinding | null = null;
  let forecastFinding: EndpointRainFinding | null = null;

  if (weather.current.rainSeverity !== 'none') {
    const precipText = `${weather.current.precipitationMm.toFixed(1)} mm`;
    const probText =
      weather.current.precipitationProbability !== null
        ? `, ${weather.current.precipitationProbability}% precip chance`
        : '';
    currentFinding = {
      roleLabel,
      locationLabel: shortLocation,
      severity: weather.current.rainSeverity,
      source: 'current',
      description: `Current at ${shortLocation}: ${weather.current.conditionLabel} (${precipText}${probText})`,
    };
  }

  if (weather.forecast.peakRainSeverity !== 'none' && weather.forecast.peakRainHour) {
    const peak = weather.forecast.peakRainHour;
    const probText =
      peak.precipitationProbability !== null ? `, ${peak.precipitationProbability}% prob` : '';
    forecastFinding = {
      roleLabel,
      locationLabel: shortLocation,
      severity: peak.rainSeverity,
      source: 'forecast',
      description: `Forecast at ${shortLocation} (${peak.hourLabel}): ${peak.conditionLabel} (${peak.precipitationMm.toFixed(1)} mm${probText})`,
    };
  }

  const combinedSeverity = maxRainSeverity(
    weather.current.rainSeverity,
    weather.forecast.peakRainSeverity
  );

  return { currentFinding, forecastFinding, combinedSeverity };
}

function severityWord(severity: RainSeverity): string {
  switch (severity) {
    case 'heavy':
      return 'Heavy rain';
    case 'moderate':
      return 'Moderate rain';
    case 'light':
      return 'Light rain';
    default:
      return 'Clear conditions';
  }
}

export function evaluateTripWeatherRecommendations(params: {
  originWeather?: LocationWeather;
  destinationWeather?: LocationWeather;
  originLabel: string;
  destinationLabel: string;
}): TripWeatherSummary {
  const { originWeather, destinationWeather, originLabel, destinationLabel } = params;
  const hasWeatherData = Boolean(originWeather || destinationWeather);

  if (!hasWeatherData) {
    return {
      hasWeatherData: false,
      overallSeverity: 'none',
      conditionSource: 'none',
      headline: '',
      detail: '',
      originSeverity: 'none',
      destinationSeverity: 'none',
      getOptionGuidance: () => null,
    };
  }

  const originEval = describeEndpointFindings('Origin', originLabel, originWeather);
  const destEval = describeEndpointFindings('Destination', destinationLabel, destinationWeather);

  const overallSeverity = maxRainSeverity(originEval.combinedSeverity, destEval.combinedSeverity);

  const currentFindings = [originEval.currentFinding, destEval.currentFinding].filter(
    (f): f is EndpointRainFinding => f !== null
  );
  const forecastFindings = [originEval.forecastFinding, destEval.forecastFinding].filter(
    (f): f is EndpointRainFinding => f !== null
  );

  const maxCurrent = currentFindings.reduce<RainSeverity>(
    (acc, f) => maxRainSeverity(acc, f.severity),
    'none'
  );
  const maxForecast = forecastFindings.reduce<RainSeverity>(
    (acc, f) => maxRainSeverity(acc, f.severity),
    'none'
  );

  let conditionSource: WeatherConditionSource = 'none';
  if (maxCurrent !== 'none' && maxForecast !== 'none') {
    conditionSource = 'both';
  } else if (maxCurrent !== 'none') {
    conditionSource = 'current';
  } else if (maxForecast !== 'none') {
    conditionSource = 'forecast';
  }

  if (overallSeverity === 'none') {
    const anyForecastChecked = Boolean(
      originWeather?.forecast.available || destinationWeather?.forecast.available
    );
    return {
      hasWeatherData: true,
      overallSeverity: 'none',
      conditionSource: 'current',
      headline: 'Dry conditions across route — all transit, cycling, and walking modes look favorable.',
      detail: anyForecastChecked
        ? 'Current conditions and upcoming 3-hour hourly forecast show no expected rain along your route.'
        : 'Current conditions at origin and destination show no active precipitation.',
      originSeverity: 'none',
      destinationSeverity: 'none',
      getOptionGuidance: () => null,
    };
  }

  // Pick most descriptive findings (current + forecast distinguished clearly)
  const sortedCurrent = [...currentFindings].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
  );
  const sortedForecast = [...forecastFindings].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
  );

  const contextParts: string[] = [];
  if (sortedCurrent.length > 0) {
    contextParts.push(sortedCurrent[0].description);
  } else {
    contextParts.push('Current conditions are dry');
  }

  if (sortedForecast.length > 0) {
    contextParts.push(sortedForecast[0].description);
  }

  const evidenceSummary = contextParts.join(' • ');

  let headline = '';
  if (overallSeverity === 'light') {
    headline = 'Caution advised for cycling and walking due to light rain.';
  } else if (overallSeverity === 'moderate') {
    headline = 'Public transport suggested — moderate rain expected along your route.';
  } else {
    headline = 'Strongly avoid cycling and walking — heavy rain or storm conditions detected.';
  }

  const getOptionGuidance = (option: TripOption): ModeWeatherGuidance | null => {
    const modeGroup = classifyTripOptionMode(option);

    if (overallSeverity === 'light') {
      if (modeGroup === 'cycling' || modeGroup === 'walking') {
        return {
          level: 'caution',
          badgeLabel: 'Caution',
          conditionSource,
          reason: `${severityWord('light')} lowers traction and visibility for ${
            modeGroup === 'cycling' ? 'cycling' : 'walking'
          }. ${evidenceSummary}.`,
        };
      }
      return null;
    }

    if (overallSeverity === 'moderate') {
      if (modeGroup === 'public_transit') {
        return {
          level: 'recommended',
          badgeLabel: 'Suggested for rain',
          conditionSource,
          reason: `Sheltered public transport helps avoid ${severityWord('moderate').toLowerCase()}. ${evidenceSummary}.`,
        };
      }
      if (modeGroup === 'cycling' || modeGroup === 'walking') {
        return {
          level: 'caution',
          badgeLabel: 'Caution',
          conditionSource,
          reason: `${severityWord('moderate')} makes exposed ${
            modeGroup === 'cycling' ? 'cycling' : 'walking'
          } uncomfortable — consider public transport. ${evidenceSummary}.`,
        };
      }
      return null;
    }

    // Heavy rain
    if (modeGroup === 'cycling' || modeGroup === 'walking') {
      return {
        level: 'discouraged',
        badgeLabel: 'Strongly discouraged',
        conditionSource,
        reason: `${severityWord('heavy')} poses safety and visibility hazards for open-air ${
          modeGroup === 'cycling' ? 'cycling' : 'walking'
        }. ${evidenceSummary}.`,
      };
    }

    if (modeGroup === 'public_transit') {
      return {
        level: 'recommended',
        badgeLabel: 'Suggested (Sheltered)',
        conditionSource,
        reason: `Protected from ${severityWord('heavy').toLowerCase()} compared to cycling or walking. ${evidenceSummary}.`,
      };
    }

    return null;
  };

  return {
    hasWeatherData: true,
    overallSeverity,
    conditionSource,
    headline,
    detail: evidenceSummary,
    originSeverity: originEval.combinedSeverity,
    destinationSeverity: destEval.combinedSeverity,
    getOptionGuidance,
  };
}
