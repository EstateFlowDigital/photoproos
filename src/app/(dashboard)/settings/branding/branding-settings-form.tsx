"use client";

import { useState, useTransition, useRef } from "react";
import { cn } from "@/lib/utils";
import { updateOrganizationBranding } from "@/lib/actions/settings";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoadingSpinner, MoonIcon, SunIcon, LockIcon, CheckCircleIcon, ArrowRightIcon } from "@/components/ui/settings-icons";

interface BrandingSettingsFormProps {
  settings: {
    logoUrl: string | null;
    logoLightUrl: string | null;
    faviconUrl: string | null;
    businessName: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    portalMode: "light" | "dark" | "auto";
    invoiceLogoUrl: string | null;
    hidePlatformBranding: boolean;
    customDomain: string | null;
    slug: string;
  };
  colorPresets: { name: string; primary: string; secondary: string; accent: string }[];
  isPaidPlan: boolean;
  currentPlan: string;
}

export function BrandingSettingsForm({
  settings,
  colorPresets,
  isPaidPlan,
  currentPlan,
}: BrandingSettingsFormProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logo states
  const [logoUrl, setLogoUrl] = useState<string | null>(settings.logoUrl);
  const [logoLightUrl, setLogoLightUrl] = useState<string | null>(settings.logoLightUrl);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(settings.faviconUrl);
  const [invoiceLogoUrl, setInvoiceLogoUrl] = useState<string | null>(settings.invoiceLogoUrl);

  // Color states
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
  const [accentColor, setAccentColor] = useState(settings.accentColor);

  // Portal settings
  const [portalMode, setPortalMode] = useState<"light" | "dark" | "auto">(settings.portalMode);

  // White-label (paid only)
  const [hidePlatformBranding, setHidePlatformBranding] = useState(settings.hidePlatformBranding);

  // Watermark settings (local for now)
  const [showWatermark, setShowWatermark] = useState(true);
  const [watermarkPosition, setWatermarkPosition] = useState("bottom-right");

  // Track image load errors to show fallback
  const [logoError, setLogoError] = useState(false);
  const [logoLightError, setLogoLightError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [invoiceLogoError, setInvoiceLogoError] = useState(false);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoLightInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const invoiceLogoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    file: File,
    setter: (url: string | null) => void,
    maxSize: number = 2
  ) => {
    if (file.size > maxSize * 1024 * 1024) {
      showToast(`File must be less than ${maxSize}MB`, "error");
      return;
    }

    // For now, create a local URL preview
    // In production, this would upload to cloud storage
    const url = URL.createObjectURL(file);
    setter(url);
    showToast("Logo selected. Click Save Changes to upload.", "info");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updateOrganizationBranding({
        logoUrl,
        logoLightUrl,
        faviconUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        portalMode,
        invoiceLogoUrl,
        hidePlatformBranding: isPaidPlan ? hidePlatformBranding : false,
        customDomain: null, // Custom domain requires separate verification
      });

      if (result.success) {
        setSuccess(true);
        showToast("Branding settings saved successfully!", "success");
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to save branding");
        showToast(result.error || "Failed to save branding", "error");
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
          {/* Logo Section */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Logo</h2>
            <p className="text-sm text-foreground-muted mb-6">
              Upload your logo to display on client galleries and invoices
            </p>

            <div className="space-y-6">
              {/* Main Logo (Dark backgrounds) */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div
                  className="flex h-24 w-32 items-center justify-center rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[#0a0a0a] p-2"
                  onClick={() => logoInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  {logoUrl && !logoError ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="h-full w-full object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-foreground-muted">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-[10px] font-medium">Upload logo</span>
                    </div>
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoError(false);
                      handleFileSelect(file, setLogoUrl);
                    }
                  }}
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Logo (Dark Mode)</h3>
                    <p className="text-xs text-foreground-muted">
                      For dark backgrounds. PNG, JPG or SVG. Max 2MB.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="primary"
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      Upload
                    </Button>
                    {logoUrl && (
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setLogoUrl(null)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Light Mode Logo */}
              <div className="flex flex-col gap-4 pt-4 border-t border-[var(--card-border)] sm:flex-row sm:items-start sm:gap-6">
                <div
                  className="flex h-24 w-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white p-2"
                  onClick={() => logoLightInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  {logoLightUrl && !logoLightError ? (
                    <img
                      src={logoLightUrl}
                      alt="Light Logo"
                      className="h-full w-full object-contain"
                      onError={() => setLogoLightError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-[10px] font-medium">Upload logo</span>
                    </div>
                  )}
                </div>
                <input
                  ref={logoLightInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setLogoLightError(false);
                      handleFileSelect(file, setLogoLightUrl);
                    }
                  }}
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Logo (Light Mode)</h3>
                    <p className="text-xs text-foreground-muted">
                      For light backgrounds. Optional - will use dark mode logo if not set.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => logoLightInputRef.current?.click()}
                    >
                      Upload
                    </Button>
                    {logoLightUrl && (
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setLogoLightUrl(null)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div className="flex flex-col gap-4 pt-4 border-t border-[var(--card-border)] sm:flex-row sm:items-start sm:gap-6">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[var(--background)]"
                  onClick={() => faviconInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                >
                  {faviconUrl && !faviconError ? (
                    <img
                      src={faviconUrl}
                      alt="Favicon"
                      className="h-8 w-8 object-contain"
                      onError={() => setFaviconError(true)}
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-foreground-muted" />
                  )}
                </div>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/png,image/x-icon,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFaviconError(false);
                      handleFileSelect(file, setFaviconUrl, 1);
                    }
                  }}
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Favicon</h3>
                    <p className="text-xs text-foreground-muted">
                      Browser tab icon. PNG, ICO or SVG. 32x32px recommended.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => faviconInputRef.current?.click()}
                    >
                      Upload
                    </Button>
                    {faviconUrl && (
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setFaviconUrl(null)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Brand Colors</h2>
            <p className="text-sm text-foreground-muted mb-6">
              Customize colors used throughout your client portal
            </p>

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
                        setAccentColor(preset.accent);
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
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Primary Color
                  </label>
                  <p className="text-xs text-foreground-muted mb-2">Buttons, links, highlights</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                  <p className="text-xs text-foreground-muted mb-2">Headers, accents</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Accent Color
                  </label>
                  <p className="text-xs text-foreground-muted mb-2">Success states, CTAs</p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded-lg border border-[var(--card-border)] bg-[var(--background)]"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portal Theme */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
              <h2 className="text-lg font-semibold text-foreground">Client Portal Theme</h2>
              <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-2 py-1 text-xs font-medium text-[var(--success)]">
                Free
              </span>
            </div>
            <p className="text-sm text-foreground-muted mb-6">
              Choose how your client portal appears to visitors
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setPortalMode("dark")}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                  portalMode === "dark"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className="h-16 w-full rounded-lg bg-[#0a0a0a] border border-[var(--card-border)] flex items-center justify-center">
                  <MoonIcon className="h-6 w-6 text-white/60" />
                </div>
                <span className="text-sm font-medium text-foreground">Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setPortalMode("light")}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                  portalMode === "light"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className="h-16 w-full rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                  <SunIcon className="h-6 w-6 text-gray-400" />
                </div>
                <span className="text-sm font-medium text-foreground">Light</span>
              </button>
              <button
                type="button"
                onClick={() => setPortalMode("auto")}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border p-4 transition-all",
                  portalMode === "auto"
                    ? "border-[var(--primary)] bg-[var(--primary)]/10"
                    : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                )}
              >
                <div className="h-16 w-full rounded-lg bg-gradient-to-r from-[#0a0a0a] to-white border border-[var(--card-border)] flex items-center justify-center">
                  <MonitorIcon className="h-6 w-6 text-gray-500" />
                </div>
                <span className="text-sm font-medium text-foreground">Auto</span>
              </button>
            </div>
            <p className="mt-3 text-xs text-foreground-muted">
              Auto mode follows your client&apos;s system preferences
            </p>
          </div>

          {/* Invoice Branding */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Invoice Branding</h2>
            <p className="text-sm text-foreground-muted mb-6">
              Customize how your invoices appear to clients
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
              <div
                className="flex h-20 w-32 items-center justify-center rounded-xl border-2 border-dashed border-[var(--card-border)] bg-white p-2"
                onClick={() => invoiceLogoInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                {invoiceLogoUrl && !invoiceLogoError ? (
                  <img
                    src={invoiceLogoUrl}
                    alt="Invoice Logo"
                    className="h-full w-full object-contain"
                    onError={() => setInvoiceLogoError(true)}
                  />
                ) : logoLightUrl && !logoLightError ? (
                  <img
                    src={logoLightUrl}
                    alt="Logo"
                    className="h-full w-full object-contain opacity-50"
                    onError={() => setLogoLightError(true)}
                  />
                ) : logoUrl && !logoError ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-full w-full object-contain opacity-50"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-gray-400">
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-[10px] font-medium">Upload logo</span>
                  </div>
                )}
              </div>
              <input
                ref={invoiceLogoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setInvoiceLogoError(false);
                    handleFileSelect(file, setInvoiceLogoUrl);
                  }
                }}
              />
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Invoice Logo</h3>
                  <p className="text-xs text-foreground-muted">
                    Optional. Uses your light mode logo by default.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => invoiceLogoInputRef.current?.click()}
                  >
                    Upload Custom
                  </Button>
                  {invoiceLogoUrl && (
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setInvoiceLogoUrl(null)}
                    >
                      Use Default
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Watermark</h2>
                <p className="text-sm text-foreground-muted">Add your logo to unpurchased photos</p>
              </div>
              <Switch
                checked={showWatermark}
                onCheckedChange={setShowWatermark}
              />
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

          {/* White-Label Branding */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
              <h2 className="text-lg font-semibold text-foreground">White-Label Branding</h2>
              {isPaidPlan ? (
                <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-1 text-xs font-medium text-[var(--primary)]">
                  {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Plan
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-[var(--foreground-muted)]/10 px-2 py-1 text-xs font-medium text-foreground-muted">
                  Pro Plan Required
                </span>
              )}
            </div>
            <p className="text-sm text-foreground-muted mb-6">
              Remove PhotoProOS branding and use your own logo throughout
            </p>

            {isPaidPlan ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)] sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">Hide &quot;Powered by PhotoProOS&quot;</h3>
                    <p className="text-xs text-foreground-muted">
                      Remove the PhotoProOS branding from your client galleries
                    </p>
                  </div>
                  <Switch
                    checked={hidePlatformBranding}
                    onCheckedChange={setHidePlatformBranding}
                  />
                </div>

                {hidePlatformBranding && (
                  <div className="rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <CheckCircleIcon className="h-5 w-5 text-[var(--success)] shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">White-label mode enabled</p>
                        <p className="text-xs text-foreground-muted mt-1">
                          Your clients will only see your brand. PhotoProOS branding will be hidden from all client-facing pages.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-6 text-center">
                <LockIcon className="h-10 w-10 text-foreground-muted mx-auto mb-3" />
                <h3 className="text-sm font-medium text-foreground mb-1">Upgrade to unlock white-label</h3>
                <p className="text-xs text-foreground-muted mb-4">
                  Remove all PhotoProOS branding with Pro, Studio, or Enterprise plans
                </p>
                <Link
                  href="/settings/billing"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                >
                  Upgrade Plan
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
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
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="text"
                    defaultValue={settings.slug}
                    disabled
                    className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground-muted cursor-not-allowed"
                  />
                  <span className="text-sm text-foreground-muted">.photoproos.app</span>
                </div>
                <p className="mt-1.5 text-xs text-foreground-muted">
                  Your galleries are accessible at {settings.slug}.photoproos.app
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--card-border)]">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Custom Domain{" "}
                  {!isPaidPlan && <span className="text-foreground-muted">(Pro plan required)</span>}
                </label>
                <input
                  type="text"
                  placeholder="gallery.yourdomain.com"
                  defaultValue={settings.customDomain || ""}
                  disabled={!isPaidPlan}
                  className={cn(
                    "w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground",
                    !isPaidPlan && "opacity-50 cursor-not-allowed"
                  )}
                />
                {isPaidPlan && (
                  <p className="mt-1.5 text-xs text-foreground-muted">
                    Contact support to configure your custom domain
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex flex-col items-stretch sm:items-end">
            <Button
              variant="primary"
              type="submit"
              disabled={isPending}
              className="sm:w-auto"
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6 space-y-6">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Preview</h2>
            <div
              className="rounded-xl overflow-hidden border border-[var(--card-border)]"
              style={{
                backgroundColor: portalMode === "light" ? "#ffffff" : "#0a0a0a",
              }}
            >
              {/* Mock Gallery Header */}
              <div
                className="p-4 text-center"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center justify-center gap-2">
                  {portalMode === "light" && logoLightUrl && !logoLightError ? (
                    <img
                      src={logoLightUrl}
                      alt="Logo"
                      className="h-6"
                      onError={() => setLogoLightError(true)}
                    />
                  ) : logoUrl && !logoError ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="h-6"
                      onError={() => setLogoError(true)}
                    />
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
                      className="aspect-square rounded-lg"
                      style={{
                        backgroundColor: portalMode === "light" ? "#f3f4f6" : "#1a1a1a",
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-lg py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  Download Gallery
                </button>
              </div>

              {/* Footer */}
              {!hidePlatformBranding && (
                <div
                  className="px-4 py-3 text-center border-t"
                  style={{
                    borderColor: portalMode === "light" ? "#e5e7eb" : "#262626",
                  }}
                >
                  <span
                    className="text-xs"
                    style={{
                      color: portalMode === "light" ? "#9ca3af" : "#6b7280",
                    }}
                  >
                    Powered by PhotoProOS
                  </span>
                </div>
              )}
            </div>

            {/* Color Swatches */}
            <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
              <p className="text-xs font-medium text-foreground-muted mb-2">Your Brand Colors</p>
              <div className="flex gap-2">
                <div className="flex-1 text-center">
                  <div
                    className="h-8 rounded-lg mb-1"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="text-xs text-foreground-muted">Primary</span>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="h-8 rounded-lg mb-1"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <span className="text-xs text-foreground-muted">Secondary</span>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="h-8 rounded-lg mb-1"
                    style={{ backgroundColor: accentColor }}
                  />
                  <span className="text-xs text-foreground-muted">Accent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

// Branding-specific icons (not in shared library)
function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M14 6H6v6h8V6Z" />
      <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 0 1 4.25 2h11.5A2.25 2.25 0 0 1 18 4.25v8.5A2.25 2.25 0 0 1 15.75 15h-4v1.5h2.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5h2.5V15h-4A2.25 2.25 0 0 1 2 12.75v-8.5Zm2.25-.75a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h11.5a.75.75 0 0 0 .75-.75v-8.5a.75.75 0 0 0-.75-.75H4.25Z" clipRule="evenodd" />
    </svg>
  );
}
