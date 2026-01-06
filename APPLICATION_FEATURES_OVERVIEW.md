# PhotoProOS - Comprehensive Feature Overview (Source of Truth)

This document is the single source of truth for the current product and roadmap. It is written as a no-grey-area rebuild guide: routes, data model, APIs, actions, and module specs are all included here.

## How to Use This Document
- Start with Route and Screen Catalog to understand every page.
- Use Data Model Reference to recreate schemas, enums, and relationships.
- Use API Endpoints Inventory for server/API behavior.
- Use Server Actions Inventory for business logic.
- Use Module Specs and Industry Modules for UX-level requirements.
- Use Product Roadmap for planned features.

## System Architecture Summary
- Framework: Next.js App Router with server actions and route handlers.
- Auth: Clerk with organization membership and role-based access.
- Data: PostgreSQL via Prisma schema (see Data Model Reference).
- Storage: Cloudflare R2 for media assets; optional Dropbox integration.
- Payments: Stripe (Payments + Connect), invoices, payout tooling.
- Email/SMS: Resend, Gmail integration, and Twilio status webhooks.
- UI: Tailwind CSS, shared components under `src/components`.

## Cross-Cutting Systems
- Navigation: Unified sidebar for all breakpoints; collapsible icon mode; contextual secondary pane for sub-navigation.
- Search/Command: Global search and command palette (Cmd/Ctrl+K, "/") for quick navigation.
- Notifications: In-app notifications with unread counts and mark-read flows; client portal notifications in separate channel.
- Telemetry: Client performance metrics posted to `/api/telemetry`.
- Uploads: Presigned URL flow for assets; completion callback; download history tracking.
- Scheduling safety: Conflict detection and booking buffers enforced in booking actions.
- Preference persistence: Org/user selection and appearance preferences cached between pages.

## Route and Screen Catalog
The following list is the full route inventory. Each module section below explains behavior and data in detail.

### Auth Routes
- `/sign-in/[[...sign-in]]`
- `/sign-up/[[...sign-up]]`
- `/signup`

### Client Portal Routes
- `/portal`
- `/portal/login`
- `/portal/questionnaires/[id]`

### Dashboard Routes
- `/analytics`
- `/batch`
- `/billing/analytics`
- `/billing/estimates/[id]`
- `/billing/estimates/[id]/edit`
- `/billing/estimates/new`
- `/billing/reports`
- `/billing/retainers`
- `/booking`
- `/brokerages`
- `/brokerages/[id]`
- `/brokerages/[id]/edit`
- `/brokerages/new`
- `/clients`
- `/clients/[id]`
- `/clients/[id]/edit`
- `/clients/import`
- `/clients/merge`
- `/clients/new`
- `/contracts`
- `/contracts/[id]`
- `/contracts/[id]/edit`
- `/contracts/new`
- `/contracts/templates`
- `/contracts/templates/[id]`
- `/contracts/templates/new`
- `/create`
- `/dashboard`
- `/feedback`
- `/forms`
- `/forms/[id]`
- `/galleries`
- `/galleries/[id]`
- `/galleries/[id]/edit`
- `/galleries/new`
- `/galleries/services`
- `/galleries/services/[id]`
- `/galleries/services/new`
- `/inbox`
- `/invoices`
- `/invoices/[id]`
- `/invoices/[id]/edit`
- `/invoices/new`
- `/invoices/recurring`
- `/leads`
- `/licensing`
- `/mini-sessions`
- `/notifications`
- `/order-pages`
- `/order-pages/[id]`
- `/order-pages/new`
- `/orders`
- `/orders/[id]`
- `/orders/analytics`
- `/payments`
- `/payments/[id]`
- `/portfolios`
- `/portfolios/[id]`
- `/portfolios/new`
- `/products`
- `/products/[catalogId]`
- `/projects`
- `/projects/analytics`
- `/projects/tasks/[id]`
- `/properties`
- `/properties/[id]`
- `/properties/[id]/edit`
- `/properties/new`
- `/questionnaires`
- `/questionnaires/assigned/[id]`
- `/questionnaires/templates/[id]`
- `/questionnaires/templates/[id]/preview`
- `/questionnaires/templates/new`
- `/scheduling`
- `/scheduling/[id]`
- `/scheduling/[id]/edit`
- `/scheduling/availability`
- `/scheduling/booking-forms`
- `/scheduling/booking-forms/[id]`
- `/scheduling/booking-forms/[id]/submissions`
- `/scheduling/new`
- `/scheduling/time-off`
- `/scheduling/types`
- `/services`
- `/services/[id]`
- `/services/addons`
- `/services/addons/[id]`
- `/services/addons/new`
- `/services/bundles`
- `/services/bundles/[id]`
- `/services/bundles/new`
- `/services/new`
- `/settings`
- `/settings/appearance`
- `/settings/billing`
- `/settings/billing/upgrade`
- `/settings/branding`
- `/settings/calendar`
- `/settings/calendly`
- `/settings/developer`
- `/settings/dropbox`
- `/settings/email`
- `/settings/email-logs`
- `/settings/equipment`
- `/settings/features`
- `/settings/gallery-addons`
- `/settings/gallery-templates`
- `/settings/integrations`
- `/settings/mailchimp`
- `/settings/my-referrals`
- `/settings/notifications`
- `/settings/payments`
- `/settings/payouts`
- `/settings/photographer-pay`
- `/settings/profile`
- `/settings/quickbooks`
- `/settings/referrals`
- `/settings/slack`
- `/settings/sms`
- `/settings/sms/templates`
- `/settings/team`
- `/settings/team/[id]/capabilities`
- `/settings/territories`
- `/settings/travel`
- `/settings/watermarks`
- `/settings/zapier`

### Field Routes
- `/field`
- `/field/check-in`

### Marketing Routes
- `/about`
- `/affiliates`
- `/blog`
- `/blog/[slug]`
- `/careers`
- `/changelog`
- `/contact`
- `/features/analytics`
- `/features/automation`
- `/features/clients`
- `/features/contracts`
- `/features/galleries`
- `/features/payments`
- `/guides`
- `/help`
- `/help/[category]/[article]`
- `/industries/architecture`
- `/industries/commercial`
- `/industries/events`
- `/industries/food`
- `/industries/portraits`
- `/industries/real-estate`
- `/integrations`
- `/legal/cookies`
- `/legal/dpa`
- `/legal/privacy`
- `/legal/security`
- `/legal/terms`
- `/partners`
- `/press`
- `/pricing`
- `/roadmap`
- `/webinars`
- `/webinars/[slug]`

### Onboarding Routes
- `/onboarding`

### Root Routes
- `/`
- `/_custom-domain`
- `/book/[slug]`
- `/book/[slug]/confirmation`
- `/g/[slug]`
- `/invite/[token]`
- `/order/[slug]`
- `/order/[slug]/confirmation`
- `/p/[slug]`
- `/pay/[id]`
- `/portfolio/[slug]`
- `/r/[code]`
- `/schedule`
- `/sign/[token]`
- `/sign/[token]/complete`
- `/track`
- `/unsubscribe`

## Layout Catalog
- `src/app/(auth)/layout.tsx`
- `src/app/(client-portal)/layout.tsx`
- `src/app/(dashboard)/layout.tsx`
- `src/app/(dashboard)/settings/layout.tsx`
- `src/app/(field)/layout.tsx`
- `src/app/(marketing)/layout.tsx`
- `src/app/(onboarding)/layout.tsx`
- `src/app/book/layout.tsx`
- `src/app/layout.tsx`

## Component Import Path Catalog
- Alias: `@/*` maps to `src/*` (see `tsconfig.json`).
- Import paths omit file extensions. For `index.ts` or `index.tsx`, use the folder path.
- Route entrypoints (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) are listed in Route and Screen Catalog.

### Shared Components (src/components)
- `@/components/analytics/gallery-heat-map`
- `@/components/command-palette`
- `@/components/command-palette-provider`
- `@/components/contracts/bulk-export-button`
- `@/components/create-wizard/steps/client-step`
- `@/components/create-wizard/steps/gallery-step`
- `@/components/create-wizard/steps/review-step`
- `@/components/create-wizard/steps/scheduling-step`
- `@/components/create-wizard/steps/services-step`
- `@/components/dashboard`
- `@/components/dashboard/activity-item`
- `@/components/dashboard/addon-form`
- `@/components/dashboard/addon-list`
- `@/components/dashboard/booking-form-builder`
- `@/components/dashboard/breadcrumb`
- `@/components/dashboard/bundle-form`
- `@/components/dashboard/bundle-list`
- `@/components/dashboard/collapsible-section`
- `@/components/dashboard/dashboard-calendar`
- `@/components/dashboard/dashboard-customize-panel`
- `@/components/dashboard/empty-state`
- `@/components/dashboard/error-state`
- `@/components/dashboard/expiring-galleries-widget`
- `@/components/dashboard/gallery-card`
- `@/components/dashboard/industry-selector`
- `@/components/dashboard/invoice-builder`
- `@/components/dashboard/multi-service-selector`
- `@/components/dashboard/onboarding-checklist`
- `@/components/dashboard/order-page-form`
- `@/components/dashboard/overdue-invoices-widget`
- `@/components/dashboard/page-context-nav`
- `@/components/dashboard/page-header`
- `@/components/dashboard/portfolio-builder/configs/about-config`
- `@/components/dashboard/portfolio-builder/configs/awards-config`
- `@/components/dashboard/portfolio-builder/configs/contact-config`
- `@/components/dashboard/portfolio-builder/configs/faq-config`
- `@/components/dashboard/portfolio-builder/configs/gallery-config`
- `@/components/dashboard/portfolio-builder/configs/hero-config`
- `@/components/dashboard/portfolio-builder/configs/image-config`
- `@/components/dashboard/portfolio-builder/configs/services-config`
- `@/components/dashboard/portfolio-builder/configs/spacer-config`
- `@/components/dashboard/portfolio-builder/configs/testimonials-config`
- `@/components/dashboard/portfolio-builder/configs/text-config`
- `@/components/dashboard/portfolio-builder/configs/video-config`
- `@/components/dashboard/portfolio-builder/section-config-modal`
- `@/components/dashboard/property-details-card`
- `@/components/dashboard/quick-actions`
- `@/components/dashboard/referral-processor`
- `@/components/dashboard/referral-widget`
- `@/components/dashboard/related-items`
- `@/components/dashboard/revenue-chart`
- `@/components/dashboard/selectable-service-card`
- `@/components/dashboard/service-form`
- `@/components/dashboard/service-quick-actions`
- `@/components/dashboard/service-selector`
- `@/components/dashboard/services-bulk-actions`
- `@/components/dashboard/skeleton`
- `@/components/dashboard/stat-card`
- `@/components/dashboard/submission-detail-modal`
- `@/components/dashboard/team-member-selector`
- `@/components/dashboard/travel-info-card`
- `@/components/dashboard/upcoming-bookings`
- `@/components/dashboard/weather-forecast-card`
- `@/components/dev/bug-probe`
- `@/components/dev/responsive-tester`
- `@/components/gallery/activity-timeline`
- `@/components/gallery/addon-catalog-manager`
- `@/components/gallery/addon-requests-panel`
- `@/components/gallery/analytics-dashboard`
- `@/components/gallery/assign-to-collection-modal`
- `@/components/gallery/client-addon-panel`
- `@/components/gallery/collection-manager`
- `@/components/gallery/download-history-panel`
- `@/components/gallery/photo-comparison-modal`
- `@/components/gallery/selection-panel`
- `@/components/gallery/selections-review-panel`
- `@/components/gallery/slideshow-viewer`
- `@/components/gallery/smart-collections-panel`
- `@/components/integrations`
- `@/components/integrations/api-key-manager`
- `@/components/integrations/integration-card`
- `@/components/integrations/integration-status-badge`
- `@/components/integrations/webhook-manager`
- `@/components/invoices/bulk-export-button`
- `@/components/keyboard-shortcuts-provider`
- `@/components/layout/dashboard-layout-client`
- `@/components/layout/dashboard-sidebar`
- `@/components/layout/dashboard-topbar`
- `@/components/layout/footer`
- `@/components/layout/mobile-nav`
- `@/components/layout/navbar`
- `@/components/layout/settings-mobile-nav`
- `@/components/layout/settings-sidebar`
- `@/components/locale-switcher`
- `@/components/modals/assign-questionnaire-modal`
- `@/components/modals/create-booking-modal`
- `@/components/modals/create-client-modal`
- `@/components/modals/create-gallery-modal`
- `@/components/modals/create-property-modal`
- `@/components/modals/delete-confirmation-modal`
- `@/components/onboarding/onboarding-wizard`
- `@/components/onboarding/progress-indicator`
- `@/components/onboarding/steps/branding-step`
- `@/components/onboarding/steps/business-step`
- `@/components/onboarding/steps/complete-step`
- `@/components/onboarding/steps/features-step`
- `@/components/onboarding/steps/goals-step`
- `@/components/onboarding/steps/industries-step`
- `@/components/onboarding/steps/payment-step`
- `@/components/onboarding/steps/profile-step`
- `@/components/onboarding/steps/welcome-step`
- `@/components/order/checkout-modal`
- `@/components/perf/perf-overlay`
- `@/components/portal/agreement-signature`
- `@/components/providers/page-transition`
- `@/components/sections/comparison`
- `@/components/sections/cta`
- `@/components/sections/faq`
- `@/components/sections/features`
- `@/components/sections/hero`
- `@/components/sections/how-it-works`
- `@/components/sections/integrations`
- `@/components/sections/lazy-section`
- `@/components/sections/logos`
- `@/components/sections/noise-to-knowledge`
- `@/components/sections/pricing`
- `@/components/sections/roadmap`
- `@/components/sections/roi-calculator`
- `@/components/sections/security`
- `@/components/sections/testimonials`
- `@/components/sections/use-cases`
- `@/components/theme-provider`
- `@/components/tour`
- `@/components/tour/tour-provider`
- `@/components/tour/tour-spotlight`
- `@/components/tour/tour-starter`
- `@/components/tour/tour-trigger`
- `@/components/tour/tours`
- `@/components/ui/address-autocomplete`
- `@/components/ui/alert-dialog`
- `@/components/ui/animated-counter`
- `@/components/ui/animated-text`
- `@/components/ui/badge`
- `@/components/ui/blur-image`
- `@/components/ui/button`
- `@/components/ui/card`
- `@/components/ui/chat-widget`
- `@/components/ui/checkbox`
- `@/components/ui/confirm-dialog`
- `@/components/ui/dialog`
- `@/components/ui/dropdown-menu`
- `@/components/ui/empty-state`
- `@/components/ui/exit-intent-popup`
- `@/components/ui/floating-particles`
- `@/components/ui/gradient-button`
- `@/components/ui/icons`
- `@/components/ui/image-lightbox`
- `@/components/ui/image-upload`
- `@/components/ui/input`
- `@/components/ui/keyboard-shortcuts-modal`
- `@/components/ui/label`
- `@/components/ui/magnetic-button`
- `@/components/ui/map-preview`
- `@/components/ui/marquee`
- `@/components/ui/optimized-image`
- `@/components/ui/photoproos-logo`
- `@/components/ui/qr-code`
- `@/components/ui/quick-theme-switcher`
- `@/components/ui/scroll-progress`
- `@/components/ui/select`
- `@/components/ui/settings-icons`
- `@/components/ui/skeleton`
- `@/components/ui/social-proof-toast`
- `@/components/ui/sticky-cta`
- `@/components/ui/switch`
- `@/components/ui/table`
- `@/components/ui/tabs`
- `@/components/ui/textarea`
- `@/components/ui/theme-toggle`
- `@/components/ui/tilt-card`
- `@/components/ui/toast`
- `@/components/ui/video-modal`
- `@/components/ui/virtual-list`
- `@/components/upload/bulk-upload-modal`
- `@/components/upload/global-upload-modal`
- `@/components/upload/photo-upload-modal`

### Email Templates (src/emails)
- `@/emails/addon-request`
- `@/emails/booking-confirmation`
- `@/emails/booking-followup`
- `@/emails/booking-form-submitted`
- `@/emails/booking-reminder`
- `@/emails/client-magic-link`
- `@/emails/contract-signing`
- `@/emails/download-receipt`
- `@/emails/form-submission-notification`
- `@/emails/gallery-delivered`
- `@/emails/gallery-expiration`
- `@/emails/gallery-reminder`
- `@/emails/invoice-reminder`
- `@/emails/invoice-sent`
- `@/emails/order-confirmation`
- `@/emails/payment-receipt`
- `@/emails/payment-reminder`
- `@/emails/photographer-digest`
- `@/emails/portfolio-contact`
- `@/emails/portfolio-weekly-digest`
- `@/emails/property-lead`
- `@/emails/questionnaire-assigned`
- `@/emails/questionnaire-completed`
- `@/emails/questionnaire-reminder`
- `@/emails/referral-invite`
- `@/emails/referral-reward-earned`
- `@/emails/referral-signup-notification`
- `@/emails/team-invitation`
- `@/emails/waitlist-notification`
- `@/emails/welcome`

### App Route Components (src/app)
- `@/app/(client-portal)/portal/components/action-cards`
- `@/app/(client-portal)/portal/components/empty-state`
- `@/app/(client-portal)/portal/components/icons`
- `@/app/(client-portal)/portal/components/lightbox`
- `@/app/(client-portal)/portal/components/mobile-nav`
- `@/app/(client-portal)/portal/components/notification-bell`
- `@/app/(client-portal)/portal/components/portal-footer`
- `@/app/(client-portal)/portal/components/portal-header`
- `@/app/(client-portal)/portal/components/portal-stats`
- `@/app/(client-portal)/portal/components/portal-tabs`
- `@/app/(client-portal)/portal/components/skeleton`
- `@/app/(client-portal)/portal/components/tabs/downloads-tab`
- `@/app/(client-portal)/portal/components/tabs/galleries-tab`
- `@/app/(client-portal)/portal/components/tabs/invoices-tab`
- `@/app/(client-portal)/portal/components/tabs/properties-tab`
- `@/app/(client-portal)/portal/components/tabs/questionnaires-tab`
- `@/app/(client-portal)/portal/portal-client`
- `@/app/(client-portal)/portal/questionnaires/[id]/questionnaire-form`
- `@/app/(dashboard)/analytics/analytics-dashboard-client`
- `@/app/(dashboard)/billing/credit-notes/credit-notes-page-client`
- `@/app/(dashboard)/billing/estimates/[id]/edit/edit-estimate-form`
- `@/app/(dashboard)/billing/estimates/[id]/estimate-actions`
- `@/app/(dashboard)/billing/estimates/new/estimate-form`
- `@/app/(dashboard)/billing/retainers/retainers-page-client`
- `@/app/(dashboard)/brokerages/[id]/brokerage-contracts-section`
- `@/app/(dashboard)/brokerages/brokerage-form`
- `@/app/(dashboard)/clients/[id]/client-actions`
- `@/app/(dashboard)/clients/[id]/client-activity-timeline`
- `@/app/(dashboard)/clients/[id]/client-email-preferences`
- `@/app/(dashboard)/clients/[id]/edit/client-edit-form`
- `@/app/(dashboard)/clients/client-search`
- `@/app/(dashboard)/clients/clients-page-client`
- `@/app/(dashboard)/clients/import/client-import-client`
- `@/app/(dashboard)/clients/merge/client-merge-client`
- `@/app/(dashboard)/clients/new/client-new-form`
- `@/app/(dashboard)/clients/tags-management-client`
- `@/app/(dashboard)/contracts/[id]/contract-download-button`
- `@/app/(dashboard)/contracts/[id]/edit/contract-edit-client`
- `@/app/(dashboard)/contracts/contracts-page-client`
- `@/app/(dashboard)/contracts/new/contract-form-client`
- `@/app/(dashboard)/contracts/templates/template-form-client`
- `@/app/(dashboard)/contracts/templates/templates-list-client`
- `@/app/(dashboard)/create/create-wizard-client`
- `@/app/(dashboard)/feedback/feedback-inbox-client`
- `@/app/(dashboard)/forms/[id]/form-editor-client`
- `@/app/(dashboard)/forms/forms-page-client`
- `@/app/(dashboard)/galleries/[id]/edit/gallery-edit-form`
- `@/app/(dashboard)/galleries/[id]/gallery-actions`
- `@/app/(dashboard)/galleries/[id]/gallery-detail-client`
- `@/app/(dashboard)/galleries/[id]/gallery-detail-icons`
- `@/app/(dashboard)/galleries/galleries-page-client`
- `@/app/(dashboard)/galleries/gallery-list-client`
- `@/app/(dashboard)/galleries/new/gallery-new-form`
- `@/app/(dashboard)/galleries/services-list-client`
- `@/app/(dashboard)/inbox/inbox-page-client`
- `@/app/(dashboard)/invoices/[id]/edit/invoice-editor`
- `@/app/(dashboard)/invoices/[id]/invoice-actions`
- `@/app/(dashboard)/invoices/[id]/invoice-split-section`
- `@/app/(dashboard)/invoices/[id]/record-payment-modal`
- `@/app/(dashboard)/invoices/invoices-page-client`
- `@/app/(dashboard)/invoices/new/invoice-form`
- `@/app/(dashboard)/invoices/recurring/recurring-invoices-client`
- `@/app/(dashboard)/leads/leads-page-client`
- `@/app/(dashboard)/notifications/notifications-page-client`
- `@/app/(dashboard)/orders/[id]/order-actions`
- `@/app/(dashboard)/orders/analytics/sqft-analytics-client`
- `@/app/(dashboard)/orders/orders-table-client`
- `@/app/(dashboard)/payments/[id]/payment-actions`
- `@/app/(dashboard)/payments/bulk-pdf-button`
- `@/app/(dashboard)/payments/export-button`
- `@/app/(dashboard)/payments/payments-page-client`
- `@/app/(dashboard)/portfolios/[id]/components/preview-panel`
- `@/app/(dashboard)/portfolios/[id]/components/qr-code-modal`
- `@/app/(dashboard)/portfolios/[id]/portfolio-detail-client`
- `@/app/(dashboard)/portfolios/[id]/portfolio-editor-client`
- `@/app/(dashboard)/portfolios/[id]/tabs/ab-testing-tab`
- `@/app/(dashboard)/portfolios/[id]/tabs/analytics-tab`
- `@/app/(dashboard)/portfolios/[id]/tabs/comments-tab`
- `@/app/(dashboard)/portfolios/[id]/tabs/design-tab`
- `@/app/(dashboard)/portfolios/[id]/tabs/projects-tab`
- `@/app/(dashboard)/portfolios/[id]/tabs/sections-tab`
- `@/app/(dashboard)/portfolios/[id]/tabs/settings-tab`
- `@/app/(dashboard)/portfolios/new/new-portfolio-client`
- `@/app/(dashboard)/products/[catalogId]/catalog-client`
- `@/app/(dashboard)/products/products-client`
- `@/app/(dashboard)/projects/analytics/projects-analytics-client`
- `@/app/(dashboard)/projects/automation-modals`
- `@/app/(dashboard)/projects/projects-client`
- `@/app/(dashboard)/projects/tasks/[id]/task-detail-client`
- `@/app/(dashboard)/properties/[id]/edit/property-edit-form`
- `@/app/(dashboard)/properties/[id]/property-detail-client`
- `@/app/(dashboard)/properties/analytics-view-client`
- `@/app/(dashboard)/properties/leads-view-client`
- `@/app/(dashboard)/properties/new/new-property-website-client`
- `@/app/(dashboard)/properties/properties-client`
- `@/app/(dashboard)/properties/properties-page-client`
- `@/app/(dashboard)/questionnaires/assigned/[id]/response-viewer`
- `@/app/(dashboard)/questionnaires/questionnaires-page-client`
- `@/app/(dashboard)/questionnaires/templates/[id]/preview/preview-client`
- `@/app/(dashboard)/questionnaires/templates/[id]/template-editor-client`
- `@/app/(dashboard)/scheduling/[id]/booking-actions`
- `@/app/(dashboard)/scheduling/[id]/booking-delete-action`
- `@/app/(dashboard)/scheduling/[id]/booking-project-action`
- `@/app/(dashboard)/scheduling/[id]/edit/booking-edit-form`
- `@/app/(dashboard)/scheduling/availability/availability-page-client`
- `@/app/(dashboard)/scheduling/booking-forms/[id]/booking-form-edit-client`
- `@/app/(dashboard)/scheduling/booking-forms/[id]/submissions/submissions-page-client`
- `@/app/(dashboard)/scheduling/booking-forms/booking-forms-page-client`
- `@/app/(dashboard)/scheduling/new/booking-new-form`
- `@/app/(dashboard)/scheduling/scheduling-page-client`
- `@/app/(dashboard)/scheduling/time-off/time-off-page-client`
- `@/app/(dashboard)/scheduling/types/booking-types-client`
- `@/app/(dashboard)/services/services-page-client`
- `@/app/(dashboard)/settings/appearance/appearance-settings-form`
- `@/app/(dashboard)/settings/billing/upgrade/upgrade-form`
- `@/app/(dashboard)/settings/branding/branding-settings-form`
- `@/app/(dashboard)/settings/calendar/calendar-settings-client`
- `@/app/(dashboard)/settings/calendly/calendly-settings-client`
- `@/app/(dashboard)/settings/developer/seed-buttons`
- `@/app/(dashboard)/settings/developer/stripe-products`
- `@/app/(dashboard)/settings/developer/subscription-plans`
- `@/app/(dashboard)/settings/dropbox/dropbox-settings-client`
- `@/app/(dashboard)/settings/equipment/equipment-list`
- `@/app/(dashboard)/settings/features/features-settings-form`
- `@/app/(dashboard)/settings/gallery-templates/gallery-templates-client`
- `@/app/(dashboard)/settings/integrations/integrations-client`
- `@/app/(dashboard)/settings/mailchimp/mailchimp-settings-client`
- `@/app/(dashboard)/settings/my-referrals/my-referrals-client`
- `@/app/(dashboard)/settings/payments/connect-button`
- `@/app/(dashboard)/settings/payments/payments-settings-client`
- `@/app/(dashboard)/settings/payments/tax-settings-form`
- `@/app/(dashboard)/settings/payouts/payouts-page-client`
- `@/app/(dashboard)/settings/photographer-pay/photographer-pay-client`
- `@/app/(dashboard)/settings/profile/profile-settings-form`
- `@/app/(dashboard)/settings/quickbooks/quickbooks-settings-client`
- `@/app/(dashboard)/settings/referrals/referrals-client`
- `@/app/(dashboard)/settings/settings-page-client`
- `@/app/(dashboard)/settings/slack/slack-settings-client`
- `@/app/(dashboard)/settings/sms/sms-settings-client`
- `@/app/(dashboard)/settings/sms/templates/sms-templates-client`
- `@/app/(dashboard)/settings/team/[id]/capabilities/capabilities-form`
- `@/app/(dashboard)/settings/team/invite-modal`
- `@/app/(dashboard)/settings/team/team-page-client`
- `@/app/(dashboard)/settings/territories/territories-client`
- `@/app/(dashboard)/settings/travel/travel-settings-form`
- `@/app/(dashboard)/settings/watermarks/watermark-templates-client`
- `@/app/(dashboard)/settings/zapier/zapier-settings-client`
- `@/app/(field)/field/check-in/check-in-client`
- `@/app/(field)/field/field-schedule-client`
- `@/app/(marketing)/blog/newsletter-form`
- `@/app/(marketing)/contact/contact-form`
- `@/app/api/gallery/[id]/analytics-report/analytics-report-document`
- `@/app/api/gallery/[id]/proof-sheet/proof-sheet-document`
- `@/app/book/[slug]/booking-form-public`
- `@/app/g/[slug]/gallery-client`
- `@/app/g/[slug]/gallery-icons`
- `@/app/g/[slug]/password-gate`
- `@/app/g/[slug]/pay-button`
- `@/app/invite/[token]/invite-accept-client`
- `@/app/order/[slug]/confirmation/order-confirmation-client`
- `@/app/order/[slug]/order-page-client`
- `@/app/p/[slug]/property-inquiry-form`
- `@/app/p/[slug]/property-share-buttons`
- `@/app/pay/[id]/pay-client`
- `@/app/portfolio/[slug]/comments-section`
- `@/app/portfolio/[slug]/components/lightbox`
- `@/app/portfolio/[slug]/components/share-buttons`
- `@/app/portfolio/[slug]/expired-notice`
- `@/app/portfolio/[slug]/lead-gate`
- `@/app/portfolio/[slug]/opengraph-image`
- `@/app/portfolio/[slug]/password-gate`
- `@/app/portfolio/[slug]/portfolio-renderer`
- `@/app/portfolio/[slug]/sections/about-section`
- `@/app/portfolio/[slug]/sections/awards-section`
- `@/app/portfolio/[slug]/sections/contact-section`
- `@/app/portfolio/[slug]/sections/faq-section`
- `@/app/portfolio/[slug]/sections/gallery-section`
- `@/app/portfolio/[slug]/sections/hero-section`
- `@/app/portfolio/[slug]/sections/image-section`
- `@/app/portfolio/[slug]/sections/services-section`
- `@/app/portfolio/[slug]/sections/spacer-section`
- `@/app/portfolio/[slug]/sections/testimonials-section`
- `@/app/portfolio/[slug]/sections/text-section`
- `@/app/portfolio/[slug]/sections/video-section`

## Route Dependency Matrix (Direct Imports)
- This section lists direct imports from each `page.tsx` entrypoint.
- For layout-level dependencies, see the Layout Catalog above.
- For deeper component dependencies, use the Component Import Path Catalog and Server Action specs.

### /sign-in/[[...sign-in]]
- Entry: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`

### /sign-up/[[...sign-up]]
- Entry: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Server actions:
  - `@/lib/actions/platform-referrals`: trackReferralClick

### /signup
- Entry: `src/app/(auth)/signup/page.tsx`

### /portal
- Entry: `src/app/(client-portal)/portal/page.tsx`
- App components:
  - `@/app/(client-portal)/portal/portal-client`
- Server actions:
  - `@/lib/actions/client-portal`: getClientPortalData

### /portal/login
- Entry: `src/app/(client-portal)/portal/login/page.tsx`
- Server actions:
  - `@/lib/actions/client-auth`: sendClientMagicLink

### /portal/questionnaires/[id]
- Entry: `src/app/(client-portal)/portal/questionnaires/[id]/page.tsx`
- App components:
  - `@/app/(client-portal)/portal/questionnaires/[id]/questionnaire-form`
- Server actions:
  - `@/lib/actions/questionnaire-portal`: getQuestionnaireForCompletion

### /analytics
- Entry: `src/app/(dashboard)/analytics/page.tsx`
- Components:
  - `@/components/ui/skeleton`
- App components:
  - `@/app/(dashboard)/analytics/analytics-dashboard-client`
- Server actions:
  - `@/lib/actions/analytics`: getClientLTVMetrics, getDashboardAnalytics, getRevenueForecast

### /batch
- Entry: `src/app/(dashboard)/batch/page.tsx`
- Components:
  - `@/components/dashboard`
- Server actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId

### /billing/analytics
- Entry: `src/app/(dashboard)/billing/analytics/page.tsx`
- Components:
  - `@/components/dashboard`

### /billing/estimates/[id]
- Entry: `src/app/(dashboard)/billing/estimates/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/estimates/[id]/estimate-actions`
- Server actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId

### /billing/estimates/[id]/edit
- Entry: `src/app/(dashboard)/billing/estimates/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/estimates/[id]/edit/edit-estimate-form`
- Server actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId

### /billing/estimates/new
- Entry: `src/app/(dashboard)/billing/estimates/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/estimates/new/estimate-form`
- Server actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId

### /billing/reports
- Entry: `src/app/(dashboard)/billing/reports/page.tsx`
- Components:
  - `@/components/dashboard`
- Server actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId

### /billing/retainers
- Entry: `src/app/(dashboard)/billing/retainers/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/retainers/retainers-page-client`

### /booking
- Entry: `src/app/(dashboard)/booking/page.tsx`
- Components:
  - `@/components/dashboard`
- Server actions:
  - `@/lib/actions/booking-forms`: getBookingForms

### /brokerages
- Entry: `src/app/(dashboard)/brokerages/page.tsx`
- Components:
  - `@/components/dashboard`
- Server actions:
  - `@/lib/actions/brokerages`: getBrokerages

### /brokerages/[id]
- Entry: `src/app/(dashboard)/brokerages/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/brokerages/[id]/brokerage-contracts-section`
- Server actions:
  - `@/lib/actions/brokerage-contracts`: getBrokerageContracts
  - `@/lib/actions/brokerages`: getBrokerage, getBrokerageAgents

### /brokerages/[id]/edit
- Entry: `src/app/(dashboard)/brokerages/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/brokerages/brokerage-form`
- Server actions:
  - `@/lib/actions/brokerages`: getBrokerage

### /brokerages/new
- Entry: `src/app/(dashboard)/brokerages/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/brokerages/brokerage-form`

### /clients
- Entry: `src/app/(dashboard)/clients/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/clients/clients-page-client`
  - `@/app/(dashboard)/clients/tags-management-client`
- Server actions:
  - `@/lib/actions/client-tags`: getClientTags

### /clients/[id]
- Entry: `src/app/(dashboard)/clients/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/clients/[id]/client-actions`
  - `@/app/(dashboard)/clients/[id]/client-activity-timeline`
  - `@/app/(dashboard)/clients/[id]/client-email-preferences`
- Server actions:
  - `@/lib/actions/email-logs`: getClientEmailHealth, getClientEmailLogs

### /clients/[id]/edit
- Entry: `src/app/(dashboard)/clients/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/clients/[id]/edit/client-edit-form`
- Server actions:
  - `@/lib/actions/clients`: deleteClient, getClient, updateClient

### /clients/import
- Entry: `src/app/(dashboard)/clients/import/page.tsx`
- App components:
  - `@/app/(dashboard)/clients/import/client-import-client`

### /clients/merge
- Entry: `src/app/(dashboard)/clients/merge/page.tsx`
- App components:
  - `@/app/(dashboard)/clients/merge/client-merge-client`

### /clients/new
- Entry: `src/app/(dashboard)/clients/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/clients/new/client-new-form`

### /contracts
- Entry: `src/app/(dashboard)/contracts/page.tsx`
- App components:
  - `@/app/(dashboard)/contracts/contracts-page-client`

### /contracts/[id]
- Entry: `src/app/(dashboard)/contracts/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/contracts/[id]/contract-download-button`
- Server actions:
  - `@/lib/actions/contract-signing`: cancelContract
  - `@/lib/actions/contracts`: deleteContract, getContract, sendContract

### /contracts/[id]/edit
- Entry: `src/app/(dashboard)/contracts/[id]/edit/page.tsx`
- App components:
  - `@/app/(dashboard)/contracts/[id]/edit/contract-edit-client`
- Server actions:
  - `@/lib/actions/contracts`: getContract

### /contracts/new
- Entry: `src/app/(dashboard)/contracts/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/contracts/new/contract-form-client`

### /contracts/templates
- Entry: `src/app/(dashboard)/contracts/templates/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/contracts/templates/templates-list-client`
- Server actions:
  - `@/lib/actions/contract-templates`: getContractTemplates, seedDefaultContractTemplates

### /contracts/templates/[id]
- Entry: `src/app/(dashboard)/contracts/templates/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/contracts/templates/template-form-client`
- Server actions:
  - `@/lib/actions/contract-templates`: getContractTemplates

### /contracts/templates/new
- Entry: `src/app/(dashboard)/contracts/templates/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/contracts/templates/template-form-client`

### /create
- Entry: `src/app/(dashboard)/create/page.tsx`
- App components:
  - `@/app/(dashboard)/create/create-wizard-client`
- Server actions:
  - `@/lib/actions/create-wizard`: getWizardData

### /dashboard
- Entry: `src/app/(dashboard)/dashboard/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/dashboard-calendar`
  - `@/components/dashboard/expiring-galleries-widget`
  - `@/components/dashboard/gallery-card`
  - `@/components/tour`
- Server actions:
  - `@/lib/actions/dashboard`: getDashboardConfig
  - `@/lib/actions/gallery-expiration`: getExpiringSoonGalleries
  - `@/lib/actions/invoices`: getOverdueInvoicesForDashboard

### /feedback
- Entry: `src/app/(dashboard)/feedback/page.tsx`
- App components:
  - `@/app/(dashboard)/feedback/feedback-inbox-client`

### /forms
- Entry: `src/app/(dashboard)/forms/page.tsx`
- App components:
  - `@/app/(dashboard)/forms/forms-page-client`
- Server actions:
  - `@/lib/actions/custom-forms`: getForms

### /forms/[id]
- Entry: `src/app/(dashboard)/forms/[id]/page.tsx`
- App components:
  - `@/app/(dashboard)/forms/[id]/form-editor-client`
- Server actions:
  - `@/lib/actions/custom-forms`: getForm

### /galleries
- Entry: `src/app/(dashboard)/galleries/page.tsx`
- App components:
  - `@/app/(dashboard)/galleries/galleries-page-client`
- Server actions:
  - `@/lib/actions/galleries`: getGalleryCounts

### /galleries/[id]
- Entry: `src/app/(dashboard)/galleries/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/galleries/[id]/gallery-actions`
  - `@/app/(dashboard)/galleries/[id]/gallery-detail-client`
- Server actions:
  - `@/lib/actions/download-tracking`: getGalleryDownloadAnalytics
  - `@/lib/actions/galleries`: deliverGallery, getGallery
  - `@/lib/actions/invoices`: getClientInvoices

### /galleries/[id]/edit
- Entry: `src/app/(dashboard)/galleries/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/service-selector`
- App components:
  - `@/app/(dashboard)/galleries/[id]/edit/gallery-edit-form`
- Server actions:
  - `@/lib/actions/galleries`: getGallery

### /galleries/new
- Entry: `src/app/(dashboard)/galleries/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/galleries/new/gallery-new-form`
- Server actions:
  - `@/lib/actions/gallery-templates`: getGalleryTemplates

### /galleries/services
- Entry: `src/app/(dashboard)/galleries/services/page.tsx`

### /galleries/services/[id]
- Entry: `src/app/(dashboard)/galleries/services/[id]/page.tsx`

### /galleries/services/new
- Entry: `src/app/(dashboard)/galleries/services/new/page.tsx`

### /inbox
- Entry: `src/app/(dashboard)/inbox/page.tsx`
- App components:
  - `@/app/(dashboard)/inbox/inbox-page-client`

### /invoices
- Entry: `src/app/(dashboard)/invoices/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/invoices/bulk-export-button`
- App components:
  - `@/app/(dashboard)/invoices/invoices-page-client`

### /invoices/[id]
- Entry: `src/app/(dashboard)/invoices/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/invoices/[id]/invoice-actions`
  - `@/app/(dashboard)/invoices/[id]/invoice-split-section`

### /invoices/[id]/edit
- Entry: `src/app/(dashboard)/invoices/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/invoices/[id]/edit/invoice-editor`

### /invoices/new
- Entry: `src/app/(dashboard)/invoices/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/invoices/new/invoice-form`
- Server actions:
  - `@/lib/actions/orders`: getOrder

### /invoices/recurring
- Entry: `src/app/(dashboard)/invoices/recurring/page.tsx`
- App components:
  - `@/app/(dashboard)/invoices/recurring/recurring-invoices-client`

### /leads
- Entry: `src/app/(dashboard)/leads/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/leads/leads-page-client`
- Server actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
  - `@/lib/actions/booking-forms`: getAllSubmissions
  - `@/lib/actions/chat-inquiries`: getChatInquiries
  - `@/lib/actions/portfolio-websites`: getPortfolioInquiries

### /licensing
- Entry: `src/app/(dashboard)/licensing/page.tsx`
- Components:
  - `@/components/dashboard`
- Server actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId

### /mini-sessions
- Entry: `src/app/(dashboard)/mini-sessions/page.tsx`
- Components:
  - `@/components/dashboard`
- Server actions:
  - `@/lib/actions/booking-forms`: getBookingForms

### /notifications
- Entry: `src/app/(dashboard)/notifications/page.tsx`
- App components:
  - `@/app/(dashboard)/notifications/notifications-page-client`
- Server actions:
  - `@/lib/actions/activity`: getActivityLogs
  - `@/lib/actions/notifications`: getNotifications

### /order-pages
- Entry: `src/app/(dashboard)/order-pages/page.tsx`
- Components:
  - `@/components/dashboard`
- Server actions:
  - `@/lib/actions/order-pages`: getOrderPages

### /order-pages/[id]
- Entry: `src/app/(dashboard)/order-pages/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/order-page-form`
- Server actions:
  - `@/lib/actions/order-pages`: getOrderPage

### /order-pages/new
- Entry: `src/app/(dashboard)/order-pages/new/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/order-page-form`

### /orders
- Entry: `src/app/(dashboard)/orders/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/orders/orders-table-client`
- Server actions:
  - `@/lib/actions/orders`: getOrderStats, getOrders

### /orders/[id]
- Entry: `src/app/(dashboard)/orders/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/orders/[id]/order-actions`
- Server actions:
  - `@/lib/actions/orders`: getOrder

### /orders/analytics
- Entry: `src/app/(dashboard)/orders/analytics/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/orders/analytics/sqft-analytics-client`
- Server actions:
  - `@/lib/actions/orders`: getOrderStats, getSqftAnalytics

### /payments
- Entry: `src/app/(dashboard)/payments/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/payments/bulk-pdf-button`
  - `@/app/(dashboard)/payments/export-button`
  - `@/app/(dashboard)/payments/payments-page-client`

### /payments/[id]
- Entry: `src/app/(dashboard)/payments/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/payments/[id]/payment-actions`
- Server actions:
  - `@/lib/actions/payments`: getPayment

### /portfolios
- Entry: `src/app/(dashboard)/portfolios/page.tsx`
- Components:
  - `@/components/dashboard`
- Server actions:
  - `@/lib/actions/portfolio-websites`: getPortfolioWebsites

### /portfolios/[id]
- Entry: `src/app/(dashboard)/portfolios/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/portfolios/[id]/portfolio-editor-client`
- Server actions:
  - `@/lib/actions/portfolio-websites`: getPortfolioAnalytics, getPortfolioWebsite

### /portfolios/new
- Entry: `src/app/(dashboard)/portfolios/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/portfolios/new/new-portfolio-client`

### /products
- Entry: `src/app/(dashboard)/products/page.tsx`
- App components:
  - `@/app/(dashboard)/products/products-client`
- Server actions:
  - `@/lib/actions/products`: listProductCatalogs

### /products/[catalogId]
- Entry: `src/app/(dashboard)/products/[catalogId]/page.tsx`
- App components:
  - `@/app/(dashboard)/products/[catalogId]/catalog-client`
- Server actions:
  - `@/lib/actions/products`: getProductCatalog

### /projects
- Entry: `src/app/(dashboard)/projects/page.tsx`
- App components:
  - `@/app/(dashboard)/projects/projects-client`
- Server actions:
  - `@/lib/actions/clients`: getClients
  - `@/lib/actions/galleries`: getGalleries
  - `@/lib/actions/projects`: getBoard, getOrCreateDefaultBoard
  - `@/lib/actions/settings`: getTeamMembers

### /projects/analytics
- Entry: `src/app/(dashboard)/projects/analytics/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/projects/analytics/projects-analytics-client`
- Server actions:
  - `@/lib/actions/projects`: getTaskAnalytics

### /projects/tasks/[id]
- Entry: `src/app/(dashboard)/projects/tasks/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/projects/tasks/[id]/task-detail-client`
- Server actions:
  - `@/lib/actions/clients`: getClients
  - `@/lib/actions/galleries`: getGalleries
  - `@/lib/actions/projects`: getTask
  - `@/lib/actions/settings`: getTeamMembers

### /properties
- Entry: `src/app/(dashboard)/properties/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/properties/analytics-view-client`
  - `@/app/(dashboard)/properties/leads-view-client`
  - `@/app/(dashboard)/properties/properties-page-client`
- Server actions:
  - `@/lib/actions/property-websites`

### /properties/[id]
- Entry: `src/app/(dashboard)/properties/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/properties/[id]/property-detail-client`
- Server actions:
  - `@/lib/actions/property-websites`: getPropertyAnalytics, getPropertyLeads, getPropertyWebsiteById

### /properties/[id]/edit
- Entry: `src/app/(dashboard)/properties/[id]/edit/page.tsx`
- App components:
  - `@/app/(dashboard)/properties/[id]/edit/property-edit-form`
- Server actions:
  - `@/lib/actions/property-websites`: getPropertyWebsiteById

### /properties/new
- Entry: `src/app/(dashboard)/properties/new/page.tsx`
- App components:
  - `@/app/(dashboard)/properties/new/new-property-website-client`
- Server actions:
  - `@/lib/actions/property-websites`: getProjectsWithoutPropertyWebsite

### /questionnaires
- Entry: `src/app/(dashboard)/questionnaires/page.tsx`
- App components:
  - `@/app/(dashboard)/questionnaires/questionnaires-page-client`
- Server actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
  - `@/lib/actions/client-questionnaires`: getClientQuestionnaires, getQuestionnaireStats
  - `@/lib/actions/clients`: getClients
  - `@/lib/actions/questionnaire-templates`: getQuestionnaireTemplates, getTemplatesByIndustry

### /questionnaires/assigned/[id]
- Entry: `src/app/(dashboard)/questionnaires/assigned/[id]/page.tsx`
- App components:
  - `@/app/(dashboard)/questionnaires/assigned/[id]/response-viewer`
- Server actions:
  - `@/lib/actions/client-questionnaires`: getClientQuestionnaire

### /questionnaires/templates/[id]
- Entry: `src/app/(dashboard)/questionnaires/templates/[id]/page.tsx`
- App components:
  - `@/app/(dashboard)/questionnaires/templates/[id]/template-editor-client`
- Server actions:
  - `@/lib/actions/questionnaire-templates`: getQuestionnaireTemplate

### /questionnaires/templates/[id]/preview
- Entry: `src/app/(dashboard)/questionnaires/templates/[id]/preview/page.tsx`
- App components:
  - `@/app/(dashboard)/questionnaires/templates/[id]/preview/preview-client`
- Server actions:
  - `@/lib/actions/questionnaire-templates`: getQuestionnaireTemplate

### /questionnaires/templates/new
- Entry: `src/app/(dashboard)/questionnaires/templates/new/page.tsx`
- Server actions:
  - `@/lib/actions/questionnaire-templates`

### /scheduling
- Entry: `src/app/(dashboard)/scheduling/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/scheduling-page-client`
- Server actions:
  - `@/lib/actions/availability`: getPendingTimeOffCount

### /scheduling/[id]
- Entry: `src/app/(dashboard)/scheduling/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/service-selector`
- App components:
  - `@/app/(dashboard)/scheduling/[id]/booking-actions`
  - `@/app/(dashboard)/scheduling/[id]/booking-delete-action`
  - `@/app/(dashboard)/scheduling/[id]/booking-project-action`
- Server actions:
  - `@/lib/actions/bookings`: getBooking, updateBookingStatus

### /scheduling/[id]/edit
- Entry: `src/app/(dashboard)/scheduling/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/scheduling/[id]/edit/booking-edit-form`
- Server actions:
  - `@/lib/actions/bookings`: getBooking, getClientsForBooking, updateBookingStatus

### /scheduling/availability
- Entry: `src/app/(dashboard)/scheduling/availability/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/availability/availability-page-client`

### /scheduling/booking-forms
- Entry: `src/app/(dashboard)/scheduling/booking-forms/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/booking-forms/booking-forms-page-client`
- Server actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
  - `@/lib/actions/booking-forms`: getBookingForms
  - `@/lib/actions/services`: getServices

### /scheduling/booking-forms/[id]
- Entry: `src/app/(dashboard)/scheduling/booking-forms/[id]/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/booking-forms/[id]/booking-form-edit-client`
- Server actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
  - `@/lib/actions/booking-forms`: getBookingForm
  - `@/lib/actions/services`: getServices

### /scheduling/booking-forms/[id]/submissions
- Entry: `src/app/(dashboard)/scheduling/booking-forms/[id]/submissions/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/booking-forms/[id]/submissions/submissions-page-client`
- Server actions:
  - `@/lib/actions/booking-forms`: getBookingForm, getFormSubmissions

### /scheduling/new
- Entry: `src/app/(dashboard)/scheduling/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/scheduling/new/booking-new-form`
- Server actions:
  - `@/lib/actions/bookings`: getClientsForBooking, getScheduleStats, getServicesForBooking
  - `@/lib/actions/orders`: getOrder

### /scheduling/time-off
- Entry: `src/app/(dashboard)/scheduling/time-off/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/time-off/time-off-page-client`
- Server actions:
  - `@/lib/actions/availability`: getPendingTimeOffRequests, getTimeOffRequests

### /scheduling/types
- Entry: `src/app/(dashboard)/scheduling/types/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/scheduling/types/booking-types-client`
- Server actions:
  - `@/lib/actions/booking-types`: getBookingTypes, seedDefaultBookingTypes

### /services
- Entry: `src/app/(dashboard)/services/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/services/services-page-client`
- Server actions:
  - `@/lib/actions/services`: getServices, seedDefaultServices

### /services/[id]
- Entry: `src/app/(dashboard)/services/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/service-form`
  - `@/components/dashboard/service-quick-actions`
- Server actions:
  - `@/lib/actions/services`: getService

### /services/addons
- Entry: `src/app/(dashboard)/services/addons/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/addon-list`
- Server actions:
  - `@/lib/actions/addons`: getAddons

### /services/addons/[id]
- Entry: `src/app/(dashboard)/services/addons/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/addon-form`
- Server actions:
  - `@/lib/actions/addons`: getAddon

### /services/addons/new
- Entry: `src/app/(dashboard)/services/addons/new/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/addon-form`

### /services/bundles
- Entry: `src/app/(dashboard)/services/bundles/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/bundle-list`
- Server actions:
  - `@/lib/actions/bundles`: getBundles

### /services/bundles/[id]
- Entry: `src/app/(dashboard)/services/bundles/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/bundle-form`
- Server actions:
  - `@/lib/actions/bundles`: getBundle

### /services/bundles/new
- Entry: `src/app/(dashboard)/services/bundles/new/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/bundle-form`

### /services/new
- Entry: `src/app/(dashboard)/services/new/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/service-form`

### /settings
- Entry: `src/app/(dashboard)/settings/page.tsx`
- Local layout: `src/app/(dashboard)/settings/layout.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/settings-page-client`

### /settings/appearance
- Entry: `src/app/(dashboard)/settings/appearance/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/appearance/appearance-settings-form`
- Server actions:
  - `@/lib/actions/appearance`: getAppearancePreferences

### /settings/billing
- Entry: `src/app/(dashboard)/settings/billing/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
- Server actions:
  - `@/lib/actions/settings`: getBillingStats, getInvoiceHistory

### /settings/billing/upgrade
- Entry: `src/app/(dashboard)/settings/billing/upgrade/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/billing/upgrade/upgrade-form`

### /settings/branding
- Entry: `src/app/(dashboard)/settings/branding/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/branding/branding-settings-form`
- Server actions:
  - `@/lib/actions/settings`: getOrganizationSettings

### /settings/calendar
- Entry: `src/app/(dashboard)/settings/calendar/page.tsx`
- App components:
  - `@/app/(dashboard)/settings/calendar/calendar-settings-client`
- Server actions:
  - `@/lib/actions/google-calendar`: getGoogleCalendarConfig

### /settings/calendly
- Entry: `src/app/(dashboard)/settings/calendly/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/calendly/calendly-settings-client`

### /settings/developer
- Entry: `src/app/(dashboard)/settings/developer/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/developer/seed-buttons`
  - `@/app/(dashboard)/settings/developer/stripe-products`
  - `@/app/(dashboard)/settings/developer/subscription-plans`
- Server actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
  - `@/lib/actions/subscription-plans`

### /settings/dropbox
- Entry: `src/app/(dashboard)/settings/dropbox/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/dropbox/dropbox-settings-client`
- Server actions:
  - `@/lib/actions/dropbox`: getDropboxConfig

### /settings/email
- Entry: `src/app/(dashboard)/settings/email/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/input`
  - `@/components/ui/select`
  - `@/components/ui/settings-icons`
  - `@/components/ui/switch`
  - `@/components/ui/toast`
- Server actions:
  - `@/lib/actions/email-accounts`
  - `@/lib/actions/email-settings`
- API references:
  - `/api/integrations/gmail/authorize`

### /settings/email-logs
- Entry: `src/app/(dashboard)/settings/email-logs/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/checkbox`
  - `@/components/ui/settings-icons`
  - `@/components/ui/toast`
- Server actions:
  - `@/lib/actions/email-logs`

### /settings/equipment
- Entry: `src/app/(dashboard)/settings/equipment/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
- App components:
  - `@/app/(dashboard)/settings/equipment/equipment-list`
- Server actions:
  - `@/lib/actions/equipment`: getEquipmentByCategory

### /settings/features
- Entry: `src/app/(dashboard)/settings/features/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/features/features-settings-form`

### /settings/gallery-addons
- Entry: `src/app/(dashboard)/settings/gallery-addons/page.tsx`
- Components:
  - `@/components/gallery/addon-catalog-manager`

### /settings/gallery-templates
- Entry: `src/app/(dashboard)/settings/gallery-templates/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/gallery-templates/gallery-templates-client`
- Server actions:
  - `@/lib/actions/gallery-templates`: getGalleryTemplates
  - `@/lib/actions/services`: getServices

### /settings/integrations
- Entry: `src/app/(dashboard)/settings/integrations/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/integrations/integrations-client`

### /settings/mailchimp
- Entry: `src/app/(dashboard)/settings/mailchimp/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/mailchimp/mailchimp-settings-client`

### /settings/my-referrals
- Entry: `src/app/(dashboard)/settings/my-referrals/page.tsx`
- App components:
  - `@/app/(dashboard)/settings/my-referrals/my-referrals-client`
- Server actions:
  - `@/lib/actions/platform-referrals`

### /settings/notifications
- Entry: `src/app/(dashboard)/settings/notifications/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/select`
  - `@/components/ui/settings-icons`
  - `@/components/ui/switch`
  - `@/components/ui/toast`
- Server actions:
  - `@/lib/actions/notification-preferences`

### /settings/payments
- Entry: `src/app/(dashboard)/settings/payments/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/payments/payments-settings-client`
- Server actions:
  - `@/lib/actions/settings`: getCurrencySettings, getTaxSettings
  - `@/lib/actions/stripe-connect`: getConnectAccountDetails

### /settings/payouts
- Entry: `src/app/(dashboard)/settings/payouts/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/payouts/payouts-page-client`
- Server actions:
  - `@/lib/actions/payouts`: getPayoutBatches, getPayoutStats, getPendingPayouts

### /settings/photographer-pay
- Entry: `src/app/(dashboard)/settings/photographer-pay/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
- App components:
  - `@/app/(dashboard)/settings/photographer-pay/photographer-pay-client`
- Server actions:
  - `@/lib/actions/photographer-pay`: getEarningStats, getPhotographerRates
  - `@/lib/actions/services`: getServices
  - `@/lib/actions/settings`: getTeamMembers

### /settings/profile
- Entry: `src/app/(dashboard)/settings/profile/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/profile/profile-settings-form`
- Server actions:
  - `@/lib/actions/settings`: getBillingStats, getCurrentUser

### /settings/quickbooks
- Entry: `src/app/(dashboard)/settings/quickbooks/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/quickbooks/quickbooks-settings-client`

### /settings/referrals
- Entry: `src/app/(dashboard)/settings/referrals/page.tsx`
- App components:
  - `@/app/(dashboard)/settings/referrals/referrals-client`
- Server actions:
  - `@/lib/actions/clients`: getClients
  - `@/lib/actions/referrals`

### /settings/slack
- Entry: `src/app/(dashboard)/settings/slack/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/slack/slack-settings-client`
- Server actions:
  - `@/lib/actions/slack`: getSlackConfig

### /settings/sms
- Entry: `src/app/(dashboard)/settings/sms/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
- App components:
  - `@/app/(dashboard)/settings/sms/sms-settings-client`
- Server actions:
  - `@/lib/actions/sms`: getSMSLogs, getSMSSettings, getSMSStats, getSMSTemplates

### /settings/sms/templates
- Entry: `src/app/(dashboard)/settings/sms/templates/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/sms/templates/sms-templates-client`
- Server actions:
  - `@/lib/actions/sms`: getSMSTemplates

### /settings/team
- Entry: `src/app/(dashboard)/settings/team/page.tsx`
- App components:
  - `@/app/(dashboard)/settings/team/team-page-client`
- Server actions:
  - `@/lib/actions/invitations`: getPendingInvitations
  - `@/lib/actions/settings`: getBillingStats, getTeamMembers

### /settings/team/[id]/capabilities
- Entry: `src/app/(dashboard)/settings/team/[id]/capabilities/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/team/[id]/capabilities/capabilities-form`
- Server actions:
  - `@/lib/actions/equipment`: getEquipmentList, getUserEquipment
  - `@/lib/actions/team-capabilities`: getUserServiceCapabilities

### /settings/territories
- Entry: `src/app/(dashboard)/settings/territories/page.tsx`
- App components:
  - `@/app/(dashboard)/settings/territories/territories-client`
- Server actions:
  - `@/lib/actions/services`: getServices
  - `@/lib/actions/territories`: getTerritories

### /settings/travel
- Entry: `src/app/(dashboard)/settings/travel/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/travel/travel-settings-form`
- Server actions:
  - `@/lib/actions/settings`: getOrganizationSettings

### /settings/watermarks
- Entry: `src/app/(dashboard)/settings/watermarks/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/watermarks/watermark-templates-client`
- Server actions:
  - `@/lib/actions/watermark-templates`: listWatermarkTemplates

### /settings/zapier
- Entry: `src/app/(dashboard)/settings/zapier/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/zapier/zapier-settings-client`
- Server actions:
  - `@/lib/actions/api-keys`: getApiKeys

### /field
- Entry: `src/app/(field)/field/page.tsx`
- App components:
  - `@/app/(field)/field/field-schedule-client`
- Server actions:
  - `@/lib/actions/field-operations`: getTodaysBookings, getUpcomingBookings

### /field/check-in
- Entry: `src/app/(field)/field/check-in/page.tsx`
- App components:
  - `@/app/(field)/field/check-in/check-in-client`
- Server actions:
  - `@/lib/actions/field-operations`: getTodaysBookings

### /about
- Entry: `src/app/(marketing)/about/page.tsx`

### /affiliates
- Entry: `src/app/(marketing)/affiliates/page.tsx`

### /blog
- Entry: `src/app/(marketing)/blog/page.tsx`
- App components:
  - `@/app/(marketing)/blog/newsletter-form`

### /blog/[slug]
- Entry: `src/app/(marketing)/blog/[slug]/page.tsx`

### /careers
- Entry: `src/app/(marketing)/careers/page.tsx`

### /changelog
- Entry: `src/app/(marketing)/changelog/page.tsx`

### /contact
- Entry: `src/app/(marketing)/contact/page.tsx`
- App components:
  - `@/app/(marketing)/contact/contact-form`

### /features/analytics
- Entry: `src/app/(marketing)/features/analytics/page.tsx`

### /features/automation
- Entry: `src/app/(marketing)/features/automation/page.tsx`

### /features/clients
- Entry: `src/app/(marketing)/features/clients/page.tsx`

### /features/contracts
- Entry: `src/app/(marketing)/features/contracts/page.tsx`

### /features/galleries
- Entry: `src/app/(marketing)/features/galleries/page.tsx`

### /features/payments
- Entry: `src/app/(marketing)/features/payments/page.tsx`

### /guides
- Entry: `src/app/(marketing)/guides/page.tsx`

### /help
- Entry: `src/app/(marketing)/help/page.tsx`

### /help/[category]/[article]
- Entry: `src/app/(marketing)/help/[category]/[article]/page.tsx`

### /industries/architecture
- Entry: `src/app/(marketing)/industries/architecture/page.tsx`

### /industries/commercial
- Entry: `src/app/(marketing)/industries/commercial/page.tsx`

### /industries/events
- Entry: `src/app/(marketing)/industries/events/page.tsx`

### /industries/food
- Entry: `src/app/(marketing)/industries/food/page.tsx`

### /industries/portraits
- Entry: `src/app/(marketing)/industries/portraits/page.tsx`

### /industries/real-estate
- Entry: `src/app/(marketing)/industries/real-estate/page.tsx`

### /integrations
- Entry: `src/app/(marketing)/integrations/page.tsx`

### /legal/cookies
- Entry: `src/app/(marketing)/legal/cookies/page.tsx`

### /legal/dpa
- Entry: `src/app/(marketing)/legal/dpa/page.tsx`

### /legal/privacy
- Entry: `src/app/(marketing)/legal/privacy/page.tsx`

### /legal/security
- Entry: `src/app/(marketing)/legal/security/page.tsx`

### /legal/terms
- Entry: `src/app/(marketing)/legal/terms/page.tsx`

### /partners
- Entry: `src/app/(marketing)/partners/page.tsx`

### /press
- Entry: `src/app/(marketing)/press/page.tsx`

### /pricing
- Entry: `src/app/(marketing)/pricing/page.tsx`

### /roadmap
- Entry: `src/app/(marketing)/roadmap/page.tsx`

### /webinars
- Entry: `src/app/(marketing)/webinars/page.tsx`

### /webinars/[slug]
- Entry: `src/app/(marketing)/webinars/[slug]/page.tsx`

### /onboarding
- Entry: `src/app/(onboarding)/onboarding/page.tsx`
- Components:
  - `@/components/onboarding/onboarding-wizard`

### /
- Entry: `src/app/page.tsx`
- Local layout: `src/app/layout.tsx`
- Components:
  - `@/components/layout/footer`
  - `@/components/layout/navbar`
  - `@/components/sections/lazy-section`

### /_custom-domain
- Entry: `src/app/_custom-domain/page.tsx`
- App components:
  - `@/app/portfolio/[slug]/expired-notice`
  - `@/app/portfolio/[slug]/password-gate`
  - `@/app/portfolio/[slug]/portfolio-renderer`
- Server actions:
  - `@/lib/actions/portfolio-websites`: getPortfolioByCustomDomain, getPortfolioWebsiteBySlug

### /book/[slug]
- Entry: `src/app/book/[slug]/page.tsx`
- App components:
  - `@/app/book/[slug]/booking-form-public`
- Server actions:
  - `@/lib/actions/booking-forms`: getBookingFormBySlug

### /book/[slug]/confirmation
- Entry: `src/app/book/[slug]/confirmation/page.tsx`

### /g/[slug]
- Entry: `src/app/g/[slug]/page.tsx`
- App components:
  - `@/app/g/[slug]/gallery-client`
  - `@/app/g/[slug]/password-gate`
  - `@/app/g/[slug]/pay-button`
- Server actions:
  - `@/lib/actions/galleries`: getPublicGallery, recordGalleryView

### /invite/[token]
- Entry: `src/app/invite/[token]/page.tsx`
- App components:
  - `@/app/invite/[token]/invite-accept-client`
- Server actions:
  - `@/lib/actions/invitations`: getInvitationByToken

### /order/[slug]
- Entry: `src/app/order/[slug]/page.tsx`
- App components:
  - `@/app/order/[slug]/order-page-client`
- Server actions:
  - `@/lib/actions/client-auth`: getClientSession
  - `@/lib/actions/order-pages`: getOrderPageBySlug

### /order/[slug]/confirmation
- Entry: `src/app/order/[slug]/confirmation/page.tsx`
- App components:
  - `@/app/order/[slug]/confirmation/order-confirmation-client`
- Server actions:
  - `@/lib/actions/order-pages`: getOrderPageBySlug

### /p/[slug]
- Entry: `src/app/p/[slug]/page.tsx`
- App components:
  - `@/app/p/[slug]/property-inquiry-form`
  - `@/app/p/[slug]/property-share-buttons`
- Server actions:
  - `@/lib/actions/property-websites`: getPropertyWebsiteBySlug

### /pay/[id]
- Entry: `src/app/pay/[id]/page.tsx`
- App components:
  - `@/app/pay/[id]/pay-client`

### /portfolio/[slug]
- Entry: `src/app/portfolio/[slug]/page.tsx`
- App components:
  - `@/app/portfolio/[slug]/expired-notice`
  - `@/app/portfolio/[slug]/lead-gate`
  - `@/app/portfolio/[slug]/password-gate`
  - `@/app/portfolio/[slug]/portfolio-renderer`
- Server actions:
  - `@/lib/actions/portfolio-websites`: getPortfolioWebsiteBySlug

### /r/[code]
- Entry: `src/app/r/[code]/page.tsx`

### /schedule
- Entry: `src/app/schedule/page.tsx`

### /sign/[token]
- Entry: `src/app/sign/[token]/page.tsx`
- Components:
  - `@/components/ui/checkbox`
- Server actions:
  - `@/lib/actions/contract-signing`: getContractForSigning, signContract

### /sign/[token]/complete
- Entry: `src/app/sign/[token]/complete/page.tsx`
- Server actions:
  - `@/lib/actions/contract-signing`: getSigningCompletion

### /track
- Entry: `src/app/track/page.tsx`

### /unsubscribe
- Entry: `src/app/unsubscribe/page.tsx`
- Components:
  - `@/components/ui/switch`
- API references:
  - `/api/unsubscribe`
  - `/api/unsubscribe?token=${token}`

## Route-to-Data Flow Atlas
- Each route lists direct UI dependencies and inferred data flows (actions, models, external services, emails, webhooks).
- This is derived from direct `page.tsx` imports and action file heuristics.

### /sign-in/[[...sign-in]]
- Entry: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`

### /sign-up/[[...sign-up]]
- Entry: `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- Actions:
  - `@/lib/actions/platform-referrals`: trackReferralClick
- Models: notification, organizationMember, platformReferral, platformReferralReward, platformReferralSettings, platformReferrer, user
- External services: clerk

### /signup
- Entry: `src/app/(auth)/signup/page.tsx`

### /portal
- Entry: `src/app/(client-portal)/portal/page.tsx`
- App components:
  - `@/app/(client-portal)/portal/portal-client`
- Actions:
  - `@/lib/actions/client-portal`: getClientPortalData
- Models: client, clientQuestionnaire, invoice, project, propertyWebsite

### /portal/login
- Entry: `src/app/(client-portal)/portal/login/page.tsx`
- Actions:
  - `@/lib/actions/client-auth`: sendClientMagicLink
- Models: client, clientSession
- External services: resend
- Email templates:
  - `@/emails/client-magic-link`

### /portal/questionnaires/[id]
- Entry: `src/app/(client-portal)/portal/questionnaires/[id]/page.tsx`
- App components:
  - `@/app/(client-portal)/portal/questionnaires/[id]/questionnaire-form`
- Actions:
  - `@/lib/actions/questionnaire-portal`: getQuestionnaireForCompletion
- Models: booking, client, clientQuestionnaire, clientQuestionnaireAgreement, clientSession, organization

### /analytics
- Entry: `src/app/(dashboard)/analytics/page.tsx`
- Components:
  - `@/components/ui/skeleton`
- App components:
  - `@/app/(dashboard)/analytics/analytics-dashboard-client`
- Actions:
  - `@/lib/actions/analytics`: getClientLTVMetrics, getDashboardAnalytics, getRevenueForecast
- Models: client, invoice, organization, payment, project
- External services: clerk

### /batch
- Entry: `src/app/(dashboard)/batch/page.tsx`
- Components:
  - `@/components/dashboard`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
- External services: clerk

### /billing/analytics
- Entry: `src/app/(dashboard)/billing/analytics/page.tsx`
- Components:
  - `@/components/dashboard`

### /billing/credit-notes/[id]
- Entry: `src/app/(dashboard)/billing/credit-notes/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/credit-notes/[id]/credit-note-actions`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
- External services: clerk

### /billing/credit-notes/new
- Entry: `src/app/(dashboard)/billing/credit-notes/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/credit-notes/new/credit-note-form`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
- External services: clerk

### /billing/estimates/[id]
- Entry: `src/app/(dashboard)/billing/estimates/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/estimates/[id]/estimate-actions`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
- External services: clerk

### /billing/estimates/[id]/edit
- Entry: `src/app/(dashboard)/billing/estimates/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/estimates/[id]/edit/edit-estimate-form`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
- External services: clerk

### /billing/estimates/new
- Entry: `src/app/(dashboard)/billing/estimates/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/estimates/new/estimate-form`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
- External services: clerk

### /billing/reports
- Entry: `src/app/(dashboard)/billing/reports/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/reports/export-buttons`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
- External services: clerk

### /billing/retainers
- Entry: `src/app/(dashboard)/billing/retainers/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/retainers/retainers-page-client`

### /billing/retainers/[id]
- Entry: `src/app/(dashboard)/billing/retainers/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/billing/retainers/[id]/retainer-actions`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
- External services: clerk

### /booking
- Entry: `src/app/(dashboard)/booking/page.tsx`
- Components:
  - `@/components/dashboard`
- Actions:
  - `@/lib/actions/booking-forms`: getBookingForms
- Models: booking, bookingForm, bookingFormField, bookingFormService, bookingFormSubmission, client, organization, service

### /brokerages
- Entry: `src/app/(dashboard)/brokerages/page.tsx`
- Components:
  - `@/components/dashboard`
- Actions:
  - `@/lib/actions/brokerages`: getBrokerages
- Models: brokerage, client

### /brokerages/[id]
- Entry: `src/app/(dashboard)/brokerages/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/brokerages/[id]/brokerage-contracts-section`
- Actions:
  - `@/lib/actions/brokerage-contracts`: getBrokerageContracts
  - `@/lib/actions/brokerages`: getBrokerage, getBrokerageAgents
- Models: brokerage, brokerageContract, client

### /brokerages/[id]/edit
- Entry: `src/app/(dashboard)/brokerages/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/brokerages/brokerage-form`
- Actions:
  - `@/lib/actions/brokerages`: getBrokerage
- Models: brokerage, client

### /brokerages/new
- Entry: `src/app/(dashboard)/brokerages/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/brokerages/brokerage-form`

### /clients
- Entry: `src/app/(dashboard)/clients/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/clients/clients-page-client`
  - `@/app/(dashboard)/clients/tags-management-client`
- Actions:
  - `@/lib/actions/client-tags`: getClientTags
- Models: client, clientTag, clientTagAssignment

### /clients/[id]
- Entry: `src/app/(dashboard)/clients/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/clients/[id]/client-actions`
  - `@/app/(dashboard)/clients/[id]/client-activity-timeline`
  - `@/app/(dashboard)/clients/[id]/client-email-preferences`
- Actions:
  - `@/lib/actions/email-logs`: getClientEmailHealth, getClientEmailLogs
- Models: booking, clientQuestionnaire, clientQuestionnaireAgreement, clientQuestionnaireResponse, contract, emailLog, order, organization, project
- External services: clerk, resend

### /clients/[id]/edit
- Entry: `src/app/(dashboard)/clients/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/clients/[id]/edit/client-edit-form`
- Actions:
  - `@/lib/actions/clients`: deleteClient, getClient, updateClient
- Models: activityLog, client, clientSession, clientTag, payment

### /clients/import
- Entry: `src/app/(dashboard)/clients/import/page.tsx`
- App components:
  - `@/app/(dashboard)/clients/import/client-import-client`

### /clients/merge
- Entry: `src/app/(dashboard)/clients/merge/page.tsx`
- App components:
  - `@/app/(dashboard)/clients/merge/client-merge-client`

### /clients/new
- Entry: `src/app/(dashboard)/clients/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/clients/new/client-new-form`

### /contracts
- Entry: `src/app/(dashboard)/contracts/page.tsx`
- App components:
  - `@/app/(dashboard)/contracts/contracts-page-client`

### /contracts/[id]
- Entry: `src/app/(dashboard)/contracts/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/contracts/[id]/contract-download-button`
- Actions:
  - `@/lib/actions/contract-signing`: cancelContract
  - `@/lib/actions/contracts`: deleteContract, getContract, sendContract
- Models: activityLog, contract, contractAuditLog, contractSignature, contractSigner, organization
- External services: resend

### /contracts/[id]/edit
- Entry: `src/app/(dashboard)/contracts/[id]/edit/page.tsx`
- App components:
  - `@/app/(dashboard)/contracts/[id]/edit/contract-edit-client`
- Actions:
  - `@/lib/actions/contracts`: getContract
- Models: activityLog, contract, contractAuditLog, contractSignature, contractSigner, organization

### /contracts/new
- Entry: `src/app/(dashboard)/contracts/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/contracts/new/contract-form-client`

### /contracts/templates
- Entry: `src/app/(dashboard)/contracts/templates/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/contracts/templates/templates-list-client`
- Actions:
  - `@/lib/actions/contract-templates`: getContractTemplates, seedDefaultContractTemplates
- Models: contract

### /contracts/templates/[id]
- Entry: `src/app/(dashboard)/contracts/templates/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/contracts/templates/template-form-client`
- Actions:
  - `@/lib/actions/contract-templates`: getContractTemplates
- Models: contract

### /contracts/templates/new
- Entry: `src/app/(dashboard)/contracts/templates/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/contracts/templates/template-form-client`

### /create
- Entry: `src/app/(dashboard)/create/page.tsx`
- App components:
  - `@/app/(dashboard)/create/create-wizard-client`
- Actions:
  - `@/lib/actions/create-wizard`: getWizardData
- Models: bookingType, client, location, service
- External services: clerk

### /dashboard
- Entry: `src/app/(dashboard)/dashboard/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/dashboard-calendar`
  - `@/components/dashboard/expiring-galleries-widget`
  - `@/components/dashboard/gallery-card`
  - `@/components/tour`
- Actions:
  - `@/lib/actions/dashboard`: getDashboardConfig
  - `@/lib/actions/gallery-expiration`: getExpiringSoonGalleries
  - `@/lib/actions/invoices`: getOverdueInvoicesForDashboard
- Models: booking, client, expirationNotification, invoice, invoiceLineItem, organization, project, user
- External services: clerk, resend, stripe
- Email templates:
  - `@/emails/invoice-reminder`

### /feedback
- Entry: `src/app/(dashboard)/feedback/page.tsx`
- App components:
  - `@/app/(dashboard)/feedback/feedback-inbox-client`

### /forms
- Entry: `src/app/(dashboard)/forms/page.tsx`
- App components:
  - `@/app/(dashboard)/forms/forms-page-client`
- Actions:
  - `@/lib/actions/custom-forms`: getForms
- Models: customForm, customFormField, formSubmission, organization

### /forms/[id]
- Entry: `src/app/(dashboard)/forms/[id]/page.tsx`
- App components:
  - `@/app/(dashboard)/forms/[id]/form-editor-client`
- Actions:
  - `@/lib/actions/custom-forms`: getForm
- Models: customForm, customFormField, formSubmission, organization

### /galleries
- Entry: `src/app/(dashboard)/galleries/page.tsx`
- App components:
  - `@/app/(dashboard)/galleries/galleries-page-client`
- Actions:
  - `@/lib/actions/galleries`: getGalleryCounts
- Models: activityLog, asset, deliveryLink, galleryComment, galleryFavorite, organization, project
- External services: r2

### /galleries/[id]
- Entry: `src/app/(dashboard)/galleries/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/galleries/[id]/gallery-actions`
  - `@/app/(dashboard)/galleries/[id]/gallery-detail-client`
- Actions:
  - `@/lib/actions/download-tracking`: getGalleryDownloadAnalytics
  - `@/lib/actions/galleries`: deliverGallery, getGallery
  - `@/lib/actions/invoices`: getClientInvoices
- Models: activityLog, asset, booking, client, deliveryLink, downloadLog, galleryComment, galleryFavorite, invoice, invoiceLineItem, organization, photoRating, project
- External services: clerk, r2, resend, stripe
- Email templates:
  - `@/emails/invoice-reminder`

### /galleries/[id]/edit
- Entry: `src/app/(dashboard)/galleries/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/service-selector`
- App components:
  - `@/app/(dashboard)/galleries/[id]/edit/gallery-edit-form`
- Actions:
  - `@/lib/actions/galleries`: getGallery
- Models: activityLog, asset, deliveryLink, galleryComment, galleryFavorite, organization, project
- External services: r2

### /galleries/new
- Entry: `src/app/(dashboard)/galleries/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/galleries/new/gallery-new-form`
- Actions:
  - `@/lib/actions/gallery-templates`: getGalleryTemplates
- Models: galleryTemplate, organization
- External services: clerk

### /galleries/services
- Entry: `src/app/(dashboard)/galleries/services/page.tsx`

### /galleries/services/[id]
- Entry: `src/app/(dashboard)/galleries/services/[id]/page.tsx`

### /galleries/services/new
- Entry: `src/app/(dashboard)/galleries/services/new/page.tsx`

### /inbox
- Entry: `src/app/(dashboard)/inbox/page.tsx`
- App components:
  - `@/app/(dashboard)/inbox/inbox-page-client`

### /invoices
- Entry: `src/app/(dashboard)/invoices/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/invoices/bulk-export-button`
- App components:
  - `@/app/(dashboard)/invoices/invoices-page-client`

### /invoices/[id]
- Entry: `src/app/(dashboard)/invoices/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/invoices/[id]/invoice-actions`
  - `@/app/(dashboard)/invoices/[id]/invoice-split-section`

### /invoices/[id]/edit
- Entry: `src/app/(dashboard)/invoices/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/invoices/[id]/edit/invoice-editor`

### /invoices/new
- Entry: `src/app/(dashboard)/invoices/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/invoices/new/invoice-form`
- Actions:
  - `@/lib/actions/orders`: getOrder
- Models: order, orderItem, orderPage, service, serviceBundle
- External services: stripe

### /invoices/recurring
- Entry: `src/app/(dashboard)/invoices/recurring/page.tsx`
- App components:
  - `@/app/(dashboard)/invoices/recurring/recurring-invoices-client`

### /leads
- Entry: `src/app/(dashboard)/leads/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/leads/leads-page-client`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
  - `@/lib/actions/booking-forms`: getAllSubmissions
  - `@/lib/actions/chat-inquiries`: getChatInquiries
  - `@/lib/actions/portfolio-websites`: getPortfolioInquiries
- Models: activityLog, booking, bookingForm, bookingFormField, bookingFormService, bookingFormSubmission, client, organization, portfolioInquiry, portfolioWebsite, portfolioWebsiteProject, portfolioWebsiteSection, portfolioWebsiteView, project, service, websiteChatInquiry
- External services: clerk

### /licensing
- Entry: `src/app/(dashboard)/licensing/page.tsx`
- Components:
  - `@/components/dashboard`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
- External services: clerk

### /mini-sessions
- Entry: `src/app/(dashboard)/mini-sessions/page.tsx`
- Components:
  - `@/components/dashboard`
- Actions:
  - `@/lib/actions/booking-forms`: getBookingForms
- Models: booking, bookingForm, bookingFormField, bookingFormService, bookingFormSubmission, client, organization, service

### /notifications
- Entry: `src/app/(dashboard)/notifications/page.tsx`
- App components:
  - `@/app/(dashboard)/notifications/notifications-page-client`
- Actions:
  - `@/lib/actions/activity`: getActivityLogs
  - `@/lib/actions/notifications`: getNotifications
- Models: activityLog, notification, user

### /order-pages
- Entry: `src/app/(dashboard)/order-pages/page.tsx`
- Components:
  - `@/components/dashboard`
- Actions:
  - `@/lib/actions/order-pages`: getOrderPages
- Models: orderPage, orderPageBundle, orderPageService, service, serviceBundle

### /order-pages/[id]
- Entry: `src/app/(dashboard)/order-pages/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/order-page-form`
- Actions:
  - `@/lib/actions/order-pages`: getOrderPage
- Models: orderPage, orderPageBundle, orderPageService, service, serviceBundle

### /order-pages/new
- Entry: `src/app/(dashboard)/order-pages/new/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/order-page-form`

### /orders
- Entry: `src/app/(dashboard)/orders/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/orders/orders-table-client`
- Actions:
  - `@/lib/actions/orders`: getOrderStats, getOrders
- Models: order, orderItem, orderPage, service, serviceBundle
- External services: stripe

### /orders/[id]
- Entry: `src/app/(dashboard)/orders/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/orders/[id]/order-actions`
- Actions:
  - `@/lib/actions/orders`: getOrder
- Models: order, orderItem, orderPage, service, serviceBundle
- External services: stripe

### /orders/analytics
- Entry: `src/app/(dashboard)/orders/analytics/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/orders/analytics/sqft-analytics-client`
- Actions:
  - `@/lib/actions/orders`: getOrderStats, getSqftAnalytics
- Models: order, orderItem, orderPage, service, serviceBundle
- External services: stripe

### /payments
- Entry: `src/app/(dashboard)/payments/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/payments/bulk-pdf-button`
  - `@/app/(dashboard)/payments/export-button`
  - `@/app/(dashboard)/payments/payments-page-client`

### /payments/[id]
- Entry: `src/app/(dashboard)/payments/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/payments/[id]/payment-actions`
- Actions:
  - `@/lib/actions/payments`: getPayment
- Models: activityLog, organization, payment
- External services: clerk, resend, stripe
- Email templates:
  - `@/emails/payment-reminder`

### /portfolios
- Entry: `src/app/(dashboard)/portfolios/page.tsx`
- Components:
  - `@/components/dashboard`
- Actions:
  - `@/lib/actions/portfolio-websites`: getPortfolioWebsites
- Models: activityLog, client, portfolioInquiry, portfolioWebsite, portfolioWebsiteProject, portfolioWebsiteSection, portfolioWebsiteView, project

### /portfolios/[id]
- Entry: `src/app/(dashboard)/portfolios/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/portfolios/[id]/portfolio-editor-client`
- Actions:
  - `@/lib/actions/portfolio-websites`: getPortfolioAnalytics, getPortfolioWebsite
- Models: activityLog, client, portfolioInquiry, portfolioWebsite, portfolioWebsiteProject, portfolioWebsiteSection, portfolioWebsiteView, project

### /portfolios/new
- Entry: `src/app/(dashboard)/portfolios/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/portfolios/new/new-portfolio-client`

### /products
- Entry: `src/app/(dashboard)/products/page.tsx`
- App components:
  - `@/app/(dashboard)/products/products-client`
- Actions:
  - `@/lib/actions/products`: listProductCatalogs
- Models: asset, productCatalog, productItem, productPhoto, productVariant

### /products/[catalogId]
- Entry: `src/app/(dashboard)/products/[catalogId]/page.tsx`
- App components:
  - `@/app/(dashboard)/products/[catalogId]/catalog-client`
- Actions:
  - `@/lib/actions/products`: getProductCatalog
- Models: asset, productCatalog, productItem, productPhoto, productVariant

### /projects
- Entry: `src/app/(dashboard)/projects/page.tsx`
- App components:
  - `@/app/(dashboard)/projects/projects-client`
- Actions:
  - `@/lib/actions/clients`: getClients
  - `@/lib/actions/galleries`: getGalleries
  - `@/lib/actions/projects`: getBoard, getOrCreateDefaultBoard
  - `@/lib/actions/settings`: getTeamMembers
- Models: activityLog, asset, booking, client, clientSession, clientTag, deliveryLink, galleryComment, galleryFavorite, invoice, organization, organizationMember, payment, project, propertyWebsite, recurringTask, service, task, taskAutomation, taskBoard, taskColumn, taskComment, taskSubtask, taskTemplate, taskTimeEntry, user
- External services: clerk, r2, s3, stripe

### /projects/analytics
- Entry: `src/app/(dashboard)/projects/analytics/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/projects/analytics/projects-analytics-client`
- Actions:
  - `@/lib/actions/projects`: getTaskAnalytics
- Models: booking, client, project, recurringTask, task, taskAutomation, taskBoard, taskColumn, taskComment, taskSubtask, taskTemplate, taskTimeEntry, user

### /projects/tasks/[id]
- Entry: `src/app/(dashboard)/projects/tasks/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/projects/tasks/[id]/task-detail-client`
- Actions:
  - `@/lib/actions/clients`: getClients
  - `@/lib/actions/galleries`: getGalleries
  - `@/lib/actions/projects`: getTask
  - `@/lib/actions/settings`: getTeamMembers
- Models: activityLog, asset, booking, client, clientSession, clientTag, deliveryLink, galleryComment, galleryFavorite, invoice, organization, organizationMember, payment, project, propertyWebsite, recurringTask, service, task, taskAutomation, taskBoard, taskColumn, taskComment, taskSubtask, taskTemplate, taskTimeEntry, user
- External services: clerk, r2, s3, stripe

### /properties
- Entry: `src/app/(dashboard)/properties/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/properties/analytics-view-client`
  - `@/app/(dashboard)/properties/leads-view-client`
  - `@/app/(dashboard)/properties/properties-page-client`
- Actions:
  - `@/lib/actions/property-websites`
- Models: project, propertyAnalytics, propertyLead, propertyWebsite

### /properties/[id]
- Entry: `src/app/(dashboard)/properties/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/properties/[id]/property-detail-client`
- Actions:
  - `@/lib/actions/property-websites`: getPropertyAnalytics, getPropertyLeads, getPropertyWebsiteById
- Models: project, propertyAnalytics, propertyLead, propertyWebsite

### /properties/[id]/edit
- Entry: `src/app/(dashboard)/properties/[id]/edit/page.tsx`
- App components:
  - `@/app/(dashboard)/properties/[id]/edit/property-edit-form`
- Actions:
  - `@/lib/actions/property-websites`: getPropertyWebsiteById
- Models: project, propertyAnalytics, propertyLead, propertyWebsite

### /properties/new
- Entry: `src/app/(dashboard)/properties/new/page.tsx`
- App components:
  - `@/app/(dashboard)/properties/new/new-property-website-client`
- Actions:
  - `@/lib/actions/property-websites`: getProjectsWithoutPropertyWebsite
- Models: project, propertyAnalytics, propertyLead, propertyWebsite

### /questionnaires
- Entry: `src/app/(dashboard)/questionnaires/page.tsx`
- App components:
  - `@/app/(dashboard)/questionnaires/questionnaires-page-client`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
  - `@/lib/actions/client-questionnaires`: getClientQuestionnaires, getQuestionnaireStats
  - `@/lib/actions/clients`: getClients
  - `@/lib/actions/questionnaire-templates`: getQuestionnaireTemplates, getTemplatesByIndustry
- Models: activityLog, booking, client, clientQuestionnaire, clientSession, clientTag, organization, payment, project, questionnaireField, questionnaireTemplate
- External services: clerk

### /questionnaires/assigned/[id]
- Entry: `src/app/(dashboard)/questionnaires/assigned/[id]/page.tsx`
- App components:
  - `@/app/(dashboard)/questionnaires/assigned/[id]/response-viewer`
- Actions:
  - `@/lib/actions/client-questionnaires`: getClientQuestionnaire
- Models: booking, client, clientQuestionnaire, organization, project, questionnaireTemplate
- External services: clerk

### /questionnaires/templates/[id]
- Entry: `src/app/(dashboard)/questionnaires/templates/[id]/page.tsx`
- App components:
  - `@/app/(dashboard)/questionnaires/templates/[id]/template-editor-client`
- Actions:
  - `@/lib/actions/questionnaire-templates`: getQuestionnaireTemplate
- Models: questionnaireField, questionnaireTemplate
- External services: clerk

### /questionnaires/templates/[id]/preview
- Entry: `src/app/(dashboard)/questionnaires/templates/[id]/preview/page.tsx`
- App components:
  - `@/app/(dashboard)/questionnaires/templates/[id]/preview/preview-client`
- Actions:
  - `@/lib/actions/questionnaire-templates`: getQuestionnaireTemplate
- Models: questionnaireField, questionnaireTemplate
- External services: clerk

### /questionnaires/templates/new
- Entry: `src/app/(dashboard)/questionnaires/templates/new/page.tsx`
- Actions:
  - `@/lib/actions/questionnaire-templates`
- Models: questionnaireField, questionnaireTemplate
- External services: clerk

### /scheduling
- Entry: `src/app/(dashboard)/scheduling/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/scheduling-page-client`
- Actions:
  - `@/lib/actions/availability`: getPendingTimeOffCount
- Models: availabilityBlock, booking, bookingBuffer, user

### /scheduling/[id]
- Entry: `src/app/(dashboard)/scheduling/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/service-selector`
- App components:
  - `@/app/(dashboard)/scheduling/[id]/booking-actions`
  - `@/app/(dashboard)/scheduling/[id]/booking-delete-action`
  - `@/app/(dashboard)/scheduling/[id]/booking-project-action`
- Actions:
  - `@/lib/actions/bookings`: getBooking, updateBookingStatus
- Models: activityLog, availabilityBlock, booking, bookingBuffer, bookingReminder, client, organization, service
- External services: clerk, slack

### /scheduling/[id]/edit
- Entry: `src/app/(dashboard)/scheduling/[id]/edit/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/scheduling/[id]/edit/booking-edit-form`
- Actions:
  - `@/lib/actions/bookings`: getBooking, getClientsForBooking, updateBookingStatus
- Models: activityLog, availabilityBlock, booking, bookingBuffer, bookingReminder, client, organization, service
- External services: clerk, slack

### /scheduling/availability
- Entry: `src/app/(dashboard)/scheduling/availability/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/availability/availability-page-client`

### /scheduling/booking-forms
- Entry: `src/app/(dashboard)/scheduling/booking-forms/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/booking-forms/booking-forms-page-client`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
  - `@/lib/actions/booking-forms`: getBookingForms
  - `@/lib/actions/services`: getServices
- Models: booking, bookingForm, bookingFormField, bookingFormService, bookingFormSubmission, client, organization, service
- External services: clerk, stripe

### /scheduling/booking-forms/[id]
- Entry: `src/app/(dashboard)/scheduling/booking-forms/[id]/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/booking-forms/[id]/booking-form-edit-client`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
  - `@/lib/actions/booking-forms`: getBookingForm
  - `@/lib/actions/services`: getServices
- Models: booking, bookingForm, bookingFormField, bookingFormService, bookingFormSubmission, client, organization, service
- External services: clerk, stripe

### /scheduling/booking-forms/[id]/submissions
- Entry: `src/app/(dashboard)/scheduling/booking-forms/[id]/submissions/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/booking-forms/[id]/submissions/submissions-page-client`
- Actions:
  - `@/lib/actions/booking-forms`: getBookingForm, getFormSubmissions
- Models: booking, bookingForm, bookingFormField, bookingFormService, bookingFormSubmission, client, organization, service

### /scheduling/new
- Entry: `src/app/(dashboard)/scheduling/new/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/scheduling/new/booking-new-form`
- Actions:
  - `@/lib/actions/bookings`: getClientsForBooking, getScheduleStats, getServicesForBooking
  - `@/lib/actions/orders`: getOrder
- Models: activityLog, availabilityBlock, booking, bookingBuffer, bookingReminder, client, order, orderItem, orderPage, organization, service, serviceBundle
- External services: clerk, slack, stripe

### /scheduling/time-off
- Entry: `src/app/(dashboard)/scheduling/time-off/page.tsx`
- App components:
  - `@/app/(dashboard)/scheduling/time-off/time-off-page-client`
- Actions:
  - `@/lib/actions/availability`: getPendingTimeOffRequests, getTimeOffRequests
- Models: availabilityBlock, booking, bookingBuffer, user

### /scheduling/types
- Entry: `src/app/(dashboard)/scheduling/types/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/scheduling/types/booking-types-client`
- Actions:
  - `@/lib/actions/booking-types`: getBookingTypes, seedDefaultBookingTypes
- Models: booking, bookingType
- External services: clerk

### /services
- Entry: `src/app/(dashboard)/services/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/services/services-page-client`
- Actions:
  - `@/lib/actions/services`: getServices, seedDefaultServices
- Models: service
- External services: stripe

### /services/[id]
- Entry: `src/app/(dashboard)/services/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/service-form`
  - `@/components/dashboard/service-quick-actions`
- Actions:
  - `@/lib/actions/services`: getService
- Models: service
- External services: stripe

### /services/addons
- Entry: `src/app/(dashboard)/services/addons/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/addon-list`
- Actions:
  - `@/lib/actions/addons`: getAddons
- Models: service, serviceAddon, serviceAddonCompat, serviceBundleItem

### /services/addons/[id]
- Entry: `src/app/(dashboard)/services/addons/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/addon-form`
- Actions:
  - `@/lib/actions/addons`: getAddon
- Models: service, serviceAddon, serviceAddonCompat, serviceBundleItem

### /services/addons/new
- Entry: `src/app/(dashboard)/services/addons/new/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/addon-form`

### /services/bundles
- Entry: `src/app/(dashboard)/services/bundles/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/bundle-list`
- Actions:
  - `@/lib/actions/bundles`: getBundles
- Models: booking, bundlePricingTier, service, serviceBundle, serviceBundleItem
- External services: stripe

### /services/bundles/[id]
- Entry: `src/app/(dashboard)/services/bundles/[id]/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/bundle-form`
- Actions:
  - `@/lib/actions/bundles`: getBundle
- Models: booking, bundlePricingTier, service, serviceBundle, serviceBundleItem
- External services: stripe

### /services/bundles/new
- Entry: `src/app/(dashboard)/services/bundles/new/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/bundle-form`

### /services/new
- Entry: `src/app/(dashboard)/services/new/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/dashboard/service-form`

### /settings
- Entry: `src/app/(dashboard)/settings/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/settings-page-client`

### /settings/appearance
- Entry: `src/app/(dashboard)/settings/appearance/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/appearance/appearance-settings-form`
- Actions:
  - `@/lib/actions/appearance`: getAppearancePreferences
- Models: user
- External services: clerk

### /settings/billing
- Entry: `src/app/(dashboard)/settings/billing/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
- Actions:
  - `@/lib/actions/settings`: getBillingStats, getInvoiceHistory
- Models: booking, client, invoice, organization, organizationMember, payment, project, propertyWebsite, service, user
- External services: clerk, r2, s3, stripe

### /settings/billing/upgrade
- Entry: `src/app/(dashboard)/settings/billing/upgrade/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/billing/upgrade/upgrade-form`

### /settings/branding
- Entry: `src/app/(dashboard)/settings/branding/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/branding/branding-settings-form`
- Actions:
  - `@/lib/actions/settings`: getOrganizationSettings
- Models: booking, client, invoice, organization, organizationMember, payment, project, propertyWebsite, service, user
- External services: clerk, r2, s3, stripe

### /settings/calendar
- Entry: `src/app/(dashboard)/settings/calendar/page.tsx`
- App components:
  - `@/app/(dashboard)/settings/calendar/calendar-settings-client`
- Actions:
  - `@/lib/actions/google-calendar`: getGoogleCalendarConfig
- Models: booking, calendarEvent, calendarIntegration
- External services: clerk, google

### /settings/calendly
- Entry: `src/app/(dashboard)/settings/calendly/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/calendly/calendly-settings-client`

### /settings/developer
- Entry: `src/app/(dashboard)/settings/developer/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/developer/seed-buttons`
  - `@/app/(dashboard)/settings/developer/stripe-products`
  - `@/app/(dashboard)/settings/developer/subscription-plans`
- Actions:
  - `@/lib/actions/auth-helper`: requireOrganizationId
  - `@/lib/actions/subscription-plans`
- Models: planFeature, pricingExperiment, pricingVariant, subscriptionPlan
- External services: clerk, r2, resend, s3, stripe, twilio

### /settings/dropbox
- Entry: `src/app/(dashboard)/settings/dropbox/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/dropbox/dropbox-settings-client`
- Actions:
  - `@/lib/actions/dropbox`: getDropboxConfig
- Models: asset, dropboxIntegration, project
- External services: clerk, dropbox, r2

### /settings/email
- Entry: `src/app/(dashboard)/settings/email/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/input`
  - `@/components/ui/select`
  - `@/components/ui/settings-icons`
  - `@/components/ui/switch`
  - `@/components/ui/toast`
- Actions:
  - `@/lib/actions/email-accounts`
  - `@/lib/actions/email-settings`
- Models: emailAccount, organization
- External services: clerk, gmail, resend
- API references:
  - `/api/integrations/gmail/authorize`

### /settings/email-logs
- Entry: `src/app/(dashboard)/settings/email-logs/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/checkbox`
  - `@/components/ui/settings-icons`
  - `@/components/ui/toast`
- Actions:
  - `@/lib/actions/email-logs`
- Models: booking, clientQuestionnaire, clientQuestionnaireAgreement, clientQuestionnaireResponse, contract, emailLog, order, organization, project
- External services: clerk, resend

### /settings/equipment
- Entry: `src/app/(dashboard)/settings/equipment/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
- App components:
  - `@/app/(dashboard)/settings/equipment/equipment-list`
- Actions:
  - `@/lib/actions/equipment`: getEquipmentByCategory
- Models: booking, bookingEquipmentCheck, equipment, organization, organizationMember, service, serviceEquipmentRequirement, userEquipment

### /settings/features
- Entry: `src/app/(dashboard)/settings/features/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/features/features-settings-form`

### /settings/gallery-addons
- Entry: `src/app/(dashboard)/settings/gallery-addons/page.tsx`
- Components:
  - `@/components/gallery/addon-catalog-manager`

### /settings/gallery-templates
- Entry: `src/app/(dashboard)/settings/gallery-templates/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/gallery-templates/gallery-templates-client`
- Actions:
  - `@/lib/actions/gallery-templates`: getGalleryTemplates
  - `@/lib/actions/services`: getServices
- Models: galleryTemplate, organization, service
- External services: clerk, stripe

### /settings/integrations
- Entry: `src/app/(dashboard)/settings/integrations/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/integrations/integrations-client`

### /settings/mailchimp
- Entry: `src/app/(dashboard)/settings/mailchimp/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/mailchimp/mailchimp-settings-client`

### /settings/my-referrals
- Entry: `src/app/(dashboard)/settings/my-referrals/page.tsx`
- App components:
  - `@/app/(dashboard)/settings/my-referrals/my-referrals-client`
- Actions:
  - `@/lib/actions/platform-referrals`
- Models: notification, organizationMember, platformReferral, platformReferralReward, platformReferralSettings, platformReferrer, user
- External services: clerk

### /settings/notifications
- Entry: `src/app/(dashboard)/settings/notifications/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/select`
  - `@/components/ui/settings-icons`
  - `@/components/ui/switch`
  - `@/components/ui/toast`
- Actions:
  - `@/lib/actions/notification-preferences`
- Models: organization
- External services: clerk

### /settings/payments
- Entry: `src/app/(dashboard)/settings/payments/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/payments/payments-settings-client`
- Actions:
  - `@/lib/actions/settings`: getCurrencySettings, getTaxSettings
  - `@/lib/actions/stripe-connect`: getConnectAccountDetails
- Models: booking, client, invoice, organization, organizationMember, payment, project, propertyWebsite, service, user
- External services: clerk, r2, s3, stripe

### /settings/payouts
- Entry: `src/app/(dashboard)/settings/payouts/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/payouts/payouts-page-client`
- Actions:
  - `@/lib/actions/payouts`: getPayoutBatches, getPayoutStats, getPendingPayouts
- Models: payoutBatch, payoutItem, photographerEarning, user
- External services: stripe

### /settings/photographer-pay
- Entry: `src/app/(dashboard)/settings/photographer-pay/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
- App components:
  - `@/app/(dashboard)/settings/photographer-pay/photographer-pay-client`
- Actions:
  - `@/lib/actions/photographer-pay`: getEarningStats, getPhotographerRates
  - `@/lib/actions/services`: getServices
  - `@/lib/actions/settings`: getTeamMembers
- Models: booking, client, invoice, organization, organizationMember, payment, photographerEarning, photographerRate, project, propertyWebsite, service, user
- External services: clerk, r2, s3, stripe

### /settings/profile
- Entry: `src/app/(dashboard)/settings/profile/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/profile/profile-settings-form`
- Actions:
  - `@/lib/actions/settings`: getBillingStats, getCurrentUser
- Models: booking, client, invoice, organization, organizationMember, payment, project, propertyWebsite, service, user
- External services: clerk, r2, s3, stripe

### /settings/quickbooks
- Entry: `src/app/(dashboard)/settings/quickbooks/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/quickbooks/quickbooks-settings-client`

### /settings/referrals
- Entry: `src/app/(dashboard)/settings/referrals/page.tsx`
- App components:
  - `@/app/(dashboard)/settings/referrals/referrals-client`
- Actions:
  - `@/lib/actions/clients`: getClients
  - `@/lib/actions/referrals`
- Models: activityLog, client, clientSession, clientTag, payment, referral, referralProgram, referrer
- External services: clerk

### /settings/slack
- Entry: `src/app/(dashboard)/settings/slack/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/slack/slack-settings-client`
- Actions:
  - `@/lib/actions/slack`: getSlackConfig
- Models: slackIntegration
- External services: clerk, slack

### /settings/sms
- Entry: `src/app/(dashboard)/settings/sms/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
- App components:
  - `@/app/(dashboard)/settings/sms/sms-settings-client`
- Actions:
  - `@/lib/actions/sms`: getSMSLogs, getSMSSettings, getSMSStats, getSMSTemplates
- Models: organization, sMSLog, sMSTemplate

### /settings/sms/templates
- Entry: `src/app/(dashboard)/settings/sms/templates/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/sms/templates/sms-templates-client`
- Actions:
  - `@/lib/actions/sms`: getSMSTemplates
- Models: organization, sMSLog, sMSTemplate

### /settings/team
- Entry: `src/app/(dashboard)/settings/team/page.tsx`
- App components:
  - `@/app/(dashboard)/settings/team/team-page-client`
- Actions:
  - `@/lib/actions/invitations`: getPendingInvitations
  - `@/lib/actions/settings`: getBillingStats, getTeamMembers
- Models: booking, client, invitation, invoice, organization, organizationMember, payment, project, propertyWebsite, service, user
- External services: clerk, r2, resend, s3, stripe

### /settings/team/[id]/capabilities
- Entry: `src/app/(dashboard)/settings/team/[id]/capabilities/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/team/[id]/capabilities/capabilities-form`
- Actions:
  - `@/lib/actions/equipment`: getEquipmentList, getUserEquipment
  - `@/lib/actions/team-capabilities`: getUserServiceCapabilities
- Models: booking, bookingEquipmentCheck, equipment, location, organization, organizationMember, service, serviceEquipmentRequirement, user, userEquipment, userServiceCapability

### /settings/territories
- Entry: `src/app/(dashboard)/settings/territories/page.tsx`
- App components:
  - `@/app/(dashboard)/settings/territories/territories-client`
- Actions:
  - `@/lib/actions/services`: getServices
  - `@/lib/actions/territories`: getTerritories
- Models: organization, service, serviceTerritory, territoryServiceOverride
- External services: clerk, stripe

### /settings/travel
- Entry: `src/app/(dashboard)/settings/travel/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/travel/travel-settings-form`
- Actions:
  - `@/lib/actions/settings`: getOrganizationSettings
- Models: booking, client, invoice, organization, organizationMember, payment, project, propertyWebsite, service, user
- External services: clerk, r2, s3, stripe

### /settings/watermarks
- Entry: `src/app/(dashboard)/settings/watermarks/page.tsx`
- Components:
  - `@/components/dashboard`
- App components:
  - `@/app/(dashboard)/settings/watermarks/watermark-templates-client`
- Actions:
  - `@/lib/actions/watermark-templates`: listWatermarkTemplates
- Models: organization, watermarkTemplate
- External services: clerk

### /settings/zapier
- Entry: `src/app/(dashboard)/settings/zapier/page.tsx`
- Components:
  - `@/components/dashboard`
  - `@/components/ui/button`
  - `@/components/ui/settings-icons`
- App components:
  - `@/app/(dashboard)/settings/zapier/zapier-settings-client`
- Actions:
  - `@/lib/actions/api-keys`: getApiKeys
- Models: apiKey, organization
- External services: clerk

### /field
- Entry: `src/app/(field)/field/page.tsx`
- App components:
  - `@/app/(field)/field/field-schedule-client`
- Actions:
  - `@/lib/actions/field-operations`: getTodaysBookings, getUpcomingBookings
- Models: booking, bookingCheckIn
- External services: clerk

### /field/check-in
- Entry: `src/app/(field)/field/check-in/page.tsx`
- App components:
  - `@/app/(field)/field/check-in/check-in-client`
- Actions:
  - `@/lib/actions/field-operations`: getTodaysBookings
- Models: booking, bookingCheckIn
- External services: clerk

### /about
- Entry: `src/app/(marketing)/about/page.tsx`

### /affiliates
- Entry: `src/app/(marketing)/affiliates/page.tsx`

### /blog
- Entry: `src/app/(marketing)/blog/page.tsx`
- App components:
  - `@/app/(marketing)/blog/newsletter-form`

### /blog/[slug]
- Entry: `src/app/(marketing)/blog/[slug]/page.tsx`

### /careers
- Entry: `src/app/(marketing)/careers/page.tsx`

### /changelog
- Entry: `src/app/(marketing)/changelog/page.tsx`

### /contact
- Entry: `src/app/(marketing)/contact/page.tsx`
- App components:
  - `@/app/(marketing)/contact/contact-form`

### /features/analytics
- Entry: `src/app/(marketing)/features/analytics/page.tsx`

### /features/automation
- Entry: `src/app/(marketing)/features/automation/page.tsx`

### /features/clients
- Entry: `src/app/(marketing)/features/clients/page.tsx`

### /features/contracts
- Entry: `src/app/(marketing)/features/contracts/page.tsx`

### /features/galleries
- Entry: `src/app/(marketing)/features/galleries/page.tsx`

### /features/payments
- Entry: `src/app/(marketing)/features/payments/page.tsx`

### /guides
- Entry: `src/app/(marketing)/guides/page.tsx`

### /help
- Entry: `src/app/(marketing)/help/page.tsx`

### /help/[category]/[article]
- Entry: `src/app/(marketing)/help/[category]/[article]/page.tsx`

### /industries/architecture
- Entry: `src/app/(marketing)/industries/architecture/page.tsx`

### /industries/commercial
- Entry: `src/app/(marketing)/industries/commercial/page.tsx`

### /industries/events
- Entry: `src/app/(marketing)/industries/events/page.tsx`

### /industries/food
- Entry: `src/app/(marketing)/industries/food/page.tsx`

### /industries/portraits
- Entry: `src/app/(marketing)/industries/portraits/page.tsx`

### /industries/real-estate
- Entry: `src/app/(marketing)/industries/real-estate/page.tsx`

### /integrations
- Entry: `src/app/(marketing)/integrations/page.tsx`

### /legal/cookies
- Entry: `src/app/(marketing)/legal/cookies/page.tsx`

### /legal/dpa
- Entry: `src/app/(marketing)/legal/dpa/page.tsx`

### /legal/privacy
- Entry: `src/app/(marketing)/legal/privacy/page.tsx`

### /legal/security
- Entry: `src/app/(marketing)/legal/security/page.tsx`

### /legal/terms
- Entry: `src/app/(marketing)/legal/terms/page.tsx`

### /partners
- Entry: `src/app/(marketing)/partners/page.tsx`

### /press
- Entry: `src/app/(marketing)/press/page.tsx`

### /pricing
- Entry: `src/app/(marketing)/pricing/page.tsx`

### /roadmap
- Entry: `src/app/(marketing)/roadmap/page.tsx`

### /webinars
- Entry: `src/app/(marketing)/webinars/page.tsx`

### /webinars/[slug]
- Entry: `src/app/(marketing)/webinars/[slug]/page.tsx`

### /onboarding
- Entry: `src/app/(onboarding)/onboarding/page.tsx`
- Components:
  - `@/components/onboarding/onboarding-wizard`

### /
- Entry: `src/app/page.tsx`
- Components:
  - `@/components/layout/footer`
  - `@/components/layout/navbar`
  - `@/components/sections/lazy-section`

### /_custom-domain
- Entry: `src/app/_custom-domain/page.tsx`
- App components:
  - `@/app/portfolio/[slug]/expired-notice`
  - `@/app/portfolio/[slug]/password-gate`
  - `@/app/portfolio/[slug]/portfolio-renderer`
- Actions:
  - `@/lib/actions/portfolio-websites`: getPortfolioByCustomDomain, getPortfolioWebsiteBySlug
- Models: activityLog, client, portfolioInquiry, portfolioWebsite, portfolioWebsiteProject, portfolioWebsiteSection, portfolioWebsiteView, project

### /book/[slug]
- Entry: `src/app/book/[slug]/page.tsx`
- App components:
  - `@/app/book/[slug]/booking-form-public`
- Actions:
  - `@/lib/actions/booking-forms`: getBookingFormBySlug
- Models: booking, bookingForm, bookingFormField, bookingFormService, bookingFormSubmission, client, organization, service

### /book/[slug]/confirmation
- Entry: `src/app/book/[slug]/confirmation/page.tsx`

### /g/[slug]
- Entry: `src/app/g/[slug]/page.tsx`
- App components:
  - `@/app/g/[slug]/gallery-client`
  - `@/app/g/[slug]/password-gate`
  - `@/app/g/[slug]/pay-button`
- Actions:
  - `@/lib/actions/galleries`: getPublicGallery, recordGalleryView
- Models: activityLog, asset, deliveryLink, galleryComment, galleryFavorite, organization, project
- External services: r2

### /invite/[token]
- Entry: `src/app/invite/[token]/page.tsx`
- App components:
  - `@/app/invite/[token]/invite-accept-client`
- Actions:
  - `@/lib/actions/invitations`: getInvitationByToken
- Models: invitation, organization, organizationMember, user
- External services: resend

### /order/[slug]
- Entry: `src/app/order/[slug]/page.tsx`
- App components:
  - `@/app/order/[slug]/order-page-client`
- Actions:
  - `@/lib/actions/client-auth`: getClientSession
  - `@/lib/actions/order-pages`: getOrderPageBySlug
- Models: client, clientSession, orderPage, orderPageBundle, orderPageService, service, serviceBundle
- External services: resend
- Email templates:
  - `@/emails/client-magic-link`

### /order/[slug]/confirmation
- Entry: `src/app/order/[slug]/confirmation/page.tsx`
- App components:
  - `@/app/order/[slug]/confirmation/order-confirmation-client`
- Actions:
  - `@/lib/actions/order-pages`: getOrderPageBySlug
- Models: orderPage, orderPageBundle, orderPageService, service, serviceBundle

### /p/[slug]
- Entry: `src/app/p/[slug]/page.tsx`
- App components:
  - `@/app/p/[slug]/property-inquiry-form`
  - `@/app/p/[slug]/property-share-buttons`
- Actions:
  - `@/lib/actions/property-websites`: getPropertyWebsiteBySlug
- Models: project, propertyAnalytics, propertyLead, propertyWebsite

### /pay/[id]
- Entry: `src/app/pay/[id]/page.tsx`
- App components:
  - `@/app/pay/[id]/pay-client`

### /portfolio/[slug]
- Entry: `src/app/portfolio/[slug]/page.tsx`
- App components:
  - `@/app/portfolio/[slug]/expired-notice`
  - `@/app/portfolio/[slug]/lead-gate`
  - `@/app/portfolio/[slug]/password-gate`
  - `@/app/portfolio/[slug]/portfolio-renderer`
- Actions:
  - `@/lib/actions/portfolio-websites`: getPortfolioWebsiteBySlug
- Models: activityLog, client, portfolioInquiry, portfolioWebsite, portfolioWebsiteProject, portfolioWebsiteSection, portfolioWebsiteView, project

### /r/[code]
- Entry: `src/app/r/[code]/page.tsx`

### /schedule
- Entry: `src/app/schedule/page.tsx`

### /sign/[token]
- Entry: `src/app/sign/[token]/page.tsx`
- Components:
  - `@/components/ui/checkbox`
- Actions:
  - `@/lib/actions/contract-signing`: getContractForSigning, signContract
- Models: activityLog, contract, contractAuditLog, contractSignature, contractSigner, organization
- External services: resend

### /sign/[token]/complete
- Entry: `src/app/sign/[token]/complete/page.tsx`
- Actions:
  - `@/lib/actions/contract-signing`: getSigningCompletion
- Models: activityLog, contract, contractAuditLog, contractSignature, contractSigner, organization
- External services: resend

### /track
- Entry: `src/app/track/page.tsx`

### /unsubscribe
- Entry: `src/app/unsubscribe/page.tsx`
- Components:
  - `@/components/ui/switch`
- API references:
  - `/api/unsubscribe`
  - `/api/unsubscribe?token=${token}`

## Core Modules (Authenticated Dashboard)

### Dashboard Home
- Purpose: Snapshot of organization activity and quick links.
- Routes: `/dashboard`.
- Data: Dashboard config and section visibility, activity summaries, notifications.
- Actions: `dashboard.ts`, `activity.ts`, `notifications.ts`.

### Analytics
- Purpose: Revenue, client LTV, gallery engagement, scheduling utilization.
- Routes: `/analytics`, `/projects/analytics`, `/billing/analytics`, `/orders/analytics`.
- Data: Aggregated metrics by project/client/payment.
- Actions: `analytics.ts`, `invoice-analytics.ts`, `revenue-forecasting.ts`, `gallery-analytics.ts`.

### Projects and Tasks
- Purpose: Kanban/list boards, tasks, dependencies, time tracking.
- Routes: `/projects`, `/projects/analytics`, `/projects/tasks/[id]`.
- Data: Project, Board, Task, TaskPriority, TaskStatus, Task dependencies, time entries.
- Actions: `projects.ts` plus `activity.ts` for logs.

### Clients and CRM
- Purpose: Contact and relationship management for all customers.
- Routes: `/clients`, `/clients/new`, `/clients/[id]`, `/clients/[id]/edit`, `/clients/import`, `/clients/merge`.
- Data: Client, ClientTag, ClientCommunication, referrals.
- Actions: `clients.ts`, `client-import.ts`, `client-merge.ts`, `client-tags.ts`, `client-communications.ts`.

### Leads and Inbox
- Purpose: Track lead status, follow-up, and communication logs.
- Routes: `/leads`, `/inbox`.
- Data: Lead status, scoring, pipeline activity.
- Actions: `lead-scoring.ts`, `chat-inquiries.ts`, `client-communications.ts`.

### Scheduling
- Purpose: All booking and availability flows including time-off and booking forms.
- Routes: `/scheduling`, `/scheduling/new`, `/scheduling/[id]`, `/scheduling/[id]/edit`, `/scheduling/availability`, `/scheduling/time-off`, `/scheduling/types`, `/scheduling/booking-forms`, `/scheduling/booking-forms/[id]`, `/scheduling/booking-forms/[id]/submissions`.
- Data: Booking, BookingStatus, BookingType, availability blocks, buffers, time-off requests.
- Actions: `bookings.ts`, `availability.ts`, `booking-forms.ts`, `booking-types.ts`, `team-availability.ts`.

### Booking (Internal)
- Purpose: Internal booking list/ops views separate from scheduling board.
- Routes: `/booking`.
- Actions: `bookings.ts`.

### Galleries and Delivery
- Purpose: Upload, manage, deliver galleries with proofing and downloads.
- Routes: `/galleries`, `/galleries/new`, `/galleries/[id]`, `/galleries/[id]/edit`, `/galleries/services`, `/galleries/services/new`, `/galleries/services/[id]`.
- Data: Gallery, GalleryAsset, favorites, download history, view analytics.
- Actions: `galleries.ts`, `gallery-activity.ts`, `gallery-analytics.ts`, `gallery-reminders.ts`, `gallery-expiration.ts`.

### Forms and Questionnaires
- Purpose: Custom forms, questionnaires, submissions, templates.
- Routes: `/forms`, `/forms/[id]`, `/questionnaires`, `/questionnaires/templates/new`, `/questionnaires/templates/[id]`, `/questionnaires/templates/[id]/preview`, `/questionnaires/assigned/[id]`.
- Data: Form, FormField, Submission, Questionnaire, QuestionnaireTemplate.
- Actions: `custom-forms.ts`, `questionnaire-templates.ts`, `client-questionnaires.ts`.

### Contracts
- Purpose: Template-driven contracts and e-signing.
- Routes: `/contracts`, `/contracts/new`, `/contracts/[id]`, `/contracts/[id]/edit`, `/contracts/templates`, `/contracts/templates/new`, `/contracts/templates/[id]`.
- Data: Contract, ContractTemplate, ContractStatus, signature records.
- Actions: `contracts.ts`, `contract-signing.ts`, `contract-templates.ts`, `contract-pdf.ts`.

### Invoices and Payments
- Purpose: Create, send, track invoices and payments.
- Routes: `/invoices`, `/invoices/new`, `/invoices/[id]`, `/invoices/[id]/edit`, `/invoices/recurring`, `/payments`, `/payments/[id]`.
- Data: Invoice, InvoiceStatus, Payment, PaymentStatus, payment plans, credit notes.
- Actions: `invoices.ts`, `invoice-payments.ts`, `payment-plans.ts`, `payments.ts`, `credit-notes.ts`, `invoice-templates.ts`.

### Orders and Order Pages
- Purpose: Create client-facing order pages and process orders.
- Routes: `/order-pages`, `/order-pages/new`, `/order-pages/[id]`, `/orders`, `/orders/[id]`, `/orders/analytics`.
- Data: OrderPage, Order, Order items, checkout sessions.
- Actions: `order-pages.ts`, `orders.ts`, `stripe-checkout.ts`.

### Services, Bundles, Add-ons
- Purpose: Service catalog, bundles, add-ons, pricing tiers, sync to Stripe.
- Routes: `/services`, `/services/new`, `/services/[id]`, `/services/bundles`, `/services/bundles/new`, `/services/bundles/[id]`, `/services/addons`, `/services/addons/new`, `/services/addons/[id]`.
- Data: Service, Bundle, Addon, pricing tiers, Stripe product sync fields.
- Actions: `services.ts`, `bundles.ts`, `addons.ts`, `stripe-product-sync.ts`.

### Products and Catalogs
- Purpose: Product catalogs and upsells tied to orders and galleries.
- Routes: `/products`, `/products/[catalogId]`.
- Data: Product, ProductCatalog.
- Actions: `products.ts`.

### Properties, Portfolios, Brokerages
- Purpose: Property websites, portfolios, and brokerage management.
- Routes: `/properties`, `/properties/new`, `/properties/[id]`, `/properties/[id]/edit`, `/portfolios`, `/portfolios/new`, `/portfolios/[id]`, `/brokerages`, `/brokerages/new`, `/brokerages/[id]`, `/brokerages/[id]/edit`.
- Data: PropertyWebsite, PortfolioWebsite, Brokerage.
- Actions: `property-websites.ts`, `portfolio-websites.ts`, `brokerages.ts`.

### Mini Sessions and Licensing
- Purpose: Specialized sales flows for minis and licensing packages.
- Routes: `/mini-sessions`, `/licensing`.
- Actions: Mini-sessions and licensing flows are scaffolded for expansion.

### Billing and Retainers
- Purpose: Org billing analytics and retainer tracking.
- Routes: `/billing/analytics`, `/billing/reports`, `/billing/retainers`.
- Data: Retainer, RetainerTransaction.
- Actions: `retainers.ts`, `getBillingStats` in `settings.ts`.

### Notifications and Feedback
- Purpose: Internal notification center and feedback intake.
- Routes: `/notifications`, `/feedback`.
- Actions: `notifications.ts`, `gallery-feedback.ts`.

### Settings and Admin
- Purpose: Organization settings for billing, branding, email, integrations, team, and features.
- Routes: `/settings` and all subroutes under `/settings/*`.
- Data: Organization settings, integrations, notification preferences, team capabilities, territories.
- Actions: `settings.ts`, `notification-preferences.ts`, `team-capabilities.ts`, `territories.ts`, `email-settings.ts`, `sms.ts`.

## Public and Client-Facing Flows

### Public Booking
- Routes: `/book/[slug]`, `/book/[slug]/confirmation`.
- Data: Booking forms, services, availability buffers, conflicts.
- Actions: `self-booking.ts`, `booking-forms.ts`, `availability.ts`.
- Rules: If booking form requires approval, create as pending; otherwise confirmed.

### Public Order Pages
- Routes: `/order/[slug]`, `/order/[slug]/confirmation`.
- Data: Order pages, bundles, services, checkout sessions.
- Actions: `order-pages.ts`, `orders.ts`, `stripe-checkout.ts`.

### Public Galleries
- Routes: `/g/[slug]`.
- Data: Gallery, assets, favorites, downloads, feedback.
- Actions: `galleries.ts`, `client-selections.ts`, `download-tracking.ts`, gallery API routes.

### Public Properties and Portfolios
- Routes: `/p/[slug]` (property), `/portfolio/[slug]` (portfolio).
- Data: PropertyWebsite, PortfolioWebsite, custom domain, inquiries, comments.
- Actions: `property-websites.ts`, `portfolio-websites.ts`, `portfolio-comments.ts`.

### Payments and Signing
- Routes: `/pay/[id]`, `/sign/[token]`, `/sign/[token]/complete`.
- Actions: `stripe-checkout.ts`, `contract-signing.ts`.

### Invites, Tracking, and Unsubscribe
- Routes: `/invite/[token]`, `/r/[code]`, `/track`, `/unsubscribe`.
- Actions: `invitations.ts`, `platform-referrals.ts`, `/api/portfolio/track`, `/api/unsubscribe`.

### Field Operations
- Routes: `/field`, `/field/check-in`.
- Actions: `field-operations.ts` for check-in/out and field notes.

### Client Portal
- Routes: `/portal`, `/portal/login`, `/portal/questionnaires/[id]`.
- Actions: `client-portal.ts`, `questionnaire-portal.ts`, `portal-activity.ts`.

## Automation, Cron, and Background Jobs
- Cron endpoints live under `/api/cron/*` and handle reminders, late fees, recurring invoices, portfolio publishing, and gallery expiration.
- All cron routes are listed in the API inventory.

## Integrations and Webhooks
- Stripe: `/api/webhooks/stripe` and actions in `stripe-checkout.ts`, `stripe-connect.ts`.
- Clerk: `/api/webhooks/clerk` for user/org lifecycle.
- Dropbox: `/api/integrations/dropbox/*` and `dropbox.ts` actions.
- Gmail/Google: `/api/integrations/gmail/*`, `/api/integrations/google/*` and `email-sync.ts`, `google-calendar.ts`.
- Twilio: `/api/webhooks/twilio/status` for SMS delivery status.
- Resend: `/api/webhooks/resend` for email delivery feedback.

## API Route Specs
- Auth detection is heuristic: based on `require*` helpers found in the handler.
- Inputs list is heuristic: derived from `request.json()` destructuring and query params.

### /api/admin/seed-questionnaire-templates
- File: `src/app/api/admin/seed-questionnaire-templates/route.ts`
- Methods: GET, POST
- Prisma models: questionnaireTemplate
- External services: clerk
- Status codes: 401, 500

### /api/auth/client
- File: `src/app/api/auth/client/route.ts`
- Methods: GET
- Query params: token
- Action modules:
  - `@/lib/actions/client-auth`

### /api/auth/client/dev-bypass
- File: `src/app/api/auth/client/dev-bypass/route.ts`
- Methods: GET
- Query params: client_id, email
- Prisma models: client, clientSession
- Status codes: 403, 404, 500

### /api/calendar/ical/[token]
- File: `src/app/api/calendar/ical/[token]/route.ts`
- Methods: GET
- Prisma models: booking, calendarFeed
- External services: google
- Status codes: 404, 500

### /api/contracts/bulk-pdf
- File: `src/app/api/contracts/bulk-pdf/route.ts`
- Methods: POST
- Prisma models: contract
- External services: clerk
- Status codes: 401, 404, 500

### /api/cron/booking-followups
- File: `src/app/api/cron/booking-followups/route.ts`
- Methods: GET, POST
- Prisma models: booking
- Status codes: 401, 500

### /api/cron/email-sync
- File: `src/app/api/cron/email-sync/route.ts`
- Methods: GET, POST
- Prisma models: emailAccount
- Status codes: 400, 401, 500

### /api/cron/gallery-auto-archive
- File: `src/app/api/cron/gallery-auto-archive/route.ts`
- Methods: GET, POST
- Prisma models: project
- Status codes: 401, 500

### /api/cron/gallery-expiration
- File: `src/app/api/cron/gallery-expiration/route.ts`
- Methods: GET, POST
- Prisma models: project
- Status codes: 401, 500

### /api/cron/gallery-reminders
- File: `src/app/api/cron/gallery-reminders/route.ts`
- Methods: GET, POST
- Action modules:
  - `@/lib/actions/gallery-reminders`
- Prisma models: organization
- Status codes: 401, 500

### /api/cron/invoice-reminders
- File: `src/app/api/cron/invoice-reminders/route.ts`
- Methods: GET, POST
- Action modules:
  - `@/lib/actions/invoices`
- Prisma models: organization
- Status codes: 401, 500

### /api/cron/late-fees
- File: `src/app/api/cron/late-fees/route.ts`
- Methods: GET, POST
- Action modules:
  - `@/lib/actions/invoice-payments`
  - `@/lib/actions/invoices`
- Status codes: 401, 500

### /api/cron/photographer-digest
- File: `src/app/api/cron/photographer-digest/route.ts`
- Methods: GET, POST
- Action modules:
  - `@/lib/actions/email-logs`
- Prisma models: clientQuestionnaire, organization
- Status codes: 401, 500

### /api/cron/portfolio-digest
- File: `src/app/api/cron/portfolio-digest/route.ts`
- Methods: GET, POST
- Prisma models: organization, portfolioInquiry, portfolioWebsiteView
- External services: resend
- Status codes: 401, 500

### /api/cron/portfolio-publish
- File: `src/app/api/cron/portfolio-publish/route.ts`
- Methods: GET, POST
- Action modules:
  - `@/lib/actions/portfolio-websites`
- Status codes: 401, 500

### /api/cron/questionnaire-reminders
- File: `src/app/api/cron/questionnaire-reminders/route.ts`
- Methods: GET, POST
- Action modules:
  - `@/lib/actions/email-logs`
- Prisma models: clientQuestionnaire
- Status codes: 401, 500

### /api/cron/recurring-invoices
- File: `src/app/api/cron/recurring-invoices/route.ts`
- Methods: GET, POST
- Action modules:
  - `@/lib/actions/recurring-invoices`
- Status codes: 401, 500

### /api/cron/scheduled-invoices
- File: `src/app/api/cron/scheduled-invoices/route.ts`
- Methods: GET, POST
- Action modules:
  - `@/lib/actions/invoices`
- Status codes: 401, 500

### /api/cron/send-reminders
- File: `src/app/api/cron/send-reminders/route.ts`
- Methods: GET, POST
- Action modules:
  - `@/lib/actions/bookings`
- External services: resend
- Status codes: 401, 500

### /api/download/[assetId]
- File: `src/app/api/download/[assetId]/route.ts`
- Methods: GET
- Query params: deliverySlug
- Action modules:
  - `@/lib/actions/client-auth`
- Prisma models: activityLog, asset, project
- External services: r2
- Status codes: 400, 402, 403, 404, 500

### /api/download/batch
- File: `src/app/api/download/batch/route.ts`
- Methods: POST
- Action modules:
  - `@/lib/actions/client-auth`
  - `@/lib/actions/download-tracking`
- Prisma models: activityLog, project
- Status codes: 200, 400, 402, 403, 404, 429, 500

### /api/email-preview
- File: `src/app/api/email-preview/route.ts`
- Methods: GET
- Query params: agreementCount, bookingDate, bookingTitle, clientName, completedTodayCount, description, dueDate, inProgressCount, isOverdue, organizationName, overdueCount, pendingCount, photographerName, questionnaireName, reminderCount, responseCount, template
- External services: clerk
- Status codes: 400, 401, 500

### /api/forms/submit
- File: `src/app/api/forms/submit/route.ts`
- Methods: POST
- Action modules:
  - `@/lib/actions/custom-forms`
- Status codes: 400, 500

### /api/gallery/[id]/analytics-report
- File: `src/app/api/gallery/[id]/analytics-report/route.ts`
- Methods: GET
- Action modules:
  - `@/lib/actions/gallery-analytics`
- Prisma models: project
- External services: clerk
- Status codes: 401, 404, 500

### /api/gallery/[id]/download-history
- File: `src/app/api/gallery/[id]/download-history/route.ts`
- Methods: GET
- Query params: email, sessionId
- Prisma models: asset, downloadLog, project
- Status codes: 400, 404, 500

### /api/gallery/[id]/favorites-export
- File: `src/app/api/gallery/[id]/favorites-export/route.ts`
- Methods: GET
- Query params: format
- Prisma models: project
- External services: clerk
- Status codes: 400, 401, 404, 500

### /api/gallery/[id]/proof-sheet
- File: `src/app/api/gallery/[id]/proof-sheet/route.ts`
- Methods: GET
- Prisma models: project
- External services: clerk
- Status codes: 401, 404, 500

### /api/gallery/comment
- File: `src/app/api/gallery/comment/route.ts`
- Methods: DELETE, GET, POST
- Query params: assetId, galleryId
- Prisma models: asset, galleryComment, project
- Status codes: 400, 401, 403, 404, 429, 500

### /api/gallery/favorite
- File: `src/app/api/gallery/favorite/route.ts`
- Methods: GET, POST
- Query params: email, galleryId
- Prisma models: asset, galleryFavorite
- Status codes: 400, 403, 404, 429, 500

### /api/gallery/feedback
- File: `src/app/api/gallery/feedback/route.ts`
- Methods: POST
- Prisma models: galleryFeedback, project
- Status codes: 400, 404, 429, 500

### /api/gallery/rating
- File: `src/app/api/gallery/rating/route.ts`
- Methods: DELETE, GET, POST
- Query params: assetId, galleryId
- Prisma models: asset, photoRating
- Status codes: 400, 401, 404, 429, 500

### /api/gallery/verify-password
- File: `src/app/api/gallery/verify-password/route.ts`
- Methods: GET, POST
- Query params: galleryId
- Prisma models: project
- Status codes: 400, 401, 404, 500

### /api/images/process
- File: `src/app/api/images/process/route.ts`
- Methods: POST
- Prisma models: asset
- External services: clerk, r2
- Status codes: 400, 401, 500

### /api/integrations/dropbox/authorize
- File: `src/app/api/integrations/dropbox/authorize/route.ts`
- Methods: GET
- External services: clerk, dropbox

### /api/integrations/dropbox/callback
- File: `src/app/api/integrations/dropbox/callback/route.ts`
- Methods: GET
- Query params: code, error, error_description, state
- Prisma models: dropboxIntegration, organization, user
- External services: clerk, dropbox

### /api/integrations/dropbox/webhook
- File: `src/app/api/integrations/dropbox/webhook/route.ts`
- Methods: GET, POST
- Query params: challenge
- Action modules:
  - `@/lib/actions/dropbox`
- External services: dropbox
- Status codes: 200, 400, 403, 500

### /api/integrations/gmail/authorize
- File: `src/app/api/integrations/gmail/authorize/route.ts`
- Methods: GET
- Prisma models: organization
- External services: clerk, gmail, google

### /api/integrations/gmail/callback
- File: `src/app/api/integrations/gmail/callback/route.ts`
- Methods: GET
- Query params: code, error, state
- Prisma models: emailAccount, integrationLog
- External services: clerk, gmail

### /api/integrations/google/authorize
- File: `src/app/api/integrations/google/authorize/route.ts`
- Methods: GET
- External services: clerk, google

### /api/integrations/google/callback
- File: `src/app/api/integrations/google/callback/route.ts`
- Methods: GET
- Query params: code, error, error_description, state
- Prisma models: calendarIntegration, organization
- External services: clerk, google

### /api/integrations/slack
- File: `src/app/api/integrations/slack/route.ts`
- Methods: POST

### /api/invoices/bulk-pdf
- File: `src/app/api/invoices/bulk-pdf/route.ts`
- Methods: POST
- Prisma models: invoice
- External services: clerk
- Status codes: 401, 404, 500

### /api/payments/bulk-pdf
- File: `src/app/api/payments/bulk-pdf/route.ts`
- Methods: POST
- Prisma models: payment
- External services: clerk
- Status codes: 401, 404, 500

### /api/portfolio/comments
- File: `src/app/api/portfolio/comments/route.ts`
- Methods: GET, POST
- Query params: projectId, sectionId, slug
- Prisma models: portfolioComment, portfolioWebsite
- Status codes: 400, 403, 404, 500

### /api/portfolio/export
- File: `src/app/api/portfolio/export/route.ts`
- Methods: GET
- Query params: format, portfolioId, timeRange
- Prisma models: portfolioWebsite, portfolioWebsiteView
- External services: clerk
- Status codes: 400, 401, 404, 500

### /api/portfolio/lead-capture
- File: `src/app/api/portfolio/lead-capture/route.ts`
- Methods: POST
- Prisma models: portfolioLead, portfolioWebsite
- Status codes: 400, 404, 500

### /api/portfolio/track
- File: `src/app/api/portfolio/track/route.ts`
- Methods: POST
- Action modules:
  - `@/lib/actions/portfolio-websites`
- Status codes: 400, 500

### /api/telemetry
- File: `src/app/api/telemetry/route.ts`
- Methods: POST
- Status codes: 204

### /api/unsubscribe
- File: `src/app/api/unsubscribe/route.ts`
- Methods: GET, POST
- Query params: token
- Prisma models: client
- Status codes: 400, 404, 500

### /api/upload/booking-form
- File: `src/app/api/upload/booking-form/route.ts`
- Methods: POST
- Prisma models: bookingForm
- Status codes: 400, 404, 500

### /api/upload/complete
- File: `src/app/api/upload/complete/route.ts`
- Methods: POST
- Prisma models: activityLog, asset, project
- External services: clerk, r2
- Status codes: 400, 401, 404, 500

### /api/upload/presigned-url
- File: `src/app/api/upload/presigned-url/route.ts`
- Methods: POST
- Prisma models: project
- External services: clerk, r2
- Status codes: 400, 401, 403, 404, 500

### /api/upload/profile-photo
- File: `src/app/api/upload/profile-photo/route.ts`
- Methods: POST
- Prisma models: user
- External services: clerk, r2
- Status codes: 400, 401, 404, 500

### /api/webhooks/clerk
- File: `src/app/api/webhooks/clerk/route.ts`
- Methods: POST
- Action modules:
  - `@/lib/actions/platform-referrals`
- Prisma models: user
- External services: clerk
- Status codes: 400, 500

### /api/webhooks/railway
- File: `src/app/api/webhooks/railway/route.ts`
- Methods: GET, POST
- Status codes: 401, 500

### /api/webhooks/resend
- File: `src/app/api/webhooks/resend/route.ts`
- Methods: GET, POST
- Prisma models: emailLog
- External services: resend
- Status codes: 401, 500

### /api/webhooks/stripe
- File: `src/app/api/webhooks/stripe/route.ts`
- Methods: POST
- Action modules:
  - `@/lib/actions/platform-referrals`
  - `@/lib/actions/slack`
- Prisma models: activityLog, deliveryLink, order, organization, payment, project
- External services: stripe
- Status codes: 400, 500

### /api/webhooks/twilio/status
- File: `src/app/api/webhooks/twilio/status/route.ts`
- Methods: GET, POST
- Query params: logId
- Prisma models: sMSLog
- External services: twilio
- Status codes: 200, 400, 500

## API Endpoints Inventory
- `GET, POST /api/admin/seed-questionnaire-templates`
- `GET /api/auth/client`
- `GET /api/auth/client/dev-bypass`
- `GET /api/calendar/ical/[token]`
- `POST /api/contracts/bulk-pdf`
- `GET, POST /api/cron/booking-followups`
- `GET, POST /api/cron/email-sync`
- `GET, POST /api/cron/gallery-auto-archive`
- `GET, POST /api/cron/gallery-expiration`
- `GET, POST /api/cron/gallery-reminders`
- `GET, POST /api/cron/invoice-reminders`
- `GET, POST /api/cron/late-fees`
- `GET, POST /api/cron/photographer-digest`
- `GET, POST /api/cron/portfolio-digest`
- `GET, POST /api/cron/portfolio-publish`
- `GET, POST /api/cron/questionnaire-reminders`
- `GET, POST /api/cron/recurring-invoices`
- `GET, POST /api/cron/scheduled-invoices`
- `GET, POST /api/cron/send-reminders`
- `GET /api/download/[assetId]`
- `POST /api/download/batch`
- `GET /api/email-preview`
- `POST /api/forms/submit`
- `GET /api/gallery/[id]/analytics-report`
- `GET /api/gallery/[id]/download-history`
- `GET /api/gallery/[id]/favorites-export`
- `GET /api/gallery/[id]/proof-sheet`
- `DELETE, GET, POST /api/gallery/comment`
- `GET, POST /api/gallery/favorite`
- `POST /api/gallery/feedback`
- `DELETE, GET, POST /api/gallery/rating`
- `GET, POST /api/gallery/verify-password`
- `POST /api/images/process`
- `GET /api/integrations/dropbox/authorize`
- `GET /api/integrations/dropbox/callback`
- `GET, POST /api/integrations/dropbox/webhook`
- `GET /api/integrations/gmail/authorize`
- `GET /api/integrations/gmail/callback`
- `GET /api/integrations/google/authorize`
- `GET /api/integrations/google/callback`
- `POST /api/integrations/slack`
- `POST /api/invoices/bulk-pdf`
- `POST /api/payments/bulk-pdf`
- `GET, POST /api/portfolio/comments`
- `GET /api/portfolio/export`
- `POST /api/portfolio/lead-capture`
- `POST /api/portfolio/track`
- `POST /api/telemetry`
- `GET, POST /api/unsubscribe`
- `POST /api/upload/booking-form`
- `POST /api/upload/complete`
- `POST /api/upload/presigned-url`
- `POST /api/upload/profile-photo`
- `POST /api/webhooks/clerk`
- `GET, POST /api/webhooks/railway`
- `GET, POST /api/webhooks/resend`
- `POST /api/webhooks/stripe`
- `GET, POST /api/webhooks/twilio/status`

## Server Action Specs
- Signatures are extracted from exported functions and constants.
- Auth helpers and Prisma model usage are file-level heuristics.

### ab-testing.ts
- File: `src/lib/actions/ab-testing.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: aBTestAssignment, portfolioABTest, portfolioWebsite
- Exported signatures:
  - `export async function getABTests(portfolioId?: string)`
  - `export async function getABTest(testId: string)`
  - `export async function createABTest(input: CreateABTestInput)`
  - `export async function updateABTest(testId: string, input: UpdateABTestInput)`
  - `export async function deleteABTest(testId: string)`
  - `export async function startABTest(testId: string)`
  - `export async function pauseABTest(testId: string)`
  - `export async function completeABTest(testId: string, winningVariant?: "control" | "variant")`
  - `export async function getABTestVariant( portfolioSlug: string, visitorId: string ): Promise<`
  - `export async function recordABTestConversion( testId: string, visitorId: string ): Promise<VoidActionResult>`
  - `export async function getABTestStats(testId: string)`

### activity.ts
- File: `src/lib/actions/activity.ts`
- Auth helpers: requireOrganizationId
- Prisma models: activityLog, user
- Exported signatures:
  - `export async function getActivityLogs( limit: number = 50, offset: number = 0 ): Promise<ActionResult<`
  - `export async function getActivityFeed( filters?: ActivityFeedFilters, pagination?:`
  - `export async function getActivitySummary(): Promise<ActionResult<ActivitySummary>>`
  - `export async function getActivityTimeline( days: number = 7 ): Promise< ActionResult<`
  - `export async function searchActivities( query: string, limit: number = 20 ): Promise<ActionResult<ActivityData[]>>`
  - `export async function getEntityActivities( entityType: "client" | "project" | "booking" | "invoice" | "contract", entityId: string, limit: number = 50 ): Promise<ActionResult<ActivityData[]>>`

### addons.ts
- File: `src/lib/actions/addons.ts`
- Auth helpers: requireOrganizationId
- Prisma models: service, serviceAddon, serviceAddonCompat, serviceBundleItem
- Exported signatures:
  - `export async function createAddon( input: CreateAddonInput ): Promise<ActionResult<`
  - `export async function updateAddon( input: UpdateAddonInput ): Promise<ActionResult<`
  - `export async function deleteAddon( id: string, force: boolean = false ): Promise<ActionResult>`
  - `export async function toggleAddonStatus( id: string ): Promise<ActionResult<`
  - `export async function setAddonCompatibility( input: AddonCompatibilityInput ): Promise<ActionResult<`
  - `export async function getCompatibleAddons( serviceIds: string[] ): Promise<ActionResult<CompatibleAddon[]>>`
  - `export async function getSuggestedAddons(params:`
  - `export async function getAddons(filters?: AddonFilters)`
  - `export async function getAddon(id: string)`
  - `export async function reorderAddons( addonIds: string[] ): Promise<ActionResult>`

### analytics-report.ts
- File: `src/lib/actions/analytics-report.ts`
- Prisma models: client, invoice, organization, payment, project
- External services: clerk
- Exported signatures:
  - `export async function generateAnalyticsReportPdf(): Promise<`

### analytics.ts
- File: `src/lib/actions/analytics.ts`
- Prisma models: client, invoice, organization, payment, project
- External services: clerk
- Exported signatures:
  - `export async function getRevenueForecast()`
  - `export async function getClientLTVMetrics()`
  - `export async function getDashboardAnalytics()`
  - `export async function generateRevenueReport(options:`
  - `export async function exportReportAsCSV(reportData:`

### api-keys.ts
- File: `src/lib/actions/api-keys.ts`
- Prisma models: apiKey, organization
- External services: clerk
- Exported signatures:
  - `export async function getApiKeys()`
  - `export async function generateNewApiKey(params:`
  - `export async function revokeApiKey(keyId: string)`
  - `export async function deleteApiKey(keyId: string)`
  - `export async function validateApiKey(apiKeyValue: string)`
  - `export async function updateApiKey( keyId: string, params:`

### appearance.ts
- File: `src/lib/actions/appearance.ts`
- Prisma models: user
- External services: clerk
- Exported signatures:
  - `export async function getAppearancePreferences(): Promise<ActionResult<AppearancePreferences>>`
  - `export async function updateAppearancePreferences( preferences: Partial<AppearancePreferences> ): Promise<ActionResult<void>>`
  - `export async function applyThemePreset( presetId: string ): Promise<ActionResult<void>>`
  - `export async function resetAppearancePreferences(): Promise<ActionResult<void>>`

### auth-helper.ts
- File: `src/lib/actions/auth-helper.ts`
- Auth helpers: requireAdmin, requireAuth, requireOrganizationId, requireOwner, requireUserId
- External services: clerk
- Exported signatures:
  - `export async function requireAuth(): Promise<AuthContext>`
  - `export async function requireOrganizationId(): Promise<string>`
  - `export async function requireUserId(): Promise<string>`
  - `export async function requireAdmin(): Promise<AuthContext>`
  - `export async function requireOwner(): Promise<AuthContext>`

### availability.ts
- File: `src/lib/actions/availability.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: availabilityBlock, booking, bookingBuffer, user
- Exported signatures:
  - `export async function getAvailabilityBlocks(filters?:`
  - `export async function getAvailabilityBlock(id: string)`
  - `export async function createAvailabilityBlock( input: CreateAvailabilityBlockInput ): Promise<ActionResult<`
  - `export async function updateAvailabilityBlock( input: UpdateAvailabilityBlockInput ): Promise<ActionResult<`
  - `export async function deleteAvailabilityBlock(id: string): Promise<ActionResult>`
  - `export async function getBookingBuffers()`
  - `export async function getDefaultBookingBuffer()`
  - `export async function getBookingBufferForService(serviceId: string)`
  - `export async function upsertBookingBuffer( input: CreateBookingBufferInput ): Promise<ActionResult<`
  - `export async function deleteBookingBuffer(id: string): Promise<ActionResult>`
  - `export async function checkBookingConflicts( startTime: Date, endTime: Date, userId?: string, excludeBookingId?: string ): Promise<ActionResult<`
  - `export async function getExpandedAvailabilityBlocks( fromDate: Date, toDate: Date, userId?: string )`
  - `export async function addTimeOffToday( title: string = "Time Off" ): Promise<ActionResult<`
  - `export async function addWeeklyRecurringBlock( title: string, dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6, // 0 = Sunday, 6 = Saturday blockType: AvailabilityBlockType = "time_off" ): Promise<ActionResult<`
  - `export async function addHolidayBlock( title: string, date: Date ): Promise<ActionResult<`
  - `export async function submitTimeOffRequest( input: TimeOffRequestInput ): Promise<ActionResult<`
  - `export async function getPendingTimeOffCount(): Promise<ActionResult<number>>`
  - `export async function getPendingTimeOffRequests()`
  - `export async function getTimeOffRequests(filters?:`
  - `export async function approveTimeOffRequest(id: string): Promise<ActionResult>`
  - `export async function rejectTimeOffRequest( id: string, rejectionNote?: string ): Promise<ActionResult>`
  - `export async function getMyTimeOffRequests()`
  - `export async function cancelTimeOffRequest(id: string): Promise<ActionResult>`

### booking-crew.ts
- File: `src/lib/actions/booking-crew.ts`
- Prisma models: booking, bookingCrew, organization, organizationMember, user
- External services: clerk
- Exported signatures:
  - `export async function getBookingCrew(bookingId: string): Promise<ActionResult<`
  - `export async function getAvailableCrewMembers( bookingId: string ): Promise<ActionResult<`
  - `export async function addCrewMember( input: AddCrewMemberInput ): Promise<ActionResult<`
  - `export async function updateCrewMember( input: UpdateCrewMemberInput ): Promise<ActionResult<void>>`
  - `export async function removeCrewMember(crewId: string): Promise<ActionResult<void>>`
  - `export async function confirmCrewAssignment(crewId: string): Promise<ActionResult<void>>`
  - `export async function declineCrewAssignment( crewId: string, reason?: string ): Promise<ActionResult<void>>`
  - `export async function getMyCrewAssignments(): Promise<ActionResult<`

### booking-forms.ts
- File: `src/lib/actions/booking-forms.ts`
- Auth helpers: requireOrganizationId
- Prisma models: booking, bookingForm, bookingFormField, bookingFormService, bookingFormSubmission, client, organization, service
- Exported signatures:
  - `export async function createBookingForm( input: CreateBookingFormInput ): Promise<ActionResult<`
  - `export async function updateBookingForm( input: UpdateBookingFormInput ): Promise<ActionResult<`
  - `export async function deleteBookingForm( id: string, force: boolean = false ): Promise<ActionResult>`
  - `export async function duplicateBookingForm( id: string, newName?: string, newSlug?: string ): Promise<ActionResult<`
  - `export async function toggleBookingFormStatus( id: string ): Promise<ActionResult<`
  - `export async function updateBookingFormFields( input: UpdateBookingFormFieldsInput ): Promise<ActionResult<`
  - `export async function reorderBookingFormFields( input: ReorderBookingFormFieldsInput ): Promise<ActionResult>`
  - `export async function setBookingFormServices( input: BookingFormServicesInput ): Promise<ActionResult<`
  - `export async function getBookingForms(filters?: BookingFormFilters)`
  - `export async function getBookingForm(id: string)`
  - `export async function getBookingFormBySlug(slug: string)`
  - `export async function submitBookingForm( input: SubmitBookingFormInput ): Promise<ActionResult<`
  - `export async function convertSubmissionToBooking( input: ConvertSubmissionInput ): Promise<ActionResult<`
  - `export async function rejectSubmission( input: RejectSubmissionInput ): Promise<ActionResult>`
  - `export async function getFormSubmissions( bookingFormId: string, filters?: SubmissionFilters )`
  - `export async function getAllSubmissions(filters?: SubmissionFilters)`
  - `export async function convertBookingSubmissionToClient( submissionId: string, additionalData?:`

### booking-import.ts
- File: `src/lib/actions/booking-import.ts`
- Auth helpers: requireOrganizationId
- Prisma models: activityLog, booking, client, service
- Exported signatures:
  - `export async function previewBookingImport( csvContent: string ): Promise<ActionResult<ImportPreview>>`
  - `export async function importBookings( csvContent: string, options?:`
  - `export async function getBookingImportTemplate(): Promise<ActionResult<string>>`

### booking-types.ts
- File: `src/lib/actions/booking-types.ts`
- Prisma models: booking, bookingType
- External services: clerk
- Exported signatures:
  - `export async function getBookingTypes()`
  - `export async function getBookingType(id: string)`
  - `export async function createBookingType( input: BookingTypeInput ): Promise<ActionResult<`
  - `export async function updateBookingType( id: string, input: Partial<BookingTypeInput> ): Promise<ActionResult>`
  - `export async function deleteBookingType(id: string): Promise<ActionResult>`
  - `export async function seedDefaultBookingTypes(): Promise<ActionResult>`

### bookings.ts
- File: `src/lib/actions/bookings.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: activityLog, availabilityBlock, booking, bookingBuffer, bookingReminder, client, organization, service
- External services: clerk, slack
- Exported signatures:
  - `export async function getBooking(id: string)`
  - `export async function getBookings(filters?:`
  - `export async function createBooking( input: CreateBookingInput ): Promise<ActionResult<`
  - `export async function updateBooking( input: UpdateBookingInput ): Promise<ActionResult<`
  - `export async function updateBookingStatus( id: string, status: BookingStatus ): Promise<ActionResult>`
  - `export async function confirmBooking( id: string, options?:`
  - `export async function deleteBooking(id: string): Promise<ActionResult>`
  - `export async function getClientsForBooking()`
  - `export async function getServicesForBooking()`
  - `export async function getScheduleStats()`
  - `export async function createRecurringBooking( input: CreateBookingInput ): Promise<ActionResult<`
  - `export async function getBookingSeries(seriesId: string)`
  - `export async function updateBookingSeries( seriesId: string, updates:`
  - `export async function deleteBookingSeries( seriesId: string, deleteFutureOnly: boolean = true ): Promise<ActionResult<`
  - `export async function removeFromSeries(bookingId: string): Promise<ActionResult>`
  - `export async function createBookingReminders( bookingId: string, reminders: ReminderInput[] ): Promise<ActionResult<`
  - `export async function getBookingReminders( bookingId: string ): Promise<ActionResult<`
  - `export async function deleteBookingReminder( reminderId: string ): Promise<ActionResult>`
  - `export async function updateBookingReminders( bookingId: string, reminders: ReminderInput[] ): Promise<ActionResult<`
  - `export async function getPendingReminders(): Promise<ActionResult<`
  - `export async function markReminderSent( reminderId: string, errorMessage?: string ): Promise<ActionResult>`
  - `export async function createMultiDayEvent( input: CreateMultiDayEventInput ): Promise<ActionResult<`
  - `export async function getMultiDayEvent( eventId: string ): Promise<ActionResult<`
  - `export async function addSessionToMultiDayEvent( eventId: string, session: MultiDaySession ): Promise<ActionResult<`
  - `export async function updateMultiDaySession( sessionId: string, updates: Partial<MultiDaySession> ): Promise<ActionResult>`
  - `export async function deleteMultiDaySession( sessionId: string ): Promise<ActionResult>`
  - `export async function deleteMultiDayEvent( eventId: string ): Promise<ActionResult>`
  - `export async function getMultiDayEvents(): Promise< ActionResult< Array<`
  - `export async function checkBookingConflicts(params:`
  - `export async function getConflictsInRange(params:`
  - `export async function validateBookingTime(params:`

### brokerage-contracts.ts
- File: `src/lib/actions/brokerage-contracts.ts`
- Auth helpers: requireOrganizationId
- Prisma models: brokerage, brokerageContract
- Exported signatures:
  - `export async function getBrokerageContracts( brokerageId: string ): Promise<ActionResult<BrokerageContractWithRelations[]>>`
  - `export async function getBrokerageContract( id: string ): Promise<ActionResult<BrokerageContractWithRelations>>`
  - `export async function getActiveBrokerageContract( brokerageId: string ): Promise<ActionResult<BrokerageContractWithRelations | null>>`
  - `export async function createBrokerageContract( input: CreateContractInput ): Promise<ActionResult<BrokerageContractWithRelations>>`
  - `export async function updateBrokerageContract( input: UpdateContractInput ): Promise<ActionResult<BrokerageContractWithRelations>>`
  - `export async function deleteBrokerageContract(id: string): Promise<ActionResult<void>>`
  - `export async function calculateBrokeragePrice( serviceId: string, brokerageId: string, basePriceCents: number ): Promise<ActionResult<`

### brokerages.ts
- File: `src/lib/actions/brokerages.ts`
- Auth helpers: requireOrganizationId
- Prisma models: brokerage, client
- Exported signatures:
  - `export async function getBrokerages(options?:`
  - `export async function getBrokerage( id: string ): Promise<ActionResult<BrokerageWithRelations>>`
  - `export async function getBrokerageBySlug( slug: string ): Promise<ActionResult<BrokerageWithRelations>>`
  - `export async function getBrokerageAgents(brokerageId: string): Promise< ActionResult< Array<`
  - `export async function createBrokerage( input: CreateBrokerageInput ): Promise<ActionResult<BrokerageWithRelations>>`
  - `export async function updateBrokerage( input: UpdateBrokerageInput ): Promise<ActionResult<BrokerageWithRelations>>`
  - `export async function deleteBrokerage(id: string): Promise<ActionResult<void>>`
  - `export async function assignAgentToBrokerage( clientId: string, brokerageId: string | null ): Promise<ActionResult<void>>`
  - `export async function getBrokerageStats(): Promise< ActionResult<`

### bundles.ts
- File: `src/lib/actions/bundles.ts`
- Auth helpers: requireOrganizationId
- Prisma models: booking, bundlePricingTier, service, serviceBundle, serviceBundleItem
- External services: stripe
- Exported signatures:
  - `export async function createBundle( input: CreateBundleInput ): Promise<ActionResult<`
  - `export async function updateBundle( input: UpdateBundleInput ): Promise<ActionResult<`
  - `export async function deleteBundle( id: string, force: boolean = false ): Promise<ActionResult>`
  - `export async function duplicateBundle( id: string, newName?: string, newSlug?: string ): Promise<ActionResult<`
  - `export async function toggleBundleStatus( id: string ): Promise<ActionResult<`
  - `export async function setBundleServices( input: BundleServicesInput ): Promise<ActionResult<`
  - `export async function addServiceToBundle( bundleId: string, serviceId: string, isRequired: boolean = true, quantity: number = 1 ): Promise<ActionResult>`
  - `export async function removeServiceFromBundle( bundleId: string, serviceId: string ): Promise<ActionResult>`
  - `export async function reorderBundleItems( bundleId: string, itemIds: string[] ): Promise<ActionResult>`
  - `export async function calculateBundleSavings( bundleId: string ): Promise<ActionResult<`
  - `export async function getBundles(filters?: BundleFilters)`
  - `export async function getBundle(id: string)`
  - `export async function getBundleBySlug(orgSlug: string, bundleSlug: string)`
  - `export async function setBundlePricingTiers( input: CreatePricingTiersInput ): Promise<ActionResult<`
  - `export async function getBundlePricingTiers(bundleId: string)`
  - `export async function deletePricingTier(id: string): Promise<ActionResult>`
  - `export async function calculateBundlePrice( input: CalculateBundlePriceInput ): Promise<ActionResult<BundlePriceResult>>`
  - `export async function getBundleWithPricing(bundleId: string)`
  - `export async function getPackageAnalytics( dateRange?:`
  - `export async function getPackageRecommendations(): Promise< ActionResult<`
  - `export async function createPackageFromRecommendation( name: string, serviceIds: string[], priceCents: number, options?:`
  - `export async function getPackageTemplates(): Promise< ActionResult<`

### calendar-feeds.ts
- File: `src/lib/actions/calendar-feeds.ts`
- Auth helpers: requireOrganizationId
- Prisma models: calendarFeed, user
- External services: clerk, google
- Exported signatures:
  - `export async function getCalendarFeeds(): Promise< ActionResult<CalendarFeedInfo[]> >`
  - `export async function createCalendarFeed(params:`
  - `export async function regenerateCalendarFeedToken( feedId: string ): Promise<ActionResult<`
  - `export async function updateCalendarFeed( feedId: string, params:`
  - `export async function deleteCalendarFeed( feedId: string ): Promise<ActionResult<`
  - `export async function createMyCalendarFeed(params?:`
  - `export async function getMyCalendarFeed(): Promise< ActionResult<CalendarFeedInfo | null> >`

### chat-inquiries.ts
- File: `src/lib/actions/chat-inquiries.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: client, websiteChatInquiry
- Exported signatures:
  - `export async function submitChatInquiry(input:`
  - `export async function getChatInquiries(filters?:`
  - `export async function updateChatInquiryStatus( inquiryId: string, status: "new" | "contacted" | "qualified" | "closed", notes?: string ): Promise<VoidActionResult>`
  - `export async function convertChatInquiryToClient( inquiryId: string, additionalData?:`
  - `export async function getChatInquiryStats()`

### client-auth.ts
- File: `src/lib/actions/client-auth.ts`
- Auth helpers: requireClientAuth
- Prisma models: client, clientSession
- External services: resend
- Exported signatures:
  - `export async function sendClientMagicLink(email: string): Promise<`
  - `export async function validateMagicLinkToken(token: string): Promise<`
  - `export async function getClientSession(): Promise<`
  - `export async function logoutClient(): Promise<`
  - `export async function requireClientAuth(): Promise<`

### client-communications.ts
- File: `src/lib/actions/client-communications.ts`
- Auth helpers: requireOrganizationId, requireUserId
- Prisma models: client, clientCommunication
- Exported signatures:
  - `export async function getClientCommunications( clientId: string, filters?:`
  - `export async function getCommunication(id: string)`
  - `export async function createCommunication( input: CreateCommunicationInput ): Promise<ActionResult<`
  - `export async function updateCommunication( input: UpdateCommunicationInput ): Promise<ActionResult<`
  - `export async function deleteCommunication(id: string): Promise<ActionResult>`
  - `export async function addClientNote( clientId: string, content: string ): Promise<ActionResult<`
  - `export async function logEmailSent( clientId: string, subject: string, content: string, relatedTo?:`
  - `export async function logPhoneCall( clientId: string, direction: "inbound" | "outbound", notes: string, subject?: string ): Promise<ActionResult<`
  - `export async function logMeeting( clientId: string, subject: string, notes: string, bookingId?: string ): Promise<ActionResult<`
  - `export async function getClientCommunicationStats(clientId: string)`
  - `export async function getRecentCommunications(limit: number = 10)`

### client-import.ts
- File: `src/lib/actions/client-import.ts`
- Auth helpers: requireOrganizationId
- Prisma models: client
- External services: clerk
- Exported signatures:
  - `export async function previewClientImport( csvContent: string ): Promise<ActionResult<ImportPreview>>`
  - `export async function importClients( csvContent: string, options?:`
  - `export async function getImportTemplate(): Promise<string>`

### client-merge.ts
- File: `src/lib/actions/client-merge.ts`
- Auth helpers: requireOrganizationId
- Prisma models: client
- External services: clerk
- Exported signatures:
  - `export async function findDuplicateClients(): Promise<ActionResult<`
  - `export async function getClientMergePreview( primaryClientId: string, secondaryClientId: string ): Promise<ActionResult<`
  - `export async function mergeClients( primaryClientId: string, secondaryClientId: string, options?:`
  - `export async function getDuplicateCount(): Promise<ActionResult<`

### client-notifications.ts
- File: `src/lib/actions/client-notifications.ts`
- Prisma models: client, clientNotification
- Exported signatures:
  - `export async function getClientNotifications( accessToken: string, limit: number = 20 ): Promise<ActionResult<`
  - `export async function getClientUnreadCount( accessToken: string ): Promise<ActionResult<number>>`
  - `export async function markClientNotificationAsRead( accessToken: string, notificationId: string ): Promise<ActionResult>`
  - `export async function markAllClientNotificationsAsRead( accessToken: string ): Promise<ActionResult>`
  - `export async function createClientNotification( input: CreateClientNotificationInput ): Promise<ActionResult<`
  - `export async function createClientNotificationsBatch( notifications: CreateClientNotificationInput[] ): Promise<ActionResult<`
  - `export async function cleanupOldClientNotifications( daysOld: number = 30 ): Promise<ActionResult<`
  - `export async function notifyGalleryReady( clientId: string, galleryName: string, galleryUrl: string ): Promise<ActionResult<`
  - `export async function notifyGalleryExpiring( clientId: string, galleryName: string, daysRemaining: number, galleryUrl: string ): Promise<ActionResult<`
  - `export async function notifyInvoiceSent( clientId: string, invoiceNumber: string, amount: string, invoiceUrl: string ): Promise<ActionResult<`
  - `export async function notifyPaymentConfirmed( clientId: string, amount: string, description: string ): Promise<ActionResult<`
  - `export async function notifyContractReady( clientId: string, contractName: string, contractUrl: string ): Promise<ActionResult<`
  - `export async function notifyBookingConfirmed( clientId: string, bookingTitle: string, bookingDate: string ): Promise<ActionResult<`
  - `export async function notifyBookingReminder( clientId: string, bookingTitle: string, bookingDate: string, timeUntil: string ): Promise<ActionResult<`
  - `export async function notifyQuestionnaireReady( clientId: string, questionnaireName: string, questionnaireUrl: string ): Promise<ActionResult<`

### client-portal.ts
- File: `src/lib/actions/client-portal.ts`
- Prisma models: client, clientQuestionnaire, invoice, project, propertyWebsite
- Exported signatures:
  - `export async function getClientPortalData()`
  - `export async function getClientPropertyDetails(propertyId: string)`
  - `export async function getClientGalleryDownload(galleryId: string)`

### client-questionnaires.ts
- File: `src/lib/actions/client-questionnaires.ts`
- Prisma models: booking, client, clientQuestionnaire, organization, project, questionnaireTemplate
- External services: clerk
- Exported signatures:
  - `export async function getClientQuestionnaires( filters?: ClientQuestionnaireFilters ): Promise<ActionResult<ClientQuestionnaireWithRelations[]>>`
  - `export async function getClientQuestionnairesByClient( clientId: string ): Promise<ActionResult<ClientQuestionnaireWithRelations[]>>`
  - `export async function getClientQuestionnaire( id: string ): Promise<ActionResult<ClientQuestionnaireWithRelations | null>>`
  - `export async function getQuestionnaireStats(): Promise< ActionResult<`
  - `export async function assignQuestionnaireToClient( input: AssignQuestionnaireInput ): Promise<ActionResult<`
  - `export async function updateClientQuestionnaire( input: UpdateClientQuestionnaireInput ): Promise<ActionResult<void>>`
  - `export async function approveQuestionnaire( input: ApproveQuestionnaireInput ): Promise<ActionResult<void>>`
  - `export async function deleteClientQuestionnaire( input:`
  - `export async function sendQuestionnaireReminder( id: string ): Promise<ActionResult<void>>`
  - `export async function markExpiredQuestionnaires(): Promise<ActionResult<`
  - `export async function sendBatchReminders(options?:`
  - `export async function getRemindableQuestionnairesCount(): Promise< ActionResult<`

### client-selections.ts
- File: `src/lib/actions/client-selections.ts`
- Prisma models: activityLog, galleryFavorite, organization, project
- External services: clerk
- Exported signatures:
  - `export async function getGallerySelections(projectId: string)`
  - `export async function updateSelectionSettings( projectId: string, settings:`
  - `export async function reviewSelections( projectId: string, status: "approved" | "rejected" )`
  - `export async function exportSelectionsCSV(projectId: string)`
  - `export async function getClientSelections(projectId: string, deliverySlug?: string)`
  - `export async function toggleSelection( projectId: string, assetId: string, deliverySlug?: string )`
  - `export async function updateSelectionNotes( projectId: string, assetId: string, notes: string, deliverySlug?: string )`
  - `export async function submitSelections(projectId: string, deliverySlug?: string)`
  - `export async function resetSelections(projectId: string, deliverySlug?: string)`

### client-tags.ts
- File: `src/lib/actions/client-tags.ts`
- Auth helpers: requireOrganizationId
- Prisma models: client, clientTag, clientTagAssignment
- Exported signatures:
  - `export async function getClientTags()`
  - `export async function getClientTag(id: string)`
  - `export async function createClientTag( input: CreateTagInput ): Promise<ActionResult<`
  - `export async function updateClientTag( input: UpdateTagInput ): Promise<ActionResult<`
  - `export async function deleteClientTag(id: string): Promise<ActionResult>`
  - `export async function getTagsForClient(clientId: string)`
  - `export async function assignTagToClient( clientId: string, tagId: string ): Promise<ActionResult<`
  - `export async function removeTagFromClient( clientId: string, tagId: string ): Promise<ActionResult>`
  - `export async function setClientTags( clientId: string, tagIds: string[] ): Promise<ActionResult>`
  - `export async function bulkAssignTag( clientIds: string[], tagId: string ): Promise<ActionResult<`
  - `export async function bulkRemoveTag( clientIds: string[], tagId: string ): Promise<ActionResult<`
  - `export async function getClientsByTag(tagId: string)`
  - `export async function getClientsByTags(tagIds: string[])`
  - `export async function createDefaultTags(): Promise<ActionResult<`

### clients.ts
- File: `src/lib/actions/clients.ts`
- Auth helpers: requireAdmin, requireAuth, requireOrganizationId
- Prisma models: activityLog, client, clientSession, clientTag, payment
- Exported signatures:
  - `export async function getClient(id: string)`
  - `export async function getClients(filters?:`
  - `export async function createClient( input: CreateClientInput ): Promise<ActionResult<`
  - `export async function updateClient( input: UpdateClientInput ): Promise<ActionResult<`
  - `export async function impersonateClientPortal( clientId: string ): Promise<ActionResult<`
  - `export async function updateClientEmailPreferences( input: UpdateClientPreferencesInput ): Promise<ActionResult<`
  - `export async function getClientEmailPreferences(clientId: string)`
  - `export async function deleteClient( id: string, force: boolean = false ): Promise<ActionResult>`
  - `export async function updateClientSource( clientId: string, source: string ): Promise<ActionResult<`
  - `export async function getAcquisitionAnalytics(options?:`
  - `export async function getClientsBySource( source: string, options?:`
  - `export async function getSourcePerformance( dateRange?:`
  - `export async function bulkDeleteClients( ids: string[], force: boolean = false ): Promise<ActionResult<`
  - `export async function bulkUpdateIndustry( ids: string[], industry: ClientIndustry ): Promise<ActionResult<`
  - `export async function bulkAssignTags( clientIds: string[], tagIds: string[], mode: "add" | "replace" = "add" ): Promise<ActionResult<`
  - `export async function bulkRemoveTags( clientIds: string[], tagIds: string[] ): Promise<ActionResult<`

### contract-pdf.ts
- File: `src/lib/actions/contract-pdf.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: contract
- Exported signatures:
  - `export async function generateContractPdf(contractId: string): Promise<`

### contract-signing.ts
- File: `src/lib/actions/contract-signing.ts`
- Auth helpers: requireOrganizationId
- Prisma models: activityLog, contract, contractAuditLog, contractSignature, contractSigner, organization
- External services: resend
- Exported signatures:
  - `export async function getContractsWithSigningStatus(filters?:`
  - `export async function addContractSigner( input: CreateSignerInput ): Promise<ActionResult<`
  - `export async function removeContractSigner(signerId: string): Promise<ActionResult>`
  - `export async function resendSigningInvitation( signerId: string ): Promise<ActionResult<`
  - `export async function getContractForSigning(signingToken: string)`
  - `export async function signContract( input: SignContractInput ): Promise<ActionResult<`
  - `export async function getSigningCompletion(signingToken: string)`
  - `export async function getContractAuditLog(contractId: string)`
  - `export async function getContractSignatures(contractId: string)`
  - `export async function cancelContract(contractId: string): Promise<ActionResult>`
  - `export async function extendContractExpiration( contractId: string, newExpiresAt: Date ): Promise<ActionResult>`

### contract-templates.ts
- File: `src/lib/actions/contract-templates.ts`
- Auth helpers: requireOrganizationId
- Prisma models: contract
- Exported signatures:
  - `export async function getContractTemplates( filters?:`
  - `export async function getTemplateCategories(): Promise< ActionResult<`
  - `export async function useContractTemplate( templateId: string, variables: Record<string, string>, options?:`
  - `export async function getContractTemplateById( id: string ): Promise<ActionResult<ContractTemplateWithCount>>`
  - `export async function createContractTemplate(data:`
  - `export async function updateContractTemplate( id: string, data:`
  - `export async function deleteContractTemplate( id: string ): Promise<ActionResult<void>>`
  - `export async function duplicateContractTemplate( id: string ): Promise<ActionResult<`
  - `export async function seedDefaultContractTemplates(): Promise<ActionResult<void>>`

### contracts.ts
- File: `src/lib/actions/contracts.ts`
- Auth helpers: requireOrganizationId
- Prisma models: activityLog, contract, contractAuditLog, contractSignature, contractSigner, organization
- Exported signatures:
  - `export async function getContract(id: string)`
  - `export async function createContract( input: CreateContractInput ): Promise<ActionResult<`
  - `export async function updateContract( id: string, input: UpdateContractInput ): Promise<ActionResult>`
  - `export async function deleteContract(id: string): Promise<ActionResult>`
  - `export async function sendContract(id: string): Promise<ActionResult>`
  - `export async function duplicateContract( id: string ): Promise<ActionResult<`

### create-wizard.ts
- File: `src/lib/actions/create-wizard.ts`
- Prisma models: bookingType, client, location, service
- External services: clerk
- Exported signatures:
  - `export async function createProjectBundle( input: CreateProjectBundleInput ): Promise<ActionResult<CreateProjectBundleResult>>`
  - `export async function getWizardData()`

### credit-notes.ts
- File: `src/lib/actions/credit-notes.ts`
- Auth helpers: requireOrganizationId
- Prisma models: client, creditNote, invoice
- Exported signatures:
  - `export async function createCreditNote( input: CreateCreditNoteInput ): Promise<ActionResult<`
  - `export async function getCreditNote(creditNoteId: string): Promise< ActionResult<`
  - `export async function listCreditNotes(options?:`
  - `export async function issueCreditNote(creditNoteId: string): Promise<ActionResult<void>>`
  - `export async function applyCreditNoteToInvoice( creditNoteId: string, invoiceId: string, amountCents?: number ): Promise<ActionResult<`
  - `export async function markCreditNoteRefunded( creditNoteId: string, refundedAmountCents?: number ): Promise<ActionResult<`
  - `export async function voidCreditNote(creditNoteId: string): Promise<ActionResult<void>>`
  - `export async function deleteCreditNote(creditNoteId: string): Promise<ActionResult<void>>`
  - `export async function getClientAvailableCredit(clientId: string): Promise< ActionResult<`

### custom-forms.ts
- File: `src/lib/actions/custom-forms.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: customForm, customFormField, formSubmission, organization
- Exported signatures:
  - `export async function getForms(portfolioId?: string)`
  - `export async function getForm(formId: string)`
  - `export async function createForm(input: CreateFormInput)`
  - `export async function updateForm(formId: string, input: UpdateFormInput)`
  - `export async function deleteForm(formId: string)`
  - `export async function duplicateForm(formId: string)`
  - `export async function addFormField(formId: string, field: FormFieldInput)`
  - `export async function updateFormField(fieldId: string, updates: Partial<FormFieldInput>)`
  - `export async function deleteFormField(fieldId: string)`
  - `export async function reorderFormFields(formId: string, fieldIds: string[])`
  - `export async function getFormBySlug(slug: string)`
  - `export async function submitForm( slug: string, data: Record<string, unknown>, metadata?:`
  - `export async function getFormSubmissions( formId: string, options?:`
  - `export async function markSubmissionRead(submissionId: string)`
  - `export async function archiveSubmission(submissionId: string)`
  - `export async function deleteSubmission(submissionId: string)`
  - `export async function getFormStats(formId: string)`

### dashboard.ts
- File: `src/lib/actions/dashboard.ts`
- Prisma models: user
- External services: clerk
- Exported signatures:
  - `export async function getDashboardConfig(): Promise<`
  - `export async function updateDashboardConfig( config: DashboardConfig ): Promise<VoidActionResult>`
  - `export async function toggleSectionVisibility( sectionId: DashboardSectionId ): Promise<VoidActionResult>`
  - `export async function toggleSectionCollapsed( sectionId: DashboardSectionId ): Promise<VoidActionResult>`
  - `export async function resetDashboardConfig(): Promise<VoidActionResult>`

### discount-codes.ts
- File: `src/lib/actions/discount-codes.ts`
- Prisma models: discountCode, discountCodeUsage, organization
- External services: clerk
- Exported signatures:
  - `export async function createDiscountCode(input: CreateDiscountCodeInput)`
  - `export async function getDiscountCodes()`
  - `export async function updateDiscountCode( codeId: string, input: UpdateDiscountCodeInput )`
  - `export async function deleteDiscountCode(codeId: string)`
  - `export async function validateDiscountCode( code: string, amountCents: number, clientEmail?: string, serviceId?: string )`
  - `export async function recordDiscountCodeUsage( discountCodeId: string, discountAmount: number, invoiceId?: string, paymentId?: string, clientEmail?: string )`

### download-tracking.ts
- File: `src/lib/actions/download-tracking.ts`
- Prisma models: asset, downloadLog, organization, photoRating, project
- External services: clerk
- Exported signatures:
  - `export async function logDownload(input: LogDownloadInput)`
  - `export async function sendReceiptForDownload(downloadLogId: string)`
  - `export async function getGalleryDownloadAnalytics( projectId: string ): Promise<`
  - `export async function getDownloadHistory( projectId: string, options?:`
  - `export async function exportDownloadHistory(projectId: string)`
  - `export async function getOrganizationDownloadStats( dateRange?:`
  - `export async function getGalleryHeatMapData(projectId: string)`

### dropbox.ts
- File: `src/lib/actions/dropbox.ts`
- Prisma models: asset, dropboxIntegration, project
- External services: clerk, dropbox, r2
- Exported signatures:
  - `export async function getDropboxConfig(): Promise<ActionResult<DropboxConfig | null>>`
  - `export async function getDropboxConnectionStatus(): Promise< ActionResult<`
  - `export async function saveDropboxConfig(data:`
  - `export async function updateDropboxSettings(data:`
  - `export async function toggleDropboxIntegration(): Promise<ActionResult<void>>`
  - `export async function testDropboxIntegration(): Promise<ActionResult<`
  - `export async function deleteDropboxIntegration(): Promise<ActionResult<void>>`
  - `export async function listDropboxFolder( path: string = "" ): Promise<ActionResult<DropboxEntry[]>>`
  - `export async function createDropboxFolder( folderName: string, parentPath?: string ): Promise<ActionResult<`
  - `export async function getDropboxDownloadLink( path: string ): Promise<ActionResult<`
  - `export async function ensureDropboxRootFolder(): Promise<ActionResult<`
  - `export async function updateSyncCursor(cursor: string): Promise<ActionResult<void>>`
  - `export async function recordSyncError(errorMessage: string): Promise<ActionResult<void>>`
  - `export async function syncDropboxChangesForAccount( dropboxAccountId: string ): Promise<`

### email-accounts.ts
- File: `src/lib/actions/email-accounts.ts`
- Prisma models: emailAccount
- External services: clerk, gmail
- Exported signatures:
  - `export async function getConnectedEmailAccounts(): Promise<`
  - `export async function disconnectEmailAccount( accountId: string ): Promise<VoidActionResult>`
  - `export async function toggleEmailAccountSync( accountId: string, enabled: boolean ): Promise<VoidActionResult>`
  - `export async function getEmailAccount( accountId: string ): Promise<`

### email-logs.ts
- File: `src/lib/actions/email-logs.ts`
- Prisma models: booking, clientQuestionnaire, clientQuestionnaireAgreement, clientQuestionnaireResponse, contract, emailLog, order, organization, project
- External services: clerk, resend
- Exported signatures:
  - `export async function createEmailLog(params:`
  - `export async function updateEmailLogStatus( logId: string, status: EmailStatus, resendId?: string, errorMessage?: string )`
  - `export async function getEmailLogs(options?:`
  - `export async function getEmailStats()`
  - `export async function logEmailSent(params:`
  - `export async function getQuestionnaireEmailActivity(questionnaireId: string)`
  - `export async function getClientEmailLogs(clientId: string, options?:`
  - `export async function getClientEmailHealth(clientId: string)`
  - `export async function getQuestionnaireDigestData(organizationId: string)`
  - `export async function resendEmail(logId: string)`
  - `export async function getEmailLog(logId: string)`

### email-settings.ts
- File: `src/lib/actions/email-settings.ts`
- Prisma models: organization
- External services: clerk, resend
- Exported signatures:
  - `export async function getEmailSettings()`
  - `export async function updateEmailSettings(data: EmailSettings)`
  - `export async function sendTestEmail(toEmail: string)`

### email-sync.ts
- File: `src/lib/actions/email-sync.ts`
- Prisma models: client, emailAccount, emailMessage, emailThread
- External services: clerk, gmail
- Exported signatures:
  - `export async function triggerEmailSync(options?:`
  - `export async function getEmailThreads(options?:`
  - `export async function getEmailThread(threadId: string): Promise<`
  - `export async function markThreadRead( threadId: string, read: boolean ): Promise<VoidActionResult>`
  - `export async function toggleThreadStar( threadId: string ): Promise<`
  - `export async function toggleThreadArchive( threadId: string ): Promise<`
  - `export async function sendEmailReply( threadId: string, body: string ): Promise<VoidActionResult>`
  - `export async function sendNewEmail(options:`
  - `export async function getOrganizationSyncStatus()`
  - `export async function linkThreadToClient( threadId: string, clientId: string | null ): Promise<VoidActionResult>`

### equipment-checklists.ts
- File: `src/lib/actions/equipment-checklists.ts`
- Auth helpers: requireOrganizationId
- Prisma models: booking, bookingEquipmentCheck, bookingType, bookingTypeEquipmentRequirement, equipment, user
- External services: clerk
- Exported signatures:
  - `export async function getBookingTypeEquipmentRequirements( bookingTypeId: string ): Promise< ActionResult< Array<`
  - `export async function setBookingTypeEquipmentRequirements( bookingTypeId: string, requirements: EquipmentRequirementInput[] ): Promise<ActionResult>`
  - `export async function addEquipmentRequirement( bookingTypeId: string, requirement: EquipmentRequirementInput ): Promise<ActionResult<`
  - `export async function removeEquipmentRequirement( requirementId: string ): Promise<ActionResult>`
  - `export async function getBookingEquipmentChecklist( bookingId: string ): Promise< ActionResult< Array<`
  - `export async function toggleEquipmentCheck( bookingId: string, equipmentId: string, isChecked: boolean ): Promise<ActionResult<`
  - `export async function checkAllEquipment( bookingId: string ): Promise<ActionResult<`
  - `export async function uncheckAllEquipment( bookingId: string ): Promise<ActionResult>`
  - `export async function getBookingChecklistSummaries( bookingIds: string[] ): Promise< ActionResult< Array<`
  - `export async function updateEquipmentCheckNote( bookingId: string, equipmentId: string, notes: string | null ): Promise<ActionResult>`

### equipment.ts
- File: `src/lib/actions/equipment.ts`
- Prisma models: booking, bookingEquipmentCheck, equipment, organization, organizationMember, service, serviceEquipmentRequirement, userEquipment
- Exported signatures:
  - `export async function createEquipment( input: z.infer<typeof createEquipmentSchema> ): Promise<ActionResult<`
  - `export async function updateEquipment( input: z.infer<typeof updateEquipmentSchema> ): Promise<ActionResult<`
  - `export async function deleteEquipment(id: string): Promise<ActionResult>`
  - `export async function getEquipment(id: string)`
  - `export async function getEquipmentList(filters?:`
  - `export async function getEquipmentByCategory()`
  - `export async function assignEquipmentToUser( userId: string, equipmentId: string, notes?: string ): Promise<ActionResult<`
  - `export async function unassignEquipmentFromUser( userId: string, equipmentId: string ): Promise<ActionResult>`
  - `export async function getUserEquipment(userId: string)`
  - `export async function addServiceEquipmentRequirement( serviceId: string, equipmentId: string, isRequired: boolean = true ): Promise<ActionResult<`
  - `export async function removeServiceEquipmentRequirement( serviceId: string, equipmentId: string ): Promise<ActionResult>`
  - `export async function getServiceEquipmentRequirements(serviceId: string)`
  - `export async function getEquipmentUsageStats(options?:`
  - `export async function getEquipmentUsageTimeline(options?:`
  - `export async function getUpcomingEquipmentNeeds(days: number = 7)`

### estimates.ts
- File: `src/lib/actions/estimates.ts`
- Auth helpers: requireOrganizationId
- Prisma models: client, estimate, invoice
- Exported signatures:
  - `export async function createEstimate( input: CreateEstimateInput ): Promise<ActionResult<EstimateWithLineItems>>`
  - `export async function getEstimate( estimateId: string ): Promise<ActionResult<EstimateWithLineItems>>`
  - `export async function listEstimates(options?:`
  - `export async function updateEstimate( estimateId: string, input: UpdateEstimateInput ): Promise<ActionResult<EstimateWithLineItems>>`
  - `export async function deleteEstimate( estimateId: string ): Promise<ActionResult<void>>`
  - `export async function sendEstimate( estimateId: string ): Promise<ActionResult<Estimate>>`
  - `export async function markEstimateViewed( estimateId: string ): Promise<ActionResult<Estimate>>`
  - `export async function approveEstimate( estimateId: string ): Promise<ActionResult<Estimate>>`
  - `export async function rejectEstimate( estimateId: string, reason?: string ): Promise<ActionResult<Estimate>>`
  - `export async function convertEstimateToInvoice( estimateId: string, options?:`
  - `export async function duplicateEstimate( estimateId: string ): Promise<ActionResult<EstimateWithLineItems>>`
  - `export async function getEstimateStats(): Promise< ActionResult<`

### field-operations.ts
- File: `src/lib/actions/field-operations.ts`
- Prisma models: booking, bookingCheckIn
- External services: clerk
- Exported signatures:
  - `export async function getTodaysBookings(): Promise<ActionResult<FieldBooking[]>>`
  - `export async function getUpcomingBookings(days: number = 7): Promise<ActionResult<FieldBooking[]>>`
  - `export async function checkIn(data: CheckInData): Promise<ActionResult<`
  - `export async function checkOut(data: CheckOutData): Promise<ActionResult<`
  - `export async function addFieldNote( bookingId: string, note: string ): Promise<ActionResult<void>>`

### galleries.ts
- File: `src/lib/actions/galleries.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: activityLog, asset, deliveryLink, galleryComment, galleryFavorite, organization, project
- External services: r2
- Exported signatures:
  - `export async function createGallery( input: CreateGalleryInput ): Promise<ActionResult<`
  - `export async function updateGallery( input: UpdateGalleryInput ): Promise<ActionResult<`
  - `export async function deleteGallery( id: string, force: boolean = false ): Promise<ActionResult>`
  - `export async function duplicateGallery( id: string, newName?: string, includePhotos: boolean = false ): Promise<ActionResult<`
  - `export async function archiveGallery( id: string, archive: boolean = true ): Promise<ActionResult<`
  - `export async function deliverGallery( id: string, sendEmail: boolean = true, message?: string ): Promise<ActionResult<`
  - `export async function bulkArchiveGalleries( ids: string[], archive: boolean = true ): Promise<ActionResult<`
  - `export async function bulkDeleteGalleries( ids: string[], force: boolean = false ): Promise<ActionResult<`
  - `export async function getGalleries(filters?: GalleryFilters)`
  - `export async function getGallery(id: string)`
  - `export async function reorderPhotos( projectId: string, assetIds: string[] ): Promise<ActionResult>`
  - `export async function deletePhoto( projectId: string, assetId: string ): Promise<ActionResult>`
  - `export async function getPublicGallery(slugOrId: string, isPreview: boolean = false)`
  - `export async function recordGalleryView(slug: string): Promise<ActionResult>`
  - `export async function recordDownload( projectId: string, assetId?: string ): Promise<ActionResult>`
  - `export async function getGalleryCounts(): Promise<`
  - `export async function bulkToggleWatermark( projectId: string, assetIds: string[], excludeFromWatermark: boolean ): Promise<ActionResult<`
  - `export async function getWatermarkExclusions( projectId: string ): Promise<ActionResult<Record<string, boolean>>>`

### gallery-activity.ts
- File: `src/lib/actions/gallery-activity.ts`
- Prisma models: activityLog, asset, downloadLog, galleryFavorite, organization, payment, project
- External services: clerk
- Exported signatures:
  - `export async function getGalleryActivityTimeline( projectId: string, options?:`
  - `export async function getGalleryActivitySummary(projectId: string)`

### gallery-addons.ts
- File: `src/lib/actions/gallery-addons.ts`
- Prisma models: activityLog, galleryAddon, galleryAddonRequest, organization, organizationMember, project
- External services: clerk
- Exported signatures:
  - `export async function getGalleryAddons()`
  - `export async function createGalleryAddon(data: GalleryAddonInput)`
  - `export async function updateGalleryAddon(id: string, data: Partial<GalleryAddonInput>)`
  - `export async function deleteGalleryAddon(id: string)`
  - `export async function reorderGalleryAddons(orderedIds: string[])`
  - `export async function getGalleryAddonRequestsAdmin(projectId: string)`
  - `export async function getAllAddonRequests(status?: GalleryAddonRequestStatus)`
  - `export async function sendAddonQuote( requestId: string, quoteCents: number, quoteDescription?: string )`
  - `export async function startAddonRequest(requestId: string)`
  - `export async function completeAddonRequest(requestId: string, deliveryNote?: string)`
  - `export async function cancelAddonRequest(requestId: string)`
  - `export async function getAvailableAddons(projectId: string, deliverySlug?: string)`
  - `export async function requestAddon(data: AddonRequestInput, deliverySlug?: string)`
  - `export async function getClientAddonRequests(projectId: string, deliverySlug?: string)`
  - `export async function approveAddonQuote(requestId: string, deliverySlug?: string)`
  - `export async function declineAddonQuote(requestId: string, deliverySlug?: string)`
  - `export async function getDefaultAddonsForIndustry(industry: ClientIndustry): Promise<GalleryAddonInput[]>`

### gallery-analytics.ts
- File: `src/lib/actions/gallery-analytics.ts`
- Prisma models: activityLog, asset, organization, project
- External services: clerk
- Exported signatures:
  - `export async function getComprehensiveGalleryAnalytics(projectId: string)`
  - `export async function logGalleryView( projectId: string, data?:`
  - `export async function logPhotoView( projectId: string, assetId: string, sessionId?: string )`
  - `export async function exportGalleryAnalyticsReport( projectId: string, format: "csv" | "json" = "csv" )`

### gallery-collections.ts
- File: `src/lib/actions/gallery-collections.ts`
- Prisma models: asset, galleryCollection, organization, project
- External services: clerk
- Exported signatures:
  - `export async function getGalleryCollections(projectId: string)`
  - `export async function createGalleryCollection( projectId: string, input: GalleryCollectionInput )`
  - `export async function updateGalleryCollection( collectionId: string, input: Partial<GalleryCollectionInput> )`
  - `export async function deleteGalleryCollection(collectionId: string)`
  - `export async function addAssetsToCollection( collectionId: string, assetIds: string[] )`
  - `export async function removeAssetsFromCollection(assetIds: string[])`
  - `export async function reorderGalleryCollections( projectId: string, collectionIds: string[] )`

### gallery-expiration.ts
- File: `src/lib/actions/gallery-expiration.ts`
- Prisma models: client, expirationNotification, organization, project
- External services: clerk
- Exported signatures:
  - `export async function getExpiringSoonGalleries(daysAhead: number = 7)`
  - `export async function scheduleExpirationNotifications( projectId: string, clientEmail: string, expiresAt: Date )`
  - `export async function getPendingExpirationNotifications()`
  - `export async function markNotificationSent(notificationId: string)`
  - `export async function extendGalleryExpiration( projectId: string, additionalDays: number )`
  - `export async function sendExpirationWarningEmail( notificationId: string, projectData:`
  - `export async function processExpirationNotifications()`

### gallery-feedback.ts
- File: `src/lib/actions/gallery-feedback.ts`
- Prisma models: galleryFeedback, organization
- External services: clerk
- Exported signatures:
  - `export async function getAllFeedback(options?:`
  - `export async function getFeedbackStats(): Promise<`
  - `export async function markFeedbackAsRead(feedbackId: string): Promise<VoidActionResult>`
  - `export async function markFeedbackAsResolved(feedbackId: string): Promise<VoidActionResult>`
  - `export async function markAllFeedbackAsRead(): Promise<VoidActionResult>`
  - `export async function deleteFeedback(feedbackId: string): Promise<VoidActionResult>`

### gallery-reminders.ts
- File: `src/lib/actions/gallery-reminders.ts`
- Prisma models: activityLog, organization, project
- External services: clerk
- Exported signatures:
  - `export async function sendBatchGalleryReminders(organizationId: string)`
  - `export async function disableGalleryReminders(galleryId: string)`
  - `export async function enableGalleryReminders(galleryId: string)`
  - `export async function resetGalleryReminders(galleryId: string)`
  - `export async function sendManualGalleryReminder( galleryId: string, options?:`
  - `export async function getGalleryReminderHistory(galleryId: string)`
  - `export async function updateGalleryExpiration( galleryId: string, expiresAt: Date | null )`
  - `export async function extendGalleryExpiration(galleryId: string, days: number)`
  - `export async function getExpiringGalleries(withinDays: number = 7)`
  - `export async function getUnviewedGalleries(withinDays: number = 7)`
  - `export async function getGalleryReminderStatus(galleryId: string)`

### gallery-templates.ts
- File: `src/lib/actions/gallery-templates.ts`
- Prisma models: galleryTemplate, organization
- External services: clerk
- Exported signatures:
  - `export async function getGalleryTemplates()`
  - `export async function getGalleryTemplate(id: string)`
  - `export async function createGalleryTemplate(input: GalleryTemplateInput)`
  - `export async function updateGalleryTemplate(id: string, input: Partial<GalleryTemplateInput>)`
  - `export async function deleteGalleryTemplate(id: string)`
  - `export async function incrementTemplateUsage(id: string)`

### google-calendar.ts
- File: `src/lib/actions/google-calendar.ts`
- Prisma models: booking, calendarEvent, calendarIntegration
- External services: clerk, google
- Exported signatures:
  - `export async function getGoogleCalendarConfig(): Promise< ActionResult<GoogleCalendarConfig | null> >`
  - `export async function getGoogleCalendars( integrationId: string ): Promise<ActionResult<CalendarListItem[]>>`
  - `export async function testGoogleCalendarConnection(): Promise< ActionResult<`
  - `export async function updateGoogleCalendarSettings(data:`
  - `export async function disconnectGoogleCalendar(): Promise<ActionResult<void>>`
  - `export async function syncGoogleCalendar( integrationId: string ): Promise<ActionResult<SyncResult>>`

### integration-logs.ts
- File: `src/lib/actions/integration-logs.ts`
- Prisma models: integrationLog, organization
- External services: clerk, dropbox, slack, stripe
- Exported signatures:
  - `export async function logIntegrationEvent(params:`
  - `export async function getIntegrationLogs(options?:`
  - `export async function getProviderLogs( provider: IntegrationProvider | string, options?:`
  - `export async function getIntegrationActivitySummary()`
  - `export async function getIntegrationSyncStatus()`
  - `export async function cleanupOldIntegrationLogs(organizationId: string)`

### invitations.ts
- File: `src/lib/actions/invitations.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: invitation, organization, organizationMember, user
- External services: resend
- Exported signatures:
  - `export async function createInvitation( input: z.infer<typeof createInvitationSchema> ): Promise<ActionResult<`
  - `export async function resendInvitation( invitationId: string ): Promise<ActionResult>`
  - `export async function revokeInvitation( invitationId: string ): Promise<ActionResult>`
  - `export async function acceptInvitation( token: string, userData:`
  - `export async function getInvitationByToken(token: string)`
  - `export async function getPendingInvitations()`

### invoice-analytics.ts
- File: `src/lib/actions/invoice-analytics.ts`
- Auth helpers: requireOrganizationId
- Prisma models: invoice
- Exported signatures:
  - `export async function getRevenueByMonth(options?:`
  - `export async function getARAging(): Promise<ActionResult<ARAgingBucket[]>>`
  - `export async function getCollectionMetrics(options?:`
  - `export async function getRevenueByClient(options?:`
  - `export async function getInvoiceSummary(): Promise< ActionResult<`
  - `export async function exportInvoicesToCSV(options?:`

### invoice-attachments.ts
- File: `src/lib/actions/invoice-attachments.ts`
- Auth helpers: requireOrganizationId
- Prisma models: invoice, invoiceAttachment
- External services: r2
- Exported signatures:
  - `export async function addInvoiceAttachment( input: AddAttachmentInput ): Promise<ActionResult<InvoiceAttachment>>`
  - `export async function getInvoiceAttachments( invoiceId: string ): Promise<ActionResult<InvoiceAttachment[]>>`
  - `export async function getInvoiceAttachment( attachmentId: string ): Promise<ActionResult<InvoiceAttachment>>`
  - `export async function updateInvoiceAttachment( attachmentId: string, input: UpdateAttachmentInput ): Promise<ActionResult<InvoiceAttachment>>`
  - `export async function deleteInvoiceAttachment( attachmentId: string ): Promise<ActionResult<void>>`
  - `export async function bulkDeleteInvoiceAttachments( attachmentIds: string[] ): Promise<ActionResult<`
  - `export async function getInvoiceAttachmentStats( invoiceId: string ): Promise<ActionResult<`

### invoice-email-templates.ts
- File: `src/lib/actions/invoice-email-templates.ts`
- Auth helpers: requireOrganizationId
- Prisma models: estimate, invoice, invoiceEmailTemplate
- Exported signatures:
  - `export async function createInvoiceEmailTemplate( input: CreateEmailTemplateInput ): Promise<ActionResult<InvoiceEmailTemplate>>`
  - `export async function getInvoiceEmailTemplate( templateId: string ): Promise<ActionResult<InvoiceEmailTemplate>>`
  - `export async function listInvoiceEmailTemplates(options?:`
  - `export async function updateInvoiceEmailTemplate( templateId: string, input: UpdateEmailTemplateInput ): Promise<ActionResult<InvoiceEmailTemplate>>`
  - `export async function deleteInvoiceEmailTemplate( templateId: string ): Promise<ActionResult<void>>`
  - `export async function duplicateInvoiceEmailTemplate( templateId: string, newName?: string ): Promise<ActionResult<InvoiceEmailTemplate>>`
  - `export async function getDefaultTemplateForType( emailType: InvoiceEmailType ): Promise<ActionResult<`
  - `export async function recordTemplateUsage( templateId: string ): Promise<ActionResult<void>>`
  - `export function replaceTemplateVariables( content: string, variables: Record<string, string | number | undefined> ): string`
  - `export async function buildInvoiceEmailVariables( invoiceId: string ): Promise<ActionResult<Record<string, string>>>`
  - `export async function buildEstimateEmailVariables( estimateId: string ): Promise<ActionResult<Record<string, string>>>`
  - `export async function initializeDefaultTemplates(): Promise<ActionResult<`
  - `export async function getTemplateStats(): Promise< ActionResult<`
  - `export function getAvailableTemplateVariables()`

### invoice-payments.ts
- File: `src/lib/actions/invoice-payments.ts`
- Auth helpers: requireOrganizationId
- Prisma models: invoice, payment
- External services: clerk, stripe
- Exported signatures:
  - `export async function recordInvoicePayment(input:`
  - `export async function getInvoicePayments(invoiceId: string): Promise< ActionResult<`
  - `export async function voidPayment(paymentId: string): Promise<ActionResult>`
  - `export async function configureLateFee(input:`
  - `export async function applyLateFee(invoiceId: string): Promise< ActionResult<`
  - `export async function applyBatchLateFees(): Promise< ActionResult<`
  - `export async function waiveLateFees( invoiceId: string, reason?: string ): Promise<ActionResult<`
  - `export async function getInvoiceBalance(invoiceId: string): Promise< ActionResult<`

### invoice-pdf.ts
- File: `src/lib/actions/invoice-pdf.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: invoice
- Exported signatures:
  - `export async function generateInvoicePdf(invoiceId: string): Promise<`
  - `export async function generateInvoicePdfBuffer(invoiceId: string): Promise<`

### invoice-presets.ts
- File: `src/lib/actions/invoice-presets.ts`
- Auth helpers: requireOrganizationId
- Prisma models: invoiceTemplate
- Exported signatures:
  - `export async function createInvoicePreset( input: CreateInvoicePresetInput ): Promise<ActionResult<InvoiceTemplate>>`
  - `export async function getInvoicePreset( presetId: string ): Promise<ActionResult<InvoiceTemplate>>`
  - `export async function listInvoicePresets(options?:`
  - `export async function getPresetCategories(): Promise<ActionResult<string[]>>`
  - `export async function updateInvoicePreset( presetId: string, input: UpdateInvoicePresetInput ): Promise<ActionResult<InvoiceTemplate>>`
  - `export async function deleteInvoicePreset( presetId: string ): Promise<ActionResult<void>>`
  - `export async function duplicateInvoicePreset( presetId: string, newName?: string ): Promise<ActionResult<InvoiceTemplate>>`
  - `export async function getInvoiceDataFromPreset( presetId: string ): Promise< ActionResult<`
  - `export async function getDefaultInvoicePreset(): Promise< ActionResult<InvoiceTemplate | null> >`
  - `export async function getPopularInvoicePresets( limit: number = 5 ): Promise<ActionResult<InvoiceTemplate[]>>`

### invoice-splits.ts
- File: `src/lib/actions/invoice-splits.ts`
- Auth helpers: requireOrganizationId
- Prisma models: invoice, invoiceSplit
- Exported signatures:
  - `export async function getInvoiceSplit( invoiceId: string ): Promise<ActionResult<InvoiceSplitWithRelations | null>>`
  - `export async function getInvoiceSplits(options?:`
  - `export async function createInvoiceSplit( input: CreateInvoiceSplitInput ): Promise<ActionResult<InvoiceSplitWithRelations>>`
  - `export async function deleteInvoiceSplit(invoiceId: string): Promise<ActionResult<void>>`
  - `export async function previewInvoiceSplit( invoiceId: string, splitType: InvoiceSplitType, brokeragePayPercent?: number | null, lineItemAssignments?: Record<string, "brokerage" | "agent"> | null ): Promise<ActionResult<SplitCalculation>>`
  - `export async function getInvoiceSplitSummary(invoiceId: string): Promise< ActionResult<`

### invoice-templates.ts
- File: `src/lib/actions/invoice-templates.ts`
- Prisma models: invoiceBrandingTemplate, organization
- External services: clerk
- Exported signatures:
  - `export async function createInvoiceBrandingTemplate(input: InvoiceBrandingTemplateInput)`
  - `export async function getInvoiceTemplates()`
  - `export async function getInvoiceTemplate(templateId: string)`
  - `export async function updateInvoiceBrandingTemplate( templateId: string, input: Partial<InvoiceBrandingTemplateInput> )`
  - `export async function deleteInvoiceTemplate(templateId: string)`
  - `export async function getDefaultInvoiceTemplate()`
  - `export async function duplicateInvoiceTemplate(templateId: string)`

### invoices.ts
- File: `src/lib/actions/invoices.ts`
- Auth helpers: requireOrganizationId
- Prisma models: booking, client, invoice, invoiceLineItem, organization
- External services: clerk, resend, stripe
- Exported signatures:
  - `export async function createInvoice( input: CreateInvoiceInput ): Promise<ActionResult<`
  - `export async function generateInvoiceFromBooking( bookingId: string ): Promise<ActionResult<`
  - `export async function addTravelFeeToInvoice( invoiceId: string, bookingId: string ): Promise<ActionResult>`
  - `export async function getInvoice(invoiceId: string)`
  - `export async function getInvoices(filters?:`
  - `export async function getClientInvoices(clientId: string)`
  - `export async function updateInvoiceStatus( invoiceId: string, status: InvoiceStatus ): Promise<ActionResult>`
  - `export async function deleteInvoice(invoiceId: string): Promise<ActionResult>`
  - `export async function updateInvoice( invoiceId: string, input: UpdateInvoiceInput ): Promise<ActionResult<`
  - `export async function calculateTravelFeeForInvoice( bookingId: string ): Promise<ActionResult<`
  - `export async function sendInvoiceReminder( invoiceId: string ): Promise<ActionResult<`
  - `export async function getInvoicesNeedingReminders(): Promise<ActionResult<`
  - `export async function sendBatchInvoiceReminders( organizationId: string ): Promise<ActionResult<`
  - `export async function toggleInvoiceAutoReminders( invoiceId: string, enabled: boolean ): Promise<ActionResult>`
  - `export async function updateAllOverdueInvoices(): Promise<ActionResult<`
  - `export async function getOverdueInvoicesForDashboard(organizationId: string): Promise< ActionResult<`
  - `export async function scheduleInvoice( invoiceId: string, scheduledSendAt: Date ): Promise<ActionResult<`
  - `export async function cancelScheduledInvoice( invoiceId: string ): Promise<ActionResult<void>>`
  - `export async function processScheduledInvoices(): Promise< ActionResult<`
  - `export async function getScheduledInvoices(): Promise< ActionResult<`
  - `export async function splitInvoiceForDeposit( input: SplitInvoiceInput ): Promise< ActionResult<`
  - `export async function createInvoiceWithDeposit( input: CreateInvoiceWithDepositInput ): Promise< ActionResult<`
  - `export async function getDepositBalancePair(invoiceId: string): Promise< ActionResult<`
  - `export async function cloneInvoice( invoiceId: string, options?:`
  - `export async function bulkSendInvoices( invoiceIds: string[] ): Promise<ActionResult<`
  - `export async function bulkMarkPaid( invoiceIds: string[], paidAt?: Date ): Promise<ActionResult<`
  - `export async function bulkDeleteInvoices( invoiceIds: string[] ): Promise<ActionResult<`
  - `export async function getInvoiceAgingReport(): Promise< ActionResult<`
  - `export async function bundleInvoices( invoiceIds: string[], options?:`
  - `export async function getTaxSummary( startDate: Date, endDate: Date ): Promise< ActionResult<`

### lead-scoring.ts
- File: `src/lib/actions/lead-scoring.ts`
- Prisma models: organization, propertyLead, propertyWebsite
- External services: clerk
- Exported signatures:
  - `export async function trackLeadEngagement( leadId: string, event: "page_view" | "photo_view" | "tour_click" | "time_spent", value?: number )`
  - `export async function getLeadsByTemperature(propertyWebsiteId: string)`
  - `export async function updateLeadStatus( leadId: string, status: "new" | "contacted" | "qualified" | "closed" )`
  - `export async function addLeadNotes(leadId: string, notes: string)`
  - `export async function setLeadFollowUp(leadId: string, followUpDate: Date)`
  - `export async function getLeadsForFollowUp()`
  - `export async function getLeadAnalytics(dateRange?:`

### locale.ts
- File: `src/lib/actions/locale.ts`
- Exported signatures:
  - `export async function getLocale(): Promise<Locale>`
  - `export async function setLocale(locale: Locale): Promise<void>`

### locations.ts
- File: `src/lib/actions/locations.ts`
- Prisma models: location, organization, user
- External services: google
- Exported signatures:
  - `export async function createLocation( input: z.infer<typeof createLocationSchema> ): Promise<ActionResult<`
  - `export async function createLocationFromAddress( address: string, notes?: string ): Promise<ActionResult<`
  - `export async function updateLocation( input: z.infer<typeof updateLocationSchema> ): Promise<ActionResult<`
  - `export async function deleteLocation(id: string): Promise<ActionResult>`
  - `export async function getLocation(id: string)`
  - `export async function getLocations()`
  - `export async function calculateTravelBetweenLocations( fromLocationId: string, toLocationId: string ): Promise<ActionResult<`
  - `export async function calculateTravelFromHomeBase( toLocationId: string, assignedUserId?: string ): Promise<ActionResult<`
  - `export async function calculateTravelPreview( destLat: number, destLng: number, assignedUserId?: string ): Promise<ActionResult<`
  - `export async function setOrganizationHomeBase( locationId: string ): Promise<ActionResult>`
  - `export async function createAndSetHomeBase( address: string ): Promise<ActionResult<`
  - `export async function getOrganizationHomeBase()`
  - `export async function validateAddressAction( address: string ): Promise<ActionResult<`

### marketing-assets.ts
- File: `src/lib/actions/marketing-assets.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: marketingAsset, propertyWebsite
- Exported signatures:
  - `export async function generatePropertyFlyer(input: GenerateFlyerInput): Promise<`
  - `export async function generateSocialSquare(input: GenerateSocialInput): Promise<`
  - `export async function saveMarketingAsset(input:`
  - `export async function getPropertyMarketingAssets(propertyWebsiteId: string): Promise<`
  - `export async function deleteMarketingAsset(assetId: string): Promise<VoidActionResult>`

### marketing.ts
- File: `src/lib/actions/marketing.ts`
- External services: resend
- Exported signatures:
  - `export async function subscribeToNewsletter( email: string ): Promise<ActionResult<`
  - `export async function submitContactForm(input:`

### notification-preferences.ts
- File: `src/lib/actions/notification-preferences.ts`
- Prisma models: organization
- External services: clerk
- Exported signatures:
  - `export async function getNotificationPreferences(): Promise<`
  - `export async function updateNotificationPreferences( preferences: NotificationPreferences ): Promise<VoidActionResult>`
  - `export async function updateDigestSettings( settings: DigestSettings ): Promise<VoidActionResult>`
  - `export async function updateQuietHoursSettings( settings: QuietHoursSettings ): Promise<VoidActionResult>`
  - `export async function updateAllNotificationSettings(data:`
  - `export async function shouldSendNotification( organizationId: string, type: keyof NotificationPreferences["email"], channel: "email" | "push" ): Promise<boolean>`

### notifications.ts
- File: `src/lib/actions/notifications.ts`
- Auth helpers: requireOrganizationId
- Prisma models: notification
- Exported signatures:
  - `export async function getNotifications( limit: number = 10 ): Promise<ActionResult<`
  - `export async function markNotificationAsRead( notificationId: string ): Promise<ActionResult>`
  - `export async function getUnreadNotificationCount(): Promise<ActionResult<number>>`
  - `export async function markAllNotificationsAsRead(): Promise<ActionResult>`
  - `export async function createNotification( input: CreateNotificationInput ): Promise<ActionResult<`
  - `export async function deleteNotification( notificationId: string ): Promise<ActionResult>`
  - `export async function deleteReadNotifications(): Promise<ActionResult<`

### onboarding.ts
- File: `src/lib/actions/onboarding.ts`
- Prisma models: onboardingProgress, organization, user
- External services: clerk
- Exported signatures:
  - `export async function saveOnboardingStep( organizationId: string, step: number, data: Record<string, unknown> ): Promise<VoidActionResult>`
  - `export async function completeOnboarding( organizationId: string ): Promise<VoidActionResult>`
  - `export async function updateIndustries( organizationId: string, industries: string[], primaryIndustry: string ): Promise<VoidActionResult>`
  - `export async function updateModules( organizationId: string, modules: string[] ): Promise<VoidActionResult>`
  - `export async function resetOnboarding( organizationId: string ): Promise<VoidActionResult>`

### order-pages.ts
- File: `src/lib/actions/order-pages.ts`
- Auth helpers: requireOrganizationId
- Prisma models: orderPage, orderPageBundle, orderPageService, service, serviceBundle
- Exported signatures:
  - `export async function createOrderPage( input: CreateOrderPageInput ): Promise<ActionResult<`
  - `export async function updateOrderPage( input: UpdateOrderPageInput ): Promise<ActionResult<`
  - `export async function deleteOrderPage( id: string, force: boolean = false ): Promise<ActionResult>`
  - `export async function duplicateOrderPage( id: string, newName?: string, newSlug?: string ): Promise<ActionResult<`
  - `export async function toggleOrderPageStatus( id: string ): Promise<ActionResult<`
  - `export async function setOrderPageBundles( input: OrderPageBundlesInput ): Promise<ActionResult<`
  - `export async function setOrderPageServices( input: OrderPageServicesInput ): Promise<ActionResult<`
  - `export async function getOrderPages(filters?: OrderPageFilters)`
  - `export async function getOrderPage(id: string)`
  - `export async function getOrderPageBySlug(slug: string, orgSlug?: string)`

### orders.ts
- File: `src/lib/actions/orders.ts`
- Auth helpers: requireOrganizationId
- Prisma models: order, orderItem, orderPage, service, serviceBundle
- External services: stripe
- Exported signatures:
  - `export async function createOrder( input: CreateOrderInput ): Promise<ActionResult<`
  - `export async function createOrderCheckoutSession( orderId: string, sessionToken: string ): Promise<ActionResult<`
  - `export async function getOrderBySessionToken( orderId: string, sessionToken: string ): Promise<ActionResult<`
  - `export async function verifyOrderPayment( sessionId: string ): Promise<ActionResult<`
  - `export async function getOrders(filters?: OrderFilters)`
  - `export async function getOrder(id: string)`
  - `export async function updateOrder( input: UpdateOrderInput ): Promise<ActionResult<`
  - `export async function cancelOrder(id: string): Promise<ActionResult>`
  - `export async function getOrderStats()`
  - `export async function getSqftAnalytics()`

### payment-plans.ts
- File: `src/lib/actions/payment-plans.ts`
- Prisma models: organization, paymentPlan, paymentPlanInstallment
- External services: clerk
- Exported signatures:
  - `export async function createPaymentPlan(input: CreatePaymentPlanInput)`
  - `export async function getPaymentPlans(filters?:`
  - `export async function getPaymentPlan(planId: string)`
  - `export async function markInstallmentPaid( installmentId: string, stripePaymentIntentId?: string )`
  - `export async function cancelPaymentPlan(planId: string)`
  - `export async function checkOverdueInstallments()`
  - `export async function getUpcomingInstallments(daysAhead: number = 3)`

### payments.ts
- File: `src/lib/actions/payments.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: activityLog, organization, payment
- External services: clerk, resend, stripe
- Exported signatures:
  - `export async function getPayment(id: string)`
  - `export async function getPayments(filters?:`
  - `export async function getPaymentStats()`
  - `export async function markPaymentAsPaid(id: string)`
  - `export async function updatePaymentStatus(id: string, status: PaymentStatus)`
  - `export async function getPaymentLinkUrl(id: string): Promise<`
  - `export async function sendPaymentReminder(id: string): Promise<VoidActionResult>`
  - `export async function getPaymentReceiptData(id: string)`
  - `export async function exportPaymentsToCSV(paymentIds?: string[]): Promise<`
  - `export async function issueRefund( id: string, amountCents?: number, reason?: string ): Promise<VoidActionResult>`
  - `export async function getTipStats(options?:`
  - `export async function getPaymentsWithTips(options?:`
  - `export async function calculateSuggestedTips(amountCents: number)`

### payouts.ts
- File: `src/lib/actions/payouts.ts`
- Auth helpers: requireOrganizationId
- Prisma models: payoutBatch, payoutItem, photographerEarning, user
- External services: stripe
- Exported signatures:
  - `export async function getPayoutBatches(options?:`
  - `export async function getPayoutBatch( batchId: string ): Promise<ActionResult<PayoutBatchWithRelations>>`
  - `export async function getPendingPayouts(): Promise< ActionResult< Array<`
  - `export async function createPayoutBatch( input: CreatePayoutBatchInput ): Promise<ActionResult<PayoutBatchWithRelations>>`
  - `export async function processPayoutBatch( batchId: string ): Promise<ActionResult<PayoutBatchWithRelations>>`
  - `export async function cancelPayoutBatch(batchId: string): Promise<ActionResult<void>>`
  - `export async function getPayoutStats(): Promise< ActionResult<`

### photographer-pay.ts
- File: `src/lib/actions/photographer-pay.ts`
- Auth helpers: requireOrganizationId, requireUserId
- Prisma models: booking, photographerEarning, photographerRate
- Exported signatures:
  - `export async function getPhotographerRates(options?:`
  - `export async function getPhotographerRateForService( userId: string, serviceId: string ): Promise<ActionResult<PhotographerRateWithRelations | null>>`
  - `export async function upsertPhotographerRate( input: CreateRateInput ): Promise<ActionResult<PhotographerRateWithRelations>>`
  - `export async function deletePhotographerRate(id: string): Promise<ActionResult<void>>`
  - `export async function getPhotographerEarnings(options?:`
  - `export async function getMyEarnings(options?:`
  - `export async function calculateBookingEarnings( bookingId: string, photographerId: string, invoiceAmountCents: number ): Promise<ActionResult<`
  - `export async function recordPhotographerEarning(input:`
  - `export async function approveEarnings(earningIds: string[]): Promise<ActionResult<void>>`
  - `export async function getEarningStats(options?:`
  - `export async function getMyEarningStats(): Promise< ActionResult<`

### platform-referrals.ts
- File: `src/lib/actions/platform-referrals.ts`
- Auth helpers: requireAdmin
- Prisma models: notification, organizationMember, platformReferral, platformReferralReward, platformReferralSettings, platformReferrer, user
- External services: clerk
- Exported signatures:
  - `export async function getMyReferralProfile(): Promise<ActionResult<PlatformReferrerProfile>>`
  - `export async function getMyReferralStats(): Promise<ActionResult<PlatformReferralStats>>`
  - `export async function getMyReferrals(): Promise<ActionResult<PlatformReferralItem[]>>`
  - `export async function getMyRewards(): Promise<ActionResult<PlatformReward[]>>`
  - `export async function getMyReferralLink(): Promise<ActionResult<string>>`
  - `export async function sendReferralInvite( email: string, name?: string ): Promise<ActionResult<`
  - `export async function trackReferralClick( referralCode: string, metadata?:`
  - `export async function processReferralSignup( referralCode: string, newUserId: string, newOrgId?: string ): Promise<ActionResult>`
  - `export async function processReferralConversion( userId: string ): Promise<ActionResult>`
  - `export async function applyReward( rewardId: string ): Promise<ActionResult>`
  - `export async function getPlatformReferralSettings(): Promise<ActionResult<Awaited<ReturnType<typeof getPlatformSettings>>>>`
  - `export async function updatePlatformReferralSettings( updates:`
  - `export async function getReferralLeaderboard( limit: number = 10 ): Promise<ActionResult<Array<`
  - `export async function processReferralFromCode( referralCode: string ): Promise<ActionResult>`

### portal-activity.ts
- File: `src/lib/actions/portal-activity.ts`
- Prisma models: clientSession, portalActivity
- Exported signatures:
  - `export async function createPortalActivity(input: CreateActivityInput)`
  - `export async function getClientActivities(options?:`
  - `export async function markActivitiesAsRead(activityIds?: string[])`
  - `export async function getUnreadActivityCount()`
  - `export async function logGalleryDelivered( organizationId: string, clientId: string, projectId: string, galleryName: string )`
  - `export async function logInvoiceSent( organizationId: string, clientId: string, invoiceId: string, invoiceNumber: string, amount: number )`
  - `export async function logPaymentReceived( organizationId: string, clientId: string, paymentId: string, amount: number, projectId?: string )`
  - `export async function logDownloadCompleted( organizationId: string, clientId: string, projectId: string, format: string, fileCount: number )`

### portal-downloads.ts
- File: `src/lib/actions/portal-downloads.ts`
- Prisma models: invoice, project, propertyWebsite
- External services: stripe
- Exported signatures:
  - `export async function getGalleryZipDownload(galleryId: string): Promise<`
  - `export async function getWebSizeDownload(galleryId: string): Promise<`
  - `export async function getHighResDownload(galleryId: string): Promise<`
  - `export async function getMarketingKitDownload(propertyId: string): Promise<`
  - `export async function getInvoicePaymentLink(invoiceId: string): Promise<`
  - `export async function getInvoicePdfDownload(invoiceId: string): Promise<`

### portfolio-comments.ts
- File: `src/lib/actions/portfolio-comments.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: portfolioComment, portfolioWebsite
- Exported signatures:
  - `export async function getPortfolioComments(options?:`
  - `export async function approveComment( commentId: string ): Promise<VoidActionResult>`
  - `export async function hideComment( commentId: string ): Promise<VoidActionResult>`
  - `export async function unhideComment( commentId: string ): Promise<VoidActionResult>`
  - `export async function deleteComment( commentId: string ): Promise<VoidActionResult>`
  - `export async function getCommentStats(): Promise<`
  - `export async function updateCommentSettings( portfolioId: string, settings:`

### portfolio-websites.ts
- File: `src/lib/actions/portfolio-websites.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: activityLog, client, portfolioInquiry, portfolioWebsite, portfolioWebsiteProject, portfolioWebsiteSection, portfolioWebsiteView, project
- Exported signatures:
  - `export async function getPortfolioWebsites()`
  - `export async function createPortfolioWebsite(data:`
  - `export async function getPortfolioWebsite(id: string)`
  - `export async function updatePortfolioWebsite( id: string, data:`
  - `export async function updatePortfolioWebsiteProjects( id: string, projectIds: string[] ): Promise<VoidActionResult>`
  - `export async function publishPortfolioWebsite( id: string, publish: boolean ): Promise<VoidActionResult>`
  - `export async function deletePortfolioWebsite( id: string ): Promise<VoidActionResult>`
  - `export async function duplicatePortfolioWebsite( id: string ): Promise<`
  - `export async function getPortfolioWebsiteBySlug(slug: string)`
  - `export async function updatePortfolioWebsiteSettings( id: string, data:`
  - `export async function getPortfolioSections(portfolioWebsiteId: string)`
  - `export async function createPortfolioSection( portfolioWebsiteId: string, data:`
  - `export async function updatePortfolioSection( id: string, data:`
  - `export async function deletePortfolioSection( id: string ): Promise<VoidActionResult>`
  - `export async function reorderPortfolioSections( portfolioWebsiteId: string, sectionIds: string[] ): Promise<VoidActionResult>`
  - `export async function initializePortfolioSections( portfolioWebsiteId: string ): Promise<VoidActionResult>`
  - `export async function duplicatePortfolioSection( id: string ): Promise<`
  - `export async function toggleSectionVisibility( id: string ): Promise<`
  - `export async function setPortfolioPassword( portfolioId: string, data:`
  - `export async function verifyPortfolioPassword( slug: string, password: string ): Promise<VoidActionResult>`
  - `export async function updatePortfolioAdvancedSettings( portfolioId: string, data:`
  - `export async function schedulePortfolioPublish( portfolioId: string, scheduledAt: Date | null ): Promise<VoidActionResult>`
  - `export async function getScheduledPortfolios(): Promise<`
  - `export async function processScheduledPortfolioPublishing(): Promise<`
  - `export async function trackPortfolioView( slug: string, data:`
  - `export async function updatePortfolioViewEngagement( viewId: string, data:`
  - `export async function getPortfolioAnalytics( portfolioId: string, timeRange: "7d" | "30d" | "90d" | "all" = "30d" ): Promise<`
  - `export async function submitPortfolioContactForm( slug: string, data:`
  - `export async function addCustomDomain( portfolioId: string, domain: string ): Promise<`
  - `export async function verifyCustomDomain( portfolioId: string ): Promise<`
  - `export async function removeCustomDomain( portfolioId: string ): Promise<VoidActionResult>`
  - `export async function getCustomDomainStatus( portfolioId: string ): Promise<`
  - `export async function getPortfolioByCustomDomain( domain: string ): Promise<`
  - `export async function submitPortfolioInquiry(input:`
  - `export async function getPortfolioInquiries(filters?:`
  - `export async function updatePortfolioInquiryStatus( inquiryId: string, status: "new" | "contacted" | "qualified" | "closed", notes?: string ): Promise<VoidActionResult>`
  - `export async function convertPortfolioInquiryToClient( inquiryId: string, additionalData?:`

### products.ts
- File: `src/lib/actions/products.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: asset, productCatalog, productItem, productPhoto, productVariant
- Exported signatures:
  - `export async function listProductCatalogs()`
  - `export async function getProductCatalog(catalogId: string)`
  - `export async function createProductCatalog(input: CreateCatalogInput): Promise<ActionResult<`
  - `export async function createProduct(input: CreateProductInput): Promise<ActionResult<`
  - `export async function attachPhotoToProduct(input: AttachPhotoInput): Promise<ActionResult<`
  - `export async function updateProductStatus(productId: string, status: "pending" | "shot" | "edited" | "approved" | "delivered" | "archived"): Promise<ActionResult>`

### projects.ts
- File: `src/lib/actions/projects.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: booking, client, project, recurringTask, task, taskAutomation, taskBoard, taskColumn, taskComment, taskSubtask, taskTemplate, taskTimeEntry, user
- Exported signatures:
  - `export async function getBoards()`
  - `export async function getBoard(boardId: string)`
  - `export async function getOrCreateDefaultBoard()`
  - `export async function createBoard(data:`
  - `export async function updateBoard( boardId: string, data:`
  - `export async function archiveBoard( boardId: string ): Promise<VoidActionResult>`
  - `export async function createColumn( boardId: string, data:`
  - `export async function updateColumn( columnId: string, data:`
  - `export async function reorderColumns( boardId: string, columnIds: string[] ): Promise<VoidActionResult>`
  - `export async function deleteColumn( columnId: string ): Promise<VoidActionResult>`
  - `export async function getTasks(filters?:`
  - `export async function getTask(taskId: string)`
  - `export async function createTask(data:`
  - `export async function updateTask( taskId: string, data:`
  - `export async function moveTask( taskId: string, targetColumnId: string, targetPosition: number ): Promise<VoidActionResult>`
  - `export async function deleteTask( taskId: string ): Promise<VoidActionResult>`
  - `export async function addSubtask( taskId: string, title: string ): Promise<`
  - `export async function toggleSubtask( subtaskId: string ): Promise<VoidActionResult>`
  - `export async function deleteSubtask( subtaskId: string ): Promise<VoidActionResult>`
  - `export async function addComment( taskId: string, content: string ): Promise<`
  - `export async function deleteComment( commentId: string ): Promise<VoidActionResult>`
  - `export async function createTaskFromGallery( galleryId: string, options?:`
  - `export async function createTaskFromBooking( bookingId: string, options?:`
  - `export async function createTaskFromClient( clientId: string, options?:`
  - `export async function getTaskAnalytics(): Promise<`
  - `export async function bulkMoveTasks( taskIds: string[], columnId: string ): Promise<`
  - `export async function bulkUpdatePriority( taskIds: string[], priority: TaskPriority ): Promise<`
  - `export async function bulkAssignTasks( taskIds: string[], assigneeId: string | null ): Promise<`
  - `export async function bulkDeleteTasks( taskIds: string[] ): Promise<`
  - `export async function getTaskTemplates()`
  - `export async function createTaskTemplate(data:`
  - `export async function saveTaskAsTemplate( taskId: string, templateData:`
  - `export async function createTaskFromTemplate( templateId: string, data:`
  - `export async function updateTaskTemplate( templateId: string, data:`
  - `export async function deleteTaskTemplate( templateId: string ): Promise<VoidActionResult>`
  - `export async function getAutomations(boardId: string)`
  - `export async function createAutomation(data:`
  - `export async function updateAutomation( automationId: string, data:`
  - `export async function deleteAutomation( automationId: string ): Promise<VoidActionResult>`
  - `export async function executeAutomations( boardId: string, taskId: string, triggerType: AutomationTriggerType, context?:`
  - `export async function getRecurringTasks(boardId: string)`
  - `export async function createRecurringTask(data:`
  - `export async function updateRecurringTask( recurringTaskId: string, data:`
  - `export async function deleteRecurringTask( recurringTaskId: string ): Promise<VoidActionResult>`
  - `export async function processRecurringTasks(): Promise<`
  - `export async function getTaskTimeEntries(taskId: string)`
  - `export async function startTimeTracking( taskId: string ): Promise<`
  - `export async function stopTimeTracking( entryId: string ): Promise<`
  - `export async function addManualTimeEntry(data:`
  - `export async function deleteTimeEntry( entryId: string ): Promise<VoidActionResult>`
  - `export async function getActiveTimer(): Promise<`
  - `export async function addTaskDependency( taskId: string, blockedByTaskId: string ): Promise<VoidActionResult>`
  - `export async function removeTaskDependency( taskId: string, blockedByTaskId: string ): Promise<VoidActionResult>`
  - `export async function getTaskDependencies(taskId: string): Promise<`

### property-websites.ts
- File: `src/lib/actions/property-websites.ts`
- Prisma models: project, propertyAnalytics, propertyLead, propertyWebsite
- Exported signatures:
  - `export async function createPropertyWebsite( data: PropertyWebsiteInput ): Promise<`
  - `export async function updatePropertyWebsite( id: string, data: Partial<PropertyWebsiteInput> ): Promise<VoidActionResult>`
  - `export async function togglePropertyWebsitePublish( id: string ): Promise<`
  - `export async function deletePropertyWebsite( id: string ): Promise<VoidActionResult>`
  - `export async function getPropertyWebsites( organizationId: string ): Promise<PropertyWebsiteWithRelations[]>`
  - `export async function getPropertyWebsiteById( id: string ): Promise<PropertyWebsiteWithRelations | null>`
  - `export async function getPropertyWebsiteBySlug(slug: string)`
  - `export async function incrementPropertyWebsiteViews(id: string): Promise<void>`
  - `export async function submitPropertyLead(data:`
  - `export async function getPropertyLeads(propertyWebsiteId: string)`
  - `export async function updateLeadStatus( leadId: string, status: LeadStatus ): Promise<VoidActionResult>`
  - `export async function getPropertyAnalytics( propertyWebsiteId: string, days: number = 30 )`
  - `export async function getAllPropertyLeads(organizationId: string)`
  - `export async function getAggregateAnalytics(organizationId: string, days: number = 30)`
  - `export async function duplicatePropertyWebsite( id: string ): Promise<`
  - `export async function deletePropertyWebsites( ids: string[] ): Promise<`
  - `export async function publishPropertyWebsites( ids: string[], publish: boolean ): Promise<`
  - `export async function getProjectsWithoutPropertyWebsite(organizationId: string)`

### questionnaire-portal.ts
- File: `src/lib/actions/questionnaire-portal.ts`
- Prisma models: booking, client, clientQuestionnaire, clientQuestionnaireAgreement, clientSession, organization
- Exported signatures:
  - `export async function getClientQuestionnairesForPortal(): Promise< ActionResult<PortalQuestionnaireWithRelations[]> >`
  - `export async function getQuestionnaireForCompletion( id: string ): Promise<ActionResult<PortalQuestionnaireWithRelations | null>>`
  - `export async function saveQuestionnaireProgress( input: SaveQuestionnaireProgressInput ): Promise<ActionResult<void>>`
  - `export async function acceptAgreement( input: AcceptAgreementInput ): Promise<ActionResult<void>>`
  - `export async function submitQuestionnaireResponses( input: SubmitQuestionnaireResponsesInput ): Promise<ActionResult<void>>`
  - `export async function getQuestionnaireCompletionStatus( id: string ): Promise< ActionResult<`

### questionnaire-templates.ts
- File: `src/lib/actions/questionnaire-templates.ts`
- Prisma models: questionnaireField, questionnaireTemplate
- External services: clerk
- Exported signatures:
  - `export async function getQuestionnaireTemplates( filters?: QuestionnaireTemplateFilters ): Promise<ActionResult<QuestionnaireTemplateWithRelations[]>>`
  - `export async function getSystemTemplates( industry?: Industry ): Promise<ActionResult<QuestionnaireTemplateWithRelations[]>>`
  - `export async function getQuestionnaireTemplate( id: string ): Promise<ActionResult<QuestionnaireTemplateWithRelations | null>>`
  - `export async function createQuestionnaireTemplate( input: CreateQuestionnaireTemplateInput ): Promise<ActionResult<`
  - `export async function updateQuestionnaireTemplate( input: UpdateQuestionnaireTemplateInput ): Promise<ActionResult<`
  - `export async function duplicateQuestionnaireTemplate( input:`
  - `export async function deleteQuestionnaireTemplate( input:`
  - `export async function toggleQuestionnaireTemplateStatus( id: string ): Promise<ActionResult<void>>`
  - `export async function updateQuestionnaireFields( input: UpdateQuestionnaireFieldsInput ): Promise<ActionResult<void>>`
  - `export async function reorderQuestionnaireFields( input: ReorderQuestionnaireFieldsInput ): Promise<ActionResult<void>>`
  - `export async function updateQuestionnaireAgreements( input: UpdateQuestionnaireAgreementsInput ): Promise<ActionResult<void>>`
  - `export async function getTemplatesByIndustry(): Promise< ActionResult<Record<Industry, QuestionnaireTemplateWithRelations[]>> >`

### questionnaire-types.ts
- File: `src/lib/actions/questionnaire-types.ts`

### receipt-pdf.ts
- File: `src/lib/actions/receipt-pdf.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: payment
- Exported signatures:
  - `export async function generateReceiptPdf(paymentId: string): Promise<`

### recurring-invoices.ts
- File: `src/lib/actions/recurring-invoices.ts`
- Auth helpers: requireOrganizationId
- Prisma models: client, invoice, organization, recurringInvoice
- External services: clerk
- Exported signatures:
  - `export async function createRecurringInvoice( input: CreateRecurringInvoiceInput ): Promise<ActionResult<`
  - `export async function updateRecurringInvoice( input: UpdateRecurringInvoiceInput ): Promise<ActionResult>`
  - `export async function deleteRecurringInvoice(id: string): Promise<ActionResult>`
  - `export async function pauseRecurringInvoice( id: string, pauseUntil?: Date ): Promise<ActionResult>`
  - `export async function resumeRecurringInvoice(id: string): Promise<ActionResult>`
  - `export async function getRecurringInvoices(): Promise< ActionResult< Array<`
  - `export async function getRecurringInvoice(id: string): Promise< ActionResult<`
  - `export async function getRecurringInvoicesDueToRun(): Promise< ActionResult< Array<`
  - `export async function createInvoiceFromRecurring( recurringId: string ): Promise<ActionResult<`
  - `export async function processRecurringInvoices(): Promise< ActionResult<`

### referrals.ts
- File: `src/lib/actions/referrals.ts`
- Prisma models: referral, referralProgram, referrer
- External services: clerk
- Exported signatures:
  - `export async function getReferralProgram(): Promise<ActionResult<ReferralProgram | null>>`
  - `export async function getReferrers(): Promise<ActionResult<Referrer[]>>`
  - `export async function getReferrals(): Promise<ActionResult<Referral[]>>`
  - `export async function getReferralStats(): Promise< ActionResult<`
  - `export async function upsertReferralProgram(data:`
  - `export async function toggleReferralProgram(): Promise<ActionResult<void>>`
  - `export async function createReferrer(data:`
  - `export async function toggleReferrerStatus( referrerId: string ): Promise<ActionResult<void>>`
  - `export async function deleteReferrer( referrerId: string ): Promise<ActionResult<void>>`
  - `export async function regenerateReferralCode( referrerId: string ): Promise<ActionResult<`
  - `export async function updateReferralStatus( referralId: string, status: ReferralStatus ): Promise<ActionResult<void>>`

### retainers.ts
- File: `src/lib/actions/retainers.ts`
- Auth helpers: requireOrganizationId
- Prisma models: client, clientRetainer, invoice, retainerTransaction
- Exported signatures:
  - `export async function createRetainer( input: CreateRetainerInput ): Promise<ActionResult<ClientRetainer>>`
  - `export async function getRetainer(options:`
  - `export async function listRetainers(options?:`
  - `export async function updateRetainer( retainerId: string, input:`
  - `export async function addDeposit( retainerId: string, input: DepositInput ): Promise<ActionResult<RetainerTransaction>>`
  - `export async function applyToInvoice( retainerId: string, input: ApplyToInvoiceInput ): Promise<ActionResult<RetainerTransaction>>`
  - `export async function refundFromRetainer( retainerId: string, amountCents: number, description?: string ): Promise<ActionResult<RetainerTransaction>>`
  - `export async function adjustRetainerBalance( retainerId: string, amountCents: number, description: string ): Promise<ActionResult<RetainerTransaction>>`
  - `export async function getRetainerTransactions( retainerId: string, options?:`
  - `export async function getRetainerStats(): Promise< ActionResult<`
  - `export async function getLowBalanceRetainers(): Promise<ActionResult<RetainerWithTransactions[]>>`

### revenue-forecasting.ts
- File: `src/lib/actions/revenue-forecasting.ts`
- Auth helpers: requireOrganizationId
- Prisma models: booking, client, invoice, payment
- Exported signatures:
  - `export async function getRevenueForecast( months: number = 6 ): Promise<ActionResult<RevenueForecast[]>>`
  - `export async function getHistoricalTrends( months: number = 12 ): Promise<ActionResult<HistoricalTrend[]>>`
  - `export async function getSeasonalPatterns(): Promise< ActionResult<SeasonalPattern[]> >`
  - `export async function getRevenueGoals( year?: number ): Promise< ActionResult<`
  - `export async function getRevenueInsights(): Promise< ActionResult<`

### search.ts
- File: `src/lib/actions/search.ts`
- Prisma models: booking, client, invoice, project, propertyWebsite, service
- External services: clerk
- Exported signatures:
  - `export async function globalSearch(query: string): Promise<SearchResults>`

### seed.ts
- File: `src/lib/actions/seed.ts`
- Auth helpers: requireOrganizationId, requireUserId
- Prisma models: activityLog, asset, availabilityBlock, booking, bookingReminder, client, clientCommunication, clientSession, clientTag, clientTagAssignment, contract, contractAuditLog, contractSignature, contractSigner, contractTemplate, deliveryLink, equipment, galleryComment, galleryFavorite, invoice, invoiceLineItem, marketingAsset, notification, payment, project, propertyAnalytics, propertyLead, propertyWebsite, service, serviceEquipmentRequirement, task, taskBoard, taskColumn, taskComment, taskSubtask, userEquipment, userServiceCapability
- External services: google
- Exported signatures:
  - `export async function seedDatabase(): Promise<ActionResult<`
  - `export async function clearSeededData(): Promise<ActionResult>`

### self-booking.ts
- File: `src/lib/actions/self-booking.ts`
- Prisma models: booking, client, organization, service
- Exported signatures:
  - `export async function getPublicOrganization(slug: string): Promise< ActionResult<`
  - `export async function getPublicServices( organizationSlug: string ): Promise<ActionResult<PublicService[]>>`
  - `export async function getAvailableSlots( organizationSlug: string, serviceId: string, startDate: string, endDate: string ): Promise<ActionResult<AvailableSlot[]>>`
  - `export async function submitBooking( data: BookingSubmission ): Promise<ActionResult<BookingConfirmation>>`

### service-images.ts
- File: `src/lib/actions/service-images.ts`
- External services: clerk, r2
- Exported signatures:
  - `export async function getServiceImageUploadUrl( request: ServiceImageUploadRequest ): Promise<ServiceImageUploadResult>`

### services.ts
- File: `src/lib/actions/services.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: service
- External services: stripe
- Exported signatures:
  - `export async function createService( input: CreateServiceInput ): Promise<ActionResult<`
  - `export async function updateService( input: UpdateServiceInput ): Promise<ActionResult<`
  - `export async function deleteService( id: string, force: boolean = false ): Promise<ActionResult>`
  - `export async function duplicateService( id: string, newName?: string ): Promise<ActionResult<`
  - `export async function toggleServiceStatus( id: string ): Promise<ActionResult<`
  - `export async function getServices(filters?: ServiceFilters)`
  - `export async function getService(id: string)`
  - `export async function seedDefaultServices(): Promise<ActionResult<`
  - `export async function bulkToggleServiceStatus( ids: string[] ): Promise<ActionResult<`
  - `export async function bulkArchiveServices( ids: string[], archive: boolean = true ): Promise<ActionResult<`
  - `export async function bulkDeleteServices( ids: string[] ): Promise<ActionResult<`

### settings.ts
- File: `src/lib/actions/settings.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: booking, client, invoice, organization, organizationMember, payment, project, propertyWebsite, service, user
- External services: clerk, r2, stripe
- Exported signatures:
  - `export async function getSupportedCurrencies()`
  - `export async function getOrganizationSettings()`
  - `export async function updateOrganizationProfile(input:`
  - `export async function updateOrganizationBranding(input:`
  - `export async function updateTravelSettings(input:`
  - `export async function updateTaxSettings(input:`
  - `export async function getTaxSettings()`
  - `export async function getCurrencySettings()`
  - `export async function updateCurrencySettings(input:`
  - `export async function getTeamMembers()`
  - `export async function updateMemberRole(memberId: string, role: MemberRole)`
  - `export async function removeMember(memberId: string)`
  - `export async function getCurrentUser()`
  - `export async function updateUserProfile(input:`
  - `export async function exportAllData()`
  - `export async function deleteAccount(confirmationText: string)`
  - `export async function getBillingStats()`
  - `export async function getInvoiceHistory(limit: number = 10)`

### slack.ts
- File: `src/lib/actions/slack.ts`
- Prisma models: slackIntegration
- External services: clerk, slack
- Exported signatures:
  - `export async function getSlackConfig(): Promise<ActionResult<SlackConfig | null>>`
  - `export async function saveSlackConfig(data:`
  - `export async function toggleSlackIntegration(): Promise<ActionResult<void>>`
  - `export async function testSlackConnection(): Promise<ActionResult<void>>`
  - `export async function deleteSlackIntegration(): Promise<ActionResult<void>>`
  - `export async function notifySlackNewBooking( data: SlackBookingNotification ): Promise<void>`
  - `export async function notifySlackPayment( data: SlackPaymentNotification ): Promise<void>`
  - `export async function notifySlackCancellation( data: SlackCancellationNotification ): Promise<void>`
  - `export async function notifySlackGalleryDelivery( data: SlackGalleryDeliveryNotification ): Promise<void>`

### smart-collections.ts
- File: `src/lib/actions/smart-collections.ts`
- Prisma models: asset, organization, project
- External services: clerk
- Exported signatures:
  - `export async function analyzePhotosForSmartCollections(projectId: string)`
  - `export async function applySmartCollection( projectId: string, suggestion:`
  - `export async function applyAllSmartCollections( projectId: string, suggestions:`

### sms.ts
- File: `src/lib/actions/sms.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: organization, sMSLog, sMSTemplate
- Exported signatures:
  - `export async function getSMSSettings(): Promise<ActionResult<SMSSettings>>`
  - `export async function getSMSStats(): Promise<ActionResult<SMSStats>>`
  - `export async function updateSMSSettings(data:`
  - `export async function sendTestSMS(toPhone: string): Promise<ActionResult>`
  - `export async function getSMSTemplates(): Promise< ActionResult< Array< SMSTemplateData &`
  - `export async function seedDefaultTemplates(): Promise<ActionResult>`
  - `export async function getTemplateTypes(): Promise< ActionResult< Array<`
  - `export async function upsertSMSTemplate(data:`
  - `export async function deleteSMSTemplate(id: string): Promise<ActionResult>`
  - `export async function getSMSLogs(params?:`
  - `export async function sendSMSToClientAction(data:`
  - `export async function sendCustomSMS(data:`

### stripe-checkout.ts
- File: `src/lib/actions/stripe-checkout.ts`
- Prisma models: invoice, organization, payment, project
- External services: clerk, stripe
- Exported signatures:
  - `export async function createCheckoutSession(params:`
  - `export async function createGalleryCheckoutSession( galleryId: string, customerEmail?: string ): Promise<ActionResult<`
  - `export async function verifyPayment( sessionId: string ): Promise<ActionResult<`
  - `export async function createInvoiceCheckoutSession( invoiceId: string, customerEmail?: string ): Promise<ActionResult<`
  - `export async function verifyInvoicePayment( sessionId: string ): Promise<ActionResult<`
  - `export async function checkGalleryPaymentStatus( galleryId: string ): Promise<ActionResult<`

### stripe-connect.ts
- File: `src/lib/actions/stripe-connect.ts`
- Auth helpers: requireAuth, requireOrganizationId
- Prisma models: organization
- External services: stripe
- Exported signatures:
  - `export async function createConnectAccount(): Promise< ActionResult<`
  - `export async function getConnectAccountStatus(): Promise< ActionResult<`
  - `export async function createAccountLink(): Promise< ActionResult<`
  - `export async function createDashboardLink(): Promise< ActionResult<`
  - `export async function isStripeTestMode(): Promise<boolean>`
  - `export async function getConnectAccountDetails(): Promise< ActionResult<ConnectAccountDetails> >`

### stripe-product-sync.ts
- File: `src/lib/actions/stripe-product-sync.ts`
- Prisma models: organization, service, serviceBundle
- External services: clerk, stripe
- Exported signatures:
  - `export async function syncProductsToStripe()`
  - `export async function syncSingleProductToStripe( productId: string, productType: "service" | "bundle" ): Promise<VoidActionResult>`
  - `export async function refreshSyncOverview(): Promise<ProductSyncOverview>`

### subscription-plans.ts
- File: `src/lib/actions/subscription-plans.ts`
- Prisma models: planFeature, pricingExperiment, pricingVariant, subscriptionPlan
- External services: clerk, r2, resend, stripe, twilio
- Exported signatures:
  - `export async function getSubscriptionPlans()`
  - `export async function getSubscriptionPlan(idOrSlug: string)`
  - `export async function createSubscriptionPlan( input: SubscriptionPlanInput ): Promise<ActionResult<`
  - `export async function updateSubscriptionPlan( id: string, input: Partial<SubscriptionPlanInput> ): Promise<ActionResult<`
  - `export async function deleteSubscriptionPlan( id: string ): Promise<ActionResult>`
  - `export async function addPlanFeature( input: PlanFeatureInput ): Promise<ActionResult<`
  - `export async function updatePlanFeature( id: string, input: Partial<PlanFeatureInput> ): Promise<ActionResult<`
  - `export async function deletePlanFeature(id: string): Promise<ActionResult>`
  - `export async function syncPlanToStripe( planId: string ): Promise<ActionResult<`
  - `export async function syncAllPlansToStripe(): Promise< ActionResult<`
  - `export async function getPricingExperiments()`
  - `export async function createPricingExperiment( input: PricingExperimentInput ): Promise<ActionResult<`
  - `export async function updateExperimentStatus( id: string, status: ExperimentStatus ): Promise<ActionResult<`
  - `export async function createPricingVariant( input: PricingVariantInput ): Promise<ActionResult<`
  - `export async function syncVariantToStripe( variantId: string ): Promise<ActionResult<`
  - `export async function recordVariantImpression(variantId: string): Promise<void>`
  - `export async function recordVariantConversion(variantId: string): Promise<void>`
  - `export async function getPublicPricingPlans(experimentSlug?: string)`
  - `export async function seedDefaultPlans(): Promise< ActionResult<`
  - `export async function cloneSubscriptionPlan( planId: string, newName?: string, newSlug?: string ): Promise<ActionResult<`
  - `export async function deletePricingVariant(id: string): Promise<ActionResult>`
  - `export async function checkEnvironmentStatus(): Promise<EnvironmentStatus>`

### team-availability.ts
- File: `src/lib/actions/team-availability.ts`
- Auth helpers: requireOrganizationId
- Prisma models: availabilityBlock, booking, user
- Exported signatures:
  - `export async function getTeamAvailability( startDate: Date, endDate: Date, options?:`
  - `export async function getDailyTeamSummary( date: Date ): Promise<ActionResult<DayAvailability>>`
  - `export async function findAvailableTeamMembers( startTime: Date, endTime: Date, serviceId?: string ): Promise< ActionResult<`
  - `export async function getTeamUtilization( startDate: Date, endDate: Date ): Promise< ActionResult<`
  - `export async function getSuggestedBookingTimes( date: Date, durationMinutes: number, serviceId?: string ): Promise< ActionResult<`

### team-capabilities.ts
- File: `src/lib/actions/team-capabilities.ts`
- Prisma models: location, organization, organizationMember, service, serviceEquipmentRequirement, user, userServiceCapability
- Exported signatures:
  - `export async function assignServiceCapability( input: z.infer<typeof serviceCapabilitySchema> ): Promise<ActionResult<`
  - `export async function updateServiceCapability( userId: string, serviceId: string, level: "learning" | "capable" | "expert", notes?: string ): Promise<ActionResult>`
  - `export async function removeServiceCapability( userId: string, serviceId: string ): Promise<ActionResult>`
  - `export async function getUserServiceCapabilities(userId: string)`
  - `export async function getQualifiedTeamMembers( serviceId: string, minLevel?: "learning" | "capable" | "expert" ): Promise<Array<`
  - `export async function getTeamMembersWithCapabilities()`
  - `export async function bulkAssignCapabilities( userId: string, capabilities: Array<`
  - `export async function setUserHomeBase( userId: string, locationId: string | null ): Promise<ActionResult>`

### territories.ts
- File: `src/lib/actions/territories.ts`
- Prisma models: organization, serviceTerritory, territoryServiceOverride
- External services: clerk
- Exported signatures:
  - `export async function getTerritories(): Promise<ActionResult<ServiceTerritory[]>>`
  - `export async function findTerritoryByZipCode( zipCode: string ): Promise<ActionResult<ServiceTerritory | null>>`
  - `export async function createTerritory(data:`
  - `export async function updateTerritory( id: string, data:`
  - `export async function deleteTerritory(id: string): Promise<ActionResult<void>>`
  - `export async function toggleTerritoryStatus(id: string): Promise<ActionResult<void>>`
  - `export async function importZipCodes( territoryId: string, zipCodesString: string ): Promise<ActionResult<`
  - `export async function setServiceOverride(data:`
  - `export async function removeServiceOverride( territoryId: string, serviceId: string ): Promise<ActionResult<void>>`
  - `export async function checkServiceAreaPublic( orgSlug: string, zipCode: string ): Promise<ActionResult<`

### tour.ts
- File: `src/lib/actions/tour.ts`
- Prisma models: organization, user
- External services: clerk
- Exported signatures:
  - `export async function markTourCompleted( organizationId: string, tourId: string ): Promise<ActionResult<void>>`
  - `export async function markModuleTourCompleted( moduleId: string ): Promise<ActionResult<void>>`
  - `export async function getTourProgress( organizationId: string ): Promise<ActionResult<TourProgress>>`
  - `export async function resetTourProgress( organizationId: string ): Promise<ActionResult<void>>`

### types.ts
- File: `src/lib/actions/types.ts`

### uploads.ts
- File: `src/lib/actions/uploads.ts`
- Auth helpers: requireOrganizationId
- Prisma models: activityLog, asset, project
- External services: r2
- Exported signatures:
  - `export async function getUploadPresignedUrls( galleryId: string, files: UploadRequestFile[] ): Promise<UploadPresignedUrlResult>`
  - `export async function createAsset( organizationId: string, input: CreateAssetInput ): Promise<CreateAssetResult>`
  - `export async function createAssets( projectId: string, assets: Array<Omit<CreateAssetInput, "projectId">> ): Promise<BulkCreateAssetsResult>`
  - `export async function deleteAsset( organizationId: string, assetId: string ): Promise<VoidActionResult>`
  - `export async function deleteAssets( organizationId: string, assetIds: string[] ): Promise<`
  - `export async function updateAssetUrls( organizationId: string, assetId: string, urls:`

### waitlist.ts
- File: `src/lib/actions/waitlist.ts`
- Auth helpers: requireOrganizationId
- Prisma models: activityLog, booking, bookingWaitlist, service
- Exported signatures:
  - `export async function getWaitlistEntries( filters?: WaitlistFilters, options?:`
  - `export async function addToWaitlist( input: CreateWaitlistInput ): Promise<ActionResult<`
  - `export async function updateWaitlistStatus( entryId: string, status: WaitlistStatus ): Promise<ActionResult<`
  - `export async function updateWaitlistPriority( entryId: string, priority: number ): Promise<ActionResult<`
  - `export async function removeFromWaitlist( entryId: string ): Promise<ActionResult<`
  - `export async function notifyWaitlistClient( entryId: string, expiresInHours: number = 24 ): Promise<ActionResult<`
  - `export async function convertWaitlistToBooking( entryId: string, bookingDetails:`
  - `export async function processExpiredNotifications(): Promise< ActionResult<`
  - `export async function getWaitlistStats( dateRange?:`
  - `export async function getWaitlistMatches(): Promise< ActionResult<`

### watermark-settings.ts
- File: `src/lib/actions/watermark-settings.ts`
- Prisma models: organization
- External services: clerk
- Exported signatures:
  - `export async function getWatermarkSettings()`
  - `export async function updateWatermarkSettings(settings: Partial<WatermarkSettings>)`
  - `export async function toggleWatermarks(enabled: boolean)`
  - `export async function getWatermarkUploadUrl(filename: string, contentType: string)`
  - `export async function setWatermarkImage(imageUrl: string)`
  - `export async function getWatermarkPreviewStyles()`
  - `export async function generateDefaultWatermarkText()`

### watermark-templates.ts
- File: `src/lib/actions/watermark-templates.ts`
- Prisma models: organization, watermarkTemplate
- External services: clerk
- Exported signatures:
  - `export async function createWatermarkTemplate(data: WatermarkTemplateInput)`
  - `export async function updateWatermarkTemplate( templateId: string, data: Partial<WatermarkTemplateInput> )`
  - `export async function deleteWatermarkTemplate(templateId: string)`
  - `export async function listWatermarkTemplates()`
  - `export async function getWatermarkTemplate(templateId: string)`
  - `export async function setDefaultTemplate(templateId: string)`
  - `export async function getDefaultWatermarkTemplate()`
  - `export async function applyTemplateToOrganization(templateId: string)`

### weather.ts
- File: `src/lib/actions/weather.ts`
- Exported signatures:
  - `export async function getBookingWeather( latitude: number, longitude: number, bookingDate: Date ): Promise<ActionResult<`
  - `export async function getLocationForecast( latitude: number, longitude: number ): Promise<ActionResult<WeatherForecast[]>>`
  - `export async function getGoldenHour( latitude: number, longitude: number, date: Date ): Promise<ActionResult<GoldenHourInfo>>`
  - `export async function checkWeatherApiAvailability(): Promise<boolean>`

### webhooks.ts
- File: `src/lib/actions/webhooks.ts`
- Prisma models: organization, webhookDelivery, webhookEndpoint
- External services: clerk
- Exported signatures:
  - `export async function getWebhookEndpoints()`
  - `export async function createWebhookEndpoint(params:`
  - `export async function updateWebhookEndpoint( webhookId: string, params:`
  - `export async function deleteWebhookEndpoint(webhookId: string)`
  - `export async function regenerateWebhookSecret(webhookId: string)`
  - `export async function testWebhookEndpoint(webhookId: string)`
  - `export async function getWebhookDeliveries( webhookId: string, options?:`
  - `export async function getWebhookDelivery(deliveryId: string)`
  - `export async function dispatchWebhookEvent( organizationId: string, eventType: WebhookEventId, payload: Record<string, unknown> )`

## Server Actions Inventory
- `ab-testing.ts`: completeABTest, createABTest, deleteABTest, getABTest, getABTestStats, getABTestVariant, getABTests, pauseABTest, recordABTestConversion, startABTest, updateABTest
- `activity.ts`: getActivityFeed, getActivityLogs, getActivitySummary, getActivityTimeline, getEntityActivities, searchActivities
- `addons.ts`: createAddon, deleteAddon, getAddon, getAddons, getCompatibleAddons, getSuggestedAddons, reorderAddons, setAddonCompatibility, toggleAddonStatus, updateAddon
- `analytics-report.ts`: generateAnalyticsReportPdf
- `analytics.ts`: exportReportAsCSV, generateRevenueReport, getClientLTVMetrics, getDashboardAnalytics, getRevenueForecast
- `api-keys.ts`: deleteApiKey, generateNewApiKey, getApiKeys, revokeApiKey, updateApiKey, validateApiKey
- `appearance.ts`: applyThemePreset, getAppearancePreferences, resetAppearancePreferences, updateAppearancePreferences
- `auth-helper.ts`: requireAdmin, requireAuth, requireOrganizationId, requireOwner, requireUserId
- `availability.ts`: addHolidayBlock, addTimeOffToday, addWeeklyRecurringBlock, approveTimeOffRequest, cancelTimeOffRequest, checkBookingConflicts, createAvailabilityBlock, deleteAvailabilityBlock, deleteBookingBuffer, getAvailabilityBlock, getAvailabilityBlocks, getBookingBufferForService, getBookingBuffers, getDefaultBookingBuffer, getExpandedAvailabilityBlocks, getMyTimeOffRequests, getPendingTimeOffCount, getPendingTimeOffRequests, getTimeOffRequests, rejectTimeOffRequest, submitTimeOffRequest, updateAvailabilityBlock, upsertBookingBuffer
- `booking-crew.ts`: addCrewMember, confirmCrewAssignment, declineCrewAssignment, getAvailableCrewMembers, getBookingCrew, getMyCrewAssignments, removeCrewMember, updateCrewMember
- `booking-forms.ts`: convertBookingSubmissionToClient, convertSubmissionToBooking, createBookingForm, deleteBookingForm, duplicateBookingForm, getAllSubmissions, getBookingForm, getBookingFormBySlug, getBookingForms, getFormSubmissions, rejectSubmission, reorderBookingFormFields, setBookingFormServices, submitBookingForm, toggleBookingFormStatus, updateBookingForm, updateBookingFormFields
- `booking-import.ts`: getBookingImportTemplate, importBookings, previewBookingImport
- `booking-types.ts`: createBookingType, deleteBookingType, getBookingType, getBookingTypes, seedDefaultBookingTypes, updateBookingType
- `bookings.ts`: addSessionToMultiDayEvent, checkBookingConflicts, confirmBooking, createBooking, createBookingReminders, createMultiDayEvent, createRecurringBooking, deleteBooking, deleteBookingReminder, deleteBookingSeries, deleteMultiDayEvent, deleteMultiDaySession, getBooking, getBookingReminders, getBookingSeries, getBookings, getClientsForBooking, getConflictsInRange, getMultiDayEvent, getMultiDayEvents, getPendingReminders, getScheduleStats, getServicesForBooking, markReminderSent, removeFromSeries, updateBooking, updateBookingReminders, updateBookingSeries, updateBookingStatus, updateMultiDaySession, validateBookingTime
- `brokerage-contracts.ts`: calculateBrokeragePrice, createBrokerageContract, deleteBrokerageContract, getActiveBrokerageContract, getBrokerageContract, getBrokerageContracts, updateBrokerageContract
- `brokerages.ts`: assignAgentToBrokerage, createBrokerage, deleteBrokerage, getBrokerage, getBrokerageAgents, getBrokerageBySlug, getBrokerageStats, getBrokerages, updateBrokerage
- `bundles.ts`: addServiceToBundle, calculateBundlePrice, calculateBundleSavings, createBundle, createPackageFromRecommendation, deleteBundle, deletePricingTier, duplicateBundle, getBundle, getBundleBySlug, getBundlePricingTiers, getBundleWithPricing, getBundles, getPackageAnalytics, getPackageRecommendations, getPackageTemplates, removeServiceFromBundle, reorderBundleItems, setBundlePricingTiers, setBundleServices, toggleBundleStatus, updateBundle
- `calendar-feeds.ts`: createCalendarFeed, createMyCalendarFeed, deleteCalendarFeed, getCalendarFeeds, getMyCalendarFeed, regenerateCalendarFeedToken, updateCalendarFeed
- `chat-inquiries.ts`: convertChatInquiryToClient, getChatInquiries, getChatInquiryStats, submitChatInquiry, updateChatInquiryStatus
- `client-auth.ts`: getClientSession, logoutClient, requireClientAuth, sendClientMagicLink, validateMagicLinkToken
- `client-communications.ts`: addClientNote, createCommunication, deleteCommunication, getClientCommunicationStats, getClientCommunications, getCommunication, getRecentCommunications, logEmailSent, logMeeting, logPhoneCall, updateCommunication
- `client-import.ts`: getImportTemplate, importClients, previewClientImport
- `client-merge.ts`: findDuplicateClients, getClientMergePreview, getDuplicateCount, mergeClients
- `client-notifications.ts`: cleanupOldClientNotifications, createClientNotification, createClientNotificationsBatch, getClientNotifications, getClientUnreadCount, markAllClientNotificationsAsRead, markClientNotificationAsRead, notifyBookingConfirmed, notifyBookingReminder, notifyContractReady, notifyGalleryExpiring, notifyGalleryReady, notifyInvoiceSent, notifyPaymentConfirmed, notifyQuestionnaireReady
- `client-portal.ts`: getClientGalleryDownload, getClientPortalData, getClientPropertyDetails
- `client-questionnaires.ts`: approveQuestionnaire, assignQuestionnaireToClient, deleteClientQuestionnaire, getClientQuestionnaire, getClientQuestionnaires, getClientQuestionnairesByClient, getQuestionnaireStats, getRemindableQuestionnairesCount, markExpiredQuestionnaires, sendBatchReminders, sendQuestionnaireReminder, updateClientQuestionnaire
- `client-selections.ts`: exportSelectionsCSV, getClientSelections, getGallerySelections, resetSelections, reviewSelections, submitSelections, toggleSelection, updateSelectionNotes, updateSelectionSettings
- `client-tags.ts`: assignTagToClient, bulkAssignTag, bulkRemoveTag, createClientTag, createDefaultTags, deleteClientTag, getClientTag, getClientTags, getClientsByTag, getClientsByTags, getTagsForClient, removeTagFromClient, setClientTags, updateClientTag
- `clients.ts`: bulkAssignTags, bulkDeleteClients, bulkRemoveTags, bulkUpdateIndustry, createClient, deleteClient, getAcquisitionAnalytics, getClient, getClientEmailPreferences, getClients, getClientsBySource, getSourcePerformance, impersonateClientPortal, updateClient, updateClientEmailPreferences, updateClientSource
- `contract-pdf.ts`: generateContractPdf
- `contract-signing.ts`: addContractSigner, cancelContract, extendContractExpiration, getContractAuditLog, getContractForSigning, getContractSignatures, getContractsWithSigningStatus, getSigningCompletion, removeContractSigner, resendSigningInvitation, signContract
- `contract-templates.ts`: createContractTemplate, deleteContractTemplate, duplicateContractTemplate, getContractTemplateById, getContractTemplates, getTemplateCategories, seedDefaultContractTemplates, updateContractTemplate, useContractTemplate
- `contracts.ts`: createContract, deleteContract, duplicateContract, getContract, sendContract, updateContract
- `create-wizard.ts`: createProjectBundle, getWizardData
- `credit-notes.ts`: applyCreditNoteToInvoice, createCreditNote, deleteCreditNote, getClientAvailableCredit, getCreditNote, issueCreditNote, listCreditNotes, markCreditNoteRefunded, voidCreditNote
- `custom-forms.ts`: addFormField, archiveSubmission, createForm, deleteForm, deleteFormField, deleteSubmission, duplicateForm, getForm, getFormBySlug, getFormStats, getFormSubmissions, getForms, markSubmissionRead, reorderFormFields, submitForm, updateForm, updateFormField
- `dashboard.ts`: getDashboardConfig, resetDashboardConfig, toggleSectionCollapsed, toggleSectionVisibility, updateDashboardConfig
- `discount-codes.ts`: createDiscountCode, deleteDiscountCode, getDiscountCodes, recordDiscountCodeUsage, updateDiscountCode, validateDiscountCode
- `download-tracking.ts`: exportDownloadHistory, getDownloadHistory, getGalleryDownloadAnalytics, getGalleryHeatMapData, getOrganizationDownloadStats, logDownload, sendReceiptForDownload
- `dropbox.ts`: createDropboxFolder, deleteDropboxIntegration, ensureDropboxRootFolder, getDropboxConfig, getDropboxConnectionStatus, getDropboxDownloadLink, listDropboxFolder, recordSyncError, saveDropboxConfig, syncDropboxChangesForAccount, testDropboxIntegration, toggleDropboxIntegration, updateDropboxSettings, updateSyncCursor
- `email-accounts.ts`: disconnectEmailAccount, getConnectedEmailAccounts, getEmailAccount, toggleEmailAccountSync
- `email-logs.ts`: createEmailLog, getClientEmailHealth, getClientEmailLogs, getEmailLog, getEmailLogs, getEmailStats, getQuestionnaireDigestData, getQuestionnaireEmailActivity, logEmailSent, resendEmail, updateEmailLogStatus
- `email-settings.ts`: getEmailSettings, sendTestEmail, updateEmailSettings
- `email-sync.ts`: getEmailThread, getEmailThreads, getOrganizationSyncStatus, linkThreadToClient, markThreadRead, sendEmailReply, sendNewEmail, toggleThreadArchive, toggleThreadStar, triggerEmailSync
- `equipment-checklists.ts`: addEquipmentRequirement, checkAllEquipment, getBookingChecklistSummaries, getBookingEquipmentChecklist, getBookingTypeEquipmentRequirements, removeEquipmentRequirement, setBookingTypeEquipmentRequirements, toggleEquipmentCheck, uncheckAllEquipment, updateEquipmentCheckNote
- `equipment.ts`: addServiceEquipmentRequirement, assignEquipmentToUser, createEquipment, deleteEquipment, getEquipment, getEquipmentByCategory, getEquipmentList, getEquipmentUsageStats, getEquipmentUsageTimeline, getServiceEquipmentRequirements, getUpcomingEquipmentNeeds, getUserEquipment, removeServiceEquipmentRequirement, unassignEquipmentFromUser, updateEquipment
- `estimates.ts`: approveEstimate, convertEstimateToInvoice, createEstimate, deleteEstimate, duplicateEstimate, getEstimate, getEstimateStats, listEstimates, markEstimateViewed, rejectEstimate, sendEstimate, updateEstimate
- `field-operations.ts`: addFieldNote, checkIn, checkOut, getTodaysBookings, getUpcomingBookings
- `galleries.ts`: archiveGallery, bulkArchiveGalleries, bulkDeleteGalleries, bulkToggleWatermark, createGallery, deleteGallery, deletePhoto, deliverGallery, duplicateGallery, getGalleries, getGallery, getGalleryCounts, getPublicGallery, getWatermarkExclusions, recordDownload, recordGalleryView, reorderPhotos, updateGallery
- `gallery-activity.ts`: getGalleryActivitySummary, getGalleryActivityTimeline
- `gallery-addons.ts`: approveAddonQuote, cancelAddonRequest, completeAddonRequest, createGalleryAddon, declineAddonQuote, deleteGalleryAddon, getAllAddonRequests, getAvailableAddons, getClientAddonRequests, getDefaultAddonsForIndustry, getGalleryAddonRequestsAdmin, getGalleryAddons, reorderGalleryAddons, requestAddon, sendAddonQuote, startAddonRequest, updateGalleryAddon
- `gallery-analytics.ts`: exportGalleryAnalyticsReport, getComprehensiveGalleryAnalytics, logGalleryView, logPhotoView
- `gallery-collections.ts`: addAssetsToCollection, createGalleryCollection, deleteGalleryCollection, getGalleryCollections, removeAssetsFromCollection, reorderGalleryCollections, updateGalleryCollection
- `gallery-expiration.ts`: extendGalleryExpiration, getExpiringSoonGalleries, getPendingExpirationNotifications, markNotificationSent, processExpirationNotifications, scheduleExpirationNotifications, sendExpirationWarningEmail
- `gallery-feedback.ts`: deleteFeedback, getAllFeedback, getFeedbackStats, markAllFeedbackAsRead, markFeedbackAsRead, markFeedbackAsResolved
- `gallery-reminders.ts`: disableGalleryReminders, enableGalleryReminders, extendGalleryExpiration, getExpiringGalleries, getGalleryReminderHistory, getGalleryReminderStatus, getUnviewedGalleries, resetGalleryReminders, sendBatchGalleryReminders, sendManualGalleryReminder, updateGalleryExpiration
- `gallery-templates.ts`: createGalleryTemplate, deleteGalleryTemplate, getGalleryTemplate, getGalleryTemplates, incrementTemplateUsage, updateGalleryTemplate
- `google-calendar.ts`: disconnectGoogleCalendar, getGoogleCalendarConfig, getGoogleCalendars, syncGoogleCalendar, testGoogleCalendarConnection, updateGoogleCalendarSettings
- `integration-logs.ts`: INTEGRATION_EVENT_TYPES, INTEGRATION_PROVIDERS, cleanupOldIntegrationLogs, getIntegrationActivitySummary, getIntegrationLogs, getIntegrationSyncStatus, getProviderLogs, logIntegrationEvent
- `invitations.ts`: acceptInvitation, createInvitation, getInvitationByToken, getPendingInvitations, resendInvitation, revokeInvitation
- `invoice-analytics.ts`: exportInvoicesToCSV, getARAging, getCollectionMetrics, getInvoiceSummary, getRevenueByClient, getRevenueByMonth
- `invoice-attachments.ts`: addInvoiceAttachment, bulkDeleteInvoiceAttachments, deleteInvoiceAttachment, getInvoiceAttachment, getInvoiceAttachmentStats, getInvoiceAttachments, updateInvoiceAttachment
- `invoice-email-templates.ts`: TEMPLATE_VARIABLES, buildEstimateEmailVariables, buildInvoiceEmailVariables, createInvoiceEmailTemplate, deleteInvoiceEmailTemplate, duplicateInvoiceEmailTemplate, getAvailableTemplateVariables, getDefaultTemplateForType, getInvoiceEmailTemplate, getTemplateStats, initializeDefaultTemplates, listInvoiceEmailTemplates, recordTemplateUsage, replaceTemplateVariables, updateInvoiceEmailTemplate
- `invoice-payments.ts`: applyBatchLateFees, applyLateFee, configureLateFee, getInvoiceBalance, getInvoicePayments, recordInvoicePayment, voidPayment, waiveLateFees
- `invoice-pdf.ts`: generateInvoicePdf, generateInvoicePdfBuffer
- `invoice-presets.ts`: createInvoicePreset, deleteInvoicePreset, duplicateInvoicePreset, getDefaultInvoicePreset, getInvoiceDataFromPreset, getInvoicePreset, getPopularInvoicePresets, getPresetCategories, listInvoicePresets, updateInvoicePreset
- `invoice-splits.ts`: createInvoiceSplit, deleteInvoiceSplit, getInvoiceSplit, getInvoiceSplitSummary, getInvoiceSplits, previewInvoiceSplit
- `invoice-templates.ts`: createInvoiceBrandingTemplate, deleteInvoiceTemplate, duplicateInvoiceTemplate, getDefaultInvoiceTemplate, getInvoiceTemplate, getInvoiceTemplates, updateInvoiceBrandingTemplate
- `invoices.ts`: addTravelFeeToInvoice, bulkDeleteInvoices, bulkMarkPaid, bulkSendInvoices, bundleInvoices, calculateTravelFeeForInvoice, cancelScheduledInvoice, cloneInvoice, createInvoice, createInvoiceWithDeposit, deleteInvoice, generateInvoiceFromBooking, getClientInvoices, getDepositBalancePair, getInvoice, getInvoiceAgingReport, getInvoices, getInvoicesNeedingReminders, getOverdueInvoicesForDashboard, getScheduledInvoices, getTaxSummary, processScheduledInvoices, scheduleInvoice, sendBatchInvoiceReminders, sendInvoiceReminder, splitInvoiceForDeposit, toggleInvoiceAutoReminders, updateAllOverdueInvoices, updateInvoice, updateInvoiceStatus
- `lead-scoring.ts`: addLeadNotes, getLeadAnalytics, getLeadsByTemperature, getLeadsForFollowUp, setLeadFollowUp, trackLeadEngagement, updateLeadStatus
- `locale.ts`: getLocale, setLocale
- `locations.ts`: calculateTravelBetweenLocations, calculateTravelFromHomeBase, calculateTravelPreview, createAndSetHomeBase, createLocation, createLocationFromAddress, deleteLocation, getLocation, getLocations, getOrganizationHomeBase, setOrganizationHomeBase, updateLocation, validateAddressAction
- `marketing-assets.ts`: deleteMarketingAsset, generatePropertyFlyer, generateSocialSquare, getPropertyMarketingAssets, saveMarketingAsset
- `marketing.ts`: submitContactForm, subscribeToNewsletter
- `notification-preferences.ts`: getNotificationPreferences, shouldSendNotification, updateAllNotificationSettings, updateDigestSettings, updateNotificationPreferences, updateQuietHoursSettings
- `notifications.ts`: createNotification, deleteNotification, deleteReadNotifications, getNotifications, getUnreadNotificationCount, markAllNotificationsAsRead, markNotificationAsRead
- `onboarding.ts`: completeOnboarding, resetOnboarding, saveOnboardingStep, updateIndustries, updateModules
- `order-pages.ts`: createOrderPage, deleteOrderPage, duplicateOrderPage, getOrderPage, getOrderPageBySlug, getOrderPages, setOrderPageBundles, setOrderPageServices, toggleOrderPageStatus, updateOrderPage
- `orders.ts`: cancelOrder, createOrder, createOrderCheckoutSession, getOrder, getOrderBySessionToken, getOrderStats, getOrders, getSqftAnalytics, updateOrder, verifyOrderPayment
- `payment-plans.ts`: cancelPaymentPlan, checkOverdueInstallments, createPaymentPlan, getPaymentPlan, getPaymentPlans, getUpcomingInstallments, markInstallmentPaid
- `payments.ts`: calculateSuggestedTips, exportPaymentsToCSV, getPayment, getPaymentLinkUrl, getPaymentReceiptData, getPaymentStats, getPayments, getPaymentsWithTips, getTipStats, issueRefund, markPaymentAsPaid, sendPaymentReminder, updatePaymentStatus
- `payouts.ts`: cancelPayoutBatch, createPayoutBatch, getPayoutBatch, getPayoutBatches, getPayoutStats, getPendingPayouts, processPayoutBatch
- `photographer-pay.ts`: approveEarnings, calculateBookingEarnings, deletePhotographerRate, getEarningStats, getMyEarningStats, getMyEarnings, getPhotographerEarnings, getPhotographerRateForService, getPhotographerRates, recordPhotographerEarning, upsertPhotographerRate
- `platform-referrals.ts`: applyReward, getMyReferralLink, getMyReferralProfile, getMyReferralStats, getMyReferrals, getMyRewards, getPlatformReferralSettings, getReferralLeaderboard, processReferralConversion, processReferralFromCode, processReferralSignup, sendReferralInvite, trackReferralClick, updatePlatformReferralSettings
- `portal-activity.ts`: createPortalActivity, getClientActivities, getUnreadActivityCount, logDownloadCompleted, logGalleryDelivered, logInvoiceSent, logPaymentReceived, markActivitiesAsRead
- `portal-downloads.ts`: getGalleryZipDownload, getHighResDownload, getInvoicePaymentLink, getInvoicePdfDownload, getMarketingKitDownload, getWebSizeDownload
- `portfolio-comments.ts`: approveComment, deleteComment, getCommentStats, getPortfolioComments, hideComment, unhideComment, updateCommentSettings
- `portfolio-websites.ts`: addCustomDomain, convertPortfolioInquiryToClient, createPortfolioSection, createPortfolioWebsite, deletePortfolioSection, deletePortfolioWebsite, duplicatePortfolioSection, duplicatePortfolioWebsite, getCustomDomainStatus, getPortfolioAnalytics, getPortfolioByCustomDomain, getPortfolioInquiries, getPortfolioSections, getPortfolioWebsite, getPortfolioWebsiteBySlug, getPortfolioWebsites, getScheduledPortfolios, initializePortfolioSections, processScheduledPortfolioPublishing, publishPortfolioWebsite, removeCustomDomain, reorderPortfolioSections, schedulePortfolioPublish, setPortfolioPassword, submitPortfolioContactForm, submitPortfolioInquiry, toggleSectionVisibility, trackPortfolioView, updatePortfolioAdvancedSettings, updatePortfolioInquiryStatus, updatePortfolioSection, updatePortfolioViewEngagement, updatePortfolioWebsite, updatePortfolioWebsiteProjects, updatePortfolioWebsiteSettings, verifyCustomDomain, verifyPortfolioPassword
- `products.ts`: attachPhotoToProduct, createProduct, createProductCatalog, getProductCatalog, listProductCatalogs, updateProductStatus
- `projects.ts`: addComment, addManualTimeEntry, addSubtask, addTaskDependency, archiveBoard, bulkAssignTasks, bulkDeleteTasks, bulkMoveTasks, bulkUpdatePriority, createAutomation, createBoard, createColumn, createRecurringTask, createTask, createTaskFromBooking, createTaskFromClient, createTaskFromGallery, createTaskFromTemplate, createTaskTemplate, deleteAutomation, deleteColumn, deleteComment, deleteRecurringTask, deleteSubtask, deleteTask, deleteTaskTemplate, deleteTimeEntry, executeAutomations, getActiveTimer, getAutomations, getBoard, getBoards, getOrCreateDefaultBoard, getRecurringTasks, getTask, getTaskAnalytics, getTaskDependencies, getTaskTemplates, getTaskTimeEntries, getTasks, moveTask, processRecurringTasks, removeTaskDependency, reorderColumns, saveTaskAsTemplate, startTimeTracking, stopTimeTracking, toggleSubtask, updateAutomation, updateBoard, updateColumn, updateRecurringTask, updateTask, updateTaskTemplate
- `property-websites.ts`: createPropertyWebsite, deletePropertyWebsite, deletePropertyWebsites, duplicatePropertyWebsite, getAggregateAnalytics, getAllPropertyLeads, getProjectsWithoutPropertyWebsite, getPropertyAnalytics, getPropertyLeads, getPropertyWebsiteById, getPropertyWebsiteBySlug, getPropertyWebsites, incrementPropertyWebsiteViews, publishPropertyWebsites, submitPropertyLead, togglePropertyWebsitePublish, updateLeadStatus, updatePropertyWebsite
- `questionnaire-portal.ts`: acceptAgreement, getClientQuestionnairesForPortal, getQuestionnaireCompletionStatus, getQuestionnaireForCompletion, saveQuestionnaireProgress, submitQuestionnaireResponses
- `questionnaire-templates.ts`: createQuestionnaireTemplate, deleteQuestionnaireTemplate, duplicateQuestionnaireTemplate, getQuestionnaireTemplate, getQuestionnaireTemplates, getSystemTemplates, getTemplatesByIndustry, reorderQuestionnaireFields, toggleQuestionnaireTemplateStatus, updateQuestionnaireAgreements, updateQuestionnaireFields, updateQuestionnaireTemplate
- `questionnaire-types.ts`: (no exported functions found)
- `receipt-pdf.ts`: generateReceiptPdf
- `recurring-invoices.ts`: createInvoiceFromRecurring, createRecurringInvoice, deleteRecurringInvoice, getRecurringInvoice, getRecurringInvoices, getRecurringInvoicesDueToRun, pauseRecurringInvoice, processRecurringInvoices, resumeRecurringInvoice, updateRecurringInvoice
- `referrals.ts`: createReferrer, deleteReferrer, getReferralProgram, getReferralStats, getReferrals, getReferrers, regenerateReferralCode, toggleReferralProgram, toggleReferrerStatus, updateReferralStatus, upsertReferralProgram
- `retainers.ts`: addDeposit, adjustRetainerBalance, applyToInvoice, createRetainer, getLowBalanceRetainers, getRetainer, getRetainerStats, getRetainerTransactions, listRetainers, refundFromRetainer, updateRetainer
- `revenue-forecasting.ts`: getHistoricalTrends, getRevenueForecast, getRevenueGoals, getRevenueInsights, getSeasonalPatterns
- `search.ts`: globalSearch
- `seed.ts`: clearSeededData, seedDatabase
- `self-booking.ts`: getAvailableSlots, getPublicOrganization, getPublicServices, submitBooking
- `service-images.ts`: getServiceImageUploadUrl
- `services.ts`: bulkArchiveServices, bulkDeleteServices, bulkToggleServiceStatus, createService, deleteService, duplicateService, getService, getServices, seedDefaultServices, toggleServiceStatus, updateService
- `settings.ts`: deleteAccount, exportAllData, getBillingStats, getCurrencySettings, getCurrentUser, getInvoiceHistory, getOrganizationSettings, getSupportedCurrencies, getTaxSettings, getTeamMembers, removeMember, updateCurrencySettings, updateMemberRole, updateOrganizationBranding, updateOrganizationProfile, updateTaxSettings, updateTravelSettings, updateUserProfile
- `slack.ts`: deleteSlackIntegration, getSlackConfig, notifySlackCancellation, notifySlackGalleryDelivery, notifySlackNewBooking, notifySlackPayment, saveSlackConfig, testSlackConnection, toggleSlackIntegration
- `smart-collections.ts`: analyzePhotosForSmartCollections, applyAllSmartCollections, applySmartCollection
- `sms.ts`: deleteSMSTemplate, getSMSLogs, getSMSSettings, getSMSStats, getSMSTemplates, getTemplateTypes, seedDefaultTemplates, sendCustomSMS, sendSMSToClientAction, sendTestSMS, updateSMSSettings, upsertSMSTemplate
- `stripe-checkout.ts`: checkGalleryPaymentStatus, createCheckoutSession, createGalleryCheckoutSession, createInvoiceCheckoutSession, verifyInvoicePayment, verifyPayment
- `stripe-connect.ts`: createAccountLink, createConnectAccount, createDashboardLink, getConnectAccountDetails, getConnectAccountStatus, isStripeTestMode
- `stripe-product-sync.ts`: refreshSyncOverview, syncProductsToStripe, syncSingleProductToStripe
- `subscription-plans.ts`: addPlanFeature, checkEnvironmentStatus, cloneSubscriptionPlan, createPricingExperiment, createPricingVariant, createSubscriptionPlan, deletePlanFeature, deletePricingVariant, deleteSubscriptionPlan, getPricingExperiments, getPublicPricingPlans, getSubscriptionPlan, getSubscriptionPlans, recordVariantConversion, recordVariantImpression, seedDefaultPlans, syncAllPlansToStripe, syncPlanToStripe, syncVariantToStripe, updateExperimentStatus, updatePlanFeature, updateSubscriptionPlan
- `team-availability.ts`: findAvailableTeamMembers, getDailyTeamSummary, getSuggestedBookingTimes, getTeamAvailability, getTeamUtilization
- `team-capabilities.ts`: assignServiceCapability, bulkAssignCapabilities, getQualifiedTeamMembers, getTeamMembersWithCapabilities, getUserServiceCapabilities, removeServiceCapability, setUserHomeBase, updateServiceCapability
- `territories.ts`: checkServiceAreaPublic, createTerritory, deleteTerritory, findTerritoryByZipCode, getTerritories, importZipCodes, removeServiceOverride, setServiceOverride, toggleTerritoryStatus, updateTerritory
- `tour.ts`: getTourProgress, markModuleTourCompleted, markTourCompleted, resetTourProgress
- `types.ts`: (no exported functions found)
- `uploads.ts`: createAsset, createAssets, deleteAsset, deleteAssets, getUploadPresignedUrls, updateAssetUrls
- `waitlist.ts`: addToWaitlist, convertWaitlistToBooking, getWaitlistEntries, getWaitlistMatches, getWaitlistStats, notifyWaitlistClient, processExpiredNotifications, removeFromWaitlist, updateWaitlistPriority, updateWaitlistStatus
- `watermark-settings.ts`: generateDefaultWatermarkText, getWatermarkPreviewStyles, getWatermarkSettings, getWatermarkUploadUrl, setWatermarkImage, toggleWatermarks, updateWatermarkSettings
- `watermark-templates.ts`: applyTemplateToOrganization, createWatermarkTemplate, deleteWatermarkTemplate, getDefaultWatermarkTemplate, getWatermarkTemplate, listWatermarkTemplates, setDefaultTemplate, updateWatermarkTemplate
- `weather.ts`: checkWeatherApiAvailability, getBookingWeather, getGoldenHour, getLocationForecast
- `webhooks.ts`: WEBHOOK_EVENT_TYPES, createWebhookEndpoint, deleteWebhookEndpoint, dispatchWebhookEvent, getWebhookDeliveries, getWebhookDelivery, getWebhookEndpoints, regenerateWebhookSecret, testWebhookEndpoint, updateWebhookEndpoint

## Data Model Dictionary
- Fields are listed verbatim from Prisma schema for rebuild accuracy.
- Action usage lists server action files that touch each Prisma model.

### Model: Organization
- Fields:
  - `id                  String   @id @default(cuid())`
  - `clerkOrganizationId String?  @unique`
  - `name                String`
  - `slug                String   @unique`
  - `plan                PlanName @default(free)`
  - `stripeCustomerId       String? @unique`
  - `stripeSubscriptionId   String?`
  - `stripeConnectAccountId String?`
  - `stripeConnectOnboarded Boolean @default(false)`
  - `logoUrl        String?`
  - `logoLightUrl   String? // Logo variant for light backgrounds`
  - `faviconUrl     String?`
  - `primaryColor   String? @default("#3b82f6")`
  - `secondaryColor String? @default("#8b5cf6")`
  - `accentColor    String? @default("#22c55e")`
  - `customDomain   String? @unique`
  - `portalMode     PortalMode @default(dark) // light or dark mode for client-facing pages`
  - `invoiceLogoUrl String? // Separate logo for invoices (optional)`
  - `hidePlatformBranding Boolean @default(false) // Hide "Powered by PhotoProOS"`
  - `customEmailDomain    String? // For white-label email sending`
  - `watermarkEnabled  Boolean           @default(true)`
  - `watermarkType     String?           @default("text") // "text" or "image"`
  - `watermarkText     String? // Custom text (e.g., "(c) Studio Name")`
  - `watermarkImageUrl String? // URL to watermark image`
  - `watermarkPosition WatermarkPosition @default(bottom_right)`
  - `watermarkOpacity  Float             @default(0.5) // 0-1`
  - `watermarkScale    Float             @default(0.15) // Size relative to image (0-1)`
  - `timezone String @default("America/New_York")`
  - `currency String @default("USD")`
  - `defaultTaxRate Float?  @default(0) // Default tax rate as percentage (e.g., 8.25 for 8.25%)`
  - `taxLabel       String? @default("Sales Tax") // Label shown on invoices (e.g., "Sales Tax", "VAT", "GST")`
  - `homeBaseLocationId String?`
  - `travelFeePerMile   Int?    @default(0) // in cents (e.g., 65 = $0.65/mile)`
  - `travelFeeThreshold Float?  @default(0) // free miles before charging`
  - `onboardingCompleted   Boolean   @default(false)`
  - `onboardingStep        Int       @default(0)`
  - `onboardingCompletedAt DateTime?`
  - `industries      Industry[] @default([real_estate])`
  - `primaryIndustry Industry   @default(real_estate)`
  - `enabledModules String[] @default([])`
  - `businessType    BusinessType?`
  - `teamSize        String? // "1", "2-5", "6-10", "11-25", "25+"`
  - `yearsInBusiness String? // "<1", "1-3", "3-5", "5-10", "10+"`
  - `annualRevenue   String? // "<50k", "50-100k", "100-250k", "250k+"`
  - `displayMode DisplayMode @default(company)`
  - `publicName  String? // What clients see (company or personal name)`
  - `publicEmail String? // Public-facing email`
  - `publicPhone String? // Public-facing phone`
  - `website     String? // Company website`
  - `trialStartedAt     DateTime?`
  - `trialEndsAt        DateTime?`
  - `paymentMethodAdded Boolean   @default(false)`
  - `autoArchiveExpiredGalleries Boolean @default(true) // Auto-archive galleries when they expire`
  - `emailSenderName           String? // Custom "from" name for emails`
  - `emailReplyTo              String? // Custom reply-to email address`
  - `emailSignature            String? @db.Text // Optional email signature`
  - `enableQuestionnaireEmails Boolean @default(true)`
  - `enableDigestEmails        Boolean @default(true)`
  - `digestEmailFrequency      String? @default("daily") // "daily", "weekly", "none"`
  - `digestEmailTime           String? @default("08:00") // Time in HH:MM format`
  - `digestEmailDayOfWeek      Int?    @default(0) // 0=Sunday, 1=Monday, etc. (for weekly digest)`
  - `notificationPreferences Json? // { email: {...}, push: {...}, quietHours: {...} }`
  - `quietHoursEnabled       Boolean @default(false)`
  - `quietHoursFrom          String? @default("22:00") // HH:MM format`
  - `quietHoursTo            String? @default("07:00") // HH:MM format`
  - `twilioAccountSid  String?`
  - `twilioAuthToken   String?`
  - `twilioPhoneNumber String?`
  - `smsEnabled        Boolean @default(false)`
  - `selfBookingEnabled  Boolean @default(false)`
  - `selfBookingPageSlug String?`
  - `slackTeamId      String?`
  - `slackAccessToken String? @db.Text`
  - `tourProgress Json?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `members                  OrganizationMember[]`
  - `invitations              Invitation[]`
  - `projects                 Project[]`
  - `portfolioWebsites        PortfolioWebsite[]`
  - `portfolioInquiries       PortfolioInquiry[]`
  - `portfolioLeads           PortfolioLead[]`
  - `portfolioComments        PortfolioComment[]`
  - `portfolioABTests         PortfolioABTest[]`
  - `customForms              CustomForm[]`
  - `clients                  Client[]`
  - `payments                 Payment[]`
  - `galleryFeedback          GalleryFeedback[]`
  - `bookings                 Booking[]`
  - `bookingTypes             BookingType[]`
  - `invoices                 Invoice[]`
  - `creditNotes              CreditNote[]`
  - `estimates                Estimate[]`
  - `clientRetainers          ClientRetainer[]`
  - `contracts                Contract[]`
  - `contractTemplates        ContractTemplate[]`
  - `activityLogs             ActivityLog[]`
  - `notifications            Notification[]`
  - `usageMeters              UsageMeter[]`
  - `onboardingProgress       OnboardingProgress?`
  - `services                 Service[]`
  - `locations                Location[]`
  - `equipment                Equipment[]`
  - `watermarkTemplates       WatermarkTemplate[]`
  - `homeBaseLocation         Location?                 @relation("OrgHomeBase", fields: [homeBaseLocationId], references: [id])`
  - `taskBoards               TaskBoard[]`
  - `tasks                    Task[]`
  - `taskTemplates            TaskTemplate[]`
  - `taskAutomations          TaskAutomation[]`
  - `recurringTasks           RecurringTask[]`
  - `discountCodes            DiscountCode[]`
  - `paymentPlans             PaymentPlan[]`
  - `invoiceTemplates         InvoiceTemplate[]`
  - `invoiceBrandingTemplates InvoiceBrandingTemplate[]`
  - `invoiceEmailTemplates    InvoiceEmailTemplate[]`
  - `galleryTemplates         GalleryTemplate[]`
  - `serviceBundles ServiceBundle[]`
  - `serviceAddons  ServiceAddon[]`
  - `orderPages     OrderPage[]`
  - `orders         Order[]`
  - `brokerages    Brokerage[]`
  - `payoutBatches PayoutBatch[]`
  - `smsTemplates       SMSTemplate[]`
  - `smsLogs            SMSLog[]`
  - `slackIntegrations  SlackIntegration[]`
  - `dropboxIntegration DropboxIntegration?`
  - `bookingSlots       BookingSlot[]`
  - `bookingForms    BookingForm[]`
  - `productCatalogs ProductCatalog[]`
  - `territories     ServiceTerritory[]`
  - `referralProgram ReferralProgram?`
  - `questionnaireTemplates QuestionnaireTemplate[]`
  - `clientQuestionnaires   ClientQuestionnaire[]`
  - `emailLogs EmailLog[]`
  - `referredByPlatform PlatformReferral[] @relation("ReferredOrgByPlatform")`
  - `recurringInvoices RecurringInvoice[]`
  - `apiKeys          ApiKey[]`
  - `webhookEndpoints WebhookEndpoint[]`
  - `integrationLogs  IntegrationLog[]`
  - `calendarFeeds CalendarFeed[]`
  - `waitlistEntries BookingWaitlist[]`
  - `emailAccounts        EmailAccount[]`
  - `emailThreads         EmailThread[]`
  - `galleryAddons        GalleryAddon[]`
  - `galleryAddonRequests GalleryAddonRequest[]`
- Indexes/constraints:
  - `@@index([slug])`
  - `@@index([plan])`
- Action usage:
  - `analytics-report.ts`
  - `analytics.ts`
  - `api-keys.ts`
  - `booking-crew.ts`
  - `booking-forms.ts`
  - `bookings.ts`
  - `client-questionnaires.ts`
  - `client-selections.ts`
  - `contract-signing.ts`
  - `contracts.ts`
  - `custom-forms.ts`
  - `discount-codes.ts`
  - `download-tracking.ts`
  - `email-logs.ts`
  - `email-settings.ts`
  - `equipment.ts`
  - `galleries.ts`
  - `gallery-activity.ts`
  - `gallery-addons.ts`
  - `gallery-analytics.ts`
  - `gallery-collections.ts`
  - `gallery-expiration.ts`
  - `gallery-feedback.ts`
  - `gallery-reminders.ts`
  - `gallery-templates.ts`
  - `integration-logs.ts`
  - `invitations.ts`
  - `invoice-templates.ts`
  - `invoices.ts`
  - `lead-scoring.ts`
  - `locations.ts`
  - `notification-preferences.ts`
  - `onboarding.ts`
  - `payment-plans.ts`
  - `payments.ts`
  - `questionnaire-portal.ts`
  - `recurring-invoices.ts`
  - `self-booking.ts`
  - `settings.ts`
  - `smart-collections.ts`
  - `sms.ts`
  - `stripe-checkout.ts`
  - `stripe-connect.ts`
  - `stripe-product-sync.ts`
  - `team-capabilities.ts`
  - `territories.ts`
  - `tour.ts`
  - `watermark-settings.ts`
  - `watermark-templates.ts`
  - `webhooks.ts`

### Model: User
- Fields:
  - `id          String  @id @default(cuid())`
  - `clerkUserId String  @unique`
  - `email       String  @unique`
  - `fullName    String?`
  - `avatarUrl   String?`
  - `phone       String?`
  - `firstName String?`
  - `lastName  String?`
  - `hasSeenWelcome       Boolean  @default(false)`
  - `tourCompletedModules String[] @default([])`
  - `dashboardTheme     String  @default("default") // Theme preset: default, midnight, forest, sunset, ocean, lavender`
  - `dashboardAccent    String  @default("#3b82f6") // Custom accent color`
  - `sidebarCompact     Boolean @default(false) // Compact sidebar mode`
  - `sidebarPosition    String  @default("left") // Sidebar position: left, right`
  - `fontFamily         String  @default("system") // Font: system, inter, jakarta, dm-sans, space-grotesk, jetbrains`
  - `density            String  @default("comfortable") // Spacing: compact, comfortable, spacious`
  - `fontSize           String  @default("medium") // Font size: small, medium, large, x-large`
  - `highContrast       Boolean @default(false) // High contrast mode for accessibility`
  - `reduceMotion       Boolean @default(false) // Reduce animations for accessibility`
  - `autoThemeEnabled   Boolean @default(false) // Auto switch theme based on time`
  - `autoThemeDarkStart String  @default("18:00") // When to switch to dark mode (HH:MM)`
  - `autoThemeDarkEnd   String  @default("06:00") // When to switch to light mode (HH:MM)`
  - `dashboardConfig Json? // JSON config for widget visibility, collapsed sections, order`
  - `homeBaseLocationId String?`
  - `stripeConnectAccountId String? @unique`
  - `stripeConnectOnboarded Boolean @default(false)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `memberships         OrganizationMember[]`
  - `activityLogs        ActivityLog[]`
  - `serviceCapabilities UserServiceCapability[]`
  - `equipment           UserEquipment[]`
  - `assignedBookings    Booking[]               @relation("AssignedBookings")`
  - `homeBaseLocation    Location?               @relation("UserHomeBase", fields: [homeBaseLocationId], references: [id])`
  - `assignedTasks       Task[]`
  - `taskComments        TaskComment[]`
  - `equipmentChecks     BookingEquipmentCheck[] @relation("EquipmentChecker")`
  - `crewAssignments     BookingCrew[]           @relation("BookingCrewAssignments")`
  - `platformReferrer   PlatformReferrer?`
  - `referredByPlatform PlatformReferral[] @relation("ReferredByPlatform")`
  - `calendarFeeds   CalendarFeed[]  @relation("UserCalendarFeeds")`
  - `recurringTasks  RecurringTask[]`
  - `taskTimeEntries TaskTimeEntry[]`
- Indexes/constraints:
  - `@@index([email])`
  - `@@index([clerkUserId])`
- Action usage:
  - `activity.ts`
  - `appearance.ts`
  - `availability.ts`
  - `booking-crew.ts`
  - `calendar-feeds.ts`
  - `dashboard.ts`
  - `equipment-checklists.ts`
  - `invitations.ts`
  - `locations.ts`
  - `onboarding.ts`
  - `payouts.ts`
  - `platform-referrals.ts`
  - `projects.ts`
  - `settings.ts`
  - `team-availability.ts`
  - `team-capabilities.ts`
  - `tour.ts`

### Model: OrganizationMember
- Fields:
  - `id             String     @id @default(cuid())`
  - `organizationId String`
  - `userId         String`
  - `role           MemberRole @default(member)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([organizationId, userId])`
  - `@@index([organizationId])`
  - `@@index([userId])`
- Action usage:
  - `booking-crew.ts`
  - `equipment.ts`
  - `gallery-addons.ts`
  - `invitations.ts`
  - `platform-referrals.ts`
  - `settings.ts`
  - `team-capabilities.ts`

### Model: Invitation
- Fields:
  - `id             String           @id @default(cuid())`
  - `organizationId String`
  - `email          String`
  - `role           MemberRole       @default(member)`
  - `status         InvitationStatus @default(pending)`
  - `token     String   @unique`
  - `expiresAt DateTime`
  - `invitedById String`
  - `acceptedAt DateTime?`
  - `revokedAt  DateTime?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([organizationId, email, status]) // Only one pending invitation per email per org`
  - `@@index([organizationId])`
  - `@@index([email])`
  - `@@index([token])`
  - `@@index([status])`
- Action usage:
  - `invitations.ts`

### Model: Client
- Fields:
  - `id             String         @id @default(cuid())`
  - `organizationId String`
  - `email          String`
  - `fullName       String?`
  - `company        String?`
  - `phone          String?`
  - `address        String?`
  - `industry       ClientIndustry @default(other)`
  - `notes          String?`
  - `lifetimeRevenueCents Int @default(0)`
  - `totalProjects        Int @default(0)`
  - `portalAccessToken String?   @unique`
  - `lastPortalAccess  DateTime?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `source         String? // How client found you: REFERRAL, ORGANIC, AD, REPEAT`
  - `preferences    Json? // Client style/delivery preferences`
  - `isVIP          Boolean   @default(false)`
  - `lastActivityAt DateTime?`
  - `smsOptIn                 Boolean @default(true) // Client consent for SMS notifications`
  - `emailOptIn               Boolean @default(true) // Client consent for email communications`
  - `questionnaireEmailsOptIn Boolean @default(true) // Receive questionnaire-related emails`
  - `marketingEmailsOptIn     Boolean @default(false) // Receive marketing emails (opt-in required)`
  - `brokerageId String?`
  - `organization   Organization          @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `brokerage      Brokerage?            @relation("BrokerageAgents", fields: [brokerageId], references: [id], onDelete: SetNull)`
  - `projects       Project[]`
  - `bookings       Booking[]`
  - `invoices       Invoice[]`
  - `creditNotes    CreditNote[]`
  - `contracts      Contract[]`
  - `payments       Payment[]`
  - `clientSessions ClientSession[]`
  - `tasks          Task[]`
  - `communications ClientCommunication[]`
  - `tags           ClientTagAssignment[]`
  - `orderPages OrderPage[] // Dedicated order pages for this client`
  - `orders     Order[] // Orders placed by this client`
  - `referrer  Referrer?  @relation("ClientReferrer")`
  - `referrals Referral[] @relation("ReferralClient")`
  - `questionnaires ClientQuestionnaire[]`
  - `recurringInvoices RecurringInvoice[]`
  - `smsLogs SMSLog[]`
  - `emailLogs EmailLog[]`
  - `notifications ClientNotification[]`
  - `waitlistEntries BookingWaitlist[]`
  - `emailThreads EmailThread[] @relation("ClientEmailThreads")`
  - `estimates Estimate[]`
  - `retainer             ClientRetainer?`
  - `galleryAddonRequests GalleryAddonRequest[]`
- Indexes/constraints:
  - `@@unique([organizationId, email])`
  - `@@index([organizationId])`
  - `@@index([email])`
  - `@@index([industry])`
  - `@@index([brokerageId])`
- Action usage:
  - `analytics-report.ts`
  - `analytics.ts`
  - `booking-forms.ts`
  - `booking-import.ts`
  - `bookings.ts`
  - `brokerages.ts`
  - `chat-inquiries.ts`
  - `client-auth.ts`
  - `client-communications.ts`
  - `client-import.ts`
  - `client-merge.ts`
  - `client-notifications.ts`
  - `client-portal.ts`
  - `client-questionnaires.ts`
  - `client-tags.ts`
  - `clients.ts`
  - `create-wizard.ts`
  - `credit-notes.ts`
  - `email-sync.ts`
  - `estimates.ts`
  - `gallery-expiration.ts`
  - `invoices.ts`
  - `portfolio-websites.ts`
  - `projects.ts`
  - `questionnaire-portal.ts`
  - `recurring-invoices.ts`
  - `retainers.ts`
  - `revenue-forecasting.ts`
  - `search.ts`
  - `seed.ts`
  - `self-booking.ts`
  - `settings.ts`

### Model: ClientSession
- Fields:
  - `id        String   @id @default(cuid())`
  - `clientId  String`
  - `token     String   @unique`
  - `expiresAt DateTime`
  - `createdAt DateTime @default(now())`
  - `client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([clientId])`
  - `@@index([token])`
- Action usage:
  - `client-auth.ts`
  - `clients.ts`
  - `portal-activity.ts`
  - `questionnaire-portal.ts`
  - `seed.ts`

### Model: Service
- Fields:
  - `id             String          @id @default(cuid())`
  - `organizationId String`
  - `name           String`
  - `category       ServiceCategory @default(other)`
  - `description    String?`
  - `priceCents     Int             @default(0)`
  - `duration       String? // e.g., "2-3 hours"`
  - `deliverables   String[] // Array of included items`
  - `isActive       Boolean         @default(true)`
  - `isDefault      Boolean         @default(false) // System-provided template`
  - `sortOrder      Int             @default(0)`
  - `stripeProductId String? // Stripe Product ID (prod_xxx)`
  - `stripePriceId   String? // Stripe Price ID (price_xxx)`
  - `stripeSyncedAt  DateTime? // Last successful sync timestamp`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization          Organization                  @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `projects              Project[] // Galleries using this service (deprecated - use projectServices)`
  - `projectServices       ProjectService[] // Many-to-many: galleries using this service`
  - `bookings              Booking[] // Bookings using this service`
  - `userCapabilities      UserServiceCapability[] // Team members who can perform this service`
  - `equipmentRequirements ServiceEquipmentRequirement[] // Equipment required for this service`
  - `bundleItems        ServiceBundleItem[] // Bundles this service is part of`
  - `addonCompatibility ServiceAddonCompat[] // Addons compatible with this service`
  - `orderPageServices  OrderPageService[] // Order pages featuring this service`
  - `orderItems         OrderItem[] // Order items referencing this service`
  - `bookingFormServices BookingFormService[]`
  - `territoryOverrides TerritoryServiceOverride[] @relation("ServiceTerritoryOverrides")`
  - `galleryTemplates GalleryTemplate[]`
  - `waitlistEntries BookingWaitlist[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([category])`
  - `@@index([isActive])`
  - `@@index([isDefault])`
- Action usage:
  - `addons.ts`
  - `booking-forms.ts`
  - `booking-import.ts`
  - `bookings.ts`
  - `bundles.ts`
  - `create-wizard.ts`
  - `equipment.ts`
  - `order-pages.ts`
  - `orders.ts`
  - `search.ts`
  - `seed.ts`
  - `self-booking.ts`
  - `services.ts`
  - `settings.ts`
  - `stripe-product-sync.ts`
  - `team-capabilities.ts`
  - `waitlist.ts`

### Model: Project
- Fields:
  - `id             String        @id @default(cuid())`
  - `organizationId String`
  - `clientId       String?`
  - `serviceId      String?`
  - `locationId     String?`
  - `name           String`
  - `description    String?`
  - `status         ProjectStatus @default(draft)`
  - `priceCents Int    @default(0)`
  - `currency   String @default("USD")`
  - `coverImageUrl           String?`
  - `password                String?`
  - `expiresAt               DateTime?`
  - `allowDownloads          Boolean               @default(true)`
  - `allowFavorites          Boolean               @default(true)`
  - `allowComments           Boolean               @default(false)`
  - `showWatermark           Boolean               @default(false)`
  - `downloadResolution      GalleryDownloadOption @default(both)`
  - `downloadRequiresPayment Boolean               @default(true) // If true, downloads require payment. If false, allow free downloads even when gallery has a price.`
  - `allowSelections     Boolean @default(true) // Allow clients to make selections`
  - `selectionLimit      Int? // Maximum photos client can select (null = unlimited)`
  - `selectionRequired   Boolean @default(false) // Require selection before download`
  - `selectionsSubmitted Boolean @default(false) // Whether client has submitted selections`
  - `deliveredAt   DateTime?`
  - `archivedAt    DateTime? // When gallery was archived (auto or manual)`
  - `viewCount     Int       @default(0)`
  - `downloadCount Int       @default(0)`
  - `lastReminderSentAt     DateTime? // When last reminder was sent`
  - `reminderCount          Int       @default(0) // Number of reminders sent`
  - `reminderEnabled        Boolean   @default(true) // Allow reminders for this gallery`
  - `expirationWarningsSent Int[]     @default([]) // Days before expiration when warnings were sent (e.g., [7, 3, 1])`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization      Organization              @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client            Client?                   @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `service           Service?                  @relation(fields: [serviceId], references: [id], onDelete: SetNull) // Deprecated - use services`
  - `location          Location?                 @relation(fields: [locationId], references: [id], onDelete: SetNull)`
  - `services          ProjectService[] // Many-to-many: services for this gallery`
  - `assets            Asset[]`
  - `collections       GalleryCollection[] // Sub-albums within the gallery`
  - `deliveryLinks     DeliveryLink[]`
  - `payments          Payment[]`
  - `favorites         GalleryFavorite[]`
  - `comments          GalleryComment[]`
  - `ratings           PhotoRating[]`
  - `feedback          GalleryFeedback[]`
  - `propertyWebsite   PropertyWebsite?`
  - `portfolioWebsites PortfolioWebsiteProject[]`
  - `tasks             Task[]`
  - `questionnaires       ClientQuestionnaire[]`
  - `galleryAddonRequests GalleryAddonRequest[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([clientId])`
  - `@@index([serviceId])`
  - `@@index([locationId])`
  - `@@index([status])`
  - `@@index([createdAt])`
- Action usage:
  - `analytics-report.ts`
  - `analytics.ts`
  - `client-portal.ts`
  - `client-questionnaires.ts`
  - `client-selections.ts`
  - `download-tracking.ts`
  - `dropbox.ts`
  - `email-logs.ts`
  - `galleries.ts`
  - `gallery-activity.ts`
  - `gallery-addons.ts`
  - `gallery-analytics.ts`
  - `gallery-collections.ts`
  - `gallery-expiration.ts`
  - `gallery-reminders.ts`
  - `portal-downloads.ts`
  - `portfolio-websites.ts`
  - `projects.ts`
  - `property-websites.ts`
  - `search.ts`
  - `seed.ts`
  - `settings.ts`
  - `smart-collections.ts`
  - `stripe-checkout.ts`
  - `uploads.ts`

### Model: ProjectService
- Fields:
  - `id                 String   @id @default(cuid())`
  - `projectId          String`
  - `serviceId          String`
  - `isPrimary          Boolean  @default(false) // Mark the primary service if needed`
  - `priceCentsOverride Int? // Override the service price for this specific project`
  - `createdAt          DateTime @default(now())`
  - `project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)`
  - `service Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([projectId, serviceId])`
  - `@@index([projectId])`
  - `@@index([serviceId])`

### Model: GalleryTemplate
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `name           String // Template name`
  - `description    String? // Optional description`
  - `serviceId String?`
  - `defaultPriceCents Int    @default(0)`
  - `currency          String @default("USD")`
  - `isPasswordProtected Boolean @default(false)`
  - `defaultPassword     String? // Optional default password`
  - `allowDownloads    Boolean @default(true)`
  - `allowFavorites    Boolean @default(true)`
  - `showWatermark     Boolean @default(false)`
  - `sendNotifications Boolean @default(true)`
  - `expirationDays Int? // Number of days until expiration (null = never)`
  - `isDefault  Boolean  @default(false) // Mark as default template`
  - `usageCount Int      @default(0) // Track how often template is used`
  - `createdAt  DateTime @default(now())`
  - `updatedAt  DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `service      Service?     @relation(fields: [serviceId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([serviceId])`
- Action usage:
  - `gallery-templates.ts`

### Model: WatermarkTemplate
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name           String // Template name (e.g., "Full Signature", "Corner Logo")`
  - `watermarkType     String // "text" | "image"`
  - `watermarkText     String? // Text content for text watermarks`
  - `watermarkImageUrl String? // Image URL for image watermarks`
  - `watermarkPosition String // "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"`
  - `watermarkOpacity  Float   @default(0.5) // 0.0 to 1.0`
  - `watermarkScale    Float   @default(1.0) // Scale multiplier`
  - `isDefault Boolean  @default(false) // Mark as default template`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([organizationId])`
- Action usage:
  - `watermark-templates.ts`

### Model: GalleryCollection
- Fields:
  - `id           String  @id @default(cuid())`
  - `projectId    String`
  - `name         String`
  - `description  String?`
  - `coverAssetId String? // Cover photo for the collection`
  - `sortOrder    Int     @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)`
  - `assets  Asset[]`
- Indexes/constraints:
  - `@@index([projectId])`
  - `@@index([sortOrder])`
- Action usage:
  - `gallery-collections.ts`

### Model: Asset
- Fields:
  - `id           String  @id @default(cuid())`
  - `projectId    String`
  - `collectionId String? // Optional collection assignment`
  - `filename       String`
  - `originalUrl    String`
  - `thumbnailUrl   String?`
  - `mediumUrl      String?`
  - `watermarkedUrl String?`
  - `mimeType  String`
  - `sizeBytes Int`
  - `width     Int?`
  - `height    Int?`
  - `exifData Json?`
  - `sortOrder Int @default(0)`
  - `excludeFromWatermark Boolean @default(false)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `project       Project            @relation(fields: [projectId], references: [id], onDelete: Cascade)`
  - `collection    GalleryCollection? @relation(fields: [collectionId], references: [id], onDelete: SetNull)`
  - `favorites     GalleryFavorite[]`
  - `comments      GalleryComment[]`
  - `ratings       PhotoRating[]`
  - `productPhotos ProductPhoto[]`
- Indexes/constraints:
  - `@@index([projectId])`
  - `@@index([collectionId])`
  - `@@index([sortOrder])`
- Action usage:
  - `download-tracking.ts`
  - `dropbox.ts`
  - `galleries.ts`
  - `gallery-activity.ts`
  - `gallery-analytics.ts`
  - `gallery-collections.ts`
  - `products.ts`
  - `seed.ts`
  - `smart-collections.ts`
  - `uploads.ts`

### Model: DeliveryLink
- Fields:
  - `id        String @id @default(cuid())`
  - `projectId String`
  - `slug      String @unique`
  - `password  String?`
  - `expiresAt DateTime?`
  - `isActive  Boolean   @default(true)`
  - `viewCount    Int       @default(0)`
  - `lastViewedAt DateTime?`
  - `createdAt DateTime @default(now())`
  - `project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([projectId])`
  - `@@index([slug])`
- Action usage:
  - `galleries.ts`
  - `seed.ts`

### Model: GalleryFavorite
- Fields:
  - `id            String          @id @default(cuid())`
  - `projectId     String`
  - `assetId       String`
  - `clientEmail   String?`
  - `sessionId     String?`
  - `selectionType SelectionType   @default(favorite)`
  - `notes         String? // Client notes for this selection`
  - `status        SelectionStatus @default(in_progress)`
  - `createdAt   DateTime  @default(now())`
  - `submittedAt DateTime? // When the client submitted their selections for review`
  - `project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)`
  - `asset   Asset   @relation(fields: [assetId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([projectId, assetId, clientEmail, selectionType])`
  - `@@index([projectId])`
  - `@@index([assetId])`
  - `@@index([selectionType])`
  - `@@index([status])`
- Action usage:
  - `client-selections.ts`
  - `galleries.ts`
  - `gallery-activity.ts`
  - `seed.ts`

### Model: GalleryComment
- Fields:
  - `id          String  @id @default(cuid())`
  - `projectId   String`
  - `assetId     String? // Optional - if set, this is a per-photo comment; if null, it's a gallery-level comment`
  - `clientEmail String?`
  - `clientName  String?`
  - `content     String`
  - `sessionId   String? // Session ID for secure comment ownership verification`
  - `createdAt DateTime @default(now())`
  - `project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)`
  - `asset   Asset?  @relation(fields: [assetId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([projectId])`
  - `@@index([assetId])`
  - `@@index([sessionId])`
- Action usage:
  - `galleries.ts`
  - `seed.ts`

### Model: PhotoRating
- Fields:
  - `id        String @id @default(cuid())`
  - `projectId String`
  - `assetId   String`
  - `rating    Int // 1-5 stars`
  - `sessionId String // Track who rated for updates`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)`
  - `asset   Asset   @relation(fields: [assetId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([assetId, sessionId])`
  - `@@index([projectId])`
  - `@@index([assetId])`
- Action usage:
  - `download-tracking.ts`

### Model: GalleryFeedback
- Fields:
  - `id             String  @id @default(cuid())`
  - `projectId      String`
  - `organizationId String`
  - `type           String // "feedback", "feature", "issue"`
  - `message        String`
  - `clientName     String?`
  - `clientEmail    String?`
  - `ipAddress      String?`
  - `userAgent      String?`
  - `isRead         Boolean @default(false)`
  - `isResolved     Boolean @default(false)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([projectId])`
  - `@@index([organizationId])`
  - `@@index([type])`
  - `@@index([isRead])`
- Action usage:
  - `gallery-feedback.ts`

### Model: Payment
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `projectId      String?`
  - `invoiceId      String?`
  - `clientId       String?`
  - `amountCents    Int`
  - `tipAmountCents Int           @default(0) // Gratuity amount`
  - `currency       String        @default("USD")`
  - `status         PaymentStatus @default(pending)`
  - `stripePaymentIntentId   String? @unique`
  - `stripeCheckoutSessionId String? @unique`
  - `stripeChargeId          String?`
  - `clientEmail String?`
  - `clientName  String?`
  - `description String?`
  - `receiptUrl  String?`
  - `paidAt    DateTime?`
  - `createdAt DateTime  @default(now())`
  - `updatedAt DateTime  @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `project      Project?     @relation(fields: [projectId], references: [id], onDelete: SetNull)`
  - `invoice      Invoice?     @relation(fields: [invoiceId], references: [id], onDelete: SetNull)`
  - `client       Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([projectId])`
  - `@@index([invoiceId])`
  - `@@index([clientId])`
  - `@@index([status])`
  - `@@index([createdAt])`
- Action usage:
  - `analytics-report.ts`
  - `analytics.ts`
  - `clients.ts`
  - `gallery-activity.ts`
  - `invoice-payments.ts`
  - `payments.ts`
  - `receipt-pdf.ts`
  - `revenue-forecasting.ts`
  - `seed.ts`
  - `settings.ts`
  - `stripe-checkout.ts`

### Model: BookingType
- Fields:
  - `id              String  @id @default(cuid())`
  - `organizationId  String`
  - `name            String`
  - `description     String?`
  - `durationMinutes Int     @default(60)`
  - `priceCents      Int     @default(0)`
  - `color           String  @default("#3b82f6")`
  - `isActive        Boolean @default(true)`
  - `bufferBeforeMinutes Int @default(0) // Prep time before booking`
  - `bufferAfterMinutes  Int @default(0) // Travel/wrap-up time after booking`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization          Organization                      @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `bookings              Booking[]`
  - `equipmentRequirements BookingTypeEquipmentRequirement[]`
- Indexes/constraints:
  - `@@index([organizationId])`
- Action usage:
  - `booking-types.ts`
  - `create-wizard.ts`
  - `equipment-checklists.ts`

### Model: Booking
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `clientId       String?`
  - `bookingTypeId  String?`
  - `serviceId      String?`
  - `locationId     String?`
  - `assignedUserId String?`
  - `title       String`
  - `description String?`
  - `status      BookingStatus @default(pending)`
  - `startTime DateTime`
  - `endTime   DateTime`
  - `timezone  String   @default("America/New_York")`
  - `clientName  String?`
  - `clientEmail String?`
  - `clientPhone String?`
  - `location      String?`
  - `locationNotes String?`
  - `isVirtual     Boolean @default(false)`
  - `meetingUrl    String?`
  - `distanceMiles     Float?`
  - `travelTimeMinutes Int?`
  - `travelFeeCents    Int?   @default(0)`
  - `bufferBeforeMinutes Int? // Prep time before booking`
  - `bufferAfterMinutes  Int? // Travel/wrap-up time after booking`
  - `weatherCache    Json?`
  - `weatherCachedAt DateTime?`
  - `notes         String?`
  - `internalNotes String?`
  - `isMultiDay       Boolean @default(false)`
  - `multiDayName     String? // Overall event name like "Smith Wedding Weekend"`
  - `multiDayParentId String? // For sessions within a multi-day event`
  - `isRecurring          Boolean            @default(false)`
  - `recurrencePattern    RecurrencePattern?`
  - `recurrenceInterval   Int?               @default(1) // e.g., every 2 weeks`
  - `recurrenceEndDate    DateTime? // Optional end date for the series`
  - `recurrenceCount      Int? // Optional max occurrences`
  - `recurrenceDaysOfWeek Int[]              @default([]) // For weekly: 0=Sun, 1=Mon, etc.`
  - `seriesId             String? // Groups all bookings in a series`
  - `parentBookingId      String? // Reference to the original booking`
  - `industry Industry?`
  - `completedAt DateTime? // When booking status changed to "completed"`
  - `followupsSent String[] @default([]) // Tracks which follow-up emails were sent (e.g., "thank_you_1", "review_request_3")`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization       Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client             Client?                 @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `bookingType        BookingType?            @relation(fields: [bookingTypeId], references: [id], onDelete: SetNull)`
  - `service            Service?                @relation(fields: [serviceId], references: [id], onDelete: SetNull)`
  - `locationRef        Location?               @relation(fields: [locationId], references: [id], onDelete: SetNull)`
  - `assignedUser       User?                   @relation("AssignedBookings", fields: [assignedUserId], references: [id], onDelete: SetNull)`
  - `reminders          BookingReminder[]`
  - `invoiceLineItems   InvoiceLineItem[]`
  - `tasks              Task[]`
  - `equipmentChecklist BookingEquipmentCheck[]`
  - `orderId String? @unique`
  - `order   Order?  @relation("OrderBooking", fields: [orderId], references: [id], onDelete: SetNull)`
  - `formSubmission BookingFormSubmission?`
  - `parentBooking Booking?  @relation("RecurringBookings", fields: [parentBookingId], references: [id], onDelete: SetNull)`
  - `childBookings Booking[] @relation("RecurringBookings")`
  - `multiDayParent   Booking?  @relation("MultiDaySessions", fields: [multiDayParentId], references: [id], onDelete: SetNull)`
  - `multiDaySessions Booking[] @relation("MultiDaySessions")`
  - `crew BookingCrew[]`
  - `referrals Referral[] @relation("ReferralBooking")`
  - `questionnaires ClientQuestionnaire[]`
  - `smsLogs SMSLog[]`
  - `convertedFromWaitlist BookingWaitlist? @relation("WaitlistConversion")`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([multiDayParentId])`
  - `@@index([clientId])`
  - `@@index([serviceId])`
  - `@@index([locationId])`
  - `@@index([assignedUserId])`
  - `@@index([startTime])`
  - `@@index([status])`
  - `@@index([seriesId])`
  - `@@index([parentBookingId])`
  - `@@index([industry])`
- Action usage:
  - `availability.ts`
  - `booking-crew.ts`
  - `booking-forms.ts`
  - `booking-import.ts`
  - `booking-types.ts`
  - `bookings.ts`
  - `bundles.ts`
  - `client-questionnaires.ts`
  - `email-logs.ts`
  - `equipment-checklists.ts`
  - `equipment.ts`
  - `field-operations.ts`
  - `google-calendar.ts`
  - `invoices.ts`
  - `photographer-pay.ts`
  - `projects.ts`
  - `questionnaire-portal.ts`
  - `revenue-forecasting.ts`
  - `search.ts`
  - `seed.ts`
  - `self-booking.ts`
  - `settings.ts`
  - `team-availability.ts`
  - `waitlist.ts`

### Model: BookingWaitlist
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `clientId    String?`
  - `clientName  String`
  - `clientEmail String`
  - `clientPhone String?`
  - `serviceId     String?`
  - `preferredDate DateTime // Preferred date/time`
  - `alternateDate DateTime? // Alternate date if available`
  - `flexibleDates Boolean   @default(false) // Willing to take any available slot`
  - `notes         String? // Special requests`
  - `status             WaitlistStatus @default(pending)`
  - `priority           Int            @default(0) // Higher = more priority`
  - `position           Int? // Position in queue (calculated)`
  - `notifiedAt         DateTime? // When client was notified of availability`
  - `expiresAt          DateTime? // When the offer expires`
  - `convertedBookingId String?        @unique // If converted to booking`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client           Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `service          Service?     @relation(fields: [serviceId], references: [id], onDelete: SetNull)`
  - `convertedBooking Booking?     @relation("WaitlistConversion", fields: [convertedBookingId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([clientId])`
  - `@@index([serviceId])`
  - `@@index([status])`
  - `@@index([preferredDate])`
  - `@@index([priority])`
- Action usage:
  - `waitlist.ts`

### Model: BookingCrew
- Fields:
  - `id        String @id @default(cuid())`
  - `bookingId String`
  - `userId    String`
  - `role       BookingCrewRole @default(second_shooter)`
  - `notes      String? // Special instructions for this team member`
  - `hourlyRate Int? // Rate in cents (override user default)`
  - `confirmed  Boolean         @default(false) // Has the crew member confirmed availability`
  - `confirmedAt DateTime?`
  - `declinedAt  DateTime?`
  - `declineNote String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)`
  - `user    User    @relation("BookingCrewAssignments", fields: [userId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([bookingId, userId])`
  - `@@index([bookingId])`
  - `@@index([userId])`
  - `@@index([confirmed])`
- Action usage:
  - `booking-crew.ts`

### Model: BookingReminder
- Fields:
  - `id        String    @id @default(cuid())`
  - `bookingId String`
  - `sendAt    DateTime`
  - `sent      Boolean   @default(false)`
  - `sentAt    DateTime?`
  - `type          ReminderType      @default(hours_24)`
  - `channel       ReminderChannel   @default(email)`
  - `recipient     ReminderRecipient @default(client)`
  - `minutesBefore Int               @default(1440) // 24 hours = 1440 minutes`
  - `errorMessage String?`
  - `createdAt DateTime @default(now())`
  - `booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([bookingId])`
  - `@@index([sendAt])`
  - `@@index([sent, sendAt]) // For finding unsent reminders due to be sent`
- Action usage:
  - `bookings.ts`
  - `seed.ts`

### Model: Invoice
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `clientId       String?`
  - `invoiceNumber  String`
  - `status InvoiceStatus @default(draft)`
  - `subtotalCents   Int    @default(0)`
  - `taxCents        Int    @default(0)`
  - `discountCents   Int    @default(0)`
  - `totalCents      Int    @default(0)`
  - `paidAmountCents Int    @default(0) // Tracks partial payments`
  - `currency        String @default("USD")`
  - `lateFeeEnabled      Boolean   @default(false)`
  - `lateFeeType         String?   @default("percentage") // "percentage" or "fixed"`
  - `lateFeePercent      Float?    @default(5) // e.g., 5 = 5%`
  - `lateFeeFlatCents    Int? // Flat fee in cents`
  - `lateFeeAppliedCents Int       @default(0) // Total late fees applied`
  - `lastLateFeeAt       DateTime? // When late fee was last applied`
  - `issueDate DateTime  @default(now())`
  - `dueDate   DateTime`
  - `paidAt    DateTime?`
  - `clientName    String?`
  - `clientEmail   String?`
  - `clientAddress String?`
  - `notes String?`
  - `terms String?`
  - `stripePaymentLinkId String?`
  - `paymentLinkUrl      String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client       Client?           @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `lineItems    InvoiceLineItem[]`
  - `payments     Payment[]`
  - `tasks        Task[]`
  - `orderId String? @unique`
  - `order   Order?  @relation("OrderInvoice", fields: [orderId], references: [id], onDelete: SetNull)`
  - `referrals Referral[] @relation("ReferralInvoice")`
  - `remindersSent  Int       @default(0)`
  - `lastReminderAt DateTime?`
  - `nextReminderAt DateTime?`
  - `autoReminders  Boolean   @default(true) // Enable/disable auto reminders`
  - `scheduledSendAt DateTime? // When to automatically send the invoice`
  - `scheduledSentAt DateTime? // When the scheduled send was processed`
  - `creditNotesOriginal CreditNote[] @relation("CreditNoteOriginalInvoice") // Credit notes issued for this invoice`
  - `creditNotesApplied  CreditNote[] @relation("CreditNoteAppliedInvoice") // Credit notes applied to this invoice`
  - `isDeposit       Boolean   @default(false) // Is this a deposit invoice?`
  - `isBalance       Boolean   @default(false) // Is this a balance invoice?`
  - `depositPercent  Float? // Deposit percentage (e.g., 50 for 50%)`
  - `parentInvoiceId String? // Link to the original invoice (for deposit/balance invoices)`
  - `parentInvoice   Invoice?  @relation("InvoiceDepositBalance", fields: [parentInvoiceId], references: [id], onDelete: SetNull)`
  - `childInvoices   Invoice[] @relation("InvoiceDepositBalance") // Deposit and balance invoices`
  - `attachments InvoiceAttachment[]`
  - `estimateSource       Estimate?             @relation("EstimateToInvoice")`
  - `galleryAddonRequests GalleryAddonRequest[]`
- Indexes/constraints:
  - `@@unique([organizationId, invoiceNumber])`
  - `@@index([organizationId])`
  - `@@index([clientId])`
  - `@@index([status])`
  - `@@index([dueDate])`
- Action usage:
  - `analytics-report.ts`
  - `analytics.ts`
  - `client-portal.ts`
  - `credit-notes.ts`
  - `estimates.ts`
  - `invoice-analytics.ts`
  - `invoice-attachments.ts`
  - `invoice-email-templates.ts`
  - `invoice-payments.ts`
  - `invoice-pdf.ts`
  - `invoice-splits.ts`
  - `invoices.ts`
  - `portal-downloads.ts`
  - `recurring-invoices.ts`
  - `retainers.ts`
  - `revenue-forecasting.ts`
  - `search.ts`
  - `seed.ts`
  - `settings.ts`
  - `stripe-checkout.ts`

### Model: InvoiceLineItem
- Fields:
  - `id          String       @id @default(cuid())`
  - `invoiceId   String`
  - `bookingId   String? // Link to booking for travel fees`
  - `itemType    LineItemType @default(service)`
  - `description String`
  - `quantity    Int          @default(1)`
  - `unitCents   Int`
  - `totalCents  Int`
  - `sortOrder   Int          @default(0)`
  - `createdAt DateTime @default(now())`
  - `invoice Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)`
  - `booking Booking? @relation(fields: [bookingId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([invoiceId])`
  - `@@index([bookingId])`
  - `@@index([itemType])`
- Action usage:
  - `invoices.ts`
  - `seed.ts`

### Model: CreditNote
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `clientId       String?`
  - `invoiceId      String? // Optional link to original invoice`
  - `creditNoteNumber String`
  - `status CreditNoteStatus @default(draft)`
  - `amountCents Int    @default(0)`
  - `currency    String @default("USD")`
  - `clientName  String?`
  - `clientEmail String?`
  - `reason      String? // Reason for the credit note`
  - `description String? // Detailed description`
  - `notes       String? // Internal notes`
  - `appliedToInvoiceId  String? // If applied to a different invoice`
  - `appliedAmountCents  Int       @default(0) // Amount applied from this credit note`
  - `appliedAt           DateTime?`
  - `refundedAmountCents Int       @default(0) // Amount refunded to client`
  - `refundedAt          DateTime?`
  - `issueDate DateTime @default(now())`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client           Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `invoice          Invoice?     @relation("CreditNoteOriginalInvoice", fields: [invoiceId], references: [id], onDelete: SetNull)`
  - `appliedToInvoice Invoice?     @relation("CreditNoteAppliedInvoice", fields: [appliedToInvoiceId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@unique([organizationId, creditNoteNumber])`
  - `@@index([organizationId])`
  - `@@index([clientId])`
  - `@@index([invoiceId])`
  - `@@index([status])`
- Action usage:
  - `credit-notes.ts`

### Model: InvoiceTemplate
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name        String // Template name (e.g., "Wedding Package", "Headshot Session")`
  - `description String? // Optional description`
  - `category    String? // Category for organization (e.g., "Weddings", "Portraits")`
  - `defaultDueDays Int     @default(30) // Days until due`
  - `defaultNotes   String? // Default invoice notes`
  - `defaultTerms   String? // Default terms and conditions`
  - `taxRate        Float? // Default tax rate override`
  - `lineItems Json // Array of { itemType, description, quantity, unitCents }`
  - `subtotalCents Int @default(0)`
  - `taxCents      Int @default(0)`
  - `totalCents    Int @default(0)`
  - `isActive   Boolean @default(true)`
  - `isDefault  Boolean @default(false) // Default template for new invoices`
  - `usageCount Int     @default(0) // Track how often this template is used`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([category])`
  - `@@index([isActive])`
- Action usage:
  - `invoice-presets.ts`

### Model: Estimate
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `clientId       String?`
  - `estimateNumber String`
  - `status EstimateStatus @default(draft)`
  - `subtotalCents Int    @default(0)`
  - `taxCents      Int    @default(0)`
  - `discountCents Int    @default(0)`
  - `totalCents    Int    @default(0)`
  - `currency      String @default("USD")`
  - `clientName    String?`
  - `clientEmail   String?`
  - `clientAddress String?`
  - `title       String? // Project/service title`
  - `description String? // Detailed description`
  - `notes       String?`
  - `terms       String?`
  - `issueDate  DateTime @default(now())`
  - `validUntil DateTime // When the estimate expires`
  - `convertedToInvoiceId String?   @unique`
  - `convertedAt          DateTime?`
  - `viewedAt        DateTime?`
  - `approvedAt      DateTime?`
  - `rejectedAt      DateTime?`
  - `rejectionReason String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization       Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client             Client?            @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `convertedToInvoice Invoice?           @relation("EstimateToInvoice", fields: [convertedToInvoiceId], references: [id], onDelete: SetNull)`
  - `lineItems          EstimateLineItem[]`
- Indexes/constraints:
  - `@@unique([organizationId, estimateNumber])`
  - `@@index([organizationId])`
  - `@@index([clientId])`
  - `@@index([status])`
- Action usage:
  - `estimates.ts`
  - `invoice-email-templates.ts`

### Model: EstimateLineItem
- Fields:
  - `id          String       @id @default(cuid())`
  - `estimateId  String`
  - `itemType    LineItemType @default(service)`
  - `description String`
  - `quantity    Int          @default(1)`
  - `unitCents   Int`
  - `totalCents  Int`
  - `sortOrder   Int          @default(0)`
  - `createdAt DateTime @default(now())`
  - `estimate Estimate @relation(fields: [estimateId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([estimateId])`

### Model: InvoiceAttachment
- Fields:
  - `id        String @id @default(cuid())`
  - `invoiceId String`
  - `fileName    String`
  - `fileUrl     String`
  - `fileType    String // MIME type`
  - `fileSizeMb  Float   @default(0)`
  - `description String?`
  - `createdAt DateTime @default(now())`
  - `invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([invoiceId])`
- Action usage:
  - `invoice-attachments.ts`

### Model: ClientRetainer
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `clientId       String @unique // One-to-one with Client`
  - `balanceCents        Int    @default(0) // Current available balance`
  - `totalDepositedCents Int    @default(0) // Lifetime deposits`
  - `totalUsedCents      Int    @default(0) // Lifetime usage`
  - `currency            String @default("USD")`
  - `isActive                 Boolean @default(true)`
  - `lowBalanceThresholdCents Int? // Alert when balance falls below this`
  - `notes String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization          @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client       Client                @relation(fields: [clientId], references: [id], onDelete: Cascade)`
  - `transactions RetainerTransaction[]`
- Indexes/constraints:
  - `@@unique([organizationId, clientId]) // One retainer per client`
  - `@@index([organizationId])`
  - `@@index([clientId])`
- Action usage:
  - `retainers.ts`

### Model: RetainerTransaction
- Fields:
  - `id         String @id @default(cuid())`
  - `retainerId String`
  - `type        RetainerTransactionType`
  - `amountCents Int`
  - `description String?`
  - `invoiceId String? // If applied to an invoice`
  - `paymentId String? // If from a payment`
  - `balanceAfterCents Int // Balance after this transaction`
  - `createdAt DateTime @default(now())`
  - `retainer ClientRetainer @relation(fields: [retainerId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([retainerId])`
  - `@@index([invoiceId])`
- Action usage:
  - `retainers.ts`

### Model: RecurringInvoice
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `clientId       String`
  - `frequency   RecurringFrequency @default(monthly)`
  - `dayOfMonth  Int?               @default(1) // 1-28 for monthly`
  - `dayOfWeek   Int? // 0-6 for weekly (0 = Sunday)`
  - `anchorDate  DateTime // Start date for the recurring schedule`
  - `nextRunDate DateTime // Next scheduled invoice creation`
  - `isActive   Boolean   @default(true)`
  - `isPaused   Boolean   @default(false)`
  - `pausedAt   DateTime?`
  - `pauseUntil DateTime? // Resume date if paused temporarily`
  - `subtotalCents Int     @default(0)`
  - `taxCents      Int     @default(0)`
  - `totalCents    Int     @default(0)`
  - `currency      String  @default("USD")`
  - `notes         String?`
  - `terms         String?`
  - `dueDays       Int     @default(30) // Days after creation until due`
  - `lineItems Json // Array of { itemType, description, quantity, unitCents }`
  - `invoicesCreated Int       @default(0)`
  - `lastInvoiceAt   DateTime?`
  - `lastInvoiceId   String? // Reference to last created invoice`
  - `endDate     DateTime? // Stop after this date`
  - `maxInvoices Int? // Stop after this many invoices`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client       Client       @relation(fields: [clientId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([clientId])`
  - `@@index([isActive])`
  - `@@index([nextRunDate])`
- Action usage:
  - `recurring-invoices.ts`

### Model: ContractTemplate
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `name           String`
  - `description    String?`
  - `content        String  @db.Text`
  - `isDefault      Boolean @default(false)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `contracts    Contract[]`
- Indexes/constraints:
  - `@@index([organizationId])`
- Action usage:
  - `seed.ts`

### Model: Contract
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `clientId       String?`
  - `templateId     String?`
  - `name    String`
  - `content String         @db.Text`
  - `status  ContractStatus @default(draft)`
  - `pdfUrl String?`
  - `sentAt    DateTime?`
  - `signedAt  DateTime?`
  - `expiresAt DateTime?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client       Client?             @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `template     ContractTemplate?   @relation(fields: [templateId], references: [id], onDelete: SetNull)`
  - `signers      ContractSigner[]`
  - `auditLogs    ContractAuditLog[]`
  - `signatures   ContractSignature[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([clientId])`
  - `@@index([status])`
- Action usage:
  - `contract-pdf.ts`
  - `contract-signing.ts`
  - `contract-templates.ts`
  - `contracts.ts`
  - `email-logs.ts`
  - `seed.ts`

### Model: ContractSigner
- Fields:
  - `id         String  @id @default(cuid())`
  - `contractId String`
  - `email      String`
  - `name       String?`
  - `signatureUrl    String?`
  - `signedAt        DateTime?`
  - `signedIp        String?`
  - `signedUserAgent String?`
  - `signingToken   String    @unique`
  - `tokenExpiresAt DateTime?`
  - `sortOrder Int @default(0)`
  - `createdAt DateTime @default(now())`
  - `contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([contractId])`
  - `@@index([signingToken])`
- Action usage:
  - `contract-signing.ts`
  - `contracts.ts`
  - `seed.ts`

### Model: ContractAuditLog
- Fields:
  - `id         String  @id @default(cuid())`
  - `contractId String`
  - `action     String`
  - `actorEmail String?`
  - `actorIp    String?`
  - `metadata   Json?`
  - `createdAt DateTime @default(now())`
  - `contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([contractId])`
  - `@@index([createdAt])`
- Action usage:
  - `contract-signing.ts`
  - `contracts.ts`
  - `seed.ts`

### Model: ActivityLog
- Fields:
  - `id             String       @id @default(cuid())`
  - `organizationId String`
  - `userId         String?`
  - `type           ActivityType`
  - `description    String`
  - `metadata       Json?`
  - `projectId  String?`
  - `clientId   String?`
  - `paymentId  String?`
  - `bookingId  String?`
  - `invoiceId  String?`
  - `contractId String?`
  - `createdAt DateTime @default(now())`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `user         User?        @relation(fields: [userId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([userId])`
  - `@@index([type])`
  - `@@index([createdAt])`
- Action usage:
  - `activity.ts`
  - `booking-import.ts`
  - `bookings.ts`
  - `client-selections.ts`
  - `clients.ts`
  - `contract-signing.ts`
  - `contracts.ts`
  - `galleries.ts`
  - `gallery-activity.ts`
  - `gallery-addons.ts`
  - `gallery-analytics.ts`
  - `gallery-reminders.ts`
  - `payments.ts`
  - `portfolio-websites.ts`
  - `seed.ts`
  - `uploads.ts`
  - `waitlist.ts`

### Model: Notification
- Fields:
  - `id             String           @id @default(cuid())`
  - `organizationId String`
  - `type           NotificationType`
  - `title          String`
  - `message        String`
  - `linkUrl        String?`
  - `read           Boolean          @default(false)`
  - `readAt         DateTime?`
  - `createdAt DateTime @default(now())`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([read])`
  - `@@index([createdAt])`
- Action usage:
  - `notifications.ts`
  - `platform-referrals.ts`
  - `seed.ts`

### Model: ClientNotification
- Fields:
  - `id       String                 @id @default(cuid())`
  - `clientId String`
  - `type     ClientNotificationType`
  - `title    String`
  - `message  String`
  - `linkUrl  String?`
  - `read     Boolean                @default(false)`
  - `readAt   DateTime?`
  - `createdAt DateTime @default(now())`
  - `client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([clientId])`
  - `@@index([read])`
  - `@@index([createdAt])`
- Action usage:
  - `client-notifications.ts`

### Model: UsageMeter
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `month          String // "2025-01" format`
  - `storageBytes     BigInt @default(0)`
  - `galleriesCreated Int    @default(0)`
  - `emailsSent       Int    @default(0)`
  - `apiCalls         Int    @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([organizationId, month])`
  - `@@index([organizationId])`
  - `@@index([month])`

### Model: OnboardingProgress
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String @unique`
  - `profileComplete     Boolean @default(false)`
  - `brandingComplete    Boolean @default(false)`
  - `firstGalleryCreated Boolean @default(false)`
  - `stripeConnected     Boolean @default(false)`
  - `welcomeViewed    Boolean @default(false) // Step 0`
  - `personalComplete Boolean @default(false) // Step 1: First/last name`
  - `businessComplete Boolean @default(false) // Step 2: Company, type, size`
  - `brandingStepDone Boolean @default(false) // Step 3: Display mode, public info`
  - `industriesSet    Boolean @default(false) // Step 4: Industry selection`
  - `featuresSelected Boolean @default(false) // Step 5: Module selection`
  - `goalsSet         Boolean @default(false) // Step 6: Business goals`
  - `paymentStepDone  Boolean @default(false) // Step 7: Payment/trial setup`
  - `tourStarted      Boolean @default(false) // Step 8: Guided tour`
  - `currentStep  Int      @default(0)`
  - `skippedSteps String[] @default([]) // Steps user skipped`
  - `selectedGoals String[] @default([])`
  - `completedAt DateTime?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Action usage:
  - `onboarding.ts`

### Model: Location
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `placeId          String? // Google Place ID for caching`
  - `formattedAddress String`
  - `streetAddress    String?`
  - `city             String?`
  - `state            String?`
  - `postalCode       String?`
  - `country          String  @default("US")`
  - `latitude  Float`
  - `longitude Float`
  - `notes String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization    Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `orgHomeBase     Organization[]   @relation("OrgHomeBase")`
  - `userHomeBase    User[]           @relation("UserHomeBase")`
  - `bookings        Booking[]`
  - `projects        Project[]`
  - `propertyDetails PropertyDetails?`
  - `orders Order[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([placeId])`
- Action usage:
  - `create-wizard.ts`
  - `locations.ts`
  - `team-capabilities.ts`

### Model: PropertyDetails
- Fields:
  - `id         String @id @default(cuid())`
  - `locationId String @unique`
  - `propertyType PropertyType?`
  - `bedrooms     Int?`
  - `bathrooms    Float? // 2.5 baths, etc.`
  - `squareFeet   Int?`
  - `lotSize      Int? // in sqft`
  - `yearBuilt    Int?`
  - `listingPrice Int? // in cents`
  - `mlsNumber         String?`
  - `listingAgent      String?`
  - `listingAgentPhone String?`
  - `dataSource String? // "attom", "zillow", "manual"`
  - `fetchedAt  DateTime?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `location Location @relation(fields: [locationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([mlsNumber])`

### Model: Equipment
- Fields:
  - `id             String            @id @default(cuid())`
  - `organizationId String`
  - `name           String`
  - `category       EquipmentCategory`
  - `description    String?`
  - `serialNumber   String?`
  - `purchaseDate   DateTime?`
  - `valueCents     Int? // Equipment value in cents`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization            Organization                      @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `userAssignments         UserEquipment[]`
  - `serviceRequirements     ServiceEquipmentRequirement[]`
  - `bookingTypeRequirements BookingTypeEquipmentRequirement[]`
  - `bookingChecks           BookingEquipmentCheck[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([category])`
- Action usage:
  - `equipment-checklists.ts`
  - `equipment.ts`
  - `seed.ts`

### Model: UserEquipment
- Fields:
  - `id          String   @id @default(cuid())`
  - `userId      String`
  - `equipmentId String`
  - `assignedAt  DateTime @default(now())`
  - `notes       String?`
  - `user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)`
  - `equipment Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([userId, equipmentId])`
  - `@@index([userId])`
  - `@@index([equipmentId])`
- Action usage:
  - `equipment.ts`
  - `seed.ts`

### Model: UserServiceCapability
- Fields:
  - `id        String          @id @default(cuid())`
  - `userId    String`
  - `serviceId String`
  - `level     CapabilityLevel @default(capable)`
  - `notes     String?`
  - `createdAt DateTime @default(now())`
  - `user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)`
  - `service Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([userId, serviceId])`
  - `@@index([userId])`
  - `@@index([serviceId])`
  - `@@index([level])`
- Action usage:
  - `seed.ts`
  - `team-capabilities.ts`

### Model: ServiceEquipmentRequirement
- Fields:
  - `id          String  @id @default(cuid())`
  - `serviceId   String`
  - `equipmentId String`
  - `isRequired  Boolean @default(true) // vs. recommended`
  - `service   Service   @relation(fields: [serviceId], references: [id], onDelete: Cascade)`
  - `equipment Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([serviceId, equipmentId])`
  - `@@index([serviceId])`
  - `@@index([equipmentId])`
- Action usage:
  - `equipment.ts`
  - `seed.ts`
  - `team-capabilities.ts`

### Model: BookingTypeEquipmentRequirement
- Fields:
  - `id            String  @id @default(cuid())`
  - `bookingTypeId String`
  - `equipmentId   String`
  - `isRequired    Boolean @default(true) // Required vs recommended`
  - `quantity      Int     @default(1) // How many of this item needed`
  - `notes         String? // Special instructions for this equipment`
  - `bookingType BookingType @relation(fields: [bookingTypeId], references: [id], onDelete: Cascade)`
  - `equipment   Equipment   @relation(fields: [equipmentId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([bookingTypeId, equipmentId])`
  - `@@index([bookingTypeId])`
  - `@@index([equipmentId])`
- Action usage:
  - `equipment-checklists.ts`

### Model: BookingEquipmentCheck
- Fields:
  - `id          String    @id @default(cuid())`
  - `bookingId   String`
  - `equipmentId String`
  - `isChecked   Boolean   @default(false) // Has the item been checked/packed?`
  - `checkedAt   DateTime? // When it was checked`
  - `checkedById String? // Who checked it`
  - `notes       String? // Any notes about this item for this booking`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `booking   Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)`
  - `equipment Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)`
  - `checkedBy User?     @relation("EquipmentChecker", fields: [checkedById], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@unique([bookingId, equipmentId])`
  - `@@index([bookingId])`
  - `@@index([equipmentId])`
- Action usage:
  - `equipment-checklists.ts`
  - `equipment.ts`

### Model: PropertyWebsite
- Fields:
  - `id        String @id @default(cuid())`
  - `projectId String @unique`
  - `address      String`
  - `city         String`
  - `state        String`
  - `zipCode      String`
  - `price        Int? // in cents`
  - `beds         Int?`
  - `baths        Float?`
  - `sqft         Int?`
  - `lotSize      String?`
  - `yearBuilt    Int?`
  - `propertyType PropertyType?`
  - `headline       String?`
  - `description    String?  @db.Text`
  - `features       String[] // Array of feature highlights`
  - `virtualTourUrl String? // Matterport, iGuide, etc.`
  - `videoUrl       String?`
  - `template     PropertyWebsiteTemplate @default(modern)`
  - `isPublished  Boolean                 @default(false)`
  - `isBranded    Boolean                 @default(true) // Show photographer branding`
  - `showPrice    Boolean                 @default(true)`
  - `showAgent    Boolean                 @default(true)`
  - `customDomain String?                 @unique`
  - `accentColor String? // Custom accent color override (hex, e.g., "#3b82f6")`
  - `openHouseDate    DateTime? // Open house start date/time`
  - `openHouseEndDate DateTime? // Open house end date/time (optional, defaults to +2 hours)`
  - `slug            String  @unique`
  - `metaTitle       String?`
  - `metaDescription String?`
  - `viewCount Int @default(0)`
  - `createdAt   DateTime  @default(now())`
  - `updatedAt   DateTime  @updatedAt`
  - `publishedAt DateTime?`
  - `project         Project             @relation(fields: [projectId], references: [id], onDelete: Cascade)`
  - `analytics       PropertyAnalytics[]`
  - `marketingAssets MarketingAsset[]`
  - `leads           PropertyLead[]`
  - `tasks           Task[]`
- Indexes/constraints:
  - `@@index([slug])`
  - `@@index([isPublished])`
- Action usage:
  - `client-portal.ts`
  - `lead-scoring.ts`
  - `marketing-assets.ts`
  - `portal-downloads.ts`
  - `property-websites.ts`
  - `search.ts`
  - `seed.ts`
  - `settings.ts`

### Model: PropertyAnalytics
- Fields:
  - `id                String   @id @default(cuid())`
  - `propertyWebsiteId String`
  - `date              DateTime @default(now()) @db.Date`
  - `pageViews      Int  @default(0)`
  - `uniqueVisitors Int  @default(0)`
  - `avgTimeOnPage  Int? // seconds`
  - `tourClicks   Int @default(0)`
  - `photoViews   Int @default(0)`
  - `socialShares Int @default(0)`
  - `directTraffic Int @default(0)`
  - `socialTraffic Int @default(0)`
  - `emailTraffic  Int @default(0)`
  - `searchTraffic Int @default(0)`
  - `mobileViews  Int @default(0)`
  - `desktopViews Int @default(0)`
  - `tabletViews  Int @default(0)`
  - `propertyWebsite PropertyWebsite @relation(fields: [propertyWebsiteId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([propertyWebsiteId, date])`
  - `@@index([propertyWebsiteId])`
  - `@@index([date])`
- Action usage:
  - `property-websites.ts`
  - `seed.ts`

### Model: PropertyLead
- Fields:
  - `id                String @id @default(cuid())`
  - `propertyWebsiteId String`
  - `name    String`
  - `email   String`
  - `phone   String?`
  - `message String? @db.Text`
  - `source  String? // website, social, email, etc.`
  - `status LeadStatus @default(new)`
  - `score          Int    @default(0) // 0-100 score`
  - `scoreBreakdown Json? // { "pageViews": 10, "timeOnSite": 15, "photoViews": 20, ... }`
  - `temperature    String @default("cold") // "hot", "warm", "cold"`
  - `pageViews        Int       @default(0)`
  - `photoViews       Int       @default(0)`
  - `tourClicks       Int       @default(0)`
  - `totalTimeSeconds Int       @default(0)`
  - `lastActivityAt   DateTime?`
  - `contactedAt  DateTime?`
  - `followUpDate DateTime?`
  - `notes        String?   @db.Text`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `propertyWebsite PropertyWebsite @relation(fields: [propertyWebsiteId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([propertyWebsiteId])`
  - `@@index([status])`
  - `@@index([score])`
  - `@@index([temperature])`
  - `@@index([createdAt])`
- Action usage:
  - `lead-scoring.ts`
  - `property-websites.ts`
  - `seed.ts`

### Model: MarketingAsset
- Fields:
  - `id                String @id @default(cuid())`
  - `propertyWebsiteId String`
  - `type         MarketingAssetType`
  - `name         String`
  - `fileUrl      String`
  - `thumbnailUrl String?`
  - `templateUsed String?`
  - `settings     Json? // Custom settings used to generate`
  - `createdAt DateTime @default(now())`
  - `propertyWebsite PropertyWebsite @relation(fields: [propertyWebsiteId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([propertyWebsiteId])`
  - `@@index([type])`
- Action usage:
  - `marketing-assets.ts`
  - `seed.ts`

### Model: PortfolioWebsite
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name        String`
  - `slug        String  @unique`
  - `description String? @db.Text`
  - `heroTitle    String?`
  - `heroSubtitle String? @db.Text`
  - `portfolioType PortfolioType     @default(photographer)`
  - `template      PortfolioTemplate @default(modern)`
  - `fontHeading String?`
  - `fontBody    String?`
  - `logoUrl      String?`
  - `primaryColor String? @default("#3b82f6")`
  - `accentColor  String? @default("#8b5cf6")`
  - `socialLinks Json?`
  - `metaTitle       String?`
  - `metaDescription String? @db.Text`
  - `faviconUrl      String?`
  - `isPublished  Boolean @default(false)`
  - `showBranding Boolean @default(true)`
  - `customDomain                  String?   @unique`
  - `customDomainVerified          Boolean   @default(false)`
  - `customDomainVerificationToken String? // DNS TXT record value for verification`
  - `customDomainVerifiedAt        DateTime?`
  - `customDomainSslStatus         String? // pending, active, error`
  - `isPasswordProtected Boolean @default(false)`
  - `password            String? // Hashed password`
  - `requireLeadCapture Boolean @default(false)`
  - `leadCaptureMessage String? @db.Text // Custom message shown on gate`
  - `leadCaptureFields  Json? // Array of field configs: [{ name, label, type, required }]`
  - `expiresAt DateTime?`
  - `scheduledPublishAt DateTime? // Auto-publish at this date/time`
  - `allowDownloads    Boolean @default(false)`
  - `downloadWatermark Boolean @default(true) // Apply watermark to downloads`
  - `customCss String? @db.Text`
  - `enableAnimations Boolean @default(true)`
  - `allowComments       Boolean @default(false)`
  - `requireCommentEmail Boolean @default(true) // Require email to leave comment`
  - `createdAt   DateTime  @default(now())`
  - `updatedAt   DateTime  @updatedAt`
  - `publishedAt DateTime?`
  - `organization Organization              @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `projects     PortfolioWebsiteProject[]`
  - `sections     PortfolioWebsiteSection[]`
  - `views        PortfolioWebsiteView[]`
  - `inquiries    PortfolioInquiry[]`
  - `leads        PortfolioLead[]`
  - `comments     PortfolioComment[]`
  - `abTests      PortfolioABTest[]`
  - `customForms  CustomForm[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([slug])`
  - `@@index([isPublished])`
  - `@@index([portfolioType])`
  - `@@index([expiresAt])`
- Action usage:
  - `ab-testing.ts`
  - `portfolio-comments.ts`
  - `portfolio-websites.ts`

### Model: PortfolioInquiry
- Fields:
  - `id                 String @id @default(cuid())`
  - `portfolioWebsiteId String`
  - `organizationId     String`
  - `name    String`
  - `email   String`
  - `phone   String?`
  - `message String  @db.Text`
  - `status LeadStatus @default(new)`
  - `notes  String?    @db.Text`
  - `source    String? // where they came from`
  - `userAgent String?`
  - `ipAddress String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)`
  - `organization     Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([portfolioWebsiteId])`
  - `@@index([organizationId])`
  - `@@index([status])`
  - `@@index([createdAt])`
- Action usage:
  - `portfolio-websites.ts`

### Model: WebsiteChatInquiry
- Fields:
  - `id String @id @default(cuid())`
  - `name  String?`
  - `email String?`
  - `phone String?`
  - `message  String  @db.Text`
  - `category String? // "pricing", "features", "trial", "other"`
  - `status LeadStatus @default(new)`
  - `notes  String?    @db.Text`
  - `source    String? // "marketing_website", "portfolio", etc.`
  - `pageUrl   String? // URL where chat was initiated`
  - `userAgent String?`
  - `ipAddress String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- Indexes/constraints:
  - `@@index([status])`
  - `@@index([createdAt])`
  - `@@index([email])`
- Action usage:
  - `chat-inquiries.ts`

### Model: PortfolioWebsiteProject
- Fields:
  - `id                 String @id @default(cuid())`
  - `portfolioWebsiteId String`
  - `projectId          String`
  - `position           Int    @default(0)`
  - `portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)`
  - `project          Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([portfolioWebsiteId, projectId])`
  - `@@index([portfolioWebsiteId])`
  - `@@index([projectId])`
- Action usage:
  - `portfolio-websites.ts`

### Model: PortfolioWebsiteSection
- Fields:
  - `id                 String @id @default(cuid())`
  - `portfolioWebsiteId String`
  - `sectionType PortfolioSectionType`
  - `position    Int                  @default(0)`
  - `isVisible   Boolean              @default(true)`
  - `config Json`
  - `customTitle String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([portfolioWebsiteId])`
  - `@@index([position])`
- Action usage:
  - `portfolio-websites.ts`

### Model: PortfolioWebsiteView
- Fields:
  - `id                 String @id @default(cuid())`
  - `portfolioWebsiteId String`
  - `visitorId String? // Anonymous visitor ID (cookie-based)`
  - `ipAddress String?`
  - `userAgent String?`
  - `referrer  String?`
  - `country   String?`
  - `city      String?`
  - `pagePath  String? // Which section/page was viewed`
  - `sessionId String? // Group views into sessions`
  - `duration    Int? // Time spent in seconds`
  - `scrollDepth Int? // Max scroll depth percentage`
  - `createdAt DateTime @default(now())`
  - `portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([portfolioWebsiteId])`
  - `@@index([createdAt])`
  - `@@index([visitorId])`
  - `@@index([sessionId])`
- Action usage:
  - `portfolio-websites.ts`

### Model: PortfolioLead
- Fields:
  - `id                 String @id @default(cuid())`
  - `portfolioWebsiteId String`
  - `organizationId     String`
  - `email     String`
  - `name      String?`
  - `phone     String?`
  - `company   String?`
  - `message   String? @db.Text`
  - `extraData Json? // Additional custom field data`
  - `visitorId String?`
  - `referrer  String?`
  - `country   String?`
  - `city      String?`
  - `createdAt DateTime @default(now())`
  - `portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)`
  - `organization     Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([portfolioWebsiteId])`
  - `@@index([organizationId])`
  - `@@index([email])`
  - `@@index([createdAt])`

### Model: PortfolioComment
- Fields:
  - `id                 String @id @default(cuid())`
  - `portfolioWebsiteId String`
  - `organizationId     String`
  - `content   String  @db.Text`
  - `sectionId String? // Optional: which section the comment is on`
  - `projectId String? // Optional: which project/image the comment is on`
  - `authorName  String?`
  - `authorEmail String?`
  - `isApproved Boolean @default(false)`
  - `isHidden   Boolean @default(false)`
  - `createdAt DateTime @default(now())`
  - `portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)`
  - `organization     Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([portfolioWebsiteId])`
  - `@@index([organizationId])`
  - `@@index([isApproved])`
  - `@@index([createdAt])`
- Action usage:
  - `portfolio-comments.ts`

### Model: PortfolioABTest
- Fields:
  - `id                 String @id @default(cuid())`
  - `portfolioWebsiteId String`
  - `organizationId     String`
  - `name        String`
  - `description String?               @db.Text`
  - `status      PortfolioABTestStatus @default(draft)`
  - `controlTrafficPercent Int @default(50)`
  - `variantTrafficPercent Int @default(50)`
  - `variantHeroTitle    String?            @db.Text`
  - `variantHeroSubtitle String?            @db.Text`
  - `variantPrimaryColor String?`
  - `variantTemplate     PortfolioTemplate?`
  - `goalType        ABTestGoalType @default(views)`
  - `targetMetric    Int? // Target number to reach`
  - `confidenceLevel Float          @default(0.95) // Statistical confidence required`
  - `startDate DateTime?`
  - `endDate   DateTime?`
  - `controlViews       Int     @default(0)`
  - `controlConversions Int     @default(0)`
  - `variantViews       Int     @default(0)`
  - `variantConversions Int     @default(0)`
  - `winningVariant     String? // "control" or "variant" once determined`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `portfolioWebsite PortfolioWebsite   @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)`
  - `organization     Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `assignments      ABTestAssignment[]`
- Indexes/constraints:
  - `@@index([portfolioWebsiteId])`
  - `@@index([organizationId])`
  - `@@index([status])`
- Action usage:
  - `ab-testing.ts`

### Model: ABTestAssignment
- Fields:
  - `id        String @id @default(cuid())`
  - `testId    String`
  - `visitorId String`
  - `variant   String // "control" or "variant"`
  - `converted Boolean @default(false)`
  - `createdAt   DateTime  @default(now())`
  - `convertedAt DateTime?`
  - `test PortfolioABTest @relation(fields: [testId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([testId, visitorId])`
  - `@@index([testId])`
  - `@@index([visitorId])`
- Action usage:
  - `ab-testing.ts`

### Model: CustomForm
- Fields:
  - `id                 String  @id @default(cuid())`
  - `portfolioWebsiteId String?`
  - `organizationId     String`
  - `name        String`
  - `description String? @db.Text`
  - `slug        String  @unique // URL-friendly identifier`
  - `submitButtonText String  @default("Submit")`
  - `successMessage   String  @default("Thank you for your submission!")`
  - `redirectUrl      String? // Optional redirect after submission`
  - `isActive           Boolean @default(true)`
  - `requiresAuth       Boolean @default(false)`
  - `maxSubmissions     Int? // Limit total submissions`
  - `submissionsPerUser Int? // Limit per visitor`
  - `sendEmailOnSubmission Boolean @default(true)`
  - `notificationEmails    String? @db.Text // Comma-separated emails`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `portfolioWebsite PortfolioWebsite? @relation(fields: [portfolioWebsiteId], references: [id], onDelete: SetNull)`
  - `organization     Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `fields           CustomFormField[]`
  - `submissions      FormSubmission[]`
- Indexes/constraints:
  - `@@index([portfolioWebsiteId])`
  - `@@index([organizationId])`
  - `@@index([slug])`
  - `@@index([isActive])`
- Action usage:
  - `custom-forms.ts`

### Model: CustomFormField
- Fields:
  - `id     String @id @default(cuid())`
  - `formId String`
  - `name        String // Internal field name`
  - `label       String // Display label`
  - `type        CustomFormFieldType`
  - `placeholder String?`
  - `helpText    String?`
  - `isRequired   Boolean @default(false)`
  - `minLength    Int?`
  - `maxLength    Int?`
  - `pattern      String? // Regex pattern for validation`
  - `patternError String? // Custom error message for pattern mismatch`
  - `options Json? // Array of { label: string, value: string }`
  - `position Int    @default(0)`
  - `width    String @default("full") // "full", "half", "third"`
  - `conditionalLogic Json? // { showWhen: { field: string, operator: string, value: string } }`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `form CustomForm @relation(fields: [formId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([formId])`
  - `@@index([position])`
- Action usage:
  - `custom-forms.ts`

### Model: FormSubmission
- Fields:
  - `id     String @id @default(cuid())`
  - `formId String`
  - `data      Json // All field values`
  - `ipAddress String?`
  - `userAgent String?`
  - `visitorId String?`
  - `country String?`
  - `city    String?`
  - `isRead     Boolean   @default(false)`
  - `isArchived Boolean   @default(false)`
  - `readAt     DateTime?`
  - `createdAt DateTime @default(now())`
  - `form CustomForm @relation(fields: [formId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([formId])`
  - `@@index([isRead])`
  - `@@index([isArchived])`
  - `@@index([createdAt])`
- Action usage:
  - `custom-forms.ts`

### Model: TaskBoard
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name        String`
  - `description String?`
  - `color       String? // Board color for visual distinction`
  - `icon        String? // Icon name (emoji or icon key)`
  - `isDefault   Boolean @default(false) // Default board for org`
  - `isArchived  Boolean @default(false)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization    Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `columns         TaskColumn[]`
  - `tasks           Task[]`
  - `taskAutomations TaskAutomation[]`
  - `recurringTasks  RecurringTask[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([isArchived])`
- Action usage:
  - `projects.ts`
  - `seed.ts`

### Model: TaskColumn
- Fields:
  - `id      String @id @default(cuid())`
  - `boardId String`
  - `name     String`
  - `color    String? // Column header color`
  - `position Int     @default(0) // Sort order`
  - `limit    Int? // WIP limit (optional)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `board          TaskBoard       @relation(fields: [boardId], references: [id], onDelete: Cascade)`
  - `tasks          Task[]`
  - `recurringTasks RecurringTask[]`
- Indexes/constraints:
  - `@@index([boardId])`
  - `@@index([position])`
- Action usage:
  - `projects.ts`
  - `seed.ts`

### Model: Task
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `boardId        String`
  - `columnId       String`
  - `assigneeId     String? // Assigned team member (User id)`
  - `title       String`
  - `description String?`
  - `status      TaskStatus   @default(todo)`
  - `priority    TaskPriority @default(medium)`
  - `position    Int          @default(0) // Sort order within column`
  - `startDate   DateTime?`
  - `dueDate     DateTime?`
  - `completedAt DateTime?`
  - `estimatedMinutes Int?`
  - `actualMinutes    Int?`
  - `tags String[] @default([])`
  - `clientId          String?`
  - `projectId         String? // Gallery/Project`
  - `bookingId         String?`
  - `invoiceId         String?`
  - `propertyWebsiteId String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization    Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `board           TaskBoard        @relation(fields: [boardId], references: [id], onDelete: Cascade)`
  - `column          TaskColumn       @relation(fields: [columnId], references: [id], onDelete: Cascade)`
  - `assignee        User?            @relation(fields: [assigneeId], references: [id], onDelete: SetNull)`
  - `client          Client?          @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `project         Project?         @relation(fields: [projectId], references: [id], onDelete: SetNull)`
  - `booking         Booking?         @relation(fields: [bookingId], references: [id], onDelete: SetNull)`
  - `invoice         Invoice?         @relation(fields: [invoiceId], references: [id], onDelete: SetNull)`
  - `propertyWebsite PropertyWebsite? @relation(fields: [propertyWebsiteId], references: [id], onDelete: SetNull)`
  - `subtasks        TaskSubtask[]`
  - `comments        TaskComment[]`
  - `taskTimeEntries TaskTimeEntry[]`
  - `blockedByTasks Task[] @relation("TaskDependencies")`
  - `blocksTasks    Task[] @relation("TaskDependencies")`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([boardId])`
  - `@@index([columnId])`
  - `@@index([assigneeId])`
  - `@@index([status])`
  - `@@index([priority])`
  - `@@index([dueDate])`
  - `@@index([clientId])`
  - `@@index([projectId])`
  - `@@index([bookingId])`
- Action usage:
  - `projects.ts`
  - `seed.ts`

### Model: TaskSubtask
- Fields:
  - `id     String @id @default(cuid())`
  - `taskId String`
  - `title       String`
  - `isCompleted Boolean @default(false)`
  - `position    Int     @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([taskId])`
- Action usage:
  - `projects.ts`
  - `seed.ts`

### Model: TaskComment
- Fields:
  - `id       String @id @default(cuid())`
  - `taskId   String`
  - `authorId String`
  - `content String`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)`
  - `author User @relation(fields: [authorId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([taskId])`
  - `@@index([authorId])`
- Action usage:
  - `projects.ts`
  - `seed.ts`

### Model: TaskTemplate
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name        String`
  - `description String? // Description for the template itself`
  - `category    String? // Category for organization (e.g., "Gallery Delivery", "Post-Production")`
  - `icon        String? // Emoji or icon key`
  - `isGlobal    Boolean @default(false) // System templates vs org templates`
  - `taskTitle        String // Template for task title (can include placeholders)`
  - `taskDescription  String? // Template for task description`
  - `priority         TaskPriority @default(medium)`
  - `tags             String[]     @default([])`
  - `estimatedMinutes Int?`
  - `subtasks Json? // [{title: string, position: number}]`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([category])`
  - `@@index([isGlobal])`
- Action usage:
  - `projects.ts`

### Model: TaskAutomation
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `boardId        String`
  - `name        String`
  - `description String?`
  - `isActive    Boolean @default(true)`
  - `trigger Json`
  - `actions Json`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `board        TaskBoard    @relation(fields: [boardId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([boardId])`
  - `@@index([isActive])`
- Action usage:
  - `projects.ts`

### Model: RecurringTask
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `boardId        String`
  - `columnId       String // Column to create task in`
  - `title            String`
  - `description      String?`
  - `priority         TaskPriority @default(medium)`
  - `tags             String[]     @default([])`
  - `estimatedMinutes Int?`
  - `assigneeId       String? // Default assignee`
  - `frequency  String // "daily", "weekly", "monthly", "custom"`
  - `interval   Int    @default(1) // Every N days/weeks/months`
  - `daysOfWeek Int[]  @default([]) // 0-6 for weekly (0=Sunday)`
  - `dayOfMonth Int? // 1-31 for monthly`
  - `time       String @default("09:00") // HH:MM when to create`
  - `nextRunAt DateTime?`
  - `lastRunAt DateTime?`
  - `isActive  Boolean   @default(true)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `board        TaskBoard    @relation(fields: [boardId], references: [id], onDelete: Cascade)`
  - `column       TaskColumn   @relation(fields: [columnId], references: [id], onDelete: Cascade)`
  - `assignee     User?        @relation(fields: [assigneeId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([boardId])`
  - `@@index([nextRunAt])`
  - `@@index([isActive])`
- Action usage:
  - `projects.ts`

### Model: TaskTimeEntry
- Fields:
  - `id     String @id @default(cuid())`
  - `taskId String`
  - `userId String`
  - `startedAt DateTime`
  - `endedAt   DateTime?`
  - `minutes   Int? // Calculated or manual`
  - `description String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)`
  - `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([taskId])`
  - `@@index([userId])`
  - `@@index([startedAt])`
- Action usage:
  - `projects.ts`

### Model: ProductCatalog
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name        String`
  - `description String?`
  - `status      ProductCatalogStatus @default(planning)`
  - `tags        String[]             @default([])`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `products     ProductItem[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([status])`
- Action usage:
  - `products.ts`

### Model: ProductItem
- Fields:
  - `id        String        @id @default(cuid())`
  - `catalogId String`
  - `sku       String`
  - `name      String`
  - `category  String?`
  - `status    ProductStatus @default(pending)`
  - `angles    String[]      @default([])`
  - `notes     String?`
  - `priority  Int?          @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `catalog  ProductCatalog   @relation(fields: [catalogId], references: [id], onDelete: Cascade)`
  - `variants ProductVariant[]`
  - `photos   ProductPhoto[]`
- Indexes/constraints:
  - `@@unique([catalogId, sku])`
  - `@@index([catalogId])`
  - `@@index([status])`
- Action usage:
  - `products.ts`

### Model: ProductVariant
- Fields:
  - `id        String  @id @default(cuid())`
  - `productId String`
  - `skuSuffix String?`
  - `name      String?`
  - `color     String?`
  - `size      String?`
  - `notes     String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `product ProductItem    @relation(fields: [productId], references: [id], onDelete: Cascade)`
  - `photos  ProductPhoto[]`
- Indexes/constraints:
  - `@@index([productId])`
- Action usage:
  - `products.ts`

### Model: ProductPhoto
- Fields:
  - `id           String             @id @default(cuid())`
  - `productId    String`
  - `variantId    String?`
  - `assetId      String`
  - `angle        String`
  - `isPrimary    Boolean            @default(false)`
  - `status       ProductPhotoStatus @default(raw)`
  - `version      Int                @default(1)`
  - `retouchNotes String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `product ProductItem     @relation(fields: [productId], references: [id], onDelete: Cascade)`
  - `variant ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)`
  - `asset   Asset           @relation(fields: [assetId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([productId])`
  - `@@index([variantId])`
  - `@@index([assetId])`
  - `@@index([status])`
- Action usage:
  - `products.ts`

### Model: DiscountCode
- Fields:
  - `id             String       @id @default(cuid())`
  - `organizationId String`
  - `code           String // The actual code (e.g., "SUMMER20")`
  - `description    String? // Internal description`
  - `discountType   DiscountType @default(percentage)`
  - `discountValue  Int // Percentage (0-100) or cents for fixed_amount`
  - `maxUses     Int? @default(0) // 0 = unlimited`
  - `usedCount   Int  @default(0)`
  - `minPurchase Int? @default(0) // Minimum purchase in cents`
  - `maxDiscount Int? // Maximum discount in cents (for percentage discounts)`
  - `validFrom  DateTime  @default(now())`
  - `validUntil DateTime?`
  - `isActive   Boolean   @default(true)`
  - `applicableServices String[] @default([]) // Empty = all services`
  - `applicableClients  String[] @default([]) // Empty = all clients`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `usages       DiscountCodeUsage[]`
  - `orders Order[]`
- Indexes/constraints:
  - `@@unique([organizationId, code])`
  - `@@index([organizationId])`
  - `@@index([code])`
  - `@@index([isActive])`
- Action usage:
  - `discount-codes.ts`

### Model: DiscountCodeUsage
- Fields:
  - `id             String  @id @default(cuid())`
  - `discountCodeId String`
  - `invoiceId      String?`
  - `paymentId      String?`
  - `clientEmail    String?`
  - `discountAmount Int // Amount discounted in cents`
  - `createdAt DateTime @default(now())`
  - `discountCode DiscountCode @relation(fields: [discountCodeId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([discountCodeId])`
  - `@@index([invoiceId])`
- Action usage:
  - `discount-codes.ts`

### Model: PaymentPlan
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `invoiceId      String?`
  - `projectId      String?`
  - `clientId       String?`
  - `totalAmount  Int // Total amount in cents`
  - `installments Int // Number of installments (e.g., 3, 6, 12)`
  - `paidAmount   Int @default(0) // Amount paid so far`
  - `status PaymentPlanStatus @default(active)`
  - `startDate   DateTime`
  - `frequency   String    @default("monthly") // "weekly", "biweekly", "monthly"`
  - `nextDueDate DateTime?`
  - `stripeSubscriptionId String? @unique`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization      Organization             @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `scheduledPayments PaymentPlanInstallment[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([invoiceId])`
  - `@@index([clientId])`
  - `@@index([status])`
- Action usage:
  - `payment-plans.ts`

### Model: PaymentPlanInstallment
- Fields:
  - `id            String @id @default(cuid())`
  - `paymentPlanId String`
  - `amount  Int // Amount in cents`
  - `dueDate DateTime`
  - `paidAt  DateTime?`
  - `isPaid  Boolean   @default(false)`
  - `stripePaymentIntentId String? @unique`
  - `reminderSentAt DateTime?`
  - `createdAt DateTime @default(now())`
  - `paymentPlan PaymentPlan @relation(fields: [paymentPlanId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([paymentPlanId])`
  - `@@index([dueDate])`
  - `@@index([isPaid])`
- Action usage:
  - `payment-plans.ts`

### Model: DownloadLog
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `projectId      String`
  - `assetId        String? // Null for batch/zip downloads`
  - `format     DownloadFormat @default(original)`
  - `fileCount  Int            @default(1) // For batch downloads`
  - `totalBytes BigInt?`
  - `clientEmail String?`
  - `sessionId   String?`
  - `ipAddress   String?`
  - `userAgent   String?`
  - `createdAt DateTime @default(now())`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([projectId])`
  - `@@index([assetId])`
  - `@@index([clientEmail])`
  - `@@index([createdAt])`
- Action usage:
  - `download-tracking.ts`
  - `gallery-activity.ts`

### Model: ExpirationNotification
- Fields:
  - `id        String @id @default(cuid())`
  - `projectId String`
  - `daysBeforeExpiry Int // 7, 3, 1, etc.`
  - `sentAt           DateTime?`
  - `recipientEmail String`
  - `emailType      String @default("expiry_warning") // "expiry_warning", "expired", "extended"`
  - `createdAt DateTime @default(now())`
- Indexes/constraints:
  - `@@unique([projectId, daysBeforeExpiry])`
  - `@@index([projectId])`
  - `@@index([sentAt])`
- Action usage:
  - `gallery-expiration.ts`

### Model: InvoiceBrandingTemplate
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name      String`
  - `isDefault Boolean @default(false)`
  - `logoPosition String @default("left") // "left", "center", "right"`
  - `primaryColor String @default("#3b82f6")`
  - `accentColor  String @default("#8b5cf6")`
  - `headerText   String?`
  - `footerText   String?`
  - `paymentTerms String? // e.g., "Net 30", "Due on Receipt"`
  - `notes        String?`
  - `fontFamily      String  @default("Inter")`
  - `showLogo        Boolean @default(true)`
  - `showPaymentLink Boolean @default(true)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([organizationId])`
- Action usage:
  - `invoice-templates.ts`

### Model: InvoiceEmailTemplate
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name      String`
  - `emailType InvoiceEmailType`
  - `isDefault Boolean          @default(false)`
  - `isActive  Boolean          @default(true)`
  - `subject  String // Supports variables like {{invoiceNumber}}, {{clientName}}`
  - `bodyHtml String  @db.Text // HTML email body`
  - `bodyText String? @db.Text // Plain text fallback`
  - `fromName String? // Override sender name`
  - `replyTo  String? // Reply-to email`
  - `sendDelayDays Int? // Days after event to send (e.g., reminder 7 days after due)`
  - `ccEmails  String[] @default([])`
  - `bccEmails String[] @default([])`
  - `usageCount Int       @default(0)`
  - `lastUsedAt DateTime?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([organizationId, emailType, isDefault])`
  - `@@index([organizationId])`
  - `@@index([emailType])`
- Action usage:
  - `invoice-email-templates.ts`

### Model: PortalActivity
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `clientId       String`
  - `activityType String // "gallery_delivered", "invoice_sent", "payment_received", "comment_posted", etc.`
  - `title        String`
  - `description  String?`
  - `projectId String?`
  - `invoiceId String?`
  - `paymentId String?`
  - `isRead Boolean   @default(false)`
  - `readAt DateTime?`
  - `createdAt DateTime @default(now())`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([clientId])`
  - `@@index([isRead])`
  - `@@index([createdAt])`
- Action usage:
  - `portal-activity.ts`

### Model: AvailabilityBlock
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `userId         String? // null = org-wide block`
  - `title       String`
  - `description String?`
  - `blockType   AvailabilityBlockType @default(time_off)`
  - `startDate DateTime`
  - `endDate   DateTime`
  - `allDay    Boolean  @default(true)`
  - `isRecurring    Boolean   @default(false)`
  - `recurrenceRule String? // e.g., "FREQ=WEEKLY;BYDAY=SU"`
  - `recurrenceEnd  DateTime?`
  - `requestStatus TimeOffRequestStatus @default(approved) // Legacy blocks are auto-approved`
  - `approvedById  String?`
  - `approvedAt    DateTime?`
  - `rejectionNote String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([userId])`
  - `@@index([startDate])`
  - `@@index([endDate])`
  - `@@index([requestStatus])`
- Action usage:
  - `availability.ts`
  - `bookings.ts`
  - `seed.ts`
  - `team-availability.ts`

### Model: BookingBuffer
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `serviceId      String? // null = org-wide default`
  - `bufferBefore Int @default(0) // Setup time before booking`
  - `bufferAfter  Int @default(0) // Teardown time after booking`
  - `minAdvanceHours Int? // Minimum hours in advance to book`
  - `maxAdvanceDays  Int? // Maximum days in advance to book`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- Indexes/constraints:
  - `@@unique([organizationId, serviceId])`
  - `@@index([organizationId])`
  - `@@index([serviceId])`
- Action usage:
  - `availability.ts`
  - `bookings.ts`

### Model: BookingForm
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name        String`
  - `slug        String`
  - `description String?`
  - `industry Industry?`
  - `isPublished Boolean @default(false)`
  - `isDefault   Boolean @default(false) // Default form for the org`
  - `headline        String?`
  - `subheadline     String?`
  - `heroImageUrl    String?`
  - `logoOverrideUrl String?`
  - `primaryColor    String?`
  - `requireApproval   Boolean @default(true) // Auto-confirm or require admin approval`
  - `confirmationEmail Boolean @default(true)`
  - `viewCount    Int @default(0)`
  - `bookingCount Int @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `fields       BookingFormField[]`
  - `services     BookingFormService[]`
  - `submissions  BookingFormSubmission[]`
- Indexes/constraints:
  - `@@unique([organizationId, slug])`
  - `@@index([organizationId])`
  - `@@index([slug])`
  - `@@index([isPublished])`
- Action usage:
  - `booking-forms.ts`

### Model: BookingFormField
- Fields:
  - `id            String @id @default(cuid())`
  - `bookingFormId String`
  - `label       String`
  - `type        FormFieldType`
  - `placeholder String?`
  - `helpText    String?`
  - `isRequired  Boolean       @default(false)`
  - `sortOrder   Int           @default(0)`
  - `industries Industry[]`
  - `validation Json?`
  - `conditionalOn    String? // Field ID this depends on`
  - `conditionalValue String? // Value that triggers display`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `bookingForm BookingForm @relation(fields: [bookingFormId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([bookingFormId])`
  - `@@index([sortOrder])`
- Action usage:
  - `booking-forms.ts`

### Model: BookingFormService
- Fields:
  - `id            String  @id @default(cuid())`
  - `bookingFormId String`
  - `serviceId     String`
  - `sortOrder     Int     @default(0)`
  - `isDefault     Boolean @default(false) // Pre-selected on form`
  - `bookingForm BookingForm @relation(fields: [bookingFormId], references: [id], onDelete: Cascade)`
  - `service     Service     @relation(fields: [serviceId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([bookingFormId, serviceId])`
  - `@@index([bookingFormId])`
  - `@@index([serviceId])`
- Action usage:
  - `booking-forms.ts`

### Model: BookingFormSubmission
- Fields:
  - `id            String  @id @default(cuid())`
  - `bookingFormId String`
  - `bookingId     String? @unique // Linked once converted to booking`
  - `data Json // All field values as key-value pairs`
  - `clientName  String?`
  - `clientEmail String?`
  - `clientPhone String?`
  - `preferredDate DateTime?`
  - `preferredTime String?`
  - `serviceId String?`
  - `status BookingFormSubmissionStatus @default(pending)`
  - `convertedAt   DateTime?`
  - `convertedBy   String? // User ID who converted`
  - `rejectedAt    DateTime?`
  - `rejectionNote String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `bookingForm BookingForm @relation(fields: [bookingFormId], references: [id], onDelete: Cascade)`
  - `booking     Booking?    @relation(fields: [bookingId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([bookingFormId])`
  - `@@index([status])`
  - `@@index([createdAt])`
- Action usage:
  - `booking-forms.ts`

### Model: ClientCommunication
- Fields:
  - `id       String @id @default(cuid())`
  - `clientId String`
  - `type      CommunicationType`
  - `direction CommunicationDirection`
  - `subject   String?`
  - `content   String                 @db.Text`
  - `sentAt DateTime?`
  - `readAt DateTime?`
  - `createdById String?`
  - `bookingId String?`
  - `projectId String?`
  - `invoiceId String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([clientId])`
  - `@@index([type])`
  - `@@index([createdAt])`
- Action usage:
  - `client-communications.ts`
  - `seed.ts`

### Model: ClientTag
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name        String`
  - `color       String  @default("#6366f1")`
  - `description String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `clients ClientTagAssignment[]`
- Indexes/constraints:
  - `@@unique([organizationId, name])`
  - `@@index([organizationId])`
- Action usage:
  - `client-tags.ts`
  - `clients.ts`
  - `seed.ts`

### Model: ClientTagAssignment
- Fields:
  - `id       String @id @default(cuid())`
  - `clientId String`
  - `tagId    String`
  - `createdAt DateTime @default(now())`
  - `client Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)`
  - `tag    ClientTag @relation(fields: [tagId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([clientId, tagId])`
  - `@@index([clientId])`
  - `@@index([tagId])`
- Action usage:
  - `client-tags.ts`
  - `seed.ts`

### Model: ContractSignature
- Fields:
  - `id         String @id @default(cuid())`
  - `contractId String`
  - `signerId   String // ContractSigner id`
  - `signatureData String        @db.Text // Base64 encoded signature image`
  - `signatureType SignatureType @default(drawn)`
  - `signedAt  DateTime @default(now())`
  - `ipAddress String?`
  - `userAgent String?`
  - `consentGiven Boolean @default(true)`
  - `consentText  String? @db.Text`
  - `createdAt DateTime @default(now())`
  - `contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([contractId])`
  - `@@index([signerId])`
- Action usage:
  - `contract-signing.ts`
  - `contracts.ts`
  - `seed.ts`

### Model: CalendarIntegration
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `userId         String? // User-specific or org-wide`
  - `provider   CalendarProvider`
  - `externalId String // Calendar ID from provider`
  - `name       String // Display name`
  - `accessToken    String    @db.Text`
  - `refreshToken   String?   @db.Text`
  - `tokenExpiresAt DateTime?`
  - `syncEnabled   Boolean       @default(true)`
  - `syncDirection SyncDirection @default(both)`
  - `lastSyncAt    DateTime?`
  - `lastSyncError String?`
  - `color String @default("#3b82f6")`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- Indexes/constraints:
  - `@@unique([organizationId, provider, externalId])`
  - `@@index([organizationId])`
  - `@@index([userId])`
  - `@@index([provider])`
- Action usage:
  - `google-calendar.ts`

### Model: CalendarEvent
- Fields:
  - `id                    String @id @default(cuid())`
  - `calendarIntegrationId String`
  - `externalEventId String`
  - `title       String`
  - `description String?  @db.Text`
  - `startTime   DateTime`
  - `endTime     DateTime`
  - `allDay      Boolean  @default(false)`
  - `location    String?`
  - `bookingId String? @unique`
  - `lastSyncedAt DateTime @default(now())`
  - `etag         String? // For change detection`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- Indexes/constraints:
  - `@@unique([calendarIntegrationId, externalEventId])`
  - `@@index([calendarIntegrationId])`
  - `@@index([bookingId])`
  - `@@index([startTime])`
- Action usage:
  - `google-calendar.ts`

### Model: CalendarFeed
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `userId         String? // User-specific feed (null = org-wide)`
  - `token    String @unique // Unique token for feed URL`
  - `name     String @default("Bookings") // Display name for the feed`
  - `timezone String @default("America/New_York")`
  - `isActive Boolean @default(true)`
  - `lastAccessedAt DateTime?`
  - `accessCount    Int       @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `user         User?        @relation("UserCalendarFeeds", fields: [userId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([userId])`
  - `@@index([token])`
- Action usage:
  - `calendar-feeds.ts`

### Model: ServiceBundle
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name        String`
  - `slug        String`
  - `description String?    @db.Text`
  - `priceCents  Int // Bundle price (for fixed pricing)`
  - `bundleType  BundleType @default(fixed)`
  - `pricingMethod BundlePricingMethod @default(fixed)`
  - `pricePerSqftCents Int? @default(0) // Price per sqft for sqft_based pricing`
  - `minSqft           Int? @default(0) // Minimum sqft (floor for pricing)`
  - `maxSqft           Int? // Maximum sqft (optional ceiling)`
  - `sqftIncrements    Int? @default(500) // Round to nearest X sqft (e.g., 500)`
  - `imageUrl  String?`
  - `badgeText String? // "Most Popular", "Best Value"`
  - `sortOrder Int     @default(0)`
  - `originalPriceCents Int? // Sum of individual services (for savings display)`
  - `savingsPercent     Float? // Calculated savings percentage`
  - `isActive Boolean @default(true)`
  - `isPublic Boolean @default(true) // Show on public order pages`
  - `stripeProductId String? // Stripe Product ID (prod_xxx)`
  - `stripePriceId   String? // Stripe Price ID (price_xxx)`
  - `stripeSyncedAt  DateTime? // Last successful sync timestamp`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `services     ServiceBundleItem[] // Services included in bundle`
  - `pricingTiers BundlePricingTier[] // Tiered pricing tiers (for tiered_sqft)`
  - `orderPages   OrderPageBundle[] // Order pages featuring this bundle`
  - `orderItems   OrderItem[]`
- Indexes/constraints:
  - `@@unique([organizationId, slug])`
  - `@@index([organizationId])`
  - `@@index([isActive, isPublic])`
- Action usage:
  - `bundles.ts`
  - `order-pages.ts`
  - `orders.ts`
  - `stripe-product-sync.ts`

### Model: ServiceBundleItem
- Fields:
  - `id        String @id @default(cuid())`
  - `bundleId  String`
  - `serviceId String`
  - `isRequired Boolean @default(true)`
  - `quantity   Int     @default(1)`
  - `sortOrder  Int     @default(0)`
  - `bundle  ServiceBundle @relation(fields: [bundleId], references: [id], onDelete: Cascade)`
  - `service Service       @relation(fields: [serviceId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([bundleId, serviceId])`
  - `@@index([bundleId])`
  - `@@index([serviceId])`
- Action usage:
  - `addons.ts`
  - `bundles.ts`

### Model: BundlePricingTier
- Fields:
  - `id       String @id @default(cuid())`
  - `bundleId String`
  - `minSqft Int // Minimum sqft for this tier (inclusive)`
  - `maxSqft Int? // Maximum sqft for this tier (null = unlimited)`
  - `priceCents Int // Fixed price for this tier`
  - `tierName   String? // Optional display name (e.g., "Small Home", "Medium Home")`
  - `sortOrder Int @default(0)`
  - `bundle ServiceBundle @relation(fields: [bundleId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([bundleId, minSqft])`
  - `@@index([bundleId])`
- Action usage:
  - `bundles.ts`

### Model: ServiceAddon
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name        String`
  - `description String?`
  - `priceCents  Int`
  - `imageUrl  String?`
  - `iconName  String? // Icon identifier`
  - `sortOrder Int     @default(0)`
  - `triggerType  AddonTrigger @default(always)`
  - `triggerValue String? // Service ID or amount threshold`
  - `isActive  Boolean @default(true)`
  - `isOneTime Boolean @default(true) // Can only add once`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization   Organization         @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `compatibleWith ServiceAddonCompat[] // Services this addon works with`
  - `orderItems     OrderItem[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([isActive])`
- Action usage:
  - `addons.ts`

### Model: ServiceAddonCompat
- Fields:
  - `id        String @id @default(cuid())`
  - `addonId   String`
  - `serviceId String`
  - `addon   ServiceAddon @relation(fields: [addonId], references: [id], onDelete: Cascade)`
  - `service Service      @relation(fields: [serviceId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([addonId, serviceId])`
  - `@@index([addonId])`
  - `@@index([serviceId])`
- Action usage:
  - `addons.ts`

### Model: OrderPage
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `clientId       String? // Optional: dedicated page for specific client`
  - `brokerageId    String? // Optional: dedicated page for specific brokerage`
  - `name String`
  - `slug String`
  - `headline        String?`
  - `subheadline     String?`
  - `heroImageUrl    String?`
  - `logoOverrideUrl String? // Override org logo for this page`
  - `primaryColor    String? // Override org primary color`
  - `showPhone   Boolean @default(true)`
  - `showEmail   Boolean @default(true)`
  - `customPhone String?`
  - `customEmail String?`
  - `template String @default("default") // "default", "minimal", "luxury"`
  - `metaTitle       String?`
  - `metaDescription String?`
  - `isPublished  Boolean @default(false)`
  - `requireLogin Boolean @default(false) // Require client portal login`
  - `testimonials Json? // Array of { name, company, quote, photoUrl }`
  - `viewCount  Int @default(0)`
  - `orderCount Int @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client       Client?            @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `brokerage    Brokerage?         @relation("BrokerageOrderPages", fields: [brokerageId], references: [id], onDelete: SetNull)`
  - `bundles      OrderPageBundle[]`
  - `services     OrderPageService[]`
  - `orders       Order[]`
- Indexes/constraints:
  - `@@unique([organizationId, slug])`
  - `@@index([organizationId])`
  - `@@index([clientId])`
  - `@@index([brokerageId])`
  - `@@index([isPublished])`
- Action usage:
  - `order-pages.ts`
  - `orders.ts`

### Model: OrderPageBundle
- Fields:
  - `id          String  @id @default(cuid())`
  - `orderPageId String`
  - `bundleId    String`
  - `sortOrder   Int     @default(0)`
  - `isFeatured  Boolean @default(false) // Highlight as recommended`
  - `orderPage OrderPage     @relation(fields: [orderPageId], references: [id], onDelete: Cascade)`
  - `bundle    ServiceBundle @relation(fields: [bundleId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([orderPageId, bundleId])`
  - `@@index([orderPageId])`
- Action usage:
  - `order-pages.ts`

### Model: OrderPageService
- Fields:
  - `id          String @id @default(cuid())`
  - `orderPageId String`
  - `serviceId   String`
  - `sortOrder   Int    @default(0)`
  - `orderPage OrderPage @relation(fields: [orderPageId], references: [id], onDelete: Cascade)`
  - `service   Service   @relation(fields: [serviceId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([orderPageId, serviceId])`
  - `@@index([orderPageId])`
- Action usage:
  - `order-pages.ts`

### Model: Order
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `orderPageId    String? // Which order page it came from`
  - `clientId       String? // Linked client (if known)`
  - `orderNumber String // e.g., "ORD-2025-0001"`
  - `status      OrderStatus @default(cart)`
  - `subtotalCents Int @default(0)`
  - `discountCents Int @default(0)`
  - `taxCents      Int @default(0)`
  - `totalCents    Int @default(0)`
  - `discountCodeId String?`
  - `clientName    String?`
  - `clientEmail   String?`
  - `clientPhone   String?`
  - `clientCompany String?`
  - `locationId    String?`
  - `locationNotes String?`
  - `preferredDate DateTime?`
  - `preferredTime String? // "morning", "afternoon", "evening"`
  - `flexibleDates Boolean   @default(true)`
  - `clientNotes   String? @db.Text`
  - `internalNotes String? @db.Text`
  - `sessionToken String? @unique`
  - `paidAt        DateTime?`
  - `paymentMethod String?`
  - `stripeCheckoutSessionId String? @unique`
  - `stripePaymentIntentId   String? @unique`
  - `source   String? // utm_source`
  - `medium   String? // utm_medium`
  - `campaign String? // utm_campaign`
  - `createdAt   DateTime  @default(now())`
  - `updatedAt   DateTime  @updatedAt`
  - `submittedAt DateTime? // When cart was submitted`
  - `organization Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `orderPage    OrderPage?    @relation(fields: [orderPageId], references: [id], onDelete: SetNull)`
  - `client       Client?       @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `location     Location?     @relation(fields: [locationId], references: [id], onDelete: SetNull)`
  - `discountCode DiscountCode? @relation(fields: [discountCodeId], references: [id], onDelete: SetNull)`
  - `items        OrderItem[]`
  - `invoice      Invoice?      @relation("OrderInvoice")`
  - `booking      Booking?      @relation("OrderBooking")`
- Indexes/constraints:
  - `@@unique([organizationId, orderNumber])`
  - `@@index([organizationId])`
  - `@@index([orderPageId])`
  - `@@index([clientId])`
  - `@@index([status])`
  - `@@index([createdAt])`
- Action usage:
  - `email-logs.ts`
  - `orders.ts`

### Model: OrderItem
- Fields:
  - `id      String @id @default(cuid())`
  - `orderId String`
  - `itemType  String // "service", "bundle", "addon"`
  - `serviceId String?`
  - `bundleId  String?`
  - `addonId   String?`
  - `name        String`
  - `description String?`
  - `quantity    Int     @default(1)`
  - `unitCents   Int`
  - `totalCents  Int`
  - `sqft            Int? // Square footage entered by client`
  - `pricingTierId   String? // Which pricing tier was applied (for tiered_sqft)`
  - `pricingTierName String? // Tier name at time of order (snapshot)`
  - `sortOrder Int @default(0)`
  - `createdAt DateTime @default(now())`
  - `order   Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)`
  - `service Service?       @relation(fields: [serviceId], references: [id], onDelete: SetNull)`
  - `bundle  ServiceBundle? @relation(fields: [bundleId], references: [id], onDelete: SetNull)`
  - `addon   ServiceAddon?  @relation(fields: [addonId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([orderId])`
  - `@@index([serviceId])`
  - `@@index([bundleId])`
- Action usage:
  - `orders.ts`

### Model: Brokerage
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name    String`
  - `slug    String`
  - `email   String?`
  - `phone   String?`
  - `website String?`
  - `address String?`
  - `city    String?`
  - `state   String?`
  - `zipCode String?`
  - `logoUrl      String?`
  - `primaryColor String?`
  - `contactName  String?`
  - `contactEmail String?`
  - `contactPhone String?`
  - `isActive Boolean @default(true)`
  - `totalRevenueCents Int @default(0)`
  - `activeAgentCount  Int @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `agents       Client[]            @relation("BrokerageAgents")`
  - `contracts    BrokerageContract[]`
  - `orderPages   OrderPage[]         @relation("BrokerageOrderPages")`
- Indexes/constraints:
  - `@@unique([organizationId, slug])`
  - `@@index([organizationId])`
  - `@@index([isActive])`
- Action usage:
  - `brokerage-contracts.ts`
  - `brokerages.ts`

### Model: BrokerageContract
- Fields:
  - `id          String @id @default(cuid())`
  - `brokerageId String`
  - `name        String`
  - `description String?`
  - `discountPercent    Float? @default(0) // Global discount percentage`
  - `discountFixedCents Int?   @default(0) // Fixed discount amount`
  - `servicePricing Json?`
  - `paymentTermsDays Int     @default(30) // Net 30, etc.`
  - `autoInvoice      Boolean @default(false) // Auto-create invoices`
  - `invoiceSplitType    InvoiceSplitType @default(single)`
  - `brokeragePayPercent Float? // % brokerage pays (for split invoices)`
  - `startDate DateTime  @default(now())`
  - `endDate   DateTime?`
  - `isActive  Boolean   @default(true)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `brokerage Brokerage @relation(fields: [brokerageId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([brokerageId])`
  - `@@index([isActive])`
- Action usage:
  - `brokerage-contracts.ts`

### Model: InvoiceSplit
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `primaryInvoiceId   String`
  - `secondaryInvoiceId String? // For dual invoices`
  - `splitType InvoiceSplitType`
  - `agentAmountCents     Int @default(0)`
  - `brokerageAmountCents Int @default(0)`
  - `lineItemAssignments Json?`
  - `createdAt DateTime @default(now())`
- Indexes/constraints:
  - `@@unique([primaryInvoiceId])`
  - `@@index([organizationId])`
  - `@@index([primaryInvoiceId])`
  - `@@index([secondaryInvoiceId])`
- Action usage:
  - `invoice-splits.ts`

### Model: PhotographerRate
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `userId         String // Photographer (team member)`
  - `serviceId      String? // Null = default rate for all services`
  - `rateType  String @default("percentage") // "percentage", "fixed", "hourly"`
  - `rateValue Int // Percentage (0-100) or cents`
  - `minPayCents Int? // Minimum pay per booking`
  - `maxPayCents Int? // Maximum pay per booking`
  - `bookingTypeId String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- Indexes/constraints:
  - `@@unique([organizationId, userId, serviceId])`
  - `@@index([organizationId])`
  - `@@index([userId])`
  - `@@index([serviceId])`
- Action usage:
  - `photographer-pay.ts`

### Model: PhotographerEarning
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `userId         String // Photographer`
  - `bookingId      String?`
  - `invoiceId      String?`
  - `description String`
  - `amountCents Int`
  - `status      EarningStatus @default(pending)`
  - `rateType        String? // How this was calculated`
  - `rateValue       Int?`
  - `baseAmountCents Int? // What the earning was calculated from`
  - `payoutItemId String?`
  - `earnedAt   DateTime  @default(now())`
  - `approvedAt DateTime?`
  - `paidAt     DateTime?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `payoutItem PayoutItem? @relation(fields: [payoutItemId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([userId])`
  - `@@index([bookingId])`
  - `@@index([status])`
  - `@@index([payoutItemId])`
- Action usage:
  - `payouts.ts`
  - `photographer-pay.ts`

### Model: PayoutBatch
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `batchNumber String // e.g., "PAY-2025-0001"`
  - `status      PayoutStatus @default(pending)`
  - `periodStart DateTime`
  - `periodEnd   DateTime`
  - `totalAmountCents Int @default(0)`
  - `itemCount        Int @default(0)`
  - `processedAt  DateTime?`
  - `failedReason String?`
  - `stripeTransferId String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `items        PayoutItem[]`
- Indexes/constraints:
  - `@@unique([organizationId, batchNumber])`
  - `@@index([organizationId])`
  - `@@index([status])`
  - `@@index([periodStart])`
- Action usage:
  - `payouts.ts`

### Model: PayoutItem
- Fields:
  - `id      String @id @default(cuid())`
  - `batchId String`
  - `userId  String // Recipient photographer`
  - `amountCents Int`
  - `description String?`
  - `status       PayoutStatus @default(pending)`
  - `failedReason String?`
  - `stripeTransferId String?`
  - `stripePayoutId   String?`
  - `processedAt DateTime?`
  - `paidAt      DateTime?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `batch    PayoutBatch           @relation(fields: [batchId], references: [id], onDelete: Cascade)`
  - `earnings PhotographerEarning[]`
- Indexes/constraints:
  - `@@index([batchId])`
  - `@@index([userId])`
  - `@@index([status])`
- Action usage:
  - `payouts.ts`

### Model: SMSTemplate
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name         String`
  - `templateType SMSTemplateType`
  - `content      String          @db.Text // Message with {{variables}}`
  - `availableVariables String[] @default([])`
  - `isActive  Boolean @default(true)`
  - `isDefault Boolean @default(false) // System default template`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `smsLogs      SMSLog[]`
- Indexes/constraints:
  - `@@unique([organizationId, templateType, isDefault])`
  - `@@index([organizationId])`
  - `@@index([templateType])`
  - `@@index([isActive])`
- Action usage:
  - `sms.ts`

### Model: SMSLog
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `templateId String?`
  - `toPhone    String`
  - `fromPhone  String`
  - `content    String  @db.Text`
  - `twilioMessageSid String?           @unique`
  - `deliveryStatus   SMSDeliveryStatus @default(queued)`
  - `errorCode        String?`
  - `errorMessage     String?`
  - `bookingId String?`
  - `clientId  String?`
  - `userId    String? // Photographer (if sent to team)`
  - `sentAt      DateTime?`
  - `deliveredAt DateTime?`
  - `failedAt    DateTime?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `template     SMSTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)`
  - `booking      Booking?     @relation(fields: [bookingId], references: [id], onDelete: SetNull)`
  - `client       Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([templateId])`
  - `@@index([bookingId])`
  - `@@index([clientId])`
  - `@@index([deliveryStatus])`
  - `@@index([createdAt])`
- Action usage:
  - `sms.ts`

### Model: BookingCheckIn
- Fields:
  - `id        String @id @default(cuid())`
  - `bookingId String`
  - `userId    String // Photographer`
  - `checkInType CheckInType`
  - `latitude    Float`
  - `longitude   Float`
  - `accuracy    Float? // GPS accuracy in meters`
  - `address String?`
  - `distanceFromLocation Float? // Meters from booking location`
  - `photoUrl String?`
  - `notes String?`
  - `createdAt DateTime @default(now())`
- Indexes/constraints:
  - `@@index([bookingId])`
  - `@@index([userId])`
  - `@@index([checkInType])`
  - `@@index([createdAt])`
- Action usage:
  - `field-operations.ts`

### Model: LocationPing
- Fields:
  - `id        String @id @default(cuid())`
  - `bookingId String`
  - `userId    String // Photographer`
  - `latitude  Float`
  - `longitude Float`
  - `accuracy  Float? // GPS accuracy in meters`
  - `altitude  Float?`
  - `speed     Float? // meters/second`
  - `heading   Float? // Compass heading`
  - `batteryLevel Float?`
  - `createdAt DateTime @default(now())`
- Indexes/constraints:
  - `@@index([bookingId])`
  - `@@index([userId])`
  - `@@index([createdAt])`

### Model: SlackIntegration
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `teamId   String`
  - `teamName String`
  - `accessToken    String  @db.Text`
  - `botUserId      String?`
  - `botAccessToken String? @db.Text`
  - `incomingWebhookUrl String?`
  - `isActive Boolean @default(true)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `channels     SlackChannel[]`
- Indexes/constraints:
  - `@@unique([organizationId, teamId])`
  - `@@index([organizationId])`
  - `@@index([teamId])`
- Action usage:
  - `slack.ts`

### Model: SlackChannel
- Fields:
  - `id            String @id @default(cuid())`
  - `integrationId String`
  - `channelId   String`
  - `channelName String`
  - `eventTypes SlackEventType[]`
  - `isActive    Boolean @default(true)`
  - `mentionHere Boolean @default(false) // @here mentions`
  - `mentionAll  Boolean @default(false) // @channel mentions`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `integration SlackIntegration @relation(fields: [integrationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([integrationId, channelId])`
  - `@@index([integrationId])`
  - `@@index([channelId])`

### Model: DropboxIntegration
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String @unique`
  - `accountId   String // Dropbox account_id`
  - `email       String`
  - `displayName String`
  - `accessToken  String  @db.Text`
  - `refreshToken String? @db.Text`
  - `syncEnabled Boolean @default(true)`
  - `syncFolder  String  @default("/PhotoProOS") // Root folder in Dropbox`
  - `autoSync    Boolean @default(true) // Auto-sync on file changes`
  - `cursor String? @db.Text`
  - `lastSyncAt    DateTime?`
  - `lastSyncError String?`
  - `isActive Boolean @default(true)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([accountId])`
- Action usage:
  - `dropbox.ts`

### Model: BookingSlot
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `userId         String? // Specific photographer (null = any available)`
  - `serviceId      String? // Specific service (null = any)`
  - `startTime DateTime`
  - `endTime   DateTime`
  - `timezone  String   @default("America/New_York")`
  - `isRecurring    Boolean   @default(false)`
  - `recurrenceRule String? // RRULE format`
  - `recurrenceEnd  DateTime?`
  - `maxBookings     Int @default(1) // How many can book this slot`
  - `currentBookings Int @default(0)`
  - `priceCentsOverride Int? // Override service price for this slot`
  - `isActive Boolean @default(true)`
  - `bufferBeforeMinutes Int?`
  - `bufferAfterMinutes  Int?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([userId])`
  - `@@index([serviceId])`
  - `@@index([startTime])`
  - `@@index([isActive])`

### Model: ServiceTerritory
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `name           String`
  - `description    String? @db.Text`
  - `zipCodes    String[] // Array of ZIP codes in this territory`
  - `centerLat   Decimal? @db.Decimal(10, 7) // Center point latitude`
  - `centerLng   Decimal? @db.Decimal(10, 7) // Center point longitude`
  - `radiusMiles Float? // Radius in miles from center (alternative to ZIP codes)`
  - `pricingModifier Float @default(1.0) // 1.0 = normal, 1.2 = 20% more, 0.9 = 10% discount`
  - `flatFeeOverride Int? // Flat fee override in cents (instead of modifier)`
  - `travelFee       Int? // Additional travel fee in cents`
  - `isActive            Boolean @default(true)`
  - `minLeadTimeHours    Int? // Minimum hours notice for bookings`
  - `maxLeadTimeDays     Int? // Maximum days in advance for bookings`
  - `availableDaysOfWeek Int[] // 0=Sun, 1=Mon, etc. Empty = all days`
  - `color String? // Hex color for map display`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization               @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `services     TerritoryServiceOverride[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([isActive])`
- Action usage:
  - `territories.ts`

### Model: TerritoryServiceOverride
- Fields:
  - `id          String @id @default(cuid())`
  - `territoryId String`
  - `serviceId   String`
  - `pricingModifier Float? // Override territory default`
  - `flatPrice       Int? // Fixed price in cents (overrides modifier)`
  - `isAvailable     Boolean @default(true) // Service available in this territory?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `territory ServiceTerritory @relation(fields: [territoryId], references: [id], onDelete: Cascade)`
  - `service   Service          @relation("ServiceTerritoryOverrides", fields: [serviceId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([territoryId, serviceId])`
  - `@@index([territoryId])`
  - `@@index([serviceId])`
- Action usage:
  - `territories.ts`

### Model: ReferralProgram
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String  @unique`
  - `name           String  @default("Referral Program")`
  - `description    String? @db.Text`
  - `isActive         Boolean @default(false)`
  - `requiresApproval Boolean @default(true) // Manual approval before reward`
  - `rewardType     ReferralRewardType @default(percentage)`
  - `rewardValue    Float              @default(10) // 10% or $10 depending on type`
  - `maxRewardCents Int? // Cap on reward amount`
  - `referredDiscount      Float? // Discount for referred client (e.g., 5%)`
  - `referredDiscountCents Int? // Fixed discount in cents`
  - `referralValidDays    Int  @default(90) // How long referral link is valid`
  - `rewardExpirationDays Int? // How long until reward expires after issue`
  - `termsUrl String? // Link to referral program terms`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `referrers    Referrer[]`
  - `referrals    Referral[]`
- Action usage:
  - `referrals.ts`

### Model: Referrer
- Fields:
  - `id        String @id @default(cuid())`
  - `programId String`
  - `clientId String? @unique // If referrer is an existing client`
  - `name     String`
  - `email    String`
  - `phone    String?`
  - `referralCode String @unique`
  - `totalReferrals      Int @default(0)`
  - `successfulReferrals Int @default(0)`
  - `totalEarned         Int @default(0) // Total rewards in cents`
  - `isActive Boolean @default(true)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `program   ReferralProgram  @relation(fields: [programId], references: [id], onDelete: Cascade)`
  - `client    Client?          @relation("ClientReferrer", fields: [clientId], references: [id], onDelete: SetNull)`
  - `referrals Referral[]`
  - `rewards   ReferralReward[]`
- Indexes/constraints:
  - `@@index([programId])`
  - `@@index([clientId])`
  - `@@index([referralCode])`
- Action usage:
  - `referrals.ts`

### Model: Referral
- Fields:
  - `id         String @id @default(cuid())`
  - `programId  String`
  - `referrerId String`
  - `referredName  String`
  - `referredEmail String`
  - `referredPhone String?`
  - `status    ReferralStatus @default(pending)`
  - `clientId  String? // Created client (after conversion)`
  - `bookingId String? // First booking`
  - `invoiceId String? // First invoice`
  - `source      String? // Where referral came from (link, form, etc.)`
  - `landingPage String? // URL they landed on`
  - `utmCampaign String?`
  - `utmSource   String?`
  - `submittedAt DateTime  @default(now())`
  - `qualifiedAt DateTime?`
  - `completedAt DateTime?`
  - `expiresAt   DateTime`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `program  ReferralProgram  @relation(fields: [programId], references: [id], onDelete: Cascade)`
  - `referrer Referrer         @relation(fields: [referrerId], references: [id], onDelete: Cascade)`
  - `client   Client?          @relation("ReferralClient", fields: [clientId], references: [id], onDelete: SetNull)`
  - `booking  Booking?         @relation("ReferralBooking", fields: [bookingId], references: [id], onDelete: SetNull)`
  - `invoice  Invoice?         @relation("ReferralInvoice", fields: [invoiceId], references: [id], onDelete: SetNull)`
  - `rewards  ReferralReward[]`
- Indexes/constraints:
  - `@@index([programId])`
  - `@@index([referrerId])`
  - `@@index([status])`
  - `@@index([referredEmail])`
- Action usage:
  - `referrals.ts`

### Model: ReferralReward
- Fields:
  - `id         String @id @default(cuid())`
  - `referrerId String`
  - `referralId String`
  - `rewardType  ReferralRewardType`
  - `amountCents Int`
  - `description String?`
  - `isIssued  Boolean   @default(false)`
  - `issuedAt  DateTime?`
  - `isClaimed Boolean   @default(false)`
  - `claimedAt DateTime?`
  - `expiresAt DateTime?`
  - `paymentMethod String? // How reward was paid (check, paypal, credit, etc.)`
  - `paymentRef    String? // Reference number`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `referrer Referrer @relation(fields: [referrerId], references: [id], onDelete: Cascade)`
  - `referral Referral @relation(fields: [referralId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([referrerId])`
  - `@@index([referralId])`
  - `@@index([isIssued])`

### Model: PlatformReferralSettings
- Fields:
  - `id String @id @default("default")`
  - `isActive              Boolean @default(true)`
  - `referralLinkValidDays Int     @default(30) // How long referral links are valid`
  - `referrerRewardType         PlatformRewardType @default(account_credit)`
  - `referrerRewardValue        Int                @default(2500) // $25 credit or 25 days, etc.`
  - `referrerMaxRewardsPerMonth Int? // Cap monthly rewards`
  - `referredTrialDays       Int  @default(21) // Extended trial (vs default 14)`
  - `referredDiscountPercent Int? // First month discount`
  - `referredDiscountMonths  Int  @default(1) // How many months discount applies`
  - `rewardExpirationDays Int? // How long until reward expires after issue`
  - `totalReferrals          Int @default(0)`
  - `totalConversions        Int @default(0)`
  - `totalRewardsIssuedCents Int @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
- Action usage:
  - `platform-referrals.ts`

### Model: PlatformReferrer
- Fields:
  - `id     String @id @default(cuid())`
  - `userId String @unique`
  - `referralCode String  @unique`
  - `referralUrl  String? // Custom vanity URL if allowed`
  - `totalReferrals      Int @default(0)`
  - `successfulReferrals Int @default(0) // Converted to paid`
  - `totalEarnedCents    Int @default(0)`
  - `pendingCreditCents  Int @default(0) // Credited but not yet applied`
  - `isActive Boolean @default(true)`
  - `isBanned Boolean @default(false) // For abuse prevention`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `user      User                     @relation(fields: [userId], references: [id], onDelete: Cascade)`
  - `referrals PlatformReferral[]`
  - `rewards   PlatformReferralReward[]`
- Indexes/constraints:
  - `@@index([referralCode])`
  - `@@index([userId])`
- Action usage:
  - `platform-referrals.ts`

### Model: PlatformReferral
- Fields:
  - `id         String @id @default(cuid())`
  - `referrerId String`
  - `referredEmail String`
  - `referredName  String?`
  - `status                 PlatformReferralStatus @default(pending)`
  - `referredUserId         String? // Set when they sign up`
  - `referredOrganizationId String? // Set when org created`
  - `source      String? // Where link was shared (email, social, etc.)`
  - `landingPage String? // Which page they landed on`
  - `utmCampaign String?`
  - `utmSource   String?`
  - `utmMedium   String?`
  - `clickedAt    DateTime? // When they clicked the link`
  - `signedUpAt   DateTime? // When they created account`
  - `subscribedAt DateTime? // When they started paid subscription`
  - `expiresAt    DateTime // When referral link expires`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `referrer             PlatformReferrer         @relation(fields: [referrerId], references: [id], onDelete: Cascade)`
  - `referredUser         User?                    @relation("ReferredByPlatform", fields: [referredUserId], references: [id], onDelete: SetNull)`
  - `referredOrganization Organization?            @relation("ReferredOrgByPlatform", fields: [referredOrganizationId], references: [id], onDelete: SetNull)`
  - `rewards              PlatformReferralReward[]`
- Indexes/constraints:
  - `@@index([referrerId])`
  - `@@index([referredEmail])`
  - `@@index([referredUserId])`
  - `@@index([status])`
  - `@@index([expiresAt])`
- Action usage:
  - `platform-referrals.ts`

### Model: PlatformReferralReward
- Fields:
  - `id         String @id @default(cuid())`
  - `referrerId String`
  - `referralId String`
  - `rewardType  PlatformRewardType`
  - `valueCents  Int // Dollar value or days`
  - `description String?`
  - `isApplied Boolean   @default(false) // Has it been used?`
  - `appliedAt DateTime?`
  - `expiresAt DateTime? // Rewards can expire`
  - `stripePromotionCodeId String? // If using Stripe promo codes`
  - `stripeCouponId        String?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `referrer PlatformReferrer @relation(fields: [referrerId], references: [id], onDelete: Cascade)`
  - `referral PlatformReferral @relation(fields: [referralId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([referrerId])`
  - `@@index([referralId])`
  - `@@index([isApplied])`
- Action usage:
  - `platform-referrals.ts`

### Model: QuestionnaireTemplate
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String? // Null = system template`
  - `name        String`
  - `slug        String`
  - `description String?  @db.Text`
  - `industry    Industry`
  - `isSystemTemplate Boolean @default(false)`
  - `isActive         Boolean @default(true)`
  - `usageCount       Int     @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization    Organization?                    @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `fields          QuestionnaireField[]`
  - `legalAgreements QuestionnaireTemplateAgreement[]`
  - `questionnaires  ClientQuestionnaire[]`
- Indexes/constraints:
  - `@@unique([organizationId, slug])`
  - `@@index([organizationId])`
  - `@@index([industry])`
  - `@@index([isSystemTemplate])`
  - `@@index([isActive])`
- Action usage:
  - `client-questionnaires.ts`
  - `questionnaire-templates.ts`

### Model: QuestionnaireField
- Fields:
  - `id         String @id @default(cuid())`
  - `templateId String`
  - `label       String`
  - `type        FormFieldType`
  - `placeholder String?`
  - `helpText    String?`
  - `isRequired  Boolean       @default(false)`
  - `sortOrder   Int           @default(0)`
  - `section      String? // e.g., "Property Details", "Agent Information"`
  - `sectionOrder Int     @default(0)`
  - `validation Json?`
  - `conditionalOn    String? // Field ID this depends on`
  - `conditionalValue String? // Value that triggers display`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `template QuestionnaireTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([templateId])`
  - `@@index([sortOrder])`
- Action usage:
  - `questionnaire-templates.ts`

### Model: QuestionnaireTemplateAgreement
- Fields:
  - `id         String @id @default(cuid())`
  - `templateId String`
  - `agreementType     LegalAgreementType`
  - `title             String`
  - `content           String             @db.Text`
  - `isRequired        Boolean            @default(true)`
  - `requiresSignature Boolean            @default(false)`
  - `sortOrder         Int                @default(0)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `template QuestionnaireTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([templateId])`
  - `@@index([agreementType])`

### Model: ClientQuestionnaire
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `clientId       String`
  - `templateId     String`
  - `bookingId String?`
  - `projectId String?`
  - `isRequired  Boolean                   @default(true)`
  - `dueDate     DateTime?`
  - `status      ClientQuestionnaireStatus @default(pending)`
  - `startedAt   DateTime?`
  - `completedAt DateTime?`
  - `sendReminders Boolean   @default(true)`
  - `remindersSent Int       @default(0)`
  - `lastReminder  DateTime?`
  - `internalNotes String?`
  - `personalNote String? @db.Text`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization                   @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client       Client                         @relation(fields: [clientId], references: [id], onDelete: Cascade)`
  - `template     QuestionnaireTemplate          @relation(fields: [templateId], references: [id], onDelete: Cascade)`
  - `booking      Booking?                       @relation(fields: [bookingId], references: [id], onDelete: SetNull)`
  - `project      Project?                       @relation(fields: [projectId], references: [id], onDelete: SetNull)`
  - `responses    ClientQuestionnaireResponse[]`
  - `agreements   ClientQuestionnaireAgreement[]`
  - `emailLogs    EmailLog[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([clientId])`
  - `@@index([templateId])`
  - `@@index([bookingId])`
  - `@@index([projectId])`
  - `@@index([status])`
  - `@@index([dueDate])`
- Action usage:
  - `client-portal.ts`
  - `client-questionnaires.ts`
  - `email-logs.ts`
  - `questionnaire-portal.ts`

### Model: ClientQuestionnaireResponse
- Fields:
  - `id              String @id @default(cuid())`
  - `questionnaireId String`
  - `fieldLabel String // Store label for reference after template changes`
  - `fieldType  String // Store type for proper rendering`
  - `value      Json // Actual response value`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `questionnaire ClientQuestionnaire @relation(fields: [questionnaireId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([questionnaireId])`
- Action usage:
  - `email-logs.ts`

### Model: ClientQuestionnaireAgreement
- Fields:
  - `id              String @id @default(cuid())`
  - `questionnaireId String`
  - `agreementType LegalAgreementType`
  - `title         String`
  - `content       String             @db.Text`
  - `accepted   Boolean   @default(false)`
  - `acceptedAt DateTime?`
  - `signatureData String?        @db.Text // Base64 encoded signature image`
  - `signatureType SignatureType?`
  - `acceptedIp        String?`
  - `acceptedUserAgent String? @db.Text`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `questionnaire ClientQuestionnaire @relation(fields: [questionnaireId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([questionnaireId])`
  - `@@index([agreementType])`
  - `@@index([accepted])`
- Action usage:
  - `email-logs.ts`
  - `questionnaire-portal.ts`

### Model: SubscriptionPlan
- Fields:
  - `id   String   @id @default(cuid())`
  - `name String   @unique // "Pro", "Studio", "Enterprise"`
  - `slug String   @unique // "pro", "studio", "enterprise"`
  - `plan PlanName // Links to the enum`
  - `description    String? @db.Text`
  - `tagline        String? // Short marketing tagline`
  - `badgeText      String? // e.g., "Most Popular", "Best Value"`
  - `displayOrder   Int     @default(0) // For ordering on pricing page`
  - `isHighlighted  Boolean @default(false) // Highlight this plan (e.g., recommended)`
  - `highlightColor String? // Custom highlight color`
  - `monthlyPriceCents Int // Base monthly price in cents`
  - `yearlyPriceCents  Int // Base yearly price in cents (usually discounted)`
  - `stripeProductId      String?   @unique // Stripe Product ID (prod_xxx)`
  - `stripeMonthlyPriceId String? // Stripe Price ID for monthly (price_xxx)`
  - `stripeYearlyPriceId  String? // Stripe Price ID for yearly (price_xxx)`
  - `stripeSyncedAt       DateTime?`
  - `trialDays Int @default(14) // Free trial duration`
  - `isActive Boolean @default(true) // Available for new signups`
  - `isPublic Boolean @default(true) // Visible on public pricing page`
  - `isLegacy Boolean @default(false) // Old plan, grandfathered users only`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `features        PlanFeature[]`
  - `pricingVariants PricingVariant[]`
- Indexes/constraints:
  - `@@index([isActive, isPublic])`
  - `@@index([plan])`
- Action usage:
  - `subscription-plans.ts`

### Model: PlanFeature
- Fields:
  - `id     String @id @default(cuid())`
  - `planId String`
  - `name        String // "Unlimited Galleries", "Priority Support"`
  - `description String? // Detailed description`
  - `category    String? // "Core", "Support", "Integrations", etc.`
  - `featureKey   String // Unique key like "galleries_limit", "storage_gb", "team_members"`
  - `featureValue String // Can be "unlimited", a number, or "true"/"false"`
  - `displayOrder  Int     @default(0)`
  - `isHighlighted Boolean @default(false) // Show with emphasis`
  - `tooltip       String? // Help text`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `plan SubscriptionPlan @relation(fields: [planId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([planId, featureKey])`
  - `@@index([planId])`
  - `@@index([featureKey])`
- Action usage:
  - `subscription-plans.ts`

### Model: PricingExperiment
- Fields:
  - `id   String @id @default(cuid())`
  - `name String // "Q1 2025 Price Test", "Enterprise Discount Test"`
  - `slug String @unique`
  - `description String? @db.Text`
  - `hypothesis  String? @db.Text // What we're testing`
  - `status    ExperimentStatus @default(draft)`
  - `startDate DateTime?`
  - `endDate   DateTime?`
  - `trafficPercent Int @default(50) // Percent of traffic to see experiment (vs control)`
  - `landingPagePaths String[] // e.g., ["/pricing", "/enterprise"] - which pages to run on`
  - `controlConversions      Int     @default(0)`
  - `controlImpressions      Int     @default(0)`
  - `variantConversions      Int     @default(0)`
  - `variantImpressions      Int     @default(0)`
  - `winningVariantId        String?`
  - `statisticalSignificance Float?`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `variants PricingVariant[]`
- Indexes/constraints:
  - `@@index([status])`
  - `@@index([startDate, endDate])`
- Action usage:
  - `subscription-plans.ts`

### Model: PricingVariant
- Fields:
  - `id           String  @id @default(cuid())`
  - `experimentId String?`
  - `planId       String`
  - `name        String // "10% Discount", "Premium Pricing", "Control"`
  - `description String?`
  - `isControl   Boolean @default(false) // Is this the control variant?`
  - `monthlyPriceCents Int?`
  - `yearlyPriceCents  Int?`
  - `trialDays Int?`
  - `stripeMonthlyPriceId String?`
  - `stripeYearlyPriceId  String?`
  - `stripeSyncedAt       DateTime?`
  - `badgeText     String? // Override badge`
  - `isHighlighted Boolean?`
  - `impressions Int @default(0)`
  - `conversions Int @default(0)`
  - `isActive Boolean @default(true)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `experiment PricingExperiment? @relation(fields: [experimentId], references: [id], onDelete: SetNull)`
  - `plan       SubscriptionPlan   @relation(fields: [planId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([experimentId])`
  - `@@index([planId])`
  - `@@index([isActive])`
- Action usage:
  - `subscription-plans.ts`

### Model: EmailLog
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `toEmail  String`
  - `toName   String?`
  - `clientId String?`
  - `emailType EmailType`
  - `subject   String`
  - `status    EmailStatus @default(pending)`
  - `questionnaireId String?`
  - `bookingId       String?`
  - `projectId       String?`
  - `invoiceId       String?`
  - `contractId      String?`
  - `galleryId       String?`
  - `resendId     String? // ID from Resend API`
  - `errorMessage String? @db.Text`
  - `sentAt      DateTime?`
  - `deliveredAt DateTime?`
  - `failedAt    DateTime?`
  - `createdAt   DateTime  @default(now())`
  - `organization  Organization         @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client        Client?              @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `questionnaire ClientQuestionnaire? @relation(fields: [questionnaireId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([clientId])`
  - `@@index([emailType])`
  - `@@index([status])`
  - `@@index([questionnaireId])`
  - `@@index([createdAt])`
- Action usage:
  - `email-logs.ts`

### Model: ApiKey
- Fields:
  - `id             String    @id @default(cuid())`
  - `organizationId String`
  - `name           String // User-provided name for the key`
  - `keyPrefix      String // Visible prefix (e.g., "sk_live_xxxx") for identification`
  - `keyHash        String // SHA-256 hash of the full key (never store plaintext)`
  - `lastUsedAt     DateTime?`
  - `expiresAt      DateTime?`
  - `scopes         String[]  @default(["read", "write"]) // Permissions: read, write, admin`
  - `isActive       Boolean   @default(true)`
  - `createdAt      DateTime  @default(now())`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@unique([organizationId, keyPrefix])`
  - `@@index([organizationId])`
  - `@@index([keyHash])`
  - `@@index([isActive])`
- Action usage:
  - `api-keys.ts`

### Model: WebhookEndpoint
- Fields:
  - `id             String    @id @default(cuid())`
  - `organizationId String`
  - `url            String // The URL to send webhook payloads to`
  - `description    String? // Optional user description`
  - `secret         String // HMAC signing secret for verification`
  - `events         String[] // Array of WebhookEventType values to subscribe to`
  - `isActive       Boolean   @default(true)`
  - `lastDeliveryAt DateTime?`
  - `failureCount   Int       @default(0) // Consecutive failures (reset on success)`
  - `createdAt      DateTime  @default(now())`
  - `updatedAt      DateTime  @updatedAt`
  - `organization Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `deliveries   WebhookDelivery[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([isActive])`
- Action usage:
  - `webhooks.ts`

### Model: WebhookDelivery
- Fields:
  - `id                String    @id @default(cuid())`
  - `webhookEndpointId String`
  - `eventType         String // The event that triggered this delivery`
  - `payload           Json // The full payload that was sent`
  - `responseStatus    Int? // HTTP status code from the receiver`
  - `responseBody      String?   @db.Text // Response body (truncated if too large)`
  - `deliveredAt       DateTime? // When the webhook was successfully delivered`
  - `attemptCount      Int       @default(1) // Number of delivery attempts`
  - `success           Boolean   @default(false)`
  - `errorMessage      String? // Error message if delivery failed`
  - `createdAt         DateTime  @default(now())`
  - `endpoint WebhookEndpoint @relation(fields: [webhookEndpointId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([webhookEndpointId])`
  - `@@index([createdAt])`
  - `@@index([success])`
- Action usage:
  - `webhooks.ts`

### Model: IntegrationLog
- Fields:
  - `id             String   @id @default(cuid())`
  - `organizationId String`
  - `provider       String // Integration provider: google_calendar, dropbox, slack, stripe, etc.`
  - `eventType      String // Event type: connected, disconnected, sync_started, sync_completed, error, etc.`
  - `message        String // Human-readable description of the event`
  - `details        Json? // Additional structured data about the event`
  - `createdAt      DateTime @default(now())`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([organizationId, provider])`
  - `@@index([createdAt])`
- Action usage:
  - `integration-logs.ts`

### Model: EmailAccount
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `provider EmailProvider // GMAIL or OUTLOOK`
  - `email    String // User's email address`
  - `accessToken  String   @db.Text`
  - `refreshToken String   @db.Text`
  - `tokenExpiry  DateTime`
  - `syncCursor  String? // For incremental sync (Gmail historyId or Outlook deltaLink)`
  - `lastSyncAt  DateTime?`
  - `syncEnabled Boolean   @default(true)`
  - `isActive     Boolean @default(true)`
  - `errorMessage String? // Last sync error if any`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `threads      EmailThread[]`
- Indexes/constraints:
  - `@@unique([organizationId, email])`
  - `@@index([organizationId])`
  - `@@index([provider])`
  - `@@index([isActive])`
- Action usage:
  - `email-accounts.ts`
  - `email-sync.ts`

### Model: EmailThread
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `emailAccountId String`
  - `subject           String`
  - `snippet           String   @db.Text // Preview text of latest message`
  - `participantEmails String[] // All email addresses in the thread`
  - `clientId String?`
  - `isRead     Boolean @default(false)`
  - `isStarred  Boolean @default(false)`
  - `isArchived Boolean @default(false)`
  - `isDraft    Boolean @default(false)`
  - `providerThreadId String // Gmail thread ID or Outlook conversation ID`
  - `lastMessageAt DateTime`
  - `createdAt     DateTime @default(now())`
  - `updatedAt     DateTime @updatedAt`
  - `emailAccount EmailAccount   @relation(fields: [emailAccountId], references: [id], onDelete: Cascade)`
  - `organization Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `client       Client?        @relation("ClientEmailThreads", fields: [clientId], references: [id], onDelete: SetNull)`
  - `messages     EmailMessage[]`
- Indexes/constraints:
  - `@@unique([emailAccountId, providerThreadId])`
  - `@@index([organizationId])`
  - `@@index([emailAccountId])`
  - `@@index([clientId])`
  - `@@index([isRead])`
  - `@@index([isArchived])`
  - `@@index([lastMessageAt])`
- Action usage:
  - `email-sync.ts`

### Model: EmailMessage
- Fields:
  - `id       String @id @default(cuid())`
  - `threadId String`
  - `providerMessageId String // Gmail message ID or Outlook message ID`
  - `fromEmail  String`
  - `fromName   String?`
  - `toEmails   String[]`
  - `toNames    String[]`
  - `ccEmails   String[]`
  - `bccEmails  String[]`
  - `replyTo    String?`
  - `subject    String`
  - `inReplyTo  String? // Message-ID of parent message`
  - `references String[] // Message-ID chain for threading`
  - `bodyHtml String? @db.Text`
  - `bodyText String? @db.Text`
  - `direction EmailDirection // INBOUND or OUTBOUND`
  - `isRead Boolean @default(false)`
  - `hasAttachments Boolean @default(false)`
  - `sentAt    DateTime`
  - `createdAt DateTime @default(now())`
  - `thread      EmailThread       @relation(fields: [threadId], references: [id], onDelete: Cascade)`
  - `attachments EmailAttachment[]`
- Indexes/constraints:
  - `@@unique([threadId, providerMessageId])`
  - `@@index([threadId])`
  - `@@index([direction])`
  - `@@index([sentAt])`
  - `@@index([fromEmail])`
- Action usage:
  - `email-sync.ts`

### Model: EmailAttachment
- Fields:
  - `id        String @id @default(cuid())`
  - `messageId String`
  - `filename    String`
  - `contentType String`
  - `size        Int // Size in bytes`
  - `storageKey String // S3/R2 key for the file`
  - `storageUrl String? // Pre-signed URL (temporary) or public URL`
  - `providerAttachmentId String?`
  - `createdAt DateTime @default(now())`
  - `message EmailMessage @relation(fields: [messageId], references: [id], onDelete: Cascade)`
- Indexes/constraints:
  - `@@index([messageId])`

### Model: GalleryAddon
- Fields:
  - `id             String @id @default(cuid())`
  - `organizationId String`
  - `name        String`
  - `description String?`
  - `iconName    String? // Icon identifier (lucide icon name)`
  - `priceCents   Int? // Base price in cents (null = "Request Quote")`
  - `pricePerItem Boolean @default(false) // If true, price is per photo`
  - `category GalleryAddonCategory @default(other)`
  - `industries ClientIndustry[] // Which industries this add-on applies to`
  - `estimatedTurnaround String? // e.g., "24-48 hours", "3-5 business days"`
  - `sortOrder Int     @default(0)`
  - `imageUrl  String? // Preview/sample image`
  - `isActive          Boolean @default(true)`
  - `requiresSelection Boolean @default(false) // Requires selecting specific photos`
  - `maxPhotos         Int? // Maximum photos that can be selected (null = unlimited)`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization          @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `requests     GalleryAddonRequest[]`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([isActive])`
  - `@@index([category])`
- Action usage:
  - `gallery-addons.ts`

### Model: GalleryAddonRequest
- Fields:
  - `id             String  @id @default(cuid())`
  - `organizationId String`
  - `projectId      String // The gallery`
  - `addonId        String`
  - `clientEmail    String? // Email of requesting client`
  - `clientId       String? // If associated with a client record`
  - `status GalleryAddonRequestStatus @default(pending)`
  - `notes          String?  @db.Text // Client notes/instructions`
  - `selectedPhotos String[] // Asset IDs of selected photos (if requiresSelection)`
  - `quoteCents       Int? // Quoted price`
  - `quoteDescription String?   @db.Text // Quote details`
  - `quotedAt         DateTime?`
  - `approvedAt DateTime?`
  - `declinedAt DateTime?`
  - `completedAt  DateTime?`
  - `deliveryNote String?   @db.Text // Note when delivering completed work`
  - `invoiceId String? // If an invoice was created for this`
  - `createdAt DateTime @default(now())`
  - `updatedAt DateTime @updatedAt`
  - `organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)`
  - `project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)`
  - `addon        GalleryAddon @relation(fields: [addonId], references: [id], onDelete: Cascade)`
  - `client       Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)`
  - `invoice      Invoice?     @relation(fields: [invoiceId], references: [id], onDelete: SetNull)`
- Indexes/constraints:
  - `@@index([organizationId])`
  - `@@index([projectId])`
  - `@@index([addonId])`
  - `@@index([clientId])`
  - `@@index([status])`
- Action usage:
  - `gallery-addons.ts`

## Data Model Reference (Prisma Schema - Verbatim)
```prisma
// PhotoProOS - The Business OS for Professional Photographers
// Prisma Schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// ============================================================================
// ENUMS
// ============================================================================

enum PlanName {
  free
  pro
  studio
  enterprise
}

enum ProjectStatus {
  draft
  pending
  delivered
  archived
}

enum PaymentStatus {
  pending
  paid
  failed
  refunded
  overdue
}

enum BookingStatus {
  pending
  confirmed
  completed
  cancelled
}

enum InvoiceStatus {
  draft
  sent
  paid
  overdue
  cancelled
}

enum ContractStatus {
  draft
  sent
  signed
  expired
  cancelled
}

enum ClientIndustry {
  real_estate
  wedding
  portrait
  commercial
  architecture
  food_hospitality
  events
  headshots
  product
  other
}

enum ActivityType {
  gallery_created
  gallery_delivered
  gallery_viewed
  gallery_paid
  photo_viewed
  payment_received
  payment_failed
  client_added
  client_created
  client_updated
  client_merged
  booking_created
  booking_confirmed
  booking_cancelled
  invoice_sent
  invoice_paid
  contract_sent
  contract_signed
  email_sent
  file_uploaded
  file_downloaded
  settings_updated
  order_created
  order_paid
  selections_submitted
}

enum NotificationType {
  // Payments
  payment_received
  payment_failed
  // Galleries
  gallery_viewed
  gallery_delivered
  // Bookings
  booking_created
  booking_confirmed
  booking_cancelled
  booking_reminder
  // Contracts
  contract_sent
  contract_signed
  // Invoices
  invoice_sent
  invoice_paid
  invoice_overdue
  // Questionnaires
  questionnaire_assigned
  questionnaire_completed
  questionnaire_reminder
  // Leads & Clients
  lead_received
  client_added
  // Referrals
  referral_signup
  referral_conversion
  // System
  system
}

enum TaskStatus {
  todo
  in_progress
  in_review
  blocked
  completed
  archived
}

enum TaskPriority {
  urgent
  high
  medium
  low
}

enum MemberRole {
  owner
  admin
  member
}

enum InvitationStatus {
  pending
  accepted
  expired
  revoked
}

enum PortalMode {
  light
  dark
  auto // Follow system preference
}

enum ServiceCategory {
  real_estate
  portrait
  event
  commercial
  wedding
  product
  other
}

enum PropertyType {
  single_family
  condo
  townhouse
  multi_family
  land
  commercial
  other
}

enum EquipmentCategory {
  camera
  lens
  lighting
  drone
  tripod
  audio
  stabilizer
  backdrop
  other
}

enum CapabilityLevel {
  learning
  capable
  expert
}

enum LeadStatus {
  new
  contacted
  qualified
  closed
}

enum MarketingAssetType {
  flyer_portrait
  flyer_landscape
  social_square
  social_story
  postcard
  email_banner
  video_slideshow
}

enum WatermarkPosition {
  top_left
  top_center
  top_right
  center
  bottom_left
  bottom_center
  bottom_right
  tiled
  diagonal
}

enum DiscountType {
  percentage
  fixed_amount
}

enum PaymentPlanStatus {
  active
  completed
  cancelled
  overdue
}

enum DownloadFormat {
  original
  web_size
  high_res
  zip_all
}

enum SelectionType {
  favorite
  selection
}

enum SelectionStatus {
  in_progress
  submitted
  approved
  rejected
}

enum GalleryDownloadOption {
  full // Only original resolution
  web // Only web-optimized resolution
  both // Allow both options
}

enum PropertyWebsiteTemplate {
  modern
  classic
  luxury
  minimal
  commercial
}

enum PortfolioType {
  photographer
  client
}

enum PortfolioTemplate {
  modern
  bold
  elegant
  minimal
  creative
}

enum PortfolioSectionType {
  // Preset sections
  hero
  about
  gallery
  services
  testimonials
  awards
  contact
  faq
  // Freeform blocks
  text
  image
  video
  spacer
  custom_html
}

enum LineItemType {
  service
  travel
  custom
  discount
  tax
}

enum BusinessType {
  solo
  team
  agency
}

enum DisplayMode {
  personal
  company
}

enum Industry {
  real_estate
  commercial
  events
  portraits
  food
  product
}

// Phase 1: New Enums
enum AvailabilityBlockType {
  time_off
  holiday
  personal
  maintenance
  other
}

enum TimeOffRequestStatus {
  pending
  approved
  rejected
}

enum CommunicationType {
  email
  call
  meeting
  note
  sms
}

enum CommunicationDirection {
  inbound
  outbound
  internal
}

enum SignatureType {
  drawn
  typed
  uploaded
}

enum RecurrencePattern {
  daily
  weekly
  biweekly
  monthly
  custom
}

enum CalendarProvider {
  google
  outlook
  apple
}

enum SyncDirection {
  import_only
  export_only
  both
}

// Phase 2: Client Questionnaire System
enum ClientQuestionnaireStatus {
  pending // Assigned but not started
  in_progress // Client started but not completed
  completed // Client submitted
  approved // Photographer reviewed
  expired // Past deadline
}

enum EmailType {
  gallery_delivered
  gallery_reminder
  payment_receipt
  booking_confirmation
  welcome
  property_lead
  gallery_expiration
  order_confirmation
  contract_signing
  contract_signed
  team_invitation
  questionnaire_assigned
  questionnaire_reminder
  questionnaire_completed
  photographer_digest
  custom
}

enum EmailStatus {
  pending
  sent
  delivered
  failed
  bounced
}

// Email provider for connected accounts (unified inbox)
enum EmailProvider {
  GMAIL
  OUTLOOK
}

// Direction of email message in unified inbox
enum EmailDirection {
  INBOUND
  OUTBOUND
}

enum LegalAgreementType {
  terms_of_service
  licensing_agreement
  model_release
  property_release
  liability_waiver
  shoot_checklist
  custom
}

enum GalleryAddonCategory {
  enhancement // Photo editing, retouching
  virtual_staging // Virtual staging, furniture
  marketing // Flyers, social media, marketing materials
  video // Video tours, slideshows
  print // Prints, albums
  editing // Color correction, HDR
  removal // Object removal, decluttering
  other
}

enum GalleryAddonRequestStatus {
  pending // Client requested
  quoted // Photographer sent quote
  approved // Client approved quote
  in_progress // Work in progress
  completed // Delivered
  declined // Client declined
  cancelled // Cancelled
}

// ============================================================================
// CORE MODELS
// ============================================================================

model Organization {
  id                  String   @id @default(cuid())
  clerkOrganizationId String?  @unique
  name                String
  slug                String   @unique
  plan                PlanName @default(free)

  // Stripe
  stripeCustomerId       String? @unique
  stripeSubscriptionId   String?
  stripeConnectAccountId String?
  stripeConnectOnboarded Boolean @default(false)

  // Branding
  logoUrl        String?
  logoLightUrl   String? // Logo variant for light backgrounds
  faviconUrl     String?
  primaryColor   String? @default("#3b82f6")
  secondaryColor String? @default("#8b5cf6")
  accentColor    String? @default("#22c55e")
  customDomain   String? @unique

  // Portal Appearance (free features)
  portalMode     PortalMode @default(dark) // light or dark mode for client-facing pages
  invoiceLogoUrl String? // Separate logo for invoices (optional)

  // White-Label Options (paid plans only)
  hidePlatformBranding Boolean @default(false) // Hide "Powered by PhotoProOS"
  customEmailDomain    String? // For white-label email sending

  // Watermark Configuration
  watermarkEnabled  Boolean           @default(true)
  watermarkType     String?           @default("text") // "text" or "image"
  watermarkText     String? // Custom text (e.g., "(c) Studio Name")
  watermarkImageUrl String? // URL to watermark image
  watermarkPosition WatermarkPosition @default(bottom_right)
  watermarkOpacity  Float             @default(0.5) // 0-1
  watermarkScale    Float             @default(0.15) // Size relative to image (0-1)

  // Settings
  timezone String @default("America/New_York")
  currency String @default("USD")

  // Tax settings
  defaultTaxRate Float?  @default(0) // Default tax rate as percentage (e.g., 8.25 for 8.25%)
  taxLabel       String? @default("Sales Tax") // Label shown on invoices (e.g., "Sales Tax", "VAT", "GST")

  // Travel fee settings
  homeBaseLocationId String?
  travelFeePerMile   Int?    @default(0) // in cents (e.g., 65 = $0.65/mile)
  travelFeeThreshold Float?  @default(0) // free miles before charging

  // ============================================================================
  // ONBOARDING & INDUSTRY SETTINGS
  // ============================================================================

  // Onboarding State
  onboardingCompleted   Boolean   @default(false)
  onboardingStep        Int       @default(0)
  onboardingCompletedAt DateTime?

  // Industry Selection (array of industry IDs)
  industries      Industry[] @default([real_estate])
  primaryIndustry Industry   @default(real_estate)

  // Enabled Modules/Features (array of module IDs like "galleries", "scheduling", etc.)
  enabledModules String[] @default([])

  // Business Profile (collected during onboarding)
  businessType    BusinessType?
  teamSize        String? // "1", "2-5", "6-10", "11-25", "25+"
  yearsInBusiness String? // "<1", "1-3", "3-5", "5-10", "10+"
  annualRevenue   String? // "<50k", "50-100k", "100-250k", "250k+"

  // Display Preferences (personal vs company branding)
  displayMode DisplayMode @default(company)
  publicName  String? // What clients see (company or personal name)
  publicEmail String? // Public-facing email
  publicPhone String? // Public-facing phone
  website     String? // Company website

  // Stripe Trial/Payment
  trialStartedAt     DateTime?
  trialEndsAt        DateTime?
  paymentMethodAdded Boolean   @default(false)

  // ============================================================================
  // PHASE 3: SMS & FIELD OPERATIONS SETTINGS
  // ============================================================================

  // Gallery Settings
  autoArchiveExpiredGalleries Boolean @default(true) // Auto-archive galleries when they expire

  // Email Settings
  emailSenderName           String? // Custom "from" name for emails
  emailReplyTo              String? // Custom reply-to email address
  emailSignature            String? @db.Text // Optional email signature
  enableQuestionnaireEmails Boolean @default(true)
  enableDigestEmails        Boolean @default(true)
  digestEmailFrequency      String? @default("daily") // "daily", "weekly", "none"
  digestEmailTime           String? @default("08:00") // Time in HH:MM format
  digestEmailDayOfWeek      Int?    @default(0) // 0=Sunday, 1=Monday, etc. (for weekly digest)

  // Notification Preferences (JSON: per-category email/push toggles)
  notificationPreferences Json? // { email: {...}, push: {...}, quietHours: {...} }
  quietHoursEnabled       Boolean @default(false)
  quietHoursFrom          String? @default("22:00") // HH:MM format
  quietHoursTo            String? @default("07:00") // HH:MM format

  // Twilio SMS Settings
  twilioAccountSid  String?
  twilioAuthToken   String?
  twilioPhoneNumber String?
  smsEnabled        Boolean @default(false)

  // Self-Booking Portal Settings
  selfBookingEnabled  Boolean @default(false)
  selfBookingPageSlug String?

  // Slack Integration Settings
  slackTeamId      String?
  slackAccessToken String? @db.Text

  // Guided Tour Progress (JSON: { "dashboard": true, "galleries": false, ... })
  tourProgress Json?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  members                  OrganizationMember[]
  invitations              Invitation[]
  projects                 Project[]
  portfolioWebsites        PortfolioWebsite[]
  portfolioInquiries       PortfolioInquiry[]
  portfolioLeads           PortfolioLead[]
  portfolioComments        PortfolioComment[]
  portfolioABTests         PortfolioABTest[]
  customForms              CustomForm[]
  clients                  Client[]
  payments                 Payment[]
  galleryFeedback          GalleryFeedback[]
  bookings                 Booking[]
  bookingTypes             BookingType[]
  invoices                 Invoice[]
  creditNotes              CreditNote[]
  estimates                Estimate[]
  clientRetainers          ClientRetainer[]
  contracts                Contract[]
  contractTemplates        ContractTemplate[]
  activityLogs             ActivityLog[]
  notifications            Notification[]
  usageMeters              UsageMeter[]
  onboardingProgress       OnboardingProgress?
  services                 Service[]
  locations                Location[]
  equipment                Equipment[]
  watermarkTemplates       WatermarkTemplate[]
  homeBaseLocation         Location?                 @relation("OrgHomeBase", fields: [homeBaseLocationId], references: [id])
  taskBoards               TaskBoard[]
  tasks                    Task[]
  taskTemplates            TaskTemplate[]
  taskAutomations          TaskAutomation[]
  recurringTasks           RecurringTask[]
  discountCodes            DiscountCode[]
  paymentPlans             PaymentPlan[]
  invoiceTemplates         InvoiceTemplate[]
  invoiceBrandingTemplates InvoiceBrandingTemplate[]
  invoiceEmailTemplates    InvoiceEmailTemplate[]
  galleryTemplates         GalleryTemplate[]

  // Phase 1: Ordering System relations
  serviceBundles ServiceBundle[]
  serviceAddons  ServiceAddon[]
  orderPages     OrderPage[]
  orders         Order[]

  // Phase 2: Brokerage & Enterprise relations
  brokerages    Brokerage[]
  payoutBatches PayoutBatch[]

  // Phase 3: SMS & Field Operations relations
  smsTemplates       SMSTemplate[]
  smsLogs            SMSLog[]
  slackIntegrations  SlackIntegration[]
  dropboxIntegration DropboxIntegration?
  bookingSlots       BookingSlot[]

  // Public booking forms
  bookingForms    BookingForm[]
  productCatalogs ProductCatalog[]

  // Phase 4: Service Territories & Referral Program
  territories     ServiceTerritory[]
  referralProgram ReferralProgram?

  // Phase 2: Client Questionnaire System
  questionnaireTemplates QuestionnaireTemplate[]
  clientQuestionnaires   ClientQuestionnaire[]

  // Email Logging System
  emailLogs EmailLog[]

  // Platform Referral System
  referredByPlatform PlatformReferral[] @relation("ReferredOrgByPlatform")

  // Recurring Invoices
  recurringInvoices RecurringInvoice[]

  // API Keys & Webhooks for Integrations
  apiKeys          ApiKey[]
  webhookEndpoints WebhookEndpoint[]
  integrationLogs  IntegrationLog[]

  // iCal Feed Exports
  calendarFeeds CalendarFeed[]

  // Booking Waitlist
  waitlistEntries BookingWaitlist[]

  // Unified Email Inbox
  emailAccounts        EmailAccount[]
  emailThreads         EmailThread[]
  galleryAddons        GalleryAddon[]
  galleryAddonRequests GalleryAddonRequest[]

  @@index([slug])
  @@index([plan])
}

model User {
  id          String  @id @default(cuid())
  clerkUserId String  @unique
  email       String  @unique
  fullName    String?
  avatarUrl   String?
  phone       String?

  // Personal info (collected during onboarding)
  firstName String?
  lastName  String?

  // Onboarding preferences
  hasSeenWelcome       Boolean  @default(false)
  tourCompletedModules String[] @default([])

  // Dashboard appearance preferences
  dashboardTheme     String  @default("default") // Theme preset: default, midnight, forest, sunset, ocean, lavender
  dashboardAccent    String  @default("#3b82f6") // Custom accent color
  sidebarCompact     Boolean @default(false) // Compact sidebar mode
  sidebarPosition    String  @default("left") // Sidebar position: left, right
  fontFamily         String  @default("system") // Font: system, inter, jakarta, dm-sans, space-grotesk, jetbrains
  density            String  @default("comfortable") // Spacing: compact, comfortable, spacious
  fontSize           String  @default("medium") // Font size: small, medium, large, x-large
  highContrast       Boolean @default(false) // High contrast mode for accessibility
  reduceMotion       Boolean @default(false) // Reduce animations for accessibility
  autoThemeEnabled   Boolean @default(false) // Auto switch theme based on time
  autoThemeDarkStart String  @default("18:00") // When to switch to dark mode (HH:MM)
  autoThemeDarkEnd   String  @default("06:00") // When to switch to light mode (HH:MM)

  // Dashboard customization
  dashboardConfig Json? // JSON config for widget visibility, collapsed sections, order

  // Home base location (overrides org default for travel calculations)
  homeBaseLocationId String?

  // Phase 2: Stripe Connect for photographer payouts
  stripeConnectAccountId String? @unique
  stripeConnectOnboarded Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  memberships         OrganizationMember[]
  activityLogs        ActivityLog[]
  serviceCapabilities UserServiceCapability[]
  equipment           UserEquipment[]
  assignedBookings    Booking[]               @relation("AssignedBookings")
  homeBaseLocation    Location?               @relation("UserHomeBase", fields: [homeBaseLocationId], references: [id])
  assignedTasks       Task[]
  taskComments        TaskComment[]
  equipmentChecks     BookingEquipmentCheck[] @relation("EquipmentChecker")
  crewAssignments     BookingCrew[]           @relation("BookingCrewAssignments")

  // Platform Referral System
  platformReferrer   PlatformReferrer?
  referredByPlatform PlatformReferral[] @relation("ReferredByPlatform")

  // iCal Feed Exports
  calendarFeeds   CalendarFeed[]  @relation("UserCalendarFeeds")
  recurringTasks  RecurringTask[]
  taskTimeEntries TaskTimeEntry[]

  @@index([email])
  @@index([clerkUserId])
}

model OrganizationMember {
  id             String     @id @default(cuid())
  organizationId String
  userId         String
  role           MemberRole @default(member)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@index([organizationId])
  @@index([userId])
}

model Invitation {
  id             String           @id @default(cuid())
  organizationId String
  email          String
  role           MemberRole       @default(member)
  status         InvitationStatus @default(pending)

  // Invitation token for secure acceptance
  token     String   @unique
  expiresAt DateTime

  // Who sent the invitation
  invitedById String

  // Tracking
  acceptedAt DateTime?
  revokedAt  DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, email, status]) // Only one pending invitation per email per org
  @@index([organizationId])
  @@index([email])
  @@index([token])
  @@index([status])
}

// ============================================================================
// CLIENTS
// ============================================================================

model Client {
  id             String         @id @default(cuid())
  organizationId String
  email          String
  fullName       String?
  company        String?
  phone          String?
  address        String?
  industry       ClientIndustry @default(other)
  notes          String?

  // Metrics
  lifetimeRevenueCents Int @default(0)
  totalProjects        Int @default(0)

  // Portal access
  portalAccessToken String?   @unique
  lastPortalAccess  DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // CRM Enhancements (Phase 1)
  source         String? // How client found you: REFERRAL, ORGANIC, AD, REPEAT
  preferences    Json? // Client style/delivery preferences
  isVIP          Boolean   @default(false)
  lastActivityAt DateTime?

  // Communication preferences
  smsOptIn                 Boolean @default(true) // Client consent for SMS notifications
  emailOptIn               Boolean @default(true) // Client consent for email communications
  questionnaireEmailsOptIn Boolean @default(true) // Receive questionnaire-related emails
  marketingEmailsOptIn     Boolean @default(false) // Receive marketing emails (opt-in required)

  // Phase 2: Brokerage relationship (client is an agent under a brokerage)
  brokerageId String?

  // Relations
  organization   Organization          @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  brokerage      Brokerage?            @relation("BrokerageAgents", fields: [brokerageId], references: [id], onDelete: SetNull)
  projects       Project[]
  bookings       Booking[]
  invoices       Invoice[]
  creditNotes    CreditNote[]
  contracts      Contract[]
  payments       Payment[]
  clientSessions ClientSession[]
  tasks          Task[]
  communications ClientCommunication[]
  tags           ClientTagAssignment[]

  // Phase 1: Ordering System relations
  orderPages OrderPage[] // Dedicated order pages for this client
  orders     Order[] // Orders placed by this client

  // Phase 4: Referral Program relations
  referrer  Referrer?  @relation("ClientReferrer")
  referrals Referral[] @relation("ReferralClient")

  // Phase 2: Client Questionnaire System
  questionnaires ClientQuestionnaire[]

  // Recurring Invoices
  recurringInvoices RecurringInvoice[]

  // Phase 3: SMS Integration
  smsLogs SMSLog[]

  // Email Logging System
  emailLogs EmailLog[]

  // Client Portal Notifications
  notifications ClientNotification[]

  // Booking Waitlist
  waitlistEntries BookingWaitlist[]

  // Unified Email Inbox (threads linked to this client)
  emailThreads EmailThread[] @relation("ClientEmailThreads")

  // Estimates/Quotes
  estimates Estimate[]

  // Retainer Balance
  retainer             ClientRetainer?
  galleryAddonRequests GalleryAddonRequest[]

  @@unique([organizationId, email])
  @@index([organizationId])
  @@index([email])
  @@index([industry])
  @@index([brokerageId])
}

model ClientSession {
  id        String   @id @default(cuid())
  clientId  String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  // Relations
  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@index([token])
}

// ============================================================================
// SERVICES
// ============================================================================

model Service {
  id             String          @id @default(cuid())
  organizationId String
  name           String
  category       ServiceCategory @default(other)
  description    String?
  priceCents     Int             @default(0)
  duration       String? // e.g., "2-3 hours"
  deliverables   String[] // Array of included items
  isActive       Boolean         @default(true)
  isDefault      Boolean         @default(false) // System-provided template
  sortOrder      Int             @default(0)

  // Stripe Product Catalog sync
  stripeProductId String? // Stripe Product ID (prod_xxx)
  stripePriceId   String? // Stripe Price ID (price_xxx)
  stripeSyncedAt  DateTime? // Last successful sync timestamp

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization          Organization                  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  projects              Project[] // Galleries using this service (deprecated - use projectServices)
  projectServices       ProjectService[] // Many-to-many: galleries using this service
  bookings              Booking[] // Bookings using this service
  userCapabilities      UserServiceCapability[] // Team members who can perform this service
  equipmentRequirements ServiceEquipmentRequirement[] // Equipment required for this service

  // Phase 1: Ordering System relations
  bundleItems        ServiceBundleItem[] // Bundles this service is part of
  addonCompatibility ServiceAddonCompat[] // Addons compatible with this service
  orderPageServices  OrderPageService[] // Order pages featuring this service
  orderItems         OrderItem[] // Order items referencing this service

  // Public booking forms
  bookingFormServices BookingFormService[]

  // Phase 4: Territory pricing overrides
  territoryOverrides TerritoryServiceOverride[] @relation("ServiceTerritoryOverrides")

  // Gallery templates using this service as default
  galleryTemplates GalleryTemplate[]

  // Booking Waitlist
  waitlistEntries BookingWaitlist[]

  @@index([organizationId])
  @@index([category])
  @@index([isActive])
  @@index([isDefault])
}

// ============================================================================
// GALLERIES / PROJECTS
// ============================================================================

model Project {
  id             String        @id @default(cuid())
  organizationId String
  clientId       String?
  serviceId      String?
  locationId     String?
  name           String
  description    String?
  status         ProjectStatus @default(draft)

  // Pricing
  priceCents Int    @default(0)
  currency   String @default("USD")

  // Gallery Settings
  coverImageUrl           String?
  password                String?
  expiresAt               DateTime?
  allowDownloads          Boolean               @default(true)
  allowFavorites          Boolean               @default(true)
  allowComments           Boolean               @default(false)
  showWatermark           Boolean               @default(false)
  downloadResolution      GalleryDownloadOption @default(both)
  downloadRequiresPayment Boolean               @default(true) // If true, downloads require payment. If false, allow free downloads even when gallery has a price.

  // Selection Settings
  allowSelections     Boolean @default(true) // Allow clients to make selections
  selectionLimit      Int? // Maximum photos client can select (null = unlimited)
  selectionRequired   Boolean @default(false) // Require selection before download
  selectionsSubmitted Boolean @default(false) // Whether client has submitted selections

  // Delivery
  deliveredAt   DateTime?
  archivedAt    DateTime? // When gallery was archived (auto or manual)
  viewCount     Int       @default(0)
  downloadCount Int       @default(0)

  // Reminder tracking
  lastReminderSentAt     DateTime? // When last reminder was sent
  reminderCount          Int       @default(0) // Number of reminders sent
  reminderEnabled        Boolean   @default(true) // Allow reminders for this gallery
  expirationWarningsSent Int[]     @default([]) // Days before expiration when warnings were sent (e.g., [7, 3, 1])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization      Organization              @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client            Client?                   @relation(fields: [clientId], references: [id], onDelete: SetNull)
  service           Service?                  @relation(fields: [serviceId], references: [id], onDelete: SetNull) // Deprecated - use services
  location          Location?                 @relation(fields: [locationId], references: [id], onDelete: SetNull)
  services          ProjectService[] // Many-to-many: services for this gallery
  assets            Asset[]
  collections       GalleryCollection[] // Sub-albums within the gallery
  deliveryLinks     DeliveryLink[]
  payments          Payment[]
  favorites         GalleryFavorite[]
  comments          GalleryComment[]
  ratings           PhotoRating[]
  feedback          GalleryFeedback[]
  propertyWebsite   PropertyWebsite?
  portfolioWebsites PortfolioWebsiteProject[]
  tasks             Task[]

  // Phase 2: Client Questionnaire System
  questionnaires       ClientQuestionnaire[]
  galleryAddonRequests GalleryAddonRequest[]

  @@index([organizationId])
  @@index([clientId])
  @@index([serviceId])
  @@index([locationId])
  @@index([status])
  @@index([createdAt])
}

// Junction table for many-to-many Project-Service relationship
model ProjectService {
  id                 String   @id @default(cuid())
  projectId          String
  serviceId          String
  isPrimary          Boolean  @default(false) // Mark the primary service if needed
  priceCentsOverride Int? // Override the service price for this specific project
  createdAt          DateTime @default(now())

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  service Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([projectId, serviceId])
  @@index([projectId])
  @@index([serviceId])
}

// Gallery Templates - Reusable gallery settings presets
model GalleryTemplate {
  id             String  @id @default(cuid())
  organizationId String
  name           String // Template name
  description    String? // Optional description

  // Default service to apply
  serviceId String?

  // Pricing defaults
  defaultPriceCents Int    @default(0)
  currency          String @default("USD")

  // Access settings
  isPasswordProtected Boolean @default(false)
  defaultPassword     String? // Optional default password

  // Gallery settings
  allowDownloads    Boolean @default(true)
  allowFavorites    Boolean @default(true)
  showWatermark     Boolean @default(false)
  sendNotifications Boolean @default(true)

  // Expiration defaults
  expirationDays Int? // Number of days until expiration (null = never)

  // Metadata
  isDefault  Boolean  @default(false) // Mark as default template
  usageCount Int      @default(0) // Track how often template is used
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  service      Service?     @relation(fields: [serviceId], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@index([serviceId])
}

// Watermark Templates - Reusable watermark presets
model WatermarkTemplate {
  id             String @id @default(cuid())
  organizationId String
  name           String // Template name (e.g., "Full Signature", "Corner Logo")

  // Watermark configuration
  watermarkType     String // "text" | "image"
  watermarkText     String? // Text content for text watermarks
  watermarkImageUrl String? // Image URL for image watermarks
  watermarkPosition String // "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
  watermarkOpacity  Float   @default(0.5) // 0.0 to 1.0
  watermarkScale    Float   @default(1.0) // Scale multiplier

  // Metadata
  isDefault Boolean  @default(false) // Mark as default template
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
}

// Gallery Collections - Sub-albums within a gallery
model GalleryCollection {
  id           String  @id @default(cuid())
  projectId    String
  name         String
  description  String?
  coverAssetId String? // Cover photo for the collection
  sortOrder    Int     @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assets  Asset[]

  @@index([projectId])
  @@index([sortOrder])
}

model Asset {
  id           String  @id @default(cuid())
  projectId    String
  collectionId String? // Optional collection assignment

  // File info
  filename       String
  originalUrl    String
  thumbnailUrl   String?
  mediumUrl      String?
  watermarkedUrl String?

  // Metadata
  mimeType  String
  sizeBytes Int
  width     Int?
  height    Int?

  // EXIF data
  exifData Json?

  // Ordering
  sortOrder Int @default(0)

  // Per-photo watermark control
  excludeFromWatermark Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  project       Project            @relation(fields: [projectId], references: [id], onDelete: Cascade)
  collection    GalleryCollection? @relation(fields: [collectionId], references: [id], onDelete: SetNull)
  favorites     GalleryFavorite[]
  comments      GalleryComment[]
  ratings       PhotoRating[]
  productPhotos ProductPhoto[]

  @@index([projectId])
  @@index([collectionId])
  @@index([sortOrder])
}

model DeliveryLink {
  id        String @id @default(cuid())
  projectId String
  slug      String @unique

  // Settings
  password  String?
  expiresAt DateTime?
  isActive  Boolean   @default(true)

  // Analytics
  viewCount    Int       @default(0)
  lastViewedAt DateTime?

  createdAt DateTime @default(now())

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([slug])
}

model GalleryFavorite {
  id            String          @id @default(cuid())
  projectId     String
  assetId       String
  clientEmail   String?
  sessionId     String?
  selectionType SelectionType   @default(favorite)
  notes         String? // Client notes for this selection
  status        SelectionStatus @default(in_progress)

  createdAt   DateTime  @default(now())
  submittedAt DateTime? // When the client submitted their selections for review

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  asset   Asset   @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@unique([projectId, assetId, clientEmail, selectionType])
  @@index([projectId])
  @@index([assetId])
  @@index([selectionType])
  @@index([status])
}

model GalleryComment {
  id          String  @id @default(cuid())
  projectId   String
  assetId     String? // Optional - if set, this is a per-photo comment; if null, it's a gallery-level comment
  clientEmail String?
  clientName  String?
  content     String
  sessionId   String? // Session ID for secure comment ownership verification

  createdAt DateTime @default(now())

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  asset   Asset?  @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([assetId])
  @@index([sessionId])
}

model PhotoRating {
  id        String @id @default(cuid())
  projectId String
  assetId   String
  rating    Int // 1-5 stars
  sessionId String // Track who rated for updates

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  asset   Asset   @relation(fields: [assetId], references: [id], onDelete: Cascade)

  // Unique constraint: one rating per session per photo
  @@unique([assetId, sessionId])
  @@index([projectId])
  @@index([assetId])
}

model GalleryFeedback {
  id             String  @id @default(cuid())
  projectId      String
  organizationId String
  type           String // "feedback", "feature", "issue"
  message        String
  clientName     String?
  clientEmail    String?
  ipAddress      String?
  userAgent      String?
  isRead         Boolean @default(false)
  isResolved     Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([organizationId])
  @@index([type])
  @@index([isRead])
}

// ============================================================================
// PAYMENTS
// ============================================================================

model Payment {
  id             String  @id @default(cuid())
  organizationId String
  projectId      String?
  invoiceId      String?
  clientId       String?

  // Amount
  amountCents    Int
  tipAmountCents Int           @default(0) // Gratuity amount
  currency       String        @default("USD")
  status         PaymentStatus @default(pending)

  // Stripe
  stripePaymentIntentId   String? @unique
  stripeCheckoutSessionId String? @unique
  stripeChargeId          String?

  // Client info
  clientEmail String?
  clientName  String?

  // Metadata
  description String?
  receiptUrl  String?

  paidAt    DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  project      Project?     @relation(fields: [projectId], references: [id], onDelete: SetNull)
  invoice      Invoice?     @relation(fields: [invoiceId], references: [id], onDelete: SetNull)
  client       Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@index([projectId])
  @@index([invoiceId])
  @@index([clientId])
  @@index([status])
  @@index([createdAt])
}

// ============================================================================
// BOOKINGS
// ============================================================================

model BookingType {
  id              String  @id @default(cuid())
  organizationId  String
  name            String
  description     String?
  durationMinutes Int     @default(60)
  priceCents      Int     @default(0)
  color           String  @default("#3b82f6")
  isActive        Boolean @default(true)

  // Buffer time settings (default for bookings of this type)
  bufferBeforeMinutes Int @default(0) // Prep time before booking
  bufferAfterMinutes  Int @default(0) // Travel/wrap-up time after booking

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization          Organization                      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  bookings              Booking[]
  equipmentRequirements BookingTypeEquipmentRequirement[]

  @@index([organizationId])
}

model Booking {
  id             String  @id @default(cuid())
  organizationId String
  clientId       String?
  bookingTypeId  String?
  serviceId      String?
  locationId     String?
  assignedUserId String?

  // Details
  title       String
  description String?
  status      BookingStatus @default(pending)

  // Time
  startTime DateTime
  endTime   DateTime
  timezone  String   @default("America/New_York")

  // Client info (for non-registered clients)
  clientName  String?
  clientEmail String?
  clientPhone String?

  // Location (legacy field kept for backwards compatibility)
  location      String?
  locationNotes String?
  isVirtual     Boolean @default(false)
  meetingUrl    String?

  // Travel calculations (cached from Distance Matrix API)
  distanceMiles     Float?
  travelTimeMinutes Int?
  travelFeeCents    Int?   @default(0)

  // Buffer time (per-booking override, null = use type defaults)
  bufferBeforeMinutes Int? // Prep time before booking
  bufferAfterMinutes  Int? // Travel/wrap-up time after booking

  // Weather data (cached for performance)
  weatherCache    Json?
  weatherCachedAt DateTime?

  // Notes
  notes         String?
  internalNotes String?

  // Multi-day event fields (for weddings, conferences, etc.)
  isMultiDay       Boolean @default(false)
  multiDayName     String? // Overall event name like "Smith Wedding Weekend"
  multiDayParentId String? // For sessions within a multi-day event

  // Recurring booking fields
  isRecurring          Boolean            @default(false)
  recurrencePattern    RecurrencePattern?
  recurrenceInterval   Int?               @default(1) // e.g., every 2 weeks
  recurrenceEndDate    DateTime? // Optional end date for the series
  recurrenceCount      Int? // Optional max occurrences
  recurrenceDaysOfWeek Int[]              @default([]) // For weekly: 0=Sun, 1=Mon, etc.
  seriesId             String? // Groups all bookings in a series
  parentBookingId      String? // Reference to the original booking

  // Industry categorization (for multi-industry orgs)
  industry Industry?

  // Completion tracking
  completedAt DateTime? // When booking status changed to "completed"

  // Follow-up tracking
  followupsSent String[] @default([]) // Tracks which follow-up emails were sent (e.g., "thank_you_1", "review_request_3")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization       Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client             Client?                 @relation(fields: [clientId], references: [id], onDelete: SetNull)
  bookingType        BookingType?            @relation(fields: [bookingTypeId], references: [id], onDelete: SetNull)
  service            Service?                @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  locationRef        Location?               @relation(fields: [locationId], references: [id], onDelete: SetNull)
  assignedUser       User?                   @relation("AssignedBookings", fields: [assignedUserId], references: [id], onDelete: SetNull)
  reminders          BookingReminder[]
  invoiceLineItems   InvoiceLineItem[]
  tasks              Task[]
  equipmentChecklist BookingEquipmentCheck[]

  // Phase 1: Ordering System relations
  orderId String? @unique
  order   Order?  @relation("OrderBooking", fields: [orderId], references: [id], onDelete: SetNull)

  // Public booking form submission (source of this booking)
  formSubmission BookingFormSubmission?

  // Recurring booking self-reference
  parentBooking Booking?  @relation("RecurringBookings", fields: [parentBookingId], references: [id], onDelete: SetNull)
  childBookings Booking[] @relation("RecurringBookings")

  // Multi-day event self-reference (parent event and sessions)
  multiDayParent   Booking?  @relation("MultiDaySessions", fields: [multiDayParentId], references: [id], onDelete: SetNull)
  multiDaySessions Booking[] @relation("MultiDaySessions")

  // Second shooter / crew assignments
  crew BookingCrew[]

  // Phase 4: Referral Program back-reference
  referrals Referral[] @relation("ReferralBooking")

  // Phase 2: Client Questionnaire System
  questionnaires ClientQuestionnaire[]

  // Phase 3: SMS Integration
  smsLogs SMSLog[]

  // Waitlist conversion (booking created from waitlist)
  convertedFromWaitlist BookingWaitlist? @relation("WaitlistConversion")

  @@index([organizationId])
  @@index([multiDayParentId])
  @@index([clientId])
  @@index([serviceId])
  @@index([locationId])
  @@index([assignedUserId])
  @@index([startTime])
  @@index([status])
  @@index([seriesId])
  @@index([parentBookingId])
  @@index([industry])
}

// ============================================================================
// BOOKING WAITLIST
// ============================================================================

model BookingWaitlist {
  id             String @id @default(cuid())
  organizationId String

  // Client info (can be existing client or new inquiry)
  clientId    String?
  clientName  String
  clientEmail String
  clientPhone String?

  // Desired booking details
  serviceId     String?
  preferredDate DateTime // Preferred date/time
  alternateDate DateTime? // Alternate date if available
  flexibleDates Boolean   @default(false) // Willing to take any available slot
  notes         String? // Special requests

  // Waitlist status
  status             WaitlistStatus @default(pending)
  priority           Int            @default(0) // Higher = more priority
  position           Int? // Position in queue (calculated)
  notifiedAt         DateTime? // When client was notified of availability
  expiresAt          DateTime? // When the offer expires
  convertedBookingId String?        @unique // If converted to booking

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client           Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)
  service          Service?     @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  convertedBooking Booking?     @relation("WaitlistConversion", fields: [convertedBookingId], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@index([clientId])
  @@index([serviceId])
  @@index([status])
  @@index([preferredDate])
  @@index([priority])
}

enum WaitlistStatus {
  pending // Waiting for availability
  notified // Client notified of availability
  accepted // Client accepted and booking created
  declined // Client declined the offer
  expired // Offer expired without response
  cancelled // Client cancelled from waitlist
}

// ============================================================================
// BOOKING CREW (Second Shooters, Assistants)
// ============================================================================

enum BookingCrewRole {
  lead_photographer
  second_shooter
  assistant
  videographer
  stylist
  makeup_artist
  other
}

model BookingCrew {
  id        String @id @default(cuid())
  bookingId String
  userId    String

  // Role and details
  role       BookingCrewRole @default(second_shooter)
  notes      String? // Special instructions for this team member
  hourlyRate Int? // Rate in cents (override user default)
  confirmed  Boolean         @default(false) // Has the crew member confirmed availability

  // Status tracking
  confirmedAt DateTime?
  declinedAt  DateTime?
  declineNote String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  user    User    @relation("BookingCrewAssignments", fields: [userId], references: [id], onDelete: Cascade)

  @@unique([bookingId, userId])
  @@index([bookingId])
  @@index([userId])
  @@index([confirmed])
}

enum ReminderType {
  hours_24
  hours_1
  custom
}

enum ReminderChannel {
  email
  sms
}

enum ReminderRecipient {
  client
  photographer
  both
}

model BookingReminder {
  id        String    @id @default(cuid())
  bookingId String
  sendAt    DateTime
  sent      Boolean   @default(false)
  sentAt    DateTime?

  // Reminder configuration
  type          ReminderType      @default(hours_24)
  channel       ReminderChannel   @default(email)
  recipient     ReminderRecipient @default(client)
  minutesBefore Int               @default(1440) // 24 hours = 1440 minutes

  // Delivery tracking
  errorMessage String?

  createdAt DateTime @default(now())

  // Relations
  booking Booking @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([bookingId])
  @@index([sendAt])
  @@index([sent, sendAt]) // For finding unsent reminders due to be sent
}

// ============================================================================
// INVOICES
// ============================================================================

model Invoice {
  id             String  @id @default(cuid())
  organizationId String
  clientId       String?
  invoiceNumber  String

  // Status
  status InvoiceStatus @default(draft)

  // Amounts
  subtotalCents   Int    @default(0)
  taxCents        Int    @default(0)
  discountCents   Int    @default(0)
  totalCents      Int    @default(0)
  paidAmountCents Int    @default(0) // Tracks partial payments
  currency        String @default("USD")

  // Late Fees
  lateFeeEnabled      Boolean   @default(false)
  lateFeeType         String?   @default("percentage") // "percentage" or "fixed"
  lateFeePercent      Float?    @default(5) // e.g., 5 = 5%
  lateFeeFlatCents    Int? // Flat fee in cents
  lateFeeAppliedCents Int       @default(0) // Total late fees applied
  lastLateFeeAt       DateTime? // When late fee was last applied

  // Dates
  issueDate DateTime  @default(now())
  dueDate   DateTime
  paidAt    DateTime?

  // Client info
  clientName    String?
  clientEmail   String?
  clientAddress String?

  // Notes
  notes String?
  terms String?

  // Payment link
  stripePaymentLinkId String?
  paymentLinkUrl      String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client       Client?           @relation(fields: [clientId], references: [id], onDelete: SetNull)
  lineItems    InvoiceLineItem[]
  payments     Payment[]
  tasks        Task[]

  // Phase 1: Ordering System relations
  orderId String? @unique
  order   Order?  @relation("OrderInvoice", fields: [orderId], references: [id], onDelete: SetNull)

  // Phase 4: Referral Program back-reference
  referrals Referral[] @relation("ReferralInvoice")

  // Payment Reminders
  remindersSent  Int       @default(0)
  lastReminderAt DateTime?
  nextReminderAt DateTime?
  autoReminders  Boolean   @default(true) // Enable/disable auto reminders

  // Invoice Scheduling
  scheduledSendAt DateTime? // When to automatically send the invoice
  scheduledSentAt DateTime? // When the scheduled send was processed

  // Credit Notes
  creditNotesOriginal CreditNote[] @relation("CreditNoteOriginalInvoice") // Credit notes issued for this invoice
  creditNotesApplied  CreditNote[] @relation("CreditNoteAppliedInvoice") // Credit notes applied to this invoice

  // Deposit/Balance Invoice Split
  isDeposit       Boolean   @default(false) // Is this a deposit invoice?
  isBalance       Boolean   @default(false) // Is this a balance invoice?
  depositPercent  Float? // Deposit percentage (e.g., 50 for 50%)
  parentInvoiceId String? // Link to the original invoice (for deposit/balance invoices)
  parentInvoice   Invoice?  @relation("InvoiceDepositBalance", fields: [parentInvoiceId], references: [id], onDelete: SetNull)
  childInvoices   Invoice[] @relation("InvoiceDepositBalance") // Deposit and balance invoices

  // Attachments
  attachments InvoiceAttachment[]

  // Created from Estimate
  estimateSource       Estimate?             @relation("EstimateToInvoice")
  galleryAddonRequests GalleryAddonRequest[]

  @@unique([organizationId, invoiceNumber])
  @@index([organizationId])
  @@index([clientId])
  @@index([status])
  @@index([dueDate])
}

model InvoiceLineItem {
  id          String       @id @default(cuid())
  invoiceId   String
  bookingId   String? // Link to booking for travel fees
  itemType    LineItemType @default(service)
  description String
  quantity    Int          @default(1)
  unitCents   Int
  totalCents  Int
  sortOrder   Int          @default(0)

  createdAt DateTime @default(now())

  // Relations
  invoice Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  booking Booking? @relation(fields: [bookingId], references: [id], onDelete: SetNull)

  @@index([invoiceId])
  @@index([bookingId])
  @@index([itemType])
}

// Credit Note - for refunds, credits, and invoice adjustments
model CreditNote {
  id             String  @id @default(cuid())
  organizationId String
  clientId       String?
  invoiceId      String? // Optional link to original invoice

  // Credit note number
  creditNoteNumber String

  // Status
  status CreditNoteStatus @default(draft)

  // Amounts
  amountCents Int    @default(0)
  currency    String @default("USD")

  // Client info (cached from invoice or client)
  clientName  String?
  clientEmail String?

  // Details
  reason      String? // Reason for the credit note
  description String? // Detailed description
  notes       String? // Internal notes

  // Application
  appliedToInvoiceId  String? // If applied to a different invoice
  appliedAmountCents  Int       @default(0) // Amount applied from this credit note
  appliedAt           DateTime?
  refundedAmountCents Int       @default(0) // Amount refunded to client
  refundedAt          DateTime?

  // Dates
  issueDate DateTime @default(now())

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization     Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client           Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)
  invoice          Invoice?     @relation("CreditNoteOriginalInvoice", fields: [invoiceId], references: [id], onDelete: SetNull)
  appliedToInvoice Invoice?     @relation("CreditNoteAppliedInvoice", fields: [appliedToInvoiceId], references: [id], onDelete: SetNull)

  @@unique([organizationId, creditNoteNumber])
  @@index([organizationId])
  @@index([clientId])
  @@index([invoiceId])
  @@index([status])
}

enum CreditNoteStatus {
  draft
  issued // Sent to client
  applied // Applied to an invoice
  refunded // Refunded to client
  voided // Cancelled/voided
}

// Invoice Template - reusable preset line items for quick invoice creation
model InvoiceTemplate {
  id             String @id @default(cuid())
  organizationId String

  name        String // Template name (e.g., "Wedding Package", "Headshot Session")
  description String? // Optional description
  category    String? // Category for organization (e.g., "Weddings", "Portraits")

  // Default values
  defaultDueDays Int     @default(30) // Days until due
  defaultNotes   String? // Default invoice notes
  defaultTerms   String? // Default terms and conditions
  taxRate        Float? // Default tax rate override

  // Line items stored as JSON
  lineItems Json // Array of { itemType, description, quantity, unitCents }

  // Calculated totals (for display purposes)
  subtotalCents Int @default(0)
  taxCents      Int @default(0)
  totalCents    Int @default(0)

  // Settings
  isActive   Boolean @default(true)
  isDefault  Boolean @default(false) // Default template for new invoices
  usageCount Int     @default(0) // Track how often this template is used

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([category])
  @@index([isActive])
}

// Estimate/Quote - proposals that can be converted to invoices
model Estimate {
  id             String  @id @default(cuid())
  organizationId String
  clientId       String?

  // Estimate number
  estimateNumber String

  // Status
  status EstimateStatus @default(draft)

  // Amounts
  subtotalCents Int    @default(0)
  taxCents      Int    @default(0)
  discountCents Int    @default(0)
  totalCents    Int    @default(0)
  currency      String @default("USD")

  // Client info (cached)
  clientName    String?
  clientEmail   String?
  clientAddress String?

  // Details
  title       String? // Project/service title
  description String? // Detailed description
  notes       String?
  terms       String?

  // Validity
  issueDate  DateTime @default(now())
  validUntil DateTime // When the estimate expires

  // Conversion tracking
  convertedToInvoiceId String?   @unique
  convertedAt          DateTime?

  // Client actions
  viewedAt        DateTime?
  approvedAt      DateTime?
  rejectedAt      DateTime?
  rejectionReason String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization       Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client             Client?            @relation(fields: [clientId], references: [id], onDelete: SetNull)
  convertedToInvoice Invoice?           @relation("EstimateToInvoice", fields: [convertedToInvoiceId], references: [id], onDelete: SetNull)
  lineItems          EstimateLineItem[]

  @@unique([organizationId, estimateNumber])
  @@index([organizationId])
  @@index([clientId])
  @@index([status])
}

model EstimateLineItem {
  id          String       @id @default(cuid())
  estimateId  String
  itemType    LineItemType @default(service)
  description String
  quantity    Int          @default(1)
  unitCents   Int
  totalCents  Int
  sortOrder   Int          @default(0)

  createdAt DateTime @default(now())

  estimate Estimate @relation(fields: [estimateId], references: [id], onDelete: Cascade)

  @@index([estimateId])
}

enum EstimateStatus {
  draft
  sent // Sent to client
  viewed // Client has viewed
  approved // Client approved
  rejected // Client rejected
  expired // Past validUntil date
  converted // Converted to invoice
}

// Invoice Attachment - files attached to invoices
model InvoiceAttachment {
  id        String @id @default(cuid())
  invoiceId String

  fileName    String
  fileUrl     String
  fileType    String // MIME type
  fileSizeMb  Float   @default(0)
  description String?

  createdAt DateTime @default(now())

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
}

// Client Retainer - prepaid balance for services
model ClientRetainer {
  id             String @id @default(cuid())
  organizationId String
  clientId       String @unique // One-to-one with Client

  // Balance
  balanceCents        Int    @default(0) // Current available balance
  totalDepositedCents Int    @default(0) // Lifetime deposits
  totalUsedCents      Int    @default(0) // Lifetime usage
  currency            String @default("USD")

  // Settings
  isActive                 Boolean @default(true)
  lowBalanceThresholdCents Int? // Alert when balance falls below this

  // Notes
  notes String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization          @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client       Client                @relation(fields: [clientId], references: [id], onDelete: Cascade)
  transactions RetainerTransaction[]

  @@unique([organizationId, clientId]) // One retainer per client
  @@index([organizationId])
  @@index([clientId])
}

model RetainerTransaction {
  id         String @id @default(cuid())
  retainerId String

  type        RetainerTransactionType
  amountCents Int
  description String?

  // References
  invoiceId String? // If applied to an invoice
  paymentId String? // If from a payment

  balanceAfterCents Int // Balance after this transaction

  createdAt DateTime @default(now())

  retainer ClientRetainer @relation(fields: [retainerId], references: [id], onDelete: Cascade)

  @@index([retainerId])
  @@index([invoiceId])
}

enum RetainerTransactionType {
  deposit // Client added funds
  usage // Applied to invoice
  refund // Refunded to client
  adjustment // Manual adjustment
}

// Recurring Invoice Template - for subscription/retainer billing
model RecurringInvoice {
  id             String @id @default(cuid())
  organizationId String
  clientId       String

  // Schedule
  frequency   RecurringFrequency @default(monthly)
  dayOfMonth  Int?               @default(1) // 1-28 for monthly
  dayOfWeek   Int? // 0-6 for weekly (0 = Sunday)
  anchorDate  DateTime // Start date for the recurring schedule
  nextRunDate DateTime // Next scheduled invoice creation

  // Status
  isActive   Boolean   @default(true)
  isPaused   Boolean   @default(false)
  pausedAt   DateTime?
  pauseUntil DateTime? // Resume date if paused temporarily

  // Invoice template
  subtotalCents Int     @default(0)
  taxCents      Int     @default(0)
  totalCents    Int     @default(0)
  currency      String  @default("USD")
  notes         String?
  terms         String?
  dueDays       Int     @default(30) // Days after creation until due

  // Line items stored as JSON (template for each invoice)
  lineItems Json // Array of { itemType, description, quantity, unitCents }

  // Tracking
  invoicesCreated Int       @default(0)
  lastInvoiceAt   DateTime?
  lastInvoiceId   String? // Reference to last created invoice

  // End conditions (optional)
  endDate     DateTime? // Stop after this date
  maxInvoices Int? // Stop after this many invoices

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client       Client       @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([clientId])
  @@index([isActive])
  @@index([nextRunDate])
}

enum RecurringFrequency {
  weekly
  biweekly
  monthly
  quarterly
  yearly
}

// ============================================================================
// CONTRACTS
// ============================================================================

model ContractTemplate {
  id             String  @id @default(cuid())
  organizationId String
  name           String
  description    String?
  content        String  @db.Text
  isDefault      Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  contracts    Contract[]

  @@index([organizationId])
}

model Contract {
  id             String  @id @default(cuid())
  organizationId String
  clientId       String?
  templateId     String?

  // Details
  name    String
  content String         @db.Text
  status  ContractStatus @default(draft)

  // Metadata
  pdfUrl String?

  // Dates
  sentAt    DateTime?
  signedAt  DateTime?
  expiresAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client       Client?             @relation(fields: [clientId], references: [id], onDelete: SetNull)
  template     ContractTemplate?   @relation(fields: [templateId], references: [id], onDelete: SetNull)
  signers      ContractSigner[]
  auditLogs    ContractAuditLog[]
  signatures   ContractSignature[]

  @@index([organizationId])
  @@index([clientId])
  @@index([status])
}

model ContractSigner {
  id         String  @id @default(cuid())
  contractId String
  email      String
  name       String?

  // Signing
  signatureUrl    String?
  signedAt        DateTime?
  signedIp        String?
  signedUserAgent String?

  // Token for signing
  signingToken   String    @unique
  tokenExpiresAt DateTime?

  sortOrder Int @default(0)

  createdAt DateTime @default(now())

  // Relations
  contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)

  @@index([contractId])
  @@index([signingToken])
}

model ContractAuditLog {
  id         String  @id @default(cuid())
  contractId String
  action     String
  actorEmail String?
  actorIp    String?
  metadata   Json?

  createdAt DateTime @default(now())

  // Relations
  contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)

  @@index([contractId])
  @@index([createdAt])
}

// ============================================================================
// ACTIVITY & NOTIFICATIONS
// ============================================================================

model ActivityLog {
  id             String       @id @default(cuid())
  organizationId String
  userId         String?
  type           ActivityType
  description    String
  metadata       Json?

  // Related entities
  projectId  String?
  clientId   String?
  paymentId  String?
  bookingId  String?
  invoiceId  String?
  contractId String?

  createdAt DateTime @default(now())

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User?        @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@index([userId])
  @@index([type])
  @@index([createdAt])
}

model Notification {
  id             String           @id @default(cuid())
  organizationId String
  type           NotificationType
  title          String
  message        String
  linkUrl        String?
  read           Boolean          @default(false)
  readAt         DateTime?

  createdAt DateTime @default(now())

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([read])
  @@index([createdAt])
}

// Client Portal Notifications (for clients in their portal)
model ClientNotification {
  id       String                 @id @default(cuid())
  clientId String
  type     ClientNotificationType
  title    String
  message  String
  linkUrl  String?
  read     Boolean                @default(false)
  readAt   DateTime?

  createdAt DateTime @default(now())

  // Relations
  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@index([read])
  @@index([createdAt])
}

enum ClientNotificationType {
  gallery_ready // Gallery is ready for viewing
  gallery_expiring // Gallery is about to expire
  invoice_sent // New invoice received
  invoice_reminder // Payment reminder
  payment_confirmed // Payment was successful
  contract_ready // Contract needs signature
  contract_signed // Contract was signed successfully
  booking_confirmed // Booking was confirmed
  booking_reminder // Upcoming booking reminder
  questionnaire_ready // Questionnaire needs completion
  message_received // New message from photographer
  photos_downloaded // Download receipt
  favorites_saved // Favorites were saved
  system // System notification
}

// ============================================================================
// USAGE & METERING
// ============================================================================

model UsageMeter {
  id             String @id @default(cuid())
  organizationId String
  month          String // "2025-01" format

  // Usage counts
  storageBytes     BigInt @default(0)
  galleriesCreated Int    @default(0)
  emailsSent       Int    @default(0)
  apiCalls         Int    @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, month])
  @@index([organizationId])
  @@index([month])
}

model OnboardingProgress {
  id             String @id @default(cuid())
  organizationId String @unique

  // Legacy steps (kept for backwards compatibility)
  profileComplete     Boolean @default(false)
  brandingComplete    Boolean @default(false)
  firstGalleryCreated Boolean @default(false)
  stripeConnected     Boolean @default(false)

  // New Onboarding Wizard Steps
  welcomeViewed    Boolean @default(false) // Step 0
  personalComplete Boolean @default(false) // Step 1: First/last name
  businessComplete Boolean @default(false) // Step 2: Company, type, size
  brandingStepDone Boolean @default(false) // Step 3: Display mode, public info
  industriesSet    Boolean @default(false) // Step 4: Industry selection
  featuresSelected Boolean @default(false) // Step 5: Module selection
  goalsSet         Boolean @default(false) // Step 6: Business goals
  paymentStepDone  Boolean @default(false) // Step 7: Payment/trial setup
  tourStarted      Boolean @default(false) // Step 8: Guided tour

  // Wizard state
  currentStep  Int      @default(0)
  skippedSteps String[] @default([]) // Steps user skipped

  // Goals selected during onboarding
  selectedGoals String[] @default([])

  completedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}

// ============================================================================
// LOCATIONS & PROPERTY DETAILS
// ============================================================================

model Location {
  id             String @id @default(cuid())
  organizationId String

  // Google Places data
  placeId          String? // Google Place ID for caching
  formattedAddress String
  streetAddress    String?
  city             String?
  state            String?
  postalCode       String?
  country          String  @default("US")

  // Coordinates
  latitude  Float
  longitude Float

  // Metadata
  notes String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization    Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  orgHomeBase     Organization[]   @relation("OrgHomeBase")
  userHomeBase    User[]           @relation("UserHomeBase")
  bookings        Booking[]
  projects        Project[]
  propertyDetails PropertyDetails?

  // Phase 1: Ordering System relations
  orders Order[]

  @@index([organizationId])
  @@index([placeId])
}

model PropertyDetails {
  id         String @id @default(cuid())
  locationId String @unique

  // Property data
  propertyType PropertyType?
  bedrooms     Int?
  bathrooms    Float? // 2.5 baths, etc.
  squareFeet   Int?
  lotSize      Int? // in sqft
  yearBuilt    Int?
  listingPrice Int? // in cents

  // MLS data
  mlsNumber         String?
  listingAgent      String?
  listingAgentPhone String?

  // Metadata
  dataSource String? // "attom", "zillow", "manual"
  fetchedAt  DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  location Location @relation(fields: [locationId], references: [id], onDelete: Cascade)

  @@index([mlsNumber])
}

// ============================================================================
// EQUIPMENT & TEAM CAPABILITIES
// ============================================================================

model Equipment {
  id             String            @id @default(cuid())
  organizationId String
  name           String
  category       EquipmentCategory
  description    String?
  serialNumber   String?
  purchaseDate   DateTime?
  valueCents     Int? // Equipment value in cents

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization            Organization                      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  userAssignments         UserEquipment[]
  serviceRequirements     ServiceEquipmentRequirement[]
  bookingTypeRequirements BookingTypeEquipmentRequirement[]
  bookingChecks           BookingEquipmentCheck[]

  @@index([organizationId])
  @@index([category])
}

model UserEquipment {
  id          String   @id @default(cuid())
  userId      String
  equipmentId String
  assignedAt  DateTime @default(now())
  notes       String?

  // Relations
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  equipment Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)

  @@unique([userId, equipmentId])
  @@index([userId])
  @@index([equipmentId])
}

model UserServiceCapability {
  id        String          @id @default(cuid())
  userId    String
  serviceId String
  level     CapabilityLevel @default(capable)
  notes     String?

  createdAt DateTime @default(now())

  // Relations
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  service Service @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([userId, serviceId])
  @@index([userId])
  @@index([serviceId])
  @@index([level])
}

model ServiceEquipmentRequirement {
  id          String  @id @default(cuid())
  serviceId   String
  equipmentId String
  isRequired  Boolean @default(true) // vs. recommended

  // Relations
  service   Service   @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  equipment Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)

  @@unique([serviceId, equipmentId])
  @@index([serviceId])
  @@index([equipmentId])
}

// Equipment requirements per booking type (checklist defaults)
model BookingTypeEquipmentRequirement {
  id            String  @id @default(cuid())
  bookingTypeId String
  equipmentId   String
  isRequired    Boolean @default(true) // Required vs recommended
  quantity      Int     @default(1) // How many of this item needed
  notes         String? // Special instructions for this equipment

  // Relations
  bookingType BookingType @relation(fields: [bookingTypeId], references: [id], onDelete: Cascade)
  equipment   Equipment   @relation(fields: [equipmentId], references: [id], onDelete: Cascade)

  @@unique([bookingTypeId, equipmentId])
  @@index([bookingTypeId])
  @@index([equipmentId])
}

// Equipment checklist for a specific booking (actual check-offs)
model BookingEquipmentCheck {
  id          String    @id @default(cuid())
  bookingId   String
  equipmentId String
  isChecked   Boolean   @default(false) // Has the item been checked/packed?
  checkedAt   DateTime? // When it was checked
  checkedById String? // Who checked it
  notes       String? // Any notes about this item for this booking

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  booking   Booking   @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  equipment Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)
  checkedBy User?     @relation("EquipmentChecker", fields: [checkedById], references: [id], onDelete: SetNull)

  @@unique([bookingId, equipmentId])
  @@index([bookingId])
  @@index([equipmentId])
}

// ============================================================================
// PROPERTY WEBSITES (Phase 2)
// ============================================================================

model PropertyWebsite {
  id        String @id @default(cuid())
  projectId String @unique

  // Property Info
  address      String
  city         String
  state        String
  zipCode      String
  price        Int? // in cents
  beds         Int?
  baths        Float?
  sqft         Int?
  lotSize      String?
  yearBuilt    Int?
  propertyType PropertyType?

  // Content
  headline       String?
  description    String?  @db.Text
  features       String[] // Array of feature highlights
  virtualTourUrl String? // Matterport, iGuide, etc.
  videoUrl       String?

  // Settings
  template     PropertyWebsiteTemplate @default(modern)
  isPublished  Boolean                 @default(false)
  isBranded    Boolean                 @default(true) // Show photographer branding
  showPrice    Boolean                 @default(true)
  showAgent    Boolean                 @default(true)
  customDomain String?                 @unique

  // Template Customization
  accentColor String? // Custom accent color override (hex, e.g., "#3b82f6")

  // Open House Scheduling
  openHouseDate    DateTime? // Open house start date/time
  openHouseEndDate DateTime? // Open house end date/time (optional, defaults to +2 hours)

  // SEO
  slug            String  @unique
  metaTitle       String?
  metaDescription String?

  // Analytics (denormalized for quick access)
  viewCount Int @default(0)

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?

  // Relations
  project         Project             @relation(fields: [projectId], references: [id], onDelete: Cascade)
  analytics       PropertyAnalytics[]
  marketingAssets MarketingAsset[]
  leads           PropertyLead[]
  tasks           Task[]

  @@index([slug])
  @@index([isPublished])
}

model PropertyAnalytics {
  id                String   @id @default(cuid())
  propertyWebsiteId String
  date              DateTime @default(now()) @db.Date

  // Traffic
  pageViews      Int  @default(0)
  uniqueVisitors Int  @default(0)
  avgTimeOnPage  Int? // seconds

  // Engagement
  tourClicks   Int @default(0)
  photoViews   Int @default(0)
  socialShares Int @default(0)

  // Traffic sources
  directTraffic Int @default(0)
  socialTraffic Int @default(0)
  emailTraffic  Int @default(0)
  searchTraffic Int @default(0)

  // Device breakdown
  mobileViews  Int @default(0)
  desktopViews Int @default(0)
  tabletViews  Int @default(0)

  // Relations
  propertyWebsite PropertyWebsite @relation(fields: [propertyWebsiteId], references: [id], onDelete: Cascade)

  @@unique([propertyWebsiteId, date])
  @@index([propertyWebsiteId])
  @@index([date])
}

model PropertyLead {
  id                String @id @default(cuid())
  propertyWebsiteId String

  // Lead info
  name    String
  email   String
  phone   String?
  message String? @db.Text
  source  String? // website, social, email, etc.

  // Status
  status LeadStatus @default(new)

  // Lead Scoring
  score          Int    @default(0) // 0-100 score
  scoreBreakdown Json? // { "pageViews": 10, "timeOnSite": 15, "photoViews": 20, ... }
  temperature    String @default("cold") // "hot", "warm", "cold"

  // Engagement tracking
  pageViews        Int       @default(0)
  photoViews       Int       @default(0)
  tourClicks       Int       @default(0)
  totalTimeSeconds Int       @default(0)
  lastActivityAt   DateTime?

  // Contact history
  contactedAt  DateTime?
  followUpDate DateTime?
  notes        String?   @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  propertyWebsite PropertyWebsite @relation(fields: [propertyWebsiteId], references: [id], onDelete: Cascade)

  @@index([propertyWebsiteId])
  @@index([status])
  @@index([score])
  @@index([temperature])
  @@index([createdAt])
}

model MarketingAsset {
  id                String @id @default(cuid())
  propertyWebsiteId String

  // Asset info
  type         MarketingAssetType
  name         String
  fileUrl      String
  thumbnailUrl String?

  // Generation metadata
  templateUsed String?
  settings     Json? // Custom settings used to generate

  createdAt DateTime @default(now())

  // Relations
  propertyWebsite PropertyWebsite @relation(fields: [propertyWebsiteId], references: [id], onDelete: Cascade)

  @@index([propertyWebsiteId])
  @@index([type])
}

// ============================================================================
// PORTFOLIO WEBSITES
// ============================================================================

model PortfolioWebsite {
  id             String @id @default(cuid())
  organizationId String

  name        String
  slug        String  @unique
  description String? @db.Text

  // Hero content (kept for backwards compatibility)
  heroTitle    String?
  heroSubtitle String? @db.Text

  // Portfolio Type & Template
  portfolioType PortfolioType     @default(photographer)
  template      PortfolioTemplate @default(modern)

  // Typography
  fontHeading String?
  fontBody    String?

  // Branding
  logoUrl      String?
  primaryColor String? @default("#3b82f6")
  accentColor  String? @default("#8b5cf6")

  // Social Links (JSON array: [{ platform: string, url: string }])
  socialLinks Json?

  // SEO
  metaTitle       String?
  metaDescription String? @db.Text
  faviconUrl      String?

  // Settings
  isPublished  Boolean @default(false)
  showBranding Boolean @default(true)

  // Custom Domain
  customDomain                  String?   @unique
  customDomainVerified          Boolean   @default(false)
  customDomainVerificationToken String? // DNS TXT record value for verification
  customDomainVerifiedAt        DateTime?
  customDomainSslStatus         String? // pending, active, error

  // Password Protection
  isPasswordProtected Boolean @default(false)
  password            String? // Hashed password

  // Lead Capture Gate
  requireLeadCapture Boolean @default(false)
  leadCaptureMessage String? @db.Text // Custom message shown on gate
  leadCaptureFields  Json? // Array of field configs: [{ name, label, type, required }]

  // Expiration
  expiresAt DateTime?

  // Scheduled Publishing
  scheduledPublishAt DateTime? // Auto-publish at this date/time

  // Download Settings
  allowDownloads    Boolean @default(false)
  downloadWatermark Boolean @default(true) // Apply watermark to downloads

  // Custom CSS
  customCss String? @db.Text

  // Scroll Animations
  enableAnimations Boolean @default(true)

  // Comments
  allowComments       Boolean @default(false)
  requireCommentEmail Boolean @default(true) // Require email to leave comment

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?

  // Relations
  organization Organization              @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  projects     PortfolioWebsiteProject[]
  sections     PortfolioWebsiteSection[]
  views        PortfolioWebsiteView[]
  inquiries    PortfolioInquiry[]
  leads        PortfolioLead[]
  comments     PortfolioComment[]
  abTests      PortfolioABTest[]
  customForms  CustomForm[]

  @@index([organizationId])
  @@index([slug])
  @@index([isPublished])
  @@index([portfolioType])
  @@index([expiresAt])
}

// Portfolio website contact form submissions
model PortfolioInquiry {
  id                 String @id @default(cuid())
  portfolioWebsiteId String
  organizationId     String

  // Inquiry details
  name    String
  email   String
  phone   String?
  message String  @db.Text

  // Status tracking
  status LeadStatus @default(new)
  notes  String?    @db.Text

  // Metadata
  source    String? // where they came from
  userAgent String?
  ipAddress String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)
  organization     Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([portfolioWebsiteId])
  @@index([organizationId])
  @@index([status])
  @@index([createdAt])
}

// Website Chat Inquiries (from marketing site chat widget)
model WebsiteChatInquiry {
  id String @id @default(cuid())

  // Contact info (optional for anonymous)
  name  String?
  email String?
  phone String?

  // Message content
  message  String  @db.Text
  category String? // "pricing", "features", "trial", "other"

  // Status tracking
  status LeadStatus @default(new)
  notes  String?    @db.Text

  // Metadata
  source    String? // "marketing_website", "portfolio", etc.
  pageUrl   String? // URL where chat was initiated
  userAgent String?
  ipAddress String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([createdAt])
  @@index([email])
}

model PortfolioWebsiteProject {
  id                 String @id @default(cuid())
  portfolioWebsiteId String
  projectId          String
  position           Int    @default(0)

  // Relations
  portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)
  project          Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([portfolioWebsiteId, projectId])
  @@index([portfolioWebsiteId])
  @@index([projectId])
}

model PortfolioWebsiteSection {
  id                 String @id @default(cuid())
  portfolioWebsiteId String

  // Section Configuration
  sectionType PortfolioSectionType
  position    Int                  @default(0)
  isVisible   Boolean              @default(true)

  // Section Content (JSON - varies by sectionType)
  // Hero: { title, subtitle, backgroundImageUrl, backgroundVideoUrl, ctaText, ctaLink, overlay, alignment }
  // About: { photoUrl, title, content, highlights[] }
  // Gallery: { projectIds[], layout, columns, showProjectNames }
  // Services: { items[{name, description, price, icon}], showPricing }
  // Testimonials: { items[{quote, clientName, clientTitle, photoUrl}], layout }
  // Awards: { items[{title, issuer, year, logoUrl}] }
  // Contact: { showForm, showMap, showSocial, customFields[] }
  // FAQ: { items[{question, answer}] }
  // Text: { content, alignment }
  // Image: { url, alt, caption, layout }
  // Video: { url, autoplay, loop, muted }
  // Spacer: { height }
  // CustomHTML: { html }
  config Json

  // Optional title override for section
  customTitle String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)

  @@index([portfolioWebsiteId])
  @@index([position])
}

model PortfolioWebsiteView {
  id                 String @id @default(cuid())
  portfolioWebsiteId String

  // Visitor Info
  visitorId String? // Anonymous visitor ID (cookie-based)
  ipAddress String?
  userAgent String?
  referrer  String?
  country   String?
  city      String?

  // Page Info
  pagePath  String? // Which section/page was viewed
  sessionId String? // Group views into sessions

  // Engagement
  duration    Int? // Time spent in seconds
  scrollDepth Int? // Max scroll depth percentage

  createdAt DateTime @default(now())

  // Relations
  portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)

  @@index([portfolioWebsiteId])
  @@index([createdAt])
  @@index([visitorId])
  @@index([sessionId])
}

model PortfolioLead {
  id                 String @id @default(cuid())
  portfolioWebsiteId String
  organizationId     String

  // Lead Info
  email     String
  name      String?
  phone     String?
  company   String?
  message   String? @db.Text
  extraData Json? // Additional custom field data

  // Source tracking
  visitorId String?
  referrer  String?
  country   String?
  city      String?

  createdAt DateTime @default(now())

  // Relations
  portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)
  organization     Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([portfolioWebsiteId])
  @@index([organizationId])
  @@index([email])
  @@index([createdAt])
}

model PortfolioComment {
  id                 String @id @default(cuid())
  portfolioWebsiteId String
  organizationId     String

  // Comment Content
  content   String  @db.Text
  sectionId String? // Optional: which section the comment is on
  projectId String? // Optional: which project/image the comment is on

  // Commenter Info (anonymous)
  authorName  String?
  authorEmail String?

  // Moderation
  isApproved Boolean @default(false)
  isHidden   Boolean @default(false)

  createdAt DateTime @default(now())

  // Relations
  portfolioWebsite PortfolioWebsite @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)
  organization     Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([portfolioWebsiteId])
  @@index([organizationId])
  @@index([isApproved])
  @@index([createdAt])
}

// ============================================================================
// PORTFOLIO A/B TESTING
// ============================================================================

model PortfolioABTest {
  id                 String @id @default(cuid())
  portfolioWebsiteId String
  organizationId     String

  // Test Configuration
  name        String
  description String?               @db.Text
  status      PortfolioABTestStatus @default(draft)

  // Traffic Split (percentages, must add up to 100)
  controlTrafficPercent Int @default(50)
  variantTrafficPercent Int @default(50)

  // Variant Settings (what's different in the variant)
  variantHeroTitle    String?            @db.Text
  variantHeroSubtitle String?            @db.Text
  variantPrimaryColor String?
  variantTemplate     PortfolioTemplate?

  // Goals
  goalType        ABTestGoalType @default(views)
  targetMetric    Int? // Target number to reach
  confidenceLevel Float          @default(0.95) // Statistical confidence required

  // Timing
  startDate DateTime?
  endDate   DateTime?

  // Results (cached for performance)
  controlViews       Int     @default(0)
  controlConversions Int     @default(0)
  variantViews       Int     @default(0)
  variantConversions Int     @default(0)
  winningVariant     String? // "control" or "variant" once determined

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  portfolioWebsite PortfolioWebsite   @relation(fields: [portfolioWebsiteId], references: [id], onDelete: Cascade)
  organization     Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  assignments      ABTestAssignment[]

  @@index([portfolioWebsiteId])
  @@index([organizationId])
  @@index([status])
}

model ABTestAssignment {
  id        String @id @default(cuid())
  testId    String
  visitorId String

  // Assignment
  variant   String // "control" or "variant"
  converted Boolean @default(false)

  createdAt   DateTime  @default(now())
  convertedAt DateTime?

  // Relations
  test PortfolioABTest @relation(fields: [testId], references: [id], onDelete: Cascade)

  @@unique([testId, visitorId])
  @@index([testId])
  @@index([visitorId])
}

enum PortfolioABTestStatus {
  draft
  running
  paused
  completed
}

enum ABTestGoalType {
  views // Total page views
  unique_visitors // Unique visitor count
  time_on_page // Average time spent
  scroll_depth // Average scroll depth
  inquiries // Contact form submissions
  leads // Lead captures
}

// ============================================================================
// CUSTOM FORM BUILDER
// ============================================================================

model CustomForm {
  id                 String  @id @default(cuid())
  portfolioWebsiteId String?
  organizationId     String

  // Form Settings
  name        String
  description String? @db.Text
  slug        String  @unique // URL-friendly identifier

  // Appearance
  submitButtonText String  @default("Submit")
  successMessage   String  @default("Thank you for your submission!")
  redirectUrl      String? // Optional redirect after submission

  // Behavior
  isActive           Boolean @default(true)
  requiresAuth       Boolean @default(false)
  maxSubmissions     Int? // Limit total submissions
  submissionsPerUser Int? // Limit per visitor

  // Notifications
  sendEmailOnSubmission Boolean @default(true)
  notificationEmails    String? @db.Text // Comma-separated emails

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  portfolioWebsite PortfolioWebsite? @relation(fields: [portfolioWebsiteId], references: [id], onDelete: SetNull)
  organization     Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  fields           CustomFormField[]
  submissions      FormSubmission[]

  @@index([portfolioWebsiteId])
  @@index([organizationId])
  @@index([slug])
  @@index([isActive])
}

model CustomFormField {
  id     String @id @default(cuid())
  formId String

  // Field Configuration
  name        String // Internal field name
  label       String // Display label
  type        CustomFormFieldType
  placeholder String?
  helpText    String?

  // Validation
  isRequired   Boolean @default(false)
  minLength    Int?
  maxLength    Int?
  pattern      String? // Regex pattern for validation
  patternError String? // Custom error message for pattern mismatch

  // Options (for select, radio, checkbox)
  options Json? // Array of { label: string, value: string }

  // Layout
  position Int    @default(0)
  width    String @default("full") // "full", "half", "third"

  // Conditional Logic
  conditionalLogic Json? // { showWhen: { field: string, operator: string, value: string } }

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  form CustomForm @relation(fields: [formId], references: [id], onDelete: Cascade)

  @@index([formId])
  @@index([position])
}

model FormSubmission {
  id     String @id @default(cuid())
  formId String

  // Submission Data
  data      Json // All field values
  ipAddress String?
  userAgent String?
  visitorId String?

  // Geolocation
  country String?
  city    String?

  // Status
  isRead     Boolean   @default(false)
  isArchived Boolean   @default(false)
  readAt     DateTime?

  createdAt DateTime @default(now())

  // Relations
  form CustomForm @relation(fields: [formId], references: [id], onDelete: Cascade)

  @@index([formId])
  @@index([isRead])
  @@index([isArchived])
  @@index([createdAt])
}

enum CustomFormFieldType {
  text
  email
  phone
  number
  textarea
  select
  multiselect
  radio
  checkbox
  date
  time
  datetime
  url
  file
  hidden
  heading // Display-only heading
  paragraph // Display-only text
  divider // Visual separator
}

// ============================================================================
// PROJECT MANAGEMENT
// ============================================================================

model TaskBoard {
  id             String @id @default(cuid())
  organizationId String

  name        String
  description String?
  color       String? // Board color for visual distinction
  icon        String? // Icon name (emoji or icon key)
  isDefault   Boolean @default(false) // Default board for org
  isArchived  Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization    Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  columns         TaskColumn[]
  tasks           Task[]
  taskAutomations TaskAutomation[]
  recurringTasks  RecurringTask[]

  @@index([organizationId])
  @@index([isArchived])
}

model TaskColumn {
  id      String @id @default(cuid())
  boardId String

  name     String
  color    String? // Column header color
  position Int     @default(0) // Sort order
  limit    Int? // WIP limit (optional)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  board          TaskBoard       @relation(fields: [boardId], references: [id], onDelete: Cascade)
  tasks          Task[]
  recurringTasks RecurringTask[]

  @@index([boardId])
  @@index([position])
}

model Task {
  id             String  @id @default(cuid())
  organizationId String
  boardId        String
  columnId       String
  assigneeId     String? // Assigned team member (User id)

  // Core task fields
  title       String
  description String?
  status      TaskStatus   @default(todo)
  priority    TaskPriority @default(medium)
  position    Int          @default(0) // Sort order within column

  // Dates
  startDate   DateTime?
  dueDate     DateTime?
  completedAt DateTime?

  // Time tracking (in minutes)
  estimatedMinutes Int?
  actualMinutes    Int?

  // Tags/labels
  tags String[] @default([])

  // Linked entities (optional - task can link to any of these)
  clientId          String?
  projectId         String? // Gallery/Project
  bookingId         String?
  invoiceId         String?
  propertyWebsiteId String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization    Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  board           TaskBoard        @relation(fields: [boardId], references: [id], onDelete: Cascade)
  column          TaskColumn       @relation(fields: [columnId], references: [id], onDelete: Cascade)
  assignee        User?            @relation(fields: [assigneeId], references: [id], onDelete: SetNull)
  client          Client?          @relation(fields: [clientId], references: [id], onDelete: SetNull)
  project         Project?         @relation(fields: [projectId], references: [id], onDelete: SetNull)
  booking         Booking?         @relation(fields: [bookingId], references: [id], onDelete: SetNull)
  invoice         Invoice?         @relation(fields: [invoiceId], references: [id], onDelete: SetNull)
  propertyWebsite PropertyWebsite? @relation(fields: [propertyWebsiteId], references: [id], onDelete: SetNull)
  subtasks        TaskSubtask[]
  comments        TaskComment[]
  taskTimeEntries TaskTimeEntry[]

  // Task dependencies (self-referential many-to-many)
  blockedByTasks Task[] @relation("TaskDependencies")
  blocksTasks    Task[] @relation("TaskDependencies")

  @@index([organizationId])
  @@index([boardId])
  @@index([columnId])
  @@index([assigneeId])
  @@index([status])
  @@index([priority])
  @@index([dueDate])
  @@index([clientId])
  @@index([projectId])
  @@index([bookingId])
}

model TaskSubtask {
  id     String @id @default(cuid())
  taskId String

  title       String
  isCompleted Boolean @default(false)
  position    Int     @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@index([taskId])
}

model TaskComment {
  id       String @id @default(cuid())
  taskId   String
  authorId String

  content String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  task   Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([authorId])
}

model TaskTemplate {
  id             String @id @default(cuid())
  organizationId String

  // Template metadata
  name        String
  description String? // Description for the template itself
  category    String? // Category for organization (e.g., "Gallery Delivery", "Post-Production")
  icon        String? // Emoji or icon key
  isGlobal    Boolean @default(false) // System templates vs org templates

  // Template content (applied to new tasks)
  taskTitle        String // Template for task title (can include placeholders)
  taskDescription  String? // Template for task description
  priority         TaskPriority @default(medium)
  tags             String[]     @default([])
  estimatedMinutes Int?

  // Default subtasks (stored as JSON array)
  subtasks Json? // [{title: string, position: number}]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([category])
  @@index([isGlobal])
}

// Task Automation Rules
model TaskAutomation {
  id             String @id @default(cuid())
  organizationId String
  boardId        String

  name        String
  description String?
  isActive    Boolean @default(true)

  // Trigger conditions (JSON)
  // e.g., { "type": "subtasks_complete" } or { "type": "status_change", "from": "todo", "to": "in_progress" }
  trigger Json

  // Actions to perform (JSON array)
  // e.g., [{ "type": "move_to_column", "columnId": "xyz" }, { "type": "assign", "assigneeId": "abc" }]
  actions Json

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  board        TaskBoard    @relation(fields: [boardId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([boardId])
  @@index([isActive])
}

// Recurring Task Configuration
model RecurringTask {
  id             String @id @default(cuid())
  organizationId String
  boardId        String
  columnId       String // Column to create task in

  // Template data
  title            String
  description      String?
  priority         TaskPriority @default(medium)
  tags             String[]     @default([])
  estimatedMinutes Int?
  assigneeId       String? // Default assignee

  // Recurrence settings
  frequency  String // "daily", "weekly", "monthly", "custom"
  interval   Int    @default(1) // Every N days/weeks/months
  daysOfWeek Int[]  @default([]) // 0-6 for weekly (0=Sunday)
  dayOfMonth Int? // 1-31 for monthly
  time       String @default("09:00") // HH:MM when to create

  // Next occurrence
  nextRunAt DateTime?
  lastRunAt DateTime?
  isActive  Boolean   @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  board        TaskBoard    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  column       TaskColumn   @relation(fields: [columnId], references: [id], onDelete: Cascade)
  assignee     User?        @relation(fields: [assigneeId], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@index([boardId])
  @@index([nextRunAt])
  @@index([isActive])
}

// Time Tracking Entries (separate from task's total)
model TaskTimeEntry {
  id     String @id @default(cuid())
  taskId String
  userId String

  startedAt DateTime
  endedAt   DateTime?
  minutes   Int? // Calculated or manual

  description String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([userId])
  @@index([startedAt])
}

// ============================================================================
// PRODUCT PHOTOGRAPHY MODULE
// ============================================================================

model ProductCatalog {
  id             String @id @default(cuid())
  organizationId String

  name        String
  description String?
  status      ProductCatalogStatus @default(planning)
  tags        String[]             @default([])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  products     ProductItem[]

  @@index([organizationId])
  @@index([status])
}

model ProductItem {
  id        String        @id @default(cuid())
  catalogId String
  sku       String
  name      String
  category  String?
  status    ProductStatus @default(pending)
  angles    String[]      @default([])
  notes     String?
  priority  Int?          @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  catalog  ProductCatalog   @relation(fields: [catalogId], references: [id], onDelete: Cascade)
  variants ProductVariant[]
  photos   ProductPhoto[]

  @@unique([catalogId, sku])
  @@index([catalogId])
  @@index([status])
}

model ProductVariant {
  id        String  @id @default(cuid())
  productId String
  skuSuffix String?
  name      String?
  color     String?
  size      String?
  notes     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  product ProductItem    @relation(fields: [productId], references: [id], onDelete: Cascade)
  photos  ProductPhoto[]

  @@index([productId])
}

model ProductPhoto {
  id           String             @id @default(cuid())
  productId    String
  variantId    String?
  assetId      String
  angle        String
  isPrimary    Boolean            @default(false)
  status       ProductPhotoStatus @default(raw)
  version      Int                @default(1)
  retouchNotes String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  product ProductItem     @relation(fields: [productId], references: [id], onDelete: Cascade)
  variant ProductVariant? @relation(fields: [variantId], references: [id], onDelete: SetNull)
  asset   Asset           @relation(fields: [assetId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([variantId])
  @@index([assetId])
  @@index([status])
}

// ============================================================================
// DISCOUNT CODES
// ============================================================================

model DiscountCode {
  id             String       @id @default(cuid())
  organizationId String
  code           String // The actual code (e.g., "SUMMER20")
  description    String? // Internal description
  discountType   DiscountType @default(percentage)
  discountValue  Int // Percentage (0-100) or cents for fixed_amount

  // Limits
  maxUses     Int? @default(0) // 0 = unlimited
  usedCount   Int  @default(0)
  minPurchase Int? @default(0) // Minimum purchase in cents
  maxDiscount Int? // Maximum discount in cents (for percentage discounts)

  // Validity
  validFrom  DateTime  @default(now())
  validUntil DateTime?
  isActive   Boolean   @default(true)

  // Scope - which things this code applies to
  applicableServices String[] @default([]) // Empty = all services
  applicableClients  String[] @default([]) // Empty = all clients

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  usages       DiscountCodeUsage[]

  // Phase 1: Ordering System relations
  orders Order[]

  @@unique([organizationId, code])
  @@index([organizationId])
  @@index([code])
  @@index([isActive])
}

model DiscountCodeUsage {
  id             String  @id @default(cuid())
  discountCodeId String
  invoiceId      String?
  paymentId      String?
  clientEmail    String?

  discountAmount Int // Amount discounted in cents

  createdAt DateTime @default(now())

  // Relations
  discountCode DiscountCode @relation(fields: [discountCodeId], references: [id], onDelete: Cascade)

  @@index([discountCodeId])
  @@index([invoiceId])
}

// ============================================================================
// PAYMENT PLANS
// ============================================================================

model PaymentPlan {
  id             String  @id @default(cuid())
  organizationId String
  invoiceId      String?
  projectId      String?
  clientId       String?

  // Plan details
  totalAmount  Int // Total amount in cents
  installments Int // Number of installments (e.g., 3, 6, 12)
  paidAmount   Int @default(0) // Amount paid so far

  status PaymentPlanStatus @default(active)

  // Schedule
  startDate   DateTime
  frequency   String    @default("monthly") // "weekly", "biweekly", "monthly"
  nextDueDate DateTime?

  // Stripe
  stripeSubscriptionId String? @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization      Organization             @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  scheduledPayments PaymentPlanInstallment[]

  @@index([organizationId])
  @@index([invoiceId])
  @@index([clientId])
  @@index([status])
}

model PaymentPlanInstallment {
  id            String @id @default(cuid())
  paymentPlanId String

  amount  Int // Amount in cents
  dueDate DateTime
  paidAt  DateTime?
  isPaid  Boolean   @default(false)

  // Stripe
  stripePaymentIntentId String? @unique

  // Reminders
  reminderSentAt DateTime?

  createdAt DateTime @default(now())

  // Relations
  paymentPlan PaymentPlan @relation(fields: [paymentPlanId], references: [id], onDelete: Cascade)

  @@index([paymentPlanId])
  @@index([dueDate])
  @@index([isPaid])
}

// ============================================================================
// DOWNLOAD TRACKING
// ============================================================================

model DownloadLog {
  id             String  @id @default(cuid())
  organizationId String
  projectId      String
  assetId        String? // Null for batch/zip downloads

  // Download details
  format     DownloadFormat @default(original)
  fileCount  Int            @default(1) // For batch downloads
  totalBytes BigInt?

  // Who downloaded
  clientEmail String?
  sessionId   String?
  ipAddress   String?
  userAgent   String?

  createdAt DateTime @default(now())

  @@index([organizationId])
  @@index([projectId])
  @@index([assetId])
  @@index([clientEmail])
  @@index([createdAt])
}

// ============================================================================
// GALLERY EXPIRATION NOTIFICATIONS
// ============================================================================

model ExpirationNotification {
  id        String @id @default(cuid())
  projectId String

  // Notification schedule
  daysBeforeExpiry Int // 7, 3, 1, etc.
  sentAt           DateTime?

  // Email details
  recipientEmail String
  emailType      String @default("expiry_warning") // "expiry_warning", "expired", "extended"

  createdAt DateTime @default(now())

  @@unique([projectId, daysBeforeExpiry])
  @@index([projectId])
  @@index([sentAt])
}

// ============================================================================
// INVOICE BRANDING TEMPLATES (Visual styling for invoices)
// ============================================================================

model InvoiceBrandingTemplate {
  id             String @id @default(cuid())
  organizationId String

  name      String
  isDefault Boolean @default(false)

  // Branding
  logoPosition String @default("left") // "left", "center", "right"
  primaryColor String @default("#3b82f6")
  accentColor  String @default("#8b5cf6")

  // Content
  headerText   String?
  footerText   String?
  paymentTerms String? // e.g., "Net 30", "Due on Receipt"
  notes        String?

  // Styling
  fontFamily      String  @default("Inter")
  showLogo        Boolean @default(true)
  showPaymentLink Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
}

// ============================================================================
// INVOICE EMAIL TEMPLATES (Customizable email content for invoices)
// ============================================================================

enum InvoiceEmailType {
  invoice_created // When invoice is first created
  invoice_sent // When invoice is sent to client
  invoice_reminder // Payment reminder
  invoice_overdue // Overdue notice
  invoice_paid // Payment confirmation
  invoice_partial // Partial payment received
  estimate_sent // Quote/estimate sent
  estimate_approved // Quote approved by client
  estimate_rejected // Quote rejected by client
}

model InvoiceEmailTemplate {
  id             String @id @default(cuid())
  organizationId String

  // Template identification
  name      String
  emailType InvoiceEmailType
  isDefault Boolean          @default(false)
  isActive  Boolean          @default(true)

  // Email content
  subject  String // Supports variables like {{invoiceNumber}}, {{clientName}}
  bodyHtml String  @db.Text // HTML email body
  bodyText String? @db.Text // Plain text fallback

  // Sender customization
  fromName String? // Override sender name
  replyTo  String? // Reply-to email

  // Scheduling options (for reminders)
  sendDelayDays Int? // Days after event to send (e.g., reminder 7 days after due)

  // CC/BCC
  ccEmails  String[] @default([])
  bccEmails String[] @default([])

  // Metadata
  usageCount Int       @default(0)
  lastUsedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, emailType, isDefault])
  @@index([organizationId])
  @@index([emailType])
}

// ============================================================================
// CLIENT PORTAL ACTIVITY
// ============================================================================

model PortalActivity {
  id             String @id @default(cuid())
  organizationId String
  clientId       String

  // Activity details
  activityType String // "gallery_delivered", "invoice_sent", "payment_received", "comment_posted", etc.
  title        String
  description  String?

  // Related entities
  projectId String?
  invoiceId String?
  paymentId String?

  // Read status
  isRead Boolean   @default(false)
  readAt DateTime?

  createdAt DateTime @default(now())

  @@index([organizationId])
  @@index([clientId])
  @@index([isRead])
  @@index([createdAt])
}

// ============================================================================
// PHASE 1: SCHEDULING & AVAILABILITY
// ============================================================================

model AvailabilityBlock {
  id             String  @id @default(cuid())
  organizationId String
  userId         String? // null = org-wide block

  // Block details
  title       String
  description String?
  blockType   AvailabilityBlockType @default(time_off)

  // Time range
  startDate DateTime
  endDate   DateTime
  allDay    Boolean  @default(true)

  // Recurrence (RRULE format)
  isRecurring    Boolean   @default(false)
  recurrenceRule String? // e.g., "FREQ=WEEKLY;BYDAY=SU"
  recurrenceEnd  DateTime?

  // Time-off request approval workflow
  requestStatus TimeOffRequestStatus @default(approved) // Legacy blocks are auto-approved
  approvedById  String?
  approvedAt    DateTime?
  rejectionNote String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([organizationId])
  @@index([userId])
  @@index([startDate])
  @@index([endDate])
  @@index([requestStatus])
}

model BookingBuffer {
  id             String  @id @default(cuid())
  organizationId String
  serviceId      String? // null = org-wide default

  // Buffer times in minutes
  bufferBefore Int @default(0) // Setup time before booking
  bufferAfter  Int @default(0) // Teardown time after booking

  // Minimum booking window
  minAdvanceHours Int? // Minimum hours in advance to book
  maxAdvanceDays  Int? // Maximum days in advance to book

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([organizationId, serviceId])
  @@index([organizationId])
  @@index([serviceId])
}

// ============================================================================
// PHASE 1: PUBLIC BOOKING FORMS
// ============================================================================

enum FormFieldType {
  text
  textarea
  email
  phone
  number
  date
  time
  datetime
  select
  multiselect
  checkbox
  radio
  file
  address
  url
}

enum BookingFormSubmissionStatus {
  pending
  approved
  rejected
  converted
  expired
}

model BookingForm {
  id             String @id @default(cuid())
  organizationId String

  // Form identity
  name        String
  slug        String
  description String?

  // Industry-specific form (optional)
  industry Industry?

  // Publishing
  isPublished Boolean @default(false)
  isDefault   Boolean @default(false) // Default form for the org

  // Branding overrides (like OrderPage)
  headline        String?
  subheadline     String?
  heroImageUrl    String?
  logoOverrideUrl String?
  primaryColor    String?

  // Booking settings
  requireApproval   Boolean @default(true) // Auto-confirm or require admin approval
  confirmationEmail Boolean @default(true)

  // Analytics
  viewCount    Int @default(0)
  bookingCount Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization            @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  fields       BookingFormField[]
  services     BookingFormService[]
  submissions  BookingFormSubmission[]

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([slug])
  @@index([isPublished])
}

model BookingFormField {
  id            String @id @default(cuid())
  bookingFormId String

  // Field configuration
  label       String
  type        FormFieldType
  placeholder String?
  helpText    String?
  isRequired  Boolean       @default(false)
  sortOrder   Int           @default(0)

  // Industry-specific: only show for certain industries
  industries Industry[]

  // Validation rules (JSON: { minLength, maxLength, pattern, min, max, options })
  validation Json?

  // Conditional visibility
  conditionalOn    String? // Field ID this depends on
  conditionalValue String? // Value that triggers display

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  bookingForm BookingForm @relation(fields: [bookingFormId], references: [id], onDelete: Cascade)

  @@index([bookingFormId])
  @@index([sortOrder])
}

model BookingFormService {
  id            String  @id @default(cuid())
  bookingFormId String
  serviceId     String
  sortOrder     Int     @default(0)
  isDefault     Boolean @default(false) // Pre-selected on form

  bookingForm BookingForm @relation(fields: [bookingFormId], references: [id], onDelete: Cascade)
  service     Service     @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([bookingFormId, serviceId])
  @@index([bookingFormId])
  @@index([serviceId])
}

model BookingFormSubmission {
  id            String  @id @default(cuid())
  bookingFormId String
  bookingId     String? @unique // Linked once converted to booking

  // Submitted data
  data Json // All field values as key-value pairs

  // Client info (extracted from data for convenience)
  clientName  String?
  clientEmail String?
  clientPhone String?

  // Scheduling preference
  preferredDate DateTime?
  preferredTime String?

  // Selected service
  serviceId String?

  // Status
  status BookingFormSubmissionStatus @default(pending)

  // Conversion tracking
  convertedAt   DateTime?
  convertedBy   String? // User ID who converted
  rejectedAt    DateTime?
  rejectionNote String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  bookingForm BookingForm @relation(fields: [bookingFormId], references: [id], onDelete: Cascade)
  booking     Booking?    @relation(fields: [bookingId], references: [id], onDelete: SetNull)

  @@index([bookingFormId])
  @@index([status])
  @@index([createdAt])
}

// ============================================================================
// PHASE 1: CLIENT CRM ENHANCEMENTS
// ============================================================================

model ClientCommunication {
  id       String @id @default(cuid())
  clientId String

  // Communication details
  type      CommunicationType
  direction CommunicationDirection
  subject   String?
  content   String                 @db.Text

  // Metadata
  sentAt DateTime?
  readAt DateTime?

  // Who logged this
  createdById String?

  // Related entities
  bookingId String?
  projectId String?
  invoiceId String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  client Client @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@index([type])
  @@index([createdAt])
}

model ClientTag {
  id             String @id @default(cuid())
  organizationId String

  name        String
  color       String  @default("#6366f1")
  description String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  clients ClientTagAssignment[]

  @@unique([organizationId, name])
  @@index([organizationId])
}

model ClientTagAssignment {
  id       String @id @default(cuid())
  clientId String
  tagId    String

  createdAt DateTime @default(now())

  // Relations
  client Client    @relation(fields: [clientId], references: [id], onDelete: Cascade)
  tag    ClientTag @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([clientId, tagId])
  @@index([clientId])
  @@index([tagId])
}

// ============================================================================
// PHASE 1: CONTRACT E-SIGNATURE ENHANCEMENTS
// ============================================================================

model ContractSignature {
  id         String @id @default(cuid())
  contractId String
  signerId   String // ContractSigner id

  // Signature data
  signatureData String        @db.Text // Base64 encoded signature image
  signatureType SignatureType @default(drawn)

  // Verification
  signedAt  DateTime @default(now())
  ipAddress String?
  userAgent String?

  // Legal compliance
  consentGiven Boolean @default(true)
  consentText  String? @db.Text

  createdAt DateTime @default(now())

  // Relations
  contract Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)

  @@index([contractId])
  @@index([signerId])
}

// ============================================================================
// PHASE 1: CALENDAR INTEGRATIONS
// ============================================================================

model CalendarIntegration {
  id             String  @id @default(cuid())
  organizationId String
  userId         String? // User-specific or org-wide

  // Provider details
  provider   CalendarProvider
  externalId String // Calendar ID from provider
  name       String // Display name

  // OAuth tokens
  accessToken    String    @db.Text
  refreshToken   String?   @db.Text
  tokenExpiresAt DateTime?

  // Sync settings
  syncEnabled   Boolean       @default(true)
  syncDirection SyncDirection @default(both)
  lastSyncAt    DateTime?
  lastSyncError String?

  // Color mapping
  color String @default("#3b82f6")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([organizationId, provider, externalId])
  @@index([organizationId])
  @@index([userId])
  @@index([provider])
}

model CalendarEvent {
  id                    String @id @default(cuid())
  calendarIntegrationId String

  // External reference
  externalEventId String

  // Event details (cached from provider)
  title       String
  description String?  @db.Text
  startTime   DateTime
  endTime     DateTime
  allDay      Boolean  @default(false)
  location    String?

  // Link to internal booking (if synced)
  bookingId String? @unique

  // Sync metadata
  lastSyncedAt DateTime @default(now())
  etag         String? // For change detection

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([calendarIntegrationId, externalEventId])
  @@index([calendarIntegrationId])
  @@index([bookingId])
  @@index([startTime])
}

// iCal feed export for external calendar subscriptions
model CalendarFeed {
  id             String  @id @default(cuid())
  organizationId String
  userId         String? // User-specific feed (null = org-wide)

  // Feed identification
  token    String @unique // Unique token for feed URL
  name     String @default("Bookings") // Display name for the feed
  timezone String @default("America/New_York")

  // Status
  isActive Boolean @default(true)

  // Access tracking
  lastAccessedAt DateTime?
  accessCount    Int       @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User?        @relation("UserCalendarFeeds", fields: [userId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([userId])
  @@index([token])
}

// ============================================================================
// SPIRO FEATURE PARITY - PHASE 1: ORDERING SYSTEM & PRODUCT BUNDLES
// ============================================================================

enum OrderStatus {
  cart // Items added, not submitted
  pending // Submitted, awaiting payment
  paid // Payment received
  processing // Being worked on
  completed // Delivered
  cancelled // Cancelled by client or admin
}

enum BundleType {
  fixed // Fixed set of services at fixed price
  tiered // Pick X services from a group
  custom // Build your own
  sqft_based // Price based on square footage (price per sqft)
  tiered_sqft // Tiered pricing by square footage ranges (BICEP pricing)
}

enum BundlePricingMethod {
  fixed // Single fixed price
  per_sqft // Price per square foot
  tiered // Price based on sqft tiers
}

enum AddonTrigger {
  always // Always show
  with_service // Show when specific service selected
  cart_threshold // Show when cart > X amount
}

// ============================================================================
// SERVICE BUNDLES (Package services together with bundle pricing)
// ============================================================================

model ServiceBundle {
  id             String @id @default(cuid())
  organizationId String

  // Bundle info
  name        String
  slug        String
  description String?    @db.Text
  priceCents  Int // Bundle price (for fixed pricing)
  bundleType  BundleType @default(fixed)

  // Pricing method (allows user to choose between pricing strategies)
  pricingMethod BundlePricingMethod @default(fixed)

  // Square footage pricing (for sqft_based and tiered_sqft bundles)
  pricePerSqftCents Int? @default(0) // Price per sqft for sqft_based pricing
  minSqft           Int? @default(0) // Minimum sqft (floor for pricing)
  maxSqft           Int? // Maximum sqft (optional ceiling)
  sqftIncrements    Int? @default(500) // Round to nearest X sqft (e.g., 500)

  // Display
  imageUrl  String?
  badgeText String? // "Most Popular", "Best Value"
  sortOrder Int     @default(0)

  // Savings display
  originalPriceCents Int? // Sum of individual services (for savings display)
  savingsPercent     Float? // Calculated savings percentage

  // Settings
  isActive Boolean @default(true)
  isPublic Boolean @default(true) // Show on public order pages

  // Stripe Product Catalog sync
  stripeProductId String? // Stripe Product ID (prod_xxx)
  stripePriceId   String? // Stripe Price ID (price_xxx)
  stripeSyncedAt  DateTime? // Last successful sync timestamp

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  services     ServiceBundleItem[] // Services included in bundle
  pricingTiers BundlePricingTier[] // Tiered pricing tiers (for tiered_sqft)
  orderPages   OrderPageBundle[] // Order pages featuring this bundle
  orderItems   OrderItem[]

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([isActive, isPublic])
}

model ServiceBundleItem {
  id        String @id @default(cuid())
  bundleId  String
  serviceId String

  // For tiered bundles: is this required or optional?
  isRequired Boolean @default(true)
  quantity   Int     @default(1)
  sortOrder  Int     @default(0)

  // Relations
  bundle  ServiceBundle @relation(fields: [bundleId], references: [id], onDelete: Cascade)
  service Service       @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([bundleId, serviceId])
  @@index([bundleId])
  @@index([serviceId])
}

// Pricing tiers for tiered_sqft bundles (BICEP-style pricing)
model BundlePricingTier {
  id       String @id @default(cuid())
  bundleId String

  // Tier range (e.g., 0-2000 sqft, 2001-3500 sqft, etc.)
  minSqft Int // Minimum sqft for this tier (inclusive)
  maxSqft Int? // Maximum sqft for this tier (null = unlimited)

  // Tier pricing
  priceCents Int // Fixed price for this tier
  tierName   String? // Optional display name (e.g., "Small Home", "Medium Home")

  sortOrder Int @default(0)

  // Relations
  bundle ServiceBundle @relation(fields: [bundleId], references: [id], onDelete: Cascade)

  @@unique([bundleId, minSqft])
  @@index([bundleId])
}

// ============================================================================
// SERVICE ADDONS (Cross-sells/Upsells)
// ============================================================================

model ServiceAddon {
  id             String @id @default(cuid())
  organizationId String

  // Addon info
  name        String
  description String?
  priceCents  Int

  // Display
  imageUrl  String?
  iconName  String? // Icon identifier
  sortOrder Int     @default(0)

  // Trigger conditions
  triggerType  AddonTrigger @default(always)
  triggerValue String? // Service ID or amount threshold

  // Settings
  isActive  Boolean @default(true)
  isOneTime Boolean @default(true) // Can only add once

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization   Organization         @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  compatibleWith ServiceAddonCompat[] // Services this addon works with
  orderItems     OrderItem[]

  @@index([organizationId])
  @@index([isActive])
}

model ServiceAddonCompat {
  id        String @id @default(cuid())
  addonId   String
  serviceId String

  addon   ServiceAddon @relation(fields: [addonId], references: [id], onDelete: Cascade)
  service Service      @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([addonId, serviceId])
  @@index([addonId])
  @@index([serviceId])
}

// ============================================================================
// ORDER PAGES (Custom branded landing pages)
// ============================================================================

model OrderPage {
  id             String  @id @default(cuid())
  organizationId String
  clientId       String? // Optional: dedicated page for specific client
  brokerageId    String? // Optional: dedicated page for specific brokerage

  // Page info
  name String
  slug String

  // Branding overrides
  headline        String?
  subheadline     String?
  heroImageUrl    String?
  logoOverrideUrl String? // Override org logo for this page
  primaryColor    String? // Override org primary color

  // Contact info display
  showPhone   Boolean @default(true)
  showEmail   Boolean @default(true)
  customPhone String?
  customEmail String?

  // Template/Layout
  template String @default("default") // "default", "minimal", "luxury"

  // SEO
  metaTitle       String?
  metaDescription String?

  // Settings
  isPublished  Boolean @default(false)
  requireLogin Boolean @default(false) // Require client portal login

  // Testimonials/social proof
  testimonials Json? // Array of { name, company, quote, photoUrl }

  // Analytics
  viewCount  Int @default(0)
  orderCount Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client       Client?            @relation(fields: [clientId], references: [id], onDelete: SetNull)
  brokerage    Brokerage?         @relation("BrokerageOrderPages", fields: [brokerageId], references: [id], onDelete: SetNull)
  bundles      OrderPageBundle[]
  services     OrderPageService[]
  orders       Order[]

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([clientId])
  @@index([brokerageId])
  @@index([isPublished])
}

model OrderPageBundle {
  id          String  @id @default(cuid())
  orderPageId String
  bundleId    String
  sortOrder   Int     @default(0)
  isFeatured  Boolean @default(false) // Highlight as recommended

  orderPage OrderPage     @relation(fields: [orderPageId], references: [id], onDelete: Cascade)
  bundle    ServiceBundle @relation(fields: [bundleId], references: [id], onDelete: Cascade)

  @@unique([orderPageId, bundleId])
  @@index([orderPageId])
}

model OrderPageService {
  id          String @id @default(cuid())
  orderPageId String
  serviceId   String
  sortOrder   Int    @default(0)

  orderPage OrderPage @relation(fields: [orderPageId], references: [id], onDelete: Cascade)
  service   Service   @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([orderPageId, serviceId])
  @@index([orderPageId])
}

// ============================================================================
// ORDERS (Shopping Cart / Pre-Invoice)
// ============================================================================

model Order {
  id             String  @id @default(cuid())
  organizationId String
  orderPageId    String? // Which order page it came from
  clientId       String? // Linked client (if known)

  // Order reference
  orderNumber String // e.g., "ORD-2025-0001"
  status      OrderStatus @default(cart)

  // Totals (in cents)
  subtotalCents Int @default(0)
  discountCents Int @default(0)
  taxCents      Int @default(0)
  totalCents    Int @default(0)

  // Discount code applied
  discountCodeId String?

  // Client info (for guest checkout)
  clientName    String?
  clientEmail   String?
  clientPhone   String?
  clientCompany String?

  // Property/Shoot location
  locationId    String?
  locationNotes String?

  // Scheduling preference
  preferredDate DateTime?
  preferredTime String? // "morning", "afternoon", "evening"
  flexibleDates Boolean   @default(true)

  // Notes
  clientNotes   String? @db.Text
  internalNotes String? @db.Text

  // Session token for guest checkout
  sessionToken String? @unique

  // Payment
  paidAt        DateTime?
  paymentMethod String?

  // Stripe
  stripeCheckoutSessionId String? @unique
  stripePaymentIntentId   String? @unique

  // Conversion tracking
  source   String? // utm_source
  medium   String? // utm_medium
  campaign String? // utm_campaign

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  submittedAt DateTime? // When cart was submitted

  // Relations
  organization Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  orderPage    OrderPage?    @relation(fields: [orderPageId], references: [id], onDelete: SetNull)
  client       Client?       @relation(fields: [clientId], references: [id], onDelete: SetNull)
  location     Location?     @relation(fields: [locationId], references: [id], onDelete: SetNull)
  discountCode DiscountCode? @relation(fields: [discountCodeId], references: [id], onDelete: SetNull)
  items        OrderItem[]
  invoice      Invoice?      @relation("OrderInvoice")
  booking      Booking?      @relation("OrderBooking")

  @@unique([organizationId, orderNumber])
  @@index([organizationId])
  @@index([orderPageId])
  @@index([clientId])
  @@index([status])
  @@index([createdAt])
}

model OrderItem {
  id      String @id @default(cuid())
  orderId String

  // Item type
  itemType  String // "service", "bundle", "addon"
  serviceId String?
  bundleId  String?
  addonId   String?

  // Details
  name        String
  description String?
  quantity    Int     @default(1)
  unitCents   Int
  totalCents  Int

  // Square footage (for sqft-based bundle pricing)
  sqft            Int? // Square footage entered by client
  pricingTierId   String? // Which pricing tier was applied (for tiered_sqft)
  pricingTierName String? // Tier name at time of order (snapshot)

  sortOrder Int @default(0)

  createdAt DateTime @default(now())

  // Relations
  order   Order          @relation(fields: [orderId], references: [id], onDelete: Cascade)
  service Service?       @relation(fields: [serviceId], references: [id], onDelete: SetNull)
  bundle  ServiceBundle? @relation(fields: [bundleId], references: [id], onDelete: SetNull)
  addon   ServiceAddon?  @relation(fields: [addonId], references: [id], onDelete: SetNull)

  @@index([orderId])
  @@index([serviceId])
  @@index([bundleId])
}

// ============================================================================
// SPIRO FEATURE PARITY - PHASE 2: BROKERAGE & ENTERPRISE FEATURES
// ============================================================================

enum PayoutStatus {
  pending // Scheduled but not processed
  processing // Being sent via Stripe
  completed // Successfully paid
  failed // Payment failed
  cancelled // Cancelled before processing
}

enum InvoiceSplitType {
  single // Standard single invoice
  split // One invoice with line items assigned to agent/brokerage
  dual // Two separate invoices generated
}

enum EarningStatus {
  pending // Booking not yet completed
  approved // Ready for payout
  paid // Included in a payout
  disputed // Under review
}

// ============================================================================
// BROKERAGES (Parent company with multiple agents)
// ============================================================================

model Brokerage {
  id             String @id @default(cuid())
  organizationId String

  // Brokerage info
  name    String
  slug    String
  email   String?
  phone   String?
  website String?

  // Address
  address String?
  city    String?
  state   String?
  zipCode String?

  // Branding
  logoUrl      String?
  primaryColor String?

  // Primary contact
  contactName  String?
  contactEmail String?
  contactPhone String?

  // Settings
  isActive Boolean @default(true)

  // Analytics (denormalized)
  totalRevenueCents Int @default(0)
  activeAgentCount  Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization        @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  agents       Client[]            @relation("BrokerageAgents")
  contracts    BrokerageContract[]
  orderPages   OrderPage[]         @relation("BrokerageOrderPages")

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([isActive])
}

// ============================================================================
// BROKERAGE CONTRACTS (Pricing terms and discounts per brokerage)
// ============================================================================

model BrokerageContract {
  id          String @id @default(cuid())
  brokerageId String

  // Contract details
  name        String
  description String?

  // Pricing terms
  discountPercent    Float? @default(0) // Global discount percentage
  discountFixedCents Int?   @default(0) // Fixed discount amount

  // Per-service pricing overrides (JSON: { serviceId: priceCents })
  servicePricing Json?

  // Payment terms
  paymentTermsDays Int     @default(30) // Net 30, etc.
  autoInvoice      Boolean @default(false) // Auto-create invoices

  // Invoice handling
  invoiceSplitType    InvoiceSplitType @default(single)
  brokeragePayPercent Float? // % brokerage pays (for split invoices)

  // Validity
  startDate DateTime  @default(now())
  endDate   DateTime?
  isActive  Boolean   @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  brokerage Brokerage @relation(fields: [brokerageId], references: [id], onDelete: Cascade)

  @@index([brokerageId])
  @@index([isActive])
}

// ============================================================================
// INVOICE SPLITS (Track split/dual invoice configuration)
// ============================================================================

model InvoiceSplit {
  id             String @id @default(cuid())
  organizationId String

  // Parent invoice
  primaryInvoiceId   String
  secondaryInvoiceId String? // For dual invoices

  // Split type
  splitType InvoiceSplitType

  // Split details
  agentAmountCents     Int @default(0)
  brokerageAmountCents Int @default(0)

  // Line item assignments (JSON: { lineItemId: "agent" | "brokerage" })
  lineItemAssignments Json?

  createdAt DateTime @default(now())

  @@unique([primaryInvoiceId])
  @@index([organizationId])
  @@index([primaryInvoiceId])
  @@index([secondaryInvoiceId])
}

// ============================================================================
// PHOTOGRAPHER RATES (Pay rates per photographer per service)
// ============================================================================

model PhotographerRate {
  id             String  @id @default(cuid())
  organizationId String
  userId         String // Photographer (team member)
  serviceId      String? // Null = default rate for all services

  // Pay structure
  rateType  String @default("percentage") // "percentage", "fixed", "hourly"
  rateValue Int // Percentage (0-100) or cents

  // Minimum/maximum
  minPayCents Int? // Minimum pay per booking
  maxPayCents Int? // Maximum pay per booking

  // Override for specific booking types
  bookingTypeId String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([organizationId, userId, serviceId])
  @@index([organizationId])
  @@index([userId])
  @@index([serviceId])
}

// ============================================================================
// PHOTOGRAPHER EARNINGS (Earnings log per booking)
// ============================================================================

model PhotographerEarning {
  id             String  @id @default(cuid())
  organizationId String
  userId         String // Photographer
  bookingId      String?
  invoiceId      String?

  // Earning details
  description String
  amountCents Int
  status      EarningStatus @default(pending)

  // Calculation source
  rateType        String? // How this was calculated
  rateValue       Int?
  baseAmountCents Int? // What the earning was calculated from

  // Payout reference
  payoutItemId String?

  // Dates
  earnedAt   DateTime  @default(now())
  approvedAt DateTime?
  paidAt     DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  payoutItem PayoutItem? @relation(fields: [payoutItemId], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@index([userId])
  @@index([bookingId])
  @@index([status])
  @@index([payoutItemId])
}

// ============================================================================
// PAYOUT BATCHES (Scheduled payout batches)
// ============================================================================

model PayoutBatch {
  id             String @id @default(cuid())
  organizationId String

  // Batch info
  batchNumber String // e.g., "PAY-2025-0001"
  status      PayoutStatus @default(pending)

  // Period covered
  periodStart DateTime
  periodEnd   DateTime

  // Totals
  totalAmountCents Int @default(0)
  itemCount        Int @default(0)

  // Processing
  processedAt  DateTime?
  failedReason String?

  // Stripe
  stripeTransferId String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  items        PayoutItem[]

  @@unique([organizationId, batchNumber])
  @@index([organizationId])
  @@index([status])
  @@index([periodStart])
}

model PayoutItem {
  id      String @id @default(cuid())
  batchId String
  userId  String // Recipient photographer

  // Amount
  amountCents Int
  description String?

  // Status
  status       PayoutStatus @default(pending)
  failedReason String?

  // Stripe Connect
  stripeTransferId String?
  stripePayoutId   String?

  // Dates
  processedAt DateTime?
  paidAt      DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  batch    PayoutBatch           @relation(fields: [batchId], references: [id], onDelete: Cascade)
  earnings PhotographerEarning[]

  @@index([batchId])
  @@index([userId])
  @@index([status])
}

// ============================================================================
// SPIRO FEATURE PARITY - PHASE 3: SMS NOTIFICATIONS & FIELD OPERATIONS
// ============================================================================

enum SMSDeliveryStatus {
  queued
  sent
  delivered
  failed
  undelivered
}

enum SMSTemplateType {
  booking_confirmation
  booking_reminder
  photographer_en_route
  photographer_arrived
  gallery_ready
  invoice_sent
  payment_received
  custom
}

enum CheckInType {
  arrival
  departure
  manual
}

enum SlackEventType {
  booking_created
  booking_confirmed
  booking_completed
  payment_received
  gallery_delivered
  new_lead
  custom
}

// Product module enums
enum ProductCatalogStatus {
  planning
  shooting
  editing
  delivered
  archived
}

enum ProductStatus {
  pending
  shot
  edited
  approved
  delivered
  archived
}

enum ProductPhotoStatus {
  raw
  edited
  approved
  rejected
}

// ============================================================================
// SMS TEMPLATES (Customizable SMS message templates)
// ============================================================================

model SMSTemplate {
  id             String @id @default(cuid())
  organizationId String

  // Template info
  name         String
  templateType SMSTemplateType
  content      String          @db.Text // Message with {{variables}}

  // Variables available in this template (for UI)
  availableVariables String[] @default([])

  // Settings
  isActive  Boolean @default(true)
  isDefault Boolean @default(false) // System default template

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  smsLogs      SMSLog[]

  @@unique([organizationId, templateType, isDefault])
  @@index([organizationId])
  @@index([templateType])
  @@index([isActive])
}

// ============================================================================
// SMS LOG (Track all sent SMS with delivery status)
// ============================================================================

model SMSLog {
  id             String @id @default(cuid())
  organizationId String

  // Message details
  templateId String?
  toPhone    String
  fromPhone  String
  content    String  @db.Text

  // Twilio tracking
  twilioMessageSid String?           @unique
  deliveryStatus   SMSDeliveryStatus @default(queued)
  errorCode        String?
  errorMessage     String?

  // Related entities
  bookingId String?
  clientId  String?
  userId    String? // Photographer (if sent to team)

  // Delivery timestamps
  sentAt      DateTime?
  deliveredAt DateTime?
  failedAt    DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  template     SMSTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)
  booking      Booking?     @relation(fields: [bookingId], references: [id], onDelete: SetNull)
  client       Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@index([templateId])
  @@index([bookingId])
  @@index([clientId])
  @@index([deliveryStatus])
  @@index([createdAt])
}

// ============================================================================
// BOOKING CHECK-IN (Photographer check-in events)
// ============================================================================

model BookingCheckIn {
  id        String @id @default(cuid())
  bookingId String
  userId    String // Photographer

  // Check-in details
  checkInType CheckInType
  latitude    Float
  longitude   Float
  accuracy    Float? // GPS accuracy in meters

  // Address (reverse geocoded)
  address String?

  // Distance from expected location
  distanceFromLocation Float? // Meters from booking location

  // Photo proof (optional)
  photoUrl String?

  // Notes
  notes String?

  createdAt DateTime @default(now())

  @@index([bookingId])
  @@index([userId])
  @@index([checkInType])
  @@index([createdAt])
}

// ============================================================================
// LOCATION PING (GPS pings during active booking)
// ============================================================================

model LocationPing {
  id        String @id @default(cuid())
  bookingId String
  userId    String // Photographer

  // Location data
  latitude  Float
  longitude Float
  accuracy  Float? // GPS accuracy in meters
  altitude  Float?
  speed     Float? // meters/second
  heading   Float? // Compass heading

  // Battery level (for monitoring)
  batteryLevel Float?

  createdAt DateTime @default(now())

  @@index([bookingId])
  @@index([userId])
  @@index([createdAt])
}

// ============================================================================
// SLACK INTEGRATION (Slack workspace connection)
// ============================================================================

model SlackIntegration {
  id             String @id @default(cuid())
  organizationId String

  // Slack workspace info
  teamId   String
  teamName String

  // OAuth tokens
  accessToken    String  @db.Text
  botUserId      String?
  botAccessToken String? @db.Text

  // Webhook URL (for incoming messages)
  incomingWebhookUrl String?

  // Settings
  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  channels     SlackChannel[]

  @@unique([organizationId, teamId])
  @@index([organizationId])
  @@index([teamId])
}

// ============================================================================
// SLACK CHANNEL (Channel routing for events)
// ============================================================================

model SlackChannel {
  id            String @id @default(cuid())
  integrationId String

  // Channel info
  channelId   String
  channelName String

  // Event routing
  eventTypes SlackEventType[]

  // Settings
  isActive    Boolean @default(true)
  mentionHere Boolean @default(false) // @here mentions
  mentionAll  Boolean @default(false) // @channel mentions

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  integration SlackIntegration @relation(fields: [integrationId], references: [id], onDelete: Cascade)

  @@unique([integrationId, channelId])
  @@index([integrationId])
  @@index([channelId])
}

// ============================================================================
// DROPBOX INTEGRATION (Cloud storage sync)
// ============================================================================

model DropboxIntegration {
  id             String @id @default(cuid())
  organizationId String @unique

  // Dropbox account info
  accountId   String // Dropbox account_id
  email       String
  displayName String

  // OAuth tokens
  accessToken  String  @db.Text
  refreshToken String? @db.Text

  // Sync settings
  syncEnabled Boolean @default(true)
  syncFolder  String  @default("/PhotoProOS") // Root folder in Dropbox
  autoSync    Boolean @default(true) // Auto-sync on file changes

  // Cursor for delta sync
  cursor String? @db.Text

  // Sync status
  lastSyncAt    DateTime?
  lastSyncError String?

  // Settings
  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([accountId])
}

// ============================================================================
// BOOKING SLOTS (Self-booking availability slots)
// ============================================================================

model BookingSlot {
  id             String  @id @default(cuid())
  organizationId String
  userId         String? // Specific photographer (null = any available)
  serviceId      String? // Specific service (null = any)

  // Time slot
  startTime DateTime
  endTime   DateTime
  timezone  String   @default("America/New_York")

  // Recurrence (for weekly availability patterns)
  isRecurring    Boolean   @default(false)
  recurrenceRule String? // RRULE format
  recurrenceEnd  DateTime?

  // Booking capacity
  maxBookings     Int @default(1) // How many can book this slot
  currentBookings Int @default(0)

  // Pricing override
  priceCentsOverride Int? // Override service price for this slot

  // Settings
  isActive Boolean @default(true)

  // Buffer times (override service defaults)
  bufferBeforeMinutes Int?
  bufferAfterMinutes  Int?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([userId])
  @@index([serviceId])
  @@index([startTime])
  @@index([isActive])
}

// ============================================================================
// SERVICE TERRITORIES (Geographic zones with pricing modifiers)
// ============================================================================

model ServiceTerritory {
  id             String  @id @default(cuid())
  organizationId String
  name           String
  description    String? @db.Text

  // Geographic bounds (ZIP codes or coordinates)
  zipCodes    String[] // Array of ZIP codes in this territory
  centerLat   Decimal? @db.Decimal(10, 7) // Center point latitude
  centerLng   Decimal? @db.Decimal(10, 7) // Center point longitude
  radiusMiles Float? // Radius in miles from center (alternative to ZIP codes)

  // Pricing
  pricingModifier Float @default(1.0) // 1.0 = normal, 1.2 = 20% more, 0.9 = 10% discount
  flatFeeOverride Int? // Flat fee override in cents (instead of modifier)
  travelFee       Int? // Additional travel fee in cents

  // Availability
  isActive            Boolean @default(true)
  minLeadTimeHours    Int? // Minimum hours notice for bookings
  maxLeadTimeDays     Int? // Maximum days in advance for bookings
  availableDaysOfWeek Int[] // 0=Sun, 1=Mon, etc. Empty = all days

  // Visual
  color String? // Hex color for map display

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization               @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  services     TerritoryServiceOverride[]

  @@index([organizationId])
  @@index([isActive])
}

model TerritoryServiceOverride {
  id          String @id @default(cuid())
  territoryId String
  serviceId   String

  // Override pricing for this service in this territory
  pricingModifier Float? // Override territory default
  flatPrice       Int? // Fixed price in cents (overrides modifier)
  isAvailable     Boolean @default(true) // Service available in this territory?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  territory ServiceTerritory @relation(fields: [territoryId], references: [id], onDelete: Cascade)
  service   Service          @relation("ServiceTerritoryOverrides", fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([territoryId, serviceId])
  @@index([territoryId])
  @@index([serviceId])
}

// ============================================================================
// REFERRAL PROGRAM (Agent referral tracking and rewards)
// ============================================================================

enum ReferralStatus {
  pending // Referral submitted, not yet converted
  qualified // Lead qualified/booking made
  completed // Service delivered
  rewarded // Reward issued
  expired // Referral expired without conversion
}

enum ReferralRewardType {
  percentage // Percentage of invoice
  fixed // Fixed amount
  credit // Account credit
  gift_card // Gift card
}

model ReferralProgram {
  id             String  @id @default(cuid())
  organizationId String  @unique
  name           String  @default("Referral Program")
  description    String? @db.Text

  // Program settings
  isActive         Boolean @default(false)
  requiresApproval Boolean @default(true) // Manual approval before reward

  // Reward configuration
  rewardType     ReferralRewardType @default(percentage)
  rewardValue    Float              @default(10) // 10% or $10 depending on type
  maxRewardCents Int? // Cap on reward amount

  // Referred client discount
  referredDiscount      Float? // Discount for referred client (e.g., 5%)
  referredDiscountCents Int? // Fixed discount in cents

  // Expiration
  referralValidDays    Int  @default(90) // How long referral link is valid
  rewardExpirationDays Int? // How long until reward expires after issue

  // Tracking
  termsUrl String? // Link to referral program terms

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  referrers    Referrer[]
  referrals    Referral[]
}

model Referrer {
  id        String @id @default(cuid())
  programId String

  // Referrer info (can be client, agent, or external)
  clientId String? @unique // If referrer is an existing client
  name     String
  email    String
  phone    String?

  // Unique referral code
  referralCode String @unique

  // Stats
  totalReferrals      Int @default(0)
  successfulReferrals Int @default(0)
  totalEarned         Int @default(0) // Total rewards in cents

  // Status
  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  program   ReferralProgram  @relation(fields: [programId], references: [id], onDelete: Cascade)
  client    Client?          @relation("ClientReferrer", fields: [clientId], references: [id], onDelete: SetNull)
  referrals Referral[]
  rewards   ReferralReward[]

  @@index([programId])
  @@index([clientId])
  @@index([referralCode])
}

model Referral {
  id         String @id @default(cuid())
  programId  String
  referrerId String

  // Referred person info
  referredName  String
  referredEmail String
  referredPhone String?

  // Conversion tracking
  status    ReferralStatus @default(pending)
  clientId  String? // Created client (after conversion)
  bookingId String? // First booking
  invoiceId String? // First invoice

  // Metadata
  source      String? // Where referral came from (link, form, etc.)
  landingPage String? // URL they landed on
  utmCampaign String?
  utmSource   String?

  // Timestamps
  submittedAt DateTime  @default(now())
  qualifiedAt DateTime?
  completedAt DateTime?
  expiresAt   DateTime

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  program  ReferralProgram  @relation(fields: [programId], references: [id], onDelete: Cascade)
  referrer Referrer         @relation(fields: [referrerId], references: [id], onDelete: Cascade)
  client   Client?          @relation("ReferralClient", fields: [clientId], references: [id], onDelete: SetNull)
  booking  Booking?         @relation("ReferralBooking", fields: [bookingId], references: [id], onDelete: SetNull)
  invoice  Invoice?         @relation("ReferralInvoice", fields: [invoiceId], references: [id], onDelete: SetNull)
  rewards  ReferralReward[]

  @@index([programId])
  @@index([referrerId])
  @@index([status])
  @@index([referredEmail])
}

model ReferralReward {
  id         String @id @default(cuid())
  referrerId String
  referralId String

  // Reward details
  rewardType  ReferralRewardType
  amountCents Int
  description String?

  // Status
  isIssued  Boolean   @default(false)
  issuedAt  DateTime?
  isClaimed Boolean   @default(false)
  claimedAt DateTime?
  expiresAt DateTime?

  // Payment tracking
  paymentMethod String? // How reward was paid (check, paypal, credit, etc.)
  paymentRef    String? // Reference number

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  referrer Referrer @relation(fields: [referrerId], references: [id], onDelete: Cascade)
  referral Referral @relation(fields: [referralId], references: [id], onDelete: Cascade)

  @@index([referrerId])
  @@index([referralId])
  @@index([isIssued])
}

// ============================================================================
// PLATFORM REFERRAL SYSTEM (PhotoProOS user-to-user referrals)
// ============================================================================

enum PlatformReferralStatus {
  pending // Referred user hasn't signed up yet
  signed_up // User signed up but hasn't subscribed
  subscribed // User subscribed (conversion!)
  churned // User canceled subscription
  expired // Referral link expired
}

enum PlatformRewardType {
  account_credit // Credit towards subscription
  extended_trial // Extra trial days
  percentage_discount // Discount on next billing
  free_month // Free month of subscription
}

// Global platform referral program settings (admin-managed)
model PlatformReferralSettings {
  id String @id @default("default")

  // Program settings
  isActive              Boolean @default(true)
  referralLinkValidDays Int     @default(30) // How long referral links are valid

  // Referrer rewards (when referred user subscribes)
  referrerRewardType         PlatformRewardType @default(account_credit)
  referrerRewardValue        Int                @default(2500) // $25 credit or 25 days, etc.
  referrerMaxRewardsPerMonth Int? // Cap monthly rewards

  // Referred user benefits
  referredTrialDays       Int  @default(21) // Extended trial (vs default 14)
  referredDiscountPercent Int? // First month discount
  referredDiscountMonths  Int  @default(1) // How many months discount applies

  // Reward expiration
  rewardExpirationDays Int? // How long until reward expires after issue

  // Tracking
  totalReferrals          Int @default(0)
  totalConversions        Int @default(0)
  totalRewardsIssuedCents Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Each user's referral profile
model PlatformReferrer {
  id     String @id @default(cuid())
  userId String @unique

  // Referral code (unique, shareable)
  referralCode String  @unique
  referralUrl  String? // Custom vanity URL if allowed

  // Stats
  totalReferrals      Int @default(0)
  successfulReferrals Int @default(0) // Converted to paid
  totalEarnedCents    Int @default(0)
  pendingCreditCents  Int @default(0) // Credited but not yet applied

  // Status
  isActive Boolean @default(true)
  isBanned Boolean @default(false) // For abuse prevention

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user      User                     @relation(fields: [userId], references: [id], onDelete: Cascade)
  referrals PlatformReferral[]
  rewards   PlatformReferralReward[]

  @@index([referralCode])
  @@index([userId])
}

// Individual referral tracking
model PlatformReferral {
  id         String @id @default(cuid())
  referrerId String

  // Referred person (before they become a user)
  referredEmail String
  referredName  String?

  // Tracking
  status                 PlatformReferralStatus @default(pending)
  referredUserId         String? // Set when they sign up
  referredOrganizationId String? // Set when org created

  // Attribution
  source      String? // Where link was shared (email, social, etc.)
  landingPage String? // Which page they landed on
  utmCampaign String?
  utmSource   String?
  utmMedium   String?

  // Timestamps
  clickedAt    DateTime? // When they clicked the link
  signedUpAt   DateTime? // When they created account
  subscribedAt DateTime? // When they started paid subscription
  expiresAt    DateTime // When referral link expires

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  referrer             PlatformReferrer         @relation(fields: [referrerId], references: [id], onDelete: Cascade)
  referredUser         User?                    @relation("ReferredByPlatform", fields: [referredUserId], references: [id], onDelete: SetNull)
  referredOrganization Organization?            @relation("ReferredOrgByPlatform", fields: [referredOrganizationId], references: [id], onDelete: SetNull)
  rewards              PlatformReferralReward[]

  @@index([referrerId])
  @@index([referredEmail])
  @@index([referredUserId])
  @@index([status])
  @@index([expiresAt])
}

// Rewards issued for platform referrals
model PlatformReferralReward {
  id         String @id @default(cuid())
  referrerId String
  referralId String

  // Reward details
  rewardType  PlatformRewardType
  valueCents  Int // Dollar value or days
  description String?

  // Status
  isApplied Boolean   @default(false) // Has it been used?
  appliedAt DateTime?
  expiresAt DateTime? // Rewards can expire

  // Stripe integration
  stripePromotionCodeId String? // If using Stripe promo codes
  stripeCouponId        String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  referrer PlatformReferrer @relation(fields: [referrerId], references: [id], onDelete: Cascade)
  referral PlatformReferral @relation(fields: [referralId], references: [id], onDelete: Cascade)

  @@index([referrerId])
  @@index([referralId])
  @@index([isApplied])
}

// ============================================================================
// PHASE 2: CLIENT QUESTIONNAIRE TEMPLATES SYSTEM
// ============================================================================

// System-provided and custom questionnaire templates
model QuestionnaireTemplate {
  id             String  @id @default(cuid())
  organizationId String? // Null = system template

  // Template identity
  name        String
  slug        String
  description String?  @db.Text
  industry    Industry

  // Template settings
  isSystemTemplate Boolean @default(false)
  isActive         Boolean @default(true)
  usageCount       Int     @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization    Organization?                    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  fields          QuestionnaireField[]
  legalAgreements QuestionnaireTemplateAgreement[]
  questionnaires  ClientQuestionnaire[]

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([industry])
  @@index([isSystemTemplate])
  @@index([isActive])
}

// Fields within a questionnaire template
model QuestionnaireField {
  id         String @id @default(cuid())
  templateId String

  // Field configuration
  label       String
  type        FormFieldType
  placeholder String?
  helpText    String?
  isRequired  Boolean       @default(false)
  sortOrder   Int           @default(0)

  // Section grouping
  section      String? // e.g., "Property Details", "Agent Information"
  sectionOrder Int     @default(0)

  // Validation rules (JSON: { minLength, maxLength, pattern, min, max, options })
  validation Json?

  // Conditional visibility
  conditionalOn    String? // Field ID this depends on
  conditionalValue String? // Value that triggers display

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  template QuestionnaireTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@index([templateId])
  @@index([sortOrder])
}

// Legal agreements attached to questionnaire templates
model QuestionnaireTemplateAgreement {
  id         String @id @default(cuid())
  templateId String

  // Agreement details
  agreementType     LegalAgreementType
  title             String
  content           String             @db.Text
  isRequired        Boolean            @default(true)
  requiresSignature Boolean            @default(false)
  sortOrder         Int                @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  template QuestionnaireTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)

  @@index([templateId])
  @@index([agreementType])
}

// Questionnaire assigned to a specific client
model ClientQuestionnaire {
  id             String @id @default(cuid())
  organizationId String
  clientId       String
  templateId     String

  // Optional: link to booking or project
  bookingId String?
  projectId String?

  // Assignment settings
  isRequired  Boolean                   @default(true)
  dueDate     DateTime?
  status      ClientQuestionnaireStatus @default(pending)
  startedAt   DateTime?
  completedAt DateTime?

  // Reminder settings
  sendReminders Boolean   @default(true)
  remindersSent Int       @default(0)
  lastReminder  DateTime?

  // Internal notes (visible only to photographer)
  internalNotes String?

  // Personal note to include in assignment email
  personalNote String? @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization                   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client       Client                         @relation(fields: [clientId], references: [id], onDelete: Cascade)
  template     QuestionnaireTemplate          @relation(fields: [templateId], references: [id], onDelete: Cascade)
  booking      Booking?                       @relation(fields: [bookingId], references: [id], onDelete: SetNull)
  project      Project?                       @relation(fields: [projectId], references: [id], onDelete: SetNull)
  responses    ClientQuestionnaireResponse[]
  agreements   ClientQuestionnaireAgreement[]
  emailLogs    EmailLog[]

  @@index([organizationId])
  @@index([clientId])
  @@index([templateId])
  @@index([bookingId])
  @@index([projectId])
  @@index([status])
  @@index([dueDate])
}

// Client's response to a questionnaire field
model ClientQuestionnaireResponse {
  id              String @id @default(cuid())
  questionnaireId String

  // Response data
  fieldLabel String // Store label for reference after template changes
  fieldType  String // Store type for proper rendering
  value      Json // Actual response value

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  questionnaire ClientQuestionnaire @relation(fields: [questionnaireId], references: [id], onDelete: Cascade)

  @@index([questionnaireId])
}

// Legal agreement acceptance record
model ClientQuestionnaireAgreement {
  id              String @id @default(cuid())
  questionnaireId String

  // Agreement details (snapshot from template)
  agreementType LegalAgreementType
  title         String
  content       String             @db.Text

  // Acceptance status
  accepted   Boolean   @default(false)
  acceptedAt DateTime?

  // Signature data (if signature required)
  signatureData String?        @db.Text // Base64 encoded signature image
  signatureType SignatureType?

  // Audit fields
  acceptedIp        String?
  acceptedUserAgent String? @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  questionnaire ClientQuestionnaire @relation(fields: [questionnaireId], references: [id], onDelete: Cascade)

  @@index([questionnaireId])
  @@index([agreementType])
  @@index([accepted])
}

// ============================================================================
// SUBSCRIPTION PLANS & PRICING (Application-Level SaaS Plans)
// ============================================================================

// Billing interval for subscription plans
enum BillingInterval {
  monthly
  yearly
}

// Status of a pricing experiment
enum ExperimentStatus {
  draft // Being configured
  active // Running and collecting data
  paused // Temporarily stopped
  completed // Finished, results available
  archived // No longer relevant
}

// Subscription plans for the application (Pro, Studio, Enterprise)
model SubscriptionPlan {
  id   String   @id @default(cuid())
  name String   @unique // "Pro", "Studio", "Enterprise"
  slug String   @unique // "pro", "studio", "enterprise"
  plan PlanName // Links to the enum

  // Display
  description    String? @db.Text
  tagline        String? // Short marketing tagline
  badgeText      String? // e.g., "Most Popular", "Best Value"
  displayOrder   Int     @default(0) // For ordering on pricing page
  isHighlighted  Boolean @default(false) // Highlight this plan (e.g., recommended)
  highlightColor String? // Custom highlight color

  // Pricing (default pricing, can be overridden by variants)
  monthlyPriceCents Int // Base monthly price in cents
  yearlyPriceCents  Int // Base yearly price in cents (usually discounted)

  // Stripe Product & Prices (default)
  stripeProductId      String?   @unique // Stripe Product ID (prod_xxx)
  stripeMonthlyPriceId String? // Stripe Price ID for monthly (price_xxx)
  stripeYearlyPriceId  String? // Stripe Price ID for yearly (price_xxx)
  stripeSyncedAt       DateTime?

  // Trial configuration
  trialDays Int @default(14) // Free trial duration

  // Status
  isActive Boolean @default(true) // Available for new signups
  isPublic Boolean @default(true) // Visible on public pricing page
  isLegacy Boolean @default(false) // Old plan, grandfathered users only

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  features        PlanFeature[]
  pricingVariants PricingVariant[]

  @@index([isActive, isPublic])
  @@index([plan])
}

// Features included in each plan
model PlanFeature {
  id     String @id @default(cuid())
  planId String

  // Feature definition
  name        String // "Unlimited Galleries", "Priority Support"
  description String? // Detailed description
  category    String? // "Core", "Support", "Integrations", etc.

  // Value (for limits and quotas)
  featureKey   String // Unique key like "galleries_limit", "storage_gb", "team_members"
  featureValue String // Can be "unlimited", a number, or "true"/"false"

  // Display
  displayOrder  Int     @default(0)
  isHighlighted Boolean @default(false) // Show with emphasis
  tooltip       String? // Help text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  plan SubscriptionPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@unique([planId, featureKey])
  @@index([planId])
  @@index([featureKey])
}

// A/B Testing: Pricing experiments for testing different price points
model PricingExperiment {
  id   String @id @default(cuid())
  name String // "Q1 2025 Price Test", "Enterprise Discount Test"
  slug String @unique

  // Description
  description String? @db.Text
  hypothesis  String? @db.Text // What we're testing

  // Experiment configuration
  status    ExperimentStatus @default(draft)
  startDate DateTime?
  endDate   DateTime?

  // Traffic allocation
  trafficPercent Int @default(50) // Percent of traffic to see experiment (vs control)

  // Landing page targeting
  landingPagePaths String[] // e.g., ["/pricing", "/enterprise"] - which pages to run on

  // Results tracking
  controlConversions      Int     @default(0)
  controlImpressions      Int     @default(0)
  variantConversions      Int     @default(0)
  variantImpressions      Int     @default(0)
  winningVariantId        String?
  statisticalSignificance Float?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  variants PricingVariant[]

  @@index([status])
  @@index([startDate, endDate])
}

// Pricing variants for A/B testing different price points
model PricingVariant {
  id           String  @id @default(cuid())
  experimentId String?
  planId       String

  // Variant details
  name        String // "10% Discount", "Premium Pricing", "Control"
  description String?
  isControl   Boolean @default(false) // Is this the control variant?

  // Override pricing (null = use plan's default pricing)
  monthlyPriceCents Int?
  yearlyPriceCents  Int?

  // Override trial
  trialDays Int?

  // Stripe Prices for this variant
  stripeMonthlyPriceId String?
  stripeYearlyPriceId  String?
  stripeSyncedAt       DateTime?

  // Display overrides
  badgeText     String? // Override badge
  isHighlighted Boolean?

  // Stats
  impressions Int @default(0)
  conversions Int @default(0)

  // Status
  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  experiment PricingExperiment? @relation(fields: [experimentId], references: [id], onDelete: SetNull)
  plan       SubscriptionPlan   @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@index([experimentId])
  @@index([planId])
  @@index([isActive])
}

// ============================================================================
// EMAIL LOGGING SYSTEM
// ============================================================================

// Log of all emails sent from the system
model EmailLog {
  id             String @id @default(cuid())
  organizationId String

  // Recipient info
  toEmail  String
  toName   String?
  clientId String?

  // Email details
  emailType EmailType
  subject   String
  status    EmailStatus @default(pending)

  // Optional linking to related entities
  questionnaireId String?
  bookingId       String?
  projectId       String?
  invoiceId       String?
  contractId      String?
  galleryId       String?

  // Resend tracking
  resendId     String? // ID from Resend API
  errorMessage String? @db.Text

  // Timestamps
  sentAt      DateTime?
  deliveredAt DateTime?
  failedAt    DateTime?
  createdAt   DateTime  @default(now())

  // Relations
  organization  Organization         @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client        Client?              @relation(fields: [clientId], references: [id], onDelete: SetNull)
  questionnaire ClientQuestionnaire? @relation(fields: [questionnaireId], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@index([clientId])
  @@index([emailType])
  @@index([status])
  @@index([questionnaireId])
  @@index([createdAt])
}

// ============================================================================
// API KEYS & WEBHOOKS FOR INTEGRATIONS
// ============================================================================

// Webhook event types for external integrations
enum WebhookEventType {
  // Gallery events
  gallery_created
  gallery_delivered
  gallery_viewed
  gallery_paid
  // Booking events
  booking_created
  booking_confirmed
  booking_cancelled
  booking_completed
  // Invoice events
  invoice_created
  invoice_sent
  invoice_paid
  invoice_overdue
  // Payment events
  payment_received
  payment_failed
  payment_refunded
  // Client events
  client_created
  client_updated
  // Contract events
  contract_sent
  contract_signed
  // Project events
  project_created
  project_completed
}

// API keys for third-party integrations
model ApiKey {
  id             String    @id @default(cuid())
  organizationId String
  name           String // User-provided name for the key
  keyPrefix      String // Visible prefix (e.g., "sk_live_xxxx") for identification
  keyHash        String // SHA-256 hash of the full key (never store plaintext)
  lastUsedAt     DateTime?
  expiresAt      DateTime?
  scopes         String[]  @default(["read", "write"]) // Permissions: read, write, admin
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([organizationId, keyPrefix])
  @@index([organizationId])
  @@index([keyHash])
  @@index([isActive])
}

// Webhook endpoints for sending event notifications
model WebhookEndpoint {
  id             String    @id @default(cuid())
  organizationId String
  url            String // The URL to send webhook payloads to
  description    String? // Optional user description
  secret         String // HMAC signing secret for verification
  events         String[] // Array of WebhookEventType values to subscribe to
  isActive       Boolean   @default(true)
  lastDeliveryAt DateTime?
  failureCount   Int       @default(0) // Consecutive failures (reset on success)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  organization Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  deliveries   WebhookDelivery[]

  @@index([organizationId])
  @@index([isActive])
}

// Webhook delivery attempts for debugging and retry logic
model WebhookDelivery {
  id                String    @id @default(cuid())
  webhookEndpointId String
  eventType         String // The event that triggered this delivery
  payload           Json // The full payload that was sent
  responseStatus    Int? // HTTP status code from the receiver
  responseBody      String?   @db.Text // Response body (truncated if too large)
  deliveredAt       DateTime? // When the webhook was successfully delivered
  attemptCount      Int       @default(1) // Number of delivery attempts
  success           Boolean   @default(false)
  errorMessage      String? // Error message if delivery failed
  createdAt         DateTime  @default(now())

  endpoint WebhookEndpoint @relation(fields: [webhookEndpointId], references: [id], onDelete: Cascade)

  @@index([webhookEndpointId])
  @@index([createdAt])
  @@index([success])
}

// Integration activity logs for debugging and monitoring
model IntegrationLog {
  id             String   @id @default(cuid())
  organizationId String
  provider       String // Integration provider: google_calendar, dropbox, slack, stripe, etc.
  eventType      String // Event type: connected, disconnected, sync_started, sync_completed, error, etc.
  message        String // Human-readable description of the event
  details        Json? // Additional structured data about the event
  createdAt      DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([organizationId, provider])
  @@index([createdAt])
}

// ============================================================================
// UNIFIED EMAIL INBOX (Gmail/Outlook Integration)
// ============================================================================

// Connected email accounts for unified inbox
model EmailAccount {
  id             String @id @default(cuid())
  organizationId String

  // Provider info
  provider EmailProvider // GMAIL or OUTLOOK
  email    String // User's email address

  // OAuth tokens (encrypted in application layer)
  accessToken  String   @db.Text
  refreshToken String   @db.Text
  tokenExpiry  DateTime

  // Sync state
  syncCursor  String? // For incremental sync (Gmail historyId or Outlook deltaLink)
  lastSyncAt  DateTime?
  syncEnabled Boolean   @default(true)

  // Status
  isActive     Boolean @default(true)
  errorMessage String? // Last sync error if any

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  threads      EmailThread[]

  @@unique([organizationId, email])
  @@index([organizationId])
  @@index([provider])
  @@index([isActive])
}

// Email conversations (threads) - groups related messages together
model EmailThread {
  id             String @id @default(cuid())
  organizationId String
  emailAccountId String

  // Thread metadata
  subject           String
  snippet           String   @db.Text // Preview text of latest message
  participantEmails String[] // All email addresses in the thread

  // Client linking (auto-matched or manually linked)
  clientId String?

  // Status flags
  isRead     Boolean @default(false)
  isStarred  Boolean @default(false)
  isArchived Boolean @default(false)
  isDraft    Boolean @default(false)

  // Provider IDs for sync
  providerThreadId String // Gmail thread ID or Outlook conversation ID

  // Timestamps
  lastMessageAt DateTime
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  emailAccount EmailAccount   @relation(fields: [emailAccountId], references: [id], onDelete: Cascade)
  organization Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client       Client?        @relation("ClientEmailThreads", fields: [clientId], references: [id], onDelete: SetNull)
  messages     EmailMessage[]

  @@unique([emailAccountId, providerThreadId])
  @@index([organizationId])
  @@index([emailAccountId])
  @@index([clientId])
  @@index([isRead])
  @@index([isArchived])
  @@index([lastMessageAt])
}

// Individual email messages within a thread
model EmailMessage {
  id       String @id @default(cuid())
  threadId String

  // Provider ID for sync
  providerMessageId String // Gmail message ID or Outlook message ID

  // Message headers
  fromEmail  String
  fromName   String?
  toEmails   String[]
  toNames    String[]
  ccEmails   String[]
  bccEmails  String[]
  replyTo    String?
  subject    String
  inReplyTo  String? // Message-ID of parent message
  references String[] // Message-ID chain for threading

  // Message body
  bodyHtml String? @db.Text
  bodyText String? @db.Text

  // Direction
  direction EmailDirection // INBOUND or OUTBOUND

  // Status
  isRead Boolean @default(false)

  // Attachments
  hasAttachments Boolean @default(false)

  // Timestamps
  sentAt    DateTime
  createdAt DateTime @default(now())

  thread      EmailThread       @relation(fields: [threadId], references: [id], onDelete: Cascade)
  attachments EmailAttachment[]

  @@unique([threadId, providerMessageId])
  @@index([threadId])
  @@index([direction])
  @@index([sentAt])
  @@index([fromEmail])
}

// Email attachments stored in S3/Cloudflare R2
model EmailAttachment {
  id        String @id @default(cuid())
  messageId String

  // File info
  filename    String
  contentType String
  size        Int // Size in bytes

  // Storage
  storageKey String // S3/R2 key for the file
  storageUrl String? // Pre-signed URL (temporary) or public URL

  // Provider ID for sync
  providerAttachmentId String?

  createdAt DateTime @default(now())

  message EmailMessage @relation(fields: [messageId], references: [id], onDelete: Cascade)

  @@index([messageId])
}

// ============================================================================
// GALLERY ADD-ONS & UPSELLS
// ============================================================================

// Catalog of available add-ons that can be offered on galleries
model GalleryAddon {
  id             String @id @default(cuid())
  organizationId String

  // Add-on info
  name        String
  description String?
  iconName    String? // Icon identifier (lucide icon name)

  // Pricing
  priceCents   Int? // Base price in cents (null = "Request Quote")
  pricePerItem Boolean @default(false) // If true, price is per photo

  // Categorization
  category GalleryAddonCategory @default(other)

  // Industry targeting (null = available to all industries)
  industries ClientIndustry[] // Which industries this add-on applies to

  // Turnaround
  estimatedTurnaround String? // e.g., "24-48 hours", "3-5 business days"

  // Display
  sortOrder Int     @default(0)
  imageUrl  String? // Preview/sample image

  // Settings
  isActive          Boolean @default(true)
  requiresSelection Boolean @default(false) // Requires selecting specific photos
  maxPhotos         Int? // Maximum photos that can be selected (null = unlimited)

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization          @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  requests     GalleryAddonRequest[]

  @@index([organizationId])
  @@index([isActive])
  @@index([category])
}

// Client requests for gallery add-ons
model GalleryAddonRequest {
  id             String  @id @default(cuid())
  organizationId String
  projectId      String // The gallery
  addonId        String
  clientEmail    String? // Email of requesting client
  clientId       String? // If associated with a client record

  // Status
  status GalleryAddonRequestStatus @default(pending)

  // Request details
  notes          String?  @db.Text // Client notes/instructions
  selectedPhotos String[] // Asset IDs of selected photos (if requiresSelection)

  // Quote (filled by photographer)
  quoteCents       Int? // Quoted price
  quoteDescription String?   @db.Text // Quote details
  quotedAt         DateTime?

  // Approval
  approvedAt DateTime?
  declinedAt DateTime?

  // Completion
  completedAt  DateTime?
  deliveryNote String?   @db.Text // Note when delivering completed work

  // Invoice link
  invoiceId String? // If an invoice was created for this

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  addon        GalleryAddon @relation(fields: [addonId], references: [id], onDelete: Cascade)
  client       Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)
  invoice      Invoice?     @relation(fields: [invoiceId], references: [id], onDelete: SetNull)

  @@index([organizationId])
  @@index([projectId])
  @@index([addonId])
  @@index([clientId])
  @@index([status])
}
```

## Product Features (From README)
### Core Features (Implemented)
- **Client Management** - Full CRM with client profiles and history
- **Gallery Delivery** - Upload, organize, and deliver photo galleries
- **Invoicing & Payments** - Create invoices, accept payments via Stripe
- **Scheduling** - Book appointments with calendar management
- **Property Websites** - Generate single-property marketing sites
- **Client Portal** - Self-service portal for clients
- **Team Management** - Multi-user with roles and permissions
- **Equipment Tracking** - Manage photography gear inventory
- **Discount Codes** - Promotional codes with usage tracking
- **Payment Plans** - Installment-based payment options
- **Watermarking** - Configurable watermark settings
- **Analytics** - Revenue forecasting and client LTV metrics

### Recently Shipped
- **Equipment Checklists** - Per-booking-type equipment lists with check-off tracking
- **Multi-Day Events** - Support for weddings, conferences, and other multi-day events with session management
- **Buffer Time** - Automatic travel/prep time between bookings with conflict detection
- **Booking Reminders** - Automated email reminders 24h and 1h before sessions
- **Recurring Bookings** - Create repeating appointments (daily, weekly, biweekly, monthly, custom)
- **Command Palette** - Global search and navigation with K/Ctrl+K
- **Time-Off Management** - Request and approve team time-off with pending badges
- **Contract Templates** - Reusable contract templates with variables
- **Multi-Service Galleries** - Attach multiple services to a single gallery
- **Onboarding Checklist** - Guided setup for new organizations

### Roadmap

#### Phase 1: Scheduling & Automation (Q1 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Recurring Bookings | Create repeating appointments |  Shipped |
| Booking Reminders | SMS/email reminders (24h, 1h before) |  Shipped |
| Buffer Time | Automatic travel/prep time between bookings |  Shipped |
| Multi-Day Events | Support for weddings, conferences |  Shipped |
| Equipment Checklists | Per-booking-type equipment lists |  Shipped |
| Second Shooter Assignment | Team member scheduling per booking | Planned |
| Weather Integration | Forecast display on booking details | Planned |

#### Phase 2: Gallery & Delivery (Q1-Q2 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Bulk Upload | Drag & drop multi-file upload | Planned |
| AI Photo Culling | Smart selection suggestions | Planned |
| Watermark Templates | Multiple watermark presets | Planned |
| Client Favorites | Allow clients to mark favorites | Planned |
| Download Tracking | Per-photo download analytics | Planned |
| Gallery Expiration | Auto-expire gallery access | Planned |
| Password Protection | Optional gallery passwords | Planned |
| Photo Comments | Client feedback on photos | Planned |
| Lightroom Plugin | Direct gallery publishing | Planned |
| Slideshow Mode | Fullscreen client presentations | Planned |

#### Phase 3: Client Experience (Q2 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Client Portal v2 | Enhanced self-service portal | Planned |
| Communication Timeline | Full message history | Planned |
| Client Merge | Combine duplicate records | Planned |
| CSV Import | Bulk client import | Planned |
| Referral Tracking | Track client referrals | Planned |
| Birthday Reminders | Automated anniversary outreach | Planned |
| Satisfaction Surveys | Post-session feedback | Planned |
| Custom Fields | Organization-defined fields | Planned |
| VIP Tiers | Client segmentation levels | Planned |
| Preference Profiles | Style/location preferences | Planned |

#### Phase 4: Payments & Business (Q2-Q3 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Recurring Invoices | Subscription billing | Planned |
| Payment Installments | Multi-payment schedules | Planned |
| Late Payment Reminders | Automated follow-ups | Planned |
| PDF Customization | Custom invoice templates | Planned |
| Multi-Currency | International payments | Planned |
| Expense Tracking | Business expense logging | Planned |
| Profit Margins | Per-project profitability | Planned |
| Promo Codes | Promotional discounts | Planned |
| Tips/Gratuity | Client tip acceptance | Planned |
| Revenue Reports | Financial analytics | Planned |

#### Phase 5: Contracts & Legal (Q3 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| E-Signature Drawing | Touch/mouse signature capture | Planned |
| Contract Versioning | Track document changes | Planned |
| Model Releases | Built-in release templates | Planned |
| Venue Agreements | Location contract templates | Planned |
| Bulk Contract Send | Mass contract distribution | Planned |
| Open Rate Tracking | Contract view analytics | Planned |
| Expiration Alerts | Contract deadline notifications | Planned |
| Counter-Signatures | Multi-party signing | Planned |

#### Phase 6: Properties & Real Estate (Q3-Q4 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Virtual Tour Embed | 360deg tour integration | Planned |
| Floor Plans | Floorplan upload/display | Planned |
| Property Comparison | Side-by-side views | Planned |
| Lead Forms | Custom capture forms | Planned |
| Social Cards | Auto-generated share images | Planned |
| SEO Tools | Meta tag optimization | Planned |
| Custom Domains | Vanity URLs per property | Planned |
| MLS Integration | Listing data sync | Planned |
| Agent Branding | Co-branding options | Planned |

#### Phase 7: AI & Automation (Q4 2025)
| Feature | Description | Status |
|---------|-------------|--------|
| Workflow Builder | Visual automation designer | Planned |
| AI Descriptions | Auto-generate photo captions | Planned |
| Smart Pricing | Dynamic pricing suggestions | Planned |
| Auto Gallery Delivery | Trigger-based delivery | Planned |
| Email Personalization | Dynamic content insertion | Planned |
| Client Onboarding | Automated sequences | Planned |
| Task Automation | Rule-based task creation | Planned |
| Busy Period Predictions | Demand forecasting | Planned |
| AI Client Matching | Style-based matching | Planned |

#### Phase 8: Enterprise (2026)
| Feature | Description | Status |
|---------|-------------|--------|
| Public API | RESTful API access | Planned |
| Webhooks | Event notifications | Planned |
| White-Label | Custom branding | Planned |
| SSO/SAML | Enterprise authentication | Planned |
| Audit Logs | Compliance logging | Planned |
| Custom Roles | Granular permissions | Planned |
| Multi-Location | Branch management | Planned |
| Marketplace | Third-party integrations | Planned |

## Product Roadmap (From README)
## Onboarding System (From README-ONBOARDING.md)
# PhotoProOS Onboarding System

## Overview

A comprehensive multi-step onboarding wizard that personalizes the PhotoProOS experience based on industry selection, collects essential business information, and gates features/modules based on user preferences.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [Onboarding Flow](#onboarding-flow)
4. [Industry Modules](#industry-modules)
5. [Feature Gating](#feature-gating)
6. [Implementation Phases](#implementation-phases)
7. [File Structure](#file-structure)
8. [API Endpoints](#api-endpoints)
9. [Component Reference](#component-reference)

---

## Architecture

### High-Level Flow

```
Clerk Auth -> Onboarding Check -> Multi-Step Wizard -> Dashboard
                v
         (If incomplete)
                v
    /onboarding/[step] routes
```

### Key Principles

1. **Progressive Disclosure**: Show only relevant options based on previous selections
2. **Skippable Steps**: Payment is optional (with incentive for adding card)
3. **Resumable Progress**: Users can leave and return to continue onboarding
4. **Industry-First Design**: Real Estate is default, but all industries are equal
5. **Module Gating**: Sidebar and features adapt to selected industries

---

## Database Schema

### New Fields on `Organization` Model

```prisma
model Organization {
  // ... existing fields ...

  // Onboarding State
  onboardingCompleted    Boolean   @default(false)
  onboardingStep         Int       @default(0)
  onboardingCompletedAt  DateTime?

  // Industry Selection
  industries             String[]  @default(["real_estate"]) // Array of industry IDs
  primaryIndustry        String    @default("real_estate")

  // Enabled Modules (feature flags)
  enabledModules         String[]  @default([])

  // Business Profile (collected during onboarding)
  businessType           String?   // solo, team, agency
  teamSize               String?   // 1, 2-5, 6-10, 11-25, 25+
  annualRevenue          String?   // <50k, 50-100k, 100-250k, 250k+
  yearsInBusiness        String?   // <1, 1-3, 3-5, 5-10, 10+

  // Display Preferences
  displayMode            String    @default("company") // "personal" | "company"
  publicName             String?   // What clients see (company or personal name)
  publicEmail            String?   // Public-facing email
  publicPhone            String?   // Public-facing phone

  // Stripe Trial/Payment
  trialStartedAt         DateTime?
  trialEndsAt            DateTime?
  paymentMethodAdded     Boolean   @default(false)

  // Guided Tour Progress
  tourProgress           Json?     // { "dashboard": true, "galleries": false, ... }
}
```

### New Fields on `User` Model

```prisma
model User {
  // ... existing fields ...

  // Personal Info (collected during onboarding)
  firstName              String?
  lastName               String?
  phoneNumber            String?

  // Preferences
  hasSeenWelcome         Boolean   @default(false)
  tourCompletedModules   String[]  @default([])
}
```

### Industry Enum Reference

```typescript
export const INDUSTRIES = {
  real_estate: {
    id: "real_estate",
    name: "Real Estate & Property",
    description: "Residential, commercial, and architectural photography",
    icon: "Building2",
    modules: ["galleries", "scheduling", "invoices", "clients", "services", "properties"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients"],
  },
  commercial: {
    id: "commercial",
    name: "Commercial & Corporate",
    description: "Business headshots, office spaces, products",
    icon: "Briefcase",
    modules: ["galleries", "scheduling", "invoices", "clients", "services", "contracts"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients"],
  },
  events: {
    id: "events",
    name: "Events & Weddings",
    description: "Weddings, corporate events, parties",
    icon: "Calendar",
    modules: ["galleries", "scheduling", "invoices", "clients", "contracts", "questionnaires"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients", "contracts"],
  },
  portraits: {
    id: "portraits",
    name: "Portraits & Headshots",
    description: "Family portraits, senior photos, professional headshots",
    icon: "User",
    modules: ["galleries", "scheduling", "invoices", "clients", "services"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients"],
  },
  food: {
    id: "food",
    name: "Food & Hospitality",
    description: "Restaurant, menu, and culinary photography",
    icon: "UtensilsCrossed",
    modules: ["galleries", "scheduling", "invoices", "clients", "services"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients"],
  },
  product: {
    id: "product",
    name: "Product & E-commerce",
    description: "Product shots, catalog, and e-commerce imagery",
    icon: "Package",
    modules: ["galleries", "scheduling", "invoices", "clients", "services"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients"],
  },
} as const;
```

---

## Onboarding Flow

### Step-by-Step Breakdown

| Step | Route | Title | Description |
|------|-------|-------|-------------|
| 0 | `/onboarding` | Welcome | Animated welcome screen with value proposition |
| 1 | `/onboarding/profile` | Personal Profile | First name, last name, phone (from Clerk if available) |
| 2 | `/onboarding/business` | Business Identity | Company name, type, team size |
| 3 | `/onboarding/branding` | Public Presence | Display mode (personal/company), public contact info |
| 4 | `/onboarding/industries` | Industry Selection | Multi-select industries, pick primary |
| 5 | `/onboarding/features` | Feature Selection | Checkboxes for modules based on industries |
| 6 | `/onboarding/goals` | Business Goals | What they want to achieve (optional) |
| 7 | `/onboarding/payment` | Payment Setup | Stripe card (skippable with incentive) |
| 8 | `/onboarding/complete` | All Set! | Summary + start guided tour option |

### Step Details

#### Step 0: Welcome
- Animated logo/illustration
- "Welcome to PhotoProOS" headline
- 3 value propositions with icons
- "Get Started" CTA

#### Step 1: Personal Profile
```typescript
interface PersonalProfileData {
  firstName: string;      // Required
  lastName: string;       // Required
  phoneNumber?: string;   // Optional
}
```
- Pre-fill from Clerk if available
- Avatar upload option

#### Step 2: Business Identity
```typescript
interface BusinessIdentityData {
  companyName?: string;   // Optional if solo
  businessType: "solo" | "team" | "agency";
  teamSize: "1" | "2-5" | "6-10" | "11-25" | "25+";
  yearsInBusiness?: string;
}
```
- Show/hide company name based on business type
- Team size affects feature recommendations

#### Step 3: Public Presence
```typescript
interface PublicPresenceData {
  displayMode: "personal" | "company";
  publicName: string;     // Auto-filled based on mode
  publicEmail?: string;
  publicPhone?: string;
  website?: string;
}
```
- Preview of how clients will see their branding
- Toggle between personal name vs company name

#### Step 4: Industry Selection
```typescript
interface IndustrySelectionData {
  industries: string[];   // At least one required
  primaryIndustry: string;
}
```
- Card-based multi-select
- Visual icons for each industry
- "Primary" badge on selected primary
- Real Estate pre-selected by default

#### Step 5: Feature Selection
```typescript
interface FeatureSelectionData {
  enabledModules: string[];
}
```
- Grouped by category
- Some auto-enabled based on industry
- Show which industries unlock each feature
- Descriptions and mini-previews

#### Step 6: Business Goals (Optional)
```typescript
interface BusinessGoalsData {
  goals: string[];        // Multi-select
  annualRevenue?: string;
  monthlyBookings?: string;
}
```
- "What do you want to achieve?"
- Options: More bookings, Faster payments, Better organization, etc.
- Helps with personalized tips later

#### Step 7: Payment Setup
```typescript
interface PaymentSetupData {
  skipPayment: boolean;
  paymentMethodId?: string;
}
```
- Stripe Elements for card input
- "Add card for 30-day free trial" vs "Start 14-day trial"
- Incentive: Extra trial days for adding card
- Clear skip option

#### Step 8: Complete
- Confetti animation
- Summary of selections
- "Start Guided Tour" CTA
- "Go to Dashboard" secondary option

---

## Industry Modules

Each industry has its own README with specific features and configurations:

| Industry | README | Primary Modules |
|----------|--------|-----------------|
| Real Estate | [README-MODULE-REAL-ESTATE.md](./README-MODULE-REAL-ESTATE.md) | Properties, Galleries, Scheduling |
| Commercial | [README-MODULE-COMMERCIAL.md](./README-MODULE-COMMERCIAL.md) | Contracts, Galleries, Invoicing |
| Events | [README-MODULE-EVENTS.md](./README-MODULE-EVENTS.md) | Contracts, Questionnaires, Galleries |
| Portraits | [README-MODULE-PORTRAITS.md](./README-MODULE-PORTRAITS.md) | Scheduling, Galleries, Mini-Sessions |
| Food | [README-MODULE-FOOD.md](./README-MODULE-FOOD.md) | Galleries, Invoicing, Licensing |
| Product | [README-MODULE-PRODUCT.md](./README-MODULE-PRODUCT.md) | Galleries, Batch Processing, Licensing |

---

## Feature Gating

### How Module Gating Works

```typescript
// src/lib/modules/gating.ts

export function isModuleEnabled(
  organization: Organization,
  moduleId: string
): boolean {
  // Core modules always enabled
  if (CORE_MODULES.includes(moduleId)) return true;

  // Check explicit enablement
  return organization.enabledModules.includes(moduleId);
}

export function getEnabledModules(organization: Organization): string[] {
  return [...CORE_MODULES, ...organization.enabledModules];
}

export function getAvailableModules(organization: Organization): Module[] {
  // Returns all modules available based on selected industries
  const industryModules = organization.industries.flatMap(
    (ind) => INDUSTRIES[ind].modules
  );
  return [...new Set(industryModules)];
}
```

### Core Modules (Always Enabled)

These modules cannot be disabled:
- `dashboard` - Main dashboard
- `settings` - Account settings
- `clients` - Client management (basic)

### Industry-Specific Modules

| Module | Real Estate | Commercial | Events | Portraits | Food | Product |
|--------|-------------|------------|--------|-----------|------|---------|
| Galleries | [x] | [x] | [x] | [x] | [x] | [x] |
| Scheduling | [x] | [x] | [x] | [x] | [x] | [x] |
| Invoices | [x] | [x] | [x] | [x] | [x] | [x] |
| Services | [x] | [x] | [x] | [x] | [x] | [x] |
| Properties | [x] | - | - | - | - | - |
| Contracts | - | [x] | [x] | - | - | - |
| Questionnaires | - | - | [x] | - | - | - |
| Mini-Sessions | - | - | - | [x] | - | - |
| Licensing | - | - | - | - | [x] | [x] |
| Batch Processing | - | - | - | - | - | [x] |

### Sidebar Navigation Gating

```typescript
// src/components/layout/sidebar.tsx

const navigationItems = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: Home, alwaysShow: true },
  { id: "galleries", label: "Galleries", href: "/galleries", icon: Images },
  { id: "scheduling", label: "Scheduling", href: "/scheduling", icon: Calendar },
  { id: "clients", label: "Clients", href: "/clients", icon: Users },
  { id: "invoices", label: "Invoices", href: "/invoices", icon: FileText },
  { id: "services", label: "Services", href: "/services", icon: Tag },
  { id: "properties", label: "Properties", href: "/properties", icon: Building2 },
  { id: "contracts", label: "Contracts", href: "/contracts", icon: FileSignature },
  // ... more items
];

// Filter based on enabled modules
const visibleItems = navigationItems.filter(
  (item) => item.alwaysShow || isModuleEnabled(organization, item.id)
);
```

---

## Implementation Phases

### Phase 1: Database & Schema (Day 1)

1. Add new fields to Prisma schema
2. Run migration
3. Create industry constants file
4. Create module constants file

**Files to create/modify:**
- `prisma/schema.prisma`
- `src/lib/constants/industries.ts`
- `src/lib/constants/modules.ts`
- `src/lib/modules/gating.ts`

### Phase 2: Onboarding Routes & Layout (Day 1-2)

1. Create `/onboarding` route group
2. Build onboarding layout with progress indicator
3. Create step components
4. Implement step navigation logic

**Files to create:**
- `src/app/(onboarding)/layout.tsx`
- `src/app/(onboarding)/onboarding/page.tsx`
- `src/app/(onboarding)/onboarding/[step]/page.tsx`
- `src/components/onboarding/onboarding-layout.tsx`
- `src/components/onboarding/progress-indicator.tsx`
- `src/components/onboarding/step-navigation.tsx`

### Phase 3: Step Components (Day 2-3)

1. Build each step component
2. Add form validation
3. Implement auto-save

**Files to create:**
- `src/components/onboarding/steps/welcome-step.tsx`
- `src/components/onboarding/steps/profile-step.tsx`
- `src/components/onboarding/steps/business-step.tsx`
- `src/components/onboarding/steps/branding-step.tsx`
- `src/components/onboarding/steps/industries-step.tsx`
- `src/components/onboarding/steps/features-step.tsx`
- `src/components/onboarding/steps/goals-step.tsx`
- `src/components/onboarding/steps/payment-step.tsx`
- `src/components/onboarding/steps/complete-step.tsx`

### Phase 4: Server Actions (Day 3)

1. Create onboarding actions
2. Implement step save logic
3. Add completion handler

**Files to create:**
- `src/lib/actions/onboarding.ts`

### Phase 5: Middleware & Redirects (Day 3-4)

1. Add onboarding check to middleware
2. Redirect incomplete users to onboarding
3. Prevent completed users from accessing onboarding

**Files to modify:**
- `src/middleware.ts`

### Phase 6: Stripe Integration (Day 4)

1. Add Stripe Elements to payment step
2. Implement card save logic
3. Set up trial period

**Files to create/modify:**
- `src/components/onboarding/steps/payment-step.tsx`
- `src/lib/stripe/setup-intent.ts`

### Phase 7: Sidebar Gating (Day 4-5)

1. Update sidebar to use module gating
2. Add "locked" state for disabled modules
3. Update page guards

**Files to modify:**
- `src/components/layout/sidebar.tsx`
- Add route protection to gated pages

### Phase 8: Settings Management (Day 5)

1. Add industries/modules to settings
2. Allow adding industries back
3. Allow enabling/disabling modules

**Files to create:**
- `src/app/(dashboard)/settings/industries/page.tsx`
- `src/app/(dashboard)/settings/modules/page.tsx`

### Phase 9: Guided Tour (Day 5-6)

1. Implement tour system
2. Create tour steps for each module
3. Track completion

**Files to create:**
- `src/components/tour/tour-provider.tsx`
- `src/components/tour/tour-tooltip.tsx`
- `src/lib/tour/steps.ts`

### Phase 10: Testing & Polish (Day 6)

1. End-to-end testing
2. Mobile responsiveness
3. Animation polish
4. Edge case handling

---

## File Structure

```
src/
|--- app/
|   |--- (onboarding)/
|   |   |--- layout.tsx                    # Onboarding-specific layout
|   |   `--- onboarding/
|   |       |--- page.tsx                  # Welcome step (step 0)
|   |       `--- [step]/
|   |           `--- page.tsx              # Dynamic step pages
|   `--- (dashboard)/
|       `--- settings/
|           |--- industries/
|           |   `--- page.tsx              # Manage industries
|           `--- modules/
|               `--- page.tsx              # Manage modules
|--- components/
|   |--- onboarding/
|   |   |--- onboarding-layout.tsx         # Main onboarding wrapper
|   |   |--- progress-indicator.tsx        # Step progress bar
|   |   |--- step-navigation.tsx           # Next/Back buttons
|   |   `--- steps/
|   |       |--- welcome-step.tsx
|   |       |--- profile-step.tsx
|   |       |--- business-step.tsx
|   |       |--- branding-step.tsx
|   |       |--- industries-step.tsx
|   |       |--- features-step.tsx
|   |       |--- goals-step.tsx
|   |       |--- payment-step.tsx
|   |       `--- complete-step.tsx
|   `--- tour/
|       |--- tour-provider.tsx
|       `--- tour-tooltip.tsx
|--- lib/
|   |--- constants/
|   |   |--- industries.ts                 # Industry definitions
|   |   `--- modules.ts                    # Module definitions
|   |--- modules/
|   |   `--- gating.ts                     # Module gating logic
|   |--- actions/
|   |   `--- onboarding.ts                 # Onboarding server actions
|   `--- tour/
|       `--- steps.ts                      # Tour step definitions
`--- middleware.ts                         # Updated with onboarding check
```

---

## API Endpoints

### Server Actions

| Action | Description |
|--------|-------------|
| `saveOnboardingStep` | Save progress for current step |
| `completeOnboarding` | Mark onboarding as complete |
| `updateIndustries` | Update selected industries |
| `updateModules` | Update enabled modules |
| `skipOnboardingPayment` | Skip payment step |
| `startGuidedTour` | Initialize tour for user |
| `completeTourStep` | Mark tour step as complete |

### Action Signatures

```typescript
// src/lib/actions/onboarding.ts

export async function saveOnboardingStep(
  step: number,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }>;

export async function completeOnboarding(): Promise<{
  success: boolean;
  redirectTo: string;
}>;

export async function updateIndustries(
  industries: string[],
  primaryIndustry: string
): Promise<{ success: boolean }>;

export async function updateModules(
  modules: string[]
): Promise<{ success: boolean }>;
```

---

## Component Reference

### OnboardingLayout

Main wrapper for all onboarding steps.

```typescript
interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canSkip: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}
```

### ProgressIndicator

Shows progress through onboarding steps.

```typescript
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}
```

### IndustryCard

Selectable card for industry selection.

```typescript
interface IndustryCardProps {
  industry: Industry;
  isSelected: boolean;
  isPrimary: boolean;
  onSelect: () => void;
  onSetPrimary: () => void;
}
```

### ModuleCheckbox

Checkbox for module selection.

```typescript
interface ModuleCheckboxProps {
  module: Module;
  isEnabled: boolean;
  isLocked: boolean;      // If required by industry
  industries: string[];   // Which industries include this
  onChange: (enabled: boolean) => void;
}
```

---

## Testing Checklist

- [ ] New user is redirected to onboarding
- [ ] Returning incomplete user resumes at last step
- [ ] Completed user cannot access onboarding
- [ ] All steps save progress correctly
- [ ] Back/Next navigation works
- [ ] Skip payment works with correct trial period
- [ ] Industries affect available modules
- [ ] Sidebar shows only enabled modules
- [ ] Settings allow changing industries
- [ ] Settings allow enabling/disabling modules
- [ ] Guided tour starts correctly
- [ ] Tour progress is tracked
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard nav, screen readers)

---

## Related Documentation

- [README-MODULE-REAL-ESTATE.md](./README-MODULE-REAL-ESTATE.md)
- [README-MODULE-COMMERCIAL.md](./README-MODULE-COMMERCIAL.md)
- [README-MODULE-EVENTS.md](./README-MODULE-EVENTS.md)
- [README-MODULE-PORTRAITS.md](./README-MODULE-PORTRAITS.md)
- [README-MODULE-FOOD.md](./README-MODULE-FOOD.md)
- [README-MODULE-PRODUCT.md](./README-MODULE-PRODUCT.md)

## Industry Modules (From README-MODULE-*.md)

### README-MODULE-REAL-ESTATE.md

# Real Estate & Property Module

## Overview

The Real Estate module is the default and most comprehensive industry option in PhotoProOS. It includes specialized features for property photography including MLS integration, property details auto-population, and real estate-specific gallery templates.

---

## Module ID

```
real_estate
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Photo delivery with pay-to-unlock | Enabled |
| Scheduling | Booking calendar with travel time | Enabled |
| Invoices | Billing and payment collection | Enabled |
| Clients | Contact management (agents, brokers) | Enabled |
| Services | Package definitions with pricing | Enabled |
| Properties | Property database with details | Enabled |
| Travel Calculations | Mileage-based pricing | Enabled |
| Weather Integration | Shoot day forecasts | Enabled |

---

## Unique Features

### 1. Property Database

Store and manage property details:

```typescript
interface Property {
  id: string;
  address: string;
  mlsNumber?: string;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  listingPrice?: number;
  listingAgent?: Client;
  features: string[];
}

type PropertyType =
  | "single_family"
  | "condo"
  | "townhouse"
  | "multi_family"
  | "land"
  | "commercial";
```

### 2. MLS Integration (Future)

- Auto-populate property details from MLS number
- Sync listing status
- Pull comparable properties

### 3. Real Estate Gallery Templates

Pre-built gallery layouts optimized for:
- Front exterior hero shot
- Room-by-room organization
- Virtual tour embed
- Floor plan section
- Drone/aerial section

### 4. Agent/Broker Client Types

```typescript
interface RealEstateClient extends Client {
  clientType: "agent" | "broker" | "team" | "brokerage";
  license?: string;
  brokerage?: string;
  preferredTurnaround?: number; // hours
}
```

### 5. Package Suggestions

Based on property square footage:

| Sq Ft | Suggested Package |
|-------|-------------------|
| < 1,500 | Basic (15-20 photos) |
| 1,500 - 3,000 | Standard (25-35 photos) |
| 3,000 - 5,000 | Premium (40-50 photos) |
| > 5,000 | Luxury (50+ photos) |

---

## Service Templates

Pre-configured services for real estate photography:

### Basic Package
```typescript
{
  name: "Basic Photography",
  description: "Perfect for smaller properties",
  basePrice: 15000, // $150
  estimatedDuration: 60,
  deliverables: ["15-20 edited photos", "24-hour turnaround"],
  propertySize: "< 1,500 sq ft"
}
```

### Standard Package
```typescript
{
  name: "Standard Photography",
  description: "Our most popular package",
  basePrice: 22500, // $225
  estimatedDuration: 90,
  deliverables: ["25-35 edited photos", "24-hour turnaround", "Twilight shot"],
  propertySize: "1,500 - 3,000 sq ft"
}
```

### Premium Package
```typescript
{
  name: "Premium Photography",
  description: "Comprehensive coverage for larger homes",
  basePrice: 35000, // $350
  estimatedDuration: 120,
  deliverables: ["40-50 edited photos", "Same-day turnaround", "Twilight shot", "Drone aerial"],
  propertySize: "3,000 - 5,000 sq ft"
}
```

### Luxury Package
```typescript
{
  name: "Luxury Photography",
  description: "Full-service for luxury properties",
  basePrice: 55000, // $550
  estimatedDuration: 180,
  deliverables: ["50+ edited photos", "Same-day turnaround", "Twilight series", "Drone video", "Virtual tour"],
  propertySize: "> 5,000 sq ft"
}
```

### Add-On Services
- Drone/Aerial Photography: $100
- Twilight Photography: $75
- Virtual Tour (Matterport): $150
- Floor Plans: $75
- Video Walkthrough: $200

---

## Booking Flow Customizations

### Step 1: Client Selection
- Show agent's recent properties
- Option to add new listing

### Step 2: Property Details
- Address autocomplete
- Property type selection
- Auto-fetch details if MLS provided
- Square footage for package recommendation

### Step 3: Service Selection
- Package recommendation based on sq ft
- Add-on upsells
- Travel fee calculation

### Step 4: Scheduling
- Weather forecast display
- Golden hour recommendations
- Agent availability check

---

## Gallery Customizations

### Real Estate Gallery Layout

```typescript
interface RealEstateGallerySection {
  id: string;
  title: string;
  order: number;
  photos: Photo[];
}

const defaultSections: RealEstateGallerySection[] = [
  { id: "exterior", title: "Exterior", order: 1 },
  { id: "living", title: "Living Areas", order: 2 },
  { id: "kitchen", title: "Kitchen & Dining", order: 3 },
  { id: "bedrooms", title: "Bedrooms", order: 4 },
  { id: "bathrooms", title: "Bathrooms", order: 5 },
  { id: "outdoor", title: "Outdoor Spaces", order: 6 },
  { id: "aerial", title: "Aerial Views", order: 7 },
];
```

### MLS-Ready Export

- Automatic resize to MLS specs
- Watermark removal for paid galleries
- ZIP download with MLS-compliant naming

---

## Invoice Customizations

### Line Item Types
- Photography package
- Add-on services
- Travel fee (auto-calculated)
- Rush delivery fee
- Reshoots

### Payment Terms
- Default: Due on delivery
- Option: Pay before unlock
- Split payment: 50% deposit

---

## Settings (Module-Specific)

Located at `/settings/real-estate`:

| Setting | Description | Default |
|---------|-------------|---------|
| Default turnaround | Hours after shoot | 24 |
| Travel fee per mile | Cents per mile | 65 |
| Free travel radius | Miles | 15 |
| Auto-suggest packages | Based on sq ft | true |
| MLS export size | Pixels (long edge) | 3000 |
| Watermark on previews | Enable/disable | true |

---

## Dashboard Widgets

### Recent Properties
- Last 5 properties photographed
- Quick link to gallery
- Status indicator

### Agent Performance
- Top agents by booking count
- Revenue by agent
- Average turnaround time

### Upcoming Shoots
- Weather forecast
- Travel time
- Property details preview

---

## Integration Points

### External Integrations (Future)
- MLS systems (IDX)
- Real estate CRMs (Follow Up Boss, kvCORE)
- Scheduling tools (Calendly, ShowingTime)

### Internal Integrations
- Google Maps for travel
- Weather API for forecasts
- Stripe for payments

---

## Implementation Checklist

### Phase 1: Core Features
- [x] Property database model
- [x] Property CRUD actions
- [x] Property list page
- [x] Property detail page
- [ ] Property form with address autocomplete

### Phase 2: Booking Integration
- [ ] Package suggestion engine
- [ ] Travel fee calculation
- [ ] Weather forecast display
- [ ] Property selection in booking

### Phase 3: Gallery Features
- [ ] Section-based organization
- [ ] MLS export functionality
- [ ] Property details in gallery view

### Phase 4: Advanced Features
- [ ] MLS auto-population
- [ ] Agent performance analytics
- [ ] Bulk property import

---

## API Reference

### Server Actions

```typescript
// Properties
createProperty(data: CreatePropertyInput): Promise<Property>
updateProperty(id: string, data: UpdatePropertyInput): Promise<Property>
deleteProperty(id: string): Promise<void>
getPropertyByAddress(address: string): Promise<Property | null>
suggestPackage(squareFeet: number): Promise<Service>

// MLS Integration
fetchMlsDetails(mlsNumber: string): Promise<PropertyDetails>
syncMlsStatus(propertyId: string): Promise<void>
```

### Types

```typescript
// src/lib/types/real-estate.ts

export interface Property {
  id: string;
  organizationId: string;
  address: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  mlsNumber?: string;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  listingPrice?: number;
  listingAgentId?: string;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyType =
  | "single_family"
  | "condo"
  | "townhouse"
  | "multi_family"
  | "land"
  | "commercial";
```

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Travel & Location System](./docs/travel-system.md) - Travel fee calculations
- [Weather Integration](./docs/weather-integration.md) - Forecast features

### README-MODULE-COMMERCIAL.md

# Commercial & Corporate Module

## Overview

The Commercial module is designed for photographers serving businesses with headshots, office photography, product shots, and corporate event coverage. Features emphasize contracts, licensing, and corporate client management.

---

## Module ID

```
commercial
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Photo delivery with licensing options | Enabled |
| Scheduling | Corporate booking with contact management | Enabled |
| Invoices | Net-30/60 payment terms | Enabled |
| Clients | Company + contact hierarchies | Enabled |
| Services | Corporate packages with usage rights | Enabled |
| Contracts | Digital signing and licensing | Enabled |
| Multi-Contact | Multiple contacts per company | Enabled |

---

## Unique Features

### 1. Company + Contact Hierarchy

```typescript
interface CorporateClient {
  id: string;
  type: "company";
  companyName: string;
  industry?: string;
  website?: string;
  billingAddress?: Address;
  contacts: CorporateContact[];
  defaultPaymentTerms: "due_on_receipt" | "net_15" | "net_30" | "net_60";
}

interface CorporateContact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  department?: string;
  isPrimary: boolean;
  canApproveInvoices: boolean;
}
```

### 2. Licensing & Usage Rights

Define how images can be used:

```typescript
interface LicenseTerms {
  type: "limited" | "unlimited" | "exclusive";
  duration: "1_year" | "3_year" | "perpetual";
  territory: "local" | "national" | "worldwide";
  usage: LicenseUsage[];
  exclusivity: boolean;
  transferable: boolean;
}

type LicenseUsage =
  | "web"
  | "social_media"
  | "print"
  | "advertising"
  | "editorial"
  | "internal"
  | "broadcast";
```

### 3. Corporate Contracts

Pre-built contract templates:
- Photography Agreement
- Model/Property Release
- Usage License Agreement
- Non-Disclosure Agreement

### 4. Batch Headshot Sessions

Manage multi-person shoots:

```typescript
interface HeadshotSession {
  id: string;
  companyId: string;
  date: Date;
  location: string;
  subjects: HeadshotSubject[];
  packagePerPerson: Service;
  totalPrice: number;
}

interface HeadshotSubject {
  id: string;
  name: string;
  email?: string;
  department?: string;
  scheduled: boolean;
  timeSlot?: string;
  photographed: boolean;
  approved: boolean;
  selectedPhotos: string[];
}
```

---

## Service Templates

### Headshot Packages

```typescript
// Individual Headshot
{
  name: "Professional Headshot",
  description: "Single executive headshot session",
  basePrice: 25000, // $250
  estimatedDuration: 30,
  deliverables: ["3 retouched images", "Web + print resolution"],
  includes: ["Basic retouching", "Background options"]
}

// Group Headshots (per person pricing)
{
  name: "Corporate Headshots",
  description: "Per-person rate for group sessions",
  basePrice: 15000, // $150 per person
  minimumQuantity: 5,
  estimatedDuration: 15, // per person
  deliverables: ["2 retouched images per person"],
  volumeDiscounts: [
    { quantity: 10, discount: 10 },
    { quantity: 25, discount: 15 },
    { quantity: 50, discount: 20 }
  ]
}
```

### Corporate Photography

```typescript
// Office/Environment
{
  name: "Office Photography",
  description: "Workplace and environment shots",
  basePrice: 150000, // $1,500
  estimatedDuration: 240,
  deliverables: ["40-60 edited images", "Interior + exterior"],
  usage: ["web", "print", "social_media"]
}

// Event Coverage
{
  name: "Corporate Event",
  description: "Business events, conferences, meetings",
  basePrice: 200000, // $2,000
  estimatedDuration: 480, // 8 hours
  deliverables: ["100+ edited images", "Same-week delivery"],
  additionalHourRate: 30000 // $300/hr
}
```

---

## Booking Flow Customizations

### Step 1: Company Selection
- Search existing companies
- Add new company with contacts
- Select billing contact

### Step 2: Project Type
- Headshots (individual/group)
- Office/environment
- Event coverage
- Product photography

### Step 3: Details (varies by type)

**For Headshots:**
- Number of subjects
- On-site vs studio
- Background preferences

**For Office:**
- Location(s)
- Specific areas needed
- Employee model releases

**For Events:**
- Event details
- Coverage hours
- Key moments list

### Step 4: Contract & Licensing
- Select contract template
- Define usage rights
- Send for signature

---

## Invoice Customizations

### Payment Terms

```typescript
type PaymentTerms =
  | "due_on_receipt"
  | "net_15"
  | "net_30"
  | "net_60"
  | "50_50_split"; // 50% deposit, 50% on delivery

interface CorporateInvoice extends Invoice {
  paymentTerms: PaymentTerms;
  purchaseOrderNumber?: string;
  billingContact: CorporateContact;
  licenseTerms?: LicenseTerms;
}
```

### Purchase Order Support
- PO number field
- PO document upload
- Reference on invoice

### Corporate Line Items
- Day rate options
- Per-person pricing
- Licensing fees
- Rush delivery surcharge

---

## Contract Features

### Template Library

| Template | Use Case |
|----------|----------|
| Photography Agreement | Main service contract |
| Model Release | Employee headshot consent |
| Property Release | Office/location permission |
| Usage License | Image licensing terms |
| NDA | Confidential projects |

### Digital Signing

```typescript
interface Contract {
  id: string;
  templateId: string;
  clientId: string;
  projectId?: string;
  status: "draft" | "sent" | "viewed" | "signed" | "expired";
  sentAt?: Date;
  viewedAt?: Date;
  signedAt?: Date;
  signerName?: string;
  signerEmail?: string;
  signatureImage?: string;
  ipAddress?: string;
}
```

### Variable Substitution

```typescript
const contractVariables = {
  "{{client_name}}": client.companyName,
  "{{client_contact}}": contact.fullName,
  "{{project_date}}": booking.date,
  "{{project_description}}": booking.description,
  "{{total_amount}}": formatCurrency(invoice.total),
  "{{usage_rights}}": formatLicenseTerms(license),
  "{{photographer_name}}": organization.name,
  "{{today_date}}": formatDate(new Date()),
};
```

---

## Gallery Customizations

### Corporate Gallery Features
- Password protection
- Download tracking
- Expiration dates
- Per-image licensing display

### Approval Workflow

```typescript
interface GalleryApproval {
  galleryId: string;
  approverEmail: string;
  approverName: string;
  status: "pending" | "approved" | "revision_requested";
  approvedAt?: Date;
  comments?: string;
  selectedImages?: string[];
}
```

---

## Settings (Module-Specific)

Located at `/settings/commercial`:

| Setting | Description | Default |
|---------|-------------|---------|
| Default payment terms | Invoice due date | net_30 |
| Require PO number | For invoices | false |
| Default license type | Usage rights | limited |
| License duration | Default term | 1_year |
| Auto-send contracts | On booking | true |
| Watermark corporate | Preview images | true |

---

## Dashboard Widgets

### Active Contracts
- Pending signatures
- Recently signed
- Expiring soon

### Corporate Pipeline
- Upcoming shoots
- Pending invoices
- Outstanding balance

### Top Clients
- Revenue by company
- Booking frequency
- Average project size

---

## Implementation Checklist

### Phase 1: Client Hierarchy
- [ ] Company model with contacts
- [ ] Contact roles and permissions
- [ ] Company list/detail pages
- [ ] Contact management UI

### Phase 2: Contracts
- [ ] Contract template system
- [ ] Variable substitution
- [ ] Digital signature capture
- [ ] Email notifications

### Phase 3: Licensing
- [ ] License terms model
- [ ] License selection UI
- [ ] License display in gallery
- [ ] License agreement generation

### Phase 4: Corporate Features
- [ ] Batch headshot sessions
- [ ] Group booking flow
- [ ] PO number support
- [ ] Payment terms options

---

## API Reference

### Server Actions

```typescript
// Companies
createCompany(data: CreateCompanyInput): Promise<Company>
updateCompany(id: string, data: UpdateCompanyInput): Promise<Company>
addCompanyContact(companyId: string, contact: ContactInput): Promise<Contact>
setPrimaryContact(companyId: string, contactId: string): Promise<void>

// Contracts
createContract(data: CreateContractInput): Promise<Contract>
sendContract(contractId: string): Promise<void>
recordSignature(contractId: string, signature: SignatureInput): Promise<Contract>
getContractPdf(contractId: string): Promise<Buffer>

// Licensing
createLicense(data: CreateLicenseInput): Promise<License>
attachLicenseToGallery(galleryId: string, licenseId: string): Promise<void>
```

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Contracts System](./docs/contracts.md) - Contract management details
- [Licensing Guide](./docs/licensing.md) - Usage rights configuration

### README-MODULE-EVENTS.md

# Events & Weddings Module

## Overview

The Events module is built for photographers covering weddings, parties, corporate events, and special occasions. Key features include questionnaires, timelines, contracts, and multi-day event management.

---

## Module ID

```
events
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Event galleries with guest access | Enabled |
| Scheduling | Multi-day event booking | Enabled |
| Invoices | Deposit-based payment plans | Enabled |
| Clients | Couples + event contacts | Enabled |
| Contracts | Wedding/event agreements | Enabled |
| Questionnaires | Pre-event detail collection | Enabled |
| Timelines | Event day schedules | Enabled |

---

## Unique Features

### 1. Event Questionnaires

Collect details before the event:

```typescript
interface Questionnaire {
  id: string;
  bookingId: string;
  templateId: string;
  status: "draft" | "sent" | "in_progress" | "completed";
  sentAt?: Date;
  completedAt?: Date;
  responses: QuestionnaireResponse[];
}

interface QuestionnaireResponse {
  questionId: string;
  answer: string | string[] | boolean | number;
}

// Pre-built question types
type QuestionType =
  | "text"
  | "long_text"
  | "select"
  | "multi_select"
  | "date"
  | "time"
  | "number"
  | "boolean"
  | "contact_list"    // List of people (bridal party, etc.)
  | "shot_list"       // Requested photos
  | "vendor_list";    // Other vendors
```

### 2. Event Timelines

Build and share event schedules:

```typescript
interface EventTimeline {
  id: string;
  bookingId: string;
  events: TimelineEvent[];
  sharedWith: string[];  // Emails with view access
  lastUpdated: Date;
}

interface TimelineEvent {
  id: string;
  time: string;         // "14:30"
  endTime?: string;     // "15:00"
  title: string;
  location?: string;
  notes?: string;
  participants?: string[];
  photographerRequired: boolean;
}
```

### 3. Multi-Day Events

Support events spanning multiple days:

```typescript
interface MultiDayBooking {
  id: string;
  clientId: string;
  eventName: string;
  days: EventDay[];
  totalPrice: number;
  depositPaid: boolean;
}

interface EventDay {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  description: string;  // "Rehearsal Dinner", "Ceremony", etc.
  services: Service[];
}
```

### 4. Wedding-Specific Client Model

```typescript
interface WeddingClient extends Client {
  type: "couple";
  partner1: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  partner2: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  weddingDate?: Date;
  venue?: string;
  weddingPartySize?: number;
  guestCount?: number;
}
```

---

## Service Templates

### Wedding Packages

```typescript
// Elopement
{
  name: "Elopement Package",
  description: "Intimate ceremonies up to 2 hours",
  basePrice: 150000, // $1,500
  estimatedDuration: 120,
  deliverables: ["150+ edited images", "Online gallery", "Print release"],
  includes: ["Ceremony coverage", "Couple portraits"]
}

// Half Day
{
  name: "Half Day Wedding",
  description: "4 hours of coverage",
  basePrice: 250000, // $2,500
  estimatedDuration: 240,
  deliverables: ["300+ edited images", "Online gallery", "Print release"],
  includes: ["Getting ready", "Ceremony", "Family formals", "Reception start"]
}

// Full Day
{
  name: "Full Day Wedding",
  description: "8 hours of coverage",
  basePrice: 400000, // $4,000
  estimatedDuration: 480,
  deliverables: ["500+ edited images", "Online gallery", "Print release", "Sneak peek"],
  includes: ["Full day coverage", "Second shooter option", "Engagement session"]
}

// Premium Collection
{
  name: "Premium Collection",
  description: "Complete wedding experience",
  basePrice: 600000, // $6,000
  estimatedDuration: 600, // 10 hours
  deliverables: ["700+ edited images", "Wedding album", "Parent albums", "Canvas print"],
  includes: ["Engagement session", "Rehearsal dinner", "Full day", "Second shooter"]
}
```

### Event Packages

```typescript
// Birthday/Party
{
  name: "Event Coverage",
  description: "Parties and celebrations",
  basePrice: 75000, // $750
  estimatedDuration: 180, // 3 hours
  additionalHourRate: 20000 // $200/hr
}

// Corporate Event
{
  name: "Corporate Event",
  description: "Business events and galas",
  basePrice: 150000, // $1,500
  estimatedDuration: 240, // 4 hours
  additionalHourRate: 30000 // $300/hr
}
```

### Add-On Services
- Second Photographer: $500
- Engagement Session: $400
- Rehearsal Dinner: $500
- Photo Booth: $800
- Album Design: $300+
- Rush Editing: $200

---

## Questionnaire Templates

### Wedding Questionnaire

```typescript
const weddingQuestions = [
  // Basic Info
  { id: "venue_name", label: "Venue Name", type: "text", required: true },
  { id: "venue_address", label: "Venue Address", type: "text", required: true },
  { id: "ceremony_time", label: "Ceremony Time", type: "time", required: true },
  { id: "guest_count", label: "Expected Guest Count", type: "number" },

  // Getting Ready
  { id: "getting_ready_location", label: "Where are you getting ready?", type: "text" },
  { id: "getting_ready_time", label: "What time should we arrive?", type: "time" },

  // Wedding Party
  {
    id: "bridal_party",
    label: "Wedding Party Members",
    type: "contact_list",
    fields: ["name", "role", "relationship"]
  },

  // Family Formals
  {
    id: "family_groups",
    label: "Family Photo Groups",
    type: "shot_list",
    description: "List the family group combinations you want"
  },

  // Vendors
  {
    id: "vendors",
    label: "Other Vendors",
    type: "vendor_list",
    fields: ["name", "company", "role", "email", "phone"]
  },

  // Special Requests
  { id: "must_have_shots", label: "Must-Have Shots", type: "long_text" },
  { id: "special_moments", label: "Special Moments to Capture", type: "long_text" },
  { id: "avoid_list", label: "Anything to Avoid?", type: "long_text" },
];
```

### Event Questionnaire

```typescript
const eventQuestions = [
  { id: "event_name", label: "Event Name", type: "text", required: true },
  { id: "event_type", label: "Type of Event", type: "select", options: ["Birthday", "Anniversary", "Corporate", "Other"] },
  { id: "venue", label: "Venue/Location", type: "text", required: true },
  { id: "guest_count", label: "Expected Guests", type: "number" },
  { id: "key_people", label: "Key People to Photograph", type: "contact_list" },
  { id: "schedule", label: "Event Schedule/Timeline", type: "long_text" },
  { id: "special_requests", label: "Special Requests", type: "long_text" },
];
```

---

## Booking Flow Customizations

### Step 1: Event Type
- Wedding
- Engagement Session
- Party/Celebration
- Corporate Event
- Other Event

### Step 2: Event Details (varies by type)

**For Weddings:**
- Partner names
- Wedding date
- Venue(s)
- Guest count estimate

**For Events:**
- Event name
- Type
- Date/time
- Location

### Step 3: Package Selection
- Show relevant packages
- Add-on options
- Multi-day pricing (if applicable)

### Step 4: Contract
- Auto-populate contract with details
- Send for signature
- Deposit payment option

### Step 5: Questionnaire
- Send questionnaire automatically
- Set deadline for completion

---

## Contract Features

### Wedding Contract Sections

1. **Services Agreed** - Package details, hours, deliverables
2. **Payment Schedule** - Deposit amount, due dates, final payment
3. **Cancellation Policy** - Refund terms by timeframe
4. **Rescheduling Policy** - Conditions and fees
5. **Image Delivery** - Timeline, format, usage rights
6. **Liability Limitations** - Equipment failure, unforeseen circumstances
7. **Model Release** - Permission to use images
8. **Emergency Contact** - Day-of contact information

### Payment Schedule Options

```typescript
type PaymentSchedule =
  | "full_upfront"           // 100% at booking
  | "50_50"                  // 50% deposit, 50% before event
  | "retainer_balance"       // $500-1000 retainer, balance before event
  | "three_payments"         // 33% booking, 33% 30 days, 33% day before
  | "custom";
```

---

## Gallery Customizations

### Event Gallery Features
- Guest access with email gate
- Download counts and tracking
- Favorites/selections
- Print ordering integration
- Slideshow/presentation mode
- Social sharing options

### Guest Gallery Access

```typescript
interface GuestAccess {
  galleryId: string;
  accessType: "public" | "password" | "email_gate" | "private";
  password?: string;
  allowedEmails?: string[];
  allowDownloads: boolean;
  allowFavorites: boolean;
  expiresAt?: Date;
}
```

### Sneak Peek Galleries

```typescript
interface SneakPeek {
  id: string;
  bookingId: string;
  mainGalleryId: string;
  photos: string[];  // Subset of photos
  publishedAt: Date;
  socialShareEnabled: boolean;
}
```

---

## Timeline Builder

### Features
- Drag-and-drop event ordering
- Time-aware scheduling
- Location tracking
- Photographer notes
- Shareable link for clients/vendors

### Timeline Template

```typescript
const weddingTimelineTemplate = [
  { time: "12:00", title: "Hair & Makeup", photographerRequired: false },
  { time: "14:00", title: "Photographer Arrives", photographerRequired: true },
  { time: "14:30", title: "Getting Ready Photos", photographerRequired: true },
  { time: "15:30", title: "First Look", photographerRequired: true },
  { time: "16:00", title: "Wedding Party Photos", photographerRequired: true },
  { time: "16:30", title: "Family Formals", photographerRequired: true },
  { time: "17:00", title: "Ceremony", photographerRequired: true },
  { time: "17:30", title: "Cocktail Hour", photographerRequired: true },
  { time: "18:30", title: "Reception Entrance", photographerRequired: true },
  { time: "19:00", title: "First Dance", photographerRequired: true },
  { time: "19:30", title: "Toasts", photographerRequired: true },
  { time: "20:00", title: "Dinner", photographerRequired: false },
  { time: "21:00", title: "Cake Cutting", photographerRequired: true },
  { time: "21:30", title: "Dancing", photographerRequired: true },
  { time: "22:00", title: "Send-off", photographerRequired: true },
];
```

---

## Settings (Module-Specific)

Located at `/settings/events`:

| Setting | Description | Default |
|---------|-------------|---------|
| Default deposit | Percentage or fixed | 33% |
| Questionnaire deadline | Days before event | 14 |
| Sneak peek timing | Days after event | 3 |
| Full gallery timing | Days after event | 30 |
| Auto-send questionnaire | On contract signing | true |
| Guest download limit | Per gallery | unlimited |

---

## Dashboard Widgets

### Upcoming Events
- Calendar view of events
- Days until each event
- Questionnaire status

### Pending Items
- Unsigned contracts
- Incomplete questionnaires
- Unpaid balances

### Event Pipeline
- Inquiries
- Booked
- Questionnaire sent
- Timeline confirmed
- Completed

---

## Implementation Checklist

### Phase 1: Questionnaires
- [ ] Questionnaire template builder
- [ ] Question types implementation
- [ ] Client-facing questionnaire form
- [ ] Response storage and display
- [ ] Auto-send on contract signing

### Phase 2: Timelines
- [ ] Timeline data model
- [ ] Timeline builder UI
- [ ] Shareable timeline page
- [ ] Timeline templates

### Phase 3: Multi-Day Events
- [ ] Multi-day booking model
- [ ] Multi-day booking form
- [ ] Day-by-day breakdown
- [ ] Consolidated pricing

### Phase 4: Wedding Features
- [ ] Couple client type
- [ ] Wedding-specific questionnaire
- [ ] Family formal shot list
- [ ] Vendor management

### Phase 5: Gallery Features
- [ ] Guest access controls
- [ ] Sneak peek galleries
- [ ] Download tracking
- [ ] Social sharing

---

## API Reference

### Server Actions

```typescript
// Questionnaires
createQuestionnaireTemplate(data: TemplateInput): Promise<Template>
sendQuestionnaire(bookingId: string, templateId: string): Promise<Questionnaire>
saveQuestionnaireResponse(id: string, responses: Response[]): Promise<void>
getQuestionnaireStatus(bookingId: string): Promise<QuestionnaireStatus>

// Timelines
createTimeline(bookingId: string): Promise<Timeline>
updateTimeline(id: string, events: TimelineEvent[]): Promise<Timeline>
shareTimeline(id: string, emails: string[]): Promise<string> // Returns share URL

// Multi-Day
createMultiDayBooking(data: MultiDayInput): Promise<MultiDayBooking>
addEventDay(bookingId: string, day: EventDay): Promise<EventDay>
```

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Questionnaire System](./docs/questionnaires.md) - Questionnaire details
- [Timeline Builder](./docs/timeline-builder.md) - Timeline features

### README-MODULE-PORTRAITS.md

# Portraits & Headshots Module

## Overview

The Portraits module caters to photographers specializing in family portraits, senior photos, professional headshots, and personal branding sessions. Features include mini-session management, online booking, and client galleries with print ordering.

---

## Module ID

```
portraits
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Portrait galleries with print ordering | Enabled |
| Scheduling | Session booking with time slots | Enabled |
| Invoices | Session-based pricing | Enabled |
| Clients | Individual + family management | Enabled |
| Services | Portrait packages | Enabled |
| Mini-Sessions | Group event management | Enabled |
| Online Booking | Client self-scheduling | Enabled |

---

## Unique Features

### 1. Mini-Session Events

Manage high-volume mini-session events:

```typescript
interface MiniSessionEvent {
  id: string;
  name: string;                    // "Fall Mini Sessions 2024"
  date: Date;
  location: string;
  locationDetails?: string;
  description?: string;
  image?: string;                  // Marketing image
  sessionLength: number;           // minutes (15, 20, 30)
  bufferTime: number;              // minutes between sessions
  startTime: string;               // "09:00"
  endTime: string;                 // "16:00"
  price: number;                   // cents
  depositRequired?: number;        // cents
  maxBookings: number;
  currentBookings: number;
  status: "draft" | "published" | "sold_out" | "completed";
  bookingPageUrl?: string;
  slots: MiniSessionSlot[];
}

interface MiniSessionSlot {
  id: string;
  eventId: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked";
  bookingId?: string;
  clientName?: string;
}
```

### 2. Online Booking Page

Self-service booking for clients:

```typescript
interface BookingPage {
  id: string;
  organizationId: string;
  slug: string;                    // URL slug
  title: string;
  description?: string;
  services: BookableService[];
  availability: AvailabilitySettings;
  settings: BookingPageSettings;
}

interface BookableService {
  serviceId: string;
  enabled: boolean;
  customPrice?: number;            // Override default price
  customDuration?: number;         // Override default duration
}

interface BookingPageSettings {
  requireDeposit: boolean;
  depositAmount?: number;
  showPrices: boolean;
  collectPhone: boolean;
  customQuestions?: CustomQuestion[];
  confirmationMessage?: string;
}
```

### 3. Family/Group Client Model

```typescript
interface FamilyClient extends Client {
  type: "family";
  familyName: string;              // "The Johnson Family"
  primaryContact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  familyMembers: FamilyMember[];
}

interface FamilyMember {
  id: string;
  firstName: string;
  lastName?: string;
  relationship: string;            // "spouse", "child", "pet"
  birthDate?: Date;                // For age-based pricing
  notes?: string;
}
```

### 4. Print Ordering Integration

```typescript
interface PrintOrder {
  id: string;
  galleryId: string;
  clientId: string;
  items: PrintOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered";
  shippingAddress: Address;
  trackingNumber?: string;
}

interface PrintOrderItem {
  photoId: string;
  productId: string;              // From print lab catalog
  productName: string;
  size: string;
  quantity: number;
  priceEach: number;
  total: number;
}
```

---

## Service Templates

### Individual Sessions

```typescript
// Headshot Session
{
  name: "Professional Headshot",
  description: "Corporate or LinkedIn headshot",
  basePrice: 25000, // $250
  estimatedDuration: 45,
  deliverables: ["3 retouched images", "Web + print resolution"],
  includes: ["Wardrobe consultation", "2-3 outfit changes"]
}

// Personal Branding
{
  name: "Personal Branding Session",
  description: "Comprehensive brand imagery",
  basePrice: 75000, // $750
  estimatedDuration: 120,
  deliverables: ["20 retouched images", "Full resolution"],
  includes: ["Location scouting", "Multiple setups", "Style guide"]
}
```

### Family Sessions

```typescript
// Family Portrait
{
  name: "Family Portrait Session",
  description: "Outdoor or studio family photos",
  basePrice: 35000, // $350
  estimatedDuration: 60,
  deliverables: ["20 edited images", "Online gallery"],
  includes: ["Location guidance", "Outfit consultation"]
}

// Extended Family
{
  name: "Extended Family Session",
  description: "Multiple generations and groupings",
  basePrice: 50000, // $500
  estimatedDuration: 90,
  deliverables: ["40 edited images", "Group combinations"],
  includes: ["Shot list planning", "Multiple locations"]
}
```

### Senior Sessions

```typescript
// Senior Basic
{
  name: "Senior Portrait - Basic",
  description: "Essential senior photos",
  basePrice: 30000, // $300
  estimatedDuration: 60,
  deliverables: ["15 edited images", "Online gallery"],
  includes: ["1 location", "2 outfit changes"]
}

// Senior Premium
{
  name: "Senior Portrait - Premium",
  description: "Complete senior experience",
  basePrice: 55000, // $550
  estimatedDuration: 120,
  deliverables: ["30 edited images", "Print credit"],
  includes: ["2 locations", "4 outfit changes", "Hair/makeup prep"]
}
```

### Mini-Session Templates

```typescript
// Fall Minis
{
  name: "Fall Mini Session",
  basePrice: 17500, // $175
  sessionLength: 20,
  deliverables: ["10 edited images", "Online gallery"],
  description: "20-minute fall foliage session"
}

// Holiday Minis
{
  name: "Holiday Mini Session",
  basePrice: 20000, // $200
  sessionLength: 20,
  deliverables: ["10 edited images", "1 digital holiday card"],
  description: "Festive holiday-themed photos"
}
```

---

## Booking Flow Customizations

### Online Booking Flow

1. **Select Service** - Browse available sessions
2. **Choose Date/Time** - Calendar with availability
3. **Enter Details** - Contact info, family members
4. **Custom Questions** - Photographer's questions
5. **Payment** - Deposit or full payment
6. **Confirmation** - Email with details

### Mini-Session Booking Flow

1. **View Event** - Event details and availability
2. **Select Time** - Available slots
3. **Enter Details** - Contact and participants
4. **Payment** - Session fee
5. **Confirmation** - Email with location details

---

## Gallery Customizations

### Portrait Gallery Features
- Favorite/selection tools
- Print ordering integration
- Digital download packages
- Wall art previews
- Album design tools

### In-Person Sales (IPS) Mode

```typescript
interface IPSSession {
  id: string;
  galleryId: string;
  scheduledAt: Date;
  clientId: string;
  status: "scheduled" | "in_progress" | "completed";
  viewedImages: string[];
  selectedImages: string[];
  cart: CartItem[];
  totalSales?: number;
}
```

### Wall Art Previews

```typescript
interface RoomPreview {
  id: string;
  roomImage: string;              // Background room photo
  wallDimensions: {
    width: number;
    height: number;
  };
  previewPosition: {
    x: number;
    y: number;
    scale: number;
  };
}
```

---

## Mini-Session Management

### Event Creation Workflow

1. **Create Event** - Name, date, location
2. **Set Schedule** - Start/end time, session length, buffer
3. **Configure Pricing** - Session fee, deposit
4. **Design Landing Page** - Description, image, details
5. **Publish** - Generate booking link
6. **Monitor** - Track bookings, send reminders

### Client Communication

```typescript
interface MiniSessionCommunication {
  eventId: string;
  emails: {
    confirmation: {
      template: string;
      sendAt: "booking";
    };
    reminder: {
      template: string;
      sendAt: "1_day_before";
    };
    whatToWear: {
      template: string;
      sendAt: "3_days_before";
    };
    galleryReady: {
      template: string;
      sendAt: "gallery_published";
    };
  };
}
```

---

## Online Booking System

### Availability Settings

```typescript
interface AvailabilitySettings {
  timezone: string;
  defaultDuration: number;         // minutes
  bufferBefore: number;            // minutes
  bufferAfter: number;             // minutes
  minimumNotice: number;           // hours
  maxAdvanceBooking: number;       // days
  weeklySchedule: WeeklySchedule;
  blockedDates: Date[];
  customAvailability?: DateOverride[];
}

interface WeeklySchedule {
  monday: DaySchedule | null;
  tuesday: DaySchedule | null;
  wednesday: DaySchedule | null;
  thursday: DaySchedule | null;
  friday: DaySchedule | null;
  saturday: DaySchedule | null;
  sunday: DaySchedule | null;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface TimeSlot {
  start: string;                   // "09:00"
  end: string;                     // "17:00"
}
```

### Booking Widget

Embeddable booking widget for website:

```typescript
interface BookingWidget {
  organizationId: string;
  services: string[];              // Service IDs to show
  theme: "light" | "dark";
  accentColor: string;
  embedCode: string;
}
```

---

## Invoice Customizations

### Portrait-Specific Items
- Session fee
- Print package (prints + digitals)
- Digital download package
- Wall art
- Album
- Additional digitals

### Print Products

```typescript
interface PrintProduct {
  id: string;
  name: string;
  category: "print" | "canvas" | "metal" | "album" | "gift";
  sizes: ProductSize[];
  basePrice: number;
  description?: string;
}

interface ProductSize {
  size: string;                    // "8x10"
  price: number;                   // cents
  labCost: number;                 // cost to photographer
}
```

---

## Settings (Module-Specific)

Located at `/settings/portraits`:

| Setting | Description | Default |
|---------|-------------|---------|
| Online booking enabled | Allow self-scheduling | true |
| Minimum notice | Hours before booking | 24 |
| Max advance booking | Days ahead | 60 |
| Require deposit | For online bookings | true |
| Deposit amount | Fixed or percentage | 50% |
| Gallery expiration | Days | 30 |
| Print lab | Connected lab | none |
| Print markup | Percentage | 100% |

---

## Dashboard Widgets

### Mini-Session Status
- Active events
- Slots booked vs available
- Revenue per event

### Upcoming Sessions
- This week's sessions
- Session type breakdown
- Preparation reminders

### Gallery Activity
- Recent views
- Downloads
- Print orders

### Booking Pipeline
- New inquiries
- Scheduled sessions
- Awaiting galleries
- Pending orders

---

## Implementation Checklist

### Phase 1: Online Booking
- [ ] Booking page builder
- [ ] Availability settings
- [ ] Service selection UI
- [ ] Calendar component
- [ ] Booking confirmation flow

### Phase 2: Mini-Sessions
- [ ] Mini-session event model
- [ ] Event creation form
- [ ] Public booking page
- [ ] Slot management
- [ ] Automated emails

### Phase 3: Family Management
- [ ] Family client type
- [ ] Family member management
- [ ] Family gallery organization

### Phase 4: Print Ordering
- [ ] Print product catalog
- [ ] Order management
- [ ] Lab integration (WHCC, etc.)
- [ ] Fulfillment tracking

### Phase 5: IPS Features
- [ ] Presentation mode
- [ ] Wall art previews
- [ ] In-session cart
- [ ] Order processing

---

## API Reference

### Server Actions

```typescript
// Mini-Sessions
createMiniSessionEvent(data: EventInput): Promise<MiniSessionEvent>
publishMiniSessionEvent(eventId: string): Promise<string> // Returns booking URL
getMiniSessionSlots(eventId: string): Promise<MiniSessionSlot[]>
bookMiniSessionSlot(slotId: string, data: BookingInput): Promise<Booking>

// Online Booking
getAvailability(serviceId: string, month: Date): Promise<AvailableSlot[]>
createOnlineBooking(data: OnlineBookingInput): Promise<Booking>

// Print Orders
createPrintOrder(galleryId: string, items: OrderItem[]): Promise<PrintOrder>
submitToLab(orderId: string): Promise<LabSubmission>
updateOrderTracking(orderId: string, tracking: string): Promise<void>

// Family Management
createFamily(data: FamilyInput): Promise<FamilyClient>
addFamilyMember(familyId: string, member: MemberInput): Promise<FamilyMember>
```

---

## Print Lab Integrations

### Supported Labs (Future)
- WHCC (White House Custom Colour)
- Miller's Lab
- Bay Photo Lab
- Nations Photo Lab
- Mpix

### Lab Integration Flow

```typescript
interface LabOrder {
  labId: string;
  orderId: string;
  externalOrderId?: string;
  items: LabOrderItem[];
  status: "pending" | "submitted" | "processing" | "shipped" | "delivered";
  submittedAt?: Date;
  trackingNumber?: string;
  trackingUrl?: string;
}
```

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Online Booking](./docs/online-booking.md) - Booking system details
- [Mini-Sessions](./docs/mini-sessions.md) - Mini-session management
- [Print Ordering](./docs/print-ordering.md) - Print lab integration

### README-MODULE-FOOD.md

# Food & Hospitality Module

## Overview

The Food module is designed for photographers specializing in restaurant photography, menu shoots, culinary content, and hospitality marketing. Features include licensing management, recipe/menu organization, and seasonal campaign tracking.

---

## Module ID

```
food
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Menu and cuisine galleries | Enabled |
| Scheduling | Restaurant-friendly booking | Enabled |
| Invoices | Per-image and day rate pricing | Enabled |
| Clients | Restaurant/brand management | Enabled |
| Services | Food photography packages | Enabled |
| Licensing | Usage rights management | Enabled |
| Menu Organization | Dish-based image tagging | Enabled |

---

## Unique Features

### 1. Restaurant Client Model

```typescript
interface RestaurantClient extends Client {
  type: "restaurant" | "brand" | "agency";
  businessName: string;
  cuisineType?: string[];          // ["Italian", "Seafood"]
  locations?: RestaurantLocation[];
  contacts: RestaurantContact[];
  brandGuidelines?: string;        // URL or notes
  preferredStylist?: string;
  dietaryFocus?: string[];         // ["Vegan", "Gluten-Free"]
}

interface RestaurantLocation {
  id: string;
  name: string;                    // "Downtown Location"
  address: string;
  isMainLocation: boolean;
  shootHistory?: Booking[];
}

interface RestaurantContact {
  id: string;
  name: string;
  role: "owner" | "manager" | "marketing" | "chef" | "other";
  email: string;
  phone?: string;
  isPrimary: boolean;
}
```

### 2. Menu/Dish Organization

Organize images by menu items:

```typescript
interface DishCatalog {
  id: string;
  clientId: string;
  dishes: Dish[];
}

interface Dish {
  id: string;
  name: string;
  category: string;                // "Appetizers", "Entrees", "Desserts"
  description?: string;
  price?: number;
  dietary?: string[];              // ["Vegetarian", "GF"]
  photos: DishPhoto[];
  isActive: boolean;               // On current menu
  seasonalAvailability?: string[]; // ["Spring", "Summer"]
}

interface DishPhoto {
  id: string;
  photoId: string;                 // Gallery photo reference
  angle: "hero" | "overhead" | "45_degree" | "detail" | "lifestyle";
  usage: PhotoUsage[];
  shotDate: Date;
  expiresAt?: Date;                // License expiration
}

type PhotoUsage = "menu" | "website" | "social" | "advertising" | "print" | "packaging";
```

### 3. Licensing & Usage Rights

```typescript
interface FoodLicense {
  id: string;
  clientId: string;
  photoIds: string[];
  type: "limited" | "unlimited" | "exclusive";
  usageRights: UsageRight[];
  territory: "local" | "regional" | "national" | "worldwide";
  duration: {
    type: "fixed" | "perpetual";
    startDate: Date;
    endDate?: Date;
  };
  price: number;
  renewalTerms?: string;
}

interface UsageRight {
  type: PhotoUsage;
  channels: string[];              // ["Instagram", "Facebook", "Website"]
  restrictions?: string;
}
```

### 4. Seasonal Campaign Tracking

```typescript
interface SeasonalCampaign {
  id: string;
  clientId: string;
  name: string;                    // "Summer Menu Launch"
  season: "spring" | "summer" | "fall" | "winter" | "holiday";
  year: number;
  dishes: string[];                // Dish IDs
  deliverables: CampaignDeliverable[];
  deadline: Date;
  status: "planning" | "shooting" | "editing" | "delivered";
}

interface CampaignDeliverable {
  id: string;
  type: "hero_shot" | "menu_images" | "social_set" | "advertising" | "website";
  specifications: string;
  quantity: number;
  status: "pending" | "shot" | "edited" | "approved";
}
```

---

## Service Templates

### Restaurant Packages

```typescript
// Menu Shoot
{
  name: "Menu Photography",
  description: "Complete menu documentation",
  basePrice: 150000, // $1,500
  estimatedDuration: 480, // Full day
  deliverables: ["Up to 25 dishes", "Hero + alternate angles", "Web resolution"],
  includes: ["Basic styling", "Natural light setup"]
}

// Social Media Content
{
  name: "Social Content Package",
  description: "Instagram/social ready images",
  basePrice: 75000, // $750
  estimatedDuration: 240, // Half day
  deliverables: ["15-20 images", "Square + vertical crops", "Color graded"],
  includes: ["Multiple angles", "Detail shots", "Behind-the-scenes"]
}

// Brand Campaign
{
  name: "Brand Campaign",
  description: "Advertising and marketing imagery",
  basePrice: 300000, // $3,000
  estimatedDuration: 480,
  deliverables: ["10-15 hero images", "Full usage rights", "High resolution"],
  includes: ["Professional styling", "Props sourcing", "Multiple setups"]
}
```

### Per-Image Pricing

```typescript
// Single Dish
{
  name: "Single Dish Photography",
  description: "Individual dish with hero angle",
  basePrice: 7500, // $75
  estimatedDuration: 15,
  deliverables: ["1 hero image", "1 alternate angle"],
  volumeDiscounts: [
    { quantity: 10, discount: 10 },
    { quantity: 20, discount: 15 },
    { quantity: 30, discount: 20 }
  ]
}

// Recipe Development
{
  name: "Recipe Step Photography",
  description: "Step-by-step cooking process",
  basePrice: 20000, // $200
  estimatedDuration: 60,
  deliverables: ["8-12 process shots", "Final plated hero"],
}
```

### Day Rates

```typescript
// Full Day
{
  name: "Full Day Rate",
  description: "8 hours on location",
  basePrice: 200000, // $2,000
  estimatedDuration: 480,
  deliverables: ["All images from session", "Basic editing"],
  additionalHourRate: 30000 // $300/hr
}

// Half Day
{
  name: "Half Day Rate",
  description: "4 hours on location",
  basePrice: 120000, // $1,200
  estimatedDuration: 240,
  additionalHourRate: 35000 // $350/hr
}
```

---

## Booking Flow Customizations

### Step 1: Client/Location Selection
- Restaurant name
- Which location (if multiple)
- Contact person

### Step 2: Project Type
- Menu update
- New restaurant opening
- Seasonal refresh
- Social media content
- Advertising campaign

### Step 3: Dish Planning
- Number of dishes
- Dish list (if known)
- Special requirements
- Dietary highlights

### Step 4: Styling & Props
- In-house styling vs photographer-provided
- Prop preferences
- Brand guidelines reference

### Step 5: Licensing
- Usage needs
- Duration
- Territory
- Pricing impact

---

## Gallery Customizations

### Food Gallery Organization

```typescript
interface FoodGallerySection {
  id: string;
  type: "category" | "dish" | "campaign";
  name: string;
  photos: Photo[];
  metadata?: {
    dishId?: string;
    category?: string;
    campaign?: string;
  };
}

const defaultSections = [
  { type: "category", name: "Appetizers" },
  { type: "category", name: "Entrees" },
  { type: "category", name: "Desserts" },
  { type: "category", name: "Beverages" },
  { type: "category", name: "Ambiance" },
];
```

### Image Tagging

```typescript
interface FoodPhotoMetadata {
  photoId: string;
  dishId?: string;
  dishName?: string;
  ingredients?: string[];
  dietary?: string[];
  angle?: string;
  lighting?: string;
  styling?: string;
  props?: string[];
}
```

### Usage Tracking

```typescript
interface PhotoUsageLog {
  photoId: string;
  usedAt: Date;
  platform: string;
  campaign?: string;
  screenshot?: string;
  notes?: string;
}
```

---

## Invoice Customizations

### Food Photography Line Items
- Day/half-day rate
- Per-dish pricing
- Styling fee
- Props expense
- Travel/location fee
- Licensing fee (by usage type)
- Rush delivery

### Licensing Add-Ons

```typescript
const licensingOptions = [
  { type: "website", label: "Website Use", price: 0 },           // Included
  { type: "social", label: "Social Media", price: 0 },           // Included
  { type: "menu_print", label: "Printed Menu", price: 10000 },   // $100
  { type: "advertising", label: "Advertising", price: 25000 },   // $250
  { type: "packaging", label: "Packaging", price: 50000 },       // $500
  { type: "exclusive", label: "Exclusive Rights", price: 100000 }, // $1,000
];
```

---

## Settings (Module-Specific)

Located at `/settings/food`:

| Setting | Description | Default |
|---------|-------------|---------|
| Default license type | For new galleries | limited |
| Include web + social | In base pricing | true |
| Per-dish rate | Default price | $75 |
| Day rate | Full day price | $2,000 |
| Styling included | In base packages | false |
| License duration | Default term | 1 year |
| Auto-track usage | Monitor platforms | false |

---

## Dashboard Widgets

### Active Campaigns
- Current seasonal shoots
- Deadline countdowns
- Deliverable status

### Client Menu Status
- Dishes photographed
- Expiring licenses
- Re-shoot candidates

### Revenue Breakdown
- By client
- By service type
- Licensing vs session fees

---

## Implementation Checklist

### Phase 1: Restaurant Clients
- [ ] Restaurant client type
- [ ] Multi-location support
- [ ] Contact role management
- [ ] Brand guidelines storage

### Phase 2: Dish Catalog
- [ ] Dish database model
- [ ] Menu organization UI
- [ ] Photo-to-dish linking
- [ ] Dietary tagging

### Phase 3: Licensing
- [ ] License terms builder
- [ ] Usage rights selection
- [ ] License pricing calculator
- [ ] Expiration tracking

### Phase 4: Campaigns
- [ ] Campaign planning tool
- [ ] Deliverable tracking
- [ ] Seasonal organization
- [ ] Progress dashboard

### Phase 5: Advanced
- [ ] Usage tracking/monitoring
- [ ] License renewal reminders
- [ ] Client asset library
- [ ] Re-shoot suggestions

---

## API Reference

### Server Actions

```typescript
// Dish Catalog
createDish(clientId: string, data: DishInput): Promise<Dish>
updateDish(dishId: string, data: DishInput): Promise<Dish>
linkPhotoToDish(photoId: string, dishId: string, angle: string): Promise<void>
getDishCatalog(clientId: string): Promise<DishCatalog>

// Licensing
createLicense(data: LicenseInput): Promise<FoodLicense>
calculateLicenseFee(options: LicenseOptions): Promise<number>
checkLicenseExpiration(clientId: string): Promise<ExpiringLicense[]>
renewLicense(licenseId: string, duration: LicenseDuration): Promise<FoodLicense>

// Campaigns
createCampaign(data: CampaignInput): Promise<SeasonalCampaign>
updateDeliverableStatus(id: string, status: string): Promise<void>
getCampaignProgress(campaignId: string): Promise<CampaignProgress>
```

---

## Recipe/Process Photography

### Step-by-Step Documentation

```typescript
interface RecipeShoot {
  id: string;
  dishId: string;
  recipeName: string;
  steps: RecipeStep[];
  finalPlating: Photo[];
  ingredientShot?: Photo;
  equipmentShot?: Photo;
}

interface RecipeStep {
  order: number;
  description: string;
  photos: Photo[];
  tips?: string;
}
```

### Blog/Publication Ready

- Vertical format options
- Pinterest-optimized crops
- Recipe card templates
- Ingredient flat lay

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Licensing System](./docs/licensing.md) - Usage rights management
- [Asset Organization](./docs/asset-organization.md) - Gallery organization

### README-MODULE-PRODUCT.md

# Product & E-commerce Module

## Overview

The Product module is built for photographers specializing in product photography for e-commerce, catalogs, and marketing. Features include batch processing, SKU management, image specifications compliance, and bulk delivery workflows.

---

## Module ID

```
product
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Product catalogs with SKU organization | Enabled |
| Scheduling | Batch session booking | Enabled |
| Invoices | Per-product and batch pricing | Enabled |
| Clients | Brand/retailer management | Enabled |
| Services | Product photography packages | Enabled |
| Batch Processing | Bulk image management | Enabled |
| Licensing | Commercial usage rights | Enabled |
| SKU Management | Product organization by SKU | Enabled |

---

## Unique Features

### 1. SKU-Based Product Management

```typescript
interface ProductCatalog {
  id: string;
  clientId: string;
  name: string;                    // "Spring 2024 Collection"
  products: Product[];
  status: "planning" | "shooting" | "editing" | "delivered";
}

interface Product {
  id: string;
  catalogId: string;
  sku: string;
  name: string;
  category?: string;
  variants?: ProductVariant[];
  photos: ProductPhoto[];
  status: "pending" | "shot" | "edited" | "approved" | "delivered";
  requiredAngles: string[];
  notes?: string;
}

interface ProductVariant {
  id: string;
  sku: string;
  name: string;                    // "Red - Large"
  color?: string;
  size?: string;
  photos: ProductPhoto[];
}

interface ProductPhoto {
  id: string;
  photoId: string;
  angle: ProductAngle;
  isPrimary: boolean;
  status: "raw" | "edited" | "approved" | "rejected";
  retouchNotes?: string;
  version: number;
}

type ProductAngle =
  | "front"
  | "back"
  | "side_left"
  | "side_right"
  | "detail"
  | "45_degree"
  | "flat_lay"
  | "lifestyle"
  | "scale"
  | "packaging";
```

### 2. Image Specification Compliance

E-commerce platform requirements:

```typescript
interface ImageSpecification {
  id: string;
  name: string;                    // "Amazon Main Image"
  platform?: string;               // "Amazon", "Shopify", etc.
  requirements: {
    minWidth: number;
    minHeight: number;
    maxWidth?: number;
    maxHeight?: number;
    aspectRatio?: string;          // "1:1", "4:3"
    format: string[];              // ["jpg", "png"]
    maxFileSize?: number;          // bytes
    colorSpace: string;            // "sRGB"
    dpi?: number;
    backgroundColor?: string;      // "#FFFFFF"
    productFill?: string;          // "85%"
  };
  validation: SpecValidation[];
}

interface SpecValidation {
  rule: string;
  message: string;
  severity: "error" | "warning";
}

// Pre-built platform specs
const platformSpecs = {
  amazon: {
    main: {
      minWidth: 1000,
      minHeight: 1000,
      aspectRatio: "1:1",
      backgroundColor: "#FFFFFF",
      productFill: "85%",
    },
    variant: {
      minWidth: 1000,
      minHeight: 1000,
    },
  },
  shopify: {
    product: {
      aspectRatio: "1:1",
      maxWidth: 4472,
      maxHeight: 4472,
    },
  },
  etsy: {
    listing: {
      minWidth: 2000,
      aspectRatio: "4:3",
    },
  },
};
```

### 3. Batch Processing Workflow

```typescript
interface BatchJob {
  id: string;
  catalogId: string;
  type: "edit" | "resize" | "export" | "watermark";
  settings: BatchSettings;
  items: BatchItem[];
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;                // 0-100
  startedAt?: Date;
  completedAt?: Date;
  errors?: BatchError[];
}

interface BatchSettings {
  outputFormat?: string;
  outputQuality?: number;
  resize?: {
    width: number;
    height: number;
    mode: "fit" | "fill" | "exact";
  };
  watermark?: {
    enabled: boolean;
    position: string;
    opacity: number;
  };
  naming?: {
    pattern: string;              // "{sku}_{angle}_{variant}"
  };
}

interface BatchItem {
  id: string;
  photoId: string;
  status: "pending" | "processing" | "completed" | "failed";
  outputUrl?: string;
  error?: string;
}
```

### 4. Bulk Delivery System

```typescript
interface BulkDelivery {
  id: string;
  clientId: string;
  catalogId?: string;
  name: string;
  photos: DeliveryPhoto[];
  format: DeliveryFormat;
  status: "preparing" | "ready" | "delivered";
  downloadUrl?: string;
  expiresAt?: Date;
  downloadCount: number;
  maxDownloads?: number;
}

interface DeliveryPhoto {
  photoId: string;
  fileName: string;               // Custom naming
  sku?: string;
}

interface DeliveryFormat {
  fileFormat: "jpg" | "png" | "tiff";
  quality?: number;
  colorSpace: "sRGB" | "AdobeRGB" | "ProPhotoRGB";
  resolution: number;             // DPI
  longestEdge?: number;           // pixels
  includeMetadata: boolean;
  folderStructure: "flat" | "by_sku" | "by_category" | "by_angle";
}
```

---

## Service Templates

### Per-Product Pricing

```typescript
// Basic Product Shot
{
  name: "Basic Product Photo",
  description: "Single angle on white background",
  basePrice: 2500, // $25
  estimatedDuration: 10,
  deliverables: ["1 edited image", "Web resolution"],
  volumeDiscounts: [
    { quantity: 25, discount: 15 },
    { quantity: 50, discount: 20 },
    { quantity: 100, discount: 25 },
    { quantity: 250, discount: 30 }
  ]
}

// Multi-Angle Package
{
  name: "Multi-Angle Package",
  description: "Complete product coverage",
  basePrice: 7500, // $75
  estimatedDuration: 30,
  deliverables: ["5 angles", "Front, back, sides, detail"],
  includes: ["Basic retouching", "White background"]
}

// Lifestyle Shot
{
  name: "Lifestyle Product Shot",
  description: "In-context/styled imagery",
  basePrice: 15000, // $150
  estimatedDuration: 45,
  deliverables: ["1 styled image"],
  includes: ["Props", "Styling", "Advanced editing"]
}
```

### Batch/Volume Packages

```typescript
// Starter Package
{
  name: "E-commerce Starter",
  description: "Small catalog photography",
  basePrice: 50000, // $500
  productCount: 25,
  anglesPerProduct: 3,
  includes: ["White background", "Basic retouching", "Web delivery"]
}

// Standard Package
{
  name: "E-commerce Standard",
  description: "Medium catalog photography",
  basePrice: 175000, // $1,750
  productCount: 100,
  anglesPerProduct: 3,
  includes: ["White background", "Full retouching", "Multiple formats"]
}

// Enterprise Package
{
  name: "E-commerce Enterprise",
  description: "Large catalog photography",
  basePrice: 400000, // $4,000
  productCount: 250,
  anglesPerProduct: 4,
  includes: ["White + lifestyle", "Full retouching", "Platform-specific exports"]
}
```

### Day Rate Options

```typescript
// Studio Day
{
  name: "Studio Day Rate",
  description: "Full day in studio",
  basePrice: 180000, // $1,800
  estimatedDuration: 480,
  estimatedProducts: "30-50 depending on complexity",
  includes: ["Equipment", "Basic styling", "Editing"]
}

// On-Location Day
{
  name: "On-Location Day",
  description: "Full day at client location",
  basePrice: 250000, // $2,500
  estimatedDuration: 480,
  includes: ["Travel within 25mi", "Equipment", "Editing"]
}
```

---

## Booking Flow Customizations

### Step 1: Project Type
- New product launch
- Catalog refresh
- Seasonal update
- One-off products

### Step 2: Product Details
- Number of products
- Number of variants
- Required angles per product
- Special requirements (ghost mannequin, etc.)

### Step 3: Specifications
- Target platform(s)
- Image specifications
- File delivery format

### Step 4: Product List Import
- CSV/Excel upload
- SKU list
- Product names
- Variants

### Step 5: Scheduling
- Studio availability
- Products per day estimate
- Rush options

---

## Gallery Customizations

### Product Gallery Organization

```typescript
interface ProductGalleryView {
  mode: "grid" | "catalog" | "comparison";
  groupBy: "sku" | "category" | "status" | "angle";
  sortBy: "sku" | "name" | "date" | "status";
  filters: {
    status?: string[];
    category?: string[];
    hasVariants?: boolean;
  };
}
```

### Approval Workflow

```typescript
interface ProductApproval {
  catalogId: string;
  products: ProductApprovalItem[];
  approver: {
    name: string;
    email: string;
  };
  deadline?: Date;
  status: "pending" | "in_review" | "approved" | "revision_needed";
}

interface ProductApprovalItem {
  productId: string;
  sku: string;
  photos: PhotoApproval[];
  overallStatus: "pending" | "approved" | "rejected" | "revision";
  feedback?: string;
}

interface PhotoApproval {
  photoId: string;
  angle: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
}
```

### Comparison View

Side-by-side comparison for variants:
- Color consistency check
- Size reference comparison
- Before/after editing

---

## Invoice Customizations

### Product Photography Line Items
- Per-product rate x quantity
- Setup/styling fee
- Rush processing fee
- Platform-specific exports
- Lifestyle shots
- Retouching upgrades

### Volume Discounts

```typescript
interface VolumeDiscount {
  minQuantity: number;
  discountPercent: number;
}

const defaultVolumeDiscounts: VolumeDiscount[] = [
  { minQuantity: 25, discountPercent: 15 },
  { minQuantity: 50, discountPercent: 20 },
  { minQuantity: 100, discountPercent: 25 },
  { minQuantity: 250, discountPercent: 30 },
  { minQuantity: 500, discountPercent: 35 },
];
```

### Add-On Services
- Ghost mannequin editing: $15/image
- Shadow creation: $5/image
- Color correction (per color): $10/variant
- Background swap: $10/image
- 360deg spin: $75/product

---

## Settings (Module-Specific)

Located at `/settings/product`:

| Setting | Description | Default |
|---------|-------------|---------|
| Default angles | Per product | 3 |
| Base per-product rate | Cents | 2500 |
| Volume discounts | Enable/configure | true |
| Default background | Color/type | #FFFFFF |
| File naming pattern | Template | {sku}_{angle} |
| Default delivery format | Export settings | jpg/sRGB/72dpi |
| Platform presets | Amazon, Shopify, etc. | Amazon |

---

## Dashboard Widgets

### Active Catalogs
- In-progress catalogs
- Product counts
- Completion percentage

### Production Pipeline
- Products to shoot
- In editing
- Awaiting approval
- Ready for delivery

### Client Activity
- Recent deliveries
- Pending approvals
- Upcoming shoots

---

## Implementation Checklist

### Phase 1: Product Catalog
- [ ] Product/SKU database model
- [ ] Catalog CRUD operations
- [ ] Product import (CSV)
- [ ] Variant management

### Phase 2: Image Specifications
- [ ] Spec template library
- [ ] Platform presets
- [ ] Validation engine
- [ ] Compliance checker

### Phase 3: Batch Processing
- [ ] Batch job queue
- [ ] Resize processor
- [ ] Export processor
- [ ] Progress tracking

### Phase 4: Delivery System
- [ ] Bulk download builder
- [ ] Custom naming
- [ ] Folder structure options
- [ ] Delivery tracking

### Phase 5: Workflow
- [ ] Approval workflow
- [ ] Status tracking
- [ ] Client portal
- [ ] Revision management

---

## API Reference

### Server Actions

```typescript
// Catalog Management
createCatalog(data: CatalogInput): Promise<ProductCatalog>
importProducts(catalogId: string, csv: File): Promise<ImportResult>
updateProductStatus(productId: string, status: string): Promise<Product>

// Batch Processing
createBatchJob(data: BatchJobInput): Promise<BatchJob>
getBatchJobProgress(jobId: string): Promise<BatchProgress>
cancelBatchJob(jobId: string): Promise<void>

// Specifications
validateImage(photoId: string, specId: string): Promise<ValidationResult>
applySpec(photoIds: string[], specId: string): Promise<BatchJob>

// Delivery
createDelivery(data: DeliveryInput): Promise<BulkDelivery>
getDeliveryUrl(deliveryId: string): Promise<string>
trackDownload(deliveryId: string): Promise<void>

// Approval
sendForApproval(catalogId: string, approverEmail: string): Promise<Approval>
submitApprovalFeedback(approvalId: string, feedback: ApprovalFeedback): Promise<void>
```

---

## CSV Import Format

### Product Import Template

```csv
sku,name,category,color,size,angles_required,notes
SHIRT-001,Classic Cotton Tee,Apparel,White,S,front;back;detail,Main product shot
SHIRT-001-BLK,Classic Cotton Tee,Apparel,Black,S,front;back;detail,Color variant
SHOE-100,Running Sneaker,Footwear,Blue/White,10,front;side;back;sole;lifestyle,Hero product
```

### Export Naming Patterns

```
Available variables:
{sku}       - Product SKU
{name}      - Product name
{category}  - Category
{angle}     - Shot angle
{variant}   - Variant name
{color}     - Color
{size}      - Size
{date}      - Date shot
{seq}       - Sequence number

Examples:
{sku}_{angle}           -> SHIRT-001_front
{category}/{sku}_{angle} -> Apparel/SHIRT-001_front
{sku}_{color}_{angle}   -> SHIRT-001_Black_front
```

---

## Platform Integration (Future)

### Shopify Integration
- Direct upload to Shopify
- SKU matching
- Variant syncing
- Alt text population

### Amazon Integration
- Compliance checking
- Direct upload via API
- Listing enhancement

### General E-commerce
- API-based uploads
- Webhook notifications
- Inventory syncing

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Batch Processing](./docs/batch-processing.md) - Batch operations details
- [Image Specifications](./docs/image-specifications.md) - Platform requirements
- [Delivery System](./docs/delivery-system.md) - Bulk delivery features

## Stripe Product Sync (From docs/STRIPE_PRODUCT_SYNC.md)
# Stripe Product Catalog Sync

This document explains how to set up and use the automatic Stripe Product Catalog sync for Services and ServiceBundles.

## Overview

When you create or update a Service or ServiceBundle in PhotoProOS, it automatically syncs to your Stripe Product Catalog. This means:

- Products appear in your Stripe Dashboard under Products
- Checkout sessions can use Stripe Price IDs for better reporting
- Price changes are handled automatically (old prices archived, new prices created)

## Setup

### 1. Environment Variables

Ensure you have your Stripe secret key configured in `.env`:

```env
STRIPE_SECRET_KEY=sk_live_xxx  # or sk_test_xxx for testing
```

### 2. Run Database Migration

The feature requires new fields on the Service and ServiceBundle models. Run the Prisma migration:

```bash
npx prisma migrate dev --name add-stripe-product-sync-fields
```

Or if you're deploying to production:

```bash
npx prisma migrate deploy
```

### 3. Sync Existing Products (Optional)

If you have existing services and bundles that were created before this feature, you can bulk sync them to Stripe.

Create a one-time script or use the Next.js API route:

```typescript
// Example: Create an API route at /api/admin/sync-stripe-products

import { syncAllServicesToStripe, syncAllBundlesToStripe } from "@/lib/stripe/product-sync";
import { requireOrganizationId } from "@/lib/actions/auth-helper";

export async function POST() {
  const organizationId = await requireOrganizationId();

  const [servicesResult, bundlesResult] = await Promise.all([
    syncAllServicesToStripe(organizationId),
    syncAllBundlesToStripe(organizationId),
  ]);

  return Response.json({
    services: servicesResult,
    bundles: bundlesResult,
  });
}
```

## How It Works

### Automatic Sync on CRUD Operations

| Action | What Happens in Stripe |
|--------|------------------------|
| **Create Service/Bundle** | Creates Stripe Product with Price |
| **Update Name/Description** | Updates Stripe Product metadata |
| **Update Price** | Archives old Price, creates new Price |
| **Delete/Archive** | Archives Stripe Product and Price |
| **Toggle Active Status** | Activates/deactivates Stripe Product |
| **Duplicate** | Creates new Stripe Product for the copy |

### Stripe Price Immutability

Stripe Prices cannot be modified once created. When you change a service's price:

1. The old Price is archived (still visible in Stripe, but inactive)
2. A new Price is created with the new amount
3. The new Price ID is stored in the database

### Checkout Integration

When processing orders, the system:

1. Checks if the service/bundle has a synced Stripe Price ID
2. Verifies the stored price matches the order item price
3. Uses the Stripe Price ID if available (better for Stripe reporting)
4. Falls back to inline `price_data` if prices don't match or no sync exists

This ensures flexibility for custom pricing while leveraging Stripe's product catalog.

## Database Fields

### Service Model

```prisma
model Service {
  // ... existing fields ...

  stripeProductId String?    // Stripe Product ID (prod_xxx)
  stripePriceId   String?    // Stripe Price ID (price_xxx)
  stripeSyncedAt  DateTime?  // Last successful sync timestamp
}
```

### ServiceBundle Model

```prisma
model ServiceBundle {
  // ... existing fields ...

  stripeProductId String?    // Stripe Product ID (prod_xxx)
  stripePriceId   String?    // Stripe Price ID (price_xxx)
  stripeSyncedAt  DateTime?  // Last successful sync timestamp
}
```

## API Reference

### syncServiceToStripe(service, organizationId)

Syncs a single service to Stripe. Called automatically on create/update.

```typescript
import { syncServiceToStripe } from "@/lib/stripe/product-sync";

const result = await syncServiceToStripe(service, organizationId);
// { success: true, stripeProductId: "prod_xxx", stripePriceId: "price_xxx" }
```

### syncBundleToStripe(bundle, organizationId)

Syncs a single bundle to Stripe. Called automatically on create/update.

```typescript
import { syncBundleToStripe } from "@/lib/stripe/product-sync";

const result = await syncBundleToStripe(bundle, organizationId);
// { success: true, stripeProductId: "prod_xxx", stripePriceId: "price_xxx" }
```

### archiveStripeProduct(stripeProductId, stripePriceId)

Archives a product and its price in Stripe. Called when deleting/deactivating.

```typescript
import { archiveStripeProduct } from "@/lib/stripe/product-sync";

await archiveStripeProduct("prod_xxx", "price_xxx");
```

### reactivateStripeProduct(stripeProductId, stripePriceId)

Reactivates an archived product. Called when re-enabling a service/bundle.

```typescript
import { reactivateStripeProduct } from "@/lib/stripe/product-sync";

await reactivateStripeProduct("prod_xxx", "price_xxx");
```

### syncAllServicesToStripe(organizationId)

Bulk syncs all active services for an organization.

```typescript
import { syncAllServicesToStripe } from "@/lib/stripe/product-sync";

const result = await syncAllServicesToStripe(organizationId);
// { synced: 15, failed: 2, errors: ["Service X: error message"] }
```

### syncAllBundlesToStripe(organizationId)

Bulk syncs all active bundles for an organization.

```typescript
import { syncAllBundlesToStripe } from "@/lib/stripe/product-sync";

const result = await syncAllBundlesToStripe(organizationId);
// { synced: 5, failed: 0, errors: [] }
```

### checkStripeSyncStatus(items)

Check if items are synced to Stripe before checkout.

```typescript
import { checkStripeSyncStatus } from "@/lib/stripe/product-sync";

const status = await checkStripeSyncStatus([
  { type: "service", id: "service_123" },
  { type: "bundle", id: "bundle_456" },
]);
// { allSynced: false, unsyncedItems: [{ type: "service", id: "...", name: "..." }] }
```

## Stripe Dashboard

After syncing, you'll see your products in the Stripe Dashboard:

1. Go to **Products** in your Stripe Dashboard
2. Products are labeled with metadata:
   - `listinglens_service_id` or `listinglens_bundle_id`
   - `listinglens_organization_id`
   - `type`: "service" or "bundle"
   - `category` (for services)
   - `bundle_type` (for bundles)

## Troubleshooting

### Products Not Syncing

1. Check that `STRIPE_SECRET_KEY` is set correctly
2. Verify the service/bundle was created/updated after this feature was deployed
3. Check server logs for "Failed to sync" error messages
4. Manually trigger sync using `syncServiceToStripe()` or `syncBundleToStripe()`

### Price Mismatch in Checkout

If checkout falls back to inline `price_data`:

- The order item price doesn't match the current service/bundle price
- This is expected behavior for custom-priced orders
- The product still appears correctly in Stripe

### Viewing Sync Status

Check if a service is synced:

```typescript
const service = await prisma.service.findUnique({
  where: { id: "..." },
  select: {
    stripeProductId: true,
    stripePriceId: true,
    stripeSyncedAt: true,
  },
});

if (service.stripePriceId) {
  console.log(`Synced at ${service.stripeSyncedAt}`);
} else {
  console.log("Not synced to Stripe");
}
```

## Notes

- Sync operations are **non-blocking** - they run in the background after the local database operation completes
- If Stripe sync fails, the local operation still succeeds (logged as an error)
- Archived Stripe products can be viewed in the Stripe Dashboard under "Archived"
- Each organization's products are tagged with `listinglens_organization_id` for filtering

## Services Implementation Plan (From docs/SERVICES_IMPLEMENTATION_PLAN.md)
# Services Implementation Plan

## Overview

This document outlines the implementation plan for a comprehensive Services Management System in PhotoProOS. Services are the pricing packages photographers offer to clients, and this feature will allow full CRUD operations, database persistence, and integration with galleries and bookings.

## Current State

### What Exists
- **Static services library** (`/src/lib/services.ts`) - 24 predefined photography services
- **ServiceSelector component** (`/src/components/dashboard/service-selector.tsx`) - UI for selecting/creating services
- **Integration points** - Used in `/galleries/new`, `/galleries/[id]/edit`, `/scheduling/new`, `/scheduling/[id]/edit`
- **BookingType model** - Basic service-like table in Prisma schema (limited functionality)

### What's Missing
- No database persistence for custom services
- No services management UI
- No CRUD operations for services
- Services not linked to galleries in database
- No service analytics or usage tracking

---

## Implementation Plan

### Phase 1: Database Schema (Priority: Critical)

#### 1.1 Create Service Model in Prisma

```prisma
model Service {
  id              String          @id @default(cuid())
  organizationId  String
  name            String
  category        String          // Maps to ServiceCategory
  description     String?
  priceCents      Int
  duration        String?         // e.g., "2-3 hours"
  deliverables    String[]        // Array of included items
  isActive        Boolean         @default(true)
  isDefault       Boolean         @default(false) // Predefined vs custom
  sortOrder       Int             @default(0)
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  organization    Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  projects        Project[]       // Galleries using this service
  bookings        Booking[]       // Bookings using this service

  @@index([organizationId])
  @@index([category])
  @@index([isActive])
}
```

#### 1.2 Update Project Model (Gallery)

```prisma
model Project {
  // ... existing fields
  serviceId       String?
  service         Service?        @relation(fields: [serviceId], references: [id])
}
```

#### 1.3 Update Booking Model

```prisma
model Booking {
  // ... existing fields
  serviceId       String?
  service         Service?        @relation(fields: [serviceId], references: [id])
}
```

---

### Phase 2: Services Management UI (Priority: High)

#### 2.1 Navigation Structure

Services will appear as a **tab within the Galleries section**:

```
/galleries                  -> Galleries tab (default)
/galleries?tab=services     -> Services tab
/galleries/services         -> Services list (alternate route)
/galleries/services/new     -> Create new service
/galleries/services/[id]    -> Edit service
```

#### 2.2 Services Tab Component

Located at: `/src/app/(dashboard)/galleries/services-tab.tsx`

Features:
- Grid/List view toggle (consistent with gallery list)
- Search by service name
- Filter by category
- Sort by name, price, usage count
- Quick actions (edit, duplicate, archive, delete)

#### 2.3 Services List Client Component

Located at: `/src/app/(dashboard)/galleries/services-list-client.tsx`

```typescript
interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  priceCents: number;
  duration: string | null;
  deliverables: string[];
  isActive: boolean;
  usageCount?: number; // Galleries + Bookings using this service
}
```

Features:
- Card view: Service name, category badge, price, deliverables preview
- Table view: All details in columns
- Usage indicator (how many galleries/bookings use it)
- Status toggle (active/inactive)

#### 2.4 Service Form Component

Located at: `/src/components/dashboard/service-form.tsx`

Reuses styling from ServiceSelector but as a full-page form:
- Service name (required)
- Category dropdown (required)
- Price input (required)
- Duration field
- Description textarea
- Deliverables manager (tags with add/remove)
- Active status toggle

---

### Phase 3: API & Server Actions (Priority: High)

#### 3.1 Server Actions

Located at: `/src/lib/actions/services.ts`

```typescript
// Create service
export async function createService(data: CreateServiceInput): Promise<Service>

// Update service
export async function updateService(id: string, data: UpdateServiceInput): Promise<Service>

// Delete service (soft delete - set isActive = false)
export async function archiveService(id: string): Promise<void>

// Permanently delete (only if unused)
export async function deleteService(id: string): Promise<void>

// Duplicate service
export async function duplicateService(id: string): Promise<Service>

// Get all services for organization
export async function getServices(filters?: ServiceFilters): Promise<Service[]>

// Get single service
export async function getService(id: string): Promise<Service | null>

// Bulk update prices
export async function bulkUpdatePrices(updates: { id: string; priceCents: number }[]): Promise<void>
```

#### 3.2 Validation Schemas

Located at: `/src/lib/validations/services.ts`

```typescript
import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100),
  category: z.enum([
    "real_estate", "portrait", "event", "commercial",
    "wedding", "product", "other"
  ]),
  description: z.string().max(500).optional(),
  priceCents: z.number().min(0, "Price must be positive"),
  duration: z.string().max(50).optional(),
  deliverables: z.array(z.string().max(100)).max(20),
  isActive: z.boolean().default(true),
});

export type CreateServiceInput = z.infer<typeof serviceSchema>;
export type UpdateServiceInput = Partial<CreateServiceInput>;
```

---

### Phase 4: Integration Updates (Priority: Medium)

#### 4.1 Update ServiceSelector

Modify `/src/components/dashboard/service-selector.tsx`:

1. **Add data fetching** - Load user's custom services from database
2. **Merge with predefined** - Show both default and custom services
3. **"Save as Template" button** - Save custom pricing as new service
4. **Quick edit link** - Link to service edit page

```typescript
interface ServiceSelectorProps {
  // ... existing props
  showCustomServices?: boolean;  // Include user's custom services
  onSaveAsService?: (data: CustomServiceType) => void;  // Callback to save as service
}
```

#### 4.2 Update Gallery Forms

Modify gallery creation/edit to use Service relationship:
- Store `serviceId` instead of just custom pricing
- Load service data when editing
- Option to override service price per-gallery

#### 4.3 Update Booking Forms

Similar updates to scheduling/booking forms.

---

### Phase 5: Seed Data Migration (Priority: Medium)

#### 5.1 Migrate Predefined Services

Update `prisma/seed.ts` to:
1. Create Service records for all predefined photography services
2. Mark them with `isDefault: true`
3. Link to a demo organization

#### 5.2 Mark Predefined Services

In the Service model, `isDefault: true` indicates system-provided templates that:
- Cannot be deleted
- Can be customized (creates a copy)
- Show in a separate "Templates" section

---

### Phase 6: Analytics & Polish (Priority: Low)

#### 6.1 Service Usage Stats

Track and display:
- Total galleries using service
- Total bookings using service
- Revenue generated by service
- Most popular services

#### 6.2 Service Pricing Tiers (Future)

Support for variable pricing:
- Per-item pricing
- Tiered pricing based on quantity
- Add-ons and optional extras

---

## File Structure

```
src/
|--- app/(dashboard)/galleries/
|   |--- page.tsx                    # Add tab navigation (Galleries | Services)
|   |--- services/
|   |   |--- page.tsx                # Services list page
|   |   |--- new/
|   |   |   `--- page.tsx            # Create service page
|   |   `--- [id]/
|   |       `--- page.tsx            # Edit service page
|   |--- services-tab.tsx            # Services tab content component
|   `--- services-list-client.tsx    # Client component for services list
|--- components/dashboard/
|   |--- service-selector.tsx        # Updated with DB integration
|   |--- service-form.tsx            # Full-page service form
|   `--- service-card.tsx            # Service display card
|--- lib/
|   |--- services.ts                 # Keep as fallback/defaults
|   |--- actions/
|   |   `--- services.ts             # Server actions
|   `--- validations/
|       `--- services.ts             # Zod schemas
`--- prisma/
    `--- schema.prisma               # Updated with Service model
```

---

## Implementation Order

### Sprint 1: Foundation (Current)
1.  Create this implementation plan
2. Update Prisma schema with Service model
3. Run migration
4. Create basic services list page at `/galleries/services`

### Sprint 2: Services CRUD
1. Create service form component
2. Create service create page
3. Create service edit page
4. Implement server actions (create, update, delete)
5. Add validation schemas

### Sprint 3: Integration
1. Add Services tab to galleries page
2. Update ServiceSelector to load custom services
3. Update gallery forms to use Service relationship
4. Update booking forms

### Sprint 4: Polish
1. Add bulk operations
2. Add service duplication
3. Add usage analytics
4. Seed default services

---

## UI/UX Design Notes

### Services Tab Design

The Services tab should match the existing gallery list styling:

- **Header**: "Services" title with "Create Service" button
- **Filter bar**: Category pills (All, Real Estate, Portrait, Event, etc.)
- **View toggle**: Grid/List views
- **Sort dropdown**: Name, Price (High/Low), Most Used, Recently Added

### Service Card Design (Grid View)

```
-------------------------------------
|  ------  Real Estate              |
|  | $450 |  Luxury Property Package  |
|  `-------                           |
|  Premium photography for high-end   |
|  properties with drone & twilight   |
|                                     |
|  [x] 40-60 edited photos             |
|  [x] Twilight shots                  |
|  [x] Drone aerials                   |
|  [x] Virtual tour                    |
|                                     |
|  2-3 hours    Used in 12 galleries |
|                          [] Menu   |
`--------------------------------------
```

### Service Row Design (Table View)

| Name | Category | Price | Duration | Galleries | Bookings | Status | Actions |
|------|----------|-------|----------|-----------|----------|--------|---------|
| Luxury Property | Real Estate | $450 | 2-3 hrs | 12 | 3 | Active |  |

---

## Database Considerations

### Handling Predefined Services

Two approaches:

**Option A: Copy on Use (Recommended)**
- Predefined services exist as templates
- When user selects one, a copy is created with `isDefault: false`
- User can modify their copy without affecting template

**Option B: Reference Only**
- Predefined services have static IDs
- Projects/Bookings reference them directly
- Requires handling missing defaults gracefully

### Migration Strategy

1. Add Service model to schema
2. Seed predefined services for all organizations
3. Migrate existing gallery/booking pricing to Service references
4. Keep backward compatibility with `priceCents` field

---

## Testing Checklist

- [ ] Create new service with all fields
- [ ] Edit existing service
- [ ] Archive service (should not delete if in use)
- [ ] Delete unused service
- [ ] Duplicate service
- [ ] Filter services by category
- [ ] Search services by name
- [ ] Sort services by various fields
- [ ] Select service in gallery creation
- [ ] Select service in booking creation
- [ ] Override service price in gallery
- [ ] View service usage stats

---

## Changelog Entry (Preview)

```markdown
### Added (Services Management System)
- Created Service database model with full CRUD support
- Added Services tab to Galleries section (`/galleries?tab=services`)
- Created services list page with grid/table view, search, filter, sort
- Created service creation form with deliverables manager
- Created service edit page with usage stats
- Implemented server actions for service operations
- Updated ServiceSelector to load custom services from database
- Added "Save as Service" feature in ServiceSelector
- Connected galleries and bookings to Service model
- Added service usage analytics
```

---

## Questions to Resolve

1. **Service Templates**: Should we show default templates separately from custom services?
2. **Pricing Tiers**: Do we need to support variable pricing (per-hour, per-photo)?
3. **Service Inheritance**: When a service is updated, should existing galleries update?
4. **Archive vs Delete**: Should archived services still appear in analytics?

---

*Last updated: December 31, 2024*