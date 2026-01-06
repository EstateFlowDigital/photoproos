"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { z } from "zod";
import {
  geocodeAddress,
  validateAddress,
} from "@/lib/google-maps/geocoding";
import {
  calculateDistance as calcDistanceAPI,
  calculateTravelFee,
  getTravelInfo,
} from "@/lib/google-maps/distance";
import { GoogleMapsError } from "@/lib/google-maps/types";
import { ok, type ActionResult } from "@/lib/types/action-result";

// Helper to get organization ID (simplified for now - will integrate with auth later)
async function getOrganizationId(): Promise<string> {
  const org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!org) {
    throw new Error("No organization found");
  }

  return org.id;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const locationSchema = z.object({
  formattedAddress: z.string().min(1, "Address is required"),
  streetAddress: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().default("US"),
  latitude: z.number(),
  longitude: z.number(),
  placeId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const createLocationSchema = locationSchema;

const updateLocationSchema = locationSchema.partial().extend({
  id: z.string().cuid(),
});

// ============================================================================
// LOCATION CRUD OPERATIONS
// ============================================================================

/**
 * Create a new location from coordinates and address data
 */
export async function createLocation(
  input: z.infer<typeof createLocationSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createLocationSchema.parse(input);
    const organizationId = await getOrganizationId();

    const location = await prisma.location.create({
      data: {
        organizationId,
        formattedAddress: validated.formattedAddress,
        streetAddress: validated.streetAddress || null,
        city: validated.city || null,
        state: validated.state || null,
        postalCode: validated.postalCode || null,
        country: validated.country,
        latitude: validated.latitude,
        longitude: validated.longitude,
        placeId: validated.placeId || null,
        notes: validated.notes || null,
      },
    });

    revalidatePath("/settings/travel");

    return { success: true, data: { id: location.id } };
  } catch (error) {
    console.error("Error creating location:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create location" };
  }
}

/**
 * Create a location by geocoding an address string
 */
export async function createLocationFromAddress(
  address: string,
  notes?: string
): Promise<ActionResult<{ id: string; location: { latitude: number; longitude: number; formattedAddress: string } }>> {
  try {
    // Geocode the address first
    const geocoded = await geocodeAddress(address);

    // Extract address components
    let streetAddress = "";
    let city = "";
    let state = "";
    let postalCode = "";
    let country = "US";

    for (const component of geocoded.addressComponents) {
      if (component.types.includes("street_number")) {
        streetAddress = component.longName + " ";
      }
      if (component.types.includes("route")) {
        streetAddress += component.longName;
      }
      if (component.types.includes("locality")) {
        city = component.longName;
      }
      if (component.types.includes("administrative_area_level_1")) {
        state = component.shortName;
      }
      if (component.types.includes("postal_code")) {
        postalCode = component.longName;
      }
      if (component.types.includes("country")) {
        country = component.shortName;
      }
    }

    const organizationId = await getOrganizationId();

    const location = await prisma.location.create({
      data: {
        organizationId,
        formattedAddress: geocoded.formattedAddress,
        streetAddress: streetAddress.trim() || null,
        city: city || null,
        state: state || null,
        postalCode: postalCode || null,
        country,
        latitude: geocoded.latitude,
        longitude: geocoded.longitude,
        placeId: geocoded.placeId || null,
        notes: notes || null,
      },
    });

    revalidatePath("/settings/travel");

    return {
      success: true,
      data: {
        id: location.id,
        location: {
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          formattedAddress: geocoded.formattedAddress,
        },
      },
    };
  } catch (error) {
    console.error("Error creating location from address:", error);
    if (error instanceof GoogleMapsError) {
      return { success: false, error: `Geocoding failed: ${error.message}` };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create location" };
  }
}

/**
 * Update an existing location
 */
export async function updateLocation(
  input: z.infer<typeof updateLocationSchema>
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateLocationSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify location exists and belongs to organization
    const existing = await prisma.location.findFirst({
      where: {
        id: validated.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Location not found" };
    }

    const { id, ...updateData } = validated;

    const location = await prisma.location.update({
      where: { id },
      data: {
        ...(updateData.formattedAddress && { formattedAddress: updateData.formattedAddress }),
        ...(updateData.streetAddress !== undefined && { streetAddress: updateData.streetAddress }),
        ...(updateData.city !== undefined && { city: updateData.city }),
        ...(updateData.state !== undefined && { state: updateData.state }),
        ...(updateData.postalCode !== undefined && { postalCode: updateData.postalCode }),
        ...(updateData.country && { country: updateData.country }),
        ...(updateData.latitude !== undefined && { latitude: updateData.latitude }),
        ...(updateData.longitude !== undefined && { longitude: updateData.longitude }),
        ...(updateData.placeId !== undefined && { placeId: updateData.placeId }),
        ...(updateData.notes !== undefined && { notes: updateData.notes }),
      },
    });

    revalidatePath("/settings/travel");

    return { success: true, data: { id: location.id } };
  } catch (error) {
    console.error("Error updating location:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update location" };
  }
}

/**
 * Delete a location
 */
export async function deleteLocation(id: string): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify location exists and belongs to organization
    const existing = await prisma.location.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Location not found" };
    }

    await prisma.location.delete({
      where: { id },
    });

    revalidatePath("/settings/travel");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting location:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete location" };
  }
}

