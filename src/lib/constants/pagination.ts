/**
 * Pagination and data fetching limits
 *
 * Centralized constants for consistent data fetching across the application.
 * Adjust these values to control how much data is loaded in different contexts.
 */

export const PAGINATION_LIMITS = {
  // Dashboard widgets
  ACTIVITY_FEED: 5,
  RECENT_GALLERIES: 4,
  UPCOMING_BOOKINGS: 3,

  // Lists and tables
  DEFAULT_PAGE_SIZE: 20,
  LARGE_PAGE_SIZE: 50,

  // Modal dropdowns
  CLIENT_DROPDOWN: 50,
  PROJECT_DROPDOWN: 50,

  // Detail page related items
  CLIENT_PROJECTS: 5,
  CLIENT_GALLERIES: 5,
  CLIENT_BOOKINGS: 5,
  CLIENT_INVOICES: 5,
} as const;

/**
 * Default values for various settings
 */
export const DEFAULT_VALUES = {
  // Travel settings
  TRAVEL_FEE_PER_MILE_CENTS: 65, // $0.65 per mile
  FREE_TRAVEL_THRESHOLD_MILES: 15,

  // Gallery settings
  GALLERY_EXPIRY_DAYS: 30,

  // Invoice settings
  PAYMENT_DUE_DAYS: 14,
} as const;

/**
 * Rate limits for external API calls
 */
export const RATE_LIMITS = {
  WEATHER_CACHE_MINUTES: 30,
  PROPERTY_LOOKUP_CACHE_HOURS: 24,
} as const;
