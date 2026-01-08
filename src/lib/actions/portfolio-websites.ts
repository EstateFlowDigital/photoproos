"use server";

import { ok, fail, type VoidActionResult, type ActionResult } from "@/lib/types/action-result";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { revalidatePath } from "next/cache";
import { Prisma, type PortfolioType, type PortfolioTemplate, type PortfolioSectionType } from "@prisma/client";
import {
  updatePortfolioSettingsSchema,
  createSectionSchema,
  updateSectionSchema,
  getDefaultConfig,
  validateSectionConfig,
} from "@/lib/validations/portfolio-sections";
import { getDefaultSectionsForType, SECTION_DEFINITIONS } from "@/lib/portfolio-templates";

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
    return fail("Failed to create portfolio website");
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
      sections: {
        orderBy: { position: "asc" },
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
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id, organizationId },
    });

    if (!website) {
      return fail("Portfolio website not found");
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
    return ok();
  } catch (error) {
    console.error("Error updating portfolio website:", error);
    return fail("Failed to update portfolio website");
  }
}

export async function updatePortfolioWebsiteProjects(
  id: string,
  projectIds: string[]
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id, organizationId },
    });

    if (!website) {
      return fail("Portfolio website not found");
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
    return ok();
  } catch (error) {
    console.error("Error updating portfolio projects:", error);
    return fail("Failed to update portfolio projects");
  }
}

export async function publishPortfolioWebsite(
  id: string,
  publish: boolean
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id, organizationId },
    });

    if (!website) {
      return fail("Portfolio website not found");
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
    return ok();
  } catch (error) {
    console.error("Error publishing portfolio website:", error);
    return fail("Failed to update publish status");
  }
}

export async function deletePortfolioWebsite(
  id: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id, organizationId },
    });

    if (!website) {
      return fail("Portfolio website not found");
    }

    await prisma.portfolioWebsite.delete({ where: { id } });
    revalidatePath("/portfolios");
    return ok();
  } catch (error) {
    console.error("Error deleting portfolio website:", error);
    return fail("Failed to delete portfolio website");
  }
}

export async function duplicatePortfolioWebsite(
  id: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Get the original portfolio with all related data
    const original = await prisma.portfolioWebsite.findFirst({
      where: { id, organizationId },
      include: {
        sections: {
          orderBy: { position: "asc" },
        },
        projects: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!original) {
      return fail("Portfolio website not found");
    }

    // Generate a unique slug for the copy
    const baseSlug = slugify(`${original.slug}-copy`);
    const slug = await getUniqueSlug(baseSlug);

    // Create the duplicate portfolio
    const duplicate = await prisma.portfolioWebsite.create({
      data: {
        organizationId,
        name: `${original.name} (Copy)`,
        slug,
        description: original.description,
        heroTitle: original.heroTitle,
        heroSubtitle: original.heroSubtitle,
        logoUrl: original.logoUrl,
        primaryColor: original.primaryColor,
        accentColor: original.accentColor,
        portfolioType: original.portfolioType,
        template: original.template,
        fontHeading: original.fontHeading,
        fontBody: original.fontBody,
        socialLinks: original.socialLinks as Prisma.InputJsonValue,
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription,
        showBranding: original.showBranding,
        isPasswordProtected: false, // Don't copy password protection
        password: null,
        expiresAt: null, // Don't copy expiration
        allowDownloads: original.allowDownloads,
        downloadWatermark: original.downloadWatermark,
        customCss: original.customCss,
        enableAnimations: original.enableAnimations,
        isPublished: false, // Start as draft
      },
    });

    // Duplicate all sections
    for (const section of original.sections) {
      await prisma.portfolioWebsiteSection.create({
        data: {
          portfolioWebsiteId: duplicate.id,
          sectionType: section.sectionType,
          position: section.position,
          isVisible: section.isVisible,
          config: section.config as Prisma.InputJsonValue,
          customTitle: section.customTitle,
        },
      });
    }

    // Duplicate project associations
    for (const project of original.projects) {
      await prisma.portfolioWebsiteProject.create({
        data: {
          portfolioWebsiteId: duplicate.id,
          projectId: project.projectId,
          position: project.position,
        },
      });
    }

    revalidatePath("/portfolios");
    return { success: true, id: duplicate.id };
  } catch (error) {
    console.error("Error duplicating portfolio website:", error);
    return fail("Failed to duplicate portfolio website");
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
      sections: {
        where: { isVisible: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!website || !website.isPublished) return null;
  return website;
}

// ============================================================================
// SETTINGS & TEMPLATE ACTIONS
// ============================================================================

export async function updatePortfolioWebsiteSettings(
  id: string,
  data: {
    portfolioType?: PortfolioType;
    template?: PortfolioTemplate;
    fontHeading?: string | null;
    fontBody?: string | null;
    socialLinks?: { platform: string; url: string }[] | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    showBranding?: boolean;
  }
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id, organizationId },
    });

    if (!website) {
      return fail("Portfolio website not found");
    }

    const validated = updatePortfolioSettingsSchema.parse(data);

    // Handle JSON null conversion for Prisma
    const socialLinksValue = validated.socialLinks !== undefined
      ? (validated.socialLinks === null ? Prisma.JsonNull : validated.socialLinks)
      : undefined;

    await prisma.portfolioWebsite.update({
      where: { id },
      data: {
        portfolioType: validated.portfolioType ?? website.portfolioType,
        template: validated.template ?? website.template,
        fontHeading: validated.fontHeading !== undefined ? validated.fontHeading : website.fontHeading,
        fontBody: validated.fontBody !== undefined ? validated.fontBody : website.fontBody,
        socialLinks: socialLinksValue,
        metaTitle: validated.metaTitle !== undefined ? validated.metaTitle : website.metaTitle,
        metaDescription: validated.metaDescription !== undefined ? validated.metaDescription : website.metaDescription,
        showBranding: validated.showBranding ?? website.showBranding,
      },
    });

    revalidatePath(`/portfolios/${id}`);
    revalidatePath(`/portfolio/${website.slug}`);
    return ok();
  } catch (error) {
    console.error("Error updating portfolio settings:", error);
    return fail("Failed to update portfolio settings");
  }
}

