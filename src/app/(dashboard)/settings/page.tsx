'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Shield, Palette, Globe } from 'lucide-react';
import { RoleGuard } from '@/shared/ui/RoleGuard';
import { fetchCurrentUser } from '@/entities/user/api/userApi';
import {
  requestChangePasswordOtpApi,
  changePasswordWithOtpApi,
} from '@/features/auth/profile/api/changePasswordApi';

const sections = [
  {
    icon: Shield,
    title: 'Security',
    description: 'Two-factor authentication and session management.',
    bg: 'bg-emerald-50',
    color: 'text-emerald-600'
  },
  {
    icon: Palette,
    title: 'Appearance',
    description: 'Theme, colors, and display density.',
    bg: 'bg-violet-50',
    color: 'text-violet-600'
  },
  {
    icon: Globe,
    title: 'Language & Region',
    description: 'Timezone, date format, and locale settings.',
    bg: 'bg-amber-50',
    color: 'text-amber-600'
  }
];

export default function SettingsPage() {
  const { data: currentUser } = useQuery({
    queryKey: ['auth-me', 'settings'],
    queryFn: fetchCurrentUser,
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const requestOtpMutation = useMutation({
    mutationFn: requestChangePasswordOtpApi,
    onSuccess: () => {
      setError(null);
      setSuccessMessage('OTP sent to your registered email address.');
    },
    onError: (err: any) => {
      setSuccessMessage(null);
      setError(err?.response?.data?.message || 'Failed to send OTP. Please try again.');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePasswordWithOtpApi,
    onSuccess: () => {
      setError(null);
      setSuccessMessage('Password changed successfully.');
      setCurrentPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => {
      setSuccessMessage(null);
      setError(err?.response?.data?.message || 'Unable to change password.');
    },
  });

  const profileName = useMemo(() => {
    const first = currentUser?.firstName || '';
    const last = currentUser?.lastName || '';
    return `${first} ${last}`.trim() || currentUser?.name || 'User';
  }, [currentUser]);

  const handleChangePassword = () => {
    setError(null);
    setSuccessMessage(null);

    if (!currentPassword || !otp || !newPassword || !confirmPassword) {
      setError('Please complete all password fields.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      otp,
      newPassword,
    });
  };

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE']}>
      <div className="space-y-6">
      {/* Profile section */}
      <Card>
        <h2 className="text-base font-semibold text-slate-900">My Profile</h2>
        <p className="text-sm text-slate-500">Your account details and password security controls.</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Name" value={profileName} readOnly />
          <Input label="Email" type="email" value={currentUser?.email || ''} readOnly />
          <Input label="Role" value={currentUser?.role || ''} readOnly />
          <Input label="Employee ID" value={currentUser?.employeeId || 'N/A'} readOnly />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="text-sm font-semibold text-slate-900">Change Password with OTP</h3>
          <p className="mt-1 text-xs text-slate-500">
            Request an OTP and verify it to complete password change.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {successMessage}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">OTP</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  className="block h-[42px] w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0"
                  loading={requestOtpMutation.isPending}
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    requestOtpMutation.mutate();
                  }}
                >
                  Send OTP
                </Button>
              </div>
            </div>

            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setCurrentPassword('');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setError(null);
                setSuccessMessage(null);
              }}
            >
              Clear
            </Button>
            <Button loading={changePasswordMutation.isPending} onClick={handleChangePassword}>
              Change Password
            </Button>
          </div>
        </div>
      </Card>

      {/* Settings grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title} className="cursor-pointer transition hover:shadow-elevated">
              <div className="flex items-start gap-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{s.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>
      </div>
    </RoleGuard>
  );
}
