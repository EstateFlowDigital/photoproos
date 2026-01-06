"use server";

import { prisma } from "@/lib/db";
import { requireOrganizationId } from "./auth-helper";
import { revalidatePath } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";

// ============================================================================
// Types
// ============================================================================

export interface MlsPreset {
  id: string;
  organizationId: string | null;
  name: string;
  provider: string;
  description: string | null;
  width: number;
  height: number;
  quality: number;
  format: string;
  maxFileSizeKb: number | null;
  maintainAspect: boolean;
  letterbox: boolean;
  letterboxColor: string | null;
  isSystemPreset: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MlsPresetOverride {
  id: string;
  brokerageId: string | null;
  clientId: string | null;
  presetId: string;
  enabled: boolean | null;
  isDefault: boolean | null;
  customWidth: number | null;
  customHeight: number | null;
  customQuality: number | null;
  customMaxSizeKb: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResolvedPreset extends MlsPreset {
  // Effective values after override resolution
  effectiveWidth: number;
  effectiveHeight: number;
  effectiveQuality: number;
  effectiveMaxSizeKb: number | null;
  effectiveEnabled: boolean;
  effectiveIsDefault: boolean;
  // Override source tracking
  overrideSource: "system" | "organization" | "brokerage" | "client";
}

export interface CreateMlsPresetInput {
  name: string;
  provider: string;
  description?: string;
  width: number;
  height: number;
  quality?: number;
  format?: string;
  maxFileSizeKb?: number;
  maintainAspect?: boolean;
  letterbox?: boolean;
  letterboxColor?: string;
}

export interface UpdateMlsPresetInput {
  id: string;
  name?: string;
  provider?: string;
  description?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  maxFileSizeKb?: number;
  maintainAspect?: boolean;
  letterbox?: boolean;
  letterboxColor?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface SetPresetOverrideInput {
  presetId: string;
  brokerageId?: string;
  clientId?: string;
  enabled?: boolean;
  isDefault?: boolean;
  customWidth?: number;
  customHeight?: number;
  customQuality?: number;
  customMaxSizeKb?: number;
}

// ============================================================================
// System Default Presets
// These are the app-level defaults that all organizations inherit
// ============================================================================

export const SYSTEM_MLS_PRESETS: CreateMlsPresetInput[] = [
  // HAR (Houston Association of Realtors)
  {
    name: "HAR Standard",
    provider: "HAR",
    description: "Houston Association of Realtors standard dimensions",
    width: 3000,
    height: 2000,
    quality: 90,
    format: "jpeg",
    maxFileSizeKb: 10240, // 10MB
  },
  {
    name: "HAR Web",
    provider: "HAR",
    description: "HAR optimized web images",
    width: 1600,
    height: 1200,
    quality: 85,
    format: "jpeg",
    maxFileSizeKb: 2048, // 2MB
  },
  // Zillow
  {
    name: "Zillow Large",
    provider: "Zillow",
    description: "Zillow high-resolution listing photos",
    width: 2048,
    height: 1536,
    quality: 90,
    format: "jpeg",
    maxFileSizeKb: 10240,
  },
  {
    name: "Zillow Standard",
    provider: "Zillow",
    description: "Zillow standard web dimensions",
    width: 1536,
    height: 1024,
    quality: 85,
    format: "jpeg",
    maxFileSizeKb: 5120,
  },
  // Realtor.com
  {
    name: "Realtor.com High-Res",
    provider: "Realtor.com",
    description: "Realtor.com maximum quality",
    width: 2400,
    height: 1600,
    quality: 90,
    format: "jpeg",
    maxFileSizeKb: 10240,
  },
  {
    name: "Realtor.com Standard",
    provider: "Realtor.com",
    description: "Realtor.com web optimized",
    width: 1200,
    height: 800,
    quality: 85,
    format: "jpeg",
    maxFileSizeKb: 3072,
  },
  // NWMLS (Northwest MLS)
  {
    name: "NWMLS Standard",
    provider: "NWMLS",
    description: "Northwest MLS standard format",
    width: 2000,
    height: 1500,
    quality: 90,
    format: "jpeg",
    maxFileSizeKb: 8192,
  },
  // MLS PIN (New England)
  {
    name: "MLS PIN Standard",
    provider: "MLS PIN",
    description: "New England MLS standard",
    width: 2400,
    height: 1600,
    quality: 85,
    format: "jpeg",
    maxFileSizeKb: 10240,
  },
  // Bright MLS (Mid-Atlantic)
  {
    name: "Bright MLS Standard",
    provider: "Bright MLS",
    description: "Mid-Atlantic region MLS format",
    width: 3000,
    height: 2000,
    quality: 90,
    format: "jpeg",
    maxFileSizeKb: 10240,
  },
  // California Regional MLS
  {
    name: "CRMLS Standard",
    provider: "CRMLS",
    description: "California Regional MLS format",
    width: 2048,
    height: 1536,
    quality: 90,
    format: "jpeg",
    maxFileSizeKb: 15360, // 15MB
  },
  // Generic Social Media
  {
    name: "Social Media Square",
    provider: "Social",
    description: "Square format for Instagram/Facebook",
    width: 1080,
    height: 1080,
    quality: 90,
    format: "jpeg",
    letterbox: true,
    letterboxColor: "#ffffff",
  },
  {
    name: "Social Media Landscape",
    provider: "Social",
    description: "Landscape for Facebook/Twitter",
    width: 1200,
    height: 630,
    quality: 85,
    format: "jpeg",
  },
  // Web Standard Sizes
  {
    name: "Web Full HD",
    provider: "Web",
    description: "Standard 1080p web resolution",
    width: 1920,
    height: 1080,
    quality: 85,
    format: "jpeg",
    maxFileSizeKb: 2048,
  },
  {
    name: "Web 4K",
    provider: "Web",
    description: "Ultra HD web resolution",
    width: 3840,
    height: 2160,
    quality: 90,
    format: "jpeg",
    maxFileSizeKb: 10240,
  },
  // Print Quality
  {
    name: "Print 8x10",
    provider: "Print",
    description: "8x10 print at 300 DPI",
    width: 3000,
    height: 2400,
    quality: 95,
    format: "jpeg",
    maintainAspect: false,
    letterbox: true,
    letterboxColor: "#ffffff",
  },
  {
    name: "Print 11x14",
    provider: "Print",
    description: "11x14 print at 300 DPI",
    width: 4200,
    height: 3300,
    quality: 95,
    format: "jpeg",
    maintainAspect: false,
    letterbox: true,
    letterboxColor: "#ffffff",
  },
  // Flyer/Marketing Materials
  {
    name: "Flyer Photo",
    provider: "Marketing",
    description: "Optimized for property flyers",
    width: 1800,
    height: 1200,
    quality: 90,
    format: "jpeg",
    maxFileSizeKb: 3072,
  },
];

// ============================================================================
// Seed System Presets
// Run this once during app initialization or as a migration
// ============================================================================

export async function seedSystemMlsPresets(): Promise<ActionResult<{ created: number; skipped: number }>> {
  try {
    let created = 0;
    let skipped = 0;

    for (const preset of SYSTEM_MLS_PRESETS) {
      // Check if system preset already exists
      const existing = await prisma.mlsPreset.findFirst({
        where: {
          organizationId: null,
          provider: preset.provider,
          name: preset.name,
          isSystemPreset: true,
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await prisma.mlsPreset.create({
        data: {
          organizationId: null, // System-wide
          name: preset.name,
          provider: preset.provider,
          description: preset.description || null,
          width: preset.width,
          height: preset.height,
          quality: preset.quality ?? 90,
          format: preset.format ?? "jpeg",
          maxFileSizeKb: preset.maxFileSizeKb ?? null,
          maintainAspect: preset.maintainAspect ?? true,
          letterbox: preset.letterbox ?? false,
          letterboxColor: preset.letterboxColor ?? "#ffffff",
          isSystemPreset: true,
          isActive: true,
          sortOrder: created,
        },
      });

      created++;
    }

    return success({ created, skipped });
  } catch (error) {
    console.error("[MLS Presets] Error seeding system presets:", error);
    return fail("Failed to seed system presets");
  }
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Get all MLS presets (system + organization level)
 */
export async function getMlsPresets(): Promise<ActionResult<MlsPreset[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const presets = await prisma.mlsPreset.findMany({
      where: {
        OR: [
          { organizationId: null, isSystemPreset: true }, // System presets
          { organizationId }, // Org-specific presets
        ],
        isActive: true,
      },
      orderBy: [
        { provider: "asc" },
        { sortOrder: "asc" },
        { name: "asc" },
      ],
    });

    return success(presets);
  } catch (error) {
    console.error("[MLS Presets] Error fetching presets:", error);
    return fail("Failed to fetch MLS presets");
  }
}

/**
 * Get a single preset by ID
 */
export async function getMlsPreset(id: string): Promise<ActionResult<MlsPreset>> {
  try {
    const organizationId = await requireOrganizationId();

    const preset = await prisma.mlsPreset.findFirst({
      where: {
        id,
        OR: [
          { organizationId: null },
          { organizationId },
        ],
      },
    });

    if (!preset) {
      return fail("Preset not found");
    }

    return success(preset);
  } catch (error) {
    console.error("[MLS Presets] Error fetching preset:", error);
    return fail("Failed to fetch preset");
  }
}

/**
 * Get presets by provider
 */
export async function getMlsPresetsByProvider(provider: string): Promise<ActionResult<MlsPreset[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const presets = await prisma.mlsPreset.findMany({
      where: {
        provider,
        OR: [
          { organizationId: null },
          { organizationId },
        ],
        isActive: true,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return success(presets);
  } catch (error) {
    console.error("[MLS Presets] Error fetching presets by provider:", error);
    return fail("Failed to fetch presets");
  }
}

/**
 * Get all unique MLS providers
 */
export async function getMlsProviders(): Promise<ActionResult<string[]>> {
  try {
    const organizationId = await requireOrganizationId();

    const presets = await prisma.mlsPreset.findMany({
      where: {
        OR: [
          { organizationId: null },
          { organizationId },
        ],
        isActive: true,
      },
      select: { provider: true },
      distinct: ["provider"],
      orderBy: { provider: "asc" },
    });

    return success(presets.map((p) => p.provider));
  } catch (error) {
    console.error("[MLS Presets] Error fetching providers:", error);
    return fail("Failed to fetch providers");
  }
}

// ============================================================================
// Resolve Effective Presets (Hierarchical Override Resolution)
// ============================================================================

/**
 * Get the effective presets for a client with all overrides applied
 * Hierarchy: System → Organization → Brokerage → Client
 */
export async function getEffectivePresetsForClient(clientId: string): Promise<ActionResult<ResolvedPreset[]>> {
  try {
    const organizationId = await requireOrganizationId();

    // Get client with brokerage info
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId },
      select: { id: true, brokerageId: true },
    });

    if (!client) {
      return fail("Client not found");
    }

    // Get all presets (system + org level)
    const presets = await prisma.mlsPreset.findMany({
      where: {
        OR: [
          { organizationId: null, isSystemPreset: true },
          { organizationId },
        ],
        isActive: true,
      },
      orderBy: [{ provider: "asc" }, { sortOrder: "asc" }],
    });

    // Get brokerage overrides (if client belongs to a brokerage)
    const brokerageOverrides = client.brokerageId
      ? await prisma.mlsPresetOverride.findMany({
          where: { brokerageId: client.brokerageId },
        })
      : [];

    // Get client overrides
    const clientOverrides = await prisma.mlsPresetOverride.findMany({
      where: { clientId },
    });

    // Build override maps for quick lookup
    const brokerageOverrideMap = new Map(
      brokerageOverrides.map((o) => [o.presetId, o])
    );
    const clientOverrideMap = new Map(
      clientOverrides.map((o) => [o.presetId, o])
    );

    // Resolve each preset with hierarchical overrides
    const resolvedPresets: ResolvedPreset[] = presets.map((preset) => {
      const brokerageOverride = brokerageOverrideMap.get(preset.id);
      const clientOverride = clientOverrideMap.get(preset.id);

      // Determine override source (most specific wins)
      let overrideSource: ResolvedPreset["overrideSource"] = preset.isSystemPreset
        ? "system"
        : "organization";

      // Apply brokerage overrides
      let effectiveWidth = preset.width;
      let effectiveHeight = preset.height;
      let effectiveQuality = preset.quality;
      let effectiveMaxSizeKb = preset.maxFileSizeKb;
      let effectiveEnabled = true;
      let effectiveIsDefault = false;

      if (brokerageOverride) {
        overrideSource = "brokerage";
        if (brokerageOverride.customWidth !== null) effectiveWidth = brokerageOverride.customWidth;
        if (brokerageOverride.customHeight !== null) effectiveHeight = brokerageOverride.customHeight;
        if (brokerageOverride.customQuality !== null) effectiveQuality = brokerageOverride.customQuality;
        if (brokerageOverride.customMaxSizeKb !== null) effectiveMaxSizeKb = brokerageOverride.customMaxSizeKb;
        if (brokerageOverride.enabled !== null) effectiveEnabled = brokerageOverride.enabled;
        if (brokerageOverride.isDefault !== null) effectiveIsDefault = brokerageOverride.isDefault;
      }

      // Apply client overrides (most specific level)
      if (clientOverride) {
        overrideSource = "client";
        if (clientOverride.customWidth !== null) effectiveWidth = clientOverride.customWidth;
        if (clientOverride.customHeight !== null) effectiveHeight = clientOverride.customHeight;
        if (clientOverride.customQuality !== null) effectiveQuality = clientOverride.customQuality;
        if (clientOverride.customMaxSizeKb !== null) effectiveMaxSizeKb = clientOverride.customMaxSizeKb;
        if (clientOverride.enabled !== null) effectiveEnabled = clientOverride.enabled;
        if (clientOverride.isDefault !== null) effectiveIsDefault = clientOverride.isDefault;
      }

      return {
        ...preset,
        effectiveWidth,
        effectiveHeight,
        effectiveQuality,
        effectiveMaxSizeKb,
        effectiveEnabled,
        effectiveIsDefault,
        overrideSource,
      };
    });

    // Filter out disabled presets
    return success(resolvedPresets.filter((p) => p.effectiveEnabled));
  } catch (error) {
    console.error("[MLS Presets] Error resolving presets for client:", error);
    return fail("Failed to resolve presets for client");
  }
}

/**
 * Get the default preset for a client (for auto-selection during download)
 */
export async function getDefaultPresetForClient(clientId: string): Promise<ActionResult<ResolvedPreset | null>> {
  try {
    const result = await getEffectivePresetsForClient(clientId);
    if (!result.success) {
      return fail(result.error);
    }

    // Find the preset marked as default
    const defaultPreset = result.data.find((p) => p.effectiveIsDefault);

    // If no default is set, return the first one
    return success(defaultPreset || result.data[0] || null);
  } catch (error) {
    console.error("[MLS Presets] Error getting default preset:", error);
    return fail("Failed to get default preset");
  }
}

/**
 * Get effective presets for a brokerage (org + brokerage overrides only)
 */
export async function getEffectivePresetsForBrokerage(brokerageId: string): Promise<ActionResult<ResolvedPreset[]>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify brokerage belongs to org
    const brokerage = await prisma.brokerage.findFirst({
      where: { id: brokerageId, organizationId },
    });

    if (!brokerage) {
      return fail("Brokerage not found");
    }

    // Get all presets
    const presets = await prisma.mlsPreset.findMany({
      where: {
        OR: [
          { organizationId: null, isSystemPreset: true },
          { organizationId },
        ],
        isActive: true,
      },
      orderBy: [{ provider: "asc" }, { sortOrder: "asc" }],
    });

    // Get brokerage overrides
    const overrides = await prisma.mlsPresetOverride.findMany({
      where: { brokerageId },
    });

    const overrideMap = new Map(overrides.map((o) => [o.presetId, o]));

    // Resolve presets
    const resolvedPresets: ResolvedPreset[] = presets.map((preset) => {
      const override = overrideMap.get(preset.id);
      let overrideSource: ResolvedPreset["overrideSource"] = preset.isSystemPreset
        ? "system"
        : "organization";

      let effectiveWidth = preset.width;
      let effectiveHeight = preset.height;
      let effectiveQuality = preset.quality;
      let effectiveMaxSizeKb = preset.maxFileSizeKb;
      let effectiveEnabled = true;
      let effectiveIsDefault = false;

      if (override) {
        overrideSource = "brokerage";
        if (override.customWidth !== null) effectiveWidth = override.customWidth;
        if (override.customHeight !== null) effectiveHeight = override.customHeight;
        if (override.customQuality !== null) effectiveQuality = override.customQuality;
        if (override.customMaxSizeKb !== null) effectiveMaxSizeKb = override.customMaxSizeKb;
        if (override.enabled !== null) effectiveEnabled = override.enabled;
        if (override.isDefault !== null) effectiveIsDefault = override.isDefault;
      }

      return {
        ...preset,
        effectiveWidth,
        effectiveHeight,
        effectiveQuality,
        effectiveMaxSizeKb,
        effectiveEnabled,
        effectiveIsDefault,
        overrideSource,
      };
    });

    return success(resolvedPresets.filter((p) => p.effectiveEnabled));
  } catch (error) {
    console.error("[MLS Presets] Error resolving presets for brokerage:", error);
    return fail("Failed to resolve presets for brokerage");
  }
}

// ============================================================================
// Write Operations - Organization Presets
// ============================================================================

/**
 * Create a new organization-level MLS preset
 */
export async function createMlsPreset(input: CreateMlsPresetInput): Promise<ActionResult<MlsPreset>> {
  try {
    const organizationId = await requireOrganizationId();

    // Check for duplicate
    const existing = await prisma.mlsPreset.findFirst({
      where: {
        organizationId,
        provider: input.provider,
        name: input.name,
      },
    });

    if (existing) {
      return fail("A preset with this name already exists for this provider");
    }

    const preset = await prisma.mlsPreset.create({
      data: {
        organizationId,
        name: input.name,
        provider: input.provider,
        description: input.description || null,
        width: input.width,
        height: input.height,
        quality: input.quality ?? 90,
        format: input.format ?? "jpeg",
        maxFileSizeKb: input.maxFileSizeKb ?? null,
        maintainAspect: input.maintainAspect ?? true,
        letterbox: input.letterbox ?? false,
        letterboxColor: input.letterboxColor ?? "#ffffff",
        isSystemPreset: false,
        isActive: true,
      },
    });

    revalidatePath("/settings/mls-presets");
    return success(preset);
  } catch (error) {
    console.error("[MLS Presets] Error creating preset:", error);
    return fail("Failed to create MLS preset");
  }
}

/**
 * Update an organization-level MLS preset
 */
export async function updateMlsPreset(input: UpdateMlsPresetInput): Promise<ActionResult<MlsPreset>> {
  try {
    const organizationId = await requireOrganizationId();

    // Can only update org presets, not system presets
    const existing = await prisma.mlsPreset.findFirst({
      where: { id: input.id, organizationId },
    });

    if (!existing) {
      return fail("Preset not found or cannot be modified");
    }

    if (existing.isSystemPreset) {
      return fail("System presets cannot be modified. Create an override instead.");
    }

    const preset = await prisma.mlsPreset.update({
      where: { id: input.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.provider !== undefined && { provider: input.provider }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.width !== undefined && { width: input.width }),
        ...(input.height !== undefined && { height: input.height }),
        ...(input.quality !== undefined && { quality: input.quality }),
        ...(input.format !== undefined && { format: input.format }),
        ...(input.maxFileSizeKb !== undefined && { maxFileSizeKb: input.maxFileSizeKb }),
        ...(input.maintainAspect !== undefined && { maintainAspect: input.maintainAspect }),
        ...(input.letterbox !== undefined && { letterbox: input.letterbox }),
        ...(input.letterboxColor !== undefined && { letterboxColor: input.letterboxColor }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
    });

    revalidatePath("/settings/mls-presets");
    return success(preset);
  } catch (error) {
    console.error("[MLS Presets] Error updating preset:", error);
    return fail("Failed to update MLS preset");
  }
}

/**
 * Delete an organization-level MLS preset
 */
export async function deleteMlsPreset(id: string): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    const preset = await prisma.mlsPreset.findFirst({
      where: { id, organizationId },
    });

    if (!preset) {
      return fail("Preset not found");
    }

    if (preset.isSystemPreset) {
      return fail("System presets cannot be deleted");
    }

    await prisma.mlsPreset.delete({ where: { id } });

    revalidatePath("/settings/mls-presets");
    return ok();
  } catch (error) {
    console.error("[MLS Presets] Error deleting preset:", error);
    return fail("Failed to delete MLS preset");
  }
}

// ============================================================================
// Write Operations - Override Settings
// ============================================================================

/**
 * Set or update an override for a brokerage or client
 */
export async function setPresetOverride(input: SetPresetOverrideInput): Promise<ActionResult<MlsPresetOverride>> {
  try {
    const organizationId = await requireOrganizationId();

    // Validate preset exists
    const preset = await prisma.mlsPreset.findFirst({
      where: {
        id: input.presetId,
        OR: [
          { organizationId: null },
          { organizationId },
        ],
      },
    });

    if (!preset) {
      return fail("Preset not found");
    }

    // Validate brokerage or client belongs to org
    if (input.brokerageId) {
      const brokerage = await prisma.brokerage.findFirst({
        where: { id: input.brokerageId, organizationId },
      });
      if (!brokerage) {
        return fail("Brokerage not found");
      }
    }

    if (input.clientId) {
      const client = await prisma.client.findFirst({
        where: { id: input.clientId, organizationId },
      });
      if (!client) {
        return fail("Client not found");
      }
    }

    // Upsert the override
    const existingWhere = input.brokerageId
      ? { brokerageId_presetId: { brokerageId: input.brokerageId, presetId: input.presetId } }
      : { clientId_presetId: { clientId: input.clientId!, presetId: input.presetId } };

    const override = await prisma.mlsPresetOverride.upsert({
      where: existingWhere,
      create: {
        presetId: input.presetId,
        brokerageId: input.brokerageId || null,
        clientId: input.clientId || null,
        enabled: input.enabled ?? null,
        isDefault: input.isDefault ?? null,
        customWidth: input.customWidth ?? null,
        customHeight: input.customHeight ?? null,
        customQuality: input.customQuality ?? null,
        customMaxSizeKb: input.customMaxSizeKb ?? null,
      },
      update: {
        ...(input.enabled !== undefined && { enabled: input.enabled }),
        ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
        ...(input.customWidth !== undefined && { customWidth: input.customWidth }),
        ...(input.customHeight !== undefined && { customHeight: input.customHeight }),
        ...(input.customQuality !== undefined && { customQuality: input.customQuality }),
        ...(input.customMaxSizeKb !== undefined && { customMaxSizeKb: input.customMaxSizeKb }),
      },
    });

    revalidatePath("/settings/mls-presets");
    revalidatePath("/brokerages");
    revalidatePath("/clients");
    return success(override);
  } catch (error) {
    console.error("[MLS Presets] Error setting override:", error);
    return fail("Failed to set preset override");
  }
}

/**
 * Remove an override (revert to inherited value)
 */
export async function removePresetOverride(input: {
  presetId: string;
  brokerageId?: string;
  clientId?: string;
}): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    if (input.brokerageId) {
      // Verify brokerage belongs to org
      const brokerage = await prisma.brokerage.findFirst({
        where: { id: input.brokerageId, organizationId },
      });
      if (!brokerage) {
        return fail("Brokerage not found");
      }

      await prisma.mlsPresetOverride.deleteMany({
        where: { brokerageId: input.brokerageId, presetId: input.presetId },
      });
    } else if (input.clientId) {
      // Verify client belongs to org
      const client = await prisma.client.findFirst({
        where: { id: input.clientId, organizationId },
      });
      if (!client) {
        return fail("Client not found");
      }

      await prisma.mlsPresetOverride.deleteMany({
        where: { clientId: input.clientId, presetId: input.presetId },
      });
    }

    revalidatePath("/settings/mls-presets");
    revalidatePath("/brokerages");
    revalidatePath("/clients");
    return ok();
  } catch (error) {
    console.error("[MLS Presets] Error removing override:", error);
    return fail("Failed to remove override");
  }
}

