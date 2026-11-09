import React from 'react';
import {
  HelpCircle,
  Leaf,
  DollarSign,
  Clock,
  Bike,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface HowItWorksModalProps {
  onNavigateToPlan: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onNavigateToPlan }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs">
        <CardHeader className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-100 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-zinc-100">
                Methodology & Visible Assumptions
              </CardTitle>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Transparent calculations so you can independently evaluate and trust the numbers.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Assumptions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: CO2 Emissions */}
        <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <h3>Carbon Emissions (US EPA Averages)</h3>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Carbon emissions for private cars are modeled on <strong>US EPA national averages</strong>:
              approximately <strong>400 grams CO₂ per mile (~250 grams per kilometer)</strong> for an
              average passenger gasoline vehicle.
            </p>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Walk & Classic Bike:</strong> 0 g CO₂ emissions.
              </li>
              <li>
                <strong>Subway & Bus:</strong> Shared public transport per-passenger grid intensity averages.
              </li>
              <li>
                <strong>Citi Bike E-bikes:</strong> Minimal battery charging emissions.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Card 2: Parking & Costs */}
        <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <DollarSign className="w-4 h-4 text-zinc-300" />
              <h3>Destination Parking & Fare Costs</h3>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Driving cost includes fuel, vehicle wear, and destination parking. We provide an
              <strong> editable parking cost control defaulting to $10</strong> (typical urban parking),
              with a quick <strong>Free Parking ($0)</strong> toggle for commuters with free spots.
            </p>
            <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside">
              <li>
                <strong>Subway & Bus Fare:</strong> Standard $2.90 single-ride baseline.
              </li>
              <li>
                <strong>Bike-share:</strong> Single-ride unlocking and time rates.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Card 3: Live Bike Data */}
        <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <Bike className="w-4 h-4 text-emerald-400" />
              <h3>Live Citi Bike Availability</h3>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Bike options integrate real-time GBFS feeds from over <strong>2,500 active Citi Bike stations</strong> in
              the NYC pilot area. Stations display exact counts of classic bikes, e-bikes, and available docks so you
              never arrive to an empty station.
            </p>
            <div className="p-2.5 rounded-md bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400">
              Stations are monitored continuously via the <code>/health</code> endpoint with stale-data detection.
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Composite Score */}
        <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs">
          <CardHeader className="p-5 pb-3">
            <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
              <Clock className="w-4 h-4 text-zinc-300" />
              <h3>Composite Economic Score</h3>
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-3">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Options are ranked by a generalized economic score (in dollar equivalents):
            </p>
            <div className="p-2.5 rounded-md bg-zinc-950 border border-zinc-800 font-mono text-[11px] text-zinc-300">
              Score = Money + (Time × Wage Rate) + (CO₂ × Social Cost)
            </div>
            <p className="text-[11px] text-zinc-500">
              Selecting priority presets (Fastest, Cheapest, Greenest) alters these weights to match your preferences.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scope and Pilot Footnote */}
      <Card className="border-zinc-800 bg-zinc-900/80 shadow-xs">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-semibold text-zinc-100 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-300" />
            <span>Pilot Scope & Limitations</span>
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The current deployment operates as an NYC Metropolitan Area pilot, covering subway, bus, Citi Bike,
            commuter rail, and walking corridors. Turn-by-turn routing geometries are deliberately not fabricated;
            straight-line guides on the map are explicitly identified as approximate corridors.
          </p>

          <div className="pt-2">
            <Button
              onClick={onNavigateToPlan}
              className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold text-xs h-9"
            >
              <span>Ready to Plan a Trip</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
