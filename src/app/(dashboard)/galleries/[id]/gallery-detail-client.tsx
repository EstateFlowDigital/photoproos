"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ServiceDisplay } from "@/components/dashboard/service-selector";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { useToast } from "@/components/ui/toast";
import { PhotoUploadModal } from "@/components/upload/photo-upload-modal";
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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Photo {
  id: string;
  url: string;
  filename: string;
  isFavorite?: boolean;
  downloads?: number;
  views?: number;
  comments?: PhotoComment[];
  metadata?: PhotoMetadata;
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
  expirationDate: string | null;
  passwordProtected: boolean;
  allowFavorites: boolean;
  allowComments: boolean;
}

interface Gallery {
  id: string;
  name: string;
  description: string;
  client: { name: string; email: string; phone?: string };
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
}

interface GalleryDetailClientProps {
  gallery: Gallery;
}

// Demo activity data
const demoActivity: ActivityItem[] = [
  { id: "a1", type: "created", description: "Gallery created", timestamp: "2024-12-15T10:30:00Z", user: "You" },
  { id: "a2", type: "photos_added", description: "8 photos uploaded", timestamp: "2024-12-15T11:00:00Z", user: "You" },
  { id: "a3", type: "edited", description: "Description updated", timestamp: "2024-12-16T09:15:00Z", user: "You" },
  { id: "a4", type: "delivered", description: "Gallery delivered to client", timestamp: "2024-12-18T14:30:00Z", user: "You" },
  { id: "a5", type: "viewed", description: "Client viewed gallery", timestamp: "2024-12-18T15:00:00Z" },
  { id: "a6", type: "downloaded", description: "Client downloaded 3 photos", timestamp: "2024-12-18T15:10:00Z" },
  { id: "a7", type: "payment", description: "Payment received ($450)", timestamp: "2024-12-18T15:12:00Z" },
];

// Default settings
const defaultSettings: GallerySettings = {
  watermarkEnabled: true,
  allowDownloads: true,
  downloadResolution: "both",
  expirationDate: null,
  passwordProtected: false,
  allowFavorites: true,
  allowComments: false,
};

// Demo analytics data
const demoAnalytics: GalleryAnalytics = {
  totalViews: 127,
  uniqueVisitors: 42,
  totalDownloads: 38,
  photoDownloads: [
    { photoId: "1", count: 12 },
    { photoId: "2", count: 8 },
    { photoId: "3", count: 6 },
  ],
  viewsByDay: [
    { date: "2024-12-18", views: 45 },
    { date: "2024-12-19", views: 32 },
    { date: "2024-12-20", views: 28 },
    { date: "2024-12-21", views: 15 },
    { date: "2024-12-22", views: 7 },
  ],
  avgTimeOnPage: 185, // seconds
  deviceBreakdown: [
    { device: "Desktop", percentage: 58 },
    { device: "Mobile", percentage: 35 },
    { device: "Tablet", percentage: 7 },
  ],
  topPhotos: [
    { photoId: "1", views: 89, downloads: 12 },
    { photoId: "2", views: 67, downloads: 8 },
    { photoId: "3", views: 54, downloads: 6 },
  ],
};

// Demo comments data
const demoComments: PhotoComment[] = [
  { id: "c1", author: "Sarah M.", text: "Love this shot! Can we get a larger print of this one?", timestamp: "2024-12-18T16:30:00Z", isClient: true },
  { id: "c2", author: "You", text: "Absolutely! I'll add print options to your gallery.", timestamp: "2024-12-18T17:00:00Z", isClient: false },
  { id: "c3", author: "Sarah M.", text: "The lighting here is perfect!", timestamp: "2024-12-19T10:15:00Z", isClient: true },
];

type TabType = "photos" | "activity" | "analytics" | "settings" | "invoices";

