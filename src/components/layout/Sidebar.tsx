// Sidebar.tsx
// Renders the left vertical navigation with primary sections and user profile.

'use client';

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
  Search
} from 'lucide-react';
import clsx from 'clsx';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const primaryNav: NavItem[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Team', href: '/employees', icon: Users },
  { label: 'Inbox', href: '/inbox', icon: Inbox },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Organization', href: '/organization', icon: Building2 },
  { label: 'Support', href: '/support', icon: LifeBuoy }
];

const secondaryNav: NavItem[] = [
  { label: 'Settings', href: '/settings', icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = pathname === item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={clsx(
          'flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition',
          active
            ? 'bg-blue-100 text-blue-700 font-medium'
            : 'text-blue-50/90 hover:bg-blue-600'
        )}
      >
        <Icon
          className={clsx(
            'h-4 w-4',
            active ? 'text-blue-700' : 'text-blue-100/80'
          )}
        />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="flex h-screen w-64 flex-col overflow-y-auto bg-blue-700 text-white">
      {/* Logo section */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold">
          HR
        </div>
        <div>
          <p className="text-sm font-semibold text-white">HRMS</p>
          <p className="text-[11px] text-blue-100/80">People Platform</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-blue-100/70" />
          <input
            type="search"
            placeholder="Search"
            className="w-full rounded-md border border-blue-500/50 bg-white/10 py-2 pl-8 pr-3 text-xs text-white placeholder:text-blue-100/70 outline-none ring-0 focus:border-white focus:bg-white/15"
          />
        </div>
      </div>

      {/* Menu items */}
      <nav className="mt-1 flex-1 space-y-1 px-3">
        <div className="space-y-1 text-[11px] font-semibold uppercase tracking-wide text-blue-100/70">
          <p className="px-4 pb-2">Main</p>
          {primaryNav.map(renderItem)}
        </div>
        <div className="space-y-1 border-t border-white/15 pt-4 text-[11px] font-semibold uppercase tracking-wide text-blue-100/70">
          {secondaryNav.map(renderItem)}
        </div>
      </nav>

      {/* Bottom user profile - pushed to bottom with mt-auto */}
      <div className="mt-auto border-t border-white/15 px-4 py-3">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white/10 px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 text-xs font-semibold">
              AK
            </div>
            <div>
              <p className="text-xs font-medium text-white">Amit Kumar</p>
              <p className="text-[11px] text-blue-100/80">HR Manager</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-blue-100/80 transition hover:bg-white/15 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

