/**
 * Application-wide constants
 * Centralized configuration values used across multiple components
 */

// ============================================================================
// BUNDLE & PRICING TYPES
// ============================================================================

export const BUNDLE_TYPES = [
  { value: "fixed", label: "Fixed Price", description: "Single price for all included services" },
  { value: "tiered", label: "Tiered", description: "Multiple pricing tiers with different options" },
  { value: "custom", label: "Custom", description: "Client can customize their selection" },
  { value: "sqft_based", label: "Per Sqft", description: "Price based on property square footage" },
  { value: "tiered_sqft", label: "Tiered Sqft", description: "Tiered pricing by square footage ranges" },
] as const;

export type BundleTypeValue = (typeof BUNDLE_TYPES)[number]["value"];

export const PRICING_TYPES = [
  { value: "fixed", label: "Fixed Price", unit: "" },
  { value: "per_sqft", label: "Per Square Foot", unit: "sq ft" },
  { value: "per_item", label: "Per Item", unit: "items" },
  { value: "per_hour", label: "Per Hour", unit: "hours" },
  { value: "per_person", label: "Per Person", unit: "people" },
  { value: "per_mile", label: "Per Mile", unit: "miles" },
] as const;

export type PricingTypeValue = (typeof PRICING_TYPES)[number]["value"];

// ============================================================================
// NOTIFICATION TYPE MAPPINGS
// ============================================================================

/**
 * Maps database notification types to UI display types
 */
export const NOTIFICATION_TYPE_MAP: Record<string, string> = {
  // Payments
  payment_received: "payment",
  invoice_paid: "payment",
  payment_failed: "payment_failed",

  // Gallery
  gallery_viewed: "view",
  gallery_delivered: "gallery",

  // Contracts
  contract_signed: "contract",
  contract_sent: "contract",

  // Bookings
  booking_confirmed: "booking",
  booking_created: "booking",
  booking_cancelled: "booking_cancelled",
  booking_reminder: "reminder",

  // Invoices
  invoice_overdue: "expiring",
  invoice_sent: "invoice",

  // Questionnaires
  questionnaire_assigned: "questionnaire",
  questionnaire_reminder: "questionnaire",
  questionnaire_completed: "questionnaire_done",

  // Other
  lead_received: "lead",
  client_added: "client",
  system: "system",
};

/**
 * Get UI notification type from database type
 */
export function getNotificationType(dbType: string): string {
  return NOTIFICATION_TYPE_MAP[dbType] || "system";
}

// ============================================================================
// SPACER PRESETS
// ============================================================================

export const SPACER_PRESETS = [
  { label: "Small", value: 40 },
  { label: "Medium", value: 80 },
  { label: "Large", value: 120 },
  { label: "Extra Large", value: 200 },
] as const;

// ============================================================================
// FILE SIZE LIMITS
// ============================================================================

export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  document: 25 * 1024 * 1024, // 25MB
  video: 100 * 1024 * 1024, // 100MB
} as const;

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  pageSizeOptions: [10, 20, 50, 100],
} as const;

// ============================================================================
// TIMEOUT DEFAULTS
// ============================================================================

export const TIMEOUTS = {
  toast: 5000, // 5 seconds
  debounce: 300, // 300ms
  autoSave: 2000, // 2 seconds
  sessionWarning: 5 * 60 * 1000, // 5 minutes
} as const;

// ============================================================================
// SUPPORTED CURRENCIES
// ============================================================================

/**
 * Supported currencies with their display names
 */
export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]["code"];
