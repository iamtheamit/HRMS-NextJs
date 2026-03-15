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
      <div className="relative hidden w-1/2 overflow-hidden bg-[#04091d] lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_15%_20%,rgba(56,189,248,0.14),transparent),radial-gradient(900px_500px_at_90%_80%,rgba(59,130,246,0.2),transparent),linear-gradient(165deg,#04091d_15%,#09153a_55%,#0b1a46_100%)]" />
        <div className="absolute -left-28 top-12 h-80 w-80 rounded-full border border-white/10 bg-white/[0.03]" />
        <div className="absolute right-8 top-16 h-24 w-24 rotate-12 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-sm" />
        <div className="absolute right-16 top-48 h-14 w-14 -rotate-6 rounded-xl border border-cyan-200/30 bg-cyan-200/10" />
        <div className="absolute bottom-16 left-12 h-20 w-20 rotate-[16deg] rounded-2xl border border-brand-200/30 bg-brand-200/10" />

        <div className="relative z-10 flex w-full items-center px-14 py-12">
          <div className="w-full max-w-[620px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-100">
              Welcome Back
            </div>

            <h2 className="mt-8 max-w-xl text-[46px] font-semibold leading-[1.02] text-white">
              Start your day,
              <span className="block text-cyan-200">we will handle the heavy lifting.</span>
            </h2>

            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-300">
              Keep employees, attendance, leave, and tasks in one easy place so your team can stay focused on people.
            </p>

            <div className="mt-9 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">Operations Pulse</p>
                <p className="mt-2 text-2xl font-semibold text-white">99.2%</p>
                <p className="mt-1 text-xs text-slate-300">today's check-ins completed</p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[88%] rounded-full bg-gradient-to-r from-cyan-300 to-brand-400" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300">Today</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-200">People joined</span>
                    <span className="font-medium text-white">+6</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-200">Leave requests</span>
                    <span className="font-medium text-white">14</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-200">Urgent tasks</span>
                    <span className="font-medium text-amber-200">3</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {['Quick approvals', 'Safe sign-in', 'Clear updates', 'Less manual work'].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Helping teams every day</p>
              <div className="mt-2 flex items-end gap-5">
                <div>
                  <p className="text-2xl font-semibold text-white">678</p>
                  <p className="text-[11px] text-slate-300">People onboarded</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">12</p>
                  <p className="text-[11px] text-slate-300">Active teams</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-white">24/7</p>
                  <p className="text-[11px] text-slate-300">Always available</p>
                </div>
              </div>
            </div>
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
            Enter your email and password to continue.
          </p>

          <div className="mt-8">
            <LoginForm onSuccess={() => router.replace(routes.dashboard)} />
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            By signing in, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
}
