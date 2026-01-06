"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import {
  createGallerySchema,
  updateGallerySchema,
  deleteGallerySchema,
  duplicateGallerySchema,
  archiveGallerySchema,
  deliverGallerySchema,
  reorderAssetsSchema,
  type CreateGalleryInput,
  type UpdateGalleryInput,
  type GalleryFilters,
} from "@/lib/validations/galleries";
import type { ProjectStatus } from "@prisma/client";
import { requireAuth, requireOrganizationId } from "./auth-helper";
import { sendGalleryDeliveredEmail } from "@/lib/email/send";
import { extractKeyFromUrl, generatePresignedDownloadUrl, deleteFiles } from "@/lib/storage";

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

// Helper to generate a unique delivery slug
function generateDeliverySlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 10; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
}

// Helper to log activity
async function logActivity(
  organizationId: string,
  type: "gallery_created" | "gallery_delivered" | "gallery_viewed" | "file_uploaded" | "settings_updated",
  description: string,
  metadata?: {
    projectId?: string;
    clientId?: string;
    userId?: string;
  }
) {
  try {
    await prisma.activityLog.create({
      data: {
        organizationId,
        type,
        description,
        projectId: metadata?.projectId,
        clientId: metadata?.clientId,
        userId: metadata?.userId,
      },
    });
  } catch (error) {
    console.error("Error logging activity:", error);
    // Don't fail the main operation if activity logging fails
  }
}

// Helper to generate a cryptographically secure slug for delivery links
function generateSlug(): string {
  // Use crypto.randomBytes for security - 16 bytes = 128 bits of entropy
  // Convert to base36 (alphanumeric) for URL-friendly slug
  const { randomBytes } = require("crypto");
  const bytes = randomBytes(16);
  // Convert to base36 and take first 16 characters for a secure, URL-friendly slug
  return bytes.toString("hex").slice(0, 16);
}

/**
 * Create a new gallery
 */
export async function createGallery(
  input: CreateGalleryInput
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const validated = createGallerySchema.parse(input);
    const organizationId = await getOrganizationId();

    // Create gallery with services using transaction
    const slug = generateSlug();
    const gallery = await prisma.$transaction(async (tx) => {
      // Create the project
      const project = await tx.project.create({
        data: {
          organizationId,
          name: validated.name,
          description: validated.description,
          clientId: validated.clientId,
          serviceId: validated.serviceId, // Keep for backwards compatibility
          locationId: validated.locationId,
          status: validated.status as ProjectStatus,
          priceCents: validated.priceCents,
          currency: validated.currency,
          coverImageUrl: validated.coverImageUrl,
          password: validated.password,
          expiresAt: validated.expiresAt,
          allowDownloads: validated.allowDownloads,
          showWatermark: validated.showWatermark,
        },
      });

      // Create ProjectService records if services are provided
      if (validated.services && validated.services.length > 0) {
        await tx.projectService.createMany({
          data: validated.services.map((service) => ({
            projectId: project.id,
            serviceId: service.serviceId,
            isPrimary: service.isPrimary,
            priceCentsOverride: service.priceCentsOverride ?? null,
          })),
        });
      }

      // Create delivery link
      await tx.deliveryLink.create({
        data: {
          projectId: project.id,
          slug,
          isActive: true,
        },
      });

      return project;
    });

    // Log activity
    await logActivity(
      organizationId,
      "gallery_created",
      `Gallery "${validated.name}" was created`,
      { projectId: gallery.id, clientId: validated.clientId || undefined }
    );

    revalidatePath("/galleries");
    revalidatePath("/dashboard");

    return { success: true, data: { id: gallery.id, slug } };
  } catch (error) {
    console.error("Error creating gallery:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create gallery" };
  }
}

/**
 * Update an existing gallery
 */
