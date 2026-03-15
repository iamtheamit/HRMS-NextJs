// SearchBar.tsx
// Provides a styled search input used in the global navbar.

'use client';

import type { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';
import clsx from 'clsx';

type SearchBarProps = InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export const SearchBar = ({ placeholder, className, ...rest }: SearchBarProps) => {
  return (
    <div className={clsx('relative w-full', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        placeholder={placeholder ?? 'Search...'}
        className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        {...rest}
      />
    </div>
  );
};

export default SearchBar;
