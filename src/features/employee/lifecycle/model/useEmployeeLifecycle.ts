import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateEmployeeLifecycleApi, type EmployeeLifecycleAction } from '../api/employeeLifecycleApi';

export function useEmployeeLifecycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: EmployeeLifecycleAction }) =>
      updateEmployeeLifecycleApi(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
