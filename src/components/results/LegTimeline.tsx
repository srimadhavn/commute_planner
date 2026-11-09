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
    if (normalized.includes('walk')) return <Footprints className="w-3.5 h-3.5 text-zinc-300" />;
    if (normalized.includes('subway') || normalized.includes('rail') || normalized.includes('train')) {
      return <Train className="w-3.5 h-3.5 text-zinc-300" />;
    }
    if (normalized.includes('bus')) return <Bus className="w-3.5 h-3.5 text-zinc-300" />;
    if (normalized.includes('bike')) return <Bike className="w-3.5 h-3.5 text-emerald-400" />;
    if (normalized.includes('drive') || normalized.includes('car')) {
      return <Car className="w-3.5 h-3.5 text-zinc-400" />;
    }
    return <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />;
  };

  return (
    <div className="space-y-3 pt-3 border-t border-zinc-800">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
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
              className="flex items-start gap-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300"
            >
              <div className="mt-0.5 p-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200">
                {getModeIcon(leg.mode)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between font-semibold text-zinc-100">
                  <span className="capitalize">{leg.mode.replace('_', ' ')}</span>
                  <span className="font-mono text-zinc-300 tabular-nums">
                    {formatTime(leg.duration_min)} • {formatDistance(leg.distance_km)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <span className="inline-block px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800/60">
                    {leg.source === 'routing' ? 'Live Routing' : 'Estimated Time'}
                  </span>
                </div>

                {/* Live Bike Station Availability */}
                {leg.station && (
                  <div className="mt-2 p-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-1.5 text-zinc-200">
                        <Bike className="w-3.5 h-3.5 text-emerald-400" />
                        Station: {leg.station.name}
                      </span>
                      {availability && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-zinc-700 bg-zinc-800 text-zinc-200 tabular-nums">
                          {availability.label}
                        </span>
                      )}
                    </div>
                    {leg.station.ebikes_available > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-400 font-mono tabular-nums">
                        <Zap className="w-3 h-3 text-amber-400" />
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
