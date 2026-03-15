import apiClient from '@/shared/api/apiClient';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type AttendanceEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  department?: {
    id: string;
    name: string;
  } | null;
};

export type AttendanceItem = {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
  employee?: AttendanceEmployee;
};

export const listAttendanceApi = async (employeeId?: string) => {
  const res = await apiClient.get<ApiResponse<AttendanceItem[]>>('/attendance', {
    params: employeeId ? { employeeId } : undefined,
  });
  return res.data.data;
};

export const checkInApi = async () => {
  const res = await apiClient.post<ApiResponse<AttendanceItem>>('/attendance/check-in');
  return res.data.data;
};

export const checkOutApi = async () => {
  const res = await apiClient.post<ApiResponse<AttendanceItem>>('/attendance/check-out');
  return res.data.data;
};
