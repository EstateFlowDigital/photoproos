"use server";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { revalidatePath } from "next/cache";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function getUniqueSlug(base: string) {
  let slug = base || "portfolio";
  let counter = 1;

  while (await prisma.portfolioWebsite.findUnique({ where: { slug } })) {
    slug = `${base}-${counter}`;
    counter += 1;
  }

  return slug;
}

export async function getPortfolioWebsites() {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  return prisma.portfolioWebsite.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { projects: true },
      },
    },
  });
}

export async function createPortfolioWebsite(data: {
  name: string;
  slug?: string;
  description?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const baseSlug = slugify(data.slug || data.name);
    const slug = await getUniqueSlug(baseSlug);

    const website = await prisma.portfolioWebsite.create({
      data: {
        organizationId,
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        heroTitle: data.name.trim(),
        heroSubtitle: data.description?.trim() || null,
      },
    });

    revalidatePath("/portfolios");
    return { success: true, id: website.id };
  } catch (error) {
    console.error("Error creating portfolio website:", error);
    return { success: false, error: "Failed to create portfolio website" };
  }
}

export async function getPortfolioWebsite(id: string) {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  const website = await prisma.portfolioWebsite.findFirst({
    where: { id, organizationId },
    include: {
      projects: {
        orderBy: { position: "asc" },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              coverImageUrl: true,
              status: true,
              client: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!website) return null;

  const availableProjects = await prisma.project.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      coverImageUrl: true,
      client: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  });

  return { website, availableProjects };
}

export async function updatePortfolioWebsite(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string | null;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    logoUrl?: string | null;
    primaryColor?: string | null;
    accentColor?: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id, organizationId },
    });

    if (!website) {
      return { success: false, error: "Portfolio website not found" };
    }

    let slug = website.slug;
    if (data.slug && data.slug !== website.slug) {
      slug = await getUniqueSlug(slugify(data.slug));
    }

    await prisma.portfolioWebsite.update({
      where: { id },
      data: {
        name: data.name?.trim() || website.name,
        slug,
        description: data.description ?? website.description,
        heroTitle: data.heroTitle ?? website.heroTitle,
        heroSubtitle: data.heroSubtitle ?? website.heroSubtitle,
        logoUrl: data.logoUrl ?? website.logoUrl,
        primaryColor: data.primaryColor ?? website.primaryColor,
        accentColor: data.accentColor ?? website.accentColor,
      },
    });

    revalidatePath("/portfolios");
    revalidatePath(`/portfolios/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating portfolio website:", error);
    return { success: false, error: "Failed to update portfolio website" };
  }
}

export async function updatePortfolioWebsiteProjects(
  id: string,
  projectIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id, organizationId },
    });

    if (!website) {
      return { success: false, error: "Portfolio website not found" };
    }

    const validProjectIds = projectIds.filter(Boolean);

    await prisma.$transaction(async (tx) => {
      await tx.portfolioWebsiteProject.deleteMany({
        where: {
          portfolioWebsiteId: id,
          projectId: validProjectIds.length ? { notIn: validProjectIds } : undefined,
        },
      });

      for (const [index, projectId] of validProjectIds.entries()) {
        await tx.portfolioWebsiteProject.upsert({
          where: {
            portfolioWebsiteId_projectId: {
              portfolioWebsiteId: id,
              projectId,
            },
          },
          create: {
            portfolioWebsiteId: id,
            projectId,
            position: index,
          },
          update: {
            position: index,
          },
        });
      }
    });

    revalidatePath(`/portfolios/${id}`);
    revalidatePath(`/portfolios`);
    return { success: true };
  } catch (error) {
    console.error("Error updating portfolio projects:", error);
    return { success: false, error: "Failed to update portfolio projects" };
  }
}

export async function publishPortfolioWebsite(
  id: string,
  publish: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id, organizationId },
    });

    if (!website) {
      return { success: false, error: "Portfolio website not found" };
    }

    await prisma.portfolioWebsite.update({
      where: { id },
      data: {
        isPublished: publish,
        publishedAt: publish ? new Date() : null,
      },
    });

    revalidatePath(`/portfolios/${id}`);
    revalidatePath(`/portfolio/${website.slug}`);
    return { success: true };
  } catch (error) {
    console.error("Error publishing portfolio website:", error);
    return { success: false, error: "Failed to update publish status" };
  }
}

export async function deletePortfolioWebsite(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id, organizationId },
    });

    if (!website) {
      return { success: false, error: "Portfolio website not found" };
    }

    await prisma.portfolioWebsite.delete({ where: { id } });
    revalidatePath("/portfolios");
    return { success: true };
  } catch (error) {
    console.error("Error deleting portfolio website:", error);
    return { success: false, error: "Failed to delete portfolio website" };
  }
}

export async function getPortfolioWebsiteBySlug(slug: string) {
  const website = await prisma.portfolioWebsite.findUnique({
    where: { slug },
    include: {
      organization: {
        select: {
          name: true,
          publicEmail: true,
          publicPhone: true,
          website: true,
          logoUrl: true,
          primaryColor: true,
        },
      },
      projects: {
        orderBy: { position: "asc" },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              description: true,
              coverImageUrl: true,
              assets: {
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: {
                  originalUrl: true,
                  thumbnailUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!website || !website.isPublished) return null;
  return website;
}
