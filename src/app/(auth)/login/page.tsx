'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/features/auth/login/components/LoginForm';
import { AuthWelcomePanel } from '@/features/auth/login/components/AuthWelcomePanel';
import { getRoleHomeRoute } from '@/features/auth/login/model/getRoleHomeRoute';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userRole = useAuthStore((state) => state.user?.role);
  const activationState = searchParams.get('activated') === '1'
    ? 'activated'
    : searchParams.get('activation') === 'invalid'
      ? 'invalid'
      : null;

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(getRoleHomeRoute(userRole));
    }
  }, [isAuthenticated, router, userRole]);

  return (
    <main className="flex min-h-screen">
      <AuthWelcomePanel />

      <div className="flex w-full items-center justify-center bg-white px-4 lg:w-1/2">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 font-bold text-white shadow-sm shadow-brand-600/30 lg:hidden">
            H
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your email and password to continue.
          </p>

          <div className="mt-8">
            <LoginForm
              activationState={activationState}
              onSuccess={(role) => router.replace(getRoleHomeRoute(role))}
            />
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            By signing in, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}
