# HRMS Frontend (Next.js)

A production-ready **Human Resource Management System (HRMS)** frontend built with **Next.js 16**, **TypeScript**, and **React Query**. Features a modern, modular architecture with role-based dashboards, employee management, attendance tracking, leave requests, and payroll management.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Integration](#-api-integration)
- [Deployment](#-deployment)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Core Features
- **Authentication**: JWT-based login with secure cookie storage and auto-refresh
- **Role-Based Access Control**: Super Admin, HR Admin, Manager, Employee role dashboards
- **Employee Management**: CRUD operations, employee profiles, and lifecycle management
- **Attendance System**: Check-in/check-out tracking with daily records
- **Leave Management**: Request, approve, and track leave with leave policy enforcement
- **Payroll & Salary**: Salary structure, payroll processing, and salary slips
- **Dashboard**: Real-time analytics and KPIs for different user roles
- **Responsive Design**: Mobile-first UI with Tailwind CSS and custom components

### Technical Excellence
- **TypeScript**: Full type safety across the codebase
- **API Key Security**: x-api-key header authentication for all API calls
- **Data Fetching**: React Query for efficient caching and synchronization
- **Error Handling**: Global error boundaries and graceful fallbacks
- **Form Validation**: Client-side validation with clear error messages
- **State Management**: Zustand for lightweight auth state management

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + PostCSS |
| **Query Client** | React Query (TanStack Query) |
| **HTTP Client** | Axios with custom interceptors |
| **State Management** | Zustand |
| **UI Components** | Custom React components |
| **Code Quality** | ESLint + Next.js config |
| **Package Manager** | npm |

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects to login)
│   ├── providers.tsx            # Global providers (React Query, Auth)
│   ├── (auth)/                  # Auth routes group
│   │   ├── login/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   └── (dashboard)/             # Protected dashboard routes
│       ├── layout.tsx
│       ├── attendance/
│       ├── dashboard/
│       ├── departments/
│       ├── employees/
│       ├── employee/
│       ├── hr-admin/
│       ├── leave/
│       ├── manager/
│       ├── payroll/
│       ├── salary/
│       ├── settings/
│       ├── super-admin/
│       └── tasks/
│
├── constants/                    # Application constants
│   ├── messages.ts              # User-facing messages
│   └── routes.ts                # Route paths
│
├── entities/                     # Feature domains
│   ├── employee/
│   ├── payroll/
│   ├── salary/
│   └── user/
│
├── features/                     # Feature modules
│   ├── attendance/
│   ├── auth/
│   ├── dashboard/
│   ├── department/
│   ├── employee/
│   ├── leave/
│   ├── payroll/
│   ├── salary/
│   └── task/
│
├── shared/                       # Shared utilities
│   ├── api/                     # API client and interceptors
│   ├── hooks/                   # Custom React hooks
│   ├── ui/                      # Reusable UI components
│   └── utils/                   # Helper functions
│
├── store/                        # Client state (Zustand)
│   └── authStore.ts
│
├── styles/                       # Global styles
│   └── globals.css
│
└── widgets/                      # Complex UI compositions
    ├── dashboard-cards/
    ├── employee-table/
    ├── header/
    └── sidebar/
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ (recommended: 20+)
- **npm** 9+ or **yarn** 4+
- Backend API running (see [Backend README](../Backend-Node/README.md))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iamtheamit/HRMS-NextJs.git
   cd HRMS-NextJs/HRMS-NextJs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (see [Environment Variables](#-environment-variables))
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain/api
NEXT_PUBLIC_API_KEY=your-api-key-here

# Optional: Frontend-specific env
NEXT_PUBLIC_APP_NAME=HRMS
NEXT_PUBLIC_APP_ENVIRONMENT=development
```

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API endpoint | `https://api.example.com/api` |
| `NEXT_PUBLIC_API_KEY` | API key for x-api-key header auth | `your-secret-key` |

### Notes
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Never commit `.env.local` to version control
- For Vercel, add env variables via dashboard → Settings → Environment Variables

---

## 📜 Available Scripts

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Build & Optimization
```bash
npm run build        # Build optimized production bundle
npm run analyze      # Analyze bundle size (if configured)
```

---

## 🔌 API Integration

### API Client Setup
The API client is configured in `src/shared/api/apiClient.ts`:
- **Base URL**: Resolved from environment variables
- **Credentials**: Cookies enabled for JWT tokens
- **Headers**: Automatic x-api-key injection
- **Interceptors**: Auto-refresh on 401, error handling

### Making API Calls
```typescript
// Example: Authentication
import { apiClient } from '@/shared/api/apiClient';

const { data } = await apiClient.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// Example: Fetch with React Query
import { useQuery } from '@tanstack/react-query';

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: () => apiClient.get('/employees').then(res => res.data)
  });
};
```

### API Authentication
- **JWT Tokens**: Stored in secure cookies
- **API Key**: Automatically sent as `x-api-key` header on all requests
- **Auto Refresh**: 401 responses trigger token refresh automatically

---

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository in Vercel dashboard
3. Add environment variables:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `NEXT_PUBLIC_API_KEY`
4. Deploy (auto-deploys on push to main)

### Docker
```bash
# Build image
docker build -t hrms-frontend .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api \
  -e NEXT_PUBLIC_API_KEY=your-key \
  hrms-frontend
```

### Production Best Practices
- Use environment-specific configurations
- Enable Next.js Image Optimization
- Bundle analysis before deployment
- Monitor Core Web Vitals
- Set up security headers

---

## 📚 Best Practices

### Code Organization
- Keep features modular and isolated
- Use TypeScript for type safety
- Co-locate related files (types, hooks, components)
- Avoid cross-feature imports; use shared utilities instead

### Performance
- Use `React.memo()` for heavy components
- Implement code splitting with dynamic imports
- Optimize images with Next.js Image component
- Leverage React Query caching

### Security
- Never expose sensitive data in component code
- Validate inputs on both client and server
- Use secure cookies for sensitive tokens
- Keep dependencies updated

### Styling
- Use Tailwind CSS utility classes
- Define custom components in `ui/` folder
- Maintain consistency with design tokens
- Test responsive breakpoints

---

## 🐛 Troubleshooting

### Common Issues

**API calls returning 401 (Unauthorized)**
- Ensure `NEXT_PUBLIC_API_KEY` is set correctly
- Check if `x-api-key` header is being sent (check Network tab)
- Verify JWT token in cookies is valid

**CORS errors in browser**
- Backend `CORS_ORIGIN` must include frontend URL
- Check Vercel deployment domain matches env config

**Build errors on Vercel**
- Clear cache: Vercel dashboard → Settings → Caches → Clear
- Ensure all env variables are set
- Check TypeScript errors: `npm run build` locally

**API base URL not updating**
- Hard refresh browser (`Ctrl+F5` or `Cmd+Shift+R`)
- Clear Next.js cache: `rm -rf .next`
- Verify `NEXT_PUBLIC_API_BASE_URL` is set

---

## 📞 Support

For issues or questions:
1. Check existing [GitHub Issues](https://github.com/iamtheamit/HRMS-NextJs/issues)
2. Review backend [API documentation](../Backend-Node/README.md)
3. Contact development team

---

## 📄 License

This project is proprietary and confidential.

