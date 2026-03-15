import React from 'react';

export const Table = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full table-auto">{children}</table>
  </div>
);

export default Table;
