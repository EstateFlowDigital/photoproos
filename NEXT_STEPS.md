# PhotoProOS - Detailed Next Steps Plan

## Current State Summary

### Completed
- Landing page with all sections (Hero, Features, Pricing, etc.)
- Dashboard layout (sidebar, topbar, navigation)
- All dashboard pages with demo data:
  - Dashboard overview with stats
  - Galleries (list, detail, new, edit)
  - Clients (list, detail, new, edit)
  - Payments (list, detail)
  - Scheduling (list, detail, new, edit)
  - Settings (profile, billing, team, branding, notifications, integrations)
- Public gallery view (`/g/[slug]`)
- Service selector with 20+ predefined photography packages
- Comprehensive CHANGELOG

### Not Yet Implemented
- Database connection (Railway PostgreSQL)
- Authentication (Clerk)
- API routes
- File uploads (Cloudflare R2)
- Payment processing (Stripe)
- Email notifications (Resend)
- Background jobs (Trigger.dev)

---

## Phase 1: Database Integration (Priority: Critical)

### 1.1 Set Up Railway PostgreSQL
1. Create new PostgreSQL service on Railway
2. Get connection string
3. Add to `.env.local`:
   ```
   DATABASE_URL="postgresql://..."
   ```

### 1.2 Run Prisma Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 1.3 Seed Database
```bash
npm run db:seed
```

### 1.4 Replace Demo Data with Real Queries
Update each page to fetch from database:

| Page | Current | Change |
|------|---------|--------|
| `/dashboard` | Demo stats | Query aggregated data |
| `/galleries` | Demo galleries array | `prisma.project.findMany()` |
| `/galleries/[id]` | Demo gallery object | `prisma.project.findUnique()` |
| `/clients` | Demo clients array | `prisma.client.findMany()` |
| `/clients/[id]` | Demo client object | `prisma.client.findUnique()` |
| `/payments` | Demo payments array | `prisma.payment.findMany()` |
| `/scheduling` | Demo bookings array | `prisma.booking.findMany()` |

---

## Phase 2: Authentication (Priority: Critical)

### 2.1 Configure Clerk
1. Create Clerk application at clerk.com
2. Add environment variables:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   CLERK_SECRET_KEY=sk_...
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

