"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  serviceCategories,
  formatServicePrice,
  type ServiceCategory,
} from "@/lib/services";

export interface MultiServiceItem {
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

interface SelectedServiceInfo {
  serviceId: string;
  isPrimary: boolean;
  priceCentsOverride?: number;
}

interface MultiServiceSelectorProps {
  services: MultiServiceItem[];
  selectedServices: SelectedServiceInfo[];
  onSelectionChange: (services: SelectedServiceInfo[]) => void;
  disabled?: boolean;
  maxSelections?: number;
}

export function MultiServiceSelector({
  services,
  selectedServices,
  onSelectionChange,
  disabled = false,
  maxSelections,
}: MultiServiceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">("all");
  const [isExpanded, setIsExpanded] = useState(false);

  const activeServices = useMemo(
    () => services.filter((s) => s.isActive),
    [services]
  );

  const filteredServices = useMemo(() => {
    let filtered = activeServices;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    return filtered;
  }, [activeServices, searchQuery, selectedCategory]);

  const selectedServiceIds = useMemo(
    () => new Set(selectedServices.map((s) => s.serviceId)),
    [selectedServices]
  );

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, sel) => {
      const service = services.find((s) => s.id === sel.serviceId);
      if (!service) return sum;
      return sum + (sel.priceCentsOverride ?? service.priceCents);
    }, 0);
  }, [selectedServices, services]);

  const handleToggleService = useCallback(
    (serviceId: string) => {
      if (disabled) return;

      const isSelected = selectedServiceIds.has(serviceId);

      if (isSelected) {
        // Remove service
        const updated = selectedServices.filter((s) => s.serviceId !== serviceId);
        // If we removed the primary, make the first one primary
        if (updated.length > 0 && !updated.some((s) => s.isPrimary)) {
          updated[0].isPrimary = true;
        }
        onSelectionChange(updated);
      } else {
        // Add service
        if (maxSelections && selectedServices.length >= maxSelections) return;

        const newService: SelectedServiceInfo = {
          serviceId,
          isPrimary: selectedServices.length === 0, // First one is primary
        };
        onSelectionChange([...selectedServices, newService]);
      }
    },
    [disabled, selectedServiceIds, selectedServices, maxSelections, onSelectionChange]
  );

  const handleSetPrimary = useCallback(
    (serviceId: string) => {
      if (disabled) return;
      const updated = selectedServices.map((s) => ({
        ...s,
        isPrimary: s.serviceId === serviceId,
      }));
      onSelectionChange(updated);
    },
    [disabled, selectedServices, onSelectionChange]
  );

  const handleRemoveService = useCallback(
    (serviceId: string) => {
      if (disabled) return;
      const updated = selectedServices.filter((s) => s.serviceId !== serviceId);
      if (updated.length > 0 && !updated.some((s) => s.isPrimary)) {
        updated[0].isPrimary = true;
      }
      onSelectionChange(updated);
    },
    [disabled, selectedServices, onSelectionChange]
  );

  const categories: { id: ServiceCategory | "all"; label: string }[] = [
    { id: "all", label: "All" },
    ...Object.entries(serviceCategories).map(([key, value]) => ({
      id: key as ServiceCategory,
      label: value.label,
    })),
  ];

  return (
    <div className="space-y-4">
      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <h4 className="text-sm font-medium text-foreground">
              Selected Services ({selectedServices.length})
            </h4>
            <span className="text-lg font-bold text-foreground">
              {formatServicePrice(totalPrice)}
            </span>
          </div>
          <div className="space-y-2">
            {selectedServices.map((sel) => {
              const service = services.find((s) => s.id === sel.serviceId);
              if (!service) return null;
              const categoryInfo = serviceCategories[service.category];

              return (
                <div
                  key={sel.serviceId}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3 transition-all",
                    sel.isPrimary
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--card-border)] bg-[var(--background)]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {sel.isPrimary && (
                      <span className="shrink-0 rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-medium text-white">
                        Primary
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{service.name}</p>
                      <span className={cn("text-xs", categoryInfo.color)}>
                        {categoryInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium text-foreground">
                      {formatServicePrice(sel.priceCentsOverride ?? service.priceCents)}
                    </span>
                    {!sel.isPrimary && selectedServices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(sel.serviceId)}
                        disabled={disabled}
                        className="rounded px-2 py-1 text-xs text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(sel.serviceId)}
                      disabled={disabled}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)] transition-colors"
                    >
                      <CloseIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Service Picker */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
        {/* Header */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-[var(--background-hover)] transition-colors"
        >
          <div>
            <h4 className="font-medium text-foreground">
              {selectedServices.length === 0 ? "Select Services" : "Add More Services"}
            </h4>
            <p className="text-sm text-foreground-muted">
              {activeServices.length} services available
            </p>
          </div>
          <ChevronIcon
            className={cn(
              "h-5 w-5 text-foreground-muted transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </button>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="border-t border-[var(--card-border)] p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const count =
                  category.id === "all"
                    ? activeServices.length
                    : activeServices.filter((s) => s.category === category.id).length;

                if (count === 0 && category.id !== "all") return null;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      selectedCategory === category.id
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
                    )}
                  >
                    {category.label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-xs",
                        selectedCategory === category.id
                          ? "bg-white/20"
                          : "bg-[var(--background)]"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Service List */}
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredServices.length === 0 ? (
                <p className="text-sm text-foreground-muted text-center py-4">
                  No services found
                </p>
              ) : (
                filteredServices.map((service) => {
                  const isSelected = selectedServiceIds.has(service.id);
                  const categoryInfo = serviceCategories[service.category];
                  const isDisabled = Boolean(
                    disabled ||
                    (!isSelected && !!maxSelections && selectedServices.length >= maxSelections)
                  );

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleToggleService(service.id)}
                      disabled={isDisabled}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all",
                        isSelected
                          ? "border-[var(--primary)] bg-[var(--primary)]/5"
                          : "border-[var(--card-border)] hover:border-[var(--primary)]/50 hover:bg-[var(--background-hover)]",
                        isDisabled && !isSelected && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
                            isSelected
                              ? "bg-[var(--primary)] border-[var(--primary)]"
                              : "border-[var(--card-border)] bg-[var(--background)]"
                          )}
                        >
                          {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{service.name}</p>
                          <div className="flex items-center gap-2">
                            <span className={cn("text-xs", categoryInfo.color)}>
                              {categoryInfo.label}
                            </span>
                            {service.duration && (
                              <span className="text-xs text-foreground-muted">
                                • {service.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-foreground shrink-0">
                        {formatServicePrice(service.priceCents)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
