import { PlanTripResponse, SavedTripsResponse } from '../types/api';

/**
 * High-fidelity sample dataset strictly adhering to API contract.
 * Visibly labelled "Sample data" for development, offline review, and automated tests.
 */

export const SAMPLE_PLAN_RESPONSE: PlanTripResponse = {
  origin: {
    lat: 40.758,
    lon: -73.9855,
    label: 'Times Square, Manhattan, NY',
  },
  destination: {
    lat: 40.7527,
    lon: -73.9772,
    label: 'Grand Central Terminal, Manhattan, NY',
  },
  currency: {
    code: 'USD',
    symbol: '$',
  },
  trip_distance_km: 1.4,
  live_bike_data_used: true,
  options: [
    {
      id: 'option-subway-1',
      name: 'Subway (Shuttle/7 Train)',
      total_time_min: 12,
      total_distance_km: 1.5,
      total_cost: 2.9,
      total_co2_g: 110,
      data_quality: 'routed',
      composite_score: 6.85,
      cost_breakdown: {
        money: 2.9,
        time_value: 3.6,
        carbon_value: 0.35,
      },
      tags: ['best_overall', 'cheapest'],
      vs_car: {
        time_diff_min: -4,
        cost_savings: 8.18,
        co2_savings_g: 1900,
      },
      legs: [
        {
          mode: 'walk',
          distance_km: 0.2,
          duration_min: 3,
          source: 'routing',
        },
        {
          mode: 'subway',
          distance_km: 1.1,
          duration_min: 6,
          source: 'routing',
        },
        {
          mode: 'walk',
          distance_km: 0.2,
          duration_min: 3,
          source: 'routing',
        },
      ],
    },
    {
      id: 'option-bike-1',
      name: 'Citi Bike (Classic)',
      total_time_min: 9,
      total_distance_km: 1.4,
      total_cost: 4.79,
      total_co2_g: 0,
      data_quality: 'routed',
      composite_score: 7.49,
      cost_breakdown: {
        money: 4.79,
        time_value: 2.7,
        carbon_value: 0.0,
      },
      tags: ['fastest', 'greenest'],
      vs_car: {
        time_diff_min: -7,
        cost_savings: 6.29,
        co2_savings_g: 2010,
      },
      legs: [
        {
          mode: 'walk',
          distance_km: 0.1,
          duration_min: 1,
          source: 'routing',
        },
        {
          mode: 'bike_share',
          distance_km: 1.2,
          duration_min: 7,
          source: 'routing',
          station: {
            id: '64f0f28c-bedc-42d5-b107-ecdd48fc30cd',
            name: 'Broadway & W 48 St',
            bikes_available: 31,
            ebikes_available: 12,
          },
        },
        {
          mode: 'walk',
          distance_km: 0.1,
          duration_min: 1,
          source: 'routing',
        },
      ],
    },
    {
      id: 'option-walk-1',
      name: 'Walking',
      total_time_min: 18,
      total_distance_km: 1.3,
      total_cost: 0.0,
      total_co2_g: 0,
      data_quality: 'routed',
      composite_score: 5.4,
      cost_breakdown: {
        money: 0.0,
        time_value: 5.4,
        carbon_value: 0.0,
      },
      tags: ['greenest'],
      vs_car: {
        time_diff_min: 2,
        cost_savings: 11.08,
        co2_savings_g: 2010,
      },
      legs: [
        {
          mode: 'walk',
          distance_km: 1.3,
          duration_min: 18,
          source: 'routing',
        },
      ],
    },
    {
      id: 'option-bus-1',
      name: 'M42 Crosstown Bus',
      total_time_min: 16,
      total_distance_km: 1.5,
      total_cost: 2.9,
      total_co2_g: 140,
      data_quality: 'estimated',
      composite_score: 7.95,
      cost_breakdown: {
        money: 2.9,
        time_value: 4.8,
        carbon_value: 0.25,
      },
      tags: [],
      vs_car: {
        time_diff_min: 0,
        cost_savings: 8.18,
        co2_savings_g: 1870,
      },
      legs: [
        {
          mode: 'walk',
          distance_km: 0.1,
          duration_min: 2,
          source: 'routing',
        },
        {
          mode: 'bus',
          distance_km: 1.3,
          duration_min: 12,
          source: 'estimate',
        },
        {
          mode: 'walk',
          distance_km: 0.1,
          duration_min: 2,
          source: 'routing',
        },
      ],
    },
    {
      id: 'option-drive-1',
      name: 'Personal Car / Drive',
      total_time_min: 16,
      total_distance_km: 1.8,
      total_cost: 11.08,
      total_co2_g: 2010,
      data_quality: 'estimated',
      composite_score: 18.28,
      cost_breakdown: {
        money: 11.08,
        time_value: 4.8,
        carbon_value: 2.4,
      },
      tags: [],
      vs_car: {
        time_diff_min: 0,
        cost_savings: 0.0,
        co2_savings_g: 0,
      },
      legs: [
        {
          mode: 'drive',
          distance_km: 1.8,
          duration_min: 16,
          source: 'estimate',
        },
      ],
    },
  ],
};

