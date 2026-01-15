import { Metadata } from "next";
import Link from "next/link";
import { PLAN_PRICING, BETA_SETTINGS, LIFETIME_DEAL_INCLUDES } from "@/lib/plan-limits";
import { PricingPageClient } from "./pricing-client";
import { getPricingContent, getFAQsForPage } from "@/lib/marketing/content";

// Dynamic metadata from CMS
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getPricingContent();
  return {
    title: meta.title || "Pricing | PhotoProOS",
    description: meta.description || "Simple, transparent pricing for photographers of all sizes. Start free, upgrade when you're ready. No hidden fees. Lifetime deals available during beta.",
    openGraph: meta.ogImage ? { images: [meta.ogImage] } : undefined,
  };
}

const plans = [
  {
    name: "Free",
    planKey: "free" as const,
    description: "Perfect for getting started and trying out PhotoProOS.",
    features: [
      "25 GB storage",
      "Up to 5 active galleries",
      "25 clients",
      "Basic gallery themes",
      "Client portal access",
      "Email support",
    ],
    cta: "Get started free",
    href: "/sign-up",
  },
  {
    name: "Pro",
    planKey: "pro" as const,
    description: "For growing photographers who need more space.",
    features: [
      "500 GB storage",
      "50 active galleries",
      "100 clients",
      "Custom branding",
      "Payment processing",
      "Priority email support",
      "3 team members",
    ],
    cta: "Start free trial",
    href: "/sign-up?plan=pro",
    popular: true,
  },
  {
    name: "Studio",
    planKey: "studio" as const,
    description: "For busy studios with unlimited usage needs.",
    features: [
      "1 TB storage",
      "Unlimited galleries",
      "Unlimited clients",
      "White-label portal",
      "API & webhooks access",
      "Advanced analytics",
      "10 team members",
    ],
    cta: "Start free trial",
    href: "/sign-up?plan=studio",
  },
  {
    name: "Enterprise",
    planKey: "enterprise" as const,
    description: "For agencies with custom requirements.",
    features: [
      "Unlimited storage",
      "Unlimited everything",
      "Unlimited team members",
      "SSO/SAML",
      "SLA guarantee",
      "Dedicated support",
      "Custom integrations",
    ],
    cta: "Contact sales",
    href: "/contact?subject=enterprise",
  },
];

// Feature comparison data - aligned with plan-limits.ts
const featureComparison = [
  { feature: "Storage", free: "25 GB", pro: "500 GB", studio: "1 TB", enterprise: "Unlimited" },
  { feature: "Active galleries", free: "5", pro: "50", studio: "Unlimited", enterprise: "Unlimited" },
  { feature: "Clients", free: "25", pro: "100", studio: "Unlimited", enterprise: "Unlimited" },
  { feature: "Team members", free: "1", pro: "3", studio: "10", enterprise: "Unlimited" },
  { feature: "Custom branding", free: true, pro: true, studio: true, enterprise: true },
  { feature: "White-label (remove branding)", free: false, pro: false, studio: true, enterprise: true },
  { feature: "Payment processing", free: false, pro: true, studio: true, enterprise: true },
  { feature: "Transaction fee", free: "N/A", pro: "2.9% + 30¢", studio: "2.5% + 30¢", enterprise: "Custom" },
  { feature: "Invoices per month", free: "10", pro: "50", studio: "Unlimited", enterprise: "Unlimited" },
  { feature: "API & webhooks", free: false, pro: false, studio: true, enterprise: true },
  { feature: "Analytics dashboard", free: "Basic", pro: "Standard", studio: "Advanced", enterprise: "Custom" },
  { feature: "Custom domain", free: false, pro: true, studio: true, enterprise: true },
  { feature: "AI credits/month", free: "10", pro: "100", studio: "1,000", enterprise: "Unlimited" },
  { feature: "SSO/SAML", free: false, pro: false, studio: false, enterprise: true },
  { feature: "Priority support", free: false, pro: "Email", studio: "Phone + Email", enterprise: "Dedicated" },
  { feature: "SLA guarantee", free: false, pro: false, studio: false, enterprise: true },
  { feature: "Additional storage", free: "Upgrade required", pro: "$199/10 TB", studio: "$199/10 TB", enterprise: "$199/10 TB" },
  { feature: "Gallery sleep mode", free: false, pro: true, studio: true, enterprise: true },
];

