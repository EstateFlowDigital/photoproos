"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { PortfolioWebsite } from "../portfolio-editor-client";
import {
  updatePortfolioWebsite,
  updatePortfolioWebsiteSettings,
  deletePortfolioWebsite,
  setPortfolioPassword,
  updatePortfolioAdvancedSettings,
} from "@/lib/actions/portfolio-websites";
import { SOCIAL_PLATFORMS } from "@/lib/portfolio-templates";

interface SettingsTabProps {
  website: PortfolioWebsite;
  isPending: boolean;
  onSave?: () => void;
}

export function SettingsTab({ website, isPending: parentPending, onSave }: SettingsTabProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Basic Info
  const [name, setName] = useState(website.name);
  const [slug, setSlug] = useState(website.slug);
  const [description, setDescription] = useState(website.description || "");

  // SEO
  const [metaTitle, setMetaTitle] = useState(website.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    website.metaDescription || ""
  );

  // Social Links
  const [socialLinks, setSocialLinks] = useState<
    { platform: string; url: string }[]
  >(website.socialLinks || []);

  // Branding
  const [showBranding, setShowBranding] = useState(website.showBranding);

  // Password Protection
  const [isPasswordProtected, setIsPasswordProtected] = useState(
    website.isPasswordProtected || false
  );
  const [password, setPassword] = useState("");

  // Expiration
  const [expiresAt, setExpiresAt] = useState<string>(
    website.expiresAt ? new Date(website.expiresAt).toISOString().split("T")[0] : ""
  );

  // Downloads
  const [allowDownloads, setAllowDownloads] = useState(website.allowDownloads || false);
  const [downloadWatermark, setDownloadWatermark] = useState(
    website.downloadWatermark !== false
  );

  // Advanced
  const [customCss, setCustomCss] = useState(website.customCss || "");
  const [enableAnimations, setEnableAnimations] = useState(
    website.enableAnimations !== false
  );

  const loading = isPending || parentPending;

  const handleSaveBasicInfo = () => {
    startTransition(async () => {
      const result = await updatePortfolioWebsite(website.id, {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
      });

      if (result.success) {
        showToast("Basic info saved", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to save", "error");
      }
    });
  };

  const handleSaveSEO = () => {
    startTransition(async () => {
      const result = await updatePortfolioWebsiteSettings(website.id, {
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
      });

      if (result.success) {
        showToast("SEO settings saved", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to save", "error");
      }
    });
  };

  const handleSaveSocial = () => {
    startTransition(async () => {
      // Filter out empty entries
      const validLinks = socialLinks.filter(
        (link) => link.platform && link.url.trim()
      );

      const result = await updatePortfolioWebsiteSettings(website.id, {
        socialLinks: validLinks.length > 0 ? validLinks : null,
      });

      if (result.success) {
        showToast("Social links saved", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to save", "error");
      }
    });
  };

  const handleSaveBranding = () => {
    startTransition(async () => {
      const result = await updatePortfolioWebsiteSettings(website.id, {
        showBranding,
      });

      if (result.success) {
        showToast("Branding settings saved", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to save", "error");
      }
    });
  };

  const handleSavePassword = () => {
    startTransition(async () => {
      const result = await setPortfolioPassword(website.id, {
        isPasswordProtected,
        password: password || undefined,
      });

      if (result.success) {
        showToast(
          isPasswordProtected ? "Password protection enabled" : "Password protection disabled",
          "success"
        );
        setPassword("");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to save password", "error");
      }
    });
  };

  const handleSaveExpiration = () => {
    startTransition(async () => {
      const result = await updatePortfolioAdvancedSettings(website.id, {
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      });

      if (result.success) {
        showToast("Expiration settings saved", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to save", "error");
      }
    });
  };

  const handleSaveDownloads = () => {
    startTransition(async () => {
      const result = await updatePortfolioAdvancedSettings(website.id, {
        allowDownloads,
        downloadWatermark,
      });

      if (result.success) {
        showToast("Download settings saved", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to save", "error");
      }
    });
  };

  const handleSaveAdvanced = () => {
    startTransition(async () => {
      const result = await updatePortfolioAdvancedSettings(website.id, {
        customCss: customCss.trim() || null,
        enableAnimations,
      });

      if (result.success) {
        showToast("Advanced settings saved", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to save", "error");
      }
    });
  };

  const handleDelete = () => {
    if (
      !confirm(
        "Delete this portfolio website? This action cannot be undone."
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deletePortfolioWebsite(website.id);
      if (result.success) {
        showToast("Portfolio website deleted", "success");
        router.push("/portfolios");
        router.refresh();
      } else {
        showToast(result.error || "Failed to delete portfolio", "error");
      }
    });
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform: "", url: "" }]);
  };

  const updateSocialLink = (
    index: number,
    field: "platform" | "url",
    value: string
  ) => {
    setSocialLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6">
        <h3 className="text-lg font-semibold text-foreground">Basic Info</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Update your portfolio's name and URL.
        </p>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Portfolio Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
              placeholder="My Photography Portfolio"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Public URL
            </label>
            <div className="mt-2 flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground">
              <span className="text-foreground-muted">/portfolio/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="ml-1 flex-1 bg-transparent text-sm text-foreground outline-none"
                placeholder="my-portfolio"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
              placeholder="A brief description of your portfolio..."
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSaveBasicInfo}
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            Save Basic Info
          </button>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6">
        <h3 className="text-lg font-semibold text-foreground">SEO Settings</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Optimize how your portfolio appears in search results.
        </p>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Meta Title
            </label>
            <input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={70}
              className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
              placeholder="John Doe Photography | Professional Photographer"
            />
            <p className="mt-1 text-xs text-foreground-muted">
              {metaTitle.length}/70 characters
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Meta Description
            </label>
            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={160}
              rows={3}
              className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
              placeholder="Professional photography services for weddings, portraits, and commercial projects..."
            />
            <p className="mt-1 text-xs text-foreground-muted">
              {metaDescription.length}/160 characters
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSaveSEO}
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            Save SEO Settings
          </button>
        </div>
      </div>

      {/* Social Links */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6">
        <h3 className="text-lg font-semibold text-foreground">Social Links</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Add your social media profiles to your portfolio.
        </p>

        <div className="mt-5 space-y-3">
          {socialLinks.length === 0 ? (
            <p className="text-sm text-foreground-muted">
              No social links added yet.
            </p>
          ) : (
            socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-3">
                <select
                  value={link.platform}
                  onChange={(e) =>
                    updateSocialLink(index, "platform", e.target.value)
                  }
                  className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground"
                >
                  <option value="">Select platform</option>
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                  placeholder="https://..."
                  className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
                />
                <button
                  onClick={() => removeSocialLink(index)}
                  className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--error)]/10 hover:text-[var(--error)]"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={addSocialLink}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--primary)] hover:underline"
          >
            <PlusIcon className="h-4 w-4" />
            Add Social Link
          </button>
          <button
            onClick={handleSaveSocial}
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            Save Social Links
          </button>
        </div>
      </div>

      {/* Branding */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6">
        <h3 className="text-lg font-semibold text-foreground">Branding</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Control branding elements on your portfolio.
        </p>

        <div className="mt-5">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={showBranding}
              onChange={(e) => setShowBranding(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">
              Show &quot;Powered by ListingLens&quot; badge
            </span>
          </label>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSaveBranding}
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            Save Branding
          </button>
        </div>
      </div>

      {/* Password Protection */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6">
        <div className="flex items-center gap-2">
          <LockIcon className="h-5 w-5 text-foreground-muted" />
          <h3 className="text-lg font-semibold text-foreground">
            Password Protection
          </h3>
        </div>
        <p className="mt-1 text-sm text-foreground-muted">
          Protect your portfolio with a password. Visitors will need to enter
          the password to view it.
        </p>

        <div className="mt-5 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isPasswordProtected}
              onChange={(e) => setIsPasswordProtected(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">
              Require password to view this portfolio
            </span>
          </label>

          {isPasswordProtected && (
            <div>
              <label className="text-sm font-medium text-foreground">
                {website.isPasswordProtected ? "New Password" : "Password"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  website.isPasswordProtected
                    ? "Leave blank to keep current password"
                    : "Enter a password"
                }
                className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSavePassword}
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            Save Password Settings
          </button>
        </div>
      </div>

      {/* Expiration */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6">
        <div className="flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-foreground-muted" />
          <h3 className="text-lg font-semibold text-foreground">
            Expiration Date
          </h3>
        </div>
        <p className="mt-1 text-sm text-foreground-muted">
          Set an expiration date for this portfolio. After this date, visitors
          will see an expired message.
        </p>

        <div className="mt-5">
          <label className="text-sm font-medium text-foreground">
            Expires On
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
            />
            {expiresAt && (
              <button
                onClick={() => setExpiresAt("")}
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          {!expiresAt && (
            <p className="mt-2 text-xs text-foreground-muted">
              No expiration date set. Portfolio will remain accessible
              indefinitely.
            </p>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSaveExpiration}
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            Save Expiration
          </button>
        </div>
      </div>

      {/* Downloads */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6">
        <div className="flex items-center gap-2">
          <DownloadIcon className="h-5 w-5 text-foreground-muted" />
          <h3 className="text-lg font-semibold text-foreground">
            Download Settings
          </h3>
        </div>
        <p className="mt-1 text-sm text-foreground-muted">
          Control whether visitors can download images from your portfolio.
        </p>

        <div className="mt-5 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allowDownloads}
              onChange={(e) => setAllowDownloads(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">
              Allow visitors to download images
            </span>
          </label>

          {allowDownloads && (
            <label className="flex items-center gap-3 pl-7">
              <input
                type="checkbox"
                checked={downloadWatermark}
                onChange={(e) => setDownloadWatermark(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
              />
              <span className="text-sm text-foreground">
                Apply watermark to downloaded images
              </span>
            </label>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSaveDownloads}
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            Save Download Settings
          </button>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-6">
        <div className="flex items-center gap-2">
          <CodeIcon className="h-5 w-5 text-foreground-muted" />
          <h3 className="text-lg font-semibold text-foreground">
            Advanced Settings
          </h3>
        </div>
        <p className="mt-1 text-sm text-foreground-muted">
          Customize animations and add custom CSS to your portfolio.
        </p>

        <div className="mt-5 space-y-5">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={enableAnimations}
              onChange={(e) => setEnableAnimations(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--card-border)] bg-[var(--background)] text-[var(--primary)]"
            />
            <span className="text-sm text-foreground">
              Enable scroll animations
            </span>
          </label>

          <div>
            <label className="text-sm font-medium text-foreground">
              Custom CSS
            </label>
            <textarea
              value={customCss}
              onChange={(e) => setCustomCss(e.target.value)}
              rows={6}
              placeholder={`/* Add your custom CSS here */
.hero-section {
  /* Your styles */
}`}
              className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 font-mono text-sm text-foreground outline-none focus:border-[var(--primary)]"
            />
            <p className="mt-1 text-xs text-foreground-muted">
              Add custom CSS to override default styles. Use with caution.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSaveAdvanced}
            disabled={loading}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            Save Advanced Settings
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
        <h3 className="text-lg font-semibold text-[var(--error)]">
          Danger Zone
        </h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Permanently delete this portfolio website.
        </p>

        <div className="mt-5">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/20 disabled:opacity-50"
          >
            Delete Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
