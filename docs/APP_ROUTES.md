# PhotoProOS App Routes

Complete directory of all pages in the application.

---

## Public Pages

### Marketing Website (`/`)
| Route | Description |
|-------|-------------|
| `/` | Homepage / Landing page |
| `/about` | About us |
| `/affiliates` | Affiliate program |
| `/blog` | Blog listing |
| `/blog/[slug]` | Individual blog post |
| `/careers` | Careers page |
| `/changelog` | Product changelog |
| `/contact` | Contact form |
| `/guides` | User guides |
| `/help` | Help center |
| `/help/[category]/[article]` | Help article |
| `/integrations` | Integrations showcase |
| `/partners` | Partner program |
| `/press` | Press kit |
| `/pricing` | Pricing page |
| `/roadmap` | Product roadmap |
| `/webinars` | Webinars listing |
| `/webinars/[slug]` | Individual webinar |

### Features Pages
| Route | Description |
|-------|-------------|
| `/features/analytics` | Analytics feature |
| `/features/automation` | Automation feature |
| `/features/clients` | Client management feature |
| `/features/contracts` | Contracts feature |
| `/features/galleries` | Galleries feature |
| `/features/payments` | Payments feature |

### Industry Pages
| Route | Description |
|-------|-------------|
| `/industries/architecture` | Architecture photography |
| `/industries/commercial` | Commercial photography |
| `/industries/events` | Event photography |
| `/industries/food` | Food photography |
| `/industries/portraits` | Portrait photography |
| `/industries/real-estate` | Real estate photography |

### Legal Pages
| Route | Description |
|-------|-------------|
| `/legal/cookies` | Cookie policy |
| `/legal/dpa` | Data processing agreement |
| `/legal/privacy` | Privacy policy |
| `/legal/security` | Security information |
| `/legal/terms` | Terms of service |

---

## Authentication

| Route | Description |
|-------|-------------|
| `/sign-in` | Clerk sign in |
| `/sign-up` | Clerk sign up |
| `/signup` | Custom signup flow |

---

## Dashboard (`/dashboard`)

### Main Dashboard
| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard overview |
| `/analytics` | Analytics dashboard |
| `/create` | Quick create menu |
| `/feedback` | User feedback |
| `/inbox` | Unified inbox |
| `/notifications` | Notifications center |

### Galleries
| Route | Description |
|-------|-------------|
| `/galleries` | Gallery list |
| `/galleries/new` | Create new gallery |
| `/galleries/[id]` | Gallery detail/editor |
| `/galleries/[id]/edit` | Edit gallery settings |
| `/galleries/services` | Gallery services list |
| `/galleries/services/new` | Create gallery service |
| `/galleries/services/[id]` | Edit gallery service |

### Clients
| Route | Description |
|-------|-------------|
| `/clients` | Client list |
| `/clients/new` | Create new client |
| `/clients/[id]` | Client detail |
| `/clients/[id]/edit` | Edit client |
| `/clients/import` | Import clients |
| `/clients/merge` | Merge duplicate clients |

### Invoices & Billing
| Route | Description |
|-------|-------------|
| `/invoices` | Invoice list |
| `/invoices/new` | Create invoice |
| `/invoices/[id]` | Invoice detail |
| `/invoices/[id]/edit` | Edit invoice |
| `/invoices/recurring` | Recurring invoices |
| `/billing` | Billing overview hub |
| `/billing/analytics` | Billing analytics |
| `/billing/credit-notes` | Credit notes list |
| `/billing/credit-notes/new` | Create credit note |
| `/billing/credit-notes/[id]` | Credit note detail |
| `/billing/estimates` | Estimates list |
| `/billing/estimates/new` | Create estimate |
| `/billing/estimates/[id]` | Estimate detail |
| `/billing/estimates/[id]/edit` | Edit estimate |
| `/billing/reports` | Billing reports |
| `/billing/retainers` | Retainers list |
| `/billing/retainers/[id]` | Retainer detail |
| `/payments` | Payments list |
| `/payments/[id]` | Payment detail |

