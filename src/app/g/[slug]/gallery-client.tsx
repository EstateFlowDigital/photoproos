"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PayButton } from "./pay-button";

interface Photo {
  id: string;
  url: string;
  originalUrl: string;
  filename: string;
  width: number;
  height: number;
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
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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

  // Handle wheel zoom
  const handleWheelZoom = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
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

  // Filter photos based on favorites view
  const displayedPhotos = showFavoritesOnly
    ? gallery.photos.filter((p) => favoriteAssetIds.has(p.id))
    : gallery.photos;

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

    try {
      const allAssetIds = gallery.photos.map((p) => p.id);
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
        return;
      }

      // Get the blob and trigger download
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
    } catch (error) {
      console.error("Batch download failed:", error);
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

  const nextSlide = useCallback(() => {
    setSlideshowIndex((prev) => (prev + 1) % slideshowPhotos.length);
  }, [slideshowPhotos.length]);

  const prevSlide = useCallback(() => {
    setSlideshowIndex((prev) => (prev - 1 + slideshowPhotos.length) % slideshowPhotos.length);
  }, [slideshowPhotos.length]);

  const toggleSlideshowPlayPause = useCallback(() => {
    setSlideshowPlaying((prev) => !prev);
  }, []);

  // Slideshow keyboard navigation
  useEffect(() => {
    if (!slideshowActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          stopSlideshow();
          break;
        case "ArrowRight":
        case " ": // Space bar
          e.preventDefault();
          nextSlide();
          break;
        case "ArrowLeft":
          e.preventDefault();
          prevSlide();
          break;
        case "p":
        case "P":
          toggleSlideshowPlayPause();
          break;
        case "t":
        case "T":
          setShowThumbnails((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slideshowActive, stopSlideshow, nextSlide, prevSlide, toggleSlideshowPlayPause]);

  // Slideshow auto-advance
  useEffect(() => {
    if (!slideshowActive || !slideshowPlaying) return;

    const timer = setInterval(() => {
      nextSlide();
    }, slideshowInterval);

    return () => clearInterval(timer);
  }, [slideshowActive, slideshowPlaying, slideshowInterval, nextSlide]);

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  }, [touchStart, touchEnd, nextSlide, prevSlide]);

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

  // Jump to specific slide from thumbnail
  const goToSlide = useCallback((index: number) => {
    setSlideshowIndex(index);
    setSlideshowPlaying(false); // Pause when manually selecting
  }, []);

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
                    <CheckIcon className="h-4 w-4" style={{ color: "#22c55e" }} />
                    <span className="hidden sm:inline" style={{ color: "#22c55e" }}>Copied!</span>
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
          </div>
        </div>
      </div>

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
        {/* Empty state for favorites */}
        {showFavoritesOnly && displayedPhotos.length === 0 && (
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedPhotos.map((photo: Photo) => (
            <div
              key={photo.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer transition-colors duration-300"
              style={{ backgroundColor: colors.cardBg }}
              onClick={() => handleOpenPhotoModal(photo)}
            >
              <img
                src={photo.url}
                alt={photo.filename}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
                  !gallery.isPaid && gallery.price > 0 && gallery.showWatermark && "blur-sm"
                )}
              />

              {/* Comment count badge */}
              {commentCounts[photo.id] > 0 && (
                <div className="absolute top-3 left-3">
                  <span className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                    <ChatIcon className="h-3 w-3" />
                    {commentCounts[photo.id]}
                  </span>
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-medium text-white truncate">{photo.filename}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {gallery.allowFavorites && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(photo.id);
                    }}
                    disabled={isTogglingFavorite === photo.id}
                    className={cn(
                      "rounded-full p-2 transition-colors",
                      favoriteAssetIds.has(photo.id)
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-black/50 text-white hover:bg-black/70"
                    )}
                    title={favoriteAssetIds.has(photo.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <HeartIcon className={cn("h-4 w-4", favoriteAssetIds.has(photo.id) && "fill-current")} />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenPhotoModal(photo);
                  }}
                  className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                  title="Add comment"
                >
                  <ChatIcon className="h-4 w-4" />
                </button>
                {gallery.isPaid && gallery.allowDownload && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadPhoto(photo);
                    }}
                    className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                    title={`Download ${photo.filename}`}
                  >
                    <DownloadIcon className="h-4 w-4" />
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
      </div>

      {/* Photo Detail Modal with Comments */}
      {selectedPhoto && (
        <div
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
                  Double-click or scroll to zoom
                </div>
              )}
            </div>

            {/* Comments Panel */}
            <div
              className="flex w-full flex-col border-t lg:w-80 lg:border-l lg:border-t-0"
              style={{ borderColor: colors.borderColor }}
            >
              <div className="border-b p-4" style={{ borderColor: colors.borderColor }}>
                <h3 className="font-medium">{selectedPhoto.filename}</h3>
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
                          excellent: { bg: "rgba(34, 197, 94, 0.15)", text: "#22c55e", label: "★" },
                          good: { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6", label: "●" },
                          fair: { bg: "rgba(249, 115, 22, 0.15)", text: "#f97316", label: "○" },
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
                        <span style={{ color: "#22c55e" }}>★</span> Excellent (300+ DPI)
                      </span>
                      <span className="flex items-center gap-1">
                        <span style={{ color: "#3b82f6" }}>●</span> Good (200+ DPI)
                      </span>
                      <span className="flex items-center gap-1">
                        <span style={{ color: "#f97316" }}>○</span> Fair (100+ DPI)
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs" style={{ color: colors.mutedColor }}>
                    Resolution too low for standard print sizes
                  </p>
                )}
              </div>

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
                  className="mb-2 w-full rounded-lg border px-3 py-2 text-sm"
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
                  rows={3}
                  className="w-full resize-none rounded-lg border px-3 py-2 text-sm"
                  style={{
                    backgroundColor: colors.bgColor,
                    borderColor: colors.borderColor,
                    color: colors.textColor,
                  }}
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="mt-2 w-full rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmittingComment ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slideshow Modal */}
      {slideshowActive && slideshowPhotos.length > 0 && (
        <div
          className="fixed inset-0 z-[70] bg-black"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Current Photo */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            showThumbnails ? "bottom-24" : "bottom-0"
          )}>
            <img
              src={slideshowPhotos[slideshowIndex]?.originalUrl || slideshowPhotos[slideshowIndex]?.url}
              alt={slideshowPhotos[slideshowIndex]?.filename}
              className="max-h-full max-w-full object-contain transition-opacity duration-500"
            />
          </div>

          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="text-white text-sm font-medium">
              {slideshowIndex + 1} / {slideshowPhotos.length}
            </div>
            <div className="flex items-center gap-2">
              {/* Thumbnail Toggle */}
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={cn(
                  "rounded-lg p-2 text-white transition-colors",
                  showThumbnails ? "bg-white/20" : "bg-white/10 hover:bg-white/20"
                )}
                title="Toggle thumbnails (T)"
              >
                <GridIcon className="h-5 w-5" />
              </button>
              {/* Speed Controls */}
              <select
                value={slideshowInterval}
                onChange={(e) => setSlideshowInterval(Number(e.target.value))}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
                title="Slide duration"
              >
                <option value={2000}>2s</option>
                <option value={3000}>3s</option>
                <option value={4000}>4s</option>
                <option value={5000}>5s</option>
                <option value={8000}>8s</option>
              </select>
              <button
                onClick={stopSlideshow}
                className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                title="Exit slideshow (ESC)"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className={cn(
            "absolute left-0 right-0 flex items-center justify-center gap-4 p-6 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300",
            showThumbnails ? "bottom-24" : "bottom-0"
          )}>
            {/* Previous */}
            <button
              onClick={prevSlide}
              className="rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
              title="Previous (←)"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={toggleSlideshowPlayPause}
              className="rounded-full bg-white/20 p-4 text-white hover:bg-white/30 transition-colors"
              title={slideshowPlaying ? "Pause (P)" : "Play (P)"}
            >
              {slideshowPlaying ? (
                <GalleryPauseIcon className="h-8 w-8" />
              ) : (
                <PlayIcon className="h-8 w-8" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextSlide}
              className="rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
              title="Next (→)"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className={cn(
            "absolute left-0 right-0 h-1 bg-white/10 transition-all duration-300",
            showThumbnails ? "bottom-24" : "bottom-0"
          )}>
            <div
              className="h-full bg-white/60 transition-all duration-300"
              style={{ width: `${((slideshowIndex + 1) / slideshowPhotos.length) * 100}%` }}
            />
          </div>

          {/* Photo filename */}
          <div className={cn(
            "absolute left-0 right-0 text-center transition-all duration-300",
            showThumbnails ? "bottom-[7.5rem]" : "bottom-20"
          )}>
            <p className="text-white/70 text-sm">{slideshowPhotos[slideshowIndex]?.filename}</p>
          </div>

          {/* Thumbnail Strip */}
          {showThumbnails && (
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-black/80 backdrop-blur-sm border-t border-white/10">
              <div className="h-full flex items-center overflow-x-auto px-4 gap-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                {slideshowPhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => goToSlide(index)}
                    className={cn(
                      "flex-shrink-0 h-16 w-24 rounded-lg overflow-hidden transition-all duration-200",
                      index === slideshowIndex
                        ? "ring-2 ring-white ring-offset-2 ring-offset-black opacity-100"
                        : "opacity-50 hover:opacity-80"
                    )}
                  >
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard hints */}
          <div className={cn(
            "absolute right-4 text-white/40 text-xs hidden sm:block transition-all duration-300",
            showThumbnails ? "bottom-28" : "bottom-4"
          )}>
            ← → Navigate • Space Next • P Play/Pause • T Thumbnails • ESC Exit
          </div>

          {/* Swipe hint for mobile */}
          <div className="absolute bottom-28 left-4 text-white/40 text-xs sm:hidden">
            Swipe to navigate
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
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
              <h3 className="text-xl font-semibold" style={{ color: colors.textColor }}>
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
                backgroundColor: showLinkCopied ? "#22c55e" : primaryColor,
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
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
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(34, 197, 94, 0.15)" }}>
                  <CheckIcon className="h-8 w-8" style={{ color: "#22c55e" }} />
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
                  <h3 className="text-xl font-semibold" style={{ color: colors.textColor }}>
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

// Icons
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
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

function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} style={style}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
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

function LoadingSpinner({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function ArchiveIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2Z" />
      <path fillRule="evenodd" d="M2 7.5h16l-.811 7.71a2 2 0 0 1-1.99 1.79H4.802a2 2 0 0 1-1.99-1.79L2 7.5Zm5.22 1.72a.75.75 0 0 1 1.06 0L10 10.94l1.72-1.72a.75.75 0 1 1 1.06 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902.848.137 1.705.248 2.57.331v3.443a.75.75 0 0 0 1.28.53l3.58-3.579a.78.78 0 0 1 .527-.224 41.202 41.202 0 0 0 5.183-.5c1.437-.232 2.43-1.49 2.43-2.903V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2Z" clipRule="evenodd" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function PrintIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} style={style}>
      <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0 1 18 8.653v4.097A2.25 2.25 0 0 1 15.75 15h-.241l.305 1.984A1.75 1.75 0 0 1 14.084 19H5.915a1.75 1.75 0 0 1-1.73-2.016L4.492 15H4.25A2.25 2.25 0 0 1 2 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.749-.107 1.126-.153V2.75Zm1.5 0v3.37a42.21 42.21 0 0 1 7 0V2.75a.25.25 0 0 0-.25-.25h-6.5a.25.25 0 0 0-.25.25Zm-1.274 8.5H4.25a.75.75 0 0 1-.75-.75V8.653c0-.339.239-.639.577-.694a40.726 40.726 0 0 1 11.846 0c.338.055.577.355.577.694v1.847a.75.75 0 0 1-.75.75h-.974l-.25 1.622a40.702 40.702 0 0 1-9.452 0l-.25-1.622Zm.855 2.078a39.14 39.14 0 0 0 7.838 0l.42 2.734a.25.25 0 0 1-.247.288H5.915a.25.25 0 0 1-.247-.288l.413-2.734Z" clipRule="evenodd" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
    </svg>
  );
}

function GalleryPauseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M5.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75A.75.75 0 0 0 7.25 3h-1.5ZM12.75 3a.75.75 0 0 0-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V3.75a.75.75 0 0 0-.75-.75h-1.5Z" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
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

function GridIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
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

function QRCodeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.75 2A1.75 1.75 0 0 0 2 3.75v3.5C2 8.216 2.784 9 3.75 9h3.5A1.75 1.75 0 0 0 9 7.25v-3.5A1.75 1.75 0 0 0 7.25 2h-3.5ZM3.5 3.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM3.75 11A1.75 1.75 0 0 0 2 12.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 9 16.25v-3.5A1.75 1.75 0 0 0 7.25 11h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM12.75 2A1.75 1.75 0 0 0 11 3.75v3.5c0 .966.784 1.75 1.75 1.75h3.5A1.75 1.75 0 0 0 18 7.25v-3.5A1.75 1.75 0 0 0 16.25 2h-3.5Zm-.25 1.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5ZM11 12.75c0-.41.34-.75.75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.25-.75a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 .75-.75v-1a.75.75 0 0 0-1.5 0v.25h-.25ZM11 15.25a.75.75 0 0 1 .75-.75h.25v-.25a.75.75 0 0 1 1.5 0v1c0 .41-.34.75-.75.75h-1a.75.75 0 0 1-.75-.75Zm4.25-.75a.75.75 0 0 0-.75.75v1.75c0 .41.34.75.75.75h2a.75.75 0 0 0 0-1.5H16v-1a.75.75 0 0 0-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

// QR Code SVG Generator Component
// Uses a simple algorithm to generate QR codes client-side
function QRCodeSVG({
  url,
  size = 200,
  bgColor = "#ffffff",
  fgColor = "#000000",
}: {
  url: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
}) {
  // Simple QR code generation using Google Charts API as fallback
  // For a production app, you'd use a proper QR code library like 'qrcode'
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=${bgColor.replace("#", "")}&color=${fgColor.replace("#", "")}`;

  return (
    <img
      src={qrUrl}
      alt="QR Code"
      width={size}
      height={size}
      style={{ display: "block" }}
    />
  );
}

// Social Media Icons
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
      <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
    </svg>
  );
}

function ZoomInIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" />
      <path d="M9 5.75a.75.75 0 0 1 .75.75v2h2a.75.75 0 0 1 0 1.5h-2v2a.75.75 0 0 1-1.5 0v-2h-2a.75.75 0 0 1 0-1.5h2v-2A.75.75 0 0 1 9 5.75Z" />
    </svg>
  );
}

function ZoomOutIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" />
      <path d="M6.25 8.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Z" />
    </svg>
  );
}

function ResetIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.389Zm-11.23-3.461a.75.75 0 0 0 1.449.388 5.5 5.5 0 0 1 9.201-2.466l.311.311H12.61a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .75-.75V2.704a.75.75 0 0 0-1.5 0v2.43l-.311-.31a7 7 0 0 0-11.712 3.139Z" clipRule="evenodd" />
    </svg>
  );
}

function FeedbackIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2c-2.236 0-4.43.18-6.57.524C1.993 2.755 1 4.014 1 5.426v5.148c0 1.413.993 2.67 2.43 2.902 1.168.188 2.352.327 3.55.414.28.02.521.18.642.413l1.713 3.293a.75.75 0 0 0 1.33 0l1.713-3.293a.783.783 0 0 1 .642-.413 41.102 41.102 0 0 0 3.55-.414c1.437-.231 2.43-1.49 2.43-2.902V5.426c0-1.413-.993-2.67-2.43-2.902A41.289 41.289 0 0 0 10 2ZM6.75 6a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 2.5a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
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
