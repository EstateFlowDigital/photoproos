# Component Optimization Playbook

A systematic approach to optimizing large React components in PhotoProOS.

---

## Overview

This playbook documents the process used to optimize `gallery-client.tsx` (3,239 → optimized lines). Use this guide when tackling similar large components.

---

## Phase 1: Analysis

### Step 1.1: Measure Current State

```bash
# Count lines
wc -l src/app/g/[slug]/gallery-client.tsx

# Count useState hooks
grep -c "useState" src/app/g/[slug]/gallery-client.tsx

# Count inline styles
grep -c "style={{" src/app/g/[slug]/gallery-client.tsx

# Count useEffect hooks
grep -c "useEffect" src/app/g/[slug]/gallery-client.tsx

# Find window.location.reload calls
grep -n "window.location.reload" src/app/g/[slug]/gallery-client.tsx
```

### Step 1.2: Identify State Groups

Categorize all useState hooks into logical groups:

| Group | States | Purpose |
|-------|--------|---------|
| **UI State** | modals, menus, loading | Transient UI interactions |
| **Selection State** | selectedIds, comparePhotos | User selections |
| **View State** | filters, sorting, layout | Display preferences |
| **Data State** | photos, comments, favorites | Server data |
| **Form State** | inputs, validation | Form handling |

### Step 1.3: Identify Dependencies

Map which states are used together:
- States passed to same components
- States updated in same handlers
- States with interdependencies

---

## Phase 2: State Consolidation

### Step 2.1: Design Reducer State Shape

```typescript
// Example: Gallery reducer state
interface GalleryState {
  // UI State
  ui: {
    activeModal: 'lightbox' | 'qr' | 'download' | null;
    isLoading: boolean;
    showLinkCopied: boolean;
  };

  // Selection State
  selection: {
    mode: 'none' | 'select' | 'compare';
    selectedIds: Set<string>;
    compareIds: [string?, string?];
  };

  // View State
  view: {
    layout: 'grid' | 'list';
    showFavoritesOnly: boolean;
    sortBy: 'date' | 'name';
  };

  // Lightbox State
  lightbox: {
    photoId: string | null;
    zoomLevel: number;
  };
}
```

### Step 2.2: Define Action Types

```typescript
type GalleryAction =
  // UI Actions
  | { type: 'OPEN_MODAL'; modal: GalleryState['ui']['activeModal'] }
  | { type: 'CLOSE_MODAL' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SHOW_LINK_COPIED' }

  // Selection Actions
  | { type: 'TOGGLE_SELECTION_MODE' }
  | { type: 'TOGGLE_PHOTO_SELECTED'; photoId: string }
  | { type: 'SELECT_ALL' }
  | { type: 'CLEAR_SELECTION' }

  // View Actions
  | { type: 'TOGGLE_FAVORITES_FILTER' }
  | { type: 'SET_LAYOUT'; layout: GalleryState['view']['layout'] }

  // Lightbox Actions
  | { type: 'OPEN_LIGHTBOX'; photoId: string }
  | { type: 'CLOSE_LIGHTBOX' }
  | { type: 'SET_ZOOM'; level: number };
```

### Step 2.3: Implement Reducer

```typescript
function galleryReducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { ...state, ui: { ...state.ui, activeModal: action.modal } };

    case 'CLOSE_MODAL':
      return { ...state, ui: { ...state.ui, activeModal: null } };

    case 'TOGGLE_PHOTO_SELECTED': {
      const newSelected = new Set(state.selection.selectedIds);
      if (newSelected.has(action.photoId)) {
        newSelected.delete(action.photoId);
      } else {
        newSelected.add(action.photoId);
      }
      return {
        ...state,
        selection: { ...state.selection, selectedIds: newSelected }
      };
    }

    // ... more cases

    default:
      return state;
  }
}
```

---

## Phase 3: Context Creation

### Step 3.1: Create Context File

```typescript
// src/contexts/gallery-context.tsx
import { createContext, useContext, useReducer, type ReactNode } from 'react';

interface GalleryContextValue {
  state: GalleryState;
  dispatch: React.Dispatch<GalleryAction>;
  // Computed values
  selectedCount: number;
  hasSelection: boolean;
  // Common actions as convenience methods
  openLightbox: (photoId: string) => void;
  closeLightbox: () => void;
  togglePhotoSelected: (photoId: string) => void;
}

const GalleryContext = createContext<GalleryContextValue | null>(null);

export function GalleryProvider({
  children,
  initialState
}: {
  children: ReactNode;
  initialState: Partial<GalleryState>;
}) {
  const [state, dispatch] = useReducer(galleryReducer, {
    ...defaultState,
    ...initialState
  });

  const value: GalleryContextValue = {
    state,
    dispatch,
    // Computed
    selectedCount: state.selection.selectedIds.size,
    hasSelection: state.selection.selectedIds.size > 0,
    // Actions
    openLightbox: (photoId) => dispatch({ type: 'OPEN_LIGHTBOX', photoId }),
    closeLightbox: () => dispatch({ type: 'CLOSE_LIGHTBOX' }),
    togglePhotoSelected: (photoId) => dispatch({ type: 'TOGGLE_PHOTO_SELECTED', photoId }),
  };

  return (
    <GalleryContext.Provider value={value}>
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within GalleryProvider');
  }
  return context;
}
```

---

## Phase 4: CSS Custom Properties

### Step 4.1: Define Theme Variables

Instead of passing a `colors` object, set CSS custom properties on root:

