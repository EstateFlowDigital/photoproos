// Google Maps API Library for PhotoProOS
// Provides utilities for address autocomplete, geocoding, distance calculations, and maps

// Types
export * from "./types";

// Client utilities
export { isConfigured, getStaticMapUrl, getEmbedMapUrl } from "./client";

// Places (Autocomplete)
export { searchPlaces, getPlaceDetails, generateSessionToken } from "./places";

// Geocoding
export { geocodeAddress, reverseGeocode, validateAddress } from "./geocoding";

// Distance Matrix
export {
  calculateDistance,
  calculateDistanceByAddresses,
  calculateTravelFee,
  getTravelInfo,
  formatTravelFee,
  formatDistance,
  formatTravelTime,
} from "./distance";
