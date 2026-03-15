"use client";

import { useMemo } from 'react';
import {
  BarChart3,
  Briefcase,
  Building2,
  Pencil,
  Trash2,
  UserCog,
  Users2
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { SearchBar } from '@/shared/ui/SearchBar';
import { AddDepartmentWizard } from '@/features/department/create/ui/AddDepartmentWizard';
import { useDepartmentDirectory } from '@/features/department/create/model/useDepartmentDirectory';
import { RoleGuard } from '@/shared/ui/RoleGuard';

const employees = [
  'Ananya Sharma',
  'Vikas Singh',
  'Priya Nair',
  'Rohit Mehta',
  'Sneha Patel'
];

export default function DepartmentsPage() {
  const {
    departmentRows,
    filteredDepartments,
    totalEmployees,
    totalOpenRoles,
    query,
    setQuery,
    selectedDept,
    setSelectedDept,
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

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_ADMIN']}>
      <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Department Management</h2>
          <p className="text-sm text-slate-500">
            Create departments, assign employees, and monitor department-wise reports.
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
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-gradient-to-br from-white to-brand-50/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Departments</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{departmentRows.length}</p>
            </div>
            <div className="rounded-xl bg-brand-50 p-2.5 text-brand-700">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Employees Assigned</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{totalEmployees}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
              <Users2 className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Open Positions</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{totalOpenRoles}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Assignments Today</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">14</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700">
              <UserCog className="h-5 w-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card noPadding className="xl:col-span-3">
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

        <div className="space-y-6 xl:col-span-2">
          <Card>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Assign Employees</h3>
              <p className="text-xs text-slate-500">Map employees to departments in a single flow</p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Department</label>
                <select
                  value={selectedDept}
                  onChange={(event) => setSelectedDept(event.target.value)}
                  disabled={!departmentRows.length}
                  className="block h-10 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                >
                  {departmentRows.map((dep) => (
                    <option key={dep.id} value={dep.name}>
                      {dep.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Employees</p>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                  {employees.map((employee, index) => (
                    <label key={employee} className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" defaultChecked={index < 2} className="h-4 w-4 rounded border-slate-300" />
                      <span>{employee}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button variant="secondary" className="w-full" disabled={!selectedDept}>
                Assign To {selectedDept}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Card noPadding>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Department-wise Reports</h3>
            <p className="text-xs text-slate-500">Employee count, utilization, and monthly cost overview</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
            <BarChart3 className="h-4 w-4" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Department</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Employee Count</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Open Roles</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Utilization</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentRows.map((dep) => (
                <tr key={`${dep.id}-report`} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-medium text-slate-900 sm:px-6">{dep.name}</td>
                  <td className="px-4 py-3.5 text-slate-600">{dep.employees}</td>
                  <td className="px-4 py-3.5 text-slate-600">{dep.openRoles}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-600" style={{ width: `${dep.utilization}%` }} />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{dep.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{dep.monthlyCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddDepartmentWizard
        open={isFormOpen}
        mode={editingDepartmentId ? 'edit' : 'create'}
        initialForm={editingDepartment ?? undefined}
        existingDepartmentNames={existingDepartmentNames}
        existingDepartmentCodes={existingDepartmentCodes}
        onClose={closeFormModal}
        onSubmit={saveDepartment}
      />
      </div>
    </RoleGuard>
  );
}
