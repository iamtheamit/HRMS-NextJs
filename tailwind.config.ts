// tailwind.config.ts
// Configures TailwindCSS for styling the HRMS frontend.

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4ff',
          500: '#2563eb',
          600: '#1d4ed8'
        }
      }
    }
  },
  plugins: []
};

export default config;

