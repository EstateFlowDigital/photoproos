"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { createPropertyWebsite } from "@/lib/actions/property-websites";
import type { PropertyType, PropertyWebsiteTemplate } from "@prisma/client";

interface Project {
  id: string;
  name: string;
  status: string;
  coverImageUrl: string | null;
  client: {
    fullName: string | null;
    company: string | null;
  } | null;
  location: {
    formattedAddress: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
  } | null;
}

interface FieldErrors {
  projectId?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface CreatePropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (propertyWebsite: { id: string }) => void;
  projects: Project[];
  defaultProjectId?: string;
}

export function CreatePropertyModal({
  open,
  onOpenChange,
  onSuccess,
  projects,
  defaultProjectId,
}: CreatePropertyModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [price, setPrice] = useState("");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sqft, setSqft] = useState("");
  const [yearBuilt, setYearBuilt] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("single_family");
  const [template, setTemplate] = useState<PropertyWebsiteTemplate>("modern");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "projectId" && !value) {
      setFieldErrors((prev) => ({ ...prev, projectId: "Please select a gallery" }));
    } else if (field === "address" && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, address: "Street address is required" }));
    } else if (field === "city" && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, city: "City is required" }));
    } else if (field === "state" && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, state: "State is required" }));
    } else if (field === "zipCode" && !value.trim()) {
      setFieldErrors((prev) => ({ ...prev, zipCode: "ZIP is required" }));
    } else {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const getInputClassName = (fieldName: keyof FieldErrors) => {
    const hasError = touched[fieldName] && fieldErrors[fieldName];
    return cn(
      "w-full rounded-lg border bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1",
      hasError
        ? "border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]"
        : "border-[var(--card-border)] focus:border-[var(--primary)] focus:ring-[var(--primary)]"
    );
  };

  // Update form when project is selected
  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const project = projects.find((p) => p.id === id);
    if (project?.location) {
      setAddress(project.location.formattedAddress || "");
      setCity(project.location.city || "");
      setState(project.location.state || "");
      setZipCode(project.location.postalCode || "");
    }
  };

  // Set default project if provided
  useEffect(() => {
    if (defaultProjectId && open) {
      handleProjectChange(defaultProjectId);
    }
  }, [defaultProjectId, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    const errors: FieldErrors = {};
    if (!projectId) errors.projectId = "Please select a gallery";
    if (!address.trim()) errors.address = "Street address is required";
    if (!city.trim()) errors.city = "City is required";
    if (!state.trim()) errors.state = "State is required";
    if (!zipCode.trim()) errors.zipCode = "ZIP is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouched({ projectId: true, address: true, city: true, state: true, zipCode: true });
      return;
    }

    startTransition(async () => {
      try {
        const result = await createPropertyWebsite({
          projectId,
          address,
          city,
          state,
          zipCode,
          price: price ? parseFloat(price) : null,
          beds: beds ? parseInt(beds) : null,
          baths: baths ? parseFloat(baths) : null,
          sqft: sqft ? parseInt(sqft) : null,
          yearBuilt: yearBuilt ? parseInt(yearBuilt) : null,
          propertyType,
          template,
        });

        if (result.success) {
          // Reset form
          resetForm();
          onOpenChange(false);

          showToast("Property website created successfully", "success");

          // Call success callback
          onSuccess?.({ id: result.id! });

          // Navigate to the new property
          router.push(`/properties/${result.id}`);
        } else {
          setError(result.error || "Failed to create property website");
          showToast(result.error || "Failed to create property website", "error");
        }
      } catch {
        setError("An unexpected error occurred");
        showToast("An unexpected error occurred", "error");
      }
    });
  };

  const resetForm = () => {
    setProjectId(defaultProjectId || "");
    setAddress("");
    setCity("");
    setState("");
    setZipCode("");
    setPrice("");
    setBeds("");
    setBaths("");
    setSqft("");
    setYearBuilt("");
    setPropertyType("single_family");
    setTemplate("modern");
    setError(null);
    setFieldErrors({});
    setTouched({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Create Property Website</DialogTitle>
          <DialogDescription>
            Create a dedicated marketing page for a property listing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 px-4 py-3 text-sm text-[var(--error)]">
                {error}
              </div>
            )}

            {/* Gallery Selection */}
            {projects.length > 0 ? (
              <Select
                name="gallery"
                label="Gallery"
                required
                value={projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                onBlur={(e) => handleBlur("projectId", e.target.value)}
                placeholder="Select a gallery..."
                options={projects.map((project) => ({
                  value: project.id,
                  label: `${project.name}${project.client?.company ? ` (${project.client.company})` : ""}`,
                }))}
                error={touched.projectId ? fieldErrors.projectId : undefined}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Gallery <span className="text-[var(--error)]">*</span>
                </label>
                <div className="rounded-lg border border-dashed border-[var(--card-border)] p-4 text-center">
                  <p className="text-sm text-foreground-muted">No available galleries without property websites.</p>
                </div>
              </div>
            )}

            {/* Property Address */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Property Address</h4>
              <div>
                <label htmlFor="property-address" className="block text-sm text-foreground-muted mb-1.5">
                  Street Address <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  id="property-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onBlur={(e) => handleBlur("address", e.target.value)}
                  placeholder="123 Main Street"
                  className={getInputClassName("address")}
                />
                {touched.address && fieldErrors.address && (
                  <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label htmlFor="property-city" className="block text-sm text-foreground-muted mb-1.5">
                    City <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    id="property-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onBlur={(e) => handleBlur("city", e.target.value)}
                    placeholder="Los Angeles"
                    className={getInputClassName("city")}
                  />
                  {touched.city && fieldErrors.city && (
                    <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.city}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="property-state" className="block text-sm text-foreground-muted mb-1.5">
                    State <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    id="property-state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    onBlur={(e) => handleBlur("state", e.target.value)}
                    placeholder="CA"
                    maxLength={2}
                    className={getInputClassName("state")}
                  />
                  {touched.state && fieldErrors.state && (
                    <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.state}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="property-zip" className="block text-sm text-foreground-muted mb-1.5">
                    ZIP <span className="text-[var(--error)]">*</span>
                  </label>
                  <input
                    type="text"
                    id="property-zip"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    onBlur={(e) => handleBlur("zipCode", e.target.value)}
                    placeholder="90001"
                    className={getInputClassName("zipCode")}
                  />
                  {touched.zipCode && fieldErrors.zipCode && (
                    <p className="mt-1 text-xs text-[var(--error)]">{fieldErrors.zipCode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Property Details</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="property-price" className="block text-sm text-foreground-muted mb-1.5">
                    Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">$</span>
                    <input
                      type="number"
                      id="property-price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="500000"
                      className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-7 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="property-beds" className="block text-sm text-foreground-muted mb-1.5">
                    Beds
                  </label>
                  <input
                    type="number"
                    id="property-beds"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    placeholder="3"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label htmlFor="property-baths" className="block text-sm text-foreground-muted mb-1.5">
                    Baths
                  </label>
                  <input
                    type="number"
                    id="property-baths"
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                    placeholder="2"
                    step="0.5"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="property-sqft" className="block text-sm text-foreground-muted mb-1.5">
                    Sq Ft
                  </label>
                  <input
                    type="number"
                    id="property-sqft"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    placeholder="1500"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label htmlFor="property-year" className="block text-sm text-foreground-muted mb-1.5">
                    Year Built
                  </label>
                  <input
                    type="number"
                    id="property-year"
                    value={yearBuilt}
                    onChange={(e) => setYearBuilt(e.target.value)}
                    placeholder="2000"
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <Select
                  name="propertyType"
                  label="Type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  options={[
                    { value: "single_family", label: "Single Family" },
                    { value: "condo", label: "Condo" },
                    { value: "townhouse", label: "Townhouse" },
                    { value: "multi_family", label: "Multi Family" },
                    { value: "land", label: "Land" },
                    { value: "commercial", label: "Commercial" },
                  ]}
                />
              </div>
            </div>

            {/* Template Selection */}
            <Select
              name="template"
              label="Template"
              value={template}
              onChange={(e) => setTemplate(e.target.value as PropertyWebsiteTemplate)}
              options={[
                { value: "modern", label: "Modern" },
                { value: "classic", label: "Classic" },
                { value: "luxury", label: "Luxury" },
                { value: "minimal", label: "Minimal" },
                { value: "bold", label: "Bold" },
              ]}
            />
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !projectId}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Creating...
                </>
              ) : (
                "Create Property Website"
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
