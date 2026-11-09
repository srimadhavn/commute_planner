import React, { useState, useEffect } from 'react';
import { Lock, User, KeyRound, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-zinc-800 bg-zinc-950 p-6 sm:p-8">
        <DialogHeader className="mb-4">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 flex items-center justify-center mb-2">
            {challenge ? <KeyRound className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <DialogTitle className="text-xl font-bold text-zinc-100">
            {challenge
              ? 'Set New Password'
              : isSessionExpired
              ? 'Session Expired — Re-authenticate'
              : 'Sign In to Commute Planner'}
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 mt-1">
            {challenge
              ? 'An administrator created your account. Please set a new permanent password.'
              : isSessionExpired
              ? 'Your sign-in session expired. Re-enter your password to proceed without losing your inputs.'
              : 'Enter your credentials to plan trips, save commutes, and track your environmental impact.'}
          </DialogDescription>

          {preservedInputs && (
            <div className="mt-3 p-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono">
              Trip inputs saved: <strong>{preservedInputs.origin || 'Origin'}</strong> →{' '}
              <strong>{preservedInputs.destination || 'Destination'}</strong>
            </div>
          )}
        </DialogHeader>

        {/* Error Banners */}
        {(validationError || error) && (
          <div
            role="alert"
            aria-live="assertive"
            className="p-3 rounded-md bg-zinc-900 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{validationError || error}</span>
          </div>
        )}

        {/* Form 1: Password Challenge Response */}
        {challenge ? (
          <form onSubmit={handleChallengeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="new-password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="bg-zinc-900 border-zinc-800 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1"
              >
                Confirm New Password
              </label>
              <Input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                required
                className="bg-zinc-900 border-zinc-800"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold"
            >
              {isSubmitting ? 'Updating...' : 'Set New Password & Continue'}
            </Button>
          </form>
        ) : (
          /* Form 2: Normal Sign In or Re-authentication */
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            {!isSessionExpired && (
              <div>
                <label
                  htmlFor="auth-username"
                  className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1"
                >
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    id="auth-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="pl-9 bg-zinc-900 border-zinc-800"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-9 pr-10 bg-zinc-900 border-zinc-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold"
            >
              {isSubmitting ? 'Verifying...' : isSessionExpired ? 'Re-Authenticate' : 'Sign In'}
            </Button>
          </form>
        )}

        {/* Demo / Sample Data Mode Option */}
        <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500 mb-2">
            Testing without pre-provisioned Cognito credentials?
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleDemoClick}
            className="w-full text-xs font-semibold border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
            <span>Explore with Sample Data (Demo Mode)</span>
          </Button>
          <span className="inline-block mt-2 text-[10px] text-zinc-500">
            Visibly labelled "Sample data" per project requirements.
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
