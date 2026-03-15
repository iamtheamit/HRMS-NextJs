import type { ReactNode } from 'react';
import clsx from 'clsx';

type AvatarProps = {
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline';
  src?: string;
};

export const Avatar = ({ children, size = 'md', status, src }: AvatarProps) => {
  const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm'
  } as const;

  return (
    <div className="relative inline-flex">
      {src ? (
        <img
          src={src}
          alt=""
          className={clsx('rounded-full object-cover', sizes[size])}
        />
      ) : (
        <div
          className={clsx(
            'inline-flex items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 font-semibold text-white',
            sizes[size]
          )}
        >
          {children}
        </div>
      )}
      {status && (
        <span
          className={clsx(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white',
            size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3',
            status === 'online' ? 'bg-emerald-400' : 'bg-slate-300'
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
