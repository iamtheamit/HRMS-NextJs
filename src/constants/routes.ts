// routes.ts
// Centralizes route path constants for the HRMS frontend.

export const routes = {
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  employees: '/employees',
  departments: '/departments',
  employeeDetails: (id: string | number) => `/employees/${id}`,
  attendance: '/attendance',
  leave: '/leave',
  tasks: '/tasks',
  salary: '/salary',
  salaryDetails: (id: string | number) => `/salary/${id}`,
  payroll: '/payroll',
  payrollDetails: (id: string | number) => `/payroll/${id}`
} as const;

