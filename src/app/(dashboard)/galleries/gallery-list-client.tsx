"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GalleryCard, type QuickAction } from "@/components/dashboard/gallery-card";
import { useToast } from "@/components/ui/toast";
import { duplicateGallery, archiveGallery, deleteGallery, bulkArchiveGalleries, bulkDeleteGalleries } from "@/lib/actions/galleries";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
}

interface GalleryListClientProps {
  galleries: Gallery[];
  filter: "all" | "delivered" | "pending" | "draft";
}

type SortOption = "newest" | "oldest" | "name-asc" | "name-desc" | "revenue-high" | "revenue-low";
type ViewMode = "grid" | "list";

export function GalleryListClient({ galleries, filter }: GalleryListClientProps) {
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
  const actionMenuRef = useRef<HTMLDivElement>(null);

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
        } catch (error) {
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
        } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
          g.name.toLowerCase().includes(searchLower) ||
          g.client.toLowerCase().includes(searchLower)
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
  }, [galleries, filter, search, sortBy]);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "revenue-high", label: "Revenue (High)" },
    { value: "revenue-low", label: "Revenue (Low)" },
  ];

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
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
        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-3 pr-10 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center justify-center rounded-md p-2 transition-colors",
                viewMode === "grid"
                  ? "bg-[var(--primary)] text-white"
                  : "text-foreground-muted hover:text-foreground"
              )}
              title="Grid view"
            >
              <GridIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center justify-center rounded-md p-2 transition-colors",
                viewMode === "list"
                  ? "bg-[var(--primary)] text-white"
                  : "text-foreground-muted hover:text-foreground"
              )}
              title="List view"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Select Mode Toggle */}
          {displayedGalleries.length > 0 && (
            <button
              onClick={toggleSelectMode}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
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
              <span className="hidden xs:inline">Share</span>
            </button>
            <button
              onClick={handleBulkExport}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ExportIcon className="h-4 w-4" />
              <span className="hidden xs:inline">Export</span>
            </button>
            <button
              onClick={handleBulkArchive}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArchiveIcon className="h-4 w-4" />
              <span className="hidden xs:inline">Archive</span>
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-1.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20"
            >
              <TrashIcon className="h-4 w-4" />
              <span className="hidden xs:inline">Delete</span>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedGalleries.map((gallery) => (
              <div key={gallery.id} className="relative">
                {isSelectMode && (
                  <button
                    onClick={(e) => toggleGallerySelection(gallery.id, e)}
                    className={cn(
                      "absolute top-3 left-3 z-10 flex h-6 w-6 items-center justify-center rounded border transition-colors",
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
                    onQuickAction={isSelectMode ? undefined : handleQuickAction}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--card-border)]">
                  {isSelectMode && (
                    <th className="px-4 py-3 w-10">
                      <button
                        onClick={selectedGalleries.size === displayedGalleries.length ? deselectAllGalleries : selectAllGalleries}
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                          selectedGalleries.size === displayedGalleries.length
                            ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                            : "border-[var(--card-border)] hover:border-[var(--primary)]"
                        )}
                      >
                        {selectedGalleries.size === displayedGalleries.length && <CheckIcon className="h-3 w-3" />}
                      </button>
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Gallery
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Photos
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-foreground-muted uppercase tracking-wider hidden lg:table-cell">
                    Views
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-foreground-muted uppercase tracking-wider hidden lg:table-cell">
                    Downloads
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider">
                    Revenue
                  </th>
                  {!isSelectMode && (
                    <th className="px-4 py-3 text-right text-xs font-medium text-foreground-muted uppercase tracking-wider w-16">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {displayedGalleries.map((gallery) => (
                  <tr
                    key={gallery.id}
                    onClick={() => isSelectMode && toggleGallerySelection(gallery.id)}
                    className={cn(
                      "hover:bg-[var(--background-hover)] transition-colors",
                      isSelectMode && "cursor-pointer",
                      isSelectMode && selectedGalleries.has(gallery.id) && "bg-[var(--primary)]/5"
                    )}
                  >
                    {isSelectMode && (
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => toggleGallerySelection(gallery.id, e)}
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded border transition-colors",
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
                            alt=""
                            className="h-10 w-14 rounded-md object-cover"
                          />
                        )}
                        <span className="text-sm font-medium text-foreground hover:text-[var(--primary)]">
                          {gallery.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {gallery.client}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground-secondary">
                      {gallery.photos}
                    </td>
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
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1 text-sm text-foreground-secondary">
                        <EyeIcon className="h-3.5 w-3.5 text-foreground-muted" />
                        {gallery.views ?? 0}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
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
                        <div className="relative" ref={actionMenuOpen === gallery.id ? actionMenuRef : undefined}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActionMenuOpen(actionMenuOpen === gallery.id ? null : gallery.id);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted hover:bg-[var(--background)] hover:text-foreground transition-colors"
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
                ))}
              </tbody>
            </table>
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

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function GalleryPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
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

function MoreIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M13 4.5a2.5 2.5 0 1 1 .702 1.737L6.97 9.604a2.518 2.518 0 0 1 0 .792l6.733 3.367a2.5 2.5 0 1 1-.671 1.341l-6.733-3.367a2.5 2.5 0 1 1 0-3.474l6.733-3.367A2.52 2.52 0 0 1 13 4.5Z" />
    </svg>
  );
}

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
      <path fillRule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5ZM7 11a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" clipRule="evenodd" />
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

function CheckboxIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h9.5A2.25 2.25 0 0 1 17 4.25v11.5A2.25 2.25 0 0 1 14.75 18h-9.5A2.25 2.25 0 0 1 3 15.75V4.25Zm2.25-.75a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h9.5a.75.75 0 0 0 .75-.75V4.25a.75.75 0 0 0-.75-.75h-9.5Z" clipRule="evenodd" />
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

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}
