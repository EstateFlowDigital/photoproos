"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ASPECT_RATIO_PRESETS } from "../types";
import type { AspectRatioPreset, PresentationOptions } from "../types";

interface MockupCanvasProps {
  children: React.ReactNode;
  aspectRatio: string;
  presentation: PresentationOptions;
  className?: string;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

export function MockupCanvas({
  children,
  aspectRatio,
  presentation,
  className,
  canvasRef,
}: MockupCanvasProps) {
  const preset = ASPECT_RATIO_PRESETS.find((p) => p.id === aspectRatio);

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (presentation.background) {
      case "gradient":
        return {
          background: presentation.backgroundGradient
            ? `linear-gradient(${presentation.backgroundGradient.angle}deg, ${presentation.backgroundGradient.from}, ${presentation.backgroundGradient.to})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        };
      case "solid":
        return {
          backgroundColor: "var(--background)",
        };
      case "dark":
        return {
          backgroundColor: "#0a0a0a",
        };
      case "light":
        return {
          backgroundColor: "#ffffff",
        };
      case "pattern":
        return {
          backgroundColor: "var(--background)",
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        };
      case "transparent":
      default:
        return {
          backgroundColor: "transparent",
        };
    }
  };

  const getPadding = (): string => {
    switch (presentation.padding) {
      case "small":
        return "p-4";
      case "medium":
        return "p-8";
      case "large":
        return "p-16";
      case "none":
      default:
        return "p-0";
    }
  };

  const getShadow = (): string => {
    switch (presentation.shadow) {
      case "subtle":
        return "shadow-lg";
      case "medium":
        return "shadow-xl";
      case "dramatic":
        return "shadow-2xl shadow-black/40";
      case "none":
      default:
        return "";
    }
  };

  const getBorderRadius = (): string => {
    switch (presentation.borderRadius) {
      case "small":
        return "rounded-lg";
      case "medium":
        return "rounded-xl";
      case "large":
        return "rounded-2xl";
      case "none":
      default:
        return "";
    }
  };

  const getAspectStyle = (): React.CSSProperties => {
    if (!preset || preset.id === "auto") {
      return {};
    }
    return {
      aspectRatio: `${preset.width} / ${preset.height}`,
    };
  };

  return (
    <div
      className={cn(
        "mockup-canvas relative overflow-hidden",
        getBorderRadius(),
        className
      )}
      style={getBackgroundStyle()}
    >
      <div
        ref={canvasRef}
        className={cn(
          "mockup-content relative",
          getPadding(),
          preset?.id !== "auto" && "flex items-center justify-center"
        )}
        style={{
          ...getAspectStyle(),
          transform: presentation.rotation
            ? `rotate(${presentation.rotation}deg)`
            : undefined,
        }}
      >
        <div className={cn("mockup-inner w-full", getShadow(), getBorderRadius())}>
          {children}
        </div>
      </div>

      {/* Watermark */}
      {presentation.watermark && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-medium text-white">PhotoProOS</span>
        </div>
      )}
    </div>
  );
}
