"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ServiceDisplay } from "@/components/dashboard/service-selector";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { useToast } from "@/components/ui/toast";
import { QRCodeModal } from "@/components/ui/qr-code";
import { Confetti } from "@/components/ui/confetti";
import { useCelebration, celebrations } from "@/hooks/use-celebration";
import { useUpload } from "@/contexts/upload-context";
import {
  reorderPhotos,
  deleteGallery,
  duplicateGallery,
  archiveGallery,
  deliverGallery,
  recordDownload,
  deletePhoto,
  updateGallery,
  bulkToggleWatermark,
} from "@/lib/actions/galleries";
import { createInvoice } from "@/lib/actions/invoices";
import { createTaskFromGallery } from "@/lib/actions/projects";
import { sendManualGalleryReminder } from "@/lib/actions/gallery-reminders";
import { getDownloadHistory, exportDownloadHistory } from "@/lib/actions/download-tracking";
import { CollectionManager } from "@/components/gallery/collection-manager";
import { SmartCollectionsPanel } from "@/components/gallery/smart-collections-panel";
import { AssignToCollectionModal } from "@/components/gallery/assign-to-collection-modal";
import { AnalyticsDashboard } from "@/components/gallery/analytics-dashboard";
import { ActivityTimeline } from "@/components/gallery/activity-timeline";
import { SelectionsReviewPanel } from "@/components/gallery/selections-review-panel";
import { ChatPanel } from "@/components/gallery/chat-panel";
import { ProjectPLPanel } from "@/components/gallery/project-pl-panel";
import { PhotoComparisonModal } from "@/components/gallery/photo-comparison-modal";
import { AddonRequestsPanel } from "@/components/gallery/addon-requests-panel";
import { getGalleryAddonRequestsAdmin } from "@/lib/actions/gallery-addons";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  EditIcon,
  PlusIcon,
  GridIcon,
  UploadIcon,
  ZoomIcon,
  PhotoIcon,
  ChevronRightIcon,
  LinkIcon,
  CopyIcon,
  ExternalLinkIcon,
  DownloadIcon,
  EmailIcon,
  DuplicateIcon,
  ProjectIcon,
  TrashIcon,
  PhoneIcon,
  QRIcon,
  SendIcon,
  EyeIcon,
  ClockIcon,
  InvoiceIcon,
  AlertIcon,
  CheckboxIcon,
  StarIcon,
  CheckIcon,
  ExportIcon,
  HeartIcon,
  FilterIcon,
  CommentIcon,
  CommentBubbleIcon,
  CloseIcon,
  ExpiredIcon,
  CalendarIcon,
  PreviewIcon,
  GripIcon,
  FolderPlusIcon,
  LayersIcon,
  ListIcon,
} from "./gallery-detail-icons";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  filename: string;
  isFavorite?: boolean;
  downloads?: number;
  views?: number;
  comments?: PhotoComment[];
  metadata?: PhotoMetadata;
  collectionId?: string | null;
  width?: number | null;
  height?: number | null;
  exifData?: Record<string, unknown> | null;
}

interface PhotoComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  isClient: boolean;
}

interface PhotoMetadata {
  width?: number;
  height?: number;
  size?: number;
  capturedAt?: string;
  camera?: string;
  lens?: string;
}

interface GalleryAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  totalDownloads: number;
  photoDownloads: { photoId: string; count: number }[];
  viewsByDay: { date: string; views: number }[];
  avgTimeOnPage: number;
  deviceBreakdown: { device: string; percentage: number }[];
  topPhotos: { photoId: string; views: number; downloads: number }[];
}

interface ActivityItem {
  id: string;
  type: "created" | "edited" | "photos_added" | "delivered" | "viewed" | "downloaded" | "payment" | "note";
  description: string;
  timestamp: string;
  user?: string;
}

interface GallerySettings {
  watermarkEnabled: boolean;
  allowDownloads: boolean;
  downloadResolution: "full" | "web" | "both";
  downloadRequiresPayment: boolean;
  expirationDate: string | null;
  passwordProtected: boolean;
  password: string | null;
  allowFavorites: boolean;
  allowComments: boolean;
  allowSelections: boolean;
  selectionLimit: number | null;
}

interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  status: string;
  amount: number;
  dueDate: string | null;
  createdAt: string;
}

interface Gallery {
  id: string;
  name: string;
  description: string;
  client: { id?: string; name: string; email: string; phone?: string };
  status: "delivered" | "pending" | "draft";
  priceCents: number;
  serviceId?: string;
  serviceDescription?: string;
  photos: Photo[];
  deliveryLink: string | null;
  views: number;
  downloads: number;
  createdAt: string;
  deliveredAt: string | null;
  activity?: ActivityItem[];
  notes?: string;
  settings?: GallerySettings;
  analytics?: GalleryAnalytics;
  expiresAt?: string | null;
  isArchived?: boolean;
  teamMembers?: { id: string; name: string; role: string; avatarUrl?: string }[];
  comments?: PhotoComment[];
  invoices?: InvoiceItem[];
  allowSelections?: boolean;
  selectionLimit?: number | null;
  selectionsSubmitted?: boolean;
}

interface GalleryDetailClientProps {
  gallery: Gallery;
}

// Default settings
const defaultSettings: GallerySettings = {
  watermarkEnabled: true,
  allowDownloads: true,
  downloadResolution: "both",
  downloadRequiresPayment: true,
  expirationDate: null,
  passwordProtected: false,
  password: null,
  allowFavorites: true,
  allowComments: false,
  allowSelections: false,
  selectionLimit: null,
};

type TabType = "photos" | "collections" | "selections" | "chat" | "financials" | "activity" | "analytics" | "downloads" | "settings" | "invoices" | "addons";

interface DownloadHistoryItem {
  id: string;
  createdAt: Date;
  format: string;
  fileCount: number;
  totalBytes: bigint | null;
  clientEmail: string | null;
  sessionId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  assetId: string | null;
}

