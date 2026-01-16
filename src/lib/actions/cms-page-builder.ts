"use server";

import { db } from "@/lib/db";
import { isSuperAdmin, currentUser } from "@/lib/auth/super-admin";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import type {
  CMSComponent,
  CMSComponentType,
  CMSComponentCategory,
  MarketingPage,
  PageLayoutMode,
} from "@prisma/client";
import type {
  PageComponentInstance,
  ComponentSchema,
  ComponentWithSchema,
} from "@/lib/cms/page-builder-utils";
import {
  COMPONENT_SCHEMAS,
  DEFAULT_COMPONENT_CONTENT,
  COMPONENT_TYPE_CATEGORY,
} from "@/lib/cms/page-builder-constants";
import { generateComponentId } from "@/lib/cms/page-builder-utils";

// ============================================================================
// COMPONENT LIBRARY ACTIONS
// ============================================================================

/**
 * Get all active components from library
 */
export async function getCMSComponents(options?: {
  category?: CMSComponentCategory;
  includeInactive?: boolean;
}): Promise<ActionResult<ComponentWithSchema[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const components = await db.cMSComponent.findMany({
      where: {
        ...(options?.includeInactive ? {} : { isActive: true }),
        ...(options?.category ? { category: options.category } : {}),
      },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    return success(
      components.map((c) => ({
        ...c,
        schema: c.schema as ComponentSchema,
        defaultContent: c.defaultContent as Record<string, unknown>,
      }))
    );
  } catch (error) {
    console.error("Error fetching components:", error);
    return fail("Failed to fetch components");
  }
}

/**
 * Get component by ID
 */
export async function getCMSComponent(
  id: string
): Promise<ActionResult<ComponentWithSchema>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const component = await db.cMSComponent.findUnique({
      where: { id },
    });

    if (!component) {
      return fail("Component not found");
    }

    return success({
      ...component,
      schema: component.schema as ComponentSchema,
      defaultContent: component.defaultContent as Record<string, unknown>,
    });
  } catch (error) {
    console.error("Error fetching component:", error);
    return fail("Failed to fetch component");
  }
}

/**
 * Get component by slug
 */
export async function getCMSComponentBySlug(
  slug: string
): Promise<ActionResult<ComponentWithSchema>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const component = await db.cMSComponent.findUnique({
      where: { slug },
    });

    if (!component) {
      return fail("Component not found");
    }

    return success({
      ...component,
      schema: component.schema as ComponentSchema,
      defaultContent: component.defaultContent as Record<string, unknown>,
    });
  } catch (error) {
    console.error("Error fetching component:", error);
    return fail("Failed to fetch component");
  }
}

/**
 * Create a new custom component
 */
export async function createCMSComponent(params: {
  name: string;
  slug: string;
  description?: string;
  type: CMSComponentType;
  category?: CMSComponentCategory;
  schema?: ComponentSchema;
  defaultContent?: Record<string, unknown>;
  icon?: string;
  thumbnail?: string;
}): Promise<ActionResult<CMSComponent>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Check for existing slug
    const existing = await db.cMSComponent.findUnique({
      where: { slug: params.slug },
    });

    if (existing) {
      return fail("Component with this slug already exists");
    }

    const component = await db.cMSComponent.create({
      data: {
        name: params.name,
        slug: params.slug,
        description: params.description,
        type: params.type,
        category: params.category || COMPONENT_TYPE_CATEGORY[params.type],
        schema: params.schema || COMPONENT_SCHEMAS[params.type],
        defaultContent: params.defaultContent || DEFAULT_COMPONENT_CONTENT[params.type],
        icon: params.icon,
        thumbnail: params.thumbnail,
        isActive: true,
      },
    });

    return success(component);
  } catch (error) {
    console.error("Error creating component:", error);
    return fail("Failed to create component");
  }
}

/**
 * Update a component
 */
export async function updateCMSComponent(
  id: string,
  params: {
    name?: string;
    description?: string;
    schema?: ComponentSchema;
    defaultContent?: Record<string, unknown>;
    icon?: string;
    thumbnail?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
): Promise<ActionResult<CMSComponent>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const component = await db.cMSComponent.update({
      where: { id },
      data: {
        ...(params.name !== undefined && { name: params.name }),
        ...(params.description !== undefined && { description: params.description }),
        ...(params.schema !== undefined && { schema: params.schema }),
        ...(params.defaultContent !== undefined && { defaultContent: params.defaultContent }),
        ...(params.icon !== undefined && { icon: params.icon }),
        ...(params.thumbnail !== undefined && { thumbnail: params.thumbnail }),
        ...(params.sortOrder !== undefined && { sortOrder: params.sortOrder }),
        ...(params.isActive !== undefined && { isActive: params.isActive }),
      },
    });

    return success(component);
  } catch (error) {
    console.error("Error updating component:", error);
    return fail("Failed to update component");
  }
}

