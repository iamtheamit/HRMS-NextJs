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

export default { fetchEmployees };
