"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  awardXp,
  grantLifetimeLicense,
  revokeLifetimeLicense,
  createCustomChallenge,
  startImpersonation,
  applyDiscount,
  type UserDetailData,
} from "@/lib/actions/super-admin";
import { formatDistanceToNow, format } from "date-fns";

// Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PercentIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="19" x2="5" y1="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

interface UserDetailClientProps {
  user: UserDetailData;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

const RARITY_COLORS: Record<string, string> = {
  common: "text-[var(--foreground-muted)]",
  uncommon: "text-[var(--success)]",
  rare: "text-[var(--primary)]",
  epic: "text-[var(--ai)]",
  legendary: "text-[var(--warning)]",
};

export function UserDetailClient({ user }: UserDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [isXpDialogOpen, setIsXpDialogOpen] = useState(false);
  const [isChallengeDialogOpen, setIsChallengeDialogOpen] = useState(false);
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);

  // Form states
  const [xpAmount, setXpAmount] = useState("");
  const [xpReason, setXpReason] = useState("");
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeXp, setChallengeXp] = useState("100");
  const [challengeDays, setChallengeDays] = useState("7");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [discountDays, setDiscountDays] = useState("30");

  const handleAwardXp = () => {
    const amount = parseInt(xpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a positive number",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await awardXp(user.id, amount, xpReason || undefined);
      if (result.success) {
        toast({
          title: "XP Awarded",
          description: `${amount} XP awarded to ${user.fullName || user.email}`,
        });
        setIsXpDialogOpen(false);
        setXpAmount("");
        setXpReason("");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to award XP",
          variant: "destructive",
        });
      }
    });
  };

  const handleToggleLicense = () => {
    startTransition(async () => {
      const result = user.hasLifetimeLicense
        ? await revokeLifetimeLicense(user.id)
        : await grantLifetimeLicense(user.id);

      if (result.success) {
        toast({
          title: user.hasLifetimeLicense ? "License Revoked" : "License Granted",
          description: user.hasLifetimeLicense
            ? `Lifetime license revoked from ${user.fullName || user.email}`
            : `Lifetime license granted to ${user.fullName || user.email}`,
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update license",
          variant: "destructive",
        });
      }
    });
  };

  const handleCreateChallenge = () => {
    if (!challengeTitle.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a challenge title",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await createCustomChallenge(user.id, {
        title: challengeTitle,
        description: challengeDescription,
        objectives: [{ name: challengeTitle, target: 1 }],
        xpReward: parseInt(challengeXp) || 100,
        daysValid: parseInt(challengeDays) || 7,
      });

      if (result.success) {
        toast({
          title: "Challenge Created",
          description: `Custom challenge created for ${user.fullName || user.email}`,
        });
        setIsChallengeDialogOpen(false);
        setChallengeTitle("");
        setChallengeDescription("");
        setChallengeXp("100");
        setChallengeDays("7");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create challenge",
          variant: "destructive",
        });
      }
    });
  };

  const handleImpersonate = () => {
    startTransition(async () => {
      const result = await startImpersonation(user.id, "Viewing from user detail page");
      if (result.success && result.data) {
        toast({
          title: "Impersonation Started",
          description: `Now viewing as ${user.fullName || user.email}`,
        });
        // Redirect to dashboard to view as user
        window.location.href = "/";
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to start impersonation",
          variant: "destructive",
        });
      }
    });
  };

  const handleApplyDiscount = () => {
    if (!user.organization?.id) {
      toast({
        title: "No Organization",
        description: "User must have an organization to apply a discount",
        variant: "destructive",
      });
      return;
    }

    const percent = parseInt(discountPercent);
    const days = parseInt(discountDays);

    if (isNaN(percent) || percent < 1 || percent > 100) {
      toast({
        title: "Invalid Discount",
        description: "Discount must be between 1 and 100 percent",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await applyDiscount(user.organization!.id, percent, days);
      if (result.success) {
        toast({
          title: "Discount Applied",
          description: `${percent}% discount applied for ${days} days`,
        });
        setIsDiscountDialogOpen(false);
        setDiscountPercent("20");
        setDiscountDays("30");
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to apply discount",
          variant: "destructive",
        });
      }
    });
  };

  const statCards = [
    {
      label: "Level",
      value: user.gamification?.level || 1,
      icon: StarIcon,
      color: "text-[var(--warning)]",
    },
    {
      label: "Total XP",
      value: (user.gamification?.totalXp || 0).toLocaleString(),
      icon: TrophyIcon,
      color: "text-[var(--ai)]",
    },
    {
      label: "Login Streak",
      value: `${user.gamification?.currentLoginStreak || 0}d`,
      icon: FlameIcon,
      color: "text-[var(--warning)]",
    },
    {
      label: "Sessions",
      value: user.totalSessions.toLocaleString(),
      icon: UserIcon,
      color: "text-[var(--primary)]",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/super-admin/users" className="flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Users
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start gap-6">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={`${user.fullName || user.email}'s avatar`}
            className="w-20 h-20 rounded-full"
          />
        ) : (
          <div
            className={cn(
              "w-20 h-20 rounded-full",
              "bg-[var(--primary)]/10",
              "flex items-center justify-center",
              "text-[var(--primary)] text-2xl font-semibold"
            )}
          >
            {(user.fullName || user.email)[0].toUpperCase()}
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {user.fullName || user.email}
            </h1>
            {user.hasLifetimeLicense && (
              <Badge
                variant="secondary"
                className="bg-[var(--success)]/10 text-[var(--success)]"
              >
                Lifetime License
              </Badge>
            )}
          </div>
          <p className="text-[var(--foreground-muted)]">{user.email}</p>
          {user.organization && (
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              {user.organization.name} &bull;{" "}
              {user.organization.plan || "Free"} Plan
            </p>
          )}
          <p className="text-xs text-[var(--foreground-muted)] mt-2">
            Joined {format(new Date(user.createdAt), "MMM d, yyyy")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImpersonate}
            disabled={isPending}
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            View As User
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsXpDialogOpen(true)}
          >
            <StarIcon className="w-4 h-4 mr-2" />
            Award XP
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleLicense}
            disabled={isPending}
          >
            <GiftIcon className="w-4 h-4 mr-2" />
            {user.hasLifetimeLicense ? "Revoke License" : "Grant License"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChallengeDialogOpen(true)}
          >
            <TargetIcon className="w-4 h-4 mr-2" />
            Challenge
          </Button>
          {user.organization && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDiscountDialogOpen(true)}
            >
              <PercentIcon className="w-4 h-4 mr-2" />
              Discount
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={cn(
              "p-4 rounded-xl",
              "border border-[var(--border)]",
              "bg-[var(--card)]"
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <card.icon className={cn("w-5 h-5", card.color)} />
              <span className="text-sm text-[var(--foreground-muted)]">
                {card.label}
              </span>
            </div>
            <div className="text-2xl font-bold text-[var(--foreground)]">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Business Stats */}
      <div
        className={cn(
          "p-6 rounded-xl",
          "border border-[var(--border)]",
          "bg-[var(--card)]"
        )}
      >
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Business Stats
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-[var(--foreground)]">
              {user.stats.totalGalleries}
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">
              Total Galleries
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--foreground)]">
              {user.stats.totalClients}
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">
              Total Clients
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--success)]">
              {formatCurrency(user.stats.totalRevenueCents)}
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">
              Total Revenue
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div
          className={cn(
            "p-6 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Recent Achievements
          </h2>
          {user.achievements.length > 0 ? (
            <div className="space-y-3">
              {user.achievements.map((a) => (
                <div
                  key={a.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    "bg-[var(--background-tertiary)]"
                  )}
                >
                  <div className="text-2xl">{a.achievement.icon}</div>
                  <div className="flex-1">
                    <div
                      className={cn(
                        "font-medium",
                        RARITY_COLORS[a.achievement.rarity] ||
                          "text-[var(--foreground)]"
                      )}
                    >
                      {a.achievement.name}
                    </div>
                    <div className="text-xs text-[var(--foreground-muted)]">
                      {a.achievement.description}
                    </div>
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)]">
                    {formatDistanceToNow(new Date(a.unlockedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--foreground-muted)] text-center py-8">
              No achievements yet
            </p>
          )}
        </div>

        {/* Support Tickets */}
        <div
          className={cn(
            "p-6 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Recent Tickets
            </h2>
            <TicketIcon className="w-5 h-5 text-[var(--foreground-muted)]" />
          </div>
          {user.recentTickets.length > 0 ? (
            <div className="space-y-3">
              {user.recentTickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/super-admin/support/${ticket.id}`}
                  className={cn(
                    "block p-3 rounded-lg",
                    "bg-[var(--background-tertiary)]",
                    "hover:bg-[var(--background-elevated)]",
                    "transition-colors"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <span className="font-medium text-[var(--foreground)] text-sm">
                      {ticket.subject}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        ticket.status === "open" &&
                          "bg-[var(--warning)]/10 text-[var(--warning)]",
                        ticket.status === "in_progress" &&
                          "bg-[var(--primary)]/10 text-[var(--primary)]",
                        ticket.status === "resolved" &&
                          "bg-[var(--success)]/10 text-[var(--success)]"
                      )}
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-[var(--foreground-muted)] mt-1">
                    {formatDistanceToNow(new Date(ticket.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[var(--foreground-muted)] text-center py-8">
              No support tickets
            </p>
          )}
        </div>
      </div>

      {/* Custom Challenges */}
      {user.customChallenges.length > 0 && (
        <div
          className={cn(
            "p-6 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Custom Challenges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.customChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className={cn(
                  "p-4 rounded-lg",
                  "bg-[var(--background-tertiary)]",
                  challenge.isCompleted && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                  <span className="font-medium text-[var(--foreground)]">
                    {challenge.title}
                  </span>
                  {challenge.isCompleted ? (
                    <Badge
                      variant="secondary"
                      className="bg-[var(--success)]/10 text-[var(--success)]"
                    >
                      Completed
                    </Badge>
                  ) : challenge.expiresAt ? (
                    <Badge variant="secondary" className="text-xs">
                      Expires{" "}
                      {formatDistanceToNow(new Date(challenge.expiresAt), {
                        addSuffix: true,
                      })}
                    </Badge>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* XP Award Dialog */}
      <Dialog open={isXpDialogOpen} onOpenChange={setIsXpDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Award XP</DialogTitle>
            <DialogDescription>
              Award experience points to {user.fullName || user.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">XP Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={xpAmount}
                onChange={(e) => setXpAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                placeholder="e.g., Beta tester reward"
                value={xpReason}
                onChange={(e) => setXpReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsXpDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAwardXp} disabled={isPending}>
                {isPending ? (
                  <LoaderIcon className="w-4 h-4 mr-2" />
                ) : (
                  <StarIcon className="w-4 h-4 mr-2" />
                )}
                Award XP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Challenge Dialog */}
      <Dialog
        open={isChallengeDialogOpen}
        onOpenChange={setIsChallengeDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Custom Challenge</DialogTitle>
            <DialogDescription>
              Create a personalized challenge for {user.fullName || user.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Challenge Title</Label>
              <Input
                id="title"
                placeholder="e.g., Deliver 5 galleries this week"
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the challenge..."
                value={challengeDescription}
                onChange={(e) => setChallengeDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="xp">XP Reward</Label>
                <Input
                  id="xp"
                  type="number"
                  placeholder="100"
                  value={challengeXp}
                  onChange={(e) => setChallengeXp(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="days">Days Valid</Label>
                <Input
                  id="days"
                  type="number"
                  placeholder="7"
                  value={challengeDays}
                  onChange={(e) => setChallengeDays(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsChallengeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateChallenge} disabled={isPending}>
                {isPending ? (
                  <LoaderIcon className="w-4 h-4 mr-2" />
                ) : (
                  <TargetIcon className="w-4 h-4 mr-2" />
                )}
                Create Challenge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Apply Discount</DialogTitle>
            <DialogDescription>
              Apply a time-limited discount to {user.organization?.name || "this organization"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="percent">Discount %</Label>
                <Input
                  id="percent"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="20"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountDays">Days Valid</Label>
                <Input
                  id="discountDays"
                  type="number"
                  min="1"
                  placeholder="30"
                  value={discountDays}
                  onChange={(e) => setDiscountDays(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[var(--background-tertiary)] text-sm">
              <p className="text-[var(--foreground-muted)]">
                This will apply a <span className="font-medium text-[var(--foreground)]">{discountPercent}%</span> discount
                that expires in <span className="font-medium text-[var(--foreground)]">{discountDays}</span> days.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDiscountDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleApplyDiscount} disabled={isPending}>
                {isPending ? (
                  <LoaderIcon className="w-4 h-4 mr-2" />
                ) : (
                  <PercentIcon className="w-4 h-4 mr-2" />
                )}
                Apply Discount
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
