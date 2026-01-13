"use client";

import { DollarSign, Image, Shield } from "lucide-react";
import type { MetricsContent } from "@/lib/landing-content";

interface MetricsVariantProps {
  content: MetricsContent;
}

const iconMap = {
  dollar: DollarSign,
  gallery: Image,
  shield: Shield,
};

const colorMap = {
  blue: "text-[var(--primary)]",
  purple: "text-[var(--ai)]",
  green: "text-[var(--success)]",
};

export function MetricsVariant({ content }: MetricsVariantProps) {
  return (
    <section className="py-16 bg-[var(--background-tertiary)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-medium uppercase tracking-wider text-foreground-muted mb-8">
          {content.tagline}
        </p>

        {/* Main Stat */}
        <div className="text-center mb-12">
          <p className="text-5xl font-bold text-foreground sm:text-6xl">
            {content.mainStat.value}{content.mainStat.suffix}
          </p>
          <p className="mt-2 text-lg text-foreground-muted">
            {content.mainStat.label}
          </p>
        </div>

        {/* Supporting Stats */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {content.supportingStats.map((stat, index) => {
            const Icon = iconMap[stat.icon];
            return (
              <div key={index} className="text-center">
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${colorMap[stat.color]} bg-current/10`}>
                  <Icon className={`h-6 w-6 ${colorMap[stat.color]}`} />
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
