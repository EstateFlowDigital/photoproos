# PhotoProOS Complete App Architecture

A comprehensive guide to the application structure, showing routes, file paths, components, and their relationships.

---

## Table of Contents

1. [Route Groups & Layouts](#route-groups--layouts)
2. [Dashboard Routes](#dashboard-routes)
3. [Settings Routes](#settings-routes)
4. [Client Portal Routes](#client-portal-routes)
5. [Marketing Routes](#marketing-routes)
6. [Public Routes](#public-routes)
7. [API Routes](#api-routes)
8. [Component Library](#component-library)
9. [Server Actions](#server-actions)
10. [Providers & Context](#providers--context)
11. [Relationship Diagrams](#relationship-diagrams)

---

## Route Groups & Layouts

### Root Layout
```
📄 src/app/layout.tsx
├── ClerkProvider (authentication)
├── ThemeProvider (light/dark mode)
├── PerfOverlay (dev debugging)
└── Skip-to-main-content (a11y)
```

### Route Group Hierarchy

| Route Group | Layout File | Purpose | Providers |
|-------------|-------------|---------|-----------|
| `(dashboard)` | `src/app/(dashboard)/layout.tsx` | Main business app | Toast, Confirm, Upload, Tour, CommandPalette, KeyboardShortcuts |
| `(marketing)` | `src/app/(marketing)/layout.tsx` | Public website | Navbar + Footer |
| `(client-portal)` | `src/app/(client-portal)/layout.tsx` | Client-facing portal | Toast |
| `(auth)` | `src/app/(auth)/layout.tsx` | Authentication pages | Clerk components |
| `(field)` | `src/app/(field)/layout.tsx` | Mobile field ops | ClerkProvider only |
| `(onboarding)` | `src/app/(onboarding)/layout.tsx` | New user setup | Minimal |

---

## Dashboard Routes

### Main Dashboard
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/dashboard` | `src/app/(dashboard)/dashboard/page.tsx` | `DashboardPageClient` | Main dashboard overview |
| `/analytics` | `src/app/(dashboard)/analytics/page.tsx` | `AnalyticsDashboardClient` | Business analytics |
| `/create` | `src/app/(dashboard)/create/page.tsx` | - | Quick create menu |
| `/inbox` | `src/app/(dashboard)/inbox/page.tsx` | `InboxPageClient` | Unified message inbox |
| `/notifications` | `src/app/(dashboard)/notifications/page.tsx` | `NotificationsPageClient` | Notification center |
| `/feedback` | `src/app/(dashboard)/feedback/page.tsx` | - | User feedback |

**Dashboard Components Used:**
```
src/components/dashboard/
├── stat-card.tsx              → StatCard (metrics display)
├── revenue-chart.tsx          → RevenueChart, RevenueSparkline
├── overdue-invoices.tsx       → OverdueInvoicesWidget
├── expiring-galleries.tsx     → ExpiringGalleriesWidget
├── quick-actions.tsx          → QuickActions (dynamic)
├── upcoming-bookings.tsx      → UpcomingBookings (dynamic)
├── dashboard-calendar.tsx     → DashboardCalendar (dynamic)
├── onboarding-checklist.tsx   → OnboardingChecklist (dynamic)
└── dashboard-customize-panel.tsx → DashboardCustomizePanel (dynamic)
```

---

### Galleries
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/galleries` | `src/app/(dashboard)/galleries/page.tsx` | `src/app/(dashboard)/galleries/gallery-list-client.tsx` | Gallery list |
| `/galleries/new` | `src/app/(dashboard)/galleries/new/page.tsx` | `src/app/(dashboard)/galleries/new/gallery-new-form.tsx` | Create gallery |
| `/galleries/[id]` | `src/app/(dashboard)/galleries/[id]/page.tsx` | `src/app/(dashboard)/galleries/[id]/gallery-detail-client.tsx` | Gallery detail/editor |
| `/galleries/[id]/edit` | `src/app/(dashboard)/galleries/[id]/edit/page.tsx` | - | Edit gallery settings |
| `/galleries/services` | `src/app/(dashboard)/galleries/services/page.tsx` | - | Gallery services list |
| `/galleries/services/new` | `src/app/(dashboard)/galleries/services/new/page.tsx` | - | Create gallery service |
| `/galleries/services/[id]` | `src/app/(dashboard)/galleries/services/[id]/page.tsx` | - | Edit gallery service |

**Gallery Components:**
```
src/components/gallery/
├── analytics-dashboard.tsx        → AnalyticsDashboard (views, downloads, engagement)
├── activity-timeline.tsx          → ActivityTimeline (client activity feed)
├── collection-manager.tsx         → CollectionManager (photo collections)
├── smart-collections-panel.tsx    → SmartCollectionsPanel (AI-powered collections)
├── assign-to-collection-modal.tsx → AssignToCollectionModal
├── selections-review-panel.tsx    → SelectionsReviewPanel (client selections)
├── selection-panel.tsx            → SelectionPanel
├── photo-comparison-modal.tsx     → PhotoComparisonModal
└── addon-requests-panel.tsx       → AddonRequestsPanel

src/components/dashboard/
├── gallery-card.tsx               → GalleryCard (grid display)
├── create-gallery-modal.tsx       → CreateGalleryModal
└── empty-galleries.tsx            → EmptyGalleries
```

**Server Actions:**
```
src/lib/actions/
├── galleries.ts                   → CRUD, reorder, deliver, archive
├── gallery-reminders.ts           → Expiration reminders
├── gallery-templates.ts           → Template management
├── gallery-feedback.ts            → Client feedback
├── gallery-activity.ts            → Activity tracking
├── gallery-collections.ts         → Collection management
├── gallery-analytics.ts           → Analytics data
└── gallery-addons.ts              → Add-on requests
```

---

### Clients
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/clients` | `src/app/(dashboard)/clients/page.tsx` | `src/app/(dashboard)/clients/clients-page-client.tsx` | Client list |
| `/clients/new` | `src/app/(dashboard)/clients/new/page.tsx` | - | Create client |
| `/clients/[id]` | `src/app/(dashboard)/clients/[id]/page.tsx` | - | Client detail |
| `/clients/[id]/edit` | `src/app/(dashboard)/clients/[id]/edit/page.tsx` | - | Edit client |
| `/clients/import` | `src/app/(dashboard)/clients/import/page.tsx` | - | Import clients |
| `/clients/merge` | `src/app/(dashboard)/clients/merge/page.tsx` | - | Merge duplicates |

**Client Components:**
```
src/components/dashboard/
├── client-card.tsx                → ClientCard
├── create-client-modal.tsx        → CreateClientModal
└── empty-clients.tsx              → EmptyClients

src/components/modals/
└── create-client-modal.tsx        → CreateClientModal
```

**Server Actions:**
```
src/lib/actions/
├── clients.ts                     → CRUD operations
├── client-communications.ts       → Communication history
├── client-notifications.ts        → Notification preferences
├── client-import.ts               → Import from CSV/other sources
├── client-merge.ts                → Duplicate merging
├── client-tags.ts                 → Tagging system
├── client-questionnaires.ts       → Questionnaire assignments
└── client-selections.ts           → Photo selections
```

---

### Invoices & Billing
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/invoices` | `src/app/(dashboard)/invoices/page.tsx` | `InvoicesPageClient` | Invoice list |
| `/invoices/new` | `src/app/(dashboard)/invoices/new/page.tsx` | - | Create invoice |
| `/invoices/[id]` | `src/app/(dashboard)/invoices/[id]/page.tsx` | - | Invoice detail |
| `/invoices/[id]/edit` | `src/app/(dashboard)/invoices/[id]/edit/page.tsx` | - | Edit invoice |
| `/invoices/recurring` | `src/app/(dashboard)/invoices/recurring/page.tsx` | `src/app/(dashboard)/invoices/recurring/recurring-invoices-client.tsx` | Recurring invoices |
| `/billing` | `src/app/(dashboard)/billing/page.tsx` | - | Billing overview hub |
| `/billing/analytics` | `src/app/(dashboard)/billing/analytics/page.tsx` | - | Billing analytics |
| `/billing/credit-notes` | `src/app/(dashboard)/billing/credit-notes/page.tsx` | `src/app/(dashboard)/billing/credit-notes/credit-notes-page-client.tsx` | Credit notes |
| `/billing/credit-notes/new` | `src/app/(dashboard)/billing/credit-notes/new/page.tsx` | - | Create credit note |
| `/billing/credit-notes/[id]` | `src/app/(dashboard)/billing/credit-notes/[id]/page.tsx` | - | Credit note detail |
| `/billing/estimates` | `src/app/(dashboard)/billing/estimates/page.tsx` | `src/app/(dashboard)/billing/estimates/estimates-list-client.tsx` | Estimates list |
| `/billing/estimates/new` | `src/app/(dashboard)/billing/estimates/new/page.tsx` | - | Create estimate |
| `/billing/estimates/[id]` | `src/app/(dashboard)/billing/estimates/[id]/page.tsx` | - | Estimate detail |
| `/billing/estimates/[id]/edit` | `src/app/(dashboard)/billing/estimates/[id]/edit/page.tsx` | - | Edit estimate |
| `/billing/reports` | `src/app/(dashboard)/billing/reports/page.tsx` | - | Billing reports |
| `/billing/retainers` | `src/app/(dashboard)/billing/retainers/page.tsx` | - | Retainers list |
| `/billing/retainers/[id]` | `src/app/(dashboard)/billing/retainers/[id]/page.tsx` | - | Retainer detail |
| `/payments` | `src/app/(dashboard)/payments/page.tsx` | `src/app/(dashboard)/payments/payments-page-client.tsx` | Payments list |
| `/payments/[id]` | `src/app/(dashboard)/payments/[id]/page.tsx` | - | Payment detail |

**Invoice Components:**
```
src/components/dashboard/
├── invoice-builder.tsx            → InvoiceBuilder (line items)
├── invoice-card.tsx               → InvoiceCard
└── overdue-invoices.tsx           → OverdueInvoicesWidget
```

**Server Actions:**
```
src/lib/actions/
├── invoices.ts                    → CRUD, send, mark paid
├── recurring-invoices.ts          → Recurring invoice management
├── invoice-analytics.ts           → Invoice metrics
├── invoice-pdf.ts                 → PDF generation
├── invoice-payments.ts            → Payment processing
├── invoice-attachments.ts         → File attachments
├── invoice-presets.ts             → Invoice templates
├── invoice-email-templates.ts     → Email templates
├── invoice-splits.ts              → Split payments
├── estimates.ts                   → Estimate management
├── credit-notes.ts                → Credit note management
├── retainers.ts                   → Retainer management
├── payments.ts                    → Payment records
└── payment-plans.ts               → Payment plan management
```

---

### Scheduling & Booking
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/scheduling` | `src/app/(dashboard)/scheduling/page.tsx` | - | Calendar view |
| `/scheduling/new` | `src/app/(dashboard)/scheduling/new/page.tsx` | - | Create booking |
| `/scheduling/[id]` | `src/app/(dashboard)/scheduling/[id]/page.tsx` | - | Booking detail |
| `/scheduling/[id]/edit` | `src/app/(dashboard)/scheduling/[id]/edit/page.tsx` | - | Edit booking |
| `/scheduling/availability` | `src/app/(dashboard)/scheduling/availability/page.tsx` | - | Availability settings |
| `/scheduling/time-off` | `src/app/(dashboard)/scheduling/time-off/page.tsx` | - | Time off management |
| `/scheduling/types` | `src/app/(dashboard)/scheduling/types/page.tsx` | - | Booking types |
| `/scheduling/booking-forms` | `src/app/(dashboard)/scheduling/booking-forms/page.tsx` | - | Booking forms list |
| `/scheduling/booking-forms/[id]` | `src/app/(dashboard)/scheduling/booking-forms/[id]/page.tsx` | - | Booking form detail |
| `/scheduling/booking-forms/[id]/submissions` | `src/app/(dashboard)/scheduling/booking-forms/[id]/submissions/page.tsx` | - | Form submissions |
| `/booking` | `src/app/(dashboard)/booking/page.tsx` | - | Booking management |
| `/mini-sessions` | `src/app/(dashboard)/mini-sessions/page.tsx` | - | Mini sessions |

**Server Actions:**
```
src/lib/actions/
├── bookings.ts                    → Booking CRUD
├── booking-forms.ts               → Form management
├── booking-types.ts               → Booking type config
├── booking-crew.ts                → Crew assignment
├── booking-import.ts              → Import bookings
├── availability.ts                → Availability rules
└── team-availability.ts           → Team scheduling
```

---

### Contracts
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/contracts` | `src/app/(dashboard)/contracts/page.tsx` | - | Contracts list |
| `/contracts/new` | `src/app/(dashboard)/contracts/new/page.tsx` | - | Create contract |
| `/contracts/[id]` | `src/app/(dashboard)/contracts/[id]/page.tsx` | - | Contract detail |
| `/contracts/[id]/edit` | `src/app/(dashboard)/contracts/[id]/edit/page.tsx` | - | Edit contract |
| `/contracts/templates` | `src/app/(dashboard)/contracts/templates/page.tsx` | - | Contract templates |
| `/contracts/templates/new` | `src/app/(dashboard)/contracts/templates/new/page.tsx` | - | Create template |
| `/contracts/templates/[id]` | `src/app/(dashboard)/contracts/templates/[id]/page.tsx` | - | Edit template |

**Server Actions:**
```
src/lib/actions/
├── contracts.ts                   → Contract CRUD
├── contract-pdf.ts                → PDF generation
├── contract-signing.ts            → E-signature flow
├── contract-templates.ts          → Template management
└── brokerage-contracts.ts         → Brokerage-specific contracts
```

---

### Services & Products
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/services` | `src/app/(dashboard)/services/page.tsx` | - | Services list |
| `/services/new` | `src/app/(dashboard)/services/new/page.tsx` | - | Create service |
| `/services/[id]` | `src/app/(dashboard)/services/[id]/page.tsx` | - | Service detail |
| `/services/addons` | `src/app/(dashboard)/services/addons/page.tsx` | - | Add-ons list |
| `/services/addons/new` | `src/app/(dashboard)/services/addons/new/page.tsx` | - | Create add-on |
| `/services/addons/[id]` | `src/app/(dashboard)/services/addons/[id]/page.tsx` | - | Add-on detail |
| `/services/bundles` | `src/app/(dashboard)/services/bundles/page.tsx` | - | Bundles list |
| `/services/bundles/new` | `src/app/(dashboard)/services/bundles/new/page.tsx` | - | Create bundle |
| `/services/bundles/[id]` | `src/app/(dashboard)/services/bundles/[id]/page.tsx` | - | Bundle detail |
| `/products` | `src/app/(dashboard)/products/page.tsx` | - | Product catalog |
| `/products/[catalogId]` | `src/app/(dashboard)/products/[catalogId]/page.tsx` | - | Catalog detail |
| `/licensing` | `src/app/(dashboard)/licensing/page.tsx` | - | License management |

**Service Components:**
```
src/components/dashboard/
├── service-form.tsx               → ServiceForm
├── service-selector.tsx           → ServiceSelector (multi-select)
├── addon-form.tsx                 → AddonForm
├── addon-list.tsx                 → AddonList
├── bundle-form.tsx                → BundleForm
└── bundle-list.tsx                → BundleList
```

**Server Actions:**
```
src/lib/actions/
├── products.ts                    → Service CRUD
├── bundles.ts                     → Bundle management
└── addons.ts                      → Add-on management
```

---

### Orders
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/orders` | `src/app/(dashboard)/orders/page.tsx` | `src/app/(dashboard)/orders/orders-page-client.tsx` | Orders list |
| `/orders/[id]` | `src/app/(dashboard)/orders/[id]/page.tsx` | - | Order detail |
| `/orders/analytics` | `src/app/(dashboard)/orders/analytics/page.tsx` | `src/app/(dashboard)/orders/analytics/sqft-analytics-client.tsx` | Order analytics |
| `/order-pages` | `src/app/(dashboard)/order-pages/page.tsx` | - | Order pages list |
| `/order-pages/new` | `src/app/(dashboard)/order-pages/new/page.tsx` | - | Create order page |
| `/order-pages/[id]` | `src/app/(dashboard)/order-pages/[id]/page.tsx` | - | Order page detail |

**Server Actions:**
```
src/lib/actions/
├── orders.ts                      → Order management
└── order-pages.ts                 → Order page config
```

---

### Projects & Tasks
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/projects` | `src/app/(dashboard)/projects/page.tsx` | `src/app/(dashboard)/projects/projects-client.tsx` | Projects list |
| `/projects/analytics` | `src/app/(dashboard)/projects/analytics/page.tsx` | - | Project analytics |
| `/projects/tasks/[id]` | `src/app/(dashboard)/projects/tasks/[id]/page.tsx` | - | Task detail |

**Server Actions:**
```
src/lib/actions/
└── projects.ts                    → Project & task management
```

---

### Properties (Real Estate)
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/properties` | `src/app/(dashboard)/properties/page.tsx` | - | Properties list |
| `/properties/new` | `src/app/(dashboard)/properties/new/page.tsx` | - | Create property |
| `/properties/[id]` | `src/app/(dashboard)/properties/[id]/page.tsx` | - | Property detail |
| `/properties/[id]/edit` | `src/app/(dashboard)/properties/[id]/edit/page.tsx` | - | Edit property |

**Property Tabs:**
```
src/app/(dashboard)/properties/[id]/tabs/
├── overview-tab.tsx               → Property overview
├── photos-tab.tsx                 → Photo management
├── sections-tab.tsx               → Section builder (drag-drop)
├── marketing-tab.tsx              → Marketing materials
├── analytics-tab.tsx              → Property analytics
└── settings-tab.tsx               → Property settings
```

**Server Actions:**
```
src/lib/actions/
├── properties.ts                  → Property CRUD
├── property-websites.ts           → Website management
└── property-sections.ts           → Section builder actions
```

---

### Portfolios
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/portfolios` | `src/app/(dashboard)/portfolios/page.tsx` | - | Portfolios list |
| `/portfolios/new` | `src/app/(dashboard)/portfolios/new/page.tsx` | - | Create portfolio |
| `/portfolios/[id]` | `src/app/(dashboard)/portfolios/[id]/page.tsx` | - | Portfolio editor |

**Portfolio Builder:**
```
src/components/dashboard/portfolio-builder/
├── portfolio-builder.tsx          → Main builder component
├── section-renderer.tsx           → Section display
├── configs/
│   ├── gallery-config.tsx         → Gallery section config
│   ├── spacer-config.tsx          → Spacer config
│   └── ...                        → Other section configs
```

**Server Actions:**
```
src/lib/actions/
├── portfolios.ts                  → Portfolio CRUD
└── portfolio-sections.ts          → Section management
```

---

### Questionnaires
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/questionnaires` | `src/app/(dashboard)/questionnaires/page.tsx` | - | Overview |
| `/questionnaires/templates/[id]` | `src/app/(dashboard)/questionnaires/templates/[id]/page.tsx` | - | Template detail |
| `/questionnaires/templates/[id]/preview` | `src/app/(dashboard)/questionnaires/templates/[id]/preview/page.tsx` | - | Template preview |
| `/questionnaires/templates/new` | `src/app/(dashboard)/questionnaires/templates/new/page.tsx` | - | Create template |
| `/questionnaires/assigned/[id]` | `src/app/(dashboard)/questionnaires/assigned/[id]/page.tsx` | - | Assigned questionnaire |
| `/forms` | `src/app/(dashboard)/forms/page.tsx` | - | Forms list |
| `/forms/[id]` | `src/app/(dashboard)/forms/[id]/page.tsx` | - | Form detail |

**Server Actions:**
```
src/lib/actions/
├── questionnaires.ts              → Template CRUD
├── questionnaire-responses.ts     → Response management
└── questionnaire-portal.ts        → Portal-facing actions
```

---

### Leads & CRM
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/leads` | `src/app/(dashboard)/leads/page.tsx` | `src/app/(dashboard)/leads/leads-page-client.tsx` | Leads management |
| `/leads/analytics` | `src/app/(dashboard)/leads/analytics/page.tsx` | `src/app/(dashboard)/leads/analytics/leads-analytics-client.tsx` | Leads analytics dashboard |
| `/brokerages` | `src/app/(dashboard)/brokerages/page.tsx` | - | Brokerages list |
| `/brokerages/new` | `src/app/(dashboard)/brokerages/new/page.tsx` | - | Create brokerage |
| `/brokerages/[id]` | `src/app/(dashboard)/brokerages/[id]/page.tsx` | - | Brokerage detail |
| `/brokerages/[id]/edit` | `src/app/(dashboard)/brokerages/[id]/edit/page.tsx` | - | Edit brokerage |

**Server Actions:**
```
src/lib/actions/
├── leads.ts                       → Lead management
├── leads-analytics.ts             → Leads analytics aggregation
├── brokerages.ts                  → Brokerage CRUD
└── portfolio-websites.ts          → Portfolio inquiries
```

---

### Batch Operations
| Route | File Path | Description |
|-------|-----------|-------------|
| `/batch` | `src/app/(dashboard)/batch/page.tsx` | Batch operations hub |

---

## Settings Routes

**Settings Layout:** `src/app/(dashboard)/settings/layout.tsx`
**Settings Sidebar:** `src/components/layout/settings-sidebar.tsx`

### Account & Profile
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/settings` | `src/app/(dashboard)/settings/page.tsx` | - | Settings overview |
| `/settings/profile` | `src/app/(dashboard)/settings/profile/page.tsx` | - | User profile |
| `/settings/team` | `src/app/(dashboard)/settings/team/page.tsx` | - | Team management |
| `/settings/team/[id]/capabilities` | `src/app/(dashboard)/settings/team/[id]/capabilities/page.tsx` | - | Member capabilities |

### Business Settings
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/settings/branding` | `src/app/(dashboard)/settings/branding/page.tsx` | - | Branding settings |
| `/settings/appearance` | `src/app/(dashboard)/settings/appearance/page.tsx` | - | Appearance settings |
| `/settings/notifications` | `src/app/(dashboard)/settings/notifications/page.tsx` | - | Notification preferences |
| `/settings/email` | `src/app/(dashboard)/settings/email/page.tsx` | - | Email settings |
| `/settings/email-logs` | `src/app/(dashboard)/settings/email-logs/page.tsx` | - | Email logs |
| `/settings/sms` | `src/app/(dashboard)/settings/sms/page.tsx` | - | SMS settings |
| `/settings/sms/templates` | `src/app/(dashboard)/settings/sms/templates/page.tsx` | - | SMS templates |

### Financial Settings
| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/settings/billing` | `src/app/(dashboard)/settings/billing/page.tsx` | - | Subscription billing |
| `/settings/billing/upgrade` | `src/app/(dashboard)/settings/billing/upgrade/page.tsx` | - | Upgrade plan |
| `/settings/payments` | `src/app/(dashboard)/settings/payments/page.tsx` | `src/app/(dashboard)/settings/payments/payments-settings-client.tsx` | Payment settings |
| `/settings/payouts` | `src/app/(dashboard)/settings/payouts/page.tsx` | `src/app/(dashboard)/settings/payouts/payouts-page-client.tsx` | Payout settings |
| `/settings/photographer-pay` | `src/app/(dashboard)/settings/photographer-pay/page.tsx` | `src/app/(dashboard)/settings/photographer-pay/photographer-pay-client.tsx` | Photographer pay |
| `/settings/travel` | `src/app/(dashboard)/settings/travel/page.tsx` | - | Travel fee settings |
| `/settings/territories` | `src/app/(dashboard)/settings/territories/page.tsx` | - | Service territories |

### Gallery & Delivery
| Route | File Path | Description |
|-------|-----------|-------------|
| `/settings/gallery-templates` | `src/app/(dashboard)/settings/gallery-templates/page.tsx` | Gallery templates |
| `/settings/gallery-addons` | `src/app/(dashboard)/settings/gallery-addons/page.tsx` | Gallery add-ons |
| `/settings/watermarks` | `src/app/(dashboard)/settings/watermarks/page.tsx` | Watermark settings |

### Scheduling
| Route | File Path | Description |
|-------|-----------|-------------|
| `/settings/calendar` | `src/app/(dashboard)/settings/calendar/page.tsx` | Calendar integration |
| `/settings/calendly` | `src/app/(dashboard)/settings/calendly/page.tsx` | Calendly integration |
| `/settings/equipment` | `src/app/(dashboard)/settings/equipment/page.tsx` | Equipment management |

### Integrations
| Route | File Path | Description |
|-------|-----------|-------------|
| `/settings/integrations` | `src/app/(dashboard)/settings/integrations/page.tsx` | Integrations overview |
| `/settings/dropbox` | `src/app/(dashboard)/settings/dropbox/page.tsx` | Dropbox integration |
| `/settings/mailchimp` | `src/app/(dashboard)/settings/mailchimp/page.tsx` | Mailchimp integration |
| `/settings/quickbooks` | `src/app/(dashboard)/settings/quickbooks/page.tsx` | QuickBooks integration |
| `/settings/slack` | `src/app/(dashboard)/settings/slack/page.tsx` | Slack integration |
| `/settings/zapier` | `src/app/(dashboard)/settings/zapier/page.tsx` | Zapier integration |

### Referrals & Developer
| Route | File Path | Description |
|-------|-----------|-------------|
| `/settings/referrals` | `src/app/(dashboard)/settings/referrals/page.tsx` | Referral program settings |
| `/settings/my-referrals` | `src/app/(dashboard)/settings/my-referrals/page.tsx` | My referrals |
| `/settings/developer` | `src/app/(dashboard)/settings/developer/page.tsx` | API & developer tools |
| `/settings/features` | `src/app/(dashboard)/settings/features/page.tsx` | Feature flags |
| `/settings/mls-presets` | `src/app/(dashboard)/settings/mls-presets/page.tsx` | MLS preset configuration |

---

## Client Portal Routes

**Layout:** `src/app/(client-portal)/layout.tsx`

| Route | File Path | Client Component | Description |
|-------|-----------|------------------|-------------|
| `/portal` | `src/app/(client-portal)/portal/page.tsx` | `src/app/(client-portal)/portal/portal-client.tsx` | Portal home |
| `/portal/login` | `src/app/(client-portal)/portal/login/page.tsx` | - | Portal login |
| `/portal/questionnaires/[id]` | `src/app/(client-portal)/portal/questionnaires/[id]/page.tsx` | `src/app/(client-portal)/portal/questionnaires/[id]/questionnaire-form.tsx` | Fill questionnaire |

**Portal Components:**
```
src/app/(client-portal)/portal/components/
├── index.ts                       → Barrel exports
├── types.ts                       → TypeScript interfaces
├── utils.ts                       → Helper functions
├── icons.tsx                      → Icon components
├── portal-header.tsx              → Header with theme toggle, notifications
├── portal-stats.tsx               → Stats cards
├── portal-tabs.tsx                → Desktop tab navigation
├── portal-footer.tsx              → Footer
├── action-cards.tsx               → Priority action cards
├── mobile-nav.tsx                 → Mobile bottom navigation
├── notification-bell.tsx          → Notification dropdown
├── empty-state.tsx                → Empty state illustrations
├── lightbox.tsx                   → Photo lightbox with ratings
├── skeleton.tsx                   → Loading skeletons
└── tabs/
    ├── properties-tab.tsx         → Properties list
    ├── galleries-tab.tsx          → Galleries with lightbox
    ├── downloads-tab.tsx          → Download options
    ├── invoices-tab.tsx           → Invoice list & payment
    ├── questionnaires-tab.tsx     → Questionnaires list
    └── settings-tab.tsx           → Notification preferences
```

**Server Actions:**
```
src/lib/actions/
├── client-portal.ts               → Portal data fetching
├── portal-downloads.ts            → Download actions
└── questionnaire-portal.ts        → Questionnaire submission
```

---

## Marketing Routes

**Layout:** `src/app/(marketing)/layout.tsx`
**Navbar:** `src/components/layout/navbar.tsx`
**Footer:** `src/components/layout/footer.tsx`

### Main Pages
| Route | File Path | Description |
|-------|-----------|-------------|
| `/` | `src/app/page.tsx` | Homepage |
| `/about` | `src/app/(marketing)/about/page.tsx` | About us |
| `/pricing` | `src/app/(marketing)/pricing/page.tsx` | Pricing page |
| `/contact` | `src/app/(marketing)/contact/page.tsx` | Contact form |
| `/changelog` | `src/app/(marketing)/changelog/page.tsx` | Product changelog |
| `/roadmap` | `src/app/(marketing)/roadmap/page.tsx` | Product roadmap |

### Features
| Route | File Path | Description |
|-------|-----------|-------------|
| `/features/analytics` | `src/app/(marketing)/features/analytics/page.tsx` | Analytics feature |
| `/features/automation` | `src/app/(marketing)/features/automation/page.tsx` | Automation feature |
| `/features/clients` | `src/app/(marketing)/features/clients/page.tsx` | Client management |
| `/features/contracts` | `src/app/(marketing)/features/contracts/page.tsx` | Contracts feature |
| `/features/galleries` | `src/app/(marketing)/features/galleries/page.tsx` | Galleries feature |
| `/features/payments` | `src/app/(marketing)/features/payments/page.tsx` | Payments feature |

### Industries
| Route | File Path | Description |
|-------|-----------|-------------|
| `/industries/architecture` | `src/app/(marketing)/industries/architecture/page.tsx` | Architecture |
| `/industries/commercial` | `src/app/(marketing)/industries/commercial/page.tsx` | Commercial |
| `/industries/events` | `src/app/(marketing)/industries/events/page.tsx` | Events |
| `/industries/food` | `src/app/(marketing)/industries/food/page.tsx` | Food |
| `/industries/portraits` | `src/app/(marketing)/industries/portraits/page.tsx` | Portraits |
| `/industries/real-estate` | `src/app/(marketing)/industries/real-estate/page.tsx` | Real estate |

### Content
| Route | File Path | Description |
|-------|-----------|-------------|
| `/blog` | `src/app/(marketing)/blog/page.tsx` | Blog listing |
| `/blog/[slug]` | `src/app/(marketing)/blog/[slug]/page.tsx` | Blog post |
| `/help` | `src/app/(marketing)/help/page.tsx` | Help center |
| `/help/[category]/[article]` | `src/app/(marketing)/help/[category]/[article]/page.tsx` | Help article |
| `/guides` | `src/app/(marketing)/guides/page.tsx` | User guides |
| `/webinars` | `src/app/(marketing)/webinars/page.tsx` | Webinars listing |
| `/webinars/[slug]` | `src/app/(marketing)/webinars/[slug]/page.tsx` | Webinar detail |

### Business
| Route | File Path | Description |
|-------|-----------|-------------|
| `/affiliates` | `src/app/(marketing)/affiliates/page.tsx` | Affiliate program |
| `/partners` | `src/app/(marketing)/partners/page.tsx` | Partner program |
| `/integrations` | `src/app/(marketing)/integrations/page.tsx` | Integrations |
| `/press` | `src/app/(marketing)/press/page.tsx` | Press kit |
| `/careers` | `src/app/(marketing)/careers/page.tsx` | Careers |

### Legal
| Route | File Path | Description |
|-------|-----------|-------------|
| `/legal/privacy` | `src/app/(marketing)/legal/privacy/page.tsx` | Privacy policy |
| `/legal/terms` | `src/app/(marketing)/legal/terms/page.tsx` | Terms of service |
| `/legal/cookies` | `src/app/(marketing)/legal/cookies/page.tsx` | Cookie policy |
| `/legal/security` | `src/app/(marketing)/legal/security/page.tsx` | Security info |
| `/legal/dpa` | `src/app/(marketing)/legal/dpa/page.tsx` | Data processing agreement |

**Marketing Components:**
```
src/components/sections/
├── hero.tsx                       → Hero section
├── features.tsx                   → Features grid
├── pricing.tsx                    → Pricing tables
├── testimonials.tsx               → Testimonials
├── cta.tsx                        → Call to action
├── roi-calculator.tsx             → ROI calculator
└── ...
```

---

## Public Routes

### Galleries & Media
| Route | File Path | Description |
|-------|-----------|-------------|
| `/g/[slug]` | `src/app/g/[slug]/page.tsx` | Public gallery view |
| `/p/[slug]` | `src/app/p/[slug]/page.tsx` | Property website |
| `/portfolio/[slug]` | `src/app/portfolio/[slug]/page.tsx` | Portfolio website |

### Booking & Orders
| Route | File Path | Description |
|-------|-----------|-------------|
| `/book/[slug]` | `src/app/book/[slug]/page.tsx` | Public booking form |
| `/book/[slug]/confirmation` | `src/app/book/[slug]/confirmation/page.tsx` | Booking confirmation |
| `/order/[slug]` | `src/app/order/[slug]/page.tsx` | Order page |
| `/order/[slug]/confirmation` | `src/app/order/[slug]/confirmation/page.tsx` | Order confirmation |
| `/schedule` | `src/app/schedule/page.tsx` | Schedule a session |

### Payments & Contracts
| Route | File Path | Description |
|-------|-----------|-------------|
| `/pay/[id]` | `src/app/pay/[id]/page.tsx` | Payment page |
| `/sign/[token]` | `src/app/sign/[token]/page.tsx` | Contract signing |
| `/sign/[token]/complete` | `src/app/sign/[token]/complete/page.tsx` | Signing complete |

### Other
| Route | File Path | Description |
|-------|-----------|-------------|
| `/invite/[token]` | `src/app/invite/[token]/page.tsx` | Team invitation |
| `/r/[code]` | `src/app/r/[code]/page.tsx` | Referral redirect |
| `/track` | `src/app/track/page.tsx` | Delivery tracking |
| `/unsubscribe` | `src/app/unsubscribe/page.tsx` | Email unsubscribe |

### Field App
| Route | File Path | Description |
|-------|-----------|-------------|
| `/field` | `src/app/(field)/field/page.tsx` | Field app home |
| `/field/check-in` | `src/app/(field)/field/check-in/page.tsx` | Location check-in |

### Onboarding
| Route | File Path | Description |
|-------|-----------|-------------|
| `/onboarding` | `src/app/(onboarding)/onboarding/page.tsx` | New user onboarding |

---

## API Routes

**Location:** `src/app/api/`

### Authentication
| Route | File | Description |
|-------|------|-------------|
| `/api/auth/client/` | `src/app/api/auth/client/route.ts` | Client portal auth |
| `/api/auth/client/dev-bypass/` | `src/app/api/auth/client/dev-bypass/route.ts` | Dev auth bypass |

### Gallery Operations
| Route | File | Description |
|-------|------|-------------|
| `/api/gallery/[id]/proof-sheet/` | `src/app/api/gallery/[id]/proof-sheet/route.ts` | Proof sheet PDF |
| `/api/gallery/[id]/analytics-report/` | `src/app/api/gallery/[id]/analytics-report/route.ts` | Analytics PDF |
| `/api/gallery/verify-password/` | `src/app/api/gallery/verify-password/route.ts` | Password verify |
| `/api/gallery/rating/` | `src/app/api/gallery/rating/route.ts` | Photo rating |
| `/api/gallery/comment/` | `src/app/api/gallery/comment/route.ts` | Comments |
| `/api/gallery/favorite/` | `src/app/api/gallery/favorite/route.ts` | Favorites |
| `/api/gallery/feedback/` | `src/app/api/gallery/feedback/route.ts` | Feedback |

### Bulk Operations
| Route | File | Description |
|-------|------|-------------|
| `/api/download/batch/` | `src/app/api/download/batch/route.ts` | Batch downloads |
| `/api/invoices/bulk-pdf/` | `src/app/api/invoices/bulk-pdf/route.ts` | Bulk invoice PDFs |
| `/api/contracts/bulk-pdf/` | `src/app/api/contracts/bulk-pdf/route.ts` | Bulk contract PDFs |

### Other
| Route | File | Description |
|-------|------|-------------|
| `/api/calendar/ical/[token]/` | `src/app/api/calendar/ical/[token]/route.ts` | iCal feed |
| `/api/forms/submit/` | `src/app/api/forms/submit/route.ts` | Form submission |
| `/api/images/process/` | `src/app/api/images/process/route.ts` | Image processing |

---

## Component Library

### UI Components
**Location:** `src/components/ui/`

| Component | File | Description |
|-----------|------|-------------|
| Button | `button.tsx` | Styled button |
| Card | `card.tsx` | Card wrapper |
| Input | `input.tsx` | Form input |
| Checkbox | `checkbox.tsx` | Checkbox |
| Switch | `switch.tsx` | Toggle switch |
| Badge | `badge.tsx` | Badge/pill |
| Dialog | `dialog.tsx` | Modal dialog |
| AlertDialog | `alert-dialog.tsx` | Confirmation dialog |
| DropdownMenu | `dropdown-menu.tsx` | Dropdown menu |
| Select | `select.tsx` | Dropdown select |
| Toast | `toast.tsx` | Toast notifications |
| ConfirmDialog | `confirm-dialog.tsx` | Confirmation provider |
| QRCode | `qr-code.tsx` | QR code generator |
| ImageUpload | `image-upload.tsx` | Image upload |
| AddressAutocomplete | `address-autocomplete.tsx` | Google Places |
| ImageLightbox | `image-lightbox.tsx` | Lightbox viewer |
| KeyboardShortcutsModal | `keyboard-shortcuts-modal.tsx` | Shortcuts display |
| Icons | `icons.tsx` | Icon library (84KB) |
| ThemeToggle | `theme-toggle.tsx` | Theme switcher |

### Layout Components
**Location:** `src/components/layout/`

| Component | File | Description |
|-----------|------|-------------|
| DashboardLayoutClient | `dashboard-layout-client.tsx` | Main dashboard shell |
| DashboardSidebar | `dashboard-sidebar.tsx` | Sidebar navigation |
| DashboardTopbar | `dashboard-topbar.tsx` | Top navigation bar |
| MobileNav | `mobile-nav.tsx` | Mobile hamburger menu |
| SettingsSidebar | `settings-sidebar.tsx` | Settings navigation |
| SettingsMobileNav | `settings-mobile-nav.tsx` | Settings mobile nav |
| Navbar | `navbar.tsx` | Marketing navbar |
| Footer | `footer.tsx` | Marketing footer |
| PageHeader | `page-header.tsx` | Page title/breadcrumbs |
| Breadcrumb | `breadcrumb.tsx` | Breadcrumb navigation |

### Dashboard Components
**Location:** `src/components/dashboard/`

| Component | File | Description |
|-----------|------|-------------|
| StatCard | `stat-card.tsx` | Metric card |
| GalleryCard | `gallery-card.tsx` | Gallery grid card |
| RevenueChart | `revenue-chart.tsx` | Revenue visualization |
| InvoiceBuilder | `invoice-builder.tsx` | Invoice line items |
| ServiceForm | `service-form.tsx` | Service creation |
| ServiceSelector | `service-selector.tsx` | Multi-service select |
| AddonForm | `addon-form.tsx` | Add-on form |
| BundleForm | `bundle-form.tsx` | Bundle form |
| QuickActions | `quick-actions.tsx` | Dashboard actions |
| OnboardingChecklist | `onboarding-checklist.tsx` | Setup progress |

### Modal Components
**Location:** `src/components/modals/`

| Component | File | Description |
|-----------|------|-------------|
| CreateGalleryModal | `create-gallery-modal.tsx` | New gallery |
| CreateClientModal | `create-client-modal.tsx` | New client |
| CreatePropertyModal | `create-property-modal.tsx` | New property |
| CreateBookingModal | `create-booking-modal.tsx` | New booking |
| AssignQuestionnaireModal | `assign-questionnaire-modal.tsx` | Assign questionnaire |
| DeleteConfirmationModal | `delete-confirmation-modal.tsx` | Delete confirm |

### Upload Components
**Location:** `src/components/upload/`

| Component | File | Description |
|-----------|------|-------------|
| GlobalUploadModal | `global-upload-modal.tsx` | Global upload UI |
| PhotoUploadModal | `photo-upload-modal.tsx` | Gallery photo upload |
| BulkUploadModal | `bulk-upload-modal.tsx` | Bulk import |

---

## Server Actions

**Location:** `src/lib/actions/`

### Core Domain (129 files total)
```
├── galleries.ts                   → Gallery CRUD, deliver, archive
├── invoices.ts                    → Invoice CRUD, send, mark paid
├── clients.ts                     → Client CRUD
├── bookings.ts                    → Booking CRUD
├── orders.ts                      → Order management
├── contracts.ts                   → Contract CRUD
├── products.ts                    → Service CRUD
├── portfolios.ts                  → Portfolio CRUD
├── properties.ts                  → Property CRUD
├── questionnaires.ts              → Template CRUD
├── payments.ts                    → Payment records
├── leads.ts                       → Lead management
└── ...
```

### Related Actions
```
├── gallery-*.ts                   → Gallery-related actions
├── invoice-*.ts                   → Invoice-related actions
├── client-*.ts                    → Client-related actions
├── booking-*.ts                   → Booking-related actions
├── contract-*.ts                  → Contract-related actions
└── ...
```

### Integrations
```
├── slack.ts                       → Slack integration
├── mailchimp.ts                   → Mailchimp integration
├── dropbox.ts                     → Dropbox integration
├── quickbooks.ts                  → QuickBooks integration
├── google-calendar.ts             → Google Calendar
├── stripe-*.ts                    → Stripe integrations
└── zapier.ts                      → Zapier integration
```

### Utilities
```
├── settings.ts                    → App settings
├── appearance.ts                  → Appearance settings
├── analytics.ts                   → Analytics data
├── notifications.ts               → Notification management
├── auth-helper.ts                 → Auth utilities
├── search.ts                      → Search functionality
└── activity.ts                    → Activity logging
```

---

## Providers & Context

### Provider Hierarchy (Dashboard)
```
Root Layout (src/app/layout.tsx)
├── ClerkProvider                  → Authentication
└── ThemeProvider                  → Light/dark mode

Dashboard Layout (src/app/(dashboard)/layout.tsx)
├── ToastProvider                  → Toast notifications
│   └── ConfirmProvider            → Confirmation dialogs
│       └── UploadProvider         → File upload management
│           └── TourProvider       → Onboarding tours
│               └── CommandPaletteProvider → Quick search
│                   └── KeyboardShortcutsProvider → Shortcuts
│                       └── DashboardLayoutClient → UI shell
│                           └── [Page Content]
```

### Context Files
**Location:** `src/contexts/`

| Context | File | Purpose |
|---------|------|---------|
| UploadContext | `upload-context.tsx` | Upload queue management |
| GalleryContext | `gallery-context.tsx` | Gallery-specific state |

### Provider Files
**Location:** `src/providers/` or `src/components/*/`

| Provider | File | Purpose |
|----------|------|---------|
| ThemeProvider | `src/providers/theme-provider.tsx` | Theme management |
| ToastProvider | `src/components/ui/toast.tsx` | Toast notifications |
| ConfirmProvider | `src/components/ui/confirm-dialog.tsx` | Confirmations |
| TourProvider | `src/providers/tour-provider.tsx` | Onboarding tours |
| CommandPaletteProvider | `src/providers/command-palette-provider.tsx` | Command palette |
| KeyboardShortcutsProvider | `src/providers/keyboard-shortcuts-provider.tsx` | Shortcuts |

---

## Relationship Diagrams

### Page Structure Pattern
```
┌─────────────────────────────────────────────────────────────┐
│                     page.tsx (Server)                        │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ • Authenticate user (Clerk)                          │    │
│  │ • Fetch organization data                            │    │
│  │ • Query database (Prisma)                            │    │
│  │ • Handle search/filter params                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              *-page-client.tsx (Client)              │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │ • "use client" directive                       │  │    │
│  │  │ • Manage UI state (modals, sorting, selection) │  │    │
│  │  │ • Handle interactions (create, edit, delete)   │  │    │
│  │  │ • Call server actions                          │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  │                         │                            │    │
│  │                         ▼                            │    │
│  │  ┌───────────────────────────────────────────────┐  │    │
│  │  │ • PageHeader                                   │  │    │
│  │  │ • Modals (CreateXModal, DeleteConfirmModal)    │  │    │
│  │  │ • Filter/TabNav                                │  │    │
│  │  │ • List/Grid (GalleryCard, ClientCard, etc.)    │  │    │
│  │  │ • Pagination                                   │  │    │
│  │  └───────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│   Next.js    │────▶│   Prisma     │
│              │◀────│   Server     │◀────│   Database   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│    Clerk     │     │   S3/R2      │
│    (Auth)    │     │   (Files)    │
└──────────────┘     └──────────────┘
```

### Component Composition
```
Dashboard Page
├── DashboardLayoutClient
│   ├── DashboardSidebar
│   │   └── Navigation links
│   ├── DashboardTopbar
│   │   ├── Search
│   │   ├── Notifications
│   │   └── User menu
│   └── Main Content
│       ├── PageHeader
│       ├── Content Grid
│       │   ├── StatCard
│       │   ├── GalleryCard / ClientCard / etc.
│       │   └── EmptyState
│       └── Pagination
└── Modals (Portal)
    ├── CreateGalleryModal
    ├── ConfirmDialog
    └── GlobalUploadModal
```

### Upload System Flow
```
┌─────────────────┐
│ PhotoUploadModal│
└────────┬────────┘
         │ Files selected
         ▼
┌─────────────────┐
│ UploadContext   │
│ (addFiles)      │
└────────┬────────┘
         │ Queue task
         ▼
┌─────────────────┐
│ GlobalUploadModal│
│ (shows progress) │
└────────┬────────┘
         │ Upload to S3
         ▼
┌─────────────────┐
│ createAssets()  │
│ (server action) │
└────────┬────────┘
         │ Save to DB
         ▼
┌─────────────────┐
│ router.refresh()│
└─────────────────┘
```

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total Pages | 192 |
| Dashboard Routes (non-settings) | 99 |
| Settings Routes | 35 |
| Marketing Routes | 34 |
| Client Portal Routes | 3 + tabs |
| Public Routes | 15 |
| Field Routes | 2 |
| Auth Routes | 3 |
| Onboarding Routes | 1 |
| API Routes | 58 |
| Server Actions | 129 files |
| Prisma Models | 157 |
| Prisma Enums | 56 |
| UI Components | 30+ |
| Layout Components | 10+ |
| Dashboard Components | 25+ |
| Providers/Contexts | 8 |

*Last verified: 2026-01-06 via [TRUTH_LEDGER.md](./TRUTH_LEDGER.md)*
