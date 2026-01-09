"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  photographyServices,
  serviceCategories,
  formatServicePrice,
  type ServiceType,
  type ServiceCategory,
} from "@/lib/services";
import { PRICING_TYPES, type PricingTypeValue } from "@/lib/constants";

// Variable pricing types - derived from constants
export type PricingType = PricingTypeValue;

// Line item types matching database enum
export type LineItemType = "service" | "travel" | "custom" | "discount" | "tax";

export interface LineItem {
  id: string;
  type: LineItemType;
  serviceId?: string;
  bookingId?: string; // Link to booking for travel fees
  name: string;
  description?: string;
  category?: ServiceCategory;
  unitPrice: number; // in cents
  quantity: number;
  pricingType: PricingType;
  pricingUnit?: string; // e.g., "sq ft", "item", "hour", "miles"
  subtotal: number; // calculated: unitPrice * quantity
  // Travel-specific fields
  distanceMiles?: number;
  freeThresholdMiles?: number;
}

export interface TravelFeeInput {
  distanceMiles: number;
  feePerMileCents: number;
  freeThresholdMiles: number;
  bookingId?: string;
}

interface InvoiceBuilderProps {
  lineItems: LineItem[];
  onLineItemsChange: (items: LineItem[]) => void;
  disabled?: boolean;
  showCategoryFilter?: boolean;
  // Travel fee integration
  travelFeeInfo?: TravelFeeInput | null;
  showTravelFeeButton?: boolean;
}

const pricingTypes = PRICING_TYPES;

