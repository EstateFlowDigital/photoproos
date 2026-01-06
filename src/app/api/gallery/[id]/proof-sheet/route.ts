import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { renderToBuffer } from "@react-pdf/renderer";
import { ProofSheetDocument } from "./proof-sheet-document";

// Route segment config for longer timeout (PDF generation can be slow)
export const maxDuration = 60; // 60 seconds (Vercel Pro/Enterprise)

// Simple gray placeholder image (1x1 pixel gray PNG)
const PLACEHOLDER_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEBgIA1BQdCgAAAABJRU5ErkJggg==";

// Configuration - tuned for serverless environments with limited memory/time
const MAX_PHOTOS = 100; // Maximum photos (reduced from 150 for faster generation)
const CONCURRENCY_LIMIT = 15; // Process more images in parallel
const IMAGE_TIMEOUT_MS = 5000; // 5 second timeout per image (reduced for faster failure)

// Fetch image and convert to base64 data URL for react-pdf compatibility
async function fetchImageAsBase64(url: string | null | undefined): Promise<string> {
  // Return placeholder for empty/invalid URLs
  if (!url || typeof url !== "string" || url.trim() === "") {
    return PLACEHOLDER_IMAGE;
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    console.warn(`[Proof Sheet] Invalid URL format: ${url.substring(0, 50)}`);
    return PLACEHOLDER_IMAGE;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept": "image/*",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Proof Sheet] Image fetch failed (${response.status}): ${url.substring(0, 80)}`);
      return PLACEHOLDER_IMAGE;
    }

    const arrayBuffer = await response.arrayBuffer();

    // Check if we actually got image data
    if (arrayBuffer.byteLength === 0) {
      console.warn(`[Proof Sheet] Empty response for: ${url.substring(0, 80)}`);
      return PLACEHOLDER_IMAGE;
    }

    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Determine mime type from content-type header
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const mimeType = contentType.split(";")[0].trim();

    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    // Log timeout separately from other errors
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`[Proof Sheet] Image fetch timeout: ${url.substring(0, 80)}`);
    }
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

    // Limit photos to prevent timeout/memory issues
    const assetsToProcess = gallery.assets.slice(0, MAX_PHOTOS);
    const totalPhotos = gallery.assets.length;
    const isLimited = totalPhotos > MAX_PHOTOS;

    if (isLimited) {
      console.log(`[Proof Sheet] Gallery has ${totalPhotos} photos, limiting to ${MAX_PHOTOS}`);
    }

    // Process images in batches with concurrency limit
    const photosWithBase64: Array<{
      id: string;
      url: string;
      filename: string;
      number: number;
    }> = [];

    for (let i = 0; i < assetsToProcess.length; i += CONCURRENCY_LIMIT) {
      const batch = assetsToProcess.slice(i, i + CONCURRENCY_LIMIT);
      const batchResults = await Promise.all(
        batch.map(async (asset, batchIndex) => {
          const globalIndex = i + batchIndex;
          // Use first valid URL, preferring thumbnails for smaller file size
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

    // Generate PDF with description note if photos were limited
    const description = isLimited
      ? `${gallery.description || ""}\n\nNote: This proof sheet shows the first ${MAX_PHOTOS} of ${totalPhotos} photos.`.trim()
      : gallery.description || undefined;

    const pdfBuffer = await renderToBuffer(
      ProofSheetDocument({
        galleryName: gallery.name,
        galleryDescription: description,
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

    const safeFilename = gallery.name.replace(/[^a-z0-9]/gi, "-").substring(0, 50);

    return new NextResponse(pdfArrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFilename}-proof-sheet.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[Proof Sheet] Error generating PDF:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate proof sheet", details: message },
      { status: 500 }
    );
  }
}
