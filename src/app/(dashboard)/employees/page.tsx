"use client";

import { useEmployees } from '@/entities/employee/model/useEmployees';
import { Card } from '@/shared/ui/Card';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { SearchBar } from '@/shared/ui/SearchBar';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import { Pencil, Filter, Download } from 'lucide-react';
import { CreateEmployeeButton } from '@/features/employee/create/ui/CreateEmployeeButton';
import { DeleteEmployeeButton } from '@/features/employee/delete/ui/DeleteEmployeeButton';

export default function EmployeesPage() {
  const { data, isLoading, isError } = useEmployees();
  const rows = data?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">All Employees</h2>
          <p className="text-sm text-slate-500">{rows.length} team members total</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar placeholder="Search employees..." className="w-full sm:w-60" />
          <Button variant="secondary" size="sm">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <CreateEmployeeButton />
        </div>
      </div>

      {/* Table card */}
      <Card noPadding>
        {isLoading ? (
          <div className="p-6">
            <LoadingSkeleton />
          </div>
        ) : isError ? (
          <div className="p-6">
            <p className="text-sm text-red-600">Failed to load employees. Please try again.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="w-10 px-5 py-3 sm:px-6">
                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" />
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Employee</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Designation</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Team</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((employee) => (
                  <tr
                    key={employee.id}
                    className="group transition hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3.5 sm:px-6">
                      <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" status="online">
                          {`${(employee.firstName ?? '').charAt(0)}${(employee.lastName ?? '').charAt(0)}`.toUpperCase()}
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">
                            {`${employee.firstName ?? ''} ${employee.lastName ?? ''}`}
                          </p>
                          <p className="text-xs text-slate-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">—</td>
                    <td className="px-4 py-3.5 text-slate-600">—</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <DeleteEmployeeButton employeeId={employee.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {rows.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <Filter className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-900">No employees found</p>
                <p className="mt-1 text-xs text-slate-500">Start by adding your first team member.</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
