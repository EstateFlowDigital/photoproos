import { z } from "zod";

// Cart item schemas
export const cartBundleSchema = z.object({
  type: z.literal("bundle"),
  id: z.string().cuid(),
  name: z.string(),
  priceCents: z.number().int().min(0),
  // Sqft pricing fields (optional, only for sqft-based bundles)
  sqft: z.number().int().min(1).optional(),
  pricingTierId: z.string().cuid().optional(),
  pricingTierName: z.string().optional().nullable(),
});

export const cartServiceSchema = z.object({
  type: z.literal("service"),
  id: z.string().cuid(),
  name: z.string(),
  priceCents: z.number().int().min(0),
  quantity: z.number().int().min(1),
});

export const cartItemSchema = z.discriminatedUnion("type", [
  cartBundleSchema,
  cartServiceSchema,
]);

// Order creation schema
export const createOrderSchema = z.object({
  orderPageId: z.string().cuid(),
  items: z.array(cartItemSchema).min(1, "At least one item is required"),

  // Client info (for guest checkout)
  clientName: z.string().min(1, "Name is required").max(100),
  clientEmail: z.string().email("Valid email is required"),
  clientPhone: z.string().max(20).optional().nullable(),
  clientCompany: z.string().max(100).optional().nullable(),

  // Location/scheduling (optional at order creation)
  locationNotes: z.string().max(500).optional().nullable(),
  preferredDate: z.string().datetime().optional().nullable(),
  preferredTime: z.enum(["morning", "afternoon", "evening"]).optional().nullable(),
  flexibleDates: z.boolean().default(true),

  // Notes
  clientNotes: z.string().max(2000).optional().nullable(),

  // Tracking
  source: z.string().max(50).optional().nullable(),
  medium: z.string().max(50).optional().nullable(),
  campaign: z.string().max(50).optional().nullable(),
});

// Order update schema
export const updateOrderSchema = z.object({
  id: z.string().cuid(),
  clientName: z.string().min(1).max(100).optional(),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().max(20).optional().nullable(),
  clientCompany: z.string().max(100).optional().nullable(),
  locationNotes: z.string().max(500).optional().nullable(),
  preferredDate: z.string().datetime().optional().nullable(),
  preferredTime: z.enum(["morning", "afternoon", "evening"]).optional().nullable(),
  flexibleDates: z.boolean().optional(),
  clientNotes: z.string().max(2000).optional().nullable(),
  internalNotes: z.string().max(2000).optional().nullable(),
  status: z.enum(["cart", "pending", "paid", "processing", "completed", "cancelled"]).optional(),
});

// Order filters for querying
export const orderFiltersSchema = z.object({
  status: z.enum(["cart", "pending", "paid", "processing", "completed", "cancelled"]).optional(),
  orderPageId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  search: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

// Type exports
export type CartBundle = z.infer<typeof cartBundleSchema>;
export type CartService = z.infer<typeof cartServiceSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderFilters = z.infer<typeof orderFiltersSchema>;
