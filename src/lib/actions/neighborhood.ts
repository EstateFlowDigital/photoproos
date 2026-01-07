"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { POICategory } from "@prisma/client";

// ============================================================================
// NEIGHBORHOOD DATA ACTIONS
// ============================================================================

/**
 * Fetches or creates neighborhood data for a property website
 */
export async function getNeighborhoodData(propertyWebsiteId: string) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    // Get or create neighborhood data
    let neighborhoodData = await prisma.neighborhoodData.findUnique({
      where: { propertyWebsiteId },
      include: {
        pointsOfInterest: {
          orderBy: [{ category: "asc" }, { distanceMiles: "asc" }],
        },
      },
    });

    if (!neighborhoodData) {
      // Create empty neighborhood data record
      neighborhoodData = await prisma.neighborhoodData.create({
        data: {
          propertyWebsiteId,
        },
        include: {
          pointsOfInterest: true,
        },
      });
    }

    return { data: neighborhoodData };
  } catch (error) {
    console.error("Error fetching neighborhood data:", error);
    return { error: "Failed to fetch neighborhood data" };
  }
}

/**
 * Updates walk score and other scores for a property
 */
export async function updateNeighborhoodScores(
  propertyWebsiteId: string,
  scores: {
    walkScore?: number;
    bikeScore?: number;
    transitScore?: number;
    soundScore?: number;
  }
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const neighborhoodData = await prisma.neighborhoodData.upsert({
      where: { propertyWebsiteId },
      update: {
        ...scores,
        lastFetched: new Date(),
      },
      create: {
        propertyWebsiteId,
        ...scores,
      },
    });

    revalidatePath(`/properties`);
    return { data: neighborhoodData };
  } catch (error) {
    console.error("Error updating neighborhood scores:", error);
    return { error: "Failed to update scores" };
  }
}

/**
 * Updates crime data for a property
 */
export async function updateCrimeData(
  propertyWebsiteId: string,
  crimeData: {
    crimeIndex?: number;
    crimeDataSource?: string;
  }
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const neighborhoodData = await prisma.neighborhoodData.upsert({
      where: { propertyWebsiteId },
      update: {
        crimeIndex: crimeData.crimeIndex,
        crimeDataSource: crimeData.crimeDataSource,
        crimeLastUpdated: new Date(),
      },
      create: {
        propertyWebsiteId,
        crimeIndex: crimeData.crimeIndex,
        crimeDataSource: crimeData.crimeDataSource,
        crimeLastUpdated: new Date(),
      },
    });

    revalidatePath(`/properties`);
    return { data: neighborhoodData };
  } catch (error) {
    console.error("Error updating crime data:", error);
    return { error: "Failed to update crime data" };
  }
}

/**
 * Updates school ratings for a property
 */
export async function updateSchoolRatings(
  propertyWebsiteId: string,
  ratings: {
    nearestElementaryRating?: number;
    nearestMiddleRating?: number;
    nearestHighRating?: number;
  }
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const neighborhoodData = await prisma.neighborhoodData.upsert({
      where: { propertyWebsiteId },
      update: ratings,
      create: {
        propertyWebsiteId,
        ...ratings,
      },
    });

    revalidatePath(`/properties`);
    return { data: neighborhoodData };
  } catch (error) {
    console.error("Error updating school ratings:", error);
    return { error: "Failed to update school ratings" };
  }
}

// ============================================================================
// POINTS OF INTEREST ACTIONS
// ============================================================================

interface CreatePOIInput {
  name: string;
  category: POICategory;
  subcategory?: string;
  latitude: number;
  longitude: number;
  address?: string;
  distanceMiles: number;
  drivingMins?: number;
  walkingMins?: number;
  transitMins?: number;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  website?: string;
  phone?: string;
  photoUrl?: string;
  schoolGrades?: string;
  schoolType?: string;
  schoolRating?: number;
  studentCount?: number;
  hoursJson?: Record<string, string>;
}

/**
 * Adds a point of interest to neighborhood data
 */
