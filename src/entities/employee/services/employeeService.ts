import { apiClient } from '@/shared/api/apiClient';
import type { Employee } from '../types/employee.types';

export const employeeService = {
  async getById(id: string): Promise<Employee> {
    const res = await apiClient.get<Employee>(`/employees/${id}`);
    return res.data;
  }
};

export default employeeService;
