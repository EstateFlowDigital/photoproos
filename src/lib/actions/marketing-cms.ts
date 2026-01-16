"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { ok, fail, success, type ActionResult } from "@/lib/types/action-result";
import { isSuperAdmin } from "@/lib/auth/super-admin";
import { currentUser } from "@clerk/nextjs/server";
import { dispatchWebhooks } from "@/lib/cms/webhooks";
import type {
  MarketingPage,
  MarketingPageVersion,
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
  CMSPresence,
  CMSAuditLog,
  ContentApproval,
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
  // Revalidate all marketing-related paths
  revalidatePath("/super-admin/marketing");
  revalidatePath("/super-admin/marketing/faqs");
  revalidatePath("/super-admin/marketing/testimonials");
  revalidatePath("/super-admin/marketing/team");
  revalidatePath("/super-admin/marketing/navigation");
  revalidatePath("/super-admin/marketing/pages");
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

    // Dispatch webhook
    await dispatchWebhooks({
      event: "page_created",
      entityType: "MarketingPage",
      entityId: page.id,
      entityName: page.title,
      actorId: user.id,
      actorName: user.firstName || user.emailAddresses?.[0]?.emailAddress,
    });

    revalidateMarketing();
    return ok(page);
  } catch (error) {
    console.error("Error creating marketing page:", error);
    return fail("Failed to create marketing page");
  }
}

/**
 * Create a version snapshot of a marketing page
 * Called automatically before updates to preserve history
 */
async function createVersionSnapshot(
  pageId: string,
  slug: string,
  content: unknown,
  metaTitle: string | null,
  metaDescription: string | null,
  ogImage: string | null,
  userId: string,
  userName: string | null,
  changesSummary?: string
): Promise<void> {
  // Get the latest version number for this page
  const latestVersion = await prisma.marketingPageVersion.findFirst({
    where: { pageId },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  const nextVersion = (latestVersion?.version ?? 0) + 1;

  await prisma.marketingPageVersion.create({
    data: {
      pageId,
      slug,
      version: nextVersion,
      content: content as object,
      metaTitle,
      metaDescription,
      ogImage,
      createdBy: userId,
      createdByName: userName,
      changesSummary,
    },
  });
}

/**
 * Update a marketing page (with automatic version tracking)
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

    // Get current page state to create version snapshot
    const currentPage = await prisma.marketingPage.findUnique({
      where: { slug: validated.slug },
      select: {
        id: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        ogImage: true,
      },
    });

    if (!currentPage) {
      return fail("Page not found");
    }

    // Create version snapshot of current state before updating
    await createVersionSnapshot(
      currentPage.id,
      validated.slug,
      currentPage.content,
      currentPage.metaTitle,
      currentPage.metaDescription,
      currentPage.ogImage,
      user.id,
      user.fullName || user.firstName || null,
      `Content updated`
    );

    // Now perform the update
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

    // Dispatch webhook
    await dispatchWebhooks({
      event: validated.status === "published" ? "page_published" : "page_updated",
      entityType: "MarketingPage",
      entityId: page.id,
      entityName: page.title,
      actorId: user.id,
      actorName: user.firstName || user.emailAddresses?.[0]?.emailAddress,
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
 * If there's draft content, it gets promoted to published content
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

    // First, get the current page to check for draft content
    const currentPage = await prisma.marketingPage.findUnique({
      where: { slug },
      select: {
        id: true,
        content: true,
        draftContent: true,
        hasDraft: true,
        metaTitle: true,
        metaDescription: true,
        ogImage: true,
      },
    });

    if (!currentPage) {
      return fail("Page not found");
    }

    // If there's draft content, promote it to published content
    const contentToPublish = currentPage.hasDraft && currentPage.draftContent
      ? currentPage.draftContent
      : currentPage.content;

    // Create version snapshot before publishing
    await createVersionSnapshot(
      currentPage.id,
      slug,
      currentPage.content,
      currentPage.metaTitle,
      currentPage.metaDescription,
      currentPage.ogImage,
      user.id,
      user.fullName || user.firstName || null,
      currentPage.hasDraft ? "Published draft content" : "Published"
    );

    // Update page: promote draft to content, clear draft, set published
    const page = await prisma.marketingPage.update({
      where: { slug },
      data: {
        content: contentToPublish,
        draftContent: null,
        hasDraft: false,
        status: "published",
        publishedAt: new Date(),
        updatedByUserId: user.id,
      },
    });

    // Dispatch webhook
    await dispatchWebhooks({
      event: "page_published",
      entityType: "MarketingPage",
      entityId: page.id,
      entityName: page.title,
      actorId: user.id,
      actorName: user.firstName || user.emailAddresses?.[0]?.emailAddress,
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

    const user = await currentUser();

    // Prevent deletion of critical pages
    const protectedSlugs = ["homepage", "pricing", "about"];
    if (protectedSlugs.includes(slug)) {
      return fail("Cannot delete protected pages");
    }

    // Get page info before deletion for webhook
    const page = await prisma.marketingPage.findUnique({
      where: { slug },
      select: { id: true, title: true },
    });

    await prisma.marketingPage.delete({
      where: { slug },
    });

    // Dispatch webhook
    if (page) {
      await dispatchWebhooks({
        event: "page_deleted",
        entityType: "MarketingPage",
        entityId: page.id,
        entityName: page.title,
        actorId: user?.id,
        actorName: user?.firstName || user?.emailAddresses?.[0]?.emailAddress,
      });
    }

    revalidateMarketing();
    return success();
  } catch (error) {
    console.error("Error deleting marketing page:", error);
    return fail("Failed to delete marketing page");
  }
}

// ============================================================================
// DRAFT MODE OPERATIONS
// ============================================================================

/**
 * Save draft content for a marketing page
 * This saves content to draftContent without affecting the live published version
 */
export async function saveDraft(
  slug: string,
  draftContent: Record<string, unknown>
): Promise<ActionResult<MarketingPage>> {
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
        draftContent,
        hasDraft: true,
        lastEditedBy: user.id,
        lastEditedAt: new Date(),
        updatedByUserId: user.id,
      },
    });

    // Dispatch webhook
    await dispatchWebhooks({
      event: "draft_saved",
      entityType: "MarketingPage",
      entityId: page.id,
      entityName: page.title,
      actorId: user.id,
      actorName: user.firstName || user.emailAddresses?.[0]?.emailAddress,
    });

    // Don't invalidate cache - draft changes shouldn't affect live site
    return ok(page);
  } catch (error) {
    console.error("Error saving draft:", error);
    return fail("Failed to save draft");
  }
}

