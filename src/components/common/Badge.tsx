import React from 'react';
import { Sparkles, Zap, DollarSign, Leaf, AlertTriangle } from 'lucide-react';
import { Badge as ShadcnBadge } from '../ui/badge';
import { cn } from '../../lib/utils';

export interface BadgeProps {
  variant: 'best_overall' | 'fastest' | 'cheapest' | 'greenest' | 'estimated' | 'routed' | 'sample' | 'stale';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant, children, className = '' }) => {
  switch (variant) {
    case 'best_overall':
      return (
        <ShadcnBadge
          variant="outline"
          className={cn('bg-zinc-800/80 text-zinc-100 border-zinc-700 gap-1.5 font-medium', className)}
        >
          <Sparkles className="w-3 h-3 text-zinc-300" aria-hidden="true" />
          <span>{children || 'Best Overall'}</span>
        </ShadcnBadge>
      );
    case 'fastest':
      return (
        <ShadcnBadge
          variant="outline"
          className={cn('bg-zinc-800/60 text-zinc-200 border-zinc-700/80 gap-1.5 font-medium', className)}
        >
          <Zap className="w-3 h-3 text-zinc-300" aria-hidden="true" />
          <span>{children || 'Fastest'}</span>
        </ShadcnBadge>
      );
    case 'cheapest':
      return (
        <ShadcnBadge
          variant="outline"
          className={cn('bg-zinc-800/60 text-zinc-200 border-zinc-700/80 gap-1.5 font-medium', className)}
        >
          <DollarSign className="w-3 h-3 text-zinc-300" aria-hidden="true" />
          <span>{children || 'Cheapest'}</span>
        </ShadcnBadge>
      );
    case 'greenest':
      return (
        <ShadcnBadge
          variant="outline"
          className={cn('bg-emerald-950/30 text-emerald-300 border-emerald-800/40 gap-1.5 font-medium', className)}
        >
          <Leaf className="w-3 h-3 text-emerald-400" aria-hidden="true" />
          <span>{children || 'Greenest'}</span>
        </ShadcnBadge>
      );
    case 'estimated':
      return (
        <ShadcnBadge
          variant="subtle"
          className={cn('text-[11px] font-normal text-zinc-400 border-zinc-800', className)}
          title="Estimated travel time based on averages rather than real-time live routing"
        >
          <span>{children || 'Estimated'}</span>
        </ShadcnBadge>
      );
    case 'routed':
      return (
        <ShadcnBadge
          variant="subtle"
          className={cn('text-[11px] font-normal text-zinc-300 border-zinc-800', className)}
        >
          <span>{children || 'Routed'}</span>
        </ShadcnBadge>
      );
    case 'sample':
      return (
        <ShadcnBadge
          variant="outline"
          className={cn('bg-zinc-900 text-purple-300 border-purple-800/60 text-[11px]', className)}
        >
          <span>Sample data</span>
        </ShadcnBadge>
      );
    case 'stale':
      return (
        <ShadcnBadge
          variant="outline"
          className={cn('bg-amber-950/30 text-amber-300 border-amber-800/60 gap-1.5', className)}
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" aria-hidden="true" />
          <span>{children || 'Stale Feed'}</span>
        </ShadcnBadge>
      );
    default:
      return (
        <ShadcnBadge variant="secondary" className={className}>
          {children}
        </ShadcnBadge>
      );
  }
};
