# Component Patterns Guide

This document outlines the standard patterns and shared components used throughout the PhotoProOS application. Following these patterns ensures UI consistency and reduces code duplication.

## Table of Contents

- [Design System Foundation](#design-system-foundation)
- [Shared UI Components](#shared-ui-components)
- [Dashboard Components](#dashboard-components)
- [Form Patterns](#form-patterns)
- [Icon Usage](#icon-usage)
- [Gallery Theming](#gallery-theming)
- [Responsive Patterns](#responsive-patterns)

---

## Design System Foundation

All colors, spacing, and styling should use CSS custom properties from `src/app/globals.css`.

### Color Tokens

```css
/* Backgrounds */
--background: #0a0a0a;           /* Page background */
--card: #141414;                 /* Cards, elevated surfaces */
--background-tertiary: #191919;  /* Nested elements */
--background-elevated: #1e1e1e;  /* Buttons, inputs */
--background-hover: #2a2a2a;     /* Hover states */

/* Text */
--foreground: #ffffff;           /* Primary text */
--foreground-secondary: #a3a3a3; /* Secondary text */
--foreground-muted: #8b8b8b;     /* Muted/tertiary text */

/* Borders */
--border: rgba(255, 255, 255, 0.10);
--border-hover: rgba(255, 255, 255, 0.16);
--card-border: rgba(255, 255, 255, 0.10);

/* Status Colors */
--primary: #3b82f6;   /* Primary actions */
--success: #22c55e;   /* Success states */
--warning: #f97316;   /* Warning states */
--error: #ef4444;     /* Error states */

/* Overlays */
--overlay: rgba(0, 0, 0, 0.6);        /* Modal backgrounds */
--overlay-heavy: rgba(0, 0, 0, 0.8);  /* Alert dialogs */
```

### Usage

```tsx
// CORRECT - Using design tokens
<div className="bg-[var(--card)] border border-[var(--card-border)]">
  <span className="text-foreground">Primary</span>
  <span className="text-foreground-secondary">Secondary</span>
</div>

// WRONG - Hardcoded values
<div className="bg-[#141414] border border-white/10">
  <span className="text-white">Primary</span>
</div>
```

---

## Shared UI Components

### FilterPills

Use for status/category filtering tabs.

**Location:** `src/components/ui/filter-pills.tsx`

**When to use:**
- Status filtering (Draft, Sent, Paid, etc.)
- Category filtering with counts
- Tab-like navigation within a page

**Props:**
```tsx
interface FilterPillsProps {
  options: Array<{
    value: string;
    label: string;
    count?: number;
    href?: string;  // If using Link mode
  }>;
  value: string;
  onChange?: (value: string) => void;  // For button mode
  asLinks?: boolean;  // Use <Link> instead of <button>
}
```

**Example:**
```tsx
<FilterPills
  options={[
    { value: "all", label: "All", count: 10, href: "/invoices" },
    { value: "draft", label: "Draft", count: 2, href: "/invoices?status=draft" },
    { value: "paid", label: "Paid", count: 5, href: "/invoices?status=paid" },
  ]}
  value={currentStatus || "all"}
  asLinks
/>
```

---

### ViewModeToggle

Use for switching between grid and list views.

**Location:** `src/components/ui/view-mode-toggle.tsx`

**When to use:**
- Pages with card grids that also support list view
- Galleries, Services, Products pages

**Props:**
```tsx
interface ViewModeToggleProps {
  value: "grid" | "list";
  onChange: (mode: "grid" | "list") => void;
  disabled?: boolean;
}
```

**Example:**
```tsx
const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

<ViewModeToggle value={viewMode} onChange={setViewMode} />
```

---

### BulkActionBar

Floating action bar for batch operations.

**Location:** `src/components/ui/bulk-action-bar.tsx`

**When to use:**
- Multi-select functionality on list/grid pages
- Batch delete, publish, archive operations

**Props:**
```tsx
interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "danger" | "success";
    disabled?: boolean;
  }>;
}
```

**Example:**
```tsx
{selectedIds.size > 0 && (
  <BulkActionBar
    selectedCount={selectedIds.size}
    onClear={() => setSelectedIds(new Set())}
    actions={[
      { label: "Publish", onClick: handlePublish, variant: "success" },
      { label: "Delete", onClick: handleDelete, variant: "danger" },
    ]}
  />
)}
```

---

### StatCard

Metric display card with optional trend indicator.

**Location:** `src/components/dashboard/stat-card.tsx`

**When to use:**
- Dashboard metrics
- Summary statistics at top of pages
- Revenue, count, percentage displays

**Props:**
```tsx
interface StatCardProps {
  label: string;
  value: string;
  change?: number;  // Percentage change
  icon?: React.ReactNode;
  valueVariant?: "default" | "success" | "error" | "primary";
}
```

**Example:**
```tsx
<div className="auto-grid grid-min-220 grid-gap-4">
  <StatCard label="Total Outstanding" value="$4,500" />
  <StatCard label="Paid" value="$12,000" valueVariant="success" />
  <StatCard label="Pending" value="5" valueVariant="primary" />
  <StatCard label="Overdue" value="2" valueVariant="error" />
</div>
```

---

### EmptyState

Zero-state display with icon and action.

**Location:** `src/components/dashboard/empty-state.tsx`

**When to use:**
- No data scenarios
- Initial setup states
- Search with no results

**Note:** Use the shared component when possible. However, if you need an `onClick` handler (e.g., to open a modal), you may need an inline implementation since EmptyState only supports `href`.

**Props:**
```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
}
```

---

## Dashboard Components

### PropertyCard

Property listing card with selection and actions.

**Location:** `src/components/dashboard/property-card.tsx`

**When to use:**
- Property website listings
- Any property-related display with actions

**Props:**
```tsx
interface PropertyCardProps<T extends PropertyWebsite> {
  website: T;
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: (website: T) => void;
  onDuplicate: () => void;
}
```

---

### GalleryCard

Gallery listing card with thumbnail and metadata.

**Location:** `src/components/dashboard/gallery-card.tsx`

**When to use:**
- Gallery listings
- Project photo displays

---

### PageHeader

Consistent page header with title, subtitle, and actions.

**Location:** `src/components/dashboard/page-header.tsx`

**Props:**
```tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backHref?: string;
}
```

**Example:**
```tsx
<PageHeader
  title="Invoices"
  subtitle={`${invoices.length} invoices`}
  actions={
    <Link href="/invoices/new" className="...">
      <PlusIcon className="h-4 w-4" />
      Create Invoice
    </Link>
  }
/>
```

---

## Form Patterns

### FormSection

Group related form fields.

**Location:** `src/components/ui/form-section.tsx`

**Components:**
- `FormSection` - Card wrapper with optional title/description
- `FormRow` - Horizontal row with label and children
- `FormGrid` - 2-column grid for related fields

**Example:**
```tsx
<FormSection title="Basic Information" description="Enter the property details">
  <FormRow label="Address">
    <Input name="address" />
  </FormRow>
  <FormGrid>
    <FormRow label="City">
      <Input name="city" />
    </FormRow>
    <FormRow label="State">
      <Input name="state" />
    </FormRow>
  </FormGrid>
</FormSection>
```

---

## Icon Usage

### Centralized Icon Library

All icons should be imported from the centralized library.

**Location:** `src/components/ui/icons.tsx`

**Usage:**
```tsx
import { PlusIcon, TrashIcon, CheckIcon } from "@/components/ui/icons";

<PlusIcon className="h-4 w-4" />
```

### Icon Sizing Standard

| Size | Class | Usage |
|------|-------|-------|
| xs | `h-3 w-3` | Inline with small text, badges |
| sm | `h-4 w-4` | Buttons, inputs, most common |
| md | `h-5 w-5` | Standalone icons, navigation |
| lg | `h-6 w-6` | Empty states, section headers |
| xl | `h-8 w-8` | Hero sections, large callouts |

**Never define icons inline.** If an icon doesn't exist in the library, add it there first.

---

## Gallery Theming

For public gallery pages that need dynamic light/dark theming.

### Server Components

Use `getGalleryThemeColors()` for static theme rendering:

```tsx
import { getGalleryThemeColors, type ResolvedTheme } from "@/lib/theme";

const resolvedTheme: ResolvedTheme = theme === "auto" ? "dark" : theme;
const colors = getGalleryThemeColors(resolvedTheme);

<div style={{ backgroundColor: colors.bgColor, color: colors.textColor }}>
  <p style={{ color: colors.mutedColor }}>Muted text</p>
</div>
```

### Client Components

Use `useGalleryTheme()` hook for auto theme detection:

```tsx
import { useGalleryTheme } from "@/lib/theme";

const { resolvedTheme, colors, logoUrl } = useGalleryTheme({
  theme: gallery.theme, // "light" | "dark" | "auto"
  logoUrl: gallery.photographer.logoUrl,
  logoLightUrl: gallery.photographer.logoLightUrl,
});

<div style={{ backgroundColor: colors.bgColor }}>
  {logoUrl && <img src={logoUrl} alt="Logo" />}
</div>
```

### Theme Color Properties

```typescript
interface GalleryThemeColors {
  bgColor: string;      // Page background
  cardBg: string;       // Card backgrounds
  textColor: string;    // Primary text
  mutedColor: string;   // Muted/secondary text
  borderColor: string;  // Borders
  // ... more properties
}
```

---

## Responsive Patterns

### Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| sm | 640px | Large phones landscape |
| md | 768px | Tablets |
| lg | 1024px | Small laptops |
| xl | 1280px | Desktops |

### Common Patterns

**Stats Grid:**
```tsx
<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
  {/* Stats cards */}
</div>
```

**Card Grid:**
```tsx
<div className="auto-grid grid-min-240 grid-gap-4">
  {/* Cards auto-fit based on container */}
</div>

// Or explicit:
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
```

**Header Actions:**
```tsx
// Icon-only on mobile, full on desktop
<Link className="... p-2.5 md:px-4">
  <PlusIcon className="h-4 w-4" />
  <span className="hidden md:inline">Create</span>
</Link>
```

**Scrollable Tabs:**
```tsx
<div className="-mx-4 px-4 overflow-x-auto">
  <FilterPills ... />
</div>
```

---

## Best Practices

1. **Check shared components first** - Before creating UI, search for existing components
2. **Use design tokens** - Never hardcode colors or spacing values
3. **Import icons from library** - Add new icons to `icons.tsx`, don't define inline
4. **Follow responsive patterns** - Test on mobile, tablet, and desktop
5. **Maintain consistency** - Match patterns from similar pages
6. **Update CHANGELOG** - Document new components and significant changes

---

## File Organization

```
src/
├── components/
│   ├── ui/               # Primitives (button, card, input, dialog)
│   ├── dashboard/        # Dashboard-specific (stat-card, page-header, gallery-card)
│   ├── gallery/          # Gallery features (slideshow, analytics)
│   └── [feature]/        # Feature-specific components
├── lib/
│   ├── theme/            # Theming utilities (gallery-theme)
│   ├── actions/          # Server actions
│   └── utils/            # Utility functions
```
