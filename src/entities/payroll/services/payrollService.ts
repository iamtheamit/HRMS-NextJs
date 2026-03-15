import { fetchPayrollRecords } from '@/entities/payroll/api/payrollApi';
import type { PayrollQuery } from '@/entities/payroll/types/payroll.types';

export const payrollService = {
  async list(query: PayrollQuery = {}) {
    return fetchPayrollRecords(query);
  },
  async getEmployeeHistory(employeeId: string) {
    return fetchPayrollRecords({ employeeId });
  }
};

export default payrollService;
