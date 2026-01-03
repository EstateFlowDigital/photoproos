"use client";

import { useState } from "react";
import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqSectionProps {
  config: Record<string, unknown>;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

export function FaqSection({ config, templateConfig }: FaqSectionProps) {
  const title = (config.title as string) || "Frequently Asked Questions";
  const items = (config.items as FAQItem[]) || [];
  const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="py-16"
      style={{ backgroundColor: templateConfig.colors.background }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="text-center text-3xl font-bold"
          style={{
            fontFamily: `'${templateConfig.fonts.heading}', sans-serif`,
            color: templateConfig.colors.text,
          }}
        >
          {title}
        </h2>

        <div className="mt-10 space-y-3">
          {items.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: templateConfig.colors.card,
                  borderRadius: templateConfig.borderRadius,
                  border: `1px solid ${templateConfig.colors.cardBorder}`,
                }}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span
                    className="font-medium"
                    style={{ color: templateConfig.colors.text }}
                  >
                    {item.question}
                  </span>
                  <ChevronIcon
                    isOpen={isOpen}
                    style={{ color: templateConfig.colors.textMuted }}
                  />
                </button>
                {isOpen && (
                  <div
                    className="border-t px-5 pb-5 pt-3"
                    style={{
                      borderColor: templateConfig.colors.cardBorder,
                      color: templateConfig.colors.textMuted,
                    }}
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ChevronIcon({
  isOpen,
  style,
}: {
  isOpen: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
      style={style}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
