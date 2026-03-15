import apiClient from '@/shared/api/apiClient';
import type { Employee } from '@/entities/employee/types/employee.types';

export type CreateEmployeePayload = {
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
};

export async function createEmployeeApi(payload: CreateEmployeePayload) {
  const res = await apiClient.post<Employee>('/employees', payload);
  return res.data;
}
