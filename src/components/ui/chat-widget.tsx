"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { submitChatInquiry } from "@/lib/actions/chat-inquiries";

interface ChatWidgetProps {
  delay?: number; // Delay before showing the widget
}

export function ChatWidget({ delay = 3000 }: ChatWidgetProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showEmailField, setShowEmailField] = React.useState(false);

  // Show widget after delay
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await submitChatInquiry({
        email: email || undefined,
        message,
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      });

      if (result.success) {
        setIsSubmitted(true);
        setMessage("");
        setEmail("");
        setShowEmailField(false);

        // Reset after 3 seconds
        setTimeout(() => {
          setIsSubmitted(false);
          setIsOpen(false);
        }, 3000);
      } else {
        console.error("[Chat Widget] Error:", result.error);
      }
    } catch (error) {
      console.error("[Chat Widget] Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-2xl transition-all duration-300",
          isOpen
            ? "bg-[var(--background-elevated)] text-foreground"
            : "bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] text-white hover:scale-105"
        )}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <CloseIcon className="h-6 w-6" />
        ) : (
          <>
            <ChatIcon className="h-6 w-6" />
            {/* Pulse animation */}
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--primary)] opacity-20" />
          </>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 w-80 transition-all duration-300",
          isOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <SupportIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">PhotoProOS Support</p>
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span>We typically reply in a few minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-4">
            {!isSubmitted ? (
              <>
                {/* Welcome message */}
                <div className="mb-4 rounded-lg bg-[var(--background-elevated)] p-3">
                  <p className="text-sm text-foreground">
                    Hi there! Have a question about PhotoProOS? We're here to help.
                  </p>
                </div>

                {/* Quick questions */}
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Quick questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Pricing", "Features", "Free trial"].map((q) => (
                      <button
                        key={q}
                        onClick={() => setMessage(`Tell me about ${q.toLowerCase()}`)}
                        className="rounded-full border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-1 text-xs text-foreground-secondary transition-colors hover:border-[var(--primary)] hover:text-foreground"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message input */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {showEmailField && (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email (optional)"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                  )}
                  <div className="relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-4 py-3 pr-12 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || isSubmitting}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-[var(--primary)] text-white transition-opacity disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <LoadingIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <SendIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {!showEmailField && (
                    <button
                      type="button"
                      onClick={() => setShowEmailField(true)}
                      className="text-xs text-foreground-muted hover:text-foreground transition-colors"
                    >
                      + Add email for a reply
                    </button>
                  )}
                </form>
              </>
            ) : (
              /* Success state */
              <div className="py-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/10">
                  <CheckIcon className="h-6 w-6 text-[var(--success)]" />
                </div>
                <p className="font-medium text-foreground">Message sent!</p>
                <p className="mt-1 text-sm text-foreground-muted">
                  We'll get back to you shortly.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--card-border)] px-4 py-2 text-center text-xs text-foreground-muted">
            Powered by PhotoProOS
          </div>
        </div>
      </div>
    </>
  );
}

// Icons
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function SupportIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" clipRule="evenodd" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}
