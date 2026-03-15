'use client';

import { useQuery } from '@tanstack/react-query';
import { Building2, CalendarClock, CheckCircle2, ClipboardList, UserPlus, Users } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { KpiCard } from '@/shared/ui/KpiCard';
import { RoleGuard } from '@/shared/ui/RoleGuard';
import { fetchHrAdminOverview } from '@/features/hr-admin/api/hrAdminApi';
import { listAttendanceApi } from '@/features/attendance/api/attendanceApi';
import { listLeaveApi } from '@/features/leave/api/leaveApi';
import { buildLastSixMonthSeries, buildStatusSeries } from '@/features/dashboard/model/chartUtils';
import { DashboardBarChartCard, DashboardPieChartCard } from '@/features/dashboard/ui/DashboardCharts';

export default function HrAdminPage() {
  const overviewQuery = useQuery({
    queryKey: ['hr-admin-overview'],
    queryFn: fetchHrAdminOverview,
  });

  const attendanceQuery = useQuery({
    queryKey: ['dashboard-attendance', 'HR_ADMIN'],
    queryFn: () => listAttendanceApi(),
    retry: 1,
  });

  const leaveQuery = useQuery({
    queryKey: ['dashboard-leave', 'HR_ADMIN'],
    queryFn: () => listLeaveApi(),
    retry: 1,
  });

  if (overviewQuery.isLoading) {
    return (
      <RoleGuard allowedRoles={['HR_ADMIN', 'SUPER_ADMIN']}>
        <Card>
          <p className="text-sm text-slate-600">Loading HR Admin dashboard...</p>
        </Card>
      </RoleGuard>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <RoleGuard allowedRoles={['HR_ADMIN', 'SUPER_ADMIN']}>
        <Card>
          <p className="text-sm text-red-600">Unable to load HR Admin overview right now.</p>
        </Card>
      </RoleGuard>
    );
  }

  const data = overviewQuery.data;
  const attendanceRows = attendanceQuery.data || [];
  const leaveRows = leaveQuery.data || [];
  const stats = [
    {
      label: 'Total Employees',
      value: data.summary.totalEmployees,
      icon: Users,
      tone: 'brand' as const,
      helper: 'Entire workforce count',
    },
    {
      label: 'Active Employees',
      value: data.summary.activeEmployees,
      icon: CheckCircle2,
      tone: 'emerald' as const,
      helper: 'Actively employed people',
    },
    {
      label: 'Departments',
      value: data.summary.departments,
      icon: Building2,
      tone: 'indigo' as const,
      helper: 'Configured business units',
    },
    {
      label: 'Pending Leaves',
      value: data.summary.pendingLeaves,
      icon: CalendarClock,
      tone: 'amber' as const,
      helper: 'Requests awaiting action',
    },
    {
      label: 'Approved This Month',
      value: data.summary.approvedLeavesThisMonth,
      icon: ClipboardList,
      tone: 'slate' as const,
      helper: 'Approved in current month',
    },
    {
      label: 'New Hires This Month',
      value: data.summary.newHiresThisMonth,
      icon: UserPlus,
      tone: 'cyan' as const,
      helper: 'Joined in current month',
    },
  ];

  const workforcePie = [
    { label: 'Active', value: data.summary.activeEmployees },
    { label: 'Inactive', value: Math.max(data.summary.totalEmployees - data.summary.activeEmployees, 0) },
  ];

  const leaveStatusPie = buildStatusSeries(leaveRows.map((row) => ({ status: row.status })));

  const attendanceMonthlyBar = buildLastSixMonthSeries(
    attendanceRows.filter((row) => !!row.checkIn).map((row) => row.date),
  );

  return (
    <RoleGuard allowedRoles={['HR_ADMIN', 'SUPER_ADMIN']}>
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => {
            return (
              <KpiCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                helper={stat.helper}
                icon={stat.icon}
                tone={stat.tone}
              />
            );
          })}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <DashboardPieChartCard
            title="Workforce Mix"
            description="Active and inactive employee distribution"
            data={workforcePie}
          />
          <DashboardPieChartCard
            title="Leave Status Breakdown"
            description="Pending, approved, and rejected leave requests"
            data={leaveStatusPie}
          />
          <DashboardBarChartCard
            title="Attendance Check-in Trend"
            description="Monthly attendance check-ins over last 6 months"
            data={attendanceMonthlyBar}
            barColor="#6366f1"
          />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900">Today's Attendance Pulse</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-brand-50 p-4">
                <p className="text-xs text-slate-500">Checked In</p>
                <p className="mt-1 text-2xl font-semibold text-brand-700">{data.summary.todayCheckedIn}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs text-slate-500">Checked Out</p>
                <p className="mt-1 text-2xl font-semibold text-emerald-700">{data.summary.todayCheckedOut}</p>
              </div>
            </div>
          </Card>

          <Card noPadding>
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h3 className="text-sm font-semibold text-slate-900">Pending Leave Queue</h3>
              <p className="text-xs text-slate-500">Latest requests waiting for approval.</p>
            </div>
            <div className="divide-y divide-slate-100">
              {data.pendingLeaveRequests.length === 0 && (
                <p className="px-5 py-5 text-sm text-slate-500 sm:px-6">No pending leave requests.</p>
              )}
              {data.pendingLeaveRequests.map((request) => (
                <div key={request.id} className="px-5 py-4 sm:px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{request.employeeName}</p>
                      <p className="text-xs text-slate-500">{request.department} • {request.type}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="warning">{request.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </RoleGuard>
  );
}
