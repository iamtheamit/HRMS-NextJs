"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, Settings } from 'lucide-react';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/super-admin': 'Super Admin Dashboard',
  '/hr-admin': 'HR Admin Dashboard',
  '/manager': 'Manager Dashboard',
  '/employee': 'Employee Dashboard',
  '/employees': 'Employees',
  '/departments': 'Departments',
  '/attendance': 'Attendance',
  '/leave': 'Leave Management',
  '/tasks': 'Task Assignment',
  '/salary': 'Salary Management',
  '/payroll': 'Payroll Management',
  '/settings': 'Settings'
};

function formatTitle(pathname: string) {
  if (titleMap[pathname]) return titleMap[pathname];
  if (pathname.startsWith('/employees/')) return 'Employee Details';
  if (pathname.startsWith('/salary/')) return 'Salary Details';
  if (pathname.startsWith('/payroll/')) return 'Payroll Details';
  const last = pathname.split('/').filter(Boolean).pop() || 'Dashboard';
  return last.charAt(0).toUpperCase() + last.slice(1);
}

function formatBreadcrumb(pathname: string) {
  const parts = pathname.split('/').filter(Boolean);
  return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1));
}

export function Header() {
  const pathname = usePathname() || '/dashboard';
  const title = formatTitle(pathname);
  const crumbs = formatBreadcrumb(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 py-3 pr-4 pl-16 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <nav className="flex items-center gap-1 text-xs text-slate-400">
            <span>Home</span>
            {crumbs.map((c) => (
              <React.Fragment key={c}>
                <span>/</span>
                <span className="text-slate-600">{c}</span>
              </React.Fragment>
            ))}
          </nav>
          <h1 className="mt-0.5 truncate text-lg font-semibold text-slate-900">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-56 rounded-lg border border-slate-200 bg-surface-muted pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-500" />
          </button>

          <button
            type="button"
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>

          <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 text-xs font-bold text-white">
            AK
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
