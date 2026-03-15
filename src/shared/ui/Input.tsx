import React from 'react';
import clsx from 'clsx';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = ({ label, error, className, ...rest }: InputProps) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-slate-700">{label}</label>
    )}
    <input
      className={clsx(
        'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400',
        error
          ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
          : 'border-slate-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100',
        className
      )}
      {...rest}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export default Input;
