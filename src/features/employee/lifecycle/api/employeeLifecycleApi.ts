import apiClient from '@/shared/api/apiClient';

export type EmployeeLifecycleAction = 'BLOCK' | 'DELETE';

export async function updateEmployeeLifecycleApi(id: string, action: EmployeeLifecycleAction) {
  const res = await apiClient.patch(`/employees/${id}/lifecycle`, { action });
  return res.data;
}
