# Dashboard Redesign & Walkthrough System

## Overview

This document outlines the comprehensive redesign of the PhotoProOS dashboard, including a new walkthrough/tutorial system that spans the entire application, customizable widget layouts, and an integrated Help & Support center.

## Table of Contents

1. [Goals & Objectives](#goals--objectives)
2. [Walkthrough Tutorial System](#walkthrough-tutorial-system)
3. [Dashboard Widget System](#dashboard-widget-system)
4. [Help & Support Center](#help--support-center)
5. [Settings Integration](#settings-integration)
6. [Database Schema](#database-schema)
7. [Implementation Phases](#implementation-phases)
8. [Component Architecture](#component-architecture)
9. [Widget Library](#widget-library)
10. [Industry-Based Defaults](#industry-based-defaults)

---

## Goals & Objectives

### Primary Goals
- **Improve User Onboarding**: Guide new users through each area of the application
- **Enhance Discoverability**: Help users discover features they may not know exist
- **Increase Customization**: Allow users to personalize their dashboard experience
- **Reduce Support Requests**: Provide self-service help directly within the application

### Success Metrics
- Reduced time to first gallery delivery
- Increased feature adoption rates
- Decreased support ticket volume
- Higher user satisfaction scores

---

## Walkthrough Tutorial System

### States

Each walkthrough can be in one of four states:

| State | Description | Recoverable? |
|-------|-------------|--------------|
| **Open** | Fully expanded, showing all content (default for new users) | N/A |
| **Minimized** | Collapsed to a small bar, click to expand | Yes |
| **Hidden** | Not visible, can be restored via Settings | Yes |
| **Dismissed** | Permanently removed after warning confirmation | No |

### State Transitions

```
┌─────────┐
│  Open   │ ←── Default state for new users
└────┬────┘
     │ Click minimize
     ▼
┌─────────────┐
│  Minimized  │ ←── Click to expand back to Open
└──────┬──────┘
       │ Click hide
       ▼
┌─────────────┐
│   Hidden    │ ←── Restore via Settings > Walkthroughs
└──────┬──────┘
       │ Click dismiss (with warning)
       ▼
┌─────────────┐
│  Dismissed  │ ←── Permanent, cannot be restored
└─────────────┘
```

### Walkthrough Component Structure

```tsx
<PageWalkthrough
  pageId="dashboard"
  title="Welcome to Your Dashboard"
  steps={[
    { title: "Quick Stats", description: "View your key metrics at a glance" },
    { title: "Recent Activity", description: "See your latest projects and payments" },
    { title: "Customize", description: "Drag and drop widgets to personalize" },
  ]}
  videoPlaceholder={true}
  videoUrl={null} // To be added later
/>
```

### Walkthrough Content by Page

| Page | Walkthrough ID | Key Topics |
|------|----------------|------------|
| Dashboard | `dashboard` | Overview, widgets, customization |
| Galleries | `galleries` | Creating, delivering, pricing |
| Gallery Detail | `gallery-detail` | Uploads, sharing, analytics |
| Clients | `clients` | Adding, managing, communication |
| Client Detail | `client-detail` | History, notes, projects |
| Invoices | `invoices` | Creating, sending, tracking |
| Invoice Detail | `invoice-detail` | Payments, reminders, exports |
| Contracts | `contracts` | Templates, sending, signatures |
| Calendar | `calendar` | Bookings, scheduling, sync |
| Settings | `settings` | Account, branding, integrations |
| Integrations | `integrations` | Connecting services |
| Team | `team` | Members, roles, permissions |
| Analytics | `analytics` | Reports, insights, exports |

### Dismiss Warning Modal

When a user clicks "Dismiss permanently":

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  Permanently Dismiss Tutorial?                  │
│                                                     │
│  This will permanently hide the tutorial for this   │
│  page. This action cannot be undone.                │
│                                                     │
│  If you just want to hide it temporarily, use the   │
│  "Hide" option instead - you can restore it later   │
│  from Settings > Walkthroughs.                      │
│                                                     │
│  [Cancel]                    [Dismiss Permanently]  │
└─────────────────────────────────────────────────────┘
```

---

## Dashboard Widget System

### Widget Architecture

Each widget is a self-contained component that can be:
- Added/removed from the dashboard
- Reordered via drag-and-drop
- Configured with widget-specific settings

### Widget Container Structure

```tsx
interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  description: string;
  icon: ComponentType;
  defaultSize: 'small' | 'medium' | 'large' | 'full';
  minSize?: 'small' | 'medium';
  configurable: boolean;
  config?: Record<string, unknown>;
}
```

### Drag-and-Drop Implementation

Using `@dnd-kit/core` for accessible drag-and-drop:

```tsx
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={widgetIds}>
    {widgets.map(widget => (
      <SortableWidget key={widget.id} widget={widget} />
    ))}
  </SortableContext>
</DndContext>
```

### Add Widget Panel

A slide-out panel or modal showing available widgets:

```
┌─────────────────────────────────────────────────────┐
│  Add Widget                                    [×]  │
├─────────────────────────────────────────────────────┤
│  Search widgets...                                  │
├─────────────────────────────────────────────────────┤
│  📊 Analytics                                       │
│  ├── Revenue Overview          [+ Add]              │
│  ├── Monthly Comparison        [+ Add]              │
│  └── Client Growth             [+ Add]              │
│                                                     │
│  📅 Scheduling                                      │
│  ├── Upcoming Bookings         [Added ✓]            │
│  ├── Calendar Preview          [+ Add]              │
│  └── Availability              [+ Add]              │
│                                                     │
│  💰 Financial                                       │
│  ├── Outstanding Invoices      [Added ✓]            │
│  ├── Revenue Goals             [+ Add]              │
│  └── Payment Activity          [+ Add]              │
│                                                     │
│  🎯 Productivity                                    │
│  ├── Quick Actions             [+ Add]              │
│  ├── To-Do List                [+ Add]              │
│  └── Deadlines                 [+ Add]              │
└─────────────────────────────────────────────────────┘
```

---

## Widget Library

### Core Widgets (Always Available)

| Widget | ID | Size | Description |
|--------|-----|------|-------------|
| Key Metrics | `key-metrics` | Full | Revenue, projects, clients overview |
| Recent Activity | `recent-activity` | Large | Timeline of recent actions |
| Quick Actions | `quick-actions` | Medium | Common action buttons |
| Upcoming Bookings | `upcoming-bookings` | Medium | Next scheduled shoots |
| Overdue Invoices | `overdue-invoices` | Medium | Invoices needing attention |
| Expiring Galleries | `expiring-galleries` | Medium | Galleries expiring soon |
| Onboarding Checklist | `onboarding-checklist` | Medium | Setup progress tracker |

### Extended Widgets

| Widget | ID | Size | Description |
|--------|-----|------|-------------|
| Referral Program | `referral-program` | Full | Referral stats and sharing |
| Revenue Goals | `revenue-goals` | Medium | Monthly/yearly targets |
| Calendar Preview | `calendar-preview` | Large | Mini calendar view |
| Weather Forecast | `weather-forecast` | Small | 3-day forecast for shoots |
| Client Birthdays | `client-birthdays` | Small | Upcoming client milestones |
| Recent Galleries | `recent-galleries` | Large | Latest gallery cards |
| Payment Activity | `payment-activity` | Medium | Recent payment feed |
| Contract Status | `contract-status` | Medium | Pending signatures |
| Equipment Checklist | `equipment-checklist` | Medium | Gear preparation |
| Social Stats | `social-stats` | Small | Connected social metrics |
| Notes | `notes` | Medium | Quick notes/reminders |
| Deadlines | `deadlines` | Medium | Upcoming due dates |

### Suggested Widgets by Context

Based on user behavior and data:
- **No galleries yet**: Show "Create Your First Gallery" widget
- **Unpaid invoices**: Highlight "Overdue Invoices" widget
- **Upcoming bookings**: Surface "Upcoming Bookings" widget
- **New user**: Show "Onboarding Checklist" widget

---

## Industry-Based Defaults

### Photographer Types

Based on the existing `ClientIndustry` enum plus photographer specializations:

| Type | Default Widgets | Rationale |
|------|-----------------|-----------|
| **Real Estate** | Key Metrics, Upcoming Bookings, Weather, Quick Actions, Recent Galleries | Fast turnaround focus |
| **Wedding** | Calendar Preview, Contract Status, Client Birthdays, Revenue Goals | Long-term planning |
| **Commercial** | Key Metrics, Revenue Goals, Deadlines, Contract Status | Project-based work |
| **Portrait/Headshots** | Quick Actions, Upcoming Bookings, Recent Activity | High-volume sessions |
| **Events** | Calendar Preview, Weather, Upcoming Bookings, Equipment Checklist | Event preparation |
| **Architecture** | Key Metrics, Deadlines, Recent Galleries, Weather | Project delivery focus |
| **Food/Hospitality** | Quick Actions, Recent Galleries, Client Birthdays | Relationship focus |
| **General/Mixed** | Balanced default with all core widgets | Versatile setup |

### Onboarding Flow Integration

During onboarding, users select their primary photography type:

```
┌─────────────────────────────────────────────────────┐
│  What type of photography do you primarily do?      │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   🏠        │  │   💒        │  │   🏢        │ │
│  │ Real Estate │  │  Wedding    │  │ Commercial  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   👤        │  │   🎉        │  │   🍽️        │ │
│  │  Portrait   │  │   Events    │  │    Food     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐                  │
│  │   🏛️        │  │   📷        │                  │
│  │Architecture │  │   Mixed     │                  │
│  └─────────────┘  └─────────────┘                  │
│                                                     │
│  This helps us set up your dashboard. You can      │
│  always customize it later.                        │
│                                                     │
│                              [Continue →]           │
└─────────────────────────────────────────────────────┘
```

---

## Help & Support Center

### URL Structure

```
/help                          # Main help center
/help/getting-started          # Onboarding guides
/help/galleries                # Gallery documentation
/help/clients                  # Client management
/help/invoicing                # Billing & payments
/help/contracts                # Contracts & e-sign
/help/calendar                 # Scheduling
/help/integrations             # Third-party connections
/help/settings                 # Account configuration
/help/faq                      # Frequently asked questions
/help/contact                  # Contact support
```

### Help Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Help & Support                                    [Search...]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🚀 Getting Started                                      │   │
│  │  New to PhotoProOS? Start here.                         │   │
│  │  [View Guide →]                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Browse by Category                                             │
│  ────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 🖼️ Galleries │  │ 👥 Clients   │  │ 💰 Invoicing │         │
│  │ 12 articles  │  │ 8 articles   │  │ 15 articles  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ 📝 Contracts │  │ 📅 Calendar  │  │ 🔗 Integrate │         │
│  │ 6 articles   │  │ 5 articles   │  │ 10 articles  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  Popular Articles                                               │
│  ────────────────────────────────────────────────────────────  │
│  • How to create and deliver your first gallery                │
│  • Setting up Stripe for payments                              │
│  • Creating professional contracts                              │
│  • Importing clients from CSV                                   │
│                                                                 │
│  ────────────────────────────────────────────────────────────  │
│  Can't find what you need?  [Contact Support]                  │
└─────────────────────────────────────────────────────────────────┘
```

### Help Article Structure

Each help article includes:

```tsx
interface HelpArticle {
  id: string;
  slug: string;
  category: HelpCategory;
  title: string;
  description: string;
  content: string; // Markdown
  videoUrl?: string;
  screenshots?: {
    url: string;
    alt: string;
    caption: string;
  }[];
  relatedArticles?: string[]; // Article IDs
  faqs?: {
    question: string;
    answer: string;
  }[];
  lastUpdated: Date;
}
```

---

## Settings Integration

### New Settings Section: "Walkthroughs & Guides"

Location: `/settings/walkthroughs`

```
┌─────────────────────────────────────────────────────────────────┐
│  Walkthroughs & Guides                                          │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Control which tutorials and guides appear throughout the app.  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Dashboard Walkthrough                          [On/Off] │   │
│  │  Shows tips for customizing your dashboard               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Galleries Walkthrough                          [On/Off] │   │
│  │  Learn how to create and manage galleries                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Clients Walkthrough                            [On/Off] │   │
│  │  Tips for managing your client relationships             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ... (more walkthroughs)                                        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  [Reset All Walkthroughs]                                       │
│  Restore all walkthroughs to their default (visible) state.     │
│  Note: Permanently dismissed walkthroughs cannot be restored.   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Dashboard Customize Settings Enhancement

Add to existing customize modal:

```
┌─────────────────────────────────────────────────────────────────┐
│  Customize Dashboard                                       [×]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layout Presets                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  ○ Real Estate Focus    ○ Wedding Focus    ○ Commercial        │
│  ○ Portrait             ○ Events           ● Custom             │
│                                                                 │
│  Visible Sections                                               │
│  ─────────────────────────────────────────────────────────────  │
│  [✓] Referral Program Banner                                    │
│  [✓] Key Metrics                                                │
│  [✓] Quick Actions                                              │
│  [✓] Upcoming Bookings                                          │
│  [✓] Recent Activity                                            │
│  [ ] Onboarding Checklist                                       │
│  [ ] Overdue Invoices                                           │
│  [ ] Expiring Galleries                                         │
│                                                                 │
│  Widget Order                                                   │
│  ─────────────────────────────────────────────────────────────  │
│  Drag to reorder:                                               │
│  ≡ Key Metrics                                                  │
│  ≡ Quick Actions                                                │
│  ≡ Upcoming Bookings                                            │
│  ≡ Recent Activity                                              │
│                                                                 │
│  [+ Add Widget]                                                 │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  [Reset to Default]                    [Save Changes]           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### New Models

```prisma
// User walkthrough preferences
model UserWalkthroughPreference {
  id              String   @id @default(cuid())
  userId          String
  pageId          String   // e.g., "dashboard", "galleries", "clients"
  state           WalkthroughState @default(open)
  dismissedAt     DateTime? // Only set if permanently dismissed
  hiddenAt        DateTime? // Set when hidden
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([userId, pageId])
  @@index([userId])
}

enum WalkthroughState {
  open
  minimized
  hidden
  dismissed
}

// Dashboard widget configuration
model UserDashboardConfig {
  id              String   @id @default(cuid())
  userId          String   @unique
  layoutPreset    String?  // e.g., "real_estate", "wedding", "custom"
  widgetOrder     Json     // Array of widget IDs in order
  hiddenWidgets   Json     // Array of hidden widget IDs
  widgetConfigs   Json     // Widget-specific configurations
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}

// Add to existing User/Organization model
model Organization {
  // ... existing fields

  primaryPhotographyType  String?  // For default dashboard setup
}
```

### Extending DashboardConfig

The existing `DashboardConfig` model will be extended:

```prisma
model DashboardConfig {
  // ... existing fields

  // New fields for widget system
  widgetLayout    Json?    // { widgets: WidgetConfig[], order: string[] }
  layoutPreset    String?  // "real_estate" | "wedding" | "commercial" | etc.
}
```

---

## Implementation Phases

### Phase 1: Foundation (Database & Types)
- [ ] Add Prisma models for walkthrough preferences
- [ ] Add Prisma models for dashboard widget config
- [ ] Create TypeScript types for walkthrough system
- [ ] Create TypeScript types for widget system
- [ ] Add `primaryPhotographyType` to Organization model
- [ ] Create migration and deploy

### Phase 2: Walkthrough Component
- [ ] Create `PageWalkthrough` component with all states
- [ ] Create walkthrough state management hook
- [ ] Create server actions for walkthrough preferences
- [ ] Implement dismiss warning modal
- [ ] Add animations for state transitions
- [ ] Ensure full accessibility (ARIA, keyboard nav)

### Phase 3: Settings Section
- [ ] Create `/settings/walkthroughs` page
- [ ] Create walkthrough settings client component
- [ ] Implement toggle functionality per page
- [ ] Implement "Reset All Walkthroughs" feature
- [ ] Add to settings navigation

### Phase 4: Help & Support Center
- [ ] Create `/help` page layout
- [ ] Create help article data structure
- [ ] Implement category browsing
- [ ] Implement search functionality
- [ ] Create initial help content (placeholders)
- [ ] Add video placeholder areas
- [ ] Create FAQ sections per category

### Phase 5: Dashboard Widget System
- [ ] Create widget container component
- [ ] Implement drag-and-drop with @dnd-kit
- [ ] Create "Add Widget" panel
- [ ] Create widget library with all widgets
- [ ] Implement widget configuration
- [ ] Create layout presets
- [ ] Enhance customize modal
- [ ] Make referral banner a widget (expandable)

### Phase 6: Apply Walkthroughs App-Wide
- [ ] Add walkthrough to Dashboard
- [ ] Add walkthrough to Galleries pages
- [ ] Add walkthrough to Clients pages
- [ ] Add walkthrough to Invoices pages
- [ ] Add walkthrough to Contracts pages
- [ ] Add walkthrough to Calendar page
- [ ] Add walkthrough to Settings pages
- [ ] Add walkthrough to Analytics page

### Phase 7: Onboarding Integration
- [ ] Add photography type selection to onboarding
- [ ] Apply default dashboard layout based on selection
- [ ] Show walkthrough explaining the chosen layout
- [ ] Allow changing preset from dashboard

---

## Component Architecture

### File Structure

```
src/
├── components/
│   ├── walkthrough/
│   │   ├── page-walkthrough.tsx       # Main walkthrough component
│   │   ├── walkthrough-step.tsx       # Individual step component
│   │   ├── walkthrough-video.tsx      # Video placeholder/player
│   │   ├── dismiss-warning-modal.tsx  # Confirmation modal
│   │   └── index.ts
│   │
│   ├── dashboard/
│   │   ├── widgets/
│   │   │   ├── widget-container.tsx   # Wrapper with drag handle
│   │   │   ├── key-metrics.tsx
│   │   │   ├── quick-actions.tsx
│   │   │   ├── upcoming-bookings.tsx
│   │   │   ├── recent-activity.tsx
│   │   │   ├── referral-widget.tsx    # Expandable referral
│   │   │   ├── revenue-goals.tsx
│   │   │   ├── weather-forecast.tsx
│   │   │   └── ... (other widgets)
│   │   │
│   │   ├── add-widget-panel.tsx       # Widget selector
│   │   ├── dashboard-grid.tsx         # Drag-and-drop grid
│   │   ├── layout-presets.tsx         # Preset selector
│   │   └── customize-modal.tsx        # Enhanced customize
│   │
│   └── help/
│       ├── help-search.tsx
│       ├── help-category-card.tsx
│       ├── help-article.tsx
│       ├── help-video.tsx
│       └── help-faq.tsx
│
├── lib/
│   ├── actions/
│   │   ├── walkthrough.ts             # Walkthrough server actions
│   │   └── dashboard-widgets.ts       # Widget config actions
│   │
│   ├── hooks/
│   │   ├── use-walkthrough.ts         # Walkthrough state hook
│   │   └── use-dashboard-widgets.ts   # Widget management hook
│   │
│   └── help/
│       ├── articles.ts                # Help article content
│       └── categories.ts              # Help categories
│
└── app/
    ├── (dashboard)/
    │   ├── dashboard/
    │   │   └── page.tsx               # Enhanced dashboard
    │   │
    │   ├── settings/
    │   │   └── walkthroughs/
    │   │       └── page.tsx           # Walkthrough settings
    │   │
    │   └── help/
    │       ├── page.tsx               # Help center home
    │       ├── [category]/
    │       │   └── page.tsx           # Category page
    │       └── [category]/[slug]/
    │           └── page.tsx           # Article page
```

---

## Accessibility Requirements

### Walkthrough Component
- [ ] Full keyboard navigation (Tab, Enter, Escape)
- [ ] ARIA labels for all interactive elements
- [ ] Screen reader announcements for state changes
- [ ] Focus management when opening/closing
- [ ] Reduced motion support

### Widget System
- [ ] Keyboard-accessible drag-and-drop
- [ ] ARIA live regions for reorder announcements
- [ ] Focus indicators for all widgets
- [ ] Skip link to bypass widget area

### Help Center
- [ ] Semantic heading structure
- [ ] Search accessible to screen readers
- [ ] Video captions/transcripts
- [ ] Alt text for all screenshots

---

## Open Questions

1. **Video Hosting**: Where will tutorial videos be hosted? (YouTube, Vimeo, self-hosted?)

2. **Analytics**: Should we track walkthrough engagement metrics?

3. **A/B Testing**: Should we test different walkthrough approaches?

4. **Mobile Experience**: How should walkthroughs behave on mobile?

5. **Multi-language**: Will walkthroughs need translation support?

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-06 | Initial specification |
