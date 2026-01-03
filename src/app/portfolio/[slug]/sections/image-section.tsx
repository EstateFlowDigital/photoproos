"use client";

import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";

interface ImageSectionProps {
  config: Record<string, unknown>;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

export function ImageSection({ config, templateConfig }: ImageSectionProps) {
  const url = config.url as string | null;
  const alt = (config.alt as string) || "";
  const caption = (config.caption as string) || "";
  const layout = (config.layout as string) || "contained";

  if (!url) {
    return null;
  }

  const layoutClass = {
    full: "max-w-none px-0",
    contained: "max-w-4xl px-6 mx-auto",
    "float-left": "max-w-2xl px-6 mx-auto",
    "float-right": "max-w-2xl px-6 mx-auto",
  }[layout] || "max-w-4xl px-6 mx-auto";

  return (
    <section
      className="py-8"
      style={{ backgroundColor: templateConfig.colors.background }}
    >
      <figure className={layoutClass}>
        <img
          src={url}
          alt={alt}
          className="w-full"
          style={{
            borderRadius: layout === "full" ? "0" : templateConfig.borderRadius,
          }}
        />
        {caption && (
          <figcaption
            className="mt-3 text-center text-sm"
            style={{ color: templateConfig.colors.textMuted }}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  );
}
