"use client";

import Link from 'next/link';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { SearchBar } from '@/shared/ui/SearchBar';
import { usePayrollManagement } from '@/features/payroll/model/usePayrollManagement';
import { routes } from '@/constants/routes';
import type { PayrollStatus } from '@/entities/payroll/types/payroll.types';
import { CircleCheckBig, History, IndianRupee, ReceiptText } from 'lucide-react';
import { RoleGuard } from '@/shared/ui/RoleGuard';

const statusVariant: Record<PayrollStatus, 'warning' | 'soft' | 'success'> = {
  Draft: 'warning',
  Processed: 'soft',
  Paid: 'success'
};

export default function PayrollPage() {
  const {
    search,
    setSearch,
    month,
    setMonth,
    year,
    setYear,
    status,
    setStatus,
    months,
    visibleRows,
    stats,
    isLoading,
    isError,
    processPayroll,
    processAllDrafts,
    markPayrollPaid
  } = usePayrollManagement();

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER']}>
      <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Payroll Processing</h2>
          <p className="text-sm text-slate-500">Process monthly payroll, update status, and review payroll history per employee.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <SearchBar
            placeholder="Search employee, code, or department"
            className="w-full sm:w-72"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={month}
            onChange={(event) => setMonth(event.target.value as typeof month)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            {months.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Processed">Processed</option>
            <option value="Paid">Paid</option>
          </select>

          <Button onClick={processAllDrafts}>
            <CircleCheckBig className="h-4 w-4" />
            Process Month Payroll
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Records</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-semibold text-slate-900">{stats.total}</p>
            <div className="rounded-lg bg-brand-50 p-2 text-brand-700"><ReceiptText className="h-4 w-4" /></div>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Draft</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-semibold text-slate-900">{stats.draft}</p>
            <Badge variant="warning">Pending</Badge>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Processed</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-semibold text-slate-900">{stats.processed}</p>
            <Badge variant="soft">Ready to pay</Badge>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Net Payout</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-2xl font-semibold text-slate-900">INR {stats.netPayout.toFixed(2)}</p>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><IndianRupee className="h-4 w-4" /></div>
          </div>
        </Card>
      </section>

      <Card noPadding>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Monthly Payroll Register</h3>
            <p className="text-xs text-slate-500">Track process status and open per-employee payroll history.</p>
          </div>
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-700"><History className="h-4 w-4" /></div>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-slate-500">Loading payroll records...</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Unable to load payroll records.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Employee</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Department</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Gross</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Deductions</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Net Pay</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map((row) => (
                  <tr key={row.payrollId} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-medium text-slate-900">{row.employeeName}</p>
                      <p className="text-xs text-slate-500">{row.employeeCode} · {row.month} {row.year}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{row.department}</td>
                    <td className="px-4 py-3.5 text-slate-600">INR {row.grossPay.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-slate-600">INR {row.totalDeductions.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">INR {row.netPay.toFixed(2)}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {row.status === 'Draft' && (
                          <Button size="sm" onClick={() => processPayroll(row.payrollId)}>
                            Process
                          </Button>
                        )}
                        {row.status !== 'Paid' && (
                          <Button size="sm" variant="secondary" onClick={() => markPayrollPaid(row.payrollId)}>
                            Mark Paid
                          </Button>
                        )}
                        <Link
                          href={routes.salaryDetails(row.employeeId)}
                          className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                        >
                          History
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {visibleRows.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-slate-500">No payroll rows found for current filters.</div>
            )}
          </div>
        )}
      </Card>
      </div>
    </RoleGuard>
  );
}
