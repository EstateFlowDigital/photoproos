# Events & Weddings Module

## Overview

The Events module is built for photographers covering weddings, parties, corporate events, and special occasions. Key features include questionnaires, timelines, contracts, and multi-day event management.

---

## Module ID

```
events
```

---

## Included Features

| Feature | Description | Default |
|---------|-------------|---------|
| Galleries | Event galleries with guest access | Enabled |
| Scheduling | Multi-day event booking | Enabled |
| Invoices | Deposit-based payment plans | Enabled |
| Clients | Couples + event contacts | Enabled |
| Contracts | Wedding/event agreements | Enabled |
| Questionnaires | Pre-event detail collection | Enabled |
| Timelines | Event day schedules | Enabled |

---

## Unique Features

### 1. Event Questionnaires

Collect details before the event:

```typescript
interface Questionnaire {
  id: string;
  bookingId: string;
  templateId: string;
  status: "draft" | "sent" | "in_progress" | "completed";
  sentAt?: Date;
  completedAt?: Date;
  responses: QuestionnaireResponse[];
}

interface QuestionnaireResponse {
  questionId: string;
  answer: string | string[] | boolean | number;
}

// Pre-built question types
type QuestionType =
  | "text"
  | "long_text"
  | "select"
  | "multi_select"
  | "date"
  | "time"
  | "number"
  | "boolean"
  | "contact_list"    // List of people (bridal party, etc.)
  | "shot_list"       // Requested photos
  | "vendor_list";    // Other vendors
```

### 2. Event Timelines

Build and share event schedules:

```typescript
interface EventTimeline {
  id: string;
  bookingId: string;
  events: TimelineEvent[];
  sharedWith: string[];  // Emails with view access
  lastUpdated: Date;
}

interface TimelineEvent {
  id: string;
  time: string;         // "14:30"
  endTime?: string;     // "15:00"
  title: string;
  location?: string;
  notes?: string;
  participants?: string[];
  photographerRequired: boolean;
}
```

### 3. Multi-Day Events

Support events spanning multiple days:

```typescript
interface MultiDayBooking {
  id: string;
  clientId: string;
  eventName: string;
  days: EventDay[];
  totalPrice: number;
  depositPaid: boolean;
}

interface EventDay {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  description: string;  // "Rehearsal Dinner", "Ceremony", etc.
  services: Service[];
}
```

### 4. Wedding-Specific Client Model

```typescript
interface WeddingClient extends Client {
  type: "couple";
  partner1: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  partner2: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
  weddingDate?: Date;
  venue?: string;
  weddingPartySize?: number;
  guestCount?: number;
}
```

---

## Service Templates

### Wedding Packages

```typescript
// Elopement
{
  name: "Elopement Package",
  description: "Intimate ceremonies up to 2 hours",
  basePrice: 150000, // $1,500
  estimatedDuration: 120,
  deliverables: ["150+ edited images", "Online gallery", "Print release"],
  includes: ["Ceremony coverage", "Couple portraits"]
}

// Half Day
{
  name: "Half Day Wedding",
  description: "4 hours of coverage",
  basePrice: 250000, // $2,500
  estimatedDuration: 240,
  deliverables: ["300+ edited images", "Online gallery", "Print release"],
  includes: ["Getting ready", "Ceremony", "Family formals", "Reception start"]
}

// Full Day
{
  name: "Full Day Wedding",
  description: "8 hours of coverage",
  basePrice: 400000, // $4,000
  estimatedDuration: 480,
  deliverables: ["500+ edited images", "Online gallery", "Print release", "Sneak peek"],
  includes: ["Full day coverage", "Second shooter option", "Engagement session"]
}

// Premium Collection
{
  name: "Premium Collection",
  description: "Complete wedding experience",
  basePrice: 600000, // $6,000
  estimatedDuration: 600, // 10 hours
  deliverables: ["700+ edited images", "Wedding album", "Parent albums", "Canvas print"],
  includes: ["Engagement session", "Rehearsal dinner", "Full day", "Second shooter"]
}
```

### Event Packages

```typescript
// Birthday/Party
{
  name: "Event Coverage",
  description: "Parties and celebrations",
  basePrice: 75000, // $750
  estimatedDuration: 180, // 3 hours
  additionalHourRate: 20000 // $200/hr
}

// Corporate Event
{
  name: "Corporate Event",
  description: "Business events and galas",
  basePrice: 150000, // $1,500
  estimatedDuration: 240, // 4 hours
  additionalHourRate: 30000 // $300/hr
}
```

