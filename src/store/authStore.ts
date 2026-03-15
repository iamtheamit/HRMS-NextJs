// authStore.ts
// Manages global authentication state using Zustand.
// Tokens are stored in HttpOnly cookies set by the backend — this store holds
// only the in-memory user profile and authentication flag.

import { create } from 'zustand';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (payload: { user: AuthUser }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: ({ user }) => {
    set({ user, isAuthenticated: true });
  },
  clearAuth: () => {
    set({ user: null, isAuthenticated: false });
  }
}));

