// Badge.tsx
// Renders small status badges used for employee status and tags.

import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

type BadgeVariant = 'default' | 'success' | 'danger' | 'soft' | 'warning';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
  variant?: BadgeVariant;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600',
  soft: 'bg-brand-50 text-brand-700',
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700'
};

export const Badge = ({
  children,
  className,
  variant = 'default'
}: BadgeProps) => (
  <span
    className={clsx(
      'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold',
      variantStyles[variant],
      className
    )}
  >
    {children}
  </span>
);

export default Badge;
