"use client";

import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";

interface TestimonialItem {
  id: string;
  quote: string;
  clientName: string;
  clientTitle?: string;
  photoUrl?: string | null;
}

interface TestimonialsSectionProps {
  config: Record<string, unknown>;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

export function TestimonialsSection({
  config,
  templateConfig,
}: TestimonialsSectionProps) {
  const title = (config.title as string) || "What Clients Say";
  const items = (config.items as TestimonialItem[]) || [];
  const layout = (config.layout as string) || "cards";

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="py-16"
      style={{ backgroundColor: templateConfig.colors.background }}
    >
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className="text-center text-3xl font-bold"
          style={{
            fontFamily: `'${templateConfig.fonts.heading}', sans-serif`,
            color: templateConfig.colors.text,
          }}
        >
          {title}
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col p-6"
              style={{
                backgroundColor: templateConfig.colors.card,
                borderRadius: templateConfig.borderRadius,
                border: `1px solid ${templateConfig.colors.cardBorder}`,
              }}
            >
              {/* Quote */}
              <blockquote
                className="flex-1 text-lg italic"
                style={{ color: templateConfig.colors.textMuted }}
              >
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                {item.photoUrl ? (
                  <img
                    src={item.photoUrl}
                    alt={item.clientName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{
                      backgroundColor: templateConfig.colors.primary,
                    }}
                  >
                    {item.clientName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: templateConfig.colors.text }}
                  >
                    {item.clientName}
                  </p>
                  {item.clientTitle && (
                    <p
                      className="text-sm"
                      style={{ color: templateConfig.colors.textSecondary }}
                    >
                      {item.clientTitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
