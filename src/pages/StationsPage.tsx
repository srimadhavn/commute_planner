import React, { useState, useMemo } from 'react';
import {
  Search,
  Bike,
  Zap,
  MapPin,
  Navigation,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { SAMPLE_DETAILED_STATIONS } from '../services/sampleData';
import { TripMap } from '../components/map/TripMap';

export const StationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'has_bikes' | 'has_ebikes' | 'has_docks'>('all');

  const filteredStations = useMemo(() => {
    return SAMPLE_DETAILED_STATIONS.filter((station) => {
      const matchesSearch =
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.cross_street.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'has_bikes') return station.bikes_available > 0;
      if (filterType === 'has_ebikes') return station.ebikes_available > 0;
      if (filterType === 'has_docks') return station.docks_available > 0;
      return true;
    });
  }, [searchQuery, filterType]);

  const totalBikes = SAMPLE_DETAILED_STATIONS.reduce((acc, s) => acc + s.bikes_available, 0);
  const totalEbikes = SAMPLE_DETAILED_STATIONS.reduce((acc, s) => acc + s.ebikes_available, 0);
  const totalDocks = SAMPLE_DETAILED_STATIONS.reduce((acc, s) => acc + s.docks_available, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Vercel Breadcrumbs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>commute-planner</span>
            <span>/</span>
            <span className="text-zinc-300">stations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            Live Citi Bike Stations & Availability Grid
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time dock capacity, electric fleet distribution, and turn-around metrics across the pilot network.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
            GBFS Feed v2.3
          </span>
        </div>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-xs font-mono text-zinc-400">Pilot Stations</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 mt-1">
            {SAMPLE_DETAILED_STATIONS.length} Active
          </p>
          <span className="text-[11px] font-mono text-emerald-400">100% operational</span>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-xs font-mono text-zinc-400">Classic Bikes</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 mt-1">
            {totalBikes - totalEbikes}
          </p>
          <span className="text-[11px] font-mono text-zinc-400">Pedal drive</span>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-xs font-mono text-zinc-400">E-Bikes</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">
            {totalEbikes}
          </p>
          <span className="text-[11px] font-mono text-zinc-400">Assist ready</span>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60 p-4">
          <span className="text-xs font-mono text-zinc-400">Open Docks</span>
          <p className="text-xl sm:text-2xl font-bold font-mono text-zinc-100 mt-1">
            {totalDocks}
          </p>
          <span className="text-[11px] font-mono text-zinc-400">Return capacity</span>
        </Card>
      </div>

      {/* Map Section */}
      <Card className="border-zinc-800 bg-zinc-900/70 overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-800/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              Pilot Geographic Coverage
            </CardTitle>
            <span className="text-xs font-mono text-zinc-500">Dark OpenStreetMap Layer</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[360px] relative">
          <TripMap
            origin={{ lat: 40.758, lon: -73.9855, label: 'Times Square' }}
            destination={{ lat: 40.7527, lon: -73.9772, label: 'Grand Central' }}
          />
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by station name, avenue, or neighborhood..."
            className="pl-9 h-9 text-xs font-mono bg-zinc-900 border-zinc-800"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterType('all')}
            className={`h-8 text-xs font-medium border-zinc-800 ${
              filterType === 'all' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            All Stations
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterType('has_bikes')}
            className={`h-8 text-xs font-medium border-zinc-800 ${
              filterType === 'has_bikes' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <Bike className="w-3.5 h-3.5 mr-1" />
            Bikes Available
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterType('has_ebikes')}
            className={`h-8 text-xs font-medium border-zinc-800 ${
              filterType === 'has_ebikes' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5 mr-1 text-emerald-400" />
            E-Bikes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterType('has_docks')}
            className={`h-8 text-xs font-medium border-zinc-800 ${
              filterType === 'has_docks' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            Open Docks
          </Button>
        </div>
      </div>

      {/* High-Density Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStations.map((station) => {
          const occupancyPct = Math.round((station.bikes_available / station.capacity) * 100);
          return (
            <Card
              key={station.station_id}
              className="border-zinc-800 bg-zinc-900/70 hover:border-zinc-700 transition-all"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-bold text-zinc-100">
                      {station.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-0.5 font-mono">
                      {station.neighborhood}
                    </CardDescription>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                      station.status === 'optimal'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : station.status === 'low_bikes'
                        ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                    }`}
                  >
                    {station.status === 'optimal'
                      ? 'Optimal'
                      : station.status === 'low_bikes'
                      ? 'Low Bikes'
                      : 'Empty'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-3">
                <p className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span>{station.cross_street}</span>
                </p>

                {/* Utilization Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>Dock Utilization</span>
                    <span className="tabular-nums">{occupancyPct}% full</span>
                  </div>
                  <Progress value={occupancyPct} className="h-1.5 bg-zinc-800/80" />
                </div>

                {/* Breakdown Counters */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-center font-mono">
                  <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 uppercase block">Total</span>
                    <span className="text-sm font-bold text-zinc-200 tabular-nums">
                      {station.bikes_available}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
                    <span className="text-[10px] text-emerald-400 uppercase block">E-Bikes</span>
                    <span className="text-sm font-bold text-emerald-400 tabular-nums">
                      {station.ebikes_available}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 uppercase block">Docks</span>
                    <span className="text-sm font-bold text-zinc-300 tabular-nums">
                      {station.docks_available}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
