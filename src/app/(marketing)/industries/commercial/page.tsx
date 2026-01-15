import { Metadata } from "next";
import Link from "next/link";
import { getIndustryContent } from "@/lib/marketing/content";

// Dynamic metadata from CMS
export async function generateMetadata(): Promise<Metadata> {
  const { meta } = await getIndustryContent("commercial");
  return {
    title: meta.title || "Commercial Photography | PhotoProOS",
    description: meta.description || "Brand photography, product shots, and corporate imaging delivered with professional polish.",
    openGraph: meta.ogImage ? { images: [meta.ogImage] } : undefined,
  };
}

const features = [
  { title: "High-Volume Delivery", description: "Handle hundreds of product shots per session with ease." },
  { title: "Brand Asset Management", description: "Organize photos by campaign, product line, or client." },
  { title: "Usage Rights Tracking", description: "Track licensing and usage rights for each image." },
  { title: "Team Collaboration", description: "Work with art directors and marketing teams seamlessly." },
  { title: "Color-Accurate Proofing", description: "ICC profile support for accurate color representation." },
  { title: "Bulk Export Options", description: "Export in multiple formats and sizes for different uses." },
];

export default function CommercialIndustryPage() {
  return (
    <main className="relative min-h-screen bg-background" data-element="industries-commercial-page">
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="industries-commercial-hero">
        <div className="absolute inset-0 z-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2" style={{ background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249, 115, 22, 0.12) 0%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--warning)]/20 bg-[var(--warning)]/5 px-4 py-1.5 text-sm font-medium text-[var(--warning)]">For Commercial Photographers</span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Commercial Photography</h1>
            <p className="mb-8 text-lg text-foreground-secondary">Brand photography, product shots, and corporate imaging delivered with professional polish.</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">Start free trial</Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">View pricing</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="industries-commercial-features-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="industries-commercial-features-heading">Built for commercial workflows</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-element="industries-commercial-features-grid">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="industries-commercial-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="industries-commercial-cta-heading">Ready to elevate your commercial photography business?</h2>
          <p className="mb-8 text-foreground-secondary">Join professional commercial photographers using PhotoProOS.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90" data-element="industries-commercial-cta-btn">Start free trial</Link>
        </div>
      </section>
    </main>
  );
}
