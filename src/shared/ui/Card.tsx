// Card.tsx
// Provides a reusable card container with flat, clean SaaS styling.

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
        'rounded-xl border border-gray-200 bg-white p-5 shadow-sm overflow-hidden max-w-full',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
