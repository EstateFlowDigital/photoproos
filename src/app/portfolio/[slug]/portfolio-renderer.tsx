"use client";

import { useEffect, useRef } from "react";
import type { PortfolioSectionType, PortfolioTemplate } from "@prisma/client";
import {
  PORTFOLIO_TEMPLATES,
  generateCSSVariables,
  getGoogleFontsUrl,
} from "@/lib/portfolio-templates";
import {
  trackPortfolioView,
  updatePortfolioViewEngagement,
} from "@/lib/actions/portfolio-websites";

// Section Components
import { HeroSection } from "./sections/hero-section";
import { AboutSection } from "./sections/about-section";
import { GallerySection } from "./sections/gallery-section";
import { ServicesSection } from "./sections/services-section";
import { TestimonialsSection } from "./sections/testimonials-section";
import { ContactSection } from "./sections/contact-section";
import { FaqSection } from "./sections/faq-section";
import { TextSection } from "./sections/text-section";
import { ImageSection } from "./sections/image-section";
import { VideoSection } from "./sections/video-section";
import { SpacerSection } from "./sections/spacer-section";
import { ShareButtons } from "./components/share-buttons";

// ============================================================================
// TYPES
// ============================================================================

interface PortfolioSection {
  id: string;
  sectionType: PortfolioSectionType;
  position: number;
  isVisible: boolean;
  config: Record<string, unknown>;
  customTitle: string | null;
}

interface PortfolioProject {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  assets: {
    originalUrl: string;
    thumbnailUrl: string | null;
  }[];
}

interface Organization {
  name: string;
  publicEmail: string | null;
  publicPhone: string | null;
  website: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
}

export interface PortfolioWebsiteData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  template: PortfolioTemplate;
  fontHeading: string | null;
  fontBody: string | null;
  socialLinks: { platform: string; url: string }[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  showBranding: boolean;
  // New fields
  customCss?: string | null;
  enableAnimations?: boolean;
  allowDownloads?: boolean;
  // Relations
  sections: PortfolioSection[];
  projects: { project: PortfolioProject }[];
  organization: Organization;
}

interface PortfolioRendererProps {
  website: PortfolioWebsiteData;
}

// ============================================================================
// MAIN RENDERER
// ============================================================================

