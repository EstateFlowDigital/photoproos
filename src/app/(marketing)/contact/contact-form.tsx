"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/actions/marketing";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "general",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await submitContactForm(formData);

    setIsSubmitting(false);

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error);
    }
  };

  if (isSubmitted) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/10">
          <CheckIcon className="h-8 w-8 text-[var(--success)]" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Message Sent!
        </h2>
        <p className="mb-6 text-foreground-secondary">
          Thanks for reaching out. We'll get back to you within 24 hours.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFormData({
              name: "",
              email: "",
              company: "",
              subject: "general",
              message: "",
            });
          }}
          className="text-sm font-medium text-[var(--primary)] hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Send us a message
      </h2>
      {error && (
        <div className="mb-6 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Your Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder="John Smith"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="company"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Company / Studio
            </label>
            <input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              placeholder="Your Photography Studio"
            />
          </div>
          <div>
            <label
              htmlFor="subject"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Subject *
            </label>
            <select
              id="subject"
              required
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            >
              <option value="general">General Inquiry</option>
              <option value="sales">Sales Question</option>
              <option value="support">Technical Support</option>
              <option value="partnership">Partnership</option>
              <option value="press">Press Inquiry</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Message *
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            className="w-full resize-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            placeholder="How can we help you?"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              Sending...
            </>
          ) : (
            <>
              Send Message
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
