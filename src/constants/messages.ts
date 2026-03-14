// messages.ts
// Provides shared user-facing message constants for the HRMS frontend.

export const messages = {
  auth: {
    loginSuccess: 'Logged in successfully.',
    loginFailed: 'Invalid credentials, please try again.',
    logoutSuccess: 'You have been logged out.'
  },
  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Please check your connection.'
  }
} as const;

