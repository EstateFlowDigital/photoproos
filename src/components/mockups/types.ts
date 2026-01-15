/**
 * Mockup Library Types
 *
 * Type definitions for the mockup system including mockup definitions,
 * field definitions, and industry data interfaces.
 */

import type { LucideIcon } from "lucide-react";

// ============================================================================
// INDUSTRY TYPES
// ============================================================================

export type IndustryId =
  | "real_estate"
  | "commercial"
  | "events"
  | "portraits"
  | "food"
  | "product";

// ============================================================================
// MOCKUP CATEGORIES
// ============================================================================

export type MockupCategory =
  | "dashboard"
  | "galleries"
  | "client-portal"
  | "invoicing"
  | "scheduling"
  | "clients"
  | "contracts"
  | "real-estate"
  | "reports"
  | "messages"
  | "settings"
  | "devices"
  | "marketing";

export interface CategoryInfo {
  id: MockupCategory;
  name: string;
  description: string;
  icon: LucideIcon;
}

// ============================================================================
// FIELD DEFINITIONS
// ============================================================================

export type FieldType =
  | "text"
  | "number"
  | "currency"
  | "date"
  | "select"
  | "textarea"
  | "color";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  options?: FieldOption[];
  placeholder?: string;
  defaultValue?: string | number;
}

// ============================================================================
// MOCKUP PROPS
// ============================================================================

export interface MockupProps {
  data: Record<string, unknown>;
  theme: "light" | "dark";
  primaryColor?: string;
  industry: IndustryId;
  className?: string;
}

// ============================================================================
// MOCKUP DEFINITION
// ============================================================================

export interface MockupDefinition {
  id: string;
  name: string;
  category: MockupCategory;
  description: string;
  thumbnail?: string;
  industries: IndustryId[] | "all";
  component: React.ComponentType<MockupProps>;
  fields: FieldDefinition[];
  getDefaultData: (industry: IndustryId) => Record<string, unknown>;
}

// ============================================================================
// ASPECT RATIO PRESETS
// ============================================================================

export interface AspectRatioPreset {
  id: string;
  name: string;
  label: string;
  width: number;
  height: number;
  icon?: string;
}

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  { id: "1:1", name: "Square", label: "Instagram", width: 1080, height: 1080 },
  { id: "16:9", name: "Wide", label: "Twitter/LinkedIn", width: 1200, height: 675 },
  { id: "9:16", name: "Story", label: "Story/Reels", width: 1080, height: 1920 },
  { id: "4:5", name: "Portrait", label: "IG Feed", width: 1080, height: 1350 },
  { id: "1.91:1", name: "OG Image", label: "Open Graph", width: 1200, height: 630 },
  { id: "auto", name: "Auto", label: "Fit Content", width: 0, height: 0 },
];

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type ExportFormat = "png" | "svg" | "clipboard";

export interface ExportOptions {
  format: ExportFormat;
  scale: number;
  background: "transparent" | "solid" | "gradient";
  backgroundColor?: string;
  padding: number;
}

// ============================================================================
// PRESENTATION OPTIONS
// ============================================================================

export interface PresentationOptions {
  background:
    | "transparent"
    | "solid"
    | "gradient"
    | "pattern"
    | "blur"
    | "dark"
    | "light";
  backgroundGradient?: {
    from: string;
    to: string;
    angle: number;
  };
  padding: "none" | "small" | "medium" | "large";
  shadow: "none" | "subtle" | "medium" | "dramatic";
  borderRadius: "none" | "small" | "medium" | "large";
  rotation: number;
  watermark: boolean;
}

// ============================================================================
// STATE TYPES
// ============================================================================

export interface MockupState {
  selectedCategory: MockupCategory | null;
  selectedMockup: string | null;
  industry: IndustryId;
  theme: "light" | "dark";
  primaryColor: string;
  aspectRatio: string;
  customData: Record<string, unknown>;
  presentation: PresentationOptions;
}
