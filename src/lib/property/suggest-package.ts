/**
 * Property-based Package Suggestions
 *
 * Recommends photography packages based on property details.
 */

import type { PropertyDetails, PropertySuggestion, PropertyType } from "./types";

// Base recommendations by square footage
interface SquareFootageRecommendation {
  maxSqft: number;
  photos: number;
  duration: number;
  packageName: string;
}

const sqftRecommendations: SquareFootageRecommendation[] = [
  { maxSqft: 1000, photos: 15, duration: 60, packageName: "Studio/Small Unit" },
  { maxSqft: 1500, photos: 20, duration: 75, packageName: "Starter" },
  { maxSqft: 2500, photos: 25, duration: 90, packageName: "Standard" },
  { maxSqft: 3500, photos: 35, duration: 120, packageName: "Premium" },
  { maxSqft: 5000, photos: 45, duration: 150, packageName: "Luxury" },
  { maxSqft: Infinity, photos: 60, duration: 180, packageName: "Estate" },
];

// Additional service suggestions based on property features
interface FeatureBasedService {
  condition: (property: PropertyDetails) => boolean;
  service: string;
  reason: string;
}

const featureServices: FeatureBasedService[] = [
  {
    condition: (p) => (p.squareFeet ?? 0) > 3000,
    service: "Drone Photography",
    reason: "Large properties benefit from aerial perspective",
  },
  {
    condition: (p) => p.pool === true,
    service: "Pool/Outdoor Photography",
    reason: "Showcase the pool area",
  },
  {
    condition: (p) => p.waterfront === true,
    service: "Twilight Photography",
    reason: "Waterfront properties look stunning at golden hour",
  },
  {
    condition: (p) => (p.listingPrice ?? 0) > 75000000, // > $750k
    service: "Video Tour",
    reason: "Luxury listings benefit from video marketing",
  },
  {
    condition: (p) => (p.listingPrice ?? 0) > 100000000, // > $1M
    service: "Virtual Staging",
    reason: "High-end listings often need staging to show potential",
  },
  {
    condition: (p) => p.propertyType === "commercial",
    service: "Commercial Photography",
    reason: "Commercial properties need specialized angles",
  },
  {
    condition: (p) => (p.bedrooms ?? 0) >= 5,
    service: "Floor Plans",
    reason: "Large homes benefit from floor plan visualization",
  },
  {
    condition: (p) => p.yearBuilt !== undefined && p.yearBuilt < 1950,
    service: "Architectural Details",
    reason: "Historic properties have unique architectural features worth highlighting",
  },
];

/**
 * Generate package suggestions based on property details
 */
export function suggestPackage(property: PropertyDetails): PropertySuggestion {
  const sqft = property.squareFeet ?? 0;

  // Find appropriate base recommendation
  const baseRec = sqftRecommendations.find((r) => sqft <= r.maxSqft) || sqftRecommendations[sqftRecommendations.length - 1];

  // Adjust for property type
  let adjustedPhotos = baseRec.photos;
  let adjustedDuration = baseRec.duration;

  if (property.propertyType === "commercial") {
    adjustedPhotos = Math.round(adjustedPhotos * 1.3);
    adjustedDuration = Math.round(adjustedDuration * 1.3);
  } else if (property.propertyType === "condo" || property.propertyType === "apartment") {
    adjustedPhotos = Math.round(adjustedPhotos * 0.9);
    adjustedDuration = Math.round(adjustedDuration * 0.9);
  } else if (property.propertyType === "land") {
    adjustedPhotos = Math.round(adjustedPhotos * 0.5);
    adjustedDuration = Math.round(adjustedDuration * 0.6);
  }

  // Add extra photos for additional rooms/features
  if (property.bedrooms && property.bedrooms > 4) {
    adjustedPhotos += (property.bedrooms - 4) * 3;
    adjustedDuration += (property.bedrooms - 4) * 10;
  }

  if (property.bathrooms && property.bathrooms > 3) {
    adjustedPhotos += Math.floor((property.bathrooms - 3) * 2);
    adjustedDuration += Math.floor((property.bathrooms - 3) * 5);
  }

  if (property.pool) {
    adjustedPhotos += 5;
    adjustedDuration += 15;
  }

  if (property.waterfront) {
    adjustedPhotos += 5;
    adjustedDuration += 15;
  }

  // Find applicable additional services
  const additionalServices = featureServices
    .filter((fs) => fs.condition(property))
    .map((fs) => fs.service);

  // Generate reason string
  const reasonParts: string[] = [];

  if (sqft > 0) {
    reasonParts.push(`${sqft.toLocaleString()} sq ft`);
  }
  if (property.bedrooms) {
    reasonParts.push(`${property.bedrooms} bed`);
  }
  if (property.bathrooms) {
    reasonParts.push(`${property.bathrooms} bath`);
  }
  if (property.propertyType) {
    const typeLabel = getPropertyTypeLabel(property.propertyType);
    reasonParts.push(typeLabel.toLowerCase());
  }

  const reason =
    reasonParts.length > 0
      ? `Based on ${reasonParts.join(", ")}`
      : "Based on standard property sizing";

  return {
    recommendedPackage: baseRec.packageName,
    reason,
    estimatedPhotos: adjustedPhotos,
    suggestedDuration: adjustedDuration,
    additionalServices,
  };
}

/**
 * Calculate estimated shoot time based on property
 */
export function estimateShootDuration(property: PropertyDetails): {
  minMinutes: number;
  maxMinutes: number;
  description: string;
} {
  const suggestion = suggestPackage(property);
  const base = suggestion.suggestedDuration;

  // Add buffer for setup/teardown
  const minMinutes = base;
  const maxMinutes = Math.round(base * 1.25);

  let description = "";
  if (base <= 60) {
    description = "Quick shoot";
  } else if (base <= 90) {
    description = "Standard shoot";
  } else if (base <= 150) {
    description = "Extended shoot";
  } else {
    description = "Full-day shoot";
  }

  return { minMinutes, maxMinutes, description };
}

/**
 * Get human-readable property type label
 */
export function getPropertyTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    single_family: "Single Family Home",
    condo: "Condominium",
    townhouse: "Townhouse",
    multi_family: "Multi-Family",
    apartment: "Apartment",
    land: "Land/Lot",
    commercial: "Commercial",
    other: "Other",
  };
  return labels[type] || "Unknown";
}

/**
 * Format square footage for display
 */
export function formatSquareFeet(sqft: number): string {
  if (sqft >= 10000) {
    return `${(sqft / 1000).toFixed(1)}k sq ft`;
  }
  return `${sqft.toLocaleString()} sq ft`;
}

/**
 * Format lot size for display
 */
export function formatLotSize(sqft: number): string {
  if (sqft >= 43560) {
    const acres = sqft / 43560;
    return `${acres.toFixed(2)} acres`;
  }
  return `${sqft.toLocaleString()} sq ft`;
}

/**
 * Calculate price per square foot
 */
export function calculatePricePerSqft(priceCents: number, sqft: number): number {
  if (sqft <= 0) return 0;
  return Math.round(priceCents / sqft / 100);
}
