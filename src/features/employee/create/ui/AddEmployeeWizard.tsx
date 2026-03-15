"use client";

import clsx from 'clsx';
import {
  Briefcase,
  Camera,
  CheckCircle2,
  ChevronRight,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Upload,
  User,
  X
} from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useCreateEmployee } from '../model/useCreateEmployee';

/* ─── validation ──────────────────────────────────────────────── */
type Step1Errors = { firstName?: string; lastName?: string; email?: string; dob?: string; contact?: string };
type Step2Errors = { designation?: string; joiningDate?: string; employeeCode?: string };
type Step3Errors = { aadhar?: string; pan?: string };
type AllErrors = { step1: Step1Errors; step2: Step2Errors; step3: Step3Errors };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s\-()]{7,15}$/;
const EMP_CODE_RE = /^EMP-\d{3,6}$/i;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

function validateStep1(form: FormState): Step1Errors {
  const e: Step1Errors = {};
  if (!form.firstName.trim()) e.firstName = 'First name is required.';
  else if (form.firstName.trim().length < 2) e.firstName = 'At least 2 characters.';
  if (!form.lastName.trim()) e.lastName = 'Last name is required.';
  else if (form.lastName.trim().length < 2) e.lastName = 'At least 2 characters.';
  if (!form.email.trim()) e.email = 'Email is required.';
  else if (!EMAIL_RE.test(form.email)) e.email = 'Enter a valid email address.';
  if (form.dob) {
    const age = (Date.now() - new Date(form.dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age < 18) e.dob = 'Employee must be at least 18 years old.';
    if (age > 70) e.dob = 'Enter a valid date of birth.';
  }
  if (form.contact && !PHONE_RE.test(form.contact)) e.contact = 'Enter a valid contact number.';
  return e;
}

function validateStep2(form: FormState): Step2Errors {
  const e: Step2Errors = {};
  if (!form.designation.trim()) e.designation = 'Designation is required.';
  else if (form.designation.trim().length < 3) e.designation = 'At least 3 characters.';
  if (form.joiningDate && new Date(form.joiningDate) > new Date()) e.joiningDate = 'Joining date cannot be in the future.';
  if (form.employeeCode && !EMP_CODE_RE.test(form.employeeCode)) e.employeeCode = 'Format must be EMP-XXXX (e.g. EMP-1002).';
  return e;
}

function validateStep3(docs: DocState): Step3Errors {
  const e: Step3Errors = {};
  if (!docs.aadhar) e.aadhar = 'Aadhar is required.';
  else if (docs.aadhar.size > MAX_FILE_BYTES) e.aadhar = 'File must be under 5 MB.';
  if (!docs.pan) e.pan = 'PAN card is required.';
  else if (docs.pan.size > MAX_FILE_BYTES) e.pan = 'File must be under 5 MB.';
  if (docs.offer && docs.offer.size > MAX_FILE_BYTES) e.pan = 'Offer letter must be under 5 MB.';
  return e;
}

function hasErrors(errs: Record<string, string | undefined>) {
  return Object.values(errs).some(Boolean);
}

/* ─── types ─────────────────────────────────────────────────── */
type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  contact: string;
  address: string;
  designation: string;
  department: string;
  joiningDate: string;
  employeeCode: string;
};

type DocState = Record<'aadhar' | 'pan' | 'offer' | 'other', File | null>;

type Props = {
  open: boolean;
  onClose: () => void;
  initialForm?: Partial<FormState>;
};

const defaultForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  dob: '',
  contact: '',
  address: '',
  designation: '',
  department: 'Engineering',
  joiningDate: '',
  employeeCode: ''
};

const defaultDocs: DocState = { aadhar: null, pan: null, offer: null, other: null };

const departments = ['Engineering', 'Human Resources', 'Finance', 'Operations', 'Product', 'Marketing'];

