/**
 * Commute Planner API Client
 * Interacts with AWS API Gateway backend
 */

import {
  HealthResponse,
  StationsResponse,
  PlanTripRequest,
  PlanTripResponse,
  SaveTripRequest,
  SavedTripsResponse,
} from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://xemud1f2ug.execute-api.us-east-1.amazonaws.com';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Global 401 callback listener for triggering re-sign-in modal
type UnauthorizedHandler = () => void;
const unauthorizedHandlers: Set<UnauthorizedHandler> = new Set();

export function onUnauthorized(handler: UnauthorizedHandler): () => void {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
}

function notifyUnauthorized() {
  unauthorizedHandlers.forEach((handler) => {
    try {
      handler();
    } catch (e) {
      console.error('Error in 401 handler', e);
    }
  });
}

/**
 * Common fetch helper with error parsing and 401 interception.
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    notifyUnauthorized();
    const data = await response.json().catch(() => ({}));
    throw new ApiError(401, data.message || 'Session expired or unauthorized. Please re-sign in.', data);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new ApiError(response.status, errorMsg, data);
  }

  return data as T;
}

/**
 * GET /health (public)
 */
export async function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health');
}

/**
 * GET /stations (public)
 */
export async function getStations(params?: {
  lat?: number;
  lon?: number;
  radius_km?: number;
  limit?: number;
}): Promise<StationsResponse> {
  const query = new URLSearchParams();
  if (params?.lat !== undefined) query.set('lat', params.lat.toString());
  if (params?.lon !== undefined) query.set('lon', params.lon.toString());
  if (params?.radius_km !== undefined) query.set('radius_km', params.radius_km.toString());
  if (params?.limit !== undefined) query.set('limit', params.limit.toString());

  const queryString = query.toString();
  const endpoint = queryString ? `/stations?${queryString}` : '/stations';
  return request<StationsResponse>(endpoint);
}

/**
 * POST /plan-trip (auth)
 */
export async function planTrip(payload: PlanTripRequest, idToken: string): Promise<PlanTripResponse> {
  return request<PlanTripResponse>('/plan-trip', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * POST /trips (auth)
 */
export async function saveTrip(payload: SaveTripRequest, idToken: string): Promise<{ success: boolean; id?: string }> {
  return request<{ success: boolean; id?: string }>('/trips', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * GET /trips (auth)
 */
export async function getTrips(idToken: string): Promise<SavedTripsResponse> {
  return request<SavedTripsResponse>('/trips', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
}
