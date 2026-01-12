"use client";

import { useState } from "react";
import { Bell, CheckCircle2, Sparkles } from "lucide-react";
import Link from "next/link";

export interface PortalComingSoonProps {
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  features: string[];
  relatedLinks?: { label: string; href: string }[];
}

export function PortalComingSoon({
  title,
  subtitle,
  icon,
  description,
  features,
  relatedLinks = [],
}: PortalComingSoonProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-foreground">{title}</h1>
      <p className="mb-8 text-foreground-muted">{subtitle}</p>

      <div className="card relative overflow-hidden p-8 text-center md:p-12">
        {/* Beta Badge */}
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-medium text-[var(--primary)]">
          <Sparkles className="h-3.5 w-3.5" />
          Coming Soon
        </div>

        <div className="mb-4 text-5xl">{icon}</div>
        <h2 className="mb-2 text-xl font-semibold text-foreground">
          Feature in Development
        </h2>
        <p className="mx-auto mb-8 max-w-md text-foreground-muted">
          {description}
        </p>

        {/* Features List */}
        <div className="mx-auto mb-8 max-w-lg text-left">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Features included:
          </h3>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-foreground-muted">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notify Form */}
        <div className="mx-auto mb-8 max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--background-tertiary)] p-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--success)]/10">
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
              </div>
              <p className="font-medium text-foreground">You&apos;re on the list!</p>
              <p className="text-sm text-foreground-muted">
                We&apos;ll notify you when this feature is available.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-center gap-2">
                <Bell className="h-4 w-4 text-foreground-muted" />
                <span className="text-sm font-medium text-foreground">
                  Get notified when it&apos;s ready
                </span>
              </div>
              <form onSubmit={handleNotifySubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
                >
                  {isSubmitting ? "..." : "Notify Me"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Related Links */}
        {relatedLinks.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
