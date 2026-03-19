import {
  fetchPayrollRecords,
  processPayrollRecord,
  markPayrollRecordPaid,
  processAllDraftPayroll,
} from '@/entities/payroll/api/payrollApi';
import type { PayrollQuery } from '@/entities/payroll/types/payroll.types';

export const payrollService = {
  async list(query: PayrollQuery = {}) {
    return fetchPayrollRecords(query);
  },
  async getEmployeeHistory(employeeId: string) {
    return fetchPayrollRecords({ employeeId });
  },
  async process(payrollId: string) {
    return processPayrollRecord(payrollId);
  },
  async markPaid(payrollId: string) {
    return markPayrollRecordPaid(payrollId);
  },
  async processAllDrafts(query: { month?: string; year?: number } = {}) {
    return processAllDraftPayroll(query);
  }
};

export default payrollService;
