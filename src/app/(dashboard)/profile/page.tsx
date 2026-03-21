'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Briefcase, Building2, Mail, Phone, ShieldCheck, UserCircle2 } from 'lucide-react';
import { fetchCurrentUser } from '@/entities/user/api/userApi';
import { employeeService } from '@/entities/employee/services/employeeService';
import { routes } from '@/constants/routes';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { RoleGuard } from '@/shared/ui/RoleGuard';

type ProfileFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  mobileNumber: string;
  profileUrl: string;
};

const EMPTY_FORM: ProfileFormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  countryCode: '',
  mobileNumber: '',
  profileUrl: '',
};

const toFormState = (employee?: any, currentUser?: any): ProfileFormState => ({
  firstName: employee?.firstName || currentUser?.firstName || '',
  lastName: employee?.lastName || currentUser?.lastName || '',
  email: employee?.email || currentUser?.email || '',
  phone: employee?.phone || '',
  countryCode: employee?.countryCode || '',
  mobileNumber: employee?.mobileNumber || '',
  profileUrl: employee?.profileUrl || currentUser?.avatarUrl || '',
});

const formatRole = (role?: string) => {
  if (!role) return 'User';
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export default function MyProfilePage() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const authStoreUser = useAuthStore((state) => state.user);
  const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentUserQuery = useQuery({
    queryKey: ['auth-me', 'profile'],
    queryFn: fetchCurrentUser,
  });

  const employeeId = currentUserQuery.data?.employeeId || authStoreUser?.employeeId || null;

  const employeeQuery = useQuery({
    queryKey: ['employee', employeeId, 'profile'],
    queryFn: () => employeeService.getById(employeeId as string),
    enabled: Boolean(employeeId),
  });

  useEffect(() => {
    setForm(toFormState(employeeQuery.data, currentUserQuery.data));
  }, [employeeQuery.data, currentUserQuery.data]);

  const initialForm = useMemo(
    () => toFormState(employeeQuery.data, currentUserQuery.data),
    [employeeQuery.data, currentUserQuery.data]
  );

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);
  const profileName = `${form.firstName} ${form.lastName}`.trim() || currentUserQuery.data?.name || 'User';
  const initials = (form.firstName.charAt(0) + form.lastName.charAt(0)).toUpperCase() || 'U';
  const departmentName = employeeQuery.data?.department?.name || 'Not assigned';
  const roleLabel = formatRole(currentUserQuery.data?.role || authStoreUser?.role);

  const updateProfileMutation = useMutation({
    mutationFn: (payload: ProfileFormState) => employeeService.update(employeeId as string, payload),
    onSuccess: async (updatedEmployee) => {
      setError(null);
      setMessage('Profile updated successfully.');
      setAuth({
        user: {
          id: authStoreUser?.id || currentUserQuery.data?.id || updatedEmployee.userId || '',
          employeeId: updatedEmployee.id,
          name: `${updatedEmployee.firstName || ''} ${updatedEmployee.lastName || ''}`.trim() || 'User',
          email: updatedEmployee.email,
          role: authStoreUser?.role || currentUserQuery.data?.role,
        },
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['auth-me'] }),
        queryClient.invalidateQueries({ queryKey: ['employee', employeeId] }),
      ]);
    },
    onError: (mutationError: any) => {
      setMessage(null);
      setError(mutationError?.response?.data?.message || 'Unable to update your profile right now.');
    },
  });

  const handleFieldChange = (field: keyof ProfileFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = () => {
    setError(null);
    setMessage(null);

    if (!employeeId) {
      setError('This account is not linked to an employee profile yet.');
      return;
    }

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('First name, last name, and email are required.');
      return;
    }

    updateProfileMutation.mutate({
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      countryCode: form.countryCode.trim(),
      mobileNumber: form.mobileNumber.trim(),
      profileUrl: form.profileUrl.trim(),
    });
  };

  if (currentUserQuery.isLoading || (employeeId && employeeQuery.isLoading)) {
    return (
      <Card>
        <p className="text-sm text-slate-500">Loading your profile...</p>
      </Card>
    );
  }

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE']}>
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 text-lg font-semibold text-slate-600">
                {form.profileUrl ? (
                  <img src={form.profileUrl} alt={`${profileName} profile`} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>

              <div>
                <h1 className="text-xl font-semibold text-slate-900">{profileName}</h1>
                <p className="mt-1 text-sm text-slate-600">{form.email || currentUserQuery.data?.email || 'No email available'}</p>
                <p className="mt-1 text-xs text-slate-500">Employee ID: {employeeId || 'Not linked'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={routes.settings} className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                Security Settings
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <Card>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Profile Details</h2>
                <p className="text-sm text-slate-500">Update the personal details used across your account.</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            {message && (
              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="First Name" value={form.firstName} onChange={(event) => handleFieldChange('firstName', event.target.value)} />
              <Input label="Last Name" value={form.lastName} onChange={(event) => handleFieldChange('lastName', event.target.value)} />
              <Input label="Email" type="email" value={form.email} onChange={(event) => handleFieldChange('email', event.target.value)} className="sm:col-span-2" />
              <Input label="Phone" value={form.phone} onChange={(event) => handleFieldChange('phone', event.target.value)} />
              <Input label="Country Code" placeholder="+91" value={form.countryCode} onChange={(event) => handleFieldChange('countryCode', event.target.value)} />
              <Input label="Mobile Number" value={form.mobileNumber} onChange={(event) => handleFieldChange('mobileNumber', event.target.value)} />
              <Input label="Profile Image URL" placeholder="https://..." value={form.profileUrl} onChange={(event) => handleFieldChange('profileUrl', event.target.value)} className="sm:col-span-2" />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setForm(initialForm);
                  setError(null);
                  setMessage(null);
                }}
                disabled={!isDirty || updateProfileMutation.isPending}
              >
                Reset
              </Button>
              <Button onClick={handleSubmit} loading={updateProfileMutation.isPending} disabled={!employeeId || !isDirty}>
                Save Changes
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <h2 className="text-sm font-semibold text-slate-900">Account Overview</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <UserCircle2 className="h-4 w-4 text-slate-400" />
                  <span>Role: {roleLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>Email: {form.email || 'Not available'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>Phone: {form.phone || `${form.countryCode}${form.mobileNumber}` || 'Not available'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span>Department: {departmentName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  <span>Status: {employeeQuery.data?.status || 'ACTIVE'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <span>Manager: {employeeQuery.data?.manager ? `${employeeQuery.data.manager.firstName || ''} ${employeeQuery.data.manager.lastName || ''}`.trim() || employeeQuery.data.manager.email : 'Not assigned'}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold text-slate-900">What You Can Change</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This page is for self-service profile updates such as your name, email, phone details, and profile image URL.
                Employment settings like department, reporting manager, and status stay controlled by HR or management.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}