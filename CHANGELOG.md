# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed (Core Pages - Real Data Connection)
- **Clients Page** (`/clients/page.tsx`):
  - Removed DEMO_MODE flag - now fetches real client data from database
  - Shows project count and lifetime revenue from database
  - Direct prisma import instead of dynamic import
- **Payments Page** (`/payments/page.tsx`):
  - Removed DEMO_MODE flag - now fetches real payment data from database
  - Shows this month's revenue, pending and overdue totals from database
  - Filter tabs show real counts by payment status
- **Scheduling Page** (`/scheduling/page.tsx`):
  - Removed DEMO_MODE flag - now fetches real booking data from database
  - Mini calendar shows days with actual bookings
  - Upcoming bookings list populated from database

### Added (Landing Page - Competitor Comparison)
- **Comparison Section** (`/components/sections/comparison.tsx`):
  - New competitor comparison table showing PhotoProOS vs Pixieset, Pic-Time, HoneyBook
  - Category filter tabs: All Features, Core, Advanced, Business, Pricing
  - Feature comparison with checkmarks, X marks, "Coming Soon", and custom text values
  - Responsive design: desktop table view, mobile card view
  - Scroll animations with fade-in effects
  - "Recommended" badge for PhotoProOS column
  - Bottom CTA with "Start your free trial" button

### Added (Landing Page - Video Demo Modal)
- **Video Modal Component** (`/components/ui/video-modal.tsx`):
  - Reusable video modal with backdrop blur
  - Keyboard support (ESC to close)
  - Placeholder state for "Coming Soon" with subscribe prompt
  - Supports YouTube/Vimeo embeds when video URL provided
- Updated Hero section "Watch demo" button to open video modal

### Changed (Landing Page - Pre-Launch Consistency)
- **Hero Section**:
  - Changed badge from "Now serving 2,500+ photographers" to "Now in beta — Start free today"
  - Replaced fake "4.9 from 500+ reviews" with benefit pills (No credit card, 5 free galleries, Cancel anytime)
- **Logos/Stats Section**:
  - Updated stats to pre-launch messaging (5 free galleries, 0% fees, 1 platform, 24hr setup)
  - Changed "Trusted by photographers at" to "Built for every photography specialty" with specialty pills
  - Replaced fake G2/Capterra ratings with launch benefits
- **Testimonials Section**:
  - Changed badge from "Trusted by 2,500+ photographers" to "Built by photographers, for photographers"
  - Replaced fake review stats with benefit pills (Free tier, No credit card, Bank-level security)
- **CTA Section**:
  - Removed "Join 2,500+ photographers" claim
  - Updated subheading to focus on platform benefits
- **Security Section**:
  - Removed "2,500+ photographers trust PhotoProOS" claim
  - Updated to "Your photos deserve enterprise-grade protection"
- **FAQ Section**:
  - Removed "helped thousands of photographers switch" claim
  - Updated storage limit from 3 to 5 galleries for consistency
- **Pricing Section**:
  - Updated free tier from 3 to 5 galleries for consistency across all sections

### Changed (Landing Page - Roadmap Section)
- Restructured roadmap section from individual features to phased approach:
  - Phase 1: Core Platform (Completed) - Galleries, Payments, Clients, Bookings, Services
  - Phase 2: Property Websites & Client Portal (In Progress) - Single property websites, client portals, marketing kit, analytics
  - Phase 3: Marketing Hub (Coming Soon) - Email marketing, content calendar, social media manager, referral program
  - Phase 4: Analytics Hub (Planned) - Business metrics, revenue forecasting, client insights, custom reports
  - Phase 5: Website Builder (Planned) - Portfolio builder, blog & content, SEO tools, custom domains
- Updated roadmap header from "What's coming next" to "Our product roadmap"
- Updated subheading to emphasize "complete business operating system"
- Changed badge text from "New features shipping monthly" to "5 phases to complete business OS"
- Created new `PhaseCard` component replacing individual `RoadmapCard` for phase-based display
- Each phase shows status, description, and feature items with icons
- Added `WebsiteIcon` and `EmailIcon` components for new feature items

### Added (Gallery Production Mode)
- **Gallery Validation Schemas** (`/lib/validations/galleries.ts`):
  - Zod schemas for gallery CRUD operations matching services pattern
  - Includes: gallerySchema, createGallerySchema, updateGallerySchema, deleteGallerySchema
  - Additional schemas: duplicateGallerySchema, archiveGallerySchema, deliverGallerySchema
  - Asset schemas: assetSchema, reorderAssetsSchema
  - Full TypeScript type exports for all inputs
- **Gallery Server Actions** (`/lib/actions/galleries.ts`):
  - Complete CRUD operations: createGallery, updateGallery, deleteGallery
  - Gallery lifecycle: duplicateGallery, archiveGallery, deliverGallery
  - Bulk operations: bulkArchiveGalleries, bulkDeleteGalleries
  - Query functions: getGalleries, getGallery, getGalleryCounts
  - Photo management: reorderPhotos
  - Analytics tracking: recordGalleryView, recordDownload
  - Activity logging for all gallery events
  - Slug generation for delivery links

### Changed (Gallery Production Mode)
- **Gallery List Page** (`/galleries/page.tsx`):
  - Removed DEMO_MODE - now fetches real data from database
  - Uses getGalleryCounts() for filter tab counts
  - Fixed client field references (fullName instead of firstName/lastName)
- **Gallery Detail Page** (`/galleries/[id]/page.tsx`):
  - Removed demo data - fetches real gallery using getGallery action
  - Added real activity log display
  - Connected Deliver Gallery button to server action
  - Shows real photos, stats, and delivery link
- **Gallery Edit Page** (`/galleries/[id]/edit/page.tsx`):
  - Removed demo data - fetches real gallery and clients
  - Shows real gallery status, stats, and activity logs
  - Connected to real database for form data
- **Gallery New Form** (`/galleries/new/gallery-new-form.tsx`):
  - Connected to createGallery server action
  - Proper form state management with controlled inputs
  - Toast notifications on success/error
  - Redirects to gallery detail on creation
- **Gallery New Page** (`/galleries/new/page.tsx`):
  - Fetches real clients from database
  - Shows real gallery stats in sidebar
- **Dashboard Page** (`/dashboard/page.tsx`):
  - Fixed booking location field reference

### Fixed
- Type errors with Client model using fullName instead of firstName/lastName
- Type errors with Booking model location field reference
- Type errors with GalleryComment model (uses clientName/clientEmail, not user relation)
- Type errors with ActivityLog user relation field names
- Zod record schema syntax for exifData field

### Changed (Dashboard Analytics - Real Data)
- **Dashboard Page** (`/dashboard/page.tsx`):
  - Removed DEMO_MODE flag - now always uses real database data
  - Added month-over-month comparison for revenue (percentage change)
  - Added 30-day comparison for galleries and clients count (absolute change)
  - Dynamic change indicators on stat cards (positive/negative/neutral)
  - Shows no change indicator when values are unchanged
  - Imported prisma client directly instead of dynamic import
  - Fixed gallery assets count to use `_count` pattern for efficiency

### Changed (Photo Reordering - Persistence)
- **Gallery Detail Client** (`/galleries/[id]/gallery-detail-client.tsx`):
  - Connected drag-and-drop photo reordering to `reorderPhotos` server action
  - Optimistic UI update with automatic revert on error
  - Saves order to database immediately after each drag operation
  - Removed duplicate toast message when exiting reorder mode

### Fixed
- **Logos Section** (`/components/sections/logos.tsx`):
  - Removed reference to non-existent `prefix` property on stats objects

### Added (Gallery Improvements - Session 2)
- **Gallery Edit Form** (`/galleries/[id]/edit/gallery-edit-form.tsx`):
  - Connected to updateGallery and deleteGallery server actions
  - Full form state management with controlled inputs
  - Delete confirmation modal with loading states
  - Toast notifications on success/error
  - Automatic redirect after save/delete
- **Public Gallery Page** (`/g/[slug]/page.tsx`):
  - Removed demo data - fetches real gallery using getPublicGallery action
  - Records gallery views automatically on page load
  - Shows photographer branding (name, logo, colors)
  - Payment status and download access handling
  - Watermark support based on settings
- **Gallery List Actions** (`/galleries/gallery-list-client.tsx`):
  - Connected quick actions (duplicate, archive, delete) to server actions
  - Connected bulk actions (archive, delete) to server actions
  - Delete confirmation modals for single and bulk operations
  - Loading states during async operations
- **Public Gallery Server Action** (`/lib/actions/galleries.ts`):
  - Added getPublicGallery(slug) function for public gallery viewing
  - Validates delivery link status and expiration
  - Returns organization branding for themed display

### Added (Dashboard Enhancements)
- **Quick Actions Component** (`/components/dashboard/quick-actions.tsx`):
  - Four quick action cards: Create Gallery, Add Client, New Booking, Send Invoice
  - Color-coded icons with hover states using design system tokens
  - Responsive grid layout (1 → 2 → 4 columns)
