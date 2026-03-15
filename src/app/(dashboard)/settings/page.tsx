'use client';

import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Bell, Shield, Palette, Globe } from 'lucide-react';
import { RoleGuard } from '@/shared/ui/RoleGuard';

const sections = [
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Manage email and push notification preferences.',
    bg: 'bg-brand-50',
    color: 'text-brand-600'
  },
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
  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER']}>
      <div className="space-y-6">
      {/* Profile section */}
      <Card>
        <h2 className="text-base font-semibold text-slate-900">Profile</h2>
        <p className="text-sm text-slate-500">Update your personal information.</p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First Name" placeholder="Amit" />
          <Input label="Last Name" placeholder="Kumar" />
          <Input label="Email" type="email" placeholder="amit@company.com" />
          <Input label="Phone" type="tel" placeholder="+91 98765 43210" />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary">Cancel</Button>
          <Button>Save Changes</Button>
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
