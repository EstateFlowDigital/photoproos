"use client";

import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";
import type { PortfolioWebsiteData } from "../portfolio-renderer";

interface HeroSectionProps {
  config: Record<string, unknown>;
  website: PortfolioWebsiteData;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

export function HeroSection({ config, website, templateConfig }: HeroSectionProps) {
  const title = (config.title as string) || website.heroTitle || website.name;
  const subtitle = (config.subtitle as string) || website.heroSubtitle || "";
  const backgroundImageUrl = config.backgroundImageUrl as string | null;
  const backgroundVideoUrl = config.backgroundVideoUrl as string | null;
  const ctaText = (config.ctaText as string) || "Get in Touch";
  const ctaLink = (config.ctaLink as string) || "#contact";
  const overlay = (config.overlay as string) || "dark";
  const alignment = (config.alignment as string) || "center";

  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  }[alignment] || "text-center items-center";

  const overlayStyles = {
    none: "",
    light: "bg-white/30",
    dark: "bg-black/50",
    gradient: "bg-gradient-to-b from-black/60 via-transparent to-black/60",
  }[overlay] || "bg-black/50";

  const hasBackground = backgroundImageUrl || backgroundVideoUrl;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundColor: hasBackground
          ? undefined
          : templateConfig.colors.backgroundSecondary,
        minHeight: hasBackground ? "80vh" : undefined,
      }}
    >
      {/* Background Image */}
      {backgroundImageUrl && !backgroundVideoUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      )}

      {/* Background Video */}
      {backgroundVideoUrl && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={backgroundVideoUrl} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      {hasBackground && overlay !== "none" && (
        <div className={`absolute inset-0 ${overlayStyles}`} />
      )}

      {/* Content */}
      <div
        className={`relative mx-auto flex max-w-5xl flex-col px-6 ${alignmentClasses}`}
        style={{
          paddingTop: hasBackground ? "12rem" : "4rem",
          paddingBottom: hasBackground ? "12rem" : "4rem",
        }}
      >
        <h1
          className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
          style={{
            fontFamily: `'${website.fontHeading || templateConfig.fonts.heading}', sans-serif`,
            color: hasBackground ? "#ffffff" : templateConfig.colors.text,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-6 max-w-2xl text-lg md:text-xl"
            style={{
              color: hasBackground
                ? "rgba(255,255,255,0.85)"
                : templateConfig.colors.textMuted,
            }}
          >
            {subtitle}
          </p>
        )}
        {ctaText && (
          <a
            href={ctaLink}
            className="mt-8 inline-flex rounded-full px-8 py-3 text-sm font-semibold transition-transform hover:scale-105"
            style={{
              backgroundColor:
                website.primaryColor || templateConfig.colors.primary,
              color: "#ffffff",
            }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
