export type SalaryStatus = 'Draft' | 'Processed' | 'Paid';

export type SalaryMonth = {
  month: string;
  year: number;
};

export type SalaryRates = {
  pfEmployeeRate: number;
  pfEmployerRate: number;
  esiRate: number;
  tdsRate: number;
};

export type SalaryComponents = {
  basic: number;
  hra: number;
  allowances: number;
  bonus: number;
  otherEarnings: number;
  otherDeductions: number;
};

export type SalaryTemplate = {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  month: string;
  year: number;
  workingDays: number;
  payableDays: number;
  status: SalaryStatus;
  rates: SalaryRates;
  components: SalaryComponents;
};

export type SalaryBreakdown = {
  grossPay: number;
  pfEmployee: number;
  pfEmployer: number;
  esi: number;
  tds: number;
  totalDeductions: number;
  netPay: number;
};

export type SalaryComputed = SalaryTemplate & {
  breakdown: SalaryBreakdown;
};

export type SalaryListResponse = {
  data: SalaryTemplate[];
  total: number;
};

export type SalaryQuery = {
  month?: string;
  year?: number;
  employeeId?: string;
};
