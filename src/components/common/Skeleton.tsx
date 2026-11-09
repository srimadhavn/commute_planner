import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${className}`}
    />
  );
};

export const PlanResultsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 w-full" aria-label="Loading route options">
      {/* Top Banner Skeleton */}
      <Skeleton className="h-20 w-full rounded-xl" />

      {/* Chips Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>

      {/* Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          <Skeleton className="h-14 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );
};
