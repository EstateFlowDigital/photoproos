"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { updateOrganizationBranding } from "@/lib/actions/settings";
import { useToast } from "@/components/ui/toast";

interface BrandingSettingsFormProps {
  settings: {
    logoUrl: string | null;
    businessName: string;
    primaryColor: string;
    secondaryColor: string;
    customDomain: string | null;
    slug: string;
  };
  colorPresets: { name: string; primary: string; secondary: string }[];
}

export function BrandingSettingsForm({ settings, colorPresets }: BrandingSettingsFormProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
  const [galleryTheme, setGalleryTheme] = useState<"dark" | "light">("dark");
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkPosition, setWatermarkPosition] = useState("bottom-right");

  const handleUploadLogo = () => {
    showToast("Logo upload is coming soon. This feature will allow you to upload a custom logo.", "info");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateOrganizationBranding({
        primaryColor,
        secondaryColor,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save branding");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 px-4 py-3">
          <p className="text-sm text-[var(--success)]">Branding settings saved successfully!</p>
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-3">
          <p className="text-sm text-[var(--error)]">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Logo</h2>
            <div className="flex items-start gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[var(--background)]">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-foreground-muted" />
                )}
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleUploadLogo}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                >
                  Upload Logo
                </button>
                <p className="text-xs text-foreground-muted">
                  PNG, JPG or SVG. Max 2MB. Recommended: 400x100px
                </p>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Brand Colors</h2>

            <div className="space-y-6">
              {/* Color Presets */}
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Quick Presets</p>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(preset.primary);
                        setSecondaryColor(preset.secondary);
                      }}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                        primaryColor === preset.primary
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                      )}
                    >
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Secondary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Theme */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Gallery Theme</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setGalleryTheme("dark")}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                  galleryTheme === "dark"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className="h-20 w-full rounded-lg bg-[#0a0a0a] border border-[var(--card-border)]" />
                <span className="text-sm font-medium text-foreground">Dark Theme</span>
              </button>
              <button
                type="button"
                onClick={() => setGalleryTheme("light")}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                  galleryTheme === "light"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className="h-20 w-full rounded-lg bg-white border border-gray-200" />
                <span className="text-sm font-medium text-foreground">Light Theme</span>
              </button>
            </div>
          </div>

          {/* Watermark */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Watermark</h2>
                <p className="text-sm text-foreground-muted">Add your logo to unpurchased photos</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={showWatermark}
                onClick={() => setShowWatermark(!showWatermark)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                  showWatermark ? "bg-[var(--primary)]" : "bg-[var(--background-hover)]"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                    showWatermark ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {showWatermark && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Position</label>
                <select
                  value={watermarkPosition}
                  onChange={(e) => setWatermarkPosition(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="center">Center</option>
                </select>
              </div>
            )}
          </div>

          {/* Custom Domain */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Custom Domain</h2>
            <p className="text-sm text-foreground-muted mb-4">
              Use your own domain for client galleries
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Subdomain</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={settings.slug}
                    disabled
                    className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground-muted cursor-not-allowed"
                  />
                  <span className="text-sm text-foreground-muted">.listinglens.app</span>
                </div>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  Your galleries will be accessible at {settings.slug}.listinglens.app
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--card-border)]">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Custom Domain <span className="text-foreground-muted">(Pro plan required)</span>
                </label>
                <input
                  type="text"
                  placeholder="gallery.yourdomain.com"
                  defaultValue={settings.customDomain || ""}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Preview</h2>
            <div
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: galleryTheme === "dark" ? "#0a0a0a" : "#ffffff",
              }}
            >
              {/* Mock Gallery Header */}
              <div
                className="p-4 text-center"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center justify-center gap-2">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="h-6" />
                  ) : (
                    <span className="text-white font-semibold">{settings.businessName}</span>
                  )}
                </div>
              </div>

              {/* Mock Gallery Content */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "aspect-square rounded-lg",
                        galleryTheme === "dark" ? "bg-[#1a1a1a]" : "bg-gray-100"
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-lg py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Download Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
