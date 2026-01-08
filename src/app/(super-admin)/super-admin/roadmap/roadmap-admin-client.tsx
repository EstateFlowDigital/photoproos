"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  approveFeatureRequest,
  rejectFeatureRequest,
  markFeatureImplemented,
  type RoadmapPhase,
  type PublicFeatureRequest,
} from "@/lib/actions/feature-voting";
import { formatDistanceToNow } from "date-fns";

// Icons
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

function XIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
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

function LightbulbIcon({ className }: { className?: string }) {
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
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
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
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
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
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
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

interface RoadmapAdminClientProps {
  roadmap: RoadmapPhase[];
  pendingFeatures: PublicFeatureRequest[];
  approvedFeatures: PublicFeatureRequest[];
}

const CATEGORY_COLORS: Record<string, string> = {
  galleries: "bg-[var(--primary)]/10 text-[var(--primary)]",
  payments: "bg-[var(--success)]/10 text-[var(--success)]",
  scheduling: "bg-[var(--warning)]/10 text-[var(--warning)]",
  clients: "bg-[var(--ai)]/10 text-[var(--ai)]",
  marketing: "bg-pink-500/10 text-pink-500",
  analytics: "bg-cyan-500/10 text-cyan-500",
  integrations: "bg-orange-500/10 text-orange-500",
  other: "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]",
};

export function RoadmapAdminClient({
  roadmap,
  pendingFeatures,
  approvedFeatures,
}: RoadmapAdminClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState<"pending" | "approved" | "roadmap">("pending");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<PublicFeatureRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (feature: PublicFeatureRequest, phase?: string) => {
    startTransition(async () => {
      const result = await approveFeatureRequest(feature.id, phase);
      if (result.success) {
        toast({
          title: "Feature Approved",
          description: `"${feature.title}" has been approved`,
        });
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

  const handleReject = () => {
    if (!selectedFeature || !rejectReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await rejectFeatureRequest(selectedFeature.id, rejectReason);
      if (result.success) {
        toast({
          title: "Feature Rejected",
          description: `"${selectedFeature.title}" has been rejected`,
        });
        setIsRejectDialogOpen(false);
        setRejectReason("");
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

  const handleMarkImplemented = (feature: PublicFeatureRequest) => {
    startTransition(async () => {
      const result = await markFeatureImplemented(feature.id);
      if (result.success) {
        toast({
          title: "Feature Implemented",
          description: `"${feature.title}" has been marked as implemented`,
        });
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
      <div className="grid grid-cols-3 gap-4">
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <ClockIcon className="w-5 h-5 text-[var(--warning)]" />
            <span className="text-sm text-[var(--foreground-muted)]">
              Pending Review
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--foreground)]">
            {pendingFeatures.length}
          </div>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <LightbulbIcon className="w-5 h-5 text-[var(--success)]" />
            <span className="text-sm text-[var(--foreground-muted)]">
              Approved Features
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--foreground)]">
            {approvedFeatures.length}
          </div>
        </div>
        <div
          className={cn(
            "p-4 rounded-xl",
            "border border-[var(--border)]",
            "bg-[var(--card)]"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <RocketIcon className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-sm text-[var(--foreground-muted)]">
              Roadmap Phases
            </span>
          </div>
          <div className="text-3xl font-bold text-[var(--foreground)]">
            {roadmap.length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-2 border-b border-[var(--border)]"
        role="tablist"
        aria-label="Feature request sections"
      >
        <button
          onClick={() => setTab("pending")}
          role="tab"
          aria-selected={tab === "pending"}
          aria-controls="pending-panel"
          id="pending-tab"
          className={cn(
            "px-4 py-2 text-sm font-medium",
            "border-b-2 -mb-px transition-colors",
            tab === "pending"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          Pending ({pendingFeatures.length})
        </button>
        <button
          onClick={() => setTab("approved")}
          role="tab"
          aria-selected={tab === "approved"}
          aria-controls="approved-panel"
          id="approved-tab"
          className={cn(
            "px-4 py-2 text-sm font-medium",
            "border-b-2 -mb-px transition-colors",
            tab === "approved"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          Approved ({approvedFeatures.length})
        </button>
        <button
          onClick={() => setTab("roadmap")}
          role="tab"
          aria-selected={tab === "roadmap"}
          aria-controls="roadmap-panel"
          id="roadmap-tab"
          className={cn(
            "px-4 py-2 text-sm font-medium",
            "border-b-2 -mb-px transition-colors",
            tab === "roadmap"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          Roadmap
        </button>
      </div>

      {/* Content */}
      {tab === "pending" && (
        <div
          className="space-y-4"
          role="tabpanel"
          id="pending-panel"
          aria-labelledby="pending-tab"
        >
          {pendingFeatures.length > 0 ? (
            pendingFeatures.map((feature) => (
              <div
                key={feature.id}
                className={cn(
                  "p-4 rounded-xl",
                  "border border-[var(--border)]",
                  "bg-[var(--card)]"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[var(--foreground)]">
                        {feature.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={CATEGORY_COLORS[feature.category]}
                      >
                        {feature.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)] mb-2">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                      <span className="flex items-center gap-1">
                        <ThumbsUpIcon className="w-3 h-3" />
                        {feature.totalVoteCount} votes
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(feature.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={(phase) => handleApprove(feature, phase)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Approve to..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Phase</SelectItem>
                        {roadmap.map((phase) => (
                          <SelectItem key={phase.id} value={phase.name}>
                            {phase.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedFeature(feature);
                        setIsRejectDialogOpen(true);
                      }}
                      disabled={isPending}
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
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
              <CheckIcon className="w-12 h-12 mx-auto mb-4 text-[var(--success)]" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                All caught up!
              </h3>
              <p className="text-[var(--foreground-muted)]">
                No pending feature requests to review
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "approved" && (
        <div
          className="space-y-4"
          role="tabpanel"
          id="approved-panel"
          aria-labelledby="approved-tab"
        >
          {approvedFeatures.length > 0 ? (
            approvedFeatures.map((feature) => (
              <div
                key={feature.id}
                className={cn(
                  "p-4 rounded-xl",
                  "border border-[var(--border)]",
                  "bg-[var(--card)]"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[var(--foreground)]">
                        {feature.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={CATEGORY_COLORS[feature.category]}
                      >
                        {feature.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)] mb-2">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                      <span className="flex items-center gap-1">
                        <ThumbsUpIcon className="w-3 h-3" />
                        {feature.totalVoteCount} votes
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkImplemented(feature)}
                    disabled={isPending}
                  >
                    <RocketIcon className="w-4 h-4 mr-1" />
                    Mark Implemented
                  </Button>
                </div>
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
              <LightbulbIcon className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-muted)]" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                No approved features
              </h3>
              <p className="text-[var(--foreground-muted)]">
                Approved features will appear here
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "roadmap" && (
        <div
          className="space-y-6"
          role="tabpanel"
          id="roadmap-panel"
          aria-labelledby="roadmap-tab"
        >
          {roadmap.length > 0 ? (
            roadmap.map((phase) => (
              <div
                key={phase.id}
                className={cn(
                  "p-6 rounded-xl",
                  "border border-[var(--border)]",
                  "bg-[var(--card)]"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      phase.status === "completed" && "bg-[var(--success)]",
                      phase.status === "in_progress" && "bg-[var(--primary)]",
                      phase.status === "planned" && "bg-[var(--foreground-muted)]"
                    )}
                  />
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    {phase.title}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={cn(
                      phase.status === "completed" &&
                        "bg-[var(--success)]/10 text-[var(--success)]",
                      phase.status === "in_progress" &&
                        "bg-[var(--primary)]/10 text-[var(--primary)]",
                      phase.status === "planned" &&
                        "bg-[var(--foreground-muted)]/10 text-[var(--foreground-muted)]"
                    )}
                  >
                    {phase.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--foreground-muted)] mb-4">
                  {phase.description}
                </p>
                {phase.items && phase.items.length > 0 && (
                  <div className="space-y-2">
                    {phase.items.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg",
                          "bg-[var(--background-tertiary)]"
                        )}
                      >
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            item.status === "completed" && "bg-[var(--success)]",
                            item.status === "in_progress" && "bg-[var(--primary)]",
                            item.status === "planned" && "bg-[var(--foreground-muted)]"
                          )}
                        />
                        <span className="text-sm text-[var(--foreground)]">
                          {item.name}
                        </span>
                      </div>
                    ))}
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
              <RocketIcon className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-muted)]" />
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                No roadmap phases
              </h3>
              <p className="text-[var(--foreground-muted)]">
                Roadmap phases will appear here
              </p>
            </div>
          )}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reject Feature Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting &quot;{selectedFeature?.title}&quot;
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this feature request is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isPending}
              >
                {isPending && <LoaderIcon className="w-4 h-4 mr-2" />}
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
