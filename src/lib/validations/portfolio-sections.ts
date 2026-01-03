import { z } from "zod";
import type { PortfolioSectionType } from "@prisma/client";

// ============================================================================
// HERO SECTION
// ============================================================================

export const heroSectionConfigSchema = z.object({
  title: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  backgroundImageUrl: z.string().url().optional().nullable(),
  backgroundVideoUrl: z.string().url().optional().nullable(),
  ctaText: z.string().optional().default("Get in Touch"),
  ctaLink: z.string().optional().default("#contact"),
  overlay: z.enum(["none", "light", "dark", "gradient"]).default("dark"),
  alignment: z.enum(["left", "center", "right"]).default("center"),
});

export type HeroSectionConfig = z.infer<typeof heroSectionConfigSchema>;

// ============================================================================
// ABOUT SECTION
// ============================================================================

export const aboutSectionConfigSchema = z.object({
  photoUrl: z.string().url().optional().nullable(),
  title: z.string().optional().default("About Me"),
  content: z.string().optional().default(""),
  highlights: z.array(z.string()).default([]),
});

export type AboutSectionConfig = z.infer<typeof aboutSectionConfigSchema>;

// ============================================================================
// GALLERY SECTION
// ============================================================================

export const gallerySectionConfigSchema = z.object({
  projectIds: z.array(z.string()).default([]),
  layout: z.enum(["grid", "masonry", "carousel"]).default("grid"),
  columns: z.number().min(1).max(6).default(3),
  showProjectNames: z.boolean().default(true),
});

export type GallerySectionConfig = z.infer<typeof gallerySectionConfigSchema>;

// ============================================================================
// SERVICES SECTION
// ============================================================================

export const serviceItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(""),
  price: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
});

export const servicesSectionConfigSchema = z.object({
  title: z.string().optional().default("Services"),
  items: z.array(serviceItemSchema).default([]),
  showPricing: z.boolean().default(false),
});

export type ServiceItem = z.infer<typeof serviceItemSchema>;
export type ServicesSectionConfig = z.infer<typeof servicesSectionConfigSchema>;

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

export const testimonialItemSchema = z.object({
  id: z.string(),
  quote: z.string(),
  clientName: z.string(),
  clientTitle: z.string().optional().default(""),
  photoUrl: z.string().url().optional().nullable(),
});

export const testimonialsSectionConfigSchema = z.object({
  title: z.string().optional().default("What Clients Say"),
  items: z.array(testimonialItemSchema).default([]),
  layout: z.enum(["cards", "carousel", "list"]).default("cards"),
});

export type TestimonialItem = z.infer<typeof testimonialItemSchema>;
export type TestimonialsSectionConfig = z.infer<typeof testimonialsSectionConfigSchema>;

// ============================================================================
// AWARDS SECTION
// ============================================================================

export const awardItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string().optional().default(""),
  year: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
});

export const awardsSectionConfigSchema = z.object({
  title: z.string().optional().default("Awards & Recognition"),
  items: z.array(awardItemSchema).default([]),
});

export type AwardItem = z.infer<typeof awardItemSchema>;
export type AwardsSectionConfig = z.infer<typeof awardsSectionConfigSchema>;

// ============================================================================
// CONTACT SECTION
// ============================================================================

export const contactFieldSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(["text", "email", "phone", "textarea"]),
  required: z.boolean().default(false),
});

export const contactSectionConfigSchema = z.object({
  title: z.string().optional().default("Get in Touch"),
  subtitle: z.string().optional().default(""),
  showForm: z.boolean().default(true),
  showMap: z.boolean().default(false),
  showSocial: z.boolean().default(true),
  showEmail: z.boolean().default(true),
  showPhone: z.boolean().default(true),
  customFields: z.array(contactFieldSchema).default([]),
  mapAddress: z.string().optional().nullable(),
});

export type ContactField = z.infer<typeof contactFieldSchema>;
export type ContactSectionConfig = z.infer<typeof contactSectionConfigSchema>;

// ============================================================================
// FAQ SECTION
// ============================================================================

export const faqItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
});

export const faqSectionConfigSchema = z.object({
  title: z.string().optional().default("Frequently Asked Questions"),
  items: z.array(faqItemSchema).default([]),
});

export type FAQItem = z.infer<typeof faqItemSchema>;
export type FAQSectionConfig = z.infer<typeof faqSectionConfigSchema>;

// ============================================================================
// TEXT BLOCK
// ============================================================================

export const textSectionConfigSchema = z.object({
  content: z.string().default(""),
  alignment: z.enum(["left", "center", "right"]).default("left"),
});

