import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | PhotoProOS",
  description: "Learn about PhotoProOS - the business operating system built by photographers, for photographers.",
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[600px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 70% 10%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)
              `,
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-24 lg:px-[124px] lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
              Our Story
            </span>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Built by photographers,{" "}
              <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] bg-clip-text text-transparent">
                for photographers
              </span>
            </h1>
            <p className="text-lg text-foreground-secondary md:text-xl">
              We know the challenges of running a photography business because we've lived them.
              PhotoProOS was born from frustration with fragmented tools and a vision for something better.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="border-b border-[var(--card-border)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground md:text-4xl">
                Our Mission
              </h2>
              <p className="mb-6 text-lg text-foreground-secondary">
                Professional photographers deserve professional tools. Not cobbled-together solutions
                from five different apps. Not consumer software dressed up for business use.
              </p>
              <p className="text-lg text-foreground-secondary">
                Our mission is simple: give every professional photographer the same operational
                advantage that large studios have, in a single platform that's actually enjoyable to use.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <StatCard number="10k+" label="Photographers" />
              <StatCard number="2M+" label="Photos Delivered" />
              <StatCard number="$50M+" label="Payments Processed" />
              <StatCard number="99.9%" label="Uptime" />
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="border-b border-[var(--card-border)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">
              How It Started
            </h2>
            <div className="space-y-6 text-lg text-foreground-secondary">
              <p>
                It was 2 AM after a long wedding shoot. The photos were edited, but the real work
                was just beginning. Upload to one platform, create invoices in another, update the
                CRM in a third, and hope the payment reminder email actually went out.
              </p>
              <p>
                We were using seven different tools to run one business. Paying for subscriptions
                that didn't talk to each other. Losing leads because they fell through the cracks.
                Missing payments because the follow-up was manual.
              </p>
              <p>
                There had to be a better way. So we built it.
              </p>
              <p>
                PhotoProOS started as an internal tool to run our own photography business. When
                other photographers saw it, they wanted in. What began as a side project became a
                mission to transform how photography businesses operate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="border-b border-[var(--card-border)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              What We Believe
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-foreground-secondary">
              These principles guide every decision we make, from product features to customer support.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ValueCard
              icon={<CameraIcon className="h-6 w-6" />}
              title="Photographers First"
              description="Every feature exists because a photographer needed it. We build tools that solve real problems, not theoretical ones."
            />
            <ValueCard
              icon={<SparklesIcon className="h-6 w-6" />}
              title="Simplicity Over Complexity"
              description="Powerful doesn't have to mean complicated. We obsess over making complex workflows feel effortless."
            />
            <ValueCard
              icon={<ShieldIcon className="h-6 w-6" />}
              title="Your Data, Your Business"
              description="We never sell your data. We never train AI on your photos. Your business information stays yours."
            />
            <ValueCard
              icon={<RocketIcon className="h-6 w-6" />}
              title="Speed Matters"
              description="Slow software is broken software. We invest heavily in performance because your time is valuable."
            />
            <ValueCard
              icon={<HeartIcon className="h-6 w-6" />}
              title="Support That Cares"
              description="Real humans who understand photography answer your questions. Usually within hours, not days."
            />
            <ValueCard
              icon={<TrendingUpIcon className="h-6 w-6" />}
              title="Always Improving"
              description="We ship updates weekly. Your feedback shapes our roadmap. We're building this together."
            />
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="border-b border-[var(--card-border)] py-20 lg:py-28">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Meet the Team
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-foreground-secondary">
              A small, dedicated team of photographers, designers, and engineers building the future of photography business software.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <TeamMember
              name="Alex Chen"
              role="Founder & CEO"
              image="AC"
              description="Former wedding photographer turned software founder. Still shoots occasionally."
            />
            <TeamMember
              name="Sarah Williams"
              role="Head of Product"
              image="SW"
              description="10+ years in real estate photography. Knows every pain point firsthand."
            />
            <TeamMember
              name="Marcus Johnson"
              role="Lead Engineer"
              image="MJ"
              description="Built systems at scale. Obsessed with fast, reliable software."
            />
            <TeamMember
              name="Emily Rodriguez"
              role="Head of Customer Success"
              image="ER"
              description="Former studio manager. Helps photographers get the most from PhotoProOS."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] p-12 text-center lg:p-20">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
            <div className="relative z-10">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                Join thousands of photographers
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-white/80">
                See why photographers are switching to PhotoProOS. Start your free trial today.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-white/90"
                >
                  Start free trial
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Contact sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Components
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
      <p className="mb-1 text-3xl font-bold text-foreground">{number}</p>
      <p className="text-sm text-foreground-secondary">{label}</p>
    </div>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-foreground-secondary">{description}</p>
    </div>
  );
}

function TeamMember({
  name,
  role,
  image,
  description,
}: {
  name: string;
  role: string;
  image: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] text-2xl font-bold text-white">
        {image}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-foreground">{name}</h3>
      <p className="mb-3 text-sm font-medium text-[var(--primary)]">{role}</p>
      <p className="text-sm text-foreground-secondary">{description}</p>
    </div>
  );
}

// Icons
function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 9a3.75 3.75 0 1 0 0 7.5A3.75 3.75 0 0 0 12 9Z" />
      <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 0 1 5.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 0 1-3 3H4.5a3 3 0 0 1-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 0 0 1.11-.71l.822-1.315a2.942 2.942 0 0 1 2.332-1.39ZM6.75 12.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Zm12-1.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z" clipRule="evenodd" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" clipRule="evenodd" />
      <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.22 6.268a.75.75 0 0 1 .968-.431l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.94a.75.75 0 1 1-1.4-.537l1.63-4.251-1.086.484a11.2 11.2 0 0 0-5.45 5.173.75.75 0 0 1-1.199.19L9 12.312l-6.22 6.22a.75.75 0 0 1-1.06-1.061l6.75-6.75a.75.75 0 0 1 1.06 0l3.606 3.606a12.695 12.695 0 0 1 5.68-4.974l1.086-.483-4.251-1.632a.75.75 0 0 1-.431-.968Z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}
