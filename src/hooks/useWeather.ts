import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResolvedLocation } from '../types/api';
import { LocationWeather } from '../types/weather';
import { getWeatherByCoordinates } from '../services/weather';
import { evaluateTripWeatherRecommendations } from '../utils/weather';

const TEN_MINUTES_MS = 10 * 60 * 1000;

export function hasValidCoordinates(lat?: number, lon?: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lon)
  );
}

export function useLocationWeather(
  role: 'origin' | 'destination',
  lat?: number,
  lon?: number
) {
  const validCoords = hasValidCoordinates(lat, lon);

  const query = useQuery<LocationWeather, Error>({
    queryKey: ['weather', role, lat ?? null, lon ?? null],
    queryFn: ({ signal }) => getWeatherByCoordinates(lat!, lon!, signal),
    enabled: validCoords,
    staleTime: TEN_MINUTES_MS,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    weather: query.data,
    hasValidCoordinates: validCoords,
    isUnavailable: !validCoords || query.isError,
  };
}

export function useTripWeather(
  origin?: ResolvedLocation,
  destination?: ResolvedLocation
) {
  const originQuery = useLocationWeather('origin', origin?.lat, origin?.lon);
  const destinationQuery = useLocationWeather(
    'destination',
    destination?.lat,
    destination?.lon
  );

  const originLabel = origin?.label || 'Origin';
  const destinationLabel = destination?.label || 'Destination';

  const summary = useMemo(
    () =>
      evaluateTripWeatherRecommendations({
        originWeather: originQuery.data,
        destinationWeather: destinationQuery.data,
        originLabel,
        destinationLabel,
      }),
    [originQuery.data, destinationQuery.data, originLabel, destinationLabel]
  );

  return {
    originQuery,
    destinationQuery,
    summary,
  };
}

