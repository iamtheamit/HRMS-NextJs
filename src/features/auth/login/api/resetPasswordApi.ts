import apiClient from '@/shared/api/apiClient';

type ApiResponse = {
  success: boolean;
  message: string;
  data: null;
};

export async function forgotPasswordApi(email: string): Promise<void> {
  await apiClient.post<ApiResponse>('/auth/reset-password-request', { email });
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<void> {
  await apiClient.post<ApiResponse>('/auth/reset-password', { token, newPassword });
}
