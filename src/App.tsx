/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Session,
  SecurityLog,
  AuthMode,
  ToastMessage,
} from './types';
import {
  getCurrentUser,
  setCurrentUser,
  getStoredUsers,
  saveStoredUsers,
  getStoredSessions,
  saveStoredSessions,
  revokeSession,
  revokeAllOtherSessions,
  getSecurityLogs,
  addSecurityLog,
  getFailedAttempts,
  recordFailedAttempt,
  resetFailedAttempts,
  INITIAL_USERS,
} from './utils/authStorage';
import { Navbar } from './components/Navbar';
import { SignInCard } from './components/SignInCard';
import { SignUpCard } from './components/SignUpCard';
import { ForgotPasswordCard } from './components/ForgotPasswordCard';
import { MagicLinkCard } from './components/MagicLinkCard';
import { TwoFactorModal } from './components/TwoFactorModal';
import { Dashboard } from './components/Dashboard';
import { ToastContainer } from './components/Toast';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  KeyRound,
  FileText,
  Terminal,
  Activity,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => getCurrentUser());
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [pending2FAUser, setPending2FAUser] = useState<User | null>(null);
  const [activeDashboardTab, setActiveDashboardTab] = useState<string>('profile');

  const [sessions, setSessions] = useState<Session[]>(() => getStoredSessions(currentUser?.id));
  const [logs, setLogs] = useState<SecurityLog[]>(() => getSecurityLogs());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // Toast dispatch
  const showToast = useCallback(
    (type: ToastMessage['type'], title: string, message?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync sessions & logs on user change
  useEffect(() => {
    if (currentUser) {
      setSessions(getStoredSessions(currentUser.id));
      setLogs(getSecurityLogs());
    }
  }, [currentUser]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds && lockoutSeconds > 0) {
      const timer = setInterval(() => {
        setLockoutSeconds((prev) => (prev && prev > 1 ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutSeconds]);

  // Login handler
  const handleSignIn = (email: string, pass: string, rememberMe: boolean) => {
    setIsLoading(true);
    setErrorMessage(null);

    // Check rate limiting
    const lockCheck = getFailedAttempts(email);
    if (lockCheck.lockedUntil && Date.now() < lockCheck.lockedUntil) {
      setIsLoading(false);
      const secs = Math.ceil((lockCheck.lockedUntil - Date.now()) / 1000);
      setLockoutSeconds(secs);
      setErrorMessage(`Account temporarily locked for ${secs}s due to failed attempts.`);
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      const users = getStoredUsers();
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );

      if (!user || user.passwordHash !== pass) {
        const attempt = recordFailedAttempt(email);
        addSecurityLog({
          userEmail: email,
          action: 'FAILED_LOGIN',
          details: 'Failed login attempt: incorrect password credentials',
          ip: '192.0.2.105',
          status: 'danger',
        });
        setLogs(getSecurityLogs());

        if (attempt.lockedUntil) {
          setLockoutSeconds(60);
          setErrorMessage('Too many failed attempts. Account locked for 60 seconds.');
          showToast('error', 'Account Locked', '5 consecutive failed attempts.');
        } else {
          setErrorMessage(
            `Invalid email or password. (${5 - attempt.count} attempts left before lockout)`
          );
          showToast('error', 'Sign In Failed', 'Please check your credentials.');
        }
        return;
      }

      // Success credential check
      resetFailedAttempts(email);

      // Check if 2FA is required
      if (user.twoFactorEnabled) {
        setPending2FAUser(user);
        setAuthMode('two-factor');
        showToast('info', '2FA Required', 'Please enter your 6-digit authenticator code.');
        return;
      }

      // Complete login directly
      finalizeLogin(user, 'LOGIN', 'Standard password sign in');
    }, 600);
  };

  const finalizeLogin = (user: User, action: SecurityLog['action'], details: string) => {
    const updatedUser: User = {
      ...user,
      lastLoginAt: new Date().toISOString(),
    };
    setCurrentUserState(updatedUser);
    setCurrentUser(updatedUser);

    // Add session
    const currentSessions = getStoredSessions();
    const newSession: Session = {
      id: `sess-${Date.now()}`,
      userId: user.id,
      device: 'MacBook Pro (Chrome)',
      browser: 'Chrome 128.0',
      os: 'macOS Sonoma',
      ip: '192.0.2.45',
      location: 'San Francisco, CA, US',
      isCurrent: true,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    const updatedSessions = [
      newSession,
      ...currentSessions.map((s) => ({ ...s, isCurrent: false })),
    ];
    saveStoredSessions(updatedSessions);
    setSessions(updatedSessions.filter((s) => s.userId === user.id));

    // Add audit log
    addSecurityLog({
      userId: user.id,
      userEmail: user.email,
      action,
      details,
      ip: '192.0.2.45',
      status: 'success',
    });
    setLogs(getSecurityLogs());

    setPending2FAUser(null);
    showToast('success', `Welcome back, ${user.name}!`, `Signed in as ${user.role}.`);
  };

  // Quick One-Click Demo Login
  const handleQuickLogin = (presetUser: typeof INITIAL_USERS[0]) => {
    if (presetUser.twoFactorEnabled) {
      setPending2FAUser(presetUser);
      setAuthMode('two-factor');
      showToast('info', '2FA Verification', `Enter test OTP for ${presetUser.name}`);
    } else {
      finalizeLogin(presetUser, 'LOGIN', `One-click demo sign-in as ${presetUser.role}`);
    }
  };

  // 2FA Verification success
  const handle2FASuccess = () => {
    if (!pending2FAUser) return;
    finalizeLogin(
      pending2FAUser,
      'LOGIN',
      'Authenticated successfully with 2FA TOTP code'
    );
  };

  // Magic Link verification
  const handleMagicLinkAuth = (email: string) => {
    const users = getStoredUsers();
    let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Auto-create user for frictionless magic link testing
      const newUser = {
        id: `user-${Date.now()}`,
        email: email.toLowerCase(),
        name: email.split('@')[0].replace('.', ' '),
        role: 'member' as const,
        avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        emailVerified: true,
        status: 'active' as const,
        passwordHash: 'Password@123',
      };
      saveStoredUsers([newUser, ...users]);
      user = newUser;
    }

    finalizeLogin(user, 'MAGIC_LINK_LOGIN', 'Signed in via secure magic link token');
  };

  // Registration handler
  const handleSignUp = (data: {
    name: string;
    email: string;
    password: string;
    role: User['role'];
    enable2FA: boolean;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const users = getStoredUsers();
      if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        setErrorMessage('An account with this email already exists.');
        showToast('error', 'Registration Failed', 'Email is already registered.');
        return;
      }

      const newUser: User & { passwordHash: string } = {
        id: `user-${Date.now()}`,
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role,
        avatarUrl:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        twoFactorEnabled: data.enable2FA,
        twoFactorSecret: data.enable2FA ? 'JBSWY3DPEHPK3PXP' : undefined,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        emailVerified: true,
        status: 'active',
        passwordHash: data.password,
      };

      const updated = [newUser, ...users];
      saveStoredUsers(updated);

      addSecurityLog({
        userId: newUser.id,
        userEmail: newUser.email,
        action: 'REGISTRATION',
        details: `Account created with role ${newUser.role}`,
        ip: '192.0.2.45',
        status: 'success',
      });

      if (data.enable2FA) {
        setPending2FAUser(newUser);
        setAuthMode('two-factor');
        showToast('success', 'Account Created', 'Please complete your initial 2FA verification.');
      } else {
        finalizeLogin(newUser, 'LOGIN', 'Initial registration login');
        showToast('success', 'Account Created!', 'Welcome to AuthSuite.');
      }
    }, 700);
  };

  // Password reset success
  const handleResetPasswordSuccess = (email: string, newPass: string) => {
    const users = getStoredUsers();
    const updated = users.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, passwordHash: newPass };
      }
      return u;
    });
    saveStoredUsers(updated);

    addSecurityLog({
      userEmail: email,
      action: 'PASSWORD_CHANGE',
      details: 'Password reset via email OTP verification code',
      ip: '192.0.2.45',
      status: 'success',
    });
    setLogs(getSecurityLogs());
    showToast('success', 'Password Updated', 'You can now sign in with your new password.');
  };

  // Update profile
  const handleUpdateUser = (updatedFields: Partial<User>) => {
    if (!currentUser) return;
    const users = getStoredUsers();
    const updatedUser: User = { ...currentUser, ...updatedFields };
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? { ...u, ...updatedFields } : u));

    saveStoredUsers(updatedUsers);
    setCurrentUserState(updatedUser);
    setCurrentUser(updatedUser);

    if (updatedFields.twoFactorEnabled !== undefined) {
      addSecurityLog({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: updatedFields.twoFactorEnabled ? '2FA_ENABLED' : '2FA_DISABLED',
        details: updatedFields.twoFactorEnabled
          ? 'Two-factor authentication enabled'
          : 'Two-factor authentication disabled',
        ip: '192.0.2.45',
        status: updatedFields.twoFactorEnabled ? 'success' : 'warning',
      });
    } else {
      addSecurityLog({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: 'PROFILE_UPDATED',
        details: 'User profile metadata updated',
        ip: '192.0.2.45',
        status: 'success',
      });
    }

    setLogs(getSecurityLogs());
    showToast('success', 'Profile Updated', 'Your changes have been saved.');
  };

  // Change password in dashboard
  const handleChangePassword = (oldPass: string, newPass: string): boolean => {
    if (!currentUser) return false;
    const users = getStoredUsers();
    const user = users.find((u) => u.id === currentUser.id);
    if (!user || user.passwordHash !== oldPass) {
      addSecurityLog({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: 'PASSWORD_CHANGE',
        details: 'Failed password update attempt: current password incorrect',
        ip: '192.0.2.45',
        status: 'danger',
      });
      setLogs(getSecurityLogs());
      return false;
    }

    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, passwordHash: newPass } : u
    );
    saveStoredUsers(updatedUsers);

    addSecurityLog({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'PASSWORD_CHANGE',
      details: 'Password changed successfully from settings panel',
      ip: '192.0.2.45',
      status: 'success',
    });
    setLogs(getSecurityLogs());
    showToast('success', 'Password Changed', 'Security credentials updated.');
    return true;
  };

  // Revoke single session
  const handleRevokeSession = (sessionId: string) => {
    const updated = revokeSession(sessionId);
    setSessions(updated.filter((s) => s.userId === currentUser?.id));
    addSecurityLog({
      userId: currentUser?.id,
      userEmail: currentUser?.email || '',
      action: 'SESSION_REVOKED',
      details: `Session ID ${sessionId} was revoked`,
      ip: '192.0.2.45',
      status: 'warning',
    });
    setLogs(getSecurityLogs());
    showToast('info', 'Session Revoked', 'The device has been disconnected.');
  };

  // Revoke all other sessions
  const handleRevokeAllOtherSessions = () => {
    if (!currentUser) return;
    const currentSession = sessions.find((s) => s.isCurrent);
    if (!currentSession) return;
    const updated = revokeAllOtherSessions(currentUser.id, currentSession.id);
    setSessions(updated.filter((s) => s.userId === currentUser.id));

    addSecurityLog({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'SESSION_REVOKED',
      details: 'All other active sessions revoked',
      ip: '192.0.2.45',
      status: 'warning',
    });
    setLogs(getSecurityLogs());
    showToast('info', 'Sessions Revoked', 'All other devices have been signed out.');
  };

  // Logout
  const handleLogout = () => {
    if (currentUser) {
      addSecurityLog({
        userId: currentUser.id,
        userEmail: currentUser.email,
        action: 'LOGOUT',
        details: 'User logged out normally',
        ip: '192.0.2.45',
        status: 'success',
      });
    }
    setCurrentUserState(null);
    setCurrentUser(null);
    setAuthMode('signin');
    setPending2FAUser(null);
    showToast('info', 'Signed Out', 'You have been safely signed out.');
  };

  // Switch persona from dashboard
  const handleSwitchUser = (user: typeof INITIAL_USERS[0]) => {
    finalizeLogin(user, 'LOGIN', `Switched active persona to ${user.role}`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        authMode={authMode}
        onSelectMode={(mode) => {
          setErrorMessage(null);
          setAuthMode(mode);
        }}
        onLogout={handleLogout}
        activeDashboardTab={activeDashboardTab}
        onSelectDashboardTab={setActiveDashboardTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {currentUser ? (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <Dashboard
                currentUser={currentUser}
                onUpdateUser={handleUpdateUser}
                sessions={sessions}
                onRevokeSession={handleRevokeSession}
                onRevokeAllOtherSessions={handleRevokeAllOtherSessions}
                logs={logs}
                onChangePassword={handleChangePassword}
                onLogout={handleLogout}
                onSwitchUser={handleSwitchUser}
                activeTab={activeDashboardTab}
                setActiveTab={setActiveDashboardTab}
              />
            </motion.div>
          ) : authMode === 'two-factor' && pending2FAUser ? (
            <motion.div
              key="2fa-view"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <TwoFactorModal
                user={pending2FAUser}
                onVerifySuccess={handle2FASuccess}
                onCancel={() => {
                  setPending2FAUser(null);
                  setAuthMode('signin');
                }}
                isLoading={isLoading}
              />
            </motion.div>
          ) : authMode === 'signup' ? (
            <motion.div
              key="signup-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <SignUpCard
                onSignUp={handleSignUp}
                onSwitchMode={(mode) => {
                  setErrorMessage(null);
                  setAuthMode(mode);
                }}
                isLoading={isLoading}
                errorMessage={errorMessage}
              />
            </motion.div>
          ) : authMode === 'forgot-password' ? (
            <motion.div
              key="forgot-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <ForgotPasswordCard
                onResetPasswordSuccess={handleResetPasswordSuccess}
                onSwitchMode={(mode) => {
                  setErrorMessage(null);
                  setAuthMode(mode);
                }}
              />
            </motion.div>
          ) : authMode === 'magic-link' ? (
            <motion.div
              key="magic-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <MagicLinkCard
                onMagicLinkAuth={handleMagicLinkAuth}
                onSwitchMode={(mode) => {
                  setErrorMessage(null);
                  setAuthMode(mode);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="signin-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              <SignInCard
                onSignIn={handleSignIn}
                onSwitchMode={(mode) => {
                  setErrorMessage(null);
                  setAuthMode(mode);
                }}
                isLoading={isLoading}
                errorMessage={errorMessage}
                lockoutSeconds={lockoutSeconds}
                onQuickLogin={handleQuickLogin}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Security Architecture Highlights Footer */}
      <footer className="border-t border-slate-200 bg-white/70 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">
              AuthSuite Enterprise Security
            </span>
            <span>—</span>
            <span>TOTP RFC 6238 • RBAC Authorization • Brute-Force Rate Limiting</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Local Storage Encrypted Simulation</span>
            <span>•</span>
            <span>OWASP Session Standards</span>
          </div>
        </div>
      </footer>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
