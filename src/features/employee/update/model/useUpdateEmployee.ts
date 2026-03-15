import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEmployeeApi, type UpdateEmployeePayload } from '../api/updateEmployeeApi';

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) => updateEmployeeApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
}
