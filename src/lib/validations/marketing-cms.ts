import { z } from "zod";

// ============================================================================
// HELPER SCHEMAS
// ============================================================================

/**
 * Optional URL field that accepts empty strings and converts them to null.
 * Use this for all optional URL fields in forms where empty strings are passed.
 */
const optionalUrl = z
  .string()
  .transform((val) => (val === "" ? null : val))
  .pipe(z.string().url().nullable())
  .optional()
  .nullable();

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

export const ctaButtonSchema = z.object({
  label: z.string().default("Get Started"),
  href: z.string().default("/signup"),
  variant: z.enum(["primary", "secondary", "outline"]).default("primary"),
});

export type CTAButton = z.infer<typeof ctaButtonSchema>;

export const statItemSchema = z.object({
  id: z.string(),
  value: z.string(),
  label: z.string(),
  suffix: z.string().optional(),
});

export type StatItem = z.infer<typeof statItemSchema>;

export const featureItemSchema = z.object({
  id: z.string(),
  icon: z.string().optional(),
  title: z.string(),
  description: z.string(),
});

export type FeatureItem = z.infer<typeof featureItemSchema>;

// ============================================================================
// HOMEPAGE CONTENT
// ============================================================================

export const homepageHeroSchema = z.object({
  badge: z.string().optional(),
  title: z.string(),
  titleHighlight: z.string().optional(), // Word to highlight in title
  subtitle: z.string(),
  primaryCta: ctaButtonSchema,
  secondaryCta: ctaButtonSchema.optional(),
  trustedBy: z.array(z.object({
    id: z.string(),
    name: z.string(),
    logoUrl: z.string().optional(),
  })).default([]),
});

export const homepageStatsSchema = z.object({
  title: z.string().optional(),
  items: z.array(statItemSchema).default([]),
});

export const homepageFeaturesSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  items: z.array(featureItemSchema).default([]),
});

export const homepageTestimonialsSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
});

export const homepageCtaSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  cta: ctaButtonSchema,
});

export const homepageContentSchema = z.object({
  hero: homepageHeroSchema,
  stats: homepageStatsSchema.optional(),
  features: homepageFeaturesSchema.optional(),
  testimonials: homepageTestimonialsSchema.optional(),
  cta: homepageCtaSchema.optional(),
});

export type HomepageContent = z.infer<typeof homepageContentSchema>;

// ============================================================================
// PRICING CONTENT
// ============================================================================

export const pricingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  monthlyPrice: z.number(),
  yearlyPrice: z.number(),
  features: z.array(z.string()),
  highlighted: z.boolean().default(false),
  badge: z.string().optional(),
  ctaLabel: z.string().default("Get Started"),
});

export type PricingPlan = z.infer<typeof pricingPlanSchema>;

export const comparisonFeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  free: z.union([z.boolean(), z.string()]),
  pro: z.union([z.boolean(), z.string()]),
  studio: z.union([z.boolean(), z.string()]),
  enterprise: z.union([z.boolean(), z.string()]),
});

export type ComparisonFeature = z.infer<typeof comparisonFeatureSchema>;

export const pricingContentSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    badge: z.string().optional(),
  }),
  plans: z.array(pricingPlanSchema).default([]),
  comparison: z.object({
    title: z.string(),
    features: z.array(comparisonFeatureSchema),
  }).optional(),
  faqTitle: z.string().optional(),
  ctaSection: homepageCtaSchema.optional(),
});

export type PricingContent = z.infer<typeof pricingContentSchema>;

// ============================================================================
// FEATURES PAGE CONTENT
// ============================================================================

export const featureDetailSchema = z.object({
  id: z.string(),
  icon: z.string().optional(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  benefits: z.array(z.string()).default([]),
});

export type FeatureDetail = z.infer<typeof featureDetailSchema>;

export const featuresPageContentSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    badge: z.string().optional(),
  }),
  introduction: z.string().optional(),
  features: z.array(featureDetailSchema).default([]),
  ctaSection: homepageCtaSchema.optional(),
});

export type FeaturesPageContent = z.infer<typeof featuresPageContentSchema>;

// ============================================================================
// INDUSTRIES PAGE CONTENT
// ============================================================================

export const industryUseCaseSchema = z.object({
  id: z.string(),
  icon: z.string().optional(),
  title: z.string(),
  description: z.string(),
});

export type IndustryUseCase = z.infer<typeof industryUseCaseSchema>;

export const industryPageContentSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    backgroundImage: z.string().optional(),
  }),
  introduction: z.string().optional(),
  useCases: z.array(industryUseCaseSchema).default([]),
  features: z.array(featureItemSchema).default([]),
  ctaSection: homepageCtaSchema.optional(),
});

export type IndustryPageContent = z.infer<typeof industryPageContentSchema>;

// ============================================================================
// ABOUT PAGE CONTENT
// ============================================================================

export const aboutPageContentSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
  }),
  story: z.object({
    title: z.string(),
    content: z.string(), // Markdown/rich text
  }).optional(),
  mission: z.object({
    title: z.string(),
    content: z.string(),
  }).optional(),
  values: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
  })).default([]),
  teamTitle: z.string().optional(),
  ctaSection: homepageCtaSchema.optional(),
});

export type AboutPageContent = z.infer<typeof aboutPageContentSchema>;

// ============================================================================
// LEGAL PAGE CONTENT
// ============================================================================

