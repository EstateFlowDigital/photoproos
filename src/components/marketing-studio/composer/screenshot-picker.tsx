"use client";

/**
 * Screenshot Picker Component
 *
 * Provides a library of pre-made dashboard screenshots plus
 * upload functionality for the Marketing Studio composer.
 */

import { useState, useRef, useEffect } from "react";
import { X, Upload, Image as ImageIcon, Monitor, Check } from "lucide-react";
import { toast } from "sonner";

// Pre-made screenshot definitions
export const DASHBOARD_SCREENSHOTS = [
  {
    id: "dashboard-overview",
    name: "Dashboard Overview",
    description: "Main dashboard with metrics and activity",
    src: "/dashboard-screenshots/dashboard-overview.svg",
    category: "overview",
  },
  {
    id: "gallery-list",
    name: "Gallery List",
    description: "Gallery management view with cards",
    src: "/dashboard-screenshots/gallery-list.svg",
    category: "galleries",
  },
  {
    id: "gallery-detail",
    name: "Gallery Detail",
    description: "Individual gallery with photo grid",
    src: "/dashboard-screenshots/gallery-detail.svg",
    category: "galleries",
  },
  {
    id: "invoices-list",
    name: "Invoices",
    description: "Invoice management and tracking",
    src: "/dashboard-screenshots/invoices-list.svg",
    category: "billing",
  },
  {
    id: "clients-list",
    name: "Clients",
    description: "Client management with cards",
    src: "/dashboard-screenshots/clients-list.svg",
    category: "clients",
  },
  {
    id: "booking-calendar",
    name: "Calendar",
    description: "Booking and scheduling calendar",
    src: "/dashboard-screenshots/booking-calendar.svg",
    category: "scheduling",
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Business metrics and charts",
    src: "/dashboard-screenshots/analytics.svg",
    category: "analytics",
  },
  {
    id: "client-portal",
    name: "Client Portal",
    description: "Client-facing gallery view",
    src: "/dashboard-screenshots/client-portal.svg",
    category: "client-facing",
  },
  {
    id: "workflows",
    name: "Workflows",
    description: "Automation and workflow builder",
    src: "/dashboard-screenshots/workflows.svg",
    category: "automation",
  },
  {
    id: "settings",
    name: "Settings",
    description: "Account and profile settings",
    src: "/dashboard-screenshots/settings.svg",
    category: "settings",
  },
] as const;

export type DashboardScreenshot = (typeof DASHBOARD_SCREENSHOTS)[number];

export interface ScreenshotPickerProps {
  onSelect: (src: string) => void;
  onClose: () => void;
  selectedSrc?: string;
}

export function ScreenshotPicker({
  onSelect,
  onClose,
  selectedSrc,
}: ScreenshotPickerProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const filteredScreenshots = DASHBOARD_SCREENSHOTS.filter(
    (screenshot) =>
      screenshot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      screenshot.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, or WebP)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    // Convert to base64 for preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImage(result);
      setIsUploading(false);
      // Clear file input to allow re-uploading same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      toast.error("Failed to read the file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectUploadedImage = () => {
    if (uploadedImage) {
      onSelect(uploadedImage);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // Validate file size
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setUploadedImage(result);
      };
      reader.onerror = () => {
        toast.error("Failed to read the file. Please try again.");
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast.error("Please upload an image file (PNG, JPG, or WebP)");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  return (
    <div
      role="presentation"
      className="screenshot-picker-overlay fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="screenshot-picker-title"
        className="screenshot-picker-modal bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-[900px] max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="screenshot-picker-header flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--primary)] bg-opacity-10 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="screenshot-picker-title"
                className="text-lg font-semibold text-[var(--foreground)]"
              >
                Dashboard Screenshots
              </h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                Select or upload a screenshot for your social post
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close screenshot picker"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--background-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            <X className="w-5 h-5 text-[var(--foreground-muted)]" aria-hidden="true" />
          </button>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Screenshot source options"
          className="screenshot-picker-tabs flex gap-1 p-2 border-b border-[var(--border)]"
        >
          <button
            role="tab"
            id="library-tab"
            aria-selected={activeTab === "library"}
            aria-controls="library-panel"
            onClick={() => setActiveTab("library")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
              activeTab === "library"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ImageIcon className="w-4 h-4" aria-hidden="true" />
              Screenshot Library
            </div>
          </button>
          <button
            role="tab"
            id="upload-tab"
            aria-selected={activeTab === "upload"}
            aria-controls="upload-panel"
            onClick={() => setActiveTab("upload")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
              activeTab === "upload"
                ? "bg-[var(--primary)] text-white"
                : "text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" aria-hidden="true" />
              Upload Custom
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="screenshot-picker-content flex-1 overflow-y-auto p-4">
          {activeTab === "library" ? (
            <div
              id="library-panel"
              role="tabpanel"
              aria-labelledby="library-tab"
              className="space-y-4"
            >
              {/* Search */}
              <input
                type="text"
                placeholder="Search screenshots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search screenshots"
                className="w-full px-4 py-2 bg-[var(--background-elevated)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              />

              {/* Screenshot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredScreenshots.map((screenshot) => (
                  <button
                    key={screenshot.id}
                    onClick={() => onSelect(screenshot.src)}
                    aria-label={`Select ${screenshot.name}: ${screenshot.description}`}
                    aria-pressed={selectedSrc === screenshot.src}
                    className={`screenshot-item group relative bg-[var(--background-elevated)] rounded-lg overflow-hidden border-2 transition-all hover:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 ${
                      selectedSrc === screenshot.src
                        ? "border-[var(--primary)] ring-2 ring-[var(--primary)] ring-opacity-30"
                        : "border-transparent"
                    }`}
                  >
                    <div className="aspect-[4/3] relative">
                      <img
                        src={screenshot.src}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {selectedSrc === screenshot.src && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" aria-hidden="true" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">
                        {screenshot.name}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)] truncate">
                        {screenshot.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {filteredScreenshots.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 mx-auto text-[var(--foreground-muted)] opacity-50 mb-4" aria-hidden="true" />
                  <p className="text-[var(--foreground-muted)]">
                    No screenshots match your search
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div
              id="upload-panel"
              role="tabpanel"
              aria-labelledby="upload-tab"
              className="space-y-4"
            >
              {/* Upload Area */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload screenshot - drag and drop or click to browse"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                  isDraggingOver
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : isUploading
                    ? "border-[var(--primary)] bg-[var(--primary)] bg-opacity-5"
                    : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--background-hover)]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  aria-hidden="true"
                />
                <Upload className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-4" aria-hidden="true" />
                <p className="text-[var(--foreground)] font-medium mb-2">
                  {isUploading
                    ? "Uploading..."
                    : isDraggingOver
                    ? "Drop your screenshot here"
                    : "Drop your screenshot here or click to browse"}
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Supports PNG, JPG, WebP up to 10MB
                </p>
              </div>

              {/* Uploaded Image Preview */}
              {uploadedImage && (
                <div className="space-y-4">
                  <div className="relative bg-[var(--background-elevated)] rounded-lg overflow-hidden">
                    <img
                      src={uploadedImage}
                      alt="Uploaded screenshot preview"
                      className="w-full max-h-[200px] md:max-h-[300px] object-contain"
                    />
                  </div>
                  <button
                    onClick={handleSelectUploadedImage}
                    className="w-full py-3 bg-[var(--primary)] text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                  >
                    Use This Screenshot
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="screenshot-picker-footer flex justify-end gap-3 p-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
