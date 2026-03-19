"use client";

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { countWorkingDaysInMonth, useHolidayCalendar } from '@/features/calendar/model/useHolidayCalendar';
import { useEmployees } from '@/entities/employee/model/useEmployees';
import {
  listAttendanceApi,
  markAttendanceApi,
  updateAttendanceStatusApi,
  type AttendanceItem,
} from '../api/attendanceApi';

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'Late';

type MonthlyBreakdown = {
  present: number;
  absent: number;
  halfDay: number;
  late: number;
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  attendanceId: string | null;
  employeeName: string;
  employeeCode: string;
  department: string;
  designation: string;
  checkIn: string;
  status: AttendanceStatus;
  month: string;
  monthly: MonthlyBreakdown;
};

type DepartmentSummary = {
  department: string;
  headcount: number;
  present: number;
  absent: number;
  halfDay: number;
  late: number;
  attendanceRate: number;
};

const STATUS_TO_API: Record<AttendanceStatus, AttendanceItem['status']> = {
  Present: 'PRESENT',
  Absent: 'ABSENT',
  'Half Day': 'HALF_DAY',
  Late: 'LATE',
};

const STATUS_FROM_API: Record<AttendanceItem['status'], AttendanceStatus> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  HALF_DAY: 'Half Day',
  LATE: 'Late',
};

