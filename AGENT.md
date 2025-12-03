# 🚀 FluxPay Development Agent Guide (AGENT.md)

**Last Updated:** December 3, 2025 | **Commit:** a4ed35a
**Repository:** `vic-viqee/fluxpay` | **Current Branch:** `main`
**Dev Server:** http://localhost:3000 | **API Server:** http://localhost:3001 (planned)

---

## 📊 Current Project Status

### ✅ Completed Phases
- **Phase 1:** ✅ Design System & Component Library
- **Phase 2:** ✅ Frontend Pages & Styling (23 pages complete)
- **Task #1:** ✅ Visual QA Pass (footer, accessibility, responsive fixes)
- **Task #2:** ✅ Scaffold Authentication (NextAuth.js with JWT)
- **Task #6:** ✅ Frontend API Layer & DTOs
- **Task #9:** ✅ Shared UI Utilities & States

### 🔄 In Progress / Up Next
- **Task #3:** Provision Dev Infrastructure (Docker, PostgreSQL, Redis)
- **Task #4:** Backend Skeleton (NestJS + Prisma)
- **Task #5:** Auth + Merchant Onboarding API endpoints

### ⏳ Not Yet Started
- **Task #7:** Virtual Tills CRUD
- **Task #8:** STK Integration & M-Pesa Callbacks
- **Task #10:** CI/CD, Tests, and Deployment

---

## 🎯 High-Level Project Summary

**FluxPay** is a fintech payment platform enabling African businesses to accept M-Pesa payments, manage virtual payment tills (till numbers for collecting payments), onboard merchants, and handle payment processing with subscriptions and invoicing.

