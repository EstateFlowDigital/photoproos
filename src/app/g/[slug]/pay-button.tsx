"use client";

import { useState } from "react";
import { createGalleryCheckoutSession } from "@/lib/actions/stripe-checkout";

interface PayButtonProps {
  galleryId: string;
  price: number;
  primaryColor: string;
  variant?: "header" | "banner";
  children?: React.ReactNode;
}

export function PayButton({ galleryId, price, primaryColor, variant = "header", children }: PayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createGalleryCheckoutSession(galleryId);

      if (result.success) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.checkoutUrl;
      } else {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  if (variant === "banner") {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleClick}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {isLoading ? (
            <>
              <LoadingSpinner className="h-4 w-4" />
              Processing...
            </>
          ) : (
            <>Pay {formatCurrency(price)}</>
          )}
        </button>
        {error && <p className="text-xs text-[var(--error)]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {isLoading ? (
          <>
            <LoadingSpinner className="h-4 w-4" />
            Processing...
          </>
        ) : (
          children || (
            <>
              <LockIcon className="h-4 w-4" />
              Unlock for {formatCurrency(price)}
            </>
          )
        )}
      </button>
      {error && <p className="text-xs text-[var(--error)]">{error}</p>}
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
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
