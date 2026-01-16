"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { MediaLibrary } from "./media-library";
import { MediaUploader } from "./media-uploader";
import type { MediaAsset, MediaAssetType } from "@prisma/client";
import { X, Upload, FolderOpen, Image, Check } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (assets: MediaAsset[]) => void;
  multiple?: boolean;
  acceptTypes?: MediaAssetType[];
  title?: string;
}

type Tab = "browse" | "upload";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MediaPicker - Modal for selecting/uploading media assets
 */
export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  acceptTypes,
  title = "Select Media",
}: MediaPickerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);

  const handleSelect = useCallback(
    (assets: MediaAsset[]) => {
      setSelectedAssets(assets);
    },
    []
  );

  const handleUploadComplete = useCallback(
    (assets: MediaAsset[]) => {
      // Auto-select newly uploaded assets
      setSelectedAssets((prev) => (multiple ? [...prev, ...assets] : assets));
      // Switch to browse tab to see uploaded files
      setActiveTab("browse");
    },
    [multiple]
  );

  const handleConfirm = useCallback(() => {
    onSelect(selectedAssets);
    onClose();
    setSelectedAssets([]);
  }, [selectedAssets, onSelect, onClose]);

  const handleClose = useCallback(() => {
    onClose();
    setSelectedAssets([]);
    setActiveTab("browse");
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl h-[80vh] max-h-[800px] bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">{title}</h2>

            {/* Tabs */}
            <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveTab("browse")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                  activeTab === "browse"
                    ? "bg-[var(--primary)] text-white"
                    : "hover:bg-[var(--background-hover)]"
                )}
              >
                <FolderOpen className="w-4 h-4" />
                Browse
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                  activeTab === "upload"
                    ? "bg-[var(--primary)] text-white"
                    : "hover:bg-[var(--background-hover)]"
                )}
              >
                <Upload className="w-4 h-4" />
                Upload
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedAssets.length > 0 && (
              <button
                onClick={handleConfirm}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Check className="w-4 h-4" />
                Select {selectedAssets.length} {selectedAssets.length === 1 ? "item" : "items"}
              </button>
            )}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "browse" ? (
            <MediaLibrary
              className="h-full"
              selectable
              multiple={multiple}
              acceptTypes={acceptTypes}
              onSelect={handleSelect}
            />
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              <MediaUploader
                acceptTypes={acceptTypes}
                onUploadComplete={handleUploadComplete}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FIELD WRAPPER
// ============================================================================

interface MediaFieldProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  acceptTypes?: MediaAssetType[];
  label?: string;
  placeholder?: string;
  className?: string;
}

/**
 * MediaField - Input field that opens MediaPicker
 */
export function MediaField({
  value,
  onChange,
  multiple = false,
  acceptTypes = ["image"],
  label,
  placeholder = "Select media...",
  className,
}: MediaFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback(
    (assets: MediaAsset[]) => {
      if (multiple) {
        onChange(assets.map((a) => a.url));
      } else {
        onChange(assets[0]?.url || "");
      }
    },
    [multiple, onChange]
  );

  const handleClear = useCallback(() => {
    onChange(multiple ? [] : "");
  }, [multiple, onChange]);

  const hasValue = multiple
    ? Array.isArray(value) && value.length > 0
    : Boolean(value);

  const displayValue = multiple
    ? Array.isArray(value)
      ? value.length > 0
        ? `${value.length} files selected`
        : placeholder
      : placeholder
    : (value as string) || placeholder;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-[var(--foreground-secondary)]">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {/* Preview (for single image) */}
        {!multiple && hasValue && acceptTypes?.includes("image") && (
          <div className="w-12 h-12 rounded border border-[var(--border)] overflow-hidden shrink-0">
            <img
              src={value as string}
              alt="Selected"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Input */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex-1 flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg border border-[var(--border)] hover:bg-[var(--background-hover)] transition-colors"
        >
          <Image className="w-4 h-4 text-[var(--foreground-muted)]" />
          <span
            className={cn(
              "truncate",
              !hasValue && "text-[var(--foreground-muted)]"
            )}
          >
            {displayValue}
          </span>
        </button>

        {/* Clear button */}
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded hover:bg-[var(--background-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Picker modal */}
      <MediaPicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
        multiple={multiple}
        acceptTypes={acceptTypes}
        title={label ? `Select ${label}` : "Select Media"}
      />
    </div>
  );
}

// ============================================================================
// INLINE PREVIEW
// ============================================================================

interface MediaPreviewProps {
  url?: string;
  urls?: string[];
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

/**
 * MediaPreview - Display selected media with preview
 */
export function MediaPreview({
  url,
  urls,
  size = "md",
  className,
  onClick,
}: MediaPreviewProps) {
  const allUrls = urls || (url ? [url] : []);

  if (allUrls.length === 0) {
    return null;
  }

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  if (allUrls.length === 1) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "rounded border border-[var(--border)] overflow-hidden",
          sizeClasses[size],
          onClick && "cursor-pointer hover:opacity-80 transition-opacity",
          className
        )}
      >
        <img
          src={allUrls[0]}
          alt="Media preview"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Grid for multiple images
  return (
    <div
      onClick={onClick}
      className={cn(
        "grid gap-1",
        allUrls.length <= 4 ? "grid-cols-2" : "grid-cols-3",
        onClick && "cursor-pointer",
        className
      )}
    >
      {allUrls.slice(0, 6).map((imgUrl, index) => (
        <div
          key={index}
          className={cn(
            "rounded border border-[var(--border)] overflow-hidden relative",
            sizeClasses.sm
          )}
        >
          <img
            src={imgUrl}
            alt={`Media preview ${index + 1}`}
            className="w-full h-full object-cover"
          />
          {index === 5 && allUrls.length > 6 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-medium">
              +{allUrls.length - 6}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// USAGE BADGE
// ============================================================================

interface MediaBadgeProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

/**
 * MediaBadge - Compact badge showing media count
 */
export function MediaBadge({ count, onClick, className }: MediaBadgeProps) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[var(--background-tertiary)] hover:bg-[var(--background-hover)] transition-colors",
        className
      )}
    >
      <Image className="w-3 h-3" />
      {count}
    </button>
  );
}
