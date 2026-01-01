// Google Maps API Types for PhotoProOS

export interface PlaceAutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  placeId: string;
  formattedAddress: string;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string;
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
  addressComponents: AddressComponent[];
}

export interface AddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}

export interface DistanceMatrixResult {
  originAddress: string;
  destinationAddress: string;
  distanceMeters: number;
  distanceMiles: number;
  durationSeconds: number;
  durationMinutes: number;
  durationText: string;
  distanceText: string;
}

export interface TravelInfo {
  distanceMiles: number;
  travelTimeMinutes: number;
  travelFeeCents: number;
  freeThresholdMiles: number;
  feePerMile: number;
}

export interface LocationInput {
  formattedAddress: string;
  streetAddress?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string;
  latitude: number;
  longitude: number;
  placeId?: string | null;
  notes?: string | null;
}

// Google Maps API response types (from their API)
export interface GooglePlacesAutocompleteResponse {
  predictions: GooglePlacePrediction[];
  status: string;
}

export interface GooglePlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface GooglePlaceDetailsResponse {
  result: {
    place_id: string;
    formatted_address: string;
    address_components: GoogleAddressComponent[];
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  };
  status: string;
}

export interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GoogleGeocodingResponse {
  results: {
    place_id: string;
    formatted_address: string;
    address_components: GoogleAddressComponent[];
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }[];
  status: string;
}

export interface GoogleDistanceMatrixResponse {
  origin_addresses: string[];
  destination_addresses: string[];
  rows: {
    elements: {
      distance: {
        value: number;
        text: string;
      };
      duration: {
        value: number;
        text: string;
      };
      status: string;
    }[];
  }[];
  status: string;
}

// Error types
export class GoogleMapsError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: string
  ) {
    super(message);
    this.name = "GoogleMapsError";
  }
}
