"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
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
import {
  createGalleryTemplate,
  updateGalleryTemplate,
  deleteGalleryTemplate,
  type GalleryTemplateInput,
} from "@/lib/actions/gallery-templates";

interface Service {
  id: string;
  name: string;
  priceCents: number;
}

interface GalleryTemplate {
  id: string;
  name: string;
  description: string | null;
  serviceId: string | null;
  defaultPriceCents: number;
  currency: string;
  isPasswordProtected: boolean;
  defaultPassword: string | null;
  allowDownloads: boolean;
  allowFavorites: boolean;
  showWatermark: boolean;
  sendNotifications: boolean;
  expirationDays: number | null;
  isDefault: boolean;
  usageCount: number;
  service?: { id: string; name: string; priceCents: number } | null;
}

interface GalleryTemplatesClientProps {
  templates: GalleryTemplate[];
  services: Service[];
}

export function GalleryTemplatesClient({ templates: initialTemplates, services }: GalleryTemplatesClientProps) {
  const { showToast } = useToast();
  const [templates, setTemplates] = useState(initialTemplates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<GalleryTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<GalleryTemplateInput>({
    name: "",
    description: "",
    serviceId: null,
    defaultPriceCents: 0,
    currency: "USD",
    isPasswordProtected: false,
    defaultPassword: null,
    allowDownloads: true,
    allowFavorites: true,
    showWatermark: false,
    sendNotifications: true,
    expirationDays: null,
    isDefault: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      serviceId: null,
      defaultPriceCents: 0,
      currency: "USD",
      isPasswordProtected: false,
      defaultPassword: null,
      allowDownloads: true,
      allowFavorites: true,
      showWatermark: false,
      sendNotifications: true,
      expirationDays: null,
      isDefault: false,
    });
    setEditingTemplate(null);
  };

  const openModal = (template?: GalleryTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        description: template.description || "",
        serviceId: template.serviceId,
        defaultPriceCents: template.defaultPriceCents,
        currency: template.currency,
        isPasswordProtected: template.isPasswordProtected,
        defaultPassword: template.defaultPassword,
        allowDownloads: template.allowDownloads,
        allowFavorites: template.allowFavorites,
        showWatermark: template.showWatermark,
        sendNotifications: template.sendNotifications,
        expirationDays: template.expirationDays,
        isDefault: template.isDefault,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Please enter a template name", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        const result = await updateGalleryTemplate(editingTemplate.id, formData);
        if (result.success) {
          setTemplates((prev) =>
            prev.map((t) => (t.id === editingTemplate.id ? { ...t, ...formData, service: services.find((s) => s.id === formData.serviceId) || null } : t))
          );
          showToast("Template updated successfully", "success");
          setIsModalOpen(false);
          resetForm();
        } else {
          showToast(result.error || "Failed to update template", "error");
        }
      } else {
        const result = await createGalleryTemplate(formData);
        if (result.success && result.data) {
          setTemplates((prev) => [...prev, { ...result.data, service: services.find((s) => s.id === formData.serviceId) || null }]);
          showToast("Template created successfully", "success");
          setIsModalOpen(false);
          resetForm();
        } else {
          showToast(result.error || "Failed to create template", "error");
        }
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteGalleryTemplate(id);
      if (result.success) {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        showToast("Template deleted successfully", "success");
      } else {
        showToast(result.error || "Failed to delete template", "error");
      }
    } catch (error) {
      showToast("An unexpected error occurred", "error");
    }
    setDeleteConfirmId(null);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground-muted">
          {templates.length} template{templates.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => openModal()}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
        >
          <PlusIcon className="h-4 w-4" />
          New Template
        </button>
      </div>

      {/* Templates List */}
      {templates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 hover:border-[var(--border-hover)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
                  {template.isDefault && (
                    <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal(template)}
                    className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors"
                  >
                    <EditIcon className="h-4 w-4" />
                  </button>
                  {deleteConfirmId === template.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-1.5 rounded-lg text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(template.id)}
                      className="p-1.5 rounded-lg text-foreground-muted hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {template.description && (
                <p className="text-sm text-foreground-muted mb-3 line-clamp-2">{template.description}</p>
              )}

              <div className="space-y-2 text-xs text-foreground-muted">
                {template.service && (
                  <div className="flex items-center gap-2">
                    <ServiceIcon className="h-3.5 w-3.5" />
                    <span>{template.service.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CurrencyIcon className="h-3.5 w-3.5" />
                  <span>{formatCurrency(template.defaultPriceCents)}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {template.allowDownloads && (
                    <span className="rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs text-[var(--success)]">Downloads</span>
                  )}
                  {template.showWatermark && (
                    <span className="rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-xs text-[var(--warning)]">Watermark</span>
                  )}
                  {template.isPasswordProtected && (
                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-xs text-purple-400">Password</span>
                  )}
                  {template.expirationDays && (
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{template.expirationDays}d expiry</span>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[var(--card-border)] flex items-center justify-between text-xs text-foreground-muted">
                <span>Used {template.usageCount} time{template.usageCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <TemplateIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">No templates yet</h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Create templates to save gallery settings and speed up your workflow.
          </p>
          <button
            onClick={() => openModal()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            Create First Template
          </button>
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <DialogBody className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Template Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Real Estate Standard"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe when to use this template..."
                  rows={2}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                />
              </div>

              {/* Service */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Default Service</label>
                <select
                  value={formData.serviceId || ""}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value || null })}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                >
                  <option value="">No default service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} ({formatCurrency(service.priceCents)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Default Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={(formData.defaultPriceCents ?? 0) / 100}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultPriceCents: Math.round(parseFloat(e.target.value || "0") * 100),
                      })
                    }
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-8 pr-4 py-2.5 text-sm text-foreground focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Expiration */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Expiration (days)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.expirationDays || ""}
                  onChange={(e) => setFormData({ ...formData, expirationDays: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="No expiration"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              {/* Settings Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">Allow Downloads</span>
                    <p className="text-xs text-foreground-muted">Let clients download photos after payment</p>
                  </div>
                  <Switch checked={formData.allowDownloads} onCheckedChange={(v) => setFormData({ ...formData, allowDownloads: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">Allow Favorites</span>
                    <p className="text-xs text-foreground-muted">Let clients mark favorite photos</p>
                  </div>
                  <Switch checked={formData.allowFavorites} onCheckedChange={(v) => setFormData({ ...formData, allowFavorites: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">Show Watermarks</span>
                    <p className="text-xs text-foreground-muted">Display watermarks until purchased</p>
                  </div>
                  <Switch checked={formData.showWatermark} onCheckedChange={(v) => setFormData({ ...formData, showWatermark: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">Email Notifications</span>
                    <p className="text-xs text-foreground-muted">Notify when clients view or purchase</p>
                  </div>
                  <Switch checked={formData.sendNotifications} onCheckedChange={(v) => setFormData({ ...formData, sendNotifications: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">Password Protected</span>
                    <p className="text-xs text-foreground-muted">Require a password to view</p>
                  </div>
                  <Switch checked={formData.isPasswordProtected} onCheckedChange={(v) => setFormData({ ...formData, isPasswordProtected: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-foreground">Set as Default</span>
                    <p className="text-xs text-foreground-muted">Pre-select this template for new galleries</p>
                  </div>
                  <Switch checked={formData.isDefault} onCheckedChange={(v) => setFormData({ ...formData, isDefault: v })} />
                </div>
              </div>
            </DialogBody>

            {/* Actions */}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : editingTemplate ? "Update Template" : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function TemplateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

function ServiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 0 1 8.75 1h2.5A2.75 2.75 0 0 1 14 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 0 1 6 4.193V3.75Zm6.5 0v.325a41.622 41.622 0 0 0-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25ZM10 10a1 1 0 0 0-1 1v.01a1 1 0 0 0 1 1h.01a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1H10Z" clipRule="evenodd" />
      <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 0 1-9.274 0C3.985 17.585 3 16.402 3 15.055Z" />
    </svg>
  );
}

function CurrencyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 10.818v2.614A3.13 3.13 0 0 0 11.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 0 0-1.138-.432ZM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 0 0-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152Z" />
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-6a.75.75 0 0 1 .75.75v.316a3.78 3.78 0 0 1 1.653.713c.426.33.744.74.925 1.2a.75.75 0 0 1-1.395.55 1.35 1.35 0 0 0-.447-.563 2.187 2.187 0 0 0-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 1 1-1.5 0v-.3a3.78 3.78 0 0 1-1.653-.712 2.733 2.733 0 0 1-.925-1.2.75.75 0 0 1 1.395-.55c.12.3.296.55.447.563a2.187 2.187 0 0 0 .736.363v-2.614a3.78 3.78 0 0 1-1.653-.713c-.787-.514-1.29-1.27-1.29-2.13 0-.86.504-1.616 1.29-2.13A3.78 3.78 0 0 1 9.25 5.066V4.75A.75.75 0 0 1 10 4Z" clipRule="evenodd" />
    </svg>
  );
}