- **Upcoming Bookings Component** (`/components/dashboard/upcoming-bookings.tsx`):
  - Displays next 3 upcoming bookings with status indicators
  - Shows date, time, location, and service type
  - Smart date formatting (Today, Tomorrow, or date)
  - Status badges (Confirmed, Pending, Cancelled)
  - Empty state with call-to-action
- **Revenue Chart Component** (`/components/dashboard/revenue-chart.tsx`):
  - Bar chart showing 6-month revenue trends
  - Comparison with previous period
  - Percentage change indicator with positive/negative styling
  - Responsive header layout for mobile
  - `RevenueSparkline` compact variant for smaller spaces
- **Loading Skeletons** (`/components/dashboard/skeleton.tsx`):
  - `DashboardSkeleton` - Full page loading state
  - Individual skeletons: `StatCardSkeleton`, `QuickActionsSkeleton`, `RevenueChartSkeleton`, `GalleryCardSkeleton`, `UpcomingBookingsSkeleton`, `RecentActivitySkeleton`
  - Animated pulse effect using design system colors
- **Empty States** (`/components/dashboard/empty-state.tsx`):
  - Reusable `EmptyState` component with default and compact variants
  - Pre-configured: `EmptyGalleries`, `EmptyBookings`, `EmptyActivity`, `EmptyClients`, `EmptyPayments`
  - Consistent styling with primary and secondary actions
- **Dashboard Loading Page** (`/app/(dashboard)/dashboard/loading.tsx`):
  - Server-side loading skeleton using Next.js loading convention

### Changed (Dashboard Improvements)
- Updated dashboard layout with new sections:
  - Quick Actions section below stats grid
  - Revenue Chart section for financial overview
  - Restructured right sidebar with Upcoming Bookings above Recent Activity
- Enhanced empty states in database mode with icons and better copy
- Improved responsive design for Revenue Chart header

### Added (Location, Travel & Team Capabilities - Foundation)
- **Database Schema Updates (Prisma):**
  - Added `Location` model with Google Places integration (placeId, coordinates, address components)
  - Added `PropertyDetails` model for real estate property data (beds, baths, sqft, MLS info)
  - Added `Equipment` model for photography equipment tracking (cameras, lenses, drones, etc.)
  - Added `UserEquipment` model for team member equipment assignments
  - Added `UserServiceCapability` model for tracking which services team members can perform
  - Added `ServiceEquipmentRequirement` model for service-to-equipment mapping
  - New enums: `PropertyType`, `EquipmentCategory`, `CapabilityLevel`, `LineItemType`
  - Updated `Organization` with travel fee settings (homeBaseLocationId, travelFeePerMile, travelFeeThreshold)
  - Updated `User` with home base location override for per-member travel calculations
  - Updated `Booking` with location reference, travel calculations (distanceMiles, travelTimeMinutes, travelFeeCents), weather cache, and team member assignment
  - Updated `Project` with location reference for galleries
  - Updated `InvoiceLineItem` with itemType and booking reference for travel fees
- **Google Maps API Library** (`/lib/google-maps/`):
  - `types.ts` - TypeScript types for Places, Geocoding, Distance Matrix APIs
  - `client.ts` - API client configuration and URL builders
  - `places.ts` - Places Autocomplete and Place Details functions
  - `geocoding.ts` - Address geocoding and reverse geocoding
  - `distance.ts` - Distance Matrix calculations, travel fee computation, formatting utilities
  - `index.ts` - Centralized exports
- **Weather API Library** (`/lib/weather/`):
  - `types.ts` - TypeScript types for weather forecasts, golden hour, photo conditions
  - `client.ts` - OpenWeather API client configuration
  - `forecast.ts` - Current weather, 5-day forecasts, hourly forecasts, photo condition analysis
  - `golden-hour.ts` - Sunrise/sunset calculations, golden hour times, local fallback calculations
  - `index.ts` - Centralized exports
- **UI Components** (`/components/ui/`):
  - `AddressAutocomplete` - Google Places autocomplete input with session tokens for billing optimization
  - `MapPreview` - Static and embedded Google Maps preview with directions link
  - `MapPreviewCard` - Card wrapper with distance and travel time display
- **Dashboard Components** (`/components/dashboard/`):
  - `TravelInfoCard` - Distance, travel time, and travel fee display with breakdown
  - `TravelInfoCompact` - Compact inline version for tables/lists
  - `TravelFeeBadge` - Badge showing travel fee or "free" for line items
  - `WeatherForecastCard` - Weather forecast with photo condition ratings
  - `WeatherForecastCompact` - Compact inline version for tables/lists
  - `GoldenHourBadge` - Badge showing if shoot time is during golden hour
