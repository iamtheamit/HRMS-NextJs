// employeeService.ts
// Handles API requests related to employee resources.

import { apiClient } from '@/src/shared/services/apiClient';
import type { Employee, CreateEmployeePayload } from '@/src/modules/employee/types/employee.types';

const EMPLOYEE_BASE = '/employees';

export const employeeService = {
  list: async (): Promise<Employee[]> => {
    const { data } = await apiClient.get<Employee[]>(EMPLOYEE_BASE);
    return data;
  },
  getById: async (id: string): Promise<Employee> => {
    const { data } = await apiClient.get<Employee>(`${EMPLOYEE_BASE}/${id}`);
    return data;
  },
  create: async (payload: CreateEmployeePayload): Promise<Employee> => {
    const { data } = await apiClient.post<Employee>(EMPLOYEE_BASE, payload);
    return data;
  }
};

