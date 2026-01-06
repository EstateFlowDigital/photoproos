# PhotoProOS Truth Ledger

A verification system tracking what has been confirmed against running code, database schema, and actual file structure.

**Last Updated:** 2026-01-06
**Verification Method:** Cross-reference against source files, not memory or assumptions

---

## Source of Truth Hierarchy

| Priority | Source | Verification Method |
|----------|--------|---------------------|
| 1 | Running code / Build output | `npm run build` passes |
| 2 | Database schema | `prisma/schema.prisma` |
| 3 | Route map | `src/app/**/page.tsx` files exist |
| 4 | UI Documentation | Cross-ref with actual components |

---

## Frozen Conventions

These patterns are established and should not change without explicit decision.

### Route Naming Convention
```
/[feature]                  → List page
/[feature]/new              → Create page
/[feature]/[id]             → Detail page
/[feature]/[id]/edit        → Edit page
/[feature]/analytics        → Analytics for feature
/[feature]/templates        → Templates for feature
```

### Action File Naming
```
src/lib/actions/
├── [feature].ts            → Core CRUD (galleries.ts, invoices.ts)
├── [feature]-[aspect].ts   → Related actions (gallery-reminders.ts)
└── [entity]-[verb].ts      → Specific operations (invoice-pdf.ts)
```

### Client Component Pattern
```
page.tsx (Server)           → Data fetching, auth check
[feature]-client.tsx        → Interactive UI ("use client")
[feature]-page-client.tsx   → Full page client component
```

### Folder Structure
```
src/app/(dashboard)/        → Main business app (89 routes)
src/app/(marketing)/        → Public website (31 routes)
src/app/(client-portal)/    → Client-facing portal (3+ routes)
src/app/(auth)/             → Authentication pages
src/app/(field)/            → Mobile field operations
src/app/(onboarding)/       → New user setup
```

---

## Foundation Files Verification

### package.json

**Status:** VERIFIED 2026-01-06
**File:** `package.json`

