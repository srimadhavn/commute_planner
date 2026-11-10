import React from 'react';
import { CloudRain, AlertTriangle, CheckCircle2, Train } from 'lucide-react';
import { LocationWeather, TripWeatherSummary } from '../../types/weather';
import { WeatherCard } from './WeatherCard';
import { Badge as ShadcnBadge } from '../ui/badge';
import { cn } from '../../lib/utils';

export interface TripWeatherSectionProps {
  originLabel: string;
  destinationLabel: string;
  originWeather?: LocationWeather;
  originLoading: boolean;
  originError: boolean;
  destinationWeather?: LocationWeather;
  destinationLoading: boolean;
  destinationError: boolean;
  summary: TripWeatherSummary;
}

export const TripWeatherSection: React.FC<TripWeatherSectionProps> = ({
  originLabel,
  destinationLabel,
  originWeather,
  originLoading,
  originError,
  destinationWeather,
  destinationLoading,
  destinationError,
  summary,
}) => {
  const sourceLabel =
    summary.conditionSource === 'both'
      ? 'Current & Hourly Forecast'
      : summary.conditionSource === 'forecast'
        ? 'Hourly Forecast'
        : 'Current Conditions';

  return (
    <section className="space-y-3" aria-label="Origin and destination weather conditions">
      {/* Header & Open-Meteo Attribution */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          Route Weather Conditions
        </h3>
        <a
          href="https://open-meteo.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 underline underline-offset-4 transition-colors"
        >
          Weather data by Open-Meteo
        </a>
      </div>

      {/* Origin & Destination Weather Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <WeatherCard
          roleLabel="Origin"
          locationLabel={originLabel}
          weather={originWeather}
          isLoading={originLoading}
          isError={originError}
        />

        <WeatherCard
          roleLabel="Destination"
          locationLabel={destinationLabel}
          weather={destinationWeather}
          isLoading={destinationLoading}
          isError={destinationError}
        />
      </div>

      {/* Separate Weather Recommendation Banner (only shown when weather data loaded; never affects backend ranks) */}
      {summary.hasWeatherData && (
        <div
          aria-label="Weather recommendation"
          data-testid="weather-recommendation-banner"
          className={cn(
            'p-3 sm:p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs',
            summary.overallSeverity === 'heavy'
              ? 'border-rose-800/60 bg-rose-950/20 text-rose-200'
              : summary.overallSeverity === 'moderate'
                ? 'border-sky-800/60 bg-sky-950/20 text-sky-200'
                : summary.overallSeverity === 'light'
                  ? 'border-amber-800/50 bg-amber-950/15 text-amber-200'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
          )}
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 shrink-0">
              {summary.overallSeverity === 'heavy' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400" aria-hidden="true" />
              ) : summary.overallSeverity === 'moderate' ? (
                <Train className="w-4 h-4 text-sky-400" aria-hidden="true" />
              ) : summary.overallSeverity === 'light' ? (
                <CloudRain className="w-4 h-4 text-amber-400" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              )}
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-zinc-950/80 border border-zinc-700/80 text-zinc-200">
                  Weather recommendation
                </span>
                <ShadcnBadge
                  variant="subtle"
                  className="text-[10px] font-mono font-normal border-zinc-700/80"
                >
                  {sourceLabel}
                </ShadcnBadge>
              </div>
              <p className="font-semibold text-zinc-100 leading-snug pt-0.5">
                {summary.headline}
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {summary.detail}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