/**
 * Get a single location by ID
 */
export async function getLocation(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const location = await prisma.location.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        propertyDetails: true,
      },
    });

    return location;
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
}

/**
 * Get all locations for the organization
 */
export async function getLocations() {
  try {
    const organizationId = await getOrganizationId();

    const locations = await prisma.location.findMany({
      where: {
        organizationId,
      },
      include: {
        propertyDetails: true,
        _count: {
          select: {
            bookings: true,
            projects: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return locations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    return [];
  }
}

// ============================================================================
// TRAVEL CALCULATIONS
// ============================================================================

/**
 * Calculate travel info between two location IDs
 */
export async function calculateTravelBetweenLocations(
  fromLocationId: string,
  toLocationId: string
): Promise<ActionResult<{
  distanceMiles: number;
  travelTimeMinutes: number;
  travelFeeCents: number;
}>> {
  try {
    const organizationId = await getOrganizationId();

    // Get both locations
    const [fromLocation, toLocation, organization] = await Promise.all([
      prisma.location.findFirst({
        where: { id: fromLocationId, organizationId },
      }),
      prisma.location.findFirst({
        where: { id: toLocationId, organizationId },
      }),
      prisma.organization.findUnique({
        where: { id: organizationId },
      }),
    ]);

    if (!fromLocation) {
      return { success: false, error: "Origin location not found" };
    }
    if (!toLocation) {
      return { success: false, error: "Destination location not found" };
    }

    // Calculate distance using Google Maps API
    const travelInfo = await getTravelInfo(
      fromLocation.latitude,
      fromLocation.longitude,
      toLocation.latitude,
      toLocation.longitude,
      organization?.travelFeePerMile || 0,
      organization?.travelFeeThreshold || 0
    );

    return {
      success: true,
      data: {
        distanceMiles: travelInfo.distanceMiles,
        travelTimeMinutes: travelInfo.travelTimeMinutes,
        travelFeeCents: travelInfo.travelFeeCents,
      },
    };
  } catch (error) {
    console.error("Error calculating travel:", error);
    if (error instanceof GoogleMapsError) {
      return { success: false, error: `Distance calculation failed: ${error.message}` };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to calculate travel" };
  }
}

/**
 * Calculate travel info from organization home base to a location
 */
export async function calculateTravelFromHomeBase(
  toLocationId: string,
  assignedUserId?: string
): Promise<ActionResult<{
  distanceMiles: number;
  travelTimeMinutes: number;
  travelFeeCents: number;
  fromAddress: string;
}>> {
  try {
    const organizationId = await getOrganizationId();

    // Get organization with home base
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        homeBaseLocation: true,
      },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Check if assigned user has a home base override
    let homeBase = organization.homeBaseLocation;
    if (assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedUserId },
        include: {
          homeBaseLocation: true,
        },
      });
      if (user?.homeBaseLocation) {
        homeBase = user.homeBaseLocation;
      }
    }

    if (!homeBase) {
      return { success: false, error: "No home base location configured" };
    }

    // Get destination location
    const toLocation = await prisma.location.findFirst({
      where: { id: toLocationId, organizationId },
    });

    if (!toLocation) {
      return { success: false, error: "Destination location not found" };
    }

    // Calculate distance
    const travelInfo = await getTravelInfo(
      homeBase.latitude,
      homeBase.longitude,
      toLocation.latitude,
      toLocation.longitude,
      organization.travelFeePerMile || 0,
      organization.travelFeeThreshold || 0
    );

    return {
      success: true,
      data: {
        distanceMiles: travelInfo.distanceMiles,
        travelTimeMinutes: travelInfo.travelTimeMinutes,
        travelFeeCents: travelInfo.travelFeeCents,
        fromAddress: homeBase.formattedAddress,
      },
    };
  } catch (error) {
    console.error("Error calculating travel from home base:", error);
    if (error instanceof GoogleMapsError) {
      return { success: false, error: `Distance calculation failed: ${error.message}` };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to calculate travel" };
  }
}

/**
 * Calculate travel info from coordinates (for booking form preview)
 */
export async function calculateTravelPreview(
  destLat: number,
  destLng: number,
  assignedUserId?: string
): Promise<ActionResult<{
  distanceMiles: number;
  travelTimeMinutes: number;
  travelFeeCents: number;
  fromAddress: string;
}>> {
  try {
    const organizationId = await getOrganizationId();

    // Get organization with home base
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        homeBaseLocation: true,
      },
    });

    if (!organization) {
      return { success: false, error: "Organization not found" };
    }

    // Check if assigned user has a home base override
    let homeBase = organization.homeBaseLocation;
    if (assignedUserId) {
      const user = await prisma.user.findUnique({
        where: { id: assignedUserId },
        include: {
          homeBaseLocation: true,
        },
      });
      if (user?.homeBaseLocation) {
        homeBase = user.homeBaseLocation;
      }
    }

    if (!homeBase) {
      return { success: false, error: "No home base location configured" };
    }

    // Calculate distance
    const travelInfo = await getTravelInfo(
      homeBase.latitude,
      homeBase.longitude,
      destLat,
      destLng,
      organization.travelFeePerMile || 0,
      organization.travelFeeThreshold || 0
    );

    return {
      success: true,
      data: {
        distanceMiles: travelInfo.distanceMiles,
        travelTimeMinutes: travelInfo.travelTimeMinutes,
        travelFeeCents: travelInfo.travelFeeCents,
        fromAddress: homeBase.formattedAddress,
      },
    };
  } catch (error) {
    console.error("Error calculating travel preview:", error);
    if (error instanceof GoogleMapsError) {
      return { success: false, error: `Distance calculation failed: ${error.message}` };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to calculate travel" };
  }
}

// ============================================================================
// HOME BASE MANAGEMENT
// ============================================================================

/**
 * Set organization home base location
 */
export async function setOrganizationHomeBase(
  locationId: string
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify location exists and belongs to organization
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        organizationId,
      },
    });

    if (!location) {
      return { success: false, error: "Location not found" };
    }

    await prisma.organization.update({
      where: { id: organizationId },
      data: { homeBaseLocationId: locationId },
    });

    revalidatePath("/settings/travel");
    revalidatePath("/settings");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error setting home base:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to set home base" };
  }
}

