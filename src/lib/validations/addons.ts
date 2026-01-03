import { z } from "zod";

// Addon trigger enum matching Prisma schema
export const addonTriggerSchema = z.enum([
  "always",
  "with_service",
  "cart_threshold",
]);

export type AddonTriggerEnum = z.infer<typeof addonTriggerSchema>;

// Base addon schema for validation
export const addonSchema = z.object({
  name: z
    .string()
    .min(1, "Addon name is required")
    .max(100, "Addon name must be less than 100 characters"),
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
  imageUrl: z.string().url().optional().nullable(),
  iconName: z
    .string()
    .max(50, "Icon name must be less than 50 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  triggerType: addonTriggerSchema.default("always"),
  triggerValue: z
    .string()
    .max(100, "Trigger value must be less than 100 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  isActive: z.boolean().default(true),
  isOneTime: z.boolean().default(true),
});

// Schema for creating a new addon
export const createAddonSchema = addonSchema;

// Schema for updating an existing addon
export const updateAddonSchema = addonSchema.partial().extend({
  id: z.string().cuid(),
});

// Schema for deleting an addon
export const deleteAddonSchema = z.object({
  id: z.string().cuid(),
  force: z.boolean().optional().default(false),
});

// Schema for setting addon compatibility with services
export const addonCompatibilitySchema = z.object({
  addonId: z.string().cuid(),
  serviceIds: z.array(z.string().cuid()),
});

// Type exports
export type CreateAddonInput = z.infer<typeof createAddonSchema>;
export type UpdateAddonInput = z.infer<typeof updateAddonSchema>;
export type DeleteAddonInput = z.infer<typeof deleteAddonSchema>;
export type AddonCompatibilityInput = z.infer<typeof addonCompatibilitySchema>;

// Addon filters for querying
export const addonFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  triggerType: addonTriggerSchema.optional(),
  search: z.string().optional(),
});

export type AddonFilters = z.infer<typeof addonFiltersSchema>;
