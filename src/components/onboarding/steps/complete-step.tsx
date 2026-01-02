"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Play,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "../onboarding-wizard";
import { completeOnboarding } from "@/lib/actions/onboarding";
import { getIndustryById } from "@/lib/constants/industries";

interface CompleteStepProps {
  formData: OnboardingData;
  updateFormData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  organizationId: string;
  onComplete: (startTour?: boolean) => void;
}

export function CompleteStep({
  formData,
  isLoading,
  setIsLoading,
  organizationId,
  onComplete,
}: CompleteStepProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = async (startTour: boolean) => {
    setIsLoading(true);
    try {
      await completeOnboarding(organizationId);
      onComplete(startTour);
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const primaryIndustry = getIndustryById(formData.primaryIndustry);

  return (
    <div className="space-y-8 text-center">
      {/* Confetti animation placeholder */}
      {showConfetti && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
        >
          {/* Simple confetti dots */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                opacity: 1,
                y: -20,
                x: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: 0,
                y: 400,
                rotate: Math.random() * 360,
              }}
              transition={{
                duration: 2 + Math.random(),
                delay: i * 0.1,
              }}
              className="absolute top-0 w-3 h-3 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: [
                  "#3b82f6",
                  "#8b5cf6",
                  "#22c55e",
                  "#f97316",
                  "#ec4899",
                ][Math.floor(Math.random() * 5)],
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--success)]/10"
      >
        <CheckCircle2 className="w-10 h-10 text-[var(--success)]" />
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
      >
        <h2 className="text-3xl font-bold text-[var(--foreground)]">
          You&apos;re all set!
        </h2>
        <p className="text-lg text-[var(--foreground-secondary)]">
          Welcome to PhotoProOS, {formData.firstName}
        </p>
      </motion.div>

      {/* Summary card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-left max-w-md mx-auto"
      >
        <h3 className="font-medium text-[var(--foreground)] mb-4">
          Your setup summary
        </h3>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-[var(--foreground-muted)]">Business</dt>
            <dd className="text-[var(--foreground)] font-medium">
              {formData.publicName || formData.companyName || "Your Business"}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[var(--foreground-muted)]">Primary focus</dt>
            <dd className="text-[var(--foreground)] font-medium">
              {primaryIndustry?.name || "Photography"}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[var(--foreground-muted)]">Industries</dt>
            <dd className="text-[var(--foreground)] font-medium">
              {formData.industries.length} selected
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[var(--foreground-muted)]">Features</dt>
            <dd className="text-[var(--foreground)] font-medium">
              {formData.enabledModules.length + 2} enabled
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-[var(--foreground-muted)]">Trial</dt>
            <dd className="text-[var(--foreground)] font-medium">
              {formData.skipPayment ? "14 days" : "30 days"} free
            </dd>
          </div>
        </dl>
      </motion.div>

      {/* CTA buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Start guided tour */}
          <button
            onClick={() => handleComplete(true)}
            disabled={isLoading}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
              "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                <Play className="w-4 h-4" />
                Take a Quick Tour
              </>
            )}
          </button>

          {/* Go to dashboard */}
          <button
            onClick={() => handleComplete(false)}
            disabled={isLoading}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors",
              "border border-[var(--border)] text-[var(--foreground)]",
              "hover:bg-[var(--background-secondary)]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </button>
        </div>

        {/* Tip */}
        <p className="text-sm text-[var(--foreground-muted)] flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--warning)]" />
          Pro tip: The tour takes less than 2 minutes
        </p>
      </motion.div>
    </div>
  );
}
