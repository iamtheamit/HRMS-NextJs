// employees/page.tsx
// Renders the employee management table with avatars, status badges, and actions.

"use client";

import { useEmployees } from '@/entities/employee/model/useEmployees';
import { Table } from '@/shared/ui/Table';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { Pencil, Trash2 } from 'lucide-react';

export default function EmployeesPage() {
  const { data, isLoading, isError } = useEmployees();

  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 overflow-hidden">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Employees
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Manage headcount, teams, and status
            </p>
          </div>
          <Button className="text-xs">Add employee</Button>
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load employees.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table
                headers={[
                  '',
                  'Employee',
                  'Status',
                  'Designation',
                  'Teams',
                  'Actions'
                ]}
              >
                {rows.map((employee) => (
                  <tr
                    key={employee.id}
                    className="group cursor-pointer bg-white hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" status="online">
                          {`${(employee.firstName ?? '').charAt(0)}${(employee.lastName ?? '').charAt(0)}`.toUpperCase()}
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {`${employee.firstName ?? ''} ${employee.lastName ?? ''}`}
                          </p>
                          <p className="text-xs text-slate-400">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">—</td>
                    <td className="px-4 py-3">—</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-md p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
            {rows.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">
                No employees found. Start by adding your first team member.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
