// Header.tsx
// Top header bar with breadcrumb and page title for the dashboard layout.

'use client';

import { usePathname } from 'next/navigation';
import { Breadcrumb } from '@/shared/components/Breadcrumb';

const titleMap: Record<string, string> = {
  '/dashboard': 'Overview',
  '/employees': 'My Team',
  '/attendance': 'Attendance',
  '/leave': 'Leave'
};

export function Header() {
  const pathname = usePathname();
  let title = titleMap[pathname];
  if (!title) {
    if (pathname.startsWith('/employees/')) title = 'Employee Details';
    else title = pathname.split('/').filter(Boolean).pop() ?? 'Dashboard';
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return (
    <header className="flex items-center justify-between gap-6 border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="space-y-1">
        <Breadcrumb pathname={pathname} />
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>
    </header>
  );
}
