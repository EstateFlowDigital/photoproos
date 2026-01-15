import { Metadata } from "next";
import Link from "next/link";
import { getFeaturesContent } from "@/lib/marketing/content";

// Dynamic metadata from CMS
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getFeaturesContent("email-marketing");
  return {
    title: meta.title || "Email Marketing | Coming Soon | PhotoProOS",
    description: meta.description || "Powerful email marketing built for photographers. Nurture leads, engage clients, and grow your business with beautiful, automated email campaigns.",
    openGraph: meta.ogImage ? { images: [meta.ogImage] } : undefined,
  };
}

const plannedFeatures = [
  {
    title: "Campaign Builder",
    description: "Drag-and-drop email builder with photographer-focused templates. Create stunning emails that showcase your work.",
    icon: PaletteIcon,
    priority: "Launch",
  },
  {
    title: "Smart Automation",
    description: "Automated drip campaigns triggered by client actions - new bookings, gallery deliveries, invoice payments, and more.",
    icon: AutomationIcon,
    priority: "Launch",
  },
  {
    title: "Client Segmentation",
    description: "Target the right clients with smart segments based on service type, booking history, location, and engagement.",
    icon: UsersIcon,
    priority: "Launch",
  },
  {
    title: "Analytics Dashboard",
    description: "Track opens, clicks, conversions, and revenue attribution. Know exactly which campaigns drive bookings.",
    icon: ChartIcon,
    priority: "Launch",
  },
  {
    title: "A/B Testing",
    description: "Test subject lines, content, and send times to optimize your campaigns for maximum engagement.",
    icon: BeakerIcon,
    priority: "Phase 2",
  },
  {
    title: "Referral Campaigns",
    description: "Automate referral requests and track which clients bring you the most new business.",
    icon: GiftIcon,
    priority: "Phase 2",
  },
];

const templatePreviews = [
  { name: "Gallery Delivery", description: "Beautiful emails to announce when galleries are ready" },
  { name: "Booking Confirmation", description: "Professional confirmations that build excitement" },
  { name: "Payment Receipt", description: "Branded receipts that reinforce your professionalism" },
  { name: "Session Reminder", description: "Reduce no-shows with timely reminders" },
  { name: "Thank You & Review", description: "Request reviews at the perfect moment" },
  { name: "Seasonal Promotion", description: "Mini session announcements and special offers" },
  { name: "Re-engagement", description: "Win back clients who haven't booked in a while" },
  { name: "Birthday Wishes", description: "Personal touches that clients remember" },
];

const roadmapItems = [
  {
    phase: "Q2 2026",
    title: "Launch",
    items: [
      "Campaign builder with drag-and-drop editor",
      "Pre-built photographer templates",
      "Basic automation triggers",
      "Open & click tracking",
      "Mailchimp integration sync",
    ],
  },
  {
    phase: "Q3 2026",
    title: "Phase 2",
    items: [
      "Advanced automation workflows",
      "A/B testing",
      "Revenue attribution",
      "SMS + Email combined campaigns",
      "Custom domain sending",
    ],
  },
  {
    phase: "Q4 2026",
    title: "Phase 3",
    items: [
      "AI-powered send time optimization",
      "Predictive engagement scoring",
      "Advanced segmentation rules",
      "Multi-language support",
      "White-label for studios",
    ],
  },
];

const faqs = [
  {
    question: "How will this work with Mailchimp?",
    answer: "PhotoProOS Email Marketing will sync seamlessly with your existing Mailchimp account. You can continue using Mailchimp's advanced features while leveraging PhotoProOS automations, or use our built-in email system entirely.",
  },
  {
    question: "Will this replace my need for third-party email tools?",
    answer: "For most photographers, yes. We're building everything you need for client communication and marketing. However, we'll maintain integrations with Mailchimp and other tools for those with complex existing workflows.",
  },
  {
    question: "What about deliverability?",
    answer: "We're partnering with enterprise-grade email infrastructure providers and implementing best practices for authentication (SPF, DKIM, DMARC) to ensure your emails reach the inbox.",
  },
  {
    question: "Will there be additional costs?",
    answer: "Basic email features will be included in Pro and higher plans. High-volume senders may have tiered pricing based on email volume, but we'll keep it photographer-friendly.",
  },
];

// Type for CMS hero content
interface HeroContent {
  badge?: string;
  headline?: string;
  subheadline?: string;
}

