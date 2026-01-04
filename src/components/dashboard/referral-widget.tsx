"use client";

import Link from "next/link";
import { useState } from "react";

interface ReferralWidgetProps {
  referralCode: string | null;
  successfulReferrals: number;
  totalEarnedCents: number;
  pendingReferrals: number;
}

const MILESTONES = [
  { count: 1, title: "First Referral", icon: "🎯" },
  { count: 5, title: "Rising Star", icon: "⭐" },
  { count: 10, title: "Referral Pro", icon: "🚀" },
  { count: 25, title: "Ambassador", icon: "👑" },
  { count: 50, title: "Legend", icon: "🏆" },
];

function getCurrentMilestone(referrals: number) {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (referrals >= MILESTONES[i].count) {
      return MILESTONES[i];
    }
  }
  return null;
}

function getNextMilestone(referrals: number) {
  for (const milestone of MILESTONES) {
    if (referrals < milestone.count) {
      return milestone;
    }
  }
  return null;
}

export function ReferralWidget({
  referralCode,
  successfulReferrals,
  totalEarnedCents,
  pendingReferrals,
}: ReferralWidgetProps) {
  const [copied, setCopied] = useState(false);
  const referralUrl = referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/r/${referralCode}`
    : null;

  const currentMilestone = getCurrentMilestone(successfulReferrals);
  const nextMilestone = getNextMilestone(successfulReferrals);

  const progressToNext = nextMilestone
    ? (successfulReferrals / nextMilestone.count) * 100
    : 100;

  const handleCopy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = referralUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Don't show widget if no referral code yet
  if (!referralCode) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="text-xl">🎁</span>
              Earn $25 Per Referral
            </h3>
            <p className="mt-1 text-sm text-foreground-muted">
              Share ListingLens with fellow photographers and earn account credit.
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Link
            href="/settings/my-referrals"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[var(--primary)] to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            Get Your Referral Link
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="ml-1.5 h-4 w-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b border-[var(--card-border)]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <span className="text-xl">🎁</span>
            Referral Program
          </h3>
          {currentMilestone && (
            <span className="text-lg" title={currentMilestone.title}>
              {currentMilestone.icon}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              ${(totalEarnedCents / 100).toFixed(0)}
            </div>
            <div className="text-xs text-foreground-muted">Earned</div>
          </div>
          <div className="text-center border-x border-[var(--card-border)]">
            <div className="text-2xl font-bold text-foreground">
              {successfulReferrals}
            </div>
            <div className="text-xs text-foreground-muted">Referrals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {pendingReferrals}
            </div>
            <div className="text-xs text-foreground-muted">Pending</div>
          </div>
        </div>

        {/* Progress to Next Milestone */}
        {nextMilestone && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground-muted">
                Next: {nextMilestone.icon} {nextMilestone.title}
              </span>
              <span className="text-foreground-secondary font-medium">
                {successfulReferrals}/{nextMilestone.count}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--background-secondary)] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressToNext, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Referral Code */}
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-[var(--background-secondary)] rounded-lg font-mono text-sm text-foreground-secondary truncate">
            {referralCode}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 p-2 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] text-foreground-muted hover:text-foreground transition-colors"
            title="Copy referral link"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-green-500">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
                <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.44A1.5 1.5 0 0 0 8.378 6H4.5Z" />
              </svg>
            )}
          </button>
        </div>

        {/* Action Link */}
        <Link
          href="/settings/my-referrals"
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          View Referral Dashboard
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
