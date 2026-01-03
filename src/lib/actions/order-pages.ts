"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  createOrderPageSchema,
  updateOrderPageSchema,
  deleteOrderPageSchema,
  duplicateOrderPageSchema,
  orderPageBundlesSchema,
  orderPageServicesSchema,
  type CreateOrderPageInput,
  type UpdateOrderPageInput,
  type OrderPageFilters,
  type OrderPageBundlesInput,
  type OrderPageServicesInput,
  type Testimonial,
} from "@/lib/validations/order-pages";
import { requireOrganizationId } from "./auth-helper";

// Result type for server actions
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Helper to get organization ID from auth context
async function getOrganizationId(): Promise<string> {
  return requireOrganizationId();
}

/**
 * Create a new order page
 */
export async function createOrderPage(
  input: CreateOrderPageInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = createOrderPageSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Check for duplicate slug within organization
    const existingSlug = await prisma.orderPage.findFirst({
      where: {
        organizationId,
        slug: validated.slug,
      },
    });

    if (existingSlug) {
      return { success: false, error: "An order page with this slug already exists" };
    }

    const orderPage = await prisma.orderPage.create({
      data: {
        organizationId,
        name: validated.name,
        slug: validated.slug,
        headline: validated.headline,
        subheadline: validated.subheadline,
        heroImageUrl: validated.heroImageUrl,
        logoOverrideUrl: validated.logoOverrideUrl,
        primaryColor: validated.primaryColor,
        showPhone: validated.showPhone,
        showEmail: validated.showEmail,
        customPhone: validated.customPhone,
        customEmail: validated.customEmail,
        template: validated.template,
        metaTitle: validated.metaTitle,
        metaDescription: validated.metaDescription,
        testimonials: validated.testimonials as unknown as Testimonial[],
        isPublished: validated.isPublished,
        requireLogin: validated.requireLogin,
        clientId: validated.clientId,
      },
    });

    revalidatePath("/order-pages");

    return { success: true, data: { id: orderPage.id } };
  } catch (error) {
    console.error("Error creating order page:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create order page" };
  }
}

/**
 * Update an existing order page
 */
export async function updateOrderPage(
  input: UpdateOrderPageInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const validated = updateOrderPageSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify order page exists and belongs to organization
    const existing = await prisma.orderPage.findFirst({
      where: {
        id: validated.id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Order page not found" };
    }

    // Check for duplicate slug if slug is being changed
    if (validated.slug && validated.slug !== existing.slug) {
      const existingSlug = await prisma.orderPage.findFirst({
        where: {
          organizationId,
          slug: validated.slug,
          id: { not: validated.id },
        },
      });

      if (existingSlug) {
        return { success: false, error: "An order page with this slug already exists" };
      }
    }

    const { id, ...updateData } = validated;

    const orderPage = await prisma.orderPage.update({
      where: { id },
      data: {
        ...(updateData.name && { name: updateData.name }),
        ...(updateData.slug && { slug: updateData.slug }),
        ...(updateData.headline !== undefined && { headline: updateData.headline }),
        ...(updateData.subheadline !== undefined && { subheadline: updateData.subheadline }),
        ...(updateData.heroImageUrl !== undefined && { heroImageUrl: updateData.heroImageUrl }),
        ...(updateData.logoOverrideUrl !== undefined && { logoOverrideUrl: updateData.logoOverrideUrl }),
        ...(updateData.primaryColor !== undefined && { primaryColor: updateData.primaryColor }),
        ...(updateData.showPhone !== undefined && { showPhone: updateData.showPhone }),
        ...(updateData.showEmail !== undefined && { showEmail: updateData.showEmail }),
        ...(updateData.customPhone !== undefined && { customPhone: updateData.customPhone }),
        ...(updateData.customEmail !== undefined && { customEmail: updateData.customEmail }),
        ...(updateData.template !== undefined && { template: updateData.template }),
        ...(updateData.metaTitle !== undefined && { metaTitle: updateData.metaTitle }),
        ...(updateData.metaDescription !== undefined && { metaDescription: updateData.metaDescription }),
        ...(updateData.testimonials !== undefined && { testimonials: updateData.testimonials as unknown as Testimonial[] }),
        ...(updateData.isPublished !== undefined && { isPublished: updateData.isPublished }),
        ...(updateData.requireLogin !== undefined && { requireLogin: updateData.requireLogin }),
        ...(updateData.clientId !== undefined && { clientId: updateData.clientId }),
      },
    });

    revalidatePath("/order-pages");
    revalidatePath(`/order-pages/${id}`);

    return { success: true, data: { id: orderPage.id } };
  } catch (error) {
    console.error("Error updating order page:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to update order page" };
  }
}

/**
 * Delete an order page
 */
export async function deleteOrderPage(
  id: string,
  force: boolean = false
): Promise<ActionResult> {
  try {
    deleteOrderPageSchema.parse({ id, force });
    const organizationId = await getOrganizationId();

    // Verify order page exists and belongs to organization
    const existing = await prisma.orderPage.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!existing) {
      return { success: false, error: "Order page not found" };
    }

    if (existing._count.orders > 0 && !force) {
      // Archive instead of delete if has orders
      await prisma.orderPage.update({
        where: { id },
        data: { isPublished: false },
      });

      revalidatePath("/order-pages");
      return { success: true, data: undefined };
    }

    // Actually delete if no orders or force is true
    await prisma.orderPage.delete({
      where: { id },
    });

    revalidatePath("/order-pages");

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting order page:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to delete order page" };
  }
}

