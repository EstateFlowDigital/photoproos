"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (files: File[]) => void;
  galleryId: string;
  galleryName: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export function PhotoUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
  galleryId,
  galleryName,
}: PhotoUploadModalProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setIsDragging(false);
      setIsUploading(false);
      dragCounterRef.current = 0;
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isUploading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isUploading, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `"${file.name}" is not a supported image format`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" exceeds the 50MB size limit`;
    }
    return null;
  };

  const createUploadFile = (file: File): UploadFile => {
    const error = validateFile(file);
    return {
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: error ? "" : URL.createObjectURL(file),
      progress: 0,
      status: error ? "error" : "pending",
      error: error || undefined,
    };
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const uploadFiles = fileArray.map(createUploadFile);
    setFiles((prev) => [...prev, ...uploadFiles]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [addFiles]
  );

  const handleUpload = async () => {
    const validFiles = files.filter((f) => f.status === "pending");
    if (validFiles.length === 0) return;

    setIsUploading(true);

    // Simulate upload with progress for demo
    // In production, this would use presigned URLs to R2
    for (const uploadFile of validFiles) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading" as const } : f
        )
      );

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, progress } : f
          )
        );
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "complete" as const, progress: 100 } : f
        )
      );
    }

    setIsUploading(false);

    // Call completion handler with successful files
    const successfulFiles = files
      .filter((f) => f.status === "pending" || f.status === "complete")
      .map((f) => f.file);

    onUploadComplete(successfulFiles);
    onClose();
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const errorCount = files.filter((f) => f.status === "error").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const completeCount = files.filter((f) => f.status === "complete").length;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={!isUploading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
          <div>
            <h2 id="upload-modal-title" className="text-lg font-semibold text-foreground">
              Upload Photos
            </h2>
            <p className="text-sm text-foreground-muted">
              Add photos to "{galleryName}"
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-50"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 180px)" }}>
          {/* Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
              isDragging
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--primary)]/50 hover:bg-[var(--background-hover)]"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl transition-colors",
              isDragging ? "bg-[var(--primary)]/10" : "bg-[var(--background-hover)]"
            )}>
              <UploadIcon className={cn(
                "h-7 w-7 transition-colors",
                isDragging ? "text-[var(--primary)]" : "text-foreground-muted"
              )} />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              {isDragging ? "Drop photos here" : "Drag and drop photos here"}
            </p>
            <p className="mt-1 text-xs text-foreground-muted">
              or click to browse
            </p>
            <p className="mt-3 text-xs text-foreground-muted">
              JPG, PNG, GIF, WEBP, HEIC • Max 50MB per file
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {files.length} {files.length === 1 ? "file" : "files"} selected
                </p>
                {pendingCount > 0 && !isUploading && (
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs text-foreground-muted hover:text-foreground"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {files.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg border p-3",
                      uploadFile.status === "error"
                        ? "border-[var(--error)]/30 bg-[var(--error)]/5"
                        : uploadFile.status === "complete"
                        ? "border-[var(--success)]/30 bg-[var(--success)]/5"
                        : "border-[var(--card-border)] bg-[var(--background)]"
                    )}
                  >
                    {/* Preview */}
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--background-hover)]">
                      {uploadFile.preview ? (
                        <img
                          src={uploadFile.preview}
                          alt={uploadFile.file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-foreground-muted" />
                        </div>
                      )}
                      {uploadFile.status === "complete" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[var(--success)]/60">
                          <CheckIcon className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {uploadFile.file.name}
                      </p>
                      {uploadFile.status === "error" ? (
                        <p className="truncate text-xs text-[var(--error)]">
                          {uploadFile.error}
                        </p>
                      ) : uploadFile.status === "uploading" ? (
                        <div className="mt-1">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--background-hover)]">
                            <div
                              className="h-full rounded-full bg-[var(--primary)] transition-all duration-150"
                              style={{ width: `${uploadFile.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : uploadFile.status === "complete" ? (
                        <p className="text-xs text-[var(--success)]">Uploaded</p>
                      ) : (
                        <p className="text-xs text-foreground-muted">
                          {formatFileSize(uploadFile.file.size)}
                        </p>
                      )}
                    </div>

                    {/* Remove Button */}
                    {(uploadFile.status === "pending" || uploadFile.status === "error") && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(uploadFile.id);
                        }}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
                      >
                        <CloseIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--card-border)] px-6 py-4">
          <div className="text-sm text-foreground-muted">
            {isUploading ? (
              <span>
                Uploading {uploadingCount + completeCount} of {pendingCount + uploadingCount + completeCount}...
              </span>
            ) : errorCount > 0 ? (
              <span className="text-[var(--error)]">{errorCount} file(s) have errors</span>
            ) : pendingCount > 0 ? (
              <span>{pendingCount} file(s) ready to upload</span>
            ) : (
              <span>Select photos to upload</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isUploading}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={pendingCount === 0 || isUploading}
              className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <LoadingSpinner className="h-4 w-4" />
                  Uploading...
                </span>
              ) : (
                `Upload ${pendingCount > 0 ? pendingCount : ""} Photo${pendingCount !== 1 ? "s" : ""}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon Components
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
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

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
