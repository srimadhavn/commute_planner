import React, { useState, useEffect } from 'react';
import {
  Compass,
  BarChart3,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
  Radio,
  AlertTriangle,
  WifiOff,
  LogOut,
  LogIn,
  RotateCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHealth } from '../../hooks/useHealth';
import { Badge } from '../common/Badge';

export type ActiveTab = 'plan' | 'impact' | 'methodology';

interface AppShellProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSignIn: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  onTabChange,
  onOpenSignIn,
  children,
}) => {
  const { user, isAuthenticated, isDemoMode, signOut, disableDemoMode } = useAuth();
  const { theme, setTheme } = useTheme();
  const { health, isStale, isError, refetch } = useHealth();
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div
          role="alert"
          className="bg-rose-600 text-white px-4 py-2 text-center text-sm font-semibold flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4" aria-hidden="true" />
          <span>You are currently offline. Showing cached information.</span>
        </div>
      )}

      {/* Stale Feed Warning Banner */}
      {(isStale || isError) && (
        <div
          role="alert"
          className="bg-amber-500 text-slate-950 px-4 py-2.5 text-center text-sm font-semibold flex items-center justify-center gap-3 shadow-md"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 text-slate-950" aria-hidden="true" />
          <span>
            Warning: Bike-share live data feed is temporarily stale or unavailable. Times and bike docks may reflect estimates.
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-white rounded text-xs font-bold hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-950 min-h-touch"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Retry Feed</span>
          </button>
        </div>
      )}

      {/* Main Header Landmark */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onTabChange('plan')}
                className="flex items-center gap-2.5 font-bold text-lg sm:text-xl text-primary-700 dark:text-primary-400 focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg p-1 min-h-touch"
                aria-label="Commute Planner Home"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center shadow-sm">
                  <Compass className="w-5 h-5" aria-hidden="true" />
                </div>
                <span className="tracking-tight">Commute Planner</span>
              </button>

              {/* Data Freshness Indicator */}
              <div
                className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                aria-label="Bike data freshness status"
              >
                <Radio
                  className={`w-3.5 h-3.5 ${
                    isStale
                      ? 'text-amber-500 animate-pulse'
                      : health?.status === 'ok'
                      ? 'text-emerald-500'
                      : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <span>
                  {health?.status === 'ok'
                    ? `Live: ${health.station_count.toLocaleString()} stations (${health.age_seconds}s ago)`
                    : isStale
                    ? 'Feed Stale'
                    : 'Connecting...'}
                </span>
              </div>

              {/* Sample Data Demo Banner if Active */}
              {isDemoMode && (
                <div className="hidden sm:inline-block">
                  <Badge variant="sample" />
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
              <button
                type="button"
                onClick={() => onTabChange('plan')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors min-h-touch flex items-center gap-2 ${
                  activeTab === 'plan'
                    ? 'bg-primary-50 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                } focus-visible:ring-2 focus-visible:ring-primary-500`}
              >
                <Compass className="w-4 h-4" aria-hidden="true" />
                <span>Plan Commute</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('impact')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors min-h-touch flex items-center gap-2 ${
                  activeTab === 'impact'
                    ? 'bg-primary-50 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                } focus-visible:ring-2 focus-visible:ring-primary-500`}
              >
                <BarChart3 className="w-4 h-4" aria-hidden="true" />
                <span>My Impact</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('methodology')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors min-h-touch flex items-center gap-2 ${
                  activeTab === 'methodology'
                    ? 'bg-primary-50 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                } focus-visible:ring-2 focus-visible:ring-primary-500`}
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                <span>How It Works</span>
              </button>
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={cycleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-primary-500 min-h-touch min-w-touch flex items-center justify-center"
                aria-label={`Theme switch (Current: ${theme})`}
                title={`Current theme: ${theme}. Click to switch.`}
              >
                {theme === 'light' && <Sun className="w-5 h-5 text-amber-500" aria-hidden="true" />}
                {theme === 'dark' && <Moon className="w-5 h-5 text-indigo-400" aria-hidden="true" />}
                {theme === 'system' && <Laptop className="w-5 h-5 text-slate-500" aria-hidden="true" />}
              </button>

              {/* Authentication Controls */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="hidden lg:block text-right">
                    <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                      {user?.username || 'Signed In'}
                    </span>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      {isDemoMode ? 'Demo Mode' : 'Cognito User'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={isDemoMode ? disableDemoMode : signOut}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus-visible:ring-2 focus-visible:ring-primary-500 min-h-touch"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenSignIn}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 min-h-touch"
                  aria-label="Sign in"
                >
                  <LogIn className="w-4 h-4" aria-hidden="true" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Freshness / Demo Indicator Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-1.5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Radio
              className={`w-3 h-3 ${isStale ? 'text-amber-500' : 'text-emerald-500'}`}
              aria-hidden="true"
            />
            <span>
              {health?.status === 'ok'
                ? `${health.station_count.toLocaleString()} stations live`
                : 'Feed stale'}
            </span>
          </div>
          {isDemoMode && <Badge variant="sample" />}
        </div>
      </header>

      {/* Main Content Area Landmark */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12" id="main-content">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 px-2"
        aria-label="Mobile Navigation"
      >
        <button
          type="button"
          onClick={() => onTabChange('plan')}
          className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-medium min-h-touch focus-visible:ring-2 focus-visible:ring-primary-500 rounded ${
            activeTab === 'plan'
              ? 'text-primary-600 dark:text-primary-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-current={activeTab === 'plan' ? 'page' : undefined}
        >
          <Compass className="w-5 h-5 mb-0.5" aria-hidden="true" />
          <span>Plan</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('impact')}
          className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-medium min-h-touch focus-visible:ring-2 focus-visible:ring-primary-500 rounded ${
            activeTab === 'impact'
              ? 'text-primary-600 dark:text-primary-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-current={activeTab === 'impact' ? 'page' : undefined}
        >
          <BarChart3 className="w-5 h-5 mb-0.5" aria-hidden="true" />
          <span>My Impact</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('methodology')}
          className={`flex-1 flex flex-col items-center justify-center py-1 text-xs font-medium min-h-touch focus-visible:ring-2 focus-visible:ring-primary-500 rounded ${
            activeTab === 'methodology'
              ? 'text-primary-600 dark:text-primary-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
          aria-current={activeTab === 'methodology' ? 'page' : undefined}
        >
          <HelpCircle className="w-5 h-5 mb-0.5" aria-hidden="true" />
          <span>How It Works</span>
        </button>
      </nav>

      {/* Semantic Footer Landmark */}
      <footer className="hidden md:block bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Commute Planner — Sustainability-focused trip comparison.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onTabChange('methodology')}
              className="hover:text-primary-600 dark:hover:text-primary-400 underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              EPA Carbon & Transit Assumptions
            </button>
            <span>•</span>
            <span>NYC Citibike Live GBFS Feed</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
