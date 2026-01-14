"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { submitChatInquiry } from "@/lib/actions/chat-inquiries";

interface ChatWidgetProps {
  delay?: number; // Delay before showing the widget
}

interface Message {
  id: string;
  type: "user" | "system";
  content: string;
  timestamp: Date;
}

export function ChatWidget({ delay = 3000 }: ChatWidgetProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showEmailField, setShowEmailField] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [showTypingIndicator, setShowTypingIndicator] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Show widget after delay
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Handle ESC key and focus trap
  React.useEffect(() => {
    if (!isOpen) return;

    // Auto-focus input when panel opens
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        return;
      }

      // Focus trap
      if (e.key === "Tab" && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showTypingIndicator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    // Clear any previous error
    setError(null);

    // Add user message to conversation
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsSubmitting(true);

    try {
      const result = await submitChatInquiry({
        email: email || undefined,
        message: userMessage.content,
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      });

      if (result.success) {
        // Show typing indicator
        setShowTypingIndicator(true);

        // Simulate response delay for natural feel
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setShowTypingIndicator(false);

        // Add system response
        const systemMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "system",
          content: "Thanks for your message! Our team will get back to you shortly. We typically respond within a few minutes during business hours.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, systemMessage]);

        // Clear email field after successful submission
        if (email) {
          setEmail("");
          setShowEmailField(false);
        }
      } else {
        setError("Failed to send message. Please try again.");
        console.error("[Chat Widget] Error:", result.error);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("[Chat Widget] Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setMessage(`Tell me about ${question.toLowerCase()}`);
    inputRef.current?.focus();
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
            <span className="absolute inset-0 motion-safe:animate-ping rounded-full bg-[var(--primary)] opacity-20" />
          </>
        )}
      </button>

      {/* Chat panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-widget-title"
        className={cn(
          "fixed bottom-24 right-6 z-50 w-80 sm:w-96 transition-all duration-300",
          isOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
          {/* Header */}
          <div className="shrink-0 bg-gradient-to-r from-[var(--primary)] to-[var(--ai)] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                  <SupportIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p id="chat-widget-title" className="font-medium text-white">PhotoProOS Support</p>
                  <div className="flex items-center gap-1.5 text-xs text-white/80">
                    <span className="h-2 w-2 rounded-full bg-green-400" aria-hidden="true" />
                    <span>We typically reply in a few minutes</span>
                  </div>
                </div>
              </div>
              {/* Close button in header */}
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                aria-label="Close chat"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body - scrollable */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Welcome message - always shown */}
            <div className="mb-4 rounded-lg bg-[var(--background-elevated)] p-3">
              <p className="text-sm text-foreground">
                Hi there! Have a question about PhotoProOS? We're here to help.
              </p>
            </div>

            {/* Conversation history */}
            {messages.length > 0 && (
              <div className="mb-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.type === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                        msg.type === "user"
                          ? "bg-[var(--primary)] text-white rounded-br-md"
                          : "bg-[var(--background-elevated)] text-foreground rounded-bl-md"
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {showTypingIndicator && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-md bg-[var(--background-elevated)] px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-foreground-muted motion-safe:animate-bounce [animation-delay:0ms]" />
                        <span className="h-2 w-2 rounded-full bg-foreground-muted motion-safe:animate-bounce [animation-delay:150ms]" />
                        <span className="h-2 w-2 rounded-full bg-foreground-muted motion-safe:animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Quick questions - only show when no conversation yet */}
            {messages.length === 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Quick questions
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Pricing", "Features", "Free trial", "Demo"].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickQuestion(q)}
                      className="rounded-full border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-1.5 text-xs text-foreground-secondary transition-colors hover:border-[var(--primary)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 p-3 text-sm text-[var(--error)]" role="alert">
                <ErrorIcon className="h-4 w-4 shrink-0" />
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto shrink-0 text-[var(--error)]/70 hover:text-[var(--error)]"
                  aria-label="Dismiss error"
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Input area - fixed at bottom */}
          <div className="shrink-0 border-t border-[var(--card-border)] p-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              {showEmailField && (
                <div>
                  <label htmlFor="chat-email" className="sr-only">Your email (optional)</label>
                  <input
                    id="chat-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email (optional)"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                  />
                </div>
              )}
              <div className="relative">
                <label htmlFor="chat-message" className="sr-only">Type your message</label>
                <input
                  ref={inputRef}
                  id="chat-message"
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isSubmitting}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-4 py-3 pr-12 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isSubmitting}
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md bg-[var(--primary)] text-white transition-all hover:bg-[var(--primary)]/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                  aria-label="Send message"
                >
                  {isSubmitting ? (
                    <LoadingIcon className="h-4 w-4 motion-safe:animate-spin" />
                  ) : (
                    <SendIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
              {!showEmailField && (
                <button
                  type="button"
                  onClick={() => setShowEmailField(true)}
                  className="text-xs text-foreground-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  + Add email for a reply
                </button>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-[var(--card-border)] px-4 py-2 text-center text-xs text-foreground-muted">
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

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}
