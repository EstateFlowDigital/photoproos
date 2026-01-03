"use client";

import { useState, useTransition } from "react";
import { PageHeader } from "@/components/dashboard";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import {
  sendReferralInvite,
  applyReward,
  type PlatformReferrerProfile,
  type PlatformReferralStats,
  type PlatformReferralItem,
  type PlatformReward,
} from "@/lib/actions/platform-referrals";

// =============================================================================
// Types
// =============================================================================

interface MyReferralsClientProps {
  profile: PlatformReferrerProfile | null;
  stats: PlatformReferralStats | null;
  referrals: PlatformReferralItem[];
  rewards: PlatformReward[];
  referralLink: string | null;
}

// =============================================================================
// Component
// =============================================================================

export function MyReferralsClient({
  profile,
  stats,
  referrals,
  rewards,
  referralLink,
}: MyReferralsClientProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"overview" | "referrals" | "rewards">("overview");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      showToast("Referral link copied!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  const handleSendInvite = () => {
    if (!inviteEmail) {
      showToast("Please enter an email address", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await sendReferralInvite(inviteEmail, inviteName || undefined);
        if (result.success) {
          showToast("Invitation sent!", "success");
          setInviteEmail("");
          setInviteName("");
          setShowInviteForm(false);
          window.location.reload();
        } else {
          showToast(result.error, "error");
        }
      } catch {
        showToast("Failed to send invitation", "error");
      }
    });
  };

  const handleApplyReward = (rewardId: string) => {
    startTransition(async () => {
      try {
        const result = await applyReward(rewardId);
        if (result.success) {
          showToast("Reward applied to your account!", "success");
          window.location.reload();
        } else {
          showToast(result.error, "error");
        }
      } catch {
        showToast("Failed to apply reward", "error");
      }
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
      signed_up: "bg-[var(--primary)]/10 text-[var(--primary)]",
      subscribed: "bg-[var(--success)]/10 text-[var(--success)]",
      churned: "bg-[var(--error)]/10 text-[var(--error)]",
      expired: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
    };
    const labels: Record<string, string> = {
      pending: "Pending",
      signed_up: "Signed Up",
      subscribed: "Subscribed",
      churned: "Churned",
      expired: "Expired",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  const pendingRewards = rewards.filter((r) => !r.isApplied);
  const appliedRewards = rewards.filter((r) => r.isApplied);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refer & Earn"
        subtitle="Invite photographers to ListingLens and earn rewards"
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

      {/* Hero Section with Referral Link */}
      <div className="rounded-xl border border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Share your referral link
            </h2>
            <p className="text-sm text-foreground-muted">
              Earn <span className="font-medium text-[var(--success)]">$25</span> for every photographer who subscribes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 md:flex-none">
              <input
                type="text"
                readOnly
                value={referralLink || ""}
                className="w-full md:w-80 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm text-foreground font-mono"
              />
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-[var(--primary)]/20 flex flex-wrap gap-2">
          <button
            onClick={() => setShowInviteForm(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <MailIcon className="h-4 w-4" />
            Send Email Invite
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=I%20use%20ListingLens%20to%20run%20my%20photography%20business.%20Check%20it%20out!&url=${encodeURIComponent(referralLink || "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <TwitterIcon className="h-4 w-4" />
            Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink || "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <LinkedInIcon className="h-4 w-4" />
            Share on LinkedIn
          </a>
        </div>
      </div>

      {/* Email Invite Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Send Referral Invite
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="photographer@example.com"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1">
                  Their Name (optional)
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setShowInviteForm(false)}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={isPending}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {isPending ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                <UsersIcon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalReferrals}</p>
                <p className="text-xs text-foreground-muted">Total Referrals</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
                <CheckCircleIcon className="h-5 w-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.subscribedReferrals}</p>
                <p className="text-xs text-foreground-muted">Converted</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
                <CurrencyIcon className="h-5 w-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.pendingCreditCents)}
                </p>
                <p className="text-xs text-foreground-muted">Pending Credits</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ai)]/10">
                <TrendingUpIcon className="h-5 w-5 text-[var(--ai)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
                <p className="text-xs text-foreground-muted">Conversion Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        <div className="flex gap-1 p-1 border-b border-[var(--card-border)] bg-[var(--background)]">
          {(["overview", "referrals", "rewards"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-[var(--card)] text-foreground shadow-sm"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "referrals" && `Referrals (${referrals.length})`}
              {tab === "rewards" && `Rewards (${pendingRewards.length})`}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">How It Works</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-lg font-bold mb-3">
                      1
                    </div>
                    <h4 className="font-medium text-foreground mb-1">Share Your Link</h4>
                    <p className="text-sm text-foreground-muted">
                      Send your unique referral link to photographers you know
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-lg font-bold mb-3">
                      2
                    </div>
                    <h4 className="font-medium text-foreground mb-1">They Sign Up</h4>
                    <p className="text-sm text-foreground-muted">
                      They get an extended 21-day trial and 20% off their first month
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--success)]/10 text-[var(--success)] text-lg font-bold mb-3">
                      3
                    </div>
                    <h4 className="font-medium text-foreground mb-1">You Earn $25</h4>
                    <p className="text-sm text-foreground-muted">
                      When they subscribe, you get $25 credit towards your subscription
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Code */}
              {profile && (
                <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-6">
                  <h3 className="text-sm font-medium text-foreground-muted mb-2">Your Referral Code</h3>
                  <p className="text-2xl font-bold font-mono text-foreground">{profile.referralCode}</p>
                </div>
              )}
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === "referrals" && (
            <div>
              {referrals.length === 0 ? (
                <div className="text-center py-12">
                  <UsersIcon className="mx-auto h-12 w-12 text-foreground-muted opacity-50" />
                  <p className="mt-4 text-foreground-muted">No referrals yet</p>
                  <p className="text-sm text-foreground-muted mt-1">
                    Start sharing your link to see referrals here
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--card-border)]">
                        <th className="text-left text-sm font-medium text-foreground-muted px-4 py-3">Person</th>
                        <th className="text-left text-sm font-medium text-foreground-muted px-4 py-3">Status</th>
                        <th className="text-left text-sm font-medium text-foreground-muted px-4 py-3">Signed Up</th>
                        <th className="text-left text-sm font-medium text-foreground-muted px-4 py-3">Subscribed</th>
                        <th className="text-left text-sm font-medium text-foreground-muted px-4 py-3">Expires</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)]">
                      {referrals.map((referral) => (
                        <tr key={referral.id} className="hover:bg-[var(--background)]">
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">
                              {referral.referredName || "—"}
                            </p>
                            <p className="text-sm text-foreground-muted">{referral.referredEmail}</p>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(referral.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground-muted">
                            {formatDate(referral.signedUpAt)}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground-muted">
                            {formatDate(referral.subscribedAt)}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground-muted">
                            {formatDate(referral.expiresAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Rewards Tab */}
          {activeTab === "rewards" && (
            <div className="space-y-6">
              {/* Pending Rewards */}
              {pendingRewards.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-muted mb-3">
                    Pending Rewards ({pendingRewards.length})
                  </h3>
                  <div className="space-y-3">
                    {pendingRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/5"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {formatCurrency(reward.valueCents)} Account Credit
                          </p>
                          <p className="text-sm text-foreground-muted">{reward.description}</p>
                          {reward.expiresAt && (
                            <p className="text-xs text-foreground-muted mt-1">
                              Expires {formatDate(reward.expiresAt)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleApplyReward(reward.id)}
                          disabled={isPending}
                          className="rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applied Rewards */}
              {appliedRewards.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-muted mb-3">
                    Applied Rewards ({appliedRewards.length})
                  </h3>
                  <div className="space-y-2">
                    {appliedRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--background)]"
                      >
                        <div>
                          <p className="text-sm text-foreground">
                            {formatCurrency(reward.valueCents)} Credit Applied
                          </p>
                          <p className="text-xs text-foreground-muted">{reward.description}</p>
                        </div>
                        <p className="text-xs text-foreground-muted">
                          Applied {formatDate(reward.appliedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingRewards.length === 0 && appliedRewards.length === 0 && (
                <div className="text-center py-12">
                  <GiftIcon className="mx-auto h-12 w-12 text-foreground-muted opacity-50" />
                  <p className="mt-4 text-foreground-muted">No rewards yet</p>
                  <p className="text-sm text-foreground-muted mt-1">
                    Rewards appear here when your referrals subscribe
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Icons
// =============================================================================

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
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

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 18a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
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

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 0 0-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152Z" />
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-6a.75.75 0 0 1 .75.75v.316a3.78 3.78 0 0 1 1.653.713c.426.33.744.74.925 1.2a.75.75 0 0 1-1.395.55 1.35 1.35 0 0 0-.447-.563 2.187 2.187 0 0 0-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 1 1-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 1 1 1.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 0 1-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.097-2.096a3.78 3.78 0 0 1 1.653-.713V4.75A.75.75 0 0 1 10 4Z" clipRule="evenodd" />
    </svg>
  );
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z" clipRule="evenodd" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M13.75 3A2.75 2.75 0 0 0 11 5.75c0 .463.116.898.32 1.28l-1.32-.013-.003-.001a.75.75 0 0 0 0 1.5h3.75a1.5 1.5 0 0 0 0-3H13.5a1.25 1.25 0 1 1 0-2.5h.25a.75.75 0 0 0 0-1.5h-.25a2.73 2.73 0 0 0-.75.103ZM6.5 8.511V8.5a.75.75 0 0 1 0 .011ZM9.978 7.016H9.75a1.25 1.25 0 0 1 0-2.5h.25a.75.75 0 0 1 0 1.5H9.75a.25.25 0 0 0 0 .5h.228v.5ZM5.25 8.5A1.5 1.5 0 0 1 6.75 7h2.5a.75.75 0 0 1 0 1.5h-2.5a.25.25 0 0 0 0 .5h2.5a.75.75 0 0 1 0 1.5h-2.5a1.5 1.5 0 0 1 0-3V7Z" clipRule="evenodd" />
      <path d="M2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10ZM2.75 12.75a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h14.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75H2.75Z" />
    </svg>
  );
}
