"use client";

import { useEffect, useMemo, useState } from 'react';

export type HolidayType = 'National' | 'Regional' | 'Company';

export type Holiday = {
  id: string;
  date: string;
  name: string;
  type: HolidayType;
  region?: string;
};

export type CalendarCell = {
  date: string;
  day: number;
  inCurrentMonth: boolean;
  isWeekend: boolean;
  holiday: Holiday | null;
};

type AddHolidayInput = {
  date: string;
  name: string;
  type: HolidayType;
  region?: string;
};

const STORAGE_KEY = 'hrms-holidays-v1';

const defaultHolidays: Holiday[] = [
  { id: 'h-001', date: '2026-01-26', name: 'Republic Day', type: 'National' },
  { id: 'h-002', date: '2026-03-14', name: 'Holi', type: 'National' },
  { id: 'h-003', date: '2026-04-14', name: 'Ambedkar Jayanti', type: 'National' },
  { id: 'h-004', date: '2026-05-01', name: 'Maharashtra Day', type: 'Regional', region: 'Maharashtra' },
  { id: 'h-005', date: '2026-08-15', name: 'Independence Day', type: 'National' },
  { id: 'h-006', date: '2026-10-21', name: 'Company Annual Offsite', type: 'Company' }
];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

function asDateOnly(value: string) {
  return value.split('T')[0];
}

function toIsoDate(date: Date) {
  return asDateOnly(date.toISOString());
}

export function parseMonthLabel(monthLabel: string) {
  const [monthText, yearText] = monthLabel.split(' ');
  const monthIndex = monthNames.findIndex((name) => name.toLowerCase() === monthText?.toLowerCase());
  const year = Number(yearText);

  if (monthIndex < 0 || Number.isNaN(year)) {
    const now = new Date();
    return { monthIndex: now.getMonth(), year: now.getFullYear() };
  }

  return { monthIndex, year };
}

export function isWeekendDate(dateText: string) {
  const day = new Date(dateText).getDay();
  return day === 0 || day === 6;
}

export function isHolidayDate(dateText: string, holidays: Holiday[]) {
  return holidays.some((holiday) => holiday.date === dateText);
}

export function countWorkingDaysInMonth(monthLabel: string, holidays: Holiday[]) {
  const { monthIndex, year } = parseMonthLabel(monthLabel);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  let count = 0;

  for (let day = 1; day <= daysInMonth; day += 1) {
    const isoDate = toIsoDate(new Date(Date.UTC(year, monthIndex, day)));
    if (isWeekendDate(isoDate) || isHolidayDate(isoDate, holidays)) continue;
    count += 1;
  }

  return count;
}

export function countChargeableLeaveDays(from: string, to: string, holidays: Holiday[]) {
  if (!from || !to || to < from) return 0;

  let count = 0;
  const cursor = new Date(from);
  const end = new Date(to);

  while (cursor <= end) {
    const isoDate = toIsoDate(cursor);
    if (!isWeekendDate(isoDate) && !isHolidayDate(isoDate, holidays)) {
      count += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

export function buildMonthCalendar(monthLabel: string, holidays: Holiday[]): CalendarCell[] {
  const { monthIndex, year } = parseMonthLabel(monthLabel);
  const firstDay = new Date(year, monthIndex, 1);
  const startOffset = firstDay.getDay();
  const gridStart = new Date(year, monthIndex, 1 - startOffset);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    const isoDate = toIsoDate(date);
    const holiday = holidays.find((entry) => entry.date === isoDate) ?? null;

    cells.push({
      date: isoDate,
      day: date.getDate(),
      inCurrentMonth: date.getMonth() === monthIndex,
      isWeekend: isWeekendDate(isoDate),
      holiday
    });
  }

  return cells;
}

function safeReadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultHolidays;
    const parsed = JSON.parse(raw) as Holiday[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultHolidays;
    return parsed;
  } catch {
    return defaultHolidays;
  }
}

export function useHolidayCalendar() {
  const [holidays, setHolidays] = useState<Holiday[]>(defaultHolidays);

  useEffect(() => {
    setHolidays(safeReadFromStorage());

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setHolidays(safeReadFromStorage());
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays));
  }, [holidays]);

  const addHoliday = ({ date, name, type, region }: AddHolidayInput) => {
    if (!date || !name.trim()) return;
    const normalizedName = name.trim();
    const duplicate = holidays.some(
      (holiday) => holiday.date === date && holiday.name.toLowerCase() === normalizedName.toLowerCase()
    );
    if (duplicate) return;

    setHolidays((prev) => [
      ...prev,
      {
        id: `holiday-${Date.now()}`,
        date,
        name: normalizedName,
        type,
        region: region?.trim() || undefined
      }
    ]);
  };

  const removeHoliday = (holidayId: string) => {
    setHolidays((prev) => prev.filter((holiday) => holiday.id !== holidayId));
  };

  const sortedHolidays = useMemo(
    () => [...holidays].sort((a, b) => a.date.localeCompare(b.date)),
    [holidays]
  );

  return {
    holidays: sortedHolidays,
    addHoliday,
    removeHoliday
  };
}