- **Environment Configuration:**
  - Added `GOOGLE_MAPS_API_KEY` for server-side API calls
  - Added `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for client-side map embeds
  - Added `OPENWEATHER_API_KEY` for weather forecasts
  - Added `ATTOM_API_KEY` (optional) for property data lookups

### Added (Smart Invoicing - Travel Fee Integration)
- **InvoiceBuilder Enhancements** (`/components/dashboard/invoice-builder.tsx`):
  - Added `LineItemType` enum: `service`, `travel`, `custom`, `discount`, `tax`
  - Added `TravelFeeInput` interface for travel fee calculation parameters
  - Added "Add Travel Fee" button with travel fee calculation
  - Added travel fee line items with automatic calculation (distance × rate - threshold)
  - Added visual badges for line item types (Travel, Discount, Tax)
  - Updated line item display with type-specific styling

### Added (Travel Settings Page)
- Created `/settings/travel` page for travel & mileage configuration:
  - Home base address configuration with `AddressAutocomplete` integration
  - `MapPreview` showing current home base location
  - Free travel threshold setting (miles within which travel is free)
  - Per-mile rate configuration with IRS rate reference ($0.67/mile for 2024)
  - Auto-calculate travel fees toggle for new bookings
  - Live fee calculator preview using `TravelInfoCard`
  - Example calculations table showing fees at 5, 15, 25, and 50 miles
  - Team member override information with link to team settings
  - Demo mode banner (settings not persisted without database)
- Added Travel & Mileage card to main settings page (`/settings`)

### Added (Mobile Navigation)
- Created mobile navigation system for dashboard (`/components/layout/mobile-nav.tsx`)
  - Slide-out sidebar with all navigation items
  - Backdrop overlay with blur effect
  - Close on route change (auto-navigate)
  - Body scroll prevention when open
  - Escape key to close
  - MobileMenuButton hamburger component
- Created client layout wrapper (`/components/layout/dashboard-layout-client.tsx`)
  - Manages mobile menu open/close state
  - Composes sidebar, topbar, and mobile navigation
  - Responsive header with mobile menu button
- Updated dashboard layout to use client wrapper

### Added (Service Quick Actions)
- Created ServiceQuickActions client component (`/components/dashboard/service-quick-actions.tsx`)
  - Working "Duplicate Service" button with toast notifications
  - Links to create gallery/booking with service ID in URL params
  - Navigates to duplicated service page on success
- Connected duplicate functionality to existing `duplicateService` server action

### Fixed (Responsiveness)
- Fixed services list table overflow on mobile with horizontal scroll
- Fixed galleries list table overflow on mobile with horizontal scroll
- Fixed category filter layout in services list (stacking on mobile)
- Fixed "Show inactive" toggle layout (now wraps properly)
- Fixed bulk action bar in galleries list (stacks on mobile, icon-only buttons on small screens)
- Fixed service form action buttons (stack vertically on mobile)
- Made dashboard topbar search hidden on extra small screens
- Improved dashboard topbar flexibility with className prop

### Added (Services Management System - Full Implementation)
- Created comprehensive Services Management System with database persistence
- **Database Schema Updates:**
  - Added `Service` model to Prisma schema with fields: name, category, description, priceCents, duration, deliverables, isActive, isDefault, sortOrder
  - Added `ServiceCategory` enum matching existing lib/services.ts categories
  - Added `serviceId` foreign key to `Project` model for gallery-service linking
  - Added `serviceId` foreign key to `Booking` model for booking-service linking
  - Updated `Organization` model with services relation
- **Zod Validation Schemas** (`/lib/validations/services.ts`):
  - `serviceSchema` - Base service validation with comprehensive field rules
  - `createServiceSchema` - For creating new services
  - `updateServiceSchema` - For updating existing services (partial with ID)
  - `deleteServiceSchema` - For deleting/archiving services
  - `duplicateServiceSchema` - For duplicating services
  - `bulkUpdatePricesSchema` - For bulk price updates
  - `bulkArchiveSchema` - For bulk archive/restore operations
  - `serviceFiltersSchema` - For filtering services in queries
- **Server Actions** (`/lib/actions/services.ts`):
  - `createService` - Create new service with validation and revalidation
  - `updateService` - Update service (blocks template edits)
  - `deleteService` - Delete or archive service based on usage
  - `duplicateService` - Create copy of existing service
  - `toggleServiceStatus` - Toggle active/inactive status
  - `getServices` - Fetch all services with filters
  - `getService` - Fetch single service by ID
  - `seedDefaultServices` - Seed predefined photography services from lib/services.ts
- **ServiceForm Integration:**
  - Connected form to server actions (createService/updateService)
  - Added toast notifications for success/error feedback
  - Added delete confirmation modal with archive option
  - Loading states during form submission
  - Error handling with user-friendly messages
- **ServiceSelector Enhancements:**
  - Added optional `services` prop for database services
  - Falls back to static services when no database services provided
  - Updated type definitions to support both static and database services
  - Added `DatabaseServiceType` export for type-safe integration
- **Services Tab in Galleries Section:**
  - Added Galleries | Services tab navigation to galleries page
  - Services tab links to `/galleries/services`
- **Services List Page** (`/galleries/services`):
  - Grid/List view toggle (consistent with galleries)
  - Search by service name and deliverables
  - Filter by category (All, Real Estate, Portrait, Event, Commercial, Wedding, Product, Other)
  - Sort options: Name A-Z/Z-A, Price High/Low, Most Used
  - Show/hide inactive services toggle
  - Usage count display per service
  - Template badge for predefined services
  - Active/Inactive status indicators
  - Auto-seeds default services on first visit
  - Empty state with call-to-action
- **Service Cards:**
  - Category badge with color coding
  - Price display with proper formatting
  - Duration and deliverables preview
  - Usage count footer
  - Click to edit navigation
- **Create Service Page** (`/galleries/services/new`):
  - Full service form with validation
  - Deliverables tag manager with Enter key support
  - Live preview card
  - Tips sidebar for guidance
  - Templates link for inspiration
- **Edit Service Page** (`/galleries/services/[id]`):
  - Pre-populated form with existing data
  - Usage stats sidebar (galleries/bookings count)
  - Quick actions: Duplicate, Create Gallery, Create Booking
  - Active status toggle (disabled for templates)
  - Template notice for read-only system services
  - Delete/Archive functionality
- **Service Form Component** (`/components/dashboard/service-form.tsx`):
  - Reusable form for create/edit modes
  - Service name, category, price, duration, description fields
  - Deliverables manager with add/remove functionality
  - Live preview card showing how service will appear
  - Active status toggle for custom services
  - Template-aware disabled states
  - Delete confirmation modal
- **Implementation Plan Documentation:**
  - Created `docs/SERVICES_IMPLEMENTATION_PLAN.md` with full roadmap
  - Phases: Database, UI, API/Actions, Integration, Analytics
  - File structure and testing checklist

### Added (Gallery List Enhancements)
- Added views and downloads statistics columns to gallery list table view
  - EyeIcon for views count display
  - DownloadIcon for downloads count display
  - Hidden on mobile, visible on large screens (responsive design)
  - Updated Gallery interface to include optional views/downloads properties

### Added (Keyboard Shortcuts Modal)
- Created `KeyboardShortcutsModal` component (`src/components/ui/keyboard-shortcuts-modal.tsx`)
  - Comprehensive shortcuts reference with 4 groups:
    - Navigation: G+D (Dashboard), G+G (Galleries), G+C (Clients), G+P (Payments), G+S (Scheduling)
    - Global: ⌘K (Search), ? (Shortcuts), Esc (Close), N (New gallery)
    - Gallery View: S (Select), A (Select all), R (Reorder), Delete (Delete selected)
    - Photo Lightbox: ←/→ (Navigate), +/- (Zoom), Esc (Close)
  - Backdrop with blur effect
  - Escape key to close
  - Body scroll lock when open
  - Grid layout for shortcut groups
- Integrated keyboard shortcuts modal into dashboard topbar
  - "?" key opens modal from anywhere (when not in input fields)
  - Help menu button opens modal

### Added (Password Protection UI)
- Added password input UI to gallery creation form (`/galleries/new`)
  - Password input field appears when "Password Protected" access type is selected
  - Show/hide password toggle with EyeIcon/EyeOffIcon
  - Password strength indicator with visual progress bar
    - Weak (red, <4 chars), Fair (orange, <8 chars), Good (blue, <12 chars), Strong (green, 12+ chars)
  - Helpful description text for sharing password with clients

### Added (Inline Custom Service Editor)
- Enhanced ServiceSelector component with full custom service creation capabilities
  - Service name input with placeholder examples
  - Category dropdown with all photography service categories
  - Price input with dollar formatting
  - Duration field for estimated session time
  - Description textarea for service details
  - Deliverables manager with add/remove functionality
    - Tags display with remove buttons
    - Enter key support for quick adding
  - Live preview card showing how service will appear
  - "Manage Services" link to settings page
- Updated gallery creation form (`/galleries/new`) to use new ServiceSelector props
  - Added state for serviceName, deliverables, category, duration
  - Hidden form fields for all custom service data
- Exported new `CustomServiceType` interface for external usage

### Added (Bulk Gallery Operations)
- Added bulk selection mode to gallery list page (`src/app/(dashboard)/galleries/gallery-list-client.tsx`)
  - "Select" button toggles selection mode in gallery list
  - Checkboxes appear on gallery cards in grid view
  - Checkbox column appears in list/table view
  - Click anywhere on row/card to toggle selection
  - Visual highlighting for selected galleries (ring highlight in grid, background in list)
  - Select All / Deselect All toggle
  - Bulk action bar with selected count
  - **Bulk actions available:**
    - Share: Copy all selected gallery links to clipboard
    - Export: Export selected galleries
    - Archive: Archive multiple galleries at once
    - Delete: Bulk delete with confirmation
  - Actions column hidden during select mode
  - Quick actions disabled during select mode

### Added (Delivery Preview Button)
- Added "Preview as Client" button to gallery detail sidebar
  - Prominently displayed in Delivery Link section header
  - Opens gallery in new tab as client would see it
  - Visual preview icon with clear labeling

### Added (Gallery Expiration Warning Banner)
- Added prominent expiration warning banner to gallery detail page
  - Shows when gallery expires within 7 days (warning state)
  - Shows when gallery has already expired (error state)
  - Different styling for warning vs expired states
  - "Send Reminder" button to notify client (warning state only)
  - "Extend Expiration" button that navigates to settings tab
  - Countdown showing days until expiration
  - Helpful messages explaining the situation and suggested actions

### Added (Photo Comments Panel)
- Added slide-over comments panel to gallery detail page
  - "Comments" button with badge showing comment count
  - Slide-over panel from right side with backdrop
  - List of all comments with author avatars and timestamps
  - Distinction between client comments and photographer comments
  - New comment textarea with send button
  - Real-time comment adding with toast confirmation
  - Empty state when no comments exist
  - Close button and click-outside to dismiss

### Added (Dashboard Topbar Functionality)
- Made dashboard topbar fully functional (`src/components/layout/dashboard-topbar.tsx`)
  - **Search**: Real-time search across galleries, clients, and payments
    - Keyboard shortcut (⌘K/Ctrl+K) to focus search
    - Search results dropdown with icons by type
    - Click-to-navigate to results
    - Empty state for no results
  - **New Gallery button**: Now links to `/galleries/new` creation page
  - **Notifications dropdown**:
    - Shows recent notifications (payments, views, downloads, comments, expirations)
    - Unread indicator with animated ping effect
    - Mark individual or all notifications as read
    - Link to notifications settings
    - Type-specific icons with color coding
  - **Help menu dropdown**:
    - Documentation link
    - Support link
    - Keyboard shortcuts button
    - Send feedback option
  - Click-outside handling for all dropdowns
  - Escape key closes all dropdowns

### Added (Invoice Builder & Enhanced Pricing)
- Created comprehensive `InvoiceBuilder` component (`src/components/dashboard/invoice-builder.tsx`)
  - Multi-select for adding multiple preset service packages at once
  - Custom line items with description, quantity, and pricing
  - Variable pricing types: Fixed, Per Square Foot, Per Item, Per Hour, Per Person
  - Category filtering for quick service discovery
  - Invoice-style item list with line numbers and subtotals
  - Edit quantity inline for variable pricing items
  - Remove individual items from invoice
  - Real-time total calculation
  - `InvoiceSummary` component for read-only invoice display
- Exported new types: `LineItem`, `PricingType` for external usage

### Added (Gallery Quick Actions)
- Added quick action menus to gallery list view (`src/app/(dashboard)/galleries/gallery-list-client.tsx`)
  - Hover-to-reveal action button on gallery cards (grid view)
  - Action dropdown menu with Share, Duplicate, Archive, Delete options
  - Actions column in list/table view with dropdown menu
  - Toast notifications for all quick actions
  - Share action copies gallery link to clipboard
- Updated `GalleryCard` component (`src/components/dashboard/gallery-card.tsx`)
  - Added optional `onQuickAction` callback prop
  - Dropdown menu appears on hover with action items
  - Click-outside handling to close menu
  - Proper event propagation for action buttons
  - Exported `QuickAction` type for external usage

### Added (Drag-and-Drop Photo Reordering)
- Implemented drag-and-drop photo reordering in gallery detail page
  - Installed @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
  - "Reorder" button toggles reorder mode (only shown when 2+ photos)
  - `SortablePhotoItem` component with drag handle and visual feedback
  - Dragging shows ring highlight and shadow effect
  - Drag instruction banner when in reorder mode
  - Toast notification confirms order saved
  - Mutually exclusive with selection mode

### Added (Gallery Analytics Tab)
- Added comprehensive Analytics tab to gallery detail page
  - Total views, unique visitors, total downloads metrics
  - Average time on page display
  - Views by day chart visualization
  - Device breakdown (Desktop, Mobile, Tablet) with percentages
  - Top performing photos section
  - Export analytics button for PDF reports
  - Demo analytics data for preview

### Added (Photo Favorites & Filtering)
- Added photo favorites/starring system
  - Heart icon button on photo cards (hover and always-visible for favorited)
  - Toggle favorite from photo hover overlay
  - Batch favorite action in selection mode
  - Favorites count badge in filter tabs
- Added photo filter tabs above photo grid
  - All, Favorites, With Comments filter options
  - Active filter styling with pill buttons
  - Filter icon indicator

### Added (Gallery List Enhancements)
- Created `GalleryListClient` component (`src/app/(dashboard)/galleries/gallery-list-client.tsx`)
  - Search input with debounced filtering by gallery name or client
  - Sort dropdown with 6 options: Newest, Oldest, Name (A-Z), Name (Z-A), Revenue (High), Revenue (Low)
  - Grid/List view toggle with smooth switching
  - List view displays as a table with thumbnail, client, photos, status, and revenue columns
  - Empty state handling with helpful messages
  - Results count when search is active
- Updated galleries page to use the new client component for both demo and database modes

### Added (Photo Multi-Select Mode)
- Added selection mode to gallery detail page (`/galleries/[id]`)
  - "Select" button toggles selection mode on photo grid
  - "Select All" / "Deselect All" for bulk selection
  - Checkboxes appear on photos in selection mode
  - Selected photos show ring highlight
  - Selection count displayed in header
- Added BatchActionBar component (inline in gallery detail)
  - Appears when photos are selected
  - "Set as Cover" button (requires exactly 1 photo selected)
  - "Download" button for batch download
  - "Delete" button with destructive styling
- Added cover photo indicator
  - Star badge on cover photo in grid
  - Set cover action updates the cover photo state

### Added (Photo Upload Modal)
- Created `PhotoUploadModal` component (`src/components/upload/photo-upload-modal.tsx`)
  - Drag-and-drop upload zone with visual feedback
  - File input fallback for click-to-browse
  - File type validation (JPG, PNG, GIF, WEBP, HEIC)
  - File size validation (max 50MB per file)
  - Preview grid showing selected files with thumbnails
  - Upload progress indicators with animated progress bars
  - Individual file removal before upload
  - Error state display for invalid files
  - Keyboard accessible (Escape to close)
  - Prevents body scroll when open
- Integrated PhotoUploadModal into gallery detail page
  - "Add Photos" button now opens upload modal
  - Uploaded photos appear immediately in gallery grid
  - Success toast notification after upload completion
  - Photos state managed locally (ready for API integration)

### Added (Service Selector & Pricing)
- Created comprehensive photography services library (`src/lib/services.ts`)
  - 20+ predefined service packages across 7 categories
  - Real Estate: Standard, Luxury Property, Aerial/Drone, 3D Virtual Tour
  - Portrait: Headshot, Team Headshots, Personal Branding, Family
  - Event: Corporate Event, Party/Celebration, Conference Coverage
  - Commercial: Architectural, Restaurant/Hospitality, Construction Progress
  - Wedding: Engagement, Elopement, Full Wedding Coverage
  - Product: E-commerce, Lifestyle, Food Photography
  - Each service includes base price, estimated duration, and deliverables
- Created reusable `ServiceSelector` component (`src/components/dashboard/service-selector.tsx`)
  - Toggle between predefined services or custom pricing
  - Category filtering (All, Real Estate, Portrait, Event, etc.)
  - Expandable service cards showing deliverables
  - Price override capability for selected services
  - Custom pricing mode with description field
  - `ServiceDisplay` component for read-only display on detail pages
- Integrated service selector into gallery creation/edit flows
  - `/galleries/new` now includes service & pricing section
  - `/galleries/[id]/edit` supports editing service selection
  - Hidden form fields for serviceId, price, and description
- Integrated service selector into booking creation flow
  - `/scheduling/new` now includes service & pricing section
  - Deposit field moved under service selector
  - Auto-fills pricing based on selected service package
- Integrated service selector into booking edit flow
  - Created `booking-edit-form.tsx` client component for form state management
  - `/scheduling/[id]/edit` now includes service & pricing section with ServiceSelector
  - Pre-populates service selection based on existing booking serviceId
  - Hidden form fields for serviceId, price, and serviceDescription
- Added service package display to gallery detail page
  - `/galleries/[id]` now shows Service Package section using ServiceDisplay component
  - Displays service name, category, price, and description for selected services
  - Falls back to custom pricing display when no predefined service is selected
- Added service package display to booking detail page
  - `/scheduling/[id]` now shows Service Package section using ServiceDisplay component
  - Consistent styling and behavior with gallery detail page

### Added (Gallery Detail Improvements)
- Created Toast notification system (`src/components/ui/toast.tsx`)
  - Success, error, warning, and info toast types
  - Auto-dismiss with configurable duration
  - Accessible with proper ARIA attributes
  - ToastProvider wraps dashboard layout for global access
- Created Image Lightbox component (`src/components/ui/image-lightbox.tsx`)
  - Full-screen photo viewer with keyboard navigation (←/→/Esc)
  - Zoom in/out functionality
  - Thumbnail strip for quick navigation
  - Download and delete actions per photo
  - Responsive design with touch support
- Enhanced Gallery Detail page (`/galleries/[id]`)
  - Clickable photos that open in lightbox viewer
  - "View All" button for galleries with 6+ photos
  - All action buttons now functional with toast feedback
  - Copy to clipboard for delivery links
  - Reorganized layout: Description now appears above Service Package
  - Added Edit button on Description section
  - ServiceDisplay now includes Edit button linking to edit page
- Added Contracts section with "Coming Soon" state
  - Preview of upcoming contracts & e-signatures feature
  - Disabled Create Contract button with styling
  - Informative placeholder explaining future functionality
- Added Tabs navigation to gallery detail page
  - Photos tab: Photo grid, description, service package, contracts
  - Activity tab: Internal notes editor and activity timeline
  - Settings tab: Gallery settings toggles and download options
  - Invoices tab: Invoice list and creation, payment reminders
- Added Activity Timeline feature
  - Tracks all gallery events (created, edited, delivered, viewed, downloaded, payment)
  - Relative time formatting (Today, Yesterday, X days ago)
  - Color-coded activity icons by event type
  - Displays user attribution when available
- Added Internal Notes section
  - Editable notes textarea for internal use
  - Save/Cancel buttons with toast feedback
  - Preserved across sessions
- Added Gallery Settings panel
  - Watermark photos toggle
  - Allow downloads toggle
  - Password protection toggle
  - Allow favorites toggle
  - Allow comments toggle
  - Download resolution options (Full, Web, Both)
  - Gallery expiration date picker
- Added Invoice Integration section
  - Invoice list view with status badges
  - Create Invoice button with toast feedback
  - Payment pending alert with reminder functionality
  - Invoice card showing amount and payment date
- Enhanced Client section with quick actions
  - Email and Call buttons
  - Phone number display when available
  - View Client Profile link
- Added QR code generation for delivery links
  - QR button added to link sharing options
  - Generates shareable QR code on demand

### Changed (ServiceDisplay Component)
- Added `editHref` prop for optional edit button
- Added `showEditButton` prop to control visibility
- Edit button links directly to gallery/booking edit page

### Added (Edit & Detail Pages)
- Created `/clients/[id]/edit` page with comprehensive client edit form
  - Pre-populated fields for name, company, industry, contact info
  - Address and notes editing
  - Tags management (VIP, Repeat Client, etc.)
  - Sidebar with client stats, activity log, quick links, and danger zone
- Created `/scheduling/[id]/edit` page with booking edit form
  - Session details editing (title, type, client)
  - Date/time/location modification
  - Pricing and deposit management
  - Sidebar with status selector, pricing summary, and client info
- Created `/payments/[id]` detail page with payment information
  - Status banner with payment amount and date
  - Payment details: amount, fees, net amount
  - Payment method display (card type, last 4)
  - Activity timeline showing payment history
  - Client and gallery information sidebars
  - Refund and receipt actions

### Fixed (Layout Consistency)
- Fixed layout inconsistency in `/galleries/new` page - changed from narrow centered `max-w-2xl` to full-width grid layout matching other pages
- Fixed layout inconsistency in `/clients/new` page - changed from narrow centered to full-width 3-column grid layout
- Fixed layout inconsistency in `/scheduling/new` page - changed from narrow centered to full-width 3-column grid layout
- Fixed layout inconsistency in `/settings/profile` page - changed from narrow centered to full-width 3-column grid layout with sidebar
  - Added Account Status sidebar showing plan, status, and member since date
  - Added Quick Links sidebar with billing, team, and notifications shortcuts
  - Added Danger Zone for account deletion
- All creation forms now use consistent 2/3 + 1/3 grid layout with helpful sidebar content

### Changed (Payments Table)
- Made payment table rows clickable - clicking anywhere on a row navigates to the payment detail page
- Added hover effect on payment description for better click affordance

### Added (Gallery Edit Page)
- Created `/galleries/[id]/edit` page with comprehensive edit form
  - Pre-populated form fields from gallery data
  - Gallery details: name, description, client selection
  - Pricing: price input, access type (public/password)
  - Cover image: display with replace/remove options
  - Settings: toggle switches reflecting current state
  - Status dropdown in sidebar for quick status changes
  - Activity log sidebar showing recent gallery events
  - Danger zone with delete confirmation
  - Demo data for galleries 1, 2, 3, and 5

### Changed (Form Page Sidebars)
- Added helpful Tips sidebar to `/galleries/new` with numbered guidance
- Added Your Stats sidebar showing total galleries, deliveries, and revenue
- Added Recent Clients sidebar with quick access to common clients
- Added Tips sidebar to `/clients/new` with client management best practices
- Added Your Stats sidebar with total clients and revenue overview
- Added Client Industries sidebar showing distribution breakdown
- Added Tips sidebar to `/scheduling/new` with booking best practices
- Added Your Schedule sidebar with weekly/monthly booking counts
- Added Upcoming Bookings sidebar with next scheduled sessions

### Added (Public Gallery View)
- Created `/g/[slug]` customer-facing gallery page
- Branded header with photographer name/logo
- Photo grid with hover effects and favorites
- Pay-to-unlock flow with blurred unpaid photos
- Download buttons for paid galleries
- Demo galleries: abc123 (paid), def456 (unpaid)
- Dark/light theme support based on photographer settings
- Gallery not found error state

### Added (Creation Forms)
- Created `/clients/new` page with comprehensive client form
  - Contact info: first/last name, email, phone
  - Business info: company, industry dropdown, website
  - Address fields: street, suite, city, state, zip
  - Internal notes section
  - Option to create gallery for new client
- Created `/scheduling/new` page with booking form
  - Session details: title, type, client dropdown
  - Date/time pickers with 30-min time slots
  - Location with address and access notes
  - Pricing: session fee and deposit fields
  - Notifications: confirmation email, reminder, calendar sync

### Added (Additional Settings Pages)
- Created `/settings/notifications` page
  - Email notification toggles for all event types
  - Push notification settings with browser enable button
  - Quiet hours configuration
- Created `/settings/integrations` page
  - Connected integrations section (Stripe, Google Calendar)
  - Available integrations grid (QuickBooks, Zapier, Mailchimp, etc.)
  - API access with key management
  - Webhooks configuration section

### Added (Settings Pages)
- Created `/settings/profile` page with personal and business information forms
  - Avatar upload, full name, email, phone fields
  - Business name, website, timezone settings
  - Password change option
- Created `/settings/billing` page with subscription management
  - Current plan display with status and next billing date
  - Usage meters: storage, galleries, clients, team members
  - Plans comparison (Free, Pro, Studio) with upgrade options
  - Payment method management
  - Invoice history with download links
- Created `/settings/team` page with team management
  - Active team members list with roles (Owner, Admin, Member)
  - Pending invitations with resend/revoke options
  - Team seat usage indicator
  - Role permissions matrix table
- Created `/settings/branding` page with gallery customization
  - Logo upload section
  - Color picker with presets (Blue, Purple, Green, Orange, Pink, Teal)
  - Gallery theme selector (Dark/Light)
  - Watermark toggle with position options
  - Custom domain/subdomain configuration
  - Live preview of gallery appearance

### Added (Booking Detail Page)
- Created `/scheduling/[id]` page with comprehensive booking view
- Status banner showing confirmed/pending/completed/cancelled state with countdown
- Schedule section with date, time, and duration
- Location section with address, notes, and Google Maps link
- Session notes with edit capability
- Client info sidebar with contact details and profile link
- Pricing section showing session fee, deposit status, and balance due
- Quick actions: Send reminder, add to calendar, duplicate, cancel
- Demo data for bookings 1, 2, 3, and 4 with sample shoot details

### Added (Client Detail Page)
- Created `/clients/[id]` page with comprehensive client profile
- Stats row: lifetime revenue, total galleries, total payments
- Galleries list with status badges and revenue
- Payment history with paid/pending status indicators
- Client info sidebar with avatar, industry, contact details
- Notes section for client-specific information
- Quick actions: Send email, create invoice, schedule shoot, delete
- Demo data for clients 1, 2, 3, and 5 with related galleries/payments

### Added (Gallery Detail Page)
- Created `/galleries/[id]` page with comprehensive gallery view
- Stats row showing status, revenue, views, and downloads
- Photo grid with hover effects showing filename and delete button
- Sidebar with client info, delivery link management, and quick actions
- Quick actions: Download all, email client, duplicate, delete
- Delivery link section with copy and open buttons
- Demo data for galleries 1, 2, 3, and 5 with sample photos

### Added (Gallery Creation Form)
- Created `/galleries/new` page with comprehensive gallery creation form
- Form sections include:
  - Gallery Details: Name, description, client selection dropdown
  - Pricing: Gallery price input with dollar formatting, access type (public/password protected)
  - Cover Image: Drag-and-drop upload zone (UI only in demo mode)
  - Settings: Toggle switches for downloads, favorites, watermarks, and email notifications
- Client dropdown populated with demo clients for testing
- Form follows design system with proper input styling, focus states, and spacing
- Added demo mode banner explaining form submissions are disabled

### Added (Demo Mode for Production Review)
- Added DEMO_MODE flag to all dashboard pages to allow UI review without database connection
- Dashboard page: Shows sample metrics ($12,475 revenue, 24 galleries, 156 clients), activity feed, and gallery cards
- Galleries page: Displays 8 demo galleries with real estate, corporate, wedding, and event photography examples
- Clients page: Shows 10 sample clients across industries (Real Estate, Wedding, Commercial, Food & Hospitality, etc.)
- Payments page: Displays sample payment history with paid, pending, and overdue statuses
- Scheduling page: Shows upcoming demo bookings with calendar week view and booking cards
- Each page displays a blue "Demo Mode" banner indicating sample data is being shown
- Prisma imports moved to dynamic import pattern to prevent database connection attempts in demo mode

### Added (Navigation Enhancements)
- Added icons to Industries dropdown menu items:
  - Real Estate (home icon)
  - Commercial (briefcase icon)
  - Architecture & Interiors (building icon)
  - Events & Corporate (calendar icon)
  - Headshots & Portraits (person icon)
  - Food & Hospitality (plate icon)
- Added icons to Resources dropdown menu items:
  - Help Center (question mark icon)
  - Blog (document icon)
  - Changelog (clock icon)
  - Roadmap (map icon)
- Updated mobile menu to display icons consistently with desktop dropdowns
- All icons displayed in primary color circular backgrounds matching Features dropdown style

### Changed (Design System - Border Refinements)
- Updated card borders to 0.094rem width with 10% opacity for more visible yet subtle styling
- Changed `--card-border` from `rgba(255, 255, 255, 0.03)` to `rgba(255, 255, 255, 0.10)`
- Changed `--card-border-hover` from `rgba(255, 255, 255, 0.06)` to `rgba(255, 255, 255, 0.16)`
- Added `--card-border-width: 0.094rem` variable for consistent border width
- Updated all general border variables to use 10% opacity:
  - `--border`: now `rgba(255, 255, 255, 0.10)`
  - `--border-subtle`: now `rgba(255, 255, 255, 0.05)`
  - `--border-emphasis`: now `rgba(255, 255, 255, 0.16)`
  - `--border-hover`: now `rgba(255, 255, 255, 0.16)`
  - `--input-border`: now `rgba(255, 255, 255, 0.10)`
  - `--input-border-focus`: now `rgba(255, 255, 255, 0.16)`
- Added `--border-width: 0.094rem` for general use
- Updated `.card`, `.card-interactive`, `.glass`, `.nav-scrolled` utilities to use new border width variable
- Updated `.section-divider` height to use `--card-border-width` for consistency

### Added (Portal Application - Sprint 2)
- Created complete dashboard layout system:
  - `DashboardSidebar` component (`src/components/layout/dashboard-sidebar.tsx`) with navigation, user info, and active state detection
  - `DashboardTopbar` component (`src/components/layout/dashboard-topbar.tsx`) with search, quick actions, and notifications
  - Dashboard layout wrapper (`src/app/(dashboard)/layout.tsx`) combining sidebar + topbar
- Created reusable dashboard components (`src/components/dashboard/`):
  - `StatCard` - Metric display with label, value, and change indicator
  - `ActivityItem` - Activity feed item with icon, text, and timestamp
  - `GalleryCard` - Gallery preview with thumbnail, status, and revenue
  - `PageHeader` - Page title with subtitle and action buttons
- Created dashboard pages with real Prisma data:
  - `/dashboard` - Overview with stats grid, recent galleries, activity feed
  - `/galleries` - Gallery list with filter tabs (All, Delivered, Pending, Draft)
  - `/clients` - Client table with industry badges and revenue
  - `/payments` - Payment history with status filters and summary cards
  - `/scheduling` - Calendar week view with upcoming bookings
  - `/settings` - Settings hub with navigation to profile, billing, team, branding, notifications, integrations
- Added `force-dynamic` export to all database-querying pages for proper SSR
- Updated Prisma client configuration for Accelerate support

### Changed (Landing Page Polish)
- Updated all section eyebrow text from `font-mono` to styled badge design with border and background for visual consistency across:
  - Testimonials section
  - Pricing section
  - How It Works section
  - Security section
  - Integrations section
  - Roadmap section
  - FAQ section
- Updated all section headings to use two-tone typography (secondary color for introductory text, primary color for emphasis) across all sections
- Updated FAQ accordion icons from chevron to plus/minus icons with color state change for better expandability indication
- FAQ expand icons now highlight with primary color when section is open

### Added (Portal Infrastructure - Sprint 1)
- Installed core dependencies: `@clerk/nextjs`, `@prisma/client`, `stripe`, `zod`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `resend`
- Created comprehensive Prisma schema with 25 models:
  - Core: `Organization`, `User`, `OrganizationMember`
  - Clients: `Client`, `ClientSession`
  - Galleries: `Project`, `Asset`, `DeliveryLink`, `GalleryFavorite`, `GalleryComment`
  - Payments: `Payment`
  - Bookings: `BookingType`, `Booking`, `BookingReminder`
  - Invoices: `Invoice`, `InvoiceLineItem`
  - Contracts: `ContractTemplate`, `Contract`, `ContractSigner`, `ContractAuditLog`
  - Activity: `ActivityLog`, `Notification`
  - Usage: `UsageMeter`, `OnboardingProgress`
- Created 10 enums for type safety: `PlanName`, `ProjectStatus`, `PaymentStatus`, `BookingStatus`, `InvoiceStatus`, `ContractStatus`, `ClientIndustry`, `ActivityType`, `NotificationType`, `MemberRole`
- Created database utility (`src/lib/db.ts`) with Prisma singleton pattern
- Created Clerk authentication utilities:
  - `src/lib/auth/clerk.ts` - `getAuthContext()` for organization-scoped auth
  - `src/lib/auth/with-org.ts` - Higher-order functions for API route protection (`withOrganization`, `withAdmin`, `withOwner`)
- Created Clerk middleware (`src/middleware.ts`) with public route matching
- Created comprehensive seed data script (`prisma/seed.ts`) with 50+ realistic records:
  - 3 Organizations (Studio, Pro, Free tiers)
  - 5 Users with organization memberships
  - 15 Clients matching hero demo (Premier Realty, Tech Solutions, etc.)
  - 25 Projects/Galleries with various statuses
  - 23 Payments (paid, pending, overdue)
  - 4 Booking Types and 12 Bookings
  - 10 Invoices with line items
  - 2 Contract Templates and 5 Contracts
  - Activity logs and notifications
- Created environment variables template (`.env.example`) with all required config
- Added database scripts to package.json: `db:generate`, `db:push`, `db:migrate`, `db:seed`, `db:studio`, `db:reset`
- Renamed project from `dovetail-landing` to `photoproos`

### Added (Code Quality & Performance)
- Created shared icons file (`src/components/ui/icons.tsx`) with 9 reusable icon components to reduce duplication across sections
- Added hero-specific CSS animation classes (`hero-animate`, `hero-animate-1` through `hero-animate-6`) for cleaner staggered entry animations
- Added section transition utilities: `section-divider`, `section-fade-in`, `hover-lift`, `stagger-1` through `stagger-6`
- Added `text-shimmer` animation for gradient text effects on hero heading
- Added `section-reveal` animation class for scroll-triggered section animations
- Added section dividers between all major landing page sections for smoother visual flow

### Changed (Performance & Code Cleanup)
- Refactored Hero section to use CSS animation classes instead of inline JavaScript state-based animations (reduced component complexity)
- Updated all page metadata from Dovetail to PhotoProOS branding (title, description, OpenGraph, Twitter cards, icons, manifest)
- Removed unused `isLoaded` state from Hero section - animations now trigger via CSS on mount

### Removed (Dead Code Cleanup)
- Deleted unused legacy section components:
  - `src/components/sections/enterprise.tsx`
  - `src/components/sections/product-showcase.tsx`
  - `src/components/sections/stats.tsx`
  - `src/components/sections/roi-section.tsx`

### Fixed (Layout Stability & Design Consistency)
- Fixed content shifting (CLS) in Hero demo tabs by using fixed height instead of min-height and absolute positioning for demo content
- Fixed content shifting in How It Works section by removing grid-rows animation and using opacity-only transitions for step features
- Fixed content shifting in Testimonials section by adding fixed min-height to quote content area with absolute positioning
- Fixed content shifting in Use Cases section by removing grid-rows animation and using opacity-only transitions for feature lists
- Standardized section header spacing to `mb-12 lg:mb-16` across Features and How It Works sections
- Standardized grid background pattern to 64px with rgba(255,255,255,0.03) across all sections for visual consistency
- Fixed ShimmerButton type error by adding `size` prop support (sm, default, lg) to match GradientButton interface
- Fixed "Coming Soon" badge not displaying on Contracts & E-Sign feature card by adding `badge` prop to FeatureCard component

### Changed (PhotoProOS Rebrand)
- **BREAKING**: Complete content rebrand from Dovetail to PhotoProOS - "The Business OS for Professional Photographers"
- Created new PhotoProOS logo component with dynamic camera aperture design (icon, text, and full variants in sm/md/lg/xl sizes)
- Rewritten Hero section with interactive demo showing Dashboard, Galleries, Clients, and Payments tabs with auto-rotation
- Updated Navbar with PhotoProOS branding, Features dropdown (Client Galleries, Payment Processing, etc.), and Industries dropdown (6 photography verticals)
- Rewritten Features section with 6 core product features: Client Galleries, Payment Processing, Client Management, Workflow Automation, Analytics & Reports, Contracts & E-Sign
- Updated Value Proposition section ("Why PhotoProOS") with before/after visualization showing consolidation from 6 tools to 1 platform
- Created new Pricing section with 4 tiers: Free ($0), Pro ($29/mo), Studio ($79/mo), Enterprise (custom) with annual/monthly toggle
- Created new Use Cases section covering 6 photography verticals: Real Estate, Commercial, Architecture & Interiors, Events & Corporate, Headshots & Portraits, Food & Hospitality
- Created new Roadmap section showing completed, in-progress, upcoming, and planned features with timeline visualization
- Rewritten Testimonials section with 4 photography-focused testimonials including stats badges and progress indicators
- Updated FAQ section with 8 PhotoProOS-specific questions about delivery, payments, security, storage, branding, and contracts
- Rewritten CTA section with photography-focused messaging and stats (47% revenue increase, 15+ hrs saved, 3x faster payments)
- Updated Footer with PhotoProOS branding, newsletter signup, social links (Twitter, Instagram, LinkedIn, YouTube), and photography-focused navigation
- Updated Logos section with photography business stats (2,500+ photographers, 150,000+ galleries, $12M+ payments) and review badges
- Reorganized page.tsx with optimized section flow: Hero → Logos → Value Prop → Features → Use Cases → Pricing → Testimonials → Roadmap → FAQ → CTA → Footer

### Added (Landing Page Enhancements)
- Created new **How It Works** section with interactive 3-step process (Upload, Share, Get Paid) including:
  - Auto-rotating step cards with progress indicators
  - Interactive demo mockups for each step
  - Feature badges for each step
  - Browser chrome simulation for realistic demo preview
- Created new **Integrations** section showcasing 8 popular integrations:
  - Stripe, Adobe Lightroom, Google Drive, Dropbox, Calendly, Mailchimp, QuickBooks, Zapier
  - Category filtering (Payments, Editing, Storage, Marketing, Calendar)
  - "Popular" badges for most-used integrations
  - API documentation link
- Created new **Security & Trust** section featuring:
  - 6 security features with icons (256-bit SSL, SOC 2, GDPR, 99.9% Uptime, Backups, 2FA)
  - Certification badges (SOC 2 Type II, GDPR, CCPA, ISO 27001)
  - Trust stats (0 data breaches, 99.9% uptime, 24/7 monitoring)
  - Trust banner with data ownership guarantees
- Enhanced **Pricing** section with feature comparison table:
  - 14 feature rows comparing Free, Pro, Studio, Enterprise
  - Check/X icons for boolean features
  - Text values for limits and descriptions
  - Responsive horizontal scroll on mobile
- Added `animate-progress-bar` CSS animation for step indicators

### Changed (Design System v4.1.0)
- **BREAKING**: Updated muted text color from `#7C7C7C` to `#8b8b8b` for WCAG AA compliance (5.1:1 contrast ratio)
- **BREAKING**: Updated secondary text color from `#A7A7A7` to `#a3a3a3` for improved consistency
- Upgraded Lumos Design System from v4.0.0 to v4.1.0 with comprehensive token restructuring
- Replaced all hardcoded hex colors in Button, Badge, Input, Textarea, Navbar, Hero, Features, FAQ, Footer, Enterprise, Product Showcase, Noise-to-Knowledge, ROI Section, Testimonials, Stats, CTA, Logos, ScrollProgress, GradientButton, ShimmerButton, PulseButton, and OptimizedImage components with CSS variables
- Standardized transition durations using `--duration-fast`, `--duration-base`, `--duration-slow` tokens
- Standardized border radius using `--button-radius`, `--input-radius`, `--badge-radius` component tokens
- Improved hover states to use `--background-hover` and `--ghost-hover` semantic tokens

