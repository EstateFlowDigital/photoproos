# Marketplace Future Plans (Photographer Discovery + Ads)

This document outlines a detailed plan for a public-facing photographer marketplace that works in tandem with the core PhotoProOS business OS. The goal is to connect visitors to vetted photographers, enable paid placement, and leverage operational truth from the platform (services, availability, pricing, reviews).

## Objectives & Differentiators
- Pair operational truth (services, availability, pricing, reviews) with discovery to keep listings accurate and conversion-focused.
- Build trust with verified, media-rich reviews, transparent ad labels, and quality-scored placement.
- Monetize through tiered listings, keyword/geo bidding, pay-per-lead, and analytics add-ons.
- Deliver strong UX: fast search, geo filters, rich profiles, clear CTAs, and measurable ROI for photographers.

## Core User Flows
- **Visitor:** search/filter → ranked list (organic + sponsored) → profile → inquire/book or request quote → optionally submit review post-engagement.
- **Photographer (supply):** onboard/sync profile from PhotoProOS (services, pricing visibility, availability, portfolio) → choose promo plan/budget → manage leads/reviews → track ROI/analytics.
- **Reviewer:** submit text/photo/video review (verified when tied to a PhotoProOS job), with moderation and dispute flows.

## Experience Design (Surfaces)
- **Search/Filters:** location (geo + radius), service type, style tags, price band (if shared), turnaround, availability window, rating threshold, media type (has video), “rush” toggle.
- **Listing Cards:** hero image, badges (Recommended/Verified/Top Rated/Sponsored), rating + count, recent review snippet, service tags, price range (if public), availability indicator, CTAs (Contact, View profile).
- **Profile Pages:** overview, specialties, coverage map, packages or “custom quote” mode, portfolio (photo/video), testimonials with media, FAQ, team info, CTAs to inquire/book; optional “request quote” form.
- **Reviews:** verified (tied to PhotoProOS jobs) and unverified (with checks); media uploads (photo/video); weighting recency and verification status.
- **Ads/Placement:** clearly labeled sponsored slots (top/bottom), keyword + geo targeting, budget caps, rotation; quality score to prevent low-quality domination.

## Data Model (Draft, Prisma/Postgres)
- **MarketplaceProfile**: userId/orgId (FK), headline, bio, heroImage, serviceTags[], coverageAreas (geo shapes/zip list), pricingVisibility (enum), startingPrice, portfolioHighlights[], responseTime, profileCompleteness, status (active/paused).
- **PlacementBid**: profileId, keywords[], regions (geo or city/zip), maxCpc, dailyCap, status, qualityScore, spendToday, impressions/clicks/leads counters.
- **Review**: profileId, reviewerId (nullable), jobId (nullable for verified), rating, text, mediaUrls[], verified (bool), status (pending/approved/flagged), ip/device hash, createdAt.
- **Lead**: profileId, visitorEmail/phone, message, serviceType, budgetRange, desiredDate, source (organic/sponsored), status, cost (if pay-per-lead), utm metadata.
- **SponsoredImpression/Click**: placementBidId, profileId, keyword, region, cost, ts (aggregate or event-level).
- **CoverageArea**: profileId, geo polygon or set of zip codes; fallback to city/state for basic search.
- **Badge/Achievement**: profileId, type (verified identity, verified booking, top rated, client favorite, fast responder), awardedAt, expiresAt (optional).
- **AvailabilitySnapshot**: profileId, daysAvailable[], nextOpenDate; derived from scheduling module.

Notes: Use Postgres + PostGIS for geo (or zip lists if PostGIS not desired). For search, consider: Phase 1 = Postgres full-text + trigram + bounding box; Phase 2 = Meilisearch/Typesense/Elastic for relevancy + faceting.

## Services & APIs (High-Level)
- **Public browse APIs (no auth):**
  - `GET /marketplace/search?query=&service=&lat=&lng=&radius=&tags=&priceBand=&ratingMin=&hasVideo=&availableBy=` → returns ranked listings with sponsored blends.
  - `GET /marketplace/profile/{id}` → public profile data + reviews (paginated).
  - `POST /marketplace/reviews` → submit review (rate-limited; media uploads via signed URLs).
- **Authenticated (photographer/org):**
  - `GET/PUT /marketplace/profile` → manage profile data, visibility, coverage areas, pricing visibility.
  - `POST /marketplace/profile/portfolio-upload` → signed URL flow for media.
  - `POST/PUT /marketplace/bids` → manage sponsored placement bids, budget caps, keywords, regions.
  - `GET /marketplace/leads` → inbox; mark responded/closed; export.
  - `GET /marketplace/analytics` → impressions, clicks, CTR, leads, spend, ROAS.
