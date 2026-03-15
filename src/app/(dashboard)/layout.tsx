// (dashboard)/layout.tsx
// Single dashboard layout: Sidebar + Header + main content. Used by all dashboard routes.

import type { ReactNode } from 'react';
import { Sidebar } from '@/widgets/sidebar/Sidebar';
import { Header } from '@/widgets/header/Header';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden lg:block lg:w-64 lg:shrink-0">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