### Added (Design System)
- New primitive color tokens: `--blue-400`, `--green-400`, `--orange-400`, `--red-400`, `--purple-400`, `--yellow-500`, `--yellow-400`
- New semantic tokens for interactive states: `--primary-active`, `--secondary-active`, `--ghost-hover`, `--ghost-active`
- New background tokens: `--background-selected` for selected state styling
- New border tokens: `--input-border`, `--input-border-focus` for form elements
- New focus tokens: `--focus-ring`, `--focus-ring-inset`, `--shadow-focus` for accessible focus states
- New status text tokens: `--success-text`, `--warning-text`, `--error-text`, `--ai-text` (AA compliant on dark backgrounds)
- Comprehensive typography scale: `--text-xs` through `--text-8xl` with corresponding line heights
- Font weight tokens: `--font-normal`, `--font-medium`, `--font-semibold`, `--font-bold`
- Letter spacing tokens: `--tracking-tighter` through `--tracking-widest`
- Extended spacing scale with half-step values: `--space-0-5`, `--space-1-5`, `--space-2-5`, etc.
- New transition tokens: `--duration-instant`, `--duration-slower`, `--ease-spring`
- Component-specific tokens: `--card-radius`, `--button-radius`, `--input-radius`, `--badge-radius`
- Accessibility token: `--touch-target-min` (44px) for minimum touch target size
- New z-index token: `--z-toast` for toast notifications

