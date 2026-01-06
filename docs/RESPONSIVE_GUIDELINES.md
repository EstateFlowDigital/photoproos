# Responsive Design Guidelines

This document outlines the responsive design patterns and best practices for PhotoProOS. Follow these guidelines to ensure consistent behavior across all device sizes.

## Breakpoints

PhotoProOS uses Tailwind CSS's default breakpoints:

| Breakpoint | Min Width | Common Devices |
|------------|-----------|----------------|
| `sm` | 640px | Large phones (landscape) |
| `md` | 768px | Tablets (portrait) |
| `lg` | 1024px | Tablets (landscape), small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

## Testing Checklist

Before deploying any new page or component, test at these widths:

1. **iPhone SE** - 375px (smallest common phone)
2. **iPhone 14 Pro Max** - 430px (large phone)
3. **iPad Mini** - 768px (tablet portrait)
4. **iPad Pro** - 1024px (tablet landscape)
5. **Desktop** - 1280px+

## Component Patterns

### Stats Grids

Use 2 columns on mobile, expanding to 4 on larger screens:

```tsx
<div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
  <StatCard ... />
</div>
```

### Photo Grids

Progressive column expansion:

```tsx
<div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
  <PhotoCard ... />
</div>
```

For thumbnail grids (selections, collections):

```tsx
<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
  <Thumbnail ... />
</div>
```

### Header Actions

Icon-only on mobile, text labels on desktop:

```tsx
<Link
  className="inline-flex items-center justify-center gap-2 rounded-lg border p-2.5 md:px-4 md:py-2.5"
  title="Button Title"  // Always include title for accessibility
>
  <Icon className="h-4 w-4" />
  <span className="hidden md:inline">Button Label</span>
</Link>
```

For longer labels, use `lg` breakpoint:

```tsx
<span className="hidden lg:inline">View Property Website</span>
```

### Tab Navigation

Use horizontal scroll with `overflow-x-auto`:

```tsx
<div className="border-b border-[var(--card-border)] -mx-4 px-4 sm:mx-0 sm:px-0">
  <nav className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-px"
       style={{ WebkitOverflowScrolling: 'touch' }}>
    {tabs.map(tab => (
      <button className="relative shrink-0 whitespace-nowrap py-3">
        {tab.label}
      </button>
    ))}
  </nav>
</div>
```

Key classes:
- `overflow-x-auto` - enables horizontal scrolling
- `scrollbar-hide` - hides the scrollbar (utility class)
- `shrink-0` - prevents tabs from shrinking
- `whitespace-nowrap` - keeps tab text on one line
- `-mx-4 px-4` - extends to screen edge on mobile

### Main Content Layout

Use a 3-column grid on large screens with sidebar:

```tsx
<div className="grid gap-6 lg:grid-cols-3">
  {/* Main content - 2 columns on lg */}
  <div className="lg:col-span-2 space-y-6">
    {/* Content */}
  </div>

  {/* Sidebar - stacks below on mobile/tablet */}
  <div className="space-y-6">
    {/* Sidebar content */}
  </div>
</div>
```

### Cards and Containers

Responsive padding:

```tsx
<div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 sm:p-4 md:p-6">
```

### Tables

For data tables, use responsive patterns:

```tsx
<div className="overflow-x-auto">
  <table className="w-full min-w-[600px]">
    {/* Table content */}
  </table>
</div>
```

Hide non-essential columns on mobile:

```tsx
<th className="hidden md:table-cell">Services</th>
<th className="hidden lg:table-cell">Views</th>
```

### Buttons

Responsive button sizing:

```tsx
// Small on mobile, larger on desktop
<button className="px-3 py-2 md:px-4 md:py-2.5 text-sm">

// Full width on mobile, auto on desktop
<button className="w-full sm:w-auto">
```

### Typography

Responsive text sizes:

```tsx
// Headings
<h1 className="text-xl sm:text-2xl font-bold">
<h2 className="text-lg sm:text-xl font-semibold">

// Stats/numbers
<p className="text-xl sm:text-2xl font-bold">
```

### Gaps and Spacing

Use responsive gaps:

```tsx
<div className="flex gap-2 md:gap-3">     // Button groups
<div className="space-y-4 md:space-y-6">  // Vertical stacks
<div className="grid gap-3 sm:gap-4">     // Grid gaps
```

## Utility Classes

### scrollbar-hide

Hides the scrollbar while maintaining scroll functionality. If not available, add to `globals.css`:

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

### auto-grid

Responsive grid that auto-fits columns:

```css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-min, 240px), 1fr));
  gap: var(--grid-gap, 1rem);
}

.grid-min-240 { --grid-min: 240px; }
.grid-min-280 { --grid-min: 280px; }
.grid-gap-4 { --grid-gap: 1rem; }
```

## Common Mistakes to Avoid

1. **Fixed widths** - Avoid `w-[500px]`. Use percentage or flex/grid.

2. **Missing mobile styles** - Always design mobile-first, then add larger breakpoints.

3. **Hardcoded heights** - Use `min-h-` or let content determine height.

4. **Text overflow** - Use `truncate` for single-line text that might overflow:
   ```tsx
   <p className="truncate">{longText}</p>
   ```

5. **Missing touch targets** - Buttons should be at least 44x44px on mobile:
   ```tsx
   <button className="min-h-[44px] min-w-[44px]">
   ```

6. **Horizontal scroll issues** - Test all pages for accidental horizontal scroll.

## Testing Tips

1. Use Chrome DevTools device toolbar (Cmd+Shift+M)
2. Test actual devices when possible
3. Check both portrait and landscape orientations
4. Test with different text lengths (short and long names)
5. Test with 0, 1, few, and many items in lists

## Quick Reference

```
Mobile (< 640px):
- 2-column grids
- Icon-only buttons
- Stacked layouts
- Full-width elements

Tablet (768px - 1023px):
- 3-4 column grids
- Text labels on buttons
- Side-by-side layouts begin

Desktop (1024px+):
- Full grid layouts
- Sidebar appears
- All features visible
```
