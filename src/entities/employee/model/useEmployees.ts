import { useQuery } from '@tanstack/react-query';
import { fetchEmployees } from '../api/employeeApi';

export function useEmployees(page = 1, size = 10) {
  return useQuery({
    queryKey: ['employees', page, size],
    queryFn: () => fetchEmployees(page, size)
  });
}

export default useEmployees;
