import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { buildOpenMeteoUrl } from '../services/weather';
import {
  getWmoWeatherInfo,
  classifyRainSeverity,
  parseOpenMeteoResponse,
  classifyTripOptionMode,
  evaluateTripWeatherRecommendations,
} from '../utils/weather';
import { useTripWeather } from '../hooks/useWeather';
import { SAMPLE_PLAN_RESPONSE } from '../services/sampleData';
import { OpenMeteoForecastResponse } from '../types/weather';

function makeOpenMeteoResponse(overrides?: {
  lat?: number;
  lon?: number;
  time?: string;
  code?: number;
  precip?: number;
  rain?: number;
  temp?: number;
  humidity?: number;
  wind?: number;
  includeHourly?: boolean;
  hourlyTime?: string[];
  hourlyPrecip?: number[];
  hourlyProb?: number[];
  hourlyCodes?: number[];
}): OpenMeteoForecastResponse {
  const base: OpenMeteoForecastResponse = {
    latitude: overrides?.lat ?? 40.758,
    longitude: overrides?.lon ?? -73.9855,
    timezone: 'America/New_York',
    timezone_abbreviation: 'GMT-5',
    current: {
      time: overrides?.time ?? '2026-11-10T10:00',
      interval: 900,
      temperature_2m: overrides?.temp ?? 12.0,
      relative_humidity_2m: overrides?.humidity ?? 62,
      apparent_temperature: (overrides?.temp ?? 12.0) - 1.2,
      precipitation: overrides?.precip ?? 0.0,
      rain: overrides?.rain ?? 0.0,
      weather_code: overrides?.code ?? 0,
      wind_speed_10m: overrides?.wind ?? 8.5,
    },
  };

  if (overrides?.includeHourly !== false) {
    base.hourly = {
      time: overrides?.hourlyTime ?? [
        '2026-11-10T10:00',
        '2026-11-10T11:00',
        '2026-11-10T12:00',
        '2026-11-10T13:00',
      ],
      precipitation: overrides?.hourlyPrecip ?? [0, 0, 0, 0],
      precipitation_probability: overrides?.hourlyProb ?? [10, 10, 15, 20],
      weather_code: overrides?.hourlyCodes ?? [0, 1, 2, 2],
    };
  }

  return base;
}

describe('Open-Meteo URL & WMO helpers', () => {
  it('builds Open-Meteo API URL with required current, hourly, and timezone query params', () => {
    const url = new URL(buildOpenMeteoUrl(40.758, -73.9855));
    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('latitude')).toBe('40.758');
    expect(url.searchParams.get('longitude')).toBe('-73.9855');
    expect(url.searchParams.get('current')).toBe(
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m'
    );
    expect(url.searchParams.get('hourly')).toBe(
      'precipitation,precipitation_probability,weather_code'
    );
    expect(url.searchParams.get('timezone')).toBe('auto');
  });

  it('maps WMO weather codes to sunny, cloudy, rainy, snowy, and stormy categories', () => {
    expect(getWmoWeatherInfo(0)).toEqual({ label: 'Clear sky', category: 'sunny' });
    expect(getWmoWeatherInfo(2)).toEqual({ label: 'Partly cloudy', category: 'cloudy' });
    expect(getWmoWeatherInfo(61)).toEqual({ label: 'Light rain', category: 'rainy' });
    expect(getWmoWeatherInfo(73)).toEqual({ label: 'Moderate snow', category: 'snowy' });
    expect(getWmoWeatherInfo(95)).toEqual({ label: 'Thunderstorm', category: 'stormy' });
  });

  it('classifies rain severity from both WMO code and precipitation mm, ignoring pure snow water-equivalent', () => {
    expect(classifyRainSeverity(0, 0, 0)).toBe('none');
    expect(classifyRainSeverity(61, 0.5, 0.5)).toBe('light');
    expect(classifyRainSeverity(63, 3.0, 3.0)).toBe('moderate');
    expect(classifyRainSeverity(65, 8.0, 8.0)).toBe('heavy');
    expect(classifyRainSeverity(95, 2.0, 2.0)).toBe('heavy');
    expect(classifyRainSeverity(73, 2.0, 0.0)).toBe('none');
  });

  it('parses current conditions and optional hourly forecast chronologically', () => {
    const parsedWithHourly = parseOpenMeteoResponse(
      makeOpenMeteoResponse({
        hourlyPrecip: [0.0, 1.2, 3.4, 0.0],
        hourlyProb: [15, 65, 85, 20],
        hourlyCodes: [2, 61, 63, 2],
      })
    );

    expect(parsedWithHourly.current.precipitationProbability).toBe(15);
    expect(parsedWithHourly.forecast.available).toBe(true);
    expect(parsedWithHourly.forecast.nextHours).toHaveLength(3);
    expect(parsedWithHourly.forecast.nextHours[0].hourLabel).toBe('11:00');
    expect(parsedWithHourly.forecast.peakRainSeverity).toBe('moderate');
    expect(parsedWithHourly.forecast.peakRainHour?.hourLabel).toBe('12:00');

    const parsedWithoutHourly = parseOpenMeteoResponse(
      makeOpenMeteoResponse({ includeHourly: false })
    );
    expect(parsedWithoutHourly.forecast.available).toBe(false);
    expect(parsedWithoutHourly.forecast.nextHours).toHaveLength(0);
  });
});

