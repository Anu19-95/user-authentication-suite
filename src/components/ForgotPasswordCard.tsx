import React, { useState, useRef, useEffect } from 'react';
import { Mail, KeyRound, ArrowLeft, ArrowRight, CheckCircle2, Lock, Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react';
import { AuthMode } from '../types';
import { evaluatePasswordStrength } from '../utils/authStorage';
import { PasswordStrengthBar } from './PasswordStrengthBar';

interface ForgotPasswordCardProps {
  onResetPasswordSuccess: (email: string, newPass: string) => void;
  onSwitchMode: (mode: AuthMode) => void;
}

export const ForgotPasswordCard: React.FC<ForgotPasswordCardProps> = ({
  onResetPasswordSuccess,
  onSwitchMode,
}) => {
  const [step, setStep] = useState<'email' | 'otp' | 'new-password' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [simulatedOtp, setSimulatedOtp] = useState<string>('492815');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const strength = evaluatePasswordStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Generate a random 6-digit OTP code when advancing to otp step
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    setTimeout(() => {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setSimulatedOtp(generated);
      setIsSubmitting(false);
      setStep('otp');
    }, 600);
  };

  // OTP inputs handler
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join('');
    if (enteredCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits');
      return;
    }
    if (enteredCode !== simulatedOtp && enteredCode !== '123456') {
      setErrorMsg('Invalid verification code. Please check the simulated inbox code.');
      return;
    }

    setErrorMsg(null);
    setStep('new-password');
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (strength.score < 2) {
      setErrorMsg('Please choose a stronger password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('done');
      onResetPasswordSuccess(email, newPassword);
    }, 700);
  };

  const fillSimulatedOtp = () => {
    setOtpDigits(simulatedOtp.split(''));
    setErrorMsg(null);
  };

  return (
    <div
      id="forgot-password-card"
      className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-3 shadow-md shadow-slate-900/10">
          <KeyRound className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {step === 'email' && 'Reset your password'}
          {step === 'otp' && 'Enter verification code'}
          {step === 'new-password' && 'Set new password'}
          {step === 'done' && 'Password updated!'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {step === 'email' && 'We’ll send a secure one-time verification code'}
          {step === 'otp' && `Code sent to ${email}`}
          {step === 'new-password' && 'Must be at least 8 characters with numbers & symbols'}
          {step === 'done' && 'Your account security credentials are restored'}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* STEP 1: Enter Email */}
      {step === 'email' && (
        <form onSubmit={handleSendCode} className="space-y-4">
          <div>
            <label
              htmlFor="reset-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Account Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            id="send-reset-code-btn"
            disabled={isSubmitting || !email.trim()}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Send Security Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: Enter 6-Digit OTP */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          {/* Simulated Email Delivery Banner */}
          <div
            id="simulated-otp-banner"
            className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200/80 text-xs text-indigo-900"
          >
            <div className="flex items-center justify-between font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-indigo-800">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Simulated Email Inbox
              </span>
              <button
                type="button"
                id="auto-fill-otp-btn"
                onClick={fillSimulatedOtp}
                className="text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-0.5 rounded-md font-medium transition-colors"
              >
                Auto-fill Code
              </button>
            </div>
            <p className="text-slate-600">
              Your one-time recovery verification code is:{' '}
              <span className="font-mono font-bold tracking-widest text-indigo-900 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                {simulatedOtp}
              </span>
            </p>
          </div>

          {/* 6 Digit Input Boxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
              Enter 6-Digit Security Code
            </label>
            <div className="flex items-center justify-center gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputsRef.current[idx] = el)}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-12 text-center text-lg font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            id="verify-otp-btn"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Verify & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* STEP 3: Set New Password */}
      {step === 'new-password' && (
        <form onSubmit={handleSaveNewPassword} className="space-y-4">
          <div>
            <label
              htmlFor="new-pass-input"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="new-pass-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {newPassword.length > 0 && (
              <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <PasswordStrengthBar strength={strength} showCriteria={true} />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-new-pass-input"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="confirm-new-pass-input"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
              />
            </div>
            {confirmPassword.length > 0 && (
              <p className={`text-[11px] mt-1 font-medium ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
              </p>
            )}
          </div>

          <button
            type="submit"
            id="save-new-password-btn"
            disabled={isSubmitting || !passwordsMatch || strength.score < 2}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 4: Success Done */}
      {step === 'done' && (
        <div className="text-center py-4 space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Password Changed Successfully
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              You can now sign in with your updated credentials.
            </p>
          </div>
          <button
            type="button"
            id="reset-back-to-signin-btn"
            onClick={() => onSwitchMode('signin')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all cursor-pointer"
          >
            Return to Sign In
          </button>
        </div>
      )}

      {/* Back to Sign In Link */}
      {step !== 'done' && (
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <button
            type="button"
            id="forgot-back-to-signin"
            onClick={() => onSwitchMode('signin')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </button>
        </div>
      )}
    </div>
  );
};
