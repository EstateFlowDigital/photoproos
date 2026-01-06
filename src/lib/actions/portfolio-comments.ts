"use server";

import { ok, fail, type VoidActionResult } from "@/lib/types/action-result";

import { prisma } from "@/lib/db";
import { requireAuth, requireOrganizationId } from "@/lib/actions/auth-helper";
import { revalidatePath } from "next/cache";

export interface PortfolioCommentWithMeta {
  id: string;
  content: string;
  sectionId: string | null;
  projectId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  isApproved: boolean;
  isHidden: boolean;
  createdAt: Date;
  portfolioWebsite: {
    id: string;
    name: string;
    slug: string;
  };
}

export async function getPortfolioComments(options?: {
  portfolioId?: string;
  status?: "pending" | "approved" | "hidden" | "all";
}): Promise<{ success: boolean; comments?: PortfolioCommentWithMeta[]; error?: string }> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const where: {
      organizationId: string;
      portfolioWebsiteId?: string;
      isApproved?: boolean;
      isHidden?: boolean;
    } = {
      organizationId,
    };

    if (options?.portfolioId) {
      where.portfolioWebsiteId = options.portfolioId;
    }

    if (options?.status === "pending") {
      where.isApproved = false;
      where.isHidden = false;
    } else if (options?.status === "approved") {
      where.isApproved = true;
    } else if (options?.status === "hidden") {
      where.isHidden = true;
    }

    const comments = await prisma.portfolioComment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        portfolioWebsite: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return { success: true, comments };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return fail("Failed to fetch comments");
  }
}

export async function approveComment(
  commentId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify the comment belongs to this organization
    const comment = await prisma.portfolioComment.findFirst({
      where: { id: commentId, organizationId },
    });

    if (!comment) {
      return fail("Comment not found");
    }

    await prisma.portfolioComment.update({
      where: { id: commentId },
      data: { isApproved: true, isHidden: false },
    });

    revalidatePath("/portfolios");
    return ok();
  } catch (error) {
    console.error("Error approving comment:", error);
    return fail("Failed to approve comment");
  }
}

export async function hideComment(
  commentId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const comment = await prisma.portfolioComment.findFirst({
      where: { id: commentId, organizationId },
    });

    if (!comment) {
      return fail("Comment not found");
    }

    await prisma.portfolioComment.update({
      where: { id: commentId },
      data: { isHidden: true },
    });

    revalidatePath("/portfolios");
    return ok();
  } catch (error) {
    console.error("Error hiding comment:", error);
    return fail("Failed to hide comment");
  }
}

export async function unhideComment(
  commentId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const comment = await prisma.portfolioComment.findFirst({
      where: { id: commentId, organizationId },
    });

    if (!comment) {
      return fail("Comment not found");
    }

    await prisma.portfolioComment.update({
      where: { id: commentId },
      data: { isHidden: false },
    });

    revalidatePath("/portfolios");
    return ok();
  } catch (error) {
    console.error("Error unhiding comment:", error);
    return fail("Failed to unhide comment");
  }
}

export async function deleteComment(
  commentId: string
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const comment = await prisma.portfolioComment.findFirst({
      where: { id: commentId, organizationId },
    });

    if (!comment) {
      return fail("Comment not found");
    }

    await prisma.portfolioComment.delete({
      where: { id: commentId },
    });

    revalidatePath("/portfolios");
    return ok();
  } catch (error) {
    console.error("Error deleting comment:", error);
    return fail("Failed to delete comment");
  }
}

export async function getCommentStats(): Promise<{
  success: boolean;
  stats?: {
    pending: number;
    approved: number;
    hidden: number;
    total: number;
  };
  error?: string;
}> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    const [pending, approved, hidden, total] = await Promise.all([
      prisma.portfolioComment.count({
        where: { organizationId, isApproved: false, isHidden: false },
      }),
      prisma.portfolioComment.count({
        where: { organizationId, isApproved: true },
      }),
      prisma.portfolioComment.count({
        where: { organizationId, isHidden: true },
      }),
      prisma.portfolioComment.count({
        where: { organizationId },
      }),
    ]);

    return {
      success: true,
      stats: { pending, approved, hidden, total },
    };
  } catch (error) {
    console.error("Error fetching comment stats:", error);
    return fail("Failed to fetch comment stats");
  }
}

export async function updateCommentSettings(
  portfolioId: string,
  settings: {
    allowComments?: boolean;
    requireCommentEmail?: boolean;
  }
): Promise<VoidActionResult> {
  try {
    await requireAuth();
    const organizationId = await requireOrganizationId();

    // Verify the portfolio belongs to this organization
    const portfolio = await prisma.portfolioWebsite.findFirst({
      where: { id: portfolioId, organizationId },
    });

    if (!portfolio) {
      return fail("Portfolio not found");
    }

    await prisma.portfolioWebsite.update({
      where: { id: portfolioId },
      data: settings,
    });

    revalidatePath("/portfolios");
    revalidatePath(`/portfolios/${portfolioId}`);
    return ok();
  } catch (error) {
    console.error("Error updating comment settings:", error);
    return fail("Failed to update settings");
  }
}
