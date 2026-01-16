"use server";

import { db } from "@/lib/db";
import type {
  CMSComponentType,
  CMSComponentCategory,
} from "@prisma/client";

// NOTE: Types cannot be exported from "use server" files.
// Import types directly from "./page-builder-utils" instead:
// - ComponentFieldType, ComponentField, ComponentSchema, PageComponentInstance, ComponentWithSchema

// Import constants from the separate constants file
import {
  COMPONENT_SCHEMAS,
  DEFAULT_COMPONENT_CONTENT,
  COMPONENT_TYPE_CATEGORY,
} from "./page-builder-constants";

import type { ComponentSchema, ComponentWithSchema } from "./page-builder-utils";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get component schema for a type (async to satisfy server action requirements)
 */
export async function getComponentSchema(type: CMSComponentType): Promise<ComponentSchema> {
  return COMPONENT_SCHEMAS[type];
}

/**
 * Get default content for a type (async to satisfy server action requirements)
 */
export async function getDefaultContent(type: CMSComponentType): Promise<Record<string, unknown>> {
  return DEFAULT_COMPONENT_CONTENT[type];
}

// ============================================================================
// DATABASE FUNCTIONS
// ============================================================================

/**
 * Get all active components from database
 */
export async function getComponents(): Promise<ComponentWithSchema[]> {
  const components = await db.cMSComponent.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });

  return components.map((c) => ({
    ...c,
    schema: c.schema as ComponentSchema,
    defaultContent: c.defaultContent as Record<string, unknown>,
  }));
}

/**
 * Get component by slug
 */
export async function getComponentBySlug(slug: string): Promise<ComponentWithSchema | null> {
  const component = await db.cMSComponent.findUnique({
    where: { slug },
  });

  if (!component) return null;

  return {
    ...component,
    schema: component.schema as ComponentSchema,
    defaultContent: component.defaultContent as Record<string, unknown>,
  };
}

/**
 * Get components grouped by category
 */
export async function getComponentsByCategory(): Promise<
  Record<CMSComponentCategory, ComponentWithSchema[]>
> {
  const components = await getComponents();

  const grouped = {
    hero: [],
    content: [],
    social: [],
    conversion: [],
    navigation: [],
    data: [],
    custom: [],
  } as Record<CMSComponentCategory, ComponentWithSchema[]>;

  for (const component of components) {
    grouped[component.category].push(component);
  }

  return grouped;
}

/**
 * Seed default components into database
 */
export async function seedDefaultComponents(): Promise<void> {
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

  for (let i = 0; i < componentDefs.length; i++) {
    const def = componentDefs[i];
    await db.cMSComponent.upsert({
      where: { slug: def.slug },
      update: {},
      create: {
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
  }
}