export async function updateGallery(
  input: UpdateGalleryInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateGallerySchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify gallery exists and belongs to organization
    const existing = await prisma.project.findFirst({
      where: {
        id: validated.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Gallery not found" };
    }

    const { id, ...updateData } = validated;

    const gallery = await prisma.project.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.clientId !== undefined && { clientId: updateData.clientId }),
        ...(updateData.serviceId !== undefined && { serviceId: updateData.serviceId }),
        ...(updateData.locationId !== undefined && { locationId: updateData.locationId }),
        ...(updateData.status && { status: updateData.status as ProjectStatus }),
        ...(updateData.priceCents !== undefined && { priceCents: updateData.priceCents }),
        ...(updateData.currency && { currency: updateData.currency }),
        ...(updateData.coverImageUrl !== undefined && { coverImageUrl: updateData.coverImageUrl }),
        ...(updateData.password !== undefined && { password: updateData.password }),
        ...(updateData.expiresAt !== undefined && { expiresAt: updateData.expiresAt }),
        ...(updateData.allowDownloads !== undefined && { allowDownloads: updateData.allowDownloads }),
        ...(updateData.showWatermark !== undefined && { showWatermark: updateData.showWatermark }),
        ...(updateData.downloadResolution !== undefined && { downloadResolution: updateData.downloadResolution }),
      },
    });

    // Log activity
    await logActivity(
      organizationId,
      "settings_updated",
      `Gallery "${gallery.name}" was updated`,
      { projectId: gallery.id }
    );

    revalidatePath("/galleries");
    revalidatePath(`/galleries/${id}`);
    revalidatePath(`/galleries/${id}/edit`);
    revalidatePath("/dashboard");

    return { success: true, data: { id: gallery.id } };
  } catch (error) {
    console.error("Error updating gallery:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update gallery" };
  }
}

/**
 * Delete a gallery
 */
export async function deleteGallery(
  id: string,
  force: boolean = false
): Promise<ActionResult> {
  try {
    deleteGallerySchema.parse({ id, force });
    const organizationId = await getOrganizationId();

    // Verify gallery exists and belongs to organization
    const existing = await prisma.project.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        _count: {
          select: {
            assets: true,
            payments: true,
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Gallery not found" };
    }

    // If has payments, archive instead of delete
    if (existing._count.payments > 0 && !force) {
      await prisma.project.update({
        where: { id },
        data: { status: "archived" },
      });

      revalidatePath("/galleries");
      return { success: true, data: undefined };
    }

    // Get all assets to delete from R2
    const assets = await prisma.asset.findMany({
      where: { projectId: id },
      select: {
        originalUrl: true,
        thumbnailUrl: true,
        mediumUrl: true,
        watermarkedUrl: true,
      },
    });

    // Collect all R2 keys to delete
    const keysToDelete: string[] = [];
    for (const asset of assets) {
      const urls = [
        asset.originalUrl,
        asset.thumbnailUrl,
        asset.mediumUrl,
        asset.watermarkedUrl,
      ].filter(Boolean) as string[];

      for (const url of urls) {
        const key = extractKeyFromUrl(url);
        if (key) keysToDelete.push(key);
      }
    }

    // Delete files from R2 (fire and forget)
    if (keysToDelete.length > 0) {
      deleteFiles(keysToDelete).catch((error) => {
        console.error("Failed to delete gallery files from R2:", error);
      });
    }

    // Delete assets from database
    await prisma.asset.deleteMany({
      where: { projectId: id },
    });

    // Delete delivery links
    await prisma.deliveryLink.deleteMany({
      where: { projectId: id },
    });

    // Delete favorites
    await prisma.galleryFavorite.deleteMany({
      where: { projectId: id },
    });

    // Delete comments
    await prisma.galleryComment.deleteMany({
      where: { projectId: id },
    });

    // Delete the gallery
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/galleries");
    revalidatePath("/dashboard");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting gallery:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete gallery" };
  }
}

/**
 * Duplicate a gallery
 */
export async function duplicateGallery(
  id: string,
  newName?: string,
  includePhotos: boolean = false
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    duplicateGallerySchema.parse({ id, newName, includePhotos });
    const organizationId = await getOrganizationId();

    // Get original gallery
    const original = await prisma.project.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        assets: includePhotos ? { orderBy: { sortOrder: "asc" } } : false,
      },
    });

    if (!original) {
      return { success: false, error: "Gallery not found" };
    }

    // Create duplicate gallery
    const duplicate = await prisma.project.create({
      data: {
        organizationId,
        name: newName || `${original.name} (Copy)`,
        description: original.description,
        clientId: original.clientId,
        serviceId: original.serviceId,
        locationId: original.locationId,
        status: "draft", // Always start as draft
        priceCents: original.priceCents,
        currency: original.currency,
        password: original.password,
        allowDownloads: original.allowDownloads,
        showWatermark: original.showWatermark,
      },
    });

    // Create delivery link
    const slug = generateSlug();
    await prisma.deliveryLink.create({
      data: {
        projectId: duplicate.id,
        slug,
        isActive: true,
      },
    });

    // Duplicate assets if requested
    if (includePhotos && original.assets && original.assets.length > 0) {
      await prisma.asset.createMany({
        data: original.assets.map((asset, index) => ({
          projectId: duplicate.id,
          filename: asset.filename,
          originalUrl: asset.originalUrl,
          thumbnailUrl: asset.thumbnailUrl,
          mediumUrl: asset.mediumUrl,
          watermarkedUrl: asset.watermarkedUrl,
          mimeType: asset.mimeType,
          sizeBytes: asset.sizeBytes,
          width: asset.width,
          height: asset.height,
          exifData: (asset.exifData ?? undefined) as Prisma.InputJsonValue | undefined,
          sortOrder: index,
        })),
      });
    }

    // Log activity
    await logActivity(
      organizationId,
      "gallery_created",
      `Gallery "${duplicate.name}" was duplicated from "${original.name}"`,
      { projectId: duplicate.id }
    );

    revalidatePath("/galleries");

    return { success: true, data: { id: duplicate.id, slug } };
  } catch (error) {
    console.error("Error duplicating gallery:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to duplicate gallery" };
  }
}

