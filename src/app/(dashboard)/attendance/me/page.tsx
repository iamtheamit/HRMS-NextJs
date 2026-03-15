'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck2, Clock3, Home, Moon } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  checkInApi,
  checkOutApi,
  listAttendanceApi,
  type AttendanceItem,
} from '@/features/attendance/api/attendanceApi';
import { useAuthStore } from '@/store/authStore';
import { RoleGuard } from '@/shared/ui/RoleGuard';

const toTime = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isSameDay = (isoDate: string, date = new Date()) => {
  const d = new Date(isoDate);
  return (
    d.getFullYear() === date.getFullYear()
    && d.getMonth() === date.getMonth()
    && d.getDate() === date.getDate()
  );
};

export default function AttendanceSelfPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const attendanceQuery = useQuery({
    queryKey: ['attendance-self', user?.employeeId],
    queryFn: () => listAttendanceApi(user?.employeeId ?? undefined),
    enabled: !!user?.employeeId,
  });

  const checkInMutation = useMutation({
    mutationFn: checkInApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['attendance-self', user?.employeeId] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: checkOutApi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['attendance-self', user?.employeeId] });
    },
  });

  const records = attendanceQuery.data || [];

  const todayRecord = useMemo(
    () => records.find((record) => isSameDay(record.date)) || null,
    [records],
  );

  const monthlyPresence = useMemo(() => {
    return records.filter((record) => record.checkIn).length;
  }, [records]);

  const canCheckIn = !todayRecord || !todayRecord.checkIn;
  const canCheckOut = !!todayRecord?.checkIn && !todayRecord.checkOut;

  const statusLabel = todayRecord?.checkOut
    ? 'Checked Out'
    : todayRecord?.checkIn
      ? 'Checked In'
      : 'Not Checked In';

  const statusVariant = todayRecord?.checkOut
    ? 'soft'
    : todayRecord?.checkIn
      ? 'success'
      : 'warning';

  return (
    <RoleGuard allowedRoles={['EMPLOYEE']}>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">My Attendance</h2>
          <p className="text-sm text-slate-500">Track your check-ins and keep your daily status updated.</p>
        </div>

        {attendanceQuery.isLoading ? (
          <Card>
            <p className="text-sm text-slate-600">Loading attendance...</p>
          </Card>
        ) : attendanceQuery.isError ? (
          <Card>
            <p className="text-sm text-red-600">Could not load attendance right now.</p>
          </Card>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                    <CalendarCheck2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Current Status</p>
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-brand-50 p-2 text-brand-600">
                    <Clock3 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Today Check-in</p>
                    <p className="text-sm font-semibold text-slate-900">{toTime(todayRecord?.checkIn)}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Today Check-out</p>
                    <p className="text-sm font-semibold text-slate-900">{toTime(todayRecord?.checkOut)}</p>
                  </div>
                </div>
              </Card>
              <Card>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <Moon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">This Month</p>
                    <p className="text-sm font-semibold text-slate-900">{monthlyPresence} check-ins</p>
                  </div>
                </div>
              </Card>
            </section>

            <Card>
              <h3 className="text-sm font-semibold text-slate-900">Attendance Actions</h3>
              <p className="mt-1 text-xs text-slate-500">Use check-in at start of day and check-out at end of day.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => checkInMutation.mutate()}
                  disabled={!canCheckIn || checkInMutation.isPending || checkOutMutation.isPending}
                >
                  Check In
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => checkOutMutation.mutate()}
                  disabled={!canCheckOut || checkOutMutation.isPending || checkInMutation.isPending}
                >
                  Check Out
                </Button>
              </div>
            </Card>

            <Card noPadding>
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <h3 className="text-sm font-semibold text-slate-900">Recent Entries</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {records.slice(0, 10).map((record: AttendanceItem) => (
                  <div key={record.id} className="flex items-center justify-between px-5 py-3 sm:px-6">
                    <p className="text-sm text-slate-700">{new Date(record.date).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-500">
                      In: {toTime(record.checkIn)} | Out: {toTime(record.checkOut)}
                    </p>
                  </div>
                ))}
                {records.length === 0 && (
                  <p className="px-5 py-4 text-sm text-slate-500 sm:px-6">No attendance entries yet.</p>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </RoleGuard>
  );
}