export function PortfolioRenderer({ website }: PortfolioRendererProps) {
  const templateConfig = PORTFOLIO_TEMPLATES[website.template];
  const cssVariables = generateCSSVariables(
    website.template,
    website.primaryColor,
    website.accentColor
  );
  const fontsUrl = getGoogleFontsUrl(website.fontHeading, website.fontBody);

  // Get projects as flat array
  const projects = website.projects.map((item) => item.project);

  // Determine if using sections or fallback to legacy rendering
  const hasSections = website.sections.length > 0;

  // Analytics tracking refs
  const viewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);

  // Track view on mount
  useEffect(() => {
    const trackView = async () => {
      // Generate or get visitor ID from localStorage
      let visitorId = localStorage.getItem("portfolio-visitor-id");
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("portfolio-visitor-id", visitorId);
      }

      // Generate session ID (expires after 30 min of inactivity)
      let sessionId = sessionStorage.getItem("portfolio-session-id");
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem("portfolio-session-id", sessionId);
      }

      const result = await trackPortfolioView(website.slug, {
        visitorId,
        sessionId,
        referrer: document.referrer || undefined,
        userAgent: navigator.userAgent,
      });

      if (result.success && result.viewId) {
        viewIdRef.current = result.viewId;
      }
    };

    trackView();

    // Track scroll depth
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100);
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Update engagement on unmount or visibility change
    const updateEngagement = () => {
      if (viewIdRef.current) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        updatePortfolioViewEngagement(viewIdRef.current, {
          duration,
          scrollDepth: maxScrollRef.current,
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        updateEngagement();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      updateEngagement();
    };
  }, [website.slug]);

  // Animation classes
  const animationEnabled = website.enableAnimations !== false;
  const animationClass = animationEnabled ? "animate-fade-in-up" : "";

  return (
    <>
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href={fontsUrl} rel="stylesheet" />

      {/* Animation Styles */}
      {animationEnabled && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }
          .animate-fade-in-up-delay-1 {
            animation: fadeInUp 0.6s ease-out 0.1s forwards;
            opacity: 0;
          }
          .animate-fade-in-up-delay-2 {
            animation: fadeInUp 0.6s ease-out 0.2s forwards;
            opacity: 0;
          }
          .animate-on-scroll {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease-out, transform 0.6s ease-out;
          }
          .animate-on-scroll.in-view {
            opacity: 1;
            transform: translateY(0);
          }
        `}} />
      )}

      {/* Custom CSS */}
      {website.customCss && (
        <style dangerouslySetInnerHTML={{ __html: website.customCss }} />
      )}

      {/* Portfolio Container */}
      <div
        className="portfolio-page min-h-screen"
        style={{
          ...cssVariables,
          backgroundColor: templateConfig.colors.background,
          color: templateConfig.colors.text,
          fontFamily: `'${website.fontBody || templateConfig.fonts.body}', sans-serif`,
        } as React.CSSProperties}
      >
        {/* Header */}
        <header
          className="border-b"
          style={{
            backgroundColor: templateConfig.colors.card,
            borderColor: templateConfig.colors.cardBorder,
          }}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              {website.logoUrl ? (
                <img
                  src={website.logoUrl}
                  alt={website.organization.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-semibold text-white"
                  style={{
                    backgroundColor:
                      website.primaryColor || templateConfig.colors.primary,
                  }}
                >
                  {website.organization.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p
                  className="text-sm"
                  style={{ color: templateConfig.colors.textMuted }}
                >
                  Portfolio
                </p>
                <p
                  className="font-semibold"
                  style={{
                    fontFamily: `'${website.fontHeading || templateConfig.fonts.heading}', sans-serif`,
                    color: templateConfig.colors.text,
                  }}
                >
                  {website.organization.name}
                </p>
              </div>
            </div>
            <nav className="hidden items-center gap-4 text-sm md:flex">
              {website.organization.publicEmail && (
                <a
                  href={`mailto:${website.organization.publicEmail}`}
                  style={{ color: templateConfig.colors.textMuted }}
                  className="transition-colors hover:opacity-80"
                >
                  {website.organization.publicEmail}
                </a>
              )}
              {website.organization.publicPhone && (
                <a
                  href={`tel:${website.organization.publicPhone}`}
                  style={{ color: templateConfig.colors.textMuted }}
                  className="transition-colors hover:opacity-80"
                >
                  {website.organization.publicPhone}
                </a>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content - Render Sections */}
        <main>
          {hasSections ? (
            website.sections.map((section) => (
              <SectionRenderer
                key={section.id}
                section={section}
                website={website}
                projects={projects}
                templateConfig={templateConfig}
              />
            ))
          ) : (
            // Legacy fallback if no sections
            <LegacyRenderer website={website} projects={projects} templateConfig={templateConfig} />
          )}
        </main>

        {/* Footer */}
        <footer
          className="border-t"
          style={{
            backgroundColor: templateConfig.colors.card,
            borderColor: templateConfig.colors.cardBorder,
          }}
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
            <span
              className="text-sm"
              style={{ color: templateConfig.colors.textMuted }}
            >
              © {new Date().getFullYear()} {website.organization.name}
            </span>
            <div className="flex items-center gap-4 text-sm">
              {website.socialLinks?.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: templateConfig.colors.textMuted }}
                  className="transition-colors hover:opacity-80"
                >
                  {link.platform}
                </a>
              ))}
              {website.showBranding && (
                <span style={{ color: templateConfig.colors.textSecondary }}>
                  Powered by ListingLens
                </span>
              )}
            </div>
          </div>
        </footer>

        {/* Social Share Buttons */}
        <ShareButtons
          url={typeof window !== "undefined" ? window.location.href : `https://example.com/portfolio/${website.slug}`}
          title={website.metaTitle || website.name}
          description={website.metaDescription || website.description || ""}
          imageUrl={website.logoUrl || ""}
          primaryColor={website.primaryColor || templateConfig.colors.primary}
        />
      </div>
    </>
  );
}

// ============================================================================
// SECTION RENDERER
// ============================================================================

