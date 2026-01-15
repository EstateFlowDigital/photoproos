"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  PenSquare,
  Calendar,
  Palette,
  LayoutTemplate,
  ImageIcon,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  ArrowRight,
  Sparkles,
  Clock,
  Target,
} from "lucide-react";
import { PLATFORM_LIST } from "@/lib/marketing-studio/platforms";

const QUICK_ACTIONS = [
  {
    id: "new-post",
    title: "Create New Post",
    description: "Design a social media post with mockups and captions",
    icon: PenSquare,
    href: "/super-admin/marketing-studio/composer",
    color: "var(--primary)",
    primary: true,
  },
  {
    id: "from-mockup",
    title: "Quick from Mockup",
    description: "Start with a mockup from the library",
    icon: ImageIcon,
    href: "/super-admin/marketing-studio/composer?source=mockup",
    color: "var(--success)",
  },
  {
    id: "templates",
    title: "Browse Templates",
    description: "Start with a pre-designed template",
    icon: LayoutTemplate,
    href: "/super-admin/marketing-studio/templates",
    color: "var(--ai)",
  },
];

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
};

const FEATURES = [
  {
    icon: Target,
    title: "Platform-Accurate Previews",
    description: "See exactly how your post will look on each platform before you publish",
  },
  {
    icon: Sparkles,
    title: "Mockup Integration",
    description: "Use your PhotoProOS mockups directly in your social media content",
  },
  {
    icon: Clock,
    title: "Quick Export",
    description: "Download platform-optimized images ready for posting",
  },
];

export function MarketingStudioHub() {
  return (
    <div className="marketing-studio-hub space-y-8">
      {/* Quick Actions */}
      <section data-element="quick-actions">
        <h2 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                "group relative flex flex-col rounded-xl border p-6 transition-all duration-200",
                action.primary
                  ? "border-[var(--primary)]/30 bg-[var(--primary)]/5 hover:border-[var(--primary)] hover:bg-[var(--primary)]/10"
                  : "border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--border-hover)] hover:shadow-lg"
              )}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <action.icon className="h-6 w-6" style={{ color: action.color }} />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-[var(--foreground-muted)] flex-1">
                {action.description}
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                Get started <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Supported Platforms */}
      <section data-element="platforms">
        <h2 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-4">
          Supported Platforms
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PLATFORM_LIST.map((platform) => {
            const Icon = PLATFORM_ICONS[platform.id] || ImageIcon;
            return (
              <div
                key={platform.id}
                className="flex flex-col items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 hover:border-[var(--border-hover)] transition-colors"
              >
                <div
                  className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${platform.color}15` }}
                >
                  <Icon className="h-5 w-5" style={{ color: platform.color }} />
                </div>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {platform.name}
                </span>
                <span className="text-xs text-[var(--foreground-muted)]">
                  {platform.formats.length} format{platform.formats.length !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section data-element="features">
        <h2 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-4">
          What You Can Do
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                <feature.icon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Navigation Links */}
      <section data-element="navigation" className="pt-4 border-t border-[var(--card-border)]">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/super-admin/mockups"
            className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ImageIcon className="h-4 w-4" />
            <span>Mockup Library</span>
          </Link>
          <Link
            href="/super-admin/marketing-studio/brand-kit"
            className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <Palette className="h-4 w-4" />
            <span>Brand Kit</span>
          </Link>
          <Link
            href="/super-admin/marketing-studio/calendar"
            className="flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <Calendar className="h-4 w-4" />
            <span>Content Calendar</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
