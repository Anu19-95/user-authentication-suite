import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Shield, UserCheck, AlertCircle, Key, Zap } from 'lucide-react';
import { AuthMode } from '../types';
import { INITIAL_USERS } from '../utils/authStorage';

interface SignInCardProps {
  onSignIn: (email: string, password: string, rememberMe: boolean) => void;
  onSwitchMode: (mode: AuthMode) => void;
  isLoading: boolean;
  errorMessage?: string | null;
  lockoutSeconds?: number | null;
  onQuickLogin: (user: typeof INITIAL_USERS[0]) => void;
}

export const SignInCard: React.FC<SignInCardProps> = ({
  onSignIn,
  onSwitchMode,
  isLoading,
  errorMessage,
  lockoutSeconds,
  onQuickLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    onSignIn(email.trim(), password, rememberMe);
  };

  return (
    <div
      id="signin-card"
      className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-3 shadow-md shadow-slate-900/10">
          <Shield className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Sign in to your enterprise identity dashboard
        </p>
      </div>

      {/* Lockout alert */}
      {lockoutSeconds && lockoutSeconds > 0 ? (
        <div
          id="signin-lockout-banner"
          className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Account temporarily locked</p>
            <p className="mt-0.5 text-rose-700">
              Too many failed login attempts. Please wait{' '}
              <span className="font-bold">{lockoutSeconds}s</span> before retrying.
            </p>
          </div>
        </div>
      ) : null}

      {/* General Error alert */}
      {errorMessage && (!lockoutSeconds || lockoutSeconds <= 0) && (
        <div
          id="signin-error-banner"
          className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs animate-shake"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <p className="font-semibold">Sign in failed</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="signin-email"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="signin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="signin-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <button
              type="button"
              id="signin-forgot-password-link"
              onClick={() => onSwitchMode('forgot-password')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
            <button
              type="button"
              id="signin-toggle-password-visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me & Passwordless */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="signin-remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span className="text-xs text-slate-600">Remember for 30 days</span>
          </label>

          <button
            type="button"
            id="signin-magic-link-btn"
            onClick={() => onSwitchMode('magic-link')}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Magic Link
          </button>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          id="signin-submit-btn"
          disabled={isLoading || (lockoutSeconds !== null && lockoutSeconds > 0)}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-sm font-semibold shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Pre-filled Accounts */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500" />
            One-Click Test Accounts
          </span>
          <span className="text-[10px] text-slate-400">Click to auto-login</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {INITIAL_USERS.map((user) => (
            <button
              key={user.id}
              type="button"
              id={`quick-login-${user.role}`}
              onClick={() => onQuickLogin(user)}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 hover:border-slate-300 transition-all text-left group"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.role === 'admin'
                      ? 'bg-purple-500'
                      : user.role === 'developer'
                      ? 'bg-blue-500'
                      : 'bg-emerald-500'
                  }`}
                />
                <span className="text-[11px] font-bold capitalize text-slate-800 group-hover:text-slate-900 truncate">
                  {user.role}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {user.twoFactorEnabled ? '2FA Active' : 'Standard'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Switch to Sign Up */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          id="signin-switch-to-signup"
          onClick={() => onSwitchMode('signup')}
          className="font-semibold text-slate-900 hover:underline cursor-pointer"
        >
          Create account
        </button>
      </div>
    </div>
  );
};
