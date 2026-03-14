// authService.ts
// Handles API requests related to authentication, such as login and logout.

import { apiClient } from '@/src/shared/services/apiClient';
import type { LoginPayload, LoginResponse } from '@/src/modules/auth/types/auth.types';

const AUTH_BASE = '/auth';

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(`${AUTH_BASE}/login`, payload);
    return data;
  }
};

