# Food & Hospitality Module

## Overview

The Food module is designed for photographers specializing in restaurant photography, menu shoots, culinary content, and hospitality marketing. Features include licensing management, recipe/menu organization, and seasonal campaign tracking.

---

## Module ID

```
food
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Menu and cuisine galleries | Enabled |
| Scheduling | Restaurant-friendly booking | Enabled |
| Invoices | Per-image and day rate pricing | Enabled |
| Clients | Restaurant/brand management | Enabled |
| Services | Food photography packages | Enabled |
| Licensing | Usage rights management | Enabled |
| Menu Organization | Dish-based image tagging | Enabled |

---

## Unique Features

### 1. Restaurant Client Model

```typescript
interface RestaurantClient extends Client {
  type: "restaurant" | "brand" | "agency";
  businessName: string;
  cuisineType?: string[];          // ["Italian", "Seafood"]
  locations?: RestaurantLocation[];
  contacts: RestaurantContact[];
  brandGuidelines?: string;        // URL or notes
  preferredStylist?: string;
  dietaryFocus?: string[];         // ["Vegan", "Gluten-Free"]
}

interface RestaurantLocation {
  id: string;
  name: string;                    // "Downtown Location"
  address: string;
  isMainLocation: boolean;
  shootHistory?: Booking[];
}

interface RestaurantContact {
  id: string;
  name: string;
  role: "owner" | "manager" | "marketing" | "chef" | "other";
  email: string;
  phone?: string;
  isPrimary: boolean;
}
```

### 2. Menu/Dish Organization

Organize images by menu items:

```typescript
interface DishCatalog {
  id: string;
  clientId: string;
  dishes: Dish[];
}

interface Dish {
  id: string;
  name: string;
  category: string;                // "Appetizers", "Entrees", "Desserts"
  description?: string;
  price?: number;
  dietary?: string[];              // ["Vegetarian", "GF"]
  photos: DishPhoto[];
  isActive: boolean;               // On current menu
  seasonalAvailability?: string[]; // ["Spring", "Summer"]
}

interface DishPhoto {
  id: string;
  photoId: string;                 // Gallery photo reference
  angle: "hero" | "overhead" | "45_degree" | "detail" | "lifestyle";
  usage: PhotoUsage[];
  shotDate: Date;
  expiresAt?: Date;                // License expiration
}

type PhotoUsage = "menu" | "website" | "social" | "advertising" | "print" | "packaging";
```

### 3. Licensing & Usage Rights

```typescript
interface FoodLicense {
  id: string;
  clientId: string;
  photoIds: string[];
  type: "limited" | "unlimited" | "exclusive";
  usageRights: UsageRight[];
  territory: "local" | "regional" | "national" | "worldwide";
  duration: {
    type: "fixed" | "perpetual";
    startDate: Date;
    endDate?: Date;
  };
  price: number;
  renewalTerms?: string;
}

interface UsageRight {
  type: PhotoUsage;
  channels: string[];              // ["Instagram", "Facebook", "Website"]
  restrictions?: string;
}
```

### 4. Seasonal Campaign Tracking

```typescript
interface SeasonalCampaign {
  id: string;
  clientId: string;
  name: string;                    // "Summer Menu Launch"
  season: "spring" | "summer" | "fall" | "winter" | "holiday";
  year: number;
  dishes: string[];                // Dish IDs
  deliverables: CampaignDeliverable[];
  deadline: Date;
  status: "planning" | "shooting" | "editing" | "delivered";
}

interface CampaignDeliverable {
  id: string;
  type: "hero_shot" | "menu_images" | "social_set" | "advertising" | "website";
  specifications: string;
  quantity: number;
  status: "pending" | "shot" | "edited" | "approved";
}
```

---

## Service Templates

### Restaurant Packages

```typescript
// Menu Shoot
{
  name: "Menu Photography",
  description: "Complete menu documentation",
  basePrice: 150000, // $1,500
  estimatedDuration: 480, // Full day
  deliverables: ["Up to 25 dishes", "Hero + alternate angles", "Web resolution"],
  includes: ["Basic styling", "Natural light setup"]
}

// Social Media Content
{
  name: "Social Content Package",
  description: "Instagram/social ready images",
  basePrice: 75000, // $750
  estimatedDuration: 240, // Half day
  deliverables: ["15-20 images", "Square + vertical crops", "Color graded"],
  includes: ["Multiple angles", "Detail shots", "Behind-the-scenes"]
}

// Brand Campaign
{
  name: "Brand Campaign",
  description: "Advertising and marketing imagery",
  basePrice: 300000, // $3,000
  estimatedDuration: 480,
  deliverables: ["10-15 hero images", "Full usage rights", "High resolution"],
  includes: ["Professional styling", "Props sourcing", "Multiple setups"]
}
```

### Per-Image Pricing

```typescript
// Single Dish
{
  name: "Single Dish Photography",
  description: "Individual dish with hero angle",
  basePrice: 7500, // $75
  estimatedDuration: 15,
  deliverables: ["1 hero image", "1 alternate angle"],
  volumeDiscounts: [
    { quantity: 10, discount: 10 },
    { quantity: 20, discount: 15 },
    { quantity: 30, discount: 20 }
  ]
}

// Recipe Development
{
  name: "Recipe Step Photography",
  description: "Step-by-step cooking process",
  basePrice: 20000, // $200
  estimatedDuration: 60,
  deliverables: ["8-12 process shots", "Final plated hero"],
}
```

### Day Rates

```typescript
// Full Day
{
  name: "Full Day Rate",
  description: "8 hours on location",
  basePrice: 200000, // $2,000
  estimatedDuration: 480,
  deliverables: ["All images from session", "Basic editing"],
  additionalHourRate: 30000 // $300/hr
}