/**
 * Publish draft content - moves draftContent to content and clears draft
 */
export async function publishDraft(slug: string): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    // First, get the current draft content
    const currentPage = await prisma.marketingPage.findUnique({
      where: { slug },
      select: { draftContent: true, hasDraft: true },
    });

    if (!currentPage || !currentPage.hasDraft || !currentPage.draftContent) {
      return fail("No draft content to publish");
    }

    // Update the page: move draft to content, clear draft
    const page = await prisma.marketingPage.update({
      where: { slug },
      data: {
        content: currentPage.draftContent,
        draftContent: null,
        hasDraft: false,
        status: "published",
        publishedAt: new Date(),
        lastEditedBy: user.id,
        lastEditedAt: new Date(),
        updatedByUserId: user.id,
      },
    });

    // Dispatch webhook
    await dispatchWebhooks({
      event: "page_published",
      entityType: "MarketingPage",
      entityId: page.id,
      entityName: page.title,
      actorId: user.id,
      actorName: user.firstName || user.emailAddresses?.[0]?.emailAddress,
    });

    revalidateMarketing();
    return ok(page);
  } catch (error) {
    console.error("Error publishing draft:", error);
    return fail("Failed to publish draft");
  }
}

/**
 * Discard draft content - removes draftContent without affecting live content
 */
export async function discardDraft(slug: string): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const page = await prisma.marketingPage.update({
      where: { slug },
      data: {
        draftContent: null,
        hasDraft: false,
      },
    });

    return ok(page);
  } catch (error) {
    console.error("Error discarding draft:", error);
    return fail("Failed to discard draft");
  }
}

/**
 * Schedule a page for future publishing
 */
