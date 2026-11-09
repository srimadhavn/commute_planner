import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppShell, ActiveTab } from './components/layout/AppShell';
import { PlanForm } from './components/plan/PlanForm';
import { ResultsView } from './components/results/ResultsView';
import { ImpactView } from './components/impact/ImpactView';
import { HowItWorksModal } from './components/info/HowItWorksModal';
import { SignInModal } from './components/auth/SignInModal';
import { PlanResultsSkeleton } from './components/common/Skeleton';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { planTrip, getTrips, ApiError } from './services/api';
import { PlanTripRequest, PlanTripResponse, SavedTripsResponse } from './types/api';
import { SAMPLE_PLAN_RESPONSE, SAMPLE_SAVED_TRIPS } from './services/sampleData';
import { AlertCircle, RotateCw } from 'lucide-react';
import { Button } from './components/ui/button';

export const App: React.FC = () => {
  const {
    idToken,
    isAuthenticated,
    isDemoMode,
    isSessionExpiredModalOpen,
    dismissSessionExpiredModal,
    setPreservedInputs,
  } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<ActiveTab>('plan');
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [planResult, setPlanResult] = useState<PlanTripResponse | null>(null);
  const [lastPlannedParams, setLastPlannedParams] = useState<{
    origin: any;
    destination: any;
    priority: any;
    parkingCost: number;
    originDisplay: string;
    destDisplay: string;
  } | null>(null);

  // Local saved trips collection for immediate updates & demo mode
  const [demoSavedTrips, setDemoSavedTrips] = useState<SavedTripsResponse>(SAMPLE_SAVED_TRIPS);

  // Saved Trips Query
  const tripsQuery = useQuery<SavedTripsResponse, ApiError>({
    queryKey: ['saved-trips', idToken, isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return demoSavedTrips;
      }
      if (!idToken) {
        return { totals: { trips: 0, co2_saved_g: 0, cost_saved: 0, car_km_avoided: 0 }, trips: [] };
      }
      return getTrips(idToken);
    },
    enabled: isAuthenticated,
  });

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
        await new Promise((res) => setTimeout(res, 500));
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
    },
    onError: (err) => {
      showToast(err.message || 'Failed to calculate commute routes.', 'error');
    },
  });

  const handlePlanSubmit = (params: {
    origin: any;
    destination: any;
    priority: any;
    parkingCost: number;
    originDisplay: string;
    destDisplay: string;
  }) => {
    setLastPlannedParams(params);
    setPreservedInputs({
      origin: params.originDisplay,
      destination: params.destDisplay,
      priority: params.priority,
      parkingCost: params.parkingCost,
    });
    planTripMutation.mutate(params);
  };

  const handleTripSaved = (savedItem: any) => {
    if (isDemoMode) {
      setDemoSavedTrips((prev) => ({
        totals: {
          trips: prev.totals.trips + 1,
          co2_saved_g: prev.totals.co2_saved_g + (savedItem.co2_saved_g || 0),
          cost_saved: prev.totals.cost_saved + (savedItem.cost_saved || 0),
          car_km_avoided: prev.totals.car_km_avoided + (savedItem.car_km_avoided || 0),
        },
        trips: [savedItem, ...prev.trips],
      }));
    } else {
      queryClient.invalidateQueries({ queryKey: ['saved-trips'] });
    }
  };

  // Extract recent destination places from saved trips for quick auto-fill chips
  const recentPlaces = tripsQuery.data?.trips.map((t) => t.destination).filter(Boolean) || [
    'Times Square, NY',
    'Grand Central Terminal, NY',
    'Brooklyn Bridge, NY',
  ];

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onOpenSignIn={() => setIsSignInOpen(true)}
    >
      {/* Tab 1: Plan Commute */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          {!planResult && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                  Smarter, Greener Commute Comparison
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400">
                  Side-by-side time, out-of-pocket costs, and CO₂ emissions versus driving.
                </p>
              </div>

              <PlanForm
                onPlanTrip={handlePlanSubmit}
                isLoading={planTripMutation.isPending}
                savedRecentPlaces={Array.from(new Set(recentPlaces))}
                onRequireAuth={() => setIsSignInOpen(true)}
              />
            </div>
          )}

          {/* Loading Skeleton */}
          {planTripMutation.isPending && (
            <div className="max-w-3xl mx-auto mt-6">
              <PlanResultsSkeleton />
            </div>
          )}

          {/* Error Message with Retry */}
          {planTripMutation.isError && (
            <div
              role="alert"
              className="max-w-2xl mx-auto p-4 rounded-xl bg-zinc-900 border border-rose-900/60 text-rose-200 flex items-center justify-between gap-3 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{planTripMutation.error?.message || 'Could not plan trip.'}</span>
              </div>
              {lastPlannedParams && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => planTripMutation.mutate(lastPlannedParams)}
                  className="h-7 text-xs border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200"
                >
                  <RotateCw className="w-3 h-3 mr-1" />
                  <span>Retry</span>
                </Button>
              )}
            </div>
          )}

          {/* Results View */}
          {planResult && !planTripMutation.isPending && (
            <div className="max-w-4xl mx-auto">
              <ResultsView
                planData={planResult}
                priority={lastPlannedParams?.priority}
                onReset={() => setPlanResult(null)}
                onTripSaved={handleTripSaved}
              />
            </div>
          )}
        </div>
      )}

      {/* Tab 2: My Impact */}
      {activeTab === 'impact' && (
        <ImpactView
          impactData={tripsQuery.data || (isDemoMode ? demoSavedTrips : null)}
          isLoading={tripsQuery.isLoading}
          onNavigateToPlan={() => setActiveTab('plan')}
          isDemoMode={isDemoMode}
        />
      )}

      {/* Tab 3: How It Works & Assumptions */}
      {activeTab === 'methodology' && (
        <HowItWorksModal onNavigateToPlan={() => setActiveTab('plan')} />
      )}

      {/* Auth Modals */}
      <SignInModal
        isOpen={isSignInOpen || isSessionExpiredModalOpen}
        onClose={() => {
          setIsSignInOpen(false);
          dismissSessionExpiredModal();
        }}
        isSessionExpired={isSessionExpiredModalOpen}
      />
    </AppShell>
  );
};
