"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PayButton } from "./pay-button";
import { SlideshowViewer } from "@/components/gallery/slideshow-viewer";
import {
  HeartIcon,
  DownloadIcon,
  LockIcon,
  PhotoIcon,
  CheckIcon,
  EyeIcon,
  LoadingSpinner,
  ArchiveIcon,
  ChatIcon,
  CloseIcon,
  PrintIcon,
  PlayIcon,
  GalleryPauseIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GridIcon,
  LinkIcon,
  QRCodeIcon,
  QRCodeSVG,
  FacebookIcon,
  XIcon,
  PinterestIcon,
  EmailIcon,
  ZoomInIcon,
  ZoomOutIcon,
  SelectIcon,
  CompareIcon,
  ResetIcon,
  FeedbackIcon,
  ClockIcon,
  CameraIcon,
  ChevronDownIcon,
  StarIcon,
} from "./gallery-icons";

interface ExifData {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: string;
  focalLength?: string;
  dateTaken?: string;
}

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  originalUrl: string;
  filename: string;
  width: number;
  height: number;
  exif?: ExifData;
}

interface Comment {
  id: string;
  assetId: string | null;
  clientName: string | null;
  content: string;
  createdAt: string;
}

interface GalleryData {
  id: string;
  name: string;
  description: string;
  deliverySlug?: string | null;
  photographer: {
    name: string;
    logoUrl: string | null;
    logoLightUrl: string | null;
  };
  status: string;
  price: number;
  isPaid: boolean;
  allowDownload: boolean;
  allowFavorites: boolean;
  showWatermark: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  theme: "light" | "dark" | "auto";
  hidePlatformBranding: boolean;
  isPreview: boolean;
  expiresAt?: string | null;
  photos: Photo[];
}

interface GalleryClientProps {
  gallery: GalleryData;
  isPreview: boolean;
  formatCurrency: (cents: number) => string;
}

