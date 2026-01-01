/**
 * Property Data Library
 *
 * Utilities for fetching and analyzing property details.
 * Provides package suggestions based on property characteristics.
 */

// Types
export type {
  PropertyDetails,
  PropertySuggestion,
  PropertyType,
  PropertyLookupResult,
} from "./types";

export { propertyTypeLabels, propertyTypeIcons } from "./types";

// Client
export { isConfigured } from "./client";

// Package Suggestions
export {
  suggestPackage,
  estimateShootDuration,
  getPropertyTypeLabel,
  formatSquareFeet,
  formatLotSize,
  calculatePricePerSqft,
} from "./suggest-package";
