'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, BadgeCheck, KeyRound, LockKeyhole, Sparkles } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { useResetPassword } from '@/features/auth/login/model/useResetPassword';
import { routes } from '@/constants/routes';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetPasswordMutation = useResetPassword();

  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('This link is incomplete. Please open the reset link from your email again.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Please use at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync({ token, newPassword });
      setSuccess(true);
      setTimeout(() => {
        router.replace(routes.login);
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'We could not update your password right now. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen bg-slate-50">
      <section className="relative hidden w-1/2 overflow-hidden bg-[#10203d] lg:flex">
        <div className="absolute inset-0 bg-[linear-gradient(150deg,#10203d_10%,#1a3463_58%,#23437f_100%)]" />
        <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute bottom-8 right-6 h-80 w-80 rounded-full bg-brand-400/25 blur-3xl" />
        <div className="absolute right-10 top-12 h-24 w-24 rotate-[16deg] rounded-2xl border border-white/25 bg-white/[0.08] backdrop-blur-sm" />

        <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col justify-center px-14">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-3 py-1 text-xs text-slate-100">
            <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
            Secure Sign-in
          </div>

          <h1 className="mt-6 text-[42px] font-semibold leading-[1.06] text-white">
            Almost done.
            <span className="block text-cyan-200">Choose a new password.</span>
          </h1>

          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-100">
            Pick a password that is easy for you to remember and hard for others to guess.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/[0.08] p-3 backdrop-blur-sm">
              <LockKeyhole className="mt-0.5 h-5 w-5 text-cyan-200" />
              <p className="text-sm text-slate-100">Use at least 6 characters.</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/[0.08] p-3 backdrop-blur-sm">
              <KeyRound className="mt-0.5 h-5 w-5 text-amber-200" />
              <p className="text-sm text-slate-100">Avoid using your name, email, or phone number.</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/[0.08] p-3 backdrop-blur-sm">
              <BadgeCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
              <p className="text-sm text-slate-100">You can sign in immediately after saving.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2 lg:px-10">
        <div className="w-full max-w-[440px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8">
          <Link
            href={routes.login}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <h2 className="mt-5 text-2xl font-bold text-slate-900">Create a new password</h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your new password below and confirm it once.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input
              label="New password"
              type="password"
              placeholder="Type your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Type it again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Your password has been updated. Taking you back to sign in...
              </div>
            )}

            <Button type="submit" loading={resetPasswordMutation.isPending} className="w-full" size="lg">
              Save new password
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            This reset link can only be used for a short time.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Loading reset form...</main>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