export async function addPointOfInterest(
  propertyWebsiteId: string,
  poi: CreatePOIInput
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    // Ensure neighborhood data exists
    let neighborhoodData = await prisma.neighborhoodData.findUnique({
      where: { propertyWebsiteId },
    });

    if (!neighborhoodData) {
      neighborhoodData = await prisma.neighborhoodData.create({
        data: { propertyWebsiteId },
      });
    }

    const pointOfInterest = await prisma.pointOfInterest.create({
      data: {
        neighborhoodDataId: neighborhoodData.id,
        ...poi,
        hoursJson: poi.hoursJson ? poi.hoursJson : undefined,
      },
    });

    revalidatePath(`/properties`);
    return { data: pointOfInterest };
  } catch (error) {
    console.error("Error adding POI:", error);
    return { error: "Failed to add point of interest" };
  }
}

/**
 * Bulk add points of interest (for API imports)
 */
export async function bulkAddPointsOfInterest(
  propertyWebsiteId: string,
  pois: CreatePOIInput[]
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    // Ensure neighborhood data exists
    let neighborhoodData = await prisma.neighborhoodData.findUnique({
      where: { propertyWebsiteId },
    });

    if (!neighborhoodData) {
      neighborhoodData = await prisma.neighborhoodData.create({
        data: { propertyWebsiteId },
      });
    }

    const created = await prisma.pointOfInterest.createMany({
      data: pois.map((poi) => ({
        neighborhoodDataId: neighborhoodData!.id,
        ...poi,
        hoursJson: poi.hoursJson ? poi.hoursJson : undefined,
      })),
    });

    revalidatePath(`/properties`);
    return { data: { count: created.count } };
  } catch (error) {
    console.error("Error bulk adding POIs:", error);
    return { error: "Failed to add points of interest" };
  }
}

/**
 * Updates a point of interest
 */
export async function updatePointOfInterest(
  poiId: string,
  updates: Partial<CreatePOIInput>
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const pointOfInterest = await prisma.pointOfInterest.update({
      where: { id: poiId },
      data: {
        ...updates,
        hoursJson: updates.hoursJson ? updates.hoursJson : undefined,
      },
    });

    revalidatePath(`/properties`);
    return { data: pointOfInterest };
  } catch (error) {
    console.error("Error updating POI:", error);
    return { error: "Failed to update point of interest" };
  }
}

/**
 * Deletes a point of interest
 */
export async function deletePointOfInterest(poiId: string) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    await prisma.pointOfInterest.delete({
      where: { id: poiId },
    });

    revalidatePath(`/properties`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting POI:", error);
    return { error: "Failed to delete point of interest" };
  }
}

/**
 * Clears all POIs for a property (useful before re-importing)
 */
export async function clearAllPointsOfInterest(propertyWebsiteId: string) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  try {
    const neighborhoodData = await prisma.neighborhoodData.findUnique({
      where: { propertyWebsiteId },
    });

    if (neighborhoodData) {
      await prisma.pointOfInterest.deleteMany({
        where: { neighborhoodDataId: neighborhoodData.id },
      });
    }

    revalidatePath(`/properties`);
    return { success: true };
  } catch (error) {
    console.error("Error clearing POIs:", error);
    return { error: "Failed to clear points of interest" };
  }
}

// ============================================================================
// EXTERNAL API INTEGRATION HELPERS
// ============================================================================

/**
 * Fetches Walk Score data from Walk Score API
 * Note: Requires WALKSCORE_API_KEY environment variable
 */
export async function fetchWalkScoreData(
  propertyWebsiteId: string,
  address: string,
  lat: number,
  lon: number
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  const apiKey = process.env.WALKSCORE_API_KEY;
  if (!apiKey) {
    return { error: "Walk Score API key not configured" };
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.walkscore.com/score?format=json&address=${encodedAddress}&lat=${lat}&lon=${lon}&wsapikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 1) {
      return { error: "Failed to fetch Walk Score data" };
    }

    // Update the database with the scores
    const result = await updateNeighborhoodScores(propertyWebsiteId, {
      walkScore: data.walkscore,
      bikeScore: data.bike?.score,
      transitScore: data.transit?.score,
    });

    return result;
  } catch (error) {
    console.error("Error fetching Walk Score:", error);
    return { error: "Failed to fetch Walk Score data" };
  }
}

