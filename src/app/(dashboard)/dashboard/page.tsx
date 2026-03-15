// dashboard/page.tsx
// Renders the main HRMS analytics dashboard with KPIs, charts, and requests overview.

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
  YAxis
} from 'recharts';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { ChartCard } from '@/shared/components/ChartCard';
import { SearchBar } from '@/shared/components/SearchBar';
import { Button } from '@/shared/components/Button';
import { Filter, FileDown, Plus } from 'lucide-react';

const kpiData = [
  {
    label: 'Total employees',
    value: 678,
    trend: '+30% last month',
    accent: 'border-t-blue-500'
  },
  {
    label: 'Number of leaves',
    value: 23,
    trend: '+10% last month',
    accent: 'border-t-red-400'
  },
  {
    label: 'New employees',
    value: 31,
    trend: '+13% last month',
    accent: 'border-t-green-400'
  }
];

const distributionData = [
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

const pieColors = ['#2563eb', '#22c55e', '#f97316', '#0ea5e9', '#6366f1'];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Toolbar: title left, filter/export/search aligned right */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Overview</p>
          <p className="text-xs text-slate-400">
            High-level snapshot of your people operations.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="w-full sm:w-56">
            <SearchBar placeholder="Search employees or actions" />
          </div>
          <Button variant="secondary" className="inline-flex items-center gap-2 text-xs">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="secondary" className="inline-flex items-center gap-2 text-xs">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          <Button className="inline-flex items-center gap-2 text-xs">
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>
      </section>

      {/* Stats cards: grid-cols-3, colored top borders */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {kpiData.map((kpi) => (
          <Card
            key={kpi.label}
            className={`relative overflow-hidden border-t-4 ${kpi.accent}`}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {kpi.value}
            </p>
            <p className="mt-1 text-xs text-emerald-600">{kpi.trend}</p>
            <div className="pointer-events-none absolute inset-y-3 right-3 opacity-40">
              <ResponsiveContainer width={80} height={32}>
                <LineChart data={activityData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        ))}
      </section>

      {/* Analytics charts: grid-cols-2 */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Department distribution"
          description="Headcount by primary department"
        >
          <ResponsiveContainer width="100%" height={192}>
            <PieChart>
              <Pie
                data={distributionData}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
              >
                {distributionData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Monthly activity"
          description="Check-ins, performance reviews, and updates"
        >
          <ResponsiveContainer width="100%" height={192}>
            <BarChart data={activityData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Training cost"
          description="Monthly spend per employee (k$)"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={192}>
            <LineChart data={trainingData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Lower section: grid-cols-3 */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Open requests
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Items that need your review today
              </p>
            </div>
            <Badge variant="soft">View all</Badge>
          </div>
          <div className="space-y-2 text-sm">
            {[
              'Profile Update',
              'Business Trip',
              'Vacation',
              'Sick Leave',
              'Other'
            ].map((label) => (
              <div
                key={label}
                className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 transition hover:border-slate-200 hover:bg-white sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-slate-900">{label}</p>
                  <p className="text-xs text-slate-400">
                    3 pending approvals · SLA 2 days
                  </p>
                </div>
                <Badge variant="success">On track</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Inbox snapshot
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Quick view of people-related updates
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-slate-800">3 performance reviews due</span>
              <Badge variant="danger">Due today</Badge>
            </li>
            <li className="flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-slate-800">2 onboarding plans in draft</span>
              <Badge>Draft</Badge>
            </li>
            <li className="flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-slate-800">5 learning paths recommended</span>
              <Badge variant="success">New</Badge>
            </li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
