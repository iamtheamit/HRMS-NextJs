// routes.ts
// Centralizes route path constants for the HRMS frontend.

export const routes = {
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  dashboard: '/dashboard',
  profile: '/profile',
  hrAdmin: '/hr-admin',
  superAdmin: '/super-admin',
  manager: '/manager',
  employee: '/employee',
  employees: '/employees',
  departments: '/departments',
  employeeDetails: (id: string | number) => `/employees/${id}`,
  attendance: '/attendance',
  attendanceMe: '/attendance/me',
  leave: '/leave',
  leaveMe: '/leave/me',
  tasks: '/tasks',
  tasksMe: '/tasks/me',
  salary: '/salary',
  salaryDetails: (id: string | number) => `/salary/${id}`,
  payroll: '/payroll',
  payrollDetails: (id: string | number) => `/payroll/${id}`,
  settings: '/settings'
} as const;

