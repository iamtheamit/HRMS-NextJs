'use client';
import { useQuery } from '@tanstack/react-query';
import {
  BriefcaseBusiness,
  CalendarClock,
  LogIn,
  LogOut,
  UserCheck2,
  Users,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { KpiCard } from '@/shared/ui/KpiCard';
import { RoleGuard } from '@/shared/ui/RoleGuard';
import { fetchDashboardOverview } from '@/features/dashboard/api/dashboardApi';
import { listAttendanceApi } from '@/features/attendance/api/attendanceApi';
import { listLeaveApi } from '@/features/leave/api/leaveApi';
import { buildLastSixMonthSeries, buildStatusSeries } from '@/features/dashboard/model/chartUtils';
import { DashboardBarChartCard, DashboardPieChartCard } from '@/features/dashboard/ui/DashboardCharts';

export default function SuperAdminPage() {
  const overviewQuery = useQuery({
    queryKey: ['dashboard-overview', 'SUPER_ADMIN'],
    queryFn: fetchDashboardOverview,
  });

  const attendanceQuery = useQuery({
    queryKey: ['dashboard-attendance', 'SUPER_ADMIN'],
    queryFn: () => listAttendanceApi(),
    retry: 1,
  });

  const leaveQuery = useQuery({
    queryKey: ['dashboard-leave', 'SUPER_ADMIN'],
    queryFn: () => listLeaveApi(),
    retry: 1,
  });

  if (overviewQuery.isLoading) {
    return (
      <RoleGuard allowedRoles={['SUPER_ADMIN']}>
        <Card>
          <p className="text-sm text-slate-600">Loading super admin dashboard...</p>
        </Card>
      </RoleGuard>
    );
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <RoleGuard allowedRoles={['SUPER_ADMIN']}>
        <Card>
          <p className="text-sm text-red-600">Unable to load dashboard overview right now.</p>
        </Card>
      </RoleGuard>
    );
  }

  const { summary } = overviewQuery.data;
  const attendanceRows = attendanceQuery.data || [];
  const leaveRows = leaveQuery.data || [];

  const stats = [
    { label: 'Total Employees', value: summary.totalEmployees ?? 0, icon: Users, tone: 'brand' as const, helper: 'Organization headcount' },
    { label: 'Active Employees', value: summary.activeEmployees ?? 0, icon: UserCheck2, tone: 'emerald' as const, helper: 'Currently active workforce' },
    { label: 'Managers', value: summary.managers ?? 0, icon: BriefcaseBusiness, tone: 'indigo' as const, helper: 'Team leads across org' },
    { label: 'Pending Leaves', value: summary.pendingLeaves ?? 0, icon: CalendarClock, tone: 'amber' as const, helper: 'Awaiting decisions' },
    { label: 'Checked In Today', value: summary.todayCheckedIn, icon: LogIn, tone: 'cyan' as const, helper: 'Today attendance check-in' },
    { label: 'Checked Out Today', value: summary.todayCheckedOut, icon: LogOut, tone: 'slate' as const, helper: 'Today attendance check-out' },
  ];

  const workforcePie = [
    { label: 'Active', value: summary.activeEmployees ?? 0 },
    { label: 'Inactive', value: Math.max((summary.totalEmployees ?? 0) - (summary.activeEmployees ?? 0), 0) },
  ];

  const leaveStatusPie = buildStatusSeries(leaveRows.map((row) => ({ status: row.status })));

  const attendanceTrendBar = buildLastSixMonthSeries(
    attendanceRows.filter((row) => !!row.checkIn).map((row) => row.date),
  );

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN']}>
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

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <DashboardPieChartCard
            title="Workforce Mix"
            description="Active vs inactive employees"
            data={workforcePie}
          />
          <DashboardPieChartCard
            title="Leave Status Breakdown"
            description="Distribution of leave request outcomes"
            data={leaveStatusPie}
          />
          <DashboardBarChartCard
            title="Attendance Trend"
            description="Monthly check-ins over last 6 months"
            data={attendanceTrendBar}
            barColor="#0ea5e9"
          />
        </section>
      </div>
    </RoleGuard>
  );
}
