"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { CtaContent } from "@/lib/landing-content";

interface CtaVariantProps {
  content: CtaContent;
}

export function CtaVariant({ content }: CtaVariantProps) {
  return (
    <section className="py-20 bg-[var(--primary)]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm text-white">
            {content.badge}
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-white/80">{content.headline.muted}</span>{" "}
            <span className="text-white">{content.headline.emphasis}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/80">
            {content.subheadline}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-[var(--primary)] hover:bg-white/90"
              >
                {content.primaryCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                {content.secondaryCta}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
