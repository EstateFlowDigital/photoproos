import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Food & Hospitality Photography | PhotoProOS",
  description: "Restaurant, hotel, and culinary photography with menu integration and marketing deliverables.",
};

const features = [
  { title: "Menu Integration", description: "Organize photos by menu item for easy restaurant use." },
  { title: "Marketing Deliverables", description: "Export in formats perfect for social media and websites." },
  { title: "Color Accuracy", description: "Ensure food looks appetizing with accurate color profiles." },
  { title: "Multi-Platform Export", description: "Export for Instagram, website, and print menus." },
  { title: "Recipe Organization", description: "Tag and organize by dish, ingredient, or category." },
  { title: "Brand Consistency", description: "Maintain visual consistency across all deliverables." },
];

export default function FoodIndustryPage() {
  return (
    <main className="relative min-h-screen bg-background" data-element="industries-food-page">
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="industries-food-hero">
        <div className="absolute inset-0 z-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2" style={{ background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(251, 146, 60, 0.12) 0%, transparent 50%)` }} />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/5 px-4 py-1.5 text-sm font-medium text-orange-400">For Food Photographers</span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">Food & Hospitality</h1>
            <p className="mb-8 text-lg text-foreground-secondary">Restaurant, hotel, and culinary photography with menu integration and marketing deliverables.</p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">Start free trial</Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">View pricing</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="industries-food-features-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="industries-food-features-heading">Built for food & hospitality</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-element="industries-food-features-grid">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-foreground-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="industries-food-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="industries-food-cta-heading">Ready to elevate your food photography?</h2>
          <p className="mb-8 text-foreground-secondary">Join professional food photographers using PhotoProOS.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90" data-element="industries-food-cta-btn">Start free trial</Link>
        </div>
      </section>
    </main>
  );
}
