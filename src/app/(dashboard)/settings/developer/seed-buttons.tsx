"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { seedDatabase, clearSeededData } from "@/lib/actions/seed";
import { Button } from "@/components/ui/button";

export function SeedDatabaseButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  const handleSeed = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await seedDatabase();

      if (response.success) {
        const counts = response.data.counts;
        const parts: string[] = [];
        if (counts.clients) parts.push(`${counts.clients} clients`);
        if (counts.projects) parts.push(`${counts.projects} projects`);
        if (counts.bookings) parts.push(`${counts.bookings} bookings`);
        if (counts.bookingTypes) parts.push(`${counts.bookingTypes} booking types`);
        if (counts.invoices) parts.push(`${counts.invoices} invoices`);
        if (counts.contracts) parts.push(`${counts.contracts} contracts`);
        if (counts.services) parts.push(`${counts.services} services`);
        if (counts.tags) parts.push(`${counts.tags} tags`);
        if (counts.deliveryLinks) parts.push(`${counts.deliveryLinks} delivery links`);
        if (counts.questionnaireTemplates) parts.push(`${counts.questionnaireTemplates} questionnaires`);
        if (counts.reviewPlatforms) parts.push(`${counts.reviewPlatforms} review platforms`);
        if (counts.brokerages) parts.push(`${counts.brokerages} brokerages`);
        if (counts.cannedResponses) parts.push(`${counts.cannedResponses} canned responses`);
        if (counts.serviceAddons) parts.push(`${counts.serviceAddons} service addons`);
        if (counts.conversations) parts.push(`${counts.conversations} conversations`);
        if (counts.equipment) parts.push(`${counts.equipment} equipment`);
        if (counts.tasks) parts.push(`${counts.tasks} tasks`);
        if (counts.gamificationProfile) parts.push(`gamification profile`);
        if (counts.portfolioWebsite) parts.push(`portfolio website`);
        if (counts.locations) parts.push(`${counts.locations} location`);
        const message = `Created: ${parts.join(", ")}`;
        setResult({ success: true, message });
        router.refresh();
      } else {
        setResult({ success: false, message: response.error });
      }
    } catch (error) {
      setResult({ success: false, message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        variant="primary"
        onClick={handleSeed}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            Seeding Database...
          </span>
        ) : (
          "Seed Database with Sample Data"
        )}
      </Button>

      {result && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            result.success
              ? "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30"
              : "bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/30"
          }`}
        >
          {result.success ? (
            <>
              <p className="font-medium mb-1">Database seeded successfully!</p>
              <p className="text-xs opacity-80">{result.message}</p>
            </>
          ) : (
            <p>{result.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function ClearDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  const handleClear = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await clearSeededData();

      if (response.success) {
        setResult({ success: true, message: "All data has been cleared from your organization." });
        setShowConfirm(false);
        router.refresh();
      } else {
        setResult({ success: false, message: response.error });
      }
    } catch (error) {
      setResult({ success: false, message: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/30 p-4">
          <p className="text-sm font-medium text-[var(--error)] mb-3">
            Are you sure? This will permanently delete ALL data in your organization.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="w-full rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50 sm:flex-1"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner />
                  Clearing...
                </span>
              ) : (
                "Yes, Delete Everything"
              )}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isLoading}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] sm:flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-2.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20"
      >
        Clear All Data
      </button>

      {result && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            result.success
              ? "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30"
              : "bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/30"
          }`}
        >
          <p>{result.message}</p>
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
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