### Add-On Services
- Second Photographer: $500
- Engagement Session: $400
- Rehearsal Dinner: $500
- Photo Booth: $800
- Album Design: $300+
- Rush Editing: $200

---

## Questionnaire Templates

### Wedding Questionnaire

```typescript
const weddingQuestions = [
  // Basic Info
  { id: "venue_name", label: "Venue Name", type: "text", required: true },
  { id: "venue_address", label: "Venue Address", type: "text", required: true },
  { id: "ceremony_time", label: "Ceremony Time", type: "time", required: true },
  { id: "guest_count", label: "Expected Guest Count", type: "number" },

  // Getting Ready
  { id: "getting_ready_location", label: "Where are you getting ready?", type: "text" },
  { id: "getting_ready_time", label: "What time should we arrive?", type: "time" },

  // Wedding Party
  {
    id: "bridal_party",
    label: "Wedding Party Members",
    type: "contact_list",
    fields: ["name", "role", "relationship"]
  },

  // Family Formals
  {
    id: "family_groups",
    label: "Family Photo Groups",
    type: "shot_list",
    description: "List the family group combinations you want"
  },

  // Vendors
  {
    id: "vendors",
    label: "Other Vendors",
    type: "vendor_list",
    fields: ["name", "company", "role", "email", "phone"]
  },

  // Special Requests
  { id: "must_have_shots", label: "Must-Have Shots", type: "long_text" },
  { id: "special_moments", label: "Special Moments to Capture", type: "long_text" },
  { id: "avoid_list", label: "Anything to Avoid?", type: "long_text" },
];
```

### Event Questionnaire

```typescript
const eventQuestions = [
  { id: "event_name", label: "Event Name", type: "text", required: true },
  { id: "event_type", label: "Type of Event", type: "select", options: ["Birthday", "Anniversary", "Corporate", "Other"] },
  { id: "venue", label: "Venue/Location", type: "text", required: true },
  { id: "guest_count", label: "Expected Guests", type: "number" },
  { id: "key_people", label: "Key People to Photograph", type: "contact_list" },
  { id: "schedule", label: "Event Schedule/Timeline", type: "long_text" },
  { id: "special_requests", label: "Special Requests", type: "long_text" },
];
```

---

## Booking Flow Customizations

### Step 1: Event Type
- Wedding
- Engagement Session
- Party/Celebration
- Corporate Event
- Other Event

### Step 2: Event Details (varies by type)

**For Weddings:**
- Partner names
- Wedding date
- Venue(s)
- Guest count estimate

**For Events:**
- Event name
- Type
- Date/time
- Location

### Step 3: Package Selection
- Show relevant packages
- Add-on options
- Multi-day pricing (if applicable)

### Step 4: Contract
- Auto-populate contract with details
- Send for signature
- Deposit payment option

### Step 5: Questionnaire
- Send questionnaire automatically
- Set deadline for completion

---

## Contract Features

### Wedding Contract Sections

1. **Services Agreed** - Package details, hours, deliverables
2. **Payment Schedule** - Deposit amount, due dates, final payment
3. **Cancellation Policy** - Refund terms by timeframe
4. **Rescheduling Policy** - Conditions and fees
5. **Image Delivery** - Timeline, format, usage rights
6. **Liability Limitations** - Equipment failure, unforeseen circumstances
7. **Model Release** - Permission to use images
8. **Emergency Contact** - Day-of contact information

### Payment Schedule Options

```typescript
type PaymentSchedule =
  | "full_upfront"           // 100% at booking
  | "50_50"                  // 50% deposit, 50% before event
  | "retainer_balance"       // $500-1000 retainer, balance before event
  | "three_payments"         // 33% booking, 33% 30 days, 33% day before
  | "custom";
```

---

## Gallery Customizations

### Event Gallery Features
- Guest access with email gate
- Download counts and tracking
- Favorites/selections
- Print ordering integration
- Slideshow/presentation mode
- Social sharing options

### Guest Gallery Access

```typescript
interface GuestAccess {
  galleryId: string;
  accessType: "public" | "password" | "email_gate" | "private";
  password?: string;
  allowedEmails?: string[];
  allowDownloads: boolean;
  allowFavorites: boolean;
  expiresAt?: Date;
}
```

