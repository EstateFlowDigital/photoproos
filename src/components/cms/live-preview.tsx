"use client";

import { useState, useMemo } from "react";
import { Monitor, Tablet, Smartphone, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageRenderer } from "./component-renderers";
import type { PageComponentInstance } from "@/lib/cms/page-builder-utils";

export type DeviceType = "desktop" | "tablet" | "mobile";

interface DeviceConfig {
  width: number;
  label: string;
  icon: typeof Monitor;
}

const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
  desktop: { width: 1440, label: "Desktop", icon: Monitor },
  tablet: { width: 768, label: "Tablet", icon: Tablet },
  mobile: { width: 375, label: "Mobile", icon: Smartphone },
};

interface DeviceToggleProps {
  device: DeviceType;
  onChange: (device: DeviceType) => void;
}

export function DeviceToggle({ device, onChange }: DeviceToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-[var(--background-tertiary)] rounded-lg">
      {(Object.entries(DEVICE_CONFIGS) as [DeviceType, DeviceConfig][]).map(
        ([key, config]) => {
          const Icon = config.icon;
          const isActive = device === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                "p-2 rounded-md transition-all",
                isActive
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)]"
              )}
              title={config.label}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        }
      )}
    </div>
  );
}

interface LivePreviewProps {
  components: PageComponentInstance[];
  className?: string;
  initialDevice?: DeviceType;
}

export function LivePreview({
  components,
  className,
  initialDevice = "desktop",
}: LivePreviewProps) {
  const [device, setDevice] = useState<DeviceType>(initialDevice);
  const [key, setKey] = useState(0);
  const [scale, setScale] = useState(1);

  const deviceWidth = DEVICE_CONFIGS[device].width;

  // Calculate scale to fit the preview in the container
  const calculateScale = useMemo(() => {
    // This will be recalculated based on container width
    // For now, use a reasonable default
    const containerWidth = 800; // Approximate preview panel width
    const padding = 48; // Account for padding
    const availableWidth = containerWidth - padding;

    if (deviceWidth > availableWidth) {
      return availableWidth / deviceWidth;
    }
    return 1;
  }, [deviceWidth]);

  const refreshPreview = () => {
    setKey(k => k + 1);
  };

  return (
    <div className={cn("flex flex-col h-full bg-[var(--card)]", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Preview</span>
          <span className="text-xs text-[var(--foreground-muted)]">
            {deviceWidth}px
          </span>
        </div>

        <div className="flex items-center gap-3">
          <DeviceToggle device={device} onChange={setDevice} />
          <button
            onClick={refreshPreview}
            className="p-2 rounded-md text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-auto p-6 bg-[var(--background-tertiary)]">
        <div
          className="mx-auto bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300"
          style={{
            width: deviceWidth,
            transform: `scale(${calculateScale})`,
            transformOrigin: "top center",
          }}
        >
          <div
            key={key}
            className="min-h-screen bg-[var(--background)]"
            style={{
              // Simulate viewport width for responsive styles
              containerType: "inline-size",
            }}
          >
            {components.length === 0 ? (
              <div className="flex items-center justify-center min-h-[400px] text-[var(--foreground-muted)]">
                <p>Add components to see preview</p>
              </div>
            ) : (
              <PageRenderer components={components} />
            )}
          </div>
        </div>
      </div>

      {/* Scale indicator */}
      {calculateScale < 1 && (
        <div className="px-4 py-2 text-xs text-center text-[var(--foreground-muted)] border-t border-[var(--border)]">
          Scaled to {Math.round(calculateScale * 100)}% to fit
        </div>
      )}
    </div>
  );
}

/**
 * Split View with Live Preview
 * Shows canvas on left and live preview on right
 */
interface SplitPreviewProps {
  components: PageComponentInstance[];
  canvasContent: React.ReactNode;
  className?: string;
}

export function SplitPreview({
  components,
  canvasContent,
  className,
}: SplitPreviewProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [previewWidth, setPreviewWidth] = useState(400);

  return (
    <div className={cn("flex h-full", className)}>
      {/* Canvas */}
      <div className="flex-1 min-w-0">{canvasContent}</div>

      {/* Resizable Preview Panel */}
      {showPreview && (
        <>
          {/* Resize Handle */}
          <div
            className="w-1 bg-[var(--border)] hover:bg-[var(--primary)] cursor-col-resize transition-colors"
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = previewWidth;

              const onMouseMove = (e: MouseEvent) => {
                const delta = startX - e.clientX;
                setPreviewWidth(Math.max(300, Math.min(800, startWidth + delta)));
              };

              const onMouseUp = () => {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);
              };

              window.addEventListener("mousemove", onMouseMove);
              window.addEventListener("mouseup", onMouseUp);
            }}
          />

          {/* Preview Panel */}
          <div style={{ width: previewWidth }} className="flex-shrink-0">
            <LivePreview components={components} initialDevice="mobile" />
          </div>
        </>
      )}
    </div>
  );
}
