"use client";

import clsx from 'clsx';
import {
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Search,
  Upload,
  User,
  X
} from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useCreateEmployee } from '../model/useCreateEmployee';
import { listDepartmentsApi } from '@/features/department/api/departmentApi';
import { fetchEmployees } from '@/entities/employee/api/employeeApi';
import { uploadMediaFilesApi, type UploadedMediaItem } from '@/features/media/api/uploadMediaApi';

/* ─── validation ──────────────────────────────────────────────── */
type Step1Errors = { firstName?: string; lastName?: string; email?: string; dob?: string; countryCode?: string; mobileNumber?: string };
type Step2Errors = { designation?: string; joiningDate?: string; employeeCode?: string; departmentId?: string };
type Step3Errors = { aadhar?: string; pan?: string };
type AllErrors = { step1: Step1Errors; step2: Step2Errors; step3: Step3Errors };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s\-()]{7,15}$/;
const COUNTRY_CODE_RE = /^\+\d{1,4}$/;
const MOBILE_RE = /^\d{7,15}$/;
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
  if (form.countryCode && !COUNTRY_CODE_RE.test(form.countryCode)) {
    e.countryCode = 'Use valid format like +91.';
  }
  if (form.mobileNumber && !MOBILE_RE.test(form.mobileNumber)) {
    e.mobileNumber = 'Enter 7-15 digits.';
  }
  if ((form.countryCode && !form.mobileNumber) || (!form.countryCode && form.mobileNumber)) {
    e.mobileNumber = 'Provide both country code and mobile number.';
  }
  return e;
}

function validateStep2(form: FormState): Step2Errors {
  const e: Step2Errors = {};
  if (!form.designation.trim()) e.designation = 'Designation is required.';
  else if (form.designation.trim().length < 3) e.designation = 'At least 3 characters.';
  if (form.joiningDate && new Date(form.joiningDate) > new Date()) e.joiningDate = 'Joining date cannot be in the future.';
  if (form.employeeCode && !EMP_CODE_RE.test(form.employeeCode)) e.employeeCode = 'Format must be EMP-XXXX (e.g. EMP-1002).';
  if (!form.departmentId) e.departmentId = 'Department is required.';
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
  accountRole: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN';
  dob: string;
  countryCode: string;
  mobileNumber: string;
  address: string;
  designation: string;
  departmentId: string;
  managerId: string;
  joiningDate: string;
  employeeCode: string;
};

type DocState = Record<'aadhar' | 'pan' | 'offer' | 'other', File | null>;
type UploadStatus = 'idle' | 'uploading' | 'uploaded' | 'error';
type DocUploadState = Record<
  keyof DocState,
  { status: UploadStatus; item: UploadedMediaItem | null; message?: string }
>;

type Props = {
  open: boolean;
  onClose: () => void;
  initialForm?: Partial<FormState>;
};

const defaultForm: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  accountRole: 'EMPLOYEE',
  dob: '',
  countryCode: '+91',
  mobileNumber: '',
  address: '',
  designation: '',
  departmentId: '',
  managerId: '',
  joiningDate: '',
  employeeCode: ''
};

