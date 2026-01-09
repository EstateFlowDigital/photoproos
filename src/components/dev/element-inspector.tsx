"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Copy,
  Check,
  MousePointer2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripHorizontal,
  Keyboard,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowRight,
  ArrowDown,
  Columns,
  Rows,
  Palette,
  Paintbrush,
  Layers,
  Search,
} from "lucide-react";
import { getDevSettings } from "@/lib/utils/dev-settings";

// ============================================
// SMART INPUT COMPONENTS
// ============================================

// Spacing presets (in pixels)
const SPACING_PRESETS = [0, 4, 8, 12, 16, 24, 32, 48, 64];
const SIZING_PRESETS = ["auto", "100%", "fit-content", "max-content"];
const BORDER_RADIUS_PRESETS = [0, 4, 8, 12, 16, 24, 9999];
const FONT_SIZE_PRESETS = [12, 14, 16, 18, 20, 24, 32, 48];
const FONT_WEIGHT_OPTIONS = [
  { value: "100", label: "Thin" },
  { value: "200", label: "Extra Light" },
  { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
  { value: "900", label: "Black" },
];
const DISPLAY_OPTIONS = ["block", "flex", "grid", "inline", "inline-block", "inline-flex", "none"];
const POSITION_OPTIONS = ["static", "relative", "absolute", "fixed", "sticky"];
const FLEX_DIRECTION_OPTIONS = [
  { value: "row", icon: ArrowRight, label: "Row" },
  { value: "row-reverse", icon: ArrowRight, label: "Row Rev", flip: true },
  { value: "column", icon: ArrowDown, label: "Column" },
  { value: "column-reverse", icon: ArrowDown, label: "Col Rev", flip: true },
];
const JUSTIFY_OPTIONS = [
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "flex-end", label: "End" },
  { value: "space-between", label: "Between" },
  { value: "space-around", label: "Around" },
  { value: "space-evenly", label: "Evenly" },
];
const ALIGN_OPTIONS = [
  { value: "flex-start", label: "Start" },
  { value: "center", label: "Center" },
  { value: "flex-end", label: "End" },
  { value: "stretch", label: "Stretch" },
  { value: "baseline", label: "Baseline" },
];
const TEXT_ALIGN_OPTIONS = [
  { value: "left", icon: AlignLeft },
  { value: "center", icon: AlignCenter },
  { value: "right", icon: AlignRight },
  { value: "justify", icon: AlignJustify },
];

// ============================================
// DESIGN SYSTEM TOKENS REFERENCE
// ============================================

const DESIGN_TOKENS = {
  colors: {
    label: "Colors",
    tokens: [
      // Backgrounds
      { name: "--background", value: "#0a0a0a", desc: "Page background" },
      { name: "--background-secondary", value: "#141414", desc: "Cards, elevated" },
      { name: "--background-tertiary", value: "#191919", desc: "Nested elements" },
      { name: "--background-elevated", value: "#1e1e1e", desc: "Buttons, inputs" },
      { name: "--background-hover", value: "#2a2a2a", desc: "Hover state" },
      { name: "--card", value: "#141414", desc: "Card background" },
      // Foregrounds
      { name: "--foreground", value: "#ffffff", desc: "Primary text" },
      { name: "--foreground-secondary", value: "#a3a3a3", desc: "Secondary text" },
      { name: "--foreground-muted", value: "#8b8b8b", desc: "Muted text" },
      // Primary
      { name: "--primary", value: "#3b82f6", desc: "Primary actions" },
      { name: "--primary-hover", value: "#2563eb", desc: "Primary hover" },
      { name: "--primary-muted", value: "rgba(59, 130, 246, 0.15)", desc: "Primary bg" },
      // Status
      { name: "--success", value: "#22c55e", desc: "Success state" },
      { name: "--success-muted", value: "rgba(34, 197, 94, 0.15)", desc: "Success bg" },
      { name: "--warning", value: "#f97316", desc: "Warning state" },
      { name: "--warning-muted", value: "rgba(249, 115, 22, 0.15)", desc: "Warning bg" },
      { name: "--error", value: "#ef4444", desc: "Error state" },
      { name: "--error-muted", value: "rgba(239, 68, 68, 0.15)", desc: "Error bg" },
      { name: "--destructive", value: "#ef4444", desc: "Destructive" },
      { name: "--ai", value: "#8b5cf6", desc: "AI features" },
      { name: "--ai-muted", value: "rgba(139, 92, 246, 0.15)", desc: "AI bg" },
      // Borders
      { name: "--border", value: "rgba(255, 255, 255, 0.10)", desc: "Default border" },
      { name: "--border-visible", value: "#333333", desc: "Visible border" },
      { name: "--card-border", value: "rgba(255, 255, 255, 0.10)", desc: "Card border" },
    ],
  },
  spacing: {
    label: "Spacing",
    tokens: [
      { name: "--space-1", value: "0.25rem", desc: "4px" },
      { name: "--space-2", value: "0.5rem", desc: "8px" },
      { name: "--space-3", value: "0.75rem", desc: "12px" },
      { name: "--space-4", value: "1rem", desc: "16px" },
      { name: "--space-5", value: "1.25rem", desc: "20px" },
      { name: "--space-6", value: "1.5rem", desc: "24px" },
      { name: "--space-8", value: "2rem", desc: "32px" },
      { name: "--space-10", value: "2.5rem", desc: "40px" },
      { name: "--space-12", value: "3rem", desc: "48px" },
      { name: "--space-16", value: "4rem", desc: "64px" },
      { name: "--space-20", value: "5rem", desc: "80px" },
      { name: "--space-24", value: "6rem", desc: "96px" },
      { name: "--card-padding", value: "24px", desc: "Card padding" },
      { name: "--section-gap", value: "24px", desc: "Section gap" },
      { name: "--item-gap", value: "16px", desc: "Item gap" },
    ],
  },
  radius: {
    label: "Border Radius",
    tokens: [
      { name: "--radius-xs", value: "2px", desc: "Extra small" },
      { name: "--radius-sm", value: "4px", desc: "Small" },
      { name: "--radius-md", value: "8px", desc: "Medium" },
      { name: "--radius-lg", value: "12px", desc: "Large" },
      { name: "--radius-xl", value: "16px", desc: "Extra large" },
      { name: "--radius-2xl", value: "24px", desc: "2XL" },
      { name: "--radius-full", value: "9999px", desc: "Full round" },
      { name: "--card-radius", value: "var(--radius-lg)", desc: "Card radius" },
      { name: "--button-radius", value: "var(--radius-md)", desc: "Button radius" },
      { name: "--input-radius", value: "var(--radius-md)", desc: "Input radius" },
    ],
  },
  typography: {
    label: "Typography",
    tokens: [
      { name: "--text-xs", value: "0.75rem", desc: "12px" },
      { name: "--text-sm", value: "0.875rem", desc: "14px" },
      { name: "--text-base", value: "1rem", desc: "16px" },
      { name: "--text-lg", value: "1.125rem", desc: "18px" },
      { name: "--text-xl", value: "1.25rem", desc: "20px" },
      { name: "--text-2xl", value: "1.5rem", desc: "24px" },
      { name: "--text-3xl", value: "1.875rem", desc: "30px" },
      { name: "--text-4xl", value: "2.25rem", desc: "36px" },
      { name: "--font-normal", value: "400", desc: "Normal weight" },
      { name: "--font-medium", value: "500", desc: "Medium weight" },
      { name: "--font-semibold", value: "600", desc: "Semi bold" },
      { name: "--font-bold", value: "700", desc: "Bold weight" },
      { name: "--leading-tight", value: "1.25", desc: "Tight line-height" },
      { name: "--leading-normal", value: "1.5", desc: "Normal line-height" },
      { name: "--leading-relaxed", value: "1.625", desc: "Relaxed" },
    ],
  },
  shadows: {
    label: "Shadows",
    tokens: [
      { name: "--shadow-xs", value: "0 1px 2px rgba(0, 0, 0, 0.3)", desc: "Extra small" },
      { name: "--shadow-sm", value: "0 1px 3px rgba(0, 0, 0, 0.4)", desc: "Small" },
      { name: "--shadow-md", value: "0 4px 6px rgba(0, 0, 0, 0.4)", desc: "Medium" },
      { name: "--shadow-lg", value: "0 4px 12px rgba(0, 0, 0, 0.5)", desc: "Large" },
      { name: "--shadow-xl", value: "0 8px 24px rgba(0, 0, 0, 0.5)", desc: "Extra large" },
      { name: "--shadow-2xl", value: "0 16px 48px rgba(0, 0, 0, 0.6)", desc: "2XL" },
    ],
  },
  zIndex: {
    label: "Z-Index",
    tokens: [
      { name: "--z-base", value: "0", desc: "Base layer" },
      { name: "--z-dropdown", value: "100", desc: "Dropdowns" },
      { name: "--z-sticky", value: "200", desc: "Sticky elements" },
      { name: "--z-overlay", value: "300", desc: "Overlays" },
      { name: "--z-modal", value: "400", desc: "Modals" },
      { name: "--z-popover", value: "500", desc: "Popovers" },
      { name: "--z-tooltip", value: "600", desc: "Tooltips" },
      { name: "--z-toast", value: "700", desc: "Toasts" },
    ],
  },
  animation: {
    label: "Animation",
    tokens: [
      { name: "--duration-instant", value: "50ms", desc: "Instant" },
      { name: "--duration-fast", value: "150ms", desc: "Fast" },
      { name: "--duration-base", value: "200ms", desc: "Base" },
      { name: "--duration-slow", value: "300ms", desc: "Slow" },
      { name: "--duration-slower", value: "500ms", desc: "Slower" },
      { name: "--ease-out", value: "cubic-bezier(0.33, 1, 0.68, 1)", desc: "Ease out" },
      { name: "--ease-spring", value: "cubic-bezier(0.34, 1.56, 0.64, 1)", desc: "Spring" },
    ],
  },
};

