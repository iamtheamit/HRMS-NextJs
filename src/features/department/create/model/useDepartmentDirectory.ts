"use client";

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  createDepartmentApi,
  listDepartmentsApi,
  updateDepartmentApi,
  type Department as ApiDepartment,
} from '@/features/department/api/departmentApi';

export type Department = {
  id: string;
  name: string;
  code: string;
  head: string;
  headEmployeeId?: string;
  createdOn: string;
  employees: number;
  openRoles: number;
  monthlyCost: string;
  utilization: number;
  status: 'Active' | 'Restructuring';
};

export type DepartmentFormValues = {
  name: string;
  code: string;
};

const mapApiDepartmentToRow = (department: ApiDepartment): Department => {
  const code = department.name
    .split(' ')
    .filter(Boolean)
    .map((chunk) => chunk[0])
    .join('')
    .toUpperCase()
    .slice(0, 5);

  return {
    id: department.id,
    name: department.name,
    code: code || 'DEP',
    head: department.headEmployee
      ? `${department.headEmployee.firstName || ''} ${department.headEmployee.lastName || ''}`.trim()
      : 'Unassigned',
    headEmployeeId: department.headEmployee?.id,
    createdOn: department.createdAt
      ? new Date(department.createdAt).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    employees: department._count?.employees || 0,
    openRoles: 0,
    monthlyCost: 'Rs 0.0L',
    utilization: 0,
    status: 'Active' as const,
  };
};

export function useDepartmentDirectory() {
  const [departmentRows, setDepartmentRows] = useState<Department[]>([]);
  const [query, setQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);

  const departmentsQuery = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartmentsApi,
  });

  useEffect(() => {
    if (!departmentsQuery.data) return;
    setDepartmentRows(departmentsQuery.data.map(mapApiDepartmentToRow));
  }, [departmentsQuery.data]);

  const filteredDepartments = useMemo(() => {
    if (!query.trim()) return departmentRows;

    const normalizedQuery = query.toLowerCase();
    return departmentRows.filter(
      (department) =>
        department.name.toLowerCase().includes(normalizedQuery) ||
        department.code.toLowerCase().includes(normalizedQuery)
    );
  }, [departmentRows, query]);

  const editingDepartment = useMemo(
    () => departmentRows.find((department) => department.id === editingDepartmentId) ?? null,
    [departmentRows, editingDepartmentId]
  );

  const totalEmployees = useMemo(
    () => departmentRows.reduce((sum, department) => sum + department.employees, 0),
    [departmentRows]
  );

  const totalOpenRoles = useMemo(
    () => departmentRows.reduce((sum, department) => sum + department.openRoles, 0),
    [departmentRows]
  );

  const existingDepartmentNames = useMemo(
    () => departmentRows.map((department) => department.name),
    [departmentRows]
  );

  const existingDepartmentCodes = useMemo(
    () => departmentRows.map((department) => department.code),
    [departmentRows]
  );

  const openCreateModal = () => {
    setEditingDepartmentId(null);
    setIsFormOpen(true);
  };

  const openEditModal = (department: Department) => {
    setEditingDepartmentId(department.id);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setEditingDepartmentId(null);
    setIsFormOpen(false);
  };

  const saveDepartment = async (values: DepartmentFormValues) => {
    const payload = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
    };

    if (editingDepartmentId) {
      try {
        const updated = await updateDepartmentApi(editingDepartmentId, {
          name: payload.name,
          description: payload.code,
        });

        const mapped = mapApiDepartmentToRow(updated);

        setDepartmentRows((prev) =>
          prev.map((department) =>
            department.id === editingDepartmentId ? { ...department, ...mapped } : department
          )
        );
      } catch (error) {
        console.error('Department update failed:', error);
      }
    } else {
      try {
        const created = await createDepartmentApi({
          name: payload.name,
          description: payload.code,
        });

        setDepartmentRows((prev) => [mapApiDepartmentToRow(created), ...prev]);
      } catch (error) {
        console.error('Department create failed:', error);
      }
    }

    closeFormModal();
  };

  const deleteDepartment = (departmentId: string) => {
    setDepartmentRows((prev) => prev.filter((department) => department.id !== departmentId));
  };

  return {
    departmentRows,
    filteredDepartments,
    totalEmployees,
    totalOpenRoles,
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
  };
}
