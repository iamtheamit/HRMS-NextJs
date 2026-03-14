// Navbar.tsx
// Renders the top navigation bar with breadcrumbs, search, and primary actions.

'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem } from '@/shared/components/Breadcrumb';
import { SearchBar } from '@/shared/components/SearchBar';
import { Button } from '@/shared/components/Button';
import { Filter, FileDown, Plus } from 'lucide-react';

type NavbarProps = {
  title?: string;
  children?: ReactNode;
};

export function Navbar({ title, children }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between gap-6 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
      <div className="space-y-1">
        <Breadcrumb pathname={pathname} />
        <h1 className="text-lg font-semibold text-slate-900">
          {title ?? 'Dashboard'}
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-3">
        <SearchBar placeholder="Search employees or actions" />
        <Button variant="secondary" className="hidden md:inline-flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <Button variant="secondary" className="hidden md:inline-flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          Export
        </Button>
        <Button className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New
        </Button>
        {children}
      </div>
    </header>
  );
}

