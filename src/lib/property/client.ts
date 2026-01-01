/**
 * Property Data Client
 *
 * Configuration and API client for property data services.
 * Supports ATTOM API (optional) with fallback to manual entry.
 */

// API Configuration
const ATTOM_API_KEY = process.env.ATTOM_API_KEY;
const ATTOM_API_BASE_URL = "https://api.gateway.attomdata.com/propertyapi/v1.0.0";

/**
 * Check if ATTOM API is configured
 */
export function isConfigured(): boolean {
  return !!ATTOM_API_KEY;
}

/**
 * Get ATTOM API headers
 */
export function getApiHeaders(): HeadersInit {
  if (!ATTOM_API_KEY) {
    throw new Error("ATTOM API key is not configured");
  }

  return {
    Accept: "application/json",
    apikey: ATTOM_API_KEY,
  };
}

/**
 * Build ATTOM property lookup URL
 */
export function getPropertyLookupUrl(
  address: string,
  city: string,
  state: string,
  postalCode: string
): string {
  const params = new URLSearchParams({
    address1: address,
    address2: `${city}, ${state} ${postalCode}`,
  });

  return `${ATTOM_API_BASE_URL}/property/basicprofile?${params.toString()}`;
}

/**
 * Build ATTOM property detail URL by APN
 */
export function getPropertyDetailUrl(apn: string, fips: string): string {
  const params = new URLSearchParams({
    apn,
    fips,
  });

  return `${ATTOM_API_BASE_URL}/property/expandedprofile?${params.toString()}`;
}
