import type { SalaryStatus } from '@/entities/salary/types/salary.types';

export type PayrollStatus = SalaryStatus;

export type PayrollRecord = {
  payrollId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  month: string;
  year: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  status: PayrollStatus;
  processedAt?: string;
};

export type PayrollListResponse = {
  data: PayrollRecord[];
  total: number;
};

export type PayrollQuery = {
  month?: string;
  year?: number;
  employeeId?: string;
};
