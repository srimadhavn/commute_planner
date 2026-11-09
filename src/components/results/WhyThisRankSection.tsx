import React from 'react';
import { DollarSign, Clock, Leaf, Info, HelpCircle } from 'lucide-react';
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
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
          <HelpCircle className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          <span>Why this rank? (Composite Economic Score)</span>
        </div>
        <span className="font-extrabold text-sm text-primary-700 dark:text-primary-300">
          {formatCurrency(compositeScore)}
        </span>
      </div>

      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        Routes are ranked by a generalized cost score (lower is better). This converts out-of-pocket
        expenses, your time spent, and environmental carbon impacts into a single comparative dollar value:
      </p>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <DollarSign className="w-3.5 h-3.5 text-blue-500" />
            <span>Money Cost</span>
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(costBreakdown.money)}
          </span>
          <span className="block text-[10px] text-slate-400 mt-0.5">Fare, fuel & parking</span>
        </div>

        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Time Value</span>
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(costBreakdown.time_value)}
          </span>
          <span className="block text-[10px] text-slate-400 mt-0.5">Valued at standard commute wage</span>
        </div>

        <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-semibold mb-1">
            <Leaf className="w-3.5 h-3.5 text-emerald-500" />
            <span>Carbon Value</span>
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(costBreakdown.carbon_value)}
          </span>
          <span className="block text-[10px] text-slate-400 mt-0.5">EPA social cost of emissions</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>Current preset ({priority}) adjusts the weights of time, cost, and emissions accordingly.</span>
      </div>
    </div>
  );
};
