export type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
  joinedAt?: string;
};

export type EmployeeListResponse = {
  data: Employee[];
  total: number;
};

export default Employee;
