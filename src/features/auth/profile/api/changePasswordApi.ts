import apiClient from '@/shared/api/apiClient';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function requestChangePasswordOtpApi() {
  const res = await apiClient.post<ApiResponse<null>>('/auth/change-password-otp-request');
  return res.data;
}

export type ChangePasswordWithOtpPayload = {
  currentPassword: string;
  otp: string;
  newPassword: string;
};

export async function changePasswordWithOtpApi(payload: ChangePasswordWithOtpPayload) {
  const res = await apiClient.post<ApiResponse<null>>('/auth/change-password-with-otp', payload);
  return res.data;
}
