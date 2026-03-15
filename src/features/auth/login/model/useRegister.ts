import { useMutation } from '@tanstack/react-query';
import { registerApi, type RegisterRequest } from '../api/registerApi';

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => registerApi(payload),
  });
}