const STEPS = [
  { id: 1, label: 'Personal', sub: 'Basic info & photo', icon: User },
  { id: 2, label: 'Job Details', sub: 'Role & department', icon: Briefcase },
  { id: 3, label: 'Documents', sub: 'Upload files', icon: FileText },
  { id: 4, label: 'Review', sub: 'Confirm & submit', icon: CheckCircle2 }
];

const STEP_COLORS: Record<number, string> = {
  1: 'bg-brand-600',
  2: 'bg-emerald-600',
  3: 'bg-amber-500',
  4: 'bg-indigo-600'
};

const STEP_BG: Record<number, string> = {
  1: 'bg-brand-50 text-brand-700 ring-brand-200',
  2: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  3: 'bg-amber-50 text-amber-700 ring-amber-200',
  4: 'bg-indigo-50 text-indigo-700 ring-indigo-200'
};

/* ─── doc upload zone ────────────────────────────────────────── */
function DocZone({
  label,
  icon: Icon,
  file,
  accept,
  onChange
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  file: File | null;
  accept: string;
  onChange: (f: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) onChange(dropped);
      }}
      onClick={() => ref.current?.click()}
      className={clsx(
        'group relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-all duration-150',
        dragging
          ? 'border-brand-400 bg-brand-50/60 scale-[1.01]'
          : file
          ? 'border-emerald-300 bg-emerald-50/50'
          : 'border-slate-200 bg-slate-50/50 hover:border-brand-300 hover:bg-brand-50/40'
      )}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />

      {file ? (
        <>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <Icon className="h-4 w-4" />
          </div>
          <p className="max-w-full truncate text-[11px] font-semibold text-emerald-700">{file.name}</p>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null); }}
            className="absolute right-2 top-2 rounded-full bg-white p-0.5 shadow-sm text-slate-400 hover:text-red-500"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm text-slate-400 group-hover:text-brand-600 transition-colors">
            <Upload className="h-4 w-4" />
          </div>
          <p className="text-[11px] font-semibold text-slate-600">{label}</p>
          <p className="text-[10px] text-slate-400">Drag & drop or click</p>
        </>
      )}
    </div>
  );
}

