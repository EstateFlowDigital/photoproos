"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { BrandKit, PlatformId } from "@/components/marketing-studio/types";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Palette,
  Type,
  Hash,
  AtSign,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Twitter,
  Facebook,
  Check,
  X,
} from "lucide-react";

// Custom icons for platforms not in lucide
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.95s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.52.77 1.52 1.68 0 1.02-.65 2.55-.99 3.97-.28 1.19.6 2.16 1.78 2.16 2.13 0 3.77-2.25 3.77-5.49 0-2.87-2.06-4.88-5-4.88-3.41 0-5.41 2.55-5.41 5.2 0 1.02.39 2.13.89 2.73a.35.35 0 0 1 .08.34l-.33 1.35c-.05.22-.18.27-.41.16-1.53-.72-2.49-2.96-2.49-4.77 0-3.88 2.82-7.45 8.14-7.45 4.28 0 7.6 3.05 7.6 7.12 0 4.25-2.68 7.67-6.4 7.67-1.25 0-2.42-.65-2.82-1.42l-.77 2.93c-.28 1.07-1.03 2.42-1.54 3.24A12 12 0 1 0 12 0z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<PlatformId, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  tiktok: TikTokIcon,
  pinterest: PinterestIcon,
};

const PLATFORM_NAMES: Record<PlatformId, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  twitter: "Twitter/X",
  facebook: "Facebook",
  tiktok: "TikTok",
  pinterest: "Pinterest",
};

const DEFAULT_BRAND_KIT: BrandKit = {
  id: "default",
  businessName: "PhotoProOS",
  tagline: "The Business OS for Photographers",
  primaryColor: "#3b82f6",
  secondaryColor: "#8b5cf6",
  accentColor: "#22c55e",
  handles: [],
  defaultHashtags: ["#photography", "#photographer"],
  gradients: [
    { name: "Primary", from: "#3b82f6", to: "#8b5cf6", angle: 135 },
  ],
};

const PRESET_COLORS = [
  "#3b82f6", "#8b5cf6", "#22c55e", "#f97316", "#ef4444",
  "#ec4899", "#14b8a6", "#f59e0b", "#6366f1", "#84cc16",
];

