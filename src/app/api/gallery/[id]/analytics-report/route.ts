import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { renderToBuffer } from "@react-pdf/renderer";
import { AnalyticsReportDocument } from "./analytics-report-document";
import { getComprehensiveGalleryAnalytics } from "@/lib/actions/gallery-analytics";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch gallery with organization info
    const gallery = await prisma.project.findFirst({
      where: {
        id,
        organizationId: auth.organizationId,
      },
      select: {
        id: true,
        name: true,
        organization: {
          select: {
            name: true,
            publicName: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    // Fetch comprehensive analytics
    const analyticsResult = await getComprehensiveGalleryAnalytics(id);

    if (!analyticsResult.success || !analyticsResult.data) {
      return NextResponse.json(
        { error: "error" in analyticsResult ? analyticsResult.error : "Failed to fetch analytics" },
        { status: 500 }
      );
    }

    const {
      overview,
      photoEngagement,
      downloadsByDay,
      downloadsByFormat,
    } = analyticsResult.data;

    // Fetch logo as base64 if exists
    let logoBase64: string | undefined;
    if (gallery.organization.logoUrl) {
      try {
        const response = await fetch(gallery.organization.logoUrl, {
          signal: AbortSignal.timeout(5000),
        });
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          const contentType = response.headers.get("content-type") || "image/png";
          logoBase64 = `data:${contentType};base64,${base64}`;
        }
      } catch {
        // Logo fetch failed, continue without it
      }
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      AnalyticsReportDocument({
        galleryName: gallery.name,
        photographerName:
          gallery.organization.publicName || gallery.organization.name,
        logoUrl: logoBase64,
        generatedAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        overview,
        photoEngagement,
        downloadsByDay,
        downloadsByFormat,
      })
    );

    // Return PDF
    const pdfBytes =
      pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
    const pdfArrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;

    const safeFilename = gallery.name.replace(/[^a-z0-9]/gi, "-").substring(0, 50);

    return new NextResponse(pdfArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}-analytics.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[Analytics Report] Error generating PDF:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate analytics report", details: message },
      { status: 500 }
    );
  }
}
