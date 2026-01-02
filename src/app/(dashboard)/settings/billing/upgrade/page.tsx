export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { UpgradeForm } from "./upgrade-form";

const plans = [
  {
    id: "pro",
    name: "Pro",
    price: 4900,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    features: [
      "50 GB storage",
      "Unlimited galleries",
      "Unlimited clients",
      "3 team members",
      "Custom branding",
      "Contracts & e-signatures",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: 9900,
    priceId: process.env.STRIPE_STUDIO_PRICE_ID || "",
    features: [
      "500 GB storage",
      "Unlimited galleries",
      "Unlimited clients",
      "Unlimited team members",
      "Custom branding",
      "Contracts & e-signatures",
      "Advanced analytics",
      "API access",
      "White-label options",
      "Dedicated support",
    ],
  },
];

export default async function UpgradePage() {
  const auth = await getAuthContext();

  if (!auth) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
    select: {
      id: true,
      name: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });

  if (!organization) {
    redirect("/dashboard");
  }

  // If already subscribed, redirect to billing page
  if (organization.stripeSubscriptionId) {
    redirect("/settings/billing");
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/settings" className="hover:text-foreground transition-colors">
          Settings
        </Link>
        <span>/</span>
        <Link href="/settings/billing" className="hover:text-foreground transition-colors">
          Billing
        </Link>
        <span>/</span>
        <span className="text-foreground">Upgrade</span>
      </div>

      <PageHeader
        title="Upgrade Your Plan"
        subtitle="Unlock more features and grow your photography business"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative rounded-2xl border p-6 transition-all",
              plan.popular
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--card-border)] bg-[var(--card)]"
            )}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-6">
                <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">{plan.name}</h2>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-foreground">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-foreground-muted">/month</span>
              </div>
              <p className="mt-1 text-sm text-foreground-muted">
                Billed monthly. Cancel anytime.
              </p>
            </div>

            <ul className="mb-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckIcon className="h-5 w-5 shrink-0 text-[var(--success)]" />
                  <span className="text-sm text-foreground-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <UpgradeForm
              planId={plan.id}
              planName={plan.name}
              priceId={plan.priceId}
              organizationId={organization.id}
              isPopular={plan.popular}
            />
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Frequently Asked Questions
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium text-foreground">Can I cancel anytime?</h4>
            <p className="mt-1 text-sm text-foreground-muted">
              Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground">What payment methods do you accept?</h4>
            <p className="mt-1 text-sm text-foreground-muted">
              We accept all major credit cards including Visa, Mastercard, and American Express via Stripe.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground">Can I change plans later?</h4>
            <p className="mt-1 text-sm text-foreground-muted">
              Absolutely! You can upgrade or downgrade your plan at any time from the billing settings.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground">Is there a free trial?</h4>
            <p className="mt-1 text-sm text-foreground-muted">
              New accounts start with a 14-day free trial on the Pro plan. No credit card required.
            </p>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="text-center">
        <Link
          href="/settings/billing"
          className="text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          ← Back to Billing
        </Link>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