export const legalPageContentSchema = z.object({
  title: z.string(),
  lastUpdated: z.string().optional(),
  content: z.string(), // Markdown/rich text
});

export type LegalPageContent = z.infer<typeof legalPageContentSchema>;

// ============================================================================
// BLOG INDEX CONTENT
// ============================================================================

export const blogIndexContentSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
  }),
  featuredTitle: z.string().optional(),
  categoriesTitle: z.string().optional(),
});

export type BlogIndexContent = z.infer<typeof blogIndexContentSchema>;

// ============================================================================
// NAVIGATION CONTENT
// ============================================================================

export const navLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
});

export type NavLink = z.infer<typeof navLinkSchema>;

export const navDropdownItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export type NavDropdownItem = z.infer<typeof navDropdownItemSchema>;

export const navDropdownSchema = z.object({
  id: z.string(),
  label: z.string(),
  items: z.array(navDropdownItemSchema),
});

export type NavDropdown = z.infer<typeof navDropdownSchema>;

export const navbarContentSchema = z.object({
  logo: z.object({
    text: z.string().optional(),
    imageUrl: z.string().optional(),
  }).optional(),
  links: z.array(z.union([navLinkSchema, navDropdownSchema])).default([]),
  ctaButton: ctaButtonSchema.optional(),
});

export type NavbarContent = z.infer<typeof navbarContentSchema>;

export const footerColumnSchema = z.object({
  id: z.string(),
  title: z.string(),
  links: z.array(navLinkSchema),
});

export type FooterColumn = z.infer<typeof footerColumnSchema>;

export const socialLinkSchema = z.object({
  id: z.string(),
  platform: z.enum(["twitter", "facebook", "instagram", "linkedin", "youtube", "tiktok", "github"]),
  url: z.string().url(),
});

export type SocialLink = z.infer<typeof socialLinkSchema>;

export const footerContentSchema = z.object({
  columns: z.array(footerColumnSchema).default([]),
  socialLinks: z.array(socialLinkSchema).default([]),
  copyrightText: z.string().optional(),
  bottomLinks: z.array(navLinkSchema).default([]),
});

export type FooterContent = z.infer<typeof footerContentSchema>;

// ============================================================================
// BLOG POST VALIDATION
// ============================================================================

export const createBlogPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  featuredImg: optionalUrl,
  category: z.enum(["tips", "tutorials", "news", "case_studies", "product_updates", "industry_insights"]),
  tags: z.array(z.string()).default([]),
  authorName: z.string().optional(),
  authorImage: optionalUrl,
  authorBio: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publishedAt: z.string().datetime().optional().nullable(),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;

export const updateBlogPostSchema = createBlogPostSchema.partial().extend({
  id: z.string(),
});

export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;

// ============================================================================
// TEAM MEMBER VALIDATION
// ============================================================================

export const createTeamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  bio: z.string().optional(),
  imageUrl: optionalUrl,
  linkedIn: optionalUrl,
  twitter: optionalUrl,
  website: optionalUrl,
  sortOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;

export const updateTeamMemberSchema = createTeamMemberSchema.partial().extend({
  id: z.string(),
});

export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;

// ============================================================================
// TESTIMONIAL VALIDATION
// ============================================================================

export const createTestimonialSchema = z.object({
  quote: z.string().min(1, "Quote is required"),
  authorName: z.string().min(1, "Author name is required"),
  authorRole: z.string().optional(),
  companyName: z.string().optional(),
  authorImage: optionalUrl,
  rating: z.number().min(1).max(5).optional().nullable(),
  targetPages: z.array(z.string()).default([]),
  targetIndustry: z.enum([
    "real_estate",
    "commercial",
    "architecture",
    "events",
    "headshots",
    "food",
    "general",
  ]).default("general"),
  showOnAllPages: z.boolean().default(false),
  sortOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;

export const updateTestimonialSchema = createTestimonialSchema.partial().extend({
  id: z.string(),
});

export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;

// ============================================================================
// FAQ VALIDATION
// ============================================================================

export const createFAQSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
  category: z.enum([
    "general",
    "pricing",
    "features",
    "billing",
    "getting_started",
    "technical",
  ]).default("general"),
  targetPages: z.array(z.string()).default([]),
  sortOrder: z.number().default(0),
  isVisible: z.boolean().default(true),
});

export type CreateFAQInput = z.infer<typeof createFAQSchema>;

export const updateFAQSchema = createFAQSchema.partial().extend({
  id: z.string(),
});

export type UpdateFAQInput = z.infer<typeof updateFAQSchema>;

// ============================================================================
// MARKETING PAGE VALIDATION
// ============================================================================

export const updateMarketingPageSchema = z.object({
  slug: z.string(),
  title: z.string().optional(),
  content: z.record(z.string(), z.unknown()), // Flexible JSON content
  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(160).optional().nullable(),
  ogImage: optionalUrl,
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export type UpdateMarketingPageInput = z.infer<typeof updateMarketingPageSchema>;

// ============================================================================
// NAVIGATION VALIDATION
// ============================================================================

export const updateNavigationSchema = z.object({
  location: z.enum(["navbar", "footer"]),
  content: z.union([navbarContentSchema, footerContentSchema]),
  isActive: z.boolean().optional(),
});

export type UpdateNavigationInput = z.infer<typeof updateNavigationSchema>;

// ============================================================================
// REORDER VALIDATION
// ============================================================================

export const reorderItemsSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    sortOrder: z.number(),
  })),
});

export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>;
