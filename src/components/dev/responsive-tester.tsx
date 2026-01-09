"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import { X, Monitor, Tablet, Smartphone, Maximize2, Settings2, RotateCcw } from "lucide-react";

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

// Context for sharing viewport state
interface ViewportContextType {
  viewport: { width: number; height: number } | null;
  scale: number;
}

const ViewportContext = createContext<ViewportContextType>({ viewport: null, scale: 1 });

export function useViewport() {
  return useContext(ViewportContext);
}

export function ResponsiveTester({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [isEnabled, setIsEnabled] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ViewportPreset | null>(null);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [scale, setScale] = useState(1);
  const [autoScale, setAutoScale] = useState(true);

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
    setScale(1);
  };

  const getViewportDimensions = () => {
    if (!selectedPreset) return null;
    return orientation === "portrait"
      ? { width: selectedPreset.width, height: selectedPreset.height }
      : { width: selectedPreset.height, height: selectedPreset.width };
  };

  const dimensions = getViewportDimensions();

  // Calculate auto-scale to fit viewport in window
  useEffect(() => {
    if (!dimensions || !autoScale) {
      setScale(1);
      return;
    }

    const updateScale = () => {
      const availableWidth = window.innerWidth - 48; // padding
      const availableHeight = window.innerHeight - 120; // space for controls

      const scaleX = availableWidth / dimensions.width;
      const scaleY = availableHeight / dimensions.height;
      const newScale = Math.min(scaleX, scaleY, 1); // Never scale up, only down

      setScale(newScale);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [dimensions, autoScale]);

  // If not developer, just render children normally
  if (!isDeveloper) {
    return <>{children}</>;
  }

  const isViewportActive = isEnabled && selectedPreset && dimensions;

  return (
    <ViewportContext.Provider value={{ viewport: dimensions, scale }}>
      {/* Main Content - constrained when viewport is active */}
      {isViewportActive ? (
        <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
          {/* Viewport Frame */}
          <div
            className="relative bg-[var(--background)] overflow-auto border-2 border-[var(--primary)] shadow-2xl"
            style={{
              width: dimensions.width,
              height: dimensions.height,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {children}
          </div>

          {/* Viewport Label */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[var(--primary)] text-white text-sm font-medium rounded-lg shadow-lg z-[9999]">
            {selectedPreset.name} — {dimensions.width}×{dimensions.height}
            {scale < 1 && <span className="ml-2 opacity-70">({Math.round(scale * 100)}%)</span>}
          </div>
        </div>
      ) : (
        children
      )}

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
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  orientation === "landscape"
                    ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                    : "bg-[#1a1a1a] text-white hover:bg-[#252525]"
                }`}
                title={`Switch to ${orientation === "portrait" ? "landscape" : "portrait"}`}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Auto Scale Toggle */}
            {selectedPreset && (
              <button
                onClick={() => setAutoScale(!autoScale)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  autoScale
                    ? "bg-[var(--primary)]/20 text-[var(--primary)]"
                    : "bg-[#1a1a1a] text-[#7c7c7c] hover:text-white hover:bg-[#252525]"
                }`}
                title={autoScale ? "Disable auto-scale" : "Enable auto-scale"}
              >
                {autoScale ? "Auto" : "1:1"}
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
            <WindowSizeIndicator />
          </div>

          {/* Viewport Preset Panel */}
          {showPanel && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] bg-[#141414] border border-[rgba(255,255,255,0.12)] rounded-xl p-4 shadow-2xl w-[400px] max-h-[60vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
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
        </>
      )}
    </ViewportContext.Provider>
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

function WindowSizeIndicator() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="px-3 py-2 text-xs text-[#7c7c7c] border-l border-[rgba(255,255,255,0.08)]">
      Window: {size.width}×{size.height}
    </div>
  );
}