/**
 * Fetches nearby places from Google Places API
 * Note: Requires GOOGLE_PLACES_API_KEY environment variable
 */
export async function fetchNearbyPlaces(
  propertyWebsiteId: string,
  lat: number,
  lon: number,
  types: string[] = ["school", "restaurant", "grocery_or_supermarket", "park"],
  radius: number = 3000 // meters
) {
  const { orgId } = await auth();
  if (!orgId) return { error: "Unauthorized" };

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return { error: "Google Places API key not configured" };
  }

  try {
    const allPois: CreatePOIInput[] = [];

    for (const type of types) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${type}&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.results) {
        for (const place of data.results.slice(0, 10)) {
          // Limit to 10 per category
          const placeLat = place.geometry.location.lat;
          const placeLon = place.geometry.location.lng;

          // Calculate distance in miles
          const distanceMiles = calculateDistance(lat, lon, placeLat, placeLon);

          // Map Google type to our POI category
          const category = mapGoogleTypeToPOICategory(type);

          allPois.push({
            name: place.name,
            category,
            subcategory: type,
            latitude: placeLat,
            longitude: placeLon,
            address: place.vicinity,
            distanceMiles,
            rating: place.rating,
            reviewCount: place.user_ratings_total,
            priceLevel: place.price_level,
            photoUrl: place.photos?.[0]?.photo_reference
              ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
              : undefined,
          });
        }
      }
    }

    // Clear existing POIs and add new ones
    await clearAllPointsOfInterest(propertyWebsiteId);
    const result = await bulkAddPointsOfInterest(propertyWebsiteId, allPois);

    return result;
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    return { error: "Failed to fetch nearby places" };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two coordinates in miles
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Maps Google Places types to our POI categories
 */
function mapGoogleTypeToPOICategory(googleType: string): POICategory {
  const typeMap: Record<string, POICategory> = {
    school: "school_elementary",
    university: "university",
    primary_school: "school_elementary",
    secondary_school: "school_high",
    restaurant: "restaurant",
    cafe: "cafe",
    bar: "bar",
    food: "restaurant",
    grocery_or_supermarket: "shopping_grocery",
    supermarket: "shopping_grocery",
    convenience_store: "shopping_retail",
    park: "park",
    gym: "gym_fitness",
    hospital: "hospital",
    pharmacy: "pharmacy",
    bank: "bank",
    atm: "bank",
    shopping_mall: "shopping_mall",
    department_store: "shopping_retail",
    clothing_store: "shopping_retail",
    transit_station: "transit_train",
    subway_station: "transit_subway",
    bus_station: "transit_bus",
    train_station: "transit_train",
    airport: "airport",
    gas_station: "gas_station",
    place_of_worship: "church",
    church: "church",
    mosque: "mosque",
    synagogue: "synagogue",
    movie_theater: "cinema",
    museum: "museum",
    night_club: "entertainment",
    library: "library",
    post_office: "post_office",
    police: "police",
    fire_station: "fire_station",
  };

  return typeMap[googleType] || "other";
}

/**
 * Gets POI category display info (icon, color, label)
 */
