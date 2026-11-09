import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { PlanPage } from './pages/PlanPage';
import { StationsPage } from './pages/StationsPage';
import { ImpactPage } from './pages/ImpactPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { SignInModal } from './components/auth/SignInModal';
import { useAuth } from './context/AuthContext';

export const App: React.FC = () => {
  const {
    isSessionExpiredModalOpen,
    dismissSessionExpiredModal,
  } = useAuth();

  const [isSignInOpen, setIsSignInOpen] = useState(false);

  return (
    <AppShell onOpenSignIn={() => setIsSignInOpen(true)}>
      <Routes>
        <Route
          path="/"
          element={<OverviewPage onRequireAuth={() => setIsSignInOpen(true)} />}
        />
        <Route
          path="/plan"
          element={<PlanPage onRequireAuth={() => setIsSignInOpen(true)} />}
        />
        <Route path="/stations" element={<StationsPage />} />
        <Route path="/impact" element={<ImpactPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Voluntary Sign-in Modal */}
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
      />

      {/* 401 Session Expiry Re-Authentication Modal */}
      <SignInModal
        isOpen={isSessionExpiredModalOpen}
        onClose={() => dismissSessionExpiredModal()}
        isSessionExpired={true}
      />
    </AppShell>
  );
};
