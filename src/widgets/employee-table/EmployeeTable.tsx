"use client";

import React from 'react';
import { Table } from '@/shared/ui/Table';
import { useEmployees } from '@/entities/employee/model/useEmployees';

export function EmployeeTable() {
  const { data, isLoading } = useEmployees(1, 10);

  if (isLoading) return <div>Loading...</div>;

  const rows = data?.data ?? [];

  return (
    <Table headers={[ 'Name', 'Email', 'Role' ]}>
      {rows.map((e) => (
        <tr key={e.id} className="border-t">
          <td className="p-2">{e.firstName} {e.lastName}</td>
          <td className="p-2">{e.email}</td>
          <td className="p-2">{e.role}</td>
        </tr>
      ))}
    </Table>
  );
}

export default EmployeeTable;
