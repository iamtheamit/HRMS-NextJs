// ChartCard.tsx
// Wraps Recharts visualizations inside a styled card with a header.

'use client';

import type { ReactNode } from 'react';
import { Card } from '@/shared/components/Card';

type ChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export const ChartCard = ({ title, description, children }: ChartCardProps) => {
  return (
    <Card className="h-full">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {title}
          </p>
          {description && (
            <p className="mt-0.5 text-xs text-slate-400">{description}</p>
          )}
        </div>
      </div>
      <div className="h-48">{children}</div>
    </Card>
  );
};

