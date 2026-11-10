import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Compass,
  ArrowRight,
  Leaf,
  Radio,
  Bike,
  Train,
  Bus,
  Footprints,
  Car,
  AlertCircle,
  RotateCw,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { PlanForm } from '../components/plan/PlanForm';
import { ResultsView } from '../components/results/ResultsView';
import { PlanResultsSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { planTrip, ApiError } from '../services/api';
import { PlanTripRequest, PlanTripResponse, PriorityType } from '../types/api';
import {
  SAMPLE_SYSTEM_TELEMETRY,
  SAMPLE_TRANSIT_BENCHMARKS,
  SAMPLE_SAVED_TRIPS,
  SAMPLE_PLAN_RESPONSE,
} from '../services/sampleData';
import { formatCurrency, formatCo2 } from '../utils/formatters';

interface OverviewPageProps {
  onRequireAuth: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onRequireAuth }) => {
  const navigate = useNavigate();
  const { idToken, isAuthenticated, isDemoMode, enableDemoMode, setPreservedInputs } = useAuth();
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
      showToast(err.message || 'Failed to plan trip. Please try again.', 'error');
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
    setLastPlannedParams(params);
    setPreservedInputs({
      origin: params.originDisplay,
      destination: params.destDisplay,
      priority: params.priority,
      parkingCost: params.parkingCost,
    });
    planTripMutation.mutate(params);
  };

  const handleReset = () => {
    setPlanResult(null);
  };

  const scrollToEngine = () => {
    const el = document.getElementById('planner-engine');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreSample = () => {
    enableDemoMode();
    showToast('Demo Mode enabled with sample NYC data.', 'info');
    scrollToEngine();
  };

  const getModeIcon = (mode: string) => {
    const m = mode.toLowerCase();
    if (m.includes('bike')) return <Bike className="w-4 h-4 text-emerald-400" />;
    if (m.includes('subway') || m.includes('train')) return <Train className="w-4 h-4 text-blue-400" />;
    if (m.includes('bus')) return <Bus className="w-4 h-4 text-amber-400" />;
    if (m.includes('walk')) return <Footprints className="w-4 h-4 text-cyan-400" />;
    return <Car className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <div className="space-y-8 sm:space-y-10 animate-fadeIn">
      {/* 1. Vercel-Style Hero Section */}
      <section className="pt-2 sm:pt-6 pb-2 text-center space-y-4 max-w-4xl mx-auto">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/80 text-xs font-mono text-zinc-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live NYC Transit & GBFS Feeds</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-100 leading-tight">
          Compare Every Way to Commute in NYC
        </h1>

        {/* Hero Subtitle */}
        <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Side-by-side time, cost, and carbon emissions for subway, bus, bike-share, and driving — powered by live Citi Bike dock availability.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <Button
            size="sm"
            onClick={scrollToEngine}
            className="h-9 px-4 text-xs sm:text-sm font-semibold bg-zinc-100 text-zinc-950 hover:bg-zinc-200 shadow-md"
          >
            <Compass className="w-4 h-4 mr-1.5" />
            <span>Compare Routes</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/stations')}
            className="h-9 px-4 text-xs sm:text-sm border-zinc-800 bg-zinc-900/90 text-zinc-200 hover:bg-zinc-800"
          >
            <Radio className="w-4 h-4 mr-1.5 text-emerald-400" />
            <span>Explore Stations</span>
          </Button>

          {!isAuthenticated && !isDemoMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExploreSample}
              className="h-9 px-3 text-xs text-zinc-400 hover:text-zinc-100"
            >
              <span>Instant Demo</span>
            </Button>
          )}
        </div>

        {/* Live Metrics Strip (4 Clean Stat Counters) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-4 border-t border-zinc-800/80 text-left">
          <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
            <span className="text-[11px] font-mono text-zinc-400 block">GBFS Stations</span>
            <span className="text-lg sm:text-xl md:text-2xl font-bold font-mono tabular-nums text-zinc-100 mt-0.5 block">
              {SAMPLE_SYSTEM_TELEMETRY.gbfs_stations_count.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
            <span className="text-[11px] font-mono text-zinc-400 block">Active Citi Bikes</span>
            <span className="text-lg sm:text-xl md:text-2xl font-bold font-mono tabular-nums text-zinc-100 mt-0.5 block">
              {SAMPLE_SYSTEM_TELEMETRY.active_bikes.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
            <span className="text-[11px] font-mono text-zinc-400 block">EPA Baseline</span>
            <span className="text-lg sm:text-xl md:text-2xl font-bold font-mono tabular-nums text-zinc-100 mt-0.5 block">
              400g / mi
            </span>
          </div>

          <div className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/60">
            <span className="text-[11px] font-mono text-zinc-400 block">Feed Latency</span>
            <span className="text-lg sm:text-xl md:text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-0.5 block">
              {SAMPLE_SYSTEM_TELEMETRY.sync_latency_ms} ms
            </span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Commute Comparison Engine */}
      <section id="planner-engine" className="space-y-6 pt-2">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
              Trip Comparison Engine
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Ranked multi-modal options with custom destination parking costs.
            </p>
          </div>

          {planResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
            >
              <RotateCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Modify Inputs</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Planning Form / Results View */}
          <div className="lg:col-span-2 space-y-4">
            {!planResult && !planTripMutation.isPending && (
              <PlanForm
                onPlanTrip={handlePlanTrip}
                isLoading={planTripMutation.isPending}
                onRequireAuth={onRequireAuth}
              />
            )}

            {/* Loading Skeleton */}
            {planTripMutation.isPending && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-100 rounded-full animate-spin" />
                    <span className="text-xs font-mono text-zinc-300">
                      Evaluating subway, bus, walking & live Citi Bike docks...
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

          {/* Sidebar: Carbon Budget & NYC Transit Benchmarks */}
          <div className="space-y-5">
            {/* Weekly Carbon Budget */}
            <Card className="border-zinc-800 bg-zinc-900/70">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                    Weekly Carbon Budget
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">68%</span>
                </div>
                <CardTitle className="text-2xl font-extrabold text-zinc-100 font-mono tabular-nums mt-1">
                  {SAMPLE_SYSTEM_TELEMETRY.weekly_carbon_achieved_kg} / {SAMPLE_SYSTEM_TELEMETRY.weekly_carbon_goal_kg} kg
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={68} className="h-2 bg-zinc-800" />
                <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Total Money Saved:</span>
                  <span className="text-sm font-bold font-mono text-zinc-100 tabular-nums">+$147.24</span>
                </div>
              </CardContent>
            </Card>

            {/* Mode Benchmarks Card */}
            <Card className="border-zinc-800 bg-zinc-900/70">
              <CardHeader className="pb-3 border-b border-zinc-800/60">
                <CardTitle className="text-sm font-bold text-zinc-200">
                  NYC Mode Benchmarks
                </CardTitle>
              </CardHeader>
              <div className="p-3 space-y-2">
                {SAMPLE_TRANSIT_BENCHMARKS.map((benchmark) => (
                  <div
                    key={benchmark.mode}
                    className="p-2 rounded-md bg-zinc-950/60 border border-zinc-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-xs text-zinc-200">
                          {benchmark.mode}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1 rounded ${
                            benchmark.sustainability_grade === 'A+' || benchmark.sustainability_grade === 'A'
                              ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                              : benchmark.sustainability_grade === 'F'
                              ? 'bg-rose-950/70 text-rose-400 border border-rose-800/50'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {benchmark.sustainability_grade}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                        {benchmark.avg_speed_kmh} km/h • {benchmark.base_fare}
                      </p>
                    </div>
                    <div className="text-right font-mono text-xs tabular-nums">
                      <span className={benchmark.co2_per_km_g === 0 ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                        {benchmark.co2_per_km_g} g
                      </span>
                      <span className="text-[10px] text-zinc-500 block">CO₂ / km</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Platform Capabilities Bento Grid */}
      <section className="space-y-4 pt-4 border-t border-zinc-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
            Designed for Smarter Urban Transit
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Transparent assumptions, live feeds, and quantified carbon reduction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-emerald-400 shrink-0">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-zinc-100">Live GBFS Feeds</h3>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                2,520 Citi Bike docks monitored with live electric and classic inventory.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-blue-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-zinc-100">Economic Arbitrage</h3>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Ranks out-of-pocket fares, destination parking, travel time, and social carbon cost.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200 shrink-0">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs sm:text-sm text-zinc-100">Carbon Ledger</h3>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                Log daily commutes and download verified emissions logs via 1-click CSV export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Recent Commute Deployments */}
      <section className="space-y-4 pt-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
              Recent Commute Runs
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Verified savings and carbon reduction logged by commuters.
            </p>
          </div>
          <Link to="/impact" className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/70 overflow-hidden">
          <div className="divide-y divide-zinc-800/60">
            {SAMPLE_SAVED_TRIPS.trips.map((trip) => (
              <div
                key={trip.trip_id}
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-zinc-950 border border-zinc-800 shrink-0">
                    {getModeIcon(trip.option_name)}
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-zinc-100">
                      {trip.option_name}
                    </span>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      {trip.origin} <span className="text-zinc-600">→</span> {trip.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5 text-xs font-mono tabular-nums">
                  <div className="text-right">
                    <span className="text-zinc-300 font-bold">{formatCurrency(trip.cost)}</span>
                    <span className="text-zinc-500 block text-[11px]">{trip.time_min} min</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">
                      +{formatCurrency(trip.cost_saved)}
                    </span>
                    <span className="text-zinc-400 block text-[11px]">
                      {formatCo2(trip.co2_saved_g)} saved
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
};