### Fixed (Accessibility)
- Fixed color contrast ratio for muted text to meet WCAG AA 4.5:1 requirement
- Added `aria-hidden="true"` to all decorative SVG icons in Navbar (ChevronDown, ChevronRight, Menu, Close)
- Added `aria-hidden="true"` to all decorative SVG icons in Hero (ArrowRight, Star, ShieldCheck)
- Added `aria-hidden="true"` to Hero visualization SVG with `role="presentation"`
- Added `aria-hidden="true"` to Dovetail logo SVG in Footer
- Added `aria-hidden="true"` to decorative icon wrappers in Input component
- Added `aria-hidden="true"` to all decorative SVG icons in Features (ArrowRight, Doc, Bot, Puzzle, etc.)
- Added `aria-hidden="true"` to chevron icon wrapper and icon in FAQ accordion
- Added `aria-hidden="true"` to social media icons in Footer (Twitter, LinkedIn, YouTube, Arrow)
- Added `aria-hidden="true"` to DovetailLogoLarge in Noise-to-Knowledge section
- Added `aria-hidden="true"` to ArrowIcon in ROI section
- Added `aria-hidden="true"` to company logos in Testimonials section (Breville, Canva, Atlassian)
- Added `aria-hidden="true"` to CheckIcon in CTA section
- Added `aria-hidden="true"` to all decorative icons in Enterprise section (ShieldIcon, CheckIcon)
- Added `aria-hidden="true"` to all decorative icons in Product Showcase section (SparklesIcon, ChartIcon, SearchIcon, DocIcon, TrendIcon)
- Added `aria-hidden="true"` to ChevronUpIcon in BackToTop component
- Added `aria-invalid` and `aria-describedby` attributes to Input and Textarea for error states
- Added `role="alert"` to error messages in form components
- Added `aria-controls` to mobile menu button linking to menu element
- Added `role="dialog"` and `aria-modal="true"` to mobile menu overlay
- Added `aria-label` to star rating container for screen readers
- Improved focus ring styling using semantic `--ring` and `--ring-offset` tokens
- Added `motion-reduce:transition-none` and `motion-reduce:transform-none` classes to all animated elements

