'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { fetchCurrentUser } from '@/entities/user/api/userApi';
import { routes } from '@/constants/routes';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setAuth } = useAuthStore();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      setChecking(false);
      return;
    }

    // In-memory state is lost on refresh but cookies are still present.
    // Try fetching the current user — if the access token cookie is valid it succeeds.
    fetchCurrentUser()
      .then((user) => {
        setAuth({
          user: {
            id: user.id,
            name: user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || 'User',
            email: user.email,
            role: user.role,
          },
        });
      })
      .catch(() => {
        router.replace(routes.login);
      })
      .finally(() => {
        setChecking(false);
      });
  }, [isAuthenticated, router, setAuth]);

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
