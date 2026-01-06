import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const HeroSection = dynamic(() => import("@/components/sections/hero").then((m) => m.HeroSection), {
  loading: () => <div className="h-[600px]" aria-hidden />,
});
const LogosSection = dynamic(() => import("@/components/sections/logos").then((m) => m.LogosSection));
const HowItWorksSection = dynamic(() =>
  import("@/components/sections/how-it-works").then((m) => m.HowItWorksSection)
);
const NoiseToKnowledgeSection = dynamic(() =>
  import("@/components/sections/noise-to-knowledge").then((m) => m.NoiseToKnowledgeSection)
);
const FeaturesSection = dynamic(() =>
  import("@/components/sections/features").then((m) => m.FeaturesSection)
);
const UseCasesSection = dynamic(() =>
  import("@/components/sections/use-cases").then((m) => m.UseCasesSection)
);
const ComparisonSection = dynamic(() =>
  import("@/components/sections/comparison").then((m) => m.ComparisonSection)
);
const IntegrationsSection = dynamic(() =>
  import("@/components/sections/integrations").then((m) => m.IntegrationsSection)
);
const ROICalculatorSection = dynamic(() =>
  import("@/components/sections/roi-calculator").then((m) => m.ROICalculatorSection)
);
const PricingSection = dynamic(() =>
  import("@/components/sections/pricing").then((m) => m.PricingSection)
);
const TestimonialsSection = dynamic(() =>
  import("@/components/sections/testimonials").then((m) => m.TestimonialsSection)
);
const SecuritySection = dynamic(() =>
  import("@/components/sections/security").then((m) => m.SecuritySection)
);
const RoadmapSection = dynamic(() =>
  import("@/components/sections/roadmap").then((m) => m.RoadmapSection)
);
const FAQSection = dynamic(() => import("@/components/sections/faq").then((m) => m.FAQSection));
const CTASection = dynamic(() => import("@/components/sections/cta").then((m) => m.CTASection));
import { LazySection } from "@/components/sections/lazy-section";
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

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-background">
      {/* Scroll Progress Indicator */}
      <ScrollProgress color="linear-gradient(90deg, #3b82f6, #8b5cf6)" height={2} />

      {/* Back to Top Button */}
      <BackToTop showAfter={400} />

      {/* Sticky CTA Bar */}
      <StickyCTA />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />

      {/* Social Proof Toast - Shows recent signup notifications */}
      <SocialProofToast />

      {/* Live Chat Widget */}
      <ChatWidget />

      {/* Background Gradient */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute left-1/2 top-0 h-[1000px] w-full max-w-[1512px] -translate-x-1/2"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 70% 10%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Hero Section - Main value proposition with interactive demo */}
      <HeroSection />

      {/* Logos Section - Social proof and stats */}
      <LogosSection />

      <div className="section-divider" />

      {/* How It Works - Simple 3-step process */}
      <HowItWorksSection />

      <div className="section-divider" />

      {/* Value Proposition - Why PhotoProOS (Before/After) */}
      <NoiseToKnowledgeSection />

      <div className="section-divider" />

      {/* Features Section - Core product features */}
      <FeaturesSection />

      <div className="section-divider" />

      {/* Use Cases Section - Photography verticals */}
      <UseCasesSection />

      <div className="section-divider" />

      {/* Comparison Section - vs Competitors */}
      <LazySection placeholderHeight={280}>
        <ComparisonSection />
      </LazySection>

      <div className="section-divider" />

      {/* Integrations Section - Third-party apps */}
      <LazySection placeholderHeight={260}>
        <IntegrationsSection />
      </LazySection>

      <div className="section-divider" />

      {/* ROI Calculator - Show potential savings */}
      <LazySection placeholderHeight={320}>
        <ROICalculatorSection />
      </LazySection>

      <div className="section-divider" />

      {/* Pricing Section - Plans and pricing */}
      <LazySection placeholderHeight={320}>
        <PricingSection />
      </LazySection>

      <div className="section-divider" />

      {/* Testimonials Section - Customer stories */}
      <LazySection placeholderHeight={320}>
        <TestimonialsSection />
      </LazySection>

      <div className="section-divider" />

      {/* Security Section - Trust and compliance */}
      <LazySection placeholderHeight={260}>
        <SecuritySection />
      </LazySection>

      <div className="section-divider" />

      {/* Roadmap Section - Upcoming features */}
      <LazySection placeholderHeight={260}>
        <RoadmapSection />
      </LazySection>

      <div className="section-divider" />

      {/* FAQ Section */}
      <LazySection placeholderHeight={280}>
        <FAQSection />
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
