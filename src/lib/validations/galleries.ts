import { z } from "zod";

// Project status enum matching Prisma schema
export const projectStatusSchema = z.enum([
  "draft",
  "pending",
  "delivered",
  "archived",
]);

export type ProjectStatusEnum = z.infer<typeof projectStatusSchema>;

// Base gallery schema for validation
export const gallerySchema = z.object({
  name: z
    .string()
    .min(1, "Gallery name is required")
    .max(200, "Gallery name must be less than 200 characters"),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  clientId: z
    .string()
    .cuid("Invalid client ID")
    .optional()
    .nullable()
    .transform((val) => val || null),
  serviceId: z
    .string()
    .cuid("Invalid service ID")
    .optional()
    .nullable()
    .transform((val) => val || null),
  locationId: z
    .string()
    .cuid("Invalid location ID")
    .optional()
    .nullable()
    .transform((val) => val || null),
  status: projectStatusSchema.default("draft"),
  // Pricing
  priceCents: z
    .number()
    .min(0, "Price must be a positive number")
    .max(100000000, "Price is too high") // Max $1M
    .default(0),
  currency: z.string().length(3).default("USD"),
  // Gallery Settings
  coverImageUrl: z
    .string()
    .url("Invalid cover image URL")
    .optional()
    .nullable()
    .transform((val) => val || null),
  password: z
    .string()
    .max(100, "Password must be less than 100 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  expiresAt: z
    .date()
    .optional()
    .nullable()
    .transform((val) => val || null),
  allowDownloads: z.boolean().default(true),
  showWatermark: z.boolean().default(false),
  // Additional settings (stored in form but may need schema updates)
  allowFavorites: z.boolean().default(true),
  sendNotifications: z.boolean().default(true),
});

// Schema for creating a new gallery
export const createGallerySchema = gallerySchema;

// Schema for updating an existing gallery
export const updateGallerySchema = gallerySchema.partial().extend({
  id: z.string().cuid(),
});

// Schema for deleting a gallery
export const deleteGallerySchema = z.object({
  id: z.string().cuid(),
  force: z.boolean().optional().default(false), // Force delete with all assets
});

// Schema for duplicating a gallery
export const duplicateGallerySchema = z.object({
  id: z.string().cuid(),
  newName: z.string().min(1).max(200).optional(),
  includePhotos: z.boolean().default(false),
});

// Schema for archiving a gallery
export const archiveGallerySchema = z.object({
  id: z.string().cuid(),
  archive: z.boolean(), // true = archive, false = restore
});

// Schema for delivering a gallery
export const deliverGallerySchema = z.object({
  id: z.string().cuid(),
  sendEmail: z.boolean().default(true),
  message: z.string().max(2000).optional(),
});

// Schema for bulk operations
export const bulkArchiveGalleriesSchema = z.object({
  ids: z.array(z.string().cuid()),
  archive: z.boolean(), // true = archive, false = restore
});

export const bulkDeleteGalleriesSchema = z.object({
  ids: z.array(z.string().cuid()),
  force: z.boolean().default(false),
});

// Gallery filters for querying
export const galleryFiltersSchema = z.object({
  status: projectStatusSchema.optional(),
  clientId: z.string().cuid().optional(),
  serviceId: z.string().cuid().optional(),
  search: z.string().optional(),
  fromDate: z.date().optional(),
  toDate: z.date().optional(),
});

export type GalleryFilters = z.infer<typeof galleryFiltersSchema>;

// Asset/Photo schemas
export const assetSchema = z.object({
  projectId: z.string().cuid(),
  filename: z.string().min(1).max(255),
  originalUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional().nullable(),
  mediumUrl: z.string().url().optional().nullable(),
  watermarkedUrl: z.string().url().optional().nullable(),
  mimeType: z.string().min(1).max(100),
  sizeBytes: z.number().min(0),
  width: z.number().min(0).optional().nullable(),
  height: z.number().min(0).optional().nullable(),
  exifData: z.record(z.string(), z.unknown()).optional().nullable(),
  sortOrder: z.number().default(0),
});

export const createAssetSchema = assetSchema;

export const updateAssetSchema = assetSchema.partial().extend({
  id: z.string().cuid(),
});

export const deleteAssetSchema = z.object({
  id: z.string().cuid(),
  deleteFromStorage: z.boolean().default(true),
});

export const reorderAssetsSchema = z.object({
  projectId: z.string().cuid(),
  assetIds: z.array(z.string().cuid()), // Ordered list of asset IDs
});

// Type exports
export type CreateGalleryInput = z.infer<typeof createGallerySchema>;
export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;
export type DeleteGalleryInput = z.infer<typeof deleteGallerySchema>;
export type DuplicateGalleryInput = z.infer<typeof duplicateGallerySchema>;
export type ArchiveGalleryInput = z.infer<typeof archiveGallerySchema>;
export type DeliverGalleryInput = z.infer<typeof deliverGallerySchema>;
export type BulkArchiveGalleriesInput = z.infer<typeof bulkArchiveGalleriesSchema>;
export type BulkDeleteGalleriesInput = z.infer<typeof bulkDeleteGalleriesSchema>;

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type DeleteAssetInput = z.infer<typeof deleteAssetSchema>;
export type ReorderAssetsInput = z.infer<typeof reorderAssetsSchema>;
