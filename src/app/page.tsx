import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { LogosSection } from "@/components/sections/logos";
import { HowItWorksSection } from "@/components/sections/how-it-works";
import { NoiseToKnowledgeSection } from "@/components/sections/noise-to-knowledge";
import { FeaturesSection } from "@/components/sections/features";
import { UseCasesSection } from "@/components/sections/use-cases";
import { IntegrationsSection } from "@/components/sections/integrations";
import { PricingSection } from "@/components/sections/pricing";
import { TestimonialsSection } from "@/components/sections/testimonials";
import { SecuritySection } from "@/components/sections/security";
import { RoadmapSection } from "@/components/sections/roadmap";
import { FAQSection } from "@/components/sections/faq";
import { CTASection } from "@/components/sections/cta";
import { ScrollProgress, BackToTop } from "@/components/ui/scroll-progress";

export default function Home() {
  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-background">
      {/* Scroll Progress Indicator */}
      <ScrollProgress color="linear-gradient(90deg, #3b82f6, #8b5cf6)" height={2} />

      {/* Back to Top Button */}
      <BackToTop showAfter={400} />

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

      {/* Integrations Section - Third-party apps */}
      <IntegrationsSection />

      <div className="section-divider" />

      {/* Pricing Section - Plans and pricing */}
      <PricingSection />

      <div className="section-divider" />

      {/* Testimonials Section - Customer stories */}
      <TestimonialsSection />

      <div className="section-divider" />

      {/* Security Section - Trust and compliance */}
      <SecuritySection />

      <div className="section-divider" />

      {/* Roadmap Section - Upcoming features */}
      <RoadmapSection />

      <div className="section-divider" />

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section - Final conversion */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
