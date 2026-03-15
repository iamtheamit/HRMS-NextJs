import React from 'react';
import { Badge } from '@/shared/ui/Badge';
import type { User } from '../types/user.types';

export function UserBadge({ user }: { user: User }) {
  return <Badge>{user.role ?? 'User'}</Badge>;
}
