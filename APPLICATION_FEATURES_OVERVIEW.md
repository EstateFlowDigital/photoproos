# PhotoProOS – Comprehensive Feature Overview

This document captures the full surface area of the application as it exists today, organized by module with a short “what/why/how it’s used” description. It is intentionally exhaustive rather than marketing-focused.

## Workspace & Navigation
- Unified sidebar + context pane: Single code path for all breakpoints, collapsible to icons by screen size; secondary pane shows sub-links for the selected module.
- Command palette (Cmd/Ctrl+K or “/”): Global search and jump-to navigation across records (projects, clients, galleries, invoices, bookings, etc.).
- Quick Actions tray: Frequent creators (project, booking, invoice, client, gallery, contract) from anywhere.
- Skip links + focus states: Keyboard and screen reader affordances.
- Notifications drawer: Unread badges, per-item navigation, mark-read flows.

## Clients & CRM
- Client profiles: Contacts, organizations, tags, referral source, linked projects/bookings/invoices/galleries/tasks.
- Client portal: Self-service access to invoices, questionnaires, galleries, contracts, and status visibility.
- Client import & dedupe: CSV import plus merge to keep a clean CRM.
- Lead capture: Public forms feed into clients/leads with status tracking.
- Referral tracking & segmentation: Source tracking; roadmap for VIP tiers/custom fields.

## Projects, Boards, Tasks
- Projects: Kanban and list views; statuses/columns; filters (priority, tags, due dates).
- Tasks: Priorities, tags, due dates, assignees, project/client linking, subtasks, quick add.
- Multi-day events: Sessions per project (e.g., weddings/events) with per-session scheduling.
- Analytics: Board metrics for throughput/bottlenecks and completion rates.
- Attachments and links: Connect tasks to galleries, bookings, and contracts where relevant.

## Scheduling & Availability
- Bookings (single/recurring): Create/confirm/complete/cancel with conflict detection and travel/prep buffers.
- Availability windows: Min/max advance booking windows, booking buffers, working hours.
- Time-off & team availability: Track blocked dates; visual badges in scheduling UI.
- Booking types & forms: Type-specific intake + public booking forms for self-service scheduling.
- Assigned photographer: Persisted assigned user per booking with validation.
- Reminders: Automated email reminders (24h/1h); roadmap for SMS.
- Calendar views: Board/List/Calendar tabs for scheduling context.

## Forms & Questionnaires
- Custom forms/questionnaires: Builder, templates, assignment, and public form links.
- Submissions: Storage, review, convert-to-booking/lead flows.
- Public lead forms: Feed leads into CRM with status and source tracking.

## Galleries, Proofing & Delivery
- Gallery creation/delivery: Upload, organize, password/expiry controls, per-gallery branding.
- Favorites/downloads/selections: Client proofing, download tracking, and selections for culling.
- Services per gallery: Link services/packages to a gallery for alignment with deliverables.
- Activity timelines: Views, downloads, payments surfaced for auditability.
- Proof sheet generation: PDF proof sheets (with current hydration guardrails).

## Properties, Portfolios & Websites
- Property websites: Single-property pages with media, details, and agent branding.
- Portfolio sites: Collections/portfolios for marketing.
- Mini-sessions & licensing: Specialized flows for limited slots and licensing packages.
- Custom domains (roadmap) and SEO tools (meta/social cards planned).

## Orders, Products & Catalogs
- Products/catalogs: Define products/add-ons for upsells and sales.
- Order pages: Client-facing order flows with pricing and fulfillment status.
- Batch processing: Bulk operations and exports for high-volume work.

## Invoicing, Payments, Billing & Retainers
- Invoices & payment links: Stripe-powered invoices, installment/payment plans, late fees/discounts.
- Payments & payouts: Track payments, statuses, refunds, and photographer payouts.
- Retainers: Balances, deposits, usage tracking, and low-balance alerts.
- Billing & plan: Org billing, branding on receipts/invoices, upcoming multi-currency.
- Payment activity inside galleries: Revenue tied to gallery activity streams and summaries.

## Contracts & Legal
- Contract templates: Variables for fast, consistent generation.
- E-signature flow: Signing links, completion tracking; roadmap for multi-party signatures.
- Model/venue releases & versioning (roadmap): Compliance for specialized shoots.

## Services, Scheduling Types & Packages
- Services/add-ons/bundles: Price-controlled offerings for scheduling and quotes.
- Equipment checklists: Per-service/booking-type gear lists to reduce on-site risk.
- Travel policies: Mileage/travel buffers and policies captured in settings.

## Leads, Inbox & Communications
- Inbox/leads: Lead pipeline with statuses, tags, and assignment.
- Email/SMS templates: Configurable templates; delivery/status logging.
- Notifications center: In-app notifications with contextual navigation.
- Activity feeds: Per-project/per-gallery timelines for audits.

## Analytics, Reporting & Ops
- Revenue analytics: Forecasting, LTV, payment summaries per gallery/project.
- Scheduling analytics: Utilization, conflicts avoided, completion stats.
- Gallery engagement: Views/downloads/selection insights.
- Web Vitals telemetry: Client-side performance signals for QA.
- Ops safety nets: Buffers, conflict checks, validation on assignments/time-off.

## Integrations & Platform
- Auth & orgs: Clerk-based auth, multi-org membership, roles/permissions.
- Stripe: Payments, invoices, payouts.
- Storage: Cloudflare R2 + optional Dropbox flows.
- Calendar stubs/settings: External calendar coordination (deeper sync on roadmap).
- Slack/Mailchimp/QuickBooks/Zapier: Integration stubs and settings scaffolding.
- Webhooks/API (roadmap): Planned extensibility for automation partners.

## Appearance, Branding & Experience
- Themes & quick switcher: Light/dark, brand colors, watermark controls.
- Gallery/property/portal branding: Consistent client-facing experience.
- Invoice/contract theming: Logos, colors, and layout polish for client trust.

## Onboarding, Settings & Admin
- Onboarding checklist: Guided setup (payments, branding, services, portal).
- Team roles/territories: Roles/capabilities; feature flags via settings.
- Organization/profile caching: Persist org/user selection and preferences between pages.
- Error handling & resilience: Hydration safeguards, deterministic IDs, retryable flows.

## Why this level of detail matters
- Single source of truth: Clients, projects, bookings, invoices, galleries, and properties are linked to avoid double entry.
- Operational safety: Conflict checks, buffers, reminders, and time-off enforcement prevent overbooking and missed comms.
- Cash flow focus: Invoices, payments, retainers, and gallery-tied payments shorten time-to-cash.
- Client experience: Portal, galleries, questionnaires, and contracts keep clients informed and self-served.
- Extensibility: Modular navigation, submenus, and integration settings allow new modules without UI sprawl.
