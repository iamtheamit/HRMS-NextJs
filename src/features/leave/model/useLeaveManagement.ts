"use client";

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { countChargeableLeaveDays, useHolidayCalendar } from '@/features/calendar/model/useHolidayCalendar';
import { useEmployees } from '@/entities/employee/model/useEmployees';
import { useAuthStore } from '@/store/authStore';
import {
  approveLeaveApi,
  createLeaveApi,
  listLeaveApi,
  rejectLeaveApi,
  type LeaveItem,
} from '../api/leaveApi';

export type LeaveType = 'CL' | 'SL' | 'EL';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type ApprovalStage = 'Manager' | 'HR' | 'Completed';

export type LeaveBalance = {
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  cl: { total: number; used: number; available: number };
  sl: { total: number; used: number; available: number };
  el: { total: number; used: number; available: number };
  carryForward: number;
  encashable: number;
};

type LeaveHistoryEntry = {
  actor: string;
  action: string;
  at: string;
  note?: string;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  type: LeaveType;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvalStage: ApprovalStage;
  currentApprover: 'Manager' | 'HR';
  createdAt: string;
  history: LeaveHistoryEntry[];
};

export type LeaveRequestForm = {
  employeeId: string;
  type: LeaveType;
  from: string;
  to: string;
  reason: string;
};

const leavePolicy = {
  cl: 8,
  sl: 8,
  el: 18,
};

const toUiLeaveType = (type: LeaveItem['type']): LeaveType => {
  if (type === 'SICK') return 'SL';
  if (type === 'ANNUAL') return 'EL';
  return 'CL';
};

const toUiStatus = (status: LeaveItem['status']): LeaveStatus => {
  if (status === 'APPROVED') return 'Approved';
  if (status === 'REJECTED') return 'Rejected';
  return 'Pending';
};

const toApprovalStage = (status: LeaveItem['status']): ApprovalStage => {
  if (status === 'APPROVED' || status === 'REJECTED') return 'Completed';
  if (status === 'HR_PENDING') return 'HR';
  return 'Manager';
};

const toCurrentApprover = (status: LeaveItem['status']): 'Manager' | 'HR' => {
  if (status === 'HR_PENDING') return 'HR';
  return 'Manager';
};

