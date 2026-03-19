'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/shared/ui/Card';
import { useCurrentUser } from '@/entities/user/model/useCurrentUser';
import { getRoleHomeRoute } from '@/features/auth/login/model/getRoleHomeRoute';

export default function DashboardPage() {
  const router = useRouter();
  const currentUserQuery = useCurrentUser();

  useEffect(() => {
    if (!currentUserQuery.data?.role) {
      return;
    }

    const roleHomeRoute = getRoleHomeRoute(currentUserQuery.data.role);
    if (roleHomeRoute !== '/dashboard') {
      router.replace(roleHomeRoute);
    }
  }, [currentUserQuery.data?.role, router]);

  if (currentUserQuery.isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Loading your dashboard...</p>
      </Card>
    );
  }

  if (currentUserQuery.isError) {
    return (
      <Card>
        <p className="text-sm text-red-600">Unable to resolve your dashboard role right now.</p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-sm text-slate-600">Opening your role dashboard...</p>
    </Card>
  );
}
