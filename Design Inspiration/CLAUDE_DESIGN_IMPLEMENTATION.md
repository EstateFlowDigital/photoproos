# Claude Design System Implementation Guide

> **Purpose:** This document is the definitive instruction set for implementing the VS Applications design system. It completely replaces the previous color system and establishes a unified visual language across all applications.

> **Inspiration:** Dovetail (customer intelligence platform) + Railway (developer infrastructure)

> **Mode:** Dark-first design with light mode inversion

---

## Table of Contents

1. [Critical Rules](#1-critical-rules)
2. [Code Architecture & Consistency](#2-code-architecture--consistency)
3. [Color System - Complete Replacement](#3-color-system---complete-replacement)
4. [Typography System](#4-typography-system)
5. [Spacing & Layout](#5-spacing--layout)
6. [Component Specifications](#6-component-specifications)
7. [Navigation Patterns](#7-navigation-patterns)
8. [Dashboard Layouts](#8-dashboard-layouts)
9. [Landing Page Specifications](#9-landing-page-specifications)
10. [Data Visualization](#10-data-visualization)
11. [Animation & Transitions](#11-animation--transitions)
12. [Implementation Checklist](#12-implementation-checklist)

---

## 1. Critical Rules

### Mandatory Requirements

1. **NEVER hardcode colors** - All colors MUST come from CSS custom properties
2. **Dark mode is primary** - Design and build dark mode first, then invert for light
3. **Consistency over creativity** - Use existing patterns; if something doesn't exist, add it to the system first
4. **Every element needs a semantic class** - No styling with only utility classes
5. **Token hierarchy must be respected** - Components use semantic tokens, never primitives

### File Modification Order

When implementing this design system:

```
1. packages/design-system/styles/tokens.css    ← Replace color tokens
2. packages/design-system/styles/base.css      ← Update base styles
3. packages/design-system/styles/utilities.css ← Add new utilities
4. Individual app globals.css                   ← Import design system
```

### Breaking Changes

This implementation **completely replaces** the following:

- All `--brand-*` primitive tokens
- All `--background*` tokens
- All `--foreground*` tokens
- All `--card*` tokens
- All `--border*` tokens
- All `--muted*` tokens
- All `--sidebar*` tokens
- All `--shadow-*` tokens
- All `--accent-*` tokens

---

## 2. Code Architecture & Consistency

### 2.1 Component Philosophy

**Every component should be:**
- **Predictable** - Same input = same output, every time
- **Composable** - Small pieces that combine into larger systems
- **Self-contained** - Styles, logic, and markup together
- **Reusable** - Built once, used everywhere

### 2.2 File & Folder Structure

All applications MUST follow this component organization:

```
app/
├── components/
│   ├── ui/                    # Primitive UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── dropdown.tsx
│   │   └── index.ts           # Barrel export
│   │
│   ├── layout/                # Layout components
│   │   ├── sidebar.tsx
│   │   ├── nav.tsx
│   │   ├── page-header.tsx
│   │   └── index.ts
│   │
│   ├── data-display/          # Data visualization
│   │   ├── metric-card.tsx
│   │   ├── chart-container.tsx
│   │   ├── data-table.tsx
│   │   └── index.ts
│   │
│   └── [feature]/             # Feature-specific components
│       ├── feature-widget.tsx
│       └── index.ts
│
├── lib/
│   ├── utils.ts               # Utility functions (cn, formatters)
│   └── constants.ts           # App constants
│
└── styles/
    └── globals.css            # Imports design system
```

### 2.3 Component Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MetricCard`, `FilterPill` |
| Files | kebab-case | `metric-card.tsx`, `filter-pill.tsx` |
| CSS Classes | kebab-case | `.metric-card`, `.filter-pill` |
| CSS Variables | kebab-case with `--` prefix | `--card-radius`, `--btn-height` |
| Props interfaces | PascalCase + Props | `MetricCardProps`, `ButtonProps` |

### 2.4 Component Template

Every component MUST follow this structure:

```tsx
// components/ui/card.tsx

import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// ============================================
// COMPONENT
// ============================================

export function Card({
  className,
  variant = 'default',
  padding = 'md',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles - ALWAYS present
        'card',

        // Variant styles
        variant === 'elevated' && 'card-elevated',
        variant === 'outline' && 'card-outline',

        // Padding variants
        padding === 'none' && 'card-padding-none',
        padding === 'sm' && 'card-padding-sm',
        padding === 'lg' && 'card-padding-lg',

        // Allow overrides
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS (if needed)
// ============================================

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card-header', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('card-title', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card-content', className)} {...props} />;
}
```

### 2.5 The `cn()` Utility

All projects MUST use this utility for class merging:

```ts
// lib/utils.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 2.6 CSS Class Architecture

**Every styled element needs TWO things:**

1. **A semantic base class** - Describes what the element IS
2. **Token-based styles** - Uses CSS variables, never hardcoded values

```css
/* CORRECT - Semantic class with tokens */
.metric-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
}

.metric-card-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--foreground);
}

/* WRONG - No semantic meaning */
.bg-card.rounded-lg.p-6.border {
  /* This tells us nothing about what this element represents */
}

/* WRONG - Hardcoded values */
.metric-card {
  background: #141414;
  border-radius: 12px;
  padding: 24px;
}
```

### 2.7 Shared Components Across Apps

These components MUST be identical across all applications:

| Component | Location | Used For |
|-----------|----------|----------|
| `Button` | `components/ui/button.tsx` | All button interactions |
| `Card` | `components/ui/card.tsx` | Content containers |
| `Input` | `components/ui/input.tsx` | Form inputs |
| `Badge` | `components/ui/badge.tsx` | Status indicators |
| `FilterPill` | `components/ui/filter-pill.tsx` | Filter controls |
| `MetricCard` | `components/data-display/metric-card.tsx` | KPI displays |
| `Sidebar` | `components/layout/sidebar.tsx` | Navigation sidebar |
| `PageHeader` | `components/layout/page-header.tsx` | Page titles |

### 2.8 Props Standardization

Common props MUST use consistent naming:

```tsx
// Size variants - use 'size' prop
size?: 'sm' | 'md' | 'lg'

// Visual variants - use 'variant' prop
variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'destructive'

// State - use boolean props
disabled?: boolean
loading?: boolean
active?: boolean

// Content - use 'children' or specific names
children?: React.ReactNode
icon?: React.ReactNode
label?: string
title?: string
description?: string

// Actions - use 'on' prefix
onClick?: () => void
onChange?: (value: T) => void
onSubmit?: (data: T) => void
```

### 2.9 CSS Organization Within Files

When writing CSS, organize in this order:

```css
/* ============================================
   COMPONENT NAME
   ============================================ */

/* 1. Base styles */
.component {
  /* Layout */
  display: flex;

  /* Box model */
  padding: var(--space-4);
  margin: 0;

  /* Visual */
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);

  /* Typography */
  font-size: var(--text-sm);
  color: var(--foreground);

  /* Transitions */
  transition: all var(--duration-fast) var(--ease-out);
}

/* 2. State variations */
.component:hover {
  border-color: var(--border-emphasis);
}

.component:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--ring);
}

.component:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 3. Variants */
.component-primary {
  background: var(--primary);
  color: var(--primary-foreground);
}

.component-secondary {
  background: var(--secondary);
}

/* 4. Sizes */
.component-sm {
  height: var(--btn-height-sm);
  padding: 0 var(--space-3);
}

.component-lg {
  height: var(--btn-height-lg);
  padding: 0 var(--space-6);
}

/* 5. Child elements */
.component-icon {
  width: 16px;
  height: 16px;
}

.component-label {
  font-weight: var(--font-medium);
}
```

### 2.10 Import Order

All files MUST use this import order:

```tsx
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// 3. Internal utilities/lib
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';

// 4. Internal components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 5. Types (if separate file)
import type { MetricData } from '@/types';

// 6. Styles (if CSS modules)
import styles from './component.module.css';
```

### 2.11 Do NOT Create

To maintain consistency, NEVER create:

- [ ] Inline styles (`style={{ color: 'red' }}`)
- [ ] One-off utility classes
- [ ] Duplicate components with slight variations
- [ ] Component-specific CSS files (use the design system)
- [ ] New color values not in tokens
- [ ] New spacing values not in tokens
- [ ] Wrapper components that just add className

### 2.12 When You Need Something New

If a pattern doesn't exist:

1. **Check the design system first** - It might exist under a different name
2. **Check other apps** - Another app might have solved this
3. **Add to design system** - If truly new, add it to `packages/design-system/`
4. **Document it** - Update the relevant index file
5. **Use everywhere** - Apply consistently across all apps

### 2.13 Code Review Checklist

Before completing any UI work, verify:

- [ ] All colors use CSS variables
- [ ] All spacing uses `var(--space-*)` tokens
- [ ] All border-radius uses `var(--radius-*)` tokens
- [ ] Components have semantic class names
- [ ] Props follow standard naming conventions
- [ ] Component follows the standard template structure
- [ ] No inline styles
- [ ] No hardcoded values
- [ ] Dark mode works correctly
- [ ] Focus states are visible
- [ ] Hover states are implemented

---

## 3. Color System - Complete Replacement

### 3.1 Dark Mode Tokens (Primary)

Replace the entire `:root` and `.dark` sections in `tokens.css`:

```css
/* ============================================
   VS APPLICATIONS DESIGN SYSTEM - TOKENS
   Version: 3.0.0 (Dovetail/Railway Inspired)

   DARK MODE FIRST DESIGN
   ============================================ */

:root {
  /* ============================================
     PRIMITIVE TOKENS - DO NOT USE DIRECTLY
     ============================================ */

  /* Neutrals - Gray Scale */
  --gray-950: #0a0a0a;
  --gray-900: #0d0d0d;
  --gray-850: #111111;
  --gray-800: #141414;
  --gray-750: #1a1a1a;
  --gray-700: #1f1f1f;
  --gray-650: #262626;
  --gray-600: #2a2a2a;
  --gray-550: #333333;
  --gray-500: #404040;
  --gray-450: #525252;
  --gray-400: #6b7280;
  --gray-300: #9ca3af;
  --gray-200: #a1a1a1;
  --gray-100: #d1d5db;
  --gray-50: #f9fafb;

  /* Brand Blue */
  --blue-50: #eff6ff;
  --blue-100: #dbeafe;
  --blue-200: #bfdbfe;
  --blue-300: #93c5fd;
  --blue-400: #60a5fa;
  --blue-500: #3b82f6;
  --blue-600: #2563eb;
  --blue-700: #1d4ed8;

  /* Success Green */
  --green-400: #4ade80;
  --green-500: #22c55e;
  --green-600: #16a34a;

  /* Warning Orange */
  --orange-400: #fb923c;
  --orange-500: #f97316;
  --orange-600: #ea580c;

  /* Error Red */
  --red-400: #f87171;
  --red-500: #ef4444;
  --red-600: #dc2626;

  /* AI Purple */
  --purple-300: #c4b5fd;
  --purple-400: #a78bfa;
  --purple-500: #8b5cf6;
  --purple-600: #7c3aed;

  /* Cyan Accent */
  --cyan-400: #22d3ee;
  --cyan-500: #06b6d4;

  /* Pink Accent */
  --pink-400: #f472b6;
  --pink-500: #ec4899;

  /* ============================================
     SEMANTIC TOKENS - DARK MODE (DEFAULT)
     USE THESE IN COMPONENTS
     ============================================ */

  /* === BACKGROUNDS === */
  --background: #0a0a0a;                    /* Deepest - page canvas */
  --background-secondary: #0d0d0d;          /* Slightly elevated */
  --background-elevated: #141414;           /* Cards, panels */
  --background-overlay: #1a1a1a;            /* Modals, dropdowns */
  --background-interactive: #1f1f1f;        /* Hover states */
  --background-active: #262626;             /* Selected/active states */

  /* === TEXT === */
  --foreground: #ffffff;                    /* Primary text - headlines */
  --foreground-secondary: #a1a1a1;          /* Body text, descriptions */
  --foreground-muted: #6b7280;              /* Labels, captions, hints */
  --foreground-disabled: #404040;           /* Disabled text */

  /* === SURFACES (Cards, Panels) === */
  --card: #141414;
  --card-foreground: #ffffff;
  --card-foreground-secondary: #a1a1a1;
  --card-border: #262626;
  --card-border-hover: #333333;

  /* === BORDERS === */
  --border: #262626;                        /* Default borders */
  --border-subtle: #1f1f1f;                 /* Very subtle separators */
  --border-emphasis: #333333;               /* Emphasized borders */
  --border-focus: #3b82f6;                  /* Focus rings */

  /* === PRIMARY ACTION (Blue) === */
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-foreground: #ffffff;

  /* === SECONDARY ACTION === */
  --secondary: #1f1f1f;
  --secondary-hover: #262626;
  --secondary-foreground: #ffffff;
  --secondary-border: #333333;

  /* === MUTED (Subtle backgrounds) === */
  --muted: #1a1a1a;
  --muted-foreground: #6b7280;

  /* === ACCENT (Highlight) === */
  --accent: #1f1f1f;
  --accent-foreground: #ffffff;

  /* === DESTRUCTIVE === */
  --destructive: #ef4444;
  --destructive-hover: #dc2626;
  --destructive-foreground: #ffffff;

  /* === SUCCESS === */
  --success: #22c55e;
  --success-hover: #16a34a;
  --success-foreground: #ffffff;
  --success-muted: rgba(34, 197, 94, 0.15);

  /* === WARNING === */
  --warning: #f97316;
  --warning-hover: #ea580c;
  --warning-foreground: #ffffff;
  --warning-muted: rgba(249, 115, 22, 0.15);

  /* === ERROR === */
  --error: #ef4444;
  --error-hover: #dc2626;
  --error-foreground: #ffffff;
  --error-muted: rgba(239, 68, 68, 0.15);

  /* === AI/INTELLIGENCE FEATURES === */
  --ai: #8b5cf6;
  --ai-hover: #7c3aed;
  --ai-foreground: #ffffff;
  --ai-muted: rgba(139, 92, 246, 0.15);

  /* === RING (Focus states) === */
  --ring: #3b82f6;
  --ring-offset: #0a0a0a;

  /* === INPUT === */
  --input: #141414;
  --input-border: #262626;
  --input-border-focus: #3b82f6;
  --input-placeholder: #6b7280;

  /* === SIDEBAR === */
  --sidebar: #0d0d0d;
  --sidebar-foreground: #ffffff;
  --sidebar-foreground-muted: #6b7280;
  --sidebar-border: #1f1f1f;
  --sidebar-accent: #1f1f1f;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-item-hover: #1a1a1a;
  --sidebar-item-active: #262626;

  /* === NAVIGATION === */
  --nav: rgba(10, 10, 10, 0.8);            /* With backdrop blur */
  --nav-foreground: #ffffff;
  --nav-border: #1f1f1f;

  /* ============================================
     DATA VISUALIZATION PALETTE
     ============================================ */
  --chart-blue: #3b82f6;
  --chart-green: #22c55e;
  --chart-orange: #f97316;
  --chart-purple: #8b5cf6;
  --chart-pink: #ec4899;
  --chart-cyan: #06b6d4;
  --chart-yellow: #eab308;
  --chart-red: #ef4444;

  /* Chart backgrounds (for legends, etc.) */
  --chart-blue-muted: rgba(59, 130, 246, 0.15);
  --chart-green-muted: rgba(34, 197, 94, 0.15);
  --chart-orange-muted: rgba(249, 115, 22, 0.15);
  --chart-purple-muted: rgba(139, 92, 246, 0.15);

  /* ============================================
     SHADOWS - Dark Mode
     ============================================ */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-2xl: 0 16px 48px rgba(0, 0, 0, 0.6);

  /* Glow effects */
  --shadow-glow-blue: 0 0 20px rgba(59, 130, 246, 0.3);
  --shadow-glow-purple: 0 0 20px rgba(139, 92, 246, 0.3);
  --shadow-glow-green: 0 0 20px rgba(34, 197, 94, 0.3);

  /* Component shadows */
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.3);
  --shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-dropdown: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
  --shadow-modal: 0 16px 48px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
  --shadow-popover: 0 4px 20px rgba(0, 0, 0, 0.5);

  /* ============================================
     TYPOGRAPHY
     ============================================ */
  --font-sans: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", Consolas, monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 2rem;        /* 32px */
  --text-4xl: 2.5rem;      /* 40px */
  --text-5xl: 3rem;        /* 48px */
  --text-6xl: 4rem;        /* 64px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.2;
  --leading-snug: 1.35;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* Letter Spacing */
  --tracking-tighter: -0.03em;
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;

  /* ============================================
     SPACING
     ============================================ */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;   /* 2px */
  --space-1: 0.25rem;      /* 4px */
  --space-1-5: 0.375rem;   /* 6px */
  --space-2: 0.5rem;       /* 8px */
  --space-2-5: 0.625rem;   /* 10px */
  --space-3: 0.75rem;      /* 12px */
  --space-4: 1rem;         /* 16px */
  --space-5: 1.25rem;      /* 20px */
  --space-6: 1.5rem;       /* 24px */
  --space-8: 2rem;         /* 32px */
  --space-10: 2.5rem;      /* 40px */
  --space-12: 3rem;        /* 48px */
  --space-16: 4rem;        /* 64px */
  --space-20: 5rem;        /* 80px */
  --space-24: 6rem;        /* 96px */
  --space-32: 8rem;        /* 128px */

  /* Component-specific spacing */
  --padding-card: var(--space-6);
  --padding-section: var(--space-16);
  --padding-page: var(--space-6);
  --gap-card: var(--space-6);

  /* ============================================
     BORDER RADIUS
     ============================================ */
  --radius-none: 0;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;

  /* ============================================
     TRANSITIONS
     ============================================ */
  --duration-instant: 50ms;
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 400ms;

  --ease-linear: linear;
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* ============================================
     Z-INDEX SCALE
     ============================================ */
  --z-base: 0;
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-overlay: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;

  /* ============================================
     COMPONENT TOKENS
     ============================================ */

  /* Buttons */
  --btn-height-sm: 32px;
  --btn-height-md: 40px;
  --btn-height-lg: 48px;
  --btn-padding-x: var(--space-4);
  --btn-radius: var(--radius-md);
  --btn-font-weight: var(--font-medium);

  /* Inputs */
  --input-height-sm: 32px;
  --input-height-md: 40px;
  --input-height-lg: 48px;
  --input-padding-x: var(--space-3);
  --input-radius: var(--radius-md);

  /* Cards */
  --card-radius: var(--radius-lg);
  --card-padding: var(--space-6);

  /* Pills/Badges */
  --pill-height: 28px;
  --pill-padding-x: var(--space-3);
  --pill-radius: var(--radius-full);
  --pill-font-size: var(--text-sm);

  /* Section Labels */
  --label-size: 11px;
  --label-weight: var(--font-medium);
  --label-tracking: 0.08em;
  --label-transform: uppercase;
}
```

### 3.2 Light Mode Tokens

```css
/* ============================================
   LIGHT MODE TOKENS
   Applied via .light class or system preference
   ============================================ */
.light {
  /* === BACKGROUNDS === */
  --background: #ffffff;
  --background-secondary: #f9fafb;
  --background-elevated: #ffffff;
  --background-overlay: #ffffff;
  --background-interactive: #f3f4f6;
  --background-active: #e5e7eb;

  /* === TEXT === */
  --foreground: #111827;
  --foreground-secondary: #4b5563;
  --foreground-muted: #9ca3af;
  --foreground-disabled: #d1d5db;

  /* === SURFACES === */
  --card: #ffffff;
  --card-foreground: #111827;
  --card-foreground-secondary: #4b5563;
  --card-border: #e5e7eb;
  --card-border-hover: #d1d5db;

  /* === BORDERS === */
  --border: #e5e7eb;
  --border-subtle: #f3f4f6;
  --border-emphasis: #d1d5db;
  --border-focus: #3b82f6;

  /* === PRIMARY === */
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-foreground: #ffffff;

  /* === SECONDARY === */
  --secondary: #f3f4f6;
  --secondary-hover: #e5e7eb;
  --secondary-foreground: #111827;
  --secondary-border: #e5e7eb;

  /* === MUTED === */
  --muted: #f9fafb;
  --muted-foreground: #6b7280;

  /* === SIDEBAR === */
  --sidebar: #f9fafb;
  --sidebar-foreground: #111827;
  --sidebar-foreground-muted: #6b7280;
  --sidebar-border: #e5e7eb;
  --sidebar-accent: #f3f4f6;
  --sidebar-accent-foreground: #111827;
  --sidebar-item-hover: #f3f4f6;
  --sidebar-item-active: #e5e7eb;

  /* === NAVIGATION === */
  --nav: rgba(255, 255, 255, 0.8);
  --nav-foreground: #111827;
  --nav-border: #e5e7eb;

  /* === INPUT === */
  --input: #ffffff;
  --input-border: #e5e7eb;
  --input-border-focus: #3b82f6;
  --input-placeholder: #9ca3af;

  /* === RING === */
  --ring: #3b82f6;
  --ring-offset: #ffffff;

  /* === SHADOWS - Light Mode === */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.03);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-2xl: 0 16px 48px rgba(0, 0, 0, 0.15);

  --shadow-glow-blue: 0 0 20px rgba(59, 130, 246, 0.15);
  --shadow-glow-purple: 0 0 20px rgba(139, 92, 246, 0.15);
  --shadow-glow-green: 0 0 20px rgba(34, 197, 94, 0.15);

  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.03);
  --shadow-card-hover: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-dropdown: 0 4px 16px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
  --shadow-modal: 0 16px 48px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
  --shadow-popover: 0 4px 20px rgba(0, 0, 0, 0.1);

  /* Semantic colors stay the same in light mode */
  /* (success, warning, error, ai colors) */
}

/* System preference fallback */
@media (prefers-color-scheme: light) {
  :root:not(.dark) {
    /* Copy all .light values here */
  }
}
```

---

## 4. Typography System

### 4.1 Headline Patterns

**Two-Tone Headlines (Dovetail Style):**
```css
.headline-two-tone {
  color: var(--foreground);
}

.headline-two-tone .muted {
  color: var(--foreground-muted);
}
```

Usage:
```html
<h1 class="headline-two-tone">
  <span class="muted">Real-time customer</span> intelligence
</h1>
```

### 4.2 Section Labels

```css
.section-label {
  font-size: var(--label-size);
  font-weight: var(--label-weight);
  letter-spacing: var(--label-tracking);
  text-transform: var(--label-transform);
  color: var(--foreground-muted);
}
```

### 4.3 Metric Displays

```css
.metric-value {
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-none);
  color: var(--foreground);
}

.metric-change {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.metric-change.positive {
  color: var(--success);
}

.metric-change.negative {
  color: var(--error);
}
```

---

## 5. Spacing & Layout

### 5.1 Page Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Navigation (sticky)                            h: 64px     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │     Main Content Area                               │   │
│  │     max-width: 1280px                               │   │
│  │     padding: var(--padding-page)                    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Section gap: var(--space-24) / 96px                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Dashboard Layout with Sidebar

```
┌──────────┬──────────────────────────────────────────────────┐
│          │  Header (optional sticky)                        │
│  Sidebar │──────────────────────────────────────────────────│
│  w: 280px│                                                  │
│          │  Dashboard Content                               │
│  bg:     │  padding: var(--space-6)                        │
│  --sidebar│  gap: var(--space-6)                            │
│          │                                                  │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│          │  │  Card    │ │  Card    │ │  Card    │         │
│          │  └──────────┘ └──────────┘ └──────────┘         │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

### 5.3 Card Grid System

```css
.dashboard-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}

/* Span variations */
.card-span-2 { grid-column: span 2; }
.card-span-3 { grid-column: span 3; }
.card-span-full { grid-column: 1 / -1; }
```

---

## 6. Component Specifications

### 6.1 Cards

```css
.card {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  transition: border-color var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out);
}

.card:hover {
  border-color: var(--card-border-hover);
  box-shadow: var(--shadow-card-hover);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.card-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--card-foreground);
}

.card-description {
  font-size: var(--text-sm);
  color: var(--card-foreground-secondary);
}
```

### 6.2 Buttons

```css
/* Primary Button */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--btn-height-md);
  padding: 0 var(--btn-padding-x);
  background: var(--foreground);      /* White in dark mode */
  color: var(--background);           /* Dark in dark mode */
  border: none;
  border-radius: var(--btn-radius);
  font-weight: var(--btn-font-weight);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.btn-primary:hover {
  opacity: 0.9;
}

/* Secondary/Ghost Button */
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: var(--btn-height-md);
  padding: 0 var(--btn-padding-x);
  background: transparent;
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: var(--btn-radius);
  font-weight: var(--btn-font-weight);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
}

.btn-secondary:hover {
  background: var(--background-interactive);
  border-color: var(--border-emphasis);
}
```

### 6.3 Filter Pills

```css
.filter-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  height: var(--pill-height);
  padding: 0 var(--pill-padding-x);
  background: var(--background-interactive);
  color: var(--foreground);
  border: 1px solid var(--border);
  border-radius: var(--pill-radius);
  font-size: var(--pill-font-size);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.filter-pill:hover {
  background: var(--background-active);
  border-color: var(--border-emphasis);
}

.filter-pill.active {
  background: var(--primary);
  color: var(--primary-foreground);
  border-color: var(--primary);
}

.filter-pill .count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--space-1-5);
  background: var(--background-active);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
}
```

### 6.4 Inputs

```css
.input {
  width: 100%;
  height: var(--input-height-md);
  padding: 0 var(--input-padding-x);
  background: var(--input);
  color: var(--foreground);
  border: 1px solid var(--input-border);
  border-radius: var(--input-radius);
  font-size: var(--text-sm);
  transition: border-color var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out);
}

.input::placeholder {
  color: var(--input-placeholder);
}

.input:focus {
  outline: none;
  border-color: var(--input-border-focus);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
```

### 6.5 Badges/Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  background: var(--muted);
  color: var(--muted-foreground);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.badge-success {
  background: var(--success-muted);
  color: var(--success);
}

.badge-warning {
  background: var(--warning-muted);
  color: var(--warning);
}

.badge-error {
  background: var(--error-muted);
  color: var(--error);
}

.badge-ai {
  background: var(--ai-muted);
  color: var(--ai);
}
```

---

## 7. Navigation Patterns

### 7.1 Top Navigation

```css
.nav-top {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: 64px;
  padding: 0 var(--space-6);
  background: var(--nav);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--nav-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-logo {
  font-weight: var(--font-semibold);
  font-size: var(--text-lg);
  color: var(--nav-foreground);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.nav-link {
  padding: var(--space-2) var(--space-3);
  color: var(--foreground-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
}

.nav-link:hover {
  color: var(--foreground);
  background: var(--background-interactive);
}

.nav-link.active {
  color: var(--foreground);
}
```

### 7.2 Sidebar Navigation

```css
.sidebar {
  width: 280px;
  height: 100vh;
  position: sticky;
  top: 0;
  background: var(--sidebar);
  border-right: 1px solid var(--sidebar-border);
  padding: var(--space-4);
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: var(--space-6);
}

.sidebar-section-title {
  font-size: var(--label-size);
  font-weight: var(--label-weight);
  letter-spacing: var(--label-tracking);
  text-transform: var(--label-transform);
  color: var(--sidebar-foreground-muted);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-1);
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  color: var(--sidebar-foreground);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.sidebar-item:hover {
  background: var(--sidebar-item-hover);
}

.sidebar-item.active {
  background: var(--sidebar-item-active);
  color: var(--primary);
}

.sidebar-item-icon {
  width: 20px;
  height: 20px;
  color: var(--sidebar-foreground-muted);
}

.sidebar-item.active .sidebar-item-icon {
  color: var(--primary);
}

.sidebar-badge {
  margin-left: auto;
  padding: var(--space-0-5) var(--space-2);
  background: var(--sidebar-accent);
  color: var(--sidebar-foreground-muted);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}
```

---

## 8. Dashboard Layouts

### 8.1 Standard Dashboard Template

Every dashboard across all apps MUST follow this structure:

```html
<div class="dashboard-layout">
  <!-- Optional: Sidebar -->
  <aside class="sidebar">
    <!-- Sidebar content -->
  </aside>

  <main class="dashboard-main">
    <!-- Optional: Page Header -->
    <header class="dashboard-header">
      <div class="dashboard-header-content">
        <h1 class="dashboard-title">Page Title</h1>
        <p class="dashboard-description">Optional description</p>
      </div>
      <div class="dashboard-header-actions">
        <!-- Action buttons -->
      </div>
    </header>

    <!-- Filter Bar (if needed) -->
    <div class="filter-bar">
      <!-- Filter pills -->
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Cards -->
    </div>
  </main>
</div>
```

```css
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--background);
}

.dashboard-main {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-6);
}

.dashboard-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--foreground);
  margin-bottom: var(--space-1);
}

.dashboard-description {
  font-size: var(--text-sm);
  color: var(--foreground-secondary);
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
}
```

### 8.2 Metric Card Layout

```css
.metric-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
}

