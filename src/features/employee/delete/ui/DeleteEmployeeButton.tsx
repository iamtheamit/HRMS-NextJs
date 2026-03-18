"use client";

import React from 'react';
import { Trash2 } from 'lucide-react';
import { useDeleteEmployee } from '../model/useDeleteEmployee';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

export function DeleteEmployeeButton({ employeeId }: { employeeId: string }) {
  const deleteEmployee = useDeleteEmployee();
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

  const handleDelete = () => {
    deleteEmployee.mutate(employeeId, {
      onSuccess: () => setIsConfirmOpen(false),
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Delete employee"
        className="rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
        onClick={() => setIsConfirmOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete Employee"
        description="This action will permanently remove the employee record. Are you sure you want to continue?"
        confirmLabel="Delete"
        tone="danger"
        loading={deleteEmployee.isPending}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
