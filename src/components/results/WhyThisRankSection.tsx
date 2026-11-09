import React from 'react';
import { DollarSign, Clock, Leaf, HelpCircle, Info } from 'lucide-react';
import { CostBreakdown } from '../../types/api';
import { formatCurrency } from '../../utils/formatters';

interface WhyThisRankSectionProps {
  compositeScore: number;
  costBreakdown: CostBreakdown;
  priority?: string;
}

export const WhyThisRankSection: React.FC<WhyThisRankSectionProps> = ({
  compositeScore,
  costBreakdown,
  priority = 'balanced',
}) => {
  return (
    <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
          <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
          <span>Why this rank? (Composite Economic Score)</span>
        </div>
        <span className="font-mono font-bold text-sm text-zinc-100 tabular-nums">
          {formatCurrency(compositeScore)}
        </span>
      </div>

      <p className="text-zinc-400 leading-relaxed text-[11px]">
        Ranked by generalized cost score (lower is better). Combines out-of-pocket expenses, travel time, and environmental emissions into a unified comparative dollar value:
      </p>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium mb-1">
            <DollarSign className="w-3 h-3 text-zinc-400" />
            <span>Money Cost</span>
          </div>
          <span className="text-base font-bold text-zinc-100 font-mono tabular-nums">
            {formatCurrency(costBreakdown.money)}
          </span>
          <span className="block text-[10px] text-zinc-500 mt-0.5">Fare, fuel & parking</span>
        </div>

        <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium mb-1">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>Time Value</span>
          </div>
          <span className="text-base font-bold text-zinc-100 font-mono tabular-nums">
            {formatCurrency(costBreakdown.time_value)}
          </span>
          <span className="block text-[10px] text-zinc-500 mt-0.5">Indexed to standard hourly wage</span>
        </div>

        <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-1.5 text-zinc-400 font-medium mb-1">
            <Leaf className="w-3 h-3 text-emerald-400" />
            <span>Carbon Value</span>
          </div>
          <span className="text-base font-bold text-zinc-100 font-mono tabular-nums">
            {formatCurrency(costBreakdown.carbon_value)}
          </span>
          <span className="block text-[10px] text-zinc-500 mt-0.5">EPA social cost of carbon</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-1">
        <Info className="w-3 h-3 shrink-0" />
        <span>Current preset ({priority}) adjusts the weighting of time, financial cost, and emissions.</span>
      </div>
    </div>
  );
};