.metric-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.metric-card-title {
  font-size: var(--text-sm);
  color: var(--foreground-secondary);
}

.metric-card-value {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--foreground);
  line-height: var(--leading-none);
  margin-bottom: var(--space-2);
}

.metric-card-change {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}
```

---

## 9. Landing Page Specifications

### 9.1 Hero Section

```css
.hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-24) var(--space-6);
  background: var(--background);
  overflow: hidden;
}

/* Grid background pattern */
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}

.hero-content {
  position: relative;
  max-width: 900px;
  text-align: center;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1-5) var(--space-4);
  background: var(--background-interactive);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--foreground-secondary);
  margin-bottom: var(--space-6);
}

.hero-title {
  font-size: var(--text-6xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tighter);
  color: var(--foreground);
  margin-bottom: var(--space-6);
}

.hero-title .muted {
  color: var(--foreground-muted);
}

.hero-description {
  font-size: var(--text-xl);
  color: var(--foreground-secondary);
  max-width: 600px;
  margin: 0 auto var(--space-8);
  line-height: var(--leading-relaxed);
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}
```

### 9.2 Feature Section with Icon Grid

```css
.feature-icons {
  display: flex;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-12);
}

.feature-icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--background-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  min-width: 100px;
  transition: all var(--duration-fast) var(--ease-out);
}

