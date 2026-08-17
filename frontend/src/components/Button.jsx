import React from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-hover active:bg-black border border-transparent shadow-subtle',
  secondary: 'bg-white text-text-primary hover:bg-surface-muted active:bg-surface-subtle border border-border shadow-subtle',
  outline: 'bg-transparent text-text-primary hover:bg-surface-muted border border-border',
  danger: 'bg-status-error text-white hover:bg-red-700 active:bg-red-800 border border-transparent',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface-muted',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs font-medium rounded-md gap-1.5',
  md: 'px-3.5 py-2 text-sm font-medium rounded-md gap-2',
  lg: 'px-4 py-2.5 text-base font-medium rounded-md gap-2',
};

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 text-current" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
