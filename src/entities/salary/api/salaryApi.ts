import { apiClient } from '@/shared/api/apiClient';
import type { SalaryListResponse, SalaryQuery, SalaryTemplate } from '@/entities/salary/types/salary.types';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BackendSalaryRecord = {
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
  status: 'Draft' | 'Processed' | 'Paid';
  rates: SalaryTemplate['rates'];
  components: SalaryTemplate['components'];
};

const toSalaryTemplate = (row: BackendSalaryRecord): SalaryTemplate => {
  return {
    id: row.id,
    employeeId: row.employeeId,
    employeeCode: row.employeeCode,
    employeeName: row.employeeName,
    department: row.department,
    designation: row.designation,
    month: row.month,
    year: row.year,
    workingDays: row.workingDays,
    payableDays: row.payableDays,
    status: row.status,
    rates: row.rates,
    components: row.components,
  };
};

export async function fetchSalaryTemplates(query: SalaryQuery = {}): Promise<SalaryListResponse> {
  const res = await apiClient.get<ApiResponse<BackendSalaryRecord[]>>('/salary', {
    params: query,
  });

  const data = (res.data.data || []).map(toSalaryTemplate);
  return {
    data,
    total: data.length,
  };
}

export async function updateSalaryTemplate(
  id: string,
  patch: Partial<{
    status: SalaryTemplate['status'];
    payableDays: number;
    rates: Partial<SalaryTemplate['rates']>;
    components: Partial<SalaryTemplate['components']>;
  }>,
): Promise<SalaryTemplate> {
  const payload: Record<string, unknown> = {};

  if (patch.status) payload.status = patch.status;
  if (typeof patch.payableDays === 'number') payload.payableDays = patch.payableDays;

  if (patch.rates) {
    if (typeof patch.rates.pfEmployeeRate === 'number') payload.pfEmployeeRate = patch.rates.pfEmployeeRate;
    if (typeof patch.rates.pfEmployerRate === 'number') payload.pfEmployerRate = patch.rates.pfEmployerRate;
    if (typeof patch.rates.esiRate === 'number') payload.esiRate = patch.rates.esiRate;
    if (typeof patch.rates.tdsRate === 'number') payload.tdsRate = patch.rates.tdsRate;
  }

  if (patch.components) {
    if (typeof patch.components.basic === 'number') payload.basic = patch.components.basic;
    if (typeof patch.components.hra === 'number') payload.hra = patch.components.hra;
    if (typeof patch.components.allowances === 'number') payload.allowances = patch.components.allowances;
    if (typeof patch.components.bonus === 'number') payload.bonus = patch.components.bonus;
    if (typeof patch.components.otherEarnings === 'number') payload.otherEarnings = patch.components.otherEarnings;
    if (typeof patch.components.otherDeductions === 'number') payload.otherDeductions = patch.components.otherDeductions;
  }

  const res = await apiClient.patch<ApiResponse<BackendSalaryRecord>>(`/salary/${id}`, payload);
  return toSalaryTemplate(res.data.data);
}

export default {
  fetchSalaryTemplates,
  updateSalaryTemplate,
};
