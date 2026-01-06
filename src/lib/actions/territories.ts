"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/clerk";
import { ok, type ActionResult } from "@/lib/types/action-result";

export type ServiceTerritory = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  zipCodes: string[];
  centerLat: number | null;
  centerLng: number | null;
  radiusMiles: number | null;
  pricingModifier: number;
  flatFeeOverride: number | null;
  travelFee: number | null;
  isActive: boolean;
  minLeadTimeHours: number | null;
  maxLeadTimeDays: number | null;
  availableDaysOfWeek: number[];
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TerritoryServiceOverride = {
  id: string;
  territoryId: string;
  serviceId: string;
  pricingModifier: number | null;
  flatPrice: number | null;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  service?: {
    id: string;
    name: string;
    priceCents: number;
  };
};

// ============================================================================
// READ OPERATIONS
// ============================================================================

export async function getTerritories(): Promise<ActionResult<ServiceTerritory[]>> {
  try {
    const auth = await getAuthContext();
    if (!auth) return { success: false, error: "Unauthorized" };

    const territories = await prisma.serviceTerritory.findMany({
      where: { organizationId: auth.organizationId },
      orderBy: { name: "asc" },
    });

    const serialized: ServiceTerritory[] = territories.map((t) => ({
      id: t.id,
      organizationId: t.organizationId,
      name: t.name,
      description: t.description,
      zipCodes: t.zipCodes,
      centerLat: t.centerLat ? Number(t.centerLat) : null,
      centerLng: t.centerLng ? Number(t.centerLng) : null,
      radiusMiles: t.radiusMiles,
      pricingModifier: t.pricingModifier,
      flatFeeOverride: t.flatFeeOverride,
      travelFee: t.travelFee,
      isActive: t.isActive,
      minLeadTimeHours: t.minLeadTimeHours,
      maxLeadTimeDays: t.maxLeadTimeDays,
      availableDaysOfWeek: t.availableDaysOfWeek,
      color: t.color,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error fetching territories:", error);
    return { success: false, error: "Failed to fetch territories" };
  }
}

export async function findTerritoryByZipCode(
  zipCode: string
): Promise<ActionResult<ServiceTerritory | null>> {
  try {
    const auth = await getAuthContext();
    if (!auth) return { success: false, error: "Unauthorized" };

    const territory = await prisma.serviceTerritory.findFirst({
      where: {
        organizationId: auth.organizationId,
        isActive: true,
        zipCodes: { has: zipCode },
      },
    });

    if (!territory) return { success: true, data: null };

    const serialized: ServiceTerritory = {
      id: territory.id,
      organizationId: territory.organizationId,
      name: territory.name,
      description: territory.description,
      zipCodes: territory.zipCodes,
      centerLat: territory.centerLat ? Number(territory.centerLat) : null,
      centerLng: territory.centerLng ? Number(territory.centerLng) : null,
      radiusMiles: territory.radiusMiles,
      pricingModifier: territory.pricingModifier,
      flatFeeOverride: territory.flatFeeOverride,
      travelFee: territory.travelFee,
      isActive: territory.isActive,
      minLeadTimeHours: territory.minLeadTimeHours,
      maxLeadTimeDays: territory.maxLeadTimeDays,
      availableDaysOfWeek: territory.availableDaysOfWeek,
      color: territory.color,
      createdAt: territory.createdAt,
      updatedAt: territory.updatedAt,
    };

    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error finding territory:", error);
    return { success: false, error: "Failed to find territory" };
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export async function createTerritory(data: {
  name: string;
  description?: string;
  zipCodes: string[];
  pricingModifier?: number;
  travelFee?: number;
  isActive?: boolean;
}): Promise<ActionResult<ServiceTerritory>> {
  try {
    const auth = await getAuthContext();
    if (!auth) return { success: false, error: "Unauthorized" };

    const territory = await prisma.serviceTerritory.create({
      data: {
        organizationId: auth.organizationId,
        name: data.name,
        description: data.description,
        zipCodes: data.zipCodes,
        pricingModifier: data.pricingModifier ?? 1.0,
        travelFee: data.travelFee,
        isActive: data.isActive ?? true,
      },
    });

    const serialized: ServiceTerritory = {
      id: territory.id,
      organizationId: territory.organizationId,
      name: territory.name,
      description: territory.description,
      zipCodes: territory.zipCodes,
      centerLat: territory.centerLat ? Number(territory.centerLat) : null,
      centerLng: territory.centerLng ? Number(territory.centerLng) : null,
      radiusMiles: territory.radiusMiles,
      pricingModifier: territory.pricingModifier,
      flatFeeOverride: territory.flatFeeOverride,
      travelFee: territory.travelFee,
      isActive: territory.isActive,
      minLeadTimeHours: territory.minLeadTimeHours,
      maxLeadTimeDays: territory.maxLeadTimeDays,
      availableDaysOfWeek: territory.availableDaysOfWeek,
      color: territory.color,
      createdAt: territory.createdAt,
      updatedAt: territory.updatedAt,
    };

    revalidatePath("/settings/territories");
    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error creating territory:", error);
    return { success: false, error: "Failed to create territory" };
  }
}

export async function updateTerritory(
  id: string,
  data: {
    name?: string;
    description?: string;
    zipCodes?: string[];
    pricingModifier?: number;
    travelFee?: number;
    isActive?: boolean;
  }
): Promise<ActionResult<ServiceTerritory>> {
  try {
    const auth = await getAuthContext();
    if (!auth) return { success: false, error: "Unauthorized" };

    const existing = await prisma.serviceTerritory.findFirst({
      where: { id, organizationId: auth.organizationId },
    });

    if (!existing) return { success: false, error: "Territory not found" };

    const territory = await prisma.serviceTerritory.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        zipCodes: data.zipCodes,
        pricingModifier: data.pricingModifier,
        travelFee: data.travelFee,
        isActive: data.isActive,
      },
    });

    const serialized: ServiceTerritory = {
      id: territory.id,
      organizationId: territory.organizationId,
      name: territory.name,
      description: territory.description,
      zipCodes: territory.zipCodes,
      centerLat: territory.centerLat ? Number(territory.centerLat) : null,
      centerLng: territory.centerLng ? Number(territory.centerLng) : null,
      radiusMiles: territory.radiusMiles,
      pricingModifier: territory.pricingModifier,
      flatFeeOverride: territory.flatFeeOverride,
      travelFee: territory.travelFee,
      isActive: territory.isActive,
      minLeadTimeHours: territory.minLeadTimeHours,
      maxLeadTimeDays: territory.maxLeadTimeDays,
      availableDaysOfWeek: territory.availableDaysOfWeek,
      color: territory.color,
      createdAt: territory.createdAt,
      updatedAt: territory.updatedAt,
    };

    revalidatePath("/settings/territories");
    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error updating territory:", error);
    return { success: false, error: "Failed to update territory" };
  }
}

export async function deleteTerritory(id: string): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth) return { success: false, error: "Unauthorized" };

    const existing = await prisma.serviceTerritory.findFirst({
      where: { id, organizationId: auth.organizationId },
    });

    if (!existing) return { success: false, error: "Territory not found" };

    await prisma.serviceTerritory.delete({ where: { id } });

    revalidatePath("/settings/territories");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting territory:", error);
    return { success: false, error: "Failed to delete territory" };
  }
}

