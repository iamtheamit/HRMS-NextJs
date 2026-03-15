// Navbar.tsx
// Renders the top navigation bar with breadcrumbs, search, and primary actions.

'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from '@/shared/components/Breadcrumb';

type NavbarProps = {
  title?: string;
  children?: ReactNode;
};

export function Navbar({ title, children }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-6 border-b border-slate-200 bg-white px-8 py-4 shadow-sm">
      <div className="space-y-1">
        <Breadcrumb pathname={pathname} />
        <h1 className="text-lg font-semibold text-slate-900">
          {title ?? 'Dashboard'}
        </h1>
      </div>

      <div>{children}</div>
    </header>
  );
}

