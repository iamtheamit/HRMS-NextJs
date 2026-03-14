// page.tsx
// Renders the public landing page or redirect logic for the HRMS dashboard.

import Link from 'next/link';
import { routes } from '@/constants/routes';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white/5 p-8 shadow-xl ring-1 ring-white/10 backdrop-blur">
        <h1 className="text-2xl font-semibold text-white">HRMS Dashboard</h1>
        <p className="mt-2 text-sm text-slate-200">
          Modern HR management for enterprise teams.
        </p>
        <div className="mt-6">
          <Link
            href={routes.login}
            className="inline-flex w-full items-center justify-center rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary-600"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

