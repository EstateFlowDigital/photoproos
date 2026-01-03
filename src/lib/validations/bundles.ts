import { z } from "zod";

// Bundle type enum matching Prisma schema
export const bundleTypeSchema = z.enum(["fixed", "tiered", "custom"]);

export type BundleTypeEnum = z.infer<typeof bundleTypeSchema>;

// Base bundle schema for validation
export const bundleSchema = z.object({
  name: z
    .string()
    .min(1, "Bundle name is required")
    .max(100, "Bundle name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens"
    ),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  priceCents: z
    .number()
    .min(0, "Price must be a positive number")
    .max(100000000, "Price is too high"), // Max $1M
  bundleType: bundleTypeSchema.default("fixed"),
  imageUrl: z.string().url().optional().nullable(),
  badgeText: z
    .string()
    .max(30, "Badge text must be less than 30 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
});

// Schema for creating a new bundle
export const createBundleSchema = bundleSchema;

// Schema for updating an existing bundle
export const updateBundleSchema = bundleSchema.partial().extend({
  id: z.string().cuid(),
});

// Schema for deleting a bundle
export const deleteBundleSchema = z.object({
  id: z.string().cuid(),
  force: z.boolean().optional().default(false),
});

// Schema for duplicating a bundle
export const duplicateBundleSchema = z.object({
  id: z.string().cuid(),
  newName: z.string().min(1).max(100).optional(),
  newSlug: z.string().min(1).max(100).optional(),
});

// Schema for adding/removing services from a bundle
export const bundleServiceSchema = z.object({
  bundleId: z.string().cuid(),
  serviceId: z.string().cuid(),
  isRequired: z.boolean().default(true),
  quantity: z.number().min(1).max(100).default(1),
});

export const bundleServicesSchema = z.object({
  bundleId: z.string().cuid(),
  services: z.array(
    z.object({
      serviceId: z.string().cuid(),
      isRequired: z.boolean().default(true),
      quantity: z.number().min(1).max(100).default(1),
      sortOrder: z.number().min(0).default(0),
    })
  ),
});

// Schema for reordering bundle items
export const reorderBundleItemsSchema = z.object({
  bundleId: z.string().cuid(),
  itemIds: z.array(z.string().cuid()),
});

// Type exports
export type CreateBundleInput = z.infer<typeof createBundleSchema>;
export type UpdateBundleInput = z.infer<typeof updateBundleSchema>;
export type DeleteBundleInput = z.infer<typeof deleteBundleSchema>;
export type DuplicateBundleInput = z.infer<typeof duplicateBundleSchema>;
export type BundleServiceInput = z.infer<typeof bundleServiceSchema>;
export type BundleServicesInput = z.infer<typeof bundleServicesSchema>;
export type ReorderBundleItemsInput = z.infer<typeof reorderBundleItemsSchema>;

// Bundle filters for querying
export const bundleFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  bundleType: bundleTypeSchema.optional(),
  search: z.string().optional(),
});

export type BundleFilters = z.infer<typeof bundleFiltersSchema>;
