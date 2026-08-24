import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Smartphone, Key, ArrowRight, ArrowLeft, RefreshCw, AlertCircle, Copy, Check } from 'lucide-react';
import { User, AuthMode } from '../types';
import { getSimulatedTotpCode } from '../utils/authStorage';

interface TwoFactorModalProps {
  user: User;
  onVerifySuccess: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  user,
  onVerifySuccess,
  onCancel,
  isLoading,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [totpData, setTotpData] = useState<{ code: string; secondsRemaining: number }>({
    code: '123456',
    secondsRemaining: 30,
  });
  const [copied, setCopied] = useState(false);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Update simulated TOTP code and countdown every second
  useEffect(() => {
    const update = () => {
      setTotpData(getSimulatedTotpCode(user.twoFactorSecret || 'JBSWY3DPEHPK3PXP'));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [user.twoFactorSecret]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (useBackupCode) {
      if (backupCode.trim().length < 8) {
        setErrorMessage('Please enter an 8-character backup code');
        return;
      }
      // Accept backup code
      onVerifySuccess();
      return;
    }

    const entered = digits.join('');
    if (entered.length !== 6) {
      setErrorMessage('Please enter all 6 digits');
      return;
    }

    // Accept valid dynamic code or standard test codes 123456 / 000000
    if (entered === totpData.code || entered === '123456' || entered === '000000') {
      onVerifySuccess();
    } else {
      setErrorMessage(`Incorrect code. Check the simulated authenticator code.`);
    }
  };

  const handleAutoFill = () => {
    setDigits(totpData.code.split(''));
    setErrorMessage(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(totpData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="two-factor-screen"
      className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-3 shadow-md shadow-slate-900/10">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Two-Factor Authentication
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verification required for <span className="font-semibold text-slate-800">{user.email}</span>
        </p>
      </div>

      {/* Simulated Authenticator App Helper Box */}
      <div
        id="authenticator-simulator-box"
        className="mb-5 p-3.5 rounded-xl bg-slate-900 text-white shadow-md relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            Simulated Authenticator App
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-indigo-300">
              {totpData.secondsRemaining}s
            </span>
            <div className="w-4 h-4 rounded-full border-2 border-indigo-400/40 border-t-indigo-400 animate-spin" />
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-800/80 px-3 py-2 rounded-lg border border-slate-700">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
              Current OTP Code
            </span>
            <span className="font-mono text-xl font-bold tracking-widest text-white">
              {totpData.code.slice(0, 3)} {totpData.code.slice(3)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="totp-copy-btn"
              onClick={handleCopyCode}
              className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-slate-200 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              id="totp-autofill-btn"
              onClick={handleAutoFill}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              Auto-fill
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleVerify} className="space-y-5">
        {!useBackupCode ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
              Enter 6-Digit Authenticator Code
            </label>
            <div className="flex items-center justify-center gap-2">
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  id={`totp-digit-${i}`}
                  type="text"
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-12 text-center text-lg font-bold font-mono bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all"
                />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label
              htmlFor="backup-code-input"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              8-Character Emergency Backup Code
            </label>
            <input
              id="backup-code-input"
              type="text"
              required
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
              placeholder="A1B2-C3D4"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: For testing, any 8+ characters (e.g. BACKUP01) will verify.
            </p>
          </div>
        )}

        <button
          type="submit"
          id="verify-totp-submit-btn"
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Toggle Backup Code Mode */}
        <div className="text-center pt-2">
          <button
            type="button"
            id="toggle-backup-code-mode"
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setErrorMessage(null);
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {useBackupCode ? 'Use 6-digit authenticator code instead' : 'Lost device? Use emergency backup code'}
          </button>
        </div>
      </form>

      {/* Cancel button */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <button
          type="button"
          id="totp-cancel-btn"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel & Return to Sign In
        </button>
      </div>
    </div>
  );
};
