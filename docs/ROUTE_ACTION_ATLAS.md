# PhotoProOS Route-to-Action Atlas

A comprehensive mapping of every route to its data flow: Route → Page → Client → Actions → Models.

**Last Updated:** 2026-01-06
**Total Routes Mapped:** 33 / 192
**Verification Status:** IN PROGRESS (17% complete)

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

### `/services/addons` ❌ 🔒

*To be mapped*

---

### `/services/bundles` ❌ 🔒

*To be mapped*

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

### `/order-pages` ❌ 🔒

*To be mapped*

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

### `/portfolio/[slug]` ❌ 🌐

**Page:** `src/app/portfolio/[slug]/page.tsx`

Portfolio website.

*To be mapped*

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

### `/portal/questionnaires/[id]` ❌ 🔒

**Page:** `src/app/(client-portal)/portal/questionnaires/[id]/page.tsx`
**Client:** `questionnaire-form.tsx`

*To be mapped*

---

## API Routes

### Webhooks

#### `/api/webhooks/stripe` ✅

**File:** `src/app/api/webhooks/stripe/route.ts`

Handles 5 Stripe event types:

| Event | Handler |
|-------|---------|
| `checkout.session.completed` | Process gallery/order payments, create Payment record, send confirmation email, Slack notify |
| `account.updated` | Update Stripe Connect onboarding status (charges_enabled, payouts_enabled) |
| `payment_intent.succeeded` | Backup handler for payments not via checkout session |
| `payment_intent.payment_failed` | Mark Payment as failed |
| `customer.subscription.created` | Process platform referral conversion |

#### `/api/webhooks/clerk` ✅

**File:** `src/app/api/webhooks/clerk/route.ts`

Handles 2 Clerk event types:

| Event | Handler |
|-------|---------|
| `user.created` | Create/link User in DB, sync profile, process referral signup |
| `user.updated` | Sync user info (email, name, avatar) from Clerk |

Both use signature verification (Stripe HMAC, Clerk Svix).

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
| Dashboard Core | 6 | 3 | 50% |
| Galleries | 7 | 2 | 29% |
| Invoices & Billing | 12 | 2 | 17% |
| Clients | 6 | 2 | 33% |
| Scheduling | 10 | 1 | 10% |
| Contracts | 7 | 1 | 14% |
| Services | 9 | 1 | 11% |
| Orders | 6 | 1 | 17% |
| Projects | 3 | 1 | 33% |
| Properties | 4 | 1 | 25% |
| Portfolios | 3 | 1 | 33% |
| Questionnaires | 7 | 1 | 14% |
| Leads | 6 | 2 | 33% |
| Settings | 35 | 0 | 0% |
| Public | 15 | 5 | 33% |
| Client Portal | 3 | 1 | 33% |
| API Routes | 58 | 2 | 3% |
| **TOTAL** | **192** | **26** | **14%** |

---

*This document is auto-generated from source code analysis. See [TRUTH_LEDGER.md](./TRUTH_LEDGER.md) for verification status.*
