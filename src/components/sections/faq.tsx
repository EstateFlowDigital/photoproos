"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does PhotoProOS handle photo delivery and payments?",
    answer: "When you upload photos to a gallery, you can set it as free or paid. For paid galleries, clients browse a preview with watermarks, select their favorites, and pay securely through our integrated checkout. Once payment is confirmed, high-resolution downloads are automatically unlocked. You get paid instantly to your connected Stripe account.",
    category: "payments",
  },
  {
    question: "Can my clients download full-resolution images?",
    answer: "Absolutely. Clients can download the original full-resolution files you upload. You control the download options—offer single images, packages, or the complete gallery. We never compress or alter your images. What you upload is exactly what your clients receive.",
    category: "galleries",
  },
  {
    question: "What happens to my photos? Do you own them?",
    answer: "Your photos are 100% yours. We never claim any ownership or licensing rights to your work. Your images are stored securely on enterprise-grade cloud infrastructure, encrypted at rest and in transit. You can delete your content at any time, and we'll remove it from our servers within 30 days.",
    category: "security",
  },
  {
    question: "How do I migrate from my current gallery solution?",
    answer: "We make switching easy. Import client data via CSV, and use our bulk uploader to transfer your existing galleries. Most photographers complete migration in under a day. Our support team is available to help if you get stuck—we've helped thousands of photographers switch from Pixieset, ShootProof, and others.",
    category: "getting-started",
  },
  {
    question: "Is there a limit on storage or number of galleries?",
    answer: "Free accounts include 2GB of storage and up to 3 active galleries. Pro plans include 100GB with unlimited galleries, and Studio plans get 500GB. Enterprise customers receive unlimited storage. All plans support full-resolution uploads with no compression.",
    category: "pricing",
  },
  {
    question: "How do my clients pay, and when do I get paid?",
    answer: "Clients pay via credit card, debit card, or Apple Pay through our secure checkout (powered by Stripe). Funds are deposited directly to your bank account, typically within 2-3 business days. You can track all payments in real-time from your dashboard, and we handle all the tax documentation.",
    category: "payments",
  },
  {
    question: "Can I customize the galleries with my branding?",
    answer: "Yes! Add your logo, choose custom colors, set your own domain (e.g., gallery.yourname.com), and customize email templates. Pro and Studio plans include advanced branding options like custom fonts, splash pages, and the ability to remove PhotoProOS branding entirely.",
    category: "galleries",
  },
  {
    question: "Do you offer contracts and e-signatures?",
    answer: "This feature is coming soon! Our Contracts & E-Sign feature is currently in development and will be available to Pro and Studio subscribers in early 2025. You'll be able to create, send, and track legally binding contracts—all integrated with your client management workflow.",
    category: "features",
  },
];

interface FAQItemComponentProps extends FAQItem {
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FAQItemComponent({ question, answer, isOpen, onToggle, index }: FAQItemComponentProps) {
  const contentId = `faq-content-${index}`;
  const buttonId = `faq-button-${index}`;

  return (
    <div className="border-b border-[var(--card-border)] group">
      <button
        id={buttonId}
        className="flex w-full items-center justify-between py-6 text-left transition-colors duration-[var(--duration-fast)] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]/20 focus-visible:ring-inset motion-reduce:transition-none"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="pr-4 text-lg font-medium text-foreground group-hover:text-foreground/90 transition-colors">{question}</span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-[var(--duration-base)] motion-reduce:transition-none",
            isOpen
              ? "bg-[var(--primary)]/10 text-[var(--primary)]"
              : "bg-[var(--background-elevated)] text-foreground-secondary group-hover:bg-[var(--background-hover)] group-hover:text-foreground"
          )}
          aria-hidden="true"
        >
          {isOpen ? (
            <MinusIcon className="h-4 w-4" />
          ) : (
            <PlusIcon className="h-4 w-4" />
          )}
        </span>
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={cn(
          "grid transition-all duration-[var(--duration-base)] ease-in-out motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr] pb-6 opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-base leading-relaxed text-foreground-secondary">{answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="faq" ref={ref} className="relative z-10 py-20 lg:py-32" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:gap-24">
          {/* Left Column - Header */}
          <div>
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(20px)",
                transition: "opacity 600ms ease-out, transform 600ms ease-out",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
              </span>
              <span className="text-sm text-foreground-secondary">
                <span className="font-medium text-[var(--primary)]">24/7</span> support available
              </span>
            </div>
            <h2
              id="faq-heading"
              className="mb-6 text-4xl font-medium leading-tight tracking-[-1px] lg:text-5xl lg:leading-tight"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "100ms",
              }}
            >
              <span className="text-foreground-secondary">Questions?</span>{" "}
              <span className="text-[var(--primary)]">We've got answers.</span>
            </h2>
            <p
              className="text-lg leading-relaxed text-foreground-secondary"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "200ms",
              }}
            >
              Still curious?{" "}
              <a
                href="/contact"
                className="text-[var(--primary)] underline decoration-[var(--primary)]/30 underline-offset-4 transition-colors hover:decoration-[var(--primary)]"
              >
                Chat with our team
              </a>{" "}
              or check out our{" "}
              <a
                href="/help"
                className="text-[var(--primary)] underline decoration-[var(--primary)]/30 underline-offset-4 transition-colors hover:decoration-[var(--primary)]"
              >
                help center
              </a>
              .
            </p>

            {/* Quick links */}
            <div
              className="mt-8 flex flex-wrap gap-2"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "none" : "translateY(30px)",
                transition: "opacity 700ms ease-out, transform 700ms ease-out",
                transitionDelay: "300ms",
              }}
            >
              <span className="rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1 text-sm text-foreground-secondary">
                Payments
              </span>
              <span className="rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1 text-sm text-foreground-secondary">
                Galleries
              </span>
              <span className="rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1 text-sm text-foreground-secondary">
                Security
              </span>
              <span className="rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1 text-sm text-foreground-secondary">
                Pricing
              </span>
            </div>
          </div>

          {/* Right Column - FAQ Items */}
          <div className="divide-y divide-[var(--card-border)] border-t border-[var(--card-border)]">
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "none" : "translateY(20px)",
                  transition: "opacity 500ms ease-out, transform 500ms ease-out",
                  transitionDelay: `${300 + index * 80}ms`,
                }}
              >
                <FAQItemComponent
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
    </svg>
  );
}
