"use server";

import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/super-admin";
import { currentUser } from "@clerk/nextjs/server";
import { success, fail, type ActionResult } from "@/lib/types/action-result";
import type { CMSComponentPreset, CMSComponentType } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

export interface CreatePresetInput {
  name: string;
  description?: string;
  componentType: CMSComponentType;
  content: Record<string, unknown>;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  isGlobal?: boolean;
}

export interface UpdatePresetInput {
  name?: string;
  description?: string;
  content?: Record<string, unknown>;
  thumbnail?: string;
  category?: string;
  tags?: string[];
  isGlobal?: boolean;
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all presets (optionally filtered by component type)
 */
export async function getComponentPresets(
  componentType?: CMSComponentType
): Promise<ActionResult<CMSComponentPreset[]>> {
  try {
    const user = await currentUser();

    const presets = await prisma.cMSComponentPreset.findMany({
      where: {
        ...(componentType && { componentType }),
        OR: [
          { isGlobal: true },
          { createdBy: user?.id },
        ],
      },
      orderBy: [{ isGlobal: "desc" }, { name: "asc" }],
    });

    return success(presets);
  } catch (error) {
    console.error("Error fetching component presets:", error);
    return fail("Failed to fetch presets");
  }
}

/**
 * Get a single preset by ID
 */
export async function getComponentPreset(
  id: string
): Promise<ActionResult<CMSComponentPreset | null>> {
  try {
    const preset = await prisma.cMSComponentPreset.findUnique({
      where: { id },
    });

    return success(preset);
  } catch (error) {
    console.error("Error fetching component preset:", error);
    return fail("Failed to fetch preset");
  }
}

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

/**
 * Create a new component preset
 */
export async function createComponentPreset(
  input: CreatePresetInput
): Promise<ActionResult<CMSComponentPreset>> {
  try {
    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    // Only super admins can create global presets
    const isAdmin = await isSuperAdmin();
    const isGlobal = isAdmin && (input.isGlobal ?? false);

    const preset = await prisma.cMSComponentPreset.create({
      data: {
        name: input.name,
        description: input.description,
        componentType: input.componentType,
        content: input.content,
        thumbnail: input.thumbnail,
        category: input.category,
        tags: input.tags || [],
        isGlobal,
        createdBy: user.id,
        createdByName: user.firstName || user.emailAddresses?.[0]?.emailAddress,
      },
    });

    return success(preset);
  } catch (error) {
    console.error("Error creating component preset:", error);
    return fail("Failed to create preset");
  }
}

/**
 * Update a component preset
 */
export async function updateComponentPreset(
  id: string,
  input: UpdatePresetInput
): Promise<ActionResult<CMSComponentPreset>> {
  try {
    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    // Check ownership or admin status
    const existing = await prisma.cMSComponentPreset.findUnique({
      where: { id },
    });

    if (!existing) {
      return fail("Preset not found");
    }

    const isAdmin = await isSuperAdmin();
    const isOwner = existing.createdBy === user.id;

    if (!isAdmin && !isOwner) {
      return fail("Unauthorized");
    }

    // Only super admins can change global status
    const isGlobal = isAdmin ? input.isGlobal : existing.isGlobal;

    const preset = await prisma.cMSComponentPreset.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.content && { content: input.content }),
        ...(input.thumbnail !== undefined && { thumbnail: input.thumbnail }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.tags && { tags: input.tags }),
        ...(isGlobal !== undefined && { isGlobal }),
      },
    });

    return success(preset);
  } catch (error) {
    console.error("Error updating component preset:", error);
    return fail("Failed to update preset");
  }
}

/**
 * Delete a component preset
 */
export async function deleteComponentPreset(
  id: string
): Promise<ActionResult<void>> {
  try {
    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    // Check ownership or admin status
    const existing = await prisma.cMSComponentPreset.findUnique({
      where: { id },
    });

    if (!existing) {
      return fail("Preset not found");
    }

    const isAdmin = await isSuperAdmin();
    const isOwner = existing.createdBy === user.id;

    if (!isAdmin && !isOwner) {
      return fail("Unauthorized");
    }

    await prisma.cMSComponentPreset.delete({
      where: { id },
    });

    return success(undefined);
  } catch (error) {
    console.error("Error deleting component preset:", error);
    return fail("Failed to delete preset");
  }
}

// ============================================================================
// PRESET APPLICATION
// ============================================================================

/**
 * Apply a preset to get its content
 */
export async function applyPreset(
  presetId: string
): Promise<ActionResult<Record<string, unknown>>> {
  try {
    const preset = await prisma.cMSComponentPreset.findUnique({
      where: { id: presetId },
    });

    if (!preset) {
      return fail("Preset not found");
    }

    return success(preset.content as Record<string, unknown>);
  } catch (error) {
    console.error("Error applying preset:", error);
    return fail("Failed to apply preset");
  }
}
