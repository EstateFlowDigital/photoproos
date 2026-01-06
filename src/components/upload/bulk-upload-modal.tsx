"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Upload, Pause, Play, RotateCcw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UploadQueue, type UploadTask, type UploadStatus } from "@/lib/storage/upload-queue";
import { getUploadPresignedUrls, createAssets } from "@/lib/actions/uploads";
import { useToast } from "@/components/ui/toast";

interface BulkUploadModalProps {
  galleryId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (uploadedFiles: Array<{ id: string; url: string; filename: string }>) => void;
}

export function BulkUploadModal({
  galleryId,
  isOpen,
  onClose,
  onUploadComplete,
}: BulkUploadModalProps) {
  const { showToast } = useToast();
  const [queue, setQueue] = useState<UploadQueue | null>(null);
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    uploading: 0,
    pending: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completedAssetsRef = useRef<Array<{ id: string; url: string; filename: string }>>([]);

  // Use refs for callbacks to prevent effect re-runs
  const onUploadCompleteRef = useRef(onUploadComplete);
  const showToastRef = useRef(showToast);

  // Keep refs up to date
  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete;
    showToastRef.current = showToast;
  }, [onUploadComplete, showToast]);

  // Initialize queue - only recreate when isOpen or galleryId changes
  useEffect(() => {
    if (!isOpen) return;

    // Reset completed assets on open
    completedAssetsRef.current = [];

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
          const result = await createAssets(galleryId, [{
            key: task.key,
            filename: task.file.name,
            mimeType: task.file.type,
            sizeBytes: task.file.size,
          }]);

          // Track completed asset for callback
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
      onAllComplete: () => {
        const completedCount = completedAssetsRef.current.length;
        showToastRef.current?.(`Successfully uploaded ${completedCount} ${completedCount === 1 ? 'photo' : 'photos'}`, "success");
        onUploadCompleteRef.current?.(completedAssetsRef.current);
      },
    });

    setQueue(uploadQueue);

    // Check for incomplete uploads from previous session
    const savedState = UploadQueue.loadFromLocalStorage();
    if (savedState && savedState.queue.length > 0) {
      const incompleteTasks = savedState.queue.filter(
        (t) => t.status !== "completed"
      );
      if (incompleteTasks.length > 0) {
        showToastRef.current?.(
          `Found ${incompleteTasks.length} incomplete ${incompleteTasks.length === 1 ? 'upload' : 'uploads'}. Click Resume to continue.`,
          "info"
        );
      }
    }

    return () => {
      uploadQueue.pause();
    };
  }, [isOpen, galleryId]);

  // Handle file selection
  const handleFileSelect = async (files: FileList) => {
    if (!queue) return;

    const fileArray = Array.from(files);

    // Get presigned URLs for all files
    try {
      const result = await getUploadPresignedUrls(
        galleryId,
        fileArray.map((f) => ({
          filename: f.name,
          contentType: f.type,
          size: f.size,
        }))
      );

      if (!result.success || !result.data) {
        showToast(result.error || "Failed to prepare uploads", "error");
        return;
      }

      // Add files to queue
      const filesToUpload = result.data.files.map((urlData, index) => ({
        file: fileArray[index],
        uploadUrl: urlData.uploadUrl,
        publicUrl: urlData.publicUrl,
        key: urlData.key,
      }));

      // addFiles triggers onProgress which handles adding to state
      queue.addFiles(filesToUpload);
      showToast(`Added ${fileArray.length} ${fileArray.length === 1 ? 'file' : 'files'} to upload queue`, "success");
    } catch (error) {
      console.error("Failed to prepare uploads:", error);
      showToast("Failed to prepare uploads", "error");
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files);
      }
    },
    [handleFileSelect]
  );

  const handlePauseResume = () => {
    if (!queue) return;

    if (isPaused) {
      queue.resume();
      setIsPaused(false);
      showToast("Uploads resumed", "info");
    } else {
      queue.pause();
      setIsPaused(true);
      showToast("Uploads paused", "info");
    }
  };

  const handleRetry = (taskId: string) => {
    if (!queue) return;
    queue.retry(taskId);
  };

  const handleCancel = (taskId: string) => {
    if (!queue) return;
    queue.cancel(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => t.status !== "completed"));
  };

  const handleClose = () => {
    if (stats.uploading > 0 || stats.pending > 0) {
      if (!confirm("Uploads are still in progress. Are you sure you want to close?")) {
        return;
      }
      queue?.pause();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-[var(--card)] rounded-xl border border-[var(--card-border)] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)]">
          <div className="flex items-center gap-3">
            <Upload className="h-5 w-5 text-[var(--primary)]" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Upload Photos
              </h2>
              <p className="text-sm text-foreground-muted">
                {stats.total > 0 ? (
                  <>
                    {stats.completed} / {stats.total} completed
                    {stats.failed > 0 && ` • ${stats.failed} failed`}
                  </>
                ) : (
                  "Select files to upload"
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div className="px-6 py-4 border-b border-[var(--card-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Overall Progress
              </span>
              <span className="text-sm text-foreground-muted">
                {overallProgress}%
              </span>
            </div>
            <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-foreground-muted">
              <span>{stats.uploading} uploading</span>
              <span>{stats.pending} pending</span>
              <span>{stats.completed} completed</span>
            </div>
          </div>
        )}

        {/* File List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tasks.length === 0 ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-[var(--card-border)] rounded-xl cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--background-hover)] transition-colors"
            >
              <Upload className="h-12 w-12 text-foreground-muted mb-4" />
              <p className="text-sm font-medium text-foreground mb-1">
                Click to select files or drag and drop
              </p>
              <p className="text-xs text-foreground-muted">
                PNG, JPG, GIF up to 50MB each
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <UploadTaskCard
                  key={task.id}
                  task={task}
                  onRetry={handleRetry}
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            aria-label="Select photos for bulk upload"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFileSelect(e.target.files);
              }
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--card-border)] bg-[var(--background)]">
          <div className="flex items-center gap-2">
            {stats.completed > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearCompleted}
              >
                Clear Completed
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {tasks.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePauseResume}
                disabled={stats.uploading === 0 && stats.pending === 0}
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause All
                  </>
                )}
              </Button>
            )}
            <Button variant="secondary" onClick={handleClose}>
              {stats.uploading > 0 || stats.pending > 0 ? "Minimize" : "Close"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadTaskCard({
  task,
  onRetry,
  onCancel,
}: {
  task: UploadTask;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const statusConfig: Record<UploadStatus, { icon: React.ReactNode; color: string }> = {
    pending: {
      icon: <Loader2 className="h-4 w-4 text-foreground-muted" />,
      color: "text-foreground-muted",
    },
    uploading: {
      icon: <Loader2 className="h-4 w-4 text-[var(--primary)] animate-spin" />,
      color: "text-[var(--primary)]",
    },
    completed: {
      icon: <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />,
      color: "text-[var(--success)]",
    },
    failed: {
      icon: <AlertCircle className="h-4 w-4 text-[var(--error)]" />,
      color: "text-[var(--error)]",
    },
    paused: {
      icon: <Pause className="h-4 w-4 text-foreground-muted" />,
      color: "text-foreground-muted",
    },
  };

  const config = statusConfig[task.status];
  const fileSizeMB = (task.file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--card-border)]">
      <div className="shrink-0">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {task.file.name}
        </p>
        <p className="text-xs text-foreground-muted">
          {fileSizeMB} MB
          {task.error && ` • ${task.error}`}
        </p>
        {task.status === "uploading" && (
          <div className="mt-2 h-1 bg-[var(--card-border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-150"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {task.status === "failed" && (
          <button
            onClick={() => onRetry(task.id)}
            className="p-1.5 rounded-lg text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
            title="Retry upload"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
        {task.status !== "completed" && (
          <button
            onClick={() => onCancel(task.id)}
            className="p-1.5 rounded-lg text-foreground-muted hover:bg-[var(--background-hover)] hover:text-[var(--error)] transition-colors"
            title="Cancel upload"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {task.status === "uploading" && (
          <span className={cn("text-xs font-medium tabular-nums", config.color)}>
            {task.progress}%
          </span>
        )}
      </div>
    </div>
  );
}
