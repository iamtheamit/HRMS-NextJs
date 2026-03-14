// login/page.tsx
// Renders the login page and mounts the LoginForm component.

import { redirect } from 'next/navigation';
import { LoginForm } from '@/src/modules/auth/components/LoginForm';
import { routes } from '@/src/constants/routes';
import { useAuthStore } from '@/src/store/authStore';

export default function LoginPage() {
  const { isAuthenticated } = useAuthStore.getState();

  if (isAuthenticated) {
    redirect(routes.dashboard);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-xl font-semibold text-slate-900">Sign in to HRMS</h1>
        <p className="mt-1 text-sm text-slate-500">
          Use your corporate credentials to access the dashboard.
        </p>
        <div className="mt-6">
          <LoginForm onSuccess={() => redirect(routes.dashboard)} />
        </div>
      </div>
    </main>
  );
}

