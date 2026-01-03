/**
 * Stripe Product Sync Helper
 *
 * Automatically syncs Services and ServiceBundles to Stripe Products/Prices.
 * Handles price immutability by archiving old prices and creating new ones.
 */

import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

// ============================================================================
// TYPES
// ============================================================================

export interface SyncResult {
  success: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
  error?: string;
}

interface ServiceData {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  category: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
}

interface BundleData {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  bundleType: string;
  stripeProductId: string | null;
  stripePriceId: string | null;
}

// ============================================================================
// SERVICE SYNC
// ============================================================================

/**
 * Sync a Service to Stripe Product Catalog.
 * Creates product if new, updates if exists.
 * Archives old price and creates new one if price changed.
 */
export async function syncServiceToStripe(
  service: ServiceData,
  organizationId: string
): Promise<SyncResult> {
  const stripe = getStripe();

  try {
    let stripeProductId = service.stripeProductId;
    let stripePriceId = service.stripePriceId;
    let needsNewPrice = false;

    // Check if we need to create or update the product
    if (stripeProductId) {
      // Product exists - update it
      await stripe.products.update(stripeProductId, {
        name: service.name,
        description: service.description || undefined,
        metadata: {
          listinglens_service_id: service.id,
          listinglens_organization_id: organizationId,
          category: service.category,
        },
      });

      // Check if price changed
      if (stripePriceId) {
        const existingPrice = await stripe.prices.retrieve(stripePriceId);
        if (existingPrice.unit_amount !== service.priceCents) {
          needsNewPrice = true;
          // Archive the old price
          await stripe.prices.update(stripePriceId, { active: false });
        }
      } else {
        // No price exists yet
        needsNewPrice = true;
      }
    } else {
      // Create new product
      const product = await stripe.products.create({
        name: service.name,
        description: service.description || undefined,
        default_price_data: {
          currency: "usd",
          unit_amount: service.priceCents,
        },
        metadata: {
          listinglens_service_id: service.id,
          listinglens_organization_id: organizationId,
          category: service.category,
          type: "service",
        },
      });

      stripeProductId = product.id;
      // Get the default price ID from the product
      stripePriceId =
        typeof product.default_price === "string"
          ? product.default_price
          : product.default_price?.id || null;
    }

    // Create new price if needed
    if (needsNewPrice && stripeProductId) {
      const newPrice = await stripe.prices.create({
        product: stripeProductId,
        currency: "usd",
        unit_amount: service.priceCents,
      });
      stripePriceId = newPrice.id;

      // Set as default price on product
      await stripe.products.update(stripeProductId, {
        default_price: stripePriceId,
      });
    }

    // Update local database with Stripe IDs
    await prisma.service.update({
      where: { id: service.id },
      data: {
        stripeProductId,
        stripePriceId,
        stripeSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      stripeProductId: stripeProductId || undefined,
      stripePriceId: stripePriceId || undefined,
    };
  } catch (error) {
    console.error("Error syncing service to Stripe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// BUNDLE SYNC
// ============================================================================

/**
 * Sync a ServiceBundle to Stripe Product Catalog.
 * Creates product if new, updates if exists.
 * Archives old price and creates new one if price changed.
 */
export async function syncBundleToStripe(
  bundle: BundleData,
  organizationId: string
): Promise<SyncResult> {
  const stripe = getStripe();

  try {
    let stripeProductId = bundle.stripeProductId;
    let stripePriceId = bundle.stripePriceId;
    let needsNewPrice = false;

    // Check if we need to create or update the product
    if (stripeProductId) {
      // Product exists - update it
      await stripe.products.update(stripeProductId, {
        name: bundle.name,
        description: bundle.description || undefined,
        metadata: {
          listinglens_bundle_id: bundle.id,
          listinglens_organization_id: organizationId,
          bundle_type: bundle.bundleType,
        },
      });

      // Check if price changed
      if (stripePriceId) {
        const existingPrice = await stripe.prices.retrieve(stripePriceId);
        if (existingPrice.unit_amount !== bundle.priceCents) {
          needsNewPrice = true;
          // Archive the old price
          await stripe.prices.update(stripePriceId, { active: false });
        }
      } else {
        // No price exists yet
        needsNewPrice = true;
      }
    } else {
      // Create new product
      const product = await stripe.products.create({
        name: bundle.name,
        description: bundle.description || undefined,
        default_price_data: {
          currency: "usd",
          unit_amount: bundle.priceCents,
        },
        metadata: {
          listinglens_bundle_id: bundle.id,
          listinglens_organization_id: organizationId,
          bundle_type: bundle.bundleType,
          type: "bundle",
        },
      });

      stripeProductId = product.id;
      // Get the default price ID from the product
      stripePriceId =
        typeof product.default_price === "string"
          ? product.default_price
          : product.default_price?.id || null;
    }

    // Create new price if needed
    if (needsNewPrice && stripeProductId) {
      const newPrice = await stripe.prices.create({
        product: stripeProductId,
        currency: "usd",
        unit_amount: bundle.priceCents,
      });
      stripePriceId = newPrice.id;

      // Set as default price on product
      await stripe.products.update(stripeProductId, {
        default_price: stripePriceId,
      });
    }

    // Update local database with Stripe IDs
    await prisma.serviceBundle.update({
      where: { id: bundle.id },
      data: {
        stripeProductId,
        stripePriceId,
        stripeSyncedAt: new Date(),
      },
    });

    return {
      success: true,
      stripeProductId: stripeProductId || undefined,
      stripePriceId: stripePriceId || undefined,
    };
  } catch (error) {
    console.error("Error syncing bundle to Stripe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// ARCHIVE PRODUCTS
// ============================================================================

/**
 * Archive a Stripe product when service/bundle is deleted or deactivated.
 * Also archives the associated price.
 */
export async function archiveStripeProduct(
  stripeProductId: string | null,
  stripePriceId: string | null
): Promise<SyncResult> {
  if (!stripeProductId) {
    return { success: true }; // Nothing to archive
  }

  const stripe = getStripe();

  try {
    // Archive the price first
    if (stripePriceId) {
      await stripe.prices.update(stripePriceId, { active: false });
    }

    // Archive the product
    await stripe.products.update(stripeProductId, { active: false });

    return { success: true };
  } catch (error) {
    console.error("Error archiving Stripe product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Reactivate a Stripe product when service/bundle is reactivated.
 */
export async function reactivateStripeProduct(
  stripeProductId: string | null,
  stripePriceId: string | null
): Promise<SyncResult> {
  if (!stripeProductId) {
    return { success: true }; // Nothing to reactivate
  }

  const stripe = getStripe();

  try {
    // Reactivate the product
    await stripe.products.update(stripeProductId, { active: true });

    // Reactivate the price
    if (stripePriceId) {
      await stripe.prices.update(stripePriceId, { active: true });
    }

    return { success: true };
  } catch (error) {
    console.error("Error reactivating Stripe product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================================
// BULK SYNC
// ============================================================================

/**
 * Sync all services for an organization to Stripe.
 * Useful for initial migration or fixing sync issues.
 */
export async function syncAllServicesToStripe(
  organizationId: string
): Promise<{ synced: number; failed: number; errors: string[] }> {
  const services = await prisma.service.findMany({
    where: { organizationId, isActive: true },
  });

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const service of services) {
    const result = await syncServiceToStripe(service, organizationId);
    if (result.success) {
      synced++;
    } else {
      failed++;
      errors.push(`Service ${service.name}: ${result.error}`);
    }
  }

  return { synced, failed, errors };
}

/**
 * Sync all bundles for an organization to Stripe.
 * Useful for initial migration or fixing sync issues.
 */
export async function syncAllBundlesToStripe(
  organizationId: string
): Promise<{ synced: number; failed: number; errors: string[] }> {
  const bundles = await prisma.serviceBundle.findMany({
    where: { organizationId, isActive: true },
  });

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const bundle of bundles) {
    const result = await syncBundleToStripe(bundle, organizationId);
    if (result.success) {
      synced++;
    } else {
      failed++;
      errors.push(`Bundle ${bundle.name}: ${result.error}`);
    }
  }

  return { synced, failed, errors };
}

// ============================================================================
// CHECKOUT HELPERS
// ============================================================================

/**
 * Get Stripe line items for checkout from services and bundles.
 * Uses the synced Stripe Price IDs.
 */
export async function getStripeLineItems(
  items: Array<{
    type: "service" | "bundle";
    id: string;
    quantity?: number;
  }>
): Promise<Stripe.Checkout.SessionCreateParams.LineItem[]> {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of items) {
    if (item.type === "service") {
      const service = await prisma.service.findUnique({
        where: { id: item.id },
        select: { stripePriceId: true, name: true, priceCents: true },
      });

      if (!service?.stripePriceId) {
        throw new Error(
          `Service "${service?.name || item.id}" is not synced to Stripe`
        );
      }

      lineItems.push({
        price: service.stripePriceId,
        quantity: item.quantity || 1,
      });
    } else if (item.type === "bundle") {
      const bundle = await prisma.serviceBundle.findUnique({
        where: { id: item.id },
        select: { stripePriceId: true, name: true, priceCents: true },
      });

      if (!bundle?.stripePriceId) {
        throw new Error(
          `Bundle "${bundle?.name || item.id}" is not synced to Stripe`
        );
      }

      lineItems.push({
        price: bundle.stripePriceId,
        quantity: item.quantity || 1,
      });
    }
  }

  return lineItems;
}

/**
 * Check if all items have Stripe Price IDs.
 * Returns list of items that need to be synced.
 */
export async function checkStripeSyncStatus(
  items: Array<{ type: "service" | "bundle"; id: string }>
): Promise<{
  allSynced: boolean;
  unsyncedItems: Array<{ type: string; id: string; name: string }>;
}> {
  const unsyncedItems: Array<{ type: string; id: string; name: string }> = [];

  for (const item of items) {
    if (item.type === "service") {
      const service = await prisma.service.findUnique({
        where: { id: item.id },
        select: { stripePriceId: true, name: true },
      });
      if (!service?.stripePriceId) {
        unsyncedItems.push({
          type: "service",
          id: item.id,
          name: service?.name || "Unknown",
        });
      }
    } else if (item.type === "bundle") {
      const bundle = await prisma.serviceBundle.findUnique({
        where: { id: item.id },
        select: { stripePriceId: true, name: true },
      });
      if (!bundle?.stripePriceId) {
        unsyncedItems.push({
          type: "bundle",
          id: item.id,
          name: bundle?.name || "Unknown",
        });
      }
    }
  }

  return {
    allSynced: unsyncedItems.length === 0,
    unsyncedItems,
  };
}

// ============================================================================
// STATUS & OVERVIEW
// ============================================================================

export interface ProductSyncStatusItem {
  id: string;
  name: string;
  type: "service" | "bundle";
  priceCents: number;
  isSynced: boolean;
  stripeProductId: string | null;
  stripePriceId: string | null;
  lastSyncedAt: Date | null;
}

export interface ProductSyncOverview {
  isConfigured: boolean;
  services: {
    total: number;
    synced: number;
    unsynced: number;
    items: ProductSyncStatusItem[];
  };
  bundles: {
    total: number;
    synced: number;
    unsynced: number;
    items: ProductSyncStatusItem[];
  };
}

/**
 * Get overview of product sync status for an organization.
 * Used to display sync status in developer tools.
 */
export async function getProductSyncOverview(
  organizationId: string
): Promise<ProductSyncOverview> {
  // Check if Stripe is configured
  const isConfigured = !!process.env.STRIPE_SECRET_KEY;

  // Fetch services with sync status
  const services = await prisma.service.findMany({
    where: { organizationId, isActive: true },
    select: {
      id: true,
      name: true,
      priceCents: true,
      stripeProductId: true,
      stripePriceId: true,
      stripeSyncedAt: true,
    },
    orderBy: { name: "asc" },
  });

  // Fetch bundles with sync status
  const bundles = await prisma.serviceBundle.findMany({
    where: { organizationId, isActive: true },
    select: {
      id: true,
      name: true,
      priceCents: true,
      stripeProductId: true,
      stripePriceId: true,
      stripeSyncedAt: true,
    },
    orderBy: { name: "asc" },
  });

  const serviceItems: ProductSyncStatusItem[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    type: "service" as const,
    priceCents: s.priceCents,
    isSynced: !!s.stripeProductId && !!s.stripePriceId,
    stripeProductId: s.stripeProductId,
    stripePriceId: s.stripePriceId,
    lastSyncedAt: s.stripeSyncedAt,
  }));

  const bundleItems: ProductSyncStatusItem[] = bundles.map((b) => ({
    id: b.id,
    name: b.name,
    type: "bundle" as const,
    priceCents: b.priceCents,
    isSynced: !!b.stripeProductId && !!b.stripePriceId,
    stripeProductId: b.stripeProductId,
    stripePriceId: b.stripePriceId,
    lastSyncedAt: b.stripeSyncedAt,
  }));

  const syncedServices = serviceItems.filter((s) => s.isSynced).length;
  const syncedBundles = bundleItems.filter((b) => b.isSynced).length;

  return {
    isConfigured,
    services: {
      total: services.length,
      synced: syncedServices,
      unsynced: services.length - syncedServices,
      items: serviceItems,
    },
    bundles: {
      total: bundles.length,
      synced: syncedBundles,
      unsynced: bundles.length - syncedBundles,
      items: bundleItems,
    },
  };
}
