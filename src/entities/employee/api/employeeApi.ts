import { apiClient } from '@/shared/api/apiClient';
import type { EmployeeListResponse } from '../types/employee.types';

export const fetchEmployees = async (page = 1, size = 10) => {
  const res = await apiClient.get<EmployeeListResponse>('/employees', {
    params: { page, size }
  });
  return res.data;
};

export default { fetchEmployees };
