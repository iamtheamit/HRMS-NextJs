export type EmployeeUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: 'EMPLOYEE' | 'MANAGER' | 'HR_ADMIN' | 'SUPER_ADMIN';
  isActive?: boolean;
};

export type EmployeeDepartment = {
  id: string;
  name: string;
};

export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
  joinedAt?: string;
  phone?: string;
  countryCode?: string;
  mobileNumber?: string;
  profileUrl?: string;
  documents?: unknown;
  hireDate?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'TERMINATED';
  departmentId?: string;
  department?: EmployeeDepartment | null;
  managerId?: string;
  manager?: Pick<EmployeeUser, 'id' | 'email' | 'firstName' | 'lastName'> | null;
  userId?: string;
  user?: EmployeeUser | null;
  createdAt?: string;
  updatedAt?: string;
};

export type EmployeeListResponse = {
  data: Employee[];
  total: number;
};

export default Employee;