// ============================================================================
// SECTION ACTIONS
// ============================================================================

export async function getPortfolioSections(portfolioWebsiteId: string) {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  const website = await prisma.portfolioWebsite.findFirst({
    where: { id: portfolioWebsiteId, organizationId },
  });

  if (!website) return [];

  return prisma.portfolioWebsiteSection.findMany({
    where: { portfolioWebsiteId },
    orderBy: { position: "asc" },
  });
}

export async function createPortfolioSection(
  portfolioWebsiteId: string,
  data: {
    sectionType: PortfolioSectionType;
    position?: number;
    config?: Record<string, unknown>;
    customTitle?: string | null;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioWebsiteId, organizationId },
    });

    if (!website) {
      return fail("Portfolio website not found");
    }

    // Get the next position if not provided
    let position = data.position;
    if (position === undefined) {
      const lastSection = await prisma.portfolioWebsiteSection.findFirst({
        where: { portfolioWebsiteId },
        orderBy: { position: "desc" },
      });
      position = (lastSection?.position ?? -1) + 1;
    }

    // Get default config for section type if not provided
    const defaultConfig = getDefaultConfig(data.sectionType);
    const config = { ...defaultConfig, ...(data.config || {}) };

    const section = await prisma.portfolioWebsiteSection.create({
      data: {
        portfolioWebsiteId,
        sectionType: data.sectionType,
        position,
        config,
        customTitle: data.customTitle || null,
      },
    });

    revalidatePath(`/portfolios/${portfolioWebsiteId}`);
    return { success: true, id: section.id };
  } catch (error) {
    console.error("Error creating portfolio section:", error);
    return fail("Failed to create section");
  }
}

export async function updatePortfolioSection(
  id: string,
  data: {
    position?: number;
    isVisible?: boolean;
    config?: Record<string, unknown>;
    customTitle?: string | null;
  }
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const section = await prisma.portfolioWebsiteSection.findFirst({
      where: { id },
      include: {
        portfolioWebsite: {
          select: { id: true, organizationId: true, slug: true },
        },
      },
    });

    if (!section || section.portfolioWebsite.organizationId !== organizationId) {
      return fail("Section not found");
    }

    // Validate config if provided
    if (data.config) {
      const validation = validateSectionConfig(section.sectionType, data.config);
      if (!validation.success) {
        return fail(validation.error);
      }
    }

    await prisma.portfolioWebsiteSection.update({
      where: { id },
      data: {
        position: data.position ?? section.position,
        isVisible: data.isVisible ?? section.isVisible,
        config: (data.config ?? section.config) as Prisma.InputJsonValue,
        customTitle: data.customTitle !== undefined ? data.customTitle : section.customTitle,
      },
    });

    revalidatePath(`/portfolios/${section.portfolioWebsite.id}`);
    revalidatePath(`/portfolio/${section.portfolioWebsite.slug}`);
    return ok();
  } catch (error) {
    console.error("Error updating portfolio section:", error);
    return fail("Failed to update section");
  }
}

export async function deletePortfolioSection(
  id: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const section = await prisma.portfolioWebsiteSection.findFirst({
      where: { id },
      include: {
        portfolioWebsite: {
          select: { id: true, organizationId: true, slug: true },
        },
      },
    });

    if (!section || section.portfolioWebsite.organizationId !== organizationId) {
      return fail("Section not found");
    }

    await prisma.portfolioWebsiteSection.delete({ where: { id } });

    // Reorder remaining sections
    const remainingSections = await prisma.portfolioWebsiteSection.findMany({
      where: { portfolioWebsiteId: section.portfolioWebsiteId },
      orderBy: { position: "asc" },
    });

    for (let i = 0; i < remainingSections.length; i++) {
      await prisma.portfolioWebsiteSection.update({
        where: { id: remainingSections[i].id },
        data: { position: i },
      });
    }

    revalidatePath(`/portfolios/${section.portfolioWebsite.id}`);
    revalidatePath(`/portfolio/${section.portfolioWebsite.slug}`);
    return ok();
  } catch (error) {
    console.error("Error deleting portfolio section:", error);
    return fail("Failed to delete section");
  }
}

