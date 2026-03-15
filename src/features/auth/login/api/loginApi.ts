import apiClient from '@/shared/api/apiClient';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
};

export async function loginApi(payload: LoginRequest) {
  const res = await apiClient.post<LoginResponse>('/auth/login', payload);
  return res.data;
}
