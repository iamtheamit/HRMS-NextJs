import React from 'react';
import { Card, Badge } from '@/shared/ui';

type DashboardCardItem = {
  title: string;
  value: string;
  trend?: string;
};

export function DashboardCards({ items }: { items: DashboardCardItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title} className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">{item.title}</p>
          <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
          {item.trend ? <Badge variant="soft">{item.trend}</Badge> : null}
        </Card>
      ))}
    </div>
  );
}
