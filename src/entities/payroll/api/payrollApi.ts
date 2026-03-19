import { apiClient } from '@/shared/api/apiClient';
import type { PayrollListResponse, PayrollQuery, PayrollRecord } from '@/entities/payroll/types/payroll.types';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function fetchPayrollRecords(query: PayrollQuery = {}): Promise<PayrollListResponse> {
  const res = await apiClient.get<ApiResponse<PayrollRecord[]>>('/payroll', {
    params: query,
  });

  const data = res.data.data || [];
  return {
    data,
    total: data.length,
  };
}

export async function processPayrollRecord(payrollId: string): Promise<PayrollRecord> {
  const res = await apiClient.post<ApiResponse<PayrollRecord>>(`/payroll/${payrollId}/process`);
  return res.data.data;
}

export async function markPayrollRecordPaid(payrollId: string): Promise<PayrollRecord> {
  const res = await apiClient.post<ApiResponse<PayrollRecord>>(`/payroll/${payrollId}/mark-paid`);
  return res.data.data;
}

export async function processAllDraftPayroll(params: { month?: string; year?: number } = {}): Promise<PayrollRecord[]> {
  const res = await apiClient.post<ApiResponse<PayrollRecord[]>>('/payroll/process-all', undefined, {
    params,
  });
  return res.data.data || [];
}

export default {
  fetchPayrollRecords,
  processPayrollRecord,
  markPayrollRecordPaid,
  processAllDraftPayroll,
};
