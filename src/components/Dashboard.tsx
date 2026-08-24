import React, { useState, useMemo } from 'react';
import {
  User,
  Session,
  SecurityLog,
  UserRole,
} from '../types';
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Activity,
  User as UserIcon,
  Laptop,
  Tablet,
  Globe,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Download,
  Search,
  LogOut,
  Sparkles,
  Zap,
  Sliders,
} from 'lucide-react';
import {
  evaluatePasswordStrength,
  getSimulatedTotpCode,
  INITIAL_USERS,
} from '../utils/authStorage';
import { PasswordStrengthBar } from './PasswordStrengthBar';

interface DashboardProps {
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  sessions: Session[];
  onRevokeSession: (sessionId: string) => void;
  onRevokeAllOtherSessions: () => void;
  logs: SecurityLog[];
  onChangePassword: (oldPass: string, newPass: string) => boolean;
  onLogout: () => void;
  onSwitchUser: (user: typeof INITIAL_USERS[0]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  onUpdateUser,
  sessions,
  onRevokeSession,
  onRevokeAllOtherSessions,
  logs,
  onChangePassword,
  onLogout,
  onSwitchUser,
  activeTab,
  setActiveTab,
}) => {
  // Profile state
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl);
  const [profileSaved, setProfileSaved] = useState(false);

  // Change password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);

  // 2FA Setup state
  const [show2FASetupModal, setShow2FASetupModal] = useState(false);
  const [setupTotpCode, setSetupTotpCode] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Logs filter & search
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState<string>('ALL');

  const strength = useMemo(() => evaluatePasswordStrength(newPass), [newPass]);

  // Profile save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name: displayName, avatarUrl });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Change Password
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (!currentPass) {
      setPassError('Please enter your current password');
      return;
    }
    if (strength.score < 2) {
      setPassError('New password does not meet security requirements');
      return;
    }
    if (newPass !== confirmNewPass) {
      setPassError('New passwords do not match');
      return;
    }

    const success = onChangePassword(currentPass, newPass);
    if (success) {
      setPassSuccess(true);
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
      setTimeout(() => setPassSuccess(false), 3000);
    } else {
      setPassError('Current password is incorrect');
    }
  };

  // 2FA Enable flow
  const handleStart2FASetup = () => {
    const dummySecret = currentUser.twoFactorSecret || 'JBSWY3DPEHPK3PXP';
    onUpdateUser({ twoFactorSecret: dummySecret });
    setSetupTotpCode('');
    setSetupError(null);
    setShow2FASetupModal(true);
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    const liveTotp = getSimulatedTotpCode(currentUser.twoFactorSecret || 'JBSWY3DPEHPK3PXP').code;
    if (setupTotpCode === liveTotp || setupTotpCode === '123456' || setupTotpCode === '000000') {
      onUpdateUser({ twoFactorEnabled: true });
      setShow2FASetupModal(false);
      // Generate emergency backup codes
      const generated = Array.from({ length: 6 }, () =>
        Math.random().toString(36).substring(2, 6).toUpperCase() +
        '-' +
        Math.random().toString(36).substring(2, 6).toUpperCase()
      );
      setBackupCodes(generated);
      setShowBackupCodes(true);
    } else {
      setSetupError('Invalid code. Please enter the current code shown in the simulation box.');
    }
  };

  const handleDisable2FA = () => {
    if (confirm('Are you sure you want to disable Two-Factor Authentication?')) {
      onUpdateUser({ twoFactorEnabled: false });
    }
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.ip.includes(logSearch);
      const matchesAction =
        logActionFilter === 'ALL' || log.action === logActionFilter;
      return matchesSearch && matchesAction;
    });
  }, [logs, logSearch, logActionFilter]);

  // Export audit logs as JSON
  const handleExportLogs = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `security_audit_logs_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div id="dashboard-container" className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner / Account Profile Snapshot */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">
                {currentUser.name}
              </h2>
              <span
                className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full ${
                  currentUser.role === 'admin'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : currentUser.role === 'developer'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {currentUser.role}
              </span>
              {currentUser.emailVerified && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>{currentUser.email}</span>
              <span>•</span>
              <span>User ID: <span className="font-mono">{currentUser.id}</span></span>
            </p>
          </div>
        </div>

        {/* Quick Persona Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="text-left md:text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Test Personas
            </span>
            <span className="text-xs text-slate-600">Switch account role:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {INITIAL_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                id={`switch-persona-${user.role}`}
                onClick={() => onSwitchUser(user)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  currentUser.email === user.email
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {user.role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'profile', label: 'Profile', icon: UserIcon },
          { id: 'security', label: 'Security & 2FA', icon: KeyRound },
          { id: 'sessions', label: 'Sessions', icon: Smartphone },
          { id: 'logs', label: 'Audit Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit Profile Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Profile Information
                </h3>
                <p className="text-xs text-slate-500">
                  Update your public display name and avatar
                </p>
              </div>
              {profileSaved && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Saved
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Choose Avatar
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {avatarOptions.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatarUrl(url)}
                      className={`relative rounded-xl overflow-hidden ring-2 transition-all p-0.5 ${
                        avatarUrl === url
                          ? 'ring-slate-900 scale-105 shadow-md'
                          : 'ring-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={url}
                        alt={`Avatar option ${i + 1}`}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      {avatarUrl === url && (
                        <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="save-profile-btn"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Role & Permissions Matrix Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Role Permissions
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Assigned RBAC capability matrix
              </p>

              <div className="space-y-2.5">
                {[
                  {
                    name: 'Read Project Assets',
                    allowed: true,
                    roles: 'All roles',
                  },
                  {
                    name: 'Write & Edit Documents',
                    allowed: currentUser.role !== 'member',
                    roles: 'Developer & Admin',
                  },
                  {
                    name: 'Manage API Keys & Secrets',
                    allowed: currentUser.role !== 'member',
                    roles: 'Developer & Admin',
                  },
                  {
                    name: 'User Provisioning & IAM',
                    allowed: currentUser.role === 'admin',
                    roles: 'Admin Only',
                  },
                  {
                    name: 'Security Audit Log Export',
                    allowed: currentUser.role === 'admin',
                    roles: 'Admin Only',
                  },
                ].map((perm, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800 block">
                        {perm.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {perm.roles}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        perm.allowed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {perm.allowed ? 'GRANTED' : 'RESTRICTED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900">
              <span className="font-semibold block mb-0.5">Need elevated privileges?</span>
              <p className="text-[11px] text-slate-600">
                Contact your organization admin or use the tester switcher above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECURITY & 2FA */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Two-Factor Authentication Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-xs text-slate-500">
                      TOTP Authenticator app verification
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    currentUser.twoFactorEnabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {currentUser.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-5">
                Two-factor authentication adds an extra layer of security to your
                account. In addition to your password, you will be prompted for
                a 6-digit verification code from Google Authenticator, Authy, or
                1Password when signing in.
              </p>

              {currentUser.twoFactorEnabled ? (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your account is protected by 2FA</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Secret Key:{' '}
                    <span className="font-mono font-bold text-slate-800">
                      {currentUser.twoFactorSecret || 'JBSWY3DPEHPK3PXP'}
                    </span>
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1 mb-4">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>2FA is not enabled</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Enable 2FA to protect your account against unauthorized logins.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              {currentUser.twoFactorEnabled ? (
                <button
                  type="button"
                  id="disable-2fa-btn"
                  onClick={handleDisable2FA}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  type="button"
                  id="enable-2fa-btn"
                  onClick={handleStart2FASetup}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Configure 2FA Authenticator
                </button>
              )}
            </div>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Update Password
                </h3>
                <p className="text-xs text-slate-500">
                  Ensure your account uses a strong, unique password
                </p>
              </div>
            </div>

            {passError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {passError}
              </div>
            )}
            {passSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Password updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Tip: Test accounts use <span className="font-mono font-semibold">Admin@123</span> or <span className="font-mono font-semibold">DevPass@123</span>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                {newPass.length > 0 && (
                  <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <PasswordStrengthBar strength={strength} showCriteria={false} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  id="change-password-submit-btn"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACTIVE SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Active Devices & Sessions
              </h3>
              <p className="text-xs text-slate-500">
                You are currently signed in to {sessions.length} active sessions
              </p>
            </div>
            {sessions.filter((s) => !s.isCurrent).length > 0 && (
              <button
                type="button"
                id="revoke-all-sessions-btn"
                onClick={onRevokeAllOtherSessions}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 self-start cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Revoke All Other Sessions
              </button>
            )}
          </div>

          <div className="space-y-3">
            {sessions.map((sess) => {
              let DeviceIcon = Laptop;
              if (sess.device.includes('iPhone') || sess.device.includes('Android')) {
                DeviceIcon = Smartphone;
              } else if (sess.device.includes('iPad') || sess.device.includes('Tablet')) {
                DeviceIcon = Tablet;
              }

              return (
                <div
                  key={sess.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    sess.isCurrent
                      ? 'border-indigo-200 bg-indigo-50/40'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        sess.isCurrent
                          ? 'bg-slate-900 text-indigo-400'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      <DeviceIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900">
                          {sess.device}
                        </span>
                        {sess.isCurrent && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                            Current Device
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {sess.browser} on {sess.os}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          {sess.location} ({sess.ip})
                        </span>
                        <span>•</span>
                        <span>
                          Active: {new Date(sess.lastActiveAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      type="button"
                      onClick={() => onRevokeSession(sess.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors self-end sm:self-center cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Security Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Tamper-evident record of authentication and account operations
              </p>
            </div>
            <button
              type="button"
              id="export-logs-btn"
              onClick={handleExportLogs}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 self-start cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search action, IP, or details..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'LOGIN', 'PASSWORD_CHANGE', '2FA_ENABLED', 'FAILED_LOGIN'].map((act) => (
                <button
                  key={act}
                  type="button"
                  onClick={() => setLogActionFilter(act)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                    logActionFilter === act
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {act}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3.5">Action</th>
                  <th className="py-2.5 px-3.5">Details</th>
                  <th className="py-2.5 px-3.5">IP Address</th>
                  <th className="py-2.5 px-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3.5">
                        <span
                          className={`inline-block font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
                            log.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-700 font-medium">
                        {log.details}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-500">
                        {log.ip}
                      </td>
                      <td className="py-3 px-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-400">
                      No security logs matching search filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2FA SETUP MODAL */}
      {show2FASetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-indigo-400 mx-auto flex items-center justify-center mb-2">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Setup Authenticator App
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Scan the QR code or enter the secret key into Google Authenticator
              </p>
            </div>

            {/* Simulated QR Code Canvas */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-3">
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl shadow-xs border border-slate-200 flex flex-col items-center justify-center gap-1">
                <div className="grid grid-cols-6 gap-1 w-28 h-28 p-1 bg-slate-900 rounded-lg">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-xs ${
                        (i % 2 === 0 && i % 3 === 0) || i === 0 || i === 5 || i === 30 || i === 35
                          ? 'bg-white'
                          : 'bg-indigo-400'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="text-xs">
                <span className="text-slate-500 block mb-1">Base32 Secret Key</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200">
                    {currentUser.twoFactorSecret || 'JBSWY3DPEHPK3PXP'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(currentUser.twoFactorSecret || 'JBSWY3DPEHPK3PXP');
                      setCopiedSecret(true);
                      setTimeout(() => setCopiedSecret(false), 2000);
                    }}
                    className="p-1.5 bg-white border border-slate-200 rounded text-slate-600 hover:text-slate-900"
                    title="Copy Secret"
                  >
                    {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Test Simulated Code Helper */}
            <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="text-indigo-800 font-semibold block">Simulated Code:</span>
                <span className="font-mono font-bold text-indigo-950">
                  {getSimulatedTotpCode(currentUser.twoFactorSecret || 'JBSWY3DPEHPK3PXP').code}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSetupTotpCode(
                    getSimulatedTotpCode(currentUser.twoFactorSecret || 'JBSWY3DPEHPK3PXP').code
                  );
                  setSetupError(null);
                }}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-semibold"
              >
                Auto-fill Code
              </button>
            </div>

            {setupError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {setupError}
              </div>
            )}

            <form onSubmit={handleConfirm2FA} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enter 6-Digit Code from App
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={setupTotpCode}
                  onChange={(e) => setSetupTotpCode(e.target.value)}
                  placeholder="123456"
                  className="w-full text-center tracking-widest font-mono text-lg font-bold py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShow2FASetupModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="confirm-enable-2fa-btn"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Verify & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BACKUP CODES MODAL */}
      {showBackupCodes && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                2FA Enabled! Save Your Backup Codes
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                If you lose access to your authenticator device, each code can be used once.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 text-center">
              {backupCodes.map((code, idx) => (
                <div key={idx} className="bg-white p-2 rounded border border-slate-200">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join('\n'));
                  alert('Backup codes copied to clipboard!');
                }}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Codes
              </button>
              <button
                type="button"
                onClick={() => setShowBackupCodes(false)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
