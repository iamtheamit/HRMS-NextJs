import { useQuery } from '@tanstack/react-query';
import { salaryService } from '@/entities/salary/services/salaryService';
import type { SalaryQuery } from '@/entities/salary/types/salary.types';

export function useSalary(query: SalaryQuery = {}) {
  return useQuery({
    queryKey: ['salary', query.month, query.year, query.employeeId],
    queryFn: () => salaryService.list(query)
  });
}

export default useSalary;
