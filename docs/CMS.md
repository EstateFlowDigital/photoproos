# PhotoProOS Marketing CMS

> Professional-grade Content Management System for all marketing pages

## Overview

The PhotoProOS CMS provides a complete content management solution for all 32 marketing pages, featuring draft preview, version history, scheduled publishing, real-time collaboration, component-based page building, and AI-assisted content generation.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Marketing Pages](#marketing-pages)
3. [Data Models](#data-models)
4. [Fetch Functions](#fetch-functions)
5. [Super Admin Interface](#super-admin-interface)
6. [Core Features](#core-features)
7. [Advanced Features](#advanced-features)
8. [Implementation Phases](#implementation-phases)
9. [API Reference](#api-reference)
10. [Verification Checklist](#verification-checklist)

---

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER-ADMIN CMS                          │
│                /super-admin/marketing                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Pages   │ │   FAQs   │ │Testimon. │ │   Blog   │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL)                           │
│  MarketingPage │ FAQ │ Testimonial │ BlogPost │ TeamMember  │
└───────┬────────┴──┬──┴──────┬──────┴────┬─────┴─────────────┘
        │           │         │           │
        ▼           ▼         ▼           ▼
┌─────────────────────────────────────────────────────────────┐
│         CACHE LAYER (60-second revalidation)                 │
│              src/lib/marketing/content.ts                    │
└───────┬────────────┬────────────┬────────────┬──────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                  MARKETING PAGES                             │
│    /pricing  │  /about  │  /features/*  │  /industries/*    │
│                                                              │
│  ┌─────────────────┐   ┌─────────────────┐                  │
│  │ plan-limits.ts  │   │   CMS Content   │                  │
│  │   (PRICES)      │ + │   (FEATURES)    │ = Final Display  │
│  └─────────────────┘   └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

| Principle | Description |
|-----------|-------------|
| **Prices in Code** | All prices stay in `plan-limits.ts` (synced to Stripe) |
| **Content in CMS** | Features, text, FAQs come from database |
| **60s Cache** | Content cached for 60 seconds using `unstable_cache` |
| **Instant Invalidation** | `revalidateTag("marketing")` for immediate updates |

---

## Marketing Pages

### All Pages (32 Total)

#### Main Marketing Pages (17)

| Route | CMS Slug | Status |
|-------|----------|--------|
| `/` | `homepage` | Ready |
| `/about` | `about` | Ready |
| `/affiliates` | `affiliates` | Ready |
| `/blog` | `blog` | Ready |
| `/careers` | `careers` | Ready |
| `/changelog` | `changelog` | Ready |
| `/contact` | `contact` | Ready |
| `/guides` | `guides` | Ready |
| `/integrations` | `integrations` | Ready |
| `/partners` | `partners` | Ready |
| `/press` | `press` | Ready |
| `/pricing` | `pricing` | Ready |
| `/roadmap` | `roadmap` | Ready |
| `/support` | `support` | Ready |
| `/webinars` | `webinars` | Ready |

#### Features Pages (8)

| Route | CMS Slug |
|-------|----------|
| `/features/galleries` | `features/galleries` |
| `/features/payments` | `features/payments` |
| `/features/clients` | `features/clients` |
| `/features/contracts` | `features/contracts` |
| `/features/automation` | `features/automation` |
| `/features/analytics` | `features/analytics` |
| `/features/social-media` | `features/social-media` |
| `/features/email-marketing` | `features/email-marketing` |

#### Industries Pages (6)

| Route | CMS Slug |
|-------|----------|
| `/industries/real-estate` | `industries/real-estate` |
| `/industries/commercial` | `industries/commercial` |
| `/industries/architecture` | `industries/architecture` |
| `/industries/events` | `industries/events` |
| `/industries/portraits` | `industries/portraits` |
| `/industries/food` | `industries/food` |

#### Legal Pages (5)

| Route | CMS Slug |
|-------|----------|
| `/legal/terms` | `legal/terms` |
| `/legal/privacy` | `legal/privacy` |
| `/legal/cookies` | `legal/cookies` |
| `/legal/security` | `legal/security` |
| `/legal/dpa` | `legal/dpa` |

---

## Data Models

### MarketingPage

```prisma
model MarketingPage {
  id          String   @id @default(cuid())
  slug        String   @unique  // "pricing", "features/galleries"
  title       String
  pageType    PageType // homepage, pricing, features, industries, legal, blog

  // Content
  content     Json     // Page-specific content structure

  // SEO
  metaTitle       String?
  metaDescription String?
  ogImage         String?

  // Status
  status      PageStatus @default(draft)

  // Draft Mode
  draftContent    Json?
  hasDraft        Boolean  @default(false)
  lastEditedBy    String?
  lastEditedAt    DateTime?

  // Scheduling
  scheduledPublishAt  DateTime?
  scheduledBy         String?
  expiresAt           DateTime?
  expirationAction    ExpirationAction?

  // Soft Delete
  deletedAt       DateTime?
  deletedBy       String?

  // Component Builder
  components      Json?    // [{ id, type, content, order }]
  layoutMode      LayoutMode @default(structured)

  // Timestamps
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum PageType {
  homepage
  pricing
  features
  industries
  legal
  blog
  about
  careers
  support
  contact
  other
}

enum PageStatus {
  draft
  published
  archived
}

enum LayoutMode {
  structured   // Traditional JSON content
  components   // Component-based layout
}

enum ExpirationAction {
  unpublish
  archive
  redirect
}
```

### FAQ

```prisma
model FAQ {
  id          String   @id @default(cuid())

  question    String
  answer      String   @db.Text
  category    FAQCategory

  // Targeting
  targetPages String[] // ["pricing", "homepage"]

  // Display
  sortOrder   Int      @default(0)
  isVisible   Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum FAQCategory {
  general
  pricing
  features
  billing
  getting_started
  technical
}
```

### Testimonial

```prisma
model Testimonial {
  id          String   @id @default(cuid())

  quote       String   @db.Text
  authorName  String
  authorTitle String?
  authorCompany String?
  authorImage String?

  // Targeting
  targetIndustry TestimonialIndustry?
  targetPages    String[]
  showOnAllPages Boolean  @default(false)

  // Display
  rating      Int?     // 1-5 stars
  isFeatured  Boolean  @default(false)
  sortOrder   Int      @default(0)
  isVisible   Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum TestimonialIndustry {
  real_estate
  commercial
  architecture
  events
  portraits
  food
}
```

### TeamMember

```prisma
model TeamMember {
  id          String   @id @default(cuid())

  name        String
  role        String
  bio         String?  @db.Text
  image       String?

  // Social Links
  linkedIn    String?
  twitter     String?

  // Display
  sortOrder   Int      @default(0)
  isVisible   Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### BlogPost

```prisma
model BlogPost {
  id          String   @id @default(cuid())

  slug        String   @unique
  title       String
  excerpt     String?
  content     String   @db.Text  // Markdown
  coverImage  String?

  category    BlogCategory
  tags        String[]

  // Author
  authorId    String?
  authorName  String?

  // SEO
  metaTitle       String?
  metaDescription String?

  // Status
  status      PageStatus @default(draft)
  isFeatured  Boolean    @default(false)

  publishedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

enum BlogCategory {
  tips
  tutorials
  industry_news
  product_updates
  case_studies
  photography_business
}
```

### MarketingNavigation

```prisma
model MarketingNavigation {
  id          String   @id @default(cuid())

  location    String   @unique  // "navbar" or "footer"
  content     Json     // Navigation structure

  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## Fetch Functions

Located in `src/lib/marketing/content.ts`:

```typescript
// Marketing Pages
getHomepageContent()           // → "homepage"
getPricingContent()            // → "pricing"
getFeaturesContent(slug?)      // → "features" or "features/{slug}"
getIndustryContent(slug)       // → "industries/{slug}"
getAboutContent()              // → "about"
getLegalContent(slug)          // → "legal/{slug}"
getBlogIndexContent()          // → "blog"
getMarketingPageContent(slug)  // → Any page by slug

// Navigation
getNavbarContent()             // → Navbar structure
getFooterContent()             // → Footer structure

// FAQs
getFAQsForPage(page)           // → FAQs for specific page
getFAQsByCategory(category)    // → FAQs by category
getAllFAQsGrouped()            // → All FAQs grouped by category

// Testimonials
getTestimonialsForPage(page)   // → Testimonials for specific page
getFeaturedTestimonials(limit) // → Featured testimonials

// Team
getTeamMembers()               // → All visible team members

// Blog
getPublishedPosts(options)     // → Published blog posts
getFeaturedPosts(limit)        // → Featured posts
getRecentPosts(limit)          // → Recent posts
getPostBySlug(slug)            // → Single post
getBlogCategories()            // → Categories with counts
```

### Cache Configuration

```typescript
const CACHE_TAG = "marketing";
const CACHE_REVALIDATE = 60; // 1 minute

// Invalidate cache
import { revalidateTag } from "next/cache";
revalidateTag("marketing");
```

---

## Super Admin Interface

Access: `/super-admin/marketing`

### File Structure

```
src/app/(super-admin)/super-admin/marketing/
├── page.tsx                      # Dashboard overview
├── pages/
│   ├── page.tsx                  # Server component - fetches pages
│   └── pages-list-client.tsx     # Client component - search, filter, list
├── [slug]/
│   ├── page.tsx                  # Server component - fetches single page
│   └── page-editor-client.tsx    # Client component - full CRUD editor
└── navigation/
    ├── page.tsx                  # Server component - fetches nav data
    └── navigation-client.tsx     # Client component - navbar/footer editor
```

### Features

- **Page Management**: Edit all 34 marketing pages with search and filter
- **FAQ Management**: Create, edit, delete FAQs with page targeting
- **Testimonial Management**: Manage customer testimonials
- **Team Management**: Edit team member profiles
- **Blog Management**: Write and publish blog posts
- **Navigation**: Edit navbar and footer content
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Keyboard Shortcuts**: Cmd/Ctrl+S to save
- **Unsaved Changes Warning**: Prevents accidental data loss

### Tabs

1. **Overview** - Dashboard with stats and quick actions
2. **Pages** - All marketing pages with search, type/status filters
3. **FAQs** - FAQ management with category filtering
4. **Testimonials** - Customer testimonials
5. **Team** - Team member profiles
6. **Blog** - Blog posts
7. **Navigation** - Navbar and footer editing

### Accessibility Features

| Feature | Implementation |
|---------|----------------|
| Form Labels | All inputs have associated `<label>` elements with `htmlFor`/`id` |
| ARIA Roles | Tabs use `role="tab"`, dialogs use `role="dialog"` or `role="alertdialog"` |
| Focus Management | Dialogs trap focus and return focus on close |
| Keyboard Navigation | Escape closes dialogs, Tab navigates, Enter activates |
| Live Regions | Character counters use `aria-live="polite"` |
| Error States | Invalid fields use `aria-invalid="true"` |

---

## Core Features

### 1. Draft Mode & Live Preview

Edit content without affecting the live site.

```typescript
// Enable preview mode
// GET /api/preview?slug=pricing&secret=xxx

import { draftMode } from "next/headers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  const secret = searchParams.get("secret");

  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response("Invalid token", { status: 401 });
  }

  draftMode().enable();
  redirect(`/preview/${slug}`);
}
```

**How it works:**
- Editors save drafts without publishing
- Preview URL shows draft content
- Regular URL shows published content
- Device preview (mobile/tablet/desktop)

### 2. Version History

Track all changes with ability to restore.

```prisma
model MarketingPageVersion {
  id          String   @id @default(cuid())

  pageId      String
  page        MarketingPage @relation(fields: [pageId], references: [id])

  version     Int
  content     Json
  metaTitle   String?
  metaDescription String?

  createdBy   String
  createdByName String?
  changesSummary String?

  createdAt   DateTime @default(now())

  @@index([pageId, version])
}
```

**Features:**
- Automatic version creation on save
- Side-by-side diff view
- One-click restore
- Change summaries

### 3. Scheduled Publishing (Implemented)

Set future publish dates with content calendar.

**Cron Endpoint:** `/api/cron/cms-scheduled-publish`
- Processes all pages with `scheduledPublishAt <= now`
- Publishes draft content if available, otherwise just updates status
- Clears scheduling fields after successful publish
- Supports both GET and POST methods

**Server Actions:**
```typescript
// Schedule a page for future publishing
schedulePublish(slug: string, scheduledPublishAt: Date)

// Cancel a scheduled publish
cancelScheduledPublish(slug: string)

// Process all due scheduled publishes (called by cron)
processScheduledPublishes()

// Get pages for calendar view
getScheduledPages({ startDate?, endDate? })
getDraftPages()
getContentCalendarSummary(startDate, endDate)
```

**Scheduling Panel Component:**
- Date/time picker with 5-minute minimum future time
- Shows scheduled date, time until publish, and scheduled by user
- Edit and cancel functionality
- Quick schedule buttons (1 hour, tomorrow 9am, next Monday)

**Content Calendar:** `/super-admin/marketing/calendar`
- Month calendar view with navigation
- Day cells showing scheduled/published counts
- Sidebar with upcoming scheduled, drafts, and quick stats
- Links to page editor from all items

**Features:**
- Content calendar view at `/super-admin/marketing/calendar`
- Future scheduling with visual countdown
- Scheduling panel in page editor Settings tab
- "Scheduled" badge indicator on pages

### 4. Collaborative Editing Presence (Implemented)

See who's editing what content in real-time.

```prisma
model CMSPresence {
  id          String   @id @default(cuid())
  userId      String
  userName    String
  userAvatar  String?
  userColor   String?
  entityType  String   // "MarketingPage", "FAQ", etc.
  entityId    String
  activeField String?
  lastSeen    DateTime @default(now())
  sessionId   String?

  @@unique([userId, entityType, entityId])
  @@index([entityType, entityId])
  @@index([lastSeen])
}

model CMSAuditLog {
  id          String   @id @default(cuid())
  userId      String
  userName    String
  entityType  String
  entityId    String
  entityName  String?
  action      String   // "create", "update", "publish", "delete", "restore"
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([entityType, entityId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

**Server Actions:**
```typescript
// Presence tracking
updatePresence(entityType, entityId, activeField?)  // Heartbeat
getActiveEditors(entityType, entityId)              // Get other editors
removePresence(entityType, entityId)                // Cleanup on leave
cleanupStalePresence()                              // Cron job helper

// Audit logging
createAuditLog({ entityType, entityId, entityName, action, details })
getAuditLogs(entityType, entityId, { limit?, offset? })
getRecentActivity(limit?)
```

**ActiveEditors Component:**
- Avatar stack showing other users editing the same content
- Color-coded avatars based on user ID hash (8 distinct colors)
- Tooltip with editor name, active field, and last seen time
- Automatic heartbeat (15s) and polling (10s) intervals
- Compact mode variant for tight spaces

**Features:**
- Real-time presence indicators with avatar stack
- Color-coded user avatars for quick identification
- Heartbeat mechanism (15s intervals)
- Stale threshold (60s) with auto-cleanup
- Audit logging for all CMS activities

### 5. Auto-Save System (Implemented)

Never lose work with automatic draft saving.

**useAutoSave Hook:**
```typescript
const autoSave = useAutoSave({
  content,                    // Content to watch
  onSave: handleAutoSave,     // Save function
  debounceDelay: 3000,        // Wait 3s after typing stops
  intervalDelay: 30000,       // Also save every 30s
  enabled: true,
});

// Returns
autoSave.status        // "idle" | "saving" | "saved" | "error"
autoSave.lastSavedAt   // Date | null
autoSave.isOnline      // boolean
autoSave.saveNow()     // Trigger immediate save
```

**Components:**
- `AutoSaveIndicator` - Full status display with details
- `AutoSaveBadge` - Compact badge for headers

**Features:**
- Debounced saves on content change (configurable delay)
- Periodic saves at interval (configurable)
- Offline detection with visual indicator
- Status tracking: idle, saving, saved, error
- Integration with `saveDraft()` server action

---

## Advanced Features

### 5. Component Library Page Builder

Drag-and-drop pre-built components to build pages.

```
┌─────────────────────────────────────────────────────────────┐
│  COMPONENT LIBRARY (left)    │    PAGE PREVIEW (right)      │
│                              │                               │
│  ┌─────────────────┐        │    ┌─────────────────────┐   │
│  │ Hero Section    │ ←drag→ │    │ HERO SECTION        │   │
│  └─────────────────┘        │    │ [Edit: headline,    │   │
│  ┌─────────────────┐        │    │  subtext, CTA]      │   │
│  │ Features Grid   │        │    └─────────────────────┘   │
│  └─────────────────┘        │    ┌─────────────────────┐   │
│  ┌─────────────────┐        │    │ TESTIMONIALS        │   │
│  │ Testimonials    │        │    │ [Edit: quotes]      │   │
│  └─────────────────┘        │    └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Available Component Types

| Component | Editable Fields |
|-----------|-----------------|
| **Hero** | headline, subheadline, cta_text, cta_link, background_image |
| **Features Grid** | title, features[{icon, title, description}] |
| **Testimonials** | title, testimonials[{quote, name, company, avatar}] |
| **FAQ Accordion** | title, faqs[{question, answer}] |
| **CTA Section** | headline, description, button_text, button_link |
| **Stats/Metrics** | title, stats[{number, label, icon}] |
| **Pricing Table** | (pulls from plan-limits.ts automatically) |
| **Team Grid** | title, members[{name, role, image, bio}] |
| **Logo Cloud** | title, logos[{name, image, link}] |
| **Image Gallery** | title, images[{src, alt, caption}] |
| **Text Block** | content (rich text/markdown) |
| **Video Embed** | title, video_url, thumbnail |
| **Comparison Table** | title, headers[], rows[][] |
| **Timeline** | title, events[{date, title, description}] |
| **Cards Grid** | title, cards[{icon, title, description, link}] |

#### Schema

```prisma
model CMSComponent {
  id          String   @id @default(cuid())

  name        String
  slug        String   @unique
  description String?
  type        ComponentType

  schema      Json     // { fields: [{ name, type, required, default }] }
  defaultContent Json
  thumbnail   String?

  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum ComponentType {
  hero
  features_grid
  features_list
  testimonials
  faq_accordion
  cta_section
  stats_metrics
  pricing_table
  team_grid
  logo_cloud
  image_gallery
  text_block
  video_embed
  comparison_table
  timeline
  cards_grid
}
```

### 6. Real-time Collaborative Editing

Like Google Docs - multiple users can edit simultaneously.

```
┌─────────────────────────────────────────────────────────────┐
│                 COLLABORATIVE EDITING                        │
│                                                              │
│  User A                              User B                  │
│  ┌──────────────────────┐           ┌──────────────────────┐│
│  │ Editing: Headline    │           │ Editing: Description ││
│  │ [cursor here]        │           │           [cursor]   ││
│  └──────────────────────┘           └──────────────────────┘│
│            │                                   │             │
│            ▼                                   ▼             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              WEBSOCKET SERVER (Yjs/CRDT)                ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Live cursors showing other users
- Conflict-free merging (CRDT)
- Automatic sync
- Periodic database persistence

#### Schema

```prisma
model CMSCollabSession {
  id          String   @id @default(cuid())

  entityType  String
  entityId    String

  ydocState   Bytes?   // Yjs document state
  participants Json    // [{ id, name, avatar, cursorPosition, color }]

  startedAt   DateTime @default(now())
  lastActivity DateTime @default(now())

  @@unique([entityType, entityId])
}
```

### 7. Custom Workflow Builder

Visual workflow designer for approval processes.

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW BUILDER                          │
│                                                              │
│   ┌────────┐     ┌─────────────┐     ┌─────────────┐       │
│   │ Start  │ ──▶ │   Editor    │ ──▶ │   Legal     │       │
│   │        │     │   Review    │     │   Review?   │       │
│   └────────┘     └─────────────┘     └──────┬──────┘       │
│                                             │               │
│                        ┌────────────────────┼───────────┐   │
│                        ▼                    ▼           │   │
│                  ┌──────────┐         ┌──────────┐     │   │
│                  │ Legal    │         │ Publish  │ ◀───┘   │
│                  │ Review   │ ──────▶ │          │         │
│                  └──────────┘         └──────────┘         │
└─────────────────────────────────────────────────────────────┘
```

#### Workflow Steps

| Type | Description |
|------|-------------|
| **Start** | Entry point |
| **Approval** | Requires user approval |
| **Condition** | Branch based on content |
| **Action** | Automated action (publish, notify) |
| **End** | Workflow complete |

#### Schema

```prisma
model CMSWorkflow {
  id          String   @id @default(cuid())

  name        String
  description String?
  targetTypes String[]

  steps       Json     // [{ id, name, type, config, nextSteps }]
  conditions  Json?

  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model CMSWorkflowInstance {
  id          String   @id @default(cuid())

  workflowId  String
  entityType  String
  entityId    String

  currentStep String
  status      WorkflowInstanceStatus @default(in_progress)
  history     Json

  startedAt   DateTime @default(now())
  completedAt DateTime?
}

enum WorkflowInstanceStatus {
  in_progress
  completed
  cancelled
  rejected
}
```

### 8. Page Analytics Dashboard

Track traffic, engagement, and conversions for each page.

```
┌─────────────────────────────────────────────────────────────┐
│                    PAGE ANALYTICS                            │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Visitors │ │ Avg Time │ │ Bounce   │ │Conversions│       │
│  │  2,450   │ │  2:34    │ │  42.3%   │ │   156    │       │
│  │  ↑ 12%   │ │  ↑ 8%    │ │  ↓ 5%   │ │   ↑ 23%  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  TRAFFIC OVER TIME                       ││
│  │  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌───────────────────┐  ┌───────────────────┐              │
│  │  TRAFFIC SOURCES  │  │ CONVERSION FUNNEL │              │
│  │                   │  │                   │              │
│  │  Direct: 35%      │  │  Visitors: 2,450  │              │
│  │  Google: 42%      │  │  Engaged: 1,820   │              │
│  │  Social: 15%      │  │  CTA Click: 450   │              │
│  │  Other: 8%        │  │  Converted: 156   │              │
│  └───────────────────┘  └───────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

#### Tracked Metrics

| Metric | Description |
|--------|-------------|
| **Pageviews** | Total page loads |
| **Unique Visitors** | Distinct visitors |
| **Avg. Time on Page** | Engagement duration |
| **Bounce Rate** | Single-page visits |
| **Scroll Depth** | How far users scroll (25%, 50%, 75%, 100%) |
| **CTA Clicks** | Button/link clicks |
| **Conversions** | Sign-ups, form submissions |

#### Schema

```prisma
model CMSPageAnalytics {
  id          String   @id @default(cuid())

  pageId      String
  date        DateTime @db.Date

  pageviews   Int      @default(0)
  uniqueVisitors Int   @default(0)
  avgTimeOnPage Float  @default(0)
  bounceRate    Float  @default(0)
  scrollDepth   Float  @default(0)
  ctaClicks     Int    @default(0)
  conversions   Int    @default(0)

  sources       Json   // { direct: n, google: n, social: n }
  devices       Json   // { desktop: n, mobile: n, tablet: n }

  @@unique([pageId, date])
}

model CMSPageEvent {
  id          String   @id @default(cuid())

  pageId      String
  eventType   String
  eventData   Json?

  visitorId   String
  sessionId   String

  referrer    String?
  userAgent   String?

  createdAt   DateTime @default(now())
}
```

### 9. Content Governance Policies

Automated rules to ensure content quality.

#### Policy Types

| Type | Description |
|------|-------------|
| **Brand Voice** | Check for banned/required words |
| **Legal Compliance** | Required disclaimers |
| **Accessibility** | Alt text, proper headings |
| **SEO** | Meta lengths, keywords |
| **Freshness** | Content age limits |
| **Approval Gates** | Required approvers |
| **Publishing Windows** | Time restrictions |

#### Example Policies

**Brand Voice Standards:**
```json
{
  "name": "Brand Voice Standards",
  "type": "brand_voice",
  "rules": [
    {
      "field": "content",
      "check": "not_contains",
      "value": ["cheap", "best ever", "guaranteed", "100%"],
      "severity": "error",
      "message": "Content contains banned marketing terms"
    }
  ],
  "action": "warn"
}
```

**Accessibility Requirements:**
```json
{
  "name": "Accessibility Requirements",
  "type": "accessibility",
  "rules": [
    {
      "field": "images",
      "check": "all_have_alt",
      "severity": "error",
      "message": "All images must have alt text"
    }
  ],
  "action": "block"
}
```

**Content Freshness:**
```json
{
  "name": "Content Freshness",
  "type": "freshness",
  "rules": [
    {
      "field": "updatedAt",
      "check": "within_days",
      "value": 90,
      "severity": "warning",
      "message": "Content hasn't been reviewed in 90 days"
    }
  ],
  "action": "warn"
}
```

#### Schema

```prisma
model CMSGovernancePolicy {
  id          String   @id @default(cuid())

  name        String
  description String?
  type        GovernancePolicyType
  targetTypes String[]
  rules       Json
  action      GovernanceAction @default(warn)

  isActive    Boolean  @default(true)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum GovernancePolicyType {
  brand_voice
  legal_compliance
  accessibility
  seo
  freshness
  approval_gates
  publishing_windows
}

enum GovernanceAction {
  warn            // Show warning but allow
  block           // Prevent publishing
  require_override // Block unless admin override
}

model CMSGovernanceViolation {
  id          String   @id @default(cuid())

  policyId    String
  entityType  String
  entityId    String
  violations  Json

  resolvedAt  DateTime?
  resolvedBy  String?
  resolution  String?

  createdAt   DateTime @default(now())
}
```

### 10. Approval Workflows

Request and manage content approvals.

```prisma
model ContentApproval {
  id          String   @id @default(cuid())

  entityType  String
  entityId    String
  entityTitle String?

  status      ApprovalStatus @default(pending)

  requestedBy     String
  requestedByName String
  requestedAt     DateTime @default(now())

  approvers       Json
  currentStep     Int      @default(0)

  contentSnapshot Json
  changesSummary  String?

  resolvedAt      DateTime?
  resolvedBy      String?
  resolvedByName  String?
  resolution      String?
}

enum ApprovalStatus {
  pending
  in_review
  approved
  rejected
  cancelled
}
```

### 11. AI Content Generation

AI-powered content suggestions using Claude API.

```typescript
// src/app/api/cms/ai/generate/route.ts
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  const { field, currentValue, context } = await request.json();

  const anthropic = new Anthropic();

  const prompts: Record<string, string> = {
    metaTitle: `Generate 3 SEO-optimized page titles (50-60 chars)...`,
    metaDescription: `Generate 3 compelling meta descriptions (150-160 chars)...`,
    headline: `Generate 3 attention-grabbing headlines...`,
  };

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [{ role: "user", content: prompts[field] }],
  });

  return Response.json({ suggestions: parseAISuggestions(response) });
}
```

#### Schema

```prisma
model AIContentSuggestion {
  id          String   @id @default(cuid())

  entityType  String
  entityId    String
  field       String

  originalValue   String?
  suggestedValue  String

  status      AISuggestionStatus @default(pending)

  prompt      String?
  model       String

  respondedAt DateTime?
  respondedBy String?
  response    String?
  editedValue String?

  createdAt   DateTime @default(now())
}

enum AISuggestionStatus {
  pending
  accepted
  rejected
  edited
}
```

### 12. Webhooks

Trigger external actions on content events.

```prisma
model CMSWebhook {
  id          String   @id @default(cuid())

  name        String
  url         String
  secret      String

  events      CMSWebhookEvent[]

  isActive    Boolean  @default(true)

  lastTriggeredAt DateTime?
  successCount    Int      @default(0)
  failureCount    Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum CMSWebhookEvent {
  page_published
  page_unpublished
  page_updated
  page_deleted
  faq_created
  faq_updated
  faq_deleted
  blog_published
  content_approved
  content_rejected
}

model CMSWebhookLog {
  id          String   @id @default(cuid())

  webhookId   String
  event       CMSWebhookEvent
  payload     Json

  status      Int
  response    String?
  duration    Int

  createdAt   DateTime @default(now())
}
```

---

## Peace of Mind Features

### Auto-Save ✅ IMPLEMENTED
- Debounced saves (3 seconds after typing stops)
- Periodic saves every 30 seconds
- Visual indicator showing save status (idle, saving, saved, error)
- Offline detection warns when connection lost
- Never lose work with draft content persistence

### Soft Delete / Trash
- 30-day retention before permanent deletion
- Easy restore from trash
- Protection against accidental deletion

### Content Health Dashboard
- Published/Draft/Pending counts
- Outdated content alerts
- Broken link detection
- SEO issue summary

### Undo/Redo in Editor
- Full undo/redo history
- Keyboard shortcuts (Cmd+Z, Cmd+Shift+Z)

### Confirmation Dialogs
- Type-to-confirm for destructive actions
- Clear warning messages

### Content Dependencies
- Show what links to a page before editing
- Warning when changes affect other content

---

## Implementation Phases

### Phase 1: Core CMS Integration ✅ COMPLETE
- [x] Create seed script for all 32 pages (34 pages seeded)
- [x] Create marketing-cms.ts server actions (CRUD operations)
- [x] Create docs/CMS.md documentation
- [x] Build Super Admin dashboard at `/super-admin/marketing`
- [x] Create Pages List with search, filter by type/status
- [x] Create Page Editor with full CRUD
- [x] Create Navigation Editor (navbar + footer)
- [x] Add WCAG 2.1 AA accessibility compliance
- [x] Add keyboard shortcuts (Cmd/Ctrl+S to save)
- [x] Add unsaved changes warnings
- [x] Add responsive design for all CMS views

### Phase 2: All Pages Connected ✅ COMPLETE
- [x] Connect all 8 feature pages (galleries, payments, clients, contracts, automation, analytics, social-media, email-marketing)
- [x] Connect all 6 industry pages (real-estate, commercial, architecture, events, portraits, food)
- [x] Connect all 5 legal pages (terms, privacy, cookies, security, dpa)
- [x] Connect remaining main pages (about, contact, blog, careers, changelog, guides, integrations, partners, press, support, webinars, affiliates)

### Phase 3: Draft Mode & Preview ✅ COMPLETE
- [x] Add draftContent, hasDraft, lastEditedBy, lastEditedAt fields to schema
- [x] Add scheduledPublishAt, scheduledBy fields for future scheduling
- [x] Create preview API routes (`/api/preview` and `/api/preview/disable`)
- [x] Update content.ts with preview-aware `getMarketingPageContentWithPreview()`
- [x] Add `isPreviewMode()` helper function
- [x] Create PreviewToolbar component with status indicator
- [x] Add device preview buttons (desktop/tablet/mobile)
- [x] Add draft operations: `saveDraft()`, `publishDraft()`, `discardDraft()`
- [x] Add scheduling operations: `schedulePublish()`, `cancelScheduledPublish()`

### Phase 4: Version History ✅ COMPLETE
- [x] Create MarketingPageVersion table in schema (pageId, slug, version, content, meta fields, createdBy)
- [x] Add automatic version snapshots in `updateMarketingPage()` before updates
- [x] Add `getPageVersions()` with pagination and total count
- [x] Add `getPageVersion()` for fetching specific versions
- [x] Add `restoreVersion()` with backup creation before restore
- [x] Add `compareVersions()` for fetching two versions to compare
- [x] Add `cleanupOldVersions()` utility to manage version count
- [x] Build VersionHistory component with paginated list, preview, restore
- [x] Build ContentDiff component with visual highlighting (added/removed/changed)
- [x] Add History tab to page editor with version list and restore
- [x] Add InlineEditable component for direct on-page content editing
- [x] Add InlineEditProvider and useInlineEdit hook

### Phase 5: Scheduled Publishing & Calendar (Complete)
- [x] Add scheduledPublishAt field (Phase 3)
- [x] Create cron endpoint (`/api/cron/cms-scheduled-publish`)
- [x] Add processScheduledPublishes server action
- [x] Add scheduling UI (SchedulingPanel component in page editor Settings tab)
- [x] Build content calendar view (`/super-admin/marketing/calendar`)
- [x] Add calendar navigation to marketing dashboard

### Phase 6: Collaboration & Workflow ✅ COMPLETE
- [x] Create CMSPresence table (userId, userName, userAvatar, userColor, entityType, entityId, activeField, lastSeen, sessionId)
- [x] Create CMSAuditLog table (userId, userName, entityType, entityId, entityName, action, details, ipAddress, userAgent)
- [x] Build presence API: `updatePresence()`, `getActiveEditors()`, `removePresence()`, `cleanupStalePresence()`
- [x] Build audit log API: `createAuditLog()`, `getAuditLogs()`, `getRecentActivity()`
- [x] Add ActiveEditors component with avatar stack and tooltips
- [x] Add `usePresence` hook for presence management
- [x] Implement auto-save system with `useAutoSave` hook
- [x] Add `AutoSaveIndicator` and `AutoSaveBadge` components
- [x] Integrate auto-save into page editor (3s debounce, 30s interval)
- [x] Add offline detection with visual indicator

### Phase 7: Quality & SEO
- [ ] Add SEO scoring component
- [ ] Add content validation
- [ ] Add broken link checker
- [ ] Add content health dashboard

### Phase 8: Approval Workflows
- [ ] Create ContentApproval table
- [ ] Build approval request UI
- [ ] Build approval inbox
- [ ] Add approval notifications

### Phase 9: AI Content Generation
- [ ] Create AIContentSuggestion table
- [ ] Build AI assistant UI
- [ ] Create AI generation API
- [ ] Add accept/reject flow

### Phase 10: Webhooks
- [ ] Create CMSWebhook tables
- [ ] Build webhook dispatcher
- [ ] Create webhook management UI
- [ ] Add webhook logs viewer

### Phase 11: Advanced Features
- [ ] Create Global Components system
- [ ] Build Media Library
- [ ] Add bulk operations
- [ ] Add soft delete / trash

### Phase 12: Component Page Builder
- [ ] Create CMSComponent table
- [ ] Build component library
- [ ] Create drag-and-drop page builder UI
- [ ] Implement component editor panels

### Phase 13: Page Analytics
- [ ] Create CMSPageAnalytics tables
- [ ] Implement event tracking script
- [ ] Build analytics dashboard UI
- [ ] Add conversion funnel visualization

### Phase 14: Content Governance
- [ ] Create CMSGovernancePolicy table
- [ ] Implement policy engine
- [ ] Build governance check UI
- [ ] Add brand voice checker

### Phase 15: Real-time Collaborative Editing
- [ ] Set up WebSocket server
- [ ] Integrate Yjs/CRDT
- [ ] Build collaborative editor with cursors
- [ ] Add conflict resolution

### Phase 16: Custom Workflow Builder
- [ ] Create CMSWorkflow tables
- [ ] Build visual workflow designer
- [ ] Implement workflow engine
- [ ] Add condition and approval nodes

### Phase 17: Future (Lower Priority)
- [ ] A/B Testing infrastructure
- [ ] Multi-language (i18n) support
- [ ] Content templates
- [ ] Field-level permissions

---

## API Reference

### Preview Mode

```typescript
// Enable preview
GET /api/preview?slug=pricing&secret=xxx

// Disable preview
GET /api/preview/disable
```

### Cache Invalidation

```typescript
// Server Action
"use server";
import { revalidateTag } from "next/cache";

export async function invalidateMarketing() {
  revalidateTag("marketing");
}
```

### Scheduled Publishing Cron

```typescript
// /api/cron/publish-scheduled
GET /api/cron/publish-scheduled

// Configure in vercel.json:
{
  "crons": [{
    "path": "/api/cron/publish-scheduled",
    "schedule": "*/5 * * * *"
  }]
}
```

### AI Content Generation

```typescript
POST /api/cms/ai/generate
{
  "field": "metaTitle",
  "currentValue": "Current Title",
  "context": {
    "pageType": "pricing",
    "topic": "Photography business software"
  }
}

// Response
{
  "suggestions": [
    "Professional Photography Business Software | PhotoProOS",
    "Grow Your Photography Business | PhotoProOS Pricing",
    "All-in-One Photography Platform - Plans & Pricing"
  ]
}
```

### Presence API

```typescript
// Update presence
POST /api/cms/presence
{
  "entityType": "MarketingPage",
  "entityId": "clxxx...",
  "userId": "user_xxx",
  "userName": "John Doe"
}

// Get active editors
GET /api/cms/presence?entityType=MarketingPage&entityId=clxxx...
```

### Webhooks

```typescript
// Webhook payload format
{
  "event": "page_published",
  "timestamp": "2024-01-14T12:00:00Z",
  "data": {
    "pageId": "clxxx...",
    "slug": "pricing",
    "title": "Pricing",
    "publishedBy": "user_xxx"
  }
}

// Signature verification
const signature = req.headers["x-cms-signature"];
const expectedSignature = crypto
  .createHmac("sha256", webhook.secret)
  .update(JSON.stringify(payload))
  .digest("hex");

if (signature !== expectedSignature) {
  throw new Error("Invalid signature");
}
```

---

## Verification Checklist

### Phase 1-2: Basic CMS
- [ ] Run `npm run seed:marketing`
- [ ] Visit `/super-admin/marketing` - verify 32 pages appear
- [ ] Visit `/pricing` - verify content loads from CMS
- [ ] Edit FAQ in admin → verify change appears (≤60s)

### Phase 3: Draft Mode
- [ ] Save draft content in admin
- [ ] Visit preview URL → see draft content
- [ ] Visit regular URL → see published content
- [ ] Preview toolbar shows and works

### Phase 4: Version History
- [ ] Make 3 edits to a page
- [ ] Verify 3 versions appear in history
- [ ] Preview old version
- [ ] Restore old version → verify content restored

### Phase 5: Scheduled Publishing (Complete)
- [x] Schedule page for 5 minutes from now (Settings tab → Scheduling panel)
- [x] Verify page shows "Scheduled" badge in header
- [x] Cancel scheduled publish and verify badge removed
- [x] Visit content calendar at `/super-admin/marketing/calendar`
- [x] Verify calendar shows scheduled pages on correct dates
- [x] Verify drafts sidebar shows pages with draft content
- [ ] Configure cron job to hit `/api/cron/cms-scheduled-publish`
- [ ] Wait for cron → verify page publishes automatically

### Phase 6: Collaboration & Workflow (Complete)
- [x] Open page editor → verify ActiveEditors component in header
- [x] Edit content → verify AutoSaveBadge shows "Saving..." then "Saved"
- [x] Wait 30 seconds → verify periodic auto-save triggers
- [x] Disconnect network → verify "Offline" indicator appears
- [ ] Open same page in two browsers → verify both users see each other (requires multiple sessions)
- [ ] Close one browser → verify user disappears after 60s (stale threshold)

### Phase 8: Approvals
- [ ] Request approval for a page
- [ ] Log in as approver → see pending approval
- [ ] Approve → verify page can be published

### Phase 9: AI Content
- [ ] Click "AI Suggestions" on a text field
- [ ] Verify 3 suggestions appear
- [ ] Click "Accept" → field updates

### Phase 12: Page Builder
- [ ] Create new page with component builder
- [ ] Drag hero component to canvas
- [ ] Edit hero content in panel
- [ ] Verify preview updates live

### Phase 13: Analytics
- [ ] Visit marketing page
- [ ] Check analytics dashboard shows pageview
- [ ] Scroll to bottom → verify scroll depth tracked

### Phase 14: Governance
- [ ] Add banned word to page content
- [ ] Verify warning appears
- [ ] Try to publish → verify blocked if policy is "block"

### Phase 15: Real-time Collab
- [ ] Open same page in two browsers
- [ ] Type in one browser → see change in other
- [ ] See other user's cursor position

### Phase 16: Workflows
- [ ] Create custom workflow with 2 approval steps
- [ ] Submit content through workflow
- [ ] Verify it stops at each approval step

---

## Complete Schema Summary

### New Tables

| Table | Purpose | Phase |
|-------|---------|-------|
| `MarketingPageVersion` | Version history | 4 |
| `FAQVersion` | FAQ version history | 4 |
| `CMSPresence` | Collaborative editing presence | 6 |
| `CMSAuditLog` | Activity tracking | 6 |
| `ContentApproval` | Approval workflows | 8 |
| `AIContentSuggestion` | AI suggestions | 9 |
| `CMSWebhook` | Webhook config | 10 |
| `CMSWebhookLog` | Webhook delivery logs | 10 |
| `GlobalComponent` | Reusable content blocks | 11 |
| `CMSMedia` | Media library | 11 |
| `CMSComponent` | Component library definitions | 12 |
| `CMSPageAnalytics` | Page traffic/engagement data | 13 |
| `CMSPageEvent` | Individual tracking events | 13 |
| `CMSGovernancePolicy` | Governance rules | 14 |
| `CMSGovernanceViolation` | Policy violations | 14 |
| `CMSCollabSession` | Real-time editing sessions | 15 |
| `CMSWorkflow` | Workflow definitions | 16 |
| `CMSWorkflowInstance` | Active workflow instances | 16 |
| `ABTest` | A/B testing | 17 |
| `ABTestImpression` | A/B test tracking | 17 |
| `MarketingPageTranslation` | i18n | 17 |

### New Fields on MarketingPage

| Field | Purpose | Phase |
|-------|---------|-------|
| `draftContent` | Draft editing | 3 |
| `hasDraft` | Draft indicator | 3 |
| `lastEditedBy` | Edit tracking | 3 |
| `lastEditedAt` | Edit tracking | 3 |
| `scheduledPublishAt` | Scheduling | 5 |
| `scheduledBy` | Scheduling | 5 |
| `expiresAt` | Auto-expire | 5 |
| `expirationAction` | Expire behavior | 5 |
| `deletedAt` | Soft delete | 11 |
| `deletedBy` | Soft delete | 11 |
| `components` | Component-based content | 12 |
| `layoutMode` | structured vs components | 12 |
| `locale` | i18n | 17 |
| `defaultLocale` | i18n | 17 |

---

## File Structure

### New Files to Create

| File | Purpose | Phase |
|------|---------|-------|
| `prisma/seed-marketing.ts` | Seed all CMS content | 1 |
| `docs/CMS.md` | CMS documentation | 1 |
| `src/app/api/preview/route.ts` | Enable draft mode | 3 |
| `src/app/api/preview/disable/route.ts` | Disable draft mode | 3 |
| `src/components/cms/preview-toolbar.tsx` | Preview mode indicator | 3 |
| `src/components/cms/device-preview.tsx` | Device breakpoint preview | 3 |
| `src/components/cms/version-history.tsx` | Version history UI | 4 |
| `src/components/cms/content-diff.tsx` | Side-by-side diff | 4 |
| `src/app/api/cron/cms-scheduled-publish/route.ts` | Scheduled publishing | 5 |
| `src/components/cms/scheduling-panel.tsx` | Schedule UI component | 5 |
| `src/app/(super-admin)/super-admin/marketing/calendar/` | Content calendar | 5 |
| `src/components/cms/active-editors.tsx` | Presence indicators | 6 |
| `src/components/cms/auto-save.tsx` | Auto-save hook & components | 6 |
| `src/components/cms/seo-score.tsx` | SEO scoring display | 7 |
| `src/components/cms/approval-request.tsx` | Approval request UI | 8 |
| `src/components/cms/approval-inbox.tsx` | Approval inbox | 8 |
| `src/components/cms/ai-assistant.tsx` | AI content suggestions | 9 |
| `src/app/api/cms/ai/generate/route.ts` | AI generation API | 9 |
| `src/lib/cms/webhooks.ts` | Webhook dispatcher | 10 |
| `src/components/cms/webhook-manager.tsx` | Webhook management UI | 10 |
| `src/components/cms/media-library.tsx` | Media management | 11 |
| `src/components/cms/page-builder.tsx` | Drag-drop page builder | 12 |
| `src/components/cms/component-editor.tsx` | Component content editor | 12 |
| `src/components/cms/component-library.tsx` | Available components | 12 |
| `src/app/(super-admin)/super-admin/marketing/analytics/page.tsx` | Analytics dashboard | 13 |
| `src/lib/cms/analytics-tracker.ts` | Client-side tracking | 13 |
| `src/app/api/cms/analytics/route.ts` | Analytics events API | 13 |
| `src/components/cms/governance-check.tsx` | Governance validation UI | 14 |
| `src/lib/cms/governance-engine.ts` | Policy evaluation | 14 |
| `src/app/api/cms/collab/route.ts` | WebSocket collab server | 15 |
| `src/components/cms/collaborative-editor.tsx` | Real-time editor | 15 |
| `src/components/cms/workflow-builder.tsx` | Visual workflow designer | 16 |
| `src/lib/cms/workflow-engine.ts` | Workflow execution | 16 |

---

## Quick Reference

### Import Content Functions

```typescript
import {
  getHomepageContent,
  getPricingContent,
  getFeaturesContent,
  getIndustryContent,
  getAboutContent,
  getLegalContent,
  getBlogIndexContent,
  getNavbarContent,
  getFooterContent,
  getFAQsForPage,
  getTestimonialsForPage,
  getTeamMembers,
  getPublishedPosts,
} from "@/lib/marketing/content";
```

### Invalidate Cache

```typescript
import { revalidateTag } from "next/cache";

// In a Server Action
revalidateTag("marketing");
```

### Check Preview Mode

```typescript
import { draftMode } from "next/headers";

const { isEnabled } = draftMode();
```

---

*Last updated: January 2025 (Phase 6 Complete)*
