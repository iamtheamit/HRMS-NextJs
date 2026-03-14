// useAuth.ts
// Exposes authentication actions and state using Zustand and auth service.

'use client';

import { useState } from 'react';
import { authService } from '@/src/modules/auth/services/authService';
import type { LoginFormValues } from '@/src/modules/auth/validation/login.schema';
import { useAuthStore } from '@/src/store/authStore';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, clearAuth, user, isAuthenticated } = useAuthStore();

  const login = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(values);
      setAuth({ user: response.user, token: response.token });
    } catch (err: unknown) {
      setError('Unable to login with provided credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    loading,
    error
  };
};

