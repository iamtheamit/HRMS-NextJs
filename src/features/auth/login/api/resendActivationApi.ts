import apiClient from '@/shared/api/apiClient';

export type ResendActivationRequest = {
  email: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function resendActivationEmailApi(payload: ResendActivationRequest) {
  const res = await apiClient.post<ApiResponse<null>>('/auth/resend-activation-email', payload);
  return res.data.data;
}
