import React from 'react';
import { Shield, ShieldCheck, LogOut, User as UserIcon, KeyRound, Smartphone, Activity } from 'lucide-react';
import { User, AuthMode } from '../types';

interface NavbarProps {
  currentUser: User | null;
  authMode: AuthMode;
  onSelectMode: (mode: AuthMode) => void;
  onLogout: () => void;
  activeDashboardTab?: string;
  onSelectDashboardTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  authMode,
  onSelectMode,
  onLogout,
  activeDashboardTab,
  onSelectDashboardTab,
}) => {
  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand logo & title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 tracking-tight text-base sm:text-lg">
                AuthSuite
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Security Core
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Enterprise Identity & Access Management
            </p>
          </div>
        </div>

        {/* Dashboard Tabs or Auth switchers */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Dashboard Navigation Tabs */}
              {onSelectDashboardTab && (
                <nav className="hidden md:flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                  <button
                    type="button"
                    id="nav-tab-profile"
                    onClick={() => onSelectDashboardTab('profile')}
                    className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                      activeDashboardTab === 'profile'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    Profile
                  </button>
                  <button
                    type="button"
                    id="nav-tab-security"
                    onClick={() => onSelectDashboardTab('security')}
                    className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                      activeDashboardTab === 'security'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Security & 2FA
                  </button>
                  <button
                    type="button"
                    id="nav-tab-sessions"
                    onClick={() => onSelectDashboardTab('sessions')}
                    className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                      activeDashboardTab === 'sessions'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Sessions
                  </button>
                  <button
                    type="button"
                    id="nav-tab-logs"
                    onClick={() => onSelectDashboardTab('logs')}
                    className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                      activeDashboardTab === 'logs'
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    Audit Logs
                  </button>
                </nav>
              )}

              {/* User badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200"
                />
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    {currentUser.name}
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : currentUser.role === 'developer'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                    {currentUser.email}
                  </div>
                </div>

                <button
                  type="button"
                  id="navbar-logout-btn"
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="nav-signin-tab"
                onClick={() => onSelectMode('signin')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'signin' || authMode === 'two-factor'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                id="nav-signup-tab"
                onClick={() => onSelectMode('signup')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  authMode === 'signup'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