### Changed (Components)
- Button component now uses semantic color tokens instead of hardcoded hex values
- Button component now includes `motion-reduce:transform-none` and `motion-reduce:transition-none` for reduced motion support
- Badge component now uses semantic tokens for all color variants
- Badge component sizes now use consistent height values (h-4, h-5, h-6)
- Input/Textarea components now use semantic tokens for borders, backgrounds, and text colors
- Navbar dropdowns now use `--card-border` and `--background-secondary` tokens
- Hero section now uses semantic tokens for all colors and backgrounds
- Features section cards now use `--card`, `--card-border`, `--border-hover` semantic tokens
- Features section icon backgrounds now use `--background-elevated` token
- FAQ section accordion now uses `--card-border`, `--background-elevated`, `--background-hover` tokens
- FAQ section text now uses `text-foreground-secondary` and `text-foreground-muted` classes
- Footer section now uses semantic tokens for borders, backgrounds, and text colors
- Footer badges now use `--badge-radius` and `--border` tokens
- Social links in Footer now use semantic color tokens with reduced motion support
- All navigation links now use consistent token-based styling
- Enterprise section now uses `--card`, `--card-border`, `--background-elevated` semantic tokens
- Enterprise section security certifications use `--background-hover` and semantic text colors
- Product Showcase section dashboard mockup uses `--card`, `--card-border`, `--background-secondary` tokens
- Product Showcase section bar chart tooltips use semantic tokens for backgrounds and text
- Noise-to-Knowledge section DataCard components use `--card`, `--card-border`, `--background-elevated` tokens
- Noise-to-Knowledge section benefit list uses `text-foreground`, `text-foreground-secondary`, `text-foreground-muted`
- ROI Section stat card uses `--card`, `--card-border`, `--border-hover` semantic tokens
- ROI Section navigation and progress indicators use `--border-visible` and semantic text colors
- Testimonials section quote and author info use `text-foreground` and `text-foreground-muted`
- Testimonials section navigation uses `--border-visible` semantic token
- Stats section uses `--card-border` and `--background` semantic tokens
- CTA section uses `text-foreground`, `text-foreground-secondary`, `text-foreground-muted` semantic classes
- Logos section uses `--card-border`, `--background` semantic tokens for borders and backgrounds
- BackToTop component uses `--background-elevated`, `--card-border`, `--background-hover`, `--border-hover`, `--ring` tokens
- BackToTop component includes `motion-reduce:transition-none` and `motion-reduce:transform-none`
- GradientButton component uses `--background`, `--background-secondary`, `--ring` semantic tokens
- GradientButton outline variant uses semantic tokens for focus states
- ShimmerButton uses `bg-foreground` and `text-[var(--background)]` for proper theming
- PulseButton uses `--primary`, `--primary-hover` semantic tokens
- CardSkeleton uses `--card-border`, `--card` semantic tokens
- Footer links and legal links now use `text-foreground` and `hover:text-foreground` instead of `text-white`

