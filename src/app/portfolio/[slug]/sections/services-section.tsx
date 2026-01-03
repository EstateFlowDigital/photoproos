"use client";

import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";

interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  price?: string | null;
  icon?: string | null;
}

interface ServicesSectionProps {
  config: Record<string, unknown>;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

export function ServicesSection({ config, templateConfig }: ServicesSectionProps) {
  const title = (config.title as string) || "Services";
  const items = (config.items as ServiceItem[]) || [];
  const showPricing = config.showPricing === true;

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="py-16"
      style={{ backgroundColor: templateConfig.colors.backgroundSecondary }}
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
              className="p-6"
              style={{
                backgroundColor: templateConfig.colors.card,
                borderRadius: templateConfig.borderRadius,
                border: `1px solid ${templateConfig.colors.cardBorder}`,
              }}
            >
              <h3
                className="text-lg font-semibold"
                style={{ color: templateConfig.colors.text }}
              >
                {item.name}
              </h3>
              {item.description && (
                <p
                  className="mt-2 text-sm"
                  style={{ color: templateConfig.colors.textMuted }}
                >
                  {item.description}
                </p>
              )}
              {showPricing && item.price && (
                <p
                  className="mt-4 text-xl font-bold"
                  style={{ color: templateConfig.colors.primary }}
                >
                  {item.price}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
