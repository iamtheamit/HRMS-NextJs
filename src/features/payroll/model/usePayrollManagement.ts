"use client";

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePayroll } from '@/entities/payroll/model/usePayroll';
import { payrollService } from '@/entities/payroll/services/payrollService';
import type { PayrollRecord, PayrollStatus } from '@/entities/payroll/types/payroll.types';

const months = ['January', 'February', 'March'] as const;

export function usePayrollManagement() {
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState<(typeof months)[number]>('March');
  const [year, setYear] = useState(2026);
  const [status, setStatus] = useState<'All' | PayrollStatus>('All');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = usePayroll({ month, year });

  const processMutation = useMutation({
    mutationFn: (payrollId: string) => payrollService.process(payrollId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['payroll'] });
      await queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (payrollId: string) => payrollService.markPaid(payrollId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['payroll'] });
      await queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });

  const processAllMutation = useMutation({
    mutationFn: () => payrollService.processAllDrafts({ month, year }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['payroll'] });
      await queryClient.invalidateQueries({ queryKey: ['salary'] });
    },
  });

  const rows = useMemo<PayrollRecord[]>(() => {
    return data?.data ?? [];
  }, [data]);

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

  const processPayroll = async (payrollId: string) => {
    await processMutation.mutateAsync(payrollId);
  };

  const markPayrollPaid = async (payrollId: string) => {
    await markPaidMutation.mutateAsync(payrollId);
  };

  const processAllDrafts = async () => {
    await processAllMutation.mutateAsync();
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
