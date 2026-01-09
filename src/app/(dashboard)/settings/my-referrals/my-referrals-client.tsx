"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import {
  LoadingSpinner,
  ArrowLeftIcon,
  CopyIcon,
  CheckIcon,
  MailIcon,
  UsersIcon as UsersGlyph,
  CheckCircleIcon,
  GiftIcon,
  SparklesIcon,
} from "@/components/ui/settings-icons";
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

export type LeaderboardEntry = {
  rank: number;
  name: string;
  successfulReferrals: number;
  totalEarnedCents: number;
};

interface MyReferralsClientProps {
  profile: PlatformReferrerProfile | null;
  stats: PlatformReferralStats | null;
  referrals: PlatformReferralItem[];
  rewards: PlatformReward[];
  referralLink: string | null;
  leaderboard: LeaderboardEntry[];
}

// Milestone definitions
const MILESTONES = [
  { count: 1, reward: "$25", title: "First Referral", icon: "🎯" },
  { count: 5, reward: "Free Month", title: "Rising Star", icon: "⭐" },
  { count: 10, reward: "$50 Bonus", title: "Referral Pro", icon: "🚀" },
  { count: 25, reward: "Exclusive Swag", title: "Ambassador", icon: "👑" },
  { count: 50, reward: "Lifetime 20% Off", title: "Legend", icon: "🏆" },
];

// =============================================================================
// Component
// =============================================================================

