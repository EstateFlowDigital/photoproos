"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { Layer, TextLayer, ShapeLayer, ImageLayer } from "@/components/marketing-studio/types";
import {
  Settings2,
  Move,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";

interface PropertiesPanelProps {
  layer: Layer | null;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  className?: string;
}

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "system-ui", label: "System UI" },
  { value: "Georgia", label: "Georgia" },
  { value: "Menlo", label: "Menlo (Mono)" },
];

const FONT_WEIGHT_OPTIONS = [
  { value: 400, label: "Regular" },
  { value: 500, label: "Medium" },
  { value: 600, label: "Semibold" },
  { value: 700, label: "Bold" },
  { value: 800, label: "Extra Bold" },
];

export function PropertiesPanel({
  layer,
  onUpdateLayer,
  className,
}: PropertiesPanelProps) {
  const [expandedSections, setExpandedSections] = React.useState<string[]>([
    "transform",
    "appearance",
    "text",
  ]);

  const toggleSection = React.useCallback((section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  }, []);

  if (!layer) {
    return (
      <div className={cn("properties-panel flex flex-col", className)}>
        <div className="flex items-center gap-2 p-3 border-b border-[var(--card-border)]">
          <Settings2 className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
          <span className="text-sm font-medium text-[var(--foreground)]">Properties</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 text-center">
          <p className="text-sm text-[var(--foreground-muted)]">
            Select a layer to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const updateField = <K extends keyof Layer>(field: K, value: Layer[K]) => {
    onUpdateLayer(layer.id, { [field]: value } as Partial<Layer>);
  };

  const updatePosition = (axis: "x" | "y", value: number) => {
    onUpdateLayer(layer.id, {
      position: { ...layer.position, [axis]: value },
    });
  };

  const updateSize = (dimension: "width" | "height", value: number) => {
    onUpdateLayer(layer.id, {
      size: { ...layer.size, [dimension]: value },
    });
  };

  return (
    <div className={cn("properties-panel flex flex-col h-full overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-[var(--card-border)] flex-shrink-0">
        <Settings2 className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
        <span className="text-sm font-medium text-[var(--foreground)]">Properties</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Layer Name */}
        <div className="p-3 border-b border-[var(--card-border)]">
          <label htmlFor="layer-name" className="block text-xs text-[var(--foreground-muted)] mb-1.5">
            Layer Name
          </label>
          <input
            id="layer-name"
            type="text"
            value={layer.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          />
        </div>

        {/* Transform Section */}
        <PropertySection
          title="Transform"
          icon={Move}
          expanded={expandedSections.includes("transform")}
          onToggle={() => toggleSection("transform")}
        >
          <div className="space-y-3">
            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="pos-x" className="block text-xs text-[var(--foreground-muted)] mb-1">
                  X Position
                </label>
                <NumberInput
                  id="pos-x"
                  value={layer.position.x}
                  onChange={(v) => updatePosition("x", v)}
                  suffix="px"
                />
              </div>
              <div>
                <label htmlFor="pos-y" className="block text-xs text-[var(--foreground-muted)] mb-1">
                  Y Position
                </label>
                <NumberInput
                  id="pos-y"
                  value={layer.position.y}
                  onChange={(v) => updatePosition("y", v)}
                  suffix="px"
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="size-w" className="block text-xs text-[var(--foreground-muted)] mb-1">
                  Width
                </label>
                <NumberInput
                  id="size-w"
                  value={layer.size.width}
                  onChange={(v) => updateSize("width", v)}
                  min={1}
                  suffix="px"
                />
              </div>
              <div>
                <label htmlFor="size-h" className="block text-xs text-[var(--foreground-muted)] mb-1">
                  Height
                </label>
                <NumberInput
                  id="size-h"
                  value={layer.size.height}
                  onChange={(v) => updateSize("height", v)}
                  min={1}
                  suffix="px"
                />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <label htmlFor="rotation" className="block text-xs text-[var(--foreground-muted)] mb-1">
                Rotation
              </label>
              <NumberInput
                id="rotation"
                value={layer.rotation}
                onChange={(v) => updateField("rotation", v)}
                min={-360}
                max={360}
                suffix="°"
              />
            </div>
          </div>
        </PropertySection>

        {/* Appearance Section */}
        <PropertySection
          title="Appearance"
          icon={Palette}
          expanded={expandedSections.includes("appearance")}
          onToggle={() => toggleSection("appearance")}
        >
          <div className="space-y-3">
            {/* Opacity */}
            <div>
              <label htmlFor="opacity" className="block text-xs text-[var(--foreground-muted)] mb-1">
                Opacity
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="opacity"
                  type="range"
                  min={0}
                  max={100}
                  value={layer.opacity}
                  onChange={(e) => updateField("opacity", Number(e.target.value))}
                  className="flex-1 h-2 rounded-full bg-[var(--background)] accent-[var(--primary)] cursor-pointer"
                />
                <span className="text-xs text-[var(--foreground-muted)] w-8 text-right">
                  {layer.opacity}%
                </span>
              </div>
            </div>

            {/* Shape-specific: Fill & Stroke */}
            {layer.type === "shape" && (
              <>
                <div>
                  <label htmlFor="fill-color" className="block text-xs text-[var(--foreground-muted)] mb-1">
                    Fill Color
                  </label>
                  <ColorInput
                    id="fill-color"
                    value={(layer as ShapeLayer).fill}
                    onChange={(v) => onUpdateLayer(layer.id, { fill: v } as Partial<ShapeLayer>)}
                  />
                </div>
                <div>
                  <label htmlFor="stroke-color" className="block text-xs text-[var(--foreground-muted)] mb-1">
                    Stroke Color
                  </label>
                  <ColorInput
                    id="stroke-color"
                    value={(layer as ShapeLayer).stroke}
                    onChange={(v) => onUpdateLayer(layer.id, { stroke: v } as Partial<ShapeLayer>)}
                  />
                </div>
                <div>
                  <label htmlFor="stroke-width" className="block text-xs text-[var(--foreground-muted)] mb-1">
                    Stroke Width
                  </label>
                  <NumberInput
                    id="stroke-width"
                    value={(layer as ShapeLayer).strokeWidth}
                    onChange={(v) => onUpdateLayer(layer.id, { strokeWidth: v } as Partial<ShapeLayer>)}
                    min={0}
                    max={20}
                    suffix="px"
                  />
                </div>
              </>
            )}

            {/* Image-specific: Object Fit */}
            {layer.type === "image" && (
              <div>
                <label htmlFor="object-fit" className="block text-xs text-[var(--foreground-muted)] mb-1">
                  Object Fit
                </label>
                <div className="relative">
                  <select
                    id="object-fit"
                    value={(layer as ImageLayer).objectFit}
                    onChange={(e) =>
                      onUpdateLayer(layer.id, {
                        objectFit: e.target.value as "cover" | "contain" | "fill",
                      } as Partial<ImageLayer>)
                    }
                    className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 pr-8 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Fill</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>
        </PropertySection>

        {/* Text Section (for text layers) */}
        {layer.type === "text" && (
          <PropertySection
            title="Text"
            icon={Type}
            expanded={expandedSections.includes("text")}
            onToggle={() => toggleSection("text")}
          >
            <div className="space-y-3">
              {/* Content */}
              <div>
                <label htmlFor="text-content" className="block text-xs text-[var(--foreground-muted)] mb-1">
                  Content
                </label>
                <textarea
                  id="text-content"
                  value={(layer as TextLayer).content}
                  onChange={(e) =>
                    onUpdateLayer(layer.id, { content: e.target.value } as Partial<TextLayer>)
                  }
                  rows={3}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] resize-none"
                />
              </div>

              {/* Font Family */}
              <div>
                <label htmlFor="font-family" className="block text-xs text-[var(--foreground-muted)] mb-1">
                  Font Family
                </label>
                <div className="relative">
                  <select
                    id="font-family"
                    value={(layer as TextLayer).fontFamily}
                    onChange={(e) =>
                      onUpdateLayer(layer.id, { fontFamily: e.target.value } as Partial<TextLayer>)
                    }
                    className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 pr-8 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" aria-hidden="true" />
                </div>
              </div>

              {/* Font Size & Weight */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="font-size" className="block text-xs text-[var(--foreground-muted)] mb-1">
                    Font Size
                  </label>
                  <NumberInput
                    id="font-size"
                    value={(layer as TextLayer).fontSize}
                    onChange={(v) =>
                      onUpdateLayer(layer.id, { fontSize: v } as Partial<TextLayer>)
                    }
                    min={8}
                    max={200}
                    suffix="px"
                  />
                </div>
                <div>
                  <label htmlFor="font-weight" className="block text-xs text-[var(--foreground-muted)] mb-1">
                    Weight
                  </label>
                  <div className="relative">
                    <select
                      id="font-weight"
                      value={(layer as TextLayer).fontWeight}
                      onChange={(e) =>
                        onUpdateLayer(layer.id, {
                          fontWeight: Number(e.target.value) as TextLayer["fontWeight"],
                        } as Partial<TextLayer>)
                      }
                      className="w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 pr-8 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                    >
                      {FONT_WEIGHT_OPTIONS.map((weight) => (
                        <option key={weight.value} value={weight.value}>
                          {weight.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)] pointer-events-none" aria-hidden="true" />
                  </div>
                </div>
              </div>

              {/* Text Color */}
              <div>
                <label htmlFor="text-color" className="block text-xs text-[var(--foreground-muted)] mb-1">
                  Color
                </label>
                <ColorInput
                  id="text-color"
                  value={(layer as TextLayer).color}
                  onChange={(v) =>
                    onUpdateLayer(layer.id, { color: v } as Partial<TextLayer>)
                  }
                />
              </div>

              {/* Text Alignment */}
              <div>
                <label className="block text-xs text-[var(--foreground-muted)] mb-1">
                  Alignment
                </label>
                <div className="flex gap-1" role="group" aria-label="Text alignment">
                  {[
                    { value: "left", icon: AlignLeft, label: "Left" },
                    { value: "center", icon: AlignCenter, label: "Center" },
                    { value: "right", icon: AlignRight, label: "Right" },
                  ].map((align) => (
                    <button
                      key={align.value}
                      onClick={() =>
                        onUpdateLayer(layer.id, {
                          textAlign: align.value as TextLayer["textAlign"],
                        } as Partial<TextLayer>)
                      }
                      className={cn(
                        "flex-1 flex items-center justify-center p-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                        (layer as TextLayer).textAlign === align.value
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
                      )}
                      aria-label={`Align ${align.label}`}
                      aria-pressed={(layer as TextLayer).textAlign === align.value}
                    >
                      <align.icon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Height */}
              <div>
                <label htmlFor="line-height" className="block text-xs text-[var(--foreground-muted)] mb-1">
                  Line Height
                </label>
                <NumberInput
                  id="line-height"
                  value={(layer as TextLayer).lineHeight}
                  onChange={(v) =>
                    onUpdateLayer(layer.id, { lineHeight: v } as Partial<TextLayer>)
                  }
                  min={0.5}
                  max={3}
                  step={0.1}
                />
              </div>
            </div>
          </PropertySection>
        )}
      </div>
    </div>
  );
}

// Collapsible section component
function PropertySection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--card-border)]">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-3 text-left hover:bg-[var(--background-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--primary)]"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[var(--foreground-muted)]" aria-hidden="true" />
          <span className="text-xs font-medium text-[var(--foreground)]">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--foreground-muted)] transition-transform",
            expanded && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>
      {expanded && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

// Number input with increment/decrement buttons
function NumberInput({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  id: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const handleChange = (newValue: number) => {
    if (min !== undefined && newValue < min) newValue = min;
    if (max !== undefined && newValue > max) newValue = max;
    onChange(newValue);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleChange(value - step)}
        disabled={min !== undefined && value <= min}
        className="flex items-center justify-center h-7 w-7 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        aria-label="Decrease"
      >
        <Minus className="h-3 w-3" aria-hidden="true" />
      </button>
      <div className="relative flex-1">
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => handleChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-xs text-center text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--foreground-muted)] pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      <button
        onClick={() => handleChange(value + step)}
        disabled={max !== undefined && value >= max}
        className="flex items-center justify-center h-7 w-7 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
        aria-label="Increase"
      >
        <Plus className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  );
}

// Color input with text input
function ColorInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-8 w-8 rounded-lg border border-[var(--border)] cursor-pointer relative overflow-hidden flex-shrink-0"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Color picker"
        />
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-mono text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      />
    </div>
  );
}
