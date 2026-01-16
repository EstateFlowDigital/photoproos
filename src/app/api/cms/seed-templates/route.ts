import { NextResponse } from "next/server";
import { seedDefaultTemplates } from "@/lib/actions/cms-templates";
import { isSuperAdmin } from "@/lib/auth/super-admin";

export async function POST() {
  try {
    // Check authorization
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Seed the templates
    const result = await seedDefaultTemplates();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${result.data?.created} templates`,
      created: result.data?.created,
    });
  } catch (error) {
    console.error("Error seeding templates:", error);
    return NextResponse.json(
      { error: "Failed to seed templates" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Use POST to seed default CMS page templates",
    endpoint: "/api/cms/seed-templates",
  });
}