// ============================================
// COMMON UTILITY CLASSES FOR SUGGESTIONS
// ============================================

const COMMON_CLASSES = {
  layout: [
    "flex", "flex-col", "flex-row", "flex-wrap", "flex-nowrap", "flex-1",
    "grid", "grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4",
    "block", "inline", "inline-block", "inline-flex", "hidden",
    "items-start", "items-center", "items-end", "items-stretch", "items-baseline",
    "justify-start", "justify-center", "justify-end", "justify-between", "justify-around", "justify-evenly",
    "self-start", "self-center", "self-end", "self-stretch",
  ],
  spacing: [
    "p-0", "p-1", "p-2", "p-3", "p-4", "p-5", "p-6", "p-8", "p-10", "p-12",
    "px-0", "px-1", "px-2", "px-3", "px-4", "px-5", "px-6", "px-8",
    "py-0", "py-1", "py-2", "py-3", "py-4", "py-5", "py-6", "py-8",
    "m-0", "m-1", "m-2", "m-3", "m-4", "m-5", "m-6", "m-8", "m-auto",
    "mx-0", "mx-1", "mx-2", "mx-3", "mx-4", "mx-auto",
    "my-0", "my-1", "my-2", "my-3", "my-4", "my-auto",
    "gap-0", "gap-1", "gap-2", "gap-3", "gap-4", "gap-5", "gap-6", "gap-8",
    "space-y-1", "space-y-2", "space-y-3", "space-y-4", "space-y-6", "space-y-8",
    "space-x-1", "space-x-2", "space-x-3", "space-x-4", "space-x-6", "space-x-8",
  ],
  sizing: [
    "w-full", "w-auto", "w-1/2", "w-1/3", "w-2/3", "w-1/4", "w-3/4", "w-screen",
    "h-full", "h-auto", "h-screen", "h-fit",
    "min-w-0", "min-w-full", "min-h-0", "min-h-full", "min-h-screen",
    "max-w-sm", "max-w-md", "max-w-lg", "max-w-xl", "max-w-2xl", "max-w-4xl", "max-w-full", "max-w-none",
  ],
  typography: [
    "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl",
    "font-normal", "font-medium", "font-semibold", "font-bold",
    "text-left", "text-center", "text-right", "text-justify",
    "text-foreground", "text-foreground-secondary", "text-foreground-muted",
    "truncate", "whitespace-nowrap", "whitespace-pre-wrap",
    "leading-none", "leading-tight", "leading-normal", "leading-relaxed",
    "tracking-tight", "tracking-normal", "tracking-wide",
  ],
  colors: [
    "bg-background", "bg-card", "bg-transparent",
    "bg-[var(--background)]", "bg-[var(--card)]", "bg-[var(--background-elevated)]", "bg-[var(--background-tertiary)]",
    "text-[var(--foreground)]", "text-[var(--foreground-secondary)]", "text-[var(--foreground-muted)]",
    "text-[var(--primary)]", "text-[var(--success)]", "text-[var(--error)]", "text-[var(--warning)]",
    "border-[var(--border)]", "border-[var(--card-border)]", "border-[var(--border-emphasis)]",
  ],
  borders: [
    "border", "border-0", "border-2", "border-t", "border-b", "border-l", "border-r",
    "rounded", "rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full", "rounded-none",
    "shadow-sm", "shadow", "shadow-md", "shadow-lg", "shadow-xl", "shadow-2xl", "shadow-none",
  ],
  positioning: [
    "relative", "absolute", "fixed", "sticky", "static",
    "top-0", "right-0", "bottom-0", "left-0", "inset-0",
    "z-0", "z-10", "z-20", "z-30", "z-40", "z-50",
    "overflow-hidden", "overflow-auto", "overflow-scroll", "overflow-visible",
    "overflow-x-auto", "overflow-x-hidden", "overflow-y-auto", "overflow-y-hidden",
  ],
  effects: [
    "opacity-0", "opacity-25", "opacity-50", "opacity-75", "opacity-100",
    "transition", "transition-all", "transition-colors", "transition-opacity", "transition-transform",
    "duration-75", "duration-100", "duration-150", "duration-200", "duration-300",
    "hover:opacity-80", "hover:opacity-90", "hover:scale-105",
    "cursor-pointer", "cursor-default", "cursor-not-allowed",
    "pointer-events-none", "pointer-events-auto",
  ],
};

