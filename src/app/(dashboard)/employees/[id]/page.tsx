// employees/[id]/page.tsx
// Renders the employee details page, consuming the employee module service via a hook.

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { ArrowLeft, Briefcase, Building2, CalendarDays, Mail, Phone, ShieldCheck, UserSquare2 } from 'lucide-react';
import { employeeService } from '@/entities/employee/services/employeeService';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';

type EmployeeDetailsPageProps = {
  params: { id: string };
};

const formatDate = (value?: string) => {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

const statusVariant = (status?: string) => {
  if (status === 'INACTIVE') return 'warning' as const;
  if (status === 'TERMINATED') return 'danger' as const;
  return 'success' as const;
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
      <Card>
        <p className="text-sm text-slate-500">Loading employee...</p>
      </Card>
    );
  }

  if (isError || !data) {
    notFound();
  }

  const fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || 'Employee';
  const departmentName = data.department?.name || 'Not assigned';
  const managerName = data.manager
    ? `${data.manager.firstName ?? ''} ${data.manager.lastName ?? ''}`.trim() || data.manager.email
    : 'Not assigned';
  const phone = data.phone || `${data.countryCode || ''}${data.mobileNumber || ''}` || 'Not available';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{fullName}</h1>
            <p className="mt-1 text-sm text-slate-600">{data.email}</p>
          </div>
          <Badge variant={statusVariant(data.status)}>{data.status || 'ACTIVE'}</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-slate-900">Employment Details</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-slate-400" />
              <span>Role: {data.role || 'Not assigned'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" />
              <span>Department: {departmentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              <span>Manager: {managerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              <span>Joined: {formatDate(data.joinedAt || data.hireDate)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-900">Contact & Account</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>Email: {data.email || 'Not available'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>Phone: {phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserSquare2 className="h-4 w-4 text-slate-400" />
              <span>User Status: {data.user?.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              <span>Account Role: {data.user?.role || data.role || 'Not assigned'}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