/**
 * Archive or restore a gallery
 */
export async function archiveGallery(
  id: string,
  archive: boolean = true
): Promise<ActionResult<{ status: ProjectStatus }>> {
  try {
    archiveGallerySchema.parse({ id, archive });
    const organizationId = await getOrganizationId();

    const existing = await prisma.project.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Gallery not found" };
    }

    const newStatus: ProjectStatus = archive ? "archived" : "draft";

    const updated = await prisma.project.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath("/galleries");
    revalidatePath(`/galleries/${id}`);

    return { success: true, data: { status: updated.status } };
  } catch (error) {
    console.error("Error archiving gallery:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to archive gallery" };
  }
}

/**
 * Deliver a gallery (change status and optionally send email)
 */
export async function deliverGallery(
  id: string,
  sendEmail: boolean = true,
  message?: string
): Promise<ActionResult<{ deliveredAt: Date; emailSent?: boolean; emailError?: string }>> {
  try {
    deliverGallerySchema.parse({ id, sendEmail, message });
    const organizationId = await getOrganizationId();

    const existing = await prisma.project.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        client: true,
        deliveryLinks: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Gallery not found" };
    }

    const deliveredAt = new Date();

    // Create a delivery link if one doesn't exist
    let deliverySlug = existing.deliveryLinks[0]?.slug;
    if (!deliverySlug) {
      // Generate unique slug with retry logic
      let attempts = 0;
      const maxAttempts = 5;
      while (attempts < maxAttempts) {
        const candidateSlug = generateDeliverySlug();
        try {
          await prisma.deliveryLink.create({
            data: {
              projectId: id,
              slug: candidateSlug,
              isActive: true,
            },
          });
          deliverySlug = candidateSlug;
          break;
        } catch (slugError) {
          // If slug already exists (unique constraint), try again
          attempts++;
          if (attempts >= maxAttempts) {
            console.error("[Gallery Delivery] Failed to generate unique slug after max attempts");
            // Fall back to using the project ID as slug
            deliverySlug = id;
          }
        }
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        status: "delivered",
        deliveredAt,
      },
    });

    // Log activity
    await logActivity(
      organizationId,
      "gallery_delivered",
      `Gallery "${existing.name}" was delivered${existing.client ? ` to ${existing.client.fullName || existing.client.company || 'client'}` : ""}`,
      { projectId: id, clientId: existing.clientId || undefined }
    );

    // Track email status to return to caller
    let emailSent = false;
    let emailError: string | undefined;

    // Send email notification if requested (non-blocking - don't fail delivery if email fails)
    if (sendEmail && existing.client?.email) {
      try {
        // Get organization info for photographer name
        const organization = await prisma.organization.findUnique({
          where: { id: organizationId },
          select: { name: true },
        });

        const galleryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/g/${deliverySlug || id}`;

        // Count photos for the email
        const photoCount = await prisma.asset.count({
          where: { projectId: id },
        });

        const emailResult = await sendGalleryDeliveredEmail({
          to: existing.client.email,
          clientName: existing.client.fullName || existing.client.company || "there",
          galleryName: existing.name,
          galleryUrl,
          photographerName: organization?.name || "Your Photographer",
          photoCount,
          expiresAt: existing.expiresAt || undefined,
        });

        if (emailResult.success) {
          emailSent = true;
        } else {
          emailError = emailResult.error || "Failed to send email";
          console.error("[Gallery Delivery] Email notification failed:", emailError);
        }
      } catch (err) {
        // Log email failure but don't fail the delivery operation
        emailError = err instanceof Error ? err.message : "Unknown email error";
        console.error("[Gallery Delivery] Email notification failed:", emailError);
      }
    } else if (sendEmail && !existing.client?.email) {
      emailError = "No client email address on file";
    }

    revalidatePath("/galleries");
    revalidatePath(`/galleries/${id}`);
    revalidatePath("/dashboard");

    return { success: true, data: { deliveredAt, emailSent, emailError } };
  } catch (error) {
    console.error("Error delivering gallery:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to deliver gallery" };
  }
}

/**
 * Bulk archive galleries
 */
export async function bulkArchiveGalleries(
  ids: string[],
  archive: boolean = true
): Promise<ActionResult<{ count: number }>> {
  try {
    const organizationId = await getOrganizationId();

    const newStatus: ProjectStatus = archive ? "archived" : "draft";

    const result = await prisma.project.updateMany({
      where: {
        id: { in: ids },
        organizationId,
      },
      data: { status: newStatus },
    });

    revalidatePath("/galleries");

    return { success: true, data: { count: result.count } };
  } catch (error) {
    console.error("Error bulk archiving galleries:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to archive galleries" };
  }
}

/**
 * Bulk delete galleries
 */
export async function bulkDeleteGalleries(
  ids: string[],
  force: boolean = false
): Promise<ActionResult<{ count: number }>> {
  try {
    const organizationId = await getOrganizationId();

    // Get galleries with payment counts
    const galleries = await prisma.project.findMany({
      where: {
        id: { in: ids },
        organizationId,
      },
      include: {
        _count: {
          select: { payments: true },
        },
      },
    });

    let deletedCount = 0;
    let archivedCount = 0;

    for (const gallery of galleries) {
      if (gallery._count.payments > 0 && !force) {
        // Archive instead
        await prisma.project.update({
          where: { id: gallery.id },
          data: { status: "archived" },
        });
        archivedCount++;
      } else {
        // Delete related records
        await prisma.asset.deleteMany({ where: { projectId: gallery.id } });
        await prisma.deliveryLink.deleteMany({ where: { projectId: gallery.id } });
        await prisma.galleryFavorite.deleteMany({ where: { projectId: gallery.id } });
        await prisma.galleryComment.deleteMany({ where: { projectId: gallery.id } });
        await prisma.project.delete({ where: { id: gallery.id } });
        deletedCount++;
      }
    }

    revalidatePath("/galleries");
    revalidatePath("/dashboard");

    return { success: true, data: { count: deletedCount + archivedCount } };
  } catch (error) {
    console.error("Error bulk deleting galleries:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete galleries" };
  }
}

/**
 * Get all galleries for the organization
 */
export async function getGalleries(filters?: GalleryFilters) {
  try {
    const organizationId = await getOrganizationId();

    const galleries = await prisma.project.findMany({
      where: {
        organizationId,
        ...(filters?.status && { status: filters.status as ProjectStatus }),
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.serviceId && { serviceId: filters.serviceId }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { description: { contains: filters.search, mode: "insensitive" } },
            { client: { fullName: { contains: filters.search, mode: "insensitive" } } },
            { client: { company: { contains: filters.search, mode: "insensitive" } } },
          ],
        }),
        ...(filters?.fromDate && { createdAt: { gte: filters.fromDate } }),
        ...(filters?.toDate && { createdAt: { lte: filters.toDate } }),
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            company: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        deliveryLinks: {
          where: { isActive: true },
          take: 1,
          select: { slug: true },
        },
        _count: {
          select: {
            assets: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return galleries.map((gallery) => ({
      id: gallery.id,
      name: gallery.name,
      description: gallery.description,
      status: gallery.status,
      priceCents: gallery.priceCents,
      currency: gallery.currency,
      coverImageUrl: gallery.coverImageUrl,
      viewCount: gallery.viewCount,
      downloadCount: gallery.downloadCount,
      deliveredAt: gallery.deliveredAt,
      expiresAt: gallery.expiresAt,
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
      // Related data
      client: gallery.client,
      service: gallery.service,
      deliverySlug: gallery.deliveryLinks[0]?.slug || null,
      photoCount: gallery._count.assets,
      paymentCount: gallery._count.payments,
    }));
  } catch (error) {
    console.error("Error fetching galleries:", error);
    return [];
  }
}

/**
 * Get a single gallery by ID with full details
 */
export async function getGallery(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const gallery = await prisma.project.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        client: true,
        service: true,
        location: true,
        propertyWebsite: true,
        assets: {
          orderBy: { sortOrder: "asc" },
        },
        deliveryLinks: {
          where: { isActive: true },
          take: 1,
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        favorites: true,
        comments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!gallery) {
      return null;
    }

    // Get activity logs for this gallery
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        organizationId,
        projectId: id,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    return {
      id: gallery.id,
      name: gallery.name,
      description: gallery.description,
      status: gallery.status,
      priceCents: gallery.priceCents,
      currency: gallery.currency,
      coverImageUrl: gallery.coverImageUrl,
      password: gallery.password,
      expiresAt: gallery.expiresAt,
      allowDownloads: gallery.allowDownloads,
      showWatermark: gallery.showWatermark,
      downloadResolution: gallery.downloadResolution,
      viewCount: gallery.viewCount,
      downloadCount: gallery.downloadCount,
      deliveredAt: gallery.deliveredAt,
      createdAt: gallery.createdAt,
      updatedAt: gallery.updatedAt,
      // Related data
      client: gallery.client,
      service: gallery.service,
      location: gallery.location,
      deliverySlug: gallery.deliveryLinks[0]?.slug || null,
      // Assets/photos
      photos: gallery.assets.map((asset) => ({
        id: asset.id,
        filename: asset.filename,
        url: asset.originalUrl,
        thumbnailUrl: asset.thumbnailUrl,
        mediumUrl: asset.mediumUrl,
        width: asset.width,
        height: asset.height,
        sortOrder: asset.sortOrder,
      })),
      // Payments
      payments: gallery.payments,
      // Favorites
      favoriteCount: gallery.favorites.length,
      // Comments
      comments: gallery.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        clientName: comment.clientName,
        clientEmail: comment.clientEmail,
      })),
      // Activity
      activityLogs: activityLogs.map((log) => ({
        id: log.id,
        type: log.type,
        description: log.description,
        createdAt: log.createdAt,
        user: log.user,
      })),
      // Property Website
      propertyWebsite: gallery.propertyWebsite,
    };
  } catch (error) {
    console.error("Error fetching gallery:", error);
    return null;
  }
}

/**
 * Reorder photos in a gallery
 */
export async function reorderPhotos(
  projectId: string,
  assetIds: string[]
): Promise<ActionResult> {
  try {
    reorderAssetsSchema.parse({ projectId, assetIds });
    const organizationId = await getOrganizationId();

    // Verify gallery belongs to organization
    const gallery = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId,
      },
    });

    if (!gallery) {
      return { success: false, error: "Gallery not found" };
    }

    // Update sort order for each asset
    await Promise.all(
      assetIds.map((assetId, index) =>
        prisma.asset.update({
          where: { id: assetId },
          data: { sortOrder: index },
        })
      )
    );

    revalidatePath(`/galleries/${projectId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error reordering photos:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to reorder photos" };
  }
}

/**
 * Delete a photo from a gallery
 */
export async function deletePhoto(
  projectId: string,
  assetId: string
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Verify gallery belongs to organization and asset belongs to gallery
    const asset = await prisma.asset.findFirst({
      where: {
        id: assetId,
        projectId,
        project: {
          organizationId,
        },
      },
      select: {
        id: true,
        originalUrl: true,
        thumbnailUrl: true,
        mediumUrl: true,
        watermarkedUrl: true,
      },
    });

    if (!asset) {
      return { success: false, error: "Photo not found" };
    }

    // Extract R2 keys from URLs and delete files
    const urlsToDelete = [
      asset.originalUrl,
      asset.thumbnailUrl,
      asset.mediumUrl,
      asset.watermarkedUrl,
    ].filter(Boolean) as string[];

    const keysToDelete = urlsToDelete
      .map((url) => extractKeyFromUrl(url))
      .filter((key): key is string => Boolean(key));

    // Delete from R2 (fire and forget - don't block on storage deletion)
    if (keysToDelete.length > 0) {
      deleteFiles(keysToDelete).catch((error) => {
        console.error("Failed to delete files from R2:", error);
      });
    }

    // Delete the asset from database
    await prisma.asset.delete({
      where: { id: assetId },
    });

    revalidatePath(`/galleries/${projectId}`);

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting photo:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete photo" };
  }
}

