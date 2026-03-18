"use client";

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Pencil,
  Trash2,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { SearchBar } from '@/shared/ui/SearchBar';
import { AddDepartmentWizard } from '@/features/department/create/ui/AddDepartmentWizard';
import { useDepartmentDirectory } from '@/features/department/create/model/useDepartmentDirectory';
import { RoleGuard } from '@/shared/ui/RoleGuard';
import { AssignEmployeesModal } from '@/features/department/assign/ui/AssignEmployeesModal';
import { useEmployees } from '@/entities/employee/model/useEmployees';
import { assignDepartmentEmployeesApi } from '@/features/department/api/departmentApi';

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const { data: employees = [] } = useEmployees();

  const {
    departmentRows,
    filteredDepartments,
    query,
    setQuery,
    isFormOpen,
    editingDepartment,
    editingDepartmentId,
    existingDepartmentNames,
    existingDepartmentCodes,
    openCreateModal,
    openEditModal,
    closeFormModal,
    saveDepartment,
    deleteDepartment
  } = useDepartmentDirectory();

  const assignEmployeesMutation = useMutation({
    mutationFn: ({ departmentId, employeeIds }: { departmentId: string; employeeIds: string[] }) =>
      assignDepartmentEmployeesApi(departmentId, { employeeIds }),
    onSuccess: () => {
      setIsAssignModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_ADMIN']}>
      <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Department Management</h2>
          <p className="text-sm text-slate-500">
            Create departments and assign employees through dedicated guided workflows.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            placeholder="Search by department, code, or head"
            className="w-full sm:w-72"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button onClick={openCreateModal}>
            New Department
          </Button>
          <Button variant="secondary" onClick={() => setIsAssignModalOpen(true)}>
            Assign Employees
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card noPadding>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Departments Directory</h3>
              <p className="text-xs text-slate-500">Manage departments, owners, and team sizes</p>
            </div>
            <Badge variant="soft">{filteredDepartments.length} listed</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Department</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Head</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Employees</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map((dep) => (
                  <tr key={dep.id} className="group hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 sm:px-6">
                      <p className="font-medium text-slate-900">{dep.name}</p>
                      <p className="text-xs text-slate-500">{dep.code}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{dep.head}</td>
                    <td className="px-4 py-3.5 text-slate-600">{dep.employees}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={dep.status === 'Active' ? 'success' : 'warning'}>{dep.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => openEditModal(dep)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label={`Edit ${dep.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDepartment(dep.id)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${dep.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      <AddDepartmentWizard
        open={isFormOpen}
        mode={editingDepartmentId ? 'edit' : 'create'}
        initialForm={editingDepartment ?? undefined}
        existingDepartmentNames={existingDepartmentNames}
        existingDepartmentCodes={existingDepartmentCodes}
        onClose={closeFormModal}
        onSubmit={saveDepartment}
      />

      <AssignEmployeesModal
        open={isAssignModalOpen}
        departments={departmentRows.map((department) => ({ id: department.id, name: department.name }))}
        employees={employees}
        isSubmitting={assignEmployeesMutation.isPending}
        onClose={() => setIsAssignModalOpen(false)}
        onSubmit={({ departmentId, employeeIds }) => {
          assignEmployeesMutation.mutate({ departmentId, employeeIds });
        }}
      />
      </div>
    </RoleGuard>
  );
}
