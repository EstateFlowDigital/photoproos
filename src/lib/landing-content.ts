// ============================================
// LANDING PAGE A/B TEST CONTENT VARIANTS
// ============================================
// This file contains all content variations for A/B testing
// Each variant has the same structure but different messaging

export interface HeroContent {
  badge: {
    highlight: string;
    suffix: string;
  };
  headline: {
    muted: string;
    emphasis: string;
  };
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
  socialProof: string[];
}

export interface MetricsContent {
  tagline: string;
  mainStat: {
    value: number;
    suffix: string;
    label: string;
  };
  supportingStats: Array<{
    value: string;
    label: string;
    description: string;
    icon: "dollar" | "gallery" | "shield";
    color: "blue" | "purple" | "green";
  }>;
}

export interface IndustryContent {
  badge: string;
  headline: {
    muted: string;
    emphasis: string;
  };
  subheadline: string;
}

export interface ClientExperienceContent {
  badge: string;
  headline: string;
  subheadline: string;
  stat: {
    value: string;
    label: string;
  };
  steps: Array<{
    title: string;
    description: string;
  }>;
}

export interface IntegrationContent {
  badge: string;
  headline: string;
  subheadline: string;
  features: string[];
}

export interface CtaContent {
  badge: string;
  headline: {
    muted: string;
    emphasis: string;
  };
  subheadline: string;
  primaryCta: string;
  secondaryCta: string;
}

export interface LandingPageContent {
  variant: "a" | "b" | "c";
  name: string;
  description: string;
  hero: HeroContent;
  metrics: MetricsContent;
  industry: IndustryContent;
  clientExperience: ClientExperienceContent;
  integration: IntegrationContent;
  cta: CtaContent;
}

// ============================================
// VARIANT A: Tool Consolidation (Replace 10 Tools)
// Best for: Photographers frustrated with multiple subscriptions
// ============================================
export const variantA: LandingPageContent = {
  variant: "a",
  name: "Tool Consolidation",
  description: "Emphasizes replacing 10+ tools with one unified platform",
  hero: {
    badge: {
      highlight: "One platform",
      suffix: "Replace 10+ tools",
    },
    headline: {
      muted: "Stop juggling 10 tools.",
      emphasis: "Run everything from one dashboard.",
    },
    subheadline:
      "Galleries, CRM, invoicing, contracts, scheduling, email marketing—all in one platform built specifically for photographers. Not another generic tool.",
    primaryCta: "Replace Your Stack",
    secondaryCta: "See What It Replaces",
    socialProof: [
      "Replaces $500+/mo in tools",
      "One login, one dashboard",
      "Photography-specific",
    ],
  },
  metrics: {
    tagline: "Results that speak for themselves",
    mainStat: {
      value: 15,
      suffix: "hrs/week",
      label: "Average time saved on admin tasks",
    },
    supportingStats: [
      {
        value: "$2.4M+",
        label: "Processed Monthly",
        description: "In photographer payments",
        icon: "dollar",
        color: "blue",
      },
      {
        value: "50,000+",
        label: "Galleries Delivered",
        description: "Photos shared with clients",
        icon: "gallery",
        color: "purple",
      },
      {
        value: "99.9%",
        label: "Uptime",
        description: "Enterprise-grade reliability",
        icon: "shield",
        color: "green",
      },
    ],
  },
  industry: {
    badge: "Built for your workflow",
    headline: {
      muted: "Purpose-built for",
      emphasis: "every photography vertical",
    },
    subheadline:
      "Select your specialty to see exactly how much time you'll save",
  },
  clientExperience: {
    badge: "Client self-service",
    headline: "Clients help themselves. You get paid faster.",
    subheadline:
      "A beautiful, branded portal where clients view, select, and pay for photos—without a single email from you.",
    stat: {
      value: "0",
      label: "Client emails required",
    },
    steps: [
      { title: "Gallery link sent", description: "Automatic delivery" },
      { title: "Client browses & favorites", description: "Self-service selection" },
      { title: "Payment collected instantly", description: "Stripe checkout" },
      { title: "Downloads unlocked", description: "Automatic access" },
    ],
  },
  integration: {
    badge: "Powered by Stripe",
    headline: "Get paid the moment clients download",
    subheadline:
      "No more chasing invoices. Payments process automatically when clients access their photos.",
    features: [
      "Accept all major cards, Apple Pay, Google Pay",
      "Instant payouts to your bank account",
      "Automatic invoice generation",
      "Payment plans and deposit support",
      "100% collection rate for platform users",
    ],
  },
  cta: {
    badge: "Join 2,500+ photographers",
    headline: {
      muted: "Ready to get back",
      emphasis: "15 hours every week?",
    },
    subheadline:
      "Start free and see the difference in your first week. No credit card required.",
    primaryCta: "Start Saving Time",
    secondaryCta: "Calculate Your Savings",
  },
};

