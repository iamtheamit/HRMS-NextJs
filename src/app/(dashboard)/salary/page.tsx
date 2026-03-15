"use client";

import Link from 'next/link';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { SearchBar } from '@/shared/ui/SearchBar';
import { useSalaryManagement } from '@/features/salary/model/useSalaryManagement';
import { routes } from '@/constants/routes';
import type { SalaryStatus } from '@/entities/salary/types/salary.types';
import { Calculator, Download, Eye, FileText, Landmark, Wallet } from 'lucide-react';
import { RoleGuard } from '@/shared/ui/RoleGuard';

const statusVariant: Record<SalaryStatus, 'warning' | 'soft' | 'success'> = {
  Draft: 'warning',
  Processed: 'soft',
  Paid: 'success'
};

function parseAmount(value: string, fallback: number) {
  const next = Number.parseFloat(value);
  return Number.isNaN(next) ? fallback : next;
}

export default function SalaryPage() {
  const {
    search,
    setSearch,
    month,
    setMonth,
    year,
    setYear,
    department,
    setDepartment,
    status,
    setStatus,
    months,
    departments,
    visibleRows,
    totals,
    isLoading,
    isError,
    updateSalary,
    exportSalaryCsv,
    generateSlipPdf
  } = useSalaryManagement();

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER']}>
      <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Salary Management</h2>
          <p className="text-sm text-slate-500">Configure PF, ESI, TDS and generate monthly salary slips per employee.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <SearchBar
            placeholder="Search employee, code, or designation"
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
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          >
            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
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

          <Button variant="secondary" onClick={exportSalaryCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Employees</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-semibold text-slate-900">{totals.employees}</p>
            <div className="rounded-lg bg-brand-50 p-2 text-brand-700"><Wallet className="h-4 w-4" /></div>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Gross Payout</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-2xl font-semibold text-slate-900">INR {totals.gross.toFixed(2)}</p>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700"><Landmark className="h-4 w-4" /></div>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Deductions</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-2xl font-semibold text-slate-900">INR {totals.deductions.toFixed(2)}</p>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700"><Calculator className="h-4 w-4" /></div>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Net Pay</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-2xl font-semibold text-slate-900">INR {totals.net.toFixed(2)}</p>
            <Badge variant={totals.draftCount > 0 ? 'warning' : 'success'}>{totals.draftCount} Draft</Badge>
          </div>
        </Card>
      </section>

      <Card noPadding>
        {isLoading ? (
          <div className="p-6 text-sm text-slate-500">Loading salary data...</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Unable to load salary records.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Employee</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Department</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">PF %</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">ESI %</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">TDS %</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Gross</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Deductions</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Net Pay</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleRows.map((row) => (
                  <tr key={row.id} className="align-top transition hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-medium text-slate-900">{row.employeeName}</p>
                      <p className="text-xs text-slate-500">{row.employeeCode} · {row.designation}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{row.department}</td>
                    <td className="px-4 py-3.5">
                      <input
                        type="number"
                        value={row.rates.pfEmployeeRate}
                        onChange={(event) => updateSalary(row.id, { rates: { pfEmployeeRate: parseAmount(event.target.value, row.rates.pfEmployeeRate) } })}
                        className="h-8 w-20 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-brand-400"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <input
                        type="number"
                        step="0.01"
                        value={row.rates.esiRate}
                        onChange={(event) => updateSalary(row.id, { rates: { esiRate: parseAmount(event.target.value, row.rates.esiRate) } })}
                        className="h-8 w-20 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-brand-400"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <input
                        type="number"
                        step="0.01"
                        value={row.rates.tdsRate}
                        onChange={(event) => updateSalary(row.id, { rates: { tdsRate: parseAmount(event.target.value, row.rates.tdsRate) } })}
                        className="h-8 w-20 rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-brand-400"
                      />
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">INR {row.breakdown.grossPay.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-slate-600">INR {row.breakdown.totalDeductions.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">INR {row.breakdown.netPay.toFixed(2)}</td>
                    <td className="px-4 py-3.5">
                      <select
                        value={row.status}
                        onChange={(event) => updateSalary(row.id, { status: event.target.value as SalaryStatus })}
                        className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 outline-none focus:border-brand-400"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Processed">Processed</option>
                        <option value="Paid">Paid</option>
                      </select>
                      <div className="mt-2"><Badge variant={statusVariant[row.status]}>{row.status}</Badge></div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link
                          href={routes.salaryDetails(row.employeeId)}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label="View salary history"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                          onClick={() => generateSlipPdf(row)}
                          aria-label="Download salary slip"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {visibleRows.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-slate-500">No salary records found for the selected filters.</div>
            )}
          </div>
        )}
      </Card>
      </div>
    </RoleGuard>
  );
}
