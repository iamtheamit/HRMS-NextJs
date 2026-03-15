'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck2, CalendarClock, CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { KpiCard } from '@/shared/ui/KpiCard';
import { RoleGuard } from '@/shared/ui/RoleGuard';
import { listAttendanceApi } from '@/features/attendance/api/attendanceApi';
import { listLeaveApi } from '@/features/leave/api/leaveApi';
import { useAuthStore } from '@/store/authStore';
import { buildLastSixMonthSeries, buildStatusSeries } from '@/features/dashboard/model/chartUtils';
import { DashboardBarChartCard, DashboardPieChartCard } from '@/features/dashboard/ui/DashboardCharts';

const isSameDay = (isoDate: string, date = new Date()) => {
  const d = new Date(isoDate);
  return (
    d.getFullYear() === date.getFullYear()
    && d.getMonth() === date.getMonth()
    && d.getDate() === date.getDate()
  );
};

const statusVariant = {
  PENDING: 'warning' as const,
  MANAGER_PENDING: 'warning' as const,
  HR_PENDING: 'warning' as const,
  APPROVED: 'success' as const,
  REJECTED: 'danger' as const,
};

const isPendingStatus = (status: string) => {
  return status === 'PENDING' || status === 'MANAGER_PENDING' || status === 'HR_PENDING';
};

const toUiType = (type: 'ANNUAL' | 'SICK' | 'UNPAID' | 'OTHER') => {
  if (type === 'SICK') return 'Sick Leave';
  if (type === 'ANNUAL') return 'Annual Leave';
  if (type === 'UNPAID') return 'Unpaid Leave';
  return 'Other';
};

export default function EmployeeDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const attendanceQuery = useQuery({
    queryKey: ['attendance-dashboard-self', user?.employeeId],
    queryFn: () => listAttendanceApi(user?.employeeId ?? undefined),
    enabled: !!user?.employeeId,
  });

  const leaveQuery = useQuery({
    queryKey: ['leave-dashboard-self', user?.employeeId],
    queryFn: () => listLeaveApi(user?.employeeId ?? undefined),
    enabled: !!user?.employeeId,
  });

  const isLoading = attendanceQuery.isLoading || leaveQuery.isLoading;
  const isError = attendanceQuery.isError || leaveQuery.isError;

  const attendance = attendanceQuery.data || [];
  const leaves = leaveQuery.data || [];

  const todayRecord = useMemo(
    () => attendance.find((record) => isSameDay(record.date)) || null,
    [attendance],
  );

  const summary = useMemo(() => {
    return {
      monthlyCheckIns: attendance.filter((record) => record.checkIn).length,
      pendingLeaves: leaves.filter((request) => isPendingStatus(request.status)).length,
      approvedLeaves: leaves.filter((request) => request.status === 'APPROVED').length,
      rejectedLeaves: leaves.filter((request) => request.status === 'REJECTED').length,
    };
  }, [attendance, leaves]);

  const latestLeaveRequests = useMemo(() => {
    return [...leaves]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [leaves]);

  const leaveStatusPie = useMemo(
    () => buildStatusSeries(leaves.map((request) => ({ status: request.status }))),
    [leaves],
  );

  const attendanceBar = useMemo(() => {
    const checkInDates = attendance.filter((record) => !!record.checkIn).map((record) => record.date);
    return buildLastSixMonthSeries(checkInDates);
  }, [attendance]);

  const attendanceStatus = todayRecord?.checkOut
    ? 'Checked Out'
    : todayRecord?.checkIn
      ? 'Checked In'
      : 'Not Checked In';

  const attendanceStatusVariant = todayRecord?.checkOut
    ? 'soft'
    : todayRecord?.checkIn
      ? 'success'
      : 'warning';

  return (
    <RoleGuard allowedRoles={['EMPLOYEE']}>
      <div className="space-y-6">
        {isLoading ? (
          <Card>
            <p className="text-sm text-slate-600">Loading your dashboard...</p>
          </Card>
        ) : isError ? (
          <Card>
            <p className="text-sm text-red-600">Unable to load dashboard data right now.</p>
          </Card>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Today Attendance"
                value={attendanceStatus}
                helper="Current attendance state"
                icon={CalendarCheck2}
                tone={attendanceStatusVariant === 'success' ? 'emerald' : attendanceStatusVariant === 'warning' ? 'amber' : 'brand'}
              />
              <KpiCard
                label="Monthly Check-ins"
                value={summary.monthlyCheckIns}
                helper="Total check-ins this month"
                icon={CalendarClock}
                tone="slate"
              />
              <KpiCard
                label="Pending Leaves"
                value={summary.pendingLeaves}
                helper="Requests under review"
                icon={XCircle}
                tone="amber"
              />
              <KpiCard
                label="Approved Leaves"
                value={summary.approvedLeaves}
                helper="Approved leave requests"
                icon={CheckCircle2}
                tone="emerald"
              />
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <DashboardPieChartCard
                title="My Leave Breakdown"
                description="Distribution of your leave request statuses"
                data={leaveStatusPie}
              />
              <DashboardBarChartCard
                title="My Attendance Trend"
                description="Monthly check-ins over last 6 months"
                data={attendanceBar}
                barColor="#2563eb"
              />
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <Card>
                <h3 className="text-sm font-semibold text-slate-900">Quick Status</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-brand-50 p-4">
                    <p className="text-xs text-slate-500">Checked In</p>
                    <p className="mt-1 text-2xl font-semibold text-brand-700">
                      {todayRecord?.checkIn ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs text-slate-500">Checked Out</p>
                    <p className="mt-1 text-2xl font-semibold text-emerald-700">
                      {todayRecord?.checkOut ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card noPadding>
                <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                  <h3 className="text-sm font-semibold text-slate-900">Latest Leave Requests</h3>
                  <p className="text-xs text-slate-500">Your recent leave applications.</p>
                </div>

                <div className="divide-y divide-slate-100">
                  {latestLeaveRequests.length === 0 && (
                    <p className="px-5 py-5 text-sm text-slate-500 sm:px-6">No leave requests yet.</p>
                  )}

                  {latestLeaveRequests.map((request) => (
                    <div key={request.id} className="px-5 py-4 sm:px-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{toUiType(request.type)}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={statusVariant[request.status]}>{request.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
