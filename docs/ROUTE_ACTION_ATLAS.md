# PhotoProOS Route-to-Action Atlas

A comprehensive mapping of every route to its data flow: Route → Page → Client → Actions → Models.

**Last Updated:** 2026-01-06
**Total Routes Mapped:** 7 / 192
**Verification Status:** IN PROGRESS

---

## Table of Contents

1. [Legend](#legend)
2. [Dashboard Core](#dashboard-core)
3. [Galleries](#galleries)
4. [Invoices & Billing](#invoices--billing)
5. [Clients](#clients)
6. [Scheduling & Bookings](#scheduling--bookings)
7. [Contracts](#contracts)
8. [Services & Products](#services--products)
9. [Orders](#orders)
10. [Projects & Tasks](#projects--tasks)
11. [Properties](#properties)
12. [Portfolios](#portfolios)
13. [Questionnaires & Forms](#questionnaires--forms)
14. [Leads & CRM](#leads--crm)
15. [Settings](#settings)
16. [Public Routes](#public-routes)
17. [Client Portal](#client-portal)
18. [API Routes](#api-routes)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Verified against source code |
| ⚠️ | Partially verified |
| ❌ | Not yet verified |
| 🔒 | Requires authentication |
| 🌐 | Public route |
| 📊 | Analytics/aggregation heavy |
| 🔄 | Real-time/dynamic data |

**Data Flow Pattern:**
```
Route → Page (Server) → Client Component → Server Actions → Prisma Models
```

---

## Dashboard Core

### `/dashboard` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/dashboard/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `dashboard/page.tsx` | Server component, auth check, parallel data fetch |
| Client | Dynamic imports: `QuickActions`, `UpcomingBookings`, `DashboardCalendar`, `OnboardingChecklist`, `DashboardCustomizePanel` | Interactive widgets |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getDashboardConfig()` | `dashboard.ts` | User dashboard preferences (60s cache) |
| `getExpiringSoonGalleries()` | `gallery-expiration.ts` | Galleries expiring within 7 days |
| `getOverdueInvoicesForDashboard()` | `invoices.ts` | Overdue invoice totals |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | Company metadata, branding |
| Invoice | aggregate | Monthly revenue, pending/overdue totals |
| Project | count, findMany | Gallery stats, recent galleries |
| Client | count | Total clients comparison |
| Booking | findMany | Upcoming bookings, calendar events |
| Task | findMany | Calendar tasks (30-day window) |
| PropertyWebsite | findMany | Open house dates |
| ActivityLog | findMany | Recent 5 activity items |
| PlatformReferrer | findUnique | Referral code and earnings |
| User | findUnique | Dashboard config |
| Service | count | Onboarding checklist |
| Asset | select | Gallery thumbnails |

**Data Flow:**
```
Auth Check → Load Organization → Promise.all([
  getDashboardConfig(),
  Financial Metrics (Invoice aggregates),
  Gallery Stats (Project counts),
  Client Stats (Client count),
  Recent Data (Projects, Bookings, Activity),
  Calendar Events (Tasks, Bookings, Open Houses),
  Referral Data,
  Alerts (Expiring galleries, Overdue invoices)
]) → Calculate Statistics → Render Components
```

---

### `/analytics` ❌ 🔒 📊

**Page:** `src/app/(dashboard)/analytics/page.tsx`
**Client:** `AnalyticsDashboardClient`

*To be mapped*

---

### `/inbox` ❌ 🔒

**Page:** `src/app/(dashboard)/inbox/page.tsx`
**Client:** `InboxPageClient`

*To be mapped*

---

### `/notifications` ❌ 🔒

**Page:** `src/app/(dashboard)/notifications/page.tsx`
**Client:** `NotificationsPageClient`

*To be mapped*

---

## Galleries

### `/galleries` ✅ 🔒

**Page:** `src/app/(dashboard)/galleries/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `galleries/page.tsx` | Server component, filter by status |
| Client | `galleries/gallery-list-client.tsx` | Search, sort, bulk actions, virtual scrolling |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getGalleryCounts()` | `galleries.ts` | Count by status |
| `duplicateGallery()` | `galleries.ts` | Clone gallery |
| `archiveGallery()` | `galleries.ts` | Archive/unarchive |
| `deleteGallery()` | `galleries.ts` | Delete gallery |
| `bulkArchiveGalleries()` | `galleries.ts` | Bulk archive |
| `bulkDeleteGalleries()` | `galleries.ts` | Bulk delete |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | Org context |
| Project | findMany, count | Galleries with filters |
| Client | findMany | Dropdown for create modal |
| Service | findMany | Service filter |
| Asset | select | Thumbnails (first 1) |
| ProjectService | include | Gallery services |
| GalleryAddonRequest | _count | Pending addon requests |

**Include Structure:**
```prisma
Project.include = {
  client: { select: { fullName, company } },
  _count: {
    assets: true,
    galleryAddonRequests: { where: { status: { in: [...] } } }
  },
  assets: { take: 1, orderBy: { createdAt: "desc" } },
  services: { include: { service: true }, orderBy: { isPrimary: "desc" } }
}
```

---

### `/galleries/new` ❌ 🔒

**Page:** `src/app/(dashboard)/galleries/new/page.tsx`
**Client:** `gallery-new-form.tsx`

*To be mapped*

---

### `/galleries/[id]` ❌ 🔒

**Page:** `src/app/(dashboard)/galleries/[id]/page.tsx`
**Client:** `gallery-detail-client.tsx`

*To be mapped*

---

### `/galleries/[id]/edit` ❌ 🔒

**Page:** `src/app/(dashboard)/galleries/[id]/edit/page.tsx`

*To be mapped*

---

## Invoices & Billing

### `/invoices` ✅ 🔒

**Page:** `src/app/(dashboard)/invoices/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `invoices/page.tsx` | Server component, status filter, metrics |
| Client | `invoices/invoices-page-client.tsx` | Search, sort, date filter, bulk actions, virtual table |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `updateInvoiceStatus()` | `invoices.ts` | Change status (bulk mark paid) |
| `sendInvoiceReminder()` | `invoices.ts` | Send payment reminder email |
| `markOverdueInvoices()` | `invoices.ts` | Auto-mark past-due as overdue |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | Org context |
| Invoice | findMany (x2) | Filtered list + all for metrics |
| Client | select | Client info on invoices |
| InvoiceLineItem | select | Line item count |

**Client State:**
- `searchQuery` - filter by invoice number, client name, email
- `sortOption` - newest, oldest, amountHigh, amountLow, dueDate
- `dateRangeFilter` - all, 7days, 30days, 90days
- `selectedIds` - bulk selection

---

### `/invoices/new` ❌ 🔒

**Page:** `src/app/(dashboard)/invoices/new/page.tsx`

*To be mapped*

---

### `/invoices/[id]` ❌ 🔒

**Page:** `src/app/(dashboard)/invoices/[id]/page.tsx`

*To be mapped*

---

### `/invoices/recurring` ❌ 🔒

**Page:** `src/app/(dashboard)/invoices/recurring/page.tsx`
**Client:** `recurring-invoices-client.tsx`

*To be mapped*

---

### `/billing/analytics` ❌ 🔒 📊

**Page:** `src/app/(dashboard)/billing/analytics/page.tsx`

*To be mapped*

---

### `/billing/credit-notes` ❌ 🔒

**Page:** `src/app/(dashboard)/billing/credit-notes/page.tsx`
**Client:** `credit-notes-page-client.tsx`

*To be mapped*

---

### `/billing/estimates` ❌ 🔒

**Page:** `src/app/(dashboard)/billing/estimates/page.tsx`
**Client:** `estimates-list-client.tsx`

*To be mapped*

---

### `/billing/retainers` ❌ 🔒

**Page:** `src/app/(dashboard)/billing/retainers/page.tsx`

*To be mapped*

---

### `/billing/reports` ❌ 🔒 📊

**Page:** `src/app/(dashboard)/billing/reports/page.tsx`

*To be mapped*

---

## Clients

### `/clients` ✅ 🔒

**Page:** `src/app/(dashboard)/clients/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `clients/page.tsx` | Server component, search + tag filter |
| Client | `clients/clients-page-client.tsx` | Search, sort, bulk actions, virtual table |

**Query Params:** `?q=`, `?view=tags`, `?tag=`

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getClientTags()` | `client-tags.ts` | Fetch tags with counts |
| `impersonateClientPortal()` | `clients.ts` | Create client session for portal |
| `bulkDeleteClients()` | `clients.ts` | Delete multiple clients |
| `bulkUpdateIndustry()` | `clients.ts` | Update industry for multiple |
| `bulkAssignTags()` | `clients.ts` | Add/replace tags |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | Org context |
| Client | findMany | Clients with relations |
| ClientTag | findMany | Tag filter pills |
| ClientTagAssignment | include | Client tags |
| Project | include | Project count |
| Invoice | include | Paid invoices for revenue |
| ClientSession | create | Portal impersonation |

**Include Structure:**
```prisma
Client.include = {
  projects: { select: { id } },
  tags: { include: { tag: true } },
  invoices: { where: { status: "paid" }, select: { totalCents } }
}
```

**Client Features:**
- Virtual scrolling table
- 7 sort options (name, company, email, revenue, projects, activity, created)
- Tag filtering with pills
- Bulk selection + actions
- CSV export
- Portal impersonation

---

### `/clients/new` ❌ 🔒

*To be mapped*

---

### `/clients/[id]` ❌ 🔒

*To be mapped*

---

### `/clients/import` ❌ 🔒

*To be mapped*

---

### `/clients/merge` ❌ 🔒

*To be mapped*

---

## Scheduling & Bookings

### `/scheduling` ✅ 🔒 🔄

**Page:** `src/app/(dashboard)/scheduling/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `scheduling/page.tsx` | Server component, parallel data fetch |
| Client | `scheduling/scheduling-page-client.tsx` | Calendar views, filters, create modal |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPendingTimeOffCount()` | `availability.ts` | Badge count for pending requests |
| `updateBookingStatus()` | `bookings.ts` | Change status, trigger emails |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | Org context, timezone |
| Booking | findMany | Next 100 non-cancelled bookings |
| Client | findMany | All org clients (50 limit) |
| CalendarIntegration | findFirst | Google Calendar sync status |
| AvailabilityBlock | findMany | Time-off blocks (next 3 months) |

**Data Fetched (Promise.all):**
1. Bookings - Next 100 with client, service relations
2. Clients - For dropdown (id, fullName, company, email)
3. Calendar Integration - Google sync status
4. Time-Off Blocks - Approved blocks for 3 months
5. Pending Time-Off Count - Badge count via server action

**Client Features:**
- Calendar view modes: week, month, list
- Status filter: all, pending, confirmed, completed, cancelled
- Search functionality
- Mini calendar for week preview
- Today's agenda quick view
- Create booking modal

---

### `/scheduling/availability` ❌ 🔒

*To be mapped*

---

### `/scheduling/types` ❌ 🔒

*To be mapped*

---

### `/scheduling/booking-forms` ❌ 🔒

*To be mapped*

---

## Contracts

### `/contracts` ✅ 🔒

**Page:** `src/app/(dashboard)/contracts/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `contracts/page.tsx` | Server component, status filter, metrics |
| Client | `contracts/contracts-page-client.tsx` | Search, status tabs, bulk export |

**Query Params:** `?status=` (draft, sent, signed, expired)

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getContract()` | `contracts.ts` | Fetch single with relations |
| `createContract()` | `contracts.ts` | Create draft contract |
| `updateContract()` | `contracts.ts` | Update contract |
| `deleteContract()` | `contracts.ts` | Cascade delete |
| `sendContract()` | `contracts.ts` | Send to signers, trigger emails |
| `duplicateContract()` | `contracts.ts` | Clone contract |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | Org context |
| Contract | findMany | Contracts with relations |
| ContractTemplate | findMany | Templates for reference |
| ContractSigner | include | Signers with status |
| Client | include | Client details |
| ContractAuditLog | include | Action history |
| ContractSignature | include | Signature data |

**Include Structure:**
```prisma
Contract.include = {
  client: true,
  signers: { orderBy: { sortOrder: "asc" } },
  template: { select: { id, name } }
}
```

**Client Features:**
- Client-side search (name, client, email, template)
- Status filter tabs with counts
- Status summary cards
- Signer progress indicator
- Bulk PDF export via API
- Contract table with click-to-view

**Email Flow:**
```
sendContract() → for each signer:
  → Generate unique signingToken
  → sendContractSigningEmail()
  → Signing URL: /sign/{token}
```

---

### `/contracts/templates` ❌ 🔒

*To be mapped*

---

## Services & Products

### `/services` ❌ 🔒

**Page:** `src/app/(dashboard)/services/page.tsx`

*To be mapped*

---

### `/services/addons` ❌ 🔒

*To be mapped*

---

### `/services/bundles` ❌ 🔒

*To be mapped*

---

## Orders

### `/orders` ❌ 🔒

**Page:** `src/app/(dashboard)/orders/page.tsx`
**Client:** `orders-page-client.tsx`

*To be mapped*

---

### `/order-pages` ❌ 🔒

*To be mapped*

---

## Projects & Tasks

### `/projects` ❌ 🔒

**Page:** `src/app/(dashboard)/projects/page.tsx`
**Client:** `projects-client.tsx`

*To be mapped*

---

## Properties

### `/properties` ❌ 🔒

**Page:** `src/app/(dashboard)/properties/page.tsx`

*To be mapped*

---

## Portfolios

### `/portfolios` ❌ 🔒

**Page:** `src/app/(dashboard)/portfolios/page.tsx`

*To be mapped*

---

## Questionnaires & Forms

### `/questionnaires` ❌ 🔒

**Page:** `src/app/(dashboard)/questionnaires/page.tsx`

*To be mapped*

---

### `/forms` ❌ 🔒

**Page:** `src/app/(dashboard)/forms/page.tsx`

*To be mapped*

---

## Leads & CRM

### `/leads` ❌ 🔒

**Page:** `src/app/(dashboard)/leads/page.tsx`
**Client:** `leads-page-client.tsx`

*To be mapped*

---

### `/leads/analytics` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/leads/analytics/page.tsx`
**Client:** `leads-analytics-client.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `leads/analytics/page.tsx` | Server component, fetch analytics |
| Client | `leads/analytics/leads-analytics-client.tsx` | Charts, funnel, trends |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getLeadsAnalytics()` | `leads-analytics.ts` | Aggregate lead data |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PortfolioInquiry | findMany | Portfolio website leads |
| WebsiteChatInquiry | findMany | Chat widget leads |
| BookingFormSubmission | findMany | Booking form leads |
| Client | findMany | Conversion tracking |

**Analytics Data Returned:**
```typescript
interface LeadsAnalytics {
  summary: {
    totalLeads, newLeads, contactedLeads, qualifiedLeads,
    closedLeads, convertedToClients, conversionRate,
    avgResponseTimeHours, leadsThisMonth, leadsLastMonth,
    monthOverMonthChange
  };
  bySource: Array<{ source, sourceType, count, converted, conversionRate }>;
  byStatus: Array<{ status, count, percentage }>;
  monthly: Array<{ month, monthLabel, portfolio, chat, booking, total, converted }>;
  funnel: { new, contacted, qualified, converted };
  recentConversions: Array<{ id, name, email, source, sourceType, convertedAt }>;
}
```

---

### `/brokerages` ❌ 🔒

**Page:** `src/app/(dashboard)/brokerages/page.tsx`

*To be mapped*

---

## Settings

### `/settings` ❌ 🔒

**Page:** `src/app/(dashboard)/settings/page.tsx`

*To be mapped*

---

### `/settings/profile` ❌ 🔒

*To be mapped*

---

### `/settings/team` ❌ 🔒

*To be mapped*

---

### `/settings/branding` ❌ 🔒

*To be mapped*

---

### `/settings/payments` ❌ 🔒

**Client:** `payments-settings-client.tsx`

*To be mapped*

---

### `/settings/gallery-templates` ❌ 🔒

*To be mapped*

---

### `/settings/integrations` ❌ 🔒

*To be mapped*

---

### `/settings/developer` ❌ 🔒

*To be mapped*

---

### `/settings/mls-presets` ❌ 🔒

**Page:** `src/app/(dashboard)/settings/mls-presets/page.tsx`

*To be mapped*

---

## Public Routes

### `/g/[slug]` ❌ 🌐

**Page:** `src/app/g/[slug]/page.tsx`

Public gallery view.

*To be mapped*

---

### `/p/[slug]` ❌ 🌐

**Page:** `src/app/p/[slug]/page.tsx`

Property website.

*To be mapped*

---

### `/portfolio/[slug]` ❌ 🌐

**Page:** `src/app/portfolio/[slug]/page.tsx`

Portfolio website.

*To be mapped*

---

### `/book/[slug]` ❌ 🌐

**Page:** `src/app/book/[slug]/page.tsx`

Public booking form.

*To be mapped*

---

### `/pay/[id]` ❌ 🌐

**Page:** `src/app/pay/[id]/page.tsx`

Payment page.

*To be mapped*

---

### `/sign/[token]` ❌ 🌐

**Page:** `src/app/sign/[token]/page.tsx`

Contract signing.

*To be mapped*

---

## Client Portal

### `/portal` ❌ 🔒

**Page:** `src/app/(client-portal)/portal/page.tsx`
**Client:** `portal-client.tsx`

*To be mapped*

---

### `/portal/questionnaires/[id]` ❌ 🔒

**Page:** `src/app/(client-portal)/portal/questionnaires/[id]/page.tsx`
**Client:** `questionnaire-form.tsx`

*To be mapped*

---

## API Routes

### Webhooks

| Route | File | Purpose |
|-------|------|---------|
| `/api/webhooks/clerk` | ❌ | Clerk auth webhooks |
| `/api/webhooks/stripe` | ❌ | Stripe payment webhooks |

### Gallery

| Route | File | Purpose |
|-------|------|---------|
| `/api/gallery/[id]/proof-sheet` | ❌ | Generate proof sheet PDF |
| `/api/gallery/[id]/analytics-report` | ❌ | Generate analytics PDF |
| `/api/gallery/verify-password` | ❌ | Verify gallery password |
| `/api/gallery/rating` | ❌ | Photo rating |
| `/api/gallery/comment` | ❌ | Comments |
| `/api/gallery/favorite` | ❌ | Favorites |
| `/api/gallery/feedback` | ❌ | Feedback |

### Bulk Operations

| Route | File | Purpose |
|-------|------|---------|
| `/api/download/batch` | ❌ | Batch photo downloads |
| `/api/invoices/bulk-pdf` | ❌ | Bulk invoice PDFs |
| `/api/contracts/bulk-pdf` | ❌ | Bulk contract PDFs |

### Other

| Route | File | Purpose |
|-------|------|---------|
| `/api/calendar/ical/[token]` | ❌ | iCal feed |
| `/api/forms/submit` | ❌ | Form submission |
| `/api/images/process` | ❌ | Image processing |
| `/api/upload/presigned` | ❌ | S3 presigned URLs |

---

## Server Action Index

Quick reference of all 129 server action files by domain.

### Core CRUD Actions

| File | Primary Models | Key Functions |
|------|---------------|---------------|
| `galleries.ts` | Project, Asset | create, update, delete, deliver, archive |
| `invoices.ts` | Invoice, InvoiceLineItem | create, send, markPaid, reminder |
| `clients.ts` | Client | create, update, delete, merge |
| `bookings.ts` | Booking | create, confirm, cancel, reschedule |
| `contracts.ts` | Contract, ContractTemplate | create, send, sign |
| `orders.ts` | Order, OrderItem | create, fulfill |
| `products.ts` | Service, ServiceAddon | create, update, pricing |
| `projects.ts` | Project, Task | create, update, manage |
| `payments.ts` | Payment, PaymentPlan | record, refund |

### Gallery Related

| File | Purpose |
|------|---------|
| `gallery-activity.ts` | Activity tracking |
| `gallery-addons.ts` | Add-on requests |
| `gallery-analytics.ts` | Analytics data |
| `gallery-collections.ts` | Collection management |
| `gallery-expiration.ts` | Expiration handling |
| `gallery-feedback.ts` | Client feedback |
| `gallery-reminders.ts` | Expiration reminders |
| `gallery-templates.ts` | Template management |
| `smart-collections.ts` | AI-powered collections |

### Invoice Related

| File | Purpose |
|------|---------|
| `invoice-analytics.ts` | Invoice metrics |
| `invoice-attachments.ts` | File attachments |
| `invoice-email-templates.ts` | Email templates |
| `invoice-payments.ts` | Payment processing |
| `invoice-pdf.ts` | PDF generation |
| `invoice-presets.ts` | Invoice templates |
| `invoice-splits.ts` | Split payments |
| `invoice-templates.ts` | Template management |
| `recurring-invoices.ts` | Recurring management |
| `estimates.ts` | Estimate management |
| `credit-notes.ts` | Credit notes |
| `retainers.ts` | Retainer management |
| `payment-plans.ts` | Payment plans |
| `discount-codes.ts` | Discount codes |

### Client Related

| File | Purpose |
|------|---------|
| `client-auth.ts` | Portal authentication |
| `client-communications.ts` | Communication history |
| `client-import.ts` | CSV import |
| `client-merge.ts` | Duplicate merging |
| `client-notifications.ts` | Notification prefs |
| `client-portal.ts` | Portal data |
| `client-questionnaires.ts` | Questionnaire assignments |
| `client-selections.ts` | Photo selections |
| `client-tags.ts` | Tagging system |

### Booking Related

| File | Purpose |
|------|---------|
| `booking-crew.ts` | Crew assignment |
| `booking-forms.ts` | Form management |
| `booking-import.ts` | Import bookings |
| `booking-types.ts` | Booking type config |
| `availability.ts` | Availability rules |
| `team-availability.ts` | Team scheduling |
| `self-booking.ts` | Self-booking portal |
| `waitlist.ts` | Waitlist management |

### Integrations

| File | Purpose |
|------|---------|
| `slack.ts` | Slack |
| `dropbox.ts` | Dropbox |
| `google-calendar.ts` | Google Calendar |
| `stripe-checkout.ts` | Stripe Checkout |
| `stripe-connect.ts` | Stripe Connect |
| `email-accounts.ts` | Email accounts |
| `email-sync.ts` | Email sync |
| `sms.ts` | SMS (Twilio) |

---

## Progress Tracker

| Section | Routes | Mapped | Percentage |
|---------|--------|--------|------------|
| Dashboard Core | 6 | 1 | 17% |
| Galleries | 7 | 1 | 14% |
| Invoices & Billing | 12 | 1 | 8% |
| Clients | 6 | 1 | 17% |
| Scheduling | 10 | 1 | 10% |
| Contracts | 7 | 1 | 14% |
| Services | 9 | 0 | 0% |
| Orders | 6 | 0 | 0% |
| Projects | 3 | 0 | 0% |
| Properties | 4 | 0 | 0% |
| Portfolios | 3 | 0 | 0% |
| Questionnaires | 7 | 0 | 0% |
| Leads | 6 | 1 | 17% |
| Settings | 35 | 0 | 0% |
| Public | 15 | 0 | 0% |
| Client Portal | 3 | 0 | 0% |
| API Routes | 58 | 0 | 0% |
| **TOTAL** | **192** | **7** | **4%** |

---

*This document is auto-generated from source code analysis. See [TRUTH_LEDGER.md](./TRUTH_LEDGER.md) for verification status.*
