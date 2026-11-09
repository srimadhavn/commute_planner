import React, { useState, useEffect } from 'react';
import {
  MapPin,
  ArrowUpDown,
  Navigation,
  Sparkles,
  Zap,
  DollarSign,
  Leaf,
  Clock,
  Car,
  Search,
} from 'lucide-react';
import { PriorityType, LocationInput } from '../../types/api';
import { useUrlState } from '../../hooks/useUrlState';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface PlanFormProps {
  onPlanTrip: (params: {
    origin: LocationInput;
    destination: LocationInput;
    priority: PriorityType;
    parkingCost: number;
    originDisplay: string;
    destDisplay: string;
  }) => void;
  isLoading: boolean;
  savedRecentPlaces?: string[];
  onRequireAuth: () => void;
}

export const PlanForm: React.FC<PlanFormProps> = ({
  onPlanTrip,
  isLoading,
  savedRecentPlaces = ['Times Square, NY', 'Grand Central Terminal, NY', 'Brooklyn Bridge, NY'],
  onRequireAuth,
}) => {
  const { getParams, updateUrl } = useUrlState();
  const { showToast } = useToast();
  const { isAuthenticated, setPreservedInputs } = useAuth();

  const initialParams = getParams();
  const [origin, setOrigin] = useState(initialParams.from || 'Times Square');
  const [destination, setDestination] = useState(initialParams.to || 'Grand Central');
  const [priority, setPriority] = useState<PriorityType>(initialParams.priority || 'balanced');
  const [parkingCost, setParkingCost] = useState<number>(initialParams.parking);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [originCoordinates, setOriginCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  // Sync state changes with URL search query
  useEffect(() => {
    updateUrl({
      from: origin,
      to: destination,
      priority,
      parking: parkingCost,
    });
  }, [origin, destination, priority, parkingCost, updateUrl]);

  const handleSwap = () => {
    const tempOrigin = origin;
    setOrigin(destination);
    setDestination(tempOrigin);
    setOriginCoordinates(null); // Clear geolocation coordinates on swap
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setOriginCoordinates({ lat: latitude, lon: longitude });
        setOrigin(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        showToast('Obtained your current location.', 'success');
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Could not get location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please enter an address manually.';
        }
        showToast(msg, 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleRecentPlaceClick = (place: string, target: 'origin' | 'destination') => {
    if (target === 'origin') {
      setOrigin(place);
      setOriginCoordinates(null);
    } else {
      setDestination(place);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!origin.trim() || !destination.trim()) {
      showToast('Please specify both starting point and destination.', 'error');
      return;
    }

    if (!isAuthenticated) {
      // Preserve form values in AuthContext for after sign-in
      setPreservedInputs({
        origin,
        destination,
        priority,
        parkingCost,
      });
      onRequireAuth();
      return;
    }

    const originPayload: LocationInput = originCoordinates || origin.trim();
    const destinationPayload: LocationInput = destination.trim();

    onPlanTrip({
      origin: originPayload,
      destination: destinationPayload,
      priority,
      parkingCost,
      originDisplay: origin,
      destDisplay: destination,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 sm:p-7">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Origin and Destination with Swap */}
        <div className="space-y-3 relative">
          {/* Origin Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="plan-origin"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                From (Origin)
              </label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={isLocating}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 focus-visible:ring-2 focus-visible:ring-primary-500 rounded p-1 min-h-touch"
                aria-label="Use current GPS location"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'Use my location'}</span>
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <input
                id="plan-origin"
                type="text"
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  setOriginCoordinates(null);
                }}
                placeholder="e.g. Times Square, NY or 40.758, -73.985"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm min-h-touch"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1 relative z-10">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm focus-visible:ring-2 focus-visible:ring-primary-500 transition-transform active:scale-95 min-h-touch min-w-touch flex items-center justify-center"
              aria-label="Swap origin and destination"
              title="Swap origin and destination"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Input */}
          <div>
            <label
              htmlFor="plan-destination"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
            >
              To (Destination)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              </div>
              <input
                id="plan-destination"
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Grand Central Terminal, NY"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm min-h-touch"
              />
            </div>
          </div>
        </div>

        {/* Recent Places Chips */}
        {savedRecentPlaces && savedRecentPlaces.length > 0 && (
          <div>
            <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Recent places:
            </span>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Recent locations">
              {savedRecentPlaces.slice(0, 4).map((place) => (
                <button
                  key={place}
                  type="button"
                  onClick={() => handleRecentPlaceClick(place, 'destination')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus-visible:ring-2 focus-visible:ring-primary-500 min-h-touch flex items-center"
                >
                  {place}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Priority Segmented Control */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Trip Priority Preset
          </label>
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
            role="radiogroup"
            aria-label="Trip Priority"
          >
            {[
              { id: 'balanced', label: 'Balanced', icon: Sparkles },
              { id: 'fastest', label: 'Fastest', icon: Zap },
              { id: 'cheapest', label: 'Cheapest', icon: DollarSign },
              { id: 'greenest', label: 'Greenest', icon: Leaf },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={priority === id}
                onClick={() => setPriority(id as PriorityType)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-touch ${
                  priority === id
                    ? 'bg-white dark:bg-slate-900 text-primary-700 dark:text-primary-300 shadow-sm border border-slate-200 dark:border-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                } focus-visible:ring-2 focus-visible:ring-primary-500`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Parking Cost Control */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-slate-500" />
              <label
                htmlFor="parking-cost"
                className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200"
              >
                Your Destination Parking Cost
              </label>
            </div>
            <button
              type="button"
              onClick={() => setParkingCost(parkingCost === 0 ? 10 : 0)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md border min-h-touch flex items-center ${
                parkingCost === 0
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
              } focus-visible:ring-2 focus-visible:ring-primary-500`}
            >
              {parkingCost === 0 ? '✓ Free Parking ($0)' : 'Set Free Parking ($0)'}
            </button>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Drives direct cost comparison against driving. Defaults to NYC average ($10).
          </p>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={parkingCost}
              onChange={(e) => setParkingCost(Number(e.target.value))}
              aria-label="Parking cost slider"
              className="flex-1 accent-primary-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer min-h-touch"
            />
            <div className="relative w-24">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500 text-sm font-bold">
                $
              </span>
              <input
                id="parking-cost"
                type="number"
                min="0"
                max="100"
                value={parkingCost}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!isNaN(val)) setParkingCost(Math.min(Math.max(val, 0), 100));
                }}
                className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-right font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-touch"
              />
            </div>
          </div>
        </div>

        {/* Compare Commutes Primary Action */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-base text-white bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 transition-all shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 min-h-touch flex items-center justify-center gap-2.5"
        >
          {isLoading ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              <span>Comparing Transit, Bikes & Driving...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Compare Commutes</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
