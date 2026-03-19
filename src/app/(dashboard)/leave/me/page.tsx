'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { LeaveApplicationWizard } from '@/features/leave/ui/LeaveApplicationWizard';
import type { LeaveRequestForm } from '@/features/leave/model/useLeaveManagement';
import { createLeaveApi, listLeaveApi, type LeaveItem } from '@/features/leave/api/leaveApi';
import { useAuthStore } from '@/store/authStore';
import { RoleGuard } from '@/shared/ui/RoleGuard';

const statusVariant = {
  PENDING: 'warning' as const,
  MANAGER_PENDING: 'warning' as const,
  HR_PENDING: 'warning' as const,
  APPROVED: 'success' as const,
  REJECTED: 'danger' as const,
};

const isPendingStatus = (status: LeaveItem['status']) => {
  return status === 'PENDING' || status === 'MANAGER_PENDING' || status === 'HR_PENDING';
};

const formatStatusLabel = (status: LeaveItem['status']) => {
  if (status === 'MANAGER_PENDING') return 'PENDING (MANAGER)';
  if (status === 'HR_PENDING') return 'PENDING (HR)';
  return status;
};

const toUiType = (type: LeaveItem['type']) => {
  if (type === 'SICK') return 'SL';
  if (type === 'ANNUAL') return 'EL';
  return 'CL';
};

const countDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end.getTime() - start.getTime();
  const raw = Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
  return raw > 0 ? raw : 0;
};

const leavePolicy = {
  CL: 12,
  SL: 10,
  EL: 18,
} as const;

export default function LeaveSelfPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  const leaveQuery = useQuery({
    queryKey: ['leave-self', user?.employeeId],
    queryFn: () => listLeaveApi(user?.employeeId ?? undefined),
    enabled: !!user?.employeeId,
  });

  const createLeaveMutation = useMutation({
    mutationFn: createLeaveApi,
    onSuccess: async () => {
      setIsApplicationOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['leave-self', user?.employeeId] });
    },
  });

  const requests = leaveQuery.data || [];

  const selfEmployee = useMemo(() => {
    if (!user?.employeeId) return null;
    return {
      id: user.employeeId,
      name: user.name,
      department: 'My Department',
    };
  }, [user?.employeeId, user?.name]);

  const stats = useMemo(() => {
    return {
      pending: requests.filter((request) => isPendingStatus(request.status)).length,
      approved: requests.filter((request) => request.status === 'APPROVED').length,
      rejected: requests.filter((request) => request.status === 'REJECTED').length,
      totalDays: requests.reduce((sum, request) => sum + countDays(request.startDate, request.endDate), 0),
    };
  }, [requests]);

  const leaveBalance = useMemo(() => {
    const approvedDays = {
      CL: 0,
      SL: 0,
      EL: 0,
    };

    requests.forEach((request) => {
      if (request.status !== 'APPROVED') return;
      const days = countDays(request.startDate, request.endDate);

      if (request.type === 'SICK') {
        approvedDays.SL += days;
        return;
      }

      if (request.type === 'ANNUAL') {
        approvedDays.EL += days;
        return;
      }

      approvedDays.CL += days;
    });

    return [
      {
        label: 'Casual Leave (CL)',
        total: leavePolicy.CL,
        used: approvedDays.CL,
        remaining: Math.max(leavePolicy.CL - approvedDays.CL, 0),
      },
      {
        label: 'Sick Leave (SL)',
        total: leavePolicy.SL,
        used: approvedDays.SL,
        remaining: Math.max(leavePolicy.SL - approvedDays.SL, 0),
      },
      {
        label: 'Earned Leave (EL)',
        total: leavePolicy.EL,
        used: approvedDays.EL,
        remaining: Math.max(leavePolicy.EL - approvedDays.EL, 0),
      },
    ];
  }, [requests]);

  const submitSelfRequest = async (form: LeaveRequestForm) => {
    await createLeaveMutation.mutateAsync({
      startDate: form.from,
      endDate: form.to,
      type: form.type,
      reason: form.reason,
    });
  };

  return (
    <RoleGuard allowedRoles={['EMPLOYEE']}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">My Leave</h2>
            <p className="text-sm text-slate-500">Apply for leave and monitor your request status.</p>
          </div>
          <Button onClick={() => setIsApplicationOpen(true)}>New Leave Request</Button>
        </div>

        {leaveQuery.isLoading ? (
          <Card>
            <p className="text-sm text-slate-600">Loading leave requests...</p>
          </Card>
        ) : leaveQuery.isError ? (
          <Card>
            <p className="text-sm text-red-600">Could not load leave requests right now.</p>
          </Card>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <p className="text-xs text-slate-500">Pending</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.pending}</p>
              <p className="text-xs text-slate-400">awaiting approval</p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500">Approved</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.approved}</p>
              <p className="text-xs text-slate-400">approved requests</p>
            </Card>
            <Card>
              <p className="text-xs text-slate-500">Rejected</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.rejected}</p>
              <p className="text-xs text-slate-400">rejected requests</p>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Requested Days</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{stats.totalDays}</p>
                </div>
                <CalendarClock className="h-5 w-5 text-brand-600" />
              </div>
            </Card>
          </section>
        )}

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">My Leave Balance</h3>
              <p className="text-xs text-slate-500">Allocated, used, and remaining leave days.</p>
            </div>
            <Badge variant="soft">Policy Year</Badge>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {leaveBalance.map((balance) => (
              <div key={balance.label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-medium text-slate-900">{balance.label}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[11px] text-slate-500">Total</p>
                    <p className="text-base font-semibold text-slate-900">{balance.total}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Used</p>
                    <p className="text-base font-semibold text-amber-600">{balance.used}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Remaining</p>
                    <p className="text-base font-semibold text-emerald-600">{balance.remaining}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card noPadding>
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h3 className="text-sm font-semibold text-slate-900">My Requests</h3>
            <p className="text-xs text-slate-500">Latest leave request timeline and outcomes.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {requests.length === 0 && (
              <div className="px-5 py-6 text-sm text-slate-500 sm:px-6">No leave requests found.</div>
            )}
            {requests.map((request) => (
              <div key={request.id} className="px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{toUiType(request.type)} leave ({countDays(request.startDate, request.endDate)} day{countDays(request.startDate, request.endDate) > 1 ? 's' : ''})</p>
                    <p className="text-xs text-slate-500">{new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}</p>
                    <p className="mt-2 text-sm text-slate-600">{request.reason || '-'}</p>
                  </div>
                  <Badge variant={statusVariant[request.status]}>{formatStatusLabel(request.status)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock3 className="h-4 w-4 text-amber-600" /> Pending: {stats.pending}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Approved: {stats.approved}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <XCircle className="h-4 w-4 text-red-600" /> Rejected: {stats.rejected}
            </div>
          </div>
        </Card>

        <LeaveApplicationWizard
          open={isApplicationOpen}
          employees={selfEmployee ? [{ id: selfEmployee.id, name: selfEmployee.name, department: selfEmployee.department }] : []}
          holidays={[]}
          isSubmitting={createLeaveMutation.isPending}
          onClose={() => setIsApplicationOpen(false)}
          onSubmit={submitSelfRequest}
        />
      </div>
    </RoleGuard>
  );
}
