"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { deleteAddon, reorderAddons } from "@/lib/actions/addons";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";

interface Addon {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  imageUrl: string | null;
  iconName: string | null;
  triggerType: string;
  triggerValue: string | null;
  isActive: boolean;
  isOneTime: boolean;
  compatibleServices: { id: string; name: string }[];
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AddonListProps {
  initialAddons: Addon[];
}


const triggerTypeInfo = {
  always: { label: "Always", color: "bg-green-500/10 text-green-400" },
  with_service: { label: "With Service", color: "bg-blue-500/10 text-blue-400" },
  cart_threshold: { label: "Cart Threshold", color: "bg-purple-500/10 text-purple-400" },
};

export function AddonList({ initialAddons }: AddonListProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [addons, setAddons] = useState(initialAddons);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [triggerFilter, setTriggerFilter] = useState<"all" | "always" | "with_service" | "cart_threshold">("all");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState<string | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter addons based on search and filters
  const filteredAddons = useMemo(() => {
    return addons.filter((addon) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        addon.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && addon.isActive) ||
        (statusFilter === "inactive" && !addon.isActive);

      // Trigger filter
      const matchesTrigger =
        triggerFilter === "all" || addon.triggerType === triggerFilter;

      return matchesSearch && matchesStatus && matchesTrigger;
    });
  }, [addons, searchQuery, statusFilter, triggerFilter]);

  const activeCount = useMemo(() => addons.filter((a) => a.isActive).length, [addons]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!draggedId || draggedId === targetId) return;

      const draggedIndex = addons.findIndex((a) => a.id === draggedId);
      const targetIndex = addons.findIndex((a) => a.id === targetId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      // Reorder locally
      const newAddons = [...addons];
      const [removed] = newAddons.splice(draggedIndex, 1);
      newAddons.splice(targetIndex, 0, removed);
      setAddons(newAddons);

      // Persist to server
      const result = await reorderAddons(newAddons.map((a) => a.id));
      if (!result.success) {
        showToast("Failed to reorder addons", "error");
        setAddons(addons); // Revert
      }

      setDraggedId(null);
      setIsDragging(false);
    },
    [draggedId, addons, showToast]
  );

  // Duplicate handler
  const handleDuplicate = useCallback(
    async (id: string) => {
      const addon = addons.find((a) => a.id === id);
      if (!addon) return;

      setIsProcessing(true);
      try {
        // Import duplicateAddon dynamically to avoid adding to bundle if not used
        const { createAddon, setAddonCompatibility } = await import("@/lib/actions/addons");

        const result = await createAddon({
          name: duplicateName || `${addon.name} (Copy)`,
          description: addon.description,
          priceCents: addon.priceCents,
          imageUrl: addon.imageUrl,
          iconName: addon.iconName,
          triggerType: addon.triggerType as "always" | "with_service" | "cart_threshold",
          triggerValue: addon.triggerValue,
          isActive: true,
          isOneTime: addon.isOneTime,
        });

        if (result.success) {
          // Copy compatible services
          if (addon.compatibleServices.length > 0) {
            await setAddonCompatibility({
              addonId: result.data.id,
              serviceIds: addon.compatibleServices.map((s) => s.id),
            });
          }
          showToast("Addon duplicated successfully", "success");
          router.refresh();
        } else {
          showToast(result.error, "error");
        }
      } catch {
        showToast("Failed to duplicate addon", "error");
      } finally {
        setIsProcessing(false);
        setShowDuplicateModal(null);
        setDuplicateName("");
      }
    },
    [addons, duplicateName, router, showToast]
  );

  const openDuplicateModal = useCallback((id: string) => {
    const addon = addons.find((a) => a.id === id);
    if (addon) {
      setDuplicateName(`${addon.name} (Copy)`);
      setShowDuplicateModal(id);
    }
  }, [addons]);

  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search addons..."
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="all">All Status</option>
          <option value="active">Active ({activeCount})</option>
          <option value="inactive">Inactive ({addons.length - activeCount})</option>
        </select>

        {/* Trigger Filter */}
        <select
          value={triggerFilter}
          onChange={(e) => setTriggerFilter(e.target.value as typeof triggerFilter)}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="all">All Triggers</option>
          <option value="always">Always Show</option>
          <option value="with_service">With Service</option>
          <option value="cart_threshold">Cart Threshold</option>
        </select>
      </div>

      {/* Results Count */}
      {(searchQuery || statusFilter !== "all" || triggerFilter !== "all") && (
        <p className="text-sm text-foreground-muted">
          Showing {filteredAddons.length} of {addons.length} addons
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      )}

      {/* Grid */}
      {filteredAddons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          {addons.length === 0 ? (
            <>
              <div className="mx-auto rounded-full bg-[var(--primary)]/10 p-4 w-fit mb-4">
                <SparklesIcon className="h-8 w-8 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No addons yet</h3>
              <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
                Create addons to upsell additional services and increase your revenue per order.
              </p>
              <Link
                href="/services/addons/new"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <PlusIcon className="h-4 w-4" />
                Create Your First Addon
              </Link>
            </>
          ) : (
            <>
              <div className="mx-auto rounded-full bg-[var(--foreground-muted)]/10 p-4 w-fit mb-4">
                <SearchIcon className="h-8 w-8 text-foreground-muted" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No matching addons</h3>
              <p className="mt-2 text-sm text-foreground-muted">
                Try adjusting your search or filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTriggerFilter("all");
                }}
                className="mt-4 text-sm text-[var(--primary)] hover:underline"
              >
                Clear all filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", isDragging && "cursor-grabbing")}>
          {filteredAddons.map((addon) => {
            const triggerInfo = triggerTypeInfo[addon.triggerType as keyof typeof triggerTypeInfo];
            return (
              <div
                key={addon.id}
                draggable
                onDragStart={(e) => handleDragStart(e, addon.id)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, addon.id)}
                className={cn(
                  "group relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 transition-all hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]",
                  draggedId === addon.id && "opacity-50 ring-2 ring-[var(--primary)]",
                  isDragging && draggedId !== addon.id && "hover:ring-2 hover:ring-[var(--primary)]/50"
                )}
              >
                {/* Drag Handle */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripIcon className="h-4 w-4 text-foreground-muted" />
                </div>

                {/* Action Menu */}
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      openDuplicateModal(addon.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-[var(--background-hover)] text-foreground-muted hover:text-foreground transition-colors"
                    title="Duplicate"
                  >
                    <CopyIcon className="h-4 w-4" />
                  </button>
                </div>

                <Link href={`/services/addons/${addon.id}`} className="block pl-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", triggerInfo.color)}>
                          {triggerInfo.label}
                        </span>
                        {addon.isOneTime && (
                          <span className="rounded-full bg-[var(--background-secondary)] px-2 py-0.5 text-xs font-medium text-foreground-muted">
                            One-time
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {addon.iconName && (
                          <AddonIcon name={addon.iconName} className="h-4 w-4 text-[var(--primary)]" />
                        )}
                        <h3 className="font-medium text-foreground truncate group-hover:text-[var(--primary)] transition-colors">
                          {addon.name}
                        </h3>
                      </div>
                      {addon.description && (
                        <p className="mt-1 text-sm text-foreground-muted line-clamp-2">
                          {addon.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                        addon.isActive
                          ? "bg-green-500/10 text-green-400"
                          : "bg-[var(--background-secondary)] text-foreground-muted"
                      )}
                    >
                      {addon.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-semibold text-foreground">
                      +{formatCurrency(addon.priceCents)}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-muted">
                        {addon.compatibleServices.length > 0
                          ? `${addon.compatibleServices.length} compatible service${addon.compatibleServices.length !== 1 ? "s" : ""}`
                          : "All services"}
                      </span>
                      {addon.usageCount > 0 && (
                        <span className="text-foreground-muted">
                          {addon.usageCount} order{addon.usageCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">Duplicate Addon</h3>
            <p className="text-sm text-foreground-muted mb-4">
              Create a copy of this addon with a new name.
            </p>
            <div className="mb-6">
              <label htmlFor="duplicateName" className="block text-sm font-medium text-foreground mb-1.5">
                New Addon Name
              </label>
              <input
                type="text"
                id="duplicateName"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDuplicateModal(null);
                  setDuplicateName("");
                }}
                disabled={isProcessing}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDuplicate(showDuplicateModal)}
                disabled={isProcessing || !duplicateName.trim()}
                className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {isProcessing ? "Duplicating..." : "Duplicate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06ZM14.95 3.05a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.06a.75.75 0 0 1 1.06 0ZM3 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 10ZM14 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 14 10ZM5.172 14.828a.75.75 0 0 1 0 1.06l-1.061 1.061a.75.75 0 0 1-1.06-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM14.828 14.828a.75.75 0 0 1 1.061 0l1.06 1.061a.75.75 0 1 1-1.06 1.06l-1.061-1.06a.75.75 0 0 1 0-1.061ZM10 16a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 16Z" />
      <path fillRule="evenodd" d="M10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2.5 4a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" clipRule="evenodd" />
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

function GripIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 7a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 6a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function AddonIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "clock":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
        </svg>
      );
    case "star":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
        </svg>
      );
    case "gift":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M9.25 3.75v3h-3a.75.75 0 0 1 0-1.5h1.439a2.25 2.25 0 0 0-1.689-1.5.75.75 0 0 1 0-1.5 3.75 3.75 0 0 1 3.25 1.5ZM10.75 3.75v3h3a.75.75 0 0 0 0-1.5h-1.439a2.25 2.25 0 0 1 1.689-1.5.75.75 0 0 0 0-1.5 3.75 3.75 0 0 0-3.25 1.5ZM4.75 8.25a.75.75 0 0 0-.75.75v3.25c0 .414.336.75.75.75h4.5V8.25h-4.5ZM10.75 8.25v4.75h4.5a.75.75 0 0 0 .75-.75V9a.75.75 0 0 0-.75-.75h-4.5Z" />
          <path d="M4 15.25a2 2 0 0 0 2 2h3.25v-3.5H4v1.5ZM10.75 17.25H14a2 2 0 0 0 2-2v-1.5h-5.25v3.5Z" />
        </svg>
      );
    case "shield":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 0 1 .678 0 11.947 11.947 0 0 0 7.078 2.749.5.5 0 0 1 .479.425c.069.52.104 1.05.104 1.589 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 0 1-.332 0C5.26 16.563 2 12.162 2 7c0-.538.035-1.069.104-1.589a.5.5 0 0 1 .48-.425 11.947 11.947 0 0 0 7.077-2.75Zm4.196 5.954a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
        </svg>
      );
    case "sparkles":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06ZM14.95 3.05a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.06a.75.75 0 0 1 1.06 0ZM3 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 10ZM14 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 14 10ZM5.172 14.828a.75.75 0 0 1 0 1.06l-1.061 1.061a.75.75 0 0 1-1.06-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM14.828 14.828a.75.75 0 0 1 1.061 0l1.06 1.061a.75.75 0 1 1-1.06 1.06l-1.061-1.06a.75.75 0 0 1 0-1.061ZM10 16a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 16Z" />
          <path fillRule="evenodd" d="M10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2.5 4a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" clipRule="evenodd" />
        </svg>
      );
    case "photo":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
        </svg>
      );
    case "video":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path d="M3.25 4A2.25 2.25 0 0 0 1 6.25v7.5A2.25 2.25 0 0 0 3.25 16h7.5A2.25 2.25 0 0 0 13 13.75v-7.5A2.25 2.25 0 0 0 10.75 4h-7.5ZM19 4.75a.75.75 0 0 0-1.28-.53l-3 3a.75.75 0 0 0-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 0 0 1.28-.53V4.75Z" />
        </svg>
      );
    case "drone":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M4.93 2.31a41.401 41.401 0 0 1 10.14 0C16.194 2.45 17 3.414 17 4.517V5.5a.75.75 0 0 1-.75.75h-1.836a2.99 2.99 0 0 1-.379 1.081l1.81 1.81a.75.75 0 0 1-1.06 1.06l-1.81-1.81A2.99 2.99 0 0 1 11.893 8.75H8.107c-.39.4-.88.702-1.431.892l-1.81 1.81a.75.75 0 0 1-1.06-1.06l1.81-1.81A2.99 2.99 0 0 1 5.236 7.5H3.75A.75.75 0 0 1 3 6.75V4.517C3 3.414 3.806 2.45 4.93 2.31Zm3.027 3.69a1.25 1.25 0 1 1 2.5 0 1.25 1.25 0 0 1-2.5 0ZM10 10.75a.75.75 0 0 1 .75.75v.25H15a.75.75 0 0 1 0 1.5h-4.25v.25a.75.75 0 0 1-.75.75h-.25v2.25a.75.75 0 0 1-1.5 0V14.25H8a.75.75 0 0 1-.75-.75v-.25H5a.75.75 0 0 1 0-1.5h2.25v-.25A.75.75 0 0 1 8 10.75h2Z" clipRule="evenodd" />
        </svg>
      );
    case "home":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
          <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
        </svg>
      );
    default:
      return null;
  }
}
