import React, { useState } from 'react';
import { Mail, Sparkles, ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { AuthMode } from '../types';

interface MagicLinkCardProps {
  onMagicLinkAuth: (email: string) => void;
  onSwitchMode: (mode: AuthMode) => void;
}

export const MagicLinkCard: React.FC<MagicLinkCardProps> = ({
  onMagicLinkAuth,
  onSwitchMode,
}) => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [simulatedToken, setSimulatedToken] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSimulatedToken(`ml_${Math.random().toString(36).substring(2, 12)}`);
      setIsSent(true);
    }, 600);
  };

  const handleActivateMagicLink = () => {
    onMagicLinkAuth(email);
  };

  return (
    <div
      id="magic-link-card"
      className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 mb-3 border border-amber-200 shadow-sm">
          <Sparkles className="w-6 h-6 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Passwordless Sign In
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Sign in instantly with a secure single-use magic link
        </p>
      </div>

      {!isSent ? (
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label
              htmlFor="magic-link-email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Work Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="magic-link-email"
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
            id="send-magic-link-btn"
            disabled={isLoading || !email.trim()}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-md shadow-slate-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Send Magic Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          {/* Simulated Email Notification */}
          <div
            id="magic-link-simulated-box"
            className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-slate-800 space-y-3"
          >
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Simulated Inbox Message</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-amber-200/70 text-xs space-y-2">
              <p className="text-slate-600">
                To: <span className="font-semibold text-slate-900">{email}</span>
              </p>
              <p className="text-slate-700">
                Click below to sign in to your AuthSuite account without entering a password.
              </p>
              <button
                type="button"
                id="activate-magic-link-btn"
                onClick={handleActivateMagicLink}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Authorize & Sign In Instantly
              </button>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Token: <span className="font-mono text-slate-600">{simulatedToken}</span> (Valid for 15 mins)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsSent(false)}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium block mx-auto text-center"
          >
            Use a different email address
          </button>
        </div>
      )}

      {/* Back to standard login */}
      <div className="mt-6 pt-4 border-t border-slate-100 text-center">
        <button
          type="button"
          id="magic-back-to-signin"
          onClick={() => onSwitchMode('signin')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Password Sign In
        </button>
      </div>
    </div>
  );
};
