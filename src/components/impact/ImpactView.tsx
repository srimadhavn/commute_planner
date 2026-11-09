import React from 'react';
import {
  Leaf,
  DollarSign,
  Car,
  Compass,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { SavedTripsResponse } from '../../types/api';
import { formatCurrency, formatCo2, formatTime } from '../../utils/formatters';
import { SavingsChart } from './SavingsChart';
import { Badge } from '../common/Badge';

interface ImpactViewProps {
  impactData: SavedTripsResponse | null;
  isLoading: boolean;
  onNavigateToPlan: () => void;
  isDemoMode?: boolean;
}

export const ImpactView: React.FC<ImpactViewProps> = ({
  impactData,
  isLoading,
  onNavigateToPlan,
  isDemoMode = false,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }

  const totals = impactData?.totals || {
    trips: 0,
    co2_saved_g: 0,
    cost_saved: 0,
    car_km_avoided: 0,
  };

  const trips = impactData?.trips || [];

  if (trips.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
          <Leaf className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Start Tracking Your Impact
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          You haven't logged any commutes yet. Compare routes, pick sustainable alternatives like
          subways, buses, or bikes, and hit "Save Trip" to track emissions and money saved.
        </p>
        <button
          type="button"
          onClick={onNavigateToPlan}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-primary-600 hover:bg-primary-700 shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 min-h-touch"
        >
          <Compass className="w-4 h-4" />
          <span>Plan Your First Trip</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              My Environmental & Financial Impact
            </h2>
            {isDemoMode && <Badge variant="sample" />}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real emissions and dollars saved compared to driving a private car.
          </p>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Trips */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Saved Trips</span>
            <TrendingUp className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {totals.trips}
          </div>
          <span className="block text-[11px] text-slate-400 mt-1">Sustainable choices made</span>
        </div>

        {/* Metric 2: CO2 Saved */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">CO₂ Avoided</span>
            <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCo2(totals.co2_saved_g)}
          </div>
          <span className="block text-[11px] text-slate-400 mt-1">vs single-occupant car</span>
        </div>

        {/* Metric 3: Money Saved */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cost Saved</span>
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
            {formatCurrency(totals.cost_saved)}
          </div>
          <span className="block text-[11px] text-slate-400 mt-1">Gas, fares & parking saved</span>
        </div>

        {/* Metric 4: Car KM Avoided */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Car KM Avoided</span>
            <Car className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {totals.car_km_avoided.toFixed(1)} km
          </div>
          <span className="block text-[11px] text-slate-400 mt-1">Off congested roads</span>
        </div>
      </div>

      {/* Cumulative Chart Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <SavingsChart trips={trips} />
      </div>

      {/* Recent Trips Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Recent Commutes Logged
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing latest {trips.length} saved trips
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {trips.map((trip, idx) => (
            <div
              key={trip.trip_id || idx}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {trip.option_name}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(trip.trip_ts).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {trip.origin}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {trip.destination}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatTime(trip.time_min)}
                  </span>
                  <span>Cost: {formatCurrency(trip.cost)}</span>
                </div>
              </div>

              {/* Savings Pills */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +{formatCo2(trip.co2_saved_g)} avoided
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Saved {formatCurrency(trip.cost_saved)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sourced Methodology Footnote */}
      <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Strict Sourcing Standard:</strong> Calculations strictly adhere to US EPA national
          averages (~400 grams CO₂ per mile or ~250g/km for a standard passenger vehicle). We do not
          display unverified or speculative equivalencies.
        </div>
      </div>
    </div>
  );
};
