// employees/[id]/page.tsx
// Renders the employee details page, consuming the employee module service via a hook.

'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { employeeService } from '@/src/modules/employee/services/employeeService';

type EmployeeDetailsPageProps = {
  params: { id: string };
};

export default function EmployeeDetailsPage({
  params
}: EmployeeDetailsPageProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['employee', params.id],
    queryFn: () => employeeService.getById(params.id)
  });

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-8">
        <p className="text-sm text-slate-500">Loading employee...</p>
      </main>
    );
  }

  if (isError || !data) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-xl font-semibold text-slate-900">{data.name}</h1>
      <p className="mt-1 text-sm text-slate-600">{data.email}</p>
      {(data.designation || data.department) && (
        <p className="mt-1 text-sm text-slate-500">
          {[data.designation, data.department].filter(Boolean).join(' · ')}
        </p>
      )}
    </main>
  );
}

