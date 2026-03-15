import { useQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from '../api/userApi';
import { useAuthStore } from '@/store/authStore';

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
