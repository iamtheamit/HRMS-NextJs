"use client";

import React from 'react';
import { Trash2 } from 'lucide-react';
import { useDeleteEmployee } from '../model/useDeleteEmployee';

export function DeleteEmployeeButton({ employeeId }: { employeeId: string }) {
  const deleteEmployee = useDeleteEmployee();

  return (
    <button
      type="button"
      aria-label="Delete employee"
      className="rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
      onClick={() => deleteEmployee.mutate(employeeId)}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
