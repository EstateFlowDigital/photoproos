import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Social Media Manager | Coming Soon | PhotoProOS",
  description: "Schedule, publish, and analyze your social media content. Build your photography brand across Instagram, Facebook, Pinterest, and more.",
};

const plannedFeatures = [
  {
    title: "Multi-Platform Publishing",
    description: "Publish to Instagram, Facebook, Pinterest, and LinkedIn from a single dashboard. Post photos, carousels, and Reels.",
    icon: ShareIcon,
    priority: "Launch",
  },
  {
    title: "Content Calendar",
    description: "Visual calendar to plan and schedule your content weeks in advance. Drag and drop to reschedule.",
    icon: CalendarIcon,
    priority: "Launch",
  },
  {
    title: "Gallery-to-Social",
    description: "Turn delivered galleries into social content instantly. Select photos, add captions, and schedule in seconds.",
    icon: ImageIcon,
    priority: "Launch",
  },
  {
    title: "AI Caption Writer",
    description: "Generate engaging captions with AI that learns your voice. Hashtag suggestions included.",
    icon: SparklesIcon,
    priority: "Launch",
  },
  {
    title: "Analytics & Insights",
    description: "Track engagement, follower growth, and best posting times. See which content drives inquiries.",
    icon: ChartIcon,
    priority: "Phase 2",
  },
  {
    title: "Content Library",
    description: "Organize your portfolio and marketing assets. Tag, search, and reuse content across platforms.",
    icon: FolderIcon,
    priority: "Phase 2",
  },
];

const platformSupport = [
  { name: "Instagram", features: ["Feed posts", "Stories", "Reels", "Carousels"], icon: "📸", priority: "Launch" },
  { name: "Facebook", features: ["Page posts", "Stories", "Albums"], icon: "📘", priority: "Launch" },
  { name: "Pinterest", features: ["Pins", "Boards", "Idea Pins"], icon: "📌", priority: "Launch" },
  { name: "LinkedIn", features: ["Posts", "Articles"], icon: "💼", priority: "Phase 2" },
  { name: "TikTok", features: ["Videos"], icon: "🎵", priority: "Phase 3" },
  { name: "Google Business", features: ["Posts", "Photos"], icon: "📍", priority: "Phase 2" },
];

const useCases = [
  {
    title: "Showcase Your Latest Work",
    description: "Automatically create social posts from delivered galleries. Tag clients, add location, and share your best shots.",
    icon: CameraIcon,
  },
  {
    title: "Behind-the-Scenes Content",
    description: "Schedule BTS stories and Reels that give followers a peek into your photography process.",
    icon: FilmIcon,
  },
  {
    title: "Promote Mini Sessions",
    description: "Create and schedule promotional posts for mini sessions with booking links that track conversions.",
    icon: MegaphoneIcon,
  },
  {
    title: "Client Testimonials",
    description: "Turn client reviews into branded graphics and schedule them across your social channels.",
    icon: StarIcon,
  },
];

const roadmapItems = [
  {
    phase: "Q3 2026",
    title: "Launch",
    items: [
      "Instagram, Facebook, Pinterest publishing",
      "Content calendar with drag-and-drop scheduling",
      "Gallery-to-social workflow",
      "AI caption generation",
      "Basic analytics dashboard",
    ],
  },
  {
    phase: "Q4 2026",
    title: "Phase 2",
    items: [
      "LinkedIn and Google Business Profile support",
      "Advanced analytics with inquiry attribution",
      "Content library with tagging",
      "Hashtag performance tracking",
      "Team collaboration features",
    ],
  },
  {
    phase: "Q1 2027",
    title: "Phase 3",
    items: [
      "TikTok integration",
      "AI-powered best time to post",
      "Competitor analysis",
      "Content repurposing suggestions",
      "White-label for studios",
    ],
  },
];

const faqs = [
  {
    question: "Will I still need a separate scheduling tool?",
    answer: "For most photographers, no. We're building comprehensive scheduling, publishing, and analytics that integrates directly with your photography workflow. However, if you have complex agency-level needs, you may still want specialized tools.",
  },
  {
    question: "Can I connect existing social accounts?",
    answer: "Yes, you'll connect your existing Instagram, Facebook, Pinterest, and other accounts through official API integrations. We'll never ask for your passwords.",
  },
  {
    question: "How does gallery-to-social work?",
    answer: "When you deliver a gallery, you can select photos to share on social media with one click. We'll suggest captions, hashtags, and optimal posting times based on your past performance.",
  },
  {
    question: "Will this affect my organic reach?",
    answer: "We use official APIs (like Meta's Creator tools) which means your posts are treated the same as native posts. Many photographers find their engagement increases because they post more consistently.",
  },
  {
    question: "What about Instagram Reels and TikTok?",
    answer: "Reels support will be included at launch. TikTok is planned for Phase 3 as we wait for their API to mature for business use cases.",
  },
];

