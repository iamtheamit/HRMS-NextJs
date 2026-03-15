import apiClient from '@/shared/api/apiClient';
import type { Employee } from '@/entities/employee/types/employee.types';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type CreateEmployeePayload = {
  firstName: string;
  lastName: string;
  email: string;
  role?: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
  departmentId?: string;
  managerId?: string;
  phone?: string;
  countryCode?: string;
  mobileNumber?: string;
  profileUrl?: string;
  documents?: unknown;
};

export async function createEmployeeApi(payload: CreateEmployeePayload) {
  const res = await apiClient.post<ApiResponse<Employee>>('/employees', payload);
  return res.data.data;
}
