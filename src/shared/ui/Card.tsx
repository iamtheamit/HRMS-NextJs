// Card.tsx
// Provides a reusable card container with flat, clean SaaS styling.

import type { ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
};

export const Card = ({ children, className, noPadding }: CardProps) => (
  <div
    className={clsx(
      'rounded-2xl border border-slate-200/80 bg-white shadow-card',
      !noPadding && 'p-5 sm:p-6',
      className
    )}
  >
    {children}
  </div>
);

export default Card;