.feature-icon-item:hover {
  background: var(--background-interactive);
  border-color: var(--border-emphasis);
}

.feature-icon-item svg {
  width: 24px;
  height: 24px;
  color: var(--foreground-secondary);
}

.feature-icon-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--foreground-secondary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}
```

### 9.3 Logo Bar

```css
.logo-bar {
  padding: var(--space-12) var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

.logo-bar-title {
  font-size: var(--label-size);
  font-weight: var(--label-weight);
  letter-spacing: var(--label-tracking);
  text-transform: var(--label-transform);
  color: var(--foreground-muted);
  text-align: center;
  margin-bottom: var(--space-8);
}

.logo-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--space-8) var(--space-12);
}

.logo-item {
  opacity: 0.5;
  filter: grayscale(100%);
  transition: all var(--duration-fast) var(--ease-out);
}

.logo-item:hover {
  opacity: 1;
  filter: grayscale(0%);
}
```

---

## 10. Data Visualization

### 10.1 Chart Container

```css
.chart-container {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.chart-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--foreground);
}

.chart-subtitle {
  font-size: var(--text-sm);
  color: var(--foreground-secondary);
}
```

### 10.2 Chart Styling Guidelines

When using charting libraries (Recharts, Chart.js, etc.):

```javascript
// Standard chart colors
const chartColors = {
  blue: 'var(--chart-blue)',      // #3b82f6
  green: 'var(--chart-green)',    // #22c55e
  orange: 'var(--chart-orange)',  // #f97316
  purple: 'var(--chart-purple)',  // #8b5cf6
  pink: 'var(--chart-pink)',      // #ec4899
  cyan: 'var(--chart-cyan)',      // #06b6d4
  yellow: 'var(--chart-yellow)',  // #eab308
  red: 'var(--chart-red)',        // #ef4444
};

