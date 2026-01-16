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

// Hero section with analytics dashboard
export const homepageHeroSchema = z.object({
  badge: z.string().optional(),
  badgeHighlight: z.string().optional(),
  titleMuted: z.string().optional(), // "The Business OS for"
  titleMain: z.string(), // "Professional Photographers"
  subtitle: z.string(),
  primaryCta: ctaButtonSchema,
  secondaryCta: ctaButtonSchema.optional(),
  socialProof: z.array(z.object({
    id: z.string(),
    text: z.string(),
  })).default([]),
});

// Logos/stats section with photography types
export const homepageLogosSchema = z.object({
  stats: z.array(z.object({
    id: z.string(),
    value: z.number(),
    label: z.string(),
    suffix: z.string().optional(),
  })).default([]),
  typesLabel: z.string().optional(), // "Built for every photography specialty"
  photographyTypes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string().optional(), // Icon name like "home", "building", etc.
  })).default([]),
  benefits: z.array(z.string()).default([]),
});

// Metrics showcase section
export const homepageMetricsSchema = z.object({
  label: z.string().optional(), // "Trusted by professionals..."
  mainValue: z.number(), // 2500
  mainSuffix: z.string().optional(), // "+"
  mainLabel: z.string(), // "Photographers run their business on PhotoProOS"
  cards: z.array(z.object({
    id: z.string(),
    value: z.string(),
    label: z.string(),
    description: z.string(),
    color: z.enum(["blue", "purple", "green"]).default("blue"),
  })).default([]),
});

// How it works section
export const homepageHowItWorksSchema = z.object({
  badge: z.string().optional(),
  badgeHighlight: z.string().optional(),
  title: z.string(),
  titleHighlight: z.string().optional(),
  subtitle: z.string(),
  steps: z.array(z.object({
    id: z.string(),
    number: z.string(),
    title: z.string(),
    description: z.string(),
    features: z.array(z.string()).default([]),
    color: z.string().optional(),
  })).default([]),
});

// Five pillars section
export const homepagePillarsSchema = z.object({
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  pillars: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    features: z.array(z.string()).default([]),
  })).default([]),
});

// Industry tabs section
export const homepageIndustryTabsSchema = z.object({
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  industries: z.array(z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string().optional(),
    headline: z.string(),
    description: z.string(),
    features: z.array(z.string()).default([]),
    stats: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).default([]),
  })).default([]),
});

// Client experience section
export const homepageClientExperienceSchema = z.object({
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  features: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
  })).default([]),
});

// Tool replacement section
export const homepageToolReplacementSchema = z.object({
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  tools: z.array(z.object({
    id: z.string(),
    name: z.string(),
    monthlyPrice: z.number(),
    icon: z.string().optional(),
  })).default([]),
  savingsLabel: z.string().optional(),
});

// Integration spotlight section
export const homepageIntegrationsSchema = z.object({
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  integrations: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string().optional(),
    logoUrl: z.string().optional(),
  })).default([]),
});

// Case studies section
export const homepageCaseStudiesSchema = z.object({
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  studies: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    company: z.string().optional(),
    industry: z.string(),
    quote: z.string(),
    imageUrl: z.string().optional(),
    stats: z.array(z.object({
      value: z.string(),
      label: z.string(),
    })).default([]),
  })).default([]),
});

// Comparison section
export const homepageComparisonSchema = z.object({
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  competitors: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })).default([]),
  features: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    photoproos: z.union([z.boolean(), z.string()]),
    competitors: z.record(z.string(), z.union([z.boolean(), z.string()])).default({}),
  })).default([]),
});

// Security section
export const homepageSecuritySchema = z.object({
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  features: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
  })).default([]),
  certifications: z.array(z.object({
    id: z.string(),
    name: z.string(),
    logoUrl: z.string().optional(),
  })).default([]),
});

// Testimonials section (references DB testimonials)
export const homepageTestimonialsSchema = z.object({
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  displayCount: z.number().default(6),
});

// Pricing section (references pricing tiers)
export const homepagePricingSchema = z.object({
  badge: z.string().optional(),
  title: z.string(),
  subtitle: z.string().optional(),
  showComparison: z.boolean().default(false),
});

// CTA section
export const homepageCtaSchema = z.object({
  title: z.string(),
  titleHighlight: z.string().optional(),
  subtitle: z.string().optional(),
  cta: ctaButtonSchema,
  secondaryCta: ctaButtonSchema.optional(),
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

// Complete homepage content schema
export const homepageContentSchema = z.object({
  // Core sections
  hero: homepageHeroSchema.optional(),
  logos: homepageLogosSchema.optional(),
  metrics: homepageMetricsSchema.optional(),
  howItWorks: homepageHowItWorksSchema.optional(),
  pillars: homepagePillarsSchema.optional(),
  industryTabs: homepageIndustryTabsSchema.optional(),
  clientExperience: homepageClientExperienceSchema.optional(),
  toolReplacement: homepageToolReplacementSchema.optional(),
  integrations: homepageIntegrationsSchema.optional(),
  caseStudies: homepageCaseStudiesSchema.optional(),
  comparison: homepageComparisonSchema.optional(),
  security: homepageSecuritySchema.optional(),
  testimonials: homepageTestimonialsSchema.optional(),
  pricing: homepagePricingSchema.optional(),
  cta: homepageCtaSchema.optional(),
  // Legacy (for backwards compatibility)
  stats: homepageStatsSchema.optional(),
  features: homepageFeaturesSchema.optional(),
});

export type HomepageContent = z.infer<typeof homepageContentSchema>;
export type HomepageHeroContent = z.infer<typeof homepageHeroSchema>;
export type HomepageLogosContent = z.infer<typeof homepageLogosSchema>;
export type HomepageMetricsContent = z.infer<typeof homepageMetricsSchema>;
export type HomepageHowItWorksContent = z.infer<typeof homepageHowItWorksSchema>;
export type HomepagePillarsContent = z.infer<typeof homepagePillarsSchema>;
export type HomepageIndustryTabsContent = z.infer<typeof homepageIndustryTabsSchema>;
export type HomepageClientExperienceContent = z.infer<typeof homepageClientExperienceSchema>;
export type HomepageToolReplacementContent = z.infer<typeof homepageToolReplacementSchema>;
export type HomepageIntegrationsContent = z.infer<typeof homepageIntegrationsSchema>;
export type HomepageCaseStudiesContent = z.infer<typeof homepageCaseStudiesSchema>;
export type HomepageComparisonContent = z.infer<typeof homepageComparisonSchema>;
export type HomepageSecurityContent = z.infer<typeof homepageSecuritySchema>;
export type HomepageTestimonialsContent = z.infer<typeof homepageTestimonialsSchema>;
export type HomepagePricingContent = z.infer<typeof homepagePricingSchema>;
export type HomepageCtaContent = z.infer<typeof homepageCtaSchema>;

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
