// Google Geocoding API utilities

import { getGeocodingUrl, getReverseGeocodingUrl, isConfigured } from "./client";
import {
  GeocodingResult,
  GoogleGeocodingResponse,
  GoogleMapsError,
} from "./types";

/**
 * Geocode an address to get coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  if (!isConfigured()) {
    throw new GoogleMapsError(
      "Google Maps API not configured",
      "NOT_CONFIGURED"
    );
  }

  try {
    const url = getGeocodingUrl(address);
    const response = await fetch(url);

    if (!response.ok) {
      throw new GoogleMapsError(
        `HTTP error ${response.status}`,
        "HTTP_ERROR",
        response.statusText
      );
    }

    const data: GoogleGeocodingResponse = await response.json();

    if (data.status !== "OK") {
      throw new GoogleMapsError(
        `Geocoding API error: ${data.status}`,
        data.status
      );
    }

    if (data.results.length === 0) {
      throw new GoogleMapsError(
        "No results found for address",
        "ZERO_RESULTS"
      );
    }

    const result = data.results[0];

    return {
      formattedAddress: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      placeId: result.place_id,
      addressComponents: result.address_components.map((c) => ({
        longName: c.long_name,
        shortName: c.short_name,
        types: c.types,
      })),
    };
  } catch (error) {
    if (error instanceof GoogleMapsError) {
      throw error;
    }
    console.error("Error geocoding address:", error);
    throw new GoogleMapsError(
      "Failed to geocode address",
      "NETWORK_ERROR",
      String(error)
    );
  }
}

/**
 * Reverse geocode coordinates to get an address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodingResult> {
  if (!isConfigured()) {
    throw new GoogleMapsError(
      "Google Maps API not configured",
      "NOT_CONFIGURED"
    );
  }

  try {
    const url = getReverseGeocodingUrl(latitude, longitude);
    const response = await fetch(url);

    if (!response.ok) {
      throw new GoogleMapsError(
        `HTTP error ${response.status}`,
        "HTTP_ERROR",
        response.statusText
      );
    }

    const data: GoogleGeocodingResponse = await response.json();

    if (data.status !== "OK") {
      throw new GoogleMapsError(
        `Geocoding API error: ${data.status}`,
        data.status
      );
    }

    if (data.results.length === 0) {
      throw new GoogleMapsError(
        "No results found for coordinates",
        "ZERO_RESULTS"
      );
    }

    const result = data.results[0];

    return {
      formattedAddress: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      placeId: result.place_id,
      addressComponents: result.address_components.map((c) => ({
        longName: c.long_name,
        shortName: c.short_name,
        types: c.types,
      })),
    };
  } catch (error) {
    if (error instanceof GoogleMapsError) {
      throw error;
    }
    console.error("Error reverse geocoding:", error);
    throw new GoogleMapsError(
      "Failed to reverse geocode coordinates",
      "NETWORK_ERROR",
      String(error)
    );
  }
}

/**
 * Validate an address by geocoding and checking results
 */
export async function validateAddress(address: string): Promise<{
  isValid: boolean;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
  error?: string;
}> {
  try {
    const result = await geocodeAddress(address);
    return {
      isValid: true,
      formattedAddress: result.formattedAddress,
      latitude: result.latitude,
      longitude: result.longitude,
    };
  } catch (error) {
    if (error instanceof GoogleMapsError) {
      return {
        isValid: false,
        error: error.message,
      };
    }
    return {
      isValid: false,
      error: "Failed to validate address",
    };
  }
}
