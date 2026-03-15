// SearchBar.tsx
// Provides a styled search input used in the global navbar.

'use client';

import type { InputHTMLAttributes } from 'react';
import { Search } from 'lucide-react';

type SearchBarProps = InputHTMLAttributes<HTMLInputElement>;

export const SearchBar = ({ placeholder, ...rest }: SearchBarProps) => {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
      <input
        type="search"
        placeholder={placeholder ?? 'Search'}
        className="w-full rounded-md border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
        {...rest}
      />
    </div>
  );
};

export default SearchBar;
