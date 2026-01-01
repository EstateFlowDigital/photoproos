// Google Distance Matrix API utilities

import { getDistanceMatrixUrl, isConfigured } from "./client";
import {
  DistanceMatrixResult,
  TravelInfo,
  GoogleDistanceMatrixResponse,
  GoogleMapsError,
} from "./types";

const METERS_TO_MILES = 0.000621371;

/**
 * Calculate distance and travel time between two locations
 */
export async function calculateDistance(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<DistanceMatrixResult> {
  if (!isConfigured()) {
    throw new GoogleMapsError(
      "Google Maps API not configured",
      "NOT_CONFIGURED"
    );
  }

  const origins = `${originLat},${originLng}`;
  const destinations = `${destLat},${destLng}`;

  try {
    const url = getDistanceMatrixUrl(origins, destinations);
    const response = await fetch(url);

    if (!response.ok) {
      throw new GoogleMapsError(
        `HTTP error ${response.status}`,
        "HTTP_ERROR",
        response.statusText
      );
    }

    const data: GoogleDistanceMatrixResponse = await response.json();

    if (data.status !== "OK") {
      throw new GoogleMapsError(
        `Distance Matrix API error: ${data.status}`,
        data.status
      );
    }

    const element = data.rows[0]?.elements[0];

    if (!element || element.status !== "OK") {
      throw new GoogleMapsError(
        `No route found: ${element?.status || "UNKNOWN"}`,
        element?.status || "NO_ROUTE"
      );
    }

    const distanceMeters = element.distance.value;
    const distanceMiles = distanceMeters * METERS_TO_MILES;
    const durationSeconds = element.duration.value;
    const durationMinutes = Math.ceil(durationSeconds / 60);

    return {
      originAddress: data.origin_addresses[0],
      destinationAddress: data.destination_addresses[0],
      distanceMeters,
      distanceMiles: Math.round(distanceMiles * 10) / 10, // Round to 1 decimal
      durationSeconds,
      durationMinutes,
      durationText: element.duration.text,
      distanceText: element.distance.text,
    };
  } catch (error) {
    if (error instanceof GoogleMapsError) {
      throw error;
    }
    console.error("Error calculating distance:", error);
    throw new GoogleMapsError(
      "Failed to calculate distance",
      "NETWORK_ERROR",
      String(error)
    );
  }
}

/**
 * Calculate distance by addresses (geocodes first if needed)
 */
export async function calculateDistanceByAddresses(
  originAddress: string,
  destinationAddress: string
): Promise<DistanceMatrixResult> {
  if (!isConfigured()) {
    throw new GoogleMapsError(
      "Google Maps API not configured",
      "NOT_CONFIGURED"
    );
  }

  try {
    const url = getDistanceMatrixUrl(originAddress, destinationAddress);
    const response = await fetch(url);

    if (!response.ok) {
      throw new GoogleMapsError(
        `HTTP error ${response.status}`,
        "HTTP_ERROR",
        response.statusText
      );
    }

    const data: GoogleDistanceMatrixResponse = await response.json();

    if (data.status !== "OK") {
      throw new GoogleMapsError(
        `Distance Matrix API error: ${data.status}`,
        data.status
      );
    }

    const element = data.rows[0]?.elements[0];

    if (!element || element.status !== "OK") {
      throw new GoogleMapsError(
        `No route found: ${element?.status || "UNKNOWN"}`,
        element?.status || "NO_ROUTE"
      );
    }

    const distanceMeters = element.distance.value;
    const distanceMiles = distanceMeters * METERS_TO_MILES;
    const durationSeconds = element.duration.value;
    const durationMinutes = Math.ceil(durationSeconds / 60);

    return {
      originAddress: data.origin_addresses[0],
      destinationAddress: data.destination_addresses[0],
      distanceMeters,
      distanceMiles: Math.round(distanceMiles * 10) / 10,
      durationSeconds,
      durationMinutes,
      durationText: element.duration.text,
      distanceText: element.distance.text,
    };
  } catch (error) {
    if (error instanceof GoogleMapsError) {
      throw error;
    }
    console.error("Error calculating distance:", error);
    throw new GoogleMapsError(
      "Failed to calculate distance",
      "NETWORK_ERROR",
      String(error)
    );
  }
}

/**
 * Calculate travel fee based on distance and organization settings
 */
export function calculateTravelFee(
  distanceMiles: number,
  feePerMileCents: number,
  freeThresholdMiles: number
): number {
  // If within free threshold, no fee
  if (distanceMiles <= freeThresholdMiles) {
    return 0;
  }

  // Calculate fee for miles beyond threshold
  const chargeableMiles = distanceMiles - freeThresholdMiles;
  const feeCents = Math.round(chargeableMiles * feePerMileCents);

  return feeCents;
}

/**
 * Get complete travel info including distance, time, and fee
 */
export async function getTravelInfo(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  feePerMileCents: number = 0,
  freeThresholdMiles: number = 0
): Promise<TravelInfo> {
  const distance = await calculateDistance(originLat, originLng, destLat, destLng);

  const travelFeeCents = calculateTravelFee(
    distance.distanceMiles,
    feePerMileCents,
    freeThresholdMiles
  );

  return {
    distanceMiles: distance.distanceMiles,
    travelTimeMinutes: distance.durationMinutes,
    travelFeeCents,
    freeThresholdMiles,
    feePerMile: feePerMileCents,
  };
}

/**
 * Format travel fee for display
 */
export function formatTravelFee(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Format distance for display
 */
export function formatDistance(miles: number): string {
  if (miles < 1) {
    return `${Math.round(miles * 10) / 10} mi`;
  }
  return `${Math.round(miles)} mi`;
}

/**
 * Format travel time for display
 */
export function formatTravelTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}
