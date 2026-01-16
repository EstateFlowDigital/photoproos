/**
 * CMS Page Builder Utilities
 *
 * Client-safe utility functions and types for page builder components.
 * Can be imported in both client and server components.
 */

import type { CMSComponent } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Field types supported in component schemas
 */
export type ComponentFieldType =
  | "text"           // Single line text
  | "textarea"       // Multi-line text
  | "richtext"       // Rich text editor
  | "number"         // Numeric input
  | "url"            // URL input
  | "email"          // Email input
  | "image"          // Image picker
  | "video"          // Video URL/embed
  | "icon"           // Icon selector
  | "color"          // Color picker
  | "select"         // Dropdown select
  | "multiselect"    // Multi-select
  | "toggle"         // Boolean toggle
  | "date"           // Date picker
  | "array"          // Array of items
  | "object"         // Nested object
  | "mockup";        // Mockup picker from mockup library

/**
 * Field definition in component schema
 */
export interface ComponentField {
  name: string;           // Field key
  label: string;          // Display label
  type: ComponentFieldType;
  required?: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  helpText?: string;
  // For select/multiselect
  options?: { label: string; value: string }[];
  // For array fields
  itemSchema?: ComponentField[];
  // For object fields
  fields?: ComponentField[];
  // For mockup fields
  mockupCategory?: string; // Filter mockups by category (e.g., "dashboard", "galleries")
  // Validation
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

/**
 * Component schema definition
 */
export interface ComponentSchema {
  fields: ComponentField[];
}

/**
 * Instance of a component on a page
 */
export interface PageComponentInstance {
  id: string;              // Unique instance ID
  componentId: string;     // Reference to CMSComponent.id
  componentSlug: string;   // Component slug for rendering
  content: Record<string, unknown>;  // Instance content
  order: number;           // Position on page
}

/**
 * Full component data with schema parsed
 */
export interface ComponentWithSchema extends Omit<CMSComponent, "schema" | "defaultContent"> {
  schema: ComponentSchema;
  defaultContent: Record<string, unknown>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate a unique ID for component instances
 */
export function generateComponentId(): string {
  return `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new component instance with default content
 */
export function createComponentInstance(
  component: CMSComponent | ComponentWithSchema,
  overrides?: Partial<Record<string, unknown>>
): PageComponentInstance {
  const defaultContent = typeof component.defaultContent === "string"
    ? JSON.parse(component.defaultContent as string)
    : component.defaultContent;

  return {
    id: generateComponentId(),
    componentId: component.id,
    componentSlug: component.slug,
    content: { ...defaultContent, ...overrides },
    order: 0,
  };
}

/**
 * Reorder components in a list
 */
export function reorderComponents(
  components: PageComponentInstance[],
  fromIndex: number,
  toIndex: number
): PageComponentInstance[] {
  const result = [...components];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result.map((c, i) => ({ ...c, order: i }));
}

/**
 * Insert a component at a specific position
 */
export function insertComponent(
  components: PageComponentInstance[],
  newComponent: PageComponentInstance,
  atIndex: number
): PageComponentInstance[] {
  const result = [...components];
  result.splice(atIndex, 0, newComponent);
  return result.map((c, i) => ({ ...c, order: i }));
}

/**
 * Remove a component from the list
 */
export function removeComponent(
  components: PageComponentInstance[],
  componentId: string
): PageComponentInstance[] {
  return components
    .filter((c) => c.id !== componentId)
    .map((c, i) => ({ ...c, order: i }));
}

/**
 * Duplicate a component
 */
export function duplicateComponent(
  components: PageComponentInstance[],
  componentId: string
): PageComponentInstance[] {
  const index = components.findIndex((c) => c.id === componentId);
  if (index === -1) return components;

  const original = components[index];
  const duplicate: PageComponentInstance = {
    ...original,
    id: generateComponentId(),
    content: JSON.parse(JSON.stringify(original.content)),
  };

  return insertComponent(components, duplicate, index + 1);
}

/**
 * Update component content
 */
export function updateComponentContent(
  components: PageComponentInstance[],
  componentId: string,
  content: Record<string, unknown>
): PageComponentInstance[] {
  return components.map((c) =>
    c.id === componentId ? { ...c, content: { ...c.content, ...content } } : c
  );
}

/**
 * Validate component content against schema
 */
export function validateComponentContent(
  content: Record<string, unknown>,
  schema: ComponentSchema
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of schema.fields) {
    const value = content[field.name];

    if (field.required && (value === undefined || value === null || value === "")) {
      errors.push(`${field.label} is required`);
    }

    if (value !== undefined && value !== null) {
      // Type-specific validation
      if (field.type === "url" && typeof value === "string" && value.length > 0) {
        try {
          new URL(value);
        } catch {
          errors.push(`${field.label} must be a valid URL`);
        }
      }

      if (field.type === "email" && typeof value === "string" && value.length > 0) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`${field.label} must be a valid email`);
        }
      }

      if (field.minLength && typeof value === "string" && value.length < field.minLength) {
        errors.push(`${field.label} must be at least ${field.minLength} characters`);
      }

      if (field.maxLength && typeof value === "string" && value.length > field.maxLength) {
        errors.push(`${field.label} must be at most ${field.maxLength} characters`);
      }

      if (field.min !== undefined && typeof value === "number" && value < field.min) {
        errors.push(`${field.label} must be at least ${field.min}`);
      }

      if (field.max !== undefined && typeof value === "number" && value > field.max) {
        errors.push(`${field.label} must be at most ${field.max}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
