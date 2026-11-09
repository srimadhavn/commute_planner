import { test, expect } from '@playwright/test';
import { SAMPLE_PLAN_RESPONSE, SAMPLE_SAVED_TRIPS } from '../src/services/sampleData';

const API_BASE = 'https://xemud1f2ug.execute-api.us-east-1.amazonaws.com';
const COGNITO_URL = 'https://cognito-idp.us-east-1.amazonaws.com/';

test.describe('Commute Planner E2E Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Health Mock
    await page.route(`${API_BASE}/health`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          age_seconds: 14,
          station_count: 2520,
          stations_last_updated: new Date().toISOString(),
        }),
      });
    });

    // Stations Mock
    await page.route(`${API_BASE}/stations*`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          station_count: 3,
          stations: [
            {
              station_id: '64f0f28c',
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
          ],
        }),
      });
    });

    // Cognito Mock
    await page.route(COGNITO_URL, async (route) => {
      const headers = route.request().headers();
      const target = headers['x-amz-target'] || '';
      const body = JSON.parse(route.request().postData() || '{}');

      if (target.includes('InitiateAuth')) {
        if (body.AuthParameters?.USERNAME === 'challenge_user@test.com') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              ChallengeName: 'NEW_PASSWORD_REQUIRED',
              Session: 'sample-challenge-session-123',
              ChallengeParameters: {},
            }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            AuthenticationResult: {
              IdToken: 'valid-test-id-token',
              AccessToken: 'valid-test-access-token',
              RefreshToken: 'valid-test-refresh-token',
              ExpiresIn: 3600,
            },
          }),
        });
        return;
      }

      if (target.includes('RespondToAuthChallenge')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            AuthenticationResult: {
              IdToken: 'challenged-new-id-token',
              AccessToken: 'challenged-new-access-token',
              RefreshToken: 'challenged-new-refresh-token',
              ExpiresIn: 3600,
            },
          }),
        });
        return;
      }

      await route.fallback();
    });

    // Plan Trip Mock
    await page.route(`${API_BASE}/plan-trip`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SAMPLE_PLAN_RESPONSE),
      });
    });

    // Trips Mock
    await page.route(`${API_BASE}/trips`, async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, id: 'trip-e2e-1' }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SAMPLE_SAVED_TRIPS),
      });
    });
  });

  test('1. Stale Feed Banner displays when /health is stale or 503', async ({ page }) => {
    // Override /health to 503 stale
    await page.route(`${API_BASE}/health`, async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'stale',
          age_seconds: 450,
          station_count: 2520,
          stations_last_updated: '2026-11-09T08:00:00Z',
        }),
      });
    });

    await page.goto('/');
    const banner = page.getByRole('alert');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Warning: Bike-share live data feed is temporarily stale');
    await expect(page.getByRole('button', { name: /retry feed/i })).toBeVisible();
  });

  test('2. First-time password change challenge (NEW_PASSWORD_REQUIRED)', async ({ page }) => {
    await page.goto('/');

    // Click Header Sign In
    await page.getByRole('button', { name: /sign in/i }).first().click();
    const modal = page.getByRole('dialog');
    await expect(modal.getByRole('heading', { name: /sign in to commute planner/i })).toBeVisible();

    // Enter username that triggers password challenge
    await modal.getByLabel(/username or email/i).fill('challenge_user@test.com');
    await modal.getByLabel(/^password$/i).fill('InitialTempPass123!');
    await modal.locator('form button[type="submit"]').click();

    // Verify challenge screen appears
    await expect(modal.getByRole('heading', { name: /set new password/i })).toBeVisible();
    await expect(modal.getByText(/an administrator created your account/i)).toBeVisible();

    // Complete challenge
    await modal.getByLabel(/new password/i).first().fill('MyNewPermanentPass123!');
    await modal.getByLabel(/confirm new password/i).fill('MyNewPermanentPass123!');
    await modal.getByRole('button', { name: /set new password & continue/i }).click();

    // Should now be signed in
    await expect(page.getByRole('button', { name: /sign out/i }).first()).toBeVisible();
  });

  test('3. Plan trip, verify headline, re-sort chips, and save trip', async ({ page }) => {
    await page.goto('/');

    // Sign in via demo mode
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByRole('button', { name: /explore with sample data/i }).click();

    // Fill Plan Form
    await page.getByLabel(/from \(origin\)/i).fill('Times Square');
    await page.getByLabel(/to \(destination\)/i).fill('Grand Central');

    // Click Compare Commutes
    await page.getByRole('button', { name: /compare commutes/i }).click();

    // Wait for results
    await page.waitForSelector('article');

    // Results Headline Check
    await expect(page.getByText(/smart commute match/i)).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: /best for you/i })).toBeVisible();

    // Verify Re-sorting chips
    const fastestChip = page.getByRole('radio', { name: /fastest/i });
    await fastestChip.click();

    // Option cards re-sorted
    const firstOptionCard = page.locator('article').first();
    await expect(firstOptionCard).toContainText('Citi Bike');

    // Expand "Why this rank"
    const whyRankBtn = firstOptionCard.getByRole('button', { name: /why this rank\?/i });
    await whyRankBtn.click();
    await expect(firstOptionCard.getByText(/why this rank\? \(composite economic score\)/i)).toBeVisible();
    await expect(firstOptionCard.getByText(/money cost/i)).toBeVisible();

    // Save trip
    const saveBtn = firstOptionCard.getByRole('button', { name: /save/i });
    await saveBtn.click();
    await expect(firstOptionCard.getByRole('button', { name: /saved/i })).toBeVisible();
  });

  test('4. 401 Session Expiry preserves user inputs in re-sign-in modal', async ({ page }) => {
    // Mock 401 on plan-trip
    await page.route(`${API_BASE}/plan-trip`, async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'The incoming token has expired' }),
      });
    });

    await page.goto('/');

    // Sign in first
    await page.getByRole('button', { name: /sign in/i }).first().click();
    const modal = page.getByRole('dialog');
    await modal.getByLabel(/username or email/i).fill('regular_commuter@test.com');
    await modal.getByLabel(/^password$/i).fill('ValidPass123!');
    await modal.locator('form button[type="submit"]').click();

    // User types custom addresses
    await page.getByLabel(/from \(origin\)/i).fill('Battery Park');
    await page.getByLabel(/to \(destination\)/i).fill('Central Park West');

    // Trigger plan trip (which returns 401)
    await page.getByRole('button', { name: /compare commutes/i }).click();

    // Verify re-sign-in modal appears
    const expiryModal = page.getByRole('dialog');
    await expect(expiryModal.getByRole('heading', { name: /session expired/i })).toBeVisible();

    // Verify inputs were preserved!
    await expect(expiryModal.getByText(/trip inputs saved: battery park → central park west/i)).toBeVisible();
  });

  test('5. My Impact tab and How It Works tab', async ({ page }) => {
    await page.goto('/');

    // Switch to My Impact tab
    await page.getByRole('button', { name: /my impact/i }).first().click();
    await expect(page.getByText(/start tracking your impact/i)).toBeVisible();

    // Sign in with sample mode to see populated impact metrics
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.getByRole('button', { name: /explore with sample data/i }).click();

    await page.getByRole('button', { name: /my impact/i }).first().click();
    await expect(page.getByText('Saved Trips', { exact: true })).toBeVisible();
    await expect(page.getByText('CO₂ Avoided', { exact: true })).toBeVisible();
    await expect(page.getByText('Cost Saved', { exact: true })).toBeVisible();
    await expect(page.getByText('Car KM Avoided', { exact: true })).toBeVisible();

    // Switch to How It Works tab
    await page.getByRole('button', { name: /how it works/i }).first().click();
    await expect(page.getByRole('heading', { name: /methodology & visible assumptions/i })).toBeVisible();
    await expect(page.getByText(/carbon emissions \(us epa averages\)/i)).toBeVisible();
    await expect(page.getByText(/destination parking & fare costs/i)).toBeVisible();
  });
});
