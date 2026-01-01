"use client";

import * as React from "react";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    // TODO: Implement actual newsletter signup
    // For now, just simulate success
    await new Promise((resolve) => setTimeout(resolve, 500));
    setStatus("success");
    setEmail("");
  };

  return (
    <div>
      {status === "success" ? (
        <div className="mx-auto max-w-md rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/30 p-4">
          <p className="text-sm text-[var(--success)]">
            Thanks for subscribing! Check your inbox for confirmation.
          </p>
        </div>
      ) : (
        <form className="mx-auto flex max-w-md gap-3" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </form>
      )}
      <p className="mt-4 text-xs text-foreground-muted">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
