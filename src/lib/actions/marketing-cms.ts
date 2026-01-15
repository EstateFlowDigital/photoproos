"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { isSuperAdmin } from "@/lib/auth/super-admin";
import { currentUser } from "@clerk/nextjs/server";
import type {
  MarketingPage,
  MarketingNavigation,
  BlogPost,
  TeamMember,
  Testimonial,
  FAQ,
  MarketingPageType,
  BlogPostStatus,
  BlogCategory,
  TestimonialIndustry,
  FAQCategory,
} from "@prisma/client";
import {
  type CreateBlogPostInput,
  type UpdateBlogPostInput,
  type CreateTeamMemberInput,
  type UpdateTeamMemberInput,
  type CreateTestimonialInput,
  type UpdateTestimonialInput,
  type CreateFAQInput,
  type UpdateFAQInput,
  type UpdateMarketingPageInput,
  type UpdateNavigationInput,
  type ReorderItemsInput,
  createBlogPostSchema,
  updateBlogPostSchema,
  createTeamMemberSchema,
  updateTeamMemberSchema,
  createTestimonialSchema,
  updateTestimonialSchema,
  createFAQSchema,
  updateFAQSchema,
  updateMarketingPageSchema,
  reorderItemsSchema,
} from "@/lib/validations/marketing-cms";

// ============================================================================
// CACHE INVALIDATION
// ============================================================================

function revalidateMarketing() {
  revalidateTag("marketing");
  revalidatePath("/", "layout");
}

// ============================================================================
// MARKETING PAGES
// ============================================================================

/**
 * Get all marketing pages (for admin list)
 */
export async function getMarketingPages(): Promise<ActionResult<MarketingPage[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const pages = await prisma.marketingPage.findMany({
      orderBy: [{ pageType: "asc" }, { slug: "asc" }],
    });

    return ok(pages);
  } catch (error) {
    console.error("Error fetching marketing pages:", error);
    return fail("Failed to fetch marketing pages");
  }
}

/**
 * Get a single marketing page by slug
 */
export async function getMarketingPage(
  slug: string
): Promise<ActionResult<MarketingPage | null>> {
  try {
    const page = await prisma.marketingPage.findUnique({
      where: { slug },
    });

    return ok(page);
  } catch (error) {
    console.error("Error fetching marketing page:", error);
    return fail("Failed to fetch marketing page");
  }
}

/**
 * Create a new marketing page
 */
export async function createMarketingPage(data: {
  slug: string;
  pageType: MarketingPageType;
  title: string;
  content: Record<string, unknown>;
}): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    const page = await prisma.marketingPage.create({
      data: {
        slug: data.slug,
        pageType: data.pageType,
        title: data.title,
        content: data.content,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      },
    });

    revalidateMarketing();
    return ok(page);
  } catch (error) {
    console.error("Error creating marketing page:", error);
    return fail("Failed to create marketing page");
  }
}

/**
 * Update a marketing page
 */
export async function updateMarketingPage(
  input: UpdateMarketingPageInput
): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    const validated = updateMarketingPageSchema.parse(input);

    const page = await prisma.marketingPage.update({
      where: { slug: validated.slug },
      data: {
        ...(validated.title && { title: validated.title }),
        content: validated.content,
        ...(validated.metaTitle !== undefined && { metaTitle: validated.metaTitle }),
        ...(validated.metaDescription !== undefined && { metaDescription: validated.metaDescription }),
        ...(validated.ogImage !== undefined && { ogImage: validated.ogImage }),
        ...(validated.status && { status: validated.status }),
        ...(validated.status === "published" && { publishedAt: new Date() }),
        updatedByUserId: user.id,
      },
    });

    revalidateMarketing();
    return ok(page);
  } catch (error) {
    console.error("Error updating marketing page:", error);
    return fail("Failed to update marketing page");
  }
}

/**
 * Publish a marketing page
 */
