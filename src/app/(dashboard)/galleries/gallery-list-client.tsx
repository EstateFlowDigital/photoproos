"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GalleryCard, type QuickAction } from "@/components/dashboard/gallery-card";
import { useToast } from "@/components/ui/toast";
import { duplicateGallery, archiveGallery, deleteGallery, bulkArchiveGalleries, bulkDeleteGalleries } from "@/lib/actions/galleries";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  SearchIcon,
  XIcon as CloseIcon,
  ChevronDownIcon,
  GalleryPlaceholderIcon,
  PlusIcon,
  MoreIcon,
  ShareIcon,
  DuplicateIcon,
  ArchiveIcon,
  TrashIcon,
  CheckboxIcon,
  CheckIcon,
  FilterIcon,
  ExportIcon,
  EyeIcon,
  DownloadIcon,
} from "@/components/ui/icons";
import { ViewModeToggle } from "@/components/ui/view-mode-toggle";

interface GalleryService {
  id: string;
  name: string;
  category: string;
  isPrimary: boolean;
}

interface AvailableService {
  id: string;
  name: string;
  category: string;
}

interface Gallery {
  id: string;
  name: string;
  client: string;
  photos: number;
  status: "delivered" | "pending" | "draft" | "archived";
  revenue?: string;
  thumbnailUrl?: string;
  createdAt?: string;
  views?: number;
  downloads?: number;
  pendingAddonRequests?: number;
  services: GalleryService[];
}

interface GalleryListClientProps {
  galleries: Gallery[];
  filter: "all" | "delivered" | "pending" | "draft";
  availableServices: AvailableService[];
}

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "revenue-high" | "revenue-low";
type ViewMode = "grid" | "list";

