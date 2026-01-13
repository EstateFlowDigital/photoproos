# PhotoProOS: Smart File Storage System
## Phase 2 Feature Specification

> **Reference Document** - Part of Phase 2 roadmap alongside Social Media Management, Email Marketing, and Content Marketing modules.

---

## Phase 2 Overview

Phase 2 focuses on **Content & Marketing Infrastructure** - giving photographers tools to manage, organize, and leverage their visual assets across all marketing channels.

### Phase 2 Modules

| Module | Purpose | Storage Integration |
|--------|---------|---------------------|
| **Smart File Storage** | Permanent asset management, organization, archival | Core infrastructure |
| **Social Media Management** | Schedule, post, analyze across platforms | Pull images from storage |
| **Email Marketing** | Newsletters, campaigns, client nurturing | Pull hero images from storage |
| **Content Marketing** | Blog posts, SEO content, portfolio showcases | Pull galleries from storage |

### Why Storage Comes First

The Smart File Storage system is the **foundation** for all other Phase 2 modules:
- Social Media needs easy access to categorized images
- Email Marketing needs hero shots and gallery highlights
- Content Marketing needs organized portfolio access
- AI categorization powers recommendations across all modules

---

## Executive Summary

**Is this feasible?** Yes, absolutely. The PhotoProOS codebase already uses Cloudflare R2 with a sophisticated upload/download system in place.

**Is it cost-effective?** Yes, with the right pricing strategy. See cost analysis below.

---

## Product Vision

A smart, AI-powered file management system that offers photographers two options:
1. **Connect their own Dropbox** - Use existing storage, view files within PhotoProOS
2. **Use PhotoProOS Storage** - Built-in R2 storage with AI features and smart organization

---

## Core Features

### 1. Dual Storage Options

| Feature | Dropbox Connect | PhotoProOS Storage |
|---------|-----------------|---------------------|
| Cost to user | They pay Dropbox | Pay us (tiered) |
| AI features | Limited | Full |
| Auto-sync galleries | Yes | Native |
| Smart organization | Basic | Advanced |
| Map view | No | Yes |
| Marketing integration | Manual | Automatic |

**Dropbox Integration:**
- OAuth sign-in to connect account
- View files like native Dropbox interface
- Auto-export galleries to Dropbox when enabled
- Import existing files from Dropbox
- Two-way sync option

**PhotoProOS Storage:**
- Native R2 storage with all AI features
- Visual folder system with gallery thumbnails
- Smart categorization and search
- Integration with future modules

---

### 2. Visual Folder Interface

