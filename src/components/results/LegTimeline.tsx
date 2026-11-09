import React from 'react';
import { Footprints, Train, Bus, Bike, Car, ArrowRight, Zap } from 'lucide-react';
import { TripLeg } from '../../types/api';
import { formatTime, formatDistance, getStationAvailabilityLabel } from '../../utils/formatters';

interface LegTimelineProps {
  legs: TripLeg[];
}

export const LegTimeline: React.FC<LegTimelineProps> = ({ legs }) => {
  if (!legs || legs.length === 0) return null;

  const getModeIcon = (mode: string) => {
    const normalized = mode.toLowerCase();
    if (normalized.includes('walk')) return <Footprints className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (normalized.includes('subway') || normalized.includes('rail') || normalized.includes('train')) {
      return <Train className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
    if (normalized.includes('bus')) return <Bus className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    if (normalized.includes('bike')) return <Bike className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
    if (normalized.includes('drive') || normalized.includes('car')) {
      return <Car className="w-4 h-4 text-slate-600 dark:text-slate-400" />;
    }
    return <ArrowRight className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Leg-by-Leg Route Segments
      </h4>
      <div className="space-y-2">
        {legs.map((leg, index) => {
          const availability = leg.station
            ? getStationAvailabilityLabel(leg.station.bikes_available, 10)
            : null;

          return (
            <div
              key={index}
              className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
            >
              <div className="mt-0.5 p-1.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xs">
                {getModeIcon(leg.mode)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
                  <span className="capitalize">{leg.mode.replace('_', ' ')}</span>
                  <span>
                    {formatTime(leg.duration_min)} • {formatDistance(leg.distance_km)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {leg.source === 'routing' ? 'Live Routing' : 'Estimated Time'}
                  </span>
                </div>

                {/* Live Bike Station Availability */}
                {leg.station && (
                  <div className="mt-2 p-2 rounded bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <Bike className="w-3.5 h-3.5 text-teal-600" />
                        Station: {leg.station.name}
                      </span>
                      {availability && (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${availability.badgeClass}`}>
                          {availability.label}
                        </span>
                      )}
                    </div>
                    {leg.station.ebikes_available > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-300 font-medium">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>Includes {leg.station.ebikes_available} e-bikes ready to ride</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
