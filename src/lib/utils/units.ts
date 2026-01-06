/**
 * Unit conversion utilities for imperial/metric systems
 */

export type UnitSystem = "imperial" | "metric";

// ============================================================================
// LENGTH CONVERSIONS
// ============================================================================

/**
 * Convert feet to meters
 */
export function feetToMeters(feet: number): number {
  return feet * 0.3048;
}

/**
 * Convert meters to feet
 */
export function metersToFeet(meters: number): number {
  return meters / 0.3048;
}

/**
 * Convert miles to kilometers
 */
export function milesToKilometers(miles: number): number {
  return miles * 1.60934;
}

/**
 * Convert kilometers to miles
 */
export function kilometersToMiles(kilometers: number): number {
  return kilometers / 1.60934;
}

/**
 * Format distance based on unit system
 */
export function formatDistance(
  value: number,
  fromUnit: "miles" | "km",
  toSystem: UnitSystem
): string {
  if (toSystem === "imperial") {
    const miles = fromUnit === "km" ? kilometersToMiles(value) : value;
    return `${miles.toFixed(1)} mi`;
  } else {
    const km = fromUnit === "miles" ? milesToKilometers(value) : value;
    return `${km.toFixed(1)} km`;
  }
}

// ============================================================================
// AREA CONVERSIONS
// ============================================================================

/**
 * Convert square feet to square meters
 */
export function sqFeetToSqMeters(sqFeet: number): number {
  return sqFeet * 0.092903;
}

/**
 * Convert square meters to square feet
 */
export function sqMetersToSqFeet(sqMeters: number): number {
  return sqMeters / 0.092903;
}

/**
 * Format area based on unit system
 */
export function formatArea(
  value: number,
  fromUnit: "sqft" | "sqm",
  toSystem: UnitSystem
): string {
  if (toSystem === "imperial") {
    const sqft = fromUnit === "sqm" ? sqMetersToSqFeet(value) : value;
    return `${Math.round(sqft).toLocaleString()} sq ft`;
  } else {
    const sqm = fromUnit === "sqft" ? sqFeetToSqMeters(value) : value;
    return `${Math.round(sqm).toLocaleString()} m²`;
  }
}

// ============================================================================
// TEMPERATURE CONVERSIONS
// ============================================================================

/**
 * Convert Fahrenheit to Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * (5 / 9);
}

/**
 * Convert Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return celsius * (9 / 5) + 32;
}

/**
 * Format temperature based on unit system
 */
export function formatTemperature(
  value: number,
  fromUnit: "F" | "C",
  toSystem: UnitSystem
): string {
  if (toSystem === "imperial") {
    const f = fromUnit === "C" ? celsiusToFahrenheit(value) : value;
    return `${Math.round(f)}°F`;
  } else {
    const c = fromUnit === "F" ? fahrenheitToCelsius(value) : value;
    return `${Math.round(c)}°C`;
  }
}

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Maps currencies to their appropriate locales
 */
const currencyLocaleMap: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  CAD: "en-CA",
  AUD: "en-AU",
  BRL: "pt-BR",
  MXN: "es-MX",
  JPY: "ja-JP",
  CHF: "de-CH",
};

export interface CurrencyFormatOptions {
  /** Show decimal places (default: true for most currencies, false for JPY) */
  showDecimals?: boolean;
  /** Override the locale */
  locale?: string;
}

/**
 * Format currency amount from cents
 * @param cents - Amount in cents (smallest currency unit)
 * @param currency - Currency code (USD, EUR, etc.)
 * @param options - Formatting options
 */
export function formatCurrency(
  cents: number,
  currency: string = "USD",
  options: CurrencyFormatOptions = {}
): string {
  const locale = options.locale || currencyLocaleMap[currency] || "en-US";

  // JPY and similar currencies don't use decimal places
  const isZeroDecimalCurrency = currency === "JPY";
  const showDecimals = options.showDecimals ?? !isZeroDecimalCurrency;

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(cents / 100);
}

/**
 * Format currency amount without decimal places (for UI display)
 * @param cents - Amount in cents
 * @param currency - Currency code
 */
export function formatCurrencyWhole(cents: number, currency: string = "USD"): string {
  return formatCurrency(cents, currency, { showDecimals: false });
}

// ============================================================================
// DATE/TIME FORMATTING
// ============================================================================

/**
 * Format date based on locale
 */
export function formatDate(
  date: Date | string,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Format time based on locale (respects 12h/24h preference)
 */
export function formatTime(
  date: Date | string,
  locale: string = "en-US",
  use24Hour: boolean = false
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: !use24Hour,
  }).format(d);
}

/**
 * Format date and time together
 */
export function formatDateTime(
  date: Date | string,
  locale: string = "en-US",
  use24Hour: boolean = false
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    hour12: !use24Hour,
  }).format(d);
}

// ============================================================================
// UNIVERSAL UNIT CONVERTER
// ============================================================================

export interface UnitConverterOptions {
  system: UnitSystem;
  locale?: string;
  currency?: string;
  use24Hour?: boolean;
}

export function createUnitConverter(options: UnitConverterOptions) {
  const { system, locale = "en-US", currency = "USD", use24Hour = false } = options;

  return {
    distance: (value: number, fromUnit: "miles" | "km") =>
      formatDistance(value, fromUnit, system),
    area: (value: number, fromUnit: "sqft" | "sqm") =>
      formatArea(value, fromUnit, system),
    temperature: (value: number, fromUnit: "F" | "C") =>
      formatTemperature(value, fromUnit, system),
    currency: (cents: number) => formatCurrency(cents, currency, { locale }),
    date: (date: Date | string) => formatDate(date, locale),
    time: (date: Date | string) => formatTime(date, locale, use24Hour),
    dateTime: (date: Date | string) => formatDateTime(date, locale, use24Hour),
  };
}
