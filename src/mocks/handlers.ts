import { http, HttpResponse } from 'msw';
import { SAMPLE_PLAN_RESPONSE, SAMPLE_SAVED_TRIPS } from '../services/sampleData';

const API_BASE = 'https://xemud1f2ug.execute-api.us-east-1.amazonaws.com';
const COGNITO_URL = 'https://cognito-idp.us-east-1.amazonaws.com/';

export const handlers = [
  // 1. GET /health
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({
      status: 'ok',
      age_seconds: 25,
      station_count: 2520,
      stations_last_updated: new Date().toISOString(),
    });
  }),

  // 2. GET /stations
  http.get(`${API_BASE}/stations`, () => {
    return HttpResponse.json({
      station_count: 3,
      stations: [
        {
          station_id: 'st-1',
          name: 'Broadway & W 48 St',
          lat: 40.7601,
          lon: -73.9848,
          capacity: 103,
          bikes_available: 31,
          ebikes_available: 12,
          docks_available: 68,
          is_renting: true,
          last_reported: Date.now(),
          distance_km: 0.14,
        },
        {
          station_id: 'st-2',
          name: 'W 47 St & 6 Ave',
          lat: 40.7581,
          lon: -73.9819,
          capacity: 68,
          bikes_available: 22,
          ebikes_available: 8,
          docks_available: 44,
          is_renting: true,
          last_reported: Date.now(),
          distance_km: 0.28,
        },
      ],
    });
  }),

  // 3. POST /plan-trip
  http.post(`${API_BASE}/plan-trip`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const body = (await request.json().catch(() => ({}))) as any;
    return HttpResponse.json({
      ...SAMPLE_PLAN_RESPONSE,
      origin: {
        ...SAMPLE_PLAN_RESPONSE.origin,
        label: typeof body.origin === 'string' ? body.origin : 'Current Location',
      },
      destination: {
        ...SAMPLE_PLAN_RESPONSE.destination,
        label: typeof body.destination === 'string' ? body.destination : 'Destination',
      },
    });
  }),

  // 4. POST /trips
  http.post(`${API_BASE}/trips`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({ success: true, id: 'trip-new-123' }, { status: 201 });
  }),

  // 5. GET /trips
  http.get(`${API_BASE}/trips`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json(SAMPLE_SAVED_TRIPS);
  }),

  // 6. Cognito InitiateAuth & RespondToAuthChallenge
  http.post(COGNITO_URL, async ({ request }) => {
    const target = request.headers.get('X-Amz-Target') || '';
    const body = (await request.json().catch(() => ({}))) as any;

    if (target.includes('InitiateAuth')) {
      if (body.AuthParameters?.USERNAME === 'newuser@example.com') {
        return HttpResponse.json({
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          Session: 'mock-session-xyz',
          ChallengeParameters: {},
        });
      }

      if (body.AuthParameters?.PASSWORD === 'WrongPass') {
        return HttpResponse.json(
          { __type: 'NotAuthorizedException', message: 'Incorrect username or password.' },
          { status: 400 }
        );
      }

      return HttpResponse.json({
        AuthenticationResult: {
          IdToken: 'mock-id-token-xyz',
          AccessToken: 'mock-access-token-xyz',
          RefreshToken: 'mock-refresh-token-xyz',
          ExpiresIn: 3600,
        },
      });
    }

    if (target.includes('RespondToAuthChallenge')) {
      return HttpResponse.json({
        AuthenticationResult: {
          IdToken: 'mock-new-id-token-xyz',
          AccessToken: 'mock-new-access-token-xyz',
          RefreshToken: 'mock-new-refresh-token-xyz',
          ExpiresIn: 3600,
        },
      });
    }

    return HttpResponse.json({ message: 'Invalid target' }, { status: 400 });
  }),
];
