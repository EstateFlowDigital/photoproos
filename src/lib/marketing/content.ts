import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type {
  BlogPost,
  TeamMember,
  Testimonial,
  FAQ,
  BlogCategory,
  TestimonialIndustry,
  FAQCategory,
} from "@prisma/client";
import type {
  HomepageContent,
  PricingContent,
  FeaturesPageContent,
  IndustryPageContent,
  AboutPageContent,
  LegalPageContent,
  BlogIndexContent,
  NavbarContent,
  FooterContent,
} from "@/lib/validations/marketing-cms";

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const CACHE_TAG = "marketing";
const CACHE_REVALIDATE = 60; // 1 minute

// ============================================================================
// MARKETING PAGES
// ============================================================================

/**
 * Get marketing page content by slug with caching
 */
export const getMarketingPageContent = unstable_cache(
  async <T = Record<string, unknown>>(slug: string): Promise<{
    content: T | null;
    meta: {
      title: string | null;
      description: string | null;
      ogImage: string | null;
    };
  }> => {
    const page = await prisma.marketingPage.findUnique({
      where: { slug, status: "published" },
      select: {
        content: true,
        metaTitle: true,
        metaDescription: true,
        ogImage: true,
      },
    });

    if (!page) {
      return {
        content: null,
        meta: { title: null, description: null, ogImage: null },
      };
    }

    return {
      content: page.content as T,
      meta: {
        title: page.metaTitle,
        description: page.metaDescription,
        ogImage: page.ogImage,
      },
    };
  },
  ["marketing-page"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

/**
 * Get homepage content
 */
export const getHomepageContent = async () => {
  return getMarketingPageContent<HomepageContent>("homepage");
};

/**
 * Get pricing page content
 */
export const getPricingContent = async () => {
  return getMarketingPageContent<PricingContent>("pricing");
};

/**
 * Get features page content
 */
export const getFeaturesContent = async (featureSlug?: string) => {
  const slug = featureSlug ? `features/${featureSlug}` : "features";
  return getMarketingPageContent<FeaturesPageContent>(slug);
};

/**
 * Get industry page content
 */
export const getIndustryContent = async (industrySlug: string) => {
  return getMarketingPageContent<IndustryPageContent>(`industries/${industrySlug}`);
};

/**
 * Get about page content
 */
export const getAboutContent = async () => {
  return getMarketingPageContent<AboutPageContent>("about");
};

/**
 * Get legal page content
 */
export const getLegalContent = async (pageSlug: string) => {
  return getMarketingPageContent<LegalPageContent>(`legal/${pageSlug}`);
};

/**
 * Get blog index content
 */
export const getBlogIndexContent = async () => {
  return getMarketingPageContent<BlogIndexContent>("blog");
};

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Get navbar content with caching
 */
export const getNavbarContent = unstable_cache(
  async (): Promise<NavbarContent | null> => {
    const nav = await prisma.marketingNavigation.findUnique({
      where: { location: "navbar", isActive: true },
      select: { content: true },
    });

    return nav?.content as NavbarContent | null;
  },
  ["navbar-content"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

/**
 * Get footer content with caching
 */
export const getFooterContent = unstable_cache(
  async (): Promise<FooterContent | null> => {
    const nav = await prisma.marketingNavigation.findUnique({
      where: { location: "footer", isActive: true },
      select: { content: true },
    });

    return nav?.content as FooterContent | null;
  },
  ["footer-content"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

// ============================================================================
// BLOG POSTS
// ============================================================================

/**
 * Get published blog posts with caching
 */
export const getPublishedPosts = unstable_cache(
  async (options?: {
    category?: BlogCategory;
    limit?: number;
    featured?: boolean;
  }): Promise<BlogPost[]> => {
    return prisma.blogPost.findMany({
      where: {
        status: "published",
        publishedAt: { lte: new Date() },
        ...(options?.category && { category: options.category }),
        ...(options?.featured !== undefined && { isFeatured: options.featured }),
      },
      orderBy: { publishedAt: "desc" },
      ...(options?.limit && { take: options.limit }),
    });
  },
  ["published-posts"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

/**
 * Get featured blog posts
 */
export const getFeaturedPosts = async (limit = 3) => {
  return getPublishedPosts({ featured: true, limit });
};

/**
 * Get recent blog posts
 */
export const getRecentPosts = async (limit = 6) => {
  return getPublishedPosts({ limit });
};

/**
 * Get blog post by slug with caching
 */
export const getPostBySlug = unstable_cache(
  async (slug: string): Promise<BlogPost | null> => {
    return prisma.blogPost.findUnique({
      where: { slug, status: "published" },
    });
  },
  ["blog-post"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

/**
 * Get blog categories with post counts
 */
export const getBlogCategories = unstable_cache(
  async (): Promise<{ category: BlogCategory; count: number }[]> => {
    const results = await prisma.blogPost.groupBy({
      by: ["category"],
      where: { status: "published" },
      _count: true,
    });

    return results.map((r) => ({
      category: r.category,
      count: r._count,
    }));
  },
  ["blog-categories"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

// ============================================================================
// TEAM MEMBERS
// ============================================================================

/**
 * Get visible team members with caching
 */
export const getTeamMembers = unstable_cache(
  async (): Promise<TeamMember[]> => {
    return prisma.teamMember.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
    });
  },
  ["team-members"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

// ============================================================================
// TESTIMONIALS
// ============================================================================

/**
 * Get testimonials for a page with caching
 */
export const getTestimonialsForPage = unstable_cache(
  async (
    page: string,
    options?: { industry?: TestimonialIndustry; limit?: number }
  ): Promise<Testimonial[]> => {
    return prisma.testimonial.findMany({
      where: {
        isVisible: true,
        OR: [
          { showOnAllPages: true },
          { targetPages: { has: page } },
        ],
        ...(options?.industry && { targetIndustry: options.industry }),
      },
      orderBy: { sortOrder: "asc" },
      ...(options?.limit && { take: options.limit }),
    });
  },
  ["page-testimonials"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

/**
 * Get featured testimonials
 */
export const getFeaturedTestimonials = unstable_cache(
  async (limit = 6): Promise<Testimonial[]> => {
    return prisma.testimonial.findMany({
      where: { isVisible: true, isFeatured: true },
      orderBy: { sortOrder: "asc" },
      take: limit,
    });
  },
  ["featured-testimonials"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

// ============================================================================
// FAQS
// ============================================================================

/**
 * Get FAQs for a page with caching
 */
export const getFAQsForPage = unstable_cache(
  async (page: string): Promise<FAQ[]> => {
    return prisma.fAQ.findMany({
      where: {
        isVisible: true,
        targetPages: { has: page },
      },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
  },
  ["page-faqs"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

/**
 * Get FAQs by category with caching
 */
export const getFAQsByCategory = unstable_cache(
  async (category: FAQCategory): Promise<FAQ[]> => {
    return prisma.fAQ.findMany({
      where: { isVisible: true, category },
      orderBy: { sortOrder: "asc" },
    });
  },
  ["category-faqs"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

/**
 * Get all visible FAQs grouped by category
 */
export const getAllFAQsGrouped = unstable_cache(
  async (): Promise<Record<FAQCategory, FAQ[]>> => {
    const faqs = await prisma.fAQ.findMany({
      where: { isVisible: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    const grouped: Record<FAQCategory, FAQ[]> = {
      general: [],
      pricing: [],
      features: [],
      billing: [],
      getting_started: [],
      technical: [],
    };

    for (const faq of faqs) {
      grouped[faq.category].push(faq);
    }

    return grouped;
  },
  ["all-faqs-grouped"],
  { tags: [CACHE_TAG], revalidate: CACHE_REVALIDATE }
);

// ============================================================================
// DEFAULTS (Fallback when no DB content exists)
// ============================================================================

// These defaults will be used when no content exists in the database
// They can be imported and used as fallbacks during the migration period

export const defaultNavbarContent: NavbarContent = {
  logo: { text: "PhotoProOS" },
  links: [],
  ctaButton: { label: "Get Started", href: "/signup", variant: "primary" },
};

export const defaultFooterContent: FooterContent = {
  columns: [],
  socialLinks: [],
  copyrightText: `© ${new Date().getFullYear()} PhotoProOS. All rights reserved.`,
  bottomLinks: [],
};
