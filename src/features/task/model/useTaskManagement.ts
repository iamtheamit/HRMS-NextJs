"use client";

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useEmployees } from '@/entities/employee/model/useEmployees';
import {
  createTask,
  fetchTasks,
  updateTaskStatus as updateTaskStatusRequest,
  type CreateTaskPayload,
  type TaskApiItem,
  type TaskPriorityApi,
  type TaskStatusApi,
} from '../api/taskApi';

export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskAssignerRole = 'Manager' | 'HR';

export type TaskItem = {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  assignedToDepartment: string;
  assignedByRole: TaskAssignerRole;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
};

export type TaskForm = {
  title: string;
  description: string;
  assignedToId: string;
  dueDate: string;
  priority: TaskPriority;
};

type Employee = {
  id: string;
  name: string;
  department: string;
};

const defaultTaskForm: TaskForm = {
  title: '',
  description: '',
  assignedToId: '',
  dueDate: '',
  priority: 'Medium',
};

const taskStatusMap: Record<TaskStatusApi, TaskStatus> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

const taskPriorityMap: Record<TaskPriorityApi, TaskPriority> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

const taskAssignerRoleMap: Record<'MANAGER' | 'HR', TaskAssignerRole> = {
  MANAGER: 'Manager',
  HR: 'HR',
};

const taskStatusApiMap: Record<TaskStatus, TaskStatusApi> = {
  'To Do': 'TODO',
  'In Progress': 'IN_PROGRESS',
  Completed: 'COMPLETED',
};

const taskPriorityApiMap: Record<TaskPriority, TaskPriorityApi> = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
  Critical: 'CRITICAL',
};

const formatDate = (value: string) => value.slice(0, 10);

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const mapTask = (task: TaskApiItem): TaskItem => ({
  id: task.id,
  title: task.title,
  description: task.description,
  assignedToId: task.assignedToId,
  assignedToName: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`.trim(),
  assignedToDepartment: task.assignedTo.department?.name || 'Unassigned',
  assignedByRole: taskAssignerRoleMap[task.assignedByRole],
  dueDate: formatDate(task.dueDate),
  priority: taskPriorityMap[task.priority],
  status: taskStatusMap[task.status],
  createdAt: formatDateTime(task.createdAt),
});

type UseTaskManagementOptions = {
  mode: 'admin' | 'self';
};

export function useTaskManagement({ mode }: UseTaskManagementOptions) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskPriority>('All');
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  const { data: employeeData = [], isLoading: isEmployeesLoading } = useEmployees(1, 200);

  const employees = useMemo<Employee[]>(() => {
    const scopedEmployees = employeeData.filter((employee) => {
      if (!user?.role) {
        return false;
      }

      if (user.role === 'SUPER_ADMIN' || user.role === 'HR_ADMIN') {
        return true;
      }

      if (user.role === 'MANAGER') {
        return employee.id === user.employeeId || employee.managerId === user.employeeId;
      }

      return employee.id === user.employeeId;
    });

    return scopedEmployees.map((employee) => ({
      id: employee.id,
      name: `${employee.firstName} ${employee.lastName}`.trim(),
      department: employee.department?.name || 'No Department',
    }));
  }, [employeeData, user?.employeeId, user?.role]);

  const taskQueryParams = useMemo(() => {
    const params: {
      assignedToId?: string;
      status?: TaskStatusApi;
      priority?: TaskPriorityApi;
    } = {};

    if (mode === 'self' && user?.employeeId) {
      params.assignedToId = user.employeeId;
    }

    if (statusFilter !== 'All') {
      params.status = taskStatusApiMap[statusFilter];
    }

    if (priorityFilter !== 'All') {
      params.priority = taskPriorityApiMap[priorityFilter];
    }

    return params;
  }, [mode, priorityFilter, statusFilter, user?.employeeId]);

  const { data: taskData = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', mode, user?.role, user?.employeeId, taskQueryParams],
    queryFn: () => fetchTasks(taskQueryParams),
    enabled: Boolean(user?.role),
  });

  const tasks = useMemo(() => taskData.map(mapTask), [taskData]);

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesQuery =
        !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.assignedToName.toLowerCase().includes(normalizedQuery) ||
        task.assignedToDepartment.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesPriority && matchesQuery;
    });
  }, [priorityFilter, query, statusFilter, tasks]);

  const stats = useMemo(() => {
    return {
      todo: visibleTasks.filter((task) => task.status === 'To Do').length,
      inProgress: visibleTasks.filter((task) => task.status === 'In Progress').length,
      completed: visibleTasks.filter((task) => task.status === 'Completed').length,
      highPriority: visibleTasks.filter((task) => task.priority === 'High' || task.priority === 'Critical').length
    };
  }, [visibleTasks]);

  const openAssignment = () => setIsAssignmentOpen(true);
  const closeAssignment = () => setIsAssignmentOpen(false);

  const createTaskMutation = useMutation({
    mutationFn: (form: TaskForm) => {
      const payload: CreateTaskPayload = {
        title: form.title.trim(),
        description: form.description.trim(),
        assignedToId: form.assignedToId,
        dueDate: form.dueDate,
        priority: taskPriorityApiMap[form.priority],
      };

      return createTask(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      closeAssignment();
    },
  });

  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, nextStatus }: { taskId: string; nextStatus: TaskStatus }) => {
      return updateTaskStatusRequest(taskId, taskStatusApiMap[nextStatus]);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const assignTask = async (form: TaskForm) => createTaskMutation.mutateAsync(form);

  const updateTaskStatus = async (taskId: string, nextStatus: TaskStatus) => {
    await updateTaskStatusMutation.mutateAsync({ taskId, nextStatus });
  };

  const canAssignTasks = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'MANAGER';
  const canUpdateTask = (task: TaskItem) => task.assignedToId === user?.employeeId;
  const assignerRole: TaskAssignerRole = user?.role === 'MANAGER' ? 'Manager' : 'HR';

  return {
    tasks: visibleTasks,
    rawTasks: tasks,
    stats,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    employees,
    defaultTaskForm,
    isAssignmentOpen,
    openAssignment,
    closeAssignment,
    assignTask,
    updateTaskStatus,
    canAssignTasks,
    canUpdateTask,
    assignerRole,
    isLoading: isTasksLoading || (mode === 'admin' && isEmployeesLoading),
    isAssigning: createTaskMutation.isPending,
    isUpdating: updateTaskStatusMutation.isPending,
  };
}

export default useTaskManagement;
