import React, { useState, useEffect } from 'react';
import {
  Compass,
  BarChart3,
  HelpCircle,
  Sun,
  Moon,
  Laptop,
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
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

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
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div
          role="alert"
          className="bg-zinc-900 border-b border-zinc-800 text-zinc-300 px-4 py-2 text-center text-xs font-medium flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4 text-zinc-400" aria-hidden="true" />
          <span>You are currently offline. Showing cached information.</span>
        </div>
      )}

      {/* Stale Feed Warning Banner */}
      {(isStale || isError) && (
        <div
          role="alert"
          className="bg-zinc-900 border-b border-amber-900/60 text-amber-200 px-4 py-2 text-center text-xs font-medium flex items-center justify-center gap-3 shadow-xs"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" aria-hidden="true" />
          <span>
            Warning: Bike-share live data feed is temporarily stale. Times and docks may reflect estimates.
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-7 px-2.5 text-xs border-amber-800/80 bg-zinc-950 text-amber-200 hover:bg-zinc-800"
          >
            <RotateCw className="w-3 h-3 mr-1" />
            <span>Retry Feed</span>
          </Button>
        </div>
      )}

      {/* Main Header Landmark */}
      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onTabChange('plan')}
                className="flex items-center gap-2.5 font-semibold text-base sm:text-lg text-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-md p-1 min-h-touch"
                aria-label="Commute Planner Home"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 flex items-center justify-center shadow-xs">
                  <Compass className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="tracking-tight font-bold">Commute Planner</span>
              </button>

              {/* Data Freshness Indicator */}
              <div
                className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800"
                aria-label="Bike data freshness status"
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isStale
                      ? 'bg-amber-400 animate-pulse'
                      : health?.status === 'ok'
                      ? 'bg-emerald-400'
                      : 'bg-zinc-500'
                  )}
                  aria-hidden="true"
                />
                <span className="tabular-nums">
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
              <Button
                variant={activeTab === 'plan' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('plan')}
                className={cn(
                  'text-xs font-medium',
                  activeTab === 'plan'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100'
                )}
              >
                <Compass className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                <span>Plan Commute</span>
              </Button>

              <Button
                variant={activeTab === 'impact' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('impact')}
                className={cn(
                  'text-xs font-medium',
                  activeTab === 'impact'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100'
                )}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                <span>My Impact</span>
              </Button>

              <Button
                variant={activeTab === 'methodology' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onTabChange('methodology')}
                className={cn(
                  'text-xs font-medium',
                  activeTab === 'methodology'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100'
                )}
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                <span>How It Works</span>
              </Button>
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={cycleTheme}
                className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                aria-label={`Theme switch (Current: ${theme})`}
                title={`Current theme: ${theme}. Click to switch.`}
              >
                {theme === 'light' && <Sun className="w-4 h-4 text-zinc-300" aria-hidden="true" />}
                {theme === 'dark' && <Moon className="w-4 h-4 text-zinc-300" aria-hidden="true" />}
                {theme === 'system' && <Laptop className="w-4 h-4 text-zinc-400" aria-hidden="true" />}
              </Button>

              {/* Authentication Controls */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="hidden lg:block text-right">
                    <span className="block text-xs font-medium text-zinc-200 truncate max-w-[150px]">
                      {user?.username || 'Signed In'}
                    </span>
                    <span className="block text-[10px] text-zinc-500">
                      {isDemoMode ? 'Demo Mode' : 'Cognito User'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={isDemoMode ? disableDemoMode : signOut}
                    className="text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={onOpenSignIn}
                  className="text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                  aria-label="Sign in"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Freshness / Demo Indicator Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-1.5 bg-zinc-900/60 border-t border-zinc-800 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                isStale ? 'bg-amber-400' : 'bg-emerald-400'
              )}
              aria-hidden="true"
            />
            <span className="tabular-nums">
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 flex justify-around items-center h-14 px-2"
        aria-label="Mobile Navigation"
      >
        <button
          type="button"
          onClick={() => onTabChange('plan')}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-1 text-[11px] font-medium min-h-touch rounded',
            activeTab === 'plan'
              ? 'text-zinc-100 font-bold'
              : 'text-zinc-500'
          )}
          aria-current={activeTab === 'plan' ? 'page' : undefined}
        >
          <Compass className="w-4 h-4 mb-0.5" aria-hidden="true" />
          <span>Plan</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('impact')}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-1 text-[11px] font-medium min-h-touch rounded',
            activeTab === 'impact'
              ? 'text-zinc-100 font-bold'
              : 'text-zinc-500'
          )}
          aria-current={activeTab === 'impact' ? 'page' : undefined}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" aria-hidden="true" />
          <span>My Impact</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('methodology')}
          className={cn(
            'flex-1 flex flex-col items-center justify-center py-1 text-[11px] font-medium min-h-touch rounded',
            activeTab === 'methodology'
              ? 'text-zinc-100 font-bold'
              : 'text-zinc-500'
          )}
          aria-current={activeTab === 'methodology' ? 'page' : undefined}
        >
          <HelpCircle className="w-4 h-4 mb-0.5" aria-hidden="true" />
          <span>How It Works</span>
        </button>
      </nav>

      {/* Semantic Footer Landmark */}
      <footer className="hidden md:block bg-zinc-950 border-t border-zinc-800/60 text-xs text-zinc-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Commute Planner — Sustainability-focused trip comparison.</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onTabChange('methodology')}
              className="hover:text-zinc-300 underline underline-offset-4 focus-visible:ring-1 focus-visible:ring-zinc-400"
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
