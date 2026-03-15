import apiClient from '@/shared/api/apiClient';

export type RegisterRequest = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};

export type RegisterResponse = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function registerApi(payload: RegisterRequest): Promise<RegisterResponse> {
  const res = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/register', payload);
  return res.data.data;
}
