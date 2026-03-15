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

export type AttendancePunchResponse = {
  action: 'CHECK_IN' | 'CHECK_OUT';
  record: AttendanceItem;
};

export const listAttendanceApi = async (employeeId?: string) => {
  const res = await apiClient.get<ApiResponse<AttendanceItem[]>>('/attendance', {
    params: employeeId ? { employeeId } : undefined,
  });
  return res.data.data;
};

export const punchAttendanceApi = async () => {
  const res = await apiClient.post<ApiResponse<AttendancePunchResponse>>('/attendance/punch');
  return res.data.data;
};
