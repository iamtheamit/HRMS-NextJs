// employee.schema.ts
// Defines Zod validation schema for employee create/update forms.

import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Please enter a valid email.'),
  designation: z.string().optional(),
  department: z.string().optional()
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

