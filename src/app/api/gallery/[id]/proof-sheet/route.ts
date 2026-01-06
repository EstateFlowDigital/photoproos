import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { renderToBuffer } from "@react-pdf/renderer";
import { ProofSheetDocument } from "./proof-sheet-document";

// Simple gray placeholder image (1x1 pixel gray PNG)
const PLACEHOLDER_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIA1BQdCgAAAABJRU5ErkJggg==";

// Fetch image and convert to base64 data URL for react-pdf compatibility
async function fetchImageAsBase64(url: string | null | undefined): Promise<string> {
  // Return placeholder for empty/invalid URLs
  if (!url || typeof url !== "string" || url.trim() === "") {
    console.warn("Empty or invalid image URL, using placeholder");
    return PLACEHOLDER_IMAGE;
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000), // 15 second timeout per image
    });
    if (!response.ok) {
      console.warn(`Image fetch failed with status ${response.status}: ${url.substring(0, 100)}`);
      return PLACEHOLDER_IMAGE;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Determine mime type from content-type header or URL
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const mimeType = contentType.split(";")[0].trim();

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Failed to fetch image:", url.substring(0, 100), error);
    return PLACEHOLDER_IMAGE;
  }
}

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

    // Fetch logo as base64 if exists
    let logoBase64: string | undefined;
    if (gallery.organization.logoUrl) {
      logoBase64 = await fetchImageAsBase64(gallery.organization.logoUrl);
    }

    // Fetch all photo images with concurrency limit to prevent overwhelming the server
    // Use thumbnails for smaller file size and faster processing
    const CONCURRENCY_LIMIT = 5;
    const photosWithBase64: Array<{
      id: string;
      url: string;
      filename: string;
      number: number;
    }> = [];

    // Process images in batches
    for (let i = 0; i < gallery.assets.length; i += CONCURRENCY_LIMIT) {
      const batch = gallery.assets.slice(i, i + CONCURRENCY_LIMIT);
      const batchResults = await Promise.all(
        batch.map(async (asset, batchIndex) => {
          const globalIndex = i + batchIndex;
          // Use first valid (non-empty) URL, preferring thumbnails for smaller size
          const url = (asset.thumbnailUrl && asset.thumbnailUrl.trim() !== "")
            ? asset.thumbnailUrl
            : (asset.mediumUrl && asset.mediumUrl.trim() !== "")
            ? asset.mediumUrl
            : asset.originalUrl;
          const base64Url = await fetchImageAsBase64(url);
          return {
            id: asset.id,
            url: base64Url,
            filename: asset.filename,
            number: globalIndex + 1,
          };
        })
      );
      photosWithBase64.push(...batchResults);
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      ProofSheetDocument({
        galleryName: gallery.name,
        galleryDescription: gallery.description || undefined,
        clientName: gallery.client?.company || gallery.client?.fullName || undefined,
        photographerName: gallery.organization.publicName || gallery.organization.name,
        logoUrl: logoBase64,
        createdAt: gallery.createdAt.toISOString(),
        photos: photosWithBase64,
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
