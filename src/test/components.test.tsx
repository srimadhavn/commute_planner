import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PlanForm } from '../components/plan/PlanForm';
import { OptionCard } from '../components/results/OptionCard';
import { ResultsView } from '../components/results/ResultsView';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ThemeProvider } from '../context/ThemeContext';
import { MemoryRouter } from 'react-router-dom';
import { SAMPLE_PLAN_RESPONSE } from '../services/sampleData';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>{ui}</ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
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

describe('ResultsView Component', () => {
  it('renders the top recommendation headline and client-side sorting chips', () => {
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
});