/**
 * Get all overrides for a brokerage
 */
export async function getBrokerageOverrides(
  brokerageId: string
): Promise<ActionResult<MlsPresetOverride[]>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify brokerage belongs to org
    const brokerage = await prisma.brokerage.findFirst({
      where: { id: brokerageId, organizationId },
    });

    if (!brokerage) {
      return fail("Brokerage not found");
    }

    const overrides = await prisma.mlsPresetOverride.findMany({
      where: { brokerageId },
    });

    return success(overrides);
  } catch (error) {
    console.error("[MLS Presets] Error fetching brokerage overrides:", error);
    return fail("Failed to fetch overrides");
  }
}

/**
 * Get all overrides for a client
 */
export async function getClientOverrides(
  clientId: string
): Promise<ActionResult<MlsPresetOverride[]>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify client belongs to org
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId },
    });

    if (!client) {
      return fail("Client not found");
    }

    const overrides = await prisma.mlsPresetOverride.findMany({
      where: { clientId },
    });

    return success(overrides);
  } catch (error) {
    console.error("[MLS Presets] Error fetching client overrides:", error);
    return fail("Failed to fetch overrides");
  }
}

/**
 * Bulk update overrides for a client (typically used in onboarding)
 */
export async function setClientMlsPreferences(
  clientId: string,
  defaultPresetId: string,
  customDimensions?: { width: number; height: number; quality?: number }
): Promise<ActionResult<void>> {
  try {
    const organizationId = await requireOrganizationId();

    // Verify client
    const client = await prisma.client.findFirst({
      where: { id: clientId, organizationId },
    });

    if (!client) {
      return fail("Client not found");
    }

    // Clear existing isDefault flags for this client
    await prisma.mlsPresetOverride.updateMany({
      where: { clientId, isDefault: true },
      data: { isDefault: false },
    });

    // Set the new default
    await prisma.mlsPresetOverride.upsert({
      where: {
        clientId_presetId: { clientId, presetId: defaultPresetId },
      },
      create: {
        clientId,
        presetId: defaultPresetId,
        isDefault: true,
        customWidth: customDimensions?.width ?? null,
        customHeight: customDimensions?.height ?? null,
        customQuality: customDimensions?.quality ?? null,
      },
      update: {
        isDefault: true,
        ...(customDimensions?.width && { customWidth: customDimensions.width }),
        ...(customDimensions?.height && { customHeight: customDimensions.height }),
        ...(customDimensions?.quality && { customQuality: customDimensions.quality }),
      },
    });

    revalidatePath("/clients");
    return ok();
  } catch (error) {
    console.error("[MLS Presets] Error setting client preferences:", error);
    return fail("Failed to set client MLS preferences");
  }
}