/**
 * Get public gallery data by delivery link slug or project ID (for public viewing)
 * @param slugOrId - Either a delivery link slug (8 chars) or a project CUID
 * @param isPreview - If true, bypasses delivery status check (for authenticated admin preview)
 */
export async function getPublicGallery(slugOrId: string, isPreview: boolean = false) {
  try {
    // Determine if this is a project ID (CUID format starts with 'c' and is longer)
    // or a delivery link slug (8 random alphanumeric chars)
    const isProjectId = slugOrId.length > 8 && slugOrId.startsWith("c");

    let project;
    let deliverySlug: string | null = null;

    if (isProjectId) {
      // Direct lookup by project ID (mainly for preview mode)
      project = await prisma.project.findUnique({
        where: { id: slugOrId },
        include: {
          organization: {
            select: {
              name: true,
              logoUrl: true,
              logoLightUrl: true,
              primaryColor: true,
              secondaryColor: true,
              accentColor: true,
              portalMode: true,
              hidePlatformBranding: true,
              plan: true,
            },
          },
          assets: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              filename: true,
              originalUrl: true,
              thumbnailUrl: true,
              mediumUrl: true,
              width: true,
              height: true,
              collectionId: true,
            },
          },
          collections: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              name: true,
              description: true,
              coverAssetId: true,
              sortOrder: true,
            },
          },
          payments: {
            where: { status: "paid" },
            select: { id: true },
          },
          deliveryLinks: {
            where: { isActive: true },
            take: 1,
            select: {
              slug: true,
              isActive: true,
            },
          },
        },
      });

      if (!project) {
        return null;
      }

      // For direct project ID access, require preview mode unless delivered
      if (!isPreview && project.status !== "delivered") {
        return null;
      }

      deliverySlug = project.deliveryLinks[0]?.slug || null;
    } else {
      // Find by delivery link slug
      const deliveryLink = await prisma.deliveryLink.findUnique({
        where: { slug: slugOrId },
        include: {
          project: {
            include: {
              organization: {
                select: {
                  name: true,
                  logoUrl: true,
                  logoLightUrl: true,
                  primaryColor: true,
                  secondaryColor: true,
                  accentColor: true,
                  portalMode: true,
                  hidePlatformBranding: true,
                  plan: true,
                },
              },
              assets: {
                orderBy: { sortOrder: "asc" },
                select: {
                  id: true,
                  filename: true,
                  originalUrl: true,
                  thumbnailUrl: true,
                  mediumUrl: true,
                  width: true,
                  height: true,
                  collectionId: true,
                },
              },
              collections: {
                orderBy: { sortOrder: "asc" },
                select: {
                  id: true,
                  name: true,
                  description: true,
                  coverAssetId: true,
                  sortOrder: true,
                },
              },
              payments: {
                where: { status: "paid" },
                select: { id: true },
              },
            },
          },
        },
      });

      if (!deliveryLink || !deliveryLink.isActive) {
        return null;
      }

      deliverySlug = deliveryLink.slug;
      project = deliveryLink.project;
    }

    // Check if gallery has been delivered (bypass in preview mode)
    if (!isPreview && project.status !== "delivered") {
      return null;
    }

    // Check if expired (bypass in preview mode)
    if (!isPreview && project.expiresAt && project.expiresAt < new Date()) {
      return null;
    }

    const isPaid = project.payments.length > 0 || project.priceCents === 0;
    const canDownload = project.allowDownloads && (isPaid || project.priceCents === 0);
    const org = project.organization;

    // Determine theme based on portalMode - only paid plans can hide platform branding
    const isPaidPlan = org.plan === "pro" || org.plan === "studio" || org.plan === "enterprise";
    const canHideBranding = isPaidPlan && org.hidePlatformBranding;

    // Sign asset URLs for short-lived access
    const photos = await Promise.all(
      project.assets.map(async (asset) => {
        const thumbKey = asset.thumbnailUrl ? extractKeyFromUrl(asset.thumbnailUrl) : null;
        const mediumKey = asset.mediumUrl ? extractKeyFromUrl(asset.mediumUrl) : null;
        const originalKey = asset.originalUrl ? extractKeyFromUrl(asset.originalUrl) : null;

        let signedThumbnailUrl = asset.thumbnailUrl || asset.originalUrl;
        let signedMediumUrl = asset.mediumUrl || asset.originalUrl;
        let signedOriginalUrl = "";

        try {
          if (thumbKey) {
            signedThumbnailUrl = await generatePresignedDownloadUrl(thumbKey, 900);
          }
        } catch (err) {
          console.error("Failed to sign thumbnail URL", { assetId: asset.id, err });
        }

        try {
          if (mediumKey) {
            signedMediumUrl = await generatePresignedDownloadUrl(mediumKey, 900);
          }
        } catch (err) {
          console.error("Failed to sign medium URL", { assetId: asset.id, err });
        }

        if (canDownload && originalKey) {
          try {
            signedOriginalUrl = await generatePresignedDownloadUrl(originalKey, 900);
          } catch (err) {
            console.error("Failed to sign original URL", { assetId: asset.id, err });
            signedOriginalUrl = "";
          }
        }

        return {
          id: asset.id,
          url: signedMediumUrl || signedThumbnailUrl || signedOriginalUrl,
          thumbnailUrl: signedThumbnailUrl,
          mediumUrl: signedMediumUrl,
          originalUrl: signedOriginalUrl,
          filename: asset.filename,
          width: asset.width || 4,
          height: asset.height || 3,
          collectionId: asset.collectionId,
        };
      })
    );

    // Map collections with photo counts
    const collections = project.collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      coverAssetId: collection.coverAssetId,
      sortOrder: collection.sortOrder,
      photoCount: photos.filter((p) => p.collectionId === collection.id).length,
    }));

    return {
      id: project.id,
      name: project.name,
      description: project.description || "",
      deliverySlug,
      photographer: {
        name: org.name,
        logoUrl: org.logoUrl,
        logoLightUrl: org.logoLightUrl,
      },
      status: project.status,
      price: project.priceCents,
      isPaid,
      allowDownload: canDownload,
      allowFavorites: true, // Default true for now
      allowSelections: project.allowSelections,
      selectionLimit: project.selectionLimit,
      selectionsSubmitted: project.selectionsSubmitted,
      showWatermark: project.showWatermark,
      // Branding colors
      primaryColor: org.primaryColor || "#3b82f6",
      secondaryColor: org.secondaryColor || "#8b5cf6",
      accentColor: org.accentColor || "#22c55e",
      // Portal appearance
      theme: (org.portalMode || "dark") as "light" | "dark" | "auto",
      hidePlatformBranding: canHideBranding,
      isPreview, // Let the UI know this is a preview
      expiresAt: project.expiresAt?.toISOString() || null,
      isPasswordProtected: !!project.password,
      photos,
      collections,
    };
  } catch (error) {
    console.error("Error fetching public gallery:", error);
    return null;
  }
}

