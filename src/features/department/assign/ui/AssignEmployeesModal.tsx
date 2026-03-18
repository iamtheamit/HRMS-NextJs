'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import type { Employee } from '@/entities/employee/types/employee.types';

type DepartmentOption = {
  id: string;
  name: string;
};

type AssignEmployeesModalProps = {
  open: boolean;
  departments: DepartmentOption[];
  employees: Employee[];
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: { departmentId: string; employeeIds: string[] }) => void;
};

export function AssignEmployeesModal({
  open,
  departments,
  employees,
  isSubmitting = false,
  onClose,
  onSubmit,
}: AssignEmployeesModalProps) {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (!departments.length) {
      setSelectedDepartmentId('');
      setSelectedEmployeeIds([]);
      return;
    }

    const firstDepartmentId = departments[0].id;
    setSelectedDepartmentId(firstDepartmentId);
  }, [departments, open]);

  useEffect(() => {
    if (!selectedDepartmentId) {
      setSelectedEmployeeIds([]);
      return;
    }

    const preselected = employees
      .filter((employee) => employee.departmentId === selectedDepartmentId)
      .map((employee) => employee.id);

    setSelectedEmployeeIds(preselected);
  }, [employees, selectedDepartmentId]);

  const selectedDepartmentName = useMemo(() => {
    return departments.find((department) => department.id === selectedDepartmentId)?.name || 'selected department';
  }, [departments, selectedDepartmentId]);

  const toggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId);
      }
      return [...prev, employeeId];
    });
  };

  const handleSubmit = () => {
    if (!selectedDepartmentId || !selectedEmployeeIds.length) return;
    onSubmit({ departmentId: selectedDepartmentId, employeeIds: selectedEmployeeIds });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close assign employees modal"
      />

      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Assign Employees To Department</h3>
            <p className="mt-1 text-sm text-slate-600">
              Select a department and choose employees to assign.
            </p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Department</label>
            <select
              value={selectedDepartmentId}
              onChange={(event) => setSelectedDepartmentId(event.target.value)}
              className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Employees</p>
            <div className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-3">
              {employees.length === 0 && (
                <p className="text-sm text-slate-500">No employees available for assignment.</p>
              )}

              {employees.map((employee) => {
                const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || employee.email;
                const isSelected = selectedEmployeeIds.includes(employee.id);

                return (
                  <label key={employee.id} className="flex items-start gap-2 rounded-md p-2 transition hover:bg-white">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEmployee(employee.id)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">
                      <span className="block font-medium text-slate-800">{fullName}</span>
                      <span className="block text-xs text-slate-500">{employee.email}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            {selectedEmployeeIds.length} employee(s) selected for {selectedDepartmentName}.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!selectedDepartmentId || selectedEmployeeIds.length === 0} loading={isSubmitting}>
              Assign Employees
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignEmployeesModal;
