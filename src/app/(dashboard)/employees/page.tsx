"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useEmployees } from '@/entities/employee/model/useEmployees';
import { Card } from '@/shared/ui/Card';
import { Avatar } from '@/shared/ui/Avatar';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { SearchBar } from '@/shared/ui/SearchBar';
import { LoadingSkeleton } from '@/shared/ui/LoadingSkeleton';
import {
  Briefcase,
  Building2,
  Download,
  Eye,
  FileUp,
  Filter,
  Pencil,
  Plus,
  UserSquare2,
  Users
} from 'lucide-react';
import { DeleteEmployeeButton } from '@/features/employee/delete/ui/DeleteEmployeeButton';
import { useUpdateEmployee } from '@/features/employee/update/model/useUpdateEmployee';
import { AddEmployeeWizard } from '@/features/employee/create/ui/AddEmployeeWizard';
import { RoleGuard } from '@/shared/ui/RoleGuard';

type EmployeeFormState = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  contact: string;
  address: string;
  designation: string;
  department: string;
  joiningDate: string;
  employeeCode: string;
};

const defaultForm: EmployeeFormState = {
  firstName: '',
  lastName: '',
  email: '',
  dob: '',
  contact: '',
  address: '',
  designation: '',
  department: 'Engineering',
  joiningDate: '',
  employeeCode: ''
};

const departments = ['All', 'Engineering', 'Human Resources', 'Finance', 'Operations'];

type EditFormState = Omit<EmployeeFormState, 'id'>;

export default function EmployeesPage() {
  const { data, isLoading, isError } = useEmployees();
  const updateEmployee = useUpdateEmployee();

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [form, setForm] = useState<EmployeeFormState>(defaultForm);

  const enrichedRows = useMemo(() => {
    const baseRows = data?.data ?? [];
    return baseRows.map((employee, index) => {
      const dept = departments[(index % (departments.length - 1)) + 1];
      const role = employee.role || ['Software Engineer', 'HR Executive', 'Accountant', 'Ops Manager'][index % 4];
      return {
        ...employee,
        department: dept,
        designation: role,
        employeeCode: `EMP-${String(index + 1001)}`,
        joiningDate: employee.joinedAt || '2024-02-14'
      };
    });
  }, [data]);

  const filteredRows = useMemo(() => {
    return enrichedRows.filter((employee) => {
      const text = `${employee.firstName} ${employee.lastName} ${employee.email ?? ''} ${employee.designation} ${employee.employeeCode}`.toLowerCase();
      const passSearch = text.includes(search.toLowerCase());
      const passDepartment = department === 'All' || employee.department === department;
      return passSearch && passDepartment;
    });
  }, [department, enrichedRows, search]);

  const departmentSummary = useMemo(() => {
    return departments.slice(1).map((dep) => ({
      department: dep,
      count: enrichedRows.filter((row) => row.department === dep).length
    }));
  }, [enrichedRows]);

  const isSaving = updateEmployee.isPending;

  const openEditModal = (employee: (typeof filteredRows)[number]) => {
    setForm({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email ?? '',
      dob: '',
      contact: '',
      address: '',
      designation: employee.designation,
      department: employee.department,
      joiningDate: employee.joiningDate,
      employeeCode: employee.employeeCode
    });
    setIsEditOpen(true);
  };

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER']}>
      <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Employee Management</h2>
          <p className="text-sm text-slate-500">Add, edit, and manage profiles with documents and department assignments.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SearchBar
            placeholder="Search by name, email, code"
            className="w-full sm:w-64"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-600">
            <Filter className="mr-2 h-3.5 w-3.5 text-slate-400" />
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="bg-transparent pr-2 outline-none"
            >
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <Button variant="secondary" size="sm">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button onClick={() => setIsWizardOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Employees</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-semibold text-slate-900">{enrichedRows.length}</p>
            <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Departments</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-semibold text-slate-900">{departments.length - 1}</p>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Documents Pending</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-semibold text-slate-900">12</p>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-700">
              <FileUp className="h-4 w-4" />
            </div>
          </div>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Positions</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-3xl font-semibold text-slate-900">9</p>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-700">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-2">
          {departmentSummary.map((item) => (
            <button
              key={item.department}
              type="button"
              onClick={() => setDepartment(item.department)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
            >
              <span>{item.department}</span>
              <Badge variant="soft">{item.count}</Badge>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setDepartment('All')}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Reset Filter
          </button>
        </div>
      </Card>

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
                  <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Employee</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Employee ID</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Designation</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Department</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Joining Date</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Documents</th>
                  <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.map((employee) => (
                  <tr key={employee.id} className="group transition hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 sm:px-6">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" status="online">
                          {`${(employee.firstName ?? '').charAt(0)}${(employee.lastName ?? '').charAt(0)}`.toUpperCase()}
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900">{`${employee.firstName ?? ''} ${employee.lastName ?? ''}`}</p>
                          <p className="text-xs text-slate-500">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{employee.employeeCode}</td>
                    <td className="px-4 py-3.5 text-slate-600">{employee.designation}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="soft">{employee.department}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{employee.joiningDate}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="warning">3 Pending</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                        <Link
                          href={`/employees/${employee.id}`}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label="View employee profile"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          onClick={() => openEditModal(employee)}
                          aria-label="Edit employee"
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

            {filteredRows.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  <UserSquare2 className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-900">No employees found</p>
                <p className="mt-1 text-xs text-slate-500">Try changing your department filter or add a new employee.</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Add: multi-step wizard */}
      <AddEmployeeWizard open={isWizardOpen} onClose={() => setIsWizardOpen(false)} />

      {/* Edit: simple modal (inline) */}
      {isEditOpen && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
          <div className="relative z-10 my-4 w-full max-w-lg rounded-2xl bg-white shadow-xl sm:my-0">
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-white px-6 pb-4 pt-5">
              <h2 className="text-base font-semibold text-slate-900">Edit Employee</h2>
              <button type="button" onClick={() => setIsEditOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            <div className="space-y-4 px-6 pb-6 pt-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">First Name</label>
                  <input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Last Name</label>
                  <input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Designation</label>
                <input value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Department</label>
                <select value={form.department} onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))} className="block h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100">
                  {departments.slice(1).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button
                  loading={isSaving}
                  onClick={() => {
                    if (!form.id) return;
                    updateEmployee.mutate(
                      { id: form.id, payload: { firstName: form.firstName, lastName: form.lastName, email: form.email, role: `${form.designation} | ${form.department}` } },
                      { onSuccess: () => setIsEditOpen(false) }
                    );
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </RoleGuard>
  );
}
