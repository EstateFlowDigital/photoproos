"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  createOrderPage,
  updateOrderPage,
  deleteOrderPage,
  setOrderPageBundles,
  setOrderPageServices,
} from "@/lib/actions/order-pages";
import { getBundles } from "@/lib/actions/bundles";
import { getServices } from "@/lib/actions/services";
import { useToast } from "@/components/ui/toast";
import { Switch } from "@/components/ui/switch";
import type { Testimonial } from "@/lib/validations/order-pages";

interface OrderPageFormData {
  name: string;
  slug: string;
  headline: string;
  subheadline: string;
  heroImageUrl: string;
  logoOverrideUrl: string;
  primaryColor: string;
  showPhone: boolean;
  showEmail: boolean;
  customPhone: string;
  customEmail: string;
  template: string;
  metaTitle: string;
  metaDescription: string;
  testimonials: Testimonial[];
  isPublished: boolean;
  requireLogin: boolean;
}

interface BundleItem {
  id: string;
  name: string;
  priceCents: number;
}

interface ServiceItem {
  id: string;
  name: string;
  priceCents: number;
  category: string;
}

interface OrderPageFormProps {
  initialData?: OrderPageFormData & {
    id?: string;
    orderCount?: number;
    bundleIds?: string[];
    serviceIds?: string[];
  };
  mode: "create" | "edit";
}