// Fallback FAQs if CMS is empty (prices should come from plan-limits.ts)
const fallbackFaqs = [
  {
    question: "Can I try PhotoProOS before committing?",
    answer: "Yes! Our Free plan is available forever, and all paid plans come with a 14-day free trial. No credit card required.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards through Stripe. Annual plans receive a 20% discount.",
  },
  {
    question: "Can I upgrade or downgrade anytime?",
    answer: "Absolutely. You can change your plan at any time. Upgrades take effect immediately, and downgrades at the end of your billing cycle.",
  },
  {
    question: "What are the payment processing fees?",
    answer: "We charge a small percentage on payments you collect through galleries. The fee decreases as your plan tier increases: 2.9% + 30¢ for Pro, 2.5% + 30¢ for Studio, and custom rates for Enterprise.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer: "Yes! Annual plans save you 20% compared to monthly billing.",
  },
  {
    question: "How does storage work across plans?",
    answer: "All plans include unified storage for galleries, client uploads, and documents. Free includes 25GB, Pro includes 500GB, Studio includes 1TB, and Enterprise includes unlimited storage (10TB soft cap). Need more? Paid plans can add 10TB for $199/month. Paid plans also get Gallery Sleep Mode to archive galleries without counting against your quota.",
  },
  {
    question: "What's the difference between Pro and Studio?",
    answer: "Pro is ideal for growing photographers with 500GB storage and 50 active galleries. Studio is designed for busy studios that need 1TB storage, unlimited galleries, clients, and invoices, plus advanced features like API access and white-label branding.",
  },
  {
    question: "What's included in the Lifetime Deal?",
    answer: "Lifetime deals are one-time payments that give you permanent access to your plan tier. This includes all current and future features, all updates forever, your plan's storage allocation, and a 10% discount on all in-app purchases like custom domains and additional storage.",
  },
];

// Type for CMS hero content
interface PricingHeroContent {
  badge?: string;
  headline?: string;
  subheadline?: string;
}

export default async function PricingPage() {
  const isBeta = BETA_SETTINGS.isBetaActive;

  // Fetch CMS content
  const [pricingContent, cmsFaqs] = await Promise.all([
    getPricingContent(),
    getFAQsForPage("pricing"),
  ]);

  // Extract hero content from CMS with fallbacks
  const heroContent: PricingHeroContent = (pricingContent.content as { hero?: PricingHeroContent })?.hero || {};
  const heroHeadline = heroContent.headline || "Start free, upgrade anytime";
  const heroSubheadline = heroContent.subheadline || "No hidden fees, no surprises. Start free, upgrade when you're ready.";
  const heroBadge = heroContent.badge || (isBeta ? "Beta Exclusive Pricing — Lock in before prices increase" : "Simple, transparent pricing");

  // Use CMS FAQs if available, otherwise fallback
  const faqs = cmsFaqs.length > 0
    ? cmsFaqs.map(faq => ({ question: faq.question, answer: faq.answer }))
    : fallbackFaqs;

  return (
    <main className="relative min-h-screen bg-background" data-element="pricing-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="pricing-hero">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge from CMS */}
            {isBeta ? (
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-1.5 text-sm font-medium text-[var(--success)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
                </span>
                {heroBadge}
              </span>
            ) : (
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--success)]/20 bg-[var(--success)]/5 px-4 py-1.5 text-sm font-medium text-[var(--success)]">
                {heroBadge}
              </span>
            )}
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {heroHeadline}
            </h1>
            <p className="text-lg text-foreground-secondary">
              {heroSubheadline}
            </p>
          </div>
        </div>
      </section>

      {/* Client Component for Interactive Pricing */}
      <PricingPageClient
        plans={plans}
        featureComparison={featureComparison}
        faqs={faqs}
        isBeta={isBeta}
      />
    </main>
  );
}
