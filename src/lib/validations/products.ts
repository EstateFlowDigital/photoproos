import { z } from "zod";

export const createCatalogSchema = z.object({
  name: z.string().min(1),
  description: z.string().max(500).optional().nullable(),
  tags: z.array(z.string().trim()).optional().default([]),
});

export const createProductSchema = z.object({
  catalogId: z.string().cuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  category: z.string().optional().nullable(),
  angles: z.array(z.string().trim()).default([]),
  status: z.enum(["pending", "shot", "edited", "approved", "delivered", "archived"]).optional(),
  notes: z.string().optional().nullable(),
});

export const attachPhotoSchema = z.object({
  productId: z.string().cuid(),
  assetId: z.string().cuid(),
  variantId: z.string().cuid().optional(),
  angle: z.string().min(1),
  isPrimary: z.boolean().optional(),
});

export type CreateCatalogInput = z.infer<typeof createCatalogSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type AttachPhotoInput = z.infer<typeof attachPhotoSchema>;