/**
 * Delete a component (soft delete by setting inactive)
 */
export async function deleteCMSComponent(id: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await db.cMSComponent.update({
      where: { id },
      data: { isActive: false },
    });

    return success(undefined);
  } catch (error) {
    console.error("Error deleting component:", error);
    return fail("Failed to delete component");
  }
}

// ============================================================================
// PAGE BUILDER ACTIONS
// ============================================================================

/**
 * Get page with components for builder
 */
export async function getPageForBuilder(
  pageId: string
): Promise<
  ActionResult<{
    page: MarketingPage;
    components: PageComponentInstance[];
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const page = await db.marketingPage.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return fail("Page not found");
    }

    const components = (page.components as PageComponentInstance[]) || [];

    return success({ page, components });
  } catch (error) {
    console.error("Error fetching page for builder:", error);
    return fail("Failed to fetch page");
  }
}

/**
 * Update page components
 */
export async function updatePageComponents(
  pageId: string,
  components: PageComponentInstance[]
): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();

    const page = await db.marketingPage.update({
      where: { id: pageId },
      data: {
        components,
        layoutMode: "components",
        lastEditedBy: user?.id,
        lastEditedAt: new Date(),
        hasDraft: true,
      },
    });

    return success(page);
  } catch (error) {
    console.error("Error updating page components:", error);
    return fail("Failed to update page components");
  }
}

/**
 * Add component to page
 */
export async function addComponentToPage(
  pageId: string,
  componentSlug: string,
  atIndex?: number
): Promise<ActionResult<{ page: MarketingPage; instance: PageComponentInstance }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Get the component
    const component = await db.cMSComponent.findUnique({
      where: { slug: componentSlug },
    });

    if (!component) {
      return fail("Component not found");
    }

    // Get the page
    const page = await db.marketingPage.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return fail("Page not found");
    }

    const user = await currentUser();
    const existingComponents = (page.components as PageComponentInstance[]) || [];

    // Create new instance
    const instance: PageComponentInstance = {
      id: generateComponentId(),
      componentId: component.id,
      componentSlug: component.slug,
      content: component.defaultContent as Record<string, unknown>,
      order: existingComponents.length,
    };

    // Insert at position or end
    let newComponents: PageComponentInstance[];
    if (atIndex !== undefined && atIndex >= 0 && atIndex <= existingComponents.length) {
      newComponents = [...existingComponents];
      newComponents.splice(atIndex, 0, instance);
      newComponents = newComponents.map((c, i) => ({ ...c, order: i }));
    } else {
      newComponents = [...existingComponents, instance];
    }

    // Update page
    const updatedPage = await db.marketingPage.update({
      where: { id: pageId },
      data: {
        components: newComponents,
        layoutMode: "components",
        lastEditedBy: user?.id,
        lastEditedAt: new Date(),
        hasDraft: true,
      },
    });

    // Track component usage
    await db.cMSComponent.update({
      where: { id: component.id },
      data: { usageCount: { increment: 1 } },
    });

    return success({ page: updatedPage, instance });
  } catch (error) {
    console.error("Error adding component to page:", error);
    return fail("Failed to add component");
  }
}

/**
 * Remove component from page
 */
export async function removeComponentFromPage(
  pageId: string,
  instanceId: string
): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const page = await db.marketingPage.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return fail("Page not found");
    }

    const user = await currentUser();
    const existingComponents = (page.components as PageComponentInstance[]) || [];
    const removedComponent = existingComponents.find((c) => c.id === instanceId);

    const newComponents = existingComponents
      .filter((c) => c.id !== instanceId)
      .map((c, i) => ({ ...c, order: i }));

    const updatedPage = await db.marketingPage.update({
      where: { id: pageId },
      data: {
        components: newComponents,
        lastEditedBy: user?.id,
        lastEditedAt: new Date(),
        hasDraft: true,
      },
    });

    // Decrement usage count
    if (removedComponent) {
      await db.cMSComponent.update({
        where: { id: removedComponent.componentId },
        data: { usageCount: { decrement: 1 } },
      });
    }

    return success(updatedPage);
  } catch (error) {
    console.error("Error removing component from page:", error);
    return fail("Failed to remove component");
  }
}

