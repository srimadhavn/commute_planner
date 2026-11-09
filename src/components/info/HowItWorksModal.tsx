import React from 'react';
import {
  HelpCircle,
  Leaf,
  DollarSign,
  Clock,
  Bike,
  ShieldCheck,
} from 'lucide-react';

interface HowItWorksModalProps {
  onNavigateToPlan: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onNavigateToPlan }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Methodology & Visible Assumptions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Transparent calculations so you can independently evaluate and trust the numbers.
            </p>
          </div>
        </div>
      </div>

      {/* Assumptions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: CO2 Emissions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
            <Leaf className="w-5 h-5" />
            <h3>Carbon Emissions (US EPA Averages)</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Carbon emissions for private cars are modeled on <strong>US EPA national averages</strong>:
            approximately <strong>400 grams CO₂ per mile (~250 grams per kilometer)</strong> for an
            average passenger gasoline vehicle.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
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
        </div>

        {/* Card 2: Parking & Costs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-base">
            <DollarSign className="w-5 h-5" />
            <h3>Destination Parking & Fare Costs</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Driving cost includes fuel, vehicle wear, and destination parking. We provide an
            <strong> editable parking cost control defaulting to $10</strong> (typical urban parking),
            with a quick <strong>Free Parking ($0)</strong> toggle for commuters with free employer or
            street spots.
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 list-disc list-inside">
            <li>
              <strong>Subway & Bus Fare:</strong> Standard $2.90 single-ride baseline.
            </li>
            <li>
              <strong>Bike-share:</strong> Single-ride unlocking and time rates.
            </li>
          </ul>
        </div>

        {/* Card 3: Live Bike Data */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-base">
            <Bike className="w-5 h-5" />
            <h3>Live Citi Bike Availability</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Bike options integrate real-time GBFS feeds from over <strong>2,500 active Citi Bike stations</strong> in
            the NYC pilot area. Stations display exact counts of classic bikes, e-bikes, and available docks so you
            never arrive to an empty station.
          </p>
          <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200">
            Stations are monitored continuously via the <code>/health</code> endpoint with stale-data detection.
          </div>
        </div>

        {/* Card 4: Composite Score */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
            <Clock className="w-5 h-5" />
            <h3>Composite Economic Score</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Options are ranked by a generalized economic score (in dollar equivalents):
          </p>
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200">
            Score = Money + (Time × Wage Rate) + (CO₂ × Social Cost)
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Selecting priority presets (Fastest, Cheapest, Greenest) alters these weights to match your personal preferences.
          </p>
        </div>
      </div>

      {/* Scope and Pilot Footnote */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pilot Scope & Limitations</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The current deployment operates as an NYC Metropolitan Area pilot, covering subway, bus, Citi Bike,
          commuter rail, and walking corridors. Turn-by-turn routing geometries are deliberately not fabricated;
          straight-line guides on the map are explicitly identified as approximate corridors.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={onNavigateToPlan}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-primary-600 hover:bg-primary-700 shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 min-h-touch"
          >
            <span>Ready to Plan a Trip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
