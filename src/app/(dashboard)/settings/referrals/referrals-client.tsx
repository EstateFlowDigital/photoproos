"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ReferralProgram,
  Referrer,
  Referral,
  upsertReferralProgram,
  toggleReferralProgram,
} from "@/lib/actions/referrals";
import { toast } from "sonner";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard";

interface Client {
  id: string;
  name: string | null;
  email: string;
}

interface Stats {
  totalReferrers: number;
  activeReferrers: number;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalRewardsEarned: number;
  conversionRate: number;
}

interface ReferralsClientProps {
  initialProgram: ReferralProgram | null;
  initialReferrers: Referrer[];
  initialReferrals: Referral[];
  stats: Stats | null;
  clients: Client[];
}

export function ReferralsClient({
  initialProgram,
  initialReferrers,
  initialReferrals,
  stats,
}: ReferralsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [program, setProgram] = useState(initialProgram);
  const [referrers] = useState(initialReferrers);
  const [referrals] = useState(initialReferrals);
  const [activeTab, setActiveTab] = useState<"settings" | "referrers" | "referrals">("settings");

  const handleSaveProgram = async (formData: FormData) => {
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      rewardType: formData.get("rewardType") as "percentage" | "fixed" | "credit" | "gift_card",
      rewardValue: parseFloat(formData.get("rewardValue") as string) || 10,
      minimumOrderCents: parseInt(formData.get("minimumOrderCents") as string) || undefined,
      expirationDays: parseInt(formData.get("expirationDays") as string) || undefined,
      termsAndConditions: formData.get("termsAndConditions") as string,
      isActive: program?.isActive ?? false,
    };

    startTransition(async () => {
      const result = await upsertReferralProgram(data);
      if (result.success && result.data) {
        setProgram(result.data);
        toast.success("Referral program saved");
        router.refresh();
      } else if (!result.success) {
        toast.error(result.error || "Failed to save program");
      }
    });
  };

  const handleToggleProgram = async () => {
    startTransition(async () => {
      const result = await toggleReferralProgram();
      if (result.success) {
        setProgram((prev) => (prev ? { ...prev, isActive: !prev.isActive } : null));
        toast.success("Program status updated");
        router.refresh();
      } else if (!result.success) {
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Program"
        subtitle="Set up and manage your referral program"
      />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-[var(--background-tertiary)] p-1 w-full sm:w-fit">
        <button
          onClick={() => setActiveTab("settings")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "settings"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab("referrers")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "referrers"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Referrers
          {referrers.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)]/10 px-1.5 text-xs text-[var(--primary)]">
              {referrers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("referrals")}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "referrals"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Referrals
          {referrals.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--primary)]/10 px-1.5 text-xs text-[var(--primary)]">
              {referrals.length}
            </span>
          )}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="auto-grid grid-min-200 grid-gap-4">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm text-foreground-muted">Active Referrers</p>
            <p className="text-2xl font-semibold text-foreground">{stats.activeReferrers}</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm text-foreground-muted">Total Referrals</p>
            <p className="text-2xl font-semibold text-foreground">{stats.totalReferrals}</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm text-foreground-muted">Conversion Rate</p>
            <p className="text-2xl font-semibold text-foreground">{stats.conversionRate}%</p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <p className="text-sm text-foreground-muted">Total Earned</p>
            <p className="text-2xl font-semibold text-foreground">${(stats.totalRewardsEarned / 100).toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-medium text-foreground">Program Status</h3>
                <p className="text-sm text-foreground-muted">Enable or disable your referral program</p>
              </div>
              <button
                onClick={handleToggleProgram}
                disabled={isPending}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  program?.isActive ? "bg-[var(--primary)]" : "bg-[var(--background-tertiary)]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    program?.isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <form action={handleSaveProgram} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Program Name</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={program?.name || "Referral Program"}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                />
              </div>

              <Select
                label="Reward Type"
                name="rewardType"
                defaultValue={program?.rewardType || "percentage"}
                options={[
                  { value: "percentage", label: "Percentage of Sale" },
                  { value: "fixed", label: "Fixed Amount" },
                  { value: "credit", label: "Account Credit" },
                  { value: "gift_card", label: "Gift Card" },
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Reward Value</label>
                <input
                  name="rewardValue"
                  type="number"
                  defaultValue={program?.rewardValue || 10}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </div>
        )}

        {activeTab === "referrers" && (
          <div className="space-y-4">
            <p className="text-foreground-muted">Manage your referral partners</p>
            {referrers.length === 0 ? (
              <p className="text-sm text-foreground-muted">No referrers yet</p>
            ) : (
              <div className="space-y-2">
                {referrers.map((referrer) => (
                  <div key={referrer.id} className="flex flex-col gap-2 rounded-lg bg-[var(--background-tertiary)] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{referrer.name}</p>
                      <p className="text-sm text-foreground-muted">{referrer.email}</p>
                    </div>
                    <div className="text-sm text-foreground-muted">
                      Code: {referrer.referralCode}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "referrals" && (
          <div className="space-y-4">
            <p className="text-foreground-muted">Track your referrals</p>
            {referrals.length === 0 ? (
              <p className="text-sm text-foreground-muted">No referrals yet</p>
            ) : (
              <div className="space-y-2">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex flex-col gap-2 rounded-lg bg-[var(--background-tertiary)] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{referral.referredName}</p>
                      <p className="text-sm text-foreground-muted">{referral.referredEmail}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      referral.status === "completed" ? "bg-[var(--success)]/10 text-[var(--success)]" :
                      referral.status === "pending" ? "bg-[var(--warning)]/10 text-[var(--warning)]" :
                      "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                    }`}>
                      {referral.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
