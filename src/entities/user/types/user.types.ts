export type User = {
  id: string;
  employeeId?: string | null;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  isActive?: boolean;
};