const defaultFormData: OrderPageFormData = {
  name: "",
  slug: "",
  headline: "",
  subheadline: "",
  heroImageUrl: "",
  logoOverrideUrl: "",
  primaryColor: "#3b82f6",
  showPhone: true,
  showEmail: true,
  customPhone: "",
  customEmail: "",
  template: "default",
  metaTitle: "",
  metaDescription: "",
  testimonials: [],
  isPublished: false,
  requireLogin: false,
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function OrderPageForm({ initialData, mode }: OrderPageFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<OrderPageFormData>(
    initialData || defaultFormData
  );
  const [selectedBundleIds, setSelectedBundleIds] = useState<string[]>(
    initialData?.bundleIds || []
  );
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    initialData?.serviceIds || []
  );
  const [availableBundles, setAvailableBundles] = useState<BundleItem[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [activeTab, setActiveTab] = useState<"content" | "products" | "settings">("content");

  const orderCount = initialData?.orderCount || 0;

  // Load bundles and services
  useEffect(() => {
    async function loadData() {
      try {
        const [bundles, services] = await Promise.all([
          getBundles({ isActive: true }),
          getServices({ isActive: true }),
        ]);
        setAvailableBundles(bundles.map((b) => ({ id: b.id, name: b.name, priceCents: b.priceCents })));
        setAvailableServices(services.map((s) => ({ id: s.id, name: s.name, priceCents: s.priceCents, category: s.category })));
      } catch (error) {
        console.error("Error loading data:", error);
        showToast("Failed to load bundles and services", "error");
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [showToast]);

  // Auto-generate slug from name
  const handleNameChange = useCallback(
    (name: string) => {
      setFormData((prev) => ({
        ...prev,
        name,
        ...(autoSlug ? { slug: generateSlug(name) } : {}),
      }));
    },
    [autoSlug]
  );

  const handleSlugChange = useCallback((slug: string) => {
    setAutoSlug(false);
    setFormData((prev) => ({ ...prev, slug }));
  }, []);

  const handleAddTestimonial = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      testimonials: [
        ...prev.testimonials,
        { name: "", company: "", quote: "", photoUrl: null },
      ],
    }));
  }, []);

  const handleUpdateTestimonial = useCallback(
    (index: number, updates: Partial<Testimonial>) => {
      setFormData((prev) => ({
        ...prev,
        testimonials: prev.testimonials.map((t, i) =>
          i === index ? { ...t, ...updates } : t
        ),
      }));
    },
    []
  );

  const handleRemoveTestimonial = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (mode === "create") {
        const result = await createOrderPage({
          name: formData.name,
          slug: formData.slug,
          headline: formData.headline || null,
          subheadline: formData.subheadline || null,
          heroImageUrl: formData.heroImageUrl || null,
          logoOverrideUrl: formData.logoOverrideUrl || null,
          primaryColor: formData.primaryColor || null,
          showPhone: formData.showPhone,
          showEmail: formData.showEmail,
          customPhone: formData.customPhone || null,
          customEmail: formData.customEmail || null,
          template: formData.template,
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
          testimonials: formData.testimonials,
          isPublished: formData.isPublished,
          requireLogin: formData.requireLogin,
        });

        if (result.success) {
          // Add bundles and services
          if (selectedBundleIds.length > 0) {
            await setOrderPageBundles({
              orderPageId: result.data.id,
              bundleIds: selectedBundleIds,
            });
          }
          if (selectedServiceIds.length > 0) {
            await setOrderPageServices({
              orderPageId: result.data.id,
              services: selectedServiceIds.map((id, index) => ({
                serviceId: id,
                sortOrder: index,
              })),
            });
          }
          showToast("Order page created successfully", "success");
          router.push("/order-pages");
        } else {
          showToast(result.error, "error");
        }
      } else {
        if (!initialData?.id) {
          showToast("Order page ID is missing", "error");
          setIsSaving(false);
          return;
        }

        const result = await updateOrderPage({
          id: initialData.id,
          name: formData.name,
          slug: formData.slug,
          headline: formData.headline || null,
          subheadline: formData.subheadline || null,
          heroImageUrl: formData.heroImageUrl || null,
          logoOverrideUrl: formData.logoOverrideUrl || null,
          primaryColor: formData.primaryColor || null,
          showPhone: formData.showPhone,
          showEmail: formData.showEmail,
          customPhone: formData.customPhone || null,
          customEmail: formData.customEmail || null,
          template: formData.template,
          metaTitle: formData.metaTitle || null,
          metaDescription: formData.metaDescription || null,
          testimonials: formData.testimonials,
          isPublished: formData.isPublished,
          requireLogin: formData.requireLogin,
        });

        if (result.success) {
          // Update bundles and services
          await setOrderPageBundles({
            orderPageId: initialData.id,
            bundleIds: selectedBundleIds,
          });
          await setOrderPageServices({
            orderPageId: initialData.id,
            services: selectedServiceIds.map((id, index) => ({
              serviceId: id,
              sortOrder: index,
            })),
          });
          showToast("Order page updated successfully", "success");
          router.push("/order-pages");
        } else {
          showToast(result.error, "error");
        }
      }
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    setIsDeleting(true);
    try {
      const result = await deleteOrderPage(initialData.id, false);

      if (result.success) {
        showToast(
          orderCount > 0 ? "Order page archived" : "Order page deleted",
          "success"
        );
        router.push("/order-pages");
      } else {
        showToast(result.error, "error");
      }
    } catch {
      showToast("An unexpected error occurred", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg bg-[var(--background-secondary)]">
        {["content", "products", "settings"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={cn(
              "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-[var(--card)] text-foreground shadow-sm"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === "content" && (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Page Details</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                  Page Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Premium Photo Package"
                  required
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-foreground mb-1.5">
                  URL Slug <span className="text-[var(--error)]">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[var(--card-border)] bg-[var(--background-secondary)] px-3 text-sm text-foreground-muted">
                    /order/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="premium-photo-package"
                    required
                    pattern="^[a-z0-9-]+$"
                    className="flex-1 rounded-r-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-foreground mb-1.5">
                  Headline
                </label>
                <input
                  type="text"
                  id="headline"
                  value={formData.headline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
                  placeholder="e.g., Professional Photography Services"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label htmlFor="subheadline" className="block text-sm font-medium text-foreground mb-1.5">
                  Subheadline
                </label>
                <textarea
                  id="subheadline"
                  rows={2}
                  value={formData.subheadline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subheadline: e.target.value }))}
                  placeholder="e.g., Capture your property in stunning detail"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                />
              </div>

              <div>
                <label htmlFor="heroImageUrl" className="block text-sm font-medium text-foreground mb-1.5">
                  Hero Image URL
                </label>
                <input
                  type="url"
                  id="heroImageUrl"
                  value={formData.heroImageUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroImageUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Testimonials</h2>

            <div className="space-y-4">
              {formData.testimonials.map((testimonial, index) => (
                <div key={index} className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">Testimonial {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTestimonial(index)}
                      className="text-sm text-[var(--error)] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(e) => handleUpdateTestimonial(index, { name: e.target.value })}
                      placeholder="Name"
                      className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm"
                    />
                    <input
                      type="text"
                      value={testimonial.company || ""}
                      onChange={(e) => handleUpdateTestimonial(index, { company: e.target.value })}
                      placeholder="Company (optional)"
                      className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm"
                    />
                  </div>
                  <textarea
                    value={testimonial.quote}
                    onChange={(e) => handleUpdateTestimonial(index, { quote: e.target.value })}
                    placeholder="Quote..."
                    rows={2}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm resize-none"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddTestimonial}
                className="w-full rounded-lg border border-dashed border-[var(--card-border)] py-3 text-sm text-foreground-muted hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
              >
                + Add Testimonial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {isLoadingData ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--primary)] border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Bundles */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Bundles</h2>
                <p className="text-sm text-foreground-muted mb-4">
                  Select bundles to display on this order page.
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableBundles.length === 0 ? (
                    <p className="text-sm text-foreground-muted text-center py-4">
                      No bundles available.{" "}
                      <Link href="/services/bundles/new" className="text-[var(--primary)] hover:underline">
                        Create one
                      </Link>
                    </p>
                  ) : (
                    availableBundles.map((bundle) => (
                      <label
                        key={bundle.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          selectedBundleIds.includes(bundle.id)
                            ? "border-[var(--primary)] bg-[var(--primary)]/10"
                            : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)]"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedBundleIds.includes(bundle.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBundleIds((prev) => [...prev, bundle.id]);
                            } else {
                              setSelectedBundleIds((prev) => prev.filter((id) => id !== bundle.id));
                            }
                          }}
                          className="rounded border-[var(--card-border)]"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-foreground">{bundle.name}</span>
                        </div>
                        <span className="text-sm text-foreground-muted">{formatCurrency(bundle.priceCents)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Services */}
              <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Individual Services</h2>
                <p className="text-sm text-foreground-muted mb-4">
                  Select individual services to display on this order page.
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availableServices.length === 0 ? (
                    <p className="text-sm text-foreground-muted text-center py-4">
                      No services available.{" "}
                      <Link href="/services/new" className="text-[var(--primary)] hover:underline">
                        Create one
                      </Link>
                    </p>
                  ) : (
                    availableServices.map((service) => (
                      <label
                        key={service.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          selectedServiceIds.includes(service.id)
                            ? "border-[var(--primary)] bg-[var(--primary)]/10"
                            : "border-[var(--card-border)] bg-[var(--background)] hover:border-[var(--border-hover)]"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedServiceIds((prev) => [...prev, service.id]);
                            } else {
                              setSelectedServiceIds((prev) => prev.filter((id) => id !== service.id));
                            }
                          }}
                          className="rounded border-[var(--card-border)]"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-foreground">{service.name}</span>
                          <span className="text-xs text-foreground-muted ml-2 capitalize">
                            {service.category.replace("_", " ")}
                          </span>
                        </div>
                        <span className="text-sm text-foreground-muted">{formatCurrency(service.priceCents)}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Branding */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Branding</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="logoOverrideUrl" className="block text-sm font-medium text-foreground mb-1.5">
                  Logo URL
                </label>
                <input
                  type="url"
                  id="logoOverrideUrl"
                  value={formData.logoOverrideUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, logoOverrideUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
                <p className="mt-1 text-xs text-foreground-muted">Leave blank to use organization logo</p>
              </div>

              <div>
                <label htmlFor="primaryColor" className="block text-sm font-medium text-foreground mb-1.5">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primaryColor"
                    value={formData.primaryColor || "#3b82f6"}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    className="h-10 w-14 rounded border border-[var(--card-border)] bg-[var(--background)] cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#3b82f6"
                    className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Contact Information</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-foreground">Show Phone Number</span>
                  <p className="text-xs text-foreground-muted">Display phone on the order page</p>
                </div>
                <Switch
                  checked={formData.showPhone}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, showPhone: checked }))}
                />
              </label>

              {formData.showPhone && (
                <div>
                  <label htmlFor="customPhone" className="block text-sm font-medium text-foreground mb-1.5">
                    Custom Phone Number
                  </label>
                  <input
                    type="tel"
                    id="customPhone"
                    value={formData.customPhone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customPhone: e.target.value }))}
                    placeholder="Leave blank to use organization phone"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              )}

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-foreground">Show Email</span>
                  <p className="text-xs text-foreground-muted">Display email on the order page</p>
                </div>
                <Switch
                  checked={formData.showEmail}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, showEmail: checked }))}
                />
              </label>

              {formData.showEmail && (
                <div>
                  <label htmlFor="customEmail" className="block text-sm font-medium text-foreground mb-1.5">
                    Custom Email
                  </label>
                  <input
                    type="email"
                    id="customEmail"
                    value={formData.customEmail}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customEmail: e.target.value }))}
                    placeholder="Leave blank to use organization email"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">SEO Settings</h2>
            <div className="space-y-5">
              <div>
                <label htmlFor="metaTitle" className="block text-sm font-medium text-foreground mb-1.5">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="Custom title for search engines"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label htmlFor="metaDescription" className="block text-sm font-medium text-foreground mb-1.5">
                  Meta Description
                </label>
                <textarea
                  id="metaDescription"
                  rows={2}
                  value={formData.metaDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Custom description for search engines"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Page Settings */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Page Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-foreground">Published</span>
                  <p className="text-xs text-foreground-muted">Published pages can receive orders</p>
                </div>
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublished: checked }))}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-foreground">Require Login</span>
                  <p className="text-xs text-foreground-muted">Visitors must sign in to view this page</p>
                </div>
                <Switch
                  checked={formData.requireLogin}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, requireLogin: checked }))}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {orderCount > 0 ? "Archive Order Page?" : "Delete Order Page?"}
            </h3>
            <p className="text-sm text-foreground-muted mb-6">
              {orderCount > 0
                ? `This page has received ${orderCount} ${orderCount === 1 ? "order" : "orders"}. It will be archived and hidden.`
                : "This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--error)]/90 disabled:opacity-50"
              >
                {isDeleting ? "Processing..." : orderCount > 0 ? "Archive" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {mode === "edit" && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full sm:w-auto rounded-lg border border-[var(--error)]/50 bg-transparent px-4 py-2.5 text-sm font-medium text-[var(--error)] hover:bg-[var(--error)]/10"
            >
              {orderCount > 0 ? "Archive Page" : "Delete Page"}
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            href="/order-pages"
            className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium text-foreground hover:bg-[var(--background-hover)] text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving || !formData.name || !formData.slug}
            className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : mode === "create" ? "Create Page" : "Save Changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
