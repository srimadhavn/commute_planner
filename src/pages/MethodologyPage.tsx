import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  DollarSign,
  Radio,
  Clock,
  Compass,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

export const MethodologyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Vercel Breadcrumbs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            Methodology & Visible Assumptions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Empirical standards, EPA emission factors, and composite cost formulas.
          </p>
        </div>

        <Button
          variant="default"
          size="sm"
          onClick={() => navigate('/plan')}
          className="h-8 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-zinc-200 self-start sm:self-center"
        >
          <Compass className="w-3.5 h-3.5 mr-1.5" />
          <span>Plan a Route</span>
        </Button>
      </div>

      {/* Grid of Documentation Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Carbon Standards */}
        <Card className="border-zinc-800 bg-zinc-900/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Carbon Emissions (US EPA Averages)
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              National passenger vehicle averages & electric grid intensity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-300 leading-relaxed font-sans">
            <p>
              Private vehicle emissions are modeled on standard <strong>US EPA national passenger car averages</strong>: approximately <strong>400 grams CO₂ per mile</strong> (~250 grams per kilometer) for light-duty gasoline passenger vehicles.
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-zinc-400 font-mono text-[11px]">
              <li>Walking & Classic Bicycle: 0 g CO₂ direct emissions</li>
              <li>Citi Bike E-bikes: 12 g CO₂/km (battery recharge intensity)</li>
              <li>NYC Subway & Rail: 75 g CO₂/pax-km (NYISO grid mix)</li>
              <li>MTA Bus: 95 g CO₂/pax-km (diesel-hybrid fleet average)</li>
            </ul>
          </CardContent>
        </Card>

        {/* Financial & Parking Assumptions */}
        <Card className="border-zinc-800 bg-zinc-900/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-zinc-200" />
              Destination Parking & Fare Costs
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Out-of-pocket trip expenses and fuel consumption models.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-300 leading-relaxed font-sans">
            <p>
              Driving expenses include vehicle depreciation, fuel costs, and user-configured destination parking. We provide an editable parking cost slider defaulting to <strong>$10</strong> (NYC urban average), with a one-click <strong>Free Parking ($0)</strong> toggle for commuters with free parking.
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-zinc-400 font-mono text-[11px]">
              <li>Subway & Bus Fare: $2.90 standard flat rate</li>
              <li>Citi Bike Single Ride: $4.79 unlock baseline</li>
              <li>Citi Bike E-Bike: $0.24 per minute per-ride surcharge</li>
            </ul>
          </CardContent>
        </Card>

        {/* Composite Economic Score */}
        <Card className="border-zinc-800 bg-zinc-900/70 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Composite Economic Scoring Equation
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Unified generalized cost function balancing financial expense, time value, and carbon social cost.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs sm:text-sm text-zinc-200 text-center overflow-x-auto">
              <code>Score ($) = Out-of-Pocket Cost + (Time × Hourly Wage Index) + (CO₂ × Social Cost of Carbon)</code>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              When evaluating multi-modal alternatives, raw minutes or raw dollars alone do not capture true commuter trade-offs. The Commute Planner indexes commuter travel time to standard median metropolitan wage rates ($27/hr) and prices carbon emissions according to the federal Social Cost of Carbon benchmark ($51/tonne). Priority presets (Fastest, Cheapest, Greenest, Balanced) adjust these relative weights.
            </p>
          </CardContent>
        </Card>

        {/* Real-time Feeds & Pilot Scope */}
        <Card className="border-zinc-800 bg-zinc-900/70 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              Live GBFS Integration & NYC Pilot Boundary
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Live bike-share data availability and strict integrity constraints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-zinc-300 leading-relaxed">
            <p>
              Citi Bike station information is ingested directly from General Bikeshare Feed Specification (GBFS) v2.3 feeds over <strong>2,520 stations</strong>. Feed health is monitored continuously via the <code>/health</code> endpoint. If the feed age exceeds thresholds, a prominent stale-data banner warns commuters that docks may reflect cached estimates.
            </p>
            <p className="text-zinc-400 text-[11px] font-mono border-l-2 border-zinc-700 pl-3">
              Strict Contract Integrity: The map corridor uses a straight dashed guide line rather than fabricating artificial turn-by-turn geometry not returned by the API routing server.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