export const SAMPLE_SAVED_TRIPS: SavedTripsResponse = {
  totals: {
    trips: 18,
    co2_saved_g: 34200, // 34.2 kg CO2 saved
    cost_saved: 147.24,
    car_km_avoided: 118.5,
  },
  trips: [
    {
      trip_id: 'sample-trip-1',
      trip_ts: '2026-11-09T08:30:00Z',
      option_name: 'Subway (Shuttle/7 Train)',
      origin: 'Times Square, Manhattan, NY',
      destination: 'Grand Central Terminal, Manhattan, NY',
      time_min: 12,
      cost: 2.9,
      co2_g: 110,
      co2_saved_g: 1900,
      cost_saved: 8.18,
      car_km_avoided: 1.8,
    },
    {
      trip_id: 'sample-trip-2',
      trip_ts: '2026-11-08T17:45:00Z',
      option_name: 'Citi Bike (Classic)',
      origin: 'Union Square, Manhattan, NY',
      destination: 'DUMBO, Brooklyn, NY',
      time_min: 22,
      cost: 4.79,
      co2_g: 0,
      co2_saved_g: 3800,
      cost_saved: 12.5,
      car_km_avoided: 5.2,
    },
    {
      trip_id: 'sample-trip-3',
      trip_ts: '2026-11-07T09:15:00Z',
      option_name: 'Subway + Walk',
      origin: 'Astoria, Queens, NY',
      destination: 'Bryant Park, Manhattan, NY',
      time_min: 28,
      cost: 2.9,
      co2_g: 320,
      co2_saved_g: 4200,
      cost_saved: 14.1,
      car_km_avoided: 8.1,
    },
    {
      trip_id: 'sample-trip-4',
      trip_ts: '2026-11-05T12:00:00Z',
      option_name: 'Walking',
      origin: 'Flatiron, Manhattan, NY',
      destination: 'Washington Square Park, NY',
      time_min: 15,
      cost: 0.0,
      co2_g: 0,
      co2_saved_g: 1600,
      cost_saved: 10.0,
      car_km_avoided: 1.6,
    },
    {
      trip_id: 'sample-trip-5',
      trip_ts: '2026-11-03T18:10:00Z',
      option_name: 'Citi Bike (E-bike)',
      origin: 'Williamsburg, Brooklyn, NY',
      destination: 'Lower East Side, Manhattan, NY',
      time_min: 14,
      cost: 5.2,
      co2_g: 30,
      co2_saved_g: 2700,
      cost_saved: 11.2,
      car_km_avoided: 3.5,
    },
  ],
};

export interface SystemTelemetry {
  gbfs_stations_count: number;
  active_bikes: number;
  ebikes_share_percent: number;
  uptime_percent: number;
  sync_latency_ms: number;
  feed_version: string;
  last_sync_age_sec: number;
  weekly_carbon_goal_kg: number;
  weekly_carbon_achieved_kg: number;
  trees_planted_equivalent: number;
}

export const SAMPLE_SYSTEM_TELEMETRY: SystemTelemetry = {
  gbfs_stations_count: 2520,
  active_bikes: 28410,
  ebikes_share_percent: 42,
  uptime_percent: 99.98,
  sync_latency_ms: 32,
  feed_version: 'GBFS v2.3',
  last_sync_age_sec: 18,
  weekly_carbon_goal_kg: 50.0,
  weekly_carbon_achieved_kg: 34.2,
  trees_planted_equivalent: 1.4,
};

export interface TransitBenchmark {
  mode: string;
  avg_speed_kmh: number;
  co2_per_km_g: number;
  base_fare: string;
  reliability_pct: number;
  sustainability_grade: 'A+' | 'A' | 'B+' | 'C' | 'F';
}

export const SAMPLE_TRANSIT_BENCHMARKS: TransitBenchmark[] = [
  {
    mode: 'Walking',
    avg_speed_kmh: 4.8,
    co2_per_km_g: 0,
    base_fare: '$0.00',
    reliability_pct: 99.9,
    sustainability_grade: 'A+',
  },
  {
    mode: 'Citi Bike (Classic)',
    avg_speed_kmh: 14.5,
    co2_per_km_g: 0,
    base_fare: '$4.79 / ride',
    reliability_pct: 96.5,
    sustainability_grade: 'A+',
  },
  {
    mode: 'Citi Bike (E-bike)',
    avg_speed_kmh: 19.2,
    co2_per_km_g: 12,
    base_fare: '$0.24 / min',
    reliability_pct: 94.8,
    sustainability_grade: 'A',
  },
  {
    mode: 'NYC Subway',
    avg_speed_kmh: 28.0,
    co2_per_km_g: 75,
    base_fare: '$2.90',
    reliability_pct: 91.2,
    sustainability_grade: 'A',
  },
  {
    mode: 'MTA Crosstown Bus',
    avg_speed_kmh: 11.2,
    co2_per_km_g: 95,
    base_fare: '$2.90',
    reliability_pct: 82.4,
    sustainability_grade: 'B+',
  },
  {
    mode: 'Personal Car / Drive',
    avg_speed_kmh: 15.0,
    co2_per_km_g: 250,
    base_fare: '$10+ parking + gas',
    reliability_pct: 71.0,
    sustainability_grade: 'F',
  },
];

