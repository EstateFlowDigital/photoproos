"use client";

import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";
import type { PortfolioWebsiteData } from "../portfolio-renderer";

interface ContactSectionProps {
  config: Record<string, unknown>;
  website: PortfolioWebsiteData;
  templateConfig: (typeof PORTFOLIO_TEMPLATES)[PortfolioTemplate];
}

export function ContactSection({
  config,
  website,
  templateConfig,
}: ContactSectionProps) {
  const title = (config.title as string) || "Get in Touch";
  const subtitle = (config.subtitle as string) || "";
  const showForm = config.showForm !== false;
  const showSocial = config.showSocial !== false;
  const showEmail = config.showEmail !== false;
  const showPhone = config.showPhone !== false;

  return (
    <section
      id="contact"
      className="py-16"
      style={{ backgroundColor: templateConfig.colors.backgroundSecondary }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
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

        <div className="mt-10 space-y-6">
          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-6">
            {showEmail && website.organization.publicEmail && (
              <a
                href={`mailto:${website.organization.publicEmail}`}
                className="flex items-center gap-2 text-lg transition-colors hover:opacity-80"
                style={{ color: templateConfig.colors.text }}
              >
                <MailIcon style={{ color: templateConfig.colors.primary }} />
                {website.organization.publicEmail}
              </a>
            )}
            {showPhone && website.organization.publicPhone && (
              <a
                href={`tel:${website.organization.publicPhone}`}
                className="flex items-center gap-2 text-lg transition-colors hover:opacity-80"
                style={{ color: templateConfig.colors.text }}
              >
                <PhoneIcon style={{ color: templateConfig.colors.primary }} />
                {website.organization.publicPhone}
              </a>
            )}
          </div>

          {/* Social Links */}
          {showSocial && website.socialLinks && website.socialLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4">
              {website.socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: templateConfig.colors.card,
                    color: templateConfig.colors.text,
                    border: `1px solid ${templateConfig.colors.cardBorder}`,
                  }}
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}

          {/* Contact Form */}
          {showForm && (
            <div
              className="mt-8 p-6"
              style={{
                backgroundColor: templateConfig.colors.card,
                borderRadius: templateConfig.borderRadius,
                border: `1px solid ${templateConfig.colors.cardBorder}`,
              }}
            >
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                    style={{
                      backgroundColor: templateConfig.colors.background,
                      color: templateConfig.colors.text,
                      border: `1px solid ${templateConfig.colors.cardBorder}`,
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                    style={{
                      backgroundColor: templateConfig.colors.background,
                      color: templateConfig.colors.text,
                      border: `1px solid ${templateConfig.colors.cardBorder}`,
                    }}
                  />
                </div>
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full rounded-lg px-4 py-3 text-sm outline-none"
                  style={{
                    backgroundColor: templateConfig.colors.background,
                    color: templateConfig.colors.text,
                    border: `1px solid ${templateConfig.colors.cardBorder}`,
                  }}
                />
                <button
                  type="submit"
                  className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: templateConfig.colors.primary,
                  }}
                >
                  Send Message
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Icons
function MailIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
