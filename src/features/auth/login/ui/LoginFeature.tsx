"use client";

import React from 'react';
import { LoginForm } from '@/modules/auth/components/LoginForm';

export function LoginFeature({ onSuccess }: { onSuccess?: () => void }) {
  return <LoginForm onSuccess={onSuccess} />;
}

export default LoginFeature;