export async function publishMarketingPage(slug: string): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    const page = await prisma.marketingPage.update({
      where: { slug },
      data: {
        status: "published",
        publishedAt: new Date(),
        updatedByUserId: user.id,
      },
    });

    revalidateMarketing();
    return ok(page);
  } catch (error) {
    console.error("Error publishing marketing page:", error);
    return fail("Failed to publish marketing page");
  }
}

/**
 * Delete a marketing page
 */
export async function deleteMarketingPage(slug: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Prevent deletion of critical pages
    const protectedSlugs = ["homepage", "pricing", "about"];
    if (protectedSlugs.includes(slug)) {
      return fail("Cannot delete protected pages");
    }

    await prisma.marketingPage.delete({
      where: { slug },
    });

    revalidateMarketing();
    return success();
  } catch (error) {
    console.error("Error deleting marketing page:", error);
    return fail("Failed to delete marketing page");
  }
}

// ============================================================================
// NAVIGATION
// ============================================================================

/**
 * Get navigation content
 */
export async function getNavigation(
  location: "navbar" | "footer"
): Promise<ActionResult<MarketingNavigation | null>> {
  try {
    const nav = await prisma.marketingNavigation.findUnique({
      where: { location },
    });

    return ok(nav);
  } catch (error) {
    console.error("Error fetching navigation:", error);
    return fail("Failed to fetch navigation");
  }
}

/**
 * Update navigation content
 */
export async function updateNavigation(
  input: UpdateNavigationInput
): Promise<ActionResult<MarketingNavigation>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    const nav = await prisma.marketingNavigation.upsert({
      where: { location: input.location },
      create: {
        location: input.location,
        content: input.content as object,
        isActive: input.isActive ?? true,
        updatedByUserId: user.id,
      },
      update: {
        content: input.content as object,
        ...(input.isActive !== undefined && { isActive: input.isActive }),
        updatedByUserId: user.id,
      },
    });

    revalidateMarketing();
    return ok(nav);
  } catch (error) {
    console.error("Error updating navigation:", error);
    return fail("Failed to update navigation");
  }
}

// ============================================================================
// BLOG POSTS
// ============================================================================

/**
 * Get all blog posts (admin view)
 */
export async function getBlogPosts(options?: {
  status?: BlogPostStatus;
  category?: BlogCategory;
  limit?: number;
}): Promise<ActionResult<BlogPost[]>> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        ...(options?.status && { status: options.status }),
        ...(options?.category && { category: options.category }),
      },
      orderBy: { createdAt: "desc" },
      ...(options?.limit && { take: options.limit }),
    });

    return ok(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return fail("Failed to fetch blog posts");
  }
}

/**
 * Get published blog posts (public view)
 */
export async function getPublishedBlogPosts(options?: {
  category?: BlogCategory;
  limit?: number;
  featured?: boolean;
}): Promise<ActionResult<BlogPost[]>> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "published",
        publishedAt: { lte: new Date() },
        ...(options?.category && { category: options.category }),
        ...(options?.featured !== undefined && { isFeatured: options.featured }),
      },
      orderBy: { publishedAt: "desc" },
      ...(options?.limit && { take: options.limit }),
    });

    return ok(posts);
  } catch (error) {
    console.error("Error fetching published blog posts:", error);
    return fail("Failed to fetch blog posts");
  }
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPost(slug: string): Promise<ActionResult<BlogPost | null>> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });

    return ok(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return fail("Failed to fetch blog post");
  }
}

/**
 * Create a new blog post
 */
export async function createBlogPost(
  input: CreateBlogPostInput
): Promise<ActionResult<BlogPost>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    const validated = createBlogPostSchema.parse(input);

    const post = await prisma.blogPost.create({
      data: {
        ...validated,
        publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : null,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      },
    });

    revalidateMarketing();
    return ok(post);
  } catch (error) {
    console.error("Error creating blog post:", error);
    return fail("Failed to create blog post");
  }
}

/**
 * Update a blog post
 */
