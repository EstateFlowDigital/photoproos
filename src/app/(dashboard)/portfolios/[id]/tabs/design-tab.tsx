"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { PortfolioType, PortfolioTemplate } from "@prisma/client";
import type { PortfolioWebsite } from "../portfolio-editor-client";
import {
  updatePortfolioWebsite,
  updatePortfolioWebsiteSettings,
} from "@/lib/actions/portfolio-websites";
import {
  PORTFOLIO_TEMPLATES,
  PORTFOLIO_TYPE_DEFAULTS,
  GOOGLE_FONTS,
} from "@/lib/portfolio-templates";

interface DesignTabProps {
  website: PortfolioWebsite;
  isPending: boolean;
  onSave?: () => void;
}

export function DesignTab({ website, isPending: parentPending, onSave }: DesignTabProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [portfolioType, setPortfolioType] = useState<PortfolioType>(
    website.portfolioType
  );
  const [template, setTemplate] = useState<PortfolioTemplate>(website.template);
  const [primaryColor, setPrimaryColor] = useState(
    website.primaryColor || PORTFOLIO_TEMPLATES[website.template].colors.primary
  );
  const [accentColor, setAccentColor] = useState(
    website.accentColor || PORTFOLIO_TEMPLATES[website.template].colors.accent
  );
  const [fontHeading, setFontHeading] = useState(
    website.fontHeading || PORTFOLIO_TEMPLATES[website.template].fonts.heading
  );
  const [fontBody, setFontBody] = useState(
    website.fontBody || PORTFOLIO_TEMPLATES[website.template].fonts.body
  );

  const loading = isPending || parentPending;

  const handleTemplateChange = (newTemplate: PortfolioTemplate) => {
    setTemplate(newTemplate);
    // Update colors and fonts to template defaults
    const config = PORTFOLIO_TEMPLATES[newTemplate];
    setPrimaryColor(config.colors.primary);
    setAccentColor(config.colors.accent);
    setFontHeading(config.fonts.heading);
    setFontBody(config.fonts.body);
  };

  const handleSave = () => {
    startTransition(async () => {
      // Update settings (type, template, fonts)
      const settingsResult = await updatePortfolioWebsiteSettings(website.id, {
        portfolioType,
        template,
        fontHeading,
        fontBody,
      });

      // Update colors
      const colorsResult = await updatePortfolioWebsite(website.id, {
        primaryColor,
        accentColor,
      });

      if (settingsResult.success && colorsResult.success) {
        showToast("Design settings saved", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(
          settingsResult.error || colorsResult.error || "Failed to save",
          "error"
        );
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Type Toggle */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Portfolio Type</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Choose whether this is a showcase portfolio or a client gallery.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(Object.keys(PORTFOLIO_TYPE_DEFAULTS) as PortfolioType[]).map(
            (type) => {
              const config = PORTFOLIO_TYPE_DEFAULTS[type];
              const isSelected = portfolioType === type;

              return (
                <button
                  key={type}
                  onClick={() => setPortfolioType(type)}
                  className={cn(
                    "rounded-xl border-2 p-5 text-left transition-all",
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        isSelected
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--background-secondary)] text-foreground-muted"
                      )}
                    >
                      {type === "photographer" ? (
                        <CameraIcon className="h-5 w-5" />
                      ) : (
                        <FolderIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        {config.name}
                      </p>
                      <p className="mt-1 text-sm text-foreground-muted">
                        {config.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Template Selection */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Template</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Choose a visual style for your portfolio.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(PORTFOLIO_TEMPLATES) as PortfolioTemplate[]).map(
            (templateKey) => {
              const config = PORTFOLIO_TEMPLATES[templateKey];
              const isSelected = template === templateKey;

              return (
                <button
                  key={templateKey}
                  onClick={() => handleTemplateChange(templateKey)}
                  className={cn(
                    "group rounded-xl border-2 overflow-hidden transition-all",
                    isSelected
                      ? "border-[var(--primary)]"
                      : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                  )}
                >
                  {/* Template Preview */}
                  <div
                    className="aspect-[4/3] p-3"
                    style={{
                      backgroundColor: config.colors.background,
                      color: config.colors.text,
                    }}
                  >
                    {/* Mini preview layout */}
                    <div className="flex h-full flex-col gap-1.5">
                      <div
                        className="h-8 rounded"
                        style={{ backgroundColor: config.colors.primary }}
                      />
                      <div className="flex flex-1 gap-1.5">
                        <div
                          className="flex-1 rounded"
                          style={{ backgroundColor: config.colors.card }}
                        />
                        <div
                          className="flex-1 rounded"
                          style={{ backgroundColor: config.colors.card }}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Template Name */}
                  <div className="border-t border-[var(--card-border)] bg-[var(--card)] px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      {config.name}
                    </p>
                    <p className="text-xs text-foreground-muted">
                      {config.isDark ? "Dark" : "Light"} theme
                    </p>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Colors</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Customize your portfolio's color scheme.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">
              Primary Color
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-16 cursor-pointer rounded-lg border border-[var(--card-border)] bg-transparent"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground uppercase"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">
              Accent Color
            </label>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-16 cursor-pointer rounded-lg border border-[var(--card-border)] bg-transparent"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground uppercase"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="text-lg font-semibold text-foreground">Typography</h3>
        <p className="mt-1 text-sm text-foreground-muted">
          Select fonts for your portfolio.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground">
              Heading Font
            </label>
            <select
              value={fontHeading}
              onChange={(e) => setFontHeading(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground"
            >
              {GOOGLE_FONTS.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.name} ({font.category})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">
              Body Font
            </label>
            <select
              value={fontBody}
              onChange={(e) => setFontBody(e.target.value)}
              className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2.5 text-sm text-foreground"
            >
              {GOOGLE_FONTS.map((font) => (
                <option key={font.name} value={font.name}>
                  {font.name} ({font.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end border-t border-[var(--card-border)] pt-6">
        <button
          onClick={handleSave}
          disabled={loading}
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Design"}
        </button>
      </div>
    </div>
  );
}

// Icons
function CameraIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16Z" />
    </svg>
  );
}
