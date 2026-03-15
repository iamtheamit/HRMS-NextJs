"use client";

import React from 'react';
import { Table } from '@/shared/ui/Table';
import { useEmployees } from '@/entities/employee/model/useEmployees';

export function EmployeeTable() {
  const { data, isLoading } = useEmployees(1, 10);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Table>
      <thead>
        <tr>
          <th className="text-left p-2">Name</th>
          <th className="text-left p-2">Email</th>
          <th className="text-left p-2">Role</th>
        </tr>
      </thead>
      <tbody>
        {data?.data.map((e) => (
          <tr key={e.id} className="border-t">
            <td className="p-2">{e.firstName} {e.lastName}</td>
            <td className="p-2">{e.email}</td>
            <td className="p-2">{e.role}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default EmployeeTable;
