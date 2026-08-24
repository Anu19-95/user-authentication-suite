import { User, Session, SecurityLog, PasswordStrength } from '../types';

const USERS_KEY = 'auth_suite_users_v1';
const SESSIONS_KEY = 'auth_suite_sessions_v1';
const LOGS_KEY = 'auth_suite_logs_v1';
const CURRENT_USER_KEY = 'auth_suite_current_user_v1';
const FAILED_ATTEMPTS_KEY = 'auth_suite_failed_attempts_v1';

export const INITIAL_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user-admin-1',
    email: 'admin@company.com',
    name: 'Alexandra Vance',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    twoFactorEnabled: true,
    twoFactorSecret: 'JBSWY3DPEHPK3PXP',
    createdAt: '2025-01-15T08:30:00Z',
    lastLoginAt: new Date().toISOString(),
    emailVerified: true,
    status: 'active',
    passwordHash: 'Admin@123',
  },
  {
    id: 'user-dev-2',
    email: 'dev@company.com',
    name: 'Marcus Brody',
    role: 'developer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    twoFactorEnabled: false,
    createdAt: '2025-02-10T11:15:00Z',
    lastLoginAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    emailVerified: true,
    status: 'active',
    passwordHash: 'DevPass@123',
  },
  {
    id: 'user-member-3',
    email: 'member@company.com',
    name: 'Elena Rostova',
    role: 'member',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    twoFactorEnabled: false,
    createdAt: '2025-03-01T14:20:00Z',
    lastLoginAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    emailVerified: true,
    status: 'active',
    passwordHash: 'Member@123',
  },
];

