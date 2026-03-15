"use client";

import React from 'react';
import { Button } from '@/shared/ui/Button';
import { useCreateEmployee } from '../model/useCreateEmployee';

export function CreateEmployeeButton() {
  const createEmployee = useCreateEmployee();

  return (
    <Button
      loading={createEmployee.isPending}
      onClick={() =>
        createEmployee.mutate({
          firstName: 'New',
          lastName: 'Employee',
          email: `new.employee.${Date.now()}@example.com`
        })
      }
    >
      Add employee
    </Button>
  );
}
