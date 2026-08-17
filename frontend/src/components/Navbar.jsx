import React from 'react';
import { Database, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConnectionStatus from './ConnectionStatus';

export const Navbar = () => {
  const { user, logout, hasDatabaseCredentials, activeDatabase } = useAuth();

  return (
    <header className="h-13 bg-white border-b border-border px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-7 h-7 rounded bg-brand text-white shadow-subtle">
          <Database className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold tracking-tight text-text-primary">
            QueryWhisper
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary border border-border">
            v1.0
          </span>
        </div>
      </div>

      {/* Status & User Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {hasDatabaseCredentials ? (
          <ConnectionStatus
            status="connected"
            environment="staging"
            dbName={activeDatabase}
          />
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-muted border border-border text-[11px] text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-text-muted" />
            <span>No DB Connected</span>
          </div>
        )}

        <div className="h-4 w-px bg-border hidden sm:block" />

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <div className="w-6 h-6 rounded-full bg-surface-subtle border border-border flex items-center justify-center text-text-primary font-medium text-[11px]">
              {user.username ? user.username.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
            </div>
            <span className="font-medium text-text-primary hidden md:inline-block max-w-[120px] truncate">
              {user.username}
            </span>
          </div>
        )}

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          title="Sign out of workspace"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md border border-transparent hover:border-border transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
