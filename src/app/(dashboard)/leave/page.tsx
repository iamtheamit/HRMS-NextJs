'use client';

import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { CalendarClock, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react';

const stats = [
  { label: 'Pending', value: '8', icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
  { label: 'Approved', value: '45', icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  { label: 'Rejected', value: '3', icon: XCircle, bg: 'bg-red-50', color: 'text-red-600' }
];

const leaveRequests = [
  { name: 'Priya Sharma', type: 'Vacation', from: 'Mar 16', to: 'Mar 20', days: 5, status: 'pending' },
  { name: 'Rahul Mehta', type: 'Sick Leave', from: 'Mar 14', to: 'Mar 15', days: 2, status: 'approved' },
  { name: 'Vikram Singh', type: 'Personal', from: 'Mar 18', to: 'Mar 20', days: 3, status: 'rejected' },
  { name: 'Ananya Joshi', type: 'Vacation', from: 'Mar 22', to: 'Mar 25', days: 4, status: 'pending' }
];

const statusMap: Record<string, { variant: 'success' | 'warning' | 'danger'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'danger', label: 'Rejected' }
};

export default function LeavePage() {
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
            <h3 className="text-sm font-semibold text-slate-900">Leave Requests</h3>
            <p className="text-xs text-slate-500">Manage team leave applications</p>
          </div>
          <Button size="sm">
            <Plus className="h-3.5 w-3.5" />
            New Request
          </Button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-y border-slate-100">
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Employee</th>
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Type</th>
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Period</th>
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Days</th>
                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveRequests.map((r) => {
                const st = statusMap[r.status];
                return (
                  <tr key={`${r.name}-${r.from}`} className="transition hover:bg-slate-50/50">
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-900 sm:px-6">{r.name}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600 sm:px-6">{r.type}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600 sm:px-6">{r.from} – {r.to}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-600 sm:px-6">{r.days}</td>
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