- **Internal services:**
  - Ranking service (organic + sponsored blending; quality score).
  - Review moderation queue (auto + manual).
  - Search indexer (sync from Prisma to search backend).
  - Payments/billing for bids and pay-per-lead (Stripe existing stack).
  - Observability pipelines for metrics/events (existing telemetry).

## Ranking & Blending
- **Organic signals:** relevance (query/service/tags), proximity, response rate/latency, booking/close rate (where known), review quality/recency, profile completeness, availability fit, dispute history.
- **Sponsored:** CPC bid × quality score, budget pacing, frequency caps/rotation; must be labeled.
- **Quality score inputs:** landing/profile completeness, response latency, review health, refund/dispute rate, verified identity.

## Reviews, Trust, Moderation
- Verified reviews when linked to PhotoProOS jobs; weight higher.
- Media attachments (photo/video), virus scan + size/type limits.
- Fraud prevention: rate limits, IP/device hashing, CAPTCHA/turnstile, profanity/abuse filters, duplicate detection.
- Disputes: allow pros to flag; moderation states (pending/approved/flagged/removed) with audit log.
- Identity/Business verification (KYC/KYB) for trust badges and to gate sponsored ads.

## Monetization Model
- **Tiers:** Free (basic listing), Plus (portfolio highlights, limited boosts), Pro (priority support, layout A/B tests, enhanced analytics).
- **Sponsored placement:** keyword + geo bidding, daily/total caps, CPC (with floor), rotation, seasonal promos.
- **Pay-per-lead (optional):** meter “contact” submissions; use lead credits wallet; spam/fraud refund rules.
- **Badges/add-ons:** featured/“recommended” badges, review spotlight, rush-response SLA badge.
- **Analytics add-on:** share-of-voice, keyword insights, conversion funnel, competitive benchmarks (anonymized).

## TripAdvisor/Thumbtack-Inspired Enhancements
- **Map-first discovery:** Map/list sync with clustering and “draw a boundary” search. Tech: Mapbox/Leaflet front-end, PostGIS for polygons, vector tiles for performance.
- **Multi-quote flow:** Single request broadcast to multiple pros; side-by-side quote comparison. Tech: lead fan-out service, quote entities, notifications, rate limits.
- **Instant booking + calendar view:** Show next-available slots and allow instant booking (opt-in). Tech: reuse scheduling/availability APIs, lock slots with optimistic concurrency, payment hold via Stripe.
- **Shortlists/Favorites:** Save/share profiles and quotes. Tech: SavedList/SavedProfile tables, share tokens, lightweight permissions.
- **Rich review facets + AI summaries:** Filter by recency/rating/tags; summarize themes. Tech: review tags schema, text search, optional LLM summarization with caching.
- **Safety/verification badges:** Background/insurance/bonded/identity checks. Tech: KYB/KYC provider integration, document storage (secure), badge issuance rules.
- **Guarantees/Protection:** Platform-backed satisfaction/refund policy for defined cases. Tech: policy engine, claims workflow, Stripe refunds/credits.
- **Q&A on profiles:** Public Q&A (SEO-friendly) plus private pre-booking Q&A. Tech: QAPost/QaAnswer models, moderation, search indexing.
- **Auto follow-ups/reminders:** Response-time SLAs, reminders on pending leads/quotes, expiry timers. Tech: scheduled jobs, notification templates (email/SMS/in-app), state machine on leads/quotes.
- **Personalization & recommendations:** “Suggested for you” and trending/seasonal picks. Tech: analytics events pipeline, rules-based recs first, ML later (co-visibility/geo/service clustering).
- **Coupons/Promos:** Time-bound offers/promo codes. Tech: promo code service, eligibility checks, audit, exposure in search/profile cards.
- **Category-specific attributes:** Vertical-specific fields/filters (wedding: second shooter/delivery time; real estate: HDR/virtual tour; portraits: studio vs. on-location). Tech: dynamic attributes table per category + UI schema, search facets.
- **Accessibility/Localization:** Language filters, translation for reviews, currency localization, accessibility tags (e.g., studio accessibility). Tech: i18n pipeline, currency formatter, optional translation API, accessibility flags in profile.
- **Collaboration:** Shareable proposals/quotes with comments/approvals for multi-stakeholder buyers. Tech: shared links, comment threads tied to quotes, simple access control via tokens.
- **Lead quality controls:** Anti-spam on lead submission, requester reputation, block abusive requesters, velocity caps. Tech: rate limiting per IP/device/user, blocklists, abuse signals.
- **Equipment Exchange (B2B):** Verified photographers can buy/sell certified gear; listings require inspection/certification; optional shipping labels via a partner. Tech: new Listing/Certification entities, image uploads, verification/inspection workflow, escrow/payout via Stripe, shipping API integration (label generation), dispute/DOA handling, badge for inspected gear, eligibility gated to verified users/orgs.

