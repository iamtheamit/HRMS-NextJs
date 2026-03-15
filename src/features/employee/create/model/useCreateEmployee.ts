import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEmployeeApi, type CreateEmployeePayload } from '../api/createEmployeeApi';

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEmployeePayload) => createEmployeeApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
}
