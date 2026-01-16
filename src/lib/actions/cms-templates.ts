"use server";

import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/super-admin";
import { currentUser } from "@clerk/nextjs/server";
import { success, fail, type ActionResult } from "@/lib/types/action-result";
import type { CMSPageTemplate } from "@prisma/client";
import type { PageComponentInstance } from "@/lib/cms/page-builder-utils";
import { generateComponentId } from "@/lib/cms/page-builder-utils";

// ============================================================================
// TYPES
// ============================================================================

export interface CreateTemplateInput {
  name: string;
  description?: string;
  slug: string;
  thumbnail?: string;
  industry?: string;
  tags?: string[];
  components: PageComponentInstance[];
  isGlobal?: boolean;
}

export interface UpdateTemplateInput {
  name?: string;
  description?: string;
  slug?: string;
  thumbnail?: string;
  industry?: string;
  tags?: string[];
  components?: PageComponentInstance[];
  isActive?: boolean;
  isGlobal?: boolean;
  sortOrder?: number;
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get all active page templates
 */
export async function getPageTemplates(
  industry?: string
): Promise<ActionResult<CMSPageTemplate[]>> {
  try {
    const templates = await prisma.cMSPageTemplate.findMany({
      where: {
        isActive: true,
        ...(industry && { industry }),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    return success(templates);
  } catch (error) {
    console.error("Error fetching page templates:", error);
    return fail("Failed to fetch templates");
  }
}

/**
 * Get a single template by ID or slug
 */
export async function getPageTemplate(
  idOrSlug: string
): Promise<ActionResult<CMSPageTemplate | null>> {
  try {
    // Try by ID first, then by slug
    let template = await prisma.cMSPageTemplate.findUnique({
      where: { id: idOrSlug },
    });

    if (!template) {
      template = await prisma.cMSPageTemplate.findUnique({
        where: { slug: idOrSlug },
      });
    }

    return success(template);
  } catch (error) {
    console.error("Error fetching page template:", error);
    return fail("Failed to fetch template");
  }
}

// ============================================================================
// WRITE OPERATIONS (Admin only)
// ============================================================================

/**
 * Create a new page template
 */
export async function createPageTemplate(
  input: CreateTemplateInput
): Promise<ActionResult<CMSPageTemplate>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();

    // Check for slug uniqueness
    const existing = await prisma.cMSPageTemplate.findUnique({
      where: { slug: input.slug },
    });

    if (existing) {
      return fail("A template with this slug already exists");
    }

    const template = await prisma.cMSPageTemplate.create({
      data: {
        name: input.name,
        description: input.description,
        slug: input.slug,
        thumbnail: input.thumbnail,
        industry: input.industry,
        tags: input.tags || [],
        components: input.components,
        isGlobal: input.isGlobal ?? true,
        createdBy: user?.id,
      },
    });

    return success(template);
  } catch (error) {
    console.error("Error creating page template:", error);
    return fail("Failed to create template");
  }
}

/**
 * Update a page template
 */
export async function updatePageTemplate(
  id: string,
  input: UpdateTemplateInput
): Promise<ActionResult<CMSPageTemplate>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Check slug uniqueness if changing
    if (input.slug) {
      const existing = await prisma.cMSPageTemplate.findFirst({
        where: {
          slug: input.slug,
          NOT: { id },
        },
      });

      if (existing) {
        return fail("A template with this slug already exists");
      }
    }

    const template = await prisma.cMSPageTemplate.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.slug && { slug: input.slug }),
        ...(input.thumbnail !== undefined && { thumbnail: input.thumbnail }),
        ...(input.industry !== undefined && { industry: input.industry }),
        ...(input.tags && { tags: input.tags }),
        ...(input.components && { components: input.components }),
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        ...(input.isGlobal !== undefined && { isGlobal: input.isGlobal }),
        ...(input.sortOrder !== undefined && { sortOrder: input.sortOrder }),
      },
    });

    return success(template);
  } catch (error) {
    console.error("Error updating page template:", error);
    return fail("Failed to update template");
  }
}

/**
 * Delete a page template
 */
export async function deletePageTemplate(
  id: string
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await prisma.cMSPageTemplate.delete({
      where: { id },
    });

    return success(undefined);
  } catch (error) {
    console.error("Error deleting page template:", error);
    return fail("Failed to delete template");
  }
}

// ============================================================================
// TEMPLATE APPLICATION
// ============================================================================

/**
 * Apply a template to get components with new IDs
 * Returns components with fresh IDs so they can be used on a new page
 */