export function GalleryDetailClient({ gallery }: GalleryDetailClientProps) {
  const { showToast } = useToast();
  const { celebrate, confettiProps } = useCelebration();
  const router = useRouter();
  const { startUpload, activeUpload, lastCompletedAt } = useUpload();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("photos");
  const [notes, setNotes] = useState(gallery.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [settings, setSettings] = useState<GallerySettings>(gallery.settings || defaultSettings);
  const [photos, setPhotos] = useState<Photo[]>(gallery.photos);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(photos[0]?.id || null);
  const [favoritePhotos, setFavoritePhotos] = useState<Set<string>>(new Set());
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<PhotoComment[]>(gallery.comments || []);
  const [photoFilter, setPhotoFilter] = useState<"all" | "favorites" | "commented">("all");
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDeleting, setIsDeleting] = useState(false);
  const [_isDuplicating, setIsDuplicating] = useState(false);
  const [_isArchiving, setIsArchiving] = useState(false);
  const [isDelivering, setIsDelivering] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAddingToProject, setIsAddingToProject] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [showAssignCollectionModal, setShowAssignCollectionModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSavingSetting, setIsSavingSetting] = useState<string | null>(null);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [isTogglingWatermark, setIsTogglingWatermark] = useState(false);
  const [isPhotoDeleting, setIsPhotoDeleting] = useState(false);
  const [isPhotoDownloading, setIsPhotoDownloading] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const activity = gallery.activity || [];
  const analytics = gallery.analytics;
  const invoices = gallery.invoices || [];

  // Download history state
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([]);
  const [downloadHistoryTotal, setDownloadHistoryTotal] = useState(0);
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(false);
  const [isExportingDownloads, setIsExportingDownloads] = useState(false);

  // Add-on requests state
  const [_addonRequestsCount, setAddonRequestsCount] = useState(0);
  const [pendingAddonRequests, setPendingAddonRequests] = useState(0);

  // Sync photos state when gallery prop changes (e.g., after router.refresh())
  useEffect(() => {
    setPhotos(gallery.photos);
  }, [gallery.photos]);

  // Fetch download history when downloads tab is active
  useEffect(() => {
    if (activeTab === "downloads" && downloadHistory.length === 0 && !isLoadingDownloads) {
      const fetchDownloadHistory = async () => {
        setIsLoadingDownloads(true);
        try {
          const result = await getDownloadHistory(gallery.id, { limit: 100 });
          if (result.success && result.data) {
            setDownloadHistory(result.data.downloads as DownloadHistoryItem[]);
            setDownloadHistoryTotal(result.data.total);
          }
        } catch (error) {
          console.error("Failed to fetch download history:", error);
        } finally {
          setIsLoadingDownloads(false);
        }
      };
      fetchDownloadHistory();
    }
  }, [activeTab, gallery.id, downloadHistory.length, isLoadingDownloads]);

  // Fetch add-on requests count on mount
  useEffect(() => {
    const fetchAddonRequestsCount = async () => {
      try {
        const result = await getGalleryAddonRequestsAdmin(gallery.id);
        if (result.success && result.data) {
          const requests = result.data.requests;
          setAddonRequestsCount(requests.length);
          setPendingAddonRequests(
            requests.filter((r: { status: string }) =>
              ["pending", "quoted", "approved", "in_progress"].includes(r.status)
            ).length
          );
        }
      } catch (error) {
        console.error("Failed to fetch add-on requests:", error);
      }
    };
    fetchAddonRequestsCount();
  }, [gallery.id]);

  // Handle submitting a new comment
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    const comment: PhotoComment = {
      id: `c${Date.now()}`,
      author: "You",
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
      isClient: false,
    };
    setComments((prev) => [...prev, comment]);
    setNewComment("");
    showToast("Comment added", "success");
  };

  // Handle settings updates - persist to database
  const handleSettingsChange = async (newSettings: Partial<GallerySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Persist to database
    try {
      const result = await updateGallery({
        id: gallery.id,
        allowDownloads: updatedSettings.allowDownloads,
        showWatermark: updatedSettings.watermarkEnabled,
        downloadResolution: updatedSettings.downloadResolution,
        downloadRequiresPayment: updatedSettings.downloadRequiresPayment,
      });

      if (result.success) {
        showToast("Settings saved", "success");
      } else {
        showToast(result.error || "Failed to save settings", "error");
      }
    } catch {
      showToast("Failed to save settings", "error");
    }
  };

  // Handle password save
  const handleSavePassword = async () => {
    if (!settings.password?.trim()) {
      showToast("Please enter a password", "error");
      return;
    }

    setIsSavingPassword(true);
    try {
      const result = await updateGallery({
        id: gallery.id,
        password: settings.password,
      });

      if (result.success) {
        showToast("Password saved", "success");
      } else {
        showToast(result.error || "Failed to save password", "error");
      }
    } catch {
      showToast("Failed to save password", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Get password strength
  const getPasswordStrength = (pwd: string | null) => {
    if (!pwd) return { label: "", color: "", width: "0%" };
    const len = pwd.length;
    if (len < 4) return { label: "Weak", color: "var(--error)", width: "25%" };
    if (len < 8) return { label: "Fair", color: "var(--warning)", width: "50%" };
    if (len < 12) return { label: "Good", color: "var(--primary)", width: "75%" };
    return { label: "Strong", color: "var(--success)", width: "100%" };
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Optimistically update the UI
      let newOrder: Photo[] = [];
      setPhotos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        newOrder = arrayMove(items, oldIndex, newIndex);
        return newOrder;
      });

      // Persist to database
      try {
        const result = await reorderPhotos(gallery.id, newOrder.map(p => p.id));
        if (result.success) {
          showToast("Photo order saved", "success");
        } else {
          showToast(result.error || "Failed to save order", "error");
          // Revert on error
          setPhotos(gallery.photos);
        }
      } catch {
        showToast("Failed to save order", "error");
        // Revert on error
        setPhotos(gallery.photos);
      }
    }
  };

  const toggleReorderMode = () => {
    setIsReorderMode(!isReorderMode);
    // Exit select mode if entering reorder mode
    if (!isReorderMode && isSelectMode) {
      setIsSelectMode(false);
      setSelectedPhotos(new Set());
    }
  };

  const statusStyles = {
    delivered: "bg-[var(--success)]/10 text-[var(--success)]",
    pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
    draft: "bg-[var(--foreground-muted)]/10 text-foreground-muted",
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleCopyLink = async () => {
    if (gallery.deliveryLink) {
      await navigator.clipboard.writeText(gallery.deliveryLink);
      showToast("Delivery link copied to clipboard", "success");
    }
  };

  const handleDeliverGallery = async () => {
    setIsDelivering(true);
    try {
      const result = await deliverGallery(gallery.id);
      if (result.success) {
        // Celebrate the delivery!
        celebrate(celebrations.delivery());

        // Check if email was sent successfully
        if (result.data.emailSent) {
          showToast("Gallery delivered and email sent!", "success");
        } else if (result.data.emailError) {
          showToast("Gallery delivered successfully!", "success");
          // Show warning about email failure after a short delay
          setTimeout(() => {
            showToast(`Email not sent: ${result.data.emailError}`, "error");
          }, 500);
        } else {
          showToast("Gallery delivered successfully!", "success");
        }
        router.refresh();
      } else {
        showToast(result.error || "Failed to deliver gallery", "error");
      }
    } catch {
      showToast("Failed to deliver gallery", "error");
    } finally {
      setIsDelivering(false);
    }
  };

  const handleAddPhotos = () => {
    startUpload(gallery.id, gallery.name);
  };

  // Refresh photos when uploads complete for this gallery
  const prevCompletedAtRef = useRef<number | null>(null);
  useEffect(() => {
    // Watch the lastCompletedAt timestamp - when it changes, refresh the gallery
    if (
      lastCompletedAt !== null &&
      lastCompletedAt !== prevCompletedAtRef.current &&
      activeUpload?.galleryId === gallery.id
    ) {
      // All uploads finished - refresh the page to get new photos
      router.refresh();
      prevCompletedAtRef.current = lastCompletedAt;
    }
  }, [lastCompletedAt, activeUpload?.galleryId, gallery.id, router]);

  const handleDownloadAll = async () => {
    showToast("Preparing download of all photos...", "info");
    // Download photos one by one (in production, you'd zip them server-side)
    for (const photo of photos) {
      try {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = photo.filename || `photo-${photo.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // Continue with other photos if one fails
      }
    }
    // Record the download
    await recordDownload(gallery.id);
    showToast(`Downloaded ${photos.length} photos`, "success");
  };

  const handleEmailClient = () => {
    if (gallery.client.email) {
      const subject = encodeURIComponent(`About your gallery: ${gallery.name}`);
      const body = encodeURIComponent(`Hi ${gallery.client.name},\n\n`);
      window.location.href = `mailto:${gallery.client.email}?subject=${subject}&body=${body}`;
    } else {
      showToast("No email address on file", "warning");
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const result = await duplicateGallery(gallery.id);
      if (result.success && result.data) {
        showToast("Gallery duplicated successfully", "success");
        router.push(`/galleries/${result.data.id}`);
      } else if (!result.success) {
        showToast(result.error || "Failed to duplicate gallery", "error");
      }
    } catch {
      showToast("Failed to duplicate gallery", "error");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleAddToProject = async () => {
    setIsAddingToProject(true);
    try {
      const result = await createTaskFromGallery(gallery.id);
      if (result.success && result.taskId) {
        showToast("Added to project board", "success");
        router.push(`/projects`);
      } else if (!result.success) {
        showToast(result.error || "Failed to add to project", "error");
      }
    } catch {
      showToast("Failed to add to project", "error");
    } finally {
      setIsAddingToProject(false);
    }
  };

  const handleDeleteGallery = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteGallery = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteGallery(gallery.id);
      if (result.success) {
        showToast("Gallery deleted successfully", "success");
        router.push("/galleries");
      } else {
        showToast(result.error || "Failed to delete gallery", "error");
      }
    } catch {
      showToast("Failed to delete gallery", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleGenerateLink = async () => {
    // This is the same as delivering the gallery - it generates the delivery link
    await handleDeliverGallery();
  };

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handlePhotoDelete = async (photo: Photo) => {
    setIsPhotoDeleting(true);
    try {
      const result = await deletePhoto(gallery.id, photo.id);
      if (result.success) {
        // Remove photo from local state
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        showToast(`Photo "${photo.filename}" deleted`, "success");
        setLightboxOpen(false);
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete photo", "error");
      }
    } catch {
      showToast("Failed to delete photo", "error");
    } finally {
      setIsPhotoDeleting(false);
    }
  };

  const handlePhotoDownload = async (photo: Photo) => {
    setIsPhotoDownloading(true);
    showToast(`Downloading ${photo.filename}...`, "info");
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = photo.filename || `photo-${photo.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      await recordDownload(gallery.id, photo.id);
      showToast("Download complete", "success");
    } catch {
      showToast("Failed to download photo", "error");
    } finally {
      setIsPhotoDownloading(false);
    }
  };

  // Selection mode handlers
  const toggleSelectMode = () => {
    if (isSelectMode) {
      setSelectedPhotos(new Set());
    }
    setIsSelectMode(!isSelectMode);
    // Exit reorder mode if entering select mode
    if (!isSelectMode && isReorderMode) {
      setIsReorderMode(false);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const selectAllPhotos = () => {
    setSelectedPhotos(new Set(photos.map((p) => p.id)));
  };

  const deselectAllPhotos = () => {
    setSelectedPhotos(new Set());
  };

  const handleBatchDelete = async () => {
    const count = selectedPhotos.size;
    const photoIds = Array.from(selectedPhotos);

    setIsBatchDeleting(true);
    try {
      // Delete all selected photos
      let deleted = 0;
      for (const photoId of photoIds) {
        const result = await deletePhoto(gallery.id, photoId);
        if (result.success) {
          deleted++;
        }
      }

      // Update local state
      setPhotos((prev) => prev.filter((p) => !selectedPhotos.has(p.id)));
      setSelectedPhotos(new Set());
      setIsSelectMode(false);

      if (deleted === count) {
        showToast(`${count} photo${count !== 1 ? "s" : ""} deleted`, "success");
      } else {
        showToast(`${deleted} of ${count} photos deleted`, "warning");
      }

      router.refresh();
    } catch {
      showToast("Failed to delete some photos", "error");
    } finally {
      setIsBatchDeleting(false);
    }
  };

  const handleToggleWatermark = async (exclude: boolean) => {
    const _count = selectedPhotos.size;
    const photoIds = Array.from(selectedPhotos);

    setIsTogglingWatermark(true);
    try {
      const result = await bulkToggleWatermark(gallery.id, photoIds, exclude);

      if (result.success) {
        showToast(
          exclude
            ? `${result.data.updated} photo${result.data.updated !== 1 ? "s" : ""} excluded from watermark`
            : `${result.data.updated} photo${result.data.updated !== 1 ? "s" : ""} will be watermarked`,
          "success"
        );
        setSelectedPhotos(new Set());
        setIsSelectMode(false);
        router.refresh();
      } else {
        showToast(result.error, "error");
      }
    } catch {
      showToast("Failed to update watermark settings", "error");
    } finally {
      setIsTogglingWatermark(false);
    }
  };

  const handleBatchDownload = async () => {
    const count = selectedPhotos.size;
    setIsBatchDownloading(true);
    showToast(`Preparing download of ${count} photo${count !== 1 ? "s" : ""}...`, "info");

    try {
      const selectedPhotosList = photos.filter(p => selectedPhotos.has(p.id));
      for (const photo of selectedPhotosList) {
        try {
          const response = await fetch(photo.url);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = photo.filename || `photo-${photo.id}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch {
          // Continue with other photos
        }
      }
      await recordDownload(gallery.id);
      setSelectedPhotos(new Set());
      setIsSelectMode(false);
      showToast(`Downloaded ${count} photo${count !== 1 ? "s" : ""}`, "success");
    } finally {
      setIsBatchDownloading(false);
    }
  };

  const handleSetCover = () => {
    const selectedArray = Array.from(selectedPhotos);
    if (selectedArray.length === 1) {
      setCoverPhotoId(selectedArray[0]);
      setSelectedPhotos(new Set());
      setIsSelectMode(false);
      showToast("Cover photo updated", "success");
    } else {
      showToast("Please select exactly one photo to set as cover", "warning");
    }
  };

  const toggleFavorite = (photoId: string) => {
    setFavoritePhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
        showToast("Removed from favorites", "info");
      } else {
        next.add(photoId);
        showToast("Added to favorites", "success");
      }
      return next;
    });
  };

  const handleBatchFavorite = () => {
    const count = selectedPhotos.size;
    setFavoritePhotos((prev) => {
      const next = new Set(prev);
      selectedPhotos.forEach((id) => next.add(id));
      return next;
    });
    setSelectedPhotos(new Set());
    setIsSelectMode(false);
    showToast(`${count} photo${count !== 1 ? "s" : ""} added to favorites`, "success");
  };

  const _handleArchiveGallery = async () => {
    setIsArchiving(true);
    try {
      const result = await archiveGallery(gallery.id);
      if (result.success) {
        showToast("Gallery archived successfully", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to archive gallery", "error");
      }
    } catch {
      showToast("Failed to archive gallery", "error");
    } finally {
      setIsArchiving(false);
    }
  };

  const _handleDuplicateGallery = async () => {
    // This is an alias for handleDuplicate
    await handleDuplicate();
  };

  const _handleExportAnalytics = () => {
    if (!analytics) {
      showToast("No analytics data available", "error");
      return;
    }
    // Generate CSV from analytics data
    const csvRows = [
      ["Metric", "Value"],
      ["Total Views", analytics.totalViews.toString()],
      ["Unique Visitors", analytics.uniqueVisitors.toString()],
      ["Total Downloads", analytics.totalDownloads.toString()],
      ["Avg Time on Page (seconds)", analytics.avgTimeOnPage.toString()],
      [""],
      ["Views by Day", ""],
      ["Date", "Views"],
      ...analytics.viewsByDay.map(d => [d.date, d.views.toString()]),
      [""],
      ["Device Breakdown", ""],
      ["Device", "Percentage"],
      ...analytics.deviceBreakdown.map(d => [d.device, `${d.percentage}%`]),
    ];

    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${gallery.name.replace(/[^a-z0-9]/gi, "_")}-analytics.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Analytics exported successfully", "success");
  };

  const handleExportDownloads = async () => {
    setIsExportingDownloads(true);
    try {
      const result = await exportDownloadHistory(gallery.id);
      if (result.success) {
        const blob = new Blob([result.data], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${gallery.name.replace(/[^a-z0-9]/gi, "_")}-download-history.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Download history exported successfully", "success");
      } else {
        showToast(result.error, "error");
      }
    } catch (error) {
      console.error("Failed to export downloads:", error);
      showToast("Failed to export download history", "error");
    } finally {
      setIsExportingDownloads(false);
    }
  };

  const handlePreviewDelivery = () => {
    window.open(`/g/${gallery.id}?preview=true`, "_blank");
    showToast("Opening delivery preview in new tab", "info");
  };

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    showToast("Notes saved successfully", "success");
  };

  const handleToggleSetting = async (key: keyof GallerySettings) => {
    const newValue = !settings[key];
    setIsSavingSetting(key);

    // Optimistically update the UI
    setSettings(prev => ({ ...prev, [key]: newValue }));

    try {
      // Map settings keys to updateGallery parameters
      const updateData: Record<string, boolean | string | number | null> = {};
      if (key === "allowDownloads") updateData.allowDownloads = newValue as boolean;
      if (key === "watermarkEnabled") updateData.showWatermark = newValue as boolean;
      if (key === "allowFavorites") updateData.allowFavorites = newValue as boolean;
      if (key === "allowComments") updateData.allowComments = newValue as boolean;
      if (key === "allowSelections") updateData.allowSelections = newValue as boolean;

      const result = await updateGallery({
        id: gallery.id,
        ...updateData,
      });

      if (result.success) {
        showToast("Setting saved", "success");
      } else {
        // Revert on error
        setSettings(prev => ({ ...prev, [key]: !newValue }));
        showToast(result.error || "Failed to save setting", "error");
      }
    } catch {
      // Revert on error
      setSettings(prev => ({ ...prev, [key]: !newValue }));
      showToast("Failed to save setting", "error");
    } finally {
      setIsSavingSetting(null);
    }
  };

  const handleCreateInvoice = async () => {
    if (!gallery.client.id) {
      showToast("No client associated with this gallery", "error");
      return;
    }

    if (gallery.priceCents <= 0) {
      showToast("Gallery has no billable amount", "error");
      return;
    }

    setIsCreatingInvoice(true);
    try {
      const result = await createInvoice({
        clientId: gallery.client.id,
        lineItems: [
          {
            itemType: "service" as const,
            description: `${gallery.name}${gallery.serviceDescription ? ` - ${gallery.serviceDescription}` : ""}`,
            quantity: 1,
            unitCents: gallery.priceCents,
          },
        ],
      });

      if (result.success) {
        showToast("Invoice created successfully", "success");
        router.push(`/invoices/${result.data.id}`);
      } else {
        showToast(result.error || "Failed to create invoice", "error");
      }
    } catch {
      showToast("Failed to create invoice", "error");
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleSendReminder = async () => {
    if (!gallery.client.email) {
      showToast("No client email address on file", "error");
      return;
    }

    if (gallery.status !== "delivered") {
      showToast("Gallery must be delivered before sending reminders", "warning");
      return;
    }

    setIsSendingReminder(true);
    try {
      const result = await sendManualGalleryReminder(gallery.id);
      if (result.success) {
        showToast(`Reminder sent to ${result.data?.sentTo}`, "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to send reminder", "error");
      }
    } catch {
      showToast("Failed to send reminder", "error");
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleCallClient = () => {
    if (gallery.client.phone) {
      window.location.href = `tel:${gallery.client.phone}`;
    } else {
      showToast("No phone number on file", "warning");
    }
  };

  const handleGenerateQR = () => {
    if (!gallery.deliveryLink) {
      showToast("Gallery must be delivered to generate QR code", "error");
      return;
    }
    setShowQRModal(true);
  };

  const _formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Filter photos by collection first, then by photoFilter
  const collectionFilteredPhotos = selectedCollectionId === null
    ? photos
    : selectedCollectionId === "uncategorized"
    ? photos.filter(p => !p.collectionId)
    : photos.filter(p => p.collectionId === selectedCollectionId);

  const filteredPhotos = photoFilter === "all"
    ? collectionFilteredPhotos
    : photoFilter === "favorites"
    ? collectionFilteredPhotos.filter(p => favoritePhotos.has(p.id))
    : collectionFilteredPhotos.filter(p => (p.comments?.length || 0) > 0);
  const displayedPhotos = showAllPhotos ? filteredPhotos : filteredPhotos.slice(0, 6);
  const hasMorePhotos = filteredPhotos.length > 6;

  // Expiration warning
  const daysUntilExpiration = gallery.expiresAt
    ? Math.ceil((new Date(gallery.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

  return (
    <>
      {/* Confetti celebration for gallery delivery */}
      <Confetti {...confettiProps} />

      {/* Expiration Warning Banner */}
      {(isExpiringSoon || isExpired) && (
        <div
          className={cn(
            "mb-6 flex flex-col gap-4 rounded-xl border px-6 py-4 sm:flex-row sm:items-center sm:justify-between",
            isExpired
              ? "border-[var(--error)]/30 bg-[var(--error)]/10"
              : "border-[var(--warning)]/30 bg-[var(--warning)]/10"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                isExpired ? "bg-[var(--error)]/20" : "bg-[var(--warning)]/20"
              )}
            >
              {isExpired ? (
                <ExpiredIcon className={cn("h-5 w-5", "text-[var(--error)]")} />
              ) : (
                <ClockIcon className={cn("h-5 w-5", "text-[var(--warning)]")} />
              )}
            </div>
            <div>
              <p className={cn("text-sm font-medium", isExpired ? "text-[var(--error)]" : "text-[var(--warning)]")}>
                {isExpired ? "Gallery Has Expired" : `Gallery Expires in ${daysUntilExpiration} Day${daysUntilExpiration !== 1 ? "s" : ""}`}
              </p>
              <p className="text-sm text-foreground-muted">
                {isExpired
                  ? "This gallery is no longer accessible to clients. Extend the expiration to restore access."
                  : "Consider extending the expiration date or reminding your client to download their photos."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isExpired && (
              <button
                onClick={handleSendReminder}
                disabled={isSendingReminder}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingReminder ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
                ) : (
                  <EmailIcon className="h-4 w-4" />
                )}
                {isSendingReminder ? "Sending..." : "Send Reminder"}
              </button>
            )}
            <button
              onClick={() => {
                showToast("Opening expiration settings...", "info");
                setActiveTab("settings");
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                isExpired
                  ? "bg-[var(--error)] text-white hover:bg-[var(--error)]/90"
                  : "bg-[var(--warning)] text-white hover:bg-[var(--warning)]/90"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              Extend Expiration
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 sm:p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</p>
              <span className={cn("mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[gallery.status])}>
                {gallery.status.charAt(0).toUpperCase() + gallery.status.slice(1)}
              </span>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 sm:p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Revenue</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
                {gallery.priceCents > 0 ? formatCurrency(gallery.priceCents) : "Free"}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 sm:p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Views</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-foreground">{gallery.views}</p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 sm:p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Downloads</p>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-foreground">{gallery.downloads}</p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-[var(--card-border)] -mx-4 px-4 sm:mx-0 sm:px-0">
            <nav className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-px" style={{ WebkitOverflowScrolling: 'touch' }}>
              {(["photos", "collections", "selections", "chat", "financials", "addons", "activity", "analytics", "downloads", "settings", "invoices"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative shrink-0 whitespace-nowrap py-3 text-sm font-medium transition-colors",
                    activeTab === tab
                      ? "text-[var(--primary)]"
                      : "text-foreground-muted hover:text-foreground"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />
                  )}
                  {tab === "activity" && (
                    <span className="ml-1.5 rounded-full bg-[var(--primary)]/10 px-1.5 py-0.5 text-xs text-[var(--primary)]">
                      {activity.length}
                    </span>
                  )}
                  {tab === "analytics" && gallery.status === "delivered" && analytics && (
                    <span className="ml-1.5 rounded-full bg-[var(--success)]/10 px-1.5 py-0.5 text-xs text-[var(--success)]">
                      {analytics?.totalViews ?? 0}
                    </span>
                  )}
                  {tab === "downloads" && gallery.downloads > 0 && (
                    <span className="ml-1.5 rounded-full bg-[var(--primary)]/10 px-1.5 py-0.5 text-xs text-[var(--primary)]">
                      {gallery.downloads}
                    </span>
                  )}
                  {tab === "addons" && pendingAddonRequests > 0 && (
                    <span className="ml-1.5 rounded-full bg-[var(--warning)]/10 px-1.5 py-0.5 text-xs text-[var(--warning)]">
                      {pendingAddonRequests}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "photos" && (
            <>
              {/* Description - Now above Service Package */}
          {gallery.description && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-foreground">Description</h2>
                <Link
                  href={`/galleries/${gallery.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                >
                  <EditIcon className="h-3.5 w-3.5" />
                  Edit
                </Link>
              </div>
              <p className="text-sm text-foreground-secondary">{gallery.description}</p>
            </div>
          )}

          {/* Service Package */}
          {(gallery.serviceId || gallery.serviceDescription) && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Service Package</h2>
              <ServiceDisplay
                serviceId={gallery.serviceId}
                customPrice={gallery.priceCents}
                customDescription={gallery.serviceDescription}
                editHref={`/galleries/${gallery.id}/edit`}
              />
            </div>
          )}

          {/* Photo Grid */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-6">
            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 shrink-0">
                <h2 className="text-lg font-semibold text-foreground">
                  Photos <span className="text-foreground-muted font-normal">({photos.length})</span>
                </h2>
                {isSelectMode && (
                  <span className="text-sm text-foreground-muted">
                    {selectedPhotos.size} selected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible" style={{ WebkitOverflowScrolling: 'touch' }}>
                {/* View Mode Toggle */}
                {photos.length > 0 && !isSelectMode && !isReorderMode && (
                  <div className="inline-flex shrink-0 rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-0.5">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
                        viewMode === "grid"
                          ? "bg-[var(--primary)] text-white"
                          : "text-foreground-muted hover:text-foreground"
                      )}
                    >
                      <GridIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-medium transition-colors",
                        viewMode === "list"
                          ? "bg-[var(--primary)] text-white"
                          : "text-foreground-muted hover:text-foreground"
                      )}
                    >
                      <ListIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {photos.length > 1 && !isSelectMode && viewMode === "grid" && (
                  <button
                    onClick={toggleReorderMode}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                      isReorderMode
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--card-border)] bg-[var(--background)] text-foreground hover:bg-[var(--background-hover)]"
                    )}
                  >
                    <GripIcon className="h-4 w-4" />
                    {isReorderMode ? "Done" : "Reorder"}
                  </button>
                )}
                {photos.length > 0 && !isReorderMode && (
                  <button
                    onClick={toggleSelectMode}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                      isSelectMode
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--card-border)] bg-[var(--background)] text-foreground hover:bg-[var(--background-hover)]"
                    )}
                  >
                    <CheckboxIcon className="h-4 w-4" />
                    {isSelectMode ? "Cancel" : "Select"}
                  </button>
                )}
                {isSelectMode && photos.length > 0 && (
                  <button
                    onClick={selectedPhotos.size === photos.length ? deselectAllPhotos : selectAllPhotos}
                    className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                  >
                    {selectedPhotos.size === photos.length ? "Deselect All" : "Select All"}
                  </button>
                )}
                {!isSelectMode && !isReorderMode && (
                  <>
                    {hasMorePhotos && !showAllPhotos && (
                      <button
                        onClick={() => setShowAllPhotos(true)}
                        className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                      >
                        <GridIcon className="h-4 w-4" />
                        View All
                      </button>
                    )}
                    <button
                      onClick={() => setShowCommentsPanel(true)}
                      className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                    >
                      <CommentBubbleIcon className="h-4 w-4" />
                      Comments
                      {comments.length > 0 && (
                        <span className="rounded-full bg-[var(--primary)] px-1.5 py-0.5 text-xs text-white">
                          {comments.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={handleAddPhotos}
                      className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                    >
                      <UploadIcon className="h-4 w-4" />
                      Add Photos
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Photo Filter Tabs */}
            {!isSelectMode && photos.length > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <FilterIcon className="h-4 w-4 text-foreground-muted" />
                {(["all", "favorites", "commented"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPhotoFilter(filter)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      photoFilter === filter
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--background)] text-foreground-muted hover:text-foreground"
                    )}
                  >
                    {filter === "all" && "All"}
                    {filter === "favorites" && (
                      <>
                        <HeartIcon className="h-3 w-3" filled={favoritePhotos.size > 0} />
                        Favorites ({favoritePhotos.size})
                      </>
                    )}
                    {filter === "commented" && (
                      <>
                        <CommentIcon className="h-3 w-3" />
                        With Comments
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Batch Action Bar */}
            {isSelectMode && selectedPhotos.size > 0 && (
              <div className="mb-4 flex flex-col gap-3 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-foreground">
                  {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? "s" : ""} selected
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleBatchFavorite}
                    disabled={isBatchDeleting || isBatchDownloading}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
                  >
                    <HeartIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Favorite</span>
                  </button>
                  <button
                    onClick={() => setShowAssignCollectionModal(true)}
                    disabled={isBatchDeleting || isBatchDownloading}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
                  >
                    <FolderPlusIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Collection</span>
                  </button>
                  <button
                    onClick={handleSetCover}
                    disabled={selectedPhotos.size !== 1 || isBatchDeleting || isBatchDownloading}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
                  >
                    <StarIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Set as Cover</span>
                  </button>
                  <button
                    onClick={() => setShowComparisonModal(true)}
                    disabled={selectedPhotos.size < 2 || selectedPhotos.size > 4 || isBatchDeleting || isBatchDownloading}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
                    title={selectedPhotos.size < 2 ? "Select 2-4 photos to compare" : selectedPhotos.size > 4 ? "Max 4 photos for comparison" : "Compare selected photos"}
                  >
                    <GridIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Compare</span>
                  </button>
                  {/* Watermark Toggle Dropdown */}
                  <div className="relative group">
                    <button
                      disabled={isBatchDeleting || isBatchDownloading || isTogglingWatermark}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
                    >
                      {isTogglingWatermark ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
                      ) : (
                        <LayersIcon className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline">Watermark</span>
                    </button>
                    <div className="invisible group-hover:visible absolute top-full left-0 mt-1 w-44 rounded-lg border border-[var(--card-border)] bg-[var(--card)] shadow-lg z-50">
                      <button
                        onClick={() => handleToggleWatermark(true)}
                        disabled={isTogglingWatermark}
                        className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-[var(--background-hover)] rounded-t-lg disabled:opacity-50"
                      >
                        Exclude from watermark
                      </button>
                      <button
                        onClick={() => handleToggleWatermark(false)}
                        disabled={isTogglingWatermark}
                        className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-[var(--background-hover)] rounded-b-lg disabled:opacity-50"
                      >
                        Include in watermark
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleBatchDownload}
                    disabled={isBatchDownloading || isBatchDeleting}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
                  >
                    {isBatchDownloading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground-muted border-t-transparent" />
                    ) : (
                      <DownloadIcon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{isBatchDownloading ? "Downloading..." : "Download"}</span>
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    disabled={isBatchDeleting || isBatchDownloading}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20 disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
                  >
                    {isBatchDeleting ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--error)] border-t-transparent" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{isBatchDeleting ? "Deleting..." : "Delete"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Reorder Mode Instructions */}
            {isReorderMode && (
              <div className="mb-4 flex items-center gap-3 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-3">
                <GripIcon className="h-5 w-5 text-[var(--primary)]" />
                <p className="text-sm text-foreground">
                  <span className="font-medium">Drag photos</span> to reorder them. Click <span className="font-medium">Done</span> when finished.
                </p>
              </div>
            )}

            {photos.length > 0 ? (
              <>
                {viewMode === "list" ? (
                  /* List View with Drag-and-Drop Reordering */
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={displayedPhotos.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1">
                        {/* List Header */}
                        <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-foreground-muted uppercase tracking-wider border-b border-[var(--card-border)]">
                          <div className="w-6" /> {/* Drag handle spacer */}
                          <div className="w-14 shrink-0">Preview</div>
                          <div className="flex-1 min-w-0">Filename</div>
                          <div className="w-20 text-center hidden sm:block">Status</div>
                          <div className="w-24 text-right hidden md:block">Order</div>
                        </div>
                        {displayedPhotos.map((photo, index) => (
                          <SortableListItem
                            key={photo.id}
                            photo={photo}
                            index={index}
                            isCover={coverPhotoId === photo.id}
                            isFavorite={favoritePhotos.has(photo.id)}
                            isSelected={selectedPhotos.has(photo.id)}
                            isSelectMode={isSelectMode}
                            onToggleSelect={() => togglePhotoSelection(photo.id)}
                            onToggleFavorite={() => toggleFavorite(photo.id)}
                            onClick={() => handlePhotoClick(index)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : isReorderMode ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={displayedPhotos.map(p => p.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {displayedPhotos.map((photo) => (
                          <SortablePhotoItem
                            key={photo.id}
                            photo={photo}
                            isCover={coverPhotoId === photo.id}
                            isFavorite={favoritePhotos.has(photo.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {displayedPhotos.map((photo, index) => (
                      <div
                        key={photo.id}
                        onClick={() => isSelectMode ? togglePhotoSelection(photo.id) : handlePhotoClick(index)}
                        className={cn(
                          "group relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--background)] cursor-pointer focus:outline-none",
                          isSelectMode && selectedPhotos.has(photo.id) && "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--card)]"
                        )}
                      >
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.filename}
                          className={cn(
                            "h-full w-full object-cover transition-transform",
                            !isSelectMode && "group-hover:scale-105"
                          )}
                        />
                        {/* Cover badge */}
                        {coverPhotoId === photo.id && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-[var(--primary)] px-2 py-1 text-xs font-medium text-white">
                            <StarIcon className="h-3 w-3" />
                            Cover
                          </div>
                        )}
                        {/* Favorite badge - always visible if favorited */}
                        {favoritePhotos.has(photo.id) && !isSelectMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(photo.id);
                            }}
                            className="absolute top-2 right-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--error)] text-white shadow-lg transition-transform hover:scale-110"
                          >
                            <HeartIcon className="h-4 w-4" filled />
                          </button>
                        )}
                        {/* Selection checkbox */}
                        {isSelectMode && (
                          <div className="absolute top-2 right-2">
                            <div
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                                selectedPhotos.has(photo.id)
                                  ? "border-[var(--primary)] bg-[var(--primary)]"
                                  : "border-white/80 bg-black/30"
                              )}
                            >
                              {selectedPhotos.has(photo.id) && (
                                <CheckIcon className="h-4 w-4 text-white" />
                              )}
                            </div>
                          </div>
                        )}
                        {/* Hover overlay - only when not in select mode */}
                        {!isSelectMode && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-start justify-between gap-4 flex-wrap">
                                <p className="text-sm font-medium text-white truncate flex-1">{photo.filename}</p>
                                {!favoritePhotos.has(photo.id) && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavorite(photo.id);
                                    }}
                                    className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                                  >
                                    <HeartIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              <div className="rounded-full bg-black/50 p-3">
                                <ZoomIcon className="h-5 w-5 text-white" />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {hasMorePhotos && !showAllPhotos && (
                  <button
                    onClick={() => setShowAllPhotos(true)}
                    className="mt-4 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                  >
                    Show all {photos.length} photos
                  </button>
                )}

                {showAllPhotos && hasMorePhotos && (
                  <button
                    onClick={() => setShowAllPhotos(false)}
                    className="mt-4 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                  >
                    Show fewer photos
                  </button>
                )}
              </>
            ) : (
              <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-12 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-foreground-muted" />
                <p className="mt-3 text-sm text-foreground">No photos yet</p>
                <p className="mt-1 text-xs text-foreground-muted">Upload photos to get started</p>
                <button
                  onClick={handleAddPhotos}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                >
                  <UploadIcon className="h-4 w-4" />
                  Upload Photos
                </button>
              </div>
            )}
          </div>
            </>
          )}

          {/* Selections Tab */}
          {activeTab === "selections" && (
            <SelectionsReviewPanel
              galleryId={gallery.id}
              allowSelections={gallery.allowSelections}
              selectionLimit={gallery.selectionLimit}
              selectionsSubmitted={gallery.selectionsSubmitted}
              onSettingsClick={() => setActiveTab("settings")}
            />
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] h-[600px]">
              <ChatPanel galleryId={gallery.id} />
            </div>
          )}

          {/* Financials Tab */}
          {activeTab === "financials" && (
            <ProjectPLPanel galleryId={gallery.id} />
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-6">
              {/* Notes Section */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Internal Notes</h2>
                  {!isEditingNotes && (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                    >
                      <EditIcon className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  )}
                </div>
                {isEditingNotes ? (
                  <div className="space-y-3">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add internal notes about this gallery..."
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                      rows={4}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsEditingNotes(false)}
                        className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                ) : notes ? (
                  <p className="text-sm text-foreground-secondary whitespace-pre-wrap">{notes}</p>
                ) : (
                  <p className="text-sm text-foreground-muted italic">No notes added yet. Click Edit to add notes.</p>
                )}
              </div>

              {/* Activity Timeline - Real-time data from database */}
              <ActivityTimeline galleryId={gallery.id} />
            </div>
          )}

          {/* Collections Tab */}
          {activeTab === "collections" && (
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              {/* Collections Sidebar */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <CollectionManager
                  galleryId={gallery.id}
                  onCollectionSelect={setSelectedCollectionId}
                  selectedCollectionId={selectedCollectionId}
                  photos={photos.map(p => ({ id: p.id, thumbnailUrl: p.thumbnailUrl }))}
                />
              </div>

              {/* Filtered Photo Grid */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
                  <h3 className="text-sm font-semibold text-foreground">
                    {selectedCollectionId === null
                      ? "All Photos"
                      : selectedCollectionId === "uncategorized"
                      ? "Uncategorized"
                      : "Collection Photos"}
                  </h3>
                  {selectedPhotos.size > 0 && (
                    <button
                      onClick={() => setShowAssignCollectionModal(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                    >
                      <FolderPlusIcon className="h-3.5 w-3.5" />
                      Assign to Collection
                    </button>
                  )}
                </div>

                {/* Photo Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {photos
                    .filter((photo) => {
                      if (selectedCollectionId === null) return true;
                      if (selectedCollectionId === "uncategorized") return !photo.collectionId;
                      return photo.collectionId === selectedCollectionId;
                    })
                    .map((photo, index) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-[var(--background)]"
                        onClick={() => {
                          if (isSelectMode) {
                            togglePhotoSelection(photo.id);
                          } else {
                            handlePhotoClick(index);
                          }
                        }}
                      >
                        <img
                          src={photo.thumbnailUrl || photo.url}
                          alt={photo.filename}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {isSelectMode && (
                          <div
                            className={cn(
                              "absolute inset-0 flex items-center justify-center transition-colors",
                              selectedPhotos.has(photo.id)
                                ? "bg-[var(--primary)]/30"
                                : "bg-transparent"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                selectedPhotos.has(photo.id)
                                  ? "border-white bg-[var(--primary)] text-white"
                                  : "border-white/70 bg-black/30"
                              )}
                            >
                              {selectedPhotos.has(photo.id) && (
                                <CheckIcon className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {photos.filter((photo) => {
                  if (selectedCollectionId === null) return true;
                  if (selectedCollectionId === "uncategorized") return !photo.collectionId;
                  return photo.collectionId === selectedCollectionId;
                }).length === 0 && (
                  <div className="py-12 text-center">
                    <PhotoIcon className="mx-auto h-12 w-12 text-foreground-muted" />
                    <p className="mt-3 text-sm text-foreground-muted">
                      {selectedCollectionId === "uncategorized"
                        ? "All photos are assigned to collections"
                        : "No photos in this collection"}
                    </p>
                  </div>
                )}
              </div>

              {/* Smart Collections Panel */}
              <SmartCollectionsPanel
                galleryId={gallery.id}
                onCollectionCreated={() => router.refresh()}
                className="lg:col-span-2"
              />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <AnalyticsDashboard
              galleryId={gallery.id}
              galleryName={gallery.name}
              isDelivered={gallery.status === "delivered"}
              onDeliverClick={handleDeliverGallery}
            />
          )}

          {/* Downloads Tab */}
          {activeTab === "downloads" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Download History</h2>
                    <p className="text-sm text-foreground-muted mt-1">
                      {downloadHistoryTotal} total downloads
                    </p>
                  </div>
                  <button
                    onClick={handleExportDownloads}
                    disabled={isExportingDownloads || downloadHistory.length === 0}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ExportIcon className="h-4 w-4" />
                    {isExportingDownloads ? "Exporting..." : "Export CSV"}
                  </button>
                </div>

                {isLoadingDownloads ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
                  </div>
                ) : downloadHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <DownloadIcon className="mx-auto h-12 w-12 text-foreground-muted opacity-50" />
                    <h3 className="mt-4 text-sm font-medium text-foreground">No downloads yet</h3>
                    <p className="mt-2 text-sm text-foreground-muted">
                      Downloads will appear here once clients start downloading photos.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-[var(--card-border)]">
                          <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Format</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Files</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Size</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">Client</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--card-border)]">
                        {downloadHistory.map((download) => (
                          <tr key={download.id} className="hover:bg-[var(--background-hover)]">
                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                              {new Date(download.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                download.format === "zip_all" && "bg-[var(--primary)]/10 text-[var(--primary)]",
                                download.format === "original" && "bg-[var(--success)]/10 text-[var(--success)]",
                                download.format === "web_size" && "bg-[var(--warning)]/10 text-[var(--warning)]",
                                download.format === "high_res" && "bg-purple-500/10 text-purple-500",
                              )}>
                                {download.format === "zip_all" ? "All Photos (ZIP)" :
                                 download.format === "original" ? "Original" :
                                 download.format === "web_size" ? "Web Size" :
                                 download.format === "high_res" ? "High Res" :
                                 download.format}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                              {download.fileCount} {download.fileCount === 1 ? "file" : "files"}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground-muted whitespace-nowrap">
                              {download.totalBytes
                                ? `${(Number(download.totalBytes) / (1024 * 1024)).toFixed(1)} MB`
                                : "—"}
                            </td>
                            <td className="px-6 py-4 text-sm text-foreground whitespace-nowrap">
                              {download.clientEmail || (
                                <span className="text-foreground-muted">Anonymous</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Gallery Settings */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Gallery Settings</h2>
                <div className="space-y-4">
                  <SettingToggle
                    label="Watermark Photos"
                    description="Add your watermark to all photos in client view"
                    enabled={settings.watermarkEnabled}
                    onToggle={() => handleToggleSetting("watermarkEnabled")}
                    isLoading={isSavingSetting === "watermarkEnabled"}
                  />
                  <SettingToggle
                    label="Allow Downloads"
                    description="Let clients download photos from the gallery"
                    enabled={settings.allowDownloads}
                    onToggle={() => handleToggleSetting("allowDownloads")}
                    isLoading={isSavingSetting === "allowDownloads"}
                  />
                  <SettingToggle
                    label="Require Payment for Downloads"
                    description="Block downloads until gallery payment is complete"
                    enabled={settings.downloadRequiresPayment}
                    onToggle={() => handleToggleSetting("downloadRequiresPayment")}
                    isLoading={isSavingSetting === "downloadRequiresPayment"}
                  />
                  <SettingToggle
                    label="Password Protection"
                    description="Require a password to view the gallery"
                    enabled={settings.passwordProtected}
                    onToggle={() => handleToggleSetting("passwordProtected")}
                    isLoading={isSavingSetting === "passwordProtected"}
                  />

                  {/* Password Input - shows when password protected is enabled */}
                  {settings.passwordProtected && (
                    <div className="ml-8 mt-3 pt-3 border-t border-[var(--card-border)]">
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Gallery Password
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={settings.password || ""}
                            onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                            placeholder="Enter a password for this gallery"
                            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 pr-12 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground transition-colors"
                          >
                            {showPassword ? (
                              <EyeIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={handleSavePassword}
                          disabled={isSavingPassword || !settings.password?.trim()}
                          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingPassword ? "Saving..." : "Save"}
                        </button>
                      </div>

                      {/* Password strength indicator */}
                      {settings.password && (
                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex-1 h-1.5 rounded-full bg-[var(--background-hover)] overflow-hidden">
                              <div
                                className="h-full transition-all duration-300"
                                style={{
                                  width: getPasswordStrength(settings.password).width,
                                  backgroundColor: getPasswordStrength(settings.password).color,
                                }}
                              />
                            </div>
                            <span
                              className="text-xs font-medium"
                              style={{ color: getPasswordStrength(settings.password).color }}
                            >
                              {getPasswordStrength(settings.password).label}
                            </span>
                          </div>
                        </div>
                      )}

                      <p className="mt-2 text-xs text-foreground-muted">
                        Clients will need this password to access the gallery.
                      </p>
                    </div>
                  )}

                  <SettingToggle
                    label="Allow Favorites"
                    description="Let clients mark photos as favorites"
                    enabled={settings.allowFavorites}
                    onToggle={() => handleToggleSetting("allowFavorites")}
                    isLoading={isSavingSetting === "allowFavorites"}
                  />
                  <SettingToggle
                    label="Allow Comments"
                    description="Let clients leave comments on photos"
                    enabled={settings.allowComments}
                    onToggle={() => handleToggleSetting("allowComments")}
                    isLoading={isSavingSetting === "allowComments"}
                  />
                </div>
              </div>

              {/* Client Selections Settings */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Client Selections</h2>
                <p className="text-sm text-foreground-muted mb-4">
                  Allow clients to select and submit their favorite photos for your review.
                </p>
                <div className="space-y-4">
                  <SettingToggle
                    label="Enable Selections"
                    description="Let clients select photos for editing, printing, or albums"
                    enabled={settings.allowSelections}
                    onToggle={() => handleToggleSetting("allowSelections")}
                    isLoading={isSavingSetting === "allowSelections"}
                  />

                  {settings.allowSelections && (
                    <div className="ml-8 pt-3 border-t border-[var(--card-border)]">
                      <label className="block text-sm font-medium text-foreground mb-1.5">
                        Selection Limit
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={settings.selectionLimit ?? ""}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
                            setSettings({ ...settings, selectionLimit: value });
                          }}
                          placeholder="Unlimited"
                          className="w-32 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                        />
                        <button
                          onClick={async () => {
                            setIsSavingSetting("selectionLimit");
                            try {
                              const result = await updateGallery({
                                id: gallery.id,
                                selectionLimit: settings.selectionLimit,
                              });
                              if (result.success) {
                                showToast("Selection limit saved", "success");
                              } else {
                                showToast(result.error || "Failed to save", "error");
                              }
                            } catch {
                              showToast("An error occurred", "error");
                            } finally {
                              setIsSavingSetting(null);
                            }
                          }}
                          disabled={isSavingSetting === "selectionLimit"}
                          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
                        >
                          {isSavingSetting === "selectionLimit" ? "Saving..." : "Save"}
                        </button>
                      </div>
                      <p className="mt-2 text-xs text-foreground-muted">
                        Maximum number of photos a client can select. Leave empty for unlimited.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Download Options */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 id="download-options-heading" className="text-lg font-semibold text-foreground mb-4">Download Options</h2>
                <p id="download-options-desc" className="text-sm text-foreground-muted mb-4">Choose which resolution options are available to clients</p>
                <div
                  role="radiogroup"
                  aria-labelledby="download-options-heading"
                  aria-describedby="download-options-desc"
                  className="space-y-3"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={settings.downloadResolution === "full"}
                    onClick={() => handleSettingsChange({ downloadResolution: "full" })}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                      settings.downloadResolution === "full"
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]/20"
                        : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        settings.downloadResolution === "full"
                          ? "border-[var(--primary)] bg-[var(--primary)] shadow-sm shadow-[var(--primary)]/30"
                          : "border-[var(--border-visible)] bg-transparent"
                      )}
                    >
                      {settings.downloadResolution === "full" && (
                        <CheckIcon className="h-3.5 w-3.5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm font-semibold",
                        settings.downloadResolution === "full" ? "text-[var(--primary)]" : "text-foreground"
                      )}>Full Resolution Only</p>
                      <p className="text-xs text-foreground-muted mt-0.5">Clients can only download original full-res files</p>
                    </div>
                    {settings.downloadResolution === "full" && (
                      <span className="shrink-0 rounded-full bg-[var(--primary)] px-2.5 py-1 text-xs font-medium text-white">Active</span>
                    )}
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={settings.downloadResolution === "web"}
                    onClick={() => handleSettingsChange({ downloadResolution: "web" })}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                      settings.downloadResolution === "web"
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]/20"
                        : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        settings.downloadResolution === "web"
                          ? "border-[var(--primary)] bg-[var(--primary)] shadow-sm shadow-[var(--primary)]/30"
                          : "border-[var(--border-visible)] bg-transparent"
                      )}
                    >
                      {settings.downloadResolution === "web" && (
                        <CheckIcon className="h-3.5 w-3.5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm font-semibold",
                        settings.downloadResolution === "web" ? "text-[var(--primary)]" : "text-foreground"
                      )}>Web Resolution Only</p>
                      <p className="text-xs text-foreground-muted mt-0.5">Optimized for web sharing (2048px max)</p>
                    </div>
                    {settings.downloadResolution === "web" && (
                      <span className="shrink-0 rounded-full bg-[var(--primary)] px-2.5 py-1 text-xs font-medium text-white">Active</span>
                    )}
                  </button>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={settings.downloadResolution === "both"}
                    onClick={() => handleSettingsChange({ downloadResolution: "both" })}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all",
                      settings.downloadResolution === "both"
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 ring-2 ring-[var(--primary)]/20"
                        : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)]"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        settings.downloadResolution === "both"
                          ? "border-[var(--primary)] bg-[var(--primary)] shadow-sm shadow-[var(--primary)]/30"
                          : "border-[var(--border-visible)] bg-transparent"
                      )}
                    >
                      {settings.downloadResolution === "both" && (
                        <CheckIcon className="h-3.5 w-3.5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm font-semibold",
                        settings.downloadResolution === "both" ? "text-[var(--primary)]" : "text-foreground"
                      )}>Both Options</p>
                      <p className="text-xs text-foreground-muted mt-0.5">Let clients choose between full-res or web resolution</p>
                    </div>
                    {settings.downloadResolution === "both" && (
                      <span className="shrink-0 rounded-full bg-[var(--primary)] px-2.5 py-1 text-xs font-medium text-white">Active</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Expiration */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Link Expiration</h2>
                <div className="space-y-4">
                  {/* Current status */}
                  {gallery.expiresAt && (
                    <div className={cn(
                      "rounded-lg px-4 py-3",
                      isExpired ? "bg-[var(--error)]/10 border border-[var(--error)]/20" :
                      isExpiringSoon ? "bg-[var(--warning)]/10 border border-[var(--warning)]/20" :
                      "bg-[var(--success)]/10 border border-[var(--success)]/20"
                    )}>
                      <p className={cn(
                        "text-sm font-medium",
                        isExpired ? "text-[var(--error)]" :
                        isExpiringSoon ? "text-[var(--warning)]" :
                        "text-[var(--success)]"
                      )}>
                        {isExpired
                          ? "Gallery has expired"
                          : `Expires ${new Date(gallery.expiresAt).toLocaleDateString()} (${daysUntilExpiration} days)`}
                      </p>
                    </div>
                  )}

                  {/* Quick presets */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Quick Set</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "30 days", days: 30 },
                        { label: "60 days", days: 60 },
                        { label: "90 days", days: 90 },
                        { label: "1 year", days: 365 },
                        { label: "No expiration", days: null },
                      ].map((preset) => {
                        const newDate = preset.days
                          ? new Date(Date.now() + preset.days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                          : null;
                        const isActive = settings.expirationDate === newDate || (!settings.expirationDate && !preset.days);
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={async () => {
                              setSettings(prev => ({ ...prev, expirationDate: newDate }));
                              const result = await updateGallery({
                                id: gallery.id,
                                expiresAt: newDate ? new Date(newDate) : null,
                              });
                              if (result.success) {
                                showToast(preset.days ? `Expiration set to ${preset.label}` : "Expiration removed", "success");
                                router.refresh();
                              } else {
                                showToast(result.error || "Failed to update expiration", "error");
                              }
                            }}
                            className={cn(
                              "rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                              isActive
                                ? "bg-[var(--primary)] text-white"
                                : "border border-[var(--card-border)] bg-[var(--background)] text-foreground hover:border-[var(--border-hover)]"
                            )}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom date picker */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Or set custom date</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={settings.expirationDate || ""}
                        onChange={(e) => setSettings(prev => ({ ...prev, expirationDate: e.target.value || null }))}
                        min={new Date().toISOString().split("T")[0]}
                        className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                      <button
                        onClick={async () => {
                          const result = await updateGallery({
                            id: gallery.id,
                            expiresAt: settings.expirationDate ? new Date(settings.expirationDate) : null,
                          });
                          if (result.success) {
                            showToast("Expiration date saved", "success");
                            router.refresh();
                          } else {
                            showToast(result.error || "Failed to update expiration", "error");
                          }
                        }}
                        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                      >
                        Save
                      </button>
                    </div>
                    <p className="mt-1.5 text-xs text-foreground-muted">
                      After this date, clients will no longer be able to access the gallery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
                  <button
                    onClick={handleCreateInvoice}
                    disabled={isCreatingInvoice}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlusIcon className="h-4 w-4" />
                    {isCreatingInvoice ? "Creating..." : "Create Invoice"}
                  </button>
                </div>

                {invoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <Link
                        key={invoice.id}
                        href={`/invoices/${invoice.id}`}
                        className="flex items-start justify-between gap-4 flex-wrap rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 transition-colors hover:bg-[var(--background-hover)]"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                            invoice.status === "paid" ? "bg-[var(--success)]/10" : "bg-[var(--warning)]/10"
                          )}>
                            <InvoiceIcon className={cn(
                              "h-5 w-5",
                              invoice.status === "paid" ? "text-[var(--success)]" : "text-[var(--warning)]"
                            )} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{invoice.invoiceNumber}</p>
                            <p className="text-xs text-foreground-muted">
                              {invoice.dueDate ? `Due ${new Date(invoice.dueDate).toLocaleDateString()}` : `Created ${new Date(invoice.createdAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{formatCurrency(invoice.amount * 100)}</p>
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                            invoice.status === "paid"
                              ? "bg-[var(--success)]/10 text-[var(--success)]"
                              : invoice.status === "overdue"
                              ? "bg-[var(--error)]/10 text-[var(--error)]"
                              : "bg-[var(--warning)]/10 text-[var(--warning)]"
                          )}>
                            {invoice.status}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center">
                    <InvoiceIcon className="mx-auto h-12 w-12 text-foreground-muted" />
                    <p className="mt-3 text-sm font-medium text-foreground">No invoices yet</p>
                    <p className="mt-1 text-xs text-foreground-muted">Create an invoice to get paid for this gallery</p>
                    <button
                      onClick={handleCreateInvoice}
                      disabled={isCreatingInvoice}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlusIcon className="h-4 w-4" />
                      {isCreatingInvoice ? "Creating..." : "Create Invoice"}
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Reminder */}
              {gallery.status === "pending" && (
                <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--warning)]/10">
                      <AlertIcon className="h-5 w-5 text-[var(--warning)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">Payment Pending</h3>
                      <p className="mt-1 text-sm text-foreground-secondary">
                        The client hasn't paid for this gallery yet. Send a reminder to follow up.
                      </p>
                      <button
                        onClick={handleSendReminder}
                        disabled={isSendingReminder}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[var(--warning)] bg-[var(--warning)]/10 px-4 py-2 text-sm font-medium text-[var(--warning)] transition-colors hover:bg-[var(--warning)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingReminder ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--warning)] border-t-transparent" />
                        ) : (
                          <EmailIcon className="h-4 w-4" />
                        )}
                        {isSendingReminder ? "Sending..." : "Send Payment Reminder"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add-ons Tab */}
          {activeTab === "addons" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Add-on Requests</h2>
                    <p className="text-sm text-foreground-muted mt-1">
                      Manage upsell service requests from clients
                    </p>
                  </div>
                </div>
                <AddonRequestsPanel
                  galleryId={gallery.id}
                  photos={photos.map((p) => ({
                    id: p.id,
                    thumbnailUrl: p.thumbnailUrl,
                    filename: p.filename,
                  }))}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Collections */}
          {activeTab === "photos" && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <CollectionManager
                galleryId={gallery.id}
                selectedCollectionId={selectedCollectionId}
                onCollectionSelect={setSelectedCollectionId}
                photos={photos.map(p => ({ id: p.id, thumbnailUrl: p.thumbnailUrl }))}
              />
            </div>
          )}

          {/* Client Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Client</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
                {(gallery.client.name || "?").charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{gallery.client.name || "Unknown"}</p>
                <p className="text-xs text-foreground-muted">{gallery.client.email}</p>
                {gallery.client.phone && (
                  <p className="text-xs text-foreground-muted">{gallery.client.phone}</p>
                )}
              </div>
            </div>
            <div className="mt-4 auto-grid grid-gap-2 [--grid-min:160px]">
              <button
                onClick={handleEmailClient}
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <EmailIcon className="h-4 w-4" />
                Email
              </button>
              <button
                onClick={handleCallClient}
                className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <PhoneIcon className="h-4 w-4" />
                Call
              </button>
            </div>
            <Link
              href={`/clients/${gallery.client.id}`}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              View Client Profile
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Delivery Readiness Checklist */}
          {gallery.status !== "delivered" && (
            <DeliveryReadinessChecklist
              hasPhotos={photos.length > 0}
              photoCount={photos.length}
              hasClient={!!gallery.client.id}
              clientName={gallery.client.name}
              hasDeliveryLink={!!gallery.deliveryLink}
              hasPrice={gallery.priceCents > 0}
              priceCents={gallery.priceCents}
              onDeliver={handleDeliverGallery}
              isDelivering={isDelivering}
            />
          )}

          {/* Delivery Link */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <h2 className="text-lg font-semibold text-foreground">Delivery Link</h2>
              <button
                onClick={handlePreviewDelivery}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <PreviewIcon className="h-3.5 w-3.5" />
                Preview as Client
              </button>
            </div>
            {gallery.deliveryLink ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-[var(--background)] px-3 py-2 text-sm">
                  <LinkIcon className="h-4 w-4 text-foreground-muted shrink-0" />
                  <span className="truncate text-foreground-secondary">{gallery.deliveryLink}</span>
                </div>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] min-h-[44px]"
                  >
                    <CopyIcon className="h-4 w-4" />
                    Copy Link
                  </button>
                  <button
                    onClick={handleGenerateQR}
                    className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] min-h-[44px]"
                  >
                    <QRIcon className="h-4 w-4" />
                    QR Code
                  </button>
                  <a
                    href={gallery.deliveryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] min-h-[44px]"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    Open Gallery
                  </a>
                </div>
                {gallery.deliveredAt && (
                  <p className="text-xs text-foreground-muted">
                    Delivered on {new Date(gallery.deliveredAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <LinkIcon className="mx-auto h-8 w-8 text-foreground-muted" />
                <p className="mt-2 text-sm text-foreground-muted">No delivery link yet</p>
                <button
                  onClick={handleGenerateLink}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                >
                  Generate Link
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={handleDownloadAll}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <DownloadIcon className="h-4 w-4 text-foreground-muted" />
                Download All Photos
              </button>
              <button
                onClick={handleEmailClient}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <EmailIcon className="h-4 w-4 text-foreground-muted" />
                Email Gallery to Client
              </button>
              <button
                onClick={handleDuplicate}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]"
              >
                <DuplicateIcon className="h-4 w-4 text-foreground-muted" />
                Duplicate Gallery
              </button>
              <button
                onClick={handleAddToProject}
                disabled={isAddingToProject}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                <ProjectIcon className="h-4 w-4 text-foreground-muted" />
                {isAddingToProject ? "Adding..." : "Add to Project"}
              </button>
              <hr className="border-[var(--card-border)]" />
              <button
                onClick={handleDeleteGallery}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
              >
                <TrashIcon className="h-4 w-4" />
                Delete Gallery
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        photos={photos.map((photo) => ({
          ...photo,
          width: photo.width,
          height: photo.height,
          exif: photo.exifData ? {
            camera: photo.exifData.camera as string | undefined,
            lens: photo.exifData.lens as string | undefined,
            aperture: photo.exifData.aperture as string | undefined,
            shutterSpeed: photo.exifData.shutterSpeed as string | undefined,
            iso: photo.exifData.iso as string | undefined,
            focalLength: photo.exifData.focalLength as string | undefined,
            dateTaken: photo.exifData.dateTaken as string | undefined,
          } : null,
        }))}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onDownload={handlePhotoDownload}
        onDelete={handlePhotoDelete}
        isDownloading={isPhotoDownloading}
        isDeleting={isPhotoDeleting}
        showInfo={true}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-foreground mb-2">Delete Gallery</h2>
            <p className="text-sm text-foreground-muted mb-6">
              Are you sure you want to delete &quot;{gallery.name}&quot;? This action cannot be undone.
              All photos and data will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteGallery}
                disabled={isDeleting}
                className="rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Gallery"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {gallery.deliveryLink && (
        <QRCodeModal
          url={gallery.deliveryLink}
          title={gallery.name}
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
        />
      )}

      {/* Comments Panel Slide-over */}
      {showCommentsPanel && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setShowCommentsPanel(false)}
          />

          {/* Panel */}
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform transition-transform">
              <div className="flex h-full flex-col overflow-y-scroll bg-[var(--card)] shadow-xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 flex-wrap border-b border-[var(--card-border)] bg-[var(--card)] px-6 py-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Comments & Feedback</h2>
                    <p className="text-sm text-foreground-muted">{comments.length} comments on this gallery</p>
                  </div>
                  <button
                    onClick={() => setShowCommentsPanel(false)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground"
                  >
                    <CloseIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 px-6 py-4">
                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CommentBubbleIcon className="h-12 w-12 text-foreground-muted" />
                      <h3 className="mt-4 text-sm font-medium text-foreground">No comments yet</h3>
                      <p className="mt-1 text-sm text-foreground-muted">
                        Comments from you and your clients will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className={cn(
                            "rounded-lg p-4",
                            comment.isClient
                              ? "bg-[var(--background)] border border-[var(--card-border)]"
                              : "bg-[var(--primary)]/10 border border-[var(--primary)]/20"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                                  comment.isClient
                                    ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                                    : "bg-[var(--primary)]/10 text-[var(--primary)]"
                                )}
                              >
                                {comment.author.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{comment.author}</p>
                                <p className="text-xs text-foreground-muted">
                                  {comment.isClient ? "Client" : "You"}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs text-foreground-muted">
                              {new Date(comment.timestamp).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-foreground">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* New Comment Input */}
                <div className="sticky bottom-0 border-t border-[var(--card-border)] bg-[var(--card)] px-6 py-4">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-medium text-[var(--primary)]">
                      Y
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment or feedback..."
                        rows={3}
                        className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all resize-none"
                      />
                      <div className="mt-2 flex items-start justify-between gap-4 flex-wrap">
                        <p className="text-xs text-foreground-muted">
                          Press Enter to submit
                        </p>
                        <button
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim()}
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <SendIcon className="h-4 w-4" />
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign to Collection Modal */}
      <AssignToCollectionModal
        open={showAssignCollectionModal}
        onOpenChange={setShowAssignCollectionModal}
        galleryId={gallery.id}
        selectedAssetIds={Array.from(selectedPhotos)}
        onSuccess={(assignedCollectionId) => {
          // Optimistically update the photos state with new collection assignment
          const selectedIds = new Set(selectedPhotos);
          setPhotos((prevPhotos) =>
            prevPhotos.map((photo) =>
              selectedIds.has(photo.id)
                ? { ...photo, collectionId: assignedCollectionId }
                : photo
            )
          );
          setSelectedPhotos(new Set());
          setIsSelectMode(false);
          router.refresh();
        }}
      />

      {/* Photo Comparison Modal */}
      <PhotoComparisonModal
        photos={photos.filter((p) => selectedPhotos.has(p.id)).map((p) => ({
          id: p.id,
          url: p.mediumUrl || p.url,
          thumbnailUrl: p.thumbnailUrl,
          mediumUrl: p.mediumUrl,
          filename: p.filename,
        }))}
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        allPhotos={photos.map((p) => ({
          id: p.id,
          url: p.mediumUrl || p.url,
          thumbnailUrl: p.thumbnailUrl,
          mediumUrl: p.mediumUrl,
          filename: p.filename,
        }))}
      />
    </>
  );
}

// Sortable Photo Item Component for drag-and-drop reordering
interface SortablePhotoItemProps {
  photo: Photo;
  isCover: boolean;
  isFavorite: boolean;
}

function SortablePhotoItem({ photo, isCover, isFavorite }: SortablePhotoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--background)] cursor-grab active:cursor-grabbing",
        isDragging && "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--card)] opacity-90 z-50 shadow-xl"
      )}
      {...attributes}
      {...listeners}
    >
      <img
        src={photo.thumbnailUrl || photo.url}
        alt={photo.filename}
        className="h-full w-full object-cover pointer-events-none"
        draggable={false}
      />
      {/* Cover badge */}
      {isCover && (
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-[var(--primary)] px-2 py-1 text-xs font-medium text-white">
          <StarIcon className="h-3 w-3" />
          Cover
        </div>
      )}
      {/* Favorite badge */}
      {isFavorite && (
        <div className="absolute top-2 right-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--error)] text-white shadow-lg">
          <HeartIcon className="h-4 w-4" filled />
        </div>
      )}
      {/* Drag handle indicator */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="rounded-lg bg-white/90 px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-gray-700">
            <GripIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Drag to reorder</span>
          </div>
        </div>
      </div>
      {/* Position indicator */}
      <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1">
        <p className="text-xs font-medium text-white truncate max-w-[120px]">{photo.filename}</p>
      </div>
    </div>
  );
}

// Sortable List Item Component for list view with drag-and-drop reordering
interface SortableListItemProps {
  photo: Photo;
  index: number;
  isCover: boolean;
  isFavorite: boolean;
  isSelected: boolean;
  isSelectMode: boolean;
  onToggleSelect: () => void;
  onToggleFavorite: () => void;
  onClick: () => void;
}

function SortableListItem({
  photo,
  index,
  isCover,
  isFavorite,
  isSelected,
  isSelectMode,
  onToggleSelect,
  onToggleFavorite,
  onClick,
}: SortableListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
        isDragging
          ? "bg-[var(--primary)]/10 ring-2 ring-[var(--primary)] z-50 shadow-lg"
          : "hover:bg-[var(--background-hover)]",
        isSelected && "bg-[var(--primary)]/5"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded text-foreground-muted hover:text-foreground hover:bg-[var(--background-elevated)] active:cursor-grabbing"
      >
        <GripIcon className="h-4 w-4" />
      </button>

      {/* Thumbnail */}
      <div
        className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-[var(--background)] cursor-pointer"
        onClick={isSelectMode ? onToggleSelect : onClick}
      >
        <img
          src={photo.thumbnailUrl || photo.url}
          alt={photo.filename}
          className="h-full w-full object-cover"
        />
        {isSelectMode && (
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            isSelected ? "bg-[var(--primary)]/30" : "bg-black/20"
          )}>
            <div className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2",
              isSelected
                ? "border-[var(--primary)] bg-[var(--primary)]"
                : "border-white/80 bg-black/30"
            )}>
              {isSelected && <CheckIcon className="h-3 w-3 text-white" />}
            </div>
          </div>
        )}
      </div>

      {/* Filename */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={isSelectMode ? onToggleSelect : onClick}
      >
        <p className="text-sm font-medium text-foreground truncate">{photo.filename}</p>
      </div>

      {/* Status Badges */}
      <div className="w-20 shrink-0 hidden sm:flex items-center justify-center gap-1">
        {isCover && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
            <StarIcon className="h-3 w-3" />
            Cover
          </span>
        )}
        {isFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)]/20 transition-colors"
          >
            <HeartIcon className="h-3.5 w-3.5" filled />
          </button>
        )}
        {!isFavorite && !isSelectMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-foreground-muted hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors opacity-0 group-hover:opacity-100"
          >
            <HeartIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Order Number */}
      <div className="w-24 shrink-0 text-right hidden md:block">
        <span className="inline-flex items-center justify-center rounded-full bg-[var(--background-elevated)] px-2.5 py-0.5 text-xs font-medium text-foreground-muted">
          #{index + 1}
        </span>
      </div>
    </div>
  );
}

// Setting Toggle Component
interface SettingToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  isLoading?: boolean;
}

function SettingToggle({ label, description, enabled, onToggle, isLoading }: SettingToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap py-2">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-foreground-muted">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {isLoading && (
          <span className="text-xs text-foreground-muted animate-pulse">Saving...</span>
        )}
        <button
          onClick={onToggle}
          disabled={isLoading}
          aria-label={`${enabled ? "Disable" : "Enable"} ${label}`}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)]",
            enabled ? "bg-[var(--primary)]" : "bg-[var(--background-hover)]",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              enabled ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </div>
    </div>
  );
}

// Delivery Readiness Checklist Component
interface DeliveryReadinessChecklistProps {
  hasPhotos: boolean;
  photoCount: number;
  hasClient: boolean;
  clientName: string;
  hasDeliveryLink: boolean;
  hasPrice: boolean;
  priceCents: number;
  onDeliver: () => void;
  isDelivering: boolean;
}

function DeliveryReadinessChecklist({
  hasPhotos,
  photoCount,
  hasClient,
  clientName,
  hasDeliveryLink,
  hasPrice,
  priceCents,
  onDeliver,
  isDelivering,
}: DeliveryReadinessChecklistProps) {
  const checklistItems = [
    {
      id: "photos",
      label: "Photos uploaded",
      description: hasPhotos ? `${photoCount} photo${photoCount !== 1 ? "s" : ""} ready` : "Upload at least one photo",
      isComplete: hasPhotos,
      isRequired: true,
    },
    {
      id: "client",
      label: "Client assigned",
      description: hasClient ? clientName : "Assign a client to this gallery",
      isComplete: hasClient,
      isRequired: true,
    },
    {
      id: "link",
      label: "Delivery link generated",
      description: hasDeliveryLink ? "Link ready to share" : "Generate a delivery link below",
      isComplete: hasDeliveryLink,
      isRequired: true,
    },
    {
      id: "price",
      label: "Gallery price set",
      description: hasPrice ? `$${(priceCents / 100).toFixed(2)}` : "Optional - Set a price for pay-to-unlock",
      isComplete: hasPrice,
      isRequired: false,
    },
  ];

  const requiredComplete = checklistItems.filter((item) => item.isRequired && item.isComplete).length;
  const requiredTotal = checklistItems.filter((item) => item.isRequired).length;
  const isReadyToDeliver = requiredComplete === requiredTotal;
  const progress = Math.round((requiredComplete / requiredTotal) * 100);

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Delivery Checklist</h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            {isReadyToDeliver ? "Ready to deliver!" : `${requiredComplete}/${requiredTotal} required items complete`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 rounded-full bg-[var(--background-hover)] overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                isReadyToDeliver ? "bg-[var(--success)]" : "bg-[var(--primary)]"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-foreground-muted">{progress}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {checklistItems.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
              item.isComplete
                ? "bg-[var(--success)]/5"
                : item.isRequired
                ? "bg-[var(--warning)]/5"
                : "bg-[var(--background)]"
            )}
          >
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5",
                item.isComplete
                  ? "bg-[var(--success)] text-white"
                  : item.isRequired
                  ? "border-2 border-[var(--warning)] text-[var(--warning)]"
                  : "border-2 border-[var(--foreground-muted)] text-foreground-muted"
              )}
            >
              {item.isComplete ? (
                <CheckIcon className="h-3 w-3" />
              ) : (
                <span className="text-[10px] font-bold">{item.isRequired ? "!" : "?"}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-sm font-medium",
                  item.isComplete ? "text-foreground" : "text-foreground-secondary"
                )}>
                  {item.label}
                </p>
                {!item.isRequired && (
                  <span className="rounded-full bg-[var(--background-hover)] px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted">
                    Optional
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground-muted truncate">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Deliver Button */}
      <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
        <button
          onClick={onDeliver}
          disabled={!isReadyToDeliver || isDelivering}
          className={cn(
            "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
            isReadyToDeliver
              ? "bg-[var(--success)] text-white hover:bg-[var(--success)]/90"
              : "bg-[var(--background-hover)] text-foreground-muted cursor-not-allowed"
          )}
        >
          {isDelivering ? (
            <>
              <DeliveryLoadingSpinner />
              Delivering...
            </>
          ) : (
            <>
              <SendIcon className="h-4 w-4" />
              {isReadyToDeliver ? "Deliver Gallery" : "Complete checklist to deliver"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Loading Spinner Component for Delivery Checklist
function DeliveryLoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
