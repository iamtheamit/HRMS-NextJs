// DashboardShell.tsx
// Composes the sidebar and navbar into a reusable shell for dashboard pages.

import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

type DashboardShellProps = {
  title?: string;
  children: ReactNode;
};

export function DashboardShell({ title, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar title={title} />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

