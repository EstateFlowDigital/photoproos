"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  castVoteAsUser,
  submitFeatureRequestAsUser,
  sendVoterVerificationEmail,
} from "@/lib/actions/feature-voting";
import type { FeatureRequestCategory } from "@prisma/client";

// Icons
function ChevronUpIcon({ className }: { className?: string }) {
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
      <path d="m18 15-6-6-6 6" />
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

function PlusIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

interface RoadmapPhase {
  id: string;
  name: string;
  title: string;
  description: string;
  status: string;
  order: number;
  targetStartDate: Date | null;
  targetEndDate: Date | null;
  items: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    order: number;
    featureRequestId: string | null;
    voteCount: number;
  }[];
}

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: FeatureRequestCategory;
  status: string;
  userVoteCount: number;
  communityVoteCount: number;
  totalVoteCount: number;
  hasVoted: boolean;
  createdAt: Date;
}

interface RoadmapPageClientProps {
  roadmap: RoadmapPhase[];
  features: FeatureRequest[];
  isAuthenticated: boolean;
  userId?: string;
}

const CATEGORY_LABELS: Record<FeatureRequestCategory, string> = {
  galleries: "Galleries",
  payments: "Payments",
  scheduling: "Scheduling",
  clients: "Clients",
  marketing: "Marketing",
  analytics: "Analytics",
  integrations: "Integrations",
  other: "Other",
};

