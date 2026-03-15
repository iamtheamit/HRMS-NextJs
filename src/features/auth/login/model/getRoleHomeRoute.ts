import { routes } from '@/constants/routes';

export function getRoleHomeRoute(role?: string) {
  const normalizedRole = (role ?? '').toUpperCase();

  switch (normalizedRole) {
    case 'SUPER_ADMIN':
      return routes.superAdmin;
    case 'HR_ADMIN':
      return routes.hrAdmin;
    case 'MANAGER':
      return routes.manager;
    case 'EMPLOYEE':
      return routes.employee;
    default:
      return routes.dashboard;
  }
}

export default getRoleHomeRoute;
