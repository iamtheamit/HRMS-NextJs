"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { useLogin } from '@/features/auth/login/model/useLogin';
import { resendActivationEmailApi } from '@/features/auth/login/api/resendActivationApi';
import type { LoginResponse } from '@/features/auth/login/api/loginApi';
import { routes } from '@/constants/routes';

export function LoginForm({ onSuccess }: { onSuccess?: (role?: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResendingActivation, setIsResendingActivation] = useState(false);
  const loginMutation = useLogin();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      const data: LoginResponse = await loginMutation.mutateAsync({ email, password });
      onSuccess && onSuccess(data.user?.role);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to sign in');
    }
  };

  const handleResendActivation = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsResendingActivation(true);
    setSuccessMessage(null);
    setError(null);

    try {
      await resendActivationEmailApi({ email });
      setSuccessMessage('Activation email has been resent to your email address. Please check your inbox and click the activation link to verify your account.');
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to resend activation email. Please try again.');
    } finally {
      setIsResendingActivation(false);
    }
  };

  const isAccountInactiveError = error && error.toLowerCase().includes('not activated');

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      <Input
        label="Email"
        type="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" />
          Remember me
        </label>
        <Link href={routes.forgotPassword} className="font-medium text-brand-600 hover:text-brand-700">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" loading={loginMutation.isPending} className="w-full" size="lg">
        Sign in
      </Button>
      {isAccountInactiveError && (
        <Button
          type="button"
          variant="secondary"
          loading={isResendingActivation}
          onClick={handleResendActivation}
          className="w-full"
          size="lg"
        >
          Resend Activation Email
        </Button>
      )}
    </form>
  );
}

export default LoginForm;
