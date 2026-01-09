"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ExitIntentPopupProps {
  delay?: number; // Minimum time before popup can show (ms)
  cooldown?: number; // Time before popup can show again (ms)
}

export function ExitIntentPopup({
  delay = 3000, // 3 seconds minimum before showing
  cooldown = 86400000, // 24 hours before showing again
}: ExitIntentPopupProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [canShow, setCanShow] = React.useState(false);
  const hasShownRef = React.useRef(false);

  // Enable popup after delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Check if popup was shown recently
      const lastShown = localStorage.getItem("exitIntentLastShown");
      if (lastShown) {
        const elapsed = Date.now() - parseInt(lastShown, 10);
        if (elapsed < cooldown) {
          console.log("[Exit Intent] In cooldown period, not enabling");
          return; // Don't show if within cooldown period
        }
      }
      console.log("[Exit Intent] Ready - move mouse to top of browser to trigger");
      setCanShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, cooldown]);

  // Detect exit intent (mouse leaving viewport from top)
  React.useEffect(() => {
    if (!canShow || hasShownRef.current) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves through the top
      if (e.clientY <= 0 && !hasShownRef.current) {
        hasShownRef.current = true;
        setIsOpen(true);
        localStorage.setItem("exitIntentLastShown", Date.now().toString());
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [canShow]);

  // Handle ESC key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);

    // Simulate API call - replace with actual email capture logic
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsLoading(false);

    // Close after success animation
    setTimeout(() => {
      setIsOpen(false);
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 shadow-2xl",
          "animate-scale-in"
        )}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
          aria-label="Close popup"
        >
          <CloseIcon className="h-5 w-5" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Content */}
            <div className="mb-6 text-center">
              {/* Icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--ai)]">
                <GiftIcon className="h-8 w-8 text-white" />
              </div>

              <h2 id="exit-intent-title" className="mb-2 text-2xl font-bold text-foreground">
                Wait! Don't miss out.
              </h2>
              <p className="text-foreground-secondary">
                Get our free guide: <span className="font-medium text-foreground">"5 Ways to Double Your Photography Income"</span> plus early access when we launch.
              </p>
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-4 py-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                />
                <MailIcon className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "group relative w-full rounded-lg bg-white py-3 text-sm font-medium text-[#0A0A0A] transition-all",
                  isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-white/90"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    Subscribing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Get free guide
                    <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </button>
            </form>

            {/* Trust indicators */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-foreground-muted">
              <div className="flex items-center gap-1">
                <ShieldIcon className="h-3.5 w-3.5 text-[var(--success)]" />
                <span>No spam</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckIcon className="h-3.5 w-3.5 text-[var(--success)]" />
                <span>Unsubscribe anytime</span>
              </div>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="py-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/10">
              <CheckCircleIcon className="h-8 w-8 text-[var(--success)]" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-foreground">You're in!</h2>
            <p className="text-foreground-secondary">
              Check your inbox for your free guide. We'll let you know when PhotoProOS launches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading spinner
function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// Icons
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6a2.25 2.25 0 0 0 2.25-2.25v-6.75h-8.25Z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}
