"use client";

import { motion } from "framer-motion";
import { Camera, Zap, DollarSign, Sparkles } from "lucide-react";
import type { OnboardingData } from "../onboarding-wizard";

interface WelcomeStepProps {
  formData: OnboardingData;
  updateFormData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  organizationId: string;
}

const features = [
  {
    icon: Camera,
    title: "Stunning Galleries",
    description: "Deliver photos your clients will love with beautiful, branded galleries",
  },
  {
    icon: DollarSign,
    title: "Get Paid Faster",
    description: "Automated invoicing and payment collection means less chasing",
  },
  {
    icon: Zap,
    title: "Save Time",
    description: "Streamline your workflow with smart scheduling and automation",
  },
];

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-8">
      {/* Logo and welcome */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--ai)] mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">
          Welcome to PhotoProOS
        </h1>
        <p className="text-lg text-[var(--foreground-secondary)] max-w-md mx-auto">
          The business OS for professional photographers. Let&apos;s get you set up in just a few minutes.
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 sm:grid-cols-3"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)]"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={onNext}
          className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors"
        >
          Get Started
        </button>
        <p className="mt-4 text-sm text-[var(--foreground-muted)]">
          Takes about 2-3 minutes to complete
        </p>
      </motion.div>
    </div>
  );
}