export async function toggleTerritoryStatus(id: string): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth) return { success: false, error: "Unauthorized" };

    const territory = await prisma.serviceTerritory.findFirst({
      where: { id, organizationId: auth.organizationId },
    });

    if (!territory) return { success: false, error: "Territory not found" };

    await prisma.serviceTerritory.update({
      where: { id },
      data: { isActive: !territory.isActive },
    });

    revalidatePath("/settings/territories");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error toggling territory status:", error);
    return { success: false, error: "Failed to update territory" };
  }
}

export async function importZipCodes(
  territoryId: string,
  zipCodesString: string
): Promise<ActionResult<{ added: number; total: number }>> {
  try {
    const auth = await getAuthContext();
    if (!auth) return { success: false, error: "Unauthorized" };

    const territory = await prisma.serviceTerritory.findFirst({
      where: { id: territoryId, organizationId: auth.organizationId },
    });

    if (!territory) return { success: false, error: "Territory not found" };

    const zipCodes = zipCodesString
      .split(/[\s,\n]+/)
      .map((z) => z.trim())
      .filter((z) => /^\d{5}(-\d{4})?$/.test(z));

    const existingZips = new Set(territory.zipCodes);
    const newZips = zipCodes.filter((z) => !existingZips.has(z));
    const allZips = [...territory.zipCodes, ...newZips];

    await prisma.serviceTerritory.update({
      where: { id: territoryId },
      data: { zipCodes: allZips },
    });

    revalidatePath("/settings/territories");
    return { success: true, data: { added: newZips.length, total: allZips.length } };
  } catch (error) {
    console.error("Error importing ZIP codes:", error);
    return { success: false, error: "Failed to import ZIP codes" };
  }
}

