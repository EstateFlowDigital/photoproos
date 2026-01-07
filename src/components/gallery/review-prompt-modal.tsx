"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ReviewPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  photographerName: string;
  primaryColor?: string;
  reviewUrl?: string;
}

/**
 * Review Prompt Modal
 *
 * Shows after a client has viewed the gallery for a while,
 * prompting them to leave a review. Includes a subtle
 * star animation and links to the review page.
 */
export function ReviewPromptModal({
  isOpen,
  onClose,
  photographerName,
  primaryColor = "#3b82f6",
  reviewUrl,
}: ReviewPromptModalProps) {
  const [animateStars, setAnimateStars] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Start star animation after modal opens
      const timer = setTimeout(() => setAnimateStars(true), 100);
      return () => clearTimeout(timer);
    } else {
      setAnimateStars(false);
    }
  }, [isOpen]);

  if (!isOpen || !reviewUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-prompt-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-[rgba(255,255,255,0.1)] bg-[#141414] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-[#7c7c7c] hover:bg-[rgba(255,255,255,0.1)] hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>

        {/* Star Icon with Animation */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              "flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/10 transition-transform duration-500",
              animateStars && "scale-110"
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#fbbf24"
              className={cn(
                "h-8 w-8 transition-all duration-500",
                animateStars && "animate-pulse"
              )}
            >
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h2
          id="review-prompt-title"
          className="text-xl font-semibold text-white text-center mb-2"
        >
          Enjoying your photos?
        </h2>

        <p className="text-[#a7a7a7] text-center mb-6">
          We&apos;d love to hear about your experience with {photographerName}!
          Your feedback helps us improve and helps others find great photography.
        </p>

        {/* Star Preview */}
        <div className="flex justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fbbf24"
              strokeWidth={1.5}
              className={cn(
                "h-7 w-7 transition-all duration-300",
                animateStars && `animate-pulse delay-${star * 100}`
              )}
              style={{
                animationDelay: animateStars ? `${star * 100}ms` : "0ms",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <a
            href={reviewUrl}
            className="flex items-center justify-center gap-2 rounded-lg py-3 px-4 text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                clipRule="evenodd"
              />
            </svg>
            Share Your Feedback
          </a>

          <button
            onClick={onClose}
            className="text-[#7c7c7c] hover:text-white text-sm transition-colors py-2"
          >
            Maybe later
          </button>
        </div>

        {/* Trust Indicator */}
        <p className="text-xs text-[#7c7c7c] text-center mt-4">
          It only takes about 30 seconds
        </p>
      </div>
    </div>
  );
}

/**
 * Hook to manage review prompt timing
 *
 * Shows the review prompt after a delay when the user
 * has been viewing the gallery for a while.
 */
export function useReviewPrompt(options: {
  enabled: boolean;
  delayMs?: number;
  galleryId: string;
}) {
  const { enabled, delayMs = 60000, galleryId } = options; // Default 60 seconds
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Check if prompt was already shown for this gallery
    const shownKey = `review_prompt_shown_${galleryId}`;
    const alreadyShown = sessionStorage.getItem(shownKey);

    if (alreadyShown) return;

    // Show prompt after delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
      sessionStorage.setItem(shownKey, "true");
    }, delayMs);

    return () => clearTimeout(timer);
  }, [enabled, delayMs, galleryId]);

  const dismissPrompt = () => {
    setShowPrompt(false);
  };

  return {
    showPrompt,
    dismissPrompt,
  };
}
