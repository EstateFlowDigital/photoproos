export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getConnectAccountStatus } from "@/lib/actions/stripe-connect";
import { ConnectButton } from "./connect-button";

export default async function PaymentsSettingsPage() {
  const connectStatus = await getConnectAccountStatus();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Settings"
        subtitle="Connect your Stripe account to accept payments from clients"
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
        {/* Stripe Connect Status */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#635bff]/10">
                <StripeIcon className="h-6 w-6 text-[#635bff]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">Stripe Connect</h2>
                  {connectStatus.success && connectStatus.data?.isConnected ? (
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        connectStatus.data.chargesEnabled
                          ? "bg-[var(--success)]/10 text-[var(--success)]"
                          : "bg-[var(--warning)]/10 text-[var(--warning)]"
                      )}
                    >
                      {connectStatus.data.chargesEnabled ? "Active" : "Pending"}
                    </span>
                  ) : (
                    <span className="rounded-full bg-[var(--foreground-muted)]/10 px-2.5 py-0.5 text-xs font-medium text-foreground-muted">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-foreground-muted max-w-md">
                  {connectStatus.success && connectStatus.data?.isConnected
                    ? connectStatus.data.chargesEnabled
                      ? "Your Stripe account is connected and ready to accept payments."
                      : "Your Stripe account is connected but requires additional verification."
                    : "Connect your Stripe account to accept payments from clients for galleries and invoices."}
                </p>
              </div>
            </div>
            <ConnectButton
              isConnected={connectStatus.success && connectStatus.data?.isConnected}
              chargesEnabled={connectStatus.success && connectStatus.data?.chargesEnabled}
            />
          </div>

          {/* Account Details */}
          {connectStatus.success && connectStatus.data?.isConnected && (
            <div className="mt-6 grid gap-4 border-t border-[var(--card-border)] pt-6 sm:grid-cols-3">
              <StatusCard
                label="Charges"
                enabled={connectStatus.data.chargesEnabled}
              />
              <StatusCard
                label="Payouts"
                enabled={connectStatus.data.payoutsEnabled}
              />
              <StatusCard
                label="Onboarding"
                enabled={connectStatus.data.detailsSubmitted}
                enabledLabel="Complete"
                disabledLabel="Incomplete"
              />
            </div>
          )}
        </div>

        {/* How it Works */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">How Payments Work</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <StepCard
              number={1}
              title="Connect Stripe"
              description="Link your Stripe account to receive payments. It only takes a few minutes."
            />
            <StepCard
              number={2}
              title="Set Gallery Prices"
              description="Add a price to any gallery to require payment before clients can access photos."
            />
            <StepCard
              number={3}
              title="Get Paid"
              description="When clients pay, funds go directly to your Stripe account (minus platform fees)."
            />
          </div>
        </div>

        {/* Platform Fees */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Platform Fees</h2>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Transaction Fee</p>
                <p className="text-sm text-foreground-muted">
                  Applied to each successful gallery payment
                </p>
              </div>
              <p className="text-2xl font-bold text-foreground">5%</p>
            </div>
            <p className="mt-3 text-xs text-foreground-muted">
              Note: Stripe also charges their standard processing fees (2.9% + $0.30 per transaction).
            </p>
          </div>
        </div>

        {/* Payout Settings */}
        {connectStatus.success && connectStatus.data?.isConnected && connectStatus.data.chargesEnabled && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Payout Settings</h2>
            <p className="text-sm text-foreground-muted mb-4">
              Manage your payout schedule and bank account in Stripe Dashboard.
            </p>
            <ConnectButton
              isConnected={true}
              chargesEnabled={true}
              variant="dashboard"
            />
          </div>
        )}

        {/* Payment History Link */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Payment History</h2>
              <p className="text-sm text-foreground-muted">
                View all payments received for your galleries
              </p>
            </div>
            <Link
              href="/payments"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              View Payments
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  label,
  enabled,
  enabledLabel = "Enabled",
  disabledLabel = "Disabled",
}: {
  label: string;
  enabled?: boolean;
  enabledLabel?: string;
  disabledLabel?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
      <p className="text-sm text-foreground-muted">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        {enabled ? (
          <>
            <CheckCircleIcon className="h-5 w-5 text-[var(--success)]" />
            <span className="font-medium text-foreground">{enabledLabel}</span>
          </>
        ) : (
          <>
            <XCircleIcon className="h-5 w-5 text-[var(--warning)]" />
            <span className="font-medium text-foreground">{disabledLabel}</span>
          </>
        )}
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-white">
        {number}
      </div>
      <h3 className="mt-3 font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-foreground-muted">{description}</p>
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
    </svg>
  );
}
