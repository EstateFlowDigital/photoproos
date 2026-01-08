# Tutorials Program Plan

This plan defines how we’ll produce “never-used-it-before” tutorials for every feature in PhotoProOS. It includes personas, a standard template, priority order, and a feature inventory grouped by module.

## Personas & Outcomes
- **Solo photographer:** fast setup, bookings, delivery, payments.
- **Studio admin/producer:** team, scheduling, invoicing, approvals, reports.
- **Accountant/ops:** billing, payouts, tax, exports.
- **Assistant/contractor:** limited access, tasks, messaging.

Each tutorial states: who it’s for, prerequisites, time-to-complete, and “you’ll be able to…” outcome.

## Tutorial Template (Markdown)
Use this for every feature to keep structure consistent.

````markdown
# [Feature] — How to use it
- **Who this is for:** [persona/role]
- **What you’ll accomplish:** [outcome in one line]
- **Prerequisites:** [data, permissions, setup]
- **Time to complete:** [estimate]

## Steps
1) [Step name] — [action + why] (screenshot/GIF)
2) ...

## Common pitfalls
- [list]

## Pro tips
- [shortcuts, best practices]

## Troubleshooting
- [error/recovery paths]

## Success check
- [what to confirm]

## Related
- [links to adjacent tutorials/features]
````

## Assets & Setup
- Use a dedicated demo org with seeded data (sample clients, bookings, invoices, galleries, messages).
- Capture desktop and mobile where UI differs; use consistent annotations.
- Note keyboard shortcuts and role-based differences.

## Priority Order (Phase 1 “Day 1” Tutorials)
1) Onboarding & account/profile setup  
2) Import/create clients & contacts  
3) Scheduling/booking a session (with availability & buffers)  
4) Creating and sending an invoice (with payment links)  
5) Delivering a gallery to a client (passwords/expirations)  
6) Messaging a client and handling replies/typing indicators  
7) Contracts/signatures for a booking  
8) Notifications/preferences (email/SMS/in-app)  
9) Payments & payouts setup (Stripe)  
10) Quick insights/analytics dashboard basics  

## Feature Inventory by Module
- **Onboarding & Profile:** account creation, org settings, branding, time zone, team invite.
- **Clients/CRM:** add/import clients, merge duplicates, tags, client portal access, preferences.
- **Scheduling/Bookings:** availability, buffers, booking types/forms, self-booking page, time off, approvals, reschedule/cancel, reminders.
- **Projects/Tasks:** kanban/list views, templates, dependencies, recurring tasks, drag/drop, bulk actions, filters/sorts.
- **Galleries/Delivery:** create gallery, upload, passwords, expirations, download limits, favorites/comments, proof sheets, archive/auto-archive.
- **Contracts/Signatures:** templates, merge fields, send, countersign, reminders, audit trail.
- **Billing/Payments:** invoices, estimates, retainers, credit notes, split invoices, payment links, tax, late fees, payouts, exports.
- **Messaging/Inbox:** conversations, requests, typing indicators, calls, forwarding, scheduled messages, starred messages, attachments.
- **Automations/Workflows:** cron jobs (reminders/follow-ups), triggers, templates, scheduled messages, notifications.
- **Analytics/Reporting:** dashboards, filters, export/share, KPI definitions.
- **Integrations:** Stripe, email (Gmail), Dropbox, Google/QuickBooks, Slack, calendar feeds; auth flows and scopes.
- **Settings (Org/User):** branding, notifications, SMS/email settings, appearance, travel, developer/API keys.
- **Client Portal:** invite/login, viewing orders/galleries, payments, questionnaires.
- **Gamification/Achievements:** viewing achievements, claiming daily bonus, quests (if enabled).
- **Marketplace (planned):** search/filter, profile view, CTAs, reviews, sponsored slots.
- **Equipment Exchange (planned):** list gear, certification, checkout/escrow, shipping labels, disputes.

## Module-Level Walkthrough Blueprints (What/Why/How)
Use these as seeds for the full tutorials. Each item should include: why it exists (user benefit), when to use it, and step-by-step “how” following the template.

- **Onboarding & Profile**
  - Why: set org identity, timezone, and roles so downstream bookings, invoices, and emails are correct.
  - How: create org → set branding/logo/colors → confirm timezone/currency → invite team → pick default modules → verify email/SMS.
  - Pitfalls: wrong timezone, missing branding in client-facing assets.

- **Clients/CRM**
  - Why: keep a clean client list for messaging, billing, and portal access.
  - How: import CSV vs. manual add → tag/segment → merge duplicates → set client preferences (channel, language) → portal invite.
  - Pitfalls: duplicate contacts, missing consent flags.

