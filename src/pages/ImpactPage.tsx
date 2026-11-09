import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { ImpactView } from '../components/impact/ImpactView';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getTrips } from '../services/api';
import { SavedTripsResponse } from '../types/api';
import { SAMPLE_SAVED_TRIPS } from '../services/sampleData';

export const ImpactPage: React.FC = () => {
  const navigate = useNavigate();
  const { idToken, isAuthenticated, isDemoMode } = useAuth();
  const { showToast } = useToast();

  const { data: tripsData, isLoading } = useQuery<SavedTripsResponse>({
    queryKey: ['saved-trips', idToken, isDemoMode],
    queryFn: async () => {
      if (isDemoMode) {
        return SAMPLE_SAVED_TRIPS;
      }
      if (!idToken) {
        return { totals: { trips: 0, co2_saved_g: 0, cost_saved: 0, car_km_avoided: 0 }, trips: [] };
      }
      return getTrips(idToken);
    },
    enabled: isAuthenticated || isDemoMode,
  });

  const exportCsv = () => {
    const trips = tripsData?.trips || SAMPLE_SAVED_TRIPS.trips;
    if (trips.length === 0) {
      showToast('No logged commutes to export.', 'error');
      return;
    }

    const headers = ['Trip ID', 'Date', 'Option', 'Origin', 'Destination', 'Duration (min)', 'Cost ($)', 'CO2 (g)', 'Cost Saved ($)', 'CO2 Saved (g)'];
    const rows = trips.map((t) => [
      t.trip_id,
      t.trip_ts,
      `"${t.option_name}"`,
      `"${t.origin}"`,
      `"${t.destination}"`,
      t.time_min,
      t.cost,
      t.co2_g,
      t.cost_saved,
      t.co2_saved_g,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `commute_impact_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Commute logs exported to CSV.', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Vercel Breadcrumbs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>commute-planner</span>
            <span>/</span>
            <span className="text-zinc-300">analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            Environmental & Financial Impact Analytics
          </h1>
          <p className="text-xs text-zinc-400">
            Longitudinal emissions reduction, personal cost avoidance, and verified commute history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCsv}
            className="h-8 text-xs border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/plan')}
            className="h-8 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
          >
            <span>Log Commute</span>
          </Button>
        </div>
      </div>

      <ImpactView
        impactData={tripsData || (isDemoMode ? SAMPLE_SAVED_TRIPS : null)}
        isLoading={isLoading}
        onNavigateToPlan={() => navigate('/plan')}
        isDemoMode={isDemoMode}
      />
    </div>
  );
};
