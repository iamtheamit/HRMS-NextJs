import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { loginApi, type LoginRequest } from '../api/loginApi';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: LoginRequest) => loginApi(payload),
    onSuccess: (data) => {
      if (!data?.token) return;
      const fallbackUser = {
        id: 'current-user',
        name: data.user?.name ?? 'Authenticated User',
        email: data.user?.email ?? '',
        role: data.user?.role
      };
      setAuth({ user: data.user ?? fallbackUser, token: data.token });
    }
  });
}
