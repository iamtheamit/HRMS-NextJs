'use client';

import { useQuery } from '@tanstack/react-query';
import { CalendarClock, CheckCircle2, LogIn, LogOut, Users } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { KpiCard } from '@/shared/ui/KpiCard';
import { RoleGuard } from '@/shared/ui/RoleGuard';
import { fetchDashboardOverview } from '@/features/dashboard/api/dashboardApi';
import { listAttendanceApi } from '@/features/attendance/api/attendanceApi';
import { listLeaveApi } from '@/features/leave/api/leaveApi';
import { buildLastSixMonthSeries, buildStatusSeries } from '@/features/dashboard/model/chartUtils';
import { DashboardBarChartCard, DashboardPieChartCard } from '@/features/dashboard/ui/DashboardCharts';

export default function ManagerPage() {
  const overviewQuery = useQuery({
    queryKey: ['dashboard-overview', 'MANAGER'],
    queryFn: fetchDashboardOverview,
  });

  const attendanceQuery = useQuery({
    queryKey: ['dashboard-attendance', 'MANAGER'],
    queryFn: () => listAttendanceApi(),
    retry: 1,
  });

  const leaveQuery = useQuery({
    queryKey: ['dashboard-leave', 'MANAGER'],
    queryFn: () => listLeaveApi(),
    retry: 1,
  });

  if (overviewQuery.isLoading) {
    return (
      <RoleGuard allowedRoles={['MANAGER']}>
        <Card>
          <p className="text-sm text-slate-600">Loading manager dashboard...</p>
        </Card>
      </RoleGuard>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <RoleGuard allowedRoles={['MANAGER']}>
        <Card>
          <p className="text-sm text-red-600">Unable to load dashboard overview right now.</p>
        </Card>
      </RoleGuard>
    );
  }

  const { summary, pendingLeaveRequests = [] } = overviewQuery.data;
  const attendanceRows = attendanceQuery.data || [];
  const leaveRows = leaveQuery.data || [];

  const stats = [
    { label: 'Team Size', value: summary.teamSize ?? 0, icon: Users, tone: 'brand' as const, helper: 'Direct team members' },
    { label: 'Active Team Members', value: summary.activeTeamMembers ?? 0, icon: CheckCircle2, tone: 'emerald' as const, helper: 'Active in your team' },
    { label: 'Pending Approvals', value: summary.pendingApprovals ?? 0, icon: CalendarClock, tone: 'amber' as const, helper: 'Leave requests pending' },
    { label: 'Checked In Today', value: summary.todayCheckedIn, icon: LogIn, tone: 'cyan' as const, helper: 'Team check-ins today' },
    { label: 'Checked Out Today', value: summary.todayCheckedOut, icon: LogOut, tone: 'slate' as const, helper: 'Team check-outs today' },
  ];

  const teamLeaveStatusPie = buildStatusSeries(leaveRows.map((row) => ({ status: row.status })));
  const teamAttendanceBar = buildLastSixMonthSeries(
    attendanceRows.filter((row) => !!row.checkIn).map((row) => row.date),
  );

  return (
    <RoleGuard allowedRoles={['MANAGER']}>
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <KpiCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              helper={stat.helper}
              icon={stat.icon}
              tone={stat.tone}
            />
          ))}
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardPieChartCard
            title="Team Leave Distribution"
            description="Leave request status across your scope"
            data={teamLeaveStatusPie}
          />
          <DashboardBarChartCard
            title="Team Attendance Trend"
            description="Monthly check-ins for your team"
            data={teamAttendanceBar}
            barColor="#0ea5e9"
          />
        </section>

        <Card noPadding>
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h3 className="text-sm font-semibold text-slate-900">Pending Leave Requests</h3>
            <p className="text-xs text-slate-500">Requests that need your approval.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingLeaveRequests.length === 0 && (
              <p className="px-5 py-5 text-sm text-slate-500 sm:px-6">No pending requests.</p>
            )}

            {pendingLeaveRequests.map((request) => (
              <div key={request.id} className="px-5 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{request.employeeName}</p>
                    <p className="text-xs text-slate-500">{request.department} | {request.type}</p>
                  </div>
                  <Badge variant="warning">{request.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}