export async function reorderPortfolioSections(
  portfolioWebsiteId: string,
  sectionIds: string[]
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioWebsiteId, organizationId },
    });

    if (!website) {
      return fail("Portfolio website not found");
    }

    await prisma.$transaction(
      sectionIds.map((sectionId, index) =>
        prisma.portfolioWebsiteSection.update({
          where: { id: sectionId },
          data: { position: index },
        })
      )
    );

    revalidatePath(`/portfolios/${portfolioWebsiteId}`);
    revalidatePath(`/portfolio/${website.slug}`);
    return ok();
  } catch (error) {
    console.error("Error reordering portfolio sections:", error);
    return fail("Failed to reorder sections");
  }
}

export async function initializePortfolioSections(
  portfolioWebsiteId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioWebsiteId, organizationId },
      include: { sections: true },
    });

    if (!website) {
      return fail("Portfolio website not found");
    }

    // Don't initialize if sections already exist
    if (website.sections.length > 0) {
      return ok();
    }

    const defaultSectionTypes = getDefaultSectionsForType(
      website.portfolioType,
      website.template
    );

    // Create default sections
    for (let i = 0; i < defaultSectionTypes.length; i++) {
      const sectionType = defaultSectionTypes[i];
      const definition = SECTION_DEFINITIONS.find((s) => s.type === sectionType);
      const config = definition?.defaultConfig || {};

      // For hero section, use existing hero title/subtitle if available
      if (sectionType === "hero") {
        if (website.heroTitle) {
          (config as Record<string, unknown>).title = website.heroTitle;
        }
        if (website.heroSubtitle) {
          (config as Record<string, unknown>).subtitle = website.heroSubtitle;
        }
      }

      await prisma.portfolioWebsiteSection.create({
        data: {
          portfolioWebsiteId,
          sectionType,
          position: i,
          config: config as Prisma.InputJsonValue,
        },
      });
    }

    revalidatePath(`/portfolios/${portfolioWebsiteId}`);
    return ok();
  } catch (error) {
    console.error("Error initializing portfolio sections:", error);
    return fail("Failed to initialize sections");
  }
}

export async function duplicatePortfolioSection(
  id: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const section = await prisma.portfolioWebsiteSection.findFirst({
      where: { id },
      include: {
        portfolioWebsite: {
          select: { id: true, organizationId: true },
        },
      },
    });

    if (!section || section.portfolioWebsite.organizationId !== organizationId) {
      return fail("Section not found");
    }

    // Get the next position after this section
    const newPosition = section.position + 1;

    // Shift positions of sections after this one
    await prisma.portfolioWebsiteSection.updateMany({
      where: {
        portfolioWebsiteId: section.portfolioWebsiteId,
        position: { gte: newPosition },
      },
      data: {
        position: { increment: 1 },
      },
    });

    // Create the duplicate
    const duplicate = await prisma.portfolioWebsiteSection.create({
      data: {
        portfolioWebsiteId: section.portfolioWebsiteId,
        sectionType: section.sectionType,
        position: newPosition,
        isVisible: section.isVisible,
        config: section.config as Prisma.InputJsonValue,
        customTitle: section.customTitle ? `${section.customTitle} (Copy)` : null,
      },
    });

    revalidatePath(`/portfolios/${section.portfolioWebsite.id}`);
    return { success: true, id: duplicate.id };
  } catch (error) {
    console.error("Error duplicating portfolio section:", error);
    return fail("Failed to duplicate section");
  }
}

export async function toggleSectionVisibility(
  id: string
): Promise<{ success: boolean; isVisible?: boolean; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const section = await prisma.portfolioWebsiteSection.findFirst({
      where: { id },
      include: {
        portfolioWebsite: {
          select: { id: true, organizationId: true, slug: true },
        },
      },
    });

    if (!section || section.portfolioWebsite.organizationId !== organizationId) {
      return fail("Section not found");
    }

    const updated = await prisma.portfolioWebsiteSection.update({
      where: { id },
      data: { isVisible: !section.isVisible },
    });

    revalidatePath(`/portfolios/${section.portfolioWebsite.id}`);
    revalidatePath(`/portfolio/${section.portfolioWebsite.slug}`);
    return { success: true, isVisible: updated.isVisible };
  } catch (error) {
    console.error("Error toggling section visibility:", error);
    return fail("Failed to toggle visibility");
  }
}

// ============================================================================
// PASSWORD PROTECTION
// ============================================================================

export async function setPortfolioPassword(
  portfolioId: string,
  data: {
    isPasswordProtected: boolean;
    password?: string;
  }
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioId, organizationId },
    });

    if (!website) {
      return fail("Portfolio website not found");
    }

    // If enabling password protection, password is required
    if (data.isPasswordProtected && !data.password && !website.password) {
      return fail("Password is required");
    }

    // Hash the password if provided (simple hash for demo - in production use bcrypt)
    let hashedPassword = website.password;
    if (data.password) {
      // Simple hash using Web Crypto API
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data.password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hashedPassword = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }

    await prisma.portfolioWebsite.update({
      where: { id: portfolioId },
      data: {
        isPasswordProtected: data.isPasswordProtected,
        password: data.isPasswordProtected ? hashedPassword : null,
      },
    });

    revalidatePath(`/portfolios/${portfolioId}`);
    return ok();
  } catch (error) {
    console.error("Error setting portfolio password:", error);
    return fail("Failed to set password");
  }
}

