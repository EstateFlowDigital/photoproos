// Google Maps API Client Configuration

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_BASE_URL = "https://maps.googleapis.com/maps/api";

export function getApiKey(): string {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error(
      "GOOGLE_MAPS_API_KEY is not configured. Please add it to your environment variables."
    );
  }
  return GOOGLE_MAPS_API_KEY;
}

export function isConfigured(): boolean {
  return !!GOOGLE_MAPS_API_KEY;
}

export function getPlacesAutocompleteUrl(input: string, sessionToken?: string): string {
  const params = new URLSearchParams({
    input,
    key: getApiKey(),
    types: "address",
    components: "country:us",
  });

  if (sessionToken) {
    params.append("sessiontoken", sessionToken);
  }

  return `${GOOGLE_MAPS_BASE_URL}/place/autocomplete/json?${params.toString()}`;
}

export function getPlaceDetailsUrl(placeId: string, sessionToken?: string): string {
  const params = new URLSearchParams({
    place_id: placeId,
    key: getApiKey(),
    fields: "place_id,formatted_address,address_components,geometry",
  });

  if (sessionToken) {
    params.append("sessiontoken", sessionToken);
  }

  return `${GOOGLE_MAPS_BASE_URL}/place/details/json?${params.toString()}`;
}

export function getGeocodingUrl(address: string): string {
  const params = new URLSearchParams({
    address,
    key: getApiKey(),
  });

  return `${GOOGLE_MAPS_BASE_URL}/geocode/json?${params.toString()}`;
}

export function getReverseGeocodingUrl(lat: number, lng: number): string {
  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    key: getApiKey(),
  });

  return `${GOOGLE_MAPS_BASE_URL}/geocode/json?${params.toString()}`;
}

export function getDistanceMatrixUrl(
  origins: string,
  destinations: string,
  mode: "driving" | "walking" | "bicycling" | "transit" = "driving"
): string {
  const params = new URLSearchParams({
    origins,
    destinations,
    mode,
    key: getApiKey(),
    units: "imperial",
  });

  return `${GOOGLE_MAPS_BASE_URL}/distancematrix/json?${params.toString()}`;
}

export function getStaticMapUrl(
  lat: number,
  lng: number,
  zoom: number = 15,
  width: number = 600,
  height: number = 300
): string {
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: zoom.toString(),
    size: `${width}x${height}`,
    maptype: "roadmap",
    markers: `color:red|${lat},${lng}`,
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  return `${GOOGLE_MAPS_BASE_URL}/staticmap?${params.toString()}`;
}

export function getEmbedMapUrl(lat: number, lng: number, zoom: number = 15): string {
  const params = new URLSearchParams({
    q: `${lat},${lng}`,
    zoom: zoom.toString(),
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  return `https://www.google.com/maps/embed/v1/place?${params.toString()}`;
}
