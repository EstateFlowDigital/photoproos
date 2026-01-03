"use client";

import { useState, useMemo } from "react";
import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";
import { Lightbox } from "../components/lightbox";

interface Project {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  assets: {
    originalUrl: string;
    thumbnailUrl: string | null;
  }[];
}

interface GallerySectionProps {
  config: Record<string, unknown>;
  projects: Project[];
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
  allowDownloads?: boolean;
}

interface LightboxImage {
  url: string;
  alt: string;
  projectName?: string;
}

export function GallerySection({
  config,
  projects,
  templateConfig,
  allowDownloads = false,
}: GallerySectionProps) {
  const projectIds = (config.projectIds as string[]) || [];
  const columns = (config.columns as number) || 3;
  const showProjectNames = config.showProjectNames !== false;
  const showAllImages = (config.showAllImages as boolean) || false;

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Filter projects if specific IDs are set, otherwise show all
  const displayProjects =
    projectIds.length > 0
      ? projects.filter((p) => projectIds.includes(p.id))
      : projects;

  // Build array of all images for lightbox
  const allImages = useMemo<LightboxImage[]>(() => {
    const images: LightboxImage[] = [];

    displayProjects.forEach((project) => {
      if (showAllImages && project.assets.length > 0) {
        // Show all assets from the project
        project.assets.forEach((asset) => {
          images.push({
            url: asset.originalUrl,
            alt: project.name,
            projectName: project.name,
          });
        });
      } else {
        // Show only cover image or first asset
        const imageUrl =
          project.coverImageUrl ||
          project.assets[0]?.originalUrl ||
          project.assets[0]?.thumbnailUrl;

        if (imageUrl) {
          images.push({
            url: imageUrl,
            alt: project.name,
            projectName: project.name,
          });
        }
      }
    });

    return images;
  }, [displayProjects, showAllImages]);

  // Open lightbox at specific index
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (displayProjects.length === 0) {
    return (
      <section
        className="py-16"
        style={{ backgroundColor: templateConfig.colors.background }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div
            className="rounded-xl border border-dashed py-12 text-center"
            style={{
              borderColor: templateConfig.colors.cardBorder,
              color: templateConfig.colors.textMuted,
            }}
          >
            No projects to display yet.
          </div>
        </div>
      </section>
    );
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  }[columns] || "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  // Track image index offset for each project
  let imageIndexOffset = 0;

  return (
    <>
      <section
        className="py-16"
        style={{ backgroundColor: templateConfig.colors.background }}
      >
        <div className="mx-auto max-w-6xl px-6">
          {showAllImages ? (
            // Flat gallery showing all images
            <div className={`grid gap-4 ${gridCols}`}>
              {allImages.map((image, index) => (
                <button
                  key={`${image.url}-${index}`}
                  onClick={() => openLightbox(index)}
                  className="group relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    borderRadius: templateConfig.borderRadius,
                    backgroundColor: templateConfig.colors.backgroundSecondary,
                  }}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                    <ZoomIcon className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Project-based gallery with cards
            <div className={`grid gap-6 ${gridCols}`}>
              {displayProjects.map((project) => {
                const asset = project.assets[0];
                const imageUrl =
                  project.coverImageUrl ||
                  asset?.thumbnailUrl ||
                  asset?.originalUrl;

                const currentIndex = imageIndexOffset;
                imageIndexOffset += 1;

                return (
                  <div
                    key={project.id}
                    className="group overflow-hidden transition-transform hover:-translate-y-1"
                    style={{
                      backgroundColor: templateConfig.colors.card,
                      borderRadius: templateConfig.borderRadius,
                      border: `1px solid ${templateConfig.colors.cardBorder}`,
                    }}
                  >
                    <button
                      onClick={() => imageUrl && openLightbox(currentIndex)}
                      className="relative w-full focus:outline-none"
                    >
                      <div
                        className="aspect-[4/3] w-full overflow-hidden"
                        style={{
                          backgroundColor: templateConfig.colors.backgroundSecondary,
                        }}
                      >
                        {imageUrl ? (
                          <>
                            <img
                              src={imageUrl}
                              alt={project.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                              <ZoomIcon className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                          </>
                        ) : (
                          <div
                            className="flex h-full w-full items-center justify-center text-sm"
                            style={{ color: templateConfig.colors.textMuted }}
                          >
                            No image
                          </div>
                        )}
                      </div>
                    </button>
                    {showProjectNames && (
                      <div className="p-4">
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: templateConfig.colors.text }}
                        >
                          {project.name}
                        </h3>
                        {project.description && (
                          <p
                            className="mt-1 line-clamp-2 text-sm"
                            style={{ color: templateConfig.colors.textMuted }}
                          >
                            {project.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <Lightbox
          images={allImages}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrevious={previousImage}
          allowDownloads={allowDownloads}
        />
      )}
    </>
  );
}

// Zoom Icon
function ZoomIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
      <path d="M11 8v6" />
      <path d="M8 11h6" />
    </svg>
  );
}
