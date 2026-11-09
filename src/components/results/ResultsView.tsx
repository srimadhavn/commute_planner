import React, { useState } from 'react';
import { Sparkles, Zap, DollarSign, Leaf, Map, List, RotateCcw } from 'lucide-react';
import { PlanTripResponse, TripOption } from '../../types/api';
import { SortPreset, sortTripOptions, calculateMetricExtremes } from '../../utils/sorting';
import { formatSavingsHeadline } from '../../utils/formatters';
import { OptionCard } from './OptionCard';
import { TripMap } from '../map/TripMap';
import { useToast } from '../../context/ToastContext';
import { saveTrip } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ResultsViewProps {
  planData: PlanTripResponse;
  priority?: string;
  onReset: () => void;
  savedTripIds?: Set<string>;
  onTripSaved?: (savedItem: any) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  planData,
  priority = 'balanced',
  onReset,
  savedTripIds = new Set(),
  onTripSaved,
}) => {
  const { idToken, isDemoMode } = useAuth();
  const { showToast } = useToast();
  const [activeSort, setActiveSort] = useState<SortPreset>('best');
  const [activeView, setActiveView] = useState<'list' | 'map'>('list');
  const [localSavedIds, setLocalSavedIds] = useState<Set<string>>(savedTripIds);

  const sortedOptions = sortTripOptions(planData.options, activeSort);
  const extremes = calculateMetricExtremes(planData.options);

  // Top recommendation is first option in original API rank or sorted list
  const topOption = sortedOptions[0] || planData.options[0];
  const headline = topOption
    ? formatSavingsHeadline(topOption.name, topOption.vs_car)
    : 'Trip comparison ready';

  const handleSaveTrip = async (option: TripOption): Promise<boolean> => {
    // Optimistic save
    const previousSaved = new Set(localSavedIds);
    setLocalSavedIds((prev) => new Set([...prev, option.id]));
    showToast(`Saved "${option.name}" to My Impact!`, 'success');

    if (onTripSaved) {
      onTripSaved({
        trip_ts: new Date().toISOString(),
        option_name: option.name,
        origin: planData.origin.label,
        destination: planData.destination.label,
        time_min: option.total_time_min,
        cost: option.total_cost,
        co2_g: option.total_co2_g,
        co2_saved_g: option.vs_car?.co2_savings_g || 0,
        cost_saved: option.vs_car?.cost_savings || 0,
        car_km_avoided: option.total_distance_km,
      });
    }

    if (isDemoMode) {
      return true;
    }

    if (!idToken) {
      showToast('Signed-out state: saved locally in demo mode.', 'info');
      return true;
    }

    try {
      await saveTrip(
        {
          option_id: option.id,
          origin: planData.origin.label,
          destination: planData.destination.label,
          time_min: option.total_time_min,
          cost: option.total_cost,
          co2_g: option.total_co2_g,
          co2_saved_g: option.vs_car?.co2_savings_g || 0,
          cost_saved: option.vs_car?.cost_savings || 0,
        },
        idToken
      );
      return true;
    } catch (err: any) {
      // Rollback on error
      setLocalSavedIds(previousSaved);
      showToast(err.message || 'Failed to save trip to backend.', 'error');
      return false;
    }
  };

  return (
    <div className="space-y-6" aria-live="polite">
      {/* Top Executive Headline Card */}
      <Card className="border-zinc-800 bg-zinc-900/90 shadow-md">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                Smart Commute Match
              </span>
              <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-zinc-100">
                {headline}
              </h2>
              <p className="text-xs text-zinc-400 font-mono tabular-nums">
                Between {planData.origin.label} and {planData.destination.label} ({planData.trip_distance_km} km)
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="self-start sm:self-center h-8 text-xs border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200"
              aria-label="Edit trip locations and options"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              <span>Modify Plan</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sorting Chips & View Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Chips for Client-Side Re-sorting using shadcn Button */}
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="radiogroup"
          aria-label="Re-sort commute options"
        >
          <span className="text-xs uppercase tracking-wider text-zinc-500 mr-1 hidden sm:inline font-mono">
            Rank:
          </span>

          {[
            { id: 'best', label: 'Best Match', icon: Sparkles },
            { id: 'fastest', label: 'Fastest', icon: Zap },
            { id: 'cheapest', label: 'Cheapest', icon: DollarSign },
            { id: 'greenest', label: 'Greenest', icon: Leaf },
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              type="button"
              role="radio"
              variant={activeSort === id ? 'secondary' : 'outline'}
              size="sm"
              aria-checked={activeSort === id}
              onClick={() => setActiveSort(id as SortPreset)}
              className={cn(
                'h-8 text-xs border-zinc-800 font-medium',
                activeSort === id
                  ? 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold border-zinc-300'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              )}
            >
              <Icon className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
              <span>{label}</span>
            </Button>
          ))}
        </div>

        {/* View Switcher: List vs Map using shadcn Button Group */}
        <div
          className="inline-flex self-start sm:self-auto rounded-lg bg-zinc-950 p-1 border border-zinc-800"
          role="group"
          aria-label="Toggle results view mode"
        >
          <Button
            type="button"
            variant={activeView === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('list')}
            className={cn(
              'h-7 px-2.5 text-xs font-medium',
              activeView === 'list' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'
            )}
            aria-pressed={activeView === 'list'}
          >
            <List className="w-3.5 h-3.5 mr-1" />
            <span>Option Cards</span>
          </Button>

          <Button
            type="button"
            variant={activeView === 'map' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('map')}
            className={cn(
              'h-7 px-2.5 text-xs font-medium',
              activeView === 'map' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-100'
            )}
            aria-pressed={activeView === 'map'}
          >
            <Map className="w-3.5 h-3.5 mr-1" />
            <span>Map & Stations</span>
          </Button>
        </div>
      </div>

      {/* Main View Content: Either Option Cards or Map View */}
      {activeView === 'list' ? (
        <div className="space-y-4" role="feed" aria-label="Trip comparison options">
          {sortedOptions.map((option, idx) => (
            <OptionCard
              key={option.id}
              option={option}
              rankIndex={idx}
              extremes={extremes}
              onSaveTrip={handleSaveTrip}
              isSaved={localSavedIds.has(option.id)}
              priority={priority}
            />
          ))}
        </div>
      ) : (
        <TripMap
          origin={planData.origin}
          destination={planData.destination}
          options={planData.options}
        />
      )}
    </div>
  );
};
