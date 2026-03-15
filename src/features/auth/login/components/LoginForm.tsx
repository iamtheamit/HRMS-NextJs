"use client";

import React, { useState } from 'react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import apiClient from '@/shared/api/apiClient';

export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      // store token if provided
      if (res?.data?.token && typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.token);
      }
      onSuccess && onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div className="flex items-center justify-between">
        <Button type="submit" loading={loading}>Sign in</Button>
      </div>
    </form>
  );
}

export default LoginForm;