// ============================================
// VARIANT B: Outcome-Focused (Time Behind the Lens)
// Best for: Photographers who want to focus on their craft
// ============================================
export const variantB: LandingPageContent = {
  variant: "b",
  name: "Outcome-Focused",
  description: "Emphasizes spending less time on admin, more time shooting",
  hero: {
    badge: {
      highlight: "For photographers",
      suffix: "Who'd rather be shooting",
    },
    headline: {
      muted: "Spend less time on admin.",
      emphasis: "More time behind the lens.",
    },
    subheadline:
      "Automate everything that keeps you from doing what you love. From booking to delivery to marketing—PhotoProOS handles it all.",
    primaryCta: "Get Your Time Back",
    secondaryCta: "See How It Works",
    socialProof: [
      "15+ hours saved weekly",
      "Automated workflows",
      "AI-powered features",
    ],
  },
  metrics: {
    tagline: "What photographers were dealing with before PhotoProOS",
    mainStat: {
      value: 0,
      suffix: "",
      label: "Missed payments with PhotoProOS",
    },
    supportingStats: [
      {
        value: "15+ hrs",
        label: "Saved Weekly",
        description: "On admin & follow-ups",
        icon: "dollar",
        color: "blue",
      },
      {
        value: "100%",
        label: "Collection Rate",
        description: "When using pay-to-unlock",
        icon: "gallery",
        color: "purple",
      },
      {
        value: "< 2 min",
        label: "Client Checkout",
        description: "From gallery to payment",
        icon: "shield",
        color: "green",
      },
    ],
  },
  industry: {
    badge: "Works for your specialty",
    headline: {
      muted: "Whether you shoot",
      emphasis: "real estate, events, or portraits",
    },
    subheadline:
      "Same pain points, same solution—tailored to your specific workflow",
  },
  clientExperience: {
    badge: "No more back-and-forth",
    headline: "Your clients will actually love the process",
    subheadline:
      "A simple, beautiful experience that makes paying for photos feel effortless—not like pulling teeth.",
    stat: {
      value: "98%",
      label: "Client satisfaction",
    },
    steps: [
      { title: "They get a link", description: "Not another email chain" },
      { title: "They browse instantly", description: "No account required" },
      { title: "They pay in 2 clicks", description: "Apple Pay, cards, all of it" },
      { title: "They download immediately", description: "Done. Happy client." },
    ],
  },
  integration: {
    badge: "No more manual invoicing",
    headline: "Payment happens automatically. Every time.",
    subheadline:
      "Stripe handles the transaction the moment clients want their photos. You wake up to money in your account.",
    features: [
      "Clients can't download without paying",
      "Automatic receipts and invoices",
      "Deposits and payment plans built-in",
      "Instant bank transfers",
      "Never send another payment reminder",
    ],
  },
  cta: {
    badge: "Thousands have made the switch",
    headline: {
      muted: "Tired of chasing payments?",
      emphasis: "Let them come to you.",
    },
    subheadline:
      "See why photographers are switching from spreadsheets and manual invoicing to PhotoProOS.",
    primaryCta: "Get Paid Automatically",
    secondaryCta: "See How It Works",
  },
};

// ============================================
// VARIANT C: Business OS (Feature/Pillar-Focused)
// Best for: Photographers who want a complete platform
// ============================================
export const variantC: LandingPageContent = {
  variant: "c",
  name: "Business OS",
  description: "The complete platform positioning with 5 pillars: Operate, Deliver, Get Paid, Grow, Automate",
  hero: {
    badge: {
      highlight: "Complete platform",
      suffix: "Photography-specific, all-in-one",
    },
    headline: {
      muted: "The Business OS for",
      emphasis: "Professional Photographers",
    },
    subheadline:
      "From booking to delivery to marketing—one platform that handles it all. Operate. Deliver. Get Paid. Grow. Automate.",
    primaryCta: "Start Free",
    secondaryCta: "Take the Tour",
    socialProof: [
      "Replaces 10+ tools",
      "6 photography verticals",
      "AI-powered automation",
    ],
  },
  metrics: {
    tagline: "Trusted by professionals across every vertical",
    mainStat: {
      value: 2500,
      suffix: "+",
      label: "Photographers run their business on PhotoProOS",
    },
    supportingStats: [
      {
        value: "$2.4M+",
        label: "Monthly Volume",
        description: "Professional-grade scale",
        icon: "dollar",
        color: "blue",
      },
      {
        value: "6",
        label: "Industries",
        description: "Purpose-built workflows",
        icon: "gallery",
        color: "purple",
      },
      {
        value: "99.9%",
        label: "Uptime SLA",
        description: "Your business, always on",
        icon: "shield",
        color: "green",
      },
    ],
  },
  industry: {
    badge: "Your industry, your way",
    headline: {
      muted: "Purpose-built for",
      emphasis: "professionals like you",
    },
    subheadline:
      "From real estate to weddings to commercial—tools designed for how you actually work",
  },
  clientExperience: {
    badge: "White-label client experience",
    headline: "Give clients an experience that matches your brand",
    subheadline:
      "A polished, professional portal that elevates your business and makes you look as good as your photos.",
    stat: {
      value: "4.9",
      label: "Average client rating",
    },
    steps: [
      { title: "Branded gallery delivery", description: "Your logo, your colors" },
      { title: "Curated viewing experience", description: "Portfolio-quality presentation" },
      { title: "Seamless checkout", description: "Professional payment flow" },
      { title: "Instant fulfillment", description: "Automatic delivery" },
    ],
  },
  integration: {
    badge: "Enterprise-grade payments",
    headline: "Payment infrastructure that scales with you",
    subheadline:
      "The same payment technology trusted by the world's biggest companies, built into your photography workflow.",
    features: [
      "PCI-compliant payment processing",
      "Multi-currency support",
      "Advanced invoicing with PO support",
      "Customizable payment terms (Net 30/60)",
      "Detailed financial reporting",
    ],
  },
  cta: {
    badge: "Ready to go pro?",
    headline: {
      muted: "Your business deserves",
      emphasis: "professional-grade tools.",
    },
    subheadline:
      "Join photographers who've upgraded from scattered tools to one unified platform.",
    primaryCta: "Upgrade Your Business",
    secondaryCta: "Schedule a Demo",
  },
};

// ============================================
// EXPORT ALL VARIANTS
// ============================================
export const landingPageVariants = {
  a: variantA,
  b: variantB,
  c: variantC,
} as const;

export type LandingPageVariant = keyof typeof landingPageVariants;

export function getLandingPageContent(variant: LandingPageVariant): LandingPageContent {
  return landingPageVariants[variant];
}
