'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock3, Mail, Sparkles } from 'lucide-react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { useForgotPassword } from '@/features/auth/login/model/useResetPassword';
import { routes } from '@/constants/routes';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const forgotPasswordMutation = useForgotPassword();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await forgotPasswordMutation.mutateAsync(email);
      setSuccessMessage('Check your inbox. If we found this email, we sent you a link to set a new password.');
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? 'We could not process that email right now. Please try again.');
    }
  };

  return (
    <main className="flex min-h-screen bg-slate-50">
      <section className="relative hidden w-1/2 overflow-hidden bg-[#0c1637] lg:flex">
        <div className="absolute inset-0 bg-[linear-gradient(140deg,#0c1637_12%,#13245a_56%,#1a2f72_100%)]" />
        <div className="absolute -left-12 top-16 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />
        <div className="absolute bottom-6 right-10 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute right-8 top-10 h-24 w-24 rotate-12 rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-sm" />
        <div className="absolute left-10 top-40 h-16 w-16 -rotate-12 rounded-xl border border-cyan-200/30 bg-cyan-200/10" />

        <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col justify-center px-14">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-3 py-1 text-xs text-slate-100">
            <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
            Password Help
          </div>

          <h1 className="mt-6 text-[42px] font-semibold leading-[1.05] text-white">
            Forgot your password?
            <span className="block text-cyan-200">No worries, we can fix that.</span>
          </h1>

          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate-200">
            Enter your email and we will send you a secure link to create a new password.
          </p>

          <div className="mt-8 space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/[0.08] p-3 backdrop-blur-sm">
              <Mail className="mt-0.5 h-5 w-5 text-cyan-200" />
              <p className="text-sm text-slate-100">Step 1: We send a link to your email.</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/[0.08] p-3 backdrop-blur-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
              <p className="text-sm text-slate-100">Step 2: Open the link and choose a new password.</p>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/15 bg-white/[0.08] p-3 backdrop-blur-sm">
              <Clock3 className="mt-0.5 h-5 w-5 text-amber-200" />
              <p className="text-sm text-slate-100">Step 3: Sign in again and continue your work.</p>
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

          <h2 className="mt-5 text-2xl font-bold text-slate-900">Forgot your password?</h2>
          <p className="mt-2 text-sm text-slate-500">
            Tell us your email and we will help you get back in.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {successMessage && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <Button type="submit" loading={forgotPasswordMutation.isPending} className="w-full" size="lg">
              Send me a reset link
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">Need help? Contact your HR team if you still cannot sign in.</p>
        </div>
      </section>
    </main>
  );
}
