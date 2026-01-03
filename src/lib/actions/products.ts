"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import {
  attachPhotoSchema,
  createCatalogSchema,
  createProductSchema,
  type AttachPhotoInput,
  type CreateCatalogInput,
  type CreateProductInput,
} from "@/lib/validations/products";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function listProductCatalogs() {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  const catalogs = await prisma.productCatalog.findMany({
    where: { organizationId },
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return catalogs;
}

export async function getProductCatalog(catalogId: string) {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  const catalog = await prisma.productCatalog.findFirst({
    where: { id: catalogId, organizationId },
    include: {
      products: {
        orderBy: { updatedAt: "desc" },
        include: {
          variants: true,
          photos: {
            include: {
              asset: {
                select: {
                  id: true,
                  filename: true,
                  originalUrl: true,
                  thumbnailUrl: true,
                  mediumUrl: true,
                  watermarkedUrl: true,
                },
              },
              variant: true,
            },
          },
        },
      },
    },
  });

  return catalog;
}

export async function createProductCatalog(input: CreateCatalogInput): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();
    const data = createCatalogSchema.parse(input);

    const catalog = await prisma.productCatalog.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description || null,
        tags: data.tags || [],
      },
    });

    revalidatePath("/products");
    return { success: true, data: { id: catalog.id } };
  } catch (error) {
    console.error("[Products] create catalog error:", error);
    return { success: false, error: "Failed to create catalog" };
  }
}

export async function createProduct(input: CreateProductInput): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();
    const data = createProductSchema.parse(input);

    // Verify catalog belongs to org
    const catalog = await prisma.productCatalog.findFirst({
      where: { id: data.catalogId, organizationId },
      select: { id: true },
    });

    if (!catalog) {
      return { success: false, error: "Catalog not found" };
    }

    const product = await prisma.productItem.create({
      data: {
        catalogId: data.catalogId,
        sku: data.sku,
        name: data.name,
        category: data.category || null,
        angles: data.angles || [],
        status: data.status || "pending",
        notes: data.notes || null,
      },
    });

    revalidatePath(`/products/${data.catalogId}`);
    return { success: true, data: { id: product.id } };
  } catch (error) {
    console.error("[Products] create product error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function attachPhotoToProduct(input: AttachPhotoInput): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();
    const data = attachPhotoSchema.parse(input);

    // Verify product belongs to org
    const product = await prisma.productItem.findFirst({
      where: { id: data.productId, catalog: { organizationId } },
      select: { id: true, catalogId: true },
    });
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Verify asset belongs to org (via project)
    const asset = await prisma.asset.findFirst({
      where: {
        id: data.assetId,
        project: { organizationId },
      },
      select: { id: true },
    });
    if (!asset) {
      return { success: false, error: "Asset not found" };
    }

    // If variant is provided, validate it
    if (data.variantId) {
      const variant = await prisma.productVariant.findFirst({
        where: {
          id: data.variantId,
          product: {
            catalog: { organizationId },
          },
        },
        select: { id: true },
      });
      if (!variant) {
        return { success: false, error: "Variant not found" };
      }
    }

    const photo = await prisma.productPhoto.create({
      data: {
        productId: data.productId,
        variantId: data.variantId,
        assetId: data.assetId,
        angle: data.angle,
        isPrimary: data.isPrimary ?? false,
      },
    });

    if (data.isPrimary) {
      // Reset other primaries for the product
      await prisma.productPhoto.updateMany({
        where: {
          productId: data.productId,
          id: { not: photo.id },
        },
        data: { isPrimary: false },
      });
    }

    revalidatePath(`/products/${product.catalogId}`);
    return { success: true, data: { id: photo.id } };
  } catch (error) {
    console.error("[Products] attach photo error:", error);
    return { success: false, error: "Failed to attach photo" };
  }
}

export async function updateProductStatus(productId: string, status: "pending" | "shot" | "edited" | "approved" | "delivered" | "archived"): Promise<ActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify product ownership
    const product = await prisma.productItem.findFirst({
      where: { id: productId, catalog: { organizationId } },
      select: { catalogId: true },
    });
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    await prisma.productItem.update({
      where: { id: productId },
      data: { status },
    });

    revalidatePath(`/products/${product.catalogId}`);
    return { success: true };
  } catch (error) {
    console.error("[Products] update status error:", error);
    return { success: false, error: "Failed to update product" };
  }
}