export default async function EmailMarketingFeaturePage() {
  // Fetch CMS content
  const { content } = await getFeaturesContent("email-marketing");

  // Extract hero content from CMS with fallbacks
  const heroContent: HeroContent = (content as { hero?: HeroContent })?.hero || {};
  const heroBadge = heroContent.badge || "Coming Q2 2026";
  const heroHeadline = heroContent.headline || "Email Marketing";
  const heroSubheadline = heroContent.subheadline || "Powerful email marketing built for photographers. Nurture leads, engage clients, and grow your business with beautiful, automated email campaigns.";

  return (
    <main className="relative min-h-screen bg-background" data-element="features-email-marketing-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="features-email-marketing-hero">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--ai)]/20 bg-[var(--ai)]/5 px-4 py-1.5 text-sm font-medium text-[var(--ai)]">
              <ClockIcon className="h-4 w-4" />
              {heroBadge}
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {heroHeadline}
            </h1>
            <p className="mb-8 text-lg text-foreground-secondary">
              {heroSubheadline}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                Join waitlist
              </Link>
              <Link
                href="/features/automation"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                See what's available now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Notion-style Document Content */}
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8" data-element="features-email-marketing-content">
        {/* Overview */}
        <section className="mb-16" data-element="features-email-marketing-overview-section">
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ai)]/10 text-lg">
                📧
              </span>
              Overview
            </h2>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-foreground-secondary">
              <p className="mb-4">
                Email marketing is one of the highest-ROI channels for photographers, but most tools aren't designed for your workflow. We're building email marketing that understands photography businesses.
              </p>
              <p className="mb-0">
                <strong className="text-foreground">The goal:</strong> Replace the patchwork of email tools with a single, integrated solution that automatically sends the right message to the right client at the right time.
              </p>
            </div>
          </div>
        </section>

        {/* Planned Features */}
        <section className="mb-16" data-element="features-email-marketing-planned-section">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3" data-element="features-email-marketing-planned-heading">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ai)]/10 text-lg">
              ✨
            </span>
            Planned Features
          </h2>
          <div className="grid gap-4 md:grid-cols-2" data-element="features-email-marketing-planned-grid">
            {plannedFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ai)]/10">
                    <feature.icon className="h-5 w-5 text-[var(--ai)]" />
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      feature.priority === "Launch"
                        ? "bg-[var(--success)]/10 text-[var(--success)]"
                        : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                    )}
                  >
                    {feature.priority}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Templates Preview */}
        <section className="mb-16" data-element="features-email-marketing-templates-section">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3" data-element="features-email-marketing-templates-heading">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ai)]/10 text-lg">
              📋
            </span>
            Pre-built Templates
          </h2>
          <p className="text-foreground-secondary mb-6" data-element="features-email-marketing-templates-description">
            Start with professionally designed templates for every stage of your client journey.
          </p>
          <div className="grid gap-3 sm:grid-cols-2" data-element="features-email-marketing-templates-grid">
            {templatePreviews.map((template) => (
              <div
                key={template.name}
                className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[var(--background)] text-foreground-muted">
                  <MailIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{template.name}</p>
                  <p className="text-xs text-foreground-muted">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-16" data-element="features-email-marketing-roadmap-section">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3" data-element="features-email-marketing-roadmap-heading">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ai)]/10 text-lg">
              🗺️
            </span>
            Development Roadmap
          </h2>
          <div className="space-y-4" data-element="features-email-marketing-roadmap-list">
            {roadmapItems.map((phase, index) => (
              <div
                key={phase.phase}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden"
              >
                <div className="flex items-center gap-3 border-b border-[var(--card-border)] bg-[var(--background)] px-5 py-3">
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold",
                      index === 0
                        ? "bg-[var(--ai)] text-white"
                        : "bg-[var(--foreground-muted)]/20 text-foreground-muted"
                    )}
                  >
                    {phase.phase}
                  </span>
                  <span className="font-semibold text-foreground">{phase.title}</span>
                </div>
                <div className="p-5">
                  <ul className="space-y-2">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm text-foreground-secondary">
                        <CheckCircleIcon className="h-4 w-4 text-foreground-muted shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16" data-element="features-email-marketing-faq-section">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3" data-element="features-email-marketing-faq-heading">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ai)]/10 text-lg">
              ❓
            </span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4" data-element="features-email-marketing-faq-list">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
              >
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-sm text-foreground-secondary">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feedback CTA */}
        <section className="rounded-xl border border-[var(--ai)]/20 bg-[var(--ai)]/5 p-8 text-center" data-element="features-email-marketing-feedback-section">
          <h2 className="text-xl font-bold text-foreground mb-2">Help shape this feature</h2>
          <p className="text-foreground-secondary mb-6">
            We're actively gathering feedback from photographers. What would make email marketing perfect for your business?
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:feedback@photoproos.com?subject=Email Marketing Feedback"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--ai)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--ai)]/90"
            >
              Share your feedback
            </a>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Join waitlist for early access
            </Link>
          </div>
        </section>
      </div>

      {/* Related Features */}
      <section className="border-t border-[var(--card-border)] py-16" data-element="features-email-marketing-related-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground" data-element="features-email-marketing-related-heading">
            Available Now
          </h2>
          <div className="grid gap-6 md:grid-cols-3" data-element="features-email-marketing-related-grid">
            {[
              {
                title: "Automation",
                description: "Automated workflows for invoices, reminders, and follow-ups",
                href: "/features/automation",
              },
              {
                title: "Client Management",
                description: "CRM built specifically for photographers",
                href: "/features/clients",
              },
              {
                title: "Analytics",
                description: "Track your business performance in real-time",
                href: "/features/analytics",
              },
            ].map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-colors hover:border-[var(--primary)]/50"
              >
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-[var(--primary)]">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground-secondary">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function PaletteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 0 0-3.471 2.987 10.04 10.04 0 0 1 4.815 4.815 18.748 18.748 0 0 0 2.987-3.472l3.386-5.079A1.902 1.902 0 0 0 20.599 1.5Zm-8.3 14.025a18.76 18.76 0 0 0 1.896-1.207 8.026 8.026 0 0 0-4.513-4.513A18.75 18.75 0 0 0 8.475 11.7l-.278.5a5.26 5.26 0 0 1 3.601 3.602l.5-.278ZM6.75 13.5A3.75 3.75 0 0 0 3 17.25a1.5 1.5 0 0 1-1.601 1.497.75.75 0 0 0-.7 1.123 5.25 5.25 0 0 0 9.8-2.62 3.75 3.75 0 0 0-3.75-3.75Z" clipRule="evenodd" />
    </svg>
  );
}

function AutomationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4.5 6.375a4.125 4.125 0 1 1 8.25 0 4.125 4.125 0 0 1-8.25 0ZM14.25 8.625a3.375 3.375 0 1 1 6.75 0 3.375 3.375 0 0 1-6.75 0ZM1.5 19.125a7.125 7.125 0 0 1 14.25 0v.003l-.001.119a.75.75 0 0 1-.363.63 13.067 13.067 0 0 1-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 0 1-.364-.63l-.001-.122ZM17.25 19.128l-.001.144a2.25 2.25 0 0 1-.233.96 10.088 10.088 0 0 0 5.06-1.01.75.75 0 0 0 .42-.643 4.875 4.875 0 0 0-6.957-4.611 8.586 8.586 0 0 1 1.71 5.157v.003Z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 0 1 8.25-8.25.75.75 0 0 1 .75.75v6.75H18a.75.75 0 0 1 .75.75 8.25 8.25 0 0 1-16.5 0Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M12.75 3a.75.75 0 0 1 .75-.75 8.25 8.25 0 0 1 8.25 8.25.75.75 0 0 1-.75.75h-7.5a.75.75 0 0 1-.75-.75V3Z" clipRule="evenodd" />
    </svg>
  );
}

function BeakerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10.5 3.798v5.02a3 3 0 0 1-.879 2.121l-2.377 2.377a9.845 9.845 0 0 1 5.091 1.013 8.315 8.315 0 0 0 5.713.636l.285-.071-3.954-3.955a3 3 0 0 1-.879-2.121v-5.02a23.614 23.614 0 0 0-3 0Zm4.5.138a.75.75 0 0 0 .093-1.495A24.837 24.837 0 0 0 12 2.25a25.048 25.048 0 0 0-3.093.191A.75.75 0 0 0 9 3.936v4.882a1.5 1.5 0 0 1-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0 1 15 8.818V3.936Z" clipRule="evenodd" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6a2.25 2.25 0 0 0 2.25-2.25v-6.75h-8.25Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}
