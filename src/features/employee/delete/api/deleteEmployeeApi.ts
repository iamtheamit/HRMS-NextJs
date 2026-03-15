import apiClient from '@/shared/api/apiClient';

export async function deleteEmployeeApi(id: string) {
  await apiClient.delete(`/employees/${id}`);
}
