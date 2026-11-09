import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  initiateAuth,
  respondToNewPasswordChallenge,
  refreshAuthToken,
  AuthTokens,
  AuthChallenge,
} from '../services/cognito';
import { onUnauthorized } from '../services/api';

interface SavedFormInputs {
  origin: string;
  destination: string;
  priority: string;
  parkingCost: number;
}

interface AuthContextType {
  user: { username: string } | null;
  idToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  challenge: AuthChallenge | null;
  error: string | null;
  isSessionExpiredModalOpen: boolean;
  preservedInputs: SavedFormInputs | null;
  signIn: (username: string, password: string) => Promise<boolean>;
  completeNewPassword: (newPassword: string) => Promise<boolean>;
  reSignIn: (password: string) => Promise<boolean>;
  signOut: () => void;
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  setPreservedInputs: (inputs: SavedFormInputs | null) => void;
  dismissSessionExpiredModal: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REFRESH_TOKEN_KEY = 'commute_planner_refresh_token';
const SAVED_USERNAME_KEY = 'commute_planner_username';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In-memory token storage (never stored in localStorage)
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [challenge, setChallenge] = useState<AuthChallenge | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // 401 session expiry state
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState<boolean>(false);
  const [preservedInputs, setPreservedInputs] = useState<SavedFormInputs | null>(null);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearRefreshTimer = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  const scheduleTokenRefresh = useCallback((currentTokens: AuthTokens) => {
    clearRefreshTimer();
    // Refresh 60 seconds before token expires (default is usually 3600 seconds)
    const refreshDelayMs = Math.max((currentTokens.expiresIn - 60) * 1000, 10000);

    refreshTimeoutRef.current = setTimeout(async () => {
      const storedRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY) || currentTokens.refreshToken;
      if (storedRefreshToken) {
        const renewed = await refreshAuthToken(storedRefreshToken, currentTokens.username);
        if (renewed) {
          setTokens(renewed);
          if (renewed.refreshToken) {
            sessionStorage.setItem(REFRESH_TOKEN_KEY, renewed.refreshToken);
          }
          scheduleTokenRefresh(renewed);
          return;
        }
      }
      // If refresh failed, session has expired
      setIsSessionExpiredModalOpen(true);
    }, refreshDelayMs);
  }, []);

  // Try silent session restoration from sessionStorage refresh token on mount
  useEffect(() => {
    const storedRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    const storedUsername = sessionStorage.getItem(SAVED_USERNAME_KEY);

    if (storedRefreshToken && storedUsername) {
      setIsLoading(true);
      refreshAuthToken(storedRefreshToken, storedUsername)
        .then((renewed) => {
          if (renewed) {
            setTokens(renewed);
            scheduleTokenRefresh(renewed);
          } else {
            sessionStorage.removeItem(REFRESH_TOKEN_KEY);
          }
        })
        .catch(() => {
          sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    return () => clearRefreshTimer();
  }, [scheduleTokenRefresh]);

  // Intercept 401 Unauthorized API responses
  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      if (!isDemoMode) {
        setIsSessionExpiredModalOpen(true);
      }
    });
    return unsubscribe;
  }, [isDemoMode]);

  const signIn = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    setChallenge(null);

    const result = await initiateAuth(username, password);
    setIsLoading(false);

    if (result.success) {
      setTokens(result.tokens);
      setIsDemoMode(false);
      sessionStorage.setItem(SAVED_USERNAME_KEY, result.tokens.username);
      if (result.tokens.refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, result.tokens.refreshToken);
      }
      scheduleTokenRefresh(result.tokens);
      return true;
    }

    if ('challenge' in result) {
      setChallenge(result.challenge);
      return false;
    }

    setError(result.error);
    return false;
  };

  const completeNewPassword = async (newPassword: string): Promise<boolean> => {
    if (!challenge) {
      setError('No active password challenge.');
      return false;
    }

    setIsLoading(true);
    setError(null);

    const result = await respondToNewPasswordChallenge(challenge.username, newPassword, challenge.session);
    setIsLoading(false);

    if (result.success) {
      setTokens(result.tokens);
      setChallenge(null);
      setIsDemoMode(false);
      sessionStorage.setItem(SAVED_USERNAME_KEY, result.tokens.username);
      if (result.tokens.refreshToken) {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, result.tokens.refreshToken);
      }
      scheduleTokenRefresh(result.tokens);
      return true;
    }

    if ('error' in result) {
      setError(result.error);
    }
    return false;
  };

  const reSignIn = async (password: string): Promise<boolean> => {
    const username = tokens?.username || sessionStorage.getItem(SAVED_USERNAME_KEY);
    if (!username) {
      setError('Username not found. Please sign in again.');
      return false;
    }

    const success = await signIn(username, password);
    if (success) {
      setIsSessionExpiredModalOpen(false);
    }
    return success;
  };

  const signOut = () => {
    clearRefreshTimer();
    setTokens(null);
    setChallenge(null);
    setIsDemoMode(false);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(SAVED_USERNAME_KEY);
    setIsSessionExpiredModalOpen(false);
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    setTokens({
      idToken: 'demo-sample-id-token',
      accessToken: 'demo-sample-access-token',
      expiresIn: 86400,
      issuedAt: Date.now(),
      username: 'demo_rider@commuteplanner.test',
    });
    setError(null);
    setChallenge(null);
    setIsSessionExpiredModalOpen(false);
  };

  const disableDemoMode = () => {
    signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: tokens ? { username: tokens.username } : null,
        idToken: tokens?.idToken || null,
        isAuthenticated: !!tokens || isDemoMode,
        isLoading,
        isDemoMode,
        challenge,
        error,
        isSessionExpiredModalOpen,
        preservedInputs,
        signIn,
        completeNewPassword,
        reSignIn,
        signOut,
        enableDemoMode,
        disableDemoMode,
        setPreservedInputs,
        dismissSessionExpiredModal: () => setIsSessionExpiredModalOpen(false),
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