/**
 * Record a gallery view (called from public gallery page)
 */
export async function recordGalleryView(slug: string): Promise<ActionResult> {
  try {
    // Find the delivery link and project
    const deliveryLink = await prisma.deliveryLink.findUnique({
      where: { slug },
      include: { project: true },
    });

    if (!deliveryLink || !deliveryLink.isActive) {
      return { success: false, error: "Gallery not found" };
    }

    // Increment view count
    await prisma.project.update({
      where: { id: deliveryLink.projectId },
      data: { viewCount: { increment: 1 } },
    });

    // Update delivery link stats
    await prisma.deliveryLink.update({
      where: { id: deliveryLink.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    // Log activity
    await logActivity(
      deliveryLink.project.organizationId,
      "gallery_viewed",
      `Gallery "${deliveryLink.project.name}" was viewed`,
      { projectId: deliveryLink.projectId }
    );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error recording gallery view:", error);
    return { success: false, error: "Failed to record view" };
  }
}

/**
 * Record a photo download
 */
export async function recordDownload(
  projectId: string,
  assetId?: string
): Promise<ActionResult> {
  try {
    const organizationId = await getOrganizationId();

    // Increment gallery download count
    await prisma.project.update({
      where: { id: projectId },
      data: { downloadCount: { increment: 1 } },
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error recording download:", error);
    return { success: false, error: "Failed to record download" };
  }
}

/**
 * Get gallery counts by status (for filter tabs)
 */
export async function getGalleryCounts(): Promise<{
  all: number;
  draft: number;
  pending: number;
  delivered: number;
  archived: number;
}> {
  try {
    const organizationId = await getOrganizationId();

    const [all, draft, pending, delivered, archived] = await Promise.all([
      prisma.project.count({ where: { organizationId } }),
      prisma.project.count({ where: { organizationId, status: "draft" } }),
      prisma.project.count({ where: { organizationId, status: "pending" } }),
      prisma.project.count({ where: { organizationId, status: "delivered" } }),
      prisma.project.count({ where: { organizationId, status: "archived" } }),
    ]);

    return { all, draft, pending, delivered, archived };
  } catch (error) {
    console.error("Error getting gallery counts:", error);
    return { all: 0, draft: 0, pending: 0, delivered: 0, archived: 0 };
  }
}