## Infra & Integrations
- **Search:** start with Postgres text + geo; plan for Meilisearch/Typesense/Elastic for scale/faceting.
- **Geo:** PostGIS or zip-code bounding; cache lookups in Redis.
- **Media:** existing storage + signed URL upload; transcoding for video thumbnails; image optimization via Next image pipeline.
- **Payments:** reuse Stripe billing/usage-based metering for bids and lead credits; webhooks for balance/cap enforcement.
- **Caching:** edge caching for search results (with short TTL); CDN for media.
- **Queues:** background jobs for moderation, index sync, billing, pacing.
- **Auth:** Clerk + existing org/user model; public browse unauthenticated; submissions protected with anti-abuse.

## Tech/Integration Notes for New Features
- **Maps:** Mapbox/Leaflet + PostGIS for polygons; tile caching; clustered markers; boundary drawing stored as geojson.
- **Quotes:** New `Quote` table linked to `Lead`; broadcast logic with acceptance/expiry; stripe payment intent optional for deposits.
- **Instant booking:** Availability lock + confirmation flows; double-submit protection; optional payment hold/pre-auth.
- **Shortlists:** `SavedList` (owner, name, shareToken), `SavedProfile` join; access via share token; soft limits per user.
- **Review AI summaries:** Background job to summarize; cache by profile; invalidate on new reviews.
- **Verifications:** Integrate KYB/KYC provider; store verification status + documents metadata; display badges; restrict ads if unverified.
- **Guarantees:** Policy rules engine; claim submission form; adjudication workflow; refund/credit issuance via Stripe.
- **Q&A:** Public Q&A entities with moderation; private thread tied to lead; SEO schema (FAQ).
- **Follow-ups:** Notification service with templates; scheduled reminders; SLA timers; auto-expire stale quotes/leads.
- **Personalization:** Event stream (impressions/clicks/saves), feature store later; rules-based fallback now.
- **Promos:** Promo service with code issuance, validation, usage tracking, and exposure in search/profile; enforcement at checkout or lead-fee calc.
- **Dynamic attributes:** `CategoryAttribute` definitions, per-profile `AttributeValue`; indexed for search facets; UI driven from schema.
- **Localization:** i18n for public pages, currency conversion (FX API), optional machine translation for reviews (tag translated), language filters.
- **Collaboration:** Share tokens for quote pages; comment threads per quote; notifications on mentions/replies.
- **Abuse:** Turnstile/CAPTCHA on submissions, IP/device fingerprinting, velocity rules, invalid-click detection for ads, refund logic for fraudulent leads.
- **Equipment Exchange specifics:**  
  - Data: `EquipmentListing` (seller org/user, make/model, condition enum, photos, serials, price, shipping options, inspection status, certification doc), `Certification` (inspector, date, findings), `Order` (escrow state, buyer/seller, shipping label/tracking).  
  - Workflow: seller creates listing (gated to verified pros) → optional inspection request/required certification upload → buyer checks out (escrow hold via Stripe) → shipping label auto-generated via partner API (UPS/FedEx/etc.) → delivery/inspection window → release funds or dispute/return flow.  
  - Safety: serial checks, stolen-gear screening (if partner available), mandatory photos, capped high-risk categories, dispute/resolution playbook.  
  - Fees: listing fee or take-rate on successful sale; promo credits for active PhotoProOS users; shipping-code perks for power users.  
  - Discovery: filters by category, condition, price, location; badges for “certified/inspected,” “pro seller,” “fast shipper.”  
  - Integration: reuse auth/org verification, storage, payments, notifications; optional pick-up vs. ship; return labels issued on dispute approval.

## Metrics & Observability
- Supply: profile completeness, verified %, active bidders, response rate/latency.
- Demand: CTR, inquiries/bookings per visit, lead quality score, abandonment points.
- Revenue: ARPU, ad/lead revenue, ROAS, churn/retention by tier.
- Trust: review velocity/recency, dispute rate, fraud flags, moderation actions.
- Infra: search latency, index staleness, error rates on uploads and lead submissions.

