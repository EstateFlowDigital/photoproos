"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LeadGateProps {
  slug: string;
  websiteName: string;
  message?: string | null;
  primaryColor?: string | null;
}

export function LeadGate({ slug, websiteName, message, primaryColor }: LeadGateProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accentColor = primaryColor || "#3b82f6";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/portfolio/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email, name }),
      });

      const data = await response.json();

      if (data.success) {
        router.refresh();
      } else {
        setError(data.error || "Failed to submit. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#141414] p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${accentColor}20` }}
            >
              <LockIcon className="h-8 w-8" style={{ color: accentColor }} />
            </div>
            <h1 className="text-2xl font-bold text-white">{websiteName}</h1>
            <p className="mt-2 text-[#A7A7A7]">
              {message || "Enter your email to view this portfolio."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#A7A7A7]">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A] px-4 py-3 text-white placeholder-[#7C7C7C] outline-none transition-colors focus:border-[rgba(255,255,255,0.24)]"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#A7A7A7]">
                Email <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="mt-1 w-full rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A] px-4 py-3 text-white placeholder-[#7C7C7C] outline-none transition-colors focus:border-[rgba(255,255,255,0.24)]"
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--error)]">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              {isSubmitting ? "Loading..." : "View Portfolio"}
            </button>
          </form>

          {/* Privacy note */}
          <p className="mt-6 text-center text-xs text-[#7C7C7C]">
            Your information will only be shared with the portfolio owner.
          </p>
        </div>

        {/* Powered by */}
        <p className="mt-6 text-center text-xs text-[#7C7C7C]">
          Powered by{" "}
          <a
            href="https://photoproos.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] hover:underline"
          >
            PhotoProOS
          </a>
        </p>
      </div>
    </div>
  );
}

function LockIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