**NOT a traditional file browser.** Instead:
- Folders display as cards with **thumbnail of first gallery image** as cover
- Folder "clip" icon overlay to indicate it's a folder
- Gallery name prominently displayed
- Quick stats (# of photos, date, client)
- Hover to see more images

**Example UI:**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  [House Photo]  │  │  [Kitchen Shot] │  │  [Portrait]     │
│  📁             │  │  📁             │  │  📁             │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ Smith Residence │  │ Downtown Condo  │  │ Johnson Family  │
│ 47 photos       │  │ 32 photos       │  │ 85 photos       │
│ Jan 15, 2025    │  │ Jan 12, 2025    │  │ Jan 10, 2025    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

### 3. Gallery Auto-Save Integration

**On Gallery Creation/Delivery:**
- [ ] Checkbox: "Save to Storage System"
- Auto-creates folder in correct location based on organization rules
- Preserves gallery structure and metadata

**Settings per gallery:**
- Retention period (how long to store)
- Quality level (JPEG only - no RAW by default, too large)
- Auto-archive after X months

**Global defaults in Storage Settings:**
- Default retention period
- Default quality level
- Default organization method
- Auto-save all galleries (toggle)

---

### 4. Smart Organization Options

Users choose their preferred organization in Storage Settings:

| Organization Type | Example Structure |
|-------------------|-------------------|
| By Date | `2025 / January / Gallery Name` |
| By Month | `January 2025 / Gallery Name` |
| By Client | `Smith, John / Gallery Name` |
| By Geographic Area | `Downtown / Gallery Name` |
| By Property Type | `Residential / Gallery Name` |
| By Style | `Twilight / Gallery Name` |
| Custom | User-defined rules |

**Multi-level sorting:** Can combine (e.g., By Year > By Client > By Property Type)

---

### 5. Map View (Location-Based Browsing)

For real estate/property photographers:
- Interactive map showing all shoots by location
- Click pins to see gallery thumbnails
- Filter by date range, property type, client
- Heat map of shooting activity
- Requires GPS data from EXIF or manual address entry

---

### 6. AI Features

**Smart Search:**
- Natural language: "Show me all kitchen photos from January"
- Search by content: "twilight exteriors", "modern interiors"
- Search by metadata: client, date, location

**Auto-Categorization:**
- Automatically tag photos: kitchen, bathroom, exterior, aerial, twilight, portrait
- Group similar photos together
- Identify best shots per category

**Marketing Recommendations:**
- "These 5 kitchen photos would look great on Instagram"
- "This twilight shot is perfect for your email header"
- Auto-suggest content for social media posts
- Auto-suggest content for email campaigns

**Future Module Integration:**
- Social Media Module: Auto-populate with recommended images
- Email Marketing Module: Suggest hero images and galleries
- Ideation features: "Here are trending styles similar to your work"

---

### 7. Storage Optimization (Cache Mode)

**Per-folder toggle: "Optimize Storage"**

| Mode | Behavior |
|------|----------|
| **ON (Cached)** | Store thumbnails only in hot storage, full images in cold storage |
| **OFF (Full Quality)** | Keep original high-quality files readily accessible |

**How it works:**
1. Thumbnails always load instantly
2. When user requests full image, fetch from cold storage
3. Option to "Wake up" entire folder (fetch all originals)
4. Similar to HD Photo Hub's approach

**Cost savings:**
- Infrequent Access storage: $10.24/TB vs $15.36/TB (33% savings)
- Most photographers rarely access old galleries at full resolution

---

### 8. Dropbox Sync Features

**When Dropbox integration is enabled:**
- Toggle: "Auto-sync all galleries to Dropbox"
- New galleries automatically export to connected Dropbox
- Folder structure mirrors PhotoProOS organization
- Two-way sync: Changes in Dropbox reflect in PhotoProOS
- Import existing Dropbox folders as galleries

**Export/Import Options:**
- Export selected galleries to Dropbox
- Import selected Dropbox folders
- Bulk export/import
- Schedule automatic backups

---

## Pricing Model (Confirmed)

### Tiered Storage Plans (No Overages)

| Tier | Storage | Price | Your Cost | Margin |
|------|---------|-------|-----------|--------|
| Free | 25GB | $0 | $0.38 | - |
| Starter | 100GB | $9/mo | $1.54 | 83% |
| Pro | 500GB | $19/mo | $7.68 | 60% |
| Studio | 2TB | $49/mo | $30.72 | 37% |
| Business | 5TB | $99/mo | $76.80 | 22% |
| Enterprise | 15TB | $249/mo | $230.40 | 7% |

### High-Volume Add-Ons (10TB+)

For users exceeding 15TB:
| Add-On | Price | Your Cost |
|--------|-------|-----------|
| +10TB | $150/mo | $153.60 |
| +20TB | $280/mo | $307.20 |
| +50TB | $650/mo | $768.00 |

**Hard caps, no surprise bills:**
- Users cannot upload beyond their limit
- Clear upgrade prompts when approaching limit
- Usage dashboard always visible

---

## Cost Analysis

### Your Current Dropbox Cost
- **$72/month for 9TB** = ~$8/TB/month
- This is consumer pricing that Dropbox subsidizes - they lose money on heavy users

### Cloudflare R2 Costs (What You'd Pay)

| Storage Type | Cost per TB/month | 9TB Cost |
|--------------|-------------------|----------|
| Standard | $15.36 | $138/month |
| Infrequent Access | $10.24 | $92/month |
| **Egress (downloads)** | **FREE** | **$0** |

### Why R2 is Still a Win for Your Business

1. **Zero Egress Fees** - When clients download 50GB galleries, you pay nothing
2. **AWS S3 comparison**: S3 charges $0.09/GB egress. A 50GB gallery download = $4.50 per client
3. **Programmable** - R2 integrates with your app; Dropbox doesn't
4. **Scalable** - Pay only for what each customer uses

---

## Pricing Strategy Recommendations

### Option A: Storage Tiers (Recommended)

| Tier | Storage | Your Cost | Suggested Price | Margin |
|------|---------|-----------|-----------------|--------|
| Starter (included) | 50GB | $0.77 | Free | - |
| Pro | 500GB | $7.68 | $15/mo | ~$7 |
| Studio | 2TB | $30.72 | $49/mo | ~$18 |
| Enterprise | 10TB | $153.60 | $199/mo | ~$45 |

### Option B: Per-Project Pricing

- Include 5GB per gallery free
- Charge $2-5/month per 50GB over limit
- Auto-archive galleries older than 1 year to Infrequent Access (saves 35%)

### Option C: Pooled Storage Credits

- Sell "storage credits" in bulk
- 1 credit = 1GB-month
- Bundle discounts: 1000 credits for $20 (you pay ~$15)

---

## Key Insight: Most Users Won't Hit Limits

Like gym memberships, you can oversell because:
- Average photographer: 10-30 active projects
- Average project: 50-100 photos (2-5GB)
- **Typical active storage**: 100-500GB, not 9TB

Your heavy users subsidize light users, and you profit on the average.

---

## What You Already Have (Current Architecture)

Your codebase at [src/lib/storage/r2.ts](src/lib/storage/r2.ts) already includes:

- Cloudflare R2 integration with presigned URLs
- Direct browser uploads (saves server bandwidth)
- Resumable upload queue with retry logic
- Asset database with full metadata tracking
- Download tracking and analytics
- Gallery-based file organization

**You're 80% of the way there.**

---

## What Needs to Be Built

### 1. File Browser UI
- Hierarchical folder/file view (like Finder/Explorer)
- Drag-and-drop organization
- Bulk operations (move, copy, delete)
- Search and filter

### 2. Storage Quota System
- Track per-organization storage usage
- Soft/hard limits with notifications
- Usage dashboard for users
- Admin override capabilities

### 3. Storage Lifecycle Management
- Auto-archive old projects to Infrequent Access
- Retention policies (delete after X years)
- Storage analytics and recommendations

### 4. Billing Integration
- Storage tier selection in subscription
- Overage billing (if using Option B)
- Usage reports

### 5. Database Schema Updates
- Add `storageUsedBytes` to Organization
- Add `storageLimitBytes` and `storageTier`
- Add `archivedAt` and `storageClass` to Asset

---

## Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                  Client Browser                  │
├─────────────────────────────────────────────────┤
│  File Browser UI  │  Upload Queue  │  Downloads  │
└────────┬──────────┴───────┬────────┴──────┬─────┘
         │                  │               │
         ▼                  ▼               ▼
┌─────────────────────────────────────────────────┐
│              Next.js API Routes                  │
├─────────────────────────────────────────────────┤
│ /api/files/*  │ /api/upload/*  │ /api/storage/* │
└────────┬──────┴───────┬────────┴───────┬────────┘
         │              │                │
         ▼              ▼                ▼
┌─────────────────────────────────────────────────┐
│         Cloudflare R2 (Object Storage)          │
├─────────────────────────────────────────────────┤
│   Standard Class   │   Infrequent Access Class  │
│   (Active files)   │   (Archived files)         │
└─────────────────────────────────────────────────┘
```

---

## Comparison: Build vs Buy

| Factor | Build (R2) | Buy (Dropbox API) |
|--------|-----------|-------------------|
| Monthly cost (9TB) | ~$138 | ~$72* |
| Egress fees | FREE | Included* |
| API integration | Native | Limited |
| Branding | 100% yours | Dropbox branded |
| Scalability | Pay-as-you-go | Fixed tiers |
| Revenue potential | High | None |

*Dropbox doesn't allow reselling storage to your customers

---

## Pricing Model Comparison: Tiers vs Usage-Based

### Model A: Storage Tiers (Simple, Predictable)

**How it works:** Customers choose a storage plan. Overage triggers upgrade prompts.

| Tier | Storage | Your Cost | Price | Margin | Margin % |
|------|---------|-----------|-------|--------|----------|
| Included | 25GB | $0.38 | Free | -$0.38 | - |
| Starter | 100GB | $1.54 | $9/mo | $7.46 | 83% |
| Pro | 500GB | $7.68 | $19/mo | $11.32 | 60% |
| Studio | 2TB | $30.72 | $49/mo | $18.28 | 37% |
| Business | 5TB | $76.80 | $99/mo | $22.20 | 22% |
| Enterprise | 15TB | $230.40 | $249/mo | $18.60 | 7% |

**Revenue projection (100 customers):**

| Scenario | Distribution | Monthly Revenue | Your Cost | Profit |
|----------|--------------|-----------------|-----------|--------|
| Conservative | 60 free, 25 Starter, 10 Pro, 4 Studio, 1 Business | $620 | $127 | $493 |
| Moderate | 40 free, 30 Starter, 20 Pro, 7 Studio, 3 Business | $1,190 | $258 | $932 |
| Aggressive | 20 free, 35 Starter, 30 Pro, 10 Studio, 5 Business | $1,780 | $425 | $1,355 |

---

### Model B: Usage-Based (Pay Per GB)

**How it works:** Track actual storage, bill monthly. More complex but fairer.

| Usage | Your Cost | Price | Margin |
|-------|-----------|-------|--------|
| Per GB/month | $0.015 | $0.05 | $0.035 (70%) |
| Per 100GB/month | $1.54 | $5.00 | $3.46 (70%) |
| Per TB/month | $15.36 | $50.00 | $34.64 (70%) |

**Revenue projection (100 customers):**

Assuming average storage of 150GB per customer:

| Metric | Value |
|--------|-------|
| Total storage | 15TB |
| Your R2 cost | $230/month |
| Revenue at $0.05/GB | $750/month |
| **Monthly profit** | **$520** |

**Pros:** Fair pricing, no wasted allocation
**Cons:** Unpredictable bills scare customers, complex billing

---

### Model C: Hybrid (Recommended)

**How it works:** Base allocation included, usage-based overage.

| Plan Tier | Included Storage | Overage Rate |
|-----------|------------------|--------------|
| Free | 10GB | Not allowed |
| Starter ($29/mo) | 100GB | $0.05/GB |
| Pro ($79/mo) | 1TB | $0.04/GB |
| Business ($149/mo) | 5TB | $0.03/GB |

**Why hybrid wins:**
1. Predictable base cost for customers
2. Revenue upside on heavy users
3. Light users feel they're getting value
4. Heavy users pay their fair share

---

### Real-World Cost Scenarios

**Scenario: Small photographer (Part-time)**
- 10 active galleries, 5GB each = 50GB
- Your cost: $0.77/month
- They pay: Free tier or $9/month
- Verdict: Easy profit

**Scenario: Full-time professional**
- 50 active galleries, 8GB each = 400GB
- Your cost: $6.14/month
- They pay: $19/month (Pro tier)
- Verdict: ~$13 profit/month

**Scenario: Multi-photographer studio**
- 200 active galleries, 10GB each = 2TB
- Your cost: $30.72/month
- They pay: $49/month (Studio tier)
- Verdict: ~$18 profit/month

**Scenario: High-volume operation**
- 500 galleries, 15GB each = 7.5TB
- Your cost: $115/month
- They pay: $99/month (Business) + overage OR $249 Enterprise
- Verdict: Need to price carefully at scale

---

### Break-Even Analysis

| Storage | Your Cost | Break-even Price |
|---------|-----------|------------------|
| 100GB | $1.54 | $2/month |
| 500GB | $7.68 | $8/month |
| 1TB | $15.36 | $16/month |
| 5TB | $76.80 | $77/month |
| 10TB | $153.60 | $154/month |

**Rule of thumb:** Charge 2-3x your cost for healthy margins

---

## Implementation Phases

### Phase 1: Foundation
**Storage Tracking & Quotas**
- Add storage usage tracking to Organization model
- Build usage dashboard component with visual progress bar
- Add storage tier selection to subscription settings
- Implement hard cap enforcement (block uploads at limit)
- Create upgrade prompts and flows

### Phase 2: Visual File Browser
**Smart Folder UI**
- Create visual folder grid component (thumbnail cards, not file list)
- Add folder "clip" icon overlay on gallery thumbnails
- Gallery auto-save checkbox on gallery creation form
- Virtual folder support in database
- Drag-and-drop reorganization

### Phase 3: Smart Organization
**Configurable Structure**
- Storage Settings page for organization preferences
- Organization method selector (by date, client, location, etc.)
- Multi-level sorting configuration
- Auto-folder creation based on gallery metadata
- Retention period settings per folder/gallery

### Phase 4: Dropbox Integration
**Sync & Import/Export**
- OAuth flow for Dropbox connection
- View Dropbox files within PhotoProOS
- Auto-export galleries to Dropbox toggle
- Import Dropbox folders as galleries
- Two-way sync option

### Phase 5: AI Features
**Smart Search & Categorization**
- Image classification API integration (kitchen, exterior, twilight, etc.)
- Natural language search
- Auto-tagging on upload
- "Best shots" identification per category
- Marketing recommendations engine

### Phase 6: Map View
**Location-Based Browsing**
- Interactive map component
- GPS extraction from EXIF data
- Manual address entry fallback
- Cluster markers for dense areas
- Filter by date range, type, client

### Phase 7: Storage Optimization
**Cache Mode**
- Per-folder optimization toggle
- Infrequent Access class migration for old galleries
- Thumbnail-only mode with on-demand original fetch
- "Wake up" folder functionality
- Automated archival cron job

### Phase 8: Marketing Module Integration
**Cross-Module Connections (Phase 2 Synergy)**

#### Social Media Management Integration
- **Image Picker**: Browse storage directly from post composer
- **AI Suggestions**: "These twilight shots would perform well on Instagram"
- **Bulk Scheduling**: Select multiple images, create content calendar
- **Performance Tracking**: Which stored images get most engagement
- **Auto-categorize by Platform**: "Best for Instagram" vs "Best for LinkedIn"

#### Email Marketing Integration
- **Hero Image Selector**: Choose from storage for email headers
- **Gallery Embeds**: Insert gallery previews in newsletters
- **Client Highlights**: Auto-suggest recent work for client updates
- **Template Library**: Store email image assets in dedicated folder

#### Content Marketing Integration
- **Portfolio Builder**: Pull galleries into website/blog
- **Case Study Assets**: Organize before/after, process shots
- **SEO Image Library**: Tagged images ready for blog posts
- **Testimonial Pairing**: Link client photos with their reviews

#### AI-Powered Recommendations Engine
- Analyzes stored images for quality, composition, style
- Recommends best shots for each marketing channel
- Learns from engagement data which images perform best
- Suggests content themes: "You have 12 great kitchen shots - perfect for a 'Kitchen Design' series"

---

## Database Schema Updates Required

```prisma
// Organization additions
model Organization {
  // ... existing fields
  storageUsedBytes    BigInt    @default(0)
  storageLimitBytes   BigInt    @default(26843545600) // 25GB default
  storageTier         StorageTier @default(FREE)
  storageSettings     Json?     // Organization preferences
}

enum StorageTier {
  FREE        // 25GB
  STARTER     // 100GB
  PRO         // 500GB
  STUDIO      // 2TB
  BUSINESS    // 5TB
  ENTERPRISE  // 15TB
  CUSTOM      // Custom limit
}

// New Folder model
model StorageFolder {
  id              String   @id @default(cuid())
  organizationId  String
  parentId        String?  // For nested folders
  name            String
  thumbnailUrl    String?  // First gallery image
  galleryId       String?  // Link to gallery if auto-created
  retentionDays   Int?     // How long to keep
  optimizeStorage Boolean  @default(false) // Cache mode
  createdAt       DateTime @default(now())

  organization    Organization @relation(fields: [organizationId], references: [id])
  parent          StorageFolder? @relation("FolderTree", fields: [parentId], references: [id])
  children        StorageFolder[] @relation("FolderTree")
  assets          Asset[]
}

// Asset additions
model Asset {
  // ... existing fields
  folderId        String?
  storageClass    StorageClass @default(STANDARD)
  aiTags          String[]     // Auto-generated tags
  archivedAt      DateTime?

  folder          StorageFolder? @relation(fields: [folderId], references: [id])
}

enum StorageClass {
  STANDARD
  INFREQUENT_ACCESS
}

// Dropbox integration
model DropboxConnection {
  id              String   @id @default(cuid())
  organizationId  String   @unique
  accessToken     String
  refreshToken    String
  accountId       String
  email           String
  autoSync        Boolean  @default(false)
  syncFolderId    String?  // Root Dropbox folder for sync
  lastSyncAt      DateTime?

  organization    Organization @relation(fields: [organizationId], references: [id])
}
```

---

## Key Files to Modify/Create

**New Files:**
- `src/app/(dashboard)/storage/page.tsx` - Main storage browser
- `src/app/(dashboard)/storage/settings/page.tsx` - Storage settings
- `src/components/storage/folder-grid.tsx` - Visual folder cards
- `src/components/storage/storage-usage.tsx` - Usage dashboard
- `src/components/storage/map-view.tsx` - Location browser
- `src/lib/storage/quota.ts` - Quota enforcement logic
- `src/lib/storage/dropbox.ts` - Dropbox API integration
- `src/lib/ai/image-classification.ts` - AI tagging service

**Modified Files:**
- `prisma/schema.prisma` - Schema updates above
- `src/app/(dashboard)/galleries/[id]/gallery-detail-client.tsx` - Add save-to-storage checkbox
- `src/lib/storage/r2.ts` - Add Infrequent Access class support
- `src/lib/actions/uploads.ts` - Add folder assignment, quota checks

---

## Bottom Line

**Yes, build this.** Here's why:

1. **You already have 80% of the infrastructure** - R2 is working
2. **Zero egress = predictable costs** - Downloads don't hurt you
3. **Recurring revenue opportunity** - Storage is sticky, hard to churn
4. **Competitive advantage** - Photographers hate juggling Dropbox + their software
5. **AI features differentiate** - Smart categorization is a real value-add
6. **Future-proof** - Sets up marketing module integration

**Recommended launch order:**
1. Start with Phases 1-2 (quotas + visual browser) - immediate value
2. Add Phase 4 (Dropbox) - removes objection for existing Dropbox users
3. Layer in AI features (Phase 5) - differentiation
4. Map view and optimization (Phases 6-7) - polish

---

## Quick Reference Card

### Pricing Tiers (At a Glance)
| Tier | Storage | Price | Margin |
|------|---------|-------|--------|
| Free | 25GB | $0 | - |
| Starter | 100GB | $9/mo | 83% |
| Pro | 500GB | $19/mo | 60% |
| Studio | 2TB | $49/mo | 37% |
| Business | 5TB | $99/mo | 22% |
| Enterprise | 15TB | $249/mo | 7% |

### Key Costs to Remember
- R2 Storage: **$15.36/TB/month**
- R2 Infrequent Access: **$10.24/TB/month** (33% savings)
- R2 Egress: **FREE**
- Break-even: Charge **2-3x** your cost

### Core Features Checklist
- [ ] Dual storage (PhotoProOS + Dropbox connect)
- [ ] Visual folder grid with thumbnail covers
- [ ] Gallery auto-save checkbox
- [ ] Smart organization (date, client, location, style)
- [ ] Map view for location browsing
- [ ] AI categorization (kitchen, exterior, twilight, etc.)
- [ ] Smart search (natural language)
- [ ] Cache mode (thumbnails only, fetch originals on demand)
- [ ] Dropbox two-way sync
- [ ] Hard caps (no overage surprises)
- [ ] Marketing module integration

### Phase 2 Module Dependencies
```
Smart File Storage (Foundation)
       │
       ├── Social Media Management
       │       └── Image picker, AI suggestions, scheduling
       │
       ├── Email Marketing
       │       └── Hero images, gallery embeds, templates
       │
       └── Content Marketing
               └── Portfolio, case studies, SEO library
```

### Existing Infrastructure (Already Built)
- `src/lib/storage/r2.ts` - R2 client, presigned URLs
- `src/lib/storage/upload-queue.ts` - Resumable uploads
- `src/lib/actions/uploads.ts` - Server actions
- `src/app/api/upload/` - Upload API routes
- `src/app/api/download/` - Download API routes

---

## Sources

- [Cloudflare R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [Cloudflare R2 vs AWS S3 Comparison](https://www.cloudflare.com/pg-cloudflare-r2-vs-aws-s3/)
- [Dropbox Business Plans](https://www.dropbox.com/business/plans-comparison)
- [Dropbox API Documentation](https://www.dropbox.com/developers/documentation)

---

## Complete Roadmap: All Feature Specifications

> This section documents all planned features across all phases, providing detailed specs for future implementation.

---

### Phase 3: Marketing Hub Features

#### AI Content Repurposing

**Purpose:** Transform one gallery into multiple content pieces automatically.

**How it works:**
1. AI analyzes uploaded gallery for composition, lighting, subject matter
2. Identifies "hero shots" worthy of featuring
3. Generates multiple content formats:
   - Instagram square crops with optimal framing
   - Story/Reel vertical formats
   - LinkedIn horizontal professional shots
   - Pinterest tall pins
   - Email header hero images
   - Website slider images

**Technical approach:**
- Use computer vision APIs (Google Vision, AWS Rekognition, or OpenAI GPT-4V)
- Smart cropping based on subject detection
- Batch processing for entire galleries
- Output queue for social scheduling

**Database additions:**
```prisma
model ContentPiece {
  id              String   @id @default(cuid())
  organizationId  String
  sourceAssetId   String   // Original image
  format          ContentFormat // instagram_square, story, linkedin, etc.
  croppedUrl      String
  caption         String?
  hashtags        String[]
  platform        String
  status          ContentStatus @default(draft)
  scheduledFor    DateTime?
  publishedAt     DateTime?

  organization    Organization @relation(fields: [organizationId], references: [id])
  sourceAsset     Asset @relation(fields: [sourceAssetId], references: [id])
}

enum ContentFormat {
  instagram_square
  instagram_story
  instagram_reel
  facebook_post
  linkedin_post
  pinterest_pin
  email_header
  website_hero
}
```

---

#### Social Media Scheduler

**Purpose:** Schedule and publish posts across platforms from one dashboard.

**Supported platforms:**
- Instagram (via Business/Creator API)
- Facebook (via Graph API)
- LinkedIn (via Marketing API)
- Pinterest (via API)
- TikTok (future - via Creator API)

**Features:**
- Calendar view of scheduled content
- Drag-and-drop rescheduling
- Optimal timing suggestions based on audience analytics
- Cross-posting with platform-specific adjustments
- Content queue with approval workflow
- Analytics dashboard per platform

**Integration requirements:**
- OAuth connections for each platform
- Meta Business Suite for Instagram/Facebook
- LinkedIn Company Page access
- Pinterest Business Account

**Database additions:**
```prisma
model SocialConnection {
  id              String   @id @default(cuid())
  organizationId  String
  platform        SocialPlatform
  accountId       String
  accountName     String
  accessToken     String   @db.Text
  refreshToken    String?  @db.Text
  tokenExpiry     DateTime?
  isActive        Boolean  @default(true)

  organization    Organization @relation(fields: [organizationId], references: [id])
  posts           ScheduledPost[]
}

model ScheduledPost {
  id              String   @id @default(cuid())
  organizationId  String
  connectionId    String
  contentPieceId  String?
  caption         String   @db.Text
  hashtags        String[]
  mediaUrls       String[]
  scheduledFor    DateTime
  status          PostStatus @default(scheduled)
  publishedAt     DateTime?
  platformPostId  String?  // ID returned after publishing
  errorMessage    String?
  analytics       Json?    // Engagement metrics

  connection      SocialConnection @relation(fields: [connectionId], references: [id])
}
```

---

#### Email Campaigns

**Purpose:** Send newsletters, nurture sequences, and promotional campaigns.

**Features:**
- Visual email builder with drag-and-drop
- Pre-built templates for photographers
- Gallery embeds with image carousels
- Client segmentation (by industry, spend, engagement)
- Automation triggers:
  - New gallery delivered → send thank you
  - Invoice paid → request testimonial
  - 1 year since last booking → re-engagement
- A/B testing for subject lines
- Open/click tracking
- Unsubscribe management

**Integration approach:**
- Build on existing Resend integration
- Or integrate with Mailchimp/Klaviyo for advanced features

**Database additions:**
```prisma
model EmailCampaign {
  id              String   @id @default(cuid())
  organizationId  String
  name            String
  subject         String
  previewText     String?
  htmlContent     String   @db.Text
  plainText       String   @db.Text
  status          CampaignStatus @default(draft)
  segmentRules    Json?    // Client filter criteria
  scheduledFor    DateTime?
  sentAt          DateTime?

  organization    Organization @relation(fields: [organizationId], references: [id])
  recipients      EmailRecipient[]
}

model EmailRecipient {
  id              String   @id @default(cuid())
  campaignId      String
  email           String
  clientId        String?
  sentAt          DateTime?
  openedAt        DateTime?
  clickedAt       DateTime?
  unsubscribedAt  DateTime?

  campaign        EmailCampaign @relation(fields: [campaignId], references: [id])
}

model EmailAutomation {
  id              String   @id @default(cuid())
  organizationId  String
  name            String
  trigger         AutomationTrigger
  delayMinutes    Int      @default(0)
  emailTemplateId String
  isActive        Boolean  @default(true)
}
```

---

#### AI Caption Generator

**Purpose:** Generate engaging, platform-specific captions.

**How it works:**
1. Analyze image content (room type, style, features)
2. Consider platform best practices:
   - Instagram: More casual, emoji-friendly, hashtag-heavy
   - LinkedIn: Professional, insight-driven
   - Pinterest: Keyword-rich for search
3. Generate multiple caption options
4. Suggest relevant hashtags
5. Customize tone (professional, friendly, luxurious)

**Prompt engineering examples:**
```
You are a social media expert for a real estate photographer.
Image analysis: [Twilight exterior, luxury home, modern design]
Platform: Instagram
Tone: Luxurious but approachable

Generate 3 caption options with relevant hashtags.
```

**API integration:**
- Use OpenAI GPT-4 or Claude for caption generation
- Vision API for image understanding
- Hashtag research via social analytics APIs

---

#### Testimonial Automation

**Purpose:** Automate collecting and showcasing client testimonials.

**Workflow:**
1. **Trigger**: Invoice marked paid OR 3 days after gallery delivery
2. **Request**: Automated email asking for feedback
3. **Collection**: Simple rating + text form
4. **Review**: Admin approval before publishing
5. **Display**: Automatically add to website/portfolio
6. **Cross-post**: Option to share on social media

**Integration opportunities:**
- Google Business Profile review link
- Yelp review link
- Facebook recommendations
- Create shareable graphics with testimonial quotes

**Database additions:**
```prisma
model TestimonialRequest {
  id              String   @id @default(cuid())
  organizationId  String
  clientId        String
  projectId       String?
  sentAt          DateTime @default(now())
  reminderSentAt  DateTime?
  responseId      String?  @unique

  client          Client @relation(fields: [clientId], references: [id])
  response        Testimonial? @relation(fields: [responseId], references: [id])
}

model Testimonial {
  id              String   @id @default(cuid())
  organizationId  String
  clientId        String
  projectId       String?
  rating          Int      // 1-5 stars
  text            String   @db.Text
  isApproved      Boolean  @default(false)
  isPublic        Boolean  @default(false)
  featuredOnSite  Boolean  @default(false)
  sharedToSocial  Boolean  @default(false)
  submittedAt     DateTime @default(now())

  client          Client @relation(fields: [clientId], references: [id])
}
```

---

#### Brand Kit & Templates

**Purpose:** Centralize brand assets for consistent marketing.

**Features:**
- **Brand Assets Storage:**
  - Primary/secondary logos (light/dark versions)
  - Color palette with hex codes
  - Font selections
  - Brand patterns/textures

- **Template Library:**
  - Email templates
  - Social media post templates
  - Invoice/contract headers
  - Presentation templates
  - Watermark presets

- **Auto-application:**
  - Apply brand colors to email templates
  - Auto-watermark uploaded images
  - Consistent styling across all outputs

**Database additions:**
```prisma
model BrandKit {
  id              String   @id @default(cuid())
  organizationId  String   @unique

  // Colors
  primaryColor    String   @default("#3b82f6")
  secondaryColor  String?
  accentColor     String?

  // Typography
  headingFont     String   @default("Inter")
  bodyFont        String   @default("Inter")

  // Logos
  lightLogoUrl    String?
  darkLogoUrl     String?
  iconUrl         String?

  // Watermark
  watermarkUrl    String?
  watermarkOpacity Float   @default(0.3)
  watermarkPosition String @default("bottom-right")

  organization    Organization @relation(fields: [organizationId], references: [id])
}
```

---

### Phase 4: AI Studio Features

#### AI Virtual Staging

**Purpose:** Transform empty rooms into staged spaces.

**How it works:**
1. Upload empty room photo
2. Select style preset:
   - Modern minimalist
   - Traditional/classic
   - Scandinavian
   - Mid-century modern
   - Luxury contemporary
3. AI generates staged version
4. Multiple variations provided
5. High-resolution output for MLS

**Technical approach:**
- Integration with virtual staging APIs (Apply Design, BoxBrownie API)
- Or custom Stable Diffusion model fine-tuned for real estate
- Quality validation before delivery
- Version history for comparisons

**Pricing consideration:**
- Per-image credits model
- Bulk staging packages
- Included in higher subscription tiers

---

#### AI Booking Chatbot

**Purpose:** 24/7 client interaction for quotes and booking.

**Capabilities:**
- Answer FAQs about services and pricing
- Provide instant quotes based on property type/location
- Check calendar availability
- Book appointments directly
- Collect lead information
- Hand off to human when needed

**Training data:**
- Service descriptions and pricing
- FAQs from past client conversations
- Geographic service area
- Calendar availability

**Technical approach:**
- Fine-tuned LLM with business context
- Integration with calendar system
- Twilio for SMS booking confirmations
- Lead scoring based on conversation intent

**Database additions:**
```prisma
model ChatbotConversation {
  id              String   @id @default(cuid())
  organizationId  String
  visitorEmail    String?
  visitorPhone    String?
  leadId          String?
  messages        Json[]   // Array of message objects
  intent          String?  // booking, pricing, info, support
  leadScore       Int?
  handedOff       Boolean  @default(false)
  convertedAt     DateTime?
  createdAt       DateTime @default(now())

  lead            Lead? @relation(fields: [leadId], references: [id])
}
```

---

#### Property Description AI

**Purpose:** Generate MLS-ready property descriptions from photos.

**How it works:**
1. Analyze property photos with vision AI
2. Identify key features:
   - Room types and counts
   - Architectural style
   - Notable features (fireplace, pool, views)
   - Condition indicators
3. Generate compelling description
4. Output in multiple lengths (tweet, paragraph, full listing)

**Output formats:**
- Short (280 characters for social)
- Medium (100 words for previews)
- Full MLS description (250+ words)
- Key features bullet list

---

#### Twilight Converter

**Purpose:** Transform daytime exteriors into twilight shots.

**How it works:**
1. Upload daytime exterior photo
2. AI replaces sky with twilight gradient
3. Adjust lighting to match twilight ambiance
4. Add warm interior window glow
5. Balance exposure for realistic result

**Technical approach:**
- Sky segmentation using semantic segmentation models
- Sky replacement with HDR twilight skies
- Color grading adjustments
- Window light enhancement
- Quality assurance checks

---

#### Smart Lead Scoring

**Purpose:** Prioritize leads most likely to convert.

**Scoring factors:**
- Source (referral > organic > paid)
- Property type (commercial > residential)
- Timeline urgency
- Budget indicators
- Past interaction engagement
- Geographic location
- Repeat vs. new client

**Score output:**
- Hot (90-100): Immediate follow-up
- Warm (70-89): Follow up within 24 hours
- Cool (50-69): Nurture sequence
- Cold (<50): Low priority

**Machine learning approach:**
- Train on historical conversion data
- Continuously improve based on outcomes
- A/B test scoring models

---

#### AI Email Composer

**Purpose:** Draft personalized emails with AI assistance.

**Features:**
- Suggest responses to client emails
- Generate follow-up messages
- Create proposal emails
- Draft re-engagement messages for dormant clients
- Adjust tone (formal/casual/friendly)
- Multi-language support

**Context awareness:**
- Client history and preferences
- Recent interactions
- Outstanding invoices/projects
- Booking patterns

---

#### MLS Auto-Formatter

**Purpose:** Ensure photos meet MLS requirements.

**Automatic checks:**
- Resolution requirements (varies by MLS)
- Aspect ratio compliance
- File size limits
- Orientation detection
- Order optimization (exterior first, etc.)

**Auto-corrections:**
- Resize to exact dimensions
- Compress without quality loss
- Rotate if needed
- Rename files for MLS ordering

**MLS database:**
- Store requirements for major MLS systems
- Allow custom requirement profiles
- Batch processing for entire galleries

---

### Phase 5: Analytics & Intelligence Features

#### Revenue Forecasting

**Purpose:** Predict future revenue for business planning.

**Methodology:**
- Analyze historical booking patterns
- Account for seasonality (spring/summer peaks)
- Factor in pipeline (pending quotes, repeat clients)
- Identify trends (growing/declining)

**Outputs:**
- 30/60/90 day revenue forecasts
- Confidence intervals
- Comparison to previous periods
- Cash flow projections

**Dashboard components:**
- Forecast chart with confidence bands
- Pipeline value breakdown
- Seasonal trend indicators
- Suggested actions for slow periods

---

#### Client Lifetime Value (CLV)

**Purpose:** Identify most valuable client relationships.

**Calculation factors:**
- Total revenue from client
- Booking frequency
- Average project value
- Referrals generated
- Tenure as client
- Growth trajectory

**Segments:**
- VIP Clients (top 10%)
- Regulars (consistent bookings)
- Occasional (yearly or less)
- At-Risk (declining engagement)
- Lost (no booking in 18+ months)

**Actions:**
- VIP: Special perks, priority scheduling
- At-Risk: Re-engagement campaign
- Lost: Win-back offers

---

#### Smart Workflow Builder

**Purpose:** Create custom automations with conditional logic.

**Building blocks:**
- **Triggers**: Events that start the workflow
- **Conditions**: If/then branching
- **Actions**: What to do
- **Delays**: Wait periods

**Example workflows:**
```
Trigger: New booking confirmed
├── Wait 1 hour
├── Send booking confirmation email
├── If property type = real estate
│   └── Create property website
├── Wait until shoot date
├── Send day-before reminder
└── After shoot complete
    ├── Generate gallery
    └── Send delivery notification
```

**Visual builder:**
- Drag-and-drop interface
- Pre-built workflow templates
- Test mode for debugging
- Analytics on workflow performance

---

#### Competitor Insights

**Purpose:** Understand market positioning and opportunities.

**Data sources:**
- Public pricing information
- Social media presence
- Google Business profiles
- Review sentiment analysis

**Insights provided:**
- Pricing comparison by service type
- Service offering gaps
- Geographic coverage comparison
- Marketing channel analysis
- Review sentiment benchmarking

**Limitations:**
- Only publicly available data
- Aggregate, not individual stalking
- Focus on market trends, not specific competitors

---

#### AI Questionnaire Builder

**Purpose:** Smart questionnaire creation based on context.

**How it works:**
1. Select photography niche (real estate, portrait, wedding, etc.)
2. AI suggests relevant questions
3. Customize and reorder
4. Conditional logic for follow-ups
5. Smart defaults based on industry

**Question library by niche:**
- Real estate: Property details, staging, timing, MLS info
- Wedding: Venue, timeline, bridal party, must-have shots
- Portrait: Purpose, style preferences, wardrobe
- Commercial: Brand guidelines, usage rights, deliverables

---

#### Contract AI

**Purpose:** Intelligent contract creation and analysis.

**Features:**
- Generate contracts from templates + context
- Suggest clauses based on project type
- Identify risky language in client contracts
- Explain legal terms in plain language
- Track key dates and obligations

**Smart suggestions:**
- "For real estate work, consider adding MLS usage rights"
- "Wedding contracts should include backup photographer clause"
- "This cancellation policy may be too lenient for your market"

---

### Phase 6: Website Builder Features

#### Portfolio Builder

**Purpose:** Create a professional portfolio website.

**Features:**
- Template selection (10+ designs)
- Gallery showcase pages
- About/bio page
- Services & pricing
- Contact form with lead capture
- Blog section
- Mobile-responsive
- SEO-optimized

**Technical approach:**
- Next.js static site generation
- Hosted on PhotoProOS subdomain or custom domain
- CDN delivery for fast loading
- Template customization via visual editor

---

#### AI Blog Writer

**Purpose:** Generate SEO-optimized blog content.

**Content types:**
- Behind-the-scenes project stories
- Photography tips and techniques
- Industry insights
- Local market updates (for real estate)
- Client success stories

**Workflow:**
1. Select content type
2. Provide project/topic context
3. AI generates draft
4. Edit and approve
5. Schedule publication
6. Auto-share to social

**SEO features:**
- Keyword optimization
- Meta descriptions
- Internal linking suggestions
- Image alt text generation

---

#### SEO Tools

**Purpose:** Optimize website for search visibility.

**Features:**
- Keyword tracking (local + service terms)
- On-page SEO analysis
- Technical SEO checks
- Competitor keyword analysis
- Local SEO optimization
- Google Business Profile integration
- Review generation prompts

**Dashboard:**
- Keyword rankings over time
- Traffic from search
- Top-performing pages
- Improvement suggestions

---

#### Custom Domains

**Purpose:** Use your own domain for professional branding.

**Features:**
- Custom domain connection (DNS configuration)
- Automatic SSL certificates
- Email forwarding setup
- Subdomain options
- Domain purchase integration (optional)

**Technical approach:**
- Cloudflare for DNS/SSL
- Automatic certificate provisioning
- Email routing via Resend or Mailgun

---

#### Lead Magnet Generator

**Purpose:** Create downloadable resources to capture leads.

**Content types:**
- Pricing guides
- Preparation checklists
- Style guides
- "What to expect" PDFs
- Portfolio samples

**Workflow:**
1. Select template
2. Customize content with brand kit
3. Set up landing page
4. Configure email capture form
5. Automated delivery

**Lead nurture:**
- Captured emails enter nurture sequence
- Personalized follow-up based on magnet downloaded
- Track engagement and conversion

---

### Phase 7: Community & Marketplace Features

#### Photographer Marketplace

**Purpose:** Connect photographers for overflow and collaboration.

**Listing types:**
- Second shooter availability
- Associate photographer referrals
- Overflow work assignments
- Specialty referrals (drone, video, etc.)

**Features:**
- Photographer profiles with portfolios
- Availability calendar
- Rate information
- Review/rating system
- Direct messaging
- Commission tracking

**Revenue model:**
- Free to list availability
- Transaction fee on booked work
- Premium listings for visibility

---

#### Vendor Network

**Purpose:** Connect with complementary service providers.

**Vendor categories:**
- Home stagers
- Real estate agents
- Interior designers
- Builders/contractors
- Home inspectors
- Moving companies

**Referral tracking:**
- Unique referral links
- Commission calculation
- Payment processing
- Relationship analytics

**Features:**
- Vendor profiles
- Mutual rating system
- Referral leaderboards
- Partnership agreements

---

#### Education Hub

**Purpose:** Learn and grow photography/business skills.

**Content types:**
- Video courses
- Tutorials
- Webinars
- Business templates
- Presets and LUTs
- Pricing calculators

**Sources:**
- PhotoProOS original content
- Community contributions
- Expert partnerships
- User-generated tutorials

**Gamification:**
- Course completion badges
- Skill certifications
- XP for learning
- Leaderboard rankings

---

#### Referral Tracking

**Purpose:** Track and reward referrals.

**Types:**
- Client referrals (client → client)
- Photographer referrals (colleague → work)
- Vendor referrals (agent → photographer)

**Features:**
- Unique referral codes/links
- Automatic tracking
- Commission calculation
- Payment automation
- Performance analytics

**Reward options:**
- Cash commissions
- Account credits
- Tiered rewards (more referrals = better rates)
- VIP status perks

---

## Roadmap Timeline Summary

| Phase | Name | Status | Key Features |
|-------|------|--------|--------------|
| 1 | Core Platform | Completed | Galleries, Payments, Clients, Scheduling, Projects, Contracts |
| 2 | Client Experience | In Progress | Property Websites, Client Portal, Questionnaires, Matterport, AI Sorting |
| 3 | Marketing Hub | Upcoming | Storage, Content Repurposing, Social Scheduler, Email, Captions, Testimonials, Brand Kit |
| 4 | AI Studio | Planned | Virtual Staging, Chatbot, Property Descriptions, Twilight, Lead Scoring, Email Composer, MLS Formatter |
| 5 | Analytics & Intelligence | Planned | Revenue Forecast, CLV, Workflow Builder, Competitor Insights, Questionnaire AI, Contract AI |
| 6 | Website Builder | Planned | Portfolio, Blog AI, SEO Tools, Custom Domains, Lead Magnets |
| 7 | Community & Marketplace | Planned | Photographer Marketplace, Vendor Network, Education Hub, Referral Tracking |

---

## Voting System Integration

All features are now available for community voting at `/roadmap`. Features can be:
- Voted on by authenticated users (unlimited)
- Voted on by verified community members (5 votes/day)
- Suggested by anyone (requires approval)

**Seed script location:** `prisma/seed-roadmap.ts`

---

*Last updated: January 2026*

**Document locations:**
- Primary: `~/.claude/plans/cached-sprouting-pine.md`
- Project: `PhotoProOS/docs/phase-2-storage-spec.md`
