# Real Estate & Property Module

## Overview

The Real Estate module is the default and most comprehensive industry option in PhotoProOS. It includes specialized features for property photography including MLS integration, property details auto-population, and real estate-specific gallery templates.

---

## Module ID

```
real_estate
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Photo delivery with pay-to-unlock | Enabled |
| Scheduling | Booking calendar with travel time | Enabled |
| Invoices | Billing and payment collection | Enabled |
| Clients | Contact management (agents, brokers) | Enabled |
| Services | Package definitions with pricing | Enabled |
| Properties | Property database with details | Enabled |
| Travel Calculations | Mileage-based pricing | Enabled |
| Weather Integration | Shoot day forecasts | Enabled |

---

## Unique Features

### 1. Property Database

Store and manage property details:

```typescript
interface Property {
  id: string;
  address: string;
  mlsNumber?: string;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  listingPrice?: number;
  listingAgent?: Client;
  features: string[];
}

type PropertyType =
  | "single_family"
  | "condo"
  | "townhouse"
  | "multi_family"
  | "land"
  | "commercial";
```

### 2. MLS Integration (Future)

- Auto-populate property details from MLS number
- Sync listing status
- Pull comparable properties

### 3. Real Estate Gallery Templates

Pre-built gallery layouts optimized for:
- Front exterior hero shot
- Room-by-room organization
- Virtual tour embed
- Floor plan section
- Drone/aerial section

### 4. Agent/Broker Client Types

```typescript
interface RealEstateClient extends Client {
  clientType: "agent" | "broker" | "team" | "brokerage";
  license?: string;
  brokerage?: string;
  preferredTurnaround?: number; // hours
}
```

### 5. Package Suggestions

Based on property square footage:

| Sq Ft | Suggested Package |
|-------|-------------------|
| < 1,500 | Basic (15-20 photos) |
| 1,500 - 3,000 | Standard (25-35 photos) |
| 3,000 - 5,000 | Premium (40-50 photos) |
| > 5,000 | Luxury (50+ photos) |

---

## Service Templates

Pre-configured services for real estate photography:

### Basic Package
```typescript
{
  name: "Basic Photography",
  description: "Perfect for smaller properties",
  basePrice: 15000, // $150
  estimatedDuration: 60,
  deliverables: ["15-20 edited photos", "24-hour turnaround"],
  propertySize: "< 1,500 sq ft"
}
```

### Standard Package
```typescript
{
  name: "Standard Photography",
  description: "Our most popular package",
  basePrice: 22500, // $225
  estimatedDuration: 90,
  deliverables: ["25-35 edited photos", "24-hour turnaround", "Twilight shot"],
  propertySize: "1,500 - 3,000 sq ft"
}
```

### Premium Package
```typescript
{
  name: "Premium Photography",
  description: "Comprehensive coverage for larger homes",
  basePrice: 35000, // $350
  estimatedDuration: 120,
  deliverables: ["40-50 edited photos", "Same-day turnaround", "Twilight shot", "Drone aerial"],
  propertySize: "3,000 - 5,000 sq ft"
}
```

### Luxury Package
```typescript
{
  name: "Luxury Photography",
  description: "Full-service for luxury properties",
  basePrice: 55000, // $550
  estimatedDuration: 180,
  deliverables: ["50+ edited photos", "Same-day turnaround", "Twilight series", "Drone video", "Virtual tour"],
  propertySize: "> 5,000 sq ft"
}
```

### Add-On Services
- Drone/Aerial Photography: $100
- Twilight Photography: $75
- Virtual Tour (Matterport): $150
- Floor Plans: $75
- Video Walkthrough: $200

---

## Booking Flow Customizations

### Step 1: Client Selection
- Show agent's recent properties
- Option to add new listing

### Step 2: Property Details
- Address autocomplete
- Property type selection
- Auto-fetch details if MLS provided
- Square footage for package recommendation

### Step 3: Service Selection
- Package recommendation based on sq ft
- Add-on upsells
- Travel fee calculation

### Step 4: Scheduling
- Weather forecast display
- Golden hour recommendations
- Agent availability check

---

## Gallery Customizations

### Real Estate Gallery Layout

```typescript
interface RealEstateGallerySection {
  id: string;
  title: string;
  order: number;
  photos: Photo[];
}