export async function verifyPortfolioPassword(
  slug: string,
  password: string
): Promise<VoidActionResult> {
  try {
    const website = await prisma.portfolioWebsite.findUnique({
      where: { slug },
      select: { password: true, isPasswordProtected: true },
    });

    if (!website) {
      return fail("Portfolio not found");
    }

    if (!website.isPasswordProtected) {
      return ok();
    }

    // Hash the provided password and compare
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedInput = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    if (hashedInput !== website.password) {
      return fail("Incorrect password");
    }

    return ok();
  } catch (error) {
    console.error("Error verifying portfolio password:", error);
    return fail("Failed to verify password");
  }
}

// ============================================================================
// ADVANCED SETTINGS
// ============================================================================

export async function updatePortfolioAdvancedSettings(
  portfolioId: string,
  data: {
    expiresAt?: Date | null;
    scheduledPublishAt?: Date | null;
    allowDownloads?: boolean;
    downloadWatermark?: boolean;
    customCss?: string | null;
    enableAnimations?: boolean;
  }
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioId, organizationId },
    });

    if (!website) {
      return fail("Portfolio website not found");
    }

    await prisma.portfolioWebsite.update({
      where: { id: portfolioId },
      data: {
        expiresAt: data.expiresAt !== undefined ? data.expiresAt : undefined,
        scheduledPublishAt: data.scheduledPublishAt !== undefined ? data.scheduledPublishAt : undefined,
        allowDownloads: data.allowDownloads !== undefined ? data.allowDownloads : undefined,
        downloadWatermark: data.downloadWatermark !== undefined ? data.downloadWatermark : undefined,
        customCss: data.customCss !== undefined ? data.customCss : undefined,
        enableAnimations: data.enableAnimations !== undefined ? data.enableAnimations : undefined,
      },
    });

    revalidatePath(`/portfolios/${portfolioId}`);
    revalidatePath(`/portfolio/${website.slug}`);
    return ok();
  } catch (error) {
    console.error("Error updating advanced settings:", error);
    return fail("Failed to update settings");
  }
}

export async function schedulePortfolioPublish(
  portfolioId: string,
  scheduledAt: Date | null
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioId, organizationId },
    });

    if (!website) {
      return fail("Portfolio website not found");
    }

    // Validate scheduled date is in the future
    if (scheduledAt && scheduledAt <= new Date()) {
      return fail("Scheduled time must be in the future");
    }

    await prisma.portfolioWebsite.update({
      where: { id: portfolioId },
      data: {
        scheduledPublishAt: scheduledAt,
      },
    });

    revalidatePath(`/portfolios/${portfolioId}`);
    return ok();
  } catch (error) {
    console.error("Error scheduling portfolio publish:", error);
    return fail("Failed to schedule publication");
  }
}

export async function getScheduledPortfolios(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    slug: string;
    scheduledPublishAt: Date;
    organizationId: string;
  }>;
  error?: string;
}> {
  try {
    const now = new Date();

    const portfolios = await prisma.portfolioWebsite.findMany({
      where: {
        scheduledPublishAt: {
          lte: now,
        },
        isPublished: false,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        scheduledPublishAt: true,
        organizationId: true,
      },
    });

    return {
      success: true,
      data: portfolios.filter((p) => p.scheduledPublishAt !== null) as Array<{
        id: string;
        name: string;
        slug: string;
        scheduledPublishAt: Date;
        organizationId: string;
      }>,
    };
  } catch (error) {
    console.error("Error getting scheduled portfolios:", error);
    return fail("Failed to get scheduled portfolios");
  }
}

