import React from 'react';
import clsx from 'clsx';

type TableProps = {
  children: React.ReactNode;
  className?: string;
  headers?: string[];
};

export const Table = ({ children, className, headers }: TableProps) => (
  <div className={clsx('w-full overflow-x-auto', className)}>
    <table className="w-full text-left text-sm">
      {headers && headers.length > 0 && (
        <thead>
          <tr className="border-b border-slate-100">
            {headers.map((header, idx) => (
              <th
                key={`${header}-${idx}`}
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="divide-y divide-slate-100">{children}</tbody>
    </table>
  </div>
);

export default Table;