/**
 * Reorder components on page
 */
export async function reorderPageComponents(
  pageId: string,
  fromIndex: number,
  toIndex: number
): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const page = await db.marketingPage.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return fail("Page not found");
    }

    const user = await currentUser();
    const components = (page.components as PageComponentInstance[]) || [];

    if (fromIndex < 0 || fromIndex >= components.length || toIndex < 0 || toIndex >= components.length) {
      return fail("Invalid indices");
    }

    const result = [...components];
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);
    const reorderedComponents = result.map((c, i) => ({ ...c, order: i }));

    const updatedPage = await db.marketingPage.update({
      where: { id: pageId },
      data: {
        components: reorderedComponents,
        lastEditedBy: user?.id,
        lastEditedAt: new Date(),
        hasDraft: true,
      },
    });

    return success(updatedPage);
  } catch (error) {
    console.error("Error reordering components:", error);
    return fail("Failed to reorder components");
  }
}

/**
 * Update component instance content
 */
export async function updateComponentInstanceContent(
  pageId: string,
  instanceId: string,
  content: Record<string, unknown>
): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const page = await db.marketingPage.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return fail("Page not found");
    }

    const user = await currentUser();
    const components = (page.components as PageComponentInstance[]) || [];

    const newComponents = components.map((c) =>
      c.id === instanceId ? { ...c, content: { ...c.content, ...content } } : c
    );

    const updatedPage = await db.marketingPage.update({
      where: { id: pageId },
      data: {
        components: newComponents,
        lastEditedBy: user?.id,
        lastEditedAt: new Date(),
        hasDraft: true,
      },
    });

    return success(updatedPage);
  } catch (error) {
    console.error("Error updating component content:", error);
    return fail("Failed to update component content");
  }
}

/**
 * Duplicate component instance on page
 */
export async function duplicateComponentInstance(
  pageId: string,
  instanceId: string
): Promise<ActionResult<{ page: MarketingPage; instance: PageComponentInstance }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const page = await db.marketingPage.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      return fail("Page not found");
    }

    const user = await currentUser();
    const components = (page.components as PageComponentInstance[]) || [];
    const index = components.findIndex((c) => c.id === instanceId);

    if (index === -1) {
      return fail("Component instance not found");
    }

    const original = components[index];
    const duplicate: PageComponentInstance = {
      ...original,
      id: generateComponentId(),
      content: JSON.parse(JSON.stringify(original.content)),
    };

    const newComponents = [...components];
    newComponents.splice(index + 1, 0, duplicate);
    const reorderedComponents = newComponents.map((c, i) => ({ ...c, order: i }));

    const updatedPage = await db.marketingPage.update({
      where: { id: pageId },
      data: {
        components: reorderedComponents,
        lastEditedBy: user?.id,
        lastEditedAt: new Date(),
        hasDraft: true,
      },
    });

    // Track component usage
    await db.cMSComponent.update({
      where: { id: original.componentId },
      data: { usageCount: { increment: 1 } },
    });

    return success({ page: updatedPage, instance: duplicate });
  } catch (error) {
    console.error("Error duplicating component:", error);
    return fail("Failed to duplicate component");
  }
}

/**
 * Switch page layout mode
 */
export async function setPageLayoutMode(
  pageId: string,
  mode: PageLayoutMode
): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();

    const page = await db.marketingPage.update({
      where: { id: pageId },
      data: {
        layoutMode: mode,
        lastEditedBy: user?.id,
        lastEditedAt: new Date(),
        hasDraft: true,
      },
    });

    return success(page);
  } catch (error) {
    console.error("Error setting layout mode:", error);
    return fail("Failed to set layout mode");
  }
}

/**
 * Seed default components (for setup)
 */
