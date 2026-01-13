"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { FieldBooking } from "@/lib/actions/field-operations";

interface UploadClientProps {
  todaysBookings: FieldBooking[];
  galleries: { id: string; name: string; photoCount: number }[];
}

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
}

export function UploadClient({ todaysBookings, galleries }: UploadClientProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    todaysBookings[0]?.id || null
  );
  const [selectedGalleryId, setSelectedGalleryId] = useState<string | null>(
    galleries[0]?.id || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<"booking" | "gallery">("booking");

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      showToast("Please select image files", "error");
      return;
    }

    const newFiles: FileWithPreview[] = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    // Reset input so same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [showToast]);

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const simulateUpload = async (fileId: string): Promise<boolean> => {
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, progress: i, status: "uploading" } : f
        )
      );
    }

    // Simulate success/failure (95% success rate)
    const success = Math.random() > 0.05;
    setFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, status: success ? "success" : "error", progress: 100 }
          : f
      )
    );
    return success;
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) {
      showToast("No files to upload", "error");
      return;
    }

    if (uploadMode === "booking" && !selectedBookingId) {
      showToast("Please select a booking", "error");
      return;
    }

    if (uploadMode === "gallery" && !selectedGalleryId) {
      showToast("Please select a gallery", "error");
      return;
    }

    setIsUploading(true);

    let successCount = 0;
    let failCount = 0;

    for (const file of pendingFiles) {
      const success = await simulateUpload(file.id);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    setIsUploading(false);

    if (failCount === 0) {
      showToast(`${successCount} photos uploaded successfully`, "success");
    } else {
      showToast(`${successCount} uploaded, ${failCount} failed`, "error");
    }
  };

  const clearCompleted = () => {
    setFiles((prev) => {
      prev.filter((f) => f.status === "success").forEach((f) => {
        URL.revokeObjectURL(f.preview);
      });
      return prev.filter((f) => f.status !== "success");
    });
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const successCount = files.filter((f) => f.status === "success").length;
  const errorCount = files.filter((f) => f.status === "error").length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-background/95 backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/field">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-foreground">Quick Upload</h1>
          </div>
          {successCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCompleted}>
              Clear completed
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {/* Upload Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setUploadMode("booking")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              uploadMode === "booking"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] text-foreground-muted border border-[var(--card-border)]"
            }`}
          >
            To Booking
          </button>
          <button
            onClick={() => setUploadMode("gallery")}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              uploadMode === "gallery"
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] text-foreground-muted border border-[var(--card-border)]"
            }`}
          >
            To Gallery
          </button>
        </div>

        {/* Destination Selector */}
        {uploadMode === "booking" ? (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Select Booking
            </label>
            {todaysBookings.length === 0 ? (
              <p className="text-sm text-foreground-muted">No bookings today</p>
            ) : (
              <div className="space-y-2">
                {todaysBookings.map((booking) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedBookingId(booking.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedBookingId === booking.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{booking.clientName}</p>
                    <p className="text-xs text-foreground-muted truncate">{booking.address}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <label className="text-sm font-medium text-foreground mb-3 block">
              Select Gallery
            </label>
            {galleries.length === 0 ? (
              <p className="text-sm text-foreground-muted">No galleries available</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {galleries.map((gallery) => (
                  <button
                    key={gallery.id}
                    onClick={() => setSelectedGalleryId(gallery.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedGalleryId === gallery.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                    }`}
                  >
                    <p className="text-sm font-medium text-foreground">{gallery.name}</p>
                    <p className="text-xs text-foreground-muted">{gallery.photoCount} photos</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* File Drop Zone */}
        <div
          className="rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center cursor-pointer hover:border-[var(--primary)] transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            capture="environment"
          />
          <div className="flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 mb-4">
              <Camera className="h-8 w-8 text-[var(--primary)]" />
            </div>
            <p className="text-sm font-medium text-foreground">Tap to select photos</p>
            <p className="text-xs text-foreground-muted mt-1">or use camera to capture</p>
          </div>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                Selected Photos ({files.length})
              </h3>
              <div className="flex items-center gap-2 text-xs">
                {pendingCount > 0 && (
                  <span className="text-foreground-muted">{pendingCount} pending</span>
                )}
                {successCount > 0 && (
                  <span className="text-[var(--success)]">{successCount} uploaded</span>
                )}
                {errorCount > 0 && (
                  <span className="text-[var(--error)]">{errorCount} failed</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {files.map((file) => (
                <div key={file.id} className="relative aspect-square rounded-lg overflow-hidden bg-[var(--background-tertiary)]">
                  <Image
                    src={file.preview}
                    alt={file.file.name}
                    fill
                    className="object-cover"
                  />

                  {/* Status Overlay */}
                  {file.status !== "pending" && (
                    <div className={`absolute inset-0 flex items-center justify-center ${
                      file.status === "uploading" ? "bg-black/50" :
                      file.status === "success" ? "bg-[var(--success)]/30" :
                      "bg-[var(--error)]/30"
                    }`}>
                      {file.status === "uploading" && (
                        <div className="text-center">
                          <Loader2 className="h-6 w-6 text-white animate-spin mx-auto" />
                          <span className="text-xs text-white mt-1 block">{file.progress}%</span>
                        </div>
                      )}
                      {file.status === "success" && (
                        <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
                      )}
                      {file.status === "error" && (
                        <AlertCircle className="h-8 w-8 text-[var(--error)]" />
                      )}
                    </div>
                  )}

                  {/* Remove Button */}
                  {file.status === "pending" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
            <FolderOpen className="h-8 w-8 text-foreground-muted mx-auto" />
            <p className="mt-2 text-sm text-foreground-muted">
              No photos selected yet
            </p>
          </div>
        )}
      </main>

      {/* Upload Button */}
      {files.length > 0 && pendingCount > 0 && (
        <div className="sticky bottom-0 border-t border-[var(--card-border)] bg-background p-4">
          <Button
            onClick={handleUpload}
            disabled={isUploading || pendingCount === 0}
            className="w-full py-6 text-base"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload {pendingCount} Photo{pendingCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
