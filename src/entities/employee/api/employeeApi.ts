import { apiClient } from '@/shared/api/apiClient';
import type { Employee } from '../types/employee.types';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const fetchEmployees = async (page = 1, size = 10) => {
  const res = await apiClient.get<ApiResponse<Employee[]>>('/employees', {
    params: { page, size }
  });
  return res.data.data;
};

export const fetchEmployeeById = async (id: string) => {
  const res = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`);
  return res.data.data;
};

export const updateEmployee = async (id: string, payload: Partial<Employee>) => {
  const res = await apiClient.put<ApiResponse<Employee>>(`/employees/${id}`, payload);
  return res.data.data;
};

export default { fetchEmployees, fetchEmployeeById, updateEmployee };