### 2.2 Add Clerk Provider
Update `src/app/layout.tsx`:
```tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### 2.3 Protect Dashboard Routes
The middleware already exists at `src/middleware.ts`. Verify it protects `/dashboard/*` routes.

### 2.4 Create Auth Pages
- `/login` - Clerk SignIn component
- `/signup` - Clerk SignUp component

### 2.5 Add User Context to Dashboard
Update `DashboardTopbar` to show actual user info from Clerk.

---

## Phase 3: API Routes (Priority: High)

### 3.1 Galleries API
```
src/app/api/galleries/
├── route.ts              # GET (list), POST (create)
└── [id]/
    ├── route.ts          # GET, PATCH, DELETE
    ├── assets/route.ts   # POST (upload)
    └── deliver/route.ts  # POST (generate link)
```

**Endpoints:**
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/galleries` | List galleries (paginated, filtered) |
| POST | `/api/galleries` | Create gallery |
| GET | `/api/galleries/[id]` | Get gallery details |
| PATCH | `/api/galleries/[id]` | Update gallery |
| DELETE | `/api/galleries/[id]` | Delete gallery |
| POST | `/api/galleries/[id]/assets` | Upload photos |
| POST | `/api/galleries/[id]/deliver` | Generate delivery link |

### 3.2 Clients API
```
src/app/api/clients/
├── route.ts              # GET, POST
└── [id]/route.ts         # GET, PATCH, DELETE
```

### 3.3 Bookings API
```
src/app/api/bookings/
├── route.ts              # GET, POST
├── availability/route.ts # GET available slots
└── [id]/route.ts         # GET, PATCH, DELETE
```

### 3.4 Payments API
```
src/app/api/payments/
├── route.ts              # GET
├── summary/route.ts      # GET aggregated stats
└── [id]/route.ts         # GET details
```

### 3.5 Dashboard API
```
src/app/api/dashboard/
├── stats/route.ts        # GET overview stats
└── activity/route.ts     # GET recent activity
```

---

## Phase 4: Form Submissions (Priority: High)

### 4.1 Create Server Actions
For each form, create server actions that:
1. Validate input with Zod
2. Check authentication
3. Create/update database records
4. Log activity
5. Redirect or return response

### 4.2 Forms to Connect
| Form | Action File |
|------|-------------|
| New Gallery | `src/app/(dashboard)/galleries/new/actions.ts` |
| Edit Gallery | `src/app/(dashboard)/galleries/[id]/edit/actions.ts` |
| New Client | `src/app/(dashboard)/clients/new/actions.ts` |
| Edit Client | `src/app/(dashboard)/clients/[id]/edit/actions.ts` |
| New Booking | `src/app/(dashboard)/scheduling/new/actions.ts` |
| Edit Booking | `src/app/(dashboard)/scheduling/[id]/edit/actions.ts` |

### 4.3 Validation Schemas
```
src/lib/validations/
├── galleries.ts
├── clients.ts
├── bookings.ts
└── settings.ts
```

---

## Phase 5: File Uploads (Priority: High)

### 5.1 Configure Cloudflare R2
1. Create R2 bucket
2. Add environment variables:
   ```
   R2_ACCOUNT_ID=...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET_NAME=...
   R2_PUBLIC_URL=...
   ```

### 5.2 Create Upload Utilities
```
src/lib/storage/
├── r2.ts               # R2 client configuration
├── presigned-urls.ts   # Generate upload URLs
└── utils.ts            # File validation, sizing
```

### 5.3 Implement Upload Flow
1. Client requests presigned URL
2. Client uploads directly to R2
3. Client notifies server of completion
4. Server creates Asset record

### 5.4 Add Image Processing
- Generate thumbnails
- Create watermarked versions
- Extract EXIF data

---

## Phase 6: Payment Processing (Priority: High)

### 6.1 Configure Stripe Connect
1. Create Stripe Connect application
2. Add environment variables:
   ```
   STRIPE_SECRET_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
   ```

### 6.2 Create Payment Flow
```
src/lib/payments/
├── stripe.ts           # Stripe client
├── checkout.ts         # Create checkout sessions
└── webhooks.ts         # Handle webhook events
```

### 6.3 Implement Gallery Payments
1. Gallery owner sets price
2. Generate delivery link with Stripe checkout
3. Client pays → Gallery unlocked
4. Webhook updates payment status

### 6.4 Webhook Handler
```
src/app/api/webhooks/stripe/route.ts
```

Events to handle:
- `checkout.session.completed` → Unlock gallery
- `payment_intent.succeeded` → Record payment
- `payment_intent.failed` → Notify photographer

---

## Phase 7: Email Notifications (Priority: Medium)

### 7.1 Configure Resend
```
RESEND_API_KEY=re_...
```

### 7.2 Create Email Templates
```
src/lib/email/
├── resend.ts
└── templates/
    ├── gallery-delivered.tsx
    ├── payment-received.tsx
    ├── booking-confirmation.tsx
    └── booking-reminder.tsx
```

### 7.3 Trigger Points
| Event | Email |
|-------|-------|
| Gallery delivered | `gallery-delivered` to client |
| Payment received | `payment-received` to photographer + client |
| Booking created | `booking-confirmation` to client |
| 24h before booking | `booking-reminder` to client |

---

## Phase 8: Polish & Testing (Priority: Medium)

### 8.1 Loading States
Add loading skeletons to all data-fetching pages.

### 8.2 Error Handling
- Add error boundaries
- Create error pages (404, 500)
- Add toast notifications for actions

### 8.3 Mobile Responsiveness
Test and fix responsive issues on:
- Dashboard sidebar (drawer on mobile)
- Forms (full-width on mobile)
- Tables (horizontal scroll or card view)

### 8.4 Accessibility
- Verify keyboard navigation
- Add ARIA labels
- Test with screen reader

---

## Recommended Implementation Order

### Week 1: Database & Auth
1. Set up Railway PostgreSQL
2. Run migrations and seed
3. Replace demo data with real queries
4. Configure Clerk
5. Protect routes
6. Update user context

### Week 2: API & Forms
1. Create API routes for galleries
2. Create API routes for clients
3. Create API routes for bookings
4. Connect forms to server actions
5. Add validation

### Week 3: Files & Payments
1. Set up Cloudflare R2
2. Implement upload flow
3. Configure Stripe
4. Implement gallery payment flow
5. Add webhooks

### Week 4: Email & Polish
1. Configure Resend
2. Create email templates
3. Add loading states
4. Add error handling
5. Test and fix issues

---

## Quick Start Commands

```bash
# Database
npm run db:push          # Push schema to database
npm run db:seed          # Seed with demo data
npm run db:studio        # Open Prisma Studio

# Development
npm run dev              # Start dev server

# Type checking
npx tsc --noEmit         # Check types

# Linting
npm run lint             # Run ESLint
```

---

## Environment Variables Checklist

```env
# Database (Railway)
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Resend
RESEND_API_KEY=

# Optional: Monitoring
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
```