### Added (Animations)
- Enhanced hover animations for FeatureShowcase cards with lift effect (`hover:-translate-y-1 hover:scale-[1.01]`), gradient glow overlay, and improved image scaling
- Enhanced hover animations for FeatureCard components with lift effect, gradient glow overlay, and icon scale animations
- Floating animation for DataCard components in Noise-to-Knowledge section with staggered delays (0-1250ms)
- Pulse glow animation (`animate-pulse-glow-orange`) for center insight card in knowledge visualization
- Hover scale and shadow effects on all DataCard variants
- All new animations include `motion-reduce:animate-none` and `motion-reduce:transform-none` for accessibility

### Added
- `ScrollProgress` component with customizable gradient color and height for reading progress indication
- `BackToTop` floating button with smooth scroll and visibility threshold
- `TiltCard` component with 3D perspective tilt effect, glare overlay, and configurable tilt angles
- `Typewriter` component for typing animation effect with cursor and loop support
- `SplitText` component for staggered word/character reveal animations
- `AnimatedGradientText` component for animated gradient text effects
- `TextReveal` component for slide-up text reveal animations
- `Marquee` and `VerticalMarquee` components for infinite scrolling content strips
- `useMousePosition` hook for tracking mouse coordinates
- `useCursorSpotlight` hook for radial gradient spotlight following cursor
- `useFocusTrap` hook for trapping focus within modals/dialogs
- `useRestoreFocus` hook for returning focus after modal close
- `useModalFocus` combined hook for complete modal focus management
- CSS `.link-underline` class for animated slide-in underline effect on hover
- CSS `.text-highlight` class for animated background highlight on hover
- CSS `.ripple` class for button ripple click effects
- CSS `.text-glow` and `.border-glow` classes for glow effects
- CSS `.animate-glow` keyframe animation
- `GradientButton` component with animated gradient border on hover
- `ShimmerButton` component with shine effect on hover
- `PulseButton` component with glow pulse animation
- CSS animations for gradient buttons (`.animate-gradient-border`, `.animate-gradient-bg`, `.shimmer-container`)
- Skip to main content link for keyboard/screen reader accessibility
- Keyboard navigation for dropdown menus with arrow key support (ArrowUp, ArrowDown, Escape, Enter)
- Parallax scrolling effect in hero section for grid background and geometric visualization
- Navbar blur/transparency effect on scroll with smooth transition
- Smooth number counting animation for ROI section stats with easing
- Custom `useCountAnimation` hook for animated number displays
- Custom `useParallax` hook for scroll-based parallax effects
- Shimmer loading effect CSS classes for image loading states
- `OptimizedImage` component with shimmer loading animation
- `Skeleton`, `CardSkeleton`, `AvatarSkeleton`, and `TextBlockSkeleton` components for loading states
- ARIA attributes for dropdown menus (aria-expanded, aria-haspopup, role="menu", role="menuitem")
- Focus ring styles for dropdown trigger buttons
- Gradient text utilities (`.text-gradient`, `.text-gradient-primary`, `.text-gradient-rainbow`)
- Pure CSS tooltip system with hover animations
- `MagneticButton` component with cursor-following effect for prominent CTAs
- `Input` and `Textarea` components with animated focus states and labels
- `Badge` component with multiple variants (default, primary, success, warning, error, ai, new, beta)
- `PageTransitionProvider` and `AnimatedPage` components for smooth page transitions
- Stagger animation delay classes (`.stagger-1` through `.stagger-8`)
- Tooltips for social media icons in footer ("Follow us on X", "Connect on LinkedIn", "Watch on YouTube")
- Social icon hover scale effect (110%)

