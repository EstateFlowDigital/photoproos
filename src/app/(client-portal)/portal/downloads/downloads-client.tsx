"use client";

import { useState } from "react";
import { PortalPageWrapper } from "../components";
import { Bell, CheckCircle2, Sparkles } from "lucide-react";

interface PortalDownloadsClientProps {
  clientName?: string;
  clientEmail?: string;
}

export function PortalDownloadsClient({
  clientName,
  clientEmail,
}: PortalDownloadsClientProps) {
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
    <PortalPageWrapper
      clientName={clientName}
      clientEmail={clientEmail}
    >
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6" data-element="portal-downloads-page">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Downloads</h1>
        <p className="mb-8 text-foreground-muted">Your download history and available files</p>

        <div className="card relative overflow-hidden p-8 text-center md:p-12">
          {/* Beta Badge */}
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-3 py-1.5 text-xs font-medium text-[var(--primary)]">
            <Sparkles className="h-3.5 w-3.5" />
            Coming Soon
          </div>

          <div className="mb-4 text-5xl">&#x2B07;&#xFE0F;</div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Feature in Development
          </h2>
          <p className="mx-auto mb-8 max-w-md text-foreground-muted">
            Re-download previously purchased files and track download history.
          </p>

          {/* Features List */}
          <div className="mx-auto mb-8 max-w-lg text-left">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Features included:
            </h3>
            <ul className="space-y-3">
              {[
                "All purchased files in one place",
                "High-resolution downloads",
                "Web and print-optimized versions",
                "Download history tracking",
                "Bulk download options",
                "Cloud storage integration",
              ].map((feature, index) => (
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
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="/portal"
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Portal Home
            </a>
            <a
              href="/portal/galleries"
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Galleries
            </a>
          </div>
        </div>
      </div>
    </PortalPageWrapper>
  );
}
