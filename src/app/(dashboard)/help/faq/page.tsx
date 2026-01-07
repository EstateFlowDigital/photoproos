"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard";
import { HelpBreadcrumb, HelpSearch } from "@/components/help";
import { cn } from "@/lib/utils";

// ============================================================================
// FAQ Data
// ============================================================================

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  // Getting Started
  {
    category: "Getting Started",
    question: "How do I create my first gallery?",
    answer:
      "Go to Galleries in the sidebar, click 'New Gallery', select a client, and upload your photos. You can drag and drop files or click to browse. Once uploaded, set your pricing (free or paid) and share with your client.",
  },
  {
    category: "Getting Started",
    question: "How long does it take to set up my account?",
    answer:
      "Most photographers complete their account setup in under 10 minutes. You'll need to add your business info, connect Stripe for payments, and optionally customize your branding.",
  },
  {
    category: "Getting Started",
    question: "Can I import my existing clients?",
    answer:
      "Yes! Go to Clients and click 'Import' to upload a CSV file with your client data. You can map columns to PhotoProOS fields and choose how to handle duplicates.",
  },
  // Galleries
  {
    category: "Galleries",
    question: "What file types can I upload?",
    answer:
      "PhotoProOS supports JPEG, PNG, and HEIC files. HEIC files are automatically converted to JPEG. We recommend keeping individual files under 50MB for optimal performance.",
  },
  {
    category: "Galleries",
    question: "Can clients download full resolution photos?",
    answer:
      "Yes! You control download settings per gallery. Enable downloads, choose between original or web-optimized quality, and optionally set download limits.",
  },
  {
    category: "Galleries",
    question: "How do I protect my photos from unauthorized use?",
    answer:
      "Use watermarks for unpurchased photos (Settings > Branding > Watermark), enable password protection on galleries, and set expiration dates. Watermarks are automatically removed after purchase.",
  },
  {
    category: "Galleries",
    question: "Can I set different prices for different galleries?",
    answer:
      "Yes! Each gallery has independent pricing settings. You can set flat rates, per-image pricing, or offer the gallery for free download.",
  },
  // Payments
  {
    category: "Payments",
    question: "How do I get paid?",
    answer:
      "Connect your Stripe account in Settings > Payments. When clients pay for galleries or invoices, funds are deposited to your bank account within 2-7 business days (depending on your country).",
  },
  {
    category: "Payments",
    question: "What payment methods can clients use?",
    answer:
      "Clients can pay via credit/debit card, Apple Pay, Google Pay, and bank transfer (ACH). All payments are processed securely through Stripe.",
  },
  {
    category: "Payments",
    question: "What are the fees?",
    answer:
      "Stripe charges approximately 2.9% + $0.30 per transaction. PhotoProOS platform fees vary by plan. Check your subscription details for exact rates.",
  },
  {
    category: "Payments",
    question: "Can I issue refunds?",
    answer:
      "Yes, go to Payments > Transactions, find the payment, and click 'Issue Refund'. Refunds are processed back to the original payment method.",
  },
  // Billing & Account
  {
    category: "Billing & Account",
    question: "How do I change my subscription plan?",
    answer:
      "Go to Settings > Billing and click 'Change Plan'. You can upgrade immediately or schedule a downgrade for the end of your billing period.",
  },
  {
    category: "Billing & Account",
    question: "Can I cancel my subscription?",
    answer:
      "Yes, go to Settings > Billing > Cancel Subscription. You'll retain access until the end of your billing period. Your data is preserved for 30 days after cancellation.",
  },
  {
    category: "Billing & Account",
    question: "Do you offer refunds?",
    answer:
      "Monthly plans: No refunds for the current period. Annual plans: Prorated refunds available for unused months if requested within 30 days. Contact support@photoproos.com.",
  },
  // Technical
  {
    category: "Technical",
    question: "Is my data secure?",
    answer:
      "Yes! We use industry-standard encryption for all data in transit and at rest. Payment information is handled by Stripe (PCI DSS compliant). We never store full card numbers.",
  },
  {
    category: "Technical",
    question: "Can I use PhotoProOS on mobile?",
    answer:
      "PhotoProOS is fully responsive and works on all devices through your web browser. No app download required.",
  },
  {
    category: "Technical",
    question: "How do I connect my calendar?",
    answer:
      "Go to Settings > Integrations > Google Calendar (or your preferred calendar). Sign in and authorize PhotoProOS. Events will sync both ways automatically.",
  },
];

// Group FAQs by category
const faqsByCategory = faqs.reduce(
  (acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  },
  {} as Record<string, FAQ[]>
);

const categories = Object.keys(faqsByCategory);

// ============================================================================
// FAQ Item Component
// ============================================================================

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="border-b border-[var(--card-border)] last:border-b-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-foreground">{question}</span>
        <svg
          className={cn(
            "h-5 w-5 shrink-0 text-foreground-muted transition-transform",
            isOpen && "rotate-180"
          )}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 pb-4" : "max-h-0"
        )}
      >
        <p className="text-sm text-foreground-secondary leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = React.useState(categories[0]);

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <HelpBreadcrumb
        items={[
          { label: "Help", href: "/help" },
          { label: "Frequently Asked Questions" },
        ]}
      />

      <PageHeader
        title="Frequently Asked Questions"
        subtitle="Quick answers to common questions about PhotoProOS"
      />

      {/* Search */}
      <div className="max-w-xl">
        <HelpSearch placeholder="Search FAQs..." />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              activeCategory === category
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-6">
        {faqsByCategory[activeCategory]?.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>

      {/* Still Need Help */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-[var(--card-border)] bg-[var(--background-secondary)] text-foreground-muted">
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.06 3 3 0 112.668 5.024.75.75 0 01-.668-.215V11a.75.75 0 01-1.5 0v-.5a1.5 1.5 0 011.5-1.5 1.5 1.5 0 10-1.06-2.56zM10 15a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">
              Still have questions?
            </h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Can&apos;t find the answer you&apos;re looking for? Our support team is
              happy to help.
            </p>
          </div>
          <Link
            href="/help/contact"
            className="shrink-0 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
