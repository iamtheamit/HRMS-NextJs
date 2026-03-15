"use client";

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { useSalary } from '@/entities/salary/model/useSalary';
import { applySalaryOverride } from '@/features/payroll/model/payrollCalculations';
import { FileText, History, Wallet } from 'lucide-react';

export default function SalaryEmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const employeeId = params?.id ?? '';

  const { data, isLoading, isError } = useSalary({ employeeId });

  const rows = useMemo(() => {
    return (data?.data ?? []).map((row) => applySalaryOverride(row));
  }, [data]);

  const employeeName = rows[0]?.employeeName ?? 'Employee';
  const employeeCode = rows[0]?.employeeCode ?? 'N/A';
  const latest = rows[0];

  const generateSlipPdf = (index: number) => {
    const salary = rows[index];
    if (!salary) return;

    const popup = window.open('', '_blank', 'width=960,height=820');
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>Salary Slip - ${salary.employeeName}</title>
          <style>
            body { font-family: Segoe UI, sans-serif; padding: 24px; color: #0f172a; }
            h1, h2, h3, p { margin: 0; }
            .meta { margin-top: 6px; color: #475569; font-size: 12px; }
            .section { margin-top: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 12px; }
            th { background: #f8fafc; text-align: left; }
            .net { margin-top: 14px; padding: 12px; border-radius: 8px; border: 1px solid #bfdbfe; background: #eff6ff; }
          </style>
        </head>
        <body>
          <h1>Monthly Salary Slip</h1>
          <p class="meta">${salary.month} ${salary.year}</p>
          <p class="meta">Employee: ${salary.employeeName} (${salary.employeeCode})</p>
          <p class="meta">Department: ${salary.department} | Designation: ${salary.designation}</p>

          <div class="section">
            <h3>Earnings</h3>
            <table>
              <thead><tr><th>Component</th><th>Amount</th></tr></thead>
              <tbody>
                <tr><td>Basic</td><td>INR ${salary.components.basic.toFixed(2)}</td></tr>
                <tr><td>HRA</td><td>INR ${salary.components.hra.toFixed(2)}</td></tr>
                <tr><td>Allowances</td><td>INR ${salary.components.allowances.toFixed(2)}</td></tr>
                <tr><td>Bonus</td><td>INR ${salary.components.bonus.toFixed(2)}</td></tr>
                <tr><td>Other Earnings</td><td>INR ${salary.components.otherEarnings.toFixed(2)}</td></tr>
                <tr><td><strong>Gross Pay</strong></td><td><strong>INR ${salary.breakdown.grossPay.toFixed(2)}</strong></td></tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h3>Deductions</h3>
            <table>
              <thead><tr><th>Component</th><th>Amount</th></tr></thead>
              <tbody>
                <tr><td>PF (Employee)</td><td>INR ${salary.breakdown.pfEmployee.toFixed(2)}</td></tr>
                <tr><td>PF (Employer)</td><td>INR ${salary.breakdown.pfEmployer.toFixed(2)}</td></tr>
                <tr><td>ESI</td><td>INR ${salary.breakdown.esi.toFixed(2)}</td></tr>
                <tr><td>TDS</td><td>INR ${salary.breakdown.tds.toFixed(2)}</td></tr>
                <tr><td>Other Deductions</td><td>INR ${salary.components.otherDeductions.toFixed(2)}</td></tr>
                <tr><td><strong>Total Deductions</strong></td><td><strong>INR ${salary.breakdown.totalDeductions.toFixed(2)}</strong></td></tr>
              </tbody>
            </table>
          </div>

          <div class="net"><strong>Net Pay: INR ${salary.breakdown.netPay.toFixed(2)}</strong></div>
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Salary & Payroll History</h2>
        <p className="text-sm text-slate-500">Monthly salary slips and payroll breakdown for a single employee.</p>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Employee</p>
          <p className="mt-3 text-lg font-semibold text-slate-900">{employeeName}</p>
          <p className="mt-1 text-xs text-slate-500">{employeeCode}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Current Net Pay</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900">INR {latest ? latest.breakdown.netPay.toFixed(2) : '0.00'}</p>
          <p className="mt-1 text-xs text-slate-500">Latest generated month</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Status</p>
          <div className="mt-3">
            <Badge variant={latest?.status === 'Paid' ? 'success' : latest?.status === 'Processed' ? 'soft' : 'warning'}>
              {latest?.status ?? 'Draft'}
            </Badge>
          </div>
        </Card>
      </section>

      <Card noPadding>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Payroll History</h3>
            <p className="text-xs text-slate-500">Download monthly slips for this employee.</p>
          </div>
          <div className="rounded-lg bg-brand-50 p-2 text-brand-700"><History className="h-4 w-4" /></div>
        </div>

        {isLoading ? (
          <div className="p-6 text-sm text-slate-500">Loading salary history...</div>
        ) : isError ? (
          <div className="p-6 text-sm text-red-600">Unable to load salary history.</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">No payroll history found for this employee.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Month</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Gross</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Deductions</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Net Pay</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">PF + ESI + TDS</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, index) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-medium text-slate-900 sm:px-6">{row.month} {row.year}</td>
                    <td className="px-4 py-3.5 text-slate-600">INR {row.breakdown.grossPay.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-slate-600">INR {row.breakdown.totalDeductions.toFixed(2)}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">INR {row.breakdown.netPay.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-slate-600">
                      INR {(row.breakdown.pfEmployee + row.breakdown.esi + row.breakdown.tds).toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <Button variant="secondary" size="sm" onClick={() => generateSlipPdf(index)}>
                        <FileText className="h-4 w-4" />
                        Download Slip
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="bg-gradient-to-br from-brand-50 to-indigo-50/60">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white p-2 text-brand-700"><Wallet className="h-5 w-5" /></div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Salary Slip Generation</p>
            <p className="text-xs text-slate-600">
              Slips include Basic, HRA, Allowances, PF (Employee + Employer), ESI, TDS, deductions, and auto-calculated net pay.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
