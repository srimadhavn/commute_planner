import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PlanForm } from '../components/plan/PlanForm';
import { OptionCard } from '../components/results/OptionCard';
import { ResultsView } from '../components/results/ResultsView';
import { WeatherCard } from '../components/weather/WeatherCard';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import { MemoryRouter } from 'react-router-dom';
import { SAMPLE_PLAN_RESPONSE } from '../services/sampleData';
import { OpenMeteoForecastResponse } from '../types/weather';
import { parseOpenMeteoResponse } from '../utils/weather';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retryDelay: 0,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement, queryClient = createTestQueryClient()) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>{ui}</ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('PlanForm Component', () => {
  it('renders From and To inputs with default values', () => {
    const handlePlan = vi.fn();
    renderWithProviders(
      <PlanForm
        onPlanTrip={handlePlan}
        isLoading={false}
        onRequireAuth={vi.fn()}
      />
    );

    expect(screen.getByLabelText(/from \(origin\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to \(destination\)/i)).toBeInTheDocument();
  });

  it('swaps origin and destination when swap button is clicked', () => {
    const handlePlan = vi.fn();
    renderWithProviders(
      <PlanForm
        onPlanTrip={handlePlan}
        isLoading={false}
        onRequireAuth={vi.fn()}
      />
    );

    const originInput = screen.getByLabelText(/from \(origin\)/i) as HTMLInputElement;
    const destInput = screen.getByLabelText(/to \(destination\)/i) as HTMLInputElement;
    const swapButton = screen.getByLabelText(/swap origin and destination/i);

    fireEvent.change(originInput, { target: { value: 'Central Park' } });
    fireEvent.change(destInput, { target: { value: 'Wall Street' } });

    fireEvent.click(swapButton);

    expect(originInput.value).toBe('Wall Street');
    expect(destInput.value).toBe('Central Park');
  });

  it('toggles free parking when free parking button is clicked', () => {
    renderWithProviders(
      <PlanForm
        onPlanTrip={vi.fn()}
        isLoading={false}
        onRequireAuth={vi.fn()}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /free parking/i });
    fireEvent.click(toggleButton);

    const parkingInput = screen.getByLabelText(/your destination parking cost/i) as HTMLInputElement;
    expect(parkingInput.value).toBe('0');
  });
});

describe('OptionCard Component', () => {
  const option = SAMPLE_PLAN_RESPONSE.options[0]; // Subway
  const extremes = { maxTime: 20, maxCost: 15, maxCo2: 2500 };

  it('renders option name, time, cost, and CO2', () => {
    renderWithProviders(
      <OptionCard
        option={option}
        rankIndex={0}
        extremes={extremes}
        onSaveTrip={vi.fn().mockResolvedValue(true)}
      />
    );

    expect(screen.getByText(option.name)).toBeInTheDocument();
    expect(screen.getByText('$2.90')).toBeInTheDocument();
    expect(screen.getByText('12 min')).toBeInTheDocument();
    expect(screen.getByText('110 g CO₂')).toBeInTheDocument();
  });

  it('expands why this rank section upon clicking', () => {
    renderWithProviders(
      <OptionCard
        option={option}
        rankIndex={0}
        extremes={extremes}
        onSaveTrip={vi.fn().mockResolvedValue(true)}
      />
    );

    const whyButton = screen.getByRole('button', { name: /why this rank\?/i });
    fireEvent.click(whyButton);

    expect(screen.getByText(/why this rank\? \(composite economic score\)/i)).toBeInTheDocument();
    expect(screen.getByText(/money cost/i)).toBeInTheDocument();
    expect(screen.getByText(/time value/i)).toBeInTheDocument();
  });
});

const buildOpenMeteoPayload = (overrides?: {
  lat?: number;
  lon?: number;
  temp?: number;
  feelsLike?: number;
  humidity?: number;
  precip?: number;
  rain?: number;
  code?: number;
  wind?: number;
  hourlyPrecip?: number[];
  hourlyProb?: number[];
  hourlyCodes?: number[];
}): OpenMeteoForecastResponse => ({
  latitude: overrides?.lat ?? 40.76,
  longitude: overrides?.lon ?? -73.98,
  timezone: 'America/New_York',
  timezone_abbreviation: 'GMT-5',
  current: {
    time: '2026-11-10T10:00',
    interval: 900,
    temperature_2m: overrides?.temp ?? 14.5,
    relative_humidity_2m: overrides?.humidity ?? 58,
    apparent_temperature: overrides?.feelsLike ?? 13.1,
    precipitation: overrides?.precip ?? 0.0,
    rain: overrides?.rain ?? 0.0,
    weather_code: overrides?.code ?? 0,
    wind_speed_10m: overrides?.wind ?? 9.4,
  },
  hourly: {
    time: [
      '2026-11-10T10:00',
      '2026-11-10T11:00',
      '2026-11-10T12:00',
      '2026-11-10T13:00',
    ],
    precipitation: overrides?.hourlyPrecip ?? [0.0, 0.0, 0.0, 0.0],
    precipitation_probability: overrides?.hourlyProb ?? [0, 5, 10, 5],
    weather_code: overrides?.hourlyCodes ?? [0, 1, 2, 2],
  },
});

