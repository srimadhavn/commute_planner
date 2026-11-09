import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Compass,
  ArrowRight,
  Leaf,
  Clock,
  Radio,
  Server,
  Activity,
  ShieldCheck,
  Bike,
  Train,
  Bus,
  Footprints,
  Car,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
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
  const { idToken, isDemoMode, setPreservedInputs } = useAuth();
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

  const getModeIcon = (mode: string) => {
    const m = mode.toLowerCase();
    if (m.includes('bike')) return <Bike className="w-3.5 h-3.5 text-emerald-400" />;
    if (m.includes('subway') || m.includes('train')) return <Train className="w-3.5 h-3.5 text-blue-400" />;
    if (m.includes('bus')) return <Bus className="w-3.5 h-3.5 text-amber-400" />;
    if (m.includes('walk')) return <Footprints className="w-3.5 h-3.5 text-cyan-400" />;
    return <Car className="w-3.5 h-3.5 text-zinc-400" />;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Vercel-Style Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>commute-planner</span>
            <span>/</span>
            <span className="text-zinc-300">overview</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
              production
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-100">
            Commute Operations & Sustainability
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Real-time multi-modal transit comparison, Citi Bike GBFS telemetry, and emissions intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/stations')}
            className="h-8 text-xs border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
          >
            <Radio className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            <span>2,520 Live Docks</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              if (planResult) {
                setPlanResult(null);
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="h-8 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
          >
            <Compass className="w-3.5 h-3.5 mr-1.5" />
            <span>New Route</span>
          </Button>
        </div>
      </div>

      {/* Bento Grid Layer 1: Trip Comparison Engine & Carbon Target */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Plan / Results Engine */}
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

        {/* Carbon Target Progress Widget & Quick Status */}
        <div className="space-y-4">
          <Card className="border-zinc-800 bg-zinc-900/70 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  Weekly Carbon Budget
                </span>
                <span className="text-[11px] font-mono text-emerald-400">68% Achieved</span>
              </div>
              <CardTitle className="text-2xl font-extrabold text-zinc-100 font-mono tabular-nums mt-1">
                {SAMPLE_SYSTEM_TELEMETRY.weekly_carbon_achieved_kg} / {SAMPLE_SYSTEM_TELEMETRY.weekly_carbon_goal_kg} kg
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Personal emissions avoided compared to driving a standard passenger car.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={68} className="h-2 bg-zinc-800/80" />
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>Goal: 50.0 kg CO₂</span>
                <span>≈ {SAMPLE_SYSTEM_TELEMETRY.trees_planted_equivalent} trees planted</span>
              </div>
              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Total Money Saved:</span>
                <span className="text-sm font-bold font-mono text-zinc-200 tabular-nums">+$147.24</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Shortcuts Card */}
          <Card className="border-zinc-800 bg-zinc-900/70 p-4 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
              Quick Portals
            </span>
            <div className="space-y-2">
              <Link
                to="/stations"
                className="flex items-center justify-between p-2 rounded-md bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  Live Stations & Map
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
              <Link
                to="/impact"
                className="flex items-center justify-between p-2 rounded-md bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  Impact Analytics
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
              <Link
                to="/methodology"
                className="flex items-center justify-between p-2 rounded-md bg-zinc-950/60 border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Visible Assumptions
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Bento Grid Layer 2: Live System Telemetry */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-300 uppercase font-mono flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-zinc-400" />
            Infrastructure Telemetry & Health
          </h2>
          <span className="text-[11px] font-mono text-zinc-500">Auto-refreshing (60s)</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>GBFS Stations</span>
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-zinc-100 mt-2">
              {SAMPLE_SYSTEM_TELEMETRY.gbfs_stations_count.toLocaleString()}
            </p>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">NYC Citibike Network</p>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Bikes In Service</span>
              <Bike className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-zinc-100 mt-2">
              {SAMPLE_SYSTEM_TELEMETRY.active_bikes.toLocaleString()}
            </p>
            <p className="text-[11px] font-mono text-emerald-400 mt-1">
              {SAMPLE_SYSTEM_TELEMETRY.ebikes_share_percent}% E-bikes available
            </p>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>System Uptime</span>
              <Server className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-zinc-100 mt-2">
              {SAMPLE_SYSTEM_TELEMETRY.uptime_percent}%
            </p>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">API & Ingestion Service</p>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Feed Sync Latency</span>
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-zinc-100 mt-2">
              {SAMPLE_SYSTEM_TELEMETRY.sync_latency_ms} ms
            </p>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">
              Age: {SAMPLE_SYSTEM_TELEMETRY.last_sync_age_sec}s ago
            </p>
          </Card>
        </div>
      </div>

      {/* Bento Grid Layer 3: Recent Commute Deployments & Transit Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Commutes styled like Vercel Deployments */}
        <Card className="lg:col-span-2 border-zinc-800 bg-zinc-900/70">
          <CardHeader className="pb-3 border-b border-zinc-800/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-zinc-100">
                  Recent Commute Activity
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-0.5">
                  Logged trips with verified out-of-pocket savings and carbon reduction.
                </CardDescription>
              </div>
              <Link to="/impact" className="text-xs font-mono text-zinc-400 hover:text-zinc-200">
                View all →
              </Link>
            </div>
          </CardHeader>
          <div className="divide-y divide-zinc-800/60">
            {SAMPLE_SAVED_TRIPS.trips.map((trip) => (
              <div
                key={trip.trip_id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-800/30 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-zinc-950 border border-zinc-800 mt-0.5 shrink-0">
                    {getModeIcon(trip.option_name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-100">
                        {trip.option_name}
                      </span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        #{(trip.trip_id || '').slice(-6)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      {trip.origin} <span className="text-zinc-600">→</span> {trip.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono tabular-nums">
                  <div className="text-right">
                    <span className="text-zinc-300 font-bold">{formatCurrency(trip.cost)}</span>
                    <span className="text-zinc-500 block text-[11px]">{trip.time_min} min</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">
                      +{formatCurrency(trip.cost_saved)}
                    </span>
                    <span className="text-zinc-400 block text-[11px]">
                      {formatCo2(trip.co2_saved_g)} CO₂ saved
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Transit Mode Benchmark Comparison */}
        <Card className="border-zinc-800 bg-zinc-900/70">
          <CardHeader className="pb-3 border-b border-zinc-800/60">
            <CardTitle className="text-base font-bold text-zinc-100">
              Mode Benchmarks (NYC)
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-0.5">
              Speed, emissions and baseline fares across metropolitan options.
            </CardDescription>
          </CardHeader>
          <div className="p-4 space-y-3">
            {SAMPLE_TRANSIT_BENCHMARKS.map((benchmark) => (
              <div
                key={benchmark.mode}
                className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-zinc-200">
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
                  <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                    {benchmark.avg_speed_kmh} km/h • {benchmark.base_fare}
                  </p>
                </div>
                <div className="text-right font-mono text-xs tabular-nums">
                  <span className={benchmark.co2_per_km_g === 0 ? 'text-emerald-400' : 'text-zinc-300'}>
                    {benchmark.co2_per_km_g} g
                  </span>
                  <span className="text-[10px] text-zinc-500 block">CO₂ / km</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800/80">
        <Link
          to="/plan"
          className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all group"
        >
          <div className="flex items-center justify-between text-zinc-400 group-hover:text-zinc-100">
            <Compass className="w-5 h-5" />
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="font-bold text-sm text-zinc-100 mt-3">Route Comparison</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Evaluate Subway, Citi Bike, Bus and driving side-by-side with your parking costs.
          </p>
        </Link>

        <Link
          to="/stations"
          className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all group"
        >
          <div className="flex items-center justify-between text-zinc-400 group-hover:text-zinc-100">
            <Radio className="w-5 h-5 text-emerald-400" />
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="font-bold text-sm text-zinc-100 mt-3">Live Stations Grid</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Browse 2,520 real-time Citi Bike docks, e-bike inventories, and network map.
          </p>
        </Link>

        <Link
          to="/methodology"
          className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 transition-all group"
        >
          <div className="flex items-center justify-between text-zinc-400 group-hover:text-zinc-100">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
          <h3 className="font-bold text-sm text-zinc-100 mt-3">Methodology & Formulas</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Review US EPA carbon factors, transit wage indexing, and composite scoring rules.
          </p>
        </Link>
      </div>
    </div>
  );
};
