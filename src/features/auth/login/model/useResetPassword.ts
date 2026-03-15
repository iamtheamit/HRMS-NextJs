import { useMutation } from '@tanstack/react-query';
import { forgotPasswordApi, resetPasswordApi } from '../api/resetPasswordApi';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPasswordApi(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPasswordApi(token, newPassword),
  });
}
