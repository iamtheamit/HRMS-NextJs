"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck2,
  CalendarClock,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const mainNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', href: '/employees', icon: Users },
  { label: 'Departments', href: '/departments', icon: Building2 },
  { label: 'Attendance', href: '/attendance', icon: CalendarCheck2 },
  { label: 'Leave', href: '/leave', icon: CalendarClock }
];

const bottomNav: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings }
];

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarLink({
  item,
  pathname,
  onClick
}: {
  item: NavItem;
  pathname: string;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
        active
          ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/25'
          : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
      )}
    >
      <Icon
        className={clsx(
          'h-[18px] w-[18px] shrink-0 transition-colors',
          active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
        )}
      />
      <span className="flex-1 truncate">{item.label}</span>
      {active && <ChevronRight className="h-3.5 w-3.5 text-white/60" />}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname() || '/dashboard';
  const [open, setOpen] = useState(false);
  const closeMobile = () => setOpen(false);

  const sidebar = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-bold text-white shadow-sm shadow-brand-600/30">
          H
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-tight text-white">HRMS</p>
          <p className="text-[11px] text-slate-500">People Platform</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pt-2" aria-label="Main">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Menu
        </p>
        {mainNav.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} onClick={closeMobile} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-1 border-t border-white/[0.06] px-3 pt-3">
        {bottomNav.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} onClick={closeMobile} />
        ))}

        {/* User profile */}
        <div className="mx-0 mt-2 mb-3 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 text-xs font-bold text-white">
            AK
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">Amit Kumar</p>
            <p className="truncate text-[11px] text-slate-500">HR Manager</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        className="fixed top-3 left-3 z-[60] flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/95 shadow-elevated backdrop-blur lg:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
      </button>

      {/* Mobile overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={clsx(
          'flex w-[260px] shrink-0 flex-col bg-[#0f172a]',
          'fixed inset-y-0 left-0 z-50 -translate-x-full transition-transform duration-200',
          'lg:static lg:z-auto lg:translate-x-0',
          open && 'translate-x-0'
        )}
      >
        {sidebar}
      </aside>
    </>
  );
}

export default Sidebar;
