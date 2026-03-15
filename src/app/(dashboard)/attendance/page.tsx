'use client';

import clsx from 'clsx';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { SearchBar } from '@/shared/ui/SearchBar';
import {
  Building2,
  CalendarCheck2,
  CalendarDays,
  Clock3,
  Download,
  FileText,
  Home,
  Moon,
  UserCheck,
  Users
} from 'lucide-react';
import { HolidayCalendarPanel } from '@/features/calendar/ui/HolidayCalendarPanel';
import { useAttendanceManagement, type AttendanceStatus } from '@/features/attendance/model/useAttendanceManagement';

const statusMap: Record<AttendanceStatus, { variant: 'success' | 'warning' | 'danger' | 'soft'; chip: string }> = {
  Present: { variant: 'success', chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  Absent: { variant: 'danger', chip: 'bg-red-50 text-red-700 ring-red-200' },
  'Half Day': { variant: 'warning', chip: 'bg-amber-50 text-amber-700 ring-amber-200' },
  WFH: { variant: 'soft', chip: 'bg-brand-50 text-brand-700 ring-brand-200' }
};

const statusOptions: AttendanceStatus[] = ['Present', 'Absent', 'Half Day', 'WFH'];

export default function AttendancePage() {
  const {
    query,
    setQuery,
    selectedDepartment,
    setSelectedDepartment,
    selectedMonth,
    setSelectedMonth,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    holidays,
    addHoliday,
    removeHoliday,
    departments,
    months,
    filteredRecords,
    dailyStats,
    attendanceInsights,
    monthlyEmployeeReport,
    departmentSummary,
    markAttendance,
    exportAttendanceCsv,
    exportAttendancePdf
  } = useAttendanceManagement();

  const statCards = [
    {
      label: 'Present Today',
      value: dailyStats.present,
      helper: `${dailyStats.teamSize} employees tracked`,
      icon: UserCheck,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600'
    },
    {
      label: 'WFH Today',
      value: dailyStats.wfh,
      helper: 'Remote attendance logged',
      icon: Home,
      bg: 'bg-brand-50',
      color: 'text-brand-600'
    },
    {
      label: 'Half Day',
      value: dailyStats.halfDay,
      helper: 'Partial attendance markers',
      icon: Clock3,
      bg: 'bg-amber-50',
      color: 'text-amber-600'
    },
    {
      label: 'Absent',
      value: dailyStats.absent,
      helper: 'Needs follow-up from managers',
      icon: Moon,
      bg: 'bg-red-50',
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Attendance Management</h2>
          <p className="text-sm text-slate-500">
            Mark daily attendance, review monthly trends, and export workforce attendance snapshots.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <SearchBar
            placeholder="Search employee, code, or role"
            className="w-full sm:w-72"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'All' | AttendanceStatus)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="All">All Statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <Button variant="secondary" onClick={exportAttendanceCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={exportAttendancePdf}>
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-gradient-to-br from-white to-slate-50/60">
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-xs text-slate-400">{stat.helper}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Daily Attendance Register</h3>
            <p className="text-xs text-slate-500">Mark Present, Absent, Half Day, or WFH for each employee.</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarCheck2 className="h-4 w-4 text-brand-600" />
            {selectedMonth} · {selectedDate} attendance view
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Employee</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Department</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Check-in</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Current Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Mark Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => {
                const status = statusMap[record.status];
                return (
                  <tr key={record.id} className="align-top transition hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                      <p className="font-medium text-slate-900">{record.employeeName}</p>
                      <p className="text-xs text-slate-500">{record.employeeCode} • {record.designation}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{record.department}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">{record.checkIn}</td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <Badge variant={status.variant}>{record.status}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex min-w-[22rem] flex-wrap gap-2">
                        {statusOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => markAttendance(record.id, option)}
                            className={clsx(
                              'rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition',
                              record.status === option
                                ? statusMap[option].chip
                                : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50 hover:text-slate-700'
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card noPadding className="xl:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Monthly Attendance Report</h3>
              <p className="text-xs text-slate-500">Per-employee monthly attendance performance for {selectedMonth}.</p>
            </div>
            <Badge variant="soft">{monthlyEmployeeReport.length} employees</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Employee</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Present</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">WFH</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Half Day</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Absent</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyEmployeeReport.map((record) => (
                  <tr key={`${record.id}-monthly`} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-5 py-3.5 sm:px-6">
                      <p className="font-medium text-slate-900">{record.employeeName}</p>
                      <p className="text-xs text-slate-500">{record.department}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{record.monthly.present}</td>
                    <td className="px-4 py-3.5 text-slate-600">{record.monthly.wfh}</td>
                    <td className="px-4 py-3.5 text-slate-600">{record.monthly.halfDay}</td>
                    <td className="px-4 py-3.5 text-slate-600">{record.monthly.absent}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-brand-600" style={{ width: `${record.attendanceRate}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{record.attendanceRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6 xl:col-span-2">
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Attendance Insights</h3>
                <p className="text-xs text-slate-500">Optional operational signals for the selected day.</p>
              </div>
              <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Compliance Rate</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{dailyStats.complianceRate}%</p>
                <p className="mt-1 text-xs text-slate-500">Present, WFH, and Half Day combined against tracked headcount.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-600">
                <div className="rounded-xl bg-brand-50 px-3 py-3 text-center">On-site<br /><span className="text-base font-semibold text-brand-700">{attendanceInsights.onsiteCount}</span></div>
                <div className="rounded-xl bg-emerald-50 px-3 py-3 text-center">Remote<br /><span className="text-base font-semibold text-emerald-700">{attendanceInsights.remoteCount}</span></div>
                <div className="rounded-xl bg-amber-50 px-3 py-3 text-center">Needs Attention<br /><span className="text-base font-semibold text-amber-700">{attendanceInsights.attentionCount}</span></div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Department Summary</h3>
                <p className="text-xs text-slate-500">Attendance health by department.</p>
              </div>
              <div className="rounded-xl bg-brand-50 p-2 text-brand-700">
                <Building2 className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-3">
              {departmentSummary.map((department) => (
                <div key={department.department} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{department.department}</p>
                      <p className="text-xs text-slate-500">{department.headcount} employees</p>
                    </div>
                    <Badge variant={department.attendanceRate >= 85 ? 'success' : department.attendanceRate >= 75 ? 'warning' : 'danger'}>
                      {department.attendanceRate}%
                    </Badge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="rounded-xl bg-white px-3 py-2">Present: <span className="font-semibold text-slate-900">{department.present}</span></div>
                    <div className="rounded-xl bg-white px-3 py-2">WFH: <span className="font-semibold text-slate-900">{department.wfh}</span></div>
                    <div className="rounded-xl bg-white px-3 py-2">Half Day: <span className="font-semibold text-slate-900">{department.halfDay}</span></div>
                    <div className="rounded-xl bg-white px-3 py-2">Absent: <span className="font-semibold text-slate-900">{department.absent}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Export Center</p>
                <h3 className="mt-2 text-lg font-semibold">Attendance data ready</h3>
                <p className="mt-2 text-sm text-white/70">
                  Export the filtered attendance register and monthly report for payroll, audits, or leadership review.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-white">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={exportAttendanceCsv}>
                <Download className="h-4 w-4" />
                CSV Snapshot
              </Button>
              <Button className="bg-white text-slate-900 hover:bg-slate-100 active:bg-slate-200" onClick={exportAttendancePdf}>
                <FileText className="h-4 w-4" />
                PDF Report
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Card noPadding>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Holiday Calendar Management</h3>
            <p className="text-xs text-slate-500">National, regional, and company holidays reflected in attendance and leave calculations.</p>
          </div>
          <Badge variant="soft">{holidays.length} holidays configured</Badge>
        </div>
        <div className="px-5 py-5 sm:px-6 sm:py-6">
          <HolidayCalendarPanel
            monthLabel={selectedMonth}
            holidays={holidays}
            onAddHoliday={addHoliday}
            onRemoveHoliday={removeHoliday}
          />
        </div>
      </Card>
    </div>
  );
}
