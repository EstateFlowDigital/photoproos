"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import { cn } from "@/lib/utils";
import {
  getMediaFolders,
  getMediaAssets,
  deleteMediaAsset,
  deleteMediaAssets,
  moveMediaAssets,
  toggleMediaFavorite,
  getMediaStatistics,
} from "@/lib/actions/cms-media";
import { formatFileSize } from "@/lib/cms/media-constants";
import type { MediaAsset, MediaFolder, MediaAssetType } from "@prisma/client";
import {
  Search,
  Grid,
  List,
  Folder,
  ChevronRight,
  Image,
  Video,
  Music,
  FileText,
  File,
  Star,
  Trash2,
  Check,
  RefreshCw,
  Home,
  ExternalLink,
  HardDrive,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = "grid" | "list";
type SortBy = "createdAt" | "name" | "size" | "usageCount";

interface MediaLibraryProps {
  className?: string;
  selectable?: boolean;
  multiple?: boolean;
  acceptTypes?: MediaAssetType[];
  onSelect?: (assets: MediaAsset[]) => void;
  initialFolderId?: string | null;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MediaLibrary - Full media library browser
 */
export function MediaLibrary({
  className,
  selectable = false,
  multiple = true,
  acceptTypes,
  onSelect,
  initialFolderId,
}: MediaLibraryProps) {
  const [isPending, startTransition] = useTransition();

  // State
  const [folders, setFolders] = useState<(MediaFolder & { assetCount: number })[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [totalAssets, setTotalAssets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId || null);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([]);

  // View options
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MediaAssetType | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  // Selection
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());

  // Statistics
  const [stats, setStats] = useState<{
    totalAssets: number;
    totalSize: number;
    byType: Record<string, number>;
  } | null>(null);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadFolders = useCallback(async () => {
    const result = await getMediaFolders();
    if (result.ok && result.data) {
      setFolders(result.data as (MediaFolder & { assetCount: number })[]);
    }
  }, []);

  const loadAssets = useCallback(async () => {
    setIsLoading(true);
    const result = await getMediaAssets({
      folderId: currentFolderId,
      query: searchQuery || undefined,
      type: typeFilter || acceptTypes?.[0] || undefined,
      isFavorite: showFavorites || undefined,
      sortBy,
      sortOrder,
      limit: 100,
    });

    if (result.ok && result.data) {
      setAssets(result.data.assets);
      setTotalAssets(result.data.total);
    }
    setIsLoading(false);
  }, [currentFolderId, searchQuery, typeFilter, acceptTypes, showFavorites, sortBy, sortOrder]);

  const loadStats = useCallback(async () => {
    const result = await getMediaStatistics();
    if (result.ok && result.data) {
      setStats(result.data);
    }
  }, []);

  useEffect(() => {
    loadFolders();
    loadStats();
  }, [loadFolders, loadStats]);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Update folder path when navigating
  useEffect(() => {
    if (!currentFolderId) {
      setFolderPath([]);
      return;
    }

    // Find path to current folder
    const findPath = (
      folderId: string,
      allFolders: MediaFolder[],
      path: { id: string; name: string }[] = []
    ): { id: string; name: string }[] | null => {
      for (const folder of allFolders) {
        if (folder.id === folderId) {
          return [...path, { id: folder.id, name: folder.name }];
        }
      }
      return null;
    };

    const path = findPath(currentFolderId, folders);
    if (path) {
      setFolderPath(path);
    }
  }, [currentFolderId, folders]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleSelectAsset = (assetId: string) => {
    if (!selectable) return;

    const newSelected = new Set(selectedAssets);
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId);
    } else {
      if (!multiple) {
        newSelected.clear();
      }
      newSelected.add(assetId);
    }
    setSelectedAssets(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedAssets.size === assets.length) {
      setSelectedAssets(new Set());
    } else {
      setSelectedAssets(new Set(assets.map((a) => a.id)));
    }
  };

  const handleConfirmSelection = () => {
    if (onSelect) {
      const selected = assets.filter((a) => selectedAssets.has(a.id));
      onSelect(selected);
    }
  };

  const handleToggleFavorite = async (assetId: string) => {
    startTransition(async () => {
      await toggleMediaFavorite(assetId);
      loadAssets();
    });
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;

    startTransition(async () => {
      await deleteMediaAsset(assetId);
      selectedAssets.delete(assetId);
      setSelectedAssets(new Set(selectedAssets));
      loadAssets();
      loadStats();
    });
  };

  const handleBulkDelete = async () => {
    if (selectedAssets.size === 0) return;
    if (!confirm(`Delete ${selectedAssets.size} selected assets?`)) return;

    startTransition(async () => {
      await deleteMediaAssets(Array.from(selectedAssets));
      setSelectedAssets(new Set());
      loadAssets();
      loadStats();
    });
  };

  // Move assets handler - for future folder move UI
  const _handleMoveAssets = async (targetFolderId: string | null) => {
    if (selectedAssets.size === 0) return;

    startTransition(async () => {
      await moveMediaAssets(Array.from(selectedAssets), targetFolderId);
      loadAssets();
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const currentSubfolders = folders.filter((f) => f.parentId === currentFolderId);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Media Library</h2>
          {stats && (
            <div className="flex items-center gap-3 text-sm text-[var(--foreground-secondary)]">
              <span className="flex items-center gap-1">
                <HardDrive className="w-4 h-4" />
                {formatFileSize(stats.totalSize)}
              </span>
              <span>{stats.totalAssets} files</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectable && selectedAssets.size > 0 && (
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Select {selectedAssets.size} {selectedAssets.size === 1 ? "item" : "items"}
            </button>
          )}
          <button
            onClick={() => loadAssets()}
            disabled={isLoading}
            className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background-hover)] transition-colors"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 p-4 border-b border-[var(--border)]">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm">
          <button
            onClick={() => setCurrentFolderId(null)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--background-hover)] transition-colors",
              !currentFolderId && "text-[var(--primary)]"
            )}
          >
            <Home className="w-4 h-4" />
            Root
          </button>
          {folderPath.map((folder, index) => (
            <div key={folder.id} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
              <button
                onClick={() => setCurrentFolderId(folder.id)}
                className={cn(
                  "px-2 py-1 rounded hover:bg-[var(--background-hover)] transition-colors",
                  index === folderPath.length - 1 && "text-[var(--primary)]"
                )}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Type filter */}
        <select
          value={typeFilter || ""}
          onChange={(e) => setTypeFilter((e.target.value as MediaAssetType) || null)}
          className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        >
          <option value="">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="document">Documents</option>
          <option value="archive">Archives</option>
        </select>

        {/* Favorites toggle */}
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          className={cn(
            "p-2 rounded-lg border transition-colors",
            showFavorites
              ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
              : "border-[var(--border)] hover:bg-[var(--background-hover)]"
          )}
          title="Show favorites only"
        >
          <Star className={cn("w-4 h-4", showFavorites && "fill-current")} />
        </button>

        {/* View mode */}
        <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 transition-colors",
              viewMode === "grid"
                ? "bg-[var(--primary)] text-white"
                : "hover:bg-[var(--background-hover)]"
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 transition-colors",
              viewMode === "list"
                ? "bg-[var(--primary)] text-white"
                : "hover:bg-[var(--background-hover)]"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedAssets.size > 0 && (
        <div className="flex items-center gap-4 px-4 py-2 bg-[var(--primary)]/5 border-b border-[var(--border)]">
          <span className="text-sm font-medium">
            {selectedAssets.size} selected
          </span>
          <button
            onClick={handleSelectAll}
            className="text-sm text-[var(--primary)] hover:underline"
          >
            {selectedAssets.size === assets.length ? "Deselect all" : "Select all"}
          </button>
          <div className="flex-1" />
          <button
            onClick={handleBulkDelete}
            disabled={isPending}
            className="flex items-center gap-1 px-3 py-1 text-sm text-red-500 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Subfolders */}
        {currentSubfolders.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[var(--foreground-secondary)] mb-3">
              Folders
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {currentSubfolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="flex flex-col items-center p-4 rounded-lg border border-[var(--border)] hover:bg-[var(--background-hover)] transition-colors"
                >
                  <Folder
                    className="w-10 h-10 mb-2"
                    style={{ color: folder.color || "var(--foreground-secondary)" }}
                  />
                  <span className="text-sm font-medium text-center truncate w-full">
                    {folder.name}
                  </span>
                  <span className="text-xs text-[var(--foreground-muted)]">
                    {folder.assetCount} items
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Assets */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-[var(--foreground-muted)]" />
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--foreground-secondary)]">
            <File className="w-12 h-12 mb-3 text-[var(--foreground-muted)]" />
            <p>No files found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-[var(--primary)] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {assets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                selected={selectedAssets.has(asset.id)}
                selectable={selectable}
                onSelect={() => handleSelectAsset(asset.id)}
                onToggleFavorite={() => handleToggleFavorite(asset.id)}
                onDelete={() => handleDeleteAsset(asset.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {assets.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                selected={selectedAssets.has(asset.id)}
                selectable={selectable}
                onSelect={() => handleSelectAsset(asset.id)}
                onToggleFavorite={() => handleToggleFavorite(asset.id)}
                onDelete={() => handleDeleteAsset(asset.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border)] text-sm text-[var(--foreground-secondary)]">
        <span>
          {assets.length} of {totalAssets} items
        </span>
        <div className="flex items-center gap-2">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-2 py-1 text-sm rounded border border-[var(--border)] bg-[var(--card)]"
          >
            <option value="createdAt">Date</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="usageCount">Usage</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-1 rounded hover:bg-[var(--background-hover)]"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ASSET CARD (GRID VIEW)
// ============================================================================

interface AssetCardProps {
  asset: MediaAsset;
  selected?: boolean;
  selectable?: boolean;
  onSelect?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
}

function AssetCard({
  asset,
  selected,
  selectable,
  onSelect,
  onToggleFavorite,
  onDelete,
}: AssetCardProps) {
  const Icon =
    asset.type === "image"
      ? Image
      : asset.type === "video"
        ? Video
        : asset.type === "audio"
          ? Music
          : asset.type === "document"
            ? FileText
            : File;

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={cn(
        "group relative rounded-lg border overflow-hidden transition-all cursor-pointer",
        selected
          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
          : "border-[var(--border)] hover:border-[var(--border-hover)]"
      )}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-[var(--background-tertiary)] relative">
        {asset.type === "image" && asset.thumbnailUrl ? (
          <img
            src={asset.thumbnailUrl || asset.url}
            alt={asset.alt || asset.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-12 h-12 text-[var(--foreground-muted)]" />
          </div>
        )}

        {/* Selection indicator */}
        {selectable && (
          <div
            className={cn(
              "absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
              selected
                ? "bg-[var(--primary)] border-[var(--primary)]"
                : "bg-white/80 border-[var(--foreground-muted)] opacity-0 group-hover:opacity-100"
            )}
          >
            {selected && <Check className="w-3 h-3 text-white" />}
          </div>
        )}

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className={cn(
            "absolute top-2 right-2 p-1 rounded transition-all",
            asset.isFavorite
              ? "text-yellow-500 bg-yellow-500/10"
              : "text-white/80 opacity-0 group-hover:opacity-100 hover:bg-white/20"
          )}
        >
          <Star className={cn("w-4 h-4", asset.isFavorite && "fill-current")} />
        </button>

        {/* Overlay actions */}
        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-end gap-1">
            <a
              href={asset.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 text-white/80 hover:text-white rounded hover:bg-white/20 transition-colors"
              title="Open"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="p-1.5 text-white/80 hover:text-red-400 rounded hover:bg-white/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-sm font-medium truncate" title={asset.originalName}>
          {asset.title || asset.originalName}
        </p>
        <p className="text-xs text-[var(--foreground-muted)]">
          {formatFileSize(asset.size)}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// ASSET ROW (LIST VIEW)
// ============================================================================

function AssetRow({
  asset,
  selected,
  selectable,
  onSelect,
  onToggleFavorite,
  onDelete,
}: AssetCardProps) {
  const Icon =
    asset.type === "image"
      ? Image
      : asset.type === "video"
        ? Video
        : asset.type === "audio"
          ? Music
          : asset.type === "document"
            ? FileText
            : File;

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg border transition-all",
        selected
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-[var(--border)] hover:bg-[var(--background-hover)]",
        selectable && "cursor-pointer"
      )}
    >
      {/* Selection checkbox */}
      {selectable && (
        <div
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
            selected
              ? "bg-[var(--primary)] border-[var(--primary)]"
              : "border-[var(--foreground-muted)]"
          )}
        >
          {selected && <Check className="w-3 h-3 text-white" />}
        </div>
      )}

      {/* Thumbnail */}
      <div className="w-12 h-12 rounded bg-[var(--background-tertiary)] shrink-0 overflow-hidden">
        {asset.type === "image" && asset.thumbnailUrl ? (
          <img
            src={asset.thumbnailUrl || asset.url}
            alt={asset.alt || asset.filename}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-[var(--foreground-muted)]" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{asset.title || asset.originalName}</p>
        <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
          <span>{formatFileSize(asset.size)}</span>
          <span>{asset.mimeType}</span>
          {asset.width && asset.height && (
            <span>
              {asset.width} × {asset.height}
            </span>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="text-sm text-[var(--foreground-secondary)] shrink-0">
        {new Date(asset.createdAt).toLocaleDateString()}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className={cn(
            "p-1.5 rounded transition-colors",
            asset.isFavorite
              ? "text-yellow-500"
              : "text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Star className={cn("w-4 h-4", asset.isFavorite && "fill-current")} />
        </button>
        <a
          href={asset.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="p-1.5 text-[var(--foreground-muted)] hover:text-red-500 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { AssetCard, AssetRow };