export async function setServiceOverride(data: {
  territoryId: string;
  serviceId: string;
  pricingModifier?: number;
  flatPrice?: number;
  isAvailable?: boolean;
}): Promise<ActionResult<TerritoryServiceOverride>> {
  try {
    const auth = await getAuthContext();
    if (!auth) return { success: false, error: "Unauthorized" };

    const territory = await prisma.serviceTerritory.findFirst({
      where: { id: data.territoryId, organizationId: auth.organizationId },
    });

    if (!territory) return { success: false, error: "Territory not found" };

    const override = await prisma.territoryServiceOverride.upsert({
      where: {
        territoryId_serviceId: {
          territoryId: data.territoryId,
          serviceId: data.serviceId,
        },
      },
      create: {
        territoryId: data.territoryId,
        serviceId: data.serviceId,
        pricingModifier: data.pricingModifier,
        flatPrice: data.flatPrice,
        isAvailable: data.isAvailable ?? true,
      },
      update: {
        pricingModifier: data.pricingModifier,
        flatPrice: data.flatPrice,
        isAvailable: data.isAvailable ?? true,
      },
      include: {
        service: { select: { id: true, name: true, priceCents: true } },
      },
    });

    const serialized: TerritoryServiceOverride = {
      id: override.id,
      territoryId: override.territoryId,
      serviceId: override.serviceId,
      pricingModifier: override.pricingModifier ? Number(override.pricingModifier) : null,
      flatPrice: override.flatPrice,
      isAvailable: override.isAvailable,
      createdAt: override.createdAt,
      updatedAt: override.updatedAt,
      service: override.service,
    };

    revalidatePath("/settings/territories");
    return { success: true, data: serialized };
  } catch (error) {
    console.error("Error setting service override:", error);
    return { success: false, error: "Failed to set service override" };
  }
}

export async function removeServiceOverride(
  territoryId: string,
  serviceId: string
): Promise<ActionResult<void>> {
  try {
    const auth = await getAuthContext();
    if (!auth) return { success: false, error: "Unauthorized" };

    const territory = await prisma.serviceTerritory.findFirst({
      where: { id: territoryId, organizationId: auth.organizationId },
    });

    if (!territory) return { success: false, error: "Territory not found" };

    await prisma.territoryServiceOverride.delete({
      where: { territoryId_serviceId: { territoryId, serviceId } },
    });

    revalidatePath("/settings/territories");
    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error removing service override:", error);
    return { success: false, error: "Failed to remove service override" };
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

export async function checkServiceAreaPublic(
  orgSlug: string,
  zipCode: string
): Promise<ActionResult<{ inServiceArea: boolean; territory: string | null; travelFee: number | null }>> {
  try {
    const org = await prisma.organization.findFirst({ where: { slug: orgSlug } });
    if (!org) return { success: false, error: "Organization not found" };

    const territory = await prisma.serviceTerritory.findFirst({
      where: {
        organizationId: org.id,
        isActive: true,
        zipCodes: { has: zipCode },
      },
    });

    return {
      success: true,
      data: {
        inServiceArea: !!territory,
        territory: territory?.name || null,
        travelFee: territory?.travelFee || null,
      },
    };
  } catch (error) {
    console.error("Error checking service area:", error);
    return { success: false, error: "Failed to check service area" };
  }
}
