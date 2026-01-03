"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import {
  syncAllServicesToStripe,
  syncAllBundlesToStripe,
  syncServiceToStripe,
  syncBundleToStripe,
  getProductSyncOverview,
  type ProductSyncOverview,
} from "@/lib/stripe/product-sync";

/**
 * Sync all services and bundles to Stripe (server action wrapper)
 */
export async function syncProductsToStripe() {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    throw new Error("Not authenticated");
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  const [servicesResult, bundlesResult] = await Promise.all([
    syncAllServicesToStripe(organization.id),
    syncAllBundlesToStripe(organization.id),
  ]);

  return {
    services: servicesResult,
    bundles: bundlesResult,
  };
}

/**
 * Sync a single product (service or bundle) to Stripe
 */
export async function syncSingleProductToStripe(
  productId: string,
  productType: "service" | "bundle"
): Promise<{ success: boolean; error?: string }> {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return { success: false, error: "Not authenticated" };
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  if (!organization) {
    return { success: false, error: "Organization not found" };
  }

  try {
    if (productType === "service") {
      const service = await prisma.service.findFirst({
        where: { id: productId, organizationId: organization.id },
      });

      if (!service) {
        return { success: false, error: "Service not found" };
      }

      const result = await syncServiceToStripe(service, organization.id);
      return { success: result.success, error: result.error };
    } else {
      const bundle = await prisma.serviceBundle.findFirst({
        where: { id: productId, organizationId: organization.id },
      });

      if (!bundle) {
        return { success: false, error: "Bundle not found" };
      }

      const result = await syncBundleToStripe(bundle, organization.id);
      return { success: result.success, error: result.error };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sync product",
    };
  }
}

/**
 * Refresh the sync overview (server action wrapper)
 */
export async function refreshSyncOverview(): Promise<ProductSyncOverview> {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    throw new Error("Not authenticated");
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  if (!organization) {
    throw new Error("Organization not found");
  }

  return getProductSyncOverview(organization.id);
}
