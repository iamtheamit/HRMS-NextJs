import { useMutation } from '@tanstack/react-query';
import { activateAccountApi } from '../api/activateApi';

export function useActivateAccount() {
  return useMutation({
    mutationFn: (token: string) => activateAccountApi(token),
  });
}
