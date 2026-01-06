"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { getServiceImageUploadUrl } from "@/lib/actions/service-images";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  entityType: "addon" | "bundle" | "service";
  entityId?: string;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  entityType,
  entityId,
  className,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Get presigned URL
        const result = await getServiceImageUploadUrl({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          entityType,
          entityId,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to get upload URL");
        }

        const { uploadUrl, publicUrl } = result.data;

        // Upload to R2 using the presigned URL
        const xhr = new XMLHttpRequest();

        await new Promise<void>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              setUploadProgress(Math.round((event.loaded / event.total) * 100));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Upload failed"));
          });

          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });

        // Set the public URL
        onChange(publicUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        setError(message);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [entityType, entityId, onChange]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file);
      }
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [handleUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        handleUpload(file);
      }
    },
    [handleUpload, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = useCallback(() => {
    onChange("");
    setError(null);
  }, [onChange]);

  const handleUrlInput = useCallback(
    (url: string) => {
      setError(null);
      onChange(url);
    },
    [onChange]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Preview / Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative rounded-lg border-2 border-dashed transition-all",
          isDragging
            ? "border-[var(--primary)] bg-[var(--primary)]/5"
            : "border-[var(--card-border)]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {value ? (
          /* Image Preview */
          <div className="relative aspect-video">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
              onError={() => setError("Failed to load image")}
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--error)]/90 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Upload Area */
          <div className="flex flex-col items-center justify-center py-8 px-4">
            {isUploading ? (
              /* Upload Progress */
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
                <div className="text-sm text-foreground-muted">
                  Uploading... {uploadProgress}%
                </div>
                <div className="w-48 h-1.5 rounded-full bg-[var(--background-hover)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary)] transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              /* Upload Prompt */
              <>
                <ImageIcon className="h-10 w-10 text-foreground-muted mb-3" />
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled}
                    className="text-sm font-medium text-[var(--primary)] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Click to upload
                  </button>
                  <span className="text-sm text-foreground-muted">
                    {" "}or drag and drop
                  </span>
                </div>
                <p className="mt-1 text-xs text-foreground-muted">
                  PNG, JPG, GIF, or WEBP (max. 50MB)
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
          aria-label="Upload image file"
          className="hidden"
        />
      </div>

      {/* URL Input Alternative */}
      <div className="flex items-center gap-2">
        <label htmlFor="image-url-input" className="text-xs text-foreground-muted">or enter URL:</label>
        <input
          id="image-url-input"
          type="url"
          value={value || ""}
          onChange={(e) => handleUrlInput(e.target.value)}
          disabled={disabled || isUploading}
          placeholder="https://example.com/image.jpg"
          className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] disabled:opacity-50"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}
