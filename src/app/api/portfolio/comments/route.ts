import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Get approved comments for a portfolio (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const sectionId = searchParams.get("sectionId");
    const projectId = searchParams.get("projectId");

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug is required" },
        { status: 400 }
      );
    }

    // Find the portfolio
    const portfolio = await prisma.portfolioWebsite.findUnique({
      where: { slug },
      select: { id: true, allowComments: true },
    });

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found" },
        { status: 404 }
      );
    }

    if (!portfolio.allowComments) {
      return NextResponse.json(
        { success: false, error: "Comments are disabled for this portfolio" },
        { status: 403 }
      );
    }

    // Build filter
    const where: {
      portfolioWebsiteId: string;
      isApproved: boolean;
      isHidden: boolean;
      sectionId?: string;
      projectId?: string;
    } = {
      portfolioWebsiteId: portfolio.id,
      isApproved: true,
      isHidden: false,
    };

    if (sectionId) {
      where.sectionId = sectionId;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    const comments = await prisma.portfolioComment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        sectionId: true,
        projectId: true,
        authorName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// Submit a new comment (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, content, sectionId, projectId, authorName, authorEmail } = body;

    if (!slug || !content) {
      return NextResponse.json(
        { success: false, error: "Slug and content are required" },
        { status: 400 }
      );
    }

    // Find the portfolio
    const portfolio = await prisma.portfolioWebsite.findUnique({
      where: { slug },
      select: {
        id: true,
        organizationId: true,
        allowComments: true,
        requireCommentEmail: true,
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { success: false, error: "Portfolio not found" },
        { status: 404 }
      );
    }

    if (!portfolio.allowComments) {
      return NextResponse.json(
        { success: false, error: "Comments are disabled for this portfolio" },
        { status: 403 }
      );
    }

    // Validate email if required
    if (portfolio.requireCommentEmail && !authorEmail) {
      return NextResponse.json(
        { success: false, error: "Email is required to comment" },
        { status: 400 }
      );
    }

    // Basic email validation
    if (authorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Sanitize content (basic XSS prevention)
    const sanitizedContent = content
      .trim()
      .slice(0, 2000) // Limit to 2000 characters
      .replace(/<[^>]*>/g, ""); // Remove HTML tags

    if (sanitizedContent.length === 0) {
      return NextResponse.json(
        { success: false, error: "Comment content cannot be empty" },
        { status: 400 }
      );
    }

    // Create the comment (not approved by default - needs moderation)
    const comment = await prisma.portfolioComment.create({
      data: {
        portfolioWebsiteId: portfolio.id,
        organizationId: portfolio.organizationId,
        content: sanitizedContent,
        sectionId: sectionId || null,
        projectId: projectId || null,
        authorName: authorName?.trim().slice(0, 100) || null,
        authorEmail: authorEmail?.trim().toLowerCase() || null,
        isApproved: false, // Requires moderation
        isHidden: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comment submitted for review",
      commentId: comment.id,
    });
  } catch (error) {
    console.error("Error submitting comment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit comment" },
      { status: 500 }
    );
  }
}
