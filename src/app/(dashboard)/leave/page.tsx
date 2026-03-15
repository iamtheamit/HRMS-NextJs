'use client';

import clsx from 'clsx';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { SearchBar } from '@/shared/ui/SearchBar';
import {
  ArrowRightLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  Coins,
  Plus,
  ShieldCheck,
  XCircle
} from 'lucide-react';
import { LeaveApplicationWizard } from '@/features/leave/ui/LeaveApplicationWizard';
import { useLeaveManagement, type LeaveStatus } from '@/features/leave/model/useLeaveManagement';
import { RoleGuard } from '@/shared/ui/RoleGuard';
import { routes } from '@/constants/routes';

const statusMap: Record<LeaveStatus, { variant: 'success' | 'warning' | 'danger' }> = {
  Pending: { variant: 'warning' },
  Approved: { variant: 'success' },
  Rejected: { variant: 'danger' }
};

export default function LeavePage() {
  const {
    query,
    setQuery,
    selectedDepartment,
    setSelectedDepartment,
    selectedEmployeeId,
    setSelectedEmployeeId,
    statusFilter,
    setStatusFilter,
    departments,
    employeesList,
    filteredRequests,
    filteredBalances,
    selectedEmployeeHistory,
    leaveStats,
    carryForwardPlan,
    holidays,
    isApplicationOpen,
    openApplication,
    closeApplication,
    submitApplication,
    decideRequest
  } = useLeaveManagement();

  const stats = [
    { label: 'Pending', value: leaveStats.pending, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Approved', value: leaveStats.approved, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Rejected', value: leaveStats.rejected, icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' },
    { label: 'Carry Forward Pool', value: leaveStats.carryForwardPool, icon: ArrowRightLeft, bg: 'bg-brand-50', color: 'text-brand-600' }
  ];

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER']} redirectTo={routes.leaveMe}>
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Leave Management</h2>
          <p className="text-sm text-slate-500">Application workflow, balances, approval routing, and employee leave history.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <SearchBar
            placeholder="Search employee, code, or reason"
            className="w-full sm:w-72"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            {departments.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
          <select
            value={selectedEmployeeId}
            onChange={(event) => setSelectedEmployeeId(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="All Employees">All Employees</option>
            {employeesList.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'All' | LeaveStatus)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <Button onClick={openApplication}>
            <Plus className="h-3.5 w-3.5" />
            New Request
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Card>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-slate-800">
            Leave day calculation now excludes weekends and configured holidays.
          </p>
          <Badge variant="soft">{holidays.length} holidays in policy calendar</Badge>
        </div>
      </Card>

      <Card noPadding>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Leave Requests</h3>
            <p className="text-xs text-slate-500">Manager and HR approval workflow with pending, approved, and rejected states.</p>
          </div>
          <Badge variant="soft">{filteredRequests.length} requests</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Employee</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Type</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Period</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Days</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Approval Flow</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((request) => {
                const st = statusMap[request.status];
                return (
                  <tr key={request.id} className="transition hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-medium text-slate-900">{request.employeeName}</p>
                      <p className="text-xs text-slate-500">{request.employeeCode} · {request.department}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{request.type}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{request.from} – {request.to}</td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{request.days}</td>
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <Badge variant={request.approvalStage === 'Completed' ? 'success' : 'soft'}>
                        {request.status === 'Pending' ? `${request.currentApprover} Review` : request.approvalStage}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                      <Badge variant={st.variant}>{request.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary" disabled={request.status !== 'Pending'} onClick={() => decideRequest(request.id, 'approve')}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" disabled={request.status !== 'Pending'} onClick={() => decideRequest(request.id, 'reject')}>
                          Reject
                        </Button>
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
              <h3 className="text-sm font-semibold text-slate-900">Leave Balance Tracking</h3>
              <p className="text-xs text-slate-500">CL, SL, and EL balances for all filtered employees.</p>
            </div>
            <Badge variant="soft">{filteredBalances.length} employees</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Employee</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">CL</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">SL</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">EL</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Carry Forward</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Encashable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBalances.map((balance) => (
                  <tr key={balance.employeeId} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-medium text-slate-900">{balance.employeeName}</p>
                      <p className="text-xs text-slate-500">{balance.department}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{balance.cl.available} / {balance.cl.total}</td>
                    <td className="px-4 py-3.5 text-slate-600">{balance.sl.available} / {balance.sl.total}</td>
                    <td className="px-4 py-3.5 text-slate-600">{balance.el.available} / {balance.el.total}</td>
                    <td className="px-4 py-3.5 text-slate-600">{balance.carryForward}</td>
                    <td className="px-4 py-3.5 text-slate-600">{balance.encashable}</td>
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
                <h3 className="text-sm font-semibold text-slate-900">Leave History</h3>
                <p className="text-xs text-slate-500">Per-employee request timeline.</p>
              </div>
              <div className="rounded-xl bg-brand-50 p-2 text-brand-700">
                <CalendarClock className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-3">
              {selectedEmployeeHistory.map((request) => (
                <div key={`${request.id}-history`} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{request.type} · {request.days} day(s)</p>
                      <p className="text-xs text-slate-500">{request.from} to {request.to}</p>
                    </div>
                    <Badge variant={statusMap[request.status].variant}>{request.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{request.reason}</p>
                  <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                    {request.history.map((entry, index) => (
                      <div key={`${request.id}-${index}`} className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{entry.actor}</span> {entry.action} · {entry.at}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Policy Extras</p>
                <h3 className="mt-2 text-lg font-semibold">Carry-forward and encashment</h3>
                <p className="mt-2 text-sm text-white/70">Optional logic surfaced for HR planning at cycle end.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-white">
                <Coins className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {carryForwardPlan.slice(0, 3).map((item) => (
                <div key={item.employeeId} className="rounded-2xl bg-white/5 p-4">
                  <p className="font-medium">{item.employeeName}</p>
                  <p className="mt-1 text-xs text-white/70">Carry forward: {item.carryForward} day(s) · Encashable: {item.encashable} day(s)</p>
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs text-white/70">
                <ShieldCheck className="h-4 w-4" />
                Encashable pool: {leaveStats.encashablePool} day(s)
              </div>
            </div>
          </Card>
        </div>
      </div>

      <LeaveApplicationWizard
        open={isApplicationOpen}
        employees={employeesList}
        holidays={holidays}
        onClose={closeApplication}
        onSubmit={submitApplication}
      />
    </div>
    </RoleGuard>
  );
}
