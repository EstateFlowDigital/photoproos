"use client";

import { useState } from "react";
import { Image, ArrowRight, ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import type { WizardData } from "@/app/(dashboard)/create/create-wizard-client";

interface GalleryStepProps {
  formData: WizardData;
  updateFormData: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function GalleryStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: GalleryStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.galleryName.trim()) {
      newErrors.galleryName = "Gallery name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] mb-2">
          <Image className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Gallery details
        </h2>
        <p className="text-foreground-secondary">
          Set up your photo gallery
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Gallery Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Gallery Name <span className="text-[var(--error)]">*</span>
          </label>
          <input
            type="text"
            value={formData.galleryName}
            onChange={(e) => updateFormData({ galleryName: e.target.value })}
            placeholder="Smith Family Home - 123 Main St"
            className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
          {errors.galleryName && (
            <p className="text-sm text-[var(--error)]">{errors.galleryName}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Description <span className="text-foreground-muted">(optional)</span>
          </label>
          <textarea
            value={formData.galleryDescription}
            onChange={(e) => updateFormData({ galleryDescription: e.target.value })}
            placeholder="Add any notes or description for this gallery..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none"
          />
        </div>

        {/* Password Protection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            <Lock className="w-4 h-4 inline mr-1.5" />
            Password Protection <span className="text-foreground-muted">(optional)</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={formData.galleryPassword}
              onChange={(e) => updateFormData({ galleryPassword: e.target.value })}
              placeholder="Leave empty for no password"
              className="w-full px-4 py-3 pr-12 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-foreground-muted hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-foreground-muted">
            If set, clients will need this password to view the gallery
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 rounded-lg bg-[var(--ai)]/10 border border-[var(--ai)]/20">
        <h4 className="font-medium text-[var(--ai)] mb-2">Tips for great galleries</h4>
        <ul className="space-y-1 text-sm text-foreground-secondary">
          <li>• Use descriptive names that clients will recognize</li>
          <li>• Add a description with shoot details or special instructions</li>
          <li>• Consider password protection for private client galleries</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-[var(--background-secondary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--primary)] text-white font-medium hover:bg-[var(--primary)]/90 transition-colors"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