const defaultDocs: DocState = { aadhar: null, pan: null, offer: null, other: null };
const defaultDocUploads: DocUploadState = {
  aadhar: { status: 'idle', item: null },
  pan: { status: 'idle', item: null },
  offer: { status: 'idle', item: null },
  other: { status: 'idle', item: null },
};

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
  const departmentQuery = useQuery({
    queryKey: ['departments'],
    queryFn: listDepartmentsApi,
  });
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>({ ...defaultForm, ...initialForm });
  const [docs, setDocs] = useState<DocState>(defaultDocs);
  const [docUploads, setDocUploads] = useState<DocUploadState>(defaultDocUploads);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [docPreviewUrls, setDocPreviewUrls] = useState<Partial<Record<keyof DocState, string>>>({});
  const [touched, setTouched] = useState(false); // true after first "Next" attempt on current step
  const photoRef = useRef<HTMLInputElement>(null);
  const deptRef = useRef<HTMLDivElement>(null);
  const deptPopupRef = useRef<HTMLDivElement>(null);
  const [deptSearch, setDeptSearch] = useState('');
  const [deptOpen, setDeptOpen] = useState(false);
  const [deptPage, setDeptPage] = useState(1);
  const [deptPopupStyle, setDeptPopupStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const rolePopupRef = useRef<HTMLDivElement>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const [rolePopupStyle, setRolePopupStyle] = useState<{ top: number; left: number; width: number } | null>(null);
  const managerRef = useRef<HTMLDivElement>(null);
  const managerPopupRef = useRef<HTMLDivElement>(null);
  const [managerSearch, setManagerSearch] = useState('');
  const [managerOpen, setManagerOpen] = useState(false);
  const [managerPage, setManagerPage] = useState(1);
  const [managerPopupStyle, setManagerPopupStyle] = useState<{ top: number; left: number; width: number } | null>(null);

  const managersQuery = useQuery({
    queryKey: ['employees', 'dropdown-managers'],
    queryFn: () => fetchEmployees(1, 500),
    enabled: open,
  });

  // Compute live errors (only shown when touched)
  const e1 = validateStep1(form);
  const e2 = validateStep2(form);
  const e3 = validateStep3(docs);
  const departments = departmentQuery.data || [];
  const DEPT_PAGE_SIZE = 8;
  const filteredDepts = useMemo(
    () => departments.filter((d) => d.name.toLowerCase().includes(deptSearch.toLowerCase())),
    [departments, deptSearch]
  );
  const visibleDepts = filteredDepts.slice(0, deptPage * DEPT_PAGE_SIZE);
  const hasMoreDepts = visibleDepts.length < filteredDepts.length;
  const selectedDeptName = departments.find((d) => d.id === form.departmentId)?.name ?? '';
  const managerRows = managersQuery.data || [];
  const MANAGER_PAGE_SIZE = 8;
  const filteredManagers = useMemo(() => {
    const q = managerSearch.toLowerCase().trim();
    const rows = managerRows;
    if (!q) return rows;
    return rows.filter((row) => `${row.firstName || ''} ${row.lastName || ''} ${row.email || ''}`.toLowerCase().includes(q));
  }, [managerRows, managerSearch]);
  const visibleManagers = filteredManagers.slice(0, managerPage * MANAGER_PAGE_SIZE);
  const hasMoreManagers = visibleManagers.length < filteredManagers.length;
  const selectedManager = managerRows.find((row) => row.id === form.managerId);
  const selectedManagerLabel = selectedManager ? `${selectedManager.firstName || ''} ${selectedManager.lastName || ''}`.trim() || selectedManager.email : '';
  const isAnyDocUploading = useMemo(
    () => Object.values(docUploads).some((entry) => entry.status === 'uploading'),
    [docUploads]
  );
  const hasDocUploadError = useMemo(
    () => Object.values(docUploads).some((entry) => entry.status === 'error'),
    [docUploads]
  );

  useEffect(() => {
    if (!open) {
      setStep(1);
      setForm({ ...defaultForm, ...initialForm });
      setDocs(defaultDocs);
      setDocUploads(defaultDocUploads);
      setAvatarUrl(null);
      setAvatarFile(null);
      setSubmitted(false);
      setIsSubmitting(false);
      setApiError(null);
      setTouched(false);
    }
  }, [open, initialForm]);

  useEffect(() => {
    if (!departments.length) return;
    if (form.departmentId) return;
    set('departmentId', departments[0].id);
  }, [departments, form.departmentId]);

  useEffect(() => {
    if (!deptOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = deptRef.current?.contains(target);
      const inPopup = deptPopupRef.current?.contains(target);
      if (!inTrigger && !inPopup) setDeptOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [deptOpen]);

  useEffect(() => {
    if (!roleOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!roleRef.current?.contains(target) && !rolePopupRef.current?.contains(target)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [roleOpen]);

  useEffect(() => {
    const nextUrls: Partial<Record<keyof DocState, string>> = {};
    (Object.entries(docs) as [keyof DocState, File | null][]).forEach(([key, file]) => {
      if (file) {
        nextUrls[key] = URL.createObjectURL(file);
      }
    });

    setDocPreviewUrls(nextUrls);

    return () => {
      Object.values(nextUrls).forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [docs]);

  useEffect(() => {
    if (!managerOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = managerRef.current?.contains(target);
      const inPopup = managerPopupRef.current?.contains(target);
      if (!inTrigger && !inPopup) setManagerOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [managerOpen]);

  // Reset touched when the step changes so errors clear until user tries again
  const goToStep = (next: number) => { setStep(next); setTouched(false); };

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const getApiErrorMessage = (err: unknown) => {
    if (isAxiosError(err)) {
      const apiMessage = (err.response?.data as { message?: string } | undefined)?.message;
      if (apiMessage) return apiMessage;
      return err.message || 'Request failed. Please try again.';
    }
    return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  };

  const handleDocChange = async (key: keyof DocState, file: File | null) => {
    setDocs((prev) => ({ ...prev, [key]: file }));

    if (!file) {
      setDocUploads((prev) => ({
        ...prev,
        [key]: { status: 'idle', item: null },
      }));
      return;
    }

    setDocUploads((prev) => ({
      ...prev,
      [key]: { status: 'uploading', item: null, message: 'Uploading...' },
    }));

    try {
      const uploaded = await uploadMediaFilesApi([file], {
        folder: `hrms/employees/${(form.email || 'draft').toLowerCase()}/documents/${key}`,
        resourceType: 'auto',
      });

      setDocUploads((prev) => ({
        ...prev,
        [key]: {
          status: 'uploaded',
          item: uploaded[0] || null,
          message: 'Uploaded',
        },
      }));
    } catch (err: unknown) {
      setDocUploads((prev) => ({
        ...prev,
        [key]: { status: 'error', item: null, message: getApiErrorMessage(err) },
      }));
    }
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    setTouched(true);
    if (step === 1 && hasErrors(e1)) return;
    if (step === 2 && hasErrors(e2)) return;
    if (step === 3 && hasErrors(e3)) return;
    if (step === 3 && isAnyDocUploading) {
      setApiError('Please wait for document uploads to complete.');
      return;
    }
    if (step === 3 && hasDocUploadError) {
      setApiError('One or more document uploads failed. Please re-upload failed files.');
      return;
    }
    goToStep(step + 1);
  };

  const handleSubmit = async () => {
    setApiError(null);
    setIsSubmitting(true);
    try {
      if (isAnyDocUploading) {
        throw new Error('Please wait for document uploads to complete.');
      }

      if (hasDocUploadError) {
        throw new Error('One or more document uploads failed. Please re-upload failed files.');
      }

      let profileUpload: UploadedMediaItem | null = null;
      if (avatarFile) {
        const uploads = await uploadMediaFilesApi([avatarFile], {
          folder: `hrms/employees/${form.email.toLowerCase()}/profile`,
          resourceType: 'auto',
        });
        profileUpload = uploads[0] || null;
      }

      const documentsPayload: Record<string, unknown> = {};
      for (const [key, uploadEntry] of Object.entries(docUploads) as [keyof DocUploadState, DocUploadState[keyof DocUploadState]][]) {
        const item = uploadEntry.item;
        if (item) {
          documentsPayload[key] = {
            url: item.url,
            publicId: item.publicId,
            mimeType: item.mimeType,
            originalName: item.originalName,
            bytes: item.bytes,
          };
        }
      }

      await createEmployee.mutateAsync({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.accountRole as 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN',
        departmentId: form.departmentId || undefined,
        managerId: form.managerId || undefined,
        countryCode: form.countryCode || undefined,
        mobileNumber: form.mobileNumber || undefined,
        phone: form.countryCode && form.mobileNumber ? `${form.countryCode}${form.mobileNumber}` : undefined,
        profileUrl: profileUpload?.url,
        documents: Object.keys(documentsPayload).length ? documentsPayload : undefined,
      });

      setSubmitted(true);
      setTimeout(() => onClose(), 1600);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err);
      setApiError(msg);
      setIsSubmitting(false);
    }
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
                {avatarFile && (
                  <button
                    type="button"
                    onClick={() => { setAvatarFile(null); setAvatarUrl(null); }}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Remove photo
                  </button>
                )}
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
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> Mobile Number
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <input
                        value={form.countryCode}
                        onChange={(e) => set('countryCode', e.target.value)}
                        placeholder="+91"
                        className={clsx(
                          'block w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2',
                          touched && e1.countryCode
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                            : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        value={form.mobileNumber}
                        onChange={(e) => set('mobileNumber', e.target.value.replace(/\D/g, ''))}
                        placeholder="9876543210"
                        className={clsx(
                          'block w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2',
                          touched && e1.mobileNumber
                            ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                            : 'border-slate-200 focus:border-brand-400 focus:ring-brand-100'
                        )}
                      />
                    </div>
                  </div>
                  {(touched && (e1.countryCode || e1.mobileNumber)) && (
                    <p className="text-xs text-red-500">{e1.countryCode || e1.mobileNumber}</p>
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
                <label className="block text-sm font-medium text-slate-700">Account Access</label>
                {(() => {
                  const ROLE_OPTIONS: { value: FormState['accountRole']; label: string }[] = [
                    { value: 'EMPLOYEE', label: 'Employee' },
                    { value: 'MANAGER', label: 'Manager' },
                    { value: 'HR_ADMIN', label: 'HR' },
                  ];
                  const selectedRoleLabel = ROLE_OPTIONS.find((o) => o.value === form.accountRole)?.label ?? 'Select role…';
                  return (
                    <div ref={roleRef} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          const rect = roleRef.current?.getBoundingClientRect();
                          if (rect) setRolePopupStyle({ top: rect.bottom + 4, left: rect.left, width: rect.width });
                          setRoleOpen((o) => !o);
                        }}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-left transition hover:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                      >
                        <span className="text-slate-900">{selectedRoleLabel}</span>
                        <ChevronDown className={clsx('h-4 w-4 text-slate-400 transition-transform duration-200', roleOpen && 'rotate-180')} />
                      </button>

                      {roleOpen && rolePopupStyle && createPortal(
                        <div
                          ref={rolePopupRef}
                          style={{ position: 'fixed', top: rolePopupStyle.top, left: rolePopupStyle.left, width: rolePopupStyle.width, zIndex: 9999 }}
                          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                        >
                          {ROLE_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => { set('accountRole', option.value); setRoleOpen(false); }}
                              className={clsx(
                                'flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-emerald-50',
                                form.accountRole === option.value ? 'bg-emerald-50 font-semibold text-emerald-700' : 'text-slate-700'
                              )}
                            >
                              <span>{option.label}</span>
                              {form.accountRole === option.value && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                            </button>
                          ))}
                        </div>,
                        document.body
                      )}
                    </div>
                  );
                })()}
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
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Department <span className="text-red-400">*</span>
                </label>
                {departmentQuery.isLoading ? (
                  <p className="text-xs text-slate-500">Loading departments…</p>
                ) : (
                  <div ref={deptRef} className="relative">
                    {/* Trigger button */}
                    <button
                      type="button"
                      onClick={() => {
                        const rect = deptRef.current?.getBoundingClientRect();
                        if (rect) setDeptPopupStyle({ top: rect.bottom + 4, left: rect.left, width: rect.width });
                        setDeptOpen((o) => !o);
                        setDeptSearch('');
                        setDeptPage(1);
                      }}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-xl border bg-white px-4 py-2.5 text-sm text-left transition focus:outline-none focus:ring-2',
                        deptOpen
                          ? 'border-emerald-400 ring-2 ring-emerald-100'
                          : touched && e2.departmentId
                          ? 'border-red-400 ring-2 ring-red-100'
                          : 'border-slate-200 hover:border-emerald-300'
                      )}
                    >
                      <span className={selectedDeptName ? 'text-slate-900' : 'text-slate-400'}>
                        {selectedDeptName || 'Select a department…'}
                      </span>
                      <ChevronDown className={clsx('h-4 w-4 text-slate-400 transition-transform duration-200', deptOpen && 'rotate-180')} />
                    </button>

                    {/* Dropdown portal — rendered in document.body to escape overflow clipping */}
                    {deptOpen && deptPopupStyle && createPortal(
                      <div
                        ref={deptPopupRef}
                        style={{ position: 'fixed', top: deptPopupStyle.top, left: deptPopupStyle.left, width: deptPopupStyle.width, zIndex: 9999 }}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                      >
                        {/* Search */}
                        <div className="relative border-b border-slate-100 px-3 py-2">
                          <Search className="absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input
                            autoFocus
                            value={deptSearch}
                            onChange={(e) => { setDeptSearch(e.target.value); setDeptPage(1); }}
                            placeholder="Search departments…"
                            className="w-full rounded-lg bg-slate-50 py-1.5 pl-7 pr-3 text-sm outline-none placeholder:text-slate-400"
                          />
                        </div>

                        {/* Scrollable list */}
                        <div
                          className="max-h-48 overflow-y-auto py-1"
                          onScroll={(e) => {
                            const el = e.currentTarget;
                            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 20 && hasMoreDepts) {
                              setDeptPage((p) => p + 1);
                            }
                          }}
                        >
                          {departments.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-red-600">No departments found. Please create one first.</p>
                          ) : filteredDepts.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-slate-500">No departments match &ldquo;{deptSearch}&rdquo;</p>
                          ) : (
                            visibleDepts.map((dep) => (
                              <button
                                key={dep.id}
                                type="button"
                                onClick={() => { set('departmentId', dep.id); setDeptOpen(false); }}
                                className={clsx(
                                  'flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-emerald-50',
                                  form.departmentId === dep.id
                                    ? 'bg-emerald-50 font-semibold text-emerald-700'
                                    : 'text-slate-700'
                                )}
                              >
                                <span>{dep.name}</span>
                                {form.departmentId === dep.id && (
                                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                )}
                              </button>
                            ))
                          )}
                          {hasMoreDepts && (
                            <p className="px-4 py-2 text-center text-[11px] text-slate-400">Scroll for more…</p>
                          )}
                        </div>
                      </div>,
                      document.body
                    )}
                  </div>
                )}
                {touched && e2.departmentId && (
                  <p className="text-xs text-red-500">{e2.departmentId}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Reporting Manager
                </label>
                {managersQuery.isLoading ? (
                  <p className="text-xs text-slate-500">Loading managers…</p>
                ) : (
                  <div ref={managerRef} className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        const rect = managerRef.current?.getBoundingClientRect();
                        if (rect) setManagerPopupStyle({ top: rect.bottom + 4, left: rect.left, width: rect.width });
                        setManagerOpen((o) => !o);
                        setManagerSearch('');
                        setManagerPage(1);
                      }}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    >
                      <span className={selectedManagerLabel ? 'text-slate-900' : 'text-slate-400'}>
                        {selectedManagerLabel || 'Select a reporting manager (optional)…'}
                      </span>
                      <ChevronDown className={clsx('h-4 w-4 text-slate-400 transition-transform duration-200', managerOpen && 'rotate-180')} />
                    </button>

                    {managerOpen && managerPopupStyle && createPortal(
                      <div
                        ref={managerPopupRef}
                        style={{ position: 'fixed', top: managerPopupStyle.top, left: managerPopupStyle.left, width: managerPopupStyle.width, zIndex: 9999 }}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                      >
                        <div className="relative border-b border-slate-100 px-3 py-2">
                          <Search className="absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <input
                            autoFocus
                            value={managerSearch}
                            onChange={(e) => { setManagerSearch(e.target.value); setManagerPage(1); }}
                            placeholder="Search employees…"
                            className="w-full rounded-lg bg-slate-50 py-1.5 pl-7 pr-3 text-sm outline-none placeholder:text-slate-400"
                          />
                        </div>

                        <div
                          className="max-h-48 overflow-y-auto py-1"
                          onScroll={(e) => {
                            const el = e.currentTarget;
                            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 20 && hasMoreManagers) {
                              setManagerPage((p) => p + 1);
                            }
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => { set('managerId', ''); setManagerOpen(false); }}
                            className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-slate-500 transition hover:bg-slate-50"
                          >
                            <span>None</span>
                          </button>
                          {filteredManagers.length === 0 ? (
                            <p className="px-4 py-3 text-xs text-slate-500">No employees match your search.</p>
                          ) : (
                            visibleManagers.map((row) => {
                              const rowLabel = `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.email || 'Unnamed';
                              return (
                                <button
                                  key={row.id}
                                  type="button"
                                  onClick={() => { set('managerId', row.id); setManagerOpen(false); }}
                                  className={clsx(
                                    'flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-emerald-50',
                                    form.managerId === row.id ? 'bg-emerald-50 font-semibold text-emerald-700' : 'text-slate-700'
                                  )}
                                >
                                  <span className="truncate">{rowLabel}</span>
                                  {form.managerId === row.id && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />}
                                </button>
                              );
                            })
                          )}
                          {hasMoreManagers && (
                            <p className="px-4 py-2 text-center text-[11px] text-slate-400">Scroll for more…</p>
                          )}
                        </div>
                      </div>,
                      document.body
                    )}
                  </div>
                )}
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
                    onChange={(file) => { void handleDocChange('aadhar', file); }}
                  />
                  {docUploads.aadhar.status === 'uploading' && <p className="mt-1 text-xs text-brand-600">Uploading aadhar...</p>}
                  {docUploads.aadhar.status === 'uploaded' && <p className="mt-1 text-xs text-emerald-600">Aadhar uploaded.</p>}
                  {docUploads.aadhar.status === 'error' && <p className="mt-1 text-xs text-red-500">{docUploads.aadhar.message || 'Aadhar upload failed.'}</p>}
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
                    onChange={(file) => { void handleDocChange('pan', file); }}
                  />
                  {docUploads.pan.status === 'uploading' && <p className="mt-1 text-xs text-brand-600">Uploading PAN...</p>}
                  {docUploads.pan.status === 'uploaded' && <p className="mt-1 text-xs text-emerald-600">PAN uploaded.</p>}
                  {docUploads.pan.status === 'error' && <p className="mt-1 text-xs text-red-500">{docUploads.pan.message || 'PAN upload failed.'}</p>}
                  {touched && e3.pan && (
                    <p className="mt-1 text-xs text-red-500">{e3.pan}</p>
                  )}
                </div>
                <DocZone
                  label="Offer Letter"
                  icon={FileText}
                  file={docs.offer}
                  accept=".pdf"
                  onChange={(file) => { void handleDocChange('offer', file); }}
                />
                <DocZone
                  label="Other Document"
                  icon={FileText}
                  file={docs.other}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(file) => { void handleDocChange('other', file); }}
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

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Preview</p>
                <div className="space-y-2">
                  {(Object.entries(docs) as [keyof DocState, File | null][])
                    .filter(([, file]) => Boolean(file))
                    .map(([key, file]) => {
                      const f = file as File;
                      const previewUrl = docPreviewUrls[key] || '';
                      const isImage = f.type.startsWith('image/');
                      return (
                        <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2">
                          <div className="flex min-w-0 items-center gap-2">
                            {isImage ? (
                              <img src={previewUrl} alt={f.name} className="h-10 w-10 rounded-md object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                                <FileText className="h-4 w-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-slate-700">{f.name}</p>
                              <p className="text-[11px] text-slate-500">{Math.round(f.size / 1024)} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={previewUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-brand-600 hover:underline">Preview</a>
                            <button type="button" onClick={() => { void handleDocChange(key, null); }} className="text-xs font-medium text-red-600 hover:underline">Remove</button>
                          </div>
                        </div>
                      );
                    })}
                  {(Object.entries(docs) as [keyof DocState, File | null][]).every(([, file]) => !file) && (
                    <p className="text-xs text-slate-500">No documents selected yet.</p>
                  )}
                </div>
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
                      <Badge variant="soft" className="mt-1">{departments.find((dep) => dep.id === form.departmentId)?.name || 'Unassigned'}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <ReviewCard label="Account Access" value={form.accountRole === 'MANAGER' ? 'Manager' : form.accountRole === 'HR_ADMIN' ? 'HR' : 'Employee'} />
                    <ReviewCard label="Reporting Manager" value={selectedManagerLabel || 'Not assigned'} />
                    <ReviewCard label="Designation" value={form.designation} />
                    <ReviewCard label="Employee ID" value={form.employeeCode} />
                    <ReviewCard label="Joining Date" value={form.joiningDate} />
                    <ReviewCard label="Contact" value={form.countryCode && form.mobileNumber ? `${form.countryCode} ${form.mobileNumber}` : ''} />
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
                  loading={isSubmitting}
                onClick={handleSubmit}
                  disabled={submitted || isSubmitting || isAnyDocUploading}
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
