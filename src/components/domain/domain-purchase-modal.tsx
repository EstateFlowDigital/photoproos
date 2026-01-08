"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  checkDomainAvailability,
  initiateDomainPurchase,
} from "@/lib/actions/domain-purchases";
import {
  generateDomainSuggestions,
  generatePortfolioDomainSuggestions,
} from "@/lib/utils/domain-suggestions";

interface DomainPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "property" | "portfolio";
  websiteId: string;
  /** For property websites: the street address. For portfolio: the business name */
  suggestFrom: string;
  currentDomain?: string | null;
}

interface DomainSuggestion {
  domain: string;
  isChecking: boolean;
  isAvailable: boolean | null;
  price?: number;
  alternatives?: string[];
}

export function DomainPurchaseModal({
  isOpen,
  onClose,
  type,
  websiteId,
  suggestFrom,
  currentDomain,
}: DomainPurchaseModalProps) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<DomainSuggestion[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [checkResult, setCheckResult] = useState<{
    available: boolean;
    price?: number;
    alternatives?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Generate suggestions when modal opens
  useEffect(() => {
    if (isOpen && suggestFrom) {
      const generated =
        type === "property"
          ? generateDomainSuggestions(suggestFrom)
          : generatePortfolioDomainSuggestions(suggestFrom);

      setSuggestions(
        generated.map((domain) => ({
          domain,
          isChecking: false,
          isAvailable: null,
        }))
      );

      // Pre-populate search with first suggestion
      if (generated.length > 0) {
        setSearchQuery(generated[0]);
      }
    }
  }, [isOpen, suggestFrom, type]);

  const handleCheckDomain = async (domain: string) => {
    setError(null);
    setSelectedDomain(domain);
    setIsCheckingAvailability(true);
    setCheckResult(null);

    startTransition(async () => {
      const result = await checkDomainAvailability(domain);

      if (result.success && result.data) {
        setCheckResult({
          available: result.data.available,
          price: result.data.price,
          alternatives: result.data.alternatives,
        });
      } else {
        setError(result.error || "Failed to check domain availability");
      }

      setIsCheckingAvailability(false);
    });
  };

  const handlePurchase = async () => {
    if (!selectedDomain || !checkResult?.available) return;

    setError(null);
    setIsPurchasing(true);

    startTransition(async () => {
      const result = await initiateDomainPurchase({
        domain: selectedDomain,
        connectToType: type,
        websiteId,
      });

      if (result.success && result.data) {
        // Redirect to Stripe checkout
        window.location.href = result.data.checkoutUrl;
      } else {
        setError(result.error || "Failed to initiate purchase");
        setIsPurchasing(false);
      }
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Clean up the domain input
      let domain = searchQuery.trim().toLowerCase();
      // Remove http/https and www
      domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
      // Add .com if no TLD
      if (!domain.includes(".")) {
        domain = domain + ".com";
      }
      handleCheckDomain(domain);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {currentDomain ? "Manage Custom Domain" : "Get a Custom Domain"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Domain Display */}
          {currentDomain && (
            <div className="rounded-lg border border-[var(--success)] bg-[var(--success)]/10 p-4">
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-5 w-5 text-[var(--success)]" />
                <div>
                  <p className="font-medium text-foreground">
                    Current Domain: {currentDomain}
                  </p>
                  <p className="text-sm text-foreground-muted">
                    Your custom domain is active and connected
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Search for a domain
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter domain name (e.g., 123mainstreet.com)"
                  className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <button
                  type="submit"
                  disabled={isPending || !searchQuery.trim()}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
                >
                  {isCheckingAvailability ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Suggestions */}
          {suggestions.length > 0 && !checkResult && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Suggested domains based on{" "}
                {type === "property" ? "address" : "business name"}:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.domain}
                    type="button"
                    onClick={() => {
                      setSearchQuery(suggestion.domain);
                      handleCheckDomain(suggestion.domain);
                    }}
                    disabled={isPending}
                    className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 disabled:opacity-50"
                  >
                    {suggestion.domain}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-[var(--error)] bg-[var(--error)]/10 p-4">
              <p className="text-sm text-[var(--error)]">{error}</p>
            </div>
          )}

          {/* Availability Result */}
          {checkResult && selectedDomain && (
            <div className="space-y-4">
              {checkResult.available ? (
                <div className="rounded-lg border border-[var(--success)] bg-[var(--success)]/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-[var(--success)] mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {selectedDomain} is available!
                      </p>
                      <p className="text-sm text-foreground-muted mt-1">
                        ${(checkResult.price || 3000) / 100}/year • SSL included
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handlePurchase}
                      disabled={isPurchasing}
                      className="rounded-lg bg-[var(--success)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--success)]/90 disabled:opacity-50"
                    >
                      {isPurchasing ? (
                        <span className="flex items-center gap-2">
                          <LoadingSpinner className="h-4 w-4" />
                          Processing...
                        </span>
                      ) : (
                        `Purchase $${(checkResult.price || 3000) / 100}`
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning)]/10 p-4">
                  <div className="flex items-start gap-3">
                    <XCircleIcon className="h-5 w-5 text-[var(--warning)] mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {selectedDomain} is not available
                      </p>
                      {checkResult.alternatives &&
                        checkResult.alternatives.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-foreground-muted mb-2">
                              Try these alternatives:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {checkResult.alternatives.map((alt) => (
                                <button
                                  key={alt}
                                  type="button"
                                  onClick={() => {
                                    setSearchQuery(alt);
                                    handleCheckDomain(alt);
                                  }}
                                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
                                >
                                  {alt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}

              {/* Try another search */}
              <button
                type="button"
                onClick={() => {
                  setCheckResult(null);
                  setSelectedDomain(null);
                }}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Search for another domain
              </button>
            </div>
          )}

          {/* Pricing Info */}
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] p-4">
            <h4 className="font-medium text-foreground mb-2">
              What&apos;s Included
            </h4>
            <ul className="space-y-1.5 text-sm text-foreground-muted">
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Custom domain for your{" "}
                {type === "property" ? "property website" : "portfolio"}
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Free SSL certificate for secure connections
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Automatic DNS configuration
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Instant activation after purchase
              </li>
            </ul>
          </div>

          {/* BYOD Option */}
          <div className="text-center">
            <p className="text-sm text-foreground-muted">
              Already own a domain?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onClose();
                  // Would need to trigger BYOD flow here
                }}
                className="text-[var(--primary)] hover:underline"
              >
                Connect your existing domain
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
