"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { X, Monitor, Tablet, Smartphone, Maximize2, Settings2 } from "lucide-react";

// Only this email can see dev tools
const DEV_EMAIL = "cameron@houseandhomephoto.com";

interface ViewportPreset {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
}

const VIEWPORT_PRESETS: ViewportPreset[] = [
  { name: "iPhone SE", width: 375, height: 667, icon: <Smartphone className="w-4 h-4" /> },
  { name: "iPhone 14", width: 390, height: 844, icon: <Smartphone className="w-4 h-4" /> },
  { name: "iPhone 14 Pro Max", width: 430, height: 932, icon: <Smartphone className="w-4 h-4" /> },
  { name: "iPad Mini", width: 768, height: 1024, icon: <Tablet className="w-4 h-4" /> },
  { name: "iPad Pro 11\"", width: 834, height: 1194, icon: <Tablet className="w-4 h-4" /> },
  { name: "iPad Pro 12.9\"", width: 1024, height: 1366, icon: <Tablet className="w-4 h-4" /> },
  { name: "Laptop", width: 1366, height: 768, icon: <Monitor className="w-4 h-4" /> },
  { name: "Desktop", width: 1536, height: 864, icon: <Monitor className="w-4 h-4" /> },
  { name: "Large Desktop", width: 1920, height: 1080, icon: <Monitor className="w-4 h-4" /> },
  { name: "2K Display", width: 2560, height: 1440, icon: <Monitor className="w-4 h-4" /> },
];

