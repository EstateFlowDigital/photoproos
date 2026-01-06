# Client Portal Roadmap

> Comprehensive enhancement plan for transforming the client portal into an industry-leading platform.

---

## Table of Contents

1. [Current State](#current-state)
2. [Phase 1: Core UX Improvements](#phase-1-core-ux-improvements)
3. [Phase 2: Performance & Mobile](#phase-2-performance--mobile)
4. [Phase 3: Feature Additions](#phase-3-feature-additions)
5. [Phase 4: Payments & E-Commerce](#phase-4-payments--e-commerce)
6. [Phase 5: AI-Powered Features](#phase-5-ai-powered-features)
7. [Phase 6: Collaboration & Teams](#phase-6-collaboration--teams)
8. [Phase 7: Integrations](#phase-7-integrations)
9. [Phase 8: Advanced Features](#phase-8-advanced-features)
10. [Phase 9: Emerging Technology](#phase-9-emerging-technology)
11. [Implementation Priority Matrix](#implementation-priority-matrix)

---

## Current State

### What Exists Today

| Feature | Status | Notes |
|---------|--------|-------|
| Magic Link Authentication | ✅ Complete | 15-min expiry, 7-day sessions |
| Dashboard with Stats | ✅ Complete | Properties, Views, Leads, Photos |
| Properties Tab | ✅ Complete | Grid view with thumbnails |
| Galleries Tab | ✅ Complete | Photo thumbnails, status badges |
| Downloads Tab | ✅ Complete | ZIP, Web Size, High-Res options |
| Invoices Tab | ✅ Complete | Pay Now, PDF download |
| Questionnaires Tab | ✅ Complete | Multi-step forms, e-signatures |
| Activity Tracking | ✅ Complete | Backend only, not surfaced to UI |

### Current Architecture

```
src/app/(client-portal)/
├── layout.tsx                    # Root layout with ToastProvider
├── error.tsx                     # Error boundary
├── portal/
│   ├── page.tsx                  # Dashboard entry (server)
│   ├── portal-client.tsx         # Main dashboard (client)
│   ├── login/page.tsx            # Magic link login
│   ├── loading.tsx               # Skeleton loader
│   ├── questionnaires/[id]/      # Questionnaire completion
│   └── components/
│       ├── portal-header.tsx
│       ├── portal-stats.tsx
│       ├── portal-tabs.tsx
│       ├── portal-footer.tsx
│       └── tabs/
│           ├── properties-tab.tsx
│           ├── galleries-tab.tsx
│           ├── downloads-tab.tsx
│           ├── invoices-tab.tsx
│           └── questionnaires-tab.tsx
```

---

## Phase 1: Core UX Improvements

### 1.1 Notification System
**Priority: P0 | Effort: Medium**

- [ ] Notification bell icon in header with unread count
- [ ] Slide-out notification panel
- [ ] Real-time activity feed
- [ ] Mark as read functionality
- [ ] Notification preferences

```typescript
// Example notification types
type NotificationType =
  | 'gallery_delivered'
  | 'invoice_due'
  | 'invoice_paid'
  | 'questionnaire_reminder'
  | 'message_received';
```

### 1.2 Smart Dashboard
**Priority: P0 | Effort: Medium**

- [ ] Time-based greetings ("Good morning, John")
- [ ] Priority action cards at top:
  - Unpaid invoices with Pay Now CTA
  - Pending questionnaires with deadline
  - New galleries ready for download
- [ ] Recent activity timeline (last 5 actions)
- [ ] Next scheduled shoot reminder

### 1.3 Gallery Lightbox Viewer
**Priority: P0 | Effort: Medium**

- [ ] Full-screen photo browsing
- [ ] Keyboard navigation (arrow keys, ESC)
- [ ] Swipe gestures on mobile
- [ ] Zoom in/out capability
- [ ] Photo counter (3 of 47)
- [ ] Download current photo button

### 1.4 Photo Favorites System
**Priority: P1 | Effort: Medium**

- [ ] Heart icon on each photo
- [ ] "Favorites" sub-tab in Downloads
- [ ] Download only favorites
- [ ] Share favorites selection
- [ ] Persist favorites per gallery

### 1.5 Selective Photo Downloads
**Priority: P1 | Effort: Medium**

- [ ] Multi-select checkboxes on photos
- [ ] "Select All" / "Clear Selection"
- [ ] Download selected as ZIP
- [ ] Selection counter badge
- [ ] Keyboard shortcuts (Shift+Click for range)

### 1.6 Progressive Disclosure
**Priority: P2 | Effort: Low**

- [ ] Hide empty tabs (no properties = hide Properties tab)
- [ ] Auto-focus on tab with pending actions
- [ ] Collapse empty sections inline
- [ ] Smart default tab selection

---

## Phase 2: Performance & Mobile

### 2.1 Image Loading Optimization
**Priority: P0 | Effort: Medium**

- [ ] Blur placeholder (blurDataURL) for all images
- [ ] Next.js Image component with proper sizing
- [ ] Lazy loading for below-fold images
- [ ] Skeleton loaders during fetch
- [ ] Progressive JPEG for galleries
- [ ] WebP format with fallbacks

### 2.2 Data Fetching Improvements
**Priority: P1 | Effort: Medium**

- [ ] Tab-based data loading (fetch only active tab)
- [ ] SWR/React Query integration
- [ ] Background refetching
- [ ] Stale-while-revalidate caching
- [ ] Optimistic updates for actions
- [ ] Prefetch on tab hover

### 2.3 Bundle Optimization
**Priority: P2 | Effort: Low**

- [ ] Split portal-client.tsx into chunks
- [ ] Dynamic imports for tab components
- [ ] Tree-shake download logic
- [ ] Code splitting by route

### 2.4 Mobile-First Redesign
**Priority: P0 | Effort: High**

- [ ] Bottom navigation bar (Properties | Galleries | Downloads | More)
- [ ] Swipe gestures for tab switching
- [ ] Pull-to-refresh on all lists
- [ ] Touch-friendly button sizes (min 44px)
- [ ] Mobile-optimized download flow
- [ ] Responsive grid layouts

### 2.5 Progressive Web App (PWA)
**Priority: P2 | Effort: Medium**

- [ ] Web app manifest
- [ ] Service worker for offline
- [ ] Add to home screen prompt
- [ ] Offline gallery viewing (cached images)
- [ ] Background sync for questionnaires
- [ ] Push notification support

---

## Phase 3: Feature Additions

### 3.1 Messaging Hub
**Priority: P1 | Effort: High**

- [ ] In-portal messaging interface
- [ ] Threaded conversations per project
- [ ] File attachment support
- [ ] Read receipts
- [ ] Email notifications for new messages
- [ ] Message search

```typescript
// New Prisma model
model PortalMessage {
  id          String   @id @default(cuid())
  clientId    String
  content     String
  attachments Json?
  isFromClient Boolean @default(true)
  readAt      DateTime?
  galleryId   String?  // Optional context
  propertyId  String?  // Optional context
  createdAt   DateTime @default(now())
}
```

### 3.2 Client Feedback & Reviews
**Priority: P2 | Effort: Medium**

- [ ] Post-delivery feedback request
- [ ] Star rating (1-5)
- [ ] Text review field
- [ ] Photo-specific comments
- [ ] Testimonial opt-in for marketing
- [ ] NPS survey integration

### 3.3 Scheduling Integration
**Priority: P2 | Effort: Medium**

- [ ] Upcoming shoots on dashboard
- [ ] Calendar view of bookings
- [ ] Reschedule request button
- [ ] Add to Google/Apple Calendar
- [ ] Weather forecast for shoot date
- [ ] Shoot countdown timer

### 3.4 Document Center
**Priority: P3 | Effort: Medium**

- [ ] Centralized document storage
- [ ] Contracts (signed)
- [ ] Receipts archive
- [ ] Questionnaire PDF exports
- [ ] Property flyers
- [ ] License agreements
- [ ] Download all as ZIP
- [ ] Search within documents

### 3.5 Client Preferences
**Priority: P2 | Effort: Low**

- [ ] Preferences settings page
- [ ] Email notification toggles
- [ ] Default download quality
- [ ] Timezone setting
- [ ] Language preference
- [ ] Dark/light mode toggle
- [ ] Saved payment methods

---

## Phase 4: Payments & E-Commerce

### 4.1 Enhanced Payment Experience
**Priority: P1 | Effort: Medium**

- [ ] Embedded Stripe checkout (no redirect)
- [ ] Save payment methods
- [ ] Apple Pay / Google Pay
- [ ] Payment plans / installments
- [ ] Partial payments
- [ ] Auto-pay authorization

### 4.2 Invoice Improvements
**Priority: P2 | Effort: Low**

- [ ] Invoice history with search/filter
- [ ] "Due in X days" countdown banner
- [ ] Separate receipt downloads
- [ ] Dispute/question button
- [ ] Expandable line item details
- [ ] Invoice PDF customization

### 4.3 Financial Dashboard
**Priority: P3 | Effort: Medium**

- [ ] Payment history timeline
- [ ] Total spent with photographer
- [ ] Outstanding balance
- [ ] Upcoming invoices
- [ ] Annual statement download (taxes)

### 4.4 Print Store
**Priority: P3 | Effort: High**

- [ ] Order prints from gallery
- [ ] Canvas/metal print options
- [ ] Property photo books
- [ ] Postcard mailers
- [ ] Size and finish selection
- [ ] Shipping address management
- [ ] Order tracking

### 4.5 Add-On Marketplace
**Priority: P2 | Effort: Medium**

- [ ] Virtual staging purchase
- [ ] Floor plan add-on
- [ ] Video production upgrade
- [ ] Drone add-on request
- [ ] Rush delivery option
- [ ] Re-edit requests

### 4.6 Subscription & Credits
**Priority: P3 | Effort: Medium**

- [ ] Monthly subscription plans
- [ ] Credit bundle purchases
- [ ] Credit balance display
- [ ] Auto-apply credits to invoices
- [ ] Credit expiration alerts

---

## Phase 5: AI-Powered Features

### 5.1 AI Photo Curation
**Priority: P2 | Effort: High**

- [ ] Smart album generation (group by room/type)
- [ ] Best shot selection (sharpness, lighting)
- [ ] Duplicate detection with recommendations
- [ ] Quality scoring per photo
- [ ] Auto-tagging ("Kitchen", "Exterior", "Twilight")

### 5.2 AI-Generated Content
**Priority: P3 | Effort: High**

- [ ] Property description generator
- [ ] Social media caption generator
- [ ] Virtual staging suggestions
- [ ] SEO metadata generation
- [ ] MLS-ready listing copy

### 5.3 Intelligent Recommendations
**Priority: P3 | Effort: Medium**

- [ ] "Clients like you also ordered..." upsells
- [ ] Optimal shoot time predictor
- [ ] Re-engagement prompts
- [ ] Service upgrade suggestions

---

## Phase 6: Collaboration & Teams

### 6.1 Multi-User Access
**Priority: P2 | Effort: High**

- [ ] Team account structure
- [ ] Role-based permissions:
  - Admin: Full access, billing
  - Agent: View, download, order
  - Assistant: View only
  - Marketing: Marketing assets only
- [ ] Activity attribution ("Downloaded by Sarah")
- [ ] User management interface

### 6.2 Client-to-Client Sharing
**Priority: P3 | Effort: Medium**

- [ ] Share gallery with homeowner
- [ ] Approval workflow before MLS
- [ ] Multi-party comment threads
- [ ] Version history tracking

### 6.3 External Collaborator Access
**Priority: P3 | Effort: Medium**

- [ ] Invite stager/designer (temporary)
- [ ] Videographer handoff
- [ ] Print vendor direct access
- [ ] Expiring access links

---

## Phase 7: Integrations

### 7.1 MLS Direct Upload
**Priority: P2 | Effort: High**

- [ ] One-click upload to MLS platforms
- [ ] Zillow, Realtor.com, local MLS
- [ ] Photo ordering for MLS sequence
- [ ] Compliance check (size, watermarks)
- [ ] Sync status tracking

### 7.2 CRM Integrations
**Priority: P3 | Effort: High**

- [ ] Salesforce sync
- [ ] HubSpot sync
- [ ] Follow Up Boss triggers
- [ ] Pipedrive deal updates
- [ ] Custom webhook support

### 7.3 Marketing Platform Connections
**Priority: P3 | Effort: Medium**

- [ ] Canva integration
- [ ] Mailchimp/Constant Contact
- [ ] Social scheduler (Buffer, Hootsuite)
- [ ] Website builder push (Squarespace, Wix)

### 7.4 Cloud Storage Sync
**Priority: P3 | Effort: Low**

- [ ] Google Drive auto-backup
- [ ] Dropbox integration
- [ ] iCloud Photos save
- [ ] OneDrive sync

---

## Phase 8: Advanced Features

### 8.1 Analytics Dashboard (Client-Facing)
**Priority: P2 | Effort: Medium**

- [ ] Property view analytics
- [ ] Engagement metrics per photo
- [ ] Lead attribution tracking
- [ ] Benchmark comparisons
- [ ] ROI calculator

### 8.2 Content Creation Studio
**Priority: P3 | Effort: High**

- [ ] Basic photo editor (brightness, crop)
- [ ] Watermark tool
- [ ] Text overlay ("Just Listed")
- [ ] Collage maker
- [ ] Flyer templates
- [ ] Social media templates
- [ ] Slideshow video generator

### 8.3 Gamification & Loyalty
**Priority: P3 | Effort: Medium**

- [ ] Points system per order
- [ ] Tier levels (Bronze → Platinum)
- [ ] Tier perks (priority, discounts)
- [ ] Referral bonuses
- [ ] Achievement badges
- [ ] Annual recap reports

### 8.4 Security Enhancements
**Priority: P2 | Effort: Medium**

- [ ] "Remember this device" option
- [ ] Session management (view/revoke)
- [ ] Login history with locations
- [ ] Optional 2FA (TOTP)
- [ ] Biometric login (mobile)

### 8.5 Accessibility & i18n
**Priority: P2 | Effort: Medium**

- [ ] Full keyboard navigation
- [ ] ARIA labels throughout
- [ ] Screen reader optimizations
- [ ] High contrast mode
- [ ] Dyslexia-friendly font option
- [ ] Multi-language support
- [ ] Currency localization
- [ ] RTL support

---

## Phase 9: Emerging Technology

### 9.1 AR/VR Features
**Priority: P4 | Effort: Very High**

- [ ] AR photo placement (see framed on wall)
- [ ] VR gallery walk-through
- [ ] AR business card scanning
- [ ] Virtual open house hosting

### 9.2 Voice Interface
**Priority: P4 | Effort: High**

- [ ] Voice commands in portal
- [ ] Alexa/Google Home skill
- [ ] Voice notes for feedback

### 9.3 Blockchain/Web3
**Priority: P4 | Effort: Very High**

- [ ] NFT ownership certificates
- [ ] Smart contract payments
- [ ] Decentralized storage (IPFS)
- [ ] Crypto payment options

### 9.4 Predictive Features
**Priority: P3 | Effort: Medium**

- [ ] Booking pattern suggestions
- [ ] Seasonal prep reminders
- [ ] Weather-based scheduling
- [ ] Smart batch booking

---

## Implementation Priority Matrix

### Priority Legend
- **P0**: Must have - Critical for user experience
- **P1**: Should have - High value, implement soon
- **P2**: Nice to have - Good value, medium priority
- **P3**: Future - Lower priority, plan for later
- **P4**: Experimental - Cutting edge, evaluate ROI

### Effort Legend
- **Low**: 1-3 days
- **Medium**: 1-2 weeks
- **High**: 2-4 weeks
- **Very High**: 1+ months

### Recommended Implementation Order

#### Sprint 1: Quick Wins (P0, Low-Medium Effort)
| Feature | Effort | Impact |
|---------|--------|--------|
| Smart Dashboard with action cards | Medium | High |
| Gallery Lightbox Viewer | Medium | High |
| Mobile bottom navigation | Low | High |
| Image loading optimization | Medium | High |

#### Sprint 2: Core Engagement (P0-P1, Medium Effort)
| Feature | Effort | Impact |
|---------|--------|--------|
| Notification bell + activity feed | Medium | High |
| Photo favorites system | Medium | Medium |
| Selective photo downloads | Medium | High |
| Tab-based data loading | Medium | Medium |

#### Sprint 3: Payments & Polish (P1-P2, Medium Effort)
| Feature | Effort | Impact |
|---------|--------|--------|
| Embedded Stripe checkout | Medium | High |
| Client preferences page | Low | Medium |
| Invoice improvements | Low | Medium |
| PWA support | Medium | Medium |

#### Sprint 4: Communication (P1-P2, High Effort)
| Feature | Effort | Impact |
|---------|--------|--------|
| Messaging hub | High | High |
| Scheduling integration | Medium | Medium |
| Client feedback system | Medium | Medium |

#### Sprint 5: Advanced (P2-P3, High Effort)
| Feature | Effort | Impact |
|---------|--------|--------|
| Multi-user team access | High | Medium |
| Analytics dashboard | Medium | Medium |
| Add-on marketplace | Medium | Medium |
| AI photo curation | High | High |

---

## Technical Considerations

### Database Additions Required

```prisma
// New models for full implementation

model PortalNotification {
  id        String   @id @default(cuid())
  clientId  String
  type      String
  title     String
  message   String
  link      String?
  readAt    DateTime?
  createdAt DateTime @default(now())
  client    Client   @relation(fields: [clientId], references: [id])
}

model PortalMessage {
  id           String   @id @default(cuid())
  clientId     String
  content      String   @db.Text
  attachments  Json?
  isFromClient Boolean  @default(true)
  readAt       DateTime?
  galleryId    String?
  propertyId   String?
  createdAt    DateTime @default(now())
  client       Client   @relation(fields: [clientId], references: [id])
}

model PhotoFavorite {
  id        String   @id @default(cuid())
  clientId  String
  assetId   String
  galleryId String
  createdAt DateTime @default(now())
  @@unique([clientId, assetId])
}

model ClientPreferences {
  id                    String  @id @default(cuid())
  clientId              String  @unique
  emailNotifications    Boolean @default(true)
  defaultDownloadQuality String @default("high")
  timezone              String  @default("America/New_York")
  language              String  @default("en")
  theme                 String  @default("system")
}

model TeamMember {
  id        String   @id @default(cuid())
  clientId  String   // Parent client account
  email     String
  name      String
  role      String   // admin, agent, assistant, marketing
  createdAt DateTime @default(now())
  client    Client   @relation(fields: [clientId], references: [id])
}
```

### New API Routes Required

```
POST /api/portal/notifications/mark-read
GET  /api/portal/notifications
POST /api/portal/messages
GET  /api/portal/messages
POST /api/portal/favorites
DELETE /api/portal/favorites/[id]
GET  /api/portal/preferences
PUT  /api/portal/preferences
POST /api/portal/feedback
GET  /api/portal/analytics
```

### New Components Required

```
src/app/(client-portal)/portal/components/
├── notification-bell.tsx
├── notification-panel.tsx
├── action-cards.tsx
├── activity-timeline.tsx
├── lightbox/
│   ├── lightbox-modal.tsx
│   ├── lightbox-controls.tsx
│   └── lightbox-thumbnails.tsx
├── photo-selector.tsx
├── favorites-button.tsx
├── messaging/
│   ├── message-thread.tsx
│   ├── message-input.tsx
│   └── message-list.tsx
├── preferences/
│   ├── preferences-form.tsx
│   └── notification-settings.tsx
└── mobile/
    ├── bottom-nav.tsx
    └── swipe-tabs.tsx
```

---

## Success Metrics

### Engagement Metrics
- Portal login frequency (target: 2x/week active clients)
- Time spent per session (target: 5+ minutes)
- Feature adoption rates (target: 60%+ use new features)
- Download completion rate (target: 95%+)

### Business Metrics
- Invoice payment speed (target: <3 days average)
- Questionnaire completion rate (target: 90%+)
- Add-on purchase rate (target: 20% of orders)
- Client retention rate (target: 85%+)

### Technical Metrics
- Page load time (target: <2s)
- Core Web Vitals (all green)
- Error rate (target: <0.1%)
- Mobile usability score (target: 95+)

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2024-01-06 | 1.0 | Initial roadmap creation |

