import apiClient from '@/shared/api/apiClient';
import type { CurrentUserResponse } from '../types/user.types';

export async function fetchCurrentUser() {
  const res = await apiClient.get<CurrentUserResponse>('/auth/me');
  return res.data;
}