export async function processScheduledPortfolioPublishing(): Promise<{
  success: boolean;
  publishedCount: number;
  error?: string;
}> {
  try {
    const now = new Date();

    // Find all portfolios that should be published
    const portfoliosToPublish = await prisma.portfolioWebsite.findMany({
      where: {
        scheduledPublishAt: {
          lte: now,
        },
        isPublished: false,
      },
    });

    let publishedCount = 0;

    for (const portfolio of portfoliosToPublish) {
      await prisma.portfolioWebsite.update({
        where: { id: portfolio.id },
        data: {
          isPublished: true,
          publishedAt: now,
          scheduledPublishAt: null, // Clear the schedule after publishing
        },
      });

      // Revalidate paths
      revalidatePath(`/portfolios/${portfolio.id}`);
      revalidatePath(`/portfolio/${portfolio.slug}`);

      publishedCount++;
    }

    return { success: true, publishedCount };
  } catch (error) {
    console.error("Error processing scheduled portfolios:", error);
    return { success: false, publishedCount: 0, error: "Failed to process scheduled portfolios" };
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function trackPortfolioView(
  slug: string,
  data: {
    visitorId?: string;
    sessionId?: string;
    pagePath?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
  }
): Promise<{ success: boolean; viewId?: string; error?: string }> {
  try {
    const website = await prisma.portfolioWebsite.findUnique({
      where: { slug },
      select: { id: true, isPublished: true, expiresAt: true },
    });

    if (!website) {
      return fail("Portfolio not found");
    }

    // Check if portfolio is published and not expired
    if (!website.isPublished) {
      return fail("Portfolio not published");
    }

    if (website.expiresAt && website.expiresAt < new Date()) {
      return fail("Portfolio expired");
    }

    const view = await prisma.portfolioWebsiteView.create({
      data: {
        portfolioWebsiteId: website.id,
        visitorId: data.visitorId,
        sessionId: data.sessionId,
        pagePath: data.pagePath,
        referrer: data.referrer,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        country: data.country,
        city: data.city,
      },
    });

    return { success: true, viewId: view.id };
  } catch (error) {
    console.error("Error tracking portfolio view:", error);
    return fail("Failed to track view");
  }
}

export async function updatePortfolioViewEngagement(
  viewId: string,
  data: {
    duration?: number;
    scrollDepth?: number;
  }
): Promise<VoidActionResult> {
  try {
    await prisma.portfolioWebsiteView.update({
      where: { id: viewId },
      data: {
        duration: data.duration,
        scrollDepth: data.scrollDepth,
      },
    });

    return ok();
  } catch (error) {
    console.error("Error updating view engagement:", error);
    return fail("Failed to update engagement");
  }
}

export async function getPortfolioAnalytics(
  portfolioId: string,
  timeRange: "7d" | "30d" | "90d" | "all" = "30d"
): Promise<{
  success: boolean;
  data?: {
    totalViews: number;
    uniqueVisitors: number;
    avgDuration: number;
    avgScrollDepth: number;
    viewsByDate: { date: string; views: number }[];
    topReferrers: { referrer: string; count: number }[];
    topCountries: { country: string; count: number }[];
    topCities: { city: string; country: string; count: number }[];
    recentViews: {
      id: string;
      visitorId: string | null;
      pagePath: string | null;
      referrer: string | null;
      duration: number | null;
      country: string | null;
      city: string | null;
      createdAt: Date;
    }[];
  };
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioId, organizationId },
    });

    if (!website) {
      return fail("Portfolio website not found");
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (timeRange) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const views = await prisma.portfolioWebsiteView.findMany({
      where: {
        portfolioWebsiteId: portfolioId,
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate metrics
    const totalViews = views.length;
    const uniqueVisitors = new Set(views.map((v) => v.visitorId).filter(Boolean)).size;
    const durationsWithValue = views.filter((v) => v.duration !== null);
    const avgDuration =
      durationsWithValue.length > 0
        ? durationsWithValue.reduce((sum, v) => sum + (v.duration || 0), 0) / durationsWithValue.length
        : 0;
    const scrollDepthsWithValue = views.filter((v) => v.scrollDepth !== null);
    const avgScrollDepth =
      scrollDepthsWithValue.length > 0
        ? scrollDepthsWithValue.reduce((sum, v) => sum + (v.scrollDepth || 0), 0) / scrollDepthsWithValue.length
        : 0;

    // Group views by date
    const viewsByDateMap = new Map<string, number>();
    views.forEach((view) => {
      const date = view.createdAt.toISOString().split("T")[0];
      viewsByDateMap.set(date, (viewsByDateMap.get(date) || 0) + 1);
    });
    const viewsByDate = Array.from(viewsByDateMap.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top referrers
    const referrerMap = new Map<string, number>();
    views.forEach((view) => {
      const referrer = view.referrer || "Direct";
      referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1);
    });
    const topReferrers = Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top countries
    const countryMap = new Map<string, number>();
    views.forEach((view) => {
      if (view.country) {
        countryMap.set(view.country, (countryMap.get(view.country) || 0) + 1);
      }
    });
    const topCountries = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top cities
    const cityMap = new Map<string, { count: number; country: string }>();
    views.forEach((view) => {
      if (view.city && view.country) {
        const key = `${view.city}|${view.country}`;
        const existing = cityMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          cityMap.set(key, { count: 1, country: view.country });
        }
      }
    });
    const topCities = Array.from(cityMap.entries())
      .map(([key, data]) => ({
        city: key.split("|")[0],
        country: data.country,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Recent views
    const recentViews = views.slice(0, 20).map((v) => ({
      id: v.id,
      visitorId: v.visitorId,
      pagePath: v.pagePath,
      referrer: v.referrer,
      duration: v.duration,
      country: v.country,
      city: v.city,
      createdAt: v.createdAt,
    }));

    return {
      success: true,
      data: {
        totalViews,
        uniqueVisitors,
        avgDuration: Math.round(avgDuration),
        avgScrollDepth: Math.round(avgScrollDepth),
        viewsByDate,
        topReferrers,
        topCountries,
        topCities,
        recentViews,
      },
    };
  } catch (error) {
    console.error("Error getting portfolio analytics:", error);
    return fail("Failed to get analytics");
  }
}

// ============================================================================
// CONTACT FORM
// ============================================================================

export async function submitPortfolioContactForm(
  slug: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    message: string;
  }
): Promise<VoidActionResult> {
  try {
    const website = await prisma.portfolioWebsite.findUnique({
      where: { slug },
      include: {
        organization: {
          select: {
            name: true,
            members: {
              where: { role: "owner" },
              include: {
                user: {
                  select: { email: true, fullName: true },
                },
              },
            },
          },
        },
      },
    });

    if (!website) {
      return fail("Portfolio not found");
    }

    // Get owner's email
    const owner = website.organization.members[0]?.user;
    if (!owner) {
      return fail("No recipient found");
    }

    // Build the portfolio URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";
    const portfolioUrl = `${baseUrl}/portfolio/${slug}`;

    // Send email notification to portfolio owner
    const { sendPortfolioContactEmail } = await import("@/lib/email/send");
    const emailResult = await sendPortfolioContactEmail({
      to: owner.email,
      photographerName: owner.fullName || "there",
      portfolioName: website.name,
      portfolioUrl,
      senderName: data.name,
      senderEmail: data.email,
      senderPhone: data.phone,
      message: data.message,
    });

    if (!emailResult.success) {
      console.error("Failed to send portfolio contact email:", emailResult.error);
      // Still continue to log the activity even if email fails
    }

    // Create an activity log
    await prisma.activityLog.create({
      data: {
        organizationId: website.organizationId,
        type: "email_sent",
        description: `Contact form submitted on portfolio "${website.name}" by ${data.name} (${data.email})`,
        metadata: {
          portfolioId: website.id,
          portfolioName: website.name,
          senderName: data.name,
          senderEmail: data.email,
          senderPhone: data.phone || null,
          message: data.message,
          emailSent: emailResult.success,
        } as Prisma.InputJsonValue,
      },
    });

    return ok();
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return fail("Failed to send message");
  }
}

// ============================================================================
// CUSTOM DOMAIN MANAGEMENT
// ============================================================================

/**
 * Generate a verification token for custom domain
 */
function generateVerificationToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "photoproos-verify-";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Validate domain format
 */
function isValidDomain(domain: string): boolean {
  // Basic domain validation
  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Add a custom domain to a portfolio
 */
export async function addCustomDomain(
  portfolioId: string,
  domain: string
): Promise<{ success: boolean; verificationToken?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Clean and validate domain
    const cleanDomain = domain.toLowerCase().trim().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/$/, "");

    if (!isValidDomain(cleanDomain)) {
      return fail("Invalid domain format. Please enter a valid domain like 'portfolio.example.com'");
    }

    // Check if portfolio exists and belongs to org
    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioId, organizationId },
    });

    if (!website) {
      return fail("Portfolio not found");
    }

    // Check if domain is already in use by another portfolio
    const existingDomain = await prisma.portfolioWebsite.findFirst({
      where: {
        customDomain: cleanDomain,
        id: { not: portfolioId },
      },
    });

    if (existingDomain) {
      return fail("This domain is already in use by another portfolio");
    }

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Update portfolio with domain and verification token
    await prisma.portfolioWebsite.update({
      where: { id: portfolioId },
      data: {
        customDomain: cleanDomain,
        customDomainVerified: false,
        customDomainVerificationToken: verificationToken,
        customDomainVerifiedAt: null,
        customDomainSslStatus: "pending",
      },
    });

    return { success: true, verificationToken };
  } catch (error) {
    console.error("Error adding custom domain:", error);
    return fail("Failed to add custom domain");
  }
}

