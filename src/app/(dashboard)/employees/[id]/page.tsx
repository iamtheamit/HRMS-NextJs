// employees/[id]/page.tsx
// Renders the employee details page, consuming the employee module service via a hook.

'use client';

import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { useQuery } from '@tanstack/react-query';
import { FileText, UploadCloud } from 'lucide-react';
import { notFound } from 'next/navigation';
import { employeeService } from '@/entities/employee/services/employeeService';

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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <p className="text-sm text-slate-500">Loading employee...</p>
      </div>
    );
  }

  if (isError || !data) {
    notFound();
  }

  const fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim();

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900">{fullName || 'Employee Profile'}</h1>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600">{data.email || 'email@example.com'}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">Edit Profile</Button>
            <Button>Save</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Personal Details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="First Name" defaultValue={data.firstName} />
            <Input label="Last Name" defaultValue={data.lastName} />
            <Input label="Date of Birth" type="date" defaultValue="1995-01-15" />
            <Input label="Contact" defaultValue="+91 98xxxxxx12" />
            <div className="sm:col-span-2">
              <Input label="Address" defaultValue="Bengaluru, Karnataka" />
            </div>
            <div className="sm:col-span-2">
              <Input label="Photo" type="file" accept="image/*" />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Job Details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Designation" defaultValue={data.role || 'Software Engineer'} />
            <Input label="Department" defaultValue="Engineering" />
            <Input label="Joining Date" type="date" defaultValue={(data.joinedAt || '2024-03-01').slice(0, 10)} />
            <Input label="Employee ID" defaultValue={`EMP-${data.id.slice(0, 6).toUpperCase()}`} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Documents</h2>
            <p className="text-xs text-slate-500">Upload Aadhar, PAN, offer letter, and supporting records</p>
          </div>
          <Badge variant="warning">2 Pending</Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Aadhar</p>
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-brand-300 hover:bg-brand-50/40">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload file</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
            </label>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">PAN</p>
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-brand-300 hover:bg-brand-50/40">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Upload file</span>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" />
            </label>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Offer Letter</p>
            <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 transition hover:border-brand-300 hover:bg-brand-50/40">
              <FileText className="h-3.5 w-3.5" />
              <span>Upload PDF</span>
              <input type="file" accept=".pdf" className="hidden" />
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}