const CATEGORY_OPTIONS: { value: FeatureRequestCategory; label: string }[] = [
  { value: "galleries", label: "Galleries & Delivery" },
  { value: "payments", label: "Payments & Invoicing" },
  { value: "scheduling", label: "Scheduling & Bookings" },
  { value: "clients", label: "Client Management" },
  { value: "marketing", label: "Marketing & Email" },
  { value: "analytics", label: "Analytics & Reports" },
  { value: "integrations", label: "Integrations" },
  { value: "other", label: "Other" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  planned: {
    bg: "bg-[var(--foreground-muted)]/10",
    text: "text-[var(--foreground-muted)]",
    dot: "bg-[var(--foreground-muted)]/50",
  },
  in_progress: {
    bg: "bg-[var(--primary)]/10",
    text: "text-[var(--primary)]",
    dot: "bg-[var(--primary)]",
  },
  completed: {
    bg: "bg-[var(--success)]/10",
    text: "text-[var(--success)]",
    dot: "bg-[var(--success)]",
  },
  approved: {
    bg: "bg-[var(--primary)]/10",
    text: "text-[var(--primary)]",
    dot: "bg-[var(--primary)]",
  },
};

export function RoadmapPageClient({
  roadmap,
  features,
  isAuthenticated,
  userId,
}: RoadmapPageClientProps) {
  const [activeTab, setActiveTab] = useState<"roadmap" | "features">("roadmap");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [votingFeatureId, setVotingFeatureId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  // Feature request form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other" as FeatureRequestCategory,
  });

  // Verification state
  const [verifyEmail, setVerifyEmail] = useState("");

  const handleVote = (featureId: string) => {
    if (!isAuthenticated) {
      setVotingFeatureId(featureId);
      setIsVerifyOpen(true);
      return;
    }

    startTransition(async () => {
      const result = await castVoteAsUser(featureId);
      if (result.success) {
        toast({
          title: result.data?.voted ? "Vote cast!" : "Vote removed",
          description: result.data?.voted
            ? "Thanks for your feedback!"
            : "Your vote has been removed",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to vote",
          variant: "destructive",
        });
      }
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!isAuthenticated) {
      setIsSubmitOpen(false);
      setIsVerifyOpen(true);
      return;
    }

    startTransition(async () => {
      const result = await submitFeatureRequestAsUser(formData);
      if (result.success) {
        toast({
          title: "Request submitted!",
          description: "Thanks for your suggestion. We'll review it soon.",
        });
        setIsSubmitOpen(false);
        setFormData({ title: "", description: "", category: "other" });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit",
          variant: "destructive",
        });
      }
    });
  };

  const handleSendVerification = () => {
    if (!verifyEmail.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await sendVoterVerificationEmail(verifyEmail);
      if (result.success) {
        toast({
          title: "Verification email sent!",
          description: "Check your inbox to verify your email",
        });
        setIsVerifyOpen(false);
        setVerifyEmail("");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send verification",
          variant: "destructive",
        });
      }
    });
  };

  // Sort features by vote count
  const sortedFeatures = [...features].sort(
    (a, b) => b.totalVoteCount - a.totalVoteCount
  );

  return (
    <main className="relative min-h-screen bg-background" data-element="roadmap-page">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]" data-element="roadmap-hero">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-full max-w-[1512px] -translate-x-1/2"
            style={{
              background: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%)`,
            }}
          />
        </div>
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--ai)]/20 bg-[var(--ai)]/5 px-4 py-1.5 text-sm font-medium text-[var(--ai)]">
              Building together
            </span>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Product Roadmap
            </h1>
            <p className="text-lg text-foreground-secondary mb-8">
              See what we&apos;re building next and vote for the features you want most.
            </p>

            {/* Tabs */}
            <div className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--card)] p-1" data-element="roadmap-tabs">
              <button
                onClick={() => setActiveTab("roadmap")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "roadmap"
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
                data-element="roadmap-tab-roadmap"
              >
                Roadmap
              </button>
              <button
                onClick={() => setActiveTab("features")}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  activeTab === "features"
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
                )}
                data-element="roadmap-tab-features"
              >
                Feature Voting
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24" data-element="roadmap-content-section">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <AnimatePresence mode="wait">
            {activeTab === "roadmap" ? (
              <motion.div
                key="roadmap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="mx-auto max-w-4xl"
              >
                {roadmap.length > 0 ? (
                  <div className="space-y-8">
                    {roadmap.map((phase, index) => {
                      const statusStyle = STATUS_STYLES[phase.status] || STATUS_STYLES.planned;
                      return (
                        <div
                          key={phase.id}
                          className={cn(
                            "rounded-2xl border p-6 md:p-8",
                            phase.status === "in_progress"
                              ? "border-[var(--primary)] bg-gradient-to-b from-[var(--primary)]/5 to-transparent"
                              : "border-[var(--card-border)] bg-[var(--card)]"
                          )}
                        >
                          <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "flex h-10 w-10 items-center justify-center rounded-full font-bold text-white",
                                  phase.status === "completed"
                                    ? "bg-[var(--success)]"
                                    : phase.status === "in_progress"
                                      ? "bg-[var(--primary)]"
                                      : "bg-foreground-secondary/30"
                                )}
                              >
                                {phase.status === "completed" ? (
                                  <CheckIcon className="w-5 h-5" />
                                ) : (
                                  index + 1
                                )}
                              </div>
                              <div>
                                <p className="text-sm text-foreground-secondary">
                                  {phase.name}
                                </p>
                                <h2 className="text-xl font-bold text-foreground">
                                  {phase.title}
                                </h2>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "rounded-full px-3 py-1 text-xs font-medium",
                                statusStyle.bg,
                                statusStyle.text
                              )}
                            >
                              {phase.status === "completed"
                                ? "Completed"
                                : phase.status === "in_progress"
                                  ? "In Progress"
                                  : "Planned"}
                            </span>
                          </div>
                          <p className="mb-6 text-foreground-secondary">
                            {phase.description}
                          </p>
                          <div className="grid gap-2 md:grid-cols-2">
                            {phase.items.map((item) => {
                              const itemStatus = STATUS_STYLES[item.status] || STATUS_STYLES.planned;
                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 rounded-lg bg-[var(--background-tertiary)] px-4 py-3"
                                >
                                  <div
                                    className={cn(
                                      "h-2 w-2 rounded-full",
                                      itemStatus.dot
                                    )}
                                  />
                                  <span className="flex-1 text-sm text-foreground">
                                    {item.name}
                                  </span>
                                  {item.voteCount > 0 && (
                                    <span className="text-xs text-[var(--foreground-muted)]">
                                      {item.voteCount} votes
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-foreground-secondary">
                      No roadmap phases available yet.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="mx-auto max-w-4xl"
              >
                {/* Submit button */}
                <div className="flex justify-end mb-6">
                  <Button onClick={() => setIsSubmitOpen(true)}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Submit Request
                  </Button>
                </div>

                {/* Feature list */}
                {sortedFeatures.length > 0 ? (
                  <div className="space-y-4">
                    {sortedFeatures.map((feature, index) => {
                      const statusStyle =
                        STATUS_STYLES[feature.status] || STATUS_STYLES.planned;
                      return (
                        <motion.div
                          key={feature.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex gap-4 p-4 rounded-xl",
                            "border border-[var(--card-border)]",
                            "bg-[var(--card)]"
                          )}
                        >
                          {/* Vote button */}
                          <button
                            onClick={() => handleVote(feature.id)}
                            disabled={isPending}
                            className={cn(
                              "flex flex-col items-center justify-center",
                              "min-w-[60px] py-2 rounded-lg",
                              "border transition-all",
                              feature.hasVoted
                                ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                                : "bg-[var(--background-tertiary)] border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            )}
                          >
                            <ChevronUpIcon
                              className={cn(
                                "w-5 h-5",
                                feature.hasVoted && "text-[var(--primary)]"
                              )}
                            />
                            <span className="text-sm font-medium">
                              {feature.totalVoteCount}
                            </span>
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-medium text-foreground">
                                {feature.title}
                              </h3>
                              <Badge
                                variant="secondary"
                                className={cn("text-xs", statusStyle.text)}
                              >
                                {feature.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-foreground-secondary line-clamp-2 mb-2">
                              {feature.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
                              <Badge variant="outline" className="text-xs">
                                {CATEGORY_LABELS[feature.category]}
                              </Badge>
                              <span>
                                {feature.userVoteCount} users •{" "}
                                {feature.communityVoteCount} community
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-foreground-secondary mb-4">
                      No feature requests yet. Be the first to submit one!
                    </p>
                    <Button onClick={() => setIsSubmitOpen(true)}>
                      Submit Request
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Submit Dialog */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Feature Request</DialogTitle>
            <DialogDescription>
              Suggest a new feature or improvement. We review all submissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief title for your request"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as FeatureRequestCategory,
                  })
                }
                disabled={isPending}
                className={cn(
                  "w-full h-10 px-3 rounded-md",
                  "bg-[var(--background-tertiary)]",
                  "border border-[var(--border)]",
                  "text-sm text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                )}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your feature request in detail..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                disabled={isPending}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsSubmitOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending ? (
                  <>
                    <LoaderIcon className="w-4 h-4 mr-2" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Verify Your Email</DialogTitle>
            <DialogDescription>
              To vote or submit requests, please verify your email address.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={verifyEmail}
                onChange={(e) => setVerifyEmail(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsVerifyOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleSendVerification} disabled={isPending}>
                {isPending ? (
                  <>
                    <LoaderIcon className="w-4 h-4 mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send Verification"
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-[var(--foreground-muted)]">
              Already have an account?{" "}
              <a href="/sign-in" className="text-[var(--primary)] hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
