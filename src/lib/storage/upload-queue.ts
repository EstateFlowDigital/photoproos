/**
 * Upload Queue Manager for Parallel Photo Uploads
 *
 * Manages parallel uploads with:
 * - 5 concurrent upload limit
 * - Per-file progress tracking
 * - Automatic retry on failure
 * - Resume capability via localStorage
 */

export type UploadStatus = "pending" | "uploading" | "completed" | "failed" | "paused";

export interface UploadTask {
  id: string;
  file: File;
  uploadUrl: string;
  publicUrl: string;
  key: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  retryCount?: number;
}

export interface UploadQueueCallbacks {
  onProgress?: (task: UploadTask) => void;
  onComplete?: (task: UploadTask) => void;
  onError?: (task: UploadTask, error: Error) => void;
  onAllComplete?: () => void;
}

export class UploadQueue {
  private queue: UploadTask[] = [];
  private active: Set<string> = new Set();
  private readonly maxConcurrent = 5;
  private readonly maxRetries = 3;
  private paused = false;
  private callbacks: UploadQueueCallbacks = {};
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(callbacks?: UploadQueueCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  /**
   * Add files to the upload queue
   */
  addFiles(files: Array<{
    file: File;
    uploadUrl: string;
    publicUrl: string;
    key: string;
  }>) {
    const tasks: UploadTask[] = files.map((f) => ({
      id: crypto.randomUUID(),
      file: f.file,
      uploadUrl: f.uploadUrl,
      publicUrl: f.publicUrl,
      key: f.key,
      status: "pending" as const,
      progress: 0,
      retryCount: 0,
    }));

    this.queue.push(...tasks);
    this.saveToLocalStorage();

    if (!this.paused) {
      this.processQueue();
    }

    return tasks;
  }

  /**
   * Process the upload queue
   */
  private async processQueue() {
    if (this.paused) return;

    while (this.queue.length > 0 && this.active.size < this.maxConcurrent) {
      const task = this.queue.find((t) => t.status === "pending");
      if (!task) break;

      this.active.add(task.id);
      task.status = "uploading";
      this.callbacks.onProgress?.(task);
      this.saveToLocalStorage();

      this.uploadFile(task);
    }
  }

  /**
   * Upload a single file with progress tracking
   */
  private async uploadFile(task: UploadTask) {
    const abortController = new AbortController();
    this.abortControllers.set(task.id, abortController);

    try {
      // Upload to R2 with progress tracking
      const xhr = new XMLHttpRequest();

      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            task.progress = Math.round((e.loaded / e.total) * 100);
            this.callbacks.onProgress?.(task);
            this.saveToLocalStorage();
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

        xhr.addEventListener("abort", () => {
          reject(new Error("Upload aborted"));
        });

        abortController.signal.addEventListener("abort", () => {
          xhr.abort();
        });

        xhr.open("PUT", task.uploadUrl);
        xhr.setRequestHeader("Content-Type", task.file.type);
        xhr.send(task.file);
      });

      // Mark as completed
      task.status = "completed";
      task.progress = 100;
      this.callbacks.onProgress?.(task);
      this.callbacks.onComplete?.(task);
      this.saveToLocalStorage();

    } catch (error) {
      // Handle failure with retry logic
      const err = error as Error;
      task.retryCount = (task.retryCount || 0) + 1;

      if (task.retryCount < this.maxRetries && !abortController.signal.aborted) {
        // Retry
        task.status = "pending";
        task.progress = 0;
        this.callbacks.onProgress?.(task);
        this.saveToLocalStorage();
      } else {
        // Max retries reached or aborted
        task.status = "failed";
        task.error = err.message;
        this.callbacks.onError?.(task, err);
        this.saveToLocalStorage();
      }
    } finally {
      this.abortControllers.delete(task.id);
      this.active.delete(task.id);

      // Continue processing queue
      if (!this.paused) {
        this.processQueue();
      }

      // Check if all complete
      if (this.active.size === 0 && !this.queue.some((t) => t.status === "pending")) {
        this.callbacks.onAllComplete?.();
      }
    }
  }

  /**
   * Pause all uploads
   */
  pause() {
    this.paused = true;

    // Abort all active uploads
    for (const [id, controller] of this.abortControllers.entries()) {
      controller.abort();
      const task = this.queue.find((t) => t.id === id);
      if (task && task.status === "uploading") {
        task.status = "paused";
        this.callbacks.onProgress?.(task);
      }
    }

    this.abortControllers.clear();
    this.active.clear();
    this.saveToLocalStorage();
  }

  /**
   * Resume paused uploads
   */
  resume() {
    this.paused = false;

    // Reset paused tasks to pending
    for (const task of this.queue) {
      if (task.status === "paused") {
        task.status = "pending";
        task.progress = 0;
        this.callbacks.onProgress?.(task);
      }
    }

    this.saveToLocalStorage();
    this.processQueue();
  }

  /**
   * Retry a failed upload
   */
  retry(taskId: string) {
    const task = this.queue.find((t) => t.id === taskId);
    if (task && task.status === "failed") {
      task.status = "pending";
      task.progress = 0;
      task.error = undefined;
      task.retryCount = 0;
      this.callbacks.onProgress?.(task);
      this.saveToLocalStorage();

      if (!this.paused) {
        this.processQueue();
      }
    }
  }

  /**
   * Cancel an upload
   */
  cancel(taskId: string) {
    const task = this.queue.find((t) => t.id === taskId);
    if (!task) return;

    // Abort if uploading
    const controller = this.abortControllers.get(taskId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(taskId);
    }

    // Remove from queue
    this.queue = this.queue.filter((t) => t.id !== taskId);
    this.active.delete(taskId);
    this.saveToLocalStorage();

    // Continue processing
    if (!this.paused) {
      this.processQueue();
    }
  }

  /**
   * Get current queue state
   */
  getState() {
    return {
      total: this.queue.length,
      completed: this.queue.filter((t) => t.status === "completed").length,
      failed: this.queue.filter((t) => t.status === "failed").length,
      uploading: this.active.size,
      pending: this.queue.filter((t) => t.status === "pending").length,
      paused: this.queue.filter((t) => t.status === "paused").length,
      overallProgress: this.calculateOverallProgress(),
      tasks: [...this.queue],
    };
  }

  /**
   * Calculate overall progress percentage
   */
  private calculateOverallProgress(): number {
    if (this.queue.length === 0) return 0;

    const totalProgress = this.queue.reduce((sum, task) => sum + task.progress, 0);
    return Math.round(totalProgress / this.queue.length);
  }

  /**
   * Save queue state to localStorage for resume capability
   */
  private saveToLocalStorage() {
    try {
      const state = {
        queue: this.queue.map((t) => ({
          id: t.id,
          fileName: t.file.name,
          fileSize: t.file.size,
          fileType: t.file.type,
          uploadUrl: t.uploadUrl,
          publicUrl: t.publicUrl,
          key: t.key,
          status: t.status,
          progress: t.progress,
          error: t.error,
          retryCount: t.retryCount,
        })),
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("upload-queue", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save upload queue to localStorage:", error);
    }
  }

  /**
   * Load queue state from localStorage
   */
  static loadFromLocalStorage(): {
    queue: Array<{
      id: string;
      fileName: string;
      fileSize: number;
      fileType: string;
      uploadUrl: string;
      publicUrl: string;
      key: string;
      status: UploadStatus;
      progress: number;
      error?: string;
      retryCount?: number;
    }>;
    timestamp: string;
  } | null {
    try {
      const saved = localStorage.getItem("upload-queue");
      if (!saved) return null;

      const state = JSON.parse(saved);

      // Check if state is stale (older than 24 hours)
      const timestamp = new Date(state.timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        localStorage.removeItem("upload-queue");
        return null;
      }

      return state;
    } catch (error) {
      console.error("Failed to load upload queue from localStorage:", error);
      return null;
    }
  }

  /**
   * Clear localStorage
   */
  static clearLocalStorage() {
    localStorage.removeItem("upload-queue");
  }

  /**
   * Clear the queue
   */
  clear() {
    // Abort all active uploads
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }

    this.queue = [];
    this.active.clear();
    this.abortControllers.clear();
    UploadQueue.clearLocalStorage();
  }
}
