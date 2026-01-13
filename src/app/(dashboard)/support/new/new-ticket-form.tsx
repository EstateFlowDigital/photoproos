"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, AlertCircle, Lightbulb, FileText, CreditCard, HelpCircle, MessageSquare, MoreHorizontal } from "lucide-react";
import { createSupportTicket } from "@/lib/actions/support-tickets";
import { useToast } from "@/components/ui/toast";
import type { SupportTicketCategory, SupportTicketPriority } from "@prisma/client";

const CATEGORIES: { value: SupportTicketCategory; label: string; icon: typeof HelpCircle; description: string }[] = [
  { value: "support_request", label: "Support Request", icon: MessageSquare, description: "General help with using the platform" },
  { value: "report_issue", label: "Report Issue", icon: AlertCircle, description: "Report a bug or technical problem" },
  { value: "billing", label: "Billing", icon: CreditCard, description: "Questions about payments or subscriptions" },
  { value: "questions", label: "Questions", icon: HelpCircle, description: "General questions about features" },
  { value: "feature_request", label: "Feature Request", icon: Lightbulb, description: "Suggest a new feature or improvement" },
  { value: "other", label: "Other", icon: MoreHorizontal, description: "Something else not listed above" },
];

const PRIORITIES: { value: SupportTicketPriority; label: string; description: string; color: string }[] = [
  { value: "low", label: "Low", description: "General question, no urgency", color: "bg-[var(--foreground-muted)]/10 text-foreground-muted" },
  { value: "medium", label: "Medium", description: "Needs attention soon", color: "bg-[var(--warning)]/10 text-[var(--warning)]" },
  { value: "high", label: "High", description: "Affecting my work", color: "bg-[var(--error)]/10 text-[var(--error)]" },
  { value: "urgent", label: "Urgent", description: "Business critical issue", color: "bg-[var(--error)] text-white" },
];

const SUGGESTED_ARTICLES = [
  { title: "Getting Started Guide", href: "/help/getting-started" },
  { title: "Managing Your Galleries", href: "/help/galleries" },
  { title: "Payment & Billing FAQ", href: "/help/billing" },
  { title: "Client Portal Setup", href: "/help/client-portal" },
];

export function NewTicketForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<SupportTicketCategory>("support_request");
  const [priority, setPriority] = useState<SupportTicketPriority>("medium");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim()) {
      showToast("Please enter a subject", "error");
      return;
    }

    if (!message.trim()) {
      showToast("Please enter a message", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSupportTicket({
        subject: subject.trim(),
        category,
        message: message.trim(),
        priority,
      });

      if (result.success && result.data) {
        showToast("Support ticket created successfully", "success");
        router.push(`/support/${result.data.id}`);
      } else {
        showToast(result.error || "Failed to create ticket", "error");
      }
    } catch {
      showToast("Failed to create ticket", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.value === category);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-4 py-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              disabled={isSubmitting}
            />
          </div>

          {/* Category Selection */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-foreground mb-4">
              Category
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    disabled={isSubmitting}
                    className={`flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--card-border)] bg-[var(--background-tertiary)] hover:border-[var(--border-hover)]"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isSelected ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "bg-[var(--card-border)] text-foreground-muted"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isSelected ? "text-[var(--primary)]" : "text-foreground"}`}>
                        {cat.label}
                      </p>
                      <p className="text-xs text-foreground-muted">{cat.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-foreground mb-4">
              Priority
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isSelected
                        ? p.color
                        : "bg-[var(--background-tertiary)] text-foreground-muted hover:bg-[var(--card-border)]"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-foreground-muted">
              {PRIORITIES.find((p) => p.value === priority)?.description}
            </p>
          </div>

          {/* Message */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail. Include any error messages, steps to reproduce, and what you expected to happen..."
              rows={6}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-4 py-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
              disabled={isSubmitting}
            />
            <p className="mt-2 text-xs text-foreground-muted">
              The more detail you provide, the faster we can help you.
            </p>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/support")}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !message.trim()}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Selected Category Info */}
        {selectedCategory && (
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                <selectedCategory.icon className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedCategory.label}</p>
                <p className="text-xs text-foreground-muted">Selected category</p>
              </div>
            </div>
            <p className="text-sm text-foreground-muted">{selectedCategory.description}</p>
          </div>
        )}

        {/* Suggested Articles */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-foreground-muted" />
            <h3 className="text-sm font-medium text-foreground">Before you submit</h3>
          </div>
          <p className="text-xs text-foreground-muted mb-4">
            Check if your question is already answered in our help center:
          </p>
          <div className="space-y-2">
            {SUGGESTED_ARTICLES.map((article) => (
              <a
                key={article.href}
                href={article.href}
                className="block rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm text-foreground hover:border-[var(--border-hover)] hover:bg-[var(--card-border)] transition-colors"
              >
                {article.title}
              </a>
            ))}
          </div>
        </div>

        {/* Response Time */}
        <div className="card p-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Response Times</h3>
          <div className="space-y-2 text-xs text-foreground-muted">
            <div className="flex justify-between">
              <span>Urgent:</span>
              <span className="text-[var(--error)]">Within 2 hours</span>
            </div>
            <div className="flex justify-between">
              <span>High:</span>
              <span className="text-[var(--warning)]">Within 4 hours</span>
            </div>
            <div className="flex justify-between">
              <span>Medium:</span>
              <span>Within 24 hours</span>
            </div>
            <div className="flex justify-between">
              <span>Low:</span>
              <span>Within 48 hours</span>
            </div>
          </div>
        </div>
      </div>
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
