import apiClient from '@/shared/api/apiClient';
import type { User } from '../types/user.types';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function fetchCurrentUser(): Promise<User> {
  const res = await apiClient.get<ApiResponse<User>>('/auth/me');
  return res.data.data;
}
