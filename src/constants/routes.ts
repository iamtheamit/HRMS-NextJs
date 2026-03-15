// routes.ts
// Centralizes route path constants for the HRMS frontend.

export const routes = {
  login: '/login',
  dashboard: '/dashboard',
  employees: '/employees',
  departments: '/departments',
  employeeDetails: (id: string | number) => `/employees/${id}`,
  attendance: '/attendance',
  leave: '/leave',
  tasks: '/tasks'
} as const;