### Technology Stack
- **Frontend:** Next.js 16.x (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, CSS variables design system
- **Auth:** NextAuth.js v4 (JWT strategy, CredentialsProvider for dev)
- **API Fetching:** Custom typed fetch wrapper with auto-token injection and 401 refresh handling
- **Backend:** NestJS + Prisma (TypeScript) [TO BE BUILT]
- **Database:** PostgreSQL [TO BE PROVISIONED]
- **Cache/Queue:** Redis + BullMQ [TO BE PROVISIONED]
- **File Storage:** S3 or LocalStack [TO BE PROVISIONED]
- **Deployment:** Vercel (frontend), Railway/Heroku (backend)

### Key Features (MVP)
- User authentication (signup/login/reset)
- Merchant onboarding with KYC
- Virtual till creation and management
- M-Pesa STK payment integration
- Payment history and transaction tracking
- Subscription management
- Invoice generation
- Dashboard analytics

---

## 📁 Project Structure

```
fluxpay/
├── web/                          # Next.js frontend
│   ├── app/
│   │   ├── globals.css           # Design tokens, utilities, animations
│   │   ├── layout.tsx            # Root layout (SessionProvider + ToastProvider)
│   │   ├── middleware.ts         # Auth route protection
│   │   ├── page.tsx              # Home page
│   │   ├── lib/
│   │   │   ├── auth.ts           # NextAuth configuration
│   │   │   ├── api.ts            # Typed fetch wrapper
│   │   │   └── types/
│   │   │       └── dto.ts        # API DTOs (User, Merchant, Payment, etc.)
│   │   ├── hooks/
│   │   │   └── useAuth.tsx       # Auth provider & hook (temp)
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts  # NextAuth route handler
│   │   ├── components/
│   │   │   ├── index.ts          # Component barrel exports
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Alert.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Form.tsx
│   │   │   ├── SessionProvider.tsx  # NextAuth SessionProvider wrapper
│   │   │   ├── ToastProvider.tsx    # Toast notification system
│   │   │   ├── LoadingSkeleton.tsx  # Loading placeholder
│   │   │   ├── EmptyState.tsx       # No-data UI
│   │   │   └── ConfirmDialog.tsx    # Confirmation modal
│   │   ├── pages (public)
│   │   │   ├── page.tsx          # Home (/)
│   │   │   ├── about/page.tsx    # About
│   │   │   ├── features/page.tsx # Features
│   │   │   ├── pricing/page.tsx  # Pricing
│   │   │   ├── blog/page.tsx     # Blog
│   │   │   ├── testimonials/page.tsx # Testimonials
│   │   │   ├── help-center/page.tsx  # Help Center
│   │   │   ├── demo/page.tsx     # Demo
│   │   │   ├── faq/page.tsx      # FAQ
│   │   │   └── contact/page.tsx  # Contact
│   │   ├── auth pages
│   │   │   ├── login/page.tsx          # Login (NextAuth integrated)
│   │   │   ├── signup/page.tsx         # Signup (NextAuth integrated)
│   │   │   └── forgot-password/page.tsx
│   │   └── dashboard/
│   │       ├── page.tsx          # Dashboard
│   │       ├── payments/page.tsx  # Payments
│   │       ├── clients/page.tsx   # Clients
│   │       └── settings/page.tsx  # Settings
│   ├── public/                   # Static assets
│   ├── .env.example              # Environment variables template
│   ├── .env.local                # Local dev environment (NEXTAUTH_SECRET, etc.)
│   ├── next.config.js            # Next.js config
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.cjs        # Tailwind CSS config
│   └── package.json              # Dependencies
├── server/                       # Backend (NestJS) [TO BE CREATED]
├── docker-compose.yml            # Local dev services [TO BE CREATED]
├── AGENT.md                      # This file (consolidated guide)
├── PROGRESS.md                   # Legacy progress file
├── TESTING_GUIDE.md              # Legacy testing guide
├── PHASE_2_COMPLETE.md           # Legacy phase 2 summary
└── README.md                     # Main README
```

---

## 🎨 Design System

### Color Palette (CSS Variables)
```css
--color-primary: #0074d9 (Digital Blue)
--color-secondary: #00b8a6 (Teal)
--color-tertiary: #ff6633 (Sunset Orange)
--color-success: #22c55e (Emerald Green)
--color-warning: #f59e0b (Amber)
--color-danger: #ef4444 (Crimson Red)
--color-info: #0ea5e9 (Sky Blue)
```

Each color has 6 shades: `-50`, `-100`, `-200`, `-300`, `-400`, `-500`

### Spacing Scale
```css
--spacing-1: 0.25rem  (4px)
--spacing-2: 0.5rem   (8px)
--spacing-3: 0.75rem  (12px)
--spacing-4: 1rem     (16px)
--spacing-6: 1.5rem   (24px)
--spacing-8: 2rem     (32px)
--spacing-12: 3rem    (48px)
```

### Typography
- **Headings:** Roboto, 700 weight, fluid scaling with `clamp()`
- **Body:** System stack (Segoe, Helvetica, Arial), 400-500 weight
- **Code:** Fira Code, 400 weight

---

## 🔐 Authentication System (Task #2 - COMPLETE)

### Current Setup
- **Provider:** NextAuth.js v4 with CredentialsProvider
- **Strategy:** JWT (7-day expiration)
- **Session Storage:** JWT tokens in HTTP-only cookies (by NextAuth default)
- **Mock Dev Credentials:** `demo@fluxpay.com` / `demo123`

### Files Involved
- `web/app/lib/auth.ts` - NextAuth configuration, CredentialsProvider, JWT/session callbacks
- `web/app/api/auth/[...nextauth]/route.ts` - NextAuth route handler (GET/POST)
- `web/app/components/SessionProvider.tsx` - SessionProvider wrapper
- `web/app/layout.tsx` - Layout wrapped with SessionProvider
- `web/middleware.ts` - Route protection (redirects unauthenticated users from `/dashboard/*`)
- `web/app/login/page.tsx` - Login form integrated with `signIn()` from NextAuth
- `web/app/signup/page.tsx` - Signup form (placeholder for backend `/auth/register` integration)

### How to Test
```bash
# Navigate to login page
# Enter: demo@fluxpay.com / demo123
# Should redirect to /dashboard
# Session persists across page reloads
# Logout button appears in Navbar (under user menu)
```

### Environment Variables
```env
NEXTAUTH_SECRET=dev-secret-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Next Steps (Backend Integration)
When backend `/auth/login` and `/auth/register` endpoints are ready:
1. Update `web/app/lib/auth.ts` CredentialsProvider to call backend `/auth/login` instead of mock validation
2. Update signup form to call backend `/auth/register` with user data (email, password, name, phone, business info)
3. Backend should return `{ id, email, name, role, merchantId }` and optional access/refresh tokens

---

## 📡 Frontend API Layer (Task #6 - COMPLETE)

### API Fetcher (`web/app/lib/api.ts`)
Custom typed fetch wrapper with:
- **Auto-token injection:** Automatically adds `Authorization: Bearer <token>` header
- **Error normalization:** Converts all errors to consistent format
- **401 refresh handling:** Auto-refreshes token on 401 response
- **Timeout support:** Configurable request timeout
- **Method helpers:** `api.get()`, `api.post()`, `api.put()`, `api.delete()`, `api.patch()`

Example usage:
```typescript
import { api } from '@/app/lib/api'
import type { UserDto } from '@/app/lib/types/dto'

// GET request
const user = await api.get<UserDto>('/api/users/me')

// POST request with data
const payment = await api.post<PaymentDto>('/api/payments', {
  amount: 1000,
  tillId: 'till_123',
})

// Error handling
try {
  const result = await api.get<ClientDto>(`/api/clients/${id}`)
} catch (error) {
  const { status, message } = error as ApiErrorResponse
  console.error(`Error ${status}: ${message}`)
}
```

### DTOs (`web/app/lib/types/dto.ts`)
Single source of truth for API contracts with TypeScript interfaces:
- **Auth:** `LoginRequest`, `SignupRequest`, `AuthResponse`, `UserDto`, `RefreshTokenRequest`
- **Merchant:** `MerchantDto`, `MerchantCreateRequest`, `KycDocumentDto`
- **Payments:** `PaymentDto`, `StkInitiateRequest`, `StkInitiateResponse`, `PaymentCallbackDto`
- **Subscriptions:** `SubscriptionDto`, `SubscriptionCreateRequest`
- **Invoices:** `InvoiceDto`, `InvoiceCreateRequest`
- **Virtual Tills:** `TillDto`, `TillCreateRequest`
- **Pagination:** `PaginatedResponse<T>`
- **Errors:** `ApiErrorResponse`

All components and pages use these DTOs for type safety.

---

## 🎨 Shared UI Utilities (Task #9 - COMPLETE)

### ToastProvider
Toast notification system with auto-dismiss:
```typescript
import { useToast } from '@/app/components/ToastProvider'

const MyComponent = () => {
  const { addToast } = useToast()

  return (
    <button onClick={() => addToast({
      type: 'success',
      title: 'Success',
      message: 'Action completed successfully'
    })}>
      Show Toast
    </button>
  )
}
```

### LoadingSkeleton
Animated placeholder for loading states:
```typescript
<LoadingSkeleton count={5} height={20} width="100%" />
```

### EmptyState
UI for "no data" screens:
```typescript
<EmptyState
  icon="📦"
  title="No items"
  description="Create your first item to get started"
  actionLabel="Create Item"
  onAction={() => navigate('/create')}
/>
```

### ConfirmDialog
Promise-based confirmation modal:
```typescript
const { confirmDialog } = useConfirmDialog()

const handleDelete = async () => {
  const confirmed = await confirmDialog({
    title: 'Delete Item?',
    description: 'This action cannot be undone',
    isDangerous: true,
  })
  if (confirmed) {
    // Proceed with deletion
  }
}
```

---

## 📄 All Pages Overview

### Public Marketing Pages (7 pages)
1. **Home** (`/`) - Hero, features, stats, CTA
2. **Features** (`/features`) - 4 feature blocks with benefits
3. **Testimonials** (`/testimonials`) - 6 testimonial cards, ratings
4. **Pricing** (`/pricing`) - 3 tiers, FAQ accordion
5. **Blog** (`/blog`) - Article cards, resources
6. **About** (`/about`) - Mission, vision, team, values
7. **Help Center** (`/help-center`) - Search + FAQ categories

### Authentication Pages (3 pages)
8. **Login** (`/login`) - Email/password form, NextAuth integrated
9. **Signup** (`/signup`) - 2-step: personal info → business info
10. **Forgot Password** (`/forgot-password`) - Email reset flow

### Utility Pages (3 pages)
11. **Demo** (`/demo`) - Feature showcase, video, interactive tiles
12. **FAQ** (`/faq`) - Searchable FAQs by category (Getting Started, Payments, Tills, Support)
13. **Contact** (`/contact`) - Contact form, company info, social links

### Dashboard Pages (4 pages - require authentication)
14. **Dashboard** (`/dashboard`) - Main dashboard with stats, activity
15. **Payments** (`/dashboard/payments`) - Transaction table with filters
16. **Clients** (`/dashboard/clients`) - Client management, stats, top performers
17. **Settings** (`/dashboard/settings`) - 6-tab settings (Profile, Notifications, Business, Security, Payment, API)

---

## 🧪 Testing & Development

### Quick Start
```bash
# 1. Install dependencies
cd /workspaces/fluxpay/web
npm install

# 2. Start dev server
npm run dev
# App available at http://localhost:3000

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

### Testing Checklist
- [ ] Home page loads with gradient background and CTA
- [ ] Navigation works across all pages
- [ ] Login with `demo@fluxpay.com` / `demo123` redirects to `/dashboard`
- [ ] Logout removes session and redirects to `/login`
- [ ] Unauthenticated users cannot access `/dashboard/*` routes
- [ ] All components render without console errors
- [ ] Responsive design works on mobile (375px), tablet (768px), desktop (1024px+)
- [ ] Forms validate input and show errors
- [ ] Table sorting and filtering works
- [ ] Toast notifications appear and auto-dismiss
- [ ] No TypeScript errors: `npm run build`

### Component Testing Checklist
- **Navbar:** Logo links to home, nav links work, user menu visible when authenticated
- **Button:** Primary/secondary/danger variants render correctly
- **Input:** Placeholder shows, focus state highlights, error state displays
- **Card:** Border/shadow visible, hover effect works, padding consistent
- **Badge:** All color variants display correctly
- **Table:** Headers clear, data rows visible, striping visible
- **Modal:** Opens/closes, backdrop clickable, content centered

---

## 🔜 Next Priority Tasks

### Task #3: Provision Dev Infrastructure
**Goal:** Set up local development environment with Docker

**Files to create:**
- `docker-compose.yml` - Services for PostgreSQL, Redis, Mailhog (optional)
- `.env.local` - DB connection strings (localhost:5432, etc.)

**Services:**
```yaml
- PostgreSQL 15 (port 5432)
- Redis 7 (port 6379)
- pgAdmin (optional, port 5050)
- Mailhog (optional, port 1025)
```

**Estimated time:** 30 mins

### Task #4: Backend Skeleton (NestJS + Prisma)
**Goal:** Create basic backend structure

**Structure:**
```
server/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── strategies/
│   │       ├── jwt.strategy.ts
│   │       └── local.strategy.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.entity.ts
│   ├── merchants/
│   ├── tills/
│   ├── payments/
│   ├── database/
│   │   ├── migrations/
│   │   └── prisma/
│   │       └── schema.prisma
│   └── common/
│       ├── decorators/
│       ├── guards/
│       └── interceptors/
├── prisma/
│   └── schema.prisma
├── .env.example
└── package.json
```

**Estimated time:** 2-3 hours

### Task #5: Auth + Merchant Onboarding API
**Goal:** Implement backend endpoints for signup/login

**Endpoints:**
```
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /merchants
PUT /merchants/:id
GET /merchants/:id
POST /merchants/:id/kyc-upload
```

**Estimated time:** 3-4 hours

---

## 📋 Development Guidelines

### Code Standards
- **Language:** TypeScript (strict mode)
- **Formatting:** Prettier (auto-format on save)
- **Linting:** ESLint (type-aware rules)
- **Testing:** Jest + React Testing Library (frontend), Jest (backend)
- **Git:** Feature branches, descriptive commits, PRs for major changes

### Naming Conventions
- **Components:** PascalCase (`Button.tsx`, `LoginForm.tsx`)
- **Hooks:** camelCase with `use` prefix (`useAuth.ts`, `useToast.ts`)
- **Files:** lowercase with hyphens (`auth.service.ts`, `create-user.dto.ts`)
- **Interfaces:** PascalCase with `Dto`/`Request`/`Response` suffix (`UserDto`, `LoginRequest`)
- **Functions:** camelCase (`fetchUser()`, `validateEmail()`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)

### Component Structure
```typescript
'use client' // if using client-side features

import { ReactNode } from 'react'

interface MyComponentProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  className?: string
}

export const MyComponent: React.FC<MyComponentProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  return <div className={className}>{children}</div>
}
```

### Error Handling
- Use `ApiErrorResponse` from DTOs for API errors
- Wrap async operations in try-catch
- Show user-friendly error messages via Toast
- Log detailed errors to console (dev) or monitoring service (prod)

### Environment Variables
```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/fluxpay
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
M_PESA_CONSUMER_KEY=your-mpesa-key
M_PESA_CONSUMER_SECRET=your-mpesa-secret
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All TypeScript errors resolved (`npm run build`)
- [ ] All tests passing (`npm run test`)
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Logging/monitoring set up

### Frontend Deployment (Vercel)
```bash
# Push to GitHub main branch
git push origin main

# Vercel auto-deploys on push
# Set environment variables in Vercel dashboard
# - NEXTAUTH_SECRET (generate with `openssl rand -base64 32`)
# - NEXTAUTH_URL (production domain)
# - NEXT_PUBLIC_API_URL (backend API URL)
```

### Backend Deployment (Railway/Heroku)
```bash
# Deploy backend service
# Set environment variables (DB connection, JWT secret, M-Pesa credentials)
# Run database migrations
# Set up monitoring and logging
```

---

## 🔗 Quick Links & Resources

### Frontend Documentation
- [Next.js 16 Docs](https://nextjs.org/docs)
- [NextAuth.js Docs](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [React 19 Docs](https://react.dev)

### Backend Documentation
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeORM Docs](https://typeorm.io) (alternative)

### External Services
- [M-Pesa API](https://developer.safaricom.co.ke)
- [AWS S3 Docs](https://docs.aws.amazon.com/s3) (file upload)
- [Stripe/Paystack](https://stripe.com/docs) (alternative payment)

### Monitoring & Analytics
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay
- [Vercel Analytics](https://vercel.com/analytics) - Performance
- [Google Analytics](https://analytics.google.com) - User tracking

---

## 📞 Getting Help

### Common Issues

**Issue: "Module not found" error on build**
- Solution: Check import paths, ensure all files exist, run `npm install`

**Issue: NextAuth session not persisting**
- Solution: Check `NEXTAUTH_SECRET` is set, check browser cookies, verify middleware.ts routing

**Issue: API requests failing with 401**
- Solution: Check token format, verify token expiration, check refresh token logic

**Issue: Responsive layout broken on mobile**
- Solution: Check media query breakpoints, ensure `container-max` class applied, test with actual device

### Testing Quick Commands
```bash
# Build frontend
cd web && npm run build

# Start dev server
cd web && npm run dev

# Check TypeScript errors
cd web && npx tsc --noEmit

# Lint code
cd web && npm run lint

# Format code
cd web && npm run format
```

---

## 📝 Notes for AI Agents

### How to Use This Guide
1. **Reference this document** for context on project structure, completed tasks, and next steps
2. **Check current status** by reading the "Current Project Status" section
3. **Use design tokens** from "Design System" for consistency
4. **Follow code standards** in "Development Guidelines" section
5. **Refer to DTO interfaces** when building API integrations
6. **Test against checklist** in "Testing & Development" section

### Common Tasks for Agents
- **Adding a new page:** Create in `web/app/<route>/page.tsx`, use existing components, follow design system
- **Creating API endpoint:** Use typed `api.fetch()` helper, define DTO in `dto.ts`, add to endpoints doc
- **Fixing TypeScript errors:** Run `npm run build`, check error message, trace to file and fix type
- **Integrating backend:** Update `auth.ts` credentials provider or `api.ts` fetch wrapper
- **Component updates:** Ensure backward compatibility, update TypeScript interfaces, test across pages

### When to Update This Document
- After completing a major task (update progress section)
- After adding new architecture decisions (update structure section)
- After onboarding new team members (keep current)
- After production deployment (update deployment section)

---

**This document is the single source of truth for FluxPay development. Keep it updated!**

Generated: December 3, 2025 | Last Updated: December 3, 2025 | Status: ✅ CURRENT
