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
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const originalStylesRef = useRef<Map<string, string>>(new Map());

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

  // Capture element styles
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
    return captured;
  }, []);

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
            <div className="flex items-center justify-between mb-3">
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
            className="flex items-center justify-between p-3 bg-[var(--card)] border-b border-[var(--border)] cursor-move select-none"
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
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--background-tertiary)]">
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
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--background-elevated)] transition-colors"
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
