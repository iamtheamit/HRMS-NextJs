import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteEmployeeApi } from '../api/deleteEmployeeApi';

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEmployeeApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });
}
