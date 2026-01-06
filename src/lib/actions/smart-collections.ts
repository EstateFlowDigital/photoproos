"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { success, fail } from "@/lib/types/action-result";
import { createGalleryCollection, addAssetsToCollection } from "./gallery-collections";

// Types for smart collection suggestions
export interface SmartCollectionSuggestion {
  type: "date" | "filename" | "camera" | "custom";
  name: string;
  description: string;
  assetIds: string[];
  photoCount: number;
  previewPhotos: { id: string; thumbnailUrl: string | null }[];
}

interface ExifData {
  DateTimeOriginal?: string;
  CreateDate?: string;
  Make?: string;
  Model?: string;
  LensModel?: string;
  [key: string]: unknown;
}

// Analyze photos and suggest smart collections
export async function analyzePhotosForSmartCollections(projectId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return fail("Organization not found");
    }

    // Verify gallery belongs to organization
    const gallery = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!gallery) {
      return fail("Gallery not found");
    }

    // Get all assets without a collection
    const assets = await prisma.asset.findMany({
      where: {
        projectId,
        collectionId: null,
      },
      select: {
        id: true,
        filename: true,
        thumbnailUrl: true,
        exifData: true,
        createdAt: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    if (assets.length === 0) {
      return success({ suggestions: [], totalUncategorized: 0, message: "No uncategorized photos to organize" });
    }

    const suggestions: SmartCollectionSuggestion[] = [];

    // Strategy 1: Group by date from EXIF data
    const dateGroups = groupByExifDate(assets);
    for (const [dateKey, group] of Object.entries(dateGroups)) {
      if (group.length >= 2) {
        suggestions.push({
          type: "date",
          name: formatDateGroupName(dateKey),
          description: `${group.length} photos from ${dateKey}`,
          assetIds: group.map((a) => a.id),
          photoCount: group.length,
          previewPhotos: group.slice(0, 4).map((a) => ({
            id: a.id,
            thumbnailUrl: a.thumbnailUrl,
          })),
        });
      }
    }

    // Strategy 2: Group by filename prefix/pattern
    const filenameGroups = groupByFilenamePattern(assets);
    for (const [pattern, group] of Object.entries(filenameGroups)) {
      if (group.length >= 3 && !isPatternAlreadySuggestedByDate(pattern, dateGroups)) {
        suggestions.push({
          type: "filename",
          name: formatFilenameGroupName(pattern),
          description: `${group.length} photos with "${pattern}" prefix`,
          assetIds: group.map((a) => a.id),
          photoCount: group.length,
          previewPhotos: group.slice(0, 4).map((a) => ({
            id: a.id,
            thumbnailUrl: a.thumbnailUrl,
          })),
        });
      }
    }

    // Strategy 3: Group by camera/lens
    const cameraGroups = groupByCamera(assets);
    for (const [cameraKey, group] of Object.entries(cameraGroups)) {
      if (group.length >= 5 && cameraKey !== "Unknown Camera") {
        suggestions.push({
          type: "camera",
          name: cameraKey,
          description: `${group.length} photos shot with ${cameraKey}`,
          assetIds: group.map((a) => a.id),
          photoCount: group.length,
          previewPhotos: group.slice(0, 4).map((a) => ({
            id: a.id,
            thumbnailUrl: a.thumbnailUrl,
          })),
        });
      }
    }

    // Sort suggestions by photo count (descending)
    suggestions.sort((a, b) => b.photoCount - a.photoCount);

    // Limit to top 10 suggestions
    const topSuggestions = suggestions.slice(0, 10);

    return success({
      suggestions: topSuggestions,
      totalUncategorized: assets.length,
      message: topSuggestions.length > 0
        ? `Found ${topSuggestions.length} suggested groupings`
        : "No clear groupings found",
    });
  } catch (error) {
    console.error("[Smart Collections] Error analyzing photos:", error);
    return fail("Failed to analyze photos");
  }
}

// Apply a smart collection suggestion
export async function applySmartCollection(
  projectId: string,
  suggestion: {
    name: string;
    assetIds: string[];
  }
) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    // Create the collection
    const createResult = await createGalleryCollection(projectId, {
      name: suggestion.name,
    });

    if (!createResult.success || !createResult.data) {
      return fail("Failed to create collection");
    }

    const collectionId = createResult.data.id;

    // Assign photos to the collection
    const assignResult = await addAssetsToCollection(
      collectionId,
      suggestion.assetIds
    );

    if (!assignResult.success) {
      return fail("Failed to assign photos to collection");
    }

    return success({
      collectionId,
      name: suggestion.name,
      photoCount: suggestion.assetIds.length,
    });
  } catch (error) {
    console.error("[Smart Collections] Error applying suggestion:", error);
    return fail("Failed to apply smart collection");
  }
}

