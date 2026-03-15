import { useQuery } from '@tanstack/react-query';
import { payrollService } from '@/entities/payroll/services/payrollService';
import type { PayrollQuery } from '@/entities/payroll/types/payroll.types';

export function usePayroll(query: PayrollQuery = {}) {
  return useQuery({
    queryKey: ['payroll', query.month, query.year, query.employeeId],
    queryFn: () => payrollService.list(query)
  });
}

export default usePayroll;
