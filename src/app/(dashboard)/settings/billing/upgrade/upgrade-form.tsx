"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createCheckoutSession } from "@/lib/actions/stripe-checkout";

interface UpgradeFormProps {
  planId: string;
  planName: string;
  priceId: string;
  organizationId: string;
  isPopular?: boolean;
}

export function UpgradeForm({
  planId,
  planName,
  priceId,
  organizationId,
  isPopular,
}: UpgradeFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = async () => {
    if (!priceId) {
      setError("This plan is not available for purchase yet.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await createCheckoutSession({
        organizationId,
        priceId,
        planId,
        successUrl: `${window.location.origin}/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/settings/billing/upgrade`,
      });

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleUpgrade}
        disabled={isLoading}
        className={cn(
          "w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isPopular
            ? "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
            : "border border-[var(--card-border)] bg-[var(--background)] text-foreground hover:bg-[var(--background-hover)]"
        )}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner className="h-4 w-4" />
            Processing...
          </span>
        ) : (
          `Upgrade to ${planName}`
        )}
      </button>

      {error && (
        <p className="text-center text-sm text-[var(--error)]">{error}</p>
      )}

      <p className="text-center text-xs text-foreground-muted">
        Secure checkout powered by Stripe
      </p>
    </div>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
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
