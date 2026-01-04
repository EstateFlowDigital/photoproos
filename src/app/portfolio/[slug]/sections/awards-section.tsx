"use client";

import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";

interface AwardItem {
  id: string;
  title: string;
  organization?: string;
  year?: string;
  description?: string;
  imageUrl?: string | null;
}

interface AwardsSectionProps {
  config: Record<string, unknown>;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

export function AwardsSection({
  config,
  templateConfig,
}: AwardsSectionProps) {
  const title = (config.title as string) || "Awards & Recognition";
  const subtitle = config.subtitle as string | undefined;
  const items = (config.items as AwardItem[]) || [];
  const layout = (config.layout as string) || "grid"; // grid, list, or carousel

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="py-16"
      style={{ backgroundColor: templateConfig.colors.background }}
    >
      <div className="mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2
            className="text-3xl font-bold"
            style={{
              fontFamily: `'${templateConfig.fonts.heading}', sans-serif`,
              color: templateConfig.colors.text,
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="mt-4 text-lg"
              style={{ color: templateConfig.colors.textMuted }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Awards Grid */}
        {layout === "grid" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <AwardCard key={item.id} item={item} templateConfig={templateConfig} />
            ))}
          </div>
        )}

        {/* Awards List */}
        {layout === "list" && (
          <div className="space-y-4">
            {items.map((item) => (
              <AwardListItem key={item.id} item={item} templateConfig={templateConfig} />
            ))}
          </div>
        )}

        {/* Awards Carousel (simplified horizontal scroll) */}
        {layout === "carousel" && (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {items.map((item) => (
              <div key={item.id} className="w-72 flex-shrink-0">
                <AwardCard item={item} templateConfig={templateConfig} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AwardCard({
  item,
  templateConfig,
}: {
  item: AwardItem;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}) {
  return (
    <div
      className="flex flex-col items-center p-6 text-center"
      style={{
        backgroundColor: templateConfig.colors.card,
        borderRadius: templateConfig.borderRadius,
        border: `1px solid ${templateConfig.colors.cardBorder}`,
      }}
    >
      {/* Award Icon or Image */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-16 w-16 object-contain"
        />
      ) : (
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${templateConfig.colors.primary}20` }}
        >
          <TrophyIcon color={templateConfig.colors.primary} />
        </div>
      )}

      {/* Award Title */}
      <h3
        className="mt-4 text-lg font-semibold"
        style={{ color: templateConfig.colors.text }}
      >
        {item.title}
      </h3>

      {/* Organization & Year */}
      {(item.organization || item.year) && (
        <p
          className="mt-1 text-sm"
          style={{ color: templateConfig.colors.textSecondary }}
        >
          {item.organization}
          {item.organization && item.year && " · "}
          {item.year}
        </p>
      )}

      {/* Description */}
      {item.description && (
        <p
          className="mt-3 text-sm"
          style={{ color: templateConfig.colors.textMuted }}
        >
          {item.description}
        </p>
      )}
    </div>
  );
}

function AwardListItem({
  item,
  templateConfig,
}: {
  item: AwardItem;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}) {
  return (
    <div
      className="flex items-center gap-4 p-4"
      style={{
        backgroundColor: templateConfig.colors.card,
        borderRadius: templateConfig.borderRadius,
        border: `1px solid ${templateConfig.colors.cardBorder}`,
      }}
    >
      {/* Award Icon or Image */}
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="h-12 w-12 object-contain"
        />
      ) : (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${templateConfig.colors.primary}20` }}
        >
          <TrophyIcon color={templateConfig.colors.primary} className="h-5 w-5" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold"
          style={{ color: templateConfig.colors.text }}
        >
          {item.title}
        </h3>
        {(item.organization || item.year) && (
          <p
            className="text-sm"
            style={{ color: templateConfig.colors.textSecondary }}
          >
            {item.organization}
            {item.organization && item.year && " · "}
            {item.year}
          </p>
        )}
      </div>

      {/* Year Badge (on the right for list view) */}
      {item.year && (
        <span
          className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: `${templateConfig.colors.primary}15`,
            color: templateConfig.colors.primary,
          }}
        >
          {item.year}
        </span>
      )}
    </div>
  );
}

function TrophyIcon({ color, className = "h-7 w-7" }: { color: string; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={color}
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a.75.75 0 0 0 0 1.5h12.17a.75.75 0 0 0 0-1.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.707 6.707 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