export function BrandKitEditor() {
  const [brandKit, setBrandKit] = React.useState<BrandKit>(DEFAULT_BRAND_KIT);
  const [isSaving, setIsSaving] = React.useState(false);
  const [newHashtag, setNewHashtag] = React.useState("");
  const [newHandle, setNewHandle] = React.useState<{ platform: PlatformId; username: string }>({
    platform: "instagram",
    username: "",
  });

  // Update a field in the brand kit
  const updateField = React.useCallback(<K extends keyof BrandKit>(key: K, value: BrandKit[K]) => {
    setBrandKit((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Add a hashtag
  const addHashtag = React.useCallback(() => {
    if (!newHashtag) return;
    const tag = newHashtag.startsWith("#") ? newHashtag : `#${newHashtag}`;
    if (!brandKit.defaultHashtags.includes(tag)) {
      updateField("defaultHashtags", [...brandKit.defaultHashtags, tag]);
    }
    setNewHashtag("");
  }, [newHashtag, brandKit.defaultHashtags, updateField]);

  // Remove a hashtag
  const removeHashtag = React.useCallback((tag: string) => {
    updateField("defaultHashtags", brandKit.defaultHashtags.filter((t) => t !== tag));
  }, [brandKit.defaultHashtags, updateField]);

  // Add a social handle
  const addHandle = React.useCallback(() => {
    if (!newHandle.username) return;
    const username = newHandle.username.startsWith("@")
      ? newHandle.username.slice(1)
      : newHandle.username;
    const exists = brandKit.handles.some((h) => h.platform === newHandle.platform);
    if (!exists) {
      updateField("handles", [...brandKit.handles, { platform: newHandle.platform, username }]);
    }
    setNewHandle({ platform: "instagram", username: "" });
  }, [newHandle, brandKit.handles, updateField]);

  // Remove a social handle
  const removeHandle = React.useCallback((platform: PlatformId) => {
    updateField("handles", brandKit.handles.filter((h) => h.platform !== platform));
  }, [brandKit.handles, updateField]);

  // Save brand kit
  const handleSave = React.useCallback(async () => {
    setIsSaving(true);
    // In a real app, this would save to the database
    await new Promise((resolve) => setTimeout(resolve, 500));
    toast.success("Brand Kit saved successfully");
    setIsSaving(false);
  }, []);

  // Handle hashtag input keydown
  const handleHashtagKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addHashtag();
    }
  }, [addHashtag]);

  // Handle handle input keydown
  const handleHandleKeyDown = React.useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addHandle();
    }
  }, [addHandle]);

  return (
    <div className="brand-kit-editor min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--card)] px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/super-admin/marketing-studio"
              className="flex items-center gap-1 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-lg p-1"
              aria-label="Back to Marketing Studio"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-6 w-px bg-[var(--card-border)] hidden sm:block" aria-hidden="true" />
            <h1 className="text-base sm:text-lg font-semibold text-[var(--foreground)]">
              Brand Kit
            </h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 sm:px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
            aria-label={isSaving ? "Saving changes..." : "Save changes"}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Changes"}</span>
            <span className="sm:hidden">{isSaving ? "..." : "Save"}</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Business Identity */}
        <section
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-6"
          aria-labelledby="identity-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <Type className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="identity-heading" className="text-base font-semibold text-[var(--foreground)]">Business Identity</h2>
              <p className="text-sm text-[var(--foreground-muted)]">Your business name and tagline</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="business-name" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Business Name
              </label>
              <input
                id="business-name"
                type="text"
                value={brandKit.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                placeholder="Your Business Name"
              />
            </div>
            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Tagline
              </label>
              <input
                id="tagline"
                type="text"
                value={brandKit.tagline || ""}
                onChange={(e) => updateField("tagline", e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                placeholder="Your catchy tagline"
              />
            </div>
          </div>
        </section>

        {/* Brand Colors */}
        <section
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-6"
          aria-labelledby="colors-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="colors-heading" className="text-base font-semibold text-[var(--foreground)]">Brand Colors</h2>
              <p className="text-sm text-[var(--foreground-muted)]">Your primary, secondary, and accent colors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Color */}
            <div>
              <label htmlFor="primary-color" className="block text-sm font-medium text-[var(--foreground)] mb-3">
                Primary Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-lg border border-[var(--border)] cursor-pointer relative overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: brandKit.primaryColor }}
                >
                  <input
                    id="primary-color"
                    type="color"
                    value={brandKit.primaryColor}
                    onChange={(e) => updateField("primaryColor", e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Primary color picker"
                  />
                </div>
                <input
                  type="text"
                  value={brandKit.primaryColor}
                  onChange={(e) => updateField("primaryColor", e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] font-mono focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  aria-label="Primary color hex value"
                />
              </div>
              <div className="flex gap-1 mt-2" role="group" aria-label="Primary color presets">
                {PRESET_COLORS.slice(0, 5).map((color) => (
                  <button
                    key={color}
                    onClick={() => updateField("primaryColor", color)}
                    className={cn(
                      "h-6 w-6 rounded-md border-2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
                      brandKit.primaryColor === color ? "border-white" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Set primary color to ${color}`}
                    aria-pressed={brandKit.primaryColor === color}
                  />
                ))}
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <label htmlFor="secondary-color" className="block text-sm font-medium text-[var(--foreground)] mb-3">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-lg border border-[var(--border)] cursor-pointer relative overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: brandKit.secondaryColor }}
                >
                  <input
                    id="secondary-color"
                    type="color"
                    value={brandKit.secondaryColor || "#8b5cf6"}
                    onChange={(e) => updateField("secondaryColor", e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Secondary color picker"
                  />
                </div>
                <input
                  type="text"
                  value={brandKit.secondaryColor || ""}
                  onChange={(e) => updateField("secondaryColor", e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] font-mono focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  aria-label="Secondary color hex value"
                />
              </div>
              <div className="flex gap-1 mt-2" role="group" aria-label="Secondary color presets">
                {PRESET_COLORS.slice(5, 10).map((color) => (
                  <button
                    key={color}
                    onClick={() => updateField("secondaryColor", color)}
                    className={cn(
                      "h-6 w-6 rounded-md border-2 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
                      brandKit.secondaryColor === color ? "border-white" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Set secondary color to ${color}`}
                    aria-pressed={brandKit.secondaryColor === color}
                  />
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <label htmlFor="accent-color" className="block text-sm font-medium text-[var(--foreground)] mb-3">
                Accent Color
              </label>
              <div className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-lg border border-[var(--border)] cursor-pointer relative overflow-hidden flex-shrink-0"
                  style={{ backgroundColor: brandKit.accentColor }}
                >
                  <input
                    id="accent-color"
                    type="color"
                    value={brandKit.accentColor || "#22c55e"}
                    onChange={(e) => updateField("accentColor", e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-label="Accent color picker"
                  />
                </div>
                <input
                  type="text"
                  value={brandKit.accentColor || ""}
                  onChange={(e) => updateField("accentColor", e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] font-mono focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  aria-label="Accent color hex value"
                />
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="mt-6 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]" aria-label="Color preview">
            <p className="text-xs text-[var(--foreground-muted)] mb-3">Preview</p>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="h-14 sm:h-16 w-20 sm:w-24 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                style={{ backgroundColor: brandKit.primaryColor }}
              >
                Primary
              </div>
              <div
                className="h-14 sm:h-16 w-20 sm:w-24 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                style={{ backgroundColor: brandKit.secondaryColor }}
              >
                Secondary
              </div>
              <div
                className="h-14 sm:h-16 w-20 sm:w-24 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-medium"
                style={{ backgroundColor: brandKit.accentColor }}
              >
                Accent
              </div>
              <div
                className="h-14 sm:h-16 flex-1 min-w-[120px] rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${brandKit.primaryColor}, ${brandKit.secondaryColor})`,
                }}
                aria-label="Gradient preview"
              />
            </div>
          </div>
        </section>

        {/* Logo Upload */}
        <section
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-6"
          aria-labelledby="logo-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="logo-heading" className="text-base font-semibold text-[var(--foreground)]">Logo</h2>
              <p className="text-sm text-[var(--foreground-muted)]">Upload your logo variants</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {["Full Logo", "Icon Only", "Light Version", "Dark Version"].map((variant) => (
              <div key={variant} className="text-center">
                <button
                  className="w-full aspect-square rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--background)] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                  aria-label={`Upload ${variant}`}
                >
                  <Upload className="h-6 w-6 text-[var(--foreground-muted)]" aria-hidden="true" />
                  <span className="text-xs text-[var(--foreground-muted)]">Upload</span>
                </button>
                <p className="text-xs text-[var(--foreground-muted)] mt-2">{variant}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social Handles */}
        <section
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-6"
          aria-labelledby="handles-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <AtSign className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="handles-heading" className="text-base font-semibold text-[var(--foreground)]">Social Handles</h2>
              <p className="text-sm text-[var(--foreground-muted)]">Your usernames on each platform</p>
            </div>
          </div>

          {/* Current handles */}
          <ul className="space-y-2 mb-4" aria-label="Current social handles">
            {brandKit.handles.length === 0 && (
              <li className="text-sm text-[var(--foreground-muted)] py-2">No social handles added yet</li>
            )}
            {brandKit.handles.map((handle) => {
              const Icon = PLATFORM_ICONS[handle.platform];
              return (
                <li
                  key={handle.platform}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-[var(--foreground-muted)]" aria-hidden="true" />
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {PLATFORM_NAMES[handle.platform]}
                    </span>
                    <span className="text-sm text-[var(--foreground-muted)]">
                      @{handle.username}
                    </span>
                  </div>
                  <button
                    onClick={() => removeHandle(handle.platform)}
                    className="text-[var(--foreground-muted)] hover:text-[var(--error)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded p-1"
                    aria-label={`Remove ${PLATFORM_NAMES[handle.platform]} handle`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Add new handle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div>
              <label htmlFor="platform-select" className="sr-only">Select platform</label>
              <select
                id="platform-select"
                value={newHandle.platform}
                onChange={(e) => setNewHandle({ ...newHandle, platform: e.target.value as PlatformId })}
                className="w-full sm:w-auto rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              >
                {(Object.keys(PLATFORM_NAMES) as PlatformId[]).map((platform) => (
                  <option key={platform} value={platform}>
                    {PLATFORM_NAMES[platform]}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" aria-hidden="true">@</span>
              <label htmlFor="handle-username" className="sr-only">Username</label>
              <input
                id="handle-username"
                type="text"
                value={newHandle.username}
                onChange={(e) => setNewHandle({ ...newHandle, username: e.target.value })}
                onKeyDown={handleHandleKeyDown}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-7 pr-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                placeholder="username"
              />
            </div>
            <button
              onClick={addHandle}
              disabled={!newHandle.username}
              className="flex items-center justify-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              aria-label="Add social handle"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </button>
          </div>
        </section>

        {/* Default Hashtags */}
        <section
          className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 sm:p-6"
          aria-labelledby="hashtags-heading"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <Hash className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
            </div>
            <div>
              <h2 id="hashtags-heading" className="text-base font-semibold text-[var(--foreground)]">Default Hashtags</h2>
              <p className="text-sm text-[var(--foreground-muted)]">Hashtags to include by default in your posts</p>
            </div>
          </div>

          {/* Current hashtags */}
          <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Current hashtags">
            {brandKit.defaultHashtags.map((tag) => (
              <span
                key={tag}
                role="listitem"
                className="inline-flex items-center gap-1 rounded-full bg-[var(--primary)]/10 px-3 py-1 text-sm text-[var(--primary)]"
              >
                {tag}
                <button
                  onClick={() => removeHashtag(tag)}
                  className="hover:text-[var(--error)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-full p-0.5"
                  aria-label={`Remove hashtag ${tag}`}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            ))}
            {brandKit.defaultHashtags.length === 0 && (
              <p className="text-sm text-[var(--foreground-muted)]">No default hashtags added yet</p>
            )}
          </div>

          {/* Add new hashtag */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)]" aria-hidden="true">#</span>
              <label htmlFor="new-hashtag" className="sr-only">New hashtag</label>
              <input
                id="new-hashtag"
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value.replace(/^#/, ""))}
                onKeyDown={handleHashtagKeyDown}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-7 pr-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                placeholder="hashtag"
              />
            </div>
            <button
              onClick={addHashtag}
              disabled={!newHashtag}
              className="flex items-center justify-center gap-1 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              aria-label="Add hashtag"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
