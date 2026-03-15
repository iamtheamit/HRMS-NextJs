import { routes } from '@/constants/routes';

export function getRoleHomeRoute(role?: string) {
  const normalizedRole = (role ?? '').toUpperCase();

  switch (normalizedRole) {
    case 'SUPER_ADMIN':
      return routes.dashboard;
    case 'HR_ADMIN':
      return routes.employees;
    case 'MANAGER':
      return routes.tasks;
    case 'EMPLOYEE':
      return routes.attendance;
    default:
      return routes.dashboard;
  }
}

export default getRoleHomeRoute;
