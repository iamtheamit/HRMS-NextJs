// useEmployees.ts
// Encapsulates employee-related data fetching with TanStack Query.

'use client';

import { useQuery } from '@tanstack/react-query';
import { employeeService } from '@/src/modules/employee/services/employeeService';

export const useEmployees = () => {
  const query = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.list()
  });

  return query;
};