/**
 * Verify custom domain by checking DNS TXT record
 */
export async function verifyCustomDomain(
  portfolioId: string
): Promise<{ success: boolean; verified?: boolean; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioId, organizationId },
      select: {
        id: true,
        customDomain: true,
        customDomainVerificationToken: true,
        customDomainVerified: true,
      },
    });

    if (!website) {
      return fail("Portfolio not found");
    }

    if (!website.customDomain) {
      return fail("No custom domain configured");
    }

    if (website.customDomainVerified) {
      return { success: true, verified: true };
    }

    // Perform DNS TXT record lookup
    const dns = await import("dns").then(m => m.promises);

    try {
      // Check for TXT record on _photoproos-verify subdomain
      const records = await dns.resolveTxt(`_photoproos-verify.${website.customDomain}`);
      const flatRecords = records.flat();

      const isVerified = flatRecords.some(
        record => record === website.customDomainVerificationToken
      );

      if (isVerified) {
        // Update portfolio as verified
        await prisma.portfolioWebsite.update({
          where: { id: portfolioId },
          data: {
            customDomainVerified: true,
            customDomainVerifiedAt: new Date(),
            customDomainSslStatus: "active", // In production, this would trigger SSL provisioning
          },
        });

        return { success: true, verified: true };
      }

      return { success: true, verified: false };
    } catch (dnsError) {
      // DNS lookup failed - record doesn't exist yet
      console.log("DNS lookup failed (record may not exist yet):", dnsError);
      return { success: true, verified: false };
    }
  } catch (error) {
    console.error("Error verifying custom domain:", error);
    return fail("Failed to verify domain");
  }
}

/**
 * Remove custom domain from a portfolio
 */
export async function removeCustomDomain(
  portfolioId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioId, organizationId },
    });

    if (!website) {
      return fail("Portfolio not found");
    }

    await prisma.portfolioWebsite.update({
      where: { id: portfolioId },
      data: {
        customDomain: null,
        customDomainVerified: false,
        customDomainVerificationToken: null,
        customDomainVerifiedAt: null,
        customDomainSslStatus: null,
      },
    });

    return ok();
  } catch (error) {
    console.error("Error removing custom domain:", error);
    return fail("Failed to remove custom domain");
  }
}

/**
 * Get custom domain status for a portfolio
 */
