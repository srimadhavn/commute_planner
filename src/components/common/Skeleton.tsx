import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-zinc-800 rounded-md ${className}`}
    />
  );
};

export const PlanResultsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 w-full" aria-label="Loading route options">
      {/* Top Banner Skeleton */}
      <Skeleton className="h-20 w-full rounded-xl bg-zinc-900 border border-zinc-800" />

      {/* Chips Skeleton */}
      <div className="flex gap-2">
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>

      {/* Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-5 border border-zinc-800 rounded-xl bg-zinc-900/80 space-y-4"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-4 w-60" />
            </div>
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
};
