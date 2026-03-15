import { fetchSalaryTemplates } from '@/entities/salary/api/salaryApi';
import type { SalaryQuery } from '@/entities/salary/types/salary.types';

export const salaryService = {
  async list(query: SalaryQuery = {}) {
    return fetchSalaryTemplates(query);
  },
  async getEmployeeHistory(employeeId: string) {
    return fetchSalaryTemplates({ employeeId });
  }
};

export default salaryService;
