"use client";

import { useMemo, useState } from 'react';
import { countChargeableLeaveDays, useHolidayCalendar } from '@/features/calendar/model/useHolidayCalendar';

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

const employees: LeaveBalance[] = [
  {
    employeeId: 'emp-1001',
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP-1001',
    department: 'Engineering',
    cl: { total: 8, used: 2, available: 6 },
    sl: { total: 8, used: 1, available: 7 },
    el: { total: 18, used: 5, available: 13 },
    carryForward: 4,
    encashable: 7
  },
  {
    employeeId: 'emp-1002',
    employeeName: 'Rahul Mehta',
    employeeCode: 'EMP-1002',
    department: 'Engineering',
    cl: { total: 8, used: 3, available: 5 },
    sl: { total: 8, used: 2, available: 6 },
    el: { total: 18, used: 4, available: 14 },
    carryForward: 3,
    encashable: 6
  },
  {
    employeeId: 'emp-1003',
    employeeName: 'Ananya Joshi',
    employeeCode: 'EMP-1003',
    department: 'Human Resources',
    cl: { total: 8, used: 1, available: 7 },
    sl: { total: 8, used: 0, available: 8 },
    el: { total: 18, used: 6, available: 12 },
    carryForward: 5,
    encashable: 5
  },
  {
    employeeId: 'emp-1004',
    employeeName: 'Sneha Patel',
    employeeCode: 'EMP-1004',
    department: 'Finance',
    cl: { total: 8, used: 4, available: 4 },
    sl: { total: 8, used: 1, available: 7 },
    el: { total: 18, used: 7, available: 11 },
    carryForward: 2,
    encashable: 4
  },
  {
    employeeId: 'emp-1005',
    employeeName: 'Vikram Singh',
    employeeCode: 'EMP-1005',
    department: 'Operations',
    cl: { total: 8, used: 2, available: 6 },
    sl: { total: 8, used: 2, available: 6 },
    el: { total: 18, used: 8, available: 10 },
    carryForward: 3,
    encashable: 5
  }
];

const initialRequests: LeaveRequest[] = [
  {
    id: 'leave-001',
    employeeId: 'emp-1001',
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP-1001',
    department: 'Engineering',
    type: 'CL',
    from: '2026-03-18',
    to: '2026-03-19',
    days: 2,
    reason: 'Family function in Jaipur.',
    status: 'Pending',
    approvalStage: 'Manager',
    currentApprover: 'Manager',
    createdAt: '2026-03-15 09:10',
    history: [{ actor: 'Priya Sharma', action: 'Applied for leave', at: '2026-03-15 09:10' }]
  },
  {
    id: 'leave-002',
    employeeId: 'emp-1002',
    employeeName: 'Rahul Mehta',
    employeeCode: 'EMP-1002',
    department: 'Engineering',
    type: 'SL',
    from: '2026-03-14',
    to: '2026-03-15',
    days: 2,
    reason: 'Recovering from viral fever.',
    status: 'Pending',
    approvalStage: 'HR',
    currentApprover: 'HR',
    createdAt: '2026-03-13 18:20',
    history: [
      { actor: 'Rahul Mehta', action: 'Applied for leave', at: '2026-03-13 18:20' },
      { actor: 'Engineering Manager', action: 'Approved and escalated to HR', at: '2026-03-14 09:00' }
    ]
  },
  {
    id: 'leave-003',
    employeeId: 'emp-1003',
    employeeName: 'Ananya Joshi',
    employeeCode: 'EMP-1003',
    department: 'Human Resources',
    type: 'EL',
    from: '2026-03-22',
    to: '2026-03-25',
    days: 4,
    reason: 'Planned annual leave.',
    status: 'Approved',
    approvalStage: 'Completed',
    currentApprover: 'HR',
    createdAt: '2026-03-10 11:45',
    history: [
      { actor: 'Ananya Joshi', action: 'Applied for leave', at: '2026-03-10 11:45' },
      { actor: 'HR Manager', action: 'Approved leave request', at: '2026-03-11 10:00' }
    ]
  },
  {
    id: 'leave-004',
    employeeId: 'emp-1004',
    employeeName: 'Sneha Patel',
    employeeCode: 'EMP-1004',
    department: 'Finance',
    type: 'CL',
    from: '2026-03-20',
    to: '2026-03-20',
    days: 1,
    reason: 'Personal emergency.',
    status: 'Rejected',
    approvalStage: 'Completed',
    currentApprover: 'Manager',
    createdAt: '2026-03-12 16:05',
    history: [
      { actor: 'Sneha Patel', action: 'Applied for leave', at: '2026-03-12 16:05' },
      { actor: 'Finance Manager', action: 'Rejected leave request', at: '2026-03-13 09:30', note: 'Quarter close in progress.' }
    ]
  }
];

