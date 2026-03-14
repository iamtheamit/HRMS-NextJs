// Card.tsx
// Provides a reusable card container with soft shadows and rounded corners.

import type { ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
  children: ReactNode;
  className?: string;
};

export const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-200/60 backdrop-blur transition hover:-translate-y-[1px] hover:shadow-md',
        className
      )}
    >
      {children}
    </div>
  );
};

