// messages.ts
// Provides shared user-facing message constants for the HRMS frontend.

export const messages = {
  auth: {
    loginSuccess: 'Logged in successfully.',
    loginFailed: 'Invalid credentials, please try again.',
    logoutSuccess: 'You have been logged out.'
  },
  payroll: {
    calculateSuccess: 'Salary calculated successfully.',
    slipGenerated: 'Salary slip generated successfully.',
    payrollProcessed: 'Payroll processed for selected month.'
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.'
  }
} as const;

