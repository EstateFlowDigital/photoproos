import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guides & Tutorials | PhotoProOS",
  description: "Step-by-step guides and tutorials to help you get the most out of PhotoProOS.",
};

const guides = [
  {
    title: "Getting Started with PhotoProOS",
    description: "Learn the basics of setting up your account, creating your first gallery, and delivering to clients.",
    category: "Getting Started",
    difficulty: "Beginner",
    duration: "15 min",
    slug: "getting-started",
    featured: true,
  },
  {
    title: "Creating Your First Client Gallery",
    description: "A complete walkthrough of uploading photos, customizing your gallery, and sharing with clients.",
    category: "Galleries",
    difficulty: "Beginner",
    duration: "10 min",
    slug: "first-gallery",
    featured: true,
  },
  {
    title: "Setting Up Payment Processing",
    description: "Connect Stripe, configure pricing, and start accepting payments for your galleries.",
    category: "Payments",
    difficulty: "Beginner",
    duration: "8 min",
    slug: "payment-setup",
    featured: true,
  },
  {
    title: "Managing Client Relationships",
    description: "Organize your clients, track communications, and build lasting relationships.",
    category: "Clients",
    difficulty: "Intermediate",
    duration: "12 min",
    slug: "client-management",
  },
  {
    title: "Customizing Your Brand",
    description: "Add your logo, set brand colors, and create a professional client experience.",
    category: "Branding",
    difficulty: "Beginner",
    duration: "10 min",
    slug: "brand-customization",
  },
  {
    title: "Automating Gallery Delivery",
    description: "Set up automatic delivery notifications and reminders to save time.",
    category: "Automation",
    difficulty: "Intermediate",
    duration: "15 min",
    slug: "automated-delivery",
  },
  {
    title: "Understanding Analytics",
    description: "Track gallery views, downloads, and payments to grow your business.",
    category: "Analytics",
    difficulty: "Intermediate",
    duration: "12 min",
    slug: "analytics-guide",
  },
  {
    title: "Team Collaboration",
    description: "Invite team members, set permissions, and collaborate on projects.",
    category: "Team",
    difficulty: "Intermediate",
    duration: "10 min",
    slug: "team-collaboration",
  },
  {
    title: "Advanced Pricing Strategies",
    description: "Create packages, tiered pricing, and maximize your revenue per client.",
    category: "Payments",
    difficulty: "Advanced",
    duration: "20 min",
    slug: "advanced-pricing",
  },
];

const categories = [
  { name: "All Guides", count: 9 },
  { name: "Getting Started", count: 3 },
  { name: "Galleries", count: 2 },
  { name: "Payments", count: 2 },
  { name: "Clients", count: 1 },
  { name: "Automation", count: 1 },
];

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Beginner":
      return "text-green-400 bg-green-400/10";
    case "Intermediate":
      return "text-blue-400 bg-blue-400/10";
    case "Advanced":
      return "text-purple-400 bg-purple-400/10";
    default:
      return "text-foreground-secondary bg-[var(--background-tertiary)]";
  }
}

export default function GuidesPage() {
  const featuredGuides = guides.filter((g) => g.featured);
  const allGuides = guides.filter((g) => !g.featured);

  return (
    <main className="relative min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-16 lg:px-[124px] lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Guides & Tutorials
            </h1>
            <p className="text-lg text-foreground-secondary">
              Step-by-step guides to help you get the most out of PhotoProOS
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="border-b border-[var(--card-border)] py-6">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    category.name === "All Guides"
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="search"
                placeholder="Search guides..."
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none sm:w-64"
              />
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Guides */}
      <section className="py-12">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-xl font-semibold text-foreground">Start Here</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {featuredGuides.map((guide, index) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--border-hover)]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-2xl font-bold text-[var(--primary)]">
                  {index + 1}
                </div>
                <h3 className="mb-2 font-semibold text-foreground group-hover:text-[var(--primary)]">
                  {guide.title}
                </h3>
                <p className="mb-4 text-sm text-foreground-secondary">
                  {guide.description}
                </p>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                    {guide.difficulty}
                  </span>
                  <span className="text-xs text-foreground-muted">{guide.duration}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Guides */}
      <section className="pb-16 lg:pb-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-8 text-xl font-semibold text-foreground">All Guides</h2>
          <div className="grid gap-4">
            {allGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 transition-all hover:border-[var(--border-hover)]"
              >
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="rounded-full bg-[var(--background-tertiary)] px-3 py-1 text-xs font-medium text-foreground-secondary">
                      {guide.category}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty}
                    </span>
                  </div>
                  <h3 className="mb-1 font-semibold text-foreground group-hover:text-[var(--primary)]">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary">
                    {guide.description}
                  </p>
                </div>
                <div className="ml-6 flex items-center gap-4">
                  <span className="text-sm text-foreground-muted">{guide.duration}</span>
                  <ArrowIcon className="h-5 w-5 text-foreground-muted transition-transform group-hover:translate-x-1 group-hover:text-[var(--primary)]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Help CTA */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Can't find what you're looking for?
          </h2>
          <p className="mb-8 text-foreground-secondary">
            Our support team is here to help you succeed.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/help"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              Visit Help Center
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}