- **Scheduling/Bookings**
  - Why: avoid double-booking, offer self-serve booking, capture intake data.
  - How: set availability & buffers → define booking types/forms → enable self-booking page → add time off → confirm/reschedule/cancel flows → reminders/notifications.
  - Pitfalls: buffers not set, form required fields missing, timezone mismatches.

- **Projects/Tasks**
  - Why: track production tasks and SLAs.
  - How: create board/list → add tasks/subtasks → apply templates → set dependencies/recurring → bulk move/assign → filters/sorts → save views.
  - Pitfalls: missing dependencies, recurring tasks without end.

- **Galleries/Delivery**
  - Why: deliver assets securely, collect feedback/favorites.
  - How: create gallery → upload → set passwords/expirations/download limits → favorites/comments → proof sheets → archive/auto-archive → send link.
  - Pitfalls: no password, expiration too short/long, missing download toggle.

- **Contracts/Signatures**
  - Why: lock scope and terms; reduce disputes.
  - How: pick/create template → merge fields → send for signature → reminders → countersign → view audit trail.
  - Pitfalls: unbound dates, missing countersign, outdated template.

- **Billing/Payments**
  - Why: get paid on time with clear terms.
  - How: create invoice/estimate/retainer → tax/late fee settings → payment links → split invoices/credit notes → payouts setup → exports.
  - Pitfalls: wrong currency/tax, unpaid reminders disabled, no payout account.

- **Messaging/Inbox**
  - Why: centralize client comms and capture context.
  - How: open conversation/requests → send messages/attachments → see typing indicators → forward/bridge email → schedule messages → star messages → call interface (if enabled).
  - Pitfalls: channel mismatch, missing notifications, forwarding loops.

- **Automations/Workflows**
  - Why: reduce manual follow-ups and reminders.
  - How: enable cron jobs (reminders/follow-ups) → create templates → set triggers/targets → test runs → monitor logs.
  - Pitfalls: wrong audience, duplicate sends, time windows.

- **Analytics/Reporting**
  - Why: track revenue, bookings, delivery SLAs.
  - How: open dashboards → adjust date/service filters → export/share → read KPI definitions.
  - Pitfalls: misreading filters/timezone.

- **Integrations**
  - Why: sync payments, files, email, calendar, accounting.
  - How: connect Stripe/Gmail/Dropbox/Google/QuickBooks/Slack/calendar → grant scopes → verify sync → test sample action.
  - Pitfalls: missing scopes, disabled webhooks, sandbox vs. live keys.

- **Settings (Org/User)**
  - Why: control brand, notifications, appearance, travel, developer/API keys.
  - How: update branding assets → notifications (email/SMS/in-app) → SMS/email settings → appearance/density → travel preferences → API keys.
  - Pitfalls: unverified sender domains, overly aggressive notification toggles.

- **Client Portal**
  - Why: self-serve access to galleries/orders/payments/questionnaires.
  - How: invite client → portal login → view/download/pay → submit questionnaires → manage notifications.
  - Pitfalls: expired invites, wrong portal permissions.

- **Gamification/Achievements**
  - Why: drive engagement and completion of key actions.
  - How: view achievements → claim daily bonus → track quests (if enabled) → see impact on profile/marketplace badges.
  - Pitfalls: missed claim windows, not linking to real actions.

- **Marketplace (planned)**
  - Why: attract leads; paid placement; reviews.
  - How: publish profile → add portfolio/tags → set visibility/pricing → manage reviews → monitor placement performance.
  - Pitfalls: incomplete profile, unmanaged reviews, overspending bids.

- **Equipment Exchange (planned)**
  - Why: buy/sell certified gear among verified pros.
  - How: create listing with photos/serials → request/upload certification → set shipping/pickup → checkout via escrow → shipping label → receive/inspect → release funds or dispute.
  - Pitfalls: uncertified listings, missing serials, no proof-of-condition, dispute timelines ignored.

## Execution Phases
- **Phase 1:** Finish inventory, lock template, seed demo data, ship top 10 tutorials.
- **Phase 2:** Cover remaining core modules (projects, galleries advanced, billing advanced, messaging, automations, integrations).
- **Phase 3:** Add planned modules (marketplace, equipment exchange), edge cases, role variants, and mobile deltas.
- **Phase 4:** Wire tutorials into in-app help; add localization strategy and a quarterly audit process.

## Maintenance
- Tag tutorials to features; update when changelog flags UI/flow changes.
- Include version/date and reviewer; quarterly audit of screenshots and steps.