// Half Day
{
  name: "Half Day Rate",
  description: "4 hours on location",
  basePrice: 120000, // $1,200
  estimatedDuration: 240,
  additionalHourRate: 35000 // $350/hr
}
```

---

## Booking Flow Customizations

### Step 1: Client/Location Selection
- Restaurant name
- Which location (if multiple)
- Contact person

### Step 2: Project Type
- Menu update
- New restaurant opening
- Seasonal refresh
- Social media content
- Advertising campaign

### Step 3: Dish Planning
- Number of dishes
- Dish list (if known)
- Special requirements
- Dietary highlights

### Step 4: Styling & Props
- In-house styling vs photographer-provided
- Prop preferences
- Brand guidelines reference

### Step 5: Licensing
- Usage needs
- Duration
- Territory
- Pricing impact

---

## Gallery Customizations

### Food Gallery Organization

```typescript
interface FoodGallerySection {
  id: string;
  type: "category" | "dish" | "campaign";
  name: string;
  photos: Photo[];
  metadata?: {
    dishId?: string;
    category?: string;
    campaign?: string;
  };
}

const defaultSections = [
  { type: "category", name: "Appetizers" },
  { type: "category", name: "Entrees" },
  { type: "category", name: "Desserts" },
  { type: "category", name: "Beverages" },
  { type: "category", name: "Ambiance" },
];
```

### Image Tagging

```typescript
interface FoodPhotoMetadata {
  photoId: string;
  dishId?: string;
  dishName?: string;
  ingredients?: string[];
  dietary?: string[];
  angle?: string;
  lighting?: string;
  styling?: string;
  props?: string[];
}
```

### Usage Tracking

```typescript
interface PhotoUsageLog {
  photoId: string;
  usedAt: Date;
  platform: string;
  campaign?: string;
  screenshot?: string;
  notes?: string;
}
```

---

## Invoice Customizations

### Food Photography Line Items
- Day/half-day rate
- Per-dish pricing
- Styling fee
- Props expense
- Travel/location fee
- Licensing fee (by usage type)
- Rush delivery

### Licensing Add-Ons

```typescript
const licensingOptions = [
  { type: "website", label: "Website Use", price: 0 },           // Included
  { type: "social", label: "Social Media", price: 0 },           // Included
  { type: "menu_print", label: "Printed Menu", price: 10000 },   // $100
  { type: "advertising", label: "Advertising", price: 25000 },   // $250
  { type: "packaging", label: "Packaging", price: 50000 },       // $500
  { type: "exclusive", label: "Exclusive Rights", price: 100000 }, // $1,000
];
```

---

## Settings (Module-Specific)

Located at `/settings/food`:

| Setting | Description | Default |
|---------|-------------|---------|
| Default license type | For new galleries | limited |
| Include web + social | In base pricing | true |
| Per-dish rate | Default price | $75 |
| Day rate | Full day price | $2,000 |
| Styling included | In base packages | false |
| License duration | Default term | 1 year |
| Auto-track usage | Monitor platforms | false |

---

## Dashboard Widgets

### Active Campaigns
- Current seasonal shoots
- Deadline countdowns
- Deliverable status

### Client Menu Status
- Dishes photographed
- Expiring licenses
- Re-shoot candidates

### Revenue Breakdown
- By client
- By service type
- Licensing vs session fees

---

## Implementation Checklist

### Phase 1: Restaurant Clients
- [ ] Restaurant client type
- [ ] Multi-location support
- [ ] Contact role management
- [ ] Brand guidelines storage

### Phase 2: Dish Catalog
- [ ] Dish database model
- [ ] Menu organization UI
- [ ] Photo-to-dish linking
- [ ] Dietary tagging

### Phase 3: Licensing
- [ ] License terms builder
- [ ] Usage rights selection
- [ ] License pricing calculator
- [ ] Expiration tracking

### Phase 4: Campaigns
- [ ] Campaign planning tool
- [ ] Deliverable tracking
- [ ] Seasonal organization
- [ ] Progress dashboard

### Phase 5: Advanced
- [ ] Usage tracking/monitoring
- [ ] License renewal reminders
- [ ] Client asset library
- [ ] Re-shoot suggestions

---

## API Reference

### Server Actions

```typescript
// Dish Catalog
createDish(clientId: string, data: DishInput): Promise<Dish>
updateDish(dishId: string, data: DishInput): Promise<Dish>
linkPhotoToDish(photoId: string, dishId: string, angle: string): Promise<void>
getDishCatalog(clientId: string): Promise<DishCatalog>

// Licensing
createLicense(data: LicenseInput): Promise<FoodLicense>
calculateLicenseFee(options: LicenseOptions): Promise<number>
checkLicenseExpiration(clientId: string): Promise<ExpiringLicense[]>
renewLicense(licenseId: string, duration: LicenseDuration): Promise<FoodLicense>

// Campaigns
createCampaign(data: CampaignInput): Promise<SeasonalCampaign>
updateDeliverableStatus(id: string, status: string): Promise<void>
getCampaignProgress(campaignId: string): Promise<CampaignProgress>
```

---

## Recipe/Process Photography

### Step-by-Step Documentation

```typescript
interface RecipeShoot {
  id: string;
  dishId: string;
  recipeName: string;
  steps: RecipeStep[];
  finalPlating: Photo[];
  ingredientShot?: Photo;
  equipmentShot?: Photo;
}

interface RecipeStep {
  order: number;
  description: string;
  photos: Photo[];
  tips?: string;
}
```

### Blog/Publication Ready

- Vertical format options
- Pinterest-optimized crops
- Recipe card templates
- Ingredient flat lay

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Licensing System](./docs/licensing.md) - Usage rights management
- [Asset Organization](./docs/asset-organization.md) - Gallery organization
