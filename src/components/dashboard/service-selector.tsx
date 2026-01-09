"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  photographyServices,
  serviceCategories,
  formatServicePrice,
  type ServiceType,
  type ServiceCategory,
} from "@/lib/services";

// Service type for database services passed as props
export interface DatabaseServiceType {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string | null;
  priceCents: number;
  duration: string | null;
  deliverables: string[];
  isActive: boolean;
  isDefault: boolean;
}

// Custom service type for user-created services
export interface CustomServiceType {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  basePrice: number;
  estimatedDuration: string;
  deliverables: string[];
  isCustom: true;
}

interface ServiceSelectorProps {
  /** Optional services from database. If not provided, uses static services */
  services?: DatabaseServiceType[];
  selectedServiceId?: string;
  customPrice?: number;
  customDescription?: string;
  customServiceName?: string;
  customDeliverables?: string[];
  customCategory?: ServiceCategory;
  customDuration?: string;
  onServiceChange?: (service: ServiceType | DatabaseServiceType | null) => void;
  onPriceChange?: (price: number) => void;
  onDescriptionChange?: (description: string) => void;
  onServiceNameChange?: (name: string) => void;
  onDeliverablesChange?: (deliverables: string[]) => void;
  onCategoryChange?: (category: ServiceCategory) => void;
  onDurationChange?: (duration: string) => void;
  disabled?: boolean;
  mode?: "gallery" | "booking";
}