export function ResponsiveTester() {
  const { user, isLoaded } = useUser();
  const [isEnabled, setIsEnabled] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ViewportPreset | null>(null);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  // Check localStorage for dev tools state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("photoproos-dev-tools");
      if (stored === "enabled") {
        setIsEnabled(true);
      }
    }
  }, []);

  // Only show for the developer email
  const isDeveloper =
    isLoaded &&
    user?.emailAddresses?.some(
      (e) => e.emailAddress?.toLowerCase() === DEV_EMAIL.toLowerCase()
    );

  if (!isDeveloper) {
    return null;
  }

  const toggleDevTools = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem("photoproos-dev-tools", newState ? "enabled" : "disabled");
    if (!newState) {
      setSelectedPreset(null);
      setShowPanel(false);
    }
  };

  const handlePresetSelect = (preset: ViewportPreset) => {
    setSelectedPreset(preset);
    setShowPanel(false);
  };

  const clearPreset = () => {
    setSelectedPreset(null);
  };

  const getViewportDimensions = () => {
    if (!selectedPreset) return null;
    return orientation === "portrait"
      ? { width: selectedPreset.width, height: selectedPreset.height }
      : { width: selectedPreset.height, height: selectedPreset.width };
  };

  const dimensions = getViewportDimensions();

  return (
    <>
      {/* Dev Tools Toggle Button - Always visible for developer */}
      <button
        onClick={toggleDevTools}
        className={`fixed bottom-4 right-4 z-[9999] p-3 rounded-full shadow-lg transition-all ${
          isEnabled
            ? "bg-[var(--primary)] text-white"
            : "bg-[#1a1a1a] text-[#7c7c7c] hover:text-white border border-[rgba(255,255,255,0.08)]"
        }`}
        title={isEnabled ? "Disable Dev Tools" : "Enable Dev Tools"}
      >
        <Settings2 className="w-5 h-5" />
      </button>

      {/* Dev Tools Panel */}
      {isEnabled && (
        <>
          {/* Control Bar */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 bg-[#141414] border border-[rgba(255,255,255,0.12)] rounded-xl p-2 shadow-2xl">
            {/* Viewport Selector */}
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1a1a1a] text-white text-sm font-medium hover:bg-[#252525] transition-colors"
            >
              {selectedPreset ? (
                <>
                  {selectedPreset.icon}
                  <span>{selectedPreset.name}</span>
                  <span className="text-[#7c7c7c] text-xs">
                    {dimensions?.width}×{dimensions?.height}
                  </span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Select Viewport</span>
                </>
              )}
            </button>

            {/* Orientation Toggle */}
            {selectedPreset && (
              <button
                onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}
                className="px-3 py-2 rounded-lg bg-[#1a1a1a] text-white text-sm hover:bg-[#252525] transition-colors"
                title={`Switch to ${orientation === "portrait" ? "landscape" : "portrait"}`}
              >
                {orientation === "portrait" ? "↕️" : "↔️"}
              </button>
            )}

            {/* Clear Button */}
            {selectedPreset && (
              <button
                onClick={clearPreset}
                className="p-2 rounded-lg bg-[#1a1a1a] text-[#7c7c7c] hover:text-white hover:bg-[#252525] transition-colors"
                title="Reset to full screen"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Current window size indicator */}
            <div className="px-3 py-2 text-xs text-[#7c7c7c] border-l border-[rgba(255,255,255,0.08)]">
              Window: {typeof window !== "undefined" ? `${window.innerWidth}×${window.innerHeight}` : "..."}
            </div>
          </div>

          {/* Viewport Preset Panel */}
          {showPanel && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] bg-[#141414] border border-[rgba(255,255,255,0.12)] rounded-xl p-4 shadow-2xl w-[400px] max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Viewport Presets</h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1 text-[#7c7c7c] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile */}
              <div className="mb-4">
                <p className="text-xs text-[#7c7c7c] uppercase tracking-wider mb-2">Mobile</p>
                <div className="grid grid-cols-1 gap-1">
                  {VIEWPORT_PRESETS.filter((p) => p.width <= 430).map((preset) => (
                    <PresetButton
                      key={preset.name}
                      preset={preset}
                      isSelected={selectedPreset?.name === preset.name}
                      onClick={() => handlePresetSelect(preset)}
                    />
                  ))}
                </div>
              </div>

              {/* Tablet */}
              <div className="mb-4">
                <p className="text-xs text-[#7c7c7c] uppercase tracking-wider mb-2">Tablet</p>
                <div className="grid grid-cols-1 gap-1">
                  {VIEWPORT_PRESETS.filter((p) => p.width > 430 && p.width <= 1024).map((preset) => (
                    <PresetButton
                      key={preset.name}
                      preset={preset}
                      isSelected={selectedPreset?.name === preset.name}
                      onClick={() => handlePresetSelect(preset)}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop */}
              <div>
                <p className="text-xs text-[#7c7c7c] uppercase tracking-wider mb-2">Desktop</p>
                <div className="grid grid-cols-1 gap-1">
                  {VIEWPORT_PRESETS.filter((p) => p.width > 1024).map((preset) => (
                    <PresetButton
                      key={preset.name}
                      preset={preset}
                      isSelected={selectedPreset?.name === preset.name}
                      onClick={() => handlePresetSelect(preset)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Viewport Constraint Overlay */}
          {selectedPreset && dimensions && (
            <ViewportOverlay width={dimensions.width} height={dimensions.height} />
          )}
        </>
      )}
    </>
  );
}

function PresetButton({
  preset,
  isSelected,
  onClick,
}: {
  preset: ViewportPreset;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
        isSelected
          ? "bg-[var(--primary)] text-white"
          : "bg-[#1a1a1a] text-white hover:bg-[#252525]"
      }`}
    >
      {preset.icon}
      <span className="flex-1 text-sm">{preset.name}</span>
      <span className="text-xs opacity-60">
        {preset.width}×{preset.height}
      </span>
    </button>
  );
}

function ViewportOverlay({ width, height }: { width: number; height: number }) {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Calculate the visible area dimensions
  const availableHeight = windowSize.height - 80; // Account for control bar
  const availableWidth = windowSize.width;

  // Check if viewport fits
  const fitsWidth = width <= availableWidth;
  const fitsHeight = height <= availableHeight;

  // Calculate overlay positions
  const leftOverlayWidth = Math.max(0, (availableWidth - width) / 2);
  const rightOverlayWidth = leftOverlayWidth;
  const topOverlayHeight = Math.max(0, (availableHeight - height) / 2);
  const bottomOverlayHeight = topOverlayHeight;

  return (
    <>
      {/* Left Overlay */}
      {fitsWidth && leftOverlayWidth > 0 && (
        <div
          className="fixed top-0 left-0 bg-black/80 z-[9990] pointer-events-none"
          style={{ width: leftOverlayWidth, height: availableHeight }}
        />
      )}

      {/* Right Overlay */}
      {fitsWidth && rightOverlayWidth > 0 && (
        <div
          className="fixed top-0 right-0 bg-black/80 z-[9990] pointer-events-none"
          style={{ width: rightOverlayWidth, height: availableHeight }}
        />
      )}

      {/* Top Overlay */}
      {fitsHeight && topOverlayHeight > 0 && (
        <div
          className="fixed top-0 bg-black/80 z-[9990] pointer-events-none"
          style={{
            left: leftOverlayWidth,
            width: width,
            height: topOverlayHeight,
          }}
        />
      )}

      {/* Bottom Overlay */}
      {fitsHeight && bottomOverlayHeight > 0 && (
        <div
          className="fixed bg-black/80 z-[9990] pointer-events-none"
          style={{
            left: leftOverlayWidth,
            top: topOverlayHeight + height,
            width: width,
            height: bottomOverlayHeight,
          }}
        />
      )}

      {/* Viewport Frame Border */}
      <div
        className="fixed border-2 border-[var(--primary)] border-dashed z-[9991] pointer-events-none"
        style={{
          left: fitsWidth ? leftOverlayWidth : 0,
          top: fitsHeight ? topOverlayHeight : 0,
          width: Math.min(width, availableWidth),
          height: Math.min(height, availableHeight),
        }}
      >
        {/* Size indicator */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-[var(--primary)] text-white text-xs rounded">
          {width}×{height}
        </div>
      </div>

      {/* Warning if viewport is larger than window */}
      {(!fitsWidth || !fitsHeight) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 bg-[var(--warning)] text-black text-sm rounded-lg font-medium">
          Viewport ({width}×{height}) is larger than your window. Resize your browser or use a smaller preset.
        </div>
      )}
    </>
  );
}