// Flatten all classes for search
const ALL_CLASSES = Object.values(COMMON_CLASSES).flat();

// Token item component with copy functionality
function TokenItem({
  name,
  value,
  desc,
  isColor = false
}: {
  name: string;
  value: string;
  desc: string;
  isColor?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(`var(${name})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors text-left group"
    >
      {isColor && (
        <div
          className="w-6 h-6 rounded border border-[var(--border)] flex-shrink-0"
          style={{ backgroundColor: value.startsWith("rgba") || value.startsWith("#") ? value : `var(${name})` }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-[11px] text-[var(--primary)] truncate">{name}</code>
          {copied && <Check className="w-3 h-3 text-[var(--success)]" />}
        </div>
        <div className="text-[10px] text-[var(--foreground-muted)] truncate">{desc}</div>
      </div>
      <div className="text-[10px] text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        Click to copy
      </div>
    </button>
  );
}

// Parse numeric value and unit from CSS value
function parseValueUnit(value: string): { num: number; unit: string } {
  const match = value.match(/^(-?[\d.]+)(px|rem|em|%|vh|vw)?$/);
  if (match) {
    return { num: parseFloat(match[1]), unit: match[2] || "px" };
  }
  return { num: 0, unit: "px" };
}

// Color input with picker
function ColorInput({
  value,
  onChange,
  label
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const isTransparent = value === "transparent" || value === "rgba(0, 0, 0, 0)";

  // Convert rgb/rgba to hex for the color picker
  const getHexColor = (color: string): string => {
    if (color.startsWith("#")) return color;
    if (color.startsWith("rgb")) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, "0");
        const g = parseInt(match[2]).toString(16).padStart(2, "0");
        const b = parseInt(match[3]).toString(16).padStart(2, "0");
        return `#${r}${g}${b}`;
      }
    }
    return "#000000";
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-6 h-6 rounded border border-[var(--border)] flex-shrink-0 relative overflow-hidden"
        style={{ backgroundColor: isTransparent ? "transparent" : value }}
        title={value}
      >
        {isTransparent && (
          <div className="absolute inset-0 bg-[repeating-conic-gradient(#ccc_0_25%,#fff_0_50%)] bg-[length:8px_8px]" />
        )}
      </button>
      <input
        type="color"
        value={getHexColor(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-0 h-0 opacity-0 absolute"
        id={`color-${label}`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      />
      <label
        htmlFor={`color-${label}`}
        className="text-[10px] text-[var(--primary)] cursor-pointer hover:underline"
      >
        Pick
      </label>
    </div>
  );
}

// Spacing/sizing input with presets and unit selector
function SpacingInput({
  value,
  onChange,
  presets = SPACING_PRESETS,
  showUnit = true
}: {
  value: string;
  onChange: (v: string) => void;
  presets?: (number | string)[];
  showUnit?: boolean;
}) {
  const { num, unit } = parseValueUnit(value);
  const isKeyword = typeof value === "string" && !value.match(/^-?[\d.]/);

  const handleNumChange = (newNum: number) => {
    onChange(`${newNum}${unit}`);
  };

  const handleUnitChange = (newUnit: string) => {
    onChange(`${num}${newUnit}`);
  };

  if (isKeyword && SIZING_PRESETS.includes(value)) {
    return (
      <div className="space-y-1.5">
        <div className="flex gap-1 flex-wrap">
          {SIZING_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`px-1.5 py-0.5 text-[10px] rounded ${
                value === preset
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-elevated)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1 flex-wrap">
        {presets.slice(0, 6).map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(typeof preset === "number" ? `${preset}px` : preset)}
            className={`px-1.5 py-0.5 text-[10px] rounded ${
              num === preset || value === preset
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-elevated)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <input
          type="range"
          min="0"
          max="100"
          value={Math.min(num, 100)}
          onChange={(e) => handleNumChange(parseInt(e.target.value))}
          className="flex-1 h-1 accent-[var(--primary)]"
        />
        <input
          type="number"
          value={num}
          onChange={(e) => handleNumChange(parseFloat(e.target.value) || 0)}
          className="w-14 text-xs px-1.5 py-1 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
        {showUnit && (
          <select
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="text-xs px-1 py-1 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none"
          >
            <option value="px">px</option>
            <option value="rem">rem</option>
            <option value="em">em</option>
            <option value="%">%</option>
            <option value="vh">vh</option>
            <option value="vw">vw</option>
          </select>
        )}
      </div>
    </div>
  );
}

// Select dropdown
function SelectInput({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[] | { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full text-xs px-2 py-1.5 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
    >
      {options.map((opt) => {
        const val = typeof opt === "string" ? opt : opt.value;
        const label = typeof opt === "string" ? opt : opt.label;
        return (
          <option key={val} value={val}>{label}</option>
        );
      })}
    </select>
  );
}

// Visual toggle buttons (for flex-direction, text-align, etc.)
function ToggleButtons({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label?: string; icon?: React.ElementType; flip?: boolean }[];
}) {
  return (
    <div className="flex gap-1">
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-2 py-1.5 text-[10px] rounded flex items-center justify-center gap-1 ${
              isActive
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-elevated)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
            title={opt.label || opt.value}
          >
            {Icon && <Icon className={`w-3 h-3 ${opt.flip ? "rotate-180" : ""}`} />}
            {!Icon && (opt.label || opt.value)}
          </button>
        );
      })}
    </div>
  );
}