export function GalleryDetailClient({ gallery }: GalleryDetailClientProps) {
  const { showToast } = useToast();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("photos");
  const [notes, setNotes] = useState(gallery.notes || "");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [settings, setSettings] = useState<GallerySettings>(gallery.settings || defaultSettings);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>(gallery.photos);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(photos[0]?.id || null);
  const [favoritePhotos, setFavoritePhotos] = useState<Set<string>>(new Set());
  const [showCommentsPanel, setShowCommentsPanel] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<"all" | "favorites" | "commented">("all");
  const [isReorderMode, setIsReorderMode] = useState(false);
  const activity = gallery.activity || demoActivity;
  const analytics = gallery.analytics || demoAnalytics;

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      showToast("Photo order updated", "success");
    }
  };

  const toggleReorderMode = () => {
    if (isReorderMode) {
      showToast("Photo order saved", "success");
    }
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

  const handleDeliverGallery = () => {
    showToast("Gallery delivery initiated - this would send to the client", "info");
  };

  const handleAddPhotos = () => {
    setUploadModalOpen(true);
  };

  const handleUploadComplete = (uploadedFiles: File[]) => {
    // In production, this would receive the uploaded photo data from the API
    // For demo, we'll create placeholder entries
    const newPhotos: Photo[] = uploadedFiles.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      filename: file.name,
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    showToast(`${uploadedFiles.length} photo${uploadedFiles.length !== 1 ? "s" : ""} uploaded successfully`, "success");
  };

  const handleDownloadAll = () => {
    showToast("Preparing download of all photos...", "info");
  };

  const handleEmailClient = () => {
    showToast("Opening email composer...", "info");
  };

  const handleDuplicate = () => {
    showToast("Gallery duplicated successfully", "success");
  };

  const handleDeleteGallery = () => {
    showToast("This would show a confirmation dialog", "warning");
  };

  const handleGenerateLink = () => {
    showToast("Delivery link generated successfully", "success");
  };

  const handlePhotoClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handlePhotoDelete = (photo: Photo) => {
    showToast(`Photo "${photo.filename}" deleted`, "success");
    setLightboxOpen(false);
  };

  const handlePhotoDownload = (photo: Photo) => {
    showToast(`Downloading ${photo.filename}...`, "info");
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

  const handleBatchDelete = () => {
    const count = selectedPhotos.size;
    setPhotos((prev) => prev.filter((p) => !selectedPhotos.has(p.id)));
    setSelectedPhotos(new Set());
    setIsSelectMode(false);
    showToast(`${count} photo${count !== 1 ? "s" : ""} deleted`, "success");
  };

  const handleBatchDownload = () => {
    const count = selectedPhotos.size;
    showToast(`Preparing download of ${count} photo${count !== 1 ? "s" : ""}...`, "info");
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

  const handleArchiveGallery = () => {
    showToast("Gallery archived successfully", "success");
  };

  const handleDuplicateGallery = () => {
    showToast("Gallery duplicated - opening copy...", "success");
  };

  const handleExportAnalytics = () => {
    showToast("Exporting analytics report as PDF...", "info");
  };

  const handlePreviewDelivery = () => {
    window.open(`/g/${gallery.id}?preview=true`, "_blank");
    showToast("Opening delivery preview in new tab", "info");
  };

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    showToast("Notes saved successfully", "success");
  };

  const handleToggleSetting = (key: keyof GallerySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast("Setting updated", "success");
  };

  const handleCreateInvoice = () => {
    showToast("Creating invoice from gallery...", "info");
  };

  const handleSendReminder = () => {
    showToast("Payment reminder sent to client", "success");
  };

  const handleCallClient = () => {
    if (gallery.client.phone) {
      window.location.href = `tel:${gallery.client.phone}`;
    } else {
      showToast("No phone number on file", "warning");
    }
  };

  const handleGenerateQR = () => {
    showToast("QR code generated for gallery link", "success");
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "created": return <CreateIcon className="h-4 w-4" />;
      case "edited": return <EditIcon className="h-4 w-4" />;
      case "photos_added": return <PhotoIcon className="h-4 w-4" />;
      case "delivered": return <SendIcon className="h-4 w-4" />;
      case "viewed": return <EyeIcon className="h-4 w-4" />;
      case "downloaded": return <DownloadIcon className="h-4 w-4" />;
      case "payment": return <CreditCardIcon className="h-4 w-4" />;
      case "note": return <NoteIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "delivered": return "text-[var(--success)] bg-[var(--success)]/10";
      case "payment": return "text-[var(--success)] bg-[var(--success)]/10";
      case "viewed": return "text-[var(--primary)] bg-[var(--primary)]/10";
      case "downloaded": return "text-[var(--primary)] bg-[var(--primary)]/10";
      default: return "text-foreground-muted bg-[var(--background)]";
    }
  };

  // Filter and limit photos
  const filteredPhotos = photoFilter === "all"
    ? photos
    : photoFilter === "favorites"
    ? photos.filter(p => favoritePhotos.has(p.id))
    : photos.filter(p => (p.comments?.length || 0) > 0);
  const displayedPhotos = showAllPhotos ? filteredPhotos : filteredPhotos.slice(0, 6);
  const hasMorePhotos = filteredPhotos.length > 6;

  // Expiration warning
  const daysUntilExpiration = gallery.expiresAt
    ? Math.ceil((new Date(gallery.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  const isExpired = daysUntilExpiration !== null && daysUntilExpiration <= 0;

  // Demo invoice data
  const demoInvoices = gallery.status === "delivered" ? [
    { id: "inv-001", number: "INV-2024-001", amount: gallery.priceCents, status: "paid", dueDate: "2024-12-25", paidDate: "2024-12-18" },
  ] : [];

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</p>
              <span className={cn("mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[gallery.status])}>
                {gallery.status.charAt(0).toUpperCase() + gallery.status.slice(1)}
              </span>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Revenue</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {gallery.priceCents > 0 ? formatCurrency(gallery.priceCents) : "Free"}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Views</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{gallery.views}</p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Downloads</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{gallery.downloads}</p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-[var(--card-border)]">
            <nav className="flex gap-6 overflow-x-auto">
              {(["photos", "activity", "analytics", "settings", "invoices"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "relative shrink-0 py-3 text-sm font-medium transition-colors",
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
                  {tab === "analytics" && gallery.status === "delivered" && (
                    <span className="ml-1.5 rounded-full bg-[var(--success)]/10 px-1.5 py-0.5 text-xs text-[var(--success)]">
                      {analytics.totalViews}
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
              <div className="flex items-center justify-between mb-3">
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

          {/* Contracts Section - Coming Soon */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">Contracts</h2>
                <span className="rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--primary)]">
                  Coming Soon
                </span>
              </div>
            </div>
            <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center">
              <ContractIcon className="mx-auto h-12 w-12 text-foreground-muted" />
              <p className="mt-3 text-sm font-medium text-foreground">Contracts & E-Signatures</p>
              <p className="mt-1 text-xs text-foreground-muted max-w-sm mx-auto">
                Soon you'll be able to create and send contracts for client approval directly from this gallery.
              </p>
              <button
                disabled
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)]/50 px-4 py-2 text-sm font-medium text-white cursor-not-allowed"
              >
                <PlusIcon className="h-4 w-4" />
                Create Contract
              </button>
            </div>
          </div>

          {/* Photo Grid */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-foreground">
                  Photos <span className="text-foreground-muted font-normal">({photos.length})</span>
                </h2>
                {isSelectMode && (
                  <span className="text-sm text-foreground-muted">
                    {selectedPhotos.size} selected
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {photos.length > 1 && !isSelectMode && (
                  <button
                    onClick={toggleReorderMode}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
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
                      "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
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
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                  >
                    {selectedPhotos.size === photos.length ? "Deselect All" : "Select All"}
                  </button>
                )}
                {!isSelectMode && !isReorderMode && (
                  <>
                    {hasMorePhotos && !showAllPhotos && (
                      <button
                        onClick={() => setShowAllPhotos(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                      >
                        <GridIcon className="h-4 w-4" />
                        View All
                      </button>
                    )}
                    <button
                      onClick={handleAddPhotos}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
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
              <div className="mb-4 flex items-center justify-between rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/5 px-4 py-3">
                <span className="text-sm font-medium text-foreground">
                  {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? "s" : ""} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBatchFavorite}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <HeartIcon className="h-4 w-4" />
                    Favorite
                  </button>
                  <button
                    onClick={handleSetCover}
                    disabled={selectedPhotos.size !== 1}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <StarIcon className="h-4 w-4" />
                    Set as Cover
                  </button>
                  <button
                    onClick={handleBatchDownload}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="inline-flex items-center gap-2 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-3 py-1.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
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
                {isReorderMode ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={displayedPhotos.map(p => p.id)}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                          src={photo.url}
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
                            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--error)] text-white shadow-lg transition-transform hover:scale-110"
                          >
                            <HeartIcon className="h-4 w-4" filled />
                          </button>
                        )}
                        {/* Selection checkbox */}
                        {isSelectMode && (
                          <div className="absolute top-2 right-2">
                            <div
                              className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors",
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
                              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
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

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-6">
              {/* Notes Section */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <div className="flex items-center justify-between mb-4">
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

              {/* Activity Timeline */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Activity Timeline</h2>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-[var(--card-border)]" />
                  <div className="space-y-4">
                    {activity.map((item, index) => (
                      <div key={item.id} className="relative flex gap-4 pl-10">
                        <div className={cn(
                          "absolute left-2 flex h-5 w-5 items-center justify-center rounded-full",
                          getActivityColor(item.type)
                        )}>
                          {getActivityIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{item.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-foreground-muted">{formatRelativeTime(item.timestamp)}</span>
                            {item.user && (
                              <>
                                <span className="text-foreground-muted">•</span>
                                <span className="text-xs text-foreground-muted">{item.user}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {gallery.status === "delivered" ? (
                <>
                  {/* Analytics Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Gallery Performance</h2>
                      <p className="text-sm text-foreground-muted">
                        Tracking since {new Date(gallery.deliveredAt || gallery.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={handleExportAnalytics}
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                    >
                      <ExportIcon className="h-4 w-4" />
                      Export Report
                    </button>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                          <EyeIcon className="h-4 w-4 text-[var(--primary)]" />
                        </div>
                        <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Total Views</span>
                      </div>
                      <p className="mt-3 text-3xl font-bold text-foreground">{analytics.totalViews}</p>
                      <p className="mt-1 text-xs text-foreground-muted">
                        {analytics.uniqueVisitors} unique visitors
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--success)]/10">
                          <DownloadIcon className="h-4 w-4 text-[var(--success)]" />
                        </div>
                        <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Downloads</span>
                      </div>
                      <p className="mt-3 text-3xl font-bold text-foreground">{analytics.totalDownloads}</p>
                      <p className="mt-1 text-xs text-foreground-muted">
                        {Math.round((analytics.totalDownloads / photos.length) * 100)}% of photos
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--warning)]/10">
                          <ClockIcon className="h-4 w-4 text-[var(--warning)]" />
                        </div>
                        <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Avg. Time</span>
                      </div>
                      <p className="mt-3 text-3xl font-bold text-foreground">
                        {Math.floor(analytics.avgTimeOnPage / 60)}:{(analytics.avgTimeOnPage % 60).toString().padStart(2, "0")}
                      </p>
                      <p className="mt-1 text-xs text-foreground-muted">
                        minutes on gallery
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ai)]/10">
                          <ChartIcon className="h-4 w-4 text-[var(--ai)]" />
                        </div>
                        <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Engagement</span>
                      </div>
                      <p className="mt-3 text-3xl font-bold text-foreground">
                        {Math.round((analytics.totalDownloads / analytics.totalViews) * 100)}%
                      </p>
                      <p className="mt-1 text-xs text-foreground-muted">
                        download rate
                      </p>
                    </div>
                  </div>

                  {/* Views Chart */}
                  <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Views Over Time</h3>
                    <div className="flex items-end gap-2 h-32">
                      {analytics.viewsByDay.map((day, i) => {
                        const maxViews = Math.max(...analytics.viewsByDay.map(d => d.views));
                        const height = (day.views / maxViews) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full bg-[var(--primary)] rounded-t transition-all hover:bg-[var(--primary)]/80"
                              style={{ height: `${height}%` }}
                              title={`${day.views} views`}
                            />
                            <span className="text-xs text-foreground-muted">
                              {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Device Breakdown & Top Photos */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Device Breakdown */}
                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                      <h3 className="text-sm font-semibold text-foreground mb-4">Device Breakdown</h3>
                      <div className="space-y-3">
                        {analytics.deviceBreakdown.map((device) => (
                          <div key={device.device} className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--background)]">
                              {device.device === "Desktop" ? (
                                <DesktopIcon className="h-4 w-4 text-foreground-muted" />
                              ) : device.device === "Mobile" ? (
                                <MobileIcon className="h-4 w-4 text-foreground-muted" />
                              ) : (
                                <TabletIcon className="h-4 w-4 text-foreground-muted" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-foreground">{device.device}</span>
                                <span className="text-sm font-medium text-foreground">{device.percentage}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-[var(--background)]">
                                <div
                                  className="h-full rounded-full bg-[var(--primary)]"
                                  style={{ width: `${device.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Performing Photos */}
                    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                      <h3 className="text-sm font-semibold text-foreground mb-4">Top Performing Photos</h3>
                      <div className="space-y-3">
                        {analytics.topPhotos.slice(0, 3).map((item, i) => {
                          const photo = photos.find(p => p.id === item.photoId) || photos[i];
                          return (
                            <div key={item.photoId} className="flex items-center gap-3">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--background)] text-xs font-medium text-foreground-muted">
                                {i + 1}
                              </span>
                              {photo && (
                                <img
                                  src={photo.url}
                                  alt={photo.filename}
                                  className="h-10 w-14 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {photo?.filename || `Photo ${i + 1}`}
                                </p>
                                <p className="text-xs text-foreground-muted">
                                  {item.views} views • {item.downloads} downloads
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
                  <ChartIcon className="mx-auto h-12 w-12 text-foreground-muted" />
                  <h3 className="mt-4 text-lg font-medium text-foreground">Analytics Available After Delivery</h3>
                  <p className="mt-2 text-sm text-foreground-muted max-w-sm mx-auto">
                    Once you deliver this gallery to your client, you'll be able to track views, downloads, and engagement metrics.
                  </p>
                  <button
                    onClick={handleDeliverGallery}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
                  >
                    <SendIcon className="h-4 w-4" />
                    Deliver Gallery
                  </button>
                </div>
              )}
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
                  />
                  <SettingToggle
                    label="Allow Downloads"
                    description="Let clients download photos from the gallery"
                    enabled={settings.allowDownloads}
                    onToggle={() => handleToggleSetting("allowDownloads")}
                  />
                  <SettingToggle
                    label="Password Protection"
                    description="Require a password to view the gallery"
                    enabled={settings.passwordProtected}
                    onToggle={() => handleToggleSetting("passwordProtected")}
                  />
                  <SettingToggle
                    label="Allow Favorites"
                    description="Let clients mark photos as favorites"
                    enabled={settings.allowFavorites}
                    onToggle={() => handleToggleSetting("allowFavorites")}
                  />
                  <SettingToggle
                    label="Allow Comments"
                    description="Let clients leave comments on photos"
                    enabled={settings.allowComments}
                    onToggle={() => handleToggleSetting("allowComments")}
                  />
                </div>
              </div>

              {/* Download Options */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Download Options</h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="resolution"
                      checked={settings.downloadResolution === "full"}
                      onChange={() => setSettings(prev => ({ ...prev, downloadResolution: "full" }))}
                      className="h-4 w-4 text-[var(--primary)] border-[var(--card-border)] focus:ring-[var(--primary)]"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Full Resolution Only</p>
                      <p className="text-xs text-foreground-muted">Clients can only download full-res files</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="resolution"
                      checked={settings.downloadResolution === "web"}
                      onChange={() => setSettings(prev => ({ ...prev, downloadResolution: "web" }))}
                      className="h-4 w-4 text-[var(--primary)] border-[var(--card-border)] focus:ring-[var(--primary)]"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Web Resolution Only</p>
                      <p className="text-xs text-foreground-muted">Optimized for web (2048px max)</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="resolution"
                      checked={settings.downloadResolution === "both"}
                      onChange={() => setSettings(prev => ({ ...prev, downloadResolution: "both" }))}
                      className="h-4 w-4 text-[var(--primary)] border-[var(--card-border)] focus:ring-[var(--primary)]"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Both Options</p>
                      <p className="text-xs text-foreground-muted">Let clients choose resolution</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Expiration */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Gallery Expiration</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Expiration Date</label>
                    <input
                      type="date"
                      value={settings.expirationDate || ""}
                      onChange={(e) => setSettings(prev => ({ ...prev, expirationDate: e.target.value || null }))}
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                    <p className="mt-1.5 text-xs text-foreground-muted">Leave empty for no expiration</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Invoices</h2>
                  <button
                    onClick={handleCreateInvoice}
                    className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Create Invoice
                  </button>
                </div>

                {demoInvoices.length > 0 ? (
                  <div className="space-y-3">
                    {demoInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
                            <InvoiceIcon className="h-5 w-5 text-[var(--success)]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{invoice.number}</p>
                            <p className="text-xs text-foreground-muted">
                              Paid on {new Date(invoice.paidDate!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">{formatCurrency(invoice.amount)}</p>
                          <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
                            Paid
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-8 text-center">
                    <InvoiceIcon className="mx-auto h-12 w-12 text-foreground-muted" />
                    <p className="mt-3 text-sm font-medium text-foreground">No invoices yet</p>
                    <p className="mt-1 text-xs text-foreground-muted">Create an invoice to get paid for this gallery</p>
                    <button
                      onClick={handleCreateInvoice}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                    >
                      <PlusIcon className="h-4 w-4" />
                      Create Invoice
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Reminder */}
              {gallery.status === "pending" && (
                <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
                      <AlertIcon className="h-5 w-5 text-[var(--warning)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">Payment Pending</h3>
                      <p className="mt-1 text-sm text-foreground-secondary">
                        The client hasn't paid for this gallery yet. Send a reminder to follow up.
                      </p>
                      <button
                        onClick={handleSendReminder}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[var(--warning)] bg-[var(--warning)]/10 px-4 py-2 text-sm font-medium text-[var(--warning)] transition-colors hover:bg-[var(--warning)]/20"
                      >
                        <EmailIcon className="h-4 w-4" />
                        Send Payment Reminder
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Client</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
                {gallery.client.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{gallery.client.name}</p>
                <p className="text-xs text-foreground-muted">{gallery.client.email}</p>
                {gallery.client.phone && (
                  <p className="text-xs text-foreground-muted">{gallery.client.phone}</p>
                )}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
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
              href={`/clients/1`}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              View Client Profile
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Delivery Link */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Link</h2>
            {gallery.deliveryLink ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-[var(--background)] px-3 py-2 text-sm">
                  <LinkIcon className="h-4 w-4 text-foreground-muted shrink-0" />
                  <span className="truncate text-foreground-secondary">{gallery.deliveryLink}</span>
                </div>
                <div className="grid gap-2 grid-cols-3">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <CopyIcon className="h-4 w-4" />
                    Copy
                  </button>
                  <button
                    onClick={handleGenerateQR}
                    className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <QRIcon className="h-4 w-4" />
                    QR
                  </button>
                  <a
                    href={gallery.deliveryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    Open
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
        photos={photos}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onDownload={handlePhotoDownload}
        onDelete={handlePhotoDelete}
      />

      {/* Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        galleryId={gallery.id}
        galleryName={gallery.name}
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
        src={photo.url}
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
        <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--error)] text-white shadow-lg">
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

// Icon Components
function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
    </svg>
  );
}

function ContractIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13ZM13.25 9a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Zm-6.5 4a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-1.5 0v-.5a.75.75 0 0 1 .75-.75Zm4-1.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
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

function ZoomIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" />
      <path d="M9 5.25a.75.75 0 0 1 .75.75v2.25h2.25a.75.75 0 0 1 0 1.5H9.75v2.25a.75.75 0 0 1-1.5 0v-2.25H6a.75.75 0 0 1 0-1.5h2.25V6a.75.75 0 0 1 .75-.75Z" />
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

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
      <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 0 1 2.43 8.326 13.019 13.019 0 0 1 2 5V3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function QRIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.75 2A1.75 1.75 0 0 0 2 3.75v3.5C2 8.216 2.784 9 3.75 9h3.5A1.75 1.75 0 0 0 9 7.25v-3.5A1.75 1.75 0 0 0 7.25 2h-3.5ZM3.5 3.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM3.75 11A1.75 1.75 0 0 0 2 12.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 9 16.25v-3.5A1.75 1.75 0 0 0 7.25 11h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM12.75 2A1.75 1.75 0 0 0 11 3.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 18 7.25v-3.5A1.75 1.75 0 0 0 16.25 2h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM11 12.75c0-.41.336-.75.75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm0 3c0-.41.336-.75.75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm5.25-2.25a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1Z" clipRule="evenodd" />
    </svg>
  );
}

function CreateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 6.75a.75.75 0 0 1 1.5 0v2.25h2.25a.75.75 0 0 1 0 1.5h-2.25v2.25a.75.75 0 0 1-1.5 0v-2.25H7a.75.75 0 0 1 0-1.5h2.25V8.75Z" clipRule="evenodd" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 15.5 2h-11ZM6 6.75A.75.75 0 0 1 6.75 6h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 6.75Zm0 3A.75.75 0 0 1 6.75 9h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 9.75Zm0 3a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 0 1.5h-3.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4Zm12 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm13-1a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM1.75 14.5a.75.75 0 0 0 0 1.5c4.417 0 8.693.603 12.749 1.73 1.111.309 2.251-.512 2.251-1.696v-.784a.75.75 0 0 0-1.5 0v.784a.272.272 0 0 1-.35.25A49.043 49.043 0 0 0 1.75 14.5Z" clipRule="evenodd" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckboxIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h9.5A2.25 2.25 0 0 1 17 4.25v11.5A2.25 2.25 0 0 1 14.75 18h-9.5A2.25 2.25 0 0 1 3 15.75V4.25Zm2.25-.75a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h9.5a.75.75 0 0 0 .75-.75V4.25a.75.75 0 0 0-.75-.75h-9.5Z" clipRule="evenodd" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
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

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function DesktopIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v8.5A2.25 2.25 0 0 1 15.75 15h-3.105a3.501 3.501 0 0 0 1.1 1.677A.75.75 0 0 1 13.26 18H6.74a.75.75 0 0 1-.484-1.323A3.501 3.501 0 0 0 7.355 15H4.25A2.25 2.25 0 0 1 2 12.75v-8.5Zm1.5 0a.75.75 0 0 1 .75-.75h11.5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-.75.75H4.25a.75.75 0 0 1-.75-.75v-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function MobileIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M8 16.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" />
      <path fillRule="evenodd" d="M4 4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V4Zm4-1.5v.75c0 .414.336.75.75.75h2.5a.75.75 0 0 0 .75-.75V2.5h1A1.5 1.5 0 0 1 14.5 4v12a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 16V4A1.5 1.5 0 0 1 7 2.5h1Z" clipRule="evenodd" />
    </svg>
  );
}

function TabletIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M5 1a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V4a3 3 0 0 0-3-3H5Zm5 14.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM3.5 4a1.5 1.5 0 0 1 1.5-1.5h10A1.5 1.5 0 0 1 16.5 4v9a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5V4Z" clipRule="evenodd" />
    </svg>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
      <path fillRule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5ZM7 11a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z" clipRule="evenodd" />
    </svg>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 0 1 .628.74v2.288a2.25 2.25 0 0 1-.659 1.59l-4.682 4.683a2.25 2.25 0 0 0-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 0 1 8 18.25v-5.757a2.25 2.25 0 0 0-.659-1.591L2.659 6.22A2.25 2.25 0 0 1 2 4.629V2.34a.75.75 0 0 1 .628-.74Z" clipRule="evenodd" />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM8 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function GripIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3 7a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 6a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Z" clipRule="evenodd" />
    </svg>
  );
}

// Setting Toggle Component
interface SettingToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function SettingToggle({ label, description, enabled, onToggle }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 pr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-foreground-muted">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)]",
          enabled ? "bg-[var(--primary)]" : "bg-[var(--background-hover)]"
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
  );
}
