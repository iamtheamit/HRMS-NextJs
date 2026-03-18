// employees/[id]/page.tsx
// Renders the employee details page, consuming the employee module service via a hook.

'use client';

import Link from 'next/link';
import type { AxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import { notFound, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  UserSquare2,
} from 'lucide-react';
import { employeeService } from '@/entities/employee/services/employeeService';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';

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

type DocumentLink = {
  key: string;
  label: string;
  url: string;
};

const toLabel = (key: string) => {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const extractUrl = (value: unknown): string | null => {
  if (!value) return null;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (typeof value === 'object') {
    const candidate = value as Record<string, unknown>;
    const directUrl = candidate.url;
    if (typeof directUrl === 'string' && directUrl.trim()) {
      return directUrl.trim();
    }
  }

  return null;
};

const normalizeDocuments = (documents: unknown): DocumentLink[] => {
  if (!documents || typeof documents !== 'object' || Array.isArray(documents)) {
    return [];
  }

  const entries = Object.entries(documents as Record<string, unknown>);

  return entries
    .map(([key, value]) => {
      const url = extractUrl(value);
      if (!url) return null;
      return {
        key,
        label: toLabel(key),
        url,
      } as DocumentLink;
    })
    .filter((item): item is DocumentLink => Boolean(item));
};

export default function EmployeeDetailsPage({
}: Record<string, never>) {
  const params = useParams<{ id?: string | string[] }>();
  const employeeId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => employeeService.getById(employeeId as string),
    enabled: Boolean(employeeId),
  });

  if (!employeeId) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Resolving employee profile...</p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Loading employee...</p>
      </Card>
    );
  }

  if (isError) {
    const statusCode = (error as AxiosError | null)?.response?.status;
    if (statusCode === 404) {
      notFound();
    }

    return (
      <Card>
        <p className="text-sm text-red-600">Unable to load employee details right now. Please try again.</p>
      </Card>
    );
  }

  if (!data) {
    notFound();
  }

  const fullName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || 'Employee';
  const departmentName = data.department?.name || 'Not assigned';
  const managerName = data.manager
    ? `${data.manager.firstName ?? ''} ${data.manager.lastName ?? ''}`.trim() || data.manager.email
    : 'Not assigned';
  const phone = data.phone || `${data.countryCode || ''}${data.mobileNumber || ''}` || 'Not available';
  const documents = normalizeDocuments(data.documents);
  const initials = `${(data.firstName || '').charAt(0)}${(data.lastName || '').charAt(0)}`.toUpperCase() || 'NA';

  return (
    <div className="space-y-5">
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
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {data.profileUrl ? (
                <img src={data.profileUrl} alt={`${fullName} profile`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-slate-500">{initials}</div>
              )}
            </div>

            <div>
              <h1 className="text-xl font-semibold text-slate-900">{fullName}</h1>
              <p className="mt-1 text-sm text-slate-600">{data.email}</p>
              <p className="mt-1 text-xs text-slate-500">Employee ID: {data.id}</p>
            </div>
          </div>

          <Badge variant={statusVariant(data.status)}>{data.status || 'ACTIVE'}</Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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

        <Card>
          <h2 className="text-sm font-semibold text-slate-900">Profile & Documents</h2>

          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <div className="flex items-start gap-2">
              <UserSquare2 className="mt-0.5 h-4 w-4 text-slate-400" />
              {data.profileUrl ? (
                <a
                  href={data.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800"
                >
                  View Profile Image
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span>No profile image uploaded</span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Documents</p>

              {documents.length > 0 ? (
                <ul className="space-y-2">
                  {documents.map((document) => (
                    <li key={document.key}>
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
                      >
                        <span className="inline-flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500" />
                          {document.label}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  No documents uploaded for this employee.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
