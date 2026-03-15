// Breadcrumb.tsx
// Renders a simple breadcrumb trail based on the current pathname.

import type { ReactNode } from 'react';

type BreadcrumbItemProps = {
  children: ReactNode;
};

export const BreadcrumbItem = ({ children }: BreadcrumbItemProps) => {
  return <span className="text-xs text-slate-500">{children}</span>;
};

type BreadcrumbProps = {
  pathname: string;
};

export const Breadcrumb = ({ pathname }: BreadcrumbProps) => {
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-400">
      <BreadcrumbItem>Home</BreadcrumbItem>
      {segments.map((segment) => (
        <span key={segment} className="flex items-center gap-1">
          <span>/</span>
          <BreadcrumbItem>
            {segment.charAt(0).toUpperCase() + segment.slice(1)}
          </BreadcrumbItem>
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumb;