/**
 * Duplicate an order page
 */
export async function duplicateOrderPage(
  id: string,
  newName?: string,
  newSlug?: string
): Promise<ActionResult<{ id: string }>> {
  try {
    duplicateOrderPageSchema.parse({ id, newName, newSlug });
    const organizationId = await getOrganizationId();

    // Get original order page
    const original = await prisma.orderPage.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        bundles: true,
        services: true,
      },
    });

    if (!original) {
      return { success: false, error: "Order page not found" };
    }

    // Generate unique slug
    let slug = newSlug || `${original.slug}-copy`;
    let counter = 1;
    while (true) {
      const exists = await prisma.orderPage.findFirst({
        where: { organizationId, slug },
      });
      if (!exists) break;
      slug = `${newSlug || original.slug}-copy-${counter}`;
      counter++;
    }

    // Create duplicate
    const duplicate = await prisma.orderPage.create({
      data: {
        organizationId,
        name: newName || `${original.name} (Copy)`,
        slug,
        headline: original.headline,
        subheadline: original.subheadline,
        heroImageUrl: original.heroImageUrl,
        logoOverrideUrl: original.logoOverrideUrl,
        primaryColor: original.primaryColor,
        showPhone: original.showPhone,
        showEmail: original.showEmail,
        customPhone: original.customPhone,
        customEmail: original.customEmail,
        template: original.template,
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription,
        testimonials: original.testimonials as unknown as Testimonial[],
        isPublished: false, // Start as unpublished
        requireLogin: original.requireLogin,
        clientId: original.clientId,
      },
    });

    // Duplicate bundle associations
    if (original.bundles.length > 0) {
      await prisma.orderPageBundle.createMany({
        data: original.bundles.map((b) => ({
          orderPageId: duplicate.id,
          bundleId: b.bundleId,
          sortOrder: b.sortOrder,
        })),
      });
    }

    // Duplicate service associations
    if (original.services.length > 0) {
      await prisma.orderPageService.createMany({
        data: original.services.map((s) => ({
          orderPageId: duplicate.id,
          serviceId: s.serviceId,
          sortOrder: s.sortOrder,
        })),
      });
    }

    revalidatePath("/order-pages");

    return { success: true, data: { id: duplicate.id } };
  } catch (error) {
    console.error("Error duplicating order page:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to duplicate order page" };
  }
}

/**
 * Toggle order page published status
 */
export async function toggleOrderPageStatus(
  id: string
): Promise<ActionResult<{ isPublished: boolean }>> {
  try {
    const organizationId = await getOrganizationId();

    const existing = await prisma.orderPage.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existing) {
      return { success: false, error: "Order page not found" };
    }

    const updated = await prisma.orderPage.update({
      where: { id },
      data: { isPublished: !existing.isPublished },
    });

    revalidatePath("/order-pages");
    revalidatePath(`/order-pages/${id}`);

    return { success: true, data: { isPublished: updated.isPublished } };
  } catch (error) {
    console.error("Error toggling order page status:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to toggle order page status" };
  }
}

/**
 * Set bundles for an order page (replaces all existing)
 */
