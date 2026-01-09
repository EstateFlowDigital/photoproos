"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import type { PortfolioSectionType } from "@prisma/client";
import { updatePortfolioSection } from "@/lib/actions/portfolio-websites";
import { SECTION_DEFINITIONS } from "@/lib/portfolio-templates";

// Config Forms
import { HeroConfigForm } from "./configs/hero-config";
import { AboutConfigForm } from "./configs/about-config";
import { GalleryConfigForm } from "./configs/gallery-config";
import { ServicesConfigForm } from "./configs/services-config";
import { TestimonialsConfigForm } from "./configs/testimonials-config";
import { ContactConfigForm } from "./configs/contact-config";
import { FaqConfigForm } from "./configs/faq-config";
import { TextConfigForm } from "./configs/text-config";
import { ImageConfigForm } from "./configs/image-config";
import { VideoConfigForm } from "./configs/video-config";
import { SpacerConfigForm } from "./configs/spacer-config";
import { AwardsConfigForm } from "./configs/awards-config";

// ============================================================================
// TYPES
// ============================================================================

export interface SectionData {
  id: string;
  sectionType: PortfolioSectionType;
  position: number;
  isVisible: boolean;
  config: Record<string, unknown>;
  customTitle: string | null;
}

export interface AvailableProject {
  id: string;
  name: string;
  coverImageUrl: string | null;
}

interface SectionConfigModalProps {
  section: SectionData;
  availableProjects?: AvailableProject[];
  onClose: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SectionConfigModal({
  section,
  availableProjects = [],
  onClose,
}: SectionConfigModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [config, setConfig] = useState<Record<string, unknown>>(section.config);
  const [customTitle, setCustomTitle] = useState(section.customTitle || "");

  const definition = SECTION_DEFINITIONS.find(
    (s) => s.type === section.sectionType
  );

  const handleSave = () => {
    startTransition(async () => {
      const result = await updatePortfolioSection(section.id, {
        config,
        customTitle: customTitle.trim() || null,
      });

      if (result.success) {
        showToast("Section updated", "success");
        router.refresh();
        onClose();
      } else {
        showToast(result.error || "Failed to update section", "error");
      }
    });
  };

  const updateConfig = (updates: Record<string, unknown>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap border-b border-[var(--card-border)] px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Edit {definition?.name || section.sectionType}
            </h2>
            <p className="mt-0.5 text-sm text-foreground-muted">
              {definition?.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)] hover:text-foreground"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Custom Title */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground">
              Custom Section Title{" "}
              <span className="text-foreground-muted">(optional)</span>
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={definition?.name || "Section title"}
              className="mt-2 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground outline-none focus:border-[var(--primary)]"
            />
          </div>

          <div className="border-t border-[var(--card-border)] pt-6">
            <ConfigForm
              sectionType={section.sectionType}
              config={config}
              updateConfig={updateConfig}
              availableProjects={availableProjects}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[var(--card-border)] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONFIG FORM ROUTER
// ============================================================================

interface ConfigFormProps {
  sectionType: PortfolioSectionType;
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
  availableProjects: AvailableProject[];
}

function ConfigForm({
  sectionType,
  config,
  updateConfig,
  availableProjects,
}: ConfigFormProps) {
  switch (sectionType) {
    case "hero":
      return <HeroConfigForm config={config} updateConfig={updateConfig} />;
    case "about":
      return <AboutConfigForm config={config} updateConfig={updateConfig} />;
    case "gallery":
      return (
        <GalleryConfigForm
          config={config}
          updateConfig={updateConfig}
          availableProjects={availableProjects}
        />
      );
    case "services":
      return <ServicesConfigForm config={config} updateConfig={updateConfig} />;
    case "testimonials":
      return (
        <TestimonialsConfigForm config={config} updateConfig={updateConfig} />
      );
    case "contact":
      return <ContactConfigForm config={config} updateConfig={updateConfig} />;
    case "faq":
      return <FaqConfigForm config={config} updateConfig={updateConfig} />;
    case "text":
      return <TextConfigForm config={config} updateConfig={updateConfig} />;
    case "image":
      return <ImageConfigForm config={config} updateConfig={updateConfig} />;
    case "video":
      return <VideoConfigForm config={config} updateConfig={updateConfig} />;
    case "spacer":
      return <SpacerConfigForm config={config} updateConfig={updateConfig} />;
    case "awards":
      return <AwardsConfigForm config={config} updateConfig={updateConfig} />;
    case "custom_html":
      return (
        <div className="text-sm text-foreground-muted">
          Custom HTML is disabled for security reasons.
        </div>
      );
    default:
      return (
        <div className="text-sm text-foreground-muted">
          No configuration available for this section type.
        </div>
      );
  }
}

// ============================================================================
// ICONS
// ============================================================================

function XIcon({ className }: { className?: string }) {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
