# Portraits & Headshots Module

## Overview

The Portraits module caters to photographers specializing in family portraits, senior photos, professional headshots, and personal branding sessions. Features include mini-session management, online booking, and client galleries with print ordering.

---

## Module ID

```
portraits
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Portrait galleries with print ordering | Enabled |
| Scheduling | Session booking with time slots | Enabled |
| Invoices | Session-based pricing | Enabled |
| Clients | Individual + family management | Enabled |
| Services | Portrait packages | Enabled |
| Mini-Sessions | Group event management | Enabled |
| Online Booking | Client self-scheduling | Enabled |

---

## Unique Features

### 1. Mini-Session Events

Manage high-volume mini-session events:

```typescript
interface MiniSessionEvent {
  id: string;
  name: string;                    // "Fall Mini Sessions 2024"
  date: Date;
  location: string;
  locationDetails?: string;
  description?: string;
  image?: string;                  // Marketing image
  sessionLength: number;           // minutes (15, 20, 30)
  bufferTime: number;              // minutes between sessions
  startTime: string;               // "09:00"
  endTime: string;                 // "16:00"
  price: number;                   // cents
  depositRequired?: number;        // cents
  maxBookings: number;
  currentBookings: number;
  status: "draft" | "published" | "sold_out" | "completed";
  bookingPageUrl?: string;
  slots: MiniSessionSlot[];
}

interface MiniSessionSlot {
  id: string;
  eventId: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked";
  bookingId?: string;
  clientName?: string;
}
```

### 2. Online Booking Page

Self-service booking for clients:

```typescript
interface BookingPage {
  id: string;
  organizationId: string;
  slug: string;                    // URL slug
  title: string;
  description?: string;
  services: BookableService[];
  availability: AvailabilitySettings;
  settings: BookingPageSettings;
}

interface BookableService {
  serviceId: string;
  enabled: boolean;
  customPrice?: number;            // Override default price
  customDuration?: number;         // Override default duration
}

interface BookingPageSettings {
  requireDeposit: boolean;
  depositAmount?: number;
  showPrices: boolean;
  collectPhone: boolean;
  customQuestions?: CustomQuestion[];
  confirmationMessage?: string;
}
```

### 3. Family/Group Client Model

```typescript
interface FamilyClient extends Client {
  type: "family";
  familyName: string;              // "The Johnson Family"
  primaryContact: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  familyMembers: FamilyMember[];
}

interface FamilyMember {
  id: string;
  firstName: string;
  lastName?: string;
  relationship: string;            // "spouse", "child", "pet"
  birthDate?: Date;                // For age-based pricing
  notes?: string;
}
```

### 4. Print Ordering Integration

```typescript
interface PrintOrder {
  id: string;
  galleryId: string;
  clientId: string;
  items: PrintOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered";
  shippingAddress: Address;
  trackingNumber?: string;
}

interface PrintOrderItem {
  photoId: string;
  productId: string;              // From print lab catalog
  productName: string;
  size: string;
  quantity: number;
  priceEach: number;
  total: number;
}
```

---

## Service Templates

### Individual Sessions

```typescript
// Headshot Session
{
  name: "Professional Headshot",
  description: "Corporate or LinkedIn headshot",
  basePrice: 25000, // $250
  estimatedDuration: 45,
  deliverables: ["3 retouched images", "Web + print resolution"],
  includes: ["Wardrobe consultation", "2-3 outfit changes"]
}

// Personal Branding
{
  name: "Personal Branding Session",
  description: "Comprehensive brand imagery",
  basePrice: 75000, // $750
  estimatedDuration: 120,
  deliverables: ["20 retouched images", "Full resolution"],
  includes: ["Location scouting", "Multiple setups", "Style guide"]
}
```

### Family Sessions

```typescript
// Family Portrait
{
  name: "Family Portrait Session",
  description: "Outdoor or studio family photos",
  basePrice: 35000, // $350
  estimatedDuration: 60,
  deliverables: ["20 edited images", "Online gallery"],
  includes: ["Location guidance", "Outfit consultation"]
}

