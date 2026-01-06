"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import type { PropertyWebsiteSection } from "@prisma/client";
import { updatePropertySection } from "@/lib/actions/property-websites";
import { getPropertySectionDefinition } from "@/lib/property-templates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";

// Config form imports
import { HeroConfig } from "./configs/hero-config";
import { DetailsConfig } from "./configs/details-config";
import { FeaturesConfig } from "./configs/features-config";
import { DescriptionConfig } from "./configs/description-config";
import { GalleryConfig } from "./configs/gallery-config";
import { VirtualTourConfig } from "./configs/virtual-tour-config";
import { LocationMapConfig } from "./configs/location-map-config";
import { AgentInfoConfig } from "./configs/agent-info-config";
import { InquiryFormConfig } from "./configs/inquiry-form-config";
import { MortgageCalcConfig } from "./configs/mortgage-calc-config";
import { TextBlockConfig } from "./configs/text-block-config";
import { SpacerConfig } from "./configs/spacer-config";
import { CtaConfig } from "./configs/cta-config";
import { NeighborhoodConfig } from "./configs/neighborhood-config";
import { WalkScoreConfig } from "./configs/walk-score-config";

interface PropertySectionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: PropertyWebsiteSection;
  onSave: () => void;
}

export function PropertySectionConfigModal({
  isOpen,
  onClose,
  section,
  onSave,
}: PropertySectionConfigModalProps) {
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<Record<string, unknown>>(
    section.config as Record<string, unknown>
  );
  const [customTitle, setCustomTitle] = useState(section.customTitle || "");
  const [backgroundColor, setBackgroundColor] = useState(section.backgroundColor || "");
  const [paddingTop, setPaddingTop] = useState(section.paddingTop || "");
  const [paddingBottom, setPaddingBottom] = useState(section.paddingBottom || "");

  const definition = getPropertySectionDefinition(section.sectionType);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updatePropertySection(section.id, {
        config,
        customTitle: customTitle || null,
        backgroundColor: backgroundColor || null,
        paddingTop: paddingTop || null,
        paddingBottom: paddingBottom || null,
      });

      if (result.success) {
        showToast("Section updated", "success");
        onSave();
      } else {
        showToast(result.error || "Failed to update section", "error");
      }
    } catch {
      showToast("Failed to update section", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const updateConfig = (key: string, value: unknown) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const renderConfigForm = () => {
    switch (section.sectionType) {
      case "property_hero":
        return <HeroConfig config={config} updateConfig={updateConfig} />;
      case "property_details":
        return <DetailsConfig config={config} updateConfig={updateConfig} />;
      case "property_features":
        return <FeaturesConfig config={config} updateConfig={updateConfig} />;
      case "property_description":
        return <DescriptionConfig config={config} updateConfig={updateConfig} />;
      case "property_gallery":
        return <GalleryConfig config={config} updateConfig={updateConfig} />;
      case "virtual_tour":
      case "video_tour":
        return <VirtualTourConfig config={config} updateConfig={updateConfig} sectionType={section.sectionType} />;
      case "location_map":
        return <LocationMapConfig config={config} updateConfig={updateConfig} />;
      case "agent_info":
        return <AgentInfoConfig config={config} updateConfig={updateConfig} />;
      case "inquiry_form":
        return <InquiryFormConfig config={config} updateConfig={updateConfig} />;
      case "mortgage_calculator":
        return <MortgageCalcConfig config={config} updateConfig={updateConfig} />;
      case "text_block":
        return <TextBlockConfig config={config} updateConfig={updateConfig} />;
      case "spacer":
      case "divider":
        return <SpacerConfig config={config} updateConfig={updateConfig} sectionType={section.sectionType} />;
      case "call_to_action":
        return <CtaConfig config={config} updateConfig={updateConfig} />;
      case "neighborhood":
        return <NeighborhoodConfig config={config} updateConfig={updateConfig} />;
      case "walk_score":
        return <WalkScoreConfig config={config} updateConfig={updateConfig} />;
      default:
        return (
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] p-4 text-center">
            <p className="text-foreground-secondary">
              Configuration for this section type is not yet available.
            </p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Edit {definition?.name || section.sectionType}</DialogTitle>
          <DialogDescription>
            {definition?.description}
            {definition?.autoFill && (
              <span className="mt-1 flex items-center gap-1 text-[var(--ai)]">
                <WandIcon className="h-3 w-3" />
                This section auto-fills from property data
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="max-h-[60vh] space-y-6 overflow-y-auto">
          {/* Custom Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Section Title (Optional)
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={definition?.name || "Section title"}
              className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
            <p className="mt-1 text-xs text-foreground-muted">
              Override the default section title
            </p>
          </div>

          {/* Section-specific config */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <h3 className="mb-4 font-medium text-foreground">Section Settings</h3>
            {renderConfigForm()}
          </div>

          {/* Styling options */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
            <h3 className="mb-4 font-medium text-foreground">Styling</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="e.g., #141414 or transparent"
                    className="h-10 flex-1 rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <input
                    type="color"
                    value={backgroundColor || "#141414"}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-lg border border-[var(--card-border)]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Padding Top
                  </label>
                  <select
                    value={paddingTop}
                    onChange={(e) => setPaddingTop(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="">Default</option>
                    <option value="0">None</option>
                    <option value="1rem">Small (1rem)</option>
                    <option value="2rem">Medium (2rem)</option>
                    <option value="3rem">Large (3rem)</option>
                    <option value="4rem">Extra Large (4rem)</option>
                    <option value="6rem">Huge (6rem)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Padding Bottom
                  </label>
                  <select
                    value={paddingBottom}
                    onChange={(e) => setPaddingBottom(e.target.value)}
                    className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="">Default</option>
                    <option value="0">None</option>
                    <option value="1rem">Small (1rem)</option>
                    <option value="2rem">Medium (2rem)</option>
                    <option value="3rem">Large (3rem)</option>
                    <option value="4rem">Extra Large (4rem)</option>
                    <option value="6rem">Huge (6rem)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <LoadingSpinner className="h-4 w-4" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