export async function getCustomDomainStatus(
  portfolioId: string
): Promise<{
  success: boolean;
  data?: {
    domain: string | null;
    verified: boolean;
    verificationToken: string | null;
    verifiedAt: Date | null;
    sslStatus: string | null;
  };
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const website = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioId, organizationId },
      select: {
        customDomain: true,
        customDomainVerified: true,
        customDomainVerificationToken: true,
        customDomainVerifiedAt: true,
        customDomainSslStatus: true,
      },
    });

    if (!website) {
      return fail("Portfolio not found");
    }

    return {
      success: true,
      data: {
        domain: website.customDomain,
        verified: website.customDomainVerified,
        verificationToken: website.customDomainVerificationToken,
        verifiedAt: website.customDomainVerifiedAt,
        sslStatus: website.customDomainSslStatus,
      },
    };
  } catch (error) {
    console.error("Error getting custom domain status:", error);
    return fail("Failed to get domain status");
  }
}

/**
 * Find portfolio by custom domain (for routing)
 */
export async function getPortfolioByCustomDomain(
  domain: string
): Promise<{
  success: boolean;
  slug?: string;
  error?: string;
}> {
  try {
    const cleanDomain = domain.toLowerCase().trim();

    const website = await prisma.portfolioWebsite.findFirst({
      where: {
        customDomain: cleanDomain,
        customDomainVerified: true,
        isPublished: true,
      },
      select: {
        slug: true,
        expiresAt: true,
      },
    });

    if (!website) {
      return fail("Portfolio not found");
    }

    // Check if expired
    if (website.expiresAt && website.expiresAt < new Date()) {
      return fail("Portfolio expired");
    }

    return { success: true, slug: website.slug };
  } catch (error) {
    console.error("Error finding portfolio by domain:", error);
    return fail("Failed to find portfolio");
  }
}

// =============================================================================
// PORTFOLIO INQUIRIES (Contact Form Submissions)
// =============================================================================

/**
 * Submit a contact inquiry from a portfolio website (public, no auth required)
 */
