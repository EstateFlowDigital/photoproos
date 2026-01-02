# PhotoProOS Onboarding System

## Overview

A comprehensive multi-step onboarding wizard that personalizes the PhotoProOS experience based on industry selection, collects essential business information, and gates features/modules based on user preferences.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [Onboarding Flow](#onboarding-flow)
4. [Industry Modules](#industry-modules)
5. [Feature Gating](#feature-gating)
6. [Implementation Phases](#implementation-phases)
7. [File Structure](#file-structure)
8. [API Endpoints](#api-endpoints)
9. [Component Reference](#component-reference)

---

## Architecture

### High-Level Flow

```
Clerk Auth → Onboarding Check → Multi-Step Wizard → Dashboard
                ↓
         (If incomplete)
                ↓
    /onboarding/[step] routes
```

### Key Principles

1. **Progressive Disclosure**: Show only relevant options based on previous selections
2. **Skippable Steps**: Payment is optional (with incentive for adding card)
3. **Resumable Progress**: Users can leave and return to continue onboarding
4. **Industry-First Design**: Real Estate is default, but all industries are equal
5. **Module Gating**: Sidebar and features adapt to selected industries

---

## Database Schema

### New Fields on `Organization` Model

```prisma
model Organization {
  // ... existing fields ...

  // Onboarding State
  onboardingCompleted    Boolean   @default(false)
  onboardingStep         Int       @default(0)
  onboardingCompletedAt  DateTime?

  // Industry Selection
  industries             String[]  @default(["real_estate"]) // Array of industry IDs
  primaryIndustry        String    @default("real_estate")

  // Enabled Modules (feature flags)
  enabledModules         String[]  @default([])

  // Business Profile (collected during onboarding)
  businessType           String?   // solo, team, agency
  teamSize               String?   // 1, 2-5, 6-10, 11-25, 25+
  annualRevenue          String?   // <50k, 50-100k, 100-250k, 250k+
  yearsInBusiness        String?   // <1, 1-3, 3-5, 5-10, 10+

  // Display Preferences
  displayMode            String    @default("company") // "personal" | "company"
  publicName             String?   // What clients see (company or personal name)
  publicEmail            String?   // Public-facing email
  publicPhone            String?   // Public-facing phone

  // Stripe Trial/Payment
  trialStartedAt         DateTime?
  trialEndsAt            DateTime?
  paymentMethodAdded     Boolean   @default(false)

  // Guided Tour Progress
  tourProgress           Json?     // { "dashboard": true, "galleries": false, ... }
}
```

### New Fields on `User` Model

```prisma
model User {
  // ... existing fields ...

  // Personal Info (collected during onboarding)
  firstName              String?
  lastName               String?
  phoneNumber            String?

  // Preferences
  hasSeenWelcome         Boolean   @default(false)
  tourCompletedModules   String[]  @default([])
}
```

### Industry Enum Reference

```typescript
export const INDUSTRIES = {
  real_estate: {
    id: "real_estate",
    name: "Real Estate & Property",
    description: "Residential, commercial, and architectural photography",
    icon: "Building2",
    modules: ["galleries", "scheduling", "invoices", "clients", "services", "properties"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients"],
  },
  commercial: {
    id: "commercial",
    name: "Commercial & Corporate",
    description: "Business headshots, office spaces, products",
    icon: "Briefcase",
    modules: ["galleries", "scheduling", "invoices", "clients", "services", "contracts"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients"],
  },
  events: {
    id: "events",
    name: "Events & Weddings",
    description: "Weddings, corporate events, parties",
    icon: "Calendar",
    modules: ["galleries", "scheduling", "invoices", "clients", "contracts", "questionnaires"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients", "contracts"],
  },
  portraits: {
    id: "portraits",
    name: "Portraits & Headshots",
    description: "Family portraits, senior photos, professional headshots",
    icon: "User",
    modules: ["galleries", "scheduling", "invoices", "clients", "services"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients"],
  },
  food: {
    id: "food",
    name: "Food & Hospitality",
    description: "Restaurant, menu, and culinary photography",
    icon: "UtensilsCrossed",
    modules: ["galleries", "scheduling", "invoices", "clients", "services"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients"],
  },
  product: {
    id: "product",
    name: "Product & E-commerce",
    description: "Product shots, catalog, and e-commerce imagery",
    icon: "Package",
    modules: ["galleries", "scheduling", "invoices", "clients", "services"],
    defaultModules: ["galleries", "scheduling", "invoices", "clients"],
  },
} as const;
```

---

## Onboarding Flow

### Step-by-Step Breakdown

| Step | Route | Title | Description |
|------|-------|-------|-------------|
| 0 | `/onboarding` | Welcome | Animated welcome screen with value proposition |
| 1 | `/onboarding/profile` | Personal Profile | First name, last name, phone (from Clerk if available) |
| 2 | `/onboarding/business` | Business Identity | Company name, type, team size |
| 3 | `/onboarding/branding` | Public Presence | Display mode (personal/company), public contact info |
| 4 | `/onboarding/industries` | Industry Selection | Multi-select industries, pick primary |
| 5 | `/onboarding/features` | Feature Selection | Checkboxes for modules based on industries |
| 6 | `/onboarding/goals` | Business Goals | What they want to achieve (optional) |
| 7 | `/onboarding/payment` | Payment Setup | Stripe card (skippable with incentive) |
| 8 | `/onboarding/complete` | All Set! | Summary + start guided tour option |

### Step Details

#### Step 0: Welcome
- Animated logo/illustration
- "Welcome to PhotoProOS" headline
- 3 value propositions with icons
- "Get Started" CTA

#### Step 1: Personal Profile
```typescript
interface PersonalProfileData {
  firstName: string;      // Required
  lastName: string;       // Required
  phoneNumber?: string;   // Optional
}
```
- Pre-fill from Clerk if available
- Avatar upload option

#### Step 2: Business Identity
```typescript
interface BusinessIdentityData {
  companyName?: string;   // Optional if solo
  businessType: "solo" | "team" | "agency";
  teamSize: "1" | "2-5" | "6-10" | "11-25" | "25+";
  yearsInBusiness?: string;
}
```
- Show/hide company name based on business type
- Team size affects feature recommendations

#### Step 3: Public Presence
```typescript
interface PublicPresenceData {
  displayMode: "personal" | "company";
  publicName: string;     // Auto-filled based on mode
  publicEmail?: string;
  publicPhone?: string;
  website?: string;
}
```
- Preview of how clients will see their branding
- Toggle between personal name vs company name

#### Step 4: Industry Selection
```typescript
interface IndustrySelectionData {
  industries: string[];   // At least one required
  primaryIndustry: string;
}
```
- Card-based multi-select
- Visual icons for each industry
- "Primary" badge on selected primary
- Real Estate pre-selected by default

#### Step 5: Feature Selection
```typescript
interface FeatureSelectionData {
  enabledModules: string[];
}
```
- Grouped by category
- Some auto-enabled based on industry
- Show which industries unlock each feature
- Descriptions and mini-previews

#### Step 6: Business Goals (Optional)
```typescript
interface BusinessGoalsData {
  goals: string[];        // Multi-select
  annualRevenue?: string;
  monthlyBookings?: string;
}
```
- "What do you want to achieve?"
- Options: More bookings, Faster payments, Better organization, etc.
- Helps with personalized tips later

#### Step 7: Payment Setup
```typescript
interface PaymentSetupData {
  skipPayment: boolean;
  paymentMethodId?: string;
}
```
- Stripe Elements for card input
- "Add card for 30-day free trial" vs "Start 14-day trial"
- Incentive: Extra trial days for adding card
- Clear skip option

#### Step 8: Complete
- Confetti animation
- Summary of selections
- "Start Guided Tour" CTA
- "Go to Dashboard" secondary option

---

## Industry Modules

Each industry has its own README with specific features and configurations:

| Industry | README | Primary Modules |
|----------|--------|-----------------|
| Real Estate | [README-MODULE-REAL-ESTATE.md](./README-MODULE-REAL-ESTATE.md) | Properties, Galleries, Scheduling |
| Commercial | [README-MODULE-COMMERCIAL.md](./README-MODULE-COMMERCIAL.md) | Contracts, Galleries, Invoicing |
| Events | [README-MODULE-EVENTS.md](./README-MODULE-EVENTS.md) | Contracts, Questionnaires, Galleries |
| Portraits | [README-MODULE-PORTRAITS.md](./README-MODULE-PORTRAITS.md) | Scheduling, Galleries, Mini-Sessions |
| Food | [README-MODULE-FOOD.md](./README-MODULE-FOOD.md) | Galleries, Invoicing, Licensing |
| Product | [README-MODULE-PRODUCT.md](./README-MODULE-PRODUCT.md) | Galleries, Batch Processing, Licensing |

---

## Feature Gating

### How Module Gating Works

```typescript
// src/lib/modules/gating.ts

export function isModuleEnabled(
  organization: Organization,
  moduleId: string
): boolean {
  // Core modules always enabled
  if (CORE_MODULES.includes(moduleId)) return true;

  // Check explicit enablement
  return organization.enabledModules.includes(moduleId);
}

export function getEnabledModules(organization: Organization): string[] {
  return [...CORE_MODULES, ...organization.enabledModules];
}

export function getAvailableModules(organization: Organization): Module[] {
  // Returns all modules available based on selected industries
  const industryModules = organization.industries.flatMap(
    (ind) => INDUSTRIES[ind].modules
  );
  return [...new Set(industryModules)];
}
```

### Core Modules (Always Enabled)

These modules cannot be disabled:
- `dashboard` - Main dashboard
- `settings` - Account settings
- `clients` - Client management (basic)

### Industry-Specific Modules

| Module | Real Estate | Commercial | Events | Portraits | Food | Product |
|--------|-------------|------------|--------|-----------|------|---------|
| Galleries | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Scheduling | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Invoices | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Services | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Properties | ✓ | - | - | - | - | - |
| Contracts | - | ✓ | ✓ | - | - | - |
| Questionnaires | - | - | ✓ | - | - | - |
| Mini-Sessions | - | - | - | ✓ | - | - |
| Licensing | - | - | - | - | ✓ | ✓ |
| Batch Processing | - | - | - | - | - | ✓ |

### Sidebar Navigation Gating

```typescript
// src/components/layout/sidebar.tsx

const navigationItems = [
  { id: "dashboard", label: "Dashboard", href: "/", icon: Home, alwaysShow: true },
  { id: "galleries", label: "Galleries", href: "/galleries", icon: Images },
  { id: "scheduling", label: "Scheduling", href: "/scheduling", icon: Calendar },
  { id: "clients", label: "Clients", href: "/clients", icon: Users },
  { id: "invoices", label: "Invoices", href: "/invoices", icon: FileText },
  { id: "services", label: "Services", href: "/services", icon: Tag },
  { id: "properties", label: "Properties", href: "/properties", icon: Building2 },
  { id: "contracts", label: "Contracts", href: "/contracts", icon: FileSignature },
  // ... more items
];

// Filter based on enabled modules
const visibleItems = navigationItems.filter(
  (item) => item.alwaysShow || isModuleEnabled(organization, item.id)
);
```

---

## Implementation Phases

### Phase 1: Database & Schema (Day 1)

1. Add new fields to Prisma schema
2. Run migration
3. Create industry constants file
4. Create module constants file

**Files to create/modify:**
- `prisma/schema.prisma`
- `src/lib/constants/industries.ts`
- `src/lib/constants/modules.ts`
- `src/lib/modules/gating.ts`

### Phase 2: Onboarding Routes & Layout (Day 1-2)

1. Create `/onboarding` route group
2. Build onboarding layout with progress indicator
3. Create step components
4. Implement step navigation logic

**Files to create:**
- `src/app/(onboarding)/layout.tsx`
- `src/app/(onboarding)/onboarding/page.tsx`
- `src/app/(onboarding)/onboarding/[step]/page.tsx`
- `src/components/onboarding/onboarding-layout.tsx`
- `src/components/onboarding/progress-indicator.tsx`
- `src/components/onboarding/step-navigation.tsx`

### Phase 3: Step Components (Day 2-3)

1. Build each step component
2. Add form validation
3. Implement auto-save

**Files to create:**
- `src/components/onboarding/steps/welcome-step.tsx`
- `src/components/onboarding/steps/profile-step.tsx`
- `src/components/onboarding/steps/business-step.tsx`
- `src/components/onboarding/steps/branding-step.tsx`
- `src/components/onboarding/steps/industries-step.tsx`
- `src/components/onboarding/steps/features-step.tsx`
- `src/components/onboarding/steps/goals-step.tsx`
- `src/components/onboarding/steps/payment-step.tsx`
- `src/components/onboarding/steps/complete-step.tsx`

### Phase 4: Server Actions (Day 3)

1. Create onboarding actions
2. Implement step save logic
3. Add completion handler

**Files to create:**
- `src/lib/actions/onboarding.ts`

### Phase 5: Middleware & Redirects (Day 3-4)

1. Add onboarding check to middleware
2. Redirect incomplete users to onboarding
3. Prevent completed users from accessing onboarding

**Files to modify:**
- `src/middleware.ts`

### Phase 6: Stripe Integration (Day 4)

1. Add Stripe Elements to payment step
2. Implement card save logic
3. Set up trial period

**Files to create/modify:**
- `src/components/onboarding/steps/payment-step.tsx`
- `src/lib/stripe/setup-intent.ts`

### Phase 7: Sidebar Gating (Day 4-5)

1. Update sidebar to use module gating
2. Add "locked" state for disabled modules
3. Update page guards

**Files to modify:**
- `src/components/layout/sidebar.tsx`
- Add route protection to gated pages

### Phase 8: Settings Management (Day 5)

1. Add industries/modules to settings
2. Allow adding industries back
3. Allow enabling/disabling modules

**Files to create:**
- `src/app/(dashboard)/settings/industries/page.tsx`
- `src/app/(dashboard)/settings/modules/page.tsx`

### Phase 9: Guided Tour (Day 5-6)

1. Implement tour system
2. Create tour steps for each module
3. Track completion

**Files to create:**
- `src/components/tour/tour-provider.tsx`
- `src/components/tour/tour-tooltip.tsx`
- `src/lib/tour/steps.ts`

### Phase 10: Testing & Polish (Day 6)

1. End-to-end testing
2. Mobile responsiveness
3. Animation polish
4. Edge case handling

---

## File Structure

```
src/
├── app/
│   ├── (onboarding)/
│   │   ├── layout.tsx                    # Onboarding-specific layout
│   │   └── onboarding/
│   │       ├── page.tsx                  # Welcome step (step 0)
│   │       └── [step]/
│   │           └── page.tsx              # Dynamic step pages
│   └── (dashboard)/
│       └── settings/
│           ├── industries/
│           │   └── page.tsx              # Manage industries
│           └── modules/
│               └── page.tsx              # Manage modules
├── components/
│   ├── onboarding/
│   │   ├── onboarding-layout.tsx         # Main onboarding wrapper
│   │   ├── progress-indicator.tsx        # Step progress bar
│   │   ├── step-navigation.tsx           # Next/Back buttons
│   │   └── steps/
│   │       ├── welcome-step.tsx
│   │       ├── profile-step.tsx
│   │       ├── business-step.tsx
│   │       ├── branding-step.tsx
│   │       ├── industries-step.tsx
│   │       ├── features-step.tsx
│   │       ├── goals-step.tsx
│   │       ├── payment-step.tsx
│   │       └── complete-step.tsx
│   └── tour/
│       ├── tour-provider.tsx
│       └── tour-tooltip.tsx
├── lib/
│   ├── constants/
│   │   ├── industries.ts                 # Industry definitions
│   │   └── modules.ts                    # Module definitions
│   ├── modules/
│   │   └── gating.ts                     # Module gating logic
│   ├── actions/
│   │   └── onboarding.ts                 # Onboarding server actions
│   └── tour/
│       └── steps.ts                      # Tour step definitions
└── middleware.ts                         # Updated with onboarding check
```

---

## API Endpoints

### Server Actions

| Action | Description |
|--------|-------------|
| `saveOnboardingStep` | Save progress for current step |
| `completeOnboarding` | Mark onboarding as complete |
| `updateIndustries` | Update selected industries |
| `updateModules` | Update enabled modules |
| `skipOnboardingPayment` | Skip payment step |
| `startGuidedTour` | Initialize tour for user |
| `completeTourStep` | Mark tour step as complete |

### Action Signatures

```typescript
// src/lib/actions/onboarding.ts

export async function saveOnboardingStep(
  step: number,
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string }>;

export async function completeOnboarding(): Promise<{
  success: boolean;
  redirectTo: string;
}>;

export async function updateIndustries(
  industries: string[],
  primaryIndustry: string
): Promise<{ success: boolean }>;

export async function updateModules(
  modules: string[]
): Promise<{ success: boolean }>;
```

---

## Component Reference

### OnboardingLayout

Main wrapper for all onboarding steps.

```typescript
interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  canGoBack: boolean;
  canSkip: boolean;
  onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
}
```

### ProgressIndicator

Shows progress through onboarding steps.

```typescript
interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}
```

### IndustryCard

Selectable card for industry selection.

```typescript
interface IndustryCardProps {
  industry: Industry;
  isSelected: boolean;
  isPrimary: boolean;
  onSelect: () => void;
  onSetPrimary: () => void;
}
```

### ModuleCheckbox

Checkbox for module selection.

```typescript
interface ModuleCheckboxProps {
  module: Module;
  isEnabled: boolean;
  isLocked: boolean;      // If required by industry
  industries: string[];   // Which industries include this
  onChange: (enabled: boolean) => void;
}
```

---

## Testing Checklist

- [ ] New user is redirected to onboarding
- [ ] Returning incomplete user resumes at last step
- [ ] Completed user cannot access onboarding
- [ ] All steps save progress correctly
- [ ] Back/Next navigation works
- [ ] Skip payment works with correct trial period
- [ ] Industries affect available modules
- [ ] Sidebar shows only enabled modules
- [ ] Settings allow changing industries
- [ ] Settings allow enabling/disabling modules
- [ ] Guided tour starts correctly
- [ ] Tour progress is tracked
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard nav, screen readers)

---

## Related Documentation

- [README-MODULE-REAL-ESTATE.md](./README-MODULE-REAL-ESTATE.md)
- [README-MODULE-COMMERCIAL.md](./README-MODULE-COMMERCIAL.md)
- [README-MODULE-EVENTS.md](./README-MODULE-EVENTS.md)
- [README-MODULE-PORTRAITS.md](./README-MODULE-PORTRAITS.md)
- [README-MODULE-FOOD.md](./README-MODULE-FOOD.md)
- [README-MODULE-PRODUCT.md](./README-MODULE-PRODUCT.md)
