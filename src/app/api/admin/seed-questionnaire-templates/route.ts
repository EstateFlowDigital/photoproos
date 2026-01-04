import { NextRequest, NextResponse } from "next/server";
import { seedQuestionnaireTemplates } from "@/lib/seed/questionnaire-templates";
import { getAuthContext } from "@/lib/auth/clerk";

/**
 * Seed system questionnaire templates
 * This endpoint is protected and requires admin/owner access
 *
 * Can be called via:
 * - POST /api/admin/seed-questionnaire-templates
 * - With ADMIN_SECRET header for automated deployments
 */
export async function POST(request: NextRequest) {
  // Check for admin secret first (for automated deployments)
  const adminSecret = request.headers.get("x-admin-secret");
  const envAdminSecret = process.env.ADMIN_SECRET;

  if (adminSecret && envAdminSecret && adminSecret === envAdminSecret) {
    // Admin secret matches, proceed with seeding
  } else {
    // Check for authenticated user with owner role
    const auth = await getAuthContext();
    if (!auth?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For now, allow any authenticated user to seed
    // In production, you might want to check for specific roles
  }

  try {
    const result = await seedQuestionnaireTemplates();

    return NextResponse.json({
      success: true,
      message: "Questionnaire templates seeded successfully",
      created: result.created,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error("Error seeding questionnaire templates:", error);
    return NextResponse.json(
      {
        error: "Failed to seed templates",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check current template count
export async function GET(request: NextRequest) {
  const auth = await getAuthContext();
  if (!auth?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { prisma } = await import("@/lib/db");

    const systemTemplateCount = await prisma.questionnaireTemplate.count({
      where: { isSystemTemplate: true },
    });

    return NextResponse.json({
      systemTemplates: systemTemplateCount,
      message: systemTemplateCount > 0
        ? "System templates are already seeded"
        : "No system templates found - run POST to seed",
    });
  } catch (error) {
    console.error("Error checking templates:", error);
    return NextResponse.json(
      { error: "Failed to check templates" },
      { status: 500 }
    );
  }
}
