"use client";

import { useState, useRef, useId, useCallback, useEffect } from "react";

// Types
interface VideoSlide {
  id: string;
  type: "image" | "text" | "title";
  content: string; // Image URL or text content
  duration: number; // seconds
  transition: TransitionType;
  textOverlay?: TextOverlay;
  kenBurns?: KenBurnsEffect;
}

interface TextOverlay {
  text: string;
  position: "top" | "center" | "bottom";
  style: "minimal" | "bold" | "elegant" | "modern";
  animation: "fade" | "slide-up" | "slide-left" | "typewriter" | "none";
  color: string;
  backgroundColor?: string;
}

interface KenBurnsEffect {
  enabled: boolean;
  direction: "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "pan-up" | "pan-down";
  intensity: number; // 1-10
}

type TransitionType =
  | "none"
  | "fade"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "zoom"
  | "blur"
  | "wipe";

interface AudioTrack {
  id: string;
  name: string;
  url: string;
  duration: number;
  genre: string;
  mood: string;
}

interface VideoProject {
  id: string;
  name: string;
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5";
  slides: VideoSlide[];
  audio?: {
    track: AudioTrack;
    volume: number;
    fadeIn: boolean;
    fadeOut: boolean;
  };
  branding: {
    showLogo: boolean;
    logoUrl?: string;
    logoPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    showWatermark: boolean;
    primaryColor: string;
    secondaryColor: string;
  };
}

interface VideoGeneratorProps {
  propertyData?: {
    address?: string;
    price?: string;
    bedrooms?: number;
    bathrooms?: number;
    sqft?: number;
    description?: string;
    photos?: string[];
    agentName?: string;
    logoUrl?: string;
  };
  onExport?: (project: VideoProject) => void;
  onSave?: (project: VideoProject) => void;
}

// Preset video styles
const VIDEO_PRESETS = [
  {
    id: "instagram-reel",
    name: "Instagram Reel",
    aspectRatio: "9:16" as const,
    duration: 30,
    description: "Vertical video optimized for Reels",
  },
  {
    id: "instagram-story",
    name: "Instagram Story",
    aspectRatio: "9:16" as const,
    duration: 15,
    description: "15-second vertical story",
  },
  {
    id: "youtube-short",
    name: "YouTube Short",
    aspectRatio: "9:16" as const,
    duration: 60,
    description: "Up to 60 seconds vertical",
  },
  {
    id: "facebook-video",
    name: "Facebook Video",
    aspectRatio: "16:9" as const,
    duration: 60,
    description: "Standard landscape video",
  },
  {
    id: "tiktok",
    name: "TikTok",
    aspectRatio: "9:16" as const,
    duration: 30,
    description: "Vertical TikTok format",
  },
  {
    id: "square-social",
    name: "Square Social",
    aspectRatio: "1:1" as const,
    duration: 30,
    description: "Square format for Instagram/Facebook",
  },
];

// Transition options
const TRANSITIONS: { value: TransitionType; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "slide-up", label: "Slide Up" },
  { value: "zoom", label: "Zoom" },
  { value: "blur", label: "Blur" },
  { value: "wipe", label: "Wipe" },
];

// Sample audio tracks
const SAMPLE_AUDIO_TRACKS: AudioTrack[] = [
  { id: "upbeat-1", name: "Modern Living", url: "", duration: 120, genre: "electronic", mood: "upbeat" },
  { id: "elegant-1", name: "Elegant Spaces", url: "", duration: 90, genre: "cinematic", mood: "elegant" },
  { id: "chill-1", name: "Coastal Breeze", url: "", duration: 150, genre: "ambient", mood: "relaxed" },
  { id: "inspiring-1", name: "New Beginnings", url: "", duration: 120, genre: "corporate", mood: "inspiring" },
  { id: "luxury-1", name: "Luxury Living", url: "", duration: 100, genre: "cinematic", mood: "sophisticated" },
];

