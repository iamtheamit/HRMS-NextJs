import apiClient from '@/shared/api/apiClient';

type ApiResponse = {
  success: boolean;
  message: string;
  data: null;
};

export async function activateAccountApi(token: string): Promise<void> {
  await apiClient.post<ApiResponse>('/auth/activate-account', { token });
}
