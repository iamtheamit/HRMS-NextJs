"use client";

import { useMemo, useState } from 'react';
import { countWorkingDaysInMonth, useHolidayCalendar } from '@/features/calendar/model/useHolidayCalendar';

export type AttendanceStatus = 'Present' | 'Absent' | 'Half Day' | 'WFH';

type MonthlyBreakdown = {
  present: number;
  absent: number;
  halfDay: number;
  wfh: number;
};

export type AttendanceRecord = {
  id: string;
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
  wfh: number;
  attendanceRate: number;
};

const STATUS_KEYS: Record<AttendanceStatus, keyof MonthlyBreakdown> = {
  Present: 'present',
  Absent: 'absent',
  'Half Day': 'halfDay',
  WFH: 'wfh'
};

const WORKING_DAYS = 24;

const initialRecords: AttendanceRecord[] = [
  {
    id: 'emp-1001',
    employeeName: 'Priya Sharma',
    employeeCode: 'EMP-1001',
    department: 'Engineering',
    designation: 'Frontend Engineer',
    checkIn: '09:02 AM',
    status: 'Present',
    month: 'March 2026',
    monthly: { present: 19, absent: 1, halfDay: 1, wfh: 3 }
  },
  {
    id: 'emp-1002',
    employeeName: 'Rahul Mehta',
    employeeCode: 'EMP-1002',
    department: 'Engineering',
    designation: 'Backend Engineer',
    checkIn: '09:18 AM',
    status: 'WFH',
    month: 'March 2026',
    monthly: { present: 16, absent: 0, halfDay: 2, wfh: 6 }
  },
  {
    id: 'emp-1003',
    employeeName: 'Ananya Joshi',
    employeeCode: 'EMP-1003',
    department: 'Human Resources',
    designation: 'HR Business Partner',
    checkIn: '08:56 AM',
    status: 'Present',
    month: 'March 2026',
    monthly: { present: 20, absent: 2, halfDay: 1, wfh: 1 }
  },
  {
    id: 'emp-1004',
    employeeName: 'Sneha Patel',
    employeeCode: 'EMP-1004',
    department: 'Finance',
    designation: 'Accounts Executive',
    checkIn: '—',
    status: 'Absent',
    month: 'March 2026',
    monthly: { present: 18, absent: 3, halfDay: 1, wfh: 2 }
  },
  {
    id: 'emp-1005',
    employeeName: 'Vikram Singh',
    employeeCode: 'EMP-1005',
    department: 'Operations',
    designation: 'Operations Manager',
    checkIn: '09:10 AM',
    status: 'Half Day',
    month: 'March 2026',
    monthly: { present: 17, absent: 1, halfDay: 3, wfh: 3 }
  },
  {
    id: 'emp-1006',
    employeeName: 'Rohit Verma',
    employeeCode: 'EMP-1006',
    department: 'Product',
    designation: 'Product Manager',
    checkIn: '09:05 AM',
    status: 'Present',
    month: 'March 2026',
    monthly: { present: 18, absent: 1, halfDay: 1, wfh: 4 }
  },
  {
    id: 'emp-1007',
    employeeName: 'Neha Bansal',
    employeeCode: 'EMP-1007',
    department: 'Finance',
    designation: 'Finance Lead',
    checkIn: '08:49 AM',
    status: 'Present',
    month: 'March 2026',
    monthly: { present: 21, absent: 0, halfDay: 1, wfh: 2 }
  },
  {
    id: 'emp-1008',
    employeeName: 'Aman Kapoor',
    employeeCode: 'EMP-1008',
    department: 'Operations',
    designation: 'Field Coordinator',
    checkIn: '09:24 AM',
    status: 'Present',
    month: 'March 2026',
    monthly: { present: 19, absent: 2, halfDay: 1, wfh: 2 }
  }
];

