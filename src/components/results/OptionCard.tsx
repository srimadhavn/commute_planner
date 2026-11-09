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
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { WhyThisRankSection } from './WhyThisRankSection';
import { LegTimeline } from './LegTimeline';
import { cn } from '../../lib/utils';

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
    if (n.includes('bike')) return <Bike className="w-4 h-4 text-emerald-400" />;
    if (n.includes('subway') || n.includes('train') || n.includes('rail')) {
      return <Train className="w-4 h-4 text-zinc-200" />;
    }
    if (n.includes('bus')) return <Bus className="w-4 h-4 text-zinc-300" />;
    if (n.includes('walk')) return <Footprints className="w-4 h-4 text-zinc-300" />;
    if (n.includes('drive') || n.includes('car')) return <Car className="w-4 h-4 text-zinc-400" />;
    return <Train className="w-4 h-4 text-zinc-200" />;
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
    <Card
      as="article"
      role="article"
      className={cn(
        'transition-all duration-200 border-zinc-800 bg-zinc-900/80',
        rankIndex === 0 && 'border-zinc-700 shadow-md ring-1 ring-zinc-700/50'
      )}
      aria-labelledby={`option-title-${option.id}`}
    >
      {/* Top Card Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 mt-0.5 text-zinc-200 shadow-xs">
              {getPrimaryIcon(option.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  id={`option-title-${option.id}`}
                  className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight"
                >
                  {option.name}
                </h3>

                {/* Quality Badge */}
                {option.data_quality === 'estimated' && <Badge variant="estimated" />}
                {option.data_quality === 'routed' && <Badge variant="routed" />}
              </div>

              <p className="text-xs text-zinc-400 mt-0.5 font-mono tabular-nums">
                {formatDistance(option.total_distance_km)} • {option.legs.length} segment
                {option.legs.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Save Trip Button using shadcn Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaved || justSaved || isSaving}
            className={cn(
              'h-8 text-xs border-zinc-800 font-medium',
              (isSaved || justSaved) && 'border-zinc-700 text-zinc-200 bg-zinc-800'
            )}
            aria-label={isSaved || justSaved ? 'Trip saved' : `Save ${option.name} trip`}
          >
            {isSaved || justSaved ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </>
            )}
          </Button>
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
          <div className="mt-3 p-2.5 rounded-md bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
            <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Vs Driving:{' '}
                <strong className="text-zinc-100">
                  Saves {formatCurrency(option.vs_car.cost_savings)} & {formatCo2(option.vs_car.co2_savings_g)}
                </strong>{' '}
                ({formatTimeDiff(option.vs_car.time_diff_min)})
              </span>
            </div>
          </div>
        )}

        {/* 3 Core Metric Bars (Clean high-contrast with tabular numbers) */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-4 pt-4 border-t border-zinc-800">
          {/* Time Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-zinc-400 font-medium">
                <Clock className="w-3 h-3 text-zinc-400" />
                <span>Time</span>
              </span>
              <span className="font-bold text-zinc-100 font-mono tabular-nums">
                {formatTime(option.total_time_min)}
              </span>
            </div>
            <Progress
              value={timePercent}
              indicatorClassName="bg-zinc-300"
              aria-label={`Time: ${formatTime(option.total_time_min)}`}
            />
          </div>

          {/* Cost Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-zinc-400 font-medium">
                <DollarSign className="w-3 h-3 text-zinc-400" />
                <span>Cost</span>
              </span>
              <span className="font-bold text-zinc-100 font-mono tabular-nums">
                {formatCurrency(option.total_cost)}
              </span>
            </div>
            <Progress
              value={costPercent}
              indicatorClassName="bg-zinc-300"
              aria-label={`Cost: ${formatCurrency(option.total_cost)}`}
            />
          </div>

          {/* CO2 Metric */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-zinc-400 font-medium">
                <Leaf className="w-3 h-3 text-emerald-400" />
                <span>CO₂</span>
              </span>
              <span className="font-bold text-zinc-100 font-mono tabular-nums">
                {formatCo2(option.total_co2_g)}
              </span>
            </div>
            <Progress
              value={co2Percent}
              indicatorClassName={option.total_co2_g === 0 ? 'bg-emerald-400' : 'bg-zinc-400'}
              aria-label={`Carbon emissions: ${formatCo2(option.total_co2_g)}`}
            />
          </div>
        </div>
      </div>

      {/* Expandable Footer Controls */}
      <div className="px-4 sm:px-5 py-2.5 bg-zinc-950/60 border-t border-zinc-800 flex items-center justify-between text-xs">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowWhyRank(!showWhyRank)}
          className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100"
          aria-expanded={showWhyRank}
        >
          <HelpCircle className="w-3.5 h-3.5 mr-1 text-zinc-500" />
          <span>{showWhyRank ? 'Hide Cost Breakdown' : 'Why this rank?'}</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide Segments' : 'View Segments'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </Button>
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
    </Card>
  );
};
