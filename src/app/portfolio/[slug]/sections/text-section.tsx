"use client";

import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";

interface TextSectionProps {
  config: Record<string, unknown>;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

export function TextSection({ config, templateConfig }: TextSectionProps) {
  const content = (config.content as string) || "";
  const alignment = (config.alignment as string) || "left";

  if (!content) {
    return null;
  }

  const alignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[alignment] || "text-left";

  return (
    <section
      className="py-12"
      style={{ backgroundColor: templateConfig.colors.background }}
    >
      <div className={`mx-auto max-w-3xl px-6 ${alignmentClass}`}>
        <div
          className="prose prose-lg max-w-none"
          style={{
            color: templateConfig.colors.textMuted,
            lineHeight: 1.8,
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
}