### Scheduling & Booking
| Route | Description |
|-------|-------------|
| `/scheduling` | Calendar view |
| `/scheduling/new` | Create booking |
| `/scheduling/[id]` | Booking detail |
| `/scheduling/[id]/edit` | Edit booking |
| `/scheduling/availability` | Availability settings |
| `/scheduling/time-off` | Time off management |
| `/scheduling/types` | Booking types |
| `/scheduling/booking-forms` | Booking forms list |
| `/scheduling/booking-forms/[id]` | Booking form detail |
| `/scheduling/booking-forms/[id]/submissions` | Form submissions |
| `/booking` | Booking management |
| `/mini-sessions` | Mini sessions |

### Contracts
| Route | Description |
|-------|-------------|
| `/contracts` | Contracts list |
| `/contracts/new` | Create contract |
| `/contracts/[id]` | Contract detail |
| `/contracts/[id]/edit` | Edit contract |
| `/contracts/templates` | Contract templates |
| `/contracts/templates/new` | Create template |
| `/contracts/templates/[id]` | Edit template |

### Services & Products
| Route | Description |
|-------|-------------|
| `/services` | Services list |
| `/services/new` | Create service |
| `/services/[id]` | Service detail |
| `/services/addons` | Add-ons list |
| `/services/addons/new` | Create add-on |
| `/services/addons/[id]` | Add-on detail |
| `/services/bundles` | Bundles list |
| `/services/bundles/new` | Create bundle |
| `/services/bundles/[id]` | Bundle detail |
| `/products` | Product catalog |
| `/products/[catalogId]` | Catalog detail |
| `/licensing` | Licensing management |

### Orders
| Route | Description |
|-------|-------------|
| `/orders` | Orders list |
| `/orders/[id]` | Order detail |
| `/orders/analytics` | Orders analytics |
| `/order-pages` | Order pages list |
| `/order-pages/new` | Create order page |
| `/order-pages/[id]` | Order page detail |

### Projects & Tasks
| Route | Description |
|-------|-------------|
| `/projects` | Projects list |
| `/projects/analytics` | Projects analytics |
| `/projects/tasks/[id]` | Task detail |

### Properties (Real Estate)
| Route | Description |
|-------|-------------|
| `/properties` | Properties list |
| `/properties/new` | Create property |
| `/properties/[id]` | Property detail |
| `/properties/[id]/edit` | Edit property |

### Portfolios
| Route | Description |
|-------|-------------|
| `/portfolios` | Portfolios list |
| `/portfolios/new` | Create portfolio |
| `/portfolios/[id]` | Portfolio editor |

### Questionnaires
| Route | Description |
|-------|-------------|
| `/questionnaires` | Questionnaires overview |
| `/questionnaires/templates/[id]` | Template detail |
| `/questionnaires/templates/[id]/preview` | Template preview |
| `/questionnaires/templates/new` | Create template |
| `/questionnaires/assigned/[id]` | Assigned questionnaire |
| `/forms` | Forms list |
| `/forms/[id]` | Form detail |

### Leads & CRM
| Route | Description |
|-------|-------------|
| `/leads` | Leads management |
| `/brokerages` | Brokerages list |
| `/brokerages/new` | Create brokerage |
| `/brokerages/[id]` | Brokerage detail |
| `/brokerages/[id]/edit` | Edit brokerage |

### Batch Operations
| Route | Description |
|-------|-------------|
| `/batch` | Batch operations |

---

## Settings (`/settings`)

### Account & Profile
| Route | Description |
|-------|-------------|
| `/settings` | Settings overview |
| `/settings/profile` | User profile |
| `/settings/team` | Team management |
| `/settings/team/[id]/capabilities` | Team member capabilities |

### Business Settings
| Route | Description |
|-------|-------------|
| `/settings/branding` | Branding settings |
| `/settings/appearance` | Appearance settings |
| `/settings/notifications` | Notification preferences |
| `/settings/email` | Email settings |
| `/settings/email-logs` | Email logs |
| `/settings/sms` | SMS settings |
| `/settings/sms/templates` | SMS templates |

