import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg bg-white p-4 shadow-sm ${className}`}>{children}</div>
);

export default Card;