export function ServiceSelector({
  services,
  selectedServiceId,
  customPrice = 0,
  customDescription = "",
  customServiceName = "",
  customDeliverables = [],
  customCategory = "other",
  customDuration = "",
  onServiceChange,
  onPriceChange,
  onDescriptionChange,
  onServiceNameChange,
  onDeliverablesChange,
  onCategoryChange,
  onDurationChange,
  disabled = false,
  mode = "gallery",
}: ServiceSelectorProps) {
  const [isCustom, setIsCustom] = useState(!selectedServiceId);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">("all");
  const [expandedService, setExpandedService] = useState<string | null>(selectedServiceId || null);
  const [newDeliverable, setNewDeliverable] = useState("");

  // Use database services if provided, otherwise fall back to static services
  const availableServices = useMemo(() => {
    if (services && services.length > 0) {
      // Convert database services to a compatible format
      return services.filter(s => s.isActive).map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        description: s.description || "",
        basePrice: s.priceCents,
        estimatedDuration: s.duration || "",
        deliverables: s.deliverables,
        isDefault: s.isDefault,
      }));
    }
    return photographyServices;
  }, [services]);

  const selectedService = selectedServiceId
    ? availableServices.find((s) => s.id === selectedServiceId)
    : null;

  const handleAddDeliverable = useCallback(() => {
    if (newDeliverable.trim() && onDeliverablesChange) {
      onDeliverablesChange([...customDeliverables, newDeliverable.trim()]);
      setNewDeliverable("");
    }
  }, [newDeliverable, customDeliverables, onDeliverablesChange]);

  const handleRemoveDeliverable = useCallback((index: number) => {
    if (onDeliverablesChange) {
      onDeliverablesChange(customDeliverables.filter((_, i) => i !== index));
    }
  }, [customDeliverables, onDeliverablesChange]);

  const filteredServices =
    selectedCategory === "all"
      ? availableServices
      : availableServices.filter((s) => s.category === selectedCategory);

  const handleServiceSelect = (service: { id: string; name: string; category: ServiceCategory; description: string; basePrice: number; estimatedDuration: string; deliverables: string[]; isDefault?: boolean }) => {
    setIsCustom(false);
    setExpandedService(service.id);
    onServiceChange?.(service as ServiceType);
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
        /* Custom Service Form - Full Editor */
        <div className="space-y-5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--card-border)]">
            <div>
              <h4 className="font-medium text-foreground">Create Custom Service</h4>
              <p className="text-xs text-foreground-muted mt-0.5">Define your own service package with custom pricing</p>
            </div>
            <Link
              href="/settings/services"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
            >
              <SettingsIcon className="h-3.5 w-3.5" />
              Manage Services
            </Link>
          </div>

          {/* Service Name */}
          <div>
            <label htmlFor="customServiceName" className="block text-sm font-medium text-foreground mb-1.5">
              Service Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              type="text"
              id="customServiceName"
              name="customServiceName"
              value={customServiceName}
              onChange={(e) => onServiceNameChange?.(e.target.value)}
              disabled={disabled}
              placeholder="e.g., Premium Real Estate Package"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
            />
          </div>

          {/* Category and Price Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="customCategory" className="block text-sm font-medium text-foreground mb-1.5">
                Category
              </label>
              <select
                id="customCategory"
                name="customCategory"
                value={customCategory}
                onChange={(e) => onCategoryChange?.(e.target.value as ServiceCategory)}
                disabled={disabled}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
              >
                {Object.entries(serviceCategories).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="customPrice" className="block text-sm font-medium text-foreground mb-1.5">
                {mode === "gallery" ? "Price" : "Session Fee"} <span className="text-[var(--error)]">*</span>
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
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="customDuration" className="block text-sm font-medium text-foreground mb-1.5">
              Estimated Duration
            </label>
            <input
              type="text"
              id="customDuration"
              name="customDuration"
              value={customDuration}
              onChange={(e) => onDurationChange?.(e.target.value)}
              disabled={disabled}
              placeholder="e.g., 2-3 hours"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
            />
          </div>

          {/* Description */}
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

          {/* Deliverables */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              What's Included
            </label>
            <div className="space-y-2">
              {/* Existing Deliverables */}
              {customDeliverables.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {customDeliverables.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-sm text-[var(--primary)]"
                    >
                      <CheckIcon className="h-3.5 w-3.5" />
                      {item}
                      <button
                        type="button"
                        onClick={() => handleRemoveDeliverable(index)}
                        disabled={disabled}
                        className="ml-1 rounded-full p-0.5 hover:bg-[var(--primary)]/20 transition-colors"
                      >
                        <CloseIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add New Deliverable */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDeliverable}
                  onChange={(e) => setNewDeliverable(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddDeliverable();
                    }
                  }}
                  disabled={disabled}
                  placeholder="Add item (e.g., '25 edited photos')"
                  className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleAddDeliverable}
                  disabled={disabled || !newDeliverable.trim()}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              <p className="text-xs text-foreground-muted">
                Press Enter or click Add to include items in your service package.
              </p>
            </div>
          </div>

          {/* Preview Card */}
          {(customServiceName || customPrice > 0) && (
            <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wide mb-3">Preview</p>
              <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", serviceCategories[customCategory].color)}>
                      {serviceCategories[customCategory].label}
                    </span>
                    <h4 className="font-medium text-foreground mt-1">{customServiceName || "Untitled Service"}</h4>
                    {customDescription && (
                      <p className="text-sm text-foreground-muted mt-1">{customDescription}</p>
                    )}
                    {customDuration && (
                      <p className="text-xs text-foreground-muted mt-1">{customDuration}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-foreground">{formatServicePrice(customPrice)}</p>
                  </div>
                </div>
                {customDeliverables.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--primary)]/20">
                    <p className="text-xs font-medium text-foreground-muted mb-2">Includes</p>
                    <ul className="space-y-1">
                      {customDeliverables.map((item, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckIcon className="h-4 w-4 text-[var(--success)] shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
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
                    <div className="flex items-start justify-between gap-4 flex-wrap">
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
              <div className="flex items-start justify-between gap-4 flex-wrap">
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
  /** Optional database services to search */
  services?: DatabaseServiceType[];
  serviceId?: string;
  customPrice?: number;
  customDescription?: string;
  className?: string;
  editHref?: string;
  showEditButton?: boolean;
}

export function ServiceDisplay({ services, serviceId, customPrice, customDescription, className, editHref, showEditButton = true }: ServiceDisplayProps) {
  // First try to find in database services, then fall back to static services
  type ServiceInfo = {
    id: string;
    name: string;
    category: ServiceCategory;
    description: string;
    basePrice: number;
    estimatedDuration: string;
    deliverables: string[];
  };

  let service: ServiceInfo | null = null;
  if (serviceId) {
    if (services && services.length > 0) {
      const dbService = services.find((s) => s.id === serviceId);
      if (dbService) {
        service = {
          id: dbService.id,
          name: dbService.name,
          category: dbService.category,
          description: dbService.description || "",
          basePrice: dbService.priceCents,
          estimatedDuration: dbService.duration || "",
          deliverables: dbService.deliverables,
        };
      }
    }
    if (!service) {
      const staticService = photographyServices.find((s) => s.id === serviceId);
      if (staticService) {
        service = staticService;
      }
    }
  }

  const EditButton = editHref && showEditButton ? (
    <a
      href={editHref}
      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
    >
      <EditIcon className="h-3.5 w-3.5" />
      Edit
    </a>
  ) : null;

  if (service) {
    const categoryInfo = serviceCategories[service.category];
    const displayPrice = customPrice || service.basePrice;

    return (
      <div className={cn("rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4", className)}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", categoryInfo.color)}>
                {categoryInfo.label}
              </span>
            </div>
            <h4 className="font-medium text-foreground">{service.name}</h4>
            <p className="text-sm text-foreground-muted mt-1">{service.description}</p>
          </div>
          <div className="flex items-start gap-3 shrink-0">
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{formatServicePrice(displayPrice)}</p>
              {customPrice && customPrice !== service.basePrice && (
                <p className="text-xs text-foreground-muted line-through">{formatServicePrice(service.basePrice)}</p>
              )}
            </div>
            {EditButton}
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
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
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
          <div className="flex items-start gap-3 shrink-0">
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">{formatServicePrice(customPrice || 0)}</p>
            </div>
            {EditButton}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.992 6.992 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}
