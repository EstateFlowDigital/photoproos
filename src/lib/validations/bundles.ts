import { z } from "zod";

// Bundle type enum matching Prisma schema
export const bundleTypeSchema = z.enum(["fixed", "tiered", "custom", "sqft_based", "tiered_sqft"]);
export const pricingMethodSchema = z.enum(["fixed", "per_sqft", "tiered"]);

export type BundleTypeEnum = z.infer<typeof bundleTypeSchema>;
export type PricingMethodEnum = z.infer<typeof pricingMethodSchema>;

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
  bundleType: bundleTypeSchema.optional().default("fixed"),
  pricingMethod: pricingMethodSchema.optional().default("fixed"),

  // Square footage pricing fields (all optional)
  pricePerSqftCents: z
    .number()
    .min(0, "Price per sqft must be positive")
    .max(10000, "Price per sqft is too high") // Max $100/sqft
    .optional()
    .nullable(),
  minSqft: z
    .number()
    .min(0, "Minimum sqft must be positive")
    .max(100000, "Minimum sqft is too high")
    .optional()
    .nullable(),
  maxSqft: z
    .number()
    .min(0, "Maximum sqft must be positive")
    .max(100000, "Maximum sqft is too high")
    .optional()
    .nullable(),
  sqftIncrements: z
    .number()
    .min(1, "Sqft increments must be at least 1")
    .max(10000, "Sqft increments is too high")
    .optional()
    .nullable(),

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

// =============================================================================
// PRICING TIERS (for tiered_sqft bundles - BICEP pricing)
// =============================================================================

// Single pricing tier
export const pricingTierSchema = z.object({
  minSqft: z
    .number()
    .min(0, "Minimum sqft must be positive")
    .max(100000, "Minimum sqft is too high"),
  maxSqft: z
    .number()
    .min(0, "Maximum sqft must be positive")
    .max(100000, "Maximum sqft is too high")
    .optional()
    .nullable(), // null = unlimited
  priceCents: z
    .number()
    .min(0, "Price must be positive")
    .max(100000000, "Price is too high"),
  tierName: z
    .string()
    .max(50, "Tier name must be less than 50 characters")
    .optional()
    .nullable(),
  sortOrder: z.number().min(0).default(0),
});

// Schema for creating pricing tiers for a bundle
export const createPricingTiersSchema = z.object({
  bundleId: z.string().cuid(),
  tiers: z.array(pricingTierSchema).min(1, "At least one pricing tier is required"),
});

// Schema for updating a single pricing tier
export const updatePricingTierSchema = pricingTierSchema.partial().extend({
  id: z.string().cuid(),
});

// Schema for deleting a pricing tier
export const deletePricingTierSchema = z.object({
  id: z.string().cuid(),
});

// Type exports for pricing tiers
export type PricingTierInput = z.infer<typeof pricingTierSchema>;
export type CreatePricingTiersInput = z.infer<typeof createPricingTiersSchema>;
export type UpdatePricingTierInput = z.infer<typeof updatePricingTierSchema>;
export type DeletePricingTierInput = z.infer<typeof deletePricingTierSchema>;

// =============================================================================
// PRICE CALCULATION
// =============================================================================

// Schema for calculating bundle price based on sqft
export const calculateBundlePriceSchema = z.object({
  bundleId: z.string().cuid(),
  sqft: z.number().min(1, "Square footage must be at least 1"),
});

export type CalculateBundlePriceInput = z.infer<typeof calculateBundlePriceSchema>;