export async function updateBlogPost(
  input: UpdateBlogPostInput
): Promise<ActionResult<BlogPost>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    const validated = updateBlogPostSchema.parse(input);
    const { id, ...data } = validated;

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...data,
        ...(data.publishedAt && { publishedAt: new Date(data.publishedAt) }),
        updatedByUserId: user.id,
      },
    });

    revalidateMarketing();
    return ok(post);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return fail("Failed to update blog post");
  }
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await prisma.blogPost.delete({
      where: { id },
    });

    revalidateMarketing();
    return success();
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return fail("Failed to delete blog post");
  }
}

/**
 * Increment blog post view count
 */
export async function incrementBlogPostViews(slug: string): Promise<ActionResult<void>> {
  try {
    await prisma.blogPost.update({
      where: { slug },
      data: {
        viewCount: { increment: 1 },
      },
    });

    return success();
  } catch (error) {
    console.error("Error incrementing blog post views:", error);
    return fail("Failed to increment views");
  }
}

// ============================================================================
// TEAM MEMBERS
// ============================================================================

/**
 * Get all team members
 */
export async function getTeamMembers(options?: {
  visibleOnly?: boolean;
}): Promise<ActionResult<TeamMember[]>> {
  try {
    const members = await prisma.teamMember.findMany({
      where: {
        ...(options?.visibleOnly && { isVisible: true }),
      },
      orderBy: { sortOrder: "asc" },
    });

    return ok(members);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return fail("Failed to fetch team members");
  }
}

/**
 * Create a new team member
 */
export async function createTeamMember(
  input: CreateTeamMemberInput
): Promise<ActionResult<TeamMember>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const validated = createTeamMemberSchema.parse(input);

    // Get max sort order
    const maxOrder = await prisma.teamMember.aggregate({
      _max: { sortOrder: true },
    });

    const member = await prisma.teamMember.create({
      data: {
        ...validated,
        sortOrder: validated.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    revalidateMarketing();
    return ok(member);
  } catch (error) {
    console.error("Error creating team member:", error);
    return fail("Failed to create team member");
  }
}

/**
 * Update a team member
 */
export async function updateTeamMember(
  input: UpdateTeamMemberInput
): Promise<ActionResult<TeamMember>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const validated = updateTeamMemberSchema.parse(input);
    const { id, ...data } = validated;

    const member = await prisma.teamMember.update({
      where: { id },
      data,
    });

    revalidateMarketing();
    return ok(member);
  } catch (error) {
    console.error("Error updating team member:", error);
    return fail("Failed to update team member");
  }
}

/**
 * Delete a team member
 */
export async function deleteTeamMember(id: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await prisma.teamMember.delete({
      where: { id },
    });

    revalidateMarketing();
    return success();
  } catch (error) {
    console.error("Error deleting team member:", error);
    return fail("Failed to delete team member");
  }
}

/**
 * Reorder team members
 */
export async function reorderTeamMembers(
  input: ReorderItemsInput
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const validated = reorderItemsSchema.parse(input);

    await prisma.$transaction(
      validated.items.map((item) =>
        prisma.teamMember.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    revalidateMarketing();
    return success();
  } catch (error) {
    console.error("Error reordering team members:", error);
    return fail("Failed to reorder team members");
  }
}

// ============================================================================
// TESTIMONIALS
// ============================================================================

/**
 * Get all testimonials
 */
export async function getTestimonials(options?: {
  visibleOnly?: boolean;
  industry?: TestimonialIndustry;
  targetPage?: string;
  featured?: boolean;
}): Promise<ActionResult<Testimonial[]>> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        ...(options?.visibleOnly && { isVisible: true }),
        ...(options?.industry && { targetIndustry: options.industry }),
        ...(options?.featured !== undefined && { isFeatured: options.featured }),
        ...(options?.targetPage && {
          OR: [
            { showOnAllPages: true },
            { targetPages: { has: options.targetPage } },
          ],
        }),
      },
      orderBy: { sortOrder: "asc" },
    });

    return ok(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return fail("Failed to fetch testimonials");
  }
}

/**
 * Create a new testimonial
 */
