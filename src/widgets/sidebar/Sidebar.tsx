"use client";

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutDashboard,
  Users,
  Inbox,
  FolderKanban,
  Building2,
  LifeBuoy,
  Settings,
  LogOut,
  Search,
  Menu,
  X
} from 'lucide-react';
import clsx from 'clsx';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Team', href: '/employees', icon: Users },
  { label: 'Inbox', href: '/inbox', icon: Inbox },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Organization', href: '/organization', icon: Building2 },
  { label: 'Support', href: '/support', icon: LifeBuoy }
];

const SECONDARY_NAV: NavItem[] = [{ label: 'Settings', href: '/settings', icon: Settings }];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={clsx(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-white text-slate-800 shadow-sm'
          : 'text-slate-200 hover:bg-white/5 hover:text-white'
      )}
    >
      <Icon className={clsx('h-4 w-4 flex-none', active ? 'text-slate-800' : 'text-slate-200')} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname() || '/';
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false); // mobile drawer

  const filteredPrimary = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PRIMARY_NAV;
    return PRIMARY_NAV.filter((i) => i.label.toLowerCase().includes(q));
  }, [query]);

  // helper to detect active routes (supports subpaths)
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-50 inline-flex items-center justify-center rounded-md bg-white/90 p-2 shadow-md lg:hidden"
      >
        {open ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
      </button>

      {/* Overlay for mobile drawer */}
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 transform flex-col overflow-y-auto bg-slate-800 text-white transition-transform lg:static lg:translate-x-0 lg:flex',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Primary"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">HR</div>
            <div>
              <p className="text-sm font-semibold">HRMS</p>
              <p className="text-xs text-slate-300">People Platform</p>
            </div>
          </div>

          {/* Search */}
          <div className="px-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search menu"
                className="w-full rounded-md border border-slate-700 bg-slate-700/60 py-2 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Search menu"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex-1 space-y-4 px-3" aria-label="Main navigation">
            <div>
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Main</h3>
              <div className="mt-2 flex flex-col gap-1">
                {filteredPrimary.map((item) => (
                  <NavLink key={item.href} item={item} active={isActive(item.href)} />
                ))}
              </div>
            </div>

            <div className="border-t border-slate-700/60 pt-4">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">More</h3>
              <div className="mt-2 flex flex-col gap-1">
                {SECONDARY_NAV.map((item) => (
                  <NavLink key={item.href} item={item} active={isActive(item.href)} />
                ))}
              </div>
            </div>
          </nav>

          {/* Footer profile */}
          <div className="mt-auto border-t border-slate-700/60 px-4 py-3">
            <div className="flex items-center justify-between gap-3 rounded-md bg-slate-700/40 px-3 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 text-xs font-semibold">AK</div>
                <div>
                  <p className="text-sm font-medium">Amit Kumar</p>
                  <p className="text-xs text-slate-300">HR Manager</p>
                </div>
              </div>

              <button
                type="button"
                title="Sign out"
                className="rounded-md p-2 text-slate-200 hover:bg-slate-700/60"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