// Apply all suggested collections at once
export async function applyAllSmartCollections(
  projectId: string,
  suggestions: { name: string; assetIds: string[] }[]
) {
  const { orgId } = await auth();
  if (!orgId) {
    return fail("Not authenticated");
  }

  try {
    const results: { name: string; success: boolean; error?: string }[] = [];
    const usedAssetIds = new Set<string>();

    for (const suggestion of suggestions) {
      // Filter out assets already assigned to a collection in this batch
      const availableAssetIds = suggestion.assetIds.filter(
        (id) => !usedAssetIds.has(id)
      );

      if (availableAssetIds.length === 0) {
        results.push({
          name: suggestion.name,
          success: false,
          error: "All photos already assigned",
        });
        continue;
      }

      const result = await applySmartCollection(projectId, {
        name: suggestion.name,
        assetIds: availableAssetIds,
      });

      if (result.success) {
        availableAssetIds.forEach((id) => usedAssetIds.add(id));
        results.push({ name: suggestion.name, success: true });
      } else {
        results.push({
          name: suggestion.name,
          success: false,
          error: result.error,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    return success({
      results,
      successCount,
      totalCount: suggestions.length,
    });
  } catch (error) {
    console.error("[Smart Collections] Error applying all suggestions:", error);
    return fail("Failed to apply smart collections");
  }
}

// Helper: Group assets by EXIF date
function groupByExifDate(
  assets: { id: string; filename: string; thumbnailUrl: string | null; exifData: unknown }[]
): Record<string, typeof assets> {
  const groups: Record<string, typeof assets> = {};

  for (const asset of assets) {
    const exif = asset.exifData as ExifData | null;
    let dateKey = "Unknown Date";

    if (exif?.DateTimeOriginal || exif?.CreateDate) {
      const dateStr = exif.DateTimeOriginal || exif.CreateDate;
      // Parse EXIF date format: "2024:01:15 14:30:00"
      const match = String(dateStr).match(/^(\d{4}):(\d{2}):(\d{2})/);
      if (match) {
        dateKey = `${match[1]}-${match[2]}-${match[3]}`;
      }
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(asset);
  }

  return groups;
}

// Helper: Group assets by filename pattern
function groupByFilenamePattern(
  assets: { id: string; filename: string; thumbnailUrl: string | null }[]
): Record<string, typeof assets> {
  const groups: Record<string, typeof assets> = {};

  for (const asset of assets) {
    // Extract prefix from filename (letters and underscores before numbers)
    const match = asset.filename.match(/^([A-Za-z_-]+)/);
    if (match) {
      const prefix = match[1].toLowerCase();
      if (!groups[prefix]) {
        groups[prefix] = [];
      }
      groups[prefix].push(asset);
    }
  }

  return groups;
}

// Helper: Group assets by camera
function groupByCamera(
  assets: { id: string; filename: string; thumbnailUrl: string | null; exifData: unknown }[]
): Record<string, typeof assets> {
  const groups: Record<string, typeof assets> = {};

  for (const asset of assets) {
    const exif = asset.exifData as ExifData | null;
    let cameraKey = "Unknown Camera";

    if (exif?.Make || exif?.Model) {
      const make = String(exif.Make || "").trim();
      const model = String(exif.Model || "").trim();
      cameraKey = [make, model].filter(Boolean).join(" ");
    }

    if (!groups[cameraKey]) {
      groups[cameraKey] = [];
    }
    groups[cameraKey].push(asset);
  }

  return groups;
}

// Helper: Format date group name
function formatDateGroupName(dateKey: string): string {
  if (dateKey === "Unknown Date") {
    return "Unknown Date";
  }

  try {
    const date = new Date(dateKey);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateKey;
  }
}

// Helper: Format filename group name
function formatFilenameGroupName(pattern: string): string {
  // Capitalize first letter and clean up
  const cleaned = pattern.replace(/[-_]/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1) + " Series";
}

// Helper: Check if a filename pattern is already covered by date grouping
function isPatternAlreadySuggestedByDate(
  _pattern: string,
  _dateGroups: Record<string, unknown[]>
): boolean {
  // For now, simple check - could be enhanced
  return false;
}
