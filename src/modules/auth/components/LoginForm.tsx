// LoginForm.tsx
// Renders the login form UI and connects it with auth hooks and validation.

'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { loginSchema, type LoginFormValues } from '@/src/modules/auth/validation/login.schema';
import { useAuth } from '@/src/modules/auth/hooks/useAuth';
import { Button } from '@/src/shared/components/Button';
import { Input } from '@/src/shared/components/Input';

type LoginFormProps = {
  onSuccess?: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login, loading, error } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await login(values);
      onSuccess?.();
    } catch {
      setFormError('Login failed. Please check your credentials.');
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        {...register('password')}
        error={errors.password?.message}
      />
      {(error || formError) && (
        <p className="text-sm text-red-600">{formError ?? error}</p>
      )}
      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Login
      </Button>
    </form>
  );
};

