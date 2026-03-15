"use client";

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { CalendarPlus, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  buildMonthCalendar,
  countWorkingDaysInMonth,
  parseMonthLabel,
  type Holiday,
  type HolidayType
} from '../model/useHolidayCalendar';

type Props = {
  monthLabel: string;
  holidays: Holiday[];
  onAddHoliday: (payload: { date: string; name: string; type: HolidayType; region?: string }) => void;
  onRemoveHoliday: (holidayId: string) => void;
};

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HolidayCalendarPanel({ monthLabel, holidays, onAddHoliday, onRemoveHoliday }: Props) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<HolidayType>('National');
  const [region, setRegion] = useState('');

  const calendarCells = useMemo(() => buildMonthCalendar(monthLabel, holidays), [holidays, monthLabel]);
  const { monthIndex, year } = parseMonthLabel(monthLabel);

  const monthHolidays = useMemo(
    () => holidays.filter((holiday) => {
      const d = new Date(holiday.date);
      return d.getMonth() === monthIndex && d.getFullYear() === year;
    }),
    [holidays, monthIndex, year]
  );

  const workingDays = useMemo(
    () => countWorkingDaysInMonth(monthLabel, holidays),
    [holidays, monthLabel]
  );

  const saveHoliday = () => {
    if (!date || !name.trim()) return;
    onAddHoliday({ date, name: name.trim(), type, region: type === 'Regional' ? region : undefined });
    setName('');
    setDate('');
    setType('National');
    setRegion('');
  };

  return (
    <div className="grid gap-6 xl:grid-cols-5">
      <div className="xl:col-span-3">
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-slate-500">
          {dayLabels.map((label) => (
            <div key={label} className="py-1 font-semibold uppercase tracking-wider">{label}</div>
          ))}
          {calendarCells.map((cell) => (
            <div
              key={cell.date}
              className={clsx(
                'min-h-16 rounded-xl border p-2 text-left transition',
                cell.inCurrentMonth ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 text-slate-400',
                cell.isWeekend && cell.inCurrentMonth && 'bg-slate-50',
                cell.holiday && 'border-brand-200 bg-brand-50/50'
              )}
            >
              <p className="text-xs font-semibold text-slate-600">{cell.day}</p>
              {cell.holiday && (
                <p className="mt-1 line-clamp-2 text-[10px] font-medium text-brand-700">{cell.holiday.name}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 xl:col-span-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">Add Holiday</h4>
            <CalendarPlus className="h-4 w-4 text-brand-600" />
          </div>
          <div className="space-y-3">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Holiday name"
              className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <select
              value={type}
              onChange={(event) => setType(event.target.value as HolidayType)}
              className="block h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              <option value="National">National</option>
              <option value="Regional">Regional</option>
              <option value="Company">Company</option>
            </select>
            {type === 'Regional' && (
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                placeholder="Region (optional)"
                className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            )}
            <Button className="w-full" onClick={saveHoliday} disabled={!name.trim() || !date}>
              Add Holiday
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">{monthLabel} Holidays</h4>
            <Badge variant="soft">Working Days: {workingDays}</Badge>
          </div>
          <div className="space-y-2">
            {monthHolidays.length === 0 && (
              <p className="text-xs text-slate-500">No holidays configured for this month.</p>
            )}
            {monthHolidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-slate-800">{holiday.name}</p>
                  <p className="text-xs text-slate-500">{holiday.date} • {holiday.type}{holiday.region ? ` • ${holiday.region}` : ''}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveHoliday(holiday.id)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${holiday.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HolidayCalendarPanel;