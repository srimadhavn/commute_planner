import { LocationWeather, OpenMeteoForecastResponse } from '../types/weather';
import { parseOpenMeteoResponse } from '../utils/weather';

export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'precipitation',
  'rain',
  'weather_code',
  'wind_speed_10m',
].join(',');

const HOURLY_FIELDS = [
  'precipitation',
  'precipitation_probability',
  'weather_code',
].join(',');

export function buildOpenMeteoUrl(latitude: number, longitude: number): string {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: CURRENT_FIELDS,
    hourly: HOURLY_FIELDS,
    forecast_hours: '6',
    timezone: 'auto',
  });
  return `${OPEN_METEO_FORECAST_URL}?${params.toString()}`;
}

/**
 * Fetches real-time current conditions and short-term hourly forecast from Open-Meteo.
 * Never returns fallback or hardcoded sample weather data on failure.
 */
export async function getWeatherByCoordinates(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<LocationWeather> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Invalid coordinates provided for weather lookup.');
  }

  const url = buildOpenMeteoUrl(latitude, longitude);
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const data = (await response.json()) as OpenMeteoForecastResponse;

  if (!data || !data.current || typeof data.current.temperature_2m !== 'number') {
    throw new Error('Unexpected response format from Open-Meteo.');
  }

  return parseOpenMeteoResponse(data);
}

