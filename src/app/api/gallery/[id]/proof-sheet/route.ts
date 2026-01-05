import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { renderToBuffer } from "@react-pdf/renderer";
import { ProofSheetDocument } from "./proof-sheet-document";

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

    // Fetch gallery with photos
    const gallery = await prisma.project.findFirst({
      where: {
        id,
        organizationId: auth.organizationId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        assets: {
          select: {
            id: true,
            filename: true,
            thumbnailUrl: true,
            mediumUrl: true,
            originalUrl: true,
            width: true,
            height: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        client: {
          select: {
            fullName: true,
            company: true,
            email: true,
          },
        },
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

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      ProofSheetDocument({
        galleryName: gallery.name,
        galleryDescription: gallery.description || undefined,
        clientName: gallery.client?.company || gallery.client?.fullName || undefined,
        photographerName: gallery.organization.publicName || gallery.organization.name,
        logoUrl: gallery.organization.logoUrl || undefined,
        createdAt: gallery.createdAt.toISOString(),
        photos: gallery.assets.map((asset, index) => ({
          id: asset.id,
          url: asset.mediumUrl || asset.thumbnailUrl || asset.originalUrl,
          filename: asset.filename,
          number: index + 1,
        })),
      })
    );

    // Return PDF
    const pdfBytes =
      pdfBuffer instanceof Uint8Array ? pdfBuffer : new Uint8Array(pdfBuffer);
    const pdfArrayBuffer = pdfBytes.buffer.slice(
      pdfBytes.byteOffset,
      pdfBytes.byteOffset + pdfBytes.byteLength
    ) as ArrayBuffer;

    return new NextResponse(pdfArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${gallery.name.replace(/[^a-z0-9]/gi, "-")}-proof-sheet.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating proof sheet:", error);
    return NextResponse.json(
      { error: "Failed to generate proof sheet" },
      { status: 500 }
    );
  }
}
