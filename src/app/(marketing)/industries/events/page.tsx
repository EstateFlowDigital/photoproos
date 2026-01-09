import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Events & Corporate Photography | PhotoProOS",
  description: "Conferences, galas, and corporate event coverage with easy attendee access and download options.",
};

const features = [
  { title: "Fast Turnaround", description: "Deliver same-day or next-day galleries for urgent events." },
  { title: "Attendee Access", description: "Let attendees find and download their own photos easily." },
  { title: "Face Recognition Search", description: "AI-powered search to help attendees find themselves." },
  { title: "Social Sharing", description: "Easy sharing to social media with event hashtags." },
  { title: "Bulk Downloads", description: "Allow organizers to download entire events at once." },
  { title: "Event Branding", description: "Customize galleries with event logos and sponsor branding." },
];

export default function EventsIndustryPage() {
  return (
    <main className="relative min-h-screen bg-background" data-element="industries-events-page">
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="industries-events-hero">
        <div className="absolute inset-0 z-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2" style={{ background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.12) 0%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--success)]/20 bg-[var(--success)]/5 px-4 py-1.5 text-sm font-medium text-[var(--success)]">For Event Photographers</span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Events & Corporate</h1>
            <p className="mb-8 text-lg text-foreground-secondary">Conferences, galas, and corporate event coverage with easy attendee access.</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">Start free trial</Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">View pricing</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="industries-events-features-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="industries-events-features-heading">Built for event photography</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-element="industries-events-features-grid">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="industries-events-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="industries-events-cta-heading">Ready to streamline your event photography?</h2>
          <p className="mb-8 text-foreground-secondary">Join professional event photographers using PhotoProOS.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90" data-element="industries-events-cta-btn">Start free trial</Link>
        </div>
      </section>
    </main>
  );
}
