"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  photographyServices,
  serviceCategories,
  getGroupedServices,
  formatServicePrice,
  type ServiceType,
  type ServiceCategory,
} from "@/lib/services";

interface ServiceSelectorProps {
  selectedServiceId?: string;
  customPrice?: number;
  customDescription?: string;
  onServiceChange?: (service: ServiceType | null) => void;
  onPriceChange?: (price: number) => void;
  onDescriptionChange?: (description: string) => void;
  disabled?: boolean;
  mode?: "gallery" | "booking";
}

export function ServiceSelector({
  selectedServiceId,
  customPrice = 0,
  customDescription = "",
  onServiceChange,
  onPriceChange,
  onDescriptionChange,
  disabled = false,
  mode = "gallery",
}: ServiceSelectorProps) {
  const [isCustom, setIsCustom] = useState(!selectedServiceId);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">("all");
  const [expandedService, setExpandedService] = useState<string | null>(selectedServiceId || null);

  const groupedServices = getGroupedServices();
  const selectedService = selectedServiceId
    ? photographyServices.find((s) => s.id === selectedServiceId)
    : null;

  const filteredServices =
    selectedCategory === "all"
      ? photographyServices
      : photographyServices.filter((s) => s.category === selectedCategory);

  const handleServiceSelect = (service: ServiceType) => {
    setIsCustom(false);
    setExpandedService(service.id);
    onServiceChange?.(service);
    onPriceChange?.(service.basePrice);
    onDescriptionChange?.(service.description);
  };

  const handleCustomToggle = () => {
    setIsCustom(true);
    setExpandedService(null);
    onServiceChange?.(null);
  };

  return (
    <div className="space-y-6">
      {/* Pricing Mode Toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsCustom(false)}
          disabled={disabled}
          className={cn(
            "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all",
            !isCustom
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--card-border)] text-foreground-muted hover:border-[var(--border-hover)] hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="block font-semibold">Select Service</span>
          <span className="block text-xs opacity-75 mt-0.5">Choose from preset packages</span>
        </button>
        <button
          type="button"
          onClick={handleCustomToggle}
          disabled={disabled}
          className={cn(
            "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-all",
            isCustom
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--card-border)] text-foreground-muted hover:border-[var(--border-hover)] hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <span className="block font-semibold">Custom Pricing</span>
          <span className="block text-xs opacity-75 mt-0.5">Set your own price</span>
        </button>
      </div>

      {isCustom ? (
        /* Custom Pricing Form */
        <div className="space-y-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
          <div>
            <label htmlFor="customPrice" className="block text-sm font-medium text-foreground mb-1.5">
              {mode === "gallery" ? "Gallery Price" : "Session Fee"}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
              <input
                type="number"
                id="customPrice"
                name="customPrice"
                min="0"
                step="0.01"
                value={customPrice / 100 || ""}
                onChange={(e) => onPriceChange?.(Math.round(parseFloat(e.target.value || "0") * 100))}
                disabled={disabled}
                placeholder="0.00"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
              />
            </div>
            <p className="mt-1.5 text-xs text-foreground-muted">
              {mode === "gallery"
                ? "Leave at $0 for free galleries. Paid galleries require payment before download."
                : "The total fee for this session."}
            </p>
          </div>

          <div>
            <label htmlFor="customDescription" className="block text-sm font-medium text-foreground mb-1.5">
              Service Description
            </label>
            <textarea
              id="customDescription"
              name="customDescription"
              rows={3}
              value={customDescription}
              onChange={(e) => onDescriptionChange?.(e.target.value)}
              disabled={disabled}
              placeholder="Describe what's included in this service..."
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none disabled:opacity-50"
            />
            <p className="mt-1.5 text-xs text-foreground-muted">
              This description will be shown to clients on invoices and receipts.
            </p>
          </div>
        </div>
      ) : (
        /* Service Selection */
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              disabled={disabled}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                selectedCategory === "all"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              All Services
            </button>
            {Object.entries(serviceCategories).map(([key, { label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key as ServiceCategory)}
                disabled={disabled}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedCategory === key
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Service List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredServices.map((service) => {
              const isSelected = selectedServiceId === service.id;
              const isExpanded = expandedService === service.id;
              const categoryInfo = serviceCategories[service.category];

              return (
                <div key={service.id} className="group">
                  <button
                    type="button"
                    onClick={() => handleServiceSelect(service)}
                    disabled={disabled}
                    className={cn(
                      "w-full rounded-lg border p-4 text-left transition-all",
                      isSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)]",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", categoryInfo.color)}>
                            {categoryInfo.label}
                          </span>
                          {isSelected && (
                            <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-medium text-white">
                              Selected
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-foreground">{service.name}</h4>
                        <p className="text-sm text-foreground-muted mt-1">{service.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-foreground">{formatServicePrice(service.basePrice)}</p>
                        <p className="text-xs text-foreground-muted">{service.estimatedDuration}</p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
                        <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-2">
                          What's Included
                        </p>
                        <ul className="space-y-1">
                          {service.deliverables.map((item, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                              <CheckIcon className="h-4 w-4 text-[var(--success)] shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Selected Service Summary */}
          {selectedService && (
            <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[var(--primary)] uppercase tracking-wide">Selected Service</p>
                  <p className="font-medium text-foreground mt-1">{selectedService.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{formatServicePrice(selectedService.basePrice)}</p>
                </div>
              </div>

              {/* Price Override */}
              <div className="mt-4 pt-4 border-t border-[var(--primary)]/20">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-foreground">Adjust price for this {mode}</span>
                  <div className="relative w-32">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={(customPrice || selectedService.basePrice) / 100}
                      onChange={(e) => onPriceChange?.(Math.round(parseFloat(e.target.value || "0") * 100))}
                      disabled={disabled}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-3 py-1.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
                    />
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Also export a read-only display component for detail pages
interface ServiceDisplayProps {
  serviceId?: string;
  customPrice?: number;
  customDescription?: string;
  className?: string;
}

export function ServiceDisplay({ serviceId, customPrice, customDescription, className }: ServiceDisplayProps) {
  const service = serviceId ? photographyServices.find((s) => s.id === serviceId) : null;

  if (service) {
    const categoryInfo = serviceCategories[service.category];
    const displayPrice = customPrice || service.basePrice;

    return (
      <div className={cn("rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4", className)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", categoryInfo.color)}>
                {categoryInfo.label}
              </span>
            </div>
            <h4 className="font-medium text-foreground">{service.name}</h4>
            <p className="text-sm text-foreground-muted mt-1">{service.description}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-foreground">{formatServicePrice(displayPrice)}</p>
            {customPrice && customPrice !== service.basePrice && (
              <p className="text-xs text-foreground-muted line-through">{formatServicePrice(service.basePrice)}</p>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
          <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-2">Includes</p>
          <div className="flex flex-wrap gap-2">
            {service.deliverables.map((item, index) => (
              <span key={index} className="rounded-full bg-[var(--background-secondary)] px-2.5 py-1 text-xs text-foreground">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Custom pricing display
  if (customPrice || customDescription) {
    return (
      <div className={cn("rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4", className)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-gray-500/10 px-2 py-0.5 text-xs font-medium text-gray-400">
                Custom
              </span>
            </div>
            <h4 className="font-medium text-foreground">Custom Service</h4>
            {customDescription && (
              <p className="text-sm text-foreground-muted mt-1">{customDescription}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-lg font-bold text-foreground">{formatServicePrice(customPrice || 0)}</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
