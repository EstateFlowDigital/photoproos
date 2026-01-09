"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createWatermarkTemplate,
  updateWatermarkTemplate,
  deleteWatermarkTemplate,
  setDefaultTemplate,
  applyTemplateToOrganization,
  type WatermarkTemplateInput,
} from "@/lib/actions/watermark-templates";
import { Star, Edit2, Trash2, Plus, Type, Image as ImageIcon, Check } from "lucide-react";

interface WatermarkTemplate {
  id: string;
  name: string;
  watermarkType: string;
  watermarkText: string | null;
  watermarkImageUrl: string | null;
  watermarkPosition: string;
  watermarkOpacity: number;
  watermarkScale: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface WatermarkTemplatesClientProps {
  templates: WatermarkTemplate[];
}

const POSITIONS = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
  { value: "center", label: "Center" },
] as const;

type WatermarkPosition = typeof POSITIONS[number]["value"];

export function WatermarkTemplatesClient({ templates: initialTemplates }: WatermarkTemplatesClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [templates, setTemplates] = useState(initialTemplates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WatermarkTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<WatermarkTemplateInput>({
    name: "",
    watermarkType: "text",
    watermarkText: "",
    watermarkImageUrl: null,
    watermarkPosition: "bottom-right",
    watermarkOpacity: 0.5,
    watermarkScale: 1.0,
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      watermarkType: "text",
      watermarkText: "",
      watermarkImageUrl: null,
      watermarkPosition: "bottom-right",
      watermarkOpacity: 0.5,
      watermarkScale: 1.0,
      isDefault: false,
    });
    setEditingTemplate(null);
  };

  const openModal = (template?: WatermarkTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        watermarkType: template.watermarkType as "text" | "image",
        watermarkText: template.watermarkText ?? "",
        watermarkImageUrl: template.watermarkImageUrl,
        watermarkPosition: template.watermarkPosition as WatermarkPosition,
        watermarkOpacity: template.watermarkOpacity,
        watermarkScale: template.watermarkScale,
        isDefault: template.isDefault,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(resetForm, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTemplate) {
        const result = await updateWatermarkTemplate(editingTemplate.id, formData);
        if (result.success) {
          showToast("Template updated successfully", "success");
          router.refresh();
          closeModal();
        } else {
          showToast(result.error || "Failed to update template", "error");
        }
      } else {
        const result = await createWatermarkTemplate(formData);
        if (result.success) {
          showToast("Template created successfully", "success");
          router.refresh();
          closeModal();
        } else {
          showToast(result.error || "Failed to create template", "error");
        }
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    setIsSubmitting(true);
    try {
      const result = await deleteWatermarkTemplate(templateId);
      if (result.success) {
        showToast("Template deleted successfully", "success");
        router.refresh();
        setDeleteConfirmId(null);
      } else {
        showToast(result.error || "Failed to delete template", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDefault = async (templateId: string) => {
    setIsSubmitting(true);
    try {
      const result = await setDefaultTemplate(templateId);
      if (result.success) {
        showToast("Default template updated", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to set default", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = async (templateId: string) => {
    setIsSubmitting(true);
    try {
      const result = await applyTemplateToOrganization(templateId);
      if (result.success) {
        showToast("Watermark template applied successfully", "success");
        router.refresh();
      } else {
        showToast(result.error || "Failed to apply template", "error");
      }
    } catch (error) {
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <p className="text-sm text-foreground-muted">
          {templates.length} {templates.length === 1 ? "template" : "templates"}
        </p>
        <Button onClick={() => openModal()} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-[var(--background)] p-4">
              <ImageIcon className="h-8 w-8 text-foreground-muted" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No watermark templates yet
              </h3>
              <p className="text-sm text-foreground-muted mb-4">
                Create reusable watermark presets to quickly apply to your galleries
              </p>
              <Button onClick={() => openModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Template
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 hover:border-[var(--border-hover)] transition-colors"
            >
              {/* Template Header */}
              <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {template.name}
                    </h3>
                    {template.isDefault && (
                      <Star className="h-4 w-4 fill-[var(--warning)] text-[var(--warning)] shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground-muted">
                    {template.watermarkType === "text" ? (
                      <>
                        <Type className="h-3 w-3" />
                        <span>Text Watermark</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-3 w-3" />
                        <span>Image Watermark</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Template Details */}
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Position</span>
                  <span className="text-foreground capitalize">
                    {template.watermarkPosition.replace("-", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Opacity</span>
                  <span className="text-foreground">
                    {Math.round(template.watermarkOpacity * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Scale</span>
                  <span className="text-foreground">{template.watermarkScale}x</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-[var(--card-border)]">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApply(template.id)}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Check className="h-3 w-3 mr-2" />
                  Apply to Organization
                </Button>
                <div className="flex items-center gap-2">
                  {!template.isDefault && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSetDefault(template.id)}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openModal(template)}
                    disabled={isSubmitting}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteConfirmId(template.id)}
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Watermark Template" : "Create Watermark Template"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-5">
              {/* Template Name */}
              <Input
                label="Template Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Full Signature, Corner Logo"
                required
              />

              {/* Watermark Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Watermark Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, watermarkType: "text" })}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                      formData.watermarkType === "text"
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                    )}
                  >
                    <Type className="h-6 w-6" />
                    <span className="text-sm font-medium">Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, watermarkType: "image" })}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
                      formData.watermarkType === "image"
                        ? "border-[var(--primary)] bg-[var(--primary)]/10"
                        : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                    )}
                  >
                    <ImageIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Image</span>
                  </button>
                </div>
              </div>

              {/* Conditional Fields */}
              {formData.watermarkType === "text" ? (
                <Input
                  label="Watermark Text"
                  value={formData.watermarkText || ""}
                  onChange={(e) => setFormData({ ...formData, watermarkText: e.target.value })}
                  placeholder="© 2024 Your Name"
                  required={formData.watermarkType === "text"}
                />
              ) : (
                <Input
                  label="Image URL"
                  value={formData.watermarkImageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, watermarkImageUrl: e.target.value })}
                  placeholder="https://example.com/watermark.png"
                  required={formData.watermarkType === "image"}
                />
              )}

              {/* Position */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Position</label>
                <select
                  value={formData.watermarkPosition}
                  onChange={(e) => setFormData({ ...formData, watermarkPosition: e.target.value as WatermarkPosition })}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input)] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <label className="text-sm font-medium text-foreground">Opacity</label>
                  <span className="text-sm text-foreground-muted">
                    {Math.round(formData.watermarkOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={formData.watermarkOpacity}
                  onChange={(e) => setFormData({ ...formData, watermarkOpacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Scale */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <label className="text-sm font-medium text-foreground">Scale</label>
                  <span className="text-sm text-foreground-muted">
                    {formData.watermarkScale}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={formData.watermarkScale}
                  onChange={(e) => setFormData({ ...formData, watermarkScale: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Default */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-[var(--input-border)]"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">Set as default template</div>
                  <div className="text-xs text-foreground-muted">
                    This template will be pre-selected when creating new galleries
                  </div>
                </div>
              </label>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onClick={closeModal} type="button" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingTemplate ? "Update Template" : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Template?</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p className="text-sm text-foreground-muted">
                Are you sure you want to delete this watermark template? This action cannot be undone.
              </p>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDeleteConfirmId(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Deleting..." : "Delete Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