export function GalleryListClient({ galleries, filter, availableServices }: GalleryListClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedGalleries, setSelectedGalleries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [serviceFilter, setServiceFilter] = useState<Set<string>>(new Set());
  const [showServiceFilter, setShowServiceFilter] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const serviceFilterRef = useRef<HTMLDivElement>(null);
  const tableParentRef = useRef<HTMLDivElement>(null);

  // Close action menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActionMenuOpen(null);
      }
    }
    if (actionMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [actionMenuOpen]);

  // Close service filter when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (serviceFilterRef.current && !serviceFilterRef.current.contains(event.target as Node)) {
        setShowServiceFilter(false);
      }
    }
    if (showServiceFilter) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showServiceFilter]);

  // Toggle service in filter
  const toggleServiceFilter = (serviceId: string) => {
    setServiceFilter((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) {
        next.delete(serviceId);
      } else {
        next.add(serviceId);
      }
      return next;
    });
  };

  const clearServiceFilter = () => {
    setServiceFilter(new Set());
  };

  // Quick action handler
  const handleQuickAction = async (action: QuickAction, galleryId: string) => {
    const gallery = galleries.find((g) => g.id === galleryId);
    const galleryName = gallery?.name || "Gallery";

    switch (action) {
      case "share":
        navigator.clipboard.writeText(`${window.location.origin}/g/${galleryId}`);
        showToast("Gallery link copied to clipboard", "success");
        break;
      case "duplicate":
        setIsLoading(true);
        try {
          const result = await duplicateGallery(galleryId, undefined, false);
          if (result.success) {
            showToast(`"${galleryName}" duplicated successfully`, "success");
            router.refresh();
          } else {
            showToast(result.error || "Failed to duplicate gallery", "error");
          }
        } catch {
          showToast("Failed to duplicate gallery", "error");
        } finally {
          setIsLoading(false);
        }
        break;
      case "archive":
        setIsLoading(true);
        try {
          const result = await archiveGallery(galleryId, true);
          if (result.success) {
            showToast(`"${galleryName}" has been archived`, "success");
            router.refresh();
          } else {
            showToast(result.error || "Failed to archive gallery", "error");
          }
        } catch {
          showToast("Failed to archive gallery", "error");
        } finally {
          setIsLoading(false);
        }
        break;
      case "delete":
        setShowDeleteConfirm(galleryId);
        break;
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!showDeleteConfirm) return;

    const gallery = galleries.find((g) => g.id === showDeleteConfirm);
    const galleryName = gallery?.name || "Gallery";

    setIsLoading(true);
    try {
      const result = await deleteGallery(showDeleteConfirm);
      if (result.success) {
        showToast(`"${galleryName}" has been deleted`, "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete gallery", "error");
      }
    } catch {
      showToast("Failed to delete gallery", "error");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleListAction = (action: QuickAction, galleryId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActionMenuOpen(null);
    handleQuickAction(action, galleryId);
  };

  // Selection mode handlers
  const toggleSelectMode = () => {
    if (isSelectMode) {
      setSelectedGalleries(new Set());
    }
    setIsSelectMode(!isSelectMode);
  };

  const toggleGallerySelection = (galleryId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedGalleries((prev) => {
      const next = new Set(prev);
      if (next.has(galleryId)) {
        next.delete(galleryId);
      } else {
        next.add(galleryId);
      }
      return next;
    });
  };

  const selectAllGalleries = () => {
    setSelectedGalleries(new Set(displayedGalleries.map((g) => g.id)));
  };

  const deselectAllGalleries = () => {
    setSelectedGalleries(new Set());
  };

  // Bulk action handlers
  const handleBulkArchive = async () => {
    const count = selectedGalleries.size;
    const ids = Array.from(selectedGalleries);

    setIsLoading(true);
    try {
      const result = await bulkArchiveGalleries(ids, true);
      if (result.success) {
        showToast(`${count} gallery${count !== 1 ? "ies" : "y"} archived`, "success");
        setSelectedGalleries(new Set());
        setIsSelectMode(false);
        router.refresh();
      } else {
        showToast(result.error || "Failed to archive galleries", "error");
      }
    } catch {
      showToast("Failed to archive galleries", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = () => {
    setShowBulkDeleteConfirm(true);
  };

  const handleBulkDeleteConfirm = async () => {
    const count = selectedGalleries.size;
    const ids = Array.from(selectedGalleries);

    setIsLoading(true);
    try {
      const result = await bulkDeleteGalleries(ids);
      if (result.success) {
        showToast(`${count} gallery${count !== 1 ? "ies" : "y"} deleted`, "success");
        setSelectedGalleries(new Set());
        setIsSelectMode(false);
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete galleries", "error");
      }
    } catch {
      showToast("Failed to delete galleries", "error");
    } finally {
      setIsLoading(false);
      setShowBulkDeleteConfirm(false);
    }
  };

  const handleBulkExport = () => {
    const selectedGalleryList = galleries.filter((g) => selectedGalleries.has(g.id));
    const count = selectedGalleryList.length;

    // Generate CSV
    const csvRows = [
      ["Name", "Client", "Status", "Photos", "Views", "Downloads", "Revenue", "Created"].join(","),
      ...selectedGalleryList.map((g) =>
        [
          `"${g.name.replace(/"/g, '""')}"`,
          `"${g.client.replace(/"/g, '""')}"`,
          g.status,
          g.photos,
          g.views || 0,
          g.downloads || 0,
          g.revenue || "$0",
          g.createdAt || "",
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `galleries-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Exported ${count} gallery${count !== 1 ? "ies" : ""}`, "success");
    setSelectedGalleries(new Set());
    setIsSelectMode(false);
  };

  const handleBulkShare = () => {
    const count = selectedGalleries.size;
    const links = Array.from(selectedGalleries)
      .map((id) => `${window.location.origin}/g/${id}`)
      .join("\n");
    navigator.clipboard.writeText(links);
    showToast(`${count} gallery link${count !== 1 ? "s" : ""} copied to clipboard`, "success");
  };

  // Parse revenue string to number for sorting
  const parseRevenue = (revenue?: string) => {
    if (!revenue) return 0;
    return parseInt(revenue.replace(/[$,]/g, ""), 10);
  };

  // Filter and sort galleries
  const displayedGalleries = useMemo(() => {
    let result = [...galleries];

    // Apply status filter
    if (filter !== "all") {
      result = result.filter((g) => g.status === filter);
    }

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      result = result.filter(
        (g) =>
          (g.name || "").toLowerCase().includes(searchLower) ||
          (g.client || "").toLowerCase().includes(searchLower) ||
          (g.services || []).some((s) => (s.name || "").toLowerCase().includes(searchLower))
      );
    }

    // Apply service filter
    if (serviceFilter.size > 0) {
      result = result.filter((g) =>
        (g.services || []).some((s) => serviceFilter.has(s.id))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.createdAt || "").localeCompare(a.createdAt || "");
        case "oldest":
          return (a.createdAt || "").localeCompare(b.createdAt || "");
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "revenue-high":
          return parseRevenue(b.revenue) - parseRevenue(a.revenue);
        case "revenue-low":
          return parseRevenue(a.revenue) - parseRevenue(b.revenue);
        default:
          return 0;
      }
    });

    return result;
  }, [galleries, filter, search, sortBy, serviceFilter]);

  const rowVirtualizer = useVirtualizer({
    count: displayedGalleries.length,
    getScrollElement: () => tableParentRef.current,
    estimateSize: () => 82,
    overscan: 8,
    getItemKey: (index) => displayedGalleries[index]?.id ?? index,
    measureElement: (el) => el?.getBoundingClientRect().height ?? 0,
  });

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "revenue-high", label: "Revenue (High)" },
    { value: "revenue-low", label: "Revenue (Low)" },
  ];

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative w-full max-w-none sm:max-w-md sm:flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search galleries or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort & View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full min-w-[180px] appearance-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] py-2.5 pl-3 pr-10 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:w-auto"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          </div>

          {/* Service Filter Dropdown */}
          {availableServices.length > 0 && (
            <div className="relative" ref={serviceFilterRef}>
              <button
                onClick={() => setShowServiceFilter(!showServiceFilter)}
                className={cn(
                  "inline-flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors sm:w-auto",
                  serviceFilter.size > 0
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "border-[var(--card-border)] bg-[var(--background)] text-foreground hover:bg-[var(--background-hover)]"
                )}
              >
                <FilterIcon className="h-4 w-4" />
                Services
                {serviceFilter.size > 0 && (
                  <span className="rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-xs text-white">
                    {serviceFilter.size}
                  </span>
                )}
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              {showServiceFilter && (
                <div className="absolute right-0 top-12 z-20 w-64 max-w-[calc(100vw-2rem)] rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-2 shadow-xl">
                  <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-2 border-b border-[var(--card-border)]">
                    <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                      Filter by Service
                    </span>
                    {serviceFilter.size > 0 && (
                      <button
                        onClick={clearServiceFilter}
                        className="text-xs text-[var(--primary)] hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {availableServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => toggleServiceFilter(service.id)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-foreground hover:bg-[var(--background-hover)]"
                      >
                        <div
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                            serviceFilter.has(service.id)
                              ? "bg-[var(--primary)] border-[var(--primary)]"
                              : "border-[var(--card-border)]"
                          )}
                        >
                          {serviceFilter.has(service.id) && (
                            <CheckIcon className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <span className="truncate">{service.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* View Toggle */}
          <ViewModeToggle value={viewMode} onChange={setViewMode} />

          {/* Select Mode Toggle */}
          {displayedGalleries.length > 0 && (
            <button
              onClick={toggleSelectMode}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                isSelectMode
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--card-border)] bg-[var(--background)] text-foreground hover:bg-[var(--background-hover)]"
              )}
            >
              <CheckboxIcon className="h-4 w-4" />
              {isSelectMode ? "Cancel" : "Select"}
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar */}
      {isSelectMode && selectedGalleries.size > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">
              {selectedGalleries.size} gallery{selectedGalleries.size !== 1 ? "ies" : "y"} selected
            </span>
            <button
              onClick={selectedGalleries.size === displayedGalleries.length ? deselectAllGalleries : selectAllGalleries}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              {selectedGalleries.size === displayedGalleries.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBulkShare}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ShareIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handleBulkExport}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ExportIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handleBulkArchive}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArchiveIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Archive</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-1.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20"
            >
              <TrashIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Count */}
      {search && (
        <p className="text-sm text-foreground-muted">
          {displayedGalleries.length} result{displayedGalleries.length !== 1 ? "s" : ""} for "{search}"
        </p>
      )}

      {/* Gallery Display */}
      {displayedGalleries.length > 0 ? (
        viewMode === "grid" ? (
          <div className="auto-grid grid-min-240 grid-gap-4">
            {displayedGalleries.map((gallery) => (
              <div key={gallery.id} className="relative">
                {isSelectMode && (
                  <button
                    onClick={(e) => toggleGallerySelection(gallery.id, e)}
                    className={cn(
                      "absolute top-3 left-3 z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded border transition-colors",
                      selectedGalleries.has(gallery.id)
                        ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                        : "bg-[var(--card)] border-[var(--card-border)] hover:border-[var(--primary)]"
                    )}
                  >
                    {selectedGalleries.has(gallery.id) && <CheckIcon className="h-4 w-4" />}
                  </button>
                )}
                <div
                  onClick={() => isSelectMode && toggleGallerySelection(gallery.id)}
                  className={cn(
                    isSelectMode && "cursor-pointer",
                    isSelectMode && selectedGalleries.has(gallery.id) && "ring-2 ring-[var(--primary)] rounded-xl"
                  )}
                >
                  <GalleryCard
                    id={gallery.id}
                    title={gallery.name}
                    client={gallery.client}
                    photos={gallery.photos}
                    status={gallery.status}
                    revenue={gallery.revenue}
                    thumbnailUrl={gallery.thumbnailUrl}
                    views={gallery.views}
                    downloads={gallery.downloads}
                    pendingAddonRequests={gallery.pendingAddonRequests}
                    onQuickAction={isSelectMode ? undefined : handleQuickAction}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
            <div
              className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-[var(--card)] to-transparent md:hidden"
              aria-hidden="true"
            />
            <div ref={tableParentRef} className="max-h-[70vh] overflow-auto scrollbar-thin">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    {isSelectMode && (
                      <th className="w-10 px-4 py-3">
                        <button
                          onClick={
                            selectedGalleries.size === displayedGalleries.length
                              ? deselectAllGalleries
                              : selectAllGalleries
                          }
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                            selectedGalleries.size === displayedGalleries.length
                              ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                              : "border-[var(--card-border)] hover:border-[var(--primary)]"
                          )}
                        >
                          {selectedGalleries.size === displayedGalleries.length && (
                            <CheckIcon className="h-3 w-3" />
                          )}
                        </button>
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                      Gallery
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                      Client
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                      Services
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                      Photos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted">
                      Status
                    </th>
                    <th className="hidden px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground-muted md:table-cell">
                      Add-ons
                    </th>
                    <th className="hidden px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground-muted lg:table-cell">
                      Views
                    </th>
                    <th className="hidden px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-foreground-muted lg:table-cell">
                      Downloads
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                      Revenue
                    </th>
                    {!isSelectMode && (
                      <th className="w-16 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-foreground-muted">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody
                  style={{
                    position: "relative",
                    height: rowVirtualizer.getTotalSize(),
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const gallery = displayedGalleries[virtualRow.index];
                    if (!gallery) return null;

                    return (
                      <tr
                        key={gallery.id}
                        data-index={virtualRow.index}
                        ref={rowVirtualizer.measureElement}
                        onClick={() => isSelectMode && toggleGallerySelection(gallery.id)}
                        className={cn(
                          "absolute left-0 right-0 w-full transition-colors",
                          "table table-fixed",
                          isSelectMode && "cursor-pointer",
                          isSelectMode && selectedGalleries.has(gallery.id) && "bg-[var(--primary)]/5",
                          "border-b border-[var(--card-border)] hover:bg-[var(--background-hover)]"
                        )}
                        style={{ transform: `translateY(${virtualRow.start}px)` }}
                      >
                        {isSelectMode && (
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => toggleGallerySelection(gallery.id, e)}
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                                selectedGalleries.has(gallery.id)
                                  ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                                  : "border-[var(--card-border)] hover:border-[var(--primary)]"
                              )}
                            >
                              {selectedGalleries.has(gallery.id) && <CheckIcon className="h-3 w-3" />}
                            </button>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <Link
                            href={`/galleries/${gallery.id}`}
                            className="flex items-center gap-3"
                            onClick={(e) => isSelectMode && e.preventDefault()}
                          >
                            {gallery.thumbnailUrl && (
                              <img
                                src={gallery.thumbnailUrl}
                                alt={`${gallery.name} thumbnail`}
                                className="h-10 w-14 rounded-md object-cover"
                              />
                            )}
                            <span className="text-sm font-medium text-foreground hover:text-[var(--primary)]">
                              {gallery.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground-secondary">{gallery.client}</td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          {gallery.services && gallery.services.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {gallery.services.slice(0, 2).map((service) => (
                                <span
                                  key={service.id}
                                  className={cn(
                                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                                    service.isPrimary
                                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                                      : "bg-[var(--background-secondary)] text-foreground-muted"
                                  )}
                                >
                                  {service.name}
                                </span>
                              ))}
                              {gallery.services.length > 2 && (
                                <span className="inline-flex items-center text-xs text-foreground-muted">
                                  +{gallery.services.length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-foreground-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground-secondary">{gallery.photos}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                              gallery.status === "delivered" && "bg-[var(--success)]/10 text-[var(--success)]",
                              gallery.status === "pending" && "bg-[var(--warning)]/10 text-[var(--warning)]",
                              gallery.status === "draft" && "bg-[var(--foreground-muted)]/10 text-foreground-muted",
                              gallery.status === "archived" && "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                            )}
                          >
                            {gallery.status.charAt(0).toUpperCase() + gallery.status.slice(1)}
                          </span>
                        </td>
                        <td className="hidden px-4 py-3 text-center md:table-cell">
                          {gallery.pendingAddonRequests && gallery.pendingAddonRequests > 0 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs font-medium text-[var(--warning)]">
                              {gallery.pendingAddonRequests}
                            </span>
                          ) : (
                            <span className="text-sm text-foreground-muted">—</span>
                          )}
                        </td>
                        <td className="hidden px-4 py-3 text-center lg:table-cell">
                          <div className="flex items-center justify-center gap-1 text-sm text-foreground-secondary">
                            <EyeIcon className="h-3.5 w-3.5 text-foreground-muted" />
                            {gallery.views ?? 0}
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-center lg:table-cell">
                          <div className="flex items-center justify-center gap-1 text-sm text-foreground-secondary">
                            <DownloadIcon className="h-3.5 w-3.5 text-foreground-muted" />
                            {gallery.downloads ?? 0}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                          {gallery.revenue || "—"}
                        </td>
                        {!isSelectMode && (
                          <td className="px-4 py-3 text-right">
                            <div
                              className="relative"
                              ref={actionMenuOpen === gallery.id ? actionMenuRef : undefined}
                            >
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActionMenuOpen(actionMenuOpen === gallery.id ? null : gallery.id);
                                }}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background)] hover:text-foreground"
                              >
                                <MoreIcon className="h-4 w-4" />
                              </button>
                              {actionMenuOpen === gallery.id && (
                                <div className="absolute right-0 top-10 z-10 w-44 rounded-lg border border-[var(--card-border)] bg-[var(--card)] py-1 shadow-xl">
                                  <button
                                    onClick={(e) => handleListAction("share", gallery.id, e)}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-foreground hover:bg-[var(--background-hover)]"
                                  >
                                    <ShareIcon className="h-4 w-4 text-foreground-muted" />
                                    Share Link
                                  </button>
                                  <button
                                    onClick={(e) => handleListAction("duplicate", gallery.id, e)}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-foreground hover:bg-[var(--background-hover)]"
                                  >
                                    <DuplicateIcon className="h-4 w-4 text-foreground-muted" />
                                    Duplicate
                                  </button>
                                  <button
                                    onClick={(e) => handleListAction("archive", gallery.id, e)}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-foreground hover:bg-[var(--background-hover)]"
                                  >
                                    <ArchiveIcon className="h-4 w-4 text-foreground-muted" />
                                    Archive
                                  </button>
                                  <hr className="my-1 border-[var(--card-border)]" />
                                  <button
                                    onClick={(e) => handleListAction("delete", gallery.id, e)}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--error)] hover:bg-[var(--error)]/10"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <GalleryPlaceholderIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            {search ? "No galleries found" : "No galleries yet"}
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            {search
              ? `No galleries match "${search}"`
              : filter === "all"
              ? "Create your first gallery to get started."
              : `No ${filter} galleries found.`}
          </p>
          {!search && (
            <Link
              href="/galleries/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Gallery
            </Link>
          )}
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Delete Gallery</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              Are you sure you want to delete &ldquo;{galleries.find((g) => g.id === showDeleteConfirm)?.name}&rdquo;? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isLoading}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isLoading}
                className="rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : "Delete Gallery"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Delete {selectedGalleries.size} Galleries</h3>
            <p className="mt-2 text-sm text-foreground-muted">
              Are you sure you want to delete {selectedGalleries.size} gallery{selectedGalleries.size !== 1 ? "ies" : "y"}? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                disabled={isLoading}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteConfirm}
                disabled={isLoading}
                className="rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
              >
                {isLoading ? "Deleting..." : `Delete ${selectedGalleries.size} Galleries`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
