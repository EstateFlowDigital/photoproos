"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { ok } from "@/lib/types/action-result";

export interface GalleryCollectionInput {
  name: string;
  description?: string | null;
  coverAssetId?: string | null;
  sortOrder?: number;
}

// Get all collections for a gallery
export async function getGalleryCollections(projectId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Verify the gallery belongs to this organization
    const gallery = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    const collections = await prisma.galleryCollection.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { assets: true },
        },
        assets: {
          take: 1,
          orderBy: { sortOrder: "asc" },
          select: { thumbnailUrl: true, mediumUrl: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return { success: true, data: collections };
  } catch (error) {
    console.error("Error fetching gallery collections:", error);
    return { success: false, error: "Failed to fetch collections" };
  }
}

// Create a new collection
export async function createGalleryCollection(
  projectId: string,
  input: GalleryCollectionInput
) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Verify the gallery belongs to this organization
    const gallery = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // Get max sort order
    const maxSortOrder = await prisma.galleryCollection.findFirst({
      where: { projectId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const collection = await prisma.galleryCollection.create({
      data: {
        projectId,
        name: input.name,
        description: input.description || null,
        coverAssetId: input.coverAssetId || null,
        sortOrder: input.sortOrder ?? (maxSortOrder?.sortOrder ?? 0) + 1,
      },
    });

    revalidatePath(`/galleries/${projectId}`);

    return { success: true, data: collection };
  } catch (error) {
    console.error("Error creating gallery collection:", error);
    return { success: false, error: "Failed to create collection" };
  }
}

// Update a collection
export async function updateGalleryCollection(
  collectionId: string,
  input: Partial<GalleryCollectionInput>
) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Get collection and verify it belongs to this org's gallery
    const existing = await prisma.galleryCollection.findUnique({
      where: { id: collectionId },
      include: { project: { select: { organizationId: true } } },
    });

    if (!existing || existing.project.organizationId !== org.id) {
      return { success: false, error: "Collection not found" };
    }

    const collection = await prisma.galleryCollection.update({
      where: { id: collectionId },
      data: {
        name: input.name,
        description: input.description,
        coverAssetId: input.coverAssetId,
        sortOrder: input.sortOrder,
      },
    });

    revalidatePath(`/galleries/${existing.projectId}`);

    return { success: true, data: collection };
  } catch (error) {
    console.error("Error updating gallery collection:", error);
    return { success: false, error: "Failed to update collection" };
  }
}

// Delete a collection
export async function deleteGalleryCollection(collectionId: string) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Get collection and verify it belongs to this org's gallery
    const existing = await prisma.galleryCollection.findUnique({
      where: { id: collectionId },
      include: { project: { select: { organizationId: true } } },
    });

    if (!existing || existing.project.organizationId !== org.id) {
      return { success: false, error: "Collection not found" };
    }

    // Clear collection reference from all assets before deleting
    await prisma.asset.updateMany({
      where: { collectionId },
      data: { collectionId: null },
    });

    await prisma.galleryCollection.delete({
      where: { id: collectionId },
    });

    revalidatePath(`/galleries/${existing.projectId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting gallery collection:", error);
    return { success: false, error: "Failed to delete collection" };
  }
}

// Add assets to a collection
export async function addAssetsToCollection(
  collectionId: string,
  assetIds: string[]
) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Get collection and verify it belongs to this org's gallery
    const collection = await prisma.galleryCollection.findUnique({
      where: { id: collectionId },
      include: { project: { select: { organizationId: true } } },
    });

    if (!collection || collection.project.organizationId !== org.id) {
      return { success: false, error: "Collection not found" };
    }

    // Update assets to belong to this collection
    await prisma.asset.updateMany({
      where: {
        id: { in: assetIds },
        projectId: collection.projectId,
      },
      data: { collectionId },
    });

    revalidatePath(`/galleries/${collection.projectId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error adding assets to collection:", error);
    return { success: false, error: "Failed to add assets to collection" };
  }
}

// Remove assets from a collection
export async function removeAssetsFromCollection(assetIds: string[]) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Verify assets belong to this org's galleries
    const assets = await prisma.asset.findMany({
      where: { id: { in: assetIds } },
      include: { project: { select: { organizationId: true, id: true } } },
    });

    const validAssetIds = assets
      .filter((a) => a.project.organizationId === org.id)
      .map((a) => a.id);

    if (validAssetIds.length === 0) {
      return { success: false, error: "No valid assets found" };
    }

    await prisma.asset.updateMany({
      where: { id: { in: validAssetIds } },
      data: { collectionId: null },
    });

    // Revalidate paths for affected galleries
    const projectIds = [...new Set(assets.map((a) => a.project.id))];
    for (const projectId of projectIds) {
      revalidatePath(`/galleries/${projectId}`);
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error removing assets from collection:", error);
    return { success: false, error: "Failed to remove assets from collection" };
  }
}

// Reorder collections
export async function reorderGalleryCollections(
  projectId: string,
  collectionIds: string[]
) {
  const { orgId } = await auth();
  if (!orgId) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { id: true },
    });

    if (!org) {
      return { success: false, error: "Organization not found" };
    }

    // Verify the gallery belongs to this organization
    const gallery = await prisma.project.findFirst({
      where: { id: projectId, organizationId: org.id },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // Update sort orders
    await Promise.all(
      collectionIds.map((id, index) =>
        prisma.galleryCollection.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath(`/galleries/${projectId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error reordering collections:", error);
    return { success: false, error: "Failed to reorder collections" };
  }
}
