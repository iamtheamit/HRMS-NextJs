"use client";

import clsx from 'clsx';
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Hash,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import type { DepartmentFormValues } from '../model/useDepartmentDirectory';

type Props = {
  open: boolean;
  mode?: 'create' | 'edit';
  initialForm?: Partial<DepartmentFormValues>;
  existingDepartmentNames?: string[];
  existingDepartmentCodes?: string[];
  onClose: () => void;
  onSubmit: (values: DepartmentFormValues) => void;
};

type Step1Errors = {
  name?: string;
  code?: string;
};

const CODE_RE = /^[A-Z]{2,5}$/;
const defaultForm: DepartmentFormValues = {
  name: '',
  code: '',
};

const STEPS = [
  { id: 1, label: 'Overview', sub: 'Name and code', icon: Building2 },
  { id: 2, label: 'Review', sub: 'Confirm and save', icon: CheckCircle2 }
] as const;

const STEP_COLORS: Record<number, string> = {
  1: 'bg-brand-600',
  2: 'bg-indigo-600'
};

function validateStep1(
  form: DepartmentFormValues,
  existingDepartmentNames: string[],
  existingDepartmentCodes: string[],
  initialForm?: Partial<DepartmentFormValues>
): Step1Errors {
  const errors: Step1Errors = {};
  const normalizedInitialName = initialForm?.name?.trim().toLowerCase() ?? '';
  const normalizedInitialCode = initialForm?.code?.trim().toUpperCase() ?? '';
  const normalizedName = form.name.trim().toLowerCase();
  const normalizedCode = form.code.trim().toUpperCase();

  if (!form.name.trim()) {
    errors.name = 'Department name is required.';
  } else if (form.name.trim().length < 3) {
    errors.name = 'Use at least 3 characters.';
  } else if (
    normalizedName !== normalizedInitialName &&
    existingDepartmentNames.some((name) => name.trim().toLowerCase() === normalizedName)
  ) {
    errors.name = 'A department with this name already exists.';
  }

  if (!form.code.trim()) {
    errors.code = 'Department code is required.';
  } else if (!CODE_RE.test(form.code.trim().toUpperCase())) {
    errors.code = 'Use 2-5 uppercase letters, for example ENG.';
  } else if (
    normalizedCode !== normalizedInitialCode &&
    existingDepartmentCodes.some((code) => code.trim().toUpperCase() === normalizedCode)
  ) {
    errors.code = 'This department code is already in use.';
  }

  return errors;
}

function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}

function ReviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value || '-'}</p>
    </div>
  );
}

export function AddDepartmentWizard({
  open,
  mode = 'create',
  initialForm,
  existingDepartmentNames = [],
  existingDepartmentCodes = [],
  onClose,
  onSubmit
}: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<DepartmentFormValues>({ ...defaultForm, ...initialForm });
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const step1Errors = validateStep1(form, existingDepartmentNames, existingDepartmentCodes, initialForm);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setForm({ ...defaultForm, ...initialForm });
      setTouched(false);
      setSubmitted(false);
      return;
    }

    setStep(1);
    setForm({ ...defaultForm, ...initialForm });
    setTouched(false);
    setSubmitted(false);
  }, [initialForm, open]);

  if (!open) return null;

  const goToStep = (next: number) => {
    setStep(next);
    setTouched(false);
  };

  const set = <K extends keyof DepartmentFormValues>(key: K, value: DepartmentFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setTouched(true);

    if (step === 1 && hasErrors(step1Errors)) return;

    goToStep(step + 1);
  };

  const handleSubmit = () => {
    const normalizedForm = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
    };

    onSubmit(normalizedForm);
    setSubmitted(true);
    window.setTimeout(() => onClose(), 1200);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex h-[96dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl">
        <div
          className={clsx(
            'relative shrink-0 overflow-hidden px-6 py-5 text-white transition-colors duration-300',
            STEP_COLORS[step]
          )}
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -right-2 top-10 h-20 w-20 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Step {step} of {STEPS.length}
              </p>
              <h2 className="mt-0.5 text-xl font-bold">
                {mode === 'edit' ? 'Update Department' : 'Create Department'}
              </h2>
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
                      active
                        ? 'bg-white/25 text-white ring-1 ring-white/40'
                        : done
                        ? 'bg-white/15 text-white/80 hover:bg-white/25'
                        : 'bg-white/10 text-white/50'
                    )}
                  >
                    {done ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                  {index < STEPS.length - 1 && <ChevronRight className="h-3 w-3 shrink-0 text-white/30" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-4">
                <p className="text-xs font-medium text-brand-700">
                  Start with the department identity that will appear across reports, filters, and employee assignment.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> Department Name <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(event) => set('name', event.target.value)}
                  placeholder="e.g. Product Design"
                  className={clsx(
                    'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2',
                    touched && step1Errors.name
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                  )}
                />
                {touched && step1Errors.name && <p className="text-xs text-red-500">{step1Errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Hash className="h-3.5 w-3.5 text-slate-400" /> Department Code <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.code}
                  onChange={(event) => set('code', event.target.value.toUpperCase())}
                  placeholder="e.g. ENG"
                  maxLength={5}
                  className={clsx(
                    'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm uppercase text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2',
                    touched && step1Errors.code
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                  )}
                />
                {touched && step1Errors.code && <p className="text-xs text-red-500">{step1Errors.code}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {mode === 'edit' ? 'Department Updated!' : 'Department Created!'}
                    </p>
                    <p className="text-sm text-slate-500">Returning to the directory...</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-brand-50 p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 text-xl font-bold text-white shadow">
                      {form.code || 'DP'}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{form.name || '-'}</p>
                      <p className="text-sm text-slate-500">Created date is auto-managed by the system.</p>
                      <Badge variant="soft" className="mt-1">Ready to save</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ReviewCard label="Department Name" value={form.name} />
                    <ReviewCard label="Department Code" value={form.code} />
                    <ReviewCard label="Created On" value="Auto-generated by system" />
                    <ReviewCard label="Mode" value={mode === 'edit' ? 'Update existing department' : 'Create new department'} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={step === 1 ? onClose : () => goToStep(step - 1)}>
              {step === 1 ? 'Cancel' : '<- Back'}
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
              <Button type="button" onClick={handleNext}>
                Next →
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={submitted}>
                {mode === 'edit' ? 'Save Changes' : 'Save Department'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDepartmentWizard;
