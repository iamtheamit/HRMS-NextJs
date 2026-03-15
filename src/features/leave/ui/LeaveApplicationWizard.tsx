"use client";

import clsx from 'clsx';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  Stethoscope,
  SunMedium,
  User,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import type { LeaveRequestForm, LeaveType } from '../model/useLeaveManagement';
import { countChargeableLeaveDays, type Holiday } from '@/features/calendar/model/useHolidayCalendar';

type EmployeeOption = {
  id: string;
  name: string;
  department: string;
};

type Props = {
  open: boolean;
  employees: EmployeeOption[];
  holidays: Holiday[];
  onClose: () => void;
  onSubmit: (form: LeaveRequestForm) => void;
};

const leaveTypes: { type: LeaveType; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'CL', label: 'Casual Leave', sub: 'Short personal leave', icon: SunMedium },
  { type: 'SL', label: 'Sick Leave', sub: 'Medical recovery leave', icon: Stethoscope },
  { type: 'EL', label: 'Earned Leave', sub: 'Planned time off', icon: CalendarDays }
];

const STEPS = [
  { id: 1, label: 'Employee', sub: 'Choose employee', icon: User },
  { id: 2, label: 'Leave Details', sub: 'Type and dates', icon: CalendarDays },
  { id: 3, label: 'Review', sub: 'Submit request', icon: CheckCircle2 }
] as const;

const STEP_COLORS: Record<number, string> = {
  1: 'bg-brand-600',
  2: 'bg-emerald-600',
  3: 'bg-indigo-600'
};

const defaultForm: LeaveRequestForm = {
  employeeId: '',
  type: 'CL',
  from: '',
  to: '',
  reason: ''
};

export function LeaveApplicationWizard({ open, employees, holidays, onClose, onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<LeaveRequestForm>(defaultForm);
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setForm(defaultForm);
      setTouched(false);
      setSubmitted(false);
    }
  }, [open]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === form.employeeId) ?? null,
    [employees, form.employeeId]
  );

  const days = useMemo(() => {
    return countChargeableLeaveDays(form.from, form.to, holidays);
  }, [form.from, form.to, holidays]);

  const step1Error = !form.employeeId ? 'Select an employee to continue.' : '';
  const step2Errors = {
    from: !form.from ? 'Start date is required.' : '',
    to: !form.to ? 'End date is required.' : form.to < form.from ? 'End date cannot be earlier than start date.' : '',
    reason: !form.reason.trim() ? 'Reason is required.' : form.reason.trim().length < 10 ? 'Use at least 10 characters.' : ''
  };

  const dayError = form.from && form.to && days <= 0
    ? 'Selected range only contains weekends/holidays. Choose working days.'
    : '';

  if (!open) return null;

  const goToStep = (next: number) => {
    setStep(next);
    setTouched(false);
  };

  const handleNext = () => {
    setTouched(true);
    if (step === 1 && step1Error) return;
    if (step === 2 && (step2Errors.from || step2Errors.to || step2Errors.reason || dayError)) return;
    goToStep(step + 1);
  };

  const handleSubmit = () => {
    onSubmit(form);
    setSubmitted(true);
    window.setTimeout(() => onClose(), 1200);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-[96dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl">
        <div className={clsx('relative shrink-0 overflow-hidden px-6 py-5 text-white', STEP_COLORS[step])}>
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -right-2 top-10 h-20 w-20 rounded-full bg-white/10" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Step {step} of {STEPS.length}</p>
              <h2 className="mt-0.5 text-xl font-bold">Leave Application</h2>
              <p className="text-sm text-white/70">{STEPS[step - 1].sub}</p>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl bg-white/20 p-1.5 text-white hover:bg-white/30">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative mt-5 flex items-center gap-1.5">
            {STEPS.map((item, index) => {
              const Icon = item.icon;
              const done = step > item.id;
              const active = step === item.id;
              return (
                <div key={item.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => done && goToStep(item.id)}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
                      active ? 'bg-white/25 text-white ring-1 ring-white/40' : done ? 'bg-white/15 text-white/80' : 'bg-white/10 text-white/50'
                    )}
                  >
                    {done ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                  {index < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-white/30" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-4">
                <p className="text-xs font-medium text-brand-700">Select the employee who is applying for leave.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, employeeId: employee.id }))}
                    className={clsx(
                      'rounded-2xl border px-4 py-4 text-left transition',
                      form.employeeId === employee.id
                        ? 'border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50/40'
                    )}
                  >
                    <p className="font-medium">{employee.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{employee.department}</p>
                  </button>
                ))}
              </div>
              {touched && step1Error && <p className="text-xs text-red-500">{step1Error}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4">
                <p className="text-xs font-medium text-emerald-700">Choose leave type, duration, and a reason for the approval workflow.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {leaveTypes.map(({ type, label, sub, icon: Icon }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, type }))}
                    className={clsx(
                      'rounded-2xl border px-4 py-4 text-left transition',
                      form.type === type
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/30'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{type}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium">{label}</p>
                    <p className="mt-1 text-xs text-slate-500">{sub}</p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">From Date</label>
                  <input
                    type="date"
                    value={form.from}
                    onChange={(event) => setForm((prev) => ({ ...prev, from: event.target.value }))}
                    className={clsx(
                      'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2',
                      touched && step2Errors.from ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                    )}
                  />
                  {touched && step2Errors.from && <p className="text-xs text-red-500">{step2Errors.from}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">To Date</label>
                  <input
                    type="date"
                    value={form.to}
                    onChange={(event) => setForm((prev) => ({ ...prev, to: event.target.value }))}
                    className={clsx(
                      'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2',
                      touched && step2Errors.to ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                    )}
                  />
                  {touched && step2Errors.to && <p className="text-xs text-red-500">{step2Errors.to}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Reason</label>
                <textarea
                  rows={4}
                  value={form.reason}
                  onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
                  className={clsx(
                    'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none resize-none focus:ring-2',
                    touched && step2Errors.reason ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                  )}
                  placeholder="Briefly explain why this leave is needed."
                />
                {touched && step2Errors.reason && <p className="text-xs text-red-500">{step2Errors.reason}</p>}
              </div>
              {touched && dayError && <p className="text-xs text-red-500">{dayError}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Leave Request Submitted!</p>
                    <p className="text-sm text-slate-500">Routing to manager approval.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-brand-50 p-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 text-white shadow">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{selectedEmployee?.name ?? '—'}</p>
                      <p className="text-sm text-slate-500">{selectedEmployee?.department ?? '—'}</p>
                      <Badge variant="soft" className="mt-1">{form.type} · {days || 0} day(s)</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">From</p><p className="mt-2 text-sm font-medium text-slate-900">{form.from || '—'}</p></div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">To</p><p className="mt-2 text-sm font-medium text-slate-900">{form.to || '—'}</p></div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reason</p><p className="mt-2 text-sm font-medium text-slate-900">{form.reason || '—'}</p></div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={step === 1 ? onClose : () => goToStep(step - 1)}>
              {step === 1 ? 'Cancel' : '← Back'}
            </Button>
            <div className="flex items-center gap-2">
              {STEPS.map((item) => (
                <div key={item.id} className={clsx('h-1.5 rounded-full transition-all duration-300', step === item.id ? `w-5 ${STEP_COLORS[step]}` : step > item.id ? 'w-1.5 bg-slate-300' : 'w-1.5 bg-slate-200')} />
              ))}
            </div>
            {step < STEPS.length ? (
              <Button type="button" onClick={handleNext}>Next →</Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={submitted}>Submit Request</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaveApplicationWizard;