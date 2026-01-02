"use client";

import { CreditCard, ArrowRight, ArrowLeft, Gift, Clock, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OnboardingData } from "../onboarding-wizard";
import { saveOnboardingStep } from "@/lib/actions/onboarding";

interface PaymentStepProps {
  formData: OnboardingData;
  updateFormData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  organizationId: string;
}

export function PaymentStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  isLoading,
  setIsLoading,
  organizationId,
}: PaymentStepProps) {
  const handleSubmit = async (skip: boolean) => {
    setIsLoading(true);
    try {
      await saveOnboardingStep(organizationId, 7, {
        skipPayment: skip,
      });
      updateFormData({ skipPayment: skip });
      onNext();
    } catch (error) {
      console.error("Error saving payment step:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
          <CreditCard className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Start your free trial
        </h2>
        <p className="text-[var(--foreground-secondary)]">
          Try Dovetail free. No credit card required.
        </p>
      </div>

      {/* Trial Options */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Extended Trial with Card */}
        <div
          className={cn(
            "relative p-6 rounded-xl border transition-all",
            !formData.skipPayment
              ? "border-[var(--primary)] bg-[var(--primary)]/5"
              : "border-[var(--border)] bg-[var(--card)]"
          )}
        >
          {/* Recommended badge */}
          <div className="absolute -top-3 left-4 px-2 py-1 rounded-full text-xs font-medium bg-[var(--success)] text-white">
            Recommended
          </div>

          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--success)]/10 text-[var(--success)]">
              <Gift className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                30-Day Free Trial
              </h3>
              <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                Add a payment method now and get an extended trial
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <Shield className="w-4 h-4 text-[var(--success)]" />
                  No charge until trial ends
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <Clock className="w-4 h-4 text-[var(--success)]" />
                  Cancel anytime
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => handleSubmit(false)}
            disabled={isLoading}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors disabled:opacity-50"
          >
            {isLoading && !formData.skipPayment ? (
              "Setting up..."
            ) : (
              <>
                Add Payment Method
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Basic Trial without Card */}
        <div
          className={cn(
            "relative p-6 rounded-xl border transition-all",
            formData.skipPayment
              ? "border-[var(--primary)] bg-[var(--primary)]/5"
              : "border-[var(--border)] bg-[var(--card)]"
          )}
        >
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--background-secondary)] text-[var(--foreground-muted)]">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[var(--foreground)]">
                14-Day Free Trial
              </h3>
              <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                Start exploring without a payment method
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <Shield className="w-4 h-4" />
                  No credit card needed
                </li>
                <li className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                  <Clock className="w-4 h-4" />
                  Add payment later
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--foreground)] font-medium hover:bg-[var(--background-secondary)] transition-colors disabled:opacity-50"
          >
            {isLoading && formData.skipPayment ? (
              "Setting up..."
            ) : (
              <>
                Skip for now
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-sm text-[var(--foreground-muted)]">
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            Secure checkout
          </span>
          <span>|</span>
          <span>Cancel anytime</span>
        </div>
      </div>

      {/* Back button */}
      <div className="flex items-center justify-start pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>
    </div>
  );
}
