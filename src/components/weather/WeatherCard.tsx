import React from 'react';
import { CloudOff, Droplets, Thermometer, Umbrella, Wind, Clock } from 'lucide-react';
import { LocationWeather } from '../../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { Card } from '../ui/card';
import { Skeleton } from '../common/Skeleton';
import { cn } from '../../lib/utils';

export interface WeatherCardProps {
  roleLabel: 'Origin' | 'Destination' | string;
  locationLabel: string;
  weather?: LocationWeather;
  isLoading?: boolean;
  isError?: boolean;
  showAttribution?: boolean;
  className?: string;
}

function formatPrecipitationMm(mm: number): string {
  if (!Number.isFinite(mm) || mm <= 0) return '0.0 mm';
  if (mm < 0.1) return `${mm.toFixed(2)} mm`;
  return `${mm.toFixed(1)} mm`;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  roleLabel,
  locationLabel,
  weather,
  isLoading = false,
  isError = false,
  showAttribution = false,
  className,
}) => {
  if (isLoading) {
    return (
      <Card
        aria-busy="true"
        aria-label={`Loading weather for ${locationLabel}`}
        className={cn('border-zinc-800 bg-zinc-900/75 p-4 space-y-3', className)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400">
                {roleLabel}
              </span>
              <Skeleton className="h-3.5 w-16" />
            </div>
            <p className="text-sm font-semibold text-zinc-200 truncate" title={locationLabel}>
              {locationLabel}
            </p>
          </div>
          <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
        </div>

        <div className="flex items-baseline gap-3">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </Card>
    );
  }

  if (isError || !weather) {
    return (
      <Card
        className={cn('border-zinc-800 bg-zinc-900/60 p-4 flex flex-col justify-between gap-3', className)}
        data-testid={`weather-card-${roleLabel.toLowerCase()}-error`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-400 mb-1">
              {roleLabel}
            </span>
            <h3 className="text-sm font-semibold text-zinc-200 truncate" title={locationLabel}>
              {locationLabel}
            </h3>
          </div>
          <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-500 shrink-0">
            <CloudOff className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>

        <div className="p-3 rounded-md bg-zinc-950/70 border border-zinc-800/80 text-xs text-zinc-400">
          <p className="font-medium text-zinc-300">Weather temporarily unavailable</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Commute comparison and rankings remain unaffected.
          </p>
        </div>

        {showAttribution && (
          <div className="pt-1 text-right">
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
            >
              Weather data by Open-Meteo
            </a>
          </div>
        )}
      </Card>
    );
  }

  const { current, forecast } = weather;

  return (
    <Card
      className={cn('border-zinc-800 bg-zinc-900/75 overflow-hidden flex flex-col justify-between', className)}
      data-testid={`weather-card-${roleLabel.toLowerCase()}`}
    >
      {/* Current Conditions Section */}
      <div className="p-4 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-300">
                {roleLabel}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-950/70 border border-zinc-800/70 text-zinc-400">
                Current
              </span>
            </div>
            <h3
              className="text-sm font-semibold text-zinc-100 truncate"
              title={locationLabel}
            >
              {locationLabel}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 shadow-xs">
              <WeatherIcon
                category={current.category}
                weatherCode={current.weatherCode}
                className="w-5 h-5"
              />
            </div>
          </div>
        </div>

        {/* Temperature & WMO Condition */}
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2.5">
            <span className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight text-zinc-100">
              {current.temperatureC.toFixed(1)}°C
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400 tabular-nums">
              <Thermometer className="w-3 h-3 text-zinc-500" aria-hidden="true" />
              <span>Feels like {current.apparentTemperatureC.toFixed(1)}°C</span>
            </span>
          </div>

          <span className="text-xs font-medium text-zinc-200">
            {current.conditionLabel}
          </span>
        </div>

        {/* Core Live Telemetry Row: Humidity, Precipitation, Wind Speed */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-md bg-zinc-950/70 border border-zinc-800/90">
            <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <Droplets className="w-3 h-3 text-zinc-400" aria-hidden="true" />
              <span>Humidity</span>
            </span>
            <span className="block text-xs sm:text-sm font-semibold font-mono tabular-nums text-zinc-100 mt-0.5">
              {Math.round(current.humidityPercent)}%
            </span>
          </div>

          <div className="p-2 rounded-md bg-zinc-950/70 border border-zinc-800/90">
            <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <Umbrella className="w-3 h-3 text-zinc-400" aria-hidden="true" />
              <span>Precip</span>
            </span>
            <span
              className={cn(
                'block text-xs sm:text-sm font-semibold font-mono tabular-nums mt-0.5',
                current.precipitationMm > 0 ? 'text-sky-300' : 'text-zinc-100'
              )}
            >
              {formatPrecipitationMm(current.precipitationMm)}
            </span>
          </div>

          <div className="p-2 rounded-md bg-zinc-950/70 border border-zinc-800/90">
            <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <Wind className="w-3 h-3 text-zinc-400" aria-hidden="true" />
              <span>Wind</span>
            </span>
            <span className="block text-xs sm:text-sm font-semibold font-mono tabular-nums text-zinc-100 mt-0.5">
              {current.windSpeedKmh.toFixed(1)} km/h
            </span>
          </div>
        </div>
      </div>

      {/* Distinct Hourly Forecast Section (when available) */}
      {forecast.available && forecast.nextHours.length > 0 && (
        <div
          className="px-4 py-2.5 bg-zinc-950/80 border-t border-zinc-800/90 space-y-1.5"
          aria-label={`Hourly forecast for ${locationLabel}`}
        >
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              <span>Hourly Forecast</span>
            </span>
            <span>{weather.timezoneAbbreviation || weather.timezone}</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {forecast.nextHours.map((hr) => (
              <div
                key={hr.time}
                className={cn(
                  'px-2 py-1.5 rounded border text-[11px] font-mono tabular-nums flex flex-col gap-0.5',
                  hr.rainSeverity !== 'none'
                    ? 'border-sky-800/60 bg-sky-950/20 text-zinc-200'
                    : 'border-zinc-800/80 bg-zinc-900/50 text-zinc-300'
                )}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-zinc-400">{hr.hourLabel}</span>
                  <WeatherIcon
                    category={hr.category}
                    weatherCode={hr.weatherCode}
                    className="w-3.5 h-3.5"
                  />
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className={hr.precipitationMm > 0 ? 'text-sky-300' : 'text-zinc-400'}>
                    {hr.precipitationMm.toFixed(1)} mm
                  </span>
                  {hr.precipitationProbability !== null && (
                    <span className="text-zinc-500">{hr.precipitationProbability}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAttribution && (
        <div className="px-4 py-2 bg-zinc-950 border-t border-zinc-800 text-right">
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 underline underline-offset-4"
          >
            Weather data by Open-Meteo
          </a>
        </div>
      )}
    </Card>
  );
};

