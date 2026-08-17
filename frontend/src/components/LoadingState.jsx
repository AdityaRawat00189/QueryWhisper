import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading workspace...', fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-primary gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-border shadow-subtle">
          <Loader2 className="w-5 h-5 animate-spin text-text-primary" />
        </div>
        <p className="text-xs font-medium text-text-secondary">{message}</p>
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex flex-col items-center justify-center gap-2.5">
      <Loader2 className="w-5 h-5 animate-spin text-text-secondary" />
      <p className="text-xs text-text-secondary font-medium">{message}</p>
    </div>
  );
};

export default LoadingState;
