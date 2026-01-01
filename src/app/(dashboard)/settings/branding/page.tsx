export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo branding data
const demoBranding = {
  logoUrl: null,
  businessName: "Thompson Photography",
  primaryColor: "#3b82f6",
  secondaryColor: "#1e40af",
  galleryTheme: "dark",
  showWatermark: true,
  watermarkPosition: "bottom-right",
  customDomain: null,
  subdomain: "thompson",
};

const colorPresets = [
  { name: "Blue", primary: "#3b82f6", secondary: "#1e40af" },
  { name: "Purple", primary: "#8b5cf6", secondary: "#5b21b6" },
  { name: "Green", primary: "#22c55e", secondary: "#15803d" },
  { name: "Orange", primary: "#f97316", secondary: "#c2410c" },
  { name: "Pink", primary: "#ec4899", secondary: "#be185d" },
  { name: "Teal", primary: "#14b8a6", secondary: "#0f766e" },
];

export default function BrandingSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Branding"
        subtitle="Customize how your galleries appear to clients"
        actions={
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Settings
          </Link>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Branding changes will not be saved. This is a preview of the branding settings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Logo</h2>
            <div className="flex items-start gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[var(--background)]">
                {demoBranding.logoUrl ? (
                  <img src={demoBranding.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-foreground-muted" />
                )}
              </div>
              <div className="space-y-3">
                <button className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
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
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                        demoBranding.primaryColor === preset.primary
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
                      value={demoBranding.primaryColor}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
                    />
                    <input
                      type="text"
                      value={demoBranding.primaryColor}
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
                      value={demoBranding.secondaryColor}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
                    />
                    <input
                      type="text"
                      value={demoBranding.secondaryColor}
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
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                  demoBranding.galleryTheme === "dark"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className="h-20 w-full rounded-lg bg-[#0a0a0a] border border-[var(--card-border)]" />
                <span className="text-sm font-medium text-foreground">Dark Theme</span>
              </button>
              <button
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                  demoBranding.galleryTheme === "light"
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
                role="switch"
                aria-checked={demoBranding.showWatermark}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                  demoBranding.showWatermark ? "bg-[var(--primary)]" : "bg-[var(--background-hover)]"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                    demoBranding.showWatermark ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {demoBranding.showWatermark && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Position</label>
                <select
                  defaultValue={demoBranding.watermarkPosition}
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
                    defaultValue={demoBranding.subdomain}
                    className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                  />
                  <span className="text-sm text-foreground-muted">.photoproos.com</span>
                </div>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  Your galleries will be accessible at {demoBranding.subdomain}.photoproos.com
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--card-border)]">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Custom Domain <span className="text-foreground-muted">(Pro plan required)</span>
                </label>
                <input
                  type="text"
                  placeholder="gallery.yourdomain.com"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              disabled
              className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
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
                backgroundColor: demoBranding.galleryTheme === "dark" ? "#0a0a0a" : "#ffffff",
              }}
            >
              {/* Mock Gallery Header */}
              <div
                className="p-4 text-center"
                style={{ backgroundColor: demoBranding.primaryColor }}
              >
                <div className="flex items-center justify-center gap-2">
                  {demoBranding.logoUrl ? (
                    <img src={demoBranding.logoUrl} alt="Logo" className="h-6" />
                  ) : (
                    <span className="text-white font-semibold">{demoBranding.businessName}</span>
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
                        demoBranding.galleryTheme === "dark" ? "bg-[#1a1a1a]" : "bg-gray-100"
                      )}
                    />
                  ))}
                </div>
                <button
                  className="mt-4 w-full rounded-lg py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: demoBranding.primaryColor }}
                >
                  Download Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}