function getNowTimeLabel() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toCsvCell(value: string | number) {
  const normalized = String(value).replace(/"/g, '""');
  return `"${normalized}"`;
}

export function useAttendanceManagement() {
  const { holidays, addHoliday, removeHoliday } = useHolidayCalendar();
  const [records, setRecords] = useState(initialRecords);
  const [query, setQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [selectedMonth, setSelectedMonth] = useState('March 2026');
  const [selectedDate, setSelectedDate] = useState('2026-03-15');
  const [statusFilter, setStatusFilter] = useState<'All' | AttendanceStatus>('All');

  const departments = useMemo(
    () => ['All Departments', ...Array.from(new Set(records.map((record) => record.department)))],
    [records]
  );

  const months = useMemo(
    () => Array.from(new Set(records.map((record) => record.month))),
    [records]
  );

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return records.filter((record) => {
      const matchesMonth = record.month === selectedMonth;
      const matchesDepartment =
        selectedDepartment === 'All Departments' || record.department === selectedDepartment;
      const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        record.employeeName.toLowerCase().includes(normalizedQuery) ||
        record.employeeCode.toLowerCase().includes(normalizedQuery) ||
        record.designation.toLowerCase().includes(normalizedQuery);

      return matchesMonth && matchesDepartment && matchesStatus && matchesQuery;
    });
  }, [query, records, selectedDepartment, selectedMonth, statusFilter]);

  const dailyStats = useMemo(() => {
    return {
      present: filteredRecords.filter((record) => record.status === 'Present').length,
      absent: filteredRecords.filter((record) => record.status === 'Absent').length,
      halfDay: filteredRecords.filter((record) => record.status === 'Half Day').length,
      wfh: filteredRecords.filter((record) => record.status === 'WFH').length,
      teamSize: filteredRecords.length,
      complianceRate: filteredRecords.length
        ? Math.round(
            ((filteredRecords.filter((record) => record.status !== 'Absent').length) / filteredRecords.length) * 100
          )
        : 0
    };
  }, [filteredRecords]);

  const attendanceInsights = useMemo(() => {
    const remoteCount = filteredRecords.filter((record) => record.status === 'WFH').length;
    const onsiteCount = filteredRecords.filter((record) => record.status === 'Present').length;
    const attentionCount = filteredRecords.filter((record) => record.status === 'Absent' || record.status === 'Half Day').length;

    return {
      remoteCount,
      onsiteCount,
      attentionCount
    };
  }, [filteredRecords]);

  const monthlyEmployeeReport = useMemo(() => {
    const workingDaysInMonth = Math.max(1, countWorkingDaysInMonth(selectedMonth, holidays));

    return filteredRecords.map((record) => {
      const totalTrackedDays =
        record.monthly.present +
        record.monthly.absent +
        record.monthly.halfDay +
        record.monthly.wfh;
      const attendanceRate = Math.round(
        ((record.monthly.present + record.monthly.wfh + record.monthly.halfDay * 0.5) /
          Math.max(totalTrackedDays, workingDaysInMonth)) *
          100
      );

      return {
        ...record,
        workingDays: Math.max(totalTrackedDays, workingDaysInMonth),
        attendanceRate
      };
    });
  }, [filteredRecords, holidays, selectedMonth]);

  const departmentSummary = useMemo<DepartmentSummary[]>(() => {
    const workingDaysInMonth = Math.max(1, countWorkingDaysInMonth(selectedMonth, holidays));
    const monthRecords = records.filter((record) => record.month === selectedMonth);
    const grouped = monthRecords.reduce<Record<string, DepartmentSummary>>((acc, record) => {
      if (!acc[record.department]) {
        acc[record.department] = {
          department: record.department,
          headcount: 0,
          present: 0,
          absent: 0,
          halfDay: 0,
          wfh: 0,
          attendanceRate: 0
        };
      }

      const department = acc[record.department];
      department.headcount += 1;
      department.present += record.monthly.present;
      department.absent += record.monthly.absent;
      department.halfDay += record.monthly.halfDay;
      department.wfh += record.monthly.wfh;

      return acc;
    }, {});

    return Object.values(grouped).map((department) => {
      const effectivePresent = department.present + department.wfh + department.halfDay * 0.5;
      const attendanceRate = Math.round(
        (effectivePresent / Math.max(department.headcount * workingDaysInMonth, 1)) * 100
      );

      return {
        ...department,
        attendanceRate
      };
    });
  }, [holidays, records, selectedMonth]);

  const markAttendance = (employeeId: string, nextStatus: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((record) => {
        if (record.id !== employeeId || record.month !== selectedMonth) {
          return record;
        }

        if (record.status === nextStatus) {
          return record;
        }

        const previousKey = STATUS_KEYS[record.status];
        const nextKey = STATUS_KEYS[nextStatus];

        return {
          ...record,
          status: nextStatus,
          checkIn: nextStatus === 'Absent' ? '—' : record.checkIn === '—' ? getNowTimeLabel() : record.checkIn,
          monthly: {
            ...record.monthly,
            [previousKey]: Math.max(0, record.monthly[previousKey] - 1),
            [nextKey]: record.monthly[nextKey] + 1
          }
        };
      })
    );
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
        record.status
      ])
    ];

    const monthlySection = [
      [],
      ['Monthly Attendance Report'],
      ['Employee', 'Present', 'WFH', 'Half Day', 'Absent', 'Attendance Rate'],
      ...monthlyEmployeeReport.map((record) => [
        record.employeeName,
        record.monthly.present,
        record.monthly.wfh,
        record.monthly.halfDay,
        record.monthly.absent,
        `${record.attendanceRate}%`
      ])
    ];

    const departmentSection = [
      [],
      ['Department Summary'],
      ['Department', 'Headcount', 'Present', 'WFH', 'Half Day', 'Absent', 'Attendance Rate'],
      ...departmentSummary.map((department) => [
        department.department,
        department.headcount,
        department.present,
        department.wfh,
        department.halfDay,
        department.absent,
        `${department.attendanceRate}%`
      ])
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
          </tr>`
      )
      .join('');

    const monthlyRows = monthlyEmployeeReport
      .map(
        (record) => `
          <tr>
            <td>${record.employeeName}</td>
            <td>${record.monthly.present}</td>
            <td>${record.monthly.wfh}</td>
            <td>${record.monthly.halfDay}</td>
            <td>${record.monthly.absent}</td>
            <td>${record.attendanceRate}%</td>
          </tr>`
      )
      .join('');

    const departmentRows = departmentSummary
      .map(
        (department) => `
          <tr>
            <td>${department.department}</td>
            <td>${department.headcount}</td>
            <td>${department.present}</td>
            <td>${department.wfh}</td>
            <td>${department.halfDay}</td>
            <td>${department.absent}</td>
            <td>${department.attendanceRate}%</td>
          </tr>`
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
            <thead><tr><th>Employee</th><th>Present</th><th>WFH</th><th>Half Day</th><th>Absent</th><th>Attendance Rate</th></tr></thead>
            <tbody>${monthlyRows}</tbody>
          </table>
          <h2>Department Summary</h2>
          <table>
            <thead><tr><th>Department</th><th>Headcount</th><th>Present</th><th>WFH</th><th>Half Day</th><th>Absent</th><th>Attendance Rate</th></tr></thead>
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
    exportAttendancePdf
  };
}
