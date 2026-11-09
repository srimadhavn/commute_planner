/**
 * Commute Planner API Type Definitions
 * Exact alignment with backend contract: do not change or invent fields.
 */

export interface HealthResponse {
  status: 'ok' | 'stale';
  age_seconds: number;
  station_count: number;
  stations_last_updated: string;
}

export interface Station {
  station_id: string;
  name: string;
  lat: number;
  lon: number;
  capacity: number;
  bikes_available: number;
  ebikes_available: number;
  docks_available: number;
  is_renting: boolean;
  last_reported: number | string;
  distance_km?: number;
}

export interface StationsResponse {
  station_count: number;
  stations: Station[];
  retrieved_at?: string;
}

export type PriorityType = 'balanced' | 'fastest' | 'cheapest' | 'greenest';

export type LocationInput = string | { lat: number; lon: number };

export interface ResolvedLocation {
  lat?: number;
  lon?: number;
  label: string;
}

export interface PlanTripRequest {
  origin: LocationInput;
  destination: LocationInput;
  parking_cost?: number; // 0-100
  priority?: PriorityType;
}

export interface CostBreakdown {
  money: number;
  time_value: number;
  carbon_value: number;
}

export interface VsCar {
  time_diff_min: number;
  cost_savings: number;
  co2_savings_g: number;
}

export interface StationSummary {
  id: string;
  name: string;
  bikes_available: number;
  ebikes_available: number;
}

export interface TripLeg {
  mode: 'walk' | 'subway' | 'bus' | 'commuter_rail' | 'bike_share' | 'drive' | string;
  distance_km: number;
  duration_min: number;
  source: 'routing' | 'estimate';
  station?: StationSummary;
}

export type OptionTag = 'best_overall' | 'fastest' | 'cheapest' | 'greenest' | string;

export interface TripOption {
  id: string;
  name: string;
  total_time_min: number;
  total_distance_km: number;
  total_cost: number;
  total_co2_g: number;
  data_quality: 'routed' | 'estimated';
  composite_score: number; // lower = better (in dollar equivalent)
  cost_breakdown: CostBreakdown;
  tags: OptionTag[];
  vs_car?: VsCar;
  legs: TripLeg[];
}

export interface PlanTripResponse {
  origin: ResolvedLocation;
  destination: ResolvedLocation;
  currency: {
    code: string;
    symbol: string;
  };
  trip_distance_km: number;
  live_bike_data_used: boolean;
  options: TripOption[];
}

export interface SaveTripRequest {
  option_id: string;
  origin: string;
  destination: string;
  time_min: number;
  cost: number;
  co2_g: number;
  co2_saved_g: number;
  cost_saved: number;
}

export interface SavedTripItem {
  trip_id?: string;
  trip_ts: string;
  option_name: string;
  origin: string;
  destination: string;
  time_min: number;
  cost: number;
  co2_g: number;
  co2_saved_g: number;
  cost_saved: number;
  car_km_avoided?: number;
}

export interface TripTotals {
  trips: number;
  co2_saved_g: number;
  cost_saved: number;
  car_km_avoided: number;
}

export interface SavedTripsResponse {
  totals: TripTotals;
  trips: SavedTripItem[];
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  __type?: string;
}
