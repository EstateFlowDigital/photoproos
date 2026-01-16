"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Download,
  Loader2,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Check,
  FileArchive,
} from "lucide-react";
import { PLATFORMS, type PlatformId, type PostFormat } from "@/lib/marketing-studio/platforms";
import html2canvas from "html2canvas";
import JSZip from "jszip";

// Custom icons for platforms not in lucide
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.95s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.52.77 1.52 1.68 0 1.02-.65 2.55-.99 3.97-.28 1.19.6 2.16 1.78 2.16 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5-4.88-3.41 0-5.41 2.55-5.41 5.2 0 1.02.39 2.13.89 2.73a.35.35 0 0 1 .08.34l-.33 1.35c-.05.22-.18.27-.41.16-1.53-.72-2.49-2.96-2.49-4.77 0-3.88 2.82-7.45 8.14-7.45 4.28 0 7.6 3.05 7.6 7.12 0 4.25-2.68 7.67-6.4 7.67-1.25 0-2.42-.65-2.82-1.42l-.77 2.93c-.28 1.07-1.03 2.42-1.54 3.24A12 12 0 1 0 12 0z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
};

interface ExportFormat {
  platformId: PlatformId;
  format: PostFormat;
  width: number;
  height: number;
  label: string;
}

// Build list of all export formats
const ALL_EXPORT_FORMATS: ExportFormat[] = Object.entries(PLATFORMS).flatMap(
  ([platformId, platform]) =>
    platform.formats.map((format) => ({
      platformId: platformId as PlatformId,
      format: format as PostFormat,
      width: platform.dimensions[format]?.width ?? 1080,
      height: platform.dimensions[format]?.height ?? 1080,
      label: `${platform.name} ${format.charAt(0).toUpperCase() + format.slice(1)}`,
    }))
);

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLDivElement>;
  compositionName?: string;
}

