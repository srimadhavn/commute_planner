import React, { useState, useEffect } from 'react';
import { X, Lock, User, KeyRound, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSessionExpired?: boolean;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  isSessionExpired = false,
}) => {
  const {
    signIn,
    reSignIn,
    completeNewPassword,
    enableDemoMode,
    challenge,
    error,
    clearError,
    preservedInputs,
  } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      clearError();
      setValidationError(null);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      const savedUser = sessionStorage.getItem('commute_planner_username');
      if (savedUser && !username) {
        setUsername(savedUser);
      }
    }
  }, [isOpen, clearError]);

  if (!isOpen) return null;

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (isSessionExpired) {
      if (!password) {
        setValidationError('Please enter your password to continue.');
        return;
      }
      setIsSubmitting(true);
      const success = await reSignIn(password);
      setIsSubmitting(false);
      if (success) {
        onClose();
      }
      return;
    }

    if (!username.trim() || !password) {
      setValidationError('Please provide both username/email and password.');
      return;
    }

    setIsSubmitting(true);
    const success = await signIn(username.trim(), password);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const handleChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!newPassword || newPassword.length < 8) {
      setValidationError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const success = await completeNewPassword(newPassword);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  const handleDemoClick = () => {
    enableDemoMode();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg focus-visible:ring-2 focus-visible:ring-primary-500 min-h-touch min-w-touch flex items-center justify-center"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
            {challenge ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            {challenge
              ? 'Set New Password'
              : isSessionExpired
              ? 'Session Expired — Re-authenticate'
              : 'Sign In to Commute Planner'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {challenge
              ? 'An administrator created your account. Please set a new permanent password.'
              : isSessionExpired
              ? 'Your sign-in session expired. Re-enter your password to proceed without losing your inputs.'
              : 'Enter your credentials to plan trips, save commutes, and track your environmental impact.'}
          </p>

          {preservedInputs && (
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              Trip inputs saved: <strong>{preservedInputs.origin || 'Origin'}</strong> →{' '}
              <strong>{preservedInputs.destination || 'Destination'}</strong>
            </div>
          )}
        </div>

        {/* Error Banners */}
        {(validationError || error) && (
          <div
            role="alert"
            aria-live="assertive"
            className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-sm text-rose-800 dark:text-rose-200 flex items-start gap-2.5"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Form 1: Password Challenge Response */}
        {challenge ? (
          <form onSubmit={handleChallengeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-touch"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded min-h-touch min-w-touch flex items-center justify-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-touch"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 min-h-touch flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Updating...' : 'Set New Password & Continue'}
            </button>
          </form>
        ) : (
          /* Form 2: Normal Sign In or Re-authentication */
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            {!isSessionExpired && (
              <div>
                <label
                  htmlFor="auth-username"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
                >
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-touch"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-touch"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded min-h-touch min-w-touch flex items-center justify-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 min-h-touch flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? 'Verifying...' : isSessionExpired ? 'Re-Authenticate' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Demo / Sample Data Mode Option */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            Testing without pre-provisioned Cognito credentials?
          </p>
          <button
            type="button"
            onClick={handleDemoClick}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 min-h-touch flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Explore with Sample Data (Demo Mode)</span>
          </button>
          <span className="inline-block mt-2 text-[10px] text-slate-400">
            Visibly labelled "Sample data" per project requirements.
          </span>
        </div>
      </div>
    </div>
  );
};
