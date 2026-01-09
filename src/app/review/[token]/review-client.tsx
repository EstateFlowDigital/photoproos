"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Star, ExternalLink, Loader2 } from "lucide-react";
import type { ReviewPlatformType } from "@prisma/client";
import {
  submitReviewResponse,
  recordPlatformClick,
} from "@/lib/actions/review-gate";

// =============================================================================
// Types
// =============================================================================

interface Platform {
  id: string;
  type: ReviewPlatformType;
  name: string;
  url: string;
  iconUrl: string | null;
}

interface ReviewClientProps {
  token: string;
  organizationName: string;
  logoUrl: string | null;
  primaryColor: string;
  clientName: string | null;
  platforms: Platform[];
  preferredPlatform: Platform | null;
}

// =============================================================================
// Constants
// =============================================================================

const PLATFORM_ICONS: Record<ReviewPlatformType, string> = {
  google_business: "G",
  yelp: "Y",
  tripadvisor: "T",
  facebook: "f",
  thumbtack: "T",
  wedding_wire: "W",
  the_knot: "K",
  custom: "?",
};

const PLATFORM_COLORS: Record<ReviewPlatformType, string> = {
  google_business: "bg-blue-500 hover:bg-blue-600",
  yelp: "bg-red-500 hover:bg-red-600",
  tripadvisor: "bg-green-500 hover:bg-green-600",
  facebook: "bg-indigo-500 hover:bg-indigo-600",
  thumbtack: "bg-orange-500 hover:bg-orange-600",
  wedding_wire: "bg-pink-500 hover:bg-pink-600",
  the_knot: "bg-purple-500 hover:bg-purple-600",
  custom: "bg-gray-500 hover:bg-gray-600",
};

const FEEDBACK_CATEGORIES = [
  { id: "communication", label: "Communication" },
  { id: "quality", label: "Photo Quality" },
  { id: "timing", label: "Timing / Punctuality" },
  { id: "professionalism", label: "Professionalism" },
  { id: "pricing", label: "Pricing" },
  { id: "other", label: "Other" },
];

// =============================================================================
// Component
// =============================================================================