/**
 * Create a new location and set it as organization home base
 */
export async function createAndSetHomeBase(
  address: string
): Promise<ActionResult<{ locationId: string }>> {
  try {
    // Create location from address
    const result = await createLocationFromAddress(address, "Organization home base");

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Set as home base
    const setResult = await setOrganizationHomeBase(result.data.id);

    if (!setResult.success) {
      return { success: false, error: setResult.error };
    }

    return { success: true, data: { locationId: result.data.id } };
  } catch (error) {
    console.error("Error creating and setting home base:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create and set home base" };
  }
}

/**
 * Get organization home base location
 */
export async function getOrganizationHomeBase() {
  try {
    const organizationId = await getOrganizationId();

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        homeBaseLocation: true,
      },
    });

    return organization?.homeBaseLocation || null;
  } catch (error) {
    console.error("Error fetching home base:", error);
    return null;
  }
}

/**
 * Validate an address without creating a location
 */
export async function validateAddressAction(
  address: string
): Promise<ActionResult<{
  isValid: boolean;
  formattedAddress?: string;
  latitude?: number;
  longitude?: number;
}>> {
  try {
    const result = await validateAddress(address);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error validating address:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to validate address" };
  }
}

// Type exports
export type CreateLocationInput = z.infer<typeof createLocationSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