export async function schedulePublish(
  slug: string,
  scheduledPublishAt: Date
): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    // Ensure the scheduled time is in the future
    if (scheduledPublishAt <= new Date()) {
      return fail("Scheduled time must be in the future");
    }

    const page = await prisma.marketingPage.update({
      where: { slug },
      data: {
        scheduledPublishAt,
        scheduledBy: user.id,
      },
    });

    // Dispatch webhook
    await dispatchWebhooks({
      event: "page_scheduled",
      entityType: "MarketingPage",
      entityId: page.id,
      entityName: page.title,
      changes: { scheduledPublishAt: scheduledPublishAt.toISOString() },
      actorId: user.id,
      actorName: user.firstName || user.emailAddresses?.[0]?.emailAddress,
    });

    return ok(page);
  } catch (error) {
    console.error("Error scheduling publish:", error);
    return fail("Failed to schedule publish");
  }
}

/**
 * Cancel scheduled publishing
 */
export async function cancelScheduledPublish(slug: string): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const page = await prisma.marketingPage.update({
      where: { slug },
      data: {
        scheduledPublishAt: null,
        scheduledBy: null,
      },
    });

    return ok(page);
  } catch (error) {
    console.error("Error canceling scheduled publish:", error);
    return fail("Failed to cancel scheduled publish");
  }
}

// ============================================================================
// VERSION HISTORY
// ============================================================================

/**
 * Get all versions for a marketing page
 */
export async function getPageVersions(
  slug: string,
  options?: { limit?: number; offset?: number }
): Promise<ActionResult<{ versions: MarketingPageVersion[]; total: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // First get the page ID from the slug
    const page = await prisma.marketingPage.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!page) {
      return fail("Page not found");
    }

    // Get total count
    const total = await prisma.marketingPageVersion.count({
      where: { pageId: page.id },
    });

    // Get versions with pagination
    const versions = await prisma.marketingPageVersion.findMany({
      where: { pageId: page.id },
      orderBy: { version: "desc" },
      take: options?.limit ?? 20,
      skip: options?.offset ?? 0,
    });

    return ok({ versions, total });
  } catch (error) {
    console.error("Error fetching page versions:", error);
    return fail("Failed to fetch page versions");
  }
}

/**
 * Get a specific version by ID
 */
export async function getPageVersion(
  versionId: string
): Promise<ActionResult<MarketingPageVersion | null>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const version = await prisma.marketingPageVersion.findUnique({
      where: { id: versionId },
    });

    return ok(version);
  } catch (error) {
    console.error("Error fetching page version:", error);
    return fail("Failed to fetch page version");
  }
}

/**
 * Restore a marketing page to a previous version
 * This creates a new version snapshot of the current state before restoring
 */
export async function restoreVersion(
  versionId: string
): Promise<ActionResult<MarketingPage>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    // Get the version to restore
    const versionToRestore = await prisma.marketingPageVersion.findUnique({
      where: { id: versionId },
    });

    if (!versionToRestore) {
      return fail("Version not found");
    }

    // Get current page state to create a backup version
    const currentPage = await prisma.marketingPage.findUnique({
      where: { id: versionToRestore.pageId },
      select: {
        id: true,
        slug: true,
        content: true,
        metaTitle: true,
        metaDescription: true,
        ogImage: true,
      },
    });

    if (!currentPage) {
      return fail("Page not found");
    }

    // Create version snapshot of current state before restoring
    await createVersionSnapshot(
      currentPage.id,
      currentPage.slug,
      currentPage.content,
      currentPage.metaTitle,
      currentPage.metaDescription,
      currentPage.ogImage,
      user.id,
      user.fullName || user.firstName || null,
      `Backup before restoring to version ${versionToRestore.version}`
    );

    // Restore the page to the selected version
    const restoredPage = await prisma.marketingPage.update({
      where: { id: versionToRestore.pageId },
      data: {
        content: versionToRestore.content,
        metaTitle: versionToRestore.metaTitle,
        metaDescription: versionToRestore.metaDescription,
        ogImage: versionToRestore.ogImage,
        lastEditedBy: user.id,
        lastEditedAt: new Date(),
        updatedByUserId: user.id,
      },
    });

    // Create a new version showing the restore
    await createVersionSnapshot(
      restoredPage.id,
      restoredPage.slug,
      restoredPage.content,
      restoredPage.metaTitle,
      restoredPage.metaDescription,
      restoredPage.ogImage,
      user.id,
      user.fullName || user.firstName || null,
      `Restored from version ${versionToRestore.version}`
    );

    // Dispatch webhook
    await dispatchWebhooks({
      event: "version_restored",
      entityType: "MarketingPage",
      entityId: restoredPage.id,
      entityName: restoredPage.title,
      changes: { restoredFromVersion: versionToRestore.version },
      actorId: user.id,
      actorName: user.firstName || user.emailAddresses?.[0]?.emailAddress,
    });

    revalidateMarketing();
    return ok(restoredPage);
  } catch (error) {
    console.error("Error restoring version:", error);
    return fail("Failed to restore version");
  }
}