export async function setOrderPageBundles(
  input: OrderPageBundlesInput
): Promise<ActionResult<{ count: number }>> {
  try {
    const validated = orderPageBundlesSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify order page exists and belongs to organization
    const orderPage = await prisma.orderPage.findFirst({
      where: {
        id: validated.orderPageId,
        organizationId,
      },
    });

    if (!orderPage) {
      return { success: false, error: "Order page not found" };
    }

    // Verify all bundles exist and belong to organization
    const bundles = await prisma.serviceBundle.findMany({
      where: {
        id: { in: validated.bundleIds },
        organizationId,
      },
    });

    if (bundles.length !== validated.bundleIds.length) {
      return { success: false, error: "One or more bundles not found" };
    }

    // Replace all bundle associations
    await prisma.$transaction([
      // Delete existing
      prisma.orderPageBundle.deleteMany({
        where: { orderPageId: validated.orderPageId },
      }),
      // Create new
      prisma.orderPageBundle.createMany({
        data: validated.bundleIds.map((bundleId, index) => ({
          orderPageId: validated.orderPageId,
          bundleId,
          sortOrder: index,
        })),
      }),
    ]);

    revalidatePath("/order-pages");
    revalidatePath(`/order-pages/${validated.orderPageId}`);

    return { success: true, data: { count: validated.bundleIds.length } };
  } catch (error) {
    console.error("Error setting order page bundles:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to set order page bundles" };
  }
}

/**
 * Set services for an order page (replaces all existing)
 */
export async function setOrderPageServices(
  input: OrderPageServicesInput
): Promise<ActionResult<{ count: number }>> {
  try {
    const validated = orderPageServicesSchema.parse(input);
    const organizationId = await getOrganizationId();

    // Verify order page exists and belongs to organization
    const orderPage = await prisma.orderPage.findFirst({
      where: {
        id: validated.orderPageId,
        organizationId,
      },
    });

    if (!orderPage) {
      return { success: false, error: "Order page not found" };
    }

    // Verify all services exist and belong to organization
    const serviceIds = validated.services.map((s) => s.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        organizationId,
      },
    });

    if (services.length !== serviceIds.length) {
      return { success: false, error: "One or more services not found" };
    }

    // Replace all service associations
    await prisma.$transaction([
      // Delete existing
      prisma.orderPageService.deleteMany({
        where: { orderPageId: validated.orderPageId },
      }),
      // Create new
      prisma.orderPageService.createMany({
        data: validated.services.map((s, index) => ({
          orderPageId: validated.orderPageId,
          serviceId: s.serviceId,
          sortOrder: s.sortOrder ?? index,
        })),
      }),
    ]);

    revalidatePath("/order-pages");
    revalidatePath(`/order-pages/${validated.orderPageId}`);

    return { success: true, data: { count: validated.services.length } };
  } catch (error) {
    console.error("Error setting order page services:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to set order page services" };
  }
}

/**
 * Get all order pages for the organization
 */
