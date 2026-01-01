import { z } from "zod";

// Service category enum matching Prisma schema
export const serviceCategorySchema = z.enum([
  "real_estate",
  "portrait",
  "event",
  "commercial",
  "wedding",
  "product",
  "other",
]);

export type ServiceCategoryEnum = z.infer<typeof serviceCategorySchema>;

// Base service schema for validation
export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, "Service name is required")
    .max(100, "Service name must be less than 100 characters"),
  category: serviceCategorySchema,
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  priceCents: z
    .number()
    .min(0, "Price must be a positive number")
    .max(100000000, "Price is too high"), // Max $1M
  duration: z
    .string()
    .max(50, "Duration must be less than 50 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  deliverables: z
    .array(z.string().max(100, "Each deliverable must be less than 100 characters"))
    .max(20, "Maximum 20 deliverables allowed")
    .default([]),
  isActive: z.boolean().default(true),
});

// Schema for creating a new service
export const createServiceSchema = serviceSchema;

// Schema for updating an existing service
export const updateServiceSchema = serviceSchema.partial().extend({
  id: z.string().cuid(),
});

// Schema for deleting a service
export const deleteServiceSchema = z.object({
  id: z.string().cuid(),
  force: z.boolean().optional().default(false), // Force delete even if in use
});

// Schema for duplicating a service
export const duplicateServiceSchema = z.object({
  id: z.string().cuid(),
  newName: z.string().min(1).max(100).optional(),
});

// Schema for bulk operations
export const bulkUpdatePricesSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().cuid(),
      priceCents: z.number().min(0).max(100000000),
    })
  ),
});

export const bulkArchiveSchema = z.object({
  ids: z.array(z.string().cuid()),
  archive: z.boolean(), // true = archive, false = restore
});

// Type exports
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type DeleteServiceInput = z.infer<typeof deleteServiceSchema>;
export type DuplicateServiceInput = z.infer<typeof duplicateServiceSchema>;
export type BulkUpdatePricesInput = z.infer<typeof bulkUpdatePricesSchema>;
export type BulkArchiveInput = z.infer<typeof bulkArchiveSchema>;

// Service filters for querying
export const serviceFiltersSchema = z.object({
  category: serviceCategorySchema.optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  search: z.string().optional(),
});

export type ServiceFilters = z.infer<typeof serviceFiltersSchema>;
