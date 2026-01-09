"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  markFeedbackReviewed,
  awardFeedbackXp,
  type PlatformFeedbackData,
  type FeedbackStats,
} from "@/lib/actions/platform-feedback";
import { formatDistanceToNow } from "date-fns";

// Icons
function StarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
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

function ThumbsUpIcon({ className }: { className?: string }) {
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
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function ThumbsDownIcon({ className }: { className?: string }) {
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
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

function MessageSquareIcon({ className }: { className?: string }) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
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
      <polyline points="20 6 9 17 4 12" />
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

interface FeedbackPageClientProps {
  feedback: PlatformFeedbackData[];
  stats: FeedbackStats | null;
}

function RatingStars({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-[var(--foreground-muted)]">-</span>;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={cn(
            "w-4 h-4",
            star <= rating
              ? "text-[var(--warning)] fill-[var(--warning)]"
              : "text-[var(--foreground-muted)]"
          )}
          filled={star <= rating}
        />
      ))}
    </div>
  );
}

export function FeedbackPageClient({ feedback, stats }: FeedbackPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "pending" | "reviewed">("all");
  const [selectedFeedback, setSelectedFeedback] = useState<PlatformFeedbackData | null>(null);
  const [isXpDialogOpen, setIsXpDialogOpen] = useState(false);
  const [xpAmount, setXpAmount] = useState("50");

  const filteredFeedback = feedback.filter((f) => {
    if (filter === "pending") return !f.isReviewed;
    if (filter === "reviewed") return f.isReviewed;
    return true;
  });

  const handleMarkReviewed = (id: string) => {
    startTransition(async () => {
      const result = await markFeedbackReviewed(id);
      if (result.success) {
        toast({ title: "Marked as reviewed" });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const handleAwardXp = () => {
    if (!selectedFeedback) return;

    startTransition(async () => {
      const result = await awardFeedbackXp(
        selectedFeedback.id,
        parseInt(xpAmount) || 0,
        "Valuable feedback bonus"
      );
      if (result.success) {
        toast({
          title: "XP Awarded",
          description: `${xpAmount} XP awarded for valuable feedback`,
        });
        setIsXpDialogOpen(false);
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="text-3xl font-bold text-[var(--foreground)]">
            {stats?.totalFeedback || 0}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            Total Feedback
          </div>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[var(--warning)]">
              {(stats?.averageRating || 0).toFixed(1)}
            </span>
            <span className="text-lg text-[var(--foreground-muted)]">/5</span>
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            Average Rating
          </div>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="text-3xl font-bold text-[var(--primary)]">
            {stats?.pendingReview || 0}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            Pending Review
          </div>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="text-3xl font-bold text-[var(--success)]">
            {stats?.thisWeek || 0}
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">
            This Week
          </div>
        </div>
      </div>

      {/* Feature Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        {/* Liked Features */}
        <div
          className={cn(
            "p-6 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <ThumbsUpIcon className="w-5 h-5 text-[var(--success)]" />
            <h3 className="font-semibold text-[var(--foreground)]">
              Most Liked Features
            </h3>
          </div>
          {stats?.likedFeatures && stats.likedFeatures.length > 0 ? (
            <div className="space-y-3">
              {stats.likedFeatures.slice(0, 5).map((item) => (
                <div key={item.feature} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--success)]"
                        style={{
                          width: `${(item.count / stats.likedFeatures[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-[var(--foreground)] w-32 truncate">
                    {item.feature}
                  </span>
                  <span className="text-sm text-[var(--foreground-muted)] w-8 text-right">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--foreground-muted)] text-center py-4">
              No data yet
            </p>
          )}
        </div>

        {/* Disliked Features */}
        <div
          className={cn(
            "p-6 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <ThumbsDownIcon className="w-5 h-5 text-[var(--error)]" />
            <h3 className="font-semibold text-[var(--foreground)]">
              Areas for Improvement
            </h3>
          </div>
          {stats?.dislikedFeatures && stats.dislikedFeatures.length > 0 ? (
            <div className="space-y-3">
              {stats.dislikedFeatures.slice(0, 5).map((item) => (
                <div key={item.feature} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--error)]"
                        style={{
                          width: `${(item.count / stats.dislikedFeatures[0].count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-[var(--foreground)] w-32 truncate">
                    {item.feature}
                  </span>
                  <span className="text-sm text-[var(--foreground-muted)] w-8 text-right">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[var(--foreground-muted)] text-center py-4">
              No data yet
            </p>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All ({feedback.length})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("pending")}
        >
          Pending ({feedback.filter((f) => !f.isReviewed).length})
        </Button>
        <Button
          variant={filter === "reviewed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("reviewed")}
        >
          Reviewed ({feedback.filter((f) => f.isReviewed).length})
        </Button>
      </div>

      {/* Feedback List */}
      <div className="space-y-4">
        {filteredFeedback.length > 0 ? (
          filteredFeedback.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-4 rounded-xl",
                "border border-[var(--border)]",
                "bg-[var(--card)]",
                !item.isReviewed && "border-l-4 border-l-[var(--primary)]"
              )}
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  {item.user?.avatarUrl ? (
                    <img
                      src={item.user.avatarUrl}
                      alt=""
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full",
                        "bg-[var(--primary)]/10",
                        "flex items-center justify-center",
                        "text-[var(--primary)] font-semibold"
                      )}
                    >
                      {(item.user?.fullName || item.user?.email || "A")[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--foreground)]">
                        {item.user?.fullName || item.user?.email || "Anonymous"}
                      </span>
                      {item.organization && (
                        <span className="text-sm text-[var(--foreground-muted)]">
                          ({item.organization.name})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <RatingStars rating={item.rating} />
                      <span className="text-xs text-[var(--foreground-muted)]">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      {item.sessionCount && (
                        <span className="text-xs text-[var(--foreground-muted)]">
                          Session #{item.sessionCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.xpAwarded > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-[var(--warning)]/10 text-[var(--warning)]"
                    >
                      {item.xpAwarded} XP
                    </Badge>
                  )}
                  {item.isReviewed ? (
                    <Badge variant="secondary">Reviewed</Badge>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFeedback(item);
                          setIsXpDialogOpen(true);
                        }}
                      >
                        <GiftIcon className="w-4 h-4 mr-1" />
                        Reward
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkReviewed(item.id)}
                        disabled={isPending}
                      >
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Done
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Liked/Disliked Features */}
              <div className="flex flex-wrap gap-2 mt-3">
                {item.likedFeatures.map((feat) => (
                  <Badge
                    key={feat}
                    variant="secondary"
                    className="bg-[var(--success)]/10 text-[var(--success)]"
                  >
                    <ThumbsUpIcon className="w-3 h-3 mr-1" />
                    {feat}
                  </Badge>
                ))}
                {item.dislikedFeatures.map((feat) => (
                  <Badge
                    key={feat}
                    variant="secondary"
                    className="bg-[var(--error)]/10 text-[var(--error)]"
                  >
                    <ThumbsDownIcon className="w-3 h-3 mr-1" />
                    {feat}
                  </Badge>
                ))}
              </div>

              {/* Comment */}
              {item.comment && (
                <div className="mt-3 p-3 rounded-lg bg-[var(--background-tertiary)]">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquareIcon className="w-4 h-4 text-[var(--foreground-muted)]" />
                    <span className="text-xs font-medium text-[var(--foreground-muted)]">
                      Comment
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                    {item.comment}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div
            className={cn(
              "p-12 rounded-xl text-center",
              "border border-[var(--border)]",
              "bg-[var(--card)]"
            )}
          >
            <MessageSquareIcon className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-muted)]" />
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
              No feedback yet
            </h3>
            <p className="text-[var(--foreground-muted)]">
              User feedback will appear here
            </p>
          </div>
        )}
      </div>

      {/* XP Award Dialog */}
      <Dialog open={isXpDialogOpen} onOpenChange={setIsXpDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Award Bonus XP</DialogTitle>
            <DialogDescription>
              Reward {selectedFeedback?.user?.fullName || "this user"} for
              valuable feedback
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="xp">XP Amount</Label>
              <Input
                id="xp"
                type="number"
                placeholder="50"
                value={xpAmount}
                onChange={(e) => setXpAmount(e.target.value)}
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
                  <GiftIcon className="w-4 h-4 mr-2" />
                )}
                Award XP
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