/* ─── main wizard ────────────────────────────────────────────── */
export function AddEmployeeWizard({ open, onClose, initialForm }: Props) {
  const createEmployee = useCreateEmployee();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ ...defaultForm, ...initialForm });
  const [docs, setDocs] = useState<DocState>(defaultDocs);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false); // true after first "Next" attempt on current step
  const photoRef = useRef<HTMLInputElement>(null);

  // Compute live errors (only shown when touched)
  const e1 = validateStep1(form);
  const e2 = validateStep2(form);
  const e3 = validateStep3(docs);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setForm({ ...defaultForm, ...initialForm });
      setDocs(defaultDocs);
      setAvatarUrl(null);
      setSubmitted(false);
      setApiError(null);
      setTouched(false);
    }
  }, [open, initialForm]);

  // Reset touched when the step changes so errors clear until user tries again
  const goToStep = (next: number) => { setStep(next); setTouched(false); };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setDoc = (key: keyof DocState) => (f: File | null) =>
    setDocs((prev) => ({ ...prev, [key]: f }));

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    setTouched(true);
    if (step === 1 && hasErrors(e1)) return;
    if (step === 2 && hasErrors(e2)) return;
    if (step === 3 && hasErrors(e3)) return;
    goToStep(step + 1);
  };

  const handleSubmit = () => {
    setApiError(null);
    createEmployee.mutate(
      {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: `${form.designation} | ${form.department}`
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setTimeout(() => onClose(), 1600);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
          setApiError(msg);
        }
      }
    );
  };

  if (!open) return null;

  const initials = `${form.firstName.charAt(0)}${form.lastName.charAt(0)}`.toUpperCase() || 'AK';

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 flex h-[96dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl">

        {/* ── Gradient header ── */}
        <div
          className={clsx(
            'relative shrink-0 overflow-hidden px-6 py-5 text-white transition-colors duration-300',
            STEP_COLORS[step]
          )}
        >
          {/* decorative circles */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -right-2 top-10 h-20 w-20 rounded-full bg-white/10" />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                Step {step} of {STEPS.length}
              </p>
              <h2 className="mt-0.5 text-xl font-bold">{STEPS[step - 1].label}</h2>
              <p className="text-sm text-white/70">{STEPS[step - 1].sub}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white/20 p-1.5 text-white hover:bg-white/30 transition"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step pills */}
          <div className="relative mt-5 flex items-center gap-1.5">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = step > s.id;
              const active = step === s.id;
              return (
                <div key={s.id} className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => done && setStep(s.id)}
                    className={clsx(
                      'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition',
                      active
                        ? 'bg-white/25 text-white ring-1 ring-white/40'
                        : done
                        ? 'bg-white/15 text-white/80 cursor-pointer hover:bg-white/25'
                        : 'bg-white/10 text-white/50 cursor-default'
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Icon className="h-3 w-3" />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="h-3 w-3 shrink-0 text-white/30" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ── Step 1: Personal ── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Avatar picker */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-indigo-500 text-2xl font-bold text-white shadow-lg ring-4 ring-white">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => photoRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow-md transition hover:bg-brand-700"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </div>
                <p className="text-xs text-slate-500">Click to upload profile photo</p>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" /> First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    placeholder="e.g. Priya"
                    className={clsx(
                      'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2',
                      touched && e1.firstName
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                    )}
                  />
                  {touched && e1.firstName && (
                    <p className="text-xs text-red-500">{e1.firstName}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" /> Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.lastName}
                    onChange={(e) => set('lastName', e.target.value)}
                    placeholder="e.g. Sharma"
                    className={clsx(
                      'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2',
                      touched && e1.lastName
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                    )}
                  />
                  {touched && e1.lastName && (
                    <p className="text-xs text-red-500">{e1.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="priya.sharma@company.com"
                  className={clsx(
                    'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2',
                    touched && e1.email
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                  )}
                />
                {touched && e1.email && (
                  <p className="text-xs text-red-500">{e1.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => set('dob', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={clsx(
                      'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2',
                      touched && e1.dob
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                    )}
                  />
                  {touched && e1.dob && (
                    <p className="text-xs text-red-500">{e1.dob}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> Contact Number
                  </label>
                  <input
                    value={form.contact}
                    onChange={(e) => set('contact', e.target.value)}
                    placeholder="+91 98765 43210"
                    className={clsx(
                      'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2',
                      touched && e1.contact
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                    )}
                  />
                  {touched && e1.contact && (
                    <p className="text-xs text-red-500">{e1.contact}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" /> Address
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => set('address', e.target.value)}
                  rows={2}
                  placeholder="Street, city, state, pincode"
                  className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none"
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Job Details ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-4">
                <p className="text-xs font-medium text-emerald-700">
                  Filling role details for <strong>{form.firstName || 'the employee'}</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Designation / Role <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.designation}
                  onChange={(e) => set('designation', e.target.value)}
                  placeholder="e.g. Senior Engineer"
                  className={clsx(
                    'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2',
                    touched && e2.designation
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                  )}
                />
                {touched && e2.designation && (
                  <p className="text-xs text-red-500">{e2.designation}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Department</label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {departments.map((dep) => (
                    <button
                      key={dep}
                      type="button"
                      onClick={() => set('department', dep)}
                      className={clsx(
                        'rounded-xl border px-3 py-2 text-left text-xs font-medium transition',
                        form.department === dep
                          ? 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/40'
                      )}
                    >
                      {dep}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Joining Date</label>
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(e) => set('joiningDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className={clsx(
                      'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2',
                      touched && e2.joiningDate
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                    )}
                  />
                  {touched && e2.joiningDate && (
                    <p className="text-xs text-red-500">{e2.joiningDate}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Employee ID</label>
                  <input
                    value={form.employeeCode}
                    onChange={(e) => set('employeeCode', e.target.value)}
                    placeholder="EMP-1001"
                    className={clsx(
                      'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2',
                      touched && e2.employeeCode
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-slate-200 focus:border-emerald-400 focus:ring-emerald-100'
                    )}
                  />
                  {touched && e2.employeeCode && (
                    <p className="text-xs text-red-500">{e2.employeeCode}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Documents ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-4">
                <p className="text-xs font-medium text-amber-700">
                  Upload identity / onboarding documents. Accepted: PDF, JPG, PNG · Max 5 MB each.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <DocZone
                    label="Aadhar Card *"
                    icon={Landmark}
                    file={docs.aadhar}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={setDoc('aadhar')}
                  />
                  {touched && e3.aadhar && (
                    <p className="mt-1 text-xs text-red-500">{e3.aadhar}</p>
                  )}
                </div>
                <div>
                  <DocZone
                    label="PAN Card *"
                    icon={FileText}
                    file={docs.pan}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={setDoc('pan')}
                  />
                  {touched && e3.pan && (
                    <p className="mt-1 text-xs text-red-500">{e3.pan}</p>
                  )}
                </div>
                <DocZone
                  label="Offer Letter"
                  icon={FileText}
                  file={docs.offer}
                  accept=".pdf"
                  onChange={setDoc('offer')}
                />
                <DocZone
                  label="Other Document"
                  icon={FileText}
                  file={docs.other}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={setDoc('other')}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {(Object.entries(docs) as [keyof DocState, File | null][]).map(([key, file]) =>
                  file ? (
                    <Badge key={key} variant="success">
                      ✓ {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Badge>
                  ) : (
                    <Badge key={key} variant="default">
                      {key.charAt(0).toUpperCase() + key.slice(1)}: pending
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 4 && (
            <div className="space-y-5">
              {apiError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {apiError}
                </div>
              )}
              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900">Employee Created!</p>
                    <p className="text-sm text-slate-500">Redirecting you back…</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Avatar summary */}
                  <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-brand-50 p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400 to-indigo-500 text-xl font-bold text-white shadow">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">
                        {form.firstName || '—'} {form.lastName}
                      </p>
                      <p className="text-sm text-slate-500">{form.email || '—'}</p>
                      <Badge variant="soft" className="mt-1">{form.department}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ReviewCard label="Designation" value={form.designation} />
                    <ReviewCard label="Employee ID" value={form.employeeCode} />
                    <ReviewCard label="Joining Date" value={form.joiningDate} />
                    <ReviewCard label="Contact" value={form.contact} />
                    <ReviewCard label="Date of Birth" value={form.dob} />
                    <ReviewCard label="Address" value={form.address} />
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Documents</p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(docs) as [keyof DocState, File | null][]).map(([key, file]) =>
                        file ? (
                          <Badge key={key} variant="success">✓ {key}</Badge>
                        ) : (
                          <Badge key={key} variant="warning">{key}: missing</Badge>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={step === 1 ? onClose : () => setStep(step - 1)}
            >
              {step === 1 ? 'Cancel' : '← Back'}
            </Button>

            <div className="flex items-center gap-2">
              {/* Step dots */}
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={clsx(
                    'h-1.5 rounded-full transition-all duration-300',
                    step === s.id
                      ? `w-5 ${STEP_COLORS[step]}`
                      : step > s.id
                      ? 'w-1.5 bg-slate-300'
                      : 'w-1.5 bg-slate-200'
                  )}
                />
              ))}
            </div>

            {step < 4 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!form.firstName || !form.email)}
              >
                Next →
              </Button>
            ) : (
              <Button
                type="button"
                loading={createEmployee.isPending}
                onClick={handleSubmit}
                disabled={submitted}
              >
                Create Employee
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-800">{value || '—'}</p>
    </div>
  );
}

export default AddEmployeeWizard;
