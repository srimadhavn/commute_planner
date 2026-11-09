import React, { useState } from 'react';
import {
  Clock,
  DollarSign,
  Leaf,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  HelpCircle,
  Footprints,
  Train,
  Bus,
  Bike,
  Car,
  TrendingDown,
} from 'lucide-react';
import { TripOption, OptionTag } from '../../types/api';
import {
  formatCurrency,
  formatTime,
  formatCo2,
  formatDistance,
  formatTimeDiff,
} from '../../utils/formatters';
import { Badge } from '../common/Badge';
import { WhyThisRankSection } from './WhyThisRankSection';
import { LegTimeline } from './LegTimeline';

interface OptionCardProps {
  option: TripOption;
  rankIndex: number;
  extremes: { maxTime: number; maxCost: number; maxCo2: number };
  onSaveTrip: (option: TripOption) => Promise<boolean>;
  isSaved?: boolean;
  priority?: string;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  option,
  rankIndex,
  extremes,
  onSaveTrip,
  isSaved = false,
  priority = 'balanced',
}) => {
  const [isExpanded, setIsExpanded] = useState(rankIndex === 0);
  const [showWhyRank, setShowWhyRank] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const timePercent = Math.min(Math.round((option.total_time_min / extremes.maxTime) * 100), 100);
  const costPercent = Math.min(Math.round((option.total_cost / extremes.maxCost) * 100), 100);
  const co2Percent = Math.min(Math.round((option.total_co2_g / extremes.maxCo2) * 100), 100);

  const getPrimaryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('bike')) return <Bike className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    if (n.includes('subway') || n.includes('train') || n.includes('rail')) {
      return <Train className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
    if (n.includes('bus')) return <Bus className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    if (n.includes('walk')) return <Footprints className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    if (n.includes('drive') || n.includes('car')) return <Car className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
    return <Train className="w-5 h-5 text-primary-600" />;
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved || justSaved || isSaving) return;

    setIsSaving(true);
    const success = await onSaveTrip(option);
    setIsSaving(false);
    if (success) {
      setJustSaved(true);
    }
  };

  return (
    <article
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        rankIndex === 0
          ? 'bg-white dark:bg-slate-900 border-primary-400 dark:border-primary-600 shadow-md ring-1 ring-primary-500/20'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
      }`}
      aria-labelledby={`option-title-${option.id}`}
    >
      {/* Top Card Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mt-0.5">
              {getPrimaryIcon(option.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  id={`option-title-${option.id}`}
                  className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100"
                >
                  {option.name}
                </h3>

                {/* Quality Badge */}
                {option.data_quality === 'estimated' && (
                  <Badge variant="estimated" />
                )}
                {option.data_quality === 'routed' && (
                  <Badge variant="routed" />
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {formatDistance(option.total_distance_km)} • {option.legs.length} segment
                {option.legs.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Save Trip Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaved || justSaved || isSaving}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors min-h-touch ${
              isSaved || justSaved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            } focus-visible:ring-2 focus-visible:ring-primary-500`}
            aria-label={isSaved || justSaved ? 'Trip saved' : `Save ${option.name} trip`}
          >
            {isSaved || justSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </>
            )}
          </button>
        </div>

        {/* Tags Row */}
        {option.tags && option.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3" aria-label="Option accolades">
            {option.tags.map((tag: OptionTag) => (
              <Badge key={tag} variant={tag as any} />
            ))}
          </div>
        )}

        {/* Savings vs Driving Callout */}
        {option.vs_car && (option.vs_car.cost_savings > 0 || option.vs_car.co2_savings_g > 0) && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-2 font-medium">
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Vs Driving:{' '}
                <strong>
                  Saves {formatCurrency(option.vs_car.cost_savings)} & {formatCo2(option.vs_car.co2_savings_g)}
                </strong>{' '}
                ({formatTimeDiff(option.vs_car.time_diff_min)})
              </span>
            </div>
          </div>
        )}

        {/* 3 Core Metric Bars (Comparable Side-by-Side) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Time Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Time</span>
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                {formatTime(option.total_time_min)}
              </span>
            </div>
            {/* Visual comparative bar */}
            <div
              className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={option.total_time_min}
              aria-valuemin={0}
              aria-valuemax={extremes.maxTime}
              aria-label={`Time: ${formatTime(option.total_time_min)}`}
            >
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(timePercent, 6)}%` }}
              />
            </div>
          </div>

          {/* Cost Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                <span>Cost</span>
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                {formatCurrency(option.total_cost)}
              </span>
            </div>
            {/* Visual comparative bar */}
            <div
              className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={option.total_cost}
              aria-valuemin={0}
              aria-valuemax={extremes.maxCost}
              aria-label={`Cost: ${formatCurrency(option.total_cost)}`}
            >
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(costPercent, 6)}%` }}
              />
            </div>
          </div>

          {/* CO2 Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                <span>CO₂</span>
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                {formatCo2(option.total_co2_g)}
              </span>
            </div>
            {/* Visual comparative bar */}
            <div
              className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={option.total_co2_g}
              aria-valuemin={0}
              aria-valuemax={extremes.maxCo2}
              aria-label={`Carbon emissions: ${formatCo2(option.total_co2_g)}`}
            >
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(co2Percent, 6)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Footer Controls */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setShowWhyRank(!showWhyRank)}
          className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium focus-visible:ring-2 focus-visible:ring-primary-500 rounded p-1 min-h-touch"
          aria-expanded={showWhyRank}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showWhyRank ? 'Hide Cost Breakdown' : 'Why this rank?'}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium focus-visible:ring-2 focus-visible:ring-primary-500 rounded p-1 min-h-touch"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide Segments' : 'View Segments'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Sections */}
      {(showWhyRank || isExpanded) && (
        <div className="p-4 sm:p-5 pt-0 space-y-4">
          {showWhyRank && (
            <WhyThisRankSection
              compositeScore={option.composite_score}
              costBreakdown={option.cost_breakdown}
              priority={priority}
            />
          )}

          {isExpanded && <LegTimeline legs={option.legs} />}
        </div>
      )}
    </article>
  );
};
