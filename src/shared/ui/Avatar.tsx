// Avatar.tsx
// Renders a simple user avatar with initials and optional status indicator.

import type { ReactNode } from 'react';
import clsx from 'clsx';

type AvatarProps = {
  children?: ReactNode;
  size?: 'sm' | 'md';
  status?: 'online' | 'offline';
};

export const Avatar = ({ children, size = 'md', status }: AvatarProps) => {
  const sizes = {
    sm: 'h-7 w-7 text-[11px]',
    md: 'h-9 w-9 text-xs'
  } as const;

  return (
    <div className="relative inline-flex">
      <div
        className={clsx(
          'inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 font-semibold text-white',
          sizes[size]
        )}
      >
        {children}
      </div>
      {status && (
        <span
          className={clsx(
            'absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white',
            status === 'online' ? 'bg-emerald-400' : 'bg-slate-300'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
