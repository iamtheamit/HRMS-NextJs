// authStore.ts
// Manages global authentication state using Zustand.

import { create } from 'zustand';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: { user: AuthUser; token: string }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: ({ user, token }) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hrms_token', token);
    }
    set({ user, token, isAuthenticated: true });
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('hrms_token');
    }
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

