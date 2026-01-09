"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  X,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Grid3x3,
  Info,
  Settings,
} from "lucide-react";

interface Photo {
  id: string;
  url: string;
  originalUrl: string;
  filename: string;
  width: number;
  height: number;
  exif?: {
    camera?: string;
    lens?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    focalLength?: string;
    dateTaken?: string;
  };
}

interface SlideshowViewerProps {
  photos: Photo[];
  initialIndex: number;
  isPlaying: boolean;
  interval: number; // milliseconds
  onClose: () => void;
  onIndexChange: (index: number) => void;
  onPlayingChange: (playing: boolean) => void;
  onIntervalChange: (interval: number) => void;
}

export function SlideshowViewer({
  photos,
  initialIndex,
  isPlaying,
  interval,
  onClose,
  onIndexChange,
  onPlayingChange,
  onIntervalChange,
}: SlideshowViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const lastTapRef = useRef<number>(0);

  // Sync internal state with props
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Auto-advance
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % photos.length;
        onIndexChange(next);
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, interval, photos.length, onIndexChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ": // Space: play/pause
          e.preventDefault();
          onPlayingChange(!isPlaying);
          break;
        case "ArrowLeft": // Left arrow: previous
          e.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight": // Right arrow: next
          e.preventDefault();
          handleNext();
          break;
        case "f": // F: toggle fullscreen
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "t": // T: toggle thumbnails
        case "T":
          e.preventDefault();
          setShowThumbnails((prev) => !prev);
          break;
        case "i": // I: toggle info
        case "I":
          e.preventDefault();
          setShowInfo((prev) => !prev);
          break;
        case "Escape": // Esc: exit slideshow
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, onPlayingChange, onClose]);

  // Fullscreen API
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Auto-hide controls on inactivity - responds to mouse, keyboard, and touch
  useEffect(() => {
    const resetControlsTimeout = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = window.setTimeout(() => {
        if (isPlaying && isFullscreen) {
          setShowControls(false);
        }
      }, 3000);
    };

    const handleMouseMove = () => resetControlsTimeout();
    const handleMouseLeave = () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
    // Show controls on any keyboard activity
    const handleKeyDown = () => resetControlsTimeout();
    // Show controls on touch activity
    const handleTouchStart = () => resetControlsTimeout();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);
    resetControlsTimeout();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, isFullscreen]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev === 0 ? photos.length - 1 : prev - 1;
      onIndexChange(next);
      return next;
    });
  }, [photos.length, onIndexChange]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = (prev + 1) % photos.length;
      onIndexChange(next);
      return next;
    });
  }, [photos.length, onIndexChange]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  // Touch gestures with improved detection
  const touchStartY = useRef<number | null>(null);
  const lastTapPosition = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD = 75; // Increased from 50 to reduce accidental swipes
  const SWIPE_RATIO = 2; // Horizontal movement must be 2x vertical movement

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchEnd(null);
    setTouchStart(touch.clientX);
    touchStartY.current = touch.clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || touchStartY.current === null) return;

    const distanceX = touchStart - touchEnd;
    const distanceY = Math.abs((touchStartY.current || 0) - (touchEnd || 0));

    // Only trigger swipe if horizontal movement is significantly greater than vertical
    const isHorizontalSwipe = Math.abs(distanceX) > distanceY * SWIPE_RATIO;

    if (isHorizontalSwipe) {
      const isLeftSwipe = distanceX > SWIPE_THRESHOLD;
      const isRightSwipe = distanceX < -SWIPE_THRESHOLD;

      if (isLeftSwipe) {
        handleNext();
      } else if (isRightSwipe) {
        handlePrevious();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
    touchStartY.current = null;
  };

  // Double-tap for fullscreen with position check
  const TAP_DISTANCE_THRESHOLD = 50; // Max distance between taps to count as double-tap

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    // Get current tap position
    let currentX: number, currentY: number;
    if ("touches" in e && e.touches.length > 0) {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      currentX = e.clientX;
      currentY = e.clientY;
    } else {
      lastTapRef.current = now;
      return;
    }

    // Check if this is a valid double-tap (within time AND distance)
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0 && lastTapPosition.current) {
      const distance = Math.sqrt(
        Math.pow(currentX - lastTapPosition.current.x, 2) +
        Math.pow(currentY - lastTapPosition.current.y, 2)
      );

      if (distance < TAP_DISTANCE_THRESHOLD) {
        toggleFullscreen();
        lastTapPosition.current = null;
        lastTapRef.current = 0;
        return;
      }
    }

    lastTapPosition.current = { x: currentX, y: currentY };
    lastTapRef.current = now;
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Slideshow: ${currentPhoto.filename} (${currentIndex + 1} of ${photos.length})`}
      className="fixed inset-0 z-50 bg-black"
      style={{ contain: "layout style paint" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleDoubleTap}
    >
      {/* Main Photo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <Image
            src={currentPhoto.url}
            alt={currentPhoto.filename}
            fill
            className="object-contain"
            priority
            quality={95}
            sizes="100vw"
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevious}
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 z-10",
          "flex items-center justify-center w-12 h-12 rounded-full",
          "bg-black/50 text-white backdrop-blur-sm",
          "hover:bg-black/70 transition-all",
          "opacity-0 hover:opacity-100 focus:opacity-100",
          showControls && "opacity-100"
        )}
        aria-label="Previous photo"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 z-10",
          "flex items-center justify-center w-12 h-12 rounded-full",
          "bg-black/50 text-white backdrop-blur-sm",
          "hover:bg-black/70 transition-all",
          "opacity-0 hover:opacity-100 focus:opacity-100",
          showControls && "opacity-100"
        )}
        aria-label="Next photo"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Top Control Bar */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 z-20",
          "bg-gradient-to-b from-black/80 to-transparent",
          "transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap p-4">
          <div className="flex items-center gap-4">
            <div className="text-white text-sm font-medium">
              {currentIndex + 1} / {photos.length}
            </div>
            <div className="text-white/70 text-sm">{currentPhoto.filename}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg",
                "text-white hover:bg-white/20 transition-colors",
                showInfo && "bg-white/20"
              )}
              aria-label="Toggle info"
            >
              <Info className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg",
                "text-white hover:bg-white/20 transition-colors",
                showThumbnails && "bg-white/20"
              )}
              aria-label="Toggle thumbnails"
            >
              <Grid3x3 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg",
                "text-white hover:bg-white/20 transition-colors",
                showSettings && "bg-white/20"
              )}
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-white hover:bg-white/20 transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-lg text-white hover:bg-white/20 transition-colors"
              aria-label="Close slideshow"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-20",
          "bg-gradient-to-t from-black/80 to-transparent",
          "transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="p-4">
          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => onPlayingChange(!isPlaying)}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / photos.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Overlay */}
      {showInfo && currentPhoto.exif && (
        <div
          className={cn(
            "absolute right-4 top-20 z-30",
            "bg-black/80 backdrop-blur-sm rounded-lg p-4",
            "text-white text-sm max-w-xs",
            "transition-opacity duration-300"
          )}
        >
          <h3 className="font-medium mb-3">Photo Information</h3>
          <div className="space-y-2">
            {currentPhoto.exif.camera && (
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Camera</span>
                <span>{currentPhoto.exif.camera}</span>
              </div>
            )}
            {currentPhoto.exif.lens && (
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Lens</span>
                <span>{currentPhoto.exif.lens}</span>
              </div>
            )}
            {currentPhoto.exif.aperture && (
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Aperture</span>
                <span>{currentPhoto.exif.aperture}</span>
              </div>
            )}
            {currentPhoto.exif.shutterSpeed && (
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Shutter</span>
                <span>{currentPhoto.exif.shutterSpeed}</span>
              </div>
            )}
            {currentPhoto.exif.iso && (
              <div className="flex justify-between gap-4">
                <span className="text-white/70">ISO</span>
                <span>{currentPhoto.exif.iso}</span>
              </div>
            )}
            {currentPhoto.exif.focalLength && (
              <div className="flex justify-between gap-4">
                <span className="text-white/70">Focal Length</span>
                <span>{currentPhoto.exif.focalLength}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div
          className={cn(
            "absolute right-4 top-20 z-30",
            "bg-black/80 backdrop-blur-sm rounded-lg p-4",
            "text-white text-sm w-64",
            "transition-opacity duration-300"
          )}
        >
          <h3 className="font-medium mb-3">Slideshow Speed</h3>
          <div className="space-y-2">
            {[
              { label: "Fast (2s)", value: 2000 },
              { label: "Medium (4s)", value: 4000 },
              { label: "Slow (8s)", value: 8000 },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => onIntervalChange(option.value)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg transition-colors",
                  interval === option.value
                    ? "bg-white text-black"
                    : "hover:bg-white/20 text-white"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/20">
            <h3 className="font-medium mb-2">Keyboard Shortcuts</h3>
            <div className="space-y-1 text-xs text-white/70">
              <div className="flex justify-between">
                <span>Space</span>
                <span>Play/Pause</span>
              </div>
              <div className="flex justify-between">
                <span>← →</span>
                <span>Navigate</span>
              </div>
              <div className="flex justify-between">
                <span>F</span>
                <span>Fullscreen</span>
              </div>
              <div className="flex justify-between">
                <span>T</span>
                <span>Thumbnails</span>
              </div>
              <div className="flex justify-between">
                <span>I</span>
                <span>Info</span>
              </div>
              <div className="flex justify-between">
                <span>Esc</span>
                <span>Exit</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Strip */}
      {showThumbnails && (
        <div
          className={cn(
            "absolute bottom-24 left-0 right-0 z-20",
            "transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-2 px-4">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => {
                    setCurrentIndex(index);
                    onIndexChange(index);
                  }}
                  className={cn(
                    "relative shrink-0 w-16 h-16 rounded-lg overflow-hidden",
                    "border-2 transition-all",
                    index === currentIndex
                      ? "border-white scale-110"
                      : "border-transparent hover:border-white/50 opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={photo.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
