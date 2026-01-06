"use server";

import { ok, fail, type VoidActionResult } from "@/lib/types/action-result";

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
): Promise<VoidActionResult> {
  const { userId, orgId } = await auth();
  if (!userId || !orgId) {
    return fail("Not authenticated");
  }

  const organization = await prisma.organization.findUnique({
    where: { clerkOrganizationId: orgId },
    select: { id: true },
  });

  if (!organization) {
    return fail("Organization not found");
  }

  try {
    if (productType === "service") {
      const service = await prisma.service.findFirst({
        where: { id: productId, organizationId: organization.id },
      });

      if (!service) {
        return fail("Service not found");
      }

      const result = await syncServiceToStripe(service, organization.id);
      if (result.success) {
        return ok();
      }
      return fail(result.error || "Failed to sync service");
    } else {
      const bundle = await prisma.serviceBundle.findFirst({
        where: { id: productId, organizationId: organization.id },
      });

      if (!bundle) {
        return fail("Bundle not found");
      }

      const result = await syncBundleToStripe(bundle, organization.id);
      if (result.success) {
        return ok();
      }
      return fail(result.error || "Failed to sync bundle");
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to sync product");
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
