import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Support | PhotoProOS",
  description: "Get in touch with our support team.",
};

export const dynamic = "force-dynamic";

import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { HelpBreadcrumb } from "@/components/help";
import { ContactForm } from "./contact-form";

// ============================================================================
// Page
// ============================================================================

export default function ContactSupportPage() {
  return (
    <div data-element="help-contact-page" className="space-y-6">
      {/* Breadcrumb */}
      <HelpBreadcrumb
        items={[
          { label: "Help", href: "/help" },
          { label: "Contact Support" },
        ]}
      />

      <PageHeader
        title="Contact Support"
        subtitle="Get help from our support team"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Support */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground">
                  Email Support
                </h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  Send us an email and we&apos;ll get back to you within 24 hours.
                </p>
                <a
                  href="mailto:support@photoproos.com"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  support@photoproos.com
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <ContactForm />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Response Time */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/10 text-[var(--success)]">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Response Time
                </p>
                <p className="text-xs text-foreground-muted">
                  Within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Help Resources */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <h4 className="text-sm font-semibold text-foreground">
              Before you reach out
            </h4>
            <p className="mt-2 text-xs text-foreground-muted">
              You might find your answer in our help resources:
            </p>
            <div className="mt-4 space-y-2">
              <Link
                href="/help/getting-started"
                className="flex items-center gap-2 text-sm text-foreground-secondary transition-colors hover:text-[var(--primary)]"
              >
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
                Getting Started Guide
              </Link>
              <Link
                href="/help/faq"
                className="flex items-center gap-2 text-sm text-foreground-secondary transition-colors hover:text-[var(--primary)]"
              >
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
                Frequently Asked Questions
              </Link>
              <Link
                href="/help/payments"
                className="flex items-center gap-2 text-sm text-foreground-secondary transition-colors hover:text-[var(--primary)]"
              >
                <svg
                  className="h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
                Billing & Payments Help
              </Link>
            </div>
          </div>

          {/* Status Page */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <h4 className="text-sm font-semibold text-foreground">
              System Status
            </h4>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
              <span className="text-sm text-foreground-secondary">
                All systems operational
              </span>
            </div>
            <a
              href="https://status.photoproos.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-foreground-muted hover:text-[var(--primary)]"
            >
              View status page
              <svg
                className="h-3 w-3"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