export function ReviewClient({
  token,
  organizationName,
  logoUrl,
  primaryColor,
  clientName,
  platforms,
  preferredPlatform,
}: ReviewClientProps) {
  const router = useRouter();
  const [step, setStep] = useState<"rating" | "feedback" | "platforms">("rating");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingSelect = async (selectedRating: number) => {
    setRating(selectedRating);
    setError(null);

    // For high ratings (4-5), go straight to platforms
    if (selectedRating >= 4) {
      setIsSubmitting(true);
      const result = await submitReviewResponse({
        token,
        rating: selectedRating,
      });
      setIsSubmitting(false);

      if (result.success) {
        setStep("platforms");
      } else {
        setError(result.error);
      }
    } else {
      // For low ratings (1-3), show feedback form
      setStep("feedback");
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackCategory) {
      setError("Please select a category");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = await submitReviewResponse({
      token,
      rating,
      feedback,
      feedbackCategory,
    });

    setIsSubmitting(false);

    if (result.success) {
      router.push(`/review/${token}/thank-you`);
    } else {
      setError(result.error);
    }
  };

  const handlePlatformClick = async (platform: Platform) => {
    // Record the click
    await recordPlatformClick(token, platform.id);
    // Open the platform URL
    window.open(platform.url, "_blank", "noopener,noreferrer");
  };

  // Render star rating
  const renderStars = () => (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={isSubmitting}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => handleRatingSelect(star)}
          className={cn(
            "p-2 transition-all duration-200",
            isSubmitting && "cursor-wait opacity-50"
          )}
        >
          <Star
            className={cn(
              "h-12 w-12 transition-all duration-200 sm:h-14 sm:w-14",
              (hoveredRating >= star || rating >= star)
                ? "fill-amber-400 text-amber-400 scale-110"
                : "text-gray-600 hover:text-gray-400"
            )}
          />
        </button>
      ))}
    </div>
  );

  // Render rating step
  if (step === "rating") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        <div className="max-w-lg w-full text-center">
          {/* Logo */}
          {logoUrl && (
            <div className="mb-8">
              <Image
                src={logoUrl}
                alt={organizationName}
                width={180}
                height={60}
                className="mx-auto h-12 w-auto object-contain"
              />
            </div>
          )}

          {/* Greeting */}
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {clientName ? `Hi ${clientName}!` : "Hello!"}
          </h1>
          <p className="mt-3 text-gray-400">
            How was your experience with {organizationName}?
          </p>

          {/* Stars */}
          <div className="mt-8">{renderStars()}</div>

          {/* Labels */}
          <div className="mt-4 flex justify-between px-4 text-sm text-gray-500">
            <span>Not great</span>
            <span>Amazing!</span>
          </div>

          {/* Loading */}
          {isSubmitting && (
            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving your rating...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // Render feedback step (for low ratings)
  if (step === "feedback") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        <div className="max-w-lg w-full">
          {/* Logo */}
          {logoUrl && (
            <div className="mb-8 text-center">
              <Image
                src={logoUrl}
                alt={organizationName}
                width={180}
                height={60}
                className="mx-auto h-12 w-auto object-contain"
              />
            </div>
          )}

          <div className="rounded-2xl border border-gray-800 bg-[#141414] p-6 sm:p-8">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              We'd love to hear more
            </h2>
            <p className="mt-2 text-gray-400">
              Your feedback helps us improve. What could we have done better?
            </p>

            {/* Category Selection */}
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-300">
                What area needs improvement?
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                {FEEDBACK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFeedbackCategory(cat.id)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      feedbackCategory === cat.id
                        ? "bg-white text-gray-900"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Text */}
            <div className="mt-6">
              <label className="text-sm font-medium text-gray-300">
                Tell us more (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share any specific details that would help us improve..."
                rows={4}
                className="mt-2 w-full rounded-xl border border-gray-700 bg-[#1E1E1E] px-4 py-3 text-white placeholder:text-gray-500 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="mt-4 text-sm text-red-400">{error}</p>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleFeedbackSubmit}
              disabled={isSubmitting}
              className={cn(
                "mt-6 w-full rounded-xl py-3 text-base font-semibold text-white transition-colors",
                isSubmitting
                  ? "cursor-wait bg-gray-700"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Feedback"
              )}
            </button>

            {/* Back */}
            <button
              type="button"
              onClick={() => {
                setStep("rating");
                setRating(0);
              }}
              className="mt-3 w-full text-center text-sm text-gray-500 hover:text-gray-300"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render platforms step (for high ratings)
  if (step === "platforms") {
    const displayPlatforms = preferredPlatform
      ? [preferredPlatform, ...platforms.filter((p) => p.id !== preferredPlatform.id)]
      : platforms;

    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        <div className="max-w-lg w-full">
          {/* Logo */}
          {logoUrl && (
            <div className="mb-8 text-center">
              <Image
                src={logoUrl}
                alt={organizationName}
                width={180}
                height={60}
                className="mx-auto h-12 w-auto object-contain"
              />
            </div>
          )}

          <div className="rounded-2xl border border-gray-800 bg-[#141414] p-6 sm:p-8 text-center">
            {/* Success Icon */}
            <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-green-500/10">
              <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
            </div>

            <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl">
              Thank you for the {rating}-star rating!
            </h2>
            <p className="mt-2 text-gray-400">
              Would you mind sharing your experience on one of these platforms?
              It would really help us out!
            </p>

            {/* Platform Buttons */}
            <div className="mt-6 space-y-3">
              {displayPlatforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => handlePlatformClick(platform)}
                  className={cn(
                    "flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-white font-semibold transition-all",
                    PLATFORM_COLORS[platform.type]
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">
                    {PLATFORM_ICONS[platform.type]}
                  </span>
                  <span>{platform.name}</span>
                  <ExternalLink className="h-4 w-4 ml-auto opacity-60" />
                </button>
              ))}
            </div>

            {/* Skip */}
            <button
              type="button"
              onClick={() => router.push(`/review/${token}/thank-you`)}
              className="mt-6 text-sm text-gray-500 hover:text-gray-300"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
