"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { createMediaAsset } from "@/lib/actions/cms-media";
import {
  formatFileSize,
  isSupportedType,
  getAssetType,
  MAX_FILE_SIZE,
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_VIDEO_TYPES,
  SUPPORTED_AUDIO_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
} from "@/lib/cms/media-constants";
import type { MediaAsset, MediaAssetType } from "@prisma/client";
import {
  Upload,
  X,
  CheckCircle,
  XCircle,
  Loader2,
  Image,
  Video,
  Music,
  FileText,
  File,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface UploadFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  asset?: MediaAsset;
}

interface MediaUploaderProps {
  className?: string;
  folderId?: string | null;
  acceptTypes?: MediaAssetType[];
  maxFiles?: number;
  maxFileSize?: number;
  onUploadComplete?: (assets: MediaAsset[]) => void;
  onUploadError?: (error: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MediaUploader - Drag and drop file uploader
 */
export function MediaUploader({
  className,
  folderId,
  acceptTypes,
  maxFiles = 20,
  maxFileSize = MAX_FILE_SIZE,
  onUploadComplete,
  onUploadError,
}: MediaUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build accept string for file input
  const acceptString = acceptTypes
    ? acceptTypes
        .map((type) => {
          switch (type) {
            case "image":
              return SUPPORTED_IMAGE_TYPES.join(",");
            case "video":
              return SUPPORTED_VIDEO_TYPES.join(",");
            case "audio":
              return SUPPORTED_AUDIO_TYPES.join(",");
            case "document":
              return SUPPORTED_DOCUMENT_TYPES.join(",");
            default:
              return "";
          }
        })
        .filter(Boolean)
        .join(",")
    : undefined;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file size
      if (file.size > maxFileSize) {
        return `File too large (max ${formatFileSize(maxFileSize)})`;
      }

      // Check file type
      if (!isSupportedType(file.type)) {
        return "Unsupported file type";
      }

      // Check accepted types
      if (acceptTypes) {
        const fileType = getAssetType(file.type);
        if (!acceptTypes.includes(fileType)) {
          return `Only ${acceptTypes.join(", ")} files allowed`;
        }
      }

      return null;
    },
    [acceptTypes, maxFileSize]
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      // Check max files
      if (files.length + fileArray.length > maxFiles) {
        onUploadError?.(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const uploadFiles: UploadFile[] = fileArray.map((file) => {
        const error = validateFile(file);
        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          status: error ? "error" : "pending",
          progress: 0,
          error: error || undefined,
        };
      });

      setFiles((prev) => [...prev, ...uploadFiles]);
    },
    [files.length, maxFiles, validateFile, onUploadError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (e.dataTransfer.files) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        addFiles(e.target.files);
      }
      // Reset input
      e.target.value = "";
    },
    [addFiles]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setFiles((prev) => prev.filter((f) => f.status !== "success" && f.status !== "error"));
  }, []);

  // ============================================================================
  // UPLOAD LOGIC
  // ============================================================================

  const uploadFile = async (uploadFile: UploadFile): Promise<MediaAsset | null> => {
    const { file } = uploadFile;

    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading" as const, progress: 10 } : f
        )
      );

      // Create FormData and upload to API endpoint
      const formData = new FormData();
      formData.append("file", file);
      if (folderId) {
        formData.append("folderId", folderId);
      }

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id && f.status === "uploading"
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      // Upload to API
      const response = await fetch("/api/cms/media/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const data = await response.json();

      // Create asset in database
      const result = await createMediaAsset({
        filename: data.filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: data.url,
        storageKey: data.storageKey,
        provider: data.provider || "local",
        width: data.width,
        height: data.height,
        aspectRatio: data.aspectRatio,
        thumbnailUrl: data.thumbnailUrl,
        folderId: folderId || undefined,
      });

      if (!result.ok || !result.data) {
        throw new Error(result.message || "Failed to save asset");
      }

      // Update file status
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "success" as const, progress: 100, asset: result.data }
            : f
        )
      );

      return result.data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "error" as const, error: errorMessage }
            : f
        )
      );

      return null;
    }
  };

  const startUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    const uploadedAssets: MediaAsset[] = [];

    // Upload files sequentially (could be parallelized)
    for (const file of pendingFiles) {
      const asset = await uploadFile(file);
      if (asset) {
        uploadedAssets.push(asset);
      }
    }

    setIsUploading(false);

    if (uploadedAssets.length > 0) {
      onUploadComplete?.(uploadedAssets);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          isDragOver
            ? "border-[var(--primary)] bg-[var(--primary)]/5"
            : "border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload
          className={cn(
            "w-12 h-12 mx-auto mb-4",
            isDragOver ? "text-[var(--primary)]" : "text-[var(--foreground-muted)]"
          )}
        />

        <p className="text-lg font-medium mb-1">
          {isDragOver ? "Drop files here" : "Drag and drop files"}
        </p>
        <p className="text-sm text-[var(--foreground-secondary)] mb-4">
          or click to browse
        </p>

        <div className="flex items-center justify-center gap-4 text-xs text-[var(--foreground-muted)]">
          <span>Max {formatFileSize(maxFileSize)} per file</span>
          <span>•</span>
          <span>Up to {maxFiles} files</span>
        </div>

        {acceptTypes && (
          <div className="flex items-center justify-center gap-2 mt-3">
            {acceptTypes.map((type) => (
              <span
                key={type}
                className="px-2 py-1 text-xs rounded-full bg-[var(--background-tertiary)] capitalize"
              >
                {type}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span>{files.length} files</span>
              {successCount > 0 && (
                <span className="text-green-500">{successCount} uploaded</span>
              )}
              {errorCount > 0 && (
                <span className="text-red-500">{errorCount} failed</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(successCount > 0 || errorCount > 0) && (
                <button
                  onClick={clearCompleted}
                  className="px-3 py-1 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  Clear completed
                </button>
              )}
              {pendingCount > 0 && (
                <button
                  onClick={startUpload}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload {pendingCount} files
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* File items */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {files.map((uploadFile) => (
              <UploadFileItem
                key={uploadFile.id}
                uploadFile={uploadFile}
                onRemove={() => removeFile(uploadFile.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// UPLOAD FILE ITEM
// ============================================================================

interface UploadFileItemProps {
  uploadFile: UploadFile;
  onRemove: () => void;
}

function UploadFileItem({ uploadFile, onRemove }: UploadFileItemProps) {
  const { file, status, progress, error } = uploadFile;

  const Icon =
    file.type.startsWith("image/")
      ? Image
      : file.type.startsWith("video/")
        ? Video
        : file.type.startsWith("audio/")
          ? Music
          : file.type.includes("pdf") ||
              file.type.includes("document") ||
              file.type.includes("word")
            ? FileText
            : File;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
        status === "error"
          ? "border-red-500/20 bg-red-500/5"
          : status === "success"
            ? "border-green-500/20 bg-green-500/5"
            : "border-[var(--border)]"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded flex items-center justify-center shrink-0",
          status === "error"
            ? "bg-red-500/10 text-red-500"
            : status === "success"
              ? "bg-green-500/10 text-green-500"
              : "bg-[var(--background-tertiary)] text-[var(--foreground-muted)]"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
          <span>{formatFileSize(file.size)}</span>
          {error && <span className="text-red-500">{error}</span>}
        </div>
      </div>

      {/* Progress / Status */}
      <div className="shrink-0">
        {status === "uploading" && (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-[var(--foreground-muted)]">{progress}%</span>
          </div>
        )}
        {status === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
        {status === "error" && <XCircle className="w-5 h-5 text-red-500" />}
        {status === "pending" && (
          <button
            onClick={onRemove}
            className="p-1 text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded hover:bg-[var(--background-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPACT UPLOADER
// ============================================================================

interface MediaUploadButtonProps {
  className?: string;
  folderId?: string | null;
  acceptTypes?: MediaAssetType[];
  onUploadComplete?: (assets: MediaAsset[]) => void;
  children?: React.ReactNode;
}

/**
 * MediaUploadButton - Compact upload button that triggers file dialog
 */
export function MediaUploadButton({
  className,
  folderId,
  acceptTypes,
  onUploadComplete,
  children,
}: MediaUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const acceptString = acceptTypes
    ? acceptTypes
        .map((type) => {
          switch (type) {
            case "image":
              return SUPPORTED_IMAGE_TYPES.join(",");
            case "video":
              return SUPPORTED_VIDEO_TYPES.join(",");
            case "audio":
              return SUPPORTED_AUDIO_TYPES.join(",");
            case "document":
              return SUPPORTED_DOCUMENT_TYPES.join(",");
            default:
              return "";
          }
        })
        .filter(Boolean)
        .join(",")
    : undefined;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedAssets: MediaAsset[] = [];

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (folderId) {
          formData.append("folderId", folderId);
        }

        const response = await fetch("/api/cms/media/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const result = await createMediaAsset({
            filename: data.filename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: data.url,
            storageKey: data.storageKey,
            provider: data.provider || "local",
            width: data.width,
            height: data.height,
            thumbnailUrl: data.thumbnailUrl,
            folderId: folderId || undefined,
          });

          if (result.ok && result.data) {
            uploadedAssets.push(result.data);
          }
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    setIsUploading(false);
    e.target.value = "";

    if (uploadedAssets.length > 0) {
      onUploadComplete?.(uploadedAssets);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptString}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          "flex items-center gap-2",
          isUploading && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {isUploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : children ? (
          children
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload
          </>
        )}
      </button>
    </>
  );
}