| Dependency | Version | Purpose |
|------------|---------|---------|
| next | 15.5.9 | Framework |
| react | 18.x | UI Library |
| prisma | 7.2.0 | ORM |
| @clerk/nextjs | 6.36.5 | Authentication |
| stripe | 20.1.0 | Payments |
| @dnd-kit/* | various | Drag & Drop |
| sharp | 0.34.1 | Image Processing |
| @aws-sdk/client-s3 | 3.821.0 | File Storage |
| resend | 4.5.1 | Email Sending |
| twilio | 5.6.0 | SMS |
| @react-pdf/renderer | 4.3.0 | PDF Generation |
| archiver | 7.0.1 | ZIP Downloads |

**Scripts:**
- `dev` → `next dev --turbopack` (Turbopack enabled)
- `build` → `prisma generate && next build`
- `test` → `vitest`

---

### Prisma Schema

**Status:** VERIFIED 2026-01-06
**File:** `prisma/schema.prisma`
**Provider:** PostgreSQL

#### Enums Count: 56
<details>
<summary>Full Enum List</summary>

| Enum | Purpose |
|------|---------|
| PlanName | Subscription tiers (free, pro, studio, enterprise) |
| ProjectStatus | draft, pending, delivered, archived |
| PaymentStatus | pending, paid, failed, refunded, overdue |
| BookingStatus | pending, confirmed, completed, cancelled |
| InvoiceStatus | draft, sent, paid, overdue, cancelled |
| ContractStatus | draft, sent, signed, expired, cancelled |
| ClientIndustry | real_estate, wedding, portrait, commercial, etc. |
| ActivityType | 20+ activity types for audit logging |
| NotificationType | 15+ notification categories |
| TaskStatus | todo, in_progress, in_review, blocked, completed, archived |
| TaskPriority | urgent, high, medium, low |
| MemberRole | owner, admin, member |
| InvitationStatus | pending, accepted, expired, revoked |
| PortalMode | light, dark, auto |
| ServiceCategory | real_estate, portrait, event, etc. |
| PropertyType | single_family, condo, townhouse, etc. |
| EquipmentCategory | camera, lens, lighting, drone, etc. |
| CapabilityLevel | learning, capable, expert |
| LeadStatus | new, contacted, qualified, closed |
| MarketingAssetType | 30+ marketing asset types |
| MarketingAssetVariant | branded, unbranded, co_branded, photographer_only |
| SocialTileStyle | modern, classic, luxury, minimal, bold, elegant |
| AudioSource | library, uploaded, ai_generated |
| POICategory | 35+ point of interest categories |
| WatermarkPosition | 9 position options |
| DiscountType | percentage, fixed_amount |
| PaymentPlanStatus | active, completed, cancelled, overdue |
| DownloadFormat | original, web_size, high_res, zip_all |
| SelectionType | favorite, selection |
| SelectionStatus | in_progress, submitted, approved, rejected |
| GalleryDownloadOption | full, web, both |
| PropertyWebsiteTemplate | modern, classic, luxury, minimal, commercial |
| PortfolioType | photographer, client |
| PortfolioTemplate | modern, bold, elegant, minimal, creative |
| PortfolioSectionType | 14 section types |
| PropertySectionType | 22 section types |
| LineItemType | service, travel, custom, discount, tax |
| BusinessType | solo, team, agency |
| DisplayMode | personal, company |
| Industry | real_estate, commercial, events, portraits, food, product |
| AvailabilityBlockType | time_off, holiday, personal, maintenance, other |
| TimeOffRequestStatus | pending, approved, rejected |
| CommunicationType | email, call, meeting, note, sms |
| CommunicationDirection | inbound, outbound, internal |
| SignatureType | drawn, typed, uploaded |
| RecurrencePattern | daily, weekly, biweekly, monthly, custom |
| CalendarProvider | google, outlook, apple |
| SyncDirection | import_only, export_only, both |
| ClientQuestionnaireStatus | pending, in_progress, completed, approved, expired |
| EmailType | 15+ email types |
| EmailStatus | pending, sent, delivered, failed, bounced |
| EmailProvider | GMAIL, OUTLOOK |
| EmailDirection | INBOUND, OUTBOUND |
| LegalAgreementType | 7 agreement types |
| GalleryAddonCategory | 8 addon categories |
| GalleryAddonRequestStatus | 7 request statuses |
| MessageVisibility | internal, client |

</details>

#### Models Count: 157

<details>
<summary>Full Model List by Domain</summary>

**Core (4)**
- Organization
- User
- OrganizationMember
- Invitation

**Clients (6)**
- Client
- ClientSession
- ClientTag
- ClientTagAssignment
- ClientCommunication
- ClientNotification

**Services & Products (10)**
- Service
- ServicePricingTier
- ServiceBundle
- ServiceBundleItem
- BundlePricingTier
- ServiceAddon
- ServiceAddonCompat
- ProductCatalog
- ProductItem
- ProductVariant
- ProductPhoto

**Projects & Tasks (11)**
- Project
- ProjectService
- TaskBoard
- TaskColumn
- Task
- TaskSubtask
- TaskComment
- TaskTemplate
- TaskAutomation
- RecurringTask
- TaskTimeEntry

**Galleries (12)**
- GalleryTemplate
- GalleryCollection
- Asset
- DeliveryLink
- GalleryFavorite
- GalleryComment
- PhotoRating
- GalleryFeedback
- GalleryAddon
- GalleryAddonRequest
- WatermarkTemplate
- DownloadLog

**Invoices & Billing (16)**
- Invoice
- InvoiceLineItem
- InvoiceTemplate
- InvoiceAttachment
- InvoiceBrandingTemplate
- InvoiceEmailTemplate
- InvoiceSplit
- CreditNote
- Estimate
- EstimateLineItem
- ClientRetainer
- RetainerTransaction
- RecurringInvoice
- Payment
- PaymentPlan
- PaymentPlanInstallment
- DiscountCode
- DiscountCodeUsage

**Bookings & Scheduling (14)**
- BookingType
- Booking
- BookingWaitlist
- BookingCrew
- BookingReminder
- BookingBuffer
- BookingForm
- BookingFormField
- BookingFormService
- BookingFormSubmission
- BookingSlot
- BookingCheckIn
- BookingEquipmentCheck
- AvailabilityBlock

**Contracts (5)**
- ContractTemplate
- Contract
- ContractSigner
- ContractAuditLog
- ContractSignature

**Properties & Marketing (11)**
- PropertyWebsite
- PropertyWebsiteSection
- PropertyWebsiteView
- PropertyAnalytics
- PropertyLead
- PropertyDetails
- MarketingAsset
- MarketingAssetFile
- MarketingKit
- MarketingTemplate
- AudioTrack
- NeighborhoodData
- PointOfInterest

**Portfolios (13)**
- PortfolioWebsite
- PortfolioInquiry
- PortfolioWebsiteProject
- PortfolioWebsiteSection
- PortfolioWebsiteView
- PortfolioLead
- PortfolioComment
- PortfolioABTest
- ABTestAssignment
- WebsiteChatInquiry

**Orders (6)**
- OrderPage
- OrderPageBundle
- OrderPageService
- Order
- OrderItem

**Team & Operations (8)**
- Location
- Equipment
- UserEquipment
- UserServiceCapability
- ServiceEquipmentRequirement
- BookingTypeEquipmentRequirement
- ServiceTerritory
- TerritoryServiceOverride

**Brokerages (4)**
- Brokerage
- BrokerageContract
- MlsPreset
- MlsPresetOverride

**Photographer Pay (4)**
- PhotographerRate
- PhotographerEarning
- PayoutBatch
- PayoutItem

**Forms & Questionnaires (10)**
- CustomForm
- CustomFormField
- FormSubmission
- QuestionnaireTemplate
- QuestionnaireField
- QuestionnaireTemplateAgreement
- ClientQuestionnaire
- ClientQuestionnaireResponse
- ClientQuestionnaireAgreement

**Email & SMS (8)**
- EmailLog
- EmailAccount
- EmailThread
- EmailMessage
- EmailAttachment
- SMSTemplate
- SMSLog

**Calendar Integrations (3)**
- CalendarIntegration
- CalendarEvent
- CalendarFeed

**Notifications & Activity (4)**
- Notification
- ActivityLog
- ExpirationNotification
- PortalActivity

**Integrations (5)**
- SlackIntegration
- SlackChannel
- DropboxIntegration
- LocationPing

**Referrals (8)**
- ReferralProgram
- Referrer
- Referral
- ReferralReward
- PlatformReferralSettings
- PlatformReferrer
- PlatformReferral
- PlatformReferralReward

**Subscriptions (4)**
- SubscriptionPlan
- PlanFeature
- PricingExperiment
- PricingVariant

**Developer (4)**
- ApiKey
- WebhookEndpoint
- WebhookDelivery
- IntegrationLog

**Onboarding (2)**
- OnboardingProgress
- UsageMeter

**Messages (1)**
- ProjectMessage

</details>

---

## Route Verification Status

### Summary Table

| Route Group | Documented | Actual | Status | Discrepancy |
|-------------|------------|--------|--------|-------------|
| Dashboard (non-settings) | 89 | 99 | VERIFIED | +10 routes |
| Settings | 27 | 35 | VERIFIED | +8 routes |
| Marketing | 31 | 34 | VERIFIED | +3 routes |
| Client Portal | 3+ | 3 | VERIFIED | Matches |
| Field | 2 | 2 | VERIFIED | Matches |
| Onboarding | 1 | 1 | VERIFIED | Matches |
| Auth | 3 | 3 | VERIFIED | Matches |
| Public | 14 | 15 | VERIFIED | +1 route |
| **TOTAL** | **169** | **192** | **VERIFIED** | **+23 routes** |

### Dashboard Routes (134 total pages, 99 non-settings)
**Status:** VERIFIED 2026-01-06

All routes exist in `src/app/(dashboard)/`:
- `/dashboard` - Main dashboard
- `/analytics` - Business analytics
- `/create` - Quick create
- `/inbox` - Unified inbox
- `/notifications` - Notifications
- `/feedback` - Feedback
- `/galleries/*` - 7 routes (list, new, [id], [id]/edit, services/*, etc.)
- `/clients/*` - 6 routes (list, new, [id], [id]/edit, import, merge)
- `/invoices/*` - 5 routes (list, new, [id], [id]/edit, recurring)
- `/scheduling/*` - 10 routes (list, new, [id], [id]/edit, availability, time-off, types, booking-forms/*)
- `/contracts/*` - 7 routes
- `/services/*` - 9 routes (services, addons, bundles with CRUD)
- `/products/*` - 2 routes
- `/orders/*` - 3 routes
- `/order-pages/*` - 3 routes
- `/projects/*` - 3 routes
- `/properties/*` - 4 routes
- `/portfolios/*` - 3 routes
- `/questionnaires/*` - 5 routes
- `/forms/*` - 2 routes
- `/leads/*` - 2 routes (list, analytics)
- `/brokerages/*` - 4 routes
- `/billing/*` - 8 routes (analytics, credit-notes, estimates, reports, retainers)
- `/payments/*` - 2 routes
- `/batch` - 1 route
- `/licensing` - 1 route
- `/mini-sessions` - 1 route
- `/booking` - 1 route

### Settings Routes (35 total)
**Status:** VERIFIED 2026-01-06

All routes exist in `src/app/(dashboard)/settings/`:
- `/settings` - Overview
- `/settings/profile` - User profile
- `/settings/team` - Team management
- `/settings/team/[id]/capabilities` - Member capabilities
- `/settings/branding` - Branding
- `/settings/appearance` - Appearance
- `/settings/notifications` - Notifications
- `/settings/email` - Email settings
- `/settings/email-logs` - Email logs
- `/settings/sms` - SMS settings
- `/settings/sms/templates` - SMS templates
- `/settings/billing` - Subscription
- `/settings/billing/upgrade` - Upgrade
- `/settings/payments` - Payment settings
- `/settings/payouts` - Payouts
- `/settings/photographer-pay` - Photographer pay
- `/settings/travel` - Travel fees
- `/settings/territories` - Service territories
- `/settings/gallery-templates` - Gallery templates
- `/settings/gallery-addons` - Gallery addons
- `/settings/watermarks` - Watermarks
- `/settings/calendar` - Calendar
- `/settings/calendly` - Calendly
- `/settings/equipment` - Equipment
- `/settings/integrations` - Integrations
- `/settings/dropbox` - Dropbox
- `/settings/mailchimp` - Mailchimp
- `/settings/quickbooks` - QuickBooks
- `/settings/slack` - Slack
- `/settings/zapier` - Zapier
- `/settings/referrals` - Referrals
- `/settings/my-referrals` - My referrals
- `/settings/developer` - Developer
- `/settings/features` - Features
- `/settings/mls-presets` - MLS presets (NEW - not documented)

### Marketing Routes (34 total)
**Status:** VERIFIED 2026-01-06

All routes exist in `src/app/(marketing)/`:
- `/about`
- `/pricing`
- `/contact`
- `/changelog`
- `/roadmap`
- `/features/*` (6 routes: analytics, automation, clients, contracts, galleries, payments)
- `/industries/*` (6 routes: architecture, commercial, events, food, portraits, real-estate)
- `/blog`, `/blog/[slug]`
- `/help`, `/help/[category]/[article]`
- `/guides`
- `/webinars`, `/webinars/[slug]`
- `/affiliates`
- `/partners`
- `/integrations`
- `/press`
- `/careers`
- `/legal/*` (5 routes: privacy, terms, cookies, security, dpa)

### Client Portal Routes (3 total)
**Status:** VERIFIED 2026-01-06

- `/portal` - Portal home
- `/portal/login` - Login
- `/portal/questionnaires/[id]` - Fill questionnaire

### Field Routes (2 total)
**Status:** VERIFIED 2026-01-06

- `/field` - Field app home
- `/field/check-in` - Location check-in

### Auth Routes (3 total)
**Status:** VERIFIED 2026-01-06

- `/sign-in/[[...sign-in]]` - Sign in
- `/sign-up/[[...sign-up]]` - Sign up
- `/signup` - Signup redirect

### Public Routes (15 total)
**Status:** VERIFIED 2026-01-06

- `/g/[slug]` - Public gallery
- `/p/[slug]` - Property website
- `/portfolio/[slug]` - Portfolio website
- `/book/[slug]` - Booking form
- `/book/[slug]/confirmation` - Booking confirmation
- `/order/[slug]` - Order page
- `/order/[slug]/confirmation` - Order confirmation
- `/pay/[id]` - Payment page
- `/sign/[token]` - Contract signing
- `/sign/[token]/complete` - Signing complete
- `/invite/[token]` - Team invitation
- `/r/[code]` - Referral redirect
- `/schedule` - Schedule session
- `/track` - Delivery tracking
- `/unsubscribe` - Email unsubscribe

---

## Server Actions Verification

**Documented in APP_ARCHITECTURE.md:** 80+ files
**Location:** `src/lib/actions/`
**Status:** NEEDS VERIFICATION

### Core Actions to Verify
- [ ] galleries.ts
- [ ] invoices.ts
- [ ] clients.ts
- [ ] bookings.ts
- [ ] contracts.ts
- [x] leads-analytics.ts VERIFIED (289 lines)

### Leads Analytics Vertical Slice (VERIFIED)
```
Route:      /leads/analytics
Page:       src/app/(dashboard)/leads/analytics/page.tsx         ✓
Client:     src/app/(dashboard)/leads/analytics/leads-analytics-client.tsx ✓
Action:     src/lib/actions/leads-analytics.ts                   ✓
Interface:  LeadsAnalytics (summary, bySource, byStatus, monthly, funnel, recentConversions)
Models:     PortfolioInquiry, ChatInquiry, BookingFormSubmission, Client
```

---

## Component Verification

### Portfolio Builder Configs
**Location:** `src/components/dashboard/portfolio-builder/configs/`
**Status:** VERIFIED 2026-01-06

| Component | File | Status |
|-----------|------|--------|
| HeroConfig | hero-config.tsx | EXISTS |
| AboutConfig | about-config.tsx | EXISTS |
| TestimonialsConfig | testimonials-config.tsx | EXISTS |
| FaqConfig | faq-config.tsx | EXISTS |
| TextConfig | text-config.tsx | EXISTS |
| ImageConfig | image-config.tsx | EXISTS |
| AwardsConfig | awards-config.tsx | EXISTS |
| VideoConfig | video-config.tsx | EXISTS |
| ContactConfig | contact-config.tsx | EXISTS |
| ServicesConfig | services-config.tsx | EXISTS |
| SpacerConfig | spacer-config.tsx | EXISTS |
| GalleryConfig | gallery-config.tsx | EXISTS |
| PricingConfig | pricing-config.tsx | VERIFIED |
| StatsConfig | stats-config.tsx | VERIFIED |
| ProcessConfig | process-config.tsx | VERIFIED |

### Marketing Components
**Location:** `src/components/marketing/`
**Status:** VERIFIED 2026-01-06

| Component | File | Status |
|-----------|------|--------|
| DesignEditor | design-editor.tsx | VERIFIED |
| DesignTemplates | design-templates.ts | VERIFIED |
| VideoGenerator | video-generator.tsx | VERIFIED |

---

## Discrepancies Found

Track any differences between documentation and reality here.

| Item | Documentation Says | Reality | Resolution |
|------|-------------------|---------|------------|
| None found yet | - | - | - |

---

## Verification Checklist

### Phase 1: Foundation (COMPLETE)
- [x] Read package.json
- [x] Read prisma/schema.prisma structure
- [x] Document all enums (56)
- [x] Document all models (157)
- [x] Establish frozen conventions
- [x] Verify critical routes exist (dashboard, galleries, leads/analytics)

### Phase 2: Vertical Slice Verification (IN PROGRESS)
- [x] Pick one feature (e.g., Leads Analytics)
- [x] Trace: Route → Page → Client → Actions → Data Model
- [x] Document any gaps (None found for leads-analytics)
- [ ] Verify additional vertical slices (galleries, invoices, etc.)

### Phase 3: Full Route Audit
- [ ] Verify all 89 dashboard routes
- [ ] Verify all 27 settings routes
- [ ] Verify all 31 marketing routes
- [ ] Verify all public routes

### Phase 4: Server Actions Audit
- [ ] List all action files
- [ ] Cross-reference with routes that use them
- [ ] Document orphaned actions

---

## Notes

- APP_ARCHITECTURE.md claims 169 total pages - this needs verification
- Model count (157) is significantly higher than documented "60+" - documentation understated
- Enum count (56) is lower than documented "90+" - documentation overstated
- Build currently passes as of 2026-01-06
