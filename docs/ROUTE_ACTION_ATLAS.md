# PhotoProOS Route-to-Action Atlas

A comprehensive mapping of every route to its data flow: Route → Page → Client → Actions → Models.

**Last Updated:** 2026-01-06
**Total Routes Mapped:** 193 / 193
**Verification Status:** COMPLETE (100%)

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
17. [Field Operations](#field-operations)
18. [Client Portal](#client-portal)
19. [API Routes](#api-routes)

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

### `/analytics` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/analytics/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `analytics/page.tsx` | Server component, parallel data fetch |
| Client | `analytics/analytics-dashboard-client.tsx` | Charts, metrics, export |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getDashboardAnalytics()` | `analytics.ts` | Monthly revenue, projects, clients, invoice status |
| `getRevenueForecast()` | `analytics.ts` | Pending invoices, payment rates, projections |
| `getClientLTVMetrics()` | `analytics.ts` | Lifetime value, top clients, at-risk |
| `generateAnalyticsReportPdf()` | `analytics-report.ts` | PDF export with React PDF |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | Org details, theming |
| Invoice | aggregate | Sum/count by status, monthly |
| Payment | aggregate | Revenue by month/year |
| Project | count | Project counts by date range |
| Client | findMany | LTV calculations with relations |

**Metrics Displayed:**
- This Month Revenue, YTD Revenue
- New Clients, Projects count
- Pending/Overdue Invoices
- Revenue Trend (actual vs projected)
- Top 5 Clients by Revenue
- LTV Summary (Avg LTV, Repeat Rate)

---

### `/inbox` ✅ 🔒 🔄

**Page:** `src/app/(dashboard)/inbox/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `inbox/page.tsx` | Server component, fetch accounts/threads |
| Client | `inbox/inbox-page-client.tsx` | Thread list, conversation view, compose |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `triggerEmailSync()` | `email-sync.ts` | Manually sync emails |
| `getEmailThread()` | `email-sync.ts` | Fetch thread with messages |
| `markThreadRead()` | `email-sync.ts` | Mark read/unread |
| `toggleThreadStar()` | `email-sync.ts` | Star/unstar thread |
| `toggleThreadArchive()` | `email-sync.ts` | Archive/unarchive |
| `sendEmailReply()` | `email-sync.ts` | Reply to thread |
| `sendNewEmail()` | `email-sync.ts` | Compose new email |
| `linkThreadToClient()` | `email-sync.ts` | Link to CRM |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| EmailAccount | findMany | Connected Gmail/Outlook accounts |
| EmailThread | findMany | Conversations with filters |
| EmailMessage | include | Messages within threads |
| EmailAttachment | include | Attached files |
| Client | include | Linked client context |

**Features:**
- Multi-account support (Gmail, Outlook)
- Filter by: All, Unread, Starred, Archived
- Thread search
- Compose modal
- Attachment viewing
- Client linking

---

### `/notifications` ✅ 🔒

**Page:** `src/app/(dashboard)/notifications/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `notifications/page.tsx` | Server component, fetch notifications + activity |
| Client | `notifications/notifications-page-client.tsx` | Tabs, filters, mark read actions |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getNotifications()` | `notifications.ts` | Fetch notifications (limit 100) |
| `markNotificationAsRead()` | `notifications.ts` | Mark single as read |
| `markAllNotificationsAsRead()` | `notifications.ts` | Mark all as read |
| `getUnreadNotificationCount()` | `notifications.ts` | Badge count |
| `deleteNotification()` | `notifications.ts` | Delete single |
| `deleteReadNotifications()` | `notifications.ts` | Cleanup read |
| `getActivityLogs()` | `activity.ts` | Fetch activity logs |
| `getActivityFeed()` | `activity.ts` | Filtered activity feed |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Notification | findMany, update, delete | Notification CRUD |
| ActivityLog | findMany | Activity history |
| User | include | Activity author info |

**Notification Types:**
- Payments: `payment_received`, `payment_failed`
- Galleries: `gallery_viewed`, `gallery_delivered`
- Bookings: `booking_created`, `booking_confirmed`, `booking_cancelled`
- Contracts: `contract_sent`, `contract_signed`
- Invoices: `invoice_sent`, `invoice_paid`, `invoice_overdue`
- Leads: `lead_received`, `client_added`
- System: `task_automation`, `system`

**Features:**
- Notifications/Activity Log tabs
- 8 filter categories with counts
- Mark as read (single + all)
- Virtual list for performance
- Activity grouping by date

---

### `/create` ✅ 🔒

**Page:** `src/app/(dashboard)/create/page.tsx`
**Dynamic:** Default dynamic (no cache)

| Layer | File | Purpose |
|-------|------|---------|
| Page | `create/page.tsx` | Server component, fetch wizard data |
| Client | `create/create-wizard-client.tsx` | 5-step wizard UI |
| Steps | `create-wizard/steps/*.tsx` | ClientStep, ServicesStep, GalleryStep, SchedulingStep, ReviewStep |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getWizardData()` | `create-wizard.ts` | Fetch clients, services, locations, booking types |
| `createProjectBundle()` | `create-wizard.ts` | Transaction: create client/gallery/booking/invoice |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Client | findMany, findFirst, create | Client lookup + creation |
| Service | findMany | Available services |
| BookingType | findMany | Booking type dropdown |
| Location | findMany | Location dropdown |
| Project | create | Gallery record |
| ProjectService | createMany | Link services |
| DeliveryLink | create | Gallery slug (nanoid) |
| Booking | create | Optional booking |
| Invoice | create | Optional invoice |

**Wizard Steps:**
1. **Client** - Select existing or create new
2. **Services** - Multi-select with primary
3. **Gallery** - Name, description, password
4. **Scheduling** - Optional booking + invoice
5. **Review** - Summary before submit

**Transaction Features:**
- `prisma.$transaction()` for atomicity
- Duplicate email check
- Auto-generated invoice number
- Auto-generated delivery slug
- 30-day default due date

**Cache Invalidation:**
- `/galleries`, `/clients`, `/scheduling`, `/payments`

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

### `/galleries/new` ✅ 🔒

**Page:** `src/app/(dashboard)/galleries/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `galleries/new/page.tsx` | Server component, 3-column layout |
| Client | `galleries/new/gallery-new-form.tsx` | Multi-section creation form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createGallery()` | `galleries.ts` | Create gallery with all settings |
| `getClients()` | `clients.ts` | Client dropdown |
| `getGalleryTemplates()` | `gallery-templates.ts` | Template presets |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Project | create | Gallery record |
| ProjectService | createMany | Service associations |
| DeliveryLink | create | Public sharing link |
| ActivityLog | create | Creation event |
| Client | findMany | Client selection |
| GalleryTemplate | findMany | Template presets |
| Service | findMany | Service options |

**Form Sections:**
1. **Template Selector** - Default template support
2. **Gallery Details** - Name, description, client
3. **Service & Pricing** - Service selection with custom options
4. **Access Control** - Public/password-protected
5. **Settings Toggles:**
   - Downloads enabled
   - Favorites enabled
   - Comments enabled
   - Watermarks
   - Notifications
6. **Download Resolution** - Full, web, both
7. **Gallery Expiration** - Never, 30/60/90 days, custom

**Features:**
- Auto-generate unique delivery slug
- Cover image upload placeholder
- Sidebar with tips and recent clients
- Stats display

---

### `/galleries/[id]` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/galleries/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `galleries/[id]/page.tsx` | Server component, fetch gallery + invoices + analytics |
| Client | `galleries/[id]/gallery-detail-client.tsx` | Multi-tab UI (photos, collections, chat, analytics) |
| Actions | `galleries/[id]/gallery-actions.tsx` | Dropdown menu (proof sheet, export, delete) |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getGallery()` | `galleries.ts` | Fetch gallery with all relations |
| `getClientInvoices()` | `invoices.ts` | Client's invoices |
| `getGalleryDownloadAnalytics()` | `download-tracking.ts` | Download stats |
| `deliverGallery()` | `galleries.ts` | Change status, send email |
| `updateGallery()` | `galleries.ts` | Update settings |
| `duplicateGallery()` | `galleries.ts` | Clone gallery |
| `archiveGallery()` | `galleries.ts` | Archive/unarchive |
| `reorderPhotos()` | `galleries.ts` | Update sort order |
| `deletePhoto()` | `galleries.ts` | Remove photo + R2 files |
| `bulkToggleWatermark()` | `galleries.ts` | Batch watermark update |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Project | findUnique | Gallery data (status, pricing) |
| Asset | include | Photos with URLs, EXIF |
| DeliveryLink | include | Public gallery slug |
| GalleryCollection | include | Collection groupings |
| GalleryFavorite | include | Client selections |
| GalleryComment | include | Client comments |
| ActivityLog | include | Event history |
| Client | include | Client details |
| Service | include | Service info |
| Invoice | findMany | Related invoices |
| DownloadLog | aggregate | Download analytics |

**Tabs:**
Photos | Collections | Selections | Chat | Financials | Activity | Analytics | Downloads | Settings | Invoices | Addons

---

### `/galleries/[id]/edit` ✅ 🔒

**Page:** `src/app/(dashboard)/galleries/[id]/edit/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `galleries/[id]/edit/page.tsx` | Server component, parallel data fetch |
| Client | `galleries/[id]/edit/gallery-edit-form.tsx` | Form with service selector, settings, expiration |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getGallery()` | `galleries.ts` | Fetch gallery with relations |
| `updateGallery()` | `galleries.ts` | Save gallery changes |
| `deleteGallery()` | `galleries.ts` | Delete gallery and assets |

**Page-Level Queries:**
```prisma
Service.findMany({ where: { organizationId, isActive: true }, orderBy: { sortOrder: "asc" } })
Client.findMany({ where: { organizationId }, select: { id, fullName, company, email }, take: 50 })
```

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Project | findUnique | Gallery data with relations |
| Service | findMany | Service options for pricing |
| Client | findMany | Client dropdown options |
| Asset | include | Photo count, thumbnails |
| ActivityLog | include | Recent activity sidebar |

**Client State:**
- `name`, `description` - Gallery details
- `clientId` - Selected client
- `selectedService`, `price` - Service and pricing
- `accessType` - public or password
- `settings` - allowDownloads, allowFavorites, showWatermarks, emailNotifications
- `expirationType` - never, 30days, 60days, 90days, custom
- `customExpirationDate` - For custom expiration

**Features:**
- Service selector with database services
- Client dropdown with recent clients
- Access control (public vs password)
- Cover image upload/replace
- Gallery settings toggles
- Expiration date selection
- Delete with confirmation modal
- Status sidebar (delivered/pending/draft)
- Stats sidebar (photos, views, downloads)
- Recent activity display

---

### `/galleries/services` ✅ 🔒 ↪️

**Page:** `src/app/(dashboard)/galleries/services/page.tsx`

**Status:** Redirect to `/services`

Legacy navigation path that redirects to the consolidated services page.

---

### `/galleries/services/new` ✅ 🔒 ↪️

**Page:** `src/app/(dashboard)/galleries/services/new/page.tsx`

**Status:** Redirect to `/services/new`

Legacy navigation path that redirects to create service page.

---

### `/galleries/services/[id]` ✅ 🔒 ↪️

**Page:** `src/app/(dashboard)/galleries/services/[id]/page.tsx`

**Status:** Redirect to `/services/[id]`

Legacy navigation path that redirects to service edit page.

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

### `/invoices/new` ✅ 🔒

**Page:** `src/app/(dashboard)/invoices/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `invoices/new/page.tsx` | Server component, optional order context |
| Client | `invoices/new/invoice-form.tsx` | Client selection, line items |

**Query Params:** `?fromOrder=` (pre-fill from order)

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createInvoice()` | `invoices.ts` | Create with line items |
| `getOrder()` | `orders.ts` | Pre-fill from order (if fromOrder) |

**Page-Level Queries:**
```prisma
client.findMany({ select: { id, fullName, company, email } })
service.findMany({ where: { isActive: true }, select: { id, name, priceCents } })
```

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Client | findMany | Dropdown options |
| Service | findMany | Quick-add services |
| Invoice | create | New invoice record |
| InvoiceLineItem | create | Line items (nested create) |
| ActivityLog | create | Audit trail |

**Form Fields:**
- Client selection (required)
- Line items (dynamic add/remove)
- Due date (default: 30 days)
- Notes (optional)
- Terms & Conditions (optional)

**Line Item Types (LineItemType enum):**
- service, travel, custom, tax, discount, other

**Invoice Number Format:**
- `INV-YYYY-####` (e.g., INV-2024-0001)

**Invoice Status Flow:**
`draft` → `sent` → `partial` → `paid` | `overdue` | `cancelled`

**Cache Invalidation:**
- `/invoices`

---

### `/invoices/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/invoices/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `invoices/[id]/page.tsx` | Server component, full invoice detail |
| Client | `invoices/[id]/invoice-actions.tsx` | Status updates, send, PDF, record payment |
| Client | `invoices/[id]/invoice-split-section.tsx` | Agent/brokerage split configuration |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `updateInvoiceStatus()` | `invoices.ts` | Change status (draft→sent→paid) |
| `deleteInvoice()` | `invoices.ts` | Delete draft invoices |
| `generateInvoicePdf()` | `invoices.ts` | Generate PDF for download |
| `sendInvoice()` | `invoices.ts` | Send email with PDF attachment |
| `createInvoiceSplit()` | `invoice-splits.ts` | Create agent/brokerage split |
| `getInvoiceSplit()` | `invoice-splits.ts` | Fetch split configuration |
| `deleteInvoiceSplit()` | `invoice-splits.ts` | Remove split |
| `previewInvoiceSplit()` | `invoice-splits.ts` | Preview split amounts |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Invoice | findUnique | Full invoice with relations |
| InvoiceLineItem | include | Line items (ordered by sortOrder) |
| Client | include | Client with brokerage |
| Booking | include | Booking-related line items |
| Organization | include | Org context |

**Invoice Status Flow:**
`draft` → `sent` → `partial` → `paid` | `overdue` | `cancelled`

**Split Options:**
- Percentage split (e.g., 70/30)
- Dual invoice (separate invoices to agent/brokerage)

---

### `/invoices/recurring` ✅ 🔒

**Page:** `src/app/(dashboard)/invoices/recurring/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `invoices/recurring/page.tsx` | Server component with Suspense |
| Client | `invoices/recurring/recurring-invoices-client.tsx` | List, create modal, stats |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getRecurringInvoices()` | `recurring-invoices.ts` | Fetch all with client info |
| `createRecurringInvoice()` | `recurring-invoices.ts` | Create with line items + schedule |
| `pauseRecurringInvoice()` | `recurring-invoices.ts` | Pause subscription |
| `resumeRecurringInvoice()` | `recurring-invoices.ts` | Resume paused |
| `deleteRecurringInvoice()` | `recurring-invoices.ts` | Delete subscription |
| `getRecurringInvoice()` | `recurring-invoices.ts` | Single by ID |
| `getRecurringInvoicesDueToRun()` | `recurring-invoices.ts` | Fetch due for cron |
| `createInvoiceFromRecurring()` | `recurring-invoices.ts` | Auto-generate invoice |
| `processRecurringInvoices()` | `recurring-invoices.ts` | Process all due |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| RecurringInvoice | findMany, create, update, delete | Subscription CRUD |
| Client | include | Customer info |
| Invoice | create | Generated invoices |

**Frequency Options:**
`weekly` | `biweekly` | `monthly` | `quarterly` | `yearly`

**RecurringInvoice Fields:**
- Schedule: `dayOfMonth`, `dayOfWeek`, `anchorDate`, `nextRunDate`
- Status: `isActive`, `isPaused`, `pausedAt`, `pauseUntil`
- Financials: `subtotalCents`, `taxCents`, `totalCents`, `currency`
- Line items stored as JSON
- History: `invoicesCreated`, `lastInvoiceAt`, `lastInvoiceId`
- Termination: `endDate`, `maxInvoices`

**Stats Displayed:**
- Active Subscriptions count
- Paused count
- Estimated Monthly Revenue
- Total Invoices Created

---

### `/billing/analytics` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/billing/analytics/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `billing/analytics/page.tsx` | Server component, period comparison |
| Client | `billing/analytics/date-range-filter.tsx` | Date range selection |

**Query Params:** `?range=`, `?start=`, `?end=`

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Invoice | aggregate | Period invoiced amounts |
| Payment | aggregate, groupBy | Period collected, top clients |
| Client | findMany | Top clients details |

**Metrics:**
- Period comparison (selected vs previous)
- Accounts Receivable Aging (5 buckets)
- Top 5 Clients by Revenue
- Monthly Revenue (12-month chart)

---

### `/billing/credit-notes` ✅ 🔒

**Page:** `src/app/(dashboard)/billing/credit-notes/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `billing/credit-notes/page.tsx` | Server component, status filter |
| Client | `billing/credit-notes/credit-notes-page-client.tsx` | List, search, pagination |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createCreditNote()` | `credit-notes.ts` | Create credit note |
| `getCreditNote()` | `credit-notes.ts` | Fetch single |
| `voidCreditNote()` | `credit-notes.ts` | Void/cancel |
| `issueCreditNote()` | `credit-notes.ts` | Issue draft |
| `applyCreditNote()` | `credit-notes.ts` | Apply to invoice |
| `refundCreditNote()` | `credit-notes.ts` | Refund to client |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| CreditNote | findMany, create, update | Credit note CRUD |
| Client | include | Client details |
| Invoice | include | Original + applied invoice |

**Status Flow:** `draft` → `issued` → `applied`/`refunded`/`voided`

---

### `/billing/estimates` ✅ 🔒

**Page:** `src/app/(dashboard)/billing/estimates/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `billing/estimates/page.tsx` | Server component, fetch estimates |
| Client | `billing/estimates/estimates-list-client.tsx` | List, filters, bulk actions |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createEstimate()` | `estimates.ts` | Create with line items |
| `updateEstimate()` | `estimates.ts` | Update details |
| `deleteEstimate()` | `estimates.ts` | Delete draft |
| `sendEstimate()` | `estimates.ts` | Send to client |
| `generateEstimateNumber()` | `estimates.ts` | Auto-generate EST-#### |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Estimate | findMany | All estimates with relations |
| EstimateLineItem | include | Line items |
| Client | include | Client details |
| Invoice | include | Conversion tracking |

**Status Flow:** `draft` → `sent` → `viewed` → `approved`/`rejected`/`expired` → `converted`

---

### `/billing/retainers` ✅ 🔒

**Page:** `src/app/(dashboard)/billing/retainers/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `billing/retainers/page.tsx` | Server component, filter param |
| Client | `billing/retainers/retainers-page-client.tsx` | Grid/table, deposit modal |

**Query Params:** `?filter=` (all, active, inactive, low_balance)

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createRetainer()` | `retainers.ts` | Create with initial deposit |
| `getRetainer()` | `retainers.ts` | Fetch by id or clientId |
| `listRetainers()` | `retainers.ts` | List with filters |
| `addDeposit()` | `retainers.ts` | Add deposit |
| `applyToInvoice()` | `retainers.ts` | Apply balance to invoice |
| `updateRetainer()` | `retainers.ts` | Update settings |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ClientRetainer | findMany | Retainer accounts |
| Client | include | Client details |
| RetainerTransaction | include | Transaction history |

**Stats Displayed:**
- Total Balance, Total Deposited, Total Used
- Low Balance Alerts count

---

### `/billing/credit-notes/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/billing/credit-notes/[id]/page.tsx`
**Dynamic:** `params: Promise<{ id: string }>`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `billing/credit-notes/[id]/page.tsx` | Server component, fetch credit note |
| Client | `billing/credit-notes/[id]/credit-note-actions.tsx` | Issue, apply, refund, void actions |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `issueCreditNote()` | `credit-notes.ts` | Issue a draft credit note |
| `applyCreditNoteToInvoice()` | `credit-notes.ts` | Apply credit to invoice |
| `markCreditNoteRefunded()` | `credit-notes.ts` | Mark as refunded |
| `voidCreditNote()` | `credit-notes.ts` | Void the credit note |
| `deleteCreditNote()` | `credit-notes.ts` | Delete draft |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| CreditNote | findFirst | Credit note with client, invoices |
| Invoice | findMany | Available invoices (sent/overdue) |

**Features:**
- Credit note detail display with status badge
- Balance breakdown (applied, refunded, available)
- Apply credit modal with invoice selection
- Timeline showing events
- Related invoice linking
- Action buttons based on status

---

### `/billing/estimates/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/billing/estimates/[id]/page.tsx`
**Dynamic:** `params: Promise<{ id: string }>`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `billing/estimates/[id]/page.tsx` | Server component, fetch estimate |
| Client | `billing/estimates/[id]/estimate-actions.tsx` | Send, convert, delete actions |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `sendEstimate()` | `estimates.ts` | Send estimate to client |
| `deleteEstimate()` | `estimates.ts` | Delete draft estimate |
| `convertEstimateToInvoice()` | `estimates.ts` | Create invoice from approved |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Estimate | findFirst | Estimate with lineItems, client, convertedToInvoice |

**Features:**
- Estimate status with expiration checks
- Line items table (quantity, unit price, total)
- Subtotal, discount, tax, grand total
- Notes and terms display
- Expiration banner with warning
- Conversion banner when estimate → invoice
- Client sidebar
- Quick actions: Edit, Duplicate, Convert

---

### `/billing/estimates/[id]/edit` ✅ 🔒

**Page:** `src/app/(dashboard)/billing/estimates/[id]/edit/page.tsx`
**Dynamic:** `params: Promise<{ id: string }>`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `billing/estimates/[id]/edit/page.tsx` | Server component, fetch for edit |
| Client | `billing/estimates/[id]/edit/edit-estimate-form.tsx` | Full estimate form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| (form submission) | `estimates.ts` | Update estimate |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Estimate | findFirst | Estimate with lineItems, client |
| Client | findMany | Clients for dropdown |
| Service | findMany | Active services for quick-add |

**Features:**
- Pre-populated edit form
- Status check (redirect if not draft)
- Line item editing with service catalog
- Client selection dropdown
- Tax and discount configuration

---

### `/billing/retainers/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/billing/retainers/[id]/page.tsx`
**Dynamic:** `params: Promise<{ id: string }>`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `billing/retainers/[id]/page.tsx` | Server component, fetch retainer |
| Client | `billing/retainers/[id]/retainer-actions.tsx` | Deposit, apply, refund, settings |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `addDeposit()` | `retainers.ts` | Add funds to retainer |
| `applyToInvoice()` | `retainers.ts` | Apply balance to invoice |
| `refundFromRetainer()` | `retainers.ts` | Refund from balance |
| `updateRetainer()` | `retainers.ts` | Update settings |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ClientRetainer | findFirst | Retainer with client, transactions |
| Invoice | findMany | Available invoices (sent/overdue) |

**Features:**
- Current balance with low-balance warning
- Balance metrics (deposited, used, threshold)
- Transaction history table (50 recent)
- Type badges (deposit, usage, refund, adjustment)
- Multiple action modals
- Status badge (Active/Inactive)
- Deactivate/Activate toggle

---

### `/billing/reports` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/billing/reports/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `billing/reports/page.tsx` | Server component, tax aggregations |
| Client | `billing/reports/export-buttons.tsx` | CSV/PDF export |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Invoice | aggregate | Tax by period (month/quarter/YTD) |
| Invoice | groupBy | Tax by client |
| Client | findMany | Client details for report |

**Reports Generated:**
- Tax Summary (This Month, Quarter, YTD)
- Monthly Tax Breakdown table
- Tax by Client breakdown
- Quarterly Estimates (Q1-Q4)

---

### `/payments` ✅ 🔒

**Page:** `src/app/(dashboard)/payments/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `payments/page.tsx` | Server component, stats + filtered list |
| Client | `payments/payments-page-client.tsx` | Search, sort, bulk actions, export |

**Query Params:** `?status=` (all, paid, pending, overdue)

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPayments()` | `payments.ts` | Fetch filtered payments with relations |

**Page-Level Queries (Promise.all):**
```prisma
payment.findMany({ where: { status }, include: { project } })
payment.aggregate({ where: { status: "paid", createdAt: thisMonth } }) // Monthly total
payment.aggregate({ where: { status: "pending" } }) // Pending amount
payment.aggregate({ where: { status: "overdue" } }) // Overdue amount
payment.groupBy({ by: ["status"], _count: true }) // Tab counts
```

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Payment | findMany, aggregate, groupBy | Filtered list + metrics |
| Project | include | Gallery/project name |

**Client State:**
- `searchQuery` - filter by project name, description, email
- `sortOption` - newest, oldest, amountHigh, amountLow
- `dateRangeFilter` - all, 7days, 30days, 90days
- `selectedIds` - bulk selection

**Features:**
- Stats cards: Monthly paid, Pending, Overdue
- Status tabs with counts
- Virtual list rendering
- Bulk CSV export
- Bulk PDF receipts

---

### `/payments/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/payments/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `payments/[id]/page.tsx` | Server component, 3-column layout |
| Client | `payments/[id]/payment-actions.tsx` | Receipt, reminder, refund, export |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPayment()` | `payments.ts` | Fetch payment with relations |
| `generateReceiptPdf()` | `receipt-pdf.ts` | Generate PDF receipt |
| `sendPaymentReminder()` | `payments.ts` | Send reminder email |
| `issueRefund()` | `payments.ts` | Process Stripe refund |
| `exportPaymentsToCSV()` | `payments.ts` | Single payment CSV |
| `getPaymentLinkUrl()` | `payments.ts` | Generate payment URL |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Payment | findFirst | Full payment with relations |
| Project | include | Gallery/project info |
| Client | include | Customer details |
| ActivityLog | create | Log interactions |

**Payment Status:** `pending` | `paid` | `failed` | `refunded` | `overdue`

**Features:**
- Status-specific actions (paid: receipt, pending: reminder)
- Refund modal with reason input
- Fee breakdown (3% processing)
- Stripe transaction ID display
- Activity timeline
- Client sidebar with avatar
- Gallery link

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

### `/clients/new` ✅ 🔒

**Page:** `src/app/(dashboard)/clients/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `clients/new/page.tsx` | Server component, stats sidebar |
| Client | `clients/new/client-new-form.tsx` | Multi-field form, validation |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createClient()` | `clients.ts` | Create client with duplicate check |

**Page-Level Queries (Promise.all):**
```prisma
client.count({ where: { organizationId } })
client.groupBy({ by: ["industry"], _count: { industry: true }, take: 5 })
client.aggregate({ _sum: { lifetimeRevenueCents: true } })
client.count({ where: { projects OR bookings this month } })
```

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Client | findFirst | Duplicate email check |
| Client | create | New client record |
| ActivityLog | create | Audit trail |

**Form Fields:**
- Required: firstName, lastName, email, industry
- Optional: phone, company, address1, address2, city, state, zip, notes

**Validation:**
- Email regex validation
- Duplicate email check server-side
- Field-level error display

**Industry Options (ClientIndustry enum):**
- real_estate, commercial, architecture, wedding, events, headshots, portrait, product, food_hospitality, other

**Post-Submit Options:**
- Navigate to `/clients/{id}`
- Create gallery: `/galleries/new?client={id}`

**Cache Invalidation:**
- `/clients`, `/dashboard`

---

### `/clients/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/clients/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `clients/[id]/page.tsx` | Server component, 3-column layout |
| Client | `clients/[id]/client-actions.tsx` | Delete, add to project, portal impersonation |
| Client | `clients/[id]/client-email-preferences.tsx` | Toggle communication prefs |
| Client | `clients/[id]/client-activity-timeline.tsx` | Activity feed |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `deleteClient()` | `clients.ts` | Delete with cascade |
| `impersonateClientPortal()` | `clients.ts` | Create portal session |
| `createTaskFromClient()` | `projects.ts` | Create project task |
| `updateClientEmailPreferences()` | `clients.ts` | Toggle email/SMS prefs |
| `getClientEmailLogs()` | `email-logs.ts` | Recent email history |
| `getClientEmailHealth()` | `email-logs.ts` | Bounce/failure check |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Client | findUnique | Client with all relations |
| Project | include | Galleries with asset counts |
| Booking | include | Last 5 bookings |
| ClientTag | include | Tags with colors |
| Payment | findMany | Payment history |
| Invoice | findMany | Client invoices |
| ClientCommunication | findMany | Messages, calls, notes |
| EmailLog | findMany | Email delivery history |

**Communication Preferences:**
- Transactional Emails
- SMS Notifications
- Questionnaire Emails
- Marketing Emails

---

### `/clients/import` ✅ 🔒

**Page:** `src/app/(dashboard)/clients/import/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `clients/import/page.tsx` | Server component, Suspense wrapper |
| Client | `clients/import/client-import-client.tsx` | 4-step import wizard |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `previewClientImport()` | `client-import.ts` | Parse CSV, validate, detect duplicates |
| `importClients()` | `client-import.ts` | Create/update clients |
| `getImportTemplate()` | `client-import.ts` | CSV template download |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Client | findMany | Duplicate detection |
| Client | create, update | Import records |
| ActivityLog | create | Audit trail |

**Import Steps:**
1. Upload CSV file
2. Preview with validation results
3. Import with options
4. Completion summary

**CSV Columns:**
- Required: email
- Optional: fullName, company, phone, address, industry, notes, source, isVIP

**Import Options:**
- Skip duplicates (default)
- Update existing clients

**Validation:**
- Email format regex
- Industry normalization
- Phone digit count warning

---

### `/clients/merge` ✅ 🔒

**Page:** `src/app/(dashboard)/clients/merge/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `clients/merge/page.tsx` | Server component, Suspense wrapper |
| Client | `clients/merge/client-merge-client.tsx` | Duplicate detection, merge UI |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `findDuplicateClients()` | `client-merge.ts` | Detect by email, phone, name |
| `getClientMergePreview()` | `client-merge.ts` | Preview records to transfer |
| `mergeClients()` | `client-merge.ts` | Transfer + delete secondary |
| `getDuplicateCount()` | `client-merge.ts` | Badge count |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Client | findMany, groupBy | Duplicate detection |
| Client | update, delete | Merge operation |
| Project | updateMany | Transfer to primary |
| Booking | updateMany | Transfer to primary |
| Invoice | updateMany | Transfer to primary |
| Contract | updateMany | Transfer to primary |
| Payment | updateMany | Transfer to primary |

**Duplicate Detection:**
- High confidence: Email match, Phone match
- Medium confidence: Name match

**Merge Transaction:**
1. Transfer all relationships to primary
2. Sum metrics (revenue, project count)
3. Append merge notes
4. Delete secondary client

**Records Transferred:**
- Projects, Bookings, Invoices
- Contracts, Tasks, Orders
- Questionnaires, Payments, Communications

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

### `/scheduling/new` ✅ 🔒

**Page:** `src/app/(dashboard)/scheduling/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `scheduling/new/page.tsx` | Server component, fetch clients & services |
| Client | `scheduling/new/booking-new-form.tsx` | Full booking creation form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createBooking()` | `bookings.ts` | Create new booking |
| `checkAvailability()` | `availability.ts` | Validate time slot |
| `getClientsForBooking()` | `clients.ts` | Client dropdown options |
| `getServicesForBooking()` | `services.ts` | Service dropdown options |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Booking | create | New booking record |
| Client | findMany | Client options |
| Service | findMany | Service options |
| AvailabilityBlock | findMany | Conflict check |

**Form Fields:**
- Client selection (or new client inline)
- Service selection
- Date and time
- Duration
- Location/Address
- Notes

**Features:**
- Client search with inline creation
- Service-based duration defaults
- Availability conflict warning
- Recurring booking option

---

### `/scheduling/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/scheduling/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `scheduling/[id]/page.tsx` | Server component, fetch booking |
| Client | `scheduling/[id]/booking-detail-client.tsx` | View, actions |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getBooking()` | `bookings.ts` | Fetch with relations |
| `updateBookingStatus()` | `bookings.ts` | Change status |
| `deleteBooking()` | `bookings.ts` | Cancel/delete booking |
| `sendBookingReminder()` | `bookings.ts` | Email reminder |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Booking | findUnique | Booking with relations |
| Client | include | Client details |
| Service | include | Service details |
| ActivityLog | include | Booking history |

**Features:**
- Booking status display
- Quick status change actions
- Client contact info
- Service details
- Edit/delete actions
- Send reminder

---

### `/scheduling/[id]/edit` ✅ 🔒

**Page:** `src/app/(dashboard)/scheduling/[id]/edit/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `scheduling/[id]/edit/page.tsx` | Server component, fetch booking |
| Client | `scheduling/[id]/edit/booking-edit-form.tsx` | Edit form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getBooking()` | `bookings.ts` | Fetch booking details |
| `updateBooking()` | `bookings.ts` | Save changes |
| `checkAvailability()` | `availability.ts` | Validate new time |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Booking | findUnique, update | Booking CRUD |
| Client | findMany | Client dropdown |
| Service | findMany | Service dropdown |

**Features:**
- Edit all booking fields
- Reschedule with conflict check
- Change client or service
- Update notes

---

### `/scheduling/availability` ✅ 🔒

**Page:** `src/app/(dashboard)/scheduling/availability/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `scheduling/availability/page.tsx` | Server component, fetch blocks + buffers |
| Client | `scheduling/availability/availability-page-client.tsx` | Calendar UI, add blocks, sync |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createAvailabilityBlock()` | `availability.ts` | Create one-time or recurring block |
| `updateAvailabilityBlock()` | `availability.ts` | Update existing block |
| `deleteAvailabilityBlock()` | `availability.ts` | Remove block |
| `getAvailabilityBlocks()` | `availability.ts` | Fetch with filters |
| `upsertBookingBuffer()` | `availability.ts` | Create/update booking buffers |
| `deleteBookingBuffer()` | `availability.ts` | Remove buffers |
| `getExpandedAvailabilityBlocks()` | `availability.ts` | Expand recurring for date ranges |
| `addWeeklyRecurringBlock()` | `availability.ts` | Quick weekly availability |
| `addTimeOffToday()` | `availability.ts` | Same-day time off |
| `submitTimeOffRequest()` | `availability.ts` | Submit pending request |
| `approveTimeOffRequest()` | `availability.ts` | Admin approval |
| `rejectTimeOffRequest()` | `availability.ts` | Admin rejection |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| AvailabilityBlock | findMany, create, update, delete | Block management |
| BookingBuffer | upsert, delete | Buffer settings |
| CalendarIntegration | findFirst | Google Calendar sync |
| TimeOffRequest | create, update | Time-off requests |

**Features:**
- Calendar view with monthly navigation
- One-time and recurring availability blocks
- Booking buffer settings (before/after, min advance, max days)
- Google Calendar sync
- Time-off request workflow

---

### `/scheduling/types` ✅ 🔒

**Page:** `src/app/(dashboard)/scheduling/types/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `scheduling/types/page.tsx` | Server component, auto-seed defaults |
| Client | `scheduling/types/booking-types-client.tsx` | CRUD interface, card layout |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getBookingTypes()` | `booking-types.ts` | Fetch all with booking counts |
| `getBookingType()` | `booking-types.ts` | Single by ID |
| `createBookingType()` | `booking-types.ts` | Create new type |
| `updateBookingType()` | `booking-types.ts` | Update existing |
| `deleteBookingType()` | `booking-types.ts` | Delete with validation |
| `seedDefaultBookingTypes()` | `booking-types.ts` | Auto-populate defaults |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| BookingType | findMany, create, update, delete | Type CRUD |
| Booking | _count | Usage count per type |

**Default Types Seeded:**
- Real Estate Photography
- Portrait Session
- Headshots
- Event Photography

**Features:**
- Active/Inactive status toggle
- Color-coded cards
- Duration and pricing config
- Delete validation (blocks if bookings exist)

---

### `/scheduling/time-off` ✅ 🔒

**Page:** `src/app/(dashboard)/scheduling/time-off/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `scheduling/time-off/page.tsx` | Server component, fetch requests |
| Client | `scheduling/time-off/time-off-page-client.tsx` | Request management |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getTimeOffRequests()` | `availability.ts` | Fetch all requests |
| `getPendingTimeOffRequests()` | `availability.ts` | Pending requests count |
| `submitTimeOffRequest()` | `availability.ts` | Create new request |
| `approveTimeOffRequest()` | `availability.ts` | Admin approval |
| `rejectTimeOffRequest()` | `availability.ts` | Admin rejection |
| `deleteTimeOffRequest()` | `availability.ts` | Remove request |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| TimeOffRequest | findMany, create, update, delete | Request CRUD |
| User | include | Requestor details |
| Organization | findUnique | Admin check |

**Request Statuses:**
- `pending` - Awaiting approval
- `approved` - Approved by admin
- `rejected` - Rejected by admin

**Features:**
- Submit time-off request
- Admin approval workflow
- Calendar view of approved time-off
- Pending requests count badge
- Filter by status
- Delete/cancel requests

---

### `/scheduling/booking-forms` ✅ 🔒

**Page:** `src/app/(dashboard)/scheduling/booking-forms/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `scheduling/booking-forms/page.tsx` | Server component, fetch forms + stats |
| Client | `scheduling/booking-forms/booking-forms-page-client.tsx` | List, search, create modal |
| Edit | `scheduling/booking-forms/[id]/booking-form-edit-client.tsx` | Form builder |
| Submissions | `scheduling/booking-forms/[id]/submissions/submissions-page-client.tsx` | Submission management |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createBookingForm()` | `booking-forms.ts` | Create new form |
| `updateBookingForm()` | `booking-forms.ts` | Update form details |
| `deleteBookingForm()` | `booking-forms.ts` | Delete form |
| `duplicateBookingForm()` | `booking-forms.ts` | Clone existing |
| `toggleBookingFormStatus()` | `booking-forms.ts` | Publish/unpublish |
| `updateBookingFormFields()` | `booking-forms.ts` | Modify form fields |
| `reorderBookingFormFields()` | `booking-forms.ts` | Reorder display |
| `setBookingFormServices()` | `booking-forms.ts` | Assign services |
| `getBookingForms()` | `booking-forms.ts` | Fetch with filters |
| `submitBookingForm()` | `booking-forms.ts` | Client submission |
| `convertSubmissionToBooking()` | `booking-forms.ts` | Convert to booking |
| `rejectSubmission()` | `booking-forms.ts` | Reject submission |
| `getFormSubmissions()` | `booking-forms.ts` | Submissions per form |
| `getAllSubmissions()` | `booking-forms.ts` | All submissions with filters |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| BookingForm | findMany, create, update, delete | Form CRUD |
| BookingFormField | create, update, delete | Form field management |
| BookingFormService | create, delete | Service assignments |
| BookingFormSubmission | findMany, create, update | Submission handling |
| Service | include | Service details |
| Organization | findUnique | Industry context |

**Features:**
- Form builder with dynamic fields
- Service selection per form
- Publish/draft status
- Submission stats (total, views)
- Convert submissions to bookings
- Conflict validation on submit

---

### `/scheduling/booking-forms/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/scheduling/booking-forms/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `scheduling/booking-forms/[id]/page.tsx` | Server component, fetch form |
| Client | `scheduling/booking-forms/[id]/booking-form-edit-client.tsx` | Form builder UI |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getBookingForm()` | `booking-forms.ts` | Fetch form with fields |
| `updateBookingForm()` | `booking-forms.ts` | Update form details |
| `updateBookingFormFields()` | `booking-forms.ts` | Modify fields |
| `reorderBookingFormFields()` | `booking-forms.ts` | Reorder fields |
| `setBookingFormServices()` | `booking-forms.ts` | Assign services |
| `toggleBookingFormStatus()` | `booking-forms.ts` | Publish/unpublish |
| `deleteBookingForm()` | `booking-forms.ts` | Delete form |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| BookingForm | findUnique, update, delete | Form CRUD |
| BookingFormField | create, update, delete | Field management |
| BookingFormService | create, delete | Service links |
| Service | findMany | Available services |

**Field Types Supported:**
- text, textarea, email, phone
- date, time, datetime
- select, multiselect, radio, checkbox
- number, range
- file_upload, signature

**Features:**
- Drag-and-drop field ordering
- Field validation settings
- Conditional logic
- Service assignment
- Preview mode
- Public URL generation

---

### `/scheduling/booking-forms/[id]/submissions` ✅ 🔒

**Page:** `src/app/(dashboard)/scheduling/booking-forms/[id]/submissions/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `scheduling/booking-forms/[id]/submissions/page.tsx` | Server component, fetch submissions |
| Client | `scheduling/booking-forms/[id]/submissions/submissions-page-client.tsx` | Submission list |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getFormSubmissions()` | `booking-forms.ts` | Fetch submissions for form |
| `convertSubmissionToBooking()` | `booking-forms.ts` | Convert to booking |
| `rejectSubmission()` | `booking-forms.ts` | Reject submission |
| `deleteSubmission()` | `booking-forms.ts` | Delete submission |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| BookingFormSubmission | findMany, update, delete | Submission management |
| BookingForm | include | Form context |
| Service | include | Service details |

**Submission Statuses:**
- `pending` - Awaiting review
- `approved` - Converted to booking
- `rejected` - Declined

**Features:**
- Submission list with status filters
- View submission details
- Convert to booking (creates Booking record)
- Reject with reason
- Export submissions
- Submission metrics

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

### `/contracts/new` ✅ 🔒

**Page:** `src/app/(dashboard)/contracts/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `contracts/new/page.tsx` | Server component, fetch clients & templates |
| Client | `contracts/new/contract-form-client.tsx` | Full contract creation form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createContract()` | `contracts.ts` | Create draft contract |

**Page-Level Queries:**
```prisma
Client.findMany({ where: { organizationId }, orderBy: { fullName: "asc" } })
ContractTemplate.findMany({ where: { organizationId }, orderBy: { name: "asc" } })
```

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Client | findMany | Client dropdown options |
| ContractTemplate | findMany | Template selection |
| Contract | create | New contract record |
| ContractSigner | create (nested) | Signers for contract |

**Form Fields:**
- Title, Client selection
- Template selection (pre-fills content)
- Contract content (rich text)
- Signers (name, email, sort order)
- Effective date

**Features:**
- Template dropdown with content preview
- Client dropdown with recent clients
- Multiple signers support
- Rich text editor for content
- Variable substitution from template

---

### `/contracts/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/contracts/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `contracts/[id]/page.tsx` | Server component, fetch contract |
| Client | `contracts/[id]/contract-detail-client.tsx` | View, send, actions |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getContract()` | `contracts.ts` | Fetch with all relations |
| `sendContract()` | `contracts.ts` | Send to signers |
| `duplicateContract()` | `contracts.ts` | Clone contract |
| `deleteContract()` | `contracts.ts` | Delete contract |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Contract | findUnique | Contract with relations |
| ContractSigner | include | Signer status |
| ContractSignature | include | Signature data |
| Client | include | Client details |
| ContractAuditLog | include | Action history |

**Features:**
- Contract status display (draft/sent/signed/expired)
- Signer progress tracker
- Send to signers action
- PDF download
- Edit/duplicate/delete actions
- Audit log display

---

### `/contracts/[id]/edit` ✅ 🔒

**Page:** `src/app/(dashboard)/contracts/[id]/edit/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `contracts/[id]/edit/page.tsx` | Server component, fetch contract |
| Client | `contracts/[id]/edit/contract-edit-client.tsx` | Edit form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getContract()` | `contracts.ts` | Fetch contract details |
| `updateContract()` | `contracts.ts` | Save changes |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Contract | findUnique, update | Contract CRUD |
| ContractSigner | deleteMany, create | Signer management |
| Client | findMany | Client dropdown |

**Features:**
- Edit contract content
- Update signers
- Change effective date
- Only editable in draft status

---

### `/contracts/templates` ✅ 🔒

**Page:** `src/app/(dashboard)/contracts/templates/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `contracts/templates/page.tsx` | Server component, auto-seed defaults |
| Client | `contracts/templates/templates-list-client.tsx` | Search, duplicate, delete |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getContractTemplates()` | `contract-templates.ts` | Fetch all with contract counts |
| `seedDefaultContractTemplates()` | `contract-templates.ts` | Seed 5 system templates |
| `duplicateContractTemplate()` | `contract-templates.ts` | Clone template |
| `deleteContractTemplate()` | `contract-templates.ts` | Delete (system protected) |
| `getContractTemplateById()` | `contract-templates.ts` | Single template details |
| `useContractTemplate()` | `contract-templates.ts` | Create contract from template |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ContractTemplate | findMany, create, update, delete | Template CRUD |
| Contract | _count | Usage count per template |

**Default Templates Seeded:**
- Wedding Photography
- Portrait Photography
- Event Photography
- Real Estate Photography
- Corporate Photography

**Features:**
- System templates (protected from delete)
- Custom template creation
- Variable substitution ({{client_name}}, {{date}}, etc.)
- Contract count per template
- Search and filter

---

### `/contracts/templates/new` ✅ 🔒

**Page:** `src/app/(dashboard)/contracts/templates/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `contracts/templates/new/page.tsx` | Server component, render form |
| Client | `contracts/templates/template-form-client.tsx` | Full template form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createContractTemplate()` | `contract-templates.ts` | Create new template |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ContractTemplate | create | New template record |

**Form Fields:**
- Name, Description
- Content (rich text with variables)
- Default signers

**Variable Support:**
- `{{client_name}}` - Client full name
- `{{client_email}}` - Client email
- `{{date}}` - Current date
- `{{photographer_name}}` - Photographer name
- `{{company_name}}` - Organization name

**Features:**
- Rich text editor for content
- Variable insertion buttons
- Preview mode
- Breadcrumb navigation

---

### `/contracts/templates/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/contracts/templates/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `contracts/templates/[id]/page.tsx` | Server component, fetch template |
| Client | `contracts/templates/template-form-client.tsx` | Edit mode form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getContractTemplateById()` | `contract-templates.ts` | Fetch template details |
| `updateContractTemplate()` | `contract-templates.ts` | Save changes |
| `deleteContractTemplate()` | `contract-templates.ts` | Delete template |
| `duplicateContractTemplate()` | `contract-templates.ts` | Clone template |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ContractTemplate | findUnique, update, delete | Template CRUD |
| Contract | _count | Usage count |

**Features:**
- Edit template content
- Usage count display
- Duplicate to clone
- Delete with usage warning
- System templates are read-only

---

## Services & Products

### `/services` ✅ 🔒

**Page:** `src/app/(dashboard)/services/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `services/page.tsx` | Server component, fetch services, seed defaults |
| Client | `services/services-page-client.tsx` | Search, sort, filter, grid/list views, multi-select |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getServices()` | `services.ts` | Fetch all services with filters |
| `seedDefaultServices()` | `services.ts` | Create default service templates |
| `createService()` | `services.ts` | Create new service |
| `updateService()` | `services.ts` | Update existing service |
| `deleteService()` | `services.ts` | Delete/archive service |
| `toggleServiceStatus()` | `services.ts` | Toggle isActive flag |
| `bulkToggleServiceStatus()` | `services.ts` | Batch status toggle |
| `bulkArchiveServices()` | `services.ts` | Batch archive |
| `bulkDeleteServices()` | `services.ts` | Batch delete |
| `setServicePricingTiers()` | `services.ts` | Configure tiered pricing |
| `calculateServicePrice()` | `services.ts` | Calculate price (fixed/per_sqft/tiered) |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Service | findMany, create, update, delete | Service CRUD |
| ServicePricingTier | findMany, create, delete | Tiered pricing tiers |
| Organization | findUnique | Org context |

**Pricing Methods:**
- `fixed` - Single price
- `per_sqft` - Price per square foot with min/max
- `tiered` - Multiple pricing tiers with ranges

**Stripe Sync Fields:**
- `stripeProductId`, `stripePriceId`, `stripeSyncedAt`

---

### `/services/new` ✅ 🔒

**Page:** `src/app/(dashboard)/services/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `services/new/page.tsx` | Server component, render form |
| Client | `service-form.tsx` | Full service form with pricing |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createService()` | `services.ts` | Create new service |
| `setServicePricingTiers()` | `services.ts` | Configure tiered pricing |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Service | create | New service record |
| ServicePricingTier | create | Pricing tiers (nested) |

**Form Fields:**
- Name, Category, Description
- Pricing method (fixed / per_sqft / tiered)
- Duration, Deliverables
- Active status

**Features:**
- Tips sidebar for guidance
- Template link for inspiration
- Breadcrumb navigation
- Sqft-based pricing configuration
- Tiered pricing with ranges

---

### `/services/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/services/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `services/[id]/page.tsx` | Server component, fetch service with pricing |
| Client | `service-form.tsx` | Edit mode form |
| Client | `service-quick-actions.tsx` | Toggle status, duplicate, delete |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getServiceWithPricing()` | `services.ts` | Fetch service with pricing tiers |
| `updateService()` | `services.ts` | Update service |
| `deleteService()` | `services.ts` | Delete service |
| `toggleServiceStatus()` | `services.ts` | Toggle active status |
| `duplicateService()` | `services.ts` | Clone service |
| `setServicePricingTiers()` | `services.ts` | Update pricing tiers |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Service | findUnique, update, delete | Service CRUD |
| ServicePricingTier | findMany, create, delete | Pricing tier management |

**Features:**
- Usage stats sidebar
- Quick actions (toggle, duplicate, delete)
- Template warning for system services
- Breadcrumb navigation
- Edit form with all pricing options

---

### `/services/addons` ✅ 🔒

**Page:** `src/app/(dashboard)/services/addons/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `services/addons/page.tsx` | Server component, fetch addons |
| Client | `addon-list.tsx` | Grid display, CRUD operations |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getAddons()` | `addons.ts` | Fetch all with filters, usage counts |
| `createAddon()` | `addons.ts` | Create new addon |
| `updateAddon()` | `addons.ts` | Update addon |
| `deleteAddon()` | `addons.ts` | Delete or archive if in use |
| `toggleAddonStatus()` | `addons.ts` | Toggle isActive |
| `setAddonCompatibility()` | `addons.ts` | Set compatible services |
| `reorderAddons()` | `addons.ts` | Reorder display order |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ServiceAddon | findMany, create, update, delete | Addon CRUD |
| ServiceAddonCompat | create, deleteMany | Service compatibility |
| Service | findMany | Compatible services |
| OrderItem | _count | Usage count |

**Addon Trigger Types:**
- `always` - Always show
- `with_service` - Show with specific service
- `cart_threshold` - Show when cart exceeds amount

**Features:**
- Context navigation (Services / Bundles / Addons)
- Active/Inactive count in subtitle
- Grid display with pricing
- Service compatibility assignment
- One-time vs recurring addons
- Usage count tracking

---

### `/services/addons/new` ✅ 🔒

**Page:** `src/app/(dashboard)/services/addons/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `services/addons/new/page.tsx` | Server component, render form |
| Client | `addon-form.tsx` | Full addon form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createAddon()` | `addons.ts` | Create new addon |
| `getServices()` | `services.ts` | Fetch available services for compatibility |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ServiceAddon | create | New addon record |
| ServiceAddonCompat | create | Service compatibility |
| Service | findMany | Available services |

**Features:**
- Name, description, pricing
- Trigger type (always/with_service/cart_threshold)
- Service compatibility selection
- One-time vs recurring

---

### `/services/addons/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/services/addons/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `services/addons/[id]/page.tsx` | Server component, fetch addon |
| Client | `addon-form.tsx` | Edit mode form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getAddon()` | `addons.ts` | Fetch addon with relations |
| `updateAddon()` | `addons.ts` | Update addon |
| `deleteAddon()` | `addons.ts` | Delete addon |
| `setAddonCompatibility()` | `addons.ts` | Update service compatibility |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ServiceAddon | findUnique, update, delete | Addon CRUD |
| ServiceAddonCompat | deleteMany, create | Compatibility management |
| Service | findMany | Available services |
| OrderItem | _count | Usage validation |

**Features:**
- Edit addon details
- Update service compatibility
- Usage count display
- Delete with usage warning

---

### `/services/bundles` ✅ 🔒

**Page:** `src/app/(dashboard)/services/bundles/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `services/bundles/page.tsx` | Server component, fetch bundles |
| Client | `bundle-list.tsx` | Grid display, CRUD operations |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getBundles()` | `bundles.ts` | Fetch all with services, usage counts |
| `createBundle()` | `bundles.ts` | Create new bundle |
| `updateBundle()` | `bundles.ts` | Update bundle |
| `deleteBundle()` | `bundles.ts` | Delete or archive if in use |
| `duplicateBundle()` | `bundles.ts` | Clone bundle |
| `toggleBundleStatus()` | `bundles.ts` | Toggle isActive |
| `setBundleServices()` | `bundles.ts` | Set included services |
| `calculateBundleSavings()` | `bundles.ts` | Update originalPrice, savingsPercent |
| `setBundlePricingTiers()` | `bundles.ts` | Configure tiered pricing |
| `calculateBundlePrice()` | `bundles.ts` | Calculate price based on sqft |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ServiceBundle | findMany, create, update, delete | Bundle CRUD |
| ServiceBundleItem | create, deleteMany | Services in bundle |
| BundlePricingTier | findMany, create | Tiered pricing |
| Service | findMany | Available services |
| OrderItem | _count | Usage count |
| OrderPage | _count | Usage in order pages |

**Bundle Types:**
- `fixed` - Fixed price bundle
- `tiered_sqft` - Square footage-based pricing

**Pricing Methods:**
- `fixed` - Single price
- `per_sqft` - Price per square foot
- `tiered` - Tiered pricing (BICEP-style)

**Stripe Integration:**
- Auto-sync to Stripe Product Catalog
- `stripeProductId`, `stripePriceId`
- Archive/reactivate on status change

**Features:**
- Context navigation (Services / Bundles / Addons)
- Active/Inactive count in subtitle
- Original price vs bundle price display
- Savings percentage calculation
- Service composition display
- Badge text support ("Best Value", etc.)
- Public/private visibility

---

### `/services/bundles/new` ✅ 🔒

**Page:** `src/app/(dashboard)/services/bundles/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `services/bundles/new/page.tsx` | Server component, fetch services |
| Client | `bundle-form.tsx` | Full bundle form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createBundle()` | `bundles.ts` | Create new bundle |
| `getServices()` | `services.ts` | Fetch services for inclusion |
| `setBundleServices()` | `bundles.ts` | Set included services |
| `calculateBundleSavings()` | `bundles.ts` | Calculate savings percentage |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ServiceBundle | create | New bundle record |
| ServiceBundleItem | create | Services in bundle |
| Service | findMany | Available services |
| BundlePricingTier | create | Pricing tiers |

**Features:**
- Name, description, badge text
- Service selection with quantities
- Original vs bundle price calculation
- Savings percentage display
- Tiered pricing option
- Public/private visibility

---

### `/services/bundles/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/services/bundles/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `services/bundles/[id]/page.tsx` | Server component, fetch bundle |
| Client | `bundle-form.tsx` | Edit mode form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getBundle()` | `bundles.ts` | Fetch bundle with services |
| `updateBundle()` | `bundles.ts` | Update bundle |
| `deleteBundle()` | `bundles.ts` | Delete bundle |
| `duplicateBundle()` | `bundles.ts` | Clone bundle |
| `setBundleServices()` | `bundles.ts` | Update included services |
| `toggleBundleStatus()` | `bundles.ts` | Toggle active status |
| `setBundlePricingTiers()` | `bundles.ts` | Update pricing tiers |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ServiceBundle | findUnique, update, delete | Bundle CRUD |
| ServiceBundleItem | deleteMany, create | Service management |
| BundlePricingTier | findMany, create, delete | Tier management |
| OrderItem | _count | Usage validation |

**Features:**
- Edit bundle details
- Update service composition
- Pricing tier configuration
- Usage count display
- Delete with usage warning
- Duplicate to clone

---

### `/products` ✅ 🔒

**Page:** `src/app/(dashboard)/products/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `products/page.tsx` | Server component, auth check, fetch catalogs |
| Client | `products/products-client.tsx` | Search, filter, create catalog form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `listProductCatalogs()` | `products.ts` | Fetch catalogs with product counts |
| `createProductCatalog()` | `products.ts` | Create new catalog |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ProductCatalog | findMany with _count | List catalogs with product aggregation |

**Features:**
- Catalog grid with status badges
- Summary metrics (Total, Active, Drafts, Products)
- Status filter pills (All, Active, Draft, Archived)
- Live search (name, description, tags)
- Create catalog form (name, description)

---

### `/products/[catalogId]` ✅ 🔒

**Page:** `src/app/(dashboard)/products/[catalogId]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `products/[catalogId]/page.tsx` | Server component, fetch catalog by ID |
| Client | `products/[catalogId]/catalog-client.tsx` | Product CRUD, variants, photo attachment |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getProductCatalog()` | `products.ts` | Fetch catalog with all products |
| `createProduct()` | `products.ts` | Create SKU product |
| `attachPhotoToProduct()` | `products.ts` | Attach asset to product/angle |
| `updateProductStatus()` | `products.ts` | Update product workflow status |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ProductCatalog | findFirst | Catalog with nested relations |
| ProductItem | include | Products with status, angles |
| ProductVariant | include | Color/size variants |
| ProductPhoto | include | Photos with angle tags |
| Asset | include | Image URLs, metadata |

**Product Status Workflow:**
`pending` → `shot` → `edited` → `approved` → `delivered` → `archived`

**Features:**
- Product table (SKU, status, angles, photos, variants)
- Angle requirement tracking
- Variant management (color, size)
- Photo attachment with angle tagging
- Primary photo selection
- Ownership validation chain

---

## Orders

### `/orders` ✅ 🔒

**Page:** `src/app/(dashboard)/orders/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `orders/page.tsx` | Server component, order stats, status filter tabs |
| Client | `orders/orders-table-client.tsx` | List/Kanban views, search, sort, bulk CSV export |

**Query Params:** `?status=` (pending, paid, completed, cancelled)

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getOrders()` | `orders.ts` | Fetch orders with filters (auth required) |
| `getOrder()` | `orders.ts` | Single order with full details |
| `updateOrder()` | `orders.ts` | Update order status/info |
| `cancelOrder()` | `orders.ts` | Cancel with optional Stripe refund |
| `getOrderStats()` | `orders.ts` | Summary stats for dashboard |
| `getSqftAnalytics()` | `orders.ts` | Square footage pricing analytics |
| `createOrder()` | `orders.ts` | Create from cart (public) |
| `createOrderCheckoutSession()` | `orders.ts` | Generate Stripe checkout (public) |
| `verifyOrderPayment()` | `orders.ts` | Verify Stripe payment, update status |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Order | findMany, findUnique, update | Order CRUD |
| OrderItem | include | Line items (service/bundle/addon) |
| OrderPage | include | Order page configuration |
| Client | include | Customer details |
| Location | include | Delivery location |
| DiscountCode | include | Applied discount |
| Service | include | Service details on items |
| ServiceBundle | include | Bundle details on items |

**Order Status Enum:**
`cart` → `pending` → `paid` → `processing` → `completed` | `cancelled`

**Client Features:**
- List and Kanban board views
- Drag-and-drop status changes in Kanban
- Virtual list for performance
- Search, sort (newest, oldest, amount, date), date range filter
- Bulk selection with CSV export

---

### `/orders/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/orders/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `orders/[id]/page.tsx` | Server component, fetch order with relations |
| Client | `orders/[id]/order-actions.tsx` | Status dropdown, action buttons |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getOrder()` | `orders.ts` | Fetch order with full relations |
| `updateOrder()` | `orders.ts` | Update status |
| `cancelOrder()` | `orders.ts` | Cancel with optional refund |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Order | findUnique | Order with all relations |
| OrderItem | include | Line items (service/bundle details) |
| OrderPage | include | Source page metadata |
| Client | include | Customer linked record |
| Invoice | include | Linked invoice if exists |
| Booking | include | Linked booking if exists |

**Features:**
- Status badge with formatted labels
- Customer information card
- Order items breakdown with sqft and pricing tier
- Subtotal, discount, tax, total calculations
- Scheduling preferences (date, time, notes)
- Internal notes display
- Payment status card
- Linked records sidebar (Invoice, Booking, Client, Order Page)
- Timeline (submission, payment events)
- Status transition dropdown

---

### `/orders/analytics` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/orders/analytics/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `orders/analytics/page.tsx` | Server component, fetch sqft analytics |
| Client | `orders/analytics/sqft-analytics-client.tsx` | Charts, metrics, tier breakdown |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getSqftAnalytics()` | `orders.ts` | Square footage pricing analytics |
| `getServices()` | `services.ts` | Services with sqft pricing |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Order | findMany | Orders with sqft data |
| OrderItem | include | Line items with sqft |
| Service | findMany | Services with pricingMethod |
| ServicePricingTier | include | Tier configurations |

**Analytics Displayed:**
- Average square footage per order
- Square footage distribution chart
- Revenue by pricing tier
- Most popular tier analysis
- Service breakdown by sqft method
- Tier utilization rates

---

### `/order-pages` ✅ 🔒

**Page:** `src/app/(dashboard)/order-pages/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `order-pages/page.tsx` | Server component, fetch order pages grid |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getOrderPages()` | `order-pages.ts` | Fetch pages with filters, counts |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| OrderPage | findMany | Pages with relations |
| Client | select | Client name display |
| OrderPageBundle | include | Bundle count |
| OrderPageService | include | Service count |
| Order | _count | Total orders |

**Features:**
- Grid layout with status badges (Published/Draft)
- Metrics: bundle count, service count, orders
- Client assignment display
- Create page CTA

---

### `/order-pages/new` ✅ 🔒

**Page:** `src/app/(dashboard)/order-pages/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `order-pages/new/page.tsx` | Server component, create form layout |
| Client | `order-page-form.tsx` | Tabbed form (Content, Products, Settings) |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createOrderPage()` | `order-pages.ts` | Create with slug uniqueness check |
| `setOrderPageBundles()` | `order-pages.ts` | Associate bundles |
| `setOrderPageServices()` | `order-pages.ts` | Associate services |
| `getBundles()` | `bundles.ts` | Load available bundles |
| `getServices()` | `services.ts` | Load available services |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| OrderPage | create | New order page |
| ServiceBundle | findMany | Bundle selection |
| Service | findMany | Service selection |
| OrderPageBundle | createMany | Bundle associations |
| OrderPageService | createMany | Service associations |

**Form Tabs:**
1. **Content** - Name, slug, headline, hero image, testimonials
2. **Products** - Bundle & service selection
3. **Settings** - Branding, contact, SEO, publication

**Features:**
- Testimonial management (add/edit/remove)
- Logo URL + primary color override
- Show/hide phone/email toggles
- Meta title/description for SEO
- Published + Require Login toggles

---

### `/order-pages/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/order-pages/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `order-pages/[id]/page.tsx` | Server component, fetch by ID |
| Client | `order-page-form.tsx` | Edit form with initialData |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getOrderPage()` | `order-pages.ts` | Fetch with all relations |
| `updateOrderPage()` | `order-pages.ts` | Update with validation |
| `deleteOrderPage()` | `order-pages.ts` | Delete or archive |
| `setOrderPageBundles()` | `order-pages.ts` | Replace bundles |
| `setOrderPageServices()` | `order-pages.ts` | Replace services |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| OrderPage | findFirst, update | Page CRUD |
| OrderPageBundle | include | Associated bundles |
| OrderPageService | include | Associated services |
| Order | _count | Archive logic check |

**Features:**
- Stats sidebar (Orders, Products, Views)
- Quick actions (View Public, Copy Link)
- Status indicator (Live/Unpublished)
- Archive vs Delete logic (orders present = archive)
- Delete confirmation modal

---

## Projects & Tasks

### `/projects` ✅ 🔒

**Page:** `src/app/(dashboard)/projects/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `projects/page.tsx` | Server component, parallel data fetch, transform to client types |
| Client | `projects/projects-client.tsx` | Kanban board, task management, templates, automation (3504 lines) |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getOrCreateDefaultBoard()` | `projects.ts` | Initialize main task board |
| `createBoard()` | `projects.ts` | Create new board |
| `createColumn()` | `projects.ts` | Add column to board |
| `reorderColumns()` | `projects.ts` | Drag-drop column order |
| `createTask()` | `projects.ts` | Create task |
| `updateTask()` | `projects.ts` | Update task fields |
| `moveTask()` | `projects.ts` | Move between columns |
| `deleteTask()` | `projects.ts` | Delete task |
| `addSubtask()` | `projects.ts` | Add subtask |
| `toggleSubtask()` | `projects.ts` | Complete/uncomplete subtask |
| `addComment()` | `projects.ts` | Add task comment |
| `bulkMoveTasks()` | `projects.ts` | Batch move tasks |
| `bulkUpdatePriority()` | `projects.ts` | Batch priority change |
| `getTaskTemplates()` | `projects.ts` | Fetch reusable templates |
| `createTaskFromTemplate()` | `projects.ts` | Create from template |
| `getAutomations()` | `projects.ts` | Fetch automation rules |
| `createAutomation()` | `projects.ts` | Create automation rule |
| `getRecurringTasks()` | `projects.ts` | Fetch recurring definitions |
| `createRecurringTask()` | `projects.ts` | Create recurring task |
| `startTimeTracking()` | `projects.ts` | Start timer |
| `stopTimeTracking()` | `projects.ts` | Stop timer, record entry |
| `getTaskAnalytics()` | `projects.ts` | Task stats and trends |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| TaskBoard | findMany, create, update | Board management |
| TaskColumn | findMany, create, update, delete | Column management |
| Task | findMany, create, update, delete | Task CRUD |
| TaskSubtask | create, update, delete | Subtask management |
| TaskComment | create, delete | Comments |
| TaskTemplate | findMany, create | Reusable templates |
| TaskAutomation | findMany, create, update | Automation rules |
| RecurringTask | findMany, create, update | Recurring definitions |
| TaskTimeEntry | create, update | Time tracking |
| User | findMany | Team members for assignment |
| Client | findMany | Client linking |
| Project | findMany | Gallery linking |

**Client Features:**
- Full Kanban board with drag-drop
- Task detail modal with subtasks, comments, time tracking
- Column settings (color, limit, auto-archive)
- Template library for reusable task sets
- Automation rules (triggers → actions)
- Recurring tasks (daily, weekly, monthly, custom)
- Time tracking with active timers
- Task dependencies with cycle detection
- Priority badges (urgent, high, medium, low)
- Timeline view

---

### `/projects/analytics` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/projects/analytics/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `projects/analytics/page.tsx` | Server component, fetch analytics data |
| Client | `projects/analytics/projects-analytics-client.tsx` | Charts, metrics visualization |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getTaskAnalytics()` | `projects.ts` | Aggregate task completion metrics |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Task | aggregate | Completion rates by status |
| TaskSubtask | aggregate | Subtask completion tracking |
| TaskTimeEntry | aggregate | Time tracking analytics |

**Metrics Displayed:**
- Task completion rates by status
- Productivity metrics (completed vs total)
- Team member performance
- Project velocity and burndown
- Time tracking analytics
- Priority distribution
- Task aging metrics

**Features:**
- Context navigation (Board ↔ Analytics)
- Empty state handling
- Time range selection

---

### `/projects/tasks/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/projects/tasks/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `projects/tasks/[id]/page.tsx` | Server component, fetch task with relations |
| Client | `projects/tasks/[id]/task-detail-client.tsx` | Full task management UI |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getTask()` | `projects.ts` | Fetch task with all relations |
| `getTeamMembers()` | `settings.ts` | For assignee dropdown |
| `getClients()` | `clients.ts` | For client linking |
| `getGalleries()` | `galleries.ts` | For project linking |
| `updateTask()` | `projects.ts` | Update task fields |
| `addSubtask()` | `projects.ts` | Add subtask |
| `toggleSubtask()` | `projects.ts` | Toggle subtask completion |
| `deleteSubtask()` | `projects.ts` | Remove subtask |
| `addComment()` | `projects.ts` | Add task comment |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Task | findUnique | Task with all relations |
| TaskSubtask | include | Subtasks (ordered by position) |
| TaskComment | include | Comments with authors |
| User | include | Assignee details |
| Client | include | Linked client |
| Project | include | Linked gallery |
| Booking | include | Linked booking |
| Invoice | include | Linked invoice |
| PropertyWebsite | include | Linked property |

**Features:**
- Full task details (title, description, status, priority)
- Subtask management (create, toggle, delete, reorder)
- Comment system with timestamps
- Time tracking (estimated vs actual)
- Due date and start date management
- Links to related entities
- Breadcrumb navigation
- Priority badges with color coding

---

## Properties

### `/properties` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/properties/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `properties/page.tsx` | Server component, three views via query param |
| Client (list) | `properties/properties-page-client.tsx` | Stats cards, grid display |
| Client (grid) | `properties/properties-client.tsx` | Multi-select, batch actions, virtual list |
| Client (leads) | `properties/leads-view-client.tsx` | Lead table, status management |
| Client (analytics) | `properties/analytics-view-client.tsx` | Charts, property performance |

**Query Params:** `?view=` (default=list, leads, analytics)

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPropertyWebsites()` | `property-websites.ts` | All properties with project count |
| `createPropertyWebsite()` | `property-websites.ts` | Create with auto-slug |
| `updatePropertyWebsite()` | `property-websites.ts` | Update details |
| `togglePropertyWebsitePublish()` | `property-websites.ts` | Publish/unpublish |
| `deletePropertyWebsite()` | `property-websites.ts` | Single delete |
| `deletePropertyWebsites()` | `property-websites.ts` | Batch delete |
| `publishPropertyWebsites()` | `property-websites.ts` | Batch publish/unpublish |
| `duplicatePropertyWebsite()` | `property-websites.ts` | Clone property |
| `getAllPropertyLeads()` | `property-websites.ts` | All leads across properties |
| `updateLeadStatus()` | `property-websites.ts` | Update lead status |
| `getAggregateAnalytics()` | `property-websites.ts` | Dashboard aggregate data |
| `getPropertyAnalytics()` | `property-websites.ts` | Single property analytics |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PropertyWebsite | findMany, create, update, delete | Property CRUD |
| PropertyLead | findMany, update | Lead management |
| PropertyAnalytics | findMany, aggregate | Daily analytics |
| PropertyWebsiteView | findMany | Detailed view tracking |
| PropertyWebsiteSection | findMany, create, update | Section-based layouts |
| Project | include | Gallery/asset connection |
| Asset | include | Property images |

**Lead Status Flow:**
`new` → `contacted` → `qualified` → `closed`

**Analytics Metrics:**
- Page views, unique visitors, tour clicks
- Photo views, social shares
- Device breakdown (mobile/desktop/tablet)
- Traffic sources (direct/social/email/search)
- Conversion rate tracking

**Client Features:**
- Multi-view dashboard (Properties, Leads, Analytics)
- Grid layout with property cards
- Multi-select batch operations
- Virtual list for performance
- Lead table with status dropdown
- Activity charts with time range selector

---

### `/properties/new` ✅ 🔒

**Page:** `src/app/(dashboard)/properties/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `properties/new/page.tsx` | Server component, fetch available projects |
| Client | `properties/new/new-property-website-client.tsx` | Property creation form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getProjectsWithoutPropertyWebsite()` | `property-websites.ts` | Unlinked projects for dropdown |
| `createPropertyWebsite()` | `property-websites.ts` | Create with auto-slug |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Project | findMany | Projects without property website |
| Client | include | Project client info |
| Asset | include | Cover images |
| PropertyWebsite | create | New property record |

**Form Fields:**
- Address, city, state, zip
- Price, beds, baths, sqft, lot size, year built
- Property type (residential, commercial, land, etc.)
- Template selection (modern, classic, luxury, minimalist)
- Content (headline, description, features, virtual tour, video)
- Branding (show price, show agent, logo)
- SEO (meta title, meta description)
- Open house scheduling
- Project linking

---

### `/properties/[id]` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/properties/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `properties/[id]/page.tsx` | Server component, fetch property with analytics |
| Client | `properties/[id]/property-detail-client.tsx` | Overview, leads, analytics |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPropertyWebsiteById()` | `property-websites.ts` | Property with full relations |
| `getPropertyLeads()` | `property-websites.ts` | Leads for this property |
| `getPropertyAnalytics()` | `property-websites.ts` | 7-day performance analytics |
| `updateLeadStatus()` | `property-websites.ts` | Update lead status |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PropertyWebsite | findUnique | Property with sections, marketing kit |
| PropertyLead | findMany | Leads (status, source, contact) |
| PropertyAnalytics | findMany | 7-day analytics window |
| PropertyWebsiteView | findMany | View tracking |
| Project | include | Gallery, client, assets |

**Features:**
- Property overview with address and details
- Performance metrics (views, leads, sources)
- Lead list with status management
- Analytics dashboard (7-day window)
- Publish/unpublish toggle
- Custom domain management
- SEO optimization display
- Edit button linking to edit page

---

### `/properties/[id]/edit` ✅ 🔒

**Page:** `src/app/(dashboard)/properties/[id]/edit/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `properties/[id]/edit/page.tsx` | Server component, fetch for edit |
| Client | `properties/[id]/edit/property-edit-form.tsx` | Edit form with all fields |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPropertyWebsiteById()` | `property-websites.ts` | Pre-populate form |
| `updatePropertyWebsite()` | `property-websites.ts` | Save changes |
| `deletePropertyWebsite()` | `property-websites.ts` | Delete property |
| `togglePropertyWebsitePublish()` | `property-websites.ts` | Publish/unpublish |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PropertyWebsite | findUnique, update, delete | Full property CRUD |
| Project | include | Reference data |

**Features:**
- Pre-populated edit form (all property fields)
- Address and location editing
- Property details editing (price, beds, baths, sqft)
- Content editing (headline, description, features)
- Media management (virtual tour, video, floor plans)
- Design customization (colors, fonts, logo)
- Template switching
- SEO field updates
- Open house scheduling
- Delete with confirmation

---

## Portfolios

### `/portfolios` ✅ 🔒

**Page:** `src/app/(dashboard)/portfolios/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `portfolios/page.tsx` | Server component, fetch portfolio websites |
| Client | Grid layout with portfolio cards | Name, status, project count |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPortfolioWebsites()` | `portfolio-websites.ts` | All portfolios with project count |
| `getPortfolioWebsite()` | `portfolio-websites.ts` | Single with projects, sections |
| `createPortfolioWebsite()` | `portfolio-websites.ts` | Create with slug generation |
| `updatePortfolioWebsite()` | `portfolio-websites.ts` | Update branding/settings |
| `updatePortfolioWebsiteProjects()` | `portfolio-websites.ts` | Manage project associations |
| `publishPortfolioWebsite()` | `portfolio-websites.ts` | Toggle publication status |
| `deletePortfolioWebsite()` | `portfolio-websites.ts` | Delete portfolio |
| `duplicatePortfolioWebsite()` | `portfolio-websites.ts` | Clone with sections/projects |

**Section Management Actions:**
| Action | Purpose |
|--------|---------|
| `createPortfolioSection()` | Add section |
| `updatePortfolioSection()` | Update section config |
| `deletePortfolioSection()` | Remove section |
| `reorderPortfolioSections()` | Change order |
| `duplicatePortfolioSection()` | Clone section |
| `togglePortfolioSectionVisibility()` | Show/hide |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PortfolioWebsite | findMany, create, update, delete | Portfolio CRUD |
| PortfolioWebsiteProject | findMany, create, delete | Portfolio-project links |
| PortfolioWebsiteSection | findMany, create, update | Section management |
| PortfolioWebsiteView | findMany | Analytics tracking |
| PortfolioInquiry | findMany | Contact form submissions |
| Organization | include | Branding context |

**Portfolio Types:**
- `photographer` - Professional portfolio
- `client` - Client-facing portfolio

**Templates:**
`modern` | `bold` | `elegant` | `minimal` | `creative`

**Section Types:**
`hero` | `about` | `gallery` | `services` | `testimonials` | `awards` | `contact` | `faq` | `text` | `image` | `video` | `spacer` | `custom_html`

**Features:**
- Password protection with expiration
- Custom domain with DNS verification
- Scheduled publishing
- Lead capture forms
- Analytics tracking (views, engagement)
- Download watermarking

---

### `/portfolios/new` ✅ 🔒

**Page:** `src/app/(dashboard)/portfolios/new/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `portfolios/new/page.tsx` | Server component, render form |
| Client | `portfolios/new/new-portfolio-client.tsx` | Portfolio creation form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createPortfolioWebsite()` | `portfolio-websites.ts` | Create with name, slug, description |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PortfolioWebsite | create | New portfolio record |

**Form Fields:**
- Name
- Slug (auto-generated from name)
- Description

**Features:**
- Auto-generates slug from name
- URL preview showing `/portfolio/{slug}`
- Next steps sidebar
- Form validation
- Toast notifications

---

### `/portfolios/[id]` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/portfolios/[id]/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `portfolios/[id]/page.tsx` | Server component, fetch portfolio with analytics |
| Client | `portfolios/[id]/portfolio-editor-client.tsx` | Multi-tab editor |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPortfolioWebsite()` | `portfolio-websites.ts` | Full portfolio with sections, projects |
| `getPortfolioAnalytics()` | `portfolio-websites.ts` | 30-day analytics (views, visitors) |
| `publishPortfolioWebsite()` | `portfolio-websites.ts` | Toggle publication status |
| `initializePortfolioSections()` | `portfolio-websites.ts` | Initialize default sections |
| `duplicatePortfolioWebsite()` | `portfolio-websites.ts` | Clone portfolio |
| `updatePortfolioSection()` | `portfolio-websites.ts` | Update section config |
| `reorderPortfolioSections()` | `portfolio-websites.ts` | Change section order |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PortfolioWebsite | findUnique, update | Portfolio with relations |
| PortfolioWebsiteSection | findMany, create, update | Section management |
| PortfolioWebsiteProject | findMany | Associated projects |
| Project | findMany | Available projects |
| PortfolioAnalytics | aggregate | 30-day metrics |

**Client Tabs:**
1. **Design** - Template selection, branding, colors
2. **Sections** - Drag-drop section management
3. **Projects** - Project association, ordering
4. **Analytics** - Views, visitors, engagement charts
5. **Comments** - Comment moderation
6. **A/B Testing** - Experiment configuration
7. **Settings** - Password, domain, SEO, publishing

**Features:**
- Quick stats bar (views, visitors, last updated)
- Publish/Unpublish toggle
- Live preview panel
- QR code generation modal
- Copy link functionality
- Duplicate portfolio button

---

## Questionnaires & Forms

### `/questionnaires` ✅ 🔒

**Page:** `src/app/(dashboard)/questionnaires/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `questionnaires/page.tsx` | Server component, metadata setup |
| Client | `questionnaires/questionnaires-page-client.tsx` | Templates/Assigned tabs, stats, modals |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getQuestionnaireTemplates()` | `questionnaire-templates.ts` | Fetch all templates (system + org) |
| `getTemplatesByIndustry()` | `questionnaire-templates.ts` | Templates grouped by industry |
| `getClientQuestionnaires()` | `client-questionnaires.ts` | Fetch assigned questionnaires |
| `getQuestionnaireStats()` | `client-questionnaires.ts` | Stats: total, pending, in-progress, completed, overdue |
| `assignQuestionnaireToClient()` | `client-questionnaires.ts` | Assign template to client |
| `getClients()` | `clients.ts` | Clients for assignment modal |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| QuestionnaireTemplate | findMany | System + org templates |
| QuestionnaireField | include | Template fields by type |
| QuestionnaireTemplateAgreement | include | Legal agreements |
| ClientQuestionnaire | findMany, create | Assigned questionnaires |
| Client | findMany | Client lookup |
| Organization | findUnique | Industry context |

**Field Types:**
`text` | `textarea` | `email` | `phone` | `number` | `date` | `time` | `select` | `multiselect` | `radio` | `checkbox` | `file` | `address` | `signature`

**Client Features:**
- Tab navigation (Templates / Assigned)
- Stats cards with counts
- Template grid with industry filtering
- Virtual list for assigned questionnaires
- Status badges and overdue highlighting
- Assignment modal with due date

---

### `/questionnaires/templates/new` ✅ 🔒

**Page:** `src/app/(dashboard)/questionnaires/templates/new/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `questionnaires/templates/new/page.tsx` | Server component, render form |
| Client | `questionnaires/templates/template-editor-client.tsx` | Template builder |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createQuestionnaireTemplate()` | `questionnaire-templates.ts` | Create new template |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| QuestionnaireTemplate | create | New template record |
| QuestionnaireField | create (nested) | Template fields |
| QuestionnaireTemplateAgreement | create (nested) | Agreements |

**Form Fields:**
- Name, Description
- Industry selection
- Fields (14 types)
- Legal agreements

**Features:**
- Drag-and-drop field builder
- 14 field types
- Field validation settings
- Agreement builder
- Preview mode

---

### `/questionnaires/templates/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/questionnaires/templates/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `questionnaires/templates/[id]/page.tsx` | Server component, fetch template |
| Client | `questionnaires/templates/[id]/template-editor-client.tsx` | Edit form |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getQuestionnaireTemplate()` | `questionnaire-templates.ts` | Fetch with fields |
| `updateQuestionnaireTemplate()` | `questionnaire-templates.ts` | Save changes |
| `deleteQuestionnaireTemplate()` | `questionnaire-templates.ts` | Delete template |
| `duplicateQuestionnaireTemplate()` | `questionnaire-templates.ts` | Clone template |
| `addQuestionnaireField()` | `questionnaire-templates.ts` | Add field |
| `updateQuestionnaireField()` | `questionnaire-templates.ts` | Update field |
| `deleteQuestionnaireField()` | `questionnaire-templates.ts` | Remove field |
| `reorderQuestionnaireFields()` | `questionnaire-templates.ts` | Reorder fields |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| QuestionnaireTemplate | findUnique, update, delete | Template CRUD |
| QuestionnaireField | create, update, delete | Field management |
| ClientQuestionnaire | _count | Usage count |

**Features:**
- Edit template details
- Field builder with all types
- System templates are read-only
- Usage count display
- Delete with usage warning

---

### `/questionnaires/templates/[id]/preview` ✅ 🔒

**Page:** `src/app/(dashboard)/questionnaires/templates/[id]/preview/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `questionnaires/templates/[id]/preview/page.tsx` | Server component, fetch template |
| Client | `questionnaires/templates/[id]/preview/preview-client.tsx` | Preview renderer |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getQuestionnaireTemplate()` | `questionnaire-templates.ts` | Fetch template |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| QuestionnaireTemplate | findUnique | Template with fields |
| QuestionnaireField | include | All fields |
| QuestionnaireTemplateAgreement | include | Agreements |

**Features:**
- Full questionnaire preview
- Field rendering by type
- Agreement display
- Mobile-responsive preview
- Back to edit link

---

### `/questionnaires/assigned/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/questionnaires/assigned/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `questionnaires/assigned/[id]/page.tsx` | Server component, fetch assigned |
| Client | `questionnaires/assigned/[id]/response-viewer.tsx` | Response display |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getClientQuestionnaire()` | `client-questionnaires.ts` | Fetch with responses |
| `sendReminder()` | `client-questionnaires.ts` | Send reminder email |
| `markAsComplete()` | `client-questionnaires.ts` | Mark complete |
| `deleteClientQuestionnaire()` | `client-questionnaires.ts` | Remove assignment |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ClientQuestionnaire | findUnique | Assignment with data |
| QuestionnaireTemplate | include | Template details |
| QuestionnaireField | include | Field definitions |
| Client | include | Client info |
| QuestionnaireResponse | include | Client responses |

**Response Statuses:**
- `pending` - Not started
- `in_progress` - Partially filled
- `completed` - All fields filled
- `overdue` - Past due date

**Features:**
- View client responses
- Response status display
- Send reminder action
- Mark complete action
- Due date display
- Response timestamp

---

### `/forms` ✅ 🔒

**Page:** `src/app/(dashboard)/forms/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `forms/page.tsx` | Server component, fetch forms |
| Client | `forms/forms-page-client.tsx` | Grid, search, CRUD modals |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getForms()` | `custom-forms.ts` | List forms with stats |
| `createForm()` | `custom-forms.ts` | Create new form |
| `deleteForm()` | `custom-forms.ts` | Delete form |
| `duplicateForm()` | `custom-forms.ts` | Clone form |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| CustomForm | findMany | Forms with counts |
| PortfolioWebsite | include | Portfolio link |

**Form Card Stats:**
- Field count, Submission count
- Active/Inactive status
- Portfolio website link (if assigned)

---

### `/forms/[id]` ✅ 🔒

**Page:** `src/app/(dashboard)/forms/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `forms/[id]/page.tsx` | Server component, fetch form + fields |
| Client | `forms/[id]/form-editor-client.tsx` | Drag-drop editor, 3 tabs |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getForm()` | `custom-forms.ts` | Form with all fields |
| `updateForm()` | `custom-forms.ts` | Save metadata |
| `addFormField()` | `custom-forms.ts` | Add field |
| `updateFormField()` | `custom-forms.ts` | Update field |
| `deleteFormField()` | `custom-forms.ts` | Remove field |
| `reorderFormFields()` | `custom-forms.ts` | Reorder fields |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| CustomForm | findUnique, update | Form CRUD |
| CustomFormField | create, update, delete | Field management |
| FormSubmission | _count | Submission stats |

**Field Types (CustomFormFieldType enum):**
- Basic: text, email, phone, number, textarea
- Choice: select, multiselect, radio, checkbox
- Date/Time: date, time, datetime
- Advanced: url, file, hidden
- Layout: heading, paragraph, divider

**Editor Tabs:**
1. Fields - Drag-drop field canvas
2. Settings - Form metadata, notifications
3. Preview - Live form preview

**Field Properties:**
- label, placeholder, helpText
- isRequired, minLength, maxLength
- pattern, patternError
- options (JSON), conditionalLogic (JSON)
- position, width

**Email Notifications:**
- `sendEmailOnSubmission` - Toggle
- `notificationEmails` - Custom recipients

---

### `/f/[slug]` ✅ 🌐

**Page:** `src/app/f/[slug]/page.tsx`

**Public form submission route**

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getFormBySlug()` | `custom-forms.ts` | Fetch active form |
| `submitForm()` | `custom-forms.ts` | Submit with validation |

**Submission Process:**
1. Validate form is active
2. Check max submissions limit
3. Validate required fields
4. Create FormSubmission record
5. Send notification email (if enabled)

---

## Leads & CRM

### `/leads` ✅ 🔒

**Page:** `src/app/(dashboard)/leads/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `leads/page.tsx` | Server component, parallel fetch 3 lead types |
| Client | `leads/leads-page-client.tsx` | List/Kanban views, filtering, bulk actions |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPortfolioInquiries()` | `portfolio-websites.ts` | Portfolio contact submissions |
| `getChatInquiries()` | `chat-inquiries.ts` | Website chat inquiries |
| `getAllSubmissions()` | `booking-forms.ts` | Booking form submissions |
| `updatePortfolioInquiryStatus()` | `portfolio-websites.ts` | Update status + notes |
| `updateChatInquiryStatus()` | `chat-inquiries.ts` | Update status + notes |
| `convertPortfolioInquiryToClient()` | `portfolio-websites.ts` | Convert to Client |
| `convertChatInquiryToClient()` | `chat-inquiries.ts` | Convert to Client |
| `convertBookingSubmissionToClient()` | `booking-forms.ts` | Convert to Client |
| `bulkDeletePortfolioInquiries()` | `portfolio-websites.ts` | Bulk delete |
| `bulkDeleteChatInquiries()` | `chat-inquiries.ts` | Bulk delete |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PortfolioInquiry | findMany | Portfolio website leads |
| WebsiteChatInquiry | findMany | Chat widget leads |
| BookingFormSubmission | findMany | Booking form leads |
| Client | create | Conversion target |

**Lead Statuses:** `new` → `contacted` → `qualified` → `closed`

**Features:**
- List and Kanban board views
- Drag-drop status changes (Kanban)
- Bulk selection and actions
- Convert to client workflow
- Filter by type, status, date range
- Virtual list for performance

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

### `/brokerages` ✅ 🔒

**Page:** `src/app/(dashboard)/brokerages/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `brokerages/page.tsx` | Server component, filter + search |
| Client | Inline | Stats cards, search, filter tabs |

**Query Params:** `?status=` (active, all, inactive), `?search=`

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getBrokerages()` | `brokerages.ts` | Fetch with filters and search |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Brokerage | findMany | Brokerages with _count |
| Client | _count | Agent count per brokerage |
| BrokerageContract | _count | Contract count |
| OrderPage | _count | Order page count |

**Stats Displayed:**
- Active Brokerages count
- Total Agents count
- Brokerage Revenue sum

**Brokerage Fields:**
- Name, slug, email, phone, website
- Address (city, state, zip)
- Branding (logo, primary color)
- Contact person details
- Active status
- Revenue analytics (denormalized)

---

## Settings

### `/settings` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/page.tsx` | Server component, settings hub |
| Client | `settings/settings-page-client.tsx` | Danger zone actions |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getAuthContext()` | `auth.ts` | User + org context |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | Org info display |

**Features:**
- Settings category navigation grid
- Organization info display
- Danger zone (account deletion)
- Quick links to all settings sub-pages

---

### `/settings/billing` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/billing/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/billing/page.tsx` | Server component, plan + invoices |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getBillingStats()` | `settings.ts` | Plan usage metrics |
| `getInvoiceHistory()` | `settings.ts` | Platform invoices (limit 10) |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | Plan, Stripe info |
| Invoice | findMany | Invoice history |

**Features:**
- Current plan display
- Usage metrics (galleries, clients, team members)
- Payment method management
- Invoice history with PDF export
- Upgrade CTA

---

### `/settings/notifications` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/notifications/page.tsx`
**Dynamic:** `"use client"` (full client component)

| Layer | File | Purpose |
|-------|------|---------|
| Client | `settings/notifications/page.tsx` | Real-time preference toggles |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getNotificationPreferences()` | `notifications.ts` | Fetch all preferences |
| `updateAllNotificationSettings()` | `notifications.ts` | Batch update |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| NotificationPreferences | findUnique, update | Email + push toggles |
| DigestSettings | findUnique, update | Digest frequency |
| QuietHours | findUnique, update | Do not disturb |

**Features:**
- Email notification toggles (bookings, payments, galleries)
- Push notification toggles
- Digest configuration (daily, weekly, immediate)
- Quiet hours scheduling
- Real-time updates without page refresh

---

### `/settings/email` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/email/page.tsx`
**Dynamic:** `"use client"` (full client component)

| Layer | File | Purpose |
|-------|------|---------|
| Client | `settings/email/page.tsx` | Email account management |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getEmailSettings()` | `email.ts` | Sender info |
| `updateEmailSettings()` | `email.ts` | Update sender info |
| `sendTestEmail()` | `email.ts` | Test email delivery |
| `getConnectedEmailAccounts()` | `email.ts` | OAuth accounts |
| `disconnectEmailAccount()` | `email.ts` | Remove OAuth link |

**API Routes:**
| Route | Purpose |
|-------|---------|
| `/api/integrations/gmail/authorize` | Start Gmail OAuth |
| `/api/integrations/gmail/callback` | Complete Gmail OAuth |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| EmailAccount | findMany, delete | Connected accounts |
| Organization | findUnique, update | Sender name, reply-to |

**Features:**
- Gmail/Outlook account connection
- Sender name customization
- Reply-to address configuration
- Email signature editor
- Test email sending

---

### `/settings/email-logs` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/settings/email-logs/page.tsx`
**Dynamic:** `"use client"` (full client component)

| Layer | File | Purpose |
|-------|------|---------|
| Client | `settings/email-logs/page.tsx` | Email delivery tracking |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getEmailLogs()` | `email.ts` | Paginated logs with filters |
| `getEmailStats()` | `email.ts` | Delivery metrics |
| `resendEmail()` | `email.ts` | Resend failed email |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| EmailLog | findMany, count | Log entries |
| EmailLog | aggregate | Stats (sent, delivered, failed) |

**Features:**
- Email log table with status badges
- Filter by status, type, date range
- Resend failed emails
- CSV export
- Pagination
- Delivery statistics

---

### `/settings/gallery-addons` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/gallery-addons/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/gallery-addons/page.tsx` | Server component |
| Client | `gallery/addon-catalog-manager.tsx` | Addon CRUD interface |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getAddonCatalog()` | `gallery-addons.ts` | Fetch all addons |
| `createAddon()` | `gallery-addons.ts` | Create new addon |
| `updateAddon()` | `gallery-addons.ts` | Update addon |
| `deleteAddon()` | `gallery-addons.ts` | Remove addon |
| `reorderAddons()` | `gallery-addons.ts` | Update sort order |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| GalleryAddon | findMany, create, update, delete | Addon CRUD |
| Organization | findUnique | Addon catalog |

**Features:**
- Addon upsell catalog management
- Drag-and-drop reordering
- Pricing configuration
- Enable/disable addons
- Category grouping

---

### `/settings/watermarks` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/watermarks/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/watermarks/page.tsx` | Server component |
| Client | `settings/watermarks/watermark-templates-client.tsx` | Template CRUD |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `listWatermarkTemplates()` | `watermarks.ts` | All templates |
| `createWatermarkTemplate()` | `watermarks.ts` | Create template |
| `updateWatermarkTemplate()` | `watermarks.ts` | Update template |
| `deleteWatermarkTemplate()` | `watermarks.ts` | Remove template |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| WatermarkTemplate | findMany, create, update, delete | Template CRUD |

**Features:**
- Watermark preset creation
- Position (corner, center, tiled)
- Opacity and size settings
- Logo upload for watermarks
- Preview functionality

---

### `/settings/dropbox` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/dropbox/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/dropbox/page.tsx` | Server component |
| Client | `settings/dropbox/dropbox-settings-client.tsx` | OAuth + sync config |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getDropboxConfig()` | `dropbox.ts` | Current integration |
| `disconnectDropbox()` | `dropbox.ts` | Remove integration |
| `updateDropboxSettings()` | `dropbox.ts` | Sync preferences |

**API Routes:**
| Route | Purpose |
|-------|---------|
| `/api/integrations/dropbox/authorize` | Start Dropbox OAuth |
| `/api/integrations/dropbox/callback` | Complete OAuth, save tokens |
| `/api/integrations/dropbox/webhook` | File change notifications |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| DropboxIntegration | findFirst, update, delete | Integration CRUD |

**Features:**
- Dropbox OAuth connection
- Auto-sync folder configuration
- Folder structure creation
- Webhook for file changes
- Sync status display

---

### `/settings/slack` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/slack/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/slack/page.tsx` | Server component |
| Client | `settings/slack/slack-settings-client.tsx` | OAuth + channel config |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getSlackConfig()` | `slack.ts` | Current integration |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| SlackIntegration | findFirst | Integration status |

**Features:**
- Slack OAuth connection
- Channel selection for notifications
- Event type configuration
- Notification preview

---

### `/settings/zapier` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/zapier/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/zapier/page.tsx` | Server component |
| Client | `settings/zapier/zapier-settings-client.tsx` | API key display |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getApiKeys()` | `api-keys.ts` | List API keys for Zapier |
| `generateNewApiKey()` | `api-keys.ts` | Create Zapier key |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ApiKey | findMany | Key list |

**Features:**
- Zapier integration setup guide
- API key management
- Webhook URL display
- Available triggers documentation

---

### `/settings/quickbooks` ✅ 🔒 🔜

**Page:** `src/app/(dashboard)/settings/quickbooks/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/quickbooks/page.tsx` | Server component |
| Client | `settings/quickbooks/quickbooks-settings-client.tsx` | Coming soon placeholder |

**Status:** Coming Soon

**Planned Features:**
- QuickBooks OAuth integration
- Invoice sync
- Customer sync
- Expense tracking

---

### `/settings/mailchimp` ✅ 🔒 🔜

**Page:** `src/app/(dashboard)/settings/mailchimp/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/mailchimp/page.tsx` | Server component |
| Client | `settings/mailchimp/mailchimp-settings-client.tsx` | Coming soon placeholder |

**Status:** Coming Soon

**Planned Features:**
- Mailchimp OAuth integration
- Audience sync
- Campaign triggers
- Email marketing automation

---

### `/settings/calendly` ✅ 🔒 🔜

**Page:** `src/app/(dashboard)/settings/calendly/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/calendly/page.tsx` | Server component |
| Client | `settings/calendly/calendly-settings-client.tsx` | Coming soon placeholder |

**Status:** Coming Soon

**Planned Features:**
- Calendly event type mapping
- Booking import
- Availability sync

---

### `/settings/equipment` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/equipment/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/equipment/page.tsx` | Server component |
| Client | `settings/equipment/equipment-list.tsx` | Inventory CRUD |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getEquipmentByCategory()` | `equipment.ts` | Fetch grouped by category |
| `createEquipment()` | `equipment.ts` | Add equipment |
| `updateEquipment()` | `equipment.ts` | Modify equipment |
| `deleteEquipment()` | `equipment.ts` | Remove equipment |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Equipment | findMany, create, update, delete | Equipment CRUD |

**Equipment Categories:**
- Camera Bodies, Lenses, Lighting
- Audio, Drones, Tripods/Stabilizers
- Memory/Storage, Batteries, Other

**Features:**
- Categorized equipment list
- Serial number tracking
- Purchase date and value
- Assignment to team members

---

### `/settings/photographer-pay` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/settings/photographer-pay/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/photographer-pay/page.tsx` | Server component |
| Client | `settings/photographer-pay/photographer-pay-client.tsx` | Rate configuration |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getTeamMembers()` | `settings.ts` | Team member list |
| `getPhotographerRates()` | `photographer-pay.ts` | Pay rates by service |
| `getEarningStats()` | `photographer-pay.ts` | Earnings summary |
| `getServices()` | `services.ts` | Service list |
| `updatePhotographerRate()` | `photographer-pay.ts` | Set rate |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| User | findMany | Team members |
| PhotographerRate | findMany, upsert | Rate assignments |
| Service | findMany | Services |

**Features:**
- Pay rate configuration by service
- Percentage or flat rate options
- Earnings tracking
- Team member rate management

---

### `/settings/payouts` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/settings/payouts/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/payouts/page.tsx` | Server component |
| Client | `settings/payouts/payouts-page-client.tsx` | Batch processing |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPayoutBatches()` | `payouts.ts` | Historical batches |
| `getPendingPayouts()` | `payouts.ts` | Unpaid earnings |
| `getPayoutStats()` | `payouts.ts` | Summary metrics |
| `createPayoutBatch()` | `payouts.ts` | Process batch |
| `markPayoutComplete()` | `payouts.ts` | Mark as paid |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PayoutBatch | findMany, create, update | Batch CRUD |
| PendingPayout | findMany | Pending items |

**Features:**
- Pending payout list
- Batch payout processing
- Payout statistics
- Export for accounting
- Payment status tracking

---

### `/settings/profile` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/profile/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/profile/page.tsx` | Server component, 2-column layout |
| Client | `settings/profile/profile-settings-form.tsx` | Avatar upload, form fields |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getCurrentUser()` | `settings.ts` | User + org + role |
| `getBillingStats()` | `settings.ts` | Plan usage stats |
| `updateUserProfile()` | `settings.ts` | Update name, phone, avatar |
| `updateOrganizationProfile()` | `settings.ts` | Update business name, timezone |

**API Routes:**
| Route | Purpose |
|-------|---------|
| `POST /api/upload/profile-photo` | Get presigned URL for R2 upload |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| OrganizationMember | findFirst | With user + org relations |
| Organization | findUnique | Plan, Stripe info |
| Project | count | Gallery usage |
| Client | count | Client usage |
| User | update | Profile changes |

**Features:**
- Profile photo upload (presigned R2 URL)
- Personal info (name, email, phone)
- Business info (business name, timezone)
- Account status sidebar (plan, role, member since)
- Password management (links to Clerk)

**Timezone Groups:**
- North America, Canada, Europe, Asia Pacific, Australia & NZ, South America, Middle East & Africa

---

### `/settings/team` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/team/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/team/page.tsx` | Server component, fetch members + invitations |
| Client | `settings/team/team-page-client.tsx` | Member list, invite modal |
| Modal | `settings/team/invite-modal.tsx` | Invitation form + pending list |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getTeamMembers()` | `settings.ts` | Fetch org members with users |
| `getBillingStats()` | `settings.ts` | Plan limits and usage |
| `updateMemberRole()` | `settings.ts` | Change member role |
| `removeMember()` | `settings.ts` | Remove from org |
| `createInvitation()` | `invitations.ts` | Send team invite |
| `resendInvitation()` | `invitations.ts` | Resend with new token |
| `revokeInvitation()` | `invitations.ts` | Cancel invitation |
| `getPendingInvitations()` | `invitations.ts` | Pending invite list |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| OrganizationMember | findMany, update, delete | Member CRUD |
| User | include | User details |
| Invitation | findMany, create, update | Invitation management |
| Organization | findUnique | Plan limits |

**Member Roles:** `owner` | `admin` | `member`

---

### `/settings/team/[id]/capabilities` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/team/[id]/capabilities/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/team/[id]/capabilities/page.tsx` | Server component |
| Client | `settings/team/[id]/capabilities/capabilities-form.tsx` | Skills + equipment tabs |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getUserServiceCapabilities()` | `team-capabilities.ts` | User's service capabilities |
| `assignServiceCapability()` | `team-capabilities.ts` | Assign skill level |
| `removeServiceCapability()` | `team-capabilities.ts` | Remove skill |
| `getUserEquipment()` | `equipment.ts` | User's assigned equipment |
| `assignEquipmentToUser()` | `equipment.ts` | Assign equipment |
| `unassignEquipmentFromUser()` | `equipment.ts` | Unassign equipment |
| `getEquipmentList()` | `equipment.ts` | All org equipment |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| User | findUnique | User with memberships |
| UserServiceCapability | findMany, upsert, delete | Skill assignments |
| UserEquipment | findMany, upsert, delete | Equipment assignments |
| Service | findMany | Available services |
| Equipment | findMany | Available equipment |

**Capability Levels:** `learning` | `capable` | `expert`

---

### `/settings/branding` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/branding/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/branding/page.tsx` | Server component, fetch settings |
| Client | `settings/branding/branding-settings-form.tsx` | Logo uploads, colors, theme |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getOrganizationSettings()` | `settings.ts` | Fetch all org settings |
| `updateOrganizationBranding()` | `settings.ts` | Save branding settings |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | All branding fields |
| Organization | update | Save branding changes |

**Branding Fields:**
| Field | Type | Purpose |
|-------|------|---------|
| `logoUrl` | string | Dark mode logo |
| `logoLightUrl` | string | Light mode logo |
| `faviconUrl` | string | Browser tab icon |
| `primaryColor` | hex | Action buttons (#3b82f6) |
| `secondaryColor` | hex | Headers, accents (#8b5cf6) |
| `accentColor` | hex | Success states (#22c55e) |
| `portalMode` | enum | light, dark, auto |
| `invoiceLogoUrl` | string | Invoice header logo |
| `hidePlatformBranding` | boolean | White-label (Pro+) |
| `customDomain` | string | Custom gallery URL |
| `autoArchiveExpiredGalleries` | boolean | Gallery automation |

**Color Presets (8 built-in):**
- Ocean Blue, Forest Green, Sunset Orange
- Royal Purple, Rose Pink, Midnight
- Sage Green, Terracotta

**Plan-Gated Features:**
- `hidePlatformBranding` - Pro/Studio/Enterprise only
- `customDomain` - Pro/Studio/Enterprise only

**Cache Invalidation:**
- `/settings`, `/settings/branding`, `/galleries`, `/g`

---

### `/settings/payments` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/payments/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/payments/page.tsx` | Server component, fetch Stripe status |
| Client | `settings/payments/payments-settings-client.tsx` | Connect flow, tax, currency |
| Client | `settings/payments/connect-button.tsx` | Stripe Connect button |
| Client | `settings/payments/tax-settings-form.tsx` | Tax rate config |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getConnectAccountDetails()` | `stripe-connect.ts` | Stripe account status |
| `createConnectAccount()` | `stripe-connect.ts` | Create Express account |
| `createAccountLink()` | `stripe-connect.ts` | Onboarding resume URL |
| `createDashboardLink()` | `stripe-connect.ts` | Dashboard login link |
| `getTaxSettings()` | `settings.ts` | Tax rate + label |
| `updateTaxSettings()` | `settings.ts` | Save tax config |
| `getCurrencySettings()` | `settings.ts` | Default currency |
| `updateCurrencySettings()` | `settings.ts` | Save currency |

**API Routes:**
| Route | Purpose |
|-------|---------|
| `POST /api/webhooks/stripe` | Handle Stripe events |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | Stripe IDs, tax, currency |
| Organization | update | Save settings |

**Stripe Connect Flow:**
1. Create Express account
2. Generate onboarding URL
3. Redirect to Stripe hosted flow
4. Webhook: `account.updated` → sync status

**Supported Currencies:**
USD, EUR, GBP, CAD, AUD, BRL, MXN, JPY, CHF

---

### `/settings/gallery-templates` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/gallery-templates/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/gallery-templates/page.tsx` | Server component, fetch templates |
| Client | `settings/gallery-templates/gallery-templates-client.tsx` | CRUD modals, template grid |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getGalleryTemplates()` | `gallery-templates.ts` | List all templates |
| `createGalleryTemplate()` | `gallery-templates.ts` | Create new template |
| `updateGalleryTemplate()` | `gallery-templates.ts` | Update template |
| `deleteGalleryTemplate()` | `gallery-templates.ts` | Delete template |
| `incrementTemplateUsage()` | `gallery-templates.ts` | Track usage count |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| GalleryTemplate | findMany, create, update, delete | Template CRUD |
| Service | findMany | Service dropdown |

**Template Settings:**
- Default price, password protection
- Allow downloads, favorites, watermark
- Email notifications
- Expiration days
- Default service selection
- Is default template flag

**Cache Invalidation:**
- `/settings/templates`, `/galleries/new`

---

### `/settings/integrations` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/integrations/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/integrations/page.tsx` | Server component, fetch connected status |
| Client | `settings/integrations/integrations-client.tsx` | Integration grid, API/webhook panels |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getApiKeys()` | `api-keys.ts` | List API keys |
| `generateNewApiKey()` | `api-keys.ts` | Create new key |
| `revokeApiKey()` | `api-keys.ts` | Soft delete |
| `getWebhookEndpoints()` | `webhooks.ts` | List webhooks |
| `createWebhookEndpoint()` | `webhooks.ts` | Create endpoint |
| `testWebhookEndpoint()` | `webhooks.ts` | Send test payload |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| CalendarIntegration | findFirst | Google Calendar status |
| DropboxIntegration | findFirst | Dropbox status |
| SlackIntegration | findMany | Slack channels |
| ApiKey | findMany, create | API key management |
| WebhookEndpoint | findMany, create | Webhook CRUD |
| WebhookDelivery | findMany | Delivery history |

**Available Integrations:**
- Google Calendar (OAuth, bidirectional sync)
- Dropbox (OAuth, auto backup)
- Slack (OAuth, notifications)
- Stripe (payments)
- Zapier (automation)

**API Key Features:**
- SHA-256 hash storage (never plaintext)
- Scopes: read, write, admin
- Expiration dates, usage tracking

**Webhook Events:**
- Gallery: created, delivered, viewed, paid
- Booking: created, confirmed, cancelled, completed
- Invoice: created, sent, paid, overdue
- Payment: received, failed, refunded
- Client/Contract/Project events

---

### `/settings/calendar` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/calendar/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/calendar/page.tsx` | Server component, fetch config |
| Client | `settings/calendar/calendar-settings-client.tsx` | OAuth, sync settings |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getGoogleCalendarConfig()` | `google-calendar.ts` | Current integration config |
| `getGoogleCalendars()` | `google-calendar.ts` | List user's calendars |
| `testGoogleCalendarConnection()` | `google-calendar.ts` | Test connection |
| `updateGoogleCalendarSettings()` | `google-calendar.ts` | Update sync direction |
| `disconnectGoogleCalendar()` | `google-calendar.ts` | Remove integration |
| `syncGoogleCalendar()` | `google-calendar.ts` | Bidirectional sync |

**API Routes:**
| Route | Purpose |
|-------|---------|
| `/api/integrations/google/authorize` | OAuth authorization with PKCE |
| `/api/integrations/google/callback` | OAuth callback, token exchange |
| `/api/calendar/ical/[token]` | iCal feed export (RFC 5545) |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| CalendarIntegration | findFirst, create, update | Integration management |
| CalendarEvent | findMany, create, update | Synced events |
| CalendarFeed | findMany, create | iCal subscriptions |
| Booking | findMany | Events to export |

**Sync Directions:** `import_only` | `export_only` | `both`

**Features:**
- Google Calendar OAuth integration
- Bidirectional sync (import/export)
- iCal feed generation for subscriptions
- PKCE security for OAuth

---

### `/settings/developer` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/developer/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/developer/page.tsx` | Server component, fetch sync status |
| Client | `settings/developer/seed-buttons.tsx` | Seed/clear database |
| Client | `settings/developer/stripe-products.tsx` | Product sync management |
| Client | `settings/developer/subscription-plans.tsx` | Plan CRUD, A/B testing |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `seedDatabase()` | `seed.ts` | Create sample data |
| `clearSeededData()` | `seed.ts` | Remove sample data |
| `getApiKeys()` | `api-keys.ts` | API key list |
| `generateNewApiKey()` | `api-keys.ts` | Create API key |
| `validateApiKey()` | `api-keys.ts` | Verify key hash |
| `getWebhookEndpoints()` | `webhooks.ts` | Webhook list |
| `createWebhookEndpoint()` | `webhooks.ts` | Create endpoint |
| `dispatchWebhookEvent()` | `webhooks.ts` | Send event to subscribers |
| `getSubscriptionPlans()` | `subscription-plans.ts` | Pricing plans |
| `createPricingExperiment()` | `subscription-plans.ts` | A/B test setup |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ApiKey | findMany, create, delete | Key management |
| WebhookEndpoint | findMany, create | Webhook CRUD |
| WebhookDelivery | findMany, create | Delivery logs |
| SubscriptionPlan | findMany, create | Pricing tiers |
| PricingExperiment | findMany, create | A/B experiments |

**API Key Security:**
- SHA-256 hash storage
- Format: `sk_live_[base64url]`
- Prefix visible, full key shown once

**Webhook System:**
- HMAC-SHA256 signature
- Automatic retry with failure tracking
- Event dispatch to all subscribers

---

### `/settings/mls-presets` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/mls-presets/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/mls-presets/page.tsx` | Server component, fetch presets |
| Client | `settings/mls-presets/mls-presets-client.tsx` | CRUD, filter by provider |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getMlsPresets()` | `mls-presets.ts` | Fetch system + org presets |
| `getMlsProviders()` | `mls-presets.ts` | Unique provider names |
| `createMlsPreset()` | `mls-presets.ts` | Create custom preset |
| `updateMlsPreset()` | `mls-presets.ts` | Update preset |
| `deleteMlsPreset()` | `mls-presets.ts` | Delete custom preset |
| `seedSystemMlsPresets()` | `mls-presets.ts` | Seed 18 default presets |
| `getEffectivePresetsForClient()` | `mls-presets.ts` | Resolved presets with overrides |
| `setPresetOverride()` | `mls-presets.ts` | Client/brokerage override |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| MlsPreset | findMany, create, update, delete | Preset CRUD |
| MlsPresetOverride | findMany, upsert | Override management |
| Client | findFirst | Client lookup for overrides |
| Brokerage | findFirst | Brokerage lookup for overrides |

**Default Providers (18 presets):**
- HAR (Houston), Zillow, Realtor.com, NWMLS
- MLS PIN, Bright MLS, CRMLS
- Social Media (Square, Landscape)
- Web (Full HD, 4K), Print (8x10, 11x14)
- Marketing (Flyer)

**Preset Fields:**
- Dimensions (width, height)
- Quality (10-100)
- Format (jpeg, png, webp)
- Max file size, Aspect ratio, Letterboxing

**Override Hierarchy:** System → Organization → Brokerage → Client

---

### `/settings/travel` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/travel/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/travel/page.tsx` | Server component, fetch travel config |
| Client | `settings/travel/travel-settings-form.tsx` | Home base, mileage rates |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getOrganizationSettings()` | `settings.ts` | Fetch travel config |
| `updateTravelSettings()` | `settings.ts` | Update mileage rates |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique, update | homeBaseLocation, travelFeePerMile, travelFeeThreshold |
| Location | findUnique, create | Home base coordinates |

**Features:**
- Google Maps address autocomplete
- Live map preview
- Fee calculator (5, 15, 25, 50 mile examples)
- Default: 65 cents/mile, 15 miles free

---

### `/settings/sms` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/sms/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/sms/page.tsx` | Server component, fetch Twilio config |
| Client | `settings/sms/sms-settings-client.tsx` | Credentials, test messaging |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getSMSSettings()` | `sms.ts` | Twilio config (accountSid, authToken, phone) |
| `getSMSStats()` | `sms.ts` | Delivery stats (sent, delivered, failed) |
| `getSMSTemplates()` | `sms.ts` | Message templates list |
| `getSMSLogs()` | `sms.ts` | Recent delivery history |
| `updateSMSSettings()` | `sms.ts` | Save Twilio config |
| `sendTestSMS()` | `sms.ts` | Test connection |
| `seedDefaultTemplates()` | `sms.ts` | Create default templates |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique, update | Twilio credentials |
| SMSTemplate | findMany | Template list |
| SMSLog | findMany | Delivery history |

**SMS Status:** `queued` | `sent` | `delivered` | `failed` | `undelivered`

---

### `/settings/sms/templates` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/sms/templates/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/sms/templates/page.tsx` | Server component, fetch templates |
| Client | `settings/sms/templates/sms-templates-client.tsx` | Grid display, search |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getSMSTemplates()` | `sms.ts` | All templates with metadata |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| SMSTemplate | findMany | Templates with _count.smsLogs |

**Features:**
- 2-column responsive grid
- Search (name, type, content)
- Active/inactive status badges
- Available variables as tags
- Messages sent count

---

### `/settings/territories` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/territories/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/territories/page.tsx` | Server component, fetch territories |
| Client | `settings/territories/territories-client.tsx` | CRUD modals |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getTerritories()` | `territories.ts` | All territories with ZIP codes |
| `getServices()` | `services.ts` | Services for linking |
| `createTerritory()` | `territories.ts` | Create with pricing modifier |
| `updateTerritory()` | `territories.ts` | Modify settings |
| `deleteTerritory()` | `territories.ts` | Remove territory |
| `toggleTerritoryStatus()` | `territories.ts` | Activate/deactivate |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ServiceTerritory | findMany, create, update, delete | Zone CRUD |
| Service | findMany | Available services |

**Territory Fields:**
- Name, description, zipCodes (array)
- pricingModifier (1.0 = base, 1.1 = +10%)
- travelFee (cents), color, isActive

---

### `/settings/referrals` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/referrals/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/referrals/page.tsx` | Server component, fetch program |
| Client | `settings/referrals/referrals-client.tsx` | Tabbed interface |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getReferralProgram()` | `referrals.ts` | Program config |
| `getReferrers()` | `referrals.ts` | Referral partners |
| `getReferrals()` | `referrals.ts` | All referrals |
| `getReferralStats()` | `referrals.ts` | Metrics (totalReferrers, conversionRate) |
| `upsertReferralProgram()` | `referrals.ts` | Create/update program |
| `toggleReferralProgram()` | `referrals.ts` | Enable/disable |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ReferralProgram | findUnique, upsert | Program config |
| Referrer | findMany | Partners |
| Referral | findMany | Transactions |

**Reward Types:** `percentage` | `fixed` | `credit` | `gift_card`

**Tabs:** Settings, Referrers, Referrals

---

### `/settings/my-referrals` ✅ 🔒 📊

**Page:** `src/app/(dashboard)/settings/my-referrals/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/my-referrals/page.tsx` | Server component, fetch user stats |
| Client | `settings/my-referrals/my-referrals-client.tsx` | Multi-tab interface |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getMyReferralProfile()` | `platform-referrals.ts` | User's referral code |
| `getMyReferralStats()` | `platform-referrals.ts` | Metrics (totalReferrals, pendingCredit) |
| `getMyReferrals()` | `platform-referrals.ts` | User's invites |
| `getMyRewards()` | `platform-referrals.ts` | Available rewards |
| `getMyReferralLink()` | `platform-referrals.ts` | Shareable URL |
| `getReferralLeaderboard()` | `platform-referrals.ts` | Top 10 referrers |
| `sendReferralInvite()` | `platform-referrals.ts` | Email invite |
| `applyReward()` | `platform-referrals.ts` | Apply credit |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PlatformReferrer | findUnique | User's profile |
| PlatformReferral | findMany | User's referrals |
| PlatformReward | findMany | Reward items |

**Features:**
- "$25 Share & Earn" hero
- Quick share (Email, Twitter, LinkedIn, WhatsApp, QR)
- QR code modal with download
- 4 tabs: How It Works, Referrals, Rewards, Leaderboard
- Milestone progress (1, 5, 10, 25, 50 referrals)

---

### `/settings/appearance` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/appearance/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/appearance/page.tsx` | Server component, fetch preferences |
| Client | `settings/appearance/appearance-settings-form.tsx` | Theme, font, density preview |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getAppearancePreferences()` | `appearance.ts` | Saved preferences |
| `updateAppearancePreferences()` | `appearance.ts` | Save changes |
| `applyThemePreset()` | `appearance.ts` | Apply preset |
| `resetAppearancePreferences()` | `appearance.ts` | Restore defaults |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| AppearancePreference | findUnique, update | User preferences |

**Preference Fields:**
- dashboardTheme, dashboardAccent
- sidebarCompact, sidebarPosition
- fontFamily, density, fontSize
- highContrast, reduceMotion
- autoThemeEnabled, autoThemeDarkStart/End

**Features:**
- 8+ preset themes with preview
- Custom color picker
- Typography selector (serif/sans)
- Content density (compact/comfortable/spacious)
- Text size (small/normal/large/xlarge)
- Accessibility: high contrast, reduce motion
- Automatic time-based theme switching
- Settings backup/restore (JSON export)

---

### `/settings/features` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/features/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/features/page.tsx` | Server component, fetch industries/modules |
| Client | `settings/features/features-settings-form.tsx` | Industry + module selector |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `updateIndustries()` | `onboarding.ts` | Update org industries |
| `updateModules()` | `onboarding.ts` | Enable/disable modules |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique, update | industries, primaryIndustry, enabledModules |

**Industry Options:**
- Real Estate, Commercial, Architecture
- Wedding, Events, Headshots
- Portrait, Product, Food/Hospitality

**Module Categories:**
- Operations
- Client Management
- Industry-Specific

**Features:**
- Multi-select industry grid
- Primary industry badge
- Module availability filtered by industry
- "Coming soon" indicators
- URL param highlight + scroll-into-view

---

### `/settings/billing/upgrade` ✅ 🔒

**Page:** `src/app/(dashboard)/settings/billing/upgrade/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `settings/billing/upgrade/page.tsx` | Server component, plan display |
| Client | `settings/billing/upgrade/upgrade-form.tsx` | Stripe checkout button |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `createCheckoutSession()` | `stripe-checkout.ts` | Create Stripe Checkout |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Organization | findUnique | stripeCustomerId, stripeSubscriptionId |

**Plan Options:**
- Pro: $49/month ("Most Popular")
- Studio: $99/month

**Features:**
- Auto-redirect if already subscribed
- Feature comparison lists
- Stripe Checkout integration
- Success/Cancel URL handling
- FAQ section (4 common questions)

---

## Public Routes

### `/g/[slug]` ✅ 🌐

**Page:** `src/app/g/[slug]/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `g/[slug]/page.tsx` | Server component, password check, payment banner |
| Client | `g/[slug]/gallery-client.tsx` | Theme detection, slideshow, EXIF, compare |
| Client | `g/[slug]/password-gate.tsx` | Password form |
| Client | `g/[slug]/pay-button.tsx` | Stripe payment button |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPublicGallery()` | `galleries.ts` | Fetch gallery by slug with assets |
| `recordGalleryView()` | `galleries.ts` | Increment view count |
| `toggleSelection()` | `client-selections.ts` | Add/remove selection |
| `updateSelectionNotes()` | `client-selections.ts` | Notes on selection |
| `submitSelections()` | `client-selections.ts` | Submit for approval |
| `createGalleryCheckoutSession()` | `stripe-checkout.ts` | Create Stripe session |

**API Routes:**
| Route | Purpose |
|-------|---------|
| `/api/gallery/verify-password` | Verify password, set cookie |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Project | findUnique | Gallery data (password, price, settings) |
| Asset | include | Photos with URLs |
| GalleryCollection | include | Collection groupings |
| DeliveryLink | include | Slug lookup |
| GalleryFavorite | findMany, create | Selections/favorites |
| Payment | include | Payment status check |
| Organization | include | Branding, Stripe Connect |
| Client | include | Outstanding balance check |

**Features:**
- Password protection (cookie-based auth)
- Pay-to-unlock (Stripe Checkout)
- Photo selections with notes
- Favorites with submit workflow
- Download (individual, batch)
- EXIF data display
- Slideshow mode

---

### `/p/[slug]` ✅ 🌐

**Page:** `src/app/p/[slug]/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `p/[slug]/page.tsx` | Server component, 5 templates, SEO metadata |
| Client | `p/[slug]/property-inquiry-form.tsx` | Contact form with honeypot |
| Client | `p/[slug]/property-share-buttons.tsx` | Social sharing |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPropertyWebsiteBySlug()` | `property-websites.ts` | Fetch property with signed URLs |
| `submitPropertyLead()` | `property-websites.ts` | Create lead, send email |
| `trackPropertyView()` | `property-websites.ts` | Record view analytics |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PropertyWebsite | findUnique | Property details |
| PropertyLead | create | Lead submission |
| PropertyWebsiteView | create | View tracking |
| PropertyAnalytics | update | Increment counts |
| Project | include | Gallery connection |
| Asset | include | Property images |
| Organization | include | Agent/branding info |

**Templates:**
`modern` | `classic` | `luxury` | `minimal` | `commercial`

**Features:**
- Schema.org structured data for SEO
- Open house banner with status
- Hero image grid gallery
- Virtual tour embeds (Matterport, iGuide, Zillow 3D, etc.)
- Video embeds (YouTube, Vimeo)
- Property details (beds, baths, sqft, etc.)
- Lead capture form
- Social sharing

---

### `/portfolio/[slug]` ✅ 🌐 📊

**Page:** `src/app/portfolio/[slug]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `portfolio/[slug]/page.tsx` | Server component, access gates |
| Client | `portfolio/[slug]/portfolio-renderer.tsx` | Section rendering, analytics |
| Client | `portfolio/[slug]/password-gate.tsx` | Password verification |
| Client | `portfolio/[slug]/lead-gate.tsx` | Lead capture form |
| Client | `portfolio/[slug]/comments-section.tsx` | Comment submission |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPortfolioWebsiteBySlug()` | `portfolio-websites.ts` | Fetch portfolio with sections |
| `verifyPortfolioPassword()` | `portfolio-websites.ts` | SHA-256 password check |
| `trackPortfolioView()` | `portfolio-websites.ts` | Create view record |
| `updatePortfolioViewEngagement()` | `portfolio-websites.ts` | Update duration, scroll depth |
| `submitPortfolioInquiry()` | `portfolio-websites.ts` | Contact form submission |

**API Routes:**
| Route | Purpose |
|-------|---------|
| `POST /api/portfolio/track` | Record page view |
| `POST /api/portfolio/lead-capture` | Submit lead + grant access |
| `GET /api/portfolio/comments` | Fetch approved comments |
| `POST /api/portfolio/comments` | Submit comment for moderation |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PortfolioWebsite | findUnique | Portfolio data + sections |
| PortfolioWebsiteView | create, update | Analytics tracking |
| PortfolioLead | create | Lead gate submissions |
| PortfolioInquiry | create | Contact form submissions |
| PortfolioComment | findMany, create | Comments (moderated) |

**Access Gates (Sequential):**
1. Publication check → 404 if unpublished
2. Expiration check → expired notice
3. Password protection → cookie-based access
4. Lead capture gate → email required

**Analytics Tracking:**
- Visitor ID (localStorage)
- Session ID (sessionStorage)
- Scroll depth, duration
- Geolocation (IP → country/city)

**Section Types:**
- hero, about, gallery, services
- testimonials, contact, faq
- text, image, video, spacer, awards

**OG Image:** Dynamic social preview (1200x630)

---

### `/book/[slug]` ✅ 🌐

**Page:** `src/app/book/[slug]/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `book/[slug]/page.tsx` | Server component, metadata, fetch form |
| Client | `book/[slug]/booking-form-public.tsx` | Multi-step form UI |
| Completion | `book/[slug]/confirmation/page.tsx` | Success page |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getBookingFormBySlug()` | `booking-forms.ts` | Fetch published form with fields |
| `submitBookingForm()` | `booking-forms.ts` | Create submission, send confirmation |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| BookingForm | findUnique, update | Form config, increment counts |
| BookingFormField | include | Dynamic form fields |
| BookingFormService | include | Available services |
| BookingFormSubmission | create | Form submission |
| Service | include | Service details |
| Organization | include | Branding, contact info |

**Form Features:**
- Dynamic fields by industry
- Service selection
- Date/time preferences
- File upload to R2 storage
- Confirmation email
- Spam protection (honeypot)

---

### `/pay/[id]` ✅ 🌐

**Page:** `src/app/pay/[id]/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `pay/[id]/page.tsx` | Server component, fetch invoice |
| Client | `pay/[id]/pay-client.tsx` | Invoice display, payment button |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getPublicInvoice()` | `invoices.ts` | Fetch invoice (public) |
| `createInvoiceCheckoutSession()` | `stripe-checkout.ts` | Create Stripe session |
| `verifyInvoicePayment()` | `stripe-checkout.ts` | Verify payment, update status |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Invoice | findUnique, update | Invoice data and status |
| InvoiceLineItem | include | Line items |
| Payment | create | Record payment |
| Organization | include | Stripe Connect account |
| Client | include | Customer details |

**Payment Flow:**
```
Invoice Page → Click Pay → createInvoiceCheckoutSession()
  → Stripe Checkout → Success Redirect
  → verifyInvoicePayment() → Update Invoice Status
  → Create Payment Record
```

**Features:**
- Platform fee calculation
- Stripe Connect transfers
- Late fee calculation
- Duplicate payment prevention
- Outstanding balance display

---

### `/sign/[token]` ✅ 🌐

**Page:** `src/app/sign/[token]/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `sign/[token]/page.tsx` | Client component, signature capture |
| Completion | `sign/[token]/complete/page.tsx` | Confirmation page |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getContractForSigning()` | `contract-signing.ts` | Fetch contract for signer |
| `signContract()` | `contract-signing.ts` | Submit signature |
| `getSigningCompletion()` | `contract-signing.ts` | Confirmation data |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Contract | findFirst, update | Contract data, status update |
| ContractSigner | findFirst, update | Signer verification, sign timestamp |
| ContractSignature | create | Store signature data |
| ContractAuditLog | create | Audit trail |
| Organization | include | Branding |

**Signature Types:**
`drawn` | `typed` | `uploaded`

**Signing Flow:**
```
Email Link → /sign/[token] → getContractForSigning()
  → View Contract → Draw/Type Signature
  → signContract() → Create ContractSignature
  → Update ContractSigner.signedAt
  → Check if ALL signers done → Update Contract.status
  → Create Audit Log → Send Confirmation Email
  → Redirect to /sign/[token]/complete
```

**Features:**
- Draw or type signature
- Agreement checkbox validation
- Multi-signer support with order
- IP/user agent capture
- Audit logging
- Confirmation email

---

### `/order/[slug]` ✅ 🌐

**Page:** `src/app/order/[slug]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `order/[slug]/page.tsx` | Server component, fetch order page |
| Client | `order/[slug]/order-page-client.tsx` | Service selection, cart, checkout |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getOrderPageBySlug()` | `order-pages.ts` | Fetch order page with services |
| `createOrderCheckout()` | `stripe-checkout.ts` | Create Stripe session |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| OrderPage | findUnique | Order page config |
| Service | include | Available services |
| Organization | include | Branding, Stripe |

**Features:**
- Service selection with add-ons
- Dynamic pricing based on options
- Cart management
- Stripe Checkout integration
- Branded experience

---

### `/order/[slug]/confirmation` ✅ 🌐

**Page:** `src/app/order/[slug]/confirmation/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Client | `order/[slug]/confirmation/order-confirmation-client.tsx` | Confirmation display |

**Features:**
- Order details summary
- Download links (if applicable)
- Email confirmation sent
- Next steps information

---

### `/book/[slug]/confirmation` ✅ 🌐

**Page:** `src/app/book/[slug]/confirmation/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `book/[slug]/confirmation/page.tsx` | Static confirmation |

**Features:**
- Booking success message
- Confirmation email notification
- Calendar add option
- Next steps guide

---

### `/invite/[token]` ✅ 🌐

**Page:** `src/app/invite/[token]/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Client | `invite/[token]/invite-accept-client.tsx` | Invitation acceptance |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getInvitationByToken()` | `invitations.ts` | Validate invitation |
| `acceptInvitation()` | `invitations.ts` | Accept and join team |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Invitation | findUnique, update | Token validation |
| OrganizationMember | create | Add to team |
| User | findUnique, update | Link user |

**Features:**
- Invitation validation
- Team onboarding flow
- Account linking or creation
- Role assignment

---

### `/r/[code]` ✅ 🌐

**Page:** `src/app/r/[code]/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `r/[code]/page.tsx` | Server-only redirect |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| Direct Prisma | `prisma.platformReferrer` | Lookup referral code |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| PlatformReferrer | findUnique | Validate referral code |

**Features:**
- Referral code validation
- Redirect to signup with ref param
- Cookie set for tracking
- Invalid code handling

---

### `/schedule` ✅ 🌐

**Page:** `src/app/schedule/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `schedule/page.tsx` | Static onboarding page |

**Features:**
- Booking flow explanation
- Feature highlights
- CTA to booking forms

---

### `/track` ✅ 🌐

**Page:** `src/app/track/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `track/page.tsx` | Static onboarding page |

**Features:**
- Photographer tracking feature explanation
- Real-time location preview
- CTA to field operations

---

### `/unsubscribe` ✅ 🌐

**Page:** `src/app/unsubscribe/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Client | `unsubscribe/unsubscribe-content.tsx` | Email preference management |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getEmailPreferences()` | `email.ts` | Fetch current preferences |
| `updateEmailPreferences()` | `email.ts` | Update opt-out settings |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| EmailPreference | findUnique, update | Preference management |

**Features:**
- Token-based authentication
- Preference toggles by email type
- One-click unsubscribe all
- Confirmation feedback

---

## Field Operations

### `/field` ✅ 🔒

**Page:** `src/app/(field)/field/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `field/page.tsx` | Daily schedule view |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getFieldSchedule()` | `field.ts` | Today's bookings |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Booking | findMany | Assigned bookings |
| Project | include | Property details |

**Features:**
- Daily booking list
- Navigation to properties
- Check-in/out buttons
- Mobile-optimized layout

---

### `/field/check-in` ✅ 🔒

**Page:** `src/app/(field)/field/check-in/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `field/check-in/page.tsx` | Quick check-in interface |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getActiveBookings()` | `field.ts` | Current day bookings |
| `checkIn()` | `field.ts` | Record arrival |
| `checkOut()` | `field.ts` | Record departure |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Booking | findMany, update | Status update |
| CheckInLog | create | Timestamp record |

**Features:**
- One-tap check-in
- Geolocation capture
- Timestamp logging
- Real-time status update

---

## Client Portal

### `/portal` ✅ 🔒

**Page:** `src/app/(client-portal)/portal/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `portal/page.tsx` | Server component, auth check, redirect if not logged in |
| Client | `portal/portal-client.tsx` | Multi-tab dashboard, downloads, payments |
| Components | `portal/components/*.tsx` | Tabs, header, stats, modals |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getClientPortalData()` | `client-portal.ts` | Main data: client, properties, galleries, invoices, questionnaires |
| `getClientPropertyDetails()` | `client-portal.ts` | Property with marketing assets |
| `getClientGalleryDownload()` | `client-portal.ts` | Gallery assets with signed URLs |
| `getGalleryZipDownload()` | `portal-downloads.ts` | Full gallery ZIP download |
| `getWebSizeDownload()` | `portal-downloads.ts` | Web-optimized photos |
| `getHighResDownload()` | `portal-downloads.ts` | Original resolution photos |
| `getMarketingKitDownload()` | `portal-downloads.ts` | Marketing assets bundle |
| `getInvoicePaymentLink()` | `portal-downloads.ts` | Stripe checkout session |
| `getInvoicePdfDownload()` | `portal-downloads.ts` | Invoice PDF with QR code |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Client | findUnique | Client info (name, email, company) |
| PropertyWebsite | findMany | Client's properties |
| Project | findMany | Client's galleries |
| Asset | include | Gallery photos with URLs |
| Invoice | findMany | Client's invoices |
| InvoiceLineItem | include | Invoice line items |
| Payment | include | Payment history |
| ClientQuestionnaire | findMany | Assigned questionnaires |
| QuestionnaireTemplate | include | Template details |
| Booking | include | Related bookings |
| MarketingAsset | findMany | Downloadable marketing assets |
| Organization | include | Branding, Stripe Connect |

**Portal Tabs:**
| Tab | Purpose |
|-----|---------|
| Properties | View property websites |
| Galleries | Browse photos, manage favorites |
| Downloads | ZIP, web-size, high-res, marketing kit |
| Invoices | View invoices, pay, download PDF |
| Questionnaires | Complete assigned questionnaires |
| Settings | Client preferences |

**Client Features:**
- Favorites persistence (localStorage)
- Photo downloads (individual, ZIP, web-size, high-res)
- Selected photos download
- Invoice payment (Stripe)
- Invoice PDF download
- Questionnaire completion
- Lightbox viewer
- Mobile navigation

---

### `/portal/login` ✅ 🌐

**Page:** `src/app/(client-portal)/portal/login/page.tsx`

| Layer | File | Purpose |
|-------|------|---------|
| Client | `portal/login/page.tsx` | Full client component (magic link auth) |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `sendClientMagicLink()` | `client-auth.ts` | Generate and send magic link |

**API Routes:**
| Route | Purpose |
|-------|---------|
| `GET /api/auth/client?token=` | Validate magic link, create session |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| Client | findFirst | Lookup by email (case-insensitive) |
| ClientSession | create, delete | Magic link + session management |

**Authentication Flow:**
```
Email Form → sendClientMagicLink()
  → Find Client by email
  → Delete existing sessions (single-session model)
  → Create magic link (15 min expiry)
  → Send email via Resend
  → Client clicks link
  → /api/auth/client validates token
  → Create session (7 day expiry)
  → Set httpOnly cookie
  → Redirect to /portal
```

**Features:**
- Magic link authentication (passwordless)
- Email validation
- Session management (7-day expiry)
- One-time use tokens
- Responsive gradient background
- Loading states
- Success confirmation screen

---

### `/portal/questionnaires/[id]` ✅ 🔒

**Page:** `src/app/(client-portal)/portal/questionnaires/[id]/page.tsx`
**Dynamic:** `force-dynamic`

| Layer | File | Purpose |
|-------|------|---------|
| Page | `portal/questionnaires/[id]/page.tsx` | Server component, fetch questionnaire |
| Client | `portal/questionnaires/[id]/questionnaire-form.tsx` | Form with auto-save |

**Server Actions Called:**
| Action | File | Purpose |
|--------|------|---------|
| `getQuestionnaireForCompletion()` | `questionnaire-portal.ts` | Fetch with fields, agreements, responses |
| `saveQuestionnaireProgress()` | `questionnaire-portal.ts` | Auto-save (debounced 2s) |
| `submitQuestionnaireResponses()` | `questionnaire-portal.ts` | Final submission |
| `acceptAgreement()` | `questionnaire-portal.ts` | Sign legal agreements |

**Prisma Models Queried:**
| Model | Query Type | Purpose |
|-------|-----------|---------|
| ClientQuestionnaire | findUnique, update | Questionnaire with template |
| QuestionnaireTemplate | include | Fields and agreements |
| QuestionnaireField | include | Form fields |
| ClientQuestionnaireResponse | create, update | Save responses |
| ClientQuestionnaireAgreement | create | Accept agreements |
| QuestionnaireTemplateAgreement | include | Agreement content |
| Client | include | Client info for notifications |
| Organization | include | Send completion email |
| Booking | include | Booking context |

**Form Features:**
- Progress tracking (percentage complete)
- Auto-save (debounced 2 seconds, "Saving..." indicator)
- Dynamic form fields (14 types)
- Section grouping
- Help text and placeholder support

**Legal Agreements:**
- Content display with scrolling
- Signature pad (drawn, typed, or uploaded)
- Signature validation before acceptance
- Audit logging (IP, user agent, timestamp)

**Form States:**
`pending` → `in_progress` (on first access) → `completed` (on submission)

**Validation:**
- Required fields validation
- Required agreements acceptance
- Signature requirement validation

**Completion:**
- Email notification to photographer
- Includes response count and agreement count
- Creates email log entry

---

## API Routes

### Webhooks (6 routes)

#### `/api/webhooks/stripe` ✅

**File:** `src/app/api/webhooks/stripe/route.ts`
**Authentication:** Stripe HMAC-SHA256 signature (`stripe-signature` header)

| Event | Handler |
|-------|---------|
| `checkout.session.completed` | Process gallery/order payments, create Payment record, send confirmation email, Slack notify |
| `account.updated` | Update Stripe Connect onboarding status (charges_enabled, payouts_enabled) |
| `payment_intent.succeeded` | Backup handler for payments not via checkout session |
| `payment_intent.payment_failed` | Mark Payment as failed |
| `customer.subscription.created` | Process platform referral conversion |

---

#### `/api/webhooks/clerk` ✅

**File:** `src/app/api/webhooks/clerk/route.ts`
**Authentication:** Svix signature verification (`svix-id`, `svix-timestamp`, `svix-signature` headers)

| Event | Handler |
|-------|---------|
| `user.created` | Create/link User in DB, sync profile, process referral signup |
| `user.updated` | Sync user info (email, name, avatar) from Clerk |

---

#### `/api/webhooks/resend` ✅

**File:** `src/app/api/webhooks/resend/route.ts`
**Authentication:** HMAC-SHA256 signature (`resend-signature` header)

| Event | Handler |
|-------|---------|
| `email.sent`, `email.delivered`, `email.delivery_delayed` | Update EmailLog status |
| `email.bounced`, `email.complained` | Mark failed, record error |
| `email.opened`, `email.clicked` | Track analytics |

---

#### `/api/webhooks/twilio/status` ✅

**File:** `src/app/api/webhooks/twilio/status/route.ts`
**Authentication:** Twilio signature validation (`x-twilio-signature` header)

Updates SMS delivery status in `SMSLog`:
- `queued`, `sending`, `sent`, `delivered`, `failed`, `undelivered`
- Captures error codes and messages

---

#### `/api/webhooks/railway` ✅

**File:** `src/app/api/webhooks/railway/route.ts`
**Authentication:** Simple signature (`x-railway-signature` header)

| Event | Handler |
|-------|---------|
| `DEPLOY` with `FAILED` status | Trigger GitHub Actions workflow |

---

#### `/api/integrations/dropbox/webhook` ✅

**File:** `src/app/api/integrations/dropbox/webhook/route.ts`
**Authentication:** HMAC-SHA256 signature (`X-Dropbox-Signature` header)

| Method | Handler |
|--------|---------|
| GET | Webhook verification (challenge response) |
| POST | File change notification, trigger background sync |

---

### Cron Jobs (15 routes)

All cron endpoints require: `Authorization: Bearer ${CRON_SECRET}`

#### `/api/cron/send-reminders` ✅

**Schedule:** Every 15 minutes
Sends booking reminder emails (1h and 24h before)

---

#### `/api/cron/gallery-reminders` ✅

**Schedule:** Daily (10 AM)
Sends reminders for unviewed/unpaid galleries (2 days, 3 days, max 3 reminders)

---

#### `/api/cron/invoice-reminders` ✅

**Schedule:** Daily (9 AM)
Sends payment reminders for overdue invoices (every 3 days, max 5 reminders)

---

#### `/api/cron/questionnaire-reminders` ✅

**Schedule:** Daily (9 AM)
Sends questionnaire completion reminders (due within 3 days or overdue)

---

#### `/api/cron/photographer-digest` ✅

**Schedule:** Daily (8 AM)
Sends daily digest of questionnaire status to photographers

---

#### `/api/cron/recurring-invoices` ✅

**Schedule:** Daily (6 AM)
Processes and creates recurring invoices

---

#### `/api/cron/gallery-expiration` ✅

**Schedule:** Daily (9 AM)
Sends expiration warnings at 7, 3, and 1 day before expiry

---

#### `/api/cron/gallery-auto-archive` ✅

**Schedule:** Daily (midnight)
Archives expired galleries (respects org settings)

---

#### `/api/cron/late-fees` ✅

**Schedule:** Daily (midnight)
Updates invoices to "overdue", applies late fees (prevents multiple fees within 30 days)

---

#### `/api/cron/scheduled-invoices` ✅

**Schedule:** Every 15 minutes
Sends invoices with `scheduledSendAt <= now`

---

#### `/api/cron/booking-followups` ✅

**Schedule:** Daily
Sends post-booking follow-up emails (1d thank you, 3d review, 30/60/90d rebook)

---

#### `/api/cron/portfolio-publish` ✅

**Schedule:** Every 5-15 minutes
Publishes portfolios scheduled for publication

---

#### `/api/cron/portfolio-digest` ✅

**Schedule:** Weekly (Monday 9 AM)
Sends portfolio analytics summary

---

#### `/api/cron/property-digest` ✅

**Schedule:** Weekly (Monday 9 AM)
Sends property website analytics digest

---

#### `/api/cron/email-sync` ✅

**Schedule:** Every 5 minutes
Syncs emails for active email accounts (up to 50 accounts per run)

---

### Authentication (2 routes)

#### `/api/auth/client` ✅

**File:** `src/app/api/auth/client/route.ts`
**Method:** GET

Magic link validation for client portal:
- Validates token
- Creates session (7 day expiry)
- Sets httpOnly cookie
- Redirects to `/portal`

---

#### `/api/auth/client/dev-bypass` ✅

**File:** `src/app/api/auth/client/dev-bypass/route.ts`
**Method:** GET
**Security:** Development only (disabled in production unless `ENABLE_DEV_AUTH_BYPASS=true`)

Quick auth bypass for testing without magic links

---

### Gallery APIs (9 routes)

#### `/api/gallery/[id]/analytics-report` ✅

**Method:** GET | **Auth:** Clerk
Generates PDF analytics report for gallery

---

#### `/api/gallery/[id]/download-history` ✅

**Method:** GET | **Auth:** Session/Email
Fetches client's download history

---

#### `/api/gallery/[id]/favorites-export` ✅

**Method:** GET | **Auth:** Clerk
Exports favorites in CSV, ZIP, or JSON format

---

#### `/api/gallery/[id]/proof-sheet` ✅

**Method:** GET | **Auth:** Clerk
Generates PDF proof sheet (max 100 photos)

---

#### `/api/gallery/comment` ✅

**Methods:** GET, POST, DELETE | **Auth:** None (rate limited)
Manages gallery comments

---

#### `/api/gallery/favorite` ✅

**Methods:** GET, POST | **Auth:** Session-based
Toggles favorite photos

---

#### `/api/gallery/feedback` ✅

**Method:** POST | **Auth:** None (rate limited)
Submits gallery feedback (types: feedback, feature, issue)

---

#### `/api/gallery/rating` ✅

**Methods:** GET, POST, DELETE | **Auth:** Session-based
Photo rating (1-5 stars)

---

#### `/api/gallery/verify-password` ✅

**Methods:** GET, POST | **Auth:** None
Verifies gallery password, sets authentication cookie (24 hour expiry)

---

### Download APIs (2 routes)

#### `/api/download/[assetId]` ✅

**Method:** GET | **Auth:** Client Session or Delivery Slug
Downloads single photo, checks payment status, generates presigned URL

---

#### `/api/download/batch` ✅

**Method:** POST | **Auth:** Client Session or Delivery Slug

Batch download as ZIP:
- Streaming response with concurrency control (5 concurrent fetches)
- Watermark support with MLS preset resizing
- Activity logging & download tracking

---

### Upload APIs (4 routes)

#### `/api/upload/presigned-url` ✅

**Method:** POST | **Auth:** Clerk
Gets upload URLs for gallery photos (max 50 files)

---

#### `/api/upload/complete` ✅

**Method:** POST | **Auth:** Clerk
Registers uploaded assets in database

---

#### `/api/upload/profile-photo` ✅

**Method:** POST | **Auth:** Clerk
Gets upload URL for user avatar (max 5MB, JPG/PNG/WebP)

---

#### `/api/upload/booking-form` ✅

**Method:** POST | **Auth:** None (public)
Gets upload URL for booking form files (max 10MB, Images/PDF/DOC)

---

### Integration OAuth APIs (7 routes)

#### `/api/integrations/dropbox/authorize` ✅

**Method:** GET | **Auth:** Clerk
Starts Dropbox OAuth flow with PKCE

---

#### `/api/integrations/dropbox/callback` ✅

**Method:** GET | **Auth:** Clerk
Completes OAuth, saves tokens, creates initial folder structure

---

#### `/api/integrations/gmail/authorize` ✅

**Method:** GET | **Auth:** Clerk
Starts Gmail OAuth flow with PKCE

---

#### `/api/integrations/gmail/callback` ✅

**Method:** GET | **Auth:** Clerk
Completes Gmail OAuth, creates EmailAccount record

---

#### `/api/integrations/google/authorize` ✅

**Method:** GET | **Auth:** Clerk
Starts Google Calendar OAuth flow with PKCE

---

#### `/api/integrations/google/callback` ✅

**Method:** GET | **Auth:** Clerk
Completes Calendar OAuth, fetches user's calendars

---

#### `/api/integrations/slack` ✅

**Method:** POST | **Auth:** None
Placeholder for Slack integration

---

### Image Processing (1 route)

#### `/api/images/process` ✅

**Method:** POST | **Auth:** Clerk
Generates thumbnails & medium images (max 10 images per request)

---

### Form APIs (2 routes)

#### `/api/forms/submit` ✅

**Method:** POST | **Auth:** None
Custom form submission with IP geolocation, visitor tracking

---

#### `/api/portfolio/lead-capture` ✅

**Method:** POST | **Auth:** None
Portfolio lead capture, email validation, grants access cookie (30 days)

---

### Other APIs (4 routes)

#### `/api/calendar/ical/[token]` ✅

iCal feed export (RFC 5545 format)

---

#### `/api/invoices/bulk-pdf` ✅

Bulk invoice PDF generation

---

#### `/api/contracts/bulk-pdf` ✅

Bulk contract PDF generation

---

#### `/api/email-preview/[id]` ✅

Email template preview

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
| Dashboard Core | 5 | 5 | 100% |
| Galleries | 7 | 7 | 100% |
| Invoices & Billing | 15 | 15 | 100% |
| Clients | 5 | 5 | 100% |
| Scheduling | 10 | 10 | 100% |
| Contracts | 7 | 7 | 100% |
| Services & Products | 11 | 11 | 100% |
| Orders | 6 | 6 | 100% |
| Projects | 3 | 3 | 100% |
| Properties | 4 | 4 | 100% |
| Portfolios | 3 | 3 | 100% |
| Questionnaires & Forms | 8 | 8 | 100% |
| Leads | 3 | 3 | 100% |
| Settings | 35 | 35 | 100% |
| Public | 14 | 14 | 100% |
| Field Operations | 2 | 2 | 100% |
| Client Portal | 3 | 3 | 100% |
| API Routes | 52 | 52 | 100% |
| **TOTAL** | **193** | **193** | **100%** |

---

*This document is auto-generated from source code analysis. See [TRUTH_LEDGER.md](./TRUTH_LEDGER.md) for verification status.*