const defaultSections: RealEstateGallerySection[] = [
  { id: "exterior", title: "Exterior", order: 1 },
  { id: "living", title: "Living Areas", order: 2 },
  { id: "kitchen", title: "Kitchen & Dining", order: 3 },
  { id: "bedrooms", title: "Bedrooms", order: 4 },
  { id: "bathrooms", title: "Bathrooms", order: 5 },
  { id: "outdoor", title: "Outdoor Spaces", order: 6 },
  { id: "aerial", title: "Aerial Views", order: 7 },
];
```

### MLS-Ready Export

- Automatic resize to MLS specs
- Watermark removal for paid galleries
- ZIP download with MLS-compliant naming

---

## Invoice Customizations

### Line Item Types
- Photography package
- Add-on services
- Travel fee (auto-calculated)
- Rush delivery fee
- Reshoots

### Payment Terms
- Default: Due on delivery
- Option: Pay before unlock
- Split payment: 50% deposit

---

## Settings (Module-Specific)

Located at `/settings/real-estate`:

| Setting | Description | Default |
|---------|-------------|---------|
| Default turnaround | Hours after shoot | 24 |
| Travel fee per mile | Cents per mile | 65 |
| Free travel radius | Miles | 15 |
| Auto-suggest packages | Based on sq ft | true |
| MLS export size | Pixels (long edge) | 3000 |
| Watermark on previews | Enable/disable | true |

---

## Dashboard Widgets

### Recent Properties
- Last 5 properties photographed
- Quick link to gallery
- Status indicator

### Agent Performance
- Top agents by booking count
- Revenue by agent
- Average turnaround time

### Upcoming Shoots
- Weather forecast
- Travel time
- Property details preview

---

## Integration Points

### External Integrations (Future)
- MLS systems (IDX)
- Real estate CRMs (Follow Up Boss, kvCORE)
- Scheduling tools (Calendly, ShowingTime)

### Internal Integrations
- Google Maps for travel
- Weather API for forecasts
- Stripe for payments

---

## Implementation Checklist

### Phase 1: Core Features
- [x] Property database model
- [x] Property CRUD actions
- [x] Property list page
- [x] Property detail page
- [ ] Property form with address autocomplete

### Phase 2: Booking Integration
- [ ] Package suggestion engine
- [ ] Travel fee calculation
- [ ] Weather forecast display
- [ ] Property selection in booking

### Phase 3: Gallery Features
- [ ] Section-based organization
- [ ] MLS export functionality
- [ ] Property details in gallery view

### Phase 4: Advanced Features
- [ ] MLS auto-population
- [ ] Agent performance analytics
- [ ] Bulk property import

---

## API Reference

### Server Actions

```typescript
// Properties
createProperty(data: CreatePropertyInput): Promise<Property>
updateProperty(id: string, data: UpdatePropertyInput): Promise<Property>
deleteProperty(id: string): Promise<void>
getPropertyByAddress(address: string): Promise<Property | null>
suggestPackage(squareFeet: number): Promise<Service>

// MLS Integration
fetchMlsDetails(mlsNumber: string): Promise<PropertyDetails>
syncMlsStatus(propertyId: string): Promise<void>
```

### Types

```typescript
// src/lib/types/real-estate.ts

export interface Property {
  id: string;
  organizationId: string;
  address: string;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  mlsNumber?: string;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number;
  yearBuilt?: number;
  listingPrice?: number;
  listingAgentId?: string;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyType =
  | "single_family"
  | "condo"
  | "townhouse"
  | "multi_family"
  | "land"
  | "commercial";
```

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Travel & Location System](./docs/travel-system.md) - Travel fee calculations
- [Weather Integration](./docs/weather-integration.md) - Forecast features
