# PhotoProOS Complete Sitemap

Complete directory of all 403 pages in the application. Use this as a reference for roadmap planning and understanding page relationships.

**Legend:**
- No icon = Implemented page
- (stub) = Placeholder "Coming Soon" page

---

## Summary

| Section | Total | Implemented | Stub |
|---------|-------|-------------|------|
| Dashboard | 303 | 153 | 150 |
| Client Portal | 16 | 6 | 10 |
| Field App | 6 | 2 | 4 |
| Marketing | 32 | 32 | 0 |
| Super Admin | 14 | 14 | 0 |
| Auth | 3 | 3 | 0 |
| Public Routes | 17 | 17 | 0 |
| Onboarding | 1 | 1 | 0 |
| **Total** | **403** | **239** | **164** |

---

## Public Routes (Root)

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/](https://app.photoproos.com/) | [src/app/page.tsx](src/app/page.tsx) | |
| [/book/:slug](https://app.photoproos.com/book/:slug) | [src/app/book/[slug]/page.tsx](src/app/book/[slug]/page.tsx) | |
| [/book/:slug/confirmation](https://app.photoproos.com/book/:slug/confirmation) | [src/app/book/[slug]/confirmation/page.tsx](src/app/book/[slug]/confirmation/page.tsx) | |
| [/g/:slug](https://app.photoproos.com/g/:slug) | [src/app/g/[slug]/page.tsx](src/app/g/[slug]/page.tsx) | |
| [/invite/:token](https://app.photoproos.com/invite/:token) | [src/app/invite/[token]/page.tsx](src/app/invite/[token]/page.tsx) | |
| [/order/:slug](https://app.photoproos.com/order/:slug) | [src/app/order/[slug]/page.tsx](src/app/order/[slug]/page.tsx) | |
| [/order/:slug/confirmation](https://app.photoproos.com/order/:slug/confirmation) | [src/app/order/[slug]/confirmation/page.tsx](src/app/order/[slug]/confirmation/page.tsx) | |
| [/p/:slug](https://app.photoproos.com/p/:slug) | [src/app/p/[slug]/page.tsx](src/app/p/[slug]/page.tsx) | |
| [/pay/:id](https://app.photoproos.com/pay/:id) | [src/app/pay/[id]/page.tsx](src/app/pay/[id]/page.tsx) | |
| [/portfolio/:slug](https://app.photoproos.com/portfolio/:slug) | [src/app/portfolio/[slug]/page.tsx](src/app/portfolio/[slug]/page.tsx) | |
| [/r/:code](https://app.photoproos.com/r/:code) | [src/app/r/[code]/page.tsx](src/app/r/[code]/page.tsx) | |
| [/review/:token](https://app.photoproos.com/review/:token) | [src/app/review/[token]/page.tsx](src/app/review/[token]/page.tsx) | |
| [/review/:token/thank-you](https://app.photoproos.com/review/:token/thank-you) | [src/app/review/[token]/thank-you/page.tsx](src/app/review/[token]/thank-you/page.tsx) | |
| [/schedule](https://app.photoproos.com/schedule) | [src/app/schedule/page.tsx](src/app/schedule/page.tsx) | |
| [/sign/:token](https://app.photoproos.com/sign/:token) | [src/app/sign/[token]/page.tsx](src/app/sign/[token]/page.tsx) | |
| [/sign/:token/complete](https://app.photoproos.com/sign/:token/complete) | [src/app/sign/[token]/complete/page.tsx](src/app/sign/[token]/complete/page.tsx) | |
| [/track](https://app.photoproos.com/track) | [src/app/track/page.tsx](src/app/track/page.tsx) | |
| [/unsubscribe](https://app.photoproos.com/unsubscribe) | [src/app/unsubscribe/page.tsx](src/app/unsubscribe/page.tsx) | |

---

## Authentication

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/sign-in](https://app.photoproos.com/sign-in) | [src/app/(auth)/sign-in/[[...sign-in]]/page.tsx](src/app/(auth)/sign-in/[[...sign-in]]/page.tsx) | |
| [/sign-up](https://app.photoproos.com/sign-up) | [src/app/(auth)/sign-up/[[...sign-up]]/page.tsx](src/app/(auth)/sign-up/[[...sign-up]]/page.tsx) | |
| [/signup](https://app.photoproos.com/signup) | [src/app/(auth)/signup/page.tsx](src/app/(auth)/signup/page.tsx) | |

---

## Onboarding

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/onboarding](https://app.photoproos.com/onboarding) | [src/app/(onboarding)/onboarding/page.tsx](src/app/(onboarding)/onboarding/page.tsx) | |

---

## Marketing Site

### Main Pages

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/about](https://app.photoproos.com/about) | [src/app/(marketing)/about/page.tsx](src/app/(marketing)/about/page.tsx) | |
| [/affiliates](https://app.photoproos.com/affiliates) | [src/app/(marketing)/affiliates/page.tsx](src/app/(marketing)/affiliates/page.tsx) | |
| [/blog](https://app.photoproos.com/blog) | [src/app/(marketing)/blog/page.tsx](src/app/(marketing)/blog/page.tsx) | |
| [/blog/:slug](https://app.photoproos.com/blog/:slug) | [src/app/(marketing)/blog/[slug]/page.tsx](src/app/(marketing)/blog/[slug]/page.tsx) | |
| [/careers](https://app.photoproos.com/careers) | [src/app/(marketing)/careers/page.tsx](src/app/(marketing)/careers/page.tsx) | |
| [/changelog](https://app.photoproos.com/changelog) | [src/app/(marketing)/changelog/page.tsx](src/app/(marketing)/changelog/page.tsx) | |
| [/contact](https://app.photoproos.com/contact) | [src/app/(marketing)/contact/page.tsx](src/app/(marketing)/contact/page.tsx) | |
| [/guides](https://app.photoproos.com/guides) | [src/app/(marketing)/guides/page.tsx](src/app/(marketing)/guides/page.tsx) | |
| [/integrations](https://app.photoproos.com/integrations) | [src/app/(marketing)/integrations/page.tsx](src/app/(marketing)/integrations/page.tsx) | |
| [/partners](https://app.photoproos.com/partners) | [src/app/(marketing)/partners/page.tsx](src/app/(marketing)/partners/page.tsx) | |
| [/press](https://app.photoproos.com/press) | [src/app/(marketing)/press/page.tsx](src/app/(marketing)/press/page.tsx) | |
| [/pricing](https://app.photoproos.com/pricing) | [src/app/(marketing)/pricing/page.tsx](src/app/(marketing)/pricing/page.tsx) | |
| [/roadmap](https://app.photoproos.com/roadmap) | [src/app/(marketing)/roadmap/page.tsx](src/app/(marketing)/roadmap/page.tsx) | |
| [/support](https://app.photoproos.com/support) | [src/app/(marketing)/support/page.tsx](src/app/(marketing)/support/page.tsx) | |
| [/support/:category/:article](https://app.photoproos.com/support/:category/:article) | [src/app/(marketing)/support/[category]/[article]/page.tsx](src/app/(marketing)/support/[category]/[article]/page.tsx) | |
| [/webinars](https://app.photoproos.com/webinars) | [src/app/(marketing)/webinars/page.tsx](src/app/(marketing)/webinars/page.tsx) | |
| [/webinars/:slug](https://app.photoproos.com/webinars/:slug) | [src/app/(marketing)/webinars/[slug]/page.tsx](src/app/(marketing)/webinars/[slug]/page.tsx) | |

### Features Pages

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/features/analytics](https://app.photoproos.com/features/analytics) | [src/app/(marketing)/features/analytics/page.tsx](src/app/(marketing)/features/analytics/page.tsx) | |
| [/features/automation](https://app.photoproos.com/features/automation) | [src/app/(marketing)/features/automation/page.tsx](src/app/(marketing)/features/automation/page.tsx) | |
| [/features/clients](https://app.photoproos.com/features/clients) | [src/app/(marketing)/features/clients/page.tsx](src/app/(marketing)/features/clients/page.tsx) | |
| [/features/contracts](https://app.photoproos.com/features/contracts) | [src/app/(marketing)/features/contracts/page.tsx](src/app/(marketing)/features/contracts/page.tsx) | |
| [/features/email-marketing](https://app.photoproos.com/features/email-marketing) | [src/app/(marketing)/features/email-marketing/page.tsx](src/app/(marketing)/features/email-marketing/page.tsx) | |
| [/features/galleries](https://app.photoproos.com/features/galleries) | [src/app/(marketing)/features/galleries/page.tsx](src/app/(marketing)/features/galleries/page.tsx) | |
| [/features/payments](https://app.photoproos.com/features/payments) | [src/app/(marketing)/features/payments/page.tsx](src/app/(marketing)/features/payments/page.tsx) | |
| [/features/social-media](https://app.photoproos.com/features/social-media) | [src/app/(marketing)/features/social-media/page.tsx](src/app/(marketing)/features/social-media/page.tsx) | |

### Industries Pages

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/industries/architecture](https://app.photoproos.com/industries/architecture) | [src/app/(marketing)/industries/architecture/page.tsx](src/app/(marketing)/industries/architecture/page.tsx) | |
| [/industries/commercial](https://app.photoproos.com/industries/commercial) | [src/app/(marketing)/industries/commercial/page.tsx](src/app/(marketing)/industries/commercial/page.tsx) | |
| [/industries/events](https://app.photoproos.com/industries/events) | [src/app/(marketing)/industries/events/page.tsx](src/app/(marketing)/industries/events/page.tsx) | |
| [/industries/food](https://app.photoproos.com/industries/food) | [src/app/(marketing)/industries/food/page.tsx](src/app/(marketing)/industries/food/page.tsx) | |
| [/industries/portraits](https://app.photoproos.com/industries/portraits) | [src/app/(marketing)/industries/portraits/page.tsx](src/app/(marketing)/industries/portraits/page.tsx) | |
| [/industries/real-estate](https://app.photoproos.com/industries/real-estate) | [src/app/(marketing)/industries/real-estate/page.tsx](src/app/(marketing)/industries/real-estate/page.tsx) | |

### Legal Pages

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/legal/cookies](https://app.photoproos.com/legal/cookies) | [src/app/(marketing)/legal/cookies/page.tsx](src/app/(marketing)/legal/cookies/page.tsx) | |
| [/legal/dpa](https://app.photoproos.com/legal/dpa) | [src/app/(marketing)/legal/dpa/page.tsx](src/app/(marketing)/legal/dpa/page.tsx) | |
| [/legal/privacy](https://app.photoproos.com/legal/privacy) | [src/app/(marketing)/legal/privacy/page.tsx](src/app/(marketing)/legal/privacy/page.tsx) | |
| [/legal/security](https://app.photoproos.com/legal/security) | [src/app/(marketing)/legal/security/page.tsx](src/app/(marketing)/legal/security/page.tsx) | |
| [/legal/terms](https://app.photoproos.com/legal/terms) | [src/app/(marketing)/legal/terms/page.tsx](src/app/(marketing)/legal/terms/page.tsx) | |

---

## Super Admin

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/super-admin](https://app.photoproos.com/super-admin) | [src/app/(super-admin)/super-admin/page.tsx](src/app/(super-admin)/super-admin/page.tsx) | |
| [/super-admin/announcements](https://app.photoproos.com/super-admin/announcements) | [src/app/(super-admin)/super-admin/announcements/page.tsx](src/app/(super-admin)/super-admin/announcements/page.tsx) | |
| [/super-admin/config](https://app.photoproos.com/super-admin/config) | [src/app/(super-admin)/super-admin/config/page.tsx](src/app/(super-admin)/super-admin/config/page.tsx) | |
| [/super-admin/developer](https://app.photoproos.com/super-admin/developer) | [src/app/(super-admin)/super-admin/developer/page.tsx](src/app/(super-admin)/super-admin/developer/page.tsx) | |
| [/super-admin/discounts](https://app.photoproos.com/super-admin/discounts) | [src/app/(super-admin)/super-admin/discounts/page.tsx](src/app/(super-admin)/super-admin/discounts/page.tsx) | |
| [/super-admin/engagement](https://app.photoproos.com/super-admin/engagement) | [src/app/(super-admin)/super-admin/engagement/page.tsx](src/app/(super-admin)/super-admin/engagement/page.tsx) | |
| [/super-admin/feedback](https://app.photoproos.com/super-admin/feedback) | [src/app/(super-admin)/super-admin/feedback/page.tsx](src/app/(super-admin)/super-admin/feedback/page.tsx) | |
| [/super-admin/logs](https://app.photoproos.com/super-admin/logs) | [src/app/(super-admin)/super-admin/logs/page.tsx](src/app/(super-admin)/super-admin/logs/page.tsx) | |
| [/super-admin/revenue](https://app.photoproos.com/super-admin/revenue) | [src/app/(super-admin)/super-admin/revenue/page.tsx](src/app/(super-admin)/super-admin/revenue/page.tsx) | |
| [/super-admin/roadmap](https://app.photoproos.com/super-admin/roadmap) | [src/app/(super-admin)/super-admin/roadmap/page.tsx](src/app/(super-admin)/super-admin/roadmap/page.tsx) | |
| [/super-admin/support](https://app.photoproos.com/super-admin/support) | [src/app/(super-admin)/super-admin/support/page.tsx](src/app/(super-admin)/super-admin/support/page.tsx) | |
| [/super-admin/support/:ticketId](https://app.photoproos.com/super-admin/support/:ticketId) | [src/app/(super-admin)/super-admin/support/[ticketId]/page.tsx](src/app/(super-admin)/super-admin/support/[ticketId]/page.tsx) | |
| [/super-admin/users](https://app.photoproos.com/super-admin/users) | [src/app/(super-admin)/super-admin/users/page.tsx](src/app/(super-admin)/super-admin/users/page.tsx) | |
| [/super-admin/users/:userId](https://app.photoproos.com/super-admin/users/:userId) | [src/app/(super-admin)/super-admin/users/[userId]/page.tsx](src/app/(super-admin)/super-admin/users/[userId]/page.tsx) | |

---

## Client Portal

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/portal](https://app.photoproos.com/portal) | [src/app/(client-portal)/portal/page.tsx](src/app/(client-portal)/portal/page.tsx) | |
| [/portal/booking](https://app.photoproos.com/portal/booking) | [src/app/(client-portal)/portal/booking/page.tsx](src/app/(client-portal)/portal/booking/page.tsx) | (stub) |
| [/portal/contracts](https://app.photoproos.com/portal/contracts) | [src/app/(client-portal)/portal/contracts/page.tsx](src/app/(client-portal)/portal/contracts/page.tsx) | (stub) |
| [/portal/downloads](https://app.photoproos.com/portal/downloads) | [src/app/(client-portal)/portal/downloads/page.tsx](src/app/(client-portal)/portal/downloads/page.tsx) | (stub) |
| [/portal/favorites](https://app.photoproos.com/portal/favorites) | [src/app/(client-portal)/portal/favorites/page.tsx](src/app/(client-portal)/portal/favorites/page.tsx) | (stub) |
| [/portal/files](https://app.photoproos.com/portal/files) | [src/app/(client-portal)/portal/files/page.tsx](src/app/(client-portal)/portal/files/page.tsx) | (stub) |
| [/portal/login](https://app.photoproos.com/portal/login) | [src/app/(client-portal)/portal/login/page.tsx](src/app/(client-portal)/portal/login/page.tsx) | |
| [/portal/payments](https://app.photoproos.com/portal/payments) | [src/app/(client-portal)/portal/payments/page.tsx](src/app/(client-portal)/portal/payments/page.tsx) | (stub) |
| [/portal/proofing](https://app.photoproos.com/portal/proofing) | [src/app/(client-portal)/portal/proofing/page.tsx](src/app/(client-portal)/portal/proofing/page.tsx) | (stub) |
| [/portal/proofing/:id](https://app.photoproos.com/portal/proofing/:id) | [src/app/(client-portal)/portal/proofing/[id]/page.tsx](src/app/(client-portal)/portal/proofing/[id]/page.tsx) | (stub) |
| [/portal/questionnaires/:id](https://app.photoproos.com/portal/questionnaires/:id) | [src/app/(client-portal)/portal/questionnaires/[id]/page.tsx](src/app/(client-portal)/portal/questionnaires/[id]/page.tsx) | |
| [/portal/schedule](https://app.photoproos.com/portal/schedule) | [src/app/(client-portal)/portal/schedule/page.tsx](src/app/(client-portal)/portal/schedule/page.tsx) | (stub) |
| [/portal/selects](https://app.photoproos.com/portal/selects) | [src/app/(client-portal)/portal/selects/page.tsx](src/app/(client-portal)/portal/selects/page.tsx) | (stub) |

---

## Field App

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/field](https://app.photoproos.com/field) | [src/app/(field)/field/page.tsx](src/app/(field)/field/page.tsx) | |
| [/field/check-in](https://app.photoproos.com/field/check-in) | [src/app/(field)/field/check-in/page.tsx](src/app/(field)/field/check-in/page.tsx) | |
| [/field/checklist](https://app.photoproos.com/field/checklist) | [src/app/(field)/field/checklist/page.tsx](src/app/(field)/field/checklist/page.tsx) | (stub) |
| [/field/notes](https://app.photoproos.com/field/notes) | [src/app/(field)/field/notes/page.tsx](src/app/(field)/field/notes/page.tsx) | (stub) |
| [/field/upload](https://app.photoproos.com/field/upload) | [src/app/(field)/field/upload/page.tsx](src/app/(field)/field/upload/page.tsx) | (stub) |
| [/field/weather](https://app.photoproos.com/field/weather) | [src/app/(field)/field/weather/page.tsx](src/app/(field)/field/weather/page.tsx) | (stub) |

---

## Dashboard

### Core / Home

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/dashboard](https://app.photoproos.com/dashboard) | [src/app/(dashboard)/dashboard/page.tsx](src/app/(dashboard)/dashboard/page.tsx) | |
| [/create](https://app.photoproos.com/create) | [src/app/(dashboard)/create/page.tsx](src/app/(dashboard)/create/page.tsx) | |
| [/notifications](https://app.photoproos.com/notifications) | [src/app/(dashboard)/notifications/page.tsx](src/app/(dashboard)/notifications/page.tsx) | |
| [/feedback](https://app.photoproos.com/feedback) | [src/app/(dashboard)/feedback/page.tsx](src/app/(dashboard)/feedback/page.tsx) | |

### Clients & CRM

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/clients](https://app.photoproos.com/clients) | [src/app/(dashboard)/clients/page.tsx](src/app/(dashboard)/clients/page.tsx) | |
| [/clients/new](https://app.photoproos.com/clients/new) | [src/app/(dashboard)/clients/new/page.tsx](src/app/(dashboard)/clients/new/page.tsx) | |
| [/clients/import](https://app.photoproos.com/clients/import) | [src/app/(dashboard)/clients/import/page.tsx](src/app/(dashboard)/clients/import/page.tsx) | |
| [/clients/merge](https://app.photoproos.com/clients/merge) | [src/app/(dashboard)/clients/merge/page.tsx](src/app/(dashboard)/clients/merge/page.tsx) | |
| [/clients/:id](https://app.photoproos.com/clients/:id) | [src/app/(dashboard)/clients/[id]/page.tsx](src/app/(dashboard)/clients/[id]/page.tsx) | |
| [/clients/:id/edit](https://app.photoproos.com/clients/:id/edit) | [src/app/(dashboard)/clients/[id]/edit/page.tsx](src/app/(dashboard)/clients/[id]/edit/page.tsx) | |
| [/leads](https://app.photoproos.com/leads) | [src/app/(dashboard)/leads/page.tsx](src/app/(dashboard)/leads/page.tsx) | |
| [/leads/analytics](https://app.photoproos.com/leads/analytics) | [src/app/(dashboard)/leads/analytics/page.tsx](src/app/(dashboard)/leads/analytics/page.tsx) | |
| [/inbox](https://app.photoproos.com/inbox) | [src/app/(dashboard)/inbox/page.tsx](src/app/(dashboard)/inbox/page.tsx) | |
| [/pipeline](https://app.photoproos.com/pipeline) | [src/app/(dashboard)/pipeline/page.tsx](src/app/(dashboard)/pipeline/page.tsx) | (stub) |
| [/opportunities](https://app.photoproos.com/opportunities) | [src/app/(dashboard)/opportunities/page.tsx](src/app/(dashboard)/opportunities/page.tsx) | (stub) |
| [/opportunities/:id](https://app.photoproos.com/opportunities/:id) | [src/app/(dashboard)/opportunities/[id]/page.tsx](src/app/(dashboard)/opportunities/[id]/page.tsx) | (stub) |
| [/proposals](https://app.photoproos.com/proposals) | [src/app/(dashboard)/proposals/page.tsx](src/app/(dashboard)/proposals/page.tsx) | (stub) |
| [/proposals/new](https://app.photoproos.com/proposals/new) | [src/app/(dashboard)/proposals/new/page.tsx](src/app/(dashboard)/proposals/new/page.tsx) | (stub) |
| [/proposals/:id](https://app.photoproos.com/proposals/:id) | [src/app/(dashboard)/proposals/[id]/page.tsx](src/app/(dashboard)/proposals/[id]/page.tsx) | (stub) |
| [/referrals](https://app.photoproos.com/referrals) | [src/app/(dashboard)/referrals/page.tsx](src/app/(dashboard)/referrals/page.tsx) | (stub) |
| [/loyalty](https://app.photoproos.com/loyalty) | [src/app/(dashboard)/loyalty/page.tsx](src/app/(dashboard)/loyalty/page.tsx) | (stub) |
| [/segments](https://app.photoproos.com/segments) | [src/app/(dashboard)/segments/page.tsx](src/app/(dashboard)/segments/page.tsx) | (stub) |
| [/segments/:id](https://app.photoproos.com/segments/:id) | [src/app/(dashboard)/segments/[id]/page.tsx](src/app/(dashboard)/segments/[id]/page.tsx) | (stub) |
| [/vip](https://app.photoproos.com/vip) | [src/app/(dashboard)/vip/page.tsx](src/app/(dashboard)/vip/page.tsx) | (stub) |
| [/client-journey](https://app.photoproos.com/client-journey) | [src/app/(dashboard)/client-journey/page.tsx](src/app/(dashboard)/client-journey/page.tsx) | (stub) |

### Brokerages (Real Estate)

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/brokerages](https://app.photoproos.com/brokerages) | [src/app/(dashboard)/brokerages/page.tsx](src/app/(dashboard)/brokerages/page.tsx) | |
| [/brokerages/new](https://app.photoproos.com/brokerages/new) | [src/app/(dashboard)/brokerages/new/page.tsx](src/app/(dashboard)/brokerages/new/page.tsx) | |
| [/brokerages/:id](https://app.photoproos.com/brokerages/:id) | [src/app/(dashboard)/brokerages/[id]/page.tsx](src/app/(dashboard)/brokerages/[id]/page.tsx) | |
| [/brokerages/:id/edit](https://app.photoproos.com/brokerages/:id/edit) | [src/app/(dashboard)/brokerages/[id]/edit/page.tsx](src/app/(dashboard)/brokerages/[id]/edit/page.tsx) | |

### Properties (Real Estate)

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/properties](https://app.photoproos.com/properties) | [src/app/(dashboard)/properties/page.tsx](src/app/(dashboard)/properties/page.tsx) | |
| [/properties/new](https://app.photoproos.com/properties/new) | [src/app/(dashboard)/properties/new/page.tsx](src/app/(dashboard)/properties/new/page.tsx) | |
| [/properties/:id](https://app.photoproos.com/properties/:id) | [src/app/(dashboard)/properties/[id]/page.tsx](src/app/(dashboard)/properties/[id]/page.tsx) | |
| [/properties/:id/edit](https://app.photoproos.com/properties/:id/edit) | [src/app/(dashboard)/properties/[id]/edit/page.tsx](src/app/(dashboard)/properties/[id]/edit/page.tsx) | |
| [/tours](https://app.photoproos.com/tours) | [src/app/(dashboard)/tours/page.tsx](src/app/(dashboard)/tours/page.tsx) | (stub) |
| [/floor-plans](https://app.photoproos.com/floor-plans) | [src/app/(dashboard)/floor-plans/page.tsx](src/app/(dashboard)/floor-plans/page.tsx) | (stub) |
| [/aerial](https://app.photoproos.com/aerial) | [src/app/(dashboard)/aerial/page.tsx](src/app/(dashboard)/aerial/page.tsx) | (stub) |

### Projects & Bookings

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/projects](https://app.photoproos.com/projects) | [src/app/(dashboard)/projects/page.tsx](src/app/(dashboard)/projects/page.tsx) | |
| [/projects/analytics](https://app.photoproos.com/projects/analytics) | [src/app/(dashboard)/projects/analytics/page.tsx](src/app/(dashboard)/projects/analytics/page.tsx) | |
| [/projects/tasks/:id](https://app.photoproos.com/projects/tasks/:id) | [src/app/(dashboard)/projects/tasks/[id]/page.tsx](src/app/(dashboard)/projects/tasks/[id]/page.tsx) | |
| [/booking](https://app.photoproos.com/booking) | [src/app/(dashboard)/booking/page.tsx](src/app/(dashboard)/booking/page.tsx) | |
| [/booking-page](https://app.photoproos.com/booking-page) | [src/app/(dashboard)/booking-page/page.tsx](src/app/(dashboard)/booking-page/page.tsx) | (stub) |
| [/booking-rules](https://app.photoproos.com/booking-rules) | [src/app/(dashboard)/booking-rules/page.tsx](src/app/(dashboard)/booking-rules/page.tsx) | (stub) |
| [/availability](https://app.photoproos.com/availability) | [src/app/(dashboard)/availability/page.tsx](src/app/(dashboard)/availability/page.tsx) | (stub) |
| [/waitlist](https://app.photoproos.com/waitlist) | [src/app/(dashboard)/waitlist/page.tsx](src/app/(dashboard)/waitlist/page.tsx) | (stub) |
| [/mini-sessions](https://app.photoproos.com/mini-sessions) | [src/app/(dashboard)/mini-sessions/page.tsx](src/app/(dashboard)/mini-sessions/page.tsx) | |

### Scheduling

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/scheduling](https://app.photoproos.com/scheduling) | [src/app/(dashboard)/scheduling/page.tsx](src/app/(dashboard)/scheduling/page.tsx) | |
| [/scheduling/new](https://app.photoproos.com/scheduling/new) | [src/app/(dashboard)/scheduling/new/page.tsx](src/app/(dashboard)/scheduling/new/page.tsx) | |
| [/scheduling/availability](https://app.photoproos.com/scheduling/availability) | [src/app/(dashboard)/scheduling/availability/page.tsx](src/app/(dashboard)/scheduling/availability/page.tsx) | |
| [/scheduling/time-off](https://app.photoproos.com/scheduling/time-off) | [src/app/(dashboard)/scheduling/time-off/page.tsx](src/app/(dashboard)/scheduling/time-off/page.tsx) | |
| [/scheduling/types](https://app.photoproos.com/scheduling/types) | [src/app/(dashboard)/scheduling/types/page.tsx](src/app/(dashboard)/scheduling/types/page.tsx) | |
| [/scheduling/booking-forms](https://app.photoproos.com/scheduling/booking-forms) | [src/app/(dashboard)/scheduling/booking-forms/page.tsx](src/app/(dashboard)/scheduling/booking-forms/page.tsx) | |
| [/scheduling/booking-forms/:id](https://app.photoproos.com/scheduling/booking-forms/:id) | [src/app/(dashboard)/scheduling/booking-forms/[id]/page.tsx](src/app/(dashboard)/scheduling/booking-forms/[id]/page.tsx) | |
| [/scheduling/booking-forms/:id/submissions](https://app.photoproos.com/scheduling/booking-forms/:id/submissions) | [src/app/(dashboard)/scheduling/booking-forms/[id]/submissions/page.tsx](src/app/(dashboard)/scheduling/booking-forms/[id]/submissions/page.tsx) | |
| [/scheduling/:id](https://app.photoproos.com/scheduling/:id) | [src/app/(dashboard)/scheduling/[id]/page.tsx](src/app/(dashboard)/scheduling/[id]/page.tsx) | |
| [/scheduling/:id/edit](https://app.photoproos.com/scheduling/:id/edit) | [src/app/(dashboard)/scheduling/[id]/edit/page.tsx](src/app/(dashboard)/scheduling/[id]/edit/page.tsx) | |

### Services & Pricing

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/services](https://app.photoproos.com/services) | [src/app/(dashboard)/services/page.tsx](src/app/(dashboard)/services/page.tsx) | |
| [/services/new](https://app.photoproos.com/services/new) | [src/app/(dashboard)/services/new/page.tsx](src/app/(dashboard)/services/new/page.tsx) | |
| [/services/:id](https://app.photoproos.com/services/:id) | [src/app/(dashboard)/services/[id]/page.tsx](src/app/(dashboard)/services/[id]/page.tsx) | |
| [/services/addons](https://app.photoproos.com/services/addons) | [src/app/(dashboard)/services/addons/page.tsx](src/app/(dashboard)/services/addons/page.tsx) | |
| [/services/addons/new](https://app.photoproos.com/services/addons/new) | [src/app/(dashboard)/services/addons/new/page.tsx](src/app/(dashboard)/services/addons/new/page.tsx) | |
| [/services/addons/:id](https://app.photoproos.com/services/addons/:id) | [src/app/(dashboard)/services/addons/[id]/page.tsx](src/app/(dashboard)/services/addons/[id]/page.tsx) | |
| [/services/bundles](https://app.photoproos.com/services/bundles) | [src/app/(dashboard)/services/bundles/page.tsx](src/app/(dashboard)/services/bundles/page.tsx) | |
| [/services/bundles/new](https://app.photoproos.com/services/bundles/new) | [src/app/(dashboard)/services/bundles/new/page.tsx](src/app/(dashboard)/services/bundles/new/page.tsx) | |
| [/services/bundles/:id](https://app.photoproos.com/services/bundles/:id) | [src/app/(dashboard)/services/bundles/[id]/page.tsx](src/app/(dashboard)/services/bundles/[id]/page.tsx) | |
| [/pricing](https://app.photoproos.com/pricing) | [src/app/(dashboard)/pricing/page.tsx](src/app/(dashboard)/pricing/page.tsx) | (stub) |

### Contracts & Legal

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/contracts](https://app.photoproos.com/contracts) | [src/app/(dashboard)/contracts/page.tsx](src/app/(dashboard)/contracts/page.tsx) | |
| [/contracts/new](https://app.photoproos.com/contracts/new) | [src/app/(dashboard)/contracts/new/page.tsx](src/app/(dashboard)/contracts/new/page.tsx) | |
| [/contracts/:id](https://app.photoproos.com/contracts/:id) | [src/app/(dashboard)/contracts/[id]/page.tsx](src/app/(dashboard)/contracts/[id]/page.tsx) | |
| [/contracts/:id/edit](https://app.photoproos.com/contracts/:id/edit) | [src/app/(dashboard)/contracts/[id]/edit/page.tsx](src/app/(dashboard)/contracts/[id]/edit/page.tsx) | |
| [/contracts/templates](https://app.photoproos.com/contracts/templates) | [src/app/(dashboard)/contracts/templates/page.tsx](src/app/(dashboard)/contracts/templates/page.tsx) | |
| [/contracts/templates/new](https://app.photoproos.com/contracts/templates/new) | [src/app/(dashboard)/contracts/templates/new/page.tsx](src/app/(dashboard)/contracts/templates/new/page.tsx) | |
| [/contracts/templates/:id](https://app.photoproos.com/contracts/templates/:id) | [src/app/(dashboard)/contracts/templates/[id]/page.tsx](src/app/(dashboard)/contracts/templates/[id]/page.tsx) | |
| [/releases](https://app.photoproos.com/releases) | [src/app/(dashboard)/releases/page.tsx](src/app/(dashboard)/releases/page.tsx) | (stub) |
| [/releases/new](https://app.photoproos.com/releases/new) | [src/app/(dashboard)/releases/new/page.tsx](src/app/(dashboard)/releases/new/page.tsx) | (stub) |
| [/releases/:id](https://app.photoproos.com/releases/:id) | [src/app/(dashboard)/releases/[id]/page.tsx](src/app/(dashboard)/releases/[id]/page.tsx) | (stub) |
| [/waivers](https://app.photoproos.com/waivers) | [src/app/(dashboard)/waivers/page.tsx](src/app/(dashboard)/waivers/page.tsx) | (stub) |
| [/licenses](https://app.photoproos.com/licenses) | [src/app/(dashboard)/licenses/page.tsx](src/app/(dashboard)/licenses/page.tsx) | (stub) |
| [/licensing](https://app.photoproos.com/licensing) | [src/app/(dashboard)/licensing/page.tsx](src/app/(dashboard)/licensing/page.tsx) | |

### Questionnaires & Forms

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/questionnaires](https://app.photoproos.com/questionnaires) | [src/app/(dashboard)/questionnaires/page.tsx](src/app/(dashboard)/questionnaires/page.tsx) | |
| [/questionnaires/templates/new](https://app.photoproos.com/questionnaires/templates/new) | [src/app/(dashboard)/questionnaires/templates/new/page.tsx](src/app/(dashboard)/questionnaires/templates/new/page.tsx) | |
| [/questionnaires/templates/:id](https://app.photoproos.com/questionnaires/templates/:id) | [src/app/(dashboard)/questionnaires/templates/[id]/page.tsx](src/app/(dashboard)/questionnaires/templates/[id]/page.tsx) | |
| [/questionnaires/templates/:id/preview](https://app.photoproos.com/questionnaires/templates/:id/preview) | [src/app/(dashboard)/questionnaires/templates/[id]/preview/page.tsx](src/app/(dashboard)/questionnaires/templates/[id]/preview/page.tsx) | |
| [/questionnaires/assigned/:id](https://app.photoproos.com/questionnaires/assigned/:id) | [src/app/(dashboard)/questionnaires/assigned/[id]/page.tsx](src/app/(dashboard)/questionnaires/assigned/[id]/page.tsx) | |
| [/forms](https://app.photoproos.com/forms) | [src/app/(dashboard)/forms/page.tsx](src/app/(dashboard)/forms/page.tsx) | |
| [/forms/:id](https://app.photoproos.com/forms/:id) | [src/app/(dashboard)/forms/[id]/page.tsx](src/app/(dashboard)/forms/[id]/page.tsx) | |
| [/surveys](https://app.photoproos.com/surveys) | [src/app/(dashboard)/surveys/page.tsx](src/app/(dashboard)/surveys/page.tsx) | (stub) |
| [/surveys/new](https://app.photoproos.com/surveys/new) | [src/app/(dashboard)/surveys/new/page.tsx](src/app/(dashboard)/surveys/new/page.tsx) | (stub) |
| [/surveys/:id](https://app.photoproos.com/surveys/:id) | [src/app/(dashboard)/surveys/[id]/page.tsx](src/app/(dashboard)/surveys/[id]/page.tsx) | (stub) |

### Billing & Invoicing

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/billing](https://app.photoproos.com/billing) | [src/app/(dashboard)/billing/page.tsx](src/app/(dashboard)/billing/page.tsx) | |
| [/billing/analytics](https://app.photoproos.com/billing/analytics) | [src/app/(dashboard)/billing/analytics/page.tsx](src/app/(dashboard)/billing/analytics/page.tsx) | |
| [/billing/reports](https://app.photoproos.com/billing/reports) | [src/app/(dashboard)/billing/reports/page.tsx](src/app/(dashboard)/billing/reports/page.tsx) | |
| [/billing/estimates](https://app.photoproos.com/billing/estimates) | [src/app/(dashboard)/billing/estimates/page.tsx](src/app/(dashboard)/billing/estimates/page.tsx) | |
| [/billing/estimates/new](https://app.photoproos.com/billing/estimates/new) | [src/app/(dashboard)/billing/estimates/new/page.tsx](src/app/(dashboard)/billing/estimates/new/page.tsx) | |
| [/billing/estimates/:id](https://app.photoproos.com/billing/estimates/:id) | [src/app/(dashboard)/billing/estimates/[id]/page.tsx](src/app/(dashboard)/billing/estimates/[id]/page.tsx) | |
| [/billing/estimates/:id/edit](https://app.photoproos.com/billing/estimates/:id/edit) | [src/app/(dashboard)/billing/estimates/[id]/edit/page.tsx](src/app/(dashboard)/billing/estimates/[id]/edit/page.tsx) | |
| [/billing/credit-notes](https://app.photoproos.com/billing/credit-notes) | [src/app/(dashboard)/billing/credit-notes/page.tsx](src/app/(dashboard)/billing/credit-notes/page.tsx) | |
| [/billing/credit-notes/new](https://app.photoproos.com/billing/credit-notes/new) | [src/app/(dashboard)/billing/credit-notes/new/page.tsx](src/app/(dashboard)/billing/credit-notes/new/page.tsx) | |
| [/billing/credit-notes/:id](https://app.photoproos.com/billing/credit-notes/:id) | [src/app/(dashboard)/billing/credit-notes/[id]/page.tsx](src/app/(dashboard)/billing/credit-notes/[id]/page.tsx) | |
| [/billing/retainers](https://app.photoproos.com/billing/retainers) | [src/app/(dashboard)/billing/retainers/page.tsx](src/app/(dashboard)/billing/retainers/page.tsx) | |
| [/billing/retainers/:id](https://app.photoproos.com/billing/retainers/:id) | [src/app/(dashboard)/billing/retainers/[id]/page.tsx](src/app/(dashboard)/billing/retainers/[id]/page.tsx) | |
| [/invoices](https://app.photoproos.com/invoices) | [src/app/(dashboard)/invoices/page.tsx](src/app/(dashboard)/invoices/page.tsx) | |
| [/invoices/new](https://app.photoproos.com/invoices/new) | [src/app/(dashboard)/invoices/new/page.tsx](src/app/(dashboard)/invoices/new/page.tsx) | |
| [/invoices/recurring](https://app.photoproos.com/invoices/recurring) | [src/app/(dashboard)/invoices/recurring/page.tsx](src/app/(dashboard)/invoices/recurring/page.tsx) | |
| [/invoices/:id](https://app.photoproos.com/invoices/:id) | [src/app/(dashboard)/invoices/[id]/page.tsx](src/app/(dashboard)/invoices/[id]/page.tsx) | |
| [/invoices/:id/edit](https://app.photoproos.com/invoices/:id/edit) | [src/app/(dashboard)/invoices/[id]/edit/page.tsx](src/app/(dashboard)/invoices/[id]/edit/page.tsx) | |
| [/payments](https://app.photoproos.com/payments) | [src/app/(dashboard)/payments/page.tsx](src/app/(dashboard)/payments/page.tsx) | |
| [/payments/:id](https://app.photoproos.com/payments/:id) | [src/app/(dashboard)/payments/[id]/page.tsx](src/app/(dashboard)/payments/[id]/page.tsx) | |
| [/failed-payments](https://app.photoproos.com/failed-payments) | [src/app/(dashboard)/failed-payments/page.tsx](src/app/(dashboard)/failed-payments/page.tsx) | (stub) |
| [/refunds](https://app.photoproos.com/refunds) | [src/app/(dashboard)/refunds/page.tsx](src/app/(dashboard)/refunds/page.tsx) | (stub) |

### Financial

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/expenses](https://app.photoproos.com/expenses) | [src/app/(dashboard)/expenses/page.tsx](src/app/(dashboard)/expenses/page.tsx) | (stub) |
| [/expenses/new](https://app.photoproos.com/expenses/new) | [src/app/(dashboard)/expenses/new/page.tsx](src/app/(dashboard)/expenses/new/page.tsx) | (stub) |
| [/expenses/:id](https://app.photoproos.com/expenses/:id) | [src/app/(dashboard)/expenses/[id]/page.tsx](src/app/(dashboard)/expenses/[id]/page.tsx) | (stub) |
| [/mileage](https://app.photoproos.com/mileage) | [src/app/(dashboard)/mileage/page.tsx](src/app/(dashboard)/mileage/page.tsx) | (stub) |
| [/payroll](https://app.photoproos.com/payroll) | [src/app/(dashboard)/payroll/page.tsx](src/app/(dashboard)/payroll/page.tsx) | (stub) |
| [/commissions](https://app.photoproos.com/commissions) | [src/app/(dashboard)/commissions/page.tsx](src/app/(dashboard)/commissions/page.tsx) | (stub) |
| [/timesheets](https://app.photoproos.com/timesheets) | [src/app/(dashboard)/timesheets/page.tsx](src/app/(dashboard)/timesheets/page.tsx) | (stub) |
| [/timesheets/:id](https://app.photoproos.com/timesheets/:id) | [src/app/(dashboard)/timesheets/[id]/page.tsx](src/app/(dashboard)/timesheets/[id]/page.tsx) | (stub) |

### Galleries & Photo Delivery

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/galleries](https://app.photoproos.com/galleries) | [src/app/(dashboard)/galleries/page.tsx](src/app/(dashboard)/galleries/page.tsx) | |
| [/galleries/new](https://app.photoproos.com/galleries/new) | [src/app/(dashboard)/galleries/new/page.tsx](src/app/(dashboard)/galleries/new/page.tsx) | |
| [/galleries/:id](https://app.photoproos.com/galleries/:id) | [src/app/(dashboard)/galleries/[id]/page.tsx](src/app/(dashboard)/galleries/[id]/page.tsx) | |
| [/galleries/:id/edit](https://app.photoproos.com/galleries/:id/edit) | [src/app/(dashboard)/galleries/[id]/edit/page.tsx](src/app/(dashboard)/galleries/[id]/edit/page.tsx) | |
| [/galleries/services](https://app.photoproos.com/galleries/services) | [src/app/(dashboard)/galleries/services/page.tsx](src/app/(dashboard)/galleries/services/page.tsx) | |
| [/galleries/services/new](https://app.photoproos.com/galleries/services/new) | [src/app/(dashboard)/galleries/services/new/page.tsx](src/app/(dashboard)/galleries/services/new/page.tsx) | |
| [/galleries/services/:id](https://app.photoproos.com/galleries/services/:id) | [src/app/(dashboard)/galleries/services/[id]/page.tsx](src/app/(dashboard)/galleries/services/[id]/page.tsx) | |
| [/proofing](https://app.photoproos.com/proofing) | [src/app/(dashboard)/proofing/page.tsx](src/app/(dashboard)/proofing/page.tsx) | (stub) |
| [/proofing/:id](https://app.photoproos.com/proofing/:id) | [src/app/(dashboard)/proofing/[id]/page.tsx](src/app/(dashboard)/proofing/[id]/page.tsx) | (stub) |
| [/reveal](https://app.photoproos.com/reveal) | [src/app/(dashboard)/reveal/page.tsx](src/app/(dashboard)/reveal/page.tsx) | (stub) |
| [/reveal/:id](https://app.photoproos.com/reveal/:id) | [src/app/(dashboard)/reveal/[id]/page.tsx](src/app/(dashboard)/reveal/[id]/page.tsx) | (stub) |
| [/sneak-peeks](https://app.photoproos.com/sneak-peeks) | [src/app/(dashboard)/sneak-peeks/page.tsx](src/app/(dashboard)/sneak-peeks/page.tsx) | (stub) |
| [/sneak-peeks/:id](https://app.photoproos.com/sneak-peeks/:id) | [src/app/(dashboard)/sneak-peeks/[id]/page.tsx](src/app/(dashboard)/sneak-peeks/[id]/page.tsx) | (stub) |
| [/slideshows](https://app.photoproos.com/slideshows) | [src/app/(dashboard)/slideshows/page.tsx](src/app/(dashboard)/slideshows/page.tsx) | (stub) |
| [/slideshows/:id](https://app.photoproos.com/slideshows/:id) | [src/app/(dashboard)/slideshows/[id]/page.tsx](src/app/(dashboard)/slideshows/[id]/page.tsx) | (stub) |
| [/session-recaps](https://app.photoproos.com/session-recaps) | [src/app/(dashboard)/session-recaps/page.tsx](src/app/(dashboard)/session-recaps/page.tsx) | (stub) |
| [/session-recaps/:id](https://app.photoproos.com/session-recaps/:id) | [src/app/(dashboard)/session-recaps/[id]/page.tsx](src/app/(dashboard)/session-recaps/[id]/page.tsx) | (stub) |

### Client Preparation

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/prep-guides](https://app.photoproos.com/prep-guides) | [src/app/(dashboard)/prep-guides/page.tsx](src/app/(dashboard)/prep-guides/page.tsx) | (stub) |
| [/prep-guides/:id](https://app.photoproos.com/prep-guides/:id) | [src/app/(dashboard)/prep-guides/[id]/page.tsx](src/app/(dashboard)/prep-guides/[id]/page.tsx) | (stub) |
| [/mood-boards](https://app.photoproos.com/mood-boards) | [src/app/(dashboard)/mood-boards/page.tsx](src/app/(dashboard)/mood-boards/page.tsx) | (stub) |
| [/mood-boards/:id](https://app.photoproos.com/mood-boards/:id) | [src/app/(dashboard)/mood-boards/[id]/page.tsx](src/app/(dashboard)/mood-boards/[id]/page.tsx) | (stub) |
| [/style-guides](https://app.photoproos.com/style-guides) | [src/app/(dashboard)/style-guides/page.tsx](src/app/(dashboard)/style-guides/page.tsx) | (stub) |
| [/shot-list](https://app.photoproos.com/shot-list) | [src/app/(dashboard)/shot-list/page.tsx](src/app/(dashboard)/shot-list/page.tsx) | (stub) |
| [/shot-list/:id](https://app.photoproos.com/shot-list/:id) | [src/app/(dashboard)/shot-list/[id]/page.tsx](src/app/(dashboard)/shot-list/[id]/page.tsx) | (stub) |
| [/timeline](https://app.photoproos.com/timeline) | [src/app/(dashboard)/timeline/page.tsx](src/app/(dashboard)/timeline/page.tsx) | (stub) |
| [/assets](https://app.photoproos.com/assets) | [src/app/(dashboard)/assets/page.tsx](src/app/(dashboard)/assets/page.tsx) | (stub) |

### Products & E-commerce

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/products](https://app.photoproos.com/products) | [src/app/(dashboard)/products/page.tsx](src/app/(dashboard)/products/page.tsx) | |
| [/products/new](https://app.photoproos.com/products/new) | [src/app/(dashboard)/products/new/page.tsx](src/app/(dashboard)/products/new/page.tsx) | (stub) |
| [/products/:catalogId](https://app.photoproos.com/products/:catalogId) | [src/app/(dashboard)/products/[catalogId]/page.tsx](src/app/(dashboard)/products/[catalogId]/page.tsx) | |
| [/collections](https://app.photoproos.com/collections) | [src/app/(dashboard)/collections/page.tsx](src/app/(dashboard)/collections/page.tsx) | (stub) |
| [/collections/:id](https://app.photoproos.com/collections/:id) | [src/app/(dashboard)/collections/[id]/page.tsx](src/app/(dashboard)/collections/[id]/page.tsx) | (stub) |
| [/digital-products](https://app.photoproos.com/digital-products) | [src/app/(dashboard)/digital-products/page.tsx](src/app/(dashboard)/digital-products/page.tsx) | (stub) |
| [/digital-products/:id](https://app.photoproos.com/digital-products/:id) | [src/app/(dashboard)/digital-products/[id]/page.tsx](src/app/(dashboard)/digital-products/[id]/page.tsx) | (stub) |
| [/albums](https://app.photoproos.com/albums) | [src/app/(dashboard)/albums/page.tsx](src/app/(dashboard)/albums/page.tsx) | (stub) |
| [/albums/:id](https://app.photoproos.com/albums/:id) | [src/app/(dashboard)/albums/[id]/page.tsx](src/app/(dashboard)/albums/[id]/page.tsx) | (stub) |
| [/prints](https://app.photoproos.com/prints) | [src/app/(dashboard)/prints/page.tsx](src/app/(dashboard)/prints/page.tsx) | (stub) |
| [/wall-art](https://app.photoproos.com/wall-art) | [src/app/(dashboard)/wall-art/page.tsx](src/app/(dashboard)/wall-art/page.tsx) | (stub) |
| [/gift-cards](https://app.photoproos.com/gift-cards) | [src/app/(dashboard)/gift-cards/page.tsx](src/app/(dashboard)/gift-cards/page.tsx) | (stub) |
| [/gift-cards/:id](https://app.photoproos.com/gift-cards/:id) | [src/app/(dashboard)/gift-cards/[id]/page.tsx](src/app/(dashboard)/gift-cards/[id]/page.tsx) | (stub) |
| [/coupons](https://app.photoproos.com/coupons) | [src/app/(dashboard)/coupons/page.tsx](src/app/(dashboard)/coupons/page.tsx) | (stub) |
| [/coupons/:id](https://app.photoproos.com/coupons/:id) | [src/app/(dashboard)/coupons/[id]/page.tsx](src/app/(dashboard)/coupons/[id]/page.tsx) | (stub) |
| [/memberships](https://app.photoproos.com/memberships) | [src/app/(dashboard)/memberships/page.tsx](src/app/(dashboard)/memberships/page.tsx) | (stub) |
| [/memberships/:id](https://app.photoproos.com/memberships/:id) | [src/app/(dashboard)/memberships/[id]/page.tsx](src/app/(dashboard)/memberships/[id]/page.tsx) | (stub) |
| [/abandoned-carts](https://app.photoproos.com/abandoned-carts) | [src/app/(dashboard)/abandoned-carts/page.tsx](src/app/(dashboard)/abandoned-carts/page.tsx) | (stub) |
| [/fulfillment](https://app.photoproos.com/fulfillment) | [src/app/(dashboard)/fulfillment/page.tsx](src/app/(dashboard)/fulfillment/page.tsx) | (stub) |
| [/shipping](https://app.photoproos.com/shipping) | [src/app/(dashboard)/shipping/page.tsx](src/app/(dashboard)/shipping/page.tsx) | (stub) |

### Orders

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/orders](https://app.photoproos.com/orders) | [src/app/(dashboard)/orders/page.tsx](src/app/(dashboard)/orders/page.tsx) | |
| [/orders/analytics](https://app.photoproos.com/orders/analytics) | [src/app/(dashboard)/orders/analytics/page.tsx](src/app/(dashboard)/orders/analytics/page.tsx) | |
| [/orders/:id](https://app.photoproos.com/orders/:id) | [src/app/(dashboard)/orders/[id]/page.tsx](src/app/(dashboard)/orders/[id]/page.tsx) | |
| [/order-pages](https://app.photoproos.com/order-pages) | [src/app/(dashboard)/order-pages/page.tsx](src/app/(dashboard)/order-pages/page.tsx) | |
| [/order-pages/new](https://app.photoproos.com/order-pages/new) | [src/app/(dashboard)/order-pages/new/page.tsx](src/app/(dashboard)/order-pages/new/page.tsx) | |
| [/order-pages/:id](https://app.photoproos.com/order-pages/:id) | [src/app/(dashboard)/order-pages/[id]/page.tsx](src/app/(dashboard)/order-pages/[id]/page.tsx) | |

### Team & Resources

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/team](https://app.photoproos.com/team) | [src/app/(dashboard)/team/page.tsx](src/app/(dashboard)/team/page.tsx) | (stub) |
| [/associates](https://app.photoproos.com/associates) | [src/app/(dashboard)/associates/page.tsx](src/app/(dashboard)/associates/page.tsx) | (stub) |
| [/associates/:id](https://app.photoproos.com/associates/:id) | [src/app/(dashboard)/associates/[id]/page.tsx](src/app/(dashboard)/associates/[id]/page.tsx) | (stub) |
| [/resources](https://app.photoproos.com/resources) | [src/app/(dashboard)/resources/page.tsx](src/app/(dashboard)/resources/page.tsx) | (stub) |
| [/assignments](https://app.photoproos.com/assignments) | [src/app/(dashboard)/assignments/page.tsx](src/app/(dashboard)/assignments/page.tsx) | (stub) |
| [/gear](https://app.photoproos.com/gear) | [src/app/(dashboard)/gear/page.tsx](src/app/(dashboard)/gear/page.tsx) | (stub) |
| [/gear/maintenance](https://app.photoproos.com/gear/maintenance) | [src/app/(dashboard)/gear/maintenance/page.tsx](src/app/(dashboard)/gear/maintenance/page.tsx) | (stub) |
| [/gear/:id](https://app.photoproos.com/gear/:id) | [src/app/(dashboard)/gear/[id]/page.tsx](src/app/(dashboard)/gear/[id]/page.tsx) | (stub) |
| [/vendors](https://app.photoproos.com/vendors) | [src/app/(dashboard)/vendors/page.tsx](src/app/(dashboard)/vendors/page.tsx) | (stub) |
| [/locations](https://app.photoproos.com/locations) | [src/app/(dashboard)/locations/page.tsx](src/app/(dashboard)/locations/page.tsx) | (stub) |
| [/studio](https://app.photoproos.com/studio) | [src/app/(dashboard)/studio/page.tsx](src/app/(dashboard)/studio/page.tsx) | (stub) |
| [/rentals](https://app.photoproos.com/rentals) | [src/app/(dashboard)/rentals/page.tsx](src/app/(dashboard)/rentals/page.tsx) | (stub) |

### Education & Training

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/courses](https://app.photoproos.com/courses) | [src/app/(dashboard)/courses/page.tsx](src/app/(dashboard)/courses/page.tsx) | (stub) |
| [/courses/:id](https://app.photoproos.com/courses/:id) | [src/app/(dashboard)/courses/[id]/page.tsx](src/app/(dashboard)/courses/[id]/page.tsx) | (stub) |
| [/videos](https://app.photoproos.com/videos) | [src/app/(dashboard)/videos/page.tsx](src/app/(dashboard)/videos/page.tsx) | (stub) |
| [/videos/:id](https://app.photoproos.com/videos/:id) | [src/app/(dashboard)/videos/[id]/page.tsx](src/app/(dashboard)/videos/[id]/page.tsx) | (stub) |
| [/workshops](https://app.photoproos.com/workshops) | [src/app/(dashboard)/workshops/page.tsx](src/app/(dashboard)/workshops/page.tsx) | (stub) |
| [/workshops/:id](https://app.photoproos.com/workshops/:id) | [src/app/(dashboard)/workshops/[id]/page.tsx](src/app/(dashboard)/workshops/[id]/page.tsx) | (stub) |
| [/mentoring](https://app.photoproos.com/mentoring) | [src/app/(dashboard)/mentoring/page.tsx](src/app/(dashboard)/mentoring/page.tsx) | (stub) |
| [/mentoring/:id](https://app.photoproos.com/mentoring/:id) | [src/app/(dashboard)/mentoring/[id]/page.tsx](src/app/(dashboard)/mentoring/[id]/page.tsx) | (stub) |

### Marketing

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/campaigns](https://app.photoproos.com/campaigns) | [src/app/(dashboard)/campaigns/page.tsx](src/app/(dashboard)/campaigns/page.tsx) | (stub) |
| [/email-campaigns](https://app.photoproos.com/email-campaigns) | [src/app/(dashboard)/email-campaigns/page.tsx](src/app/(dashboard)/email-campaigns/page.tsx) | (stub) |
| [/email-campaigns/:id](https://app.photoproos.com/email-campaigns/:id) | [src/app/(dashboard)/email-campaigns/[id]/page.tsx](src/app/(dashboard)/email-campaigns/[id]/page.tsx) | (stub) |
| [/social](https://app.photoproos.com/social) | [src/app/(dashboard)/social/page.tsx](src/app/(dashboard)/social/page.tsx) | (stub) |
| [/content](https://app.photoproos.com/content) | [src/app/(dashboard)/content/page.tsx](src/app/(dashboard)/content/page.tsx) | (stub) |
| [/blog](https://app.photoproos.com/blog) | [src/app/(dashboard)/blog/page.tsx](src/app/(dashboard)/blog/page.tsx) | (stub) |
| [/blog/new](https://app.photoproos.com/blog/new) | [src/app/(dashboard)/blog/new/page.tsx](src/app/(dashboard)/blog/new/page.tsx) | (stub) |
| [/blog/:id](https://app.photoproos.com/blog/:id) | [src/app/(dashboard)/blog/[id]/page.tsx](src/app/(dashboard)/blog/[id]/page.tsx) | (stub) |
| [/seo](https://app.photoproos.com/seo) | [src/app/(dashboard)/seo/page.tsx](src/app/(dashboard)/seo/page.tsx) | (stub) |
| [/ads](https://app.photoproos.com/ads) | [src/app/(dashboard)/ads/page.tsx](src/app/(dashboard)/ads/page.tsx) | (stub) |
| [/reviews](https://app.photoproos.com/reviews) | [src/app/(dashboard)/reviews/page.tsx](src/app/(dashboard)/reviews/page.tsx) | (stub) |
| [/landing-pages](https://app.photoproos.com/landing-pages) | [src/app/(dashboard)/landing-pages/page.tsx](src/app/(dashboard)/landing-pages/page.tsx) | (stub) |

### Communications

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/communications](https://app.photoproos.com/communications) | [src/app/(dashboard)/communications/page.tsx](src/app/(dashboard)/communications/page.tsx) | (stub) |
| [/email-inbox](https://app.photoproos.com/email-inbox) | [src/app/(dashboard)/email-inbox/page.tsx](src/app/(dashboard)/email-inbox/page.tsx) | (stub) |
| [/sms](https://app.photoproos.com/sms) | [src/app/(dashboard)/sms/page.tsx](src/app/(dashboard)/sms/page.tsx) | (stub) |
| [/messages](https://app.photoproos.com/messages) | [src/app/(dashboard)/messages/page.tsx](src/app/(dashboard)/messages/page.tsx) | |
| [/messages/new](https://app.photoproos.com/messages/new) | [src/app/(dashboard)/messages/new/page.tsx](src/app/(dashboard)/messages/new/page.tsx) | |
| [/messages/requests](https://app.photoproos.com/messages/requests) | [src/app/(dashboard)/messages/requests/page.tsx](src/app/(dashboard)/messages/requests/page.tsx) | |
| [/messages/:conversationId](https://app.photoproos.com/messages/:conversationId) | [src/app/(dashboard)/messages/[conversationId]/page.tsx](src/app/(dashboard)/messages/[conversationId]/page.tsx) | |

### Templates

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/templates](https://app.photoproos.com/templates) | [src/app/(dashboard)/templates/page.tsx](src/app/(dashboard)/templates/page.tsx) | (stub) |
| [/templates/emails](https://app.photoproos.com/templates/emails) | [src/app/(dashboard)/templates/emails/page.tsx](src/app/(dashboard)/templates/emails/page.tsx) | (stub) |
| [/templates/proposals](https://app.photoproos.com/templates/proposals) | [src/app/(dashboard)/templates/proposals/page.tsx](src/app/(dashboard)/templates/proposals/page.tsx) | (stub) |

### Workflow & Automation

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/workflows](https://app.photoproos.com/workflows) | [src/app/(dashboard)/workflows/page.tsx](src/app/(dashboard)/workflows/page.tsx) | (stub) |
| [/workflows/new](https://app.photoproos.com/workflows/new) | [src/app/(dashboard)/workflows/new/page.tsx](src/app/(dashboard)/workflows/new/page.tsx) | (stub) |
| [/workflows/:id](https://app.photoproos.com/workflows/:id) | [src/app/(dashboard)/workflows/[id]/page.tsx](src/app/(dashboard)/workflows/[id]/page.tsx) | (stub) |
| [/automations](https://app.photoproos.com/automations) | [src/app/(dashboard)/automations/page.tsx](src/app/(dashboard)/automations/page.tsx) | (stub) |

### Portfolios

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/portfolios](https://app.photoproos.com/portfolios) | [src/app/(dashboard)/portfolios/page.tsx](src/app/(dashboard)/portfolios/page.tsx) | |
| [/portfolios/new](https://app.photoproos.com/portfolios/new) | [src/app/(dashboard)/portfolios/new/page.tsx](src/app/(dashboard)/portfolios/new/page.tsx) | |
| [/portfolios/:id](https://app.photoproos.com/portfolios/:id) | [src/app/(dashboard)/portfolios/[id]/page.tsx](src/app/(dashboard)/portfolios/[id]/page.tsx) | |

### Reports & Analytics

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/reports](https://app.photoproos.com/reports) | [src/app/(dashboard)/reports/page.tsx](src/app/(dashboard)/reports/page.tsx) | (stub) |
| [/reports/revenue](https://app.photoproos.com/reports/revenue) | [src/app/(dashboard)/reports/revenue/page.tsx](src/app/(dashboard)/reports/revenue/page.tsx) | (stub) |
| [/reports/profit-loss](https://app.photoproos.com/reports/profit-loss) | [src/app/(dashboard)/reports/profit-loss/page.tsx](src/app/(dashboard)/reports/profit-loss/page.tsx) | (stub) |
| [/reports/tax-summary](https://app.photoproos.com/reports/tax-summary) | [src/app/(dashboard)/reports/tax-summary/page.tsx](src/app/(dashboard)/reports/tax-summary/page.tsx) | (stub) |
| [/reports/team](https://app.photoproos.com/reports/team) | [src/app/(dashboard)/reports/team/page.tsx](src/app/(dashboard)/reports/team/page.tsx) | (stub) |
| [/reports/bookings](https://app.photoproos.com/reports/bookings) | [src/app/(dashboard)/reports/bookings/page.tsx](src/app/(dashboard)/reports/bookings/page.tsx) | (stub) |
| [/reports/clients](https://app.photoproos.com/reports/clients) | [src/app/(dashboard)/reports/clients/page.tsx](src/app/(dashboard)/reports/clients/page.tsx) | (stub) |
| [/analytics](https://app.photoproos.com/analytics) | [src/app/(dashboard)/analytics/page.tsx](src/app/(dashboard)/analytics/page.tsx) | |
| [/benchmarks](https://app.photoproos.com/benchmarks) | [src/app/(dashboard)/benchmarks/page.tsx](src/app/(dashboard)/benchmarks/page.tsx) | (stub) |
| [/goals](https://app.photoproos.com/goals) | [src/app/(dashboard)/goals/page.tsx](src/app/(dashboard)/goals/page.tsx) | (stub) |
| [/activity](https://app.photoproos.com/activity) | [src/app/(dashboard)/activity/page.tsx](src/app/(dashboard)/activity/page.tsx) | (stub) |

### Gamification

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/achievements](https://app.photoproos.com/achievements) | [src/app/(dashboard)/achievements/page.tsx](src/app/(dashboard)/achievements/page.tsx) | |
| [/achievements/year-in-review](https://app.photoproos.com/achievements/year-in-review) | [src/app/(dashboard)/achievements/year-in-review/page.tsx](src/app/(dashboard)/achievements/year-in-review/page.tsx) | |
| [/leaderboard](https://app.photoproos.com/leaderboard) | [src/app/(dashboard)/leaderboard/page.tsx](src/app/(dashboard)/leaderboard/page.tsx) | |
| [/quests](https://app.photoproos.com/quests) | [src/app/(dashboard)/quests/page.tsx](src/app/(dashboard)/quests/page.tsx) | |
| [/skills](https://app.photoproos.com/skills) | [src/app/(dashboard)/skills/page.tsx](src/app/(dashboard)/skills/page.tsx) | |

### AI

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/ai](https://app.photoproos.com/ai) | [src/app/(dashboard)/ai/page.tsx](src/app/(dashboard)/ai/page.tsx) | |
| [/batch](https://app.photoproos.com/batch) | [src/app/(dashboard)/batch/page.tsx](src/app/(dashboard)/batch/page.tsx) | |

### Data Management

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/files](https://app.photoproos.com/files) | [src/app/(dashboard)/files/page.tsx](src/app/(dashboard)/files/page.tsx) | (stub) |
| [/storage](https://app.photoproos.com/storage) | [src/app/(dashboard)/storage/page.tsx](src/app/(dashboard)/storage/page.tsx) | (stub) |
| [/backups](https://app.photoproos.com/backups) | [src/app/(dashboard)/backups/page.tsx](src/app/(dashboard)/backups/page.tsx) | (stub) |
| [/import](https://app.photoproos.com/import) | [src/app/(dashboard)/import/page.tsx](src/app/(dashboard)/import/page.tsx) | (stub) |
| [/export](https://app.photoproos.com/export) | [src/app/(dashboard)/export/page.tsx](src/app/(dashboard)/export/page.tsx) | (stub) |
| [/archive](https://app.photoproos.com/archive) | [src/app/(dashboard)/archive/page.tsx](src/app/(dashboard)/archive/page.tsx) | (stub) |
| [/trash](https://app.photoproos.com/trash) | [src/app/(dashboard)/trash/page.tsx](src/app/(dashboard)/trash/page.tsx) | (stub) |
| [/tags](https://app.photoproos.com/tags) | [src/app/(dashboard)/tags/page.tsx](src/app/(dashboard)/tags/page.tsx) | (stub) |
| [/custom-fields](https://app.photoproos.com/custom-fields) | [src/app/(dashboard)/custom-fields/page.tsx](src/app/(dashboard)/custom-fields/page.tsx) | (stub) |

### Integrations & API

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/integrations](https://app.photoproos.com/integrations) | [src/app/(dashboard)/integrations/page.tsx](src/app/(dashboard)/integrations/page.tsx) | (stub) |
| [/integrations/quickbooks](https://app.photoproos.com/integrations/quickbooks) | [src/app/(dashboard)/integrations/quickbooks/page.tsx](src/app/(dashboard)/integrations/quickbooks/page.tsx) | (stub) |
| [/integrations/google](https://app.photoproos.com/integrations/google) | [src/app/(dashboard)/integrations/google/page.tsx](src/app/(dashboard)/integrations/google/page.tsx) | (stub) |
| [/integrations/zapier](https://app.photoproos.com/integrations/zapier) | [src/app/(dashboard)/integrations/zapier/page.tsx](src/app/(dashboard)/integrations/zapier/page.tsx) | (stub) |
| [/webhooks](https://app.photoproos.com/webhooks) | [src/app/(dashboard)/webhooks/page.tsx](src/app/(dashboard)/webhooks/page.tsx) | (stub) |
| [/api-keys](https://app.photoproos.com/api-keys) | [src/app/(dashboard)/api-keys/page.tsx](src/app/(dashboard)/api-keys/page.tsx) | (stub) |

### Help & Support

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/help](https://app.photoproos.com/help) | [src/app/(dashboard)/help/page.tsx](src/app/(dashboard)/help/page.tsx) | |
| [/help/faq](https://app.photoproos.com/help/faq) | [src/app/(dashboard)/help/faq/page.tsx](src/app/(dashboard)/help/faq/page.tsx) | |
| [/help/contact](https://app.photoproos.com/help/contact) | [src/app/(dashboard)/help/contact/page.tsx](src/app/(dashboard)/help/contact/page.tsx) | |
| [/help/getting-started](https://app.photoproos.com/help/getting-started) | [src/app/(dashboard)/help/getting-started/page.tsx](src/app/(dashboard)/help/getting-started/page.tsx) | (stub) |
| [/help/videos](https://app.photoproos.com/help/videos) | [src/app/(dashboard)/help/videos/page.tsx](src/app/(dashboard)/help/videos/page.tsx) | (stub) |
| [/help/:category](https://app.photoproos.com/help/:category) | [src/app/(dashboard)/help/[category]/page.tsx](src/app/(dashboard)/help/[category]/page.tsx) | |
| [/help/:category/:slug](https://app.photoproos.com/help/:category/:slug) | [src/app/(dashboard)/help/[category]/[slug]/page.tsx](src/app/(dashboard)/help/[category]/[slug]/page.tsx) | |
| [/support](https://app.photoproos.com/support) | [src/app/(dashboard)/support/page.tsx](src/app/(dashboard)/support/page.tsx) | (stub) |
| [/support/new](https://app.photoproos.com/support/new) | [src/app/(dashboard)/support/new/page.tsx](src/app/(dashboard)/support/new/page.tsx) | (stub) |

### Settings

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/settings](https://app.photoproos.com/settings) | [src/app/(dashboard)/settings/page.tsx](src/app/(dashboard)/settings/page.tsx) | |
| [/settings/profile](https://app.photoproos.com/settings/profile) | [src/app/(dashboard)/settings/profile/page.tsx](src/app/(dashboard)/settings/profile/page.tsx) | |
| [/settings/branding](https://app.photoproos.com/settings/branding) | [src/app/(dashboard)/settings/branding/page.tsx](src/app/(dashboard)/settings/branding/page.tsx) | |
| [/settings/appearance](https://app.photoproos.com/settings/appearance) | [src/app/(dashboard)/settings/appearance/page.tsx](src/app/(dashboard)/settings/appearance/page.tsx) | |
| [/settings/notifications](https://app.photoproos.com/settings/notifications) | [src/app/(dashboard)/settings/notifications/page.tsx](src/app/(dashboard)/settings/notifications/page.tsx) | |
| [/settings/billing](https://app.photoproos.com/settings/billing) | [src/app/(dashboard)/settings/billing/page.tsx](src/app/(dashboard)/settings/billing/page.tsx) | |
| [/settings/billing/upgrade](https://app.photoproos.com/settings/billing/upgrade) | [src/app/(dashboard)/settings/billing/upgrade/page.tsx](src/app/(dashboard)/settings/billing/upgrade/page.tsx) | |
| [/settings/payments](https://app.photoproos.com/settings/payments) | [src/app/(dashboard)/settings/payments/page.tsx](src/app/(dashboard)/settings/payments/page.tsx) | |
| [/settings/payouts](https://app.photoproos.com/settings/payouts) | [src/app/(dashboard)/settings/payouts/page.tsx](src/app/(dashboard)/settings/payouts/page.tsx) | |
| [/settings/team](https://app.photoproos.com/settings/team) | [src/app/(dashboard)/settings/team/page.tsx](src/app/(dashboard)/settings/team/page.tsx) | |
| [/settings/team/:id/capabilities](https://app.photoproos.com/settings/team/:id/capabilities) | [src/app/(dashboard)/settings/team/[id]/capabilities/page.tsx](src/app/(dashboard)/settings/team/[id]/capabilities/page.tsx) | |
| [/settings/calendar](https://app.photoproos.com/settings/calendar) | [src/app/(dashboard)/settings/calendar/page.tsx](src/app/(dashboard)/settings/calendar/page.tsx) | |
| [/settings/booking](https://app.photoproos.com/settings/booking) | [src/app/(dashboard)/settings/booking/page.tsx](src/app/(dashboard)/settings/booking/page.tsx) | (stub) |
| [/settings/email](https://app.photoproos.com/settings/email) | [src/app/(dashboard)/settings/email/page.tsx](src/app/(dashboard)/settings/email/page.tsx) | |
| [/settings/email-logs](https://app.photoproos.com/settings/email-logs) | [src/app/(dashboard)/settings/email-logs/page.tsx](src/app/(dashboard)/settings/email-logs/page.tsx) | |
| [/settings/sms](https://app.photoproos.com/settings/sms) | [src/app/(dashboard)/settings/sms/page.tsx](src/app/(dashboard)/settings/sms/page.tsx) | |
| [/settings/sms/templates](https://app.photoproos.com/settings/sms/templates) | [src/app/(dashboard)/settings/sms/templates/page.tsx](src/app/(dashboard)/settings/sms/templates/page.tsx) | |
| [/settings/security](https://app.photoproos.com/settings/security) | [src/app/(dashboard)/settings/security/page.tsx](src/app/(dashboard)/settings/security/page.tsx) | (stub) |
| [/settings/data](https://app.photoproos.com/settings/data) | [src/app/(dashboard)/settings/data/page.tsx](src/app/(dashboard)/settings/data/page.tsx) | (stub) |
| [/settings/integrations](https://app.photoproos.com/settings/integrations) | [src/app/(dashboard)/settings/integrations/page.tsx](src/app/(dashboard)/settings/integrations/page.tsx) | |
| [/settings/territories](https://app.photoproos.com/settings/territories) | [src/app/(dashboard)/settings/territories/page.tsx](src/app/(dashboard)/settings/territories/page.tsx) | |
| [/settings/watermarks](https://app.photoproos.com/settings/watermarks) | [src/app/(dashboard)/settings/watermarks/page.tsx](src/app/(dashboard)/settings/watermarks/page.tsx) | |
| [/settings/gallery-templates](https://app.photoproos.com/settings/gallery-templates) | [src/app/(dashboard)/settings/gallery-templates/page.tsx](src/app/(dashboard)/settings/gallery-templates/page.tsx) | |
| [/settings/gallery-addons](https://app.photoproos.com/settings/gallery-addons) | [src/app/(dashboard)/settings/gallery-addons/page.tsx](src/app/(dashboard)/settings/gallery-addons/page.tsx) | |
| [/settings/canned-responses](https://app.photoproos.com/settings/canned-responses) | [src/app/(dashboard)/settings/canned-responses/page.tsx](src/app/(dashboard)/settings/canned-responses/page.tsx) | |
| [/settings/mls-presets](https://app.photoproos.com/settings/mls-presets) | [src/app/(dashboard)/settings/mls-presets/page.tsx](src/app/(dashboard)/settings/mls-presets/page.tsx) | |
| [/settings/photographer-pay](https://app.photoproos.com/settings/photographer-pay) | [src/app/(dashboard)/settings/photographer-pay/page.tsx](src/app/(dashboard)/settings/photographer-pay/page.tsx) | |
| [/settings/equipment](https://app.photoproos.com/settings/equipment) | [src/app/(dashboard)/settings/equipment/page.tsx](src/app/(dashboard)/settings/equipment/page.tsx) | |
| [/settings/travel](https://app.photoproos.com/settings/travel) | [src/app/(dashboard)/settings/travel/page.tsx](src/app/(dashboard)/settings/travel/page.tsx) | |
| [/settings/tax-prep](https://app.photoproos.com/settings/tax-prep) | [src/app/(dashboard)/settings/tax-prep/page.tsx](src/app/(dashboard)/settings/tax-prep/page.tsx) | |
| [/settings/discounts](https://app.photoproos.com/settings/discounts) | [src/app/(dashboard)/settings/discounts/page.tsx](src/app/(dashboard)/settings/discounts/page.tsx) | |
| [/settings/features](https://app.photoproos.com/settings/features) | [src/app/(dashboard)/settings/features/page.tsx](src/app/(dashboard)/settings/features/page.tsx) | |
| [/settings/referrals](https://app.photoproos.com/settings/referrals) | [src/app/(dashboard)/settings/referrals/page.tsx](src/app/(dashboard)/settings/referrals/page.tsx) | |
| [/settings/my-referrals](https://app.photoproos.com/settings/my-referrals) | [src/app/(dashboard)/settings/my-referrals/page.tsx](src/app/(dashboard)/settings/my-referrals/page.tsx) | |
| [/settings/reviews](https://app.photoproos.com/settings/reviews) | [src/app/(dashboard)/settings/reviews/page.tsx](src/app/(dashboard)/settings/reviews/page.tsx) | |
| [/settings/reviews/requests](https://app.photoproos.com/settings/reviews/requests) | [src/app/(dashboard)/settings/reviews/requests/page.tsx](src/app/(dashboard)/settings/reviews/requests/page.tsx) | |
| [/settings/gamification](https://app.photoproos.com/settings/gamification) | [src/app/(dashboard)/settings/gamification/page.tsx](src/app/(dashboard)/settings/gamification/page.tsx) | |
| [/settings/marketing](https://app.photoproos.com/settings/marketing) | [src/app/(dashboard)/settings/marketing/page.tsx](src/app/(dashboard)/settings/marketing/page.tsx) | |
| [/settings/onboarding](https://app.photoproos.com/settings/onboarding) | [src/app/(dashboard)/settings/onboarding/page.tsx](src/app/(dashboard)/settings/onboarding/page.tsx) | |
| [/settings/walkthroughs](https://app.photoproos.com/settings/walkthroughs) | [src/app/(dashboard)/settings/walkthroughs/page.tsx](src/app/(dashboard)/settings/walkthroughs/page.tsx) | |
| [/settings/roadmap](https://app.photoproos.com/settings/roadmap) | [src/app/(dashboard)/settings/roadmap/page.tsx](src/app/(dashboard)/settings/roadmap/page.tsx) | |
| [/settings/support](https://app.photoproos.com/settings/support) | [src/app/(dashboard)/settings/support/page.tsx](src/app/(dashboard)/settings/support/page.tsx) | |
| [/settings/developer](https://app.photoproos.com/settings/developer) | [src/app/(dashboard)/settings/developer/page.tsx](src/app/(dashboard)/settings/developer/page.tsx) | |
| [/settings/developer/api](https://app.photoproos.com/settings/developer/api) | [src/app/(dashboard)/settings/developer/api/page.tsx](src/app/(dashboard)/settings/developer/api/page.tsx) | |

### Third-Party Integrations (Settings)

| Live Route | File Path | Status |
|------------|-----------|--------|
| [/settings/quickbooks](https://app.photoproos.com/settings/quickbooks) | [src/app/(dashboard)/settings/quickbooks/page.tsx](src/app/(dashboard)/settings/quickbooks/page.tsx) | |
| [/settings/mailchimp](https://app.photoproos.com/settings/mailchimp) | [src/app/(dashboard)/settings/mailchimp/page.tsx](src/app/(dashboard)/settings/mailchimp/page.tsx) | |
| [/settings/zapier](https://app.photoproos.com/settings/zapier) | [src/app/(dashboard)/settings/zapier/page.tsx](src/app/(dashboard)/settings/zapier/page.tsx) | |
| [/settings/slack](https://app.photoproos.com/settings/slack) | [src/app/(dashboard)/settings/slack/page.tsx](src/app/(dashboard)/settings/slack/page.tsx) | |
| [/settings/calendly](https://app.photoproos.com/settings/calendly) | [src/app/(dashboard)/settings/calendly/page.tsx](src/app/(dashboard)/settings/calendly/page.tsx) | |
| [/settings/dropbox](https://app.photoproos.com/settings/dropbox) | [src/app/(dashboard)/settings/dropbox/page.tsx](src/app/(dashboard)/settings/dropbox/page.tsx) | |

---

*Generated: January 2026*
*Total Pages: 403 | Implemented: 239 | Stub: 164*