// Extended Family
{
  name: "Extended Family Session",
  description: "Multiple generations and groupings",
  basePrice: 50000, // $500
  estimatedDuration: 90,
  deliverables: ["40 edited images", "Group combinations"],
  includes: ["Shot list planning", "Multiple locations"]
}
```

### Senior Sessions

```typescript
// Senior Basic
{
  name: "Senior Portrait - Basic",
  description: "Essential senior photos",
  basePrice: 30000, // $300
  estimatedDuration: 60,
  deliverables: ["15 edited images", "Online gallery"],
  includes: ["1 location", "2 outfit changes"]
}

// Senior Premium
{
  name: "Senior Portrait - Premium",
  description: "Complete senior experience",
  basePrice: 55000, // $550
  estimatedDuration: 120,
  deliverables: ["30 edited images", "Print credit"],
  includes: ["2 locations", "4 outfit changes", "Hair/makeup prep"]
}
```

### Mini-Session Templates

```typescript
// Fall Minis
{
  name: "Fall Mini Session",
  basePrice: 17500, // $175
  sessionLength: 20,
  deliverables: ["10 edited images", "Online gallery"],
  description: "20-minute fall foliage session"
}

// Holiday Minis
{
  name: "Holiday Mini Session",
  basePrice: 20000, // $200
  sessionLength: 20,
  deliverables: ["10 edited images", "1 digital holiday card"],
  description: "Festive holiday-themed photos"
}
```

---

## Booking Flow Customizations

### Online Booking Flow

1. **Select Service** - Browse available sessions
2. **Choose Date/Time** - Calendar with availability
3. **Enter Details** - Contact info, family members
4. **Custom Questions** - Photographer's questions
5. **Payment** - Deposit or full payment
6. **Confirmation** - Email with details

### Mini-Session Booking Flow

1. **View Event** - Event details and availability
2. **Select Time** - Available slots
3. **Enter Details** - Contact and participants
4. **Payment** - Session fee
5. **Confirmation** - Email with location details

---

## Gallery Customizations

### Portrait Gallery Features
- Favorite/selection tools
- Print ordering integration
- Digital download packages
- Wall art previews
- Album design tools

### In-Person Sales (IPS) Mode

```typescript
interface IPSSession {
  id: string;
  galleryId: string;
  scheduledAt: Date;
  clientId: string;
  status: "scheduled" | "in_progress" | "completed";
  viewedImages: string[];
  selectedImages: string[];
  cart: CartItem[];
  totalSales?: number;
}
```

### Wall Art Previews

```typescript
interface RoomPreview {
  id: string;
  roomImage: string;              // Background room photo
  wallDimensions: {
    width: number;
    height: number;
  };
  previewPosition: {
    x: number;
    y: number;
    scale: number;
  };
}
```

---

## Mini-Session Management

### Event Creation Workflow

1. **Create Event** - Name, date, location
2. **Set Schedule** - Start/end time, session length, buffer
3. **Configure Pricing** - Session fee, deposit
4. **Design Landing Page** - Description, image, details
5. **Publish** - Generate booking link
6. **Monitor** - Track bookings, send reminders

### Client Communication

```typescript
interface MiniSessionCommunication {
  eventId: string;
  emails: {
    confirmation: {
      template: string;
      sendAt: "booking";
    };
    reminder: {
      template: string;
      sendAt: "1_day_before";
    };
    whatToWear: {
      template: string;
      sendAt: "3_days_before";
    };
    galleryReady: {
      template: string;
      sendAt: "gallery_published";
    };
  };
}
```

---

## Online Booking System

### Availability Settings

```typescript
interface AvailabilitySettings {
  timezone: string;
  defaultDuration: number;         // minutes
  bufferBefore: number;            // minutes
  bufferAfter: number;             // minutes
  minimumNotice: number;           // hours
  maxAdvanceBooking: number;       // days
  weeklySchedule: WeeklySchedule;
  blockedDates: Date[];
  customAvailability?: DateOverride[];
}

interface WeeklySchedule {
  monday: DaySchedule | null;
  tuesday: DaySchedule | null;
  wednesday: DaySchedule | null;
  thursday: DaySchedule | null;
  friday: DaySchedule | null;
  saturday: DaySchedule | null;
  sunday: DaySchedule | null;
}

interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

