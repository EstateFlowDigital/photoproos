import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { getLandingPageContent, type LandingPageVariant } from "@/lib/landing-content";

// Dynamic imports for sections
const Navbar = dynamic(() => import("@/components/layout/navbar").then((m) => m.Navbar));
const Footer = dynamic(() => import("@/components/layout/footer").then((m) => m.Footer));
const HeroVariant = dynamic(() => import("./hero-variant").then((m) => m.HeroVariant));
const LogosSection = dynamic(() => import("@/components/sections/logos").then((m) => m.LogosSection));
const MetricsVariant = dynamic(() => import("./metrics-variant").then((m) => m.MetricsVariant));
const HowItWorksSection = dynamic(() => import("@/components/sections/how-it-works").then((m) => m.HowItWorksSection));
const FeaturesSection = dynamic(() => import("@/components/sections/features").then((m) => m.FeaturesSection));
const IndustryTabsSection = dynamic(() => import("@/components/sections/industry-tabs").then((m) => m.IndustryTabsSection));
const ClientExperienceSection = dynamic(() => import("@/components/sections/client-experience").then((m) => m.ClientExperienceSection));
const IntegrationSpotlightSection = dynamic(() => import("@/components/sections/integration-spotlight").then((m) => m.IntegrationSpotlightSection));
const TestimonialsSection = dynamic(() => import("@/components/sections/testimonials").then((m) => m.TestimonialsSection));
const PricingSection = dynamic(() => import("@/components/sections/pricing").then((m) => m.PricingSection));
const FAQSection = dynamic(() => import("@/components/sections/faq").then((m) => m.FAQSection));
const CtaVariant = dynamic(() => import("./cta-variant").then((m) => m.CtaVariant));

// Valid variants
const VALID_VARIANTS = ["a", "b", "c"] as const;

// Generate static params for all variants
export function generateStaticParams() {
  return VALID_VARIANTS.map((variant) => ({ variant }));
}

// Metadata for each variant
export async function generateMetadata({ params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;

  if (!VALID_VARIANTS.includes(variant as LandingPageVariant)) {
    return { title: "Not Found" };
  }

  const content = getLandingPageContent(variant as LandingPageVariant);

  return {
    title: `PhotoProOS - ${content.name} | The Business OS for Professional Photographers`,
    description: content.hero.subheadline,
  };
}

export default async function LandingPageVariant({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant } = await params;

  // Validate variant
  if (!VALID_VARIANTS.includes(variant as LandingPageVariant)) {
    notFound();
  }

  const content = getLandingPageContent(variant as LandingPageVariant);

  return (
    <main className="min-h-screen bg-background">
      {/* Variant indicator for testing (remove in production) */}
      <div className="fixed top-20 right-4 z-50 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-medium text-white shadow-lg">
        Variant {variant.toUpperCase()}: {content.name}
      </div>

      <Navbar />

      {/* Hero - Variant-specific content */}
      <HeroVariant content={content.hero} variant={content.variant} />

      {/* Social Proof */}
      <LogosSection />

      {/* Metrics - Variant-specific content */}
      <MetricsVariant content={content.metrics} />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Features */}
      <FeaturesSection />

      {/* Industry Tabs */}
      <IndustryTabsSection />

      {/* Client Experience */}
      <ClientExperienceSection />

      {/* Integration Spotlight */}
      <IntegrationSpotlightSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Pricing */}
      <PricingSection />

      {/* FAQ */}
      <FAQSection />

      {/* CTA - Variant-specific content */}
      <CtaVariant content={content.cta} />

      <Footer />
    </main>
  );
}