export type TextSectionConfig = z.infer<typeof textSectionConfigSchema>;

// ============================================================================
// IMAGE BLOCK
// ============================================================================

export const imageSectionConfigSchema = z.object({
  url: z.string().url().optional().nullable(),
  alt: z.string().optional().default(""),
  caption: z.string().optional().default(""),
  layout: z.enum(["full", "contained", "float-left", "float-right"]).default("contained"),
});

export type ImageSectionConfig = z.infer<typeof imageSectionConfigSchema>;

// ============================================================================
// VIDEO BLOCK
// ============================================================================

export const videoSectionConfigSchema = z.object({
  url: z.string().url().optional().default(""),
  autoplay: z.boolean().default(false),
  loop: z.boolean().default(false),
  muted: z.boolean().default(true),
});

export type VideoSectionConfig = z.infer<typeof videoSectionConfigSchema>;

// ============================================================================
// SPACER BLOCK
// ============================================================================

export const spacerSectionConfigSchema = z.object({
  height: z.number().min(20).max(300).default(80),
});

export type SpacerSectionConfig = z.infer<typeof spacerSectionConfigSchema>;

// ============================================================================
// CUSTOM HTML BLOCK
// ============================================================================

export const customHtmlSectionConfigSchema = z.object({
  html: z.string().default(""),
});

export type CustomHtmlSectionConfig = z.infer<typeof customHtmlSectionConfigSchema>;

// ============================================================================
// SECTION CONFIG UNION
// ============================================================================

export type SectionConfig =
  | HeroSectionConfig
  | AboutSectionConfig
  | GallerySectionConfig
  | ServicesSectionConfig
  | TestimonialsSectionConfig
  | AwardsSectionConfig
  | ContactSectionConfig
  | FAQSectionConfig
  | TextSectionConfig
  | ImageSectionConfig
  | VideoSectionConfig
  | SpacerSectionConfig
  | CustomHtmlSectionConfig;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function getSectionConfigSchema(sectionType: PortfolioSectionType) {
  const schemas: Record<PortfolioSectionType, z.ZodSchema> = {
    hero: heroSectionConfigSchema,
    about: aboutSectionConfigSchema,
    gallery: gallerySectionConfigSchema,
    services: servicesSectionConfigSchema,
    testimonials: testimonialsSectionConfigSchema,
    awards: awardsSectionConfigSchema,
    contact: contactSectionConfigSchema,
    faq: faqSectionConfigSchema,
    text: textSectionConfigSchema,
    image: imageSectionConfigSchema,
    video: videoSectionConfigSchema,
    spacer: spacerSectionConfigSchema,
    custom_html: customHtmlSectionConfigSchema,
  };

  return schemas[sectionType];
}

export function validateSectionConfig(
  sectionType: PortfolioSectionType,
  config: unknown
): { success: true; data: SectionConfig } | { success: false; error: string } {
  const schema = getSectionConfigSchema(sectionType);

  try {
    const data = schema.parse(config);
    return { success: true, data: data as SectionConfig };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((e) => e.message).join(", ") };
    }
    return { success: false, error: "Invalid configuration" };
  }
}

export function getDefaultConfig(sectionType: PortfolioSectionType): SectionConfig {
  const schema = getSectionConfigSchema(sectionType);
  return schema.parse({}) as SectionConfig;
}

// ============================================================================
// PORTFOLIO WEBSITE VALIDATION
// ============================================================================

export const updatePortfolioSettingsSchema = z.object({
  portfolioType: z.enum(["photographer", "client"]).optional(),
  template: z.enum(["modern", "bold", "elegant", "minimal", "creative"]).optional(),
  fontHeading: z.string().optional().nullable(),
  fontBody: z.string().optional().nullable(),
  socialLinks: z
    .array(
      z.object({
        platform: z.string(),
        url: z.string().url(),
      })
    )
    .optional()
    .nullable(),
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  showBranding: z.boolean().optional(),
});

export type UpdatePortfolioSettingsInput = z.infer<typeof updatePortfolioSettingsSchema>;

export const createSectionSchema = z.object({
  sectionType: z.enum([
    "hero",
    "about",
    "gallery",
    "services",
    "testimonials",
    "awards",
    "contact",
    "faq",
    "text",
    "image",
    "video",
    "spacer",
    "custom_html",
  ]),
  position: z.number().optional(),
  config: z.record(z.string(), z.unknown()),
  customTitle: z.string().optional().nullable(),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;

export const updateSectionSchema = z.object({
  position: z.number().optional(),
  isVisible: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  customTitle: z.string().optional().nullable(),
});

export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
