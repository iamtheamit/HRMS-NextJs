'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { routes } from '@/constants/routes';

type RoleGuardProps = {
  allowedRoles: string[];
  children: React.ReactNode;
  redirectTo?: string;
};

export function RoleGuard({ allowedRoles, children, redirectTo = routes.dashboard }: RoleGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(routes.login);
      return;
    }

    if (!allowedRoles.includes(user?.role || '')) {
      router.replace(redirectTo);
    }
  }, [allowedRoles, isAuthenticated, redirectTo, router, user?.role]);

  if (!isAuthenticated) return null;
  if (!allowedRoles.includes(user?.role || '')) return null;

  return <>{children}</>;
}

export default RoleGuard;