## Compliance, Risk, and Operational Considerations
- **Tax & marketplace facilitator rules:** Determine sales tax/VAT obligations per region for gear sales; add tax calculation in checkout; generate invoices/receipts; handle cross-border duties/customs disclosures.
- **Liability/returns/warranties:** Define DOA/return windows, who pays return shipping, what “certified/inspected” guarantees, and localized consumer rights (e.g., EU cooling-off). Add disclosures in checkout and listings.
- **KYC/KYB & fraud controls:** Identity/business verification, stepped-up checks for high-value gear/ads, spend/velocity caps, device/IP fingerprinting, stolen-gear checks where possible.
- **Shipping risk & insurance:** Partner SLAs, optional insurance, lost/damaged-in-transit claims, photo proof-of-condition requirements, pickup vs. ship impacts on disputes.
- **Ad/placement disclosures & fairness:** Clear “Sponsored” labels, rotation rules, audit logs of ranking/placement decisions; consider regional rules on self-preferencing.
- **Privacy/PII & retention:** Policies for reviews/media/location/messaging; consent for media and translations/AI summaries; GDPR/CCPA handling; retention/deletion schedules.
- **Content rights & moderation:** License grants for user media, takedown/appeals process, audit trail for moderation actions, blocking illegal/objectionable content.
- **Accessibility/localization:** WCAG compliance for public pages, map alternatives, keyboard nav; multi-language UI and currency/units where applicable.
- **Insurance/protection:** If offering guarantees, ensure funding/insurance backing; gear sales: optional shipping insurance and clear risk transfer pre/post-delivery.
- **Ops/SLOs & observability:** SLOs for search, lead submission, checkout/escrow, shipping label generation; alerting for payment/escrow/shipping failures; runbooks for disputes, fraud spikes, index staleness.

## Rollout Phases (Epics)
- **Phase 0 – Foundations (2–4 weeks):** data models (Profile/Review/Lead/Bid/Badge/CoverageArea), profile sync from PhotoProOS, organic directory, basic search/filters, text reviews, public profile page, anti-abuse basics (rate limits/CAPTCHA).
- **Phase 1 – Marketplace MVP (4–6 weeks):** media reviews, profile CTAs (contact/quote), inquiry capture, moderation queue, SEO pages (schema/sitemap), shortlists, public Q&A, follow-up reminders/SLAs.
- **Phase 2 – Monetization v1 (4–6 weeks):** sponsored slots (simple CPC + caps), featured badges upsell, basic analytics dashboard, promo codes, review facets, AI summaries (background jobs).
- **Phase 3 – Trust & Quality (4–6 weeks):** verified reviews (job-linked), identity/business verification, quality score gating for ads, dispute workflows, lead quality controls (blocklists/velocity), accessibility/localization hooks.
- **Phase 4 – Advanced Discovery & Booking (6–8 weeks):** map-first search with draw-boundary, instant booking (opt-in) + calendar view, multi-quote broadcast/compare, category-specific attributes/filters, personalization v1 (rules-based recs).
- **Phase 5 – Monetization v2 (6–8 weeks):** keyword/geo bidding refinement, pay-per-lead option + credits wallet, guarantees/protection policy engine, advanced analytics (share-of-voice, keyword insights, advertiser quality score).
- **Phase 6 – Equipment Exchange Pilot (6–10 weeks):** gated equipment listings for verified pros, certification/inspection workflow (manual first), escrow checkout with shipping label generation, dispute/DOA handling, pro badges for inspected gear, basic filters/search; start with limited categories/regions.
- **Phase 7 – Scale & Ops (ongoing):** fraud/abuse automation (invalid-click detection, refund adjudication), A/B/bandit testing of ranking/ads, regional/vertical expansion playbook, SLOs/runbooks/observability hardening, expand equipment categories and inspection partner network.

## Risks & Mitigations
- **Fraud/low-quality ads:** enforce quality score, verification, pacing, and refunds for invalid leads.
- **Supply/demand imbalance:** staged rollout by region/vertical; incentives for early adopters; controlled sponsored slots.
- **Performance/SEO:** pre-render public pages, cache search, optimize media; monitor Core Web Vitals.
- **Compliance/privacy:** clear ad labels, review policies, data retention, consent for media.

## Immediate Actions to Add to Roadmap
1) Choose pilot region + verticals; define MVP scope (Phase 0–1) and acceptance criteria.  
2) Finalize data model schema for MarketplaceProfile, Review, PlacementBid, Lead, Badge, CoverageArea.  
3) Specify public search/profile endpoints and search backend choice (Postgres first, Meilisearch later).  
4) Draft policies/microcopy for reviews, ad disclosure, and disputes.  
5) Define initial ranking weights and sponsored rotation rules; design analytics payloads.  
6) Plan billing flows for sponsored spend and (optional) lead credits using existing Stripe stack.  
7) Instrument metrics and logging (events for impressions/clicks/leads, moderation events, spend).  

## Tech Stack Guidance (aligned to current app)
- **Frontend:** Next.js app router (existing), server components for public pages, client comps for interactivity; map via Mapbox/Leaflet if needed.
- **Backend:** Next.js route handlers + Prisma + Postgres; PostGIS for geo; Redis for caching/pacing; queue (existing job runner) for moderation/index/billing tasks.
- **Search:** Start with Postgres text/geo; plan abstraction to allow swapping to Meilisearch/Typesense/Elastic.
- **Payments:** Stripe (existing) for subscriptions/usage; webhooks for capping spend and credit refill.
- **Media:** Signed URL uploads to existing storage; add virus scan and thumbnailing for review media.
