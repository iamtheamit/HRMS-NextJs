import { salaryTemplates } from '@/entities/salary/api/salaryApi';
import type { PayrollListResponse, PayrollQuery, PayrollRecord } from '@/entities/payroll/types/payroll.types';

const MOCK_DELAY_MS = 120;

const roundAmount = (value: number) => Math.round(value * 100) / 100;

function toPayrollRecord(template: (typeof salaryTemplates)[number]): PayrollRecord {
  const grossPay =
    template.components.basic +
    template.components.hra +
    template.components.allowances +
    template.components.bonus +
    template.components.otherEarnings;

  const pfEmployee = template.components.basic * (template.rates.pfEmployeeRate / 100);
  const esi = grossPay * (template.rates.esiRate / 100);
  const tds = grossPay * (template.rates.tdsRate / 100);
  const totalDeductions = pfEmployee + esi + tds + template.components.otherDeductions;

  return {
    payrollId: template.id,
    employeeId: template.employeeId,
    employeeName: template.employeeName,
    employeeCode: template.employeeCode,
    department: template.department,
    month: template.month,
    year: template.year,
    grossPay: roundAmount(grossPay),
    totalDeductions: roundAmount(totalDeductions),
    netPay: roundAmount(grossPay - totalDeductions),
    status: template.status,
    processedAt: template.status === 'Draft' ? undefined : `${template.year}-${template.month === 'March' ? '03' : template.month === 'February' ? '02' : '01'}-28`
  };
}

function wait(delay = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export async function fetchPayrollRecords(query: PayrollQuery = {}): Promise<PayrollListResponse> {
  await wait();

  const filtered = salaryTemplates
    .filter((entry) => {
      const matchesMonth = query.month ? entry.month === query.month : true;
      const matchesYear = query.year ? entry.year === query.year : true;
      const matchesEmployee = query.employeeId ? entry.employeeId === query.employeeId : true;

      return matchesMonth && matchesYear && matchesEmployee;
    })
    .map((entry) => toPayrollRecord(entry));

  return {
    data: filtered,
    total: filtered.length
  };
}

export default {
  fetchPayrollRecords
};
