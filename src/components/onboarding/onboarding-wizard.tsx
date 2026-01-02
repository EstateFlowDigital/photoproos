"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Organization, OnboardingProgress, User } from "@prisma/client";
import { ProgressIndicator } from "./progress-indicator";
import { WelcomeStep } from "./steps/welcome-step";
import { ProfileStep } from "./steps/profile-step";
import { BusinessStep } from "./steps/business-step";
import { BrandingStep } from "./steps/branding-step";
import { IndustriesStep } from "./steps/industries-step";
import { FeaturesStep } from "./steps/features-step";
import { GoalsStep } from "./steps/goals-step";
import { PaymentStep } from "./steps/payment-step";
import { CompleteStep } from "./steps/complete-step";

export interface OnboardingData {
  // Step 1: Personal
  firstName: string;
  lastName: string;
  phone: string;

  // Step 2: Business
  companyName: string;
  businessType: "solo" | "team" | "agency" | "";
  teamSize: string;

  // Step 3: Branding
  displayMode: "personal" | "company";
  publicName: string;
  publicEmail: string;
  publicPhone: string;
  website: string;

  // Step 4: Industries
  industries: string[];
  primaryIndustry: string;

  // Step 5: Features
  enabledModules: string[];

  // Step 6: Goals
  selectedGoals: string[];

  // Step 7: Payment
  skipPayment: boolean;
}

const STEPS = [
  { id: "welcome", title: "Welcome" },
  { id: "profile", title: "Profile" },
  { id: "business", title: "Business" },
  { id: "branding", title: "Branding" },
  { id: "industries", title: "Industries" },
  { id: "features", title: "Features" },
  { id: "goals", title: "Goals" },
  { id: "payment", title: "Payment" },
  { id: "complete", title: "Complete" },
];

interface OnboardingWizardProps {
  organization: (Organization & { onboardingProgress: OnboardingProgress | null }) | null;
  onboardingProgress: OnboardingProgress | null;
  user: Pick<User, "id" | "email" | "fullName" | "firstName" | "lastName" | "avatarUrl" | "phone"> | null;
}

export function OnboardingWizard({
  organization,
  onboardingProgress,
  user,
}: OnboardingWizardProps) {
  const router = useRouter();

  // Initialize step from saved progress
  const initialStep = onboardingProgress?.currentStep || 0;

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data
  const [formData, setFormData] = useState<OnboardingData>({
    // Personal (prefill from user if available)
    firstName: user?.firstName || user?.fullName?.split(" ")[0] || "",
    lastName: user?.lastName || user?.fullName?.split(" ").slice(1).join(" ") || "",
    phone: user?.phone || "",

    // Business
    companyName: organization?.name || "",
    businessType: (organization?.businessType as OnboardingData["businessType"]) || "",
    teamSize: organization?.teamSize || "",

    // Branding
    displayMode: (organization?.displayMode as "personal" | "company") || "company",
    publicName: organization?.publicName || organization?.name || "",
    publicEmail: organization?.publicEmail || user?.email || "",
    publicPhone: organization?.publicPhone || "",
    website: organization?.website || "",

    // Industries
    industries: organization?.industries?.map(String) || ["real_estate"],
    primaryIndustry: organization?.primaryIndustry || "real_estate",

    // Features
    enabledModules: organization?.enabledModules || [],

    // Goals
    selectedGoals: onboardingProgress?.selectedGoals || [],

    // Payment
    skipPayment: false,
  });

  const updateFormData = useCallback((updates: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback((startTour: boolean = false) => {
    if (startTour) {
      router.push("/dashboard?tour=welcome");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }, [router]);

  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      isLoading,
      setIsLoading,
      organizationId: organization?.id || "",
    };

    switch (currentStep) {
      case 0:
        return <WelcomeStep {...commonProps} />;
      case 1:
        return <ProfileStep {...commonProps} userEmail={user?.email || ""} />;
      case 2:
        return <BusinessStep {...commonProps} />;
      case 3:
        return <BrandingStep {...commonProps} />;
      case 4:
        return <IndustriesStep {...commonProps} />;
      case 5:
        return <FeaturesStep {...commonProps} />;
      case 6:
        return <GoalsStep {...commonProps} />;
      case 7:
        return <PaymentStep {...commonProps} />;
      case 8:
        return <CompleteStep {...commonProps} onComplete={handleComplete} />;
      default:
        return <WelcomeStep {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress indicator - hidden on welcome and complete steps */}
      {currentStep > 0 && currentStep < STEPS.length - 1 && (
        <div className="sticky top-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <ProgressIndicator
              steps={STEPS.slice(1, -1)} // Exclude welcome and complete
              currentStep={currentStep - 1}
            />
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
