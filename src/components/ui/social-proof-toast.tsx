"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SignupNotification {
  name: string;
  location: string;
  specialty: string;
  timeAgo: string;
}

// Simulated recent signups - in production, this would come from an API
const recentSignups: SignupNotification[] = [
  { name: "Sarah M.", location: "Austin, TX", specialty: "Real Estate", timeAgo: "2 minutes ago" },
  { name: "Marcus C.", location: "San Diego, CA", specialty: "Architecture", timeAgo: "5 minutes ago" },
  { name: "Jennifer P.", location: "Miami, FL", specialty: "Events", timeAgo: "8 minutes ago" },
  { name: "David O.", location: "Seattle, WA", specialty: "Commercial", timeAgo: "12 minutes ago" },
  { name: "Emily R.", location: "Denver, CO", specialty: "Portraits", timeAgo: "15 minutes ago" },
  { name: "Michael T.", location: "Chicago, IL", specialty: "Food", timeAgo: "18 minutes ago" },
  { name: "Lisa K.", location: "Portland, OR", specialty: "Real Estate", timeAgo: "22 minutes ago" },
  { name: "James W.", location: "Boston, MA", specialty: "Corporate", timeAgo: "25 minutes ago" },
];

interface SocialProofToastProps {
  delay?: number; // Initial delay before first toast (ms)
  interval?: number; // Time between toasts (ms)
  duration?: number; // How long each toast shows (ms)
}

export function SocialProofToast({
  delay = 8000, // 8 seconds before first toast
  interval = 25000, // 25 seconds between toasts
  duration = 5000, // Show for 5 seconds
}: SocialProofToastProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [hasInteracted, setHasInteracted] = React.useState(false);

  // Cycle through notifications
  React.useEffect(() => {
    // Don't show if user has dismissed
    if (hasInteracted) return;

    // Initial delay
    const initialTimer = setTimeout(() => {
      setIsVisible(true);

      // Hide after duration
      setTimeout(() => setIsVisible(false), duration);
    }, delay);

    return () => clearTimeout(initialTimer);
  }, [delay, duration, hasInteracted]);

  // Show next notification after interval
  React.useEffect(() => {
    if (hasInteracted) return;

    const intervalTimer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % recentSignups.length);
      setIsVisible(true);

      // Hide after duration
      setTimeout(() => setIsVisible(false), duration);
    }, interval);

    return () => clearInterval(intervalTimer);
  }, [interval, duration, hasInteracted]);

  const handleDismiss = () => {
    setIsVisible(false);
    setHasInteracted(true);
    // Store in localStorage to persist preference
    localStorage.setItem("socialProofDismissed", "true");
  };

  // Check if previously dismissed
  React.useEffect(() => {
    const dismissed = localStorage.getItem("socialProofDismissed");
    if (dismissed === "true") {
      setHasInteracted(true);
    }
  }, []);

  const notification = recentSignups[currentIndex];

  if (hasInteracted) return null;

  return (
    <div
      className={cn(
        "fixed bottom-24 left-6 z-40 max-w-sm transition-all duration-500 ease-out",
        isVisible
          ? "translate-x-0 opacity-100"
          : "-translate-x-full opacity-0 pointer-events-none"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-2xl">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute -right-2 -top-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--background-elevated)] text-foreground-muted shadow-md transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
          aria-label="Dismiss notifications"
        >
          <CloseIcon className="h-3 w-3" />
        </button>

        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] text-sm font-semibold text-white">
            {notification.name.charAt(0)}
          </div>

          {/* Content */}
          <div className="min-w-0">
            <p className="text-sm text-foreground">
              <span className="font-medium">{notification.name}</span>
              <span className="text-foreground-muted"> from </span>
              <span className="font-medium">{notification.location}</span>
            </p>
            <p className="mt-0.5 text-xs text-foreground-muted">
              Just started their free trial
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs text-[var(--primary)]">
                <CameraIcon className="h-3 w-3" />
                {notification.specialty}
              </span>
              <span className="text-xs text-foreground-muted">
                {notification.timeAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Verified badge */}
        <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--card-border)] pt-3 text-xs text-foreground-muted">
          <VerifiedIcon className="h-3.5 w-3.5 text-[var(--success)]" />
          <span>Verified signup</span>
        </div>
      </div>
    </div>
  );
}

// Icons
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M1 8a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 8.07 3h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 16.07 6H17a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8Zm13.5 3a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function VerifiedIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}
