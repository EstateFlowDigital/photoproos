import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { generateExpenseReport } from "@/lib/actions/project-expenses";
import { ExpenseReportPDF } from "@/lib/pdf/templates/expense-report-pdf";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import React from "react";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: projectId } = await params;

    // Get optional date range from query params
    const url = new URL(request.url);
    const dateFromParam = url.searchParams.get("from");
    const dateToParam = url.searchParams.get("to");

    const dateFrom = dateFromParam ? new Date(dateFromParam) : undefined;
    const dateTo = dateToParam ? new Date(dateToParam) : undefined;

    // Generate expense report data
    const result = await generateExpenseReport(projectId, dateFrom, dateTo);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to generate report" },
        { status: 400 }
      );
    }

    // Get organization name
    const org = await prisma.organization.findUnique({
      where: { clerkOrganizationId: orgId },
      select: { name: true },
    });

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      React.createElement(ExpenseReportPDF, {
        data: result.data,
        organizationName: org?.name || undefined,
      })
    );

    // Create filename
    const safeName = result.data.projectName.replace(/[^a-zA-Z0-9]/g, "-");
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `expense-report-${safeName}-${dateStr}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating expense report PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