interface TimeSlot {
  start: string;                   // "09:00"
  end: string;                     // "17:00"
}
```

### Booking Widget

Embeddable booking widget for website:

```typescript
interface BookingWidget {
  organizationId: string;
  services: string[];              // Service IDs to show
  theme: "light" | "dark";
  accentColor: string;
  embedCode: string;
}
```

---

## Invoice Customizations

### Portrait-Specific Items
- Session fee
- Print package (prints + digitals)
- Digital download package
- Wall art
- Album
- Additional digitals

### Print Products

```typescript
interface PrintProduct {
  id: string;
  name: string;
  category: "print" | "canvas" | "metal" | "album" | "gift";
  sizes: ProductSize[];
  basePrice: number;
  description?: string;
}

interface ProductSize {
  size: string;                    // "8x10"
  price: number;                   // cents
  labCost: number;                 // cost to photographer
}
```

---

## Settings (Module-Specific)

Located at `/settings/portraits`:

| Setting | Description | Default |
|---------|-------------|---------|
| Online booking enabled | Allow self-scheduling | true |
| Minimum notice | Hours before booking | 24 |
| Max advance booking | Days ahead | 60 |
| Require deposit | For online bookings | true |
| Deposit amount | Fixed or percentage | 50% |
| Gallery expiration | Days | 30 |
| Print lab | Connected lab | none |
| Print markup | Percentage | 100% |

---

## Dashboard Widgets

### Mini-Session Status
- Active events
- Slots booked vs available
- Revenue per event

### Upcoming Sessions
- This week's sessions
- Session type breakdown
- Preparation reminders

### Gallery Activity
- Recent views
- Downloads
- Print orders

### Booking Pipeline
- New inquiries
- Scheduled sessions
- Awaiting galleries
- Pending orders

---

## Implementation Checklist

### Phase 1: Online Booking
- [ ] Booking page builder
- [ ] Availability settings
- [ ] Service selection UI
- [ ] Calendar component
- [ ] Booking confirmation flow

### Phase 2: Mini-Sessions
- [ ] Mini-session event model
- [ ] Event creation form
- [ ] Public booking page
- [ ] Slot management
- [ ] Automated emails

### Phase 3: Family Management
- [ ] Family client type
- [ ] Family member management
- [ ] Family gallery organization

### Phase 4: Print Ordering
- [ ] Print product catalog
- [ ] Order management
- [ ] Lab integration (WHCC, etc.)
- [ ] Fulfillment tracking

### Phase 5: IPS Features
- [ ] Presentation mode
- [ ] Wall art previews
- [ ] In-session cart
- [ ] Order processing

---

## API Reference

### Server Actions

```typescript
// Mini-Sessions
createMiniSessionEvent(data: EventInput): Promise<MiniSessionEvent>
publishMiniSessionEvent(eventId: string): Promise<string> // Returns booking URL
getMiniSessionSlots(eventId: string): Promise<MiniSessionSlot[]>
bookMiniSessionSlot(slotId: string, data: BookingInput): Promise<Booking>

// Online Booking
getAvailability(serviceId: string, month: Date): Promise<AvailableSlot[]>
createOnlineBooking(data: OnlineBookingInput): Promise<Booking>

// Print Orders
createPrintOrder(galleryId: string, items: OrderItem[]): Promise<PrintOrder>
submitToLab(orderId: string): Promise<LabSubmission>
updateOrderTracking(orderId: string, tracking: string): Promise<void>

// Family Management
createFamily(data: FamilyInput): Promise<FamilyClient>
addFamilyMember(familyId: string, member: MemberInput): Promise<FamilyMember>
```

---

## Print Lab Integrations

### Supported Labs (Future)
- WHCC (White House Custom Colour)
- Miller's Lab
- Bay Photo Lab
- Nations Photo Lab
- Mpix

### Lab Integration Flow

```typescript
interface LabOrder {
  labId: string;
  orderId: string;
  externalOrderId?: string;
  items: LabOrderItem[];
  status: "pending" | "submitted" | "processing" | "shipped" | "delivered";
  submittedAt?: Date;
  trackingNumber?: string;
  trackingUrl?: string;
}
```

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Online Booking](./docs/online-booking.md) - Booking system details
- [Mini-Sessions](./docs/mini-sessions.md) - Mini-session management
- [Print Ordering](./docs/print-ordering.md) - Print lab integration
