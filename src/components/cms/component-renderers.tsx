"use client";

import { cn } from "@/lib/utils";
import type { PageComponentInstance } from "@/lib/cms/page-builder-utils";
import {
  Check,
  Star,
  ChevronDown,
  Play,
  ExternalLink,
  Quote,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

// ============================================================================
// TYPES
// ============================================================================

interface ComponentRendererProps {
  instance: PageComponentInstance;
  className?: string;
}

type ContentRecord = Record<string, unknown>;

// ============================================================================
// HERO SECTION
// ============================================================================

export function HeroRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;

  return (
    <section
      className={cn(
        "hero-section py-20 px-6",
        content.alignment === "center" && "text-center",
        content.alignment === "right" && "text-right",
        className
      )}
      style={
        content.backgroundImage
          ? {
              backgroundImage: `url(${content.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
          {content.headline as string}
        </h1>
        {content.subheadline && (
          <p className="text-xl text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            {content.subheadline as string}
          </p>
        )}
        <div className="flex items-center gap-4 justify-center">
          {content.ctaText && (
            <a
              href={content.ctaLink as string}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              {content.ctaText as string}
              <ArrowRight className="w-4 h-4" />
            </a>
          )}
          {content.secondaryCtaText && (
            <a
              href={content.secondaryCtaLink as string}
              className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border)] rounded-lg font-medium hover:bg-[var(--background-hover)] transition-colors"
            >
              {content.secondaryCtaText as string}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES GRID
// ============================================================================

interface Feature {
  icon?: string;
  title: string;
  description?: string;
  link?: string;
}

export function FeaturesGridRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const features = (content.features as Feature[]) || [];
  const columns = content.columns as string || "3";

  return (
    <section className={cn("features-grid py-16 px-6", className)}>
      <div className="max-w-6xl mx-auto">
        {(content.title || content.subtitle) && (
          <div className="text-center mb-12">
            {content.title && (
              <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            )}
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}
        <div
          className={cn(
            "grid gap-6",
            columns === "2" && "grid-cols-1 md:grid-cols-2",
            columns === "3" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            columns === "4" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl"
            >
              {feature.icon && (
                <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                  <Check className="w-6 h-6 text-[var(--primary)]" />
                </div>
              )}
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              {feature.description && (
                <p className="text-[var(--foreground-secondary)]">
                  {feature.description}
                </p>
              )}
              {feature.link && (
                <a
                  href={feature.link}
                  className="inline-flex items-center gap-1 mt-4 text-[var(--primary)] hover:underline"
                >
                  Learn more
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS
// ============================================================================

interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

export function TestimonialsRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const testimonials = (content.testimonials as Testimonial[]) || [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (testimonials.length === 0) return null;

  return (
    <section className={cn("testimonials py-16 px-6 bg-[var(--background-tertiary)]", className)}>
      <div className="max-w-4xl mx-auto">
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <div className="space-y-8">
          {/* Main testimonial */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-8">
            <Quote className="w-10 h-10 text-[var(--primary)] mb-4" />
            <blockquote className="text-xl mb-6">
              {testimonials[activeIndex].quote}
            </blockquote>
            <div className="flex items-center gap-4">
              {testimonials[activeIndex].avatar && (
                <img
                  src={testimonials[activeIndex].avatar}
                  alt={testimonials[activeIndex].author}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-semibold">{testimonials[activeIndex].author}</p>
                {(testimonials[activeIndex].role || testimonials[activeIndex].company) && (
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    {testimonials[activeIndex].role}
                    {testimonials[activeIndex].role && testimonials[activeIndex].company && " at "}
                    {testimonials[activeIndex].company}
                  </p>
                )}
              </div>
              {testimonials[activeIndex].rating && (
                <div className="ml-auto flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < (testimonials[activeIndex].rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation dots */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "w-3 h-3 rounded-full transition-colors",
                    index === activeIndex
                      ? "bg-[var(--primary)]"
                      : "bg-[var(--border)] hover:bg-[var(--border-hover)]"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ ACCORDION
// ============================================================================

interface FAQ {
  question: string;
  answer: string;
}

export function FAQAccordionRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const faqs = (content.faqs as FAQ[]) || [];
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={cn("faq-section py-16 px-6", className)}>
      <div className="max-w-3xl mx-auto">
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-[var(--border)] rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left bg-[var(--card)] hover:bg-[var(--background-hover)] transition-colors"
              >
                <span className="font-medium">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 transition-transform",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              {openIndex === index && (
                <div className="p-4 bg-[var(--background-tertiary)]">
                  <div
                    className="prose prose-invert max-w-none text-[var(--foreground-secondary)]"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CTA SECTION
// ============================================================================

export function CTASectionRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const style = content.style as string || "default";

  return (
    <section
      className={cn(
        "cta-section py-16 px-6",
        style === "gradient" && "bg-gradient-to-r from-[var(--primary)] to-purple-600",
        style === "bordered" && "border-y border-[var(--border)]",
        className
      )}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">{content.headline as string}</h2>
        {content.description && (
          <p className="text-lg text-[var(--foreground-secondary)] mb-8">
            {content.description as string}
          </p>
        )}
        <div className="flex items-center gap-4 justify-center">
          {content.primaryCtaText && (
            <a
              href={content.primaryCtaLink as string}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90",
                style === "gradient"
                  ? "bg-white text-gray-900"
                  : "bg-[var(--primary)] text-white"
              )}
            >
              {content.primaryCtaText as string}
            </a>
          )}
          {content.secondaryCtaText && (
            <a
              href={content.secondaryCtaLink as string}
              className={cn(
                "inline-flex items-center gap-2 px-6 py-3 border rounded-lg font-medium transition-colors",
                style === "gradient"
                  ? "border-white/50 text-white hover:bg-white/10"
                  : "border-[var(--border)] hover:bg-[var(--background-hover)]"
              )}
            >
              {content.secondaryCtaText as string}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// STATS METRICS
// ============================================================================

interface Stat {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

export function StatsMetricsRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const stats = (content.stats as Stat[]) || [];

  return (
    <section className={cn("stats-section py-16 px-6 bg-[var(--background-tertiary)]", className)}>
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-[var(--primary)]">
                {stat.prefix}
                {stat.value}
                {stat.suffix}
              </p>
              <p className="mt-2 text-[var(--foreground-secondary)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TEXT BLOCK
// ============================================================================

export function TextBlockRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const maxWidth = content.maxWidth as string || "lg";
  const alignment = content.alignment as string || "left";

  const maxWidthClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    full: "max-w-none",
  };

  return (
    <section className={cn("text-block py-12 px-6", className)}>
      <div
        className={cn(
          "mx-auto prose prose-invert",
          maxWidthClasses[maxWidth as keyof typeof maxWidthClasses] || "max-w-screen-lg",
          alignment === "center" && "text-center"
        )}
        dangerouslySetInnerHTML={{ __html: content.content as string || "" }}
      />
    </section>
  );
}

// ============================================================================
// VIDEO EMBED
// ============================================================================

export function VideoEmbedRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const [isPlaying, setIsPlaying] = useState(false);
  const aspectRatio = content.aspectRatio as string || "16/9";

  const getEmbedUrl = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
    );
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    return url;
  };

  return (
    <section className={cn("video-section py-16 px-6", className)}>
      <div className="max-w-4xl mx-auto">
        {content.title && (
          <h2 className="text-3xl font-bold mb-8 text-center">{content.title as string}</h2>
        )}

        <div
          className="relative bg-[var(--card)] rounded-xl overflow-hidden"
          style={{ aspectRatio }}
        >
          {isPlaying ? (
            <iframe
              src={getEmbedUrl(content.videoUrl as string)}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/40 transition-colors"
              style={
                content.thumbnail
                  ? {
                      backgroundImage: `url(${content.thumbnail})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// LOGO CLOUD
// ============================================================================

interface Logo {
  name: string;
  image: string;
  link?: string;
}

export function LogoCloudRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const logos = (content.logos as Logo[]) || [];
  const style = content.style as string || "row";

  return (
    <section className={cn("logo-cloud py-12 px-6", className)}>
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <p className="text-center text-sm text-[var(--foreground-muted)] mb-8">
            {content.title as string}
          </p>
        )}

        <div
          className={cn(
            "flex items-center justify-center gap-8",
            style === "grid" && "flex-wrap",
            style === "scrolling" && "overflow-x-auto"
          )}
        >
          {logos.map((logo, index) => (
            <div
              key={index}
              className="flex items-center justify-center h-12 opacity-50 hover:opacity-100 transition-opacity"
            >
              {logo.link ? (
                <a href={logo.link} target="_blank" rel="noopener noreferrer">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="max-h-full w-auto"
                  />
                </a>
              ) : (
                <img
                  src={logo.image}
                  alt={logo.name}
                  className="max-h-full w-auto"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CARDS GRID
// ============================================================================

interface Card {
  icon?: string;
  image?: string;
  title: string;
  description?: string;
  link?: string;
  linkText?: string;
}

export function CardsGridRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const cards = (content.cards as Card[]) || [];
  const columns = content.columns as string || "3";

  return (
    <section className={cn("cards-grid py-16 px-6", className)}>
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <div
          className={cn(
            "grid gap-6",
            columns === "2" && "grid-cols-1 md:grid-cols-2",
            columns === "3" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            columns === "4" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden"
            >
              {card.image && (
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                {card.description && (
                  <p className="text-[var(--foreground-secondary)] mb-4">
                    {card.description}
                  </p>
                )}
                {card.link && (
                  <a
                    href={card.link}
                    className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                  >
                    {card.linkText || "Learn more"}
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PRICING TABLE
// ============================================================================

interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaText?: string;
  ctaLink?: string;
  popular?: boolean;
}

export function PricingTableRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const tiers = (content.tiers as PricingTier[]) || [];

  return (
    <section className={cn("pricing-section py-16 px-6", className)}>
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <div className={cn(
          "grid gap-6",
          tiers.length === 2 && "md:grid-cols-2 max-w-4xl mx-auto",
          tiers.length >= 3 && "md:grid-cols-2 lg:grid-cols-3"
        )}>
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={cn(
                "relative bg-[var(--card)] border rounded-xl p-6",
                tier.popular
                  ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                  : "border-[var(--border)]"
              )}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--primary)] text-white text-xs font-medium rounded-full">
                  Most Popular
                </span>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                {tier.description && (
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    {tier.description}
                  </p>
                )}
                <div className="mt-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.period && (
                    <span className="text-[var(--foreground-secondary)]">/{tier.period}</span>
                  )}
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.ctaText && (
                <a
                  href={tier.ctaLink || "#"}
                  className={cn(
                    "block w-full py-3 rounded-lg text-center font-medium transition-colors",
                    tier.popular
                      ? "bg-[var(--primary)] text-white hover:opacity-90"
                      : "border border-[var(--border)] hover:bg-[var(--background-hover)]"
                  )}
                >
                  {tier.ctaText}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// COMPARISON TABLE
// ============================================================================

interface ComparisonRow {
  feature: string;
  values: (string | boolean)[];
}

export function ComparisonTableRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const columns = (content.columns as string[]) || [];
  const rows = (content.rows as ComparisonRow[]) || [];

  return (
    <section className={cn("comparison-section py-16 px-6", className)}>
      <div className="max-w-5xl mx-auto">
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-4 px-4 text-left font-medium text-[var(--foreground-secondary)]">
                  Feature
                </th>
                {columns.map((col, index) => (
                  <th key={index} className="py-4 px-4 text-center font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-[var(--border)] hover:bg-[var(--background-hover)]"
                >
                  <td className="py-4 px-4">{row.feature}</td>
                  {row.values.map((value, colIndex) => (
                    <td key={colIndex} className="py-4 px-4 text-center">
                      {typeof value === "boolean" ? (
                        value ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-[var(--foreground-muted)]">—</span>
                        )
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TIMELINE
// ============================================================================

interface TimelineEvent {
  date: string;
  title: string;
  description?: string;
  icon?: string;
}

export function TimelineRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const events = (content.events as TimelineEvent[]) || [];
  const style = content.style as string || "vertical";

  return (
    <section className={cn("timeline-section py-16 px-6", className)}>
      <div className="max-w-4xl mx-auto">
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <div className={cn(
          style === "horizontal" ? "flex overflow-x-auto gap-8" : "relative space-y-8"
        )}>
          {style !== "horizontal" && (
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[var(--border)]" />
          )}
          {events.map((event, index) => (
            <div
              key={index}
              className={cn(
                style === "horizontal"
                  ? "flex-shrink-0 w-64"
                  : "relative pl-12"
              )}
            >
              {style !== "horizontal" && (
                <div className="absolute left-0 w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{index + 1}</span>
                </div>
              )}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4">
                <span className="text-xs text-[var(--primary)] font-medium">{event.date}</span>
                <h3 className="text-lg font-semibold mt-1">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-[var(--foreground-secondary)] mt-2">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TEAM GRID
// ============================================================================

interface TeamMember {
  name: string;
  role?: string;
  image?: string;
  bio?: string;
  social?: { platform: string; url: string }[];
}

export function TeamGridRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const members = (content.members as TeamMember[]) || [];
  const columns = content.columns as string || "4";

  return (
    <section className={cn("team-section py-16 px-6", className)}>
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <div className={cn(
          "grid gap-6",
          columns === "3" && "md:grid-cols-2 lg:grid-cols-3",
          columns === "4" && "md:grid-cols-2 lg:grid-cols-4"
        )}>
          {members.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-[var(--background-tertiary)]">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-[var(--foreground-muted)]">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="text-lg font-semibold">{member.name}</h3>
              {member.role && (
                <p className="text-sm text-[var(--primary)]">{member.role}</p>
              )}
              {member.bio && (
                <p className="text-sm text-[var(--foreground-secondary)] mt-2">
                  {member.bio}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// CONTACT FORM (Visual Only - actual form would need backend integration)
// ============================================================================

export function ContactFormRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const fields = (content.fields as { name: string; type: string; required?: boolean }[]) || [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "message", type: "textarea", required: true },
  ];

  return (
    <section className={cn("contact-section py-16 px-6", className)}>
      <div className="max-w-2xl mx-auto">
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <form className="space-y-4 bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
          {fields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium mb-1.5 capitalize">
                {field.name.replace(/_/g, " ")}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  required={field.required}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  required={field.required}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            {content.submitText as string || "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
}

// ============================================================================
// NEWSLETTER SIGNUP
// ============================================================================

export function NewsletterSignupRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const style = content.style as string || "inline";

  return (
    <section className={cn(
      "newsletter-section py-12 px-6",
      style === "banner" && "bg-[var(--primary)]",
      className
    )}>
      <div className="max-w-2xl mx-auto text-center">
        {content.title && (
          <h2 className={cn(
            "text-2xl font-bold mb-2",
            style === "banner" && "text-white"
          )}>
            {content.title as string}
          </h2>
        )}
        {content.description && (
          <p className={cn(
            "mb-6",
            style === "banner" ? "text-white/80" : "text-[var(--foreground-secondary)]"
          )}>
            {content.description as string}
          </p>
        )}
        <form className={cn(
          "flex gap-2",
          style === "stacked" ? "flex-col max-w-md mx-auto" : "flex-col sm:flex-row"
        )}>
          <input
            type="email"
            placeholder={content.placeholder as string || "Enter your email"}
            className="flex-1 px-4 py-3 rounded-lg bg-[var(--background)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            className={cn(
              "px-6 py-3 rounded-lg font-medium transition-colors",
              style === "banner"
                ? "bg-white text-gray-900 hover:bg-gray-100"
                : "bg-[var(--primary)] text-white hover:opacity-90"
            )}
          >
            {content.buttonText as string || "Subscribe"}
          </button>
        </form>
        {content.privacyNote && (
          <p className={cn(
            "text-xs mt-4",
            style === "banner" ? "text-white/60" : "text-[var(--foreground-muted)]"
          )}>
            {content.privacyNote as string}
          </p>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// SOCIAL PROOF
// ============================================================================

interface SocialProofItem {
  type: "stat" | "quote" | "badge";
  value?: string;
  label?: string;
  quote?: string;
  author?: string;
  image?: string;
}

export function SocialProofRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const items = (content.items as SocialProofItem[]) || [];

  return (
    <section className={cn("social-proof py-12 px-6 bg-[var(--background-tertiary)]", className)}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-8">
          {items.map((item, index) => (
            <div key={index} className="text-center">
              {item.type === "stat" && (
                <>
                  <p className="text-3xl font-bold text-[var(--primary)]">{item.value}</p>
                  <p className="text-sm text-[var(--foreground-secondary)]">{item.label}</p>
                </>
              )}
              {item.type === "quote" && (
                <div className="max-w-xs">
                  <Quote className="w-6 h-6 text-[var(--primary)] mx-auto mb-2" />
                  <p className="text-sm italic">&ldquo;{item.quote}&rdquo;</p>
                  {item.author && (
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">— {item.author}</p>
                  )}
                </div>
              )}
              {item.type === "badge" && item.image && (
                <img src={item.image} alt={item.label || ""} className="h-12 object-contain" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// BENEFITS LIST
// ============================================================================

interface Benefit {
  icon?: string;
  title: string;
  description?: string;
}

export function BenefitsListRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const benefits = (content.benefits as Benefit[]) || [];
  const layout = content.layout as string || "list";

  return (
    <section className={cn("benefits-section py-16 px-6", className)}>
      <div className="max-w-4xl mx-auto">
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <div className={cn(
          layout === "grid" ? "grid md:grid-cols-2 gap-6" : "space-y-4"
        )}>
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-4",
                layout === "grid" && "bg-[var(--card)] border border-[var(--border)] rounded-lg p-4"
              )}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="font-semibold">{benefit.title}</h3>
                {benefit.description && (
                  <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                    {benefit.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// IMAGE GALLERY
// ============================================================================

interface GalleryImage {
  src: string;
  alt?: string;
  caption?: string;
}

export function ImageGalleryRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const images = (content.images as GalleryImage[]) || [];
  const columns = content.columns as string || "3";
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <section className={cn("gallery-section py-16 px-6", className)}>
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <div className={cn(
          "grid gap-4",
          columns === "2" && "grid-cols-1 md:grid-cols-2",
          columns === "3" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          columns === "4" && "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
        )}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-lg bg-[var(--background-tertiary)]"
            >
              <img
                src={image.src}
                alt={image.alt || ""}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {image.caption && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <p className="text-white text-sm">{image.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Lightbox */}
        {selectedIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg"
            >
              <span className="sr-only">Close</span>
              ×
            </button>
            <img
              src={images[selectedIndex].src}
              alt={images[selectedIndex].alt || ""}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// FEATURES LIST (Alternate layout from grid)
// ============================================================================

interface FeatureItem {
  icon?: string;
  title: string;
  description?: string;
  image?: string;
}

export function FeaturesListRenderer({ instance, className }: ComponentRendererProps) {
  const content = instance.content as ContentRecord;
  const features = (content.features as FeatureItem[]) || [];
  const alternating = content.alternating !== false;

  return (
    <section className={cn("features-list py-16 px-6", className)}>
      <div className="max-w-6xl mx-auto">
        {content.title && (
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">{content.title as string}</h2>
            {content.subtitle && (
              <p className="text-lg text-[var(--foreground-secondary)]">
                {content.subtitle as string}
              </p>
            )}
          </div>
        )}

        <div className="space-y-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col md:flex-row items-center gap-8",
                alternating && index % 2 === 1 && "md:flex-row-reverse"
              )}
            >
              {feature.image && (
                <div className="flex-1">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="rounded-lg w-full"
                  />
                </div>
              )}
              <div className={cn("flex-1", !feature.image && "text-center")}>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                {feature.description && (
                  <p className="text-[var(--foreground-secondary)]">
                    {feature.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// COMPONENT RENDERER DISPATCHER
// ============================================================================

export function ComponentRenderer({ instance, className }: ComponentRendererProps) {
  const slug = instance.componentSlug;

  switch (slug) {
    case "hero":
      return <HeroRenderer instance={instance} className={className} />;
    case "features-grid":
      return <FeaturesGridRenderer instance={instance} className={className} />;
    case "features-list":
      return <FeaturesListRenderer instance={instance} className={className} />;
    case "testimonials":
      return <TestimonialsRenderer instance={instance} className={className} />;
    case "faq-accordion":
      return <FAQAccordionRenderer instance={instance} className={className} />;
    case "cta-section":
      return <CTASectionRenderer instance={instance} className={className} />;
    case "stats-metrics":
      return <StatsMetricsRenderer instance={instance} className={className} />;
    case "pricing-table":
      return <PricingTableRenderer instance={instance} className={className} />;
    case "comparison-table":
      return <ComparisonTableRenderer instance={instance} className={className} />;
    case "text-block":
      return <TextBlockRenderer instance={instance} className={className} />;
    case "video-embed":
      return <VideoEmbedRenderer instance={instance} className={className} />;
    case "logo-cloud":
      return <LogoCloudRenderer instance={instance} className={className} />;
    case "cards-grid":
      return <CardsGridRenderer instance={instance} className={className} />;
    case "timeline":
      return <TimelineRenderer instance={instance} className={className} />;
    case "team-grid":
      return <TeamGridRenderer instance={instance} className={className} />;
    case "contact-form":
      return <ContactFormRenderer instance={instance} className={className} />;
    case "newsletter-signup":
      return <NewsletterSignupRenderer instance={instance} className={className} />;
    case "social-proof":
      return <SocialProofRenderer instance={instance} className={className} />;
    case "benefits-list":
      return <BenefitsListRenderer instance={instance} className={className} />;
    case "image-gallery":
      return <ImageGalleryRenderer instance={instance} className={className} />;
    default:
      return (
        <section className={cn("py-12 px-6 text-center", className)}>
          <p className="text-[var(--foreground-muted)]">
            Renderer not found for: {slug}
          </p>
        </section>
      );
  }
}

// ============================================================================
// PAGE RENDERER - Renders all components on a page
// ============================================================================

interface PageRendererProps {
  components: PageComponentInstance[];
  className?: string;
}

export function PageRenderer({ components, className }: PageRendererProps) {
  if (components.length === 0) {
    return (
      <div className={cn("py-20 text-center", className)}>
        <p className="text-[var(--foreground-muted)]">No components to display</p>
      </div>
    );
  }

  return (
    <div className={cn("page-renderer", className)}>
      {components.map((instance) => (
        <ComponentRenderer key={instance.id} instance={instance} />
      ))}
    </div>
  );
}
