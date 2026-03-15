import apiClient from '@/shared/api/apiClient';
import type { Employee } from '@/entities/employee/types/employee.types';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type UpdateEmployeePayload = Partial<
  Pick<
    Employee,
    'firstName' | 'lastName' | 'email' | 'role' | 'phone' | 'countryCode' | 'mobileNumber' | 'profileUrl' | 'documents'
  >
>;

export async function updateEmployeeApi(id: string, payload: UpdateEmployeePayload) {
  const res = await apiClient.put<ApiResponse<Employee>>(`/employees/${id}`, payload);
  return res.data.data;
}
