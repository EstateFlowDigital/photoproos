"use client";

import { useState, useTransition } from "react";
import { X, Save, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createComponentPreset } from "@/lib/actions/cms-presets";
import type { PageComponentInstance } from "@/lib/cms/page-builder-utils";
import type { CMSComponentType } from "@prisma/client";

interface SavePresetDialogProps {
  instance: PageComponentInstance;
  onClose: () => void;
  onSaved?: () => void;
}

export function SavePresetDialog({
  instance,
  onClose,
  onSaved,
}: SavePresetDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      setError("Please enter a preset name");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createComponentPreset({
        name: name.trim(),
        description: description.trim() || undefined,
        componentType: instance.componentSlug as CMSComponentType,
        content: instance.content as Record<string, unknown>,
        category: category.trim() || undefined,
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => {
          onSaved?.();
          onClose();
        }, 1000);
      } else {
        setError(result.error || "Failed to save preset");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-[var(--card)] rounded-xl shadow-2xl border border-[var(--border)] w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h3 className="font-semibold">Save as Preset</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              Save this {instance.componentSlug} configuration for reuse
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--background-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Preset Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Photography Hero Dark"
              className={cn(
                "w-full px-3 py-2 rounded-lg",
                "bg-[var(--background-tertiary)] border border-[var(--border)]",
                "focus:outline-none focus:border-[var(--primary)]",
                "transition-colors"
              )}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this preset is for..."
              rows={2}
              className={cn(
                "w-full px-3 py-2 rounded-lg resize-none",
                "bg-[var(--background-tertiary)] border border-[var(--border)]",
                "focus:outline-none focus:border-[var(--primary)]",
                "transition-colors"
              )}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., photography, real-estate, events"
              className={cn(
                "w-full px-3 py-2 rounded-lg",
                "bg-[var(--background-tertiary)] border border-[var(--border)]",
                "focus:outline-none focus:border-[var(--primary)]",
                "transition-colors"
              )}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
              {error}
            </div>
          )}

          {/* Success */}
          {saved && (
            <div className="p-3 text-sm text-green-500 bg-green-500/10 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              Preset saved successfully!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg hover:bg-[var(--background-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || saved}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm rounded-lg",
              "bg-[var(--primary)] text-white",
              "hover:bg-[var(--primary)]/90",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-colors"
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Preset
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