export function InvoiceBuilder({
  lineItems,
  onLineItemsChange,
  disabled = false,
  showCategoryFilter = true,
  travelFeeInfo,
  showTravelFeeButton = false,
}: InvoiceBuilderProps) {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">("all");
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customItem, setCustomItem] = useState<Partial<LineItem>>({
    name: "",
    description: "",
    unitPrice: 0,
    quantity: 1,
    pricingType: "fixed",
  });

  const filteredServices =
    selectedCategory === "all"
      ? photographyServices
      : photographyServices.filter((s) => s.category === selectedCategory);

  // Check if a service is already added
  const isServiceAdded = (serviceId: string) =>
    lineItems.some((item) => item.serviceId === serviceId);

  // Check if travel fee is already added
  const hasTravelFee = lineItems.some((item) => item.type === "travel");

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Add a preset service
  const addService = (service: ServiceType) => {
    if (isServiceAdded(service.id)) return;

    const newItem: LineItem = {
      id: `service-${service.id}-${Date.now()}`,
      type: "service",
      serviceId: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      unitPrice: service.basePrice,
      quantity: 1,
      pricingType: "fixed",
      subtotal: service.basePrice,
    };

    onLineItemsChange([...lineItems, newItem]);
  };

  // Remove a line item
  const removeItem = (itemId: string) => {
    onLineItemsChange(lineItems.filter((item) => item.id !== itemId));
  };

  // Update a line item
  const updateItem = (itemId: string, updates: Partial<LineItem>) => {
    onLineItemsChange(
      lineItems.map((item) => {
        if (item.id !== itemId) return item;
        const updated = { ...item, ...updates };
        // Recalculate subtotal
        updated.subtotal = updated.unitPrice * updated.quantity;
        return updated;
      })
    );
  };

  // Add custom line item
  const addCustomItem = () => {
    if (!customItem.name?.trim()) return;

    const newItem: LineItem = {
      id: `custom-${Date.now()}`,
      type: "custom",
      name: customItem.name,
      description: customItem.description,
      unitPrice: customItem.unitPrice || 0,
      quantity: customItem.quantity || 1,
      pricingType: customItem.pricingType || "fixed",
      pricingUnit: pricingTypes.find((p) => p.value === customItem.pricingType)?.unit,
      subtotal: (customItem.unitPrice || 0) * (customItem.quantity || 1),
    };

    onLineItemsChange([...lineItems, newItem]);
    setCustomItem({
      name: "",
      description: "",
      unitPrice: 0,
      quantity: 1,
      pricingType: "fixed",
    });
    setShowCustomForm(false);
  };

  // Add travel fee line item
  const addTravelFee = () => {
    if (!travelFeeInfo || hasTravelFee) return;

    const { distanceMiles, feePerMileCents, freeThresholdMiles, bookingId } = travelFeeInfo;
    const billableMiles = Math.max(0, distanceMiles - freeThresholdMiles);
    const travelFeeCents = Math.round(billableMiles * feePerMileCents);

    if (travelFeeCents === 0) return; // No fee if within free threshold

    const newItem: LineItem = {
      id: `travel-${Date.now()}`,
      type: "travel",
      bookingId,
      name: "Travel Fee",
      description: `${distanceMiles.toFixed(1)} miles from home base (${freeThresholdMiles} mi free)`,
      unitPrice: feePerMileCents,
      quantity: billableMiles,
      pricingType: "per_mile",
      pricingUnit: "miles",
      subtotal: travelFeeCents,
      distanceMiles,
      freeThresholdMiles,
    };

    onLineItemsChange([...lineItems, newItem]);
  };

  // Calculate if travel fee would be billable
  const travelFeeBillable = travelFeeInfo && travelFeeInfo.distanceMiles > travelFeeInfo.freeThresholdMiles;

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setShowServicePicker(!showServicePicker);
            setShowCustomForm(false);
          }}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
            showServicePicker
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--card-border)] text-foreground hover:border-[var(--border-hover)]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <PackageIcon className="h-4 w-4" />
          Add Service Package
        </button>
        <button
          type="button"
          onClick={() => {
            setShowCustomForm(!showCustomForm);
            setShowServicePicker(false);
          }}
          disabled={disabled}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
            showCustomForm
              ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
              : "border-[var(--card-border)] text-foreground hover:border-[var(--border-hover)]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <PlusIcon className="h-4 w-4" />
          Add Custom Item
        </button>
        {showTravelFeeButton && travelFeeInfo && travelFeeBillable && (
          <button
            type="button"
            onClick={addTravelFee}
            disabled={disabled || hasTravelFee}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all",
              hasTravelFee
                ? "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)] cursor-not-allowed"
                : "border-[var(--card-border)] text-foreground hover:border-[var(--primary)] hover:bg-[var(--primary)]/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <CarIcon className="h-4 w-4" />
            {hasTravelFee ? "Travel Fee Added" : `Add Travel Fee ($${(Math.round(Math.max(0, travelFeeInfo.distanceMiles - travelFeeInfo.freeThresholdMiles) * travelFeeInfo.feePerMileCents) / 100).toFixed(2)})`}
          </button>
        )}
      </div>

      {/* Service Picker */}
      {showServicePicker && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">Select Service Packages</h3>
            <button
              type="button"
              onClick={() => setShowServicePicker(false)}
              className="text-foreground-muted hover:text-foreground"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Category Filter */}
          {showCategoryFilter && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedCategory === "all"
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
                )}
              >
                All
              </button>
              {Object.entries(serviceCategories).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCategory(key as ServiceCategory)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedCategory === key
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Service Grid */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-[300px] overflow-y-auto">
            {filteredServices.map((service) => {
              const isAdded = isServiceAdded(service.id);
              const categoryInfo = serviceCategories[service.category];

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => addService(service)}
                  disabled={isAdded || disabled}
                  className={cn(
                    "text-left rounded-lg border p-3 transition-all",
                    isAdded
                      ? "border-[var(--success)]/30 bg-[var(--success)]/10 opacity-60 cursor-not-allowed"
                      : "border-[var(--card-border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", categoryInfo.color)}>
                      {categoryInfo.label}
                    </span>
                    {isAdded && (
                      <span className="rounded-full bg-[var(--success)] px-1.5 py-0.5 text-[10px] font-medium text-white">
                        Added
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-medium text-foreground truncate">{service.name}</h4>
                  <p className="text-xs text-foreground-muted truncate">{service.description}</p>
                  <p className="text-sm font-bold text-foreground mt-1">{formatServicePrice(service.basePrice)}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Item Form */}
      {showCustomForm && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">Add Custom Line Item</h3>
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="text-foreground-muted hover:text-foreground"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Item Name *</label>
              <input
                type="text"
                value={customItem.name || ""}
                onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                placeholder="e.g., Additional editing, Rush delivery, Travel fee"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
              <input
                type="text"
                value={customItem.description || ""}
                onChange={(e) => setCustomItem({ ...customItem, description: e.target.value })}
                placeholder="Optional description for the client"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Pricing Type</label>
              <select
                value={customItem.pricingType || "fixed"}
                onChange={(e) =>
                  setCustomItem({
                    ...customItem,
                    pricingType: e.target.value as PricingType,
                    quantity: e.target.value === "fixed" ? 1 : customItem.quantity || 1,
                  })
                }
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                {pricingTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {customItem.pricingType === "fixed" ? "Price" : "Unit Price"}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={(customItem.unitPrice || 0) / 100 || ""}
                  onChange={(e) =>
                    setCustomItem({
                      ...customItem,
                      unitPrice: Math.round(parseFloat(e.target.value || "0") * 100),
                    })
                  }
                  placeholder="0.00"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            {customItem.pricingType !== "fixed" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Quantity ({pricingTypes.find((p) => p.value === customItem.pricingType)?.unit || "units"})
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={customItem.quantity || 1}
                  onChange={(e) => setCustomItem({ ...customItem, quantity: parseInt(e.target.value || "1", 10) })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            )}

            {customItem.pricingType !== "fixed" && (
              <div className="flex items-end">
                <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-4 py-2.5 text-sm">
                  <span className="text-foreground-muted">Subtotal: </span>
                  <span className="font-bold text-foreground">
                    {formatServicePrice((customItem.unitPrice || 0) * (customItem.quantity || 1))}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCustomForm(false)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={addCustomItem}
              disabled={!customItem.name?.trim()}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Item
            </button>
          </div>
        </div>
      )}

      {/* Line Items List */}
      {lineItems.length > 0 && (
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--card-border)] bg-[var(--background)]">
            <h3 className="text-sm font-semibold text-foreground">Invoice Items</h3>
          </div>

          <div className="divide-y divide-[var(--card-border)]">
            {lineItems.map((item, index) => {
              const categoryInfo = item.category ? serviceCategories[item.category] : null;

              return (
                <div key={item.id} className="px-4 py-3 flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--background-secondary)] flex items-center justify-center text-sm font-medium text-foreground-muted">
                    {index + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {categoryInfo && (
                        <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-medium", categoryInfo.color)}>
                          {categoryInfo.label}
                        </span>
                      )}
                      {item.type === "travel" && (
                        <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400 inline-flex items-center gap-1">
                          <CarIcon className="h-2.5 w-2.5" />
                          Travel
                        </span>
                      )}
                      {item.type === "custom" && (
                        <span className="rounded-full bg-gray-500/10 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                          Custom
                        </span>
                      )}
                      {item.type === "discount" && (
                        <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-medium text-green-400">
                          Discount
                        </span>
                      )}
                      {item.type === "tax" && (
                        <span className="rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-medium text-orange-400">
                          Tax
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    {item.description && (
                      <p className="text-xs text-foreground-muted mt-0.5">{item.description}</p>
                    )}
                  </div>

                  {/* Quantity/Price Editor */}
                  <div className="flex items-center gap-3 shrink-0">
                    {item.pricingType !== "fixed" && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, { quantity: parseInt(e.target.value || "1", 10) })
                          }
                          disabled={disabled}
                          className="w-16 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-2 py-1.5 text-sm text-center text-foreground focus:border-[var(--primary)] focus:outline-none"
                        />
                        <span className="text-xs text-foreground-muted">{item.pricingUnit || "units"}</span>
                        <span className="text-foreground-muted">×</span>
                        <span className="text-sm text-foreground">{formatServicePrice(item.unitPrice)}</span>
                      </div>
                    )}

                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-bold text-foreground">{formatServicePrice(item.subtotal)}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={disabled}
                      className="text-foreground-muted hover:text-[var(--error)] transition-colors disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="px-4 py-4 border-t border-[var(--card-border)] bg-[var(--background)]">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <span className="text-sm font-medium text-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">{formatServicePrice(subtotal)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {lineItems.length === 0 && !showServicePicker && !showCustomForm && (
        <div className="rounded-lg border-2 border-dashed border-[var(--card-border)] bg-[var(--background)] p-8 text-center">
          <InvoiceIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <p className="mt-3 text-sm font-medium text-foreground">No items added yet</p>
          <p className="mt-1 text-xs text-foreground-muted">
            Add service packages or custom line items to build your invoice
          </p>
        </div>
      )}
    </div>
  );
}

// Display component for showing invoice summary (read-only)
interface InvoiceSummaryProps {
  lineItems: LineItem[];
  className?: string;
  showEdit?: boolean;
  onEdit?: () => void;
}

export function InvoiceSummary({ lineItems, className, showEdit, onEdit }: InvoiceSummaryProps) {
  const total = lineItems.reduce((sum, item) => sum + item.subtotal, 0);

  if (lineItems.length === 0) return null;

  return (
    <div className={cn("rounded-lg border border-[var(--card-border)] bg-[var(--background)]", className)}>
      <div className="px-4 py-3 border-b border-[var(--card-border)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Service Summary</h3>
        {showEdit && onEdit && (
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:underline"
          >
            <EditIcon className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      <div className="divide-y divide-[var(--card-border)]">
        {lineItems.map((item) => (
          <div key={item.id} className="px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm text-foreground truncate">{item.name}</p>
                {item.type === "travel" && (
                  <span className="rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-400 inline-flex items-center gap-1 shrink-0">
                    <CarIcon className="h-2.5 w-2.5" />
                    Travel
                  </span>
                )}
              </div>
              {item.pricingType !== "fixed" && (
                <p className="text-xs text-foreground-muted">
                  {item.type === "travel" ? item.quantity.toFixed(1) : item.quantity} {item.pricingUnit} × {formatServicePrice(item.unitPrice)}
                </p>
              )}
            </div>
            <span className="text-sm font-medium text-foreground shrink-0">
              {formatServicePrice(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-[var(--card-border)] bg-[var(--background-secondary)]">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">{formatServicePrice(total)}</span>
        </div>
      </div>
    </div>
  );
}

// Icons
function PackageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.362 1.093a.75.75 0 0 0-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925ZM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0 0 18 14.25V6.443ZM9.25 18.693v-8.25l-7.25-4v7.807a.75.75 0 0 0 .388.657l6.862 3.786Z" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
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

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13ZM13.25 9a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm-6.5 4a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 1 .75-.75Zm4-1.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.5 3c-1.051 0-2.093.04-3.125.117A1.49 1.49 0 002 4.607V10.5h-.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5H2v.5a1 1 0 001 1h1a1 1 0 001-1v-.5h10v.5a1 1 0 001 1h1a1 1 0 001-1v-.5h.5a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5H18V4.607a1.49 1.49 0 00-1.375-1.49A49.214 49.214 0 0013.5 3h-7zM5 8a1 1 0 11-2 0 1 1 0 012 0zm12 0a1 1 0 11-2 0 1 1 0 012 0zM6.5 5h7a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-7a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5z" />
    </svg>
  );
}
