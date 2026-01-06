import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

// Using Node.js runtime for Prisma compatibility
export const alt = "Portfolio Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const website = await prisma.portfolioWebsite.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      heroTitle: true,
      heroSubtitle: true,
      primaryColor: true,
      logoUrl: true,
      template: true,
      organization: {
        select: {
          name: true,
          logoUrl: true,
        },
      },
      projects: {
        take: 4,
        orderBy: { position: "asc" },
        include: {
          project: {
            select: {
              coverImageUrl: true,
              assets: {
                take: 1,
                orderBy: { sortOrder: "asc" },
                select: {
                  thumbnailUrl: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!website) {
    // Default fallback image
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            fontSize: 48,
            fontWeight: 700,
            color: "white",
          }}
        >
          Portfolio Not Found
        </div>
      ),
      { ...size }
    );
  }

  const primaryColor = website.primaryColor || "#3b82f6";
  const title = website.heroTitle || website.name;
  const subtitle = website.heroSubtitle || website.description;
  const orgName = website.organization.name;
  const logoUrl = website.logoUrl || website.organization.logoUrl;

  // Get project images
  const projectImages = website.projects
    .map((p) => p.project.coverImageUrl || p.project.assets[0]?.thumbnailUrl)
    .filter(Boolean)
    .slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          backgroundColor: "#0a0a0a",
          padding: 48,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              width={56}
              height={56}
              style={{
                borderRadius: 12,
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: 12,
                backgroundColor: primaryColor,
                color: "white",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {orgName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#7c7c7c", fontSize: 16 }}>Portfolio</span>
            <span style={{ color: "white", fontSize: 20, fontWeight: 600 }}>
              {orgName}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flex: 1,
            gap: 48,
          }}
        >
          {/* Text Section */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
            }}
          >
            <h1
              style={{
                fontSize: 64,
                fontWeight: 700,
                color: "white",
                lineHeight: 1.1,
                margin: 0,
                marginBottom: 16,
              }}
            >
              {title.length > 50 ? title.slice(0, 50) + "..." : title}
            </h1>
            {subtitle && (
              <p
                style={{
                  fontSize: 24,
                  color: "#a7a7a7",
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {subtitle.length > 120
                  ? subtitle.slice(0, 120) + "..."
                  : subtitle}
              </p>
            )}
          </div>

          {/* Image Grid */}
          {projectImages.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                width: 420,
                gap: 12,
              }}
            >
              {projectImages.slice(0, 4).map((img, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    width: projectImages.length === 1 ? 420 : 200,
                    height: projectImages.length === 1 ? 400 : 192,
                    borderRadius: 16,
                    overflow: "hidden",
                    backgroundColor: "#1a1a1a",
                  }}
                >
                  <img
                    src={img as string}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid #262626",
          }}
        >
          <span style={{ color: "#7c7c7c", fontSize: 16 }}>
            View full portfolio
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 8,
              backgroundColor: primaryColor,
            }}
          >
            <span style={{ color: "white", fontSize: 14, fontWeight: 500 }}>
              Powered by PhotoProOS
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
