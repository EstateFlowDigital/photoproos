"use client";

import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";

interface AboutSectionProps {
  config: Record<string, unknown>;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

export function AboutSection({ config, templateConfig }: AboutSectionProps) {
  const photoUrl = config.photoUrl as string | null;
  const title = (config.title as string) || "About Me";
  const content = (config.content as string) || "";
  const highlights = (config.highlights as string[]) || [];

  if (!content && highlights.length === 0) {
    return null;
  }

  return (
    <section
      className="py-16"
      style={{ backgroundColor: templateConfig.colors.background }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Photo */}
          {photoUrl && (
            <div className="flex items-center justify-center">
              <img
                src={photoUrl}
                alt={title}
                className="rounded-2xl object-cover"
                style={{
                  maxHeight: "500px",
                  borderRadius: templateConfig.borderRadius,
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className={photoUrl ? "" : "md:col-span-2 mx-auto max-w-2xl"}>
            <h2
              className="text-3xl font-bold"
              style={{
                fontFamily: `'${templateConfig.fonts.heading}', sans-serif`,
                color: templateConfig.colors.text,
              }}
            >
              {title}
            </h2>
            {content && (
              <p
                className="mt-6 text-lg leading-relaxed"
                style={{ color: templateConfig.colors.textMuted }}
              >
                {content}
              </p>
            )}
            {highlights.length > 0 && (
              <ul className="mt-8 space-y-3">
                {highlights.map((highlight, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3"
                    style={{ color: templateConfig.colors.textMuted }}
                  >
                    <span
                      className="mt-2 h-2 w-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: templateConfig.colors.primary,
                      }}
                    />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
