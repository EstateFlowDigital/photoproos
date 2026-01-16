"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  X,
  Save,
  Image as ImageIcon,
  Quote,
  Columns,
  Megaphone,
  Camera,
  Tag,
  Lightbulb,
  Trophy,
  Check,
} from "lucide-react";
import {
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type TemplateLayout,
} from "@/lib/marketing-studio/templates";
import type { PlatformId, PostFormat } from "@/components/marketing-studio/types";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  quote: Quote,
  split: Columns,
  megaphone: Megaphone,
  camera: Camera,
  tag: Tag,
  lightbulb: Lightbulb,
  trophy: Trophy,
};

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateData: {
    name: string;
    description: string;
    category: TemplateCategory;
    platforms: PlatformId[];
    format: PostFormat;
    tags: string[];
    captionTemplate: string;
    layout: TemplateLayout;
  }) => void;
  currentPlatform: PlatformId;
  currentFormat: PostFormat;
  currentCaption: string;
  currentLayout: TemplateLayout;
}

const PLATFORM_OPTIONS: { id: PlatformId; name: string }[] = [
  { id: "instagram", name: "Instagram" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "twitter", name: "Twitter/X" },
  { id: "facebook", name: "Facebook" },
  { id: "tiktok", name: "TikTok" },
  { id: "pinterest", name: "Pinterest" },
];

export function SaveTemplateModal({
  isOpen,
  onClose,
  onSave,
  currentPlatform,
  currentFormat,
  currentCaption,
  currentLayout,
}: SaveTemplateModalProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [category, setCategory] = React.useState<TemplateCategory>("portfolio");
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<Set<PlatformId>>(
    new Set([currentPlatform])
  );
  const [tags, setTags] = React.useState("");

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setCategory("portfolio");
      setSelectedPlatforms(new Set([currentPlatform]));
      setTags("");
    }
  }, [isOpen, currentPlatform]);

  const togglePlatform = (platform: PlatformId) => {
    setSelectedPlatforms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(platform)) {
        newSet.delete(platform);
      } else {
        newSet.add(platform);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim() || `Custom ${category} template`,
      category,
      platforms: Array.from(selectedPlatforms),
      format: currentFormat,
      tags: tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      captionTemplate: currentCaption,
      layout: currentLayout,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-template-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-[var(--card)] border border-[var(--card-border)] rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
          <h2 id="save-template-title" className="text-base font-semibold text-[var(--foreground)]">
            Save as Template
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="template-name" className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Template Name <span className="text-[var(--error)]">*</span>
            </label>
            <input
              id="template-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Custom Template"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="template-description" className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Description
            </label>
            <textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this template for?"
              rows={2}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {TEMPLATE_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon] || ImageIcon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                      isSelected
                        ? "bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]"
                        : "bg-[var(--background)] border-[var(--border)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
                    )}
                    title={cat.name}
                    aria-pressed={isSelected}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="text-[10px] truncate max-w-full">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((platform) => {
                const isSelected = selectedPlatforms.has(platform.id);
                return (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                      isSelected
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30"
                        : "bg-[var(--background)] text-[var(--foreground-muted)] border border-[var(--border)] hover:bg-[var(--background-hover)]"
                    )}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <Check className="h-3 w-3" aria-hidden="true" />}
                    {platform.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="template-tags" className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
              Tags <span className="text-[var(--foreground-muted)]">(comma-separated)</span>
            </label>
            <input
              id="template-tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="minimal, dark, professional"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--card-border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-hover)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || selectedPlatforms.size === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}
