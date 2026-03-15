import apiClient from '@/shared/api/apiClient';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role?: string;
  };
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function loginApi(payload: LoginRequest) {
  const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', payload);
  return res.data.data;
}