export async function createTestimonial(
  input: CreateTestimonialInput
): Promise<ActionResult<Testimonial>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const validated = createTestimonialSchema.parse(input);

    // Get max sort order
    const maxOrder = await prisma.testimonial.aggregate({
      _max: { sortOrder: true },
    });

    const testimonial = await prisma.testimonial.create({
      data: {
        ...validated,
        sortOrder: validated.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    revalidateMarketing();
    return ok(testimonial);
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return fail("Failed to create testimonial");
  }
}

/**
 * Update a testimonial
 */
export async function updateTestimonial(
  input: UpdateTestimonialInput
): Promise<ActionResult<Testimonial>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const validated = updateTestimonialSchema.parse(input);
    const { id, ...data } = validated;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data,
    });

    revalidateMarketing();
    return ok(testimonial);
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return fail("Failed to update testimonial");
  }
}

/**
 * Delete a testimonial
 */
export async function deleteTestimonial(id: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await prisma.testimonial.delete({
      where: { id },
    });

    revalidateMarketing();
    return success();
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return fail("Failed to delete testimonial");
  }
}

/**
 * Reorder testimonials
 */
export async function reorderTestimonials(
  input: ReorderItemsInput
): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const validated = reorderItemsSchema.parse(input);

    await prisma.$transaction(
      validated.items.map((item) =>
        prisma.testimonial.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    revalidateMarketing();
    return success();
  } catch (error) {
    console.error("Error reordering testimonials:", error);
    return fail("Failed to reorder testimonials");
  }
}

// ============================================================================
// FAQS
// ============================================================================

/**
 * Get all FAQs
 */
export async function getFAQs(options?: {
  visibleOnly?: boolean;
  category?: FAQCategory;
  targetPage?: string;
}): Promise<ActionResult<FAQ[]>> {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        ...(options?.visibleOnly && { isVisible: true }),
        ...(options?.category && { category: options.category }),
        ...(options?.targetPage && {
          targetPages: { has: options.targetPage },
        }),
      },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    return ok(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return fail("Failed to fetch FAQs");
  }
}

/**
 * Create a new FAQ
 */
export async function createFAQ(input: CreateFAQInput): Promise<ActionResult<FAQ>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const validated = createFAQSchema.parse(input);

    // Get max sort order in category
    const maxOrder = await prisma.fAQ.aggregate({
      _max: { sortOrder: true },
      where: { category: validated.category },
    });

    const faq = await prisma.fAQ.create({
      data: {
        ...validated,
        sortOrder: validated.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    revalidateMarketing();
    return ok(faq);
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return fail("Failed to create FAQ");
  }
}

/**
 * Update a FAQ
 */
export async function updateFAQ(input: UpdateFAQInput): Promise<ActionResult<FAQ>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const validated = updateFAQSchema.parse(input);
    const { id, ...data } = validated;

    const faq = await prisma.fAQ.update({
      where: { id },
      data,
    });

    revalidateMarketing();
    return ok(faq);
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return fail("Failed to update FAQ");
  }
}

/**
 * Delete a FAQ
 */
export async function deleteFAQ(id: string): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    await prisma.fAQ.delete({
      where: { id },
    });

    revalidateMarketing();
    return success();
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return fail("Failed to delete FAQ");
  }
}

/**
 * Reorder FAQs
 */
export async function reorderFAQs(input: ReorderItemsInput): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const validated = reorderItemsSchema.parse(input);

    await prisma.$transaction(
      validated.items.map((item) =>
        prisma.fAQ.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    revalidateMarketing();
    return success();
  } catch (error) {
    console.error("Error reordering FAQs:", error);
    return fail("Failed to reorder FAQs");
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

/**
 * Seed initial marketing content from defaults
 */
export async function seedMarketingContent(): Promise<ActionResult<void>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // This will be called from a seed script
    // Content will be extracted from existing marketing pages

    revalidateMarketing();
    return success();
  } catch (error) {
    console.error("Error seeding marketing content:", error);
    return fail("Failed to seed marketing content");
  }
}
