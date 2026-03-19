import { fetchSalaryTemplates, updateSalaryTemplate } from '@/entities/salary/api/salaryApi';
import type { SalaryQuery } from '@/entities/salary/types/salary.types';
import type { SalaryOverride } from '@/features/payroll/model/payrollCalculations';

export const salaryService = {
  async list(query: SalaryQuery = {}) {
    return fetchSalaryTemplates(query);
  },
  async getEmployeeHistory(employeeId: string) {
    return fetchSalaryTemplates({ employeeId });
  },
  async update(id: string, patch: SalaryOverride) {
    return updateSalaryTemplate(id, patch);
  }
};

export default salaryService;
