"use client";

import { useMemo, useState } from 'react';
import { usePayroll } from '@/entities/payroll/model/usePayroll';
import type { PayrollRecord, PayrollStatus } from '@/entities/payroll/types/payroll.types';

const months = ['January', 'February', 'March'] as const;

export function usePayrollManagement() {
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState<(typeof months)[number]>('March');
  const [year, setYear] = useState(2026);
  const [status, setStatus] = useState<'All' | PayrollStatus>('All');
  const [statusOverrides, setStatusOverrides] = useState<Record<string, PayrollStatus>>({});

  const { data, isLoading, isError } = usePayroll({ month, year });

  const rows = useMemo<PayrollRecord[]>(() => {
    const list = data?.data ?? [];
    return list.map((row) => ({
      ...row,
      status: statusOverrides[row.payrollId] ?? row.status
    }));
  }, [data, statusOverrides]);

  const visibleRows = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        !normalized ||
        row.employeeName.toLowerCase().includes(normalized) ||
        row.employeeCode.toLowerCase().includes(normalized) ||
        row.department.toLowerCase().includes(normalized);
      const matchesStatus = status === 'All' || row.status === status;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, status]);

  const stats = useMemo(() => {
    return {
      total: visibleRows.length,
      draft: visibleRows.filter((row) => row.status === 'Draft').length,
      processed: visibleRows.filter((row) => row.status === 'Processed').length,
      paid: visibleRows.filter((row) => row.status === 'Paid').length,
      netPayout: visibleRows.reduce((sum, row) => sum + row.netPay, 0)
    };
  }, [visibleRows]);

  const processPayroll = (payrollId: string) => {
    setStatusOverrides((prev) => ({
      ...prev,
      [payrollId]: 'Processed'
    }));
  };

  const markPayrollPaid = (payrollId: string) => {
    setStatusOverrides((prev) => ({
      ...prev,
      [payrollId]: 'Paid'
    }));
  };

  const processAllDrafts = () => {
    const nextOverrides = visibleRows.reduce<Record<string, PayrollStatus>>((acc, row) => {
      if (row.status === 'Draft') {
        acc[row.payrollId] = 'Processed';
      }
      return acc;
    }, {});

    setStatusOverrides((prev) => ({
      ...prev,
      ...nextOverrides
    }));
  };

  return {
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
  };
}
