"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { updateInvoice } from "@/lib/actions/invoices";
import type { LineItemType } from "@prisma/client";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitCents: number;
  totalCents: number;
  itemType: LineItemType;
  sortOrder: number;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  clientId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientAddress: string | null;
  dueDate: string;
  notes: string | null;
  terms: string | null;
  currency: string;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  lateFeeEnabled: boolean;
  lateFeeType: string | null;
  lateFeePercent: number | null;
  lateFeeFlatCents: number | null;
  lineItems: LineItem[];
}

interface Client {
  id: string;
  fullName: string | null;
  email: string;
  company: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
}

interface InvoiceEditorProps {
  invoice: InvoiceData;
  clients: Client[];
  services: Service[];
}

const lineItemTypeOptions: { value: LineItemType; label: string }[] = [
  { value: "service", label: "Service" },
  { value: "travel", label: "Travel" },
  { value: "custom", label: "Custom" },
  { value: "discount", label: "Discount" },
  { value: "tax", label: "Tax" },
];

function formatCurrency(cents: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

// Sortable Line Item Component
function SortableLineItem({
  item,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
  canRemove,
  currency,
}: {
  item: LineItem;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<LineItem>) => void;
  onRemove: () => void;
  canRemove: boolean;
  currency: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-[var(--card)] p-4 transition-all",
        isDragging && "opacity-50 shadow-lg",
        isSelected
          ? "border-[var(--primary)] ring-1 ring-[var(--primary)]"
          : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <button
          type="button"
          className="mt-1 cursor-grab touch-none text-foreground-muted hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <input
            type="text"
            value={item.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Line item description"
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-24">
              <label className="mb-1 block text-xs text-foreground-muted">Qty</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdate({ quantity: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="flex-1 min-w-[120px]">
              <label className="mb-1 block text-xs text-foreground-muted">Unit Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitCents ? (item.unitCents / 100).toFixed(2) : ""}
                  onChange={(e) => onUpdate({ unitCents: Math.round(parseFloat(e.target.value || "0") * 100) })}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-3 py-1.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div className="w-32">
              <label className="mb-1 block text-xs text-foreground-muted">Type</label>
              <select
                value={item.itemType}
                onChange={(e) => onUpdate({ itemType: e.target.value as LineItemType })}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-2 py-1.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                {lineItemTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-24 text-right">
              <label className="mb-1 block text-xs text-foreground-muted">Total</label>
              <p className="py-1.5 text-sm font-medium text-foreground">
                {formatCurrency(item.unitCents * item.quantity, currency)}
              </p>
            </div>

            {canRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="mt-5 p-1.5 text-foreground-muted hover:text-red-400 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Drag Overlay Item
function DragOverlayItem({ item, currency }: { item: LineItem; currency: string }) {
  return (
    <div className="rounded-lg border border-[var(--primary)] bg-[var(--card)] p-4 shadow-xl">
      <div className="flex items-center gap-3">
        <GripVerticalIcon className="h-5 w-5 text-foreground-muted" />
        <div className="flex-1">
          <p className="font-medium text-foreground">{item.description || "Untitled item"}</p>
          <p className="text-sm text-foreground-muted">
            {item.quantity} × {formatCurrency(item.unitCents, currency)}
          </p>
        </div>
        <p className="font-medium text-foreground">
          {formatCurrency(item.unitCents * item.quantity, currency)}
        </p>
      </div>
    </div>
  );
}

export function InvoiceEditor({ invoice, clients, services }: InvoiceEditorProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [clientId, setClientId] = useState(invoice.clientId || "");
  const [dueDate, setDueDate] = useState(invoice.dueDate);
  const [notes, setNotes] = useState(invoice.notes || "");
  const [terms, setTerms] = useState(invoice.terms || "");
  const [discountCents, setDiscountCents] = useState(invoice.discountCents);
  const [taxPercent, setTaxPercent] = useState(
    invoice.subtotalCents > 0 ? (invoice.taxCents / invoice.subtotalCents) * 100 : 0
  );
  const [lateFeeEnabled, setLateFeeEnabled] = useState(invoice.lateFeeEnabled);
  const [lateFeeType, setLateFeeType] = useState(invoice.lateFeeType || "percentage");
  const [lateFeePercent, setLateFeePercent] = useState(invoice.lateFeePercent || 5);
  const [lateFeeFlatCents, setLateFeeFlatCents] = useState(invoice.lateFeeFlatCents || 2500);

  // Line items state
  const [lineItems, setLineItems] = useState<LineItem[]>(
    invoice.lineItems.map((item, index) => ({
      ...item,
      sortOrder: index,
    }))
  );
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Calculate totals
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + item.unitCents * item.quantity, 0);
  }, [lineItems]);

  const taxCents = useMemo(() => {
    return Math.round(subtotal * (taxPercent / 100));
  }, [subtotal, taxPercent]);

  const total = useMemo(() => {
    return subtotal - discountCents + taxCents;
  }, [subtotal, discountCents, taxCents]);

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    setLineItems((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        sortOrder: index,
      }));
    });
  };

  // Line item operations
  const addLineItem = (service?: Service) => {
    const newItem: LineItem = {
      id: `new-${Date.now()}`,
      description: service
        ? `${service.name}${service.description ? ` - ${service.description}` : ""}`
        : "",
      quantity: 1,
      unitCents: service?.priceCents || 0,
      totalCents: service?.priceCents || 0,
      itemType: "service",
      sortOrder: lineItems.length,
    };
    setLineItems([...lineItems, newItem]);
    setSelectedItemId(newItem.id);
  };

  const updateLineItem = (id: string, updates: Partial<LineItem>) => {
    setLineItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              totalCents: (updates.unitCents ?? item.unitCents) * (updates.quantity ?? item.quantity),
            }
          : item
      )
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems((items) => items.filter((item) => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!clientId) {
      showToast("Please select a client", "error");
      return;
    }

    const validItems = lineItems.filter((item) => item.description && item.unitCents > 0);
    if (validItems.length === 0) {
      showToast("Please add at least one line item with a description and price", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateInvoice(invoice.id, {
        clientId,
        dueDate: new Date(dueDate),
        notes: notes || undefined,
        terms: terms || undefined,
        discountCents,
        taxCents,
        lateFeeEnabled,
        lateFeeType: lateFeeEnabled ? lateFeeType : undefined,
        lateFeePercent: lateFeeEnabled && lateFeeType === "percentage" ? lateFeePercent : undefined,
        lateFeeFlatCents: lateFeeEnabled && lateFeeType === "flat" ? lateFeeFlatCents : undefined,
        lineItems: validItems.map((item, index) => ({
          id: item.id.startsWith("new-") ? undefined : item.id,
          description: item.description,
          quantity: item.quantity,
          unitCents: item.unitCents,
          itemType: item.itemType,
          sortOrder: index,
        })),
      });

      if (result.success) {
        showToast("Invoice updated successfully", "success");
        router.push(`/invoices/${invoice.id}`);
        router.refresh();
      } else {
        showToast(result.error || "Failed to update invoice", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeItem = activeId ? lineItems.find((item) => item.id === activeId) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Panel - Services Palette */}
      <div className="lg:col-span-3">
        <div className="sticky top-24 space-y-4">
          {/* Quick Add Services */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Quick Add</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => addLineItem()}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-[var(--card-border)] p-3 text-sm text-foreground-muted transition-colors hover:border-[var(--primary)] hover:text-foreground"
              >
                <PlusIcon className="h-4 w-4" />
                Add Custom Item
              </button>
            </div>

            {services.length > 0 && (
              <>
                <hr className="my-3 border-[var(--card-border)]" />
                <h4 className="mb-2 text-xs font-medium text-foreground-muted uppercase tracking-wider">
                  From Services
                </h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => addLineItem(service)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg p-2 text-left text-sm transition-colors hover:bg-[var(--background-hover)]"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{service.name}</p>
                        {service.description && (
                          <p className="truncate text-xs text-foreground-muted">{service.description}</p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs text-foreground-muted">
                        {formatCurrency(service.priceCents, invoice.currency)}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Client Selection */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Client</h3>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              <option value="">Select client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.fullName || client.email}
                  {client.company ? ` (${client.company})` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Center Panel - Line Items */}
      <div className="lg:col-span-6">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background-secondary)] p-4">
          <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
            <h3 className="font-semibold text-foreground">Line Items</h3>
            <span className="text-sm text-foreground-muted">{lineItems.length} items</span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={lineItems.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {lineItems.map((item) => (
                  <SortableLineItem
                    key={item.id}
                    item={item}
                    isSelected={selectedItemId === item.id}
                    onSelect={() => setSelectedItemId(item.id)}
                    onUpdate={(updates) => updateLineItem(item.id, updates)}
                    onRemove={() => removeLineItem(item.id)}
                    canRemove={lineItems.length > 1}
                    currency={invoice.currency}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeItem && (
                <DragOverlayItem item={activeItem} currency={invoice.currency} />
              )}
            </DragOverlay>
          </DndContext>

          {lineItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 rounded-full bg-[var(--background-secondary)] p-3">
                <ReceiptIcon className="h-6 w-6 text-foreground-muted" />
              </div>
              <p className="font-medium text-foreground">No line items</p>
              <p className="text-sm text-foreground-muted">
                Add items from the left panel or click below
              </p>
              <button
                type="button"
                onClick={() => addLineItem()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <PlusIcon className="h-4 w-4" />
                Add Line Item
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground-muted">Subtotal</span>
              <span className="text-foreground">{formatCurrency(subtotal, invoice.currency)}</span>
            </div>
            {discountCents > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--success-text)]">Discount</span>
                <span className="text-[var(--success-text)]">
                  -{formatCurrency(discountCents, invoice.currency)}
                </span>
              </div>
            )}
            {taxCents > 0 && (
              <div className="flex justify-between">
                <span className="text-foreground-muted">Tax ({taxPercent.toFixed(1)}%)</span>
                <span className="text-foreground">{formatCurrency(taxCents, invoice.currency)}</span>
              </div>
            )}
            <hr className="border-[var(--card-border)]" />
            <div className="flex justify-between text-base font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">{formatCurrency(total, invoice.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Settings */}
      <div className="lg:col-span-3">
        <div className="sticky top-24 space-y-4">
          {/* Invoice Details */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Details</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-foreground-muted">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-foreground-muted">Discount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountCents ? (discountCents / 100).toFixed(2) : ""}
                    onChange={(e) => setDiscountCents(Math.max(0, Math.round(parseFloat(e.target.value || "0") * 100)))}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-foreground-muted">Tax Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxPercent || ""}
                    onChange={(e) => setTaxPercent(Math.min(100, Math.max(0, parseFloat(e.target.value || "0"))))}
                    placeholder="0"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 pr-8 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Late Fee Settings */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <h3 className="text-sm font-semibold text-foreground">Late Fees</h3>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={lateFeeEnabled}
                  onChange={(e) => setLateFeeEnabled(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-5 w-9 rounded-full bg-[var(--background-secondary)] after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--primary)] peer-checked:after:translate-x-full"></div>
              </label>
            </div>

            {lateFeeEnabled && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLateFeeType("percentage")}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      lateFeeType === "percentage"
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
                    )}
                  >
                    Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() => setLateFeeType("flat")}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      lateFeeType === "flat"
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
                    )}
                  >
                    Flat Fee
                  </button>
                </div>

                {lateFeeType === "percentage" ? (
                  <div>
                    <label className="mb-1 block text-xs text-foreground-muted">Percentage</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={lateFeePercent}
                        onChange={(e) => setLateFeePercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 pr-8 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">%</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-xs text-foreground-muted">Flat Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted text-sm">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={lateFeeFlatCents ? (lateFeeFlatCents / 100).toFixed(2) : ""}
                        onChange={(e) => setLateFeeFlatCents(Math.max(0, Math.round(parseFloat(e.target.value || "0") * 100)))}
                        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-foreground-muted">
                  Late fee will be applied 1 day after due date
                </p>
              </div>
            )}
          </div>

          {/* Notes & Terms */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Notes & Terms</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-foreground-muted">Notes (visible to client)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thank you for your business..."
                  rows={2}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-foreground-muted">Terms & Conditions</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Payment is due within 30 days..."
                  rows={2}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoadingIcon className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/invoices/${invoice.id}`)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icons
function GripVerticalIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M7 2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7ZM4 9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Zm2 5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H6Zm7-12a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2Zm-2 7a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2Zm2 7a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2Z" clipRule="evenodd" />
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

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 6.75a.75.75 0 0 0-1.5 0v5.5a.75.75 0 0 0 1.5 0v-5.5Zm2.5 2.5a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
