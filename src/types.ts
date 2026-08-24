export type UserRole = 'admin' | 'developer' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  createdAt: string;
  lastLoginAt: string;
  emailVerified: boolean;
  status: 'active' | 'suspended';
}

export interface Session {
  id: string;
  userId: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  isCurrent: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export type SecurityActionType =
  | 'LOGIN'
  | 'FAILED_LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | '2FA_ENABLED'
  | '2FA_DISABLED'
  | 'REGISTRATION'
  | 'SESSION_REVOKED'
  | 'MAGIC_LINK_LOGIN'
  | 'PROFILE_UPDATED'
  | 'ACCOUNT_LOCKED';

export interface SecurityLog {
  id: string;
  userId?: string;
  userEmail: string;
  action: SecurityActionType;
  details: string;
  timestamp: string;
  ip: string;
  status: 'success' | 'warning' | 'danger';
}

export type AuthMode =
  | 'signin'
  | 'signup'
  | 'forgot-password'
  | 'magic-link'
  | 'two-factor';

export interface PasswordStrength {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  hasLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}
