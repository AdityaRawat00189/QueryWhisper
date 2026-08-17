import React from 'react';

export const ConnectionStatus = ({
  status = 'connected', // 'connected' | 'connecting' | 'disconnected'
  environment,
  dbName,
  className = '',
}) => {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <div className={`inline-flex items-center gap-2 text-xs font-medium text-text-secondary ${className}`}>
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-muted border border-border">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            isConnected
              ? 'bg-status-success ring-2 ring-status-success-border'
              : isConnecting
              ? 'bg-status-warning animate-pulse'
              : 'bg-text-muted'
          }`}
        />
        <span className="text-text-primary text-[11px] font-medium">
          {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
        </span>
      </div>

      {environment && (
        <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-surface-subtle text-text-secondary border border-border uppercase tracking-wider">
          {environment}
        </span>
      )}

      {dbName && (
        <span className="text-text-secondary font-mono text-[11px] hidden sm:inline-block truncate max-w-[140px]">
          {dbName}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatus;
