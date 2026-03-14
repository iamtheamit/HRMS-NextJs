// Badge.tsx
// Renders small status badges used for employee status and tags.

import type { ReactNode } from 'react';
import clsx from 'clsx';

type BadgeVariant = 'default' | 'success' | 'danger' | 'soft';

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

export const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium';
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-100',
    soft: 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
  };

  return <span className={clsx(base, variants[variant])}>{children}</span>;
};