export function getPOICategoryInfo(category: POICategory) {
  const categoryInfo: Record<
    POICategory,
    { icon: string; color: string; label: string }
  > = {
    school_elementary: { icon: "🏫", color: "#4CAF50", label: "Elementary Schools" },
    school_middle: { icon: "🏫", color: "#4CAF50", label: "Middle Schools" },
    school_high: { icon: "🏫", color: "#4CAF50", label: "High Schools" },
    school_private: { icon: "🏫", color: "#4CAF50", label: "Private Schools" },
    university: { icon: "🎓", color: "#2196F3", label: "Universities" },
    shopping_mall: { icon: "🏬", color: "#FF9800", label: "Shopping Malls" },
    shopping_grocery: { icon: "🛒", color: "#8BC34A", label: "Grocery Stores" },
    shopping_retail: { icon: "🛍️", color: "#FF9800", label: "Retail Stores" },
    restaurant: { icon: "🍽️", color: "#FF5722", label: "Restaurants" },
    cafe: { icon: "☕", color: "#795548", label: "Cafes" },
    bar: { icon: "🍺", color: "#FF5722", label: "Bars" },
    park: { icon: "🌳", color: "#4CAF50", label: "Parks" },
    playground: { icon: "🎡", color: "#4CAF50", label: "Playgrounds" },
    gym_fitness: { icon: "💪", color: "#9C27B0", label: "Gyms & Fitness" },
    hospital: { icon: "🏥", color: "#F44336", label: "Hospitals" },
    pharmacy: { icon: "💊", color: "#E91E63", label: "Pharmacies" },
    police: { icon: "👮", color: "#1976D2", label: "Police Stations" },
    fire_station: { icon: "🚒", color: "#D32F2F", label: "Fire Stations" },
    transit_bus: { icon: "🚌", color: "#3F51B5", label: "Bus Stops" },
    transit_train: { icon: "🚂", color: "#3F51B5", label: "Train Stations" },
    transit_subway: { icon: "🚇", color: "#3F51B5", label: "Subway Stations" },
    airport: { icon: "✈️", color: "#607D8B", label: "Airports" },
    beach: { icon: "🏖️", color: "#00BCD4", label: "Beaches" },
    golf_course: { icon: "⛳", color: "#4CAF50", label: "Golf Courses" },
    church: { icon: "⛪", color: "#9E9E9E", label: "Churches" },
    mosque: { icon: "🕌", color: "#9E9E9E", label: "Mosques" },
    synagogue: { icon: "🕍", color: "#9E9E9E", label: "Synagogues" },
    temple: { icon: "🛕", color: "#9E9E9E", label: "Temples" },
    library: { icon: "📚", color: "#673AB7", label: "Libraries" },
    museum: { icon: "🏛️", color: "#673AB7", label: "Museums" },
    theater: { icon: "🎭", color: "#E91E63", label: "Theaters" },
    cinema: { icon: "🎬", color: "#E91E63", label: "Cinemas" },
    entertainment: { icon: "🎉", color: "#E91E63", label: "Entertainment" },
    bank: { icon: "🏦", color: "#607D8B", label: "Banks" },
    post_office: { icon: "📮", color: "#2196F3", label: "Post Offices" },
    gas_station: { icon: "⛽", color: "#795548", label: "Gas Stations" },
    ev_charging: { icon: "🔌", color: "#4CAF50", label: "EV Charging" },
    other: { icon: "📍", color: "#9E9E9E", label: "Other" },
  };

  return categoryInfo[category] || categoryInfo.other;
}

/**
 * Get crime safety rating label
 */
export function getCrimeSafetyLabel(crimeIndex: number | null | undefined): {
  label: string;
  color: string;
  description: string;
} {
  if (crimeIndex === null || crimeIndex === undefined) {
    return {
      label: "Unknown",
      color: "#9E9E9E",
      description: "Crime data not available",
    };
  }

  if (crimeIndex < 20) {
    return {
      label: "Very Safe",
      color: "#4CAF50",
      description: "Significantly below national average",
    };
  } else if (crimeIndex < 40) {
    return {
      label: "Safe",
      color: "#8BC34A",
      description: "Below national average",
    };
  } else if (crimeIndex < 60) {
    return {
      label: "Average",
      color: "#FFC107",
      description: "Near national average",
    };
  } else if (crimeIndex < 80) {
    return {
      label: "Below Average",
      color: "#FF9800",
      description: "Above national average",
    };
  } else {
    return {
      label: "High Crime",
      color: "#F44336",
      description: "Significantly above national average",
    };
  }
}
