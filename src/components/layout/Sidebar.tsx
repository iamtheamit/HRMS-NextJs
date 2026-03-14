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
  LogOut
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
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
          active
            ? 'bg-white/10 text-white'
            : 'text-slate-100/80 hover:bg-white/5 hover:text-white'
        )}
      >
        <Icon className="h-4 w-4 opacity-80" />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-800/40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-sm font-semibold">
          HR
        </div>
        <div>
          <p className="text-sm font-semibold">HRMS</p>
          <p className="text-xs text-slate-400">People Platform</p>
        </div>
      </div>

      <nav className="mt-4 flex-1 space-y-6 px-3">
        <div className="space-y-1">{primaryNav.map(renderItem)}</div>
        <div className="space-y-1 border-t border-white/5 pt-4">
          {secondaryNav.map(renderItem)}
        </div>
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 text-xs font-semibold">
              AK
            </div>
            <div>
              <p className="text-xs font-medium text-white">Amit Kumar</p>
              <p className="text-[11px] text-slate-300">HR Manager</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