const monthLabel = (value: string | Date) => {
  const date = new Date(value);
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

const toDateInput = (date = new Date()) => {
  return date.toISOString().slice(0, 10);
};

const isSameDateInput = (value: string, selectedDate: string) => {
  return new Date(value).toISOString().slice(0, 10) === selectedDate;
};

const toTime = (value?: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const toCsvCell = (value: string | number) => {
  const normalized = String(value).replace(/"/g, '""');
  return `"${normalized}"`;
};

const toEmployeeCode = (employeeId: string) => {
  return `EMP-${employeeId.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
};

export function useAttendanceManagement() {
  const queryClient = useQueryClient();
  const { holidays, addHoliday, removeHoliday } = useHolidayCalendar();

  const [query, setQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedDate, setSelectedDate] = useState(toDateInput());
  const [statusFilter, setStatusFilter] = useState<'All' | AttendanceStatus>('All');

  const attendanceQuery = useQuery({
    queryKey: ['attendance-management'],
    queryFn: () => listAttendanceApi(),
  });

  const { data: employeeData = [] } = useEmployees(1, 300);

  const attendanceItems = attendanceQuery.data || [];

  const months = useMemo(() => {
    const list = new Set(attendanceItems.map((item) => monthLabel(item.date)));
    const current = monthLabel(selectedDate);
    list.add(current);
    return Array.from(list);
  }, [attendanceItems, selectedDate]);

  const [selectedMonth, setSelectedMonth] = useState(monthLabel(new Date()));

  const attendanceByEmployeeAndDate = useMemo(() => {
    const map = new Map<string, AttendanceItem>();
    attendanceItems.forEach((item) => {
      map.set(`${item.employeeId}-${new Date(item.date).toISOString().slice(0, 10)}`, item);
    });
    return map;
  }, [attendanceItems]);

  const monthAttendanceByEmployee = useMemo(() => {
    const map = new Map<string, AttendanceItem[]>();
    attendanceItems
      .filter((item) => monthLabel(item.date) === selectedMonth)
      .forEach((item) => {
        const list = map.get(item.employeeId) || [];
        list.push(item);
        map.set(item.employeeId, list);
      });
    return map;
  }, [attendanceItems, selectedMonth]);

  const records = useMemo<AttendanceRecord[]>(() => {
    return employeeData.map((employee) => {
      const key = `${employee.id}-${selectedDate}`;
      const todayAttendance = attendanceByEmployeeAndDate.get(key);
      const monthlyItems = monthAttendanceByEmployee.get(employee.id) || [];

      const monthly: MonthlyBreakdown = {
        present: monthlyItems.filter((item) => item.status === 'PRESENT').length,
        late: monthlyItems.filter((item) => item.status === 'LATE').length,
        halfDay: monthlyItems.filter((item) => item.status === 'HALF_DAY').length,
        absent: 0,
      };

      const workingDaysInMonth = Math.max(1, countWorkingDaysInMonth(selectedMonth, holidays));
      const occupied = monthly.present + monthly.late + monthly.halfDay;
      monthly.absent = Math.max(workingDaysInMonth - occupied, 0);

      return {
        id: employee.id,
        employeeId: employee.id,
        attendanceId: todayAttendance?.id || null,
        employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
        employeeCode: toEmployeeCode(employee.id),
        department: employee.department?.name || 'No Department',
        designation: employee.user?.role || 'Employee',
        checkIn: toTime(todayAttendance?.checkIn),
        status: todayAttendance ? STATUS_FROM_API[todayAttendance.status] : 'Absent',
        month: selectedMonth,
        monthly,
      };
    });
  }, [attendanceByEmployeeAndDate, employeeData, holidays, monthAttendanceByEmployee, selectedDate, selectedMonth]);

  const departments = useMemo(
    () => ['All Departments', ...Array.from(new Set(records.map((record) => record.department)))],
    [records],
  );

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesMonth = record.month === selectedMonth;
      const matchesDepartment =
        selectedDepartment === 'All Departments' || record.department === selectedDepartment;
      const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
      const matchesQuery =
        !normalizedQuery
        || record.employeeName.toLowerCase().includes(normalizedQuery)
        || record.employeeCode.toLowerCase().includes(normalizedQuery)
        || record.designation.toLowerCase().includes(normalizedQuery);

      return matchesMonth && matchesDepartment && matchesStatus && matchesQuery;
    });
  }, [query, records, selectedDepartment, selectedMonth, statusFilter]);

  const dailyStats = useMemo(() => {
    return {
      present: filteredRecords.filter((record) => record.status === 'Present').length,
      absent: filteredRecords.filter((record) => record.status === 'Absent').length,
      halfDay: filteredRecords.filter((record) => record.status === 'Half Day').length,
      late: filteredRecords.filter((record) => record.status === 'Late').length,
      teamSize: filteredRecords.length,
      complianceRate: filteredRecords.length
        ? Math.round(
            ((filteredRecords.filter((record) => record.status !== 'Absent').length) / filteredRecords.length) * 100,
          )
        : 0,
    };
  }, [filteredRecords]);

  const attendanceInsights = useMemo(() => {
    const onsiteCount = filteredRecords.filter((record) => record.status === 'Present').length;
    const lateCount = filteredRecords.filter((record) => record.status === 'Late').length;
    const attentionCount = filteredRecords.filter(
      (record) => record.status === 'Absent' || record.status === 'Half Day' || record.status === 'Late',
    ).length;

    return {
      onsiteCount,
      lateCount,
      attentionCount,
    };
  }, [filteredRecords]);

  const monthlyEmployeeReport = useMemo(() => {
    const workingDaysInMonth = Math.max(1, countWorkingDaysInMonth(selectedMonth, holidays));

    return filteredRecords.map((record) => {
      const totalTrackedDays =
        record.monthly.present + record.monthly.absent + record.monthly.halfDay + record.monthly.late;
      const attendanceRate = Math.round(
        ((record.monthly.present + record.monthly.late + record.monthly.halfDay * 0.5) /
          Math.max(totalTrackedDays, workingDaysInMonth)) * 100,
      );

      return {
        ...record,
        workingDays: Math.max(totalTrackedDays, workingDaysInMonth),
        attendanceRate,
      };
    });
  }, [filteredRecords, holidays, selectedMonth]);

  const departmentSummary = useMemo<DepartmentSummary[]>(() => {
    const grouped = filteredRecords.reduce<Record<string, DepartmentSummary>>((acc, record) => {
      if (!acc[record.department]) {
        acc[record.department] = {
          department: record.department,
          headcount: 0,
          present: 0,
          absent: 0,
          halfDay: 0,
          late: 0,
          attendanceRate: 0,
        };
      }

      const department = acc[record.department];
      department.headcount += 1;
      if (record.status === 'Present') department.present += 1;
      if (record.status === 'Late') department.late += 1;
      if (record.status === 'Half Day') department.halfDay += 1;
      if (record.status === 'Absent') department.absent += 1;

      return acc;
    }, {});

    return Object.values(grouped).map((department) => {
      const effectivePresent = department.present + department.late + department.halfDay * 0.5;
      const attendanceRate = Math.round((effectivePresent / Math.max(department.headcount, 1)) * 100);

      return {
        ...department,
        attendanceRate,
      };
    });
  }, [filteredRecords]);

  const markMutation = useMutation({
    mutationFn: ({ employeeId, attendanceId, status }: {
      employeeId: string;
      attendanceId: string | null;
      status: AttendanceStatus;
    }) => {
      const apiStatus = STATUS_TO_API[status];

      if (attendanceId) {
        return updateAttendanceStatusApi(attendanceId, apiStatus);
      }

      return markAttendanceApi({ employeeId, date: selectedDate, status: apiStatus });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['attendance-management'] });
      await queryClient.invalidateQueries({ queryKey: ['attendance-self'] });
    },
  });

  const markAttendance = (employeeId: string, nextStatus: AttendanceStatus) => {
    const record = records.find((entry) => entry.employeeId === employeeId);
    if (!record) return;

    markMutation.mutate({ employeeId, attendanceId: record.attendanceId, status: nextStatus });
  };

  const exportAttendanceCsv = () => {
    const dailySection = [
      ['Daily Attendance'],
      ['Employee', 'Employee ID', 'Department', 'Designation', 'Check-in', 'Status'],
      ...filteredRecords.map((record) => [
        record.employeeName,
        record.employeeCode,
        record.department,
        record.designation,
        record.checkIn,
        record.status,
      ]),
    ];

    const monthlySection = [
      [],
      ['Monthly Attendance Report'],
      ['Employee', 'Present', 'Late', 'Half Day', 'Absent', 'Attendance Rate'],
      ...monthlyEmployeeReport.map((record) => [
        record.employeeName,
        record.monthly.present,
        record.monthly.late,
        record.monthly.halfDay,
        record.monthly.absent,
        `${record.attendanceRate}%`,
      ]),
    ];

    const departmentSection = [
      [],
      ['Department Summary'],
      ['Department', 'Headcount', 'Present', 'Late', 'Half Day', 'Absent', 'Attendance Rate'],
      ...departmentSummary.map((department) => [
        department.department,
        department.headcount,
        department.present,
        department.late,
        department.halfDay,
        department.absent,
        `${department.attendanceRate}%`,
      ]),
    ];

    const csv = [...dailySection, ...monthlySection, ...departmentSection]
      .map((row) => row.map((cell) => toCsvCell(cell ?? '')).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${selectedMonth.toLowerCase().replace(/\s+/g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAttendancePdf = () => {
    const popup = window.open('', '_blank', 'width=1080,height=820');
    if (!popup) return;

    const dailyRows = filteredRecords
      .map(
        (record) => `
          <tr>
            <td>${record.employeeName}</td>
            <td>${record.employeeCode}</td>
            <td>${record.department}</td>
            <td>${record.checkIn}</td>
            <td>${record.status}</td>
          </tr>`,
      )
      .join('');

    const monthlyRows = monthlyEmployeeReport
      .map(
        (record) => `
          <tr>
            <td>${record.employeeName}</td>
            <td>${record.monthly.present}</td>
            <td>${record.monthly.late}</td>
            <td>${record.monthly.halfDay}</td>
            <td>${record.monthly.absent}</td>
            <td>${record.attendanceRate}%</td>
          </tr>`,
      )
      .join('');

    const departmentRows = departmentSummary
      .map(
        (department) => `
          <tr>
            <td>${department.department}</td>
            <td>${department.headcount}</td>
            <td>${department.present}</td>
            <td>${department.late}</td>
            <td>${department.halfDay}</td>
            <td>${department.absent}</td>
            <td>${department.attendanceRate}%</td>
          </tr>`,
      )
      .join('');

    popup.document.write(`
      <html>
        <head>
          <title>Attendance Report - ${selectedMonth}</title>
          <style>
            body { font-family: Segoe UI, sans-serif; padding: 24px; color: #0f172a; }
            h1, h2 { margin: 0 0 12px; }
            p { margin: 0 0 16px; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px 12px; font-size: 12px; text-align: left; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Attendance Report</h1>
          <p>Month: ${selectedMonth} | Date: ${selectedDate} | Department: ${selectedDepartment}</p>
          <h2>Daily Attendance</h2>
          <table>
            <thead><tr><th>Employee</th><th>Employee ID</th><th>Department</th><th>Check-in</th><th>Status</th></tr></thead>
            <tbody>${dailyRows}</tbody>
          </table>
          <h2>Monthly Employee Report</h2>
          <table>
            <thead><tr><th>Employee</th><th>Present</th><th>Late</th><th>Half Day</th><th>Absent</th><th>Attendance Rate</th></tr></thead>
            <tbody>${monthlyRows}</tbody>
          </table>
          <h2>Department Summary</h2>
          <table>
            <thead><tr><th>Department</th><th>Headcount</th><th>Present</th><th>Late</th><th>Half Day</th><th>Absent</th><th>Attendance Rate</th></tr></thead>
            <tbody>${departmentRows}</tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return {
    query,
    setQuery,
    selectedDepartment,
    setSelectedDepartment,
    selectedMonth,
    setSelectedMonth,
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    holidays,
    addHoliday,
    removeHoliday,
    departments,
    months,
    filteredRecords,
    dailyStats,
    attendanceInsights,
    monthlyEmployeeReport,
    departmentSummary,
    markAttendance,
    exportAttendanceCsv,
    exportAttendancePdf,
    isLoading: attendanceQuery.isLoading,
    isError: attendanceQuery.isError,
    isMarking: markMutation.isPending,
  };
}