export function GalleryClient({ gallery, isPreview, formatCurrency }: GalleryClientProps) {
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);
  const [favoriteAssetIds, setFavoriteAssetIds] = useState<Set<string>>(new Set());
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Slideshow state
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [slideshowPlaying, setSlideshowPlaying] = useState(true);
  const [slideshowInterval, setSlideshowInterval] = useState(4000); // 4 seconds default

  // Comments state
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoComments, setPhotoComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentName, setCommentName] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  // Sharing state
  const [showLinkCopied, setShowLinkCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Photo zoom state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Feedback widget state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"feedback" | "feature" | "issue">("feedback");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Photo comparison mode
  const [compareMode, setCompareMode] = useState(false);
  const [comparePhotos, setComparePhotos] = useState<Photo[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Client selection list (proofing)
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [showSelectionPanel, setShowSelectionPanel] = useState(false);

  // Keyboard shortcuts help
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  // Download progress
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<"preparing" | "downloading" | "complete" | "error">("preparing");
  const [downloadProgressPercent, setDownloadProgressPercent] = useState(0);

  // Expiration countdown
  const [expirationCountdown, setExpirationCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    expired: boolean;
    expiresSoon: boolean; // Less than 7 days
  } | null>(null);

  // EXIF data display
  const [showExifInfo, setShowExifInfo] = useState(false);

  // Photo ratings
  const [photoRatings, setPhotoRatings] = useState<Record<string, { average: number; count: number }>>({});
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Calculate expiration countdown
  useEffect(() => {
    if (!gallery.expiresAt) {
      setExpirationCountdown(null);
      return;
    }

    const calculateCountdown = () => {
      const expiresAt = new Date(gallery.expiresAt!);
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setExpirationCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          expired: true,
          expiresSoon: false,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setExpirationCountdown({
        days,
        hours,
        minutes,
        expired: false,
        expiresSoon: days < 7,
      });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [gallery.expiresAt]);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setResolvedTheme(mediaQuery.matches ? "dark" : "light");

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Load favorites on mount
  useEffect(() => {
    if (!gallery.allowFavorites) return;

    const loadFavorites = async () => {
      try {
        const response = await fetch(`/api/gallery/favorite?galleryId=${gallery.id}`);
        if (response.ok) {
          const data = await response.json();
          setFavoriteAssetIds(new Set(data.favoriteAssetIds));
        }
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    };

    loadFavorites();
  }, [gallery.id, gallery.allowFavorites]);

  // Load comment counts on mount
  useEffect(() => {
    const loadCommentCounts = async () => {
      try {
        const response = await fetch(`/api/gallery/comment?galleryId=${gallery.id}`);
        if (response.ok) {
          const data = await response.json();
          // Count comments per asset
          const counts: Record<string, number> = {};
          for (const comment of data.comments) {
            if (comment.assetId) {
              counts[comment.assetId] = (counts[comment.assetId] || 0) + 1;
            }
          }
          setCommentCounts(counts);
        }
      } catch (error) {
        console.error("Failed to load comment counts:", error);
      }
    };

    loadCommentCounts();
  }, [gallery.id]);

  // Load photo ratings on mount
  useEffect(() => {
    const loadRatings = async () => {
      try {
        const response = await fetch(`/api/gallery/rating?galleryId=${gallery.id}`);
        if (response.ok) {
          const data = await response.json();
          setPhotoRatings(data.averages || {});
          setUserRatings(data.userRatings || {});
        }
      } catch (error) {
        console.error("Failed to load ratings:", error);
      }
    };

    loadRatings();
  }, [gallery.id]);

  // Handle photo rating
  const handleRatePhoto = useCallback(async (photoId: string, rating: number) => {
    setIsSubmittingRating(true);
    try {
      const response = await fetch("/api/gallery/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId: gallery.id,
          assetId: photoId,
          rating,
        }),
      });

      if (response.ok) {
        // Update user's rating
        setUserRatings((prev) => ({ ...prev, [photoId]: rating }));
        // Update averages
        setPhotoRatings((prev) => {
          const current = prev[photoId] || { average: 0, count: 0 };
          const wasRated = userRatings[photoId] !== undefined;
          const newCount = wasRated ? current.count : current.count + 1;
          const oldTotal = current.average * current.count;
          const newTotal = wasRated
            ? oldTotal - userRatings[photoId] + rating
            : oldTotal + rating;
          return {
            ...prev,
            [photoId]: {
              average: Math.round((newTotal / newCount) * 10) / 10,
              count: newCount,
            },
          };
        });
      }
    } catch (error) {
      console.error("Failed to rate photo:", error);
    } finally {
      setIsSubmittingRating(false);
      setHoverRating(0);
    }
  }, [gallery.id, userRatings]);

  // Load comments for a specific photo
  const loadPhotoComments = useCallback(async (photoId: string) => {
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/gallery/comment?galleryId=${gallery.id}&assetId=${photoId}`);
      if (response.ok) {
        const data = await response.json();
        setPhotoComments(data.comments);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  }, [gallery.id]);

  // Open photo modal with comments
  const handleOpenPhotoModal = useCallback((photo: Photo) => {
    setSelectedPhoto(photo);
    loadPhotoComments(photo.id);
  }, [loadPhotoComments]);

  // Close photo modal
  const handleClosePhotoModal = useCallback(() => {
    setSelectedPhoto(null);
    setPhotoComments([]);
    setNewComment("");
    // Reset zoom state
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 4));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel === 1) {
      // Zoom in to 2x at click position
      setZoomLevel(2);
    } else {
      // Reset zoom
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  // Pan handlers for dragging when zoomed
  const handlePanStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  }, [zoomLevel, panPosition]);

  const handlePanMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      // Limit pan to reasonable bounds
      const maxPan = (zoomLevel - 1) * 200;
      setPanPosition({
        x: Math.max(-maxPan, Math.min(maxPan, newX)),
        y: Math.max(-maxPan, Math.min(maxPan, newY)),
      });
    }
  }, [isDragging, zoomLevel, dragStart]);

  const handlePanEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel zoom - requires Ctrl/Cmd key to prevent accidental zoom
  const handleWheelZoom = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    // Only zoom if Ctrl (Windows/Linux) or Cmd (Mac) is held
    // This prevents accidental zoom when scrolling
    if (!e.ctrlKey && !e.metaKey) {
      return; // Allow normal scroll behavior
    }

    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoomLevel((prev) => {
      const newZoom = Math.max(1, Math.min(4, prev + delta));
      if (newZoom === 1) {
        setPanPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  // Submit feedback
  const handleSubmitFeedback = useCallback(async () => {
    if (!feedbackMessage.trim()) return;

    setIsSubmittingFeedback(true);
    try {
      const response = await fetch("/api/gallery/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId: gallery.id,
          type: feedbackType,
          message: feedbackMessage.trim(),
          clientName: feedbackName.trim() || null,
          clientEmail: feedbackEmail.trim() || null,
        }),
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
        // Reset form after 3 seconds
        setTimeout(() => {
          setShowFeedbackModal(false);
          setFeedbackSubmitted(false);
          setFeedbackMessage("");
          setFeedbackType("feedback");
        }, 3000);
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  }, [gallery.id, feedbackType, feedbackMessage, feedbackName, feedbackEmail]);

  // Comparison mode handlers
  const handleToggleCompareMode = useCallback(() => {
    setCompareMode((prev) => !prev);
    if (compareMode) {
      setComparePhotos([]);
    }
  }, [compareMode]);

  const handleAddToCompare = useCallback((photo: Photo) => {
    setComparePhotos((prev) => {
      if (prev.find((p) => p.id === photo.id)) {
        return prev.filter((p) => p.id !== photo.id);
      }
      if (prev.length >= 2) {
        return [prev[1], photo]; // Replace oldest
      }
      return [...prev, photo];
    });
  }, []);

  const handleOpenCompare = useCallback(() => {
    if (comparePhotos.length === 2) {
      setShowCompareModal(true);
    }
  }, [comparePhotos.length]);

  // Selection mode handlers (proofing)
  const handleToggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev);
    if (selectionMode) {
      setSelectedPhotoIds(new Set());
    }
  }, [selectionMode]);

  const handleTogglePhotoSelection = useCallback((photoId: string) => {
    setSelectedPhotoIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  }, []);

  // Filter photos based on favorites view
  const displayedPhotos = showFavoritesOnly
    ? gallery.photos.filter((p) => favoriteAssetIds.has(p.id))
    : gallery.photos;

  const handleSelectAll = useCallback(() => {
    setSelectedPhotoIds(new Set(displayedPhotos.map((p) => p.id)));
  }, [displayedPhotos]);

  const handleClearSelection = useCallback(() => {
    setSelectedPhotoIds(new Set());
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "?":
          e.preventDefault();
          setShowShortcutsHelp((prev) => !prev);
          break;
        case "Escape":
          if (showShortcutsHelp) setShowShortcutsHelp(false);
          if (showCompareModal) setShowCompareModal(false);
          if (showSelectionPanel) setShowSelectionPanel(false);
          if (selectedPhoto) {
            setSelectedPhoto(null);
            setPhotoComments([]);
            setNewComment("");
            setZoomLevel(1);
            setPanPosition({ x: 0, y: 0 });
          }
          break;
        case "ArrowLeft":
          if (selectedPhoto && displayedPhotos.length > 1) {
            e.preventDefault();
            const currentIndex = displayedPhotos.findIndex(p => p.id === selectedPhoto.id);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : displayedPhotos.length - 1;
            const prevPhoto = displayedPhotos[prevIndex];
            setSelectedPhoto(prevPhoto);
            loadPhotoComments(prevPhoto.id);
            setZoomLevel(1);
            setPanPosition({ x: 0, y: 0 });
            setHoverRating(0);
          }
          break;
        case "ArrowRight":
          if (selectedPhoto && displayedPhotos.length > 1) {
            e.preventDefault();
            const currentIndex = displayedPhotos.findIndex(p => p.id === selectedPhoto.id);
            const nextIndex = currentIndex < displayedPhotos.length - 1 ? currentIndex + 1 : 0;
            const nextPhoto = displayedPhotos[nextIndex];
            setSelectedPhoto(nextPhoto);
            loadPhotoComments(nextPhoto.id);
            setZoomLevel(1);
            setPanPosition({ x: 0, y: 0 });
            setHoverRating(0);
          }
          break;
        case "c":
        case "C":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            handleToggleCompareMode();
          }
          break;
        case "s":
        case "S":
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            handleToggleSelectionMode();
          }
          break;
        case "f":
        case "F":
          if (!e.metaKey && !e.ctrlKey && gallery.allowFavorites) {
            e.preventDefault();
            setShowFavoritesOnly((prev) => !prev);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showShortcutsHelp, showCompareModal, showSelectionPanel, handleToggleCompareMode, handleToggleSelectionMode, gallery.allowFavorites, selectedPhoto, displayedPhotos, loadPhotoComments]);

  // Submit a new comment
  const handleSubmitComment = useCallback(async () => {
    if (!selectedPhoto || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch("/api/gallery/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId: gallery.id,
          assetId: selectedPhoto.id,
          clientName: commentName.trim() || null,
          content: newComment.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add the new comment to the list
        setPhotoComments((prev) => [data.comment, ...prev]);
        // Update comment count
        setCommentCounts((prev) => ({
          ...prev,
          [selectedPhoto.id]: (prev[selectedPhoto.id] || 0) + 1,
        }));
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  }, [gallery.id, selectedPhoto, newComment, commentName]);

  // Toggle favorite on a photo
  const handleToggleFavorite = useCallback(async (photoId: string) => {
    if (isTogglingFavorite) return;

    setIsTogglingFavorite(photoId);

    try {
      const response = await fetch("/api/gallery/favorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId: photoId,
          galleryId: gallery.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFavoriteAssetIds(new Set(data.favoriteAssetIds));
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsTogglingFavorite(null);
    }
  }, [gallery.id, isTogglingFavorite]);

  // Download a single photo
  const handleDownloadPhoto = useCallback(async (photo: Photo) => {
    try {
      // Use the download API route which handles auth and tracking
      const downloadUrl = new URL(`/api/download/${photo.id}`, window.location.origin);
      if (gallery.deliverySlug) {
        downloadUrl.searchParams.set("deliverySlug", gallery.deliverySlug);
      }

      // Create a hidden link and click it to trigger download
      const link = document.createElement("a");
      link.href = downloadUrl.toString();
      link.download = photo.filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }, []);

  // Download all photos
  const handleDownloadAll = useCallback(async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress({ current: 0, total: gallery.photos.length });

    try {
      // Download photos sequentially with a small delay to avoid overwhelming the browser
      for (let i = 0; i < gallery.photos.length; i++) {
        const photo = gallery.photos[i];
        await handleDownloadPhoto(photo);
        setDownloadProgress({ current: i + 1, total: gallery.photos.length });

        // Small delay between downloads
        if (i < gallery.photos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      console.error("Batch download failed:", error);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  }, [gallery.photos, handleDownloadPhoto, isDownloading]);

  // Download favorites as a ZIP file
  const handleDownloadFavoritesAsZip = useCallback(async () => {
    if (isDownloadingZip || favoriteAssetIds.size === 0) return;

    setIsDownloadingZip(true);

    try {
      const response = await fetch("/api/download/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId: gallery.id,
          assetIds: Array.from(favoriteAssetIds),
          deliverySlug: gallery.deliverySlug,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Batch download failed:", error);
        return;
      }

      // Get the blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${gallery.name}-favorites.zip`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Batch download failed:", error);
    } finally {
      setIsDownloadingZip(false);
    }
  }, [gallery.id, gallery.name, favoriteAssetIds, isDownloadingZip]);

  // Download all photos as a ZIP file
  const handleDownloadAllAsZip = useCallback(async () => {
    if (isDownloadingZip) return;

    setIsDownloadingZip(true);
    setDownloadModalVisible(true);
    setDownloadStatus("preparing");
    setDownloadProgressPercent(0);

    try {
      const allAssetIds = gallery.photos.map((p) => p.id);

      // Simulate preparation progress
      setDownloadProgressPercent(10);

      const response = await fetch("/api/download/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId: gallery.id,
          assetIds: allAssetIds,
          deliverySlug: gallery.deliverySlug,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Batch download failed:", error);
        setDownloadStatus("error");
        return;
      }

      setDownloadStatus("downloading");
      setDownloadProgressPercent(30);

      // Get the blob with progress simulation
      const reader = response.body?.getReader();
      const contentLength = +(response.headers.get("Content-Length") || 0);

      if (reader && contentLength) {
        let receivedLength = 0;
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedLength += value.length;
          const percent = Math.round(30 + (receivedLength / contentLength) * 60);
          setDownloadProgressPercent(Math.min(percent, 90));
        }

        const blob = new Blob(chunks as BlobPart[]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${gallery.name}-all-photos.zip`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback for browsers without ReadableStream
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${gallery.name}-all-photos.zip`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      setDownloadProgressPercent(100);
      setDownloadStatus("complete");

      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setDownloadModalVisible(false);
      }, 2000);
    } catch (error) {
      console.error("Batch download failed:", error);
      setDownloadStatus("error");
    } finally {
      setIsDownloadingZip(false);
    }
  }, [gallery.id, gallery.name, gallery.photos, isDownloadingZip]);

  // Get photos for slideshow (respects favorites filter)
  const slideshowPhotos = showFavoritesOnly
    ? gallery.photos.filter((p) => favoriteAssetIds.has(p.id))
    : gallery.photos;

  // Slideshow handlers
  const startSlideshow = useCallback((startIndex: number = 0) => {
    if (slideshowPhotos.length === 0) return;
    setSlideshowIndex(startIndex);
    setSlideshowActive(true);
    setSlideshowPlaying(true);
  }, [slideshowPhotos.length]);

  const stopSlideshow = useCallback(() => {
    setSlideshowActive(false);
    setSlideshowPlaying(false);
  }, []);

  // Prevent body scroll when slideshow is active
  useEffect(() => {
    if (slideshowActive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [slideshowActive]);

  // Touch/swipe handlers for mobile
  const minSwipeDistance = 50;
  const [modalTouchStart, setModalTouchStart] = useState<number | null>(null);
  const [modalTouchEnd, setModalTouchEnd] = useState<number | null>(null);

  // Modal touch handlers for swipe navigation
  const handleModalTouchStart = useCallback((e: React.TouchEvent) => {
    if (zoomLevel > 1) return; // Don't swipe when zoomed in
    setModalTouchEnd(null);
    setModalTouchStart(e.targetTouches[0].clientX);
  }, [zoomLevel]);

  const handleModalTouchMove = useCallback((e: React.TouchEvent) => {
    if (zoomLevel > 1) return;
    setModalTouchEnd(e.targetTouches[0].clientX);
  }, [zoomLevel]);

  const handleModalTouchEnd = useCallback(() => {
    if (!modalTouchStart || !modalTouchEnd || !selectedPhoto || displayedPhotos.length <= 1) return;
    const distance = modalTouchStart - modalTouchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Next photo
      const currentIndex = displayedPhotos.findIndex(p => p.id === selectedPhoto.id);
      const nextIndex = currentIndex < displayedPhotos.length - 1 ? currentIndex + 1 : 0;
      const nextPhoto = displayedPhotos[nextIndex];
      setSelectedPhoto(nextPhoto);
      loadPhotoComments(nextPhoto.id);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
      setHoverRating(0);
    } else if (isRightSwipe) {
      // Previous photo
      const currentIndex = displayedPhotos.findIndex(p => p.id === selectedPhoto.id);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : displayedPhotos.length - 1;
      const prevPhoto = displayedPhotos[prevIndex];
      setSelectedPhoto(prevPhoto);
      loadPhotoComments(prevPhoto.id);
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
      setHoverRating(0);
    }
  }, [modalTouchStart, modalTouchEnd, selectedPhoto, displayedPhotos, loadPhotoComments]);

  // Preload adjacent images for smoother transitions
  useEffect(() => {
    if (!slideshowActive || slideshowPhotos.length === 0) return;

    const preloadImage = (index: number) => {
      if (index >= 0 && index < slideshowPhotos.length) {
        const img = new Image();
        img.src = slideshowPhotos[index]?.originalUrl || slideshowPhotos[index]?.url;
      }
    };

    // Preload next and previous images
    preloadImage((slideshowIndex + 1) % slideshowPhotos.length);
    preloadImage((slideshowIndex - 1 + slideshowPhotos.length) % slideshowPhotos.length);
    // Preload two ahead for very fast clicking
    preloadImage((slideshowIndex + 2) % slideshowPhotos.length);
  }, [slideshowActive, slideshowIndex, slideshowPhotos]);


  // Copy gallery link to clipboard
  const handleCopyLink = useCallback(async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setShowLinkCopied(true);
      setTimeout(() => setShowLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  }, []);

  // Get the gallery URL for QR code
  const getGalleryUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  }, []);

  const getThemeColors = () => {
    if (resolvedTheme === "light") {
      return {
        bgColor: "#ffffff",
        textColor: "#0a0a0a",
        mutedColor: "#6b7280",
        cardBg: "#f3f4f6",
        borderColor: "rgba(0,0,0,0.1)",
      };
    }
    return {
      bgColor: "#0a0a0a",
      textColor: "#ffffff",
      mutedColor: "#a7a7a7",
      cardBg: "#141414",
      borderColor: "rgba(255,255,255,0.1)",
    };
  };

  const colors = getThemeColors();
  const primaryColor = gallery.primaryColor;
  const accentColor = gallery.accentColor;

  // Get the appropriate logo based on theme
  const getLogo = () => {
    if (resolvedTheme === "light" && gallery.photographer.logoLightUrl) {
      return gallery.photographer.logoLightUrl;
    }
    return gallery.photographer.logoUrl;
  };

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: colors.bgColor, color: colors.textColor }}>
      {/* Preview Mode Banner */}
      {isPreview && (
        <div className="sticky top-0 z-[60] bg-amber-500 text-black px-4 py-2 text-center text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <EyeIcon className="h-4 w-4" />
            Preview Mode - This gallery has not been delivered to the client yet
          </span>
        </div>
      )}

      {/* Header */}
      <header
        className={cn("sticky z-50 border-b transition-colors duration-300", isPreview ? "top-[36px]" : "top-0")}
        style={{ backgroundColor: colors.bgColor, borderColor: colors.borderColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Photographer */}
            <div className="flex items-center gap-3">
              {getLogo() ? (
                <img src={getLogo()!} alt={gallery.photographer.name} className="h-8" />
              ) : (
                <span className="text-lg font-semibold">{gallery.photographer.name}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Copy Link Button */}
              <button
                onClick={handleCopyLink}
                className="relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.cardBg,
                  color: colors.textColor,
                }}
                title="Copy gallery link"
              >
                {showLinkCopied ? (
                  <>
                    <CheckIcon className="h-4 w-4" style={{ color: "var(--success)" }} />
                    <span className="hidden sm:inline" style={{ color: "var(--success)" }}>Copied!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </>
                )}
              </button>

              {/* QR Code Button */}
              <button
                onClick={() => setShowQRModal(true)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.cardBg,
                  color: colors.textColor,
                }}
                title="Show QR code"
              >
                <QRCodeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">QR Code</span>
              </button>

              {/* Slideshow Button */}
              {displayedPhotos.length > 0 && (
                <button
                  onClick={() => startSlideshow(0)}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: colors.cardBg,
                    color: colors.textColor,
                  }}
                  title="Start slideshow"
                >
                  <PlayIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Slideshow</span>
                </button>
              )}

              {/* Compare Mode Button */}
              {displayedPhotos.length >= 2 && (
                <button
                  onClick={handleToggleCompareMode}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    compareMode && "ring-2 ring-offset-2"
                  )}
                  style={{
                    backgroundColor: compareMode ? primaryColor : colors.cardBg,
                    color: compareMode ? "#fff" : colors.textColor,
                    ["--tw-ring-color" as string]: primaryColor,
                  }}
                  title="Compare photos (C)"
                >
                  <CompareIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Compare</span>
                  {comparePhotos.length > 0 && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-xs"
                      style={{
                        backgroundColor: compareMode ? "rgba(255,255,255,0.2)" : primaryColor,
                        color: "#fff",
                      }}
                    >
                      {comparePhotos.length}/2
                    </span>
                  )}
                </button>
              )}

              {/* Selection Mode Button */}
              <button
                onClick={handleToggleSelectionMode}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  selectionMode && "ring-2 ring-offset-2"
                )}
                style={{
                  backgroundColor: selectionMode ? primaryColor : colors.cardBg,
                  color: selectionMode ? "#fff" : colors.textColor,
                  ["--tw-ring-color" as string]: primaryColor,
                }}
                title="Select photos (S)"
              >
                <SelectIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Select</span>
                {selectedPhotoIds.size > 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-xs"
                    style={{
                      backgroundColor: selectionMode ? "rgba(255,255,255,0.2)" : primaryColor,
                      color: "#fff",
                    }}
                  >
                    {selectedPhotoIds.size}
                  </span>
                )}
              </button>

              {gallery.allowFavorites && (
                <button
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    showFavoritesOnly && "ring-2 ring-offset-2"
                  )}
                  style={{
                    backgroundColor: showFavoritesOnly ? primaryColor : colors.cardBg,
                    color: showFavoritesOnly ? "#fff" : undefined,
                    ["--tw-ring-color" as string]: primaryColor,
                  }}
                >
                  <HeartIcon className={cn("h-4 w-4", showFavoritesOnly && "fill-current")} />
                  <span className="hidden sm:inline">
                    {showFavoritesOnly ? "Show All" : "Favorites"}
                  </span>
                  {favoriteAssetIds.size > 0 && (
                    <span
                      className="rounded-full px-1.5 py-0.5 text-xs"
                      style={{
                        backgroundColor: showFavoritesOnly ? "rgba(255,255,255,0.2)" : primaryColor,
                        color: "#fff",
                      }}
                    >
                      {favoriteAssetIds.size}
                    </span>
                  )}
                </button>
              )}
              {gallery.isPaid && gallery.allowDownload ? (
                <div className="flex items-center gap-2">
                  {/* Download Favorites button - only show when there are favorites */}
                  {favoriteAssetIds.size > 0 && (
                    <button
                      onClick={handleDownloadFavoritesAsZip}
                      disabled={isDownloadingZip}
                      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: colors.cardBg,
                        color: colors.textColor,
                        border: `1px solid ${colors.borderColor}`,
                      }}
                      title="Download favorites as ZIP"
                    >
                      {isDownloadingZip ? (
                        <LoadingSpinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <ArchiveIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">Favorites</span>
                          <span className="text-xs opacity-70">({favoriteAssetIds.size})</span>
                        </>
                      )}
                    </button>
                  )}
                  {/* Download All button */}
                  <button
                    onClick={handleDownloadAllAsZip}
                    disabled={isDownloadingZip}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                    style={{ backgroundColor: accentColor }}
                  >
                    {isDownloadingZip ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 animate-spin" />
                        Creating ZIP...
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="h-4 w-4" />
                        Download All
                      </>
                    )}
                  </button>
                </div>
              ) : !gallery.isPaid && gallery.price > 0 ? (
                <PayButton
                  galleryId={gallery.id}
                  price={gallery.price}
                  primaryColor={accentColor}
                  variant="header"
                />
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Info */}
      <div className="border-b transition-colors duration-300" style={{ borderColor: colors.borderColor }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">{gallery.name}</h1>
          {gallery.description && <p style={{ color: colors.mutedColor }}>{gallery.description}</p>}
          <div className="mt-4 flex items-center gap-4 text-sm" style={{ color: colors.mutedColor }}>
            <span className="flex items-center gap-1">
              <PhotoIcon className="h-4 w-4" />
              {gallery.photos.length} photos
            </span>
            {gallery.isPaid ? (
              <span className="flex items-center gap-1" style={{ color: accentColor }}>
                <CheckIcon className="h-4 w-4" />
                Paid - Downloads enabled
              </span>
            ) : gallery.price > 0 ? (
              <span className="flex items-center gap-1">
                <LockIcon className="h-4 w-4" />
                {formatCurrency(gallery.price)} to unlock downloads
              </span>
            ) : (
              <span className="flex items-center gap-1" style={{ color: accentColor }}>
                <CheckIcon className="h-4 w-4" />
                Free - Downloads enabled
              </span>
            )}
            {/* Expiration countdown */}
            {expirationCountdown && (
              <span
                className="flex items-center gap-1"
                style={{
                  color: expirationCountdown.expired
                    ? "var(--error)"
                    : expirationCountdown.expiresSoon
                      ? "var(--warning)"
                      : colors.mutedColor,
                }}
              >
                <ClockIcon className="h-4 w-4" />
                {expirationCountdown.expired ? (
                  "Gallery expired"
                ) : expirationCountdown.days > 0 ? (
                  `Expires in ${expirationCountdown.days}d ${expirationCountdown.hours}h`
                ) : expirationCountdown.hours > 0 ? (
                  `Expires in ${expirationCountdown.hours}h ${expirationCountdown.minutes}m`
                ) : (
                  `Expires in ${expirationCountdown.minutes}m`
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expiration Warning Banner */}
      {expirationCountdown && (expirationCountdown.expired || expirationCountdown.expiresSoon) && (
        <div
          className="border-b"
          style={{
            backgroundColor: expirationCountdown.expired
              ? "color-mix(in srgb, var(--error) 10%, transparent)"
              : expirationCountdown.days <= 1
              ? "color-mix(in srgb, var(--error) 10%, transparent)"
              : expirationCountdown.days <= 3
              ? "color-mix(in srgb, var(--warning) 10%, transparent)"
              : "color-mix(in srgb, var(--primary) 10%, transparent)",
            borderColor: expirationCountdown.expired
              ? "color-mix(in srgb, var(--error) 30%, transparent)"
              : expirationCountdown.days <= 1
              ? "color-mix(in srgb, var(--error) 30%, transparent)"
              : expirationCountdown.days <= 3
              ? "color-mix(in srgb, var(--warning) 30%, transparent)"
              : "color-mix(in srgb, var(--primary) 30%, transparent)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ClockIcon
                  className={cn(
                    "h-5 w-5",
                    expirationCountdown.expired || expirationCountdown.days <= 1
                      ? "text-red-500"
                      : expirationCountdown.days <= 3
                      ? "text-orange-500"
                      : "text-blue-500"
                  )}
                />
                <div>
                  {expirationCountdown.expired ? (
                    <p className="font-medium" style={{ color: "var(--error)" }}>
                      This gallery has expired and downloads are no longer available.
                    </p>
                  ) : expirationCountdown.days === 0 ? (
                    <>
                      <p className="font-medium" style={{ color: "var(--error)" }}>
                        This gallery expires today!
                      </p>
                      <p className="text-sm" style={{ color: colors.mutedColor }}>
                        Download your photos before{" "}
                        {new Date(gallery.expiresAt!).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </>
                  ) : expirationCountdown.days === 1 ? (
                    <>
                      <p className="font-medium" style={{ color: "var(--error)" }}>
                        This gallery expires tomorrow!
                      </p>
                      <p className="text-sm" style={{ color: colors.mutedColor }}>
                        Download your photos before{" "}
                        {new Date(gallery.expiresAt!).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </>
                  ) : expirationCountdown.days <= 3 ? (
                    <>
                      <p className="font-medium" style={{ color: "var(--warning)" }}>
                        This gallery expires in {expirationCountdown.days} days
                      </p>
                      <p className="text-sm" style={{ color: colors.mutedColor }}>
                        Download your photos before{" "}
                        {new Date(gallery.expiresAt!).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium" style={{ color: "var(--primary)" }}>
                        This gallery expires in {expirationCountdown.days} days
                      </p>
                      <p className="text-sm" style={{ color: colors.mutedColor }}>
                        Expires on{" "}
                        {new Date(gallery.expiresAt!).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </>
                  )}
                </div>
              </div>
              {!gallery.isPaid && gallery.price > 0 && !expirationCountdown.expired && (
                <button
                  onClick={() => {
                    const paymentSection = document.getElementById("payment-section");
                    paymentSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: primaryColor,
                    color: "#ffffff",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = "0.9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  Purchase Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Banner (if not paid) */}
      {!gallery.isPaid && gallery.price > 0 && (
        <div
          className="border-b"
          style={{
            backgroundColor: `${primaryColor}15`,
            borderColor: `${primaryColor}30`,
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: primaryColor }}>
                  Unlock this gallery to download your photos
                </p>
                <p className="text-sm" style={{ color: colors.mutedColor }}>
                  One-time payment of {formatCurrency(gallery.price)} for full access
                </p>
              </div>
              <PayButton
                galleryId={gallery.id}
                price={gallery.price}
                primaryColor={accentColor}
                variant="banner"
              />
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Empty state for gallery with no photos */}
        {gallery.photos.length === 0 && (
          <div className="text-center py-16">
            <PhotoIcon className="mx-auto h-16 w-16 opacity-20" />
            <h3 className="mt-4 text-xl font-medium">No photos yet</h3>
            <p className="mt-2 max-w-md mx-auto" style={{ color: colors.mutedColor }}>
              This gallery is being prepared. Photos will appear here once they have been uploaded.
            </p>
          </div>
        )}

        {/* Empty state for favorites */}
        {gallery.photos.length > 0 && showFavoritesOnly && displayedPhotos.length === 0 && (
          <div className="text-center py-12">
            <HeartIcon className="mx-auto h-12 w-12 opacity-20" />
            <h3 className="mt-4 text-lg font-medium">No favorites yet</h3>
            <p className="mt-2" style={{ color: colors.mutedColor }}>
              Click the heart icon on any photo to add it to your favorites.
            </p>
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className="mt-4 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
              style={{ backgroundColor: primaryColor, color: "#fff" }}
            >
              View All Photos
            </button>
          </div>
        )}

        {/* Mode instructions */}
        {gallery.photos.length > 0 && (compareMode || selectionMode) && (
          <div className="mb-4 rounded-lg p-3" style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30`, border: "1px solid" }}>
            <p className="text-sm" style={{ color: primaryColor }}>
              {compareMode && "Click on two photos to compare them side by side."}
              {selectionMode && "Click photos to select them. Use the selection panel to review your choices."}
            </p>
          </div>
        )}

        {gallery.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {displayedPhotos.map((photo: Photo) => (
            <div
              key={photo.id}
              className={cn(
                "group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer transition-all duration-300",
                comparePhotos.find((p) => p.id === photo.id) && "ring-4",
                selectedPhotoIds.has(photo.id) && "ring-4"
              )}
              style={{
                backgroundColor: colors.cardBg,
                ["--tw-ring-color" as string]: primaryColor,
              }}
              onClick={() => {
                if (compareMode) {
                  handleAddToCompare(photo);
                } else if (selectionMode) {
                  handleTogglePhotoSelection(photo.id);
                } else {
                  handleOpenPhotoModal(photo);
                }
              }}
            >
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.filename}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
                  !gallery.isPaid && gallery.price > 0 && gallery.showWatermark && "blur-sm"
                )}
              />

              {/* Compare mode indicator */}
              {compareMode && (
                <div className="absolute top-3 right-3 z-10">
                  {comparePhotos.find((p) => p.id === photo.id) ? (
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {comparePhotos.findIndex((p) => p.id === photo.id) + 1}
                    </div>
                  ) : (
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-medium"
                      style={{ borderColor: "rgba(255,255,255,0.5)", backgroundColor: "rgba(0,0,0,0.3)", color: "white" }}
                    >
                      +
                    </div>
                  )}
                </div>
              )}

              {/* Selection mode checkbox */}
              {selectionMode && (
                <div className="absolute top-3 right-3 z-10">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded border-2 transition-colors",
                      selectedPhotoIds.has(photo.id)
                        ? "border-transparent"
                        : "border-white/50 bg-black/30"
                    )}
                    style={{
                      backgroundColor: selectedPhotoIds.has(photo.id) ? primaryColor : undefined,
                    }}
                  >
                    {selectedPhotoIds.has(photo.id) && (
                      <CheckIcon className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>
              )}

              {/* Comment count badge */}
              {commentCounts[photo.id] > 0 && !compareMode && !selectionMode && (
                <div className="absolute top-3 left-3">
                  <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                    <ChatIcon className="h-3 w-3" />
                    {commentCounts[photo.id]}
                  </span>
                </div>
              )}

              {/* Overlay - Always visible on mobile for filename */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <p className="text-xs md:text-sm font-medium text-white truncate">{photo.filename}</p>
                </div>
              </div>

              {/* Action Buttons - Always visible on mobile, hover on desktop */}
              <div className="absolute top-2 right-2 md:top-3 md:right-3 flex items-center gap-1.5 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {gallery.allowFavorites && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(photo.id);
                    }}
                    disabled={isTogglingFavorite === photo.id}
                    className={cn(
                      "rounded-full p-2 md:p-2.5 transition-colors min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] flex items-center justify-center",
                      favoriteAssetIds.has(photo.id)
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-black/50 text-white hover:bg-black/70"
                    )}
                    title={favoriteAssetIds.has(photo.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <HeartIcon className={cn("h-4 w-4 md:h-5 md:w-5", favoriteAssetIds.has(photo.id) && "fill-current")} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPhotoModal(photo);
                  }}
                  className="rounded-full bg-black/50 p-2 md:p-2.5 text-white hover:bg-black/70 transition-colors min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] flex items-center justify-center"
                  title="Add comment"
                >
                  <ChatIcon className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                {gallery.isPaid && gallery.allowDownload && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPhoto(photo);
                    }}
                    className="rounded-full bg-black/50 p-2 md:p-2.5 text-white hover:bg-black/70 transition-colors min-w-[40px] min-h-[40px] md:min-w-[44px] md:min-h-[44px] flex items-center justify-center"
                    title={`Download ${photo.filename}`}
                  >
                    <DownloadIcon className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                )}
              </div>

              {/* Lock Icon for unpaid */}
              {!gallery.isPaid && gallery.price > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/50 p-3">
                    <LockIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Photo Detail Modal with Comments */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="photo-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={handleClosePhotoModal}
        >
          <div
            className="relative flex h-[90vh] w-[95vw] max-w-6xl flex-col overflow-hidden rounded-lg lg:flex-row"
            style={{ backgroundColor: colors.cardBg }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClosePhotoModal}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
              aria-label="Close photo detail"
            >
              <CloseIcon className="h-5 w-5" />
            </button>

            {/* Photo with Zoom */}
            <div
              className="relative flex flex-1 items-center justify-center bg-black/20 p-4 overflow-hidden"
              onDoubleClick={handleDoubleClick}
              onMouseDown={handlePanStart}
              onMouseMove={handlePanMove}
              onMouseUp={handlePanEnd}
              onMouseLeave={handlePanEnd}
              onWheel={handleWheelZoom}
              onTouchStart={handleModalTouchStart}
              onTouchMove={handleModalTouchMove}
              onTouchEnd={handleModalTouchEnd}
              style={{ cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in" }}
            >
              <img
                src={selectedPhoto.originalUrl || selectedPhoto.url}
                alt={selectedPhoto.filename}
                className="max-h-full max-w-full object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel}) translate(${panPosition.x / zoomLevel}px, ${panPosition.y / zoomLevel}px)`,
                  pointerEvents: "none",
                }}
                draggable={false}
              />

              {/* Zoom Controls */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg p-1.5" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                  disabled={zoomLevel <= 1}
                  className="rounded p-1.5 text-white transition-colors hover:bg-white/20 disabled:opacity-40"
                  title="Zoom out"
                >
                  <ZoomOutIcon className="h-4 w-4" />
                </button>
                <span className="text-white text-xs font-medium min-w-[40px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                  disabled={zoomLevel >= 4}
                  className="rounded p-1.5 text-white transition-colors hover:bg-white/20 disabled:opacity-40"
                  title="Zoom in"
                >
                  <ZoomInIcon className="h-4 w-4" />
                </button>
                {zoomLevel > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
                    className="rounded p-1.5 text-white transition-colors hover:bg-white/20 ml-1 border-l border-white/20 pl-2"
                    title="Reset zoom"
                  >
                    <ResetIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Zoom hint */}
              {zoomLevel === 1 && (
                <div className="absolute top-4 left-4 text-white/50 text-xs hidden sm:block">
                  Double-click or Ctrl+scroll to zoom
                </div>
              )}

              {/* Navigation Arrows */}
              {displayedPhotos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = displayedPhotos.findIndex(p => p.id === selectedPhoto.id);
                      const prevIndex = currentIndex > 0 ? currentIndex - 1 : displayedPhotos.length - 1;
                      const prevPhoto = displayedPhotos[prevIndex];
                      setSelectedPhoto(prevPhoto);
                      loadPhotoComments(prevPhoto.id);
                      setZoomLevel(1);
                      setPanPosition({ x: 0, y: 0 });
                      setHoverRating(0);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors"
                    title="Previous photo"
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = displayedPhotos.findIndex(p => p.id === selectedPhoto.id);
                      const nextIndex = currentIndex < displayedPhotos.length - 1 ? currentIndex + 1 : 0;
                      const nextPhoto = displayedPhotos[nextIndex];
                      setSelectedPhoto(nextPhoto);
                      loadPhotoComments(nextPhoto.id);
                      setZoomLevel(1);
                      setPanPosition({ x: 0, y: 0 });
                      setHoverRating(0);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition-colors"
                    title="Next photo"
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>

            {/* Comments Panel */}
            <div
              className="flex w-full flex-col border-t lg:w-80 lg:border-l lg:border-t-0"
              style={{ borderColor: colors.borderColor }}
            >
              <div className="border-b p-4" style={{ borderColor: colors.borderColor }}>
                <h3 id="photo-detail-title" className="font-medium">{selectedPhoto.filename}</h3>
                <p className="mt-1 text-sm" style={{ color: colors.mutedColor }}>
                  {selectedPhoto.width} × {selectedPhoto.height}px
                </p>
              </div>

              {/* Print Size Recommendations */}
              <div className="border-b p-4" style={{ borderColor: colors.borderColor }}>
                <div className="flex items-center gap-2 mb-3">
                  <PrintIcon className="h-4 w-4" style={{ color: primaryColor }} />
                  <span className="text-sm font-medium">Print Sizes</span>
                </div>
                {getPrintSizes(selectedPhoto.width, selectedPhoto.height).length > 0 ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {getPrintSizes(selectedPhoto.width, selectedPhoto.height).map((size) => {
                        const qualityColors = {
                          excellent: { bg: "color-mix(in srgb, var(--success) 15%, transparent)", text: "var(--success)", label: "★" },
                          good: { bg: "color-mix(in srgb, var(--primary) 15%, transparent)", text: "var(--primary)", label: "●" },
                          fair: { bg: "color-mix(in srgb, var(--warning) 15%, transparent)", text: "var(--warning)", label: "○" },
                        };
                        const colors = qualityColors[size.quality];
                        return (
                          <span
                            key={size.label}
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                            title={`${size.quality.charAt(0).toUpperCase() + size.quality.slice(1)} quality at ${size.effectiveDpi} DPI`}
                          >
                            <span>{colors.label}</span>
                            {size.label}
                          </span>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[10px]" style={{ color: colors.mutedColor }}>
                      <span className="flex items-center gap-1">
                        <span style={{ color: "var(--success)" }}>★</span> Excellent (300+ DPI)
                      </span>
                      <span className="flex items-center gap-1">
                        <span style={{ color: "var(--primary)" }}>●</span> Good (200+ DPI)
                      </span>
                      <span className="flex items-center gap-1">
                        <span style={{ color: "var(--warning)" }}>○</span> Fair (100+ DPI)
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs" style={{ color: colors.mutedColor }}>
                    Resolution too low for standard print sizes
                  </p>
                )}
              </div>

              {/* Photo Rating */}
              <div className="border-b p-4" style={{ borderColor: colors.borderColor }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-4 w-4" style={{ color: primaryColor }} />
                    <span className="text-sm font-medium">Rate this photo</span>
                  </div>
                  {photoRatings[selectedPhoto.id] && (
                    <span className="text-xs" style={{ color: colors.mutedColor }}>
                      {photoRatings[selectedPhoto.id].average} avg ({photoRatings[selectedPhoto.id].count} {photoRatings[selectedPhoto.id].count === 1 ? "rating" : "ratings"})
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = (hoverRating || userRatings[selectedPhoto.id] || 0) >= star;
                    return (
                      <button
                        key={star}
                        onClick={() => handleRatePhoto(selectedPhoto.id, star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        disabled={isSubmittingRating}
                        className="p-1 transition-transform hover:scale-110 disabled:opacity-50"
                        title={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                      >
                        <StarIcon
                          className="h-6 w-6 transition-colors"
                          style={{ color: isActive ? "#fbbf24" : colors.mutedColor }}
                          filled={isActive}
                        />
                      </button>
                    );
                  })}
                  {userRatings[selectedPhoto.id] && (
                    <span className="ml-2 text-xs" style={{ color: colors.mutedColor }}>
                      Your rating: {userRatings[selectedPhoto.id]} star{userRatings[selectedPhoto.id] !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* EXIF Data Panel */}
              {selectedPhoto.exif && Object.values(selectedPhoto.exif).some(Boolean) && (
                <div className="border-b p-4" style={{ borderColor: colors.borderColor }}>
                  <button
                    onClick={() => setShowExifInfo(!showExifInfo)}
                    className="flex w-full items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <CameraIcon className="h-4 w-4" style={{ color: primaryColor }} />
                      <span className="text-sm font-medium">Camera Info</span>
                    </div>
                    <ChevronDownIcon
                      className={cn(
                        "h-4 w-4 transition-transform",
                        showExifInfo && "rotate-180"
                      )}
                      style={{ color: colors.mutedColor }}
                    />
                  </button>
                  {showExifInfo && (
                    <div className="mt-3 space-y-2 text-sm">
                      {selectedPhoto.exif.camera && (
                        <div className="flex justify-between">
                          <span style={{ color: colors.mutedColor }}>Camera</span>
                          <span>{selectedPhoto.exif.camera}</span>
                        </div>
                      )}
                      {selectedPhoto.exif.lens && (
                        <div className="flex justify-between">
                          <span style={{ color: colors.mutedColor }}>Lens</span>
                          <span>{selectedPhoto.exif.lens}</span>
                        </div>
                      )}
                      {selectedPhoto.exif.focalLength && (
                        <div className="flex justify-between">
                          <span style={{ color: colors.mutedColor }}>Focal Length</span>
                          <span>{selectedPhoto.exif.focalLength}</span>
                        </div>
                      )}
                      {selectedPhoto.exif.aperture && (
                        <div className="flex justify-between">
                          <span style={{ color: colors.mutedColor }}>Aperture</span>
                          <span>{selectedPhoto.exif.aperture}</span>
                        </div>
                      )}
                      {selectedPhoto.exif.shutterSpeed && (
                        <div className="flex justify-between">
                          <span style={{ color: colors.mutedColor }}>Shutter Speed</span>
                          <span>{selectedPhoto.exif.shutterSpeed}</span>
                        </div>
                      )}
                      {selectedPhoto.exif.iso && (
                        <div className="flex justify-between">
                          <span style={{ color: colors.mutedColor }}>ISO</span>
                          <span>{selectedPhoto.exif.iso}</span>
                        </div>
                      )}
                      {selectedPhoto.exif.dateTaken && (
                        <div className="flex justify-between">
                          <span style={{ color: colors.mutedColor }}>Date Taken</span>
                          <span>{new Date(selectedPhoto.exif.dateTaken).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Comments Header */}
              <div className="border-b p-4" style={{ borderColor: colors.borderColor }}>
                <p className="text-sm font-medium">
                  {photoComments.length} comment{photoComments.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingComments ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner className="h-6 w-6 animate-spin" style={{ color: primaryColor }} />
                  </div>
                ) : photoComments.length === 0 ? (
                  <p className="text-center text-sm" style={{ color: colors.mutedColor }}>
                    No comments yet. Be the first to leave feedback!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {photoComments.map((comment) => (
                      <div key={comment.id} className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {comment.clientName || "Anonymous"}
                          </span>
                          <span style={{ color: colors.mutedColor }}>
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="border-t p-4" style={{ borderColor: colors.borderColor }}>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  disabled={isSubmittingComment}
                  className="mb-2 w-full rounded-lg border px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{
                    backgroundColor: colors.bgColor,
                    borderColor: colors.borderColor,
                    color: colors.textColor,
                  }}
                />
                <textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={isSubmittingComment}
                  rows={3}
                  className="w-full resize-none rounded-lg border px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{
                    backgroundColor: colors.bgColor,
                    borderColor: colors.borderColor,
                    color: colors.textColor,
                  }}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="mt-2 w-full rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmittingComment ? (
                    <>
                      <LoadingSpinner className="h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </button>
              </div>
            </div>

            {/* Filmstrip Navigation */}
            <div
              className="absolute bottom-0 left-0 right-0 border-t py-2 px-4 overflow-x-auto flex gap-2"
              style={{ backgroundColor: colors.cardBg, borderColor: colors.borderColor }}
              onClick={(e) => e.stopPropagation()}
            >
              {displayedPhotos.map((photo, index) => {
                const isSelected = photo.id === selectedPhoto.id;
                return (
                  <button
                    key={photo.id}
                    onClick={() => {
                      setSelectedPhoto(photo);
                      loadPhotoComments(photo.id);
                      setZoomLevel(1);
                      setPanPosition({ x: 0, y: 0 });
                      setHoverRating(0);
                    }}
                    className={cn(
                      "flex-shrink-0 rounded overflow-hidden transition-all",
                      isSelected ? "ring-2 ring-offset-2 opacity-100" : "opacity-60 hover:opacity-100"
                    )}
                    style={{
                      width: 56,
                      height: 42,
                      ["--tw-ring-color" as string]: primaryColor,
                      ["--tw-ring-offset-color" as string]: colors.cardBg,
                    }}
                    title={`${index + 1}. ${photo.filename}`}
                  >
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Slideshow Modal */}
      {slideshowActive && slideshowPhotos.length > 0 && (
        <SlideshowViewer
          photos={slideshowPhotos}
          initialIndex={slideshowIndex}
          isPlaying={slideshowPlaying}
          interval={slideshowInterval}
          onClose={stopSlideshow}
          onIndexChange={setSlideshowIndex}
          onPlayingChange={setSlideshowPlaying}
          onIntervalChange={setSlideshowInterval}
        />
      )}


      {/* QR Code Modal */}
      {showQRModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          className="fixed inset-0 z-[70] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowQRModal(false)}
          />

          {/* Modal Content */}
          <div
            className="relative z-10 w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: colors.cardBg }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close QR code"
            >
              <CloseIcon className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 id="qr-modal-title" className="text-xl font-semibold" style={{ color: colors.textColor }}>
                Share Gallery
              </h3>
              <p className="text-sm mt-1" style={{ color: colors.mutedColor }}>
                Scan to view this gallery
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG
                  url={getGalleryUrl()}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            </div>

            {/* Gallery name */}
            <div className="text-center mb-4">
              <p className="font-medium" style={{ color: colors.textColor }}>
                {gallery.name}
              </p>
              <p className="text-xs mt-1" style={{ color: colors.mutedColor }}>
                by {gallery.photographer.name}
              </p>
            </div>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors mb-4"
              style={{
                backgroundColor: showLinkCopied ? "var(--success)" : primaryColor,
                color: "#fff",
              }}
            >
              {showLinkCopied ? (
                <>
                  <CheckIcon className="h-4 w-4" />
                  Link Copied!
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4" />
                  Copy Gallery Link
                </>
              )}
            </button>

            {/* Social Sharing */}
            <div className="border-t pt-4" style={{ borderColor: colors.borderColor }}>
              <p className="text-xs text-center mb-3" style={{ color: colors.mutedColor }}>
                Share via
              </p>
              <div className="flex items-center justify-center gap-3">
                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getGalleryUrl())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: "#1877F2" }}
                  title="Share on Facebook"
                >
                  <FacebookIcon className="h-5 w-5 text-white" />
                </a>

                {/* Twitter/X */}
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getGalleryUrl())}&text=${encodeURIComponent(`Check out this photo gallery: ${gallery.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: "#000000" }}
                  title="Share on X (Twitter)"
                >
                  <XIcon className="h-5 w-5 text-white" />
                </a>

                {/* Pinterest */}
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(getGalleryUrl())}&description=${encodeURIComponent(`${gallery.name} by ${gallery.photographer.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: "#E60023" }}
                  title="Share on Pinterest"
                >
                  <PinterestIcon className="h-5 w-5 text-white" />
                </a>

                {/* Email */}
                <a
                  href={`mailto:?subject=${encodeURIComponent(`Photo Gallery: ${gallery.name}`)}&body=${encodeURIComponent(`Check out this photo gallery by ${gallery.photographer.name}:\n\n${getGalleryUrl()}`)}`}
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:opacity-80"
                  style={{ backgroundColor: colors.mutedColor }}
                  title="Share via Email"
                >
                  <EmailIcon className="h-5 w-5 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowFeedbackModal(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white shadow-lg transition-all hover:scale-105"
        style={{ backgroundColor: primaryColor }}
        title="Send feedback"
      >
        <FeedbackIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
          className="fixed inset-0 z-[70] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              if (!feedbackSubmitted) {
                setShowFeedbackModal(false);
              }
            }}
          />

          {/* Modal Content */}
          <div
            className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: colors.cardBg }}
          >
            {feedbackSubmitted ? (
              // Success State
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "color-mix(in srgb, var(--success) 15%, transparent)" }}>
                  <CheckIcon className="h-8 w-8" style={{ color: "var(--success)" }} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.textColor }}>
                  Thank you!
                </h3>
                <p className="text-sm" style={{ color: colors.mutedColor }}>
                  Your feedback has been sent to the photographer.
                </p>
              </div>
            ) : (
              <>
                {/* Close button */}
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                  aria-label="Close feedback form"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>

                {/* Header */}
                <div className="mb-6">
                  <h3 id="feedback-modal-title" className="text-xl font-semibold" style={{ color: colors.textColor }}>
                    Send Feedback
                  </h3>
                  <p className="text-sm mt-1" style={{ color: colors.mutedColor }}>
                    Share your thoughts with {gallery.photographer.name}
                  </p>
                </div>

                {/* Feedback Type */}
                <div className="mb-4">
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.textColor }}>
                    Type
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "feedback", label: "Feedback", icon: "💬" },
                      { value: "feature", label: "Feature Request", icon: "✨" },
                      { value: "issue", label: "Report Issue", icon: "🐛" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFeedbackType(type.value as typeof feedbackType)}
                        className={cn(
                          "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                          feedbackType === type.value
                            ? "ring-2 ring-offset-2"
                            : "opacity-70 hover:opacity-100"
                        )}
                        style={{
                          backgroundColor: feedbackType === type.value ? primaryColor : colors.bgColor,
                          color: feedbackType === type.value ? "#fff" : colors.textColor,
                          borderColor: colors.borderColor,
                          ["--tw-ring-color" as string]: primaryColor,
                        }}
                      >
                        <span className="mr-1">{type.icon}</span>
                        <span className="hidden sm:inline">{type.label}</span>
                        <span className="sm:hidden">{type.value === "feature" ? "Feature" : type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name and Email (optional) */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: colors.mutedColor }}>
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={feedbackName}
                      onChange={(e) => setFeedbackName(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{
                        backgroundColor: colors.bgColor,
                        borderColor: colors.borderColor,
                        color: colors.textColor,
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1" style={{ color: colors.mutedColor }}>
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                      style={{
                        backgroundColor: colors.bgColor,
                        borderColor: colors.borderColor,
                        color: colors.textColor,
                      }}
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <label className="text-sm font-medium block mb-2" style={{ color: colors.textColor }}>
                    Message
                  </label>
                  <textarea
                    placeholder={
                      feedbackType === "feedback"
                        ? "Share your thoughts about this gallery..."
                        : feedbackType === "feature"
                        ? "What feature would you like to see?"
                        : "Describe the issue you encountered..."
                    }
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-lg border px-3 py-2 text-sm"
                    style={{
                      backgroundColor: colors.bgColor,
                      borderColor: colors.borderColor,
                      color: colors.textColor,
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitFeedback}
                  disabled={isSubmittingFeedback || !feedbackMessage.trim()}
                  className="w-full rounded-lg px-4 py-3 text-sm font-medium text-white disabled:opacity-50 transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmittingFeedback ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Feedback"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompareModal && comparePhotos.length === 2 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="compare-modal-title"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95"
        >
          {/* Close button */}
          <button
            onClick={() => setShowCompareModal(false)}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            aria-label="Close comparison"
          >
            <CloseIcon className="h-6 w-6" />
          </button>

          {/* Title */}
          <div className="absolute top-4 left-4 text-white">
            <h3 id="compare-modal-title" className="text-lg font-semibold">Compare Photos</h3>
            <p className="text-sm text-white/60">Side by side comparison</p>
          </div>

          {/* Side by side comparison */}
          <div className="flex h-[80vh] w-[95vw] max-w-6xl gap-4">
            {comparePhotos.map((photo) => (
              <div key={photo.id} className="flex-1 flex flex-col">
                <div className="flex-1 relative rounded-lg overflow-hidden bg-black/50">
                  <img
                    src={photo.originalUrl || photo.url}
                    alt={photo.filename}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mt-2 text-center">
                  <p className="text-white font-medium truncate">{photo.filename}</p>
                  <p className="text-white/60 text-sm">{photo.width} × {photo.height}px</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
            <button
              onClick={() => {
                setComparePhotos([]);
                setShowCompareModal(false);
              }}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              Clear Selection
            </button>
            <button
              onClick={() => setShowCompareModal(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Compare floating panel - shows when 2 photos selected */}
      {compareMode && comparePhotos.length === 2 && !showCompareModal && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-lg shadow-xl p-4"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.borderColor}` }}
        >
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {comparePhotos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.filename}
                  className="h-12 w-12 rounded-lg object-cover ring-2 ring-white"
                />
              ))}
            </div>
            <button
              onClick={handleOpenCompare}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* Selection Panel */}
      {selectionMode && selectedPhotoIds.size > 0 && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-lg shadow-xl p-4"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.borderColor}` }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: colors.textColor }}>
                {selectedPhotoIds.size} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="text-xs underline"
                style={{ color: primaryColor }}
              >
                Select all
              </button>
              <button
                onClick={handleClearSelection}
                className="text-xs underline"
                style={{ color: colors.mutedColor }}
              >
                Clear
              </button>
            </div>
            {gallery.isPaid && gallery.allowDownload && (
              <button
                onClick={() => {
                  const assetIds = Array.from(selectedPhotoIds);
                  fetch("/api/download/batch", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      galleryId: gallery.id,
                      assetIds,
                      deliverySlug: gallery.deliverySlug,
                    }),
                  })
                    .then((res) => res.blob())
                    .then((blob) => {
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${gallery.name}-selected.zip`;
                      link.click();
                      window.URL.revokeObjectURL(url);
                    });
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                Download Selected
              </button>
            )}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {showShortcutsHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="shortcuts-modal-title"
          className="fixed inset-0 z-[70] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowShortcutsHelp(false)}
          />
          <div
            className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-6 shadow-2xl"
            style={{ backgroundColor: colors.cardBg }}
          >
            <button
              onClick={() => setShowShortcutsHelp(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              aria-label="Close shortcuts help"
            >
              <CloseIcon className="h-6 w-6" />
            </button>

            <h3 id="shortcuts-modal-title" className="text-xl font-semibold mb-4" style={{ color: colors.textColor }}>
              Keyboard Shortcuts
            </h3>

            <div className="space-y-3">
              {[
                { key: "?", action: "Show/hide this help" },
                { key: "C", action: "Toggle compare mode" },
                { key: "S", action: "Toggle selection mode" },
                { key: "F", action: "Toggle favorites filter" },
                { key: "ESC", action: "Close modals" },
                { key: "← →", action: "Navigate in slideshow" },
                { key: "Space", action: "Next photo in slideshow" },
                { key: "P", action: "Play/pause slideshow" },
                { key: "T", action: "Toggle thumbnails in slideshow" },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: colors.mutedColor }}>{action}</span>
                  <kbd
                    className="px-2 py-1 rounded text-xs font-mono"
                    style={{ backgroundColor: colors.bgColor, color: colors.textColor, border: `1px solid ${colors.borderColor}` }}
                  >
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setShowShortcutsHelp(true)}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
          style={{ backgroundColor: colors.cardBg, color: colors.mutedColor, border: `1px solid ${colors.borderColor}` }}
          title="Keyboard shortcuts"
        >
          <kbd className="font-mono">?</kbd>
          <span className="hidden sm:inline">Shortcuts</span>
        </button>
      </div>

      {/* Download Progress Modal */}
      {downloadModalVisible && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="download-modal-title"
          aria-live="polite"
          className="fixed inset-0 z-[80] flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              if (downloadStatus === "complete" || downloadStatus === "error") {
                setDownloadModalVisible(false);
              }
            }}
          />
          <div
            className="relative z-10 w-full max-w-sm mx-4 rounded-2xl p-6 shadow-2xl text-center"
            style={{ backgroundColor: colors.cardBg }}
          >
            {downloadStatus === "preparing" && (
              <>
                <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  <LoadingSpinner className="h-6 w-6 animate-spin" style={{ color: primaryColor }} />
                </div>
                <h3 id="download-modal-title" className="text-lg font-semibold mb-2" style={{ color: colors.textColor }}>
                  Preparing Download
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.mutedColor }}>
                  Compressing {gallery.photos.length} photos...
                </p>
              </>
            )}

            {downloadStatus === "downloading" && (
              <>
                <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                  <DownloadIcon className="h-6 w-6" style={{ color: primaryColor }} />
                </div>
                <h3 id="download-modal-title" className="text-lg font-semibold mb-2" style={{ color: colors.textColor }}>
                  Downloading
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.mutedColor }}>
                  Your photos are being downloaded...
                </p>
              </>
            )}

            {downloadStatus === "complete" && (
              <>
                <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--success) 20%, transparent)" }}>
                  <CheckIcon className="h-6 w-6" style={{ color: "var(--success)" }} />
                </div>
                <h3 id="download-modal-title" className="text-lg font-semibold mb-2" style={{ color: colors.textColor }}>
                  Download Complete
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.mutedColor }}>
                  Your photos have been downloaded successfully!
                </p>
              </>
            )}

            {downloadStatus === "error" && (
              <>
                <div className="mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--error) 20%, transparent)" }}>
                  <CloseIcon className="h-6 w-6" style={{ color: "var(--error)" }} />
                </div>
                <h3 id="download-modal-title" className="text-lg font-semibold mb-2" style={{ color: colors.textColor }}>
                  Download Failed
                </h3>
                <p className="text-sm mb-4" style={{ color: colors.mutedColor }}>
                  There was an error downloading your photos. Please try again.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDownloadModalVisible(false)}
                    className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: colors.bgColor,
                      color: colors.textColor,
                      border: `1px solid ${colors.borderColor}`
                    }}
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setDownloadModalVisible(false);
                      // Small delay to allow modal to close before reopening
                      setTimeout(() => handleDownloadAllAsZip(), 100);
                    }}
                    className="flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Retry Download
                  </button>
                </div>
              </>
            )}

            {/* Progress bar */}
            {(downloadStatus === "preparing" || downloadStatus === "downloading") && (
              <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: colors.bgColor }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${downloadProgressPercent}%`,
                    backgroundColor: primaryColor,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="border-t py-8 transition-colors duration-300"
        style={{ borderColor: colors.borderColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: colors.mutedColor }}>
              Photos by {gallery.photographer.name}
            </p>
            {!gallery.hidePlatformBranding && (
              <p className="text-sm" style={{ color: colors.mutedColor }}>
                Powered by{" "}
                <Link href="/" className="hover:underline" style={{ color: primaryColor }}>
                  PhotoProOS
                </Link>
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// Standard print sizes in inches (at 300 DPI for photo quality)
const PRINT_SIZES = [
  { label: '4×6"', widthIn: 4, heightIn: 6 },
  { label: '5×7"', widthIn: 5, heightIn: 7 },
  { label: '8×10"', widthIn: 8, heightIn: 10 },
  { label: '11×14"', widthIn: 11, heightIn: 14 },
  { label: '16×20"', widthIn: 16, heightIn: 20 },
  { label: '20×24"', widthIn: 20, heightIn: 24 },
];

function getPrintSizes(widthPx: number, heightPx: number) {
  // Ensure we're working with landscape dimensions for comparison
  const maxDim = Math.max(widthPx, heightPx);
  const minDim = Math.min(widthPx, heightPx);

  return PRINT_SIZES.map((size) => {
    // Calculate required pixels for this print size at 300 DPI
    const requiredMaxPx = Math.max(size.widthIn, size.heightIn) * 300;
    const requiredMinPx = Math.min(size.widthIn, size.heightIn) * 300;

    // Calculate the effective DPI for this print size
    const effectiveDpiMax = maxDim / Math.max(size.widthIn, size.heightIn);
    const effectiveDpiMin = minDim / Math.min(size.widthIn, size.heightIn);
    const effectiveDpi = Math.min(effectiveDpiMax, effectiveDpiMin);

    // Determine quality based on effective DPI
    let quality: "excellent" | "good" | "fair";
    if (effectiveDpi >= 300) {
      quality = "excellent";
    } else if (effectiveDpi >= 200) {
      quality = "good";
    } else {
      quality = "fair";
    }

    return {
      label: size.label,
      quality,
      effectiveDpi: Math.round(effectiveDpi),
    };
  }).filter((size) => size.effectiveDpi >= 100); // Only show sizes that can print at least 100 DPI
}