// Helper to generate ID
const generateId = () => `slide_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// Slide component for timeline
function TimelineSlide({
  slide,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  slide: VideoSlide;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<VideoSlide>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`relative flex h-20 w-28 shrink-0 cursor-pointer flex-col overflow-x-auto rounded-lg border-2 transition-all ${
        isSelected
          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30"
          : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
      }`}
    >
      {slide.type === "image" && slide.content ? (
        <img
          src={slide.content}
          alt="Slide"
          className="h-full w-full object-cover"
        />
      ) : slide.type === "title" || slide.type === "text" ? (
        <div className="flex h-full w-full items-center justify-center bg-[var(--primary)]/20 p-2">
          <span className="line-clamp-2 text-center text-xs text-foreground">
            {slide.content || "Text Slide"}
          </span>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[var(--background-tertiary)]">
          <span className="text-2xl">🖼️</span>
        </div>
      )}

      {/* Duration badge */}
      <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
        {slide.duration}s
      </div>

      {/* Transition indicator */}
      {slide.transition !== "none" && (
        <div className="absolute left-1 top-1 rounded bg-[var(--primary)]/80 px-1 py-0.5 text-[8px] text-white">
          {slide.transition}
        </div>
      )}
    </div>
  );
}

export function VideoGenerator({
  propertyData,
  onExport,
  onSave,
}: VideoGeneratorProps) {
  const id = useId();
  const previewRef = useRef<HTMLDivElement>(null);

  const [project, setProject] = useState<VideoProject>({
    id: generateId(),
    name: "Property Video",
    aspectRatio: "9:16",
    slides: [],
    branding: {
      showLogo: true,
      logoUrl: propertyData?.logoUrl,
      logoPosition: "bottom-right",
      showWatermark: false,
      primaryColor: "#3b82f6",
      secondaryColor: "#ffffff",
    },
  });

  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeTab, setActiveTab] = useState<"slides" | "audio" | "branding">("slides");

  const selectedSlide = project.slides.find((s) => s.id === selectedSlideId);

  // Calculate total duration
  const totalDuration = project.slides.reduce((sum, slide) => sum + slide.duration, 0);

  // Get canvas dimensions based on aspect ratio
  const getCanvasDimensions = () => {
    const baseWidth = 360;
    switch (project.aspectRatio) {
      case "9:16": return { width: baseWidth, height: baseWidth * (16/9) };
      case "16:9": return { width: baseWidth * (16/9), height: baseWidth };
      case "1:1": return { width: baseWidth, height: baseWidth };
      case "4:5": return { width: baseWidth, height: baseWidth * (5/4) };
      default: return { width: baseWidth, height: baseWidth };
    }
  };

  // Add slide
  const addSlide = (type: VideoSlide["type"], content?: string) => {
    const newSlide: VideoSlide = {
      id: generateId(),
      type,
      content: content || "",
      duration: type === "title" ? 3 : 4,
      transition: "fade",
      kenBurns: {
        enabled: type === "image",
        direction: "zoom-in",
        intensity: 5,
      },
    };

    if (type === "title" || type === "text") {
      newSlide.textOverlay = {
        text: content || (type === "title" ? propertyData?.address || "Property Address" : "Add your text"),
        position: "center",
        style: type === "title" ? "bold" : "minimal",
        animation: "fade",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.5)",
      };
    }

    setProject((prev) => ({
      ...prev,
      slides: [...prev.slides, newSlide],
    }));
    setSelectedSlideId(newSlide.id);
  };

  // Update slide
  const updateSlide = (slideId: string, updates: Partial<VideoSlide>) => {
    setProject((prev) => ({
      ...prev,
      slides: prev.slides.map((s) =>
        s.id === slideId ? { ...s, ...updates } : s
      ),
    }));
  };

  // Delete slide
  const deleteSlide = (slideId: string) => {
    setProject((prev) => ({
      ...prev,
      slides: prev.slides.filter((s) => s.id !== slideId),
    }));
    if (selectedSlideId === slideId) {
      setSelectedSlideId(null);
    }
  };

  // Duplicate slide
  const duplicateSlide = (slideId: string) => {
    const slide = project.slides.find((s) => s.id === slideId);
    if (!slide) return;

    const newSlide: VideoSlide = {
      ...slide,
      id: generateId(),
    };

    const index = project.slides.findIndex((s) => s.id === slideId);
    setProject((prev) => ({
      ...prev,
      slides: [
        ...prev.slides.slice(0, index + 1),
        newSlide,
        ...prev.slides.slice(index + 1),
      ],
    }));
    setSelectedSlideId(newSlide.id);
  };

  // Add property photos as slides
  const addPropertyPhotos = () => {
    if (!propertyData?.photos?.length) return;

    propertyData.photos.forEach((photo) => {
      addSlide("image", photo);
    });
  };

  // Auto-generate video from preset
  const generateFromPreset = (presetId: string) => {
    const preset = VIDEO_PRESETS.find((p) => p.id === presetId);
    if (!preset || !propertyData) return;

    const slides: VideoSlide[] = [];

    // Title slide
    slides.push({
      id: generateId(),
      type: "title",
      content: propertyData.address || "Property Tour",
      duration: 3,
      transition: "fade",
      textOverlay: {
        text: propertyData.address || "Property Tour",
        position: "center",
        style: "bold",
        animation: "fade",
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.6)",
      },
    });

    // Price slide
    if (propertyData.price) {
      slides.push({
        id: generateId(),
        type: "title",
        content: propertyData.price,
        duration: 2,
        transition: "slide-up",
        textOverlay: {
          text: propertyData.price,
          position: "center",
          style: "bold",
          animation: "slide-up",
          color: "#3b82f6",
          backgroundColor: "rgba(0,0,0,0.6)",
        },
      });
    }

    // Photo slides
    if (propertyData.photos?.length) {
      const photoCount = Math.min(propertyData.photos.length, 6);
      const photoSlideTime = Math.floor((preset.duration - 8) / photoCount);

      for (let i = 0; i < photoCount; i++) {
        slides.push({
          id: generateId(),
          type: "image",
          content: propertyData.photos[i],
          duration: photoSlideTime,
          transition: i % 2 === 0 ? "fade" : "slide-left",
          kenBurns: {
            enabled: true,
            direction: i % 2 === 0 ? "zoom-in" : "pan-left",
            intensity: 5,
          },
        });
      }
    }

    // Details slide
    if (propertyData.bedrooms || propertyData.bathrooms || propertyData.sqft) {
      slides.push({
        id: generateId(),
        type: "text",
        content: `${propertyData.bedrooms || 0} Beds • ${propertyData.bathrooms || 0} Baths • ${propertyData.sqft || 0} Sq Ft`,
        duration: 3,
        transition: "fade",
        textOverlay: {
          text: `${propertyData.bedrooms || 0} Beds • ${propertyData.bathrooms || 0} Baths • ${propertyData.sqft || 0} Sq Ft`,
          position: "center",
          style: "modern",
          animation: "slide-up",
          color: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.6)",
        },
      });
    }

    // Contact slide
    if (propertyData.agentName) {
      slides.push({
        id: generateId(),
        type: "text",
        content: propertyData.agentName,
        duration: 3,
        transition: "fade",
        textOverlay: {
          text: `Contact: ${propertyData.agentName}`,
          position: "bottom",
          style: "minimal",
          animation: "fade",
          color: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.7)",
        },
      });
    }

    setProject((prev) => ({
      ...prev,
      aspectRatio: preset.aspectRatio,
      slides,
    }));

    if (slides.length > 0) {
      setSelectedSlideId(slides[0].id);
    }
  };

  // Play/pause preview
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Start playback simulation
    }
  };

  const canvasDimensions = getCanvasDimensions();

  return (
    <div className="flex h-full min-h-[700px] gap-0 rounded-xl border border-[var(--card-border)] bg-[var(--background)]">
      {/* Left Panel - Add Content */}
      <div className="w-64 shrink-0 border-r border-[var(--card-border)] bg-[var(--card)]">
        <div className="border-b border-[var(--card-border)] px-4 py-3">
          <h3 className="text-sm font-semibold text-foreground">Add Content</h3>
        </div>

        <div className="h-[calc(100%-49px)] overflow-y-auto p-3 space-y-4">
          {/* Quick Start */}
          <div>
            <h4 className="mb-2 text-xs font-semibold text-foreground-muted">Quick Start</h4>
            <div className="space-y-1.5">
              {VIDEO_PRESETS.slice(0, 4).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => generateFromPreset(preset.id)}
                  className="w-full rounded-lg border border-[var(--card-border)] px-3 py-2 text-left transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
                >
                  <p className="text-xs font-medium text-foreground">{preset.name}</p>
                  <p className="text-[10px] text-foreground-muted">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Add Slides */}
          <div>
            <h4 className="mb-2 text-xs font-semibold text-foreground-muted">Add Slides</h4>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => addSlide("title")}
                className="flex flex-col items-center gap-1 rounded-lg border border-[var(--card-border)] p-2 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
              >
                <span className="text-lg">📝</span>
                <span className="text-[10px] text-foreground-muted">Title</span>
              </button>
              <button
                onClick={() => addSlide("text")}
                className="flex flex-col items-center gap-1 rounded-lg border border-[var(--card-border)] p-2 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
              >
                <span className="text-lg">💬</span>
                <span className="text-[10px] text-foreground-muted">Text</span>
              </button>
              <button
                onClick={() => addSlide("image")}
                className="flex flex-col items-center gap-1 rounded-lg border border-[var(--card-border)] p-2 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5"
              >
                <span className="text-lg">🖼️</span>
                <span className="text-[10px] text-foreground-muted">Image</span>
              </button>
              <button
                onClick={addPropertyPhotos}
                disabled={!propertyData?.photos?.length}
                className="flex flex-col items-center gap-1 rounded-lg border border-[var(--card-border)] p-2 transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 disabled:opacity-50"
              >
                <span className="text-lg">📸</span>
                <span className="text-[10px] text-foreground-muted">Photos</span>
              </button>
            </div>
          </div>

          {/* Property Data */}
          {propertyData && (
            <div>
              <h4 className="mb-2 text-xs font-semibold text-foreground-muted">Property Placeholders</h4>
              <div className="space-y-1">
                {propertyData.address && (
                  <button
                    onClick={() => addSlide("title", propertyData.address)}
                    className="w-full rounded border border-[var(--card-border)] px-2 py-1.5 text-left text-xs text-foreground-muted hover:bg-[var(--background-hover)]"
                  >
                    📍 Address
                  </button>
                )}
                {propertyData.price && (
                  <button
                    onClick={() => addSlide("title", propertyData.price)}
                    className="w-full rounded border border-[var(--card-border)] px-2 py-1.5 text-left text-xs text-foreground-muted hover:bg-[var(--background-hover)]"
                  >
                    💰 Price
                  </button>
                )}
                {(propertyData.bedrooms || propertyData.bathrooms) && (
                  <button
                    onClick={() => addSlide("text", `${propertyData.bedrooms} Beds • ${propertyData.bathrooms} Baths`)}
                    className="w-full rounded border border-[var(--card-border)] px-2 py-1.5 text-left text-xs text-foreground-muted hover:bg-[var(--background-hover)]"
                  >
                    🛏️ Bed/Bath
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center - Preview & Timeline */}
      <div className="flex flex-1 flex-col">
        {/* Toolbar */}
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[var(--card-border)] bg-[var(--card)] px-4 py-2">
          <div className="flex items-center gap-3">
            <select
              id={`${id}-aspect`}
              value={project.aspectRatio}
              onChange={(e) => setProject((prev) => ({ ...prev, aspectRatio: e.target.value as VideoProject["aspectRatio"] }))}
              className="h-8 rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
              aria-label="Aspect ratio"
            >
              <option value="9:16">9:16 (Vertical)</option>
              <option value="16:9">16:9 (Landscape)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="4:5">4:5 (Portrait)</option>
            </select>

            <span className="text-xs text-foreground-muted">
              {project.slides.length} slides • {totalDuration}s total
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave?.(project)}
              className="h-8 rounded-lg border border-[var(--card-border)] px-4 text-xs font-medium text-foreground hover:bg-[var(--background-hover)]"
            >
              Save Draft
            </button>
            <button
              onClick={() => onExport?.(project)}
              className="h-8 rounded-lg bg-[var(--primary)] px-4 text-xs font-medium text-white hover:bg-[var(--primary)]/90"
            >
              Export Video
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex flex-1 items-center justify-center bg-[var(--background-tertiary)] p-6">
          <div
            ref={previewRef}
            className="relative overflow-x-auto rounded-lg bg-black shadow-xl"
            style={{
              width: canvasDimensions.width,
              height: canvasDimensions.height,
            }}
          >
            {selectedSlide ? (
              <>
                {selectedSlide.type === "image" && selectedSlide.content ? (
                  <img
                    src={selectedSlide.content}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    style={{
                      transform: selectedSlide.kenBurns?.enabled
                        ? `scale(${1 + (selectedSlide.kenBurns.intensity || 5) * 0.01})`
                        : "none",
                    }}
                  />
                ) : null}

                {selectedSlide.textOverlay && (
                  <div
                    className={`absolute inset-x-0 flex items-center justify-center p-4 ${
                      selectedSlide.textOverlay.position === "top"
                        ? "top-0"
                        : selectedSlide.textOverlay.position === "bottom"
                        ? "bottom-0"
                        : "inset-y-0"
                    }`}
                    style={{
                      backgroundColor: selectedSlide.textOverlay.backgroundColor,
                    }}
                  >
                    <p
                      className={`text-center ${
                        selectedSlide.textOverlay.style === "bold"
                          ? "text-2xl font-bold"
                          : selectedSlide.textOverlay.style === "elegant"
                          ? "font-serif text-xl"
                          : selectedSlide.textOverlay.style === "modern"
                          ? "text-lg font-medium tracking-wide"
                          : "text-base"
                      }`}
                      style={{ color: selectedSlide.textOverlay.color }}
                    >
                      {selectedSlide.textOverlay.text}
                    </p>
                  </div>
                )}

                {/* Logo overlay */}
                {project.branding.showLogo && project.branding.logoUrl && (
                  <div
                    className={`absolute h-12 w-12 ${
                      project.branding.logoPosition === "top-left"
                        ? "left-3 top-3"
                        : project.branding.logoPosition === "top-right"
                        ? "right-3 top-3"
                        : project.branding.logoPosition === "bottom-left"
                        ? "bottom-3 left-3"
                        : "bottom-3 right-3"
                    }`}
                  >
                    <img
                      src={project.branding.logoUrl}
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/50">
                <p className="text-sm">Select a slide or add content</p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="border-t border-[var(--card-border)] bg-[var(--card)]">
          {/* Playback controls */}
          <div className="flex items-center gap-3 border-b border-[var(--card-border)] px-4 py-2">
            <button
              onClick={togglePlayback}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max={totalDuration}
                value={currentTime}
                onChange={(e) => setCurrentTime(parseInt(e.target.value))}
                className="w-full"
                aria-label="Timeline scrubber"
              />
            </div>
            <span className="text-xs text-foreground-muted">
              {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, "0")} / {Math.floor(totalDuration / 60)}:{(totalDuration % 60).toString().padStart(2, "0")}
            </span>
          </div>

          {/* Slide thumbnails */}
          <div className="flex gap-2 overflow-x-auto p-3">
            {project.slides.map((slide) => (
              <TimelineSlide
                key={slide.id}
                slide={slide}
                isSelected={slide.id === selectedSlideId}
                onSelect={() => setSelectedSlideId(slide.id)}
                onUpdate={(updates) => updateSlide(slide.id, updates)}
                onDelete={() => deleteSlide(slide.id)}
                onDuplicate={() => duplicateSlide(slide.id)}
              />
            ))}
            {project.slides.length === 0 && (
              <div className="flex h-20 w-full items-center justify-center text-foreground-muted">
                <p className="text-xs">Add slides to begin creating your video</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-72 shrink-0 border-l border-[var(--card-border)] bg-[var(--card)]">
        {/* Tabs */}
        <div className="flex border-b border-[var(--card-border)]">
          {(["slides", "audio", "branding"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 text-xs font-medium capitalize ${
                activeTab === tab
                  ? "border-b-2 border-[var(--primary)] text-[var(--primary)]"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="h-[calc(100%-41px)] overflow-y-auto p-4">
          {activeTab === "slides" && selectedSlide && (
            <div className="space-y-4">
              {/* Duration */}
              <div>
                <label
                  htmlFor={`${id}-duration`}
                  className="text-xs font-semibold text-foreground-muted"
                >
                  Duration (seconds)
                </label>
                <input
                  id={`${id}-duration`}
                  type="number"
                  min="1"
                  max="30"
                  value={selectedSlide.duration}
                  onChange={(e) => updateSlide(selectedSlide.id, { duration: parseInt(e.target.value) || 3 })}
                  className="mt-1 h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                />
              </div>

              {/* Transition */}
              <div>
                <label
                  htmlFor={`${id}-transition`}
                  className="text-xs font-semibold text-foreground-muted"
                >
                  Transition
                </label>
                <select
                  id={`${id}-transition`}
                  value={selectedSlide.transition}
                  onChange={(e) => updateSlide(selectedSlide.id, { transition: e.target.value as TransitionType })}
                  className="mt-1 h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                >
                  {TRANSITIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Ken Burns for images */}
              {selectedSlide.type === "image" && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground-muted">
                    <input
                      type="checkbox"
                      checked={selectedSlide.kenBurns?.enabled || false}
                      onChange={(e) => updateSlide(selectedSlide.id, {
                        kenBurns: { ...selectedSlide.kenBurns!, enabled: e.target.checked },
                      })}
                      className="rounded"
                    />
                    Ken Burns Effect
                  </label>

                  {selectedSlide.kenBurns?.enabled && (
                    <>
                      <select
                        value={selectedSlide.kenBurns.direction}
                        onChange={(e) => updateSlide(selectedSlide.id, {
                          kenBurns: { ...selectedSlide.kenBurns!, direction: e.target.value as KenBurnsEffect["direction"] },
                        })}
                        className="h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                        aria-label="Ken Burns direction"
                      >
                        <option value="zoom-in">Zoom In</option>
                        <option value="zoom-out">Zoom Out</option>
                        <option value="pan-left">Pan Left</option>
                        <option value="pan-right">Pan Right</option>
                        <option value="pan-up">Pan Up</option>
                        <option value="pan-down">Pan Down</option>
                      </select>
                      <div>
                        <label className="text-[10px] text-foreground-muted">Intensity</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={selectedSlide.kenBurns.intensity}
                          onChange={(e) => updateSlide(selectedSlide.id, {
                            kenBurns: { ...selectedSlide.kenBurns!, intensity: parseInt(e.target.value) },
                          })}
                          className="w-full"
                          aria-label="Ken Burns intensity"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Text overlay for title/text slides */}
              {selectedSlide.textOverlay && (
                <div className="space-y-3 border-t border-[var(--card-border)] pt-3">
                  <h4 className="text-xs font-semibold text-foreground-muted">Text Overlay</h4>

                  <div>
                    <label htmlFor={`${id}-text`} className="text-[10px] text-foreground-muted">Text</label>
                    <textarea
                      id={`${id}-text`}
                      value={selectedSlide.textOverlay.text}
                      onChange={(e) => updateSlide(selectedSlide.id, {
                        textOverlay: { ...selectedSlide.textOverlay!, text: e.target.value },
                        content: e.target.value,
                      })}
                      className="mt-1 h-16 w-full resize-none rounded border border-[var(--card-border)] bg-background p-2 text-xs text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor={`${id}-position`} className="text-[10px] text-foreground-muted">Position</label>
                      <select
                        id={`${id}-position`}
                        value={selectedSlide.textOverlay.position}
                        onChange={(e) => updateSlide(selectedSlide.id, {
                          textOverlay: { ...selectedSlide.textOverlay!, position: e.target.value as TextOverlay["position"] },
                        })}
                        className="mt-1 h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                      >
                        <option value="top">Top</option>
                        <option value="center">Center</option>
                        <option value="bottom">Bottom</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`${id}-style`} className="text-[10px] text-foreground-muted">Style</label>
                      <select
                        id={`${id}-style`}
                        value={selectedSlide.textOverlay.style}
                        onChange={(e) => updateSlide(selectedSlide.id, {
                          textOverlay: { ...selectedSlide.textOverlay!, style: e.target.value as TextOverlay["style"] },
                        })}
                        className="mt-1 h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                      >
                        <option value="minimal">Minimal</option>
                        <option value="bold">Bold</option>
                        <option value="elegant">Elegant</option>
                        <option value="modern">Modern</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`${id}-animation`} className="text-[10px] text-foreground-muted">Animation</label>
                    <select
                      id={`${id}-animation`}
                      value={selectedSlide.textOverlay.animation}
                      onChange={(e) => updateSlide(selectedSlide.id, {
                        textOverlay: { ...selectedSlide.textOverlay!, animation: e.target.value as TextOverlay["animation"] },
                      })}
                      className="mt-1 h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                    >
                      <option value="none">None</option>
                      <option value="fade">Fade In</option>
                      <option value="slide-up">Slide Up</option>
                      <option value="slide-left">Slide Left</option>
                      <option value="typewriter">Typewriter</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor={`${id}-textColor`} className="text-[10px] text-foreground-muted">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        id={`${id}-textColor`}
                        type="text"
                        value={selectedSlide.textOverlay.color}
                        onChange={(e) => updateSlide(selectedSlide.id, {
                          textOverlay: { ...selectedSlide.textOverlay!, color: e.target.value },
                        })}
                        className="mt-1 h-8 flex-1 rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                      />
                      <input
                        type="color"
                        value={selectedSlide.textOverlay.color}
                        onChange={(e) => updateSlide(selectedSlide.id, {
                          textOverlay: { ...selectedSlide.textOverlay!, color: e.target.value },
                        })}
                        className="mt-1 h-8 w-8 cursor-pointer rounded border border-[var(--card-border)]"
                        aria-label="Text color"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 border-t border-[var(--card-border)] pt-4">
                <button
                  onClick={() => duplicateSlide(selectedSlide.id)}
                  className="w-full rounded-lg border border-[var(--card-border)] px-4 py-2 text-xs font-medium text-foreground hover:bg-[var(--background-hover)]"
                >
                  Duplicate Slide
                </button>
                <button
                  onClick={() => deleteSlide(selectedSlide.id)}
                  className="w-full rounded-lg border border-[var(--error)] px-4 py-2 text-xs font-medium text-[var(--error)] hover:bg-[var(--error)]/10"
                >
                  Delete Slide
                </button>
              </div>
            </div>
          )}

          {activeTab === "slides" && !selectedSlide && (
            <p className="text-center text-xs text-foreground-muted">
              Select a slide to edit its properties
            </p>
          )}

          {activeTab === "audio" && (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-xs font-semibold text-foreground-muted">Background Music</h4>
                <div className="space-y-1.5">
                  {SAMPLE_AUDIO_TRACKS.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => setProject((prev) => ({
                        ...prev,
                        audio: {
                          track,
                          volume: 0.5,
                          fadeIn: true,
                          fadeOut: true,
                        },
                      }))}
                      className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                        project.audio?.track.id === track.id
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      <p className="text-xs font-medium text-foreground">{track.name}</p>
                      <p className="text-[10px] text-foreground-muted capitalize">
                        {track.mood} • {track.genre}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {project.audio && (
                <div className="space-y-3 border-t border-[var(--card-border)] pt-3">
                  <div>
                    <label htmlFor={`${id}-volume`} className="text-xs font-semibold text-foreground-muted">
                      Volume
                    </label>
                    <input
                      id={`${id}-volume`}
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={project.audio.volume}
                      onChange={(e) => setProject((prev) => ({
                        ...prev,
                        audio: prev.audio ? { ...prev.audio, volume: parseFloat(e.target.value) } : undefined,
                      }))}
                      className="mt-1 w-full"
                    />
                    <p className="text-[10px] text-foreground-muted">
                      {Math.round(project.audio.volume * 100)}%
                    </p>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-foreground">
                    <input
                      type="checkbox"
                      checked={project.audio.fadeIn}
                      onChange={(e) => setProject((prev) => ({
                        ...prev,
                        audio: prev.audio ? { ...prev.audio, fadeIn: e.target.checked } : undefined,
                      }))}
                      className="rounded"
                    />
                    Fade in at start
                  </label>

                  <label className="flex items-center gap-2 text-xs text-foreground">
                    <input
                      type="checkbox"
                      checked={project.audio.fadeOut}
                      onChange={(e) => setProject((prev) => ({
                        ...prev,
                        audio: prev.audio ? { ...prev.audio, fadeOut: e.target.checked } : undefined,
                      }))}
                      className="rounded"
                    />
                    Fade out at end
                  </label>

                  <button
                    onClick={() => setProject((prev) => ({ ...prev, audio: undefined }))}
                    className="w-full rounded-lg border border-[var(--card-border)] px-4 py-2 text-xs font-medium text-foreground-muted hover:bg-[var(--background-hover)]"
                  >
                    Remove Audio
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "branding" && (
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={project.branding.showLogo}
                  onChange={(e) => setProject((prev) => ({
                    ...prev,
                    branding: { ...prev.branding, showLogo: e.target.checked },
                  }))}
                  className="rounded"
                />
                Show Logo
              </label>

              {project.branding.showLogo && (
                <div>
                  <label htmlFor={`${id}-logoPos`} className="text-xs font-semibold text-foreground-muted">
                    Logo Position
                  </label>
                  <select
                    id={`${id}-logoPos`}
                    value={project.branding.logoPosition}
                    onChange={(e) => setProject((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, logoPosition: e.target.value as VideoProject["branding"]["logoPosition"] },
                    }))}
                    className="mt-1 h-8 w-full rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                  >
                    <option value="top-left">Top Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor={`${id}-primaryColor`} className="text-xs font-semibold text-foreground-muted">
                  Primary Color
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    id={`${id}-primaryColor`}
                    type="text"
                    value={project.branding.primaryColor}
                    onChange={(e) => setProject((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, primaryColor: e.target.value },
                    }))}
                    className="h-8 flex-1 rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                  />
                  <input
                    type="color"
                    value={project.branding.primaryColor}
                    onChange={(e) => setProject((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, primaryColor: e.target.value },
                    }))}
                    className="h-8 w-8 cursor-pointer rounded border border-[var(--card-border)]"
                    aria-label="Primary brand color"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={`${id}-secondaryColor`} className="text-xs font-semibold text-foreground-muted">
                  Secondary Color
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    id={`${id}-secondaryColor`}
                    type="text"
                    value={project.branding.secondaryColor}
                    onChange={(e) => setProject((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, secondaryColor: e.target.value },
                    }))}
                    className="h-8 flex-1 rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                  />
                  <input
                    type="color"
                    value={project.branding.secondaryColor}
                    onChange={(e) => setProject((prev) => ({
                      ...prev,
                      branding: { ...prev.branding, secondaryColor: e.target.value },
                    }))}
                    className="h-8 w-8 cursor-pointer rounded border border-[var(--card-border)]"
                    aria-label="Secondary brand color"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={project.branding.showWatermark}
                  onChange={(e) => setProject((prev) => ({
                    ...prev,
                    branding: { ...prev.branding, showWatermark: e.target.checked },
                  }))}
                  className="rounded"
                />
                Show Watermark
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { VideoProject, VideoSlide, TextOverlay, KenBurnsEffect, AudioTrack };
