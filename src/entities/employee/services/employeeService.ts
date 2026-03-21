import { apiClient } from '@/shared/api/apiClient';
import type { Employee } from '../types/employee.types';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const employeeService = {
  async getById(id: string): Promise<Employee> {
    const res = await apiClient.get<ApiResponse<Employee>>(`/employees/${id}`);
    return res.data.data;
  },

  async update(id: string, payload: Partial<Employee>): Promise<Employee> {
    const res = await apiClient.put<ApiResponse<Employee>>(`/employees/${id}`, payload);
    return res.data.data;
  }
};

export default employeeService;
