import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Architecture & Interiors Photography | PhotoProOS",
  description: "High-end property and design portfolio delivery for architects, interior designers, and design publications.",
};

const features = [
  { title: "Portfolio Galleries", description: "Showcase projects with stunning full-screen galleries." },
  { title: "Project Organization", description: "Organize by project, client, or design category." },
  { title: "High-Resolution Delivery", description: "Deliver print-ready files for publications and awards." },
  { title: "Before/After Comparisons", description: "Show renovation transformations beautifully." },
  { title: "Publication-Ready Exports", description: "Export in formats required by design magazines." },
  { title: "Client Collaboration", description: "Allow architects and designers to select and download." },
];

export default function ArchitectureIndustryPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-[var(--card-border)]">
        <div className="absolute inset-0 z-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2" style={{ background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--ai)]/20 bg-[var(--ai)]/5 px-4 py-1.5 text-sm font-medium text-[var(--ai)]">For Architecture Photographers</span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Architecture & Interiors</h1>
            <p className="mb-8 text-lg text-foreground-secondary">High-end property and design portfolio delivery for architects and designers.</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">Start free trial</Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">View pricing</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Built for architecture & design</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--card-border)] py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">Ready to showcase your architectural work?</h2>
          <p className="mb-8 text-foreground-secondary">Join professional architecture photographers using PhotoProOS.</p>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">Start free trial</Link>
        </div>
      </section>
    </main>
  );
}
