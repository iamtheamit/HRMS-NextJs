'use client';

import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { SearchBar } from '@/shared/ui/SearchBar';
import { CalendarCheck2, Clock, Users, Filter } from 'lucide-react';

const stats = [
  { label: 'Present Today', value: '642', icon: CalendarCheck2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { label: 'Late Arrivals', value: '12', icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
  { label: 'Absent', value: '24', icon: Users, bg: 'bg-red-50', color: 'text-red-600' }
];

const records = [
  { name: 'Priya Sharma', time: '09:02 AM', status: 'present' },
  { name: 'Rahul Mehta', time: '09:35 AM', status: 'late' },
  { name: 'Sneha Patel', time: '—', status: 'absent' },
  { name: 'Vikram Singh', time: '08:55 AM', status: 'present' },
  { name: 'Ananya Joshi', time: '09:15 AM', status: 'present' }
];

const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  present: { variant: 'success', label: 'Present' },
  late: { variant: 'warning', label: 'Late' },
  absent: { variant: 'danger', label: 'Absent' }
};

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                  <p className="text-sm text-slate-500">{s.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      {/* Table */}
      <Card noPadding>
        <div className="flex items-center justify-between px-5 pt-5 sm:px-6 sm:pt-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Today&apos;s Attendance</h3>
            <p className="text-xs text-slate-500">March 15, 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <SearchBar placeholder="Search..." className="hidden w-48 sm:block" />
            <Button variant="secondary" size="sm">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100">
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Employee</th>
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Check-in</th>
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => {
                const st = statusMap[r.status];
                return (
                  <tr key={r.name} className="transition hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-900 sm:px-6">{r.name}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600 sm:px-6">{r.time}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 sm:px-6">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
