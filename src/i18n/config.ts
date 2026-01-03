// Supported locales
export const locales = ["en", "es", "fr", "de", "pt"] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = "en";

// Locale display names
export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
};

// Unit system preferences per locale
export const localeUnitSystems: Record<Locale, "imperial" | "metric"> = {
  en: "imperial",
  es: "metric",
  fr: "metric",
  de: "metric",
  pt: "metric",
};

// Currency defaults per locale
export const localeCurrencies: Record<Locale, string> = {
  en: "USD",
  es: "USD",
  fr: "EUR",
  de: "EUR",
  pt: "BRL",
};

// Date format preferences per locale
export const localeDateFormats: Record<Locale, string> = {
  en: "MM/dd/yyyy",
  es: "dd/MM/yyyy",
  fr: "dd/MM/yyyy",
  de: "dd.MM.yyyy",
  pt: "dd/MM/yyyy",
};

// Time format preferences (12h vs 24h)
export const localeTimeFormats: Record<Locale, "12h" | "24h"> = {
  en: "12h",
  es: "24h",
  fr: "24h",
  de: "24h",
  pt: "24h",
};
