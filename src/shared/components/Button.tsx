// Button.tsx
// Provides a reusable button component for consistent actions across the HRMS UI.

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  children: ReactNode;
};

export const Button = ({
  variant = 'primary',
  loading,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) => {
  const base = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary:
      'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300'
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