// Axis styling
const axisStyle = {
  stroke: 'var(--border)',
  fontSize: 12,
  fill: 'var(--foreground-muted)',
};

// Grid styling
const gridStyle = {
  stroke: 'var(--border-subtle)',
  strokeDasharray: '3 3',
};

// Tooltip styling
const tooltipStyle = {
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-3)',
  boxShadow: 'var(--shadow-dropdown)',
};
```

### 10.3 Progress Bars

```css
.progress-bar {
  height: 6px;
  background: var(--muted);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--duration-slow) var(--ease-out);
}

.progress-bar-fill.blue { background: var(--chart-blue); }
.progress-bar-fill.green { background: var(--chart-green); }
.progress-bar-fill.orange { background: var(--chart-orange); }
.progress-bar-fill.purple { background: var(--chart-purple); }
```

---

## 11. Animation & Transitions

### 11.1 Standard Transitions

```css
/* Apply to all interactive elements */
.interactive {
  transition:
    background var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out),
    opacity var(--duration-fast) var(--ease-out);
}
```

### 11.2 Hover Effects

```css
/* Lift effect for cards */
.hover-lift {
  transition: transform var(--duration-base) var(--ease-out),
              box-shadow var(--duration-base) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

/* Glow effect */
.hover-glow:hover {
  box-shadow: var(--shadow-glow-blue);
}

/* Scale effect for buttons */
.hover-scale:active {
  transform: scale(0.98);
}
```

### 11.3 Entrance Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fadeIn var(--duration-base) var(--ease-out) forwards;
}

.animate-slide-up {
  animation: slideUp var(--duration-slow) var(--ease-out) forwards;
}

.animate-scale-in {
  animation: scaleIn var(--duration-base) var(--ease-out) forwards;
}

/* Stagger children */
.stagger-children > * {
  opacity: 0;
  animation: slideUp var(--duration-slow) var(--ease-out) forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 50ms; }
.stagger-children > *:nth-child(3) { animation-delay: 100ms; }
.stagger-children > *:nth-child(4) { animation-delay: 150ms; }
.stagger-children > *:nth-child(5) { animation-delay: 200ms; }
```

### 11.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Implementation Checklist

### Phase 1: Token Replacement

- [ ] Backup existing `tokens.css`
- [ ] Replace `:root` section with new dark mode tokens
- [ ] Add `.light` class section for light mode
- [ ] Add system preference media query fallback
- [ ] Verify all semantic token names are consistent

### Phase 2: Base Styles Update

- [ ] Update `base.css` body styles to use new tokens
- [ ] Update focus states to use `--ring` token
- [ ] Update selection colors
- [ ] Update scrollbar styles

### Phase 3: Utility Classes

- [ ] Add new utility classes for backgrounds
- [ ] Add new utility classes for text colors
- [ ] Add new utility classes for borders
- [ ] Add hover effect utilities
- [ ] Add animation utilities

### Phase 4: Component Migration

For each application:

- [ ] **webflow-component-library**
  - [ ] Update navigation
  - [ ] Update cards
  - [ ] Update buttons
  - [ ] Update forms
  - [ ] Test dark/light toggle

- [ ] **lumos-webflow-app**
  - [ ] Update dashboard layout
  - [ ] Update sidebar
  - [ ] Update data cards
  - [ ] Test dark/light toggle

- [ ] **project-dashboard**
  - [ ] Update dashboard layout
  - [ ] Update navigation
  - [ ] Update cards
  - [ ] Test dark/light toggle

- [ ] **lumos-inspector**
  - [ ] Update inspector panel
  - [ ] Update toolbar
  - [ ] Test dark/light toggle

### Phase 5: Verification

- [ ] All backgrounds use correct tokens
- [ ] All text uses correct tokens
- [ ] All borders use correct tokens
- [ ] Contrast ratios meet WCAG AA (4.5:1 for text)
- [ ] Focus states are visible
- [ ] Animations respect reduced motion
- [ ] Dark/light toggle works in all apps
- [ ] No hardcoded color values remain

---

## Quick Reference Card

### Most Used Tokens

| Purpose | Token |
|---------|-------|
| Page background | `var(--background)` |
| Card background | `var(--card)` |
| Primary text | `var(--foreground)` |
| Secondary text | `var(--foreground-secondary)` |
| Muted text | `var(--foreground-muted)` |
| Default border | `var(--border)` |
| Primary action | `var(--primary)` |
| Focus ring | `var(--ring)` |

### Component Quick Styles

```css
/* Standard card */
background: var(--card);
border: 1px solid var(--card-border);
border-radius: var(--card-radius);
padding: var(--card-padding);

/* Standard button */
height: var(--btn-height-md);
padding: 0 var(--btn-padding-x);
border-radius: var(--btn-radius);
font-weight: var(--btn-font-weight);

/* Standard input */
height: var(--input-height-md);
padding: 0 var(--input-padding-x);
border: 1px solid var(--input-border);
border-radius: var(--input-radius);
```

---

*This document is the single source of truth for all VS Applications design implementation. When in doubt, refer to this guide.*
