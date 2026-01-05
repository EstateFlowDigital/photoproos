import type { ReactElement } from "react";

/**
 * PDF Utility Functions
 *
 * Shared utilities for PDF generation across the application.
 * Centralizes type-safe helpers and common formatting functions.
 */

/**
 * Type-safe wrapper for react-pdf's renderToBuffer.
 *
 * react-pdf expects Document elements but React.createElement returns
 * generic ReactElement. This wrapper ensures type safety while allowing
 * the conversion needed for renderToBuffer.
 *
 * @param component - A ReactElement created with React.createElement
 * @returns The same element with proper typing for react-pdf
 */
export const createPdfElement = (component: ReactElement): ReactElement => component;

/**
 * Format a date for display in PDFs.
 *
 * Uses US English locale with full month name, day, and year.
 * Example output: "January 5, 2026"
 *
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatPdfDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

/**
 * Organization logo selection with priority fallback.
 *
 * Priority order:
 * 1. Invoice-specific logo (invoiceLogoUrl)
 * 2. Light variant logo (logoLightUrl)
 * 3. Default logo (logoUrl)
 *
 * @param organization - Organization with optional logo fields
 * @returns The best available logo URL or null
 */
export const getOrganizationLogoUrl = (
  organization: {
    invoiceLogoUrl?: string | null;
    logoLightUrl?: string | null;
    logoUrl?: string | null;
  } | null
): string | null => {
  if (!organization) return null;
  return (
    organization.invoiceLogoUrl ||
    organization.logoLightUrl ||
    organization.logoUrl ||
    null
  );
};

/**
 * Generate a receipt number from a payment ID.
 *
 * @param paymentId - The payment UUID
 * @returns Receipt number in format "REC-XXXXXXXX"
 */
export const generateReceiptNumber = (paymentId: string): string => {
  return `REC-${paymentId.slice(0, 8).toUpperCase()}`;
};

/**
 * Sanitize a string for use in a filename.
 *
 * Removes special characters and replaces spaces with hyphens.
 *
 * @param name - The string to sanitize
 * @param maxLength - Maximum length of the result (default: 50)
 * @returns Safe filename string
 */
export const sanitizeFilename = (name: string, maxLength = 50): string => {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, maxLength);
};
