import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Affiliate Program | PhotoProOS",
  description: "Earn 20% recurring commission by referring photographers to PhotoProOS.",
};

const benefits = [
  {
    title: "20% Recurring Commission",
    description: "Earn 20% of every payment from customers you refer, for as long as they stay subscribed.",
    icon: "💰",
  },
  {
    title: "30-Day Cookie Window",
    description: "Get credit for referrals up to 30 days after they click your link.",
    icon: "🍪",
  },
  {
    title: "Monthly Payouts",
    description: "Receive payouts on the 15th of each month via PayPal or bank transfer.",
    icon: "📅",
  },
  {
    title: "Real-Time Dashboard",
    description: "Track clicks, conversions, and earnings in your affiliate dashboard.",
    icon: "📊",
  },
  {
    title: "Marketing Materials",
    description: "Access banners, email templates, and social media content to promote PhotoProOS.",
    icon: "🎨",
  },
  {
    title: "Dedicated Support",
    description: "Get personalized support from our affiliate team to maximize your earnings.",
    icon: "🎯",
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Sign Up",
    description: "Apply for our affiliate program. Approval usually takes 1-2 business days.",
  },
  {
    step: 2,
    title: "Share Your Link",
    description: "Get your unique affiliate link and share it with your audience.",
  },
  {
    step: 3,
    title: "Earn Commission",
    description: "When someone signs up through your link, you earn 20% of their subscription.",
  },
  {
    step: 4,
    title: "Get Paid",
    description: "Receive monthly payouts directly to your PayPal or bank account.",
  },
];

const faqs = [
  {
    question: "Who can join the affiliate program?",
    answer: "Anyone can apply! We welcome photographers, content creators, bloggers, and anyone who can reach our target audience of professional photographers.",
  },
  {
    question: "How much can I earn?",
    answer: "You earn 20% of every payment from customers you refer. For example, if you refer a customer on the Pro plan ($23/month), you'd earn $4.60/month for as long as they stay subscribed.",
  },
  {
    question: "When do I get paid?",
    answer: "Payouts are processed on the 15th of each month for the previous month's earnings. The minimum payout threshold is $50.",
  },
  {
    question: "Can I promote PhotoProOS on social media?",
    answer: "Yes! We provide marketing materials including social media templates, banners, and suggested captions. Just follow our brand guidelines.",
  },
];

export default function AffiliatesPage() {
  return (
    <main className="relative min-h-screen bg-background" data-element="affiliates-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="affiliates-hero">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-4 py-1.5 text-sm font-medium text-green-400">
              Affiliate Program
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Earn 20% recurring commission
            </h1>
            <p className="mb-8 text-lg text-foreground-secondary">
              Join our affiliate program and earn money by recommending PhotoProOS to photographers. Get paid monthly for as long as your referrals stay subscribed.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contact?subject=affiliate-application"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                Apply Now
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24" data-element="affiliates-benefits-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="affiliates-benefits-heading">Why become an affiliate?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-element="affiliates-benefits-grid">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
                data-element={`affiliates-benefit-${benefit.title.toLowerCase().replace(/\s+/g, '-').replace(/%/g, '')}`}
              >
                <div className="mb-4 text-3xl">{benefit.icon}</div>
                <h3 className="mb-2 font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-sm text-foreground-secondary">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="affiliates-how-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="affiliates-how-heading">How it works</h2>
          <div className="mx-auto max-w-3xl">
            <div className="space-y-8" data-element="affiliates-how-steps">
              {howItWorks.map((item, index) => (
                <div key={item.step} className="flex gap-6" data-element={`affiliates-step-${item.step}`}>
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold text-white">
                      {item.step}
                    </div>
                    {index < howItWorks.length - 1 && (
                      <div className="mt-2 h-full w-px bg-[var(--card-border)]"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="mb-2 font-semibold text-foreground">{item.title}</h3>
                    <p className="text-foreground-secondary">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="affiliates-calculator-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="affiliates-calculator-heading">
              Calculate your earnings
            </h2>
            <p className="mb-8 text-foreground-secondary">
              See how much you could earn by referring photographers to PhotoProOS.
            </p>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8">
              <div className="mb-8 text-center">
                <div className="text-sm text-foreground-muted">If you refer 10 Pro subscribers</div>
                <div className="mt-2 text-4xl font-bold text-[var(--primary)]">$46/month</div>
                <div className="text-sm text-foreground-secondary">$552/year in recurring income</div>
              </div>
              <div className="grid gap-4 text-sm md:grid-cols-3">
                <div className="rounded-lg bg-[var(--background-tertiary)] p-4 text-center">
                  <div className="text-foreground-muted">5 Pro referrals</div>
                  <div className="mt-1 font-semibold text-foreground">$23/mo</div>
                </div>
                <div className="rounded-lg bg-[var(--background-tertiary)] p-4 text-center">
                  <div className="text-foreground-muted">10 Pro referrals</div>
                  <div className="mt-1 font-semibold text-foreground">$46/mo</div>
                </div>
                <div className="rounded-lg bg-[var(--background-tertiary)] p-4 text-center">
                  <div className="text-foreground-muted">25 Pro referrals</div>
                  <div className="mt-1 font-semibold text-foreground">$115/mo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="affiliates-faq-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground" data-element="affiliates-faq-heading">Frequently asked questions</h2>
          <div className="mx-auto max-w-3xl space-y-6" data-element="affiliates-faq-list">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6"
                data-element={`affiliates-faq-item-${index}`}
              >
                <h3 className="mb-2 font-semibold text-foreground">{faq.question}</h3>
                <p className="text-foreground-secondary">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--card-border)] py-16 lg:py-24" data-element="affiliates-cta-section">
        <div className="mx-auto max-w-[1512px] px-6 text-center lg:px-[124px]">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl" data-element="affiliates-cta-heading">
            Ready to start earning?
          </h2>
          <p className="mb-8 text-foreground-secondary" data-element="affiliates-cta-description">
            Join our affiliate program today and start earning recurring commissions.
          </p>
          <Link
            href="/contact?subject=affiliate-application"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            data-element="affiliates-cta-btn"
          >
            Apply for Affiliate Program
          </Link>
        </div>
      </section>
    </main>
  );
}
