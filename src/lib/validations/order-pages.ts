import { z } from "zod";

// Base order page schema for validation
export const orderPageSchema = z.object({
  name: z
    .string()
    .min(1, "Page name is required")
    .max(100, "Page name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must only contain lowercase letters, numbers, and hyphens"
    ),
  headline: z
    .string()
    .max(200, "Headline must be less than 200 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  subheadline: z
    .string()
    .max(500, "Subheadline must be less than 500 characters")
    .optional()
    .nullable()
    .transform((val) => val || null),
  heroImageUrl: z.string().url().optional().nullable(),
  logoOverrideUrl: z.string().url().optional().nullable(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Primary color must be a valid hex color")
    .optional()
    .nullable()
    .transform((val) => val || null),
  showPhone: z.boolean().default(true),
  showEmail: z.boolean().default(true),
  customPhone: z
    .string()
    .max(20)
    .optional()
    .nullable()
    .transform((val) => val || null),
  customEmail: z
    .string()
    .email()
    .optional()
    .nullable()
    .transform((val) => val || null),
  template: z.string().default("default"),
  metaTitle: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((val) => val || null),
  metaDescription: z
    .string()
    .max(300)
    .optional()
    .nullable()
    .transform((val) => val || null),
  testimonials: z
    .array(
      z.object({
        name: z.string().max(100),
        company: z.string().max(100).optional(),
        quote: z.string().max(500),
        photoUrl: z.string().url().optional().nullable(),
      })
    )
    .max(10, "Maximum 10 testimonials allowed")
    .default([]),
  isPublished: z.boolean().default(false),
  requireLogin: z.boolean().default(false),
  clientId: z.string().cuid().optional().nullable(),
});

// Schema for creating a new order page
export const createOrderPageSchema = orderPageSchema;

// Schema for updating an existing order page
export const updateOrderPageSchema = orderPageSchema.partial().extend({
  id: z.string().cuid(),
});

// Schema for deleting an order page
export const deleteOrderPageSchema = z.object({
  id: z.string().cuid(),
  force: z.boolean().optional().default(false),
});

// Schema for duplicating an order page
export const duplicateOrderPageSchema = z.object({
  id: z.string().cuid(),
  newName: z.string().min(1).max(100).optional(),
  newSlug: z.string().min(1).max(100).optional(),
});

// Schema for adding/removing bundles from an order page
export const orderPageBundlesSchema = z.object({
  orderPageId: z.string().cuid(),
  bundleIds: z.array(z.string().cuid()),
});

// Schema for adding/removing services from an order page
export const orderPageServicesSchema = z.object({
  orderPageId: z.string().cuid(),
  services: z.array(
    z.object({
      serviceId: z.string().cuid(),
      sortOrder: z.number().min(0).default(0),
    })
  ),
});

// Type exports
export type CreateOrderPageInput = z.infer<typeof createOrderPageSchema>;
export type UpdateOrderPageInput = z.infer<typeof updateOrderPageSchema>;
export type DeleteOrderPageInput = z.infer<typeof deleteOrderPageSchema>;
export type DuplicateOrderPageInput = z.infer<typeof duplicateOrderPageSchema>;
export type OrderPageBundlesInput = z.infer<typeof orderPageBundlesSchema>;
export type OrderPageServicesInput = z.infer<typeof orderPageServicesSchema>;

// Order page filters for querying
export const orderPageFiltersSchema = z.object({
  isPublished: z.boolean().optional(),
  clientId: z.string().cuid().optional(),
  search: z.string().optional(),
});

export type OrderPageFilters = z.infer<typeof orderPageFiltersSchema>;

// Testimonial type for convenience
export type Testimonial = {
  name: string;
  company?: string;
  quote: string;
  photoUrl?: string | null;
};
