import React from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = ({ label, className = '', ...rest }: InputProps) => (
  <div className={`flex flex-col ${className}`}>
    {label && <label className="mb-1 text-sm text-slate-700">{label}</label>}
    <input className="rounded-md border px-3 py-2 text-sm outline-none" {...rest} />
  </div>
);

export default Input;
