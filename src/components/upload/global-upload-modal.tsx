"use client";

import { useRef, useCallback } from "react";
import { X, Upload, Pause, Play, RotateCcw, CheckCircle2, AlertCircle, Loader2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUpload } from "@/contexts/upload-context";
import type { UploadTask, UploadStatus } from "@/lib/storage/upload-queue";

export function GlobalUploadModal() {
  const {
    activeUpload,
    isModalOpen,
    isMinimized,
    addFiles,
    pauseUpload,
    resumeUpload,
    cancelTask,
    retryTask,
    clearCompleted,
    openModal,
    closeModal,
    minimizeModal,
  } = useUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    await addFiles(fileArray);
  }, [addFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleClose = () => {
    if (activeUpload && (activeUpload.stats.uploading > 0 || activeUpload.stats.pending > 0)) {
      // Minimize when uploads are active
      minimizeModal();
    } else {
      closeModal();
    }
  };

  // Don't render if no active upload or modal is closed
  if (!activeUpload || !isModalOpen) return null;

  const { tasks, stats, overallProgress, isPaused, galleryName } = activeUpload;

  // Minimized indicator
  if (isMinimized) {
    return (
      <button
        onClick={openModal}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-lg hover:bg-[var(--background-hover)] transition-colors"
      >
        <div className="relative">
          <Upload className="h-5 w-5 text-[var(--primary)]" />
          {stats.uploading > 0 && (
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-[var(--primary)] rounded-full animate-pulse" />
          )}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-foreground">
            {stats.completed}/{stats.total} uploaded
          </p>
          <p className="text-xs text-foreground-muted">
            {stats.uploading > 0 ? `${overallProgress}% complete` : isPaused ? "Paused" : "Complete"}
          </p>
        </div>
        <div className="w-12 h-1.5 bg-[var(--background)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </button>
    );
  }

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
                {galleryName && <span className="text-foreground">{galleryName}</span>}
                {galleryName && " • "}
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
          <div className="flex items-center gap-1">
            {(stats.uploading > 0 || stats.pending > 0) && (
              <button
                onClick={minimizeModal}
                className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
                title="Minimize"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
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
                  onRetry={retryTask}
                  onCancel={cancelTask}
                />
              ))}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFileSelect(e.target.files);
                e.target.value = ""; // Reset to allow re-selecting same files
              }
            }}
          />
        </div>

        {/* Add More Files Button (when files exist) */}
        {tasks.length > 0 && (
          <div className="px-6 py-3 border-t border-[var(--card-border)]">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
            >
              + Add more files
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--card-border)] bg-[var(--background)]">
          <div className="flex items-center gap-2">
            {stats.completed > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={clearCompleted}
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
                onClick={isPaused ? resumeUpload : pauseUpload}
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
