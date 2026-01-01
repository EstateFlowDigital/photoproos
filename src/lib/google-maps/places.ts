// Google Places API utilities

import { getPlacesAutocompleteUrl, getPlaceDetailsUrl, isConfigured } from "./client";
import {
  PlaceAutocompleteResult,
  PlaceDetails,
  GooglePlacesAutocompleteResponse,
  GooglePlaceDetailsResponse,
  GoogleMapsError,
} from "./types";

/**
 * Search for address suggestions using Google Places Autocomplete
 */
export async function searchPlaces(
  input: string,
  sessionToken?: string
): Promise<PlaceAutocompleteResult[]> {
  if (!isConfigured()) {
    console.warn("Google Maps API not configured, returning empty results");
    return [];
  }

  if (!input || input.length < 3) {
    return [];
  }

  try {
    const url = getPlacesAutocompleteUrl(input, sessionToken);
    const response = await fetch(url);

    if (!response.ok) {
      throw new GoogleMapsError(
        `HTTP error ${response.status}`,
        "HTTP_ERROR",
        response.statusText
      );
    }

    const data: GooglePlacesAutocompleteResponse = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new GoogleMapsError(
        `Places API error: ${data.status}`,
        data.status
      );
    }

    return data.predictions.map((prediction) => ({
      placeId: prediction.place_id,
      description: prediction.description,
      mainText: prediction.structured_formatting.main_text,
      secondaryText: prediction.structured_formatting.secondary_text,
    }));
  } catch (error) {
    if (error instanceof GoogleMapsError) {
      throw error;
    }
    console.error("Error searching places:", error);
    throw new GoogleMapsError(
      "Failed to search places",
      "NETWORK_ERROR",
      String(error)
    );
  }
}

/**
 * Get detailed information about a place by its ID
 */
export async function getPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetails> {
  if (!isConfigured()) {
    throw new GoogleMapsError(
      "Google Maps API not configured",
      "NOT_CONFIGURED"
    );
  }

  try {
    const url = getPlaceDetailsUrl(placeId, sessionToken);
    const response = await fetch(url);

    if (!response.ok) {
      throw new GoogleMapsError(
        `HTTP error ${response.status}`,
        "HTTP_ERROR",
        response.statusText
      );
    }

    const data: GooglePlaceDetailsResponse = await response.json();

    if (data.status !== "OK") {
      throw new GoogleMapsError(
        `Place Details API error: ${data.status}`,
        data.status
      );
    }

    const result = data.result;
    const addressComponents = parseAddressComponents(result.address_components);

    return {
      placeId: result.place_id,
      formattedAddress: result.formatted_address,
      streetAddress: addressComponents.streetAddress,
      city: addressComponents.city,
      state: addressComponents.state,
      postalCode: addressComponents.postalCode,
      country: addressComponents.country,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };
  } catch (error) {
    if (error instanceof GoogleMapsError) {
      throw error;
    }
    console.error("Error getting place details:", error);
    throw new GoogleMapsError(
      "Failed to get place details",
      "NETWORK_ERROR",
      String(error)
    );
  }
}

/**
 * Parse Google address components into structured data
 */
function parseAddressComponents(
  components: { long_name: string; short_name: string; types: string[] }[]
): {
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
} {
  let streetNumber = "";
  let route = "";
  let city: string | null = null;
  let state: string | null = null;
  let postalCode: string | null = null;
  let country = "US";

  for (const component of components) {
    const types = component.types;

    if (types.includes("street_number")) {
      streetNumber = component.long_name;
    }
    if (types.includes("route")) {
      route = component.long_name;
    }
    if (types.includes("locality")) {
      city = component.long_name;
    }
    if (types.includes("administrative_area_level_1")) {
      state = component.short_name; // Use abbreviation for state
    }
    if (types.includes("postal_code")) {
      postalCode = component.long_name;
    }
    if (types.includes("country")) {
      country = component.short_name;
    }
  }

  const streetAddress = streetNumber && route
    ? `${streetNumber} ${route}`
    : route || null;

  return {
    streetAddress,
    city,
    state,
    postalCode,
    country,
  };
}

/**
 * Generate a session token for Places API billing optimization
 * Session tokens group autocomplete requests with place details requests
 */
export function generateSessionToken(): string {
  return crypto.randomUUID();
}
