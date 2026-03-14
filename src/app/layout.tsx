// layout.tsx
// Defines the root layout and mounts global client-side providers for the HRMS application.

import type { ReactNode } from 'react';
import '../styles/globals.css';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

