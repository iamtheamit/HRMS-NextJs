import apiClient from '@/shared/api/apiClient';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type Department = {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  headEmployeeId?: string | null;
  headEmployee?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  _count?: {
    employees: number;
  };
};

export const listDepartmentsApi = async () => {
  const res = await apiClient.get<ApiResponse<Department[]>>('/departments');
  return res.data.data;
};

export type CreateDepartmentPayload = {
  name: string;
  description?: string;
};

export const createDepartmentApi = async (payload: CreateDepartmentPayload) => {
  const res = await apiClient.post<ApiResponse<Department>>('/departments', payload);
  return res.data.data;
};

export type UpdateDepartmentPayload = {
  name?: string;
  description?: string;
  headEmployeeId?: string | null;
};

export const updateDepartmentApi = async (id: string, payload: UpdateDepartmentPayload) => {
  const res = await apiClient.put<ApiResponse<Department>>(`/departments/${id}`, payload);
  return res.data.data;
};
