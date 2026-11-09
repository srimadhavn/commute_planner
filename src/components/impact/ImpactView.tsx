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
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

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
              className="h-28 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse"
            />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse" />
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
      <Card className="max-w-lg mx-auto text-center border-zinc-800 bg-zinc-900/80 shadow-sm p-6 sm:p-10">
        <CardContent className="space-y-4 p-0">
          <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 flex items-center justify-center mx-auto">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-zinc-100">
            Start Tracking Your Impact
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            You haven't logged any commutes yet. Compare routes, pick sustainable alternatives like
            subways, buses, or bikes, and hit "Save Trip" to track emissions and money saved.
          </p>
          <div className="pt-2">
            <Button
              onClick={onNavigateToPlan}
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold"
            >
              <Compass className="w-4 h-4 mr-2" />
              <span>Plan Your First Trip</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
              My Environmental & Financial Impact
            </h2>
            {isDemoMode && <Badge variant="sample" />}
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
            Real emissions and dollars saved compared to driving a private car.
          </p>
        </div>
      </div>

      {/* 4 Stat Metric Cards (Executive Dark Styling) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Trips */}
        <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Saved Trips</span>
              <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tabular-nums">
              {totals.trips}
            </div>
            <span className="block text-[11px] text-zinc-500 mt-1">Sustainable choices made</span>
          </CardContent>
        </Card>

        {/* Metric 2: CO2 Saved */}
        <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">CO₂ Avoided</span>
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tabular-nums">
              {formatCo2(totals.co2_saved_g)}
            </div>
            <span className="block text-[11px] text-zinc-500 mt-1">vs passenger car</span>
          </CardContent>
        </Card>

        {/* Metric 3: Money Saved */}
        <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Cost Saved</span>
              <DollarSign className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tabular-nums">
              {formatCurrency(totals.cost_saved)}
            </div>
            <span className="block text-[11px] text-zinc-500 mt-1">Gas, fares & parking saved</span>
          </CardContent>
        </Card>

        {/* Metric 4: Car KM Avoided */}
        <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Car KM Avoided</span>
              <Car className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono tabular-nums">
              {totals.car_km_avoided.toFixed(1)} km
            </div>
            <span className="block text-[11px] text-zinc-500 mt-1">Off congested roads</span>
          </CardContent>
        </Card>
      </div>

      {/* Cumulative Chart Card */}
      <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs">
        <CardContent className="p-5 sm:p-6">
          <SavingsChart trips={trips} />
        </CardContent>
      </Card>

      {/* Recent Trips Table using shadcn Table */}
      <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs overflow-hidden">
        <CardHeader className="p-4 sm:p-5 border-b border-zinc-800">
          <CardTitle className="text-base font-bold text-zinc-100">
            Recent Commutes Logged
          </CardTitle>
          <p className="text-xs text-zinc-500 mt-0.5">
            Showing latest {trips.length} saved trips
          </p>
        </CardHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mode & Date</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Time & Cost</TableHead>
              <TableHead className="text-right">Savings</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip, idx) => (
              <TableRow key={trip.trip_id || idx}>
                <TableCell className="font-medium">
                  <div className="font-semibold text-zinc-100 text-xs sm:text-sm">
                    {trip.option_name}
                  </div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5 font-mono">
                    <Calendar className="w-3 h-3" />
                    {new Date(trip.trip_ts).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs text-zinc-300 flex items-center gap-1.5">
                    <span>{trip.origin}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0" />
                    <span>{trip.destination}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs tabular-nums text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    <span>{formatTime(trip.time_min)}</span>
                  </div>
                  <div className="text-zinc-500 text-[11px]">
                    Cost: {formatCurrency(trip.cost)}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular-nums">
                  <div className="font-bold text-zinc-100">
                    +{formatCo2(trip.co2_saved_g)}
                  </div>
                  <div className="text-zinc-400 text-[11px]">
                    Saved {formatCurrency(trip.cost_saved)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Sourced Methodology Footnote */}
      <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
        <div className="leading-relaxed text-[11px]">
          <strong className="text-zinc-200">Strict Sourcing Standard:</strong> Calculations strictly adhere to US EPA national
          averages (~400 grams CO₂ per mile or ~250g/km for a standard passenger vehicle). We do not
          display unverified or speculative equivalencies.
        </div>
      </div>
    </div>
  );
};
