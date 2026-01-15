# PhotoProOS Pricing Structure

This document provides a comprehensive overview of the PhotoProOS pricing tiers, feature limits, and the philosophy behind each plan.

## Table of Contents

1. [Plan Overview](#plan-overview)
2. [Beta & Lifetime Deals](#beta--lifetime-deals)
3. [Plan Philosophy](#plan-philosophy)
4. [Detailed Limits by Plan](#detailed-limits-by-plan)
5. [Feature Flags by Plan](#feature-flags-by-plan)
6. [Storage Model](#storage-model)
7. [Transaction Fees](#transaction-fees)
8. [Implementation Files](#implementation-files)
9. [Updating Pricing](#updating-pricing)

---

## Plan Overview

### Beta Pricing (Current)

| Plan | Monthly | Annual (per mo) | Lifetime Deal | Storage |
|------|---------|-----------------|---------------|---------|
| **Free** | $0 | $0 | N/A | 25 GB |
| **Pro** | $49 | $39 ($470/yr) | **$500** | 500 GB |
| **Studio** | $99 | $79 ($950/yr) | **$1,000** | 1 TB |
| **Enterprise** | $349 | $279 ($3,350/yr) | **$3,500** | Unlimited (10 TB soft cap) |

### Post-Beta Pricing (Future)

| Plan | Monthly | Annual (per mo) | Lifetime Deal | Storage |
|------|---------|-----------------|---------------|---------|
| **Free** | $0 | $0 | N/A | 25 GB |
| **Pro** | $79 | $66 ($790/yr) | $799 | 500 GB |
| **Studio** | $149 | $124 ($1,490/yr) | $1,499 | 1 TB |
| **Enterprise** | $549 | $458 ($5,490/yr) | $5,499 | Unlimited (10 TB soft cap) |

### Storage Add-On

All paid plans can purchase additional storage:
- **Price:** $199/month per 10 TB
- **LTD Discount:** 10% off ($179/month per 10 TB)
- **Note:** Free plan users must upgrade to purchase additional storage

### Key Value Propositions

| Plan | Key Value |
|------|-----------|
| **Free** | Try the platform risk-free with 25 GB |
| **Pro** | 500 GB storage for growing photographers |
| **Studio** | 1 TB storage + unlimited usage for busy studios |
| **Enterprise** | Unlimited storage (10 TB included) for agencies |

---

## Beta & Lifetime Deals

### Beta Pricing

During the beta period, all pricing is discounted from future regular prices:

- **Beta Period End:** June 30, 2025 (configurable)
- **Price Increase:** ~60% increase on monthly rates post-beta
- **Annual Discount:** 20% off monthly equivalent
- **Marketing:** Strikethrough showing regular prices to emphasize savings

### Lifetime Deal (LTD)

Lifetime deals are one-time payments that grant permanent access to a plan tier.

| Plan | Beta LTD Price | Regular LTD Price |
|------|----------------|-------------------|
| Pro | $500 | $799 |
| Studio | $1,000 | $1,499 |
| Enterprise | $3,500 | $5,499 |

#### LTD Includes

- All current and future features
- All modules and updates forever
- Storage allocation per plan tier (Pro: 500GB, Studio: 1TB, Enterprise: 10TB)
- **10% discount** on all in-app purchases (custom domains, storage overages)
- Storage add-ons at discounted rate ($179/10TB instead of $199)
- Priority support
- No recurring payments ever

#### LTD Storage Policy

- **Storage is LOCKED at time of purchase** - If LTD holder exceeds their plan's storage, they must purchase storage add-ons
- **Example:** Pro LTD buyer gets 500GB forever. If they need 600GB, they pay for additional storage
- **Future increases:** If plan storage limits increase, LTD holders get the upgrade

#### LTD Scarcity

- **Total Slots:** 500 (configurable in `BETA_SETTINGS`)
- **Availability:** Beta exclusive (may be offered periodically post-beta)
- **Display:** Remaining slots shown to create urgency

### Implementation

Beta and LTD settings are configured in `src/lib/plan-limits.ts`:

```typescript
export const BETA_SETTINGS = {
  isBetaActive: true,
  betaEndsAt: new Date("2025-06-30T23:59:59Z"),
  ltdSlotsTotal: 500,
  ltdSlotsRemaining: 500,
  ltdInAppDiscount: 0.10, // 10% discount
  storageOverageRates: { ... }
};
```

---

## Plan Philosophy

### Free Plan
**Target:** Photographers trying out PhotoProOS or with minimal needs.

- 25 GB storage (hard cap - must upgrade for more)
- Full access to all modules (just with usage caps)
- PhotoProOS branding on client-facing pages
- No payment processing capabilities
- Cannot purchase storage add-ons

### Pro Plan ($49/month)
**Target:** Growing photographers who need more space.

**Key Differentiator: 500 GB STORAGE + GALLERY SLEEP MODE**

- 500 GB unified storage
- Good for photographers with moderate client volume
- Gallery Sleep Mode to archive galleries without counting against quota
- Can purchase additional storage ($199/10TB)
- No API access or white-label (upgrade to Studio for these)

### Studio Plan ($99/month)
**Target:** Busy studios and teams with high usage needs.

**Key Differentiator: 1 TB STORAGE + UNLIMITED USAGE**

- 1 TB unified storage
- Unlimited galleries, clients, invoices, bookings
- White-label client portal (remove PhotoProOS branding)
- API and webhook access for integrations
- Advanced analytics dashboard
- Gallery Sleep Mode included
- Can purchase additional storage ($199/10TB)

### Enterprise Plan ($349/month)
**Target:** Agencies and large organizations.

**Key Differentiator: UNLIMITED STORAGE (10TB SOFT CAP)**

- Unlimited storage marketed, 10TB soft cap included
- Everything truly unlimited
- SSO/SAML for enterprise security
- Dedicated support representative
- SLA guarantee
- Custom integrations available
- Gallery Sleep Mode included
- Additional storage at $199/10TB if needed

---

## Detailed Limits by Plan

### Storage & Files

| Limit | Free | Pro | Studio | Enterprise |
|-------|------|-----|--------|------------|
| Storage | 25 GB | 500 GB | 1 TB | Unlimited (10 TB soft cap) |
| Active Galleries | 5 | 50 | Unlimited | Unlimited |
| Photos per Gallery | 100 | 500 | Unlimited | Unlimited |
| Gallery Sleep Mode | No | Yes | Yes | Yes |
| Storage Add-on | Upgrade required | $199/10TB | $199/10TB | $199/10TB |

### Clients & CRM

| Limit | Free | Pro | Studio | Enterprise |
|-------|------|-----|--------|------------|
| Total Clients | 25 | 100 | Unlimited | Unlimited |
| Total Leads | 50 | 200 | Unlimited | Unlimited |

### Team

| Limit | Free | Pro | Studio | Enterprise |
|-------|------|-----|--------|------------|
| Team Members | 1 | 3 | 10 | Unlimited |

### Billing

| Limit | Free | Pro | Studio | Enterprise |
|-------|------|-----|--------|------------|
| Invoices/Month | 10 | 50 | Unlimited | Unlimited |
| Contracts/Month | 3 | 25 | Unlimited | Unlimited |
| Estimates/Month | 5 | 25 | Unlimited | Unlimited |

### Communication

| Limit | Free | Pro | Studio | Enterprise |
|-------|------|-----|--------|------------|
| Emails/Month | 100 | 500 | Unlimited | Unlimited |
| SMS/Month | 0 | 50 | 500 | Unlimited |
| Email Accounts Synced | 1 | 2 | 10 | Unlimited |

### AI & Advanced

| Limit | Free | Pro | Studio | Enterprise |
|-------|------|-----|--------|------------|
| AI Credits/Month | 10 | 100 | 1,000 | Unlimited |
| Marketing Generations/Month | 5 | 25 | 250 | Unlimited |

### Properties & Websites

| Limit | Free | Pro | Studio | Enterprise |
|-------|------|-----|--------|------------|
| Active Properties | 3 | 25 | Unlimited | Unlimited |
| Portfolio Websites | 1 | 3 | Unlimited | Unlimited |
| Custom Domains | 0 | 1 | 10 | Unlimited |

### Scheduling

| Limit | Free | Pro | Studio | Enterprise |
|-------|------|-----|--------|------------|
| Bookings/Month | 20 | 100 | Unlimited | Unlimited |
| Booking Types | 3 | 10 | Unlimited | Unlimited |

### Other

| Limit | Free | Pro | Studio | Enterprise |
|-------|------|-----|--------|------------|
| Questionnaire Templates | 3 | 10 | Unlimited | Unlimited |
| Contract Templates | 2 | 10 | Unlimited | Unlimited |
| Canned Responses | 5 | 25 | Unlimited | Unlimited |
| Service Packages | 5 | 20 | Unlimited | Unlimited |
| Discount Codes | 3 | 10 | Unlimited | Unlimited |

---

## Feature Flags by Plan

| Feature | Free | Pro | Studio | Enterprise |
|---------|------|-----|--------|------------|
| Custom Branding | Yes | Yes | Yes | Yes |
| White Label | No | No | Yes | Yes |
| Hide Platform Branding | No | No | Yes | Yes |
| Custom Domain (Org) | No | Yes | Yes | Yes |
| API Access | No | No | Yes | Yes |
| Webhooks | No | No | Yes | Yes |
| SSO/SAML | No | No | No | Yes |
| Priority Support | No | Yes (Email) | Yes (Phone + Email) | Yes (Dedicated) |
| Dedicated Support | No | No | No | Yes |
| Advanced Analytics | No | No | Yes | Yes |
| Batch Processing | No | No | Yes | Yes |
| Tax Prep Export | No | Yes | Yes | Yes |
| Referral Program | No | Yes | Yes | Yes |
| Review Automation | No | Yes | Yes | Yes |
| AI Assistant | Yes | Yes | Yes | Yes |
| Basic Integrations | No | Yes | Yes | Yes |
| Advanced Integrations | No | No | Yes | Yes |
| Property Custom Domains | Yes | Yes | Yes | Yes |

---

## Storage Model

**PhotoProOS uses a UNIFIED storage model.** All storage (galleries, client uploads, documents) shares the same allocation.

---

### Unified Storage Pool

| Plan | Storage Included | Additional Storage | Soft Cap Behavior |
|------|------------------|-------------------|-------------------|
| **Free** | 25 GB | Not available | Hard cap - upgrade required |
| **Pro** | 500 GB | $199/10TB/month | Can purchase additional storage |
| **Studio** | 1 TB | $199/10TB/month | Can purchase additional storage |
| **Enterprise** | Unlimited (10 TB soft cap) | $199/10TB/month | Warning at 10TB, then upgrade option |

**LTD Storage Add-on Rate:** $179/10TB/month (10% discount)

### What Counts Against Storage

**Counts against quota:**
- Original photos (full resolution)
- Client uploads (proofing, favorites)
- Documents (contracts, invoices as PDFs)
- Slideshow exports

**Does NOT count against quota:**
- Thumbnails & previews (system-generated)
- Database records (metadata)
- Account data (settings, preferences)
- Sleeping galleries (Gallery Sleep Mode)

### Gallery Sleep Mode

A feature that allows users to "put a gallery to sleep" so it doesn't count against their active storage quota.

**Availability:**
- Free plan: NOT available
- Pro/Studio/Enterprise: Available (free feature)

**How It Works:**
- Sleeping galleries move to cold storage (Cloudflare R2)
- Gallery becomes read-only (can view thumbnails, no downloads)
- Client links show "Gallery Archived" message
- Waking a gallery takes 1-5 minutes depending on size
- Per-gallery toggle: "Allow clients to self-wake"

**Storage Dashboard Display:**
```
Storage: 340 GB / 500 GB used
├── Active galleries: 320 GB
├── Client uploads: 20 GB
└── Sleeping galleries: 180 GB (not counted)
```

### Client Uploads

- Client uploads COUNT against photographer's quota
- Stored in same bucket as photographer's files
- Photographer sees total usage (their files + client uploads)
- Client sees upload progress but NOT photographer's storage usage
- Photographer notified when client upload completes

### Downgrade Handling (Over Quota)

When a user downgrades and is over quota:
- **Grace period:** 30 days
- **Login warning:** Show warning banner every login
- **Email cadence:** Reminder emails every 7 days
- **Options presented:** Download, Push to Dropbox, Upgrade plan
- **After 30 days:** Account suspended (not deleted)
- **Internal safeguard:** Store overage files in Cloudflare for 90 days for potential restoration

### Team Storage Model

- **Pooled storage** for org/main account
- All team members share the org's storage quota
- Storage visibility configurable via granular permissions
- Org owner sees breakdown by team member

---

## Transaction Fees

| Plan | Processing Fee | Notes |
|------|----------------|-------|
| Free | N/A | No payment processing |
| Pro | 2.9% + $0.30 | Standard Stripe rates |
| Studio | 2.5% + $0.30 | Reduced rate |
| Enterprise | Custom | Negotiated based on volume |

---

## Implementation Files

### Source of Truth

**Primary:** `src/lib/plan-limits.ts`
- Contains all limit definitions
- Feature flags per plan
- Utility functions for checking limits
- PLAN_PRICING constant for prices

### Display Components

| File | Purpose |
|------|---------|
| `src/components/sections/pricing.tsx` | Landing page pricing section |
| `src/app/(marketing)/pricing/page.tsx` | Dedicated pricing page |
| `src/components/landing/interactive-demos.tsx` | Demo pricing references |
| `src/components/sections/roi-calculator.tsx` | ROI calculator |

### Related Documentation

| File | Purpose |
|------|---------|
| `docs/phase-2-storage-spec.md` | Detailed storage pricing model |
| `docs/STRIPE_PRODUCT_SYNC.md` | Stripe product catalog sync |

---

## Updating Pricing

When updating pricing or limits, follow this checklist:

### 1. Update Source of Truth
```typescript
// src/lib/plan-limits.ts
export const PLAN_PRICING: Record<PlanName, PlanPricing> = {
  free: { monthlyBeta: 0, monthlyRegular: 0, yearlyBeta: 0, yearlyRegular: 0, lifetime: null, lifetimeRegular: null },
  pro: { monthlyBeta: 49, monthlyRegular: 79, yearlyBeta: 470, yearlyRegular: 790, lifetime: 500, lifetimeRegular: 799 },
  studio: { monthlyBeta: 99, monthlyRegular: 149, yearlyBeta: 950, yearlyRegular: 1490, lifetime: 1000, lifetimeRegular: 1499 },
  enterprise: { monthlyBeta: 349, monthlyRegular: 549, yearlyBeta: 3350, yearlyRegular: 5490, lifetime: 3500, lifetimeRegular: 5499 },
};

// Storage values in PLAN_LIMITS:
// Free: 25 GB (storage_gb: 25)
// Pro: 500 GB (storage_gb: 500)
// Studio: 1 TB (storage_gb: 1000)
// Enterprise: 10 TB soft cap (storage_gb: 10000)

// Storage add-on: $199/month per 10TB (all paid plans)
// LTD discount: 10% off ($179/month per 10TB)
```

### 2. Update Plan Limits
Modify the `PLAN_LIMITS` object in `src/lib/plan-limits.ts` with new values.

### 3. Update Display Components
Update these files to match:
- `src/components/sections/pricing.tsx` (landing page)
- `src/app/(marketing)/pricing/pricing-client.tsx` (dedicated pricing page)
- `src/components/sections/roi-calculator.tsx`
- `src/components/landing/interactive-demos.tsx`

### 4. Update Documentation
- Update this file (`docs/PRICING_STRUCTURE.md`)
- Update `docs/phase-2-storage-spec.md` if storage pricing changes

### 5. Update CHANGELOG
Add an entry under `[Unreleased]` documenting the pricing change.

### 6. Sync to Stripe
If adding new plans or changing structure, update Stripe Product Catalog.

### 7. Beta/LTD Management
To end beta or manage LTD slots:
- Set `BETA_SETTINGS.isBetaActive = false` to show regular pricing
- Update `ltdSlotsRemaining` based on purchases (should be fetched from DB in production)
- Adjust `betaEndsAt` for countdown timers

---

## Decision Matrix: Which Plan Should a User Choose?

| User Need | Recommended Plan |
|-----------|------------------|
| Just trying out the platform | Free |
| Individual photographer with large libraries | Pro |
| Individual photographer with many clients | Studio |
| Studio with team collaboration needs | Studio |
| Agency managing multiple brands | Enterprise |
| Need API/webhook integrations | Studio+ |
| Need white-label/remove branding | Studio+ |
| Need SSO/SAML | Enterprise |
| High-volume payment processing | Enterprise |

---

## Quick Reference: Plan Comparison

```
Free → Pro:     +475 GB storage (25→500), +Payment processing, +Priority support, +Gallery Sleep Mode
Pro → Studio:   +500 GB storage (500→1TB), +Unlimited galleries/clients, +White-label, +API access
Studio → Enterprise: +Unlimited storage (1TB→10TB soft cap), +Unlimited team, +SSO, +Dedicated support
```

### Billing Options

| Interval | Savings | Display |
|----------|---------|---------|
| Monthly | Base price | Full monthly rate |
| Annual | 20% off | Monthly equivalent + yearly total |
| Lifetime | Best value | One-time payment, no recurring |

---

*Last updated: January 2026*
*Authoritative source: `src/lib/plan-limits.ts`*

---

## Implementation Plan Reference

The unified storage model was implemented with the following key decisions:

### Key Changes Made
- **Enterprise pricing:** $349/mo (up from $249)
- **Storage model:** ONE unified pool (galleries, files, documents share allocation)
- **Storage overage:** $199/mo per additional 10TB (available to all paid plans)
- **Gallery Sleep Mode:** New feature for paid plans to archive galleries

### Resolved Decisions

| Decision | Resolution |
|----------|------------|
| Free plan storage add-ons | Not available - must upgrade |
| Downgrade over quota | 30-day grace, emails every 7 days |
| Client uploads | Count against photographer quota |
| LTD storage | Locked at time of purchase |
| Team storage | Pooled for org account |
| Storage visibility | Granular permissions with role defaults |
| Import over quota | Allow upload, warn after |
| Duplicate detection | No warnings - allow freely |
| Thumbnails | Do NOT count against quota |

### Cost/Margin Analysis (Cloudflare R2 at $0.015/GB/month)

| Plan | Storage | Monthly Cost | Price | Margin |
|------|---------|--------------|-------|--------|
| Free | 25 GB | $0.38 | $0 | -$0.38 |
| Pro | 500 GB | $7.68 | $49 | $41.32 (84%) |
| Studio | 1 TB | $15.36 | $99 | $83.64 (84%) |
| Enterprise | 10 TB | $153.60 | $349 | $195.40 (56%) |

### Storage Overage Margins

| Overage | Your Cost | Price | Margin |
|---------|-----------|-------|--------|
| 10 TB | $153.60 | $199 | $45.40 (23%) |
| LTD 10 TB (10% off) | $153.60 | $179 | $25.40 (14%) |
