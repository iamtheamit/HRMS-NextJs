"use client";

import { useEffect, useMemo, useState } from 'react';

export type Department = {
  id: string;
  name: string;
  code: string;
  head: string;
  createdOn: string;
  costCenter: string;
  employees: number;
  openRoles: number;
  monthlyCost: string;
  utilization: number;
  status: 'Active' | 'Restructuring';
};

export type DepartmentFormValues = {
  name: string;
  code: string;
  head: string;
  createdOn: string;
  costCenter: string;
};

const initialDepartments: Department[] = [
  {
    id: 'dep-001',
    name: 'Engineering',
    code: 'ENG',
    head: 'Rahul Verma',
    createdOn: '2024-01-08',
    costCenter: 'CC-101',
    employees: 84,
    openRoles: 6,
    monthlyCost: 'Rs 48.2L',
    utilization: 89,
    status: 'Active'
  },
  {
    id: 'dep-002',
    name: 'Human Resources',
    code: 'HR',
    head: 'Amit Kumar',
    createdOn: '2024-01-15',
    costCenter: 'CC-114',
    employees: 18,
    openRoles: 1,
    monthlyCost: 'Rs 9.4L',
    utilization: 77,
    status: 'Active'
  },
  {
    id: 'dep-003',
    name: 'Finance',
    code: 'FIN',
    head: 'Neha Bansal',
    createdOn: '2024-01-22',
    costCenter: 'CC-118',
    employees: 21,
    openRoles: 2,
    monthlyCost: 'Rs 11.8L',
    utilization: 81,
    status: 'Active'
  },
  {
    id: 'dep-004',
    name: 'Operations',
    code: 'OPS',
    head: 'Sanjay Rao',
    createdOn: '2024-02-03',
    costCenter: 'CC-126',
    employees: 37,
    openRoles: 3,
    monthlyCost: 'Rs 19.1L',
    utilization: 68,
    status: 'Restructuring'
  }
];

export function useDepartmentDirectory() {
  const [departmentRows, setDepartmentRows] = useState(initialDepartments);
  const [query, setQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState(initialDepartments[0]?.name ?? '');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<string | null>(null);

  const filteredDepartments = useMemo(() => {
    if (!query.trim()) return departmentRows;

    const normalizedQuery = query.toLowerCase();
    return departmentRows.filter(
      (department) =>
        department.name.toLowerCase().includes(normalizedQuery) ||
        department.code.toLowerCase().includes(normalizedQuery) ||
        department.head.toLowerCase().includes(normalizedQuery)
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

  useEffect(() => {
    if (!departmentRows.length) {
      setSelectedDept('');
      return;
    }

    const selectedStillExists = departmentRows.some((department) => department.name === selectedDept);
    if (!selectedStillExists) {
      setSelectedDept(departmentRows[0].name);
    }
  }, [departmentRows, selectedDept]);

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

  const saveDepartment = (values: DepartmentFormValues) => {
    const payload = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      head: values.head.trim(),
      createdOn: values.createdOn,
      costCenter: values.costCenter.trim().toUpperCase()
    };

    if (editingDepartmentId) {
      setDepartmentRows((prev) =>
        prev.map((department) =>
          department.id === editingDepartmentId ? { ...department, ...payload } : department
        )
      );

      if (editingDepartment && selectedDept === editingDepartment.name) {
        setSelectedDept(payload.name);
      }
    } else {
      setDepartmentRows((prev) => [
        {
          id: `dep-${Date.now()}`,
          ...payload,
          employees: 0,
          openRoles: 0,
          monthlyCost: 'Rs 0.0L',
          utilization: 0,
          status: 'Active'
        },
        ...prev
      ]);
      setSelectedDept(payload.name);
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
  };
}