interface SectionRendererProps {
  section: PortfolioSection;
  website: PortfolioWebsiteData;
  projects: PortfolioProject[];
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

function SectionRenderer({
  section,
  website,
  projects,
  templateConfig,
}: SectionRendererProps) {
  const config = section.config;

  switch (section.sectionType) {
    case "hero":
      return (
        <HeroSection
          config={config}
          website={website}
          templateConfig={templateConfig}
        />
      );
    case "about":
      return <AboutSection config={config} templateConfig={templateConfig} />;
    case "gallery":
      return (
        <GallerySection
          config={config}
          projects={projects}
          templateConfig={templateConfig}
          allowDownloads={website.allowDownloads}
        />
      );
    case "services":
      return <ServicesSection config={config} templateConfig={templateConfig} />;
    case "testimonials":
      return (
        <TestimonialsSection config={config} templateConfig={templateConfig} />
      );
    case "contact":
      return (
        <ContactSection
          config={config}
          website={website}
          templateConfig={templateConfig}
        />
      );
    case "faq":
      return <FaqSection config={config} templateConfig={templateConfig} />;
    case "text":
      return <TextSection config={config} templateConfig={templateConfig} />;
    case "image":
      return <ImageSection config={config} templateConfig={templateConfig} />;
    case "video":
      return <VideoSection config={config} templateConfig={templateConfig} />;
    case "spacer":
      return <SpacerSection config={config} />;
    case "custom_html":
      // Skip custom_html for security
      return null;
    case "awards":
      // TODO: Implement awards section
      return null;
    default:
      return null;
  }
}

// ============================================================================
// LEGACY FALLBACK RENDERER
// ============================================================================

interface LegacyRendererProps {
  website: PortfolioWebsiteData;
  projects: PortfolioProject[];
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

function LegacyRenderer({ website, projects, templateConfig }: LegacyRendererProps) {
  const heroTitle = website.heroTitle || website.name;
  const heroSubtitle = website.heroSubtitle || website.description;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Hero */}
      <section className="mb-12">
        <h1
          className="text-4xl font-bold md:text-5xl"
          style={{
            fontFamily: `'${website.fontHeading || templateConfig.fonts.heading}', sans-serif`,
            color: templateConfig.colors.text,
          }}
        >
          {heroTitle}
        </h1>
        {heroSubtitle && (
          <p
            className="mt-4 text-lg"
            style={{ color: templateConfig.colors.textMuted }}
          >
            {heroSubtitle}
          </p>
        )}
      </section>

      {/* Gallery */}
      <section>
        <h2
          className="text-2xl font-semibold"
          style={{
            fontFamily: `'${website.fontHeading || templateConfig.fonts.heading}', sans-serif`,
            color: templateConfig.colors.text,
          }}
        >
          Portfolio
        </h2>
        {projects.length === 0 ? (
          <div
            className="mt-6 rounded-xl border border-dashed py-12 text-center"
            style={{
              backgroundColor: templateConfig.colors.card,
              borderColor: templateConfig.colors.cardBorder,
              color: templateConfig.colors.textMuted,
            }}
          >
            This portfolio is still being curated.
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const asset = project.assets[0];
              const imageUrl =
                project.coverImageUrl ||
                asset?.thumbnailUrl ||
                asset?.originalUrl;

              return (
                <div
                  key={project.id}
                  className="overflow-hidden rounded-2xl border transition-transform hover:-translate-y-1"
                  style={{
                    backgroundColor: templateConfig.colors.card,
                    borderColor: templateConfig.colors.cardBorder,
                  }}
                >
                  <div
                    className="aspect-[4/3] w-full"
                    style={{
                      backgroundColor: templateConfig.colors.backgroundSecondary,
                    }}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={project.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center text-sm"
                        style={{ color: templateConfig.colors.textMuted }}
                      >
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3
                      className="text-lg font-semibold"
                      style={{ color: templateConfig.colors.text }}
                    >
                      {project.name}
                    </h3>
                    {project.description && (
                      <p
                        className="mt-2 line-clamp-2 text-sm"
                        style={{ color: templateConfig.colors.textMuted }}
                      >
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
