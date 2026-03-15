import React from 'react';
import clsx from 'clsx';
import { Card } from './Card';

type Tone = 'brand' | 'emerald' | 'amber' | 'indigo' | 'slate' | 'cyan' | 'rose';

type KpiCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: Tone;
};

const toneClasses: Record<Tone, { chip: string; icon: string; value: string }> = {
  brand: {
    chip: 'bg-brand-50',
    icon: 'text-brand-600',
    value: 'text-brand-700',
  },
  emerald: {
    chip: 'bg-emerald-50',
    icon: 'text-emerald-600',
    value: 'text-emerald-700',
  },
  amber: {
    chip: 'bg-amber-50',
    icon: 'text-amber-600',
    value: 'text-amber-700',
  },
  indigo: {
    chip: 'bg-indigo-50',
    icon: 'text-indigo-600',
    value: 'text-indigo-700',
  },
  slate: {
    chip: 'bg-slate-100',
    icon: 'text-slate-700',
    value: 'text-slate-800',
  },
  cyan: {
    chip: 'bg-cyan-50',
    icon: 'text-cyan-700',
    value: 'text-cyan-800',
  },
  rose: {
    chip: 'bg-rose-50',
    icon: 'text-rose-600',
    value: 'text-rose-700',
  },
};

export function KpiCard({ label, value, helper, icon: Icon, tone = 'brand' }: KpiCardProps) {
  const toneClass = toneClasses[tone];

  return (
    <Card className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className={clsx('flex h-11 w-11 items-center justify-center rounded-2xl', toneClass.chip)}>
          <Icon className={clsx('h-5 w-5', toneClass.icon)} />
        </div>
        <div className="min-w-0 text-right">
          <p className={clsx('text-2xl font-semibold leading-none', toneClass.value)}>{value}</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
      </div>
    </Card>
  );
}

export default KpiCard;
