"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, CheckCircle2 } from "lucide-react";
import { createSupportTicket } from "@/lib/actions/support-tickets";
import { useToast } from "@/components/ui/toast";
import type { SupportTicketCategory } from "@prisma/client";

const SUBJECT_TO_CATEGORY: Record<string, SupportTicketCategory> = {
  "General Question": "questions",
  "Technical Issue": "report_issue",
  "Billing Inquiry": "billing",
  "Feature Request": "feature_request",
  "Account Issue": "support_request",
  "Other": "other",
};

export function ContactForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Question");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Please enter your name", "error");
      return;
    }

    if (!email.trim()) {
      showToast("Please enter your email", "error");
      return;
    }

    if (!message.trim()) {
      showToast("Please enter a message", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const category = SUBJECT_TO_CATEGORY[subject] || "other";
      const result = await createSupportTicket({
        subject: `[Contact Form] ${subject}: ${name}`,
        category,
        message: `From: ${name} <${email}>\n\n${message}`,
        priority: "medium",
      });

      if (result.success && result.data) {
        setIsSuccess(true);
        setTicketId(result.data.id);
        showToast("Message sent successfully!", "success");
      } else {
        showToast(result.error || "Failed to send message", "error");
      }
    } catch {
      showToast("Failed to send message", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/10">
          <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          Message Sent Successfully!
        </h3>
        <p className="mt-2 text-sm text-foreground-muted">
          We&apos;ve received your message and will get back to you within 24 hours.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          {ticketId && (
            <button
              onClick={() => router.push(`/support/${ticketId}`)}
              className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              View Ticket
            </button>
          )}
          <Link
            href="/help"
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h3 className="text-base font-semibold text-foreground">
        Send us a Message
      </h3>
      <p className="mt-1 text-sm text-foreground-muted">
        Fill out the form below and we&apos;ll respond as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-foreground"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
              placeholder="Your name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-foreground"
          >
            Subject
          </label>
          <select
            id="subject"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSubmitting}
            className="mt-1.5 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
          >
            <option>General Question</option>
            <option>Technical Issue</option>
            <option>Billing Inquiry</option>
            <option>Feature Request</option>
            <option>Account Issue</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-foreground"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSubmitting}
            className="mt-1.5 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
            placeholder="Describe your issue or question in detail..."
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/help"
            className="rounded-lg border border-[var(--card-border)] bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner className="h-4 w-4" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
