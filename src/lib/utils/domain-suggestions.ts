/**
 * Domain Suggestion Utilities
 * Pure functions for generating domain name suggestions
 */

/**
 * Generate domain suggestions based on property address
 */
export function generateDomainSuggestions(address: string): string[] {
  // Handle empty/invalid input
  if (!address || typeof address !== "string") {
    return [];
  }

  // Clean and normalize the address
  const cleaned = address
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim();

  const parts = cleaned.split(/\s+/);

  // Extract components
  const streetNumber = parts[0] || "";
  const streetName = parts.slice(1).join("") || "property";

  const suggestions: string[] = [];

  // Primary suggestion: streetnumber + streetname
  if (streetNumber && streetName) {
    suggestions.push(`${streetNumber}${streetName}.com`);
  }

  // Alternative formats
  if (streetNumber && streetName) {
    suggestions.push(`${streetNumber}-${parts.slice(1).join("-")}.com`);
    suggestions.push(`${streetName}${streetNumber}.com`);
  }

  // Just street name variations
  if (streetName) {
    suggestions.push(`${streetName}home.com`);
    suggestions.push(`${streetName}property.com`);
    suggestions.push(`tour${streetName}.com`);
  }

  // Other TLDs
  if (streetNumber && streetName) {
    suggestions.push(`${streetNumber}${streetName}.house`);
    suggestions.push(`${streetNumber}${streetName}.property`);
    suggestions.push(`${streetNumber}${streetName}.homes`);
  }

  // Remove duplicates and limit
  return [...new Set(suggestions)].slice(0, 10);
}

/**
 * Generate portfolio domain suggestions based on name
 */
export function generatePortfolioDomainSuggestions(name: string): string[] {
  // Handle empty/invalid input
  if (!name || typeof name !== "string") {
    return [];
  }

  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "");

  const suggestions: string[] = [];

  // Primary formats
  suggestions.push(`${cleaned}.com`);
  suggestions.push(`${cleaned}photo.com`);
  suggestions.push(`${cleaned}photography.com`);
  suggestions.push(`${cleaned}photos.com`);
  suggestions.push(`${cleaned}studio.com`);

  // With separators
  const words = name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/);
  if (words.length > 1) {
    suggestions.push(`${words.join("-")}.com`);
    suggestions.push(`${words.join("")}photo.com`);
  }

  return [...new Set(suggestions)].slice(0, 10);
}
