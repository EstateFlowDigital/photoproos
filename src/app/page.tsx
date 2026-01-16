import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getHomepageContentWithPreview } from "@/lib/marketing/content";
import { PreviewToolbar } from "@/components/cms/preview-toolbar";

// Dynamic metadata from CMS
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getHomepageContentWithPreview();
  return {
    title: meta.title || "PhotoProOS | The Business OS for Professional Photographers",
    description: meta.description || "Deliver stunning galleries, collect payments automatically, and run your entire photography business from one platform.",
    openGraph: meta.ogImage ? { images: [meta.ogImage] } : undefined,
  };
}

// New analytics-focused hero
const HeroAnalyticsSection = dynamic(
  () => import("@/components/sections/hero-analytics").then((m) => m.HeroAnalyticsSection),
  { loading: () => <div className="h-[600px]" aria-hidden /> }
);

// New sections
const MetricsShowcaseSection = dynamic(() =>
  import("@/components/sections/metrics-showcase").then((m) => m.MetricsShowcaseSection)
);
const IndustryTabsSection = dynamic(() =>
  import("@/components/sections/industry-tabs").then((m) => m.IndustryTabsSection)
);
const ClientExperienceSection = dynamic(() =>
  import("@/components/sections/client-experience").then((m) => m.ClientExperienceSection)
);
const IntegrationSpotlightSection = dynamic(() =>
  import("@/components/sections/integration-spotlight").then((m) => m.IntegrationSpotlightSection)
);

// Existing sections
const LogosSection = dynamic(() => import("@/components/sections/logos").then((m) => m.LogosSection));
const HowItWorksSection = dynamic(() =>
  import("@/components/sections/how-it-works").then((m) => m.HowItWorksSection)
);
const FeaturesSection = dynamic(() =>
  import("@/components/sections/features").then((m) => m.FeaturesSection)
);
const PricingSection = dynamic(() =>
  import("@/components/sections/pricing").then((m) => m.PricingSection)
);
const TestimonialsSection = dynamic(() =>
  import("@/components/sections/testimonials").then((m) => m.TestimonialsSection)
);
// FAQWithCMS is a server component wrapper that fetches from CMS
import { FAQWithCMS } from "@/components/sections/faq-with-cms";
const CTASection = dynamic(() => import("@/components/sections/cta").then((m) => m.CTASection));

// Additional sections with interactive demos
const HeroSection = dynamic(() =>
  import("@/components/sections/hero").then((m) => m.HeroSection)
);
const FivePillarsSection = dynamic(() =>
  import("@/components/sections/five-pillars").then((m) => m.FivePillarsSection)
);
const ToolReplacementSection = dynamic(() =>
  import("@/components/sections/tool-replacement").then((m) => m.ToolReplacementSection)
);
const CaseStudiesSection = dynamic(() =>
  import("@/components/sections/case-studies").then((m) => m.CaseStudiesSection)
);
const ROICalculatorSection = dynamic(() =>
  import("@/components/sections/roi-calculator").then((m) => m.ROICalculatorSection)
);
const IntegrationsSection = dynamic(() =>
  import("@/components/sections/integrations").then((m) => m.IntegrationsSection)
);
const ComparisonSection = dynamic(() =>
  import("@/components/sections/comparison").then((m) => m.ComparisonSection)
);
const SecuritySection = dynamic(() =>
  import("@/components/sections/security").then((m) => m.SecuritySection)
);

// Lazy loading wrapper
import { LazySection } from "@/components/sections/lazy-section";

// UI enhancements
const ScrollProgress = dynamic(() =>
  import("@/components/ui/scroll-progress").then((m) => m.ScrollProgress)
);
const BackToTop = dynamic(() =>
  import("@/components/ui/scroll-progress").then((m) => m.BackToTop)
);
const StickyCTA = dynamic(() => import("@/components/ui/sticky-cta").then((m) => m.StickyCTA));
const ExitIntentPopup = dynamic(() =>
  import("@/components/ui/exit-intent-popup").then((m) => m.ExitIntentPopup)
);
const SocialProofToast = dynamic(() =>
  import("@/components/ui/social-proof-toast").then((m) => m.SocialProofToast)
);
const ChatWidget = dynamic(() => import("@/components/ui/chat-widget").then((m) => m.ChatWidget));

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  // Fetch homepage content from CMS (supports preview mode)
  const { content, isPreview, hasDraft } = await getHomepageContentWithPreview();

  return (
    <main id="main-content" data-element="homepage" className="relative min-h-screen overflow-hidden bg-background">
      {/* Preview Mode Toolbar */}
      <PreviewToolbar isPreview={isPreview} hasDraft={hasDraft} pageSlug="homepage" />

      {/* Scroll Progress Indicator */}
      <ScrollProgress color="linear-gradient(90deg, #3b82f6, #8b5cf6)" height={2} />

      {/* Back to Top Button */}
      <BackToTop showAfter={400} />

      {/* Sticky CTA Bar */}
      <StickyCTA />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />

      {/* Social Proof Toast */}
      <SocialProofToast />

      {/* Live Chat Widget */}
      <ChatWidget />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section - Analytics-focused with dashboard mockup */}
      <HeroAnalyticsSection content={content?.hero} />

      {/* Logos Section - Social proof */}
      <LogosSection content={content?.logos} />

      <div className="section-divider" />

      {/* Metrics Showcase - Platform stats */}
      <MetricsShowcaseSection content={content?.metrics} />

      <div className="section-divider" />

      {/* How It Works - Simple 3-step process */}
      <HowItWorksSection content={content?.howItWorks} />

      <div className="section-divider" />

      {/* Five Pillars - Core platform pillars with interactive demos */}
      <LazySection placeholderHeight={600}>
        <FivePillarsSection />
      </LazySection>

      <div className="section-divider" />

      {/* Industry Tabs - Photography verticals with case studies */}
      <IndustryTabsSection />

      <div className="section-divider" />

      {/* Client Experience - Show how easy it is for clients */}
      <ClientExperienceSection />

      <div className="section-divider" />

      {/* Tool Replacement - Calculator showing consolidated tools */}
      <LazySection placeholderHeight={400}>
        <ToolReplacementSection />
      </LazySection>

      <div className="section-divider" />

      {/* Integration Spotlight - Stripe payments feature */}
      <IntegrationSpotlightSection />

      <div className="section-divider" />

      {/* Case Studies - Success stories with metrics */}
      <LazySection placeholderHeight={500}>
        <CaseStudiesSection />
      </LazySection>

      <div className="section-divider" />

      {/* Comparison - Feature comparison with competitors */}
      <LazySection placeholderHeight={600}>
        <ComparisonSection />
      </LazySection>

      <div className="section-divider" />

      {/* Security - Trust and security features */}
      <LazySection placeholderHeight={500}>
        <SecuritySection />
      </LazySection>

      <div className="section-divider" />

      {/* Testimonials Section - Customer stories */}
      <LazySection placeholderHeight={320}>
        <TestimonialsSection />
      </LazySection>

      <div className="section-divider" />

      {/* Pricing Section - Plans and pricing */}
      <LazySection placeholderHeight={320}>
        <PricingSection />
      </LazySection>

      <div className="section-divider" />

      {/* FAQ Section - CMS-powered with fallback */}
      <LazySection placeholderHeight={280}>
        <FAQWithCMS page="homepage" />
      </LazySection>

      {/* CTA Section - Final conversion */}
      <LazySection placeholderHeight={220}>
        <CTASection />
      </LazySection>

      {/* Footer */}
      <Footer />
    </main>
  );
}
