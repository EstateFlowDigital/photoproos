"use client";

import { useState } from "react";
import { Briefcase, ArrowRight, ArrowLeft, Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardData } from "@/app/(dashboard)/create/create-wizard-client";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string | null;
  priceCents: number;
  duration: string | null;
  deliverables: string[];
  isDefault: boolean;
}

interface ServicesStepProps {
  formData: WizardData;
  updateFormData: (updates: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  services: Service[];
}

const CATEGORY_LABELS: Record<string, string> = {
  real_estate: "Real Estate",
  portrait: "Portrait",
  event: "Event",
  commercial: "Commercial",
  wedding: "Wedding",
  product: "Product",
  other: "Other",
};

export function ServicesStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  services,
}: ServicesStepProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Group services by category
  const categories = Array.from(new Set(services.map((s) => s.category)));

  const filteredServices = activeCategory
    ? services.filter((s) => s.category === activeCategory)
    : services;

  const isSelected = (serviceId: string) =>
    formData.selectedServices.some((s) => s.serviceId === serviceId);

  const isPrimary = (serviceId: string) =>
    formData.selectedServices.find((s) => s.serviceId === serviceId)?.isPrimary || false;

  const toggleService = (serviceId: string) => {
    const existing = formData.selectedServices.find((s) => s.serviceId === serviceId);

    if (existing) {
      // Remove service
      const updated = formData.selectedServices.filter((s) => s.serviceId !== serviceId);
      // If removed service was primary and there are others, make first one primary
      if (existing.isPrimary && updated.length > 0) {
        updated[0].isPrimary = true;
      }
      updateFormData({ selectedServices: updated });
    } else {
      // Add service
      const isPrimaryNew = formData.selectedServices.length === 0;
      updateFormData({
        selectedServices: [
          ...formData.selectedServices,
          { serviceId, isPrimary: isPrimaryNew },
        ],
      });
    }
  };

  const setPrimary = (serviceId: string) => {
    const updated = formData.selectedServices.map((s) => ({
      ...s,
      isPrimary: s.serviceId === serviceId,
    }));
    updateFormData({ selectedServices: updated });
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const getTotalPrice = () => {
    return formData.selectedServices.reduce((total, selected) => {
      const service = services.find((s) => s.id === selected.serviceId);
      return total + (service?.priceCents || 0);
    }, 0);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (formData.selectedServices.length === 0) {
      newErrors.services = "Please select at least one service";
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
          <Briefcase className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Select services
        </h2>
        <p className="text-foreground-secondary">
          Choose the services for this project
        </p>
      </div>

      {/* Category Filter */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              !activeCategory
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-secondary hover:text-foreground"
            )}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                activeCategory === category
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-foreground-secondary hover:text-foreground"
              )}
            >
              {CATEGORY_LABELS[category] || category}
            </button>
          ))}
        </div>
      )}

      {/* Services Grid */}
      <div className="space-y-3">
        {filteredServices.map((service) => {
          const selected = isSelected(service.id);
          const primary = isPrimary(service.id);

          return (
            <div
              key={service.id}
              className={cn(
                "relative rounded-xl border-2 transition-all cursor-pointer",
                selected
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] hover:border-[var(--border-hover)]"
              )}
            >
              <button
                type="button"
                onClick={() => toggleService(service.id)}
                className="w-full p-4 text-left"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{service.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--background-secondary)] text-foreground-muted">
                        {CATEGORY_LABELS[service.category] || service.category}
                      </span>
                      {primary && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--primary)]/20 text-[var(--primary)]">
                          Primary
                        </span>
                      )}
                    </div>
                    {service.description && (
                      <p className="mt-1 text-sm text-foreground-muted line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="font-semibold text-foreground">
                        {formatPrice(service.priceCents)}
                      </span>
                      {service.duration && (
                        <span className="text-foreground-muted">
                          {service.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                      selected
                        ? "bg-[var(--primary)] border-[var(--primary)]"
                        : "border-[var(--border)]"
                    )}
                  >
                    {selected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </button>

              {/* Set as Primary button */}
              {selected && !primary && formData.selectedServices.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrimary(service.id);
                  }}
                  className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
                >
                  <Star className="w-3 h-3 inline mr-1" />
                  Set as Primary
                </button>
              )}
            </div>
          );
        })}

        {filteredServices.length === 0 && (
          <div className="text-center py-8 text-foreground-muted">
            No services found
          </div>
        )}
      </div>

      {errors.services && (
        <p className="text-sm text-[var(--error)]">{errors.services}</p>
      )}

      {/* Selected Summary */}
      {formData.selectedServices.length > 0 && (
        <div className="p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <span className="text-sm text-foreground-secondary">
              {formData.selectedServices.length} service{formData.selectedServices.length !== 1 ? "s" : ""} selected
            </span>
            <span className="text-lg font-semibold text-foreground">
              {formatPrice(getTotalPrice())}
            </span>
          </div>
        </div>
      )}

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
