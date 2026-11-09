import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  GitBranch,
  Layers,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHealth } from '../../hooks/useHealth';
import { Badge } from '../common/Badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface AppShellProps {
  onOpenSignIn: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ onOpenSignIn, children }) => {
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

  const navItems = [
    { label: 'Overview', to: '/', icon: Layers },
    { label: 'Plan Commute', to: '/plan', icon: Compass },
    { label: 'Live Stations', to: '/stations', icon: Radio },
    { label: 'My Impact', to: '/impact', icon: BarChart3 },
    { label: 'How It Works', to: '/methodology', icon: HelpCircle },
  ];

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

      {/* Vercel-Style Project Header */}
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
        {/* Top Bar: Brand, Breadcrumbs, Status, Auth */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2">
            {/* Left: Breadcrumbs & Project Switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 font-bold text-sm sm:text-base text-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-md p-1"
                aria-label="Commute Planner Home"
              >
                <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-700/80 text-zinc-100 flex items-center justify-center shadow-xs">
                  <Compass className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="tracking-tight hidden xs:inline">Commute Planner</span>
              </Link>

              <span className="text-zinc-600 font-mono text-sm">/</span>

              {/* Scope / Environment Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                <GitBranch className="w-3 h-3 text-zinc-400" />
                <span>nyc-transit</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
              </div>

              {/* Live GBFS Telemetry Dot */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800"
                aria-label="Live Citi Bike station feed status"
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    isStale
                      ? 'bg-amber-400 animate-pulse'
                      : health?.status === 'ok'
                      ? 'bg-emerald-400'
                      : 'bg-zinc-500'
                  )}
                  aria-hidden="true"
                />
                <span className="tabular-nums font-mono text-[11px]">
                  {health?.status === 'ok'
                    ? `Live: ${health.station_count.toLocaleString()} (${health.age_seconds}s)`
                    : isStale
                    ? 'Feed Stale'
                    : 'Connecting...'}
                </span>
              </div>

              {/* Sample Data Demo Banner if Active */}
              {isDemoMode && (
                <div className="hidden md:inline-block">
                  <Badge variant="sample" />
                </div>
              )}
            </div>

            {/* Right: Theme Toggle & User Auth */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={cycleTheme}
                aria-label={`Current theme: ${theme}. Click to switch theme.`}
                className="w-8 h-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              >
                {theme === 'dark' && <Moon className="w-4 h-4" aria-hidden="true" />}
                {theme === 'light' && <Sun className="w-4 h-4" aria-hidden="true" />}
                {theme === 'system' && <Laptop className="w-4 h-4" aria-hidden="true" />}
              </Button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs font-mono text-zinc-200 truncate max-w-[150px]">
                      {user?.username || (isDemoMode ? 'demo_rider' : 'Authenticated')}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {isDemoMode ? 'Demo Mode' : 'Cognito User'}
                    </span>
                  </div>

                  {isDemoMode ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={disableDemoMode}
                      className="h-8 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                      aria-label="Exit Demo Mode"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" />
                      <span>Exit Demo</span>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={signOut}
                      className="h-8 text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                      aria-label="Sign Out"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1" />
                      <span>Sign Out</span>
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onOpenSignIn}
                  className="h-8 text-xs font-semibold bg-zinc-100 text-zinc-950 hover:bg-zinc-200 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  <span>Sign In</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sub-Navigation Bar: Vercel Horizontal Tabs with Active Bottom Border */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 sm:gap-2 -mb-px overflow-x-auto scrollbar-none" aria-label="Project Sub Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  role="button"
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                      isActive
                        ? 'border-zinc-100 text-zinc-100 font-semibold'
                        : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    )
                  }
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area Landmark */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 bg-dot-grid" id="main-content">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur border-t border-zinc-800 flex justify-around items-center h-14 px-2"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              role="button"
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center justify-center py-1 text-[10px] font-medium min-h-touch rounded transition-colors',
                  isActive ? 'text-zinc-100 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                )
              }
            >
              <Icon className="w-4 h-4 mb-0.5" aria-hidden="true" />
              <span>{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Semantic Footer Landmark */}
      <footer className="hidden md:block bg-zinc-950 border-t border-zinc-800/80 text-xs text-zinc-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-zinc-400">Commute Planner</span>
            <span className="text-zinc-700">•</span>
            <span>Sustainability-focused multi-modal transit comparison</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/methodology"
              className="hover:text-zinc-300 underline underline-offset-4 focus-visible:ring-1 focus-visible:ring-zinc-400 font-mono text-[11px]"
            >
              EPA Carbon & Transit Assumptions
            </Link>
            <span className="text-zinc-700">•</span>
            <span className="font-mono text-[11px] text-zinc-400">NYC Citibike Live GBFS v2.3</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
