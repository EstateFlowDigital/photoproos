"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { ConnectAccountDetails } from "@/lib/actions/stripe-connect";
import {
  createConnectAccount,
  createAccountLink,
  createDashboardLink,
} from "@/lib/actions/stripe-connect";
import { updateTaxSettings, updateCurrencySettings } from "@/lib/actions/settings";
import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@/lib/constants";
import Link from "next/link";
import { CurrencyIcon } from "@/components/dashboard";

interface TaxSettings {
  defaultTaxRate: number;
  taxLabel: string;
}

interface PaymentsSettingsClientProps {
  initialStatus: ConnectAccountDetails | null;
  initialTaxSettings: TaxSettings | null;
  initialCurrency: SupportedCurrency;
}

export function PaymentsSettingsClient({
  initialStatus,
  initialTaxSettings,
  initialCurrency,
}: PaymentsSettingsClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConnectAccountDetails | null>(initialStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Tax settings state
  const [taxRate, setTaxRate] = useState(
    (initialTaxSettings?.defaultTaxRate ?? 0).toString()
  );
  const [taxLabel, setTaxLabel] = useState(
    initialTaxSettings?.taxLabel ?? "Sales Tax"
  );
  const [savingTax, setSavingTax] = useState(false);

  // Currency settings state
  const [currency, setCurrency] = useState<SupportedCurrency>(initialCurrency);
  const [savingCurrency, setSavingCurrency] = useState(false);

  // Handle OAuth return messages
  useEffect(() => {
    const success = searchParams?.get("success");
    const refresh = searchParams?.get("refresh");

    if (success === "true") {
      showToast("Stripe account connected successfully!", "success");
      // Refresh to get updated status
      router.refresh();
    } else if (refresh === "true") {
      // User returned from onboarding without completing - refresh status
      router.refresh();
    }
  }, [searchParams]);

  const handleConnect = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await createConnectAccount();
      if (result.success && result.data?.onboardingUrl) {
        window.location.href = result.data.onboardingUrl;
      } else if (!result.success) {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to connect Stripe" });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueOnboarding = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await createAccountLink();
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else if (!result.success) {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to create onboarding link" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await createDashboardLink();
      if (result.success && result.data?.url) {
        window.open(result.data.url, "_blank");
      } else if (!result.success) {
        setMessage({ type: "error", text: result.error });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to open Stripe Dashboard" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTax(true);
    setMessage(null);

    try {
      const rate = parseFloat(taxRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        setMessage({ type: "error", text: "Tax rate must be between 0 and 100" });
        setSavingTax(false);
        return;
      }

      const result = await updateTaxSettings({
        defaultTaxRate: rate,
        taxLabel: taxLabel.trim() || "Sales Tax",
      });

      if (result.success) {
        setMessage({ type: "success", text: "Tax settings saved" });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to save tax settings" });
    } finally {
      setSavingTax(false);
    }
  };

  const handleSaveCurrency = async (newCurrency: SupportedCurrency) => {
    setSavingCurrency(true);
    setMessage(null);

    try {
      const result = await updateCurrencySettings({ currency: newCurrency });

      if (result.success) {
        setCurrency(newCurrency);
        setMessage({ type: "success", text: "Currency updated successfully" });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update currency" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to update currency" });
    } finally {
      setSavingCurrency(false);
    }
  };

  const formatPayoutSchedule = (schedule: ConnectAccountDetails["payoutSchedule"]) => {
    if (!schedule) return "Not configured";

    const { interval, delayDays, weeklyAnchor, monthlyAnchor } = schedule;

    if (interval === "manual") return "Manual payouts";
    if (interval === "daily") return `Daily (${delayDays} day${delayDays !== 1 ? "s" : ""} delay)`;
    if (interval === "weekly" && weeklyAnchor) {
      return `Weekly on ${weeklyAnchor.charAt(0).toUpperCase() + weeklyAnchor.slice(1)}`;
    }
    if (interval === "monthly" && monthlyAnchor) {
      return `Monthly on day ${monthlyAnchor}`;
    }
    return interval;
  };

  return (
    <div className="space-y-6">
      {/* Test Mode Banner */}
      {status?.isTestMode && (
        <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-[var(--warning)]" />
            <div>
              <p className="text-sm font-medium text-[var(--warning)]">
                Test Mode Active
              </p>
              <p className="text-xs text-[var(--warning)]/80">
                You&apos;re using Stripe test keys. Payments will be simulated
                and no real charges will occur.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Banner */}
      {message && (
        <div
          className={cn(
            "rounded-lg border px-4 py-3",
            message.type === "success"
              ? "border-[var(--success)]/30 bg-[var(--success)]/10"
              : "border-[var(--error)]/30 bg-[var(--error)]/10"
          )}
        >
          <p
            className={cn(
              "text-sm",
              message.type === "success"
                ? "text-[var(--success)]"
                : "text-[var(--error)]"
            )}
          >
            {message.text}
          </p>
        </div>
      )}

      {/* Stripe Connect Status */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#635bff]/10">
            <StripeIcon className="h-8 w-8 text-[#635bff]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">
              Stripe Connect
            </h2>
            <p className="text-sm text-foreground-muted">
              {status?.hasAccount
                ? status.isOnboarded
                  ? `Connected as ${status.businessName || status.email || "Unknown"}`
                  : "Connected but setup incomplete"
                : "Connect your Stripe account to accept payments"}
            </p>
          </div>
          {status?.hasAccount && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1",
                status.isOnboarded
                  ? "bg-[var(--success)]/10 text-[var(--success)]"
                  : "bg-[var(--warning)]/10 text-[var(--warning)]"
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  status.isOnboarded
                    ? "bg-[var(--success)]"
                    : "bg-[var(--warning)]"
                )}
              />
              <span className="text-sm font-medium">
                {status.isOnboarded ? "Active" : "Pending"}
              </span>
            </div>
          )}
        </div>

        {status?.hasAccount ? (
          // Connected state
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatusCard
                label="Charges"
                enabled={status.chargesEnabled}
              />
              <StatusCard
                label="Payouts"
                enabled={status.payoutsEnabled}
              />
              <StatusCard
                label="Onboarding"
                enabled={status.detailsSubmitted}
                enabledLabel="Complete"
                disabledLabel="Incomplete"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {status.isOnboarded ? (
                <button
                  onClick={handleOpenDashboard}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner /> : <ExternalLinkIcon className="h-4 w-4" />}
                  Open Stripe Dashboard
                </button>
              ) : (
                <button
                  onClick={handleContinueOnboarding}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--warning)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--warning)]/90 disabled:opacity-50"
                >
                  {loading ? <LoadingSpinner /> : <ArrowRightIcon className="h-4 w-4" />}
                  Complete Setup
                </button>
              )}
            </div>
          </div>
        ) : (
          // Not connected state
          <div className="space-y-4">
            <p className="text-sm text-foreground-muted">
              Click the button below to connect your Stripe account. You&apos;ll
              be redirected to Stripe to complete the setup process.
            </p>

            <button
              onClick={handleConnect}
              disabled={loading}
              className="inline-flex items-center gap-3 rounded-lg bg-[#635bff] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#635bff]/90 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : <StripeIcon className="h-5 w-5" />}
              Connect with Stripe
            </button>
          </div>
        )}
      </div>

      {/* Account Details */}
      {status?.hasAccount && status.isOnboarded && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Account Details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-[var(--background)] p-4">
              <p className="text-xs font-medium text-foreground-muted mb-1">
                Business Type
              </p>
              <p className="text-sm text-foreground capitalize">
                {status.businessType || "—"}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--background)] p-4">
              <p className="text-xs font-medium text-foreground-muted mb-1">
                Business Name
              </p>
              <p className="text-sm text-foreground">
                {status.businessName || "—"}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--background)] p-4">
              <p className="text-xs font-medium text-foreground-muted mb-1">
                Email
              </p>
              <p className="text-sm text-foreground">
                {status.email || "—"}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--background)] p-4">
              <p className="text-xs font-medium text-foreground-muted mb-1">
                Country / Currency
              </p>
              <p className="text-sm text-foreground">
                {status.country || "—"} / {status.defaultCurrency?.toUpperCase() || "—"}
              </p>
            </div>
            {status.accountId && (
              <div className="rounded-lg bg-[var(--background)] p-4 sm:col-span-2">
                <p className="text-xs font-medium text-foreground-muted mb-1">
                  Account ID
                </p>
                <code className="text-sm text-foreground font-mono">
                  {status.accountId}
                </code>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payout Information */}
      {status?.hasAccount && status.isOnboarded && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Payout Settings
              </h2>
              <p className="text-sm text-foreground-muted">
                Manage your payout schedule and bank accounts in Stripe
              </p>
            </div>
            <button
              onClick={handleOpenDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
            >
              <ExternalLinkIcon className="h-3.5 w-3.5" />
              Manage
            </button>
          </div>

          <div className="space-y-4">
            {/* Payout Schedule */}
            <div className="rounded-lg bg-[var(--background)] p-4">
              <p className="text-xs font-medium text-foreground-muted mb-1">
                Payout Schedule
              </p>
              <p className="text-sm text-foreground">
                {formatPayoutSchedule(status.payoutSchedule)}
              </p>
            </div>

            {/* Linked Accounts */}
            {status.externalAccounts && status.externalAccounts.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground-muted mb-2">
                  Linked Accounts
                </p>
                <div className="space-y-2">
                  {status.externalAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex flex-col gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {account.type === "bank_account" ? (
                          <BankIcon className="h-5 w-5 text-foreground-muted" />
                        ) : (
                          <CreditCardIcon className="h-5 w-5 text-foreground-muted" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {account.type === "bank_account"
                              ? account.bankName || "Bank Account"
                              : "Debit Card"}
                            {" ••••"}{account.last4}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            {account.currency.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      {account.isDefault && (
                        <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Onboarding Requirements (if incomplete) */}
      {status?.hasAccount && !status.isOnboarded && status.requirements && (
        <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangleIcon className="h-5 w-5 text-[var(--warning)] mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Action Required
              </h2>
              <p className="text-sm text-foreground-muted">
                Complete the following to start accepting payments
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {status.requirements.pastDue.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--error)] mb-1.5">
                  Past Due
                </p>
                <ul className="space-y-1">
                  {status.requirements.pastDue.map((req) => (
                    <li key={req} className="flex items-center gap-2 text-sm text-foreground">
                      <XCircleIcon className="h-4 w-4 text-[var(--error)]" />
                      {formatRequirement(req)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {status.requirements.currentlyDue.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--warning)] mb-1.5">
                  Currently Due
                </p>
                <ul className="space-y-1">
                  {status.requirements.currentlyDue.map((req) => (
                    <li key={req} className="flex items-center gap-2 text-sm text-foreground">
                      <AlertTriangleIcon className="h-4 w-4 text-[var(--warning)]" />
                      {formatRequirement(req)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={handleContinueOnboarding}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--warning)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--warning)]/90 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner /> : <ArrowRightIcon className="h-4 w-4" />}
            Continue Setup
          </button>
        </div>
      )}

      {/* Platform Fees */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Platform Fees
        </h2>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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

      {/* Tax Settings */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10 border-2 border-[var(--card-border)]">
            <ReceiptIcon className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Tax Settings
            </h2>
            <p className="text-sm text-foreground-muted">
              Configure default tax rates for your invoices
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveTax} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Default Tax Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="0.00"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                  %
                </span>
              </div>
              <p className="mt-1 text-xs text-foreground-muted">
                Applied automatically to new invoices (e.g., 8.25 for 8.25%)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tax Label
              </label>
              <input
                type="text"
                value={taxLabel}
                onChange={(e) => setTaxLabel(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="Sales Tax"
              />
              <p className="mt-1 text-xs text-foreground-muted">
                Label shown on invoices (e.g., &quot;Sales Tax&quot;, &quot;VAT&quot;, &quot;GST&quot;)
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch sm:items-end">
            <button
              type="submit"
              disabled={savingTax}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 sm:w-auto"
            >
              {savingTax ? (
                <>
                  <LoadingSpinner />
                  Saving...
                </>
              ) : (
                "Save Tax Settings"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Currency Settings */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10 border-2 border-[var(--card-border)]">
            <CurrencyIcon className="h-6 w-6 text-[var(--primary)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Currency Settings
            </h2>
            <p className="text-sm text-foreground-muted">
              Set your default currency for invoices and pricing
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Default Currency
            </label>
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => handleSaveCurrency(e.target.value as SupportedCurrency)}
                disabled={savingCurrency}
                className="w-full appearance-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 pr-10 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
              >
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
              {savingCurrency && (
                <div className="absolute right-10 top-1/2 -translate-y-1/2">
                  <LoadingSpinner />
                </div>
              )}
            </div>
            <p className="mt-1.5 text-xs text-foreground-muted">
              This will be used as the default for new invoices, galleries, and pricing displays
            </p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          How Payments Work
        </h2>
        <div className="auto-grid grid-min-240 grid-gap-4">
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

      {/* Payment History Link */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Payment History
            </h2>
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
  );
}

// Helper function to format Stripe requirement fields
function formatRequirement(requirement: string): string {
  const labels: Record<string, string> = {
    "individual.verification.document": "Identity document",
    "individual.verification.additional_document": "Additional ID document",
    "individual.first_name": "First name",
    "individual.last_name": "Last name",
    "individual.dob.day": "Date of birth",
    "individual.dob.month": "Date of birth",
    "individual.dob.year": "Date of birth",
    "individual.address.line1": "Address",
    "individual.address.city": "City",
    "individual.address.state": "State",
    "individual.address.postal_code": "Postal code",
    "individual.ssn_last_4": "SSN last 4 digits",
    "individual.phone": "Phone number",
    "individual.email": "Email address",
    "business_profile.url": "Business website",
    "business_profile.mcc": "Business category",
    "external_account": "Bank account",
    "tos_acceptance.date": "Terms of service",
    "tos_acceptance.ip": "Terms of service",
  };

  return labels[requirement] || requirement.replace(/_/g, " ").replace(/\./g, " → ");
}

// Sub-components

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

// Icons

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
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

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
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

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 1 4 2.5h12A1.5 1.5 0 0 1 17.5 4v12.5a.75.75 0 0 1-1.224.583l-2.276-1.82-2.276 1.82a.75.75 0 0 1-.948 0L8.5 15.263l-2.276 1.82a.75.75 0 0 1-1.224-.583V4Zm4.97 2.28a.75.75 0 0 1 1.06 0L10 7.75l1.47-1.47a.75.75 0 1 1 1.06 1.06L11.06 8.81l1.47 1.47a.75.75 0 0 1-1.06 1.06L10 9.87l-1.47 1.47a.75.75 0 0 1-1.06-1.06l1.47-1.47-1.47-1.47a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function BankIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 6.5A3.5 3.5 0 0 1 4.5 3h11A3.5 3.5 0 0 1 19 6.5v7a3.5 3.5 0 0 1-3.5 3.5h-11A3.5 3.5 0 0 1 1 13.5v-7Zm4.5.5a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1Zm4 0a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1Zm4 0a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1ZM4 12.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5v2h18v-2A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}
