"use client";

import { useState, useEffect, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  submitPlatformFeedback,
  shouldShowFeedbackModal,
} from "@/lib/actions/platform-feedback";
import { motion, AnimatePresence } from "framer-motion";

// Icons
function StarIcon({
  className,
  filled,
}: {
  className?: string;
  filled?: boolean;
}) {
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

function SparklesIcon({ className }: { className?: string }) {
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
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
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

function CheckCircleIcon({ className }: { className?: string }) {
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
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const LIKED_FEATURES = [
  "Easy to use",
  "Fast delivery",
  "Client portal",
  "Payment processing",
  "Mobile experience",
  "Scheduling",
  "Invoicing",
  "Galleries",
];

const DISLIKED_FEATURES = [
  "Performance",
  "Mobile app",
  "Pricing",
  "Missing features",
  "Learning curve",
  "Limited customization",
  "Integrations",
  "Support",
];

type Step = "rating" | "features" | "comment" | "success";

export function FeedbackModal() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>("rating");
  const [rating, setRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [likedFeatures, setLikedFeatures] = useState<string[]>([]);
  const [dislikedFeatures, setDislikedFeatures] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [xpAwarded, setXpAwarded] = useState(0);

  // Check if should show modal
  useEffect(() => {
    const checkModal = async () => {
      // Check if already dismissed this session
      const dismissed = sessionStorage.getItem("feedback_dismissed");
      if (dismissed) return;

      const result = await shouldShowFeedbackModal();
      if (result.success && result.data?.show) {
        // Small delay before showing
        setTimeout(() => setIsOpen(true), 2000);
      }
    };

    checkModal();
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("feedback_dismissed", "true");
    setIsOpen(false);
  };

  const toggleLiked = (feature: string) => {
    setLikedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const toggleDisliked = (feature: string) => {
    setDislikedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSubmit = () => {
    if (rating === null) {
      setStep("rating");
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      const result = await submitPlatformFeedback({
        rating,
        likedFeatures,
        dislikedFeatures,
        comment: comment.trim() || undefined,
        source: "session_modal",
      });

      if (result.success && result.data) {
        setXpAwarded(result.data.xpAwarded);
        setStep("success");
        sessionStorage.setItem("feedback_dismissed", "true");
      } else {
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const canProceed = () => {
    if (step === "rating") return rating !== null;
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent className="sm:max-w-[500px]">
        <AnimatePresence mode="wait">
          {step === "rating" && (
            <motion.div
              key="rating"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-[var(--warning)]" />
                  How are we doing?
                </DialogTitle>
                <DialogDescription>
                  Your feedback helps us improve the platform. Takes less than a
                  minute!
                </DialogDescription>
              </DialogHeader>

              <div className="py-8">
                <p className="text-center text-sm text-[var(--foreground-muted)] mb-4">
                  Rate your overall experience
                </p>
                <div
                  className="flex items-center justify-center gap-2"
                  role="radiogroup"
                  aria-label="Rate your experience from 1 to 5 stars"
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowRight" && star < 5) setRating(star + 1);
                        if (e.key === "ArrowLeft" && star > 1) setRating(star - 1);
                      }}
                      role="radio"
                      aria-checked={rating === star}
                      aria-label={`${star} star${star > 1 ? "s" : ""}`}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] rounded"
                    >
                      <StarIcon
                        className={cn(
                          "w-10 h-10 transition-colors",
                          (hoveredRating !== null
                            ? star <= hoveredRating
                            : rating !== null && star <= rating)
                            ? "text-[var(--warning)] fill-[var(--warning)]"
                            : "text-[var(--foreground-muted)]"
                        )}
                        filled={
                          hoveredRating !== null
                            ? star <= hoveredRating
                            : rating !== null && star <= rating
                        }
                      />
                    </button>
                  ))}
                </div>
                {rating !== null && (
                  <p className="text-center text-sm text-[var(--foreground-muted)] mt-4">
                    {rating === 1 && "We're sorry to hear that. Let us know how we can improve."}
                    {rating === 2 && "There's room for improvement. Tell us more!"}
                    {rating === 3 && "Thanks! What could make it better?"}
                    {rating === 4 && "Great! We'd love to know what you like."}
                    {rating === 5 && "Awesome! We're thrilled you're enjoying it."}
                  </p>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={handleDismiss}>
                  Maybe later
                </Button>
                <Button onClick={() => setStep("features")} disabled={!canProceed()}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {step === "features" && (
            <motion.div
              key="features"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle>What do you think?</DialogTitle>
                <DialogDescription>
                  Select features you like or think need improvement (optional)
                </DialogDescription>
              </DialogHeader>

              <div className="py-6 space-y-6">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-3">
                    What's working well?
                  </p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Features working well">
                    {LIKED_FEATURES.map((feature) => (
                      <Badge
                        key={feature}
                        variant="secondary"
                        role="checkbox"
                        aria-checked={likedFeatures.includes(feature)}
                        tabIndex={0}
                        className={cn(
                          "cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
                          likedFeatures.includes(feature)
                            ? "bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/30"
                            : "hover:bg-[var(--background-elevated)]"
                        )}
                        onClick={() => toggleLiked(feature)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleLiked(feature);
                          }
                        }}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-3">
                    What needs improvement?
                  </p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Features needing improvement">
                    {DISLIKED_FEATURES.map((feature) => (
                      <Badge
                        key={feature}
                        variant="secondary"
                        role="checkbox"
                        aria-checked={dislikedFeatures.includes(feature)}
                        tabIndex={0}
                        className={cn(
                          "cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]",
                          dislikedFeatures.includes(feature)
                            ? "bg-[var(--error)]/20 text-[var(--error)] border-[var(--error)]/30"
                            : "hover:bg-[var(--background-elevated)]"
                        )}
                        onClick={() => toggleDisliked(feature)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleDisliked(feature);
                          }
                        }}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep("rating")}>
                  Back
                </Button>
                <Button onClick={() => setStep("comment")}>Continue</Button>
              </div>
            </motion.div>
          )}

          {step === "comment" && (
            <motion.div
              key="comment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <DialogHeader>
                <DialogTitle>Any additional thoughts?</DialogTitle>
                <DialogDescription>
                  Share any specific feedback or suggestions (optional)
                </DialogDescription>
              </DialogHeader>

              <div className="py-6">
                <Textarea
                  placeholder="Tell us what's on your mind..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep("features")}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isPending}>
                  {isPending ? (
                    <>
                      <LoaderIcon className="w-4 h-4 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div
                className={cn(
                  "w-16 h-16 mx-auto mb-4 rounded-full",
                  "bg-[var(--success)]/10",
                  "flex items-center justify-center"
                )}
              >
                <CheckCircleIcon className="w-8 h-8 text-[var(--success)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
                Thank you!
              </h3>
              <p className="text-[var(--foreground-muted)] mb-4">
                Your feedback helps us build a better platform.
              </p>
              {xpAwarded > 0 && (
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-full",
                    "bg-[var(--warning)]/10 text-[var(--warning)]"
                  )}
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span className="font-medium">+{xpAwarded} XP earned!</span>
                </div>
              )}
              <div className="mt-6">
                <Button onClick={() => setIsOpen(false)}>Continue</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
