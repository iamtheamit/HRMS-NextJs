// Table.tsx
// Provides a reusable table component with clean SaaS styling and hover effects.

import type { ReactNode } from 'react';

type TableProps = {
  headers: string[];
  children: ReactNode;
};

export const Table = ({ headers, children }: TableProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/80 backdrop-blur">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
      </table>
    </div>
  );
};

export default Table;
