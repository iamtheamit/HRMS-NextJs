'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from '@/shared/ui/ChartCard';
import type { ChartDatum } from '@/features/dashboard/model/chartUtils';
import { hasNonZeroValues } from '@/features/dashboard/model/chartUtils';

const pieColors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#06b6d4'];

type PieProps = {
  title: string;
  description: string;
  data: ChartDatum[];
};

export function DashboardPieChartCard({ title, description, data }: PieProps) {
  const safeData = data.filter((item) => item.value >= 0);

  return (
    <ChartCard title={title} description={description}>
      {hasNonZeroValues(safeData) ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={safeData}
              dataKey="value"
              nameKey="label"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              strokeWidth={0}
            >
              {safeData.map((item, index) => (
                <Cell key={item.label} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                fontSize: '0.75rem',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">No chart data available</div>
      )}
    </ChartCard>
  );
}

type BarProps = {
  title: string;
  description: string;
  data: ChartDatum[];
  barColor?: string;
};

export function DashboardBarChartCard({ title, description, data, barColor = '#2563eb' }: BarProps) {
  return (
    <ChartCard title={title} description={description}>
      {hasNonZeroValues(data) ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="24%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                fontSize: '0.75rem',
              }}
            />
            <Bar dataKey="value" fill={barColor} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">No chart data available</div>
      )}
    </ChartCard>
  );
}
