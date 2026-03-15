import Link from 'next/link';
import { routes } from '@/constants/routes';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white shadow-lg shadow-brand-600/30">
        H
      </div>
      <h1 className="mt-6 text-3xl font-bold text-white">HRMS Dashboard</h1>
      <p className="mt-2 max-w-md text-center text-sm leading-relaxed text-slate-400">
        Modern HR management for enterprise teams. Track employees, attendance,
        leaves, and more.
      </p>
      <Link
        href={routes.login}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-8 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700"
      >
        Get Started
      </Link>
    </main>
  );
}

