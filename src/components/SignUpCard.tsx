import React, { useState, useMemo } from 'react';
import { Mail, Lock, Eye, EyeOff, User as UserIcon, ArrowRight, Shield, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { AuthMode, UserRole } from '../types';
import { evaluatePasswordStrength } from '../utils/authStorage';
import { PasswordStrengthBar } from './PasswordStrengthBar';

interface SignUpCardProps {
  onSignUp: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    enable2FA: boolean;
  }) => void;
  onSwitchMode: (mode: AuthMode) => void;
  isLoading: boolean;
  errorMessage?: string | null;
}

export const SignUpCard: React.FC<SignUpCardProps> = ({
  onSignUp,
  onSwitchMode,
  isLoading,
  errorMessage,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('member');
  const [enable2FA, setEnable2FA] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }
    if (strength.score < 2) {
      setValidationError('Please choose a stronger password meeting the criteria below');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setValidationError('You must agree to the Terms of Service & Privacy Policy');
      return;
    }

    onSignUp({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      enable2FA,
    });
  };

  return (
    <div
      id="signup-card"
      className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-3 shadow-md shadow-slate-900/10">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Create an account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Set up your secure credentials & permissions
        </p>
      </div>

      {/* Error alerts */}
      {(errorMessage || validationError) && (
        <div
          id="signup-error-banner"
          className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Registration Issue</p>
            <p className="mt-0.5 text-rose-700">{errorMessage || validationError}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="signup-name"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <UserIcon className="w-4 h-4" />
            </div>
            <input
              id="signup-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sarah Connor"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Work Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah@company.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Initial Account Role
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['member', 'developer', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                id={`signup-role-${r}`}
                onClick={() => setRole(r)}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
                  role === r
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Create Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
            <button
              type="button"
              id="signup-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Checklist & Bar */}
          {password.length > 0 && (
            <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <PasswordStrengthBar strength={strength} showCriteria={true} />
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="signup-confirm-password"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? 'border-emerald-400 ring-1 ring-emerald-400/20'
                    : 'border-rose-400 ring-1 ring-rose-400/20'
                  : 'border-slate-200'
              }`}
            />
            <button
              type="button"
              id="signup-toggle-confirm-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmPassword.length > 0 && (
            <p className={`text-[11px] mt-1 font-medium ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
              {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
            </p>
          )}
        </div>

        {/* 2FA Option Checkbox */}
        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              id="signup-enable-2fa"
              type="checkbox"
              checked={enable2FA}
              onChange={(e) => setEnable2FA(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                Enable Two-Factor Authentication (2FA)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Requires an authenticator code on each sign in for maximum security.
              </p>
            </div>
          </label>
        </div>

        {/* Terms agreement */}
        <label className="flex items-start gap-2 cursor-pointer pt-1">
          <input
            id="signup-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span className="text-xs text-slate-600">
            I agree to the{' '}
            <span className="text-slate-900 underline font-medium">Terms of Service</span> and{' '}
            <span className="text-slate-900 underline font-medium">Privacy Policy</span>.
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          id="signup-submit-btn"
          disabled={isLoading}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-semibold shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          id="signup-switch-to-signin"
          onClick={() => onSwitchMode('signin')}
          className="font-semibold text-slate-900 hover:underline cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
