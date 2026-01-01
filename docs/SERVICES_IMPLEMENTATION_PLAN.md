# Services Implementation Plan

## Overview

This document outlines the implementation plan for a comprehensive Services Management System in PhotoProOS (Dovetail). Services are the pricing packages photographers offer to clients, and this feature will allow full CRUD operations, database persistence, and integration with galleries and bookings.

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
/galleries                  → Galleries tab (default)
/galleries?tab=services     → Services tab
/galleries/services         → Services list (alternate route)
/galleries/services/new     → Create new service
/galleries/services/[id]    → Edit service
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
├── app/(dashboard)/galleries/
│   ├── page.tsx                    # Add tab navigation (Galleries | Services)
│   ├── services/
│   │   ├── page.tsx                # Services list page
│   │   ├── new/
│   │   │   └── page.tsx            # Create service page
│   │   └── [id]/
│   │       └── page.tsx            # Edit service page
│   ├── services-tab.tsx            # Services tab content component
│   └── services-list-client.tsx    # Client component for services list
├── components/dashboard/
│   ├── service-selector.tsx        # Updated with DB integration
│   ├── service-form.tsx            # Full-page service form
│   └── service-card.tsx            # Service display card
├── lib/
│   ├── services.ts                 # Keep as fallback/defaults
│   ├── actions/
│   │   └── services.ts             # Server actions
│   └── validations/
│       └── services.ts             # Zod schemas
└── prisma/
    └── schema.prisma               # Updated with Service model
```

---

## Implementation Order

### Sprint 1: Foundation (Current)
1. ✅ Create this implementation plan
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
┌─────────────────────────────────────┐
│  ┌──────┐  Real Estate              │
│  │ $450 │  Luxury Property Package  │
│  └──────┘                           │
│  Premium photography for high-end   │
│  properties with drone & twilight   │
│                                     │
│  ✓ 40-60 edited photos             │
│  ✓ Twilight shots                  │
│  ✓ Drone aerials                   │
│  ✓ Virtual tour                    │
│                                     │
│  2-3 hours  •  Used in 12 galleries │
│                          [⋮] Menu   │
└─────────────────────────────────────┘
```

### Service Row Design (Table View)

| Name | Category | Price | Duration | Galleries | Bookings | Status | Actions |
|------|----------|-------|----------|-----------|----------|--------|---------|
| Luxury Property | Real Estate | $450 | 2-3 hrs | 12 | 3 | Active | ⋮ |

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