// Opacity slider (0-1)
function OpacityInput({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const numValue = parseFloat(value) || 1;
  const percentage = Math.round(numValue * 100);

  return (
    <div className="flex items-center gap-2">
      <input
        type="range"
        min="0"
        max="100"
        value={percentage}
        onChange={(e) => onChange((parseInt(e.target.value) / 100).toString())}
        className="flex-1 h-1 accent-[var(--primary)]"
      />
      <span className="text-xs text-[var(--foreground-muted)] w-10 text-right">{percentage}%</span>
    </div>
  );
}

// Border radius input with visual presets
function BorderRadiusInput({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { num } = parseValueUnit(value);

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {BORDER_RADIUS_PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(`${preset}px`)}
            className={`w-7 h-7 rounded flex items-center justify-center ${
              num === preset
                ? "bg-[var(--primary)]"
                : "bg-[var(--background-elevated)]"
            }`}
            title={`${preset}px`}
          >
            <div
              className={`w-4 h-4 border-2 ${num === preset ? "border-white" : "border-[var(--foreground-muted)]"}`}
              style={{ borderRadius: preset === 9999 ? "50%" : `${Math.min(preset, 8)}px` }}
            />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="50"
          value={Math.min(num, 50)}
          onChange={(e) => onChange(`${e.target.value}px`)}
          className="flex-1 h-1 accent-[var(--primary)]"
        />
        <input
          type="number"
          value={num}
          onChange={(e) => onChange(`${e.target.value}px`)}
          className="w-14 text-xs px-1.5 py-1 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>
    </div>
  );
}

// Z-index input
function ZIndexInput({
  value,
  onChange
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const presets = [-1, 0, 1, 10, 50, 100, 999, 9999];
  const numValue = parseInt(value) || 0;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1 flex-wrap">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset.toString())}
            className={`px-1.5 py-0.5 text-[10px] rounded ${
              numValue === preset
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-elevated)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs px-2 py-1 rounded border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      />
    </div>
  );
}

// Get the appropriate input component for a CSS property
function getSmartInput(
  prop: string,
  value: string,
  onChange: (v: string) => void,
  isChanged: boolean
) {
  // Colors
  if (prop === "color" || prop === "background-color" || prop === "background" || prop === "border-color") {
    return <ColorInput value={value} onChange={onChange} label={prop} />;
  }

  // Display
  if (prop === "display") {
    return <SelectInput value={value} onChange={onChange} options={DISPLAY_OPTIONS} />;
  }

  // Position
  if (prop === "position") {
    return <SelectInput value={value} onChange={onChange} options={POSITION_OPTIONS} />;
  }

  // Flex direction
  if (prop === "flex-direction") {
    return <ToggleButtons value={value} onChange={onChange} options={FLEX_DIRECTION_OPTIONS} />;
  }

  // Justify content
  if (prop === "justify-content") {
    return <ToggleButtons value={value} onChange={onChange} options={JUSTIFY_OPTIONS} />;
  }

  // Align items
  if (prop === "align-items") {
    return <ToggleButtons value={value} onChange={onChange} options={ALIGN_OPTIONS} />;
  }

  // Text align
  if (prop === "text-align") {
    return <ToggleButtons value={value} onChange={onChange} options={TEXT_ALIGN_OPTIONS} />;
  }

  // Font weight
  if (prop === "font-weight") {
    return <SelectInput value={value} onChange={onChange} options={FONT_WEIGHT_OPTIONS} />;
  }

  // Opacity
  if (prop === "opacity") {
    return <OpacityInput value={value} onChange={onChange} />;
  }

  // Border radius
  if (prop === "border-radius") {
    return <BorderRadiusInput value={value} onChange={onChange} />;
  }

  // Z-index
  if (prop === "z-index") {
    return <ZIndexInput value={value} onChange={onChange} />;
  }

  // Spacing (padding, margin, gap)
  if (prop === "padding" || prop === "margin" || prop === "gap") {
    return <SpacingInput value={value} onChange={onChange} presets={SPACING_PRESETS} />;
  }

  // Font size
  if (prop === "font-size") {
    return <SpacingInput value={value} onChange={onChange} presets={FONT_SIZE_PRESETS} />;
  }

  // Sizing (width, height, etc.)
  if (prop.includes("width") || prop.includes("height")) {
    return <SpacingInput value={value} onChange={onChange} presets={SIZING_PRESETS} />;
  }

  // Position values (top, right, bottom, left)
  if (prop === "top" || prop === "right" || prop === "bottom" || prop === "left") {
    return <SpacingInput value={value} onChange={onChange} presets={[0, 4, 8, 16, "auto"]} />;
  }

  // Line height
  if (prop === "line-height") {
    return <SpacingInput value={value} onChange={onChange} presets={[1, 1.25, 1.5, 1.75, 2]} showUnit={false} />;
  }

  // Default text input
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full text-xs px-2 py-1 rounded border bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
        isChanged ? "border-[var(--primary)] bg-[var(--primary)]/5" : "border-[var(--border)]"
      }`}
    />
  );
}

// ============================================
// END SMART INPUT COMPONENTS
// ============================================

interface ElementInfo {
  element: HTMLElement;
  selector: string;
  path: string;
  classes: string[];
  dataElement: string | null;
  suggestedComponent: string | null;
}

// Style categories for grouping
const STYLE_GROUPS = {
  layout: {
    label: "Layout",
    props: ["display", "position", "top", "right", "bottom", "left", "z-index"],
  },
  sizing: {
    label: "Sizing",
    props: ["width", "height", "min-width", "max-width", "min-height", "max-height"],
  },
  spacing: {
    label: "Spacing",
    props: ["padding", "margin", "gap"],
  },
  flexbox: {
    label: "Flexbox",
    props: ["flex-direction", "justify-content", "align-items", "flex-wrap", "flex"],
  },
  typography: {
    label: "Typography",
    props: ["font-size", "font-weight", "line-height", "letter-spacing", "text-align"],
  },
  colors: {
    label: "Colors",
    props: ["color", "background", "background-color"],
  },
  borders: {
    label: "Borders",
    props: ["border", "border-radius", "border-color", "border-width"],
  },
  effects: {
    label: "Effects",
    props: ["opacity", "box-shadow", "transform", "transition"],
  },
};

// All editable props (flattened)
const ALL_STYLE_PROPS = Object.values(STYLE_GROUPS).flatMap((g) => g.props);

function generateSelector(el: HTMLElement): string {
  const dataElement = el.getAttribute("data-element");
  if (dataElement) return `[data-element="${dataElement}"]`;
  if (el.id) return `#${el.id}`;

  const classes = Array.from(el.classList)
    .filter((c) => !c.startsWith("_") && c.length < 40)
    .slice(0, 2);

  if (classes.length > 0) {
    return `${el.tagName.toLowerCase()}.${classes.join(".")}`;
  }

  return el.tagName.toLowerCase();
}

function getParentPath(el: HTMLElement): string {
  const parts: string[] = [];
  let current: HTMLElement | null = el;
  let depth = 0;

  while (current && current !== document.body && depth < 4) {
    const dataEl = current.getAttribute("data-element");
    if (dataEl) {
      parts.unshift(dataEl);
    } else if (current.id) {
      parts.unshift(`#${current.id}`);
    } else {
      const cls = Array.from(current.classList).slice(0, 1).join(".");
      parts.unshift(cls ? `.${cls}` : current.tagName.toLowerCase());
    }
    current = current.parentElement;
    depth++;
  }

  return parts.join(" > ");
}

function guessComponentName(classes: string[]): string | null {
  const patterns = [
    /^([A-Z][a-zA-Z]+)(?:_|-)/,
    /^(?:component|ui|layout)-([a-zA-Z-]+)/,
    /([a-zA-Z]+)-(?:card|button|input|section|header|footer|container|wrapper|list|item)/i,
  ];

  for (const cls of classes) {
    for (const pattern of patterns) {
      const match = cls.match(pattern);
      if (match) {
        return match[1]
          .split(/[-_]/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("");
      }
    }
  }

  const semantic = classes.find(
    (c) =>
      c.includes("card") ||
      c.includes("button") ||
      c.includes("header") ||
      c.includes("sidebar") ||
      c.includes("modal") ||
      c.includes("form")
  );
  if (semantic) {
    return semantic
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join("");
  }

  return null;
}

export function ElementInspector() {
  const [isActive, setIsActive] = useState(false);
  const [selected, setSelected] = useState<ElementInfo | null>(null);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const [styles, setStyles] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [customProps, setCustomProps] = useState<Array<{ prop: string; value: string }>>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["spacing", "colors"]));
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [panelPosition, setPanelPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<HTMLElement[]>([]);
  const [activeTab, setActiveTab] = useState<"styles" | "classes" | "tokens">("styles");
  const [expandedTokenGroups, setExpandedTokenGroups] = useState<Set<string>>(new Set(["colors"]));
  const [classSearchQuery, setClassSearchQuery] = useState("");
  const [showClassSuggestions, setShowClassSuggestions] = useState(false);
  const [elementClasses, setElementClasses] = useState<string[]>([]);
  const classInputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const originalStylesRef = useRef<Map<string, string>>(new Map());
  const originalClassesRef = useRef<string[]>([]);

  // Update selected element's rect when it changes or on scroll/resize
  useEffect(() => {
    if (!selected) {
      setSelectedRect(null);
      return;
    }

    const updateRect = () => {
      setSelectedRect(selected.element.getBoundingClientRect());
    };

    updateRect();

    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);

    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [selected]);

  // Load visibility setting
  useEffect(() => {
    const loadSettings = () => {
      const settings = getDevSettings();
      setHidden(settings.hideElementInspector);
    };
    loadSettings();

    const handleChange = () => loadSettings();
    window.addEventListener("ppos_dev_settings_changed", handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener("ppos_dev_settings_changed", handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  // Global keyboard shortcut: Ctrl+Shift+I to toggle
  useEffect(() => {
    if (hidden) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+I or Cmd+Shift+I to toggle inspector
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
        e.preventDefault();
        if (isActive) {
          closePanel();
        } else {
          setIsActive(true);
        }
      }
      // Ctrl+Shift+? to show shortcuts
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "?") {
        e.preventDefault();
        setShowShortcuts((p) => !p);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [hidden, isActive]);

  // Capture element styles and classes
  const captureStyles = useCallback((el: HTMLElement) => {
    const computed = window.getComputedStyle(el);
    const captured: Record<string, string> = {};
    originalStylesRef.current.clear();

    for (const prop of ALL_STYLE_PROPS) {
      const value = computed.getPropertyValue(prop);
      if (value) {
        captured[prop] = value;
        originalStylesRef.current.set(prop, value);
      }
    }

    // Capture classes
    const classes = Array.from(el.classList);
    originalClassesRef.current = [...classes];
    setElementClasses(classes);

    return captured;
  }, []);

  // Add a class to the selected element
  const addClass = useCallback((className: string) => {
    if (!selected || !className.trim()) return;

    const trimmedClass = className.trim();
    if (selected.element.classList.contains(trimmedClass)) return;

    selected.element.classList.add(trimmedClass);
    setElementClasses(Array.from(selected.element.classList));
    setClassSearchQuery("");
    setShowClassSuggestions(false);
  }, [selected]);

  // Remove a class from the selected element
  const removeClass = useCallback((className: string) => {
    if (!selected) return;

    selected.element.classList.remove(className);
    setElementClasses(Array.from(selected.element.classList));
  }, [selected]);

  // Get filtered class suggestions based on search query
  const getClassSuggestions = useCallback((query: string) => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return ALL_CLASSES.filter(
      (cls) => cls.toLowerCase().includes(lowerQuery) && !elementClasses.includes(cls)
    ).slice(0, 15);
  }, [elementClasses]);

  // Block all interactions when inspector is active (prevents link navigation)
  const blockInteraction = useCallback(
    (e: Event) => {
      if (!isActive) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-inspector]")) return;

      // Block all default behaviors (link navigation, form submission, etc.)
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    },
    [isActive]
  );

  // Handle element click
  const handleClick = useCallback(
    (e: MouseEvent) => {
      if (!isActive) return;

      const target = e.target as HTMLElement;
      if (target.closest("[data-inspector]")) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      const classes = Array.from(target.classList);

      const info: ElementInfo = {
        element: target,
        selector: generateSelector(target),
        path: getParentPath(target),
        classes,
        dataElement: target.getAttribute("data-element"),
        suggestedComponent: guessComponentName(classes),
      };

      setSelected(info);
      setStyles(captureStyles(target));
      setHovered(null);
      setNotes("");
      setCustomProps([]);
      setNavigationHistory([]); // Clear history when selecting a new element
    },
    [isActive, captureStyles]
  );

  // Handle hover
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isActive || selected) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-inspector]")) {
        setHovered(null);
        return;
      }
      setHovered(target);
    },
    [isActive, selected]
  );

  // Handle escape and other shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selected) {
          originalStylesRef.current.forEach((_, prop) => {
            selected.element.style.setProperty(prop, "");
          });
          customProps.forEach(({ prop }) => {
            selected.element.style.setProperty(prop, "");
          });
          setSelected(null);
          setStyles({});
          setNotes("");
          setCustomProps([]);
        } else if (isActive) {
          setIsActive(false);
          setHovered(null);
        }
      }
      // Arrow up/down to navigate parent/child when selected
      if (selected && e.key === "ArrowUp" && e.altKey) {
        e.preventDefault();
        const parent = selected.element.parentElement;
        if (parent && parent !== document.body) {
          const classes = Array.from(parent.classList);
          setSelected({
            element: parent,
            selector: generateSelector(parent),
            path: getParentPath(parent),
            classes,
            dataElement: parent.getAttribute("data-element"),
            suggestedComponent: guessComponentName(classes),
          });
          setStyles(captureStyles(parent));
        }
      }
      if (selected && e.key === "ArrowDown" && e.altKey) {
        e.preventDefault();
        const firstChild = selected.element.firstElementChild as HTMLElement | null;
        if (firstChild) {
          const classes = Array.from(firstChild.classList);
          setSelected({
            element: firstChild,
            selector: generateSelector(firstChild),
            path: getParentPath(firstChild),
            classes,
            dataElement: firstChild.getAttribute("data-element"),
            suggestedComponent: guessComponentName(classes),
          });
          setStyles(captureStyles(firstChild));
        }
      }
    },
    [isActive, selected, customProps, captureStyles]
  );

  // Event listeners
  useEffect(() => {
    if (isActive) {
      // Block mousedown and pointerdown to prevent link navigation before click fires
      document.addEventListener("mousedown", blockInteraction, true);
      document.addEventListener("pointerdown", blockInteraction, true);
      document.addEventListener("auxclick", blockInteraction, true); // Middle-click
      document.addEventListener("click", handleClick, true);
      document.addEventListener("mousemove", handleMouseMove, true);
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.cursor = "crosshair";
    }
    return () => {
      document.removeEventListener("mousedown", blockInteraction, true);
      document.removeEventListener("pointerdown", blockInteraction, true);
      document.removeEventListener("auxclick", blockInteraction, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.cursor = "";
    };
  }, [isActive, blockInteraction, handleClick, handleMouseMove, handleKeyDown]);

  // Dragging logic
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: panelPosition.x,
      posY: panelPosition.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const newX = Math.max(0, Math.min(window.innerWidth - 400, dragStartRef.current.posX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - 200, dragStartRef.current.posY + deltaY));
      setPanelPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Update style live
  const updateStyle = (prop: string, value: string) => {
    if (!selected) return;
    setStyles((prev) => ({ ...prev, [prop]: value }));
    selected.element.style.setProperty(prop, value);
  };

  // Toggle group expansion
  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  // Update custom property
  const updateCustomProp = (index: number, field: "prop" | "value", val: string) => {
    if (!selected) return;
    setCustomProps((prev) => {
      const updated = [...prev];
      const old = updated[index];
      if (field === "prop" && old.prop) {
        selected.element.style.removeProperty(old.prop);
      }
      updated[index] = { ...old, [field]: val };
      if (updated[index].prop && updated[index].value) {
        selected.element.style.setProperty(updated[index].prop, updated[index].value);
      }
      return updated;
    });
  };

  const addCustomProp = () => {
    setCustomProps((prev) => [...prev, { prop: "", value: "" }]);
  };

  const removeCustomProp = (index: number) => {
    if (!selected) return;
    const prop = customProps[index].prop;
    if (prop) {
      selected.element.style.removeProperty(prop);
    }
    setCustomProps((prev) => prev.filter((_, i) => i !== index));
  };

  // Generate copy text for Claude
  const generateCopyText = () => {
    if (!selected) return "";

    const changedStyles = Object.entries(styles)
      .filter(([prop, value]) => originalStylesRef.current.get(prop) !== value)
      .map(([prop, value]) => `  ${prop}: ${value};`)
      .join("\n");

    const customStylesText = customProps
      .filter((p) => p.prop && p.value)
      .map((p) => `  ${p.prop}: ${p.value};`)
      .join("\n");

    const allChanges = [changedStyles, customStylesText].filter(Boolean).join("\n");

    return `## Style Change Request

**Page:** ${window.location.pathname}
**Element:** \`${selected.selector}\`
**Path:** ${selected.path}
${selected.dataElement ? `**data-element:** \`${selected.dataElement}\`` : ""}
${selected.suggestedComponent ? `**Likely Component:** ${selected.suggestedComponent}` : ""}
**Classes:** \`${selected.classes.join(" ") || "(none)"}\`

${notes ? `### Notes\n${notes}\n` : ""}
### Requested Changes
\`\`\`css
${selected.selector} {
${allChanges || "  /* No changes specified */"}
}
\`\`\`

### Current Computed Styles
\`\`\`css
${selected.selector} {
${Object.entries(styles)
  .map(([prop, value]) => `  ${prop}: ${value};`)
  .join("\n")}
}
\`\`\``;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateCopyText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closePanel = () => {
    if (selected) {
      originalStylesRef.current.forEach((_, prop) => {
        selected.element.style.setProperty(prop, "");
      });
      customProps.forEach(({ prop }) => {
        if (prop) selected.element.style.removeProperty(prop);
      });
    }
    setSelected(null);
    setStyles({});
    setIsActive(false);
    setHovered(null);
    setNotes("");
    setCustomProps([]);
    setNavigationHistory([]);
  };

  if (hidden) return null;

  const hoverRect = hovered?.getBoundingClientRect();
  const changedCount =
    Object.entries(styles).filter(([prop, value]) => originalStylesRef.current.get(prop) !== value).length +
    customProps.filter((p) => p.prop && p.value).length;

  return (
    <>
      {/* Toggle Button */}
      <button
        data-inspector="toggle"
        onClick={() => {
          if (isActive) {
            closePanel();
          } else {
            setIsActive(true);
          }
        }}
        className={`fixed bottom-4 left-4 z-[99999] flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-lg transition-all ${
          isActive
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--background-elevated)]"
        }`}
        title="Element Inspector (Ctrl+Shift+I)"
      >
        <MousePointer2 className="w-4 h-4" />
        <span className="hidden sm:inline">{isActive ? "Inspecting..." : "Inspect"}</span>
      </button>

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div
          data-inspector="shortcuts"
          className="fixed inset-0 z-[100001] flex items-center justify-center bg-black/50"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 w-80 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <h3 className="font-semibold text-[var(--foreground)]">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-[var(--foreground-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Toggle Inspector</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded text-xs">Ctrl+Shift+I</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Close/Cancel</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded text-xs">Esc</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Select Parent</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded text-xs">Alt+↑</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Select Child</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded text-xs">Alt+↓</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground-muted)]">Show Shortcuts</span>
                <kbd className="px-1.5 py-0.5 bg-[var(--background-tertiary)] rounded text-xs">Ctrl+Shift+?</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hover Highlight */}
      {isActive && hovered && hoverRect && !selected && (
        <div
          data-inspector="highlight"
          className="fixed pointer-events-none z-[99997] border-2 border-[var(--primary)] bg-[var(--primary)]/10"
          style={{
            top: hoverRect.top,
            left: hoverRect.left,
            width: hoverRect.width,
            height: hoverRect.height,
          }}
        >
          <div className="absolute -top-6 left-0 bg-[var(--primary)] text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {hovered.getAttribute("data-element") ||
              (hovered.className && typeof hovered.className === "string"
                ? `.${hovered.className.split(" ")[0]}`
                : hovered.tagName.toLowerCase())}
          </div>
        </div>
      )}

      {/* Selected Element Highlight */}
      {selected && selectedRect && (
        <div
          data-inspector="selected-highlight"
          className="fixed pointer-events-none z-[99998] border-2 border-[#22c55e] bg-[#22c55e]/15"
          style={{
            top: selectedRect.top,
            left: selectedRect.left,
            width: selectedRect.width,
            height: selectedRect.height,
          }}
        >
          <div className="absolute -top-6 left-0 bg-[#22c55e] text-white text-xs px-2 py-1 rounded whitespace-nowrap font-medium">
            {selected.dataElement || selected.selector}
          </div>
        </div>
      )}

      {/* Active Instructions */}
      {isActive && !selected && (
        <div
          data-inspector="hint"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] bg-[var(--primary)] text-white px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-3"
        >
          <span>Click element to inspect</span>
          <span className="opacity-60">|</span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">Esc</kbd> exit
          </span>
          <button
            onClick={() => setShowShortcuts(true)}
            className="ml-2 opacity-60 hover:opacity-100"
            title="Show shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Style Editor Panel - Draggable */}
      {selected && (
        <div
          data-inspector="panel"
          className="fixed z-[100000] w-96 max-h-[85vh] overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl flex flex-col"
          style={{ top: panelPosition.y, right: panelPosition.x }}
        >
          {/* Draggable Header */}
          <div
            className="flex items-start justify-between gap-4 flex-wrap p-3 bg-[var(--card)] border-b border-[var(--border)] cursor-move select-none"
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <GripHorizontal className="w-4 h-4 text-[var(--foreground-muted)] flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--foreground)] truncate text-sm">
                  {selected.dataElement || selected.suggestedComponent || selected.selector}
                </h3>
                <p className="text-xs text-[var(--foreground-muted)] truncate">{selected.path}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              {changedCount > 0 && (
                <span className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-1.5 py-0.5 rounded">
                  {changedCount}
                </span>
              )}
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white hover:opacity-90"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button onClick={closePanel} className="p-1.5 rounded-lg hover:bg-[var(--background-elevated)]">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Parent/Child Navigation */}
          <div className="flex items-start justify-between gap-4 flex-wrap px-3 py-2 border-b border-[var(--border)] bg-[var(--background-tertiary)]">
            <button
              onClick={() => {
                const parent = selected.element.parentElement;
                if (parent && parent !== document.body) {
                  // Push current element to history before navigating up
                  setNavigationHistory(prev => [...prev, selected.element]);
                  const classes = Array.from(parent.classList);
                  setSelected({
                    element: parent,
                    selector: generateSelector(parent),
                    path: getParentPath(parent),
                    classes,
                    dataElement: parent.getAttribute("data-element"),
                    suggestedComponent: guessComponentName(classes),
                  });
                  setStyles(captureStyles(parent));
                }
              }}
              disabled={!selected.element.parentElement || selected.element.parentElement === document.body}
              className="flex items-center gap-1 text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] disabled:opacity-30"
            >
              <ChevronUp className="w-3 h-3" /> Parent
            </button>
            <span className="text-xs text-[var(--foreground-muted)]">
              {selected.element.tagName.toLowerCase()}
              {navigationHistory.length > 0 && (
                <span className="ml-1 text-[var(--primary)]">({navigationHistory.length})</span>
              )}
            </span>
            <button
              onClick={() => {
                // First check if we have history to go back to
                if (navigationHistory.length > 0) {
                  const previousChild = navigationHistory[navigationHistory.length - 1];
                  setNavigationHistory(prev => prev.slice(0, -1));
                  const classes = Array.from(previousChild.classList);
                  setSelected({
                    element: previousChild,
                    selector: generateSelector(previousChild),
                    path: getParentPath(previousChild),
                    classes,
                    dataElement: previousChild.getAttribute("data-element"),
                    suggestedComponent: guessComponentName(classes),
                  });
                  setStyles(captureStyles(previousChild));
                } else {
                  // Otherwise go to first child
                  const firstChild = selected.element.firstElementChild as HTMLElement | null;
                  if (firstChild) {
                    const classes = Array.from(firstChild.classList);
                    setSelected({
                      element: firstChild,
                      selector: generateSelector(firstChild),
                      path: getParentPath(firstChild),
                      classes,
                      dataElement: firstChild.getAttribute("data-element"),
                      suggestedComponent: guessComponentName(classes),
                    });
                    setStyles(captureStyles(firstChild));
                  }
                }
              }}
              disabled={!selected.element.firstElementChild && navigationHistory.length === 0}
              className={`flex items-center gap-1 text-xs hover:text-[var(--foreground)] disabled:opacity-30 ${
                navigationHistory.length > 0
                  ? "text-[var(--primary)] font-medium"
                  : "text-[var(--foreground-muted)]"
              }`}
            >
              {navigationHistory.length > 0 ? "Back" : "Child"} <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Tab Toggle */}
          <div className="flex border-b border-[var(--border)]">
            <button
              onClick={() => setActiveTab("styles")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === "styles"
                  ? "text-[var(--primary)] border-b-2 border-[var(--primary)] -mb-[1px]"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              Styles
            </button>
            <button
              onClick={() => setActiveTab("classes")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === "classes"
                  ? "text-[var(--primary)] border-b-2 border-[var(--primary)] -mb-[1px]"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Classes
              {elementClasses.length !== originalClassesRef.current.length && (
                <span className="text-[10px] bg-[var(--primary)]/20 text-[var(--primary)] px-1 rounded">
                  {elementClasses.length - originalClassesRef.current.length > 0 ? "+" : ""}
                  {elementClasses.length - originalClassesRef.current.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("tokens")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === "tokens"
                  ? "text-[var(--primary)] border-b-2 border-[var(--primary)] -mb-[1px]"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Tokens
            </button>
          </div>

          {/* Styles Tab Content */}
          {activeTab === "styles" && (
            <>
              {/* Notes Section */}
              <div className="p-3 border-b border-[var(--border)]">
                <label className="text-xs font-medium text-[var(--foreground-muted)] block mb-1.5">
                  Notes (what do you want to change?)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Make padding larger, change to blue..."
                  className="w-full h-16 text-sm px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                />
              </div>

              {/* Grouped Style Editor */}
              <div className="flex-1 overflow-y-auto">
            {Object.entries(STYLE_GROUPS).map(([groupKey, group]) => {
              const groupStyles = group.props.filter((p) => styles[p] !== undefined);
              if (groupStyles.length === 0) return null;

              const isExpanded = expandedGroups.has(groupKey);
              const hasChanges = groupStyles.some(
                (p) => originalStylesRef.current.get(p) !== styles[p]
              );

              return (
                <div key={groupKey} className="border-b border-[var(--border)]">
                  <button
                    onClick={() => toggleGroup(groupKey)}
                    className="w-full flex items-start justify-between gap-4 flex-wrap px-3 py-2 hover:bg-[var(--background-elevated)] transition-colors"
                  >
                    <span className={`text-xs font-medium ${hasChanges ? "text-[var(--primary)]" : "text-[var(--foreground-muted)]"}`}>
                      {group.label}
                      {hasChanges && " •"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3 text-[var(--foreground-muted)]" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-[var(--foreground-muted)]" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-3">
                      {groupStyles.map((prop) => {
                        const value = styles[prop];
                        const isChanged = originalStylesRef.current.get(prop) !== value;
                        return (
                          <div key={prop} className="space-y-1">
                            <label
                              className={`text-xs block ${isChanged ? "text-[var(--primary)] font-medium" : "text-[var(--foreground-muted)]"}`}
                              title={prop}
                            >
                              {prop}
                              {isChanged && <span className="ml-1 text-[10px]">(modified)</span>}
                            </label>
                            <div className="pl-0">
                              {getSmartInput(prop, value, (v) => updateStyle(prop, v), isChanged)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom Properties */}
            <div className="p-3">
              <p className="text-xs font-medium text-[var(--foreground-muted)] mb-2">Custom Properties</p>
              {customProps.map((cp, i) => (
                <div key={`custom-${i}`} className="flex items-center gap-2 mb-1.5">
                  <input
                    type="text"
                    value={cp.prop}
                    onChange={(e) => updateCustomProp(i, "prop", e.target.value)}
                    placeholder="property"
                    className="w-24 text-xs px-2 py-1 rounded border border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <input
                    type="text"
                    value={cp.value}
                    onChange={(e) => updateCustomProp(i, "value", e.target.value)}
                    placeholder="value"
                    className="flex-1 text-xs px-2 py-1 rounded border border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <button
                    onClick={() => removeCustomProp(i)}
                    className="p-1 rounded hover:bg-[var(--background-elevated)] text-[var(--foreground-muted)]"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                onClick={addCustomProp}
                className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
              >
                <Plus className="w-3 h-3" /> Add property
              </button>
            </div>
              </div>
            </>
          )}

          {/* Classes Tab Content */}
          {activeTab === "classes" && (
            <div className="flex-1 overflow-y-auto">
              {/* Class Input with Autocomplete */}
              <div className="p-3 border-b border-[var(--border)]">
                <label className="text-xs font-medium text-[var(--foreground-muted)] block mb-1.5">
                  Add Class
                </label>
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--foreground-muted)]" />
                      <input
                        ref={classInputRef}
                        type="text"
                        value={classSearchQuery}
                        onChange={(e) => {
                          setClassSearchQuery(e.target.value);
                          setShowClassSuggestions(e.target.value.length > 0);
                        }}
                        onFocus={() => setShowClassSuggestions(classSearchQuery.length > 0)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && classSearchQuery.trim()) {
                            addClass(classSearchQuery);
                          }
                          if (e.key === "Escape") {
                            setShowClassSuggestions(false);
                          }
                        }}
                        placeholder="Search or type class name..."
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
                    <button
                      onClick={() => addClass(classSearchQuery)}
                      disabled={!classSearchQuery.trim()}
                      className="px-3 py-2 text-xs rounded-lg bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Autocomplete Suggestions */}
                  {showClassSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {getClassSuggestions(classSearchQuery).length > 0 ? (
                        getClassSuggestions(classSearchQuery).map((cls) => (
                          <button
                            key={cls}
                            onClick={() => addClass(cls)}
                            className="w-full text-left px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--background-elevated)] transition-colors"
                          >
                            <code className="text-[var(--primary)]">{cls}</code>
                          </button>
                        ))
                      ) : classSearchQuery.trim() ? (
                        <div className="px-3 py-2 text-xs text-[var(--foreground-muted)]">
                          Press Enter to add &quot;<code className="text-[var(--primary)]">{classSearchQuery}</code>&quot;
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {/* Current Classes */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[var(--foreground-muted)]">
                    Current Classes ({elementClasses.length})
                  </span>
                  {elementClasses.length !== originalClassesRef.current.length && (
                    <button
                      onClick={() => {
                        if (!selected) return;
                        // Reset to original classes
                        selected.element.className = originalClassesRef.current.join(" ");
                        setElementClasses([...originalClassesRef.current]);
                      }}
                      className="text-[10px] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {elementClasses.length === 0 ? (
                  <p className="text-xs text-[var(--foreground-muted)] italic">No classes applied</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {elementClasses.map((cls) => {
                      const isNew = !originalClassesRef.current.includes(cls);
                      return (
                        <div
                          key={cls}
                          className={`group flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-colors ${
                            isNew
                              ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]"
                              : "bg-[var(--background-elevated)] border-[var(--border)] text-[var(--foreground)]"
                          }`}
                        >
                          <code className="text-[11px]">{cls}</code>
                          <button
                            onClick={() => removeClass(cls)}
                            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-[var(--background-hover)] transition-opacity"
                            title="Remove class"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Add Categories */}
              <div className="p-3 border-t border-[var(--border)]">
                <p className="text-xs font-medium text-[var(--foreground-muted)] mb-2">Quick Add</p>
                {Object.entries(COMMON_CLASSES).map(([category, classes]) => (
                  <details key={category} className="mb-2">
                    <summary className="text-xs text-[var(--foreground-secondary)] cursor-pointer hover:text-[var(--foreground)] capitalize">
                      {category} ({classes.length})
                    </summary>
                    <div className="flex flex-wrap gap-1 mt-2 pl-2">
                      {classes.slice(0, 12).map((cls) => (
                        <button
                          key={cls}
                          onClick={() => addClass(cls)}
                          disabled={elementClasses.includes(cls)}
                          className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors ${
                            elementClasses.includes(cls)
                              ? "bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)] cursor-default"
                              : "bg-[var(--background)] border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                          }`}
                        >
                          {cls}
                        </button>
                      ))}
                      {classes.length > 12 && (
                        <span className="text-[10px] text-[var(--foreground-muted)] self-center">
                          +{classes.length - 12} more
                        </span>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Tokens Tab Content */}
          {activeTab === "tokens" && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 border-b border-[var(--border)] bg-[var(--background-tertiary)]">
                <p className="text-xs text-[var(--foreground-muted)]">
                  Click any token to copy <code className="text-[var(--primary)]">var(--token-name)</code> to clipboard
                </p>
              </div>
              {Object.entries(DESIGN_TOKENS).map(([groupKey, group]) => {
                const isExpanded = expandedTokenGroups.has(groupKey);
                const isColorGroup = groupKey === "colors";

                return (
                  <div key={groupKey} className="border-b border-[var(--border)]">
                    <button
                      onClick={() => {
                        setExpandedTokenGroups((prev) => {
                          const next = new Set(prev);
                          if (next.has(groupKey)) {
                            next.delete(groupKey);
                          } else {
                            next.add(groupKey);
                          }
                          return next;
                        });
                      }}
                      className="w-full flex items-start justify-between gap-4 flex-wrap px-3 py-2 hover:bg-[var(--background-elevated)] transition-colors"
                    >
                      <span className="text-xs font-medium text-[var(--foreground-muted)]">
                        {group.label}
                        <span className="ml-1 text-[10px] opacity-60">({group.tokens.length})</span>
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3 text-[var(--foreground-muted)]" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-[var(--foreground-muted)]" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-2 pb-2">
                        {group.tokens.map((token) => (
                          <TokenItem
                            key={token.name}
                            name={token.name}
                            value={token.value}
                            desc={token.desc}
                            isColor={isColorGroup}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="p-2 border-t border-[var(--border)] bg-[var(--background-tertiary)] text-center">
            <p className="text-xs text-[var(--foreground-muted)]">
              <kbd className="px-1 py-0.5 bg-[var(--background)] rounded text-[10px]">Esc</kbd> close •{" "}
              <kbd className="px-1 py-0.5 bg-[var(--background)] rounded text-[10px]">Alt+↑↓</kbd> navigate
            </p>
          </div>
        </div>
      )}
    </>
  );
}
