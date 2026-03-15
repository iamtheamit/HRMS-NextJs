import type { SalaryListResponse, SalaryQuery, SalaryTemplate } from '@/entities/salary/types/salary.types';

const MOCK_DELAY_MS = 120;

export const salaryTemplates: SalaryTemplate[] = [
  {
    id: 'sal-2026-03-1001',
    employeeId: 'emp-1001',
    employeeCode: 'EMP-1001',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    designation: 'Frontend Engineer',
    month: 'March',
    year: 2026,
    workingDays: 26,
    payableDays: 25,
    status: 'Processed',
    rates: { pfEmployeeRate: 12, pfEmployerRate: 12, esiRate: 0.75, tdsRate: 6 },
    components: { basic: 42000, hra: 16800, allowances: 7000, bonus: 2000, otherEarnings: 1200, otherDeductions: 800 }
  },
  {
    id: 'sal-2026-03-1002',
    employeeId: 'emp-1002',
    employeeCode: 'EMP-1002',
    employeeName: 'Rahul Mehta',
    department: 'Engineering',
    designation: 'Backend Engineer',
    month: 'March',
    year: 2026,
    workingDays: 26,
    payableDays: 24,
    status: 'Draft',
    rates: { pfEmployeeRate: 12, pfEmployerRate: 12, esiRate: 0.75, tdsRate: 5.5 },
    components: { basic: 45000, hra: 18000, allowances: 7600, bonus: 1800, otherEarnings: 1000, otherDeductions: 1000 }
  },
  {
    id: 'sal-2026-03-1003',
    employeeId: 'emp-1003',
    employeeCode: 'EMP-1003',
    employeeName: 'Ananya Joshi',
    department: 'Human Resources',
    designation: 'HR Business Partner',
    month: 'March',
    year: 2026,
    workingDays: 26,
    payableDays: 26,
    status: 'Paid',
    rates: { pfEmployeeRate: 12, pfEmployerRate: 12, esiRate: 0.75, tdsRate: 4.8 },
    components: { basic: 36000, hra: 14400, allowances: 6200, bonus: 1200, otherEarnings: 800, otherDeductions: 700 }
  },
  {
    id: 'sal-2026-03-1004',
    employeeId: 'emp-1004',
    employeeCode: 'EMP-1004',
    employeeName: 'Sneha Patel',
    department: 'Finance',
    designation: 'Accounts Executive',
    month: 'March',
    year: 2026,
    workingDays: 26,
    payableDays: 23,
    status: 'Processed',
    rates: { pfEmployeeRate: 12, pfEmployerRate: 12, esiRate: 0.75, tdsRate: 4.2 },
    components: { basic: 33000, hra: 13200, allowances: 5400, bonus: 1000, otherEarnings: 900, otherDeductions: 600 }
  },
  {
    id: 'sal-2026-02-1001',
    employeeId: 'emp-1001',
    employeeCode: 'EMP-1001',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    designation: 'Frontend Engineer',
    month: 'February',
    year: 2026,
    workingDays: 24,
    payableDays: 23,
    status: 'Paid',
    rates: { pfEmployeeRate: 12, pfEmployerRate: 12, esiRate: 0.75, tdsRate: 6 },
    components: { basic: 42000, hra: 16800, allowances: 6800, bonus: 1200, otherEarnings: 900, otherDeductions: 900 }
  },
  {
    id: 'sal-2026-02-1002',
    employeeId: 'emp-1002',
    employeeCode: 'EMP-1002',
    employeeName: 'Rahul Mehta',
    department: 'Engineering',
    designation: 'Backend Engineer',
    month: 'February',
    year: 2026,
    workingDays: 24,
    payableDays: 24,
    status: 'Paid',
    rates: { pfEmployeeRate: 12, pfEmployerRate: 12, esiRate: 0.75, tdsRate: 5.5 },
    components: { basic: 45000, hra: 18000, allowances: 7500, bonus: 1500, otherEarnings: 1000, otherDeductions: 950 }
  },
  {
    id: 'sal-2026-02-1003',
    employeeId: 'emp-1003',
    employeeCode: 'EMP-1003',
    employeeName: 'Ananya Joshi',
    department: 'Human Resources',
    designation: 'HR Business Partner',
    month: 'February',
    year: 2026,
    workingDays: 24,
    payableDays: 24,
    status: 'Paid',
    rates: { pfEmployeeRate: 12, pfEmployerRate: 12, esiRate: 0.75, tdsRate: 4.8 },
    components: { basic: 36000, hra: 14400, allowances: 6000, bonus: 900, otherEarnings: 700, otherDeductions: 650 }
  },
  {
    id: 'sal-2026-01-1001',
    employeeId: 'emp-1001',
    employeeCode: 'EMP-1001',
    employeeName: 'Priya Sharma',
    department: 'Engineering',
    designation: 'Frontend Engineer',
    month: 'January',
    year: 2026,
    workingDays: 26,
    payableDays: 24,
    status: 'Paid',
    rates: { pfEmployeeRate: 12, pfEmployerRate: 12, esiRate: 0.75, tdsRate: 6 },
    components: { basic: 42000, hra: 16800, allowances: 6500, bonus: 1000, otherEarnings: 600, otherDeductions: 700 }
  },
  {
    id: 'sal-2026-01-1004',
    employeeId: 'emp-1004',
    employeeCode: 'EMP-1004',
    employeeName: 'Sneha Patel',
    department: 'Finance',
    designation: 'Accounts Executive',
    month: 'January',
    year: 2026,
    workingDays: 26,
    payableDays: 25,
    status: 'Paid',
    rates: { pfEmployeeRate: 12, pfEmployerRate: 12, esiRate: 0.75, tdsRate: 4.2 },
    components: { basic: 33000, hra: 13200, allowances: 5200, bonus: 900, otherEarnings: 700, otherDeductions: 550 }
  }
];

function wait(delay = MOCK_DELAY_MS) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export async function fetchSalaryTemplates(query: SalaryQuery = {}): Promise<SalaryListResponse> {
  await wait();

  const filtered = salaryTemplates.filter((entry) => {
    const matchesMonth = query.month ? entry.month === query.month : true;
    const matchesYear = query.year ? entry.year === query.year : true;
    const matchesEmployee = query.employeeId ? entry.employeeId === query.employeeId : true;

    return matchesMonth && matchesYear && matchesEmployee;
  });

  return {
    data: filtered,
    total: filtered.length
  };
}

export default {
  fetchSalaryTemplates
};
