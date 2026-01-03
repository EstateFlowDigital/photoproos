export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getBillingStats, getInvoiceHistory } from "@/lib/actions/settings";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: ["2 GB storage", "5 galleries/month", "25 clients", "1 team member"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 4900,
    features: ["50 GB storage", "Unlimited galleries", "Unlimited clients", "3 team members", "Custom branding", "Contracts"],
    popular: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: 9900,
    features: ["500 GB storage", "Unlimited galleries", "Unlimited clients", "Unlimited team", "Advanced analytics", "API access"],
  },
];

export default async function BillingSettingsPage() {
  const [billingStats, invoiceData] = await Promise.all([
    getBillingStats(),
    getInvoiceHistory(10),
  ]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const currentPlan = billingStats?.plan || "free";
  const usage = billingStats?.usage || {
    storage: { used: 0, limit: 2 },
    galleries: { used: 0, limit: 5 },
    clients: { used: 0, limit: 25 },
    members: { used: 0, limit: 1 },
  };

  const planPrices: Record<string, number> = {
    free: 0,
    pro: 4900,
    studio: 9900,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Subscription"
        subtitle="Manage your plan and payment methods"
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Settings
          </Link>
        }
      />

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Current Plan</h2>
                <span className="rounded-full bg-[var(--success)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--success)]">
                  Active
                </span>
              </div>
              <p className="mt-1 text-3xl font-bold text-foreground capitalize">
                {currentPlan} <span className="text-lg font-normal text-foreground-muted">/ {formatCurrency(planPrices[currentPlan] || 0)}/mo</span>
              </p>
              {billingStats?.memberSince && (
                <p className="mt-2 text-sm text-foreground-muted">
                  Member since: {new Date(billingStats.memberSince).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
            {billingStats?.stripeSubscriptionId ? (
              <button className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">
                Manage Subscription
              </button>
            ) : (
              <Link
                href="/settings/billing/upgrade"
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>

        {/* Usage */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Current Usage</h2>
          <div className="auto-grid grid-min-200 grid-gap-4">
            <UsageCard
              label="Storage"
              used={usage.storage.used}
              limit={usage.storage.limit}
              unit="GB"
            />
            <UsageCard
              label="Galleries"
              used={usage.galleries.used}
              limit={usage.galleries.limit}
            />
            <UsageCard
              label="Clients"
              used={usage.clients.used}
              limit={usage.clients.limit}
            />
            <UsageCard
              label="Team Members"
              used={usage.members.used}
              limit={usage.members.limit}
            />
          </div>
        </div>

        {/* Plans Comparison */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Available Plans</h2>
          <div className="auto-grid grid-min-240 grid-gap-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-xl border p-5 transition-all",
                    isCurrent
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                  )}
                >
                  {plan.popular && (
                    <span className="inline-flex rounded-full bg-[var(--primary)] px-2.5 py-0.5 text-xs font-medium text-white mb-3">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
                    {plan.price > 0 && <span className="text-sm font-normal text-foreground-muted">/mo</span>}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground-secondary">
                        <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={cn(
                      "mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                      isCurrent
                        ? "border border-[var(--primary)] text-[var(--primary)] cursor-default"
                        : "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                    )}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
          {billingStats?.stripeCustomerId ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-[var(--background)]">
                  <CreditCardIcon className="h-8 w-8 text-foreground-muted" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Payment method on file</p>
                  <p className="text-sm text-foreground-muted">Managed through Stripe</p>
                </div>
              </div>
              <button className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">
                Update
              </button>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-[var(--card-border)] p-6 text-center">
              <CreditCardIcon className="mx-auto h-8 w-8 text-foreground-muted" />
              <p className="mt-2 text-sm text-foreground">No payment method on file</p>
              <p className="mt-1 text-xs text-foreground-muted">
                Add a payment method when you upgrade to a paid plan
              </p>
            </div>
          )}
        </div>

        {/* Invoice History */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Invoice History</h2>
          {invoiceData.invoices.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
              <table className="w-full min-w-[640px]">
                <thead className="border-b border-[var(--card-border)] bg-[var(--background)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">Invoice</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {invoiceData.invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-[var(--background-hover)]">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{invoice.number}</p>
                        <p className="text-xs text-foreground-muted truncate max-w-[200px]">{invoice.description}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {invoice.created.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <InvoiceStatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {invoice.hostedInvoiceUrl && (
                            <a
                              href={invoice.hostedInvoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[var(--primary)] hover:underline"
                            >
                              View
                            </a>
                          )}
                          {invoice.invoicePdf && (
                            <a
                              href={invoice.invoicePdf}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-foreground-muted hover:text-foreground"
                            >
                              PDF
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-[var(--card-border)] p-8 text-center">
              <ReceiptIcon className="mx-auto h-8 w-8 text-foreground-muted" />
              <p className="mt-2 text-sm text-foreground">No invoices yet</p>
              <p className="mt-1 text-xs text-foreground-muted">
                Invoices will appear here when you have a paid subscription
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UsageCard({ label, used, limit, unit = "" }: { label: string; used: number; limit: number; unit?: string }) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : (used / limit) * 100;
  const isNearLimit = percentage > 80;

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
      <p className="text-sm text-foreground-muted">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">
        {used}{unit} <span className="text-sm font-normal text-foreground-muted">/ {isUnlimited ? "∞" : `${limit}${unit}`}</span>
      </p>
      {!isUnlimited && (
        <div className="mt-2 h-1.5 rounded-full bg-[var(--background-secondary)]">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isNearLimit ? "bg-[var(--warning)]" : "bg-[var(--primary)]"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 15.5 2h-11ZM6 5.75a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 5.75Zm.75 2.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5ZM6 11.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function InvoiceStatusBadge({ status }: { status: string | null }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    paid: { label: "Paid", className: "bg-[var(--success)]/10 text-[var(--success)]" },
    open: { label: "Open", className: "bg-[var(--warning)]/10 text-[var(--warning)]" },
    draft: { label: "Draft", className: "bg-foreground-muted/10 text-foreground-muted" },
    void: { label: "Void", className: "bg-foreground-muted/10 text-foreground-muted" },
    uncollectible: { label: "Uncollectible", className: "bg-[var(--error)]/10 text-[var(--error)]" },
  };

  const config = statusConfig[status || "draft"] || { label: status || "Unknown", className: "bg-foreground-muted/10 text-foreground-muted" };

  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  );
}