/**
 * Compare two versions and return differences
 */
export async function compareVersions(
  versionId1: string,
  versionId2: string
): Promise<ActionResult<{
  version1: MarketingPageVersion;
  version2: MarketingPageVersion;
}>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const [version1, version2] = await Promise.all([
      prisma.marketingPageVersion.findUnique({ where: { id: versionId1 } }),
      prisma.marketingPageVersion.findUnique({ where: { id: versionId2 } }),
    ]);

    if (!version1 || !version2) {
      return fail("One or both versions not found");
    }

    return ok({ version1, version2 });
  } catch (error) {
    console.error("Error comparing versions:", error);
    return fail("Failed to compare versions");
  }
}

/**
 * Delete old versions (cleanup utility)
 * Keeps the most recent N versions per page
 */
export async function cleanupOldVersions(
  slug: string,
  keepCount: number = 50
): Promise<ActionResult<{ deleted: number }>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const page = await prisma.marketingPage.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!page) {
      return fail("Page not found");
    }

    // Get versions to keep (newest N)
    const versionsToKeep = await prisma.marketingPageVersion.findMany({
      where: { pageId: page.id },
      orderBy: { version: "desc" },
      take: keepCount,
      select: { id: true },
    });

    const keepIds = versionsToKeep.map((v) => v.id);

    // Delete all versions not in the keep list
    const result = await prisma.marketingPageVersion.deleteMany({
      where: {
        pageId: page.id,
        id: { notIn: keepIds },
      },
    });

    return ok({ deleted: result.count });
  } catch (error) {
    console.error("Error cleaning up old versions:", error);
    return fail("Failed to cleanup old versions");
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

    const user = await currentUser();
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

    // Dispatch webhook
    await dispatchWebhooks({
      event: "faq_created",
      entityType: "FAQ",
      entityId: faq.id,
      entityName: faq.question.substring(0, 50),
      actorId: user?.id,
      actorName: user?.firstName || user?.emailAddresses?.[0]?.emailAddress,
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

    const user = await currentUser();
    const validated = updateFAQSchema.parse(input);
    const { id, ...data } = validated;

    const faq = await prisma.fAQ.update({
      where: { id },
      data,
    });

    // Dispatch webhook
    await dispatchWebhooks({
      event: "faq_updated",
      entityType: "FAQ",
      entityId: faq.id,
      entityName: faq.question.substring(0, 50),
      actorId: user?.id,
      actorName: user?.firstName || user?.emailAddresses?.[0]?.emailAddress,
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

    const user = await currentUser();

    // Get FAQ info before deletion for webhook
    const faq = await prisma.fAQ.findUnique({
      where: { id },
      select: { id: true, question: true },
    });

    await prisma.fAQ.delete({
      where: { id },
    });

    // Dispatch webhook
    if (faq) {
      await dispatchWebhooks({
        event: "faq_deleted",
        entityType: "FAQ",
        entityId: faq.id,
        entityName: faq.question.substring(0, 50),
        actorId: user?.id,
        actorName: user?.firstName || user?.emailAddresses?.[0]?.emailAddress,
      });
    }

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

// ============================================================================
// SCHEDULED PUBLISHING (Cron Jobs)
// ============================================================================

/**
 * Process all scheduled publishes that are due
 * Called by the cron endpoint - does NOT require super admin auth
 *
 * This function:
 * 1. Finds all pages with scheduledPublishAt <= now
 * 2. For pages with draft content, publishes the draft
 * 3. For pages without draft, just updates status to published
 * 4. Clears the scheduling fields
 * 5. Invalidates the cache
 */
export async function processScheduledPublishes(): Promise<
  ActionResult<{ processed: number; errors: number; details: string[] }>
> {
  try {
    const now = new Date();
    const details: string[] = [];
    let processed = 0;
    let errors = 0;

    // Find all pages scheduled to publish now or in the past
    const scheduledPages = await prisma.marketingPage.findMany({
      where: {
        scheduledPublishAt: {
          lte: now,
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        content: true,
        draftContent: true,
        hasDraft: true,
        scheduledPublishAt: true,
        scheduledBy: true,
      },
    });

    if (scheduledPages.length === 0) {
      return ok({ processed: 0, errors: 0, details: ["No scheduled pages to publish"] });
    }

    details.push(`Found ${scheduledPages.length} pages scheduled for publishing`);

    // Process each scheduled page
    for (const page of scheduledPages) {
      try {
        // Determine what content to publish
        const contentToPublish = page.hasDraft && page.draftContent
          ? page.draftContent
          : page.content;

        // Update the page: publish and clear scheduling
        await prisma.marketingPage.update({
          where: { id: page.id },
          data: {
            content: contentToPublish,
            draftContent: null,
            hasDraft: false,
            status: "published",
            publishedAt: now,
            scheduledPublishAt: null,
            scheduledBy: null,
          },
        });

        processed++;
        details.push(
          `✓ Published "${page.title}" (${page.slug}) - ` +
          `scheduled for ${page.scheduledPublishAt?.toISOString()}`
        );
      } catch (pageError) {
        errors++;
        details.push(
          `✗ Failed to publish "${page.title}" (${page.slug}): ` +
          `${pageError instanceof Error ? pageError.message : "Unknown error"}`
        );
        console.error(`Error publishing scheduled page ${page.slug}:`, pageError);
      }
    }

    // Invalidate cache if any pages were published
    if (processed > 0) {
      revalidateMarketing();
    }

    return ok({ processed, errors, details });
  } catch (error) {
    console.error("Error processing scheduled publishes:", error);
    return fail("Failed to process scheduled publishes");
  }
}

/**
 * Get all pages with scheduled publish dates (for calendar view)
 */
export async function getScheduledPages(options?: {
  startDate?: Date;
  endDate?: Date;
}): Promise<ActionResult<MarketingPage[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const where: Record<string, unknown> = {
      scheduledPublishAt: {
        not: null,
      },
    };

    // Add date range filter if provided
    if (options?.startDate || options?.endDate) {
      where.scheduledPublishAt = {
        ...(options.startDate && { gte: options.startDate }),
        ...(options.endDate && { lte: options.endDate }),
      };
    }

    const pages = await prisma.marketingPage.findMany({
      where,
      orderBy: { scheduledPublishAt: "asc" },
    });

    return ok(pages);
  } catch (error) {
    console.error("Error fetching scheduled pages:", error);
    return fail("Failed to fetch scheduled pages");
  }
}

/**
 * Get pages with draft content (for calendar/dashboard views)
 */
export async function getDraftPages(): Promise<ActionResult<MarketingPage[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const pages = await prisma.marketingPage.findMany({
      where: { hasDraft: true },
      orderBy: { lastEditedAt: "desc" },
    });

    return ok(pages);
  } catch (error) {
    console.error("Error fetching draft pages:", error);
    return fail("Failed to fetch draft pages");
  }
}

/**
 * Get content calendar summary (counts by date)
 */
export async function getContentCalendarSummary(
  startDate: Date,
  endDate: Date
): Promise<ActionResult<{
  scheduled: { date: string; count: number; pages: { slug: string; title: string }[] }[];
  drafts: { slug: string; title: string; lastEditedAt: Date | null }[];
  published: { date: string; count: number }[];
}>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    // Get scheduled pages in range
    const scheduledPages = await prisma.marketingPage.findMany({
      where: {
        scheduledPublishAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        slug: true,
        title: true,
        scheduledPublishAt: true,
      },
      orderBy: { scheduledPublishAt: "asc" },
    });

    // Group scheduled pages by date
    const scheduledByDate = new Map<string, { slug: string; title: string }[]>();
    for (const page of scheduledPages) {
      if (page.scheduledPublishAt) {
        const dateKey = page.scheduledPublishAt.toISOString().split("T")[0];
        if (!scheduledByDate.has(dateKey)) {
          scheduledByDate.set(dateKey, []);
        }
        scheduledByDate.get(dateKey)!.push({ slug: page.slug, title: page.title });
      }
    }

    const scheduled = Array.from(scheduledByDate.entries()).map(([date, pages]) => ({
      date,
      count: pages.length,
      pages,
    }));

    // Get draft pages
    const draftPages = await prisma.marketingPage.findMany({
      where: { hasDraft: true },
      select: {
        slug: true,
        title: true,
        lastEditedAt: true,
      },
      orderBy: { lastEditedAt: "desc" },
    });

    const drafts = draftPages.map((p) => ({
      slug: p.slug,
      title: p.title,
      lastEditedAt: p.lastEditedAt,
    }));

    // Get recently published pages in range
    const publishedPages = await prisma.marketingPage.findMany({
      where: {
        status: "published",
        publishedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        publishedAt: true,
      },
    });

    // Group published by date
    const publishedByDate = new Map<string, number>();
    for (const page of publishedPages) {
      if (page.publishedAt) {
        const dateKey = page.publishedAt.toISOString().split("T")[0];
        publishedByDate.set(dateKey, (publishedByDate.get(dateKey) || 0) + 1);
      }
    }

    const published = Array.from(publishedByDate.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return ok({ scheduled, drafts, published });
  } catch (error) {
    console.error("Error fetching content calendar summary:", error);
    return fail("Failed to fetch content calendar summary");
  }
}

// ============================================================================
// CMS PRESENCE - Collaborative Editing
// ============================================================================

// Color palette for user avatars
const PRESENCE_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f97316", // orange
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#ef4444", // red
];

/**
 * Get a consistent color for a user based on their ID
 */
function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return PRESENCE_COLORS[Math.abs(hash) % PRESENCE_COLORS.length];
}

/**
 * Update or create presence for the current user editing an entity
 * Should be called periodically (every 10-30 seconds) while editing
 */
export async function updatePresence(
  entityType: string,
  entityId: string,
  activeField?: string
): Promise<ActionResult<CMSPresence>> {
  try {
    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    const presence = await prisma.cMSPresence.upsert({
      where: {
        userId_entityType_entityId: {
          userId: user.id,
          entityType,
          entityId,
        },
      },
      update: {
        lastSeen: new Date(),
        activeField,
        userName: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : user.emailAddresses[0]?.emailAddress || "Unknown",
        userAvatar: user.imageUrl,
      },
      create: {
        userId: user.id,
        userName: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : user.emailAddresses[0]?.emailAddress || "Unknown",
        userAvatar: user.imageUrl,
        userColor: getUserColor(user.id),
        entityType,
        entityId,
        activeField,
      },
    });

    return ok(presence);
  } catch (error) {
    console.error("Error updating presence:", error);
    return fail("Failed to update presence");
  }
}

/**
 * Get all active editors for an entity
 * Considers presence stale after 60 seconds
 */
export async function getActiveEditors(
  entityType: string,
  entityId: string
): Promise<ActionResult<CMSPresence[]>> {
  try {
    const user = await currentUser();
    const staleThreshold = new Date(Date.now() - 60 * 1000); // 60 seconds ago

    const editors = await prisma.cMSPresence.findMany({
      where: {
        entityType,
        entityId,
        lastSeen: {
          gte: staleThreshold,
        },
        // Optionally exclude current user
        ...(user ? { NOT: { userId: user.id } } : {}),
      },
      orderBy: {
        lastSeen: "desc",
      },
    });

    return ok(editors);
  } catch (error) {
    console.error("Error fetching active editors:", error);
    return fail("Failed to fetch active editors");
  }
}

/**
 * Remove presence when user leaves the editor
 */
export async function removePresence(
  entityType: string,
  entityId: string
): Promise<ActionResult<void>> {
  try {
    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    await prisma.cMSPresence.deleteMany({
      where: {
        userId: user.id,
        entityType,
        entityId,
      },
    });

    return success();
  } catch (error) {
    console.error("Error removing presence:", error);
    return fail("Failed to remove presence");
  }
}

/**
 * Clean up stale presence records (for cron job)
 * Removes records older than 2 minutes
 */
export async function cleanupStalePresence(): Promise<
  ActionResult<{ deleted: number }>
> {
  try {
    const staleThreshold = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago

    const result = await prisma.cMSPresence.deleteMany({
      where: {
        lastSeen: {
          lt: staleThreshold,
        },
      },
    });

    return ok({ deleted: result.count });
  } catch (error) {
    console.error("Error cleaning up stale presence:", error);
    return fail("Failed to clean up stale presence");
  }
}

// ============================================================================
// CMS AUDIT LOG - Activity Tracking
// ============================================================================

/**
 * Create an audit log entry
 * Internal function - called by other actions when they perform operations
 */
export async function createAuditLog(params: {
  entityType: string;
  entityId: string;
  entityName?: string;
  action: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<ActionResult<CMSAuditLog>> {
  try {
    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    const log = await prisma.cMSAuditLog.create({
      data: {
        userId: user.id,
        userName: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : user.emailAddresses[0]?.emailAddress || "Unknown",
        entityType: params.entityType,
        entityId: params.entityId,
        entityName: params.entityName,
        action: params.action,
        details: params.details || undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });

    return ok(log);
  } catch (error) {
    console.error("Error creating audit log:", error);
    return fail("Failed to create audit log");
  }
}

/**
 * Get audit logs for an entity
 */
export async function getAuditLogs(
  entityType: string,
  entityId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<ActionResult<{ logs: CMSAuditLog[]; total: number }>> {
  try {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const [logs, total] = await Promise.all([
      prisma.cMSAuditLog.findMany({
        where: {
          entityType,
          entityId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.cMSAuditLog.count({
        where: {
          entityType,
          entityId,
        },
      }),
    ]);

    return ok({ logs, total });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return fail("Failed to fetch audit logs");
  }
}

/**
 * Get recent activity across all CMS content
 */
export async function getRecentActivity(
  limit: number = 20
): Promise<ActionResult<CMSAuditLog[]>> {
  try {
    const logs = await prisma.cMSAuditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return ok(logs);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return fail("Failed to fetch recent activity");
  }
}

// ===========================================
// Content Approval Workflow Actions
// ===========================================

interface Approver {
  userId: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  respondedAt?: string;
  comment?: string;
}

/**
 * Request approval for content
 */
export async function requestApproval(params: {
  entityType: string;
  entityId: string;
  entityTitle: string;
  contentSnapshot: Record<string, unknown>;
  changesSummary?: string;
  approvers: { userId: string; name: string }[];
}): Promise<ActionResult<ContentApproval>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    // Check if there's already a pending approval for this content
    const existing = await prisma.contentApproval.findFirst({
      where: {
        entityType: params.entityType,
        entityId: params.entityId,
        status: { in: ["pending", "in_review"] },
      },
    });

    if (existing) {
      return fail("There is already a pending approval request for this content");
    }

    // Create approval request
    const approvers: Approver[] = params.approvers.map((a) => ({
      userId: a.userId,
      name: a.name,
      status: "pending",
    }));

    const approval = await prisma.contentApproval.create({
      data: {
        entityType: params.entityType,
        entityId: params.entityId,
        entityTitle: params.entityTitle,
        status: "pending",
        requestedBy: user.id,
        requestedByName: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : user.emailAddresses[0]?.emailAddress || "Unknown",
        approvers: approvers,
        currentStep: 0,
        contentSnapshot: params.contentSnapshot,
        changesSummary: params.changesSummary,
      },
    });

    return ok(approval);
  } catch (error) {
    console.error("Error requesting approval:", error);
    return fail("Failed to request approval");
  }
}

/**
 * Respond to an approval request (approve or reject)
 */
export async function respondToApproval(params: {
  approvalId: string;
  action: "approve" | "reject";
  comment?: string;
}): Promise<ActionResult<ContentApproval>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    const approval = await prisma.contentApproval.findUnique({
      where: { id: params.approvalId },
    });

    if (!approval) {
      return fail("Approval request not found");
    }

    if (!["pending", "in_review"].includes(approval.status)) {
      return fail("This approval request has already been resolved");
    }

    const approvers = approval.approvers as Approver[];
    const currentStep = approval.currentStep;

    // Find current approver
    if (currentStep >= approvers.length) {
      return fail("Invalid approval step");
    }

    const currentApprover = approvers[currentStep];
    if (currentApprover.userId !== user.id) {
      return fail("You are not the current approver for this request");
    }

    // Update approver response
    approvers[currentStep] = {
      ...currentApprover,
      status: params.action === "approve" ? "approved" : "rejected",
      respondedAt: new Date().toISOString(),
      comment: params.comment,
    };

    const userName = user.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user.emailAddresses[0]?.emailAddress || "Unknown";

    // Determine new status
    let newStatus: "pending" | "in_review" | "approved" | "rejected" = approval.status as "pending" | "in_review";
    let resolvedAt: Date | undefined;
    let resolvedBy: string | undefined;
    let resolvedByName: string | undefined;
    let resolution: string | undefined;

    if (params.action === "reject") {
      // Rejection ends the workflow
      newStatus = "rejected";
      resolvedAt = new Date();
      resolvedBy = user.id;
      resolvedByName = userName;
      resolution = "rejected";
    } else if (currentStep + 1 >= approvers.length) {
      // Last approver approved - mark as approved
      newStatus = "approved";
      resolvedAt = new Date();
      resolvedBy = user.id;
      resolvedByName = userName;
      resolution = "approved";
    } else {
      // Move to next step
      newStatus = "in_review";
    }

    const updated = await prisma.contentApproval.update({
      where: { id: params.approvalId },
      data: {
        approvers: approvers,
        currentStep: params.action === "approve" ? currentStep + 1 : currentStep,
        status: newStatus,
        resolvedAt,
        resolvedBy,
        resolvedByName,
        resolution,
        resolutionNote: params.comment,
      },
    });

    // Dispatch webhook when workflow is complete (approved or rejected)
    if (newStatus === "approved" || newStatus === "rejected") {
      await dispatchWebhooks({
        event: newStatus === "approved" ? "content_approved" : "content_rejected",
        entityType: approval.entityType,
        entityId: approval.entityId,
        entityName: approval.entityTitle || undefined,
        changes: { comment: params.comment },
        actorId: user.id,
        actorName: userName,
      });
    }

    return ok(updated);
  } catch (error) {
    console.error("Error responding to approval:", error);
    return fail("Failed to respond to approval");
  }
}

/**
 * Cancel an approval request
 */
export async function cancelApproval(
  approvalId: string
): Promise<ActionResult<ContentApproval>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    const approval = await prisma.contentApproval.findUnique({
      where: { id: approvalId },
    });

    if (!approval) {
      return fail("Approval request not found");
    }

    if (!["pending", "in_review"].includes(approval.status)) {
      return fail("This approval request has already been resolved");
    }

    // Only the requester can cancel
    if (approval.requestedBy !== user.id) {
      return fail("Only the requester can cancel this approval");
    }

    const userName = user.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user.emailAddresses[0]?.emailAddress || "Unknown";

    const updated = await prisma.contentApproval.update({
      where: { id: approvalId },
      data: {
        status: "cancelled",
        resolvedAt: new Date(),
        resolvedBy: user.id,
        resolvedByName: userName,
        resolution: "cancelled",
      },
    });

    return ok(updated);
  } catch (error) {
    console.error("Error cancelling approval:", error);
    return fail("Failed to cancel approval");
  }
}

/**
 * Get pending approvals for current user
 */
export async function getMyPendingApprovals(): Promise<
  ActionResult<ContentApproval[]>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const user = await currentUser();
    if (!user) {
      return fail("Not authenticated");
    }

    // Get all pending/in_review approvals
    const approvals = await prisma.contentApproval.findMany({
      where: {
        status: { in: ["pending", "in_review"] },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    // Filter to only those where current user is the current approver
    const myApprovals = approvals.filter((approval) => {
      const approvers = approval.approvers as Approver[];
      const currentApprover = approvers[approval.currentStep];
      return currentApprover?.userId === user.id && currentApprover?.status === "pending";
    });

    return ok(myApprovals);
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return fail("Failed to fetch pending approvals");
  }
}

/**
 * Get approval history for an entity
 */
export async function getApprovalHistory(
  entityType: string,
  entityId: string
): Promise<ActionResult<ContentApproval[]>> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const approvals = await prisma.contentApproval.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return ok(approvals);
  } catch (error) {
    console.error("Error fetching approval history:", error);
    return fail("Failed to fetch approval history");
  }
}

/**
 * Get all pending approvals (for admin dashboard)
 */
export async function getAllPendingApprovals(): Promise<
  ActionResult<ContentApproval[]>
> {
  try {
    if (!(await isSuperAdmin())) {
      return fail("Unauthorized");
    }

    const approvals = await prisma.contentApproval.findMany({
      where: {
        status: { in: ["pending", "in_review"] },
      },
      orderBy: {
        requestedAt: "desc",
      },
    });

    return ok(approvals);
  } catch (error) {
    console.error("Error fetching all pending approvals:", error);
    return fail("Failed to fetch pending approvals");
  }
}