### Financial Settings
| Route | Description |
|-------|-------------|
| `/settings/billing` | Subscription billing |
| `/settings/billing/upgrade` | Upgrade plan |
| `/settings/payments` | Payment settings |
| `/settings/payouts` | Payout settings |
| `/settings/photographer-pay` | Photographer pay rates |
| `/settings/travel` | Travel fee settings |
| `/settings/territories` | Service territories |

### Gallery & Delivery
| Route | Description |
|-------|-------------|
| `/settings/gallery-templates` | Gallery templates |
| `/settings/gallery-addons` | Gallery add-ons |
| `/settings/watermarks` | Watermark settings |

### Scheduling
| Route | Description |
|-------|-------------|
| `/settings/calendar` | Calendar integration |
| `/settings/calendly` | Calendly integration |
| `/settings/equipment` | Equipment management |

### Integrations
| Route | Description |
|-------|-------------|
| `/settings/integrations` | Integrations overview |
| `/settings/dropbox` | Dropbox integration |
| `/settings/mailchimp` | Mailchimp integration |
| `/settings/quickbooks` | QuickBooks integration |
| `/settings/slack` | Slack integration |
| `/settings/zapier` | Zapier integration |

### Referrals & Affiliates
| Route | Description |
|-------|-------------|
| `/settings/referrals` | Referral program settings |
| `/settings/my-referrals` | My referrals |

### Developer
| Route | Description |
|-------|-------------|
| `/settings/developer` | API & developer tools |
| `/settings/features` | Feature flags |

---

## Client Portal (`/portal`)

| Route | Description |
|-------|-------------|
| `/portal` | Client portal home |
| `/portal/login` | Client portal login |
| `/portal/questionnaires/[id]` | Questionnaire form |

**Portal Tabs (within `/portal`):**
- Properties
- Galleries
- Downloads
- Invoices
- Questionnaires
- Settings (notification preferences)

---

## Public Client-Facing Pages

### Galleries & Media
| Route | Description |
|-------|-------------|
| `/g/[slug]` | Public gallery view |
| `/p/[slug]` | Property website |
| `/portfolio/[slug]` | Portfolio website |

### Booking & Orders
| Route | Description |
|-------|-------------|
| `/book/[slug]` | Public booking form |
| `/book/[slug]/confirmation` | Booking confirmation |
| `/order/[slug]` | Order page |
| `/order/[slug]/confirmation` | Order confirmation |
| `/schedule` | Schedule a session |

### Payments & Contracts
| Route | Description |
|-------|-------------|
| `/pay/[id]` | Payment page |
| `/sign/[token]` | Contract signing |
| `/sign/[token]/complete` | Signing complete |

### Other Public
| Route | Description |
|-------|-------------|
| `/invite/[token]` | Team invitation |
| `/r/[code]` | Referral redirect |
| `/track` | Delivery tracking |
| `/unsubscribe` | Email unsubscribe |

---

## Field App (`/field`)

| Route | Description |
|-------|-------------|
| `/field` | Field app home |
| `/field/check-in` | Location check-in |

---

## Onboarding

| Route | Description |
|-------|-------------|
| `/onboarding` | New user onboarding flow |

---

## Special Routes

| Route | Description |
|-------|-------------|
| `/_custom-domain` | Custom domain handling |

---

## Route Groups Summary

| Group | Prefix | Description |
|-------|--------|-------------|
| `(auth)` | `/sign-in`, `/sign-up` | Authentication |
| `(dashboard)` | `/dashboard/*` | Main app dashboard |
| `(marketing)` | `/`, `/about`, etc. | Public marketing site |
| `(client-portal)` | `/portal/*` | Client portal |
| `(field)` | `/field/*` | Field technician app |
| `(onboarding)` | `/onboarding` | New user setup |

---

## Total Page Count

| Category | Count |
|----------|-------|
| Marketing | 31 |
| Authentication | 3 |
| Dashboard | 89 |
| Settings | 27 |
| Client Portal | 3 |
| Public Client-Facing | 12 |
| Field App | 2 |
| Onboarding | 1 |
| Special | 1 |
| **Total** | **169** |