export interface DetailedStation {
  station_id: string;
  name: string;
  cross_street: string;
  lat: number;
  lon: number;
  capacity: number;
  bikes_available: number;
  ebikes_available: number;
  docks_available: number;
  is_renting: boolean;
  status: 'optimal' | 'low_bikes' | 'empty' | 'full';
  neighborhood: string;
}

export const SAMPLE_DETAILED_STATIONS: DetailedStation[] = [
  {
    station_id: '64f0f28c',
    name: 'Broadway & W 48 St',
    cross_street: 'Broadway at 48th St',
    lat: 40.7601,
    lon: -73.9848,
    capacity: 103,
    bikes_available: 31,
    ebikes_available: 12,
    docks_available: 68,
    is_renting: true,
    status: 'optimal',
    neighborhood: 'Times Square / Midtown',
  },
  {
    station_id: '2104286',
    name: 'W 47 St & 6 Ave',
    cross_street: 'West 47th St at 6th Ave',
    lat: 40.7581,
    lon: -73.9819,
    capacity: 68,
    bikes_available: 2,
    ebikes_available: 1,
    docks_available: 65,
    is_renting: true,
    status: 'low_bikes',
    neighborhood: 'Rockefeller Center',
  },
  {
    station_id: '3104286',
    name: '8 Ave & W 45 St',
    cross_street: '8th Ave at 45th St',
    lat: 40.7592,
    lon: -73.9885,
    capacity: 50,
    bikes_available: 0,
    ebikes_available: 0,
    docks_available: 50,
    is_renting: true,
    status: 'empty',
    neighborhood: 'Hell’s Kitchen',
  },
  {
    station_id: '4104286',
    name: 'Grand Central / Vanderbilt Ave',
    cross_street: 'E 42 St & Vanderbilt Ave',
    lat: 40.7523,
    lon: -73.9778,
    capacity: 85,
    bikes_available: 44,
    ebikes_available: 19,
    docks_available: 40,
    is_renting: true,
    status: 'optimal',
    neighborhood: 'Grand Central',
  },
  {
    station_id: '5104286',
    name: 'Bryant Park / 6 Ave & W 42 St',
    cross_street: 'Avenue of the Americas at 42nd St',
    lat: 40.7544,
    lon: -73.9845,
    capacity: 72,
    bikes_available: 28,
    ebikes_available: 9,
    docks_available: 43,
    is_renting: true,
    status: 'optimal',
    neighborhood: 'Bryant Park',
  },
  {
    station_id: '6104286',
    name: 'Union Square East & E 15 St',
    cross_street: 'Union Square East at 15th St',
    lat: 40.7358,
    lon: -73.9898,
    capacity: 60,
    bikes_available: 37,
    ebikes_available: 14,
    docks_available: 22,
    is_renting: true,
    status: 'optimal',
    neighborhood: 'Union Square',
  },
  {
    station_id: '7104286',
    name: 'Washington Square Park S & Sullivan St',
    cross_street: 'Washington Square South at Sullivan',
    lat: 40.7301,
    lon: -73.9992,
    capacity: 45,
    bikes_available: 18,
    ebikes_available: 6,
    docks_available: 27,
    is_renting: true,
    status: 'optimal',
    neighborhood: 'Greenwich Village',
  },
  {
    station_id: '8104286',
    name: 'Old Fulton St & Water St (DUMBO)',
    cross_street: 'Old Fulton St at Water St',
    lat: 40.7028,
    lon: -73.9938,
    capacity: 55,
    bikes_available: 22,
    ebikes_available: 8,
    docks_available: 32,
    is_renting: true,
    status: 'optimal',
    neighborhood: 'DUMBO, Brooklyn',
  },
  {
    station_id: '9104286',
    name: 'Bedford Ave & N 7 St',
    cross_street: 'Bedford Ave at North 7th St',
    lat: 40.7183,
    lon: -73.9575,
    capacity: 48,
    bikes_available: 15,
    ebikes_available: 5,
    docks_available: 32,
    is_renting: true,
    status: 'optimal',
    neighborhood: 'Williamsburg, Brooklyn',
  },
  {
    station_id: '10104286',
    name: 'Central Park South & 6 Ave',
    cross_street: '59th St at 6th Ave',
    lat: 40.7659,
    lon: -73.9763,
    capacity: 65,
    bikes_available: 52,
    ebikes_available: 20,
    docks_available: 12,
    is_renting: true,
    status: 'optimal',
    neighborhood: 'Central Park South',
  },
];