function reduceBalance(balance: LeaveBalance, type: LeaveType, days: number): LeaveBalance {
  const key = type.toLowerCase() as 'cl' | 'sl' | 'el';
  return {
    ...balance,
    [key]: {
      ...balance[key],
      used: balance[key].used + days,
      available: Math.max(0, balance[key].available - days)
    }
  };
}

export function useLeaveManagement() {
  const { holidays } = useHolidayCalendar();
  const [balances, setBalances] = useState(employees);
  const [requests, setRequests] = useState(initialRequests);
  const [query, setQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All Employees');
  const [statusFilter, setStatusFilter] = useState<'All' | LeaveStatus>('All');
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);

  const departments = useMemo(
    () => ['All Departments', ...Array.from(new Set(balances.map((balance) => balance.department)))],
    [balances]
  );

  const employeesList = useMemo(
    () => balances.map((balance) => ({ id: balance.employeeId, name: balance.employeeName, department: balance.department })),
    [balances]
  );

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return requests
      .map((request) => ({
        ...request,
        days: countChargeableLeaveDays(request.from, request.to, holidays)
      }))
      .filter((request) => {
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
  }, [holidays, query, requests, selectedDepartment, selectedEmployeeId, statusFilter]);

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

  const submitApplication = (form: LeaveRequestForm) => {
    const employee = balances.find((balance) => balance.employeeId === form.employeeId);
    if (!employee) return;

    const days = countChargeableLeaveDays(form.from, form.to, holidays);

    setRequests((prev) => [
      {
        id: `leave-${Date.now()}`,
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        employeeCode: employee.employeeCode,
        department: employee.department,
        type: form.type,
        from: form.from,
        to: form.to,
        days,
        reason: form.reason.trim(),
        status: 'Pending',
        approvalStage: 'Manager',
        currentApprover: 'Manager',
        createdAt: new Date().toLocaleString(),
        history: [{ actor: employee.employeeName, action: 'Applied for leave', at: new Date().toLocaleString() }]
      },
      ...prev
    ]);

    if (selectedEmployeeId === 'All Employees') {
      setSelectedEmployeeId(employee.employeeId);
    }

    closeApplication();
  };

  const decideRequest = (requestId: string, decision: 'approve' | 'reject') => {
    let approvedRequest: LeaveRequest | null = null;

    setRequests((prev) =>
      prev.map((request) => {
        if (request.id !== requestId || request.status !== 'Pending') {
          return request;
        }

        const history = [...request.history];

        if (decision === 'reject') {
          history.push({
            actor: request.currentApprover === 'Manager' ? `${request.department} Manager` : 'HR Manager',
            action: 'Rejected leave request',
            at: new Date().toLocaleString()
          });

          return {
            ...request,
            status: 'Rejected',
            approvalStage: 'Completed',
            history
          };
        }

        if (request.currentApprover === 'Manager') {
          history.push({
            actor: `${request.department} Manager`,
            action: 'Approved and escalated to HR',
            at: new Date().toLocaleString()
          });

          return {
            ...request,
            approvalStage: 'HR',
            currentApprover: 'HR',
            history
          };
        }

        history.push({ actor: 'HR Manager', action: 'Approved leave request', at: new Date().toLocaleString() });

        const nextRequest = {
          ...request,
          status: 'Approved' as const,
          approvalStage: 'Completed' as const,
          history
        };

        approvedRequest = nextRequest;
        return nextRequest;
      })
    );

    if (approvedRequest) {
      setBalances((prev) =>
        prev.map((balance) =>
          balance.employeeId === approvedRequest?.employeeId
            ? reduceBalance(balance, approvedRequest.type, approvedRequest.days)
            : balance
        )
      );
    }
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
  };
}