export function BatchExportModal({
  isOpen,
  onClose,
  canvasRef,
  compositionName = "social-post",
}: BatchExportModalProps) {
  const [selectedFormats, setSelectedFormats] = React.useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentFormat, setCurrentFormat] = React.useState<string | null>(null);

  // Reset selection when modal opens
  React.useEffect(() => {
    if (isOpen) {
      // Pre-select some common formats
      setSelectedFormats(new Set([
        "instagram-feed",
        "instagram-story",
        "linkedin-post",
        "twitter-tweet",
      ]));
      setProgress(0);
      setCurrentFormat(null);
    }
  }, [isOpen]);

  const toggleFormat = (formatKey: string) => {
    setSelectedFormats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(formatKey)) {
        newSet.delete(formatKey);
      } else {
        newSet.add(formatKey);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedFormats(new Set(ALL_EXPORT_FORMATS.map((f) => `${f.platformId}-${f.format}`)));
  };

  const selectNone = () => {
    setSelectedFormats(new Set());
  };

  const handleExport = async () => {
    if (!canvasRef.current || selectedFormats.size === 0) return;

    setIsExporting(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      const selectedList = ALL_EXPORT_FORMATS.filter((f) =>
        selectedFormats.has(`${f.platformId}-${f.format}`)
      );

      for (let i = 0; i < selectedList.length; i++) {
        const format = selectedList[i];
        setCurrentFormat(format.label);
        setProgress(Math.round(((i + 0.5) / selectedList.length) * 100));

        // Create a canvas at the target size
        const canvas = await html2canvas(canvasRef.current, {
          scale: 2, // 2x for high-res
          backgroundColor: null, // Preserve background
          useCORS: true,
          logging: false,
          allowTaint: true,
          width: canvasRef.current.offsetWidth,
          height: canvasRef.current.offsetHeight,
        });

        // Create a new canvas at the target dimensions
        const targetCanvas = document.createElement("canvas");
        targetCanvas.width = format.width;
        targetCanvas.height = format.height;
        const ctx = targetCanvas.getContext("2d");

        if (ctx) {
          // Fill with transparent background
          ctx.clearRect(0, 0, format.width, format.height);

          // Calculate scaling to cover the target area (similar to object-fit: cover)
          const sourceAspect = canvas.width / canvas.height;
          const targetAspect = format.width / format.height;

          let sx = 0,
            sy = 0,
            sw = canvas.width,
            sh = canvas.height;

          if (sourceAspect > targetAspect) {
            // Source is wider - crop sides
            sw = canvas.height * targetAspect;
            sx = (canvas.width - sw) / 2;
          } else {
            // Source is taller - crop top/bottom
            sh = canvas.width / targetAspect;
            sy = (canvas.height - sh) / 2;
          }

          ctx.drawImage(canvas, sx, sy, sw, sh, 0, 0, format.width, format.height);
        }

        // Convert to blob
        const blob = await new Promise<Blob | null>((resolve) => {
          targetCanvas.toBlob(resolve, "image/png", 1);
        });

        if (blob) {
          const filename = `${compositionName}-${format.platformId}-${format.format}-${format.width}x${format.height}.png`;
          zip.file(filename, blob);
        }

        setProgress(Math.round(((i + 1) / selectedList.length) * 100));
      }

      // Generate and download ZIP
      setCurrentFormat("Creating ZIP...");
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${compositionName}-batch-export.zip`;
      link.click();
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error("Batch export failed:", error);
    } finally {
      setIsExporting(false);
      setCurrentFormat(null);
    }
  };

  if (!isOpen) return null;

  // Group formats by platform
  const formatsByPlatform = Object.entries(PLATFORMS).map(([platformId, platform]) => ({
    platformId: platformId as PlatformId,
    name: platform.name,
    color: platform.color,
    formats: ALL_EXPORT_FORMATS.filter((f) => f.platformId === platformId),
  }));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-export-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileArchive className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            <h2 id="batch-export-title" className="text-base font-semibold text-[var(--foreground)]">
              Batch Export
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Quick actions */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-[var(--foreground-muted)]">
              Select formats to export ({selectedFormats.size} selected)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-xs text-[var(--primary)] hover:underline focus:outline-none"
              >
                Select All
              </button>
              <span className="text-xs text-[var(--foreground-muted)]">|</span>
              <button
                onClick={selectNone}
                className="text-xs text-[var(--primary)] hover:underline focus:outline-none"
              >
                Select None
              </button>
            </div>
          </div>

          {/* Format list by platform */}
          <div className="space-y-4">
            {formatsByPlatform.map((platform) => {
              const Icon = PLATFORM_ICONS[platform.platformId] || Instagram;
              const allSelected = platform.formats.every((f) =>
                selectedFormats.has(`${f.platformId}-${f.format}`)
              );
              const someSelected = platform.formats.some((f) =>
                selectedFormats.has(`${f.platformId}-${f.format}`)
              );

              return (
                <div key={platform.platformId} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      className="h-4 w-4"
                      style={{ color: platform.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {platform.name}
                    </span>
                    <button
                      onClick={() => {
                        const keys = platform.formats.map(
                          (f) => `${f.platformId}-${f.format}`
                        );
                        if (allSelected) {
                          setSelectedFormats((prev) => {
                            const newSet = new Set(prev);
                            keys.forEach((k) => newSet.delete(k));
                            return newSet;
                          });
                        } else {
                          setSelectedFormats((prev) => {
                            const newSet = new Set(prev);
                            keys.forEach((k) => newSet.add(k));
                            return newSet;
                          });
                        }
                      }}
                      className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] ml-auto"
                    >
                      {allSelected ? "Deselect all" : someSelected ? "Select all" : "Select all"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {platform.formats.map((format) => {
                      const key = `${format.platformId}-${format.format}`;
                      const isSelected = selectedFormats.has(key);
                      return (
                        <button
                          key={key}
                          onClick={() => toggleFormat(key)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                            isSelected
                              ? "border-[var(--primary)] bg-[var(--primary)]/10"
                              : "border-[var(--border)] hover:bg-[var(--background-hover)]"
                          )}
                        >
                          <div
                            className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors",
                              isSelected
                                ? "bg-[var(--primary)] border-[var(--primary)]"
                                : "border-[var(--border)]"
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-white" aria-hidden="true" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-[var(--foreground)] capitalize">
                              {format.format}
                            </div>
                            <div className="text-[10px] text-[var(--foreground-muted)]">
                              {format.width} × {format.height}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress bar (when exporting) */}
        {isExporting && (
          <div className="px-4 pb-2">
            <div className="relative h-2 bg-[var(--background-hover)] rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-[var(--primary)] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-[var(--foreground-muted)] mt-1 text-center">
              {currentFormat || "Preparing..."}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--card-border)] flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || selectedFormats.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export {selectedFormats.size} Format{selectedFormats.size !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
