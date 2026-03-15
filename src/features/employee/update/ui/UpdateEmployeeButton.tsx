"use client";

import React from 'react';
import { Button } from '@/shared/ui/Button';
import { useUpdateEmployee } from '../model/useUpdateEmployee';

export function UpdateEmployeeButton({ employeeId }: { employeeId: string }) {
  const updateEmployee = useUpdateEmployee();

  return (
    <Button
      variant="secondary"
      loading={updateEmployee.isPending}
      onClick={() =>
        updateEmployee.mutate({
          id: employeeId,
          payload: { role: 'Updated Role' }
        })
      }
    >
      Update
    </Button>
  );
}
