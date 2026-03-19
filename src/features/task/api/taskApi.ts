import { apiClient } from '@/shared/api/apiClient';

export type TaskStatusApi = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriorityApi = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TaskApiItem = {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedByRole: 'MANAGER' | 'HR';
  dueDate: string;
  priority: TaskPriorityApi;
  status: TaskStatusApi;
  createdAt: string;
  assignedTo: {
    id: string;
    firstName: string;
    lastName: string;
    department?: {
      id: string;
      name: string;
    } | null;
  };
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type FetchTasksParams = {
  assignedToId?: string;
  status?: TaskStatusApi;
  priority?: TaskPriorityApi;
};

export type CreateTaskPayload = {
  title: string;
  description: string;
  assignedToId: string;
  dueDate: string;
  priority: TaskPriorityApi;
};

export const fetchTasks = async (params: FetchTasksParams = {}) => {
  const response = await apiClient.get<ApiResponse<TaskApiItem[]>>('/tasks', { params });
  return response.data.data;
};

export const createTask = async (payload: CreateTaskPayload) => {
  const response = await apiClient.post<ApiResponse<TaskApiItem>>('/tasks', payload);
  return response.data.data;
};

export const updateTaskStatus = async (taskId: string, status: TaskStatusApi) => {
  const response = await apiClient.patch<ApiResponse<TaskApiItem>>(`/tasks/${taskId}/status`, { status });
  return response.data.data;
};