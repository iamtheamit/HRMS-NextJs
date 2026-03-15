import apiClient from '@/shared/api/apiClient';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type LeaveItem = {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: 'ANNUAL' | 'SICK' | 'UNPAID' | 'OTHER';
  status: 'PENDING' | 'MANAGER_PENDING' | 'HR_PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string | null;
  createdAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    department?: {
      id: string;
      name: string;
    } | null;
  };
};

export type CreateLeaveInput = {
  startDate: string;
  endDate: string;
  type: 'CL' | 'SL' | 'EL';
  reason: string;
};

const toBackendLeaveType = (type: CreateLeaveInput['type']) => {
  if (type === 'SL') return 'SICK';
  if (type === 'EL') return 'ANNUAL';
  return 'OTHER';
};

export const listLeaveApi = async (employeeId?: string) => {
  const res = await apiClient.get<ApiResponse<LeaveItem[]>>('/leaves', {
    params: employeeId ? { employeeId } : undefined,
  });
  return res.data.data;
};

export const createLeaveApi = async (payload: CreateLeaveInput) => {
  const body = {
    startDate: payload.startDate,
    endDate: payload.endDate,
    type: toBackendLeaveType(payload.type),
    reason: payload.reason,
  };

  const res = await apiClient.post<ApiResponse<LeaveItem>>('/leaves', body);
  return res.data.data;
};

export const approveLeaveApi = async (id: string) => {
  const res = await apiClient.post<ApiResponse<LeaveItem>>(`/leaves/${id}/approve`);
  return res.data.data;
};

export const rejectLeaveApi = async (id: string) => {
  const res = await apiClient.post<ApiResponse<LeaveItem>>(`/leaves/${id}/reject`);
  return res.data.data;
};
