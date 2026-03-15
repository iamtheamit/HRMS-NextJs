import React from 'react';

export const Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs ${className}`}>{children}</span>
);

export default Badge;