const toEmployeeCode = (employeeId: string) => {
  return `EMP-${employeeId.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
};

const toDisplayDate = (value: string) => {
  return new Date(value).toISOString().slice(0, 10);
};

const toDisplayDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
};

const mapLeaveRequest = (item: LeaveItem, holidays: ReturnType<typeof useHolidayCalendar>['holidays']): LeaveRequest => {
  const from = toDisplayDate(item.startDate);
  const to = toDisplayDate(item.endDate);
  const employeeName = item.employee
    ? `${item.employee.firstName} ${item.employee.lastName}`.trim()
    : 'Employee';

  return {
    id: item.id,
    employeeId: item.employeeId,
    employeeName,
    employeeCode: toEmployeeCode(item.employeeId),
    department: item.employee?.department?.name || 'No Department',
    type: toUiLeaveType(item.type),
    from,
    to,
    days: countChargeableLeaveDays(from, to, holidays),
    reason: item.reason || '-',
    status: toUiStatus(item.status),
    approvalStage: toApprovalStage(item.status),
    currentApprover: toCurrentApprover(item.status),
    createdAt: toDisplayDateTime(item.createdAt),
    history: [
      {
        actor: employeeName,
        action: 'Applied for leave',
        at: toDisplayDateTime(item.createdAt),
      },
    ],
  };
};

export function useLeaveManagement() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { holidays } = useHolidayCalendar();
  const [query, setQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All Employees');
  const [statusFilter, setStatusFilter] = useState<'All' | LeaveStatus>('All');
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  const { data: employeeData = [] } = useEmployees(1, 300);

  const leaveQuery = useQuery({
    queryKey: ['leave-management', user?.role, user?.employeeId],
    queryFn: () => listLeaveApi(),
    enabled: Boolean(user?.role),
  });

  const requests = useMemo(() => {
    return (leaveQuery.data || []).map((item) => mapLeaveRequest(item, holidays));
  }, [holidays, leaveQuery.data]);

  const decideMutation = useMutation({
    mutationFn: ({ requestId, decision }: { requestId: string; decision: 'approve' | 'reject' }) => {
      if (decision === 'approve') {
        return approveLeaveApi(requestId);
      }

      return rejectLeaveApi(requestId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leave-management'] });
      await queryClient.invalidateQueries({ queryKey: ['leave-self'] });
    },
  });

  const createMutation = useMutation({
    mutationFn: (form: LeaveRequestForm) => {
      return createLeaveApi({
        startDate: form.from,
        endDate: form.to,
        type: form.type,
        reason: form.reason,
      });
    },
    onSuccess: async () => {
      closeApplication();
      await queryClient.invalidateQueries({ queryKey: ['leave-management'] });
      await queryClient.invalidateQueries({ queryKey: ['leave-self'] });
    },
  });

  const balances = useMemo<LeaveBalance[]>(() => {
    const approvedByEmployee = new Map<string, { cl: number; sl: number; el: number }>();

    requests.forEach((request) => {
      if (request.status !== 'Approved') return;

      const current = approvedByEmployee.get(request.employeeId) || { cl: 0, sl: 0, el: 0 };
      if (request.type === 'CL') current.cl += request.days;
      if (request.type === 'SL') current.sl += request.days;
      if (request.type === 'EL') current.el += request.days;
      approvedByEmployee.set(request.employeeId, current);
    });

    return employeeData.map((employee) => {
      const used = approvedByEmployee.get(employee.id) || { cl: 0, sl: 0, el: 0 };
      const employeeName = `${employee.firstName} ${employee.lastName}`.trim();
      const elAvailable = Math.max(leavePolicy.el - used.el, 0);

      return {
        employeeId: employee.id,
        employeeName,
        employeeCode: toEmployeeCode(employee.id),
        department: employee.department?.name || 'No Department',
        cl: {
          total: leavePolicy.cl,
          used: used.cl,
          available: Math.max(leavePolicy.cl - used.cl, 0),
        },
        sl: {
          total: leavePolicy.sl,
          used: used.sl,
          available: Math.max(leavePolicy.sl - used.sl, 0),
        },
        el: {
          total: leavePolicy.el,
          used: used.el,
          available: elAvailable,
        },
        carryForward: Math.min(elAvailable, 5),
        encashable: Math.max(elAvailable - 5, 0),
      };
    });
  }, [employeeData, requests]);

  const departments = useMemo(() => {
    return ['All Departments', ...Array.from(new Set(balances.map((balance) => balance.department)))];
  }, [balances]);

  const employeesList = useMemo(() => {
    return balances.map((balance) => ({
      id: balance.employeeId,
      name: balance.employeeName,
      department: balance.department,
    }));
  }, [balances]);

  const requestableEmployees = useMemo(() => {
    if (!user?.employeeId) return [];

    const self = balances.find((balance) => balance.employeeId === user.employeeId);
    if (!self) return [];

    return [{ id: self.employeeId, name: self.employeeName, department: self.department }];
  }, [balances, user?.employeeId]);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesDepartment = selectedDepartment === 'All Departments' || request.department === selectedDepartment;
      const matchesEmployee = selectedEmployeeId === 'All Employees' || request.employeeId === selectedEmployeeId;
      const matchesStatus = statusFilter === 'All' || request.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        request.employeeName.toLowerCase().includes(normalizedQuery) ||
        request.employeeCode.toLowerCase().includes(normalizedQuery) ||
        request.reason.toLowerCase().includes(normalizedQuery);

      return matchesDepartment && matchesEmployee && matchesStatus && matchesQuery;
    });
  }, [query, requests, selectedDepartment, selectedEmployeeId, statusFilter]);

  const filteredBalances = useMemo(() => {
    return balances.filter((balance) => {
      const matchesDepartment = selectedDepartment === 'All Departments' || balance.department === selectedDepartment;
      const matchesEmployee = selectedEmployeeId === 'All Employees' || balance.employeeId === selectedEmployeeId;
      return matchesDepartment && matchesEmployee;
    });
  }, [balances, selectedDepartment, selectedEmployeeId]);

  const selectedEmployeeHistory = useMemo(() => {
    const targetEmployeeId = selectedEmployeeId === 'All Employees' ? balances[0]?.employeeId : selectedEmployeeId;
    return requests.filter((request) => request.employeeId === targetEmployeeId);
  }, [balances, requests, selectedEmployeeId]);

  const leaveStats = useMemo(() => {
    return {
      pending: requests.filter((request) => request.status === 'Pending').length,
      approved: requests.filter((request) => request.status === 'Approved').length,
      rejected: requests.filter((request) => request.status === 'Rejected').length,
      carryForwardPool: balances.reduce((sum, balance) => sum + balance.carryForward, 0),
      encashablePool: balances.reduce((sum, balance) => sum + balance.encashable, 0)
    };
  }, [balances, requests]);

  const openApplication = () => setIsApplicationOpen(true);
  const closeApplication = () => setIsApplicationOpen(false);

  const submitApplication = async (form: LeaveRequestForm) => {
    await createMutation.mutateAsync(form);
  };

  const decideRequest = async (requestId: string, decision: 'approve' | 'reject') => {
    await decideMutation.mutateAsync({ requestId, decision });
  };

  const carryForwardPlan = useMemo(() => {
    return balances.map((balance) => ({
      employeeId: balance.employeeId,
      employeeName: balance.employeeName,
      carryForward: Math.min(balance.el.available, 5),
      encashable: Math.max(0, balance.el.available - 5)
    }));
  }, [balances]);

  return {
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
    requestableEmployees,
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
    decideRequest,
    isLoading: leaveQuery.isLoading,
    isActionPending: decideMutation.isPending,
    isSubmitting: createMutation.isPending,
    isError: leaveQuery.isError,
  };
}
