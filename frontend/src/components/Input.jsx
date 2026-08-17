import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  helperText,
  error,
  required = false,
  disabled = false,
  className = '',
  autoComplete,
  ...props
}, ref) => {
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
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full px-3 py-2 text-sm bg-white text-text-primary border rounded-md transition-colors placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand disabled:bg-surface-subtle disabled:text-text-muted disabled:cursor-not-allowed ${
            error
              ? 'border-status-error focus:ring-status-error focus:border-status-error'
              : 'border-border hover:border-border-strong'
          }`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-status-error">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
