'use client';

import {
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { Card, Badge, ChartCard, Button } from '@/shared/ui';
import {
  Users,
  UserPlus,
  UserMinus,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';

/* ── Static data ── */

const kpis = [
  {
    label: 'Total Employees',
    value: '678',
    change: '+12%',
    up: true,
    icon: Users,
    color: 'text-brand-600',
    bg: 'bg-brand-50'
  },
  {
    label: 'New Hires',
    value: '31',
    change: '+13%',
    up: true,
    icon: UserPlus,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50'
  },
  {
    label: 'On Leave',
    value: '23',
    change: '+10%',
    up: false,
    icon: UserMinus,
    color: 'text-amber-600',
    bg: 'bg-amber-50'
  },
  {
    label: 'Avg. Hours',
    value: '7.8h',
    change: '+2%',
    up: true,
    icon: Clock,
    color: 'text-violet-600',
    bg: 'bg-violet-50'
  }
];

const departmentData = [
  { name: 'Engineering', value: 96 },
  { name: 'Sales', value: 52 },
  { name: 'Marketing', value: 38 },
  { name: 'Operations', value: 28 },
  { name: 'HR', value: 12 }
];

const activityData = [
  { month: 'Jan', value: 32 },
  { month: 'Feb', value: 45 },
  { month: 'Mar', value: 38 },
  { month: 'Apr', value: 52 },
  { month: 'May', value: 61 },
  { month: 'Jun', value: 48 }
];

const trainingData = [
  { month: 'Jan', cost: 12 },
  { month: 'Feb', cost: 18 },
  { month: 'Mar', cost: 15 },
  { month: 'Apr', cost: 21 },
  { month: 'May', cost: 24 },
  { month: 'Jun', cost: 20 }
];

const recentRequests = [
  { name: 'Priya Sharma', type: 'Vacation', days: 5, status: 'pending' as const },
  { name: 'Rahul Mehta', type: 'Sick Leave', days: 2, status: 'approved' as const },
  { name: 'Sneha Patel', type: 'Work From Home', days: 1, status: 'pending' as const },
  { name: 'Vikram Singh', type: 'Personal', days: 3, status: 'rejected' as const },
  { name: 'Ananya Joshi', type: 'Vacation', days: 4, status: 'approved' as const }
];

const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

const statusBadge: Record<string, { variant: 'success' | 'danger' | 'warning'; label: string }> = {
  pending: { variant: 'warning', label: 'Pending' },
  approved: { variant: 'success', label: 'Approved' },
  rejected: { variant: 'danger', label: 'Rejected' }
};

/* ── Page ── */

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                  <Icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {kpi.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {kpi.change}
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p className="mt-0.5 text-sm text-slate-500">{kpi.label}</p>
            </Card>
          );
        })}
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Department Distribution" description="Headcount by department">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={departmentData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={0}
              >
                {departmentData.map((entry, i) => (
                  <Cell key={entry.name} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  fontSize: '0.75rem'
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                iconSize={8}
                formatter={(v: string) => <span className="text-xs text-slate-600">{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Activity" description="Check-ins and performance reviews">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  fontSize: '0.75rem'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Training trend (full width) */}
      <section>
        <ChartCard title="Training Cost Trend" description="Monthly spend per employee (k$)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trainingData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  fontSize: '0.75rem'
                }}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Recent requests + Quick stats */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2" noPadding>
          <div className="flex items-center justify-between px-5 pt-5 sm:px-6 sm:pt-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Leave Requests</h3>
              <p className="text-xs text-slate-500">Pending approvals from your team</p>
            </div>
            <Button variant="ghost" size="sm">View all</Button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100">
                  <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Employee</th>
                  <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Type</th>
                  <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Days</th>
                  <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests.map((req) => {
                  const st = statusBadge[req.status];
                  return (
                    <tr key={req.name} className="transition hover:bg-slate-50/50">
                      <td className="whitespace-nowrap px-5 py-3.5 font-medium text-slate-900 sm:px-6">{req.name}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-600 sm:px-6">{req.type}</td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-slate-600 sm:px-6">{req.days}</td>
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

        <Card>
          <h3 className="text-sm font-semibold text-slate-900">Quick Overview</h3>
          <p className="text-xs text-slate-500">Today&apos;s highlights</p>

          <ul className="mt-4 space-y-3">
            {[
              { label: 'Performance reviews due', count: 3, variant: 'danger' as const },
              { label: 'Onboarding in progress', count: 2, variant: 'soft' as const },
              { label: 'Birthdays this week', count: 5, variant: 'success' as const },
              { label: 'Upcoming anniversaries', count: 4, variant: 'warning' as const }
            ].map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 transition hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">{item.label}</span>
                <Badge variant={item.variant}>{item.count}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
