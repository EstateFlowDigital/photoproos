"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  type Template,
  type TemplateCategory,
} from "@/lib/marketing-studio/templates";
import {
  ArrowLeft,
  Search,
  X,
  Image as ImageIcon,
  Quote,
  Columns,
  Megaphone,
  Camera,
  Tag,
  Lightbulb,
  Trophy,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  ArrowRight,
} from "lucide-react";

// Custom icons for platforms not in lucide
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.95s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.52.77 1.52 1.68 0 1.02-.65 2.55-.99 3.97-.28 1.19.6 2.16 1.78 2.16 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5-4.88-3.41 0-5.41 2.55-5.41 5.2 0 1.02.39 2.13.89 2.73a.35.35 0 0 1 .08.34l-.33 1.35c-.05.22-.18.27-.41.16-1.53-.72-2.49-2.96-2.49-4.77 0-3.88 2.82-7.45 8.14-7.45 4.28 0 7.6 3.05 7.6 7.12 0 4.25-2.68 7.67-6.4 7.67-1.25 0-2.42-.65-2.82-1.42l-.77 2.93c-.28 1.07-1.03 2.42-1.54 3.24A12 12 0 1 0 12 0z" />
    </svg>
  );
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  quote: Quote,
  split: Columns,
  megaphone: Megaphone,
  camera: Camera,
  tag: Tag,
  lightbulb: Lightbulb,
  trophy: Trophy,
};

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
};

export function TemplateLibrary() {
  const [selectedCategory, setSelectedCategory] = React.useState<TemplateCategory | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter templates
  const filteredTemplates = React.useMemo(() => {
    let templates = TEMPLATES;

    if (selectedCategory) {
      templates = templates.filter((t) => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.includes(query))
      );
    }

    return templates;
  }, [selectedCategory, searchQuery]);

  // Group templates by category for display
  const groupedTemplates = React.useMemo(() => {
    if (selectedCategory || searchQuery) {
      return { filtered: filteredTemplates };
    }

    const groups: Record<string, Template[]> = {};
    TEMPLATE_CATEGORIES.forEach((cat) => {
      groups[cat.id] = TEMPLATES.filter((t) => t.category === cat.id);
    });
    return groups;
  }, [filteredTemplates, selectedCategory, searchQuery]);

  return (
    <div className="template-library min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/super-admin/marketing-studio"
                className="flex items-center gap-1 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-[var(--card-border)]" />
              <h1 className="text-lg font-semibold text-[var(--foreground)]">
                Template Library
              </h1>
            </div>

            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-9 pr-8 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                selectedCategory === null
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
              )}
            >
              All Templates
              <span className="opacity-60">({TEMPLATES.length})</span>
            </button>
            {TEMPLATE_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category.icon] || ImageIcon;
              const count = TEMPLATES.filter((t) => t.category === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                    selectedCategory === category.id
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {selectedCategory || searchQuery ? (
          // Flat grid when filtering
          <div>
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ImageIcon className="h-12 w-12 text-[var(--foreground-muted)] mb-4" />
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                  No templates found
                </h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Try adjusting your search or filter
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Grouped by category
          <div className="space-y-10">
            {TEMPLATE_CATEGORIES.map((category) => {
              const templates = groupedTemplates[category.id] || [];
              if (templates.length === 0) return null;
              const Icon = CATEGORY_ICONS[category.icon] || ImageIcon;

              return (
                <section key={category.id}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-[var(--primary)]" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-[var(--foreground)]">
                          {category.name}
                        </h2>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline"
                    >
                      View all
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {templates.slice(0, 5).map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ template }: { template: Template }) {
  // Generate a gradient background based on the template layout
  const bgStyle: React.CSSProperties = {};
  if (template.layout.background === "gradient") {
    bgStyle.background = `linear-gradient(${template.layout.gradientAngle}deg, ${template.layout.gradientFrom}, ${template.layout.gradientTo})`;
  } else if (template.layout.background === "solid") {
    bgStyle.backgroundColor = template.layout.backgroundColor || "#1a1a1a";
  } else {
    bgStyle.backgroundColor = "#1a1a1a";
  }

  return (
    <Link
      href={`/super-admin/marketing-studio/composer?template=${template.id}`}
      className="group block"
    >
      <div
        className="aspect-square rounded-xl border border-[var(--card-border)] overflow-hidden relative transition-all group-hover:border-[var(--primary)] group-hover:shadow-lg"
        style={bgStyle}
      >
        {/* Template preview placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-4">
            <p className="text-white/80 text-xs font-medium">{template.name}</p>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-medium">
            Use Template
          </span>
        </div>

        {/* Format badge */}
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-medium capitalize">
          {template.format}
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
          {template.name}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          {template.platforms.slice(0, 3).map((platform) => {
            const Icon = PLATFORM_ICONS[platform] || ImageIcon;
            return (
              <Icon
                key={platform}
                className="h-3 w-3 text-[var(--foreground-muted)]"
              />
            );
          })}
          {template.platforms.length > 3 && (
            <span className="text-[10px] text-[var(--foreground-muted)]">
              +{template.platforms.length - 3}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
