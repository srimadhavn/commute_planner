import React from 'react';
import { Sparkles, Zap, DollarSign, Leaf, AlertTriangle } from 'lucide-react';

export interface BadgeProps {
  variant: 'best_overall' | 'fastest' | 'cheapest' | 'greenest' | 'estimated' | 'routed' | 'sample' | 'stale';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  switch (variant) {
    case 'best_overall':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 ${className}`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span>{children || 'Best Overall'}</span>
        </span>
      );
    case 'fastest':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-700 ${className}`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <span>{children || 'Fastest'}</span>
        </span>
      );
    case 'cheapest':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200 border border-blue-300 dark:border-blue-700 ${className}`}
        >
          <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          <span>{children || 'Cheapest'}</span>
        </span>
      );
    case 'greenest':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-200 border border-teal-300 dark:border-teal-700 ${className}`}
        >
          <Leaf className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
          <span>{children || 'Greenest'}</span>
        </span>
      );
    case 'estimated':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 ${className}`}
          title="Estimated travel time based on averages rather than real-time live routing"
        >
          <span>{children || 'Estimated'}</span>
        </span>
      );
    case 'routed':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}
        >
          <span>{children || 'Routed'}</span>
        </span>
      );
    case 'sample':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 border border-purple-300 dark:border-purple-700 ${className}`}
        >
          <span>Sample data</span>
        </span>
      );
    case 'stale':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-400 ${className}`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span>{children || 'Stale Feed'}</span>
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 ${className}`}
        >
          {children}
        </span>
      );
  }
};
