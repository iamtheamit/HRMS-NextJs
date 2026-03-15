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
    <main className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden w-1/2 items-center justify-center bg-[#0f172a] lg:flex">
        <div className="max-w-md px-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-lg shadow-brand-600/30">
            H
          </div>
          <h2 className="mt-8 text-3xl font-bold text-white">Welcome to HRMS</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-400">
            Your all-in-one people platform. Manage employees, track attendance,
            and streamline HR operations — all in one place.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {['678 Employees', '12 Teams', '99.2% Uptime'].map((stat) => (
              <div key={stat} className="rounded-xl bg-white/[0.04] px-4 py-3">
                <p className="text-sm font-semibold text-white">{stat.split(' ')[0]}</p>
                <p className="text-[11px] text-slate-500">{stat.split(' ').slice(1).join(' ')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex w-full items-center justify-center bg-white px-4 lg:w-1/2">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 font-bold text-white shadow-sm shadow-brand-600/30 lg:hidden">
            H
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-2 text-sm text-slate-500">
            Use your corporate credentials to access the dashboard.
          </p>

          <div className="mt-8">
            <LoginForm onSuccess={() => router.replace(routes.dashboard)} />
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}
