"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  MOCKUPS,
  getFilteredMockups,
  getMockupCountsByCategory,
  getMockupById,
} from "@/components/mockups/mockup-registry";
import { ASPECT_RATIO_PRESETS } from "@/components/mockups/types";
import type { IndustryId, MockupCategory, PresentationOptions } from "@/components/mockups/types";
import { INDUSTRIES, getIndustriesArray } from "@/lib/constants/industries";
import { exportToPng, copyToClipboard, getExportFilename } from "@/lib/mockups/export";
import {
  Download,
  Copy,
  Sun,
  Moon,
  ChevronDown,
  Check,
  Palette,
  ImageIcon,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULT_PRESENTATION: PresentationOptions = {
  background: "solid",
  padding: "medium",
  shadow: "medium",
  borderRadius: "medium",
  rotation: 0,
  watermark: false,
};

export function MockupsPageClient() {
  const [selectedCategory, setSelectedCategory] = React.useState<MockupCategory | null>(null);
  const [selectedMockupId, setSelectedMockupId] = React.useState<string>("full-dashboard");
  const [industry, setIndustry] = React.useState<IndustryId>("real_estate");
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [aspectRatio, setAspectRatio] = React.useState("auto");
  const [customData, setCustomData] = React.useState<Record<string, unknown>>({});
  const [presentation, setPresentation] = React.useState<PresentationOptions>(DEFAULT_PRESENTATION);
  const [isExporting, setIsExporting] = React.useState(false);

  const canvasRef = React.useRef<HTMLDivElement>(null);

  const industries = getIndustriesArray();
  const mockupCounts = getMockupCountsByCategory(industry);
  const filteredMockups = getFilteredMockups(selectedCategory, industry);
  const selectedMockup = getMockupById(selectedMockupId);

  const handleExportPng = async () => {
    if (!canvasRef.current || !selectedMockup) return;
    setIsExporting(true);
    try {
      const filename = getExportFilename(selectedMockup.id, industry, aspectRatio);
      await exportToPng(canvasRef.current, filename, {
        backgroundColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
      });
      toast.success("Exported as PNG");
    } catch {
      toast.error("Failed to export");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) return;
    setIsExporting(true);
    try {
      await copyToClipboard(canvasRef.current, {
        backgroundColor: theme === "dark" ? "#0a0a0a" : "#ffffff",
      });
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetData = () => {
    setCustomData({});
    toast.success("Reset to defaults");
  };

  const handleFieldChange = (key: string, value: unknown) => {
    setCustomData((prev) => ({ ...prev, [key]: value }));
  };

  // Get merged data (custom overrides default)
  const getMergedData = () => {
    if (!selectedMockup) return {};
    const defaults = selectedMockup.getDefaultData(industry);
    return { ...defaults, ...customData };
  };

  return (
    <div className="mockups-page flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Sidebar - Categories */}
      <div className="w-56 shrink-0 border-r border-[var(--card-border)] bg-[var(--background-secondary)] overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xs font-semibold text-foreground-muted uppercase tracking-wider mb-3">
            Categories
          </h2>
          <nav className="space-y-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                selectedCategory === null
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
              )}
            >
              <span>All Mockups</span>
              <span className="text-xs opacity-60">{MOCKUPS.length}</span>
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  selectedCategory === cat.id
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <cat.icon className="h-4 w-4" />
                  <span>{cat.name}</span>
                </div>
                <span className="text-xs opacity-60">{mockupCounts[cat.id]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Controls Bar */}
        <div className="shrink-0 border-b border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left controls */}
            <div className="flex items-center gap-3">
              {/* Industry selector */}
              <div className="relative">
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value as IndustryId)}
                  className="appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 pr-8 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none cursor-pointer"
                >
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.shortName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted pointer-events-none" />
              </div>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)]"
              >
                {theme === "dark" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                {theme === "dark" ? "Dark" : "Light"}
              </button>

              {/* Color picker */}
              <div className="relative flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                <Palette className="h-4 w-4 text-foreground-muted" />
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-5 w-5 cursor-pointer appearance-none rounded border-0 bg-transparent"
                />
              </div>
            </div>

            {/* Right controls - Export */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyToClipboard}
                disabled={isExporting}
                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                onClick={handleExportPng}
                disabled={isExporting}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export PNG
              </button>
            </div>
          </div>

          {/* Aspect ratio presets */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-foreground-muted">Aspect:</span>
            {ASPECT_RATIO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setAspectRatio(preset.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  aspectRatio === preset.id
                    ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                    : "text-foreground-muted hover:bg-[var(--background-hover)]"
                )}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas and mockup grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Selected mockup preview */}
          {selectedMockup && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedMockup.name}</h3>
                  <p className="text-sm text-foreground-muted">{selectedMockup.description}</p>
                </div>
                <button
                  onClick={handleResetData}
                  className="flex items-center gap-2 text-xs text-foreground-muted hover:text-foreground"
                >
                  <RefreshCw className="h-3 w-3" />
                  Reset
                </button>
              </div>

              {/* Canvas */}
              <div
                ref={canvasRef}
                className={cn(
                  "mockup-canvas-wrapper rounded-xl overflow-hidden",
                  presentation.padding === "small" && "p-4",
                  presentation.padding === "medium" && "p-8",
                  presentation.padding === "large" && "p-16",
                  presentation.background === "solid" && "bg-[var(--background)]",
                  presentation.background === "dark" && "bg-[#0a0a0a]",
                  presentation.background === "light" && "bg-white"
                )}
              >
                <selectedMockup.component
                  data={getMergedData()}
                  theme={theme}
                  primaryColor={primaryColor}
                  industry={industry}
                />
              </div>

              {/* Field editor */}
              {selectedMockup.fields.length > 0 && (
                <div className="mt-6 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
                  <h4 className="text-sm font-medium text-foreground mb-4">Customize</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedMockup.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs text-foreground-muted mb-1.5">
                          {field.label}
                        </label>
                        {field.type === "select" ? (
                          <select
                            value={(getMergedData()[field.key] as string) || ""}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                          >
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        ) : field.type === "currency" || field.type === "number" ? (
                          <input
                            type="number"
                            value={(getMergedData()[field.key] as number) || ""}
                            onChange={(e) =>
                              handleFieldChange(field.key, parseFloat(e.target.value) || 0)
                            }
                            placeholder={field.placeholder}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                          />
                        ) : (
                          <input
                            type="text"
                            value={(getMergedData()[field.key] as string) || ""}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mockup grid */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {selectedCategory
                ? CATEGORIES.find((c) => c.id === selectedCategory)?.name
                : "All Mockups"}
              <span className="ml-2 text-foreground-muted font-normal">
                ({filteredMockups.length})
              </span>
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {filteredMockups.map((mockup) => (
                <button
                  key={mockup.id}
                  onClick={() => setSelectedMockupId(mockup.id)}
                  className={cn(
                    "group relative rounded-lg border bg-[var(--card)] p-4 text-left transition-all hover:border-[var(--primary)] hover:shadow-lg",
                    selectedMockupId === mockup.id
                      ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20"
                      : "border-[var(--card-border)]"
                  )}
                >
                  {/* Thumbnail placeholder */}
                  <div className="aspect-video rounded-lg bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 mb-3 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-[var(--primary)]/30" />
                  </div>

                  <h4 className="text-sm font-medium text-foreground truncate">
                    {mockup.name}
                  </h4>
                  <p className="text-xs text-foreground-muted mt-0.5 line-clamp-2">
                    {mockup.description}
                  </p>

                  {/* Selected indicator */}
                  {selectedMockupId === mockup.id && (
                    <div className="absolute top-2 right-2 rounded-full bg-[var(--primary)] p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
