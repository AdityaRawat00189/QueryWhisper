import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export const ErrorMessage = ({ error, onDismiss, className = '' }) => {
  if (!error) return null;

  return (
    <div
      role="alert"
      className={`flex items-start justify-between gap-3 p-3 text-xs bg-status-error-bg border border-status-error-border text-status-error rounded-md ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="font-medium leading-relaxed break-words">{error}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-status-error hover:opacity-75 focus:outline-none p-0.5"
          aria-label="Dismiss error"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
