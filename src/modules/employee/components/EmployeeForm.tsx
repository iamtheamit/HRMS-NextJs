// EmployeeForm.tsx
// Renders the employee create/update form UI using validation schema.

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  employeeSchema,
  type EmployeeFormValues
} from '@/src/modules/employee/validation/employee.schema';
import { Button } from '@/src/shared/components/Button';
import { Input } from '@/src/shared/components/Input';

type EmployeeFormProps = {
  onSubmit: (values: EmployeeFormValues) => Promise<void> | void;
  submitting?: boolean;
};

export const EmployeeForm = ({ onSubmit, submitting }: EmployeeFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      designation: '',
      department: ''
    }
  });

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
    >
      <Input label="Name" {...register('name')} error={errors.name?.message} />
      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        label="Designation"
        {...register('designation')}
        error={errors.designation?.message}
      />
      <Input
        label="Department"
        {...register('department')}
        error={errors.department?.message}
      />
      <Button type="submit" loading={submitting} className="w-full">
        Save Employee
      </Button>
    </form>
  );
};

