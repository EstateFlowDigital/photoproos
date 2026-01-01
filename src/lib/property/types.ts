/**
 * Property Details Types
 *
 * Types for property information used in real estate photography.
 */

export type PropertyType =
  | "single_family"
  | "condo"
  | "townhouse"
  | "multi_family"
  | "apartment"
  | "land"
  | "commercial"
  | "other";

export interface PropertyDetails {
  id?: string;
  locationId?: string;
  propertyType?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  lotSize?: number; // in square feet
  yearBuilt?: number;
  listingPrice?: number; // in cents
  mlsNumber?: string;
  stories?: number;
  garage?: number; // number of garage spaces
  pool?: boolean;
  waterfront?: boolean;
  // Metadata
  dataSource?: "manual" | "attom" | "mls";
  fetchedAt?: Date;
  lastUpdated?: Date;
}

export interface PropertySuggestion {
  recommendedPackage: string;
  reason: string;
  estimatedPhotos: number;
  suggestedDuration: number; // in minutes
  additionalServices: string[];
}

export interface PropertyLookupResult {
  success: boolean;
  property?: PropertyDetails;
  error?: string;
  source?: "api" | "cache" | "manual";
}

// ATTOM API response types (if we use it in the future)
export interface AttomPropertyResponse {
  property: {
    identifier: {
      obPropId: number;
    };
    lot: {
      lotSize1: number;
    };
    building: {
      rooms: {
        beds: number;
        bathstotal: number;
      };
      size: {
        bldgsize: number;
        grosssize: number;
      };
      yearbuilt: number;
      stories: number;
      parking: {
        garagetype: string;
        prkgspaces: number;
      };
    };
    area: {
      blockNum: string;
      munname: string;
      situs: {
        oneline: string;
      };
    };
  }[];
}

// Property type labels for display
export const propertyTypeLabels: Record<PropertyType, string> = {
  single_family: "Single Family Home",
  condo: "Condominium",
  townhouse: "Townhouse",
  multi_family: "Multi-Family",
  apartment: "Apartment",
  land: "Land/Lot",
  commercial: "Commercial",
  other: "Other",
};

// Property type icons (for UI)
export const propertyTypeIcons: Record<PropertyType, string> = {
  single_family: "🏠",
  condo: "🏢",
  townhouse: "🏘️",
  multi_family: "🏗️",
  apartment: "🏬",
  land: "🏞️",
  commercial: "🏪",
  other: "🏛️",
};