export async function submitPortfolioInquiry(input: {
  portfolioWebsiteId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  source?: string;
}): Promise<VoidActionResult> {
  try {
    // Validate required fields
    if (!input.name?.trim()) {
      return fail("Name is required");
    }
    if (!input.email?.trim()) {
      return fail("Email is required");
    }
    if (!input.message?.trim()) {
      return fail("Message is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return fail("Invalid email address");
    }

    // Get the portfolio website to verify it exists and get org ID
    const website = await prisma.portfolioWebsite.findUnique({
      where: { id: input.portfolioWebsiteId },
      select: {
        id: true,
        name: true,
        slug: true,
        organizationId: true,
        isPublished: true,
        organization: {
          select: {
            name: true,
            members: {
              where: { role: "owner" },
              include: {
                user: {
                  select: { email: true, fullName: true },
                },
              },
            },
          },
        },
      },
    });

    if (!website) {
      return fail("Portfolio not found");
    }

    if (!website.isPublished) {
      return fail("Portfolio is not published");
    }

    // Create the inquiry
    await prisma.portfolioInquiry.create({
      data: {
        portfolioWebsiteId: website.id,
        organizationId: website.organizationId,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone?.trim() || null,
        message: input.message.trim(),
        source: input.source || "portfolio_contact_form",
        status: "new",
      },
    });

    // Send notification email to organization owner
    try {
      const owner = website.organization.members[0]?.user;
      if (owner?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.photoproos.com";
        const portfolioUrl = `${baseUrl}/portfolio/${website.slug}`;

        const { sendPortfolioContactEmail } = await import("@/lib/email/send");
        await sendPortfolioContactEmail({
          to: owner.email,
          photographerName: owner.fullName || website.organization.name,
          portfolioName: website.name,
          portfolioUrl,
          senderName: input.name.trim(),
          senderEmail: input.email.trim(),
          senderPhone: input.phone?.trim(),
          message: input.message.trim(),
        });
      }
    } catch (emailError) {
      // Don't fail the submission if email fails
      console.error("Failed to send inquiry notification:", emailError);
    }

    return ok();
  } catch (error) {
    console.error("Error submitting portfolio inquiry:", error);
    return fail("Failed to submit inquiry");
  }
}

/**
 * Get portfolio inquiries for the dashboard
 */
export async function getPortfolioInquiries(filters?: {
  portfolioWebsiteId?: string;
  status?: string;
}) {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  return prisma.portfolioInquiry.findMany({
    where: {
      organizationId,
      ...(filters?.portfolioWebsiteId && { portfolioWebsiteId: filters.portfolioWebsiteId }),
      ...(filters?.status && { status: filters.status as "new" | "contacted" | "qualified" | "closed" }),
    },
    include: {
      portfolioWebsite: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Update portfolio inquiry status
 */
export async function updatePortfolioInquiryStatus(
  inquiryId: string,
  status: "new" | "contacted" | "qualified" | "closed",
  notes?: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify inquiry belongs to organization
    const inquiry = await prisma.portfolioInquiry.findFirst({
      where: {
        id: inquiryId,
        organizationId,
      },
    });

    if (!inquiry) {
      return fail("Inquiry not found");
    }

    await prisma.portfolioInquiry.update({
      where: { id: inquiryId },
      data: {
        status,
        ...(notes !== undefined && { notes }),
      },
    });

    revalidatePath("/portfolios");
    revalidatePath("/leads");
    return ok();
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    return fail("Failed to update inquiry");
  }
}

/**
 * Convert a portfolio inquiry to a client
 */
export async function convertPortfolioInquiryToClient(
  inquiryId: string,
  additionalData?: {
    company?: string;
    industry?: string;
    notes?: string;
  }
): Promise<{ success: boolean; clientId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Get the inquiry
    const inquiry = await prisma.portfolioInquiry.findFirst({
      where: {
        id: inquiryId,
        organizationId,
      },
      include: {
        portfolioWebsite: {
          select: { name: true },
        },
      },
    });

    if (!inquiry) {
      return fail("Inquiry not found");
    }

    // Check if client with this email already exists
    const existingClient = await prisma.client.findFirst({
      where: {
        organizationId,
        email: inquiry.email,
      },
    });

    if (existingClient) {
      // Update inquiry to closed and link note about existing client
      await prisma.portfolioInquiry.update({
        where: { id: inquiryId },
        data: {
          status: "closed",
          notes: `${inquiry.notes || ""}\n[Converted] Client already exists (ID: ${existingClient.id})`.trim(),
        },
      });

      revalidatePath("/leads");
      revalidatePath("/clients");
      return { success: true, clientId: existingClient.id };
    }

    // Create new client
    const client = await prisma.client.create({
      data: {
        organizationId,
        email: inquiry.email,
        fullName: inquiry.name,
        phone: inquiry.phone,
        company: additionalData?.company,
        industry: (additionalData?.industry as "real_estate" | "wedding" | "portrait" | "commercial" | "architecture" | "food_hospitality" | "events" | "headshots" | "product" | "other") || "other",
        notes: additionalData?.notes || `Converted from portfolio inquiry (${inquiry.portfolioWebsite.name})`,
        source: "portfolio_inquiry",
      },
    });

    // Update inquiry to closed
    await prisma.portfolioInquiry.update({
      where: { id: inquiryId },
      data: {
        status: "closed",
        notes: `${inquiry.notes || ""}\n[Converted to client on ${new Date().toLocaleDateString()}]`.trim(),
      },
    });

    // Log activity
    const { logActivity } = await import("@/lib/utils/activity");
    await logActivity({
      organizationId,
      type: "client_added",
      description: `Client "${inquiry.name}" was created from portfolio inquiry`,
      clientId: client.id,
    });

    revalidatePath("/leads");
    revalidatePath("/clients");
    revalidatePath("/dashboard");

    return { success: true, clientId: client.id };
  } catch (error) {
    console.error("Error converting inquiry to client:", error);
    return fail("Failed to convert inquiry to client");
  }
}

/**
 * Bulk delete portfolio inquiries
 */
export async function bulkDeletePortfolioInquiries(
  inquiryIds: string[]
): Promise<ActionResult<{ deleted: number }>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Delete only inquiries that belong to this organization
    const result = await prisma.portfolioInquiry.deleteMany({
      where: {
        id: { in: inquiryIds },
        organizationId,
      },
    });

    revalidatePath("/leads");
    return { success: true, data: { deleted: result.count } };
  } catch (error) {
    console.error("Error bulk deleting portfolio inquiries:", error);
    return fail("Failed to delete inquiries");
  }
}

/**
 * Bulk update status for portfolio inquiries
 */
export async function bulkUpdatePortfolioInquiryStatus(
  inquiryIds: string[],
  status: "new" | "contacted" | "qualified" | "closed"
): Promise<ActionResult<{ updated: number }>> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const result = await prisma.portfolioInquiry.updateMany({
      where: {
        id: { in: inquiryIds },
        organizationId,
      },
      data: { status },
    });

    revalidatePath("/leads");
    return { success: true, data: { updated: result.count } };
  } catch (error) {
    console.error("Error bulk updating portfolio inquiry status:", error);
    return fail("Failed to update inquiries");
  }
}

/**
 * Create a manual lead (portfolio inquiry)
 */
export async function createManualLead(data: {
  portfolioWebsiteId: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  notes?: string;
}): Promise<{ success: boolean; leadId?: string; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Validate required fields
    if (!data.name?.trim()) {
      return fail("Name is required");
    }
    if (!data.email?.trim()) {
      return fail("Email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return fail("Invalid email address");
    }

    // Verify portfolio website belongs to organization
    const portfolioWebsite = await prisma.portfolioWebsite.findFirst({
      where: {
        id: data.portfolioWebsiteId,
        organizationId,
      },
    });

    if (!portfolioWebsite) {
      return fail("Portfolio website not found");
    }

    // Create the manual lead
    const lead = await prisma.portfolioInquiry.create({
      data: {
        organizationId,
        portfolioWebsiteId: data.portfolioWebsiteId,
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        message: data.message?.trim() || "Manually created lead",
        notes: data.notes?.trim() || null,
        source: "manual",
        status: "new",
      },
    });

    revalidatePath("/leads");
    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error("Error creating manual lead:", error);
    return fail("Failed to create lead");
  }
}

/**
 * Get portfolio websites for lead creation (simple list)
 */
export async function getPortfolioWebsitesForLeadCreation() {
  await requireAuth();
  const organizationId = await requireOrganizationId();

  return prisma.portfolioWebsite.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: "asc" },
  });
}
