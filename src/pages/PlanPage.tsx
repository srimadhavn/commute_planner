import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle, RotateCw } from 'lucide-react';
import { PlanForm } from '../components/plan/PlanForm';
import { ResultsView } from '../components/results/ResultsView';
import { PlanResultsSkeleton } from '../components/common/Skeleton';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { planTrip, ApiError } from '../services/api';
import { PlanTripRequest, PlanTripResponse, PriorityType } from '../types/api';
import { SAMPLE_PLAN_RESPONSE } from '../services/sampleData';

interface PlanPageProps {
  onRequireAuth: () => void;
}

export const PlanPage: React.FC<PlanPageProps> = ({ onRequireAuth }) => {
  const { idToken, isDemoMode } = useAuth();
  const { showToast } = useToast();

  const [planResult, setPlanResult] = useState<PlanTripResponse | null>(null);
  const [lastPlannedParams, setLastPlannedParams] = useState<any>(null);

  // Plan Trip Mutation
  const planTripMutation = useMutation<
    PlanTripResponse,
    ApiError,
    {
      origin: any;
      destination: any;
      priority: any;
      parkingCost: number;
      originDisplay: string;
      destDisplay: string;
    }
  >({
    mutationFn: async (params) => {
      if (isDemoMode) {
        await new Promise((res) => setTimeout(res, 400));
        return {
          ...SAMPLE_PLAN_RESPONSE,
          origin: {
            ...SAMPLE_PLAN_RESPONSE.origin,
            label: params.originDisplay || SAMPLE_PLAN_RESPONSE.origin.label,
          },
          destination: {
            ...SAMPLE_PLAN_RESPONSE.destination,
            label: params.destDisplay || SAMPLE_PLAN_RESPONSE.destination.label,
          },
        };
      }

      if (!idToken) {
        throw new ApiError(401, 'Please sign in to compare and plan commutes.');
      }

      const payload: PlanTripRequest = {
        origin: params.origin,
        destination: params.destination,
        priority: params.priority,
        parking_cost: params.parkingCost,
      };

      return planTrip(payload, idToken);
    },
    onSuccess: (data, variables) => {
      setPlanResult(data);
      setLastPlannedParams(variables);
      showToast('Trip options calculated successfully!', 'success');
    },
    onError: (err) => {
      if (err.status === 401) {
        onRequireAuth();
      } else {
        showToast(err.message || 'Failed to plan trip. Please try again.', 'error');
      }
    },
  });

  const handlePlanTrip = (params: {
    origin: any;
    destination: any;
    priority: PriorityType;
    parkingCost: number;
    originDisplay: string;
    destDisplay: string;
  }) => {
    planTripMutation.mutate(params);
  };

  const handleReset = () => {
    setPlanResult(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Vercel Breadcrumbs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>commute-planner</span>
            <span>/</span>
            <span className="text-zinc-300">plan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            Trip Planning & Route Evaluation
          </h1>
          <p className="text-xs text-zinc-400">
            Side-by-side travel time, out-of-pocket costs, and CO₂ emissions versus driving.
          </p>
        </div>

        {planResult && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 text-xs border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 self-start sm:self-center"
          >
            <span>Modify Search</span>
          </Button>
        )}
      </div>

      {/* Main Workspace */}
      <div className="max-w-5xl mx-auto space-y-6">
        {!planResult && !planTripMutation.isPending && (
          <div className="space-y-6">
            <PlanForm
              onPlanTrip={handlePlanTrip}
              isLoading={planTripMutation.isPending}
              onRequireAuth={onRequireAuth}
            />
          </div>
        )}

        {/* Loading State */}
        {planTripMutation.isPending && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-100 rounded-full animate-spin" />
                <span className="text-xs font-mono text-zinc-300">
                  Routing subway, bus, walking & live Citi Bike docks...
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">API Gateway</span>
            </div>
            <PlanResultsSkeleton />
          </div>
        )}

        {/* Error State */}
        {planTripMutation.isError && (
          <div
            role="alert"
            className="p-6 rounded-xl border border-rose-900/60 bg-zinc-900/90 text-rose-200 space-y-3"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Routing Request Failed</h3>
                <p className="text-xs text-rose-300 mt-1">
                  {planTripMutation.error.message ||
                    'An error occurred while calculating your trip options.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (lastPlannedParams) {
                    planTripMutation.mutate(lastPlannedParams);
                  } else {
                    setPlanResult(null);
                  }
                }}
                className="h-8 text-xs border-rose-800 bg-zinc-950 text-rose-200 hover:bg-zinc-800"
              >
                <RotateCw className="w-3.5 h-3.5 mr-1" />
                <span>Retry Search</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Back to inputs
              </Button>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {planResult && (
          <ResultsView
            planData={planResult}
            onReset={handleReset}
            priority={lastPlannedParams?.priority || 'balanced'}
          />
        )}
      </div>
    </div>
  );
};
