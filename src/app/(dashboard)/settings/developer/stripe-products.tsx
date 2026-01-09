"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/toast";
import { createService } from "@/lib/actions/services";
import { createBundle } from "@/lib/actions/bundles";
import {
  syncProductsToStripe,
  syncSingleProductToStripe,
  refreshSyncOverview,
} from "@/lib/actions/stripe-product-sync";
import type { ProductSyncOverview } from "@/lib/stripe/product-sync";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const SERVICE_CATEGORIES = [
  { value: "real_estate", label: "Real Estate" },
  { value: "portrait", label: "Portrait" },
  { value: "event", label: "Event" },
  { value: "commercial", label: "Commercial" },
  { value: "wedding", label: "Wedding" },
  { value: "product", label: "Product" },
  { value: "other", label: "Other" },
] satisfies { value: string; label: string }[];

const BUNDLE_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "tiered", label: "Tiered" },
  { value: "custom", label: "Custom" },
] satisfies { value: string; label: string }[];

interface SyncStats {
  services: { synced: number; failed: number; errors: string[] } | null;
  bundles: { synced: number; failed: number; errors: string[] } | null;
}

// Generate a URL-friendly slug from a name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Format price from cents to dollars
function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

// Format date
function formatDate(date: Date | null): string {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function StripeProductsSection({
  organizationId,
  initialSyncOverview,
}: {
  organizationId: string;
  initialSyncOverview: ProductSyncOverview;
}) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [syncOverview, setSyncOverview] =
    useState<ProductSyncOverview>(initialSyncOverview);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    services: null,
    bundles: null,
  });
  const [activeTab, setActiveTab] = useState<
    "status" | "service" | "bundle" | "sync"
  >("status");

  // Service form state
  const [serviceName, setServiceName] = useState("");
  const [serviceCategory, setServiceCategory] = useState("real_estate");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [serviceDeliverables, setServiceDeliverables] = useState("");

  // Bundle form state
  const [bundleName, setBundleName] = useState("");
  const [bundleType, setBundleType] = useState("fixed");
  const [bundleDescription, setBundleDescription] = useState("");
  const [bundlePrice, setBundlePrice] = useState("");

  const resetServiceForm = () => {
    setServiceName("");
    setServiceCategory("real_estate");
    setServiceDescription("");
    setServicePrice("");
    setServiceDuration("");
    setServiceDeliverables("");
  };

  const resetBundleForm = () => {
    setBundleName("");
    setBundleType("fixed");
    setBundleDescription("");
    setBundlePrice("");
  };

  const handleCreateService = () => {
    if (!serviceName.trim()) {
      showToast("Service name is required", "error");
      return;
    }

    const priceCents = Math.round(parseFloat(servicePrice || "0") * 100);
    if (isNaN(priceCents) || priceCents < 0) {
      showToast("Invalid price", "error");
      return;
    }

    startTransition(async () => {
      const result = await createService({
        name: serviceName.trim(),
        category: serviceCategory as
          | "real_estate"
          | "portrait"
          | "event"
          | "commercial"
          | "wedding"
          | "product"
          | "other",
        description: serviceDescription.trim() || null,
        priceCents,
        duration: serviceDuration.trim() || null,
        deliverables: serviceDeliverables
          .split("\n")
          .map((d) => d.trim())
          .filter(Boolean),
        isActive: true,
        pricingMethod: "fixed",
        pricePerSqftCents: null,
        minSqft: null,
        maxSqft: null,
        sqftIncrements: 500,
      });

      if (result.success) {
        showToast("Service created and synced to Stripe", "success");
        resetServiceForm();
        // Update the sync overview
        setSyncOverview((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            total: prev.services.total + 1,
            synced: prev.services.synced + 1,
          },
        }));
      } else {
        showToast(result.error || "Failed to create service", "error");
      }
    });
  };

  const handleCreateBundle = () => {
    if (!bundleName.trim()) {
      showToast("Bundle name is required", "error");
      return;
    }

    const priceCents = Math.round(parseFloat(bundlePrice || "0") * 100);
    if (isNaN(priceCents) || priceCents < 0) {
      showToast("Invalid price", "error");
      return;
    }

    startTransition(async () => {
      const result = await createBundle({
        name: bundleName.trim(),
        slug: generateSlug(bundleName.trim()),
        bundleType: bundleType as "fixed" | "tiered" | "custom",
        pricingMethod: "fixed" as const,
        description: bundleDescription.trim() || null,
        priceCents,
        sqftIncrements: null,
        badgeText: null,
        isActive: true,
        isPublic: true,
      });

      if (result.success) {
        showToast("Bundle created and synced to Stripe", "success");
        resetBundleForm();
        // Update the sync overview
        setSyncOverview((prev) => ({
          ...prev,
          bundles: {
            ...prev.bundles,
            total: prev.bundles.total + 1,
            synced: prev.bundles.synced + 1,
          },
        }));
      } else {
        showToast(result.error || "Failed to create bundle", "error");
      }
    });
  };

  const handleSyncAll = () => {
    startTransition(async () => {
      try {
        const { services: servicesResult, bundles: bundlesResult } =
          await syncProductsToStripe();

        setSyncStats({
          services: servicesResult,
          bundles: bundlesResult,
        });

        // Update sync overview counts
        setSyncOverview((prev) => ({
          ...prev,
          services: {
            ...prev.services,
            synced: prev.services.synced + servicesResult.synced,
            unsynced: Math.max(0, prev.services.unsynced - servicesResult.synced),
          },
          bundles: {
            ...prev.bundles,
            synced: prev.bundles.synced + bundlesResult.synced,
            unsynced: Math.max(0, prev.bundles.unsynced - bundlesResult.synced),
          },
        }));

        const totalSynced = servicesResult.synced + bundlesResult.synced;
        const totalFailed = servicesResult.failed + bundlesResult.failed;

        if (totalFailed === 0) {
          showToast(
            `Successfully synced ${totalSynced} products to Stripe`,
            "success"
          );
        } else {
          showToast(
            `Synced ${totalSynced}, failed ${totalFailed}. Check details below.`,
            "warning"
          );
        }
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : "Failed to sync products",
          "error"
        );
      }
    });
  };

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const newOverview = await refreshSyncOverview();
        setSyncOverview(newOverview);
        showToast("Sync status refreshed", "success");
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : "Failed to refresh status",
          "error"
        );
      }
    });
  };

  const handleSyncSingle = (productId: string, productType: "service" | "bundle", productName: string) => {
    startTransition(async () => {
      try {
        const result = await syncSingleProductToStripe(productId, productType);
        if (result.success) {
          showToast(`${productName} synced to Stripe`, "success");
          // Refresh the overview to get updated data
          const newOverview = await refreshSyncOverview();
          setSyncOverview(newOverview);
        } else {
          showToast(result.error || "Failed to sync product", "error");
        }
      } catch (error) {
        showToast(
          error instanceof Error ? error.message : "Failed to sync product",
          "error"
        );
      }
    });
  };

  const getStripeProductUrl = (stripeProductId: string | null) => {
    if (!stripeProductId) return null;
    return `https://dashboard.stripe.com/products/${stripeProductId}`;
  };

  const totalProducts = syncOverview.services.total + syncOverview.bundles.total;
  const totalSynced = syncOverview.services.synced + syncOverview.bundles.synced;
  const totalUnsynced =
    syncOverview.services.unsynced + syncOverview.bundles.unsynced;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#635bff]/10 text-[#635bff] border-2 border-[var(--card-border)]">
            <StripeIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Stripe Products
            </h2>
            <p className="text-sm text-foreground-muted">
              Create and sync products to Stripe
            </p>
          </div>
        </div>

        {/* Quick Stats & Refresh */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 text-sm">
            {syncOverview.isConfigured ? (
              <>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[var(--success)]" />
                  <span className="text-foreground-muted">
                    {totalSynced} synced
                  </span>
                </div>
                {totalUnsynced > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[var(--warning)]" />
                    <span className="text-foreground-muted">
                      {totalUnsynced} pending
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[var(--error)]" />
                <span className="text-foreground-muted">Not configured</span>
              </div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground-muted transition-colors hover:bg-[var(--background-hover)] hover:text-foreground disabled:opacity-50"
            title="Refresh sync status"
          >
            <RefreshIcon className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-[var(--background)] rounded-lg overflow-x-auto">
        <button
          onClick={() => setActiveTab("status")}
          className={`flex-1 min-w-[80px] px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "status"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Status
        </button>
        <button
          onClick={() => setActiveTab("service")}
          className={`flex-1 min-w-[80px] px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "service"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          New Service
        </button>
        <button
          onClick={() => setActiveTab("bundle")}
          className={`flex-1 min-w-[80px] px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "bundle"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          New Bundle
        </button>
        <button
          onClick={() => setActiveTab("sync")}
          className={`flex-1 min-w-[80px] px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "sync"
              ? "bg-[var(--card)] text-foreground shadow-sm"
              : "text-foreground-muted hover:text-foreground"
          }`}
        >
          Bulk Sync
        </button>
      </div>

      {/* Status Tab */}
      {activeTab === "status" && (
        <div className="space-y-4">
          {/* Configuration Status */}
          <div
            className={`rounded-lg border p-4 ${
              syncOverview.isConfigured
                ? "border-[var(--success)] bg-[var(--success)]/5"
                : "border-[var(--error)] bg-[var(--error)]/5"
            }`}
          >
            <div className="flex items-center gap-2">
              {syncOverview.isConfigured ? (
                <>
                  <CheckIcon className="h-5 w-5 text-[var(--success)]" />
                  <span className="font-medium text-foreground">
                    Stripe is configured
                  </span>
                </>
              ) : (
                <>
                  <XIcon className="h-5 w-5 text-[var(--error)]" />
                  <span className="font-medium text-foreground">
                    Stripe is not configured
                  </span>
                </>
              )}
            </div>
            {!syncOverview.isConfigured && (
              <p className="mt-2 text-sm text-foreground-muted">
                Add STRIPE_SECRET_KEY to your environment variables to enable
                product syncing.
              </p>
            )}
          </div>

          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <h3 className="font-medium text-foreground">Services</h3>
                <span className="text-sm text-foreground-muted">
                  {syncOverview.services.total} total
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[var(--success)]" />
                  <span className="text-foreground-muted">
                    {syncOverview.services.synced} synced
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[var(--warning)]" />
                  <span className="text-foreground-muted">
                    {syncOverview.services.unsynced} pending
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                <h3 className="font-medium text-foreground">Bundles</h3>
                <span className="text-sm text-foreground-muted">
                  {syncOverview.bundles.total} total
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[var(--success)]" />
                  <span className="text-foreground-muted">
                    {syncOverview.bundles.synced} synced
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-[var(--warning)]" />
                  <span className="text-foreground-muted">
                    {syncOverview.bundles.unsynced} pending
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product List */}
          {totalProducts > 0 && (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h3 className="text-sm font-medium text-foreground">
                  All Products
                </h3>
                <a
                  href="https://dashboard.stripe.com/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#635bff] hover:underline flex items-center gap-1"
                >
                  View in Stripe
                  <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </div>

              <div className="rounded-lg border border-[var(--card-border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[var(--background)]">
                    <tr className="border-b border-[var(--card-border)]">
                      <th className="text-left font-medium text-foreground-muted px-4 py-2.5">
                        Name
                      </th>
                      <th className="text-left font-medium text-foreground-muted px-4 py-2.5 hidden sm:table-cell">
                        Type
                      </th>
                      <th className="text-right font-medium text-foreground-muted px-4 py-2.5">
                        Price
                      </th>
                      <th className="text-center font-medium text-foreground-muted px-4 py-2.5">
                        Status
                      </th>
                      <th className="text-right font-medium text-foreground-muted px-4 py-2.5 hidden md:table-cell">
                        Last Sync
                      </th>
                      <th className="text-right font-medium text-foreground-muted px-4 py-2.5">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {[
                      ...syncOverview.services.items,
                      ...syncOverview.bundles.items,
                    ].map((item) => (
                      <tr key={item.id} className="hover:bg-[var(--background)]">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 hidden sm:table-cell">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.type === "service"
                                ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                                : "bg-[var(--ai)]/10 text-[var(--ai)]"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-foreground-muted">
                          {formatPrice(item.priceCents)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {item.isSynced ? (
                            <span className="inline-flex items-center gap-1 text-[var(--success)]">
                              <CheckIcon className="h-4 w-4" />
                              <span className="hidden sm:inline text-xs">
                                Synced
                              </span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[var(--warning)]">
                              <ClockIcon className="h-4 w-4" />
                              <span className="hidden sm:inline text-xs">
                                Pending
                              </span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right text-foreground-muted hidden md:table-cell">
                          {formatDate(item.lastSyncedAt)}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            {item.isSynced && item.stripeProductId && (
                              <a
                                href={getStripeProductUrl(item.stripeProductId) || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md text-foreground-muted hover:text-[#635bff] hover:bg-[#635bff]/10 transition-colors"
                                title="View in Stripe"
                              >
                                <ExternalLinkIcon className="h-4 w-4" />
                              </a>
                            )}
                            <button
                              onClick={() => handleSyncSingle(item.id, item.type, item.name)}
                              disabled={isPending || !syncOverview.isConfigured}
                              className="p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-[var(--background-hover)] transition-colors disabled:opacity-50"
                              title={item.isSynced ? "Re-sync to Stripe" : "Sync to Stripe"}
                            >
                              <RefreshIcon className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {totalProducts === 0 && (
            <div className="text-center py-8">
              <p className="text-foreground-muted">
                No services or bundles yet. Create some to sync to Stripe.
              </p>
            </div>
          )}

          {/* Quick Actions */}
          {totalUnsynced > 0 && syncOverview.isConfigured && (
            <Button
              variant="primary"
              onClick={() => {
                setActiveTab("sync");
                handleSyncAll();
              }}
              disabled={isPending}
              className="w-full bg-[#635bff] hover:bg-[#635bff]/90"
            >
              {isPending ? "Syncing..." : `Sync ${totalUnsynced} Pending Products`}
            </Button>
          )}
        </div>
      )}

      {/* Service Form */}
      {activeTab === "service" && (
        <div className="space-y-4">
          <p className="text-sm text-foreground-secondary">
            Create a new service that will automatically sync to your Stripe
            Product Catalog.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Service Name *
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g., Standard Photography"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <Select
              label="Category *"
              value={serviceCategory}
              onChange={(e) => setServiceCategory(e.target.value)}
              options={SERVICE_CATEGORIES}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Price (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                  $
                </span>
                <input
                  type="number"
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  placeholder="299.00"
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Duration
              </label>
              <input
                type="text"
                value={serviceDuration}
                onChange={(e) => setServiceDuration(e.target.value)}
                placeholder="e.g., 2-3 hours"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              placeholder="Brief description of the service..."
              rows={2}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Deliverables (one per line)
            </label>
            <textarea
              value={serviceDeliverables}
              onChange={(e) => setServiceDeliverables(e.target.value)}
              placeholder="25 edited photos&#10;Next-day delivery&#10;Online gallery"
              rows={3}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none font-mono"
            />
          </div>

          <Button
            variant="primary"
            onClick={handleCreateService}
            disabled={isPending || !syncOverview.isConfigured}
            className="w-full"
          >
            {isPending ? "Creating..." : "Create Service & Sync to Stripe"}
          </Button>

          {!syncOverview.isConfigured && (
            <p className="text-xs text-[var(--error)] text-center">
              Configure Stripe to enable product creation
            </p>
          )}
        </div>
      )}

      {/* Bundle Form */}
      {activeTab === "bundle" && (
        <div className="space-y-4">
          <p className="text-sm text-foreground-secondary">
            Create a new service bundle that will automatically sync to your
            Stripe Product Catalog.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Bundle Name *
              </label>
              <input
                type="text"
                value={bundleName}
                onChange={(e) => setBundleName(e.target.value)}
                placeholder="e.g., Premium Package"
                className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <Select
              label="Bundle Type *"
              value={bundleType}
              onChange={(e) => setBundleType(e.target.value)}
              options={BUNDLE_TYPES}
            />

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Bundle Price (USD) *
              </label>
              <div className="relative max-w-xs">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
                  $
                </span>
                <input
                  type="number"
                  value={bundlePrice}
                  onChange={(e) => setBundlePrice(e.target.value)}
                  placeholder="799.00"
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Description
            </label>
            <textarea
              value={bundleDescription}
              onChange={(e) => setBundleDescription(e.target.value)}
              placeholder="Brief description of the bundle..."
              rows={2}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3">
            <p className="text-xs text-foreground-muted">
              <strong>Tip:</strong> After creating the bundle, go to{" "}
              <span className="font-medium text-foreground">
                Services → Bundles
              </span>{" "}
              to add individual services to this bundle.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={handleCreateBundle}
            disabled={isPending || !syncOverview.isConfigured}
            className="w-full"
          >
            {isPending ? "Creating..." : "Create Bundle & Sync to Stripe"}
          </Button>

          {!syncOverview.isConfigured && (
            <p className="text-xs text-[var(--error)] text-center">
              Configure Stripe to enable product creation
            </p>
          )}
        </div>
      )}

      {/* Bulk Sync */}
      {activeTab === "sync" && (
        <div className="space-y-4">
          <p className="text-sm text-foreground-secondary">
            Sync all existing services and bundles to your Stripe Product
            Catalog. Use this if you have products that were created before
            Stripe sync was enabled.
          </p>

          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4">
            <h3 className="text-sm font-medium text-foreground mb-2">
              What this does:
            </h3>
            <ul className="space-y-1.5 text-sm text-foreground-muted">
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Creates Stripe Products for all active services
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Creates Stripe Products for all active bundles
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Creates Stripe Prices with current amounts
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-[var(--success)]" />
                Stores Stripe IDs in your database
              </li>
            </ul>
          </div>

          <Button
            variant="primary"
            onClick={handleSyncAll}
            disabled={isPending || !syncOverview.isConfigured}
            className="w-full bg-[#635bff] hover:bg-[#635bff]/90"
          >
            {isPending ? "Syncing..." : "Sync All Products to Stripe"}
          </Button>

          {!syncOverview.isConfigured && (
            <p className="text-xs text-[var(--error)] text-center">
              Configure Stripe to enable syncing
            </p>
          )}

          {/* Sync Results */}
          {(syncStats.services || syncStats.bundles) && (
            <div className="space-y-3 pt-4 border-t border-[var(--card-border)]">
              <h3 className="text-sm font-medium text-foreground">
                Sync Results
              </h3>

              {syncStats.services && (
                <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Services
                    </span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-[var(--success)]">
                        {syncStats.services.synced} synced
                      </span>
                      {syncStats.services.failed > 0 && (
                        <span className="text-[var(--error)]">
                          {syncStats.services.failed} failed
                        </span>
                      )}
                    </div>
                  </div>
                  {syncStats.services.errors.length > 0 && (
                    <ul className="text-xs text-[var(--error)] space-y-1">
                      {syncStats.services.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {syncStats.bundles && (
                <div className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Bundles
                    </span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-[var(--success)]">
                        {syncStats.bundles.synced} synced
                      </span>
                      {syncStats.bundles.failed > 0 && (
                        <span className="text-[var(--error)]">
                          {syncStats.bundles.failed} failed
                        </span>
                      )}
                    </div>
                  </div>
                  {syncStats.bundles.errors.length > 0 && (
                    <ul className="text-xs text-[var(--error)] space-y-1">
                      {syncStats.bundles.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StripeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0v2.43l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