```typescript
// Before: Inline styles everywhere
<div style={{ backgroundColor: colors.cardBg, color: colors.textColor }}>

// After: CSS custom properties
<div
  className="gallery-root"
  style={{
    '--gallery-bg': colors.bgColor,
    '--gallery-text': colors.textColor,
    '--gallery-muted': colors.mutedColor,
    '--gallery-card-bg': colors.cardBg,
    '--gallery-border': colors.borderColor,
    '--gallery-primary': primaryColor,
    '--gallery-accent': accentColor,
  } as React.CSSProperties}
>
```

### Step 4.2: Create Utility Classes

Add to `globals.css` or component CSS:

```css
/* Gallery Theme Utilities */
.gallery-bg { background-color: var(--gallery-bg); }
.gallery-text { color: var(--gallery-text); }
.gallery-muted { color: var(--gallery-muted); }
.gallery-card-bg { background-color: var(--gallery-card-bg); }
.gallery-border { border-color: var(--gallery-border); }
.gallery-primary { color: var(--gallery-primary); }
.gallery-accent { background-color: var(--gallery-accent); }
```

### Step 4.3: Use Tailwind Arbitrary Values

```tsx
// Option A: Custom classes (above)
<div className="gallery-card-bg gallery-text">

// Option B: Tailwind arbitrary values
<div className="bg-[var(--gallery-card-bg)] text-[var(--gallery-text)]">
```

---

## Phase 5: Component Extraction

### Step 5.1: Identify Extraction Candidates

Look for:
- JSX blocks > 50 lines
- Self-contained UI sections (header, footer, sidebar)
- Repeated patterns
- Logical groupings (all lightbox UI, all selection UI)

### Step 5.2: Extract with Context

```typescript
// src/components/gallery/gallery-header.tsx
'use client';

import { useGallery } from '@/contexts/gallery-context';

export function GalleryHeader() {
  const {
    state,
    togglePhotoSelected,
    selectedCount
  } = useGallery();

  return (
    <header className="gallery-header gallery-bg gallery-border border-b">
      {/* Header content - no prop drilling needed */}
    </header>
  );
}
```

### Step 5.3: Memoize Appropriately

```typescript
import { memo } from 'react';

// Memoize components that receive stable props
export const GalleryHeader = memo(function GalleryHeader() {
  // ...
});

// Memoize expensive computations
const filteredPhotos = useMemo(() => {
  return photos.filter(p => /* ... */);
}, [photos, filterCriteria]);

// Memoize callbacks passed to children
const handleSelect = useCallback((id: string) => {
  dispatch({ type: 'TOGGLE_PHOTO_SELECTED', photoId: id });
}, [dispatch]);
```

---

## Phase 6: Testing & Verification

### Step 6.1: Build Check

```bash
npm run build
```

### Step 6.2: Type Check

```bash
npx tsc --noEmit
```

### Step 6.3: Manual Testing Checklist

- [ ] Page loads without errors
- [ ] Theme switching works
- [ ] All modals open/close correctly
- [ ] Selection mode works
- [ ] Lightbox navigation works
- [ ] Download functionality works
- [ ] Mobile touch gestures work

---

## Metrics to Track

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Lines of code | 3,239 | ? | < 1,500 |
| useState hooks | 30+ | ? | < 5 (using reducer) |
| Inline styles | 149 | ? | 0 |
| useEffect hooks | ? | ? | Minimize |
| Component files | 1 | ? | 5-8 |

---

## Common Patterns Found

### Pattern: Modal State

**Before:**
```typescript
const [showModal1, setShowModal1] = useState(false);
const [showModal2, setShowModal2] = useState(false);
const [showModal3, setShowModal3] = useState(false);
```

**After:**
```typescript
const [activeModal, setActiveModal] = useState<'modal1' | 'modal2' | 'modal3' | null>(null);
```

### Pattern: Loading States

**Before:**
```typescript
const [isLoading1, setIsLoading1] = useState(false);
const [isLoading2, setIsLoading2] = useState(false);
```

**After:**
```typescript
const [loadingState, setLoadingState] = useState<'idle' | 'loading1' | 'loading2'>('idle');
```

### Pattern: Toggle States

**Before:**
```typescript
const handleToggle = () => setIsOn(!isOn);
```

**After:**
```typescript
const handleToggle = () => setIsOn(prev => !prev);
// Or with reducer:
dispatch({ type: 'TOGGLE_FEATURE' });
```

---

## Files Modified in gallery-client.tsx Optimization

1. `src/contexts/gallery-context.tsx` - NEW: State management
2. `src/components/gallery/gallery-header.tsx` - NEW: Header component
3. `src/components/gallery/photo-grid.tsx` - NEW: Grid component
4. `src/components/gallery/photo-lightbox.tsx` - NEW: Lightbox component
5. `src/app/g/[slug]/gallery-client.tsx` - Modified: Main component
6. `src/app/globals.css` - Modified: CSS custom properties

---

## Troubleshooting

### Issue: Context not available
**Cause:** Component rendered outside provider
**Fix:** Ensure GalleryProvider wraps all gallery components

### Issue: Stale state in callbacks
**Cause:** Closure capturing old state
**Fix:** Use functional updates or include in deps

### Issue: Infinite re-renders
**Cause:** Object/array in useEffect deps
**Fix:** Use useMemo for objects or compare by value

---

## References

- [React useReducer docs](https://react.dev/reference/react/useReducer)
- [React Context docs](https://react.dev/reference/react/useContext)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- PhotoProOS Design System: `packages/design-system/docs/`
