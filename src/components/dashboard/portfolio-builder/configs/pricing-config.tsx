"use client";

import { useState, useId } from "react";

interface PricingPackage {
  id: string;
  name: string;
  description: string;
  price: string;
  priceNote?: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaLink: string;
}

interface PricingConfigProps {
  config: Record<string, unknown>;
  updateConfig: (key: string, value: unknown) => void;
}

const generateId = () => `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export function PricingConfig({ config, updateConfig }: PricingConfigProps) {
  const id = useId();
  const [packages, setPackages] = useState<PricingPackage[]>(
    (config.packages as PricingPackage[]) || []
  );

  const updatePackages = (newPackages: PricingPackage[]) => {
    setPackages(newPackages);
    updateConfig("packages", newPackages);
  };

  const addPackage = () => {
    const newPackage: PricingPackage = {
      id: generateId(),
      name: "New Package",
      description: "Package description",
      price: "$0",
      features: ["Feature 1", "Feature 2"],
      isPopular: false,
      ctaText: "Book Now",
      ctaLink: "#contact",
    };
    updatePackages([...packages, newPackage]);
  };

  const updatePackage = (packageId: string, updates: Partial<PricingPackage>) => {
    updatePackages(
      packages.map((pkg) =>
        pkg.id === packageId ? { ...pkg, ...updates } : pkg
      )
    );
  };

  const removePackage = (packageId: string) => {
    updatePackages(packages.filter((pkg) => pkg.id !== packageId));
  };

  const addFeature = (packageId: string) => {
    updatePackages(
      packages.map((pkg) =>
        pkg.id === packageId
          ? { ...pkg, features: [...pkg.features, "New feature"] }
          : pkg
      )
    );
  };

  const updateFeature = (packageId: string, featureIndex: number, value: string) => {
    updatePackages(
      packages.map((pkg) =>
        pkg.id === packageId
          ? {
              ...pkg,
              features: pkg.features.map((f, i) => (i === featureIndex ? value : f)),
            }
          : pkg
      )
    );
  };

  const removeFeature = (packageId: string, featureIndex: number) => {
    updatePackages(
      packages.map((pkg) =>
        pkg.id === packageId
          ? { ...pkg, features: pkg.features.filter((_, i) => i !== featureIndex) }
          : pkg
      )
    );
  };

  const movePackage = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === packages.length - 1)
    ) {
      return;
    }
    const newIndex = direction === "up" ? index - 1 : index + 1;
    const newPackages = [...packages];
    [newPackages[index], newPackages[newIndex]] = [newPackages[newIndex], newPackages[index]];
    updatePackages(newPackages);
  };

  return (
    <div className="space-y-6">
      {/* Section Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Section Settings</h4>

        <div>
          <label
            htmlFor={`${id}-title`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Section Title
          </label>
          <input
            id={`${id}-title`}
            type="text"
            value={(config.title as string) || "Pricing & Packages"}
            onChange={(e) => updateConfig("title", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          />
        </div>

        <div>
          <label
            htmlFor={`${id}-subtitle`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Section Subtitle
          </label>
          <input
            id={`${id}-subtitle`}
            type="text"
            value={(config.subtitle as string) || "Choose the perfect package for your needs"}
            onChange={(e) => updateConfig("subtitle", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          />
        </div>

        <div>
          <label
            htmlFor={`${id}-layout`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Layout Style
          </label>
          <select
            id={`${id}-layout`}
            value={(config.layout as string) || "cards"}
            onChange={(e) => updateConfig("layout", e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-foreground"
          >
            <option value="cards">Cards (Side by Side)</option>
            <option value="table">Comparison Table</option>
            <option value="stacked">Stacked Cards</option>
          </select>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={(config.showStartingAt as boolean) ?? false}
            onChange={(e) => updateConfig("showStartingAt", e.target.checked)}
            className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
          />
          <span className="text-sm text-foreground">Show &quot;Starting at&quot; before prices</span>
        </label>
      </div>

      {/* Packages */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h4 className="text-sm font-semibold text-foreground">Packages</h4>
          <button
            type="button"
            onClick={addPackage}
            className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--primary)]/90"
          >
            + Add Package
          </button>
        </div>

        <div className="space-y-4">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`rounded-lg border p-4 ${
                pkg.isPopular
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--card-border)] bg-[var(--card)]"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => movePackage(index, "up")}
                    disabled={index === 0}
                    className="text-foreground-muted hover:text-foreground disabled:opacity-30"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => movePackage(index, "down")}
                    disabled={index === packages.length - 1}
                    className="text-foreground-muted hover:text-foreground disabled:opacity-30"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <span className="text-sm font-medium text-foreground">{pkg.name}</span>
                  {pkg.isPopular && (
                    <span className="rounded bg-[var(--primary)] px-2 py-0.5 text-[10px] font-medium text-white">
                      Popular
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removePackage(pkg.id)}
                  className="text-xs text-[var(--error)] hover:underline"
                >
                  Remove
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-foreground-muted">
                      Package Name
                    </label>
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => updatePackage(pkg.id, { name: e.target.value })}
                      className="h-9 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-foreground-muted">Price</label>
                    <input
                      type="text"
                      value={pkg.price}
                      onChange={(e) => updatePackage(pkg.id, { price: e.target.value })}
                      placeholder="$500"
                      className="h-9 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-sm text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-foreground-muted">
                    Description
                  </label>
                  <textarea
                    value={pkg.description}
                    onChange={(e) => updatePackage(pkg.id, { description: e.target.value })}
                    className="h-16 w-full resize-none rounded-lg border border-[var(--card-border)] bg-background p-2 text-sm text-foreground"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-foreground-muted">
                    Price Note (optional)
                  </label>
                  <input
                    type="text"
                    value={pkg.priceNote || ""}
                    onChange={(e) => updatePackage(pkg.id, { priceNote: e.target.value })}
                    placeholder="per session, plus travel"
                    className="h-9 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-sm text-foreground"
                  />
                </div>

                {/* Features */}
                <div>
                  <div className="mb-1 flex items-start justify-between gap-4 flex-wrap">
                    <label className="text-xs text-foreground-muted">Features</label>
                    <button
                      type="button"
                      onClick={() => addFeature(pkg.id)}
                      className="text-xs text-[var(--primary)] hover:underline"
                    >
                      + Add Feature
                    </button>
                  </div>
                  <div className="space-y-1">
                    {pkg.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            updateFeature(pkg.id, featureIndex, e.target.value)
                          }
                          className="h-8 flex-1 rounded border border-[var(--card-border)] bg-background px-2 text-xs text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(pkg.id, featureIndex)}
                          className="text-xs text-[var(--error)] hover:underline"
                          aria-label="Remove feature"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-foreground-muted">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={pkg.ctaText}
                      onChange={(e) => updatePackage(pkg.id, { ctaText: e.target.value })}
                      className="h-9 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-sm text-foreground"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-foreground-muted">
                      Button Link
                    </label>
                    <input
                      type="text"
                      value={pkg.ctaLink}
                      onChange={(e) => updatePackage(pkg.id, { ctaLink: e.target.value })}
                      placeholder="#contact"
                      className="h-9 w-full rounded-lg border border-[var(--card-border)] bg-background px-3 text-sm text-foreground"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={pkg.isPopular || false}
                    onChange={(e) => updatePackage(pkg.id, { isPopular: e.target.checked })}
                    className="h-4 w-4 rounded border-[var(--card-border)] text-[var(--primary)]"
                  />
                  Mark as Popular/Recommended
                </label>
              </div>
            </div>
          ))}

          {packages.length === 0 && (
            <p className="py-4 text-center text-sm text-foreground-muted">
              No packages added yet. Click &quot;+ Add Package&quot; to create your first pricing package.
            </p>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-[var(--ai)]/30 bg-[var(--ai)]/5 p-3">
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-[var(--ai)]">Tip:</span> Having 3 packages
          works best - a basic, standard, and premium option helps clients choose
          based on their needs and budget.
        </p>
      </div>
    </div>
  );
}
