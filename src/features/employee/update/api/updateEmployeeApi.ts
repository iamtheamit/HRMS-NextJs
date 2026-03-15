import apiClient from '@/shared/api/apiClient';
import type { Employee } from '@/entities/employee/types/employee.types';

export type UpdateEmployeePayload = Partial<Pick<Employee, 'firstName' | 'lastName' | 'email' | 'role'>>;

export async function updateEmployeeApi(id: string, payload: UpdateEmployeePayload) {
  const res = await apiClient.patch<Employee>(`/employees/${id}`, payload);
  return res.data;
}
