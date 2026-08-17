import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = forwardRef(({
  label,
  id,
  name = 'password',
  value,
  onChange,
  placeholder = '••••••••',
  helperText,
  error,
  required = false,
  disabled = false,
  className = '',
  autoComplete = 'current-password',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-text-primary mb-1.5"
        >
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full pl-3 pr-10 py-2 text-sm bg-white text-text-primary border rounded-md transition-colors placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand disabled:bg-surface-subtle disabled:text-text-muted disabled:cursor-not-allowed ${
            error
              ? 'border-status-error focus:ring-status-error focus:border-status-error'
              : 'border-border hover:border-border-strong'
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          tabIndex={-1}
          className="absolute right-2.5 p-1 text-text-secondary hover:text-text-primary focus:outline-none transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-text-secondary" />
          ) : (
            <Eye className="w-4 h-4 text-text-secondary" />
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-status-error">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