describe('WeatherCard Component', () => {
  it('renders loading skeleton while fetching', () => {
    renderWithProviders(
      <WeatherCard
        roleLabel="Origin"
        locationLabel="Times Square, NY"
        isLoading={true}
      />
    );

    expect(screen.getByLabelText(/loading weather for times square, ny/i)).toBeInTheDocument();
  });

  it('renders unavailable message when weather fetch fails', () => {
    renderWithProviders(
      <WeatherCard
        roleLabel="Destination"
        locationLabel="Grand Central Terminal, NY"
        isError={true}
      />
    );

    expect(screen.getByText(/weather temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/grand central terminal, ny/i)).toBeInTheDocument();
  });

  it('displays temperature, feels-like, condition, humidity, precipitation, wind, and attribution', () => {
    const weather = parseOpenMeteoResponse(
      buildOpenMeteoPayload({
        temp: 7.9,
        feelsLike: 4.6,
        humidity: 60,
        precip: 0.4,
        rain: 0.4,
        code: 61,
        wind: 8.6,
      })
    );

    renderWithProviders(
      <WeatherCard
        roleLabel="Origin"
        locationLabel="Times Square, Manhattan, NY"
        weather={weather}
        showAttribution={true}
      />
    );

    expect(screen.getByText('7.9°C')).toBeInTheDocument();
    expect(screen.getByText(/feels like 4\.6°C/i)).toBeInTheDocument();
    expect(screen.getByText('Light rain')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('0.4 mm')).toBeInTheDocument();
    expect(screen.getByText('8.6 km/h')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /weather data by open-meteo/i });
    expect(link).toHaveAttribute('href', 'https://open-meteo.com/');
  });
});

describe('ResultsView Component', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the top recommendation headline and client-side sorting chips', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(buildOpenMeteoPayload()), { status: 200 })
      )
    );

    renderWithProviders(
      <ResultsView
        planData={SAMPLE_PLAN_RESPONSE}
        onReset={vi.fn()}
      />
    );

    expect(screen.getByText(/smart commute match/i)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /best match/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /fastest/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /cheapest/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /greenest/i })).toBeInTheDocument();
  });

  it('re-sorts options when fastest chip is selected', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(buildOpenMeteoPayload()), { status: 200 })
      )
    );

    renderWithProviders(
      <ResultsView
        planData={SAMPLE_PLAN_RESPONSE}
        onReset={vi.fn()}
      />
    );

    const fastestChip = screen.getByRole('radio', { name: /fastest/i });
    fireEvent.click(fastestChip);

    // After re-sorting by fastest, Citi Bike (9 min) should be the first card
    const cards = screen.getAllByRole('article');
    expect(cards[0]).toHaveTextContent(/citi bike/i);
  });

  it('fetches origin and destination weather independently and renders both cards with attribution', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('40.758')) {
        return Promise.resolve(
          new Response(
            JSON.stringify(buildOpenMeteoPayload({ temp: 12.2, wind: 10.5, code: 0 })),
            { status: 200 }
          )
        );
      }
      return Promise.resolve(
        new Response(
          JSON.stringify(buildOpenMeteoPayload({ temp: 13.8, wind: 14.0, code: 2 })),
          { status: 200 }
        )
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithProviders(
      <ResultsView
        planData={SAMPLE_PLAN_RESPONSE}
        onReset={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('12.2°C')).toBeInTheDocument();
      expect(screen.getByText('13.8°C')).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Clear sky')).toBeInTheDocument();
    expect(screen.getByText('Partly cloudy')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /weather data by open-meteo/i })).toHaveAttribute(
      'href',
      'https://open-meteo.com/'
    );
  });

  it('shows Weather temporarily unavailable on API failure and preserves all trip options & rankings', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network offline'))
    );

    renderWithProviders(
      <ResultsView
        planData={SAMPLE_PLAN_RESPONSE}
        onReset={vi.fn()}
      />
    );

    await waitFor(() => {
      const errors = screen.getAllByText(/weather temporarily unavailable/i);
      expect(errors).toHaveLength(2);
    });

    // All 5 transport options preserved in normal composite_score ranking order
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(SAMPLE_PLAN_RESPONSE.options.length);
    // composite_score lowest is Walking (5.4), Subway (6.85) has Best Overall tag
    expect(cards[0]).toHaveTextContent(/walking/i);
    expect(cards[1]).toHaveTextContent(/subway/i);
    expect(cards[1]).toHaveTextContent(/best overall/i);
  });

  it('displays separate weather recommendations for rain while never removing options or altering best_overall', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify(
            buildOpenMeteoPayload({
              temp: 11.0,
              precip: 9.2,
              rain: 9.2,
              code: 65, // Heavy rain
              hourlyPrecip: [9.2, 8.4, 5.1, 2.0],
              hourlyProb: [95, 90, 75, 50],
              hourlyCodes: [65, 65, 63, 61],
            })
          ),
          { status: 200 }
        )
      )
    );

    renderWithProviders(
      <ResultsView
        planData={SAMPLE_PLAN_RESPONSE}
        onReset={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('weather-recommendation-banner')).toBeInTheDocument();
    });

    // All 5 options must still exist — nothing removed
    const cards = screen.getAllByRole('article');
    expect(cards).toHaveLength(5);

    // Backend composite score rank order & best_overall badge preserved
    expect(cards[0]).toHaveTextContent(/walking/i);
    expect(cards[1]).toHaveTextContent(/subway/i);
    expect(cards[1]).toHaveTextContent(/best overall/i);

    // Separate "Weather recommendation" indicators rendered
    const banner = screen.getByTestId('weather-recommendation-banner');
    expect(banner).toHaveTextContent(/strongly avoid cycling and walking/i);

    const walkGuidance = screen.getByTestId('weather-guidance-option-walk-1');
    expect(walkGuidance).toHaveTextContent(/strongly discouraged/i);

    const bikeGuidance = screen.getByTestId('weather-guidance-option-bike-1');
    expect(bikeGuidance).toHaveTextContent(/strongly discouraged/i);

    const subwayGuidance = screen.getByTestId('weather-guidance-option-subway-1');
    expect(subwayGuidance).toHaveTextContent(/suggested \(sheltered\)/i);
  });
});
