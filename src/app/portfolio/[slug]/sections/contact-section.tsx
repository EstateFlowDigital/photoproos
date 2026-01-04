"use client";

import { useState, useTransition } from "react";
import type { PortfolioTemplate } from "@prisma/client";
import type { PORTFOLIO_TEMPLATES } from "@/lib/portfolio-templates";
import type { PortfolioWebsiteData } from "../portfolio-renderer";
import { submitPortfolioInquiry } from "@/lib/actions/portfolio-websites";

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

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("idle");
    setErrorMessage("");

    startTransition(async () => {
      const result = await submitPortfolioInquiry({
        portfolioWebsiteId: website.id,
        name,
        email,
        phone: phone || undefined,
        message,
        source: "portfolio_contact_form",
      });

      if (result.success) {
        setSubmitStatus("success");
        // Reset form
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        setSubmitStatus("error");
        setErrorMessage(result.error || "Failed to send message");
      }
    });
  };

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
              {submitStatus === "success" ? (
                <div className="text-center py-8">
                  <CheckCircleIcon
                    className="mx-auto h-12 w-12"
                    style={{ color: templateConfig.colors.primary }}
                  />
                  <h3
                    className="mt-4 text-lg font-semibold"
                    style={{ color: templateConfig.colors.text }}
                  >
                    Message Sent!
                  </h3>
                  <p
                    className="mt-2 text-sm"
                    style={{ color: templateConfig.colors.textMuted }}
                  >
                    Thank you for reaching out. We&apos;ll get back to you soon.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitStatus("idle")}
                    className="mt-4 text-sm font-medium hover:underline"
                    style={{ color: templateConfig.colors.primary }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {submitStatus === "error" && (
                    <div
                      className="rounded-lg px-4 py-3 text-sm"
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                      }}
                    >
                      {errorMessage}
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isPending}
                      className="w-full rounded-lg px-4 py-3 text-sm outline-none disabled:opacity-50"
                      style={{
                        backgroundColor: templateConfig.colors.background,
                        color: templateConfig.colors.text,
                        border: `1px solid ${templateConfig.colors.cardBorder}`,
                      }}
                    />
                    <input
                      type="email"
                      placeholder="Your Email *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isPending}
                      className="w-full rounded-lg px-4 py-3 text-sm outline-none disabled:opacity-50"
                      style={{
                        backgroundColor: templateConfig.colors.background,
                        color: templateConfig.colors.text,
                        border: `1px solid ${templateConfig.colors.cardBorder}`,
                      }}
                    />
                  </div>
                  <input
                    type="tel"
                    placeholder="Your Phone (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isPending}
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none disabled:opacity-50"
                    style={{
                      backgroundColor: templateConfig.colors.background,
                      color: templateConfig.colors.text,
                      border: `1px solid ${templateConfig.colors.cardBorder}`,
                    }}
                  />
                  <textarea
                    placeholder="Your Message *"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={isPending}
                    className="w-full rounded-lg px-4 py-3 text-sm outline-none disabled:opacity-50"
                    style={{
                      backgroundColor: templateConfig.colors.background,
                      color: templateConfig.colors.text,
                      border: `1px solid ${templateConfig.colors.cardBorder}`,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                    style={{
                      backgroundColor: templateConfig.colors.primary,
                    }}
                  >
                    {isPending ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
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

function CheckCircleIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}
