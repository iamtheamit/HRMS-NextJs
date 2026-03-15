import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const Button = ({ variant = 'primary', className = '', ...rest }: ButtonProps) => {
  const base = 'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium';
  const styles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-slate-900 hover:bg-gray-200',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100'
  } as const;

  return <button className={`${base} ${styles[variant]} ${className}`} {...rest} />;
};

export default Button;
