import apiClient from '@/shared/api/apiClient';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type HrAdminOverview = {
  summary: {
    totalEmployees: number;
    activeEmployees: number;
    departments: number;
    pendingLeaves: number;
    approvedLeavesThisMonth: number;
    newHiresThisMonth: number;
    todayCheckedIn: number;
    todayCheckedOut: number;
  };
  pendingLeaveRequests: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    department: string;
    type: string;
    startDate: string;
    endDate: string;
    reason: string | null;
    createdAt: string;
    status: string;
  }>;
};

export const fetchHrAdminOverview = async () => {
  const res = await apiClient.get<ApiResponse<HrAdminOverview>>('/hr-admin/overview');
  return res.data.data;
};
