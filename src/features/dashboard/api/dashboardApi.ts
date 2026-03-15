import apiClient from '@/shared/api/apiClient';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type DashboardOverview = {
  scope: 'GLOBAL' | 'TEAM';
  summary: {
    totalEmployees?: number;
    activeEmployees?: number;
    managers?: number;
    pendingLeaves?: number;
    teamSize?: number;
    activeTeamMembers?: number;
    pendingApprovals?: number;
    todayCheckedIn: number;
    todayCheckedOut: number;
  };
  pendingLeaveRequests?: Array<{
    id: string;
    employeeName: string;
    department: string;
    type: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
};

export const fetchDashboardOverview = async () => {
  const res = await apiClient.get<ApiResponse<DashboardOverview>>('/dashboard/overview');
  return res.data.data;
};
