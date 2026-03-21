"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck2,
  CalendarClock,
  ClipboardList,
  Wallet,
  HandCoins,
  UserCircle2,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/features/auth/login/model/useLogout';
import { routes } from '@/constants/routes';
import { getRoleHomeRoute } from '@/features/auth/login/model/getRoleHomeRoute';

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
};

const mainNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Employees', href: '/employees', icon: Users, roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER'] },
  { label: 'Departments', href: '/departments', icon: Building2, roles: ['SUPER_ADMIN', 'HR_ADMIN'] },
  { label: 'Attendance', href: '/attendance', icon: CalendarCheck2, roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { label: 'Leave', href: '/leave', icon: CalendarClock, roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { label: 'Tasks', href: '/tasks', icon: ClipboardList, roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { label: 'Salary', href: '/salary', icon: Wallet, roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER'] },
  { label: 'Payroll', href: '/payroll', icon: HandCoins, roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER'] }
];

const bottomNav: NavItem[] = [
  { label: 'My Profile', href: routes.profile, icon: UserCircle2, roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'] },
  { label: 'Settings', href: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER'] }
];

const formatRole = (role?: string) => {
  if (!role) return 'User';
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const canAccess = (item: NavItem, role?: string) => {
  if (!item.roles || item.roles.length === 0) return true;
  if (!role) return false;
  return item.roles.includes(role);
};

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getRoleAwareHref(item: NavItem, role?: string) {
  if (item.href === routes.dashboard) {
    return getRoleHomeRoute(role);
  }

  if (role !== 'EMPLOYEE') {
    return item.href;
  }

  if (item.href === routes.attendance) {
    return routes.attendanceMe;
  }

  if (item.href === routes.leave) {
    return routes.leaveMe;
  }

  if (item.href === routes.tasks) {
    return routes.tasksMe;
  }

  return item.href;
}

function SidebarLink({
  item,
  pathname,
  role
}: {
  item: NavItem;
  pathname: string;
  role?: string;
}) {
  const href = getRoleAwareHref(item, role);
  const Icon = item.icon;
  const active = isActive(pathname, href);

  return (
    <Link
      href={href}
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
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const closeMobile = () => setOpen(false);
  const role = user?.role;
  const visibleMainNav = mainNav.filter((item) => canAccess(item, role));
  const visibleBottomNav = bottomNav.filter((item) => canAccess(item, role));
  const userName = user?.name || 'User';
  const userRole = formatRole(role);
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const sidebar = (
    <>
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-bold text-white shadow-sm shadow-brand-600/30">
          H
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold leading-tight text-white">HRMS</p>
          <p className="text-[11px] text-slate-500">People Platform</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pt-2" aria-label="Main">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Menu
        </p>
        {visibleMainNav.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} role={role} />
        ))}
      </nav>

      <div className="mt-auto space-y-1 border-t border-white/[0.06] px-3 pt-3">
        {visibleBottomNav.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} role={role} />
        ))}

        <div className="mx-0 mt-2 mb-3 flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">{userName}</p>
            <p className="truncate text-[11px] text-slate-500">{userRole}</p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.06] hover:text-slate-300"
            aria-label="Sign out"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <button
        type="button"
        className="fixed top-3 left-3 z-[60] flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white/95 shadow-elevated backdrop-blur lg:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5 text-slate-700" /> : <Menu className="h-5 w-5 text-slate-700" />}
      </button>

      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={closeMobile}
        aria-hidden="true"
      />

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