export default function SocialMediaFeaturePage() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(236, 72, 153, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-500/20 bg-pink-500/5 px-4 py-1.5 text-sm font-medium text-pink-400">
              <ClockIcon className="h-4 w-4" />
              Coming Q3 2026
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Social Media Manager
            </h1>
            <p className="mb-8 text-lg text-foreground-secondary">
              Schedule, publish, and analyze your social media content. Build your photography brand across Instagram, Facebook, Pinterest, and more.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                Join waitlist
              </Link>
              <Link
                href="/features/galleries"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                See what's available now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Notion-style Document Content */}
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        {/* Overview */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-lg">
              📱
            </span>
            Overview
          </h2>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-foreground-secondary">
            <p className="mb-4">
              Social media is essential for modern photographers, but managing multiple platforms is time-consuming. Most social tools don't understand the photography workflow.
            </p>
            <p className="mb-0">
              <strong className="text-foreground">The goal:</strong> Make social media effortless by connecting it directly to your galleries, bookings, and marketing. Turn delivered work into social content with one click.
            </p>
          </div>
        </section>

        {/* Planned Features */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-lg">
              ✨
            </span>
            Planned Features
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {plannedFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10">
                    <feature.icon className="h-5 w-5 text-pink-400" />
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

        {/* Platform Support */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-lg">
              🌐
            </span>
            Platform Support
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platformSupport.map((platform) => (
              <div
                key={platform.name}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{platform.icon}</span>
                    <span className="font-semibold text-foreground">{platform.name}</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      platform.priority === "Launch"
                        ? "bg-[var(--success)]/10 text-[var(--success)]"
                        : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                    )}
                  >
                    {platform.priority}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {platform.features.map((feature) => (
                    <span
                      key={feature}
                      className="rounded bg-[var(--background)] px-2 py-0.5 text-xs text-foreground-muted"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-lg">
              💡
            </span>
            Perfect For
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className="flex gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-500/10">
                  <useCase.icon className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{useCase.title}</h3>
                  <p className="text-sm text-foreground-secondary">{useCase.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Roadmap */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-lg">
              🗺️
            </span>
            Development Roadmap
          </h2>
          <div className="space-y-4">
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
                        ? "bg-pink-500 text-white"
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
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-lg">
              ❓
            </span>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
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
        <section className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-8 text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Help shape this feature</h2>
          <p className="text-foreground-secondary mb-6">
            Which platforms matter most to you? What would make social media management perfect for your photography business?
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:feedback@photoproos.com?subject=Social Media Manager Feedback"
              className="inline-flex items-center gap-2 rounded-lg bg-pink-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-pink-600"
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
      <section className="border-t border-[var(--card-border)] py-16">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
            Available Now
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Photo Galleries",
                description: "Deliver beautiful, branded galleries to your clients",
                href: "/features/galleries",
              },
              {
                title: "Automation",
                description: "Automated workflows for your entire business",
                href: "/features/automation",
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

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.75 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM7.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8.25 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9.75 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM10.5 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM12.75 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM14.25 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 17.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 15.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM15 12.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM16.5 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" />
      <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6ZM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
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

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
      <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3H4.5a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
    </svg>
  );
}

function FilmIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 18.375V5.625Zm1.5 0v1.5c0 .207.168.375.375.375h1.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-1.5A.375.375 0 0 0 3 5.625Zm16.125-.375a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h1.5A.375.375 0 0 0 21 7.125v-1.5a.375.375 0 0 0-.375-.375h-1.5ZM21 9.375A.375.375 0 0 0 20.625 9h-1.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h1.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-1.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h1.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-1.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h1.5a.375.375 0 0 0 .375-.375v-1.5ZM4.875 18.75a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-1.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h1.5ZM3.375 15h1.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-1.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375Zm0-3.75h1.5a.375.375 0 0 0 .375-.375v-1.5A.375.375 0 0 0 4.875 9h-1.5A.375.375 0 0 0 3 9.375v1.5c0 .207.168.375.375.375Zm4.125 0a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9Z" clipRule="evenodd" />
    </svg>
  );
}

function MegaphoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.881 4.345A23.112 23.112 0 0 1 8.25 6H7.5a5.25 5.25 0 0 0-.88 10.427 21.593 21.593 0 0 0 1.378 3.94c.464 1.004 1.674 1.32 2.582.796l.657-.379c.88-.508 1.165-1.593.772-2.468a17.116 17.116 0 0 1-.628-1.607c1.918.258 3.76.75 5.5 1.446A21.727 21.727 0 0 0 18 11.25c0-2.414-.393-4.735-1.119-6.905ZM18.26 3.74a23.22 23.22 0 0 1 1.24 7.51 23.22 23.22 0 0 1-1.24 7.51c-.055.161-.111.322-.17.482a.75.75 0 1 0 1.409.516 24.555 24.555 0 0 0 1.415-6.43 2.992 2.992 0 0 0 .836-2.078c0-.807-.319-1.54-.836-2.078a24.65 24.65 0 0 0-1.415-6.43.75.75 0 1 0-1.409.516c.059.16.116.321.17.483Z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
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