export async function applyTemplate(
  templateId: string
): Promise<ActionResult<{ template: CMSPageTemplate; components: PageComponentInstance[] }>> {
  try {
    const template = await prisma.cMSPageTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return fail("Template not found");
    }

    // Clone components with new IDs
    const sourceComponents = template.components as PageComponentInstance[];
    const newComponents: PageComponentInstance[] = sourceComponents.map((c, i) => ({
      ...c,
      id: generateComponentId(),
      order: i,
    }));

    // Increment usage count
    await prisma.cMSPageTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    });

    return success({ template, components: newComponents });
  } catch (error) {
    console.error("Error applying template:", error);
    return fail("Failed to apply template");
  }
}

// ============================================================================
// SEED DEFAULT TEMPLATES
// ============================================================================

/**
 * Seed default page templates
 */
export async function seedDefaultTemplates(): Promise<ActionResult<{ created: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();

    const defaultTemplates: Omit<CreateTemplateInput, "isGlobal">[] = [
      {
        name: "Blank Page",
        slug: "blank",
        description: "Start from scratch with no components",
        industry: "general",
        tags: ["blank", "empty", "starter"],
        components: [],
      },
      {
        name: "Landing Page",
        slug: "landing-page",
        description: "Classic landing page with hero, features, testimonials, and CTA",
        industry: "general",
        tags: ["landing", "marketing", "conversion"],
        components: [
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "hero",
            content: {
              headline: "Your Headline Here",
              subheadline: "A compelling subheadline that explains your value proposition",
              ctaText: "Get Started",
              ctaLink: "/signup",
              secondaryCtaText: "Learn More",
              secondaryCtaLink: "#features",
            },
            order: 0,
          },
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "features-grid",
            content: {
              title: "Why Choose Us",
              subtitle: "Everything you need to succeed",
              features: [
                { title: "Feature 1", description: "Description of feature 1", icon: "Zap" },
                { title: "Feature 2", description: "Description of feature 2", icon: "Shield" },
                { title: "Feature 3", description: "Description of feature 3", icon: "Clock" },
              ],
            },
            order: 1,
          },
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "testimonials",
            content: {
              title: "What Our Customers Say",
              testimonials: [
                {
                  quote: "This product changed my business!",
                  author: "Jane Doe",
                  role: "CEO",
                  company: "Example Co",
                },
              ],
            },
            order: 2,
          },
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "cta-section",
            content: {
              headline: "Ready to Get Started?",
              description: "Join thousands of happy customers today.",
              primaryCtaText: "Start Free Trial",
              primaryCtaLink: "/signup",
            },
            order: 3,
          },
        ],
      },
      {
        name: "Photography Portfolio",
        slug: "photography-portfolio",
        description: "Portfolio page for photographers with gallery and contact",
        industry: "photography",
        tags: ["portfolio", "photography", "gallery", "creative"],
        components: [
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "hero",
            content: {
              headline: "Capturing Moments",
              subheadline: "Professional photography for every occasion",
              ctaText: "View Portfolio",
              ctaLink: "#gallery",
            },
            order: 0,
          },
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "image-gallery",
            content: {
              title: "Recent Work",
              images: [],
              columns: 3,
            },
            order: 1,
          },
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "testimonials",
            content: {
              title: "Client Reviews",
              testimonials: [],
            },
            order: 2,
          },
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "contact-form",
            content: {
              title: "Get in Touch",
              subtitle: "Let's discuss your next project",
            },
            order: 3,
          },
        ],
      },
      {
        name: "Pricing Page",
        slug: "pricing-page",
        description: "Pricing page with tiers, FAQ, and comparison",
        industry: "general",
        tags: ["pricing", "plans", "comparison"],
        components: [
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "hero",
            content: {
              headline: "Simple, Transparent Pricing",
              subheadline: "Choose the plan that works for you",
            },
            order: 0,
          },
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "pricing-table",
            content: {
              title: "Our Plans",
              plans: [],
            },
            order: 1,
          },
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "faq-accordion",
            content: {
              title: "Frequently Asked Questions",
              faqs: [],
            },
            order: 2,
          },
          {
            id: generateComponentId(),
            componentId: "",
            componentSlug: "cta-section",
            content: {
              headline: "Still Have Questions?",
              description: "Our team is here to help.",
              primaryCtaText: "Contact Sales",
              primaryCtaLink: "/contact",
            },
            order: 3,
          },
        ],
      },
    ];

    let created = 0;
    for (const template of defaultTemplates) {
      const existing = await prisma.cMSPageTemplate.findUnique({
        where: { slug: template.slug },
      });

      if (!existing) {
        await prisma.cMSPageTemplate.create({
          data: {
            ...template,
            isGlobal: true,
            createdBy: user?.id,
          },
        });
        created++;
      }
    }

    return success({ created });
  } catch (error) {
    console.error("Error seeding default templates:", error);
    return fail("Failed to seed templates");
  }
}
