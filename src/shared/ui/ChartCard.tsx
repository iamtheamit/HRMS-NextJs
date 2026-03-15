'use client';

import type { ReactNode } from 'react';
import { Card } from '@/shared/ui/Card';

type ChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

export const ChartCard = ({ title, description, children, className, action }: ChartCardProps) => {
  return (
    <Card className={className}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-slate-500">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="h-52 w-full">{children}</div>
    </Card>
  );
};

export default ChartCard;