### Sneak Peek Galleries

```typescript
interface SneakPeek {
  id: string;
  bookingId: string;
  mainGalleryId: string;
  photos: string[];  // Subset of photos
  publishedAt: Date;
  socialShareEnabled: boolean;
}
```

---

## Timeline Builder

### Features
- Drag-and-drop event ordering
- Time-aware scheduling
- Location tracking
- Photographer notes
- Shareable link for clients/vendors

### Timeline Template

```typescript
const weddingTimelineTemplate = [
  { time: "12:00", title: "Hair & Makeup", photographerRequired: false },
  { time: "14:00", title: "Photographer Arrives", photographerRequired: true },
  { time: "14:30", title: "Getting Ready Photos", photographerRequired: true },
  { time: "15:30", title: "First Look", photographerRequired: true },
  { time: "16:00", title: "Wedding Party Photos", photographerRequired: true },
  { time: "16:30", title: "Family Formals", photographerRequired: true },
  { time: "17:00", title: "Ceremony", photographerRequired: true },
  { time: "17:30", title: "Cocktail Hour", photographerRequired: true },
  { time: "18:30", title: "Reception Entrance", photographerRequired: true },
  { time: "19:00", title: "First Dance", photographerRequired: true },
  { time: "19:30", title: "Toasts", photographerRequired: true },
  { time: "20:00", title: "Dinner", photographerRequired: false },
  { time: "21:00", title: "Cake Cutting", photographerRequired: true },
  { time: "21:30", title: "Dancing", photographerRequired: true },
  { time: "22:00", title: "Send-off", photographerRequired: true },
];
```

---

## Settings (Module-Specific)

Located at `/settings/events`:

| Setting | Description | Default |
|---------|-------------|---------|
| Default deposit | Percentage or fixed | 33% |
| Questionnaire deadline | Days before event | 14 |
| Sneak peek timing | Days after event | 3 |
| Full gallery timing | Days after event | 30 |
| Auto-send questionnaire | On contract signing | true |
| Guest download limit | Per gallery | unlimited |

---

## Dashboard Widgets

### Upcoming Events
- Calendar view of events
- Days until each event
- Questionnaire status

### Pending Items
- Unsigned contracts
- Incomplete questionnaires
- Unpaid balances

### Event Pipeline
- Inquiries
- Booked
- Questionnaire sent
- Timeline confirmed
- Completed

---

## Implementation Checklist

### Phase 1: Questionnaires
- [ ] Questionnaire template builder
- [ ] Question types implementation
- [ ] Client-facing questionnaire form
- [ ] Response storage and display
- [ ] Auto-send on contract signing

### Phase 2: Timelines
- [ ] Timeline data model
- [ ] Timeline builder UI
- [ ] Shareable timeline page
- [ ] Timeline templates

### Phase 3: Multi-Day Events
- [ ] Multi-day booking model
- [ ] Multi-day booking form
- [ ] Day-by-day breakdown
- [ ] Consolidated pricing

### Phase 4: Wedding Features
- [ ] Couple client type
- [ ] Wedding-specific questionnaire
- [ ] Family formal shot list
- [ ] Vendor management

### Phase 5: Gallery Features
- [ ] Guest access controls
- [ ] Sneak peek galleries
- [ ] Download tracking
- [ ] Social sharing

---

## API Reference

### Server Actions

```typescript
// Questionnaires
createQuestionnaireTemplate(data: TemplateInput): Promise<Template>
sendQuestionnaire(bookingId: string, templateId: string): Promise<Questionnaire>
saveQuestionnaireResponse(id: string, responses: Response[]): Promise<void>
getQuestionnaireStatus(bookingId: string): Promise<QuestionnaireStatus>

// Timelines
createTimeline(bookingId: string): Promise<Timeline>
updateTimeline(id: string, events: TimelineEvent[]): Promise<Timeline>
shareTimeline(id: string, emails: string[]): Promise<string> // Returns share URL

// Multi-Day
createMultiDayBooking(data: MultiDayInput): Promise<MultiDayBooking>
addEventDay(bookingId: string, day: EventDay): Promise<EventDay>
```

---

## Related Documentation

- [README-ONBOARDING.md](./README-ONBOARDING.md) - Main onboarding documentation
- [Questionnaire System](./docs/questionnaires.md) - Questionnaire details
- [Timeline Builder](./docs/timeline-builder.md) - Timeline features
