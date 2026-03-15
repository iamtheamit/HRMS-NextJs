import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { loginApi, type LoginRequest } from '../api/loginApi';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: LoginRequest) => loginApi(payload),
    onSuccess: (data) => {
      if (!data?.user) return;
      const name = data.user.name || [data.user.firstName, data.user.lastName].filter(Boolean).join(' ') || 'Authenticated User';
      setAuth({
        user: {
          id: data.user.id ?? 'current-user',
          employeeId: data.user.employeeId,
          name,
          email: data.user.email ?? '',
          role: data.user.role
        }
      });
    }
  });
}
