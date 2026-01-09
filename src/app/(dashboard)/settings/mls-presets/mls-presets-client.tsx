"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusIcon, EditIcon, TrashIcon, CheckIcon } from "@/components/ui/settings-icons";
import {
  createMlsPreset,
  updateMlsPreset,
  deleteMlsPreset,
  seedSystemMlsPresets,
  type MlsPreset,
  type CreateMlsPresetInput,
} from "@/lib/actions/mls-presets";

interface MlsPresetsClientProps {
  presets: MlsPreset[];
  providers: string[];
}

const FORMAT_OPTIONS = [
  { value: "jpeg", label: "JPEG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
];

export function MlsPresetsClient({ presets: initialPresets, providers: initialProviders }: MlsPresetsClientProps) {
  const { showToast } = useToast();
  const [presets, setPresets] = useState(initialPresets);
  const [providers, setProviders] = useState(initialProviders);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<MlsPreset | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateMlsPresetInput>({
    name: "",
    provider: "",
    description: "",
    width: 1920,
    height: 1080,
    quality: 90,
    format: "jpeg",
    maxFileSizeKb: undefined,
    maintainAspect: true,
    letterbox: false,
    letterboxColor: "#ffffff",
  });

  // Group presets by provider
  const presetsByProvider = useMemo(() => {
    const grouped: Record<string, MlsPreset[]> = {};
    presets.forEach((preset) => {
      if (!grouped[preset.provider]) {
        grouped[preset.provider] = [];
      }
      grouped[preset.provider].push(preset);
    });
    return grouped;
  }, [presets]);

  // Filter presets by selected provider
  const filteredProviders = selectedProvider
    ? [selectedProvider]
    : Object.keys(presetsByProvider).sort();

  const resetForm = () => {
    setFormData({
      name: "",
      provider: "",
      description: "",
      width: 1920,
      height: 1080,
      quality: 90,
      format: "jpeg",
      maxFileSizeKb: undefined,
      maintainAspect: true,
      letterbox: false,
      letterboxColor: "#ffffff",
    });
    setEditingPreset(null);
  };

  const openModal = (preset?: MlsPreset) => {
    if (preset) {
      setEditingPreset(preset);
      setFormData({
        name: preset.name,
        provider: preset.provider,
        description: preset.description || "",
        width: preset.width,
        height: preset.height,
        quality: preset.quality,
        format: preset.format,
        maxFileSizeKb: preset.maxFileSizeKb || undefined,
        maintainAspect: preset.maintainAspect,
        letterbox: preset.letterbox,
        letterboxColor: preset.letterboxColor || "#ffffff",
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Please enter a preset name", "error");
      return;
    }
    if (!formData.provider.trim()) {
      showToast("Please enter a provider name", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPreset) {
        const result = await updateMlsPreset({
          id: editingPreset.id,
          ...formData,
        });
        if (!result.success) {
          showToast(result.error || "Failed to update preset", "error");
          return;
        }
        setPresets((prev) =>
          prev.map((p) => (p.id === editingPreset.id ? result.data : p))
        );
        showToast("Preset updated successfully", "success");
        setIsModalOpen(false);
        resetForm();
      } else {
        const result = await createMlsPreset(formData);
        if (!result.success) {
          showToast(result.error || "Failed to create preset", "error");
          return;
        }
        setPresets((prev) => [...prev, result.data]);
        if (!providers.includes(formData.provider)) {
          setProviders((prev) => [...prev, formData.provider].sort());
        }
        showToast("Preset created successfully", "success");
        setIsModalOpen(false);
        resetForm();
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteMlsPreset(id);
      if (result.success) {
        setPresets((prev) => prev.filter((p) => p.id !== id));
        showToast("Preset deleted successfully", "success");
      } else {
        showToast(result.error || "Failed to delete preset", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    }
    setDeleteConfirmId(null);
  };

  const handleSeedPresets = async () => {
    setIsSeeding(true);
    try {
      const result = await seedSystemMlsPresets();
      if (!result.success) {
        showToast(result.error || "Failed to seed presets", "error");
        return;
      }
      showToast(
        `Created ${result.data.created} presets (${result.data.skipped} already existed)`,
        "success"
      );
      // Refresh the page to get new presets
      window.location.reload();
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  const formatDimensions = (preset: MlsPreset) => {
    return `${preset.width} × ${preset.height}`;
  };

  const formatFileSize = (kb: number | null) => {
    if (!kb) return "No limit";
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${kb} KB`;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Provider Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedProvider(null)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
              selectedProvider === null
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
            )}
          >
            All ({presets.length})
          </button>
          {Object.keys(presetsByProvider)
            .sort()
            .map((provider) => (
              <button
                key={provider}
                onClick={() => setSelectedProvider(provider)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
                  selectedProvider === provider
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background-secondary)] text-foreground-muted hover:text-foreground"
                )}
              >
                {provider} ({presetsByProvider[provider].length})
              </button>
            ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {presets.length === 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSeedPresets}
              disabled={isSeeding}
            >
              {isSeeding ? "Loading..." : "Load Default Presets"}
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => openModal()}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Preset
          </Button>
        </div>
      </div>

      {/* Presets Grid */}
      {presets.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <ImagePresetIcon className="h-12 w-12 mx-auto text-foreground-muted mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No MLS Presets</h3>
          <p className="text-foreground-muted mb-6 max-w-md mx-auto">
            MLS presets define image dimensions for different MLS providers and platforms.
            Load the default presets to get started.
          </p>
          <Button variant="primary" onClick={handleSeedPresets} disabled={isSeeding}>
            {isSeeding ? "Loading..." : "Load Default Presets"}
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredProviders.map((provider) => (
            <div key={provider}>
              <h3 className="text-sm font-medium text-foreground-muted uppercase tracking-wider mb-4">
                {provider}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {presetsByProvider[provider]?.map((preset) => (
                  <div
                    key={preset.id}
                    className="relative rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all hover:border-[var(--border-hover)]"
                  >
                    {/* System Badge */}
                    {preset.isSystemPreset && (
                      <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-[var(--background-secondary)] text-foreground-muted">
                        System
                      </span>
                    )}

                    {/* Preset Info */}
                    <div className="mb-3">
                      <h4 className="font-medium text-foreground">{preset.name}</h4>
                      {preset.description && (
                        <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
                          {preset.description}
                        </p>
                      )}
                    </div>

                    {/* Specs */}
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <span className="text-foreground-muted">Dimensions:</span>
                        <span className="ml-1 text-foreground font-medium">
                          {formatDimensions(preset)}
                        </span>
                      </div>
                      <div>
                        <span className="text-foreground-muted">Format:</span>
                        <span className="ml-1 text-foreground font-medium uppercase">
                          {preset.format}
                        </span>
                      </div>
                      <div>
                        <span className="text-foreground-muted">Quality:</span>
                        <span className="ml-1 text-foreground font-medium">
                          {preset.quality}%
                        </span>
                      </div>
                      <div>
                        <span className="text-foreground-muted">Max Size:</span>
                        <span className="ml-1 text-foreground font-medium">
                          {formatFileSize(preset.maxFileSizeKb)}
                        </span>
                      </div>
                    </div>

                    {/* Options Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {preset.maintainAspect && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--success)]/10 text-[var(--success)]">
                          Maintain Aspect
                        </span>
                      )}
                      {preset.letterbox && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                          Letterbox
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!preset.isSystemPreset && (
                        <>
                          <button
                            onClick={() => openModal(preset)}
                            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] text-foreground hover:bg-[var(--background-hover)] transition-colors"
                          >
                            <EditIcon className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          {deleteConfirmId === preset.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDelete(preset.id)}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--error)] text-white hover:bg-[var(--error)]/90 transition-colors"
                              >
                                <CheckIcon className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--card-border)] text-foreground-muted hover:text-foreground transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(preset.id)}
                              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-[var(--card-border)] text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                            >
                              <TrashIcon className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPreset ? "Edit Preset" : "Create New Preset"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-4">
              {/* Name & Provider Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Preset Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    placeholder="e.g., HAR Standard"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Provider *
                  </label>
                  <input
                    type="text"
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    placeholder="e.g., HAR, Zillow, Social"
                    list="providers-list"
                  />
                  <datalist id="providers-list">
                    {providers.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  placeholder="Brief description of this preset"
                />
              </div>

              {/* Dimensions Row */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Format
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  >
                    {FORMAT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quality & Max Size Row */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Quality ({formData.quality}%)
                  </label>
                  <input
                    type="range"
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: parseInt(e.target.value) })}
                    className="w-full h-2 bg-[var(--background-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
                    min={10}
                    max={100}
                    step={5}
                  />
                  <div className="flex justify-between text-xs text-foreground-muted mt-1">
                    <span>Low (10%)</span>
                    <span>High (100%)</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Max File Size (KB)
                  </label>
                  <input
                    type="number"
                    value={formData.maxFileSizeKb || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxFileSizeKb: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                    placeholder="Leave empty for no limit"
                    min={100}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4 flex-wrap py-2">
                  <div>
                    <span className="text-sm font-medium text-foreground">Maintain Aspect Ratio</span>
                    <p className="text-xs text-foreground-muted">Keep original proportions when resizing</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.maintainAspect}
                    onClick={() => setFormData({ ...formData, maintainAspect: !formData.maintainAspect })}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                      formData.maintainAspect ? "bg-[var(--primary)]" : "bg-[var(--background-secondary)]"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        formData.maintainAspect ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-start justify-between gap-4 flex-wrap py-2">
                  <div>
                    <span className="text-sm font-medium text-foreground">Letterbox</span>
                    <p className="text-xs text-foreground-muted">Add padding to fit exact dimensions</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.letterbox}
                    onClick={() => setFormData({ ...formData, letterbox: !formData.letterbox })}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
                      formData.letterbox ? "bg-[var(--primary)]" : "bg-[var(--background-secondary)]"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        formData.letterbox ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>

                {formData.letterbox && (
                  <div className="pl-4 border-l-2 border-[var(--card-border)]">
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Letterbox Color
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={formData.letterboxColor || "#ffffff"}
                        onChange={(e) => setFormData({ ...formData, letterboxColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-[var(--card-border)] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.letterboxColor || "#ffffff"}
                        onChange={(e) => setFormData({ ...formData, letterboxColor: e.target.value })}
                        className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background-secondary)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                )}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : editingPreset
                  ? "Save Changes"
                  : "Create Preset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Icon component for empty state
function ImagePresetIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 16l5-5 4 4 3-3 6 6" />
      <circle cx="8.5" cy="8.5" r="1.5" />
    </svg>
  );
}
