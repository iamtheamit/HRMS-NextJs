// employee.types.ts
// Declares TypeScript types for employee-related data structures.

export type Employee = {
  id: string;
  name: string;
  email: string;
  designation?: string;
  department?: string;
};

export type CreateEmployeePayload = Omit<Employee, 'id'>;