export async function getOrderPages(filters?: OrderPageFilters) {
  try {
    const organizationId = await getOrganizationId();

    const orderPages = await prisma.orderPage.findMany({
      where: {
        organizationId,
        ...(filters?.isPublished !== undefined && { isPublished: filters.isPublished }),
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { headline: { contains: filters.search, mode: "insensitive" } },
            { slug: { contains: filters.search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
          },
        },
        bundles: {
          include: {
            bundle: {
              select: {
                id: true,
                name: true,
                priceCents: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        services: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
                priceCents: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    return orderPages.map((page) => ({
      id: page.id,
      name: page.name,
      slug: page.slug,
      headline: page.headline,
      subheadline: page.subheadline,
      heroImageUrl: page.heroImageUrl,
      logoOverrideUrl: page.logoOverrideUrl,
      primaryColor: page.primaryColor,
      isPublished: page.isPublished,
      isActive: page.isPublished, // Alias for backward compatibility
      client: page.client ? { id: page.client.id, name: page.client.fullName } : null,
      bundleCount: page.bundles.length,
      serviceCount: page.services.length,
      orderCount: page._count.orders,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching order pages:", error);
    return [];
  }
}

/**
 * Get a single order page by ID
 */
export async function getOrderPage(id: string) {
  try {
    const organizationId = await getOrganizationId();

    const orderPage = await prisma.orderPage.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        client: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        bundles: {
          include: {
            bundle: {
              include: {
                services: {
                  include: {
                    service: true,
                  },
                },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        services: {
          include: {
            service: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!orderPage) {
      return null;
    }

    return {
      id: orderPage.id,
      name: orderPage.name,
      slug: orderPage.slug,
      headline: orderPage.headline,
      subheadline: orderPage.subheadline,
      heroImageUrl: orderPage.heroImageUrl,
      logoOverrideUrl: orderPage.logoOverrideUrl,
      primaryColor: orderPage.primaryColor,
      showPhone: orderPage.showPhone,
      showEmail: orderPage.showEmail,
      customPhone: orderPage.customPhone,
      customEmail: orderPage.customEmail,
      template: orderPage.template,
      metaTitle: orderPage.metaTitle,
      metaDescription: orderPage.metaDescription,
      testimonials: orderPage.testimonials as Testimonial[],
      isPublished: orderPage.isPublished,
      isActive: orderPage.isPublished, // Alias for backward compatibility
      requireLogin: orderPage.requireLogin,
      client: orderPage.client ? { id: orderPage.client.id, name: orderPage.client.fullName, email: orderPage.client.email } : null,
      bundles: orderPage.bundles.map((b: { id: string; bundleId: string; sortOrder: number; bundle: { name: string; priceCents: number } }) => ({
        id: b.id,
        bundleId: b.bundleId,
        bundleName: b.bundle.name,
        bundlePriceCents: b.bundle.priceCents,
        sortOrder: b.sortOrder,
      })),
      services: orderPage.services.map((s: { id: string; serviceId: string; sortOrder: number; service: { name: string; priceCents: number } }) => ({
        id: s.id,
        serviceId: s.serviceId,
        serviceName: s.service.name,
        servicePriceCents: s.service.priceCents,
        sortOrder: s.sortOrder,
      })),
      orderCount: orderPage._count.orders,
      viewCount: orderPage.viewCount,
      createdAt: orderPage.createdAt,
      updatedAt: orderPage.updatedAt,
    };
  } catch (error) {
    console.error("Error fetching order page:", error);
    return null;
  }
}

/**
 * Get an order page by slug (for public access)
 */
export async function getOrderPageBySlug(slug: string, orgSlug?: string) {
  try {
    const whereClause: {
      slug: string;
      isPublished: boolean;
      organization?: { slug: string };
    } = {
      slug,
      isPublished: true,
    };

    if (orgSlug) {
      whereClause.organization = { slug: orgSlug };
    }

    const orderPage = await prisma.orderPage.findFirst({
      where: whereClause,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            primaryColor: true,
          },
        },
        bundles: {
          include: {
            bundle: {
              where: { isActive: true },
              include: {
                services: {
                  include: {
                    service: {
                      select: {
                        id: true,
                        name: true,
                        description: true,
                        priceCents: true,
                        duration: true,
                        deliverables: true,
                      },
                    },
                  },
                  orderBy: { sortOrder: "asc" },
                },
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        services: {
          include: {
            service: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                description: true,
                priceCents: true,
                duration: true,
                deliverables: true,
                category: true,
              },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!orderPage) {
      return null;
    }

    // Increment view count
    await prisma.orderPage.update({
      where: { id: orderPage.id },
      data: { viewCount: { increment: 1 } },
    });

    return {
      id: orderPage.id,
      name: orderPage.name,
      slug: orderPage.slug,
      headline: orderPage.headline,
      subheadline: orderPage.subheadline,
      heroImageUrl: orderPage.heroImageUrl,
      logoOverrideUrl: orderPage.logoOverrideUrl || orderPage.organization.logo,
      primaryColor: orderPage.primaryColor || orderPage.organization.primaryColor,
      showPhone: orderPage.showPhone,
      showEmail: orderPage.showEmail,
      customPhone: orderPage.customPhone,
      customEmail: orderPage.customEmail,
      testimonials: orderPage.testimonials as Testimonial[],
      organization: {
        id: orderPage.organization.id,
        name: orderPage.organization.name,
        slug: orderPage.organization.slug,
      },
      bundles: orderPage.bundles
        .filter((b) => b.bundle)
        .map((b) => ({
          id: b.bundle.id,
          name: b.bundle.name,
          description: b.bundle.description,
          priceCents: b.bundle.priceCents,
          imageUrl: b.bundle.imageUrl,
          badgeText: b.bundle.badgeText,
          originalPriceCents: b.bundle.originalPriceCents,
          savingsPercent: b.bundle.savingsPercent,
          services: b.bundle.services.map((s) => ({
            id: s.service.id,
            name: s.service.name,
            description: s.service.description,
            quantity: s.quantity,
            isRequired: s.isRequired,
          })),
        })),
      services: orderPage.services
        .filter((s) => s.service)
        .map((s) => ({
          id: s.service.id,
          name: s.service.name,
          description: s.service.description,
          priceCents: s.service.priceCents,
          duration: s.service.duration,
          deliverables: s.service.deliverables,
          category: s.service.category,
        })),
    };
  } catch (error) {
    console.error("Error fetching order page by slug:", error);
    return null;
  }
}