export const INITIAL_SESSIONS: Session[] = [
  {
    id: 'sess-current-1',
    userId: 'user-admin-1',
    device: 'MacBook Pro 16"',
    browser: 'Chrome 128.0',
    os: 'macOS Sonoma',
    ip: '192.0.2.45',
    location: 'San Francisco, CA, US',
    isCurrent: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    lastActiveAt: new Date().toISOString(),
  },
  {
    id: 'sess-mobile-2',
    userId: 'user-admin-1',
    device: 'iPhone 15 Pro',
    browser: 'Mobile Safari 17.4',
    os: 'iOS 17.4',
    ip: '198.51.100.12',
    location: 'San Francisco, CA, US',
    isCurrent: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'sess-tablet-3',
    userId: 'user-admin-1',
    device: 'iPad Air',
    browser: 'Safari 17.1',
    os: 'iPadOS 17.1',
    ip: '203.0.113.88',
    location: 'San Jose, CA, US',
    isCurrent: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
];

export const INITIAL_LOGS: SecurityLog[] = [
  {
    id: 'log-1',
    userId: 'user-admin-1',
    userEmail: 'admin@company.com',
    action: 'LOGIN',
    details: 'Successful login with password and 2FA authentication',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    ip: '192.0.2.45',
    status: 'success',
  },
  {
    id: 'log-2',
    userId: 'user-admin-1',
    userEmail: 'admin@company.com',
    action: '2FA_ENABLED',
    details: 'Two-factor authenticator app enabled',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    ip: '192.0.2.45',
    status: 'success',
  },
  {
    id: 'log-3',
    userEmail: 'admin@company.com',
    action: 'FAILED_LOGIN',
    details: 'Failed sign-in attempt (incorrect password)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    ip: '45.33.32.156',
    status: 'warning',
  },
  {
    id: 'log-4',
    userId: 'user-admin-1',
    userEmail: 'admin@company.com',
    action: 'PASSWORD_CHANGE',
    details: 'Password was updated securely',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    ip: '192.0.2.45',
    status: 'success',
  },
];

// Helper to get or init stored users
export function getStoredUsers(): (User & { passwordHash: string })[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

export function saveStoredUsers(users: (User & { passwordHash: string })[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Current logged in user
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

// Sessions
export function getStoredSessions(userId?: string): Session[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    const sessions: Session[] = raw ? JSON.parse(raw) : INITIAL_SESSIONS;
    if (userId) {
      return sessions.filter((s) => s.userId === userId);
    }
    return sessions;
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function saveStoredSessions(sessions: Session[]) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function revokeSession(sessionId: string): Session[] {
  const sessions = getStoredSessions().filter((s) => s.id !== sessionId);
  saveStoredSessions(sessions);
  return sessions;
}

export function revokeAllOtherSessions(userId: string, currentSessionId: string): Session[] {
  const sessions = getStoredSessions().filter(
    (s) => s.userId !== userId || s.id === currentSessionId
  );
  saveStoredSessions(sessions);
  return sessions;
}

// Security Logs
export function getSecurityLogs(userEmail?: string): SecurityLog[] {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    const logs: SecurityLog[] = raw ? JSON.parse(raw) : INITIAL_LOGS;
    if (userEmail) {
      return logs.filter(
        (l) => l.userEmail.toLowerCase() === userEmail.toLowerCase()
      );
    }
    return logs;
  } catch {
    return INITIAL_LOGS;
  }
}

export function addSecurityLog(log: Omit<SecurityLog, 'id' | 'timestamp'>) {
  const existing = getSecurityLogs();
  const newLog: SecurityLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newLog, ...existing].slice(0, 50); // keep last 50
  localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  return updated;
}

// Failed attempt lockout tracker
export function getFailedAttempts(email: string): { count: number; lockedUntil: number | null } {
  try {
    const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const entry = data[email.toLowerCase()] || { count: 0, lockedUntil: null };
    if (entry.lockedUntil && Date.now() > entry.lockedUntil) {
      return { count: 0, lockedUntil: null };
    }
    return entry;
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

export function recordFailedAttempt(email: string): { count: number; lockedUntil: number | null } {
  try {
    const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    const key = email.toLowerCase();
    const current = data[key] || { count: 0, lockedUntil: null };

    const newCount = current.count + 1;
    let lockedUntil = null;
    if (newCount >= 5) {
      // lock for 60 seconds
      lockedUntil = Date.now() + 60 * 1000;
    }

    data[key] = { count: newCount, lockedUntil };
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(data));
    return data[key];
  } catch {
    return { count: 1, lockedUntil: null };
  }
}

export function resetFailedAttempts(email: string) {
  try {
    const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
    const data = raw ? JSON.parse(raw) : {};
    delete data[email.toLowerCase()];
    localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(data));
  } catch {
    // Ignore error
  }
}

// Password Strength Evaluator
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length >= 6) score++;
  if (hasLength && (hasUppercase || hasLowercase)) score++;
  if (hasNumber && hasSpecial) score++;
  if (password.length >= 12 && hasUppercase && hasLowercase && hasNumber && hasSpecial) score++;

  // Normalize score 0-4
  score = Math.min(4, Math.max(0, score));
  if (password.length === 0) score = 0;

  const strengthLabels: Array<{ label: PasswordStrength['label']; color: string }> = [
    { label: 'Very Weak', color: 'bg-rose-500 text-rose-600' },
    { label: 'Weak', color: 'bg-amber-500 text-amber-600' },
    { label: 'Fair', color: 'bg-yellow-500 text-yellow-600' },
    { label: 'Strong', color: 'bg-teal-500 text-teal-600' },
    { label: 'Very Strong', color: 'bg-emerald-500 text-emerald-600' },
  ];

  return {
    score,
    label: strengthLabels[score].label,
    color: strengthLabels[score].color,
    hasLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
  };
}

// Simulated dynamic 6-digit TOTP code generator based on 30s epoch interval
export function getSimulatedTotpCode(secret: string = 'JBSWY3DPEHPK3PXP'): { code: string; secondsRemaining: number } {
  const epochSeconds = Math.floor(Date.now() / 1000);
  const period = 30;
  const timeStep = Math.floor(epochSeconds / period);
  const secondsRemaining = period - (epochSeconds % period);

  // Deterministic 6 digit number from timeStep and secret
  let hash = 0;
  for (let i = 0; i < secret.length; i++) {
    hash = (hash << 5) - hash + secret.charCodeAt(i);
    hash |= 0;
  }
  const combined = Math.abs(hash * 31 + timeStep * 17) % 900000 + 100000;
  return {
    code: combined.toString().padStart(6, '0'),
    secondsRemaining,
  };
}