### Changed
- Testimonials section now features smooth directional slide animations with scale and opacity transitions
- CTA section now uses `ShimmerButton` and `GradientButton` for enhanced visual appeal
- Navbar now has glass-morphism effect when scrolled (background blur + semi-transparent background)
- Dropdown items now support keyboard focus states with visual ring indicator
- ROI section stats now animate with counting effect when scrolled into view
- Improved accessibility with proper tabIndex handling in dropdown items
- CTA section now uses `MagneticButton` for primary actions
- FAQ accordion items now have proper ARIA attributes (aria-controls, role="region", aria-labelledby)
- FAQ chevron icon now animates color on open/close state
- FAQ items have improved group hover states

### Added (Previous)
- Button micro-interactions with hover scale (1.02x) and press feedback (0.98x)
- Card hover effects with elevation (translateY, shadow) and optional interactive variant
- Reduced motion support for all new animations
- Scroll entrance animations for all major sections (hero, logos, noise-to-knowledge, product-showcase, features, ROI, testimonials, enterprise, CTA, FAQ)
- Custom `useScrollAnimation` hook with Intersection Observer for triggering animations on scroll
- `ScrollReveal` and `StaggerContainer` reusable components for scroll-triggered animations
- Mobile navigation menu with full-screen overlay, section-based navigation, and smooth animations
- Hamburger/close icon toggle for mobile menu
- Body scroll lock when mobile menu is open
- Comprehensive SEO meta tags including:
  - Title templates for consistent page titles
  - Enhanced OpenGraph and Twitter Card metadata
  - Structured keywords array
  - Robot directives for search engines
  - Viewport configuration with theme color
  - Favicon and Apple touch icon configuration
  - Web app manifest link
  - Font preconnect headers

### Changed
- Improved focus ring styling with 2px ring, 2px offset, and proper dark mode contrast
- Enhanced Button component with visible focus states using focus-visible:ring-2
- Outline button now shows enhanced border on hover (0.24 → 0.4 opacity)
- Default button now has subtle shadow that increases on hover
- Hero section now has staggered entrance animation on page load
- Logos section logos animate in with staggered delays
- Product showcase dashboard and feature cards animate in on scroll
- Features section cards animate in sequentially
- ROI section stats and graph animate in with staggered timing
- Testimonials section animates in when scrolled into view
- Enterprise section header and certifications animate in with staggered timing
- Noise-to-knowledge benefits list items animate in on scroll
- CTA section content animates in with staggered timing
- FAQ section header and questions animate in on scroll
- Mobile menu button now toggles a full overlay menu instead of linking to /menu
- Enhanced layout.tsx with comprehensive SEO configuration

### Added (Previous)
- Initial Next.js 15.5.9 project setup with TypeScript
- Integrated Lumos Design System v4.0 (Dovetail-inspired tokens and styles)
- Tailwind CSS configuration with custom design tokens
- Core UI components:
  - Button component with variants (default, secondary, ghost, outline, link)
- Layout components:
  - Navbar with responsive mobile menu and dropdown menus for Product/Resources
  - Footer with multi-column links, social icons, and Explore Outlier featured article
- Landing page sections:
  - Hero section with grid background, geometric data visualization SVG, announcement badge and CTA buttons
  - Logos section with real company SVG logos (AWS, Atlassian, Deloitte, Okta, Canva, Shopify, Intel, Breville, Notion, Lovable)
  - "From noise to knowledge" section with animated knowledge flow visualization and benefit bullet points
  - Product showcase section with interactive dashboard mockup, bar chart visualization, and feature cards
  - Features section with product screenshot showcases (AI Analysis, Chat and Search, Dashboards) and icon-based cards
  - ROI section with 2.3x return stats, animated graph visualization, and Forrester study link
  - Testimonials section with carousel navigation, company logos (Breville, Canva, Atlassian), and author details
  - Enterprise "Single source of truth" section with security certifications (SOC 2, HIPAA, ISO 27001, etc.) and feature visualizations
  - CTA section for conversion
  - FAQ section with accordion-style questions and answers
- Product images in public/images folder (AI_Analysis.png, Chat_and_Search.png, Dashboards.png, Docs.png, hero images, testimonial avatars)
- Real SVG company logos in public/logos folder (AWS, Atlassian, Breville, Canva, Shopify, Notion, Lovable)
- Animated SVG visualizations throughout (hero, ROI graph, knowledge flow)
- Global styles with dark-first design approach
- Responsive design for mobile, tablet, and desktop
- Accessibility features including focus states and semantic HTML

### Changed
- Updated navbar with hover-based dropdown menus for Product and Resources
- Enhanced hero section with grid background pattern and geometric visualization
- Improved features section layout with featured product screenshot cards
- Redesigned testimonials section with carousel-style navigation and company branding
- Updated enterprise section with "Single source of truth" messaging and certification badges
- Enhanced footer with "Explore Outlier" featured article section
- Added Cookie preferences button and Trust Center link to footer legal links
- Updated logos section to use actual SVG logo files with Image component
- Updated features section to use PNG product screenshots
- Updated footer Explore Outlier section with real article image
- Made ROI section tabs fully interactive with 4 different stats (ROI, Time Saved, Faster Decisions, Team Adoption)
- Made "From noise to knowledge" benefits list interactive with expandable descriptions
- Testimonials section now switches content based on active tab selection
- Added auto-cycling to testimonials section (6s interval) with animated progress indicator and pause on hover
- Added auto-cycling to ROI stats section (5s interval) with progress bar and pause on interaction
- Enhanced product showcase bar chart with hover tooltips, animated bar loading, and scale effects
- Enhanced CTA section with animated gradient background, grid pattern, and trust indicators
- Added comprehensive CSS animations (numberPop, pulseSlow, float, drawLine, glowPulse, gradientShift)
- Added reduced motion support for accessibility (@media prefers-reduced-motion)