describe('Weather-Aware Commute Recommendations', () => {
  const subwayOpt = SAMPLE_PLAN_RESPONSE.options[0];
  const bikeOpt = SAMPLE_PLAN_RESPONSE.options[1];
  const walkOpt = SAMPLE_PLAN_RESPONSE.options[2];
  const busOpt = SAMPLE_PLAN_RESPONSE.options[3];
  const driveOpt = SAMPLE_PLAN_RESPONSE.options[4];

  it('classifies multi-modal options accurately without mislabeling transit access walks', () => {
    expect(classifyTripOptionMode(subwayOpt)).toBe('public_transit');
    expect(classifyTripOptionMode(busOpt)).toBe('public_transit');
    expect(classifyTripOptionMode(bikeOpt)).toBe('cycling');
    expect(classifyTripOptionMode(walkOpt)).toBe('walking');
    expect(classifyTripOptionMode(driveOpt)).toBe('driving');
  });

  it('returns caution badges for cycling & walking in light rain', () => {
    const originWeather = parseOpenMeteoResponse(
      makeOpenMeteoResponse({ code: 61, precip: 0.7, rain: 0.7 })
    );
    const destWeather = parseOpenMeteoResponse(makeOpenMeteoResponse({ code: 3, precip: 0 }));

    const summary = evaluateTripWeatherRecommendations({
      originWeather,
      destinationWeather: destWeather,
      originLabel: 'Times Square, NY',
      destinationLabel: 'Grand Central, NY',
    });

    expect(summary.overallSeverity).toBe('light');
    expect(summary.conditionSource).toBe('current');
    expect(summary.getOptionGuidance(bikeOpt)?.level).toBe('caution');
    expect(summary.getOptionGuidance(walkOpt)?.level).toBe('caution');
    expect(summary.getOptionGuidance(subwayOpt)).toBeNull();
  });

  it('suggests public transport in moderate rain while explaining why', () => {
    const originWeather = parseOpenMeteoResponse(
      makeOpenMeteoResponse({ code: 63, precip: 3.6, rain: 3.6 })
    );

    const summary = evaluateTripWeatherRecommendations({
      originWeather,
      destinationWeather: originWeather,
      originLabel: 'Current Location (40.7580, -73.9855)',
      destinationLabel: 'Grand Central, NY',
    });

    expect(summary.overallSeverity).toBe('moderate');
    const subwayGuidance = summary.getOptionGuidance(subwayOpt);
    expect(subwayGuidance?.level).toBe('recommended');
    expect(subwayGuidance?.badgeLabel).toMatch(/suggested/i);
    expect(subwayGuidance?.reason).toContain('Current at Current Location');

    const busGuidance = summary.getOptionGuidance(busOpt);
    expect(busGuidance?.level).toBe('recommended');

    expect(summary.getOptionGuidance(bikeOpt)?.level).toBe('caution');
    expect(summary.getOptionGuidance(walkOpt)?.level).toBe('caution');
  });

  it('strongly discourages cycling and walking during heavy rain and distinguishes forecast vs current', () => {
    const dryOrigin = parseOpenMeteoResponse(
      makeOpenMeteoResponse({ code: 2, precip: 0, rain: 0 })
    );
    const forecastStormDest = parseOpenMeteoResponse(
      makeOpenMeteoResponse({
        code: 2,
        precip: 0,
        rain: 0,
        hourlyPrecip: [0, 8.5, 4.0, 1.0],
        hourlyProb: [20, 90, 75, 40],
        hourlyCodes: [2, 65, 63, 61],
      })
    );

    const summary = evaluateTripWeatherRecommendations({
      originWeather: dryOrigin,
      destinationWeather: forecastStormDest,
      originLabel: 'Times Square, NY',
      destinationLabel: 'Grand Central, NY',
    });

    expect(summary.overallSeverity).toBe('heavy');
    expect(summary.conditionSource).toBe('forecast');
    expect(summary.detail).toContain('Current conditions are dry');
    expect(summary.detail).toContain('Forecast at Grand Central (11:00)');

    expect(summary.getOptionGuidance(bikeOpt)?.level).toBe('discouraged');
    expect(summary.getOptionGuidance(bikeOpt)?.badgeLabel).toBe('Strongly discouraged');
    expect(summary.getOptionGuidance(walkOpt)?.level).toBe('discouraged');
    expect(summary.getOptionGuidance(subwayOpt)?.level).toBe('recommended');
  });
});

