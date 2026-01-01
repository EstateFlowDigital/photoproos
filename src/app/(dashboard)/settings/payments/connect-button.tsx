"use client";

import { useState } from "react";
import { createConnectAccount, createAccountLink, createDashboardLink } from "@/lib/actions/stripe-connect";

interface ConnectButtonProps {
  isConnected?: boolean;
  chargesEnabled?: boolean;
  variant?: "default" | "dashboard";
}

export function ConnectButton({
  isConnected,
  chargesEnabled,
  variant = "default",
}: ConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!isConnected) {
        // Create new Connect account and get onboarding link
        const result = await createConnectAccount();
        if (result.success && result.data?.onboardingUrl) {
          window.location.href = result.data.onboardingUrl;
        } else if (!result.success) {
          setError(result.error || "Failed to create Connect account");
        }
      } else if (!chargesEnabled) {
        // Resume onboarding
        const result = await createAccountLink();
        if (result.success && result.data?.url) {
          window.location.href = result.data.url;
        } else if (!result.success) {
          setError(result.error || "Failed to create onboarding link");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDashboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createDashboardLink();
      if (result.success && result.data?.url) {
        window.open(result.data.url, "_blank");
      } else if (!result.success) {
        setError(result.error || "Failed to open dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "dashboard" && isConnected && chargesEnabled) {
    return (
      <div className="space-y-2">
        <button
          onClick={handleDashboard}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <ExternalLinkIcon className="h-4 w-4" />
          )}
          Open Stripe Dashboard
        </button>
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      </div>
    );
  }

  if (isConnected && chargesEnabled) {
    return (
      <div className="space-y-2">
        <button
          onClick={handleDashboard}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <ExternalLinkIcon className="h-4 w-4" />
          )}
          Manage in Stripe
        </button>
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      </div>
    );
  }

  if (isConnected && !chargesEnabled) {
    return (
      <div className="space-y-2">
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--warning)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--warning)]/90 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner /> : <ArrowRightIcon className="h-4 w-4" />}
          Complete Setup
        </button>
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleConnect}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-lg bg-[#635bff] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#635bff]/90 disabled:opacity-50"
      >
        {isLoading ? <LoadingSpinner /> : <StripeIcon className="h-4 w-4" />}
        Connect with Stripe
      </button>
      {error && <p className="text-sm text-[var(--error)]">{error}</p>}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
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
