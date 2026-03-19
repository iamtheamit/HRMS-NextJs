"use client";

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSalary } from '@/entities/salary/model/useSalary';
import { salaryService } from '@/entities/salary/services/salaryService';
import type { SalaryComputed, SalaryStatus } from '@/entities/salary/types/salary.types';
import { applySalaryOverride, type SalaryOverride } from '@/features/payroll/model/payrollCalculations';

const months = ['January', 'February', 'March'] as const;

function toCsvCell(value: string | number) {
  const normalized = String(value).replace(/"/g, '""');
  return `"${normalized}"`;
}

export function useSalaryManagement() {
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState<(typeof months)[number]>('March');
  const [year, setYear] = useState(2026);
  const [department, setDepartment] = useState('All Departments');
  const [status, setStatus] = useState<'All' | SalaryStatus>('All');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useSalary({ month, year });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: SalaryOverride }) => {
      return salaryService.update(id, patch);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['salary'] });
      await queryClient.invalidateQueries({ queryKey: ['payroll'] });
    },
  });

  const allRows = useMemo<SalaryComputed[]>(() => {
    const rows = data?.data ?? [];
    return rows.map((row) => applySalaryOverride(row));
  }, [data]);

  const departments = useMemo(() => {
    return ['All Departments', ...Array.from(new Set(allRows.map((row) => row.department)))];
  }, [allRows]);

  const visibleRows = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return allRows.filter((row) => {
      const matchesSearch =
        !normalized ||
        row.employeeName.toLowerCase().includes(normalized) ||
        row.employeeCode.toLowerCase().includes(normalized) ||
        row.designation.toLowerCase().includes(normalized);
      const matchesDepartment = department === 'All Departments' || row.department === department;
      const matchesStatus = status === 'All' || row.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [allRows, department, search, status]);

  const totals = useMemo(() => {
    const gross = visibleRows.reduce((sum, row) => sum + row.breakdown.grossPay, 0);
    const deductions = visibleRows.reduce((sum, row) => sum + row.breakdown.totalDeductions, 0);
    const net = visibleRows.reduce((sum, row) => sum + row.breakdown.netPay, 0);

    return {
      employees: visibleRows.length,
      gross,
      deductions,
      net,
      draftCount: visibleRows.filter((row) => row.status === 'Draft').length
    };
  }, [visibleRows]);

  const updateSalary = (id: string, patch: SalaryOverride) => {
    updateMutation.mutate({ id, patch });
  };

  const exportSalaryCsv = () => {
    const rows = [
      ['Employee', 'Employee ID', 'Department', 'Status', 'Gross Pay', 'PF', 'ESI', 'TDS', 'Total Deductions', 'Net Pay'],
      ...visibleRows.map((row) => [
        row.employeeName,
        row.employeeCode,
        row.department,
        row.status,
        row.breakdown.grossPay,
        row.breakdown.pfEmployee,
        row.breakdown.esi,
        row.breakdown.tds,
        row.breakdown.totalDeductions,
        row.breakdown.netPay
      ])
    ];

    const csv = rows.map((row) => row.map((cell) => toCsvCell(cell)).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `salary-${month.toLowerCase()}-${year}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const generateSlipPdf = (salary: SalaryComputed) => {
    const popup = window.open('', '_blank', 'width=960,height=820');
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>Salary Slip - ${salary.employeeName}</title>
          <style>
            body { font-family: Segoe UI, sans-serif; padding: 28px; color: #0f172a; }
            h1, h2, h3, p { margin: 0; }
            .meta { margin-top: 8px; color: #475569; font-size: 12px; }
            .section { margin-top: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 12px; }
            th { background: #f8fafc; text-align: left; }
            .net { margin-top: 16px; padding: 12px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; }
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

          <div class="net">
            <strong>Net Pay: INR ${salary.breakdown.netPay.toFixed(2)}</strong>
          </div>
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  };

  return {
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
  };
}
