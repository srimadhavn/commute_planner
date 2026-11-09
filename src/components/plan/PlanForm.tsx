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
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { cn } from '../../lib/utils';

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
    setOriginCoordinates(null);
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
    <Card className="border-zinc-800 bg-zinc-900/70 shadow-lg">
      <CardContent className="p-5 sm:p-7 pt-5 sm:pt-7">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Origin and Destination with Swap */}
          <div className="space-y-3 relative">
            {/* Origin Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="plan-origin"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  From (Origin)
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100"
                  aria-label="Use current GPS location"
                >
                  <Navigation className={cn('w-3 h-3 mr-1', isLocating && 'animate-spin')} />
                  <span>{isLocating ? 'Locating...' : 'Use my location'}</span>
                </Button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <Input
                  id="plan-origin"
                  type="text"
                  value={origin}
                  onChange={(e) => {
                    setOrigin(e.target.value);
                    setOriginCoordinates(null);
                  }}
                  placeholder="e.g. Times Square, NY or 40.758, -73.985"
                  required
                  className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1 relative z-10">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSwap}
                className="h-8 w-8 rounded-full border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 shadow-sm"
                aria-label="Swap origin and destination"
                title="Swap origin and destination"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Destination Input */}
            <div>
              <label
                htmlFor="plan-destination"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5"
              >
                To (Destination)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <Input
                  id="plan-destination"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Grand Central Terminal, NY"
                  required
                  className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Recent Places Chips */}
          {savedRecentPlaces && savedRecentPlaces.length > 0 && (
            <div>
              <span className="block text-xs text-zinc-500 mb-1.5">Recent places:</span>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Recent locations">
                {savedRecentPlaces.slice(0, 4).map((place) => (
                  <Button
                    key={place}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRecentPlaceClick(place, 'destination')}
                    className="h-7 text-xs border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  >
                    {place}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Priority Segmented Control using shadcn Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Trip Priority Preset
            </label>
            <Tabs
              value={priority}
              onValueChange={(val) => setPriority(val as PriorityType)}
              className="w-full"
            >
              <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 bg-zinc-950 border border-zinc-800">
                <TabsTrigger value="balanced" className="flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Balanced</span>
                </TabsTrigger>
                <TabsTrigger value="fastest" className="flex items-center gap-1.5 text-xs">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fastest</span>
                </TabsTrigger>
                <TabsTrigger value="cheapest" className="flex items-center gap-1.5 text-xs">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Cheapest</span>
                </TabsTrigger>
                <TabsTrigger value="greenest" className="flex items-center gap-1.5 text-xs">
                  <Leaf className="w-3.5 h-3.5" />
                  <span>Greenest</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Parking Cost Control */}
          <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-zinc-400" />
                <label
                  htmlFor="parking-cost"
                  className="text-xs sm:text-sm font-medium text-zinc-200"
                >
                  Your Destination Parking Cost
                </label>
              </div>
              <Button
                type="button"
                variant={parkingCost === 0 ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setParkingCost(parkingCost === 0 ? 10 : 0)}
                className="h-7 text-xs border-zinc-700 font-medium"
              >
                {parkingCost === 0 ? '✓ Free Parking ($0)' : 'Free Parking ($0)'}
              </Button>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <Slider
                min={0}
                max={100}
                step={1}
                value={[parkingCost]}
                onValueChange={(vals) => setParkingCost(vals[0])}
                aria-label="Parking cost slider"
                className="flex-1"
              />
              <div className="relative w-24">
                <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-500 text-xs font-mono">
                  $
                </span>
                <Input
                  id="parking-cost"
                  type="number"
                  min="0"
                  max="100"
                  value={parkingCost}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val)) setParkingCost(Math.min(Math.max(val, 0), 100));
                  }}
                  className="h-8 pl-6 pr-2 text-right font-mono text-xs tabular-nums bg-zinc-900 border-zinc-800"
                />
              </div>
            </div>
          </div>

          {/* Compare Commutes Primary Action */}
          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold shadow-md"
          >
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                <span>Comparing Transit, Bikes & Driving...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                <span>Compare Commutes</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
