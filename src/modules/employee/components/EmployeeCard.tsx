// EmployeeCard.tsx
// Displays a compact summary view of an employee.

import type { Employee } from '@/src/modules/employee/types/employee.types';

type EmployeeCardProps = {
  employee: Employee;
};

export const EmployeeCard = ({ employee }: EmployeeCardProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm font-medium text-slate-900">{employee.name}</p>
        <p className="text-xs text-slate-500">{employee.email}</p>
        {(employee.designation || employee.department) && (
          <p className="mt-1 text-xs text-slate-400">
            {[employee.designation, employee.department].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
};

