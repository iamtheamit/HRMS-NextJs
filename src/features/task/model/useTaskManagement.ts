"use client";

import { useMemo, useState } from 'react';

export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TaskAssignerRole = 'Manager' | 'HR';
export type ViewerRole = 'Manager' | 'HR' | 'Employee';

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
  assignedByRole: TaskAssignerRole;
};

type Employee = {
  id: string;
  name: string;
  department: string;
};

const employees: Employee[] = [
  { id: 'emp-1001', name: 'Priya Sharma', department: 'Engineering' },
  { id: 'emp-1002', name: 'Rahul Mehta', department: 'Engineering' },
  { id: 'emp-1003', name: 'Ananya Joshi', department: 'Human Resources' },
  { id: 'emp-1004', name: 'Sneha Patel', department: 'Finance' },
  { id: 'emp-1005', name: 'Vikram Singh', department: 'Operations' }
];

const initialTasks: TaskItem[] = [
  {
    id: 'task-001',
    title: 'Finalize onboarding checklist',
    description: 'Prepare and publish the updated employee onboarding checklist for Q2 hires.',
    assignedToId: 'emp-1003',
    assignedToName: 'Ananya Joshi',
    assignedToDepartment: 'Human Resources',
    assignedByRole: 'HR',
    dueDate: '2026-03-20',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2026-03-15 09:10'
  },
  {
    id: 'task-002',
    title: 'Resolve payroll discrepancy tickets',
    description: 'Investigate and close pending payroll discrepancy tickets from finance queue.',
    assignedToId: 'emp-1004',
    assignedToName: 'Sneha Patel',
    assignedToDepartment: 'Finance',
    assignedByRole: 'Manager',
    dueDate: '2026-03-18',
    priority: 'Critical',
    status: 'To Do',
    createdAt: '2026-03-15 10:35'
  },
  {
    id: 'task-003',
    title: 'Submit sprint attendance analytics',
    description: 'Create attendance vs productivity summary for current sprint and share with management.',
    assignedToId: 'emp-1001',
    assignedToName: 'Priya Sharma',
    assignedToDepartment: 'Engineering',
    assignedByRole: 'Manager',
    dueDate: '2026-03-22',
    priority: 'Medium',
    status: 'Completed',
    createdAt: '2026-03-14 16:20'
  }
];

const defaultTaskForm: TaskForm = {
  title: '',
  description: '',
  assignedToId: '',
  dueDate: '',
  priority: 'Medium',
  assignedByRole: 'Manager'
};

export function useTaskManagement() {
  const [tasks, setTasks] = useState(initialTasks);
  const [viewerRole, setViewerRole] = useState<ViewerRole>('Manager');
  const [activeEmployeeId, setActiveEmployeeId] = useState<string>(employees[0].id);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskPriority>('All');
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  const visibleTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const roleScoped = viewerRole === 'Employee' ? task.assignedToId === activeEmployeeId : true;
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesQuery =
        !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.assignedToName.toLowerCase().includes(normalizedQuery) ||
        task.assignedToDepartment.toLowerCase().includes(normalizedQuery);

      return roleScoped && matchesStatus && matchesPriority && matchesQuery;
    });
  }, [activeEmployeeId, priorityFilter, query, statusFilter, tasks, viewerRole]);

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

  const assignTask = (form: TaskForm) => {
    const employee = employees.find((entry) => entry.id === form.assignedToId);
    if (!employee) return;

    const payload: TaskItem = {
      id: `task-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      assignedToId: employee.id,
      assignedToName: employee.name,
      assignedToDepartment: employee.department,
      assignedByRole: form.assignedByRole,
      dueDate: form.dueDate,
      priority: form.priority,
      status: 'To Do',
      createdAt: new Date().toLocaleString()
    };

    setTasks((prev) => [payload, ...prev]);
    closeAssignment();
  };

  const updateTaskStatus = (taskId: string, nextStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;

        // Employees can only update their own tasks. Manager/HR can update all tasks.
        if (viewerRole === 'Employee' && task.assignedToId !== activeEmployeeId) return task;

        return { ...task, status: nextStatus };
      })
    );
  };

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
    viewerRole,
    setViewerRole,
    activeEmployeeId,
    setActiveEmployeeId,
    employees,
    defaultTaskForm,
    isAssignmentOpen,
    openAssignment,
    closeAssignment,
    assignTask,
    updateTaskStatus
  };
}

export default useTaskManagement;
