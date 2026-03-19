"use client";

import clsx from 'clsx';
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Flag,
  UserPlus,
  X
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import type { TaskAssignerRole, TaskForm, TaskPriority } from '../model/useTaskManagement';

type EmployeeOption = {
  id: string;
  name: string;
  department: string;
};

type Props = {
  open: boolean;
  employees: EmployeeOption[];
  assignedByRole: TaskAssignerRole;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (form: TaskForm) => Promise<void> | void;
};

const STEPS = [
  { id: 1, label: 'Task Details', sub: 'Title and description', icon: ClipboardList },
  { id: 2, label: 'Assignment', sub: 'Assignee and due date', icon: UserPlus },
  { id: 3, label: 'Review', sub: 'Confirm and assign', icon: CheckCircle2 }
] as const;

const STEP_COLORS: Record<number, string> = {
  1: 'bg-brand-600',
  2: 'bg-emerald-600',
  3: 'bg-indigo-600'
};

const defaultForm: TaskForm = {
  title: '',
  description: '',
  assignedToId: '',
  dueDate: '',
  priority: 'Medium',
};

const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export function TaskAssignmentWizard({ open, employees, assignedByRole, isSubmitting = false, onClose, onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<TaskForm>(defaultForm);
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
    () => employees.find((employee) => employee.id === form.assignedToId) ?? null,
    [employees, form.assignedToId]
  );

  const step1Errors = {
    title: !form.title.trim() ? 'Task title is required.' : form.title.trim().length < 4 ? 'Use at least 4 characters.' : '',
    description: !form.description.trim() ? 'Task description is required.' : form.description.trim().length < 10 ? 'Use at least 10 characters.' : ''
  };

  const step2Errors = {
    assignedToId: !form.assignedToId ? 'Select an assignee.' : '',
    dueDate: !form.dueDate ? 'Due date is required.' : form.dueDate < new Date().toISOString().split('T')[0] ? 'Due date cannot be in the past.' : ''
  };

  if (!open) return null;

  const goToStep = (next: number) => {
    setStep(next);
    setTouched(false);
  };

  const handleNext = () => {
    setTouched(true);

    if (step === 1 && (step1Errors.title || step1Errors.description)) return;
    if (step === 2 && (step2Errors.assignedToId || step2Errors.dueDate)) return;

    goToStep(step + 1);
  };

  const handleSubmit = async () => {
    await onSubmit(form);
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
              <h2 className="mt-0.5 text-xl font-bold">Task Assignment</h2>
              <p className="text-sm text-white/70">{STEPS[step - 1].sub}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white/20 p-1.5 text-white transition hover:bg-white/30"
              aria-label="Close"
            >
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
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Task Title</label>
                <input
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="e.g. Prepare attendance audit report"
                  className={clsx(
                    'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2',
                    touched && step1Errors.title ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                  )}
                />
                {touched && step1Errors.title && <p className="text-xs text-red-500">{step1Errors.title}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Include expected output and acceptance criteria..."
                  className={clsx(
                    'block w-full resize-none rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2',
                    touched && step1Errors.description ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                  )}
                />
                {touched && step1Errors.description && <p className="text-xs text-red-500">{step1Errors.description}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Assign To</label>
                <select
                  value={form.assignedToId}
                  onChange={(event) => setForm((prev) => ({ ...prev, assignedToId: event.target.value }))}
                  className={clsx(
                    'block h-10 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:ring-2',
                    touched && step2Errors.assignedToId ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                  )}
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>{employee.name} · {employee.department}</option>
                  ))}
                </select>
                {touched && step2Errors.assignedToId && <p className="text-xs text-red-500">{step2Errors.assignedToId}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
                    className={clsx(
                      'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2',
                      touched && step2Errors.dueDate ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                    )}
                  />
                  {touched && step2Errors.dueDate && <p className="text-xs text-red-500">{step2Errors.dueDate}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}
                    className="block h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  >
                    {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Assigned By</label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {assignedByRole}
                </div>
              </div>
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
                    <p className="text-lg font-semibold text-slate-900">Task Assigned!</p>
                    <p className="text-sm text-slate-500">The assignee can now track and update progress.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-brand-50 p-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 text-white shadow">
                      <Flag className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{form.title || '—'}</p>
                      <p className="text-sm text-slate-500">{selectedEmployee?.name || 'Unassigned'} · due {form.dueDate || '—'}</p>
                      <Badge variant={form.priority === 'Critical' ? 'danger' : form.priority === 'High' ? 'warning' : 'soft'} className="mt-1">
                        {form.priority}
                      </Badge>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned by {assignedByRole}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</p>
                      <p className="mt-2 text-sm text-slate-700">{form.description || '—'}</p>
                    </div>
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
                <div
                  key={item.id}
                  className={clsx(
                    'h-1.5 rounded-full transition-all duration-300',
                    step === item.id
                      ? `w-5 ${STEP_COLORS[step]}`
                      : step > item.id
                      ? 'w-1.5 bg-slate-300'
                      : 'w-1.5 bg-slate-200'
                  )}
                />
              ))}
            </div>

            {step < STEPS.length ? (
              <Button type="button" onClick={handleNext}>Next →</Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={submitted || isSubmitting}>{isSubmitting ? 'Assigning...' : 'Assign Task'}</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskAssignmentWizard;
