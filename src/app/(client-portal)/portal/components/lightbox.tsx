"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { BLUR_DATA_URL } from "./utils";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  filename: string;
  originalUrl?: string;
  width?: number;
  height?: number;
}

interface LightboxProps {
  photos: Photo[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (photo: Photo) => void;
  onToggleFavorite?: (photoId: string) => void;
  favorites?: Set<string>;
  onCompare?: (photos: Photo[]) => void;
  galleryName?: string;
  galleryId?: string; // Needed for ratings API
}

export function Lightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
  onDownload,
  onToggleFavorite,
  favorites = new Set(),
  onCompare,
  galleryName,
  galleryId,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [slideshowPlaying, setSlideshowPlaying] = useState(false);
  const [slideshowInterval, setSlideshowInterval] = useState(4000);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Rating state
  const [photoRatings, setPhotoRatings] = useState<Record<string, { average: number; count: number }>>({});
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [showRatingPanel, setShowRatingPanel] = useState(false);

  const currentPhoto = photos[currentIndex];

  // Reset index when opening with new initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsLoading(true);
      setShowSlideshow(false);
      setSlideshowPlaying(false);
      setShowShareMenu(false);
      setHoverRating(0);
    }
  }, [isOpen, initialIndex]);

  // Load ratings when lightbox opens
  useEffect(() => {
    if (!isOpen || !galleryId) return;

    const loadRatings = async () => {
      try {
        const response = await fetch(`/api/gallery/rating?galleryId=${galleryId}`);
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
  }, [isOpen, galleryId]);

  // Handle photo rating
  const handleRatePhoto = useCallback(async (photoId: string, rating: number) => {
    if (!galleryId) return;

    setIsSubmittingRating(true);
    try {
      const response = await fetch("/api/gallery/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          galleryId,
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
  }, [galleryId, userRatings]);

  // Slideshow auto-advance
  useEffect(() => {
    if (!slideshowPlaying || !showSlideshow) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      setIsLoading(true);
    }, slideshowInterval);

    return () => clearInterval(timer);
  }, [slideshowPlaying, showSlideshow, slideshowInterval, photos.length]);

  // Navigation handlers
  const goToPrevious = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setIsLoading(true);
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "f":
          if (onToggleFavorite && currentPhoto) {
            onToggleFavorite(currentPhoto.id);
          }
          break;
        case "d":
          if (onDownload && currentPhoto) {
            onDownload(currentPhoto);
          }
          break;
        case "s":
          setShowSlideshow((prev) => !prev);
          break;
        case "r":
          if (galleryId) {
            setShowRatingPanel((prev) => !prev);
          }
          break;
        case " ":
          if (showSlideshow) {
            e.preventDefault();
            setSlideshowPlaying((prev) => !prev);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, goToPrevious, goToNext, onToggleFavorite, onDownload, currentPhoto, showSlideshow]);

  // Handle share
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: galleryName || "Photo Gallery",
          text: `Check out this photo: ${currentPhoto?.filename}`,
          url: window.location.href,
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStart(null);
  };

  if (!isOpen || !currentPhoto) return null;

  const isFavorited = favorites.has(currentPhoto.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center gap-4">
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="text-sm text-white/70">{currentPhoto.filename}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Slideshow Button */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSlideshow(!showSlideshow);
                if (!showSlideshow) setSlideshowPlaying(true);
              }}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                showSlideshow
                  ? "bg-[var(--primary)] text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              title="Slideshow (S)"
            >
              <SlideshowIcon className="h-5 w-5" />
            </button>
          )}

          {/* Compare Button */}
          {onCompare && photos.length >= 2 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Select current and next photo for comparison
                const nextIndex = (currentIndex + 1) % photos.length;
                onCompare([photos[currentIndex], photos[nextIndex]]);
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
              title="Compare photos"
            >
              <CompareIcon className="h-5 w-5" />
            </button>
          )}

          {/* Share Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareMenu(!showShareMenu);
              }}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                showShareMenu
                  ? "bg-white/20 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              title="Share"
            >
              <ShareIcon className="h-5 w-5" />
            </button>

            {/* Share Menu */}
            {showShareMenu && (
              <div
                className="absolute right-0 top-12 z-20 w-48 rounded-lg border border-white/10 bg-[#1a1a1a] p-2 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleCopyLink}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
                >
                  <LinkIcon className="h-4 w-4" />
                  {copySuccess ? "Copied!" : "Copy Link"}
                </button>
                {"share" in navigator && (
                  <button
                    onClick={handleShareNative}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
                  >
                    <ShareIcon className="h-4 w-4" />
                    Share...
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Rating Button */}
          {galleryId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRatingPanel(!showRatingPanel);
              }}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                showRatingPanel || userRatings[currentPhoto.id]
                  ? "bg-yellow-500 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              title="Rate photo (R)"
            >
              <StarIcon filled={!!userRatings[currentPhoto.id]} className="h-5 w-5" />
            </button>
          )}

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(currentPhoto.id);
              }}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${
                isFavorited
                  ? "bg-red-500 text-white"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
              title="Add to favorites (F)"
            >
              <HeartIcon filled={isFavorited} className="h-5 w-5" />
            </button>
          )}

          {/* Download Button */}
          {onDownload && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(currentPhoto);
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
              title="Download photo (D)"
            >
              <DownloadIcon className="h-5 w-5" />
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
            title="Close (ESC)"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image */}
      <div
        className="relative flex h-full w-full items-center justify-center px-16 py-20"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner className="h-8 w-8 text-white" />
          </div>
        )}
        <Image
          src={currentPhoto.url}
          alt={currentPhoto.filename}
          fill
          className={`object-contain transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoad={() => setIsLoading(false)}
          priority
        />
      </div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
            title="Previous (←)"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-white/20"
            title="Next (→)"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="mx-auto flex max-w-3xl justify-center gap-2 overflow-x-auto">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                  setIsLoading(true);
                }}
                className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                  index === currentIndex
                    ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                    : "opacity-50 hover:opacity-75"
                }`}
              >
                <Image
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.filename}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
                {favorites.has(photo.id) && (
                  <div className="absolute right-0.5 top-0.5">
                    <HeartIcon filled className="h-3 w-3 text-red-500" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Rating Panel */}
      {showRatingPanel && galleryId && currentPhoto && (
        <div
          className="absolute right-4 top-20 z-20 w-64 rounded-xl border border-white/10 bg-[#1a1a1a]/95 p-4 shadow-xl backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <h3 className="text-sm font-medium text-white">Rate this photo</h3>
            {photoRatings[currentPhoto.id] && (
              <span className="text-xs text-white/60">
                {photoRatings[currentPhoto.id].average} avg ({photoRatings[currentPhoto.id].count})
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = (hoverRating || userRatings[currentPhoto.id] || 0) >= star;
              return (
                <button
                  key={star}
                  onClick={() => handleRatePhoto(currentPhoto.id, star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={isSubmittingRating}
                  className="p-1.5 transition-all hover:scale-110 disabled:opacity-50"
                  title={`Rate ${star} star${star !== 1 ? "s" : ""}`}
                >
                  <StarIcon
                    filled={isActive}
                    className={`h-7 w-7 ${isActive ? "text-yellow-400" : "text-white/30"}`}
                  />
                </button>
              );
            })}
          </div>
          {userRatings[currentPhoto.id] && (
            <p className="mt-2 text-xs text-white/60">
              Your rating: {userRatings[currentPhoto.id]} star{userRatings[currentPhoto.id] !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}

      {/* Slideshow Controls Overlay */}
      {showSlideshow && (
        <div className="absolute bottom-32 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 rounded-full bg-black/70 px-6 py-3 backdrop-blur-sm">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSlideshowPlaying(!slideshowPlaying);
            }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-white/90"
            title={slideshowPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {slideshowPlaying ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <PlayIcon className="h-5 w-5 ml-0.5" />
            )}
          </button>

          {/* Speed Options */}
          <div className="flex items-center gap-1">
            {[
              { label: "2s", value: 2000 },
              { label: "4s", value: 4000 },
              { label: "8s", value: 8000 },
            ].map((option) => (
              <button
                key={option.value}
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideshowInterval(option.value);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  slideshowInterval === option.value
                    ? "bg-white text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="h-1 w-24 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / photos.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-white/60">
              {currentIndex + 1}/{photos.length}
            </span>
          </div>
        </div>
      )}

      {/* Keyboard Hints */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-xs text-white/40">
        <span className="hidden sm:inline">
          {showSlideshow
            ? "Space Play/Pause • ← → Navigate • S Exit Slideshow • ESC Close"
            : "← → Navigate • F Favorite • R Rate • D Download • S Slideshow • ESC Close"}
        </span>
      </div>
    </div>
  );
}

// Icons
function HeartIcon({ filled, className }: { filled?: boolean; className?: string }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    );
  }
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
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

function SlideshowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
      />
    </svg>
  );
}

function CompareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 4.5v15m6-15v15M4.5 9h15M4.5 15h15"
      />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
      />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
      />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

function StarIcon({ filled, className }: { filled?: boolean; className?: string }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}