export function MyReferralsClient({
  profile,
  stats,
  referrals,
  rewards,
  referralLink,
  leaderboard,
}: MyReferralsClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"overview" | "referrals" | "rewards" | "leaderboard">("overview");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeSize, setQRCodeSize] = useState(200);
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
          router.refresh();
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
          router.refresh();
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
      pending: "bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20",
      signed_up: "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20",
      subscribed: "bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20",
      churned: "bg-[var(--error)]/10 text-[var(--error)] border-[var(--error)]/20",
      expired: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)] border-[var(--foreground-muted)]/20",
    };
    const labels: Record<string, string> = {
      pending: "Pending",
      signed_up: "Signed Up",
      subscribed: "Subscribed",
      churned: "Churned",
      expired: "Expired",
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || ""}`}>
        {labels[status] || status}
      </span>
    );
  };

  const pendingRewards = rewards.filter((r) => !r.isApplied);
  const appliedRewards = rewards.filter((r) => r.isApplied);
  const successfulCount = stats?.subscribedReferrals || 0;

  // Calculate current milestone progress
  const currentMilestone = MILESTONES.find((m) => successfulCount < m.count);
  const previousMilestone = MILESTONES.filter((m) => successfulCount >= m.count).pop();
  const progressToNext = currentMilestone
    ? ((successfulCount - (previousMilestone?.count || 0)) /
       (currentMilestone.count - (previousMilestone?.count || 0))) * 100
    : 100;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Refer & Earn"
        subtitle="Invite photographers to PhotoProOS and earn rewards"
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
        }
      />

      {/* Hero Section with Referral Link */}
      <div className="rounded-xl border border-[var(--primary)]/30 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--primary)]/5 to-transparent p-6 relative overflow-hidden">
        {/* Decorative gradient circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[var(--success)]/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🎁</span>
              <h2 className="text-xl font-semibold text-foreground">
                Share & Earn $25
              </h2>
            </div>
            <p className="text-sm text-foreground-muted max-w-md">
              Share your unique link. When they subscribe, you get{" "}
              <span className="font-semibold text-[var(--success)]">$25 account credit</span>.
              They get an extended trial + 20% off!
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex-1 md:flex-none">
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={referralLink || ""}
                  className="w-full md:w-80 rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-4 pr-12 py-2.5 text-sm text-foreground font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-8 rounded-md bg-[var(--background-hover)] text-foreground-muted hover:text-foreground transition-colors"
                >
                  {copied ? <CheckIcon className="h-4 w-4 text-[var(--success)]" /> : <CopyIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={handleCopyLink}
              className="hidden md:flex"
            >
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative mt-5 pt-5 border-t border-[var(--primary)]/20 flex flex-wrap gap-2">
          <button
            onClick={() => setShowInviteForm(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-[var(--card)] hover:shadow-md"
          >
            <MailIcon className="h-4 w-4" />
            Email Invite
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=I%20use%20PhotoProOS%20to%20run%20my%20photography%20business%20-%20stunning%20galleries%2C%20automated%20payments%2C%20and%20more!%20Try%20it%20with%20my%20link%20for%2021%20days%20free%20%2B%2020%25%20off%3A&url=${encodeURIComponent(referralLink || "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-[var(--card)] hover:shadow-md"
          >
            <TwitterIcon className="h-4 w-4" />
            Share on X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink || "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-[var(--card)] hover:shadow-md"
          >
            <LinkedInIcon className="h-4 w-4" />
            LinkedIn
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Check out PhotoProOS - the all-in-one platform for photographers! Get 21 days free + 20% off with my link: ${referralLink}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-[var(--card)] hover:shadow-md"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
          <button
            onClick={() => setShowQRCode(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)]/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-[var(--card)] hover:shadow-md"
          >
            <QRCodeIcon className="h-4 w-4" />
            QR Code
          </button>
        </div>
      </div>

      {/* Email Invite Modal */}
      <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
        <DialogContent size="sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 border-2 border-[var(--card-border)]">
                <MailIcon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <DialogTitle>Send Referral Invite</DialogTitle>
                <DialogDescription>
                  They&apos;ll receive a personalized email with your link
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  Email Address <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="photographer@example.com"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                  Their Name <span className="text-foreground-muted">(optional)</span>
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteForm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSendInvite}
              disabled={isPending || !inviteEmail}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner className="h-4 w-4" />
                  Sending...
                </span>
              ) : (
                "Send Invite"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRCode && !!referralLink} onOpenChange={setShowQRCode}>
        <DialogContent size="sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10 border-2 border-[var(--card-border)]">
                <QRCodeIcon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <DialogTitle>Your Referral QR Code</DialogTitle>
                <DialogDescription>
                  Perfect for events & networking
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogBody>
            {/* QR Code Display */}
            <div className="flex justify-center py-6 bg-white rounded-lg mb-4">
              {referralLink && <QRCodeCanvas referralLink={referralLink} size={qrCodeSize} />}
            </div>

            {/* Size Selector */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xs text-foreground-muted">Size:</span>
              {[150, 200, 300].map((size) => (
                <button
                  key={size}
                  onClick={() => setQRCodeSize(size)}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    qrCodeSize === size
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--background)] text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>

            <p className="text-center text-xs text-foreground-muted">
              Scan to visit: {referralLink}
            </p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowQRCode(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const canvas = document.querySelector("#qr-code-canvas") as HTMLCanvasElement;
                if (canvas) {
                  const link = document.createElement("a");
                  link.download = `referral-qr-${profile?.referralCode || "code"}.png`;
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                  showToast("QR code downloaded!", "success");
                }
              }}
            >
              Download QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:shadow-lg hover:shadow-[var(--primary)]/5 hover:border-[var(--primary)]/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10">
                <UsersGlyph className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalReferrals}</p>
                <p className="text-xs text-foreground-muted">Total Invited</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:shadow-lg hover:shadow-[var(--success)]/5 hover:border-[var(--success)]/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--success)]/20 to-[var(--success)]/10">
                <CheckCircleIcon className="h-5 w-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.subscribedReferrals}</p>
                <p className="text-xs text-foreground-muted">Converted</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:shadow-lg hover:shadow-[var(--warning)]/5 hover:border-[var(--warning)]/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--warning)]/20 to-[var(--warning)]/10">
                <CurrencyIcon className="h-5 w-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.pendingCreditCents)}
                </p>
                <p className="text-xs text-foreground-muted">Available Credit</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:shadow-lg hover:shadow-[var(--ai)]/5 hover:border-[var(--ai)]/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ai)]/20 to-[var(--ai)]/10">
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

      {/* Milestone Progress */}
      {currentMilestone && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentMilestone.icon}</span>
              <div>
                <h3 className="font-semibold text-foreground">Next Milestone: {currentMilestone.title}</h3>
                <p className="text-sm text-foreground-muted">
                  {currentMilestone.count - successfulCount} more referral{currentMilestone.count - successfulCount !== 1 ? "s" : ""} to unlock{" "}
                  <span className="font-medium text-[var(--success)]">{currentMilestone.reward}</span>
                </p>
              </div>
            </div>
            <div className="sm:text-right">
              <p className="text-2xl font-bold text-foreground">{successfulCount}/{currentMilestone.count}</p>
              <p className="text-xs text-foreground-muted">Referrals</p>
            </div>
          </div>
          <div className="relative h-3 rounded-full bg-[var(--background)] overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--success)] transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            />
          </div>

          {/* Milestone badges */}
          <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
            {MILESTONES.map((milestone) => {
              const isCompleted = successfulCount >= milestone.count;
              const isCurrent = milestone === currentMilestone;
              return (
                <div
                  key={milestone.count}
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg border transition-all ${
                    isCompleted
                      ? "border-[var(--success)]/30 bg-[var(--success)]/5"
                      : isCurrent
                        ? "border-[var(--primary)]/30 bg-[var(--primary)]/5"
                        : "border-[var(--card-border)] bg-[var(--background)] opacity-50"
                  }`}
                >
                  <span className={`text-xl ${isCompleted ? "" : "grayscale"}`}>
                    {isCompleted ? "✅" : milestone.icon}
                  </span>
                  <p className={`text-xs font-medium mt-1 ${isCompleted ? "text-[var(--success)]" : "text-foreground-muted"}`}>
                    {milestone.count} referrals
                  </p>
                  <p className={`text-[10px] ${isCompleted ? "text-[var(--success)]/70" : "text-foreground-muted"}`}>
                    {milestone.reward}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        <div className="flex gap-0 border-b border-[var(--card-border)] bg-[var(--background)] overflow-x-auto">
          {(["overview", "referrals", "rewards", "leaderboard"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 min-w-fit px-4 py-3 text-sm font-medium transition-all relative ${
                activeTab === tab
                  ? "text-foreground bg-[var(--card)]"
                  : "text-foreground-muted hover:text-foreground hover:bg-[var(--card)]/50"
              }`}
            >
              {tab === "overview" && "How It Works"}
              {tab === "referrals" && `Your Referrals (${referrals.length})`}
              {tab === "rewards" && (
                <span className="flex items-center justify-center gap-2">
                  Rewards
                  {pendingRewards.length > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--success)] px-1.5 text-[10px] font-bold text-white">
                      {pendingRewards.length}
                    </span>
                  )}
                </span>
              )}
              {tab === "leaderboard" && (
                <span className="flex items-center justify-center gap-1.5">
                  🏆 Leaderboard
                </span>
              )}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />
              )}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* How It Works Steps */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="relative rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6 group hover:border-[var(--primary)]/30 transition-all">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-4 group-hover:scale-110 transition-transform border-2 border-[var(--card-border)]">
                    <ShareIcon className="h-6 w-6" />
                  </div>
                  <div className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--background-hover)] text-xs font-bold text-foreground-muted">
                    1
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Share Your Link</h4>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    Send your unique referral link to photographers you know via email, social media, or messaging.
                  </p>
                </div>
                <div className="relative rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6 group hover:border-[var(--warning)]/30 transition-all">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--warning)]/10 text-[var(--warning)] mb-4 group-hover:scale-110 transition-transform border-2 border-[var(--card-border)]">
                    <UserPlusIcon className="h-6 w-6" />
                  </div>
                  <div className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--background-hover)] text-xs font-bold text-foreground-muted">
                    2
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">They Sign Up</h4>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    They get an extended 21-day trial (vs 14 days) plus 20% off their first month when they subscribe.
                  </p>
                </div>
                <div className="relative rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6 group hover:border-[var(--success)]/30 transition-all">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--success)]/10 text-[var(--success)] mb-4 group-hover:scale-110 transition-transform border-2 border-[var(--card-border)]">
                    <GiftIcon className="h-6 w-6" />
                  </div>
                  <div className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--background-hover)] text-xs font-bold text-foreground-muted">
                    3
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">You Earn $25</h4>
                  <p className="text-sm text-foreground-muted leading-relaxed">
                    When they subscribe to any paid plan, you instantly earn $25 in account credit. No limits!
                  </p>
                </div>
              </div>

              {/* Your Code Display */}
              {profile && (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-foreground-muted mb-1">Your Referral Code</h3>
                      <p className="text-3xl font-bold font-mono text-foreground tracking-wide">{profile.referralCode}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-sm text-foreground-muted">Short Link</p>
                      <p className="text-sm font-mono text-[var(--primary)]">
                        photoproos.com/r/{profile.referralCode}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tips */}
              <div className="rounded-xl border border-[var(--warning)]/20 bg-[var(--warning)]/5 p-5">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <LightbulbIcon className="h-5 w-5 text-[var(--warning)]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Pro Tips for More Referrals</h4>
                    <ul className="text-sm text-foreground-muted space-y-1">
                      <li>Share in photography Facebook groups and communities</li>
                      <li>Mention it when networking with other photographers</li>
                      <li>Add your referral link to your email signature</li>
                      <li>Create a quick video showing how you use PhotoProOS</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === "referrals" && (
            <div>
              {referrals.length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--background)] mb-4">
                    <UsersGlyph className="h-8 w-8 text-foreground-muted" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">No referrals yet</h3>
                  <p className="text-sm text-foreground-muted max-w-sm mx-auto mb-6">
                    Start sharing your referral link to see your invites and their status here.
                  </p>
                  <Button variant="primary" onClick={() => setShowInviteForm(true)}>
                    <MailIcon className="h-4 w-4" />
                    Send Your First Invite
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full min-w-[640px]">
                    <thead>
                      <tr className="border-b border-[var(--card-border)]">
                        <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">Person</th>
                        <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">Status</th>
                        <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">Signed Up</th>
                        <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">Subscribed</th>
                        <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-3">Reward</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--card-border)]">
                      {referrals.map((referral) => (
                        <tr key={referral.id} className="hover:bg-[var(--background)] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--background-hover)] text-sm font-medium text-foreground">
                                {(referral.referredName || referral.referredEmail)[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {referral.referredName || "—"}
                                </p>
                                <p className="text-sm text-foreground-muted">{referral.referredEmail}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(referral.status)}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground-muted">
                            {formatDate(referral.signedUpAt)}
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground-muted">
                            {formatDate(referral.subscribedAt)}
                          </td>
                          <td className="px-6 py-4">
                            {referral.status === "subscribed" ? (
                              <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--success)]">
                                <CheckCircleIcon className="h-4 w-4" />
                                $25 earned
                              </span>
                            ) : referral.status === "signed_up" ? (
                              <span className="text-sm text-foreground-muted">Pending subscription</span>
                            ) : (
                              <span className="text-sm text-foreground-muted">—</span>
                            )}
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
                  <h3 className="text-sm font-medium text-foreground-muted mb-4 flex items-center gap-2">
                    <SparklesIcon className="h-4 w-4 text-[var(--success)]" />
                    Available to Apply ({pendingRewards.length})
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {pendingRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="relative overflow-hidden rounded-xl border border-[var(--success)]/30 bg-gradient-to-br from-[var(--success)]/10 to-transparent p-5"
                      >
                        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[var(--success)]/10 blur-2xl" />
                        <div className="relative">
                          <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                            <div>
                              <p className="text-2xl font-bold text-foreground">
                                {formatCurrency(reward.valueCents)}
                              </p>
                              <p className="text-sm text-foreground-muted">Account Credit</p>
                            </div>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--success)]/20 text-lg">
                              💰
                            </span>
                          </div>
                          <p className="text-sm text-foreground-muted mb-4">{reward.description}</p>
                          {reward.expiresAt && (
                            <p className="text-xs text-foreground-muted mb-4">
                              Expires {formatDate(reward.expiresAt)}
                            </p>
                          )}
                          <button
                            onClick={() => handleApplyReward(reward.id)}
                            disabled={isPending}
                            className="w-full rounded-lg bg-[var(--success)] py-2.5 text-sm font-medium text-white transition-all hover:bg-[var(--success)]/90 hover:shadow-lg hover:shadow-[var(--success)]/25 disabled:opacity-50"
                          >
                            {isPending ? "Applying..." : "Apply Credit"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applied Rewards */}
              {appliedRewards.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-foreground-muted mb-4">
                    Applied Rewards ({appliedRewards.length})
                  </h3>
                  <div className="space-y-2">
                    {appliedRewards.map((reward) => (
                      <div
                        key={reward.id}
                        className="flex flex-col gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircleIcon className="h-5 w-5 text-[var(--success)]" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {formatCurrency(reward.valueCents)} Credit Applied
                            </p>
                            <p className="text-xs text-foreground-muted">{reward.description}</p>
                          </div>
                        </div>
                        <p className="text-xs text-foreground-muted sm:text-right">
                          {formatDate(reward.appliedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingRewards.length === 0 && appliedRewards.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--background)] mb-4">
                    <GiftIcon className="h-8 w-8 text-foreground-muted" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">No rewards yet</h3>
                  <p className="text-sm text-foreground-muted max-w-sm mx-auto">
                    When your referrals subscribe to a paid plan, you&apos;ll see your $25 rewards here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              {/* Leaderboard Header */}
              <div className="text-center mb-6">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 mb-3">
                  <span className="text-3xl">🏆</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Top Referrers</h3>
                <p className="text-sm text-foreground-muted">See who&apos;s leading the referral game</p>
              </div>

              {leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => {
                    const isTopThree = entry.rank <= 3;
                    const rankEmoji = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : null;
                    const isCurrentUser = profile && entry.name === (profile.referralCode ? "You" : entry.name);

                    return (
                      <div
                        key={entry.rank}
                        className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                          isTopThree
                            ? "border-yellow-500/30 bg-gradient-to-r from-yellow-500/5 to-orange-500/5"
                            : "border-[var(--card-border)] bg-[var(--background)] hover:bg-[var(--background-hover)]"
                        } ${isCurrentUser ? "ring-2 ring-[var(--primary)]" : ""}`}
                      >
                        {/* Rank */}
                        <div className="flex h-10 w-10 items-center justify-center">
                          {rankEmoji ? (
                            <span className="text-2xl">{rankEmoji}</span>
                          ) : (
                            <span className="text-lg font-bold text-foreground-muted">#{entry.rank}</span>
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex-1">
                          <p className={`font-medium ${isTopThree ? "text-foreground" : "text-foreground-secondary"}`}>
                            {entry.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-[var(--primary)]">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            {entry.successfulReferrals} successful referral{entry.successfulReferrals !== 1 ? "s" : ""}
                          </p>
                        </div>

                        {/* Earnings */}
                        <div className="text-right">
                          <p className={`font-bold ${isTopThree ? "text-[var(--success)]" : "text-foreground"}`}>
                            ${(entry.totalEarnedCents / 100).toFixed(0)}
                          </p>
                          <p className="text-xs text-foreground-muted">earned</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--background)] mb-4">
                    <TrophyIcon className="h-8 w-8 text-foreground-muted" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">No leaders yet</h3>
                  <p className="text-sm text-foreground-muted max-w-sm mx-auto mb-4">
                    Be the first to climb the leaderboard by referring photographers!
                  </p>
                  <Button variant="primary" onClick={() => setActiveTab("overview")}>
                    Start Referring
                  </Button>
                </div>
              )}

              {/* Your Rank */}
              {leaderboard.length > 0 && stats && stats.subscribedReferrals > 0 && (
                <div className="rounded-xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground-muted">Your Stats</p>
                      <p className="text-lg font-semibold text-foreground">
                        {stats.subscribedReferrals} referral{stats.subscribedReferrals !== 1 ? "s" : ""} • ${(stats.totalEarnedCents / 100).toFixed(0)} earned
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground-muted">Keep going!</p>
                      <p className="text-sm text-[var(--primary)]">Share more to climb up</p>
                    </div>
                  </div>
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
// Referrals-specific icons (not in shared library)
// =============================================================================

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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
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

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.367A2.52 2.52 0 0 1 13 4.5Z" />
    </svg>
  );
}

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM2.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 8 18a9.953 9.953 0 0 1-5.385-1.572ZM16.25 5.75a.75.75 0 0 0-1.5 0v2h-2a.75.75 0 0 0 0 1.5h2v2a.75.75 0 0 0 1.5 0v-2h2a.75.75 0 0 0 0-1.5h-2v-2Z" />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 1a6 6 0 0 0-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 0 0 .75.75h2.5a.75.75 0 0 0 .75-.75v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0 0 10 1ZM8.863 17.414a.75.75 0 0 0-.226 1.483 9.066 9.066 0 0 0 2.726 0 .75.75 0 0 0-.226-1.483 7.553 7.553 0 0 1-2.274 0Z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 1c-1.828 0-3.623.149-5.371.435a.75.75 0 0 0-.629.74v.387c-.827.157-1.642.345-2.445.564a.75.75 0 0 0-.552.698 5 5 0 0 0 4.503 5.152 6 6 0 0 0 2.946 1.822A6.451 6.451 0 0 1 7.768 13H7.5A1.5 1.5 0 0 0 6 14.5V17h-.75a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 0-1.5H14v-2.5a1.5 1.5 0 0 0-1.5-1.5h-.268a6.453 6.453 0 0 1-.684-2.202 6 6 0 0 0 2.946-1.822 5 5 0 0 0 4.503-5.152.75.75 0 0 0-.552-.698A31.804 31.804 0 0 0 16 2.562v-.387a.75.75 0 0 0-.629-.74A33.227 33.227 0 0 0 10 1ZM2.525 4.422a34.51 34.51 0 0 1 1.473-.34v2.047a3.5 3.5 0 0 1-1.473-1.707Zm14.95 0a3.5 3.5 0 0 1-1.473 1.707V4.082a34.493 34.493 0 0 1 1.473.34Z" clipRule="evenodd" />
    </svg>
  );
}

function QRCodeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.75 2A1.75 1.75 0 0 0 2 3.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 9 7.25v-3.5A1.75 1.75 0 0 0 7.25 2h-3.5ZM3.5 3.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM3.75 11A1.75 1.75 0 0 0 2 12.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 9 16.25v-3.5A1.75 1.75 0 0 0 7.25 11h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM12.75 2A1.75 1.75 0 0 0 11 3.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 18 7.25v-3.5A1.75 1.75 0 0 0 16.25 2h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM11 12.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Zm0 2.75a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Zm0 2.75a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

// =============================================================================
// QR Code Canvas Component
// =============================================================================

function QRCodeCanvas({ referralLink, size }: { referralLink: string; size: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Simple QR code generation using a basic algorithm
    // For production, you'd use a library like qrcode.js
    const qrSize = size;
    const moduleCount = 25; // Standard QR code size
    const moduleSize = qrSize / moduleCount;

    canvas.width = qrSize;
    canvas.height = qrSize;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, qrSize, qrSize);

    // Generate a simple hash-based pattern (pseudo-QR code)
    // In production, use a proper QR library
    const hash = simpleHash(referralLink);
    const pattern = generateQRPattern(hash, moduleCount);

    ctx.fillStyle = "#000000";
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (pattern[row][col]) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // Add finder patterns (the three corner squares)
    drawFinderPattern(ctx, 0, 0, moduleSize);
    drawFinderPattern(ctx, moduleCount - 7, 0, moduleSize);
    drawFinderPattern(ctx, 0, moduleCount - 7, moduleSize);
  }, [referralLink, size]);

  return <canvas ref={canvasRef} id="qr-code-canvas" />;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function generateQRPattern(hash: number, size: number): boolean[][] {
  const pattern: boolean[][] = [];
  let seed = hash;

  for (let row = 0; row < size; row++) {
    pattern[row] = [];
    for (let col = 0; col < size; col++) {
      // Skip finder pattern areas
      const inTopLeft = row < 8 && col < 8;
      const inTopRight = row < 8 && col > size - 9;
      const inBottomLeft = row > size - 9 && col < 8;

      if (inTopLeft || inTopRight || inBottomLeft) {
        pattern[row][col] = false;
      } else {
        // Pseudo-random pattern based on hash
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        pattern[row][col] = (seed % 100) < 40;
      }
    }
  }

  return pattern;
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) {
  // Outer black square
  ctx.fillStyle = "#000000";
  ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize);

  // White square
  ctx.fillStyle = "#ffffff";
  ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize);

  // Inner black square
  ctx.fillStyle = "#000000";
  ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize);
}
