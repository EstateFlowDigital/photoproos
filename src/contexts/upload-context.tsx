"use client";

import { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { UploadQueue, type UploadTask, type UploadStatus } from "@/lib/storage/upload-queue";
import { getUploadPresignedUrls, createAssets } from "@/lib/actions/uploads";
import { useToast } from "@/components/ui/toast";

// =============================================================================
// Types
// =============================================================================

interface UploadStats {
  total: number;
  completed: number;
  failed: number;
  uploading: number;
  pending: number;
}

interface ActiveUpload {
  galleryId: string;
  galleryName?: string;
  tasks: UploadTask[];
  stats: UploadStats;
  overallProgress: number;
  isPaused: boolean;
}

interface UploadContextValue {
  // State
  activeUpload: ActiveUpload | null;
  isModalOpen: boolean;
  isMinimized: boolean;

  // Actions
  startUpload: (galleryId: string, galleryName?: string) => void;
  addFiles: (files: File[]) => Promise<void>;
  pauseUpload: () => void;
  resumeUpload: () => void;
  cancelTask: (taskId: string) => void;
  retryTask: (taskId: string) => void;
  clearCompleted: () => void;
  openModal: () => void;
  closeModal: () => void;
  minimizeModal: () => void;
}

const UploadContext = createContext<UploadContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  // Refs for stable callbacks
  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  // Upload queue - persists across navigation
  const queueRef = useRef<UploadQueue | null>(null);
  const completedAssetsRef = useRef<Array<{ id: string; url: string; filename: string }>>([]);

  // State
  const [galleryId, setGalleryId] = useState<string | null>(null);
  const [galleryName, setGalleryName] = useState<string | undefined>();
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [stats, setStats] = useState<UploadStats>({
    total: 0,
    completed: 0,
    failed: 0,
    uploading: 0,
    pending: 0,
  });
  const [overallProgress, setOverallProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Initialize or get existing queue for a gallery
  const initializeQueue = useCallback((targetGalleryId: string) => {
    // If already have a queue for this gallery, reuse it
    if (queueRef.current && galleryId === targetGalleryId) {
      return queueRef.current;
    }

    // If there's an active upload for a different gallery, don't allow
    if (queueRef.current && galleryId && galleryId !== targetGalleryId) {
      const activeCount = stats.uploading + stats.pending;
      if (activeCount > 0) {
        showToastRef.current?.(
          "Please wait for current uploads to complete before starting new ones",
          "error"
        );
        return null;
      }
    }

    // Reset state for new gallery
    completedAssetsRef.current = [];
    setTasks([]);
    setStats({ total: 0, completed: 0, failed: 0, uploading: 0, pending: 0 });
    setOverallProgress(0);
    setIsPaused(false);

    const uploadQueue = new UploadQueue({
      onProgress: (task) => {
        setTasks((prev) => {
          const index = prev.findIndex((t) => t.id === task.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = task;
            return updated;
          }
          return [...prev, task];
        });

        const state = uploadQueue.getState();
        setOverallProgress(state.overallProgress);
        setStats({
          total: state.total,
          completed: state.completed,
          failed: state.failed,
          uploading: state.uploading,
          pending: state.pending,
        });
      },
      onComplete: async (task) => {
        // Create asset record in database
        try {
          const result = await createAssets(targetGalleryId, [{
            key: task.key,
            filename: task.file.name,
            mimeType: task.file.type,
            sizeBytes: task.file.size,
          }]);

          if (result.success && result.data?.assets?.[0]) {
            completedAssetsRef.current.push({
              id: result.data.assets[0].id,
              url: result.data.assets[0].originalUrl,
              filename: result.data.assets[0].filename,
            });
          }
        } catch (error) {
          console.error("Failed to create asset record:", error);
        }
      },
      onError: (task, error) => {
        console.error(`Upload failed for ${task.file.name}:`, error);
      },
      onAllComplete: async () => {
        const completedCount = completedAssetsRef.current.length;
        showToastRef.current?.(
          `Successfully uploaded ${completedCount} ${completedCount === 1 ? 'photo' : 'photos'}. Generating thumbnails...`,
          "success"
        );

        // Trigger image processing for all completed assets
        const assetIds = completedAssetsRef.current.map((a) => a.id);
        if (assetIds.length > 0) {
          try {
            const response = await fetch("/api/images/process", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ assetIds }),
            });

            if (response.ok) {
              const result = await response.json();
              if (result.processed > 0) {
                showToastRef.current?.(
                  `Thumbnails generated for ${result.processed} ${result.processed === 1 ? 'photo' : 'photos'}`,
                  "success"
                );
              }
            }
          } catch (error) {
            console.error("Failed to process images:", error);
            // Don't show error to user - thumbnails can be generated later
          }
        }
      },
    });

    queueRef.current = uploadQueue;
    return uploadQueue;
  }, [galleryId, stats.uploading, stats.pending]);

  // Start upload for a gallery
  const startUpload = useCallback((targetGalleryId: string, name?: string) => {
    const queue = initializeQueue(targetGalleryId);
    if (queue) {
      setGalleryId(targetGalleryId);
      setGalleryName(name);
      setIsModalOpen(true);
      setIsMinimized(false);
    }
  }, [initializeQueue]);

  // Add files to upload
  const addFiles = useCallback(async (files: File[]) => {
    if (!queueRef.current || !galleryId) {
      showToastRef.current?.("No active upload session", "error");
      return;
    }

    try {
      const result = await getUploadPresignedUrls(
        galleryId,
        files.map((f) => ({
          filename: f.name,
          contentType: f.type,
          size: f.size,
        }))
      );

      if (!result.success || !result.data) {
        showToastRef.current?.(result.error || "Failed to prepare uploads", "error");
        return;
      }

      const filesToUpload = result.data.files.map((urlData, index) => ({
        file: files[index],
        uploadUrl: urlData.uploadUrl,
        publicUrl: urlData.publicUrl,
        key: urlData.key,
      }));

      queueRef.current.addFiles(filesToUpload);
      showToastRef.current?.(
        `Added ${files.length} ${files.length === 1 ? 'file' : 'files'} to upload queue`,
        "success"
      );
    } catch (error) {
      console.error("Failed to prepare uploads:", error);
      showToastRef.current?.("Failed to prepare uploads", "error");
    }
  }, [galleryId]);

  // Pause/Resume
  const pauseUpload = useCallback(() => {
    queueRef.current?.pause();
    setIsPaused(true);
    showToastRef.current?.("Uploads paused", "info");
  }, []);

  const resumeUpload = useCallback(() => {
    queueRef.current?.resume();
    setIsPaused(false);
    showToastRef.current?.("Uploads resumed", "info");
  }, []);

  // Task management
  const cancelTask = useCallback((taskId: string) => {
    queueRef.current?.cancel(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const retryTask = useCallback((taskId: string) => {
    queueRef.current?.retry(taskId);
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.status !== "completed"));
  }, []);

  // Modal controls
  const openModal = useCallback(() => {
    setIsModalOpen(true);
    setIsMinimized(false);
  }, []);

  const closeModal = useCallback(() => {
    const activeCount = stats.uploading + stats.pending;
    if (activeCount > 0) {
      // Minimize instead of close when uploads are active
      setIsMinimized(true);
    } else {
      setIsModalOpen(false);
      setIsMinimized(false);
    }
  }, [stats.uploading, stats.pending]);

  const minimizeModal = useCallback(() => {
    setIsMinimized(true);
  }, []);

  // Build active upload object
  const activeUpload: ActiveUpload | null = galleryId ? {
    galleryId,
    galleryName,
    tasks,
    stats,
    overallProgress,
    isPaused,
  } : null;

  return (
    <UploadContext.Provider
      value={{
        activeUpload,
        isModalOpen,
        isMinimized,
        startUpload,
        addFiles,
        pauseUpload,
        resumeUpload,
        cancelTask,
        retryTask,
        clearCompleted,
        openModal,
        closeModal,
        minimizeModal,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

// =============================================================================
// Hook
// =============================================================================

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
}
