import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  helperText,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const selectId = id || name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-medium text-text-primary mb-1.5"
        >
          {label}
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full appearance-none px-3 py-2 pr-9 text-sm bg-white text-text-primary border rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand disabled:bg-surface-subtle disabled:text-text-muted disabled:cursor-not-allowed ${
            error
              ? 'border-status-error focus:ring-status-error'
              : 'border-border hover:border-border-strong'
          }`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-text-secondary">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-status-error">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-text-secondary">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
