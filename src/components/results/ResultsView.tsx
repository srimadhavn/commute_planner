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
    <div className="space-y-6 animate-fade-in" aria-live="polite">
      {/* Top Headline Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              Smart Commute Match
            </span>
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight">
              {headline}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100">
              Between {planData.origin.label} and {planData.destination.label} ({planData.trip_distance_km} km)
            </p>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-50 transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-white min-h-touch"
            aria-label="Edit trip locations and options"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Modify Plan</span>
          </button>
        </div>
      </div>

      {/* Sorting Chips & View Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Chips for Client-Side Re-sorting */}
        <div
          className="flex flex-wrap items-center gap-2"
          role="radiogroup"
          aria-label="Re-sort commute options"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
            Rank By:
          </span>

          {[
            { id: 'best', label: 'Best Match', icon: Sparkles },
            { id: 'fastest', label: 'Fastest', icon: Zap },
            { id: 'cheapest', label: 'Cheapest', icon: DollarSign },
            { id: 'greenest', label: 'Greenest', icon: Leaf },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={activeSort === id}
              onClick={() => setActiveSort(id as SortPreset)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-touch ${
                activeSort === id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              } focus-visible:ring-2 focus-visible:ring-primary-500`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* View Switcher: List vs Map */}
        <div
          className="inline-flex self-start sm:self-auto rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700"
          role="group"
          aria-label="Toggle results view mode"
        >
          <button
            type="button"
            onClick={() => setActiveView('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-touch ${
              activeView === 'list'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            } focus-visible:ring-2 focus-visible:ring-primary-500`}
            aria-pressed={activeView === 'list'}
          >
            <List className="w-4 h-4" />
            <span>Option Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('map')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-touch ${
              activeView === 'map'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            } focus-visible:ring-2 focus-visible:ring-primary-500`}
            aria-pressed={activeView === 'map'}
          >
            <Map className="w-4 h-4" />
            <span>Map & Stations</span>
          </button>
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
