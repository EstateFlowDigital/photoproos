import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import JSZip from "jszip";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext();
    if (!auth || !auth.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const organizationId = auth.organizationId;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    // Fetch gallery with favorites and their assets
    const gallery = await prisma.project.findFirst({
      where: {
        id,
        organizationId,
      },
      select: {
        id: true,
        name: true,
        favorites: {
          select: {
            id: true,
            clientEmail: true,
            createdAt: true,
            asset: {
              select: {
                id: true,
                filename: true,
                originalUrl: true,
                thumbnailUrl: true,
                mediumUrl: true,
                width: true,
                height: true,
                sizeBytes: true,
                sortOrder: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        client: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!gallery) {
      return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
    }

    if (gallery.favorites.length === 0) {
      return NextResponse.json(
        { error: "No favorites found in this gallery" },
        { status: 404 }
      );
    }

    if (format === "csv") {
      // Generate CSV export
      const csvHeaders = [
        "Photo Number",
        "Filename",
        "Favorited By",
        "Favorited At",
        "Image URL",
        "Width",
        "Height",
        "File Size (bytes)",
      ];

      const csvRows = gallery.favorites.map((fav, index) => [
        index + 1,
        fav.asset.filename,
        fav.clientEmail || gallery.client?.email || "Unknown",
        new Date(fav.createdAt).toISOString(),
        fav.asset.originalUrl,
        fav.asset.width || "",
        fav.asset.height || "",
        fav.asset.sizeBytes || "",
      ]);

      const csvContent = [
        csvHeaders.join(","),
        ...csvRows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const filename = `${gallery.name.replace(/[^a-z0-9]/gi, "-")}-favorites.csv`;

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else if (format === "zip") {
      // Generate ZIP with images
      const zip = new JSZip();
      const folder = zip.folder("favorites");

      if (!folder) {
        return NextResponse.json(
          { error: "Failed to create ZIP" },
          { status: 500 }
        );
      }

      // Add a manifest file
      const manifest = {
        galleryName: gallery.name,
        exportDate: new Date().toISOString(),
        totalFavorites: gallery.favorites.length,
        client: gallery.client?.fullName || "Unknown",
        photos: gallery.favorites.map((fav, index) => ({
          number: index + 1,
          filename: fav.asset.filename,
          favoritedBy: fav.clientEmail || gallery.client?.email || "Unknown",
          favoritedAt: fav.createdAt,
          sizeBytes: fav.asset.sizeBytes,
        })),
      };

      folder.file("manifest.json", JSON.stringify(manifest, null, 2));

      // Fetch and add each image
      const imagePromises = gallery.favorites.map(async (fav, index) => {
        try {
          const imageUrl = fav.asset.mediumUrl || fav.asset.originalUrl;
          const response = await fetch(imageUrl);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            const extension = fav.asset.filename.split(".").pop() || "jpg";
            const paddedIndex = String(index + 1).padStart(3, "0");
            folder.file(`${paddedIndex}_${fav.asset.filename}`, buffer);
          }
        } catch (error) {
          console.error(`Failed to fetch image ${fav.asset.filename}:`, error);
        }
      });

      await Promise.all(imagePromises);

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
      const filename = `${gallery.name.replace(/[^a-z0-9]/gi, "-")}-favorites.zip`;

      return new NextResponse(new Uint8Array(zipBuffer), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else if (format === "json") {
      // Generate JSON export
      const jsonContent = {
        galleryName: gallery.name,
        exportDate: new Date().toISOString(),
        totalFavorites: gallery.favorites.length,
        client: gallery.client
          ? {
              name: gallery.client.fullName,
              email: gallery.client.email,
            }
          : null,
        favorites: gallery.favorites.map((fav, index) => ({
          number: index + 1,
          id: fav.id,
          assetId: fav.asset.id,
          filename: fav.asset.filename,
          url: fav.asset.originalUrl,
          thumbnailUrl: fav.asset.thumbnailUrl,
          width: fav.asset.width,
          height: fav.asset.height,
          sizeBytes: fav.asset.sizeBytes,
          favoritedBy: fav.clientEmail || gallery.client?.email || "Unknown",
          favoritedAt: fav.createdAt,
        })),
      };

      const filename = `${gallery.name.replace(/[^a-z0-9]/gi, "-")}-favorites.json`;

      return new NextResponse(JSON.stringify(jsonContent, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Error exporting favorites:", error);
    return NextResponse.json(
      { error: "Failed to export favorites" },
      { status: 500 }
    );
  }
}