describe('useTripWeather TanStack Query behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const makeWrapper = (client: QueryClient) => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client }, children);
  };

  it('uses separate query keys for origin & destination, retries once on failure, and caches responses for 10 min', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('40.758')) {
        return Promise.reject(new Error('Origin weather timeout'));
      }
      return Promise.resolve(
        new Response(JSON.stringify(makeOpenMeteoResponse({ temp: 16.4 })), { status: 200 })
      );
    });

    vi.stubGlobal('fetch', fetchMock);

    const client = new QueryClient({
      defaultOptions: {
        queries: { retryDelay: 0 },
      },
    });

    const wrapper = makeWrapper(client);
    const { result, unmount } = renderHook(
      () =>
        useTripWeather(SAMPLE_PLAN_RESPONSE.origin, SAMPLE_PLAN_RESPONSE.destination),
      { wrapper }
    );

    await waitFor(
      () => {
        expect(result.current.originQuery.isError).toBe(true);
        expect(result.current.destinationQuery.isSuccess).toBe(true);
      },
      { timeout: 3000 }
    );

    // Separate query keys with origin + destination roles and coordinates
    const cacheKeys = client.getQueryCache().getAll().map((q) => q.queryKey);
    expect(cacheKeys).toContainEqual(['weather', 'origin', 40.758, -73.9855]);
    expect(cacheKeys).toContainEqual(['weather', 'destination', 40.7527, -73.9772]);

    // Origin tried 2 times (initial + 1 retry), Destination tried 1 time = 3 calls
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.current.destinationQuery.data?.current.temperatureC).toBe(16.4);

    // Verify staleTime of 10 minutes prevents refetch on immediate remount with same destination coords
    unmount();
    renderHook(
      () =>
        useTripWeather(undefined, SAMPLE_PLAN_RESPONSE.destination),
      { wrapper }
    );
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