export async function seedDefaultComponents(): Promise<ActionResult<{ created: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const componentDefs: {
      name: string;
      slug: string;
      description: string;
      type: CMSComponentType;
      icon: string;
    }[] = [
      { name: "Hero Section", slug: "hero", description: "Page hero with headline and CTA", type: "hero", icon: "layout" },
      { name: "Features Grid", slug: "features-grid", description: "Grid of feature cards", type: "features_grid", icon: "grid" },
      { name: "Features List", slug: "features-list", description: "List of features with icons", type: "features_list", icon: "list" },
      { name: "Testimonials", slug: "testimonials", description: "Customer testimonials", type: "testimonials", icon: "message-square" },
      { name: "FAQ Accordion", slug: "faq-accordion", description: "Expandable FAQ section", type: "faq_accordion", icon: "help-circle" },
      { name: "CTA Section", slug: "cta-section", description: "Call-to-action block", type: "cta_section", icon: "mouse-pointer" },
      { name: "Stats & Metrics", slug: "stats-metrics", description: "Statistics display", type: "stats_metrics", icon: "bar-chart" },
      { name: "Pricing Table", slug: "pricing-table", description: "Pricing tiers display", type: "pricing_table", icon: "credit-card" },
      { name: "Team Grid", slug: "team-grid", description: "Team member grid", type: "team_grid", icon: "users" },
      { name: "Logo Cloud", slug: "logo-cloud", description: "Partner/client logos", type: "logo_cloud", icon: "image" },
      { name: "Image Gallery", slug: "image-gallery", description: "Image gallery", type: "image_gallery", icon: "images" },
      { name: "Text Block", slug: "text-block", description: "Rich text content", type: "text_block", icon: "file-text" },
      { name: "Video Embed", slug: "video-embed", description: "Video player embed", type: "video_embed", icon: "play-circle" },
      { name: "Comparison Table", slug: "comparison-table", description: "Feature comparison", type: "comparison_table", icon: "table" },
      { name: "Timeline", slug: "timeline", description: "Timeline display", type: "timeline", icon: "clock" },
      { name: "Cards Grid", slug: "cards-grid", description: "Generic card grid", type: "cards_grid", icon: "squares" },
      { name: "Contact Form", slug: "contact-form", description: "Contact form section", type: "contact_form", icon: "mail" },
      { name: "Newsletter Signup", slug: "newsletter-signup", description: "Newsletter signup", type: "newsletter_signup", icon: "send" },
      { name: "Social Proof", slug: "social-proof", description: "Social proof section", type: "social_proof", icon: "star" },
      { name: "Benefits List", slug: "benefits-list", description: "Benefits/value props", type: "benefits_list", icon: "check-circle" },
      { name: "Custom HTML", slug: "custom", description: "Custom HTML content", type: "custom", icon: "code" },
    ];

    let created = 0;

    for (let i = 0; i < componentDefs.length; i++) {
      const def = componentDefs[i];
      const existing = await db.cMSComponent.findUnique({ where: { slug: def.slug } });

      if (!existing) {
        await db.cMSComponent.create({
          data: {
            name: def.name,
            slug: def.slug,
            description: def.description,
            type: def.type,
            category: COMPONENT_TYPE_CATEGORY[def.type],
            schema: COMPONENT_SCHEMAS[def.type],
            defaultContent: DEFAULT_COMPONENT_CONTENT[def.type],
            icon: def.icon,
            sortOrder: i,
            isActive: true,
          },
        });
        created++;
      }
    }

    return success({ created });
  } catch (error) {
    console.error("Error seeding components:", error);
    return fail("Failed to seed components");
  }
}

/**
 * Get component statistics
 */
export async function getComponentStats(): Promise<
  ActionResult<{
    totalComponents: number;
    activeComponents: number;
    byCategory: Record<string, number>;
    mostUsed: { slug: string; name: string; usageCount: number }[];
  }>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const [total, active, byCategory, mostUsed] = await Promise.all([
      db.cMSComponent.count(),
      db.cMSComponent.count({ where: { isActive: true } }),
      db.cMSComponent.groupBy({
        by: ["category"],
        _count: true,
      }),
      db.cMSComponent.findMany({
        where: { isActive: true },
        orderBy: { usageCount: "desc" },
        take: 5,
        select: { slug: true, name: true, usageCount: true },
      }),
    ]);

    const categoryCount = byCategory.reduce(
      (acc, item) => {
        acc[item.category] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    return success({
      totalComponents: total,
      activeComponents: active,
      byCategory: categoryCount,
      mostUsed,
    });
  } catch (error) {
    console.error("Error fetching component stats:", error);
    return fail("Failed to fetch component statistics");
  }
}
