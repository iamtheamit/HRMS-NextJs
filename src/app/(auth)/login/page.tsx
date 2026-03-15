// (auth)/login/page.tsx
// Login route moved into the (auth) route group for cleaner app router separation.

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/features/auth/login/components/LoginForm';
import { routes } from '@/constants/routes';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(routes.dashboard);
    }
  }, [isAuthenticated, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-xl font-semibold text-slate-900">Sign in to HRMS</h1>
        <p className="mt-1 text-sm text-slate-500">
          Use your corporate credentials to access the dashboard.
        </p>
        <div className="mt-6">
          <LoginForm onSuccess={() => router.replace(routes.dashboard)} />
        </div>
      </div>
    </main>
  );
}
