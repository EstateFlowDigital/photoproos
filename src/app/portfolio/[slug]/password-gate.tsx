"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { verifyPortfolioPassword } from "@/lib/actions/portfolio-websites";

interface PasswordGateProps {
  slug: string;
  websiteName: string;
}

export function PasswordGate({ slug, websiteName }: PasswordGateProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await verifyPortfolioPassword(slug, password);

      if (result.success) {
        // Set a cookie to remember access (expires in 24 hours)
        document.cookie = `portfolio-access-${slug}=granted; path=/; max-age=86400; SameSite=Lax`;
        router.refresh();
      } else {
        setError(result.error || "Incorrect password");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8">
          {/* Lock Icon */}
          <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--background-elevated)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-[var(--foreground-muted)]"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="mt-6 text-center text-xl font-semibold text-white">
            Password Protected
          </h1>
          <p className="mt-2 text-center text-sm text-[var(--foreground-secondary)]">
            Enter the password to view{" "}
            <span className="font-medium text-white">{websiteName}</span>
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6">
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                autoFocus
                className="w-full rounded-lg border border-[var(--background-hover)] bg-[var(--background)] px-4 py-3 text-white placeholder-[var(--foreground-muted)] outline-none transition-colors focus:border-[var(--primary)]"
              />
            </div>

            {error && (
              <p className="mt-3 text-center text-sm text-[var(--error)]">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending || !password}
              className="mt-4 w-full rounded-lg bg-[var(--primary)] px-4 py-3 font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Verifying..." : "View Portfolio"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[var(--foreground-muted)]">
          If you don&apos;t have the password, please contact the photographer.
        </p>
      </div>
    </div>
  );
}
