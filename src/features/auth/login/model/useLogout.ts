import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { logoutApi } from '../api/logoutApi';

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: logoutApi,
    onSettled: () => {
      // Clear in-memory state regardless of whether the network call succeeded.
      clearAuth();
      router.push('/login');
    }
  });
}
