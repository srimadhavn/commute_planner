import { test } from '@playwright/test';
import { SAMPLE_PLAN_RESPONSE, SAMPLE_SAVED_TRIPS } from '../src/services/sampleData';
import fs from 'fs';
import path from 'path';

const API_BASE = 'https://xemud1f2ug.execute-api.us-east-1.amazonaws.com';

test.describe('Screenshots Capture Suite', () => {
  test.beforeAll(async () => {
    const screenshotDir = path.resolve('screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
  });

  test.beforeEach(async ({ page }) => {
    // Health Mock
    await page.route(`${API_BASE}/health`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          age_seconds: 18,
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
          station_count: 5,
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
            {
              station_id: '2104286',
              name: 'W 47 St & 6 Ave',
              lat: 40.7581,
              lon: -73.9819,
              capacity: 68,
              bikes_available: 2,
              ebikes_available: 1,
              docks_available: 65,
              is_renting: true,
              last_reported: Date.now(),
              distance_km: 0.28,
            },
            {
              station_id: '3104286',
              name: '8 Ave & W 45 St',
              lat: 40.7592,
              lon: -73.9885,
              capacity: 50,
              bikes_available: 0,
              ebikes_available: 0,
              docks_available: 50,
              is_renting: true,
              last_reported: Date.now(),
              distance_km: 0.35,
            },
          ],
        }),
      });
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
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(SAMPLE_SAVED_TRIPS),
      });
    });
  });

  test('Capture every screen at viewport', async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes('mobile');
    const prefix = isMobile ? 'mobile' : 'desktop';

    // Screen 1: Plan Screen
    await page.goto('/');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `screenshots/${prefix}-01-plan.png`, fullPage: true });

    // Screen 2: Sign-in Modal
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `screenshots/${prefix}-02-signin.png`, fullPage: true });

    // Switch to Demo Mode for full authenticated data
    await page.getByRole('button', { name: /explore with sample data/i }).click();
    await page.waitForTimeout(400);

    // Screen 3: Results View
    await page.getByRole('button', { name: /compare commutes/i }).click();
    await page.waitForSelector('article');
    // Open "Why this rank" on first card for rich detail
    const whyRankBtn = page.locator('article').first().getByRole('button', { name: /why this rank\?/i });
    await whyRankBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `screenshots/${prefix}-03-results.png`, fullPage: true });

    // Screen 4: Map & Stations
    const mapToggleBtn = page.getByRole('button', { name: /map & stations/i });
    await mapToggleBtn.click();
    await page.waitForTimeout(1000); // allow leaflet tiles to position
    await page.screenshot({ path: `screenshots/${prefix}-04-map.png`, fullPage: true });

    // Screen 5: My Impact
    const impactNav = page.getByRole('button', { name: /my impact/i }).first();
    await impactNav.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `screenshots/${prefix}-05-my-impact.png`, fullPage: true });

    // Screen 6: How It Works & Assumptions
    const howNav = page.getByRole('button', { name: /how it works/i }).first();
    await howNav.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `screenshots/${prefix}-06-how-it-works.png`, fullPage: true });

    // Screen 7: Stale Feed Warning Banner
    await page.route(`${API_BASE}/health`, async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'stale',
          age_seconds: 520,
          station_count: 2520,
          stations_last_updated: '2026-11-09T08:00:00Z',
        }),
      });
    });
    // Trigger health re-query or refresh
    await page.goto('/');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `screenshots/${prefix}-07-stale-banner.png`, fullPage: true });
  });
});
