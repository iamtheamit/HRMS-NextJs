import React from 'react';

export const Modal = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-black/40" />
    <div className="relative z-10 w-full max-w-2xl p-4">{children}</div>
  </div>
);

export default Modal;
